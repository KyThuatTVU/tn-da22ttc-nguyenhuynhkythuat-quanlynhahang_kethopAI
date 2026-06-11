# ✅ HOÀN THÀNH: Trang Quản Lý Luật Kết Hợp Apriori

## 📋 Tổng quan
Đã hoàn thiện trang admin để quản lý và hiển thị các luật kết hợp Apriori học từ lịch sử đơn hàng.

---

## ✨ Tính năng đã triển khai

### 1. **Backend API** ✅
- **Endpoint**: `GET http://localhost:5000/api/ml/apriori/rules`
- **File**: `ai_service/get_apriori_rules.py`
- **Chức năng**:
  - Đọc model Apriori đã train từ `models/apriori_rules.pkl`
  - Lấy thông tin món ăn từ database
  - Trả về danh sách luật kèm metadata (confidence, lift, dish details)
  - Sắp xếp theo confidence giảm dần

### 2. **Frontend Admin Page** ✅
- **File**: `frontend/admin/apriori-rules.html`
- **Chức năng đã hoàn thiện**:

#### a. Thống kê tổng quan
- ✅ Tổng số luật
- ✅ Số món gốc (antecedents)
- ✅ Confidence trung bình

#### b. Bộ lọc & Tìm kiếm
- ✅ Tìm kiếm theo tên món ăn
- ✅ Lọc theo Confidence tối thiểu (slider)
- ✅ Sắp xếp theo: Confidence, Lift, Tên món gốc

#### c. Hiển thị dạng **List** (Danh sách)
- ✅ Card hiển thị từng luật với:
  - Hình ảnh món ăn (antecedent và consequent)
  - Tên món và giá tiền
  - Mũi tên chỉ hướng A → B
  - Thanh progress bar cho Confidence (màu gradient)
  - Chỉ số Lift (màu xanh nếu > 1)

#### d. Hiển thị dạng **Network Graph** (Biểu đồ mạng) ✅ HOÀN THÀNH
- ✅ **Sử dụng vis.js** để vẽ biểu đồ mạng
- ✅ **Nodes** (các nút món ăn):
  - Màu cam: Món gốc (Antecedent)
  - Màu xanh: Món được gợi ý (Consequent)
  - Hiển thị tên món và giá tiền khi hover
- ✅ **Edges** (mũi tên kết nối):
  - Độ dày mũi tên: Tỉ lệ với Confidence
  - Màu mũi tên:
    - 🟢 Xanh (Lift ≥ 2.0) - mối quan hệ mạnh
    - 🟡 Vàng (1.0 ≤ Lift < 2.0) - mối quan hệ trung bình
    - 🔴 Đỏ (Lift < 1.0) - mối quan hệ yếu
  - Hiển thị Confidence và Lift khi hover
- ✅ **Tính năng tương tác**:
  - Kéo thả các node
  - Zoom in/out
  - Navigation buttons (di chuyển, zoom, fit view)
  - Physics simulation để tự động sắp xếp các node hợp lý
  - Tắt physics sau khi ổn định để tiết kiệm hiệu năng

#### e. Chuyển đổi giữa 2 chế độ xem
- ✅ Nút "Xem dạng Graph" (màu xanh)
- ✅ Nút "Xem dạng List" (màu xám)
- ✅ Hàm `toggleView(viewType)` để chuyển đổi
- ✅ Tự động render graph khi chuyển sang chế độ network

#### f. Train lại Model
- ✅ Nút "Train lại Model"
- ✅ Gọi API `POST http://localhost:5000/api/ml/train`
- ✅ Xác nhận trước khi train
- ✅ Reload trang sau khi train thành công

### 3. **Tích hợp vào Admin Layout** ✅
- **File**: `frontend/admin/admin-layout.js`
- ✅ Thêm menu item "Luật kết hợp AI" vào sidebar
- ✅ Đặt trong nhóm "Khách hàng & Tiếp thị"
- ✅ Icon: `fa-project-diagram`
- ✅ Link: `apriori-rules.html`

