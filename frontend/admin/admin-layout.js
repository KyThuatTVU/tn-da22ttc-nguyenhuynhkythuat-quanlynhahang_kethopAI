// Admin Layout Component - Shared across all admin pages
const API_URL = 'http://localhost:3000/api';

// 1. SIDEBAR TEMPLATE (Centralized Source of Truth)
const SIDEBAR_TEMPLATE = `
<aside id="sidebar" class="sidebar w-72 flex-shrink-0 transition-transform -translate-x-full lg:translate-x-0 fixed lg:relative z-50 h-full">
    <div class="h-full flex flex-col">
        <div class="p-5 border-b border-white/10">
            <div class="flex items-center space-x-3">
                <img src="../images/Green Simple Clean Vegan Food Logo.png" alt="Logo" class="w-11 h-11 rounded-xl object-contain bg-white p-1">
                <div>
                    <h1 class="font-bold text-white text-lg">Phương Nam</h1>
                    <p class="text-xs text-blue-300">Hệ thống quản trị</p>
                </div>
            </div>
        </div>
        <nav class="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <!-- 1. Tổng quan -->
            <p class="nav-group-title">Tổng quan</p>
            <div class="space-y-1 mb-6">
                <a href="dashboard.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-chart-pie w-5"></i><span class="text-sm">Tổng quan</span>
                </a>
                <a href="doanh-thu.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-wallet w-5"></i><span class="text-sm">Báo cáo Tài chính</span>
                </a>
                <a href="chi-phi-hang-ngay.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-money-bill-wave w-5"></i><span class="text-sm">Chi phí hàng ngày</span>
                </a>
                <a href="loai-chi-phi.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-tags w-5"></i><span class="text-sm">Loại chi phí</span>
                </a>
            </div>

            <!-- 2. Nghiệp vụ bán hàng -->
            <p class="nav-group-title">Nghiệp vụ bán hàng</p>
            <div class="space-y-1 mb-6">
                <a href="admin-pos-new.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl menu-pos">
                    <i class="fas fa-cash-register w-5"></i><span class="text-sm font-medium">Bán hàng (POS)</span>
                </a>
                <a href="orders.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-shopping-cart w-5"></i><span class="text-sm font-medium">Đơn hàng</span>
                </a>
                <a href="reservations.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-calendar-check w-5"></i><span class="text-sm">Đặt bàn</span>
                </a>
                <a href="tables.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-chair w-5"></i><span class="text-sm">Quản lý bàn</span>
                </a>
            </div>

            <!-- 3. Thực đơn & Chế biến -->
            <p class="nav-group-title">Thực đơn & Chế biến</p>
            <div class="space-y-1 mb-6">
                <a href="products.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-utensils w-5"></i><span class="text-sm">Món ăn</span>
                </a>
                <a href="categories.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl menu-categories">
                    <i class="fas fa-tags w-5"></i><span class="text-sm font-medium">Danh mục</span>
                </a>
                <a href="nguyen-lieu.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-boxes w-5"></i><span class="text-sm">Nguyên liệu</span>
                </a>
                <a href="loai-nguyen-lieu.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-tags w-5"></i><span class="text-sm">Loại nguyên liệu</span>
                </a>
                <a href="cong-thuc.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-clipboard-list w-5"></i><span class="text-sm">Công thức</span>
                </a>
                <a href="nhap-hang.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-file-import w-5"></i><span class="text-sm">Nhập hàng</span>
                </a>
                <a href="nha-cung-cap.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-truck-field w-5"></i><span class="text-sm">Nhà cung cấp</span>
                </a>
                <a href="kiem-ke.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-clipboard-check w-5"></i><span class="text-sm">Kiểm kê kho</span>
                </a>
                <a href="hao-hut.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-dumpster w-5"></i><span class="text-sm">Báo cáo hao hụt</span>
                </a>
                <a href="ke-do-bep.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-kitchen-set w-5"></i><span class="text-sm">Kê đồ bếp</span>
                </a>
            </div>

            <!-- 4. Quản lý nhân sự & Hệ thống -->
            <p class="nav-group-title staff-group-title">Nhân sự & Quản trị</p>
            <div class="space-y-1 mb-6 staff-group-content">
                <!-- Nút chấm công nhanh cho nhân viên -->
                <a href="../staff/cham-cong.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 sidebar-staff-only">
                    <i class="fas fa-camera w-5"></i><span class="text-sm font-bold">📸 Chấm Công Ngay</span>
                </a>
                <a href="admins.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl sidebar-admin-only">
                    <i class="fas fa-user-shield w-5 text-blue-400"></i><span class="text-sm text-blue-100 font-medium">Tài khoản Admin</span>
                </a>
                <a href="staff.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-user-tie w-5"></i><span class="text-sm">Nhân viên</span>
                </a>
                <a href="shifts.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-clock w-5"></i><span class="text-sm">Ca làm việc</span>
                </a>
                <a href="attendance.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-check-double w-5"></i><span class="text-sm">Chấm công</span>
                </a>
                <a href="luong-hang-ngay.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-coins w-5"></i><span class="text-sm">Lương hàng ngày</span>
                </a>
                <a href="payroll.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-money-bill-wave w-5"></i><span class="text-sm">Bảng lương</span>
                </a>
            </div>

            <!-- 5. Khách hàng & Tiếp thị -->
            <p class="nav-group-title">Khách hàng & Tiếp thị</p>
            <div class="space-y-1 mb-6">
                <a href="customers.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-users w-5"></i><span class="text-sm">Khách hàng</span>
                </a>
                <a href="promotions.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-ticket-alt w-5"></i><span class="text-sm">Khuyến mãi</span>
                </a>
                <a href="reviews.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-star w-5"></i><span class="text-sm">Đánh giá</span>
                </a>
                <a href="contacts.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-envelope w-5"></i><span class="text-sm">Liên hệ</span>
                </a>
                <a href="chatbot-history.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-robot w-5"></i><span class="text-sm">Lịch sử Chatbot</span>
                </a>
            </div>

            <!-- 6. Nội dung & Hệ thống -->
            <p class="nav-group-title content-system-title">Nội dung & Hệ thống</p>
            <div class="space-y-1 content-system-group">
                <a href="news.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-newspaper w-5"></i><span class="text-sm">Tin tức</span>
                </a>
                <a href="quan-ly-binh-luan.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-comments w-5"></i><span class="text-sm">Bình luận</span>
                </a>
                <a href="albums.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-images w-5"></i><span class="text-sm">Album ảnh</span>
                </a>
                <a href="settings.html" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl">
                    <i class="fas fa-cog w-5"></i><span class="text-sm">Cài đặt hệ thống</span>
                </a>
            </div>
        </nav>
        <div class="p-4 border-t border-white/10">
            <div class="admin-card">
                <div class="flex items-center space-x-3">
                    <img id="admin-avatar" referrerpolicy="no-referrer" src="https://ui-avatars.com/api/?name=Admin&background=3b82f6&color=fff" alt="Admin" class="w-12 h-12 rounded-full border-2 border-blue-400">
                    <div class="flex-1 min-w-0">
                        <p id="admin-name" class="font-semibold text-sm text-white truncate">Admin</p>
                        <p id="admin-email" class="text-xs text-blue-300 truncate">admin@example.com</p>
                    </div>
                </div>
                <div class="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
                    <span id="login-type-badge" class="text-xs text-blue-300"><i class="fab fa-google mr-1"></i>Google</span>
                    <button onclick="if(typeof logoutAdmin !== 'undefined') logoutAdmin(); else alert('Hàm đăng xuất chưa sẵn sàng!');" class="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer relative z-50">
                        <i class="fas fa-sign-out-alt mr-1"></i>Đăng xuất
                    </button>
                </div>
            </div>
        </div>
    </div>
</aside>
`;

