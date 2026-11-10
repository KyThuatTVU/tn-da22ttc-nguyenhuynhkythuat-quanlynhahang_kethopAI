/* ==== Script 1 (tách từ cham-cong-guong-mat.html) ==== */
// Ngăn chặn Live Server tự động reload trang khi lưu ảnh chấm công
        (function() {
            const OriginalWebSocket = window.WebSocket;
            if (!OriginalWebSocket) return;
            window.WebSocket = function(url, protocols) {
                const ws = new OriginalWebSocket(url, protocols);
                let customOnMessage = null;
                Object.defineProperty(ws, 'onmessage', {
                    get: () => customOnMessage,
                    set: (fn) => {
                        customOnMessage = fn;
                        ws.addEventListener('message', (event) => {
                            if (event.data === 'reload') {
                                console.warn('⚠️ [Live Server] Đã chặn reload trang tự động để giữ thông báo chấm công.');
                                return;
                            }
                            if (customOnMessage) customOnMessage.call(ws, event);
                        });
                    },
                    configurable: true
                });
                return ws;
            };
            window.WebSocket.prototype = OriginalWebSocket.prototype;
        })();

        const API_BASE = 'http://localhost:3000/api';
        
        // Geolocation restaurant definition (Đại học Trà Vinh)
        let RESTAURANT_LOCATION = {
            lat: 9.9234,
            lng: 106.3465,
            radius: 500 // meters (bán kính rộng hơn do khuôn viên đại học lớn)
        };

        // Load GPS Config from API
        async function loadGPSConfig() {
            try {
                const response = await fetch(`${API_BASE}/settings`);
                const result = await response.json();
                if (result.success && result.data) {
                    const settings = result.data;
                    if (settings.latitude && settings.longitude) {
                        RESTAURANT_LOCATION.lat = parseFloat(settings.latitude);
                        RESTAURANT_LOCATION.lng = parseFloat(settings.longitude);
                    }
                    if (settings.radius) {
                        RESTAURANT_LOCATION.radius = parseInt(settings.radius);
                    }
                    console.log('✅ GPS Config loaded from database:', RESTAURANT_LOCATION);
                }
            } catch (error) {
                console.warn('⚠️ Could not load GPS config from API, using default:', error.message);
            }
        }

        // State variables
        let employeeCode = null;
        let employeeInfo = null;
        let userLocation = null;
        let isCameraMirror = true;
        let stream = null;
        let videoEl = document.getElementById('webcam');
        let placeholderEl = document.getElementById('camera-placeholder');
        let overlayEl = document.getElementById('result-overlay');
        let soundSuccess = document.getElementById('sound-success');
        let soundError = document.getElementById('sound-error');
        let resultTimeout = null;

        // Initialize clock
        function updateClock() {
            const now = new Date();
            const time = now.toLocaleTimeString('vi-VN', { hour12: false });
            const date = now.toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
            });
            document.getElementById('header-clock').textContent = time;
            document.getElementById('header-date').textContent = date;
        }
        setInterval(updateClock, 1000);
        updateClock();

        // 1. Get query param code
        function getQueryCode() {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('code')?.trim().toUpperCase() || null;
        }

        // 2. Load staff info and check in-out logs
        async function loadStaffProfile(code) {
            employeeCode = code;
            
            // Switch views
            document.getElementById('staff-loading').classList.remove('hidden');
            document.getElementById('staff-details').classList.add('hidden');
            document.getElementById('staff-standby').classList.add('hidden');

            try {
                const response = await fetch(`${API_BASE}/attendance/today/${code}`);
                const data = await response.json();

                if (data.success) {
                    employeeInfo = data.staff;
                    
                    // Show staff details
                    document.getElementById('staff-loading').classList.add('hidden');
                    const detailsEl = document.getElementById('staff-details');
                    detailsEl.classList.remove('hidden');
                    
                    document.getElementById('staff-name').textContent = employeeInfo.ten_nhan_vien;
                    document.getElementById('staff-role').textContent = getRoleName(employeeInfo.vai_tro);
                    document.getElementById('staff-code-badge').textContent = employeeInfo.ma_nv_code;
                    
                    // Avatar construction
                    const avatarImg = document.getElementById('staff-avatar');
                    if (employeeInfo.anh_dai_dien) {
                        const avatarPath = employeeInfo.anh_dai_dien.startsWith('/') 
                            ? employeeInfo.anh_dai_dien 
                            : '/' + employeeInfo.anh_dai_dien;
                        avatarImg.src = `http://localhost:3000${avatarPath}`;
                    } else {
                        avatarImg.src = 'https://www.w3schools.com/howto/img_avatar.png'; // default fallback
                    }

                    // Render today's history
                    renderHistory(data.data);

                    // Enable attendance buttons since employee is verified
                    enableAttendanceButtons(true);
                    
                    // Initialize webcam
                    initWebcam();
                    
                } else {
                    showErrorState('Không thể tải hồ sơ nhân viên này.');
                }
            } catch (error) {
                console.error('Load staff profile error:', error);
                showErrorState('Không thể kết nối tới server. Vui lòng thử lại!');
            }
        }

        function showErrorState(msg) {
            document.getElementById('staff-loading').classList.add('hidden');
            document.getElementById('staff-details').classList.add('hidden');
            
            const standbyEl = document.getElementById('staff-standby');
            standbyEl.classList.remove('hidden');
            
            // Set error banner
            alert(msg);
        }

        // Render today's attendance log
        function renderHistory(records) {
            const listEl = document.getElementById('attendance-history-list');
            if (!records || records.length === 0) {
                listEl.innerHTML = `
                    <div class="text-center py-8 text-slate-500 text-sm flex flex-col items-center gap-2">
                        <i class="fa-regular fa-folder-open text-2xl"></i>
                        Chưa có lịch sử chấm công hôm nay
                    </div>
                `;
                return;
            }

            listEl.innerHTML = records.map(rec => {
                const statusInfo = getStatusTextAndClass(rec.trang_thai);
                return `
                    <div class="p-3.5 bg-slate-800/40 border border-white/5 hover:border-indigo-500/30 rounded-2xl transition flex items-center justify-between gap-3">
                        <div class="min-w-0">
                            <p class="text-sm font-bold text-slate-200">Ca trực: ${rec.ghi_chu ? rec.ghi_chu.split('|')[0].trim() : 'Chấm công khuôn mặt'}</p>
                            <p class="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                                <i class="fa-solid fa-arrow-right-to-bracket text-emerald-400"></i> ${rec.gio_vao || '--'} 
                                <span class="text-slate-600">|</span> 
                                <i class="fa-solid fa-arrow-right-from-bracket text-rose-400"></i> ${rec.gio_ra || '--'}
                            </p>
                        </div>
                        <div class="text-right">
                            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusInfo.badgeClass}">
                                ${statusInfo.text}
                            </span>
                            <p class="text-xs text-slate-400 mt-1">${rec.so_gio_lam ? rec.so_gio_lam + ' giờ' : '-- giờ'}</p>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function getStatusTextAndClass(status) {
            // Match backend status names ('dung_gio', 'di_muon', 've_som', 'ngoai_ca')
            switch(status) {
                case 'dung_gio':
                    return { text: 'Đúng giờ', badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
                case 'di_muon':
                    return { text: 'Đi muộn', badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' };
                case 've_som':
                    return { text: 'Về sớm', badgeClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' };
                case 'ngoai_ca':
                    return { text: 'Ngoài ca', badgeClass: 'bg-slate-500/10 text-slate-400 border border-slate-500/20' };
                default:
                    return { text: status || 'Không rõ', badgeClass: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' };
            }
        }

        function getRoleName(role) {
            const roles = {
                'admin': 'Quản trị',
                'manager': 'Quản lý',
                'cashier': 'Thu ngân',
                'waiter': 'Phục vụ bàn',
                'chef': 'Đầu bếp',
                'kitchen': 'Phụ bếp',
                'cleaner': 'Tạp vụ'
            };
            return roles[role] || role;
        }

        // Enable / Disable attendance actions
        function enableAttendanceButtons(enabled) {
            document.getElementById('btn-checkin').disabled = !enabled;
            document.getElementById('btn-checkout').disabled = !enabled;
        }

        // 3. Geolocation checking
        function initGeolocation() {
            const statusEl = document.getElementById('gps-status');
            const descEl = document.getElementById('gps-desc');
            const distanceEl = document.getElementById('gps-distance');
            const boxEl = document.getElementById('gps-box');
            const iconContainer = document.getElementById('gps-icon-container');
            const iconEl = document.getElementById('gps-icon');

            if (!navigator.geolocation) {
                statusEl.textContent = 'Thiếu định vị';
                descEl.textContent = 'Trình duyệt không hỗ trợ GPS.';
                boxEl.className = 'p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3';
                iconContainer.className = 'w-10 h-10 rounded-full flex items-center justify-center bg-rose-500/20 text-rose-400';
                iconEl.className = 'fa-solid fa-triangle-exclamation text-lg';
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };

                    // Compute distance
                    const distance = calculateDistance(
                        userLocation.lat, userLocation.lng,
                        RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng
                    );

                    distanceEl.textContent = `${Math.round(distance)} m`;

                    const inRadius = distance <= RESTAURANT_LOCATION.radius;
                    if (inRadius) {
                        statusEl.textContent = 'Hợp Lệ';
                        statusEl.className = 'text-sm font-bold text-emerald-400';
                        descEl.textContent = 'Bạn đang trong khu vực nhà hàng.';
                        boxEl.className = 'p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3';
                        iconContainer.className = 'w-10 h-10 rounded-full flex items-center justify-center bg-emerald-500/20 text-emerald-400';
                        iconEl.className = 'fa-solid fa-circle-check text-lg';
                    } else {
                        statusEl.textContent = 'Ngoài Vùng Phủ';
                        statusEl.className = 'text-sm font-bold text-amber-400';
                        descEl.textContent = `Cách nhà hàng khoảng ${Math.round(distance)}m.`;
                        boxEl.className = 'p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3';
                        iconContainer.className = 'w-10 h-10 rounded-full flex items-center justify-center bg-amber-500/20 text-amber-400';
                        iconEl.className = 'fa-solid fa-location-crosshairs text-lg animate-pulse';
                    }
                },
                (error) => {
                    console.error('GPS tracking error:', error);
                    statusEl.textContent = 'Lỗi Định Vị';
                    statusEl.className = 'text-sm font-bold text-rose-400';
                    descEl.textContent = 'Hãy cấp quyền truy cập vị trí trên trình duyệt.';
                    boxEl.className = 'p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3';
                    iconContainer.className = 'w-10 h-10 rounded-full flex items-center justify-center bg-rose-500/20 text-rose-400';
                    iconEl.className = 'fa-solid fa-xmark text-lg';
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        }

        // Calculate distance in meters using Haversine formula
        function calculateDistance(lat1, lon1, lat2, lon2) {
            const R = 6371e3; // Earth radius in meters
            const phi1 = lat1 * Math.PI / 180;
            const phi2 = lat2 * Math.PI / 180;
            const deltaPhi = (lat2 - lat1) * Math.PI / 180;
            const deltaLambda = (lon2 - lon1) * Math.PI / 180;

            const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
                      Math.cos(phi1) * Math.cos(phi2) *
                      Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            return R * c;
        }

        // 4. Webcam control
        async function initWebcam() {
            // Reset state
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            const camStatusEl = document.getElementById('camera-status-text');
            const wrapperEl = document.getElementById('viewport-wrapper');
            
            camStatusEl.innerHTML = '<i class="fa-solid fa-circle text-[8px] text-yellow-500 mr-1 animate-pulse"></i> Đang kết nối camera...';
            
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: 'user'
                    },
                    audio: false
                });

                videoEl.srcObject = stream;
                videoEl.style.display = 'block';
                placeholderEl.style.display = 'none';
                camStatusEl.innerHTML = '<i class="fa-solid fa-circle text-[8px] text-emerald-500 mr-1 animate-pulse"></i> Camera Sẵn Sàng';
                
                // Add scanning state class
                wrapperEl.classList.add('scanning');
                
                // Enable attendance buttons since webcam is ready
                enableAttendanceButtons(true);
            } catch (err) {
                console.error('Webcam initialization error:', err);
                camStatusEl.innerHTML = '<i class="fa-solid fa-circle text-[8px] text-rose-500 mr-1"></i> Lỗi Camera';
                alert('Không thể mở webcam. Vui lòng đảm bảo bạn đã cấp quyền sử dụng camera cho trang này!');
            }
        }

        function toggleCameraMirror() {
            isCameraMirror = !isCameraMirror;
            if (isCameraMirror) {
                videoEl.classList.add('transform', '-scale-x-100');
            } else {
                videoEl.classList.remove('transform', '-scale-x-100');
            }
        }

        // 5. Capture canvas image to Blob
        function captureFrameBlob() {
            return new Promise((resolve) => {
                const canvas = document.getElementById('snapshot-canvas');
                canvas.width = videoEl.videoWidth || 640;
                canvas.height = videoEl.videoHeight || 480;
                
                const ctx = canvas.getContext('2d');
                
                // If mirrored, flip context
                if (isCameraMirror) {
                    ctx.translate(canvas.width, 0);
                    ctx.scale(-1, 1);
                }

                ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
                
                // Reset transform if mirrored, so that text is not drawn backwards
                if (isCameraMirror) {
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                }

                // Draw dark bottom overlay
                ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
                ctx.fillRect(0, canvas.height - 70, canvas.width, 70);

                // Set font style for text
                ctx.fillStyle = '#FFFFFF';
                ctx.textBaseline = 'middle';
                
                // 1. Draw Title and Date/Time
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'left';
                const now = new Date();
                const timeStr = now.toLocaleTimeString('vi-VN') + ' ' + now.toLocaleDateString('vi-VN');
                ctx.fillText('MINH CHỨNG CHẤM CÔNG - ' + timeStr, 15, canvas.height - 45);

                // 2. Draw GPS coords if available
                ctx.font = '12px Arial';
                if (userLocation && userLocation.lat && userLocation.lng) {
                    ctx.fillStyle = '#E5E7EB';
                    ctx.fillText(`GPS: ${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`, 15, canvas.height - 20);
                } else {
                    ctx.fillStyle = '#FCA5A5';
                    ctx.fillText('Không có GPS định vị', 15, canvas.height - 20);
                }

                // 3. Draw Brand logo right-aligned
                ctx.fillStyle = '#FBBF24'; // Amber-400
                ctx.font = 'bold 18px Arial';
                ctx.textAlign = 'right';
                ctx.fillText('Ẩm thực Phương Nam', canvas.width - 15, canvas.height - 35);
                
                // Convert to blob jpeg
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', 0.95);
            });
        }

        // 6. Action implementation
        async function performFaceAttendance(type) {
            if (!stream) {
                alert('Vui lòng đợi camera sẵn sàng!');
                return;
            }

            // Check location with prompt if outside
            if (userLocation) {
                const distance = calculateDistance(
                    userLocation.lat, userLocation.lng,
                    RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng
                );
                
                if (distance > RESTAURANT_LOCATION.radius) {
                    const confirmLeave = confirm(`Bạn đang ở cách xa nhà hàng (${Math.round(distance)}m). Bạn có chắc chắn muốn tiếp tục chấm công?`);
                    if (!confirmLeave) return;
                }
            } else {
                const confirmNoGPS = confirm('Không phát hiện thấy tọa độ GPS của bạn. Tiếp tục chấm công không định vị?');
                if (!confirmNoGPS) return;
            }

            // Disable buttons & show loading spinner
            enableAttendanceButtons(false);
            const overlay = document.getElementById('processing-overlay');
            overlay.classList.remove('hidden');

            const viewport = document.getElementById('viewport-wrapper');
            viewport.classList.remove('success', 'error');
            viewport.classList.add('scanning');

            try {
                // Grabbing frame
                const imageBlob = await captureFrameBlob();
                const formData = new FormData();
                if (employeeCode) {
                    formData.append('ma_nv_code', employeeCode);
                }
                formData.append('image', imageBlob, 'capture.jpg');
                
                if (userLocation) {
                    formData.append('latitude', userLocation.lat);
                    formData.append('longitude', userLocation.lng);
                    formData.append('accuracy', userLocation.accuracy || 0);
                }

                const endpoint = type === 'checkin' ? 'face-checkin' : 'face-checkout';
                const response = await fetch(`${API_BASE}/attendance/${endpoint}`, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                // Stop loading state
                overlay.classList.add('hidden');

                if (result.success) {
                    // Success styling
                    viewport.classList.remove('scanning');
                    viewport.classList.add('success');
                    
                    // Audio beep
                    try { soundSuccess.play(); } catch(e) {}

                    // Show success banner
                    showResultOverlay(true, result.message, result.data?.ghi_chu || '');

                    // Reload historical table & update profile using the matched code
                    const matchedCode = result.data?.ma_nv_code || employeeCode;
                    if (matchedCode) {
                        loadStaffProfile(matchedCode);
                    }
                } else {
                    // Fail styling
                    viewport.classList.remove('scanning');
                    viewport.classList.add('error');
                    
                    // Audio error beep
                    try { soundError.play(); } catch(e) {}

                    // Show fail banner
                    let errorTitle = result.message || 'Xác nhận khuôn mặt không khớp.';
                    let errorDesc = 'Vui lòng chỉnh lại góc mặt và thử lại.';
                    if (result.message && result.message.includes('ca trực')) {
                        errorDesc = 'Vui lòng liên hệ quản lý để được phân ca làm việc.';
                    }
                    showResultOverlay(false, errorTitle, errorDesc);
                    
                    // Re-enable buttons
                    enableAttendanceButtons(true);
                }
            } catch (error) {
                console.error('Face verification error:', error);
                overlay.classList.add('hidden');
                viewport.classList.remove('scanning');
                viewport.classList.add('error');
                
                try { soundError.play(); } catch(e) {}
                showResultOverlay(false, 'Lỗi kết nối server!', 'Đã xảy ra lỗi khi gửi yêu cầu nhận diện khuôn mặt.');
                
                enableAttendanceButtons(true);
            }
        }

        // Float notification overlay helper
        function showResultOverlay(isSuccess, title, desc) {
            if (resultTimeout) clearTimeout(resultTimeout);

            const iconContainer = document.getElementById('result-status-icon');
            const titleEl = document.getElementById('result-status-title');
            const descEl = document.getElementById('result-status-desc');
            
            if (isSuccess) {
                overlayEl.classList.remove('border-l-rose-500');
                overlayEl.classList.add('border-l-emerald-500');
                iconContainer.className = 'w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400';
                iconContainer.innerHTML = '<i class="fa-solid fa-circle-check text-lg"></i>';
            } else {
                overlayEl.classList.remove('border-l-emerald-500');
                overlayEl.classList.add('border-l-rose-500');
                iconContainer.className = 'w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400';
                iconContainer.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-lg"></i>';
            }

            titleEl.textContent = title;
            descEl.textContent = desc;

            overlayEl.classList.remove('hidden');
            setTimeout(() => {
                overlayEl.classList.remove('translate-y-2', 'opacity-0');
            }, 50);

            // Auto hide after 6 seconds for success, 25 seconds for errors
            resultTimeout = setTimeout(() => {
                hideResultOverlay();
            }, isSuccess ? 6000 : 25000);
        }

        function hideResultOverlay() {
            overlayEl.classList.add('translate-y-2', 'opacity-0');
            setTimeout(() => {
                overlayEl.classList.add('hidden');
            }, 300);
        }

        // Main init entry
        window.addEventListener('DOMContentLoaded', () => {
            const code = getQueryCode();
            
            // Trigger GPS immediately
            loadGPSConfig().then(() => {
                initGeolocation();
            });
            
            // Auto refresh GPS location
            setInterval(initGeolocation, 15000);

            // Always initialize camera on load
            initWebcam();

            if (code) {
                loadStaffProfile(code);
            } else {
                // Show standby status
                document.getElementById('staff-loading').classList.add('hidden');
                document.getElementById('staff-standby').classList.remove('hidden');
            }
        });
