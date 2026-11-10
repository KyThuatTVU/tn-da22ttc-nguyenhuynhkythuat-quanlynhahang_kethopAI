/* ==== Script 1 (tách từ dang-nhap-admin.html) ==== */
function showAlert(message, type = 'error') {
            const alertDiv = document.getElementById('alert-message');
            alertDiv.className = `p-4 rounded-lg ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`;
            alertDiv.textContent = message;
            alertDiv.classList.remove('hidden');

            setTimeout(() => {
                alertDiv.classList.add('hidden');
            }, 5000);
        }

        // Google Login cho Admin
        function loginWithGoogle() {
            window.location.href = 'http://localhost:3000/api/admin-auth/google';
        }

        // Xử lý callback từ Google
        window.addEventListener('DOMContentLoaded', async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const loginSuccess = urlParams.get('login');
            const error = urlParams.get('error');
            const logout = urlParams.get('logout');

            if (logout === 'success') {
                showAlert('Đã đăng xuất thành công!', 'success');
                window.history.replaceState({}, document.title, window.location.pathname);
                return;
            }

            if (error === 'not_admin') {
                showAlert('Email này không có quyền truy cập. Vui lòng liên hệ quản trị viên!', 'error');
                window.history.replaceState({}, document.title, window.location.pathname);
                return;
            }

            if (error === 'unauthorized') {
                showAlert('Vui lòng đăng nhập để tiếp tục', 'error');
                window.history.replaceState({}, document.title, window.location.pathname);
                return;
            }

            if (error === 'google_auth_failed') {
                showAlert('Đăng nhập Google thất bại. Vui lòng thử lại!', 'error');
                window.history.replaceState({}, document.title, window.location.pathname);
                return;
            }

            if (error) {
                showAlert('Có lỗi xảy ra. Vui lòng thử lại!', 'error');
                window.history.replaceState({}, document.title, window.location.pathname);
                return;
            }

            if (loginSuccess === 'success') {
                showAlert('Đăng nhập thành công! Đang chuyển hướng...', 'success');
                
                // Chuyển đến dashboard sau 500ms
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 500);
            }
        });

        async function handleStaffLogin(e) {
            e.preventDefault();
            const usernameInput = document.getElementById('username').value;
            const passwordInput = document.getElementById('password').value;
            const btn = document.getElementById('btnStaffLogin');

            try {
                btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Đang xử lý...';
                btn.disabled = true;

                const response = await fetch('http://localhost:3000/api/staff/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tai_khoan: usernameInput, mat_khau: passwordInput })
                });

                const data = await response.json();

                if (data.success) {
                    showAlert('Chế độ nhân viên/quản lý đăng nhập thành công!', 'success');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 500);
                } else {
                    showAlert(data.message || 'Tài khoản hoặc mật khẩu không đúng', 'error');
                }
            } catch (err) {
                console.error(err);
                showAlert('Lỗi kết nối máy chủ. Vui lòng thử lại!', 'error');
            } finally {
                btn.innerHTML = '<span>Đăng nhập hệ thống</span>';
                btn.disabled = false;
            }
        }
