const db = require('../backend/config/database');

async function createTable() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS so_thich_nguoi_dung (
              ma_nguoi_dung int,
              ma_danh_muc int,
              PRIMARY KEY (ma_nguoi_dung, ma_danh_muc),
              FOREIGN KEY (ma_nguoi_dung) REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE,
              FOREIGN KEY (ma_danh_muc) REFERENCES danh_muc(ma_danh_muc) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);
        console.log('Created so_thich_nguoi_dung table successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}
createTable();
