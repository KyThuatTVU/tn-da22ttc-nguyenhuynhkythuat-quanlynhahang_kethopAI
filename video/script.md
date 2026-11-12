# Kịch bản bài giảng — Gợi ý món ăn cá nhân hóa

**Dự án:** Ẩm Thực Phương Nam · **Thời lượng:** 5:03 (303,2 s) · **Giọng đọc:** Microsoft Edge TTS `vi-VN-NamMinhNeural`, tốc độ −12%

| # | Thời gian | Cảnh | Nội dung chính |
|---|---|---|---|
| 01 | 00:00.000 – 00:13.000 | s01 · hook | Hook: một thực đơn cho mọi khách |
| 02 | 00:13.000 – 00:26.000 | s02 · goals | Ba mục tiêu bài giảng |
| 03 | 00:26.000 – 00:48.000 | s03 · data | Hành vi thành ma trận thưa |
| 04 | 00:48.000 – 01:10.000 | s04 · signals | Bốn tín hiệu đầu vào |
| 05 | 01:10.000 – 01:32.000 | s05 · weights | Chuẩn hóa và trọng số 30/25/25/20 |
| 06 | 01:32.000 – 01:54.000 | s06 · svd | SVD: phân rã ma trận |
| 07 | 01:54.000 – 02:16.000 | s07 · apriori | Apriori: support, confidence, lift |
| 08 | 02:16.000 – 02:38.000 | s08 · cart | Gợi ý kèm trong giỏ hàng |
| 09 | 02:38.000 – 03:00.000 | s09 · fusion | Ghép điểm và xếp hạng |
| 10 | 03:00.000 – 03:22.000 | s10 · coldstart | Cold start và fallback |
| 11 | 03:22.000 – 03:44.000 | s11 · eval | Đánh giá mô hình |
| 12 | 03:44.000 – 04:12.000 | s12 · summary | Tóm tắt ba điểm |
| 13 | 04:12.000 – 04:24.000 | s13 · quiz | Quiz 1: trọng số lớn nhất |
| 14 | 04:24.000 – 04:38.560 | s14 · quiz | Quiz 2: 75% là confidence |
| 15 | 04:38.560 – 04:51.200 | s15 · quiz | Quiz 3: cold start |
| 16 | 04:51.200 – 05:03.200 | s16 · outro | Outro khép hook |

## Cảnh 01 — Hook: một thực đơn cho mọi khách

`00:00:00.000 → 00:00:13.000` · 13.00 s

**Lời đọc**

- `00:00:00.180 – 00:00:03.299` — Buổi tối cuối tuần, nhà hàng đón hàng trăm lượt khách.
- `00:00:04.109 – 00:00:07.650` — Nhưng ai bước vào cũng thấy đúng một thực đơn, giống hệt nhau.
- `00:00:08.460 – 00:00:11.259` — Vậy làm sao để mỗi người thấy đúng món mình muốn?

**Chữ trên màn hình:** 100 KHÁCH · 1 THỰC ĐƠN · ?

## Cảnh 02 — Ba mục tiêu bài giảng

`00:00:13.000 → 00:00:26.000` · 13.00 s

**Lời đọc**

- `00:00:13.180 – 00:00:17.251` — Trong năm phút tới, bạn sẽ hiểu cách hệ thống biến hành vi thành gợi ý.
- `00:00:18.061 – 00:00:23.965` — Chúng ta đi qua bốn tín hiệu, hai thuật toán cốt lõi, và cách xử lý khi dữ liệu còn thiếu.

**Chữ trên màn hình:** 01 · PIPELINE 4 TÍN HIỆU · 02 · SVD & APRIORI · 03 · COLD START & ĐÁNH GIÁ

## Cảnh 03 — Hành vi thành ma trận thưa

`00:00:26.000 → 00:00:48.000` · 22.00 s

**Lời đọc**

- `00:00:26.180 – 00:00:28.473` — Mỗi đơn hàng hoàn tất là một tín hiệu.
- `00:00:29.283 – 00:00:33.411` — Hệ thống ghi lại ai đã mua món nào, và món đó được chấm mấy sao.
- `00:00:34.221 – 00:00:38.541` — Dữ liệu này xếp thành một ma trận, hàng là khách, cột là món ăn.
- `00:00:39.351 – 00:00:43.611` — Phần lớn các ô còn trống, vì mỗi khách chỉ thử một phần nhỏ thực đơn.

