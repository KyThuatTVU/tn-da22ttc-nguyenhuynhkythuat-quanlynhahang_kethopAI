# Cơ Sở Lý Thuyết - Hệ Thống Gợi Ý

## Tổng Quan Các Thuật Toán Gợi Ý Chính

### 1. Content-Based Filtering (Lọc Dựa Nội Dung)

**Nguyên lý**: Gợi ý items tương tự với những gì user đã thích trước đó

**Cách hoạt động**:
- Phân tích đặc trưng của items (tên, mô tả, danh mục)
- So sánh với lịch sử tương tác của user
- Gợi ý items có đặc trưng tương đồng

**Ví dụ**: User thích "Gà chiên giòn" → Gợi ý "Gà nướng mật ong"

**Ưu điểm**:
- Không cần dữ liệu từ users khác
- Giải thích được lý do gợi ý
- Không có cold-start cho items mới

**Nhược điểm**:
- Over-specialization (chỉ gợi ý món giống nhau)
- Không khám phá sở thích mới
- Phụ thuộc vào chất lượng mô tả

---

### 2. Collaborative Filtering (Lọc Cộng Tác)

**Nguyên lý**: "Người giống bạn thích gì, bạn cũng sẽ thích"

**Hai loại chính**:

#### a) User-Based CF
- Tìm users tương tự với target user
- Gợi ý items mà users tương tự đã thích

**Công thức tương đồng (Cosine)**:
```
sim(u,v) = cos(θ) = (r_u · r_v) / (||r_u|| × ||r_v||)
```

#### b) Item-Based CF
- Tìm items tương tự với items user đã thích
- Gợi ý items tương tự

**Ví dụ**: 
- User A, B, C thích "Lẩu Thái"
- User A, B cũng thích "Gỏi cuốn"
- → Gợi ý "Gỏi cuốn" cho User C

**Ưu điểm**:
- Khám phá items mới
- Không cần phân tích nội dung
- Hiệu quả với dữ liệu lớn

**Nhược điểm**:
- Cold-start problem (user/item mới)
- Sparsity (ma trận thưa)
- Scalability issues

---

### 3. Matrix Factorization (Phân Rã Ma Trận)

**Nguyên lý**: Giảm chiều ma trận User-Item để tìm latent factors (yếu tố ẩn)

**Các phương pháp**:

#### a) SVD (Singular Value Decomposition)
```
R ≈ U × Σ × V^T
```

#### b) ALS (Alternating Least Squares)
- Tối ưu hóa luân phiên U và V
- Phù hợp với dữ liệu implicit feedback

#### c) NMF (Non-negative Matrix Factorization)
- Ràng buộc giá trị không âm
- Dễ giải thích hơn

**Ví dụ Latent Factors**:
- Factor 1: "Độ cay"
- Factor 2: "Giá cả"
- Factor 3: "Phong cách Á/Âu"

**Ưu điểm**:
- Xử lý được sparsity
- Phát hiện sở thích tiềm ẩn
- Scalable

**Nhược điểm**:
- Khó giải thích
- Cần nhiều dữ liệu
- Cold-start vẫn tồn tại

---

### 4. Association Rules (Quy Tắc Kết Hợp)

**Nguyên lý**: Tìm mối liên hệ giữa các items trong giao dịch

**Thuật toán chính**:

#### a) Apriori
- Tìm frequent itemsets
- Sinh association rules

**Quy tắc**: `{Lẩu Thái, Nước ngọt} → {Nem rán}`

**Metrics**:
- **Support**: Tần suất xuất hiện
- **Confidence**: Độ tin cậy
- **Lift**: Mức độ liên quan

#### b) FP-Growth
- Hiệu quả hơn Apriori
- Sử dụng FP-tree structure

**Ví dụ**:
```
Rule: {Cơm chiên} → {Canh chua}
Support: 15% (xuất hiện trong 15% đơn hàng)
Confidence: 70% (70% người mua cơm chiên cũng mua canh chua)
Lift: 2.5 (liên quan mạnh)
```

**Ưu điểm**:
- Tìm món kèm hiệu quả
- Dễ giải thích
- Không cần user profile

**Nhược điểm**:
- Chỉ dựa vào giao dịch
- Không cá nhân hóa
- Cần nhiều transactions

---

### 5. Deep Learning Based (Học Sâu)

**Các kiến trúc chính**:

#### a) Neural Collaborative Filtering (NCF)
```
Input: [user_id, item_id]
    ↓
Embedding Layer
    ↓
MLP Layers
    ↓
Output: Predicted Rating
```

#### b) Autoencoders
- Học representation của users/items
- Xử lý missing values

#### c) RNN/LSTM
- Mô hình hóa sequence (lịch sử tương tác)
- Dự đoán next item

#### d) Attention Mechanism
- Tập trung vào items quan trọng
- Transformer-based models

**Ví dụ**: 
```
User history: [Phở → Bún chả → Nem rán]
→ Predict: Chả giò (món Việt tiếp theo)
```

**Ưu điểm**:
- Học được patterns phức tạp
- Xử lý được nhiều loại features
- State-of-the-art performance

**Nhược điểm**:
- Cần nhiều dữ liệu
- Khó giải thích
- Tốn tài nguyên

---

### 6. Context-Aware Recommendation (Nhận Biết Ngữ Cảnh)

**Nguyên lý**: Tích hợp thông tin ngữ cảnh vào gợi ý

**Các yếu tố ngữ cảnh**:
- **Thời gian**: Sáng → Phở, Tối → Lẩu
- **Vị trí**: Gần nhà → Giao hàng, Xa → Đặt trước
- **Thời tiết**: Lạnh → Lẩu, Nóng → Chè
- **Thiết bị**: Mobile → Giao hàng, Desktop → Đặt bàn
- **Social**: Một mình → Cơm, Nhóm → Lẩu

**Mô hình**:
```
Score(user, item, context) = f(user, item, time, location, weather, ...)
```

**Ví dụ**:
```
User: Thuật
Time: 19:00 (tối)
Weather: Lạnh
Location: Nhà
→ Gợi ý: Lẩu, Bò kho, Phở
```

**Ưu điểm**:
- Gợi ý phù hợp tình huống
- Tăng độ chính xác
- Cá nhân hóa cao

**Nhược điểm**:
- Cần thu thập nhiều dữ liệu
- Phức tạp hơn
- Privacy concerns

---

### 7. Hybrid Recommendation (Gợi Ý Lai Ghép)

**Nguyên lý**: Kết hợp nhiều phương pháp để tận dụng ưu điểm

**Các cách kết hợp**:

#### a) Weighted (Trọng số)
```
Score = w₁×CF + w₂×Content + w₃×Context + w₄×Rating
```

#### b) Switching (Chuyển đổi)
- Chọn phương pháp tốt nhất theo tình huống
- User mới → Content-based
- User cũ → Collaborative

#### c) Mixed (Trộn lẫn)
- Hiển thị kết quả từ nhiều phương pháp
- Đa dạng hóa gợi ý

#### d) Feature Combination
- Kết hợp features từ nhiều nguồn
- Đưa vào một model duy nhất

#### e) Cascade (Tầng)
- Lọc dần qua các phương pháp
- CF → Content → Context

#### f) Meta-level
- Output của phương pháp này là input của phương pháp khác

**Ví dụ Hệ Thống Của Chúng Ta**:
```
Hybrid = 0.30×Collaborative + 0.25×Content + 0.25×Chatbot + 0.20×Rating
```

**Ưu điểm**:
- Khắc phục nhược điểm của từng phương pháp
- Hiệu quả cao nhất
- Linh hoạt

**Nhược điểm**:
- Phức tạp
- Khó tối ưu trọng số
- Tốn tài nguyên

---

### 8. Knowledge-Based Recommendation (Dựa Tri Thức)

**Nguyên lý**: Sử dụng tri thức về domain và user requirements

**Hai loại**:

#### a) Constraint-based
- User chỉ định ràng buộc
- Hệ thống tìm items thỏa mãn

**Ví dụ**:
```
Constraints:
- Giá < 100k
- Không cay
- Món Việt
→ Gợi ý: Phở, Bún chả, Cơm tấm
```

#### b) Case-based
- Tìm items tương tự với yêu cầu
- Điều chỉnh dần theo feedback

**Ưu điểm**:
- Không cần lịch sử
- Giải thích được
- Phù hợp items phức tạp

**Nhược điểm**:
- Cần xây dựng knowledge base
- Không học từ dữ liệu
- Khó maintain

---

### 9. Reinforcement Learning (Học Tăng Cường)

**Nguyên lý**: Agent học cách gợi ý tối ưu qua tương tác

**Thành phần**:
- **State**: User profile, context
- **Action**: Gợi ý item
- **Reward**: Click, purchase, rating
- **Policy**: Chiến lược gợi ý

**Thuật toán**:
- **Multi-Armed Bandit**: Cân bằng exploration/exploitation
- **Q-Learning**: Học Q-value cho mỗi action
- **Deep Q-Network (DQN)**: Kết hợp Deep Learning

**Ví dụ**:
```
State: User vừa xem "Gà chiên"
Actions: [Gợi ý A, B, C, D]
User clicks A → Reward = +1
→ Tăng xác suất gợi ý A trong tương lai
```

**Ưu điểm**:
- Tối ưu long-term reward
- Tự động cân bằng explore/exploit
- Thích nghi với thay đổi

**Nhược điểm**:
- Cần nhiều interactions
- Phức tạp
- Khó debug

---

## So Sánh Các Thuật Toán

| Thuật toán | Cold-start | Scalability | Explainability | Accuracy |
|------------|------------|-------------|----------------|----------|
| Content-Based | ✅ Good | ✅ Good | ✅ High | ⚠️ Medium |
| Collaborative | ❌ Poor | ⚠️ Medium | ⚠️ Medium | ✅ High |
| Matrix Factorization | ❌ Poor | ✅ Good | ❌ Low | ✅ High |
| Association Rules | ✅ Good | ✅ Good | ✅ High | ⚠️ Medium |
| Deep Learning | ❌ Poor | ⚠️ Medium | ❌ Low | ✅ Very High |
| Context-Aware | ⚠️ Medium | ⚠️ Medium | ✅ High | ✅ High |
| Hybrid | ✅ Good | ⚠️ Medium | ⚠️ Medium | ✅ Very High |
| Knowledge-Based | ✅ Very Good | ✅ Good | ✅ Very High | ⚠️ Medium |
| Reinforcement | ⚠️ Medium | ⚠️ Medium | ❌ Low | ✅ High |

---

## Lựa Chọn Thuật Toán

### Khi nào dùng gì?

**Content-Based**:
- ✅ Items có mô tả chi tiết
- ✅ User mới (cold-start)
- ✅ Cần giải thích gợi ý

**Collaborative Filtering**:
- ✅ Có nhiều users và interactions
- ✅ Muốn khám phá items mới
- ✅ Không cần giải thích

**Matrix Factorization**:
- ✅ Dữ liệu lớn, sparse
- ✅ Cần scalability
- ✅ Có GPU/TPU

**Association Rules**:
- ✅ Gợi ý món kèm
- ✅ Cross-selling
- ✅ Cần giải thích đơn giản

**Deep Learning**:
- ✅ Có rất nhiều dữ liệu
- ✅ Cần accuracy cao nhất
- ✅ Có tài nguyên tính toán

**Context-Aware**:
- ✅ Có dữ liệu ngữ cảnh
- ✅ Gợi ý theo tình huống
- ✅ Cá nhân hóa cao

**Hybrid**:
- ✅ Muốn kết hợp ưu điểm
- ✅ Có nhiều nguồn dữ liệu
- ✅ Cần hiệu quả cao nhất

**Knowledge-Based**:
- ✅ Items phức tạp (bất động sản, xe hơi)
- ✅ Không có lịch sử
- ✅ Cần tư vấn chi tiết

**Reinforcement Learning**:
- ✅ Tối ưu long-term
- ✅ Môi trường động
- ✅ Có feedback liên tục

---

## Chi Tiết Các Thuật Toán

## 1. Collaborative Filtering (Lọc Cộng Tác)

### SVD - Singular Value Decomposition

**Công thức**:
```
R ≈ U × Σ × V^T
```

Trong đó:
- `R`: Ma trận User-Item (m users × n items)
- `U`: Ma trận User features (m × k)
- `Σ`: Ma trận Singular values (k × k)
- `V^T`: Ma trận Item features (k × n)
- `k`: Số chiều ẩn (latent factors)

**Dự đoán rating**:
```
r̂(u,i) = u_u · v_i
```

**Ưu điểm**: Giảm chiều dữ liệu, phát hiện sở thích tiềm ẩn

**Nhược điểm**: Cold-start problem

---

## 2. Content-Based Filtering (Lọc Dựa Nội Dung)

### TF-IDF - Term Frequency-Inverse Document Frequency

**Công thức**:
```
TF-IDF(t,d) = TF(t,d) × IDF(t)

TF(t,d) = (Số lần xuất hiện của t trong d) / (Tổng số từ trong d)

IDF(t) = log(N / df(t))
```

Trong đó:
- `t`: Từ (term)
- `d`: Tài liệu (document)
- `N`: Tổng số tài liệu
- `df(t)`: Số tài liệu chứa từ t

### Cosine Similarity

**Công thức**:
```
similarity(A,B) = (A · B) / (||A|| × ||B||)

= Σ(A_i × B_i) / (√Σ(A_i²) × √Σ(B_i²))
```

**Giá trị**: 0 (không giống) đến 1 (giống hoàn toàn)

**Ưu điểm**: Phản hồi trực tiếp với từ khóa

**Nhược điểm**: Không khám phá món mới

---

## 3. Context-Aware Recommendation (Nhận Biết Ngữ Cảnh)

### Frequency Analysis

**Công thức**:
```
score(item) = α × count(item_name) + β × count(category)

Normalized_score = score / max(scores)
```

Trong đó:
- `α = 2.0`: Trọng số tên món
- `β = 0.5`: Trọng số danh mục
- `count()`: Số lần xuất hiện trong chat history

**Time Window**: 24 giờ gần nhất

**Ưu điểm**: Hiểu ngữ cảnh hội thoại

**Nhược điểm**: Cần user tương tác với chatbot

---

## 4. Rating-Based Filtering (Lọc Dựa Đánh Giá)

### Bayesian Average

**Công thức**:
```
Bayesian_avg = (C × m + R × v) / (C + R)
```

Trong đó:
- `C = 5`: Confidence (số đánh giá tối thiểu)
- `m = 3.0`: Prior mean (giá trị trung bình giả định)
- `R`: Số đánh giá thực tế
- `v`: Rating trung bình thực tế

**Normalize**:
```
score = Bayesian_avg / 5.0
```

**Ưu điểm**: Tránh bias với món ít đánh giá

**Nhược điểm**: Thiên về món phổ biến

---

## 5. Hybrid Recommendation (Gợi Ý Lai Ghép)

### Weighted Linear Combination

**Công thức tổng hợp**:
```
Score_final(item) = w₁×S_collab + w₂×S_content + w₃×S_chatbot + w₄×S_rating
```

Trong đó:
- `w₁ = 0.30`: Trọng số Collaborative
- `w₂ = 0.25`: Trọng số Content-based
- `w₃ = 0.25`: Trọng số Context-aware
- `w₄ = 0.20`: Trọng số Rating-based
- `Σw_i = 1.0`: Tổng trọng số = 1

**Điều kiện**: Tất cả scores được normalize về [0, 1]

**Normalize Collaborative Score**:
```
S_collab_norm = (S_collab - min) / (max - min)
```

**Ưu điểm**: Kết hợp ưu điểm của nhiều phương pháp

**Nhược điểm**: Cần điều chỉnh trọng số phù hợp

---

## 6. Apriori Algorithm (Quy Tắc Kết Hợp)

### Support

**Công thức**:
```
support(X) = count(X) / N
```

Trong đó:
- `count(X)`: Số đơn hàng chứa itemset X
- `N`: Tổng số đơn hàng

### Confidence

**Công thức**:
```
confidence(X → Y) = support(X ∪ Y) / support(X)
```

### Lift

**Công thức**:
```
lift(X → Y) = support(X ∪ Y) / (support(X) × support(Y))
```

**Giải thích**:
- `lift > 1`: X và Y có liên quan dương
- `lift = 1`: X và Y độc lập
- `lift < 1`: X và Y có liên quan âm

**Ưu điểm**: Tìm món kèm phù hợp

**Nhược điểm**: Cần nhiều dữ liệu giao dịch

---

## 7. Evaluation Metrics (Đánh Giá Hiệu Quả)

### Click-Through Rate (CTR)

**Công thức**:
```
CTR = (Số clicks vào gợi ý / Số lần hiển thị) × 100%
```

**Mục tiêu**: > 15%

### Conversion Rate

**Công thức**:
```
Conversion = (Số items được thêm vào giỏ / Số items được gợi ý) × 100%
```

**Mục tiêu**: > 8%

### Precision@K

**Công thức**:
```
Precision@K = (Số items liên quan trong top K) / K
```

### Recall@K

**Công thức**:
```
Recall@K = (Số items liên quan trong top K) / (Tổng số items liên quan)
```

### F1-Score

**Công thức**:
```
F1 = 2 × (Precision × Recall) / (Precision + Recall)
```

---

## 8. Complexity Analysis (Phân Tích Độ Phức Tạp)

### Time Complexity

| Phương pháp | Training | Inference |
|-------------|----------|-----------|
| SVD | O(m×n×k) | O(k) |
| TF-IDF | O(d×v) | O(v) |
| Context-aware | - | O(h×i) |
| Rating-based | - | O(i) |
| Hybrid | - | O(k+v+h+i) |

Trong đó:
- `m`: Số users
- `n`: Số items
- `k`: Số latent factors
- `d`: Số documents
- `v`: Vocabulary size
- `h`: Chat history size
- `i`: Số items cần tính

### Space Complexity

| Phương pháp | Space |
|-------------|-------|
| SVD | O(m×k + n×k) |
| TF-IDF | O(d×v) |
| Context-aware | O(h) |
| Rating-based | O(i) |

---

## Tài Liệu Tham Khảo

1. **SVD**: Koren, Y. (2009). "Matrix Factorization Techniques for Recommender Systems"
2. **TF-IDF**: Salton, G. (1988). "Term-Weighting Approaches in Automatic Text Retrieval"
3. **Cosine Similarity**: Manning, C. D. (2008). "Introduction to Information Retrieval"
4. **Bayesian Average**: Wilson, E. B. (1927). "Probable Inference, the Law of Succession"
5. **Apriori**: Agrawal, R. (1994). "Fast Algorithms for Mining Association Rules"
6. **Hybrid Systems**: Burke, R. (2002). "Hybrid Recommender Systems"
