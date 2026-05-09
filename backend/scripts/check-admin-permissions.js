/**
 * Kiểm tra quyền của Admin
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function checkAdminPermissions() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'restaurant_db'
        });

        console.log('✅ Đã kết nối database\n');

        // 1. Kiểm tra bảng admin
        console.log('=== DANH SÁCH ADMIN ===');
        const [admins] = await connection.query('SELECT ma_admin, tai_khoan, quyen FROM admin');
        admins.forEach(a => {
            console.log(`ID: ${a.ma_admin}, Tài khoản: ${a.tai_khoan}, Quyền: ${a.quyen}`);
        });

        console.log('\n=== LƯU Ý ===');
        console.log('Admin KHÔNG CẦN bảng phân quyền chi tiết như nhân viên');
        console.log('Admin có 2 cấp quyền:');
        console.log('  - superadmin: Toàn quyền (tạo/xóa admin khác)');
        console.log('  - admin: Quản lý hệ thống (không tạo/xóa admin)');
        console.log('\nAdmin tự động có quyền truy cập TẤT CẢ chức năng trong hệ thống');
        console.log('Không cần bảng nhan_vien_quyen cho admin\n');

    } catch (error) {
        console.error('\n❌ Lỗi:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkAdminPermissions();
