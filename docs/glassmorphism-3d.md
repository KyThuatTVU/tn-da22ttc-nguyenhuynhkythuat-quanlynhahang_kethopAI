# Glassmorphism 3D — Hướng dẫn áp dụng tái sử dụng

> Nguồn gốc: style của navbar trang chủ (xem `src/frontend/components/navbar.html`).
> Mục đích: tài liệu này mô tả đầy đủ kỹ thuật để có thể áp dụng cho mọi component khác
> (nav, card, nút, modal, sidebar...) với nhiều biến thể màu sắc và độ đậm nhạt.

---

## 1. Định nghĩa phong cách

**Glassmorphism 3D** = kính mờ (glassmorphism) + giả chiều sâu bằng ánh sáng (3D light simulation).

Đặc điểm nhận dạng:
- Nền **bán trong suốt**, nội dung phía sau bị **làm mờ** (blur) chứ không bị che kín.
- Cạnh trên của khối **sáng trắng**, cạnh dưới **đậm hơn** — mô phỏng ánh sáng chiếu từ trên xuống như một tấm kính thật.
- Bóng đổ nhiều lớp: bóng xa (nhẹ, lan rộng) + bóng gần (đậm, hẹp) tạo cảm giác khối "nổi".
- Khi tương tác: phần tử di chuyển trong không gian 3D (nghiêng / dựng thẳng / nâng lên).

---

## 2. Bộ khung 4 lớp (luôn dùng đủ để có hiệu ứng chuẩn)

| Lớp | Kỹ thuật | CSS chính | Vai trò |
|---|---|---|---|
| **1. Nền kính** | Gradient bán trong suốt + `backdrop-filter` | `background: linear-gradient(...)` + `backdrop-filter: blur() saturate()` | Tạo độ trong và mờ nền sau |
| **2. Ánh sáng** | Viền bất đối xứng + highlight inset | `border-top` sáng, `border-bottom` đậm, `inset 0 1px 0 rgba(255,255,255,.8)` | Mô phỏng cạnh kính bắt sáng |
| **3. Chiều sâu** | Box-shadow nhiều lớp | bóng đổ mềm + bóng ambient + inset highlight | Làm khối nổi lên khỏi nền |
| **4. Chuyển động 3D** | `perspective` + `rotateX` + `preserve-3d` | `transform: perspective(520px) rotateX(18deg)` | Hiệu ứng nghiêng/dựng thẳng khi hover |

---

## 3. Bảng tham số (điều chỉnh để tạo biến thể)

| Tham số | Giá trị hiện tại (navbar) | Tác dụng khi tăng | Tác dụng khi giảm |
|---|---|---|---|
| `blur()` | `18px` | Mờ mạnh, kính dày hơn | Rõ nền sau hơn, kính mỏng |
| Độ đục nền (alpha gradient) | `0.55 – 0.6` | Đặc hơn, chữ dễ đọc hơn | Trong hơn, "bay" hơn |
| `saturate()` | `150%` | Màu phía sau rực hơn | Màu nhạt đi |
| `border-bottom` (viền cam) | `rgba(217,119,6,0.18)` | Cạnh rõ nét hơn | Cạnh mờ, mềm hơn |
| `rotateX` | `18deg` | Hiệu ứng 3D gắt hơn | Gần như phẳng |
| `perspective` | `520px` | Góc nhìn xa → biến dạng nhẹ | Góc nhìn gần → biến dạng mạnh |
| Bóng xa `0 16px 34px` | `rgba(120,53,15,0.08)` | Khối nổi cao hơn | Phẳng hơn |
| `blur()` viên thuốc (pill) | `8px` | Pill mờ đục hơn | Pill trong hơn |

---

## 4. Công thức CSS sẵn (copy — chỉnh biến là xong)

### 4.1 Khối kính nền (navbar, header, card)

