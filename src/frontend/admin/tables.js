/* ==== Script 1 (tách từ /admin/tables/) ==== */
const TABLE_API_URL = 'http://localhost:3000/api/tables';
        let isEditMode = false;
        let allManagementTables = [];
        let currentAreaFilter = 'all';

        function showToast(message, type = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle' };
            const bgs = { success: 'linear-gradient(135deg, #059669, #10b981)', error: 'linear-gradient(135deg, #dc2626, #ef4444)' };
            
            toast.className = 'toast';
            toast.style.background = bgs[type];
            toast.innerHTML = `<i class="fas ${icons[type]} text-lg"></i><span class="font-bold">${message}</span>`;
            container.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'toastOut 0.3s ease forwards';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        async function loadTables() {
            try {
                const response = await fetch(TABLE_API_URL);
                const result = await response.json();
                if (result.success) {
                    allManagementTables = result.data;
                    updateAreaFilterOptions(result.data);
                    
                    const filtered = currentAreaFilter === 'all' 
                        ? result.data 
                        : result.data.filter(t => (t.vi_tri || 'Khu chung') === currentAreaFilter);
                        
                    displayTables(filtered);
                    updateKPI(filtered);
                }
            } catch (error) {
                console.error('Error loading tables:', error);
                showToast('Không thể kết nối server', 'error');
            }
        }

        function updateAreaFilterOptions(tableList) {
            const select = document.getElementById('area-filter');
            const areas = [...new Set(tableList.map(t => t.vi_tri || 'Khu chung'))];
            const currentVal = select.value;
            
            select.innerHTML = '<option value="all">Tất cả khu vực</option>' + 
                areas.map(area => `<option value="${area}">${area}</option>`).join('');
                
            if (areas.includes(currentVal) || currentVal === 'all') {
                select.value = currentVal;
            } else {
                currentAreaFilter = 'all';
                select.value = 'all';
            }
        }

        function filterManagementTables() {
            currentAreaFilter = document.getElementById('area-filter').value;
            let filtered = allManagementTables;
            if (currentAreaFilter !== 'all') {
                filtered = allManagementTables.filter(t => (t.vi_tri || 'Khu chung') === currentAreaFilter);
            }
            displayTables(filtered);
            updateKPI(filtered);
        }

        function displayTables(tableList) {
            const container = document.getElementById('table-list-body');
            if (tableList.length === 0) {
                container.innerHTML = `<div class="col-span-full py-20 text-center"><div class="text-6xl text-slate-200 mb-4"><i class="fas fa-chair"></i></div><p class="text-slate-500 font-bold">Chưa có bàn nào được thiết lập</p></div>`;
                return;
            }

            container.innerHTML = tableList.map(table => {
                const statusInfo = {
                    trong: { class: 'status-trong', text: 'Trống', icon: 'fa-chair' },
                    dang_phuc_vu: { class: 'status-dang_phuc_vu', text: 'Đang dùng', icon: 'fa-utensils' },
                    da_dat: { class: 'status-da_dat', text: 'Đã đặt', icon: 'fa-id-card' }
                };
                const si = statusInfo[table.trang_thai] || statusInfo.trong;

                return `
                <div class="table-card ${si.class}" onclick="openEditModal(${table.ma_ban})">
                    <div class="flex justify-between items-start mb-2">
                        <div class="table-icon-bg">
                            <i class="fas ${si.icon}"></i>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="event.stopPropagation(); openEditModal(${table.ma_ban})" class="btn-action btn-edit"><i class="fas fa-pen text-xs"></i></button>
                            ${table.trang_thai === 'trong' ? `<button onclick="event.stopPropagation(); deleteTable(${table.ma_ban})" class="btn-action btn-delete"><i class="fas fa-trash text-xs"></i></button>` : ''}
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between mb-1">
                        <h4 class="table-number">${table.ten_ban}</h4>
                        <span class="text-xs font-800 text-slate-400">#${table.ma_ban}</span>
                    </div>
                    
                    <p class="text-sm text-slate-500 font-medium mb-4 flex items-center gap-2">
                        <i class="fas fa-map-marker-alt text-slate-300"></i> ${table.vi_tri || 'Khu chung'}
                    </p>
                    
                    <div class="flex items-center justify-between border-t border-slate-50 pt-4">
                        <div class="flex items-center">
                            <span class="status-dot"></span>
                            <span class="text-xs font-bold uppercase tracking-wider ${table.trang_thai === 'trong' ? 'text-emerald-600' : table.trang_thai === 'dang_phuc_vu' ? 'text-amber-600' : 'text-blue-600'}">${si.text}</span>
                        </div>
                        <div class="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full">
                            <i class="fas fa-users text-slate-400 text-[10px]"></i>
                            <span class="text-xs font-800 text-slate-600">${table.so_cho} chỗ</span>
                        </div>
                    </div>
                </div>`;
            }).join('');
        }

        function updateKPI(tableList) {
            const total = tableList.length;
            const available = tableList.filter(t => t.trang_thai === 'trong').length;
            const occupied = tableList.filter(t => t.trang_thai === 'dang_phuc_vu').length;
            const reserved = tableList.filter(t => t.trang_thai === 'da_dat').length;

            document.getElementById('tables-kpi').innerHTML = `
                <div class="kpi-card kpi-blue">
                    <div class="kpi-icon-wrap"><i class="fas fa-th-large"></i></div>
                    <div><p class="text-xs font-bold text-slate-400 uppercase tracking-tighter">Tổng số bàn</p><p class="text-2xl font-900 text-slate-800">${total}</p></div>
                </div>
                <div class="kpi-card kpi-emerald">
                    <div class="kpi-icon-wrap"><i class="fas fa-check-circle"></i></div>
                    <div><p class="text-xs font-bold text-slate-400 uppercase tracking-tighter">Bàn trống</p><p class="text-2xl font-900 text-emerald-600">${available}</p></div>
                </div>
                <div class="kpi-card kpi-amber">
                    <div class="kpi-icon-wrap"><i class="fas fa-fire"></i></div>
                    <div><p class="text-xs font-bold text-slate-400 uppercase tracking-tighter">Đang dùng</p><p class="text-2xl font-900 text-amber-600">${occupied}</p></div>
                </div>
                <div class="kpi-card kpi-indigo">
                    <div class="kpi-icon-wrap"><i class="fas fa-bookmark"></i></div>
                    <div><p class="text-xs font-bold text-slate-400 uppercase tracking-tighter">Đã đặt</p><p class="text-2xl font-900 text-indigo-600">${reserved}</p></div>
                </div>
            `;
        }

        function openAddModal() {
            isEditMode = false;
            document.getElementById('modal-title').textContent = 'Thêm bàn mới';
            document.getElementById('tableForm').reset();
            document.getElementById('table-id').value = '';
            document.getElementById('table-seats').value = '4';
            document.getElementById('table-status').value = 'trong';
            const modal = document.getElementById('tableModal');
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('show'), 10);
        }

        async function openEditModal(id) {
            isEditMode = true;
            document.getElementById('modal-title').textContent = 'Hiệu chỉnh bàn';
            try {
                const response = await fetch(`${TABLE_API_URL}/${id}`);
                const result = await response.json();
                if (result.success && result.data) {
                    const table = result.data;
                    document.getElementById('table-id').value = table.ma_ban;
                    document.getElementById('table-name').value = table.ten_ban;
                    document.getElementById('table-seats').value = table.so_cho;
                    document.getElementById('table-location').value = table.vi_tri || '';
                    document.getElementById('table-status').value = table.trang_thai;
                    const modal = document.getElementById('tableModal');
                    modal.style.display = 'flex';
                    setTimeout(() => modal.classList.add('show'), 10);
                }
            } catch (error) { showToast('Không thể tải thông tin', 'error'); }
        }

        function closeModal() {
            const modal = document.getElementById('tableModal');
            modal.classList.remove('show');
            setTimeout(() => modal.style.display = 'none', 300);
        }

        document.getElementById('tableForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('table-id').value;
            const data = {
                ten_ban: document.getElementById('table-name').value,
                so_cho: parseInt(document.getElementById('table-seats').value),
                vi_tri: document.getElementById('table-location').value,
                trang_thai: document.getElementById('table-status').value
            };
            try {
                const url = isEditMode ? `${TABLE_API_URL}/${id}` : TABLE_API_URL;
                const method = isEditMode ? 'PUT' : 'POST';
                const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
                const result = await response.json();
                if (result.success) {
                    showToast(isEditMode ? 'Đã cập nhật bàn thành công' : 'Đã thêm bàn mới thành công');
                    closeModal();
                    loadTables();
                } else showToast(result.message, 'error');
            } catch (error) { showToast('Lỗi server', 'error'); }
        });

        async function deleteTable(id) {
            if (!confirm('Xác nhận xóa bàn này khỏi hệ thống?')) return;
            try {
                const response = await fetch(`${TABLE_API_URL}/${id}`, { method: 'DELETE' });
                const result = await response.json();
                if (result.success) { showToast('Đã xóa bàn'); loadTables(); }
                else showToast(result.message, 'error');
            } catch (error) { showToast('Không thể xóa bàn này', 'error'); }
        }

        loadTables();
        
        // Close modal on click outside
        window.onclick = function(event) {
            const modal = document.getElementById('tableModal');
            if (event.target == modal) closeModal();
        }