**Chữ trên màn hình:** KHÁCH × MÓN · 65% Ô TRỐNG · MUA = 3 ĐIỂM

## Cảnh 04 — Bốn tín hiệu đầu vào

`00:00:48.000 → 00:01:10.000` · 22.00 s

**Lời đọc**

- `00:00:48.180 – 00:00:51.280` — Từ ma trận đó, hệ thống tính bốn điểm riêng biệt.
- `00:00:52.010 – 00:00:55.898` — Thứ nhất là lọc cộng tác, dựa trên những khách có khẩu vị giống nhau.
- `00:00:56.628 – 00:01:00.905` — Thứ hai là độ khớp nội dung, so từ khóa với tên và mô tả món.
- `00:01:01.635 – 00:01:04.952` — Thứ ba là ngữ cảnh chatbot trong hai mươi bốn giờ gần nhất.
- `00:01:05.682 – 00:01:08.877` — Thứ tư là chất lượng món, tính từ điểm sao của khách.

**Chữ trên màn hình:** SVD · LỌC CỘNG TÁC · TF-IDF · NỘI DUNG · CHATBOT · 24 GIỜ · RATING · BAYESIAN

## Cảnh 05 — Chuẩn hóa và trọng số 30/25/25/20

`00:01:10.000 → 00:01:32.000` · 22.00 s

**Lời đọc**

- `00:01:10.180 – 00:01:14.685` — Bốn điểm này có thang đo khác nhau, nên phải chuẩn hóa về khoảng không đến một.
- `00:01:15.386 – 00:01:18.525` — Sau đó, mỗi điểm được nhân với trọng số của nó.
- `00:01:19.226 – 00:01:22.972` — Lọc cộng tác chiếm ba mươi phần trăm, nội dung hai mươi lăm.
- `00:01:23.673 – 00:01:27.233` — Chatbot hai mươi lăm, và đánh giá sao hai mươi phần trăm.
- `00:01:27.934 – 00:01:30.922` — Tổng lại, ta được một điểm duy nhất cho từng món.

**Chữ trên màn hình:** MIN-MAX → [0, 1] · 30% · 25% · 25% · 20%

## Cảnh 06 — SVD: phân rã ma trận

`00:01:32.000 → 00:01:54.000` · 22.00 s

**Lời đọc**

- `00:01:32.180 – 00:01:36.828` — Thuật toán đầu tiên là SVD, viết đầy đủ là phân rã giá trị suy biến.
- `00:01:37.638 – 00:01:40.492` — Nó tách ma trận thưa thành hai ma trận nhỏ hơn.
- `00:01:41.302 – 00:01:45.397` — Mỗi khách và mỗi món được mô tả bằng tối đa hai mươi đặc trưng ẩn.
- `00:01:46.207 – 00:01:50.767` — Nhân hai ma trận này lại, hệ thống dự đoán số sao cho những món chưa thử.

**Chữ trên màn hình:** SVD · SINGULAR VALUE DECOMPOSITION · k ≤ 20 · 4×5 → 4×k · k×5

## Cảnh 07 — Apriori: support, confidence, lift

`00:01:54.000 → 00:02:16.000` · 22.00 s

**Lời đọc**

- `00:01:54.180 – 00:01:58.292` — Thuật toán thứ hai là Apriori, tìm luật kết hợp giữa các món.
- `00:01:59.102 – 00:02:03.165` — Giả sử trong một trăm đơn gần nhất, gà nướng xuất hiện mười hai lần.
- `00:02:03.975 – 00:02:08.767` — Chín trong số đó có thêm cơm trắng, nên confidence là bảy mươi lăm phần trăm.
- `00:02:09.577 – 00:02:14.541` — Lift bằng hai phẩy năm, nghĩa là mua gà thì khả năng mua cơm cao gấp hai phẩy năm lần.

**Chữ trên màn hình:** SUPPORT({GÀ}) 12% · CONFIDENCE 75% · LIFT 2.5 · NGƯỠNG: 1.5% · 30%

