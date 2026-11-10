/**
 * Tách các khối <style> và <script> inline trong các trang HTML
 * thành file .css / .js riêng biệt, thay bằng thẻ <link> / <script src defer>.
 *
 * Quy ước đặt file:
 *  - Trang gốc (src/frontend/foo.html)      -> css/foo.css  và js/foo.js
 *  - Trang admin (admin/foo.html)           -> admin/foo.css và admin/foo.js
 *  - Trang staff (staff/foo.html)           -> staff/foo.css và staff/foo.js
 *
 * Cách chạy:  node scripts/extract-inline.js
 */
const fs = require('fs');
const path = require('path');

const FRONTEND = path.resolve(__dirname, '..');

const DIRS = [
  { dir: '.', cssSub: 'css', jsSub: 'js' },
  { dir: 'admin', cssSub: '.', jsSub: '.' },
  { dir: 'staff', cssSub: '.', jsSub: '.' },
];

// Tên file sinh ra bị trùng với file đã tồn tại -> đổi tên tại đây
const CSS_NAME_OVERRIDES = {
  'admin/admin-pos-new.html': 'admin-pos-new-page.css',
};
const JS_NAME_OVERRIDES = {};

// Thay thế document.write trong admin/payroll.html (sinh option tháng)
const PAYROLL_OPTION_GEN = `// Sinh danh sách tháng cho select #filter-month (thay thế document.write)
(function () {
    const select = document.getElementById('filter-month');
    if (select) {
        for (let i = 1; i <= 12; i++) {
            const option = document.createElement('option');
            option.value = String(i);
            option.textContent = 'Tháng ' + i;
            select.appendChild(option);
        }
    }
})();`;

const stats = { processed: [], skipped: [] };
let errors = 0;

