/**
 * Script: Tự động fix khẩu vị cho "Cơm chiên tỏi trứng"
 * Chạy: node backend/scripts/fix-com-chien-flavor.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'amthuc_phuongnam';

async function fixComChienFlavor() {
    const conn = await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASS,
        database: DB_NAME
    });

    console.log('🔧 ====== FIX KHẨU VỊ "CƠM CHIÊN TỎI TRỨNG" ======\n');

    try {
        const comChienId = 33;

        // 1. Kiểm tra khẩu vị hiện tại
        console.log('📊 Khẩu vị hiện tại:');
        const [currentFlavors] = await conn.query(`
            SELECT f.id, f.ten_thuoc_tinh
            FROM mon_an_khau_vi mk
            JOIN thuoc_tinh_khau_vi f ON mk.id_thuoc_tinh = f.id
            WHERE mk.ma_mon = ?
        `, [comChienId]);

        if (currentFlavors.length > 0) {
            currentFlavors.forEach(f => {
                console.log(`   - ID ${f.id}: ${f.ten_thuoc_tinh}`);
            });
        } else {
            console.log('   (Không có khẩu vị)');
        }

        // 2. Thêm khẩu vị mới
        console.log('\n🔧 Thêm khẩu vị mới...');
        
        const newFlavors = [
            { id: 3, name: '🧂 Mặn' },
            { id: 7, name: '🥩 Nhiều đạm' }
        ];

        for (const flavor of newFlavors) {
            try {
                await conn.query(
                    'INSERT IGNORE INTO mon_an_khau_vi (ma_mon, id_thuoc_tinh) VALUES (?, ?)',
                    [comChienId, flavor.id]
                );
                console.log(`   ✅ Đã thêm: ${flavor.name}`);
            } catch (err) {
                console.log(`   ⚠️  Không thể thêm ${flavor.name}: ${err.message}`);
            }
        }

        // 3. Kiểm tra lại sau khi fix
        console.log('\n📊 Khẩu vị sau khi fix:');
        const [updatedFlavors] = await conn.query(`
            SELECT f.id, f.ten_thuoc_tinh
            FROM mon_an_khau_vi mk
            JOIN thuoc_tinh_khau_vi f ON mk.id_thuoc_tinh = f.id
            WHERE mk.ma_mon = ?
            ORDER BY f.id
        `, [comChienId]);

        updatedFlavors.forEach(f => {
            console.log(`   - ID ${f.id}: ${f.ten_thuoc_tinh}`);
        });

        console.log('\n✅ Fix hoàn tất!');
        console.log('\n💡 Gợi ý tiếp theo:');
        console.log('   1. Chạy lại debug script để kiểm tra:');
        console.log('      node backend/scripts/debug-recommendation-issue.js');
        console.log('   2. Test API recommendations:');
        console.log('      curl -H "Authorization: Bearer <token>" http://localhost:3000/api/recommendations?limit=50');

    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        await conn.end();
    }
}

fixComChienFlavor().catch(console.error);
