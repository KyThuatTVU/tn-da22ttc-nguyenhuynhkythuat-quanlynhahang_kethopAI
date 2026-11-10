/* ==== Script 1 (tách từ /admin/luong-hang-ngay/) ==== */
const DAILY_SALARY_API = `${API_URL}/daily-salary`;
        const STAFF_API = `${API_URL}/staff`;

        document.addEventListener('DOMContentLoaded', () => {
            // Set ngày mặc định (tháng hiện tại)
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            const today = now.toISOString().split('T')[0];
            document.getElementById('filterStart').value = startOfMonth;
            document.getElementById('filterEnd').value = today;

            loadStaffOptions();
            loadDailySalary();
        });

        async function loadStaffOptions() {
            try {
                const res = await fetch(STAFF_API, { credentials: 'include' });
                const data = await res.json();

                if (data.success && Array.isArray(data.data)) {
                    const staffList = data.data.filter(s => s.trang_thai === 1);
                    document.getElementById('filterStaff').innerHTML = 
                        '<option value="">-- Tất cả nhân viên --</option>' +
                        staffList.map(s => `<option value="${s.ma_nhan_vien}">${s.ten_nhan_vien} (${s.ma_nv_code})</option>`).join('');
                }
            } catch (err) {
                console.error('Error loading staff:', err);
            }
        }

        async function loadDailySalary() {
            try {
                const staffId = document.getElementById('filterStaff').value;
                const start = document.getElementById('filterStart').value;
                const end = document.getElementById('filterEnd').value;

                let url = `${DAILY_SALARY_API}?start=${start}&end=${end}`;
                if (staffId) url += `&ma_nhan_vien=${staffId}`;

                const res = await fetch(url, { credentials: 'include' });
                const data = await res.json();

                if (data.success) {
                    displaySalary(data.data, data.summary);
                } else {
                    alert('Không thể tải dữ liệu!');
                }
            } catch (err) {
                console.error('Error:', err);
                alert('Lỗi kết nối server!');
            }
        }

        function displaySalary(data, summary) {
            // Update summary cards
            const uniqueStaff = [...new Set(data.map(d => d.ma_nhan_vien))].length;
            document.getElementById('countStaff').textContent = uniqueStaff;
            document.getElementById('totalHours').textContent = parseFloat(summary.tong_gio_lam).toFixed(1) + 'h';
            document.getElementById('totalDays').textContent = summary.so_ngay_lam;
            document.getElementById('totalSalary').textContent = parseFloat(summary.tong_luong).toLocaleString('vi-VN') + 'đ';

            // Update table
            const tbody = document.getElementById('salaryTableBody');

            if (data.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center py-10 text-gray-400 italic">
                            Không có dữ liệu lương trong khoảng thời gian này
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = data.map(d => {
                let statusClass = 'bg-green-100 text-green-600';
                if (d.trang_thai_cham_cong && d.trang_thai_cham_cong.includes('muộn')) {
                    statusClass = 'bg-yellow-100 text-yellow-600';
                } else if (d.trang_thai_cham_cong && d.trang_thai_cham_cong.includes('sớm')) {
                    statusClass = 'bg-red-100 text-red-600';
                }

                return `
                    <tr class="border-b hover:bg-gray-50 transition">
                        <td class="py-4 px-4">
                            <span class="font-bold text-gray-800">${new Date(d.ngay).toLocaleDateString('vi-VN')}</span>
                        </td>
                        <td class="py-4 px-4">
                            <p class="font-bold text-gray-800">${d.ten_nhan_vien}</p>
                            <p class="text-xs text-gray-500">${d.ma_nv_code}</p>
                        </td>
                        <td class="py-4 px-4 text-center font-bold text-blue-600">
                            ${parseFloat(d.so_gio_lam).toFixed(2)}h
                        </td>
                        <td class="py-4 px-4 text-right text-gray-700">
                            ${parseFloat(d.luong_theo_gio).toLocaleString('vi-VN')}đ
                        </td>
                        <td class="py-4 px-4 text-right font-bold text-green-600">
                            ${parseFloat(d.luong_ngay).toLocaleString('vi-VN')}đ
                        </td>
                        <td class="py-4 px-4">
                            <span class="px-3 py-1 rounded-lg text-xs font-bold ${statusClass}">
                                ${d.trang_thai_cham_cong || 'Đúng giờ'}
                            </span>
                        </td>
                        <td class="py-4 px-4 text-sm text-gray-600">
                            ${d.ghi_chu || '-'}
                        </td>
                    </tr>
                `;
            }).join('');
        }

        async function recalculateToday() {
            if (!confirm('Tính lại lương cho tất cả nhân viên đã chấm công hôm nay?')) return;

            try {
                const res = await fetch(`${DAILY_SALARY_API}/recalculate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ ngay: new Date().toISOString().split('T')[0] })
                });

                const result = await res.json();
                if (result.success) {
                    alert(`✅ ${result.message}\nThành công: ${result.data.thanh_cong}\nThất bại: ${result.data.that_bai}`);
                    loadDailySalary();
                } else {
                    alert('❌ ' + result.message);
                }
            } catch (err) {
                console.error('Error:', err);
                alert('Lỗi kết nối server!');
            }
        }

        async function generateMonthly() {
            const month = prompt('Nhập tháng (1-12):');
            const year = prompt('Nhập năm (VD: 2025):');

            if (!month || !year) return;

            if (month < 1 || month > 12) {
                alert('Tháng không hợp lệ!');
                return;
            }

            if (!confirm(`Tạo bảng lương tháng ${month}/${year} từ dữ liệu lương ngày?`)) return;

            try {
                const res = await fetch(`${DAILY_SALARY_API}/generate-monthly`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ thang: parseInt(month), nam: parseInt(year) })
                });

                const result = await res.json();
                if (result.success) {
                    alert('✅ ' + result.message);
                } else {
                    alert('❌ ' + result.message);
                }
            } catch (err) {
                console.error('Error:', err);
                alert('Lỗi kết nối server!');
            }
        }
