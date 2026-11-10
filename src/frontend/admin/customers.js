/* ==== Script 1 (tách từ /admin/customers/) ==== */
// API_URL đã được khai báo trong admin-layout.js
        let customers = [];

        async function loadCustomers() {
            try {
                const response = await fetch(`${API_URL}/customers`, { credentials: 'include' });
                const result = await response.json();
                if (result.success) { customers = result.data || []; updateStats(); renderCustomers(customers); }
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('customers-tbody').innerHTML = `<tr><td colspan="7" class="px-6 py-12 text-center text-red-500"><i class="fas fa-exclamation-circle text-2xl mb-2"></i><br>Không thể tải dữ liệu</td></tr>`;
            }
        }

        function updateStats() {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            document.getElementById('total-customers').textContent = customers.length;
            document.getElementById('new-customers').textContent = customers.filter(c => new Date(c.ngay_tao) >= startOfMonth).length;
            document.getElementById('active-customers').textContent = customers.filter(c => c.trang_thai === 1).length;
            document.getElementById('locked-customers').textContent = customers.filter(c => c.trang_thai === 0).length;
        }

        function renderCustomers(items) {
            const tbody = document.getElementById('customers-tbody');
            if (items.length === 0) { tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-12 text-center text-slate-500">Chưa có khách hàng</td></tr>`; return; }
            tbody.innerHTML = items.map(c => `
                <tr class="hover:bg-slate-50">
                    <td class="px-6 py-4">
                        <div class="flex items-center space-x-3">
                            <img src="${c.anh_dai_dien || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.ten_nguoi_dung)}&background=3b82f6&color=fff`}" alt="${c.ten_nguoi_dung}" class="w-10 h-10 rounded-full">
                            <div><p class="font-medium text-slate-800">${c.ten_nguoi_dung}</p><p class="text-xs text-slate-500">#${c.ma_nguoi_dung}</p></div>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-700">${c.email}</td>
                    <td class="px-6 py-4 text-sm text-slate-700">${c.so_dien_thoai || 'N/A'}</td>
                    <td class="px-6 py-4 text-sm text-slate-700">${c.gioi_tinh === 'nam' ? 'Nam' : c.gioi_tinh === 'nu' ? 'Nữ' : 'Khác'}</td>
                    <td class="px-6 py-4 text-sm text-slate-500">${new Date(c.ngay_tao).toLocaleDateString('vi-VN')}</td>
                    <td class="px-6 py-4"><span class="px-3 py-1 rounded-full text-xs font-medium ${c.trang_thai === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}">${c.trang_thai === 1 ? 'Hoạt động' : 'Đã khóa'}</span></td>
                    <td class="px-6 py-4">
                        <button onclick="toggleStatus(${c.ma_nguoi_dung})" class="p-2 rounded-lg ${c.trang_thai === 1 ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}"><i class="fas fa-${c.trang_thai === 1 ? 'lock' : 'unlock'}"></i></button>
                    </td>
                </tr>
            `).join('');
        }

        async function toggleStatus(customerId) {
            const customer = customers.find(c => c.ma_nguoi_dung === customerId);
            if (!customer) return;
            const action = customer.trang_thai === 1 ? 'khóa' : 'mở khóa';
            if (!confirm(`Bạn có chắc muốn ${action} tài khoản này?`)) return;
            try {
                const newStatus = customer.trang_thai === 1 ? 0 : 1;
                const response = await fetch(`${API_URL}/customers/${customerId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trang_thai: newStatus }), credentials: 'include' });
                if ((await response.json()).success) { customer.trang_thai = newStatus; updateStats(); renderCustomers(customers); alert(`${action.charAt(0).toUpperCase() + action.slice(1)} thành công!`); }
            } catch (error) { console.error('Error:', error); alert('Có lỗi xảy ra!'); }
        }

        function applyFilters() {
            const search = document.getElementById('search').value.toLowerCase();
            const status = document.getElementById('status-filter').value;
            const gender = document.getElementById('gender-filter').value;
            let filtered = customers.filter(c => {
                const matchSearch = c.ten_nguoi_dung.toLowerCase().includes(search) || c.email.toLowerCase().includes(search) || (c.so_dien_thoai && c.so_dien_thoai.includes(search));
                const matchStatus = !status || c.trang_thai == status;
                const matchGender = !gender || c.gioi_tinh === gender;
                return matchSearch && matchStatus && matchGender;
            });
            renderCustomers(filtered);
        }

        loadCustomers();
