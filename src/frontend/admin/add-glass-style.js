/**
 * Chèn <link rel="stylesheet" href="admin-glass-3d.css"> vào các trang admin
 * (sau admin-responsive.css nếu có, nếu không thì sau admin-styles.css).
 *
 * Chỉ áp dụng cho trang có dùng admin-styles.css.
 * Chạy:  node admin/add-glass-style.js   (từ thư mục src/frontend)
 */
const fs = require('fs');
const path = require('path');

const adminDir = __dirname;
const LINK = '    <link rel="stylesheet" href="admin-glass-3d.css">';

let added = 0, skipped = 0;

for (const entry of fs.readdirSync(adminDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(adminDir, entry.name, 'index.html');
    if (!fs.existsSync(file)) continue;

    let html = fs.readFileSync(file, 'utf8');

    if (!html.includes('admin-styles.css')) {
        console.log(`  ⏭️  ${entry.name} (không dùng admin-styles.css)`);
        skipped++;
        continue;
    }
    if (html.includes('admin-glass-3d.css')) {
        console.log(`  ⏭️  ${entry.name} (đã có glass css)`);
        skipped++;
        continue;
    }

    const anchor = html.includes('admin-responsive.css')
        ? '<link rel="stylesheet" href="admin-responsive.css">'
        : '<link rel="stylesheet" href="admin-styles.css">';

    html = html.replace(anchor, `${anchor}\n${LINK}`);
    fs.writeFileSync(file, html, 'utf8');
    added++;
    console.log(`  ✅ ${entry.name}`);
}

console.log(`\nĐã thêm vào ${added} trang, bỏ qua ${skipped} trang.`);
