# Storyboard — Gợi ý món ăn cá nhân hóa (16 cảnh)

Khung hình 1920×1080 · 25 fps · nền navy #050B18, cyan #38E1FF, trắng #F2F8FF, amber #FFB347.
Vùng nội dung an toàn: y ≤ 930 px; phụ đề nằm trong hộp 965–1070 px.

## 01 · Hook: 100 khách – 1 thực đơn

**00:00.000 – 00:13.000** · 13.00 s · `s01`

- Lưới 6 thẻ món giống hệt nhau hiện dần từng thẻ (0,3–5,9 s).
- Số 100 đếm tăng ở góc trái dưới; số 1 và nhãn 'THỰC ĐƠN CHUNG' hiện sau.
- Các thẻ món mờ dần và một dấu hỏi cyan lớn nổi lên giữa lưới (8,4–9,4 s).
- Kết câu hỏi: toàn bộ lưới tối đi, chỉ còn dấu hỏi sáng.
- Chuyển động: Đếm số 100 (count-up), pop-in thẻ, glow dấu hỏi.

## 02 · Mục tiêu sau 5 phút

**00:13.000 – 00:26.000** · 13.00 s · `s02`

- Ba dòng mục tiêu trượt vào từ trái, mỗi dòng có số thứ tự amber.
- Đường gạch chân cyan chạy từ trái sang phải theo từng mục.
- Dòng phụ (chuẩn hóa · trọng số · fusion) hiện sau khi gạch chân chạm mép phải.
- Chuyển động: Progressive reveal + line highlight.

## 03 · Hành vi → ma trận thưa

**00:26.000 – 00:48.000** · 22.00 s · `s03`

- Ma trận 4×5 hiện lưới ô nét đứt trước, rồi các ô có dữ liệu (5, 4, 3) sáng dần.
- Nhãn hàng K1–K4 và cột M1–M5 hiện kèm.
- Số 65% đếm tăng ở cột phải, kèm dòng '7 / 20 ô có dữ liệu'.
- Hai chip quy ước: 'MUA → 3 ĐIỂM', 'CÓ ĐÁNH GIÁ → SỐ SAO'.
- Chuyển động: Cell fill theo nhịp, count-up 65%, chip pop.

## 04 · Bốn tín hiệu đầu vào

**00:48.000 – 01:10.000** · 22.00 s · `s04`

- Bốn thẻ SVD / TF-IDF / CHATBOT / RATING lần lượt pop-in.
- Mỗi thẻ có icon line-art cyan/amber và hai dòng mô tả ngắn.
- Bốn đường cong cyan chạy từ đáy thẻ hội tụ về nút 'ĐIỂM TỔNG HỢP'.
- Nút tổng hợp sáng lên khi đường cuối chạm.
- Chuyển động: Path draw (stroke-dashoffset), icon fade, node glow.

## 05 · Chuẩn hóa & trọng số

**01:10.000 – 01:32.000** · 22.00 s · `s05`

- Thang 0–1 hiện trước, kèm nhãn 'MIN-MAX → [0, 1]'.
- Thanh xếp chồng 30/25/25/20 lớn dần từng đoạn, nhãn phần trăm nằm trong đoạn.
- Bốn chip công thức '0.30 · SVD', '0.25 · TF-IDF', '0.25 · CHAT', '0.20 · RATING' hiện lần lượt.
- Chip cảnh báo 'THIẾU TÍN HIỆU → 0' xuất hiện cuối.
- Chuyển động: Segment grow (scaleX), chip pop, count-up nhẹ.

## 06 · SVD — phân rã ma trận

**01:32.000 – 01:54.000** · 22.00 s · `s06`

- Ma trận 4×5 bên trái; dấu '=' rồi U (4×k) và V (k×5) hiện theo nhịp.
- Nhãn kích thước 4×5, 4×k, k×5 và chú thích 'k = 2 · minh họa'.
- Chip 'k ≤ 20' pop-in, kèm dòng 'U × V → dự đoán số sao'.
- Ô dự đoán 4.4 sáng lên trong ma trận gốc, nhãn 'DỰ ĐOÁN' hiện dưới.
- Chuyển động: Matrix build, pop ô dự đoán, glow cyan.

## 07 · Apriori — support / confidence / lift

**01:54.000 – 02:16.000** · 22.00 s · `s07`

- Lưới 100 điểm (10×10) hiện dần; 12 điểm gà cyan, 9 điểm giao có vành amber, 21 điểm cơm vàng nhạt.
- Ba thẻ số bên phải đếm tăng: 12% → 75% → 2.5×.
- Thẻ ngưỡng cấu hình: min_support 1.5%, min_confidence 30%, lift > 1.
- Công thức lift = P(B|A)/P(B) = 0.75/0.30 = 2.5 hiện cuối.
- Chuyển động: Dot stagger, count-up, công thức fade.

## 08 · Giỏ hàng → luật → top 4

**02:16.000 – 02:38.000** · 22.00 s · `s08`