for (const { dir, cssSub, jsSub } of DIRS) {
    const absDir = path.join(FRONTEND, dir);
    const cssDirAbs = cssSub === '.' ? absDir : path.join(FRONTEND, cssSub);
    const jsDirAbs = jsSub === '.' ? absDir : path.join(FRONTEND, jsSub);
    const files = fs.readdirSync(absDir).filter((f) => f.endsWith('.html')).sort();

    for (const file of files) {
        const rel = path.join(dir, file).replace(/\\/g, '/');
        const htmlPath = path.join(absDir, file);
        const html = fs.readFileSync(htmlPath, 'utf8');
        const name = file.replace(/\.html$/, '');

        // Tìm style sau khi đã che (blank) vùng script để tránh nhầm
        // thẻ <style> nằm trong chuỗi template của JS (vd: template in phiếu)
        const scriptBlocksRaw = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
        let htmlForStyles = html;
        scriptBlocksRaw.forEach((m, i) => {
            htmlForStyles = htmlForStyles.replace(m[0], `\u0001SCRIPTBLOCK${i}\u0001`);
        });
        const styleBlocks = [...htmlForStyles.matchAll(/<style>([\s\S]*?)<\/style>/g)];

        // Tương tự: che vùng style trước khi tìm script
        let htmlForScripts = html;
        styleBlocks.forEach((m, i) => {
            htmlForScripts = htmlForScripts.replace(m[0], `\u0002STYLEBLOCK${i}\u0002`);
        });
        const scriptBlocks = [...htmlForScripts.matchAll(/<script>([\s\S]*?)<\/script>/g)];

        if (styleBlocks.length === 0 && scriptBlocks.length === 0) {
            stats.skipped.push(rel);
            continue;
        }

        const cssName = CSS_NAME_OVERRIDES[rel] || `${name}.css`;
        const jsName = JS_NAME_OVERRIDES[rel] || `${name}.js`;
        const cssHref = cssSub === '.' ? cssName : `${cssSub}/${cssName}`;
        const jsSrc = jsSub === '.' ? jsName : `${jsSub}/${jsName}`;
        const cssPath = path.join(cssDirAbs, cssName);
        const jsPath = path.join(jsDirAbs, jsName);

        let newHtml = html;

        // ---- Xử lý CSS ----
        if (styleBlocks.length > 0) {
            if (fs.existsSync(cssPath) && !CSS_NAME_OVERRIDES[rel]) {
                console.error(`[LỖI] ${cssPath} đã tồn tại - thêm vào CSS_NAME_OVERRIDES cho ${rel}`);
                errors++;
                continue;
            }
            const css = styleBlocks
                .map((m, i) => `/* ==== Style ${i + 1} (tách từ ${file}) ==== */\n${m[1].trim()}`)
                .join('\n\n');
            fs.writeFileSync(cssPath, css + '\n');

            newHtml = newHtml.replace(
                styleBlocks[0][0],
                `\n    <link rel="stylesheet" href="${cssHref}">\n`
            );
            for (let i = 1; i < styleBlocks.length; i++) {
                newHtml = newHtml.replace(styleBlocks[i][0], '');
            }
        }

        // ---- Xử lý JS ----
        if (scriptBlocks.length > 0) {
            if (fs.existsSync(jsPath) && !JS_NAME_OVERRIDES[rel]) {
                console.error(`[LỖI] ${jsPath} đã tồn tại - thêm vào JS_NAME_OVERRIDES cho ${rel}`);
                errors++;
                continue;
            }

            const jsParts = [];
            let firstInsertIndex = -1;

            scriptBlocks.forEach((m, i) => {
                const content = m[1].trim();
                if (rel === 'admin/payroll.html' && /document\.write/.test(content)) {
                    jsParts.unshift(PAYROLL_OPTION_GEN);
                    newHtml = newHtml.replace(m[0], '');
                    return;
                }
                if (firstInsertIndex === -1) firstInsertIndex = i;
                jsParts.push(content);
            });

            if (jsParts.length > 0) {
                const js = jsParts
                    .map((c, i) => `/* ==== Script ${i + 1} (tách từ ${file}) ==== */\n${c}`)
                    .join('\n\n');
                fs.writeFileSync(jsPath, js + '\n');

                const firstScript = scriptBlocks[firstInsertIndex];
                newHtml = newHtml.replace(
                    firstScript[0],
                    `\n    <script src="${jsSrc}" defer></script>\n`
                );
                for (let i = firstInsertIndex + 1; i < scriptBlocks.length; i++) {
                    newHtml = newHtml.replace(scriptBlocks[i][0], '');
                }
            }
        }

        fs.writeFileSync(htmlPath, newHtml);

        // Kiểm tra kết quả: không còn block inline, đã chèn đúng link/script
        const leftStyle = (newHtml.match(/<style>/g) || []).length;
        const leftScript = (newHtml.match(/<script>/g) || []).length;
        if (leftStyle > 0 || leftScript > 0) {
            console.error(`[LỖI] ${rel}: còn ${leftStyle} style, ${leftScript} script inline!`);
            errors++;
            continue;
        }
        if (styleBlocks.length > 0 && !newHtml.includes(`href="${cssHref}"`)) {
            console.error(`[LỖI] ${rel}: không chèn được link ${cssHref}`);
            errors++;
            continue;
        }
        if (scriptBlocks.length > 0 && !newHtml.includes(`src="${jsSrc}"`)) {
            console.error(`[LỖI] ${rel}: không chèn được script ${jsSrc}`);
            errors++;
            continue;
        }

        stats.processed.push(rel);
        console.log(`[OK] ${rel}: ${styleBlocks.length} style, ${scriptBlocks.length} script -> ${cssName}, ${jsName}`);
    }
}

console.log('\n==== KẾT QUẢ ====');
console.log(`Đã xử lý: ${stats.processed.length} trang`);
console.log(`Bỏ qua (không có inline): ${stats.skipped.length} trang`);
if (errors > 0) {
    console.error(`Có ${errors} lỗi - kiểm tra lại!`);
    process.exit(1);
}
