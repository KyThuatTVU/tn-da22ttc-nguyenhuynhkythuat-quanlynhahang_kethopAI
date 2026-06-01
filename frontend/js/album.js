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

// Reverse mapping cho filter
const FILTER_MAP = {
    'all': null,
    'dishes': 'mon_an',
    'restaurant': 'khong_gian',
    'events': 'su_kien',
    'customers': 'khach_hang'
};

let currentPage = 1;
let currentFilter = 'all';
const itemsPerPage = 12;

// Load album từ API
async function loadAlbums(filter = 'all', page = 1) {
    try {
        const galleryContainer = document.getElementById('gallery');
        
        // Show loading - use LoadingManager if available
        if (typeof LoadingManager !== 'undefined') {
            LoadingManager.showSectionLoading(galleryContainer, 'Đang tải album...');
        } else {
            galleryContainer.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-spinner fa-spin text-4xl text-orange-600"></i>
                    <p class="mt-4 text-gray-600">Đang tải album...</p>
                </div>
            `;
        }

        let url;
        if (filter === 'all' || !FILTER_MAP[filter]) {
            url = `${ALBUM_API_URL}?page=${page}&limit=${itemsPerPage}`;
        } else {
            const loaiAnh = FILTER_MAP[filter];
            url = `${ALBUM_API_URL}/category/${loaiAnh}?page=${page}&limit=${itemsPerPage}`;
        }

        const response = await fetch(url);
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Không thể tải album');
        }

        displayAlbums(result.data);
        displayPagination(result.pagination);

    } catch (error) {
        console.error('Lỗi load album:', error);
        const galleryContainer = document.getElementById('gallery');
        galleryContainer.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-exclamation-circle text-4xl text-red-500"></i>
                <p class="mt-4 text-gray-600">Không thể tải album ảnh</p>
                <p class="text-sm text-gray-500">${error.message}</p>
            </div>
        `;
    }
}

// Hiển thị danh sách album
function displayAlbums(albums) {
    const galleryContainer = document.getElementById('gallery');

    if (!albums || albums.length === 0) {
        galleryContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem 0;">
                <i class="fas fa-images text-4xl text-gray-400"></i>
                <p class="mt-4 text-gray-600">Chưa có ảnh trong album này</p>
            </div>
        `;
        return;
    }

    const categoryNames = {
        'mon_an': 'Món ăn',
        'khong_gian': 'Không gian',
        'su_kien': 'Sự kiện',
        'khach_hang': 'Khách hàng',
        'khac': 'Khác'
    };

    galleryContainer.innerHTML = albums.map((album, index) => {
        // Xử lý đường dẫn ảnh - ảnh được lưu trong /images/ không phải /images/albums/
        let imagePath;
        if (album.duong_dan_anh.startsWith('http')) {
            imagePath = album.duong_dan_anh;
        } else if (album.duong_dan_anh.startsWith('/images/') || album.duong_dan_anh.startsWith('images/')) {
            imagePath = `http://localhost:3000/${album.duong_dan_anh.replace(/^\//, '')}`;
        } else {
            // Chỉ có tên file
            imagePath = `http://localhost:3000/images/${album.duong_dan_anh}`;
        }

        const category = CATEGORY_MAP[album.loai_anh] || 'all';
        const categoryName = categoryNames[album.loai_anh] || 'Khác';

        return `
            <div class="gallery-item"
                 data-category="${category}"
                 data-id="${album.ma_album}"
                 style="animation-delay: ${index * 0.05}s">
                <div class="gallery-item-inner">
                    <div class="gallery-image-wrapper">
                        <img src="${imagePath}"
                             alt="${album.mo_ta || 'Album ảnh'}"
                             loading="lazy"
                             onerror="this.src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'">
                        <div class="gallery-overlay">
                            <div class="gallery-overlay-content">
                                <button onclick="viewFullImage('${imagePath.replace(/'/g, "\\'")}', '${(album.mo_ta || 'Album ảnh').replace(/'/g, "\\'")}', '${categoryName}')"
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
                        <h3 class="font-semibold text-gray-800 line-clamp-2">${album.mo_ta || 'Ảnh album'}</h3>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Reinitialize GSAP animations if exists
    if (typeof initAlbumAnimations === 'function') {
        setTimeout(initAlbumAnimations, 100);
    }
}

// Hiển thị phân trang
function displayPagination(pagination) {
    if (!pagination || pagination.totalPages <= 1) return;

    const gallerySection = document.querySelector('#gallery').parentElement;
    
    // Remove old pagination
    const oldPagination = gallerySection.querySelector('.pagination-container');
    if (oldPagination) oldPagination.remove();

    const paginationHTML = `
        <div class="pagination-container mt-8 flex justify-center gap-2">
            ${pagination.page > 1 ? `
                <button onclick="changePage(${pagination.page - 1})" 
                        class="px-4 py-2 border rounded-lg hover:bg-orange-50">
                    <i class="fas fa-chevron-left"></i>
                </button>
            ` : ''}
            
            ${Array.from({length: pagination.totalPages}, (_, i) => i + 1).map(page => `
                <button onclick="changePage(${page})" 
                        class="px-4 py-2 border rounded-lg ${page === pagination.page ? 'bg-orange-600 text-white' : 'hover:bg-orange-50'}">
                    ${page}
                </button>
            `).join('')}
            
            ${pagination.page < pagination.totalPages ? `
                <button onclick="changePage(${pagination.page + 1})" 
                        class="px-4 py-2 border rounded-lg hover:bg-orange-50">
                    <i class="fas fa-chevron-right"></i>
                </button>
            ` : ''}
        </div>
    `;

    gallerySection.insertAdjacentHTML('beforeend', paginationHTML);
}

// Change page
function changePage(page) {
    currentPage = page;
    loadAlbums(currentFilter, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// View full image in modal
function viewFullImage(imageSrc, description, category) {
    const modal = document.createElement('div');
    modal.className = 'lightbox';
    modal.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close" onclick="this.closest('.lightbox').remove()">
                <i class="fas fa-times"></i>
            </button>
            <img src="${imageSrc}" alt="${description}">
            <div class="lightbox-info">
                ${category ? `<span class="inline-block px-3 py-1 bg-orange-600 text-white text-xs font-semibold rounded-full mb-2">${category}</span>` : ''}
                <p class="text-lg font-medium">${description}</p>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close on click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    // Close on ESC key
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

// Get category name in Vietnamese
function getCategoryName(filter) {
    const names = {
        'all': 'Tất cả',
        'dishes': 'Món ăn',
        'restaurant': 'Nhà hàng',
        'events': 'Sự kiện',
        'customers': 'Khách hàng'
    };
    return names[filter] || 'Tất cả';
}

// Format date - hiển thị ngày tháng từ server (đã đúng timezone VN)
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    // dateString từ server đã ở dạng "YYYY-MM-DD HH:mm:ss" theo timezone VN
    // Chỉ cần parse và format lại
    const parts = dateString.split(' ')[0].split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
    }
    
    // Fallback nếu format khác
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Setup filter buttons
function setupFilterButtons() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.classList.remove('border-orange-600');
                b.classList.add('border-gray-300');
            });
            btn.classList.add('active');
            btn.classList.add('border-orange-600');
            btn.classList.remove('border-gray-300');

            // Load filtered albums
            const filter = btn.getAttribute('data-filter');
            currentFilter = filter;
            currentPage = 1;
            loadAlbums(filter, 1);
        });
    });
}

// Load categories dynamically
async function loadCategories() {
    try {
        const response = await fetch(`${ALBUM_API_URL}/categories/list`);
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            // Update filter buttons with actual counts
            result.data.forEach(cat => {
                const filterKey = CATEGORY_MAP[cat.loai_anh];
                const btn = document.querySelector(`[data-filter="${filterKey}"]`);
                if (btn) {
                    btn.innerHTML = `${btn.textContent.trim()} <span class="text-xs ml-1">(${cat.so_luong})</span>`;
                }
            });
        }
    } catch (error) {
        console.error('Lỗi load categories:', error);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupFilterButtons();
    loadCategories();
    loadAlbums('all', 1);
});
