/**
 * Staff Routes - API quản lý nhân viên
 */

const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const permissionController = require('../controllers/permissionController');

// Đăng nhập nhân viên
router.post('/login', staffController.staffLogin);

// Kiểm tra session nhân viên
router.get('/check-session', (req, res) => {
    // Không dùng session nữa, chỉ trả về message
    res.json({
        success: false,
        isAuthenticated: false,
        message: 'Sử dụng localStorage thay vì session'
    });
});

// Đăng xuất nhân viên
router.post('/logout', (req, res) => {
    // Không cần xóa session, chỉ trả về success
    res.json({
        success: true,
        message: 'Đăng xuất thành công (localStorage sẽ xóa ở client)'
    });
});

// Lấy danh sách nhân viên
router.get('/', staffController.getAllStaff);

// Thêm nhân viên mới
router.post('/', staffController.createStaff);

// Cập nhật nhân viên
router.put('/:id', staffController.updateStaff);

// Đổi mật khẩu
router.put('/:id/password', staffController.changePassword);

// Xóa nhân viên
router.delete('/:id', staffController.deleteStaff);

// ==================== QUẢN LÝ QUYỀN ====================

// Lấy danh sách tất cả quyền có thể có
router.get('/permissions/list', permissionController.getAllPermissionsList);

// Lấy quyền của nhân viên
router.get('/:id/permissions', permissionController.getStaffPermissions);

// Lấy thông tin nhân viên theo ID (không cần auth)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [staff] = await db.query(
            `SELECT ma_nhan_vien, ma_nv_code, ten_nhan_vien, tai_khoan, vai_tro, 
                    so_dien_thoai, anh_dai_dien, trang_thai
             FROM nhan_vien 
             WHERE ma_nhan_vien = ? AND is_deleted = 0`,
            [id]
        );
        
        if (staff.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên' });
        }
        
        res.json({ success: true, data: staff[0] });
    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Cập nhật quyền của nhân viên
router.put('/:id/permissions', permissionController.updateStaffPermissions);

// Sao chép quyền từ nhân viên khác
router.post('/permissions/copy', permissionController.copyPermissions);

// Đặt lại quyền mặc định
router.post('/:id/permissions/reset', permissionController.resetToDefaultPermissions);

module.exports = router;
