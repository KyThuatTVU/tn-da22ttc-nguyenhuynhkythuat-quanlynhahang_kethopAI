/* ==== Script 1 (tách từ /admin/categories/) ==== */
let categories = [];

        async function loadCategories() {
            try {
                const response = await fetch(`${API_URL}/categories`);
                const data = await response.json();
                categories = data.data || [];
                renderCategories(categories);
            } catch (error) {
                console.error('Error loading categories:', error);
                document.getElementById('categories-container').innerHTML = `<div class="col-span-full text-center py-12"><i class="fas fa-exclamation-circle text-4xl text-red-400 mb-4"></i><p class="text-slate-500">Không thể tải dữ liệu</p></div>`;
            }
        }

        function renderCategories(items) {
            const container = document.getElementById('categories-container');
            if (items.length === 0) {
                container.innerHTML = `<div class="col-span-full text-center py-12"><i class="fas fa-tags text-4xl text-slate-300 mb-4"></i><p class="text-slate-500">Chưa có danh mục nào</p></div>`;
                return;
            }
            container.innerHTML = items.map(cat => {
                const isActive = cat.trang_thai == 1;
                return `
                    <div class="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition border border-slate-100 p-5 ${!isActive ? 'opacity-60' : ''}">
                        <div class="flex justify-between items-start mb-4">
                            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                <i class="fas fa-tags text-xl"></i>
                            </div>
                            <span class="px-3 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}">
                                ${isActive ? 'Đang hiển thị' : 'Đã ẩn'}
                            </span>
                        </div>
                        <h4 class="font-bold text-lg mb-2 text-slate-800">${cat.ten_danh_muc}</h4>
                        <p class="text-sm text-slate-500 mb-4 line-clamp-2">${cat.mo_ta || 'Chưa có mô tả'}</p>
                        <div class="flex space-x-2">
                            <button onclick="editCategory(${cat.ma_danh_muc})" class="flex-1 bg-blue-50 text-blue-600 py-2.5 rounded-xl hover:bg-blue-100 transition text-sm font-medium"><i class="fas fa-edit mr-1"></i>Sửa</button>
                            <button onclick="deleteCategory(${cat.ma_danh_muc})" class="flex-1 bg-red-50 text-red-600 py-2.5 rounded-xl hover:bg-red-100 transition text-sm font-medium"><i class="fas fa-trash mr-1"></i>Xóa</button>
                        </div>
                    </div>`;
            }).join('');
        }

        function openAddModal() {
            document.getElementById('modal-title').textContent = 'Thêm danh mục mới';
            document.getElementById('category-form').reset();
            document.getElementById('category-id').value = '';
            document.getElementById('category-modal').classList.remove('hidden');
        }

        function closeModal() {
            document.getElementById('category-modal').classList.add('hidden');
        }

        function editCategory(id) {
            const cat = categories.find(c => c.ma_danh_muc === id);
            if (!cat) return;
            document.getElementById('modal-title').textContent = 'Chỉnh sửa danh mục';
            document.getElementById('category-id').value = cat.ma_danh_muc;
            document.getElementById('ten_danh_muc').value = cat.ten_danh_muc;
            document.getElementById('mo_ta').value = cat.mo_ta || '';
            document.getElementById('trang_thai').value = cat.trang_thai;
            document.getElementById('category-modal').classList.remove('hidden');
        }

        async function deleteCategory(id) {
            if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
            try {
                const response = await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE', credentials: 'include' });
                const data = await response.json();
                if (data.success) {
                    showToast('Xóa thành công!', 'success');
                    loadCategories();
                } else {
                    showToast(data.message || 'Có lỗi xảy ra!', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('Có lỗi xảy ra!', 'error');
            }
        }

        document.getElementById('category-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('category-id').value;
            const payload = {
                ten_danh_muc: document.getElementById('ten_danh_muc').value,
                mo_ta: document.getElementById('mo_ta').value,
                trang_thai: parseInt(document.getElementById('trang_thai').value)
            };

            try {
                const url = id ? `${API_URL}/categories/${id}` : `${API_URL}/categories`;
                const response = await fetch(url, {
                    method: id ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.success) {
                    showToast(data.message, 'success');
                    closeModal();
                    loadCategories();
                } else {
                    showToast(data.message || 'Có lỗi xảy ra!', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('Có lỗi xảy ra!', 'error');
            }
        });

        function applyFilters() {
            const search = document.getElementById('search').value.toLowerCase();
            const filtered = categories.filter(c => 
                c.ten_danh_muc.toLowerCase().includes(search) || 
                (c.mo_ta && c.mo_ta.toLowerCase().includes(search))
            );
            renderCategories(filtered);
        }

        function showToast(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-lg z-50 transition-all transform translate-y-0 max-w-md ${
                type === 'success' ? 'bg-emerald-500 text-white' : 
                type === 'error' ? 'bg-red-500 text-white' : 
                'bg-slate-800 text-white'
            }`;
            toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} mr-2"></i>${message}`;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.classList.add('opacity-0', 'translate-y-2');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        loadCategories();
