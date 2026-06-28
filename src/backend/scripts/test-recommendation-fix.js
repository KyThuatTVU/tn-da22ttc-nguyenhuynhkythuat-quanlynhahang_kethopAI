/**
 * Script: Test xem "Cơm chiên tỏi trứng" đã xuất hiện trong gợi ý chưa
 * Chạy: node backend/scripts/test-recommendation-fix.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'amthuc_phuongnam';

// Import các hàm gợi ý (giống như trong recommendation.js)
async function getContentBasedRecommendations(userId, limit, preferredFlavorIds, conn) {
    try {
        let favoriteFlavors = preferredFlavorIds || [];
        
        // Lấy các món user chưa mua
        const [userOrders] = await conn.query(
            `SELECT DISTINCT ct.ma_mon 
             FROM chi_tiet_don_hang ct
             JOIN don_hang dh ON ct.ma_don_hang = dh.ma_don_hang
             WHERE dh.ma_nguoi_dung = ?`,
            [userId]
        );
        const userDishes = userOrders.map(o => o.ma_mon);
        
        let recommendations = [];
        if (favoriteFlavors.length > 0) {
            let query = `
                SELECT m.*, d.ten_danh_muc, AVG(dg.so_sao) as avg_rating,
                       COUNT(dg.ma_danh_gia) as review_count,
                       GROUP_CONCAT(DISTINCT f.ten_thuoc_tinh SEPARATOR ', ') as flavor_names
                FROM mon_an m
                LEFT JOIN danh_muc d ON m.ma_danh_muc = d.ma_danh_muc
                JOIN mon_an_khau_vi mk ON m.ma_mon = mk.ma_mon
                LEFT JOIN thuoc_tinh_khau_vi f ON mk.id_thuoc_tinh = f.id
                LEFT JOIN danh_gia_san_pham dg ON m.ma_mon = dg.ma_mon AND dg.trang_thai = 'approved'
                WHERE m.trang_thai = 1 AND mk.id_thuoc_tinh IN (?)
            `;
            const params = [favoriteFlavors];
            
            if (userDishes.length > 0) {
                query += ` AND m.ma_mon NOT IN (?)`;
                params.push(userDishes);
            }
            
            query += ` GROUP BY m.ma_mon 
                       HAVING avg_rating IS NULL OR avg_rating >= 3.0
                       ORDER BY COALESCE(avg_rating, 4.0) DESC
                       LIMIT ?`;
            params.push(limit * 2);
            
            const [res] = await conn.query(query, params);
            recommendations = res;
        }
        
        // Nếu không đủ món, lấy thêm món chung
        if (recommendations.length < limit) {
            const excludedIds = [...userDishes, ...recommendations.map(r => r.ma_mon)];
            let query = `
                SELECT m.*, d.ten_danh_muc, AVG(dg.so_sao) as avg_rating
                FROM mon_an m
                LEFT JOIN danh_muc d ON m.ma_danh_muc = d.ma_danh_muc
                LEFT JOIN danh_gia_san_pham dg ON m.ma_mon = dg.ma_mon AND dg.trang_thai = 'approved'
                WHERE m.trang_thai = 1
            `;
            const params = [];
            if (excludedIds.length > 0) {
                query += ` AND m.ma_mon NOT IN (?)`;
                params.push(excludedIds);
            }
            query += ` GROUP BY m.ma_mon 
                       HAVING avg_rating IS NULL OR avg_rating >= 3.0
                       ORDER BY COALESCE(avg_rating, 4.0) DESC 
                       LIMIT ?`;
            params.push(limit - recommendations.length);
            
            const [extra] = await conn.query(query, params);
            recommendations.push(...extra);
        }
        
        return recommendations.slice(0, limit).map(r => {
            const reason = r.flavor_names 
                ? `Hợp khẩu vị của bạn (${r.flavor_names})` 
                : (r.ten_danh_muc ? `Món ngon từ danh mục ${r.ten_danh_muc}` : 'Đề xuất cho bạn');
            return {
                ...r,
                recommendation_type: 'content_based',
                reason: reason
            };
        });
    } catch (error) {
        console.error('Error getting content-based recommendations:', error.message);
        return [];
    }
}

async function testRecommendationFix() {
    const conn = await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASS,
        database: DB_NAME
    });

    console.log('🧪 ====== TEST GỢI Ý SAU KHI FIX ======\n');

    try {
        const userId = 4;  // Đỗ Thiên Vũ
        const comChienId = 33;
        const khoLuId = 29;

        // 1. Lấy preference của user
        const [prefs] = await conn.query(
            'SELECT id_thuoc_tinh FROM so_thich_khau_vi_nguoi_dung WHERE ma_nguoi_dung = ?',
            [userId]
        );
        const preferredFlavorIds = prefs.map(p => p.id_thuoc_tinh);
        
        console.log(`👤 User ID: ${userId}`);
        console.log(`🎯 Khẩu vị preference: ${preferredFlavorIds.join(', ')}\n`);

        // 2. Lấy content-based recommendations
        console.log('📊 Lấy content-based recommendations...');
        const contentBased = await getContentBasedRecommendations(userId, 50, preferredFlavorIds, conn);
        console.log(`   → Tìm thấy ${contentBased.length} món\n`);

        // 3. Lọc theo khẩu vị (LOGIC CŨ - STRICT)
        console.log('🔍 TEST LOGIC CŨ (Strict filtering):');
        const [flavorDishes] = await conn.query(
            `SELECT DISTINCT ma_mon FROM mon_an_khau_vi WHERE id_thuoc_tinh IN (?)`,
            [preferredFlavorIds]
        );
        const matchingDishIds = new Set(flavorDishes.map(fd => fd.ma_mon));
        const filteredContentOld = contentBased.filter(r => matchingDishIds.has(r.ma_mon));
        
        const hasComChienOld = filteredContentOld.some(r => r.ma_mon === comChienId);
        const hasKhoLuOld = filteredContentOld.some(r => r.ma_mon === khoLuId);
        
        console.log(`   Số món sau khi lọc: ${filteredContentOld.length}`);
        console.log(`   ✅ "Cơm chiên tỏi trứng" (ID: ${comChienId}): ${hasComChienOld ? 'CÓ ✅' : 'KHÔNG ❌'}`);
        console.log(`   ✅ "Khô lù đù 1 nắng" (ID: ${khoLuId}): ${hasKhoLuOld ? 'CÓ ✅' : 'KHÔNG ❌'}\n`);

        // 4. Logic mới (NỚI LỎNG)
        console.log('🔧 TEST LOGIC MỚI (Nới lỏng khi không đủ món):');
        let recommendations = [];
        const filteredCount = filteredContentOld.length;
        
        if (filteredCount < 10) {
            console.log(`   ⚠️  Chỉ có ${filteredCount} món sau khi lọc khẩu vị`);
            console.log(`   → Bổ sung các món không match (giảm score 50%)\n`);
            
            const nonMatchedContent = contentBased
                .filter(r => !matchingDishIds.has(r.ma_mon))
                .map((r, index) => ({ 
                    ...r, 
                    score: 100 - index * 0.5,  // Score thấp hơn
                    reason: r.reason + ' (Gợi ý đa dạng)' 
                }));
            
            filteredContentOld.forEach((r, index) => {
                r.score = 100 - index;
            });
            
            recommendations = [
                ...filteredContentOld,
                ...nonMatchedContent.slice(0, 5)
            ];
        } else {
            recommendations = filteredContentOld;
        }
        
        // Sắp xếp theo score
        recommendations.sort((a, b) => (b.score || 0) - (a.score || 0));
        
        console.log(`📋 Tổng số món sau khi áp dụng logic mới: ${recommendations.length}\n`);
        
        // 5. Kiểm tra 2 món
        const comChienInList = recommendations.find(r => r.ma_mon === comChienId);
        const khoLuInList = recommendations.find(r => r.ma_mon === khoLuId);
        
        console.log('=' .repeat(60));
        console.log('🎯 KẾT QUẢ KIỂM TRA:');
        console.log('='.repeat(60));
        
        if (comChienInList) {
            console.log(`✅ "Cơm chiên tỏi trứng" XUẤT HIỆN trong gợi ý!`);
            console.log(`   - Score: ${comChienInList.score}`);
            console.log(`   - Lý do: ${comChienInList.reason}`);
            console.log(`   - Vị trí: #${recommendations.indexOf(comChienInList) + 1}`);
        } else {
            console.log(`❌ "Cơm chiên tỏi trứng" VẪN KHÔNG XUẤT HIỆN!`);
        }
        
        console.log('');
        
        if (khoLuInList) {
            console.log(`✅ "Khô lù đù 1 nắng" XUẤT HIỆN trong gợi ý!`);
            console.log(`   - Score: ${khoLuInList.score}`);
            console.log(`   - Lý do: ${khoLuInList.reason}`);
            console.log(`   - Vị trí: #${recommendations.indexOf(khoLuInList) + 1}`);
        } else {
            console.log(`❌ "Khô lù đù 1 nắng" KHÔNG XUẤT HIỆN!`);
        }
        
        console.log('\n' + '='.repeat(60));
        
        // 6. Hiển thị top 10 gợi ý
        console.log('\n📋 TOP 10 MÓN GỢI Ý:');
        console.log('='.repeat(60));
        recommendations.slice(0, 10).forEach((r, index) => {
            const isComChien = r.ma_mon === comChienId ? ' 🎯' : '';
            const isKhoLu = r.ma_mon === khoLuId ? ' 🎯' : '';
            console.log(`${index + 1}. ${r.ten_mon}${isComChien}${isKhoLu}`);
            console.log(`   Score: ${r.score.toFixed(1)} | ${r.reason}`);
        });
        
        console.log('\n✅ Test hoàn tất!');

    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        await conn.end();
    }
}

testRecommendationFix().catch(console.error);
