/* ==== Script 1 (tách từ /admin/cong-thuc/) ==== */
let products = [];
        let allIngredients = [];

        // Các đơn vị đếm nguyên (trái, cái, bịch...) -> step=1
        const INTEGER_UNITS = ['cai', 'bich', 'trai', 'qua', 'thung', 'hop', 'bao', 'chai', 'lon', 'goi', 'cay', 'bo', 'mieng', 'lat', 'khuc'];
        function isIntegerUnit(unit) {
            if (!unit) return false;
            const normalized = unit.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u0111/g, 'd').replace(/\u0110/g, 'D');
            return INTEGER_UNITS.some(u => normalized.includes(u));
        }

        function restoreUiState() {
            const stateStr = sessionStorage.getItem('adminUiState_cong_thuc');
            if (stateStr) {
                try {
                    const state = JSON.parse(stateStr);
                    if (state.action === 'edit' && state.dishId && state.dishName) {
                        openRecipeModal(state.dishId, state.dishName, true);
                    }
                } catch (e) { }
            }
        }

        async function loadData() {
            try {
                // Load Products
                const resProducts = await fetch(`${API_URL}/menu?showAll=true`, { credentials: 'include' });
                const dataProducts = await resProducts.json();
                products = dataProducts.data || [];
                renderProducts(products);

                // Load Ingredients
                const resIngredients = await fetch(`${API_URL}/inventory`, { credentials: 'include' });
                const dataIngredients = await resIngredients.json();
                allIngredients = dataIngredients.data || [];

                restoreUiState();
            } catch (error) {
                console.error('Error loading data:', error);
            }
        }

        function renderProducts(items) {
            const container = document.getElementById('products-container');
            if (items.length === 0) {
                container.innerHTML = `<div class="col-span-full text-center py-12 text-gray-500">Chưa có món ăn nào</div>`;
                return;
            }
            container.innerHTML = items.map(product => {
                let imagePath = product.anh_mon || product.anh_dai_dien || '/images/default.jpg';
                if (!imagePath.startsWith('http') && !imagePath.startsWith('/images/')) imagePath = '/images/' + imagePath.replace(/^\/+/, '');
                const imageUrl = imagePath.startsWith('http') ? imagePath : `http://localhost:3000${imagePath}`;

                return `
                    <div class="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition border border-slate-100 flex items-center p-3">
                        <img src="${imageUrl}" alt="${product.ten_mon}" class="w-20 h-20 rounded-xl object-cover" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
                        <div class="ml-4 flex-1">
                            <h4 class="font-bold text-slate-800 line-clamp-1">${product.ten_mon}</h4>
                            <p class="text-xs text-slate-500 mb-2">Mã: ${product.ma_mon}</p>
                            <button onclick="openRecipeModal(${product.ma_mon}, '${product.ten_mon.replace(/'/g, "\\'")}')" class="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-100 w-full text-center">
                                <i class="fas fa-edit mr-1"></i> Cập nhật công thức
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function applyFilters() {
            const search = document.getElementById('search').value.toLowerCase();
            const filtered = products.filter(p => p.ten_mon.toLowerCase().includes(search));
            renderProducts(filtered);
        }

        // --- Recipe Modal Logic --- //

        // Draft persistence for dynamic fields
        const recipeListEl = document.getElementById('recipe-ingredients-list');
        recipeListEl.addEventListener('input', fireDraftUpdate);

        function fireDraftUpdate() {
            const dishId = document.getElementById('recipe-dish-id').value;
            if (!dishId) return;
            const rows = document.querySelectorAll('.recipe-row');
            const draft = [];
            rows.forEach(row => {
                draft.push({
                    ma_nguyen_lieu: row.querySelector('.ing-select').value,
                    so_luong_can: row.querySelector('.ing-qty').value
                });
            });
            sessionStorage.setItem(`recipe_draft_${dishId}`, JSON.stringify(draft));
        }

        async function openRecipeModal(dishId, dishName, isAutoOpen = false) {
            document.getElementById('recipe-dish-id').value = dishId;
            document.getElementById('recipe-dish-name').textContent = `Món: ${dishName}`;
            document.getElementById('recipe-ingredients-list').innerHTML = '';
            document.getElementById('empty-recipe').classList.add('hidden');

            // Show modal
            document.getElementById('recipe-modal').classList.remove('hidden');

            if (!isAutoOpen) sessionStorage.setItem('adminUiState_cong_thuc', JSON.stringify({ action: 'edit', dishId: dishId, dishName: dishName }));

            try {
                // Determine if there is a draft
                const draftStr = sessionStorage.getItem(`recipe_draft_${dishId}`);
                if (draftStr) {
                    try {
                        const draftData = JSON.parse(draftStr);
                        if (draftData && draftData.length > 0) {
                            draftData.forEach(item => {
                                addIngredientRow(item.ma_nguyen_lieu, item.so_luong_can, false);
                            });
                            return; // Mở nháp thành công, không gọi fetch nữa
                        }
                    } catch (e) { }
                }

                // Fetch existing recipe
                const res = await fetch(`${API_URL}/recipe/dish/${dishId}`, { credentials: 'include' });
                const data = await res.json();

                if (data.success && data.data && data.data.length > 0) {
                    data.data.forEach(item => {
                        addIngredientRow(item.ma_nguyen_lieu, item.so_luong_can, false);
                    });
                } else {
                    document.getElementById('empty-recipe').classList.remove('hidden');
                }
            } catch (err) {
                console.error("Error fetching recipe", err);
            }
        }

        function closeRecipeModal() {
            document.getElementById('recipe-modal').classList.add('hidden');
            sessionStorage.removeItem('adminUiState_cong_thuc');
        }

        function addIngredientRow(ma_nguyen_lieu = '', so_luong_can = '', triggerUpdate = true) {
            document.getElementById('empty-recipe').classList.add('hidden');
            const list = document.getElementById('recipe-ingredients-list');

            const row = document.createElement('div');
            row.className = 'recipe-row flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm';

            let optionsHTML = '<option value="">-- Chọn nguyên liệu --</option>';
            allIngredients.forEach(ing => {
                const selected = ing.ma_nguyen_lieu == ma_nguyen_lieu ? 'selected' : '';
                optionsHTML += `<option value="${ing.ma_nguyen_lieu}" data-unit="${ing.don_vi_tinh}" data-natural-unit="${ing.don_vi_tu_nhien || ''}" data-avg-weight="${ing.trong_luong_trung_binh || ''}" ${selected}>${ing.ten_nguyen_lieu} (${ing.don_vi_tinh})</option>`;
            });

            // Xác định step/min phù hợp dựa trên đơn vị
            let selectedUnit = '';
            let naturalUnit = '';
            let avgWeight = 0;
            let naturalQty = '';
            
            if (ma_nguyen_lieu) {
                const selectedIng = allIngredients.find(i => i.ma_nguyen_lieu == ma_nguyen_lieu);
                if (selectedIng) {
                    selectedUnit = selectedIng.don_vi_tinh;
                    naturalUnit = selectedIng.don_vi_tu_nhien;
                    avgWeight = selectedIng.trong_luong_trung_binh;
                    
                    // Tính số lượng tự nhiên
                    if (naturalUnit && avgWeight && so_luong_can) {
                        const qty = Math.floor(parseFloat(so_luong_can) / parseFloat(avgWeight));
                        naturalQty = `<span class="text-xs text-blue-600 font-semibold ml-2">≈ ${qty} ${naturalUnit}</span>`;
                    }
                }
            }
            
            const stepVal = isIntegerUnit(selectedUnit) ? '1' : '0.01';
            const minVal = isIntegerUnit(selectedUnit) ? '1' : '0.01';
            const displayQty = isIntegerUnit(selectedUnit) ? Math.round(so_luong_can || 0) : so_luong_can;

            row.innerHTML = `
                <div class="flex-1">
                    <select class="ing-select w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" onchange="updateQtyStep(this); updateNaturalUnit(this); fireDraftUpdate()">
                        ${optionsHTML}
                    </select>
                </div>
                <div class="w-36 relative">
                    <input type="number" class="ing-qty w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-semibold focus:ring-2 focus:ring-blue-500 pr-10" placeholder="Số lượng..." value="${displayQty !== '' ? displayQty : ''}" min="${minVal}" step="${stepVal}" oninput="updateNaturalUnit(this.closest('.recipe-row').querySelector('.ing-select')); fireDraftUpdate()">
                    <span class="unit-display absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 pointer-events-none select-none">${selectedUnit}</span>
                </div>
                <div class="natural-unit-display min-w-[80px]">
                    ${naturalQty || ''}
                </div>
                <button type="button" onclick="this.closest('.recipe-row').remove(); fireDraftUpdate()" class="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            list.appendChild(row);

            if (triggerUpdate) fireDraftUpdate();
        }

        function updateNaturalUnit(selectEl) {
            const row = selectEl.closest('.recipe-row');
            const qtyInput = row.querySelector('.ing-qty');
            const naturalDisplay = row.querySelector('.natural-unit-display');
            
            const selectedOption = selectEl.options[selectEl.selectedIndex];
            const naturalUnit = selectedOption.dataset.naturalUnit;
            const avgWeight = parseFloat(selectedOption.dataset.avgWeight);
            const qty = parseFloat(qtyInput.value);
            
            if (naturalUnit && avgWeight && qty) {
                const naturalQty = Math.floor(qty / avgWeight);
                naturalDisplay.innerHTML = `<span class="text-xs text-blue-600 font-semibold">≈ ${naturalQty} ${naturalUnit}</span>`;
            } else {
                naturalDisplay.innerHTML = '';
            }
        }

        function updateQtyStep(selectEl) {
            const selectedOption = selectEl.options[selectEl.selectedIndex];
            const unit = selectedOption ? selectedOption.getAttribute('data-unit') : '';
            const row = selectEl.closest('.recipe-row');
            const qtyInput = row.querySelector('.ing-qty');
            const unitDisplay = row.querySelector('.unit-display');
            
            if (unitDisplay) {
                unitDisplay.textContent = unit || '';
            }

            if (isIntegerUnit(unit)) {
                qtyInput.step = '1';
                qtyInput.min = '1';
                qtyInput.value = Math.round(parseFloat(qtyInput.value) || 0);
            } else {
                qtyInput.step = '0.01';
                qtyInput.min = '0.01';
            }
        }

        async function saveRecipe() {
            const dishId = document.getElementById('recipe-dish-id').value;
            const rows = document.querySelectorAll('.recipe-row');

            const ingredientsData = [];
            let isValid = true;

            rows.forEach(row => {
                const select = row.querySelector('.ing-select');
                const qty = row.querySelector('.ing-qty');

                if (select.value && qty.value && parseFloat(qty.value) > 0) {
                    ingredientsData.push({
                        ma_nguyen_lieu: parseInt(select.value),
                        so_luong_can: parseFloat(qty.value)
                    });
                } else {
                    if (select.value || qty.value) {
                        isValid = false; // Một dòng điền thiếu
                    }
                }
            });

            if (!isValid) {
                alert('Vui lòng điền đầy đủ dữ liệu nguyên liệu và số lượng > 0!');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/recipe/dish/${dishId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ingredients: ingredientsData }),
                    credentials: 'include'
                });

                const data = await response.json();
                if (data.success) {
                    sessionStorage.removeItem(`recipe_draft_${dishId}`);
                    alert('Lưu công thức thành công!');
                    closeRecipeModal();
                } else {
                    alert('Lỗi: ' + data.message);
                }
            } catch (err) {
                console.error(err);
                alert('Lỗi hệ thống');
            }
        }

        loadData();