## Cảnh 08 — Gợi ý kèm trong giỏ hàng

`00:02:16.000 → 00:02:38.000` · 22.00 s

**Lời đọc**

- `00:02:16.180 – 00:02:20.452` — Khi khách bỏ món vào giỏ, hệ thống tra những luật liên quan đến món đó.
- `00:02:21.262 – 00:02:25.653` — Nó loại các món đã có trong giỏ, rồi cộng điểm lift nhân confidence.
- `00:02:26.463 – 00:02:30.219` — Bốn món có điểm cao nhất sẽ được gợi ý kèm ngay dưới giỏ hàng.
- `00:02:31.029 – 00:02:33.678` — Cách này bắt đúng thói quen gọi món theo nhóm.

**Chữ trên màn hình:** GIỎ HÀNG → LUẬT → TOP 4 · LIFT × CONFIDENCE = 1.875

## Cảnh 09 — Ghép điểm và xếp hạng

`00:02:38.000 → 00:03:00.000` · 22.00 s

**Lời đọc**

- `00:02:38.180 – 00:02:41.327` — Điểm cuối cùng là tổng có trọng số của bốn tín hiệu.
- `00:02:42.137 – 00:02:45.895` — Nhìn vào ví dụ này, món C đứng đầu với không phẩy sáu bảy.
- `00:02:46.705 – 00:02:51.532` — Điểm chatbot rất cao đã kéo món này lên, dù lọc cộng tác chỉ ở mức khá.
- `00:02:52.342 – 00:02:57.308` — Món B theo sau với không phẩy sáu bốn lăm, và món A đạt không phẩy năm một lăm.

**Chữ trên màn hình:** C 0.670 · B 0.645 · A 0.515

## Cảnh 10 — Cold start và fallback

`00:03:00.000 → 00:03:22.000` · 22.00 s

**Lời đọc**

- `00:03:00.180 – 00:03:04.367` — Vấn đề lớn nhất là cold start, khi khách hoàn toàn chưa có lịch sử.
- `00:03:05.177 – 00:03:10.258` — Lúc đó SVD không thể dự đoán, nên hệ thống chuyển sang danh sách món thịnh hành.
- `00:03:11.068 – 00:03:14.754` — Với món mới, hệ thống dựa vào khẩu vị khách đã chọn để lọc.
- `00:03:15.564 – 00:03:19.729` — Nếu vẫn thiếu tín hiệu, món đó nhận điểm không và tụt xuống cuối bảng.

**Chữ trên màn hình:** COLD START · CHƯA CÓ LỊCH SỬ → TRENDING · MÓN MỚI → NHÃN KHẨU VỊ · THIẾU TÍN HIỆU → 0

## Cảnh 11 — Đánh giá mô hình

`00:03:22.000 → 00:03:44.000` · 22.00 s

**Lời đọc**

- `00:03:22.180 – 00:03:27.417` — Để kiểm chứng, dữ liệu chia tám mươi phần trăm để học, hai mươi phần trăm để kiểm thử.
- `00:03:27.830 – 00:03:33.986` — SVD đạt RMSE 0,82, và precision@5 gần 68,5%.
- `00:03:34.399 – 00:03:38.572` — NCF chính xác hơn, nhưng phản hồi chậm hơn gần tám lần.
- `00:03:38.985 – 00:03:43.482` — Với nhà hàng, mười hai mili giây đủ nhanh để gợi ý ngay khi khách mở trang.

**Chữ trên màn hình:** 80/20 TRAIN–TEST · SVD · NCF · RMSE 0.82 / 0.79 · P@5 68.5% / 78.5% · 12ms / 95ms

## Cảnh 12 — Tóm tắt ba điểm

`00:03:44.000 → 00:04:12.000` · 28.00 s

**Lời đọc**

