/* ==== Script 1 (tách từ /xac-thuc-email/) ==== */
// Get email from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get('email');

        if (!email) {
            window.location.href = '/dang-ky/';
        }

        document.getElementById('display-email').textContent = email;

        // Auto-focus and move to next input
        const codeInputs = document.querySelectorAll('.code-input');
        
        codeInputs.forEach((input, index) => {
            input.addEventListener('input', function(e) {
                if (this.value.length === 1) {
                    this.classList.add('filled');
                    if (index < codeInputs.length - 1) {
                        codeInputs[index + 1].focus();
                    }
                } else {
                    this.classList.remove('filled');
                }
            });

            input.addEventListener('keydown', function(e) {
                if (e.key === 'Backspace' && this.value === '' && index > 0) {
                    codeInputs[index - 1].focus();
                }
            });

            input.addEventListener('paste', function(e) {
                e.preventDefault();
                const pastedData = e.clipboardData.getData('text').slice(0, 6);
                pastedData.split('').forEach((char, i) => {
                    if (codeInputs[i]) {
                        codeInputs[i].value = char;
                        codeInputs[i].classList.add('filled');
                    }
                });
                if (pastedData.length === 6) {
                    codeInputs[5].focus();
                }
            });
        });

        // Focus first input
        codeInputs[0].focus();

        // Timer countdown
        let timeLeft = 600; // 10 minutes in seconds
        const timerElement = document.getElementById('timer');
        
        const countdown = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                clearInterval(countdown);
                showNotification('Mã xác thực đã hết hạn. Vui lòng gửi lại mã mới.', 'error');
            }
        }, 1000);

        // Form submit
        document.getElementById('verification-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonHTML = submitButton.innerHTML;
            
            // Get verification code
            const code = Array.from(codeInputs).map(input => input.value).join('');
            
            if (code.length !== 6) {
                showNotification('Vui lòng nhập đầy đủ 6 số', 'error');
                return;
            }
            
            // Set loading state
            setLoadingButton(submitButton, true);
            
            try {
                const response = await fetch('http://localhost:3000/api/auth/verify-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, ma_code: code })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    clearInterval(countdown);
                    saveUserData(result.data);
                    showNotification('Xác thực thành công! Đang chuyển hướng...', 'success');
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1500);
                } else {
                    showNotification(result.message || 'Mã xác thực không đúng', 'error');
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonHTML;
                }
            } catch (error) {
                console.error('Lỗi xác thực:', error);
                showNotification('Không thể kết nối đến server', 'error');
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonHTML;
            }
        });

        // Resend code
        let resendCooldown = 0;
        const resendBtn = document.getElementById('resend-btn');
        
        document.getElementById('resend-btn').addEventListener('click', async function() {
            if (resendCooldown > 0) return;
            
            this.disabled = true;
            
            try {
                const response = await fetch('http://localhost:3000/api/auth/resend-verification', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification('Mã xác thực mới đã được gửi!', 'success');
                    
                    // Reset timer
                    timeLeft = 600;
                    
                    // Cooldown 60 seconds
                    resendCooldown = 60;
                    const cooldownInterval = setInterval(() => {
                        resendCooldown--;
                        resendBtn.textContent = `Gửi lại (${resendCooldown}s)`;
                        if (resendCooldown <= 0) {
                            clearInterval(cooldownInterval);
                            resendBtn.textContent = 'Gửi lại';
                            resendBtn.disabled = false;
                        }
                    }, 1000);
                } else {
                    showNotification(result.message || 'Không thể gửi lại mã', 'error');
                    this.disabled = false;
                }
            } catch (error) {
                console.error('Lỗi gửi lại mã:', error);
                showNotification('Không thể kết nối đến server', 'error');
                this.disabled = false;
            }
        });
