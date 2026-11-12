const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const OUT = 'D:/KhoaLuanTotNghiep2026/video/site_tour/_build/assets/ui';
fs.mkdirSync(OUT, { recursive: true });

const pages = [
  ['index.html', 'home'],
  ['gioi-thieu/index.html', 'about'],
  ['thuc-don/index.html', 'menu_static'],
  ['dat-ban/index.html', 'booking'],
  ['lien-he/index.html', 'contact'],
  ['tin-tuc/index.html', 'news'],
  ['album/index.html', 'album'],
  ['dang-nhap/index.html', 'login'],
  ['dang-ky/index.html', 'register'],
  ['staff/login/index.html', 'staff_login'],
  ['admin/dang-nhap-admin/index.html', 'admin_login'],
  ['cham-cong-guong-mat/index.html', 'face_attendance'],
  ['cham-cong/index.html', 'attendance'],
  ['gio-hang/index.html', 'cart'],
  ['thanh-toan/index.html', 'checkout'],
  ['tai-khoan/index.html', 'account'],
  ['dat-ban-cua-toi/index.html', 'my_bookings'],
  ['so-do-website/index.html', 'sitemap']
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE, headless: true,
    args: ['--hide-scrollbars', '--disable-gpu', '--force-color-profile=srgb', '--font-render-hinting=none']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
  page.on('dialog', d => d.dismiss().catch(() => {}));

  for (const [p, name] of pages) {
    const url = 'http://127.0.0.1:5500/' + p;
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
    } catch (e) {
      console.log('nav', name, e.message);
    }
    await new Promise(r => setTimeout(r, 3000));
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      // freeze entrance animations so screenshots are stable
      document.querySelectorAll('[data-aos]').forEach(el => {
        el.classList.add('aos-animate');
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }).catch(() => {});
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUT, name + '.png'), type: 'png' });
    await page.screenshot({ path: path.join(OUT, name + '_full.png'), type: 'png', fullPage: true });
    const title = await page.title();
    console.log('shot', name, '|', title);
  }
  await browser.close();
})();
