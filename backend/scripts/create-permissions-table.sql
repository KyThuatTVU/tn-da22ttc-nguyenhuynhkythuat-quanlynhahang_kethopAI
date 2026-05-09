-- Tạo bảng quản lý quyền cho nhân viên
CREATE TABLE IF NOT EXISTS nhan_vien_quyen (
    ma_quyen INT AUTO_INCREMENT PRIMARY KEY,
    ma_nhan_vien INT NOT NULL,
    
    -- Quyền Quản lý Đơn hàng
    xem_don_hang BOOLEAN DEFAULT TRUE,
    tao_don_hang BOOLEAN DEFAULT TRUE,
    sua_don_hang BOOLEAN DEFAULT FALSE,
    xoa_don_hang BOOLEAN DEFAULT FALSE,
    huy_don_hang BOOLEAN DEFAULT FALSE,
    
    -- Quyền Quản lý Bàn
    xem_ban BOOLEAN DEFAULT TRUE,
    dat_ban BOOLEAN DEFAULT TRUE,
    sua_ban BOOLEAN DEFAULT FALSE,
    xoa_ban BOOLEAN DEFAULT FALSE,
    
    -- Quyền Quản lý Menu
    xem_menu BOOLEAN DEFAULT TRUE,
    them_menu BOOLEAN DEFAULT FALSE,
    sua_menu BOOLEAN DEFAULT FALSE,
    xoa_menu BOOLEAN DEFAULT FALSE,
    
    -- Quyền Quản lý Khách hàng
    xem_khach_hang BOOLEAN DEFAULT FALSE,
    them_khach_hang BOOLEAN DEFAULT FALSE,
    sua_khach_hang BOOLEAN DEFAULT FALSE,
    xoa_khach_hang BOOLEAN DEFAULT FALSE,
    
    -- Quyền Quản lý Kho
    xem_kho BOOLEAN DEFAULT FALSE,
    them_kho BOOLEAN DEFAULT FALSE,
    sua_kho BOOLEAN DEFAULT FALSE,
    xoa_kho BOOLEAN DEFAULT FALSE,
    nhap_kho BOOLEAN DEFAULT FALSE,
    xuat_kho BOOLEAN DEFAULT FALSE,
    
    -- Quyền Quản lý Nhân viên
    xem_nhan_vien BOOLEAN DEFAULT FALSE,
    them_nhan_vien BOOLEAN DEFAULT FALSE,
    sua_nhan_vien BOOLEAN DEFAULT FALSE,
    xoa_nhan_vien BOOLEAN DEFAULT FALSE,
    phan_quyen BOOLEAN DEFAULT FALSE,
    
    -- Quyền Báo cáo & Thống kê
    xem_bao_cao BOOLEAN DEFAULT FALSE,
    xem_doanh_thu BOOLEAN DEFAULT FALSE,
    xem_thong_ke BOOLEAN DEFAULT FALSE,
    xuat_bao_cao BOOLEAN DEFAULT FALSE,
    
    -- Quyền Bếp
    xem_phieu_bep BOOLEAN DEFAULT FALSE,
    cap_nhat_trang_thai_mon BOOLEAN DEFAULT FALSE,
    xem_cong_thuc BOOLEAN DEFAULT FALSE,
    
    -- Quyền Thanh toán
    thanh_toan BOOLEAN DEFAULT TRUE,
    hoan_tien BOOLEAN DEFAULT FALSE,
    ap_dung_giam_gia BOOLEAN DEFAULT FALSE,
    
    -- Quyền Cài đặt
    xem_cai_dat BOOLEAN DEFAULT FALSE,
    sua_cai_dat BOOLEAN DEFAULT FALSE,
    
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ma_nhan_vien) REFERENCES nhan_vien(ma_nhan_vien) ON DELETE CASCADE,
    UNIQUE KEY unique_staff_permission (ma_nhan_vien)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tạo quyền mặc định cho các vai trò
DELIMITER $$

CREATE PROCEDURE create_default_permissions(IN staff_id INT, IN role VARCHAR(50))
BEGIN
    IF role = 'manager' THEN
        -- Quản lý có tất cả quyền
        INSERT INTO nhan_vien_quyen (ma_nhan_vien, 
            xem_don_hang, tao_don_hang, sua_don_hang, xoa_don_hang, huy_don_hang,
            xem_ban, dat_ban, sua_ban, xoa_ban,
            xem_menu, them_menu, sua_menu, xoa_menu,
            xem_khach_hang, them_khach_hang, sua_khach_hang, xoa_khach_hang,
            xem_kho, them_kho, sua_kho, xoa_kho, nhap_kho, xuat_kho,
            xem_nhan_vien, them_nhan_vien, sua_nhan_vien, xoa_nhan_vien, phan_quyen,
            xem_bao_cao, xem_doanh_thu, xem_thong_ke, xuat_bao_cao,
            xem_phieu_bep, cap_nhat_trang_thai_mon, xem_cong_thuc,
            thanh_toan, hoan_tien, ap_dung_giam_gia,
            xem_cai_dat, sua_cai_dat)
        VALUES (staff_id, 
            1, 1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1,
            1, 1);
            
    ELSEIF role = 'kitchen' THEN
        -- Bếp chỉ có quyền xem và cập nhật món ăn
        INSERT INTO nhan_vien_quyen (ma_nhan_vien,
            xem_don_hang, xem_menu, xem_phieu_bep, cap_nhat_trang_thai_mon, xem_cong_thuc)
        VALUES (staff_id, 1, 1, 1, 1, 1);
        
    ELSE
        -- Waiter (phục vụ) có quyền cơ bản
        INSERT INTO nhan_vien_quyen (ma_nhan_vien,
            xem_don_hang, tao_don_hang, sua_don_hang,
            xem_ban, dat_ban,
            xem_menu, xem_khach_hang, thanh_toan, ap_dung_giam_gia)
        VALUES (staff_id, 1, 1, 1, 1, 1, 1, 1, 1, 1);
    END IF;
END$$

DELIMITER ;

-- Tạo quyền cho tất cả nhân viên hiện có
INSERT INTO nhan_vien_quyen (ma_nhan_vien)
SELECT ma_nhan_vien FROM nhan_vien 
WHERE ma_nhan_vien NOT IN (SELECT ma_nhan_vien FROM nhan_vien_quyen)
ON DUPLICATE KEY UPDATE ma_nhan_vien = ma_nhan_vien;
