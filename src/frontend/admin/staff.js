/* ==== Script 1 (tách từ /admin/staff/) ==== */
// API_URL is handled by admin-layout.js
        const STAFF_API = `${API_URL}/staff`;
        let isEditMode = false;

        function viewPhoto(src, title) {
            if (!src) return;
            document.getElementById('photoViewerImg').src = src;
            document.getElementById('photoViewer').classList.add('open');
        }
        function closePhotoViewer() {
            document.getElementById('photoViewer').classList.remove('open');
        }

        // Upload ảnh lên server và hiển thị preview (Có tự động trích chọn khuôn mặt nếu là Avatar)
        async function handleFileUpload(input, hiddenId, previewId, placeholderId) {
            if (!input.files || !input.files[0]) return;
            const file = input.files[0];

            const isAvatar = hiddenId === 'staff-avatar';
            const placeholder = document.getElementById(placeholderId);
            const previewImg = document.getElementById(previewId);

            if (isAvatar) {
                // Hiển thị trạng thái đang xử lý trích chọn khuôn mặt
                placeholder.innerHTML = `
                    <i class="fas fa-spinner fa-spin text-2xl text-indigo-500 mb-1"></i>
                    <p class="text-xs text-indigo-500">Đang trích xuất mặt...</p>
                `;
                placeholder.classList.remove('hidden');
                previewImg.classList.add('hidden');
            } else {
                // Hiển thị preview tạm cho các ảnh tài liệu bằng local FileReader
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewImg.src = e.target.result;
                    previewImg.classList.remove('hidden');
                    placeholder.classList.add('hidden');
                };
                reader.readAsDataURL(file);
            }

            // Upload lên server
            try {
                const formData = new FormData();
                formData.append('image', file);
                
                // Sử dụng api trích chọn khuôn mặt cho ảnh đại diện, api thường cho cccd
                const endpoint = isAvatar ? 'crop-face' : 'staff';
                const res = await fetch(`${API_URL}/upload/${endpoint}`, {
                    method: 'POST',
                    body: formData
                });
                const result = await res.json();
                
                if (result.success) {
                    document.getElementById(hiddenId).value = result.url;
                    
                    if (isAvatar) {
                        // Hiển thị ảnh khuôn mặt đã được cắt chuẩn từ server
                        previewImg.src = `${API_URL.replace('/api', '')}${result.url}`;
                        previewImg.classList.remove('hidden');
                        placeholder.classList.add('hidden');
                        
                        // Reset placeholder text
                        placeholder.innerHTML = `
                            <i class="fas fa-camera text-2xl text-gray-400 mb-1"></i>
                            <p class="text-xs text-gray-400">Click để chọn ảnh</p>
                            <p class="text-[10px] text-gray-300">(JPG, PNG • Tối đa 5MB)</p>
                        `;
                    }
                } else {
                    alert('Lỗi upload: ' + result.message);
                    if (isAvatar) {
                        previewImg.classList.add('hidden');
                        placeholder.classList.remove('hidden');
                        placeholder.innerHTML = `
                            <i class="fas fa-camera text-2xl text-gray-400 mb-1"></i>
                            <p class="text-xs text-gray-400">Click để chọn ảnh</p>
                            <p class="text-[10px] text-gray-300">(JPG, PNG • Tối đa 5MB)</p>
                        `;
                    }
                }
            } catch (err) {
                console.error('Upload error:', err);
                alert('Lỗi upload ảnh!');
            }
        }

        function resetImagePreview(previewId, placeholderId, hiddenId, fileInputId) {
            document.getElementById(previewId).classList.add('hidden');
            document.getElementById(previewId).src = '';
            document.getElementById(placeholderId).classList.remove('hidden');
            document.getElementById(hiddenId).value = '';
            document.getElementById(fileInputId).value = '';
        }

        function toggleSalaryType() {
            const type = document.querySelector('input[name="salary_type"]:checked').value;
            const hourInput = document.getElementById('staff-salary-hour');
            const baseInput = document.getElementById('staff-salary-base');

            if (type === 'hourly') {
                hourInput.disabled = false;
                hourInput.classList.remove('bg-gray-100', 'cursor-not-allowed');
                baseInput.value = 0;
                baseInput.disabled = true;
                baseInput.classList.add('bg-gray-100', 'cursor-not-allowed');
            } else if (type === 'fixed') {
                baseInput.disabled = false;
                baseInput.classList.remove('bg-gray-100', 'cursor-not-allowed');
                hourInput.value = 0;
                hourInput.disabled = true;
                hourInput.classList.add('bg-gray-100', 'cursor-not-allowed');
            } else {
                hourInput.disabled = false;
                hourInput.classList.remove('bg-gray-100', 'cursor-not-allowed');
                baseInput.disabled = false;
                baseInput.classList.remove('bg-gray-100', 'cursor-not-allowed');
            }
        }

        async function loadStaff() {
            try {
                const search = document.getElementById('search-input').value;
                const role = document.getElementById('filter-role').value;
                const status = document.getElementById('filter-status').value;
                
                const response = await fetch(`${STAFF_API}?search=${search}&role=${role}&status=${status}`);
                const result = await response.json();
                
                if (result.success) displayStaff(result.data);
            } catch (error) {
                console.error('Error:', error);
            }
        }

        function displayStaff(list) {
            const tbody = document.getElementById('staff-table-body');
            if (list.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-gray-500">Không tìm thấy dữ liệu</td></tr>';
                return;
            }

            tbody.innerHTML = list.map(s => `
                <tr class="border-b hover:bg-gray-50 transition">
                    <td class="py-4 px-4 text-sm font-bold text-blue-600">${s.ma_nv_code || s.ma_nhan_vien}</td>
                    <td class="py-4 px-4">
                        <div class="flex items-center space-x-3">
                            <img src="${s.anh_dai_dien || 'https://ui-avatars.com/api/?name='+encodeURIComponent(s.ten_nhan_vien)+'&background=random'}" class="w-10 h-10 rounded-full border">
                            <div>
                                <p class="font-bold text-gray-800">${s.ten_nhan_vien}</p>
                                <p class="text-xs text-gray-500">${s.tai_khoan}</p>
                            </div>
                        </div>
                    </td>
                    <td class="py-4 px-4">
                        <span class="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold uppercase text-gray-600">${s.vai_tro}</span>
                    </td>
                    <td class="py-4 px-4">
                        <p class="text-sm text-gray-700 font-medium">${s.so_dien_thoai || 'N/A'}</p>
                        <div class="flex space-x-2 mt-1">
                            ${s.anh_cccd ? `<button onclick="viewPhoto('${s.anh_cccd}', 'Mặt trước CCCD')" class="text-[10px] text-blue-500 hover:underline"><i class="fas fa-id-card"></i> Trước</button>` : ''}
                            ${s.anh_cccd_sau ? `<button onclick="viewPhoto('${s.anh_cccd_sau}', 'Mặt sau CCCD')" class="text-[10px] text-blue-500 hover:underline"><i class="fas fa-id-card"></i> Sau</button>` : ''}
                        </div>
                    </td>
                    <td class="py-4 px-4 text-sm text-gray-600">
                        ${s.ngay_vao_lam ? new Date(s.ngay_vao_lam).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td class="py-4 px-4">
                        <span class="${s.trang_thai === 1 ? 'badge-active' : 'badge-inactive'}">
                            ${s.trang_thai === 1 ? 'Đang làm việc' : 'Đã khóa'}
                        </span>
                    </td>
                    <td class="py-4 px-4">
                        <div class="flex justify-center space-x-1">
                            <button onclick="openEditModal(${s.ma_nhan_vien})" class="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Chỉnh sửa"><i class="fas fa-edit text-lg"></i></button>
                            <button onclick="openPasswordModal(${s.ma_nhan_vien})" class="p-2 text-orange-500 hover:bg-orange-50 rounded-full transition-colors" title="Đổi mật khẩu"><i class="fas fa-key text-lg"></i></button>
                            <button onclick="window.location.href='/admin/quan-ly-quyen-nhan-vien/?id=${s.ma_nhan_vien}'" class="p-2 text-purple-600 hover:bg-purple-50 rounded-full transition-colors" title="Phân quyền"><i class="fas fa-shield-alt text-lg"></i></button>
                            <button onclick="deleteStaff(${s.ma_nhan_vien})" class="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Xóa"><i class="fas fa-trash text-lg"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        function openAddModal() {
            isEditMode = false;
            document.getElementById('modal-title').textContent = 'Thêm nhân viên mới';
            document.getElementById('staffForm').reset();
            document.getElementById('password-group').style.display = 'block';
            document.getElementById('staff-username').readOnly = false;
            document.querySelector('input[name="salary_type"][value="hourly"]').checked = true;
            toggleSalaryType();
            // reset image previews
            resetImagePreview('avatar-preview', 'avatar-placeholder', 'staff-avatar', 'file-avatar');
            resetImagePreview('cccd-img-preview', 'cccd-img-placeholder', 'staff-cccd-img', 'file-cccd-img');
            resetImagePreview('cccd-sau-img-preview', 'cccd-sau-img-placeholder', 'staff-cccd-sau-img', 'file-cccd-sau-img');
            document.getElementById('staffModal').style.display = 'block';
        }

        async function openEditModal(id) {
            isEditMode = true;
            document.getElementById('modal-title').textContent = 'Cập nhật hồ sơ nhân viên';
            document.getElementById('password-group').style.display = 'none';
            document.getElementById('staff-username').readOnly = false;

            try {
                const response = await fetch(STAFF_API);
                const result = await response.json();
                const s = result.data.find(x => x.ma_nhan_vien === id);
                if (s) {
                    document.getElementById('staff-id').value = s.ma_nhan_vien;
                    document.getElementById('staff-name').value = s.ten_nhan_vien;
                    document.getElementById('staff-username').value = s.tai_khoan;
                    document.getElementById('staff-phone').value = s.so_dien_thoai || '';
                    document.getElementById('staff-role').value = s.vai_tro;
                    document.getElementById('staff-dob').value = s.ngay_sinh ? s.ngay_sinh.split('T')[0] : '';
                    document.getElementById('staff-gender').value = s.gioi_tinh || 'Nam';
                    document.getElementById('staff-address').value = s.dia_chi || '';
                    document.getElementById('staff-join-date').value = s.ngay_vao_lam ? s.ngay_vao_lam.split('T')[0] : '';
                    
                    // Ảnh đại diện
                    const avatarUrl = s.anh_dai_dien || '';
                    document.getElementById('staff-avatar').value = avatarUrl;
                    if (avatarUrl) {
                        const avImg = document.getElementById('avatar-preview');
                        avImg.src = avatarUrl;
                        avImg.classList.remove('hidden');
                        document.getElementById('avatar-placeholder').classList.add('hidden');
                    } else {
                        resetImagePreview('avatar-preview', 'avatar-placeholder', 'staff-avatar', 'file-avatar');
                    }
                    // Ảnh CCCD
                    const cccdUrl = s.anh_cccd || '';
                    document.getElementById('staff-cccd-img').value = cccdUrl;
                    if (cccdUrl) {
                        const ccImg = document.getElementById('cccd-img-preview');
                        ccImg.src = cccdUrl;
                        ccImg.classList.remove('hidden');
                        document.getElementById('cccd-img-placeholder').classList.add('hidden');
                    } else {
                        resetImagePreview('cccd-img-preview', 'cccd-img-placeholder', 'staff-cccd-img', 'file-cccd-img');
                    }
                    // Ảnh CCCD mặt sau
                    const cccdSauUrl = s.anh_cccd_sau || '';
                    document.getElementById('staff-cccd-sau-img').value = cccdSauUrl;
                    if (cccdSauUrl) {
                        const ccSauImg = document.getElementById('cccd-sau-img-preview');
                        ccSauImg.src = cccdSauUrl;
                        ccSauImg.classList.remove('hidden');
                        document.getElementById('cccd-sau-img-placeholder').classList.add('hidden');
                    } else {
                        resetImagePreview('cccd-sau-img-preview', 'cccd-sau-img-placeholder', 'staff-cccd-sau-img', 'file-cccd-sau-img');
                    }
                    
                    const h = parseFloat(s.luong_theo_gio || 0);
                    const b = parseFloat(s.luong_co_ban || 0);
                    if (h > 0 && b > 0) document.querySelector('input[name="salary_type"][value="both"]').checked = true;
                    else if (b > 0) document.querySelector('input[name="salary_type"][value="fixed"]').checked = true;
                    else document.querySelector('input[name="salary_type"][value="hourly"]').checked = true;
                    
                    toggleSalaryType();
                    
                    document.getElementById('staff-salary-hour').value = s.luong_theo_gio || 0;
                    document.getElementById('staff-salary-base').value = s.luong_co_ban || 0;
                    document.getElementById('staff-status').value = s.trang_thai;
                    document.getElementById('staffModal').style.display = 'block';
                }
            } catch (error) { console.error(error); }
        }

        function closeModal() { document.getElementById('staffModal').style.display = 'none'; }

        document.getElementById('staffForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('staff-id').value;
            const data = {
                ten_nhan_vien: document.getElementById('staff-name').value,
                tai_khoan: document.getElementById('staff-username').value,
                so_dien_thoai: document.getElementById('staff-phone').value,
                vai_tro: document.getElementById('staff-role').value,
                ngay_sinh: document.getElementById('staff-dob').value,
                gioi_tinh: document.getElementById('staff-gender').value,
                dia_chi: document.getElementById('staff-address').value,
                ngay_vao_lam: document.getElementById('staff-join-date').value,
                luong_theo_gio: document.getElementById('staff-salary-hour').value,
                luong_co_ban: document.getElementById('staff-salary-base').value,
                trang_thai: document.getElementById('staff-status').value,
                anh_dai_dien: document.getElementById('staff-avatar').value || null,
                anh_cccd: document.getElementById('staff-cccd-img').value || null,
                anh_cccd_sau: document.getElementById('staff-cccd-sau-img').value || null
            };
            if (!isEditMode) data.mat_khau = document.getElementById('staff-password').value;

            try {
                const url = isEditMode ? `${STAFF_API}/${id}` : STAFF_API;
                const method = isEditMode ? 'PUT' : 'POST';
                const response = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const res = await response.json();
                if (res.success) {
                    alert('Thành công!');
                    closeModal();
                    loadStaff();
                } else alert(res.message);
            } catch (error) { console.error(error); }
        });

        async function deleteStaff(id) {
            if (!confirm('Xác nhận xóa (vĩnh viễn sẽ chuyển vào trạng thái ẩn)?')) return;
                const response = await fetch(`${STAFF_API}/${id}`, { method: 'DELETE' });
            const res = await response.json();
            if (res.success) loadStaff();
        }

        function openPasswordModal(id) {
            document.getElementById('pass-staff-id').value = id;
            document.getElementById('passwordModal').style.display = 'block';
        }
        function closePasswordModal() { document.getElementById('passwordModal').style.display = 'none'; }

        document.getElementById('passwordForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('pass-staff-id').value;
            const mat_khau_moi = document.getElementById('new-pass').value;
            const response = await fetch(`${STAFF_API}/${id}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mat_khau_moi })
            });
            const res = await response.json();
            if (res.success) { alert('Đã đổi mật khẩu'); closePasswordModal(); }
        });

        let webcamStream = null;
        let faceDetectionInterval = null;
        let detectionCanvas = null;

        function startFaceDetectionLoop() {
            if (faceDetectionInterval) clearInterval(faceDetectionInterval);
            if (!detectionCanvas) {
                detectionCanvas = document.createElement('canvas');
            }
            
            const video = document.getElementById('webcam-video');
            const faceGuide = document.getElementById('webcam-face-guide');
            const guideOval = faceGuide.querySelector('.border-dashed');
            const guideText = faceGuide.querySelector('.absolute.bottom-2');
            
            faceDetectionInterval = setInterval(async () => {
                if (!webcamStream || video.paused || video.ended) return;
                
                // Vẽ frame thu nhỏ lên canvas ẩn để gửi đi
                detectionCanvas.width = 160;
                detectionCanvas.height = 120;
                const ctx = detectionCanvas.getContext('2d');
                ctx.drawImage(video, 0, 0, detectionCanvas.width, detectionCanvas.height);
                
                const base64Img = detectionCanvas.toDataURL('image/jpeg', 0.6);
                
                try {
                    const res = await fetch('http://localhost:5000/api/ml/face/detect-only', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ image_base64: base64Img })
                    });
                    const result = await res.json();
                    
                    if (result.success && result.face_detected && result.box) {
                        const box = result.box;
                        const x_center = box.x + box.w / 2;
                        const y_center = box.y + box.h / 2;
                        
                        // Định nghĩa vùng trung tâm của ảnh 160x120
                        const minX = 160 * 0.35; // 56
                        const maxX = 160 * 0.65; // 104
                        const minY = 120 * 0.22; // 26
                        const maxY = 120 * 0.78; // 93
                        
                        // Kích thước mặt lý tưởng
                        const minW = 160 * 0.20; // 32 pixels (không đứng quá xa)
                        const maxW = 160 * 0.50; // 80 pixels (không đứng quá gần)
                        
                        let isCentered = (x_center >= minX && x_center <= maxX && y_center >= minY && y_center <= maxY);
                        let isCorrectSize = (box.w >= minW && box.w <= maxW);
                        
                        if (isCentered && isCorrectSize) {
                            // Khuôn mặt hoàn toàn hợp lệ -> Xanh lá
                            guideOval.style.borderColor = '#10b981';
                            guideOval.style.boxShadow = '0 0 25px rgba(16, 185, 129, 0.7)';
                            
                            guideText.textContent = 'Khuôn mặt hợp lệ. Sẵn sàng chụp!';
                            guideText.className = 'absolute bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-slate-900/90 text-green-400 rounded-lg text-[10px] font-bold border border-green-500/30 shadow-lg text-center whitespace-nowrap';
                        } else {
                            // Phát hiện mặt nhưng lệch vị trí/tỉ lệ -> Màu vàng cảnh báo
                            guideOval.style.borderColor = '#f59e0b';
                            guideOval.style.boxShadow = '0 0 25px rgba(245, 158, 11, 0.6)';
                            
                            let promptMsg = 'Căn khuôn mặt vào giữa!';
                            if (box.w < minW) {
                                promptMsg = 'Đứng gần camera hơn!';
                            } else if (box.w > maxW) {
                                promptMsg = 'Đứng lùi xa camera hơn!';
                            } else if (!isCentered) {
                                promptMsg = 'Đưa khuôn mặt vào giữa khung nét đứt!';
                            }
                            
                            guideText.textContent = promptMsg;
                            guideText.className = 'absolute bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-slate-900/90 text-amber-400 rounded-lg text-[10px] font-bold border border-amber-500/30 shadow-lg text-center whitespace-nowrap';
                        }
                    } else {
                        // Không tìm thấy khuôn mặt -> Màu đỏ
                        guideOval.style.borderColor = '#f43f5e';
                        guideOval.style.boxShadow = '0 0 25px rgba(244, 63, 94, 0.7)';
                        
                        guideText.textContent = 'Không tìm thấy khuôn mặt!';
                        guideText.className = 'absolute bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-slate-900/90 text-rose-400 rounded-lg text-[10px] font-bold border border-rose-500/30 shadow-lg text-center whitespace-nowrap';
                    }
                } catch (err) {
                    // Lỗi kết nối âm thầm bỏ qua
                }
            }, 500);
        }

        function stopFaceDetectionLoop() {
            if (faceDetectionInterval) {
                clearInterval(faceDetectionInterval);
                faceDetectionInterval = null;
            }
        }

        function openWebcamModal() {
            const modal = document.getElementById('webcamModal');
            const video = document.getElementById('webcam-video');
            const loading = document.getElementById('webcam-loading');
            const faceGuide = document.getElementById('webcam-face-guide');
            
            modal.style.display = 'block';
            loading.classList.remove('hidden');
            faceGuide.classList.add('hidden');

            navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: "user" } })
                .then(stream => {
                    webcamStream = stream;
                    video.srcObject = stream;
                    video.onloadedmetadata = () => {
                        loading.classList.add('hidden');
                        faceGuide.classList.remove('hidden');
                        startFaceDetectionLoop();
                    };
                })
                .catch(err => {
                    console.error("Lỗi truy cập webcam: ", err);
                    alert("Không thể truy cập camera. Vui lòng kiểm tra quyền thiết bị hoặc kết nối!");
                    closeWebcamModal();
                });
        }

        function closeWebcamModal() {
            const modal = document.getElementById('webcamModal');
            const video = document.getElementById('webcam-video');
            const faceGuide = document.getElementById('webcam-face-guide');
            
            modal.style.display = 'none';
            if (webcamStream) {
                webcamStream.getTracks().forEach(track => track.stop());
                webcamStream = null;
            }
            video.srcObject = null;
            if (faceGuide) faceGuide.classList.add('hidden');
            stopFaceDetectionLoop();
        }

        async function captureWebcamPhoto() {
            const video = document.getElementById('webcam-video');
            if (!webcamStream) return;

            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert canvas to blob
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    alert("Lỗi khi chuyển đổi ảnh chụp!");
                    return;
                }
                const file = new File([blob], `webcam-${Date.now()}.jpg`, { type: 'image/jpeg' });
                
                const placeholder = document.getElementById('avatar-placeholder');
                const previewImg = document.getElementById('avatar-preview');

                // Hiển thị trạng thái đang xử lý trích chọn khuôn mặt
                placeholder.innerHTML = `
                    <i class="fas fa-spinner fa-spin text-2xl text-indigo-500 mb-1"></i>
                    <p class="text-xs text-indigo-500">Đang trích xuất mặt...</p>
                `;
                placeholder.classList.remove('hidden');
                previewImg.classList.add('hidden');

                // Close modal
                closeWebcamModal();

                // Upload & crop on server
                try {
                    const formData = new FormData();
                    formData.append('image', file);
                    const res = await fetch(`${API_URL}/upload/crop-face`, {
                        method: 'POST',
                        body: formData
                    });
                    const result = await res.json();
                    
                    if (result.success) {
                        // Hiển thị ảnh khuôn mặt đã được cắt chuẩn từ server
                        previewImg.src = `${API_URL.replace('/api', '')}${result.url}`;
                        previewImg.classList.remove('hidden');
                        placeholder.classList.add('hidden');
                        document.getElementById('staff-avatar').value = result.url;
                        
                        // Reset placeholder text
                        placeholder.innerHTML = `
                            <i class="fas fa-camera text-2xl text-gray-400 mb-1"></i>
                            <p class="text-xs text-gray-400">Click để chọn ảnh</p>
                            <p class="text-[10px] text-gray-300">(JPG, PNG • Tối đa 5MB)</p>
                        `;
                    } else {
                        alert('Lỗi trích chọn khuôn mặt: ' + result.message);
                        previewImg.classList.add('hidden');
                        placeholder.classList.remove('hidden');
                        placeholder.innerHTML = `
                            <i class="fas fa-camera text-2xl text-gray-400 mb-1"></i>
                            <p class="text-xs text-gray-400">Click để chọn ảnh</p>
                            <p class="text-[10px] text-gray-300">(JPG, PNG • Tối đa 5MB)</p>
                        `;
                    }
                } catch (err) {
                    console.error('Upload webcam photo error:', err);
                    alert('Lỗi kết nối server trích xuất khuôn mặt!');
                    previewImg.classList.add('hidden');
                    placeholder.classList.remove('hidden');
                    placeholder.innerHTML = `
                        <i class="fas fa-camera text-2xl text-gray-400 mb-1"></i>
                        <p class="text-xs text-gray-400">Click để chọn ảnh</p>
                        <p class="text-[10px] text-gray-300">(JPG, PNG • Tối đa 5MB)</p>
                    `;
                }
            }, 'image/jpeg', 0.9);
        }

        loadStaff();
