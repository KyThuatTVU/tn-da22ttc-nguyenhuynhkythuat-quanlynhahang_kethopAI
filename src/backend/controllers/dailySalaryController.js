/**
 * Daily Salary Controller - Tính lương tạm tính hàng ngày
 * Tự động cập nhật mỗi khi nhân viên check-out
 */
const db = require('../config/database');

/**
 * Tính lương cho một ngày cụ thể của một nhân viên
 * Được gọi tự động khi check-out
 */
const calculateDailySalary = async (ma_nhan_vien, ngay) => {
    try {
        // 1. Lấy thông tin lương của nhân viên
        const [[staff]] = await db.query(
            'SELECT luong_theo_gio, luong_co_ban FROM nhan_vien WHERE ma_nhan_vien = ?',
            [ma_nhan_vien]
        );

        if (!staff) {
            console.error('Không tìm thấy nhân viên:', ma_nhan_vien);
            return null;
        }

        // 2. Lấy tổng số giờ làm trong ngày
        const [[attendance]] = await db.query(`
            SELECT 
                SUM(so_gio_lam) as tong_gio,
                GROUP_CONCAT(trang_thai) as trang_thai_list,
                GROUP_CONCAT(ghi_chu SEPARATOR ' | ') as ghi_chu_list
            FROM cham_cong 
            WHERE ma_nhan_vien = ? AND ngay = ?
        `, [ma_nhan_vien, ngay]);

        const soGioLam = parseFloat(attendance.tong_gio || 0);
        const luongTheoGio = parseFloat(staff.luong_theo_gio || 0);
        const luongCoBan = parseFloat(staff.luong_co_ban || 0);

        // Xác định số ngày của tháng để chia lương cơ bản
        const dateObj = new Date(ngay);
        const y = dateObj.getFullYear();
        const m = dateObj.getMonth() + 1;
        const soNgayTrongThang = new Date(y, m, 0).getDate();

        let luongNgay = 0;
        if (luongTheoGio > 0 && luongCoBan > 0) {
            // Kết hợp cả hai: lương theo giờ + lương cơ bản chia theo ngày trong tháng
            luongNgay = (soGioLam * luongTheoGio) + (luongCoBan / soNgayTrongThang);
        } else if (luongCoBan > 0) {
            // Lương cứng cố định: lương cơ bản chia theo ngày trong tháng
            luongNgay = luongCoBan / soNgayTrongThang;
        } else {
            // Trả theo giờ: số giờ làm * lương theo giờ
            luongNgay = soGioLam * luongTheoGio;
        }

        // 3. Lưu hoặc cập nhật lương tạm tính
        await db.query(`
            INSERT INTO luong_tam_tinh 
            (ma_nhan_vien, ngay, so_gio_lam, luong_theo_gio, luong_ngay, trang_thai_cham_cong, ghi_chu)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                so_gio_lam = VALUES(so_gio_lam),
                luong_theo_gio = VALUES(luong_theo_gio),
                luong_ngay = VALUES(luong_ngay),
                trang_thai_cham_cong = VALUES(trang_thai_cham_cong),
                ghi_chu = VALUES(ghi_chu),
                updated_at = CURRENT_TIMESTAMP
        `, [
            ma_nhan_vien,
            ngay,
            soGioLam,
            luongTheoGio,
            luongNgay,
            attendance.trang_thai_list || 'dung_gio',
            attendance.ghi_chu_list || ''
        ]);

        // 4. Cập nhật lương ngày vào bảng chấm công
        await db.query(
            'UPDATE cham_cong SET luong_ngay = ? WHERE ma_nhan_vien = ? AND ngay = ?',
            [luongNgay, ma_nhan_vien, ngay]
        );

        return {
            ma_nhan_vien,
            ngay,
            so_gio_lam: soGioLam,
            luong_theo_gio: luongTheoGio,
            luong_ngay: luongNgay
        };

    } catch (error) {
        console.error('Error calculating daily salary:', error);
        return null;
    }
};

/**
 * API: Lấy lương tạm tính theo khoảng thời gian
 */
