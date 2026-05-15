# 🤖 AI Service - Hệ Thống Gợi Ý Thông Minh

## 📋 Tổng Quan

AI Service cung cấp các API machine learning cho hệ thống nhà hàng Phương Nam, bao gồm:

1. **Hybrid Recommendation** - Gợi ý lai ghép (MỚI ⭐)
2. **Collaborative Filtering** - Lọc cộng tác (SVD)
3. **Apriori Association Rules** - Gợi ý món kèm
4. **Admin Business Bot** - Chatbot phân tích kinh doanh

---

## 🚀 Cài Đặt

### 1. Cài đặt Python dependencies

```bash
cd ai_service
pip install -r requirements.txt
```

### 2. Cấu hình Database

File `.env` trong thư mục `backend/`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=amthuc_phuongnam
```

### 3. Chạy AI Service

```bash
python app.py
```

Service sẽ chạy tại: `http://localhost:5000`

---

## 📡 API Endpoints

### 1. 🎯 Hybrid Recommendation (Gợi Ý Lai Ghép)

**Endpoint**: `GET /api/ml/recommend/hybrid`

**Mô tả**: Gợi ý cá nhân hóa kết hợp 4 yếu tố:
- Collaborative Filtering (lọc cộng tác)
- Content-based (từ khóa tìm kiếm)
- Context-aware (dữ liệu chatbot)
- Rating-based (số sao đánh giá)

**Parameters**:
```
user_id (required): ID người dùng
keyword (optional): Từ khóa tìm kiếm
limit (optional): Số lượng gợi ý (default: 10)
w_collab (optional): Trọng số collaborative (default: 0.30)
w_content (optional): Trọng số content (default: 0.25)
w_chatbot (optional): Trọng số chatbot (default: 0.25)
w_rating (optional): Trọng số rating (default: 0.20)
```

**Example**:
```bash
curl "http://localhost:5000/api/ml/recommend/hybrid?user_id=1&keyword=gà&limit=5"
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "item_id": 15,
      "score": 0.782,
      "breakdown": {
        "collaborative": 0.856,
        "content": 0.923,
        "chatbot": 0.650,
        "rating": 0.780
      }
    }
  ],
  "message": "Gợi ý cá nhân hóa từ hệ thống lai ghép.",
  "weights_used": {
    "collaborative": 0.30,
    "content": 0.25,
    "chatbot": 0.25,
    "rating": 0.20
  }
}
```

📖 **Chi tiết**: Xem [HYBRID_RECOMMENDATION_GUIDE.md](./HYBRID_RECOMMENDATION_GUIDE.md)

---

### 2. 🤝 Collaborative Filtering

**Endpoint**: `GET /api/ml/recommend/collaborative`

**Mô tả**: Gợi ý dựa trên hành vi người dùng tương tự (SVD)

**Parameters**:
```
user_id (required): ID người dùng
limit (optional): Số lượng gợi ý (default: 5)
```

**Example**:
```bash
curl "http://localhost:5000/api/ml/recommend/collaborative?user_id=1&limit=5"
```

---

### 3. 🛒 Apriori Association Rules

**Endpoint**: `GET /api/ml/recommend/apriori`

**Mô tả**: Gợi ý món kèm dựa trên giỏ hàng hiện tại

**Parameters**:
```
cart (required): Danh sách item_id (comma-separated)
limit (optional): Số lượng gợi ý (default: 4)
```

**Example**:
```bash
curl "http://localhost:5000/api/ml/recommend/apriori?cart=1,5,10&limit=4"
```

---

### 4. 💬 Admin Business Bot

**Endpoint**: `POST /api/ml/admin/chat`

**Mô tả**: Chatbot trả lời câu hỏi phân tích kinh doanh

**Body**:
```json
{
  "question": "Doanh thu tháng này là bao nhiêu?"
}
```

**Example**:
```bash
curl -X POST http://localhost:5000/api/ml/admin/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "Món nào bán chạy nhất?"}'
```

---

### 5. 🔄 Train Models

**Endpoint**: `POST /api/ml/train`

**Mô tả**: Huấn luyện lại tất cả models

**Example**:
```bash
curl -X POST http://localhost:5000/api/ml/train
```

---

## 🧪 Testing

### Test toàn bộ hệ thống

```bash
python test_hybrid.py
```

### Test từng component

```bash
python test_hybrid.py --components
```

### Test riêng Collaborative Filtering

```bash
python model.py
```

### Test riêng Apriori

```bash
python apriori_service.py
```

---

## 📁 Cấu Trúc Thư Mục

```
ai_service/
├── app.py                          # Flask API server
├── model.py                        # Collaborative Filtering (SVD)
├── apriori_service.py              # Apriori Association Rules
├── admin_bot_service.py            # Admin chatbot
├── hybrid_recommendation.py        # Hybrid recommendation (MỚI)
├── test_hybrid.py                  # Test script
├── requirements.txt                # Python dependencies
├── README.md                       # Tài liệu này
├── HYBRID_RECOMMENDATION_GUIDE.md  # Hướng dẫn chi tiết hybrid
└── models/                         # Trained models
    ├── svd_model.pkl
    └── apriori_rules.pkl
```

