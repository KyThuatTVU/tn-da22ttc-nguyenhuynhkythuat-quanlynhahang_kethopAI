/* ==== Script 1 (tách từ /admin/settings/) ==== */
let map;
        let marker;
        let geocoder;

        // Kiểm tra Google Maps API có sẵn không
        function isGoogleMapsAvailable() {
            return typeof google !== 'undefined' && google.maps;
        }

        // Khởi tạo Google Maps (nếu có API key hợp lệ)
        function initMap() {
            if (!isGoogleMapsAvailable()) {
                showMapPlaceholder();
                return;
            }

            try {
                // Tọa độ TVU
                const tvuLocation = { lat: 9.9234, lng: 106.3465 };
                
                geocoder = new google.maps.Geocoder();
                
                map = new google.maps.Map(document.getElementById('map'), {
                    center: tvuLocation,
                    zoom: 17,
                    mapTypeControl: true,
                    streetViewControl: true,
                    fullscreenControl: true,
                    mapId: 'DEMO_MAP_ID' // Required for AdvancedMarkerElement
                });

                // Sử dụng Marker cũ (vẫn hoạt động, chỉ deprecated)
                marker = new google.maps.Marker({
                    position: tvuLocation,
                    map: map,
                    draggable: true,
                    title: 'Vị trí nhà hàng'
                });

                // Cập nhật tọa độ khi kéo marker
                marker.addListener('dragend', function(event) {
                    updateLocationInfo(event.latLng.lat(), event.latLng.lng());
                    reverseGeocode(event.latLng);
                });

                // Click trên bản đồ để đặt marker
                map.addListener('click', function(event) {
                    marker.setPosition(event.latLng);
                    updateLocationInfo(event.latLng.lat(), event.latLng.lng());
                    reverseGeocode(event.latLng);
                });

                // Autocomplete cho ô địa chỉ (nếu có Places API)
                if (google.maps.places) {
                    const addressInput = document.getElementById('dia_chi');
                    const autocomplete = new google.maps.places.Autocomplete(addressInput, {
                        componentRestrictions: { country: 'vn' },
                        fields: ['address_components', 'geometry', 'name', 'formatted_address']
                    });

                    autocomplete.addListener('place_changed', function() {
                        const place = autocomplete.getPlace();
                        if (place.geometry) {
                            const location = place.geometry.location;
                            map.setCenter(location);
                            map.setZoom(17);
                            marker.setPosition(location);
                            updateLocationInfo(location.lat(), location.lng());
                            addressInput.value = place.formatted_address || place.name;
                        }
                    });
                }

                // Set tọa độ TVU mặc định
                updateLocationInfo(tvuLocation.lat, tvuLocation.lng);
                reverseGeocode(new google.maps.LatLng(tvuLocation.lat, tvuLocation.lng));
                
                console.log('✅ Google Maps initialized successfully');
            } catch (error) {
                console.error('❌ Google Maps initialization error:', error);
                showMapPlaceholder();
            }
        }

        // Hiển thị placeholder khi không có Google Maps
        function showMapPlaceholder() {
            const mapEl = document.getElementById('map');
            const noticeEl = document.getElementById('api-key-notice');
            
            mapEl.innerHTML = `
                <div class="map-placeholder">
                    <i class="fas fa-map-marked-alt"></i>
                    <h3 class="text-xl font-bold mb-2">Google Maps chưa khả dụng</h3>
                    <p class="text-sm opacity-90 max-w-md">
                        Cần Google Maps API Key để hiển thị bản đồ tương tác.
                        <br>Bạn vẫn có thể nhập tọa độ thủ công bên dưới.
                    </p>
                    <div class="mt-4 flex gap-2">
                        <button onclick="window.open('https://console.cloud.google.com/google/maps-apis/credentials', '_blank')" 
                                class="px-4 py-2 bg-white text-purple-700 rounded-lg font-semibold hover:bg-purple-50 transition">
                            <i class="fas fa-key mr-2"></i>Lấy API Key
                        </button>
                        <button onclick="setTVULocation()" 
                                class="px-4 py-2 bg-purple-800 text-white rounded-lg font-semibold hover:bg-purple-900 transition">
                            <i class="fas fa-university mr-2"></i>Dùng TVU
                        </button>
                    </div>
                </div>
            `;
            
            noticeEl.classList.remove('hidden');
            
            // Set tọa độ TVU mặc định
            setTVULocation();
        }

        // Set tọa độ TVU thủ công
        function setTVULocation() {
            document.getElementById('latitude').value = '9.9234';
            document.getElementById('longitude').value = '106.3465';
            document.getElementById('radius').value = '500';
            document.getElementById('dia_chi').value = 'Trường Đại học Trà Vinh, 126 Nguyễn Thiện Thành, Phường 5, TP. Trà Vinh';
            
            // Hiển thị thông báo
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
            notification.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Đã thiết lập tọa độ TVU';
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }

        // Cập nhật thông tin tọa độ
        function updateLocationInfo(lat, lng) {
            document.getElementById('latitude').value = lat.toFixed(6);
            document.getElementById('longitude').value = lng.toFixed(6);
        }

        // Chuyển đổi tọa độ thành địa chỉ
        function reverseGeocode(latLng) {
            if (!geocoder) return;
            
            geocoder.geocode({ location: latLng }, function(results, status) {
                if (status === 'OK' && results[0]) {
                    document.getElementById('dia_chi').value = results[0].formatted_address;
                }
            });
        }

        async function loadSettings() {
            try {
                const res = await fetch(`${API_URL}/settings`, { credentials: 'include' });
                const data = (await res.json()).data;
                if (!data) return;
                
                document.getElementById('ten_nha_hang').value = data.ten_nha_hang || '';
                document.getElementById('so_dien_thoai').value = data.so_dien_thoai || '';
                document.getElementById('email').value = data.email || '';
                document.getElementById('website').value = data.website || '';
                document.getElementById('dia_chi').value = data.dia_chi || '';
                
                // Load tọa độ GPS nếu có
                if (data.latitude && data.longitude) {
                    const lat = parseFloat(data.latitude);
                    const lng = parseFloat(data.longitude);
                    document.getElementById('latitude').value = lat.toFixed(6);
                    document.getElementById('longitude').value = lng.toFixed(6);
                    
                    // Cập nhật bản đồ nếu có
                    if (map && marker) {
                        const location = { lat: lat, lng: lng };
                        map.setCenter(location);
                        marker.setPosition(location);
                    }
                }
                
                if (data.radius) {
                    document.getElementById('radius').value = data.radius;
                }
                
                if (data.gio_mo_cua_t2_t6) { const [o, c] = data.gio_mo_cua_t2_t6.split('-'); document.getElementById('gio_mo_t2t6').value = o; document.getElementById('gio_dong_t2t6').value = c; }
                if (data.gio_mo_cua_t7_cn) { const [o, c] = data.gio_mo_cua_t7_cn.split('-'); document.getElementById('gio_mo_t7cn').value = o; document.getElementById('gio_dong_t7cn').value = c; }
                document.getElementById('cho_phep_giao_hang').checked = data.cho_phep_giao_hang === '1';
                document.getElementById('phi_giao_hang').value = data.phi_giao_hang || '';
                document.getElementById('mien_phi_giao_hang_tu').value = data.mien_phi_giao_hang_tu || '';
                document.getElementById('facebook_url').value = data.facebook_url || '';
                document.getElementById('youtube_url').value = data.youtube_url || '';
                document.getElementById('hieu_ung_intro_giang_sinh').checked = data.hieu_ung_intro_giang_sinh === '1';
                document.getElementById('hieu_ung_intro_tet').checked = data.hieu_ung_intro_tet === '1';
                document.getElementById('hieu_ung_tuyet').checked = data.hieu_ung_tuyet === '1';
                document.getElementById('hieu_ung_hoa_mai').checked = data.hieu_ung_hoa_mai === '1';
                document.getElementById('hieu_ung_hoa_osaka_admin').checked = data.hieu_ung_hoa_osaka_admin === '1';
            } catch (e) { console.error(e); }
        }

        async function saveBulk(settings) {
            try { const res = await fetch(`${API_URL}/settings/bulk`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ settings }), credentials: 'include' }); return await res.json(); } catch (e) { return { success: false }; }
        }

        async function saveRestaurantInfo(e) { 
            e.preventDefault(); 
            
            // Validate tọa độ
            const lat = document.getElementById('latitude').value;
            const lng = document.getElementById('longitude').value;
            
            if (!lat || !lng) {
                alert('⚠️ Vui lòng nhập tọa độ GPS (Latitude và Longitude)');
                return;
            }
            
            const res = await saveBulk({ 
                ten_nha_hang: document.getElementById('ten_nha_hang').value, 
                so_dien_thoai: document.getElementById('so_dien_thoai').value, 
                email: document.getElementById('email').value, 
                website: document.getElementById('website').value, 
                dia_chi: document.getElementById('dia_chi').value,
                latitude: lat,
                longitude: lng,
                radius: document.getElementById('radius').value
            }); 
            
            if (res.success) {
                alert('✅ Đã lưu thông tin nhà hàng và tọa độ GPS!\n\n📍 Tọa độ: ' + lat + ', ' + lng + '\n📏 Bán kính: ' + document.getElementById('radius').value + 'm');
            } else {
                alert('❌ Lỗi khi lưu. Vui lòng thử lại!');
            }
        }
        
        async function saveBusinessHours() { const res = await saveBulk({ gio_mo_cua_t2_t6: `${document.getElementById('gio_mo_t2t6').value}-${document.getElementById('gio_dong_t2t6').value}`, gio_mo_cua_t7_cn: `${document.getElementById('gio_mo_t7cn').value}-${document.getElementById('gio_dong_t7cn').value}` }); alert(res.success ? 'Đã lưu' : 'Lỗi'); }
        async function saveDeliverySettings() { const res = await saveBulk({ cho_phep_giao_hang: document.getElementById('cho_phep_giao_hang').checked ? '1' : '0', phi_giao_hang: document.getElementById('phi_giao_hang').value, mien_phi_giao_hang_tu: document.getElementById('mien_phi_giao_hang_tu').value }); alert(res.success ? 'Đã lưu' : 'Lỗi'); }
        async function saveSocialMedia() { const res = await saveBulk({ facebook_url: document.getElementById('facebook_url').value, youtube_url: document.getElementById('youtube_url').value }); alert(res.success ? 'Đã lưu' : 'Lỗi'); }
        async function saveEffectSetting(k, v) {
            await fetch(`${API_URL}/settings/${k}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value: v ? '1' : '0' }), credentials: 'include' });
            if (k === 'hieu_ung_hoa_osaka_admin' && window.OsakaFlowerEffect) {
                window.OsakaFlowerEffect.refresh();
            }
        }

        function previewChristmasIntro() { if (!window.ChristmasIntro) { const s = document.createElement('script'); s.src = '../js/christmas-intro.js'; s.onload = () => window.ChristmasIntro.show(); document.head.appendChild(s); } else window.ChristmasIntro.show(); }
        function previewTetIntro() { if (!window.TetIntro) { const s = document.createElement('script'); s.src = '../js/tet-intro.js'; s.onload = () => window.TetIntro.show(); document.head.appendChild(s); } else window.TetIntro.show(); }
        function stopAllEffects() { if (window.ChristmasIntro) window.ChristmasIntro.hide?.(); if (window.TetIntro) window.TetIntro.hide?.(); }

        // Khởi tạo khi trang load
        window.addEventListener('load', function() {
            loadSettings();
            
            // Đợi Google Maps load (nếu có)
            if (isGoogleMapsAvailable()) {
                initMap();
            } else {
                // Thử lại sau 2 giây (trường hợp script load chậm)
                setTimeout(() => {
                    if (isGoogleMapsAvailable()) {
                        initMap();
                    } else {
                        showMapPlaceholder();
                    }
                }, 2000);
            }
        });

        // Khởi tạo Flatpickr cho các input giờ
        const fpConfig = {
            enableTime: true,
            noCalendar: true,
            dateFormat: "H:i",
            time_24hr: true,
            disableMobile: "true"
        };
        flatpickr(".time-picker", fpConfig);
