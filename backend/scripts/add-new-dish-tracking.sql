-- Migration: Thêm cột ngay_tao cho bảng mon_an để tracking món mới
-- Mục đích: Hỗ trợ recommendation món mới (≤ 30 ngày)

-- Thêm cột ngay_tao (bỏ qua nếu đã tồn tại)
ALTER TABLE mon_an 
ADD COLUMN ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP
COMMENT 'Ngày tạo món ăn, dùng để xác định món mới';

-- Với món đã có sẵn, set ngay_tao = NOW() - 60 ngày (coi như món cũ)
UPDATE mon_an 
SET ngay_tao = DATE_SUB(NOW(), INTERVAL 60 DAY)
WHERE ngay_tao IS NULL;

-- Tạo index để query nhanh món mới
CREATE INDEX idx_mon_an_ngay_tao ON mon_an(ngay_tao);
