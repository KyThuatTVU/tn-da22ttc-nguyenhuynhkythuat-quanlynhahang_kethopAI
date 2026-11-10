const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

const adminDir = path.join('d:', 'KhoaLuanTotNghiep2026', 'src', 'frontend', 'admin');
const files = fs.readdirSync(adminDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name !== 'js' && !d.name.includes('dang-nhap'))
    .map(d => d.name);

const templateFile = path.join(adminDir, 'orders', 'index.html');
const templateContent = fs.readFileSync(templateFile, 'utf8');

const sidebarRegex = /<aside id="sidebar"[^>]*>[\s\S]*?<\/aside>/;
const match = templateContent.match(sidebarRegex);

if (!match) {
    console.error('Sidebar not found in orders/index.html');
    process.exit(1);
}

let sidebarContent = match[0];
sidebarContent = sidebarContent.replace(/\s*class="sidebar-item active"/g, ' class="sidebar-item"');
sidebarContent = sidebarContent.replace('</aside>', `
<script>
    document.addEventListener('DOMContentLoaded', () => {
        let currentPage = window.location.pathname.split('/').filter(Boolean).pop() || 'dashboard';
        if (currentPage === 'admin') currentPage = 'dashboard';
        document.querySelectorAll('.sidebar-item').forEach(item => {
            const linkPage = item.getAttribute('href').split('/').filter(Boolean).pop() || 'dashboard';
            if (linkPage === currentPage) {
                item.classList.add('active');
            }
        });
    });
</script>
</aside>
`);

for (const dir of files) {
    if (dir === 'orders' || dir === 'admin-pos-new') continue;
    
    // Use git checkout to restore
    const filePath = path.join(adminDir, dir, 'index.html');
    try {
        execSync('git checkout -- "' + filePath + '"', {stdio: 'ignore'});
    } catch(e) {}
    
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = content.replace(sidebarRegex, sidebarContent);
    fs.writeFileSync(filePath, newContent, 'utf8');
}
console.log('Restored all files using Node utf8!');
