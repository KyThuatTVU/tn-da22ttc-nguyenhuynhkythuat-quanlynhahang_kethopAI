/**
 * Script tự động tạo bảng permissions và quyền mặc định
 * Chạy: node backend/scripts/run-permissions-setup.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function setupPermissions() {
    let connection;
    
    try {
        // Kết nối database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'restaurant_db',
            multipleStatements: true
        });

        console.log('✅ Đã kết nối database');

        // Tạo bảng nhan_vien_quyen
        console.log('\n📋 Đang tạo bảng nhan_vien_quyen...');
        await connection.query(`
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Đã tạo bảng nhan_vien_quyen');

        // Xóa procedure cũ nếu có
        await connection.query('DROP PROCEDURE IF EXISTS create_default_permissions');

        // Tạo stored procedure
        console.log('\n📋 Đang tạo stored procedure...');
        await connection.query(`
            CREATE PROCEDURE create_default_permissions(IN staff_id INT, IN role VARCHAR(50))
            BEGIN
                -- Xóa quyền cũ nếu có
                DELETE FROM nhan_vien_quyen WHERE ma_nhan_vien = staff_id;
                
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
                        1, 1)
                    ON DUPLICATE KEY UPDATE ma_nhan_vien = staff_id;
                        
                ELSEIF role = 'kitchen' THEN
                    -- Bếp chỉ có quyền xem và cập nhật món ăn
                    INSERT INTO nhan_vien_quyen (ma_nhan_vien,
                        xem_don_hang, xem_menu, xem_phieu_bep, cap_nhat_trang_thai_mon, xem_cong_thuc)
                    VALUES (staff_id, 1, 1, 1, 1, 1)
                    ON DUPLICATE KEY UPDATE ma_nhan_vien = staff_id;
                    
                ELSE
                    -- Waiter (phục vụ) có quyền cơ bản
                    INSERT INTO nhan_vien_quyen (ma_nhan_vien,
                        xem_don_hang, tao_don_hang, sua_don_hang,
                        xem_ban, dat_ban,
                        xem_menu, xem_khach_hang, thanh_toan, ap_dung_giam_gia)
                    VALUES (staff_id, 1, 1, 1, 1, 1, 1, 1, 1, 1)
                    ON DUPLICATE KEY UPDATE ma_nhan_vien = staff_id;
                END IF;
            END
        `);
        console.log('✅ Đã tạo stored procedure create_default_permissions');

        // Tạo quyền cho tất cả nhân viên hiện có
        console.log('\n📋 Đang tạo quyền cho nhân viên hiện có...');
        const [staff] = await connection.query(`
            SELECT ma_nhan_vien, vai_tro 
            FROM nhan_vien 
            WHERE ma_nhan_vien NOT IN (SELECT ma_nhan_vien FROM nhan_vien_quyen)
        `);

        if (staff.length > 0) {
            for (const s of staff) {
                await connection.query('CALL create_default_permissions(?, ?)', [s.ma_nhan_vien, s.vai_tro]);
                console.log(`  ✅ Tạo quyền cho nhân viên ID ${s.ma_nhan_vien} (${s.vai_tro})`);
            }
            console.log(`✅ Đã tạo quyền cho ${staff.length} nhân viên`);
        } else {
            console.log('ℹ️  Tất cả nhân viên đã có quyền');
        }

        console.log('\n🎉 Hoàn thành! Hệ thống phân quyền đã được cài đặt.');
        console.log('\n📝 Bạn có thể:');
        console.log('   1. Vào trang Quản lý Nhân viên');
        console.log('   2. Nhấn nút 🛡️ (màu tím) để phân quyền');
        console.log('   3. Bật/tắt các quyền theo nhu cầu\n');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Chạy
setupPermissions();