```css
.glass-panel {
    /* Lớp 1: nền kính — đổi 3 màu trong gradient để đổi tông */
    background: linear-gradient(135deg,
        rgba(255, 247, 237, 0.55) 0%,
        rgba(255, 255, 255, 0.60) 48%,
        rgba(255, 251, 235, 0.55) 100%);

    /* Lớp 2: ánh sáng — cạnh dưới đậm hơn cạnh trên */
    border-bottom: 1px solid rgba(217, 119, 6, 0.18);
    box-shadow:
        0 16px 34px rgba(120, 53, 15, 0.08),          /* bóng xa, lan rộng */
        0 6px 16px rgba(15, 23, 42, 0.03),            /* bóng gần, tinh tế */
        inset 0 1.5px 0 rgba(255, 255, 255, 0.8),     /* vạch sáng mép trên */
        inset 0 -1px 0 rgba(180, 83, 9, 0.05);        /* vạch tối mép dưới */

    /* Lớp 1b: làm mờ nền phía sau */
    backdrop-filter: blur(18px) saturate(150%);
    -webkit-backdrop-filter: blur(18px) saturate(150%);

    /* Lớp 4: bật không gian 3D cho phần tử con */
    transform-style: preserve-3d;
}

/* Bóng "hắt" xuống nội dung bên dưới khối kính */
.glass-panel::after {
    content: '';
    position: absolute;
    left: 0; right: 0; bottom: -7px;
    height: 7px;
    pointer-events: none;
    background: linear-gradient(180deg, rgba(146, 64, 14, 0.16), rgba(146, 64, 14, 0));
}
```

### 4.2 Viên thuốc kính 3D (nút, menu item, pill)

```css
.pill-3d {
    position: relative;
    display: inline-flex;
    align-items: center;
    isolation: isolate;            /* bắt buộc: giữ z-index của ::before */
    border-radius: 999px;          /* dạng viên thuốc */
    padding: 0.35rem 0.5rem;
    transform-style: preserve-3d;
}

/* Lớp kính nằm SAU chữ (hiện ra khi hover/active) */
.pill-3d::before {
    content: '';
    position: absolute;
    inset: -0.12rem -0.28rem;      /* nở rộng hơn chữ một chút */
    z-index: -1;
    opacity: 0;                    /* ẩn ở trạng thái nghỉ */
    border-radius: 999px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);

    /* Ánh sáng: viền trên sáng hơn viền dưới */
    border: 1px solid rgba(249, 115, 22, 0.22);
    border-top: 1.5px solid rgba(255, 255, 255, 0.8);
    border-bottom: 2.5px solid rgba(249, 115, 22, 0.35);

    /* Nền kính của pill */
    background: linear-gradient(135deg,
        rgba(255, 255, 255, 0.80) 0%,
        rgba(255, 248, 240, 0.65) 50%,
        rgba(254, 215, 170, 0.35) 100%);

    box-shadow:
        0 12px 22px rgba(234, 88, 12, 0.10),
        0 4px 8px rgba(120, 53, 15, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.75),
        inset 0 -1.5px 3px rgba(249, 115, 22, 0.10);

    /* Tư thế nghỉ: tấm kính đang nằm nghiêng ra xa */
    transform: perspective(520px) rotateX(18deg) translateY(5px) scale(0.96);
    transition: opacity 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease;
}

/* Hover / active: tấm kính "dựng thẳng vào chỗ" */
.pill-3d:hover::before,
.pill-3d.active::before {
    opacity: 1;
    transform: perspective(520px) rotateX(0deg) translateY(0) scale(1);
}

/* Trạng thái active: kính đậm màu hơn một chút */
.pill-3d.active::before {
    background: linear-gradient(135deg,
        rgba(255, 255, 255, 0.90) 0%,
        rgba(255, 248, 240, 0.75) 50%,
        rgba(254, 215, 170, 0.45) 100%);
    border-color: rgba(249, 115, 22, 0.28);
    border-bottom: 2.5px solid rgba(249, 115, 22, 0.45);
}
```

### 4.3 Chữ nổi khắc nhẹ (emboss)

```css
.glass-text {
    color: #3f2a1d;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.85); /* bóng trắng 1px dưới chữ */
}
```

### 4.4 Gạch chân gradient cho item active

```css
.pill-3d.active::after {
    content: '';
    position: absolute;
    bottom: -10px; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #f97316, #f59e0b);
    border-radius: 2px;
    box-shadow: 0 3px 8px rgba(249, 115, 22, 0.28);
}
```

---

## 5. Biến thể (đổi 3 thứ: màu gradient, màu viền, màu bóng)

### 5.1 Glass tối (dark mode)
```css
background: linear-gradient(135deg,
    rgba(30, 41, 59, 0.55) 0%,
    rgba(15, 23, 42, 0.60) 48%,
    rgba(51, 65, 85, 0.55) 100%);
border-bottom: 1px solid rgba(148, 163, 184, 0.25);
box-shadow: 0 16px 34px rgba(0, 0, 0, 0.35),
    inset 0 1.5px 0 rgba(255, 255, 255, 0.15),
    inset 0 -1px 0 rgba(0, 0, 0, 0.4);
/* text-shadow của chữ đổi thành bóng tối: 0 1px 0 rgba(0,0,0,.4) */
```

