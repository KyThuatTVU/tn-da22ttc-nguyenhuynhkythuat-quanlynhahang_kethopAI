/* ==== Script 1 (tách từ dang-ky.html) ==== */
// Toggle password visibility
    function togglePassword(fieldId) {
      const field = document.getElementById(fieldId);
      const icon = document.getElementById(fieldId + '-icon');
      if (field && icon) {
        if (field.type === 'password') {
          field.type = 'text';
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
        } else {
          field.type = 'password';
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
        }
      }
    }

    // Đảm bảo DOM đã tải xong trước khi gắn sự kiện
    document.addEventListener('DOMContentLoaded', function() {
      const registerForm = document.getElementById("register-form");
      if (!registerForm) return;

      // Khởi tạo FormDraftManager
      window.registerDraftManager = new FormDraftManager('register-form');

      let uploadedAvatarPath = sessionStorage.getItem('tempAvatarPath') || null;
      let isSubmitting = false;
      let isUploading = false;

      // Restore preview from sessionStorage on page load
      if (uploadedAvatarPath && sessionStorage.getItem('tempAvatarPreview')) {
        const previewDiv = document.getElementById('avatar-preview');
        if (previewDiv) {
          previewDiv.innerHTML = sessionStorage.getItem('tempAvatarPreview');
          const uploadStatus = document.getElementById('upload-status');
          if (uploadStatus) {
            uploadStatus.textContent = '✓ Ảnh đã tải';
            uploadStatus.className = 'text-[10px] font-semibold mt-1 text-green-600';
            uploadStatus.classList.remove('hidden');
          }
        }
      }

      // Prevent page unload during upload
      window.addEventListener('beforeunload', function (e) {
        if (isUploading) {
          e.preventDefault();
          e.returnValue = 'Upload đang diễn ra, bạn có chắc muốn rời khỏi trang?';
          return e.returnValue;
        }
      });

      // Show/hide error message
      function showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorSpan = document.getElementById(fieldId + '-error');
        if (field) field.classList.add('input-error');
        if (field) field.classList.remove('input-success');
        if (errorSpan) {
          errorSpan.textContent = message;
          errorSpan.classList.remove('hidden');
        }
      }

      function clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        const errorSpan = document.getElementById(fieldId + '-error');
        if (field) field.classList.remove('input-error');
        if (field) field.classList.add('input-success');
        if (errorSpan) errorSpan.classList.add('hidden');
      }

      function resetFieldState(fieldId) {
        const field = document.getElementById(fieldId);
        const errorSpan = document.getElementById(fieldId + '-error');
        if (field) field.classList.remove('input-error', 'input-success');
        if (errorSpan) errorSpan.classList.add('hidden');
      }

      // Real-time validation
      const emailField = document.getElementById('email');
      if (emailField) {
        emailField.addEventListener('blur', function () {
          const email = this.value.trim();
          if (email && !validateEmail(email)) {
            showFieldError('email', 'Email không hợp lệ');
          } else if (email) {
            clearFieldError('email');
          }
        });
      }

      const phoneField = document.getElementById('so_dien_thoai');
      if (phoneField) {
        phoneField.addEventListener('blur', function () {
          const phone = this.value.trim();
          if (phone && !validatePhone(phone)) {
            showFieldError('so_dien_thoai', 'Số điện thoại phải có 10 số và bắt đầu bằng 03, 05, 07, 08, 09');
          } else if (phone) {
            clearFieldError('so_dien_thoai');
          }
        });
      }

      const passwordField = document.getElementById('mat_khau');
      if (passwordField) {
        passwordField.addEventListener('blur', function () {
          const password = this.value;
          if (password) {
            const validation = validatePassword(password);
            if (!validation.valid) {
              showFieldError('mat_khau', validation.message);
            } else {
              clearFieldError('mat_khau');
            }
          }
        });
      }

      const confirmPasswordField = document.getElementById('xac_nhan_mat_khau');
      if (confirmPasswordField) {
        confirmPasswordField.addEventListener('blur', function () {
          const password = document.getElementById('mat_khau').value;
          const confirmPassword = this.value;
          if (confirmPassword) {
            if (password !== confirmPassword) {
              showFieldError('xac_nhan_mat_khau', 'Mật khẩu xác nhận không khớp');
            } else {
              clearFieldError('xac_nhan_mat_khau');
            }
          }
        });
      }

      // Clear errors on input
      ['email', 'so_dien_thoai', 'mat_khau', 'xac_nhan_mat_khau'].forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
          field.addEventListener('input', function () {
            resetFieldState(fieldId);
          });
        }
      });

      // Xử lý chọn ảnh
      const avatarInput = document.getElementById("avatar-input");
      if (avatarInput) {
        avatarInput.addEventListener("change", async function (e) {
          const file = e.target.files[0];
          if (!file) return;

          // Validate file type
          if (!file.type.startsWith('image/')) {
            showNotification('Vui lòng chọn file ảnh', 'error');
            this.value = '';
            return;
          }

          // Validate file size (5MB)
          if (file.size > 5 * 1024 * 1024) {
            showNotification('Kích thước ảnh không được vượt quá 5MB', 'error');
            this.value = '';
            return;
          }

          // Show preview
          const reader = new FileReader();
          reader.onload = function (e) {
            const previewDiv = document.getElementById('avatar-preview');
            if (previewDiv) {
              previewDiv.innerHTML = `<img src="${e.target.result}" alt="Preview" class="w-full h-full object-cover rounded-full">`;
            }
          };
          reader.readAsDataURL(file);

          // Upload to server
          isUploading = true;
          const uploadStatus = document.getElementById('upload-status');
          if (uploadStatus) {
            uploadStatus.textContent = 'Đang tải...';
            uploadStatus.className = 'text-[10px] font-semibold mt-1 text-blue-600';
            uploadStatus.classList.remove('hidden');
          }

          const formData = new FormData();
          formData.append('avatar', file);

          try {
            const response = await fetch('http://localhost:3000/api/auth/upload-avatar', {
              method: 'POST',
              body: formData
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
              uploadedAvatarPath = result.data.anh_dai_dien;
              sessionStorage.setItem('tempAvatarPath', uploadedAvatarPath);
              const previewDiv = document.getElementById('avatar-preview');
              if (previewDiv) {
                sessionStorage.setItem('tempAvatarPreview', previewDiv.innerHTML);
              }

              if (uploadStatus) {
                uploadStatus.textContent = '✓ Tải thành công';
                uploadStatus.className = 'text-[10px] font-semibold mt-1 text-green-600';
              }
              showNotification('Tải ảnh thành công!', 'success');
            } else {
              throw new Error(result.message || 'Upload thất bại');
            }
          } catch (error) {
            const uploadStatus = document.getElementById('upload-status');
            if (uploadStatus) {
              uploadStatus.textContent = '✗ Tải thất bại';
              uploadStatus.className = 'text-[10px] font-semibold mt-1 text-red-600';
            }
            showNotification('Lỗi tải ảnh: ' + error.message, 'error');
            uploadedAvatarPath = null;

            const previewDiv = document.getElementById('avatar-preview');
            if (previewDiv) {
              previewDiv.innerHTML = '<i class="fas fa-user text-2xl sm:text-3xl text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></i>';
            }
          } finally {
            isUploading = false;
          }
        });
      }

      // Validation functions
      function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
      }

      function validatePhone(phone) {
        if (!phone) return true;
        const re = /^(0[3|5|7|8|9])+([0-9]{8})$/;
        return re.test(phone);
      }

      function validatePassword(password) {
        if (password.length < 6) {
          return { valid: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' };
        }
        if (!/[A-Za-z]/.test(password)) {
          return { valid: false, message: 'Mật khẩu phải chứa ít nhất 1 chữ cái' };
        }
        if (!/[0-9]/.test(password)) {
          return { valid: false, message: 'Mật khẩu phải chứa ít nhất 1 chữ số' };
        }
        return { valid: true };
      }

      registerForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (isSubmitting) return false;
        if (isUploading) {
          showNotification('Vui lòng đợi ảnh tải xong', 'error');
          return false;
        }

        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';

        // Get form data
        const ten_nguoi_dung = document.getElementById("ten_nguoi_dung").value.trim();
        const email = document.getElementById("email").value.trim();
        const so_dien_thoai = document.getElementById("so_dien_thoai").value.trim();
        const dia_chi = document.getElementById("dia_chi").value.trim();
        const gioi_tinh = document.getElementById("gioi_tinh").value;
        const mat_khau = document.getElementById("mat_khau").value;
        const xac_nhan_mat_khau = document.getElementById("xac_nhan_mat_khau").value;

        // Client-side validation
        if (!ten_nguoi_dung || ten_nguoi_dung.length < 2) {
          showNotification('Tên phải có ít nhất 2 ký tự', 'error');
          return false;
        }

        if (!validateEmail(email)) {
          showNotification('Email không hợp lệ', 'error');
          return false;
        }

        if (so_dien_thoai && !validatePhone(so_dien_thoai)) {
          showNotification('Số điện thoại không hợp lệ', 'error');
          return false;
        }

        const passwordValidation = validatePassword(mat_khau);
        if (!passwordValidation.valid) {
          showNotification(passwordValidation.message, 'error');
          return false;
        }

        if (mat_khau !== xac_nhan_mat_khau) {
          showNotification('Mật khẩu xác nhận không khớp', 'error');
          return false;
        }

        isSubmitting = true;
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Đang xử lý...`;
        }

        const formData = {
          ten_nguoi_dung,
          email,
          so_dien_thoai: so_dien_thoai || null,
          dia_chi: dia_chi || null,
          gioi_tinh,
          mat_khau,
          anh_dai_dien: uploadedAvatarPath,
        };

        try {
          const response = await fetch("http://localhost:3000/api/auth/send-verification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });

          const result = await response.json();

          if (result.success) {
            sessionStorage.removeItem('tempAvatarPath');
            sessionStorage.removeItem('tempAvatarPreview');
            if (window.registerDraftManager) window.registerDraftManager.clear();

            showNotification('Mã xác thực đã được gửi đến email của bạn!', 'success');

            setTimeout(() => {
              window.location.href = `xac-thuc-email.html?email=${encodeURIComponent(formData.email)}`;
            }, 1500);
          } else {
            showNotification(result.message || 'Đăng ký thất bại', 'error');
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalBtnHTML;
            }
            isSubmitting = false;
          }
        } catch (error) {
          showNotification('Không thể kết nối đến server. Vui lòng thử lại sau.', 'error');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
          }
          isSubmitting = false;
        }

        return false;
      });

      // Xử lý click nút đăng ký Google
      const googleRegisterBtn = document.getElementById('google-register-btn');
      if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener('click', function() {
          window.location.href = 'http://localhost:3000/api/auth/google';
        });
      }
    });
