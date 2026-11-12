# Thuật ngữ & cách đọc

| Thuật ngữ | Viết đầy đủ / nghĩa | Trong dự án | Cách đọc |
|---|---|---|---|
| Hybrid Recommendation | Hệ gợi ý lai ghép nhiều nguồn tín hiệu | `hybrid_recommendation.py` | "hệ gợi ý lai" |
| Collaborative Filtering | Lọc cộng tác: dựa trên hành vi của những người dùng giống nhau | Trọng số 0.30 | "lọc cộng tác" |
| SVD | Singular Value Decomposition — phân rã giá trị suy biến | `model.py`, `TruncatedSVD`, k ≤ 20 | "S-V-D" |
| Truncated SVD | SVD rút gọn, chỉ giữ k thành phần lớn nhất | k = min(20, số món − 1) | "S-V-D rút gọn" |
| Content-based | Lọc theo nội dung: so từ khóa với tên/mô tả món | TF-IDF, trọng số 0.25 | "lọc theo nội dung" |
| TF-IDF | Term Frequency – Inverse Document Frequency | `hybrid_recommendation.py` | "T-F I-D-F" |
| Bayesian Rating | Điểm đánh giá hiệu chỉnh theo độ tin cậy | C = 5, m = 3.0, trọng số 0.20 | "điểm Bayesian" |
| Chatbot context | Ngữ cảnh hội thoại 24 giờ, tối đa 50 tin nhắn | trọng số 0.25 | "ngữ cảnh chatbot" |
| Min-max normalization | Chuẩn hóa mỗi tín hiệu về khoảng [0, 1] | trước khi ghép điểm | "chuẩn hóa min-max" |
| Apriori | Thuật toán khai phá luật kết hợp | `apriori_service.py` | "A-pri-ô-ri" |
| Support | Tỉ lệ đơn chứa một tập món | ngưỡng 1.5% | "support" |
| Confidence | P(B\|A) — xác suất mua B khi đã mua A | ngưỡng 30% | "confidence" |
| Lift | P(B\|A) / P(B) — mức tăng khả năng so với ngẫu nhiên | ưu tiên lift > 1 | "lift" |
| Association rule | Luật kết hợp dạng A → B | ví dụ GÀ NƯỚNG → CƠM TRẮNG | "luật kết hợp" |
| Cold start | Trạng thái thiếu dữ liệu cho người dùng/món mới | fallback trending | "cold start" |
| Trending fallback | Danh sách món thịnh hành thay thế khi SVD không dự đoán được | `get_svd_recommendations` trả rỗng → Node.js fallback | "fallback trending" |
| RMSE | Root Mean Squared Error — sai số bình phương trung bình | 0.82 (SVD) / 0.79 (NCF) | "R-M-S-E" |
| Precision@5 | Tỉ lệ món đúng trong 5 gợi ý đầu | 68.5% / 78.5% | "precision at five" |
| NCF | Neural Collaborative Filtering | mốc đối chứng | "N-C-F" |
| Latency | Độ trễ phản hồi | 12 ms / 95 ms | "độ trễ" |
| Train time | Thời gian huấn luyện | 0.45 s / 185 s | "thời gian huấn luyện" |

## Quy ước số liệu

- Trọng số: SVD 0.30 · TF-IDF 0.25 · Chatbot 0.25 · Rating 0.20.
- Apriori: 12/100 đơn có gà (support 12%); 9/12 đơn gà có cơm (confidence 75%); lift = 0.75/0.30 = 2.5; điểm gợi ý = 2.5 × 0.75 = 1.875.
- Fusion: C = 0.670, B = 0.645, A = 0.515.
- Đánh giá: bảng đối chứng trong `evaluate_models.py`; khi cơ sở dữ liệu trống, script dùng dữ liệu giả lập — video giữ nguyên bảng của đồ án và ghi nguồn trên màn hình.