### 4. **Điều chỉnh ngưỡng Apriori** ✅
- **File**: `ai_service/apriori_service.py`
- ✅ Tăng `min_confidence` từ 10% → 30%
- ✅ Tăng `min_support` từ 1% → 1.5%
- ✅ Thêm documentation về cách điều chỉnh ngưỡng
- ✅ Khuyến nghị filter Lift > 1.0 (chưa implement trong code, để lại cho sau)

---

## 📂 File structure

```
frontend/admin/
├── apriori-rules.html          ✅ HOÀN THÀNH (có network graph)
└── admin-layout.js             ✅ Đã thêm menu item

ai_service/
├── apriori_service.py          ✅ Đã điều chỉnh ngưỡng
├── get_apriori_rules.py        ✅ HOÀN THÀNH
└── app.py                      ✅ Đã có endpoint /api/ml/apriori/rules

APRIORI_ADMIN_GUIDE.md          ✅ Đã cập nhật với hướng dẫn network graph
```

---

## 🎯 Hướng dẫn sử dụng

### **Bước 1: Khởi động AI Service**
```bash
cd ai_service
python app.py
```
→ AI service chạy trên `http://localhost:5000`

### **Bước 2: Truy cập trang Admin**
```
http://localhost/admin/apriori-rules.html
```

### **Bước 3: Xem luật kết hợp**

#### **Chế độ List (mặc định)**
- Hiển thị danh sách các luật dạng card
- Mỗi card có hình ảnh món, tên, giá, confidence bar, lift

#### **Chế độ Network Graph**
1. Click nút "Xem dạng Graph"
2. Biểu đồ mạng sẽ xuất hiện
3. Có thể:
   - Kéo các node để sắp xếp
   - Zoom in/out bằng scroll chuột
   - Hover vào node để xem tên món và giá
   - Hover vào mũi tên để xem confidence và lift
   - Dùng navigation buttons để điều khiển

### **Bước 4: Lọc và tìm kiếm**
- Gõ tên món vào ô tìm kiếm
- Kéo slider Confidence để lọc
- Chọn tiêu chí sắp xếp

### **Bước 5: Train lại Model (khi cần)**
- Click nút "Train lại Model"
- Xác nhận
- Đợi 1-2 phút
- Trang sẽ tự reload

---

## 🔧 Cấu hình kỹ thuật

### **Thư viện sử dụng**
- **Vis.js 9.1.2**: Vẽ network graph
- **TailwindCSS**: Styling
- **Font Awesome 6.5.1**: Icons

### **API Endpoints**

#### 1. Lấy tất cả luật
```http
GET http://localhost:5000/api/ml/apriori/rules
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "antecedent": {
        "id": 2,
        "name": "Lẩu Cù Lao",
        "image": "lau-cu-lao.jpg",
        "price": 350000
      },
      "consequent": {
        "id": 15,
        "name": "Nước ngọt Coca",
        "image": "coca.jpg",
        "price": 15000
      },
      "confidence": 0.75,
      "lift": 2.3,
      "rule": "Lẩu Cù Lao → Nước ngọt Coca"
    }
  ],
  "meta": {
    "total_rules": 45,
    "total_antecedents": 12,
    "avg_confidence": 0.58
  }
}
```

#### 2. Train lại Model
```http
POST http://localhost:5000/api/ml/train
```

### **Ngưỡng Apriori hiện tại**
```python
min_support = 0.015     # 1.5% - Món phải xuất hiện ít nhất 1.5% đơn hàng
min_confidence = 0.3    # 30% - Luật phải có confidence >= 30%
```

**Để điều chỉnh:** Sửa trong `ai_service/apriori_service.py`

---

## 📊 Giải thích các chỉ số

### **Confidence (Độ tin cậy)**
```
Confidence(A → B) = P(B|A) = "Khi mua A, bao nhiêu % cũng mua B"
```

**Ví dụ:**
- Confidence = 75% → 75% khách mua món A cũng mua món B

**Ngưỡng tốt:**
- ≥ 30%: Có mối quan hệ
- ≥ 50%: Mối quan hệ mạnh
- ≥ 70%: Rất nên gợi ý

