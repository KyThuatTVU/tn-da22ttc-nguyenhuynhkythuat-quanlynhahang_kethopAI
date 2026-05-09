/**
 * Auth Check - Đơn giản hóa: Chỉ dùng localStorage
 */

const API_BASE = 'http://localhost:3000/api';

// Danh sách trang không cần xác thực
const PUBLIC_PAGES = [
    'dang-nhap-admin.html',
    'index.html',
    'debug-session.html',
    'select-login.html'
];

/**
 * Lấy thông tin user hiện tại
 */
function getCurrentUser() {
    // Kiểm tra localStorage
    const staffUser = sessionStorage.getItem('staff_user');
    if (staffUser) {
        try {
            return JSON.parse(staffUser);
        } catch (err) {
            console.error('❌ Lỗi parse staff_user:', err);
            sessionStorage.removeItem('staff_user');
        }
    }
    return null;
}

/**
 * Kiểm tra xác thực
 */
function checkAuth() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Bỏ qua kiểm tra cho các trang public
    if (PUBLIC_PAGES.includes(currentPage)) {
        console.log('📄 Public page, skip auth check');
        return;
    }

    const user = getCurrentUser();
    
    if (user) {
        console.log('✅ Đã đăng nhập:', user.ten_nhan_vien);
        console.log('👤 Vai trò:', user.vai_tro);
        window.currentUser = user;
        return;
    }

    // Chưa đăng nhập
    console.log('⚠️ Chưa đăng nhập, redirect về login');
    window.location.href = '../staff/login.html';
}

/**
 * Đăng xuất
 */
function logout() {
    console.log('🚪 Logging out...');
    
    // Xóa localStorage
    sessionStorage.removeItem('staff_user');
    
    console.log('✅ Logout successful');
    window.location.href = '../staff/login.html';
}

/**
 * Lấy quyền của user hiện tại
 */
async function getUserPermissions() {
    const user = getCurrentUser();
    if (!user) return null;
    
    try {
        const response = await fetch(`${API_BASE}/staff/${user.ma_nhan_vien}/permissions`);
        const data = await response.json();
        
        if (data.success) {
            return data.data;
        }
    } catch (error) {
        console.error('❌ Lỗi lấy quyền:', error);
    }
    
    return null;
}

/**
 * Kiểm tra quyền cụ thể
 */
async function hasPermission(permissionKey) {
    const user = getCurrentUser();
    if (!user) return false;
    
    // Admin luôn có quyền
    if (user.quyen === 'superadmin' || user.quyen === 'admin') {
        return true;
    }
    
    // Lấy quyền từ API
    const permissions = await getUserPermissions();
    if (!permissions) return false;
    
    return permissions[permissionKey] === 1;
}

// Export functions
window.checkAuth = checkAuth;
window.logout = logout;
window.getCurrentUser = getCurrentUser;
window.getUserPermissions = getUserPermissions;
window.hasPermission = hasPermission;

// Tự động kiểm tra khi load trang
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuth);
} else {
    checkAuth();
}
