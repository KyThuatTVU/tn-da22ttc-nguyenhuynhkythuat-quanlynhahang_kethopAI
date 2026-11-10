/**
 * Tái cấu trúc frontend: mỗi trang HTML vào folder riêng, ẩn đuôi .html trên URL.
 *   - foo.html            -> foo/index.html        (URL: /foo/)
 *   - admin/bar.html      -> admin/bar/index.html  (URL: /admin/bar/)
 *   - staff/baz.html      -> staff/baz/index.html  (URL: /staff/baz/)
 *   - index.html, admin/index.html giữ nguyên (trang chủ / và /admin/)
 *   - Thêm <base href="/.../"> cho từng trang để asset relative vẫn hoạt động
 *   - Viết lại mọi link .html (HTML attribute + JS string literal) sang URL folder
 *   - href="#" -> javascript:void(0); href="#anchor" -> URL đầy đủ + #anchor
 *
 * Chạy: node scripts/restructure-folders.js (từ thư mục src/frontend)
 */
const fs = require('fs');
const path = require('path');

const FRONTEND = path.resolve(__dirname, '..');
const ORIGIN_DIRS = ['', 'admin', 'staff'];

// Các file JS cần sửa tay (so sánh filename .html trong logic) - bỏ qua ở đây
const JS_SKIP = new Set([
    'admin/js/auth-check.js',
    'admin/fix-sidebar.js',
]);
// Các file sửa tay khác (so sánh currentPage)
const HTML_SKIP = new Set([
    'components/recommendation-widget.html',
]);

let movedCount = 0, baseCount = 0, attrCount = 0, strCount = 0;

// ============ Bước 1: quét các trang hiện có ============
function discoverPages() {
    const pages = {}; // relPath -> final URL
    for (const dir of ORIGIN_DIRS) {
        const abs = path.join(FRONTEND, dir);
        for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
            if (!e.isFile() || !e.name.endsWith('.html')) continue;
            const rel = dir ? `${dir}/${e.name}` : e.name;
            if (e.name === 'index.html') {
                pages[rel] = dir ? `/${dir}/` : '/';
            } else {
                pages[rel] = `/${rel.replace(/\.html$/, '')}/`;
            }
        }
    }
    return pages;
}

