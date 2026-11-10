/* ==== Script 1 (tách từ doanh-thu.html) ==== */
let revenueChart = null;

        document.addEventListener('DOMContentLoaded', () => {
            const today = new Date();
            document.getElementById('select-month').value = today.getMonth() + 1;
            document.getElementById('select-year').value = today.getFullYear();
            loadRevenueData();
        });

        async function loadRevenueData() {
            const month = document.getElementById('select-month').value;
            const year = document.getElementById('select-year').value;
            
            try {
                const res = await fetch(`${API_URL}/stats/revenue-summary?month=${month}&year=${year}`, { credentials: 'include' });
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
            document.getElementById('order-revenue').textContent = (summary.orderRevenue || 0).toLocaleString('vi-VN') + 'đ';
            document.getElementById('reservation-revenue').textContent = (summary.reservationRevenue || 0).toLocaleString('vi-VN') + 'đ';
        }

        function renderChart(data) {
            if (revenueChart) {
                revenueChart.destroy();
            }
            
            // Chuẩn bị dữ liệu
            const categories = data.map(d => {
                const date = new Date(d.date);
                return date.getDate() + '/' + (date.getMonth() + 1);
            });
            
            const revenueData = data.map(d => d.revenue);
            
            // Tính % thay đổi so với ngày trước
            const changes = revenueData.map((val, idx) => {
                if (idx === 0) return 0;
                const prev = revenueData[idx - 1];
                if (prev === 0) return 0;
                return ((val - prev) / prev * 100).toFixed(2);
            });
            
            // Cấu hình biểu đồ ApexCharts - Style TradingView
            const options = {
                series: [{
                    name: 'Doanh thu',
                    data: revenueData
                }],
                chart: {
                    height: 320,
                    type: 'area',
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
                        opacity: 0.15
                    }
                },
                colors: ['#3b82f6'],
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    curve: 'smooth',
                    width: 3
                },
                fill: {
                    type: 'gradient',
                    gradient: {
                        shade: 'light',
                        type: 'vertical',
                        shadeIntensity: 0.5,
                        gradientToColors: ['#93c5fd'],
                        inverseColors: false,
                        opacityFrom: 0.7,
                        opacityTo: 0.1,
                        stops: [0, 100]
                    }
                },
                markers: {
                    size: 5,
                    colors: ['#fff'],
                    strokeColors: '#3b82f6',
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
                tooltip: {
                    enabled: true,
                    shared: true,
                    intersect: false,
                    theme: 'dark',
                    style: {
                        fontSize: '13px',
                        fontFamily: "'Quicksand', 'Be Vietnam Pro', 'Plus Jakarta Sans', system-ui, sans-serif"
                    },
                    custom: function({series, seriesIndex, dataPointIndex, w}) {
                        const value = series[seriesIndex][dataPointIndex];
                        const change = changes[dataPointIndex];
                        const arrow = change > 0 ? '↑' : change < 0 ? '↓' : '→';
                        const color = change > 0 ? '#10b981' : change < 0 ? '#ef4444' : '#94a3b8';
                        const emoji = change > 0 ? '🟢' : change < 0 ? '🔴' : '⚪';
                        
                        return `
                            <div class="apexcharts-tooltip-custom" style="background: rgba(15, 23, 42, 0.95); padding: 16px; border-radius: 12px; border: 2px solid #3b82f6; box-shadow: 0 10px 25px rgba(0,0,0,0.3); min-width: 220px;">
                                <div style="font-weight: 700; font-size: 14px; color: #fff; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
                                    📅 Ngày ${categories[dataPointIndex]}
                                </div>
                                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                                    <span style="color: #cbd5e1; font-weight: 600; font-size: 13px;">Doanh thu:</span>
                                    <span style="color: #3b82f6; font-weight: 700; font-size: 16px;">${value.toLocaleString('vi-VN')} đ</span>
                                </div>
                                ${dataPointIndex > 0 ? `
                                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
                                    <div style="display: flex; align-items: center; justify-content: space-between;">
                                        <span style="color: #94a3b8; font-size: 12px; font-weight: 600;">So với hôm trước:</span>
                                        <span style="color: ${color}; font-weight: 700; font-size: 14px;">
                                            ${emoji} ${arrow} ${Math.abs(change)}%
                                        </span>
                                    </div>
                                </div>
                                ` : ''}
                            </div>
                        `;
                    }
                }
            };

            revenueChart = new ApexCharts(document.querySelector("#revenueChart"), options);
            revenueChart.render();
        }

        function renderTable(data) {
            const body = document.getElementById('daily-table-body');
            body.innerHTML = '';
            
            const filteredData = data.filter(day => day.revenue > 0);
            
            filteredData.forEach(day => {
                const row = document.createElement('tr');
                row.className = 'hover:bg-slate-50 transition-all cursor-pointer group';
                row.onclick = () => showDayDetail(day.date);

                row.innerHTML = `
                    <td class="px-6 py-4 text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">${new Date(day.date).toLocaleDateString('vi-VN')}</td>
                    <td class="px-6 py-4 text-right text-sm text-emerald-600 font-bold">${(day.orderRevenue || 0).toLocaleString('vi-VN')}đ</td>
                    <td class="px-6 py-4 text-right text-sm text-purple-600 font-bold">${(day.reservationRevenue || 0).toLocaleString('vi-VN')}đ</td>
                    <td class="px-6 py-4 text-right text-sm text-blue-600 font-black">${day.revenue.toLocaleString('vi-VN')}đ</td>
                `;
                body.appendChild(row);
            });
            
            if (filteredData.length === 0) {
                body.innerHTML = '<tr><td colspan="4" class="py-12 text-center text-slate-400 italic">Không có dữ liệu doanh thu trong tháng này</td></tr>';
            }
        }

        async function showDayDetail(date) {
            const modal = document.getElementById('detail-modal');
            const dateText = document.getElementById('modal-date');
            const orderList = document.getElementById('order-revenue-list');
            const reservationList = document.getElementById('reservation-revenue-list');
            
            dateText.textContent = 'Ngày ' + new Date(date).toLocaleDateString('vi-VN');
            orderList.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-slate-300"></i></div>';
            reservationList.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-slate-300"></i></div>';
            
            modal.classList.remove('invisible', 'opacity-0');
            
            try {
                const res = await fetch(`${API_URL}/stats/revenue-detail?date=${date}`, { credentials: 'include' });
                const result = await res.json();
                
                if (result.success) {
                    renderDetailLists(result.data.orders, result.data.reservations);
                    updateModalSummary(result.data.summary);
                } else {
                    orderList.innerHTML = '<p class="text-center py-8 text-red-400">Lỗi: ' + result.message + '</p>';
                    reservationList.innerHTML = '<p class="text-center py-8 text-red-400">Lỗi: ' + result.message + '</p>';
                }
            } catch (err) {
                console.error(err);
                orderList.innerHTML = '<p class="text-center py-8 text-red-400">Không thể kết nối máy chủ</p>';
                reservationList.innerHTML = '<p class="text-center py-8 text-red-400">Không thể kết nối máy chủ</p>';
            }
        }

        function renderDetailLists(orders, reservations) {
            const orderList = document.getElementById('order-revenue-list');
            const reservationList = document.getElementById('reservation-revenue-list');
            
            // Render Orders
            if (orders.length === 0) {
                orderList.innerHTML = '<p class="text-center py-8 text-slate-400 italic text-xs">Không có đơn hàng</p>';
            } else {
                orderList.innerHTML = orders.map(item => `
                    <div class="bg-slate-50 p-4 rounded-2xl flex items-center justify-between hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-100">
                        <div>
                            <p class="text-xs font-bold text-slate-800">${item.mo_ta}</p>
                            <p class="text-[10px] text-slate-400 font-medium">${new Date(item.thoi_gian_thanh_toan).toLocaleTimeString('vi-VN')} • ${item.phuong_thuc}</p>
                        </div>
                        <p class="font-black text-emerald-600">${parseFloat(item.so_tien || 0).toLocaleString('vi-VN')}đ</p>
                    </div>
                `).join('');
            }
            
            // Render Reservations
            if (reservations.length === 0) {
                reservationList.innerHTML = '<p class="text-center py-8 text-slate-400 italic text-xs">Không có đặt bàn</p>';
            } else {
                reservationList.innerHTML = reservations.map(item => `
                    <div class="bg-slate-50 p-4 rounded-2xl flex items-center justify-between hover:bg-purple-50 transition-colors border border-transparent hover:border-purple-100">
                        <div>
                            <p class="text-xs font-bold text-slate-800">${item.mo_ta}</p>
                            <p class="text-[10px] text-slate-400 font-medium">${new Date(item.thoi_gian_thanh_toan).toLocaleTimeString('vi-VN')} • ${item.phuong_thuc}</p>
                        </div>
                        <p class="font-black text-purple-600">${parseFloat(item.so_tien || 0).toLocaleString('vi-VN')}đ</p>
                    </div>
                `).join('');
            }
        }

        function updateModalSummary(summary) {
            document.getElementById('modal-order-revenue').textContent = (summary.orderRevenue || 0).toLocaleString('vi-VN') + 'đ';
            document.getElementById('modal-reservation-revenue').textContent = (summary.reservationRevenue || 0).toLocaleString('vi-VN') + 'đ';
            document.getElementById('modal-total-revenue').textContent = (summary.totalRevenue || 0).toLocaleString('vi-VN') + 'đ';
        }

        function closeModal() {
            const modal = document.getElementById('detail-modal');
            modal.classList.add('invisible', 'opacity-0');
        }
