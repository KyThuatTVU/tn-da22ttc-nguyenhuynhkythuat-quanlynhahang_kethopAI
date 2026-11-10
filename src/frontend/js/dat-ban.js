/* ==== Script 1 (tách từ /dat-ban/) ==== */
// API URL
        const API_URL = window.API_URL || 'http://localhost:3000/api';
        
        // State management
        let currentStep = 1;
        let bookingInfo = {};
        let selectedItems = {}; // {ma_mon: {dish info, quantity}}
        let menuItems = [];
        let categories = [];
        let currentReservationId = null; // Lưu mã đặt bàn sau khi tạo
        let paymentTimer = null;
        let paymentExpiryTime = null;
        
        // Constants
        const MIN_HOURS_ADVANCE = 3;
        
        // Disable form cho khách chưa đăng nhập
        function disableFormForGuest() {
            const form = document.getElementById('booking-info-form');
            const formContainer = form.closest('.bg-white');
            
            // Disable tất cả input trong form
            const inputs = form.querySelectorAll('input, select, textarea, button');
            inputs.forEach(input => {
                input.disabled = true;
                input.classList.add('bg-gray-100', 'cursor-not-allowed', 'opacity-60');
            });
            
            // Thêm thông báo yêu cầu đăng nhập vào đầu form
            const loginNotice = document.createElement('div');
            loginNotice.className = 'mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl';
            loginNotice.innerHTML = `
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-user-lock text-orange-600 text-lg"></i>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-bold text-gray-800 mb-1">Vui lòng đăng nhập để đặt bàn</h4>
                        <p class="text-sm text-gray-600 mb-3">Đăng nhập để chúng tôi có thể phục vụ bạn tốt hơn và lưu lại lịch sử đặt bàn.</p>
                        <div class="flex flex-wrap gap-2">
                            <a href="/dang-nhap/?redirect=/dat-ban/" 
                               class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:opacity-90 transition text-sm">
                                <i class="fas fa-sign-in-alt mr-2"></i>Đăng nhập
                            </a>
                            <a href="/dang-ky/?redirect=/dat-ban/" 
                               class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm">
                                <i class="fas fa-user-plus mr-2"></i>Đăng ký tài khoản
                            </a>
                        </div>
                    </div>
                </div>
            `;
            
            // Chèn thông báo vào đầu form
            form.insertBefore(loginNotice, form.firstChild);
        }
        
        // Check login on page load
        document.addEventListener('DOMContentLoaded', async function() {
            // Khởi tạo FormDraftManager
            window.bookingDraftManager = new FormDraftManager('booking-info-form');
            
            const token = localStorage.getItem('token');
            
            if (!token) {
                // Disable form và hiển thị thông báo yêu cầu đăng nhập
                disableFormForGuest();
                return;
            }
            
            // Pre-fill user info if logged in
            const user = getUserData();
            if (user) {
                document.getElementById('ten_nguoi_dat').value = user.ten_nguoi_dung || '';
                document.getElementById('so_dien_thoai').value = user.so_dien_thoai || '';
                document.getElementById('email').value = user.email || '';
                
                // Khóa các trường thông tin cá nhân nếu đã đăng nhập
                if (user.ten_nguoi_dung) {
                    document.getElementById('ten_nguoi_dat').readOnly = true;
                    document.getElementById('ten_nguoi_dat').classList.add('bg-gray-100', 'cursor-not-allowed');
                }
                if (user.so_dien_thoai) {
                    document.getElementById('so_dien_thoai').readOnly = true;
                    document.getElementById('so_dien_thoai').classList.add('bg-gray-100', 'cursor-not-allowed');
                }
                if (user.email) {
                    document.getElementById('email').readOnly = true;
                    document.getElementById('email').classList.add('bg-gray-100', 'cursor-not-allowed');
                }
            }
            
            // Set min date
            setMinDate();
            
            // Load menu items
            await loadMenuItems();

            // Load available tables
            await loadAvailableTables();
            
            // Setup event listeners
            setupEventListeners();
        });
        
        // Set minimum date (today)
        function setMinDate() {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const dateInput = document.getElementById('ngay_dat');
            dateInput.min = `${yyyy}-${mm}-${dd}`;
            dateInput.value = `${yyyy}-${mm}-${dd}`;
            
            // Set default time (current time + MIN_HOURS_ADVANCE hours, rounded to next 30 min)
            const defaultTime = new Date(today.getTime() + (MIN_HOURS_ADVANCE + 0.5) * 60 * 60 * 1000);
            let hours = defaultTime.getHours();
            let minutes = Math.ceil(defaultTime.getMinutes() / 30) * 30;
            
            // Nếu minutes = 60, chuyển sang giờ tiếp theo
            if (minutes >= 60) {
                hours += 1;
                minutes = 0;
            }
            
            // Đảm bảo trong giờ mở cửa (7:00 - 23:00)
            if (hours < 7) {
                hours = 7;
                minutes = 0;
            } else if (hours >= 23) {
                // Nếu quá 23h, chuyển sang ngày hôm sau lúc 7h
                const nextDay = new Date(today);
                nextDay.setDate(nextDay.getDate() + 1);
                const nextYyyy = nextDay.getFullYear();
                const nextMm = String(nextDay.getMonth() + 1).padStart(2, '0');
                const nextDd = String(nextDay.getDate()).padStart(2, '0');
                dateInput.value = `${nextYyyy}-${nextMm}-${nextDd}`;
                hours = 7;
                minutes = 0;
            }
            
            const hoursStr = String(hours).padStart(2, '0');
            const minutesStr = String(minutes).padStart(2, '0');
            const timeValue = `${hoursStr}:${minutesStr}`;
            
            // Khởi tạo Flatpickr cho giờ đến
            flatpickr("#gio_den", {
                enableTime: true,
                noCalendar: true,
                dateFormat: "H:i",
                time_24hr: true,
                defaultDate: timeValue,
                minuteIncrement: 15, // Cho phép bước nhảy 15 phút cho dễ chọn
                disableMobile: "true" // Sử dụng Flatpickr trên mobile thay vì native picker
            });
            
            document.getElementById('gio_den').value = timeValue;
        }
        
        // Setup event listeners
        function setupEventListeners() {
            // Booking info form
            document.getElementById('booking-info-form').addEventListener('submit', function(e) {
                e.preventDefault();
                if (validateBookingInfo()) {
                    saveBookingInfo();
                    goToStep(2);
                }
            });
            
            // Menu search
            document.getElementById('menu-search').addEventListener('input', function(e) {
                filterMenuItems(e.target.value);
            });
            
            // Date change - validate time
            document.getElementById('ngay_dat').addEventListener('change', validateDateTime);
            document.getElementById('gio_den').addEventListener('change', validateDateTime);

            // Area change - filter tables list
            document.getElementById('khu_vuc').addEventListener('change', populateTablesDropdown);
        }
        
        // Validate date and time
        function validateDateTime() {
            const dateInput = document.getElementById('ngay_dat');
            const timeInput = document.getElementById('gio_den');
            
            if (!dateInput.value || !timeInput.value) return true;
            
            const bookingDateTime = new Date(`${dateInput.value}T${timeInput.value}`);
            const now = new Date();
            const minBookingTime = new Date(now.getTime() + MIN_HOURS_ADVANCE * 60 * 60 * 1000);
            
            // Kiểm tra thời gian đặt bàn phải trước ít nhất 3 tiếng
            if (bookingDateTime < minBookingTime) {
                const hoursLeft = Math.ceil((minBookingTime - bookingDateTime) / (60 * 60 * 1000));
                showNotification(
                    `Vui lòng đặt bàn trước ít nhất ${MIN_HOURS_ADVANCE} tiếng. Thời gian sớm nhất bạn có thể đặt là ${formatDateTime(minBookingTime)}`, 
                    'error'
                );
                // Reset về thời gian hợp lệ
                const minDate = new Date(minBookingTime);
                dateInput.value = minDate.toISOString().split('T')[0];
                timeInput.value = minDate.toTimeString().slice(0, 5);
                return false;
            }
            
            // Kiểm tra giờ mở cửa
            const hours = bookingDateTime.getHours();
            if (hours < 7 || hours >= 23) {
                showNotification('Nhà hàng mở cửa từ 7:00 đến 23:00. Vui lòng chọn giờ trong khoảng thời gian này.', 'error');
                return false;
            }
            
            return true;
        }
        
        // Format date time for display
        function formatDateTime(date) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${day}/${month}/${year} lúc ${hours}:${minutes}`;
        }
        
        // Validate booking info
        function validateBookingInfo() {
            const name = document.getElementById('ten_nguoi_dat').value.trim();
            const phone = document.getElementById('so_dien_thoai').value.trim();
            const date = document.getElementById('ngay_dat').value;
            const time = document.getElementById('gio_den').value;
            const guests = document.getElementById('so_luong').value;
            const tableId = document.getElementById('ma_ban').value;
            
            if (!name || !phone || !date || !time || !guests || !tableId) {
                showNotification('Vui lòng điền đầy đủ thông tin bắt buộc và chọn bàn trống', 'error');
                return false;
            }
            
            // Validate phone
            const phoneRegex = /^[0-9]{10,11}$/;
            if (!phoneRegex.test(phone)) {
                showNotification('Số điện thoại không hợp lệ', 'error');
                return false;
            }
            
            return validateDateTime();
        }
        
        // Save booking info
        function saveBookingInfo() {
            bookingInfo = {
                ten_nguoi_dat: document.getElementById('ten_nguoi_dat').value.trim(),
                so_dien_thoai: document.getElementById('so_dien_thoai').value.trim(),
                email: document.getElementById('email').value.trim(),
                ngay_dat: document.getElementById('ngay_dat').value,
                gio_den: document.getElementById('gio_den').value,
                so_luong: document.getElementById('so_luong').value,
                khu_vuc: document.getElementById('khu_vuc').value,
                ma_ban: parseInt(document.getElementById('ma_ban').value),
                ghi_chu: document.getElementById('ghi_chu').value.trim()
            };
        }

        let allTablesList = [];

        // Tạo danh sách khu vực động từ dữ liệu bàn trong database
        function populateAreasDropdown() {
            const areaSelect = document.getElementById('khu_vuc');
            if (!areaSelect) return;

            // Lấy tất cả các vị trí độc duy từ danh sách bàn, thay null/rỗng bằng 'Khu chung'
            const uniqueAreas = [...new Set(allTablesList.map(t => (t.vi_tri || 'Khu chung').trim()))]
                .filter(area => area !== '');

            // Sắp xếp Alphabet để hiển thị đẹp mắt
            uniqueAreas.sort((a, b) => a.localeCompare(b, 'vi'));

            // Lưu giữ khu vực đang được chọn (nếu có)
            const currentValue = areaSelect.value;

            areaSelect.innerHTML = '<option value="">Chọn khu vực</option>' +
                uniqueAreas.map(area => `<option value="${area}">${area}</option>`).join('');

            // Khôi phục lại lựa chọn trước đó (nếu vẫn còn hợp lệ)
            if (currentValue && uniqueAreas.includes(currentValue)) {
                areaSelect.value = currentValue;
            }
        }

        // Tải danh sách bàn trống từ API
        async function loadAvailableTables() {
            try {
                const response = await fetch(`${API_URL}/tables`);
                const result = await response.json();
                if (result.success) {
                    allTablesList = result.data || [];
                    populateAreasDropdown(); // Tải danh sách khu vực động
                    populateTablesDropdown();

                    // Đọc bàn được gán qua tham số URL (?ma_ban=X hoặc ?tableId=X)
                    const urlParams = new URLSearchParams(window.location.search);
                    const preselectedTableId = urlParams.get('tableId') || urlParams.get('ma_ban');
                    if (preselectedTableId) {
                        const tableIdNum = parseInt(preselectedTableId);
                        const table = allTablesList.find(t => t.ma_ban === tableIdNum);
                        if (table) {
                            if (table.trang_thai === 'trong') {
                                // Tự động chọn khu vực dựa theo vị trí của bàn
                                const matchedArea = table.vi_tri || 'Khu chung';

                                document.getElementById('khu_vuc').value = matchedArea;
                                populateTablesDropdown(); // Cập nhật lại dropdown bàn theo khu vực vừa chọn

                                document.getElementById('ma_ban').value = tableIdNum;
                                showNotification(`Đã tự động chọn ${table.ten_ban} (${table.so_cho} chỗ) theo yêu cầu`, 'success');
                            } else {
                                showNotification(`Bàn ${table.ten_ban} hiện đã được đặt hoặc đang sử dụng. Vui lòng chọn bàn khác còn trống.`, 'error');
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Lỗi tải danh sách bàn:', error);
                showNotification('Không thể tải danh sách bàn trống từ server', 'error');
            }
        }

        // Tạo danh sách bàn trống trong dropdown dựa trên bộ lọc khu vực
        function populateTablesDropdown() {
            const area = document.getElementById('khu_vuc').value;
            const tableSelect = document.getElementById('ma_ban');

            // Chỉ lấy các bàn trống (trang_thai = 'trong')
            let filteredTables = allTablesList.filter(t => t.trang_thai === 'trong');

            if (area) {
                filteredTables = filteredTables.filter(t => {
                    const loc = (t.vi_tri || 'Khu chung').trim();
                    return loc === area.trim();
                });
            }

            if (!area) {
                tableSelect.innerHTML = '<option value="">Vui lòng chọn khu vực trước</option>';
            } else if (filteredTables.length === 0) {
                tableSelect.innerHTML = '<option value="">Không có bàn nào trống trong khu vực này</option>';
            } else {
                tableSelect.innerHTML = '<option value="">Chọn bàn trống</option>' +
                    filteredTables.map(t => `<option value="${t.ma_ban}">${t.ten_ban} - ${t.vi_tri || 'Khu chung'} (${t.so_cho} chỗ)</option>`).join('');
            }
        }
        
        // Load menu items
        async function loadMenuItems() {
            try {
                const response = await fetch(`${API_URL}/menu`);
                const result = await response.json();
                
                if (result.success) {
                    menuItems = result.data.filter(item => item.trang_thai === 1);
                    
                    // Extract categories
                    const categorySet = new Set();
                    menuItems.forEach(item => {
                        if (item.ten_danh_muc) categorySet.add(item.ten_danh_muc);
                    });
                    categories = Array.from(categorySet);
                    
                    renderCategoryFilters();
                    renderMenuItems(menuItems);
                }
            } catch (error) {
                console.error('Error loading menu:', error);
                document.getElementById('menu-items-grid').innerHTML = `
                    <div class="col-span-full text-center py-8">
                        <i class="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
                        <p class="text-gray-600">Không thể tải thực đơn. Vui lòng thử lại.</p>
                    </div>
                `;
            }
        }
        
        // Render category filters
        function renderCategoryFilters() {
            const container = document.querySelector('.category-filter').parentElement;
            container.innerHTML = `
                <button class="category-filter px-4 py-2 rounded-full bg-orange-600 text-white font-medium" data-category="all">
                    Tất cả
                </button>
                ${categories.map(cat => `
                    <button class="category-filter px-4 py-2 rounded-full bg-gray-200 text-gray-700 font-medium hover:bg-orange-100" data-category="${cat}">
                        ${cat}
                    </button>
                `).join('')}
            `;
            
            // Add click handlers
            container.querySelectorAll('.category-filter').forEach(btn => {
                btn.addEventListener('click', function() {
                    container.querySelectorAll('.category-filter').forEach(b => {
                        b.classList.remove('bg-orange-600', 'text-white');
                        b.classList.add('bg-gray-200', 'text-gray-700');
                    });
                    this.classList.remove('bg-gray-200', 'text-gray-700');
                    this.classList.add('bg-orange-600', 'text-white');
                    
                    const category = this.dataset.category;
                    if (category === 'all') {
                        renderMenuItems(menuItems);
                    } else {
                        renderMenuItems(menuItems.filter(item => item.ten_danh_muc === category));
                    }
                });
            });
        }
        
        // Render menu items
        function renderMenuItems(items) {
            const grid = document.getElementById('menu-items-grid');
            
            if (items.length === 0) {
                grid.innerHTML = `
                    <div class="col-span-full text-center py-8">
                        <i class="fas fa-search text-4xl text-gray-400 mb-4"></i>
                        <p class="text-gray-600">Không tìm thấy món ăn</p>
                    </div>
                `;
                return;
            }
            
            grid.innerHTML = items.map(item => {
                const isSelected = selectedItems[item.ma_mon];
                const quantity = isSelected ? isSelected.quantity : 0;
                
                // Xử lý đường dẫn ảnh giống như menu.js
                let imagePath = item.anh_mon || '/images/placeholder.jpg';
                if (imagePath && !imagePath.startsWith('/') && !imagePath.startsWith('http')) {
                    imagePath = '/images/' + imagePath;
                }
                const imageUrl = imagePath.startsWith('http') ? imagePath : `http://localhost:3000${imagePath}`;
                
                return `
                    <div class="menu-item-card border rounded-xl p-4 ${isSelected ? 'selected' : ''}" data-id="${item.ma_mon}">
                        <div class="flex gap-4">
                            <img src="${imageUrl}" alt="${item.ten_mon}" 
                                 class="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                                 onerror="this.onerror=null; this.src='images/placeholder.svg'; this.style.objectFit='contain';">
                            <div class="flex-1 min-w-0">
                                <h4 class="font-bold text-gray-800 truncate">${item.ten_mon}</h4>
                                <p class="text-sm text-gray-500 line-clamp-2">${item.mo_ta || ''}</p>
                                <p class="text-orange-600 font-bold mt-1">${formatPrice(item.gia_tien)}</p>
                            </div>
                        </div>
                        <div class="flex items-center justify-between mt-3 pt-3 border-t">
                            ${quantity > 0 ? `
                                <div class="flex items-center gap-2">
                                    <button onclick="updateItemQuantity(${item.ma_mon}, -1)" 
                                            class="quantity-btn w-8 h-8 rounded-full border border-orange-600 text-orange-600 flex items-center justify-center">
                                        <i class="fas fa-minus text-sm"></i>
                                    </button>
                                    <span class="w-8 text-center font-bold">${quantity}</span>
                                    <button onclick="updateItemQuantity(${item.ma_mon}, 1)" 
                                            class="quantity-btn w-8 h-8 rounded-full border border-orange-600 text-orange-600 flex items-center justify-center">
                                        <i class="fas fa-plus text-sm"></i>
                                    </button>
                                </div>
                            ` : `
                                <button onclick="addItem(${item.ma_mon})" 
                                        class="w-full bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 transition">
                                    <i class="fas fa-plus mr-1"></i> Thêm món
                                </button>
                            `}
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        // Filter menu items by search
        function filterMenuItems(searchTerm) {
            const filtered = menuItems.filter(item => 
                item.ten_mon.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.mo_ta && item.mo_ta.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            renderMenuItems(filtered);
        }
        
        // Add item to selection
        function addItem(maMonId) {
            const item = menuItems.find(m => m.ma_mon === maMonId);
            if (!item) return;
            
            selectedItems[maMonId] = {
                ...item,
                quantity: 1
            };
            
            updateUI();
        }
        
        // Update item quantity
        function updateItemQuantity(maMonId, delta) {
            if (!selectedItems[maMonId]) return;
            
            selectedItems[maMonId].quantity += delta;
            
            if (selectedItems[maMonId].quantity <= 0) {
                delete selectedItems[maMonId];
            }
            
            updateUI();
        }
        
        // Remove item
        function removeItem(maMonId) {
            delete selectedItems[maMonId];
            updateUI();
        }
        
        // Update UI after selection changes
        function updateUI() {
            // Re-render menu items to show updated quantities
            const searchTerm = document.getElementById('menu-search').value;
            if (searchTerm) {
                filterMenuItems(searchTerm);
            } else {
                const activeCategory = document.querySelector('.category-filter.bg-orange-600');
                const category = activeCategory ? activeCategory.dataset.category : 'all';
                if (category === 'all') {
                    renderMenuItems(menuItems);
                } else {
                    renderMenuItems(menuItems.filter(item => item.ten_danh_muc === category));
                }
            }
            
            // Update selected items list
            updateSelectedItemsList();
            
            // Update total
            updateTotal();
            
            // Enable/disable continue button
            const hasItems = Object.keys(selectedItems).length > 0;
            document.getElementById('btn-continue-step3').disabled = !hasItems;
        }
        
        // Update selected items list
        function updateSelectedItemsList() {
            const container = document.getElementById('selected-items-list');
            const items = Object.values(selectedItems);
            
            if (items.length === 0) {
                container.innerHTML = '<p class="text-gray-500 text-center py-4">Chưa chọn món nào</p>';
                return;
            }
            
            container.innerHTML = items.map(item => `
                <div class="flex items-center justify-between bg-orange-50 rounded-lg p-3">
                    <div class="flex-1 min-w-0">
                        <p class="font-medium text-gray-800 truncate">${item.ten_mon}</p>
                        <p class="text-sm text-orange-600">${formatPrice(item.gia_tien)} x ${item.quantity}</p>
                    </div>
                    <div class="flex items-center gap-2 ml-2">
                        <span class="font-bold text-gray-800">${formatPrice(item.gia_tien * item.quantity)}</span>
                        <button onclick="removeItem(${item.ma_mon})" class="text-red-500 hover:text-red-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
        
        // Update total price
        function updateTotal() {
            const total = Object.values(selectedItems).reduce((sum, item) => {
                return sum + (parseFloat(item.gia_tien) * item.quantity);
            }, 0);
            
            document.getElementById('total-price').textContent = formatPrice(total);
        }
        
        // Format price
        function formatPrice(price) {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
        }
        
        // Go to step
        function goToStep(step) {
            // Validate before moving forward
            if (step === 2 && currentStep === 1) {
                if (!validateBookingInfo()) return;
                saveBookingInfo();
            }
            
            if (step === 3 && currentStep === 2) {
                if (Object.keys(selectedItems).length === 0) {
                    showNotification('Vui lòng chọn ít nhất 1 món ăn', 'error');
                    return;
                }
                updateConfirmationPage();
            }
            
            // Hide all steps
            document.getElementById('step1-content').classList.add('hidden');
            document.getElementById('step2-content').classList.add('hidden');
            document.getElementById('step3-content').classList.add('hidden');
            
            // Show current step
            document.getElementById(`step${step}-content`).classList.remove('hidden');
            
            // Update indicators and lines
            for (let i = 1; i <= 3; i++) {
                const indicator = document.getElementById(`step${i}-indicator`);
                const stepText = indicator.nextElementSibling;
                indicator.classList.remove('active', 'completed', 'bg-gray-300', 'text-gray-600');
                
                if (i < step) {
                    indicator.classList.add('completed');
                    if (stepText) {
                        stepText.classList.remove('text-gray-500');
                        stepText.classList.add('text-green-600');
                    }
                } else if (i === step) {
                    indicator.classList.add('active');
                    if (stepText) {
                        stepText.classList.remove('text-gray-500');
                        stepText.classList.add('text-gray-700');
                    }
                } else {
                    indicator.classList.add('bg-gray-300', 'text-gray-600');
                    if (stepText) {
                        stepText.classList.remove('text-gray-700', 'text-green-600');
                        stepText.classList.add('text-gray-500');
                    }
                }
            }
            
            // Update progress lines
            const line1 = document.getElementById('step-line-1');
            const line2 = document.getElementById('step-line-2');
            
            if (step >= 2) {
                line1.classList.remove('bg-gray-300');
                line1.classList.add('bg-green-500');
            } else {
                line1.classList.remove('bg-green-500');
                line1.classList.add('bg-gray-300');
            }
            
            if (step >= 3) {
                line2.classList.remove('bg-gray-300');
                line2.classList.add('bg-green-500');
            } else {
                line2.classList.remove('bg-green-500');
                line2.classList.add('bg-gray-300');
            }
            
            currentStep = step;
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        // Update confirmation page
        function updateConfirmationPage() {
            document.getElementById('confirm-name').textContent = bookingInfo.ten_nguoi_dat;
            document.getElementById('confirm-phone').textContent = bookingInfo.so_dien_thoai;
            document.getElementById('confirm-date').textContent = new Date(bookingInfo.ngay_dat).toLocaleDateString('vi-VN');
            document.getElementById('confirm-time').textContent = bookingInfo.gio_den;
            document.getElementById('confirm-guests').textContent = bookingInfo.so_luong + ' người';
            
            document.getElementById('confirm-area').textContent = bookingInfo.khu_vuc || 'Không chọn';

            // Hiển thị bàn được chọn
            const tableSelect = document.getElementById('ma_ban');
            const selectedTableText = tableSelect.options[tableSelect.selectedIndex]?.text || 'Chưa chọn';
            document.getElementById('confirm-table').textContent = selectedTableText;
            
            // Items list
            const items = Object.values(selectedItems);
            const itemsContainer = document.getElementById('confirm-items-list');
            itemsContainer.innerHTML = items.map(item => `
                <div class="flex justify-between items-center py-2 border-b">
                    <div>
                        <span class="font-medium">${item.ten_mon}</span>
                        <span class="text-gray-500 ml-2">x${item.quantity}</span>
                    </div>
                    <span class="font-medium">${formatPrice(item.gia_tien * item.quantity)}</span>
                </div>
            `).join('');
            
            // Total
            const total = items.reduce((sum, item) => sum + (parseFloat(item.gia_tien) * item.quantity), 0);
            document.getElementById('confirm-total').textContent = formatPrice(total);
        }
        
        // Submit booking
        async function submitBooking() {
            const token = localStorage.getItem('token');
            if (!token) {
                showNotification('Vui lòng đăng nhập để đặt bàn', 'error');
                return;
            }
            
            const submitBtn = document.getElementById('btn-submit-booking');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Đang xử lý...';
            
            try {
                // Prepare data
                const monAn = Object.values(selectedItems).map(item => ({
                    ma_mon: item.ma_mon,
                    so_luong: item.quantity,
                    ghi_chu: null
                }));
                
                const response = await fetch(`${API_URL}/reservations/create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ...bookingInfo,
                        mon_an: monAn
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    currentReservationId = result.data.ma_dat_ban;
                    if (window.bookingDraftManager) window.bookingDraftManager.clear();
                    // Hiển thị modal thanh toán QR thay vì success modal
                    await showPaymentQRModal(result.data);
                } else {
                    showNotification(result.message || 'Có lỗi xảy ra', 'error');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i> Xác nhận đặt bàn';
                }
            } catch (error) {
                console.error('Error submitting booking:', error);
                showNotification('Không thể kết nối đến server', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i> Xác nhận đặt bàn';
            }
        }
        
        // Show payment QR modal
        async function showPaymentQRModal(reservationData) {
            try {
                const token = localStorage.getItem('token');
                
                // Gọi API tạo QR code
                const response = await fetch(`${API_URL}/reservation-payment/create-payment-qr`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ma_dat_ban: reservationData.ma_dat_ban
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    const { qrCodeUrl, bankInfo, amount, transferContent, expiryTime } = result.data;
                    
                    // Hiển thị modal
                    document.getElementById('qr-code-image').src = qrCodeUrl;
                    document.getElementById('bank-name').textContent = bankInfo.bankName;
                    document.getElementById('account-number').textContent = bankInfo.accountNumber;
                    document.getElementById('account-name').textContent = bankInfo.accountName;
                    document.getElementById('payment-amount').textContent = formatPrice(amount);
                    document.getElementById('transfer-content').textContent = transferContent;
                    
                    // Lưu thời gian hết hạn
                    paymentExpiryTime = new Date(expiryTime);
                    
                    // Hiển thị modal
                    document.getElementById('payment-qr-modal').classList.remove('hidden');
                    
                    // Bắt đầu đếm ngược
                    startPaymentTimer();
                } else {
                    showNotification(result.message || 'Không thể tạo mã QR', 'error');
                }
            } catch (error) {
                console.error('Error creating payment QR:', error);
                showNotification('Lỗi tạo mã QR thanh toán', 'error');
            }
        }
        
        // Start payment timer
        function startPaymentTimer() {
            if (paymentTimer) clearInterval(paymentTimer);
            
            paymentTimer = setInterval(() => {
                const now = new Date();
                const timeLeft = paymentExpiryTime - now;
                
                if (timeLeft <= 0) {
                    clearInterval(paymentTimer);
                    document.getElementById('qr-timer').textContent = 'Hết hạn (Demo: vẫn có thể thanh toán)';
                    document.getElementById('qr-timer').classList.add('text-yellow-600');
                    // Demo mode: Không tự động hủy, cho phép người dùng vẫn bấm "Đã thanh toán"
                    return;
                }
                
                const minutes = Math.floor(timeLeft / 60000);
                const seconds = Math.floor((timeLeft % 60000) / 1000);
                document.getElementById('qr-timer').textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
                
                // Đổi màu khi còn dưới 1 phút
                if (timeLeft < 60000) {
                    document.getElementById('qr-timer').classList.add('text-red-600');
                }
            }, 1000);
        }
        
        // Confirm payment
        async function confirmPayment() {
            const token = localStorage.getItem('token');
            const btn = document.getElementById('btn-confirm-payment');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Đang xác nhận...';
            
            try {
                const response = await fetch(`${API_URL}/reservation-payment/confirm-payment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ma_dat_ban: currentReservationId
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Dừng timer
                    if (paymentTimer) clearInterval(paymentTimer);
                    
                    // Đóng modal thanh toán
                    document.getElementById('payment-qr-modal').classList.add('hidden');
                    
                    // Hiển thị success modal
                    showSuccessModal({
                        ma_dat_ban: currentReservationId,
                        ...bookingInfo,
                        tong_tien_du_kien: Object.values(selectedItems).reduce((sum, item) => 
                            sum + (parseFloat(item.gia_tien) * item.quantity), 0),
                        so_mon_da_dat: Object.keys(selectedItems).length
                    });
                } else {
                    showNotification(result.message || 'Xác nhận thanh toán thất bại', 'error');
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-check mr-2"></i> Đã thanh toán';
                }
            } catch (error) {
                console.error('Error confirming payment:', error);
                showNotification('Lỗi xác nhận thanh toán', 'error');
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-check mr-2"></i> Đã thanh toán';
            }
        }
        
        // Cancel payment
        function cancelPayment() {
            if (paymentTimer) clearInterval(paymentTimer);
            document.getElementById('payment-qr-modal').classList.add('hidden');
            
            // Reset form
            showNotification('Đã hủy thanh toán. Bạn có thể thanh toán sau tại trang "Đơn hàng của tôi"', 'info');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        }
        
        // Show success modal
        function showSuccessModal(data) {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                    <div class="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-center">
                        <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-check text-white text-4xl"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-white">Đặt bàn thành công!</h3>
                    </div>
                    <div class="p-6">
                        <div class="space-y-3 mb-6">
                            <div class="flex justify-between py-2 border-b">
                                <span class="text-gray-600">Mã đặt bàn:</span>
                                <span class="font-bold text-orange-600">#${data.ma_dat_ban}</span>
                            </div>
                            <div class="flex justify-between py-2 border-b">
                                <span class="text-gray-600">Họ tên:</span>
                                <span class="font-medium">${data.ten_nguoi_dat}</span>
                            </div>
                            <div class="flex justify-between py-2 border-b">
                                <span class="text-gray-600">Ngày đặt:</span>
                                <span class="font-medium">${new Date(data.ngay_dat).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div class="flex justify-between py-2 border-b">
                                <span class="text-gray-600">Giờ đến:</span>
                                <span class="font-medium">${data.gio_den}</span>
                            </div>
                            <div class="flex justify-between py-2 border-b">
                                <span class="text-gray-600">Bàn đã chọn:</span>
                                <span class="font-medium font-bold text-orange-600">${document.getElementById('ma_ban').options[document.getElementById('ma_ban').selectedIndex]?.text || 'Chưa chọn'}</span>
                            </div>
                            <div class="flex justify-between py-2 border-b">
                                <span class="text-gray-600">Số món đã đặt:</span>
                                <span class="font-medium">${data.so_mon_da_dat} món</span>
                            </div>
                            <div class="flex justify-between py-2">
                                <span class="text-gray-600">Tổng dự kiến:</span>
                                <span class="font-bold text-orange-600">${formatPrice(data.tong_tien_du_kien)}</span>
                            </div>
                        </div>
                        <p class="text-sm text-gray-500 text-center mb-4">
                            Đặt bàn đã được xác nhận và thanh toán thành công!<br>
                            Nhà hàng sẽ liên hệ nếu cần thêm thông tin.
                        </p>
                        <button onclick="window.location.href='/'" 
                                class="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-medium hover:opacity-90 transition">
                            Về trang chủ
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        // Show notification
        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
            const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
            
            notification.className = `fixed top-6 right-6 z-50 px-6 py-4 rounded-lg shadow-lg ${bgColor} text-white`;
            notification.innerHTML = `<i class="fas ${icon} mr-2"></i> ${message}`;
            document.body.appendChild(notification);
            
            setTimeout(() => notification.remove(), 3000);
        }

/* ==== Script 2 (tách từ /dat-ban/) ==== */
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
