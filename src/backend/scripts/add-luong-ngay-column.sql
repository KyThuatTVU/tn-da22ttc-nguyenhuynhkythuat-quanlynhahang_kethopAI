-- Thêm cột lương tạm tính vào bảng chấm công
ALTER TABLE cham_cong ADD COLUMN IF NOT EXISTS luong_ngay DECIMAL(10,2) DEFAULT 0 AFTER so_gio_lam;
