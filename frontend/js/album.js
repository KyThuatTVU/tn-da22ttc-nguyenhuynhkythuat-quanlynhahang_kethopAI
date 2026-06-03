// Album API Configuration
const ALBUM_API_URL = 'http://localhost:3000/api/albums';

// Mapping loại ảnh sang category filter
const CATEGORY_MAP = {
    'mon_an': 'dishes',
    'khong_gian': 'restaurant',
    'su_kien': 'events',
    'khach_hang': 'customers',
    'khong_ro': 'all'
};

let loadedAlbumsByCategory = {
    'mon_an': [],
    'khong_gian': [],
    'su_kien': [],
    'khach_hang': []
};

let currentLightboxCategory = 'mon_an';
let currentLightboxIndex = 0;

// Load all categories on page load
async function loadAllCategories() {
    const categories = ['mon_an', 'khong_gian', 'su_kien', 'khach_hang'];
    for (const cat of categories) {
        await loadCategoryAlbums(cat);
    }
}

// Load individual category albums
async function loadCategoryAlbums(loaiAnh) {
    const containerMap = {
        'mon_an': 'gallery-dishes',
        'khong_gian': 'gallery-restaurant',
        'su_kien': 'gallery-events',
        'khach_hang': 'gallery-customers'
    };
    const badgeMap = {
        'mon_an': 'count-dishes',
        'khong_gian': 'count-restaurant',
        'su_kien': 'count-events',
        'khach_hang': 'count-customers'
    };

    const containerId = containerMap[loaiAnh];
    const badgeId = badgeMap[loaiAnh];
    const container = document.getElementById(containerId);
    const badge = document.getElementById(badgeId);

    if (!container) return;

    try {
        const url = `${ALBUM_API_URL}/category/${loaiAnh}?limit=40`;
        const response = await fetch(url);
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Không thể tải album');
        }

        const albums = result.data || [];
        loadedAlbumsByCategory[loaiAnh] = albums;

        // Update badge count
        if (badge) {
            badge.textContent = `${albums.length} ảnh`;
        }

        displayCategoryAlbums(loaiAnh, container, albums);
        initTiltEffectForContainer(container);
        if (window.initGSAPAnimationsForContainer) {
            window.initGSAPAnimationsForContainer(container);
        }

    } catch (error) {
        console.error(`Lỗi tải album ${loaiAnh}:`, error);
        container.innerHTML = `
            <div class="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <i class="fas fa-exclamation-circle text-2xl text-red-400"></i>
                <p class="mt-2 text-gray-500 text-sm">Không thể tải ảnh danh mục này</p>
                <p class="text-xs text-gray-400 mt-1">${error.message}</p>
            </div>
        `;
        if (badge) {
            badge.textContent = 'Lỗi';
        }
    }
}

