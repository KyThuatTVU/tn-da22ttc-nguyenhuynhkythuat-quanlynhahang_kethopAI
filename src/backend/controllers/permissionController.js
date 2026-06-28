/**
 * Permission Controller - Quản lý phân quyền nhân viên
 */

const db = require('../config/database');

// Lấy quyền của nhân viên
const getStaffPermissions = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [permissions] = await db.query(
            `SELECT * FROM nhan_vien_quyen WHERE ma_nhan_vien = ?`,
            [id]
        );
        
        if (permissions.length === 0) {
            // Tạo quyền mặc định nếu chưa có
            const [staff] = await db.query('SELECT vai_tro FROM nhan_vien WHERE ma_nhan_vien = ?', [id]);
            if (staff.length === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên' });
            }
            
            await db.query('CALL create_default_permissions(?, ?)', [id, staff[0].vai_tro]);
            const [newPermissions] = await db.query('SELECT * FROM nhan_vien_quyen WHERE ma_nhan_vien = ?', [id]);
            return res.json({ success: true, data: newPermissions[0] });
        }
        
        res.json({ success: true, data: permissions[0] });
    } catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cập nhật quyền của nhân viên
const updateStaffPermissions = async (req, res) => {
    try {
        const { id } = req.params;
        const permissions = req.body;
        
        // Loại bỏ các field không cần thiết
        delete permissions.ma_quyen;
        delete permissions.ma_nhan_vien;
        delete permissions.ngay_tao;
        delete permissions.ngay_cap_nhat;
        
        // Tạo câu query động
        const fields = Object.keys(permissions);
        const values = Object.values(permissions);
        
        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: 'Không có quyền nào để cập nhật' });
        }
        
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        values.push(id);
        
        const [result] = await db.query(
            `UPDATE nhan_vien_quyen SET ${setClause} WHERE ma_nhan_vien = ?`,
            values
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy quyền của nhân viên' });
        }
        
        res.json({ success: true, message: 'Cập nhật quyền thành công!' });
    } catch (error) {
        console.error('Error updating permissions:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Sao chép quyền từ nhân viên khác
const copyPermissions = async (req, res) => {
    try {
        const { fromStaffId, toStaffId } = req.body;
        
        if (!fromStaffId || !toStaffId) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin nhân viên' });
        }
        
        // Lấy quyền của nhân viên nguồn
        const [sourcePermissions] = await db.query(
            'SELECT * FROM nhan_vien_quyen WHERE ma_nhan_vien = ?',
            [fromStaffId]
        );
        
        if (sourcePermissions.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy quyền của nhân viên nguồn' });
        }
        
        const perms = sourcePermissions[0];
        delete perms.ma_quyen;
        delete perms.ma_nhan_vien;
        delete perms.ngay_tao;
        delete perms.ngay_cap_nhat;
        
        // Cập nhật quyền cho nhân viên đích
        const fields = Object.keys(perms);
        const values = Object.values(perms);
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        values.push(toStaffId);
        
        await db.query(
            `UPDATE nhan_vien_quyen SET ${setClause} WHERE ma_nhan_vien = ?`,
            values
        );
        
        res.json({ success: true, message: 'Sao chép quyền thành công!' });
    } catch (error) {
        console.error('Error copying permissions:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Đặt lại quyền mặc định theo vai trò
const resetToDefaultPermissions = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Lấy vai trò của nhân viên
        const [staff] = await db.query('SELECT vai_tro FROM nhan_vien WHERE ma_nhan_vien = ?', [id]);
        if (staff.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên' });
        }
        
        // Xóa quyền cũ
        await db.query('DELETE FROM nhan_vien_quyen WHERE ma_nhan_vien = ?', [id]);
        
        // Tạo quyền mặc định mới
        await db.query('CALL create_default_permissions(?, ?)', [id, staff[0].vai_tro]);
        
        res.json({ success: true, message: 'Đặt lại quyền mặc định thành công!' });
    } catch (error) {
        console.error('Error resetting permissions:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy danh sách tất cả quyền có thể có (để hiển thị UI)
const getAllPermissionsList = (req, res) => {
    const permissionGroups = {
        'Quản lý Đơn hàng': [
            { key: 'xem_don_hang', label: 'Xem đơn hàng', icon: 'fa-eye' },
            { key: 'tao_don_hang', label: 'Tạo đơn hàng', icon: 'fa-plus' },
            { key: 'sua_don_hang', label: 'Sửa đơn hàng', icon: 'fa-edit' },
            { key: 'xoa_don_hang', label: 'Xóa đơn hàng', icon: 'fa-trash' },
            { key: 'huy_don_hang', label: 'Hủy đơn hàng', icon: 'fa-ban' }
        ],
        'Quản lý Bàn': [
            { key: 'xem_ban', label: 'Xem bàn', icon: 'fa-eye' },
            { key: 'dat_ban', label: 'Đặt bàn', icon: 'fa-calendar-plus' },
            { key: 'sua_ban', label: 'Sửa bàn', icon: 'fa-edit' },
            { key: 'xoa_ban', label: 'Xóa bàn', icon: 'fa-trash' }
        ],
        'Quản lý Menu': [
            { key: 'xem_menu', label: 'Xem menu', icon: 'fa-eye' },
            { key: 'them_menu', label: 'Thêm món', icon: 'fa-plus' },
            { key: 'sua_menu', label: 'Sửa món', icon: 'fa-edit' },
            { key: 'xoa_menu', label: 'Xóa món', icon: 'fa-trash' }
        ],
        'Quản lý Khách hàng': [
            { key: 'xem_khach_hang', label: 'Xem khách hàng', icon: 'fa-eye' },
            { key: 'them_khach_hang', label: 'Thêm khách hàng', icon: 'fa-user-plus' },
            { key: 'sua_khach_hang', label: 'Sửa khách hàng', icon: 'fa-user-edit' },
            { key: 'xoa_khach_hang', label: 'Xóa khách hàng', icon: 'fa-user-times' }
        ],
        'Quản lý Kho': [
            { key: 'xem_kho', label: 'Xem kho', icon: 'fa-eye' },
            { key: 'them_kho', label: 'Thêm nguyên liệu', icon: 'fa-plus' },
            { key: 'sua_kho', label: 'Sửa nguyên liệu', icon: 'fa-edit' },
            { key: 'xoa_kho', label: 'Xóa nguyên liệu', icon: 'fa-trash' },
            { key: 'nhap_kho', label: 'Nhập kho', icon: 'fa-download' },
            { key: 'xuat_kho', label: 'Xuất kho', icon: 'fa-upload' }
        ],
        'Quản lý Nhân viên': [
            { key: 'xem_nhan_vien', label: 'Xem nhân viên', icon: 'fa-eye' },
            { key: 'them_nhan_vien', label: 'Thêm nhân viên', icon: 'fa-user-plus' },
            { key: 'sua_nhan_vien', label: 'Sửa nhân viên', icon: 'fa-user-edit' },
            { key: 'xoa_nhan_vien', label: 'Xóa nhân viên', icon: 'fa-user-times' },
            { key: 'phan_quyen', label: 'Phân quyền', icon: 'fa-user-shield' }
        ],
        'Báo cáo & Thống kê': [
            { key: 'xem_bao_cao', label: 'Xem báo cáo', icon: 'fa-chart-line' },
            { key: 'xem_doanh_thu', label: 'Xem doanh thu', icon: 'fa-dollar-sign' },
            { key: 'xem_thong_ke', label: 'Xem thống kê', icon: 'fa-chart-bar' },
            { key: 'xuat_bao_cao', label: 'Xuất báo cáo', icon: 'fa-file-export' }
        ],
        'Chức năng Bếp': [
            { key: 'xem_phieu_bep', label: 'Xem phiếu bếp', icon: 'fa-receipt' },
            { key: 'cap_nhat_trang_thai_mon', label: 'Cập nhật trạng thái món', icon: 'fa-check-circle' },
            { key: 'xem_cong_thuc', label: 'Xem công thức', icon: 'fa-book' }
        ],
        'Thanh toán': [
            { key: 'thanh_toan', label: 'Thanh toán', icon: 'fa-cash-register' },
            { key: 'hoan_tien', label: 'Hoàn tiền', icon: 'fa-undo' },
            { key: 'ap_dung_giam_gia', label: 'Áp dụng giảm giá', icon: 'fa-percent' }
        ],
        'Bán hàng (POS)': [
            { key: 'xem_pos', label: 'Xem màn hình bán hàng', icon: 'fa-desktop' },
            { key: 'tao_don_pos', label: 'Tạo đơn bán hàng', icon: 'fa-shopping-cart' },
            { key: 'huy_don_pos', label: 'Hủy đơn bán hàng', icon: 'fa-times-circle' }
        ],
        'Cài đặt': [
            { key: 'xem_cai_dat', label: 'Xem cài đặt', icon: 'fa-cog' },
            { key: 'sua_cai_dat', label: 'Sửa cài đặt', icon: 'fa-wrench' }
        ]
    };
    
    res.json({ success: true, data: permissionGroups });
};

module.exports = {
    getStaffPermissions,
    updateStaffPermissions,
    copyPermissions,
    resetToDefaultPermissions,
    getAllPermissionsList
};