---

### **Lift (Độ nâng)**
```
Lift(A → B) = Confidence(A → B) / Support(B)
```

**Ý nghĩa:**
- **Lift > 1**: Mua A → **Tăng** khả năng mua B (quan hệ tích cực)
- **Lift = 1**: A và B độc lập (không liên quan)
- **Lift < 1**: Mua A → **Giảm** khả năng mua B (quan hệ tiêu cực)

**Ngưỡng tốt:**
- ≥ 1.2: Có ảnh hưởng
- ≥ 2.0: Ảnh hưởng mạnh
- ≥ 3.0: Ảnh hưởng rất mạnh

---

## 🎨 Network Graph Configuration

```javascript
const options = {
    physics: {
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
            gravitationalConstant: -50,
            centralGravity: 0.01,
            springLength: 150,
            springConstant: 0.08,
            damping: 0.4,
            avoidOverlap: 1
        },
        stabilization: {
            iterations: 200
        }
    },
    interaction: {
        hover: true,
        tooltipDelay: 100,
        navigationButtons: true,
        keyboard: true
    }
}
```

**Tùy chỉnh:**
- `springLength`: Khoảng cách giữa các node (150px)
- `gravitationalConstant`: Lực hút giữa các node (-50 = đẩy nhau)
- `stabilization.iterations`: Số lần tính toán vị trí (200 lần)

---

## 🚨 Lưu ý

### **Dữ liệu hiện tại chưa đủ**
Như đã phân tích trong summary:
- Hiện tại chỉ có ~12 frequent itemsets
- KHÔNG có luật nào đạt confidence ≥ 50% với dữ liệu hiện tại
- Cần **50-100+ đơn hàng** để Apriori hoạt động hiệu quả

**Hiện tại:**
- Hệ thống sử dụng ngưỡng 30% (đã giảm từ 80%)
- Nếu không có luật, sẽ dùng hardcoded fallback rules
- Admin có thể xem luật yếu trong trang này để hiểu dữ liệu

### **Khi nào train lại?**
- Sau mỗi 20-30 đơn hàng mới
- Khi thêm/xóa món ăn
- Khi muốn cập nhật xu hướng mới

---

## ✅ Checklist hoàn thành

- [x] Backend API `/api/ml/apriori/rules` hoạt động
- [x] Frontend page load được
- [x] Hiển thị stats cards (tổng số luật, món gốc, confidence TB)
- [x] Bộ lọc: tìm kiếm, confidence slider, sắp xếp
- [x] List view: Card với hình ảnh, tên, giá, confidence bar, lift
- [x] **Network graph view: Biểu đồ mạng với vis.js** ✅
- [x] Toggle giữa 2 chế độ xem
- [x] Train lại model button
- [x] Tích hợp vào admin sidebar menu
- [x] Cập nhật documentation (APRIORI_ADMIN_GUIDE.md)
- [x] Điều chỉnh ngưỡng Apriori trong `apriori_service.py`

---

## 🎉 Kết luận

Trang quản lý Luật Kết Hợp Apriori đã **HOÀN THÀNH** đầy đủ tính năng:
- ✅ Hiển thị list view với filter/sort
- ✅ **Hiển thị network graph view với tương tác**
- ✅ Train lại model
- ✅ Tích hợp vào admin layout

**Điểm nổi bật của Network Graph:**
- Trực quan hóa mối quan hệ món ăn
- Tương tác mượt mà (kéo, zoom, pan)
- Màu sắc phân biệt độ mạnh của luật
- Tooltip hiển thị chi tiết khi hover

**Bước tiếp theo (nếu cần):**
1. Implement filter Lift > 1.0 trong code (hiện chỉ có trong docs)
2. Thêm export CSV/JSON cho các luật
3. Thêm biểu đồ thống kê (histogram confidence, lift distribution)
4. Thêm tính năng so sánh giữa 2 lần train

---

**Ngày hoàn thành:** 2026-06-08  
**Tác giả:** Kiro AI Assistant