// Render albums inside a category container
function displayCategoryAlbums(loaiAnh, container, albums) {
    if (!albums || albums.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <i class="far fa-images text-3xl text-gray-400"></i>
                <p class="mt-2 text-gray-500 text-sm">Chưa có ảnh trong danh mục này</p>
            </div>
        `;
        return;
    }

    container.innerHTML = albums.map((album, index) => {
        let imagePath;
        if (album.duong_dan_anh.startsWith('http')) {
            imagePath = album.duong_dan_anh;
        } else if (album.duong_dan_anh.startsWith('/images/') || album.duong_dan_anh.startsWith('images/')) {
            imagePath = `http://localhost:3000/${album.duong_dan_anh.replace(/^\//, '')}`;
        } else {
            imagePath = `http://localhost:3000/images/${album.duong_dan_anh}`;
        }

        const categoryNames = {
            'mon_an': 'Món ăn',
            'khong_gian': 'Không gian',
            'su_kien': 'Sự kiện',
            'khach_hang': 'Khách hàng',
            'khac': 'Khác'
        };
        const categoryName = categoryNames[album.loai_anh] || 'Khác';

        return `
            <div class="gallery-item"
                 data-category="${loaiAnh}"
                 data-id="${album.ma_album}"
                 style="animation-delay: ${index * 0.05}s">
                <div class="gallery-item-inner">
                    <div class="card-shine"></div>
                    <div class="gallery-image-wrapper">
                        <img src="${imagePath}"
                             alt="${album.mo_ta || 'Album ảnh'}"
                             loading="lazy"
                             onerror="this.src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'">
                        <div class="gallery-overlay">
                            <div class="gallery-overlay-content">
                                <button onclick="viewFullImageByCategory('${loaiAnh}', ${index})"
                                        class="view-btn">
                                    <i class="fas fa-search-plus"></i>
                                    <span>Xem chi tiết</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="gallery-info">
                        <div class="flex items-center justify-between mb-2">
                            <span class="category-badge">${categoryName}</span>
                            <span class="text-xs text-gray-500">
                                <i class="far fa-calendar mr-1"></i>
                                ${formatDate(album.ngay_tao)}
                            </span>
                        </div>
                        <h3 class="font-semibold text-gray-800 line-clamp-2 text-sm sm:text-base">${album.mo_ta || 'Ảnh album'}</h3>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Lightbox category viewer
function viewFullImageByCategory(loaiAnh, index) {
    const albums = loadedAlbumsByCategory[loaiAnh];
    if (!albums || albums.length === 0) return;

    // Wrap around index
    if (index < 0) index = albums.length - 1;
    if (index >= albums.length) index = 0;

    currentLightboxCategory = loaiAnh;
    currentLightboxIndex = index;
    const album = albums[index];

    let imagePath;
    if (album.duong_dan_anh.startsWith('http')) {
        imagePath = album.duong_dan_anh;
    } else if (album.duong_dan_anh.startsWith('/images/') || album.duong_dan_anh.startsWith('images/')) {
        imagePath = `http://localhost:3000/${album.duong_dan_anh.replace(/^\//, '')}`;
    } else {
        imagePath = `http://localhost:3000/images/${album.duong_dan_anh}`;
    }

    const categoryNames = {
        'mon_an': 'Món ăn',
        'khong_gian': 'Không gian',
        'su_kien': 'Sự kiện',
        'khach_hang': 'Khách hàng',
        'khac': 'Khác'
    };
    const categoryName = categoryNames[album.loai_anh] || 'Khác';
    const description = album.mo_ta || 'Album ảnh';

    let modal = document.querySelector('.lightbox');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'lightbox';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close" onclick="closeFullImage()">
                <i class="fas fa-times"></i>
            </button>
            
            <button class="lightbox-nav prev" onclick="viewFullImageByCategory('${loaiAnh}', ${index - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
            
            <img src="${imagePath}" alt="${description}">
            
            <button class="lightbox-nav next" onclick="viewFullImageByCategory('${loaiAnh}', ${index + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
            
            <div class="lightbox-info">
                <span class="inline-block px-3 py-1 bg-orange-600 text-white text-xs font-semibold rounded-full mb-2">${categoryName}</span>
                <p class="text-lg font-medium">${description}</p>
                <p class="text-xs text-gray-400 mt-1">${index + 1} / ${albums.length}</p>
            </div>
        </div>
    `;

    // Trigger transition
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);

    // Close on background click
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeFullImage();
        }
    };

    // Keyboard handlers
    if (!window.lightboxKeydownHandler) {
        window.lightboxKeydownHandler = (e) => {
            const currentModal = document.querySelector('.lightbox');
            if (!currentModal) return;

            if (e.key === 'Escape') {
                closeFullImage();
            } else if (e.key === 'ArrowLeft') {
                viewFullImageByCategory(currentLightboxCategory, currentLightboxIndex - 1);
            } else if (e.key === 'ArrowRight') {
                viewFullImageByCategory(currentLightboxCategory, currentLightboxIndex + 1);
            }
        };
        document.addEventListener('keydown', window.lightboxKeydownHandler);
    }
}

// Close lightbox and clean up keydown listener
function closeFullImage() {
    const modal = document.querySelector('.lightbox');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 400);
    }
    if (window.lightboxKeydownHandler) {
        document.removeEventListener('keydown', window.lightboxKeydownHandler);
        window.lightboxKeydownHandler = null;
    }
}

// Format date utility
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const parts = dateString.split(' ')[0].split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Initialize 3D Tilt Effect on cards
function initTiltEffectForContainer(container) {
    if (!container) return;
    
    // Check if it's a touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
        return; // Disable tilt on mobile/tablets
    }

    const items = container.querySelectorAll('.gallery-item');
    items.forEach(item => {
        const inner = item.querySelector('.gallery-item-inner');
        const shine = item.querySelector('.card-shine');
        if (!inner) return;

        let bounds;

        item.addEventListener('mouseenter', () => {
            bounds = item.getBoundingClientRect();
            inner.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s ease';
        });

        item.addEventListener('mousemove', (e) => {
            if (!bounds) bounds = item.getBoundingClientRect();
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            const leftX = mouseX - bounds.left;
            const topY = mouseY - bounds.top;
            
            const cardX = leftX - bounds.width / 2;
            const cardY = topY - bounds.height / 2;
            
            const maxTilt = 12; // Beautiful subtle angle
            
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

        item.addEventListener('mouseleave', () => {
            bounds = null;
            inner.style.transition = 'transform 0.5s ease-out, box-shadow 0.3s ease';
            inner.style.transform = 'rotateX(0deg) rotateY(0deg)';
        });
    });
}

// Initialize Scrollspy for floating Glassmorphic navigation
function initScrollspy() {
    const sections = document.querySelectorAll('.scroll-mt-32');
    const navLinks = document.querySelectorAll('.nav-glass-link');
    
    if (sections.length === 0 || navLinks.length === 0) return;

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -55% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // Smooth scroll for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                const offset = 100; // Offset for sticky navbar
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadAllCategories();
        initScrollspy();
    });
} else {
    loadAllCategories();
    initScrollspy();
}
