const fs = require('fs');
const path = require('path');
const adminDir = path.join('d:', 'KhoaLuanTotNghiep2026', 'frontend', 'admin');

fs.readdirSync(adminDir).forEach(file => {
    if (file.endsWith('.html')) {
        const filePath = path.join(adminDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        const authCheckRegex = /^.*<script src="js\/auth-check\.js.*"><\/script>.*$/gm;
        if (content.match(authCheckRegex)) {
            content = content.replace(authCheckRegex, '');
            modified = true;
        }

        const permRegex = /^.*<script src="js\/permissions\.js.*"><\/script>.*$/gm;
        if (content.match(permRegex)) {
            content = content.replace(permRegex, '');
            modified = true;
        }

        if (file === 'dashboard.html' && content.includes('API_BASE')) {
            content = content.replace(/\bAPI_BASE\b/g, 'API_URL');
            content = content.replace(/const\s+API_URL\s*=\s*API_URL;/g, '');
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Fixed ' + file);
        }
    }
});