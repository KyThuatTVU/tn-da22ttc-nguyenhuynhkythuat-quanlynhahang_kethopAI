/* ==== Script 1 (tách từ /admin/in-the-nhan-vien/) ==== */
const API_BASE = 'http://localhost:3000/api';
        let staffData = [];

        // Load staff list
        async function loadStaff() {
            try {
                const response = await fetch(`${API_BASE}/staff`, {
                    credentials: 'include'
                });
                const data = await response.json();
                
                if (data.success) {
                    staffData = data.data.filter(s => s.trang_thai === 1); // Chỉ lấy nhân viên đang hoạt động
                    displayStaffCheckboxes();
                } else {
                    alert('Không thể tải danh sách nhân viên: ' + data.message);
                }
            } catch (error) {
                console.error('Load staff error:', error);
                alert('Lỗi kết nối server!');
            }
        }

        // Display staff checkboxes
        function displayStaffCheckboxes() {
            const container = document.getElementById('staffCheckboxes');
            
            if (staffData.length === 0) {
                container.innerHTML = '<p class="text-gray-500">Không có nhân viên nào.</p>';
                return;
            }

            container.innerHTML = staffData.map(staff => `
                <label class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <input type="checkbox" 
                           class="staff-checkbox w-5 h-5 text-purple-600 mr-3" 
                           value="${staff.ma_nhan_vien}"
                           onchange="updateCards()">
                    <div>
                        <div class="font-semibold text-gray-800">${staff.ten_nhan_vien}</div>
                        <div class="text-sm text-gray-600">
                            ${staff.ma_nv_code} - ${getRoleName(staff.vai_tro)}
                        </div>
                    </div>
                </label>
            `).join('');
        }

        // Get role name in Vietnamese
        function getRoleName(role) {
            const roles = {
                'admin': 'Quản trị',
                'manager': 'Quản lý',
                'cashier': 'Thu ngân',
                'waiter': 'Phục vụ',
                'chef': 'Bếp',
                'kitchen': 'Bếp',
                'cleaner': 'Tạp vụ'
            };
            return roles[role] || role;
        }

        // Update cards based on selection
        function updateCards() {
            const checkboxes = document.querySelectorAll('.staff-checkbox:checked');
            const selectedIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
            const selectedStaff = staffData.filter(s => selectedIds.includes(s.ma_nhan_vien));
            
            const container = document.getElementById('cardsContainer');
            
            if (selectedStaff.length === 0) {
                container.innerHTML = '<p class="text-gray-500 col-span-full text-center py-8">Chọn nhân viên để xem thẻ</p>';
                return;
            }

            container.innerHTML = selectedStaff.map(staff => createCard(staff)).join('');
            
            // Generate QR codes
            selectedStaff.forEach(staff => {
                generateQRCode(staff.ma_nv_code);
            });
        }

        // Create card HTML
        function createCard(staff) {
            return `
                <div class="card">
                    <div class="card-content">
                        <!-- Header -->
                        <div class="text-center mb-3">
                            <div class="text-xs font-semibold opacity-90">NHÀ HÀNG ẨM THỰC</div>
                            <div class="text-lg font-bold">PHƯƠNG NAM</div>
                        </div>

                        <!-- Staff Info -->
                        <div class="flex items-start gap-3">
                            <div class="flex-1">
                                <div class="text-xl font-bold mb-1">${staff.ten_nhan_vien}</div>
                                <div class="text-sm opacity-90 mb-1">
                                    <i class="fas fa-briefcase mr-1"></i>${getRoleName(staff.vai_tro)}
                                </div>
                                <div class="text-sm opacity-90 mb-2">
                                    <i class="fas fa-phone mr-1"></i>${staff.so_dien_thoai || 'N/A'}
                                </div>
                                <div class="bg-white bg-opacity-20 rounded px-3 py-2 inline-block">
                                    <div class="text-xs opacity-90">Mã Nhân Viên</div>
                                    <div class="text-2xl font-bold">${staff.ma_nv_code}</div>
                                </div>
                            </div>
                            
                            <!-- QR Code -->
                            <div class="qr-code" id="qr-${staff.ma_nv_code}"></div>
                        </div>

                        <!-- Footer -->
                        <div class="text-xs text-center mt-3 opacity-75">
                            Quét mã để chấm công nhanh
                        </div>
                    </div>
                </div>
            `;
        }

        // Generate QR code
        function generateQRCode(code) {
            setTimeout(() => {
                const element = document.getElementById(`qr-${code}`);
                if (element && element.innerHTML === '') {
                    const origin = window.location.origin;
                    const url = `${origin}/cham-cong-guong-mat/?code=${code}`;
                    new QRCode(element, {
                        text: url,
                        width: 80,
                        height: 80,
                        colorDark: "#000000",
                        colorLight: "#ffffff",
                        correctLevel: QRCode.CorrectLevel.H
                    });
                }
            }, 100);
        }

        // Select all
        function selectAll() {
            document.querySelectorAll('.staff-checkbox').forEach(cb => cb.checked = true);
            updateCards();
        }

        // Deselect all
        function deselectAll() {
            document.querySelectorAll('.staff-checkbox').forEach(cb => cb.checked = false);
            updateCards();
        }

        // Auto load on page load
        window.addEventListener('DOMContentLoaded', loadStaff);
