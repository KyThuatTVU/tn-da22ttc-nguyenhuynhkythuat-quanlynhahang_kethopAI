/* ==== Script 1 (tách từ /admin/loi-nhuan/) ==== */
let financeChart = null;

        document.addEventListener('DOMContentLoaded', () => {
            const today = new Date();
            document.getElementById('select-month').value = today.getMonth() + 1;
            document.getElementById('select-year').value = today.getFullYear();
            loadFinanceData();
        });

        async function loadFinanceData() {
            const month = document.getElementById('select-month').value;
            const year = document.getElementById('select-year').value;
            
            try {
                const res = await fetch(`${API_URL}/stats/financial-summary?month=${month}&year=${year}`, { credentials: 'include' });
                const result = await res.json();
                
                if (result.success) {
                    updateUI(result.summary);
                    renderChart(result.data);
                    renderTable(result.data);
                } else {
                    alert('Lỗi: ' + result.message);
                }
            } catch (err) {
                console.error(err);
                alert('Không thể kết nối máy chủ');
            }
        }

        function updateUI(summary) {
            document.getElementById('total-revenue').textContent = (summary.totalRevenue || 0).toLocaleString('vi-VN') + 'đ';
            document.getElementById('total-expenses').textContent = (summary.totalExpenses || 0).toLocaleString('vi-VN') + 'đ';
            document.getElementById('net-profit').textContent = (summary.netProfit || 0).toLocaleString('vi-VN') + 'đ';
            
            const statusDiv = document.getElementById('profit-status');
            const bgDiv = document.getElementById('profit-bg');
            if (summary.netProfit >= 0) {
                statusDiv.innerHTML = '<i class="fas fa-chart-line mr-1 text-[10px]"></i> Đang có lời';
                statusDiv.className = 'mt-4 flex items-center text-xs text-emerald-600 font-bold bg-emerald-50 w-fit px-2 py-1 rounded-lg';
                bgDiv.className = 'absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-125 transition-transform duration-500';
            } else {
                statusDiv.innerHTML = '<i class="fas fa-exclamation-triangle mr-1 text-[10px]"></i> Đang thua lỗ';
                statusDiv.className = 'mt-4 flex items-center text-xs text-rose-600 font-bold bg-rose-50 w-fit px-2 py-1 rounded-lg';
                bgDiv.className = 'absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full group-hover:scale-125 transition-transform duration-500';
            }
        }

        function renderChart(data) {
            if (financeChart) {
                financeChart.destroy();
            }
            
            // Chuẩn bị dữ liệu
            const categories = data.map(d => {
                const date = new Date(d.date);
                return date.getDate() + '/' + (date.getMonth() + 1);
            });
            
            const revenueData = data.map(d => d.thu);
            const expenseData = data.map(d => d.chi);
            const profitData = data.map(d => d.net);
            
            // Cấu hình biểu đồ ApexCharts - Style TradingView
            const options = {
                series: [
                    {
                        name: 'Doanh thu',
                        type: 'area',
                        data: revenueData
                    },
                    {
                        name: 'Chi phí',
                        type: 'line',
                        data: expenseData
                    },
                    {
                        name: 'Lợi nhuận',
                        type: 'area',
                        data: profitData
                    }
                ],
                chart: {
                    height: 320,
                    type: 'line',
                    fontFamily: "'Quicksand', 'Be Vietnam Pro', 'Plus Jakarta Sans', system-ui, sans-serif",
                    toolbar: {
                        show: true,
                        tools: {
                            download: true,
                            selection: true,
                            zoom: true,
                            zoomin: true,
                            zoomout: true,
                            pan: true,
                            reset: true
                        },
                        autoSelected: 'zoom'
                    },
                    animations: {
                        enabled: true,
                        easing: 'easeinout',
                        speed: 800,
                        animateGradually: {
                            enabled: true,
                            delay: 150
                        },
                        dynamicAnimation: {
                            enabled: true,
                            speed: 350
                        }
                    },
                    background: 'transparent',
                    dropShadow: {
                        enabled: true,
                        top: 3,
                        left: 0,
                        blur: 10,
                        opacity: 0.1
                    }
                },
                colors: ['#3b82f6', '#ef4444', '#10b981'],
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    curve: 'smooth',
                    width: [3, 3, 4],
                    dashArray: [0, 5, 0]
                },
                fill: {
                    type: ['gradient', 'solid', 'gradient'],
                    gradient: {
                        shade: 'light',
                        type: 'vertical',
                        shadeIntensity: 0.5,
                        gradientToColors: ['#93c5fd', undefined, '#6ee7b7'],
                        inverseColors: false,
                        opacityFrom: 0.6,
                        opacityTo: 0.1,
                        stops: [0, 100]
                    }
                },
                markers: {
                    size: [5, 0, 6],
                    colors: ['#fff'],
                    strokeColors: ['#3b82f6', '#ef4444', '#10b981'],
                    strokeWidth: 3,
                    hover: {
                        size: 8,
                        sizeOffset: 3
                    }
                },
                xaxis: {
                    categories: categories,
                    labels: {
                        style: {
                            colors: '#64748b',
                            fontSize: '11px',
                            fontWeight: 600
                        },
                        rotate: 0
                    },
                    axisBorder: {
                        show: false
                    },
                    axisTicks: {
                        show: false
                    },
                    crosshairs: {
                        show: true,
                        width: 1,
                        stroke: {
                            color: '#94a3b8',
                            width: 1,
                            dashArray: 4
                        }
                    }
                },
                yaxis: {
                    labels: {
                        style: {
                            colors: '#64748b',
                            fontSize: '11px',
                            fontWeight: 600
                        },
                        formatter: function(val) {
                            if (val >= 1000000) {
                                return (val / 1000000).toFixed(1) + 'M';
                            } else if (val >= 1000) {
                                return (val / 1000).toFixed(0) + 'K';
                            }
                            return val;
                        }
                    }
                },
                grid: {
                    borderColor: '#f1f5f9',
                    strokeDashArray: 3,
                    xaxis: {
                        lines: {
                            show: false
                        }
                    },
                    yaxis: {
                        lines: {
                            show: true
                        }
                    },
                    padding: {
                        top: 0,
                        right: 20,
                        bottom: 0,
                        left: 10
                    }
                },
                legend: {
                    show: true,
                    position: 'top',
                    horizontalAlign: 'right',
                    fontSize: '12px',
                    fontWeight: 600,
                    labels: {
                        colors: '#475569'
                    },
                    markers: {
                        width: 10,
                        height: 10,
                        radius: 12,
                        offsetX: -5
                    },
                    itemMargin: {
                        horizontal: 15,
                        vertical: 0
                    }
                },
                tooltip: {
                    enabled: true,
                    shared: true,
                    intersect: false,
                    theme: 'dark',
                    style: {
                        fontSize: '13px',
                        fontFamily: "'Quicksand', 'Be Vietnam Pro', 'Plus Jakarta Sans', system-ui, sans-serif"
                    },
                    x: {
                        show: true,
                        format: 'dd/MM',
                        formatter: function(val, opts) {
                            return 'Ngày ' + categories[opts.dataPointIndex];
                        }
                    },
                    y: {
                        formatter: function(val, opts) {
                            return val.toLocaleString('vi-VN') + ' đ';
                        }
                    },
                    marker: {
                        show: true
                    },
                    custom: function({series, seriesIndex, dataPointIndex, w}) {
                        const thu = series[0][dataPointIndex];
                        const chi = series[1][dataPointIndex];
                        const net = series[2][dataPointIndex];
                        const margin = chi > 0 ? ((net / thu) * 100).toFixed(1) : 0;
                        const status = net >= 0 ? '✅ Có lời' : '❌ Thua lỗ';
                        
                        return `
                            <div class="apexcharts-tooltip-custom" style="background: rgba(15, 23, 42, 0.95); padding: 16px; border-radius: 12px; border: 2px solid #3b82f6; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
                                <div style="font-weight: 700; font-size: 14px; color: #fff; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
                                    📅 Ngày ${categories[dataPointIndex]}
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 8px;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="width: 10px; height: 10px; background: #3b82f6; border-radius: 50%; display: inline-block;"></span>
                                        <span style="color: #cbd5e1; font-weight: 600;">Doanh thu:</span>
                                        <span style="color: #3b82f6; font-weight: 700; margin-left: auto;">${thu.toLocaleString('vi-VN')} đ</span>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="width: 10px; height: 10px; background: #ef4444; border-radius: 50%; display: inline-block;"></span>
                                        <span style="color: #cbd5e1; font-weight: 600;">Chi phí:</span>
                                        <span style="color: #ef4444; font-weight: 700; margin-left: auto;">${chi.toLocaleString('vi-VN')} đ</span>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="width: 10px; height: 10px; background: #10b981; border-radius: 50%; display: inline-block;"></span>
                                        <span style="color: #cbd5e1; font-weight: 600;">Lợi nhuận:</span>
                                        <span style="color: ${net >= 0 ? '#10b981' : '#ef4444'}; font-weight: 700; margin-left: auto;">${net.toLocaleString('vi-VN')} đ</span>
                                    </div>
                                </div>
                                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: #94a3b8; font-size: 12px; font-weight: 600;">Tỷ suất LN:</span>
                                    <span style="color: #fbbf24; font-weight: 700; font-size: 14px;">${margin}%</span>
                                </div>
                                <div style="margin-top: 8px; text-align: center; font-weight: 700; font-size: 13px; color: ${net >= 0 ? '#10b981' : '#ef4444'};">
                                    ${status}
                                </div>
                            </div>
                        `;
                    }
                }
            };

            financeChart = new ApexCharts(document.querySelector("#financeChart"), options);
            financeChart.render();
        }

        function renderTable(data) {
            const body = document.getElementById('daily-table-body');
            body.innerHTML = '';
            
            const filteredData = data.filter(day => day.thu > 0 || day.chi > 0);
            
            filteredData.forEach(day => {
                const row = document.createElement('tr');
                row.className = 'hover:bg-slate-50 transition-all cursor-pointer group';
                row.onclick = () => showDayDetail(day.date);
                
                const profitClass = day.net >= 0 ? 'text-emerald-600' : 'text-rose-600';
                const statusBadge = day.net >= 0 
                    ? '<span class="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold">LỜI</span>' 
                    : '<span class="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold">LỖ</span>';

                row.innerHTML = `
                    <td class="px-6 py-4 text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">${new Date(day.date).toLocaleDateString('vi-VN')}</td>
                    <td class="px-6 py-4 text-right text-sm text-blue-600 font-bold">${day.thu.toLocaleString('vi-VN')}đ</td>
                    <td class="px-6 py-4 text-right text-sm text-slate-500">${day.chi.toLocaleString('vi-VN')}đ</td>
                    <td class="px-6 py-4 text-right text-sm ${profitClass} font-black">${day.net.toLocaleString('vi-VN')}đ</td>
                    <td class="px-6 py-4 text-center">${statusBadge}</td>
                `;
                body.appendChild(row);
            });
            
            if (filteredData.length === 0) {
                body.innerHTML = '<tr><td colspan="5" class="py-12 text-center text-slate-400 italic">Không có dữ liệu thu chi trong tháng này</td></tr>';
            }
        }

        async function showDayDetail(date) {
            const modal = document.getElementById('detail-modal');
            const dateText = document.getElementById('modal-date');
            const incomeList = document.getElementById('income-list');
            const expenseList = document.getElementById('expense-list');
            
            dateText.textContent = 'Ngày ' + new Date(date).toLocaleDateString('vi-VN');
            incomeList.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-slate-300"></i></div>';
            expenseList.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-slate-300"></i></div>';
            
            modal.classList.remove('invisible', 'opacity-0');
            
            try {
                const res = await fetch(`${API_URL}/stats/daily-detail?date=${date}`, { credentials: 'include' });
                const result = await res.json();
                
                if (result.success) {
                    renderDetailLists(result.data.revenue, result.data.expenses);
                    updateModalSummary(result.data.summary);
                } else {
                    incomeList.innerHTML = '<p class="text-center py-8 text-red-400">Lỗi: ' + result.message + '</p>';
                    expenseList.innerHTML = '<p class="text-center py-8 text-red-400">Lỗi: ' + result.message + '</p>';
                }
            } catch (err) {
                console.error(err);
                incomeList.innerHTML = '<p class="text-center py-8 text-red-400">Không thể kết nối máy chủ</p>';
                expenseList.innerHTML = '<p class="text-center py-8 text-red-400">Không thể kết nối máy chủ</p>';
            }
        }

        function renderDetailLists(revenue, expenses) {
            const incomeList = document.getElementById('income-list');
            const expenseList = document.getElementById('expense-list');
            
            // Render Revenue (Thu)
            if (revenue.length === 0) {
                incomeList.innerHTML = '<p class="text-center py-8 text-slate-400 italic text-xs">Không có khoản thu</p>';
            } else {
                incomeList.innerHTML = revenue.map(item => `
                    <div class="bg-slate-50 p-4 rounded-2xl flex items-center justify-between hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100">
                        <div>
                            <p class="text-xs font-bold text-slate-800">${item.mo_ta}</p>
                            <p class="text-[10px] text-slate-400 font-medium">${new Date(item.thoi_gian_thanh_toan).toLocaleTimeString('vi-VN')} • ${item.phuong_thuc}</p>
                        </div>
                        <p class="font-black text-blue-600">${parseFloat(item.so_tien || 0).toLocaleString('vi-VN')}đ</p>
                    </div>
                `).join('');
            }
            
            // Render Expenses (Chi)
            if (expenses.length === 0) {
                expenseList.innerHTML = '<p class="text-center py-8 text-slate-400 italic text-xs">Không có khoản chi</p>';
            } else {
                expenseList.innerHTML = expenses.map(item => {
                    const time = item.thoi_gian_nhap ? new Date(item.thoi_gian_nhap).toLocaleTimeString('vi-VN') : 'N/A';
                    const nguon = item.nguon || 'Không xác định';
                    const phuongThuc = item.phuong_thuc_thanh_toan || 'N/A';
                    
                    return `
                        <div class="bg-slate-50 p-4 rounded-2xl flex items-center justify-between hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100">
                            <div class="flex-1">
                                <p class="text-xs font-bold text-slate-800">${item.mo_ta}</p>
                                <div class="flex items-center gap-2 mt-1">
                                    <span class="text-[10px] text-slate-400 font-medium">${time}</span>
                                    <span class="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">${nguon}</span>
                                    ${item.nguoi_nhan ? `<span class="text-[10px] text-slate-400">• ${item.nguoi_nhan}</span>` : ''}
                                </div>
                                ${item.loai_chi_phi ? `<span class="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold mt-1 inline-block">${item.loai_chi_phi}</span>` : ''}
                            </div>
                            <p class="font-black text-rose-600 ml-4">${parseFloat(item.so_tien || 0).toLocaleString('vi-VN')}đ</p>
                        </div>
                    `;
                }).join('');
            }
        }

        function updateModalSummary(summary) {
            document.getElementById('modal-total-thu').textContent = (summary.totalRevenue || 0).toLocaleString('vi-VN') + 'đ';
            document.getElementById('modal-total-chi').textContent = (summary.totalExpenses || 0).toLocaleString('vi-VN') + 'đ';
            document.getElementById('modal-net').textContent = (summary.netProfit || 0).toLocaleString('vi-VN') + 'đ';
            document.getElementById('modal-net').className = `text-2xl font-black ${summary.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`;
        }

        function closeModal() {
            const modal = document.getElementById('detail-modal');
            modal.classList.add('invisible', 'opacity-0');
        }
