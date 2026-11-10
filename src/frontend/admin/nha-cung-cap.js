/* ==== Script 1 (tách từ /admin/nha-cung-cap/) ==== */
let allSuppliers = [];
        const SUPPLIER_API = `${API_URL}/suppliers`;

        document.addEventListener('DOMContentLoaded', () => {
            loadSuppliers();
        });

        async function loadSuppliers() {
            try {
                const response = await fetch(SUPPLIER_API);
                const result = await response.json();
                if (result.success) {
                    allSuppliers = result.data;
                    renderSuppliers(allSuppliers);
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('Không thể kết nối đến máy chủ', 'error');
            }
        }

        function renderSuppliers(suppliers) {
            const grid = document.getElementById('supplier-grid');
            const totalCount = document.getElementById('total-count');
            const emptyState = document.getElementById('empty-state');
            
            totalCount.textContent = suppliers.length;
            grid.innerHTML = '';

            if (suppliers.length === 0) {
                emptyState.classList.remove('hidden');
                return;
            }

            emptyState.classList.add('hidden');
            suppliers.forEach(s => {
                const isActive = s.trang_thai === 'dang_hop_tac';
                const card = `
                    <div class="supplier-card bg-white p-5 rounded-2xl">
                        <div class="flex justify-between items-start mb-4">
                            <div class="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl">
                                ${s.ten_nha_cung_cap.charAt(0).toUpperCase()}
                            </div>
                            <span class="text-[10px] font-bold uppercase py-1 px-3 rounded-full ${isActive ? 'status-active' : 'status-inactive'}">
                                ${isActive ? 'Đang hợp tác' : 'Ngừng hợp tác'}
                            </span>
                        </div>
                        <h3 class="font-bold text-slate-800 mb-1 line-clamp-1">${s.ten_nha_cung_cap}</h3>
                        <div class="space-y-1.5 mb-4">
                            <p class="text-xs text-slate-500 flex items-center gap-2">
                                <i class="fas fa-phone w-4"></i> ${s.so_dien_thoai}
                            </p>
                            ${s.email ? `
                            <p class="text-xs text-slate-500 flex items-center gap-2">
                                <i class="fas fa-envelope w-4"></i> ${s.email}
                            </p>` : ''}
                            <p class="text-xs text-slate-500 flex items-center gap-2 line-clamp-1">
                                <i class="fas fa-map-marker-alt w-4"></i> ${s.dia_chi || 'Chưa cập nhật địa chỉ'}
                            </p>
                        </div>
                        <div class="flex gap-2 pt-4 border-t border-slate-50">
                            <button onclick="editSupplier(${s.ma_nha_cung_cap})" class="flex-1 text-xs font-bold text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition-all border border-blue-100">
                                <i class="fas fa-edit mr-1"></i> Sửa
                            </button>
                            <button onclick="deleteSupplier(${s.ma_nha_cung_cap})" class="flex-1 text-xs font-bold text-red-600 py-2 rounded-lg hover:bg-red-50 transition-all border border-red-100">
                                <i class="fas fa-trash-alt mr-1"></i> Xóa
                            </button>
                        </div>
                    </div>
                `;
                grid.insertAdjacentHTML('beforeend', card);
            });
        }

        function filterSuppliers() {
            const search = document.getElementById('search-input').value.toLowerCase();
            const status = document.getElementById('status-filter').value;
            
            const filtered = allSuppliers.filter(s => {
                const matchesSearch = s.ten_nha_cung_cap.toLowerCase().includes(search) || 
                                     s.so_dien_thoai.includes(search) || 
                                     (s.dia_chi && s.dia_chi.toLowerCase().includes(search));
                const matchesStatus = status === 'all' || s.trang_thai === status;
                return matchesSearch && matchesStatus;
            });
            
            renderSuppliers(filtered);
        }

        function openModal(id = null) {
            const modal = document.getElementById('supplier-modal');
            const form = document.getElementById('supplier-form');
            const title = document.getElementById('modal-title');
            const statusContainer = document.getElementById('status-container');
            
            form.reset();
            document.getElementById('ma_nha_cung_cap').value = '';
            
            if (id) {
                const s = allSuppliers.find(x => x.ma_nha_cung_cap === id);
                if (s) {
                    title.textContent = 'Chỉnh sửa nhà cung cấp';
                    document.getElementById('ma_nha_cung_cap').value = s.ma_nha_cung_cap;
                    document.getElementById('ten_nha_cung_cap').value = s.ten_nha_cung_cap;
                    document.getElementById('so_dien_thoai').value = s.so_dien_thoai;
                    document.getElementById('email').value = s.email || '';
                    document.getElementById('dia_chi').value = s.dia_chi || '';
                    document.getElementById('ghi_chu').value = s.ghi_chu || '';
                    document.getElementById('trang_thai').value = s.trang_thai;
                    statusContainer.classList.remove('hidden');
                }
            } else {
                title.textContent = 'Thêm nhà cung cấp mới';
                statusContainer.classList.add('hidden');
                document.getElementById('trang_thai').value = 'dang_hop_tac';
            }
            
            modal.classList.add('show');
        }

        function closeModal() {
            document.getElementById('supplier-modal').classList.remove('show');
        }

        async function handleFormSubmit(e) {
            e.preventDefault();
            const id = document.getElementById('ma_nha_cung_cap').value;
            const data = {
                ten_nha_cung_cap: document.getElementById('ten_nha_cung_cap').value,
                so_dien_thoai: document.getElementById('so_dien_thoai').value,
                email: document.getElementById('email').value,
                dia_chi: document.getElementById('dia_chi').value,
                ghi_chu: document.getElementById('ghi_chu').value,
                trang_thai: document.getElementById('trang_thai').value
            };

            try {
                const method = id ? 'PUT' : 'POST';
                const url = id ? `${SUPPLIER_API}/${id}` : SUPPLIER_API;
                
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                if (result.success) {
                    showToast(id ? 'Cập nhật thành công!' : 'Thêm mới thành công!', 'success');
                    closeModal();
                    loadSuppliers();
                } else {
                    showToast(result.message, 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('Có lỗi xảy ra', 'error');
            }
        }

        async function deleteSupplier(id) {
            if (!confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) return;
            
            try {
                const response = await fetch(`${SUPPLIER_API}/${id}`, { method: 'DELETE' });
                const result = await response.json();
                if (result.success) {
                    showToast(result.message, 'success');
                    loadSuppliers();
                } else {
                    showToast(result.message, 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('Không thể xóa nhà cung cấp', 'error');
            }
        }

        function editSupplier(id) {
            openModal(id);
        }

        function showToast(message, type = 'info') {
            // Simplified toast for this example
            alert(message);
        }

        // Close modal on escape
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
