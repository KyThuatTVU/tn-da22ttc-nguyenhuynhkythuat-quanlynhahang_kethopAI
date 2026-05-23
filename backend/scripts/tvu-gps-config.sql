-- ============================================
-- CẤU HÌNH GPS CHO CHẤM CÔNG TẠI TVU
-- Trung tâm Học liệu B7, Trường Đại học Trà Vinh
-- ============================================

-- Thêm hoặc cập nhật tọa độ GPS
INSERT INTO cai_dat (setting_key, setting_value, mo_ta) VALUES
('latitude', '9.9234', 'Vĩ độ GPS của nhà hàng (Đại học Trà Vinh)'),
('longitude', '106.3465', 'Kinh độ GPS của nhà hàng (Đại học Trà Vinh)'),
('radius', '500', 'Bán kính cho phép chấm công (mét)')
ON DUPLICATE KEY UPDATE 
    setting_value = VALUES(setting_value),
    mo_ta = VALUES(mo_ta);

-- Cập nhật địa chỉ
INSERT INTO cai_dat (setting_key, setting_value, mo_ta) VALUES
('dia_chi', 'Trường Đại học Trà Vinh, 126 Nguyễn Thiện Thành, Phường 5, TP. Trà Vinh', 'Địa chỉ nhà hàng')
ON DUPLICATE KEY UPDATE 
    setting_value = VALUES(setting_value);

-- Kiểm tra kết quả
SELECT 
    setting_key as 'Cài đặt',
    setting_value as 'Giá trị',
    mo_ta as 'Mô tả'
FROM cai_dat 
WHERE setting_key IN ('latitude', 'longitude', 'radius', 'dia_chi')
ORDER BY 
    FIELD(setting_key, 'dia_chi', 'latitude', 'longitude', 'radius');

-- ============================================
-- THÔNG TIN TỌA ĐỘ
-- ============================================
-- Địa điểm: Trường Đại học Trà Vinh
-- Vĩ độ (Latitude): 9.9234
-- Kinh độ (Longitude): 106.3465
-- Bán kính cho phép: 500 mét
-- 
-- Để test:
-- 1. Đến Trường Đại học Trà Vinh
-- 2. Truy cập: http://localhost:3000/cham-cong-guong-mat.html?code=NV001
-- 3. Kiểm tra GPS hiển thị "Hợp Lệ"
-- 4. Thực hiện chấm công
-- ============================================
