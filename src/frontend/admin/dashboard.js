/* ==== Script 1 (tách từ dashboard.html) ==== */
// API_URL đã được khai báo trong admin-layout.js
         // Alias để tương thích
        let gaugeChart, revenueChart, ordersChart, customerChart, reservationChart, newsViewsChart, reviewStarChart, reviewStatusChart, paymentMethodsChart, dailyRevenueChart;
        let dailyRevenueData = []; // Lưu trữ dữ liệu doanh thu theo ngày
        
        document.addEventListener('DOMContentLoaded', function() {
            initAllCharts();
            loadDashboardData();
            initFilters();
            initDailyRevenueFilters();
            
            // Hiển thị filter summary ban đầu
            const initialFilters = getFilterValues();
            updateFilterSummary(initialFilters);
        });

        function initAllCharts() {
            // Gauge Chart - màu xanh lá cho tiến độ
            gaugeChart = new Chart(document.getElementById('gaugeChart').getContext('2d'), {
                type: 'doughnut',
                data: { datasets: [{ data: [0, 100], backgroundColor: ['#10b981', '#e2e8f0'], borderWidth: 0, circumference: 180, rotation: 270 }] },
                options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }
            });

            // Revenue Chart - gradient màu xanh dương
            revenueChart = new Chart(document.getElementById('revenueChart').getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
                    datasets: [
                        { label: 'Doanh thu', data: new Array(12).fill(0), backgroundColor: '#3b82f6', borderRadius: 6, barPercentage: 0.6 }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { callback: v => v + 'tr' } } } }
            });

            // Daily Revenue Chart - Biểu đồ doanh thu theo ngày (giống thị trường chứng khoán)
            const dailyCtx = document.getElementById('dailyRevenueChart').getContext('2d');
            const dailyGradient = dailyCtx.createLinearGradient(0, 0, 0, 300);
            dailyGradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
            dailyGradient.addColorStop(1, 'rgba(16, 185, 129, 0.02)');
            
            dailyRevenueChart = new Chart(dailyCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Doanh thu',
                        data: [],
                        borderColor: '#10b981',
                        backgroundColor: dailyGradient,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.1,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: '#10b981',
                        pointHoverBorderColor: '#fff',
                        pointHoverBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(30, 58, 95, 0.95)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            padding: 12,
                            displayColors: false,
                            callbacks: {
                                title: function(context) {
                                    return context[0].label;
                                },
                                label: function(context) {
                                    return 'Doanh thu: ' + formatCurrency(context.parsed.y) + 'đ';
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: {
                                maxTicksLimit: 10,
                                font: { size: 10 },
                                color: '#94a3b8'
                            }
                        },
                        y: {
                            beginAtZero: true,
                            grid: { color: '#f1f5f9' },
                            ticks: {
                                callback: v => formatCompactNumber(v),
                                font: { size: 10 },
                                color: '#94a3b8'
                            }
                        }
                    }
                }
            });

            // Orders Chart - màu sắc phân biệt rõ ràng
            ordersChart = new Chart(document.getElementById('ordersChart').getContext('2d'), {
                type: 'doughnut',
                data: { labels: ['Hoàn thành', 'Đang xử lý', 'Chờ xác nhận', 'Đã hủy'], datasets: [{ data: [65, 20, 10, 5], backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'], borderWidth: 3, borderColor: '#fff' }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10, font: { size: 11 } } } } }
            });

            // Customer Chart - màu tím
            customerChart = new Chart(document.getElementById('customerChart').getContext('2d'), {
                type: 'line',
                data: { labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'], datasets: [{ label: 'Khách mới', data: new Array(12).fill(0), borderColor: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.1)', borderWidth: 3, fill: true, tension: 0.4, pointRadius: 5, pointBackgroundColor: '#8b5cf6', pointBorderColor: '#fff', pointBorderWidth: 2 }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: '#f1f5f9' } } } }
            });

            // Reservation Chart - màu cam
            reservationChart = new Chart(document.getElementById('reservationChart').getContext('2d'), {
                type: 'bar',
                data: { labels: ['10-12h', '12-14h', '14-16h', '16-18h', '18-20h', '20-22h'], datasets: [{ label: 'Số lượt đặt', data: new Array(6).fill(0), backgroundColor: '#f59e0b', borderRadius: 8 }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: '#f1f5f9' } } } }
            });

            // News Views Chart - màu hồng
            newsViewsChart = new Chart(document.getElementById('newsViewsChart').getContext('2d'), {
                type: 'line',
                data: { 
                    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'], 
                    datasets: [{ 
                        label: 'Lượt xem', 
                        data: new Array(12).fill(0), 
                        borderColor: '#ec4899', 
                        backgroundColor: 'rgba(236, 72, 153, 0.1)', 
                        borderWidth: 3, 
                        fill: true, 
                        tension: 0.4, 
                        pointRadius: 5, 
                        pointBackgroundColor: '#ec4899', 
                        pointBorderColor: '#fff', 
                        pointBorderWidth: 2 
                    }] 
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: '#f1f5f9' } } } }
            });

            // Review Star Distribution Chart - gradient vàng đến đỏ
            reviewStarChart = new Chart(document.getElementById('reviewStarChart').getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['5 sao', '4 sao', '3 sao', '2 sao', '1 sao'],
                    datasets: [{
                        label: 'Số lượng',
                        data: [0, 0, 0, 0, 0],
                        backgroundColor: ['#fbbf24', '#f59e0b', '#fb923c', '#f97316', '#ef4444'],
                        borderRadius: 6,
                        barPercentage: 0.7
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { beginAtZero: true, grid: { display: false } },
                        y: { grid: { display: false } }
                    }
                }
            });

            // Review Status Chart - xanh lá, vàng, đỏ
            reviewStatusChart = new Chart(document.getElementById('reviewStatusChart').getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Đã duyệt', 'Chờ duyệt', 'Đã khóa'],
                    datasets: [{
                        data: [0, 0, 0],
                        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                        borderWidth: 3,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '60%',
                    plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10, font: { size: 11 } } }
                    }
                }
            });

            // Payment Methods Chart - xanh lá, hồng MoMo, xanh dương
            paymentMethodsChart = new Chart(document.getElementById('paymentMethodsChart').getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Tiền mặt', 'MoMo', 'Chuyển khoản'],
                    datasets: [{
                        data: [0, 0, 0],
                        backgroundColor: ['#10b981', '#d63384', '#3b82f6'],
                        borderWidth: 3,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '60%',
                    plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10, font: { size: 11 } } },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                    return `${label}: ${value} đơn (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }

        async function loadDashboardData() {
            try {
                // Lấy filter hiện tại (mặc định năm 2026)
                const filters = getFilterValues();
                const yearParam = `?year=${filters.year || 2026}`;
                
                // Load tất cả dữ liệu song song với filter năm
                const [ordersRes, customersRes, reservationsRes, revenueMonthlyRes, customersMonthlyRes, reservationsByTimeRes, newsViewsRes, newsViewsMonthlyRes, reviewsRes] = await Promise.all([
                    fetch(`${API_URL}/orders/stats${yearParam}`, { credentials: 'include' }).catch(() => null),
                    fetch(`${API_URL}/customers/stats`, { credentials: 'include' }).catch(() => null),
                    fetch(`${API_URL}/reservations/stats`, { credentials: 'include' }).catch(() => null),
                    fetch(`${API_URL}/stats/revenue-monthly${yearParam}`, { credentials: 'include' }).catch(() => null),
                    fetch(`${API_URL}/stats/customers-monthly${yearParam}`, { credentials: 'include' }).catch(() => null),
                    fetch(`${API_URL}/stats/reservations-by-time${yearParam}`, { credentials: 'include' }).catch(() => null),
                    fetch(`${API_URL}/stats/news-views`, { credentials: 'include' }).catch(() => null),
                    fetch(`${API_URL}/stats/news-views-monthly${yearParam}`, { credentials: 'include' }).catch(() => null),
                    fetch(`${API_URL}/reviews/admin/all`, { credentials: 'include' }).catch(() => null)
                ]);

                // KPI Cards
                if (ordersRes && ordersRes.ok) {
                    const data = await ordersRes.json();
                    if (data.success !== false) {
                        document.getElementById('total-revenue').textContent = formatCurrency(data.totalRevenue || 0) + 'đ';
                        document.getElementById('total-orders').textContent = data.totalOrders || 0;
                        // Gauge chart sẽ được cập nhật bởi loadGoals, không cập nhật ở đây
                        updateOrdersChart(data.byStatus || []);
                        
                        // Cập nhật so sánh với tháng trước từ dữ liệu thật
                        if (data.comparison) {
                            updateComparisonDisplay('revenue-compare', data.comparison.revenueChange);
                            updateComparisonDisplay('orders-compare', data.comparison.ordersChange);
                        }
                    }
                }

                if (customersRes && customersRes.ok) {
                    const data = await customersRes.json();
                    if (data.success !== false) {
                        document.getElementById('total-customers').textContent = data.totalCustomers || 0;
                        if (data.comparison) {
                            updateComparisonDisplay('customers-compare', data.comparison.customersChange);
                        }
                    }
                }

                if (reservationsRes && reservationsRes.ok) {
                    const data = await reservationsRes.json();
                    if (data.success !== false) {
                        document.getElementById('total-reservations').textContent = data.totalReservations || 0;
                        if (data.comparison) {
                            updateComparisonDisplay('reservations-compare', data.comparison.reservationsChange);
                        }
                    }
                }

                // Load customers và reservations stats riêng (không filter được vì là tổng số)
                await loadCustomersAndReservationsStats();

                // Biểu đồ doanh thu theo tháng
                if (revenueMonthlyRes && revenueMonthlyRes.ok) {
                    const data = await revenueMonthlyRes.json();
                    if (data.success && data.data) {
                        updateRevenueChart(data.data);
                    }
                }

                // Biểu đồ khách hàng mới theo tháng
                if (customersMonthlyRes && customersMonthlyRes.ok) {
                    const data = await customersMonthlyRes.json();
                    if (data.success && data.data) {
                        updateCustomerChart(data.data);
                    }
                }

                // Biểu đồ đặt bàn theo khung giờ
                if (reservationsByTimeRes && reservationsByTimeRes.ok) {
                    const data = await reservationsByTimeRes.json();
                    if (data.success && data.data) {
                        updateReservationChart(data.data);
                    }
                }

                // Top bài viết và tổng lượt xem
                if (newsViewsRes && newsViewsRes.ok) {
                    const data = await newsViewsRes.json();
                    if (data.success) {
                        document.getElementById('total-news').textContent = data.totalNews || 0;
                        document.getElementById('total-views').textContent = formatNumber(data.totalViews || 0);
                        renderTopNews(data.data || []);
                    }
                }

                // Biểu đồ lượt xem tin tức theo tháng
                if (newsViewsMonthlyRes && newsViewsMonthlyRes.ok) {
                    const data = await newsViewsMonthlyRes.json();
                    if (data.success && data.data) {
                        updateNewsViewsChart(data.data);
                    }
                }

                // Thống kê đánh giá
                if (reviewsRes && reviewsRes.ok) {
                    const data = await reviewsRes.json();
                    if (data.success) {
                        updateReviewCharts(data.stats, data.topProducts);
                    }
                }

                // Load payment methods stats với filter năm
                const paymentMethodsRes2 = await fetch(`${API_URL}/stats/payment-methods${yearParam}`, { credentials: 'include' }).catch(() => null);
                if (paymentMethodsRes2 && paymentMethodsRes2.ok) {
                    const data = await paymentMethodsRes2.json();
                    if (data.success && data.data) {
                        updatePaymentMethodsChart(data.data);
                    }
                }

                // Load top products và recent orders
                await renderTopProducts();
                await renderRecentOrders();
            } catch (error) {
                console.error('Error loading dashboard:', error);
                await renderTopProducts();
                await renderRecentOrders();
            }
        }

        function updateRevenueChart(data) {
            // Tạo mảng 12 tháng với giá trị 0
            const monthlyData = new Array(12).fill(0);
            // Lấy năm từ filter hiện tại, mặc định 2026 (năm có dữ liệu)
            const filters = getFilterValues();
            const targetYear = parseInt(filters.year) || 2026;
            
            data.forEach(item => {
                const itemYear = parseInt(item.nam);
                const itemMonth = parseInt(item.thang);
                if (itemYear === targetYear && itemMonth >= 1 && itemMonth <= 12) {
                    monthlyData[itemMonth - 1] = Math.round((parseFloat(item.doanh_thu) || 0) / 1000000); // Chuyển sang triệu
                }
            });

            revenueChart.data.datasets[0].data = monthlyData;
            revenueChart.update();
        }

        function updateCustomerChart(data) {
            const monthlyData = new Array(12).fill(0);
            // Lấy năm từ filter hiện tại, mặc định 2026 (năm có dữ liệu)
            const filters = getFilterValues();
            const targetYear = parseInt(filters.year) || 2026;
            
            data.forEach(item => {
                const itemYear = parseInt(item.nam);
                const itemMonth = parseInt(item.thang);
                if (itemYear === targetYear && itemMonth >= 1 && itemMonth <= 12) {
                    monthlyData[itemMonth - 1] = parseInt(item.so_luong) || 0;
                }
            });

            customerChart.data.datasets[0].data = monthlyData;
            customerChart.update();
        }

        function updateReservationChart(data) {
            const timeSlots = ['10-12h', '12-14h', '14-16h', '16-18h', '18-20h', '20-22h'];
            const slotData = timeSlots.map(slot => {
                const found = data.find(d => d.khung_gio === slot);
                return found ? found.so_luong : 0;
            });

            reservationChart.data.datasets[0].data = slotData;
            reservationChart.update();
        }

        function updateNewsViewsChart(data) {
            const monthlyData = new Array(12).fill(0);
            // Lấy năm từ filter hiện tại, mặc định 2026 (năm có dữ liệu)
            const filters = getFilterValues();
            const targetYear = filters.year || 2026;
            
            data.forEach(item => {
                if (item.nam === targetYear && item.thang >= 1 && item.thang <= 12) {
                    monthlyData[item.thang - 1] = item.tong_luot_xem || 0;
                }
            });

            newsViewsChart.data.datasets[0].data = monthlyData;
            newsViewsChart.update();
        }

        function updateReviewCharts(stats, topProducts) {
            // Update star distribution chart
            if (stats && stats.starDistribution && reviewStarChart) {
                const dist = stats.starDistribution;
                reviewStarChart.data.datasets[0].data = [dist[5] || 0, dist[4] || 0, dist[3] || 0, dist[2] || 0, dist[1] || 0];
                reviewStarChart.update();
            }

            // Update average rating
            const avgRating = parseFloat(stats?.average_rating || 0).toFixed(1);
            document.getElementById('avg-rating').innerHTML = `${avgRating} <i class="fas fa-star text-lg"></i>`;

            // Update status chart
            if (stats && reviewStatusChart) {
                reviewStatusChart.data.datasets[0].data = [stats.approved || 0, stats.pending || 0, stats.rejected || 0];
                reviewStatusChart.update();
            }

            // Render top reviewed products
            renderTopReviewedProducts(topProducts);
        }

        function renderTopReviewedProducts(products) {
            const container = document.getElementById('top-reviewed-products');
            if (!products || products.length === 0) {
                container.innerHTML = '<p class="text-center text-gray-500 py-4">Chưa có dữ liệu</p>';
                return;
            }

            const maxCount = Math.max(...products.map(p => p.review_count || 0));
            container.innerHTML = products.map((p, i) => {
                const avgRating = parseFloat(p.avg_rating || 0).toFixed(1);
                return `
                    <div class="product-row">
                        <span class="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 text-white text-xs font-bold flex items-center justify-center mr-3">${i + 1}</span>
                        <div class="flex-1">
                            <p class="text-sm font-medium text-gray-800 truncate" title="${p.ten_mon}">${p.ten_mon}</p>
                            <div class="flex items-center gap-2 mt-1">
                                <div class="flex-1 bg-slate-100 rounded-full h-2">
                                    <div class="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full" style="width: ${maxCount > 0 ? (p.review_count/maxCount)*100 : 0}%"></div>
                                </div>
                                <span class="text-xs text-yellow-600"><i class="fas fa-star"></i> ${avgRating}</span>
                            </div>
                        </div>
                        <span class="text-sm font-semibold text-orange-600 ml-2">${p.review_count}</span>
                    </div>
                `;
            }).join('');
        }

        function renderTopNews(newsData) {
            const container = document.getElementById('top-news');
            if (!newsData || newsData.length === 0) {
                container.innerHTML = '<p class="text-center text-gray-500 py-4">Chưa có bài viết</p>';
                return;
            }
            const maxViews = Math.max(...newsData.map(n => n.luot_xem || 0));
            container.innerHTML = newsData.map((news, i) => `
                <div class="product-row">
                    <span class="w-7 h-7 rounded-full bg-slate-600 text-white text-xs font-bold flex items-center justify-center mr-3">${i + 1}</span>
                    <div class="flex-1">
                        <p class="text-sm font-medium text-gray-800 truncate" title="${news.tieu_de}">${news.tieu_de}</p>
                        <div class="w-full bg-slate-100 rounded-full h-2 mt-1">
                            <div class="bg-slate-600 h-2 rounded-full transition-all" style="width: ${maxViews > 0 ? (news.luot_xem/maxViews)*100 : 0}%"></div>
                        </div>
                    </div>
                    <span class="text-sm font-semibold text-slate-700 ml-3">${formatNumber(news.luot_xem || 0)}</span>
                </div>
            `).join('');
        }

        function formatNumber(num) {
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
            return num.toString();
        }

        function updateGaugeChart(actual, target) {
            const percentage = Math.min(100, Math.round((actual / target) * 100));
            gaugeChart.data.datasets[0].data = [percentage, 100 - percentage];
            gaugeChart.update();
            document.getElementById('gauge-value').textContent = percentage + '%';
        }

        function updateOrdersChart(statusData) {
            const statusMap = { delivered: 0, preparing: 0, confirmed: 0, pending: 0, cancelled: 0 };
            statusData.forEach(s => { statusMap[s.trang_thai] = s.count; });
            ordersChart.data.datasets[0].data = [statusMap.delivered, statusMap.preparing + statusMap.confirmed, statusMap.pending, statusMap.cancelled];
            ordersChart.update();
        }

        async function renderTopProducts() {
            const container = document.getElementById('top-products');
            try {
                // Lấy filter hiện tại
                const filters = getFilterValues();
                const yearParam = `?year=${filters.year || 2026}`;
                const response = await fetch(`${API_URL}/stats/top-products${yearParam}`, { credentials: 'include' });
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data && data.data.length > 0) {
                        const products = data.data;
                        const maxSold = Math.max(...products.map(p => p.da_ban || 0));
                        container.innerHTML = products.map((p, i) => `
                            <div class="product-row">
                                <span class="w-7 h-7 rounded-full bg-slate-600 text-white text-xs font-bold flex items-center justify-center mr-3">${i + 1}</span>
                                <div class="flex-1">
                                    <p class="text-sm font-medium text-gray-800 truncate">${p.ten_mon}</p>
                                    <div class="w-full bg-slate-100 rounded-full h-2 mt-1">
                                        <div class="bg-slate-600 h-2 rounded-full transition-all" style="width: ${maxSold > 0 ? (p.da_ban/maxSold)*100 : 0}%"></div>
                                    </div>
                                </div>
                                <span class="text-sm font-semibold text-slate-700 ml-3">${p.da_ban || 0}</span>
                            </div>
                        `).join('');
                        return;
                    }
                }
            } catch (error) {
                console.error('Error loading top products:', error);
            }
            container.innerHTML = '<p class="text-center text-gray-500 py-4">Chưa có dữ liệu</p>';
        }

        async function renderRecentOrders() {
            const container = document.getElementById('recent-orders');
            const statusColors = { delivered: 'bg-emerald-100 text-emerald-700', confirmed: 'bg-blue-100 text-blue-700', preparing: 'bg-blue-100 text-blue-700', pending: 'bg-amber-100 text-amber-700', cancelled: 'bg-red-100 text-red-700' };
            const statusText = { delivered: 'Hoàn thành', confirmed: 'Đã xác nhận', preparing: 'Đang chuẩn bị', pending: 'Chờ xác nhận', cancelled: 'Đã hủy' };
            
            try {
                const response = await fetch(`${API_URL}/orders/all?limit=5`, { credentials: 'include' });
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data && data.data.length > 0) {
                        container.innerHTML = data.data.map(o => `
                            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                                <div class="flex-1">
                                    <p class="text-sm font-semibold text-gray-800">#DH${String(o.ma_don_hang).padStart(6, '0')} - ${o.ten_khach_hang || o.ten_khach_vang_lai || 'Khách hàng'}</p>
                                    <p class="text-xs text-gray-500 mt-0.5">${formatTimeAgo(o.thoi_gian_tao)}</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-sm font-bold text-blue-600">${formatCurrency(o.tong_tien || 0)}đ</p>
                                    <span class="text-xs px-2 py-1 rounded-full ${statusColors[o.trang_thai] || 'bg-gray-100 text-gray-700'} font-medium">${statusText[o.trang_thai] || o.trang_thai}</span>
                                </div>
                            </div>
                        `).join('');
                        return;
                    }
                }
            } catch (error) {
                console.error('Error loading recent orders:', error);
            }
            container.innerHTML = '<p class="text-center text-gray-500 py-4">Chưa có đơn hàng</p>';
        }

        function formatTimeAgo(dateStr) {
            const date = new Date(dateStr);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);
            
            if (diffMins < 1) return 'Vừa xong';
            if (diffMins < 60) return `${diffMins} phút trước`;
            if (diffHours < 24) return `${diffHours} giờ trước`;
            if (diffDays < 7) return `${diffDays} ngày trước`;
            return date.toLocaleDateString('vi-VN');
        }

        function formatCurrency(value) { return new Intl.NumberFormat('vi-VN').format(value); }

        async function loadCustomersAndReservationsStats(filterYear = null, filterMonth = null) {
            try {
                // Build query params
                const params = new URLSearchParams();
                if (filterYear) params.append('year', filterYear);
                if (filterMonth && filterMonth > 0) params.append('month', filterMonth);
                const queryString = params.toString() ? `?${params.toString()}` : '';

                const [customersRes, reservationsRes] = await Promise.all([
                    fetch(`${API_URL}/customers/stats${queryString}`, { credentials: 'include' }).catch(() => null),
                    fetch(`${API_URL}/reservations/stats${queryString}`, { credentials: 'include' }).catch(() => null)
                ]);

                if (customersRes && customersRes.ok) {
                    const data = await customersRes.json();
                    if (data.success !== false) {
                        document.getElementById('total-customers').textContent = data.totalCustomers || 0;
                        if (data.comparison) {
                            const label = data.comparison.label || 'So với tháng trước';
                            updateComparisonDisplay('customers-compare', data.comparison.customersChange, label);
                        }
                    }
                }

                if (reservationsRes && reservationsRes.ok) {
                    const data = await reservationsRes.json();
                    if (data.success !== false) {
                        document.getElementById('total-reservations').textContent = data.totalReservations || 0;
                        if (data.comparison) {
                            const label = data.comparison.label || 'So với tháng trước';
                            updateComparisonDisplay('reservations-compare', data.comparison.reservationsChange, label);
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading customers/reservations stats:', error);
            }
        }

        // Hàm cập nhật hiển thị so sánh với tháng trước
        function updateComparisonDisplay(elementId, changePercent, label = 'So với tháng trước') {
            const element = document.getElementById(elementId);
            if (!element) return;
            
            const isPositive = changePercent >= 0;
            const icon = isPositive ? 'fa-arrow-up' : 'fa-arrow-down';
            const colorClass = isPositive ? 'up' : 'down';
            const displayValue = Math.abs(changePercent).toFixed(1);
            
            element.innerHTML = `${label}: <span class="${colorClass}"><i class="fas ${icon}"></i> ${displayValue}%</span>`;
        }

        // Lấy giá trị filter hiện tại
        function getFilterValues() {
            const yearBtn = document.querySelector('.filter-btn[data-year].active');
            const monthBtn = document.querySelector('.filter-btn[data-month].active');
            const statusBtn = document.querySelector('.filter-btn[data-status].active');
            
            return {
                year: yearBtn ? parseInt(yearBtn.dataset.year) : new Date().getFullYear(),
                month: monthBtn ? parseInt(monthBtn.dataset.month) : 0, // 0 = All
                status: statusBtn ? statusBtn.dataset.status : 'all'
            };
        }

        function initFilters() {
            document.querySelectorAll('.filter-group').forEach(group => {
                group.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        // Không cho click lại nút đang active
                        if (this.classList.contains('active')) return;
                        
                        group.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                        this.classList.add('active');
                        
                        // Hiển thị loading state
                        showFilterLoading();
                        
                        // Lấy filter values và load lại data
                        const filters = getFilterValues();
                        console.log('Filters changed:', filters);
                        loadDashboardDataWithFilters(filters).finally(() => {
                            hideFilterLoading();
                            updateFilterSummary(filters);
                        });
                    });
                });
            });
        }

        function showFilterLoading() {
            // Thêm overlay loading nhẹ
            const mainContent = document.querySelector('main');
            if (mainContent && !document.getElementById('filter-loading-overlay')) {
                const overlay = document.createElement('div');
                overlay.id = 'filter-loading-overlay';
                overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.7); z-index: 40; display: flex; align-items: center; justify-content: center;';
                overlay.innerHTML = '<div style="background: white; padding: 20px 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"><i class="fas fa-spinner fa-spin text-3xl text-blue-600 mb-2"></i><p class="text-sm text-slate-600 mt-2">Đang tải dữ liệu...</p></div>';
                document.body.appendChild(overlay);
            }
        }

        function hideFilterLoading() {
            const overlay = document.getElementById('filter-loading-overlay');
            if (overlay) {
                overlay.remove();
            }
        }

        function resetFilters() {
            // Reset về mặc định: năm hiện tại, tháng hiện tại, trạng thái All
            const now = new Date();
            const defaultYear = now.getFullYear();
            const defaultMonth = now.getMonth() + 1; // Tháng hiện tại (1-12)
            
            // Reset year
            document.querySelectorAll('.filter-btn[data-year]').forEach(btn => {
                btn.classList.remove('active');
                if (parseInt(btn.dataset.year) === defaultYear) {
                    btn.classList.add('active');
                }
            });
            
            // Reset month to current month
            document.querySelectorAll('.filter-btn[data-month]').forEach(btn => {
                btn.classList.remove('active');
                if (parseInt(btn.dataset.month) === defaultMonth) {
                    btn.classList.add('active');
                }
            });
            
            // Reset status to All
            document.querySelectorAll('.filter-btn[data-status]').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.status === 'all') {
                    btn.classList.add('active');
                }
            });
            
            // Reload data
            showFilterLoading();
            const filters = getFilterValues();
            loadDashboardDataWithFilters(filters).finally(() => {
                hideFilterLoading();
                updateFilterSummary(filters);
            });
        }

        function updateFilterSummary(filters) {
            const summaryText = document.getElementById('filter-summary-text');
            if (!summaryText) return;
            
            let text = '';
            
            if (filters.month > 0) {
                text = `Tháng ${filters.month}/${filters.year}`;
            } else {
                text = `Tất cả dữ liệu năm ${filters.year}`;
            }
            
            if (filters.status && filters.status !== 'all') {
                const statusNames = {
                    pending: 'Chờ xử lý',
                    confirmed: 'Đã xác nhận',
                    delivered: 'Hoàn thành',
                    cancelled: 'Đã hủy'
                };
                text += ` - ${statusNames[filters.status] || filters.status}`;
            }
            
            summaryText.textContent = text;
        }

        async function loadDashboardDataWithFilters(filters) {
            try {
                // Build query params
                const params = new URLSearchParams();
                if (filters.year) params.append('year', filters.year);
                if (filters.month && filters.month > 0) params.append('month', filters.month);
                if (filters.status && filters.status !== 'all') params.append('status', filters.status);
                
                const queryString = params.toString() ? `?${params.toString()}` : '';

                // Load TẤT CẢ dữ liệu với filter
                const [ordersRes, revenueMonthlyRes, customersMonthlyRes, reservationsByTimeRes, newsViewsMonthlyRes, topProductsRes, paymentMethodsRes] = await Promise.all([
                    fetch(`${API_URL}/orders/stats${queryString}`, { credentials: 'include' }).catch(() => null),
                    fetch(`${API_URL}/stats/revenue-monthly${queryString}`, { credentials: 'include' }).catch(() => null),
                    fetch(`${API_URL}/stats/customers-monthly${queryString}`, { credentials: 'include' }).catch(() => null),
                    fetch(`${API_URL}/stats/reservations-by-time${queryString}`, { credentials: 'include' }).catch(() => null),
                    fetch(`${API_URL}/stats/news-views-monthly${queryString}`, { credentials: 'include' }).catch(() => null),
                    fetch(`${API_URL}/stats/top-products${queryString}`, { credentials: 'include' }).catch(() => null),
                    fetch(`${API_URL}/stats/payment-methods${queryString}`, { credentials: 'include' }).catch(() => null)
                ]);

                // Cập nhật KPI Cards
                if (ordersRes && ordersRes.ok) {
                    const data = await ordersRes.json();
                    if (data.success !== false) {
                        document.getElementById('total-revenue').textContent = formatCurrency(data.totalRevenue || 0) + 'đ';
                        document.getElementById('total-orders').textContent = data.totalOrders || 0;
                        // Gauge chart sẽ được cập nhật bởi loadGoals ở cuối hàm
                        updateOrdersChart(data.byStatus || []);
                        
                        // Cập nhật so sánh với label đúng
                        if (data.comparison) {
                            const label = data.comparison.label || 'So với tháng trước';
                            updateComparisonDisplay('revenue-compare', data.comparison.revenueChange, label);
                            updateComparisonDisplay('orders-compare', data.comparison.ordersChange, label);
                        }
                    }
                }

                // Cập nhật biểu đồ doanh thu
                if (revenueMonthlyRes && revenueMonthlyRes.ok) {
                    const data = await revenueMonthlyRes.json();
                    if (data.success && data.data) {
                        updateRevenueChartWithYear(data.data, filters.year, filters.month);
                    }
                }

                // Cập nhật biểu đồ khách hàng mới
                if (customersMonthlyRes && customersMonthlyRes.ok) {
                    const data = await customersMonthlyRes.json();
                    if (data.success && data.data) {
                        updateCustomerChartWithYear(data.data, filters.year, filters.month);
                    }
                }

                // Cập nhật biểu đồ đặt bàn theo giờ
                if (reservationsByTimeRes && reservationsByTimeRes.ok) {
                    const data = await reservationsByTimeRes.json();
                    if (data.success && data.data) {
                        updateReservationChart(data.data);
                    }
                }

                // Cập nhật biểu đồ lượt xem tin tức
                if (newsViewsMonthlyRes && newsViewsMonthlyRes.ok) {
                    const data = await newsViewsMonthlyRes.json();
                    if (data.success && data.data) {
                        updateNewsViewsChartWithYear(data.data, filters.year, filters.month);
                    }
                }

                // Cập nhật top products
                if (topProductsRes && topProductsRes.ok) {
                    const data = await topProductsRes.json();
                    if (data.success && data.data) {
                        renderTopProductsFiltered(data.data);
                    }
                }

                // Cập nhật biểu đồ phương thức thanh toán
                if (paymentMethodsRes && paymentMethodsRes.ok) {
                    const data = await paymentMethodsRes.json();
                    if (data.success && data.data) {
                        updatePaymentMethodsChart(data.data);
                    }
                }

                // Load lại recent orders với filter status
                await renderRecentOrdersWithFilter(filters.status);

                // Load lại thống kê khách hàng và đặt bàn với filter
                await loadCustomersAndReservationsStats(filters.year, filters.month);

                // Load lại mục tiêu theo tháng/năm được chọn
                if (filters.month > 0) {
                    await loadGoals(filters.month, filters.year);
                } else {
                    // Nếu chọn "All" tháng, load mục tiêu tháng hiện tại
                    const now = new Date();
                    await loadGoals(now.getMonth() + 1, filters.year);
                }

            } catch (error) {
                console.error('Error loading filtered data:', error);
            }
        }

        function updateRevenueChartWithYear(data, year, month = 0) {
            const filters = getFilterValues();
            const selectedMonth = month || filters.month || 0;
            const monthlyData = new Array(12).fill(0);
            const targetYear = parseInt(year) || new Date().getFullYear();
            
            console.log('Revenue data:', data);
            console.log('Target year:', targetYear, 'Selected month:', selectedMonth);
            
            data.forEach(item => {
                const itemYear = parseInt(item.nam);
                const itemMonth = parseInt(item.thang);
                if (itemYear === targetYear && itemMonth >= 1 && itemMonth <= 12) {
                    monthlyData[itemMonth - 1] = Math.round((parseFloat(item.doanh_thu) || 0) / 1000000);
                }
            });
            
            console.log('Monthly data for chart:', monthlyData);

            // Nếu chọn tháng cụ thể, highlight tháng đó
            if (selectedMonth > 0) {
                const backgroundColors = monthlyData.map((_, i) => 
                    i === selectedMonth - 1 ? '#3b82f6' : '#cbd5e1'
                );
                revenueChart.data.datasets[0].backgroundColor = backgroundColors;
            } else {
                revenueChart.data.datasets[0].backgroundColor = '#3b82f6';
            }

            revenueChart.data.datasets[0].data = monthlyData;
            revenueChart.update();
        }

        function updateCustomerChartWithYear(data, year, month = 0) {
            const filters = getFilterValues();
            const selectedMonth = month || filters.month || 0;
            const monthlyData = new Array(12).fill(0);
            const targetYear = parseInt(year) || new Date().getFullYear();
            
            data.forEach(item => {
                const itemYear = parseInt(item.nam);
                const itemMonth = parseInt(item.thang);
                if (itemYear === targetYear && itemMonth >= 1 && itemMonth <= 12) {
                    monthlyData[itemMonth - 1] = parseInt(item.so_luong) || 0;
                }
            });

            // Nếu chọn tháng cụ thể, highlight điểm đó
            if (selectedMonth > 0) {
                const pointRadius = monthlyData.map((_, i) => 
                    i === selectedMonth - 1 ? 8 : 3
                );
                const pointBackgroundColor = monthlyData.map((_, i) => 
                    i === selectedMonth - 1 ? '#8b5cf6' : '#c4b5fd'
                );
                customerChart.data.datasets[0].pointRadius = pointRadius;
                customerChart.data.datasets[0].pointBackgroundColor = pointBackgroundColor;
            } else {
                customerChart.data.datasets[0].pointRadius = 5;
                customerChart.data.datasets[0].pointBackgroundColor = '#8b5cf6';
            }

            customerChart.data.datasets[0].data = monthlyData;
            customerChart.update();
        }

        function updateNewsViewsChartWithYear(data, year, month = 0) {
            const filters = getFilterValues();
            const selectedMonth = month || filters.month || 0;
            const monthlyData = new Array(12).fill(0);
            const targetYear = parseInt(year) || new Date().getFullYear();
            
            data.forEach(item => {
                const itemYear = parseInt(item.nam);
                const itemMonth = parseInt(item.thang);
                if (itemYear === targetYear && itemMonth >= 1 && itemMonth <= 12) {
                    monthlyData[itemMonth - 1] = parseInt(item.tong_luot_xem) || 0;
                }
            });

            // Nếu chọn tháng cụ thể, highlight điểm đó
            if (selectedMonth > 0) {
                const pointRadius = monthlyData.map((_, i) => 
                    i === selectedMonth - 1 ? 8 : 3
                );
                const pointBackgroundColor = monthlyData.map((_, i) => 
                    i === selectedMonth - 1 ? '#ec4899' : '#f9a8d4'
                );
                newsViewsChart.data.datasets[0].pointRadius = pointRadius;
                newsViewsChart.data.datasets[0].pointBackgroundColor = pointBackgroundColor;
            } else {
                newsViewsChart.data.datasets[0].pointRadius = 5;
                newsViewsChart.data.datasets[0].pointBackgroundColor = '#ec4899';
            }

            newsViewsChart.data.datasets[0].data = monthlyData;
            newsViewsChart.update();
        }

        function renderTopProductsFiltered(products) {
            const container = document.getElementById('top-products');
            if (!products || products.length === 0) {
                container.innerHTML = '<p class="text-center text-gray-500 py-4">Chưa có dữ liệu</p>';
                return;
            }

            const maxSold = Math.max(...products.map(p => p.da_ban || 0));
            container.innerHTML = products.map((p, i) => `
                <div class="product-row">
                    <span class="w-7 h-7 rounded-full bg-slate-600 text-white text-xs font-bold flex items-center justify-center mr-3">${i + 1}</span>
                    <div class="flex-1">
                        <p class="text-sm font-medium text-gray-800 truncate">${p.ten_mon}</p>
                        <div class="w-full bg-slate-100 rounded-full h-2 mt-1">
                            <div class="bg-slate-600 h-2 rounded-full transition-all" style="width: ${maxSold > 0 ? (p.da_ban/maxSold)*100 : 0}%"></div>
                        </div>
                    </div>
                    <span class="text-sm font-semibold text-slate-700 ml-3">${p.da_ban || 0}</span>
                </div>
            `).join('');
        }

        function updatePaymentMethodsChart(data) {
            if (!paymentMethodsChart || !data || data.length === 0) {
                // Nếu không có dữ liệu, hiển thị chart rỗng
                paymentMethodsChart.data.labels = ['Chưa có dữ liệu'];
                paymentMethodsChart.data.datasets[0].data = [1];
                paymentMethodsChart.data.datasets[0].backgroundColor = ['#e2e8f0'];
                paymentMethodsChart.update();
                return;
            }

            // Map tên phương thức thanh toán (theo dữ liệu trong bảng thanh_toan)
            const methodNames = {
                'cod': 'Tiền mặt (COD)',
                'momo': 'MoMo',
                'vnpay': 'VNPay',
                'zalopay': 'ZaloPay',
                'bank_transfer': 'Chuyển khoản',
                'cash': 'Tiền mặt'
            };

            // Map màu cho từng phương thức
            const methodColors = {
                'cod': '#10b981',
                'momo': '#a855f7',
                'vnpay': '#3b82f6',
                'zalopay': '#06b6d4',
                'bank_transfer': '#f59e0b',
                'cash': '#10b981'
            };

            const labels = [];
            const values = [];
            const colors = [];

            data.forEach((item) => {
                const method = item.phuong_thuc_thanh_toan || 'Khác';
                const methodName = methodNames[method] || method;
                labels.push(methodName);
                values.push(item.so_luong || 0);
                colors.push(methodColors[method] || '#9ca3af');
            });

            paymentMethodsChart.data.labels = labels;
            paymentMethodsChart.data.datasets[0].data = values;
            paymentMethodsChart.data.datasets[0].backgroundColor = colors;
            paymentMethodsChart.update();
        }

        async function renderRecentOrdersWithFilter(status) {
            const container = document.getElementById('recent-orders');
            const statusColors = { delivered: 'bg-emerald-100 text-emerald-700', confirmed: 'bg-blue-100 text-blue-700', preparing: 'bg-blue-100 text-blue-700', pending: 'bg-amber-100 text-amber-700', cancelled: 'bg-red-100 text-red-700' };
            const statusText = { delivered: 'Hoàn thành', confirmed: 'Đã xác nhận', preparing: 'Đang chuẩn bị', pending: 'Chờ xác nhận', cancelled: 'Đã hủy' };
            
            try {
                let url = `${API_URL}/orders/all?limit=5`;
                if (status && status !== 'all') {
                    url += `&status=${status}`;
                }
                
                const response = await fetch(url, { credentials: 'include' });
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data && data.data.length > 0) {
                        container.innerHTML = data.data.map(o => `
                            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                                <div class="flex-1">
                                    <p class="text-sm font-semibold text-gray-800">#DH${String(o.ma_don_hang).padStart(6, '0')} - ${o.ten_khach_hang || o.ten_khach_vang_lai || 'Khách hàng'}</p>
                                    <p class="text-xs text-gray-500 mt-0.5">${formatTimeAgo(o.thoi_gian_tao)}</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-sm font-bold text-blue-600">${formatCurrency(o.tong_tien || 0)}đ</p>
                                    <span class="text-xs px-2 py-1 rounded-full ${statusColors[o.trang_thai] || 'bg-gray-100 text-gray-700'} font-medium">${statusText[o.trang_thai] || o.trang_thai}</span>
                                </div>
                            </div>
                        `).join('');
                        return;
                    }
                }
            } catch (error) {
                console.error('Error loading recent orders:', error);
            }
            container.innerHTML = '<p class="text-center text-gray-500 py-4">Không có đơn hàng phù hợp</p>';
        }

        // ========== 5 MỤC TIÊU THÁNG ==========
        async function loadGoals(filterMonth = null, filterYear = null) {
            try {
                // Lấy tháng/năm từ filter hoặc dùng giá trị mặc định
                const filters = getFilterValues();
                const month = filterMonth || (filters.month > 0 ? filters.month : new Date().getMonth() + 1);
                const year = filterYear || filters.year || new Date().getFullYear();
                
                const response = await fetch(`${API_URL}/admin-chatbot/goals?month=${month}&year=${year}`, { credentials: 'include' });
                const result = await response.json();
                
                if (result.success) {
                    const { goals, actual, totalProgress = 0, month: resMonth, year: resYear, hasGoals } = result.data;
                    
                    // Cập nhật tiêu đề
                    document.getElementById('goals-month-year').textContent = `(Tháng ${resMonth}/${resYear})`;
                    document.getElementById('total-progress-badge').textContent = `${totalProgress || 0}%`;
                    
                    // Ẩn/hiện nút tạo mục tiêu và nút reset dựa trên hasGoals
                    const btnGenerate = document.getElementById('btn-generate-goals');
                    const btnReset = document.getElementById('btn-reset-goals');
                    
                    if (hasGoals) {
                        // Đã có mục tiêu -> đổi thành nút "Đề xuất chiến lược"
                        btnGenerate.innerHTML = '<i class="fas fa-lightbulb mr-1"></i>AI Đề xuất';
                        btnGenerate.onclick = () => openAIStrategy();
                        btnGenerate.className = 'px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-xs hover:opacity-90 transition';
                        // Hiện nút reset
                        btnReset.classList.remove('hidden');
                    } else {
                        // Chưa có mục tiêu -> nút tạo mới
                        btnGenerate.innerHTML = '<i class="fas fa-magic mr-1"></i>AI Tạo mục tiêu';
                        btnGenerate.onclick = () => generateGoals();
                        btnGenerate.className = 'px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs hover:opacity-90 transition';
                        // Ẩn nút reset
                        btnReset.classList.add('hidden');
                    }
                    
                    // Cập nhật gauge chart với tổng tiến độ (luôn cập nhật dù có hay không có mục tiêu)
                    updateGaugeChart(totalProgress || 0, 100);
                    document.getElementById('gauge-value').textContent = (totalProgress || 0) + '%';
                    
                    const container = document.getElementById('goals-container');
                    
                    if (!hasGoals || goals.length === 0) {
                        container.innerHTML = `
                            <div class="col-span-5 text-center py-8">
                                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <i class="fas fa-bullseye text-purple-500 text-2xl"></i>
                                </div>
                                <p class="text-gray-500 mb-3">Chưa có mục tiêu cho tháng này</p>
                                <p class="text-xs text-gray-400 mb-3">Mỗi tháng chỉ được tạo mục tiêu 1 lần</p>
                                <button onclick="generateGoals()" class="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm hover:opacity-90 transition">
                                    <i class="fas fa-magic mr-2"></i>AI Tạo 5 mục tiêu
                                </button>
                            </div>
                        `;
                        return;
                    }
                    
                    // Render 5 mục tiêu
                    container.innerHTML = goals.map(goal => {
                        const progressColor = goal.tien_do >= 100 ? 'bg-green-500' : goal.tien_do >= 70 ? 'bg-blue-500' : goal.tien_do >= 40 ? 'bg-yellow-500' : 'bg-red-500';
                        const statusIcon = goal.hoan_thanh ? '✅' : goal.tien_do >= 70 ? '🔥' : goal.tien_do >= 40 ? '⚡' : '🎯';
                        
                        return `
                            <div class="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="text-2xl">${goal.icon}</span>
                                    <span class="text-xs font-bold ${goal.hoan_thanh ? 'text-green-600' : 'text-gray-500'}">${statusIcon} ${goal.tien_do}%</span>
                                </div>
                                <h4 class="font-semibold text-sm text-gray-800 mb-1">${goal.ten_muc_tieu}</h4>
                                <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                                    <div class="${progressColor} h-2 rounded-full transition-all duration-500" style="width: ${goal.tien_do}%"></div>
                                </div>
                                <div class="flex justify-between text-xs text-gray-500">
                                    <span>${formatGoalValue(goal.gia_tri_hien_tai, goal.loai_muc_tieu)}</span>
                                    <span>/ ${formatGoalValue(goal.gia_tri_muc_tieu, goal.loai_muc_tieu)}</span>
                                </div>
                            </div>
                        `;
                    }).join('');
                }
            } catch (error) {
                console.error('Error loading goals:', error);
                document.getElementById('goals-container').innerHTML = `
                    <div class="col-span-5 text-center py-8 text-red-500">
                        <i class="fas fa-exclamation-circle text-2xl mb-2"></i>
                        <p class="text-sm">Lỗi tải mục tiêu</p>
                    </div>
                `;
            }
        }
        
        // Mở AI đề xuất chiến lược
        function openAIStrategy() {
            // Mở chatbot và gửi câu hỏi đề xuất chiến lược
            if (!adminChatOpen) {
                toggleAdminChat();
            }
            setTimeout(() => {
                document.getElementById('admin-chat-input').value = 'Đề xuất chiến lược cải thiện để đạt mục tiêu tháng này';
                sendAdminChat();
            }, 300);
        }
        
        function formatGoalValue(value, type) {
            // Làm tròn số, bỏ phần thập phân
            const roundedValue = Math.round(parseFloat(value) || 0);
            
            if (type === 'doanh_thu') {
                if (roundedValue >= 1000000000) {
                    return (roundedValue / 1000000000).toFixed(1) + ' tỷ';
                }
                if (roundedValue >= 1000000) {
                    return (roundedValue / 1000000).toFixed(1).replace('.0', '') + ' triệu';
                }
                if (roundedValue >= 1000) {
                    return new Intl.NumberFormat('vi-VN').format(roundedValue) + 'đ';
                }
                return roundedValue + 'đ';
            }
            // Các loại khác: số nguyên
            return roundedValue.toLocaleString('vi-VN');
        }
        
        async function generateGoals() {
            const btn = document.getElementById('btn-generate-goals');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Đang tạo...';
            
            try {
                const response = await fetch(`${API_URL}/admin-chatbot/goals/generate`, {
                    method: 'POST',
                    credentials: 'include'
                });
                const result = await response.json();
                
                if (result.success) {
                    // Reload goals
                    await loadGoals();
                    // Thông báo thành công
                    showToast('✅ Đã tạo 5 mục tiêu mới cho tháng này!', 'success');
                } else {
                    // Nếu mục tiêu đã tồn tại
                    if (result.alreadyExists) {
                        showToast('⚠️ ' + result.message, 'warning');
                    } else {
                        showToast('❌ ' + result.message, 'error');
                    }
                }
            } catch (error) {
                console.error('Error generating goals:', error);
                showToast('❌ Không thể tạo mục tiêu', 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-magic mr-1"></i>AI Tạo mục tiêu';
            }
        }
        
        // Hàm hiển thị toast notification
        function showToast(message, type = 'info') {
            const colors = {
                success: 'bg-green-500',
                error: 'bg-red-500',
                warning: 'bg-yellow-500',
                info: 'bg-blue-500'
            };
            
            const toast = document.createElement('div');
            toast.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse`;
            toast.innerHTML = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.remove();
            }, 4000);
        }
        
        function refreshGoals() {
            const filters = getFilterValues();
            if (filters.month > 0) {
                loadGoals(filters.month, filters.year);
            } else {
                const now = new Date();
                loadGoals(now.getMonth() + 1, filters.year);
            }
        }
        
        // Xóa mục tiêu để tạo lại
        async function resetGoals() {
            if (!confirm('Bạn có chắc muốn xóa tất cả mục tiêu tháng này?\nSau khi xóa, bạn có thể tạo lại mục tiêu mới.')) {
                return;
            }
            
            try {
                const response = await fetch(`${API_URL}/admin-chatbot/goals`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                const result = await response.json();
                
                if (result.success) {
                    showToast('✅ Đã xóa mục tiêu. Bạn có thể tạo lại!', 'success');
                    await loadGoals();
                } else {
                    showToast('❌ ' + result.message, 'error');
                }
            } catch (error) {
                console.error('Error resetting goals:', error);
                showToast('❌ Không thể xóa mục tiêu', 'error');
            }
        }
        
        // Load goals khi trang load
        setTimeout(loadGoals, 500);

        // ========== ADMIN AI CHATBOT ==========
        let adminChatOpen = false;
        let adminChatSessionId = null;
        let adminChatHistoryLoaded = false;
        
        // Lấy hoặc tạo session ID cho admin chat
        function getAdminChatSessionId() {
            if (!adminChatSessionId) {
                // Thử lấy từ localStorage
                adminChatSessionId = localStorage.getItem('admin_chat_session_id');
                const lastActive = localStorage.getItem('admin_chat_session_time');
                const now = Date.now();
                const TIMEOUT = 60 * 60 * 1000; // 1 giờ
                
                if (!adminChatSessionId || !lastActive || (now - parseInt(lastActive)) > TIMEOUT) {
                    adminChatSessionId = 'admin_session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    localStorage.setItem('admin_chat_session_id', adminChatSessionId);
                    localStorage.setItem('admin_chat_session_time', now.toString());
                    console.log('🆕 Created new admin chat session:', adminChatSessionId);
                } else {
                    console.log('♻️ Restored admin chat session:', adminChatSessionId);
                    localStorage.setItem('admin_chat_session_time', now.toString()); // Gia hạn
                }
            } else {
                localStorage.setItem('admin_chat_session_time', Date.now().toString());
            }
            return adminChatSessionId;
        }
        
        // Reset admin chat session
        function resetAdminChatSession() {
            adminChatSessionId = 'admin_session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('admin_chat_session_id', adminChatSessionId);
            localStorage.setItem('admin_chat_session_time', Date.now().toString());
            console.log('🔄 Reset admin chat session:', adminChatSessionId);
            
            // Xóa lịch sử hiển thị
            const container = document.getElementById('admin-chat-messages');
            if (container) {
                container.innerHTML = `
                    <div class="flex justify-start mb-3">
                        <div class="flex items-start space-x-2 max-w-[90%]">
                            <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <i class="fas fa-robot text-white text-xs"></i>
                            </div>
                            <div class="bg-gray-100 px-4 py-2 rounded-2xl rounded-tl-sm text-sm text-gray-800">
                                👋 <strong>Chào chị Linh!</strong><br><br>
                                Em là <strong>Phương Nam</strong> - trợ lý AI của chị.<br><br>
                                Em có thể giúp chị:<br>
                                📊 Xem báo cáo kinh doanh<br>
                                🎯 Đặt và theo dõi mục tiêu<br>
                                📈 Đề xuất chiến lược tăng doanh thu<br><br>
                                <em>Chị cần em hỗ trợ gì ạ?</em> 😊
                            </div>
                        </div>
                    </div>
                `;
            }
            adminChatHistoryLoaded = false;
            return adminChatSessionId;
        }
        
        // Load lịch sử admin chat
        async function loadAdminChatHistory() {
            const sessionId = getAdminChatSessionId();
            const container = document.getElementById('admin-chat-messages');
            if (!container || !sessionId) return;
            
            try {
                console.log('📜 Loading admin chat history for session:', sessionId);
                
                const response = await fetch(`${API_URL}/admin-chatbot/history/${sessionId}`, {
                    method: 'GET',
                    credentials: 'include'
                });
                
                const result = await response.json();
                
                if (result.success && result.data && result.data.length > 0) {
                    console.log('✅ Loaded', result.data.length, 'admin messages from history');
                    
                    // Xóa welcome message
                    container.innerHTML = '';
                    
                    // Render lại lịch sử
                    result.data.forEach(msg => {
                        appendAdminMessage(msg.noi_dung, msg.nguoi_gui === 'user' ? 'user' : 'bot', false);
                    });
                    
                    adminChatHistoryLoaded = true;
                    container.scrollTop = container.scrollHeight;
                    console.log('✅ Admin chat history loaded successfully');
                } else {
                    console.log('ℹ️ No admin chat history found, showing welcome message');
                    // Không có lịch sử -> hiển thị welcome message
                    container.innerHTML = `
                        <div class="flex justify-start mb-3">
                            <div class="flex items-start space-x-2 max-w-[90%]">
                                <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <i class="fas fa-robot text-white text-xs"></i>
                                </div>
                                <div class="bg-gray-100 px-4 py-2 rounded-2xl rounded-tl-sm text-sm text-gray-800">
                                    👋 <strong>Chào chị Linh!</strong><br><br>
                                    Em là <strong>Phương Nam</strong> - trợ lý AI của chị.<br><br>
                                    Em có thể giúp chị:<br>
                                    📊 Xem báo cáo kinh doanh<br>
                                    🎯 Đặt và theo dõi mục tiêu<br>
                                    📈 Đề xuất chiến lược tăng doanh thu<br><br>
                                    <em>Chị cần em hỗ trợ gì ạ?</em> 😊
                                </div>
                            </div>
                        </div>
                    `;
                    adminChatHistoryLoaded = true;
                }
            } catch (error) {
                console.error('❌ Error loading admin chat history:', error);
                // Fallback: hiển thị welcome message
                container.innerHTML = `
                    <div class="flex justify-start mb-3">
                        <div class="flex items-start space-x-2 max-w-[90%]">
                            <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <i class="fas fa-robot text-white text-xs"></i>
                            </div>
                            <div class="bg-gray-100 px-4 py-2 rounded-2xl rounded-tl-sm text-sm text-gray-800">
                                👋 <strong>Chào chị Linh!</strong><br><br>
                                Em là <strong>Phương Nam</strong> - trợ lý AI của chị.<br><br>
                                Em có thể giúp chị:<br>
                                📊 Xem báo cáo kinh doanh<br>
                                🎯 Đặt và theo dõi mục tiêu<br>
                                📈 Đề xuất chiến lược tăng doanh thu<br><br>
                                <em>Chị cần em hỗ trợ gì ạ?</em> 😊
                            </div>
                        </div>
                    </div>
                `;
                adminChatHistoryLoaded = true;
            }
        }
        
        // Toggle dropdown lịch sử admin
        function toggleAdminChatHistory() {
            const dropdown = document.getElementById('adminChatHistoryDropdown');
            if (dropdown) {
                dropdown.classList.toggle('hidden');
                
                // Load danh sách session khi mở
                if (!dropdown.classList.contains('hidden')) {
                    loadAdminSessionList();
                }
            }
        }
        
        // Load danh sách các session admin chat
        async function loadAdminSessionList() {
            const historyList = document.getElementById('adminHistoryList');
            
            if (!historyList) return;
            
            historyList.innerHTML = '<div class="text-center text-gray-400 text-sm py-4"><i class="fas fa-spinner fa-spin"></i> Đang tải...</div>';
            
            try {
                console.log('📜 Loading admin chat sessions');
                
                const response = await fetch(`${API_URL}/admin-chatbot/sessions`, {
                    method: 'GET',
                    credentials: 'include'
                });
                
                const result = await response.json();
                console.log('📡 Admin sessions response:', result);
                
                if (result.success && result.data && result.data.length > 0) {
                    const currentSession = getAdminChatSessionId();
                    
                    historyList.innerHTML = result.data.map(session => {
                        const isActive = session.session_id === currentSession;
                        const date = new Date(session.thoi_diem_chat);
                        const timeStr = formatAdminChatTime(date);
                        const preview = session.first_message && session.first_message.length > 40 
                            ? session.first_message.substring(0, 40) + '...' 
                            : (session.first_message || 'Cuộc trò chuyện');
                        
                        return `
                            <div class="history-item ${isActive ? 'active' : ''} p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50" 
                                 onclick="loadAdminChatSession('${session.session_id}')">
                                <div class="flex items-start justify-between gap-2">
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm text-gray-700 font-medium truncate">${escapeAdminHtml(preview)}</p>
                                        <p class="text-xs text-gray-400 mt-1">${timeStr} • ${session.message_count} tin nhắn</p>
                                    </div>
                                    ${isActive ? '<i class="fas fa-check-circle text-purple-500 text-sm flex-shrink-0"></i>' : ''}
                                </div>
                            </div>
                        `;
                    }).join('');
                } else {
                    historyList.innerHTML = '<div class="text-center text-gray-400 text-sm py-4">📜 Chưa có lịch sử chat</div>';
                }
            } catch (error) {
                console.error('Error loading admin session list:', error);
                historyList.innerHTML = '<div class="text-center text-red-400 text-sm py-4">❌ Lỗi tải lịch sử</div>';
            }
        }
        
        // Format thời gian chat admin
        function formatAdminChatTime(date) {
            const now = new Date();
            const diff = now - date;
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);
            
            if (minutes < 1) return 'Vừa xong';
            if (minutes < 60) return `${minutes} phút trước`;
            if (hours < 24) return `${hours} giờ trước`;
            if (days < 7) return `${days} ngày trước`;
            
            return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }
        
        // Load một session admin chat cụ thể
        function loadAdminChatSession(sessionId) {
            console.log('🔄 Loading admin chat session:', sessionId);
            
            const container = document.getElementById('admin-chat-messages');
            if (!container) return;
            
            // Cập nhật session hiện tại
            adminChatSessionId = sessionId;
            localStorage.setItem('admin_chat_session_id', sessionId);
            
            // Reset flag để load lại
            adminChatHistoryLoaded = false;
            
            // Load lịch sử của session này
            loadAdminChatHistory();
            
            // Đóng dropdown
            const dropdown = document.getElementById('adminChatHistoryDropdown');
            if (dropdown) dropdown.classList.add('hidden');
            
            console.log('✅ Switched to admin session:', sessionId);
        }
        
        // Escape HTML cho admin chat
        function escapeAdminHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        function toggleAdminChat() {
            const chatWindow = document.getElementById('admin-chat-window');
            adminChatOpen = !adminChatOpen;
            
            if (adminChatOpen) {
                chatWindow.classList.remove('hidden', 'scale-95', 'opacity-0');
                chatWindow.classList.add('scale-100', 'opacity-100');
                
                // Load lịch sử khi mở chat (nếu chưa load)
                if (!adminChatHistoryLoaded) {
                    setTimeout(() => {
                        loadAdminChatHistory();
                    }, 100);
                }
                
                // Load mục tiêu khi mở chat
                loadTargetForGauge();
            } else {
                chatWindow.classList.add('scale-95', 'opacity-0');
                setTimeout(() => chatWindow.classList.add('hidden'), 200);
            }
        }
        
        // Load lịch sử admin chat ngay khi trang load xong (để sẵn sàng khi mở)
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (!adminChatHistoryLoaded) {
                    loadAdminChatHistory();
                }
            }, 500);
        });
        
        // Đóng dropdown admin history khi click ra ngoài
        document.addEventListener('click', function(e) {
            const dropdown = document.getElementById('adminChatHistoryDropdown');
            const historyBtn = e.target.closest('[onclick*="toggleAdminChatHistory"]');
            if (dropdown && !dropdown.classList.contains('hidden') && !dropdown.contains(e.target) && !historyBtn) {
                dropdown.classList.add('hidden');
            }
        });
        
        async function sendAdminChat() {
            const input = document.getElementById('admin-chat-input');
            const message = input.value.trim();
            if (!message) return;
            
            // Lấy session ID
            const sessionId = getAdminChatSessionId();
            
            // Hiển thị tin nhắn người dùng
            appendAdminMessage(message, 'user');
            input.value = '';
            
            // Hiển thị loading với ID cố định
            const loadingId = 'chat-loading-' + Date.now();
            const loadingDiv = document.createElement('div');
            loadingDiv.id = loadingId;
            loadingDiv.className = 'flex justify-start mb-3';
            loadingDiv.innerHTML = `
                <div class="flex items-start space-x-2 max-w-[90%]">
                    <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-robot text-white text-xs"></i>
                    </div>
                    <div class="bg-gray-100 px-4 py-2 rounded-2xl rounded-tl-sm text-sm text-gray-800">
                        <i class="fas fa-spinner fa-spin mr-1"></i> Đang phân tích...
                    </div>
                </div>`;
            const chatContainer = document.getElementById('admin-chat-messages');
            chatContainer.appendChild(loadingDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
            
            try {
                const response = await fetch(`${API_URL}/admin-chatbot/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ 
                        message: message,
                        session_id: sessionId
                    })
                });
                
                const result = await response.json();
                
                // Xóa loading - đảm bảo xóa được
                const loadingElement = document.getElementById(loadingId);
                if (loadingElement) {
                    loadingElement.remove();
                }
                
                if (result.success) {
                    appendAdminMessage(result.data.message, 'bot');
                    
                    // Hiển thị suggestions
                    if (result.data.suggestions) {
                        appendSuggestions(result.data.suggestions);
                    }
                    
                    // Nếu có đề xuất mục tiêu, hiển thị nút đặt mục tiêu
                    if (result.data.suggestedTarget) {
                        appendTargetButtons(result.data.suggestedTarget);
                    }
                    
                    // Nếu cần hiển thị nút tạo mục tiêu
                    if (result.data.showGenerateButton || result.data.action === 'generate_goals') {
                        appendGenerateGoalsButton();
                    }
                } else {
                    appendAdminMessage('❌ ' + (result.message || 'Có lỗi xảy ra'), 'bot');
                }
            } catch (error) {
                // Xóa loading khi lỗi
                const loadingElement = document.getElementById(loadingId);
                if (loadingElement) {
                    loadingElement.remove();
                }
                appendAdminMessage('❌ Không thể kết nối server', 'bot');
            }
        }
        
        function appendAdminMessage(content, type, shouldScroll = true) {
            const container = document.getElementById('admin-chat-messages');
            const id = 'msg-' + Date.now();
            
            const msgDiv = document.createElement('div');
            msgDiv.id = id;
            msgDiv.className = `flex ${type === 'user' ? 'justify-end' : 'justify-start'} mb-3`;
            
            const bubble = type === 'user' 
                ? `<div class="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-br-sm max-w-[85%] text-sm">${content}</div>`
                : `<div class="flex items-start space-x-2 max-w-[90%]">
                    <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-robot text-white text-xs"></i>
                    </div>
                    <div class="bg-gray-100 px-4 py-2 rounded-2xl rounded-tl-sm text-sm text-gray-800 whitespace-pre-line">${content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>
                </div>`;
            
            msgDiv.innerHTML = bubble;
            container.appendChild(msgDiv);
            
            if (shouldScroll) {
                container.scrollTop = container.scrollHeight;
            }
            
            return id;
        }
        
        function appendSuggestions(suggestions) {
            const container = document.getElementById('admin-chat-messages');
            const div = document.createElement('div');
            div.className = 'flex flex-wrap gap-2 mb-3 ml-10';
            div.innerHTML = suggestions.map(s => 
                `<button onclick="quickAdminChat('${s}')" class="bg-white border border-blue-200 text-blue-600 px-3 py-1 rounded-full text-xs hover:bg-blue-50 transition">${s}</button>`
            ).join('');
            container.appendChild(div);
            container.scrollTop = container.scrollHeight;
        }
        
        function appendTargetButtons(target) {
            const container = document.getElementById('admin-chat-messages');
            const div = document.createElement('div');
            div.className = 'flex gap-2 mb-3 ml-10';
            div.innerHTML = `
                <button onclick="setMonthlyTarget(${target.revenue}, ${target.orders})" class="bg-green-500 text-white px-4 py-2 rounded-lg text-xs hover:bg-green-600 transition">
                    <i class="fas fa-check mr-1"></i> Đặt mục tiêu này
                </button>
                <button onclick="quickAdminChat('Điều chỉnh mục tiêu cao hơn')" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs hover:bg-gray-300 transition">
                    Điều chỉnh
                </button>
            `;
            container.appendChild(div);
            container.scrollTop = container.scrollHeight;
        }
        
        function quickAdminChat(message) {
            document.getElementById('admin-chat-input').value = message;
            sendAdminChat();
        }
        
        function appendGenerateGoalsButton() {
            const container = document.getElementById('admin-chat-messages');
            const div = document.createElement('div');
            div.className = 'flex gap-2 mb-3 ml-10';
            div.innerHTML = `
                <button onclick="generateGoalsFromChat()" class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-xs hover:opacity-90 transition">
                    <i class="fas fa-magic mr-1"></i> Tạo 5 mục tiêu ngay
                </button>
            `;
            container.appendChild(div);
            container.scrollTop = container.scrollHeight;
        }
        
        async function generateGoalsFromChat() {
            appendAdminMessage('Đang tạo 5 mục tiêu...', 'user');
            
            try {
                const response = await fetch(`${API_URL}/admin-chatbot/goals/generate`, {
                    method: 'POST',
                    credentials: 'include'
                });
                const result = await response.json();
                
                if (result.success) {
                    appendAdminMessage('✅ Đã tạo 5 mục tiêu mới!\n\n' + result.data.map(g => `${g.icon} ${g.ten_muc_tieu}: ${g.loai_muc_tieu === 'doanh_thu' ? new Intl.NumberFormat('vi-VN').format(g.gia_tri_muc_tieu) + 'đ' : g.gia_tri_muc_tieu + ' ' + g.don_vi}`).join('\n'), 'bot');
                    appendSuggestions(['Xem tiến độ mục tiêu', 'Báo cáo tháng này']);
                    // Reload goals trên dashboard
                    loadGoals();
                } else {
                    appendAdminMessage('❌ Lỗi: ' + result.message, 'bot');
                }
            } catch (error) {
                appendAdminMessage('❌ Không thể tạo mục tiêu', 'bot');
            }
        }
        
        async function setMonthlyTarget(revenue, orders) {
            try {
                const response = await fetch(`${API_URL}/admin-chatbot/target`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ 
                        muc_tieu_doanh_thu: revenue, 
                        muc_tieu_don_hang: orders,
                        ghi_chu: 'Đặt bởi AI Assistant'
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    appendAdminMessage('✅ Đã đặt mục tiêu thành công! Biểu đồ tỷ lệ hoàn thành đã được cập nhật.', 'bot');
                    // Cập nhật biểu đồ gauge
                    loadTargetForGauge();
                } else {
                    appendAdminMessage('❌ Không thể đặt mục tiêu: ' + result.message, 'bot');
                }
            } catch (error) {
                appendAdminMessage('❌ Lỗi kết nối server', 'bot');
            }
        }
        
        async function loadTargetForGauge() {
            try {
                // Lấy dữ liệu từ goals API để cập nhật gauge
                const response = await fetch(`${API_URL}/admin-chatbot/goals`, { credentials: 'include' });
                const result = await response.json();
                
                if (result.success && result.data && result.data.hasGoals) {
                    const totalProgress = result.data.totalProgress || 0;
                    updateGaugeChart(totalProgress, 100);
                    document.getElementById('gauge-value').textContent = totalProgress + '%';
                } else {
                    // Fallback to old gauge-data API
                    const gaugeResponse = await fetch(`${API_URL}/admin-chatbot/gauge-data`, { credentials: 'include' });
                    const gaugeResult = await gaugeResponse.json();
                    
                    if (gaugeResult.success && gaugeResult.data) {
                        updateGaugeChart(gaugeResult.data.current, gaugeResult.data.target);
                    }
                }
            } catch (error) {
                console.error('Error loading gauge data:', error);
            }
        }
        
        // Load gauge data khi trang load (sau khi load goals)
        setTimeout(loadTargetForGauge, 1500);

        // ========== BIỂU ĐỒ DOANH THU THEO NGÀY ==========
        function initDailyRevenueFilters() {
            document.querySelectorAll('.daily-filter-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.daily-filter-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    const range = this.dataset.range;
                    loadDailyRevenueData(range);
                });
            });
            // Load dữ liệu mặc định (7 ngày)
            loadDailyRevenueData('7');
        }

        async function loadDailyRevenueData(range) {
            try {
                const response = await fetch(`${API_URL}/stats/revenue-daily?range=${range}`, { credentials: 'include' });
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data) {
                        dailyRevenueData = result.data;
                        updateDailyRevenueChart(result.data, range);
                    }
                } else {
                    // Nếu API chưa có, tạo dữ liệu mẫu
                    generateSampleDailyData(range);
                }
            } catch (error) {
                console.error('Error loading daily revenue:', error);
                // Tạo dữ liệu mẫu nếu lỗi
                generateSampleDailyData(range);
            }
        }

        function generateSampleDailyData(range) {
            const days = range === 'all' ? 365 : parseInt(range);
            const data = [];
            const today = new Date();
            let baseRevenue = 5000000;
            
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                
                // Tạo doanh thu ngẫu nhiên với xu hướng tăng nhẹ
                const variation = (Math.random() - 0.3) * 3000000;
                const trend = (days - i) * 10000;
                const revenue = Math.max(0, baseRevenue + variation + trend);
                
                data.push({
                    ngay: date.toISOString().split('T')[0],
                    doanh_thu: Math.round(revenue)
                });
            }
            
            dailyRevenueData = data;
            updateDailyRevenueChart(data, range);
        }

        function updateDailyRevenueChart(data, range) {
            if (!data || data.length === 0) return;

            // Format labels dựa trên range
            const labels = data.map(item => {
                const date = new Date(item.ngay);
                if (range === '7' || range === '30') {
                    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                } else if (range === '90' || range === '180') {
                    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                } else {
                    return date.toLocaleDateString('vi-VN', { month: '2-digit', year: '2-digit' });
                }
            });

            const values = data.map(item => item.doanh_thu || 0);

            // Cập nhật biểu đồ
            dailyRevenueChart.data.labels = labels;
            dailyRevenueChart.data.datasets[0].data = values;
            
            // Cập nhật màu gradient dựa trên xu hướng
            const firstValue = values[0] || 0;
            const lastValue = values[values.length - 1] || 0;
            const isUp = lastValue >= firstValue;
            
            const ctx = dailyRevenueChart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            
            if (isUp) {
                gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
                gradient.addColorStop(1, 'rgba(16, 185, 129, 0.02)');
                dailyRevenueChart.data.datasets[0].borderColor = '#10b981';
            } else {
                gradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
                gradient.addColorStop(1, 'rgba(239, 68, 68, 0.02)');
                dailyRevenueChart.data.datasets[0].borderColor = '#ef4444';
            }
            dailyRevenueChart.data.datasets[0].backgroundColor = gradient;
            
            dailyRevenueChart.update();

            // Cập nhật thông tin tổng quan
            updateDailyRevenueSummary(data, isUp);
        }

        function updateDailyRevenueSummary(data, isUp) {
            if (!data || data.length === 0) return;

            // Tính tổng doanh thu trong khoảng thời gian
            const totalRevenue = data.reduce((sum, item) => sum + (item.doanh_thu || 0), 0);
            
            // Tính % thay đổi
            const firstHalf = data.slice(0, Math.floor(data.length / 2));
            const secondHalf = data.slice(Math.floor(data.length / 2));
            
            const firstHalfTotal = firstHalf.reduce((sum, item) => sum + (item.doanh_thu || 0), 0);
            const secondHalfTotal = secondHalf.reduce((sum, item) => sum + (item.doanh_thu || 0), 0);
            
            let changePercent = 0;
            if (firstHalfTotal > 0) {
                changePercent = ((secondHalfTotal - firstHalfTotal) / firstHalfTotal * 100).toFixed(2);
            }

            // Cập nhật UI
            document.getElementById('daily-revenue-value').textContent = formatCurrency(totalRevenue) + 'đ';
            
            const changeEl = document.getElementById('daily-revenue-change');
            if (parseFloat(changePercent) >= 0) {
                changeEl.innerHTML = `<i class="fas fa-arrow-up"></i> +${changePercent}%`;
                changeEl.className = 'text-sm px-2 py-1 rounded up';
            } else {
                changeEl.innerHTML = `<i class="fas fa-arrow-down"></i> ${changePercent}%`;
                changeEl.className = 'text-sm px-2 py-1 rounded down';
            }

            // Cập nhật ngày bắt đầu và kết thúc
            if (data.length > 0) {
                const startDate = new Date(data[0].ngay);
                const endDate = new Date(data[data.length - 1].ngay);
                
                document.getElementById('daily-chart-start-date').textContent = 
                    startDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                document.getElementById('daily-chart-end-date').textContent = 
                    endDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
            }
        }

        function formatCompactNumber(num) {
            if (num >= 1000000000) {
                return (num / 1000000000).toFixed(1) + ' tỷ';
            }
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + ' tr';
            }
            if (num >= 1000) {
                return (num / 1000).toFixed(0) + 'k';
            }
            return num.toString();
        }

/* ==== Script 2 (tách từ dashboard.html) ==== */
// Initialize admin notifications after page load
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                if (typeof AdminNotificationManager !== 'undefined') {
                    AdminNotificationManager.init();
                    console.log('✅ Admin Notification Manager initialized');
                }
            }, 500);
        });
