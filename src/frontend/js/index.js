/* ==== Script 1 (tách từ index.html) ==== */
const swiper = new Swiper(".mySwiper", {
            loop: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            effect: "fade",
            fadeEffect: { crossFade: true },
            speed: 1000,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
        });

/* ==== Script 2 (tách từ index.html) ==== */
// Danh sách lưu trữ mã các món ăn đã hiển thị ở phần cá nhân hóa để lọc trùng ở phần "Món ngon bán chạy"
        let personalizedDishIds = [];

        // Render stars based on rating
        function renderStarsHome(rating) {
            let stars = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= rating) {
                    stars += '<i class="fas fa-star"></i>';
                } else if (i - 0.5 <= rating) {
                    stars += '<i class="fas fa-star-half-alt"></i>';
                } else {
                    stars += '<i class="far fa-star"></i>';
                }
            }
            return stars;
        }

        // Add to cart helper function
        function addToCartFromFeatured(id, name, price, image) {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingItem = cart.find(item => item.id === id);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ id, name, price, image, quantity: 1 });
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartBadge();
            showNotification('Đã thêm vào giỏ hàng!', 'success');
        }

        // Load personalized recommendations
        async function loadPersonalizedRecommendations() {
            const container = document.getElementById('personalized-recommendations-container');
            if (!container) return;

            try {
                // Determine user token
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                
                // Nếu khách chưa đăng nhập, vẫn hiển thị gợi ý tổng quan (Trending / Phổ biến) thay vì ẩn đi
                const headers = token ? { 'Authorization': 'Bearer ' + token } : {};

                // Đọc các khẩu vị được xem nhiều (>= 5 lần) trong session của người dùng để truyền lên API
                let boostParam = '';
                try {
                    const flavorViews = JSON.parse(sessionStorage.getItem('session_flavor_views') || '{}');
                    const boostedFlavors = Object.entries(flavorViews)
                        .filter(([fId, count]) => count >= 5)
                        .map(([fId]) => fId);
                    if (boostedFlavors.length > 0) {
                        boostParam = '&session_boost_flavors=' + boostedFlavors.join(',');
                    }
                } catch (e) {
                    console.error(e);
                }

                const response = await fetch('http://localhost:3000/api/recommendations?limit=8&mode=homepage&t=' + Date.now() + boostParam, { headers });
                const result = await response.json();
                
                if (result.success && result.data && result.data.length > 0) {
                    // Lưu lại danh sách mã món ăn
                    personalizedDishIds = result.data.map(dish => dish.ma_mon);
                    container.innerHTML = result.data.map(dish => {
                        let imagePath = dish.anh_mon || 'default-food.jpg';
                        if (!imagePath.startsWith('http') && !imagePath.startsWith('/images/')) {
                            imagePath = '/images/' + imagePath.replace(/^\/+/, '');
                        }
                        const imageUrl = imagePath.startsWith('http') ? imagePath : `http://localhost:3000${imagePath}`;
                        const price = new Intl.NumberFormat('vi-VN').format(dish.gia_tien);

                        return `
                            <div class="card-3d-container">
                                <div class="card-3d-inner bg-white rounded-xl overflow-hidden shadow-sm">
                                    <div class="card-shine"></div>
                                    <a href="chitietmonan.html?id=${dish.ma_mon}" class="block">
                                        <div class="relative bg-gray-50 overflow-hidden">
                                            <img src="${imageUrl}" alt="${dish.ten_mon}"
                                                class="w-full h-48 sm:h-56 md:h-64 object-cover"
                                                onerror="this.src='images/default-food.jpg'">
                                        </div>
                                    </a>
                                    <div class="p-3 sm:p-4">
                                        <a href="chitietmonan.html?id=${dish.ma_mon}">
                                            <h3 class="font-medium text-base sm:text-lg mb-2 text-gray-800 hover:text-orange-600 transition truncate" title="${dish.ten_mon}">${dish.ten_mon}</h3>
                                        </a>
                                        <div class="flex items-center mb-2">
                                            <div class="text-yellow-400 text-xs sm:text-sm">
                                                ${renderStarsHome(Number(dish.avg_rating) || 0)}
                                            </div>
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <div>
                                                <span class="text-orange-600 font-bold text-lg sm:text-xl">${price}đ</span>
                                            </div>
                                            <button onclick="addToCartFromFeatured(${dish.ma_mon}, '${dish.ten_mon.replace(/'/g, "\\'")}', ${dish.gia_tien}, '${imageUrl}')"
                                                class="bg-orange-500 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-orange-600 transition shadow-sm hover:shadow-md flex items-center justify-center">
                                                <i class="fas fa-plus text-sm sm:text-base"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('');
                    if (window.initHome3DTiltEffects) {
                        window.initHome3DTiltEffects();
                    }
                } else {
                    personalizedDishIds = [];
                    container.innerHTML = '<p class="col-span-4 text-center text-gray-500 py-8">Chưa có món ăn để hiển thị.</p>';
                }
            } catch (error) {
                personalizedDishIds = [];
                console.error('Error loading personalized recommendations:', error);
                container.innerHTML = '<p class="col-span-4 text-center text-gray-500 py-8">Không thể tải dữ liệu. Vui lòng thử lại sau.</p>';
            }
        }

/* ==== Script 3 (tách từ index.html) ==== */
// Load top selling dishes from API (loại trừ món đã có trong personalized)
        async function loadFeaturedDishes() {
            const container = document.getElementById('featured-dishes-container');
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
                const response = await fetch('http://localhost:3000/api/menu/top-selling?limit=24', { headers }); // Lấy nhiều hơn để filter
                const result = await response.json();
                
                if (result.success && result.data.length > 0) {
                    // Lọc bỏ món đã có trong "Dành Riêng Cho Bạn" (Chỉ áp dụng khi người dùng đã đăng nhập)
                    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                    const filteredDishes = token 
                        ? result.data.filter(dish => !personalizedDishIds.includes(dish.ma_mon))
                        : result.data;
                    
                    // Lấy tối đa 8 món sau khi filter
                    const dishesToShow = filteredDishes.slice(0, 8);
                    
                    if (dishesToShow.length === 0) {
                        container.innerHTML = '<p class="col-span-4 text-center text-gray-500 py-8">Chưa có dữ liệu món ăn bán chạy</p>';
                        return;
                    }
                    
                    // Debug: Log rating data
                    console.log('📊 Top selling dishes (sau khi loại trùng):');
                    dishesToShow.forEach(d => {
                        console.log(`  - ${d.ten_mon}: avg_rating=${d.avg_rating} (type: ${typeof d.avg_rating}), total_reviews=${d.total_reviews}`);
                    });
                    
                    container.innerHTML = dishesToShow.map(dish => {
                        let imagePath = dish.anh_mon || 'default-food.jpg';
                        if (!imagePath.startsWith('http') && !imagePath.startsWith('/images/')) {
                            imagePath = '/images/' + imagePath.replace(/^\/+/, '');
                        }
                        const imageUrl = imagePath.startsWith('http') ? imagePath : `http://localhost:3000${imagePath}`;
                        const price = new Intl.NumberFormat('vi-VN').format(dish.gia_tien);
                        
                        return `
                            <div class="card-3d-container">
                                <div class="card-3d-inner bg-white rounded-xl overflow-hidden shadow-sm">
                                    <div class="card-shine"></div>
                                    <a href="chitietmonan.html?id=${dish.ma_mon}" class="block">
                                        <div class="relative bg-gray-50 overflow-hidden">
                                            <img src="${imageUrl}" alt="${dish.ten_mon}"
                                                class="w-full h-48 sm:h-56 md:h-64 object-cover"
                                                onerror="this.src='images/default-food.jpg'">
                                            <span class="absolute top-2 left-2 sm:top-3 sm:left-3 bg-green-500 text-white px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium absolute-badge">
                                                <i class="fas fa-fire mr-1"></i>Bán chạy
                                            </span>
                                            <button onclick="event.preventDefault(); event.stopPropagation();"
                                                class="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 transition">
                                                <i class="far fa-heart text-sm sm:text-base"></i>
                                            </button>
                                        </div>
                                    </a>
                                    <div class="p-3 sm:p-4">
                                        <a href="chitietmonan.html?id=${dish.ma_mon}">
                                            <h3 class="font-medium text-base sm:text-lg mb-2 text-gray-800 hover:text-orange-600 transition truncate" title="${dish.ten_mon}">${dish.ten_mon}</h3>
                                        </a>
                                        <div class="flex items-center mb-2">
                                            <div class="text-yellow-400 text-xs sm:text-sm">
                                                ${renderStarsHome(Number(dish.avg_rating) || 0)}
                                            </div>
                                            <span class="text-gray-500 text-xs sm:text-sm ml-2">(${Number(dish.total_reviews) || 0} đánh giá)</span>
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <div>
                                                <span class="text-orange-600 font-bold text-lg sm:text-xl">${price}đ</span>
                                            </div>
                                            <button onclick="addToCartFromFeatured(${dish.ma_mon}, '${dish.ten_mon.replace(/'/g, "\\'")}', ${dish.gia_tien}, '${imageUrl}')"
                                                class="bg-orange-500 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-orange-600 transition flex items-center justify-center">
                                                <i class="fas fa-plus text-sm sm:text-base"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('');
                    if (window.initHome3DTiltEffects) {
                        window.initHome3DTiltEffects();
                    }
                } else {
                    container.innerHTML = '<p class="col-span-4 text-center text-gray-500 py-8">Chưa có dữ liệu món ăn bán chạy</p>';
                }
            } catch (error) {
                console.error('Error loading featured dishes:', error);
                container.innerHTML = '<p class="col-span-4 text-center text-gray-500 py-8">Không thể tải dữ liệu. Vui lòng thử lại sau.</p>';
            }
        }

        // Load on page ready (AFTER personalized recommendations)
        document.addEventListener('DOMContentLoaded', () => {
            // Load personalized first, then featured
            loadPersonalizedRecommendations().then(() => {
                loadFeaturedDishes();
            });
        });

/* ==== Script 4 (tách từ index.html) ==== */
// Function để play video YouTube
        function playYoutubeVideo() {
            const thumbnail = document.getElementById('video-thumbnail');
            const iframeContainer = document.getElementById('video-iframe');
            const iframe = iframeContainer.querySelector('iframe');
            
            // Ẩn thumbnail, hiện iframe
            thumbnail.classList.add('hidden');
            iframeContainer.classList.remove('hidden');
            
            // Load video
            iframe.src = iframe.dataset.src;
        }

/* ==== Script 5 (tách từ index.html) ==== */
document.addEventListener('DOMContentLoaded', function () {
            const testimonialSwiper = new Swiper(".testimonialSwiper", {
                loop: true,
                autoplay: {
                    delay: 5000,
                    disableOnInteraction: false,
                },
                effect: "fade",
                fadeEffect: { crossFade: true },
                speed: 800,
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                navigation: {
                    nextEl: '.swiper-button-next-testimonial',
                    prevEl: '.swiper-button-prev-testimonial',
                },
            });
        });

/* ==== Script 6 (tách từ index.html) ==== */
// Scroll to Top functionality
        (function() {
            const scrollBtn = document.getElementById('back-to-top');
            
            if (!scrollBtn) {
                console.error('Scroll button not found!');
                return;
            }
            
            console.log('Scroll to top button initialized');
            
            // Show/hide button based on scroll position
            function checkScroll() {
                if (window.pageYOffset > 300) {
                    scrollBtn.style.opacity = '1';
                    scrollBtn.style.visibility = 'visible';
                    scrollBtn.classList.add('show');
                } else {
                    scrollBtn.style.opacity = '0';
                    scrollBtn.style.visibility = 'hidden';
                    scrollBtn.classList.remove('show');
                }
            }
            
            window.addEventListener('scroll', checkScroll);
            
            // Check on load
            checkScroll();
            
            // Smooth scroll to top when clicked
            scrollBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Scroll to top clicked!');
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        })();

/* ==== Script 7 (tách từ index.html) ==== */
// Logic chọn UI Style
        function bindSelectableLabels(containerId, activeClasses, inactiveClasses) {
            const container = document.getElementById(containerId);
            if(!container) return;
            const labels = container.querySelectorAll('label');
            labels.forEach(lbl => {
                const input = lbl.querySelector('input');
                const box = lbl.querySelector('div');
                input.addEventListener('change', () => {
                    if (input.checked) {
                        box.classList.add(...activeClasses);
                        box.classList.remove(...inactiveClasses);
                    } else {
                        box.classList.remove(...activeClasses);
                        box.classList.add(...inactiveClasses);
                    }
                });
            });
        }

        // Custom Preference Modal Script
        document.addEventListener('DOMContentLoaded', async () => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) return; // Chỉ hiển thị khi đã đăng nhập

            // Kiểm tra flag từ trang đăng nhập - ưu tiên cao nhất
            const shouldShowModal = sessionStorage.getItem('show_preferences_modal');
            
            let needsPreferences = false;
            
            if (shouldShowModal === 'true') {
                // Đã được đánh dấu từ trang đăng nhập - bắt buộc hiển thị
                needsPreferences = true;
                sessionStorage.removeItem('show_preferences_modal'); // Xóa flag
            } else {
                // Nếu không có flag, kiểm tra trực tiếp với server
                // Nếu người dùng đã bỏ qua sở thích trong phiên này thì không làm phiền lại
                if (sessionStorage.getItem('preferences_session_skipped')) return;

                // Kiểm tra xem người dùng đã thực sự cấu hình sở thích trong DB chưa
                try {
                    const checkRes = await fetch('http://localhost:3000/api/recommendations/check-preferences', {
                        headers: {
                            'Authorization': 'Bearer ' + token
                        }
                    });
                    const checkData = await checkRes.json();
                    
                    // Nếu đã lưu sở thích rồi, kết thúc và không hiện modal nữa
                    if (checkData.success && checkData.hasPreferences) {
                        return;
                    }
                    
                    needsPreferences = true;
                } catch (err) {
                    console.error("Lỗi kiểm tra sở thích:", err);
                    return;
                }
            }

            if (!needsPreferences) return;

            // Lấy khẩu vị từ API thay vì danh mục
            try {
                const res = await fetch('http://localhost:3000/api/menu/flavors');
                const data = await res.json();
                
                if (data.success && data.data) {
                    const categoriesContainer = document.getElementById('categories-grid');
                    categoriesContainer.innerHTML = data.data.map(flavor => `
                        <label class="cursor-pointer">
                            <input type="checkbox" value="${flavor.id}" class="pref-category hidden">
                            <div class="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 transition-all duration-300 pref-pill-box">
                                ${flavor.ten_thuoc_tinh}
                            </div>
                        </label>
                    `).join('');

                    const activeClasses = ['bg-gradient-to-br', 'from-orange-500', 'to-red-500', 'text-white', 'border-transparent', 'scale-[1.05]', 'shadow-[0_4px_12px_rgba(234,88,12,0.3)]', 'font-semibold'];
                    const inactiveClasses = ['bg-slate-50', 'border-slate-200', 'text-slate-700'];

                    // Bind events for UI categories
                    bindSelectableLabels('categories-grid', activeClasses, inactiveClasses);
                    
                    // Bind events for keywords
                    bindSelectableLabels('tastes-grid', activeClasses, inactiveClasses);
                    bindSelectableLabels('ingredients-grid', activeClasses, inactiveClasses);

                    // Hiển thị modal với backdrop không cho đóng nếu bắt buộc
                    const modal = document.getElementById('preferences-modal');
                    
                    // Nếu là bắt buộc (từ flag), không cho click ra ngoài để đóng
                    if (shouldShowModal === 'true') {
                        // Ẩn nút "Bỏ qua" khi bắt buộc chọn
                        const skipBtn = document.getElementById('skip-preferences-btn');
                        if (skipBtn) {
                            skipBtn.style.display = 'none';
                        }
                        
                        modal.onclick = (e) => {
                            if (e.target === modal) {
                                e.stopPropagation();
                                // Hiển thị thông báo nhắc nhở
                                const alertDiv = document.createElement('div');
                                alertDiv.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg z-[110] animate-bounce';
                                alertDiv.innerHTML = '<i class="fas fa-exclamation-circle mr-2"></i>Vui lòng chọn khẩu vị yêu thích để tiếp tục!';
                                document.body.appendChild(alertDiv);
                                setTimeout(() => alertDiv.remove(), 3000);
                            }
                        };
                    }
                    
                    modal.classList.remove('hidden');
                    // Kích hoạt animation
                    setTimeout(() => {
                        modal.classList.remove('opacity-0');
                        modal.querySelector('.transform').classList.remove('scale-95');
                    }, 50);
                }
            } catch (err) {
                console.error("Lỗi khởi tạo modal sở thích:", err);
            }
        });

        function closePreferenceModal() {
            const modal = document.getElementById('preferences-modal');
            modal.classList.add('opacity-0');
            modal.querySelector('.transform').classList.add('scale-95');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }

        function skipPreferences() {
            // Kiểm tra nếu đây là lần đăng nhập mới (có flag bắt buộc)
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                if (!user.hasPreferences) {
                    // Hiển thị cảnh báo
                    const alertDiv = document.createElement('div');
                    alertDiv.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-[110]';
                    alertDiv.innerHTML = '<i class="fas fa-exclamation-triangle mr-2"></i>Bạn cần chọn ít nhất 1 khẩu vị để có trải nghiệm tốt nhất!';
                    document.body.appendChild(alertDiv);
                    setTimeout(() => alertDiv.remove(), 3000);
                    return;
                }
            }
            
            // Chỉ cho phép bỏ qua nếu đã có sở thích từ trước
            sessionStorage.setItem('preferences_session_skipped', 'true');
            closePreferenceModal();
        }

        async function savePreferences() {
            const flavorInputs = document.querySelectorAll('.pref-category:checked');
            const flavorIds = Array.from(flavorInputs).map(i => parseInt(i.value));
            
            if (flavorIds.length === 0) {
                // Hiển thị cảnh báo bắt mắt hơn
                const alertDiv = document.createElement('div');
                alertDiv.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg z-[110] animate-bounce';
                alertDiv.innerHTML = '<i class="fas fa-utensils mr-2"></i>Vui lòng chọn ít nhất một khẩu vị món ăn của bạn nhé!';
                document.body.appendChild(alertDiv);
                setTimeout(() => alertDiv.remove(), 3000);
                return;
            }

            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            try {
                const res = await fetch('http://localhost:3000/api/recommendations/preferences', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ flavorIds })
                });
                
                const data = await res.json();
                if (data.success) {
                    // Cập nhật flag hasPreferences trong localStorage
                    const userData = localStorage.getItem('user');
                    if (userData) {
                        const user = JSON.parse(userData);
                        user.hasPreferences = true;
                        localStorage.setItem('user', JSON.stringify(user));
                    }
                    
                    closePreferenceModal();
                    
                    // Hiển thị thông báo thành công
                    const successDiv = document.createElement('div');
                    successDiv.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[110]';
                    successDiv.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Đã lưu sở thích! Đang tải gợi ý cho bạn...';
                    document.body.appendChild(successDiv);
                    setTimeout(() => successDiv.remove(), 3000);
                    
                    // Tải lại gợi ý cá nhân hóa tức thì ở trang chủ, sau đó cập nhật món bán chạy để tránh trùng lặp
                    if(typeof loadPersonalizedRecommendations === 'function') {
                        loadPersonalizedRecommendations().then(() => {
                            if(typeof loadFeaturedDishes === 'function') {
                                loadFeaturedDishes();
                            }
                        });
                    }

                } else {
                    alert('Có lỗi xảy ra: ' + data.message);
                }
            } catch (err) {
                console.error('Lưu sở thích lỗi:', err);
                alert('Không thể lưu sở thích. Vui lòng thử lại!');
            }
        }

/* ==== Script 8 (tách từ index.html) ==== */
// 3D Card Tilt Interaction for Homepage
        window.initHome3DTiltEffects = function() {
            // Filter out touch devices
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            if (isTouchDevice) return;

            const containers = document.querySelectorAll('.card-3d-container');
            containers.forEach(container => {
                // Prevent duplicate listener binding
                if (container.dataset.tiltInitialized) return;
                container.dataset.tiltInitialized = "true";

                const inner = container.querySelector('.card-3d-inner');
                const shine = container.querySelector('.card-shine');
                if (!inner) return;

                let bounds;

                container.addEventListener('mouseenter', () => {
                    bounds = container.getBoundingClientRect();
                    inner.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s ease';
                });

                container.addEventListener('mousemove', (e) => {
                    if (!bounds) bounds = container.getBoundingClientRect();
                    const mouseX = e.clientX;
                    const mouseY = e.clientY;
                    
                    const leftX = mouseX - bounds.left;
                    const topY = mouseY - bounds.top;
                    
                    const cardX = leftX - bounds.width / 2;
                    const cardY = topY - bounds.height / 2;
                    
                    const maxTilt = 10; // Comfortable tilt angle
                    
                    const angleX = -(cardY / (bounds.height / 2)) * maxTilt;
                    const angleY = (cardX / (bounds.width / 2)) * maxTilt;
                    
                    inner.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg)`;
                    
                    if (shine) {
                        const px = (leftX / bounds.width) * 100;
                        const py = (topY / bounds.height) * 100;
                        shine.style.setProperty('--x', `${px}%`);
                        shine.style.setProperty('--y', `${py}%`);
                    }
                });

                container.addEventListener('mouseleave', () => {
                    bounds = null;
                    inner.style.transition = 'transform 0.5s ease-out, box-shadow 0.3s ease';
                    inner.style.transform = 'rotateX(0deg) rotateY(0deg)';
                });
            });
        };

        // Initialize on page load for static cards
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                window.initHome3DTiltEffects();
            }, 500);
        });
