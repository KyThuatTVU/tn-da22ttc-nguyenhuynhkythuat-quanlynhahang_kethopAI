/* ==== Script 1 (tách từ nguyen-lieu.html) ==== */
let categories = [];

        document.addEventListener('DOMContentLoaded', () => {
            window.ingredientDraftManager = new FormDraftManager('ingredient-form');
            loadCategories();
        });

        async function loadCategories() {
            try {
                const res = await fetch(`${API_URL}/ingredient-categories`, { credentials: 'include' });
                const result = await res.json();
                if (result.success) {
                    categories = result.data;
                    
                    // Populate dropdown trong form thêm/sửa
                    const select = document.getElementById('ma_loai_nglieu');
                    select.innerHTML = '<option value="">-- Chưa phân loại --</option>' + 
                        categories.map(c => `<option value="${c.ma_loai_nglieu}">${c.ten_loai_nglieu}</option>`).join('');
                    
                    // Populate dropdown lọc
                    const filterSelect = document.getElementById('category-filter');
                    filterSelect.innerHTML = '<option value="">Tất cả loại nguyên liệu</option>' + 
                        categories.map(c => `<option value="${c.ma_loai_nglieu}">${c.ten_loai_nglieu}</option>`).join('') +
                        '<option value="null">Chưa phân loại</option>';
                }
            } catch (err) { console.error(err); }
        }

        // Các đơn vị đếm nguyên (trái, cái, bịch...) -> hiển thị số nguyên
        const INTEGER_UNITS = ['cai', 'bich', 'trai', 'qua', 'thung', 'hop', 'bao', 'chai', 'lon', 'goi', 'cay', 'bo', 'mieng', 'lat', 'khuc'];

        function isIntegerUnit(unit) {
            if (!unit) return false;
            const normalized = unit.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u0111/g, 'd').replace(/\u0110/g, 'D');
            return INTEGER_UNITS.some(u => normalized.includes(u));
        }

        function formatStock(value, unit) {
            if (isIntegerUnit(unit)) {
                return Math.round(value).toLocaleString('vi-VN');
            }
            return Number(value).toLocaleString('vi-VN');
        }

        let ingredients = [];

        function restoreUiState() {
            const stateStr = sessionStorage.getItem('adminUiState_nguyen_lieu');
            if (stateStr) {
                try {
                    const state = JSON.parse(stateStr);
                    if (state.action === 'add') openAddModal(true);
                    else if (state.action === 'edit' && state.id) editIngredient(state.id, true);
                    else if (state.action === 'stock' && state.id) openAddStockModal(state.id, true);
                } catch (e) {}
            }
        }

        async function loadIngredients() {
            try {
                const response = await fetch(`${API_URL}/inventory`, { credentials: 'include' });
                const data = await response.json();
                ingredients = data.data || [];
                renderIngredients(ingredients);
                restoreUiState();
            } catch (error) {
                console.error('Error loading inventory:', error);
                document.getElementById('ingredients-container').innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-red-500">Lỗi kết nối đến máy chủ!</td></tr>`;
            }
        }

        function renderIngredients(items) {
            const container = document.getElementById('ingredients-container');
            if (items.length === 0) {
                container.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-gray-400">Không có dữ liệu nguyên liệu.</td></tr>`;
                return;
            }
            container.innerHTML = items.map(item => {
                const stockWarning = item.so_luong_ton <= item.muc_canh_bao;
                const outOfStock = item.so_luong_ton <= 0;
                
                let badgeHTML = '';
                if(outOfStock) badgeHTML = '<span class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Hết hàng</span>';
                else if(stockWarning) badgeHTML = '<span class="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">Sắp hết</span>';
                else badgeHTML = '<span class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Tốt</span>';

                const categoryName = item.ten_loai_nglieu || '<span class="text-slate-300 italic">Chưa phân loại</span>';
                
                // Hiển thị tồn kho với đơn vị tự nhiên nếu có
                let stockDisplay;
                if (item.don_vi_tu_nhien && item.trong_luong_trung_binh && item.so_luong_tu_nhien !== null) {
                    stockDisplay = `
                        <div class="flex flex-col">
                            <span class="font-bold ${outOfStock ? 'text-red-600' : stockWarning ? 'text-amber-500' : 'text-slate-800'}">
                                ${formatStock(item.so_luong_ton, item.don_vi_tinh)} <span class="text-[10px] uppercase font-bold text-slate-400">${item.don_vi_tinh}</span>
                            </span>
                            <span class="text-xs text-blue-600 font-semibold">
                                ≈ ${item.so_luong_tu_nhien} ${item.don_vi_tu_nhien}
                            </span>
                        </div>
                    `;
                } else {
                    stockDisplay = `
                        <span class="font-bold ${outOfStock ? 'text-red-600' : stockWarning ? 'text-amber-500' : 'text-slate-800'}">
                            ${formatStock(item.so_luong_ton, item.don_vi_tinh)} <span class="text-[10px] uppercase font-bold text-slate-400">${item.don_vi_tinh}</span>
                        </span>
                    `;
                }
                
                return `
                    <tr class="hover:bg-slate-50 transition">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">#${item.ma_nguyen_lieu}</td>
                        <td class="px-6 py-4 font-semibold text-slate-800">${item.ten_nguyen_lieu}</td>
                        <td class="px-6 py-4">
                            <span class="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-tight">${categoryName}</span>
                        </td>
                        <td class="px-6 py-4 text-sm text-slate-500">${item.don_vi_tinh}</td>
                        <td class="px-6 py-4 text-sm">
                            ${stockDisplay}
                            <span class="text-xs font-normal text-slate-400 block mt-1">Cảnh báo: ${formatStock(item.muc_canh_bao, item.don_vi_tinh)} ${item.don_vi_tinh}</span>
                        </td>
                        <td class="px-6 py-4">${badgeHTML}</td>
                        <td class="px-6 py-4 text-center whitespace-nowrap">
                            <div class="flex items-center justify-center space-x-1">
                                <button onclick="openAddStockModal(${item.ma_nguyen_lieu})" class="text-emerald-600 hover:bg-emerald-50 px-2 py-1.5 rounded-lg border border-emerald-200 text-[10px] font-bold uppercase transition" title="Nhập hàng"><i class="fas fa-plus mr-1"></i>Nhập</button>
                                <button onclick="openWastageModal(${item.ma_nguyen_lieu})" class="text-orange-600 hover:bg-orange-50 px-2 py-1.5 rounded-lg border border-orange-200 text-[10px] font-bold uppercase transition" title="Báo cáo hao hụt"><i class="fas fa-dumpster mr-1"></i>Hao hụt</button>
                                <button onclick="editIngredient(${item.ma_nguyen_lieu})" class="text-blue-600 hover:bg-blue-50 w-8 h-8 rounded-lg flex items-center justify-center border border-blue-200 transition" title="Sửa"><i class="fas fa-edit"></i></button>
                                <button onclick="deleteIngredient(${item.ma_nguyen_lieu}, '${item.ten_nguyen_lieu.replace(/'/g, "\\'")}')" class="text-red-600 hover:bg-red-50 w-8 h-8 rounded-lg flex items-center justify-center border border-red-200 transition" title="Xóa"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        function applyFilters() {
            const search = document.getElementById('search').value.toLowerCase();
            const status = document.getElementById('status-filter').value;
            const categoryFilter = document.getElementById('category-filter').value;
            const foodDrinkFilter = document.getElementById('food-drink-filter').value;
            
            let filtered = ingredients.filter(i => {
                // Lọc theo Hàng nước/Đồ ăn
                let isMatchFoodDrink = true;
                if (foodDrinkFilter === 'food') {
                    isMatchFoodDrink = i.ten_loai_nglieu !== 'Thức uống';
                } else if (foodDrinkFilter === 'drink') {
                    isMatchFoodDrink = i.ten_loai_nglieu === 'Thức uống';
                }

                // Lọc theo tên
                const isMatchSearch = i.ten_nguyen_lieu.toLowerCase().includes(search);
                
                // Lọc theo trạng thái
                let isMatchStatus = true;
                if(status === 'con_hang') isMatchStatus = i.so_luong_ton > i.muc_canh_bao;
                else if(status === 'sap_het') isMatchStatus = i.so_luong_ton <= i.muc_canh_bao && i.so_luong_ton > 0;
                else if(status === 'het_hang') isMatchStatus = i.so_luong_ton <= 0;
                
                // Lọc theo loại nguyên liệu
                let isMatchCategory = true;
                if(categoryFilter) {
                    if(categoryFilter === 'null') {
                        // Lọc những nguyên liệu chưa phân loại
                        isMatchCategory = !i.ma_loai_nglieu;
                    } else {
                        // Lọc theo loại cụ thể
                        isMatchCategory = i.ma_loai_nglieu == categoryFilter;
                    }
                }
                
                return isMatchFoodDrink && isMatchSearch && isMatchStatus && isMatchCategory;
            });
            renderIngredients(filtered);
        }

        function resetFilters() {
            document.getElementById('search').value = '';
            document.getElementById('status-filter').value = '';
            document.getElementById('category-filter').value = '';
            document.getElementById('food-drink-filter').value = 'all';
            renderIngredients(ingredients);
        }

        function openAddModal(isAutoOpen = false) {
            document.getElementById('modal-title').textContent = 'Thêm nguyên liệu mới';
            document.getElementById('ingredient-form').reset();
            
            if (window.ingredientDraftManager) {
                window.ingredientDraftManager.setContext('new');
                if (isAutoOpen && window.ingredientDraftManager.hasDraft()) {
                    window.ingredientDraftManager.restore();
                } else if (!isAutoOpen) {
                    window.ingredientDraftManager.clear();
                }
            }
            
            document.getElementById('ingredient-id').value = '';
            document.getElementById('so-luong-group').classList.remove('hidden');
            document.getElementById('ti_le_chuyen_doi').dataset.manualOverride = 'false';
            
            document.getElementById('so_luong_nhap_ban_dau').value = 0;
            const sltInput = document.getElementById('so_luong_ton');
            sltInput.dataset.manualOverride = 'false';
            sltInput.readOnly = true;
            sltInput.classList.add('bg-slate-100', 'text-slate-500', 'cursor-not-allowed');
            const unlockBtn = document.getElementById('btn-unlock-ton-kho');
            if(unlockBtn) unlockBtn.classList.remove('hidden');
            
            // Reset natural unit fields
            document.getElementById('has_natural_unit').checked = false;
            document.getElementById('natural-unit-fields').classList.add('hidden');
            document.getElementById('don_vi_tu_nhien').value = '';
            document.getElementById('so_luong_tren_kg').value = '';
            document.getElementById('unit-preview').textContent = 'đơn vị';
            document.getElementById('unit-name-display').textContent = 'con';
            document.getElementById('unit-label-preview').textContent = 'con';
            document.getElementById('conversion-display').classList.add('hidden');
            
            document.getElementById('ingredient-modal').classList.remove('hidden');
            updateFormStepByUnit();
            if (typeof updateConversionRateLogic === 'function') updateConversionRateLogic();

            if (!isAutoOpen) sessionStorage.setItem('adminUiState_nguyen_lieu', JSON.stringify({ action: 'add' }));
        }

        function closeModal() {
            document.getElementById('ingredient-modal').classList.add('hidden');
            sessionStorage.removeItem('adminUiState_nguyen_lieu');
        }

        function editIngredient(id, isAutoOpen = false) {
            const item = ingredients.find(i => i.ma_nguyen_lieu === id);
            if (!item) {
                sessionStorage.removeItem('adminUiState_nguyen_lieu');
                return;
            }
            document.getElementById('modal-title').textContent = 'Chỉnh sửa nguyên liệu';
            document.getElementById('ingredient-id').value = item.ma_nguyen_lieu;
            
            if (window.ingredientDraftManager) window.ingredientDraftManager.setContext(id);
            
            document.getElementById('ten_nguyen_lieu').value = item.ten_nguyen_lieu;
            document.getElementById('don_vi_tinh').value = item.don_vi_tinh;
            
            const donViNhap = item.don_vi_nhap || item.don_vi_tinh;
            document.getElementById('don_vi_nhap').value = donViNhap;
            
            const rate = item.ti_le_chuyen_doi || 1;
            document.getElementById('ti_le_chuyen_doi').value = rate;
            
            let isStandard = false;
            if (donViNhap === 'kg' && item.don_vi_tinh === 'g' && rate === 1000) isStandard = true;
            else if (donViNhap === 'l' && item.don_vi_tinh === 'ml' && rate === 1000) isStandard = true;
            else if (donViNhap === item.don_vi_tinh && rate === 1) isStandard = true;
            
            document.getElementById('ti_le_chuyen_doi').dataset.manualOverride = isStandard ? 'false' : 'true';
            
            const sltInput = document.getElementById('so_luong_ton');
            sltInput.value = item.so_luong_ton;
            document.getElementById('so_luong_nhap_ban_dau').value = rate > 0 ? (item.so_luong_ton / rate) : 0;
            
            sltInput.dataset.manualOverride = 'false';
            sltInput.readOnly = true;
            sltInput.classList.add('bg-slate-100', 'text-slate-500', 'cursor-not-allowed');
            const unlockBtn = document.getElementById('btn-unlock-ton-kho');
            if(unlockBtn) unlockBtn.classList.remove('hidden');
            
            document.getElementById('muc_canh_bao').value = item.muc_canh_bao;
            document.getElementById('ma_loai_nglieu').value = item.ma_loai_nglieu || '';
            
            // Load natural unit data
            if (item.don_vi_tu_nhien && item.trong_luong_trung_binh) {
                document.getElementById('has_natural_unit').checked = true;
                document.getElementById('natural-unit-fields').classList.remove('hidden');
                document.getElementById('don_vi_tu_nhien').value = item.don_vi_tu_nhien;
                
                // Tính ngược: nếu DB lưu 20g/con → hiển thị 1kg = 50 con
                const unitsPerKg = Math.round(1000 / item.trong_luong_trung_binh);
                document.getElementById('so_luong_tren_kg').value = unitsPerKg;
                
                document.getElementById('unit-preview').textContent = item.don_vi_tu_nhien;
                document.getElementById('unit-name-display').textContent = item.don_vi_tu_nhien;
                document.getElementById('unit-label-preview').textContent = item.don_vi_tu_nhien;
                // Hiển thị quy đổi 1 con = ? gram
                updateNaturalUnitConversion();
            } else {
                document.getElementById('has_natural_unit').checked = false;
                document.getElementById('natural-unit-fields').classList.add('hidden');
            }
            
            // Hiện disabled phần số lượng tồn vì nên update kho qua nút Nhập kho cho minh bạch, nhưng vẫn cho phép ở form sửa
            document.getElementById('so-luong-group').classList.remove('hidden');
            document.getElementById('ingredient-modal').classList.remove('hidden');
            updateFormStepByUnit();
            if (typeof updateConversionRateLogic === 'function') updateConversionRateLogic();

            if (!isAutoOpen) sessionStorage.setItem('adminUiState_nguyen_lieu', JSON.stringify({ action: 'edit', id: id }));
            
            if (window.ingredientDraftManager) {
                if (isAutoOpen && window.ingredientDraftManager.hasDraft()) {
                    window.ingredientDraftManager.restore();
                } else if (!isAutoOpen) {
                    window.ingredientDraftManager.clear();
                }
            }
        }

        // Cập nhật step cho input số lượng dựa trên đơn vị
        function updateFormStepByUnit() {
            const unit = document.getElementById('don_vi_tinh').value;
            const sltInput = document.getElementById('so_luong_ton');
            const mcbInput = document.getElementById('muc_canh_bao');
            if (isIntegerUnit(unit)) {
                sltInput.step = '1';
                mcbInput.step = '1';
                sltInput.value = Math.round(parseFloat(sltInput.value) || 0);
                mcbInput.value = Math.round(parseFloat(mcbInput.value) || 0);
            } else {
                sltInput.step = 'any';
                mcbInput.step = 'any';
            }
        }

        // Lắng nghe thay đổi đơn vị xuất
        document.getElementById('don_vi_tinh').addEventListener('change', () => {
            updateFormStepByUnit();
            updateConversionRateLogic();
        });

        document.getElementById('don_vi_nhap').addEventListener('change', () => {
            document.getElementById('ti_le_chuyen_doi').dataset.manualOverride = 'false';
            updateConversionRateLogic();
        });

        document.getElementById('ti_le_chuyen_doi').addEventListener('input', () => {
            document.getElementById('ti_le_chuyen_doi').dataset.manualOverride = 'true';
            updateConversionRateLogic();
        });

        document.getElementById('btn-unlock-rate')?.addEventListener('click', function() {
            const rateInput = document.getElementById('ti_le_chuyen_doi');
            rateInput.dataset.manualOverride = 'true';
            updateConversionRateLogic();
            rateInput.focus();
        });

        function updateConversionRateLogic() {
            const donViNhap = document.getElementById('don_vi_nhap');
            const donViXuat = document.getElementById('don_vi_tinh');
            const rateInput = document.getElementById('ti_le_chuyen_doi');
            const unlockBtn = document.getElementById('btn-unlock-rate');
            const hint = document.getElementById('ti_le_hint');

            const nhapVal = donViNhap.value;
            const xuatVal = donViXuat.value;
            const nhapText = donViNhap.options[donViNhap.selectedIndex]?.text || '';
            const xuatText = donViXuat.options[donViXuat.selectedIndex]?.text || '';

            let autoRate = null;
            if (nhapVal === 'kg' && xuatVal === 'g') autoRate = 1000;
            else if (nhapVal === 'l' && xuatVal === 'ml') autoRate = 1000;
            else if (nhapVal === xuatVal && nhapVal) autoRate = 1;

            if (autoRate !== null && rateInput.dataset.manualOverride !== 'true') {
                rateInput.value = autoRate;
                rateInput.readOnly = true;
                rateInput.classList.add('bg-slate-100', 'text-slate-500', 'cursor-not-allowed');
                if(unlockBtn) unlockBtn.classList.remove('hidden');
            } else {
                rateInput.readOnly = false;
                rateInput.classList.remove('bg-slate-100', 'text-slate-500', 'cursor-not-allowed');
                if(unlockBtn) unlockBtn.classList.add('hidden');
            }

            const currentRate = parseFloat(rateInput.value) || 0;
            if (nhapText && xuatText && currentRate > 0) {
                if(hint) {
                    hint.classList.remove('hidden');
                    hint.textContent = `💡 Quy đổi: 1 ${nhapText} = Bằng ${currentRate.toLocaleString('vi-VN')} ${xuatText} (để tính món ăn)`;
                }
                const lblNhap = document.getElementById('lbl_dv_nhap');
                const lblXuat = document.getElementById('lbl_dv_xuat');
                if(lblNhap) lblNhap.textContent = nhapText;
                if(lblXuat) lblXuat.textContent = xuatText;
                
                if (typeof calculateTonKho === 'function') calculateTonKho();
            } else {
                if(hint) hint.classList.add('hidden');
            }
        }

        function calculateTonKho() {
            const tonKhoInput = document.getElementById('so_luong_ton');
            if (tonKhoInput.dataset.manualOverride === 'true') return;
            
            const slNhap = parseFloat(document.getElementById('so_luong_nhap_ban_dau').value) || 0;
            const rate = parseFloat(document.getElementById('ti_le_chuyen_doi').value) || 0;
            
            tonKhoInput.value = slNhap * rate;
        }

        document.getElementById('so_luong_nhap_ban_dau')?.addEventListener('input', calculateTonKho);
        document.getElementById('ti_le_chuyen_doi')?.addEventListener('input', calculateTonKho);
        
        document.getElementById('btn-unlock-ton-kho')?.addEventListener('click', function() {
            const tonKhoInput = document.getElementById('so_luong_ton');
            tonKhoInput.readOnly = false;
            tonKhoInput.dataset.manualOverride = 'true';
            tonKhoInput.classList.remove('bg-slate-100', 'text-slate-500', 'cursor-not-allowed');
            this.classList.add('hidden');
            tonKhoInput.focus();
        });

        document.getElementById('ingredient-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const slt = parseInt(document.getElementById('so_luong_ton').value) || 0;
            const mcb = parseInt(document.getElementById('muc_canh_bao').value) || 0;
            
            if (mcb > slt && slt > 0) {
                alert('Mức cảnh báo sắp hết không được lớn hơn số lượng Tồn kho thực tế!');
                document.getElementById('muc_canh_bao').focus();
                return;
            }

            const id = document.getElementById('ingredient-id').value;
            const hasNaturalUnit = document.getElementById('has_natural_unit').checked;
            
            // Tính trong_luong_trung_binh từ so_luong_tren_kg
            let trongLuongTrungBinh = null;
            if (hasNaturalUnit) {
                const soLuongTrenKg = parseFloat(document.getElementById('so_luong_tren_kg').value);
                if (soLuongTrenKg > 0) {
                    trongLuongTrungBinh = 1000 / soLuongTrenKg; // 1kg = 1000g
                }
            }
            
            const dataObj = {
                ten_nguyen_lieu: document.getElementById('ten_nguyen_lieu').value,
                so_luong_ton: parseInt(document.getElementById('so_luong_ton').value),
                don_vi_tinh: document.getElementById('don_vi_tinh').value,
                don_vi_nhap: document.getElementById('don_vi_nhap').value,
                ti_le_chuyen_doi: parseFloat(document.getElementById('ti_le_chuyen_doi').value),
                muc_canh_bao: parseInt(document.getElementById('muc_canh_bao').value),
                ma_loai_nglieu: document.getElementById('ma_loai_nglieu').value || null,
                trang_thai: 1,
                don_vi_tu_nhien: hasNaturalUnit ? document.getElementById('don_vi_tu_nhien').value : null,
                trong_luong_trung_binh: trongLuongTrungBinh,
                don_vi_chuan: 'g'
            };

            const url = id ? `${API_URL}/inventory/${id}` : `${API_URL}/inventory`;
            const method = id ? 'PUT' : 'POST';

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dataObj),
                    credentials: 'include'
                });
                const resData = await response.json();
                if(resData.success) {
                    if (window.ingredientDraftManager) window.ingredientDraftManager.clear();
                    alert('Lưu thành công!');
                    closeModal();
                    loadIngredients();
                } else {
                    alert('Lỗi: ' + resData.message);
                }
            } catch(e) {
                alert('Lỗi máy chủ');
            }
        });

        // Add Stock Modal Handling
        let currentSelectedRate = 1;
        let currentStockTab = 'import'; // 'import' hoặc 'natural'
        let currentIngredientData = null;

        function openAddStockModal(id, isAutoOpen = false) {
            const item = ingredients.find(i => i.ma_nguyen_lieu === id);
            if (!item) {
                sessionStorage.removeItem('adminUiState_nguyen_lieu');
                return;
            }
            
            currentIngredientData = item;
            currentStockTab = 'import';
            
            document.getElementById('stock-ingredient-id').value = id;
            document.getElementById('stock-ingredient-name').textContent = item.ten_nguyen_lieu;
            
            // Setup tabs
            const tabImport = document.getElementById('tab-import');
            const tabNatural = document.getElementById('tab-natural');
            const tabImportUnit = document.getElementById('tab-import-unit');
            const tabNaturalUnit = document.getElementById('tab-natural-unit');
            
            tabImportUnit.textContent = item.don_vi_nhap || item.don_vi_tinh;
            
            // Hiển thị tab natural nếu có đơn vị tự nhiên
            if (item.don_vi_tu_nhien && item.trong_luong_trung_binh) {
                tabNatural.classList.remove('hidden');
                tabNaturalUnit.textContent = item.don_vi_tu_nhien;
            } else {
                tabNatural.classList.add('hidden');
            }
            
            // Set active tab
            switchStockTab('import');
            
            document.getElementById('stock-amount').value = '';
            document.getElementById('add-stock-modal').classList.remove('hidden');
            setTimeout(() => document.getElementById('stock-amount').focus(), 100);

            if (!isAutoOpen) sessionStorage.setItem('adminUiState_nguyen_lieu', JSON.stringify({ action: 'stock', id: id }));
        }
        
        function switchStockTab(tab) {
            currentStockTab = tab;
            const item = currentIngredientData;
            
            const tabImport = document.getElementById('tab-import');
            const tabNatural = document.getElementById('tab-natural');
            const stockUnitDisplay = document.getElementById('stock-unit-display');
            const stockBaseUnit = document.getElementById('stock-base-unit');
            const stockRateCalc = document.getElementById('stock-rate-calc');
            
            if (tab === 'import') {
                // Tab nhập theo kg/thùng...
                tabImport.className = 'flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all bg-emerald-600 text-white';
                tabNatural.className = 'flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all bg-slate-100 text-slate-600';
                
                stockUnitDisplay.textContent = item.don_vi_nhap || item.don_vi_tinh;
                stockBaseUnit.textContent = item.don_vi_tinh;
                stockRateCalc.textContent = `Quy đổi: 1 ${item.don_vi_nhap} = ${item.ti_le_chuyen_doi} ${item.don_vi_tinh}`;
                
                currentSelectedRate = item.ti_le_chuyen_doi || 1;
            } else {
                // Tab nhập theo con/quả...
                tabImport.className = 'flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all bg-slate-100 text-slate-600';
                tabNatural.className = 'flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all bg-emerald-600 text-white';
                
                stockUnitDisplay.textContent = item.don_vi_tu_nhien;
                stockBaseUnit.textContent = item.don_vi_tinh;
                stockRateCalc.textContent = `Quy đổi: 1 ${item.don_vi_tu_nhien} = ${item.trong_luong_trung_binh} ${item.don_vi_tinh}`;
                
                currentSelectedRate = item.trong_luong_trung_binh || 1;
            }
            
            updateStockHint();
        }
        
        function updateStockHint() {
            const amount = parseFloat(document.getElementById('stock-amount').value) || 0;
            const actualAmount = amount * currentSelectedRate;
            document.getElementById('stock-hint').textContent = actualAmount.toLocaleString('vi-VN');
        }

        function closeAddStockModal() {
            document.getElementById('add-stock-modal').classList.add('hidden');
            sessionStorage.removeItem('adminUiState_nguyen_lieu');
        }

        document.getElementById('add-stock-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('stock-ingredient-id').value;
            const amount = parseFloat(document.getElementById('stock-amount').value);
            if(amount <= 0 || isNaN(amount)) {
                alert('Số lượng không hợp lệ');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/inventory/${id}/add-stock`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount }),
                    credentials: 'include'
                });
                const resData = await response.json();
                if(resData.success) {
                    closeAddStockModal();
                    alert('Nhập kho thành công!');
                    loadIngredients();
                } else {
                    alert('Lỗi: ' + resData.message);
                }
            } catch(e) {
                alert('Lỗi máy chủ');
            }
        });

        async function deleteIngredient(id, name) {
            if (!confirm(`Bạn có chắc chắn muốn xóa nguyên liệu "${name}"?\nHành động này không thể hoàn tác!`)) return;
            try {
                const response = await fetch(`${API_URL}/inventory/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                const resData = await response.json();
                if (resData.success) {
                    alert('Xóa nguyên liệu thành công!');
                    loadIngredients();
                } else {
                    alert('Lỗi: ' + resData.message);
                }
            } catch(e) {
                alert('Lỗi máy chủ');
            }
        }

        // --- Wastage Functions ---
        function openWastageModal(id) {
            const item = ingredients.find(i => i.ma_nguyen_lieu === id);
            if (!item) return;

            document.getElementById('wastage-ingredient-id').value = id;
            document.getElementById('wastage-ingredient-name').textContent = item.ten_nguyen_lieu;
            document.getElementById('wastage-unit').textContent = item.don_vi_tinh;
            document.getElementById('wastage-amount').value = '';
            document.getElementById('wastage-reason').value = '';
            removeWastageImage();

            document.getElementById('wastage-modal').classList.remove('hidden');
        }

        function closeWastageModal() {
            document.getElementById('wastage-modal').classList.add('hidden');
        }

        function previewWastageImage(input) {
            const preview = document.getElementById('image-preview');
            const container = document.getElementById('image-preview-container');
            const btnRemove = document.getElementById('btn-remove-image');
            
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.classList.remove('hidden');
                    container.classList.add('hidden');
                    btnRemove.classList.remove('hidden');
                }
                reader.readAsDataURL(input.files[0]);
            }
        }

        function removeWastageImage() {
            const input = document.getElementById('wastage-image');
            const preview = document.getElementById('image-preview');
            const container = document.getElementById('image-preview-container');
            const btnRemove = document.getElementById('btn-remove-image');
            
            input.value = '';
            preview.src = '';
            preview.classList.add('hidden');
            container.classList.remove('hidden');
            btnRemove.classList.add('hidden');
        }

        document.getElementById('wastage-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btnSubmit = e.target.querySelector('button[type="submit"]');
            const originalContent = btnSubmit.innerHTML;
            
            const id = document.getElementById('wastage-ingredient-id').value;
            const item = ingredients.find(i => i.ma_nguyen_lieu == id);
            const amount = parseFloat(document.getElementById('wastage-amount').value);
            
            if (amount > item.so_luong_ton) {
                if (!confirm(`Số lượng báo cáo hao hụt (${amount}) vượt quá tồn kho thực tế (${item.so_luong_ton}). Hệ thống sẽ hạ tồn kho về 0. Đồng ý?`)) {
                    return;
                }
            }

            const formData = new FormData();
            formData.append('ma_nguyen_lieu', id);
            formData.append('so_luong_hao_hut', amount);
            formData.append('ly_do', document.getElementById('wastage-reason').value);
            
            const imageFile = document.getElementById('wastage-image').files[0];
            if (imageFile) {
                formData.append('hinh_anh', imageFile);
            }

            try {
                btnSubmit.disabled = true;
                btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Đang gửi...';
                
                const res = await fetch(`${API_URL}/wastage`, {
                    method: 'POST',
                    body: formData,
                    credentials: 'include'
                });
                const result = await res.json();
                
                if (result.success) {
                    alert('Báo cáo hao hụt thành công!');
                    closeWastageModal();
                    loadIngredients();
                } else {
                    alert('Lỗi: ' + result.message);
                }
            } catch (err) {
                console.error(err);
                alert('Lỗi kết nối máy chủ!');
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = originalContent;
            }
        });

        loadIngredients();
        
        // Toggle natural unit fields
        function toggleNaturalUnitFields() {
            const checkbox = document.getElementById('has_natural_unit');
            const fields = document.getElementById('natural-unit-fields');
            const unitInput = document.getElementById('don_vi_tu_nhien');
            const weightInput = document.getElementById('trong_luong_trung_binh');
            
            if (checkbox.checked) {
                fields.classList.remove('hidden');
            } else {
                fields.classList.add('hidden');
                unitInput.value = '';
                weightInput.value = '';
            }
        }
        
        // Update unit preview
        document.getElementById('don_vi_tu_nhien').addEventListener('input', function() {
            const preview = document.getElementById('unit-preview');
            const unitNameDisplay = document.getElementById('unit-name-display');
            const unitLabelPreview = document.getElementById('unit-label-preview');
            const unitValue = this.value || 'đơn vị';
            preview.textContent = unitValue;
            unitNameDisplay.textContent = unitValue;
            unitLabelPreview.textContent = unitValue;
            updateNaturalUnitConversion();
        });
        
        // Tính toán và hiển thị "1 con = ? gram" (đảo ngược từ "1kg = ? con")
        function updateNaturalUnitConversion() {
            const unitsPerKgInput = document.getElementById('so_luong_tren_kg');
            const unitInput = document.getElementById('don_vi_tu_nhien');
            const conversionDisplay = document.getElementById('conversion-display');
            const gramsPerUnitSpan = document.getElementById('grams-per-unit');
            
            const unitsPerKg = parseFloat(unitsPerKgInput.value);
            const unit = unitInput.value.trim();
            
            if (unitsPerKg > 0 && unit) {
                // 1 kg = 1000g, chia cho số lượng con trong 1kg
                const gramsPerUnit = (1000 / unitsPerKg).toFixed(2);
                gramsPerUnitSpan.textContent = gramsPerUnit;
                conversionDisplay.classList.remove('hidden');
            } else {
                conversionDisplay.classList.add('hidden');
            }
        }
