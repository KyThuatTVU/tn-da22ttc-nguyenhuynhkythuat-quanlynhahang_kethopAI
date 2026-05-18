# 🎯 Hướng Dẫn Hệ Thống Gợi Ý Theo Sở Thích Người Dùng

## 📋 Tổng Quan

Hệ thống đã được cải tiến để **ưu tiên hiển thị các món ăn phù hợp với sở thích người dùng** lên đầu trang thực đơn.

## 🔄 Cách Hoạt Động

### 1. **Thu Thập Sở Thích Người Dùng**

Hệ thống thu thập sở thích qua 3 cách:

#### a) **Khảo Sát Ban Đầu (Cold Start)**
- Khi người dùng đăng nhập lần đầu, hiển thị popup khảo sát
- Người dùng chọn danh mục yêu thích (Hải sản, Lẩu, Rau củ, v.v.)
- Lưu vào bảng `so_thich_nguoi_dung`

#### b) **Lịch Sử Mua Hàng**
- Phân tích các món đã mua
- Xác định danh mục yêu thích
- Tính giá trung bình người dùng hay mua

#### c) **Phân Tích Chat**
- Phân tích tin nhắn với chatbot
- Trích xuất từ khóa (lẩu, gà, hải sản, v.v.)
- Lưu vào bảng `du_lieu_tim_kiem`

### 2. **Tạo Gợi Ý Cá Nhân Hóa**

Backend tạo gợi ý qua 3 phương pháp (theo thứ tự ưu tiên):

#### **Phương Pháp 1: Content-Based (Điểm 100-90)** ⭐⭐⭐
- Dựa trên lịch sử mua hàng
- Gợi ý món trong danh mục yêu thích
- Ưu tiên món có giá gần với mức giá trung bình
- **Lý do**: "Phù hợp với sở thích của bạn (Hải sản)"

```javascript
// Ví dụ: User thường mua món Hải sản giá 150k-200k
// → Gợi ý: Tôm hấp (180k), Cá nướng (190k)
```

#### **Phương Pháp 2: Chat-Based (Điểm 89-80)** ⭐⭐
- Dựa trên phân tích chat
- Tìm món theo từ khóa chat
- **Lý do**: "💬 Dựa trên cuộc trò chuyện của bạn về 'lẩu'"

```javascript
// Ví dụ: User chat "tôi muốn ăn lẩu"
// → Gợi ý: Lẩu mắm, Lẩu Thái, Lẩu hải sản
```

#### **Phương Pháp 3: Collaborative Filtering (Điểm 79-70)** ⭐
- Dựa trên người dùng tương tự
- Tìm user có lịch sử mua giống nhau
- Gợi ý món mà họ đã mua
- **Lý do**: "Được nhiều khách hàng có sở thích giống bạn yêu thích"

```javascript
// Ví dụ: User A và User B đều mua Lẩu + Tôm
// User B còn mua Cá → Gợi ý Cá cho User A
```

### 3. **Hiển Thị Trên Trang Thực Đơn**

#### **Trước Khi Sửa** ❌
```
Trang thực đơn:
1. Món A (không liên quan)
2. Món B (không liên quan)
3. Món C (phù hợp sở thích) ← Bị chìm xuống
4. Món D (không liên quan)
```

#### **Sau Khi Sửa** ✅
```
Trang thực đơn:
1. Món C (phù hợp sở thích) ← Lên đầu! Score: 100
2. Món E (phù hợp sở thích) ← Lên đầu! Score: 99
3. Món F (từ chat)          ← Ưu tiên cao! Score: 89
4. Món A (không liên quan)  ← Xuống dưới
5. Món B (không liên quan)  ← Xuống dưới
```

## 🎨 Giao Diện

### **Đã Xóa** (Theo Yêu Cầu)
- ❌ Badge màu tím "Gợi ý từ AI Lai Ghép"
- ❌ Nhãn "Cá nhân hóa + Chatbot + Rating"
- ❌ Các thuật ngữ chuyên ngành

### **Giữ Lại**
- ✅ Sắp xếp món theo sở thích (không hiển thị badge)
- ✅ Danh mục "Gợi ý cho bạn" trong bộ lọc
- ✅ Hiển thị tất cả món (không ẩn món không phù hợp)

## 🔧 Code Đã Sửa

### **File: `frontend/js/menu.js`**

#### **1. Xóa Badge Màu Tím**
```javascript
// Đã xóa:
// - recBadgeHTML (badge màu tím)
// - recReasonHTML (lý do gợi ý màu tím)
```

#### **2. Thêm Logic Sắp Xếp Theo Sở Thích**
```javascript
// Trong hàm applyFiltersAndSort()
if (recommendedProducts.length > 0 && selectedCategory !== 'recommended') {
    const recIds = new Set(recommendedProducts.map(r => r.ma_mon));
    const recMap = new Map(recommendedProducts.map(r => [r.ma_mon, r.score || 1]));
    
    // Tách món thành 2 nhóm
    const recommendedItems = filtered.filter(p => recIds.has(p.ma_mon));
    const otherItems = filtered.filter(p => !recIds.has(p.ma_mon));
    
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

### **File: `backend/routes/recommendation.js`**

#### **Thêm Score Cho Mỗi Món Gợi Ý**
```javascript
// Content-based (sở thích rõ ràng): 100-90
contentBased.forEach((item, index) => {
    item.score = 100 - index;
});

// Chat-based (từ trò chuyện): 89-80
chatBased.forEach((item, index) => {
    item.score = 89 - index;
});

// Collaborative (người dùng tương tự): 79-70
collaborative.forEach((item, index) => {
    item.score = 79 - index;
});
```

## 📊 Ví Dụ Thực Tế

### **Kịch Bản 1: User Thích Hải Sản**

**Dữ liệu:**
- Lịch sử mua: Tôm hấp, Cá nướng, Mực xào
- Danh mục yêu thích: Hải sản
- Chat: "tôi muốn ăn hải sản"

**Kết quả trên trang thực đơn:**
```
1. Tôm hấp (Score: 100) - Content-based
2. Cá nướng (Score: 99) - Content-based
3. Mực xào (Score: 98) - Content-based
4. Lẩu hải sản (Score: 89) - Chat-based
5. Gà nướng (Score: 0) - Món khác
6. Cơm chiên (Score: 0) - Món khác
```

### **Kịch Bản 2: User Ăn Chay**

**Dữ liệu:**
- Lịch sử mua: Rau xào, Đậu hũ, Canh rau
- Danh mục yêu thích: Rau củ
- Chat: "tôi ăn chay"

**Kết quả trên trang thực đơn:**
```
1. Rau xào (Score: 100) - Content-based
2. Đậu hũ (Score: 99) - Content-based
3. Canh rau (Score: 98) - Content-based
4. Gỏi cuốn chay (Score: 89) - Chat-based
5. Tôm hấp (Score: 0) - Món khác
6. Gà nướng (Score: 0) - Món khác
```

## 🧪 Cách Kiểm Tra

### **1. Mở Console Browser (F12)**
```javascript
// Xem log gợi ý
✨ [Personalization] Loaded recommendations for menu: 10
📊 [Personalization] Top 5 recommendations:
[
  { id: 5, name: "Tôm hấp", type: "content_based", score: 100 },
  { id: 8, name: "Cá nướng", type: "content_based", score: 99 },
  { id: 12, name: "Lẩu hải sản", type: "chat_based", score: 89 }
]
```

### **2. Kiểm Tra Thứ Tự Món**
- Đăng nhập với tài khoản có lịch sử mua hàng
- Vào trang Thực đơn
- Kiểm tra: Món phù hợp sở thích có lên đầu không?

### **3. Kiểm Tra Bộ Lọc "Gợi Ý Cho Bạn"**
- Click vào "Gợi ý cho bạn" trong bộ lọc
- Chỉ hiển thị các món được gợi ý

## 🎯 Lợi Ích

### **Cho Người Dùng:**
- ✅ Tìm món phù hợp nhanh hơn
- ✅ Không cần lọc thủ công
- ✅ Trải nghiệm cá nhân hóa

### **Cho Nhà Hàng:**
- ✅ Tăng tỷ lệ chuyển đổi
- ✅ Tăng giá trị đơn hàng
- ✅ Khách hàng quay lại nhiều hơn

## 🔮 Tương Lai

### **Có Thể Cải Tiến:**
1. **Học từ hành vi thực tế:**
   - Track món được xem nhiều
   - Track món được thêm vào giỏ
   - Cập nhật sở thích theo thời gian

2. **Gợi ý theo ngữ cảnh:**
   - Thời gian (sáng → phở, tối → lẩu)
   - Thời tiết (nóng → đồ uống, lạnh → lẩu)
   - Ngày lễ (Tết → bánh chưng, Giáng sinh → gà nướng)

3. **A/B Testing:**
   - Test các thuật toán khác nhau
   - Đo lường hiệu quả
   - Tối ưu hóa liên tục

## 📞 Hỗ Trợ

Nếu có vấn đề, kiểm tra:
1. User đã đăng nhập chưa?
2. User đã có lịch sử mua hàng chưa?
3. API `/api/recommendations` có trả về dữ liệu không?
4. Console có log gợi ý không?

---

**Cập nhật:** 2026-05-18
**Phiên bản:** 2.0