### 5.2 Glass màu khác (xanh dương, xanh ngọc, tím)
Chỉ cần đổi bộ 3 màu gradient + viền + bóng theo cùng một hue. Ví dụ xanh ngọc:
```css
background: linear-gradient(135deg,
    rgba(240, 253, 250, 0.55) 0%,
    rgba(255, 255, 255, 0.60) 48%,
    rgba(204, 251, 241, 0.55) 100%);
border-bottom: 1px solid rgba(13, 148, 136, 0.18);
box-shadow: 0 16px 34px rgba(13, 148, 136, 0.10),
    inset 0 1.5px 0 rgba(255, 255, 255, 0.8);
```

### 5.3 Frosted đơn giản (chỉ blur, bỏ 3D)
Dùng khi muốn gọn nhẹ (menu mobile, toast, modal): bỏ `rotateX/perspective`, giữ `backdrop-filter: blur(12px)` + nền `rgba(255,255,255,0.7)` + viền mỏng.

### 5.4 Pill đặc (không trong suốt)
Đổi `backdrop-filter` → bỏ hẳn, và gradient nền `::before` từ `rgba` sang màu đặc (`#fff` → `#ffedd5`). Áp dụng cho nơi nền phía sau quá lộn xộn.

---

## 6. Quy tắc & lưu ý khi tái sử dụng

1. **Phải có thứ gì đó phía sau để blur.** Trên nền trắng trơn, glassmorphism gần như vô hình. Đặt khối kính đè lên ảnh / gradient / màu sặc sỡ thì mới thấy hiệu ứng.
2. **Luôn thêm `-webkit-backdrop-filter`** cho Safari (trước Safari 18 không có prefix là không chạy).
3. **Phần tử con không được có background đục** che mất vùng kính. Nếu cần, để nền trong suốt và chỉ tô màu chữ.
4. **`isolation: isolate` trên pill** — nếu thiếu, `z-index: -1` của `::before` có thể chui ra sau cả khối cha và biến mất.
5. **Hiệu suất:** mỗi lớp `backdrop-filter` tốn GPU. Tránh đặt blur lên hàng chục phần tử cùng lúc (navbar có 2 lớp là vừa). Trên mobile yếu, giảm `blur` hoặc bỏ.
6. **Tôn trọng `prefers-reduced-motion`:** tắt `rotateX`, `translateY`, transition cho người dùng giảm chuyển động.
7. **Độ tương phản chữ:** nền càng trong (alpha < 0.5) thì chữ càng cần bóng trắng/tối để vẫn đọc được.
8. **Bóng đổ theo màu nền:** không dùng bóng đen tuyền trên nền sáng ấm — pha màu nâu/cam như `rgba(120, 53, 15, ...)` sẽ tự nhiên hơn.

---

## 7. Checklist áp dụng cho component mới

- [ ] Nền: `linear-gradient` với 3 màu `rgba` cùng hue, alpha 0.5–0.6
- [ ] `backdrop-filter: blur(12–20px) saturate(130–160%)` + prefix `-webkit-`
- [ ] Viền: cạnh trên sáng hơn cạnh dưới (2 dòng `border`)
- [ ] Bóng: 1 bóng xa nhẹ + 1 bóng gần + `inset` highlight trắng mép trên
- [ ] 3D: `perspective(400–600px) rotateX(10–20deg)` ở trạng thái nghỉ, về `0deg` khi hover
- [ ] `transition` 0.2–0.3s ease cho opacity/transform
- [ ] Chữ: `text-shadow` 1px trắng (sáng) hoặc đen (tối)
- [ ] Kiểm tra trên Safari và nền ảnh thật
- [ ] `prefers-reduced-motion` + giới hạn số lớp blur

---

## 8. Vị trí mã nguồn tham chiếu

- `src/frontend/components/navbar.html` — `.navbar-3d` (dòng 32-58), `.nav-link::before` pill 3D (dòng 144-181), chữ nổi + hover (dòng 60-65, 202-208), gạch chân active (dòng 14-24).
- `src/frontend/components/floating-contact.html` — ví dụ khác dùng bóng glow + hover scale (không có blur).