const getDailySalary = async (req, res) => {
    try {
        const { ma_nhan_vien, start, end } = req.query;
        
        let query = `
            SELECT 
                ltt.*,
                nv.ten_nhan_vien,
                nv.ma_nv_code,
                nv.vai_tro
            FROM luong_tam_tinh ltt
            JOIN nhan_vien nv ON ltt.ma_nhan_vien = nv.ma_nhan_vien
            WHERE nv.is_deleted = 0
        `;
        const params = [];

        if (ma_nhan_vien) {
            query += ' AND ltt.ma_nhan_vien = ?';
            params.push(ma_nhan_vien);
        }

        if (start && end) {
            query += ' AND ltt.ngay BETWEEN ? AND ?';
            params.push(start, end);
        }

        query += ' ORDER BY ltt.ngay DESC';

        const [records] = await db.query(query, params);

        // Tính tổng
        const tongGio = records.reduce((sum, r) => sum + parseFloat(r.so_gio_lam || 0), 0);
        const tongLuong = records.reduce((sum, r) => sum + parseFloat(r.luong_ngay || 0), 0);

        res.json({
            success: true,
            data: records,
            summary: {
                tong_gio_lam: tongGio.toFixed(2),
                tong_luong: tongLuong.toFixed(2),
                so_ngay_lam: records.length
            }
        });

    } catch (error) {
        console.error('Error getting daily salary:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * API: Lấy lương tạm tính của nhân viên hiện tại (cho staff)
 */
const getMyDailySalary = async (req, res) => {
    try {
        // Lấy ma_nhan_vien từ session staff
        const ma_nhan_vien = req.session.staff.ma_nhan_vien;
        const { start, end } = req.query;

        let query = `
            SELECT 
                ltt.*,
                nv.ten_nhan_vien,
                nv.ma_nv_code
            FROM luong_tam_tinh ltt
            JOIN nhan_vien nv ON ltt.ma_nhan_vien = nv.ma_nhan_vien
            WHERE ltt.ma_nhan_vien = ?
        `;
        const params = [ma_nhan_vien];

        if (start && end) {
            query += ' AND ltt.ngay BETWEEN ? AND ?';
            params.push(start, end);
        } else {
            // Mặc định lấy tháng hiện tại
            query += ' AND MONTH(ltt.ngay) = MONTH(CURDATE()) AND YEAR(ltt.ngay) = YEAR(CURDATE())';
        }

        query += ' ORDER BY ltt.ngay DESC';

        const [records] = await db.query(query, params);

        // Tính tổng
        const tongGio = records.reduce((sum, r) => sum + parseFloat(r.so_gio_lam || 0), 0);
        const tongLuong = records.reduce((sum, r) => sum + parseFloat(r.luong_ngay || 0), 0);

        // Lấy thông tin lương cơ bản
        const [[staff]] = await db.query(
            'SELECT luong_co_ban, luong_theo_gio FROM nhan_vien WHERE ma_nhan_vien = ?',
            [ma_nhan_vien]
        );

        // Tính lương cơ bản theo tỷ lệ ngày làm
        const now = new Date();
        const soNgayTrongThang = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const luongCoBan = parseFloat(staff.luong_co_ban || 0);
        const luongCoBanThucTe = (luongCoBan / soNgayTrongThang) * records.length;

        res.json({
            success: true,
            data: records,
            summary: {
                tong_gio_lam: tongGio.toFixed(2),
                luong_theo_gio: tongLuong.toFixed(2),
                luong_co_ban: luongCoBanThucTe.toFixed(2),
                tong_luong_du_kien: (tongLuong + luongCoBanThucTe).toFixed(2),
                so_ngay_lam: records.length,
                so_ngay_trong_thang: soNgayTrongThang
            }
        });

    } catch (error) {
        console.error('Error getting my daily salary:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Tính lại lương cho tất cả nhân viên trong một ngày
 * Dùng cho scheduled job hoặc admin chạy thủ công
 */
const recalculateDailySalary = async (req, res) => {
    try {
        const { ngay } = req.body;
        const targetDate = ngay || new Date().toISOString().split('T')[0];

        // Lấy danh sách nhân viên đã chấm công trong ngày
        const [attendances] = await db.query(`
            SELECT DISTINCT ma_nhan_vien 
            FROM cham_cong 
            WHERE ngay = ? AND gio_ra IS NOT NULL
        `, [targetDate]);

        let successCount = 0;
        let failCount = 0;

        for (const att of attendances) {
            const result = await calculateDailySalary(att.ma_nhan_vien, targetDate);
            if (result) {
                successCount++;
            } else {
                failCount++;
            }
        }

        res.json({
            success: true,
            message: `Tính lương ngày ${targetDate} hoàn tất`,
            data: {
                ngay: targetDate,
                thanh_cong: successCount,
                that_bai: failCount,
                tong: attendances.length
            }
        });

    } catch (error) {
        console.error('Error recalculating daily salary:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Tính lương tháng từ dữ liệu lương ngày
 */
const generateMonthlyFromDaily = async (req, res) => {
    try {
        const { thang, nam } = req.body;

        if (!thang || !nam) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin tháng/năm' });
        }

        // Lấy danh sách nhân viên còn hoạt động
        const [staff] = await db.query(`
            SELECT ma_nhan_vien, ten_nhan_vien, luong_theo_gio, luong_co_ban 
            FROM nhan_vien 
            WHERE is_deleted = 0 AND trang_thai = 1
        `);

        let createdCount = 0;
        let updatedCount = 0;

        for (const s of staff) {
            // Tính tổng từ bảng lương tạm tính
            const [[summary]] = await db.query(`
                SELECT 
                    SUM(so_gio_lam) as tong_gio,
                    SUM(luong_ngay) as tong_luong_gio,
                    COUNT(DISTINCT ngay) as tong_ngay
                FROM luong_tam_tinh
                WHERE ma_nhan_vien = ? 
                AND MONTH(ngay) = ? 
                AND YEAR(ngay) = ?
            `, [s.ma_nhan_vien, thang, nam]);

            const tongGio = parseFloat(summary.tong_gio || 0);
            const tongLuongGio = parseFloat(summary.tong_luong_gio || 0);
            const tongNgayLam = parseInt(summary.tong_ngay || 0);
            const luongTheoGio = parseFloat(s.luong_theo_gio || 0);

            // Tính lương cơ bản theo số ngày thực tế
            const soNgayTrongThang = new Date(nam, thang, 0).getDate();
            const luongCoBanGoc = parseFloat(s.luong_co_ban || 0);
            const daysToCalculate = Math.min(tongNgayLam, soNgayTrongThang);
            const luongCoBan = luongCoBanGoc > 0 ? (luongCoBanGoc / soNgayTrongThang) * daysToCalculate : 0;

            // Kiểm tra bản ghi hiện tại
            const [existing] = await db.query(
                'SELECT * FROM bang_luong WHERE ma_nhan_vien = ? AND thang = ? AND nam = ?',
                [s.ma_nhan_vien, thang, nam]
            );

            const thuong = existing.length > 0 ? existing[0].thuong : 0;
            const phat = existing.length > 0 ? existing[0].phat : 0;
            const tongLuong = (luongCoBan + (tongGio * luongTheoGio) + parseFloat(thuong) - parseFloat(phat)).toFixed(2);

            if (existing.length > 0) {
                await db.query(`
                    UPDATE bang_luong 
                    SET luong_co_ban = ?, tong_gio_lam = ?, luong_theo_gio = ?, tong_luong = ?
                    WHERE ma_luong = ?
                `, [luongCoBan, tongGio, luongTheoGio, tongLuong, existing[0].ma_luong]);
                updatedCount++;
            } else {
                await db.query(`
                    INSERT INTO bang_luong 
                    (ma_nhan_vien, thang, nam, luong_co_ban, tong_gio_lam, luong_theo_gio, thuong, phat, tong_luong, trang_thai)
                    VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, 'chua_thanh_toan')
                `, [s.ma_nhan_vien, thang, nam, luongCoBan, tongGio, luongTheoGio, tongLuong]);
                createdCount++;
            }
        }

        res.json({
            success: true,
            message: `Tính lương tháng ${thang}/${nam} hoàn tất: Thêm mới ${createdCount}, Cập nhật ${updatedCount}`
        });

    } catch (error) {
        console.error('Error generating monthly from daily:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    calculateDailySalary,
    getDailySalary,
    getMyDailySalary,
    recalculateDailySalary,
    generateMonthlyFromDaily
};
