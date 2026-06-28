const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDbState() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    console.log('--- Gỏi gà măng cục anh_mon ---');
    const [rows] = await connection.query('SELECT ma_mon, ten_mon, anh_mon FROM mon_an WHERE ma_mon = 37');
    console.log(rows);

    await connection.end();
}

checkDbState().catch(console.error);
