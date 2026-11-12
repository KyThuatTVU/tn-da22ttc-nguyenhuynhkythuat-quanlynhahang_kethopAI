// Frame renderer: headless Edge -> deterministic renderAt(t) -> PNG -> ffmpeg
// usage:
//   node render.js --stills [--only s03,s07]
//   node render.js --video [--workers 3]
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');

const ROOT = 'D:/KhoaLuanTotNghiep2026/video/_build';
const OUT = path.join(ROOT, 'out');
const FF = 'C:/Users/ACER/AppData/Local/Python/pythoncore-3.14-64/Lib/site-packages/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const URL = 'file:///' + path.join(ROOT, 'index.html').replace(/\\/g, '/');

const tl = JSON.parse(fs.readFileSync(path.join(ROOT, 'timeline.json'), 'utf8'));
const FPS = tl.fps;
const TOTAL = tl.total;
const NFRAMES = Math.round(TOTAL * FPS);

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f, d) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : d; };

async function openPage(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => window.DATA && window.DATA.scenes && typeof window.renderAt === 'function');
  await page.evaluate(() => { document.getElementById('sweep').style.transition = 'none'; });
  return page;
}

async function shot(page, t, file) {
  await page.evaluate((T) => window.renderAt(T), t);
  await page.screenshot({ path: file, type: 'png', captureBeyondViewport: false, optimizeForSpeed: true });
}

async function stills() {
  const dir = path.join(OUT, 'stills');
  fs.mkdirSync(dir, { recursive: true });
  const only = val('--only', null);
  const want = only ? new Set(only.split(',')) : null;
  const browser = await puppeteer.launch({
    executablePath: EDGE, headless: true,
    args: ['--hide-scrollbars', '--disable-gpu', '--force-color-profile=srgb', '--font-render-hinting=none']
  });
  const page = await openPage(browser);
  let n = 0;
  for (const sc of tl.scenes) {
    if (want && !want.has(sc.id)) continue;
    const beats = [0.5, 0.82]; // mid + near end
    for (const b of beats) {
      const t = Math.min(sc.start + sc.dur * b, sc.start + sc.dur - 0.08);
      const f = path.join(dir, `${sc.id}_${String(Math.round(b * 100)).padStart(2, '0')}.png`);
      await shot(page, t, f);
      n++;
      process.stdout.write(`.${sc.id}@${t.toFixed(1)} `);
    }
  }
  await browser.close();
  console.log(`\nstills: ${n} -> ${dir}`);
}

function ffmpegSegment(outFile) {
  const args = ['-y', '-hide_banner', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.2', '-preset', 'medium',
    '-crf', '17', '-pix_fmt', 'yuv420p', '-g', '50', '-keyint_min', '50', '-sc_threshold', '0',
    '-r', String(FPS), outFile];
  const p = spawn(FF, args, { stdio: ['pipe', 'inherit', 'inherit'] });
  return p;
}

function writeFrame(proc, buf) {
  return new Promise((res, rej) => {
    if (!proc.stdin.writable) return rej(new Error('stdin closed'));
    const ok = proc.stdin.write(buf, (e) => e && rej(e));
    if (ok) res(); else proc.stdin.once('drain', res);
  });
}

async function worker(id, f0, f1, log) {
  const browser = await puppeteer.launch({
    executablePath: EDGE, headless: true,
    args: ['--hide-scrollbars', '--disable-gpu', '--force-color-profile=srgb', '--font-render-hinting=none']
  });
  const page = await openPage(browser);
  const out = path.join(OUT, `seg_${id}.mp4`);
  const proc = ffmpegSegment(out);
  const done = new Promise((res, rej) => {
    proc.on('error', rej);
    proc.on('close', (c) => c === 0 ? res() : rej(new Error('ffmpeg exit ' + c)));
  });
  const t0 = Date.now();
  for (let f = f0; f < f1; f++) {
    await page.evaluate((T) => window.renderAt(T), f / FPS);
    const buf = await page.screenshot({ type: 'png', captureBeyondViewport: false, optimizeForSpeed: true });
    await writeFrame(proc, buf);
    if ((f - f0) % 250 === 0) {
      const el = (Date.now() - t0) / 1000;
      const rate = (f - f0) / Math.max(el, 0.01);
      log(`[w${id}] ${f - f0}/${f1 - f0} ${rate.toFixed(1)} fps eta ${((f1 - f) / Math.max(rate, .01) / 60).toFixed(1)}m`);
    }
  }
  proc.stdin.end();
  await done;
  await browser.close();
  log(`[w${id}] done ${out}`);
  return out;
}

async function video() {
  fs.mkdirSync(OUT, { recursive: true });
  const workers = parseInt(val('--workers', '3'), 10);
  const log = (s) => console.log(new Date().toISOString().slice(11, 19), s);
  const per = Math.ceil(NFRAMES / workers);
  const jobs = [];
  for (let i = 0; i < workers; i++) {
    const f0 = i * per, f1 = Math.min(NFRAMES, f0 + per);
    if (f0 < f1) jobs.push(worker(i, f0, f1, log));
  }
  const segs = await Promise.all(jobs);
  const list = path.join(OUT, 'segments.txt');
  fs.writeFileSync(list, segs.map((s) => `file '${s.replace(/\\/g, '/')}'`).join('\n'));
  const silent = path.join(OUT, 'video_silent.mp4');
  await new Promise((res, rej) => {
    const p = spawn(FF, ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0',
      '-i', list, '-c', 'copy', silent], { stdio: 'inherit' });
    p.on('close', (c) => c === 0 ? res() : rej(new Error('concat exit ' + c)));
    p.on('error', rej);
  });
  log('video_silent: ' + silent);
}

(async () => {
  if (has('--stills')) return stills();
  if (has('--video')) return video();
  console.log('frames', NFRAMES, 'total', TOTAL, 'fps', FPS);
})();
