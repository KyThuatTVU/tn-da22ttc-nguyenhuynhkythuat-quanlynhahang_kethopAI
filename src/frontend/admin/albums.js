/* ==== Script 1 (tách từ albums.html) ==== */
let albums = [];

        function formatDateVN(dateString) {
            if (!dateString) return 'N/A';
            // Backend trả về format: "YYYY-MM-DD HH:mm:ss" hoặc "YYYY-MM-DD"
            const datePart = dateString.split(' ')[0]; // Lấy phần date
            const parts = datePart.split('-');
            if (parts.length === 3) {
                return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
            }
            return 'N/A';
        }
        function getImageUrl(path) {
            if (!path) return 'https://via.placeholder.com/300';
            if (path.startsWith('http')) return path;
            const base = API_URL.replace('/api', '');
            // Đã có sẵn đường dẫn /images/ hoặc images/
            if (path.startsWith('/images/') || path.startsWith('images/')) {
                return `${base}/${path.replace(/^\//, '')}`;
            }
            // Chỉ có tên file -> ảnh nằm trong thư mục /images/
            return `${base}/images/${path.replace(/^\//, '')}`;
        }

        async function loadAlbums() {
            try {
                const res = await fetch(`${API_URL}/albums?limit=100`, { credentials: 'include' });
                albums = (await res.json()).data || [];
                updateStats();
                renderAlbums(albums);
            } catch (e) { console.error(e); }
        }

        function updateStats() {
            document.getElementById('stat-total').textContent = albums.length;
            document.getElementById('stat-food').textContent = albums.filter(a => a.loai_anh === 'mon_an').length;
            document.getElementById('stat-space').textContent = albums.filter(a => a.loai_anh === 'khong_gian').length;
            document.getElementById('stat-event').textContent = albums.filter(a => a.loai_anh === 'su_kien').length;
            document.getElementById('stat-customer').textContent = albums.filter(a => a.loai_anh === 'khach_hang').length;
        }

        function renderAlbums(items) {
            const container = document.getElementById('albums-container');
            if (items.length === 0) { container.innerHTML = `<div class="col-span-full text-center py-12">Chưa có ảnh</div>`; return; }
            const typeName = { 'mon_an': 'Món ăn', 'khong_gian': 'Không gian', 'su_kien': 'Sự kiện', 'khach_hang': 'Khách hàng', 'khac': 'Khác' };
            container.innerHTML = items.map(album => `
                <div class="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition">
                    <div class="aspect-square"><img src="${getImageUrl(album.duong_dan_anh)}" class="w-full h-full object-cover cursor-pointer" onclick="previewImage(${album.ma_album})"></div>
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div class="flex space-x-2">
                            <button onclick="previewImage(${album.ma_album})" class="bg-white text-slate-800 p-2 rounded-xl"><i class="fas fa-eye"></i></button>
                            <button onclick="editAlbum(${album.ma_album})" class="bg-blue-500 text-white p-2 rounded-xl"><i class="fas fa-edit"></i></button>
                            <button onclick="deleteAlbum(${album.ma_album})" class="bg-red-500 text-white p-2 rounded-xl"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                    <div class="p-3">
                        <span class="text-xs px-2 py-1 rounded-lg bg-slate-100 font-medium">${typeName[album.loai_anh] || 'Khác'}</span>
                        <p class="text-xs text-slate-500 mt-1 truncate">${album.mo_ta || ''}</p>
                    </div>
                </div>`).join('');
        }

        function openUploadModal() { 
            const form = document.getElementById('upload-form');
            form.reset(); 
            document.querySelector('input[name="upload_method"][value="file"]').checked = true;
            toggleUploadMethod('upload', 'file');
            document.getElementById('upload-modal').classList.remove('hidden'); 
        }
        function closeModal() { document.getElementById('upload-modal').classList.add('hidden'); }
        function closePreview() { document.getElementById('preview-modal').classList.add('hidden'); }
        function closeEditModal() { document.getElementById('edit-modal').classList.add('hidden'); }

        function previewImage(id) {
            const a = albums.find(x => x.ma_album === id);
            if (!a) return;
            document.getElementById('preview-image').src = getImageUrl(a.duong_dan_anh);
            document.getElementById('preview-info').innerHTML = `<p class="font-bold">${a.mo_ta || ''}</p><p class="text-xs mt-1">Ngày: ${formatDateVN(a.ngay_tao)}</p>`;
            document.getElementById('preview-modal').classList.remove('hidden');
        }

        function editAlbum(id) {
            const a = albums.find(x => x.ma_album === id);
            if (!a) return;
            document.getElementById('edit-id').value = a.ma_album;
            document.getElementById('edit-loai_anh').value = a.loai_anh || 'khac';
            document.getElementById('edit-mo_ta').value = a.mo_ta || '';
            document.getElementById('edit-preview').src = getImageUrl(a.duong_dan_anh);
            document.getElementById('edit_image_url').value = '';
            document.getElementById('edit-image').value = '';
            document.querySelector('input[name="edit_method"][value="file"]').checked = true;
            toggleUploadMethod('edit', 'file');
            document.getElementById('edit-modal').classList.remove('hidden');
        }

        function previewEditImage(input) { if (input.files && input.files[0]) { const r = new FileReader(); r.onload = e => document.getElementById('edit-preview').src = e.target.result; r.readAsDataURL(input.files[0]); } }

        function toggleUploadMethod(formName, method) {
            if (formName === 'upload') {
                if (method === 'link') {
                    document.getElementById('upload-file-group').classList.add('hidden');
                    document.getElementById('upload-link-group').classList.remove('hidden');
                    document.getElementById('images').required = false;
                } else {
                    document.getElementById('upload-file-group').classList.remove('hidden');
                    document.getElementById('upload-link-group').classList.add('hidden');
                }
            } else if (formName === 'edit') {
                if (method === 'link') {
                    document.getElementById('edit-file-group').classList.add('hidden');
                    document.getElementById('edit-link-group').classList.remove('hidden');
                } else {
                    document.getElementById('edit-file-group').classList.remove('hidden');
                    document.getElementById('edit-link-group').classList.add('hidden');
                }
            }
        }

        async function deleteAlbum(id) {
            if (!confirm('Xóa ảnh này?')) return;
            try { const res = await fetch(`${API_URL}/albums/${id}`, { method: 'DELETE', credentials: 'include' }); if ((await res.json()).success) loadAlbums(); } catch (e) { console.error(e); }
        }

        document.getElementById('upload-form').addEventListener('submit', async e => {
            e.preventDefault();
            const fd = new FormData(e.target);
            // fd already captures "upload_method", "image_urls", "loai_anh", "mo_ta".
            // file input "images" is also captured automatically.
            try { 
                const res = await fetch(`${API_URL}/albums`, { method: 'POST', body: fd, credentials: 'include' }); 
                const data = await res.json();
                if (data.success) { 
                    closeModal(); 
                    loadAlbums(); 
                } else {
                    alert(data.message || 'Lỗi khi tải lên');
                }
            } catch (err) { console.error(err); }
        });

        document.getElementById('edit-form').addEventListener('submit', async e => {
            e.preventDefault();
            const id = document.getElementById('edit-id').value;
            const fd = new FormData(e.target);
            try { 
                const res = await fetch(`${API_URL}/albums/${id}`, { method: 'PUT', body: fd, credentials: 'include' }); 
                const data = await res.json();
                if (data.success) { 
                    closeEditModal(); 
                    loadAlbums(); 
                } else {
                    alert(data.message || 'Lỗi khi cập nhật');
                }
            } catch (err) { console.error(err); }
        });

        function applyFilters() {
            const s = document.getElementById('search-filter').value.toLowerCase();
            const t = document.getElementById('type-filter').value;
            const d = document.getElementById('date-filter').value;
            renderAlbums(albums.filter(a => (!s || (a.mo_ta && a.mo_ta.toLowerCase().includes(s))) && (!t || a.loai_anh === t) && (!d || (a.ngay_tao && a.ngay_tao.startsWith(d)))));
        }

        loadAlbums();
