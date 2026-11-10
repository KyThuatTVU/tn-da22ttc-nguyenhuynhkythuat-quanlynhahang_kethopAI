/* ==== Script 1 (tách từ /staff/login/) ==== */
// Toggle password visibility
        function togglePassword() {
            const passwordInput = document.getElementById('password');
            const eyeIcon = document.getElementById('eyeIcon');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeIcon.classList.remove('fa-eye');
                eyeIcon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                eyeIcon.classList.remove('fa-eye-slash');
                eyeIcon.classList.add('fa-eye');
            }
        }

        // Show alert
        function showAlert(message, type = 'error') {
            const alert = document.getElementById('alert');
            alert.className = `mt-6 p-4 rounded-xl ${type === 'success' ? 'bg-green-100 text-green-800 border-2 border-green-300' : 'bg-red-100 text-red-800 border-2 border-red-300'}`;
            alert.innerHTML = `
                <div class="flex items-center gap-2">
                    <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                    <span class="font-semibold">${message}</span>
                </div>
            `;
            alert.classList.remove('hidden');

            setTimeout(() => {
                alert.classList.add('hidden');
            }, 5000);
        }

        // Handle login
        async function handleLogin(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const btn = document.getElementById('btnLogin');

            try {
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Đang xử lý...';

                const response = await fetch('http://localhost:3000/api/staff/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        tai_khoan: username, 
                        mat_khau: password 
                    })
                });

                const data = await response.json();

                if (data.success) {
                    showAlert('Đăng nhập thành công! Đang chuyển hướng...', 'success');
                    
                    // NOTE: Đã tắt chức năng xóa session Admin để tránh văng phiên đăng nhập khi dùng chung trình duyệt
                    /* 
                    try {
                        // Gọi API xóa hoàn toàn session Admin (nếu đang tồn tại) để tránh xung đột
                        // Vì bên trang admin-layout, Session Admin có mức độ ưu tiên cao hơn LocalStorage Staff
                        await fetch('http://localhost:3000/api/admin-auth/logout', {
                            method: 'POST',
                            credentials: 'include'
                        });
                        // Xóa luôn cookie ở trình duyệt cho chắc
                        document.cookie = 'admin.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    } catch(e) { console.log('Không clear được admin session', e); }
                    */

                    // Lưu thông tin vào localStorage
                    sessionStorage.setItem('staff_user', JSON.stringify(data.data));
                    
                    // Lấy vai trò
                    const role = data.data?.vai_tro?.toLowerCase() || 'waiter';
                    
                    // Chuyển hướng ngay lập tức - tất cả vai trò vào giao diện admin
                    setTimeout(() => {
                        if (role === 'manager') {
                            window.location.href = '/admin/dashboard/';
                        } else {
                            // Waiter, kitchen, cashier → trang đơn hàng
                            window.location.href = '/admin/orders/';
                        }
                    }, 500);
                } else {
                    showAlert(data.message || 'Tài khoản hoặc mật khẩu không đúng!', 'error');
                }
            } catch (err) {
                console.error('Login error:', err);
                showAlert('Lỗi kết nối máy chủ. Vui lòng thử lại!', 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>Đăng nhập';
            }
        }

        // Check if already logged in
        function checkSession() {
            const staffUser = sessionStorage.getItem('staff_user');
            if (staffUser) {
                try {
                    const user = JSON.parse(staffUser);
                    const role = user.vai_tro?.toLowerCase() || 'waiter';
                    
                    // Đã đăng nhập, chuyển hướng
                    if (role === 'manager') {
                        window.location.href = '/admin/dashboard/';
                    } else {
                        window.location.href = '/admin/orders/';
                    }
                } catch (err) {
                    sessionStorage.removeItem('staff_user');
                }
            }
        }

        // Check session on load
        checkSession();
