const db = require('./config/database');

async function main() {
    try {
        const today = new Date().toISOString().split('T')[0];
        console.log("Today is:", today);

        const [attendance] = await db.query(
            `SELECT c.*, n.ten_nhan_vien 
             FROM cham_cong c 
             JOIN nhan_vien n ON c.ma_nhan_vien = n.ma_nhan_vien 
             WHERE c.ngay = ?`,
            [today]
        );
        console.log("--- Today's Attendance ---");
        console.log(attendance);

        const [shifts] = await db.query(
            `SELECT p.*, n.ten_nhan_vien, c.ten_ca, c.gio_bat_dau, c.gio_ket_thuc 
             FROM phan_ca p 
             JOIN nhan_vien n ON p.ma_nhan_vien = n.ma_nhan_vien 
             JOIN ca_lam_viec c ON p.ma_ca = c.ma_ca
             WHERE p.ngay = ?`,
            [today]
        );
        console.log("--- Today's Shifts ---");
        console.log(shifts);

    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        process.exit(0);
    }
}
main();
