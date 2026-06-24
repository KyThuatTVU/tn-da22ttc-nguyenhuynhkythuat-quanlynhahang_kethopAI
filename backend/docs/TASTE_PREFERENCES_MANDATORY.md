# Cơ chế bắt buộc khai báo khẩu vị

## Mục đích
Đảm bảo tất cả người dùng (mới và cũ chưa khai báo) phải chọn khẩu vị yêu thích để hệ thống gợi ý món ăn chính xác hơn.

## Cách hoạt động

### 1. Backend - Kiểm tra khi đăng nhập

**File**: `backend/routes/auth.js`

#### Đăng nhập Email/Password (`POST /api/auth/login`)
- Sau khi xác thực thành công, kiểm tra bảng `so_thich_khau_vi_nguoi_dung`
- Trả về thêm field `hasPreferences: true/false`

```javascript
const [flavorCheck] = await db.query(
    'SELECT COUNT(*) as count FROM so_thich_khau_vi_nguoi_dung WHERE ma_nguoi_dung = ?',
    [user.ma_nguoi_dung]
);
const hasPreferences = flavorCheck[0].count > 0;
```

#### Đăng nhập Google OAuth (`GET /api/auth/google/callback`)
- Tương tự, kiểm tra và trả về `hasPreferences` trong callback

### 2. Frontend - Xử lý sau đăng nhập

**File**: `frontend/js/auth.js`, `frontend/dang-nhap.html`

#### Khi đăng nhập thành công:
1. Lưu thông tin user bao gồm `hasPreferences` vào localStorage
2. Nếu `hasPreferences = false`, set flag vào sessionStorage:
   ```javascript
   sessionStorage.setItem('show_preferences_modal', 'true');
   ```
3. Chuyển hướng về `index.html`

### 3. Frontend - Modal bắt buộc chọn khẩu vị

**File**: `frontend/index.html`

#### Logic hiển thị modal:
```javascript
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Kiểm tra flag từ trang đăng nhập
    const shouldShowModal = sessionStorage.getItem('show_preferences_modal');
    
    if (shouldShowModal === 'true') {
        // BẮT BUỘC hiển thị modal
        // - Ẩn nút "Bỏ qua"
        // - Không cho click ra ngoài để đóng
        // - Phải chọn ít nhất 1 khẩu vị mới được lưu
        needsPreferences = true;
        sessionStorage.removeItem('show_preferences_modal');
    } else {
        // Kiểm tra lại với server để đảm bảo
        // Nếu đã có sở thích → không hiện modal
    }
});
```

#### Hành vi khi bắt buộc:
- **Nút "Bỏ qua"**: Bị ẩn hoàn toàn
- **Click backdrop**: Hiển thị cảnh báo, không đóng modal
- **Nút "Lưu sở thích"**: Chỉ hoạt động khi chọn >= 1 khẩu vị

#### Hành vi sau khi lưu thành công:
```javascript
// Cập nhật flag trong localStorage
const user = JSON.parse(localStorage.getItem('user'));
user.hasPreferences = true;
localStorage.setItem('user', JSON.stringify(user));

// Đóng modal
closePreferenceModal();

// Reload recommendations
loadPersonalizedRecommendations();
```

### 4. Luồng hoạt động hoàn chỉnh

#### Trường hợp 1: User mới đăng ký
1. Đăng ký thành công → `hasPreferences = false`
2. Chuyển về trang chủ
3. Modal hiện ra **BẮT BUỘC** chọn khẩu vị
4. Không thể bỏ qua, phải chọn ít nhất 1 khẩu vị

#### Trường hợp 2: User cũ chưa khai báo
1. Đăng nhập → Backend check DB → `hasPreferences = false`
2. Chuyển về trang chủ
3. Modal hiện ra **BẮT BUỘC** chọn khẩu vị
4. Không thể bỏ qua

