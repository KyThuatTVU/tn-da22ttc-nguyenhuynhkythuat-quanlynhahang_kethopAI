/* ==== Script 1 (tách từ /admin/attendance/) ==== */
const ATTENDANCE_API = `${API_URL}/attendance`;
        const STAFF_API = `${API_URL}/staff`;

        document.addEventListener('DOMContentLoaded', () => {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            const today = now.toISOString().split('T')[0];
            document.getElementById('filter-start').value = startOfMonth;
            document.getElementById('filter-end').value = today;
            
            loadStaffOptions();
            loadAttendance();

            // Khởi tạo Flatpickr cho các input giờ
            const fpConfig = {
                enableTime: true,
                noCalendar: true,
                dateFormat: "H:i",
                time_24hr: true,
                disableMobile: "true"
            };
            flatpickr("#form-in", fpConfig);
            flatpickr("#form-out", fpConfig);
        });

        async function loadStaffOptions() {
            try {
                const res = await fetch(STAFF_API);
                const data = await res.json();
                
                if (data.success && Array.isArray(data.data)) {
                    const staffList = data.data.filter(s => s.trang_thai === 1);
                    
                    document.getElementById('filter-staff').innerHTML = '<option value="">-- Tất cả nhân viên --</option>' + 
                        staffList.map(s => `<option value="${s.ma_nhan_vien}">${s.ten_nhan_vien} (${s.vai_tro})</option>`).join('');
                    
                    document.getElementById('form-staff').innerHTML = staffList.map(s => `<option value="${s.ma_nhan_vien}">${s.ten_nhan_vien}</option>`).join('');
                }
            } catch (err) { console.error('Error loading staff options:', err); }
        }

        async function loadAttendance() {
            try {
                const staffId = document.getElementById('filter-staff').value;
                const start = document.getElementById('filter-start').value;
                const end = document.getElementById('filter-end').value;
                
                let url = `${ATTENDANCE_API}?start=${start}&end=${end}`;
                if(staffId) url += `&ma_nhan_vien=${staffId}`;
                
                const res = await fetch(url);
                const data = await res.json();
                const body = document.getElementById('attendance-table-body');
                
                if (!data.success || !Array.isArray(data.data)) {
                    body.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-gray-500 italic">
                        <i class="fas fa-exclamation-triangle mr-2"></i> ${(data.message || 'Không thể tải dữ liệu')}
                    </td></tr>`;
                    return;
                }

                if (data.data.length === 0) {
                    body.innerHTML = '<tr><td colspan="6" class="text-center py-10 text-gray-400 italic">Không có dữ liệu chấm công cho khoảng thời gian này</td></tr>';
                    document.getElementById('count-on-time').innerText = '0';
                    document.getElementById('count-late').innerText = '0';
                    document.getElementById('count-early').innerText = '0';
                    return;
                }

                let onTime = 0, late = 0, early = 0;

                body.innerHTML = data.data.map(a => {
                    let statusLabel = 'Đúng giờ';
                    let statusClass = 'bg-gray-100 text-gray-600';
                    
                    switch(a.trang_thai) {
                        case 'dung_gio': statusLabel = 'Đúng giờ'; statusClass = 'status-on-time'; onTime++; break;
                        case 'di_muon': statusLabel = 'Đi muộn'; statusClass = 'status-late'; late++; break;
                        case 've_som': statusLabel = 'Về sớm'; statusClass = 'status-early'; early++; break;
                        case 'ngoai_ca': statusLabel = 'Ngoài ca'; statusClass = 'status-outside'; break;
                        default: 
                            if(a.trang_thai && a.trang_thai.includes('muộn')) { statusLabel = a.trang_thai; statusClass = 'status-late'; late++; }
                            else if(a.trang_thai && a.trang_thai.includes('sớm')) { statusLabel = a.trang_thai; statusClass = 'status-early'; early++; }
                            else { statusLabel = a.trang_thai || 'Đúng giờ'; }
                            break;
                    }

                    // Hiển thị ảnh chấm công
                    let photoHtml = '<span class="text-gray-400 text-xs">Không có</span>';
                    if (a.anh_cham_cong || a.anh_checkout) {
                        photoHtml = '<div class="flex gap-1 justify-center">';
                        const escName = a.ten_nhan_vien.replace(/'/g, "\\'");
                        if (a.anh_cham_cong) {
                            const gpsIn = a.latitude && a.longitude ? `${a.latitude}, ${a.longitude}` : '';
                            photoHtml += `<button onclick="viewImage('${a.anh_cham_cong}', 'checkin', '${escName}', '${a.ngay}', '${a.gio_vao}', '${gpsIn}')" class="w-8 h-8 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition flex items-center justify-center" title="Ảnh Check-in"><i class="fas fa-sign-in-alt text-xs"></i></button>`;
                        }
                        if (a.anh_checkout) {
                            const gpsOut = a.latitude_out && a.longitude_out ? `${a.latitude_out}, ${a.longitude_out}` : '';
                            photoHtml += `<button onclick="viewImage('${a.anh_checkout}', 'checkout', '${escName}', '${a.ngay}', '${a.gio_ra || '--'}', '${gpsOut}')" class="w-8 h-8 rounded bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white transition flex items-center justify-center" title="Ảnh Check-out"><i class="fas fa-sign-out-alt text-xs"></i></button>`;
                        }
                        photoHtml += '</div>';
                    }

                    return `
                        <tr class="border-b hover:bg-gray-50 transition">
                            <td class="py-4 px-4">
                                <span class="text-xs font-bold text-blue-600 block">#CC${a.ma_cham_cong}</span>
                                <span class="text-sm font-medium text-gray-700">${new Date(a.ngay).toLocaleDateString('vi-VN')}</span>
                            </td>
                            <td class="py-4 px-4">
                                <p class="font-bold text-gray-800">${a.ten_nhan_vien}</p>
                                <p class="text-xs text-gray-500 uppercase font-bold">${a.ma_nv_code || '-'}</p>
                            </td>
                            <td class="py-4 px-4">
                                <div class="flex items-center space-x-2">
                                    <span class="text-sm font-bold text-emerald-600">${a.gio_vao || '--'}</span>
                                    <span class="text-gray-300">|</span>
                                    <span class="text-sm font-bold text-rose-600">${a.gio_ra || '--'}</span>
                                </div>
                            </td>
                            <td class="py-4 px-4 text-center font-black text-blue-600">${a.so_gio_lam || '0'}h</td>
                            <td class="py-4 px-4">
                                <span class="px-3 py-1.5 rounded-lg text-xs font-black uppercase ${statusClass}">${statusLabel}</span>
                            </td>
                            <td class="py-4 px-4 text-center">
                                ${photoHtml}
                            </td>
                            <td class="py-4 px-4 text-center">
                                <button onclick="editAttendance(${a.ma_cham_cong})" class="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition mr-2"><i class="fas fa-edit text-xs"></i></button>
                                <button onclick="deleteAttendance(${a.ma_cham_cong})" class="w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition"><i class="fas fa-trash text-xs"></i></button>
                            </td>
                        </tr>
                    `;
                }).join('');

                document.getElementById('count-on-time').innerText = onTime;
                document.getElementById('count-late').innerText = late;
                document.getElementById('count-early').innerText = early;

            } catch (err) { 
                console.error('Error loading attendance:', err);
                const body = document.getElementById('attendance-table-body');
                if(body) body.innerHTML = '<tr><td colspan="6" class="text-center py-10 text-red-500 italic">Đã xảy ra lỗi khi kết nối với máy chủ</td></tr>';
            }
        }

        let currentEditingRecord = null; // Biến lưu bản ghi đang sửa để mở ảnh lớn

        function openManualCheckModal() {
            document.getElementById('attendanceForm').reset();
            document.getElementById('attendance-id').value = '';
            document.getElementById('form-date').value = new Date().toISOString().split('T')[0];
            document.getElementById('modal-proof-section').classList.add('hidden');
            currentEditingRecord = null;
            document.getElementById('checkModal').style.display = 'block';
        }

        async function editAttendance(id) {
            try {
                const start = document.getElementById('filter-start').value;
                const end = document.getElementById('filter-end').value;
                const r = await fetch(`${ATTENDANCE_API}?start=${start}&end=${end}`);
                const data = await r.json();
                const a = data.data.find(x => x.ma_cham_cong === id);
                
                if(a) {
                    currentEditingRecord = a;
                    document.getElementById('attendance-id').value = a.ma_cham_cong;
                    document.getElementById('form-staff').value = a.ma_nhan_vien;
                    document.getElementById('form-date').value = a.ngay.split('T')[0];
                    document.getElementById('form-in').value = a.gio_vao;
                    document.getElementById('form-out').value = a.gio_ra || '';
                    
                    // Chuẩn hóa mapping trạng thái cho thẻ select form-status
                    let formStatusVal = 'dung_gio';
                    if (a.trang_thai === 'dung_gio' || a.trang_thai === 'Đúng giờ') formStatusVal = 'dung_gio';
                    else if (a.trang_thai === 'di_muon' || a.trang_thai === 'Đi muộn') formStatusVal = 'di_muon';
                    else if (a.trang_thai === 've_som' || a.trang_thai === 'Về sớm') formStatusVal = 've_som';
                    else if (a.trang_thai === 'ngoai_ca' || a.trang_thai === 'Ngoài ca') formStatusVal = 'ngoai_ca';
                    else formStatusVal = a.trang_thai || 'dung_gio';
                    
                    document.getElementById('form-status').value = formStatusVal;
                    document.getElementById('form-note').value = a.ghi_chu || '';
                    
                    // Hiển thị ảnh minh chứng
                    const proofSection = document.getElementById('modal-proof-section');
                    const imgIn = document.getElementById('modal-proof-in-img');
                    const noneIn = document.getElementById('modal-proof-in-none');
                    const imgOut = document.getElementById('modal-proof-out-img');
                    const noneOut = document.getElementById('modal-proof-out-none');

                    if (a.anh_cham_cong || a.anh_checkout) {
                        proofSection.classList.remove('hidden');
                        
                        if (a.anh_cham_cong) {
                            imgIn.src = `http://localhost:3000/${a.anh_cham_cong.replace(/\\/g, '/')}`;
                            imgIn.classList.remove('hidden');
                            noneIn.classList.add('hidden');
                        } else {
                            imgIn.src = '';
                            imgIn.classList.add('hidden');
                            noneIn.classList.remove('hidden');
                        }

                        if (a.anh_checkout) {
                            imgOut.src = `http://localhost:3000/${a.anh_checkout.replace(/\\/g, '/')}`;
                            imgOut.classList.remove('hidden');
                            noneOut.classList.add('hidden');
                        } else {
                            imgOut.src = '';
                            imgOut.classList.add('hidden');
                            noneOut.classList.remove('hidden');
                        }
                    } else {
                        proofSection.classList.add('hidden');
                    }

                    document.getElementById('checkModal').style.display = 'block';
                }
            } catch (err) { console.error(err); }
        }

        function viewPhotoFromModal(type) {
            if (!currentEditingRecord) return;
            const a = currentEditingRecord;
            const escName = a.ten_nhan_vien.replace(/'/g, "\\'");
            if (type === 'in' && a.anh_cham_cong) {
                const gpsIn = a.latitude && a.longitude ? `${a.latitude}, ${a.longitude}` : '';
                viewImage(a.anh_cham_cong, 'checkin', escName, a.ngay, a.gio_vao, gpsIn);
            } else if (type === 'out' && a.anh_checkout) {
                const gpsOut = a.latitude_out && a.longitude_out ? `${a.latitude_out}, ${a.longitude_out}` : '';
                viewImage(a.anh_checkout, 'checkout', escName, a.ngay, a.gio_ra || '--', gpsOut);
            }
        }

        document.getElementById('attendanceForm').onsubmit = async (e) => {
            e.preventDefault();
            const id = document.getElementById('attendance-id').value;
            const method = id ? 'PUT' : 'POST';
            const url = id ? `${ATTENDANCE_API}/${id}` : `${ATTENDANCE_API}/manual`; // Assuming background supports manual create

            const body = {
                ma_nhan_vien: document.getElementById('form-staff').value,
                ngay: document.getElementById('form-date').value,
                gio_vao: document.getElementById('form-in').value,
                gio_ra: document.getElementById('form-out').value,
                trang_thai: document.getElementById('form-status').value,
                ghi_chu: document.getElementById('form-note').value,
                so_gio_lam: calculateHours(document.getElementById('form-in').value, document.getElementById('form-out').value)
            };

            const res = await fetch(url, {
                method,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body)
            });
            const result = await res.json();
            if(result.success) {
                closeModal();
                loadAttendance();
            } else alert(result.message);
        };

        function calculateHours(start, end) {
            if(!start || !end) return 0;
            const [h1, m1] = start.split(':').map(Number);
            const [h2, m2] = end.split(':').map(Number);
            let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
            if(diff < 0) diff += 24 * 60; // Handle overnight
            return (diff / 60).toFixed(2);
        }

        async function deleteAttendance(id) {
            if(confirm('Chú ý: Xóa bản ghi chấm công sẽ làm mất dữ liệu tính lương. Tiếp tục?')) {
                await fetch(`${ATTENDANCE_API}/${id}`, {method: 'DELETE'});
                loadAttendance();
            }
        }

        // Xem ảnh chấm công với Modal cao cấp
        function viewImage(imagePath, type, staffName, dateStr, timeStr, gpsStr) {
            if (!imagePath) return;
            const normalizedPath = imagePath.replace(/\\/g, '/');
            const imageUrl = `http://localhost:3000/${normalizedPath}`;
            
            const modal = document.getElementById('imageViewerModal');
            const img = document.getElementById('image-viewer-src');
            const title = document.getElementById('image-viewer-title');
            const typeText = document.getElementById('image-viewer-type-text');
            const typeIcon = document.getElementById('image-viewer-type-icon');
            const timeText = document.getElementById('image-viewer-time-text');
            const gpsText = document.getElementById('image-viewer-gps-text');
            const gpsContainer = document.getElementById('image-viewer-gps-container');
            const downloadLink = document.getElementById('image-viewer-download');

            img.src = imageUrl;
            downloadLink.href = imageUrl;
            downloadLink.download = `${type}-${staffName}-${dateStr.split('T')[0]}.jpg`;
            
            title.textContent = `Minh chứng - ${staffName}`;
            
            if (type === 'checkin') {
                typeText.textContent = 'Check-in (Vào ca)';
                typeIcon.className = 'w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center';
                typeIcon.innerHTML = '<i class="fa-solid fa-right-to-bracket text-lg"></i>';
            } else {
                typeText.textContent = 'Check-out (Tan ca)';
                typeIcon.className = 'w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center';
                typeIcon.innerHTML = '<i class="fa-solid fa-right-from-bracket text-lg"></i>';
            }

            const formattedDate = new Date(dateStr).toLocaleDateString('vi-VN');
            timeText.textContent = `${timeStr} - Ngày ${formattedDate}`;

            if (gpsStr) {
                gpsText.textContent = `Tọa độ: ${gpsStr}`;
                gpsContainer.classList.remove('hidden');
            } else {
                gpsContainer.classList.add('hidden');
            }

            // Show modal with animation
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                modal.classList.add('opacity-100');
                modal.querySelector('.transform').classList.remove('scale-95');
                modal.querySelector('.transform').classList.add('scale-100');
            }, 10);
        }

        function closeImageViewer() {
            const modal = document.getElementById('imageViewerModal');
            modal.classList.remove('opacity-100');
            modal.classList.add('opacity-0');
            modal.querySelector('.transform').classList.remove('scale-100');
            modal.querySelector('.transform').classList.add('scale-95');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }

        function closeModal() { document.getElementById('checkModal').style.display = 'none'; }
