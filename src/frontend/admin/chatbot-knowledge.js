/* ==== Script 1 (tách từ chatbot-knowledge.html) ==== */
let allKnowledge = [];
        let filteredKnowledge = [];

        // Load knowledge when document loaded
        document.addEventListener('DOMContentLoaded', () => {
            loadKnowledge();
        });

        // Load knowledge list from API
        async function loadKnowledge() {
            const container = document.getElementById('knowledge-container');
            try {
                const res = await fetch(`${API_URL}/chatbot-knowledge`, { credentials: 'include' });
                const json = await res.json();
                
                if (json.success) {
                    allKnowledge = json.data || [];
                    filteredKnowledge = [...allKnowledge];
                    renderKnowledge();
                } else {
                    container.innerHTML = `
                        <div class="col-span-full py-12 text-center text-red-500 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
                            <p class="font-medium">${json.message || 'Không thể tải tri thức'}</p>
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Error fetching chatbot knowledge:', error);
                container.innerHTML = `
                    <div class="col-span-full py-12 text-center text-red-500 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
                        <p class="font-medium">Lỗi kết nối máy chủ. Vui lòng kiểm tra lại.</p>
                    </div>
                `;
            }
        }

        // Render knowledge items as beautiful cards
        function renderKnowledge() {
            const container = document.getElementById('knowledge-container');
            
            if (filteredKnowledge.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-100">
                        <i class="fas fa-folder-open text-4xl text-slate-300 mb-3"></i>
                        <p class="text-slate-500 text-sm">Không tìm thấy tài liệu tri thức nào</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = filteredKnowledge.map(item => {
                const updatedDate = new Date(item.ngay_cap_nhat).toLocaleString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });

                return `
                    <div class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-slate-100 hover:border-amber-200 transition-all flex flex-col justify-between group">
                        <div>
                            <div class="flex items-center justify-between mb-3">
                                <h4 class="font-bold text-slate-800 text-base group-hover:text-amber-700 transition truncate pr-4" title="${escapeHtml(item.tieu_de)}">
                                    ${escapeHtml(item.tieu_de)}
                                </h4>
                                <span class="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-mono">ID: ${item.id}</span>
                            </div>
                            <div class="text-slate-600 text-sm leading-relaxed whitespace-pre-line mb-4 max-h-[160px] overflow-y-auto pr-1 select-text">
                                ${escapeHtml(item.noi_dung)}
                            </div>
                        </div>
                        <div class="flex items-center justify-between pt-4 border-t border-slate-50 mt-2">
                            <span class="text-xs text-slate-400 flex items-center gap-1.5">
                                <i class="far fa-clock"></i> Cập nhật: ${updatedDate}
                            </span>
                            <div class="flex items-center gap-1.5">
                                <button onclick="openEditModal(${JSON.stringify(item).replace(/"/g, '&quot;')})" class="p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition" title="Sửa tài liệu">
                                    <i class="fas fa-edit text-sm"></i>
                                </button>
                                <button onclick="deleteKnowledge(${item.id})" class="p-2 rounded-xl text-red-600 hover:bg-red-50 transition" title="Xóa tài liệu">
                                    <i class="fas fa-trash-alt text-sm"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Handle Search
        function handleSearch() {
            const query = document.getElementById('search-input').value.trim().toLowerCase();
            if (!query) {
                filteredKnowledge = [...allKnowledge];
            } else {
                filteredKnowledge = allKnowledge.filter(item => 
                    item.tieu_de.toLowerCase().includes(query) || 
                    item.noi_dung.toLowerCase().includes(query)
                );
            }
            renderKnowledge();
        }

        // Modal Open/Close
        function openAddModal() {
            document.getElementById('knowledge-id').value = '';
            document.getElementById('tieu_de').value = '';
            document.getElementById('noi_dung').value = '';
            document.getElementById('modal-title').querySelector('span').textContent = 'Thêm tài liệu tri thức';
            
            const modal = document.getElementById('knowledge-modal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            setTimeout(() => {
                document.getElementById('modal-card').classList.remove('scale-95');
                document.getElementById('modal-card').classList.add('scale-100');
            }, 10);
        }

        function openEditModal(item) {
            document.getElementById('knowledge-id').value = item.id;
            document.getElementById('tieu_de').value = item.tieu_de;
            document.getElementById('noi_dung').value = item.noi_dung;
            document.getElementById('modal-title').querySelector('span').textContent = 'Sửa tài liệu tri thức';
            
            const modal = document.getElementById('knowledge-modal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            setTimeout(() => {
                document.getElementById('modal-card').classList.remove('scale-95');
                document.getElementById('modal-card').classList.add('scale-100');
            }, 10);
        }

        function closeModal() {
            const card = document.getElementById('modal-card');
            card.classList.remove('scale-100');
            card.classList.add('scale-95');
            setTimeout(() => {
                const modal = document.getElementById('knowledge-modal');
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }, 150);
        }

        // Add/Update Form Submit Handler
        async function handleSubmit(e) {
            e.preventDefault();
            const id = document.getElementById('knowledge-id').value;
            const tieu_de = document.getElementById('tieu_de').value.trim();
            const noi_dung = document.getElementById('noi_dung').value.trim();

            if (!tieu_de || !noi_dung) {
                alert('Vui lòng điền đầy đủ tiêu đề và nội dung!');
                return;
            }

            const method = id ? 'PUT' : 'POST';
            const url = id ? `${API_URL}/chatbot-knowledge/${id}` : `${API_URL}/chatbot-knowledge`;
            
            try {
                const res = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tieu_de, noi_dung }),
                    credentials: 'include'
                });
                
                const json = await res.json();
                
                if (json.success) {
                    closeModal();
                    loadKnowledge();
                } else {
                    alert(json.message || 'Lưu thất bại');
                }
            } catch (error) {
                console.error('Error saving knowledge:', error);
                alert('Lỗi kết nối máy chủ!');
            }
        }

        // Delete Knowledge
        async function deleteKnowledge(id) {
            if (!confirm('Bạn có chắc chắn muốn xóa tài liệu tri thức này? Chatbot sẽ không thể tìm thấy ngữ cảnh này nữa.')) {
                return;
            }

            try {
                const res = await fetch(`${API_URL}/chatbot-knowledge/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                const json = await res.json();
                
                if (json.success) {
                    loadKnowledge();
                } else {
                    alert(json.message || 'Xóa thất bại');
                }
            } catch (error) {
                console.error('Error deleting knowledge:', error);
                alert('Lỗi kết nối máy chủ!');
            }
        }

        // Utility to escape HTML
        function escapeHtml(text) {
            if (!text) return '';
            return text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }
