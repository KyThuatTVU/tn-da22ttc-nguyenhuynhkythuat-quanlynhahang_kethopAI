/* ==== Script 1 (tách từ /admin/admins/) ==== */
// Kiểm tra quyền truy cập ngay khi load trang
        async function checkAdminAccess() {
            // Kiểm tra xem có phải admin không
            const staffUser = sessionStorage.getItem('staff_user');
            if (staffUser) {
                // Đang đăng nhập bằng tài khoản nhân viên
                Swal.fire({
                    icon: 'warning',
                    title: 'Không có quyền truy cập',
                    html: 'Trang này chỉ dành cho <strong>Admin</strong>.<br>Bạn đang đăng nhập bằng tài khoản <strong>Nhân viên</strong>.',
                    confirmButtonText: 'Quay lại Dashboard',
                    allowOutsideClick: false
                }).then(() => {
                    window.location.href = '/admin/dashboard/';
                });
                return false;
            }
            return true;
        }

        document.addEventListener('DOMContentLoaded', async () => {
            const hasAccess = await checkAdminAccess();
            if (hasAccess) {
                loadAdmins();
            }
        });

        async function loadAdmins() {
            try {
                const response = await fetch('http://localhost:3000/api/admins', {
                    credentials: 'include' // Sử dụng session thay vì token
                });
                const result = await response.json();
                
                const tbody = document.getElementById('adminsTableBody');
                
                // Kiểm tra lỗi authentication
                if (response.status === 401) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="5" class="px-6 py-8 text-center">
                                <div class="text-red-500 mb-4">
                                    <i class="fas fa-lock text-4xl mb-2"></i>
                                    <p class="font-semibold">Chưa đăng nhập Admin</p>
                                    <p class="text-sm text-gray-600 mt-2">Trang này chỉ dành cho Admin. Vui lòng đăng nhập bằng tài khoản Admin.</p>
                                </div>
                                <a href="/admin/dang-nhap-admin/" class="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                                    <i class="fas fa-sign-in-alt mr-2"></i>Đăng nhập Admin
                                </a>
                            </td>
                        </tr>
                    `;
                    return;
                }
                
                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Lỗi tải danh sách admin');
                }

                if (result.data.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500">Chưa có tài khoản admin.</td></tr>`;
                    return;
                }

                tbody.innerHTML = result.data.map(admin => `
                    <tr class="hover:bg-gray-50/50 transition">
                        <td class="px-6 py-4">
                            <div class="font-medium text-gray-800">${admin.tai_khoan}</div>
                        </td>
                        <td class="px-6 py-4 text-gray-600">${admin.ten_hien_thi || '-'}</td>
                        <td class="px-6 py-4 text-gray-500">${admin.email || '-'}</td>
                        <td class="px-6 py-4 text-center">
                            <span class="px-2 py-1 rounded-full text-xs font-semibold ${admin.quyen === 'superadmin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">
                                ${admin.quyen === 'superadmin' ? 'Super Admin' : 'Admin'}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-right space-x-2">
                            <button onclick="openPasswordModal(${admin.ma_admin})" class="p-2 text-yellow-500 hover:bg-yellow-50 rounded-lg transition" title="Đổi mật khẩu">
                                <i class="fas fa-key"></i>
                            </button>
                            <button onclick="deleteAdmin(${admin.ma_admin}, '${admin.tai_khoan}')" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Xóa tài khoản">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');

            } catch (error) {
                console.error(error);
                document.getElementById('adminsTableBody').innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-red-500"><i class="fas fa-exclamation-circle mr-2"></i>Không thể tải danh sách tài khoản.</td></tr>`;
                Swal.fire('Lỗi', 'Không thể tải danh sách tài khoản!', 'error');
            }
        }

        function openModal() {
            document.getElementById('adminForm').reset();
            document.getElementById('adminModal').classList.remove('hidden');
            document.getElementById('mat_khau').required = true;
        }

        function closeModal() {
            document.getElementById('adminModal').classList.add('hidden');
        }

        async function handleSaveAdmin(e) {
            e.preventDefault();
            const btn = document.getElementById('btnSave');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Đang xử lý...';
            btn.disabled = true;

            const payload = {
                tai_khoan: document.getElementById('tai_khoan').value,
                mat_khau: document.getElementById('mat_khau').value,
                ten_hien_thi: document.getElementById('ten_hien_thi').value,
                email: document.getElementById('email').value,
                quyen: document.getElementById('quyen').value
            };

            try {
                const response = await fetch('http://localhost:3000/api/admins', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include', // Sử dụng session
                    body: JSON.stringify(payload)
                });
                const result = await response.json();

                if (response.ok && result.success) {
                    closeModal();
                    Swal.fire('Thành công', 'Đã thêm tài khoản admin.', 'success');
                    loadAdmins();
                } else {
                    Swal.fire('Lỗi', result.message || 'Không thể lưu tài khoản', 'error');
                }
            } catch (error) {
                Swal.fire('Lỗi', 'Có lỗi kết nối máy chủ', 'error');
            } finally {
                btn.innerHTML = 'Lưu tài khoản';
                btn.disabled = false;
            }
        }

        // Change Password
        function openPasswordModal(id) {
            document.getElementById('changePasswordForm').reset();
            document.getElementById('changePwAdminId').value = id;
            document.getElementById('changePasswordModal').classList.remove('hidden');
        }

        function closePasswordModal() {
            document.getElementById('changePasswordModal').classList.add('hidden');
        }

        async function handleChangePassword(e) {
            e.preventDefault();
            const id = document.getElementById('changePwAdminId').value;
            const newPassword = document.getElementById('new_password').value;

            try {
                const response = await fetch(`http://localhost:3000/api/admins/${id}/password`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include', // Sử dụng session
                    body: JSON.stringify({ mat_khau_moi: newPassword })
                });
                const result = await response.json();

                if (response.ok && result.success) {
                    closePasswordModal();
                    Swal.fire('Thành công', 'Đổi mật khẩu thành công.', 'success');
                } else {
                    Swal.fire('Lỗi', result.message || 'Không thể đổi mật khẩu', 'error');
                }
            } catch (error) {
                Swal.fire('Lỗi', 'Lỗi kết nối máy chủ', 'error');
            }
        }

        function deleteAdmin(id, username) {
            Swal.fire({
                title: 'Xóa tài khoản này?',
                text: `Bạn có chắc chắn muốn xóa admin: ${username}`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Đồng ý xóa',
                cancelButtonText: 'Hủy'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        const response = await fetch(`http://localhost:3000/api/admins/${id}`, {
                            method: 'DELETE',
                            credentials: 'include' // Sử dụng session
                        });
                        const rs = await response.json();

                        if (response.ok && rs.success) {
                            Swal.fire('Đã xóa', 'Tài khoản đã bị xóa khỏi hệ thống.', 'success');
                            loadAdmins();
                        } else {
                            Swal.fire('Lỗi', rs.message || 'Không thể xóa tài khoản này.', 'error');
                        }
                    } catch (error) {
                        Swal.fire('Lỗi', 'Lỗi kết nối máy chủ', 'error');
                    }
                }
            });
        }
