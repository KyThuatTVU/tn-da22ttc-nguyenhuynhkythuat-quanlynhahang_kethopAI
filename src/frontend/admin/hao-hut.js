/* ==== Script 1 (tách từ hao-hut.html) ==== */
let wastageList = [];
        const BACKEND_URL = 'http://localhost:3000'; // Base URL for images

        async function loadWastage() {
            try {
                const res = await fetch(`${API_URL}/wastage`, { credentials: 'include' });
                const result = await res.json();
                if (result.success) {
                    wastageList = result.data;
                    renderWastage(wastageList);
                } else {
                    document.getElementById('wastage-container').innerHTML = `<div class="col-span-full text-center py-20 text-red-500"><i class="fas fa-exclamation-circle text-2xl"></i><br>Lỗi: ${result.message}</div>`;
                }
            } catch (err) {
                console.error(err);
                document.getElementById('wastage-container').innerHTML = `<div class="col-span-full text-center py-20 text-red-500"><i class="fas fa-wifi text-2xl"></i><br>Lỗi kết nối máy chủ!</div>`;
            }
        }

        function renderWastage(items) {
            const container = document.getElementById('wastage-container');
            if (items.length === 0) {
                container.innerHTML = `<div class="col-span-full bg-white rounded-2xl shadow-sm border border-dashed border-slate-300 py-20 text-center">
                    <i class="fas fa-box-open text-4xl text-slate-300 mb-3"></i>
                    <p class="text-slate-500">Không tìm thấy báo cáo nào</p>
                </div>`;
                return;
            }

            container.innerHTML = items.map(report => {
                const date = new Date(report.thoi_gian).toLocaleString('vi-VN', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });
                
                const imgPath = report.hinh_anh ? `${BACKEND_URL}/${report.hinh_anh}` : null;
                const imgPlaceholder = '../images/no-image.png';

                return `
                    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition">
                        <div class="p-4 flex items-center space-x-3 border-b border-slate-50">
                            <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                <i class="fas fa-dumpster text-sm"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h3 class="font-bold text-slate-800 truncate">${report.ten_nguyen_lieu}</h3>
                                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">${date}</p>
                            </div>
                        </div>
                        <div class="relative bg-slate-100 group aspect-video">
                            ${imgPath ? `
                                <img src="${imgPath}" alt="${report.ten_nguyen_lieu}" class="w-full h-full object-cover cursor-zoom-in" onclick="openImageModal('${imgPath}')">
                                <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none">
                                    <i class="fas fa-search-plus text-white text-3xl"></i>
                                </div>
                            ` : `
                                <div class="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                    <i class="fas fa-image text-3xl mb-1"></i>
                                    <span class="text-xs italic">Không có ảnh bằng chứng</span>
                                </div>
                            `}
                        </div>
                        <div class="p-4 space-y-3">
                            <div class="flex justify-between items-baseline">
                                <span class="text-xs text-slate-500">Số lượng hao hụt:</span>
                                <span class="font-bold text-red-600 text-lg">${parseFloat(report.so_luong_hao_hut).toLocaleString('vi-VN')} <span class="text-[10px] uppercase">${report.don_vi_tinh}</span></span>
                            </div>
                            <div class="bg-slate-50 p-3 rounded-xl">
                                <p class="text-xs text-slate-400 font-bold uppercase mb-1 tracking-tighter">Lý do:</p>
                                <p class="text-sm text-slate-700 italic leading-snug">"${report.ly_do || 'Không có lý do chi tiết'}"</p>
                            </div>
                            <div class="pt-2 border-t border-slate-50 flex items-center justify-between">
                                <div class="flex items-center space-x-2">
                                    <div class="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px]">
                                        <i class="fas fa-user"></i>
                                    </div>
                                    <span class="text-[10px] text-slate-500 font-medium">Báo cáo bởi: <span class="text-slate-800 font-bold">${report.ten_nhan_vien || 'Hệ thống'}</span></span>
                                </div>
                                <span class="text-[10px] px-2 py-1 bg-red-100 text-red-700 rounded-lg font-bold uppercase">-${parseFloat(report.so_luong_hao_hut).toLocaleString('vi-VN')} ${report.don_vi_tinh} Tồn kho</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function applyFilters() {
            const search = document.getElementById('search-wastage').value.toLowerCase();
            const from = document.getElementById('date-from').value;
            const to = document.getElementById('date-to').value;

            let filtered = wastageList.filter(w => {
                const matchesSearch = w.ten_nguyen_lieu.toLowerCase().includes(search);
                const wDate = new Date(w.thoi_gian).toISOString().split('T')[0];
                const matchesFrom = from ? wDate >= from : true;
                const matchesTo = to ? wDate <= to : true;
                return matchesSearch && matchesFrom && matchesTo;
            });

            renderWastage(filtered);
        }

        function openImageModal(url) {
            const modal = document.getElementById('image-modal');
            const content = document.getElementById('image-modal-content');
            content.src = url;
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function closeImageModal() {
            const modal = document.getElementById('image-modal');
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }

        // Initialize
        loadWastage();
