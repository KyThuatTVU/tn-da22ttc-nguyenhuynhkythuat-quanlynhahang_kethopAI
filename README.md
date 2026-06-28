# 🍜 HỆ THỐNG QUẢN LÝ NHÀ HÀNG KẾT HỢP GỢI Ý SẢN PHẨM THEO HƯỚNG CÁ NHÂN HÓA NGƯỜI DÙNG

[![License](https://img.shields.io/badge/License-Academic-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-v3.9+-blue.svg)](https://www.python.org/)
[![MySQL](https://img.shields.io/badge/MySQL-v8.0+-orange.svg)](https://www.mysql.com/)

## 📋 Giới thiệu

**Ẩm Thực Phương Nam** là hệ thống quản lý nhà hàng toàn diện, ứng dụng công nghệ **Machine Learning và AI** để cá nhân hóa trải nghiệm người dùng thông qua hệ thống gợi ý sản phẩm thông minh.

### 🎯 Mục tiêu đồ án

Xây dựng hệ thống quản lý nhà hàng hiện đại với các mục tiêu chính:

1. **Cá nhân hóa trải nghiệm khách hàng** 
   - Gợi ý món ăn dựa trên lịch sử và sở thích cá nhân
   - Hệ thống Hybrid Recommendation kết hợp nhiều thuật toán ML
   - Phân tích hành vi và dự đoán xu hướng tiêu dùng

2. **Tối ưu vận hành nhà hàng**
   - Quản lý toàn diện: Thực đơn, đơn hàng, đặt bàn, kho hàng, nhân sự, tài chính
   - Chatbot phân tích kinh doanh thông minh cho Admin
   - Chấm công nhân viên bằng nhận diện khuôn mặt AI

3. **Nâng cao trải nghiệm số hóa**
   - Website đặt món online hiện đại, responsive
   - Chatbot tư vấn tự động 24/7
   - Thanh toán điện tử MoMo
   - Đăng nhập nhanh với Google OAuth

### 📊 Công nghệ AI/ML ứng dụng

- **Collaborative Filtering (SVD)**: Lọc cộng tác dự đoán sở thích dựa trên người dùng tương tự
- **Apriori Association Rules**: Phát hiện mối liên kết giữa các món ăn (Market Basket Analysis)
- **Hybrid Recommendation**: Kết hợp 4 phương pháp (Collaborative + Content-based + Context-aware + Rating-based)
- **LangChain + LLM**: Chatbot phân tích dữ liệu kinh doanh bằng ngôn ngữ tự nhiên
- **OpenCV Face Recognition**: Nhận diện khuôn mặt chấm công (YuNet + SFace)
- **RAG (Retrieval-Augmented Generation)**: Tìm kiếm tri thức nhà hàng bằng semantic search

### 👥 Thông tin đồ án

- **Đề tài**: Xây dựng hệ thống quản lý nhà hàng kết hợp gợi ý sản phẩm theo hướng cá nhân hóa người dùng
- **Sinh viên thực hiện**: Nguyễn Huỳnh Kỹ Thuật
- **Mã số sinh viên**: 110122175
- **Lớp**: DA22TTC
- **Khóa**: 2022
- **Giảng viên hướng dẫn**: ThS. Phạm Minh Đương
- **Trường**: Trường Đại học Trà Vinh
- **Năm**: 2026

---

## 🏗️ Kiến trúc hệ thống

### Tổng quan

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Frontend      │◄────►│   Backend       │◄────►│  AI Service     │
│   (HTML/JS)     │      │   (Node.js)     │      │   (Python)      │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                  │
                                  ▼
                         ┌──────────────┐
                         │   MySQL DB   │
                         └──────────────┘
```

### Công nghệ sử dụng

#### Frontend
- **HTML5, CSS3, JavaScript** (Vanilla JS)
- **TailwindCSS** - Framework CSS hiện đại
- **Font Awesome** - Biểu tượng
- **Swiper.js** - Slider/Carousel

#### Backend
- **Node.js v18+** - Runtime JavaScript
- **Express.js v4** - Web framework
- **MySQL v8** - Cơ sở dữ liệu quan hệ
- **Apollo Server** - GraphQL API
- **Passport.js** - Xác thực Google OAuth
- **JWT** - JSON Web Token authentication
- **Nodemailer** - Gửi email
- **Multer** - Upload file

#### AI/ML Service (Python)
- **Flask** - Web framework Python
- **Scikit-learn** - Machine Learning (SVD, TruncatedSVD)
- **MLxtend** - Apriori algorithm
- **Pandas, NumPy** - Xử lý dữ liệu
- **OpenCV** - Nhận diện khuôn mặt (YuNet, SFace)
- **LangChain** - Framework LLM
- **Groq API** - Large Language Model (thay OpenAI)
- **SQLAlchemy** - ORM cho Python

#### Tích hợp bên ngoài
- **MoMo Payment Gateway** - Thanh toán điện tử
- **Google OAuth 2.0** - Đăng nhập Google
- **Gmail SMTP** - Gửi email xác thực

---

## 💻 Yêu cầu hệ thống

### Phần mềm cần thiết

1. **Node.js** (v18.0.0 trở lên)
   - Download: https://nodejs.org/

2. **Python** (v3.9 trở lên)
   - Download: https://www.python.org/downloads/
   - Khuyến nghị: Cài đặt `uv` package manager: https://docs.astral.sh/uv/

3. **MySQL** (v8.0 trở lên)
   - Download: https://dev.mysql.com/downloads/mysql/
   - Hoặc XAMPP: https://www.apachefriends.org/

4. **Git** (tùy chọn, để clone repository)
   - Download: https://git-scm.com/

### Công cụ khuyến nghị
- **Visual Studio Code** - Code editor
- **Postman** - Test API
- **MySQL Workbench** - Quản lý database

---

## 🚀 Cài đặt và triển khai

### Bước 1: Clone repository

```bash
git clone <repository-url>
cd KhoaLuanTotNghiep2026
```

### Bước 2: Cấu hình Database

1. Khởi động MySQL server
2. Tạo database:

```sql
CREATE DATABASE amthuc_phuongnam CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Import dữ liệu mẫu (nếu có):

```bash
mysql -u root -p amthuc_phuongnam < database/amthuc_phuongnam.sql
```

### Bước 3: Cấu hình Backend

```bash
cd src/backend
npm install
```

Tạo file `.env` (hoặc chỉnh sửa file có sẵn):

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=amthuc_phuongnam
DB_PORT=3306

# JWT
JWT_SECRET=your_secret_key_change_this

# Session
SESSION_SECRET=your_session_secret

# Email (Gmail App Password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Groq API (free tier)
GROQ_API_KEY=your_groq_api_key

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/admin-auth/google/callback

# MoMo Payment (sandbox)
MOMO_PARTNER_CODE=MOMO
MOMO_ACCESS_KEY=F8BBA842ECF85
MOMO_SECRET_KEY=K951B6PE1waDMi640xX08PD3vg6EkVlz
```

### Bước 4: Cấu hình AI Service

```bash
cd src/ai_service
pip install -r requirements.txt
# Hoặc với uv:
uv pip install -r requirements.txt
```

**Lưu ý**: AI Service sẽ tự động tải các model OpenCV khi chạy lần đầu.

### Bước 5: Chạy ứng dụng

Mở **3 terminal** riêng biệt:

#### Terminal 1 - Backend
```bash
cd src/backend
npm start
# Hoặc development mode với auto-reload:
npm run dev
```

Backend chạy tại: `http://localhost:3000`

#### Terminal 2 - AI Service
```bash
cd src/ai_service
python app.py
```

AI Service chạy tại: `http://localhost:5000`

#### Terminal 3 - Frontend (tự động)
Frontend được serve tự động qua Backend tại: `http://localhost:3000`

---

## 📱 Sử dụng hệ thống

### Truy cập các trang

- **Trang chủ khách hàng**: http://localhost:3000
- **Đăng nhập Admin**: http://localhost:3000/admin/dang-nhap-admin.html
- **Đăng nhập Staff**: http://localhost:3000/staff/login.html
- **GraphQL Playground**: http://localhost:3000/graphql

### Tài khoản mặc định

Sau khi chạy lần đầu, hệ thống tự động tạo các bảng cần thiết.

**Tạo tài khoản Admin đầu tiên:**

```bash
cd src/backend
node scripts/create-admin.js
```

---

## 🔧 Các tính năng chính

### Khách hàng (Customer)
- ✅ Xem thực đơn, chi tiết món ăn
- ✅ Đặt món online, giỏ hàng
- ✅ Đặt bàn trước
- ✅ Thanh toán MoMo
- ✅ Gợi ý món ăn AI (Collaborative + Apriori + Hybrid)
- ✅ Chatbot tư vấn thông minh
- ✅ Đánh giá, bình luận món ăn
- ✅ Quản lý đơn hàng của tôi
- ✅ Đăng nhập Google OAuth

### Admin
- ✅ Dashboard thống kê tổng quan
- ✅ Quản lý món ăn, danh mục
- ✅ Quản lý đơn hàng, đặt bàn
- ✅ Quản lý nhân viên, chấm công
- ✅ Quản lý kho hàng, nguyên liệu
- ✅ Quản lý chi phí, lương
- ✅ Báo cáo doanh thu
- ✅ Chatbot phân tích kinh doanh AI
- ✅ Quản lý tin tức, khuyến mãi
- ✅ POS (Point of Sale) bán hàng
- ✅ Quản lý quyền hạn

### Nhân viên (Staff)
- ✅ Chấm công bằng khuôn mặt AI
- ✅ Xem lịch ca làm việc
- ✅ Xem bảng lương tạm tính
- ✅ POS bán hàng (nếu có quyền)
- ✅ Quản lý bàn ăn

### AI/ML Features
- **Gợi ý món ăn Collaborative Filtering**: Dự đoán sở thích dựa trên hành vi người dùng tương tự
- **Apriori Association Rules**: "Khách mua X thường mua thêm Y"
- **Hybrid Recommendation**: Kết hợp 4 phương pháp (Collaborative + Content + Context + Rating)
- **Admin Chatbot**: Trả lời câu hỏi phân tích như "Doanh thu tháng này?", "Món nào bán chạy?"
- **Face Recognition**: Chấm công nhân viên bằng khuôn mặt (YuNet detection + SFace recognition)
- **RAG System**: Tìm kiếm tri thức nhà hàng bằng semantic search

---

## 🗂️ Cấu trúc thư mục

```
KhoaLuanTotNghiep2026/
├── src/
│   ├── frontend/              # Giao diện người dùng
│   │   ├── admin/            # Trang quản trị
│   │   ├── staff/            # Trang nhân viên
│   │   ├── components/       # Components tái sử dụng
│   │   ├── css/              # Stylesheets
│   │   ├── js/               # JavaScript files
│   │   ├── images/           # Hình ảnh tĩnh
│   │   └── *.html            # Các trang HTML
│   │
│   ├── backend/              # API Server
│   │   ├── config/           # Cấu hình (DB, Email, Passport)
│   │   ├── controllers/      # Business logic
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Middleware (Auth, CORS, Logger)
│   │   ├── services/         # Services (Preference, etc.)
│   │   ├── graphql/          # GraphQL schema & resolvers
│   │   ├── scripts/          # Utility scripts
│   │   ├── uploads/          # Uploaded files
│   │   ├── images/           # Static images
│   │   ├── server.js         # Entry point
│   │   └── package.json      # Dependencies
│   │
│   └── ai_service/           # AI/ML Microservice
│       ├── models/           # Trained models & Face detection models
│       ├── app.py            # Flask API
│       ├── model.py          # Collaborative Filtering
│       ├── apriori_service.py # Apriori algorithm
│       ├── hybrid_recommendation.py # Hybrid system
│       ├── face_service.py   # Face recognition
│       ├── admin_bot_service.py # Admin chatbot
│       ├── rag_service.py    # RAG system
│       └── requirements.txt  # Python dependencies
│
├── docs/                     # Tài liệu đồ án
├── database/                 # SQL schema & sample data
├── README.md                 # File này
└── .gitignore
```

---

## 🧪 Testing & Development

### Test Backend API

```bash
cd src/backend

# Test database connection
curl http://localhost:3000/api/test-db

# Test MoMo payment setup
npm run test-momo
```

### Test AI Service

```bash
cd src/ai_service

# Test face detection model
python test_face_model.py

# Test hybrid recommendation
python test_hybrid.py

# Test Apriori thresholds
python test_apriori_thresholds.py
```

### Development Mode

Backend với auto-reload:
```bash
cd src/backend
npm run dev
```

AI Service với debug mode:
```bash
cd src/ai_service
# Sửa trong app.py: debug=True
python app.py
```

---

## 🔐 Bảo mật

- **Authentication**: JWT tokens, Express sessions
- **Password hashing**: bcryptjs
- **Environment variables**: Sensitive data trong `.env`
- **SQL Injection prevention**: Parameterized queries
- **CORS**: Configured cho production
- **Rate limiting**: Implement trên production
- **Input validation**: express-validator

⚠️ **Lưu ý**: Đổi tất cả secrets trong `.env` khi deploy production!

---

## 📊 Database Schema

Hệ thống sử dụng MySQL với các bảng chính:

- `nguoi_dung` - Người dùng/Khách hàng
- `quan_tri_vien` - Admin
- `nhan_vien` - Nhân viên
- `danh_muc` - Danh mục món ăn
- `mon_an` - Món ăn
- `don_hang`, `chi_tiet_don_hang` - Đơn hàng
- `dat_ban` - Đặt bàn
- `gio_hang` - Giỏ hàng
- `danh_gia_san_pham` - Đánh giá
- `nguyen_lieu`, `kho_nguyen_lieu` - Kho hàng
- `cham_cong`, `ca_lam_viec`, `bang_luong` - Quản lý nhân sự
- `chi_phi`, `loai_chi_phi` - Tài chính
- `chatbot_history`, `chatbot_knowledge` - Chatbot
- `thong_bao`, `thong_bao_admin` - Thông báo
- `cai_dat` - Cấu hình hệ thống

---

## 🐛 Troubleshooting

### Backend không khởi động được

1. Kiểm tra MySQL đã chạy chưa
2. Kiểm tra thông tin database trong `.env`
3. Kiểm tra port 3000 đã bị chiếm chưa

### AI Service lỗi

1. Kiểm tra Python version >= 3.9
2. Cài lại dependencies: `pip install -r requirements.txt`
3. Kiểm tra port 5000 đã bị chiếm chưa
4. Kiểm tra model files trong `ai_service/models/`

### Face Recognition không hoạt động

1. Models sẽ tự động download lần đầu (cần internet)
2. Kiểm tra thư mục `ai_service/models/` có 2 file `.onnx`
3. Nhân viên cần có ảnh đại diện trong database

### Frontend không load được ảnh

1. Kiểm tra thư mục `src/backend/images/` và `uploads/`
2. Kiểm tra static file serving trong `server.js`

---

## 📚 API Documentation

### REST API Endpoints

**Authentication**
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/admin-auth/login` - Admin đăng nhập
- `GET /api/admin-auth/google` - Google OAuth

**Menu & Products**
- `GET /api/menu` - Lấy danh sách món ăn
- `GET /api/products/:id` - Chi tiết món ăn
- `GET /api/categories` - Danh mục

**Orders**
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders/my-orders` - Đơn hàng của tôi
- `PUT /api/orders/:id/status` - Cập nhật trạng thái

**AI/ML**
- `GET /api/recommendations/hybrid` - Gợi ý lai ghép
- `POST /api/ml/face/verify` - Xác minh khuôn mặt
- `POST /api/admin-chatbot/ask` - Chatbot admin

### GraphQL API

Endpoint: `http://localhost:3000/graphql`

Example query:
```graphql
query {
  dishes(limit: 10) {
    ma_mon
    ten_mon
    gia
    hinh_anh
  }
}
```

---

## 🚀 Deploy Production

### Khuyến nghị

- **Backend**: Deploy lên VPS (DigitalOcean, AWS EC2, Google Cloud)
- **Database**: MySQL trên cloud hoặc cùng VPS
- **AI Service**: Containerize với Docker, deploy riêng
- **Frontend**: Có thể tách ra Nginx hoặc CDN

### Environment Variables Production

Nhớ cập nhật:
- `NODE_ENV=production`
- `DB_HOST`, `DB_USER`, `DB_PASSWORD` (production database)
- `JWT_SECRET`, `SESSION_SECRET` (random strong strings)
- `FRONTEND_URL` (domain thực tế)
- `GOOGLE_CALLBACK_URL`, `MOMO_REDIRECT_URL` (domain thực tế)

### Docker (Optional)

```bash
# Build Docker images
docker build -t phuongnam-backend ./src/backend
docker build -t phuongnam-ai ./src/ai_service

# Run with docker-compose
docker-compose up -d
```

---

## 📝 Changelog

### Version 1.0.0 (2026)
- ✅ Hệ thống quản lý nhà hàng cơ bản
- ✅ Tích hợp AI/ML recommendation
- ✅ Face recognition chấm công
- ✅ Admin chatbot với LangChain
- ✅ Payment MoMo integration
- ✅ GraphQL API
- ✅ Google OAuth

---

## 🤝 Contributing

Đây là đồ án tốt nghiệp. Mọi góp ý và đóng góp đều được hoan nghênh.

---

## 📄 License

Copyright © 2026 Nguyễn Huỳnh Kỹ Thuật. All rights reserved.

Đồ án tốt nghiệp - Trường Đại học Trà Vinh

**Lưu ý**: Đây là đồ án nghiên cứu học thuật, không được phép sử dụng cho mục đích thương mại mà không có sự cho phép của tác giả.

---

## 📞 Liên hệ

- **Sinh viên**: Nguyễn Huỳnh Kỹ Thuật
- **Email**: nguyenhuynhkithuat84tv@gmail.com
- **MSSV**: 110122175
- **Lớp**: DA22TTC
- **Giảng viên hướng dẫn**: ThS. Phạm Minh Đương

---

## 🙏 Lời cảm ơn

- Chân thành cảm ơn **ThS. Phạm Minh Đương** đã tận tình hướng dẫn trong suốt quá trình thực hiện đồ án
- Cảm ơn **Khoa Công nghệ Thông tin - Trường Đại học Trà Vinh** đã tạo điều kiện thuận lợi
- Cảm ơn gia đình, bạn bè đã hỗ trợ và động viên trong quá trình học tập và nghiên cứu
- Cảm ơn cộng đồng mã nguồn mở và các tài liệu tham khảo đã giúp hoàn thiện đồ án

---

## 📚 Tài liệu tham khảo

### Machine Learning & AI
1. Koren, Y., Bell, R., & Volinsky, C. (2009). "Matrix Factorization Techniques for Recommender Systems". IEEE Computer.
2. Agrawal, R., & Srikant, R. (1994). "Fast Algorithms for Mining Association Rules". VLDB.
3. OpenCV Documentation: Face Recognition Module
4. LangChain Documentation: Building LLM Applications

### Web Development
5. Express.js Documentation
6. Flask Documentation  
7. MySQL 8.0 Reference Manual
8. GraphQL Best Practices

### Related Works
9. Các nghiên cứu về Recommender Systems trong ngành F&B
10. Ứng dụng AI trong quản lý nhà hàng

---

**🎓 Đồ án tốt nghiệp - Trường Đại học Trà Vinh - Năm 2026**

**⭐ Nếu thấy đồ án hữu ích cho nghiên cứu, hãy tham khảo và trích dẫn đúng nguồn!**
