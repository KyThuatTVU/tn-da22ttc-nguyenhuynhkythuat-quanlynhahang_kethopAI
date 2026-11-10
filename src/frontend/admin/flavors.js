/* ==== Script 1 (tách từ flavors.html) ==== */
let flavors = [];

        async function loadFlavors() {
            try {
                const response = await fetch(`${API_URL}/menu/flavors`);
                const data = await response.json();
                flavors = data.data || [];
                renderFlavors(flavors);
            } catch (error) {
                console.error('Error loading flavors:', error);
                document.getElementById('categories-container').innerHTML = `<div class="col-span-full text-center py-12"><i class="fas fa-exclamation-circle text-4xl text-red-400 mb-4"></i><p class="text-slate-500">Không thể tải dữ liệu</p></div>`;
            }
        }

        function renderFlavors(items) {
            const container = document.getElementById('categories-container');
            if (items.length === 0) {
                container.innerHTML = '<div class="col-span-full text-center py-12"><i class="fas fa-heart text-4xl text-slate-300 mb-4"></i><p class="text-slate-500">Chưa có khẩu vị nào</p></div>';
                return;
            }
            container.innerHTML = items.map(flavor => {
                return `
                    <div class="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition border border-slate-100 p-5">
                        <div class="flex justify-between items-start mb-4">
                            <div class="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600">
                                <i class="fas fa-heart text-xl"></i>
                            </div>
                        </div>
                        <h4 class="font-bold text-lg mb-2 text-slate-800">${flavor.ten_thuoc_tinh}</h4>
                        <div class="flex space-x-2 mt-4">
                            <button onclick="editFlavor(${flavor.id})" class="flex-1 bg-blue-50 text-blue-600 py-2.5 rounded-xl hover:bg-blue-100 transition text-sm font-medium"><i class="fas fa-edit mr-1"></i>Sửa</button>
                            <button onclick="deleteFlavor(${flavor.id})" class="flex-1 bg-red-50 text-red-600 py-2.5 rounded-xl hover:bg-red-100 transition text-sm font-medium"><i class="fas fa-trash mr-1"></i>Xóa</button>
                        </div>
                    </div>`;
            }).join('');
        }

        function openAddModal() {
            document.getElementById('modal-title').textContent = 'Thêm Khẩu Vị Mới';
            document.getElementById('flavor-form').reset();
            document.getElementById('id').value = '';
            document.getElementById('flavor-modal').classList.remove('hidden');
        }

        function closeModal() {
            document.getElementById('flavor-modal').classList.add('hidden');
        }

        function editFlavor(id) {
            const flavor = flavors.find(f => f.id === id);
            if (!flavor) return;

            document.getElementById('modal-title').textContent = 'Sửa Khẩu Vị';
            document.getElementById('id').value = flavor.id;
            document.getElementById('ten_thuoc_tinh').value = flavor.ten_thuoc_tinh;
            
            document.getElementById('flavor-modal').classList.remove('hidden');
        }

        async function deleteFlavor(id) {
            if (!confirm('Bạn có chắc muốn xóa khẩu vị này? Tất cả các món ăn có khẩu vị này sẽ bị ảnh hưởng!')) return;
            try {
                const response = await fetch(`${API_URL}/menu/flavors/${id}`, { method: 'DELETE', credentials: 'include' });
                const data = await response.json();
                if (data.success) {
                    showToast('Xóa thành công!', 'success');
                    loadFlavors();
                } else {
                    showToast(data.message || 'Lỗi khi xóa', 'error');
                }
            } catch (error) {
                console.error(error);
                showToast('Lỗi hệ thống', 'error');
            }
        }

        document.getElementById('flavor-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('id').value;
            const payload = {
                ten_thuoc_tinh: document.getElementById('ten_thuoc_tinh').value
            };

            try {
                const url = id ? `${API_URL}/menu/flavors/${id}` : `${API_URL}/menu/flavors`;
                const response = await fetch(url, {
                    method: id ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    credentials: 'include'
                });
                const data = await response.json();
                
                if (data.success) {
                    showToast(id ? 'Cập nhật thành công!' : 'Thêm thành công!', 'success');
                    closeModal();
                    loadFlavors();
                } else {
                    showToast(data.message || 'Lỗi lưu dữ liệu', 'error');
                }
            } catch (error) {
                console.error(error);
                showToast('Lỗi hệ thống', 'error');
            }
        });

        function filterFlavors() {
            const searchObj = document.getElementById('search').value.toLowerCase();
            const filtered = flavors.filter(f => f.ten_thuoc_tinh.toLowerCase().includes(searchObj));
            renderFlavors(filtered);
        }

        function applyFilters() { filterFlavors(); }
        document.getElementById('search').addEventListener('input', filterFlavors);

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

        loadFlavors();
