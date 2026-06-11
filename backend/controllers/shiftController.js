/**
 * Shift Controller - Quản lý ca làm việc và phân ca
 */
const db = require('../config/database');

// ==================== QUẢN LÝ CA LÀM VIỆC ====================

// Lấy danh sách ca làm việc
const getAllShifts = async (req, res) => {
    try {
        const [shifts] = await db.query('SELECT * FROM ca_lam_viec ORDER BY gio_bat_dau');
        res.json({ success: true, data: shifts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Thêm ca mới
const createShift = async (req, res) => {
    try {
        const { ten_ca, gio_bat_dau, gio_ket_thuc, he_so_luong } = req.body;
        const [result] = await db.query(
            'INSERT INTO ca_lam_viec (ten_ca, gio_bat_dau, gio_ket_thuc, he_so_luong) VALUES (?, ?, ?, ?)',
            [ten_ca, gio_bat_dau, gio_ket_thuc, he_so_luong || 1.0]
        );
        res.json({ success: true, message: 'Thêm ca thành công!', id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cập nhật ca
const updateShift = async (req, res) => {
    try {
        const { id } = req.params;
        const { ten_ca, gio_bat_dau, gio_ket_thuc, he_so_luong } = req.body;
        await db.query(
            'UPDATE ca_lam_viec SET ten_ca = ?, gio_bat_dau = ?, gio_ket_thuc = ?, he_so_luong = ? WHERE ma_ca = ?',
            [ten_ca, gio_bat_dau, gio_ket_thuc, he_so_luong, id]
        );
        res.json({ success: true, message: 'Cập nhật ca thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Xóa ca
const deleteShift = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM ca_lam_viec WHERE ma_ca = ?', [id]);
        res.json({ success: true, message: 'Xóa ca thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== PHÂN CA NHÂN VIÊN ====================

// Lấy lịch phân ca theo khoảng thời gian
const getSchedules = async (req, res) => {
    try {
        const { start, end } = req.query; // YYYY-MM-DD
        const [schedules] = await db.query(`
            SELECT pc.*, nv.ten_nhan_vien, nv.ma_nv_code, c.ten_ca, c.gio_bat_dau, c.gio_ket_thuc
            FROM phan_ca pc
            JOIN nhan_vien nv ON pc.ma_nhan_vien = nv.ma_nhan_vien
            JOIN ca_lam_viec c ON pc.ma_ca = c.ma_ca
            WHERE pc.ngay BETWEEN ? AND ?
            ORDER BY pc.ngay, c.gio_bat_dau
        `, [start, end]);
        res.json({ success: true, data: schedules });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Phân ca cho nhân viên (Có kiểm tra trùng lập/chồng chéo ca + ràng buộc ngày/giờ)
const createSchedule = async (req, res) => {
    try {
        const { ma_nhan_vien, ma_ca, ngay } = req.body;

        if (!ma_nhan_vien || !ma_ca || !ngay) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin nhân viên, ca hoặc ngày!' });
        }

        // 1. Lấy thông tin ca đang muốn gán
        const [targetShift] = await db.query('SELECT * FROM ca_lam_viec WHERE ma_ca = ?', [ma_ca]);
        if (targetShift.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy ca làm việc!' });
        }
        const { gio_bat_dau: newStart, gio_ket_thuc: newEnd } = targetShift[0];

        // 2. Ràng buộc ngày: không cho phân ca cho ngày trong quá khứ
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        if (ngay < todayStr) {
            return res.status(400).json({ success: false, message: 'Không thể phân ca cho ngày trong quá khứ!' });
        }

        // 3. Nếu phân cho hôm nay → giờ bắt đầu ca phải còn ở tương lai
        if (ngay === todayStr) {
            const [h, m] = String(newStart).split(':').map((v) => parseInt(v, 10) || 0);
            const shiftStart = new Date();
            shiftStart.setHours(h, m, 0, 0);
            if (shiftStart.getTime() <= now.getTime()) {
                return res.status(400).json({
                    success: false,
                    message: `Giờ bắt đầu ca (${newStart}) đã qua giờ hiện tại. Không thể phân ca này!`
                });
            }
        }

        // 4. Kiểm tra các ca đã phân trong ngày đó của nhân viên (bỏ qua các ca đã hủy)
        const [overlaps] = await db.query(`
            SELECT pc.*, c.ten_ca, c.gio_bat_dau, c.gio_ket_thuc
            FROM phan_ca pc
            JOIN ca_lam_viec c ON pc.ma_ca = c.ma_ca
            WHERE pc.ma_nhan_vien = ? AND pc.ngay = ? AND pc.trang_thai <> 'cancelled'
        `, [ma_nhan_vien, ngay]);

        for (const shift of overlaps) {
            // Trùng y nguyên ca (cùng ma_ca)
            if (String(shift.ma_ca) === String(ma_ca)) {
                return res.status(400).json({
                    success: false,
                    message: `Nhân viên đã được phân ca "${shift.ten_ca}" trong ngày này. Không thể phân trùng!`
                });
            }
            // Logic kiểm tra chồng chéo thời gian: (StartA < EndB) AND (EndA > StartB)
            if (newStart < shift.gio_ket_thuc && newEnd > shift.gio_bat_dau) {
                return res.status(400).json({
                    success: false,
                    message: `Lịch làm việc bị chồng chéo với ca "${shift.ten_ca}" (${shift.gio_bat_dau} - ${shift.gio_ket_thuc})`
                });
            }
        }

        await db.query(
            'INSERT INTO phan_ca (ma_nhan_vien, ma_ca, ngay, trang_thai) VALUES (?, ?, ?, "scheduled")',
            [ma_nhan_vien, ma_ca, ngay]
        );
        res.json({ success: true, message: 'Phân ca thành công!' });
    } catch (error) {
        console.error('Create Schedule Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cập nhật trạng thái phân ca
const updateScheduleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { trang_thai } = req.body; // scheduled, completed, cancelled
        await db.query('UPDATE phan_ca SET trang_thai = ? WHERE ma_phan_ca = ?', [trang_thai, id]);
        res.json({ success: true, message: 'Cập nhật trạng thái thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Xóa phân ca
const deleteSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM phan_ca WHERE ma_phan_ca = ?', [id]);
        res.json({ success: true, message: 'Xóa phân ca thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllShifts,
    createShift,
    updateShift,
    deleteShift,
    getSchedules,
    createSchedule,
    updateScheduleStatus,
    deleteSchedule
};