// 2. HEADER TEMPLATE (Centralized Source of Truth)
const HEADER_TEMPLATE = `
<header class="header-bar flex items-center justify-between">
    <div class="flex items-center space-x-3 sm:space-x-4">
        <button onclick="toggleSidebar()" class="mobile-menu-btn lg:hidden text-white cursor-pointer"><i class="fas fa-bars text-xl"></i></button>
        <div>
            <h2 id="header-page-title" class="text-base sm:text-xl font-bold">Quản trị</h2>
            <p id="header-page-desc" class="text-xs sm:text-sm text-blue-200 hidden sm:block">Nhà hàng Ẩm thực Phương Nam</p>
        </div>
    </div>
    <div class="flex items-center space-x-4">
        <!-- Reload Permissions Button (chỉ hiện cho Staff) -->
        <button id="reload-permissions-btn" onclick="reloadPermissions()" class="hidden text-white hover:text-blue-200 transition cursor-pointer" title="Kiểm tra quyền mới">
            <i class="fas fa-sync-alt text-lg"></i>
        </button>
        
        <!-- Admin Notification Bell -->
        <div id="admin-notification-container" class="relative">
            <button id="admin-notification-btn" class="relative text-white hover:text-blue-200 transition cursor-pointer">
                <i class="fas fa-bell text-lg"></i>
                <span id="admin-notification-badge" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold hidden">0</span>
            </button>
            <div id="admin-notification-dropdown" class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-100 hidden" style="z-index: 9999;">
                <div class="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <h3 class="font-semibold text-gray-800">Thông báo quản trị</h3>
                    <button id="admin-mark-all-read-btn" class="text-xs text-orange-600 hover:text-orange-700 cursor-pointer">Đánh dấu đã đọc</button>
                </div>
                <div id="admin-notification-list" class="max-h-96 overflow-y-auto">
                    <div class="text-center py-8 text-gray-400">
                        <i class="fas fa-bell-slash text-3xl mb-2"></i>
                        <p class="text-sm">Chưa có thông báo</p>
                    </div>
                </div>
            </div>
        </div>
        
        <a href="../index.html" target="_blank" class="text-white hover:text-blue-200 transition" title="Xem website">
            <i class="fas fa-external-link-alt text-lg"></i>
        </a>
        <div class="hidden md:flex items-center space-x-3 pl-4 border-l border-white/20">
            <img id="admin-avatar-header" referrerpolicy="no-referrer" src="https://ui-avatars.com/api/?name=Admin&background=3b82f6&color=fff" alt="Admin" class="w-10 h-10 rounded-full border-2 border-blue-400">
            <div>
                <p id="admin-name-header" class="font-semibold text-sm text-white">Admin</p>
                <p id="user-role-badge" class="text-xs text-blue-200 uppercase tracking-tighter font-bold">Quản trị viên</p>
            </div>
        </div>
    </div>
</header>
<div id="sidebar-overlay" class="fixed inset-0 bg-black/50 z-40 lg:hidden opacity-0 invisible pointer-events-none lg:pointer-events-none transition-all duration-300" onclick="toggleSidebar()"></div>
`;

