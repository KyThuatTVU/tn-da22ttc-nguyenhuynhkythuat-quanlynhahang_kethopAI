const mysql = require('mysql2/promise');
require('dotenv').config({path: 'd:/KhoaLuanTotNghiep2026/backend/.env'});

async function run() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const [totalA] = await db.query("SELECT COUNT(DISTINCT dh.ma_don_hang) as c FROM chi_tiet_don_hang ct JOIN don_hang dh ON ct.ma_don_hang = dh.ma_don_hang WHERE ct.ma_mon = 2 AND dh.trang_thai = 'delivered'");
    console.log('Total Lẩu Cù Lao (ma_mon=2):', totalA[0].c);

    const [totalB] = await db.query("SELECT COUNT(DISTINCT dh.ma_don_hang) as c FROM chi_tiet_don_hang ct JOIN don_hang dh ON ct.ma_don_hang = dh.ma_don_hang WHERE ct.ma_mon = 38 AND dh.trang_thai = 'delivered'");
    console.log('Total Bia Corona (ma_mon=38):', totalB[0].c);

    const [totalAB] = await db.query("SELECT COUNT(DISTINCT dh.ma_don_hang) as c FROM chi_tiet_don_hang ct JOIN don_hang dh ON ct.ma_don_hang = dh.ma_don_hang WHERE ct.ma_mon = 2 AND dh.trang_thai = 'delivered' AND dh.ma_don_hang IN (SELECT ma_don_hang FROM chi_tiet_don_hang WHERE ma_mon = 38)");
    console.log('Total Both:', totalAB[0].c);

    process.exit();
}
run();
