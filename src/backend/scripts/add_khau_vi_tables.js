require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
    const db = await mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'quan_ly_nha_hang',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        console.log('Bắt đầu tạo bảng khẩu vị...');

        // 1. Tạo bảng thuoc_tinh_khau_vi
        await db.query(`
            CREATE TABLE IF NOT EXISTS thuoc_tinh_khau_vi (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ten_thuoc_tinh VARCHAR(100) NOT NULL UNIQUE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Đã tạo bảng thuoc_tinh_khau_vi');

        // Thêm dữ liệu mẫu (tags mặc định)
        const tags = [
            ['🍲 Cay'], ['🍋 Chua'], ['🧂 Mặn'], ['🍰 Ngọt'], 
            ['🥦 Chay'], ['🌿 Thanh đạm'], ['🥩 Nhiều đạm'], ['🍤 Hải sản']
        ];
        await db.query(`INSERT IGNORE INTO thuoc_tinh_khau_vi (ten_thuoc_tinh) VALUES ?`, [tags]);
        console.log('✅ Đã thêm các tags khẩu vị mặc định');

        // 2. Tạo bảng map mon_an_khau_vi
        await db.query(`
            CREATE TABLE IF NOT EXISTS mon_an_khau_vi (
                ma_mon INT,
                id_thuoc_tinh INT,
                PRIMARY KEY (ma_mon, id_thuoc_tinh),
                FOREIGN KEY (ma_mon) REFERENCES mon_an(ma_mon) ON DELETE CASCADE,
                FOREIGN KEY (id_thuoc_tinh) REFERENCES thuoc_tinh_khau_vi(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Đã tạo bảng mon_an_khau_vi');

        // 3. Sửa bảng so_thich_nguoi_dung (để lưu id_thuoc_tinh thay vì ma_danh_muc, HOẶC làm bảng mới cho an toàn)
        // Mình sẽ tạo thêm bảng so_thich_khau_vi (đi chung với Category)
        await db.query(`
            CREATE TABLE IF NOT EXISTS so_thich_khau_vi_nguoi_dung (
                ma_nguoi_dung INT,
                id_thuoc_tinh INT,
                PRIMARY KEY (ma_nguoi_dung, id_thuoc_tinh),
                FOREIGN KEY (ma_nguoi_dung) REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE,
                FOREIGN KEY (id_thuoc_tinh) REFERENCES thuoc_tinh_khau_vi(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Đã tạo bảng so_thich_khau_vi_nguoi_dung');

        console.log('🎉 TOÀN BỘ CẤU TRÚC ĐÃ ĐƯỢC TẠO THÀNH CÔNG!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}

run();