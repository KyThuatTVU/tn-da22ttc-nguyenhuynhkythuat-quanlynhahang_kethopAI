// Hero Banner Component
ComponentManager.register('heroBanner', (data = {}) => {
    const { 
        title = 'Ẩm Thực Phương Nam',
        subtitle = 'Hương vị đậm đà miền Tây sông nước',
        backgroundImage = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920',
        primaryButton = { text: 'Xem thực đơn', link: '/thuc-don/', icon: 'fa-book-open' },
        secondaryButton = { text: 'Đặt bàn ngay', link: '/dat-ban/', icon: 'fa-calendar-check' },
        height = 'min-h-[600px]'
    } = data;
    
    return `
        <section class="hero-banner relative ${height} flex items-center justify-center text-white overflow-hidden" 
                 style="background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${backgroundImage}') center/cover;">
            <div class="container mx-auto px-4 text-center z-10">
                <h1 class="font-playfair text-5xl md:text-7xl font-bold mb-4 animate-fade-in">
                    ${title}
                </h1>
                <p class="text-xl md:text-2xl mb-8 max-w-2xl mx-auto animate-slide-up">
                    ${subtitle}
                </p>
                <div class="flex flex-wrap gap-4 justify-center animate-fade-in-delay">
                    ${primaryButton ? `
                        <a href="${primaryButton.link}" class="btn-primary text-white px-8 py-4 rounded-full font-medium text-lg hover:scale-105 transition shadow-lg">
                            <i class="fas ${primaryButton.icon} mr-2"></i> ${primaryButton.text}
                        </a>
                    ` : ''}
                    ${secondaryButton ? `
                        <a href="${secondaryButton.link}" class="bg-white text-orange-600 px-8 py-4 rounded-full font-medium text-lg hover:scale-105 transition shadow-lg">
                            <i class="fas ${secondaryButton.icon} mr-2"></i> ${secondaryButton.text}
                        </a>
                    ` : ''}
                </div>
            </div>
            <!-- Decorative Elements -->
            <div class="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent"></div>
        </section>
    `;
});

// Category Grid Component
ComponentManager.register('categoryGrid', (categories = []) => {
    const defaultCategories = [
        { icon: '🍲', name: 'Canh & Súp', link: '/thuc-don/?category=canh', color: 'orange' },
        { icon: '🦐', name: 'Hải sản', link: '/thuc-don/?category=hai-san', color: 'blue' },
        { icon: '🥩', name: 'Thịt', link: '/thuc-don/?category=thit', color: 'red' },
        { icon: '🥬', name: 'Rau', link: '/thuc-don/?category=rau', color: 'green' },
        { icon: '🍚', name: 'Cơm', link: '/thuc-don/?category=com', color: 'yellow' },
        { icon: '🧃', name: 'Đồ uống', link: '/thuc-don/?category=nuoc', color: 'purple' }
    ];
    
    const items = categories.length > 0 ? categories : defaultCategories;
    
    return `
        <section class="py-16 bg-white">
            <div class="container mx-auto px-4">
                <h2 class="font-playfair text-4xl font-bold text-center mb-12 text-gray-800">Danh Mục Món Ăn</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    ${items.map(cat => `
                        <a href="${cat.link}" class="card-hover bg-${cat.color}-50 rounded-xl p-6 text-center transform transition duration-300">
                            <div class="text-5xl mb-3">${cat.icon}</div>
                            <h3 class="font-medium text-gray-800">${cat.name}</h3>
                        </a>
                    `).join('')}
                </div>
            </div>
        </section>
    `;
});

// Featured Section Component
ComponentManager.register('featuredSection', (data = {}) => {
    const {
        title = 'Món Ăn Nổi Bật',
        viewAllText = 'Xem tất cả',
        viewAllLink = '/thuc-don/',
        products = [],
        backgroundColor = 'bg-gray-50'
    } = data;
    
    return `
        <section class="py-16 ${backgroundColor}">
            <div class="container mx-auto px-4">
                <div class="flex justify-between items-center mb-12">
                    <h2 class="font-playfair text-4xl font-bold text-gray-800">${title}</h2>
                    <a href="${viewAllLink}" class="text-orange-600 hover:text-orange-700 font-medium flex items-center">
                        ${viewAllText} <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>
                ${ComponentManager.render('productGrid', products)}
            </div>
        </section>
    `;
});