// Helper to update elements safely
function safeUpdate(id, prop, val, isAttr = false) {
    const el = document.getElementById(id);
    if (!el) return;
    if (isAttr) el.setAttribute(prop, val);
    else el[prop] = val;
}

// =============================================
// LOAD ADMIN/STAFF INFO - ĐƠN GIẢN HÓA
// =============================================
// Admin: check Google session qua API (cookie)
// Staff: đọc từ localStorage (đơn giản, không cần cookie)
// =============================================
async function loadAdminInfo() {
    try {
        // ========== BƯỚC 1: Kiểm tra Staff từ sessionStorage TRƯỚC ==========
        const staffUserStr = sessionStorage.getItem('staff_user');
        if (staffUserStr) {
            try {
                const staff = JSON.parse(staffUserStr);
                if (staff && staff.ma_nhan_vien && staff.tai_khoan) {
                    const staffName = staff.ten_nhan_vien || staff.tai_khoan;
                    const staffAvatar = staff.anh_dai_dien || `https://ui-avatars.com/api/?name=${encodeURIComponent(staffName)}&background=10b981&color=fff`;
                    const staffEmail = staff.email || `${staff.tai_khoan}@staff`;

                    console.log('✅ Staff đăng nhập từ sessionStorage:', staffName);
                    
                    updateAdminElements('admin-name', staffName);
                    updateAdminElements('admin-avatar', staffAvatar, true);
                    updateAdminElements('admin-email', staffEmail);
                    updateAdminElements('admin-name-header', staffName);
                    updateAdminElements('admin-avatar-header', staffAvatar, true);

                    const loginBadge = document.getElementById('login-type-badge');
                    if (loginBadge) {
                        loginBadge.innerHTML = '<i class="fas fa-user mr-1"></i>Nhân viên';
                    }

                    const staffData = { ...staff, role: 'staff' };
                    window.currentUser = staffData;
                    return staffData;
                }
            } catch (parseError) {
                sessionStorage.removeItem('staff_user');
            }
        }

        // ========== BƯỚC 2: Kiểm tra Admin session (Google OAuth) ==========
        let isAdmin = false;
        try {
            const response = await fetch(`${API_URL}/admin-auth/check-session`, {
                method: 'GET',
                credentials: 'include'
            });
            const result = await response.json();

            if (result.isAuthenticated && result.data) {
                isAdmin = true;
                const admin = result.data;
                const adminName = admin.ten_hien_thi || admin.tai_khoan || admin.email?.split('@')[0] || 'Admin';
                const adminAvatar = admin.anh_dai_dien || `https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=3b82f6&color=fff`;

                console.log('✅ Admin đăng nhập qua Google:', adminName);
                
                updateAdminElements('admin-name', adminName);
                updateAdminElements('admin-avatar', adminAvatar, true);
                updateAdminElements('admin-email', admin.email);
                updateAdminElements('admin-name-header', adminName);
                updateAdminElements('admin-avatar-header', adminAvatar, true);

                const loginBadge = document.getElementById('login-type-badge');
                if (loginBadge) {
                    loginBadge.innerHTML = '<i class="fas fa-crown text-yellow-400 mr-1"></i>Admin';
                }

                const adminData = { ...admin, role: 'admin' };
                window.currentUser = adminData;

                return adminData;
            }
        } catch(e) {
            console.log('Không có session Admin (hoặc lỗi network)');
        }

        return null;

    } catch (error) {
        console.error('❌ Lỗi:', error);
        return null;
    }
}

function updateAdminElements(identifier, value, isImage = false) {
    const elements = [...document.querySelectorAll(`#${identifier}`), 
                     ...document.querySelectorAll(`.${identifier}`),
                     ...document.querySelectorAll(`[data-admin="${identifier}"]`)];
    
    elements.forEach(el => {
        if (isImage) {
            el.setAttribute('referrerpolicy', 'no-referrer');
            el.src = value;
            el.onerror = () => el.src = 'https://ui-avatars.com/api/?name=User&background=3b82f6&color=fff';
        } else {
            el.textContent = value;
        }
    });
}

