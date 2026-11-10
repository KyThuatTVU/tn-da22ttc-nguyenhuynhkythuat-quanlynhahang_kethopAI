/* ==== Script 1 (tách từ dang-nhap.html) ==== */
// Xử lý callback từ Google OAuth
        document.addEventListener('DOMContentLoaded', function() {
            const urlParams = new URLSearchParams(window.location.search);
            
            // Kiểm tra nếu có lỗi từ Google
            const error = urlParams.get('error');
            if (error) {
                let errorMessage = 'Đăng nhập Google thất bại';
                if (error === 'google_auth_failed') {
                    errorMessage = 'Xác thực Google thất bại. Vui lòng thử lại.';
                } else if (error === 'account_locked') {
                    errorMessage = 'Tài khoản đã bị khóa.';
                }
                showNotification(errorMessage, 'error');
                // Xóa params khỏi URL
                window.history.replaceState({}, document.title, window.location.pathname);
                return;
            }
            
            // Kiểm tra nếu đăng nhập Google thành công
            const googleAuth = urlParams.get('google_auth');
            const userData = urlParams.get('data');
            
            if (googleAuth === 'success' && userData) {
                try {
                    const user = JSON.parse(decodeURIComponent(userData));
                    
                    console.log('🔐 Google login data received:', user);
                    console.log('👤 User name:', user.ten_nguoi_dung);
                    console.log('📧 Email:', user.email);
                    console.log('🖼️ Avatar:', user.anh_dai_dien);
                    console.log('🔑 Token:', user.token ? 'Present' : 'Missing');
                    
                    // Validate dữ liệu trước khi lưu
                    if (!user.token) {
                        console.error('❌ Missing token in Google response');
                        showNotification('Lỗi xác thực. Vui lòng thử lại.', 'error');
                        window.history.replaceState({}, document.title, window.location.pathname);
                        return;
                    }
                    
                    // Đảm bảo tên người dùng có giá trị
                    if (!user.ten_nguoi_dung || user.ten_nguoi_dung.trim() === '') {
                        user.ten_nguoi_dung = user.email ? user.email.split('@')[0] : 'Người dùng';
                    }
                    
                    // Lưu thông tin user
                    saveUserData(user);
                    
                    // Verify data was saved
                    const savedUser = localStorage.getItem('user');
                    const savedToken = localStorage.getItem('token');
                    console.log('💾 Saved to localStorage:', { 
                        user: savedUser ? JSON.parse(savedUser) : null,
                        token: savedToken ? 'Present' : 'Missing'
                    });
                    
                    // Kiểm tra nếu chưa có khẩu vị thì set flag để hiển thị modal
                    if (!user.hasPreferences) {
                        sessionStorage.setItem('show_preferences_modal', 'true');
                    }
                    
                    // Hiển thị thông báo
                    const displayName = user.ten_nguoi_dung || 'bạn';
                    if (user.isNewUser) {
                        showNotification(`Đăng ký thành công! Chào mừng ${displayName} đến với Phương Nam.`, 'success');
                    } else {
                        showNotification(`Xin chào ${displayName}! Đăng nhập thành công.`, 'success');
                    }
                    
                    // Xóa params khỏi URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                    
                    // Chuyển hướng về trang chủ
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                    
                } catch (e) {
                    console.error('Lỗi parse user data:', e);
                    console.error('Raw userData:', userData);
                    showNotification('Có lỗi xảy ra. Vui lòng thử lại.', 'error');
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            }
        });

        // Xử lý click nút đăng nhập Google
        document.getElementById('google-login-btn').addEventListener('click', function() {
            // Redirect đến endpoint Google OAuth
            window.location.href = 'http://localhost:3000/api/auth/google';
        });

        function togglePassword() {
            const passwordInput = document.getElementById('password');
            const passwordIcon = document.getElementById('password-icon');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                passwordIcon.classList.remove('fa-eye');
                passwordIcon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                passwordIcon.classList.remove('fa-eye-slash');
                passwordIcon.classList.add('fa-eye');
            }
        }

        document.getElementById('login-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonHTML = submitButton.innerHTML;
            
            // Get form data
            const formData = {
                email: document.getElementById('email').value.trim(),
                mat_khau: document.getElementById('password').value
            };
            
            // Validate
            if (!formData.email || !formData.mat_khau) {
                showNotification('Vui lòng nhập đầy đủ thông tin', 'error');
                return;
            }
            
            // Set loading state
            setLoadingButton(submitButton, true);
            
            // Call login API
            const result = await handleLogin(formData);
            
            // Reset button if failed
            if (!result.success) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonHTML;
            }
        });
