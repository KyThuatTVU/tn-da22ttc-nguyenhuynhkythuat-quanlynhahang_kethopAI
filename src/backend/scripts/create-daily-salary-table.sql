-- Tạo bảng lương tạm tính hàng ngày
CREATE TABLE IF NOT EXISTS luong_tam_tinh (
    ma_luong_ngay INT PRIMARY KEY AUTO_INCREMENT,
    ma_nhan_vien INT NOT NULL,
    ngay DATE NOT NULL,
    so_gio_lam DECIMAL(5,2) DEFAULT 0,
    luong_theo_gio DECIMAL(10,2) DEFAULT 0,
    luong_ngay DECIMAL(10,2) DEFAULT 0,
    trang_thai_cham_cong VARCHAR(50),
    ghi_chu TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ma_nhan_vien) REFERENCES nhan_vien(ma_nhan_vien) ON DELETE CASCADE,
    UNIQUE KEY unique_staff_date (ma_nhan_vien, ngay),
    INDEX idx_ngay (ngay),
    INDEX idx_nhan_vien_ngay (ma_nhan_vien, ngay)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
