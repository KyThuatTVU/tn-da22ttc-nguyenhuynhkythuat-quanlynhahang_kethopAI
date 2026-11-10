/* ==== Script 1 (tách từ /admin/shifts/) ==== */
// ========== 1. AN TOÀN KHỞI TẠO API URL (chống ReferenceError) ==========
        var BASE_API;
        try {
            BASE_API = window.API_URL || API_URL || 'http://localhost:3000/api';
        } catch(e) {
            BASE_API = 'http://localhost:3000/api';
            console.warn('⚠️ API_URL không tồn tại, dùng mặc định:', BASE_API);
        }
        var SHIFT_API = BASE_API + '/shifts';
        var STAFF_API = BASE_API + '/staff';
        console.log('✅ API URLs:', { SHIFT_API: SHIFT_API, STAFF_API: STAFF_API });

        // ========== 2. ĐỊNH NGHĨA CÁC HÀM TRÊN WINDOW NGAY LẬP TỨC ==========

        // Helper: trả về 'YYYY-MM-DD' theo giờ local (tránh lỗi UTC của toISOString)
        window.getLocalDateStr = function(d) {
            var dt = d || new Date();
            var pad = function(n) { return (n < 10 ? '0' : '') + n; };
            return dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate());
        };

        window.openShiftModal = function(id) {
            if (id && typeof id === 'object') id = null;
            console.log('🔵 openShiftModal called, id:', id);
            var modal = document.getElementById('shiftModal');
            if (!modal) { console.error('shiftModal not found!'); return; }
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            if (!id || typeof id !== 'number') {
                var form = document.getElementById('shiftForm');
                if (form) form.reset();
                var idInput = document.getElementById('shift-id');
                if (idInput) idInput.value = '';
                var title = document.getElementById('shift-modal-title');
                if (title) title.innerText = 'Tạo Ca Làm Việc Mới';
            }
        };

        window.openScheduleModal = function() {
            console.log('🟢 openScheduleModal called');
            var modal = document.getElementById('scheduleModal');
            if (!modal) { console.error('scheduleModal not found!'); return; }
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            var schedDate = document.getElementById('schedule-date');
            var selDate = document.getElementById('select-date');
            var today = window.getLocalDateStr();
            if (selDate) {
                // Ràng buộc: không chọn ngày trong quá khứ
                selDate.setAttribute('min', today);
                // Nếu ngày đang xem trên header đã qua thì mặc định lấy hôm nay
                var headerDate = schedDate ? schedDate.value : today;
                selDate.value = (headerDate && headerDate >= today) ? headerDate : today;
            }
        };

        window.closeModal = function(id) {
            var modal = document.getElementById(id);
            if (!modal) return;
            modal.classList.remove('show');
            document.body.style.overflow = '';
        };

        window.changeDay = function(offset) {
            var dateInput = document.getElementById('schedule-date');
            if (!dateInput) return;
            var date = new Date(dateInput.value);
            date.setDate(date.getDate() + offset);
            dateInput.value = date.toISOString().split('T')[0];
            window.loadSchedules();
        };

        // ========== 3. DATA LOADING (wrapped in try-catch) ==========

        window.loadShifts = async function() {
            try {
                var res = await fetch(SHIFT_API, { credentials: 'include' });
                var data = await res.json();
                var body = document.getElementById('shift-table-body');
                var selectShift = document.getElementById('select-shift');
                if (!body) return;

                if (!data.success || !Array.isArray(data.data)) {
                    body.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-red-500">Lỗi tải danh sách ca</td></tr>';
                    return;
                }
                if (data.data.length === 0) {
                    body.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500 italic">Chưa có ca làm việc nào</td></tr>';
                    if (selectShift) selectShift.innerHTML = '<option value="">-- Chưa có ca --</option>';
                    return;
                }

                body.innerHTML = data.data.map(function(s) {
                    return '<tr class="border-b transition hover:bg-gray-50">' +
                        '<td class="py-4 px-4 font-bold text-gray-800">' + s.ten_ca + '</td>' +
                        '<td class="py-4 px-4 text-gray-600 font-medium">' + s.gio_bat_dau + '</td>' +
                        '<td class="py-4 px-4 text-gray-600 font-medium">' + s.gio_ket_thuc + '</td>' +
                        '<td class="py-4 px-4"><span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-bold">x' + s.he_so_luong + '</span></td>' +
                        '<td class="py-4 px-4 text-center">' +
                            '<button data-action="edit-shift" data-id="' + s.ma_ca + '" class="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition mr-2"><i class="fas fa-edit text-xs"></i></button>' +
                            '<button data-action="delete-shift" data-id="' + s.ma_ca + '" class="w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition"><i class="fas fa-trash text-xs"></i></button>' +
                        '</td></tr>';
                }).join('');

                if (selectShift) {
                    selectShift.innerHTML = data.data.map(function(s) {
                        return '<option value="' + s.ma_ca + '">' + s.ten_ca + ' (' + s.gio_bat_dau + ' - ' + s.gio_ket_thuc + ')</option>';
                    }).join('');
                }
            } catch (err) { console.error('Error loading shifts:', err); }
        };

        window.loadSchedules = async function() {
            try {
                var dateEl = document.getElementById('schedule-date');
                if (!dateEl) return;
                var date = dateEl.value;
                var res = await fetch(SHIFT_API + '/schedules?start=' + date + '&end=' + date, { credentials: 'include' });
                var data = await res.json();
                var body = document.getElementById('schedule-table-body');
                if (!body) return;

                if (!data.success || !Array.isArray(data.data)) {
                    body.innerHTML = '<tr><td colspan="5" class="text-center py-10 text-red-500">Lỗi kết nối server</td></tr>';
                    return;
                }
                if (data.data.length === 0) {
                    body.innerHTML = '<tr><td colspan="5" class="text-center py-10 text-gray-400 italic">Chưa có ai làm việc ngày này</td></tr>';
                    return;
                }

                body.innerHTML = data.data.map(function(s) {
                    var statusBadge = '';
                    switch(s.trang_thai) {
                        case 'completed': statusBadge = '<span class="badge-completed">Hoàn thành</span>'; break;
                        case 'cancelled': statusBadge = '<span class="badge-cancelled">Đã hủy</span>'; break;
                        default: statusBadge = '<span class="badge-scheduled">Đã phân lịch</span>';
                    }
                    var cancelBtn = s.trang_thai === 'scheduled' 
                        ? '<button data-action="delete-schedule" data-id="' + s.ma_phan_ca + '" class="w-10 h-10 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition"><i class="fas fa-times"></i></button>'
                        : '-';
                    return '<tr class="border-b hover:bg-gray-50 transition">' +
                        '<td class="py-4 px-4"><div class="flex items-center space-x-2"><span class="text-xs font-bold text-blue-600">#' + (s.ma_nv_code || '-') + '</span><span class="font-bold text-gray-800">' + s.ten_nhan_vien + '</span></div></td>' +
                        '<td class="py-4 px-4"><span class="font-medium text-gray-700 uppercase text-xs tracking-wider">' + s.ten_ca + '</span></td>' +
                        '<td class="py-4 px-4 text-sm text-gray-600 font-bold font-mono">' + s.gio_bat_dau + ' - ' + s.gio_ket_thuc + '</td>' +
                        '<td class="py-4 px-4">' + statusBadge + '</td>' +
                        '<td class="py-4 px-4 text-center">' + cancelBtn + '</td></tr>';
                }).join('');
            } catch (err) { console.error('Error loading schedules:', err); }
        };

        window.loadStaffOptions = async function() {
            try {
                var res = await fetch(STAFF_API, { credentials: 'include' });
                var data = await res.json();
                if (data.success && Array.isArray(data.data)) {
                    var el = document.getElementById('select-staff');
                    if (el) {
                        el.innerHTML = data.data
                            .filter(function(s) { return s.trang_thai === 1; })
                            .map(function(s) { return '<option value="' + s.ma_nhan_vien + '">' + s.ten_nhan_vien + ' (' + s.vai_tro + ')</option>'; })
                            .join('');
                    }
                }
            } catch (err) { console.error('Error loading staff options:', err); }
        };

        window.editShift = async function(id) {
            try {
                var res = await fetch(SHIFT_API, { credentials: 'include' });
                var data = await res.json();
                var s = data.data.find(function(x) { return x.ma_ca === id || x.ma_ca === parseInt(id); });
                if (s) {
                    document.getElementById('shift-id').value = s.ma_ca;
                    document.getElementById('shift-name').value = s.ten_ca;
                    document.getElementById('shift-start').value = s.gio_bat_dau;
                    document.getElementById('shift-end').value = s.gio_ket_thuc;
                    document.getElementById('shift-factor').value = s.he_so_luong;
                    document.getElementById('shift-modal-title').innerText = 'Cập Nhật Cấu Hình Ca';
                    window.openShiftModal(s.ma_ca);
                }
            } catch (err) { console.error(err); }
        };

        window.deleteShift = async function(id) {
            if (confirm('Chú ý: Xóa ca làm việc sẽ ảnh hưởng đến các lịch phân ca đã có. Tiếp tục?')) {
                try {
                    await fetch(SHIFT_API + '/' + id, { method: 'DELETE', credentials: 'include' });
                    window.loadShifts();
                } catch (err) { console.error(err); }
            }
        };

        window.deleteSchedule = async function(id) {
            if (confirm('Xác nhận hủy lịch làm việc này?')) {
                try {
                    await fetch(SHIFT_API + '/schedules/' + id, { method: 'DELETE', credentials: 'include' });
                    window.loadSchedules();
                } catch (err) { console.error(err); }
            }
        };

        console.log('✅ All functions defined on window');

        // ========== 4. EVENT DELEGATION (chống CSP + Google Translate) ==========
        document.addEventListener('click', function(e) {
            var target = e.target;

            // Nút "Thêm khung ca mới"
            if (target.closest('#btn-add-shift')) {
                e.preventDefault();
                window.openShiftModal(null);
                return;
            }
            // Nút "Phân ca ngày"
            if (target.closest('#btn-schedule')) {
                e.preventDefault();
                window.openScheduleModal();
                return;
            }
            // Nút ngày trước / sau
            if (target.closest('#btn-prev-day')) { e.preventDefault(); window.changeDay(-1); return; }
            if (target.closest('#btn-next-day')) { e.preventDefault(); window.changeDay(1); return; }
            // Nút đóng modal
            if (target.closest('#btn-close-shift-modal')) { e.preventDefault(); window.closeModal('shiftModal'); return; }
            if (target.closest('#btn-close-schedule-modal')) { e.preventDefault(); window.closeModal('scheduleModal'); return; }
            // Nút Edit/Delete shift (dynamic buttons từ table)
            var editBtn = target.closest('[data-action="edit-shift"]');
            if (editBtn) { e.preventDefault(); window.editShift(parseInt(editBtn.dataset.id)); return; }
            var deleteBtn = target.closest('[data-action="delete-shift"]');
            if (deleteBtn) { e.preventDefault(); window.deleteShift(parseInt(deleteBtn.dataset.id)); return; }
            var delSchedBtn = target.closest('[data-action="delete-schedule"]');
            if (delSchedBtn) { e.preventDefault(); window.deleteSchedule(parseInt(delSchedBtn.dataset.id)); return; }
            // Click bên ngoài modal để đóng
            if (target.classList && target.classList.contains('modal')) {
                window.closeModal(target.id);
            }
        });

        // Change event cho date input
        document.addEventListener('change', function(e) {
            if (e.target && e.target.id === 'schedule-date') {
                window.loadSchedules();
            }
            // Cảnh báo sớm khi đổi ngày/ca trong modal phân ca
            if (e.target && (e.target.id === 'select-date' || e.target.id === 'select-shift')) {
                try {
                    var ngay = document.getElementById('select-date').value;
                    var todayStr = window.getLocalDateStr();
                    if (ngay && ngay < todayStr) {
                        alert('Cảnh báo: Không thể phân ca cho ngày trong quá khứ!');
                        document.getElementById('select-date').value = todayStr;
                        return;
                    }
                    var maCa = document.getElementById('select-shift').value;
                    var selShift = document.getElementById('select-shift');
                    if (ngay === todayStr && selShift && selShift.selectedIndex >= 0) {
                        // Trích giờ bắt đầu từ label "Tên (HH:MM - HH:MM)"
                        var label = selShift.options[selShift.selectedIndex].text || '';
                        var m = label.match(/\((\d{1,2}:\d{2})/);
                        if (m) {
                            var p = m[1].split(':');
                            var st = new Date();
                            st.setHours(parseInt(p[0], 10) || 0, parseInt(p[1], 10) || 0, 0, 0);
                            if (st.getTime() <= Date.now()) {
                                alert('Cảnh báo: Giờ bắt đầu ca này (' + m[1] + ') đã qua giờ hiện tại. Bạn không thể phân ca này hôm nay.');
                            }
                        }
                    }
                } catch (err) { console.warn(err); }
            }
        });

        // ESC key đóng modal
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                window.closeModal('shiftModal');
                window.closeModal('scheduleModal');
            }
        });

        console.log('✅ Event delegation attached');

        // ========== 5. FORM SUBMISSION ==========
        var shiftForm = document.getElementById('shiftForm');
        if (shiftForm) {
            shiftForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                try {
                    var id = document.getElementById('shift-id').value;
                    var method = id ? 'PUT' : 'POST';
                    var url = id ? (SHIFT_API + '/' + id) : SHIFT_API;
                    var payload = {
                        ten_ca: document.getElementById('shift-name').value,
                        gio_bat_dau: document.getElementById('shift-start').value,
                        gio_ket_thuc: document.getElementById('shift-end').value,
                        he_so_luong: document.getElementById('shift-factor').value
                    };
                    var res = await fetch(url, {
                        method: method,
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify(payload)
                    });
                    var result = await res.json();
                    if (result.success) {
                        window.closeModal('shiftModal');
                        window.loadShifts();
                    } else { alert(result.message); }
                } catch (err) { alert('Lỗi kết nối server!'); console.error(err); }
            });
        }

        var scheduleForm = document.getElementById('scheduleForm');
        if (scheduleForm) {
            scheduleForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                try {
                    var maNV = document.getElementById('select-staff').value;
                    var maCa = document.getElementById('select-shift').value;
                    var ngay = document.getElementById('select-date').value;

                    // === Validate phía client ===
                    if (!maNV || !maCa || !ngay) {
                        alert('Vui lòng chọn đầy đủ nhân viên, ca và ngày!');
                        return;
                    }

                    var now = new Date();
                    var todayStr = window.getLocalDateStr(now);

                    // 1. Không cho phân ca cho ngày trong quá khứ
                    if (ngay < todayStr) {
                        alert('LỖI: Không thể phân ca cho ngày trong quá khứ!');
                        return;
                    }

                    // 2. Lấy thông tin ca đang chọn để check giờ
                    var shiftRes = await fetch(SHIFT_API, { credentials: 'include' });
                    var shiftData = await shiftRes.json();
                    var targetShift = (shiftData.data || []).find(function(s) {
                        return String(s.ma_ca) === String(maCa);
                    });
                    if (!targetShift) {
                        alert('LỖI: Không tìm thấy ca làm việc đã chọn!');
                        return;
                    }

                    // 3. Nếu phân cho hôm nay → giờ bắt đầu ca không được nằm trong quá khứ
                    if (ngay === todayStr) {
                        var parts = String(targetShift.gio_bat_dau).split(':');
                        var shiftStart = new Date();
                        shiftStart.setHours(parseInt(parts[0], 10) || 0, parseInt(parts[1], 10) || 0, 0, 0);
                        if (shiftStart.getTime() <= now.getTime()) {
                            alert('LỖI: Giờ bắt đầu ca (' + targetShift.gio_bat_dau + ') đã qua giờ hiện tại. Không thể phân ca này!');
                            return;
                        }
                    }

                    // 4. Kiểm tra trùng / chồng chéo ca với lịch đã có của nhân viên trong ngày đó
                    var schedRes = await fetch(SHIFT_API + '/schedules?start=' + ngay + '&end=' + ngay, { credentials: 'include' });
                    var schedData = await schedRes.json();
                    if (schedData.success && Array.isArray(schedData.data)) {
                        var existing = schedData.data.filter(function(s) {
                            return String(s.ma_nhan_vien) === String(maNV) && s.trang_thai !== 'cancelled';
                        });
                        for (var i = 0; i < existing.length; i++) {
                            var ex = existing[i];
                            // Trùng y nguyên ca
                            if (String(ex.ma_ca) === String(maCa)) {
                                alert('LỖI: Nhân viên đã được phân ca "' + ex.ten_ca + '" trong ngày này. Không thể phân trùng!');
                                return;
                            }
                            // Chồng chéo khung giờ
                            if (targetShift.gio_bat_dau < ex.gio_ket_thuc && targetShift.gio_ket_thuc > ex.gio_bat_dau) {
                                alert('LỖI: Khung giờ ca bị chồng chéo với ca "' + ex.ten_ca + '" (' + ex.gio_bat_dau + ' - ' + ex.gio_ket_thuc + ') đã phân trước đó!');
                                return;
                            }
                        }
                    }

                    // === Gửi lên server (server vẫn validate thêm để an toàn) ===
                    var payload = { ma_nhan_vien: maNV, ma_ca: maCa, ngay: ngay };
                    var res = await fetch(SHIFT_API + '/schedules', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify(payload)
                    });
                    var result = await res.json();
                    if (result.success) {
                        alert('Phân ca thành công!');
                        window.closeModal('scheduleModal');
                        window.loadSchedules();
                    } else { alert('LỖI: ' + result.message); }
                } catch (err) { alert('Lỗi kết nối server!'); console.error(err); }
            });
        }

        // ========== 6. KHỞI TẠO TRANG ==========
        (function initPage() {
            try {
                var today = window.getLocalDateStr();
                var schedDate = document.getElementById('schedule-date');
                var selDate = document.getElementById('select-date');
                if (schedDate) schedDate.value = today;
                if (selDate) {
                    selDate.value = today;
                    selDate.setAttribute('min', today);
                }
                window.loadShifts();
                window.loadSchedules();
                window.loadStaffOptions();
            } catch(err) {
                console.error('Lỗi khởi tạo trang:', err);
            }
        })();

        // Khởi tạo Flatpickr cho các input giờ
        try {
            flatpickr("#shift-start", {
                enableTime: true,
                noCalendar: true,
                dateFormat: "H:i",
                time_24hr: true,
                disableMobile: true
            });
            flatpickr("#shift-end", {
                enableTime: true,
                noCalendar: true,
                dateFormat: "H:i",
                time_24hr: true,
                disableMobile: true
            });
        } catch(err) {
            console.warn('⚠️ Flatpickr chưa sẵn sàng:', err);
        }
