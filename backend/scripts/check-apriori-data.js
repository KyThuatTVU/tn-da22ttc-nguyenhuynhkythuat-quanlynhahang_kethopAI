/**
 * Script kiểm tra dữ liệu đơn hàng để xem có đủ tạo luật Apriori hay chưa
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../config/database');

async function checkAprioriData() {
    console.log('🔍 KIỂM TRA DỮ LIỆU CHO APRIORI\n');
    console.log('='.repeat(60));

    try {
        // 1. Tổng số đơn hàng
        const [orders] = await db.query(`
            SELECT COUNT(DISTINCT ma_don_hang) as total_orders
            FROM don_hang
            WHERE trang_thai IN ('Đã thanh toán', 'Hoàn thành')
        `);
        console.log(`\n📦 Tổng số đơn hàng đã hoàn thành: ${orders[0].total_orders}`);

        // 2. Tổng số chi tiết đơn hàng
        const [orderDetails] = await db.query(`
            SELECT COUNT(*) as total_items
            FROM chi_tiet_don_hang
        `);
        console.log(`📋 Tổng số items trong chi tiết: ${orderDetails[0].total_items}`);

        // 3. Số món ăn khác nhau trong đơn hàng
        const [uniqueDishes] = await db.query(`
            SELECT COUNT(DISTINCT ma_mon) as unique_dishes
            FROM chi_tiet_don_hang
        `);
        console.log(`🍽️  Số món ăn khác nhau đã được đặt: ${uniqueDishes[0].unique_dishes}`);

        // 4. Trung bình số món/đơn
        const [avgItems] = await db.query(`
            SELECT AVG(item_count) as avg_items
            FROM (
                SELECT ma_don_hang, COUNT(*) as item_count
                FROM chi_tiet_don_hang
                GROUP BY ma_don_hang
            ) as subquery
        `);
        console.log(`📊 Trung bình món/đơn: ${parseFloat(avgItems[0].avg_items).toFixed(2)}`);

        // 5. Các món phổ biến nhất (top 10)
        const [popularDishes] = await db.query(`
            SELECT 
                m.ma_mon,
                m.ten_mon,
                COUNT(DISTINCT c.ma_don_hang) as order_count,
                COUNT(*) as total_quantity,
                ROUND(COUNT(DISTINCT c.ma_don_hang) * 100.0 / (
                    SELECT COUNT(DISTINCT ma_don_hang) 
                    FROM chi_tiet_don_hang
                ), 2) as support_percent
            FROM chi_tiet_don_hang c
            JOIN mon_an m ON c.ma_mon = m.ma_mon
            GROUP BY m.ma_mon, m.ten_mon
            ORDER BY order_count DESC
            LIMIT 10
        `);

        console.log('\n📈 TOP 10 MÓN PHỔ BIẾN NHẤT:');
        console.log('-'.repeat(60));
        popularDishes.forEach((dish, idx) => {
            console.log(`${idx + 1}. ${dish.ten_mon}`);
            console.log(`   - Số đơn: ${dish.order_count}`);
            console.log(`   - Tổng số lượng: ${dish.total_quantity}`);
            console.log(`   - Support: ${dish.support_percent}%`);
        });

        // 6. Các cặp món xuất hiện cùng nhau (co-occurrence)
        const [pairs] = await db.query(`
            SELECT 
                m1.ten_mon as mon_1,
                m2.ten_mon as mon_2,
                COUNT(DISTINCT c1.ma_don_hang) as co_occurrence,
                ROUND(COUNT(DISTINCT c1.ma_don_hang) * 100.0 / (
                    SELECT COUNT(DISTINCT ma_don_hang) 
                    FROM chi_tiet_don_hang
                ), 2) as support_percent
            FROM chi_tiet_don_hang c1
            JOIN chi_tiet_don_hang c2 ON c1.ma_don_hang = c2.ma_don_hang
            JOIN mon_an m1 ON c1.ma_mon = m1.ma_mon
            JOIN mon_an m2 ON c2.ma_mon = m2.ma_mon
            WHERE c1.ma_mon < c2.ma_mon
            GROUP BY c1.ma_mon, c2.ma_mon, m1.ten_mon, m2.ten_mon
            HAVING co_occurrence >= 2
            ORDER BY co_occurrence DESC, support_percent DESC
            LIMIT 15
        `);

        console.log('\n🔗 CÁC CẶP MÓN XUẤT HIỆN CÙNG NHAU (≥ 2 lần):');
        console.log('-'.repeat(60));
        if (pairs.length > 0) {
            pairs.forEach((pair, idx) => {
                console.log(`${idx + 1}. "${pair.mon_1}" + "${pair.mon_2}"`);
                console.log(`   - Xuất hiện cùng: ${pair.co_occurrence} đơn`);
                console.log(`   - Support: ${pair.support_percent}%`);
            });
        } else {
            console.log('⚠️  KHÔNG có cặp món nào xuất hiện cùng nhau >= 2 lần');
        }

        // 7. Phân tích Confidence ước tính (A → B)
        console.log('\n📊 ƯỚC TÍNH CONFIDENCE CHO CÁC LUẬT (A → B):');
        console.log('-'.repeat(60));

        if (pairs.length > 0) {
            // Lấy 5 cặp phổ biến nhất để phân tích
            for (let i = 0; i < Math.min(5, pairs.length); i++) {
                const pair = pairs[i];
                
                // Tính confidence cho A → B
                const [countA] = await db.query(`
                    SELECT COUNT(DISTINCT ma_don_hang) as count_a
                    FROM chi_tiet_don_hang c
                    JOIN mon_an m ON c.ma_mon = m.ma_mon
                    WHERE m.ten_mon = ?
                `, [pair.mon_1]);

                const [countB] = await db.query(`
                    SELECT COUNT(DISTINCT ma_don_hang) as count_b
                    FROM chi_tiet_don_hang c
                    JOIN mon_an m ON c.ma_mon = m.ma_mon
                    WHERE m.ten_mon = ?
                `, [pair.mon_2]);

                const countAB = pair.co_occurrence;
                const confidenceAtoB = (countAB / countA[0].count_a * 100).toFixed(1);
                const confidenceBtoA = (countAB / countB[0].count_b * 100).toFixed(1);

                console.log(`\n${i + 1}. "${pair.mon_1}" → "${pair.mon_2}"`);
                console.log(`   Confidence: ${confidenceAtoB}% (${countAB}/${countA[0].count_a})`);
                console.log(`   "${pair.mon_2}" → "${pair.mon_1}"`);
                console.log(`   Confidence: ${confidenceBtoA}% (${countAB}/${countB[0].count_b})`);
            }
        }

        // 8. Kết luận và khuyến nghị
        console.log('\n' + '='.repeat(60));
        console.log('📋 KẾT LUẬN:');
        console.log('='.repeat(60));

        const totalOrders = orders[0].total_orders;
        const uniqueDishCount = uniqueDishes[0].unique_dishes;
        const avgItemsPerOrder = parseFloat(avgItems[0].avg_items);

        if (totalOrders < 10) {
            console.log('❌ DỮ LIỆU KHÔNG ĐỦ - Quá ít đơn hàng');
            console.log(`   Hiện tại: ${totalOrders} đơn`);
            console.log(`   Cần thiểu: 10-20 đơn`);
            console.log(`   Khuyến nghị: 50+ đơn để có luật tốt`);
        } else if (totalOrders < 30) {
            console.log('⚠️  DỮ LIỆU TỐI THIỂU - Có thể tạo luật nhưng chưa tốt');
            console.log(`   Hiện tại: ${totalOrders} đơn`);
            console.log(`   Khuyến nghị: Đợi thêm 20-30 đơn nữa`);
            console.log(`   Ngưỡng đề xuất: min_support=1%, min_confidence=20%`);
        } else if (totalOrders < 100) {
            console.log('✅ DỮ LIỆU ĐỦ - Có thể tạo luật Apriori');
            console.log(`   Hiện tại: ${totalOrders} đơn`);
            console.log(`   Ngưỡng đề xuất: min_support=1.5%, min_confidence=30%`);
            console.log(`   Chất lượng: Trung bình`);
        } else {
            console.log('✅ DỮ LIỆU TỐT - Đủ để tạo luật Apriori chất lượng cao');
            console.log(`   Hiện tại: ${totalOrders} đơn`);
            console.log(`   Ngưỡng đề xuất: min_support=2%, min_confidence=40-50%`);
            console.log(`   Chất lượng: Cao`);
        }

        if (avgItemsPerOrder < 2) {
            console.log('\n⚠️  CẢNH BÁO: Trung bình món/đơn < 2');
            console.log('   → Khách thường chỉ đặt 1 món → Khó tìm luật kết hợp');
            console.log('   → Cần khuyến khích combo, gợi ý món kèm');
        }

        if (pairs.length === 0) {
            console.log('\n❌ KHÔNG THỂ TẠO LUẬT - Không có cặp món nào xuất hiện cùng >= 2 lần');
            console.log('   → Cần thêm dữ liệu đơn hàng');
        } else if (pairs.length < 5) {
            console.log(`\n⚠️  Chỉ có ${pairs.length} cặp món xuất hiện cùng nhau`);
            console.log('   → Số luật sẽ ít, cần thêm dữ liệu');
        } else {
            console.log(`\n✅ Có ${pairs.length}+ cặp món xuất hiện cùng nhau`);
            console.log('   → Có thể tạo luật Apriori');
        }

        console.log('\n💡 HÀNH ĐỘNG TIẾP THEO:');
        if (totalOrders >= 10 && pairs.length >= 3) {
            console.log('1. Chạy train model Apriori:');
            console.log('   cd ai_service');
            console.log('   python apriori_service.py');
            console.log('\n2. Hoặc qua Admin UI:');
            console.log('   http://localhost/admin/apriori-rules.html');
            console.log('   Click "Train lại Model"');
        } else {
            console.log('1. Thu thập thêm dữ liệu đơn hàng');
            console.log('2. Khuyến khích khách đặt nhiều món (combo, promotion)');
            console.log('3. Đợi đạt ít nhất 20-30 đơn hàng');
        }

        console.log('\n' + '='.repeat(60));

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        process.exit(0);
    }
}

// Chạy script
checkAprioriData();
