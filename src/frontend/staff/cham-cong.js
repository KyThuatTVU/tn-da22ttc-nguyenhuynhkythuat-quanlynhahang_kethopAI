/* ==== Script 1 (tách từ /staff/cham-cong/) ==== */
const API_URL = 'http://localhost:3000/api';
        let video, canvas, stream;
        let currentLocation = null;
        let staffData = null;

        // Khởi tạo
        document.addEventListener('DOMContentLoaded', async () => {
            // Lấy thông tin nhân viên
            staffData = JSON.parse(sessionStorage.getItem('staff_user'));
            if (!staffData) {
                alert('Vui lòng đăng nhập!');
                window.location.href = '/staff/login/';
                return;
            }

            document.getElementById('staffInfo').textContent = 
                `${staffData.ten_nhan_vien} - ${staffData.ma_nv_code}`;

            // Khởi tạo camera
            await initCamera();
            
            // Lấy vị trí
            await getLocation();
            
            // Cập nhật thời gian
            updateTime();
            setInterval(updateTime, 1000);

            // Load lịch sử hôm nay
            await loadTodayHistory();
        });

        // Khởi tạo camera
        async function initCamera() {
            try {
                video = document.getElementById('video');
                canvas = document.getElementById('canvas');
                
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        facingMode: 'user',
                        width: { ideal: 1280 },
                        height: { ideal: 960 }
                    } 
                });
                
                video.srcObject = stream;
                showStatus('Camera đã sẵn sàng', 'success');
            } catch (err) {
                console.error('Camera error:', err);
                showStatus('Không thể truy cập camera. Vui lòng cấp quyền!', 'error');
            }
        }

        // Lấy vị trí GPS
        async function getLocation() {
            if (!navigator.geolocation) {
                document.getElementById('locationText').textContent = '📍 Không hỗ trợ GPS';
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    currentLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    document.getElementById('locationText').textContent = 
                        `📍 ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`;
                },
                (error) => {
                    console.error('Location error:', error);
                    document.getElementById('locationText').textContent = '📍 Không lấy được vị trí';
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        }

        // Cập nhật thời gian
        function updateTime() {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('vi-VN');
            const dateStr = now.toLocaleDateString('vi-VN');
            document.getElementById('currentTime').textContent = `${dateStr} ${timeStr}`;
            document.getElementById('timeText').textContent = `🕐 ${timeStr}`;
        }

        // Chụp ảnh và chấm công
        async function capturePhoto(type) {
            if (!currentLocation) {
                showStatus('Đang lấy vị trí GPS, vui lòng đợi...', 'warning');
                return;
            }

            const btn = type === 'checkin' ? document.getElementById('btnCheckin') : document.getElementById('btnCheckout');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Đang xử lý...';

            try {
                // Chụp ảnh từ video
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                
                // Vẽ video lên canvas (flip lại để đúng hướng)
                ctx.save();
                ctx.scale(-1, 1);
                ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
                ctx.restore();

                // Vẽ metadata lên ảnh
                const now = new Date();
                const metadata = [
                    `Nhân viên: ${staffData.ten_nhan_vien} (${staffData.ma_nv_code})`,
                    `Thời gian: ${now.toLocaleString('vi-VN')}`,
                    `Vị trí: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`,
                    `Loại: ${type === 'checkin' ? 'CHECK IN' : 'CHECK OUT'}`
                ];

                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(10, canvas.height - 110, 500, 100);
                ctx.fillStyle = 'white';
                ctx.font = '14px monospace';
                metadata.forEach((text, i) => {
                    ctx.fillText(text, 20, canvas.height - 90 + (i * 20));
                });

                // Chuyển canvas thành blob
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
                
                // Tạo FormData
                const formData = new FormData();
                formData.append('image', blob, `${type}_${Date.now()}.jpg`);
                formData.append('ma_nhan_vien', staffData.ma_nhan_vien);
                formData.append('loai', type);
                formData.append('latitude', currentLocation.latitude);
                formData.append('longitude', currentLocation.longitude);
                formData.append('accuracy', currentLocation.accuracy);

                // Gửi lên server
                const response = await fetch(`${API_URL}/attendance/checkin`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    showStatus(
                        type === 'checkin' ? '✅ Check In thành công!' : '✅ Check Out thành công!', 
                        'success'
                    );
                    await loadTodayHistory();
                } else {
                    showStatus('❌ ' + result.message, 'error');
                }
            } catch (err) {
                console.error('Capture error:', err);
                showStatus('❌ Có lỗi xảy ra: ' + err.message, 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = type === 'checkin' ? 
                    '<i class="fas fa-sign-in-alt mr-2"></i>Check In' : 
                    '<i class="fas fa-sign-out-alt mr-2"></i>Check Out';
            }
        }

        // Load lịch sử hôm nay
        async function loadTodayHistory() {
            try {
                const today = new Date().toISOString().split('T')[0];
                const response = await fetch(
                    `${API_URL}/attendance?ma_nhan_vien=${staffData.ma_nhan_vien}&start=${today}&end=${today}`,
                    { credentials: 'include' }
                );
                const result = await response.json();

                const container = document.getElementById('historyToday');
                
                if (result.success && result.data.length > 0) {
                    container.innerHTML = result.data.map(record => `
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 rounded-full flex items-center justify-center ${
                                    record.loai === 'checkin' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                }">
                                    <i class="fas fa-${record.loai === 'checkin' ? 'sign-in-alt' : 'sign-out-alt'}"></i>
                                </div>
                                <div>
                                    <div class="font-semibold text-gray-800">
                                        ${record.loai === 'checkin' ? 'Check In' : 'Check Out'}
                                    </div>
                                    <div class="text-sm text-gray-500">
                                        ${new Date(record.thoi_gian).toLocaleTimeString('vi-VN')}
                                    </div>
                                </div>
                            </div>
                            ${record.anh_cham_cong ? `
                                <button onclick="viewImage('${record.anh_cham_cong}')" 
                                        class="text-blue-600 hover:text-blue-700">
                                    <i class="fas fa-image"></i>
                                </button>
                            ` : ''}
                        </div>
                    `).join('');
                } else {
                    container.innerHTML = '<p class="text-gray-500 text-sm italic">Chưa có chấm công nào hôm nay</p>';
                }
            } catch (err) {
                console.error('Load history error:', err);
            }
        }

        // Xem ảnh
        function viewImage(imagePath) {
            window.open(`${API_URL.replace('/api', '')}/${imagePath}`, '_blank');
        }

        // Hiển thị thông báo
        function showStatus(message, type) {
            const statusDiv = document.getElementById('statusMessage');
            statusDiv.className = `mb-4 p-4 rounded-xl ${
                type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' :
                type === 'error' ? 'bg-red-100 text-red-800 border border-red-300' :
                'bg-yellow-100 text-yellow-800 border border-yellow-300'
            }`;
            statusDiv.textContent = message;
            statusDiv.classList.remove('hidden');

            setTimeout(() => {
                statusDiv.classList.add('hidden');
            }, 5000);
        }

        // Cleanup khi rời trang
        window.addEventListener('beforeunload', () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        });
