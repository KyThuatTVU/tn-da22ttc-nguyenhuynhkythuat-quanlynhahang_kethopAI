/* ==== Script 1 (tách từ cham-cong.html) ==== */
const API_BASE = 'http://localhost:3000/api';
        let currentMethod = 'code';
        let cameraStream = null;
        let userLocation = null;
        let capturedPhoto = null;

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

        // Update clock
        function updateClock() {
            const now = new Date();
            const time = now.toLocaleTimeString('vi-VN', { hour12: false });
            const date = now.toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
            });
            document.getElementById('clock').textContent = time;
            document.getElementById('date').textContent = date;
        }
        setInterval(updateClock, 1000);
        updateClock();

        // Switch input method
        function switchMethod(method) {
            currentMethod = method;
            document.getElementById('method-code').classList.toggle('hidden', method !== 'code');
            document.getElementById('method-qr').classList.toggle('hidden', method !== 'qr');
            
            document.getElementById('btn-method-code').className = method === 'code' 
                ? 'flex-1 py-3 rounded-xl font-semibold transition bg-purple-600 text-white'
                : 'flex-1 py-3 rounded-xl font-semibold transition bg-gray-200 text-gray-700';
            
            document.getElementById('btn-method-qr').className = method === 'qr'
                ? 'flex-1 py-3 rounded-xl font-semibold transition bg-purple-600 text-white'
                : 'flex-1 py-3 rounded-xl font-semibold transition bg-gray-200 text-gray-700';
        }

        // Get user location
        function getUserLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        userLocation = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        checkLocationValidity();
                    },
                    (error) => {
                        document.getElementById('locationText').innerHTML = 
                            '<i class="fas fa-exclamation-triangle text-yellow-600 mr-2"></i>Không thể xác định vị trí';
                        console.error('Location error:', error);
                    }
                );
            } else {
                document.getElementById('locationText').innerHTML = 
                    '<i class="fas fa-times-circle text-red-600 mr-2"></i>Trình duyệt không hỗ trợ GPS';
            }
        }

        // Check if user is within restaurant radius
        function checkLocationValidity() {
            if (!userLocation) return false;

            const distance = calculateDistance(
                userLocation.lat, userLocation.lng,
                RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng
            );

            const isValid = distance <= RESTAURANT_LOCATION.radius;
            const locationEl = document.getElementById('locationStatus');
            
            if (isValid) {
                locationEl.className = 'p-3 bg-green-100 rounded-lg text-sm';
                document.getElementById('locationText').innerHTML = 
                    `<i class="fas fa-check-circle text-green-600 mr-2"></i>Bạn đang ở nhà hàng (${Math.round(distance)}m)`;
            } else {
                locationEl.className = 'p-3 bg-red-100 rounded-lg text-sm';
                document.getElementById('locationText').innerHTML = 
                    `<i class="fas fa-times-circle text-red-600 mr-2"></i>Bạn không ở nhà hàng (${Math.round(distance)}m)`;
            }

            return isValid;
        }

        // Calculate distance between two coordinates (Haversine formula)
        function calculateDistance(lat1, lon1, lat2, lon2) {
            const R = 6371e3; // Earth radius in meters
            const φ1 = lat1 * Math.PI / 180;
            const φ2 = lat2 * Math.PI / 180;
            const Δφ = (lat2 - lat1) * Math.PI / 180;
            const Δλ = (lon2 - lon1) * Math.PI / 180;

            const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            return R * c;
        }

        // Toggle camera
        async function toggleCamera() {
            const video = document.getElementById('video');
            const btn = document.getElementById('btn-camera');
            const section = document.getElementById('cameraSection');

            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
                cameraStream = null;
                btn.innerHTML = '<i class="fas fa-camera mr-2"></i>Bật Camera';
                video.style.display = 'none';
            } else {
                try {
                    cameraStream = await navigator.mediaDevices.getUserMedia({ 
                        video: { facingMode: 'user' } 
                    });
                    video.srcObject = cameraStream;
                    video.style.display = 'block';
                    btn.innerHTML = '<i class="fas fa-camera-slash mr-2"></i>Tắt Camera';
                } catch (error) {
                    alert('Không thể truy cập camera: ' + error.message);
                }
            }
        }

        // Capture photo from camera
        function capturePhoto() {
            if (!cameraStream) return null;

            const video = document.getElementById('video');
            const canvas = document.getElementById('canvas');
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            
            // Draw original video frame
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
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

            return canvas.toDataURL('image/jpeg', 0.8);
        }

        // Check In
        async function checkIn() {
            const staffCode = document.getElementById('staffCode').value.trim().toUpperCase();
            
            if (!staffCode) {
                alert('Vui lòng nhập mã nhân viên!');
                return;
            }

            // Check location
            if (!checkLocationValidity()) {
                if (!confirm('Bạn không ở trong phạm vi nhà hàng. Vẫn muốn chấm công?')) {
                    return;
                }
            }

            // Capture photo if camera is on
            if (cameraStream) {
                capturedPhoto = capturePhoto();
            }

            try {
                const response = await fetch(`${API_BASE}/attendance/check-in`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ma_nv_code: staffCode,
                        location: userLocation,
                        photo: capturedPhoto
                    })
                });

                const data = await response.json();

                if (data.success) {
                    showStatus('success', 'Vào ca thành công!', data.data);
                    loadTodayAttendance(staffCode);
                    document.getElementById('staffCode').value = '';
                } else {
                    showStatus('error', data.message || 'Có lỗi xảy ra!');
                }
            } catch (error) {
                console.error('Check-in error:', error);
                showStatus('error', 'Lỗi kết nối server!');
            }
        }

        // Check Out
        async function checkOut() {
            const staffCode = document.getElementById('staffCode').value.trim().toUpperCase();
            
            if (!staffCode) {
                alert('Vui lòng nhập mã nhân viên!');
                return;
            }

            // Check location
            if (!checkLocationValidity()) {
                if (!confirm('Bạn không ở trong phạm vi nhà hàng. Vẫn muốn chấm công?')) {
                    return;
                }
            }

            // Capture photo if camera is on
            if (cameraStream) {
                capturedPhoto = capturePhoto();
            }

            try {
                const response = await fetch(`${API_BASE}/attendance/check-out`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ma_nv_code: staffCode,
                        location: userLocation,
                        photo: capturedPhoto
                    })
                });

                const data = await response.json();

                if (data.success) {
                    showStatus('success', 'Tan ca thành công!', data.data);
                    loadTodayAttendance(staffCode);
                    document.getElementById('staffCode').value = '';
                } else {
                    showStatus('error', data.message || 'Có lỗi xảy ra!');
                }
            } catch (error) {
                console.error('Check-out error:', error);
                showStatus('error', 'Lỗi kết nối server!');
            }
        }

        // Show status message
        function showStatus(type, message, data = null) {
            const statusDisplay = document.getElementById('statusDisplay');
            const statusMessage = document.getElementById('statusMessage');
            const statusTime = document.getElementById('statusTime');

            statusDisplay.className = type === 'success' 
                ? 'mb-6 p-4 rounded-xl text-center bg-green-100 text-green-800'
                : 'mb-6 p-4 rounded-xl text-center bg-red-100 text-red-800';

            statusMessage.textContent = message;
            
            if (data) {
                const time = data.gio_vao || data.gio_ra;
                statusTime.textContent = `Thời gian: ${time}`;
            } else {
                statusTime.textContent = '';
            }

            statusDisplay.classList.remove('hidden');

            setTimeout(() => {
                statusDisplay.classList.add('hidden');
            }, 5000);
        }

        // Load today's attendance
        async function loadTodayAttendance(staffCode) {
            try {
                const today = new Date().toISOString().split('T')[0];
                const response = await fetch(`${API_BASE}/attendance/today/${staffCode}`, {
                    credentials: 'include'
                });

                const data = await response.json();

                if (data.success && data.data.length > 0) {
                    const html = data.data.map(record => `
                        <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p class="font-semibold">${record.ten_nhan_vien}</p>
                                <p class="text-sm text-gray-600">
                                    Vào: ${record.gio_vao || '-'} | Ra: ${record.gio_ra || '-'}
                                </p>
                            </div>
                            <div class="text-right">
                                <span class="px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(record.trang_thai)}">
                                    ${record.trang_thai}
                                </span>
                                <p class="text-sm text-gray-600 mt-1">${record.so_gio_lam || 0} giờ</p>
                            </div>
                        </div>
                    `).join('');
                    document.getElementById('todayAttendance').innerHTML = html;
                } else {
                    document.getElementById('todayAttendance').innerHTML = 
                        '<p class="text-gray-500 text-center py-4">Chưa có bản ghi chấm công</p>';
                }
            } catch (error) {
                console.error('Load attendance error:', error);
            }
        }

        function getStatusClass(status) {
            switch(status) {
                case 'Đúng giờ': return 'bg-green-100 text-green-800';
                case 'Đi muộn': return 'bg-yellow-100 text-yellow-800';
                case 'Về sớm': return 'bg-red-100 text-red-800';
                default: return 'bg-gray-100 text-gray-800';
            }
        }

        // QR Scanner (placeholder - requires html5-qrcode library)
        function startQRScanner() {
            alert('Tính năng quét QR đang được phát triển. Vui lòng sử dụng phương thức nhập mã.');
        }

        // Initialize
        loadGPSConfig().then(() => {
            getUserLocation();
        });
        
        // Auto-refresh location every 30 seconds
        setInterval(getUserLocation, 30000);
