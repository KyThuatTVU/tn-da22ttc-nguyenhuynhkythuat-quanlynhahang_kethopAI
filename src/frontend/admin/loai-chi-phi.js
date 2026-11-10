/* ==== Script 1 (tách từ loai-chi-phi.html) ==== */
let categories = [];

        document.addEventListener('DOMContentLoaded', () => {
            loadCategories();
            setupEventListeners();
        });

        function setupEventListeners() {
            // Sync color picker with text input
            document.getElementById('mau_sac').addEventListener('input', (e) => {
                document.getElementById('mau_sac_text').value = e.target.value;
            });
            
            document.getElementById('mau_sac_text').addEventListener('input', (e) => {
                document.getElementById('mau_sac').value = e.target.value;
            });
            
            // Preview icon
            document.getElementById('icon').addEventListener('input', (e) => {
                const iconPreview = document.getElementById('icon-preview');
                iconPreview.innerHTML = `<i class="${e.target.value} text-slate-600"></i>`;
            });
        }

        async function loadCategories() {
            try {
                const response = await fetch(`${API_URL}/expense-categories/stats`, { credentials: 'include' });
                const data = await response.json();
                
                if (data.success) {
                    categories = data.data;
                    renderCategories(categories);
                    updateStats(categories);
                } else {
                    Swal.fire('Lỗi!', data.message, 'error');
                }
            } catch (error) {
                console.error('Error loading categories:', error);
                Swal.fire('Lỗi!', 'Không thể tải dữ liệu', 'error');
            }
        }

        function updateStats(data) {
            const totalCategories = data.length;
            const usedCategories = data.filter(c => c.so_luong_su_dung > 0).length;
            const totalAmount = data.reduce((sum, c) => sum + parseFloat(c.tong_chi_phi), 0);
            
            document.getElementById('total-categories').textContent = totalCategories;
            document.getElementById('used-categories').textContent = usedCategories;
            document.getElementById('total-amount').textContent = formatCurrency(totalAmount);
        }

        function renderCategories(items) {
            const container = document.getElementById('categories-container');
            
            if (items.length === 0) {
                container.innerHTML = `
                    <tr>
                        <td colspan="6" class="px-6 py-8 text-center text-slate-400">
                            <i class="fas fa-inbox text-4xl mb-2"></i><br>
                            Chưa có loại chi phí nào
                        </td>
                    </tr>
                `;
                return;
            }
            
            container.innerHTML = items.map(item => {
                const isUsed = item.so_luong_su_dung > 0;
                
                return `
                    <tr class="hover:bg-slate-50 transition">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background-color: ${item.mau_sac}20; color: ${item.mau_sac}">
                                    <i class="${item.icon}"></i>
                                </div>
                                <div>
                                    <p class="font-semibold text-slate-800">${item.ten_loai_chi_phi}</p>
                                    ${isUsed ? '<span class="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">Đang sử dụng</span>' : '<span class="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Chưa sử dụng</span>'}
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-sm text-slate-600 max-w-xs">
                            ${item.mo_ta || '<span class="text-slate-300 italic">Chưa có mô tả</span>'}
                        </td>
                        <td class="px-6 py-4 text-center">
                            <span class="font-bold ${isUsed ? 'text-green-600' : 'text-slate-400'}">${item.so_luong_su_dung}</span>
                        </td>
                        <td class="px-6 py-4 text-right font-bold ${parseFloat(item.tong_chi_phi) > 0 ? 'text-red-600' : 'text-slate-400'}">
                            ${formatCurrency(item.tong_chi_phi)}
                        </td>
                        <td class="px-6 py-4 text-center">
                            <span class="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-bold">${item.thu_tu_hien_thi || 0}</span>
                        </td>
                        <td class="px-6 py-4 text-center whitespace-nowrap">
                            <button onclick="editCategory(${item.ma_loai_chi_phi})" class="text-blue-600 hover:text-blue-800 mr-3" title="Sửa">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteCategory(${item.ma_loai_chi_phi}, ${isUsed})" class="text-red-600 hover:text-red-800" title="Xóa">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        function formatCurrency(amount) {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(amount);
        }

        function openAddModal() {
            document.getElementById('modal-title').textContent = 'Thêm Loại Chi Phí Mới';
            document.getElementById('category-form').reset();
            document.getElementById('category-id').value = '';
            document.getElementById('mau_sac').value = '#6b7280';
            document.getElementById('mau_sac_text').value = '#6b7280';
            document.getElementById('icon').value = 'fas fa-money-bill-wave';
            document.getElementById('icon-preview').innerHTML = '<i class="fas fa-money-bill-wave text-slate-600"></i>';
            document.getElementById('category-modal').classList.remove('hidden');
        }

        async function editCategory(id) {
            try {
                const response = await fetch(`${API_URL}/expense-categories/${id}`, { credentials: 'include' });
                const data = await response.json();
                
                if (data.success) {
                    const category = data.data;
                    document.getElementById('modal-title').textContent = 'Sửa Loại Chi Phí';
                    document.getElementById('category-id').value = category.ma_loai_chi_phi;
                    document.getElementById('ten_loai_chi_phi').value = category.ten_loai_chi_phi;
                    document.getElementById('mo_ta').value = category.mo_ta || '';
                    document.getElementById('mau_sac').value = category.mau_sac;
                    document.getElementById('mau_sac_text').value = category.mau_sac;
                    document.getElementById('icon').value = category.icon;
                    document.getElementById('thu_tu_hien_thi').value = category.thu_tu_hien_thi;
                    document.getElementById('icon-preview').innerHTML = `<i class="${category.icon} text-slate-600"></i>`;
                    document.getElementById('category-modal').classList.remove('hidden');
                }
            } catch (error) {
                console.error('Error loading category:', error);
                Swal.fire('Lỗi!', 'Không thể tải thông tin loại chi phí', 'error');
            }
        }

        async function deleteCategory(id, isUsed) {
            const message = isUsed 
                ? 'Loại chi phí này đang được sử dụng. Bạn có muốn ẩn nó không?' 
                : 'Bạn có chắc muốn xóa loại chi phí này?';
                
            const result = await Swal.fire({
                title: 'Xác nhận',
                text: message,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: isUsed ? 'Ẩn' : 'Xóa',
                cancelButtonText: 'Hủy'
            });
            
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`${API_URL}/expense-categories/${id}`, {
                        method: 'DELETE',
                        credentials: 'include'
                    });
                    const data = await response.json();
                    
                    if (data.success) {
                        Swal.fire('Thành công!', data.message, 'success');
                        loadCategories();
                    } else {
                        Swal.fire('Lỗi!', data.message, 'error');
                    }
                } catch (error) {
                    console.error('Error deleting category:', error);
                    Swal.fire('Lỗi!', 'Không thể xóa loại chi phí', 'error');
                }
            }
        }

        function closeModal() {
            document.getElementById('category-modal').classList.add('hidden');
        }

        document.getElementById('category-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const id = document.getElementById('category-id').value;
            const formData = {
                ten_loai_chi_phi: document.getElementById('ten_loai_chi_phi').value,
                mo_ta: document.getElementById('mo_ta').value,
                mau_sac: document.getElementById('mau_sac').value,
                icon: document.getElementById('icon').value,
                thu_tu_hien_thi: parseInt(document.getElementById('thu_tu_hien_thi').value) || 0
            };
            
            try {
                const url = id ? `${API_URL}/expense-categories/${id}` : `${API_URL}/expense-categories`;
                const method = id ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    Swal.fire('Thành công!', data.message, 'success');
                    closeModal();
                    loadCategories();
                } else {
                    Swal.fire('Lỗi!', data.message, 'error');
                }
            } catch (error) {
                console.error('Error saving category:', error);
                Swal.fire('Lỗi!', 'Không thể lưu loại chi phí', 'error');
            }
        });
