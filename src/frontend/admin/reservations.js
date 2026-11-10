/* ==== Script 1 (tách từ /admin/reservations/) ==== */
// API_URL đã được khai báo trong admin-layout.js
        let reservations = [];
        let currentReservation = null;

        async function loadReservations() {
            try {
                const response = await fetch(`${API_URL}/reservations`, { credentials: 'include' });
                const data = await response.json();
                if (data.success) { reservations = data.data || []; updateStats(); renderReservations(reservations); }
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('reservations-tbody').innerHTML = `<tr><td colspan="10" class="px-6 py-12 text-center text-red-500"><i class="fas fa-exclamation-triangle text-2xl mb-2"></i><p>Không thể tải dữ liệu</p></td></tr>`;
            }
        }

        function updateStats() {
            const stats = { pending: 0, confirmed: 0, attended: 0, cancelled: 0 };
            reservations.forEach(r => { if (stats[r.trang_thai] !== undefined) stats[r.trang_thai]++; });
            document.getElementById('stat-pending').textContent = stats.pending;
            document.getElementById('stat-confirmed').textContent = stats.confirmed;
            document.getElementById('stat-attended').textContent = stats.attended;
            document.getElementById('stat-cancelled').textContent = stats.cancelled;
        }

        function formatPrice(price) {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
        }

        function getPaymentStatusBadge(status) {
            const statusMap = {
                'unpaid': { text: 'Chưa TT', class: 'bg-gray-100 text-gray-700', icon: 'fa-clock' },
                'pending': { text: 'Đang xử lý', class: 'bg-yellow-100 text-yellow-700', icon: 'fa-spinner' },
                'paid': { text: 'Đã TT', class: 'bg-green-100 text-green-700', icon: 'fa-check-circle' },
                'failed': { text: 'Thất bại', class: 'bg-red-100 text-red-700', icon: 'fa-times-circle' }
            };
            const info = statusMap[status] || statusMap['unpaid'];
            return `<span class="px-2 py-1 rounded-lg text-xs font-medium ${info.class}"><i class="fas ${info.icon} mr-1"></i>${info.text}</span>`;
        }

        function renderReservations(items) {
            const tbody = document.getElementById('reservations-tbody');
            if (items.length === 0) { 
                tbody.innerHTML = `<tr><td colspan="10" class="px-6 py-12 text-center text-slate-500">Chưa có đặt bàn</td></tr>`; 
                return; 
            }
            
            tbody.innerHTML = items.map(res => {
                const itemCount = res.so_mon_da_dat || 0;
                const totalPrice = res.tong_tien_du_kien || 0;
                return `
                <tr class="hover:bg-slate-50">
                    <td class="px-6 py-4 text-sm font-semibold text-slate-800">#${res.ma_dat_ban}</td>
                    <td class="px-6 py-4">
                        <div class="text-sm font-medium text-slate-700">${res.ten_nguoi_dat}</div>
                        ${res.ten_nguoi_dung ? `<div class="text-xs text-blue-600"><i class="fas fa-user-circle mr-1"></i>${res.ten_nguoi_dung}</div>` : ''}
                    </td>
                    <td class="px-6 py-4 text-sm"><div class="text-slate-700">${res.so_dien_thoai}</div></td>
                    <td class="px-6 py-4 text-sm text-slate-700">${new Date(res.ngay_dat).toLocaleDateString('vi-VN')}</td>
                    <td class="px-6 py-4 text-sm font-semibold text-blue-600">${res.gio_den}</td>
                    <td class="px-6 py-4 text-sm text-slate-700">${res.so_luong} người</td>
                    <td class="px-6 py-4">
                        ${itemCount > 0 ? `
                            <div class="text-sm">
                                <span class="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg font-medium">${itemCount} món</span>
                                <div class="text-xs text-gray-500 mt-1">${formatPrice(totalPrice)}</div>
                            </div>
                        ` : `<span class="text-xs text-gray-400">Chưa đặt món</span>`}
                    </td>
                    <td class="px-6 py-4">
                        ${getPaymentStatusBadge(res.trang_thai_thanh_toan)}
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex flex-wrap gap-1">
                            <button onclick="updateStatus(${res.ma_dat_ban}, 'pending')" 
                                class="px-2 py-1 rounded-lg text-xs font-medium transition-all ${res.trang_thai === 'pending' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}" 
                                title="Chờ xác nhận"><i class="fas fa-clock"></i></button>
                            <button onclick="updateStatus(${res.ma_dat_ban}, 'confirmed')" 
                                class="px-2 py-1 rounded-lg text-xs font-medium transition-all ${res.trang_thai === 'confirmed' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}" 
                                title="Đã xác nhận"><i class="fas fa-check"></i></button>
                            <button onclick="updateStatus(${res.ma_dat_ban}, 'attended')" 
                                class="px-2 py-1 rounded-lg text-xs font-medium transition-all ${res.trang_thai === 'attended' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}" 
                                title="Đã xác nhận (Admin)"><i class="fas fa-user-check"></i></button>
                            <button onclick="updateStatus(${res.ma_dat_ban}, 'cancelled')" 
                                class="px-2 py-1 rounded-lg text-xs font-medium transition-all ${res.trang_thai === 'cancelled' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'}" 
                                title="Đã hủy"><i class="fas fa-times"></i></button>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <button onclick="viewDetail(${res.ma_dat_ban})" class="text-blue-600 hover:text-blue-800 p-2" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `}).join('');
        }

        async function updateStatus(id, newStatus) {
            try {
                const response = await fetch(`${API_URL}/reservations/${id}/status`, { 
                    method: 'PUT', 
                    credentials: 'include', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ trang_thai: newStatus }) 
                });
                const result = await response.json();
                if (result.success) { 
                    const statusText = {
                        'pending': 'Chờ xác nhận',
                        'confirmed': 'Đã xác nhận',
                        'attended': 'Đã xác nhận (Admin)',
                        'cancelled': 'Đã hủy'
                    };
                    showNotification(`Cập nhật trạng thái thành "${statusText[newStatus]}" thành công!`, 'success');
                    loadReservations(); 
                } else {
                    showNotification('Lỗi: ' + result.message, 'error');
                }
            } catch (error) { 
                console.error('Error:', error); 
                showNotification('Có lỗi xảy ra khi cập nhật trạng thái', 'error'); 
            }
        }

        async function viewDetail(id) {
            try {
                const response = await fetch(`${API_URL}/reservations/${id}`, { credentials: 'include' });
                const result = await response.json();
                
                if (result.success) {
                    currentReservation = result.data;
                    showDetailModal(result.data);
                } else {
                    showNotification('Không thể tải chi tiết đặt bàn', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('Có lỗi xảy ra', 'error');
            }
        }

        function showDetailModal(res) {
            document.getElementById('modal-id').textContent = `#${res.ma_dat_ban}`;
            document.getElementById('modal-name').textContent = res.ten_nguoi_dat;
            document.getElementById('modal-phone').textContent = res.so_dien_thoai;
            document.getElementById('modal-user').textContent = res.ten_nguoi_dung || res.nguoi_dung_email || 'Khách vãng lai';
            document.getElementById('modal-created').textContent = new Date(res.thoi_gian_tao).toLocaleString('vi-VN');
            
            document.getElementById('modal-date').textContent = new Date(res.ngay_dat).toLocaleDateString('vi-VN');
            document.getElementById('modal-time').textContent = res.gio_den;
            document.getElementById('modal-guests').textContent = `${res.so_luong} người`;
            
            const statusMap = {
                'pending': { text: 'Chờ xác nhận', class: 'text-amber-600' },
                'confirmed': { text: 'Đã xác nhận', class: 'text-blue-600' },
                'attended': { text: 'Đã xác nhận (Admin)', class: 'text-emerald-600' },
                'cancelled': { text: 'Đã hủy', class: 'text-red-600' }
            };
            const status = statusMap[res.trang_thai] || statusMap['pending'];
            document.getElementById('modal-status').textContent = status.text;
            document.getElementById('modal-status').className = `font-bold ${status.class}`;
            
            // Payment status
            const paymentStatusMap = {
                'unpaid': { text: 'Chưa thanh toán', class: 'text-gray-600' },
                'pending': { text: 'Đang xử lý', class: 'text-yellow-600' },
                'paid': { text: 'Đã thanh toán', class: 'text-green-600' },
                'failed': { text: 'Thất bại', class: 'text-red-600' }
            };
            const paymentStatus = paymentStatusMap[res.trang_thai_thanh_toan] || paymentStatusMap['unpaid'];
            document.getElementById('modal-payment-status').textContent = paymentStatus.text;
            document.getElementById('modal-payment-status').className = `font-bold ${paymentStatus.class}`;
            
            const noteDiv = document.getElementById('modal-note');
            if (res.ghi_chu) {
                document.getElementById('modal-note-text').textContent = res.ghi_chu;
                noteDiv.classList.remove('hidden');
            } else {
                noteDiv.classList.add('hidden');
            }
            
            const items = res.mon_an || [];
            document.getElementById('modal-items-count').textContent = `${items.length} món`;
            
            const itemsList = document.getElementById('modal-items-list');
            if (items.length > 0) {
                itemsList.innerHTML = items.map(item => {
                    let imagePath = item.anh_mon || '/images/placeholder.jpg';
                    if (imagePath && !imagePath.startsWith('/') && !imagePath.startsWith('http')) {
                        imagePath = '/images/' + imagePath;
                    }
                    const imageUrl = imagePath.startsWith('http') ? imagePath : `${API_URL.replace('/api', '')}${imagePath}`;
                    
                    return `
                        <div class="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                            <img src="${imageUrl}" alt="${item.ten_mon}" 
                                 class="w-14 h-14 rounded-lg object-cover"
                                 onerror="this.src='../images/placeholder.svg'">
                            <div class="flex-1 min-w-0">
                                <p class="font-semibold text-gray-800">${item.ten_mon}</p>
                                <p class="text-sm text-gray-500">SL: ${item.so_luong} x ${formatPrice(item.gia_tai_thoi_diem)}</p>
                            </div>
                            <p class="font-bold text-orange-600">${formatPrice(item.so_luong * item.gia_tai_thoi_diem)}</p>
                        </div>
                    `;
                }).join('');
            } else {
                itemsList.innerHTML = `
                    <div class="text-center py-6 text-gray-400">
                        <i class="fas fa-utensils text-3xl mb-2 opacity-50"></i>
                        <p>Chưa đặt món trước</p>
                    </div>
                `;
            }
            
            document.getElementById('modal-total').textContent = formatPrice(res.tong_tien_du_kien || 0);
            document.getElementById('detail-modal').classList.remove('hidden');
        }

        function closeModal() {
            document.getElementById('detail-modal').classList.add('hidden');
            currentReservation = null;
        }

        function printReservation() {
            if (!currentReservation) return;
            const res = currentReservation;
            const items = res.mon_an || [];
            
            const printContent = `
                <html>
                <head>
                    <title>Phiếu đặt bàn #${res.ma_dat_ban}</title>
                    <style>
                        body { font-family: 'Quicksand', 'Be Vietnam Pro', 'Plus Jakarta Sans', system-ui, sans-serif; padding: 20px; }
                        h1 { text-align: center; color: #ea580c; }
                        .info { margin: 20px 0; }
                        .info p { margin: 5px 0; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                        th { background: #f5f5f5; }
                        .total { text-align: right; font-size: 18px; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h1>PHIẾU ĐẶT BÀN #${res.ma_dat_ban}</h1>
                    <div class="info">
                        <p><strong>Khách hàng:</strong> ${res.ten_nguoi_dat}</p>
                        <p><strong>SĐT:</strong> ${res.so_dien_thoai}</p>
                        <p><strong>Ngày đến:</strong> ${new Date(res.ngay_dat).toLocaleDateString('vi-VN')}</p>
                        <p><strong>Giờ đến:</strong> ${res.gio_den}</p>
                        <p><strong>Số khách:</strong> ${res.so_luong} người</p>
                        ${res.ghi_chu ? `<p><strong>Ghi chú:</strong> ${res.ghi_chu}</p>` : ''}
                    </div>
                    ${items.length > 0 ? `
                        <h3>Món đặt trước:</h3>
                        <table>
                            <tr><th>Món</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr>
                            ${items.map(item => `
                                <tr>
                                    <td>${item.ten_mon}</td>
                                    <td>${item.so_luong}</td>
                                    <td>${formatPrice(item.gia_tai_thoi_diem)}</td>
                                    <td>${formatPrice(item.so_luong * item.gia_tai_thoi_diem)}</td>
                                </tr>
                            `).join('')}
                        </table>
                        <p class="total">Tổng dự kiến: ${formatPrice(res.tong_tien_du_kien || 0)}</p>
                    ` : '<p><em>Chưa đặt món trước</em></p>'}
                    <p style="text-align: center; margin-top: 30px; color: #666;">In lúc: ${new Date().toLocaleString('vi-VN')}</p>
                </body>
                </html>
            `;
            
            const printWindow = window.open('', '_blank');
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.print();
        }

        function applyFilters() {
            const search = document.getElementById('search').value.toLowerCase();
            const status = document.getElementById('status-filter').value;
            let filtered = reservations.filter(r => {
                const matchSearch = r.ten_nguoi_dat.toLowerCase().includes(search) || r.so_dien_thoai.includes(search);
                const matchStatus = !status || r.trang_thai === status;
                return matchSearch && matchStatus;
            });
            renderReservations(filtered);
        }

        // Close modal when clicking outside
        document.getElementById('detail-modal').addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });

        // Show notification
        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            const bgColor = type === 'success' ? 'bg-green-500' : 
                            type === 'error' ? 'bg-red-500' : 
                            type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
            const icon = type === 'success' ? 'fa-check-circle' : 
                         type === 'error' ? 'fa-exclamation-circle' : 
                         type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
            
            notification.className = `fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-lg ${bgColor} text-white flex items-center gap-3 animate-slide-in`;
            notification.innerHTML = `
                <i class="fas ${icon} text-xl"></i>
                <span class="font-medium">${message}</span>
            `;
            notification.style.animation = 'slideIn 0.3s ease-out';
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        loadReservations();
