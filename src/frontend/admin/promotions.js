/* ==== Script 1 (tách từ promotions.html) ==== */
document.addEventListener('DOMContentLoaded', () => {
            window.promoDraftManager = new FormDraftManager('promo-form');
        });

        let promotions = [];
        
        function restoreUiState() {
            const stateStr = sessionStorage.getItem('adminUiState_promotions');
            if (stateStr) {
                try {
                    const state = JSON.parse(stateStr);
                    if (state.action === 'add') openModal(true);
                    else if (state.action === 'edit' && state.id) editPromo(state.id, true);
                } catch (e) {}
            }
        }

        async function loadPromotions() {
            try {
                const response = await fetch(`${API_URL}/promotions`, { credentials: 'include' });
                const data = await response.json();
                promotions = data.data || [];
                updateStats();
                renderTable();
                restoreUiState();
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('promotions-table').innerHTML = '<tr><td colspan="8" class="text-center py-8 text-red-500">Lỗi tải dữ liệu</td></tr>';
            }
        }
        
        function updateStats() {
            const now = new Date();
            document.getElementById('stat-total').textContent = promotions.length;
            document.getElementById('stat-active').textContent = promotions.filter(p => p.trang_thai === 1 && new Date(p.ngay_ket_thuc) >= now).length;
            document.getElementById('stat-expired').textContent = promotions.filter(p => new Date(p.ngay_ket_thuc) < now).length;
            document.getElementById('stat-used').textContent = promotions.reduce((sum, p) => sum + (p.so_luong_da_dung || 0), 0);
        }
        
        function renderTable() {
            const tbody = document.getElementById('promotions-table');
            if (promotions.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="text-center py-8 text-slate-500">Chưa có mã khuyến mãi</td></tr>';
                return;
            }
            
            tbody.innerHTML = promotions.map(p => {
                const now = new Date();
                const isExpired = new Date(p.ngay_ket_thuc) < now;
                const isActive = p.trang_thai === 1 && !isExpired;
                const discount = p.loai_giam_gia === 'percentage' ? `${p.gia_tri}%` : formatCurrency(p.gia_tri);
                
                return `
                    <tr class="border-b hover:bg-slate-50">
                        <td class="py-3 px-4"><span class="font-mono font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">${p.ma_code}</span></td>
                        <td class="py-3 px-4 text-sm text-slate-600 max-w-xs truncate">${p.mo_ta || '-'}</td>
                        <td class="py-3 px-4 font-semibold text-green-600">${discount}</td>
                        <td class="py-3 px-4 text-sm">${p.don_hang_toi_thieu > 0 ? formatCurrency(p.don_hang_toi_thieu) : '-'}</td>
                        <td class="py-3 px-4 text-xs text-slate-500">
                            ${formatDate(p.ngay_bat_dau)}<br>→ ${formatDate(p.ngay_ket_thuc)}
                        </td>
                        <td class="py-3 px-4 text-sm">${p.so_luong_da_dung || 0}${p.so_luong_gioi_han ? '/' + p.so_luong_gioi_han : ''}</td>
                        <td class="py-3 px-4">
                            <span class="px-2 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-700' : isExpired ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}">
                                ${isActive ? 'Hoạt động' : isExpired ? 'Hết hạn' : 'Tắt'}
                            </span>
                        </td>
                        <td class="py-3 px-4 text-center">
                            <button onclick="editPromo(${p.ma_khuyen_mai})" class="text-blue-500 hover:text-blue-700 mx-1"><i class="fas fa-edit"></i></button>
                            <button onclick="deletePromo(${p.ma_khuyen_mai})" class="text-red-500 hover:text-red-700 mx-1"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
        
        function formatCurrency(amount) {
            return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
        }
        
        function formatDate(dateStr) {
            return new Date(dateStr).toLocaleDateString('vi-VN');
        }
        
        function openModal(isAutoOpen = false) {
            document.getElementById('modal-title').textContent = 'Thêm mã khuyến mãi';
            document.getElementById('promo-form').reset();
            if (window.promoDraftManager) {
                window.promoDraftManager.setContext('new');
                if (isAutoOpen && window.promoDraftManager.hasDraft()) {
                    window.promoDraftManager.restore();
                } else if (!isAutoOpen) {
                    window.promoDraftManager.clear();
                }
            }
            document.getElementById('promo-id').value = '';
            document.getElementById('trang_thai').checked = true;
            document.getElementById('promo-modal').classList.remove('hidden');
            if (!isAutoOpen) sessionStorage.setItem('adminUiState_promotions', JSON.stringify({ action: 'add' }));
        }
        
        function closeModal() {
            document.getElementById('promo-modal').classList.add('hidden');
            sessionStorage.removeItem('adminUiState_promotions');
        }
        
        function editPromo(id, isAutoOpen = false) {
            const p = promotions.find(x => x.ma_khuyen_mai === id);
            if (!p) { sessionStorage.removeItem('adminUiState_promotions'); return; }
            document.getElementById('modal-title').textContent = 'Sửa mã khuyến mãi';
            document.getElementById('promo-id').value = p.ma_khuyen_mai;
            if (window.promoDraftManager) window.promoDraftManager.setContext(id);
            document.getElementById('ma_code').value = p.ma_code;
            document.getElementById('loai_giam_gia').value = p.loai_giam_gia;
            document.getElementById('gia_tri').value = p.gia_tri;
            document.getElementById('don_hang_toi_thieu').value = p.don_hang_toi_thieu || '';
            document.getElementById('ngay_bat_dau').value = p.ngay_bat_dau ? p.ngay_bat_dau.slice(0, 16) : '';
            document.getElementById('ngay_ket_thuc').value = p.ngay_ket_thuc ? p.ngay_ket_thuc.slice(0, 16) : '';
            document.getElementById('so_luong_gioi_han').value = p.so_luong_gioi_han || '';
            document.getElementById('mo_ta').value = p.mo_ta || '';
            document.getElementById('trang_thai').checked = p.trang_thai === 1;
            document.getElementById('promo-modal').classList.remove('hidden');
            if (!isAutoOpen) sessionStorage.setItem('adminUiState_promotions', JSON.stringify({ action: 'edit', id: id }));
            if (window.promoDraftManager) {
                if (isAutoOpen && window.promoDraftManager.hasDraft()) {
                    window.promoDraftManager.restore();
                } else if (!isAutoOpen) {
                    window.promoDraftManager.clear();
                }
            }
        }
        
        async function deletePromo(id) {
            if (!confirm('Xóa mã khuyến mãi này?')) return;
            try {
                const res = await fetch(`${API_URL}/promotions/${id}`, { method: 'DELETE', credentials: 'include' });
                if ((await res.json()).success) loadPromotions();
            } catch (e) { alert('Lỗi xóa'); }
        }
        
        document.getElementById('promo-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('promo-id').value;
            const data = {
                ma_code: document.getElementById('ma_code').value,
                loai_giam_gia: document.getElementById('loai_giam_gia').value,
                gia_tri: parseFloat(document.getElementById('gia_tri').value),
                don_hang_toi_thieu: parseFloat(document.getElementById('don_hang_toi_thieu').value) || 0,
                ngay_bat_dau: document.getElementById('ngay_bat_dau').value,
                ngay_ket_thuc: document.getElementById('ngay_ket_thuc').value,
                so_luong_gioi_han: parseInt(document.getElementById('so_luong_gioi_han').value) || null,
                mo_ta: document.getElementById('mo_ta').value,
                trang_thai: document.getElementById('trang_thai').checked ? 1 : 0
            };
            try {
                const method = id ? 'PUT' : 'POST';
                const url = id ? `${API_URL}/promotions/${id}` : `${API_URL}/promotions`;
                const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(data) });
                if ((await res.json()).success) { if (window.promoDraftManager) window.promoDraftManager.clear(); closeModal(); loadPromotions(); }
            } catch (e) { alert('Lỗi lưu'); }
        });
        
        loadPromotions();
