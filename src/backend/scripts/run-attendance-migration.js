const db = require('../config/database');

async function runMigration() {
    try {
        console.log('🚀 Running attendance table schema updates...');
        
        const alterQueries = [
            "ALTER TABLE cham_cong ADD COLUMN anh_cham_cong VARCHAR(255) COMMENT 'Ảnh check-in'",
            "ALTER TABLE cham_cong ADD COLUMN anh_checkout VARCHAR(255) COMMENT 'Ảnh check-out'",
            "ALTER TABLE cham_cong ADD COLUMN latitude DECIMAL(10, 8) COMMENT 'Vĩ độ check-in'",
            "ALTER TABLE cham_cong ADD COLUMN longitude DECIMAL(11, 8) COMMENT 'Kinh độ check-in'",
            "ALTER TABLE cham_cong ADD COLUMN latitude_out DECIMAL(10, 8) COMMENT 'Vĩ độ check-out'",
            "ALTER TABLE cham_cong ADD COLUMN longitude_out DECIMAL(11, 8) COMMENT 'Kinh độ check-out'",
            "ALTER TABLE cham_cong ADD COLUMN loai ENUM('checkin', 'checkout', 'manual') DEFAULT 'manual' COMMENT 'Loại chấm công'",
            "ALTER TABLE cham_cong ADD INDEX idx_nhan_vien_ngay (ma_nhan_vien, ngay)",
            "ALTER TABLE cham_cong ADD INDEX idx_ngay (ngay)"
        ];

        for (const query of alterQueries) {
            console.log(`⏳ Executing: ${query}`);
            try {
                await db.query(query);
                console.log('✅ Success');
            } catch (err) {
                // Ignore errors related to duplicate columns or indexes
                if (
                    err.code === 'ER_DUP_FIELDNAME' || 
                    err.message.includes('Duplicate column') || 
                    err.code === 'ER_DUP_KEYNAME' || 
                    err.message.includes('Duplicate key name')
                ) {
                    console.log('⚠️ Already exists, skipping...');
                } else {
                    console.error(`❌ Failed: ${err.message}`);
                    throw err;
                }
            }
        }

        console.log('🎉 Attendance schema updates completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
