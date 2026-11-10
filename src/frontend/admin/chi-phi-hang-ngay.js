/* ==== Script 1 (tách từ /admin/chi-phi-hang-ngay/) ==== */
let expenses = [];
        let categories = [];

        document.addEventListener('DOMContentLoaded', () => {
            loadCategories();
            setDefaultDates();
            loadExpenses();
            
            // Tự động lọc khi thay đổi
            document.getElementById('category-filter').addEventListener('change', applyClientSideFilters);
            document.getElementById('search').addEventListener('input', applyClientSideFilters);
        });

        function setDefaultDates() {
            const today = new Date();
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            
            document.getElementById('from-date').valueAsDate = firstDay;
            document.getElementById('to-date').valueAsDate = today;
            document.getElementById('ngay_chi').valueAsDate = today;
        }

        async function loadCategories() {
            try {
                const response = await fetch(`${API_URL}/expense-categories`, { credentials: 'include' });
                const data = await response.json();
                
                if (data.success && data.data) {
                    // Lấy tên loại chi phí từ mảng objects
                    categories = data.data.map(cat => cat.ten_loai_chi_phi);
                    
                    // Populate form select
                    const formSelect = document.getElementById('loai_chi_phi');
                    formSelect.innerHTML = '<option value="">-- Chọn loại --</option>' + 
                        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
                    
                    // Populate filter select
                    const filterSelect = document.getElementById('category-filter');
                    filterSelect.innerHTML = '<option value="">Tất cả loại</option>' + 
                        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
                    
                    console.log('✅ Đã load', categories.length, 'loại chi phí');
                } else {
                    console.warn('⚠️ Không có dữ liệu loại chi phí, sử dụng fallback');
                    // Fallback về danh sách cũ
                    categories = [
                        'Nguyên liệu',
                        'Điện nước',
                        'Tiền thuê mặt bằng',
                        'Lương nhân viên',
                        'Bảo trì sửa chữa',
                        'Marketing',
                        'Văn phòng phẩm',
                        'Vận chuyển',
                        'Bảo hiểm',
                        'Thuế phí',
                        'Đào tạo nhân viên',
                        'Khấu hao thiết bị',
                        'Chi phí pháp lý',
                        'Khác'
                    ];
                    
                    // Populate form select
                    const formSelect = document.getElementById('loai_chi_phi');
                    formSelect.innerHTML = '<option value="">-- Chọn loại --</option>' + 
                        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
                    
                    // Populate filter select
                    const filterSelect = document.getElementById('category-filter');
                    filterSelect.innerHTML = '<option value="">Tất cả loại</option>' + 
                        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
                }
            } catch (error) {
                console.error('❌ Lỗi load categories:', error);
                // Fallback về danh sách cũ
                categories = [
                    'Nguyên liệu',
                    'Điện nước',
                    'Tiền thuê mặt bằng',
                    'Lương nhân viên',
                    'Bảo trì sửa chữa',
                    'Marketing',
                    'Văn phòng phẩm',
                    'Vận chuyển',
                    'Bảo hiểm',
                    'Thuế phí',
                    'Đào tạo nhân viên',
                    'Khấu hao thiết bị',
                    'Chi phí pháp lý',
                    'Khác'
                ];
                
                // Populate form select
                const formSelect = document.getElementById('loai_chi_phi');
                formSelect.innerHTML = '<option value="">-- Chọn loại --</option>' + 
                    categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
                
                // Populate filter select
                const filterSelect = document.getElementById('category-filter');
                filterSelect.innerHTML = '<option value="">Tất cả loại</option>' + 
                    categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
            }
        }

        async function loadExpenses() {
            try {
                const fromDate = document.getElementById('from-date').value;
                const toDate = document.getElementById('to-date').value;
                
                const response = await fetch(
                    `${API_URL}/expenses/range?tu_ngay=${fromDate}&den_ngay=${toDate}`,
                    { credentials: 'include' }
                );
                const data = await response.json();
                
                if (data.success) {
                    expenses = data.data;
                    applyClientSideFilters(); // Áp dụng filter phía client
                    updateStats(data);
                }
            } catch (error) {
                console.error('Error loading expenses:', error);
                Swal.fire('Lỗi!', 'Không thể tải dữ liệu chi phí', 'error');
            }
        }

        function applyClientSideFilters() {
            const categoryFilter = document.getElementById('category-filter').value;
            const searchText = document.getElementById('search').value.toLowerCase();
            
            let filtered = expenses;
            
            // Lọc theo loại chi phí
            if (categoryFilter) {
                filtered = filtered.filter(e => e.loai_chi_phi === categoryFilter);
            }
            
            // Lọc theo tìm kiếm
            if (searchText) {
                filtered = filtered.filter(e => 
                    e.ten_chi_phi.toLowerCase().includes(searchText) ||
                    (e.mo_ta && e.mo_ta.toLowerCase().includes(searchText)) ||
                    (e.nguoi_nhan && e.nguoi_nhan.toLowerCase().includes(searchText))
                );
            }
            
            renderExpenses(filtered);
        }

        function updateStats(data) {
            const today = new Date().toISOString().split('T')[0];
            const todayExpenses = expenses.filter(e => e.ngay_chi === today);
            const todayTotal = todayExpenses.reduce((sum, e) => sum + parseFloat(e.so_tien), 0);
            
            // Calculate week
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const weekExpenses = expenses.filter(e => new Date(e.ngay_chi) >= weekAgo);
            const weekTotal = weekExpenses.reduce((sum, e) => sum + parseFloat(e.so_tien), 0);
            
            // Calculate month
            const monthStart = new Date();
            monthStart.setDate(1);
            const monthExpenses = expenses.filter(e => new Date(e.ngay_chi) >= monthStart);
            const monthTotal = monthExpenses.reduce((sum, e) => sum + parseFloat(e.so_tien), 0);
            
            document.getElementById('today-expense').textContent = formatCurrency(todayTotal);
            document.getElementById('week-expense').textContent = formatCurrency(weekTotal);
            document.getElementById('month-expense').textContent = formatCurrency(monthTotal);
            document.getElementById('total-count').textContent = expenses.length;
        }

        function renderExpenses(items) {
            const container = document.getElementById('expenses-container');
            
            if (items.length === 0) {
                container.innerHTML = `
                    <tr>
                        <td colspan="7" class="px-6 py-8 text-center text-slate-400">
                            <i class="fas fa-inbox text-4xl mb-2"></i><br>
                            Không có dữ liệu chi phí
                        </td>
                    </tr>
                `;
                document.getElementById('filtered-count').textContent = '0';
                document.getElementById('filtered-total').textContent = '0đ';
                return;
            }
            
            const total = items.reduce((sum, item) => sum + parseFloat(item.so_tien), 0);
            
            container.innerHTML = items.map(item => {
                const categoryColor = getCategoryColor(item.loai_chi_phi);
                const paymentIcon = getPaymentIcon(item.phuong_thuc_thanh_toan);
                
                return `
                    <tr class="hover:bg-slate-50 transition">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            ${formatDate(item.ngay_chi)}
                        </td>
                        <td class="px-6 py-4">
                            <span class="px-3 py-1 ${categoryColor} rounded-lg text-xs font-bold">
                                ${item.loai_chi_phi}
                            </span>
                        </td>
                        <td class="px-6 py-4 font-semibold text-slate-800">
                            ${item.ten_chi_phi}
                            ${item.mo_ta ? `<br><span class="text-xs text-slate-500">${item.mo_ta}</span>` : ''}
                        </td>
                        <td class="px-6 py-4 font-bold text-red-600">
                            ${formatCurrency(item.so_tien)}
                        </td>
                        <td class="px-6 py-4 text-sm text-slate-600">
                            ${item.nguoi_nhan || '<span class="text-slate-300">-</span>'}
                        </td>
                        <td class="px-6 py-4">
                            <span class="text-xs text-slate-600">
                                <i class="${paymentIcon} mr-1"></i>${item.phuong_thuc_thanh_toan}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-center whitespace-nowrap">
                            <button onclick="editExpense(${item.ma_chi_phi})" class="text-blue-600 hover:text-blue-800 mr-3" title="Sửa">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteExpense(${item.ma_chi_phi})" class="text-red-600 hover:text-red-800" title="Xóa">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
            
            document.getElementById('filtered-count').textContent = items.length;
            document.getElementById('filtered-total').textContent = formatCurrency(total);
        }

        function getCategoryColor(category) {
            const colors = {
                'Nguyên liệu': 'bg-emerald-100 text-emerald-700',
                'Điện nước': 'bg-blue-100 text-blue-700',
                'Tiền thuê mặt bằng': 'bg-purple-100 text-purple-700',
                'Lương nhân viên': 'bg-pink-100 text-pink-700',
                'Bảo trì sửa chữa': 'bg-orange-100 text-orange-700',
                'Marketing': 'bg-indigo-100 text-indigo-700',
                'Văn phòng phẩm': 'bg-cyan-100 text-cyan-700',
                'Vận chuyển': 'bg-amber-100 text-amber-700',
                'Khác': 'bg-slate-100 text-slate-700'
            };
            return colors[category] || 'bg-slate-100 text-slate-700';
        }

        function getPaymentIcon(method) {
            const icons = {
                'Tiền mặt': 'fas fa-money-bill-wave',
                'Chuyển khoản': 'fas fa-exchange-alt',
                'Thẻ': 'fas fa-credit-card'
            };
            return icons[method] || 'fas fa-wallet';
        }

        function formatCurrency(amount) {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(amount);
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }

        function applyFilters() {
            applyClientSideFilters();
        }

        function resetFilters() {
            setDefaultDates();
            document.getElementById('category-filter').value = '';
            document.getElementById('search').value = '';
            loadExpenses();
        }

        function openAddModal() {
            document.getElementById('modal-title').textContent = 'Thêm Chi Phí Mới';
            document.getElementById('expense-form').reset();
            document.getElementById('expense-id').value = '';
            document.getElementById('ngay_chi').valueAsDate = new Date();
            document.getElementById('expense-modal').classList.remove('hidden');
        }

        async function editExpense(id) {
            try {
                const response = await fetch(`${API_URL}/expenses/${id}`, { credentials: 'include' });
                const data = await response.json();
                
                if (data.success) {
                    const expense = data.data;
                    document.getElementById('modal-title').textContent = 'Sửa Chi Phí';
                    document.getElementById('expense-id').value = expense.ma_chi_phi;
                    document.getElementById('ngay_chi').value = expense.ngay_chi;
                    document.getElementById('loai_chi_phi').value = expense.loai_chi_phi;
                    document.getElementById('ten_chi_phi').value = expense.ten_chi_phi;
                    document.getElementById('so_tien').value = expense.so_tien;
                    document.getElementById('nguoi_nhan').value = expense.nguoi_nhan || '';
                    document.getElementById('phuong_thuc_thanh_toan').value = expense.phuong_thuc_thanh_toan;
                    document.getElementById('mo_ta').value = expense.mo_ta || '';
                    document.getElementById('expense-modal').classList.remove('hidden');
                }
            } catch (error) {
                console.error('Error loading expense:', error);
                Swal.fire('Lỗi!', 'Không thể tải thông tin chi phí', 'error');
            }
        }

        async function deleteExpense(id) {
            const result = await Swal.fire({
                title: 'Xác nhận xóa?',
                text: 'Bạn có chắc muốn xóa khoản chi này?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Xóa',
                cancelButtonText: 'Hủy'
            });
            
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`${API_URL}/expenses/${id}`, {
                        method: 'DELETE',
                        credentials: 'include'
                    });
                    const data = await response.json();
                    
                    if (data.success) {
                        Swal.fire('Thành công!', 'Đã xóa chi phí', 'success');
                        loadExpenses();
                    } else {
                        Swal.fire('Lỗi!', data.message, 'error');
                    }
                } catch (error) {
                    console.error('Error deleting expense:', error);
                    Swal.fire('Lỗi!', 'Không thể xóa chi phí', 'error');
                }
            }
        }

        function closeModal() {
            document.getElementById('expense-modal').classList.add('hidden');
        }

        document.getElementById('expense-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const id = document.getElementById('expense-id').value;
            const formData = {
                ngay_chi: document.getElementById('ngay_chi').value,
                loai_chi_phi: document.getElementById('loai_chi_phi').value,
                ten_chi_phi: document.getElementById('ten_chi_phi').value,
                so_tien: document.getElementById('so_tien').value,
                nguoi_nhan: document.getElementById('nguoi_nhan').value,
                phuong_thuc_thanh_toan: document.getElementById('phuong_thuc_thanh_toan').value,
                mo_ta: document.getElementById('mo_ta').value
            };
            
            try {
                const url = id ? `${API_URL}/expenses/${id}` : `${API_URL}/expenses`;
                const method = id ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    Swal.fire('Thành công!', id ? 'Đã cập nhật chi phí' : 'Đã thêm chi phí mới', 'success');
                    closeModal();
                    loadExpenses();
                } else {
                    Swal.fire('Lỗi!', data.message, 'error');
                }
            } catch (error) {
                console.error('Error saving expense:', error);
                Swal.fire('Lỗi!', 'Không thể lưu chi phí', 'error');
            }
        });
