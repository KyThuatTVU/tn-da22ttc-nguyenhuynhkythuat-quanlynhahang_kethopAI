# Hướng dẫn cài đặt hệ thống phân quyền nhân viên

## 📋 Tổng quan

Hệ thống phân quyền cho phép quản lý chi tiết các quyền truy cập của từng nhân viên theo vai trò (manager, waiter, kitchen).

## 🚀 Cài đặt

### Bước 1: Chạy SQL script tạo bảng quyền

```bash
# Kết nối MySQL và chạy file SQL
mysql -u root -p restaurant_db < backend/scripts/create-permissions-table.sql
```

Hoặc chạy trực tiếp trong MySQL:

```bash
mysql -u root -p
use restaurant_db;
source backend/scripts/create-permissions-table.sql;
```

### Bước 2: Khởi động lại server

```bash
cd backend
npm start
```

## 📊 Cấu trúc quyền

### Quyền mặc định theo vai trò:

#### 🔵 Manager (Quản lý)
- ✅ Tất cả quyền (full access)

#### 🟢 Waiter (Phục vụ)
- ✅ Xem/Tạo/Sửa đơn hàng
- ✅ Xem/Đặt bàn
- ✅ Xem menu
- ✅ Xem khách hàng
- ✅ Thanh toán
- ✅ Áp dụng giảm giá

#### 🟠 Kitchen (Bếp)
- ✅ Xem đơn hàng
- ✅ Xem menu
- ✅ Xem phiếu bếp
- ✅ Cập nhật trạng thái món
- ✅ Xem công thức

## 🎯 Các nhóm quyền

### 1. Quản lý Đơn hàng
- `xem_don_hang` - Xem đơn hàng
- `tao_don_hang` - Tạo đơn hàng
- `sua_don_hang` - Sửa đơn hàng
- `xoa_don_hang` - Xóa đơn hàng
- `huy_don_hang` - Hủy đơn hàng

### 2. Quản lý Bàn
- `xem_ban` - Xem bàn
- `dat_ban` - Đặt bàn
- `sua_ban` - Sửa bàn
- `xoa_ban` - Xóa bàn

### 3. Quản lý Menu
- `xem_menu` - Xem menu
- `them_menu` - Thêm món
- `sua_menu` - Sửa món
- `xoa_menu` - Xóa món

### 4. Quản lý Khách hàng
- `xem_khach_hang` - Xem khách hàng
- `them_khach_hang` - Thêm khách hàng
- `sua_khach_hang` - Sửa khách hàng
- `xoa_khach_hang` - Xóa khách hàng

### 5. Quản lý Kho
- `xem_kho` - Xem kho
- `them_kho` - Thêm nguyên liệu
- `sua_kho` - Sửa nguyên liệu
- `xoa_kho` - Xóa nguyên liệu
- `nhap_kho` - Nhập kho
- `xuat_kho` - Xuất kho

### 6. Quản lý Nhân viên
- `xem_nhan_vien` - Xem nhân viên
- `them_nhan_vien` - Thêm nhân viên
- `sua_nhan_vien` - Sửa nhân viên
- `xoa_nhan_vien` - Xóa nhân viên
- `phan_quyen` - Phân quyền

### 7. Báo cáo & Thống kê
- `xem_bao_cao` - Xem báo cáo
- `xem_doanh_thu` - Xem doanh thu
- `xem_thong_ke` - Xem thống kê
- `xuat_bao_cao` - Xuất báo cáo

### 8. Chức năng Bếp
- `xem_phieu_bep` - Xem phiếu bếp
- `cap_nhat_trang_thai_mon` - Cập nhật trạng thái món
- `xem_cong_thuc` - Xem công thức

### 9. Thanh toán
- `thanh_toan` - Thanh toán
- `hoan_tien` - Hoàn tiền
- `ap_dung_giam_gia` - Áp dụng giảm giá

### 10. Cài đặt
- `xem_cai_dat` - Xem cài đặt
- `sua_cai_dat` - Sửa cài đặt

## 🔧 API Endpoints

### Lấy danh sách quyền
```
GET /api/staff/permissions/list
```

### Lấy quyền của nhân viên
```
GET /api/staff/:id/permissions
```

### Cập nhật quyền
```
PUT /api/staff/:id/permissions
Body: { xem_don_hang: 1, tao_don_hang: 1, ... }
```

### Sao chép quyền
```
POST /api/staff/permissions/copy
Body: { fromStaffId: 1, toStaffId: 2 }
```

### Đặt lại quyền mặc định
```
POST /api/staff/:id/permissions/reset
```

## 💻 Sử dụng giao diện

1. Vào **Quản lý Nhân viên** (`staff.html`)
2. Nhấn nút **🛡️ Phân quyền** (màu tím) bên cạnh nhân viên
3. Bật/tắt các quyền bằng công tắc
4. Nhấn **Lưu thay đổi**

### Các tính năng:
- ✅ **Bật tất cả** - Bật tất cả quyền
- ❌ **Tắt tất cả** - Tắt tất cả quyền
- 🔄 **Đặt lại mặc định** - Khôi phục quyền theo vai trò

## 🔐 Bảo mật

- Quyền được kiểm tra ở cả frontend và backend
- Mỗi nhân viên có bộ quyền riêng biệt
- Quyền được lưu trong database và cập nhật real-time
- Chỉ Manager mới có quyền phân quyền cho người khác

## 📝 Lưu ý

1. Khi tạo nhân viên mới, quyền mặc định sẽ tự động được tạo theo vai trò
2. Có thể tùy chỉnh quyền chi tiết cho từng nhân viên
3. Quyền `phan_quyen` chỉ nên cấp cho Manager
4. Nên backup database trước khi thay đổi quyền hàng loạt

## 🐛 Troubleshooting

### Lỗi: Procedure create_default_permissions không tồn tại
```bash
# Chạy lại file SQL
mysql -u root -p restaurant_db < backend/scripts/create-permissions-table.sql
```

### Lỗi: Không load được quyền
```bash
# Kiểm tra bảng đã được tạo chưa
mysql -u root -p
use restaurant_db;
SHOW TABLES LIKE 'nhan_vien_quyen';
```

### Tạo quyền cho nhân viên hiện có
```sql
-- Chạy trong MySQL
CALL create_default_permissions(1, 'manager');  -- ID nhân viên, vai trò
```
