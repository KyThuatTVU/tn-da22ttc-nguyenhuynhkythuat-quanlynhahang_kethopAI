-- Cập nhật bảng cham_cong để lưu ảnh và GPS

-- Thêm cột ảnh chấm công
ALTER TABLE cham_cong 
ADD COLUMN IF NOT EXISTS anh_cham_cong VARCHAR(255) COMMENT 'Ảnh check-in',
ADD COLUMN IF NOT EXISTS anh_checkout VARCHAR(255) COMMENT 'Ảnh check-out',
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8) COMMENT 'Vĩ độ check-in',
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8) COMMENT 'Kinh độ check-in',
ADD COLUMN IF NOT EXISTS latitude_out DECIMAL(10, 8) COMMENT 'Vĩ độ check-out',
ADD COLUMN IF NOT EXISTS longitude_out DECIMAL(11, 8) COMMENT 'Kinh độ check-out',
ADD COLUMN IF NOT EXISTS loai ENUM('checkin', 'checkout', 'manual') DEFAULT 'manual' COMMENT 'Loại chấm công';

-- Thêm index cho tìm kiếm nhanh
ALTER TABLE cham_cong 
ADD INDEX idx_nhan_vien_ngay (ma_nhan_vien, ngay),
ADD INDEX idx_ngay (ngay);
