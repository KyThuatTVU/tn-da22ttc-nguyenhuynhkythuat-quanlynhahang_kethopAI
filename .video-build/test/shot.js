const puppeteer = require('puppeteer-core');
(async () => {
  const b = await puppeteer.launch({
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: 'new', args: ['--hide-scrollbars','--force-device-scale-factor=1','--disable-gpu','--font-render-hinting=none']
  });
  const p = await b.newPage();
  await p.setViewport({width:1920,height:1080,deviceScaleFactor:1});
  await p.goto('file:///D:/KhoaLuanTotNghiep2026/.video-build/test/frame.html', {waitUntil:'load'});
  await p.evaluate(() => document.fonts.ready);
  const t0 = Date.now();
  for (let i=0;i<12;i++){
    await p.evaluate((t)=>window.renderAt(t), i/25);
    await p.screenshot({path:`test/f_${String(i).padStart(4,'0')}.png`, type:'png', optimizeForSpeed:true});
  }
  console.log('12 frames ms:', Date.now()-t0, '=> per frame', (Date.now()-t0)/12);
  await b.close();
})();
