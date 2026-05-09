# Cổng Đăng nhập Nhân viên

## 📍 Đường dẫn
- **URL**: `/staff/login.html`
- **Cổng riêng biệt**: Không dùng chung với Admin

## 🎯 Mục đích
Tách riêng cổng đăng nhập cho nhân viên để:
- ✅ Tránh nhiễu session với Admin
- ✅ Giao diện riêng, dễ phân biệt
- ✅ Cookie riêng: `staff.sid`
- ✅ Bảo mật cao hơn

## 👥 Ai sử dụng?
- **Quản lý** (Manager) - Vai trò: `manager`
- **Phục vụ** (Waiter) - Vai trò: `waiter`
- **Bếp** (Kitchen) - Vai trò: `kitchen`

## 🔐 Cách hoạt động

### 1. Đăng nhập
```
URL: /staff/login.html
API: POST /api/staff/login
Body: { tai_khoan, mat_khau }
Cookie: staff.sid (tự động tạo)
```

### 2. Phân quyền tự động
Sau khi đăng nhập thành công, hệ thống tự động chuyển hướng:

- **Manager** → `/admin/dashboard.html` (Trang quản lý)
- **Kitchen** → `/admin/kitchen.html` (Trang bếp)
- **Waiter** → `/admin/orders.html` (Trang đơn hàng)

### 3. Session riêng biệt
- Admin: Cookie `admin.sid`
- Staff: Cookie `staff.sid`
- Logout riêng, không ảnh hưởng lẫn nhau

## 🎨 Giao diện
- Gradient tím (Purple) - Khác với Admin (Xanh dương)
- Animation floating logo
- Responsive mobile-friendly
- Toggle show/hide password
- Remember me checkbox

## 🚀 Sử dụng

### Truy cập trực tiếp:
```
http://localhost:3000/staff/login.html
```

### Hoặc từ trang chọn:
```
http://localhost:3000/select-login.html
→ Chọn "Nhân viên"
```

## 🔧 API Endpoints

### Check Session
```javascript
GET /api/staff/check-session
Response: {
  success: true,
  isAuthenticated: true,
  data: {
    ma_nhan_vien: 1,
    ten_nhan_vien: "...",
    vai_tro: "manager"
  }
}
```

### Logout
```javascript
POST /api/staff/logout
Response: {
  success: true,
  message: "Đăng xuất thành công"
}
```

## 📝 Lưu ý
1. **Không dùng chung** với trang admin
2. **Session độc lập** - Admin và Staff có thể đăng nhập đồng thời
3. **Logout riêng** - Đăng xuất Staff không ảnh hưởng Admin
4. **Quyền hạn** - Được quản lý qua bảng `nhan_vien_quyen`

## 🔗 Liên kết
- Trang chủ: `/index.html`
- Chọn loại đăng nhập: `/select-login.html`
- Admin login: `/admin/dang-nhap-admin.html`
- Staff login: `/staff/login.html` ← **Trang này**
