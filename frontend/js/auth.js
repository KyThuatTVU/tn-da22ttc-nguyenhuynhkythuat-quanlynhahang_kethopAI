// API Configuration
if (typeof window.API_URL === 'undefined') {
    window.API_URL = 'http://localhost:3000/api';
}

// Utility functions
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    notification.className = `fixed top-6 right-6 z-50 px-6 py-4 rounded-lg shadow-lg ${bgColor} text-white animate-slide-in`;
    notification.innerHTML = `<i class="fas ${icon} mr-2"></i> ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function setLoadingButton(button, isLoading, originalText = null) {
    if (typeof LoadingManager !== 'undefined') {
        LoadingManager.setButtonLoading(button, isLoading, isLoading ? 'Đang xử lý...' : null);
    } else {
        // Fallback
        if (isLoading) {
            if (!button.dataset.originalHtml) {
                button.dataset.originalHtml = button.innerHTML;
            }
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Đang xử lý...';
        } else {
            button.disabled = false;
            if (button.dataset.originalHtml) {
                button.innerHTML = button.dataset.originalHtml;
                delete button.dataset.originalHtml;
            }
        }
    }
}

// Save user data to localStorage
function saveUserData(data) {
    // Đảm bảo dữ liệu được chuẩn hóa trước khi lưu
    const userData = {
        ma_nguoi_dung: data.ma_nguoi_dung,
        ten_nguoi_dung: data.ten_nguoi_dung || data.email || 'Người dùng',
        email: data.email || '',
        anh_dai_dien: data.anh_dai_dien || null,
        so_dien_thoai: data.so_dien_thoai || null,
        dia_chi: data.dia_chi || null,
        gioi_tinh: data.gioi_tinh || 'khac',
        token: data.token,
        hasPreferences: data.hasPreferences || false
    };
    
    console.log('💾 Saving user data to localStorage:', {
        name: userData.ten_nguoi_dung,
        email: userData.email,
        avatar: userData.anh_dai_dien,
        hasToken: !!userData.token,
        hasPreferences: userData.hasPreferences
    });
    
    localStorage.setItem('user', JSON.stringify(userData));
    if (data.token) {
        localStorage.setItem('token', data.token);
    }
}

// Get user data from localStorage
function getUserData() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Check if user is logged in
function isLoggedIn() {
    return !!localStorage.getItem('token');
}

// Logout
function logout() {
    // Handle cart before logout
    if (typeof cartManager !== 'undefined') {
        cartManager.handleUserLogout();
    }
    
    // Dọn dẹp session chatbot
    const chatbotSessionId = localStorage.getItem('chatbot_session_id');
    if (chatbotSessionId) {
        sessionStorage.removeItem(`chatbot_history_${chatbotSessionId}`);
    }
    localStorage.removeItem('chatbot_session_id');
    localStorage.removeItem('chatbot_session_time');
    
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Register function
async function handleRegister(formData) {
    try {
        const response = await fetch(`${window.API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            saveUserData(result.data);
            showNotification('Đăng ký thành công!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showNotification(result.message || 'Đăng ký thất bại', 'error');
        }

        return result;
    } catch (error) {
        console.error('Lỗi đăng ký:', error);
        showNotification('Không thể kết nối đến server', 'error');
        return { success: false, message: error.message };
    }
}

// Login function
async function handleLogin(formData) {
    try {
        const response = await fetch(`${window.API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Quan trọng: gửi cookie session
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            saveUserData(result.data);
            showNotification('Đăng nhập thành công!', 'success');
            
            // Handle cart after login
            if (typeof cartManager !== 'undefined') {
                await cartManager.handleUserLogin();
            }
            
            // Kiểm tra nếu chưa có khẩu vị thì set flag để hiển thị modal
            if (!result.data.hasPreferences) {
                sessionStorage.setItem('show_preferences_modal', 'true');
            }
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showNotification(result.message || 'Đăng nhập thất bại', 'error');
        }

        return result;
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        showNotification('Không thể kết nối đến server', 'error');
        return { success: false, message: error.message };
    }
}

// Get current user info
async function getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const response = await fetch(`${window.API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (result.success) {
            return result.data;
        } else {
            // Token invalid, logout
            logout();
            return null;
        }
    } catch (error) {
        console.error('Lỗi lấy thông tin người dùng:', error);
        return null;
    }
}

// Update user info
async function updateUserInfo(formData) {
    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('Vui lòng đăng nhập', 'error');
        return;
    }

    try {
        const response = await fetch(`${window.API_URL}/auth/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Cập nhật thông tin thành công!', 'success');
        } else {
            showNotification(result.message || 'Cập nhật thất bại', 'error');
        }

        return result;
    } catch (error) {
        console.error('Lỗi cập nhật:', error);
        showNotification('Không thể kết nối đến server', 'error');
        return { success: false, message: error.message };
    }
}

// Change password
async function changePassword(mat_khau_cu, mat_khau_moi) {
    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('Vui lòng đăng nhập', 'error');
        return;
    }

    try {
        const response = await fetch(`${window.API_URL}/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ mat_khau_cu, mat_khau_moi })
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Đổi mật khẩu thành công!', 'success');
        } else {
            showNotification(result.message || 'Đổi mật khẩu thất bại', 'error');
        }

        return result;
    } catch (error) {
        console.error('Lỗi đổi mật khẩu:', error);
        showNotification('Không thể kết nối đến server', 'error');
        return { success: false, message: error.message };
    }
}

// Update navbar with user info
function updateNavbarWithUser() {
    // Wait for navbar to be loaded
    setTimeout(() => {
        // Show "My Orders" link if logged in
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            const myOrdersLink = document.getElementById('my-orders-link');
            const myOrdersLinkMobile = document.getElementById('my-orders-link-mobile');
            if (myOrdersLink) myOrdersLink.classList.remove('hidden');
            if (myOrdersLinkMobile) myOrdersLinkMobile.classList.remove('hidden');
            console.log('✅ My Orders link shown');
        }
        
        if (typeof window.updateUserMenu === 'function') {
            window.updateUserMenu();
            console.log('✅ Navbar updated with user info');
        } else {
            console.warn('⚠️ updateUserMenu not found, retrying...');
            // Retry after 500ms
            setTimeout(() => {
                if (typeof window.updateUserMenu === 'function') {
                    window.updateUserMenu();
                    console.log('✅ Navbar updated (retry)');
                }
            }, 500);
        }
    }, 200);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateNavbarWithUser();
});
