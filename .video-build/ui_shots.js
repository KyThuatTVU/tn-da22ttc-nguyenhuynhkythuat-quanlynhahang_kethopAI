const puppeteer = require('puppeteer-core');
const fs = require('fs');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const OUT = 'D:/KhoaLuanTotNghiep2026/video/_build/out/qa/ui';
fs.mkdirSync(OUT, { recursive: true });
const pages = process.argv.slice(2);
(async () => {
  const b = await puppeteer.launch({ executablePath: EDGE, headless: true,
    args: ['--hide-scrollbars', '--disable-gpu', '--force-color-profile=srgb'] });
  const p = await b.newPage();
  await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  for (const spec of pages) {
    const [path, name] = spec.split('=');
    await p.goto('http://127.0.0.1:5500/' + path, { waitUntil: 'networkidle2', timeout: 45000 }).catch(e => console.log('nav', path, e.message));
    await new Promise(r => setTimeout(r, 2500));
    await p.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
    await p.screenshot({ path: `${OUT}/${name}_full.png`, fullPage: true });
    console.log('shot', name, await p.title());
  }
  await b.close();
})();
