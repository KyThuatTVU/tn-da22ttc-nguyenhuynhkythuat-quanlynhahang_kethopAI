# 🎯 CẢI TIẾN HỆ THỐNG GỢI Ý THEO SỞ THÍCH NGƯỜI DÙNG

## 📋 VẤN ĐỀ ĐÃ GIẢI QUYẾT

### ❌ **Trước khi sửa:**
1. **Backend không đọc bảng `so_thich_nguoi_dung`**
   - Chỉ phân tích từ lịch sử mua hàng
   - Bỏ qua sở thích người dùng đã chọn trong popup khảo sát

2. **Trang thực đơn hiển thị ngẫu nhiên**
   - Không ưu tiên món phù hợp sở thích
   - Món phù hợp bị chìm xuống dưới
   - Người dùng phải cuộn tìm món yêu thích

3. **Có thuật ngữ chuyên ngành khó hiểu**
   - "Gợi ý từ AI Lai Ghép (Cá nhân hóa + Chatbot + Rating)"
   - Người dùng không hiểu ý nghĩa

### ✅ **Sau khi sửa:**
1. **Backend ưu tiên đọc sở thích từ bảng `so_thich_nguoi_dung`**
   - Đọc danh mục yêu thích người dùng đã chọn
   - Fallback sang lịch sử mua hàng nếu chưa có sở thích

2. **Trang thực đơn tự động sắp xếp theo sở thích**
   - Món phù hợp sở thích hiển thị **ở đầu trang**
   - Có điểm số (score) để sắp xếp chính xác
   - Món khác vẫn hiển thị phía sau

3. **Giao diện đơn giản, dễ hiểu**
   - Badge "❤️ Phù hợp với bạn" (màu hồng)
   - Không có thuật ngữ kỹ thuật

---

## 🔧 CHI TIẾT THAY ĐỔI

### 1. **Backend: `backend/routes/recommendation.js`**

#### **A. Cải tiến hàm `getContentBasedRecommendations()`**

**Thay đổi:**
```javascript
// ✅ MỚI: Ưu tiên đọc từ bảng so_thich_nguoi_dung
const [explicitPrefs] = await db.query(
    `SELECT ma_danh_muc FROM so_thich_nguoi_dung WHERE ma_nguoi_dung = ?`,
    [userId]
);

let favoriteCategories = explicitPrefs.map(p => p.ma_danh_muc);

// Nếu không có sở thích rõ ràng, phân tích từ lịch sử mua hàng
if (favoriteCategories.length === 0) {
    // ... phân tích từ chi_tiet_don_hang
}
```

**Lợi ích:**
- ✅ Tôn trọng sở thích người dùng đã chọn
- ✅ Gợi ý chính xác hơn
- ✅ Giải quyết vấn đề Cold Start (người dùng mới chưa có lịch sử mua)

#### **B. Cải tiến API endpoint `/api/recommendations`**

**Thay đổi:**
```javascript
// Tăng limit từ 8 lên 50 (để có đủ món cho trang thực đơn)
const limit = parseInt(req.query.limit) || 50;

// Phân bổ tỷ lệ gợi ý:
// - 60% từ sở thích (content-based)
// - 20% từ chat (chat-based)
// - 20% từ người dùng tương tự (collaborative)

// Gán điểm số (score) cho mỗi món:
contentBased.forEach((item, index) => {
    item.score = 100 - index; // 100, 99, 98...
});

chatBased.forEach((item, index) => {
    item.score = 89 - index; // 89, 88, 87...
});

collaborative.forEach((item, index) => {
    item.score = 79 - index; // 79, 78, 77...
});
```

**Lợi ích:**
- ✅ Có đủ món để hiển thị toàn bộ trang thực đơn
- ✅ Điểm số rõ ràng để sắp xếp
- ✅ Ưu tiên sở thích > chat > collaborative

#### **C. Loại bỏ trùng lặp thông minh**

**Thay đổi:**
```javascript
// Giữ món có score cao hơn khi trùng lặp
const seenIds = new Map();
for (const rec of recommendations) {
    const existingScore = seenIds.get(rec.ma_mon);
    if (!existingScore || rec.score > existingScore) {
        // Xóa món cũ, thêm món mới có score cao hơn
    }
}

// Sắp xếp theo score giảm dần
uniqueRecommendations.sort((a, b) => (b.score || 0) - (a.score || 0));
```

**Lợi ích:**
- ✅ Không bị trùng món
- ✅ Giữ món có độ ưu tiên cao nhất

---

### 2. **Frontend: `frontend/js/menu.js`**

#### **A. Sắp xếp món theo sở thích**

**Thay đổi:**
```javascript
// Trong hàm applyFiltersAndSort()

// ✨ ƯU TIÊN HIỂN THỊ MÓN THEO SỞ THÍCH
if (recommendedProducts.length > 0 && selectedCategory !== 'recommended') {
    const recMap = new Map(recommendedProducts.map(r => [r.ma_mon, r.score || 1]));
    
    // Tách món thành 2 nhóm
    const recommendedItems = filtered.filter(p => recMap.has(p.ma_mon));
    const otherItems = filtered.filter(p => !recMap.has(p.ma_mon));
    
    // Sắp xếp món gợi ý theo điểm số
    recommendedItems.sort((a, b) => {
        const scoreA = recMap.get(a.ma_mon) || 0;
        const scoreB = recMap.get(b.ma_mon) || 0;
        return scoreB - scoreA;
    });
    
    // Ghép lại: Món gợi ý trước, món khác sau
    filtered = [...recommendedItems, ...otherItems];
}
```

