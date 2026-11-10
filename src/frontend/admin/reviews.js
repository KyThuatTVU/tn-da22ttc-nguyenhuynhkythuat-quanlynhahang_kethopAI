/* ==== Script 1 (tách từ reviews.html) ==== */
let reviews = [];
        let selectedIds = [];
        let apiStats = null;
        let dailyStats = [];
        let topProducts = [];

        async function loadReviews() {
            try {
                const response = await fetch(`${API_URL}/reviews/admin/all`, { credentials: 'include' });
                const data = await response.json();
                if (data.success) {
                    reviews = data.data || [];
                    apiStats = data.stats;
                    dailyStats = data.dailyStats || [];
                    topProducts = data.topProducts || [];
                    renderReviews(reviews);
                    updateStats(data.stats);
                    updateChartsWithData();
                }
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('reviews-tbody').innerHTML = `<tr><td colspan="8" class="px-6 py-12 text-center text-red-500"><i class="fas fa-exclamation-circle text-3xl mb-2"></i><p>Không thể tải dữ liệu</p></td></tr>`;
            }
        }

        let starChart, statusChart, topProductsChart, timeChart;

        function updateStats(stats) {
            document.getElementById('stat-total').textContent = stats.total || 0;
            document.getElementById('stat-pending').textContent = stats.pending || 0;
            document.getElementById('stat-approved').textContent = stats.approved || 0;
            document.getElementById('stat-rejected').textContent = stats.rejected || 0;
            if (statusChart) {
                statusChart.data.datasets[0].data = [stats.approved || 0, stats.pending || 0, stats.rejected || 0];
                statusChart.update();
            }
        }

        function initCharts() {
            const starCtx = document.getElementById('starDistributionChart').getContext('2d');
            starChart = new Chart(starCtx, {
                type: 'bar',
                data: { labels: ['5 sao', '4 sao', '3 sao', '2 sao', '1 sao'], datasets: [{ label: 'Số lượng', data: [0, 0, 0, 0, 0], backgroundColor: ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'], borderRadius: 8 }] },
                options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true }, y: { grid: { display: false } } } }
            });

            const statusCtx = document.getElementById('statusChart').getContext('2d');
            statusChart = new Chart(statusCtx, {
                type: 'doughnut',
                data: { labels: ['Đã duyệt', 'Chờ duyệt', 'Đã khóa'], datasets: [{ data: [0, 0, 0], backgroundColor: ['#10b981', '#f59e0b', '#ef4444'], borderWidth: 0, cutout: '65%' }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
            });

            const topCtx = document.getElementById('topProductsChart').getContext('2d');
            topProductsChart = new Chart(topCtx, {
                type: 'bar',
                data: { labels: [], datasets: [{ label: 'Số đánh giá', data: [], backgroundColor: '#3b82f6', borderRadius: 6 }] },
                options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } }
            });

            const timeCtx = document.getElementById('reviewsTimeChart').getContext('2d');
            timeChart = new Chart(timeCtx, {
                type: 'line',
                data: { labels: [], datasets: [{ label: 'Đánh giá mới', data: [], borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.4 }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            });
        }

        function updateChartsWithData() {
            if (apiStats && apiStats.starDistribution) {
                const dist = apiStats.starDistribution;
                if (starChart) { starChart.data.datasets[0].data = [dist[5], dist[4], dist[3], dist[2], dist[1]]; starChart.update(); }
                const avgRating = parseFloat(apiStats.average_rating || 0).toFixed(1);
                document.getElementById('average-rating-display').innerHTML = `<p class="text-sm text-slate-500">Điểm trung bình</p><p class="text-3xl font-bold text-yellow-500">${avgRating} <i class="fas fa-star text-xl"></i></p>`;
            }
            if (topProducts.length > 0 && topProductsChart) {
                topProductsChart.data.labels = topProducts.map(p => p.ten_mon.substring(0, 18));
                topProductsChart.data.datasets[0].data = topProducts.map(p => p.review_count);
                topProductsChart.update();
            }
            updateTimeChart();
        }

        function updateTimeChart() {
            const days = parseInt(document.getElementById('time-range').value);
            const now = new Date();
            const dateLabels = [];
            const dateCounts = {};
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date(now); date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                dateLabels.push(dateStr); dateCounts[dateStr] = 0;
            }
            if (dailyStats.length > 0) { dailyStats.forEach(stat => { const d = new Date(stat.date).toISOString().split('T')[0]; if (dateCounts.hasOwnProperty(d)) dateCounts[d] = stat.count; }); }
            if (timeChart) {
                timeChart.data.labels = dateLabels.map(d => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }));
                timeChart.data.datasets[0].data = dateLabels.map(d => dateCounts[d]);
                timeChart.update();
            }
        }

        function renderStars(rating) {
            let stars = '';
            for (let i = 1; i <= 5; i++) stars += `<i class="fas fa-star ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}"></i>`;
            return stars;
        }

        function renderReviews(items) {
            const tbody = document.getElementById('reviews-tbody');
            if (items.length === 0) { tbody.innerHTML = `<tr><td colspan="8" class="px-6 py-12 text-center text-slate-500">Chưa có đánh giá nào</td></tr>`; return; }
            tbody.innerHTML = items.map(review => {
                const statusColors = { pending: 'bg-amber-100 text-amber-700', approved: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-700' };
                const avatar = review.anh_dai_dien || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.ten_nguoi_dung)}&background=random`;
                const replyCount = review.reply_count || 0;
                return `
                    <tr class="hover:bg-slate-50">
                        <td class="px-4 py-4"><input type="checkbox" class="review-checkbox w-4 h-4 rounded" value="${review.ma_danh_gia}" onchange="updateSelection()"></td>
                        <td class="px-4 py-4"><div class="flex items-center space-x-3"><img src="${avatar}" class="w-10 h-10 rounded-full"><div><p class="font-medium text-slate-800 text-sm">${review.ten_nguoi_dung}</p></div></div></td>
                        <td class="px-4 py-4 text-sm text-slate-700 max-w-[150px] truncate">${review.ten_mon}</td>
                        <td class="px-4 py-4"><div class="flex">${renderStars(review.so_sao)}</div></td>
                        <td class="px-4 py-4 text-sm text-slate-600 max-w-[200px]"><p class="truncate">${review.binh_luan || ''}</p></td>
                        <td class="px-4 py-4 text-sm text-slate-500">${formatDate(review.ngay_danh_gia)}</td>
                        <td class="px-4 py-4"><span class="px-2 py-1 rounded-lg text-xs font-medium ${statusColors[review.trang_thai]}">${review.trang_thai}</span></td>
                        <td class="px-4 py-4">
                            <div class="flex space-x-1">
                                <button onclick="viewReview(${review.ma_danh_gia})" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><i class="fas fa-eye"></i></button>
                                <button onclick="toggleRepliesSection(${review.ma_danh_gia})" class="p-2 text-green-600 hover:bg-green-50 rounded-lg"><i class="fas fa-reply"></i></button>
                                <button onclick="deleteReview(${review.ma_danh_gia})" class="p-2 text-red-600 hover:bg-red-50 rounded-lg"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                    <tr id="replies-${review.ma_danh_gia}" class="hidden bg-green-50/50">
                        <td colspan="8" class="px-4 py-4">
                            <div class="bg-white rounded-lg border-2 border-green-200 p-4 ml-8">
                                <div id="replies-list-${review.ma_danh_gia}" class="space-y-3 mb-4"></div>
                                <div class="border-t pt-4">
                                    <textarea id="reply-input-${review.ma_danh_gia}" class="w-full border border-slate-300 rounded-lg p-3 text-sm" rows="3" placeholder="Nhập nội dung trả lời..."></textarea>
                                    <div class="flex justify-end mt-2"><button onclick="submitReplyInline(${review.ma_danh_gia})" class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Gửi trả lời</button></div>
                                </div>
                            </div>
                        </td>
                    </tr>`;
            }).join('');
        }

        async function toggleRepliesSection(reviewId) {
            const row = document.getElementById(`replies-${reviewId}`);
            if (row.classList.contains('hidden')) { row.classList.remove('hidden'); await loadRepliesInline(reviewId); }
            else row.classList.add('hidden');
        }

        async function loadRepliesInline(reviewId) {
            const list = document.getElementById(`replies-list-${reviewId}`);
            try {
                const res = await fetch(`${API_URL}/reviews/${reviewId}/replies`, { credentials: 'include' });
                const data = await res.json();
                if (data.success && data.data.length > 0) {
                    list.innerHTML = data.data.map(reply => `<div class="bg-green-50 border-l-4 border-green-500 p-3"><p class="font-semibold text-sm">Admin (${reply.ten_admin}) - ${formatDate(reply.ngay_tra_loi)}</p><p class="text-sm">${reply.noi_dung}</p><button onclick="deleteReply(${reply.ma_tra_loi}, ${reviewId})" class="text-red-600 text-xs mt-1">Xóa</button></div>`).join('');
                } else list.innerHTML = `<p class="text-sm text-slate-400">Chưa có phản hồi</p>`;
            } catch (e) { console.error(e); }
        }

        async function submitReplyInline(reviewId) {
            const content = document.getElementById(`reply-input-${reviewId}`).value.trim();
            if (!content) return alert('Nhập nội dung');
            try {
                const res = await fetch(`${API_URL}/reviews/${reviewId}/reply`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ noi_dung: content }) });
                if ((await res.json()).success) { document.getElementById(`reply-input-${reviewId}`).value = ''; await loadRepliesInline(reviewId); loadReviews(); }
            } catch (e) { console.error(e); }
        }

        async function deleteReply(replyId, reviewId) {
            if (!confirm('Xóa?')) return;
            try {
                const res = await fetch(`${API_URL}/reviews/replies/${replyId}`, { method: 'DELETE', credentials: 'include' });
                if ((await res.json()).success) { await loadRepliesInline(reviewId); loadReviews(); }
            } catch (e) { console.error(e); }
        }

        async function updateStatus(reviewId, status) {
            try {
                const res = await fetch(`${API_URL}/reviews/admin/${reviewId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ trang_thai: status }) });
                if ((await res.json()).success) loadReviews();
            } catch (e) { console.error(e); }
        }

        async function deleteReview(reviewId) {
            if (!confirm('Xóa đánh giá này?')) return;
            try {
                const res = await fetch(`${API_URL}/reviews/admin/${reviewId}`, { method: 'DELETE', credentials: 'include' });
                if ((await res.json()).success) loadReviews();
            } catch (e) { console.error(e); }
        }

        function viewReview(reviewId) {
            const review = reviews.find(r => r.ma_danh_gia === reviewId);
            if (!review) return;
            const avatar = review.anh_dai_dien || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.ten_nguoi_dung)}&background=random`;
            document.getElementById('review-detail').innerHTML = `
                <div class="space-y-4">
                    <div class="flex items-center space-x-4"><img src="${avatar}" class="w-16 h-16 rounded-full"><div><p class="font-bold">${review.ten_nguoi_dung}</p><p class="text-sm">${review.email || ''}</p></div><span class="ml-auto px-3 py-1 rounded-full text-sm bg-slate-100">${review.trang_thai}</span></div>
                    <div><p class="text-sm text-slate-500">Món ăn: <span class="font-medium text-slate-800">${review.ten_mon}</span></p></div>
                    <div class="flex">${renderStars(review.so_sao)} <span class="ml-4 text-slate-500">${formatDate(review.ngay_danh_gia)}</span></div>
                    <div class="bg-slate-50 p-4 rounded-xl"><p class="text-slate-700">${review.binh_luan || 'Không có nội dung'}</p></div>
                    <div class="flex gap-2 pt-4 border-t">
                        ${review.trang_thai !== 'approved' ? `<button onclick="updateStatus(${review.ma_danh_gia}, 'approved'); closeModal();" class="flex-1 bg-emerald-500 text-white py-2 rounded-xl">Duyệt</button>` : ''}
                        ${review.trang_thai !== 'rejected' ? `<button onclick="updateStatus(${review.ma_danh_gia}, 'rejected'); closeModal();" class="flex-1 bg-amber-500 text-white py-2 rounded-xl">Khóa</button>` : ''}
                        <button onclick="deleteReview(${review.ma_danh_gia}); closeModal();" class="flex-1 bg-red-500 text-white py-2 rounded-xl">Xóa</button>
                    </div>
                </div>`;
            document.getElementById('review-modal').classList.remove('hidden');
        }

        function toggleSelectAll() { const chk = document.getElementById('select-all').checked; document.querySelectorAll('.review-checkbox').forEach(cb => cb.checked = chk); updateSelection(); }
        function updateSelection() { selectedIds = Array.from(document.querySelectorAll('.review-checkbox:checked')).map(cb => parseInt(cb.value)); document.getElementById('bulk-actions').classList.toggle('hidden', selectedIds.length === 0); document.getElementById('selected-count').textContent = selectedIds.length; }
        async function bulkApprove() { if (confirm('Duyệt?')) bulkUpdateStatus('approved'); }
        async function bulkReject() { if (confirm('Khóa?')) bulkUpdateStatus('rejected'); }
        async function bulkUpdateStatus(status) { try { const res = await fetch(`${API_URL}/reviews/admin/bulk-status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ ids: selectedIds, trang_thai: status }) }); if ((await res.json()).success) { selectedIds = []; document.getElementById('select-all').checked = false; loadReviews(); } } catch (e) { console.error(e); } }
        async function bulkDelete() { if (confirm('Xóa?')) try { const res = await fetch(`${API_URL}/reviews/admin/bulk-delete`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ ids: selectedIds }) }); if ((await res.json()).success) { selectedIds = []; document.getElementById('select-all').checked = false; loadReviews(); } } catch (e) { console.error(e); } }
        function applyFilters() { const s = document.getElementById('search').value.toLowerCase(); const st = document.getElementById('status-filter').value; const star = document.getElementById('star-filter').value; renderReviews(reviews.filter(r => (!s || r.ten_nguoi_dung.toLowerCase().includes(s) || r.ten_mon.toLowerCase().includes(s)) && (!st || r.trang_thai === st) && (!star || r.so_sao == star))); }
        function resetFilters() { document.getElementById('search').value = ''; document.getElementById('status-filter').value = ''; document.getElementById('star-filter').value = ''; renderReviews(reviews); }
        function closeModal() { document.getElementById('review-modal').classList.add('hidden'); }
        function formatDate(d) { return new Date(d).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }); }

        initCharts();
        loadReviews();
