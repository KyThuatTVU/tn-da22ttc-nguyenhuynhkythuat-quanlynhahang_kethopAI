/* ==== Script 1 (tách từ contacts.html) ==== */
let contacts = [];
        let currentPage = 1;
        const limit = 10;

        async function loadContacts(page = 1) {
            try {
                const status = document.getElementById('status-filter').value;
                const search = document.getElementById('search').value;
                let url = `${API_URL}/contact?page=${page}&limit=${limit}`;
                if (status) url += `&trang_thai=${status}`;
                if (search) url += `&search=${encodeURIComponent(search)}`;
                
                const response = await fetch(url, { credentials: 'include' });
                const result = await response.json();
                if (result.success) {
                    contacts = result.data || [];
                    renderContacts(contacts);
                    renderPagination(result.pagination);
                    loadStats();
                }
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('contacts-tbody').innerHTML = `<tr><td colspan="6" class="px-6 py-12 text-center text-red-500"><i class="fas fa-exclamation-circle text-2xl mb-2"></i><br>Không thể tải dữ liệu</td></tr>`;
            }
        }

        async function loadStats() {
            try {
                const response = await fetch(`${API_URL}/contact/stats/summary`, { credentials: 'include' });
                const result = await response.json();
                if (result.success) {
                    document.getElementById('total-contacts').textContent = result.data.total || 0;
                    document.getElementById('new-contacts').textContent = result.data.new_count || 0;
                    document.getElementById('read-contacts').textContent = result.data.read_count || 0;
                    document.getElementById('replied-contacts').textContent = result.data.replied_count || 0;
                }
            } catch (error) { console.error('Error loading stats:', error); }
        }

        function getStatusBadge(status) {
            const badges = {
                'new': '<span class="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">Chưa đọc</span>',
                'read': '<span class="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Đã đọc</span>',
                'replied': '<span class="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Đã phản hồi</span>'
            };
            return badges[status] || badges['new'];
        }

        function renderContacts(items) {
            const tbody = document.getElementById('contacts-tbody');
            if (items.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-12 text-center text-slate-500">Chưa có liên hệ nào</td></tr>`;
                return;
            }
            tbody.innerHTML = items.map(c => `
                <tr class="hover:bg-slate-50 ${c.trang_thai === 'new' ? 'bg-orange-50/50' : ''}">
                    <td class="px-4 py-4">
                        <div><p class="font-medium text-slate-800">${c.ho_ten}</p><p class="text-xs text-slate-500">${c.email}</p><p class="text-xs text-slate-400">${c.so_dien_thoai || ''}</p></div>
                    </td>
                    <td class="px-4 py-4 text-sm text-slate-700 hidden md:table-cell">${c.tieu_de || 'Câu hỏi chung'}</td>
                    <td class="px-4 py-4 text-sm text-slate-600 max-w-xs truncate">${c.noi_dung.substring(0, 80)}${c.noi_dung.length > 80 ? '...' : ''}</td>
                    <td class="px-4 py-4 text-sm text-slate-500 hidden sm:table-cell">${new Date(c.ngay_gui).toLocaleDateString('vi-VN')}</td>
                    <td class="px-4 py-4">${getStatusBadge(c.trang_thai)}</td>
                    <td class="px-4 py-4">
                        <div class="flex space-x-1">
                            <button onclick="viewDetail(${c.ma_lien_he})" class="p-2 rounded-lg text-blue-600 hover:bg-blue-50" title="Xem chi tiết"><i class="fas fa-eye"></i></button>
                            <button onclick="updateStatus(${c.ma_lien_he}, 'replied')" class="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50" title="Đánh dấu đã phản hồi"><i class="fas fa-reply"></i></button>
                            <button onclick="deleteContact(${c.ma_lien_he})" class="p-2 rounded-lg text-red-600 hover:bg-red-50" title="Xóa"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        function renderPagination(pagination) {
            if (!pagination || pagination.totalPages <= 1) {
                document.getElementById('pagination').innerHTML = '';
                return;
            }
            let html = '';
            for (let i = 1; i <= pagination.totalPages; i++) {
                html += `<button onclick="loadContacts(${i})" class="px-4 py-2 rounded-lg ${i === pagination.page ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">${i}</button>`;
            }
            document.getElementById('pagination').innerHTML = html;
        }

        async function viewDetail(id) {
            try {
                const response = await fetch(`${API_URL}/contact/${id}`, { credentials: 'include' });
                const result = await response.json();
                if (result.success) {
                    const c = result.data;
                    // Mark as read
                    if (c.trang_thai === 'new') {
                        await updateStatus(id, 'read', false);
                    }
                    
                    let imagesHtml = '';
                    if (c.hinh_anh) {
                        const images = c.hinh_anh.split(',');
                        imagesHtml = `<div class="mt-4"><p class="font-semibold text-slate-700 mb-2">Hình ảnh đính kèm:</p><div class="grid grid-cols-3 gap-2">${images.map(img => `<a href="${API_URL.replace('/api', '')}${img}" target="_blank"><img src="${API_URL.replace('/api', '')}${img}" class="w-full h-24 object-cover rounded-lg hover:opacity-80"></a>`).join('')}</div></div>`;
                    }
                    
                    document.getElementById('modal-content').innerHTML = `
                        <div class="space-y-4">
                            <div class="grid grid-cols-2 gap-4">
                                <div class="col-span-2 sm:col-span-1"><p class="text-sm text-slate-500">Họ tên</p><p class="font-medium">${c.ho_ten}</p></div>
                                <div class="col-span-2 sm:col-span-1"><p class="text-sm text-slate-500">Email</p><p class="font-medium">${c.email}</p></div>
                                <div class="col-span-2 sm:col-span-1"><p class="text-sm text-slate-500">Số điện thoại</p><p class="font-medium">${c.so_dien_thoai || 'N/A'}</p></div>
                                <div class="col-span-2 sm:col-span-1"><p class="text-sm text-slate-500">Chủ đề</p><p class="font-medium">${c.tieu_de || 'Câu hỏi chung'}</p></div>
                                <div class="col-span-2 sm:col-span-1"><p class="text-sm text-slate-500">Ngày gửi</p><p class="font-medium">${new Date(c.ngay_gui).toLocaleString('vi-VN')}</p></div>
                                <div class="col-span-2 sm:col-span-1"><p class="text-sm text-slate-500">Trạng thái</p>${getStatusBadge(c.trang_thai)}</div>
                            </div>
                            <div><p class="text-sm text-slate-500 mb-2">Nội dung</p><div class="bg-slate-50 p-4 rounded-xl text-slate-700 whitespace-pre-wrap">${c.noi_dung}</div></div>
                            ${imagesHtml}
                            <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
                                <button onclick="updateStatus(${c.ma_lien_he}, 'replied')" class="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl hover:bg-emerald-700 mt-2 sm:mt-0"><i class="fas fa-reply mr-2"></i>Đánh dấu đã phản hồi</button>
                                <a href="mailto:${c.email}?subject=Re: ${c.tieu_de || 'Liên hệ từ website'}" class="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 text-center"><i class="fas fa-envelope mr-2"></i>Gửi email</a>
                            </div>
                        </div>
                    `;
                    document.getElementById('detail-modal').classList.remove('hidden');
                    document.getElementById('detail-modal').classList.add('flex');
                }
            } catch (error) { console.error('Error:', error); alert('Không thể tải chi tiết'); }
        }

        function closeModal() {
            document.getElementById('detail-modal').classList.add('hidden');
            document.getElementById('detail-modal').classList.remove('flex');
        }

        async function updateStatus(id, status, reload = true) {
            try {
                await fetch(`${API_URL}/contact/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ trang_thai: status }),
                    credentials: 'include'
                });
                if (reload) {
                    loadContacts(currentPage);
                    closeModal();
                }
            } catch (error) { console.error('Error:', error); }
        }

        async function deleteContact(id) {
            if (!confirm('Bạn có chắc muốn xóa liên hệ này?')) return;
            try {
                const response = await fetch(`${API_URL}/contact/${id}`, { method: 'DELETE', credentials: 'include' });
                if ((await response.json()).success) {
                    loadContacts(currentPage);
                    alert('Xóa thành công!');
                }
            } catch (error) { console.error('Error:', error); alert('Có lỗi xảy ra!'); }
        }

        function applyFilters() {
            currentPage = 1;
            loadContacts(1);
        }

        document.getElementById('search').addEventListener('keypress', e => { if (e.key === 'Enter') applyFilters(); });
        
        loadContacts();
