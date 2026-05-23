const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function addGPSSettings() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'restaurant_db'
    });

    try {
        console.log('🚀 Bắt đầu thêm cài đặt GPS...');

        // Thêm các cài đặt GPS
        const gpsSettings = [
            {
                key: 'latitude',
                value: '9.9234',
                description: 'Vĩ độ GPS của nhà hàng (Đại học Trà Vinh)'
            },
            {
                key: 'longitude',
                value: '106.3465',
                description: 'Kinh độ GPS của nhà hàng (Đại học Trà Vinh)'
            },
            {
                key: 'radius',
                value: '500',
                description: 'Bán kính cho phép chấm công (mét)'
            }
        ];

        for (const setting of gpsSettings) {
            await connection.query(
                `INSERT INTO cai_dat (setting_key, setting_value, mo_ta) 
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                    setting_value = VALUES(setting_value),
                    mo_ta = VALUES(mo_ta)`,
                [setting.key, setting.value, setting.description]
            );
            console.log(`✅ Đã thêm/cập nhật: ${setting.key} = ${setting.value}`);
        }

        // Cập nhật địa chỉ mặc định
        await connection.query(
            `UPDATE cai_dat 
             SET setting_value = ? 
             WHERE setting_key = 'dia_chi'`,
            ['Trường Đại học Trà Vinh, 126 Nguyễn Thiện Thành, Phường 5, TP. Trà Vinh']
        );
        console.log('✅ Đã cập nhật địa chỉ mặc định thành TVU');

        // Kiểm tra kết quả
        const [results] = await connection.query(
            `SELECT * FROM cai_dat WHERE setting_key IN ('latitude', 'longitude', 'radius', 'dia_chi')`
        );

        console.log('\n📍 Cài đặt GPS hiện tại:');
        results.forEach(row => {
            console.log(`   ${row.setting_key}: ${row.setting_value}`);
        });

        console.log('\n✨ Hoàn thành! Hệ thống đã được cấu hình với tọa độ Đại học Trà Vinh');
        console.log('📌 Tọa độ: 9.9234, 106.3465');
        console.log('📏 Bán kính cho phép: 500m');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

// Chạy script
addGPSSettings()
    .then(() => {
        console.log('\n🎉 Script hoàn tất!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n💥 Script thất bại:', error);
        process.exit(1);
    });
