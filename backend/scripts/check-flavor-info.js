/**
 * Script: Kiểm tra thông tin khẩu vị
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'amthuc_phuongnam';

async function checkFlavorInfo() {
    const conn = await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASS,
        database: DB_NAME
    });

    console.log('🔍 ====== KIỂM TRA KHẨU VỊ ======\n');

    try {
        // 1. Khẩu vị ID 6
        const [flavor6] = await conn.query('SELECT * FROM thuoc_tinh_khau_vi WHERE id = 6');
        console.log('📌 Khẩu vị ID 6 (preference của user):');
        console.log(flavor6[0]);

        // 2. Khẩu vị của "Khô lù đù 1 nắng"
        console.log('\n📌 Khẩu vị của "Khô lù đù 1 nắng" (ID: 29):');
        const [khoLuFlavors] = await conn.query(`
            SELECT mk.id_thuoc_tinh, f.ten_thuoc_tinh
            FROM mon_an_khau_vi mk
            JOIN thuoc_tinh_khau_vi f ON mk.id_thuoc_tinh = f.id
            WHERE mk.ma_mon = 29
        `);
        console.log(khoLuFlavors);

        // 3. Khẩu vị của "Cơm chiên tỏi trứng"
        console.log('\n📌 Khẩu vị của "Cơm chiên tỏi trứng" (ID: 33):');
        const [comChienFlavors] = await conn.query(`
            SELECT mk.id_thuoc_tinh, f.ten_thuoc_tinh
            FROM mon_an_khau_vi mk
            JOIN thuoc_tinh_khau_vi f ON mk.id_thuoc_tinh = f.id
            WHERE mk.ma_mon = 33
        `);
        console.log(comChienFlavors);

        // 4. Tất cả khẩu vị
        console.log('\n📋 TẤT CẢ KHẨU VỊ:');
        const [allFlavors] = await conn.query('SELECT * FROM thuoc_tinh_khau_vi ORDER BY id');
        allFlavors.forEach(f => {
            console.log(`   ID ${f.id}: ${f.ten_thuoc_tinh}`);
        });

    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        await conn.end();
    }
}

checkFlavorInfo().catch(console.error);
