/**
 * Permissions - Kiểm tra và ẩn/hiện chức năng theo quyền
 */

/**
 * Ẩn các element không có quyền
 */
async function applyPermissions() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Admin có tất cả quyền
    if (user.quyen === 'superadmin' || user.quyen === 'admin') {
        console.log('✅ Admin - Có tất cả quyền');
        return;
    }
    
    // Lấy quyền của nhân viên
    const permissions = await getUserPermissions();
    if (!permissions) {
        console.log('⚠️ Không lấy được quyền');
        return;
    }
    
    console.log('📋 Quyền hiện tại:', permissions);
    
    // Ẩn các nút không có quyền
    hideElementsByPermission(permissions);
}

/**
 * Ẩn elements dựa trên quyền
 */
function hideElementsByPermission(permissions) {
    // Ví dụ: Ẩn nút "Thêm mới" nếu không có quyền
    if (!permissions.tao_don_hang) {
        document.querySelectorAll('[data-permission="tao_don_hang"]').forEach(el => {
            el.style.display = 'none';
        });
    }
    
    if (!permissions.xoa_don_hang) {
        document.querySelectorAll('[data-permission="xoa_don_hang"]').forEach(el => {
            el.style.display = 'none';
        });
    }
    
    if (!permissions.sua_don_hang) {
        document.querySelectorAll('[data-permission="sua_don_hang"]').forEach(el => {
            el.style.display = 'none';
        });
    }
    
    // Thêm các quyền khác tương tự...
}

/**
 * Kiểm tra quyền trước khi thực hiện action
 */
async function checkPermissionBeforeAction(permissionKey, action) {
    const hasAccess = await hasPermission(permissionKey);
    
    if (!hasAccess) {
        alert('Bạn không có quyền thực hiện chức năng này!');
        return false;
    }
    
    // Thực hiện action
    if (typeof action === 'function') {
        action();
    }
    
    return true;
}

// Export
window.applyPermissions = applyPermissions;
window.checkPermissionBeforeAction = checkPermissionBeforeAction;

// Tự động apply permissions khi load trang
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyPermissions);
} else {
    applyPermissions();
}
