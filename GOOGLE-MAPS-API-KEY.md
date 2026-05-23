# 🗺️ Hướng Dẫn Lấy Google Maps API Key

## 🎯 Tùy chọn 1: Không cần API Key (Khuyến nghị cho test)

Hệ thống đã được thiết kế để **hoạt động mà không cần Google Maps API Key**!

### ✅ Bạn có thể:
- Nhập tọa độ thủ công (Latitude, Longitude)
- Sử dụng tọa độ TVU B7 mặc định: `10.2447, 105.9667`
- Lưu và sử dụng chức năng chấm công bình thường

### 📝 Cách sử dụng:
1. Vào Admin Panel → Cài đặt
2. Click nút **"Dùng TVU B7"** trên placeholder bản đồ
3. Hoặc nhập tọa độ thủ công vào các ô:
   - Vĩ độ: `10.2447`
   - Kinh độ: `105.9667`
   - Bán kính: `100`
4. Click **"Lưu thay đổi"**

✨ **Xong! Không cần API Key!**

---

## 🗺️ Tùy chọn 2: Sử dụng Google Maps (Tùy chọn)

Nếu bạn muốn có bản đồ tương tác với tính năng:
- ✅ Hiển thị bản đồ Google Maps
- ✅ Kéo thả marker để chọn vị trí
- ✅ Tìm kiếm địa chỉ với autocomplete
- ✅ Tự động chuyển đổi địa chỉ ↔ tọa độ

### Bước 1: Tạo Google Cloud Project

1. Truy cập: https://console.cloud.google.com/
2. Đăng nhập bằng tài khoản Google
3. Click **"Select a project"** → **"New Project"**
4. Đặt tên project (ví dụ: `restaurant-attendance`)
5. Click **"Create"**

### Bước 2: Bật APIs

1. Vào **"APIs & Services"** → **"Library"**
2. Tìm và bật các API sau:
   - ✅ **Maps JavaScript API**
   - ✅ **Places API**
   - ✅ **Geocoding API** (tùy chọn)

### Bước 3: Tạo API Key

1. Vào **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"API Key"**
3. Copy API Key (dạng: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

### Bước 4: Bảo mật API Key (Khuyến nghị)

1. Click vào API Key vừa tạo
2. Trong **"Application restrictions"**:
   - Chọn **"HTTP referrers (web sites)"**
   - Thêm: `http://localhost:3000/*`
   - Thêm: `http://127.0.0.1:3000/*`
3. Trong **"API restrictions"**:
   - Chọn **"Restrict key"**
   - Chọn: Maps JavaScript API, Places API
4. Click **"Save"**

### Bước 5: Cập nhật Code

Mở file: `frontend/admin/settings.html`

Tìm dòng (khoảng dòng 13):
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places,marker&language=vi&v=weekly" async defer></script>
```

Thay `YOUR_API_KEY` bằng key thật:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&libraries=places,marker&language=vi&v=weekly" async defer></script>
```

### Bước 6: Test

1. Refresh trang Admin → Cài đặt
2. Bạn sẽ thấy bản đồ Google Maps
3. Thử các tính năng:
   - Kéo marker
   - Click trên bản đồ
   - Tìm kiếm địa chỉ

---

## 💰 Chi phí

### Free Tier (Miễn phí)
Google cung cấp **$200 credit mỗi tháng** miễn phí!

Đủ cho:
- ✅ ~28,000 lượt load bản đồ/tháng
- ✅ ~40,000 lượt autocomplete/tháng
- ✅ Hoàn toàn đủ cho dự án sinh viên

### Lưu ý
- Cần thẻ tín dụng để xác minh (không bị trừ tiền nếu dùng trong free tier)
- Có thể set billing alerts để tránh vượt quota

---

## 🐛 Troubleshooting

### Lỗi: "InvalidKeyMapError"
**Nguyên nhân**: API Key không hợp lệ hoặc chưa thay thế

**Giải pháp**:
1. Kiểm tra đã thay `YOUR_API_KEY` chưa
2. Kiểm tra API Key có đúng không
3. Kiểm tra đã bật Maps JavaScript API chưa

### Lỗi: "RefererNotAllowedMapError"
**Nguyên nhân**: Domain không được phép

**Giải pháp**:
1. Vào Google Cloud Console
2. Edit API Key
3. Thêm `http://localhost:3000/*` vào HTTP referrers

### Bản đồ hiển thị "For development purposes only"
**Nguyên nhân**: Chưa enable billing

**Giải pháp**:
- Thêm thẻ tín dụng vào Google Cloud (vẫn free trong $200/tháng)
- Hoặc bỏ qua (vẫn dùng được, chỉ có watermark)

---

## 🎓 Kết luận

### Cho Sinh Viên Test:
👉 **Không cần API Key!** Dùng tọa độ thủ công là đủ.

### Cho Production:
👉 Nên có API Key để UX tốt hơn, nhưng không bắt buộc.

---

## 📞 Tài liệu tham khảo

- Google Maps Platform: https://developers.google.com/maps
- Pricing: https://mapsplatform.google.com/pricing/
- API Key Best Practices: https://developers.google.com/maps/api-security-best-practices

**Chúc bạn thành công! 🎉**