- Thẻ giỏ hàng với chip GÀ NƯỚNG, RAU XÀO.
- Mũi tên vẽ sang thẻ luật 'GÀ NƯỚNG → CƠM TRẮNG', lift 2.5 × conf 0.75 = 1.875.
- Mũi tên thứ hai sang bảng gợi ý top 4: CƠM TRẮNG 1.875, CANH CHUA 1.32, DƯA LEO 0.98, RAU XÀO (đã có).
- Bảng gợi ý sáng viền khi hoàn tất.
- Chuyển động: Arrow draw, bar grow, row stagger, card glow.

## 09 · Ghép điểm & xếp hạng

**02:38.000 – 03:00.000** · 22.00 s · `s09`

- Ba hàng xếp hạng C / B / A với thanh 4 đoạn màu theo tín hiệu.
- Mỗi đoạn lớn dần theo đúng tỉ lệ đóng góp; tổng số đếm lên 0.670 / 0.645 / 0.515.
- Hàng #1 sáng viền cyan và giữ glow.
- Legend 4 màu ở góc phải trên.
- Chuyển động: Segment grow, count-up, glow hàng dẫn đầu.

## 10 · Cold start & fallback

**03:00.000 – 03:22.000** · 22.00 s · `s10`

- Ba hàng điều kiện → kết quả, mỗi hàng hiện theo nhịp.
- Mũi tên nối vẽ dần; hàng 3 (thiếu tín hiệu) bị làm mờ.
- Chip 'SVD KHÔNG DỰ ĐOÁN ĐƯỢC' ở góc phải.
- Dòng chân 'fallback giữ trải nghiệm liền mạch khi thiếu dữ liệu' hiện cuối.
- Chuyển động: Row pop, arrow draw, dim nhánh thất bại.

## 11 · Đánh giá SVD vs NCF

**03:22.000 – 03:44.000** · 22.00 s · `s11`

- Bảng 2 cột SVD/NCF với 4 chỉ số: RMSE, Precision@5, Latency, Train time.
- Số liệu hiện theo hàng; chip 'NHANH HƠN 7.9×' dưới latency SVD.
- Chip '80/20 TRAIN – TEST' ở góc phải trên.
- Footnote nguồn 'evaluate_models.py — bảng đối chứng của đồ án' hiện cuối.
- Chuyển động: Row stagger, chip pop, footnote fade.

## 12 · Tóm tắt ba điều

**03:44.000 – 04:12.000** · 28.00 s · `s12`

- Ba thẻ recap 01/02/03 trượt vào, mỗi thẻ có gạch đầu cyan.
- Banner tổng hợp '4 TÍN HIỆU + 2 THUẬT TOÁN → 1 BẢNG XẾP HẠNG'.
- Dòng công thức trọng số 0.30·SVD + 0.25·TF-IDF + 0.25·CHAT + 0.20·RATING.
- Chuyển động: Card slide, banner pop, formula fade.

## 13 · Quiz 1 — trọng số lớn nhất

**04:12.000 – 04:24.000** · 12.00 s · `s13`

- Câu hỏi + 4 lựa chọn A–D hiện ngay.
- Vòng đếm ngược 4 giây ở góc phải (số 3 → 2 → 1).
- Hết giờ: đáp án A sáng cyan, các lựa chọn khác mờ đi, dòng giải thích hiện.
- Chuyển động: Countdown ring, correct highlight, dim distractors.
- Nhịp quiz: đếm ngược `00:04:15.053` → `00:04:19.053`, lộ đáp án `00:04:19.203`.

## 14 · Quiz 2 — 75% là confidence

**04:24.000 – 04:38.560** · 14.56 s · `s14`

- Câu hỏi + 4 lựa chọn Support / Confidence / Lift / RMSE.
- Đếm ngược 4 giây; hết giờ đáp án B sáng, dòng 'Confidence = P(cơm | gà) = 9/12 = 75%'.
- Chuyển động: Countdown ring, correct highlight.
- Nhịp quiz: đếm ngược `00:04:29.760` → `00:04:33.760`, lộ đáp án `00:04:33.910`.

## 15 · Quiz 3 — cold start

**04:38.560 – 04:51.200** · 12.64 s · `s15`

- Câu hỏi hai dòng + 4 lựa chọn.
- Đếm ngược 4 giây; đáp án A sáng, dòng giải thích fallback trending.
- Chuyển động: Countdown ring, correct highlight.
- Nhịp quiz: đếm ngược `00:04:42.731` → `00:04:46.731`, lộ đáp án `00:04:46.881`.

## 16 · Outro khép hook

**04:51.200 – 05:03.200** · 12.00 s · `s16`

- Headline 'TỪ MỘT THỰC ĐƠN CHUNG / MỖI KHÁCH / MỘT THỰC ĐƠN RIÊNG' hiện theo cụm.
- Sáu thẻ khẩu vị (CAY, CHAY, HẢI SẢN, MÓN MỚI, GIA ĐÌNH, NHANH) pop-in.
- Credit 'ẨM THỰC PHƯƠNG NAM · KLTN 2026 · NGUYỄN HUỲNH KỸ THUẬT · ĐH TRÀ VINH'.
- Chuyển động: Kinetic type, card pop, credit fade.
