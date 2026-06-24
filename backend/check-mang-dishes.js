const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDishes() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    console.log('Querying all dishes containing "măng" or "mang"...');
    const [rows] = await connection.query(`
        SELECT ma_mon, ten_mon, gia_tien, trang_thai 
        FROM mon_an 
        WHERE ten_mon LIKE '%măng%' OR ten_mon LIKE '%mang%'
    `);

    console.log(`Found ${rows.length} dishes:`);
    rows.forEach(r => {
        console.log(`- [#${r.ma_mon}] "${r.ten_mon}" | Price: ${r.gia_tien} | Status: ${r.trang_thai}`);
    });

    await connection.end();
}

checkDishes().catch(console.error);
