-- Script thêm cài đặt GPS cho chấm công
-- Thêm tọa độ GPS và bán kính cho phép chấm công

-- Thêm các cài đặt GPS (sử dụng ON DUPLICATE KEY UPDATE để không lỗi nếu đã tồn tại)
INSERT INTO cai_dat (setting_key, setting_value, mo_ta) VALUES
('latitude', '9.9234', 'Vĩ độ GPS của nhà hàng (Đại học Trà Vinh)'),
('longitude', '106.3465', 'Kinh độ GPS của nhà hàng (Đại học Trà Vinh)'),
('radius', '500', 'Bán kính cho phép chấm công (mét)')
ON DUPLICATE KEY UPDATE 
    setting_value = VALUES(setting_value),
    mo_ta = VALUES(mo_ta);

-- Cập nhật địa chỉ mặc định thành TVU
UPDATE cai_dat 
SET setting_value = 'Trường Đại học Trà Vinh, 126 Nguyễn Thiện Thành, Phường 5, TP. Trà Vinh'
WHERE setting_key = 'dia_chi';
