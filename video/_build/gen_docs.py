import json, os

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(ROOT)
tl = json.load(open(os.path.join(ROOT, "timeline.json"), encoding="utf-8"))
script = json.load(open(os.path.join(ROOT, "script.json"), encoding="utf-8"))
byid = {s["id"]: s for s in script["scenes"]}


def ts(x, comma=False):
    ms = int(round(x * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    sep = "," if comma else "."
    return f"{h:02d}:{m:02d}:{s:02d}{sep}{ms:03d}"


DISPLAY = {
    "SVD đạt RMSE không phẩy tám hai, và precision at five gần sáu mươi chín phần trăm.":
        "SVD đạt RMSE 0,82, và precision@5 gần 68,5%.",
}

cue_i = 0
rows = []
for e in tl["scenes"]:
    s = byid[e["id"]]
    narr = s["narration"]
    mine = [dict(c, display=DISPLAY.get(c['text'], c['text'])) for c in tl["cues"][cue_i:cue_i + len(narr)]]
    cue_i += len(narr)
    rows.append((e, s, mine))

# ---------------- script.md ----------------
L = []
L.append("# Kịch bản bài giảng — Gợi ý món ăn cá nhân hóa")
L.append("")
L.append("**Dự án:** Ẩm Thực Phương Nam · **Thời lượng:** 5:03 (303,2 s) · **Giọng đọc:** Microsoft Edge TTS `vi-VN-NamMinhNeural`, tốc độ −12%")
L.append("")
L.append("| # | Thời gian | Cảnh | Nội dung chính |")
L.append("|---|---|---|---|")
for e, s, _ in rows:
    L.append(f"| {e['num']:02d} | {ts(e['start'])[3:]} – {ts(e['start']+e['dur'])[3:]} | {e['id']} · {s['kind']} | {s['topic']} |")
L.append("")
for e, s, mine in rows:
    L.append(f"## Cảnh {e['num']:02d} — {s['topic']}")
    L.append("")
    L.append(f"`{ts(e['start'])} → {ts(e['start']+e['dur'])}` · {e['dur']:.2f} s")
    L.append("")
    L.append("**Lời đọc**")
    L.append("")
    for c in mine:
        L.append(f"- `{ts(c['start'])} – {ts(c['end'])}` — {c['display']}")
    L.append("")
    L.append("**Chữ trên màn hình:** " + (" · ".join(s["onscreen"]) if s.get("onscreen") else "Câu hỏi quiz + 4 lựa chọn + vòng đếm ngược"))
    L.append("")
    if s.get("quiz"):
        q = s["quiz"]
        L.append("**Quiz**")
        L.append("")
        L.append(f"- Câu hỏi: {q['q']}")
        for i, o in enumerate(q["options"]):
            mark = " ✅" if i == q["answer"] else ""
            L.append(f"  - {'ABCD'[i]}. {o}{mark}")
        L.append(f"- Giải thích: {q['explain']}")
        L.append(f"- Đếm ngược: `{ts(e['countdown'][0])}` → `{ts(e['countdown'][1])}` · lộ đáp án `{ts(e['reveal'])}`")
        L.append("")

open(os.path.join(OUT, "script.md"), "w", encoding="utf-8").write("\n".join(L))

# ---------------- storyboard.md ----------------
VIS = {
 "s01": ("Hook: 100 khách – 1 thực đơn", [
   "Lưới 6 thẻ món giống hệt nhau hiện dần từng thẻ (0,3–5,9 s).",
   "Số 100 đếm tăng ở góc trái dưới; số 1 và nhãn 'THỰC ĐƠN CHUNG' hiện sau.",
   "Các thẻ món mờ dần và một dấu hỏi cyan lớn nổi lên giữa lưới (8,4–9,4 s).",
   "Kết câu hỏi: toàn bộ lưới tối đi, chỉ còn dấu hỏi sáng."],
   "Đếm số 100 (count-up), pop-in thẻ, glow dấu hỏi."),
 "s02": ("Mục tiêu sau 5 phút", [
   "Ba dòng mục tiêu trượt vào từ trái, mỗi dòng có số thứ tự amber.",
   "Đường gạch chân cyan chạy từ trái sang phải theo từng mục.",
   "Dòng phụ (chuẩn hóa · trọng số · fusion) hiện sau khi gạch chân chạm mép phải."],
   "Progressive reveal + line highlight."),
 "s03": ("Hành vi → ma trận thưa", [
   "Ma trận 4×5 hiện lưới ô nét đứt trước, rồi các ô có dữ liệu (5, 4, 3) sáng dần.",
   "Nhãn hàng K1–K4 và cột M1–M5 hiện kèm.",
   "Số 65% đếm tăng ở cột phải, kèm dòng '7 / 20 ô có dữ liệu'.",
   "Hai chip quy ước: 'MUA → 3 ĐIỂM', 'CÓ ĐÁNH GIÁ → SỐ SAO'."],
   "Cell fill theo nhịp, count-up 65%, chip pop."),
 "s04": ("Bốn tín hiệu đầu vào", [
   "Bốn thẻ SVD / TF-IDF / CHATBOT / RATING lần lượt pop-in.",
   "Mỗi thẻ có icon line-art cyan/amber và hai dòng mô tả ngắn.",
   "Bốn đường cong cyan chạy từ đáy thẻ hội tụ về nút 'ĐIỂM TỔNG HỢP'.",
   "Nút tổng hợp sáng lên khi đường cuối chạm."],
   "Path draw (stroke-dashoffset), icon fade, node glow."),
 "s05": ("Chuẩn hóa & trọng số", [
   "Thang 0–1 hiện trước, kèm nhãn 'MIN-MAX → [0, 1]'.",
   "Thanh xếp chồng 30/25/25/20 lớn dần từng đoạn, nhãn phần trăm nằm trong đoạn.",
   "Bốn chip công thức '0.30 · SVD', '0.25 · TF-IDF', '0.25 · CHAT', '0.20 · RATING' hiện lần lượt.",
   "Chip cảnh báo 'THIẾU TÍN HIỆU → 0' xuất hiện cuối."],
   "Segment grow (scaleX), chip pop, count-up nhẹ."),
 "s06": ("SVD — phân rã ma trận", [
   "Ma trận 4×5 bên trái; dấu '=' rồi U (4×k) và V (k×5) hiện theo nhịp.",
   "Nhãn kích thước 4×5, 4×k, k×5 và chú thích 'k = 2 · minh họa'.",
   "Chip 'k ≤ 20' pop-in, kèm dòng 'U × V → dự đoán số sao'.",
   "Ô dự đoán 4.4 sáng lên trong ma trận gốc, nhãn 'DỰ ĐOÁN' hiện dưới."],
   "Matrix build, pop ô dự đoán, glow cyan."),
 "s07": ("Apriori — support / confidence / lift", [
   "Lưới 100 điểm (10×10) hiện dần; 12 điểm gà cyan, 9 điểm giao có vành amber, 21 điểm cơm vàng nhạt.",
   "Ba thẻ số bên phải đếm tăng: 12% → 75% → 2.5×.",
   "Thẻ ngưỡng cấu hình: min_support 1.5%, min_confidence 30%, lift > 1.",
   "Công thức lift = P(B|A)/P(B) = 0.75/0.30 = 2.5 hiện cuối."],
   "Dot stagger, count-up, công thức fade."),
 "s08": ("Giỏ hàng → luật → top 4", [
   "Thẻ giỏ hàng với chip GÀ NƯỚNG, RAU XÀO.",
   "Mũi tên vẽ sang thẻ luật 'GÀ NƯỚNG → CƠM TRẮNG', lift 2.5 × conf 0.75 = 1.875.",
   "Mũi tên thứ hai sang bảng gợi ý top 4: CƠM TRẮNG 1.875, CANH CHUA 1.32, DƯA LEO 0.98, RAU XÀO (đã có).",
   "Bảng gợi ý sáng viền khi hoàn tất."],
   "Arrow draw, bar grow, row stagger, card glow."),
 "s09": ("Ghép điểm & xếp hạng", [
   "Ba hàng xếp hạng C / B / A với thanh 4 đoạn màu theo tín hiệu.",
   "Mỗi đoạn lớn dần theo đúng tỉ lệ đóng góp; tổng số đếm lên 0.670 / 0.645 / 0.515.",
   "Hàng #1 sáng viền cyan và giữ glow.",
   "Legend 4 màu ở góc phải trên."],
   "Segment grow, count-up, glow hàng dẫn đầu."),
 "s10": ("Cold start & fallback", [
   "Ba hàng điều kiện → kết quả, mỗi hàng hiện theo nhịp.",
   "Mũi tên nối vẽ dần; hàng 3 (thiếu tín hiệu) bị làm mờ.",
   "Chip 'SVD KHÔNG DỰ ĐOÁN ĐƯỢC' ở góc phải.",
   "Dòng chân 'fallback giữ trải nghiệm liền mạch khi thiếu dữ liệu' hiện cuối."],
   "Row pop, arrow draw, dim nhánh thất bại."),
 "s11": ("Đánh giá SVD vs NCF", [
   "Bảng 2 cột SVD/NCF với 4 chỉ số: RMSE, Precision@5, Latency, Train time.",
   "Số liệu hiện theo hàng; chip 'NHANH HƠN 7.9×' dưới latency SVD.",
   "Chip '80/20 TRAIN – TEST' ở góc phải trên.",
   "Footnote nguồn 'evaluate_models.py — bảng đối chứng của đồ án' hiện cuối."],
   "Row stagger, chip pop, footnote fade."),
 "s12": ("Tóm tắt ba điều", [
   "Ba thẻ recap 01/02/03 trượt vào, mỗi thẻ có gạch đầu cyan.",
   "Banner tổng hợp '4 TÍN HIỆU + 2 THUẬT TOÁN → 1 BẢNG XẾP HẠNG'.",
   "Dòng công thức trọng số 0.30·SVD + 0.25·TF-IDF + 0.25·CHAT + 0.20·RATING."],
   "Card slide, banner pop, formula fade."),
 "s13": ("Quiz 1 — trọng số lớn nhất", [
   "Câu hỏi + 4 lựa chọn A–D hiện ngay.",
   "Vòng đếm ngược 4 giây ở góc phải (số 3 → 2 → 1).",
   "Hết giờ: đáp án A sáng cyan, các lựa chọn khác mờ đi, dòng giải thích hiện."],
   "Countdown ring, correct highlight, dim distractors."),
 "s14": ("Quiz 2 — 75% là confidence", [
   "Câu hỏi + 4 lựa chọn Support / Confidence / Lift / RMSE.",
   "Đếm ngược 4 giây; hết giờ đáp án B sáng, dòng 'Confidence = P(cơm | gà) = 9/12 = 75%'."],
   "Countdown ring, correct highlight."),
 "s15": ("Quiz 3 — cold start", [
   "Câu hỏi hai dòng + 4 lựa chọn.",
   "Đếm ngược 4 giây; đáp án A sáng, dòng giải thích fallback trending."],
   "Countdown ring, correct highlight."),
 "s16": ("Outro khép hook", [
   "Headline 'TỪ MỘT THỰC ĐƠN CHUNG / MỖI KHÁCH / MỘT THỰC ĐƠN RIÊNG' hiện theo cụm.",
   "Sáu thẻ khẩu vị (CAY, CHAY, HẢI SẢN, MÓN MỚI, GIA ĐÌNH, NHANH) pop-in.",
   "Credit 'ẨM THỰC PHƯƠNG NAM · KLTN 2026 · NGUYỄN HUỲNH KỸ THUẬT · ĐH TRÀ VINH'."],
   "Kinetic type, card pop, credit fade."),
}

B = []
B.append("# Storyboard — Gợi ý món ăn cá nhân hóa (16 cảnh)")
B.append("")
B.append("Khung hình 1920×1080 · 25 fps · nền navy #050B18, cyan #38E1FF, trắng #F2F8FF, amber #FFB347.")
B.append("Vùng nội dung an toàn: y ≤ 930 px; phụ đề nằm trong hộp 965–1070 px.")
B.append("")
for e, s, mine in rows:
    head, beats, motion = VIS[e["id"]]
    B.append(f"## {e['num']:02d} · {head}")
    B.append("")
    B.append(f"**{ts(e['start'])[3:]} – {ts(e['start']+e['dur'])[3:]}** · {e['dur']:.2f} s · `{e['id']}`")
    B.append("")
    for b in beats:
        B.append(f"- {b}")
    B.append(f"- Chuyển động: {motion}")
    if s.get("quiz"):
        B.append(f"- Nhịp quiz: đếm ngược `{ts(e['countdown'][0])}` → `{ts(e['countdown'][1])}`, lộ đáp án `{ts(e['reveal'])}`.")
    B.append("")
open(os.path.join(OUT, "storyboard.md"), "w", encoding="utf-8").write("\n".join(B))

# ---------------- glossary.md ----------------
G = """# Thuật ngữ & cách đọc

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
| Confidence | P(B\\|A) — xác suất mua B khi đã mua A | ngưỡng 30% | "confidence" |
| Lift | P(B\\|A) / P(B) — mức tăng khả năng so với ngẫu nhiên | ưu tiên lift > 1 | "lift" |
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
"""
open(os.path.join(OUT, "glossary.md"), "w", encoding="utf-8").write(G)

print("wrote script.md, storyboard.md, glossary.md")
print("cues consumed:", cue_i, "/", len(tl["cues"]))
