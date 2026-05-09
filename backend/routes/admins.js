/**
 * Admins Routes - API quản lý tài khoản admin
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { requireAdminAuth, requireSuperAdmin } = require('../middleware/auth.middleware');

// Lấy danh sách admin
router.get('/', requireAdminAuth, async (req, res) => {
    try {
        const [admins] = await db.query(`
            SELECT ma_admin, tai_khoan, ten_hien_thi, email, quyen, anh_dai_dien, ngay_tao
            FROM admin
            ORDER BY ngay_tao DESC
        `);

        res.json({
            success: true,
            data: admins
        });
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Tạo admin mới (chỉ superadmin)
router.post('/', requireSuperAdmin, async (req, res) => {
    try {
        const { tai_khoan, mat_khau, ten_hien_thi, email, quyen } = req.body;

        // Validate
        if (!tai_khoan || !mat_khau) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập tài khoản và mật khẩu'
            });
        }

        if (mat_khau.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu phải có ít nhất 6 ký tự'
            });
        }

        // Kiểm tra tài khoản đã tồn tại
        const [existing] = await db.query(
            'SELECT ma_admin FROM admin WHERE tai_khoan = ?',
            [tai_khoan]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Tài khoản đã tồn tại'
            });
        }

        // Hash mật khẩu
        const mat_khau_hash = await bcrypt.hash(mat_khau, 10);

        // Tạo admin mới
        const [result] = await db.query(
            `INSERT INTO admin (tai_khoan, mat_khau_hash, ten_hien_thi, email, quyen)
             VALUES (?, ?, ?, ?, ?)`,
            [tai_khoan, mat_khau_hash, ten_hien_thi || null, email || null, quyen || 'admin']
        );

        res.status(201).json({
            success: true,
            message: 'Tạo tài khoản admin thành công',
            data: {
                ma_admin: result.insertId,
                tai_khoan
            }
        });
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Đổi mật khẩu admin
router.put('/:id/password', requireAdminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { mat_khau_moi } = req.body;

        // Kiểm tra quyền: chỉ được đổi mật khẩu của chính mình hoặc là superadmin
        if (req.session.admin.ma_admin != id && req.session.admin.quyen !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền đổi mật khẩu tài khoản này'
            });
        }

        if (!mat_khau_moi || mat_khau_moi.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu phải có ít nhất 6 ký tự'
            });
        }

        // Hash mật khẩu mới
        const mat_khau_hash = await bcrypt.hash(mat_khau_moi, 10);

        // Cập nhật mật khẩu
        const [result] = await db.query(
            'UPDATE admin SET mat_khau_hash = ? WHERE ma_admin = ?',
            [mat_khau_hash, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài khoản admin'
            });
        }

        res.json({
            success: true,
            message: 'Đổi mật khẩu thành công'
        });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Xóa admin (chỉ superadmin)
router.delete('/:id', requireSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Không cho phép xóa chính mình
        if (req.session.admin.ma_admin == id) {
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa tài khoản của chính mình'
            });
        }

        // Xóa admin
        const [result] = await db.query(
            'DELETE FROM admin WHERE ma_admin = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài khoản admin'
            });
        }

        res.json({
            success: true,
            message: 'Xóa tài khoản admin thành công'
        });
    } catch (error) {
        console.error('Error deleting admin:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

module.exports = router;