// ============ Bước 2: map một tham chiếu trang .html sang URL mới ============
function mapPageRef(p, originDir) {
    if (!p || !p.includes('.html')) return null;
    if (/^(https?:|mailto:|tel:|javascript:|data:|blob:)/i.test(p) || p.startsWith('//')) return null;

    let rel;
    if (p.startsWith('/')) rel = p.slice(1);
    else rel = path.posix.normalize(path.posix.join('/', originDir || '', p)).replace(/^\//, '');

    if (rel.startsWith('components/')) return null;
    if (rel === 'index.html') return '/';
    if (rel === 'admin/login-simple.html') return '/admin/dang-nhap-admin/';
    if (rel.endsWith('.html')) {
        const name = rel.replace(/\.html$/, '');
        if (name === 'admin/index' || name === 'staff/index') return `/${name.split('/')[0]}/`;
        return `/${name}/`;
    }
    return null;
}

// Viết lại mọi ref .html trong một chuỗi JS (cả phần query lồng nhau)
function rewriteStringRefs(str, originDir) {
    return str.replace(
        /((?<![\w/-])(?:\.\.\/)*(?:admin\/|staff\/)?[A-Za-z0-9_-]+\.html(?![A-Za-z0-9_.]))/g,
        (m) => {
            const mapped = mapPageRef(m, originDir);
            return mapped === null ? m : mapped;
        }
    );
}

// ============ Bước 3: xử lý attribute trong HTML ============
function rewriteAttrValue(val, originDir, finalUrl) {
    if (!val) return val;
    if (val.startsWith('#')) {
        if (val === '#') return 'javascript:void(0)';
        if (finalUrl) return finalUrl + val.slice(1); // href="#anchor" -> /page/#anchor
        return val; // fragment trong components: giữ nguyên
    }
    if (/^(https?:|mailto:|tel:|javascript:|data:|blob:|#|\/\/)/i.test(val)) return val;
    if (!val.includes('.html')) return val;

    let cut = val.length;
    const q = val.indexOf('?'); if (q > -1) cut = Math.min(cut, q);
    const h = val.indexOf('#'); if (h > -1) cut = Math.min(cut, h);
    const p = val.slice(0, cut);
    const suffix = val.slice(cut);

    const mapped = mapPageRef(p, originDir);
    if (mapped === null) return val;
    return mapped + rewriteStringRefs(suffix, originDir);
}

function rewriteAttributes(content, originDir, finalUrl) {
    return content.replace(
        /(href|src|action)\s*=\s*("([^"]*)"|'([^']*)')/g,
        (m, attr, quoted, dq, sq) => {
            const val = dq !== undefined ? dq : sq;
            const quote = dq !== undefined ? '"' : "'";
            const newVal = rewriteAttrValue(val, originDir, finalUrl);
            if (newVal === val) return m;
            attrCount++;
            return `${attr}=${quote}${newVal}${quote}`;
        }
    );
}

// ============ Bước 4: chèn <base> ============
function insertBase(content, baseHref) {
    if (content.includes('<base')) return content;
    const m = content.match(/<head[^>]*>/i);
    if (!m) return content;
    baseCount++;
    return content.replace(m[0], `${m[0]}\n    <base href="${baseHref}">`);
}

// ============ Bước 5: xử lý 1 file HTML ============
function processHtmlFile(rel, originDir, finalUrl, baseHref, insertBaseFlag) {
    const abs = path.join(FRONTEND, rel);
    if (!fs.existsSync(abs)) return;
    let content = fs.readFileSync(abs, 'utf8');
    content = rewriteAttributes(content, originDir, finalUrl);
    // String literals trong inline script / event handler
    content = rewriteStringRefs(content, originDir);
    if (insertBaseFlag) content = insertBase(content, baseHref);
    fs.writeFileSync(abs, content, 'utf8');
}

// ============ Bước 6: xử lý 1 file JS ============
function processJsFile(rel, originDir) {
    if (JS_SKIP.has(rel)) return;
    const abs = path.join(FRONTEND, rel);
    if (!fs.existsSync(abs)) return;
    let content = fs.readFileSync(abs, 'utf8');
    const before = content;
    content = rewriteStringRefs(content, originDir);
    if (content !== before) {
        strCount++;
        fs.writeFileSync(abs, content, 'utf8');
    }
}

// ============ THỰC THI ============
const pages = discoverPages();
console.log(`📄 Tìm thấy ${Object.keys(pages).length} trang`);

// 1. Xử lý nội dung các trang HTML
for (const [rel, finalUrl] of Object.entries(pages)) {
    const originDir = rel.startsWith('admin/') ? 'admin' : rel.startsWith('staff/') ? 'staff' : '';
    const baseHref = originDir ? `/${originDir}/` : '/';
    processHtmlFile(rel, originDir, finalUrl, baseHref, true);
    console.log(`  ✅ ${rel} -> ${finalUrl} (base: ${baseHref})`);
}

// 2. Xử lý components/*.html (không chèn base, không di chuyển)
for (const name of fs.readdirSync(path.join(FRONTEND, 'components'))) {
    if (!name.endsWith('.html') || HTML_SKIP.has(`components/${name}`)) continue;
    processHtmlFile(`components/${name}`, '', null, null, false);
    console.log(`  🔗 components/${name}`);
}

// 3. Xử lý file JS
const jsDirs = ['js', 'admin', 'staff'];
for (const dir of jsDirs) {
    const walk = (d) => {
        for (const e of fs.readdirSync(path.join(FRONTEND, d), { withFileTypes: true })) {
            const rel = `${d}/${e.name}`;
            if (e.isDirectory()) { walk(rel); continue; }
            if (e.name.endsWith('.js')) processJsFile(rel, d === 'js' ? '' : d);
        }
    };
    walk(dir);
}

// 4. Di chuyển trang vào folder riêng
for (const [rel, finalUrl] of Object.entries(pages)) {
    if (rel === 'index.html' || rel === 'admin/index.html') continue;
    const from = path.join(FRONTEND, rel);
    const folder = path.join(FRONTEND, rel.replace(/\.html$/, ''));
    if (fs.existsSync(folder)) {
        console.error(`  ⚠️ Folder ${folder} đã tồn tại, bỏ qua ${rel}`);
        continue;
    }
    fs.mkdirSync(folder, { recursive: true });
    fs.renameSync(from, path.join(folder, 'index.html'));
    movedCount++;
}

console.log('\n📊 Tổng kết:');
console.log(`  - Số trang đã chuyển folder: ${movedCount}`);
console.log(`  - Số trang chèn <base>: ${baseCount}`);
console.log(`  - Số attribute đã viết lại: ${attrCount}`);
console.log(`  - Số file JS đã viết lại: ${strCount}`);
console.log('✅ Hoàn tất!');
