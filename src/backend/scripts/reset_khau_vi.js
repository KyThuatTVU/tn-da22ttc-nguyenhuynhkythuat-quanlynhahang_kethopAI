const db = require('../config/database');

async function reset() {
    try {
        console.log('🔄 Bắt đầu dọn dẹp và đặt lại dữ liệu khẩu vị...');

        // 1. Tạm thời tắt foreign key checks để truncate sạch sẽ
        await db.query('SET FOREIGN_KEY_CHECKS = 0');
        console.log('🔓 Đã tắt FOREIGN_KEY_CHECKS');

        // 2. Truncate các bảng liên quan đến khẩu vị
        await db.query('TRUNCATE TABLE so_thich_khau_vi_nguoi_dung');
        console.log('🧹 Đã xóa sạch dữ liệu khảo sát sở thích của người dùng (so_thich_khau_vi_nguoi_dung)');

        await db.query('TRUNCATE TABLE mon_an_khau_vi');
        console.log('🧹 Đã xóa sạch dữ liệu gán khẩu vị của món ăn (mon_an_khau_vi)');

        await db.query('TRUNCATE TABLE thuoc_tinh_khau_vi');
        console.log('🧹 Đã xóa sạch danh sách khẩu vị hiện có (thuoc_tinh_khau_vi)');

        // 3. Bật lại foreign key checks
        await db.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('🔒 Đã bật lại FOREIGN_KEY_CHECKS');

        // 4. Thêm các khẩu vị mặc định ban đầu
        const defaultTags = [
            ['🍲 Cay'], 
            ['🍋 Chua'], 
            ['🧂 Mặn'], 
            ['🍰 Ngọt'], 
            ['🥦 Chay'], 
            ['🌿 Thanh đạm'], 
            ['🥩 Nhiều đạm'], 
            ['🍤 Hải sản']
        ];
        
        await db.query('INSERT INTO thuoc_tinh_khau_vi (ten_thuoc_tinh) VALUES ?', [defaultTags]);
        console.log('✅ Đã thêm mới danh sách khẩu vị mặc định thành công!');
        
        console.log('🎉 QUÁ TRÌNH KHỞI TẠO LẠI KHẨU VỊ HOÀN TẤT!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi đặt lại dữ liệu khẩu vị:', error);
        process.exit(1);
    }
}

reset();
