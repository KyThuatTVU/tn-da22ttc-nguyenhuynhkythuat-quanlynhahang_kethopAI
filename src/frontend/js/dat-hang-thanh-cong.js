/* ==== Script 1 (tách từ dat-hang-thanh-cong.html) ==== */
// API Configuration
        const API_URL = window.API_URL || 'http://localhost:3000/api';

        // Get token
        function getToken() {
            return localStorage.getItem('token') || sessionStorage.getItem('token');
        }

        // Format currency
        function formatCurrency(amount) {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
        }

        // Get order ID from URL
        function getOrderId() {
            const urlParams = new URLSearchParams(window.location.search);
            // Try both 'orderId' and 'order' parameters
            return urlParams.get('orderId') || urlParams.get('order');
        }

        // Load order details
        async function loadOrderDetails() {
            const orderId = getOrderId();
            const orderCodeEl = document.getElementById('order-code');

            console.log('🔍 Order ID from URL:', orderId);

            if (!orderId) {
                console.error('❌ No order ID found in URL');
                orderCodeEl.textContent = 'Không tìm thấy mã đơn hàng';
                return;
            }

            orderCodeEl.textContent = `DH${String(orderId).padStart(6, '0')}`;

            try {
                const token = getToken();
                console.log('🔑 Token:', token ? 'Found' : 'Not found');
                
                const url = `${API_URL}/orders/${orderId}`;
                console.log('📡 Fetching:', url);
                
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log('📥 Response status:', response.status);

                if (response.ok) {
                    const result = await response.json();
                    console.log('📦 Order data:', result);
                    
                    if (result.success) {
                        displayOrderDetails(result.data);
                    } else {
                        console.error('❌ API returned success=false:', result.message);
                        orderCodeEl.textContent = result.message || 'Không tìm thấy đơn hàng';
                    }
                } else {
                    const errorText = await response.text();
                    console.error('❌ API error:', response.status, errorText);
                    orderCodeEl.textContent = 'Lỗi khi tải đơn hàng';
                }
            } catch (error) {
                console.error('❌ Error loading order:', error);
                orderCodeEl.textContent = 'Lỗi kết nối';
            }
        }

        // Display order details
        function displayOrderDetails(order) {
            const itemsContainer = document.getElementById('order-items');
            const subtotalEl = document.getElementById('subtotal');
            const shippingEl = document.getElementById('shipping');
            const totalEl = document.getElementById('total');

            if (order.items && order.items.length > 0) {
                itemsContainer.innerHTML = order.items.map(item => `
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-600">
                            <span class="font-medium">${item.ten_mon}</span>
                            <span class="text-gray-400"> x${item.so_luong}</span>
                        </span>
                        <span class="font-medium">${formatCurrency(item.thanh_tien)}</span>
                    </div>
                `).join('');
            }

            const subtotal = order.tong_tien_hang || 0;
            const shipping = order.phi_van_chuyen || 0;
            const total = order.tong_thanh_toan || 0;

            if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
            if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Miễn phí' : formatCurrency(shipping);
            if (totalEl) totalEl.textContent = formatCurrency(total);
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', async function () {
            // Clear cart after successful payment
            const urlParams = new URLSearchParams(window.location.search);
            const payment = urlParams.get('payment');
            const status = urlParams.get('status');
            const orderId = getOrderId();

            // Xóa giỏ hàng khi đặt hàng thành công
            if (orderId) {
                console.log('✅ Order successful, marking cart as ordered...');
                try {
                    const token = getToken();
                    if (token) {
                        // Gọi API để đánh dấu giỏ hàng đã đặt (tạo giỏ mới cho user)
                        const response = await fetch(`${API_URL}/cart/mark-ordered`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        const result = await response.json();
                        console.log('📦 Mark cart ordered result:', result);
                        
                        // Reload cart trong cartManager để cập nhật UI
                        if (typeof cartManager !== 'undefined') {
                            await cartManager.loadCart();
                        }
                    }
                } catch (error) {
                    console.error('❌ Error marking cart as ordered:', error);
                }
                
                // Xóa localStorage cart backup
                localStorage.removeItem('cart');
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (user.ma_nguoi_dung) {
                    localStorage.removeItem(`cart_${user.ma_nguoi_dung}`);
                }
            }

            loadOrderDetails();
            loadSuggestedProducts();
        });

        // Load suggested products
        async function loadSuggestedProducts() {
            try {
                const response = await fetch(`${API_URL}/menu?limit=8&sort=random`);
                const result = await response.json();
                
                if (result.success && result.data && result.data.length > 0) {
                    displaySuggestedProducts(result.data.slice(0, 4));
                } else {
                    // Fallback: load popular items
                    const fallbackResponse = await fetch(`${API_URL}/menu?limit=4`);
                    const fallbackResult = await fallbackResponse.json();
                    if (fallbackResult.success && fallbackResult.data) {
                        displaySuggestedProducts(fallbackResult.data.slice(0, 4));
                    }
                }
            } catch (error) {
                console.error('Error loading suggested products:', error);
                document.getElementById('suggested-products').innerHTML = `
                    <div class="col-span-full text-center py-4">
                        <a href="thuc-don.html" class="text-orange-600 hover:underline">
                            <i class="fas fa-utensils mr-2"></i>Xem thực đơn
                        </a>
                    </div>
                `;
            }
        }

        // Display suggested products
        function displaySuggestedProducts(products) {
            const container = document.getElementById('suggested-products');
            
            container.innerHTML = products.map(product => {
                // Xử lý đường dẫn ảnh
                let imagePath = product.anh_mon || 'images/placeholder-food.jpg';
                if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('/')) {
                    imagePath = '/images/' + imagePath;
                }
                const imageUrl = imagePath.startsWith('http') ? imagePath : `http://localhost:3000${imagePath}`;
                
                // Xử lý giá an toàn - tránh NaN
                const price = product.gia_tien ? parseFloat(product.gia_tien) : 0;
                const formattedPrice = !isNaN(price) ? formatCurrency(price) : 'Liên hệ';
                
                return `
                    <a href="chitietmonan.html?id=${product.ma_mon}" class="group block">
                        <div class="bg-gray-100 rounded-lg overflow-hidden aspect-square mb-2">
                            <img src="${imageUrl}" 
                                 alt="${product.ten_mon}"
                                 class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                 onerror="this.src='images/placeholder-food.jpg'">
                        </div>
                        <h4 class="text-sm font-medium text-gray-800 truncate group-hover:text-orange-600 transition">${product.ten_mon}</h4>
                        <p class="text-sm font-bold text-orange-600">${formattedPrice}</p>
                    </a>
                `;
            }).join('');
        }