**Lợi ích:**
- ✅ Món phù hợp sở thích lên đầu trang
- ✅ Sắp xếp theo điểm số (món score cao nhất ở đầu)
- ✅ Không ảnh hưởng khi user chọn sắp xếp thủ công (giá, mới nhất...)

#### **B. Tải nhiều gợi ý hơn**

**Thay đổi:**
```javascript
// Tăng từ 50 lên 100 món
const recs = await window.RecommendationSystem.getRecommendations(100);

// Log để debug
console.log('📊 [Personalization] Top 5 recommendations:', 
    recommendedProducts.slice(0, 5).map(r => ({
        id: r.ma_mon,
        name: r.ten_mon,
        type: r.recommendation_type,
        score: r.score
    }))
);
```

**Lợi ích:**
- ✅ Đủ món để hiển thị toàn bộ trang thực đơn
- ✅ Dễ debug qua console

#### **C. Badge đơn giản "Phù hợp với bạn"**

**Thay đổi:**
```javascript
if (recItem) {
    preferredBadgeHTML = `
        <span class="category-badge text-pink-600 border-pink-200 bg-pink-50 ...">
            <i class="fas fa-heart mr-1"></i>Phù hợp với bạn
        </span>
    `;
}
```

**Lợi ích:**
- ✅ Dễ hiểu, thân thiện
- ✅ Không có thuật ngữ kỹ thuật
- ✅ Màu hồng nổi bật nhưng không quá chói

---

## 📊 CÁCH HOẠT ĐỘNG

### **Luồng dữ liệu:**

```
1. Người dùng đăng nhập
   ↓
2. Popup khảo sát sở thích (lần đầu)
   → Chọn: Hải sản, Lẩu, Rau củ
   → Lưu vào bảng: so_thich_nguoi_dung
   ↓
3. Vào trang Thực đơn
   ↓
4. Frontend gọi: GET /api/recommendations?limit=100
   ↓
5. Backend xử lý:
   a) Đọc so_thich_nguoi_dung → [Hải sản, Lẩu, Rau củ]
   b) Tìm món trong danh mục này
   c) Gán score: 100, 99, 98...
   d) Trả về JSON với score
   ↓
6. Frontend nhận dữ liệu:
   - Món Hải sản (score: 100)
   - Món Lẩu (score: 99)
   - Món Rau củ (score: 98)
   - ...
   ↓
7. Sắp xếp lại danh sách món:
   - Món score cao lên đầu
   - Món không có score xuống dưới
   ↓
8. Hiển thị trên trang:
   ✅ Tôm hấp (score: 100) ← Lên đầu!
   ✅ Lẩu mắm (score: 99)
   ✅ Rau xào (score: 98)
   ⚪ Gà nướng (score: 0)
   ⚪ Cơm chiên (score: 0)
```

---

## 🎯 VÍ DỤ THỰC TẾ

### **Kịch bản 1: User thích Hải sản**

**Dữ liệu trong DB:**
```sql
-- Bảng: so_thich_nguoi_dung
ma_nguoi_dung | ma_danh_muc
1             | 2  (Hải sản)
1             | 5  (Lẩu)
```

**Kết quả trên trang thực đơn:**
```
1. Tôm hấp (Hải sản) - Score: 100 ❤️ Phù hợp với bạn
2. Cá nướng (Hải sản) - Score: 99 ❤️ Phù hợp với bạn
3. Mực xào (Hải sản) - Score: 98 ❤️ Phù hợp với bạn
4. Lẩu hải sản (Lẩu) - Score: 97 ❤️ Phù hợp với bạn
5. Lẩu mắm (Lẩu) - Score: 96 ❤️ Phù hợp với bạn
6. Gà nướng (Thịt) - Score: 0
7. Cơm chiên (Cơm) - Score: 0
```

### **Kịch bản 2: User ăn chay**

**Dữ liệu trong DB:**
```sql
-- Bảng: so_thich_nguoi_dung
ma_nguoi_dung | ma_danh_muc
2             | 4  (Rau củ)
```

**Kết quả trên trang thực đơn:**
```
1. Rau xào (Rau củ) - Score: 100 ❤️ Phù hợp với bạn
2. Đậu hũ (Rau củ) - Score: 99 ❤️ Phù hợp với bạn
3. Canh rau (Rau củ) - Score: 98 ❤️ Phù hợp với bạn
4. Gỏi cuốn chay (Rau củ) - Score: 97 ❤️ Phù hợp với bạn
5. Tôm hấp (Hải sản) - Score: 0
6. Gà nướng (Thịt) - Score: 0
```

---

## 🧪 CÁCH KIỂM TRA

