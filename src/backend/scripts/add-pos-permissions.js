/**
 * Thêm quyền POS (Bán hàng) vào hệ thống
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function addPosPermissions() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'restaurant_db'
        });

        console.log('✅ Đã kết nối database\n');

        // Kiểm tra xem cột đã tồn tại chưa
        const [columns] = await connection.query(`
            SHOW COLUMNS FROM nhan_vien_quyen LIKE 'xem_pos'
        `);

        if (columns.length > 0) {
            console.log('ℹ️  Quyền POS đã tồn tại!\n');
            return;
        }

        // Thêm các cột quyền POS
        console.log('📋 Đang thêm quyền POS...');
        
        await connection.query(`
            ALTER TABLE nhan_vien_quyen 
            ADD COLUMN xem_pos TINYINT(1) DEFAULT 1 AFTER thanh_toan,
            ADD COLUMN tao_don_pos TINYINT(1) DEFAULT 1 AFTER xem_pos,
            ADD COLUMN huy_don_pos TINYINT(1) DEFAULT 0 AFTER tao_don_pos
        `);

        console.log('✅ Đã thêm 3 quyền POS:\n');
        console.log('   - xem_pos: Xem màn hình bán hàng');
        console.log('   - tao_don_pos: Tạo đơn bán hàng');
        console.log('   - huy_don_pos: Hủy đơn bán hàng\n');

        // Cập nhật quyền cho tất cả nhân viên hiện có
        console.log('📋 Cập nhật quyền cho nhân viên hiện có...');
        
        // Manager: có tất cả quyền POS
        await connection.query(`
            UPDATE nhan_vien_quyen nvq
            JOIN nhan_vien nv ON nvq.ma_nhan_vien = nv.ma_nhan_vien
            SET nvq.xem_pos = 1, nvq.tao_don_pos = 1, nvq.huy_don_pos = 1
            WHERE nv.vai_tro = 'manager'
        `);

        // Waiter: có quyền xem và tạo đơn
        await connection.query(`
            UPDATE nhan_vien_quyen nvq
            JOIN nhan_vien nv ON nvq.ma_nhan_vien = nv.ma_nhan_vien
            SET nvq.xem_pos = 1, nvq.tao_don_pos = 1, nvq.huy_don_pos = 0
            WHERE nv.vai_tro = 'waiter'
        `);

        // Kitchen: không có quyền POS
        await connection.query(`
            UPDATE nhan_vien_quyen nvq
            JOIN nhan_vien nv ON nvq.ma_nhan_vien = nv.ma_nhan_vien
            SET nvq.xem_pos = 0, nvq.tao_don_pos = 0, nvq.huy_don_pos = 0
            WHERE nv.vai_tro = 'kitchen'
        `);

        console.log('✅ Đã cập nhật quyền POS cho tất cả nhân viên\n');
        console.log('🎉 Hoàn thành!\n');

    } catch (error) {
        console.error('\n❌ Lỗi:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

addPosPermissions();
