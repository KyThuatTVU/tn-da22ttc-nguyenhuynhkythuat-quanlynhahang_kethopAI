# ✅ TÓM TẮT: Sửa lỗi món mới không hiển thị cho user có khẩu vị

## Vấn đề
Món mới được tạo và gán nhãn khẩu vị, nhưng KHÔNG hiển thị cho user có sở thích khẩu vị phù hợp.

## Nguyên nhân
Code cũ CHỈ kiểm tra lịch sử đánh giá món (`danh_gia_san_pham`) để lấy sở thích khẩu vị. Bỏ qua sở thích trực tiếp từ `so_thich_khau_vi_nguoi_dung`.

## Giải pháp
Sửa logic kiểm tra **4 nguồn sở thích** theo thứ tự ưu tiên:
1. `so_thich_khau_vi_nguoi_dung` (cao nhất)
2. `danh_gia_san_pham` (đánh giá ≥4 sao)
3. `user_preference_profile` (ML)
4. Khẩu vị phổ biến (fallback)

## Files đã sửa
- `backend/routes/recommendation.js` → `/new-dishes` endpoint
- `ai_service/hybrid_recommendation.py` → `get_new_dish_recommendations()`

## Chức năng hoạt động
✅ **Menu thông thường** (`GET /api/menu`): Hiển thị TẤT CẢ món bao gồm món mới vừa tạo
✅ **Gợi ý theo khẩu vị** (`GET /api/recommendations/new-dishes`): Hiển thị món mới CHỈ cho user có khẩu vị phù hợp

## Lưu ý Admin
Khi tạo món mới, **BẮT BUỘC gán ít nhất 1 khẩu vị** để món hiển thị đúng trong phần gợi ý.
