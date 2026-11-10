/* ==== Script 1 (tách từ admin-pos-tables.html) ==== */
const API_BASE = 'http://localhost:3000/api';
        let allTables = [];
        let currentFilter = 'all';
        let currentArea = 'all';

        window.addEventListener('DOMContentLoaded', () => {
            initAdminLayout(); // Đợi auth hoàn tất hiển thị giao diện chung
            
            setTimeout(() => {
                loadTables();
                setInterval(loadTables, 30000);
            }, 800);
        });

        async function loadTables() {
            try {
                const response = await fetch(`${API_BASE}/pos/tables`, { credentials: 'include' });
                const data = await response.json();
                
                if (data.success) {
                    allTables = data.data;
                    updateAreaOptions();
                    updateStats();
                    renderTables();
                }
            } catch (error) {
                console.error('Error loading tables:', error);
            }
        }

        function updateStatsArea(filteredTables) {
            // Update stats based on filtered area
            let tablesToStat = allTables;
            if (currentArea !== 'all') {
                tablesToStat = allTables.filter(t => (t.vi_tri || 'Khu chung') === currentArea);
            }
            const available = tablesToStat.filter(t => t.trang_thai === 'trong').length;
            const occupied = tablesToStat.filter(t => t.trang_thai === 'dang_phuc_vu').length;
            const reserved = tablesToStat.filter(t => t.trang_thai === 'da_dat').length;
            
            document.getElementById('availableCount').textContent = available;
            document.getElementById('occupiedCount').textContent = occupied;
            document.getElementById('reservedCount').textContent = reserved;
        }

        function updateStats() {
            const available = allTables.filter(t => t.trang_thai === 'trong').length;
            const occupied = allTables.filter(t => t.trang_thai === 'dang_phuc_vu').length;
            const reserved = allTables.filter(t => t.trang_thai === 'da_dat').length;
            
            document.getElementById('availableCount').textContent = available;
            document.getElementById('occupiedCount').textContent = occupied;
            document.getElementById('reservedCount').textContent = reserved;
        }

        function filterTables(filter) {
            currentFilter = filter;
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.closest('.filter-btn').classList.add('active');
            renderTables();
        }

        function updateAreaOptions() {
            const select = document.getElementById('area-filter');
            if(!select) return;
            const areas = [...new Set(allTables.map(t => t.vi_tri || 'Khu chung'))];
            const currentVal = select.value;
            
            select.innerHTML = '<option value="all">Tất cả khu vực</option>' + 
                areas.map(area => `<option value="${area}">${area}</option>`).join('');
                
            if (areas.includes(currentVal) || currentVal === 'all') {
                select.value = currentVal;
            } else {
                currentArea = 'all';
            }
        }

        function filterTablesByArea(area) {
            currentArea = area;
            renderTables();
        }

        function renderTables() {
            const grid = document.getElementById('tablesGrid');
            let filteredTables = allTables;
            
            if (currentArea !== 'all') {
                filteredTables = filteredTables.filter(t => (t.vi_tri || 'Khu chung') === currentArea);
            }
            if (currentFilter !== 'all') {
                filteredTables = filteredTables.filter(t => t.trang_thai === currentFilter);
            }
            updateStatsArea(filteredTables);
            
            if (filteredTables.length === 0) {
                grid.innerHTML = `
                    <div class="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                        <i class="fas fa-inbox text-4xl text-slate-300 mb-3"></i>
                        <p class="text-slate-500">Không có bàn nào phù hợp</p>
                    </div>
                `;
                return;
            }
            
            grid.innerHTML = filteredTables.map(table => {
                const statusClass = table.trang_thai === 'trong' ? 'available' : 
                                   table.trang_thai === 'dang_phuc_vu' ? 'occupied' : 'reserved';
                const statusText = table.trang_thai === 'trong' ? 'Trống' : 
                                  table.trang_thai === 'dang_phuc_vu' ? 'Đang phục vụ' : 'Đã đặt';
                
                return `
                    <div class="table-card ${statusClass}" onclick="selectTable(${table.ma_ban}, '${table.ten_ban}', '${table.trang_thai}')">
                        <div class="table-icon"><i class="fas fa-chair"></i></div>
                        <div class="table-name">${table.ten_ban}</div>
                        <div class="table-capacity"><i class="fas fa-users"></i> ${table.so_cho} chỗ</div>
                        <div class="table-status">${statusText}</div>
                    </div>
                `;
            }).join('');
        }

        function selectTable(tableId, tableName, status) {
            localStorage.setItem('selected_table', JSON.stringify({ id: tableId, name: tableName, status: status }));
            window.location.href = `admin-pos-order.html?table=${tableId}`;
        }
