/**
 * Attendance Controller - Chấm công nhân viên (Có tự động phát hiện đi muộn/về sớm)
 */
const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Cấu hình multer để lưu ảnh chấm công
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/attendance';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'attendance-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Chỉ chấp nhận file ảnh (JPEG, JPG, PNG)'));
    }
});

// Lấy lịch sử chấm công theo nhân viên và khoảng thời gian
const getAttendanceRecords = async (req, res) => {
    try {
        const { ma_nhan_vien, start, end } = req.query;
        let query = `
            SELECT cc.*, nv.ten_nhan_vien, nv.ma_nv_code, nv.vai_tro
            FROM cham_cong cc
            JOIN nhan_vien nv ON cc.ma_nhan_vien = nv.ma_nhan_vien
            WHERE nv.is_deleted = 0
        `;
        const params = [];

        if (ma_nhan_vien) {
            query += ' AND cc.ma_nhan_vien = ?';
            params.push(ma_nhan_vien);
        }
        if (start && end) {
            query += ' AND cc.ngay BETWEEN ? AND ?';
            params.push(start, end);
        }

        query += ' ORDER BY cc.ngay DESC, cc.gio_vao DESC';
        const [records] = await db.query(query, params);
        res.json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Chấm công trực tiếp (API cho POS hoặc Mobile)
const checkInOut = async (req, res) => {
    try {
        const { ma_nhan_vien, type, ghi_chu } = req.body;
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().split(' ')[0]; // HH:MM:SS

        // Tìm ca làm việc được phân trong ngày hôm nay
        const [shiftAssignments] = await db.query(`
            SELECT pc.*, c.ten_ca, c.gio_bat_dau, c.gio_ket_thuc
            FROM phan_ca pc
            JOIN ca_lam_viec c ON pc.ma_ca = c.ma_ca
            WHERE pc.ma_nhan_vien = ? AND pc.ngay = ?
            ORDER BY c.gio_bat_dau ASC
        `, [ma_nhan_vien, date]);

        if (shiftAssignments.length === 0) {
            return res.status(400).json({ success: false, message: 'Bạn không có trong ca trực!' });
        }

        if (type === 'check-in') {
            const [existing] = await db.query(
                'SELECT * FROM cham_cong WHERE ma_nhan_vien = ? AND ngay = ? AND gio_vao IS NOT NULL AND gio_ra IS NULL',
                [ma_nhan_vien, date]
            );

            if (existing.length > 0) {
                return res.status(400).json({ success: false, message: 'Bạn đang trong ca làm việc (chưa check-out)!' });
            }

            let status = 'dung_gio';
            let assignedShiftId = null;

            // Lấy ca gần nhất với thời gian hiện tại hoặc ca đầu tiên trong ngày
            const shift = shiftAssignments[0]; 
            assignedShiftId = shift.ma_ca;
            
            if (time > shift.gio_bat_dau) {
                status = 'di_muon';
            }

            await db.query(
                'INSERT INTO cham_cong (ma_nhan_vien, ngay, gio_vao, trang_thai, ghi_chu) VALUES (?, ?, ?, ?, ?)',
                [ma_nhan_vien, date, time, status, ghi_chu]
            );
            
            res.json({ 
                success: true, 
                message: `Check-in thành công! (${status})`,
                time: time,
                status: status
            });

        } else if (type === 'check-out') {
            const [record] = await db.query(
                'SELECT * FROM cham_cong WHERE ma_nhan_vien = ? AND ngay = ? AND gio_ra IS NULL',
                [ma_nhan_vien, date]
            );

            if (record.length === 0) {
                return res.status(404).json({ success: false, message: 'Chưa có dữ liệu check-in cho lượt này!' });
            }

            // Tính số giờ làm
            const checkInTime = record[0].gio_vao;
            const h1 = parseInt(checkInTime.split(':')[0]);
            const m1 = parseInt(checkInTime.split(':')[1]);
            const h2 = now.getHours();
            const m2 = now.getMinutes();
            
            let hours = (h2 - h1) + (m2 - m1) / 60;
            if (hours < 0) hours = 0; // Đề phòng trường hợp qua đêm (cần logic phức tạp hơn)

            let status = record[0].trang_thai;
            const shift = shiftAssignments[0];
            if (time < shift.gio_ket_thuc) {
                status = 've_som';
            }

            await db.query(
                'UPDATE cham_cong SET gio_ra = ?, so_gio_lam = ?, trang_thai = ?, ghi_chu = ? WHERE ma_cham_cong = ?',
                [time, hours.toFixed(2), status, ghi_chu || record[0].ghi_chu, record[0].ma_cham_cong]
            );

            // Cập nhật trạng thái phân ca thành 'completed'
            if (shiftAssignments.length > 0) {
                await db.query('UPDATE phan_ca SET trang_thai = "completed" WHERE ma_nhan_vien = ? AND ngay = ?', [ma_nhan_vien, date]);
            }

            // Tính lương ngày tự động
            try {
                const dailySalaryController = require('./dailySalaryController');
                await dailySalaryController.calculateDailySalary(ma_nhan_vien, date);
            } catch (err) {
                console.error('Error calculating daily salary:', err);
            }

            res.json({ 
                success: true, 
                message: 'Check-out thành công!', 
                hours: parseFloat(hours.toFixed(2)),
                status: status
            });
        }
    } catch (error) {
        console.error('CheckInOut Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin cập nhật thủ công bản ghi chấm công
const updateAttendanceRecord = async (req, res) => {
    try {
        const { id } = req.params;
        let { gio_vao, gio_ra, so_gio_lam, trang_thai, ghi_chu } = req.body;
        
        // Đảm bảo định dạng HH:MM:SS cho MySQL TIME column
        gio_vao = formatTimeToFull(gio_vao);
        gio_ra = formatTimeToFull(gio_ra);

        // Lấy thông tin nhân viên và ngày trước khi cập nhật để tính lại lương
        const [[record]] = await db.query('SELECT ma_nhan_vien, ngay FROM cham_cong WHERE ma_cham_cong = ?', [id]);

        await db.query(`
            UPDATE cham_cong 
            SET gio_vao = ?, gio_ra = ?, so_gio_lam = ?, trang_thai = ?, ghi_chu = ?
            WHERE ma_cham_cong = ?
        `, [gio_vao, gio_ra, so_gio_lam, trang_thai, ghi_chu, id]);

        if (record) {
            try {
                const dailySalaryController = require('./dailySalaryController');
                await dailySalaryController.calculateDailySalary(record.ma_nhan_vien, record.ngay);
            } catch (err) {
                console.error('Error calculating daily salary:', err);
            }
        }

        res.json({ success: true, message: 'Cập nhật bản ghi chấm công thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin xóa bản ghi chấm công
const deleteAttendanceRecord = async (req, res) => {
    try {
        const { id } = req.params;

        // Lấy thông tin nhân viên và ngày trước khi xóa để tính lại lương
        const [[record]] = await db.query('SELECT ma_nhan_vien, ngay FROM cham_cong WHERE ma_cham_cong = ?', [id]);

        await db.query('DELETE FROM cham_cong WHERE ma_cham_cong = ?', [id]);

        if (record) {
            try {
                const dailySalaryController = require('./dailySalaryController');
                await dailySalaryController.calculateDailySalary(record.ma_nhan_vien, record.ngay);
            } catch (err) {
                console.error('Error calculating daily salary:', err);
            }
        }

        res.json({ success: true, message: 'Xóa bản ghi chấm công thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin tạo thủ công bản ghi chấm công
const createManualAttendance = async (req, res) => {
    try {
        let { ma_nhan_vien, ngay, gio_vao, gio_ra, so_gio_lam, trang_thai, ghi_chu } = req.body;
        
        // Đảm bảo định dạng HH:MM:SS cho MySQL TIME column
        gio_vao = formatTimeToFull(gio_vao);
        gio_ra = formatTimeToFull(gio_ra);

        const [result] = await db.query(
            'INSERT INTO cham_cong (ma_nhan_vien, ngay, gio_vao, gio_ra, so_gio_lam, trang_thai, ghi_chu) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [ma_nhan_vien, ngay, gio_vao, gio_ra, so_gio_lam, trang_thai, ghi_chu]
        );

        // Tính lương ngày tự động
        try {
            const dailySalaryController = require('./dailySalaryController');
            await dailySalaryController.calculateDailySalary(ma_nhan_vien, ngay);
        } catch (err) {
            console.error('Error calculating daily salary:', err);
        }
        
        res.json({ 
            success: true, 
            message: 'Thêm bản ghi chấm công thủ công thành công!',
            data: { ma_cham_cong: result.insertId }
        });
    } catch (error) {
        console.error('CreateManualAttendance Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper function to save a Base64 image
const saveBase64Image = (base64Str, prefix = 'attendance') => {
    if (!base64Str) return null;
    try {
        const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) return null;
        
        const extension = matches[1].split('/')[1] || 'jpg';
        const buffer = Buffer.from(matches[2], 'base64');
        
        const uploadDir = 'uploads/attendance';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `${prefix}-${uniqueSuffix}.${extension}`;
        const filePath = path.join(uploadDir, filename);
        
        fs.writeFileSync(filePath, buffer);
        return `uploads/attendance/${filename}`;
    } catch (error) {
        console.error('Save Base64 Image Error:', error);
        return null;
    }
};

// Check-in tự động (cho trang chấm công công cộng)
const autoCheckIn = async (req, res) => {
    try {
        const { ma_nv_code, location, photo } = req.body;
        
        if (!ma_nv_code) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập mã nhân viên!' });
        }

        // Tìm nhân viên theo mã
        const [staff] = await db.query(
            'SELECT * FROM nhan_vien WHERE ma_nv_code = ? AND trang_thai = 1 AND is_deleted = 0',
            [ma_nv_code]
        );

        if (staff.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên hoặc tài khoản đã bị khóa!' });
        }

        const ma_nhan_vien = staff[0].ma_nhan_vien;
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().split(' ')[0];

        // Kiểm tra đã check-in chưa
        const [existing] = await db.query(
            'SELECT * FROM cham_cong WHERE ma_nhan_vien = ? AND ngay = ? AND gio_ra IS NULL',
            [ma_nhan_vien, date]
        );

        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Bạn đã vào ca lúc ' + existing[0].gio_vao + '. Vui lòng check-out trước khi check-in lại!' 
            });
        }

        // Tìm ca làm việc
        const [shiftAssignments] = await db.query(`
            SELECT pc.*, c.ten_ca, c.gio_bat_dau, c.gio_ket_thuc
            FROM phan_ca pc
            JOIN ca_lam_viec c ON pc.ma_ca = c.ma_ca
            WHERE pc.ma_nhan_vien = ? AND pc.ngay = ?
            ORDER BY c.gio_bat_dau ASC
        `, [ma_nhan_vien, date]);

        if (shiftAssignments.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Bạn không có trong ca trực!' 
            });
        }

        let trang_thai = 'Đúng giờ';
        let ghi_chu = '';

        const shift = shiftAssignments[0];
        const shiftStart = shift.gio_bat_dau;
        
        if (time > shiftStart) {
            trang_thai = 'Đi muộn';
            const minutesLate = calculateMinutesDiff(shiftStart, time);
            ghi_chu = `Đi muộn ${minutesLate} phút`;
        }

        // Lưu vị trí GPS nếu có
        if (location) {
            ghi_chu += ` | GPS: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
        }

        // Lưu ảnh chụp chấm công
        let imagePath = null;
        if (photo) {
            imagePath = saveBase64Image(photo, 'attendance');
        }

        const lat = location ? location.lat : null;
        const lng = location ? location.lng : null;

        // Insert bản ghi chấm công
        const [result] = await db.query(
            'INSERT INTO cham_cong (ma_nhan_vien, ngay, gio_vao, trang_thai, ghi_chu, anh_cham_cong, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [ma_nhan_vien, date, time, trang_thai, ghi_chu, imagePath, lat, lng]
        );

        res.json({
            success: true,
            message: 'Vào ca thành công!',
            data: {
                ma_cham_cong: result.insertId,
                ten_nhan_vien: staff[0].ten_nhan_vien,
                gio_vao: time,
                trang_thai: trang_thai,
                ghi_chu: ghi_chu,
                anh_cham_cong: imagePath
            }
        });

    } catch (error) {
        console.error('Auto Check-in Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Check-out tự động (cho trang chấm công công cộng)
const autoCheckOut = async (req, res) => {
    try {
        const { ma_nv_code, location, photo } = req.body;
        
        if (!ma_nv_code) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập mã nhân viên!' });
        }

        // Tìm nhân viên theo mã
        const [staff] = await db.query(
            'SELECT * FROM nhan_vien WHERE ma_nv_code = ? AND trang_thai = 1 AND is_deleted = 0',
            [ma_nv_code]
        );

        if (staff.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên hoặc tài khoản đã bị khóa!' });
        }

        const ma_nhan_vien = staff[0].ma_nhan_vien;
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().split(' ')[0];

        // Tìm bản ghi check-in chưa check-out
        const [record] = await db.query(
            'SELECT * FROM cham_cong WHERE ma_nhan_vien = ? AND ngay = ? AND gio_ra IS NULL ORDER BY gio_vao DESC LIMIT 1',
            [ma_nhan_vien, date]
        );

        if (record.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Chưa có dữ liệu vào ca hôm nay! Vui lòng check-in trước.' 
            });
        }

        // Tính số giờ làm
        const checkInTime = record[0].gio_vao;
        const hours = calculateHoursDiff(checkInTime, time);

        // Tìm ca làm việc
        const [shiftAssignments] = await db.query(`
            SELECT pc.*, c.ten_ca, c.gio_bat_dau, c.gio_ket_thuc
            FROM phan_ca pc
            JOIN ca_lam_viec c ON pc.ma_ca = c.ma_ca
            WHERE pc.ma_nhan_vien = ? AND pc.ngay = ?
            ORDER BY c.gio_bat_dau ASC
        `, [ma_nhan_vien, date]);

        if (shiftAssignments.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Bạn không có trong ca trực!' 
            });
        }

        let trang_thai = record[0].trang_thai; // Giữ trạng thái check-in
        let ghi_chu = record[0].ghi_chu || '';

        const shift = shiftAssignments[0];
        const shiftEnd = shift.gio_ket_thuc;
        
        if (time < shiftEnd) {
            trang_thai = 'Về sớm';
            const minutesEarly = calculateMinutesDiff(time, shiftEnd);
            ghi_chu += ` | Về sớm ${minutesEarly} phút`;
        }

        // Lưu vị trí GPS nếu có
        if (location) {
            ghi_chu += ` | GPS Out: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
        }

        // Lưu ảnh chụp checkout
        let imagePath = null;
        if (photo) {
            imagePath = saveBase64Image(photo, 'checkout');
        }

        const lat = location ? location.lat : null;
        const lng = location ? location.lng : null;

        // Update bản ghi chấm công
        await db.query(
            'UPDATE cham_cong SET gio_ra = ?, so_gio_lam = ?, trang_thai = ?, ghi_chu = ?, anh_checkout = ?, latitude_out = ?, longitude_out = ? WHERE ma_cham_cong = ?',
            [time, hours, trang_thai, ghi_chu, imagePath, lat, lng, record[0].ma_cham_cong]
        );

        // Cập nhật trạng thái phân ca
        if (shiftAssignments.length > 0) {
            await db.query(
                'UPDATE phan_ca SET trang_thai = "completed" WHERE ma_nhan_vien = ? AND ngay = ?',
                [ma_nhan_vien, date]
            );
        }

        // Tính lương ngày tự động
        try {
            const dailySalaryController = require('./dailySalaryController');
            await dailySalaryController.calculateDailySalary(ma_nhan_vien, date);
        } catch (err) {
            console.error('Error calculating daily salary:', err);
        }

        res.json({
            success: true,
            message: 'Tan ca thành công!',
            data: {
                ma_cham_cong: record[0].ma_cham_cong,
                ten_nhan_vien: staff[0].ten_nhan_vien,
                gio_vao: checkInTime,
                gio_ra: time,
                so_gio_lam: hours,
                trang_thai: trang_thai,
                ghi_chu: ghi_chu,
                anh_checkout: imagePath
            }
        });

    } catch (error) {
        console.error('Auto Check-out Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy lịch sử chấm công hôm nay của nhân viên
const getTodayAttendance = async (req, res) => {
    try {
        const { ma_nv_code } = req.params;
        
        // Tìm nhân viên theo mã
        const [staff] = await db.query(
            'SELECT ma_nhan_vien, ten_nhan_vien, vai_tro, anh_dai_dien FROM nhan_vien WHERE ma_nv_code = ? AND is_deleted = 0',
            [ma_nv_code]
        );

        if (staff.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên!' });
        }

        const today = new Date().toISOString().split('T')[0];
        const [records] = await db.query(`
            SELECT cc.*, nv.ten_nhan_vien, nv.ma_nv_code
            FROM cham_cong cc
            JOIN nhan_vien nv ON cc.ma_nhan_vien = nv.ma_nhan_vien
            WHERE cc.ma_nhan_vien = ? AND cc.ngay = ?
            ORDER BY cc.gio_vao DESC
        `, [staff[0].ma_nhan_vien, today]);

        res.json({ success: true, staff: staff[0], data: records });

    } catch (error) {
        console.error('Get Today Attendance Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper functions
function calculateMinutesDiff(time1, time2) {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    return Math.abs((h2 * 60 + m2) - (h1 * 60 + m1));
}

function calculateHoursDiff(time1, time2) {
    const [h1, m1, s1] = time1.split(':').map(Number);
    const [h2, m2, s2] = time2.split(':').map(Number);
    const totalMinutes1 = h1 * 60 + m1;
    const totalMinutes2 = h2 * 60 + m2;
    const diffMinutes = totalMinutes2 - totalMinutes1;
    return (diffMinutes / 60).toFixed(2);
}

// Chấm công với ảnh (Check In / Check Out)
const checkInWithPhoto = async (req, res) => {
    try {
        const { ma_nhan_vien, loai, latitude, longitude, accuracy } = req.body;
        const imagePath = req.file ? req.file.path : null;

        if (!ma_nhan_vien || !loai) {
            if (imagePath && fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc!' });
        }

        if (!imagePath) {
            return res.status(400).json({ success: false, message: 'Vui lòng chụp ảnh!' });
        }

        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().split(' ')[0];

        // Tìm ca làm việc trước để kiểm tra phân ca
        const [shiftAssignments] = await db.query(`
            SELECT pc.*, c.ten_ca, c.gio_bat_dau, c.gio_ket_thuc
            FROM phan_ca pc
            JOIN ca_lam_viec c ON pc.ma_ca = c.ma_ca
            WHERE pc.ma_nhan_vien = ? AND pc.ngay = ?
            ORDER BY c.gio_bat_dau ASC
        `, [ma_nhan_vien, date]);

        if (shiftAssignments.length === 0) {
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            return res.status(400).json({ 
                success: false, 
                message: 'Bạn không có trong ca trực!' 
            });
        }

        // Lưu thông tin GPS
        let ghi_chu = '';
        if (latitude && longitude) {
            ghi_chu = `GPS: ${latitude}, ${longitude} (±${accuracy}m)`;
        }

        if (loai === 'checkin') {
            // Kiểm tra đã check-in chưa
            const [existing] = await db.query(
                'SELECT * FROM cham_cong WHERE ma_nhan_vien = ? AND ngay = ? AND gio_ra IS NULL',
                [ma_nhan_vien, date]
            );

            if (existing.length > 0) {
                // Xóa ảnh vừa upload
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
                return res.status(400).json({ 
                    success: false, 
                    message: 'Bạn đã check-in lúc ' + existing[0].gio_vao + '. Vui lòng check-out trước!' 
                });
            }

            let trang_thai = 'dung_gio';
            const shift = shiftAssignments[0];
            if (time > shift.gio_bat_dau) {
                trang_thai = 'di_muon';
                const minutesLate = calculateMinutesDiff(shift.gio_bat_dau, time);
                ghi_chu += ` | Đi muộn ${minutesLate} phút`;
            }

            // Insert bản ghi chấm công
            await db.query(
                'INSERT INTO cham_cong (ma_nhan_vien, ngay, gio_vao, trang_thai, ghi_chu, anh_cham_cong, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [ma_nhan_vien, date, time, trang_thai, ghi_chu, imagePath, latitude, longitude]
            );

            res.json({
                success: true,
                message: 'Check-in thành công!',
                data: {
                    gio_vao: time,
                    trang_thai: trang_thai,
                    anh_cham_cong: imagePath
                }
            });

        } else if (loai === 'checkout') {
            // Tìm bản ghi check-in chưa check-out
            const [record] = await db.query(
                'SELECT * FROM cham_cong WHERE ma_nhan_vien = ? AND ngay = ? AND gio_ra IS NULL ORDER BY gio_vao DESC LIMIT 1',
                [ma_nhan_vien, date]
            );

            if (record.length === 0) {
                // Xóa ảnh vừa upload
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
                return res.status(404).json({ 
                    success: false, 
                    message: 'Chưa có check-in hôm nay! Vui lòng check-in trước.' 
                });
            }

            // Tính số giờ làm
            const checkInTime = record[0].gio_vao;
            const hours = calculateHoursDiff(checkInTime, time);

            let trang_thai = record[0].trang_thai;
            let existingNote = record[0].ghi_chu || '';
            
            const shift = shiftAssignments[0];
            if (time < shift.gio_ket_thuc) {
                trang_thai = 've_som';
                const minutesEarly = calculateMinutesDiff(time, shift.gio_ket_thuc);
                ghi_chu = existingNote + ` | Về sớm ${minutesEarly} phút | ` + ghi_chu;
            } else {
                ghi_chu = existingNote + ' | ' + ghi_chu;
            }

            // Update bản ghi chấm công
            await db.query(
                'UPDATE cham_cong SET gio_ra = ?, so_gio_lam = ?, trang_thai = ?, ghi_chu = ?, anh_checkout = ?, latitude_out = ?, longitude_out = ? WHERE ma_cham_cong = ?',
                [time, hours, trang_thai, ghi_chu, imagePath, latitude, longitude, record[0].ma_cham_cong]
            );

            // Cập nhật trạng thái phân ca
            await db.query(
                'UPDATE phan_ca SET trang_thai = "completed" WHERE ma_nhan_vien = ? AND ngay = ?',
                [ma_nhan_vien, date]
            );

            // Tính lương ngày tự động
            try {
                const dailySalaryController = require('./dailySalaryController');
                await dailySalaryController.calculateDailySalary(ma_nhan_vien, date);
            } catch (err) {
                console.error('Error calculating daily salary:', err);
            }

            res.json({
                success: true,
                message: 'Check-out thành công!',
                data: {
                    gio_vao: checkInTime,
                    gio_ra: time,
                    so_gio_lam: hours,
                    trang_thai: trang_thai,
                    anh_checkout: imagePath
                }
            });
        } else {
            // Xóa ảnh vừa upload
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            return res.status(400).json({ success: false, message: 'Loại chấm công không hợp lệ!' });
        }

    } catch (error) {
        console.error('Check-in with photo error:', error);
        // Xóa ảnh nếu có lỗi
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

const faceCheckIn = async (req, res) => {
    try {
        const { ma_nv_code, latitude, longitude, accuracy } = req.body;
        const imagePath = req.file ? req.file.path : null;

        if (!imagePath) {
            return res.status(400).json({ success: false, message: 'Vui lòng chụp ảnh khuôn mặt!' });
        }

        let target_ma_nv_code = ma_nv_code;

        // Gọi Python AI Service để nhận diện/xác minh khuôn mặt
        try {
            const aiResponse = await axios.post('http://localhost:5000/api/ml/face/verify', {
                ma_nv_code: target_ma_nv_code || null,
                image_path: imagePath
            });

            if (!aiResponse.data.success) {
                if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
                return res.status(400).json({
                    success: false,
                    message: aiResponse.data.message || 'Xác minh khuôn mặt thất bại!'
                });
            }

            // Gán mã nhân viên từ AI trả về
            target_ma_nv_code = aiResponse.data.ma_nv_code;
        } catch (error) {
            console.error('Call AI service error:', error.message);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            return res.status(500).json({
                success: false,
                message: 'Lỗi kết nối đến dịch vụ AI nhận diện khuôn mặt!'
            });
        }

        if (!target_ma_nv_code) {
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            return res.status(400).json({ success: false, message: 'Không thể nhận dạng được nhân viên từ khuôn mặt này!' });
        }

        // Tìm nhân viên
        const [staff] = await db.query(
            'SELECT * FROM nhan_vien WHERE ma_nv_code = ? AND trang_thai = 1 AND is_deleted = 0',
            [target_ma_nv_code]
        );

        if (staff.length === 0) {
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên hoặc tài khoản đã bị khóa!' });
        }

        const ma_nhan_vien = staff[0].ma_nhan_vien;
        const ten_nhan_vien = staff[0].ten_nhan_vien;

        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().split(' ')[0];

        // Tìm ca làm việc trước để kiểm tra phân ca
        const [shiftAssignments] = await db.query(`
            SELECT pc.*, c.ten_ca, c.gio_bat_dau, c.gio_ket_thuc
            FROM phan_ca pc
            JOIN ca_lam_viec c ON pc.ma_ca = c.ma_ca
            WHERE pc.ma_nhan_vien = ? AND pc.ngay = ?
            ORDER BY c.gio_bat_dau ASC
        `, [ma_nhan_vien, date]);

        if (shiftAssignments.length === 0) {
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            return res.status(400).json({ 
                success: false, 
                message: 'Bạn không có trong ca trực!' 
            });
        }

        // Kiểm tra đã check-in chưa
        const [existing] = await db.query(
            'SELECT * FROM cham_cong WHERE ma_nhan_vien = ? AND ngay = ? AND gio_ra IS NULL',
            [ma_nhan_vien, date]
        );

        if (existing.length > 0) {
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            return res.status(400).json({ 
                success: false, 
                message: `Nhân viên ${ten_nhan_vien} đã check-in lúc ${existing[0].gio_vao}!` 
            });
        }

        // Vị trí GPS
        let ghi_chu = 'Chấm công khuôn mặt (QR Code)';
        if (latitude && longitude) {
            ghi_chu += ` | GPS: ${latitude}, ${longitude} (±${accuracy || 0}m)`;
        }

        let trang_thai = 'dung_gio';
        const shift = shiftAssignments[0];
        if (time > shift.gio_bat_dau) {
            trang_thai = 'di_muon';
            const minutesLate = calculateMinutesDiff(shift.gio_bat_dau, time);
            ghi_chu += ` | Đi muộn ${minutesLate} phút`;
        }

        // Insert bản ghi chấm công
        await db.query(
            'INSERT INTO cham_cong (ma_nhan_vien, ngay, gio_vao, trang_thai, ghi_chu, anh_cham_cong, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [ma_nhan_vien, date, time, trang_thai, ghi_chu.trim(), imagePath, latitude || null, longitude || null]
        );

        res.json({
            success: true,
            message: `Check-in khuôn mặt thành công cho ${ten_nhan_vien}!`,
            data: {
                ma_nv_code: target_ma_nv_code,
                ten_nhan_vien,
                gio_vao: time,
                trang_thai,
                ghi_chu
            }
        });

    } catch (error) {
        console.error('Face Check-in Error:', error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: error.message });
    }
};

const faceCheckOut = async (req, res) => {
    try {
        const { ma_nv_code, latitude, longitude, accuracy } = req.body;
        const imagePath = req.file ? req.file.path : null;

        if (!imagePath) {
            return res.status(400).json({ success: false, message: 'Vui lòng chụp ảnh khuôn mặt!' });
        }

        let target_ma_nv_code = ma_nv_code;

        // Gọi Python AI Service để nhận diện/xác minh khuôn mặt
        try {
            const aiResponse = await axios.post('http://localhost:5000/api/ml/face/verify', {
                ma_nv_code: target_ma_nv_code || null,
                image_path: imagePath
            });

            if (!aiResponse.data.success) {
                if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
                return res.status(400).json({
                    success: false,
                    message: aiResponse.data.message || 'Xác minh khuôn mặt thất bại!'
                });
            }

            // Gán mã nhân viên từ AI trả về
            target_ma_nv_code = aiResponse.data.ma_nv_code;
        } catch (error) {
            console.error('Call AI service error:', error.message);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            return res.status(500).json({
                success: false,
                message: 'Lỗi kết nối đến dịch vụ AI nhận diện khuôn mặt!'
            });
        }

        if (!target_ma_nv_code) {
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            return res.status(400).json({ success: false, message: 'Không thể nhận dạng được nhân viên từ khuôn mặt này!' });
        }

        // Tìm nhân viên
        const [staff] = await db.query(
            'SELECT * FROM nhan_vien WHERE ma_nv_code = ? AND trang_thai = 1 AND is_deleted = 0',
            [target_ma_nv_code]
        );

        if (staff.length === 0) {
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên hoặc tài khoản đã bị khóa!' });
        }

        const ma_nhan_vien = staff[0].ma_nhan_vien;
        const ten_nhan_vien = staff[0].ten_nhan_vien;

        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().split(' ')[0];

        // Tìm ca làm việc trước để kiểm tra phân ca
        const [shiftAssignments] = await db.query(`
            SELECT pc.*, c.ten_ca, c.gio_bat_dau, c.gio_ket_thuc
            FROM phan_ca pc
            JOIN ca_lam_viec c ON pc.ma_ca = c.ma_ca
            WHERE pc.ma_nhan_vien = ? AND pc.ngay = ?
            ORDER BY c.gio_bat_dau ASC
        `, [ma_nhan_vien, date]);

        if (shiftAssignments.length === 0) {
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            return res.status(400).json({ 
                success: false, 
                message: 'Bạn không có trong ca trực!' 
            });
        }

        // Tìm bản ghi check-in chưa check-out
        const [record] = await db.query(
            'SELECT * FROM cham_cong WHERE ma_nhan_vien = ? AND ngay = ? AND gio_ra IS NULL ORDER BY gio_vao DESC LIMIT 1',
            [ma_nhan_vien, date]
        );

        if (record.length === 0) {
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            return res.status(404).json({ 
                success: false, 
                message: `Không tìm thấy ca trực chưa check-out trong ngày hôm nay của ${ten_nhan_vien}!` 
            });
        }

        // Tính số giờ làm
        const checkInTime = record[0].gio_vao;
        const hours = calculateHoursDiff(checkInTime, time);

        // Vị trí GPS
        let ghi_chu = '';
        if (latitude && longitude) {
            ghi_chu = `GPS Out: ${latitude}, ${longitude} (±${accuracy || 0}m)`;
        }

        let trang_thai = record[0].trang_thai;
        let existingNote = record[0].ghi_chu || '';
        
        const shift = shiftAssignments[0];
        if (time < shift.gio_ket_thuc) {
            trang_thai = 've_som';
            const minutesEarly = calculateMinutesDiff(time, shift.gio_ket_thuc);
            ghi_chu = existingNote + ` | Về sớm ${minutesEarly} phút | ` + ghi_chu;
        } else {
            ghi_chu = existingNote + ' | ' + ghi_chu;
        }

        // Update bản ghi chấm công
        await db.query(
            'UPDATE cham_cong SET gio_ra = ?, so_gio_lam = ?, trang_thai = ?, ghi_chu = ?, anh_checkout = ?, latitude_out = ?, longitude_out = ? WHERE ma_cham_cong = ?',
            [time, hours, trang_thai, ghi_chu.trim(), imagePath, latitude || null, longitude || null, record[0].ma_cham_cong]
        );

        // Cập nhật trạng thái phân ca
        if (shiftAssignments.length > 0) {
            await db.query(
                'UPDATE phan_ca SET trang_thai = "completed" WHERE ma_nhan_vien = ? AND ngay = ?',
                [ma_nhan_vien, date]
            );
        }

        // Tính lương ngày tự động
        try {
            const dailySalaryController = require('./dailySalaryController');
            await dailySalaryController.calculateDailySalary(ma_nhan_vien, date);
        } catch (err) {
            console.error('Error calculating daily salary:', err);
        }

        res.json({
            success: true,
            message: `Check-out khuôn mặt thành công cho ${ten_nhan_vien}!`,
            data: {
                ma_nv_code: target_ma_nv_code,
                ten_nhan_vien,
                gio_vao: checkInTime,
                gio_ra: time,
                so_gio_lam: hours,
                trang_thai,
                ghi_chu
            }
        });

    } catch (error) {
        console.error('Face Check-out Error:', error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    upload,
    getAttendanceRecords,
    checkInOut,
    checkInWithPhoto,
    updateAttendanceRecord,
    deleteAttendanceRecord,
    createManualAttendance,
    autoCheckIn,
    autoCheckOut,
    getTodayAttendance,
    faceCheckIn,
    faceCheckOut
};

// Helper to format time strings HH:MM to HH:MM:00 for MySQL TIME type
function formatTimeToFull(timeStr) {
    if (!timeStr) return null;
    if (typeof timeStr !== 'string') return timeStr;
    // Handle HH:MM format from <input type="time">
    if (timeStr.length === 5 && timeStr.includes(':')) {
        return `${timeStr}:00`;
    }
    return timeStr;
}
