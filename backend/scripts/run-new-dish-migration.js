/**
 * Script: Chạy migration thêm cột ngay_tao cho bảng mon_an
 * Usage: node backend/scripts/run-new-dish-migration.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'amthuc_phuongnam'
    });

    try {
        console.log('🔄 Đang chạy migration add-new-dish-tracking.sql...\n');
        
        // Kiểm tra cột đã tồn tại chưa
        const [existingColumns] = await connection.query(`
            SHOW COLUMNS FROM mon_an LIKE 'ngay_tao'
        `);
        
        if (existingColumns.length > 0) {
            console.log('⚠️  Cột ngay_tao đã tồn tại. Skip migration.');
            console.log('✅ Migration đã được chạy trước đó.\n');
            
            // Chỉ kiểm tra kết quả
            const [result] = await connection.query(`
                SELECT 
                    COUNT(*) as total_dishes,
                    SUM(CASE WHEN DATEDIFF(NOW(), ngay_tao) <= 30 THEN 1 ELSE 0 END) as new_dishes_count,
                    SUM(CASE WHEN ngay_tao IS NULL THEN 1 ELSE 0 END) as null_count
                FROM mon_an
            `);
            
            console.log('📊 Trạng thái hiện tại:');
            console.log(`   - Tổng số món: ${result[0].total_dishes}`);
            console.log(`   - Món mới (≤30 ngày): ${result[0].new_dishes_count}`);
            console.log(`   - Món chưa có ngay_tao: ${result[0].null_count}`);
            
            return;
        }
        
        const sqlPath = path.join(__dirname, 'add-new-dish-tracking.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log(`📄 SQL file content length: ${sql.length} bytes\n`);
        
        // Tách các câu lệnh SQL (bỏ comment)
        const lines = sql.split('\n').filter(line => {
            const trimmed = line.trim();
            return trimmed && !trimmed.startsWith('--');
        }).join('\n');
        
        const statements = lines
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);
        
        console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
        
        if (statements.length === 0) {
            throw new Error('Không tìm thấy câu lệnh SQL nào trong file migration!');
        }
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            const preview = statement.substring(0, 100).replace(/\n/g, ' ');
            console.log(`\n${i+1}/${statements.length} 📝 Executing: ${preview}...`);
            
            try {
                const result = await connection.query(statement);
                console.log(`   ✅ Success`);
                
                // Log thêm info nếu là UPDATE
                if (statement.toUpperCase().includes('UPDATE')) {
                    console.log(`   → Affected rows: ${result[0].affectedRows || 0}`);
                }
            } catch (err) {
                console.error(`   ❌ Error: ${err.message}`);
                console.error(`   Code: ${err.code}`);
                
                // Bỏ qua lỗi duplicate index
                if (err.code === 'ER_DUP_KEYNAME') {
                    console.log(`   → Index đã tồn tại, skip`);
                } else {
                    throw err;
                }
            }
        }
        
        console.log('\n✅ Migration hoàn tất!\n');
        
        // Kiểm tra kết quả
        const [result] = await connection.query(`
            SELECT 
                COUNT(*) as total_dishes,
                SUM(CASE WHEN DATEDIFF(NOW(), ngay_tao) <= 30 THEN 1 ELSE 0 END) as new_dishes_count
            FROM mon_an
        `);
        
        console.log('📊 Kết quả:');
        console.log(`   - Tổng số món: ${result[0].total_dishes}`);
        console.log(`   - Món mới (≤30 ngày): ${result[0].new_dishes_count}`);
        
    } catch (error) {
        console.error('❌ Lỗi khi chạy migration:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

runMigration()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
