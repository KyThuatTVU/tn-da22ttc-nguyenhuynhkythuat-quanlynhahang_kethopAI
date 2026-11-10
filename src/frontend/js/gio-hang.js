/* ==== Script 1 (tách từ gio-hang.html) ==== */
// Load ML-based pairing recommendations
    async function loadPairingRecommendations() {
        const section = document.getElementById('pairing-section');
        const container = document.getElementById('pairing-recommendations');
        
        if (!section || !container) return;
        
        // Lấy danh sách món trong giỏ hàng
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const dishIds = cart.map(item => item.id).filter(Boolean);
        
        if (dishIds.length === 0) {
            section.classList.add('hidden');
            return;
        }
        
        try {
            if (typeof RecommendationSystem === 'undefined') {
                console.warn('RecommendationSystem not loaded');
                return;
            }
            
            const recommendations = await RecommendationSystem.getPairingRecommendations(dishIds);
            
            if (recommendations.length === 0) {
                section.classList.add('hidden');
                return;
            }
            
            section.classList.remove('hidden');
            
            container.innerHTML = recommendations.map(dish => {
                let imagePath = dish.anh_mon || 'default-food.jpg';
                if (!imagePath.startsWith('http') && !imagePath.startsWith('/images/')) {
                    imagePath = '/images/' + imagePath.replace(/^\/+/, '');
                }
                const imageUrl = imagePath.startsWith('http') ? imagePath : `http://localhost:3000${imagePath}`;
                const price = new Intl.NumberFormat('vi-VN').format(dish.gia_tien);
                
                return `
                    <div class="flex-shrink-0 w-44">
                        <div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1">
                            <a href="chitietmonan.html?id=${dish.ma_mon}" class="block">
                                <div class="relative">
                                    <img src="${imageUrl}" alt="${dish.ten_mon}" 
                                         class="w-full h-28 object-cover"
                                         onerror="this.src='images/default-food.jpg'">
                                    <span class="absolute top-2 left-2 bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs">
                                        🍽️ Kết hợp
                                    </span>
                                </div>
                            </a>
                            <div class="p-3">
                                <h4 class="font-medium text-sm text-gray-800 line-clamp-1 mb-1">${dish.ten_mon}</h4>
                                <p class="text-xs text-gray-500 line-clamp-1 mb-2">${dish.reason || ''}</p>
                                <div class="flex items-center justify-between">
                                    <span class="text-orange-600 font-bold text-sm">${price}đ</span>
                                    <button onclick="addToCartFromRecommendation(${dish.ma_mon}, '${dish.ten_mon.replace(/'/g, "\\'")}', ${dish.gia_tien}, '${imageUrl}')"
                                            class="bg-orange-500 text-white w-7 h-7 rounded-full hover:bg-orange-600 transition text-xs">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
        } catch (error) {
            console.error('Error loading pairing recommendations:', error);
            section.classList.add('hidden');
        }
    }
    
    // Load ML-based general recommendations
    async function loadMLRecommendations() {
        const container = document.getElementById('recommended-products');
        if (!container) return;
        
        try {
            if (typeof RecommendationSystem === 'undefined') {
                console.warn('RecommendationSystem not loaded, waiting...');
                setTimeout(loadMLRecommendations, 500);
                return;
            }
            
            const recommendations = await RecommendationSystem.getRecommendations(8);
            
            if (recommendations.length > 0) {
                RecommendationSystem.renderList(recommendations, 'recommended-products');
            }
        } catch (error) {
            console.error('Error loading ML recommendations:', error);
        }
    }
    
    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            loadPairingRecommendations();
            loadMLRecommendations();
        }, 800);
    });

/* ==== Script 2 (tách từ gio-hang.html) ==== */
// Initialize cart page
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🛒 Initializing cart page...');

            // Wait for cartManager to be available
            const checkCartManager = setInterval(() => {
                if (typeof cartManager !== 'undefined') {
                    clearInterval(checkCartManager);
                    console.log('✅ CartManager found, loading cart data...');

                    // Load cart data and render
                    loadAndRenderCart();
                }
            }, 100);

            // Set timeout in case cartManager doesn't load
            setTimeout(() => {
                clearInterval(checkCartManager);
                console.warn('⏰ CartManager not loaded within 5 seconds');
            }, 5000);
        });

        // Function to load and render cart
        async function loadAndRenderCart() {
            try {
                const emptyCart = document.getElementById('empty-cart');
                const cartItems = document.getElementById('cart-items');
                
                // Kiểm tra đăng nhập trước
                if (!cartManager.isAuthenticated()) {
                    console.log('👤 User not authenticated');
                    
                    // Hiển thị thông báo yêu cầu đăng nhập
                    if (emptyCart) {
                        emptyCart.innerHTML = `
                            <div class="inline-block mb-4">
                                <i class="fas fa-user-lock text-6xl text-gray-300"></i>
                            </div>
                            <p class="text-gray-500 text-xl mb-2">Vui lòng đăng nhập</p>
                            <p class="text-gray-400 text-sm mb-4">Đăng nhập để xem và quản lý giỏ hàng của bạn</p>
                            <a href="dang-nhap.html?redirect=gio-hang.html"
                                class="inline-block bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition mr-2">
                                <i class="fas fa-sign-in-alt mr-2"></i>Đăng nhập
                            </a>
                            <a href="thuc-don.html"
                                class="inline-block bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition">
                                Xem thực đơn
                            </a>
                        `;
                        emptyCart.classList.remove('hidden');
                    }
                    if (cartItems) cartItems.innerHTML = '';
                    updateCartTotals();
                    return;
                }
                
                // Load cart data
                await cartManager.loadCart();
                console.log('📦 Cart data loaded:', cartManager.getCart());

                // Render cart items
                cartManager.renderCartItems('cart-items');
                console.log('🎨 Cart items rendered');

                // Update cart count in header
                const cartCount = document.getElementById('cart-count');
                if (cartCount) {
                    cartCount.textContent = cartManager.getCart().so_luong || 0;
                }

                // Update totals
                updateCartTotals();

                // Show/hide empty cart message
                if (emptyCart && cartItems) {
                    const itemCount = cartManager.getCart().items.length;
                    console.log('📊 Cart has', itemCount, 'items');

                    if (itemCount === 0) {
                        // Reset về nội dung mặc định cho giỏ hàng trống
                        emptyCart.innerHTML = `
                            <div class="inline-block mb-4">
                                <i class="fas fa-shopping-cart text-6xl text-gray-300"></i>
                            </div>
                            <p class="text-gray-500 text-xl mb-4">Giỏ hàng của bạn đang trống</p>
                            <a href="thuc-don.html"
                                class="inline-block bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition">
                                Tiếp tục mua sắm
                            </a>
                        `;
                        emptyCart.classList.remove('hidden');
                        cartItems.innerHTML = '';
                        console.log('📭 Showing empty cart message');
                    } else {
                        emptyCart.classList.add('hidden');
                        console.log('🛍️ Showing cart items');
                    }
                }
            } catch (error) {
                console.error('❌ Error loading cart:', error);
            }
        }

        // Function to refresh cart (can be called from other scripts)
        window.refreshCart = function() {
            console.log('🔄 Refreshing cart...');
            loadAndRenderCart();
        };

        // Refresh cart when page becomes visible (user navigates back to cart page)
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                console.log('👀 Cart page became visible, refreshing...');
                loadAndRenderCart();
            }
        });

        // Also refresh on focus
        window.addEventListener('focus', function() {
            console.log('🎯 Cart page focused, refreshing...');
            loadAndRenderCart();
        });

        // Function to update cart totals
        function updateCartTotals() {
            const cart = cartManager.getCart();
            const subtotal = cart.tong_tien || 0;
            const itemCount = cart.items ? cart.items.length : 0;
            
            // Không tính phí ship khi giỏ hàng trống hoặc free ship từ 150k
            let shipping = 0;
            if (itemCount > 0) {
                shipping = subtotal >= 150000 ? 0 : 30000; // Free shipping từ 150k (đồng bộ với checkout.js)
            }
            
            const discount = 0; // TODO: Implement voucher system
            const total = subtotal + shipping - discount;

            // Update subtotal with better formatting
            const subtotalElement = document.getElementById('subtotal');
            if (subtotalElement) {
                if (itemCount === 0) {
                    subtotalElement.innerHTML = `
                        <span class="text-lg font-semibold text-gray-400">0đ</span>
                    `;
                } else {
                    subtotalElement.innerHTML = `
                        <span class="text-lg font-semibold text-gray-800">${formatPrice(subtotal)}</span>
                    `;
                }
            }

            // Update shipping with icon and better styling
            const shippingElement = document.getElementById('shipping');
            if (shippingElement) {
                if (itemCount === 0) {
                    // Giỏ hàng trống - không hiển thị phí ship
                    shippingElement.innerHTML = `
                        <span class="text-gray-400">0đ</span>
                    `;
                } else if (shipping === 0) {
                    // Free ship khi đủ điều kiện
                    shippingElement.innerHTML = `
                        <span class="text-green-600 font-semibold flex items-center">
                            <i class="fas fa-truck mr-1"></i>
                            Miễn phí
                        </span>
                    `;
                } else {
                    // Có phí ship
                    shippingElement.innerHTML = `
                        <span class="text-gray-700">${formatPrice(shipping)}</span>
                        <div class="text-xs text-gray-500 mt-1">Miễn phí từ 150.000đ</div>
                    `;
                }
            }

            // Update discount
            const discountElement = document.getElementById('discount');
            if (discountElement) {
                if (discount === 0) {
                    discountElement.innerHTML = `
                        <span class="text-gray-400">-0đ</span>
                    `;
                } else {
                    discountElement.innerHTML = `
                        <span class="text-green-600 font-semibold">-${formatPrice(discount)}</span>
                    `;
                }
            }

            // Update total with prominent styling
            const totalElement = document.getElementById('total');
            if (totalElement) {
                if (itemCount === 0) {
                    totalElement.innerHTML = `
                        <span class="text-2xl font-bold text-gray-400">0đ</span>
                        <div class="text-sm text-gray-500 mt-1">Giỏ hàng trống</div>
                    `;
                } else {
                    totalElement.innerHTML = `
                        <span class="text-2xl font-bold text-orange-600">${formatPrice(total)}</span>
                        <div class="text-sm text-gray-500 mt-1">Thanh toán ngay</div>
                    `;
                }
            }
            
            // Disable/enable checkout button based on cart status
            const checkoutBtn = document.getElementById('checkout-btn');
            if (checkoutBtn) {
                if (itemCount === 0) {
                    checkoutBtn.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
                } else {
                    checkoutBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
                }
            }

            console.log('💰 Updated cart totals:', { subtotal, shipping, discount, total, itemCount });
        }

        // Function to clear entire cart
        function clearCart() {
            if (confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) {
                if (typeof cartManager !== 'undefined') {
                    cartManager.clearCart().then(() => {
                        location.reload(); // Reload to update UI
                    });
                }
            }
        }

        // Format price helper
        function formatPrice(price) {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
        }

        // Load recommended products from API
        async function loadRecommendedProducts() {
            const container = document.getElementById('recommended-products');
            if (!container) return;

            try {
                // Lấy danh sách món ăn từ API
                const response = await fetch(`${window.API_URL || 'http://localhost:3000/api'}/menu`);
                const result = await response.json();

                if (result.success && result.data && result.data.length > 0) {
                    // Lấy các món trong giỏ hàng để loại trừ
                    let cartItemIds = [];
                    if (typeof cartManager !== 'undefined') {
                        const cart = cartManager.getCart();
                        cartItemIds = cart.items.map(item => item.ma_mon);
                    }

                    // Lọc bỏ các món đã có trong giỏ
                    let availableProducts = result.data.filter(item => !cartItemIds.includes(item.ma_mon));
                    
                    // Nếu không còn món nào, dùng tất cả
                    if (availableProducts.length === 0) {
                        availableProducts = result.data;
                    }

                    // Shuffle array để random
                    const shuffled = shuffleArray([...availableProducts]);
                    
                    // Lấy tối đa 4 món
                    renderRecommendedProducts(shuffled.slice(0, 4));
                } else {
                    container.innerHTML = '<p class="text-center text-gray-500 col-span-full">Không có món ăn nào</p>';
                }
            } catch (error) {
                console.error('Error loading recommended products:', error);
                container.innerHTML = '<p class="text-center text-gray-500 col-span-full">Không thể tải món ăn gợi ý</p>';
            }
        }

        // Shuffle array helper (Fisher-Yates algorithm)
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        // Render recommended products
        function renderRecommendedProducts(products) {
            const container = document.getElementById('recommended-products');
            if (!container || !products.length) return;

            container.innerHTML = products.map(item => {
                const imageSrc = item.anh_mon 
                    ? (item.anh_mon.startsWith('http') ? item.anh_mon : `http://localhost:3000${item.anh_mon}`)
                    : 'images/default-dish.jpg';
                
                const rating = item.avg_rating ? parseFloat(item.avg_rating).toFixed(1) : '0';
                const reviews = item.total_reviews || 0;

                return `
                    <div class="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group">
                        <a href="chitietmonan.html?id=${item.ma_mon}" class="block relative overflow-hidden">
                            <img src="${imageSrc}" 
                                 alt="${item.ten_mon}" 
                                 class="w-full h-40 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                                 onerror="this.src='images/default-dish.jpg'">
                            ${item.so_luong_ton <= 5 && item.so_luong_ton > 0 ? 
                                '<span class="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">Sắp hết</span>' : ''}
                            ${item.so_luong_ton === 0 ? 
                                '<span class="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">Hết hàng</span>' : ''}
                        </a>
                        <div class="p-3 sm:p-4">
                            <a href="chitietmonan.html?id=${item.ma_mon}" class="block">
                                <h3 class="font-semibold text-gray-800 mb-1 line-clamp-1 hover:text-orange-600 transition text-sm sm:text-base">${item.ten_mon}</h3>
                            </a>
                            <div class="flex items-center gap-1 mb-2">
                                <div class="flex text-yellow-400 text-xs">
                                    ${generateStars(rating)}
                                </div>
                                <span class="text-xs text-gray-500">(${reviews})</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-orange-600 font-bold text-sm sm:text-base">${formatPrice(item.gia_tien)}</span>
                                <button onclick="addToCartFromRecommended(${item.ma_mon})" 
                                        class="bg-orange-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm hover:bg-orange-700 transition flex items-center gap-1 ${item.so_luong_ton === 0 ? 'opacity-50 cursor-not-allowed' : ''}"
                                        ${item.so_luong_ton === 0 ? 'disabled' : ''}>
                                    <i class="fas fa-plus"></i>
                                    <span class="hidden sm:inline">Thêm</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Generate star rating HTML
        function generateStars(rating) {
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating % 1 >= 0.5;
            const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
            
            let html = '';
            for (let i = 0; i < fullStars; i++) {
                html += '<i class="fas fa-star"></i>';
            }
            if (hasHalfStar) {
                html += '<i class="fas fa-star-half-alt"></i>';
            }
            for (let i = 0; i < emptyStars; i++) {
                html += '<i class="far fa-star"></i>';
            }
            return html;
        }

        // Add to cart from recommended products
        async function addToCartFromRecommended(ma_mon) {
            if (typeof cartManager !== 'undefined') {
                await cartManager.addToCart(ma_mon, 1);
                // Reload cart and recommended products
                await loadAndRenderCart();
                await loadRecommendedProducts();
            } else {
                alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
                window.location.href = 'dang-nhap.html?redirect=gio-hang.html';
            }
        }

        // Load recommended products on page load
        document.addEventListener('DOMContentLoaded', function() {
            loadRecommendedProducts();
        });
