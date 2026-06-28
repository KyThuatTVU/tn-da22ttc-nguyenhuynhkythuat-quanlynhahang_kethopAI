/**
 * Script Debug: Tại sao "Cơm chiên tỏi trứng" không xuất hiện trong gợi ý cho "Đỗ Thiên Vũ"
 * 
 * Chạy: node backend/scripts/debug-recommendation-issue.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'amthuc_phuongnam';

async function debugRecommendation() {
    const conn = await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASS,
        database: DB_NAME
    });

    console.log('🔍 ====== DEBUG GỢI Ý CHO ĐỖ THIÊN VŨ ======\n');

    try {
        // 1. Tìm user "Đỗ Thiên Vũ"
        const [users] = await conn.query(
            `SELECT ma_nguoi_dung, ten_nguoi_dung, so_dien_thoai 
             FROM nguoi_dung 
             WHERE LOWER(ten_nguoi_dung) LIKE '%vũ%' OR LOWER(ten_nguoi_dung) LIKE '%vu%'`
        );
        
        if (users.length === 0) {
            console.log('❌ Không tìm thấy user "Đỗ Thiên Vũ"');
            await conn.end();
            return;
        }

        console.log('👤 Users tìm thấy:');
        users.forEach(u => {
            console.log(`   - ID: ${u.ma_nguoi_dung}, Tên: ${u.ten_nguoi_dung}, SĐT: ${u.so_dien_thoai}`);
        });

        const userId = users[0].ma_nguoi_dung;
        console.log(`\n✅ Chọn user ID: ${userId} (${users[0].ten_nguoi_dung})\n`);

        // 2. Tìm món "Cơm chiên tỏi trứng" và "Khô lù đù 1 nắng"
        const [dishes] = await conn.query(
            `SELECT ma_mon, ten_mon, trang_thai, gia_tien, ma_danh_muc
             FROM mon_an 
             WHERE LOWER(ten_mon) LIKE '%cơm chiên%' OR LOWER(ten_mon) LIKE '%khô lù%'`
        );

        console.log('🍽️  Món ăn liên quan:');
        dishes.forEach(d => {
            console.log(`   - ID: ${d.ma_mon}, Tên: ${d.ten_mon}, Trạng thái: ${d.trang_thai}`);
        });

        const comChienId = dishes.find(d => d.ten_mon.toLowerCase().includes('cơm chiên'))?.ma_mon;
        const khoLuId = dishes.find(d => d.ten_mon.toLowerCase().includes('khô lù'))?.ma_mon;

        if (!comChienId || !khoLuId) {
            console.log('\n❌ Không tìm thấy đầy đủ 2 món');
            await conn.end();
            return;
        }

        console.log(`\n📌 Cơm chiên tỏi trứng: ID = ${comChienId}`);
        console.log(`📌 Khô lù đù 1 nắng: ID = ${khoLuId}\n`);

        // 3. Kiểm tra user đã mua món nào
        const [userPurchases] = await conn.query(
            `SELECT DISTINCT ct.ma_mon, m.ten_mon
             FROM chi_tiet_don_hang ct
             JOIN don_hang dh ON ct.ma_don_hang = dh.ma_don_hang
             JOIN mon_an m ON ct.ma_mon = m.ma_mon
             WHERE dh.ma_nguoi_dung = ?`,
            [userId]
        );

        console.log(`📊 User đã mua ${userPurchases.length} món:`);
        userPurchases.forEach(p => {
            console.log(`   - ${p.ten_mon} (ID: ${p.ma_mon})`);
        });

        const userDishIds = userPurchases.map(p => p.ma_mon);
        const daMuaComChien = userDishIds.includes(comChienId);
        const daMuaKhoLu = userDishIds.includes(khoLuId);

        console.log(`\n✅ Đã mua "Cơm chiên tỏi trứng": ${daMuaComChien ? 'CÓ' : 'KHÔNG'}`);
        console.log(`✅ Đã mua "Khô lù đù 1 nắng": ${daMuaKhoLu ? 'CÓ' : 'KHÔNG'}\n`);

        // 4. Kiểm tra đánh giá của 2 món
        const [ratings] = await conn.query(
            `SELECT 
                m.ma_mon,
                m.ten_mon,
                COALESCE(AVG(dg.so_sao), 4.0) as avg_rating,
                COUNT(dg.ma_danh_gia) as review_count
             FROM mon_an m
             LEFT JOIN danh_gia_san_pham dg ON m.ma_mon = dg.ma_mon AND dg.trang_thai = 'approved'
             WHERE m.ma_mon IN (?, ?)
             GROUP BY m.ma_mon, m.ten_mon`,
            [comChienId, khoLuId]
        );

        console.log('⭐ Đánh giá của 2 món:');
        ratings.forEach(r => {
            const rating = parseFloat(r.avg_rating).toFixed(1);
            const passFilter = r.avg_rating >= 3.0;
            console.log(`   - ${r.ten_mon}: ${rating}/5 sao (${r.review_count} đánh giá) ${passFilter ? '✅ Đạt >= 3.0' : '❌ < 3.0'}`);
        });

        // 5. Tìm Similar Users
        console.log('\n🤝 Tìm Similar Users...');
        const [similarUsers] = await conn.query(
            `SELECT 
                dh.ma_nguoi_dung, 
                ct.ma_mon,
                COALESCE(dg.so_sao, 3) as rating
             FROM chi_tiet_don_hang ct
             JOIN don_hang dh ON ct.ma_don_hang = dh.ma_don_hang
             LEFT JOIN danh_gia_san_pham dg ON dg.ma_mon = ct.ma_mon AND dg.ma_nguoi_dung = dh.ma_nguoi_dung
             WHERE ct.ma_mon IN (?) AND dh.ma_nguoi_dung != ? AND dh.ma_nguoi_dung IS NOT NULL
             GROUP BY dh.ma_nguoi_dung, ct.ma_mon, dg.so_sao`,
            [userDishIds, userId]
        );

        // Đếm số món chung
        const userSimilarities = {};
        similarUsers.forEach(row => {
            if (!userSimilarities[row.ma_nguoi_dung]) {
                userSimilarities[row.ma_nguoi_dung] = { count: 0, dishes: [] };
            }
            userSimilarities[row.ma_nguoi_dung].count++;
            userSimilarities[row.ma_nguoi_dung].dishes.push(row.ma_mon);
        });

        const topSimilarUsers = Object.entries(userSimilarities)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5);

        console.log(`   Tìm thấy ${topSimilarUsers.length} similar users:`);
        topSimilarUsers.forEach(([uid, data]) => {
            console.log(`   - User ${uid}: ${data.count} món chung`);
        });

        if (topSimilarUsers.length === 0) {
            console.log('\n❌ KHÔNG CÓ SIMILAR USERS → Không có collaborative recommendations!');
            await conn.end();
            return;
        }

        const similarUserIds = topSimilarUsers.map(([uid]) => parseInt(uid));

        // 6. Kiểm tra xem Similar Users có mua 2 món không
        const [similarUserPurchases] = await conn.query(
            `SELECT DISTINCT ct.ma_mon, m.ten_mon, COUNT(DISTINCT dh.ma_nguoi_dung) as user_count
             FROM chi_tiet_don_hang ct
             JOIN don_hang dh ON ct.ma_don_hang = dh.ma_don_hang
             JOIN mon_an m ON ct.ma_mon = m.ma_mon
             WHERE dh.ma_nguoi_dung IN (?) AND ct.ma_mon IN (?, ?)
             GROUP BY ct.ma_mon, m.ten_mon`,
            [similarUserIds, comChienId, khoLuId]
        );

        console.log('\n📊 Similar Users đã mua:');
        similarUserPurchases.forEach(p => {
            console.log(`   - ${p.ten_mon}: ${p.user_count} người đã mua`);
        });

        const similarUsersMuaComChien = similarUserPurchases.find(p => p.ma_mon === comChienId);
        const similarUsersMuaKhoLu = similarUserPurchases.find(p => p.ma_mon === khoLuId);

        console.log(`\n✅ Similar users mua "Cơm chiên tỏi trứng": ${similarUsersMuaComChien ? similarUsersMuaComChien.user_count + ' người' : '0 người'}`);
        console.log(`✅ Similar users mua "Khô lù đù 1 nắng": ${similarUsersMuaKhoLu ? similarUsersMuaKhoLu.user_count + ' người' : '0 người'}`);

        // 7. Kiểm tra khẩu vị preference
        const [flavorPrefs] = await conn.query(
            `SELECT id_thuoc_tinh FROM so_thich_khau_vi_nguoi_dung WHERE ma_nguoi_dung = ?`,
            [userId]
        );

        console.log(`\n🎯 Khẩu vị preference của user: ${flavorPrefs.length > 0 ? flavorPrefs.map(f => f.id_thuoc_tinh).join(', ') : 'KHÔNG CÓ'}`);

        if (flavorPrefs.length > 0) {
            const flavorIds = flavorPrefs.map(f => f.id_thuoc_tinh);
            const [dishFlavors] = await conn.query(
                `SELECT 
                    m.ma_mon,
                    m.ten_mon,
                    GROUP_CONCAT(mk.id_thuoc_tinh) as flavor_ids,
                    GROUP_CONCAT(f.ten_thuoc_tinh SEPARATOR ', ') as flavor_names
                 FROM mon_an m
                 JOIN mon_an_khau_vi mk ON m.ma_mon = mk.ma_mon
                 LEFT JOIN thuoc_tinh_khau_vi f ON mk.id_thuoc_tinh = f.id
                 WHERE m.ma_mon IN (?, ?)
                 GROUP BY m.ma_mon, m.ten_mon`,
                [comChienId, khoLuId]
            );

            console.log('\n🔍 Khẩu vị của 2 món:');
            dishFlavors.forEach(d => {
                const dishFlavorIds = d.flavor_ids.split(',').map(id => parseInt(id));
                const matchCount = dishFlavorIds.filter(id => flavorIds.includes(id)).length;
                const match = matchCount > 0;
                console.log(`   - ${d.ten_mon}: ${d.flavor_names || 'Không có'} ${match ? '✅ Khớp' : '❌ Không khớp'}`);
            });
        }

        // 8. KẾT LUẬN
        console.log('\n' + '='.repeat(60));
        console.log('📋 KẾT LUẬN - TẠI SAO "CƠM CHIÊN TỎI TRỨNG" KHÔNG HIỂN THỊ:');
        console.log('='.repeat(60));

        const reasons = [];

        if (daMuaComChien) {
            reasons.push('❌ User ĐÃ MUA món này rồi → Bị loại ra khỏi gợi ý');
        }

        const comChienRating = ratings.find(r => r.ma_mon === comChienId);
        if (comChienRating && comChienRating.avg_rating < 3.0) {
            reasons.push(`❌ Đánh giá < 3.0 sao (${parseFloat(comChienRating.avg_rating).toFixed(1)}/5) → Bị lọc bởi HAVING avg_rating >= 3.0`);
        }

        if (!similarUsersMuaComChien || similarUsersMuaComChien.user_count === 0) {
            reasons.push('❌ KHÔNG CÓ similar user nào mua món này → Không xuất hiện trong collaborative filtering');
        }

        if (flavorPrefs.length > 0) {
            const [dishFlavorCheck] = await conn.query(
                `SELECT COUNT(*) as has_match
                 FROM mon_an_khau_vi mk
                 WHERE mk.ma_mon = ? AND mk.id_thuoc_tinh IN (?)`,
                [comChienId, flavorPrefs.map(f => f.id_thuoc_tinh)]
            );
            if (dishFlavorCheck[0].has_match === 0) {
                reasons.push('❌ Món không khớp với khẩu vị preference của user → Bị lọc ra');
            }
        }

        if (reasons.length === 0) {
            reasons.push('✅ Không có lý do rõ ràng. Có thể do limit hoặc score thấp hơn các món khác');
        }

        reasons.forEach(r => console.log(r));

        console.log('\n' + '='.repeat(60));
        console.log('💡 ĐỀ XUẤT KHẮC PHỤC:');
        console.log('='.repeat(60));

        if (!similarUsersMuaComChien || similarUsersMuaComChien.user_count === 0) {
            console.log('1. Tăng số lượng similar users (tăng limit trong findSimilarUsersWithRatings)');
            console.log('2. Bổ sung content-based hoặc trending nếu collaborative không có kết quả');
        }

        if (comChienRating && comChienRating.avg_rating < 3.0) {
            console.log('3. Giảm ngưỡng rating xuống 2.5 hoặc 2.0 nếu muốn gợi ý đa dạng hơn');
        }

        if (flavorPrefs.length > 0) {
            console.log('4. Đảm bảo món "Cơm chiên tỏi trứng" được gắn đúng khẩu vị trong bảng mon_an_khau_vi');
        }

        console.log('\n✅ Debug hoàn tất!');

    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        await conn.end();
    }
}

debugRecommendation().catch(console.error);
