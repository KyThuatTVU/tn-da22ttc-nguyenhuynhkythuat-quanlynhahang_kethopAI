/* ==== Script 1 (tách từ news.html) ==== */
document.addEventListener('DOMContentLoaded', () => {
            window.newsDraftManager = new FormDraftManager('news-form');
        });

        let newsList = [];

        async function loadNews() {
            try {
                const response = await fetch(`${API_URL}/news/admin/all`, { credentials: 'include' });
                if (!response.ok) {
                    if (response.status === 401) { window.location.href = 'dang-nhap-admin.html'; return; }
                    throw new Error(`HTTP ${response.status}`);
                }
                const data = await response.json();
                newsList = data.data || [];
                renderNews(newsList);
                restoreUiState();
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('news-container').innerHTML = `<div class="text-center py-12"><i class="fas fa-exclamation-circle text-4xl text-red-400 mb-4"></i><p class="text-slate-500">Lỗi tải dữ liệu</p></div>`;
            }
        }

        function renderNews(items) {
            const container = document.getElementById('news-container');
            if (items.length === 0) { container.innerHTML = `<div class="text-center py-12"><i class="fas fa-newspaper text-4xl text-slate-300 mb-4"></i><p class="text-slate-500">Chưa có bài viết</p></div>`; return; }
            container.innerHTML = items.map(news => `
                <div class="content-card overflow-hidden hover:shadow-lg transition p-0 mb-4">
                    <div class="flex flex-col sm:flex-row">
                        <div class="w-full sm:w-48 h-48 sm:h-32 flex-shrink-0">
                            <img src="${API_URL.replace('/api', '')}/${news.anh_dai_dien || 'images/default.jpg'}" class="w-full h-full object-cover">
                        </div>
                        <div class="flex-1 p-5">
                            <div class="flex items-start justify-between">
                                <div class="flex-1">
                                    <h4 class="font-bold text-lg mb-2 text-slate-800 line-clamp-1">${news.tieu_de}</h4>
                                    <p class="text-sm text-slate-600 mb-3 line-clamp-2">${news.tom_tat || '...'}</p>
                                    <div class="flex items-center space-x-4 text-sm text-slate-500">
                                        <span><i class="fas fa-calendar mr-1"></i>${news.ngay_dang ? new Date(news.ngay_dang).toLocaleDateString('vi-VN') : 'N/A'}</span>
                                        <span><i class="fas fa-eye mr-1"></i>${news.luot_xem || 0}</span>
                                    </div>
                                </div>
                                <div class="ml-4 flex flex-col items-end space-y-2">
                                    <span class="px-3 py-1 rounded-full text-xs font-medium ${news.trang_thai == 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}">${news.trang_thai == 1 ? 'Đã đăng' : 'Đã ẩn'}</span>
                                    <div class="flex space-x-2">
                                        <button onclick="editNews(${news.ma_tin_tuc})" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><i class="fas fa-edit"></i></button>
                                        <button onclick="deleteNews(${news.ma_tin_tuc})" class="p-2 text-red-600 hover:bg-red-50 rounded-lg"><i class="fas fa-trash"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        function restoreUiState() {
            const state = JSON.parse(sessionStorage.getItem('adminUiState_news') || '{}');
            if (state.action === 'add') openAddModal(true);
            else if (state.action === 'edit' && state.id) editNews(state.id, true);
        }

        function openAddModal(auto = false) {
            document.getElementById('modal-title').textContent = 'Thêm bài viết mới';
            document.getElementById('news-form').reset();
            document.getElementById('news-id').value = '';
            if (window.newsDraftManager) { 
                window.newsDraftManager.setContext('new'); 
                if (auto && window.newsDraftManager.hasDraft()) {
                    window.newsDraftManager.restore(); 
                } else if (!auto) {
                    window.newsDraftManager.clear();
                }
            }
            document.getElementById('news-modal').classList.remove('hidden');
            if (!auto) sessionStorage.setItem('adminUiState_news', JSON.stringify({ action: 'add' }));
        }

        function closeModal() { document.getElementById('news-modal').classList.add('hidden'); sessionStorage.removeItem('adminUiState_news'); }

        function editNews(id, auto = false) {
            const news = newsList.find(n => n.ma_tin_tuc === id);
            if (!news) { sessionStorage.removeItem('adminUiState_news'); return; }
            document.getElementById('modal-title').textContent = 'Chỉnh sửa bài viết';
            document.getElementById('news-id').value = news.ma_tin_tuc;
            if (window.newsDraftManager) window.newsDraftManager.setContext(id);
            document.getElementById('tieu_de').value = news.tieu_de || '';
            document.getElementById('tom_tat').value = news.tom_tat || '';
            document.getElementById('noi_dung').value = news.noi_dung || '';
            document.getElementById('trang_thai').value = news.trang_thai ?? 1;
            document.getElementById('news-modal').classList.remove('hidden');
            if (!auto) sessionStorage.setItem('adminUiState_news', JSON.stringify({ action: 'edit', id: id }));
            if (window.newsDraftManager) {
                if (auto && window.newsDraftManager.hasDraft()) {
                    window.newsDraftManager.restore();
                } else if (!auto) {
                    window.newsDraftManager.clear();
                }
            }
        }

        async function deleteNews(id) {
            if (!confirm('Xác nhận xóa?')) return;
            try {
                const res = await fetch(`${API_URL}/news/${id}`, { method: 'DELETE', credentials: 'include' });
                if (res.ok) loadNews();
            } catch (e) { alert('Lỗi xóa'); }
        }

        document.getElementById('news-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('news-id').value;
            const formData = new FormData(e.target);
            const file = document.getElementById('anh_dai_dien').files[0];
            if (file) formData.append('anh_dai_dien', file);
            try {
                const res = await fetch(id ? `${API_URL}/news/${id}` : `${API_URL}/news`, { method: id ? 'PUT' : 'POST', body: formData, credentials: 'include' });
                if (res.ok) { if (window.newsDraftManager) window.newsDraftManager.clear(); closeModal(); loadNews(); }
            } catch (e) { alert('Lỗi lưu'); }
        });

        function applyFilters() {
            const s = document.getElementById('search').value.toLowerCase();
            const st = document.getElementById('status-filter').value;
            renderNews(newsList.filter(n => n.tieu_de.toLowerCase().includes(s) && (st === '' || n.trang_thai == st)));
        }

        loadNews();
