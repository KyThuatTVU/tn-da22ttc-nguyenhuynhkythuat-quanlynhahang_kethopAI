# ⚡ Sửa lỗi MoMo nhanh trong 5 phút

## Lỗi bạn đang gặp:
```
Transaction rejected by the issuers of the payment accounts
```

## ✅ Giải pháp nhanh nhất:

### Bước 1: Test xem lỗi ở đâu
```bash
cd backend
npm run test-momo
```

Script sẽ cho biết chính xác vấn đề là gì.

### Bước 2: Đăng ký MoMo Developer (3 phút)

1. **Truy cập:** https://developers.momo.vn/
2. **Đăng ký** tài khoản (dùng email và số điện thoại)
3. **Tạo ứng dụng Sandbox:**
   - Đăng nhập
   - Click "Tạo ứng dụng mới"
   - Chọn môi trường: **Sandbox**
   - Lấy thông tin: Partner Code, Access Key, Secret Key

### Bước 3: Cập nhật file `.env`

Mở file `backend/.env` và thay đổi:

```env
# ❌ XÓA CÁI NÀY (credentials mẫu)
MOMO_PARTNER_CODE=MOMO
MOMO_ACCESS_KEY=F8BBA842ECF85
MOMO_SECRET_KEY=K951B6PE1waDMi640xX08PD3vg6EkVlz

# ✅ THAY BẰNG CREDENTIALS THẬT TỪ MOMO PORTAL
MOMO_PARTNER_CODE=MOMO_YOUR_CODE_HERE
MOMO_ACCESS_KEY=YOUR_REAL_ACCESS_KEY_HERE
MOMO_SECRET_KEY=YOUR_REAL_SECRET_KEY_HERE
```

### Bước 4: Khởi động lại server
```bash
npm start
```

### Bước 5: Test lại
```bash
npm run test-momo
```

Nếu thấy `✅ SUCCESS!` là xong!

---

## 🚨 Nếu dùng localhost

MoMo cần gọi callback về server. Nếu server chạy localhost, cần expose ra internet:

### Cài ngrok (1 phút)
```bash
# Download tại: https://ngrok.com/download
# Giải nén và chạy:
ngrok http 3000
```

### Cập nhật URL trong `.env`
```env
# Thay http://localhost:3000 bằng URL từ ngrok
MOMO_REDIRECT_URL=https://abc123.ngrok.io/api/payment/momo-return
MOMO_IPN_URL=https://abc123.ngrok.io/api/payment/momo-ipn
```

### Cập nhật trong MoMo Portal
- Vào ứng dụng sandbox
- Cập nhật **IPN URL** và **Redirect URL** với domain ngrok

---

## 🎯 Test thanh toán

Sau khi sửa xong:

1. **Vào trang đặt hàng** trên website
2. **Chọn thanh toán MoMo**
3. Dùng **số điện thoại test** từ MoMo (thường là `0909000008`)
4. Nhập **OTP test**: `123456`

---

## 📞 Vẫn không được?

Xem file `MOMO_SETUP_GUIDE.md` để biết chi tiết hơn về:
- Các mã lỗi MoMo
- Cách debug
- Troubleshooting

Hoặc check log trong backend console để xem response từ MoMo.
