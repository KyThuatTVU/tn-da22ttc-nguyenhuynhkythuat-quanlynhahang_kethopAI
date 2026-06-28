/**
 * Script: Kiểm tra tại sao 2 món không xuất hiện trong content-based recommendations
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'amthuc_phuongnam';

async function checkWhy() {
    const conn = await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASS,
        database: DB_NAME
    });

    console.log('🔍 ====== TẠI SAO 2 MÓN KHÔNG XUẤT HIỆN TRONG CONTENT-BASED? ======\n');

    try {
        const userId = 4;
        const comChienId = 33;
        const khoLuId = 29;

        // 1. User đã mua món nào?
        const [userOrders] = await conn.query(
            `SELECT DISTINCT ct.ma_mon, m.ten_mon
             FROM chi_tiet_don_hang ct
             JOIN don_hang dh ON ct.ma_don_hang = dh.ma_don_hang
             JOIN mon_an m ON ct.ma_mon = m.ma_mon
             WHERE dh.ma_nguoi_dung = ?`,
            [userId]
        );
        const userDishes = userOrders.map(o => o.ma_mon);

        console.log(`📊 User ${userId} đã mua ${userDishes.length} món:`);
        userOrders.forEach(o => console.log(`   - ${o.ten_mon} (ID: ${o.ma_mon})`));

        console.log(`\n✅ User đã mua "Cơm chiên tỏi trứng"? ${userDishes.includes(comChienId) ? 'CÓ' : 'KHÔNG'}`);
        console.log(`✅ User đã mua "Khô lù đù 1 nắng"? ${userDishes.includes(khoLuId) ? 'CÓ' : 'KHÔNG'}\n`);

        // 2. Kiểm tra trạng thái 2 món
        const [dishes] = await conn.query(
            `SELECT m.ma_mon, m.ten_mon, m.trang_thai, COALESCE(AVG(dg.so_sao), 4.0) as avg_rating, COUNT(dg.ma_danh_gia) as review_count
             FROM mon_an m
             LEFT JOIN danh_gia_san_pham dg ON m.ma_mon = dg.ma_mon AND dg.trang_thai = 'approved'
             WHERE m.ma_mon IN (?, ?)
             GROUP BY m.ma_mon, m.ten_mon, m.trang_thai`,
            [comChienId, khoLuId]
        );

        console.log('📋 Thông tin 2 món:');
        dishes.forEach(d => {
            const avgRating = parseFloat(d.avg_rating).toFixed(1);
            const passRating = d.avg_rating >= 3.0;
            const isActive = d.trang_thai === 1;
            console.log(`\n   ${d.ten_mon} (ID: ${d.ma_mon})`);
            console.log(`      - Trạng thái: ${isActive ? '✅ Hoạt động' : '❌ Không hoạt động'}`);
            console.log(`      - Đánh giá: ${avgRating}/5 sao (${d.review_count} đánh giá)`);
            console.log(`      - Đạt >= 3.0: ${passRating ? '✅ CÓ' : '❌ KHÔNG'}`);
        });

        // 3. Query như trong getContentBasedRecommendations (không lọc khẩu vị)
        console.log(`\n\n🔍 Query tất cả món (không lọc khẩu vị):`);
        
        let query = `
            SELECT m.ma_mon, m.ten_mon, AVG(dg.so_sao) as avg_rating
            FROM mon_an m
            LEFT JOIN danh_gia_san_pham dg ON m.ma_mon = dg.ma_mon AND dg.trang_thai = 'approved'
            WHERE m.trang_thai = 1
        `;
        
        if (userDishes.length > 0) {
            query += ` AND m.ma_mon NOT IN (?)`;
        }
        
        query += ` GROUP BY m.ma_mon, m.ten_mon
                   HAVING avg_rating IS NULL OR avg_rating >= 3.0
                   ORDER BY COALESCE(avg_rating, 4.0) DESC`;
        
        const params = userDishes.length > 0 ? [userDishes] : [];
        const [allDishes] = await conn.query(query, params);

        const comChienInAll = allDishes.find(d => d.ma_mon === comChienId);
        const khoLuInAll = allDishes.find(d => d.ma_mon === khoLuId);

        console.log(`   Tổng số món đủ điều kiện: ${allDishes.length}`);
        console.log(`   ✅ "Cơm chiên tỏi trứng" trong danh sách? ${comChienInAll ? 'CÓ' : 'KHÔNG'}`);
        console.log(`   ✅ "Khô lù đù 1 nắng" trong danh sách? ${khoLuInAll ? 'CÓ' : 'KHÔNG'}`);

        // 4. KẾT LUẬN
        console.log('\n\n' + '='.repeat(60));
        console.log('📋 KẾT LUẬN:');
        console.log('='.repeat(60));

        if (!comChienInAll) {
            console.log('❌ "Cơm chiên tỏi trứng" KHÔNG XUẤT HIỆN vì:');
            if (userDishes.includes(comChienId)) {
                console.log('   → User đã mua món này rồi');
            } else {
                const dish = dishes.find(d => d.ma_mon === comChienId);
                if (dish && dish.trang_thai !== 1) {
                    console.log('   → Món không hoạt động (trang_thai != 1)');
                } else if (dish && dish.avg_rating < 3.0) {
                    console.log(`   → Đánh giá < 3.0 sao (${dish.avg_rating})`);
                } else {
                    console.log('   → Không rõ nguyên nhân (cần kiểm tra thêm)');
                }
            }
        } else {
            console.log('✅ "Cơm chiên tỏi trứng" CÓ trong content-based!');
        }

        console.log('');

        if (!khoLuInAll) {
            console.log('❌ "Khô lù đù 1 nắng" KHÔNG XUẤT HIỆN vì:');
            if (userDishes.includes(khoLuId)) {
                console.log('   → User đã mua món này rồi');
            } else {
                const dish = dishes.find(d => d.ma_mon === khoLuId);
                if (dish && dish.trang_thai !== 1) {
                    console.log('   → Món không hoạt động (trang_thai != 1)');
                } else if (dish && dish.avg_rating < 3.0) {
                    console.log(`   → Đánh giá < 3.0 sao (${dish.avg_rating})`);
                } else {
                    console.log('   → Không rõ nguyên nhân (cần kiểm tra thêm)');
                }
            }
        } else {
            console.log('✅ "Khô lù đù 1 nắng" CÓ trong content-based!');
        }

        console.log('\n✅ Kiểm tra hoàn tất!');

    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        await conn.end();
    }
}

checkWhy().catch(console.error);
