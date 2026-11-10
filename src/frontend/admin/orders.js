/* ==== Script 1 (tách từ orders.html) ==== */
// API_URL declared in admin-layout.js
        let orders = [];
        let currentTab = 'all';

        // Classify a don_hang record as online or pos
        function classifyOrder(o) {
            // POS completed orders cloned into don_hang have ghi_chu = 'Đơn hàng tại bàn POS'
            // Also check ten_khach_vang_lai ending with '(Tại bàn)'
            if (o.ghi_chu === 'Đơn hàng tại bàn POS' ||
                (o.ten_khach_vang_lai && o.ten_khach_vang_lai.includes('(Tại bàn)'))) {
                return 'pos';
            }
            // Online orders: have a delivery address or a linked user account
            return 'online';
        }

        function switchOrderTab(tab) {
            currentTab = tab;
            document.querySelectorAll('.order-tab-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('tab-' + tab).classList.add('active');
            applyFilters();
        }

        // ===== TOAST SYSTEM =====
        function showToast(message, type = 'info') {
            const container = document.getElementById('toast-container');
            const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
            container.appendChild(toast);
            setTimeout(() => {
                toast.style.animation = 'toastSlideOut 0.3s ease forwards';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        async function loadOrders() {
            try {
                const response = await fetch(`${API_URL}/orders/all`, { credentials: 'include' });
                const data = await response.json();
                if (data.success) {
                    // Tag each order with its type
                    orders = (data.data || []).map(o => ({ ...o, _type: classifyOrder(o) }));
                    updateStats(orders);
                    updateTabCounts(orders);
                    filterAndRender();
                }
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('orders-tbody').innerHTML = `
                    <tr><td colspan="8">
                        <div class="empty-state">
                            <div class="empty-state-icon" style="background: #fef2f2; color: #ef4444;">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <p class="text-red-500 font-semibold mb-1">Không thể tải dữ liệu</p>
                            <p class="text-slate-400 text-sm">Vui lòng kiểm tra kết nối và thử lại</p>
                        </div>
                    </td></tr>`;
            }
        }

        function updateTabCounts(list) {
            document.getElementById('count-all').textContent = list.length;
            document.getElementById('count-online').textContent = list.filter(o => o._type === 'online').length;
            document.getElementById('count-pos').textContent = list.filter(o => o._type === 'pos').length;
        }

        function updateStats(ordersList) {
            const stats = { pending: 0, processing: 0, preparing: 0, delivered: 0 };
            ordersList.forEach(o => {
                if (o.trang_thai === 'pending') stats.pending++;
                else if (o.trang_thai === 'confirmed') stats.processing++;
                else if (o.trang_thai === 'preparing') stats.preparing++;
                else if (o.trang_thai === 'delivered') stats.delivered++;
            });
            document.getElementById('stat-pending').textContent = stats.pending;
            document.getElementById('stat-processing').textContent = stats.processing;
            document.getElementById('stat-delivering').textContent = stats.preparing;
            document.getElementById('stat-delivered').textContent = stats.delivered;
        }

        function filterAndRender() {
            const search = document.getElementById('search').value.toLowerCase();
            const status = document.getElementById('status-filter').value;
            const payment = document.getElementById('payment-filter').value;
            let filtered = orders.filter(o => {
                const matchTab = currentTab === 'all' || o._type === currentTab;
                const matchSearch = o.ma_don_hang.toString().includes(search) || (o.ten_khach_hang || o.ten_khach_vang_lai || '').toLowerCase().includes(search);
                const matchStatus = !status || o.trang_thai === status;
                const matchPayment = !payment || o.trang_thai_thanh_toan === payment;
                return matchTab && matchSearch && matchStatus && matchPayment;
            });
            renderOrders(filtered);
        }

        function renderOrders(items) {
            const tbody = document.getElementById('orders-tbody');
            if (items.length === 0) {
                tbody.innerHTML = `
                    <tr><td colspan="8">
                        <div class="empty-state">
                            <div class="empty-state-icon" style="background: #f8fafc; color: #94a3b8;">
                                <i class="fas fa-inbox"></i>
                            </div>
                            <p class="text-slate-500 font-semibold mb-1">Chưa có đơn hàng</p>
                            <p class="text-slate-400 text-sm">Đơn hàng mới sẽ xuất hiện tại đây</p>
                        </div>
                    </td></tr>`;
                return;
            }
            tbody.innerHTML = items.map(order => {
                const tenKhach = order.ten_khach_hang || order.ten_khach_vang_lai || 'Khách hàng';
                const trangThaiTT = order.trang_thai_thanh_toan || 'pending';
                const trangThaiDH = order.trang_thai || 'pending';

                const statusConfig = {
                    pending:   { badge: 'badge-pending',   icon: 'fa-clock',        text: 'Chờ xác nhận' },
                    confirmed: { badge: 'badge-confirmed', icon: 'fa-check',        text: 'Đã xác nhận' },
                    preparing: { badge: 'badge-preparing', icon: 'fa-utensils',     text: 'Đang chuẩn bị' },
                    delivered: { badge: 'badge-delivered', icon: 'fa-check-circle', text: 'Hoàn thành' },
                    cancelled: { badge: 'badge-cancelled', icon: 'fa-times-circle', text: 'Đã hủy' }
                };
                const sc = statusConfig[trangThaiDH] || statusConfig.pending;

                const stepConfigs = [
                    { status: 'pending',   icon: 'fa-clock',        bg: '#fef3c7', bgActive: '#f59e0b', color: '#92400e', colorActive: '#fff', title: 'Chờ xác nhận' },
                    { status: 'confirmed', icon: 'fa-check',        bg: '#dbeafe', bgActive: '#3b82f6', color: '#1e40af', colorActive: '#fff', title: 'Đã xác nhận' },
                    { status: 'preparing', icon: 'fa-utensils',     bg: '#ede9fe', bgActive: '#8b5cf6', color: '#5b21b6', colorActive: '#fff', title: 'Đang chuẩn bị' },
                    { status: 'delivered', icon: 'fa-check-circle', bg: '#d1fae5', bgActive: '#10b981', color: '#065f46', colorActive: '#fff', title: 'Hoàn thành' },
                    { status: 'cancelled', icon: 'fa-times',        bg: '#fee2e2', bgActive: '#ef4444', color: '#991b1b', colorActive: '#fff', title: 'Đã hủy' }
                ];

                const stepsHtml = stepConfigs.map(s => {
                    const isActive = trangThaiDH === s.status;
                    return `<button onclick="updateOrderStatus(${order.ma_don_hang}, '${s.status}')" 
                        class="status-step-btn ${isActive ? 'active-step' : ''}"
                        style="background: ${isActive ? s.bgActive : s.bg}; color: ${isActive ? s.colorActive : s.color};"
                        title="${s.title}">
                        <i class="fas ${s.icon}"></i>
                    </button>`;
                }).join('');

                const sourceHtml = order._type === 'pos'
                    ? `<span class="source-badge source-pos"><i class="fas fa-cash-register"></i> POS</span>`
                    : `<span class="source-badge source-online"><i class="fas fa-globe"></i> Trực tuyến</span>`;

                return `
                    <tr>
                        <td><span class="order-code">#DH${String(order.ma_don_hang).padStart(6, '0')}</span></td>
                        <td>${sourceHtml}</td>
                        <td>
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold flex-shrink-0">
                                    ${tenKhach.charAt(0).toUpperCase()}
                                </div>
                                <span class="font-medium text-slate-700">${tenKhach}</span>
                            </div>
                        </td>
                        <td class="text-slate-500">${formatDate(order.thoi_gian_tao)}</td>
                        <td><span class="font-bold text-blue-600">${formatPrice(order.tong_tien || 0)}</span></td>
                        <td>
                            <div class="payment-wrap" data-payment-wrap="${order.ma_don_hang}">
                                <button type="button"
                                    onclick="event.stopPropagation(); togglePaymentMenu(${order.ma_don_hang})"
                                    class="payment-badge payment-btn ${trangThaiTT === 'success' ? 'payment-success' : (trangThaiTT === 'failed' ? 'payment-failed' : 'payment-pending')}"
                                    title="Click để cập nhật trạng thái thanh toán">
                                    <i class="fas ${trangThaiTT === 'success' ? 'fa-check-circle' : (trangThaiTT === 'failed' ? 'fa-times-circle' : 'fa-clock')}"></i>
                                    ${trangThaiTT === 'success' ? 'Đã TT' : (trangThaiTT === 'failed' ? 'TT lỗi' : 'Chưa TT')}
                                    <i class="fas fa-caret-down ml-1 text-xs opacity-70"></i>
                                </button>
                                <div class="payment-menu" id="payment-menu-${order.ma_don_hang}">
                                    <button type="button" onclick="updatePaymentStatus(${order.ma_don_hang}, 'pending')" class="${trangThaiTT === 'pending' ? 'active' : ''}">
                                        <i class="fas fa-clock text-amber-500"></i> Chưa thanh toán
                                    </button>
                                    <button type="button" onclick="updatePaymentStatus(${order.ma_don_hang}, 'success')" class="${trangThaiTT === 'success' ? 'active' : ''}">
                                        <i class="fas fa-check-circle text-emerald-500"></i> Đã thanh toán
                                    </button>
                                    <button type="button" onclick="updatePaymentStatus(${order.ma_don_hang}, 'failed')" class="${trangThaiTT === 'failed' ? 'active' : ''}">
                                        <i class="fas fa-times-circle text-red-500"></i> Thanh toán lỗi
                                    </button>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="status-steps">
                                ${stepsHtml}
                            </div>
                        </td>
                        <td class="text-center">
                            <button onclick="viewOrder(${order.ma_don_hang})" class="btn-view" title="Xem chi tiết">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>`;
            }).join('');
        }

        async function updateOrderStatus(orderId, newStatus) {
            try {
                const response = await fetch(`${API_URL}/orders/${orderId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ trang_thai_don_hang: newStatus }) });
                const result = await response.json();
                if (result.success) {
                    showToast('Cập nhật trạng thái thành công!', 'success');
                    loadOrders();
                } else {
                    showToast('Lỗi: ' + result.message, 'error');
                }
            } catch (error) { console.error('Error:', error); showToast('Có lỗi xảy ra khi cập nhật', 'error'); }
        }

        // === Trạng thái thanh toán ===
        function togglePaymentMenu(orderId) {
            // Đóng tất cả menu khác
            document.querySelectorAll('.payment-menu.show').forEach(function (el) {
                if (el.id !== 'payment-menu-' + orderId) el.classList.remove('show');
            });
            const menu = document.getElementById('payment-menu-' + orderId);
            if (menu) menu.classList.toggle('show');
        }

        // Click ra ngoài → đóng menu thanh toán
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.payment-wrap')) {
                document.querySelectorAll('.payment-menu.show').forEach(function (el) {
                    el.classList.remove('show');
                });
            }
        });

        async function updatePaymentStatus(orderId, newStatus) {
            const labels = { pending: 'Chưa thanh toán', success: 'Đã thanh toán', failed: 'Thanh toán lỗi' };
            const order = orders.find(function (o) { return o.ma_don_hang === orderId; });
            const current = (order && order.trang_thai_thanh_toan) || 'pending';
            if (current === newStatus) {
                // Không có gì thay đổi → chỉ đóng menu
                const menu = document.getElementById('payment-menu-' + orderId);
                if (menu) menu.classList.remove('show');
                return;
            }
            if (current === 'success' && newStatus !== 'success') {
                showToast('Đơn đã thanh toán thành công, không thể đổi sang trạng thái khác.', 'error');
                return;
            }
            if (!confirm('Xác nhận đổi trạng thái thanh toán đơn #DH' + String(orderId).padStart(6, '0') + ' sang "' + labels[newStatus] + '"?')) {
                return;
            }
            try {
                const response = await fetch(`${API_URL}/orders/${orderId}/payment-status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ trang_thai_thanh_toan: newStatus })
                });
                const result = await response.json();
                if (result.success) {
                    showToast('Cập nhật trạng thái thanh toán thành công!', 'success');
                    loadOrders();
                } else {
                    showToast('Lỗi: ' + (result.message || 'Không cập nhật được'), 'error');
                }
            } catch (err) {
                console.error('Error updating payment:', err);
                showToast('Lỗi kết nối server', 'error');
            }
        }

        function viewOrder(orderId) {
            const order = orders.find(o => o.ma_don_hang === orderId);
            if (!order) return;

            const statusConfig = {
                pending:   { badge: 'badge-pending',   icon: 'fa-clock',        text: 'Chờ xác nhận' },
                confirmed: { badge: 'badge-confirmed', icon: 'fa-check',        text: 'Đã xác nhận' },
                preparing: { badge: 'badge-preparing', icon: 'fa-utensils',     text: 'Đang chuẩn bị' },
                delivered: { badge: 'badge-delivered', icon: 'fa-check-circle', text: 'Hoàn thành' },
                cancelled: { badge: 'badge-cancelled', icon: 'fa-times-circle', text: 'Đã hủy' }
            };
            const sc = statusConfig[order.trang_thai] || statusConfig.pending;

            document.getElementById('order-detail').innerHTML = `
                <div class="space-y-6">
                    <!-- Order Info Grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="info-card">
                            <div class="info-card-icon" style="background: linear-gradient(135deg, #dbeafe, #bfdbfe); color: #2563eb;">
                                <i class="fas fa-hashtag"></i>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500 font-medium">Mã đơn hàng</p>
                                <p class="font-bold text-slate-800 mt-0.5">#DH${String(order.ma_don_hang).padStart(6, '0')}</p>
                            </div>
                        </div>
                        <div class="info-card">
                            <div class="info-card-icon" style="background: linear-gradient(135deg, #ede9fe, #ddd6fe); color: #7c3aed;">
                                <i class="fas fa-calendar-alt"></i>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500 font-medium">Ngày đặt</p>
                                <p class="font-bold text-slate-800 mt-0.5">${formatDate(order.thoi_gian_tao)}</p>
                            </div>
                        </div>
                        <div class="info-card">
                            <div class="info-card-icon" style="background: linear-gradient(135deg, #fce7f3, #fbcfe8); color: #db2777;">
                                <i class="fas ${order._type === 'pos' ? 'fa-chair' : 'fa-user'}"></i>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500 font-medium">${order._type === 'pos' ? 'Khách ăn tại nhà hàng' : 'Khách hàng'}</p>
                                <p class="font-bold text-slate-800 mt-0.5">${order.ten_khach_hang || order.ten_khach_vang_lai || 'Khách hàng'}</p>
                            </div>
                        </div>
                        ${order._type === 'online' ? `
                        <div class="info-card">
                            <div class="info-card-icon" style="background: linear-gradient(135deg, #d1fae5, #a7f3d0); color: #059669;">
                                <i class="fas fa-phone"></i>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500 font-medium">Số điện thoại</p>
                                <p class="font-bold text-slate-800 mt-0.5">${order.so_dt_khach || 'N/A'}</p>
                            </div>
                        </div>` : ''}
                    </div>

                    <!-- Address / Note -->
                    ${order._type === 'online' ? `
                    <div class="info-card">
                        <div class="info-card-icon" style="background: linear-gradient(135deg, #fef3c7, #fde68a); color: #d97706;">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <div class="flex-1">
                            <p class="text-xs text-slate-500 font-medium">Địa chỉ giao hàng</p>
                            <p class="font-medium text-slate-800 mt-0.5">${order.dia_chi_giao || 'N/A'}</p>
                        </div>
                    </div>` : `
                    <div class="info-card">
                        <div class="info-card-icon" style="background: linear-gradient(135deg, #fef3c7, #fde68a); color: #d97706;">
                            <i class="fas fa-cash-register"></i>
                        </div>
                        <div class="flex-1">
                            <p class="text-xs text-slate-500 font-medium">Loại đơn hàng</p>
                            <p class="font-medium text-slate-800 mt-0.5">Thanh toán tại quầy (POS)</p>
                        </div>
                    </div>
                    `}

                    <!-- Status -->

                    <div class="flex items-center gap-3">
                        <span class="text-sm text-slate-500 font-medium">Trạng thái:</span>
                        <span class="status-badge ${sc.badge}"><i class="fas ${sc.icon}"></i>${sc.text}</span>
                    </div>

                    <!-- Order Items -->
                    <div>
                        <p class="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <i class="fas fa-list-ul text-blue-500"></i>
                            Chi tiết đơn hàng
                        </p>
                        <div class="rounded-xl overflow-hidden border border-slate-100">
                            ${order.items && order.items.length > 0 ? `
                                <table class="w-full">
                                    <thead>
                                        <tr class="bg-slate-50">
                                            <th class="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Món ăn</th>
                                            <th class="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">SL</th>
                                            <th class="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Đơn giá</th>
                                            <th class="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${order.items.map(item => `
                                            <tr class="border-t border-slate-50">
                                                <td class="py-3 px-4">
                                                    <p class="font-medium text-slate-800 text-sm">${item.ten_mon}</p>
                                                </td>
                                                <td class="py-3 px-4 text-center">
                                                    <span class="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-600">${item.so_luong} <small class="text-[10px] uppercase font-bold text-slate-400">Phần</small></span>
                                                </td>
                                                <td class="py-3 px-4 text-right text-sm text-slate-600">${formatPrice(item.gia_tai_thoi_diem || item.gia)}</td>
                                                <td class="py-3 px-4 text-right text-sm font-bold text-slate-800">${formatPrice(item.so_luong * (item.gia_tai_thoi_diem || item.gia))}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            ` : '<p class="text-slate-400 text-center py-6">Không có chi tiết</p>'}
                        </div>
                    </div>

                    <!-- Total -->
                    <div class="flex justify-between items-center p-5 rounded-xl" style="background: #8c6239;">
                        <span class="text-white font-semibold text-lg">Tổng thanh toán</span>
                        <span class="text-white font-bold text-2xl">${formatPrice(order.tong_tien || 0)}</span>
                    </div>
                </div>`;
            
            const modal = document.getElementById('order-modal');
            modal.classList.add('show');
        }

        function closeModal() { document.getElementById('order-modal').classList.remove('show'); }
        function formatPrice(price) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price); }
        function formatDate(date) { return new Date(date).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }); }
        // Replace old applyFilters to use new filterAndRender
        function applyFilters() { filterAndRender(); }
        
        // Kiểm tra nếu có order ID trong URL thì mở modal chi tiết
        function checkUrlForOrderId() {
            const urlParams = new URLSearchParams(window.location.search);
            const orderId = urlParams.get('id');
            console.log('🔍 Checking URL for order ID:', orderId);
            if (orderId) {
                const orderIdNum = parseInt(orderId);
                const order = orders.find(o => o.ma_don_hang === orderIdNum);
                if (order) {
                    console.log('✅ Found order:', order);
                    viewOrder(orderIdNum);
                } else {
                    console.log('⚠️ Order not found in list, trying to fetch directly...');
                    loadOrders().then(() => {
                        const retryOrder = orders.find(o => o.ma_don_hang === orderIdNum);
                        if (retryOrder) {
                            viewOrder(orderIdNum);
                        } else {
                            showToast('Không tìm thấy đơn hàng #' + orderId, 'error');
                        }
                    });
                }
            }
        }
        
        // Load orders trước, sau đó check URL
        loadOrders().then(() => {
            checkUrlForOrderId();
        });

        // Close modal on overlay click
        document.getElementById('order-modal').addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });

        // Close modal on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeModal();
        });
