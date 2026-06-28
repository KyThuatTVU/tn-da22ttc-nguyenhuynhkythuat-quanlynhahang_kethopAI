/**
 * Script đơn giản tạo quyền cho nhân viên
 * Chạy: node backend/scripts/setup-permissions-simple.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function setupPermissions() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'restaurant_db'
        });

        console.log('✅ Đã kết nối database\n');

        // 1. Tạo bảng
        console.log('📋 Tạo bảng nhan_vien_quyen...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS nhan_vien_quyen (
                ma_quyen INT AUTO_INCREMENT PRIMARY KEY,
                ma_nhan_vien INT NOT NULL,
                xem_don_hang TINYINT(1) DEFAULT 1,
                tao_don_hang TINYINT(1) DEFAULT 1,
                sua_don_hang TINYINT(1) DEFAULT 0,
                xoa_don_hang TINYINT(1) DEFAULT 0,
                huy_don_hang TINYINT(1) DEFAULT 0,
                xem_ban TINYINT(1) DEFAULT 1,
                dat_ban TINYINT(1) DEFAULT 1,
                sua_ban TINYINT(1) DEFAULT 0,
                xoa_ban TINYINT(1) DEFAULT 0,
                xem_menu TINYINT(1) DEFAULT 1,
                them_menu TINYINT(1) DEFAULT 0,
                sua_menu TINYINT(1) DEFAULT 0,
                xoa_menu TINYINT(1) DEFAULT 0,
                xem_khach_hang TINYINT(1) DEFAULT 0,
                them_khach_hang TINYINT(1) DEFAULT 0,
                sua_khach_hang TINYINT(1) DEFAULT 0,
                xoa_khach_hang TINYINT(1) DEFAULT 0,
                xem_kho TINYINT(1) DEFAULT 0,
                them_kho TINYINT(1) DEFAULT 0,
                sua_kho TINYINT(1) DEFAULT 0,
                xoa_kho TINYINT(1) DEFAULT 0,
                nhap_kho TINYINT(1) DEFAULT 0,
                xuat_kho TINYINT(1) DEFAULT 0,
                xem_nhan_vien TINYINT(1) DEFAULT 0,
                them_nhan_vien TINYINT(1) DEFAULT 0,
                sua_nhan_vien TINYINT(1) DEFAULT 0,
                xoa_nhan_vien TINYINT(1) DEFAULT 0,
                phan_quyen TINYINT(1) DEFAULT 0,
                xem_bao_cao TINYINT(1) DEFAULT 0,
                xem_doanh_thu TINYINT(1) DEFAULT 0,
                xem_thong_ke TINYINT(1) DEFAULT 0,
                xuat_bao_cao TINYINT(1) DEFAULT 0,
                xem_phieu_bep TINYINT(1) DEFAULT 0,
                cap_nhat_trang_thai_mon TINYINT(1) DEFAULT 0,
                xem_cong_thuc TINYINT(1) DEFAULT 0,
                thanh_toan TINYINT(1) DEFAULT 1,
                hoan_tien TINYINT(1) DEFAULT 0,
                ap_dung_giam_gia TINYINT(1) DEFAULT 0,
                xem_cai_dat TINYINT(1) DEFAULT 0,
                sua_cai_dat TINYINT(1) DEFAULT 0,
                ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_staff_permission (ma_nhan_vien)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Đã tạo bảng\n');

        // 2. Lấy danh sách nhân viên chưa có quyền
        console.log('📋 Kiểm tra nhân viên...');
        const [staff] = await connection.query(`
            SELECT nv.ma_nhan_vien, nv.ten_nhan_vien, nv.vai_tro 
            FROM nhan_vien nv
            LEFT JOIN nhan_vien_quyen nvq ON nv.ma_nhan_vien = nvq.ma_nhan_vien
            WHERE nvq.ma_quyen IS NULL
        `);

        if (staff.length === 0) {
            console.log('ℹ️  Tất cả nhân viên đã có quyền\n');
            console.log('🎉 Hoàn thành!\n');
            return;
        }

        console.log(`📝 Tìm thấy ${staff.length} nhân viên chưa có quyền\n`);

        // 3. Tạo quyền cho từng nhân viên
        for (const s of staff) {
            const role = s.vai_tro || 'waiter';
            console.log(`   Tạo quyền cho: ${s.ten_nhan_vien} (${role})`);

            if (role === 'manager') {
                // Manager: Tất cả quyền (45 quyền bao gồm POS)
                await connection.query(`
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
                        xem_pos, tao_don_pos, huy_don_pos,
                        xem_cai_dat, sua_cai_dat)
                    VALUES (?,
                        1,1,1,1,1,
                        1,1,1,1,
                        1,1,1,1,
                        1,1,1,1,
                        1,1,1,1,1,1,
                        1,1,1,1,1,
                        1,1,1,1,
                        1,1,1,
                        1,1,1,
                        1,1,1,
                        1,1)
                `, [s.ma_nhan_vien]);
            } else if (role === 'kitchen') {
                // Kitchen: Quyền bếp (không có POS)
                await connection.query(`
                    INSERT INTO nhan_vien_quyen (ma_nhan_vien,
                        xem_don_hang, xem_menu, xem_phieu_bep, cap_nhat_trang_thai_mon, xem_cong_thuc,
                        xem_pos, tao_don_pos, huy_don_pos)
                    VALUES (?, 1, 1, 1, 1, 1, 0, 0, 0)
                `, [s.ma_nhan_vien]);
            } else {
                // Waiter: Quyền cơ bản + POS
                await connection.query(`
                    INSERT INTO nhan_vien_quyen (ma_nhan_vien,
                        xem_don_hang, tao_don_hang, sua_don_hang,
                        xem_ban, dat_ban,
                        xem_menu, xem_khach_hang, thanh_toan, ap_dung_giam_gia,
                        xem_pos, tao_don_pos, huy_don_pos)
                    VALUES (?, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0)
                `, [s.ma_nhan_vien]);
            }
        }

        console.log(`\n✅ Đã tạo quyền cho ${staff.length} nhân viên\n`);
        console.log('🎉 Hoàn thành!\n');
        console.log('📝 Bạn có thể:');
        console.log('   1. Vào trang Quản lý Nhân viên (staff.html)');
        console.log('   2. Nhấn nút 🛡️ (màu tím) để phân quyền');
        console.log('   3. Bật/tắt các quyền theo nhu cầu\n');

    } catch (error) {
        console.error('\n❌ Lỗi:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setupPermissions();
