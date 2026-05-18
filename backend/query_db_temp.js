const db = require('./config/database');

async function main() {
    try {
        const userId = 3; // Thuật Thuật
        
        // 1. Món ăn Thuật Thuật đã mua
        const [userOrders] = await db.query(
            `SELECT DISTINCT ct.ma_mon, m.ten_mon 
             FROM chi_tiet_don_hang ct
             JOIN don_hang dh ON ct.ma_don_hang = dh.ma_don_hang
             JOIN mon_an m ON ct.ma_mon = m.ma_mon
             WHERE dh.ma_nguoi_dung = ?`,
            [userId]
        );
        console.log("--- Món ăn Thuật Thuật đã mua ---");
        console.log(userOrders);
        
        if (userOrders.length === 0) {
            console.log("Thuật Thuật chưa mua món nào.");
        } else {
            const userDishes = userOrders.map(o => o.ma_mon);
            
            // 2. Tìm người dùng tương tự
            const [similarUsers] = await db.query(
                `SELECT dh.ma_nguoi_dung, nd.ten_nguoi_dung, nd.email, COUNT(DISTINCT ct.ma_mon) as common_dishes
                 FROM chi_tiet_don_hang ct
                 JOIN don_hang dh ON ct.ma_don_hang = dh.ma_don_hang
                 JOIN nguoi_dung nd ON dh.ma_nguoi_dung = nd.ma_nguoi_dung
                 WHERE ct.ma_mon IN (?) AND dh.ma_nguoi_dung != ? AND dh.ma_nguoi_dung IS NOT NULL
                 GROUP BY dh.ma_nguoi_dung, nd.ten_nguoi_dung, nd.email
                 ORDER BY common_dishes DESC`,
                [userDishes, userId]
            );
            console.log("\n--- Danh sách người dùng tương tự Thuật Thuật ---");
            console.log(similarUsers);
        }

        // 3. Tìm các tài khoản đã mua món 'Cá tai tượng chiên xù' (ID 3)
        const [buyers] = await db.query(
            `SELECT DISTINCT dh.ma_nguoi_dung, nd.ten_nguoi_dung, nd.email
             FROM chi_tiet_don_hang ct
             JOIN don_hang dh ON ct.ma_don_hang = dh.ma_don_hang
             JOIN nguoi_dung nd ON dh.ma_nguoi_dung = nd.ma_nguoi_dung
             WHERE ct.ma_mon = 3`,
            []
        );
        console.log("\n--- Các tài khoản đã mua món 'Cá tai tượng chiên xù' (ma_mon = 3) ---");
        console.log(buyers);

    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        process.exit(0);
    }
}
main();
