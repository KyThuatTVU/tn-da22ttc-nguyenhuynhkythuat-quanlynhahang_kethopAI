/* ==== Script 1 (tách từ /lien-he/) ==== */
const API_URL = 'http://localhost:3000/api';
        let selectedFiles = [];
        
        // Khởi tạo FormDraftManager khi trang tải
        document.addEventListener('DOMContentLoaded', () => {
            window.contactDraftManager = new FormDraftManager('contact-form');
        });

        // Preview images
        function previewImages(input) {
            const container = document.getElementById('image-preview-container');
            const errorEl = document.getElementById('image-error');
            errorEl.classList.add('hidden');
            
            if (input.files.length > 5) {
                errorEl.textContent = 'Chỉ được chọn tối đa 5 ảnh!';
                errorEl.classList.remove('hidden');
                input.value = '';
                return;
            }
            
            selectedFiles = Array.from(input.files);
            container.innerHTML = '';
            container.classList.remove('hidden');
            
            selectedFiles.forEach((file, index) => {
                if (file.size > 5 * 1024 * 1024) {
                    errorEl.textContent = `Ảnh "${file.name}" vượt quá 5MB!`;
                    errorEl.classList.remove('hidden');
                    return;
                }
                const reader = new FileReader();
                reader.onload = (e) => {
                    const div = document.createElement('div');
                    div.className = 'relative group';
                    div.innerHTML = `
                        <img src="${e.target.result}" class="w-full h-20 object-cover rounded-lg">
                        <button type="button" onclick="removeImage(${index})" class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"><i class="fas fa-times"></i></button>
                    `;
                    container.appendChild(div);
                };
                reader.readAsDataURL(file);
            });
        }

        function removeImage(index) {
            selectedFiles.splice(index, 1);
            const container = document.getElementById('image-preview-container');
            container.children[index].remove();
            if (selectedFiles.length === 0) container.classList.add('hidden');
        }

        // Form submission
        document.getElementById('contact-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submit-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Đang gửi...';
            submitBtn.disabled = true;
            
            try {
                const formData = new FormData();
                const inputs = this.querySelectorAll('input, select, textarea');
                
                // Map form fields
                const fieldMap = {
                    0: 'ho_ten',
                    1: 'so_dien_thoai', 
                    2: 'email',
                    3: 'tieu_de',
                    4: 'noi_dung'
                };
                
                inputs.forEach((input, index) => {
                    if (fieldMap[index] && input.value) {
                        formData.append(fieldMap[index], input.value);
                    }
                });
                
                // Add images
                selectedFiles.forEach(file => {
                    formData.append('hinh_anh', file);
                });
                
                const response = await fetch(`${API_URL}/contact`, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification('success', 'Gửi thành công!', 'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể.');
                    this.reset();
                    if (window.contactDraftManager) {
                        window.contactDraftManager.clear();
                    }
                    selectedFiles = [];
                    document.getElementById('image-preview-container').innerHTML = '';
                    document.getElementById('image-preview-container').classList.add('hidden');
                } else {
                    showNotification('error', 'Có lỗi xảy ra!', result.message || 'Vui lòng thử lại sau.');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('error', 'Lỗi kết nối!', 'Không thể kết nối đến server.');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });

        function showNotification(type, title, message) {
            const notification = document.createElement('div');
            notification.className = 'fixed top-8 right-8 z-50 bg-white rounded-2xl shadow-2xl p-6 max-w-sm transform translate-x-0 transition-all duration-500';
            const iconClass = type === 'success' ? 'fa-check' : 'fa-exclamation-circle';
            const colorClass = type === 'success' ? 'from-green-400 to-green-600' : 'from-red-400 to-red-600';
            notification.innerHTML = `
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 bg-gradient-to-br ${colorClass} rounded-full flex items-center justify-center flex-shrink-0">
                        <i class="fas ${iconClass} text-white text-xl"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-lg text-gray-800 mb-1">${title}</h4>
                        <p class="text-gray-600 text-sm">${message}</p>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()" class="text-gray-400 hover:text-gray-600 transition">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            document.body.appendChild(notification);
            setTimeout(() => { notification.style.transform = 'translateX(0)'; }, 100);
            setTimeout(() => { notification.style.transform = 'translateX(400px)'; setTimeout(() => notification.remove(), 500); }, 5000);
        }
        
        // Animate elements on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observe all cards
        document.querySelectorAll('.card-hover').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.8s ease-out';
            observer.observe(el);
        });

/* ==== Script 2 (tách từ /lien-he/) ==== */
// Scroll to Top functionality
        (function() {
            const scrollBtn = document.getElementById('back-to-top');
            if (!scrollBtn) return;
            
            function checkScroll() {
                if (window.pageYOffset > 300) {
                    scrollBtn.style.opacity = '1';
                    scrollBtn.style.visibility = 'visible';
                } else {
                    scrollBtn.style.opacity = '0';
                    scrollBtn.style.visibility = 'hidden';
                }
            }
            
            window.addEventListener('scroll', checkScroll);
            checkScroll();
            
            scrollBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        })();
