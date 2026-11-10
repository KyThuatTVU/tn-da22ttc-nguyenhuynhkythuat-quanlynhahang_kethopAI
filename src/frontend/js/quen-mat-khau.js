/* ==== Script 1 (tách từ quen-mat-khau.html) ==== */
const API_URL = 'http://localhost:3000/api/auth';
        let userEmail = '';

        // Form gửi email
        document.getElementById('forgot-password-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const submitBtn = document.getElementById('submit-btn');
            
            if (!email) {
                showNotification('Vui lòng nhập email!', 'error');
                return;
            }

            // Disable button và hiển thị loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Đang gửi...</span>';
            submitBtn.style.cssText = 'display: flex !important; visibility: visible !important; opacity: 1 !important; align-items: center; justify-content: center; gap: 0.5rem;';
            submitBtn.className = 'w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4 rounded-lg font-medium text-base transition duration-200 shadow-lg';

            try {
                const response = await fetch(`${API_URL}/forgot-password`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();

                if (data.success) {
                    userEmail = email;
                    showNotification(data.message, 'success');
                    
                    // Ẩn form email, hiện form nhập mã
                    document.getElementById('forgot-password-form').classList.add('hidden');
                    document.getElementById('verify-code-form').classList.remove('hidden');
                    
                    // Focus vào input mã
                    document.getElementById('verify-code').focus();
                } else {
                    showNotification(data.message || 'Có lỗi xảy ra!', 'error');
                }
            } catch (error) {
                console.error('Lỗi:', error);
                showNotification('Không thể kết nối đến server! Vui lòng kiểm tra backend đang chạy.', 'error');
            } finally {
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i><span>Gửi mã xác thực</span>';
                submitBtn.style.cssText = 'display: flex !important; visibility: visible !important; opacity: 1 !important; align-items: center; justify-content: center; gap: 0.5rem;';
                submitBtn.className = 'w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4 rounded-lg font-medium text-base hover:from-orange-700 hover:to-red-700 transition duration-200 shadow-lg hover:shadow-xl';
            }
        });

        // Form xác thực mã
        document.getElementById('verify-code-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const verifyCode = document.getElementById('verify-code').value.trim();
            const verifyBtn = document.getElementById('verify-btn');
            
            if (!verifyCode || verifyCode.length !== 6) {
                showNotification('Vui lòng nhập đúng mã 6 số!', 'error');
                return;
            }

            // Disable button và hiển thị loading
            verifyBtn.disabled = true;
            verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Đang xác thực...</span>';
            verifyBtn.style.cssText = 'display: flex !important; visibility: visible !important; opacity: 1 !important; align-items: center; justify-content: center; gap: 0.5rem;';
            verifyBtn.className = 'w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4 rounded-lg font-medium text-base transition duration-200 shadow-lg';

            try {
                const response = await fetch(`${API_URL}/verify-reset-code`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        email: userEmail,
                        ma_code: verifyCode 
                    })
                });

                const data = await response.json();

                if (data.success) {
                    showNotification('Xác thực thành công! Đang chuyển hướng...', 'success');
                    
                    // Lưu email và mã vào sessionStorage để sử dụng ở trang đặt lại mật khẩu
                    sessionStorage.setItem('reset_email', userEmail);
                    sessionStorage.setItem('reset_code', verifyCode);
                    
                    setTimeout(() => {
                        window.location.href = 'dat-lai-mat-khau.html';
                    }, 1500);
                } else {
                    showNotification(data.message || 'Mã xác thực không đúng!', 'error');
                }
            } catch (error) {
                console.error('Lỗi:', error);
                showNotification('Không thể kết nối đến server! Vui lòng kiểm tra backend đang chạy.', 'error');
            } finally {
                // Re-enable button
                verifyBtn.disabled = false;
                verifyBtn.innerHTML = '<i class="fas fa-check"></i><span>Xác thực mã</span>';
                verifyBtn.style.cssText = 'display: flex !important; visibility: visible !important; opacity: 1 !important; align-items: center; justify-content: center; gap: 0.5rem;';
                verifyBtn.className = 'w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4 rounded-lg font-medium text-base hover:from-orange-700 hover:to-red-700 transition duration-200 shadow-lg hover:shadow-xl';
            }
        });

        // Nút quay lại nhập email
        document.getElementById('back-to-email').addEventListener('click', function() {
            document.getElementById('verify-code-form').classList.add('hidden');
            document.getElementById('forgot-password-form').classList.remove('hidden');
            document.getElementById('verify-code').value = '';
        });

        // Chỉ cho phép nhập số trong input mã xác thực
        document.getElementById('verify-code').addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
