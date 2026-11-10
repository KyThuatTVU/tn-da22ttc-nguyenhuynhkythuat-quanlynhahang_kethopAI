/* ==== Script 1 (tách từ /admin/nhap-hang/) ==== */
let allIngredients = [];
        let allSuppliers = [];
        let receipts = [];

        async function loadData() {
            try {
                // Load Ingredients
                const resIng = await fetch(`${API_URL}/inventory`, { credentials: 'include' });
                const dataIng = await resIng.json();
                allIngredients = dataIng.data || [];

                // Load Suppliers
                const resSup = await fetch('/api/suppliers', { credentials: 'include' });
                const dataSup = await resSup.json();
                allSuppliers = dataSup.data || [];
                renderSupplierOptions();

                // Load Categories
                const resCat = await fetch(`${API_URL}/ingredient-categories`, { credentials: 'include' });
                const dataCat = await resCat.json();
                const categories = dataCat.data || [];
                const catFilter = document.getElementById('filter-category-modal');
                catFilter.innerHTML = '<option value="">-- Tất cả loại --</option>' + 
                    categories.map(c => `<option value="${c.ma_loai_nglieu}">${c.ten_loai_nglieu}</option>`).join('');

                // Load Receipts
                loadReceipts();
            } catch (err) { console.error(err); }
        }

        function renderSupplierOptions() {
            const select = document.getElementById('ma_nha_cung_cap');
            const options = allSuppliers.map(s => 
                `<option value="${s.ma_nha_cung_cap}">${s.ten_nha_cung_cap}</option>`
            ).join('');
            select.innerHTML = '<option value="">-- Chọn nhà cung cấp --</option>' + options;
        }

        async function loadReceipts() {
            try {
                const res = await fetch(`${API_URL}/imports`, { credentials: 'include' });
                const data = await res.json();
                receipts = data.data || [];
                renderReceipts(receipts);
            } catch (err) { console.error(err); }
        }

        function renderReceipts(items) {
            const container = document.getElementById('receipts-container');
            if (items.length === 0) {
                container.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-gray-500">Chưa có phiếu nhập nào</td></tr>`;
                return;
            }
            container.innerHTML = items.map(item => `
                <tr class="hover:bg-slate-50 transition">
                    <td class="px-6 py-4 text-sm font-bold text-blue-600">#${item.ma_phieu_nhap}</td>
                    <td class="px-6 py-4 text-sm text-slate-500">${new Date(item.thoi_gian_nhap).toLocaleString('vi-VN')}</td>
                    <td class="px-6 py-4 font-medium text-slate-800">${item.nha_cung_cap || 'N/A'}</td>
                    <td class="px-6 py-4 font-bold text-slate-800">${parseFloat(item.tong_tien).toLocaleString('vi-VN')}đ</td>
                    <td class="px-6 py-4 text-sm text-slate-500">${item.ten_nhan_vien || 'Hệ thống'}</td>
                    <td class="px-6 py-4 text-center">
                        <div class="flex items-center justify-center gap-3">
                            <button onclick="viewDetail(${item.ma_phieu_nhap})" class="text-blue-600 hover:text-blue-800" title="Xem chi tiết">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button onclick="editReceipt(${item.ma_phieu_nhap})" class="text-emerald-600 hover:text-emerald-800" title="Sửa phiếu">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteReceipt(${item.ma_phieu_nhap})" class="text-red-500 hover:text-red-700" title="Xóa phiếu">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        let isEditing = false;
        let currentEditId = null;

        function openNewReceiptModal() {
            isEditing = false;
            currentEditId = null;
            document.getElementById('modal-title').textContent = 'Tạo Phiếu Nhập Hàng Mới';
            document.getElementById('receipt-modal').classList.remove('hidden');
            document.getElementById('items-list').innerHTML = '';
            document.getElementById('ma_nha_cung_cap').value = '';
            document.getElementById('ghi_chu').value = '';
            addItemRow();
        }

        function closeModal() {
            document.getElementById('receipt-modal').classList.add('hidden');
        }

        function openQuickIngredientModal() {
            document.getElementById('quick-ingredient-form').reset();
            // Populate category options in quick modal
            const catSelect = document.getElementById('q_ma_loai_nglieu');
            const categories = Array.from(document.getElementById('filter-category-modal').options)
                .filter(opt => opt.value !== "")
                .map(opt => `<option value="${opt.value}">${opt.text}</option>`);
            catSelect.innerHTML = '<option value="">-- Chưa phân loại --</option>' + categories.join('');
            
            document.getElementById('quick-ingredient-modal').classList.remove('hidden');
        }

        function closeQuickIngredientModal() {
            document.getElementById('quick-ingredient-modal').classList.add('hidden');
        }

        function addItemRow() {
            const list = document.getElementById('items-list');
            const row = document.createElement('tr');
            row.className = 'item-row';
            
            let options = '<option value="">-- Chọn NL --</option>';
            const currentCatId = document.getElementById('filter-category-modal').value;
            
            allIngredients.forEach(ing => {
                // If filter is active, only show ingredients of that category
                if (!currentCatId || ing.ma_loai_nglieu == currentCatId) {
                    options += `<option value="${ing.ma_nguyen_lieu}" data-unit="${ing.don_vi_nhap || ing.don_vi_tinh}">${ing.ten_nguyen_lieu} (${ing.don_vi_nhap || ing.don_vi_tinh})</option>`;
                }
            });

            row.innerHTML = `
                <td class="px-4 py-2">
                    <select class="item-id w-full px-2 py-1.5 border border-slate-200 rounded text-sm" onchange="updateRowUnit(this)">
                        ${options}
                    </select>
                </td>
                <td class="px-4 py-2 relative">
                    <input type="number" class="item-qty w-full px-2 py-1.5 border border-slate-200 rounded text-sm pr-12" placeholder="SL..." oninput="calculateTotal()">
                    <span class="item-unit-label absolute right-6 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"></span>
                </td>
                <td class="px-4 py-2">
                    <input type="number" class="item-price w-full px-2 py-1.5 border border-slate-200 rounded text-sm" placeholder="Giá..." oninput="calculateTotal()">
                </td>
                <td class="px-4 py-2 text-sm font-bold text-slate-700 row-subtotal">0đ</td>
                <td class="px-4 py-2 text-center">
                    <button onclick="this.closest('tr').remove(); calculateTotal()" class="text-red-400 hover:text-red-600"><i class="fas fa-trash"></i></button>
                </td>
            `;
            list.appendChild(row);
        }

        // Cập nhật lại dropdown của tất cả các dòng (giữ nguyên lựa chọn cũ nếu còn trong danh sách)
        function refreshAllRows() {
            const rows = document.querySelectorAll('.item-row');
            const currentCatId = document.getElementById('filter-category-modal').value;

            rows.forEach(row => {
                const select = row.querySelector('.item-id');
                const currentVal = select.value;
                
                let options = '<option value="">-- Chọn NL --</option>';
                allIngredients.forEach(ing => {
                    if (!currentCatId || ing.ma_loai_nglieu == currentCatId || ing.ma_nguyen_lieu == currentVal) {
                        options += `<option value="${ing.ma_nguyen_lieu}" data-unit="${ing.don_vi_nhap || ing.don_vi_tinh}" ${ing.ma_nguyen_lieu == currentVal ? 'selected' : ''}>${ing.ten_nguyen_lieu} (${ing.don_vi_nhap || ing.don_vi_tinh})</option>`;
                    }
                });
                select.innerHTML = options;
                updateRowUnit(select);
            });
        }

        function updateRowUnit(select) {
            const unit = select.options[select.selectedIndex].dataset.unit || '';
            const row = select.closest('tr');
            const label = row.querySelector('.item-unit-label');
            if (label) label.textContent = unit;
        }

        function calculateTotal() {
            const rows = document.querySelectorAll('.item-row');
            let total = 0;
            rows.forEach(row => {
                const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
                const price = parseFloat(row.querySelector('.item-price').value) || 0;
                const subtotal = qty * price;
                total += subtotal;
                row.querySelector('.row-subtotal').textContent = subtotal.toLocaleString('vi-VN') + 'đ';
            });
            document.getElementById('total-amount').textContent = total.toLocaleString('vi-VN') + 'đ';
        }

        async function saveReceipt() {
            const rows = document.querySelectorAll('.item-row');
            const items = [];
            let isValid = true;

            rows.forEach(row => {
                const id = row.querySelector('.item-id').value;
                const qty = row.querySelector('.item-qty').value;
                const price = row.querySelector('.item-price').value;

                if (id && qty > 0 && price >= 0) {
                    items.push({
                        ma_nguyen_lieu: parseInt(id),
                        so_luong_nhap: parseFloat(qty),
                        don_gia: parseFloat(price),
                        don_vi_nhap: row.querySelector('.item-id').options[row.querySelector('.item-id').selectedIndex].dataset.unit
                    });
                } else if (id || qty || price) {
                    isValid = false;
                }
            });

            if (items.length === 0 || !isValid) {
                alert('Vui lòng điền đầy đủ thông tin các mặt hàng (số lượng > 0)');
                return;
            }

            const supplierSelect = document.getElementById('ma_nha_cung_cap');
            const data = {
                ma_nha_cung_cap: supplierSelect.value ? parseInt(supplierSelect.value) : null,
                nha_cung_cap: supplierSelect.options[supplierSelect.selectedIndex].text,
                ghi_chu: document.getElementById('ghi_chu').value,
                items: items
            };

            try {
                const url = isEditing ? `${API_URL}/imports/${currentEditId}` : `${API_URL}/imports`;
                const method = isEditing ? 'PUT' : 'POST';

                const res = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                    credentials: 'include'
                });
                const result = await res.json();
                if (result.success) {
                    alert(isEditing ? 'Đã cập nhật phiếu nhập!' : 'Đã nhập hàng thành công!');
                    closeModal();
                    loadReceipts();
                    if (!isEditing) await refreshIngredientDropdowns();
                } else {
                    alert('Lỗi: ' + result.message);
                }
            } catch (err) {
                console.error(err);
                alert('Lỗi khi lưu phiếu');
            }
        }

        async function editReceipt(id) {
            try {
                // Lấy thông tin chi tiết phiếu (đã có hàm getImportReceiptDetail ở backend)
                const res = await fetch(`${API_URL}/imports/${id}`, { credentials: 'include' });
                const result = await res.json();
                if (!result.success) return alert(result.message);

                const receipt = result.data;
                isEditing = true;
                currentEditId = id;
                document.getElementById('modal-title').textContent = 'Sửa Phiếu Nhập #' + id;
                document.getElementById('receipt-modal').classList.remove('hidden');
                
                // Điền thông tin chung
                document.getElementById('ma_nha_cung_cap').value = receipt.ma_nha_cung_cap || '';
                document.getElementById('ghi_chu').value = receipt.ghi_chu || '';
                
                // Điền danh sách hàng
                const list = document.getElementById('items-list');
                list.innerHTML = '';
                receipt.items.forEach(item => {
                    addItemRow();
                    const lastRow = list.lastElementChild;
                    const select = lastRow.querySelector('.item-id');
                    select.value = item.ma_nguyen_lieu;
                    lastRow.querySelector('.item-qty').value = item.so_luong_nhap;
                    lastRow.querySelector('.item-price').value = item.don_gia;
                    updateRowUnit(select);
                });
                calculateTotal();
            } catch (err) {
                console.error(err);
                alert('Lỗi khi tải thông tin phiếu để sửa');
            }
        }

        async function deleteReceipt(id) {
            if (!confirm('Bạn có chắc chắn muốn xóa phiếu nhập này? Hệ thống sẽ tự động trừ lại số lượng nguyên liệu trong kho.')) return;
            
            try {
                const res = await fetch(`${API_URL}/imports/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                const data = await res.json();
                if (data.success) {
                    alert('Đã xóa phiếu và cập nhật kho thành công!');
                    loadReceipts();
                } else {
                    alert('Lỗi: ' + data.message);
                }
            } catch (err) {
                console.error(err);
                alert('Lỗi khi xóa phiếu');
            }
        }

        async function viewDetail(id) {
            try {
                const res = await fetch(`${API_URL}/imports/${id}`, { credentials: 'include' });
                const result = await res.json();
                if (result.success) {
                    const pn = result.data;
                    document.getElementById('detail-id').textContent = pn.ma_phieu_nhap;
                    let html = `
                        <div class="mb-6 grid grid-cols-2 gap-4">
                            <div>
                                <p class="text-xs text-slate-500 uppercase font-bold mb-1">Nhà cung cấp</p>
                                <p class="font-bold text-slate-800">${pn.nha_cung_cap || 'N/A'}</p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500 uppercase font-bold mb-1">Thời gian</p>
                                <p class="text-slate-800">${new Date(pn.thoi_gian_nhap).toLocaleString('vi-VN')}</p>
                            </div>
                            <div class="col-span-2">
                                <p class="text-xs text-slate-500 uppercase font-bold mb-1">Ghi chú</p>
                                <p class="text-slate-800">${pn.ghi_chu || 'Không có ghi chú'}</p>
                            </div>
                        </div>
                        <h4 class="font-bold text-slate-800 mb-2">Sản phẩm đã nhập</h4>
                        <table class="min-w-full border rounded-lg overflow-hidden">
                            <thead class="bg-slate-50">
                                <tr>
                                    <th class="px-4 py-2 text-left text-xs font-bold">Nguyên liệu</th>
                                    <th class="px-4 py-2 text-right text-xs font-bold">Số lượng</th>
                                    <th class="px-4 py-2 text-right text-xs font-bold">Đơn giá</th>
                                    <th class="px-4 py-2 text-right text-xs font-bold">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pn.items.map(it => `
                                    <tr>
                                        <td class="px-4 py-2 border-t">${it.ten_nguyen_lieu}</td>
                                        <td class="px-4 py-2 border-t text-right">${it.so_luong_nhap} ${it.don_vi_nhap}</td>
                                        <td class="px-4 py-2 border-t text-right">${parseFloat(it.don_gia).toLocaleString('vi-VN')}đ</td>
                                        <td class="px-4 py-2 border-t text-right font-bold">${(it.so_luong_nhap * it.don_gia).toLocaleString('vi-VN')}đ</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot class="bg-blue-50">
                                <tr>
                                    <td colspan="3" class="px-4 py-3 text-right font-bold">Tổng cộng:</td>
                                    <td class="px-4 py-3 text-right font-bold text-blue-600 text-lg">${parseFloat(pn.tong_tien).toLocaleString('vi-VN')}đ</td>
                                </tr>
                            </tfoot>
                        </table>
                    `;
                    document.getElementById('detail-content').innerHTML = html;
                    document.getElementById('detail-modal').classList.remove('hidden');
                }
            } catch (err) { console.error(err); }
        }

        function closeDetailModal() {
            document.getElementById('detail-modal').classList.add('hidden');
        }

        function applyFilters() {
            const s = document.getElementById('search').value.toLowerCase();
            const filtered = receipts.filter(r => 
                (r.nha_cung_cap && r.nha_cung_cap.toLowerCase().includes(s)) ||
                (r.ghi_chu && r.ghi_chu.toLowerCase().includes(s))
            );
            renderReceipts(filtered);
        }


        async function refreshIngredientDropdowns() {
            try {
                const res = await fetch(`${API_URL}/inventory`, { credentials: 'include' });
                const data = await res.json();
                if (!data.success) return;
                
                allIngredients = data.data || [];
                
                // Cập nhật tất cả thẻ select mà không mất giá trị đang chọn
                const selects = document.querySelectorAll('.item-id');
                selects.forEach(select => {
                    const currentVal = select.value;
                    let options = '<option value="">-- Chọn NL --</option>';
                    allIngredients.forEach(ing => {
                        options += `<option value="${ing.ma_nguyen_lieu}" data-unit="${ing.don_vi_nhap || ing.don_vi_tinh}" ${ing.ma_nguyen_lieu == currentVal ? 'selected' : ''}>${ing.ten_nguyen_lieu} (${ing.don_vi_nhap || ing.don_vi_tinh})</option>`;
                    });
                    select.innerHTML = options;
                });
            } catch (e) { console.error(e); }
        }

        function openQuickIngredientModal() {
            document.getElementById('quick-ingredient-modal').classList.remove('hidden');
        }

        function closeQuickIngredientModal() {
            document.getElementById('quick-ingredient-modal').classList.add('hidden');
            document.getElementById('quick-ingredient-form').reset();
        }

        async function saveQuickIngredient(e) {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Đang lưu...';
            
            const payload = {
                ten_nguyen_lieu: document.getElementById('q_ten_nguyen_lieu').value,
                don_vi_nhap: document.getElementById('q_don_vi_nhap').value,
                don_vi_tinh: document.getElementById('q_don_vi_tinh').value,
                ti_le_chuyen_doi: parseFloat(document.getElementById('q_ti_le_chuyen_doi').value) || 1,
                muc_canh_bao: parseFloat(document.getElementById('q_muc_canh_bao').value) || 100,
                ma_loai_nglieu: document.getElementById('q_ma_loai_nglieu').value || null,
                so_luong_ton: 0
            };

            try {
                const res = await fetch(`${API_URL}/inventory`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    credentials: 'include'
                });
                const data = await res.json();
                if (data.success) {
                    alert('Đã thêm nguyên liệu mới!');
                    closeQuickIngredientModal();
                    await refreshIngredientDropdowns();
                } else { alert('Lỗi: ' + data.message); }
            } catch (err) { console.error(err); alert('Lỗi máy chủ'); }
            finally {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-save mr-1"></i> Lưu nguyên liệu';
            }
        }

        loadData();