// Features/Benefits Component
ComponentManager.register('featuresSection', (features = []) => {
    const defaultFeatures = [
        { icon: 'fa-shipping-fast', title: 'Giao hàng nhanh', description: 'Miễn phí trong 5km', color: 'orange' },
        { icon: 'fa-award', title: 'Chất lượng đảm bảo', description: '100% tươi ngon', color: 'orange' },
        { icon: 'fa-headset', title: 'Hỗ trợ 24/7', description: 'Tư vấn nhiệt tình', color: 'orange' },
        { icon: 'fa-undo', title: 'Hoàn tiền dễ dàng', description: 'Trong vòng 24h', color: 'orange' }
    ];
    
    const items = features.length > 0 ? features : defaultFeatures;
    
    return `
        <section class="py-16 bg-white">
            <div class="container mx-auto px-4">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    ${items.map(feature => `
                        <div class="text-center transform hover:scale-105 transition duration-300">
                            <div class="bg-${feature.color}-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i class="fas ${feature.icon} text-3xl text-${feature.color}-600"></i>
                            </div>
                            <h3 class="font-medium text-lg mb-2">${feature.title}</h3>
                            <p class="text-gray-600 text-sm">${feature.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
    `;
});

// Testimonial/Review Component
ComponentManager.register('testimonialCard', (data = {}) => {
    const { name, avatar, rating = 5, comment, date } = data;
    
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    
    return `
        <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition">
            <div class="flex items-center mb-4">
                <img src="${avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ea580c&color=fff`}" 
                     alt="${name}" class="w-12 h-12 rounded-full mr-4">
                <div>
                    <h4 class="font-medium">${name}</h4>
                    <div class="text-yellow-400 text-sm">${stars}</div>
                </div>
            </div>
            <p class="text-gray-600 italic mb-3">"${comment}"</p>
            ${date ? `<p class="text-gray-400 text-sm">${date}</p>` : ''}
        </div>
    `;
});

ComponentManager.register('testimonialSection', (testimonials = []) => {
    return `
        <section class="py-16 bg-gray-50">
            <div class="container mx-auto px-4">
                <h2 class="font-playfair text-4xl font-bold text-center mb-12 text-gray-800">
                    Khách Hàng Nói Gì Về Chúng Tôi
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    ${testimonials.map(testimonial => 
                        ComponentManager.render('testimonialCard', testimonial)
                    ).join('')}
                </div>
            </div>
        </section>
    `;
});

// Stats/Counter Component
ComponentManager.register('statsSection', (stats = []) => {
    const defaultStats = [
        { icon: 'fa-calendar', number: '20+', label: 'Năm kinh nghiệm' },
        { icon: 'fa-utensils', number: '100+', label: 'Món ăn đa dạng' },
        { icon: 'fa-users', number: '50K+', label: 'Khách hàng hài lòng' },
        { icon: 'fa-award', number: '30+', label: 'Nhân viên chuyên nghiệp' }
    ];
    
    const items = stats.length > 0 ? stats : defaultStats;
    
    return `
        <section class="py-16 bg-gradient-to-r from-orange-600 to-red-600 text-white">
            <div class="container mx-auto px-4">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    ${items.map(stat => `
                        <div class="transform hover:scale-110 transition duration-300">
                            <i class="fas ${stat.icon} text-4xl mb-3 opacity-80"></i>
                            <p class="text-5xl font-bold mb-2">${stat.number}</p>
                            <p class="text-xl opacity-90">${stat.label}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
    `;
});

// Newsletter Component
ComponentManager.register('newsletter', (data = {}) => {
    const {
        title = 'Đăng Ký Nhận Tin',
        description = 'Nhận thông tin về các món ăn mới và ưu đãi đặc biệt',
        placeholder = 'Nhập email của bạn',
        buttonText = 'Đăng ký',
        backgroundColor = 'bg-orange-600'
    } = data;
    
    return `
        <section class="py-16 ${backgroundColor}">
            <div class="container mx-auto px-4">
                <div class="max-w-2xl mx-auto text-center text-white">
                    <i class="fas fa-envelope text-5xl mb-4 opacity-90"></i>
                    <h2 class="font-playfair text-4xl font-bold mb-4">${title}</h2>
                    <p class="text-xl mb-8 opacity-90">${description}</p>
                    <form class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onsubmit="handleNewsletterSubmit(event)">
                        <input type="email" required 
                               placeholder="${placeholder}" 
                               class="flex-1 px-6 py-4 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-white">
                        <button type="submit" 
                                class="bg-white text-orange-600 px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition">
                            ${buttonText} <i class="fas fa-paper-plane ml-2"></i>
                        </button>
                    </form>
                </div>
            </div>
        </section>
    `;
});

// Gallery Component
ComponentManager.register('gallery', (images = []) => {
    return `
        <section class="py-16 bg-white">
            <div class="container mx-auto px-4">
                <h2 class="font-playfair text-4xl font-bold text-center mb-12 text-gray-800">
                    Thư Viện Ảnh
                </h2>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    ${images.map((img, index) => `
                        <div class="gallery-item relative overflow-hidden rounded-lg group cursor-pointer" 
                             onclick="openImageModal(${index})">
                            <img src="${img.url}" alt="${img.title || ''}" 
                                 class="w-full h-64 object-cover transform group-hover:scale-110 transition duration-300">
                            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition duration-300 flex items-center justify-center">
                                <i class="fas fa-search-plus text-white text-3xl opacity-0 group-hover:opacity-100 transition duration-300"></i>
                            </div>
                            ${img.title ? `
                                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                                    <p class="text-white font-medium">${img.title}</p>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
    `;
});

// Newsletter submit handler
window.handleNewsletterSubmit = function(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    showNotification('Đăng ký thành công! Cảm ơn bạn đã quan tâm.', 'success');
    e.target.reset();
};

// Gallery modal handler
window.openImageModal = function(index) {
    console.log('Open image:', index);
    // Implement lightbox/modal here
};
