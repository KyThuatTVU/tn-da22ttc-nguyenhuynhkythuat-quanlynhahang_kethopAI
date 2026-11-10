// Script để đăng xuất admin/staff
function logoutAdmin() {
    // Kiểm tra nếu là staff
    const staffUser = sessionStorage.getItem('staff_user');
    if (staffUser) {
        sessionStorage.removeItem('staff_user');
        window.location.href = '/staff/login/';
        return;
    }

    // Admin logout: xóa token và thông tin admin
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
    
    // Chuyển về trang đăng nhập admin
    window.location.href = '/admin/dang-nhap-admin/?logout=success';
}

// Export function
window.logoutAdmin = logoutAdmin;
