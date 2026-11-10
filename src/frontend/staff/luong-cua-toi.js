/* ==== Script 1 (tách từ /staff/luong-cua-toi/) ==== */
const API_URL = 'http://localhost:3000/api';
        let currentUser = null;

        document.addEventListener('DOMContentLoaded', async () => {
            // Kiểm tra đăng nhập
            try {
                const res = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
                const data = await res.json();
                
                if (!data.success) {
                    alert('Vui lòng đăng nhập!');
                    window.location.href = '/staff/login/';
                    return;
                }

                currentUser = data.user;
                document.getElementById('staffName').textContent = currentUser.ten_nhan_vien;

                // Set tháng/năm hiện tại
                const now = new Date();
                document.getElementById('filterMonth').value = now.getMonth() + 1;
                document.getElementById('filterYear').value = now.getFullYear();

                loadSalary();
            } catch (err) {
                console.error('Error:', err);
                alert('Lỗi kết nối server!');
            }
        });

        async function loadSalary() {
            try {
                const month = document.getElementById('filterMonth').value;
                const year = document.getElementById('filterYear').value;

                // Tính ngày đầu và cuối tháng
                const startDate = `${year}-${month.padStart(2, '0')}-01`;
                const lastDay = new Date(year, month, 0).getDate();
                const endDate = `${year}-${month.padStart(2, '0')}-${lastDay}`;

                const res = await fetch(`${API_URL}/daily-salary/my-salary?start=${startDate}&end=${endDate}`, {
                    credentials: 'include'
                });
                const result = await res.json();

                if (result.success) {
                    displaySalary(result.data, result.summary);
                } else {
                    alert('Không thể tải dữ liệu lương!');
                }
            } catch (err) {
                console.error('Error:', err);
                alert('Lỗi kết nối server!');
            }
        }

        function displaySalary(data, summary) {
            // Hiển thị tổng
            document.getElementById('totalSalary').textContent = 
                parseFloat(summary.tong_luong_du_kien).toLocaleString('vi-VN') + ' đ';
            document.getElementById('baseSalary').textContent = 
                parseFloat(summary.luong_co_ban).toLocaleString('vi-VN') + ' đ';
            document.getElementById('hourlySalary').textContent = 
                parseFloat(summary.luong_theo_gio).toLocaleString('vi-VN') + ' đ';
            document.getElementById('totalHours').textContent = 
                parseFloat(summary.tong_gio_lam).toFixed(1) + 'h';
            document.getElementById('workDays').textContent = summary.so_ngay_lam;
            document.getElementById('totalDays').textContent = summary.so_ngay_trong_thang;

            // Hiển thị chi tiết theo ngày
            const dailyList = document.getElementById('dailyList');
            
            if (data.length === 0) {
                dailyList.innerHTML = `
                    <div class="text-center py-10 text-gray-400">
                        <i class="fas fa-calendar-times text-4xl mb-3"></i>
                        <p>Chưa có dữ liệu chấm công trong tháng này</p>
                    </div>
                `;
                return;
            }

            dailyList.innerHTML = data.map(d => {
                const date = new Date(d.ngay);
                const dayName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()];
                
                let statusColor = 'bg-green-100 text-green-600';
                let statusIcon = 'fa-check-circle';
                
                if (d.trang_thai_cham_cong && d.trang_thai_cham_cong.includes('muộn')) {
                    statusColor = 'bg-yellow-100 text-yellow-600';
                    statusIcon = 'fa-clock';
                } else if (d.trang_thai_cham_cong && d.trang_thai_cham_cong.includes('sớm')) {
                    statusColor = 'bg-red-100 text-red-600';
                    statusIcon = 'fa-exclamation-circle';
                }

                return `
                    <div class="day-card bg-white border-2 border-gray-100 rounded-xl p-4">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-4">
                                <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                    <div class="text-center">
                                        <div class="text-xs text-purple-600 font-bold">${dayName}</div>
                                        <div class="text-lg font-black text-purple-800">${date.getDate()}</div>
                                    </div>
                                </div>
                                <div>
                                    <p class="font-bold text-gray-800">${date.toLocaleDateString('vi-VN')}</p>
                                    <div class="flex items-center space-x-2 mt-1">
                                        <span class="text-xs ${statusColor} px-2 py-1 rounded-full font-bold">
                                            <i class="fas ${statusIcon} mr-1"></i>
                                            ${d.trang_thai_cham_cong || 'Đúng giờ'}
                                        </span>
                                        <span class="text-xs text-gray-500">
                                            <i class="fas fa-clock mr-1"></i>${parseFloat(d.so_gio_lam).toFixed(1)}h
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-2xl font-black text-green-600">
                                    ${parseFloat(d.luong_ngay).toLocaleString('vi-VN')}đ
                                </p>
                                <p class="text-xs text-gray-500">
                                    ${parseFloat(d.luong_theo_gio).toLocaleString('vi-VN')}đ/h
                                </p>
                            </div>
                        </div>
                        ${d.ghi_chu ? `
                            <div class="mt-3 pt-3 border-t border-gray-100">
                                <p class="text-xs text-gray-500">
                                    <i class="fas fa-sticky-note mr-1"></i>${d.ghi_chu}
                                </p>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        }
