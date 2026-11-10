/* ==== Script 1 (tách từ /admin/quan-ly-thuat-toan/) ==== */
let algorithmData = null;
        
        document.addEventListener('DOMContentLoaded', () => {
            // Setup Tabs
            document.querySelectorAll('.algo-tab').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    // Remove active from all
                    document.querySelectorAll('.algo-tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.algo-tab-content').forEach(c => c.classList.remove('active'));
                    
                    // Set active to clicked
                    const target = e.currentTarget;
                    target.classList.add('active');
                    const targetId = target.getAttribute('data-target');
                    document.getElementById(targetId).classList.add('active');
                });
            });

            // Fetch data
            setTimeout(fetchAlgorithmData, 500);
        });

        async function fetchAlgorithmData() {
            document.getElementById('loadingState').classList.remove('hidden');
            document.getElementById('contentArea').classList.add('hidden');
            
            // Tải trọng số cấu hình trước
            await loadWeights();
            
            try {
                const res = await fetch('/api/recommendations/admin/algorithm-metrics', {
                    credentials: 'include'
                });
                
                if (!res.ok) throw new Error('Không thể tải dữ liệu thuật toán');
                
                const data = await res.json();
                if (data.success) {
                    algorithmData = data.data;
                    renderPopularity(algorithmData.popularity);
                    renderHybridUsersList(algorithmData.hybrid);
                    
                    document.getElementById('loadingState').classList.add('hidden');
                    document.getElementById('contentArea').classList.remove('hidden');
                }
            } catch (err) {
                console.error(err);
                document.getElementById('loadingState').innerHTML = `
                    <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                    <p class="text-red-500 font-medium">Lỗi khi tải dữ liệu thuật toán. Vui lòng thử lại sau.</p>
                `;
            }
        }

        async function loadWeights() {
            try {
                const res = await fetch('/api/recommendations/admin/popularity-weights', {
                    credentials: 'include'
                });
                const data = await res.json();
                if(data.success && data.data) {
                    document.getElementById('weight-orders').value = data.data.orders || 0;
                    document.getElementById('weight-clicks').value = data.data.clicks || 0;
                    document.getElementById('weight-views').value = data.data.views || 0;
                    document.getElementById('weight-rating').value = data.data.rating || 0;
                    document.getElementById('weight-likes').value = data.data.likes || 0;
                }
            } catch(e) {
                console.error('Lỗi load weights', e);
            }
        }

        async function saveWeights() {
            const btn = event.currentTarget;
            const originalHtml = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
            btn.disabled = true;

            const newWeights = {
                orders: parseInt(document.getElementById('weight-orders').value) || 0,
                clicks: parseInt(document.getElementById('weight-clicks').value) || 0,
                views: parseInt(document.getElementById('weight-views').value) || 0,
                rating: parseInt(document.getElementById('weight-rating').value) || 0,
                likes: parseInt(document.getElementById('weight-likes').value) || 0
            };

            try {
                const res = await fetch('/api/recommendations/admin/popularity-weights', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newWeights),
                    credentials: 'include'
                });
                const data = await res.json();
                if(data.success) {
                    alert('Lưu cấu hình trọng số thành công! Dữ liệu đã được tính toán lại.');
                    fetchAlgorithmData(); // refresh data
                } else {
                    alert('Lưu thất bại: ' + (data.message || 'Lỗi server'));
                }
            } catch(e) {
                console.error(e);
                alert('Lỗi kết nối');
            } finally {
                btn.innerHTML = originalHtml;
                btn.disabled = false;
            }
        }

        function formatCurrency(amount) {
            return new Intl.NumberFormat('vi-VN').format(amount || 0) + 'đ';
        }

        // ==========================================
        // 1. RENDER POPULARITY
        // ==========================================
        function renderPopularity(data) {
            const container = document.getElementById('popularityContainer');
            if(!data || data.length === 0) {
                container.innerHTML = `<div class="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">Không có dữ liệu phổ biến.</div>`;
                return;
            }

            let html = `<div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                            <th class="py-3 px-4 font-semibold w-16 text-center">#</th>
                            <th class="py-3 px-4 font-semibold">Món Ăn</th>
                            <th class="py-3 px-4 font-semibold text-center">Lượt Mua</th>
                            <th class="py-3 px-4 font-semibold text-center">Lượt Click</th>
                            <th class="py-3 px-4 font-semibold text-center">Lượt Xem (>50s)</th>
                            <th class="py-3 px-4 font-semibold text-center">Lượt Tim</th>
                            <th class="py-3 px-4 font-semibold text-center">Đánh Giá</th>
                            <th class="py-3 px-4 font-semibold text-right">Điểm Phổ Biến (Score)</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">`;
            
            data.forEach((item, index) => {
                let rankColor = "text-slate-400";
                if(index === 0) rankColor = "text-yellow-500 font-bold";
                if(index === 1) rankColor = "text-slate-300 font-bold";
                if(index === 2) rankColor = "text-amber-700 font-bold";

                // Tách avatar và tên tài khoản tác động
                let usersHtml = '';
                if (item.interacting_users && item.interacting_users.length > 0) {
                    usersHtml = `
                        <div class="flex items-center gap-1 mt-1 flex-wrap">
                            <span class="text-[10px] text-slate-400">Tương tác gần đây:</span>
                            <div class="flex -space-x-1.5 overflow-hidden">
                                ${item.interacting_users.map(u => {
                                    const uAvatar = u.anh_dai_dien || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.ten_nguoi_dung || 'U')}&background=random&color=fff`;
                                    let actionText = 'xem';
                                    let actionColor = 'border-purple-300';
                                    if (u.hanh_vi === 'purchase' || u.hanh_vi === 'order') { actionText = 'mua'; actionColor = 'border-blue-300'; }
                                    else if (u.hanh_vi === 'click') { actionText = 'click'; actionColor = 'border-amber-300'; }
                                    else if (u.hanh_vi === 'like') { actionText = 'thích'; actionColor = 'border-red-300'; }
                                    return `<img class="inline-block h-5 w-5 rounded-full border ${actionColor}" src="${uAvatar}" title="${u.ten_nguoi_dung} (${actionText})">`;
                                }).join('')}
                            </div>
                        </div>
                    `;
                } else {
                    usersHtml = `<div class="text-[10px] text-slate-400 italic">Chưa có lượt tương tác</div>`;
                }

                html += `
                    <tr class="hover:bg-slate-50 transition">
                        <td class="py-3 px-4 text-center text-lg ${rankColor}">${index+1}</td>
                        <td class="py-3 px-4">
                            <div class="font-medium text-slate-800">${item.ten_mon}</div>
                            <div class="text-xs text-slate-400">${item.ten_danh_muc || ''}</div>
                            ${usersHtml}
                        </td>
                        <td class="py-3 px-4 text-center">
                            <span class="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-medium">
                                <i class="fas fa-shopping-cart"></i> ${item.order_count || 0}
                            </span>
                        </td>
                        <td class="py-3 px-4 text-center">
                            <span class="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-medium">
                                <i class="fas fa-mouse-pointer text-[10px]"></i> ${item.click_count || 0}
                            </span>
                        </td>
                        <td class="py-3 px-4 text-center">
                            <span class="inline-flex items-center gap-1 bg-purple-50 text-purple-600 px-2 py-1 rounded text-xs font-medium">
                                <i class="fas fa-eye"></i> ${item.view_count || 0}
                            </span>
                        </td>
                        <td class="py-3 px-4 text-center">
                            <span class="inline-flex items-center gap-1 bg-red-50 text-red-500 px-2 py-1 rounded text-xs font-medium">
                                <i class="fas fa-heart"></i> ${item.like_count || 0}
                            </span>
                        </td>
                        <td class="py-3 px-4 text-center text-yellow-500 font-medium">
                            <i class="fas fa-star"></i> ${Number(item.avg_rating || 0).toFixed(1)}
                        </td>
                        <td class="py-3 px-4 text-right">
                            <div class="inline-flex items-center justify-end gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold w-24">
                                <i class="fas fa-fire"></i> ${Number(item.popularity_score||0).toFixed(1)}
                            </div>
                        </td>
                    </tr>
                `;
            });

            html += `</tbody></table></div>`;
            container.innerHTML = html;
        }

        // (Xóa RENDER CONTENT-BASED theo yêu cầu)

        // ==========================================
        // 3. RENDER HYBRID
        // ==========================================
        function renderHybridUsersList(hybridData) {
            const listContainer = document.getElementById('hybridUsersList');
            if (!hybridData || hybridData.length === 0) {
                listContainer.innerHTML = '<div class="p-4 text-center text-slate-400">Chưa có dữ liệu</div>';
                return;
            }

            let html = '';
            hybridData.forEach((item, idx) => {
                const u = item.user;
                let avatar = u.anh_dai_dien || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.ten_nguoi_dung || 'U')}&background=8b5cf6&color=fff`;
                
                // Determine active state initially
                html += `
                    <button class="w-full text-left p-3 rounded-lg flex items-center gap-3 transition hover:bg-purple-50 border border-transparent focus:outline-none user-hybrid-btn"
                            onclick="selectHybridUser(${idx}, this)" data-idx="${idx}">
                        <img src="${avatar}" class="w-10 h-10 rounded-full bg-slate-200">
                        <div class="flex-1 overflow-hidden">
                            <div class="font-bold text-slate-800 text-sm truncate">${u.ten_nguoi_dung || 'Khách hàng'}</div>
                            <div class="text-xs text-slate-500">Gợi ý: ${item.recommendations.length} món</div>
                        </div>
                        <i class="fas fa-chevron-right text-slate-300 text-xs"></i>
                    </button>
                `;
            });
            listContainer.innerHTML = html;

            // Select first user by default
            if(hybridData.length > 0) {
                const firstBtn = listContainer.querySelector('.user-hybrid-btn');
                if(firstBtn) selectHybridUser(0, firstBtn);
            }
        }

        function selectHybridUser(dataIndex, btnElement) {
            // Update active state on buttons
            document.querySelectorAll('.user-hybrid-btn').forEach(btn => {
                btn.classList.remove('bg-purple-100', 'border-purple-200');
                btn.classList.add('hover:bg-purple-50', 'border-transparent');
            });
            btnElement.classList.remove('hover:bg-purple-50', 'border-transparent');
            btnElement.classList.add('bg-purple-100', 'border-purple-200');

            const item = algorithmData.hybrid[dataIndex];
            document.getElementById('hybridUserBadge').textContent = item.user.ten_nguoi_dung || `User ${item.user.ma_nguoi_dung}`;

            renderHybridResults(item.recommendations);
        }

        function renderHybridResults(recs) {
            const container = document.getElementById('hybridResultsContainer');
            if (!recs || recs.length === 0) {
                container.innerHTML = '<div class="h-full flex items-center justify-center text-slate-400">Không có gợi ý nào cho khách hàng này</div>';
                return;
            }

            let html = '<div class="space-y-4">';
            recs.forEach((rec, idx) => {
                // Determine Type & Icon
                let typeText = 'Không xác định';
                let typeColor = 'bg-slate-100 text-slate-600';
                let typeIcon = 'fas fa-question';
                let scoreColor = 'bg-slate-500';
                
                // Color scaling based on score (100 -> 0)
                let pct = Math.min(100, Math.max(0, rec.score || 0));

                if (rec.recommendation_type === 'content_based') {
                    typeText = 'Vì đúng sở thích';
                    typeColor = 'bg-blue-100 text-blue-700';
                    typeIcon = 'fas fa-heart';
                    scoreColor = 'bg-blue-500';
                } else if (rec.recommendation_type === 'collaborative') {
                    typeText = 'Vì người giống họ cũng mua';
                    typeColor = 'bg-indigo-100 text-indigo-700';
                    typeIcon = 'fas fa-users';
                    scoreColor = 'bg-indigo-500';
                } else if (rec.recommendation_type === 'trending') {
                    typeText = 'Vì món đang bán rất chạy';
                    typeColor = 'bg-orange-100 text-orange-700';
                    typeIcon = 'fas fa-fire';
                    scoreColor = 'bg-orange-500';
                }

                let imgPath = rec.anh_mon || '../images/placeholder.jpg';
                if(!imgPath.startsWith('http') && !imgPath.startsWith('/')) imgPath = '/' + imgPath;

                html += `
                    <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 transition hover:shadow-md">
                        <div class="w-8 font-black text-slate-300 text-xl text-center">#${idx+1}</div>
                        <img src="${imgPath}" class="w-16 h-16 rounded-lg object-cover border border-slate-100">
                        
                        <div class="flex-1 min-w-0">
                            <h4 class="font-bold text-slate-800 text-base truncate">${rec.ten_mon}</h4>
                            <div class="flex items-center gap-2 mt-1">
                                <span class="text-[10px] font-bold px-2 py-0.5 rounded ${typeColor}">
                                    <i class="${typeIcon} mr-1"></i> ${typeText}
                                </span>
                            </div>
                            <p class="text-xs text-slate-500 mt-2 truncate italic">"${rec.reason || 'Được hệ thống tổng hợp'}"</p>
                        </div>
                        
                        <div class="w-32 flex flex-col items-end gap-1">
                            <span class="text-2xl font-black text-slate-800">${Number(rec.score||0).toFixed(1)}</span>
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ĐIỂM PHÙ HỢP</span>
                            <div class="w-full bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                                <div class="h-full ${scoreColor} score-bar" style="width: ${pct}%"></div>
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            
            // Set HTML
            container.innerHTML = html;
        }
