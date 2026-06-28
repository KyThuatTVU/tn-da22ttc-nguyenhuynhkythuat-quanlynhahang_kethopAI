-- ==========================================
-- FIX: Thêm khẩu vị cho "Cơm chiên tỏi trứng"
-- ==========================================

-- Vấn đề: Món "Cơm chiên tỏi trứng" chỉ có khẩu vị "Đồ chiên"
-- không match với user preference "Thanh đạm", nên bị lọc ra

-- Giải pháp: Thêm thêm khẩu vị phù hợp

-- 1. Kiểm tra khẩu vị hiện tại
SELECT 
    m.ma_mon,
    m.ten_mon,
    GROUP_CONCAT(f.ten_thuoc_tinh SEPARATOR ', ') as khau_vi_hien_tai
FROM mon_an m
LEFT JOIN mon_an_khau_vi mk ON m.ma_mon = mk.ma_mon
LEFT JOIN thuoc_tinh_khau_vi f ON mk.id_thuoc_tinh = f.id
WHERE m.ma_mon = 33
GROUP BY m.ma_mon, m.ten_mon;

-- 2. Thêm khẩu vị mới cho "Cơm chiên tỏi trứng"
-- Cơm chiên thường có:
-- - Vị mặn (🧂 Mặn - ID: 3)
-- - Nhiều đạm (🥩 Nhiều đạm - ID: 7) - vì có trứng và có thể có thịt

INSERT IGNORE INTO mon_an_khau_vi (ma_mon, id_thuoc_tinh) VALUES
    (33, 3),  -- 🧂 Mặn
    (33, 7);  -- 🥩 Nhiều đạm

-- 3. Kiểm tra lại sau khi thêm
SELECT 
    m.ma_mon,
    m.ten_mon,
    GROUP_CONCAT(f.ten_thuoc_tinh SEPARATOR ', ') as khau_vi_sau_fix
FROM mon_an m
LEFT JOIN mon_an_khau_vi mk ON m.ma_mon = mk.ma_mon
LEFT JOIN thuoc_tinh_khau_vi f ON mk.id_thuoc_tinh = f.id
WHERE m.ma_mon = 33
GROUP BY m.ma_mon, m.ten_mon;

-- ==========================================
-- LƯU Ý: 
-- Nếu vẫn muốn món này xuất hiện cho user có preference "Thanh đạm"
-- có thể thêm cả khẩu vị "Thanh đạm" nếu phù hợp:
-- INSERT IGNORE INTO mon_an_khau_vi (ma_mon, id_thuoc_tinh) VALUES (33, 6);
-- 
-- NHƯNG cần xem xét xem cơm chiên có thực sự "thanh đạm" không!
-- ==========================================

-- 4. KHUYẾN NGHỊ: Review tất cả món ăn khác để đảm bảo đủ khẩu vị
SELECT 
    m.ma_mon,
    m.ten_mon,
    COUNT(mk.id_thuoc_tinh) as so_khau_vi,
    GROUP_CONCAT(f.ten_thuoc_tinh SEPARATOR ', ') as cac_khau_vi
FROM mon_an m
LEFT JOIN mon_an_khau_vi mk ON m.ma_mon = mk.ma_mon
LEFT JOIN thuoc_tinh_khau_vi f ON mk.id_thuoc_tinh = f.id
WHERE m.trang_thai = 1
GROUP BY m.ma_mon, m.ten_mon
HAVING so_khau_vi = 0 OR so_khau_vi = 1
ORDER BY so_khau_vi ASC, m.ten_mon;
