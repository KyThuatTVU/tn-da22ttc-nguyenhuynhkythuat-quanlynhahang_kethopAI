const mysql = require('mysql2/promise');
require('dotenv').config({path: 'd:/KhoaLuanTotNghiep2026/backend/.env'});

async function run() {
    let db;
    try {
        db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log("Connected to DB. Starting to generate test data for Apriori...");

        // Món A: Gỏi bò bóp thấu (ma_mon: 24, giá: 120000)
        // Món B: Sụn gà chiên nước mắm (ma_mon: 27, giá: 80000)
        // Chúng ta muốn P(B | A) = 0.8
        // Tổng số lần mua A = 10
        // Số lần mua chung A và B = 8
        // Số lần mua A nhưng không mua B = 2

        const ordersToCreate = [
            // 8 đơn mua cả A và B
            ...Array(8).fill().map(() => [{ ma_mon: 24, gia: 120000, sl: 1 }, { ma_mon: 27, gia: 80000, sl: 2 }]),
            // 2 đơn mua A nhưng không mua B
            ...Array(2).fill().map(() => [{ ma_mon: 24, gia: 120000, sl: 1 }, { ma_mon: 1, gia: 50000, sl: 1 }]),
            // 5 đơn mua B nhưng không mua A
            ...Array(5).fill().map(() => [{ ma_mon: 27, gia: 80000, sl: 3 }, { ma_mon: 25, gia: 120000, sl: 1 }]),
            // 5 đơn mua linh tinh
            ...Array(5).fill().map(() => [{ ma_mon: 3, gia: 200000, sl: 1 }, { ma_mon: 47, gia: 180000, sl: 1 }])
        ];

        let totalInserted = 0;

        for (const items of ordersToCreate) {
            const tong_tien = items.reduce((sum, item) => sum + (item.gia * item.sl), 0);
            
            // Insert don_hang (trạng thái: delivered, thanh toán: cod)
            const [result] = await db.query(
                `INSERT INTO don_hang (ma_nguoi_dung, tong_tien, phuong_thuc_thanh_toan, trang_thai) 
                 VALUES (?, ?, ?, ?)`,
                [null, tong_tien, 'cod', 'delivered']
            );
            
            const ma_don_hang = result.insertId;

            // Insert chi_tiet_don_hang
            for (const item of items) {
                await db.query(
                    `INSERT INTO chi_tiet_don_hang (ma_don_hang, ma_mon, so_luong, gia_tai_thoi_diem)
                     VALUES (?, ?, ?, ?)`,
                    [ma_don_hang, item.ma_mon, item.sl, item.gia]
                );
            }
            totalInserted++;
        }

        console.log(`Successfully generated ${totalInserted} orders for Apriori testing.`);
        console.log("Cặp món kiểm thử MỚI:");
        console.log("- Khi khách mua [Gỏi bò bóp thấu (ID: 24)] -> Sẽ được gợi ý [Sụn gà chiên nước mắm (ID: 27)] với độ tin cậy CHÍNH XÁC 80%");

    } catch (e) {
        console.error("Error generating data:", e);
    } finally {
        if (db) await db.end();
        process.exit();
    }
}

run();
