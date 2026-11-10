/* ==== Script 1 (tách từ tai-khoan.html) ==== */
// API Configuration
        if (typeof window.API_URL === 'undefined') {
            window.API_URL = 'http://localhost:3000/api';
        }

/* ==== Script 2 (tách từ tai-khoan.html) ==== */
let isEditMode = false;
        let originalData = {};

        // Check login
        if (!isLoggedIn()) {
            window.location.href = 'dang-nhap.html';
        }

        // Load user data
        async function loadUserData() {
            try {
                const user = await getCurrentUser();
                if (!user) {
                    window.location.href = 'dang-nhap.html';
                    return;
                }

                // Display in sidebar
                document.getElementById('sidebar-username').textContent = user.ten_nguoi_dung;
                document.getElementById('sidebar-email').textContent = user.email;

                // Display avatar - sử dụng hàm getAvatarUrl để xử lý nhất quán
                const avatarDisplay = document.getElementById('avatar-display');
                const avatarUrl = typeof getAvatarUrl === 'function' 
                    ? getAvatarUrl(user.anh_dai_dien)
                    : (user.anh_dai_dien && user.anh_dai_dien.startsWith('http') 
                        ? user.anh_dai_dien 
                        : `${window.API_URL.replace('/api', '')}${user.anh_dai_dien || ''}`);
                
                if (avatarUrl) {
                    console.log('🖼️ Avatar URL (tai-khoan):', avatarUrl);
                    // Thêm referrerpolicy để tránh bị chặn ảnh từ Google
                    avatarDisplay.innerHTML = `<img src="${avatarUrl}" alt="${user.ten_nguoi_dung}" class="w-full h-full object-cover rounded-full" referrerpolicy="no-referrer" crossorigin="anonymous" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-user\\'></i>'">`;
                } else {
                    console.log('⚠️ No avatar found for user (tai-khoan)');
                }

                // Fill form
                document.getElementById('ten_nguoi_dung').value = user.ten_nguoi_dung || '';
                document.getElementById('email').value = user.email || '';
                document.getElementById('so_dien_thoai').value = user.so_dien_thoai || '';
                document.getElementById('dia_chi').value = user.dia_chi || '';
                document.getElementById('gioi_tinh').value = user.gioi_tinh || 'khac';

                // Store original data
                originalData = { ...user };
            } catch (error) {
                console.error('Error loading user data:', error);
                showNotification('Không thể tải thông tin người dùng', 'error');
            }
        }

        // Show tab
        function showTab(tabName, event) {
            // Hide all tabs
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.add('hidden');
            });

            // Remove active class from all buttons
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('bg-orange-50', 'text-orange-600', 'font-semibold');
                btn.classList.add('text-gray-700');
            });

            // Show selected tab
            document.getElementById(`${tabName}-tab`).classList.remove('hidden');

            // Add active class to clicked button
            if (event) {
                const button = event.currentTarget;
                button.classList.add('bg-orange-50', 'text-orange-600', 'font-semibold');
                button.classList.remove('text-gray-700');
            }
        }

        // Toggle edit mode
        function toggleEditMode() {
            isEditMode = !isEditMode;
            const fields = ['ten_nguoi_dung', 'so_dien_thoai', 'dia_chi', 'gioi_tinh'];
            
            fields.forEach(field => {
                document.getElementById(field).disabled = !isEditMode;
            });

            document.getElementById('save-buttons').classList.toggle('hidden', !isEditMode);
            document.getElementById('edit-profile-btn').classList.toggle('hidden', isEditMode);
        }

        // Cancel edit
        function cancelEdit() {
            toggleEditMode();
            // Restore original data
            document.getElementById('ten_nguoi_dung').value = originalData.ten_nguoi_dung || '';
            document.getElementById('so_dien_thoai').value = originalData.so_dien_thoai || '';
            document.getElementById('dia_chi').value = originalData.dia_chi || '';
            document.getElementById('gioi_tinh').value = originalData.gioi_tinh || 'khac';
        }

        // Toggle password visibility
        function togglePassword(fieldId) {
            const field = document.getElementById(fieldId);
            const icon = event.target.closest('button').querySelector('i');
            
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

        // Handle profile form submit
        document.getElementById('profile-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                ten_nguoi_dung: document.getElementById('ten_nguoi_dung').value,
                so_dien_thoai: document.getElementById('so_dien_thoai').value,
                dia_chi: document.getElementById('dia_chi').value,
                gioi_tinh: document.getElementById('gioi_tinh').value
            };

            const result = await updateUserInfo(formData);
            
            if (result.success) {
                // Update localStorage
                const user = getUserData();
                Object.assign(user, formData);
                saveUserData(user);
                
                // Reload data
                await loadUserData();
                toggleEditMode();
                
                // Update navbar
                if (typeof updateUserMenu === 'function') {
                    updateUserMenu();
                }
            }
        });

        // Handle password form submit
        document.getElementById('password-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const mat_khau_cu = document.getElementById('mat_khau_cu').value;
            const mat_khau_moi = document.getElementById('mat_khau_moi').value;
            const xac_nhan = document.getElementById('xac_nhan_mat_khau').value;

            // Validate
            if (mat_khau_moi !== xac_nhan) {
                showNotification('Mật khẩu xác nhận không khớp', 'error');
                return;
            }

            if (mat_khau_moi.length < 6) {
                showNotification('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
                return;
            }

            const result = await changePassword(mat_khau_cu, mat_khau_moi);
            
            if (result.success) {
                // Clear form
                document.getElementById('password-form').reset();
            }
        });

        // Handle avatar upload
        document.getElementById('avatar-input').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                showNotification('File ảnh quá lớn (tối đa 5MB)', 'error');
                e.target.value = '';
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                showNotification('Vui lòng chọn file ảnh', 'error');
                e.target.value = '';
                return;
            }

            // Show loading
            const uploadLoading = document.getElementById('upload-loading');
            uploadLoading.classList.remove('hidden');

            try {
                const token = localStorage.getItem('token');
                const formData = new FormData();
                formData.append('avatar', file);

                const response = await fetch(`${window.API_URL}/auth/upload-avatar`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    // Update avatar path
                    const updateResult = await updateUserInfo({
                        anh_dai_dien: result.data.anh_dai_dien
                    });

                    if (updateResult.success) {
                        // Update localStorage
                        const user = getUserData();
                        user.anh_dai_dien = result.data.anh_dai_dien;
                        saveUserData(user);

                        showNotification('Cập nhật ảnh đại diện thành công!', 'success');
                        
                        // Reload page to show new avatar
                        setTimeout(() => {
                            location.reload();
                        }, 1000);
                    }
                } else {
                    showNotification(result.message || 'Upload ảnh thất bại', 'error');
                    uploadLoading.classList.add('hidden');
                }
            } catch (error) {
                console.error('Upload error:', error);
                showNotification('Lỗi khi upload ảnh', 'error');
                uploadLoading.classList.add('hidden');
            }
            
            e.target.value = '';
        });

        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const sidebarMenu = document.getElementById('sidebar-menu');
        const menuChevron = document.getElementById('menu-chevron');

        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                sidebarMenu.classList.toggle('hidden');
                sidebarMenu.classList.toggle('block');
                menuChevron.classList.toggle('rotate-180');
                
                // Add smooth animation
                if (!sidebarMenu.classList.contains('hidden')) {
                    sidebarMenu.style.animation = 'slideDown 0.3s ease-out';
                }
            });
        }

        // Close mobile menu when tab is selected on mobile
        function showTabMobile(tabName, event) {
            showTab(tabName, event);
            
            // Close menu on mobile after selection
            if (window.innerWidth < 1024) {
                setTimeout(() => {
                    sidebarMenu.classList.add('hidden');
                    sidebarMenu.classList.remove('block');
                    menuChevron.classList.remove('rotate-180');
                }, 100);
            }
        }

        // Update tab buttons to use mobile-friendly function on small screens
        document.querySelectorAll('.tab-button').forEach(button => {
            const originalOnclick = button.getAttribute('onclick');
            if (originalOnclick) {
                // Replace showTab with showTabMobile
                const newOnclick = originalOnclick.replace('showTab', 'showTabMobile');
                button.setAttribute('onclick', newOnclick);
            }
        });

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .tab-content {
                animation: fadeIn 0.3s ease-in;
            }

            /* Mobile optimizations */
            @media (max-width: 1023px) {
                #sidebar-menu {
                    position: relative !important;
                    top: 0 !important;
                }

                .tab-button {
                    font-size: 0.95rem;
                    padding: 0.875rem 1rem;
                }

                #avatar-display {
                    width: 80px !important;
                    height: 80px !important;
                }
            }

            /* Touch-friendly buttons on mobile */
            @media (max-width: 768px) {
                button, .tab-button, input[type="submit"] {
                    min-height: 44px;
                    touch-action: manipulation;
                }

                input, textarea, select {
                    font-size: 16px !important; /* Prevent zoom on iOS */
                }
            }

            /* Smooth scroll behavior */
            html {
                scroll-behavior: smooth;
            }

            /* Loading skeleton */
            .skeleton {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: loading 1.5s infinite;
            }

            @keyframes loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }

            /* Pull to refresh hint (optional) */
            .pull-refresh-hint {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(to bottom, rgba(234, 88, 12, 0.1), transparent);
                opacity: 0;
                transform: translateY(-100%);
                transition: all 0.3s ease;
                z-index: 40;
            }
        `;
        document.head.appendChild(style);

        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth >= 1024) {
                    // Show sidebar on desktop
                    sidebarMenu.classList.remove('hidden');
                    sidebarMenu.classList.add('block');
                } else {
                    // Hide sidebar on mobile
                    sidebarMenu.classList.add('hidden');
                    sidebarMenu.classList.remove('block');
                    menuChevron.classList.remove('rotate-180');
                }
            }, 250);
        });

        // Back to top button functionality
        const backToTopButton = document.getElementById('back-to-top');
        
        // Optimize scroll performance on mobile
        let ticking = false;
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            lastScrollY = window.scrollY;

            if (!ticking) {
                window.requestAnimationFrame(() => {
                    // Show/hide back to top button
                    if (backToTopButton) {
                        if (lastScrollY > 300) {
                            backToTopButton.style.opacity = '1';
                            backToTopButton.style.pointerEvents = 'auto';
                        } else {
                            backToTopButton.style.opacity = '0';
                            backToTopButton.style.pointerEvents = 'none';
                        }
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        // Back to top click handler
        if (backToTopButton) {
            backToTopButton.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                
                // Haptic feedback
                if ('vibrate' in navigator) {
                    navigator.vibrate(20);
                }
            });
        }

        // Handle orientation change on mobile
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                window.scrollTo(0, window.scrollY);
            }, 100);
        });

        // Add haptic feedback for touch devices (if supported)
        if ('vibrate' in navigator) {
            document.querySelectorAll('button, .tab-button').forEach(button => {
                button.addEventListener('click', () => {
                    navigator.vibrate(10); // Light haptic feedback
                });
            });
        }

        // Prevent double-tap zoom on buttons
        document.querySelectorAll('button').forEach(button => {
            let lastTap = 0;
            button.addEventListener('touchend', (e) => {
                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastTap;
                if (tapLength < 500 && tapLength > 0) {
                    e.preventDefault();
                }
                lastTap = currentTime;
            });
        });

        // Swipe gesture for mobile tab switching
        let touchStartX = 0;
        let touchEndX = 0;
        const tabContents = document.querySelectorAll('.tab-content');
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabs = ['profile', 'password', 'orders', 'reservations'];
        
        function getCurrentTabIndex() {
            for (let i = 0; i < tabs.length; i++) {
                if (!document.getElementById(`${tabs[i]}-tab`).classList.contains('hidden')) {
                    return i;
                }
            }
            return 0;
        }

        function switchToTab(index) {
            if (index >= 0 && index < tabs.length) {
                const tabButton = tabButtons[index];
                if (tabButton) {
                    tabButton.click();
                }
            }
        }

        // Add swipe detection on mobile
        if (window.innerWidth < 1024) {
            document.querySelector('.lg\\:col-span-3').addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            document.querySelector('.lg\\:col-span-3').addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, { passive: true });
        }

        function handleSwipe() {
            const swipeThreshold = 50;
            const difference = touchStartX - touchEndX;
            
            if (Math.abs(difference) > swipeThreshold) {
                const currentIndex = getCurrentTabIndex();
                
                if (difference > 0) {
                    // Swipe left - next tab
                    switchToTab(currentIndex + 1);
                } else {
                    // Swipe right - previous tab
                    switchToTab(currentIndex - 1);
                }
            }
        }

        // Add visual indicator for swipeable content on mobile
        if (window.innerWidth < 1024) {
            const style = document.createElement('div');
            style.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full text-xs opacity-0 pointer-events-none transition-opacity z-50';
            style.id = 'swipe-hint';
            style.innerHTML = '<i class="fas fa-hand-point-left mr-2"></i>Vuốt để chuyển tab<i class="fas fa-hand-point-right ml-2"></i>';
            document.body.appendChild(style);

            // Show hint briefly on first load
            setTimeout(() => {
                const hint = document.getElementById('swipe-hint');
                hint.style.opacity = '0.9';
                setTimeout(() => {
                    hint.style.opacity = '0';
                }, 3000);
            }, 1000);
        }

        // ===== NOTIFICATION HANDLING =====
        let allNotifications = [];
        let currentFilter = 'all';
        let notificationPage = 1;
        const notificationsPerPage = 20;

        // Load notifications for account page
        async function loadAccountNotifications() {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const response = await fetch(`http://localhost:3000/api/notifications?limit=100`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();

                if (result.success) {
                    allNotifications = result.data || [];
                    renderAccountNotifications();
                    updateNotificationBadge(result.unreadCount || 0);
                }
            } catch (error) {
                console.error('Error loading notifications:', error);
                document.getElementById('account-notifications-list').innerHTML = `
                    <div class="text-center py-12 text-gray-500">
                        <i class="fas fa-exclamation-circle text-4xl mb-3 opacity-30"></i>
                        <p>Không thể tải thông báo</p>
                    </div>
                `;
            }
        }

        // Filter notifications
        function filterNotifications(type) {
            currentFilter = type;
            notificationPage = 1;
            
            // Update filter buttons
            document.querySelectorAll('.notification-filter-btn').forEach(btn => {
                btn.classList.remove('bg-orange-50', 'text-orange-600');
                btn.classList.add('hover:bg-gray-100', 'text-gray-600');
            });
            event.target.classList.add('bg-orange-50', 'text-orange-600');
            event.target.classList.remove('hover:bg-gray-100', 'text-gray-600');
            
            renderAccountNotifications();
        }

        // Render notifications
        function renderAccountNotifications() {
            const container = document.getElementById('account-notifications-list');
            
            let filtered = allNotifications;
            if (currentFilter === 'unread') {
                filtered = allNotifications.filter(n => !n.da_doc);
            } else if (currentFilter !== 'all') {
                filtered = allNotifications.filter(n => n.loai === currentFilter);
            }

            if (filtered.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-12 text-gray-500">
                        <i class="fas fa-bell-slash text-4xl mb-3 opacity-30"></i>
                        <p>Không có thông báo</p>
                    </div>
                `;
                return;
            }

            const displayCount = notificationPage * notificationsPerPage;
            const toDisplay = filtered.slice(0, displayCount);

            container.innerHTML = toDisplay.map(notif => {
                const icon = getNotificationIcon(notif.loai);
                const timeAgo = getTimeAgo(notif.ngay_tao);
                const unreadClass = notif.da_doc ? '' : 'bg-orange-50 border-l-4 border-orange-500';

                return `
                    <div class="notification-item-account flex gap-3 p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition ${unreadClass}" 
                         data-id="${notif.ma_thong_bao}" 
                         data-link="${notif.duong_dan || ''}"
                         onclick="handleNotificationClick(${notif.ma_thong_bao}, '${notif.duong_dan || ''}')">
                        <div class="flex-shrink-0 w-12 h-12 rounded-full ${icon.bgColor} flex items-center justify-center">
                            <i class="${icon.icon} ${icon.textColor} text-lg"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="font-semibold text-gray-800 mb-1 ${notif.da_doc ? '' : 'font-bold'}">${notif.tieu_de}</h4>
                            <p class="text-sm text-gray-600 mb-2 line-clamp-2">${notif.noi_dung || ''}</p>
                            <div class="flex items-center gap-3 text-xs text-gray-400">
                                <span><i class="far fa-clock mr-1"></i>${timeAgo}</span>
                                ${!notif.da_doc ? '<span class="text-orange-600 font-medium"><i class="fas fa-circle mr-1" style="font-size: 6px;"></i>Mới</span>' : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            // Show/hide load more button
            const loadMoreBtn = document.getElementById('load-more-notifications');
            if (filtered.length > displayCount) {
                loadMoreBtn.classList.remove('hidden');
            } else {
                loadMoreBtn.classList.add('hidden');
            }
        }

        // Handle notification click
        async function handleNotificationClick(id, link) {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                await fetch(`http://localhost:3000/api/notifications/${id}/read`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // Update local data
                const notif = allNotifications.find(n => n.ma_thong_bao === id);
                if (notif) notif.da_doc = true;
                
                renderAccountNotifications();
                
                // Navigate if link exists
                if (link) {
                    window.location.href = link;
                }
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        }

        // Mark all as read
        document.getElementById('mark-all-read-account')?.addEventListener('click', async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                await fetch('http://localhost:3000/api/notifications/read-all', {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                allNotifications.forEach(n => n.da_doc = true);
                renderAccountNotifications();
                updateNotificationBadge(0);
                showNotification('Đã đánh dấu tất cả đã đọc', 'success');
            } catch (error) {
                console.error('Error marking all as read:', error);
            }
        });

        // Load more notifications
        document.getElementById('load-more-notifications')?.addEventListener('click', () => {
            notificationPage++;
            renderAccountNotifications();
        });

        // Update notification badge in sidebar
        function updateNotificationBadge(count) {
            const badge = document.getElementById('sidebar-notification-badge');
            if (badge) {
                if (count > 0) {
                    badge.textContent = count > 99 ? '99+' : count;
                    badge.classList.remove('hidden');
                } else {
                    badge.classList.add('hidden');
                }
            }
        }

        // Helper functions
        function getNotificationIcon(type) {
            const icons = {
                news: { icon: 'fas fa-newspaper', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
                promo: { icon: 'fas fa-tag', bgColor: 'bg-green-100', textColor: 'text-green-600' },
                comment_reply: { icon: 'fas fa-reply', bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
                comment_like: { icon: 'fas fa-heart', bgColor: 'bg-red-100', textColor: 'text-red-600' },
                order_status: { icon: 'fas fa-shopping-bag', bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
                system: { icon: 'fas fa-bell', bgColor: 'bg-gray-100', textColor: 'text-gray-600' }
            };
            return icons[type] || icons.system;
        }

        function getTimeAgo(dateString) {
            const date = new Date(dateString);
            const now = new Date();
            const seconds = Math.floor((now - date) / 1000);
            
            if (seconds < 60) return 'Vừa xong';
            if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
            if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
            if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
            
            return date.toLocaleDateString('vi-VN');
        }

        // Check URL hash for notifications tab
        if (window.location.hash === '#notifications') {
            setTimeout(() => {
                const notifButton = document.querySelector('[onclick*="notifications"]');
                if (notifButton) {
                    notifButton.click();
                    loadAccountNotifications();
                }
            }, 500);
        }

        // ===== RESERVATIONS HANDLING =====
        let reservationsLoaded = false;

        async function loadReservations() {
            if (reservationsLoaded) return; // Chỉ load 1 lần
            
            const token = localStorage.getItem('token');
            if (!token) return;

            const container = document.getElementById('reservations-list');
            container.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-4xl text-orange-600 mb-4"></i>
                    <p class="text-gray-600">Đang tải...</p>
                </div>
            `;

            try {
                const response = await fetch(`${window.API_URL}/reservations/my-reservations`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();

                if (result.success) {
                    reservationsLoaded = true;
                    renderReservations(result.data);
                } else {
                    container.innerHTML = `
                        <div class="text-center py-12 text-gray-500">
                            <i class="fas fa-exclamation-circle text-6xl mb-4 opacity-30"></i>
                            <p class="text-lg">${result.message || 'Không thể tải dữ liệu'}</p>
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Error loading reservations:', error);
                container.innerHTML = `
                    <div class="text-center py-12 text-gray-500">
                        <i class="fas fa-exclamation-circle text-6xl mb-4 opacity-30"></i>
                        <p class="text-lg">Không thể kết nối đến server</p>
                        <button onclick="reservationsLoaded=false; loadReservations();" class="mt-4 text-orange-600 hover:text-orange-700 font-semibold">
                            <i class="fas fa-redo mr-2"></i>Thử lại
                        </button>
                    </div>
                `;
            }
        }

        function renderReservations(reservations) {
            const container = document.getElementById('reservations-list');

            if (!reservations || reservations.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-12 text-gray-500">
                        <i class="fas fa-calendar-times text-6xl mb-4 opacity-30"></i>
                        <p class="text-lg">Bạn chưa có lịch đặt bàn nào</p>
                        <a href="dat-ban.html" class="inline-block mt-4 text-orange-600 hover:text-orange-700 font-semibold">
                            Đặt bàn ngay <i class="fas fa-arrow-right ml-2"></i>
                        </a>
                    </div>
                `;
                return;
            }

            container.innerHTML = reservations.map(r => {
                const statusInfo = getReservationStatusInfo(r.trang_thai);
                const bookingDate = new Date(r.ngay_dat);
                const now = new Date();
                // Kiểm tra thời gian: chỉ cho hủy trong vòng 1 tiếng sau khi đặt
                const createdAt = new Date(r.thoi_gian_tao);
                const hoursSinceCreated = (now - createdAt) / (1000 * 60 * 60);
                const canCancelTime = hoursSinceCreated <= 1; // Trong vòng 1 tiếng
                const remainingMinutes = Math.max(0, Math.floor(60 - (hoursSinceCreated * 60)));
                const canCancel = ['pending', 'confirmed'].includes(r.trang_thai) && canCancelTime;
                const items = r.mon_an || [];
                const itemCount = items.length || (r.so_mon_da_dat || 0);

                // Render danh sách món ăn
                let itemsHtml = '';
                if (items.length > 0) {
                    itemsHtml = `
                        <div class="mt-3 border-t pt-3">
                            <div class="flex items-center justify-between mb-2">
                                <p class="font-medium text-gray-700">
                                    <i class="fas fa-utensils text-orange-500 mr-2"></i>Món đã đặt trước (${items.length} món)
                                </p>
                                <button onclick="toggleReservationItems(${r.ma_dat_ban})" class="text-sm text-orange-600 hover:text-orange-700">
                                    <span id="toggle-text-${r.ma_dat_ban}">Xem chi tiết</span>
                                    <i id="toggle-icon-${r.ma_dat_ban}" class="fas fa-chevron-down ml-1"></i>
                                </button>
                            </div>
                            <div id="items-${r.ma_dat_ban}" class="hidden space-y-2 mt-2">
                                ${items.map(item => {
                                    let imagePath = item.anh_mon || '/images/placeholder.jpg';
                                    if (imagePath && !imagePath.startsWith('/') && !imagePath.startsWith('http')) {
                                        imagePath = '/images/' + imagePath;
                                    }
                                    const imageUrl = imagePath.startsWith('http') ? imagePath : 'http://localhost:3000' + imagePath;
                                    
                                    return `
                                        <div class="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
                                            <img src="${imageUrl}" alt="${item.ten_mon}" 
                                                 class="w-12 h-12 rounded-lg object-cover"
                                                 onerror="this.src='images/placeholder.svg'">
                                            <div class="flex-1 min-w-0">
                                                <p class="font-medium text-gray-800 truncate">${item.ten_mon}</p>
                                                <p class="text-sm text-gray-500">SL: ${item.so_luong} x ${formatReservationPrice(item.gia_tai_thoi_diem)}</p>
                                            </div>
                                            <p class="font-semibold text-orange-600">${formatReservationPrice(item.so_luong * item.gia_tai_thoi_diem)}</p>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                } else if (itemCount > 0) {
                    itemsHtml = `
                        <div class="mt-3 text-sm text-gray-600">
                            <i class="fas fa-utensils text-orange-500 mr-2"></i>
                            Đã đặt trước <strong>${itemCount}</strong> món
                        </div>
                    `;
                }

                return `
                    <div class="border rounded-xl p-4 sm:p-5 hover:shadow-md transition bg-white ${statusInfo.borderClass}">
                        <div class="flex flex-wrap items-start justify-between gap-3 mb-3">
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="font-bold text-gray-800">Đặt bàn #${r.ma_dat_ban}</span>
                                    <span class="px-2 py-1 rounded-full text-xs font-medium ${statusInfo.class}">
                                        <i class="${statusInfo.icon} mr-1"></i>${statusInfo.text}
                                    </span>
                                </div>
                                <p class="text-sm text-gray-500">
                                    Đặt lúc: ${new Date(r.thoi_gian_tao).toLocaleString('vi-VN')}
                                </p>
                            </div>
                            <div class="flex items-center gap-2">
                                ${['pending', 'confirmed'].includes(r.trang_thai) ? (canCancelTime ? `
                                    <button onclick="cancelReservation(${r.ma_dat_ban})" 
                                            class="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1 border border-red-200 rounded-lg hover:bg-red-50">
                                        <i class="fas fa-times mr-1"></i>Hủy (còn ${remainingMinutes}p)
                                    </button>
                                ` : `
                                    <span class="text-sm text-gray-400 px-3 py-1 border border-gray-200 rounded-lg" title="Đã quá 1 tiếng sau khi đặt">
                                        <i class="fas fa-ban mr-1"></i>Hết hạn hủy
                                    </span>
                                `) : ''}
                            </div>
                        </div>

                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p class="text-xs text-gray-500">Ngày đến</p>
                                <p class="font-semibold text-gray-800">${bookingDate.toLocaleDateString('vi-VN')}</p>
                            </div>
                            <div>
                                <p class="text-xs text-gray-500">Giờ đến</p>
                                <p class="font-semibold text-gray-800">${r.gio_den}</p>
                            </div>
                            <div>
                                <p class="text-xs text-gray-500">Số khách</p>
                                <p class="font-semibold text-gray-800">${r.so_luong} người</p>
                            </div>
                            <div>
                                <p class="text-xs text-gray-500">Tổng dự kiến</p>
                                <p class="font-semibold text-orange-600">${formatReservationPrice(r.tong_tien_du_kien || 0)}</p>
                            </div>
                        </div>

                        ${itemsHtml}

                        ${r.ghi_chu ? `
                            <div class="mt-3 p-2 bg-gray-50 rounded-lg text-sm text-gray-600">
                                <i class="fas fa-sticky-note text-gray-400 mr-2"></i>
                                <strong>Ghi chú:</strong> ${r.ghi_chu}
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        }

        // Toggle hiển thị chi tiết món ăn
        function toggleReservationItems(id) {
            const itemsDiv = document.getElementById(`items-${id}`);
            const toggleText = document.getElementById(`toggle-text-${id}`);
            const toggleIcon = document.getElementById(`toggle-icon-${id}`);
            
            if (itemsDiv.classList.contains('hidden')) {
                itemsDiv.classList.remove('hidden');
                toggleText.textContent = 'Ẩn bớt';
                toggleIcon.classList.remove('fa-chevron-down');
                toggleIcon.classList.add('fa-chevron-up');
            } else {
                itemsDiv.classList.add('hidden');
                toggleText.textContent = 'Xem chi tiết';
                toggleIcon.classList.remove('fa-chevron-up');
                toggleIcon.classList.add('fa-chevron-down');
            }
        }

        function getReservationStatusInfo(status) {
            const statusMap = {
                'pending': { 
                    text: 'Chờ xác nhận', 
                    class: 'bg-yellow-100 text-yellow-800', 
                    icon: 'fas fa-clock',
                    borderClass: 'border-yellow-200'
                },
                'confirmed': { 
                    text: 'Đã xác nhận', 
                    class: 'bg-blue-100 text-blue-800', 
                    icon: 'fas fa-check',
                    borderClass: 'border-blue-200'
                },
                'attended': { 
                    text: 'Đã xác nhận', 
                    class: 'bg-green-100 text-green-800', 
                    icon: 'fas fa-check-double',
                    borderClass: 'border-green-200'
                },
                'cancelled': { 
                    text: 'Đã hủy', 
                    class: 'bg-red-100 text-red-800', 
                    icon: 'fas fa-times',
                    borderClass: 'border-red-200'
                }
            };
            return statusMap[status] || statusMap['pending'];
        }

        function formatReservationPrice(price) {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
        }

        async function cancelReservation(id) {
            if (!confirm('Bạn có chắc muốn hủy đặt bàn này?')) return;

            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${window.API_URL}/reservations/${id}/cancel`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();

                if (result.success) {
                    showNotification('Hủy đặt bàn thành công', 'success');
                    reservationsLoaded = false;
                    loadReservations();
                } else {
                    showNotification(result.message || 'Không thể hủy đặt bàn', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('Không thể kết nối đến server', 'error');
            }
        }

        // Check URL hash for reservations tab
        if (window.location.hash === '#reservations') {
            setTimeout(() => {
                const reservButton = document.querySelector('[onclick*="reservations"]');
                if (reservButton) {
                    reservButton.click();
                }
            }, 500);
        }

        // Load data on page load
        document.addEventListener('DOMContentLoaded', () => {
            loadUserData();
            
            // Initialize mobile menu state
            if (window.innerWidth >= 1024) {
                sidebarMenu.classList.remove('hidden');
                sidebarMenu.classList.add('block');
            }

            // Load notifications if on notifications tab
            if (window.location.hash === '#notifications') {
                loadAccountNotifications();
            }
        });

        // Make filterNotifications global
        window.filterNotifications = filterNotifications;
        window.handleNotificationClick = handleNotificationClick;