// =============================================
// ĐĂNG XUẤT
// =============================================
async function logout() {
    if (!confirm('Bạn có chắc muốn đăng xuất?')) return;

    const isStaff = window.currentUser?.role === 'staff' || sessionStorage.getItem('staff_user');

    if (isStaff) {
        // ===== STAFF LOGOUT: Xóa localStorage, không cần gọi API =====
        console.log('🚪 Staff đăng xuất...');
        sessionStorage.removeItem('staff_user');
        window.location.href = '../staff/login.html';
    } else {
        // ===== ADMIN LOGOUT: Gọi API xóa session Google =====
        try {
            console.log('🚪 Admin đăng xuất...');
            const res = await fetch(`${API_URL}/admin-auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            const result = await res.json();

            if (result.success) {
                console.log('✅ Admin logout thành công');
                document.cookie = 'admin.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                window.location.href = 'dang-nhap-admin.html';
            } else {
                alert('Lỗi đăng xuất!');
            }
        } catch (e) {
            console.error('❌ Logout error:', e);
            // Fallback: vẫn xóa cookie và chuyển hướng
            document.cookie = 'admin.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            window.location.href = 'dang-nhap-admin.html';
        }
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) {
        sidebar.classList.toggle('-translate-x-full');
        if (overlay) {
            overlay.classList.toggle('opacity-0');
            overlay.classList.toggle('invisible');
            // Toggle pointer-events: when sidebar is open, overlay should catch clicks
            const isOpen = !sidebar.classList.contains('-translate-x-full');
            if (isOpen) {
                overlay.classList.remove('pointer-events-none');
            } else {
                overlay.classList.add('pointer-events-none');
            }
        }
    }
}

// =============================================
// PHÂN QUYỀN (RBAC)
// =============================================
// Admin: full quyền - thấy tất cả menu
// Staff: dựa vào vai_tro + quyền chi tiết từ bảng nhan_vien_quyen
// =============================================
async function applyRBAC(userData) {
    if (!userData) return;

    const currentRole = (userData.role || userData.vai_tro || 'staff').toLowerCase();
    console.log('🛡️ Áp dụng phân quyền cho:', currentRole);

    // Admin (đăng nhập Google): Full quyền, không cần ẩn gì
    if (currentRole === 'admin' || currentRole === 'superadmin') {
        console.log('👑 Admin - Full quyền');
        updateRoleBadge('admin');
        // Ẩn nút reload permissions cho admin
        const reloadBtn = document.getElementById('reload-permissions-btn');
        if (reloadBtn) reloadBtn.classList.add('hidden');
        // Ẩn nút chấm công nhanh cho admin
        document.querySelectorAll('.sidebar-staff-only').forEach(el => el.style.display = 'none');
        return;
    }

    // ===== STAFF: Hiển thị nút reload permissions và nút chấm công =====
    const reloadBtn = document.getElementById('reload-permissions-btn');
    if (reloadBtn) reloadBtn.classList.remove('hidden');
    // Hiển thị nút chấm công cho staff
    document.querySelectorAll('.sidebar-staff-only').forEach(el => el.style.display = 'flex');

    // ===== STAFF: Load quyền chi tiết từ API =====
    const staffId = userData.ma_nhan_vien;
    const vai_tro = (userData.vai_tro || 'waiter').toLowerCase();
    let permissions = {};
    let permissionsLoaded = false;

    if (staffId) {
        try {
            const res = await fetch(`${API_URL}/staff/${staffId}/permissions`, { cache: 'no-store' });
            const data = await res.json();
            if (data.success && data.data) {
                permissions = data.data;
                // Kiểm tra có ít nhất 1 quyền được bật không
                const hasAnyPerm = Object.keys(permissions).some(k => 
                    !['ma_quyen','ma_nhan_vien','ngay_tao','ngay_cap_nhat'].includes(k) && permissions[k] === 1
                );
                permissionsLoaded = hasAnyPerm;
                console.log('📋 Quyền nhân viên:', permissions, '| Có quyền:', permissionsLoaded);
            }
        } catch (err) {
            console.error('❌ Lỗi load quyền nhân viên:', err);
        }
    }

    // ===== FALLBACK: Quyền mặc định theo vai trò nếu chưa có quyền chi tiết =====
    if (!permissionsLoaded) {
        console.log('⚠️ Không có quyền chi tiết → dùng quyền mặc định theo vai trò:', vai_tro);
        permissions = getDefaultPermissions(vai_tro);
    }

    // Lưu quyền vào window để các trang khác dùng
    window.staffPermissions = permissions;

    // ===== TỰ ĐỘNG RELOAD QUYỀN MỖI 30 GIÂY =====
    // Để nhân viên nhận quyền mới ngay khi admin thay đổi mà không cần đăng nhập lại
    if (staffId) {
        setInterval(async () => {
            try {
                const res = await fetch(`${API_URL}/staff/${staffId}/permissions`, { cache: 'no-store' });
                const data = await res.json();
                if (data.success && data.data) {
                    const newPermissions = data.data;
                    
                    // So sánh quyền cũ và mới
                    const hasChanges = JSON.stringify(permissions) !== JSON.stringify(newPermissions);
                    
                    if (hasChanges) {
                        console.log('🔄 Phát hiện thay đổi quyền! Đang reload...');
                        window.staffPermissions = newPermissions;
                        permissions = newPermissions;
                        
                        // Reload lại trang để áp dụng quyền mới
                        location.reload();
                    }
                }
            } catch (err) {
                console.error('❌ Lỗi kiểm tra quyền:', err);
            }
        }, 30000); // 30 giây
    }

    // ===== ÁP DỤNG: Ẩn/hiện menu dựa trên quyền =====
    // Map quyền → menu sidebar
    const permissionMenuMap = {
        // Tổng quan
        'dashboard.html': ['xem_bao_cao', 'xem_thong_ke'],
        'doanh-thu.html': ['xem_doanh_thu'],
        'chi-phi-hang-ngay.html': ['xem_doanh_thu'],
        'loai-chi-phi.html': ['xem_doanh_thu'],
        // Bán hàng
        'admin-pos-new.html': ['xem_pos', 'tao_don_pos'],
        'orders.html': ['xem_don_hang'],
        'reservations.html': ['dat_ban', 'xem_ban'],
        'tables.html': ['xem_ban'],
        // Thực đơn
        'products.html': ['xem_menu'],
        'categories.html': ['xem_menu'],
        'nguyen-lieu.html': ['xem_kho'],
        'loai-nguyen-lieu.html': ['xem_kho'],
        'cong-thuc.html': ['xem_cong_thuc'],
        'nhap-hang.html': ['nhap_kho'],
        'nha-cung-cap.html': ['xem_kho'],
        'kiem-ke.html': ['xem_kho'],
        'hao-hut.html': ['xem_kho'],
        'ke-do-bep.html': ['xem_phieu_bep'],
        // Nhân sự (chỉ admin/manager)
        'admins.html': [],  // Luôn ẩn đối với staff
        'staff.html': ['xem_nhan_vien'],
        'shifts.html': ['xem_nhan_vien'],
        'attendance.html': ['xem_nhan_vien'],
        'payroll.html': ['xem_nhan_vien'],
        // Khách hàng
        'customers.html': ['xem_khach_hang'],
        'promotions.html': ['xem_khach_hang'],
        'reviews.html': ['xem_khach_hang'],
        'contacts.html': ['xem_khach_hang'],
        'chatbot-history.html': ['xem_khach_hang'],
        // Hệ thống
        'news.html': ['xem_cai_dat'],
        'quan-ly-binh-luan.html': ['xem_cai_dat'],
        'albums.html': ['xem_cai_dat'],
        'settings.html': ['xem_cai_dat', 'sua_cai_dat'],
    };

    // Kiểm tra từng menu
    const allMenuLinks = document.querySelectorAll('.sidebar-item[href]');
    const currentPage = window.location.pathname.split('/').pop().split('?')[0];

    allMenuLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        const requiredPerms = permissionMenuMap[href];

        // Nếu không có mapping → ẩn (an toàn)
        if (!requiredPerms || requiredPerms.length === 0) {
            link.style.display = 'none';
            return;
        }

        // Kiểm tra có ít nhất 1 quyền phù hợp (cho phép số 1, chuỗi '1', hoặc boolean true)
        const hasPermission = requiredPerms.some(perm => 
            permissions[perm] === 1 || permissions[perm] === '1' || permissions[perm] === true
        );

        if (!hasPermission) {
            link.style.display = 'none';
        }
    });

    // Kiểm tra trang hiện tại có quyền truy cập không
    const currentPagePerms = permissionMenuMap[currentPage];
    
    // Cập nhật role badge sớm để ko bị lầm
    updateRoleBadge(vai_tro);

    if (currentPagePerms && currentPagePerms.length > 0) {
        const hasAccess = currentPagePerms.some(perm => 
            permissions[perm] === 1 || permissions[perm] === '1' || permissions[perm] === true
        );
        console.log(`🔍 Trang hiện tại: ${currentPage}, Yêu cầu quyền:`, currentPagePerms, `| Kết quả: ${hasAccess}`);
        
        if (!hasAccess) {
            console.warn('❌ Bị block vì không đủ quyền truy cập trang:', currentPage);
            alert(`Tài khoản nhân viên của bạn hiện chưa được cấp quyền cho trang này.\n(Hệ thống đang hoạt động đúng chức năng của tài khoản Nhân viên)`);
            redirectToDefaultPage(vai_tro);
            return;
        }
    }

    // Dọn dẹp: ẩn nhóm menu trống
    document.querySelectorAll('.nav-group-title').forEach(titleEl => {
        let sibling = titleEl.nextElementSibling;
        if (sibling && sibling.classList.contains('space-y-1')) {
            const visibleLinks = [...sibling.querySelectorAll('a')].filter(a => a.style.display !== 'none');
            if (visibleLinks.length === 0) {
                titleEl.style.display = 'none';
                sibling.style.display = 'none';
            }
        }
    });

    // Cập nhật role badge
    updateRoleBadge(vai_tro);
}

// ===== QUYỀN MẶC ĐỊNH THEO VAI TRÒ =====
// Dùng khi bảng nhan_vien_quyen chưa có dữ liệu
function getDefaultPermissions(vai_tro) {
    const defaults = {
        // Manager: gần như full quyền
        'manager': {
            xem_don_hang: 1, tao_don_hang: 1, sua_don_hang: 1, xoa_don_hang: 1, huy_don_hang: 1,
            xem_ban: 1, dat_ban: 1, sua_ban: 1,
            xem_menu: 1, them_menu: 1, sua_menu: 1,
            xem_khach_hang: 1, them_khach_hang: 1, sua_khach_hang: 1,
            xem_kho: 1, them_kho: 1, sua_kho: 1, nhap_kho: 1, xuat_kho: 1,
            xem_nhan_vien: 1, them_nhan_vien: 1, sua_nhan_vien: 1, phan_quyen: 1,
            xem_bao_cao: 1, xem_doanh_thu: 1, xem_thong_ke: 1, xuat_bao_cao: 1,
            xem_phieu_bep: 1, cap_nhat_trang_thai_mon: 1, xem_cong_thuc: 1,
            thanh_toan: 1, ap_dung_giam_gia: 1,
            xem_pos: 1, tao_don_pos: 1,
            xem_cai_dat: 1
        },
        // Waiter (Phục vụ): đơn hàng + bàn + POS
        'waiter': {
            xem_don_hang: 1, tao_don_hang: 1,
            xem_ban: 1, dat_ban: 1,
            xem_menu: 1,
            xem_pos: 1, tao_don_pos: 1,
            thanh_toan: 1
        },
        // Kitchen (Bếp): xem đơn hàng + phiếu bếp + kho
        'kitchen': {
            xem_don_hang: 1,
            xem_menu: 1,
            xem_kho: 1,
            xem_phieu_bep: 1, cap_nhat_trang_thai_mon: 1, xem_cong_thuc: 1
        },
        // Cashier (Thu ngân): đơn hàng + thanh toán + POS
        'cashier': {
            xem_don_hang: 1, tao_don_hang: 1,
            xem_ban: 1,
            xem_menu: 1,
            xem_pos: 1, tao_don_pos: 1,
            thanh_toan: 1,
            xem_khach_hang: 1
        }
    };

    return defaults[vai_tro] || defaults['waiter'];
}

// Chuyển hướng về trang mặc định theo vai trò
function redirectToDefaultPage(vai_tro) {
    if (!window.staffPermissions) {
        window.location.href = '../staff/login.html';
        return;
    }
    
    const permissions = window.staffPermissions;
    const currentPath = window.location.pathname.split('/').pop().split('?')[0];

    // Map quyền tương ứng giống applyRBAC
    const permissionMenuMap = {
        'dashboard.html': ['xem_bao_cao', 'xem_thong_ke'],
        'doanh-thu.html': ['xem_doanh_thu'],
        'chi-phi-hang-ngay.html': ['xem_doanh_thu'],
        'loai-chi-phi.html': ['xem_doanh_thu'],
        'admin-pos-new.html': ['xem_pos', 'tao_don_pos'],
        'orders.html': ['xem_don_hang'],
        'reservations.html': ['dat_ban', 'xem_ban'],
        'tables.html': ['xem_ban'],
        'products.html': ['xem_menu'],
        'categories.html': ['xem_menu'],
        'nguyen-lieu.html': ['xem_kho'],
        'loai-nguyen-lieu.html': ['xem_kho'],
        'cong-thuc.html': ['xem_cong_thuc'],
        'nhap-hang.html': ['nhap_kho'],
        'nha-cung-cap.html': ['xem_kho'],
        'kiem-ke.html': ['xem_kho'],
        'hao-hut.html': ['xem_kho'],
        'ke-do-bep.html': ['xem_phieu_bep'],
        'staff.html': ['xem_nhan_vien'],
        'shifts.html': ['xem_nhan_vien'],
        'attendance.html': ['xem_nhan_vien'],
        'payroll.html': ['xem_nhan_vien'],
        'customers.html': ['xem_khach_hang'],
        'promotions.html': ['xem_khach_hang'],
        'reviews.html': ['xem_khach_hang'],
        'contacts.html': ['xem_khach_hang'],
        'chatbot-history.html': ['xem_khach_hang'],
        'news.html': ['xem_cai_dat'],
        'quan-ly-binh-luan.html': ['xem_cai_dat'],
        'albums.html': ['xem_cai_dat'],
        'settings.html': ['xem_cai_dat', 'sua_cai_dat']
    };

    // Tìm một trang khác trang hiện tại mà nhân viên có quyền để ném nó vào
    const availableHref = Object.keys(permissionMenuMap).find(href => {
        if (href === currentPath) return false;
        const requiredPerms = permissionMenuMap[href];
        return requiredPerms.some(perm => 
            permissions[perm] === 1 || permissions[perm] === '1' || permissions[perm] === true
        );
    });

    if (availableHref) {
        window.location.href = availableHref;
    } else {
        // Đăng xuất nếu mồ côi (không có bất kì quyền gì trên toàn bộ trang mảng này)
        alert("Tài khoản của bạn đã bị giới hạn toàn bộ quyền truy cập! Vui lòng liên hệ Admin.");
        sessionStorage.removeItem('staff_user');
        window.location.href = '../staff/login.html';
    }
}

// Cập nhật badge chức vụ
function updateRoleBadge(vai_tro) {
    const roleBadge = document.getElementById('user-role-badge');
    if (roleBadge) {
        const roleMap = {
            'admin': 'Quản trị viên',
            'superadmin': 'Super Admin',
            'manager': 'Quản lý',
            'chef': 'Đầu bếp',
            'kitchen': 'Đầu bếp',
            'cashier': 'Thu ngân',
            'waiter': 'Phục vụ',
            'staff': 'Nhân viên'
        };
        roleBadge.textContent = roleMap[vai_tro] || 'Nhân viên';
    }
}

function setActiveNavLink() {
    // Add small delay to ensure DOM is settled after injection
    setTimeout(() => {
        const path = window.location.pathname;
        const currentPage = path.split('/').pop().split('?')[0] || 'dashboard.html';
        const pageName = currentPage.replace('.html', '').toLowerCase();
        
        console.log('📍 Current Page:', pageName);
        
        // Map sub-pages to parent sidebar items
        const subPageMap = {
            'admin-pos-new': 'admin-pos-new',
            'admin-pos-order': 'admin-pos-new',
            'admin-pos-tables': 'admin-pos-new',
            'quan-ly-binh-luan': 'quan-ly-binh-luan',
            'quan-ly-danh-gia-tin-tuc': 'quan-ly-binh-luan',
            'staff-detail': 'staff',
            'product-detail': 'products',
            'order-detail': 'orders'
        };
        
        const activeBasePage = subPageMap[pageName] || pageName;
        let activeElement = null;
        
        document.querySelectorAll('.sidebar-item').forEach(link => {
            const h = link.getAttribute('href');
            if (!h) return;
            
            const linkPage = h.split('/').pop().split('?')[0].replace('.html', '').toLowerCase();
            
            if (linkPage === activeBasePage) {
                link.classList.add('active');
                activeElement = link;
            } else {
                link.classList.remove('active');
            }
        });

        // AUTO-SCROLL to active item
        if (activeElement) {
            activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, 100);
}

// Layout Injection Engine
function injectLayout() {
    // 1. Inject Sidebar
    const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
    if (sidebarPlaceholder) {
        sidebarPlaceholder.innerHTML = SIDEBAR_TEMPLATE;
        addMenuDataAttributes();
    }

    // 2. Inject Header
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        headerPlaceholder.innerHTML = HEADER_TEMPLATE;
        
        // Auto-set title from document title
        const pageTitle = document.title.split('-')[0].trim();
        safeUpdate('header-page-title', 'textContent', pageTitle);
    }
}

// Thêm data-menu attributes cho các menu items
function addMenuDataAttributes() {
    const menuMappings = {
        'dashboard.html': 'dashboard', 'doanh-thu.html': 'doanh-thu',
        'chi-phi-hang-ngay.html': 'chi-phi-hang-ngay', 'loai-chi-phi.html': 'loai-chi-phi',
        'admin-pos-new.html': 'admin-pos-new', 'admin-pos-tables.html': 'admin-pos-tables',
        'admin-pos-order.html': 'admin-pos-order', 'orders.html': 'orders',
        'reservations.html': 'reservations', 'tables.html': 'tables',
        'products.html': 'products', 'categories.html': 'categories',
        'nguyen-lieu.html': 'nguyen-lieu', 'loai-nguyen-lieu.html': 'loai-nguyen-lieu',
        'cong-thuc.html': 'cong-thuc', 'nhap-hang.html': 'nhap-hang',
        'nha-cung-cap.html': 'nha-cung-cap', 'kiem-ke.html': 'kiem-ke',
        'hao-hut.html': 'hao-hut', 'ke-do-bep.html': 'ke-do-bep',
        'admins.html': 'admins', 'staff.html': 'staff',
        'shifts.html': 'shifts', 'attendance.html': 'attendance',
        'payroll.html': 'payroll', 'customers.html': 'customers',
        'promotions.html': 'promotions', 'reviews.html': 'reviews',
        'contacts.html': 'contacts', 'chatbot-history.html': 'chatbot-history',
        'news.html': 'news', 'quan-ly-binh-luan.html': 'quan-ly-binh-luan',
        'quan-ly-danh-gia-tin-tuc.html': 'quan-ly-danh-gia-tin-tuc',
        'albums.html': 'albums', 'settings.html': 'settings'
    };

    for (const [href, menuName] of Object.entries(menuMappings)) {
        document.querySelector(`a[href="${href}"]`)?.setAttribute('data-menu', menuName);
    }
    
    console.log('✅ Added data-menu attributes');
}

async function initAdminLayout() {
    // Không chạy redirect hoặc check nếu đang ở trang login
    const currentPath = window.location.pathname;
    if (currentPath.includes('login.html') || currentPath.includes('dang-nhap-admin.html')) {
        return;
    }

    injectLayout();
    const userData = await loadAdminInfo();
    
    if (userData) {
        await applyRBAC(userData);
        setActiveNavLink();
    } else {
        // Nếu không có userData, chuyển ngay ra trang login
        console.warn('⚠️ Phiên đăng nhập hết hạn. Đang chuyển hướng...');
        window.location.href = 'dang-nhap-admin.html?error=session_expired';
    }

    // Thiết lập Heartbeat toàn cục (kiểm tra liên tục mỗi 5 giây)
    setInterval(async () => {
        try {
            const response = await fetch(`${API_URL}/admin-auth/check-session`, {
                method: 'GET',
                credentials: 'include'
            });
            const result = await response.json();
            if (!result.isAuthenticated && !sessionStorage.getItem('staff_user')) {
                window.location.href = 'dang-nhap-admin.html?error=session_expired';
            }
        } catch (error) {
            console.warn('⚠️ Mất kết nối tới máy chủ!');
            if (!document.getElementById('server-offline-overlay')) {
                const overlay = document.createElement('div');
                overlay.id = 'server-offline-overlay';
                overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.8);z-index:9999;display:flex;flex-direction:column;justify-content:center;align-items:center;color:white;font-family:sans-serif;';
                overlay.innerHTML = `
                    <div style="background:white;color:red;padding:30px;border-radius:15px;text-align:center;max-width:400px;">
                        <i class="fas fa-plug" style="font-size:3rem;margin-bottom:15px;"></i>
                        <h2 style="font-size:1.5rem;font-weight:bold;margin-bottom:10px;">Đã Mất Kết Nối Server</h2>
                        <p style="color:#555;margin-bottom:20px;">Server Localhost:3000 đã bị tắt. Hệ thống tạm thời bị đóng băng để bảo vệ dữ liệu.</p>
                        <p style="font-size:0.9rem;color:#777;">Hãy bật lại server <br><code>node server.js</code><br> rồi nhấn F5.</p>
                    </div>
                `;
                document.body.appendChild(overlay);
            }
        }
    }, 5000);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAdminLayout);
else initAdminLayout();

// Export
window.logout = logout;
window.toggleSidebar = toggleSidebar;

// ===== CHỨC NĂNG RELOAD QUYỀN THỦ CÔNG =====
window.reloadPermissions = async function() {
    const staffUserStr = sessionStorage.getItem('staff_user');
    if (!staffUserStr) {
        console.log('⚠️ Không phải nhân viên, không cần reload quyền');
        return;
    }

    try {
        const staff = JSON.parse(staffUserStr);
        const staffId = staff.ma_nhan_vien;
        
        if (!staffId) {
            console.log('⚠️ Không tìm thấy ID nhân viên');
            return;
        }

        console.log('🔄 Đang reload quyền...');
        
        const res = await fetch(`http://localhost:3000/api/staff/${staffId}/permissions`, { cache: 'no-store' });
        const data = await res.json();
        
        if (data.success && data.data) {
            const oldPermissions = window.staffPermissions || {};
            const newPermissions = data.data;
            
            // So sánh quyền cũ và mới
            const hasChanges = JSON.stringify(oldPermissions) !== JSON.stringify(newPermissions);
            
            if (hasChanges) {
                console.log('✅ Phát hiện thay đổi quyền! Đang reload trang...');
                window.staffPermissions = newPermissions;
                
                // Hiển thị thông báo trước khi reload
                const notification = document.createElement('div');
                notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 16px 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000; font-weight: 600;';
                notification.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Quyền đã được cập nhật! Đang tải lại...';
                document.body.appendChild(notification);
                
                setTimeout(() => location.reload(), 1000);
            } else {
                console.log('✅ Quyền không thay đổi');
                
                // Hiển thị thông báo
                const notification = document.createElement('div');
                notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #3b82f6; color: white; padding: 16px 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000; font-weight: 600;';
                notification.innerHTML = '<i class="fas fa-info-circle mr-2"></i>Quyền của bạn đã là mới nhất';
                document.body.appendChild(notification);
                
                setTimeout(() => notification.remove(), 3000);
            }
        }
    } catch (err) {
        console.error('❌ Lỗi reload quyền:', err);
        alert('Lỗi khi kiểm tra quyền. Vui lòng thử lại!');
    }
};