---

## 🔧 Cấu Hình

### Trọng Số Mặc Định (Hybrid)

```python
weights = {
    'collaborative': 0.30,  # Lọc cộng tác
    'content': 0.25,        # Từ khóa tìm kiếm
    'chatbot': 0.25,        # Ngữ cảnh chatbot
    'rating': 0.20          # Đánh giá sao
}
```

### Khi Nào Điều Chỉnh?

| Tình huống | Trọng số đề xuất |
|------------|------------------|
| User mới (cold-start) | `rating: 0.5, content: 0.3` |
| Có từ khóa tìm kiếm | `content: 0.4, collab: 0.3` |
| User vừa chat với bot | `chatbot: 0.4, collab: 0.3` |
| User trung thành | `collab: 0.5, rating: 0.2` |

---

## 📊 Workflow

### 1. Khi User Tìm Kiếm Món

```
User nhập "gà" 
    ↓
Frontend gọi: GET /api/menu/recommendations?keyword=gà
    ↓
Backend gọi: GET /api/ml/recommend/hybrid?user_id=1&keyword=gà
    ↓
AI Service tính điểm:
  - Content-based: So sánh "gà" với tên món
  - Collaborative: Dựa trên lịch sử user
  - Chatbot: Kiểm tra chat history
  - Rating: Lấy đánh giá sao
    ↓
Trả về top 10 món có điểm cao nhất
    ↓
Backend lấy thông tin chi tiết từ DB
    ↓
Frontend hiển thị kết quả
```

### 2. Khi User Thêm Món Vào Giỏ

```
User thêm món A, B vào giỏ
    ↓
Frontend gọi: GET /api/ml/recommend/apriori?cart=A,B
    ↓
AI Service tìm quy tắc kết hợp:
  "Người mua A, B thường mua thêm C, D"
    ↓
Hiển thị "Món kèm gợi ý" trong giỏ hàng
```

### 3. Training Schedule

```
Mỗi ngày 2:00 AM:
  - Chạy train_collaborative_model()
  - Chạy train_apriori_model()
  - Cập nhật models/
```

---

## 🐛 Troubleshooting

### Lỗi: "API_URL chưa được định nghĩa"

**Giải pháp**: Kiểm tra file `backend/.env` có đầy đủ thông tin DB

### Lỗi: "Không đủ data để train"

**Giải pháp**: 
- Cần ít nhất 2 users có lịch sử mua hàng
- Cần ít nhất 5 đơn hàng cho Apriori

### Lỗi: "Cold-start problem"

**Giải pháp**: 
- Sử dụng hybrid với trọng số `rating: 0.5`
- Fallback sang trending items

### Performance chậm

**Giải pháp**:
- Cache kết quả gợi ý (TTL: 5 phút)
- Pre-filter items trước khi tính điểm
- Sử dụng database indexing

---

## 📈 Metrics & Monitoring

### Metrics Quan Trọng

1. **Click-through Rate (CTR)**
   - Tỷ lệ user click vào món gợi ý
   - Target: > 15%

2. **Conversion Rate**
   - Tỷ lệ thêm món gợi ý vào giỏ
   - Target: > 8%

3. **Average Order Value (AOV)**
   - Giá trị đơn hàng trung bình
   - Mục tiêu: Tăng 10-15%

4. **Model Accuracy**
   - RMSE cho Collaborative Filtering
   - Confidence cho Apriori Rules

### Logging

```python
# Trong app.py
import logging

logging.basicConfig(
    filename='ai_service.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
```

---

## 🔐 Security

### API Rate Limiting

```python
from flask_limiter import Limiter

limiter = Limiter(app, key_func=get_remote_address)

@app.route('/api/ml/recommend/hybrid')
@limiter.limit("100 per minute")
def get_hybrid():
    ...
```

### Input Validation

```python
# Validate user_id
if not user_id or not str(user_id).isdigit():
    return jsonify({"error": "Invalid user_id"}), 400

# Sanitize keyword
keyword = keyword.strip()[:100]  # Max 100 chars
```

---

## 🚀 Deployment

### Production Checklist

- [ ] Cấu hình CORS cho production domain
- [ ] Thêm API authentication (JWT)
- [ ] Setup logging và monitoring
- [ ] Cấu hình auto-restart (systemd/supervisor)
- [ ] Setup cron job cho training
- [ ] Load balancing nếu cần
- [ ] Cache layer (Redis)

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

---

## 📚 Tài Liệu Tham Khảo

- [Hybrid Recommendation Guide](./HYBRID_RECOMMENDATION_GUIDE.md)
- [Collaborative Filtering - Wikipedia](https://en.wikipedia.org/wiki/Collaborative_filtering)
- [Apriori Algorithm](https://en.wikipedia.org/wiki/Apriori_algorithm)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Scikit-learn](https://scikit-learn.org/)

---

## 👥 Contributors

- AI Service Team - Phương Nam Restaurant

## 📄 License

Internal use only - Phương Nam Restaurant Management System

---

**Cập nhật lần cuối**: 2026-05-12
**Version**: 2.0.0 (Hybrid Recommendation)