### **1. Kiểm tra Console (F12)**

```javascript
// Mở trang thực đơn, xem console:
✨ [Personalization] Loaded recommendations for menu: 30
📊 [Personalization] Top 5 recommendations:
[
  { id: 5, name: "Tôm hấp", type: "content_based", score: 100 },
  { id: 8, name: "Cá nướng", type: "content_based", score: 99 },
  { id: 12, name: "Lẩu hải sản", type: "content_based", score: 98 },
  { id: 15, name: "Mực xào", type: "content_based", score: 97 },
  { id: 20, name: "Tôm sú", type: "content_based", score: 96 }
]
```

### **2. Kiểm tra Database**

```sql
-- Xem sở thích của user
SELECT * FROM so_thich_nguoi_dung WHERE ma_nguoi_dung = 1;

-- Kết quả:
ma_nguoi_dung | ma_danh_muc
1             | 2  (Hải sản)
1             | 5  (Lẩu)
```

### **3. Kiểm tra API**

```bash
# Gọi API gợi ý
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/recommendations?limit=10"

# Kết quả:
{
  "success": true,
  "data": [
    {
      "ma_mon": 5,
      "ten_mon": "Tôm hấp",
      "recommendation_type": "content_based",
      "score": 100,
      "reason": "Phù hợp với sở thích của bạn (Hải sản)"
    },
    ...
  ],
  "meta": {
    "user_logged_in": true,
    "total": 30,
    "breakdown": {
      "content_based": 18,
      "chat_based": 6,
      "collaborative": 6,
      "trending": 0
    }
  }
}
```

### **4. Kiểm tra Giao diện**

1. Đăng nhập với tài khoản có sở thích
2. Vào trang **Thực đơn**
3. Kiểm tra:
   - ✅ Món phù hợp sở thích có ở đầu trang?
   - ✅ Có badge "❤️ Phù hợp với bạn"?
   - ✅ Món khác vẫn hiển thị phía sau?

---

## 🎨 TRẢI NGHIỆM NGƯỜI DÙNG

### **Trước:**
```
User: "Tôi thích ăn hải sản"
→ Vào trang thực đơn
→ Thấy: Gà nướng, Cơm chiên, Bò xào...
→ Phải cuộn xuống mới thấy món hải sản
→ Thất vọng 😞
```

### **Sau:**
```
User: "Tôi thích ăn hải sản"
→ Chọn sở thích trong popup
→ Vào trang thực đơn
→ Thấy ngay: Tôm hấp, Cá nướng, Mực xào...
→ Hài lòng 😊
```

---

## 📈 LỢI ÍCH

### **Cho Người dùng:**
- ✅ Tìm món yêu thích nhanh hơn
- ✅ Không cần lọc thủ công
- ✅ Trải nghiệm cá nhân hóa
- ✅ Tiết kiệm thời gian

### **Cho Nhà hàng:**
- ✅ Tăng tỷ lệ chuyển đổi (conversion rate)
- ✅ Tăng giá trị đơn hàng (AOV)
- ✅ Khách hàng quay lại nhiều hơn
- ✅ Giảm tỷ lệ bounce rate

---

## 🔮 CẢI TIẾN TƯƠNG LAI

### **1. Học từ hành vi thực tế**
```javascript
// Track hành vi người dùng
- Món được xem nhiều → Tăng score
- Món được thêm vào giỏ → Tăng score
- Món được mua → Tăng score rất nhiều
- Món bị bỏ qua → Giảm score
```

### **2. Gợi ý theo ngữ cảnh**
```javascript
// Thời gian
if (hour >= 6 && hour < 11) {
    // Sáng → Ưu tiên: Phở, Bún, Bánh mì
}

// Thời tiết
if (weather === 'cold') {
    // Lạnh → Ưu tiên: Lẩu, Súp, Món nóng
}

// Ngày lễ
if (date === 'Tết') {
    // Tết → Ưu tiên: Bánh chưng, Thịt kho
}
```

### **3. A/B Testing**
```javascript
// Test 2 thuật toán
Group A: Content-based 60% + Chat 20% + Collaborative 20%
Group B: Content-based 40% + Chat 30% + Collaborative 30%

// Đo lường:
- Conversion rate
- Average order value
- Time on page
- Bounce rate
```

---

## 📞 HỖ TRỢ

### **Nếu gặp vấn đề:**

1. **Món không hiển thị theo sở thích?**
   - Kiểm tra: User đã đăng nhập chưa?
   - Kiểm tra: User đã chọn sở thích chưa? (bảng `so_thich_nguoi_dung`)
   - Kiểm tra: API `/api/recommendations` có trả về dữ liệu không?

2. **Console báo lỗi?**
   - Mở F12 → Console
   - Tìm lỗi màu đỏ
   - Copy lỗi để debug

3. **API không hoạt động?**
   - Kiểm tra backend có chạy không? (port 3000)
   - Kiểm tra token có hợp lệ không?
   - Kiểm tra database có dữ liệu không?

---

**Cập nhật:** 2026-05-18  
**Phiên bản:** 3.0  
**Tác giả:** AI Assistant
