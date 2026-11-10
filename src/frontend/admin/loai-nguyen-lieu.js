/* ==== Script 1 (tách từ loai-nguyen-lieu.html) ==== */
let allCategories = [];

        document.addEventListener('DOMContentLoaded', () => {
            loadCategories();
        });

        async function loadCategories() {
            document.getElementById('loading-indicator').classList.remove('hidden');
            try {
                const res = await fetch(`${API_URL}/ingredient-categories`, { credentials: 'include' });
                const result = await res.json();
                if (result.success) {
                    allCategories = result.data;
                    renderCategories(allCategories);
                }
            } catch (err) {
                console.error(err);
            } finally {
                document.getElementById('loading-indicator').classList.add('hidden');
            }
        }

        function renderCategories(items) {
            const list = document.getElementById('categories-list');
            if (items.length === 0) {
                list.innerHTML = '<tr><td colspan="3" class="px-8 py-12 text-center text-slate-400 italic">Chưa có phân loại nào được tạo</td></tr>';
                return;
            }

            list.innerHTML = items.map(cat => `
                <tr class="hover:bg-slate-50/80 transition-colors group">
                    <td class="px-8 py-5 text-sm font-black text-slate-400 font-mono tracking-tighter">#${cat.ma_loai_nglieu}</td>
                    <td class="px-8 py-5 text-sm font-bold text-slate-700">${cat.ten_loai_nglieu}</td>
                    <td class="px-8 py-5 text-center">
                        <div class="flex items-center justify-center gap-2">
                            <button onclick="openEditModal(${JSON.stringify(cat).replace(/"/g, '&quot;')})" class="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                <i class="fas fa-edit text-xs"></i>
                            </button>
                            <button onclick="deleteCategory(${cat.ma_loai_nglieu})" class="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                                <i class="fas fa-trash-alt text-xs"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        function openAddModal() {
            document.getElementById('modal-title').textContent = 'Thêm phân loại mới';
            document.getElementById('category-id').value = '';
            document.getElementById('category-form').reset();
            const modal = document.getElementById('category-modal');
            const content = document.getElementById('modal-content');
            modal.classList.remove('invisible', 'opacity-0');
            content.classList.remove('scale-95');
        }

        function openEditModal(cat) {
            document.getElementById('modal-title').textContent = 'Sửa phân loại';
            document.getElementById('category-id').value = cat.ma_loai_nglieu;
            document.getElementById('ten_loai_nglieu').value = cat.ten_loai_nglieu;
            const modal = document.getElementById('category-modal');
            const content = document.getElementById('modal-content');
            modal.classList.remove('invisible', 'opacity-0');
            content.classList.remove('scale-95');
        }

        function closeModal() {
            const modal = document.getElementById('category-modal');
            const content = document.getElementById('modal-content');
            modal.classList.add('invisible', 'opacity-0');
            content.classList.add('scale-95');
        }

        document.getElementById('category-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('category-id').value;
            const ten_loai_nglieu = document.getElementById('ten_loai_nglieu').value;
            
            const method = id ? 'PUT' : 'POST';
            const url = id ? `${API_URL}/ingredient-categories/${id}` : `${API_URL}/ingredient-categories`;
            
            try {
                const res = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ten_loai_nglieu }),
                    credentials: 'include'
                });
                const result = await res.json();
                if (result.success) {
                    closeModal();
                    loadCategories();
                } else {
                    alert(result.message);
                }
            } catch (err) {
                console.error(err);
                alert('Lỗi hệ thống');
            }
        });

        async function deleteCategory(id) {
            if (!confirm('Bạn có chắc chắn muốn xóa loại hàng này?')) return;
            try {
                const res = await fetch(`${API_URL}/ingredient-categories/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                const result = await res.json();
                if (result.success) {
                    loadCategories();
                } else {
                    alert(result.message);
                }
            } catch (err) {
                console.error(err);
            }
        }
