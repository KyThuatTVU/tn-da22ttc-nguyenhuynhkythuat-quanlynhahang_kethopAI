# Hệ thống Gợi ý Món Mới (New Dish Recommendation)

## Tổng quan

Hệ thống gợi ý món mới ra mắt (≤ 30 ngày) phù hợp với khẩu vị người dùng, đảm bảo món mới luôn có cơ hội xuất hiện trong feed cá nhân hóa.

## Kiến trúc

### A. Database Schema
- **Cột mới**: `mon_an.ngay_tao` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- **Index**: `idx_mon_an_ngay_tao` để tăng tốc query món mới
- **Migration**: `backend/scripts/add-new-dish-tracking.sql`

### B. Backend APIs

#### 1. Endpoint mới: `/api/recommendations/new-dishes`
**Method**: GET  
**Auth**: Required (Bearer token)  
**Query params**:
- `limit` (optional, default: 5): Số lượng món gợi ý

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "ma_mon": 123,
      "ten_mon": "Gà nướng muối ớt",
      "anh_mon": "/images/album-xxx.jpg",
      "gia_tien": 180000,
      "ngay_tao": "2026-06-10T10:30:00.000Z",
      "ten_danh_muc": "Món chính",
      "days_old": 9,
      "matched_flavors": "Cay, Mặn",
      "avg_rating": 4.8,
      "score": 0.85,
      "reason": "🆕 Món mới ra mắt, hợp khẩu vị của bạn (Cay, Mặn)"
    }
  ]
}
```

#### 2. Python API: `get_new_dish_recommendations(user_id, limit)`
**Location**: `ai_service/hybrid_recommendation.py`  
**Logic**:
1. Lấy khẩu vị yêu thích của user từ lịch sử đánh giá cao (≥4 sao)
2. Tìm món mới (≤30 ngày) có khẩu vị match
3. Fallback: Nếu user chưa có lịch sử, lấy món mới theo popularity

**Score**: 0.85 (giữa content-based 1.0 và collaborative 0.95)

### C. Boost trong Content-Based Recommendations

File: `backend/routes/recommendation.js`  
Hàm: `getContentBasedRecommendations()`

**ORDER BY clause**:
```sql
ORDER BY 
    (CASE WHEN DATEDIFF(NOW(), m.ngay_tao) <= 30 THEN 1 ELSE 0 END) DESC,
    COALESCE(avg_rating, 4.0) DESC,
    ABS(m.gia_tien - ?) ASC
```

**Ưu tiên**:
1. Món mới (≤30 ngày)
2. Đánh giá cao
3. Giá phù hợp

## Cài đặt

### Bước 1: Chạy migration
```bash
node backend/scripts/run-new-dish-migration.js
```

### Bước 2: Restart backend
```bash
cd backend
npm start
```

### Bước 3: Test endpoint
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/recommendations/new-dishes?limit=5
```

## Quy trình Admin

### Khi thêm món mới
1. Vào trang Admin → Thực đơn → Thêm món
2. **BẮT BUỘC**: Chọn ít nhất 1 khẩu vị (mon_an_khau_vi)
3. Submit → Cột `ngay_tao` tự động set = NOW()

### ⚠️ LƯU Ý QUAN TRỌNG
**Món mới PHẢI được gán khẩu vị** thì mới hiển thị cho user có sở thích khẩu vị đó!

### Validation cần thêm (đề xuất)
File: `frontend/admin/menu-form.js` (hoặc tương tự)

```javascript
// Trước khi submit form
if (!selectedFlavors || selectedFlavors.length === 0) {
    alert('⚠️ Vui lòng chọn ít nhất 1 khẩu vị cho món mới!');
    return false;
}
```

## User Preference Sources (Thứ tự ưu tiên)

Hệ thống lấy khẩu vị yêu thích của user từ 4 nguồn theo thứ tự ưu tiên:

1. **`so_thich_khau_vi_nguoi_dung`** (Cao nhất) - Sở thích được chọn trực tiếp từ profile
2. **`danh_gia_san_pham`** - Khẩu vị của món được đánh giá ≥4 sao
3. **`user_preference_profile`** - Sở thích học từ ML (chatbot + reviews)
4. **Fallback** - Khẩu vị phổ biến nhất trong hệ thống

### 🔧 Fix 2024-06-19
**Vấn đề**: Món mới có khẩu vị không hiển thị cho user vì chỉ check nguồn #2 (đánh giá)
**Giải pháp**: Thêm check nguồn #1 và #3 trước khi fallback
**Files đã sửa**:
- `backend/routes/recommendation.js` → `/new-dishes` endpoint
- `ai_service/hybrid_recommendation.py` → `get_new_dish_recommendations()`

## Tradeoffs & Lưu ý

### ✅ Ưu điểm
- Món mới có cơ hội bình đẳng xuất hiện trong feed
- Không phụ thuộc vào lịch sử bán hàng (collaborative bias)
- Score 0.85 đủ cao để cạnh tranh với content-based (1.0)

### ⚠️ Hạn chế
- **Phụ thuộc khẩu vị**: Món không gán khẩu vị sẽ chỉ xuất hiện trong fallback
- **Cold start**: User mới chưa có lịch sử đánh giá → nhận gợi ý món mới theo popularity
- **30 ngày cố định**: Có thể cần điều chỉnh threshold tùy tốc độ ra món mới

### 🔧 Cải tiến tương lai
1. **Dynamic threshold**: Tự động điều chỉnh "món mới" dựa trên tốc độ ra món (vd: nếu < 5 món/tháng → 60 ngày)
2. **A/B testing**: Test score 0.85 vs 0.90 vs 0.80
3. **Decay function**: Score giảm dần theo thời gian (vd: ngày 1 = 0.90, ngày 30 = 0.75)
4. **Validation UI**: Bắt buộc admin chọn khẩu vị trong form

## Testing

### Test case 1: User có lịch sử đánh giá
```sql
-- Insert test user rating
INSERT INTO danh_gia_san_pham (ma_nguoi_dung, ma_mon, so_sao, trang_thai)
VALUES (1, 10, 5, 'approved');

-- Insert new dish với khẩu vị match
INSERT INTO mon_an (ten_mon, ma_danh_muc, gia_tien, trang_thai, ngay_tao)
VALUES ('Test món mới', 1, 100000, 1, NOW());

INSERT INTO mon_an_khau_vi (ma_mon, id_thuoc_tinh)
SELECT LAST_INSERT_ID(), id_thuoc_tinh
FROM mon_an_khau_vi WHERE ma_mon = 10 LIMIT 1;
```

### Test case 2: Boost trong content-based
```sql
-- Kiểm tra món mới xuất hiện đầu tiên
SELECT m.ma_mon, m.ten_mon, DATEDIFF(NOW(), m.ngay_tao) as days_old,
       (CASE WHEN DATEDIFF(NOW(), m.ngay_tao) <= 30 THEN 1 ELSE 0 END) as is_new
FROM mon_an m
WHERE m.trang_thai = 1
ORDER BY is_new DESC, m.ngay_tao DESC
LIMIT 10;
```

## Metrics để theo dõi

1. **CTR món mới**: Click-through rate của món mới so với món cũ
2. **Conversion rate**: Tỷ lệ món mới được thêm vào giỏ hàng
3. **Coverage**: % món mới được gợi ý ít nhất 1 lần sau 7 ngày
4. **Engagement**: View time, like rate của món mới

## Changelog

- **2026-06-19**: Triển khai lần đầu (A + B + C)
  - Migration thêm cột `ngay_tao`
  - Endpoint `/api/recommendations/new-dishes`
  - Python function `get_new_dish_recommendations()`
  - Boost trong `getContentBasedRecommendations()`
