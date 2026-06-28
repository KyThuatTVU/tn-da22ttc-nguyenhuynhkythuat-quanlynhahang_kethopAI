/**
 * Script test nhanh hệ thống gợi ý món mới
 * Usage: node backend/scripts/test-new-dish-recommendation.js
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testNewDishRecommendation() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'amthuc_phuongnam'
    });

    try {
        console.log('🧪 Test: Hệ thống gợi ý món mới\n');
        
        // 1. Kiểm tra cột ngay_tao đã tồn tại
        console.log('1️⃣ Kiểm tra cột ngay_tao...');
        const [columns] = await connection.query(`
            SHOW COLUMNS FROM mon_an LIKE 'ngay_tao'
        `);
        
        if (columns.length === 0) {
            console.log('   ❌ Cột ngay_tao chưa tồn tại. Vui lòng chạy migration trước!');
            console.log('   → node backend/scripts/run-new-dish-migration.js');
            process.exit(1);
        }
        console.log('   ✅ Cột ngay_tao đã tồn tại\n');
        
        // 2. Thống kê món mới
        console.log('2️⃣ Thống kê món mới...');
        const [stats] = await connection.query(`
            SELECT 
                COUNT(*) as total_dishes,
                SUM(CASE WHEN DATEDIFF(NOW(), ngay_tao) <= 30 THEN 1 ELSE 0 END) as new_dishes_30d,
                SUM(CASE WHEN DATEDIFF(NOW(), ngay_tao) <= 7 THEN 1 ELSE 0 END) as new_dishes_7d,
                MIN(ngay_tao) as oldest_dish_date,
                MAX(ngay_tao) as newest_dish_date
            FROM mon_an
        `);
        
        console.log(`   - Tổng số món: ${stats[0].total_dishes}`);
        console.log(`   - Món mới (≤30 ngày): ${stats[0].new_dishes_30d}`);
        console.log(`   - Món mới (≤7 ngày): ${stats[0].new_dishes_7d}`);
        console.log(`   - Món cũ nhất: ${stats[0].oldest_dish_date}`);
        console.log(`   - Món mới nhất: ${stats[0].newest_dish_date}\n`);
        
        // 3. Test query món mới có khẩu vị
        console.log('3️⃣ Test query món mới với khẩu vị (giống API)...');
        const [newDishesWithFlavor] = await connection.query(`
            SELECT 
                m.ma_mon, m.ten_mon, 
                DATEDIFF(NOW(), m.ngay_tao) as days_old,
                GROUP_CONCAT(DISTINCT kv.ten_thuoc_tinh SEPARATOR ', ') as flavors
            FROM mon_an m
            JOIN mon_an_khau_vi makv ON m.ma_mon = makv.ma_mon
            JOIN thuoc_tinh_khau_vi kv ON makv.id_thuoc_tinh = kv.id
            WHERE m.trang_thai = 1
            AND DATEDIFF(NOW(), m.ngay_tao) <= 30
            GROUP BY m.ma_mon
            ORDER BY m.ngay_tao DESC
            LIMIT 5
        `);
        
        if (newDishesWithFlavor.length > 0) {
            console.log(`   ✅ Tìm thấy ${newDishesWithFlavor.length} món mới có khẩu vị:`);
            newDishesWithFlavor.forEach((dish, i) => {
                console.log(`      ${i+1}. ${dish.ten_mon} (${dish.days_old} ngày) - ${dish.flavors}`);
            });
        } else {
            console.log('   ⚠️ Không tìm thấy món mới nào có khẩu vị');
            console.log('   → Hãy thêm món mới qua admin hoặc tạo test data\n');
        }
        console.log();
        
        // 4. Test ORDER BY boost
        console.log('4️⃣ Test ORDER BY boost (món mới ưu tiên trước)...');
        const [boostedResults] = await connection.query(`
            SELECT 
                m.ma_mon, m.ten_mon,
                DATEDIFF(NOW(), m.ngay_tao) as days_old,
                COALESCE(AVG(dg.so_sao), 4.0) as avg_rating,
                (CASE WHEN DATEDIFF(NOW(), m.ngay_tao) <= 30 THEN 1 ELSE 0 END) as is_new
            FROM mon_an m
            LEFT JOIN danh_gia_san_pham dg ON m.ma_mon = dg.ma_mon AND dg.trang_thai = 'approved'
            WHERE m.trang_thai = 1
            GROUP BY m.ma_mon
            ORDER BY 
                (CASE WHEN DATEDIFF(NOW(), m.ngay_tao) <= 30 THEN 1 ELSE 0 END) DESC,
                COALESCE(AVG(dg.so_sao), 4.0) DESC
            LIMIT 10
        `);
        
        console.log(`   Top 10 món sau khi boost:`);
        boostedResults.forEach((dish, i) => {
            const badge = dish.is_new ? '🆕' : '  ';
            const rating = dish.avg_rating ? parseFloat(dish.avg_rating).toFixed(1) : '0.0';
            console.log(`      ${badge} ${i+1}. ${dish.ten_mon} (${dish.days_old} ngày, ⭐${rating})`);
        });
        console.log();
        
        // 5. Kiểm tra món không có khẩu vị (warning)
        console.log('5️⃣ Kiểm tra món mới chưa gán khẩu vị (cần fix)...');
        const [dishesWithoutFlavor] = await connection.query(`
            SELECT m.ma_mon, m.ten_mon, DATEDIFF(NOW(), m.ngay_tao) as days_old
            FROM mon_an m
            WHERE m.trang_thai = 1
            AND DATEDIFF(NOW(), m.ngay_tao) <= 30
            AND NOT EXISTS (
                SELECT 1 FROM mon_an_khau_vi makv WHERE makv.ma_mon = m.ma_mon
            )
        `);
        
        if (dishesWithoutFlavor.length > 0) {
            console.log(`   ⚠️ Cảnh báo: ${dishesWithoutFlavor.length} món mới chưa gán khẩu vị:`);
            dishesWithoutFlavor.forEach((dish, i) => {
                console.log(`      ${i+1}. ID ${dish.ma_mon}: ${dish.ten_mon}`);
            });
            console.log('   → Các món này chỉ xuất hiện trong fallback, không match khẩu vị user');
        } else {
            console.log('   ✅ Tất cả món mới đều đã gán khẩu vị');
        }
        console.log();
        
        console.log('✅ Test hoàn tất!');
        console.log('\n📌 Bước tiếp theo:');
        console.log('   1. Test API: GET /api/recommendations/new-dishes');
        console.log('   2. Thêm validation bắt buộc khẩu vị trong admin form');
        console.log('   3. Monitor metrics: CTR, conversion rate của món mới');
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

testNewDishRecommendation()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
