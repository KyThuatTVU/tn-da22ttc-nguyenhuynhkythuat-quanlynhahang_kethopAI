/* ==== Script 1 (tách từ /admin/payroll/) ==== */
// Sinh danh sách tháng cho select #filter-month (thay thế document.write)
(function () {
    const select = document.getElementById('filter-month');
    if (select) {
        for (let i = 1; i <= 12; i++) {
            const option = document.createElement('option');
            option.value = String(i);
            option.textContent = 'Tháng ' + i;
            select.appendChild(option);
        }
    }
})();

/* ==== Script 2 (tách từ /admin/payroll/) ==== */
const PAYROLL_API = `${API_URL}/payroll`;

        document.addEventListener('DOMContentLoaded', () => {
            const now = new Date();
            document.getElementById('filter-month').value = now.getMonth() + 1;
            document.getElementById('filter-year').value = now.getFullYear();
            loadPayroll();
        });

        async function loadPayroll() {
            try {
                const month = document.getElementById('filter-month').value;
                const year = document.getElementById('filter-year').value;

                const res = await fetch(`${PAYROLL_API}?thang=${month}&nam=${year}`);
                const data = await res.json();
                const body = document.getElementById('payroll-table-body');

                if (!data.success || !Array.isArray(data.data)) {
                    body.innerHTML = '<tr><td colspan="8" class="text-center py-10 text-red-500">Lỗi kết nối máy chủ hoặc dữ liệu không hợp lệ</td></tr>';
                    return;
                }

                if (data.data.length === 0) {
                    body.innerHTML = '<tr><td colspan="8" class="text-center py-10 text-gray-400 italic">Chưa có bảng lương cho kỳ này. Nhấn "Khởi tạo & Tính toán" để tạo mới.</td></tr>';
                    document.getElementById('total-payout').innerText = '0đ';
                    document.getElementById('paid-amount').innerText = '0đ';
                    document.getElementById('unpaid-amount').innerText = '0đ';
                    document.getElementById('staff-count').innerText = '0';
                    return;
                }

                let total = 0, paid = 0, unpaid = 0;

                body.innerHTML = data.data.map(p => {
                    const baseSalary = parseFloat(p.luong_co_ban || 0);
                    const hourlyRate = parseFloat(p.luong_theo_gio || 0);
                    const netSalary = parseFloat(p.tong_luong || 0);
                    
                    total += netSalary;
                    const isPaid = p.trang_thai === 'da_thanh_toan' || p.trang_thai === 'Đã thanh toán';
                    if(isPaid) paid += netSalary;
                    else unpaid += netSalary;

                    const statusClass = isPaid
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100 text-amber-700';
                    
                    const statusLabel = isPaid ? 'Đã thanh toán' : 'Chưa thanh toán';

                    // HTML logic gộp Thông tin lương
                    let salaryDetailsHtml = '';
                    if (baseSalary > 0 && hourlyRate > 0) {
                        salaryDetailsHtml = `
                            <div class="flex flex-col items-end space-y-1.5">
                                <p class="text-xs text-gray-600" title="Chiết khấu theo số ngày đi làm" >Cứng (theo ngày làm): <span class="font-bold text-gray-800 ml-1">${baseSalary.toLocaleString()}đ</span></p>
                                <p class="text-xs text-gray-600">Làm thêm: <span class="font-bold text-blue-600 ml-1">${p.tong_gio_lam}h</span> <span class="text-[10px] text-gray-400 ml-1">(Đơn giá: ${hourlyRate.toLocaleString()}đ/h)</span></p>
                            </div>
                        `;
                    } else if (baseSalary > 0) {
                        salaryDetailsHtml = `
                            <div class="text-right space-y-1" title="Chiết khấu theo tỷ lệ ngày đi làm thực tế">
                                <p class="text-xs text-gray-500 uppercase font-bold tracking-wider">Lương cứng theo ngày làm</p>
                                <p class="font-black text-gray-800 text-lg">${baseSalary.toLocaleString()}đ</p>
                            </div>
                        `;
                    } else if (hourlyRate > 0) {
                        salaryDetailsHtml = `
                            <div class="text-right space-y-0.5">
                                <p class="text-xs text-gray-500">Số giờ làm thực tế: <span class="font-black text-blue-600 ml-1 text-sm">${p.tong_gio_lam}h</span></p>
                                <p class="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Mức lương: ${hourlyRate.toLocaleString()}đ / 1 giờ</p>
                            </div>
                        `;
                    } else {
                        salaryDetailsHtml = `<span class="block text-gray-400 italic text-sm text-right">Chưa cấu hình</span>`;
                    }

                    return `
                        <tr class="border-b hover:bg-slate-50 transition">
                            <td class="py-4 px-4">
                                <p class="font-black text-gray-800">${p.ten_nhan_vien}</p>
                                <p class="text-[10px] uppercase font-bold text-blue-500 tracking-wider">${p.vai_tro}</p>
                            </td>
                            <td class="py-4 px-4">
                                ${salaryDetailsHtml}
                            </td>
                            <td class="py-4 px-4 text-right text-emerald-600 font-bold">+${parseFloat(p.thuong || 0).toLocaleString()}đ</td>
                            <td class="py-4 px-4 text-right text-rose-600 font-bold">-${parseFloat(p.phat || 0).toLocaleString()}đ</td>
                            <td class="py-4 px-4 text-right">
                                <p class="text-lg font-black text-indigo-700">${netSalary.toLocaleString()}đ</p>
                            </td>
                            <td class="py-4 px-4 text-center">
                                <span class="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase ${statusClass}">
                                    ${statusLabel}
                                </span>
                            </td>
                            <td class="py-4 px-4 text-center">
                                <button onclick="editPayroll(${p.ma_luong})" class="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition mr-1"><i class="fas fa-edit text-xs"></i></button>
                                <button onclick="deletePayroll(${p.ma_luong})" class="w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition"><i class="fas fa-trash text-xs"></i></button>
                            </td>
                        </tr>
                    `;
                }).join('');

                document.getElementById('total-payout').innerText = total.toLocaleString() + 'đ';
                document.getElementById('paid-amount').innerText = paid.toLocaleString() + 'đ';
                document.getElementById('unpaid-amount').innerText = unpaid.toLocaleString() + 'đ';
                document.getElementById('staff-count').innerText = data.data.length;

            } catch (err) { console.error('Error loading payroll:', err); }
        }

        async function generatePayroll() {
            const month = document.getElementById('filter-month').value;
            const year = document.getElementById('filter-year').value;

            if(!confirm(`Xác nhận tính toán lương cho Tháng ${month}/${year}? Hệ thống sẽ ghi đè các bản ghi cũ chưa thanh toán.`)) return;

            try {
                const res = await fetch(`${PAYROLL_API}/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ thang: month, nam: year })
                });
                const result = await res.json();
                alert(result.message);
                loadPayroll();
            } catch (err) { alert('Lỗi kết nối server!'); }
        }

        async function editPayroll(id) {
            try {
                const month = document.getElementById('filter-month').value;
                const year = document.getElementById('filter-year').value;
                const res = await fetch(`${PAYROLL_API}?thang=${month}&nam=${year}`);
                const data = await res.json();
                
                if (data.success && Array.isArray(data.data)) {
                    const p = data.data.find(x => x.ma_luong === id);
                    if (p) {
                        document.getElementById('payroll-id').value = p.ma_luong;
                        document.getElementById('form-bonus').value = p.thuong || 0;
                        document.getElementById('form-deduct').value = p.phat || 0;
                        document.getElementById('form-status').value = p.trang_thai || 'chua_thanh_toan';
                        document.getElementById('payroll-info').innerHTML = `<i class="fas fa-user mr-2"></i> ${p.ten_nhan_vien} - Tháng ${month}/${year}`;
                        document.getElementById('payrollModal').style.display = 'block';
                    }
                }
            } catch (err) { console.error('Error editing payroll:', err); }
        }

        document.getElementById('payrollForm').onsubmit = async (e) => {
            e.preventDefault();
            const id = document.getElementById('payroll-id').value;
            const payload = {
                thuong: document.getElementById('form-bonus').value,
                phat: document.getElementById('form-deduct').value,
                trang_thai: document.getElementById('form-status').value
            };
            try {
                const res = await fetch(`${PAYROLL_API}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await res.json();
                if (result.success) {
                    closeModal();
                    loadPayroll();
                } else alert(result.message);
            } catch (err) { alert('Lỗi cập nhật!'); }
        };

        async function deletePayroll(id) {
            if (confirm('Cảnh báo: Xóa bản ghi lương này? Dữ liệu này có thể được phục hồi bằng cách tính toán lại.')) {
                await fetch(`${PAYROLL_API}/${id}`, { method: 'DELETE' });
                loadPayroll();
            }
        }

        function closeModal() { document.getElementById('payrollModal').style.display = 'none'; }
