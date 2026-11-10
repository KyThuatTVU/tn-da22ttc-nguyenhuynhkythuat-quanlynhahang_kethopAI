/* ==== Script 1 (tách từ /admin/quan-ly-quyen-nhan-vien/) ==== */
let staffId = null;
        let currentPermissions = {};
        let permissionsList = {};

        // Lấy staff ID từ URL
        function getStaffIdFromUrl() {
            const params = new URLSearchParams(window.location.search);
            return params.get('id');
        }

        // Load thông tin nhân viên
        async function loadStaffInfo() {
            try {
                staffId = getStaffIdFromUrl();
                if (!staffId) {
                    alert('Không tìm thấy ID nhân viên!');
                    window.location.href = '/admin/staff/';
                    return;
                }

                const response = await fetch(`http://localhost:3000/api/staff?search=${staffId}`);
                const data = await response.json();
                
                if (data.success && data.data.length > 0) {
                    const staff = data.data[0];
                    const roleClass = `role-${staff.vai_tro}`;
                    const roleName = staff.vai_tro === 'manager' ? 'Quản lý' : 
                                   staff.vai_tro === 'kitchen' ? 'Bếp' : 'Phục vụ';
                    
                    document.getElementById('staffInfo').innerHTML = `
                        <span class="font-semibold">${staff.ten_nhan_vien}</span>
                        <span class="role-badge ${roleClass} ml-2">${roleName}</span>
                        <span class="text-gray-400 ml-2">• ${staff.ma_nv_code}</span>
                    `;
                }
            } catch (error) {
                console.error('Error loading staff info:', error);
            }
        }

        // Load danh sách quyền
        async function loadPermissionsList() {
            try {
                const response = await fetch('http://localhost:3000/api/staff/permissions/list');
                const data = await response.json();
                
                if (data.success) {
                    permissionsList = data.data;
                }
            } catch (error) {
                console.error('Error loading permissions list:', error);
            }
        }

        // Load quyền hiện tại của nhân viên
        async function loadCurrentPermissions() {
            try {
                showLoading(true);
                const response = await fetch(`http://localhost:3000/api/staff/${staffId}/permissions`);
                const data = await response.json();
                
                if (data.success) {
                    currentPermissions = data.data;
                    renderPermissions();
                }
            } catch (error) {
                console.error('Error loading permissions:', error);
                alert('Lỗi tải quyền!');
            } finally {
                showLoading(false);
            }
        }

        // Render permissions UI
        function renderPermissions() {
            const container = document.getElementById('permissionsContainer');
            container.innerHTML = '';

            for (const [groupName, permissions] of Object.entries(permissionsList)) {
                const card = document.createElement('div');
                card.className = 'permission-card bg-white rounded-lg shadow-md p-5';
                
                let permissionsHtml = '';
                permissions.forEach(perm => {
                    const isChecked = currentPermissions[perm.key] === 1;
                    permissionsHtml += `
                        <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                            <div class="flex items-center space-x-3">
                                <i class="fas ${perm.icon} text-gray-400 w-5"></i>
                                <span class="text-sm text-gray-700">${perm.label}</span>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" 
                                       data-permission="${perm.key}" 
                                       ${isChecked ? 'checked' : ''}
                                       onchange="updatePermission('${perm.key}', this.checked)">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    `;
                });

                card.innerHTML = `
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-bold text-gray-800">${groupName}</h3>
                        <span class="text-xs text-gray-500">${permissions.length} quyền</span>
                    </div>
                    <div class="space-y-1">
                        ${permissionsHtml}
                    </div>
                `;
                
                container.appendChild(card);
            }
        }

        // Cập nhật quyền trong memory
        function updatePermission(key, value) {
            currentPermissions[key] = value ? 1 : 0;
        }

        // Bật/tắt tất cả quyền
        function toggleAllPermissions(enable) {
            const checkboxes = document.querySelectorAll('input[type="checkbox"][data-permission]');
            checkboxes.forEach(cb => {
                cb.checked = enable;
                updatePermission(cb.dataset.permission, enable);
            });
        }

        // Lưu quyền
        async function savePermissions() {
            try {
                if (!confirm('Bạn có chắc muốn lưu các thay đổi quyền?')) {
                    return;
                }

                showLoading(true);
                
                const response = await fetch(`http://localhost:3000/api/staff/${staffId}/permissions`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(currentPermissions)
                });

                const data = await response.json();
                
                if (data.success) {
                    alert('✅ Lưu quyền thành công!\n\n⚠️ LƯU Ý: Nhân viên cần ĐĂNG XUẤT và ĐĂNG NHẬP LẠI hoặc REFRESH trang để quyền mới có hiệu lực.');
                    await loadCurrentPermissions();
                } else {
                    alert('❌ ' + (data.message || 'Lỗi lưu quyền!'));
                }
            } catch (error) {
                console.error('Error saving permissions:', error);
                alert('❌ Lỗi kết nối server!');
            } finally {
                showLoading(false);
            }
        }

        // Đặt lại quyền mặc định
        async function resetToDefault() {
            try {
                if (!confirm('Bạn có chắc muốn đặt lại quyền về mặc định theo vai trò?')) {
                    return;
                }

                showLoading(true);
                
                const response = await fetch(`http://localhost:3000/api/staff/${staffId}/permissions/reset`, {
                    method: 'POST'
                });

                const data = await response.json();
                
                if (data.success) {
                    alert('✅ Đặt lại quyền mặc định thành công!');
                    await loadCurrentPermissions();
                } else {
                    alert('❌ ' + (data.message || 'Lỗi đặt lại quyền!'));
                }
            } catch (error) {
                console.error('Error resetting permissions:', error);
                alert('❌ Lỗi kết nối server!');
            } finally {
                showLoading(false);
            }
        }

        // Show/hide loading
        function showLoading(show) {
            document.getElementById('loadingOverlay').classList.toggle('hidden', !show);
        }

        // Initialize
        async function init() {
            await loadStaffInfo();
            await loadPermissionsList();
            await loadCurrentPermissions();
        }

        init();
