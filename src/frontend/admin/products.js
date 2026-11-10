/* ==== Script 1 (tách từ products.html) ==== */
document.addEventListener('DOMContentLoaded', () => {
            window.productDraftManager = new FormDraftManager('product-form', { excludeClasses: ['no-draft'] });
        });
        
        // API_URL đã được khai báo trong admin-layout.js
        let products = [];
        let categories = [];
        let flavors = [];

        // Chuyển số thành chữ tiếng Việt
        function numberToVietnameseWords(num) {
            if (num === 0) return 'Không đồng';
            if (!num || isNaN(num)) return '';
            
            const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
            const tens = ['', 'mười', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
            
            function readThreeDigits(n) {
                let str = '';
                const hundred = Math.floor(n / 100);
                const ten = Math.floor((n % 100) / 10);
                const one = n % 10;
                
                if (hundred > 0) str += ones[hundred] + ' trăm ';
                if (ten > 1) {
                    str += tens[ten] + ' ';
                    if (one === 1) str += 'mốt';
                    else if (one === 5) str += 'lăm';
                    else if (one > 0) str += ones[one];
                } else if (ten === 1) {
                    str += 'mười ';
                    if (one === 5) str += 'lăm';
                    else if (one > 0) str += ones[one];
                } else if (ten === 0 && hundred > 0 && one > 0) {
                    str += 'lẻ ' + ones[one];
                } else if (one > 0) {
                    str += ones[one];
                }
                return str.trim();
            }
            
            let result = '';
            const billion = Math.floor(num / 1000000000);
            const million = Math.floor((num % 1000000000) / 1000000);
            const thousand = Math.floor((num % 1000000) / 1000);
            const remainder = num % 1000;
            
            if (billion > 0) result += readThreeDigits(billion) + ' tỷ ';
            if (million > 0) result += readThreeDigits(million) + ' triệu ';
            if (thousand > 0) result += readThreeDigits(thousand) + ' nghìn ';
            if (remainder > 0) result += readThreeDigits(remainder);
            
            result = result.trim();
            // Viết hoa chữ cái đầu
            return result.charAt(0).toUpperCase() + result.slice(1) + ' đồng';
        }
        
        function showPriceInWords(value) {
            const priceEl = document.getElementById('price-in-words');
            const num = parseInt(value) || 0;
            if (num > 0) {
                priceEl.textContent = '💰 ' + numberToVietnameseWords(num);
                priceEl.classList.remove('hidden');
            } else {
                priceEl.classList.add('hidden');
            }
        }

        async function loadCategories() {
            try {
                const response = await fetch(`${API_URL}/categories`);
                const data = await response.json();
                categories = data.data || [];
                ['category-filter', 'ma_danh_muc'].forEach(id => {
                    const select = document.getElementById(id);
                    categories.forEach(cat => {
                        const option = document.createElement('option');
                        option.value = cat.ma_danh_muc;
                        option.textContent = cat.ten_danh_muc;
                        select.appendChild(option);
                    });
                });
            } catch (error) { console.error('Error loading categories:', error); }
        }

        async function loadFlavors() {
            try {
                const response = await fetch(`${API_URL}/menu/flavors`);
                const data = await response.json();
                flavors = data.data || [];
                const container = document.getElementById('khau_vi_container');
                if (flavors.length === 0) {
                    container.innerHTML = '<div class="text-sm text-slate-500 italic text-center w-full">Chưa có dữ liệu khẩu vị</div>';
                    return;
                }
                container.innerHTML = flavors.map(f => `
                    <label class="flex items-center space-x-2 cursor-pointer p-2 hover:bg-white rounded-lg transition border border-transparent hover:border-slate-200">
                        <input type="checkbox" name="khau_vi_items" value="${f.id}" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                        <span class="text-sm text-slate-700">${f.ten_thuoc_tinh}</span>
                    </label>
                `).join('');
            } catch (error) { 
                console.error('Error loading flavors:', error);
                document.getElementById('khau_vi_container').innerHTML = '<div class="text-sm text-red-500">Lỗi tải dữ liệu khẩu vị</div>';
            }
        }

        async function loadProducts() {
            try {
                // Admin load tất cả món ăn (kể cả đã ẩn) với showAll=true
                const response = await fetch(`${API_URL}/menu?showAll=true`, { credentials: 'include' });
                const data = await response.json();
                products = data.data || [];
                renderProducts(products);
                
                // Tự động khôi phục lại trạng thái giao diện UI (nếu có form đang mở)
                restoreUiState();
            } catch (error) {
                console.error('Error loading products:', error);
                document.getElementById('products-container').innerHTML = `<div class="col-span-full text-center py-12"><i class="fas fa-exclamation-circle text-4xl text-red-400 mb-4"></i><p class="text-slate-500">Không thể tải dữ liệu</p></div>`;
            }
        }

        // Khôi phục trạng thái form đang mở khi mới load trang
        function restoreUiState() {
            const stateStr = sessionStorage.getItem('adminUiState_products');
            if (stateStr) {
                try {
                    const state = JSON.parse(stateStr);
                    if (state.action === 'add') {
                        openAddModal(true);
                    } else if (state.action === 'edit' && state.id) {
                        editProduct(state.id, true);
                    }
                } catch (e) {
                    console.error('Error restoring UI state', e);
                }
            }
        }

        function renderProducts(items) {
            const container = document.getElementById('products-container');
            if (items.length === 0) {
                container.innerHTML = `<div class="col-span-full text-center py-12"><i class="fas fa-utensils text-4xl text-slate-300 mb-4"></i><p class="text-slate-500">Chưa có món ăn nào</p></div>`;
                return;
            }
            container.innerHTML = items.map(product => {
                let imagePath = product.anh_mon || product.anh_dai_dien || '/images/default.jpg';
                if (!imagePath.startsWith('http') && !imagePath.startsWith('/images/')) imagePath = '/images/' + imagePath.replace(/^\/+/, '');
                const imageUrl = imagePath.startsWith('http') ? imagePath : `http://localhost:3000${imagePath}`;
                const isActive = product.trang_thai == 1 || product.trang_thai === 'con_hang';
                const stockWarning = product.so_luong_ton <= 5 && product.so_luong_ton > 0;
                const outOfStock = product.so_luong_ton <= 0;
                return `
                    <div class="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition border border-slate-100 ${!isActive ? 'opacity-60' : ''}">
                        <div class="relative h-48">
                            <img src="${imageUrl}" alt="${product.ten_mon}" class="w-full h-full object-cover ${!isActive ? 'grayscale' : ''}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                            <div class="absolute top-3 left-3 right-3 flex justify-between items-start">
                                <span class="px-3 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}">
                                    ${isActive ? '<i class="fas fa-eye mr-1"></i>Đang hiển thị' : '<i class="fas fa-eye-slash mr-1"></i>Đã ẩn'}
                                </span>
                                ${outOfStock ? '<span class="px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-white">Hết hàng</span>' : 
                                  stockWarning ? '<span class="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Sắp hết</span>' : ''}
                                ${product.dinh_luong ? `<span class="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"><i class="fas fa-weight-hanging mr-1"></i>${product.dinh_luong}</span>` : ''}
                                <span class="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-200 text-slate-600 uppercase">Phần</span>
                            </div>
                        </div>
                        <div class="p-5">
                            <h4 class="font-bold text-lg mb-2 text-slate-800 line-clamp-1">${product.ten_mon}</h4>
                            <p class="text-sm text-slate-500 mb-3 line-clamp-2">${product.mo_ta_chi_tiet || product.mo_ta || 'Chưa có mô tả'}</p>
                            <div class="flex items-center justify-between mb-3">
                                <p class="text-blue-600 font-bold text-lg">${formatPrice(product.gia_tien || product.gia || 0)}</p>
                                <div class="flex items-center gap-2">
                                    <button onclick="updateStock(${product.ma_mon}, ${product.so_luong_ton || 0})" class="text-sm ${outOfStock ? 'text-red-600' : stockWarning ? 'text-amber-600' : 'text-slate-500'} hover:underline font-bold">
                                        <i class="fas fa-box mr-1"></i>${product.so_luong_ton || 0} <span class="text-[10px] uppercase">Phần</span>
                                    </button>
                                </div>
                            </div>
                            <!-- Toggle Switch -->
                            <div class="flex items-center justify-between mb-4 p-3 bg-slate-50 rounded-xl">
                                <span class="text-sm text-slate-600">Hiển thị cho khách</span>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" class="sr-only peer" ${isActive ? 'checked' : ''} onchange="toggleProductStatus(${product.ma_mon}, this.checked)">
                                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                            <div class="flex space-x-2">
                                <button onclick="editProduct(${product.ma_mon})" class="flex-1 bg-blue-50 text-blue-600 py-2.5 rounded-xl hover:bg-blue-100 transition text-sm font-medium"><i class="fas fa-edit mr-1"></i>Sửa</button>
                                <button onclick="deleteProduct(${product.ma_mon})" class="flex-1 bg-red-50 text-red-600 py-2.5 rounded-xl hover:bg-red-100 transition text-sm font-medium"><i class="fas fa-trash mr-1"></i>Xóa</button>
                            </div>
                        </div>
                    </div>`;
            }).join('');
        }

        function formatPrice(price) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price); }
        
        function openAddModal(isAutoOpen = false) { 
            document.getElementById('modal-title').textContent = 'Thêm món mới'; 
            document.getElementById('product-form').reset(); 
            document.querySelectorAll('input[name="khau_vi_items"]').forEach(cb => cb.checked = false);
            if (window.productDraftManager) {
                window.productDraftManager.setContext('new');
                if (isAutoOpen && window.productDraftManager.hasDraft()) {
                    window.productDraftManager.restore();
                } else if (!isAutoOpen) {
                    window.productDraftManager.clear();
                }
            }
            document.getElementById('product-id').value = ''; 
            document.getElementById('dinh_luong').value = ''; // Reset định lượng
            document.getElementById('price-in-words').classList.add('hidden');
            document.getElementById('stock-warning').classList.add('hidden');
            document.getElementById('product-modal').classList.remove('hidden'); 
            
            // Lưu trạng thái đang mở form Thêm mới
            if (!isAutoOpen) {
                sessionStorage.setItem('adminUiState_products', JSON.stringify({ action: 'add' }));
            }
        }
        
        function closeModal() { 
            document.getElementById('product-modal').classList.add('hidden'); 
            document.getElementById('price-in-words').classList.add('hidden');
            document.getElementById('stock-warning').classList.add('hidden');
            // Xoá trạng thái UI ghi nhớ (vì người dùng chủ động đóng Form)
            sessionStorage.removeItem('adminUiState_products');
        }

        async function editProduct(id, isAutoOpen = false) {
            const product = products.find(p => p.ma_mon === id);
            if (!product) {
                sessionStorage.removeItem('adminUiState_products');
                return;
            }
            document.getElementById('modal-title').textContent = 'Chỉnh sửa món ăn';
            document.getElementById('product-id').value = product.ma_mon;
            
            // Cập nhật context draft cho ID cụ thể
            if (window.productDraftManager) {
                window.productDraftManager.setContext(id);
            }
            
            document.getElementById('ten_mon').value = product.ten_mon || '';
            document.getElementById('ma_danh_muc').value = product.ma_danh_muc || '';
            const price = product.gia_tien || product.gia || '';
            document.getElementById('gia').value = price;
            showPriceInWords(price); // Hiển thị giá bằng chữ
            document.getElementById('dinh_luong').value = product.dinh_luong || ''; // Gán định lượng
            const stock = product.so_luong_ton || 0;
            document.getElementById('so_luong_ton').value = stock;
            checkStockWarning(document.getElementById('so_luong_ton')); // Hiển thị cảnh báo số lượng
            document.getElementById('mo_ta').value = product.mo_ta_chi_tiet || product.mo_ta || '';
            document.getElementById('trang_thai').value = product.trang_thai == 1 ? 'con_hang' : 'het_hang';
            
            // Xử lý khẩu vị
            document.querySelectorAll('input[name="khau_vi_items"]').forEach(cb => cb.checked = false);
            if (product.khau_vi) {
                const khauViArr = product.khau_vi.toString().split(',');
                khauViArr.forEach(val => {
                    const cb = document.querySelector(`input[name="khau_vi_items"][value="${val}"]`);
                    if (cb) cb.checked = true;
                });
            }

            document.getElementById('product-modal').classList.remove('hidden');

            // Lưu trạng thái đang mở form Sửa
            if (!isAutoOpen) {
                sessionStorage.setItem('adminUiState_products', JSON.stringify({ action: 'edit', id: id }));
            }

            // Tự động dán lại các đoạn text gõ dở dang chưa lưu
            if (window.productDraftManager) {
                if (isAutoOpen && window.productDraftManager.hasDraft()) {
                    window.productDraftManager.restore();
                } else if (!isAutoOpen) {
                    window.productDraftManager.clear();
                }
            }
        }

        async function deleteProduct(id) {
            if (!confirm('Bạn có chắc muốn xóa món ăn này?')) return;
            try {
                const response = await fetch(`${API_URL}/menu/${id}`, { method: 'DELETE', credentials: 'include' });
                if (response.ok) { alert('Xóa thành công!'); loadProducts(); } else { alert('Có lỗi xảy ra!'); }
            } catch (error) { console.error('Error:', error); alert('Có lỗi xảy ra!'); }
        }

        document.getElementById('product-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('product-id').value;
            const stockValue = parseInt(document.getElementById('so_luong_ton').value) || 0;
            
            // Validate số lượng tồn - không cho phép số âm
            if (stockValue < 0) {
                showToast('Số lượng tồn không được là số âm!', 'error');
                return;
            }
            
            // Cảnh báo nếu số lượng = 0
            if (stockValue === 0) {
                if (!confirm('⚠️ Số lượng tồn = 0!\n\nMón ăn sẽ được đánh dấu "Hết hàng" và tự động ẩn khỏi thực đơn cho khách hàng.\n\nBạn có muốn tiếp tục?')) {
                    return;
                }
            }
            
            const formData = new FormData();
            formData.append('ten_mon', document.getElementById('ten_mon').value);
            formData.append('ma_danh_muc', document.getElementById('ma_danh_muc').value);
            formData.append('gia_tien', document.getElementById('gia').value);
            formData.append('dinh_luong', document.getElementById('dinh_luong').value); // Thêm định lượng
            formData.append('so_luong_ton', stockValue);
            formData.append('mo_ta_chi_tiet', document.getElementById('mo_ta').value);
            formData.append('trang_thai', document.getElementById('trang_thai').value === 'con_hang' ? 1 : 0);
            
            // Xử lý khẩu vị
            const checkedFlavors = Array.from(document.querySelectorAll('input[name="khau_vi_items"]:checked')).map(cb => cb.value);
            if (checkedFlavors.length > 0) {
                formData.append('khau_vi', checkedFlavors.join(','));
            } else {
                formData.append('khau_vi', '');
            }

            const fileInput = document.getElementById('anh_dai_dien');
            if (fileInput.files[0]) formData.append('anh_mon', fileInput.files[0]);
            try {
                const url = id ? `${API_URL}/menu/${id}` : `${API_URL}/menu`;
                const response = await fetch(url, { method: id ? 'PUT' : 'POST', body: formData, credentials: 'include' });
                const data = await response.json();
                if (data.success) { 
                    if (window.productDraftManager) window.productDraftManager.clear();
                    showToast(data.message, data.outOfStock ? 'warning' : 'success');
                    closeModal(); 
                    loadProducts(); 
                } else { 
                    showToast(data.message || 'Có lỗi xảy ra!', 'error'); 
                }
            } catch (error) { console.error('Error:', error); showToast('Có lỗi xảy ra!', 'error'); }
        });

        function applyFilters() {
            const search = document.getElementById('search').value.toLowerCase();
            const category = document.getElementById('category-filter').value;
            const status = document.getElementById('status-filter').value;
            let filtered = products.filter(p => {
                const matchSearch = p.ten_mon.toLowerCase().includes(search) || (p.mo_ta_chi_tiet && p.mo_ta_chi_tiet.toLowerCase().includes(search));
                const matchCategory = !category || p.ma_danh_muc == category;
                let matchStatus = true;
                if (status === 'hien_thi') matchStatus = p.trang_thai == 1;
                else if (status === 'an') matchStatus = p.trang_thai == 0;
                else if (status === 'het_hang') matchStatus = (p.so_luong_ton || 0) <= 0;
                else if (status === 'sap_het') matchStatus = (p.so_luong_ton || 0) > 0 && (p.so_luong_ton || 0) <= 5;
                return matchSearch && matchCategory && matchStatus;
            });
            renderProducts(filtered);
        }

        // Toggle trạng thái hiển thị món ăn
        async function toggleProductStatus(productId, isActive) {
            try {
                const response = await fetch(`${API_URL}/menu/${productId}/toggle-status`, {
                    method: 'PATCH',
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.success) {
                    // Cập nhật local data
                    const product = products.find(p => p.ma_mon === productId);
                    if (product) {
                        product.trang_thai = data.data.trang_thai;
                    }
                    // Hiển thị thông báo nhỏ
                    showToast(data.message, 'success');
                } else {
                    showToast('Có lỗi xảy ra: ' + data.message, 'error');
                    loadProducts(); // Reload để sync lại
                }
            } catch (error) {
                console.error('Error toggling status:', error);
                showToast('Có lỗi xảy ra!', 'error');
                loadProducts();
            }
        }

        // Cập nhật số lượng tồn kho
        async function updateStock(productId, currentStock) {
            const product = products.find(p => p.ma_mon === productId);
            const productName = product ? product.ten_mon : 'món ăn';
            
            const newStock = prompt(`Nhập số lượng tồn kho mới cho "${productName}":\n(Hiện tại: ${currentStock})\n\n⚠️ Lưu ý: Nếu nhập 0, món ăn sẽ tự động ẩn khỏi thực đơn!`, currentStock);
            if (newStock === null) return; // User cancelled
            
            const stockNum = parseInt(newStock);
            if (isNaN(stockNum)) {
                showToast('Vui lòng nhập số hợp lệ!', 'error');
                return;
            }
            
            if (stockNum < 0) {
                showToast('❌ Số lượng không được là số âm!', 'error');
                return;
            }
            
            // Xác nhận nếu số lượng = 0
            if (stockNum === 0) {
                if (!confirm(`⚠️ Bạn đang đặt số lượng = 0 cho "${productName}"!\n\nMón ăn sẽ được đánh dấu "Hết hàng" và tự động ẩn khỏi thực đơn.\n\nBạn có chắc chắn?`)) {
                    return;
                }
            }

            try {
                const response = await fetch(`${API_URL}/menu/${productId}/stock`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ so_luong_ton: stockNum })
                });
                const data = await response.json();
                if (data.success) {
                    // Cập nhật local data
                    if (product) {
                        product.so_luong_ton = stockNum;
                        if (data.outOfStock) {
                            product.trang_thai = 0;
                        }
                    }
                    renderProducts(products);
                    showToast(data.message, data.outOfStock ? 'warning' : 'success');
                } else {
                    showToast(data.message || 'Có lỗi xảy ra!', 'error');
                }
            } catch (error) {
                console.error('Error updating stock:', error);
                showToast('Có lỗi xảy ra!', 'error');
            }
        }

        // Toast notification
        function showToast(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-lg z-50 transition-all transform translate-y-0 max-w-md ${
                type === 'success' ? 'bg-emerald-500 text-white' : 
                type === 'error' ? 'bg-red-500 text-white' : 
                type === 'warning' ? 'bg-amber-500 text-white' :
                'bg-slate-800 text-white'
            }`;
            toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'} mr-2"></i>${message}`;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.classList.add('opacity-0', 'translate-y-2');
                setTimeout(() => toast.remove(), 300);
            }, type === 'warning' ? 5000 : 3000);
        }
        
        // Kiểm tra và hiển thị cảnh báo số lượng tồn
        function checkStockWarning(input) {
            const value = parseInt(input.value) || 0;
            const warning = document.getElementById('stock-warning');
            
            if (value < 0) {
                input.value = 0;
                warning.textContent = '❌ Không được nhập số âm!';
                warning.className = 'text-xs mt-1 text-red-600';
                warning.classList.remove('hidden');
            } else if (value === 0) {
                warning.textContent = '⚠️ Số lượng = 0: Món ăn sẽ được đánh dấu "Hết hàng" và tự động ẩn';
                warning.className = 'text-xs mt-1 text-amber-600';
                warning.classList.remove('hidden');
            } else if (value <= 5) {
                warning.textContent = `⚠️ Sắp hết hàng! Chỉ còn ${value} sản phẩm`;
                warning.className = 'text-xs mt-1 text-amber-600';
                warning.classList.remove('hidden');
            } else {
                warning.classList.add('hidden');
            }
        }

        // Khởi tạo trang đồng bộ để tránh race-condition khi tự động khôi phục modal
        async function initPage() {
            try {
                await Promise.all([loadCategories(), loadFlavors()]);
                await loadProducts();
            } catch (err) {
                console.error('Error initializing products page:', err);
            }
        }
        initPage();
