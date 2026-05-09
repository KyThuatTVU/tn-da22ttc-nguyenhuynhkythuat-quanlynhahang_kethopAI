// Kiểm tra xác thực admin/staff
// Admin: dùng Google session (cookie)
// Staff: dùng localStorage

async function checkAdminAuth() {
    try {
        // Bước 1: Kiểm tra Staff từ localStorage
        const staffUserStr = sessionStorage.getItem('staff_user');
        if (staffUserStr) {
            try {
                const staff = JSON.parse(staffUserStr);
                if (staff && staff.ma_nhan_vien && staff.tai_khoan) {
                    console.log('✅ Staff authenticated (localStorage):', staff.ten_nhan_vien);
                    return {
                        ...staff,
                        role: 'staff',
                        name: staff.ten_nhan_vien,
                        avatar: staff.anh_dai_dien
                    };
                }
            } catch (e) {
                sessionStorage.removeItem('staff_user');
            }
        }

        // Bước 2: Kiểm tra Admin session (Google OAuth)
        const response = await fetch('http://localhost:3000/api/admin-auth/check-session', {
            method: 'GET',
            credentials: 'include'
        });

        const result = await response.json();
        
        console.log('🔍 Check auth result:', result);

        if (!result.isAuthenticated) {
            console.log('❌ Not authenticated');
            return false;
        }

        // Đã đăng nhập admin
        console.log('✅ Admin authenticated:', result.data?.email);
        return result.data || result.user;

    } catch (error) {
        console.error('Lỗi kiểm tra xác thực:', error);
        // Fallback: check localStorage
        const staffUserStr = sessionStorage.getItem('staff_user');
        if (staffUserStr) {
            try {
                const staff = JSON.parse(staffUserStr);
                if (staff && staff.ma_nhan_vien) return { ...staff, role: 'staff' };
            } catch (e) { /* ignore */ }
        }
        return false;
    }
}

// Đăng xuất
async function logoutAdmin() {
    if (!confirm('Bạn có chắc muốn đăng xuất?')) return;

    // Xóa staff sessionStorage dọn dẹp trình duyệt cục bộ ngay lập tức
    sessionStorage.removeItem('staff_user');

    // Admin logout - bắt buộc gọi API xóa session để giết tiến trình trên server
    try {
        const response = await fetch('http://localhost:3000/api/admin-auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        const result = await response.json();
        
        // Luôn chuyển hướng về trang đăng nhập admin kể cả thành công hay lỗi
        // vì cơ bản ở client ta đã coi như thoát rồi
        window.location.href = 'dang-nhap-admin.html?logout=success';
    } catch (error) {
        console.error('Lỗi đăng xuất:', error);
        window.location.href = 'dang-nhap-admin.html?logout=success';
    }
}

// Hàm cập nhật thông tin admin trên UI
function updateAdminUI(user) {
    const avatarElements = document.querySelectorAll('#admin-avatar, #admin-avatar-header');
    avatarElements.forEach(el => {
        if (el && user.avatar) {
            el.src = user.avatar;
        }
    });
    
    const nameElements = document.querySelectorAll('#admin-name, #admin-name-header');
    nameElements.forEach(el => {
        if (el && user.name) {
            el.textContent = user.name;
        }
    });
    
    const emailElement = document.getElementById('admin-email');
    if (emailElement && user.email) {
        emailElement.textContent = user.email;
    }
    
    console.log('✅ Admin UI updated');
}

// Export functions
window.checkAdminAuth = checkAdminAuth;
window.logoutAdmin = logoutAdmin;


