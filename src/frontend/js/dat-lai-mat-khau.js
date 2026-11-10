/* ==== Script 1 (tách từ /dat-lai-mat-khau/) ==== */
const API_URL = 'http://localhost:3000/api/auth';

        // Kiểm tra xem có thông tin reset không
        window.addEventListener('DOMContentLoaded', function() {
            const resetEmail = sessionStorage.getItem('reset_email');
            const resetCode = sessionStorage.getItem('reset_code');

            if (!resetEmail || !resetCode) {
                showNotification('Phiên làm việc đã hết hạn. Vui lòng thử lại!', 'error');
                setTimeout(() => {
                    window.location.href = '/quen-mat-khau/';
                }, 2000);
            }
        });

        // Toggle hiển thị mật khẩu
        function togglePassword(inputId, button) {
            const input = document.getElementById(inputId);
            const icon = button.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }

        // Xử lý form đặt lại mật khẩu
        document.getElementById('reset-password-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const submitBtn = document.getElementById('submit-btn');

            // Validate
            if (newPassword !== confirmPassword) {
                showNotification('Mật khẩu xác nhận không khớp!', 'error');
                return;
            }

            if (newPassword.length < 6) {
                showNotification('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
                return;
            }

            // Kiểm tra có chữ cái
            if (!/[A-Za-z]/.test(newPassword)) {
                showNotification('Mật khẩu phải chứa ít nhất 1 chữ cái!', 'error');
                return;
            }

            // Kiểm tra có số
            if (!/[0-9]/.test(newPassword)) {
                showNotification('Mật khẩu phải chứa ít nhất 1 chữ số!', 'error');
                return;
            }

            // Lấy thông tin từ sessionStorage
            const resetEmail = sessionStorage.getItem('reset_email');
            const resetCode = sessionStorage.getItem('reset_code');

            if (!resetEmail || !resetCode) {
                showNotification('Phiên làm việc đã hết hạn!', 'error');
                setTimeout(() => {
                    window.location.href = '/quen-mat-khau/';
                }, 2000);
                return;
            }

            // Disable button và hiển thị loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Đang xử lý...';

            try {
                const response = await fetch(`${API_URL}/reset-password`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: resetEmail,
                        ma_code: resetCode,
                        mat_khau_moi: newPassword
                    })
                });

                const data = await response.json();

                if (data.success) {
                    showNotification(data.message, 'success');
                    
                    // Xóa thông tin trong sessionStorage
                    sessionStorage.removeItem('reset_email');
                    sessionStorage.removeItem('reset_code');
                    
                    // Chuyển hướng về trang đăng nhập
                    setTimeout(() => {
                        window.location.href = '/dang-nhap/';
                    }, 2000);
                } else {
                    showNotification(data.message || 'Có lỗi xảy ra!', 'error');
                }
            } catch (error) {
                console.error('Lỗi:', error);
                showNotification('Không thể kết nối đến server!', 'error');
            } finally {
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i> Đặt lại mật khẩu';
            }
        });

        // Thêm sự kiện kiểm tra password match khi gõ
        document.getElementById('confirm-password').addEventListener('input', function() {
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = this.value;
            
            if (confirmPassword && newPassword !== confirmPassword) {
                this.setCustomValidity('Mật khẩu không khớp');
                this.classList.add('border-red-500');
            } else {
                this.setCustomValidity('');
                this.classList.remove('border-red-500');
            }
        });
