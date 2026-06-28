# 🔧 Hướng Dẫn Khắc Phục Lỗi MoMo Payment

## ⚠️ Lỗi: "Transaction rejected by the issuers of the payment accounts"

### 🔍 Nguyên nhân:

1. **Credentials không hợp lệ** - Đang dùng credentials mẫu từ tài liệu
2. **Tài khoản sandbox chưa được kích hoạt**
3. **Chữ ký (signature) không đúng**
4. **Số tiền không hợp lệ**

---

## ✅ GIẢI PHÁP 1: Đăng ký tài khoản MoMo Developer thật

### Bước 1: Đăng ký tài khoản
1. Truy cập: https://developers.momo.vn/
2. Đăng ký tài khoản developer
3. Xác thực email

### Bước 2: Tạo ứng dụng Sandbox
1. Đăng nhập vào MoMo Developer Portal
2. Tạo ứng dụng mới (chọn môi trường **Sandbox**)
3. Lấy thông tin:
   - Partner Code
   - Access Key
   - Secret Key

### Bước 3: Cập nhật file `.env`
```env
# Thay thế bằng credentials thật từ MoMo Developer Portal
MOMO_PARTNER_CODE=YOUR_REAL_PARTNER_CODE
MOMO_ACCESS_KEY=YOUR_REAL_ACCESS_KEY
MOMO_SECRET_KEY=YOUR_REAL_SECRET_KEY
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create

# Đảm bảo URL callback có thể truy cập được (dùng ngrok nếu localhost)
MOMO_REDIRECT_URL=http://localhost:3000/api/payment/momo-return
MOMO_IPN_URL=http://localhost:3000/api/payment/momo-ipn
```

### Bước 4: Khởi động lại server
```bash
cd backend
npm start
```

---

## ✅ GIẢI PHÁP 2: Sử dụng ngrok cho localhost (nếu test trên local)

MoMo cần gọi callback về server của bạn. Nếu chạy localhost, cần expose ra internet:

```bash
# Cài ngrok
# Download tại: https://ngrok.com/download

# Chạy ngrok
ngrok http 3000

# Sẽ có URL dạng: https://abcd-1234.ngrok.io
```

**Cập nhật `.env` với URL ngrok:**
```env
MOMO_REDIRECT_URL=https://abcd-1234.ngrok.io/api/payment/momo-return
MOMO_IPN_URL=https://abcd-1234.ngrok.io/api/payment/momo-ipn
```

**Cập nhật URL trong MoMo Developer Portal:**
- Vào ứng dụng sandbox
- Cập nhật IPN URL và Redirect URL với domain ngrok

---

## ✅ GIẢI PHÁP 3: Test với tài khoản MoMo Sandbox

MoMo cung cấp tài khoản test:

**Số điện thoại test:** `0909000008`  
**OTP:** `123456`

Hoặc check tài liệu MoMo cho tài khoản test mới nhất.

---

## 🔍 Debug và kiểm tra lỗi

### 1. Xem log chi tiết
Trong console backend sẽ hiển thị:
```
🔐 MoMo Raw Signature: ...
🔐 MoMo Signature: ...
📤 MoMo Request: ...
📥 MoMo Response: ...
```

### 2. Các mã lỗi phổ biến từ MoMo:

| Mã lỗi | Ý nghĩa | Giải pháp |
|--------|---------|-----------|
| 1002 | Giao dịch bị từ chối bởi nhà phát hành | Kiểm tra tài khoản MoMo, số dư |
| 9000 | Đang chờ xử lý | Bình thường, chờ người dùng thanh toán |
| 9001 | Tài khoản chưa kích hoạt | Kích hoạt tài khoản MoMo |
| 9002 | Chữ ký không hợp lệ | Kiểm tra Secret Key |
| 9003 | Số dư không đủ | Nạp tiền vào ví test |
| 9004 | URL không hợp lệ | Kiểm tra redirect URL và IPN URL |

### 3. Test API trực tiếp

Dùng Postman hoặc curl:

```bash
curl -X POST http://localhost:3000/api/payment/momo/create-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "orderId": "123",
    "amount": 100000,
    "orderInfo": "Test order"
  }'
```

---

## 📝 Checklist trước khi test

- [ ] Đã đăng ký tài khoản MoMo Developer
- [ ] Đã tạo ứng dụng Sandbox
- [ ] Đã cập nhật credentials thật vào `.env`
- [ ] Đã khởi động lại server sau khi sửa `.env`
- [ ] Nếu localhost, đã dùng ngrok
- [ ] Đã cập nhật callback URL trong MoMo Portal
- [ ] Số tiền thanh toán >= 1,000 VND và <= 50,000,000 VND
- [ ] Dùng số điện thoại test của MoMo

---

## 🆘 Vẫn gặp lỗi?

1. **Kiểm tra log backend** - Xem response.data từ MoMo
2. **Kiểm tra MoMo Portal** - Xem transaction history trong dashboard
3. **Liên hệ MoMo Support** - support@momo.vn (nếu dùng production)
4. **Đọc docs MoMo** - https://developers.momo.vn/v2/

---

## 🎯 Kết quả mong đợi

Sau khi khắc phục, bạn sẽ thấy:

1. ✅ API trả về `paymentUrl`
2. ✅ Người dùng click vào được redirect đến trang MoMo
3. ✅ Thanh toán thành công và callback về server
4. ✅ Đơn hàng được cập nhật trạng thái

---

## 📚 Tài liệu tham khảo

- MoMo Developer Portal: https://developers.momo.vn/
- API Documentation: https://developers.momo.vn/v2/
- Sandbox Guide: https://developers.momo.vn/v2/#/docs/sandbox