#### Trường hợp 3: User đã khai báo khẩu vị
1. Đăng nhập → Backend check DB → `hasPreferences = true`
2. Chuyển về trang chủ
3. Modal **KHÔNG** hiện ra
4. Trải nghiệm bình thường

#### Trường hợp 4: User đã đăng nhập, vào trang khác rồi quay lại
1. `sessionStorage` không có flag `show_preferences_modal`
2. Kiểm tra `sessionStorage.preferences_session_skipped` → đã bỏ qua trong phiên này
3. Modal không hiện ra trong phiên làm việc hiện tại

## Cấu trúc database

### Bảng `so_thich_khau_vi_nguoi_dung`
```sql
CREATE TABLE so_thich_khau_vi_nguoi_dung (
    ma_nguoi_dung INT,
    id_thuoc_tinh INT,
    PRIMARY KEY (ma_nguoi_dung, id_thuoc_tinh),
    FOREIGN KEY (ma_nguoi_dung) REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE,
    FOREIGN KEY (id_thuoc_tinh) REFERENCES thuoc_tinh_khau_vi(id) ON DELETE CASCADE
);
```

### Bảng `thuoc_tinh_khau_vi`
```sql
CREATE TABLE thuoc_tinh_khau_vi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten_thuoc_tinh VARCHAR(100) NOT NULL UNIQUE
);
```

Dữ liệu mẫu:
- 🍲 Cay
- 🍋 Chua
- 🧂 Mặn
- 🍰 Ngọt
- 🥦 Chay
- 🌿 Thanh đạm
- 🥩 Nhiều đạm
- 🍤 Hải sản

## API Endpoints liên quan

### `POST /api/recommendations/preferences`
Lưu sở thích khẩu vị của user

**Request:**
```json
{
  "flavorIds": [1, 3, 5]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã lưu sở thích"
}
```

### `GET /api/recommendations/check-preferences`
Kiểm tra user đã có sở thích chưa

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "hasPreferences": true
}
```

### `GET /api/menu/flavors`
Lấy danh sách tất cả khẩu vị

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "ten_thuoc_tinh": "🍲 Cay" },
    { "id": 2, "ten_thuoc_tinh": "🍋 Chua" }
  ]
}
```

## Testing

### Test Case 1: User mới đăng ký
1. Đăng ký tài khoản mới
2. Xác nhận modal hiện ra
3. Thử bỏ qua → Hiển thị cảnh báo
4. Chọn 1 khẩu vị → Lưu thành công

### Test Case 2: User cũ chưa có khẩu vị
1. Đăng nhập với tài khoản cũ chưa khai báo
2. Modal hiện ra bắt buộc
3. Không có nút bỏ qua
4. Phải chọn khẩu vị mới tiếp tục

### Test Case 3: User đã có khẩu vị
1. Đăng nhập với tài khoản đã khai báo
2. Modal không hiện ra
3. Truy cập bình thường

### Test Case 4: Đăng nhập Google OAuth
1. Đăng nhập qua Google (chưa có khẩu vị)
2. Callback về frontend
3. Modal hiện ra bắt buộc

## Lưu ý quan trọng

1. **Session vs Persistent**:
   - Flag `show_preferences_modal` trong `sessionStorage` - chỉ tồn tại trong phiên
   - Dữ liệu user trong `localStorage` - tồn tại lâu dài
   
2. **UX tốt hơn**:
   - Modal xuất hiện ngay khi vào trang chủ sau đăng nhập
   - Không làm phiền user đã có sở thích
   - Thông báo rõ ràng khi cần chọn khẩu vị

3. **Bảo mật**:
   - Luôn verify token trước khi lưu sở thích
   - Kiểm tra số lượng khẩu vị tối thiểu (>= 1)

4. **Performance**:
   - Chỉ check DB 1 lần khi đăng nhập
   - Cache kết quả trong localStorage
   - Không query lại mỗi lần reload trang