- `00:03:44.180 – 00:03:45.362` — Ba điều cần nhớ.
- `00:03:46.172 – 00:03:51.602` — Một, hành vi của khách tạo ra ma trận thưa, và phần trống chính là cơ hội để gợi ý.
- `00:03:52.412 – 00:03:57.547` — Hai, SVD dự đoán khẩu vị, còn Apriori bắt thói quen mua kèm.
- `00:03:58.357 – 00:04:03.301` — Ba, trọng số quyết định món nào lên đầu, nên cần chỉnh theo mục tiêu kinh doanh.
- `00:04:04.111 – 00:04:08.457` — Ghép lại, bốn tín hiệu và hai thuật toán cho ra một bảng xếp hạng duy nhất.

**Chữ trên màn hình:** MA TRẬN THƯA · SVD + APRIORI · TRỌNG SỐ

## Cảnh 13 — Quiz 1: trọng số lớn nhất

`00:04:12.000 → 00:04:24.000` · 12.00 s

**Lời đọc**

- `00:04:12.200 – 00:04:14.903` — Câu một: tín hiệu nào có trọng số lớn nhất?
- `00:04:19.203 – 00:04:23.383` — Đáp án A: lọc cộng tác SVD, ba mươi phần trăm.

**Chữ trên màn hình:** Câu hỏi quiz + 4 lựa chọn + vòng đếm ngược

**Quiz**

- Câu hỏi: Tín hiệu nào có trọng số lớn nhất?
  - A. Lọc cộng tác SVD — 30% ✅
  - B. Đánh giá sao — 20%
  - C. Ngữ cảnh chatbot — 25%
  - D. Độ khớp nội dung — 25%
- Giải thích: SVD chiếm 30%, cao nhất trong bốn tín hiệu.
- Đếm ngược: `00:04:15.053` → `00:04:19.053` · lộ đáp án `00:04:19.203`

## Cảnh 14 — Quiz 2: 75% là confidence

`00:04:24.000 → 00:04:38.560` · 14.56 s

**Lời đọc**

- `00:04:24.200 – 00:04:29.610` — Câu hai: bảy mươi lăm trên một trăm đơn có gà cũng có cơm. Đó là gì?
- `00:04:33.910 – 00:04:38.112` — Đáp án B: confidence, xác suất mua cơm khi đã mua gà.

**Chữ trên màn hình:** Câu hỏi quiz + 4 lựa chọn + vòng đếm ngược

**Quiz**

- Câu hỏi: 75% số đơn có gà nướng cũng có cơm trắng. Chỉ số này là gì?
  - A. Support
  - B. Confidence ✅
  - C. Lift
  - D. RMSE
- Giải thích: Confidence = P(cơm | gà) = 9/12 = 75%.
- Đếm ngược: `00:04:29.760` → `00:04:33.760` · lộ đáp án `00:04:33.910`

## Cảnh 15 — Quiz 3: cold start

`00:04:38.560 → 00:04:51.200` · 12.64 s

**Lời đọc**

- `00:04:38.760 – 00:04:42.581` — Câu ba: khách mới hoàn toàn chưa có lịch sử thì hệ thống làm gì?
- `00:04:46.881 – 00:04:50.759` — Đáp án A: dùng danh sách món thịnh hành thay cho SVD.

**Chữ trên màn hình:** Câu hỏi quiz + 4 lựa chọn + vòng đếm ngược

**Quiz**

- Câu hỏi: Khách mới hoàn toàn chưa có lịch sử đặt món, hệ thống xử lý thế nào?
  - A. Dùng danh sách món thịnh hành ✅
  - B. Vẫn dùng SVD như bình thường
  - C. Chặn khách đặt món
  - D. Xóa lịch sử giỏ hàng
- Giải thích: Khách mới → fallback trending; món mới → lọc theo nhãn khẩu vị.
- Đếm ngược: `00:04:42.731` → `00:04:46.731` · lộ đáp án `00:04:46.881`

## Cảnh 16 — Outro khép hook

`00:04:51.200 → 00:05:03.200` · 12.00 s

**Lời đọc**

- `00:04:51.380 – 00:04:55.163` — Từ một thực đơn chung, mỗi khách giờ đây nhận một danh sách riêng.
- `00:04:55.973 – 00:05:02.226` — Không phải đoán mò, mà là bốn tín hiệu, hai thuật toán, và cách xử lý thiếu dữ liệu rõ ràng.

**Chữ trên màn hình:** MỖI KHÁCH · MỘT THỰC ĐƠN RIÊNG
