require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function cleanup() {
    const db = await mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'amthuc_phuongnam',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        console.log('🧹 STARTING CLEANUP OF TEST DISHES AND USERS...');
        
        // Find dish IDs to delete
        const [dishes] = await db.query(`
            SELECT ma_mon, ten_mon FROM mon_an 
            WHERE ten_mon LIKE '%TEST%' OR ten_mon LIKE '%Zzz%'
        `);
        
        if (dishes.length > 0) {
            const dishIds = dishes.map(d => d.ma_mon);
            console.log(`   - Found ${dishes.length} test dishes:`, dishes.map(d => `[${d.ma_mon}] ${d.ten_mon}`));
            
            // Delete from mon_an_khau_vi
            await db.query('DELETE FROM mon_an_khau_vi WHERE ma_mon IN (?)', [dishIds]);
            console.log('   ✅ Deleted from mon_an_khau_vi');
            
            // Delete from mon_an
            await db.query('DELETE FROM mon_an WHERE ma_mon IN (?)', [dishIds]);
            console.log('   ✅ Deleted from mon_an');
        } else {
            console.log('   - No test dishes found.');
        }

        // Clean up test users
        const [users] = await db.query(`
            SELECT ma_nguoi_dung, email FROM nguoi_dung 
            WHERE email = 'test_cay_user@test.com'
        `);

        if (users.length > 0) {
            const userIds = users.map(u => u.ma_nguoi_dung);
            console.log(`   - Found ${users.length} test users:`, users.map(u => u.email));
            
            // Delete from so_thich_khau_vi_nguoi_dung
            await db.query('DELETE FROM so_thich_khau_vi_nguoi_dung WHERE ma_nguoi_dung IN (?)', [userIds]);
            console.log('   ✅ Deleted from so_thich_khau_vi_nguoi_dung');
            
            // Delete from nguoi_dung
            await db.query('DELETE FROM nguoi_dung WHERE ma_nguoi_dung IN (?)', [userIds]);
            console.log('   ✅ Deleted from nguoi_dung');
        } else {
            console.log('   - No test users found.');
        }
        
        console.log('✅ CLEANUP COMPLETE!');
        process.exit(0);
    } catch (error) {
        console.error('❌ CLEANUP ERROR:', error.message);
        process.exit(1);
    }
}

cleanup();
