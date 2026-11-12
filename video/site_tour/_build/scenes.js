/* Deterministic scene renderer for the website tour video. */
const DATA = window.DATA;
const sceneRoot = document.getElementById('scenes');
const subBox = document.getElementById('subBox');
const subText = document.getElementById('subText');
const prog = document.getElementById('prog');
const idxNum = document.getElementById('idxNum');
const sweep = document.getElementById('sweep');
const brand = document.getElementById('brand');

const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const pr = (t, a, b) => cl((t - a) / (b - a || 1e-6));
const eOut = t => 1 - Math.pow(1 - t, 3);
const eOut5 = t => 1 - Math.pow(1 - t, 5);
const eInOut = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eBack = t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const lerp = (a, b, p) => a + (b - a) * p;
const vnd = n => n.toLocaleString('vi-VN') + 'đ';

function E(tag, cls, css, html) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (css) Object.assign(el.style, css);
  if (html != null) el.innerHTML = html;
  return el;
}
function T(cls, txt, css) { return E('div', cls, css, txt); }
function place(el, r, x, y) { el.style.position = 'absolute'; if (x != null) el.style.left = x + 'px'; if (y != null) el.style.top = y + 'px'; r.appendChild(el); return el; }
function img(src, css) { const i = E('img', '', css); i.src = src; return i; }
function pop(el, p, dy = 24, dx = 0) {
  const e = eOut(cl(p));
  el.style.opacity = e;
  el.style.transform = `translate(${(1 - e) * dx}px,${(1 - e) * dy}px) scale(${lerp(.97, 1, e)})`;
}
function slide(el, p, dx = 0, dy = 24) { pop(el, p, dy, dx); }
function showHl(el, p) {
  const e = eOut(cl(p));
  el.style.opacity = e * .96;
  el.style.transform = `scale(${lerp(.965, 1, e)})`;
}
function vis(t, s, e, fi = .32, fo = .26) {
  if (t < s || t > e) return 0;
  return Math.min(cl((t - s) / fi), cl((e - t) / fo));
}
function callout(r, num, text, x, y, green) {
  const el = E('div', 'callout' + (green ? ' green' : ''), { left: x + 'px', top: y + 'px' },
    `<div class="n">${num}</div><div>${text}</div>`);
  r.appendChild(el);
  return el;
}
function showC(el, p) {
  const e = eOut(cl(p));
  el.style.opacity = e;
  el.style.transform = `translateY(${(1 - e) * 12}px) scale(${lerp(.92, 1, e)})`;
}
function hlBox(r, x, y, w, h, green) {
  const b = E('div', 'hl' + (green ? ' green' : ''), { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
  r.appendChild(b);
  return b;
}
function cursorPair(r) {
  const rip = E('div', 'ripple'); r.appendChild(rip);
  const c = E('div', 'cursor'); r.appendChild(c);
  return { c, rip };
}
function moveCursor(pair, t, path) {
  let x = path[0][1], y = path[0][2];
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i], b = path[i + 1];
    if (t >= a[0] && t <= b[0]) {
      const p = eInOut(pr(t, a[0], b[0]));
      x = lerp(a[1], b[1], p); y = lerp(a[2], b[2], p);
    } else if (t > b[0]) { x = b[1]; y = b[2]; }
  }
  pair.c.style.left = (x - 10) + 'px';
  pair.c.style.top = (y - 10) + 'px';
  pair.c.style.opacity = t >= path[0][0] ? 1 : 0;
  return { x, y };
}
function clickRipple(pair, t, at) {
  const p = pr(t, at, at + .55);
  const on = t >= at && t <= at + .6;
  pair.rip.style.opacity = on ? (1 - p) * .9 : 0;
  pair.rip.style.left = (parseFloat(pair.c.style.left) - 16) + 'px';
  pair.rip.style.top = (parseFloat(pair.c.style.top) - 16) + 'px';
  pair.rip.style.transform = `scale(${lerp(.6, 2.4, p)})`;
}
function browserAt(r, x, y, w, innerH, label) {
  const f = E('div', 'browser', { left: x + 'px', top: y + 'px', width: w + 'px', height: (innerH + 44) + 'px' });
  const bar = E('div', 'bbar');
  ['#FF5F57', '#FEBC2E', '#28C840'].forEach(c => bar.appendChild(E('div', 'bdot', { background: c })));
  const u = E('div', 'burl', {},
    `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9A8575" stroke-width="2"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg><span>${label || 'Ẩm Thực Phương Nam'}</span>`);
  bar.appendChild(u);
  const shot = E('div', 'bshot');
  f.append(bar, shot);
  r.appendChild(f);
  return { f, shot };
}
function head(r, kicker, title, x = 170, y = 96, color) {
  const k = place(T('kicker', kicker, { fontSize: '17px', letterSpacing: '4.5px', color: color || '#E8622C' }), r, x, y);
  const h = place(T('h1', title, { fontSize: '44px', letterSpacing: '-1px', color: color || '#2A211B' }), r, x - 3, y + 26);
  return { k, h };
}
function iconSvg(name, color = '#E8622C', size = 28) {
  const c = color, s = `width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"`;
  const paths = {
    user: '<circle cx="12" cy="8" r="3.4"/><path d="M4.8 20c.7-3.7 3.6-5.8 7.2-5.8s6.5 2.1 7.2 5.8"/>',
    staff: '<path d="M4 9h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9z"/><path d="M8 9V6.5A2.5 2.5 0 0 1 10.5 4h3A2.5 2.5 0 0 1 16 6.5V9"/><path d="M4 13h16"/>',
    admin: '<rect x="3" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
    cart: '<circle cx="9" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/><path d="M3 4h2.2l2.4 11.2h10.9L21 8H6"/>',
    chat: '<path d="M4 5.5h16v10.2H9.3L4.8 19v-3.3H4z"/>',
    scan: '<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/><path d="M8 12h8"/>',
    pos: '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9.5 7h5M9.5 11h5M9.5 15h2.5"/>',
    wallet: '<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18M16.5 14.5h1.5"/>',
    chart: '<path d="M4 20V4M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-6M20 16v-9"/>',
    menu: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z"/><path d="M9 8h6M9 12h6"/>',
    box: '<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/>',
    users: '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c.6-3.2 3-5 5.5-5s4.9 1.8 5.5 5"/><path d="M16 6.2a3 3 0 0 1 0 5.6M17.5 14.4c2 .5 3.4 2.2 3.9 4.6"/>',
    report: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9.5 12h6M9.5 16h6"/>',
    shield: '<path d="M12 3 5 6v5.5c0 4.2 2.9 7.6 7 9.5 4.1-1.9 7-5.3 7-9.5V6z"/><path d="m9 12 2 2 4-4"/>',
    spark: '<path d="m12 3 1.9 5.4L19 10l-5.1 1.6L12 17l-1.9-5.4L5 10l5.1-1.6z"/>',
    check: '<path d="m5 12.5 4.2 4.2L19 6.8"/>',
    arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
    search: '<circle cx="11" cy="11" r="6.2"/><path d="m16 16 4 4"/>',
    clock: '<circle cx="12" cy="12" r="8.4"/><path d="M12 7.5V12l3 2"/>',
    star: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8L3.5 9.7l5.9-.9z"/>',
    money: '<circle cx="12" cy="12" r="8.4"/><path d="M9 8h4.2a2.2 2.2 0 0 1 0 4.4H9M9 12.4h4.6a2.3 2.3 0 0 1 0 4.6H9M11 6v12"/>',
    table: '<rect x="3" y="7" width="18" height="4" rx="1.4"/><path d="M6 11v9M18 11v9"/>',
    lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/>'
  };
  return `<svg ${s}>${paths[name] || ''}</svg>`;
}

const SCENES = [];
function scene(n) {
  const meta = DATA.scenes[n - 1];
  const root = E('section', 'scene');
  root.id = meta.id;
  sceneRoot.appendChild(root);
  const L = meta.times.map(([a, b]) => [Math.max(0, a - meta.start), Math.max(0, b - meta.start)]);
  const entry = { n, meta, root, L, update: () => { } };
  SCENES.push(entry);
  return entry;
}

/* ================= 01 · HOOK ================= */
{
  const S = scene(1), r = S.root;
  const photoMain = img('assets/food/lau_mam.png', { position: 'absolute', left: '1010px', top: '64px', width: '870px', height: '770px', objectFit: 'cover', borderRadius: '26px', border: '8px solid #fff', boxShadow: '0 46px 100px rgba(90,40,10,.26)' });
  const photoA = img('assets/food/ga_hap.png', { position: 'absolute', left: '1440px', top: '548px', width: '390px', height: '318px', objectFit: 'cover', borderRadius: '18px', border: '6px solid #fff', boxShadow: '0 26px 60px rgba(90,40,10,.24)' });
  const photoB = img('assets/food/ca_nuong.png', { position: 'absolute', left: '958px', top: '588px', width: '300px', height: '262px', objectFit: 'cover', borderRadius: '18px', border: '6px solid #fff', boxShadow: '0 26px 60px rgba(90,40,10,.22)' });
  [photoMain, photoA, photoB].forEach(p => r.appendChild(p));
  const fadeL = E('div', '', { position: 'absolute', left: '0', top: '0', width: '1010px', height: '1080px', background: 'linear-gradient(90deg,#FFF9F2 0%,#FFF9F2 74%,rgba(255,249,242,0) 100%)' });
  r.appendChild(fadeL);

  const kick = place(T('kicker', 'ĐỒ ÁN TỐT NGHIỆP · 2026', { fontSize: '19px', letterSpacing: '5px' }), r, 140, 176);
  const l1 = place(T('h1', 'ẨM THỰC', { fontSize: '112px', letterSpacing: '-4px' }), r, 132, 214);
  const l2 = place(T('h1', 'PHƯƠNG NAM', { fontSize: '112px', letterSpacing: '-4px', color: '#E8622C' }), r, 132, 330);
  const rule = E('div', '', { position: 'absolute', left: '140px', top: '478px', height: '4px', width: '430px', borderRadius: '3px', background: 'linear-gradient(90deg,#E8622C,#F2B544)', transformOrigin: 'left center' });
  r.appendChild(rule);
  const tag = place(T('', 'Một website · Ba vai trò · Trọn vẹn trải nghiệm.', { fontSize: '29px', fontWeight: '600', color: '#6B5748', letterSpacing: '.2px' }), r, 142, 508);

  const chips = [];
  [['user', 'Khách hàng'], ['staff', 'Nhân viên'], ['admin', 'Quản trị']].forEach(([ic, tx], i) => {
    const c = E('div', 'chip', { position: 'absolute', left: (140 + i * 218) + 'px', top: '592px', height: '58px', padding: '0 22px 0 14px', fontSize: '20px' },
      `<span style="width:32px;height:32px;border-radius:50%;background:#FFF0E6;display:flex;align-items:center;justify-content:center">${iconSvg(ic, '#E8622C', 19)}</span><span>${tx}</span>`);
    r.appendChild(c); chips.push(c);
  });

  const foot = place(T('', '', { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '19px', fontWeight: '600', color: '#9A8575', letterSpacing: '1.4px' }), r, 142, 714);
  foot.innerHTML = `<span>TỪ GIAO DIỆN ĐẾN TỪNG CHỨC NĂNG</span><span style="width:56px;height:1.5px;background:#D9C4B2;display:block"></span>`;

  S.update = t => {
    const e0 = eOut(pr(t, .15, 1.1));
    photoMain.style.transform = `scale(${lerp(1.07, 1, eOut(pr(t, 0, 9)))})`;
    photoMain.style.opacity = eOut(pr(t, 0, .7));
    pop(photoA, pr(t, .35, .95), 34, 0);
    pop(photoB, pr(t, .5, 1.1), 34, 0);
    kick.style.opacity = eOut(pr(t, .1, .6));
    const p1 = eOut(pr(t, .2, .95));
    l1.style.opacity = p1; l1.style.transform = `translateY(${(1 - p1) * 40}px)`;
    const p2 = eOut(pr(t, .45, 1.25));
    l2.style.opacity = p2; l2.style.transform = `translateY(${(1 - p2) * 46}px)`;
    rule.style.transform = `scaleX(${eInOut(pr(t, .9, 1.6))})`;
    tag.style.opacity = eOut(pr(t, 1.1, 1.8));
    tag.style.transform = `translateY(${(1 - eOut(pr(t, 1.1, 1.8))) * 20}px)`;
    chips.forEach((c, i) => {
      const p = pr(t, 4.5 + i * .34, 5.3 + i * .34);
      const e = eOut(cl(p));
      c.style.opacity = e; c.style.transform = `translateY(${(1 - e) * 26}px) scale(${lerp(.9, 1, e)})`;
    });
    foot.style.opacity = eOut(pr(t, 8.4, 9.3));
    r.style.transform = `scale(${1 + .012 * pr(t, 0, S.meta.dur)})`;
  };
}

/* ================= 02 · OVERVIEW ================= */
{
  const S = scene(2), r = S.root;
  head(r, 'TỔNG QUAN', 'Ba vai trò, một nền tảng', 140, 96);

  const roles = [
    { ic: 'user', name: 'Khách hàng', tag: 'KHÁCH', items: ['Đặt món · Đặt bàn', 'Thanh toán MoMo', 'Trợ lý ảo Trà My'], tone: '#E8622C', bg: '#FFF0E6' },
    { ic: 'staff', name: 'Nhân viên', tag: 'NHÂN VIÊN', items: ['Chấm công khuôn mặt', 'Ca làm · Bảng lương', 'POS tại quầy'], tone: '#2F7D4F', bg: '#EAF6EE' },
    { ic: 'admin', name: 'Quản trị viên', tag: 'QUẢN TRỊ', items: ['Dashboard tổng hợp', 'Thực đơn · Kho · Nhân sự', 'Phân quyền chi tiết'], tone: '#B7791F', bg: '#FDF3DE' }
  ];
  const cards = [], bullets = [], conline = [], ent = [0, 0, 0];
  roles.forEach((o, i) => {
    const x = 140 + i * 560, y = 244;
    const c = E('div', 'card', { position: 'absolute', left: x + 'px', top: y + 'px', width: '520px', height: '336px', padding: '30px 32px', borderRadius: '24px', transition: 'none' });
    c.appendChild(T('', o.tag, { position: 'absolute', right: '30px', top: '30px', fontSize: '12px', fontWeight: '800', letterSpacing: '2.6px', color: o.tone, opacity: .8 }));
    const ib = E('div', '', { width: '62px', height: '62px', borderRadius: '18px', background: o.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' });
    ib.innerHTML = iconSvg(o.ic, o.tone, 30);
    c.appendChild(ib);
    c.appendChild(T('', o.name, { fontSize: '28px', fontWeight: '800', letterSpacing: '-.5px', marginTop: '22px' }));
    const ul = E('div', '', { position: 'absolute', left: '32px', top: '188px', display: 'flex', flexDirection: 'column', gap: '13px' });
    o.items.forEach(tx => {
      const row = E('div', '', { display: 'flex', alignItems: 'center', gap: '11px', fontSize: '19px', fontWeight: '500', color: '#5E4B3D' });
      row.innerHTML = `<span style="width:7px;height:7px;border-radius:50%;background:${o.tone};flex:0 0 auto"></span><span>${tx}</span>`;
      ul.appendChild(row);
    });
    c.appendChild(ul);
    r.appendChild(c); cards.push(c); bullets.push(ul);
    if (i < 2) {
      const ln = E('div', '', { position: 'absolute', left: (x + 522) + 'px', top: '396px', width: '36px', height: '2px', background: '#E9D6C6', transformOrigin: 'left center' });
      r.appendChild(ln); conline.push(ln);
    }
  });

  const barY = 662;
  const bar = E('div', 'card', { position: 'absolute', left: '140px', top: barY + 'px', width: '1640px', height: '128px', borderRadius: '24px', display: 'flex', alignItems: 'center', padding: '0 34px', gap: '18px' });
  bar.appendChild(T('', 'NỀN TẢNG', { fontSize: '13px', fontWeight: '800', letterSpacing: '3px', color: '#A08A78', width: '110px' }));
  const techs = ['Node.js · Express', 'GraphQL', 'MySQL', 'Flask', 'JWT', 'MoMo', 'Mô hình học máy'];
  const techEls = techs.map((tx, i) => {
    const c = E('div', 'chip', { height: '50px', padding: '0 20px', fontSize: '18px', background: i === 6 ? '#EEF8F1' : '#fff', borderColor: i === 6 ? 'rgba(47,125,79,.3)' : 'rgba(232,98,44,.24)' }, tx);
    bar.appendChild(c); return c;
  });
  r.appendChild(bar);
  const conn = E('div', '', { position: 'absolute', left: '400px', top: (244 + 336) + 'px', width: '1120px', height: (barY - 244 - 336) + 'px' });
  r.appendChild(conn);
  const verts = [0, 1, 2].map(i => {
    const v = E('div', '', { position: 'absolute', left: (i * 560 + 260) + 'px', top: '0', width: '2px', height: '100%', background: 'linear-gradient(180deg,rgba(232,98,44,.35),rgba(232,98,44,.05))', transformOrigin: 'top center' });
    conn.appendChild(v); return v;
  });

  S.update = t => {
    [0, 1, 2].forEach(i => {
      const p = eOut(pr(t, .25 + i * .22, 1.05 + i * .22));
      ent[i] = p;
      cards[i].style.transform = `translateY(${(1 - p) * 34}px)`;
      bullets[i].style.opacity = eOut(pr(t, .7 + i * .2, 1.4 + i * .2));
      if (conline[i]) conline[i].style.transform = `scaleX(${eInOut(pr(t, .8 + i * .2, 1.5 + i * .2))})`;
      verts[i].style.transform = `scaleY(${eInOut(pr(t, 17.9 + i * .1, 18.6 + i * .1))})`;
    });

    let focus = -1;
    if (t >= 5.3 && t < 9.9) focus = 0;
    else if (t >= 9.9 && t < 14.3) focus = 1;
    else if (t >= 14.3 && t < 17.9) focus = 2;
    cards.forEach((c, i) => {
      const on = i === focus;
      const sc = on ? lerp(1, 1.025, eOut(pr(t, focus === 0 ? 5.3 : focus === 1 ? 9.9 : 14.3, (focus === 0 ? 5.3 : focus === 1 ? 9.9 : 14.3) + .4))) : 1;
      c.style.transform = `translateY(${(1 - ent[i]) * 34 + (on ? -8 : 0)}px) scale(${sc})`;
      c.style.opacity = ent[i] * (i === focus || focus < 0 ? 1 : .72);
      c.style.borderColor = on ? roles[i].tone + '88' : 'rgba(226,120,70,.14)';
      c.style.boxShadow = on ? `0 30px 70px ${roles[i].tone}2e` : '0 24px 60px rgba(120,60,20,.10)';
    });

    const pb = eOut(pr(t, 17.6, 18.3));
    bar.style.opacity = pb;
    bar.style.transform = `translateY(${(1 - pb) * 40}px)`;
    techEls.forEach((el, i) => {
      const p = eOut(pr(t, 17.95 + i * .08, 18.55 + i * .08));
      el.style.opacity = p;
      el.style.transform = `translateY(${(1 - p) * 16}px)`;
    });
  };
}

/* ================= 03 · HOME ================= */
{
  const S = scene(3), r = S.root;
  head(r, 'TRANG CHỦ', 'Điểm chạm đầu tiên của khách', 180, 92);
  const bx = 180, by = 200, bw = 1560, ih = 628;
  const B = browserAt(r, bx, by, bw, ih);
  const mk = src => { const im = img(src, { position: 'absolute', left: '0', top: '0', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }); B.shot.appendChild(im); return im; };
  const A = mk('assets/ui/home.png');
  const Bm = mk('assets/ui/home_ban_chay.png');
  const C = mk('assets/ui/home_goi_y.png');

  const s = bw / 1918, X = bx, Y = by + 44;
  const cNav = callout(r, 1, 'Thanh điều hướng trong tầm tay', 1180, 352);
  const cTop = callout(r, 2, 'Top món bán chạy', 520, 742);
  const cRec = callout(r, 3, 'Gợi ý dành riêng cho bạn', 700, 452);
  const cNav2 = callout(r, 4, 'Điều hướng giữ mọi chức năng', 1180, 352);
  const cMenu = callout(r, 5, 'Một cú nhấp để xem thực đơn', 1256, 366);
  const hlNav = hlBox(r, X + 758 * s, Y + 26 * s, (1520 - 758) * s, 72 * s);
  const hlRec = hlBox(r, X + 620 * s, Y + 122 * s, (1290 - 620) * s, 92 * s);
  const hlMenu = hlBox(r, X + 1165 * s, Y + 18 * s, 150 * s, 78 * s);
  const cur = cursorPair(r);

  S.update = t => {
    const pin = eOut(pr(t, .2, .95));
    B.f.style.opacity = pin;
    B.f.style.transform = `translateY(${(1 - pin) * 40}px) scale(${lerp(.98, 1, pin)})`;
    const a = 1 - pr(t, 3.0, 3.7), b = pr(t, 3.0, 3.7) * (1 - pr(t, 7.2, 7.9)), c = pr(t, 7.2, 7.9);
    A.style.opacity = cl(a); Bm.style.opacity = cl(b) * (A.style.opacity > .01 ? 1 : 1); C.style.opacity = cl(c);
    A.style.transform = `translateY(${-pr(t, 3.0, 6.6) * 24}px) scale(${lerp(1, 1.03, pr(t, 0, 6))})`;
    Bm.style.transform = `translateY(${(1 - eOut(pr(t, 3.0, 3.7))) * 26 - pr(t, 3.0, 7.2) * 10}px)`;
    C.style.transform = `translateY(${(1 - eOut(pr(t, 7.2, 7.9))) * 26}px)`;
    if (t > 7.9) Bm.style.opacity = 0;

    showC(cNav, vis(t, .5, 2.9));
    showC(cTop, vis(t, 3.3, 7.0));
    showC(cRec, vis(t, 7.6, 11.0));
    showC(cNav2, vis(t, 10.8, 13.4));
    showC(cMenu, vis(t, 13.8, 16.8));
    showHl(hlNav, vis(t, 10.8, 13.4, .4, .3));
    showHl(hlRec, vis(t, 7.6, 10.9, .4, .3));
    showHl(hlMenu, vis(t, 13.8, 16.8, .4, .3));
    hlMenu.style.borderColor = 'rgba(47,125,79,.92)';
    hlMenu.style.boxShadow = '0 0 0 7px rgba(47,125,79,.13)';

    moveCursor(cur, t, [[13.4, 1540, 700], [14.6, 1185, 291], [16.2, 1185, 291]]);
    cur.c.style.opacity = vis(t, 13.4, 16.6);
    clickRipple(cur, t, 15.05);
  };
}

/* ================= 04 · MENU ================= */
{
  const S = scene(4), r = S.root;
  head(r, 'THỰC ĐƠN', '25 món, lọc theo danh mục và khoảng giá', 180, 88);
  const bx = 180, by = 180, bw = 1560, ih = 708;
  const B = browserAt(r, bx, by, bw, ih, 'Ẩm Thực Phương Nam · Thực đơn');
  const mk = src => { const im = img(src, { position: 'absolute', left: '0', top: '0', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left' }); B.shot.appendChild(im); return im; };
  const A = mk('assets/ui/menu.png');
  const C = mk('assets/ui/menu_goi_y.png');
  const s = bw / 1386, X = bx, Y = by + 44;
  const c1 = callout(r, 1, '25 món trong cơ sở dữ liệu', 980, 356);
  const c2 = callout(r, 2, 'Lọc theo danh mục và khoảng giá', 596, 420);
  const c3 = callout(r, 3, 'Tìm kiếm và sắp xếp', 1010, 432);
  const c4 = callout(r, 4, 'Nhãn cá nhân hóa trên từng món', 800, 470);
  const c5 = callout(r, 5, 'Giá và tình trạng đồng bộ từ CSDL', 860, 792);
  const hlTitle = hlBox(r, X + 378 * s, Y + 124 * s, 292 * s, 48 * s);
  const hlFilter = hlBox(r, X + 16 * s, Y + 116 * s, 334 * s, 430 * s);
  const hlSearch = hlBox(r, X + 1222 * s, Y + 16 * s, 44 * s, 44 * s);
  const hlSort = hlBox(r, X + 1186 * s, Y + 126 * s, 172 * s, 46 * s);
  const hlFav = hlBox(r, X + 42 * s, Y + 204 * s, 138 * s, 34 * s, true);
  const hlTags = hlBox(r, X + 388 * s, Y + 116 * s, 486 * s, 46 * s, true);
  const hlPrice = hlBox(r, X + 388 * s, Y + 462 * s, 200 * s, 44 * s);
  const cur = cursorPair(r);

  S.update = t => {
    const pin = eOut(pr(t, .2, .9));
    B.f.style.opacity = pin;
    B.f.style.transform = `translateY(${(1 - pin) * 34}px) scale(${lerp(.985, 1, pin)})`;
    const p = pr(t, 11.9, 12.6);
    A.style.opacity = 1 - p;
    C.style.opacity = p;
    A.style.transform = `translateY(${-p * 18}px) scale(${1 + .012 * pr(t, 0, 11.9)})`;
    C.style.transform = `translateY(${(1 - eOut(p)) * 22}px)`;

    showC(c1, vis(t, .4, 3.9));
    showC(c2, vis(t, 4.1, 7.9));
    showC(c3, vis(t, 8.4, 11.5));
    showC(c4, vis(t, 12.1, 15.1));
    showC(c5, vis(t, 15.7, 18.9));
    showHl(hlTitle, vis(t, .4, 3.9));
    showHl(hlFilter, vis(t, 4.1, 7.9));
    showHl(hlSearch, vis(t, 8.4, 11.5));
    showHl(hlSort, vis(t, 8.4, 11.5));
    showHl(hlFav, vis(t, 12.1, 15.1));
    showHl(hlTags, vis(t, 12.1, 15.1));
    showHl(hlPrice, vis(t, 15.7, 18.9));

    moveCursor(cur, t, [[7.9, 1500, 780], [9.0, 1610, 392], [11.2, 1610, 392]]);
    cur.c.style.opacity = vis(t, 7.9, 11.3);
    clickRipple(cur, t, 9.2);
  };
}

/* ================= 05 · DISH + CART ================= */
{
  const S = scene(5), r = S.root;
  head(r, 'CHI TIẾT MÓN', 'Chọn món, thêm vào giỏ, gợi ý mua kèm', 140, 92);

  const card = E('div', 'card', { position: 'absolute', left: '140px', top: '192px', width: '740px', height: '700px', borderRadius: '24px', overflow: 'hidden' });
  card.appendChild(img('assets/food/ga_hap.png', { position: 'absolute', left: '0', top: '0', width: '740px', height: '338px', objectFit: 'cover' }));
  card.appendChild(E('div', '', { position: 'absolute', left: '0', top: '268px', width: '740px', height: '80px', background: 'linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,.28))' }));
  card.appendChild(T('', 'Gà hấp rượu', { position: 'absolute', left: '34px', top: '356px', fontSize: '32px', fontWeight: '800', letterSpacing: '-.6px' }));
  const price = T('money', '450.000đ', { position: 'absolute', left: '34px', top: '404px', fontSize: '28px' });
  card.appendChild(price);
  card.appendChild(T('', 'Gà hấp rượu là món ăn thơm ngon với thịt gà mềm ngọt,<br>được hấp cùng rượu và các loại gia vị đặc trưng.', { position: 'absolute', left: '34px', top: '452px', fontSize: '17px', lineHeight: '1.55', color: '#7A6658' }));
  const stepper = E('div', '', { position: 'absolute', left: '34px', top: '552px', width: '196px', height: '58px', borderRadius: '14px', border: '1.5px solid rgba(232,98,44,.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', background: '#FFF9F4' });
  stepper.innerHTML = `<div style="width:42px;height:42px;border-radius:10px;background:#fff;border:1px solid #EEDCCB;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#B59A86">−</div><div style="font-size:22px;font-weight:800">1</div><div style="width:42px;height:42px;border-radius:10px;background:#E8622C;color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800">+</div>`;
  card.appendChild(stepper);
  card.appendChild(T('', 'Còn phục vụ', { position: 'absolute', left: '34px', top: '626px', fontSize: '14px', fontWeight: '700', color: '#2F7D4F', letterSpacing: '.5px' }));
  const addBtn = E('div', 'btn', { position: 'absolute', left: '264px', top: '548px', width: '442px', height: '66px', fontSize: '21px' });
  addBtn.innerHTML = `${iconSvg('cart', '#fff', 22)}<span>Thêm vào giỏ · 450.000đ</span>`;
  card.appendChild(addBtn);
  r.appendChild(card);

  const cart = E('div', 'card', { position: 'absolute', left: '940px', top: '192px', width: '820px', height: '700px', borderRadius: '24px' });
  cart.appendChild(T('', 'Giỏ hàng', { position: 'absolute', left: '34px', top: '28px', fontSize: '27px', fontWeight: '800' }));
  const badge = E('div', '', { position: 'absolute', left: '166px', top: '30px', minWidth: '30px', height: '30px', borderRadius: '999px', background: '#E8622C', color: '#fff', fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px' }, '2');
  cart.appendChild(badge);
  cart.appendChild(T('', 'Tạm tính', { position: 'absolute', right: '34px', top: '34px', fontSize: '15px', color: '#9A8575', fontWeight: '600' }));

  const items = [
    { src: 'assets/food/com_chien.png', name: 'Cơm chiên heo quay', note: 'Món chính · 1 phần', price: 99000 },
    { src: 'assets/food/ga_hap.png', name: 'Gà hấp rượu', note: 'Món chính · 1 phần', price: 450000 }
  ];
  const itemEls = [];
  items.forEach((it, i) => {
    const row = E('div', '', { position: 'absolute', left: '34px', top: (96 + i * 96) + 'px', width: '752px', height: '84px', borderRadius: '16px', background: '#FFFBF7', border: '1px solid rgba(226,120,70,.12)', display: 'flex', alignItems: 'center', gap: '16px', padding: '0 14px' });
    row.appendChild(img(it.src, { width: '64px', height: '64px', objectFit: 'cover', borderRadius: '12px' }));
    const mid = E('div', '', { display: 'flex', flexDirection: 'column', gap: '4px', flex: '1' });
    mid.appendChild(T('', it.name, { fontSize: '19px', fontWeight: '700' }));
    mid.appendChild(T('', it.note, { fontSize: '14px', color: '#9A8575', fontWeight: '500' }));
    row.appendChild(mid);
    row.appendChild(T('money', vnd(it.price), { fontSize: '19px' }));
    cart.appendChild(row); itemEls.push(row);
  });

  const sugg = E('div', '', { position: 'absolute', left: '34px', top: '300px', width: '752px', padding: '18px 20px', borderRadius: '16px', background: '#EEF8F1', border: '1px solid rgba(47,125,79,.18)' });
  sugg.innerHTML = `<div style="font-size:13px;font-weight:800;letter-spacing:2px;color:#2F7D4F">DÙNG KÈM ĐƯỢC GỢI Ý</div>
    <div style="display:flex;gap:10px;margin-top:12px">
      <div class="chip g" style="height:44px;padding:0 16px;font-size:16px">Đậu hũ sốc rau răm · 59.000đ</div>
      <div class="chip g" style="height:44px;padding:0 16px;font-size:16px">Lẩu cá · 300.000đ</div>
    </div>`;
  cart.appendChild(sugg);

  cart.appendChild(E('div', 'divider', { left: '34px', top: '420px', width: '752px' }));
  const rows = [
    ['Tạm tính', '549.000đ', false],
    ['Phí giao hàng', 'Miễn phí', false]
  ];
  rows.forEach(([k, v], i) => {
    cart.appendChild(T('', k, { position: 'absolute', left: '36px', top: (446 + i * 40) + 'px', fontSize: '18px', color: '#7A6658', fontWeight: '500' }));
    cart.appendChild(T('', v, { position: 'absolute', right: '36px', top: (446 + i * 40) + 'px', fontSize: '18px', fontWeight: '700', color: i === 1 ? '#2F7D4F' : '#3A2A20' }));
  });
  cart.appendChild(T('', 'Tổng cộng', { position: 'absolute', left: '36px', top: '548px', fontSize: '21px', fontWeight: '800' }));
  const total = T('money', '0đ', { position: 'absolute', right: '36px', top: '538px', fontSize: '34px' });
  cart.appendChild(total);
  const go = E('div', 'btn', { position: 'absolute', left: '34px', top: '606px', width: '752px', height: '64px', fontSize: '21px' });
  go.innerHTML = `<span>Tiến hành thanh toán</span>${iconSvg('arrow', '#fff', 22)}`;
  cart.appendChild(go);
  r.appendChild(cart);

  const c1 = callout(r, 1, 'Ảnh, mô tả và giá', 520, 470);
  const c2 = callout(r, 2, 'Chọn số lượng, thêm vào giỏ', 470, 640);
  const c3 = callout(r, 3, 'Gợi ý món dùng chung', 1006, 330, true);
  const c4 = callout(r, 4, 'Giữ nguyên khi chuyển trang', 1006, 600);
  const hlAdd = hlBox(r, 400, 730, 320, 90);
  const hlSugg = hlBox(r, 972, 482, 752, 130, true);
  const hlTotal = hlBox(r, 1452, 700, 274, 90);
  const cur = cursorPair(r);

  S.update = t => {
    const pin = eOut(pr(t, .15, .85));
    card.style.opacity = pin; card.style.transform = `translateY(${(1 - pin) * 30}px)`;
    card.querySelector('img').style.transform = `scale(${lerp(1.06, 1, eOut(pr(t, 0, 8)))})`;

    const cp = eOut(pr(t, 7.7, 8.5));
    cart.style.opacity = cp;
    cart.style.transform = `translateX(${(1 - cp) * 110}px)`;
    itemEls.forEach((el, i) => { const p = eOut(pr(t, 7.9 + i * .18, 8.6 + i * .18)); el.style.opacity = p; el.style.transform = `translateX(${(1 - p) * 60}px)`; });
    const sp = eOut(pr(t, 10.15, 10.85));
    sugg.style.opacity = sp; sugg.style.transform = `translateY(${(1 - sp) * 16}px)`;
    const cp2 = eOut(pr(t, 9.3, 10.3));
    const val = Math.round(549000 * cp2 / 1000) * 1000;
    total.textContent = vnd(val);
    go.style.opacity = eOut(pr(t, 9.7, 10.3));

    showC(c1, vis(t, .5, 4.9));
    showC(c2, vis(t, 5.0, 7.6));
    showC(c3, vis(t, 10.1, 14.1, .35, .3));
    showC(c4, vis(t, 11.9, 15.3));
    showHl(hlAdd, vis(t, 5.0, 7.5, .3, .3));
    showHl(hlSugg, vis(t, 10.1, 14.0, .4, .3));
    showHl(hlTotal, vis(t, 11.9, 15.3));

    const pulse = 1 + .03 * Math.sin(cl(pr(t, 10.5, 11.2)) * Math.PI);
    addBtn.style.transform = `scale(${pulse})`;
    badge.style.transform = `scale(${1 + .28 * Math.sin(cl(pr(t, 6.3, 6.9)) * Math.PI)})`;

    moveCursor(cur, t, [[4.8, 1250, 820], [5.9, 448, 776], [6.45, 448, 776]]);
    cur.c.style.opacity = vis(t, 4.8, 7.2);
    clickRipple(cur, t, 6.0);
  };
}

/* ================= 06 · CHECKOUT ================= */
{
  const S = scene(6), r = S.root;
  head(r, 'THANH TOÁN', 'Thông tin · Thanh toán · Hoàn tất', 140, 92);

  const labels = [['1', 'Thông tin'], ['2', 'Thanh toán'], ['3', 'Hoàn tất']];
  const steps = [], stepLine = [];
  labels.forEach(([n, tx], i) => {
    const x = 140 + i * 566;
    const s = E('div', 'card', { position: 'absolute', left: x + 'px', top: '196px', width: '508px', height: '94px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '16px', padding: '0 24px' });
    const dot = E('div', '', { width: '42px', height: '42px', borderRadius: '50%', background: '#F0E2D5', color: '#A08A78', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '19px', fontWeight: '800' }, n);
    s.appendChild(dot);
    s.appendChild(T('', tx, { fontSize: '22px', fontWeight: '700' }));
    r.appendChild(s); steps.push({ s, dot });
    if (i < 2) {
      const l = E('div', '', { position: 'absolute', left: (x + 512) + 'px', top: '242px', width: '52px', height: '2px', background: '#E6D2C2', transformOrigin: 'left center' });
      r.appendChild(l); stepLine.push(l);
    }
  });

  const sum = E('div', 'card', { position: 'absolute', left: '140px', top: '336px', width: '740px', height: '520px', borderRadius: '24px', padding: '30px 34px' });
  sum.appendChild(T('', 'Đơn hàng của bạn', { fontSize: '26px', fontWeight: '800' }));
  sum.appendChild(T('', '2 món · Giao tận nơi', { position: 'absolute', right: '34px', top: '36px', fontSize: '15px', color: '#9A8575', fontWeight: '600' }));
  const lines = [
    { src: 'assets/food/com_chien.png', n: 'Cơm chiên heo quay', q: '×1', p: '99.000đ' },
    { src: 'assets/food/ga_hap.png', n: 'Gà hấp rượu', q: '×1', p: '450.000đ' }
  ];
  lines.forEach((it, i) => {
    const y = 80 + i * 78;
    sum.appendChild(img(it.src, { position: 'absolute', left: '34px', top: y + 'px', width: '54px', height: '54px', objectFit: 'cover', borderRadius: '10px' }));
    sum.appendChild(T('', it.n, { position: 'absolute', left: '102px', top: (y + 6) + 'px', fontSize: '18px', fontWeight: '700' }));
    sum.appendChild(T('', it.q, { position: 'absolute', left: '102px', top: (y + 32) + 'px', fontSize: '14px', color: '#9A8575' }));
    sum.appendChild(T('', it.p, { position: 'absolute', right: '34px', top: (y + 14) + 'px', fontSize: '18px', fontWeight: '700' }));
  });
  sum.appendChild(E('div', 'divider', { left: '34px', top: '250px', width: '672px' }));
  [['Tạm tính', '549.000đ'], ['Phí giao hàng', 'Miễn phí']].forEach(([k, v], i) => {
    sum.appendChild(T('', k, { position: 'absolute', left: '36px', top: (272 + i * 36) + 'px', fontSize: '17px', color: '#7A6658' }));
    sum.appendChild(T('', v, { position: 'absolute', right: '36px', top: (272 + i * 36) + 'px', fontSize: '17px', fontWeight: '700', color: i === 1 ? '#2F7D4F' : '#3A2A20' }));
  });
  sum.appendChild(T('', 'Tổng thanh toán', { position: 'absolute', left: '36px', top: '382px', fontSize: '21px', fontWeight: '800' }));
  sum.appendChild(T('money', '549.000đ', { position: 'absolute', right: '36px', top: '372px', fontSize: '34px' }));
  sum.appendChild(E('div', '', { position: 'absolute', left: '34px', top: '438px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', color: '#2F7D4F', fontWeight: '600' }));
  sum.lastChild.innerHTML = `${iconSvg('shield', '#2F7D4F', 18)}<span>Thông tin đơn hàng được bảo mật</span>`;
  r.appendChild(sum);

  const pay = E('div', 'card', { position: 'absolute', left: '920px', top: '336px', width: '860px', height: '520px', borderRadius: '24px', padding: '30px 34px', overflow: 'hidden' });
  pay.appendChild(T('', 'Phương thức thanh toán', { fontSize: '26px', fontWeight: '800' }));
  const optWrap = E('div', '', { position: 'absolute', left: '34px', top: '88px', width: '792px' });
  const cod = E('div', '', { width: '792px', height: '92px', borderRadius: '16px', border: '1.5px solid rgba(120,70,40,.14)', background: '#FFFBF7', display: 'flex', alignItems: 'center', gap: '16px', padding: '0 20px', marginBottom: '16px' });
  cod.innerHTML = `<div style="width:44px;height:44px;border-radius:12px;background:#FFF0E6;display:flex;align-items:center;justify-content:center">${iconSvg('money', '#E8622C', 24)}</div>
    <div style="flex:1"><div style="font-size:19px;font-weight:700">Thanh toán khi nhận hàng</div><div style="font-size:14px;color:#9A8575;margin-top:2px">Trả tiền mặt khi shipper giao món</div></div>
    <div class="rd" style="width:22px;height:22px;border-radius:50%;border:2px solid #D8C4B4"></div>`;
  const momo = E('div', '', { width: '792px', height: '92px', borderRadius: '16px', border: '1.5px solid rgba(120,70,40,.14)', background: '#FFFBF7', display: 'flex', alignItems: 'center', gap: '16px', padding: '0 20px' });
  momo.innerHTML = `<div style="width:44px;height:44px;border-radius:12px;background:#FDEBF3;display:flex;align-items:center;justify-content:center">${iconSvg('wallet', '#A50064', 24)}</div>
    <div style="flex:1"><div style="font-size:19px;font-weight:700">Ví MoMo</div><div style="font-size:14px;color:#9A8575;margin-top:2px">Quét mã QR để thanh toán</div></div>
    <div class="rd" style="width:22px;height:22px;border-radius:50%;border:2px solid #D8C4B4"></div>`;
  optWrap.append(cod, momo);
  pay.appendChild(optWrap);
  pay.appendChild(T('', 'Đơn hàng sẽ được gửi tới nhà hàng ngay sau khi thanh toán.', { position: 'absolute', left: '34px', top: '292px', fontSize: '15px', color: '#9A8575' }));
  const confirmBtn = E('div', 'btn', { position: 'absolute', left: '34px', top: '356px', width: '792px', height: '62px', fontSize: '20px' }, 'Xác nhận thanh toán');
  pay.appendChild(confirmBtn);

  const qrLayer = E('div', '', { position: 'absolute', inset: '0', background: '#fff', borderRadius: '24px', padding: '28px 34px', opacity: 0 });
  qrLayer.appendChild(T('', 'Quét mã bằng ví MoMo', { fontSize: '24px', fontWeight: '800' }));
  qrLayer.appendChild(T('', 'Mở ứng dụng MoMo và quét mã bên dưới', { position: 'absolute', left: '34px', top: '66px', fontSize: '15px', color: '#9A8575' }));
  const qrBox = E('div', '', { position: 'absolute', left: '34px', top: '104px', width: '268px', height: '268px', borderRadius: '18px', border: '1px solid rgba(120,70,40,.14)', background: '#fff', overflow: 'hidden' });
  qrLayer.appendChild(qrBox);
  const scanL = E('div', '', { position: 'absolute', left: '34px', top: '104px', width: '268px', height: '3px', background: 'linear-gradient(90deg,transparent,#0EA5E9,transparent)', boxShadow: '0 0 14px rgba(14,165,233,.8)', opacity: 0 });
  qrLayer.appendChild(scanL);
  qrLayer.appendChild(T('', 'Số tiền', { position: 'absolute', left: '334px', top: '120px', fontSize: '14px', fontWeight: '700', color: '#9A8575', letterSpacing: '1px' }));
  qrLayer.appendChild(T('money', '549.000đ', { position: 'absolute', left: '332px', top: '146px', fontSize: '34px' }));
  qrLayer.appendChild(T('', 'Nội dung', { position: 'absolute', left: '334px', top: '212px', fontSize: '14px', fontWeight: '700', color: '#9A8575', letterSpacing: '1px' }));
  qrLayer.appendChild(T('', 'Thanh toan don hang', { position: 'absolute', left: '332px', top: '238px', fontSize: '16px', fontWeight: '600', color: '#5E4B3D' }));
  qrLayer.appendChild(T('', 'Mã QR minh họa cho giao dịch MoMo.', { position: 'absolute', left: '334px', top: '300px', fontSize: '13px', color: '#B59A86', fontStyle: 'italic' }));
  const okWrap = E('div', '', { position: 'absolute', left: '34px', top: '386px', width: '792px', height: '84px', borderRadius: '16px', background: '#EEF8F1', border: '1px solid rgba(47,125,79,.2)', display: 'flex', alignItems: 'center', gap: '14px', padding: '0 18px', opacity: 0 });
  okWrap.innerHTML = `<div style="width:46px;height:46px;border-radius:50%;background:#2F7D4F;display:flex;align-items:center;justify-content:center">${iconSvg('check', '#fff', 24)}</div>
    <div><div style="font-size:18px;font-weight:800;color:#25603C">Thanh toán thành công</div><div style="font-size:14px;color:#4E7A5F;margin-top:2px">Đơn hàng đã được gửi tới nhà hàng</div></div>`;
  qrLayer.appendChild(okWrap);
  pay.appendChild(qrLayer);
  r.appendChild(pay);

  const notify = E('div', 'card', { position: 'absolute', left: '1150px', top: '690px', width: '630px', height: '150px', borderRadius: '20px', padding: '22px 26px', background: '#fff' });
  notify.innerHTML = `<div style="display:flex;align-items:center;gap:12px">
      <div style="width:44px;height:44px;border-radius:12px;background:#FFF0E6;display:flex;align-items:center;justify-content:center">${iconSvg('report', '#E8622C', 24)}</div>
      <div style="flex:1"><div style="font-size:12px;font-weight:800;letter-spacing:2px;color:#E8622C">ĐƠN HÀNG MỚI</div>
      <div style="font-size:22px;font-weight:800;margin-top:2px">549.000đ</div></div>
      <div class="chip" style="height:38px;padding:0 14px;font-size:14px;border-color:rgba(242,181,68,.5);background:#FEF7E7;color:#9A6B10">Chờ xác nhận</div>
    </div>
    <div style="margin-top:12px;font-size:14px;color:#9A8575">Đơn vừa thanh toán xuất hiện trong màn hình quản trị.</div>`;
  r.appendChild(notify);

  const track = E('div', '', { position: 'absolute', left: '920px', top: '868px', width: '860px', height: '70px' });
  const tchips = ['Chờ xác nhận', 'Đã xác nhận', 'Hoàn thành', 'Đã hủy'].map((tx, i) => {
    const c = E('div', '', { position: 'absolute', left: (i === 3 ? 680 : i * 212) + 'px', top: '18px', height: '46px', borderRadius: '999px', padding: '0 18px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '700', background: '#fff', border: '1.5px solid rgba(120,70,40,.14)', color: i === 3 ? '#B4493B' : '#A08A78', opacity: 0 });
    c.innerHTML = `<span style="width:9px;height:9px;border-radius:50%;background:currentColor"></span>${tx}`;
    track.appendChild(c); return c;
  });
  r.appendChild(track);

  const c1 = callout(r, 1, 'Ba bước rõ ràng', 1050, 288);
  const c2 = callout(r, 2, 'COD hoặc ví MoMo', 1430, 444);
  const c3 = callout(r, 3, 'Quét QR, xác nhận tức thì', 1290, 600, true);
  const c4 = callout(r, 4, 'Đơn hàng sang màn hình quản trị', 1150, 858);
  const c5 = callout(r, 5, 'Trạng thái theo từng công đoạn', 1420, 818);
  const hlSteps = hlBox(r, 140, 196, 1640, 94);
  const hlPay = hlBox(r, 954, 424, 792, 190);
  const hlNotify = hlBox(r, 1170, 700, 600, 130);
  const hlTrack = hlBox(r, 950, 880, 830, 58, true);

  // deterministic decorative QR (not scannable)
  (function drawQR() {
    const n = 25, cell = 268 / n;
    let seed = 20260512;
    const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    const cv = E('canvas', '', { width: '268px', height: '268px', position: 'absolute', left: '0', top: '0' });
    cv.width = 268; cv.height = 268;
    qrBox.appendChild(cv);
    const g = cv.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, 268, 268);
    g.fillStyle = '#1E1B18';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const inFinder = (x < 7 && y < 7) || (x > n - 8 && y < 7) || (x < 7 && y > n - 8);
      if (inFinder) continue;
      if (rnd() > .54) g.fillRect(Math.round(x * cell), Math.round(y * cell), Math.ceil(cell), Math.ceil(cell));
    }
    [[0, 0], [n - 7, 0], [0, n - 7]].forEach(([fx, fy]) => {
      g.fillStyle = '#1E1B18'; g.fillRect(fx * cell, fy * cell, 7 * cell, 7 * cell);
      g.fillStyle = '#fff'; g.fillRect((fx + 1) * cell, (fy + 1) * cell, 5 * cell, 5 * cell);
      g.fillStyle = '#A50064'; g.fillRect((fx + 2) * cell, (fy + 2) * cell, 3 * cell, 3 * cell);
    });
    g.fillStyle = '#fff'; g.fillRect(104, 104, 60, 60);
    g.fillStyle = '#A50064'; g.beginPath(); g.arc(134, 134, 24, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff'; g.font = '700 13px "Be Vietnam Pro",sans-serif'; g.textAlign = 'center'; g.fillText('momo', 134, 139);
  })();

  S.update = t => {
    steps.forEach((o, i) => {
      const p = eOut(pr(t, .2 + i * .22, .9 + i * .22));
      o.s.style.opacity = p; o.s.style.transform = `translateY(${(1 - p) * 24}px)`;
      if (stepLine[i]) stepLine[i].style.transform = `scaleX(${eInOut(pr(t, .5 + i * .2, 1.2 + i * .2))})`;
    });
    const active = t >= 8.4 ? 2 : t >= 4.6 ? 1 : 0;
    steps.forEach((o, i) => {
      const on = i === active, done = i < active;
      o.dot.style.background = done ? '#2F7D4F' : on ? '#E8622C' : '#F0E2D5';
      o.dot.style.color = done || on ? '#fff' : '#A08A78';
      o.s.style.borderColor = on ? 'rgba(232,98,44,.55)' : done ? 'rgba(47,125,79,.4)' : 'rgba(226,120,70,.14)';
      o.s.style.boxShadow = on ? '0 24px 54px rgba(232,98,44,.16)' : '0 24px 60px rgba(120,60,20,.10)';
    });

    const p1 = eOut(pr(t, .6, 1.4));
    sum.style.opacity = p1; sum.style.transform = `translateY(${(1 - p1) * 26}px)`;
    const p2 = eOut(pr(t, 4.6, 5.4));
    pay.style.opacity = p2; pay.style.transform = `translateY(${(1 - p2) * 26}px)`;

    const sel = eOut(pr(t, 8.4, 9.0));
    momo.style.borderColor = `rgba(165,0,100,${.3 + .6 * sel})`;
    momo.style.background = sel > .5 ? '#FDF1F7' : '#FFFBF7';
    momo.querySelector('.rd').style.borderColor = sel > .5 ? '#A50064' : '#D8C4B4';
    momo.querySelector('.rd').style.background = sel > .5 ? '#A50064' : 'transparent';
    const qp = eOut(pr(t, 8.8, 9.7));
    qrLayer.style.opacity = qp;
    qrLayer.style.transform = `translateY(${(1 - qp) * 30}px)`;

    const scan = pr(t, 9.4, 11.0);
    scanL.style.opacity = (t > 9.3 && t < 11.05) ? .95 : 0;
    scanL.style.top = lerp(108, 368, (Math.sin(scan * Math.PI * 2.4 - Math.PI / 2) + 1) / 2) + 'px';
    const ok = eOut(pr(t, 11.0, 11.5));
    okWrap.style.opacity = ok;
    okWrap.style.transform = `translateY(${(1 - ok) * 16}px) scale(${lerp(.96, 1, ok)})`;

    const np = eOut(pr(t, 12.6, 13.4));
    notify.style.opacity = np;
    notify.style.transform = `translateX(${(1 - np) * 60}px)`;
    notify.style.display = t > 15.6 ? 'none' : 'block';

    const tp = eOut(pr(t, 15.8, 16.4));
    track.style.opacity = tp;
    tchips.forEach((c, i) => {
      const p = eOut(pr(t, 15.9 + i * .4, 16.4 + i * .4));
      c.style.opacity = p;
      c.style.transform = `translateY(${(1 - p) * 12}px)`;
      const lit = i === 0 || (i === 1 && t > 16.7) || (i === 2 && t > 17.3);
      c.style.color = lit ? (i === 0 ? '#9A6B10' : i === 1 ? '#1D4ED8' : '#25603C') : '#A08A78';
      c.style.background = lit ? (i === 0 ? '#FEF7E7' : i === 1 ? '#EEF4FF' : '#EEF8F1') : '#fff';
      c.style.borderColor = lit ? 'rgba(120,70,40,.22)' : 'rgba(120,70,40,.12)';
    });

    showC(c1, vis(t, .5, 4.6));
    showC(c2, vis(t, 4.9, 8.2));
    showC(c3, vis(t, 8.8, 12.2, .35, .3));
    showC(c4, vis(t, 12.8, 15.5));
    showC(c5, vis(t, 16.0, 18.4));
    showHl(hlSteps, vis(t, .6, 4.4));
    showHl(hlPay, vis(t, 4.9, 8.2));
    showHl(hlNotify, vis(t, 12.8, 15.5));
    showHl(hlTrack, vis(t, 16.0, 18.4));
  };
}

/* ================= 07 · BOOKING ================= */
{
  const S = scene(7), r = S.root;
  head(r, 'ĐẶT BÀN', 'Tự chọn ngày, giờ và số người', 140, 92);

  const form = E('div', 'card', { position: 'absolute', left: '140px', top: '192px', width: '760px', height: '700px', borderRadius: '24px', padding: '30px 34px' });
  form.appendChild(T('', 'Thông tin đặt bàn', { fontSize: '26px', fontWeight: '800' }));

  form.appendChild(T('', 'Ngày', { position: 'absolute', left: '34px', top: '86px', fontSize: '15px', fontWeight: '700', color: '#7A6658', letterSpacing: '.6px' }));
  const days = ['12/11', '13/11', '14/11'];
  days.forEach((d, i) => {
    const c = E('div', '', { position: 'absolute', left: (34 + i * 150) + 'px', top: '114px', width: '136px', height: '50px', borderRadius: '12px', border: '1.5px solid rgba(120,70,40,.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', background: i === 0 ? '#E8622C' : '#fff', color: i === 0 ? '#fff' : '#5E4B3D' }, d);
    form.appendChild(c);
  });
  form.appendChild(T('', 'Giờ đến', { position: 'absolute', left: '34px', top: '190px', fontSize: '15px', fontWeight: '700', color: '#7A6658', letterSpacing: '.6px' }));
  const times = ['18:00', '18:30', '19:00', '19:30', '20:00'];
  times.forEach((d, i) => {
    const c = E('div', '', { position: 'absolute', left: (34 + i * 136) + 'px', top: '218px', width: '124px', height: '46px', borderRadius: '11px', border: '1.5px solid rgba(120,70,40,.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', background: i === 2 ? '#2F7D4F' : '#fff', color: i === 2 ? '#fff' : '#5E4B3D' }, d);
    form.appendChild(c);
  });
  form.appendChild(T('', 'Số lượng khách', { position: 'absolute', left: '34px', top: '294px', fontSize: '15px', fontWeight: '700', color: '#7A6658', letterSpacing: '.6px' }));
  const gstep = E('div', '', { position: 'absolute', left: '34px', top: '322px', width: '230px', height: '56px', borderRadius: '13px', border: '1.5px solid rgba(232,98,44,.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', background: '#FFF9F4' });
  gstep.innerHTML = `<div style="width:40px;height:40px;border-radius:9px;background:#fff;border:1px solid #EEDCCB;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#B59A86">−</div><div style="font-size:19px;font-weight:800">4 khách</div><div style="width:40px;height:40px;border-radius:9px;background:#E8622C;color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800">+</div>`;
  form.appendChild(gstep);
  form.appendChild(T('', 'Khu vực', { position: 'absolute', left: '34px', top: '400px', fontSize: '15px', fontWeight: '700', color: '#7A6658', letterSpacing: '.6px' }));
  [['Sân vườn', 34, true], ['Máy lạnh', 230, false]].forEach(([tx, x, on]) => {
    form.appendChild(E('div', '', { position: 'absolute', left: x + 'px', top: '428px', width: '180px', height: '50px', borderRadius: '12px', border: '1.5px solid ' + (on ? 'rgba(47,125,79,.5)' : 'rgba(120,70,40,.16)'), background: on ? '#EEF8F1' : '#fff', color: on ? '#25603C' : '#5E4B3D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', fontWeight: '700' }, tx));
  });
  form.appendChild(T('', 'Chọn món trước để nhà hàng chuẩn bị tốt hơn.', { position: 'absolute', left: '34px', top: '506px', fontSize: '14px', color: '#9A8575' }));
  const bookBtn = E('div', 'btn', { position: 'absolute', left: '34px', top: '556px', width: '692px', height: '66px', fontSize: '21px' });
  bookBtn.innerHTML = `${iconSvg('calendar', '#fff', 24)}<span>Đặt bàn</span>`;
  form.appendChild(bookBtn);
  r.appendChild(form);

  const cap = E('div', 'card', { position: 'absolute', left: '940px', top: '192px', width: '820px', height: '236px', borderRadius: '24px', padding: '28px 32px' });
  cap.appendChild(T('', 'Kiểm tra sức chứa', { fontSize: '24px', fontWeight: '800' }));
  cap.appendChild(T('', 'Bàn trống được kiểm tra trước khi xác nhận.', { position: 'absolute', right: '32px', top: '30px', fontSize: '14px', color: '#9A8575' }));
  const occupied = [0, 2, 5, 6, 9, 11, 14, 17];
  for (let i = 0; i < 18; i++) {
    const x = 34 + (i % 9) * 84, y = 92 + Math.floor(i / 9) * 62;
    const free = !occupied.includes(i);
    const cell = E('div', '', { position: 'absolute', left: x + 'px', top: y + 'px', width: '64px', height: '46px', borderRadius: '9px', background: free ? '#EEF8F1' : '#F3ECE5', border: '1.5px solid ' + (free ? 'rgba(47,125,79,.35)' : 'rgba(120,70,40,.10)'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: free ? '#2F7D4F' : '#B59A86' });
    cell.innerHTML = iconSvg('table', free ? '#2F7D4F' : '#B59A86', 20);
    cap.appendChild(cell);
  }
  const capPill = E('div', 'chip g', { position: 'absolute', left: '34px', top: '-54px', height: '40px', padding: '0 16px', fontSize: '15px' });
  capPill.innerHTML = `<span style="width:8px;height:8px;border-radius:50%;background:#2F7D4F"></span><span>Đủ chỗ cho 4 khách lúc 19:00</span>`;
  cap.appendChild(capPill);
  r.appendChild(cap);

  const conf = E('div', 'card', { position: 'absolute', left: '940px', top: '460px', width: '820px', height: '300px', borderRadius: '24px', padding: '26px 32px', textAlign: 'center' });
  const ck = E('div', '', { position: 'absolute', left: '50%', top: '24px', width: '68px', height: '68px', borderRadius: '50%', background: '#2F7D4F', marginLeft: '-34px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 14px 30px rgba(47,125,79,.3)' });
  ck.innerHTML = iconSvg('check', '#fff', 34);
  conf.appendChild(ck);
  conf.appendChild(T('', 'Đặt bàn thành công', { position: 'absolute', left: '0', right: '0', top: '108px', fontSize: '27px', fontWeight: '800', color: '#25603C' }));
  conf.appendChild(T('', 'Mã đặt bàn #000027', { position: 'absolute', left: '0', right: '0', top: '146px', fontSize: '21px', fontWeight: '700', color: '#E8622C' }));
  const chipsRow = E('div', '', { position: 'absolute', left: '0', right: '0', top: '196px', display: 'flex', justifyContent: 'center', gap: '10px' });
  ['12/11', '19:00', '4 khách', 'Sân vườn'].forEach(tx => chipsRow.appendChild(E('div', 'chip', { height: '38px', padding: '0 14px', fontSize: '14px' }, tx)));
  conf.appendChild(chipsRow);
  conf.appendChild(T('', 'Thông tin đặt bàn được lưu trong tài khoản của bạn.', { position: 'absolute', left: '0', right: '0', top: '252px', fontSize: '14px', color: '#9A8575' }));
  r.appendChild(conf);

  const saved = E('div', 'toast', { left: '1010px', top: '784px', width: '680px', height: '54px' });
  saved.innerHTML = `<div class="ic">✓</div><span>Đã lưu vào mục “Đặt bàn của tôi”</span>`;
  r.appendChild(saved);
  const seen = E('div', 'toast', { left: '1010px', top: '842px', width: '680px', height: '54px' });
  seen.innerHTML = `<div class="ic">✓</div><span>Nhà hàng thấy ngay trong Quản lý đặt bàn</span>`;
  r.appendChild(seen);

  const c1 = callout(r, 1, 'Chọn ngày, giờ, số người', 200, 858);
  const c2 = callout(r, 2, 'Kiểm tra bàn trống trước khi xác nhận', 560, 358, true);
  const c3 = callout(r, 3, 'Mã đặt bàn hiện ngay trên màn hình', 960, 470);
  const c5 = callout(r, 5, 'Đồng bộ với mục quản lý của nhà hàng', 1000, 902, true);
  const hlForm = hlBox(r, 158, 198, 724, 644);
  const hlCap = hlBox(r, 954, 286, 300, 118, true);
  const hlConf = hlBox(r, 954, 466, 792, 286, true);
  const cur = cursorPair(r);

  S.update = t => {
    const pin = eOut(pr(t, .15, .9));
    form.style.opacity = pin; form.style.transform = `translateY(${(1 - pin) * 30}px)`;
    const cp = eOut(pr(t, 3.6, 4.4));
    cap.style.opacity = cp; cap.style.transform = `translateY(${(1 - cp) * 26}px)`;
    const kp = eOut(pr(t, 7.3, 8.1));
    conf.style.opacity = kp; conf.style.transform = `translateY(${(1 - kp) * 30}px) scale(${lerp(.97, 1, kp)})`;
    ck.style.transform = `scale(${lerp(.4, 1, eBack(pr(t, 7.3, 8.0)))})`;

    const sv = eOut(pr(t, 10.1, 10.8));
    saved.style.opacity = sv; saved.style.transform = `translateX(${(1 - sv) * 40}px)`;
    const pv = eOut(pr(t, 13.2, 13.9));
    seen.style.opacity = pv; seen.style.transform = `translateX(${(1 - pv) * 40}px)`;

    showC(c1, vis(t, .5, 4.2));
    showC(c2, vis(t, 4.4, 7.6, .35, .3));
    showC(c3, vis(t, 7.6, 10.6, .35, .3));
    showC(c5, vis(t, 13.3, 16.2, .3, .3));
    showHl(hlForm, vis(t, .6, 4.2));
    showHl(hlCap, vis(t, 4.4, 7.5, .35, .3));
    showHl(hlConf, vis(t, 7.6, 16.2, .35, .3));

    moveCursor(cur, t, [[4.4, 1460, 700], [5.2, 1110, 746], [6.4, 1110, 746]]);
    cur.c.style.opacity = vis(t, 4.4, 7.0);
    clickRipple(cur, t, 5.6);
  };
}

/* ================= 08 · CHATBOT ================= */
{
  const S = scene(8), r = S.root;
  head(r, 'TRỢ LÝ ẢO TRÀ MY', 'Hỏi đáp 24/7 bằng ngôn ngữ tự nhiên', 140, 92);

  const phone = E('div', 'phone', { left: '1268px', top: '150px', width: '474px', height: '628px' });
  const scr = E('div', 'scr');
  scr.appendChild(img('assets/ui/chatbot.png', { width: '100%', height: '100%', objectFit: 'cover' }));
  phone.appendChild(scr);
  r.appendChild(phone);
  const glow = E('div', '', { position: 'absolute', left: '1230px', top: '210px', width: '560px', height: '560px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(47,125,79,.16),rgba(47,125,79,0) 66%)', filter: 'blur(10px)' });
  r.insertBefore(glow, phone);

  const flow = [
    { ic: 'chat', t: 'Câu hỏi của khách', s: 'Hỏi bằng ngôn ngữ tự nhiên', tone: '#E8622C', bg: '#FFF0E6' },
    { ic: 'search', t: 'Tìm kiếm ngữ nghĩa', s: 'Đối chiếu với kho tri thức nhà hàng', tone: '#2F7D4F', bg: '#EAF6EE' },
    { ic: 'spark', t: 'Mô hình ngôn ngữ lớn', s: 'Soạn câu trả lời mạch lạc', tone: '#7C3AED', bg: '#F2ECFD' },
    { ic: 'check', t: 'Trả lời và gợi ý', s: 'Gợi ý món, đặt bàn ngay trong chat', tone: '#B7791F', bg: '#FDF3DE' }
  ];
  const cards = [], dots = [];
  flow.forEach((o, i) => {
    const y = 236 + i * 150;
    const c = E('div', 'card', { position: 'absolute', left: '140px', top: y + 'px', width: '620px', height: '118px', borderRadius: '20px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '18px' });
    const ib = E('div', '', { width: '54px', height: '54px', borderRadius: '15px', background: o.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' });
    ib.innerHTML = iconSvg(o.ic, o.tone, 26);
    c.appendChild(ib);
    const tx = E('div', '', { display: 'flex', flexDirection: 'column', gap: '5px' });
    tx.appendChild(T('', o.t, { fontSize: '22px', fontWeight: '800', letterSpacing: '-.3px' }));
    tx.appendChild(T('', o.s, { fontSize: '15px', color: '#8A7566', fontWeight: '500' }));
    c.appendChild(tx);
    c.appendChild(T('', String(i + 1), { position: 'absolute', right: '22px', top: '20px', fontSize: '13px', fontWeight: '800', color: '#C9B4A2' }));
    r.appendChild(c); cards.push(c);
    if (i < 3) {
      const ln = E('div', '', { position: 'absolute', left: '188px', top: (y + 118) + 'px', width: '2px', height: '32px', background: '#E7D4C4', transformOrigin: 'top center' });
      r.appendChild(ln);
      const d = E('div', '', { position: 'absolute', left: '183px', top: (y + 120) + 'px', width: '12px', height: '12px', borderRadius: '50%', background: '#E8622C', boxShadow: '0 0 0 5px rgba(232,98,44,.14)' });
      r.appendChild(d); dots.push(d);
    }
  });

  const b247 = E('div', 'chip', { position: 'absolute', left: '800px', top: '252px', height: '52px', padding: '0 20px', fontSize: '18px', background: '#EEF8F1', borderColor: 'rgba(47,125,79,.3)', color: '#25603C' });
  b247.innerHTML = `<span style="width:9px;height:9px;border-radius:50%;background:#2F7D4F"></span>Hoạt động 24/7`;
  r.appendChild(b247);
  const bSuggest = E('div', 'chip', { position: 'absolute', left: '800px', top: '322px', height: '48px', padding: '0 18px', fontSize: '16px' });
  bSuggest.innerHTML = `${iconSvg('star', '#E8622C', 18)}<span>Gợi ý món theo khẩu vị</span>`;
  r.appendChild(bSuggest);
  const bBook = E('div', 'chip', { position: 'absolute', left: '800px', top: '386px', height: '48px', padding: '0 18px', fontSize: '16px' });
  bBook.innerHTML = `${iconSvg('calendar', '#E8622C', 18)}<span>Đặt bàn trong đoạn chat</span>`;
  r.appendChild(bBook);
  const trail = E('div', '', { position: 'absolute', left: '1060px', top: '300px', width: '190px', height: '250px', borderTop: '2px dashed rgba(232,98,44,.28)', borderRight: '2px dashed rgba(232,98,44,.28)', borderTopRightRadius: '26px' });
  r.appendChild(trail);

  const toast1 = E('div', 'toast', { left: '1268px', top: '792px', width: '474px', height: '56px' });
  toast1.innerHTML = `<div class="ic">✓</div><span>Đã tìm thấy món phù hợp</span>`;
  r.appendChild(toast1);
  const toast2 = E('div', 'toast', { left: '1268px', top: '854px', width: '474px', height: '56px' });
  toast2.innerHTML = `<div class="ic">✓</div><span>Sẵn sàng hỗ trợ đặt bàn</span>`;
  r.appendChild(toast2);

  const c1 = callout(r, 1, 'Tìm trong kho tri thức', 800, 520, true);
  const c2 = callout(r, 2, 'Mô hình ngôn ngữ lớn', 800, 650);
  const c3 = callout(r, 3, 'Gợi ý món và đặt bàn', 800, 780, true);
  const hlSearch = hlBox(r, 158, 388, 584, 114, true);
  const hlLLM = hlBox(r, 158, 538, 584, 114);
  const hlAns = hlBox(r, 158, 688, 584, 114, true);

  S.update = t => {
    const pp = eOut(pr(t, 3.3, 4.2));
    phone.style.opacity = pp;
    phone.style.transform = `translateY(${(1 - pp) * 44}px) rotate(${(1 - pp) * 2.4}deg)`;
    glow.style.opacity = pp;
    cards.forEach((c, i) => {
      const p = eOut(pr(t, .35 + i * .3, 1.0 + i * .3));
      c.style.opacity = p;
      c.style.transform = `translateY(${(1 - p) * 24}px)`;
    });
    dots.forEach((d, i) => {
      const p = pr(t, 1.0 + i * .3, 1.05 + i * .3);
      const travel = (Math.sin((t * .9 + i * .8) * Math.PI) + 1) / 2;
      d.style.opacity = t > 1.0 + i * .3 ? .95 : 0;
      d.style.top = (356 + i * 150 + travel * 22) + 'px';
    });

    let hi = -1;
    if (t >= 7.4 && t < 11.2) hi = 1;
    else if (t >= 11.2 && t < 15.0) hi = 2;
    else if (t >= 15.0) hi = 3;
    cards.forEach((c, i) => {
      const on = i === hi;
      c.style.borderColor = on ? 'rgba(232,98,44,.5)' : 'rgba(226,120,70,.14)';
      c.style.boxShadow = on ? '0 26px 60px rgba(232,98,44,.16)' : '0 24px 60px rgba(120,60,20,.10)';
      c.style.transform = `translateY(${on ? -5 : 0}px)`;
    });

    [b247, bSuggest, bBook].forEach((el, i) => {
      const p = eOut(pr(t, 4.0 + i * .25, 4.6 + i * .25));
      el.style.opacity = p;
      el.style.transform = `translateX(${(1 - p) * 26}px)`;
    });
    trail.style.opacity = eOut(pr(t, 4.4, 5.2));

    const t1 = eOut(pr(t, 15.2, 15.9));
    toast1.style.opacity = t1; toast1.style.transform = `translateY(${(1 - t1) * 18}px)`;
    const t2 = eOut(pr(t, 16.1, 16.8));
    toast2.style.opacity = t2; toast2.style.transform = `translateY(${(1 - t2) * 18}px)`;

    showC(c1, vis(t, 7.6, 10.9, .35, .3));
    showC(c2, vis(t, 11.4, 14.6, .35, .3));
    showC(c3, vis(t, 15.0, 18.0, .35, .3));
    showHl(hlSearch, vis(t, 7.6, 10.9, .35, .3));
    showHl(hlLLM, vis(t, 11.4, 14.6, .35, .3));
    showHl(hlAns, vis(t, 15.0, 18.0, .35, .3));
  };
}

/* ================= 09 · RECOMMENDATION ================= */
{
  const S = scene(9), r = S.root;
  head(r, 'GỢI Ý CÁ NHÂN HÓA', 'Bốn tín hiệu, một danh sách phù hợp', 140, 92);

  const input = E('div', 'card', { position: 'absolute', left: '140px', top: '196px', width: '520px', height: '80px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 18px' });
  input.appendChild(T('', 'DỮ LIỆU', { fontSize: '12px', fontWeight: '800', letterSpacing: '2.4px', color: '#A08A78' }));
  ['Đơn hàng', 'Đánh giá', 'Chatbot'].forEach(tx => input.appendChild(E('div', 'chip', { height: '38px', padding: '0 12px', fontSize: '14px' }, tx)));
  r.appendChild(input);

  const sigs = [
    { t: 'Lọc cộng tác', s: 'SVD', w: 30, tone: '#E8622C', bg: '#FFF0E6', ic: 'users' },
    { t: 'Độ khớp nội dung', s: 'TF-IDF', w: 25, tone: '#2F7D4F', bg: '#EAF6EE', ic: 'search' },
    { t: 'Ngữ cảnh chat', s: 'Câu hỏi gần đây', w: 25, tone: '#7C3AED', bg: '#F2ECFD', ic: 'chat' },
    { t: 'Chất lượng món', s: 'Đánh giá', w: 20, tone: '#B7791F', bg: '#FDF3DE', ic: 'star' }
  ];
  const sigEls = [], bars = [], sigEnt = [0, 0, 0, 0];
  sigs.forEach((o, i) => {
    const y = 300 + i * 92;
    const c = E('div', 'card', { position: 'absolute', left: '140px', top: y + 'px', width: '530px', height: '76px', borderRadius: '16px', padding: '0 18px', display: 'flex', alignItems: 'center', gap: '14px' });
    const ib = E('div', '', { width: '42px', height: '42px', borderRadius: '12px', background: o.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' });
    ib.innerHTML = iconSvg(o.ic, o.tone, 22);
    c.appendChild(ib);
    const tx = E('div', '', { width: '230px' });
    tx.appendChild(T('', o.t, { fontSize: '18px', fontWeight: '800' }));
    tx.appendChild(T('', o.s, { fontSize: '13px', color: '#9A8575', marginTop: '2px' }));
    c.appendChild(tx);
    const track = E('div', '', { position: 'relative', width: '120px', height: '8px', borderRadius: '5px', background: '#F0E4D9', overflow: 'hidden' });
    const fill = E('div', '', { position: 'absolute', left: '0', top: '0', bottom: '0', width: (o.w / 30 * 100) + '%', borderRadius: '5px', background: o.tone, transformOrigin: 'left center', transform: 'scaleX(0)' });
    track.appendChild(fill);
    c.appendChild(track);
    c.appendChild(T('', o.w + '%', { width: '40px', textAlign: 'right', fontSize: '15px', fontWeight: '800', color: o.tone }));
    r.appendChild(c); sigEls.push(c); bars.push(fill);
  });

  const merge = E('div', 'card', { position: 'absolute', left: '140px', top: '690px', width: '530px', height: '96px', borderRadius: '18px', background: '#EEF8F1', borderColor: 'rgba(47,125,79,.3)', display: 'flex', alignItems: 'center', gap: '16px', padding: '0 20px' });
  const mIc = E('div', '', { width: '52px', height: '52px', borderRadius: '14px', background: '#2F7D4F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', fontWeight: '800' }, 'Σ');
  merge.appendChild(mIc);
  const mtx = E('div', '');
  mtx.appendChild(T('', 'Điểm tổng hợp', { fontSize: '21px', fontWeight: '800', color: '#25603C' }));
  mtx.appendChild(T('', 'Chuẩn hóa và kết hợp bốn tín hiệu', { fontSize: '14px', color: '#4E7A5F', marginTop: '3px' }));
  merge.appendChild(mtx);
  const sumBars = E('div', '', { position: 'absolute', right: '20px', top: '24px', display: 'flex', gap: '4px', alignItems: 'flex-end', height: '46px' });
  [30, 25, 25, 20].forEach(w => sumBars.appendChild(E('div', '', { width: '10px', height: (w * 1.4) + 'px', borderRadius: '3px', background: '#2F7D4F', opacity: .8 })));
  merge.appendChild(sumBars);
  r.appendChild(merge);

  const bx = 760, by = 190, bw = 1020, ih = 461;
  const B = browserAt(r, bx, by, bw, ih, 'Ẩm Thực Phương Nam · Thực đơn');
  const bg = img('assets/ui/menu_goi_y.png', { position: 'absolute', left: '0', top: '0', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left' });
  B.shot.appendChild(bg);
  const s = bw / 1386, X = bx, Y = by + 44;
  const hlFav = hlBox(r, X + 42 * s, Y + 204 * s, 140 * s, 34 * s, true);
  const hlTag = hlBox(r, X + 388 * s, Y + 116 * s, 486 * s, 46 * s, true);
  const cRes = callout(r, 1, 'Danh sách phù hợp với từng khách', 1080, 672, true);

  const result = E('div', 'card', { position: 'absolute', left: '760px', top: '700px', width: '1020px', height: '86px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '16px', padding: '0 22px' });
  result.innerHTML = `<div style="width:44px;height:44px;border-radius:12px;background:#EEF8F1;display:flex;align-items:center;justify-content:center">${iconSvg('spark', '#2F7D4F', 24)}</div>
    <div style="flex:1"><div style="font-size:17px;font-weight:800">Kết quả xếp hạng theo từng khách</div>
    <div style="font-size:14px;color:#8A7566;margin-top:2px">Tín hiệu nào mạnh hơn sẽ đẩy món đó lên trước.</div></div>`;
  r.appendChild(result);

  const cold = E('div', 'card', { position: 'absolute', left: '760px', top: '700px', width: '1020px', height: '86px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '16px', padding: '0 22px', background: '#FEF7E7', borderColor: 'rgba(242,181,68,.4)' });
  cold.innerHTML = `<div style="width:44px;height:44px;border-radius:12px;background:#FDF0D5;display:flex;align-items:center;justify-content:center">${iconSvg('star', '#B7791F', 24)}</div>
    <div style="flex:1"><div style="font-size:17px;font-weight:800;color:#8A5A08">Khách mới chưa có dữ liệu</div>
    <div style="font-size:14px;color:#9A7B3E;margin-top:2px">Nhận danh sách món thịnh hành để bắt đầu.</div></div>`;
  r.appendChild(cold);

  const cData = callout(r, 1, 'Học từ đơn hàng, đánh giá và chat', 250, 150);
  const cNorm = callout(r, 2, 'Chuẩn hóa rồi cộng có trọng số', 250, 646, true);
  const cCold = callout(r, 3, 'Khách mới nhận món thịnh hành', 1120, 800);
  const hlInput = hlBox(r, 158, 204, 486, 64);

  S.update = t => {
    const ip = eOut(pr(t, .3, 1.0));
    input.style.opacity = ip; input.style.transform = `translateY(${(1 - ip) * 20}px)`;
    sigEls.forEach((c, i) => {
      const p = eOut(pr(t, 3.7 + i * .18, 4.5 + i * .18));
      sigEnt[i] = p;
      c.style.opacity = p;
      bars[i].style.transform = `scaleX(${eInOut(pr(t, 4.1 + i * .18, 5.4 + i * .18))})`;
    });
    const mp = eOut(pr(t, 7.9, 8.7));
    merge.style.opacity = mp; merge.style.transform = `translateY(${(1 - mp) * 24}px)`;
    mIc.style.transform = `scale(${lerp(.6, 1, eBack(pr(t, 8.1, 8.8)))})`;

    const bp = eOut(pr(t, 3.9, 4.7));
    B.f.style.opacity = bp; B.f.style.transform = `translateY(${(1 - bp) * 30}px) scale(${lerp(.985, 1, bp)})`;
    bg.style.transform = `scale(${1 + .02 * pr(t, 4, 20)})`;

    let hi = -1;
    if (t >= 11.7 && t < 12.65) hi = 0;
    else if (t >= 12.65 && t < 13.6) hi = 1;
    else if (t >= 13.6 && t < 14.55) hi = 2;
    else if (t >= 14.55 && t < 15.8) hi = 3;
    sigEls.forEach((c, i) => {
      const on = i === hi;
      c.style.borderColor = on ? sigs[i].tone + '99' : 'rgba(226,120,70,.14)';
      c.style.boxShadow = on ? `0 24px 54px ${sigs[i].tone}33` : '0 24px 60px rgba(120,60,20,.10)';
      c.style.transform = `translateY(${(1 - sigEnt[i]) * 22 + (on ? -6 : 0)}px) scale(${on ? 1.015 : 1})`;
    });

    showC(cData, vis(t, .5, 3.7));
    showC(cNorm, vis(t, 7.9, 11.4, .35, .3));
    const rp = eOut(pr(t, 16.3, 17.1));
    result.style.opacity = rp; result.style.transform = `translateY(${(1 - rp) * 18}px)`;
    result.style.display = t > 19.1 ? 'none' : 'flex';
    const cp = eOut(pr(t, 19.4, 20.2));
    cold.style.opacity = cp; cold.style.transform = `translateY(${(1 - cp) * 18}px)`;
    showC(cRes, vis(t, 16.5, 19.0, .35, .3));
    showC(cCold, vis(t, 19.6, 22.2, .35, .3));

    showHl(hlInput, vis(t, .5, 3.7));
    showHl(hlFav, vis(t, 16.5, 19.2, .35, .3));
    showHl(hlTag, vis(t, 16.5, 19.2, .35, .3));
  };
}

/* ================= 10 · STAFF ================= */
{
  const S = scene(10), r = S.root;
  head(r, 'CỔNG NHÂN VIÊN', 'Chấm công khuôn mặt, POS và ca làm', 140, 92);

  const login = browserAt(r, 140, 180, 560, 315, 'Ẩm Thực Phương Nam · Nhân viên');
  login.shot.appendChild(img('assets/ui/staff_login.png', { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }));

  const face = browserAt(r, 800, 180, 980, 551, 'Ẩm Thực Phương Nam · Chấm công');
  face.shot.appendChild(img('assets/ui/face_attendance.png', { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }));
  const scanFill = E('div', '', { position: 'absolute', left: '1287px', top: '341px', width: '284px', height: '240px', borderRadius: '12px', overflow: 'hidden', opacity: 0,
    background: 'radial-gradient(circle at 50% 42%,#173a2e 0%,#0e1626 55%,#0a0a16 100%)' });
  scanFill.innerHTML = `<div style="position:absolute;inset:0;background-image:linear-gradient(90deg,rgba(52,211,153,.08) 1px,transparent 1px),linear-gradient(0deg,rgba(52,211,153,.08) 1px,transparent 1px);background-size:28px 28px"></div>
    <div style="position:absolute;left:0;right:0;top:0;height:120px;background:linear-gradient(180deg,rgba(52,211,153,.10),transparent)"></div>
    <div style="position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);opacity:.5">${iconSvg('user', '#34D399', 96)}</div>`;
  r.appendChild(scanFill);
  const scan = E('div', '', { position: 'absolute', left: '1287px', top: '341px', width: '284px', height: '220px', border: '3px solid rgba(47,125,79,.95)', borderRadius: '14px', boxShadow: '0 0 0 6px rgba(47,125,79,.14), inset 0 0 40px rgba(47,125,79,.12)', opacity: 0 });
  [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([hx, hy]) => {
    scan.appendChild(E('div', '', { position: 'absolute', left: hx ? 'auto' : '-4px', right: hx ? '-4px' : 'auto', top: hy ? 'auto' : '-4px', bottom: hy ? '-4px' : 'auto', width: '26px', height: '26px', borderTop: hy ? 'none' : '5px solid #2F7D4F', borderBottom: hy ? '5px solid #2F7D4F' : 'none', borderLeft: hx ? 'none' : '5px solid #2F7D4F', borderRight: hx ? '5px solid #2F7D4F' : 'none', borderRadius: hx && hy ? '0 0 8px 0' : !hx && hy ? '0 0 0 8px' : hx && !hy ? '0 8px 0 0' : '8px 0 0 0' }));
  });
  r.appendChild(scan);
  const scanLine = E('div', '', { position: 'absolute', left: '1291px', top: '350px', width: '276px', height: '3px', background: 'linear-gradient(90deg,transparent,#34D399,transparent)', boxShadow: '0 0 16px rgba(52,211,153,.9)', opacity: 0 });
  r.appendChild(scanLine);
  const scanTag = E('div', 'chip g', { position: 'absolute', left: '1304px', top: '306px', height: '30px', padding: '0 12px', fontSize: '13px' }, 'ĐANG QUÉT KHUÔN MẶT');
  r.appendChild(scanTag);
  const faceOk = E('div', 'toast', { left: '960px', top: '798px', width: '470px', height: '58px' });
  faceOk.innerHTML = `<div class="ic">✓</div><span>Đã ghi nhận giờ vào ca</span>`;
  r.appendChild(faceOk);

  const pos = E('div', 'card', { position: 'absolute', left: '140px', top: '560px', width: '300px', height: '300px', borderRadius: '20px', padding: '22px 22px' });
  pos.innerHTML = `<div style="display:flex;align-items:center;gap:10px">${iconSvg('pos', '#E8622C', 24)}<div style="font-size:18px;font-weight:800">POS tại quầy</div></div>
    <div class="chip" style="margin-top:12px;height:32px;padding:0 10px;font-size:12px">Bàn 05</div>
    <div style="margin-top:14px;font-size:14px;color:#5E4B3D;display:flex;justify-content:space-between"><span>Gà hấp rượu ×1</span><b>450.000đ</b></div>
    <div style="margin-top:7px;font-size:14px;color:#5E4B3D;display:flex;justify-content:space-between"><span>Cơm chiên ×1</span><b>99.000đ</b></div>
    <div style="margin-top:14px;padding-top:12px;border-top:1px dashed #EBD9C9;display:flex;justify-content:space-between;align-items:center"><span style="font-size:14px;font-weight:700">Tổng</span><span class="money" style="font-size:22px">549.000đ</span></div>
    <div class="btn green" style="position:absolute;left:22px;bottom:18px;width:256px;height:46px;font-size:15px">Thanh toán tại bàn</div>`;
  r.appendChild(pos);

  const shift = E('div', 'card', { position: 'absolute', left: '460px', top: '560px', width: '300px', height: '300px', borderRadius: '20px', padding: '22px' });
  shift.innerHTML = `<div style="display:flex;align-items:center;gap:10px">${iconSvg('clock', '#2F7D4F', 24)}<div style="font-size:18px;font-weight:800">Ca làm & lương</div></div>
    <div style="margin-top:16px;font-size:13px;font-weight:800;letter-spacing:1.6px;color:#9A8575">CA TỐI</div>
    <div style="margin-top:8px;display:flex;gap:5px">${[0, 1, 2, 3].map(i => `<div style="flex:1;height:10px;border-radius:4px;background:${i < 2 ? '#2F7D4F' : '#E7EFE9'}"></div>`).join('')}</div>
    <div style="margin-top:10px;font-size:13px;color:#5E4B3D">Đã chấm công vào ca</div>
    <div style="margin-top:20px;font-size:13px;font-weight:800;letter-spacing:1.6px;color:#9A8575">LƯƠNG TẠM TÍNH</div>
    <div style="margin-top:8px;font-size:16px;font-weight:700;color:#2F7D4F">Tính theo giờ công</div>
    <div style="margin-top:12px;height:40px;border-radius:10px;background:#EEF8F1;display:flex;align-items:center;justify-content:center;font-size:13px;color:#4E7A5F;font-weight:600">Xem bảng lương chi tiết</div>`;
  r.appendChild(shift);

  const c1 = callout(r, 1, 'Cổng riêng, phân quyền', 150, 506);
  const c2 = callout(r, 2, 'Chấm công bằng khuôn mặt', 860, 150);
  const c3 = callout(r, 3, 'Ghi nhận giờ vào, giờ ra', 900, 668, true);
  const c4 = callout(r, 4, 'Gọi món và thanh toán tại bàn', 150, 870);
  const c5 = callout(r, 5, 'Ca làm và lương tạm tính', 460, 870, true);
  const c6 = callout(r, 6, 'Mọi thao tác đồng bộ về quản trị', 770, 866);
  const hlLogin = hlBox(r, 154, 186, 532, 314);
  const hlFace = hlBox(r, 1281, 336, 296, 232, true);
  const hlPos = hlBox(r, 154, 574, 272, 272);
  const hlShift = hlBox(r, 474, 574, 272, 272, true);

  S.update = t => {
    const p1 = eOut(pr(t, .2, .95));
    login.f.style.opacity = p1; login.f.style.transform = `translateY(${(1 - p1) * 30}px)`;
    const p2 = eOut(pr(t, 4.0, 4.8));
    face.f.style.opacity = p2; face.f.style.transform = `translateY(${(1 - p2) * 30}px) scale(${lerp(.985, 1, p2)})`;

    const sp = pr(t, 4.8, 7.3);
    scanFill.style.opacity = p2 * (t > 4.7 ? 1 : 0);
    scan.style.opacity = p2 * (t > 4.7 ? 1 : 0);
    scanLine.style.opacity = (t > 4.9 && t < 7.7) ? .95 : 0;
    scanLine.style.top = lerp(350, 540, (Math.sin(sp * Math.PI * 2.2 - Math.PI / 2) + 1) / 2) + 'px';
    scanTag.style.opacity = p2 * (t > 4.8 ? 1 : 0);
    const okp = eOut(pr(t, 7.5, 8.2));
    faceOk.style.opacity = okp;
    faceOk.style.transform = `translateY(${(1 - okp) * 16}px)`;

    const p3 = eOut(pr(t, 10.8, 11.5));
    pos.style.opacity = p3; pos.style.transform = `translateY(${(1 - p3) * 26}px)`;
    const p4 = eOut(pr(t, 14.5, 15.2));
    shift.style.opacity = p4; shift.style.transform = `translateY(${(1 - p4) * 26}px)`;
    showC(c1, vis(t, .5, 3.6));
    showC(c2, vis(t, 4.6, 7.3, .35, .3));
    showC(c3, vis(t, 7.5, 10.7, .3, .3));
    showC(c4, vis(t, 11.0, 14.4, .3, .3));
    showC(c5, vis(t, 14.7, 17.5, .3, .3));
    showC(c6, vis(t, 17.8, 20.0, .3, .3));
    showHl(hlLogin, vis(t, .5, 3.9));
    showHl(hlFace, vis(t, 4.6, 10.6, .35, .3));
    showHl(hlPos, vis(t, 11.0, 14.4, .3, .3));
    showHl(hlShift, vis(t, 14.7, 17.5, .3, .3));
  };
}

/* ================= 11 · DASHBOARD ================= */
{
  const S = scene(11), r = S.root;
  head(r, 'QUẢN TRỊ', 'Toàn bộ hoạt động trong một dashboard', 140, 88);

  const bx = 170, by = 176, bw = 1500, ih = 716;
  const B = browserAt(r, bx, by, bw, ih, 'Ẩm Thực Phương Nam · Quản trị');
  B.shot.appendChild(img('assets/ui/admin_dashboard.png', { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left' }));
  const s = bw / 1386, X = bx, Y = by + 44;

  const hlSide = hlBox(r, X + 4 * s, Y + 96 * s, 218 * s, 560 * s);
  const hlDonut = hlBox(r, X + 287 * s, Y + 166 * s, 270 * s, 290 * s);
  const hlTop = hlBox(r, X + 575 * s, Y + 166 * s, 265 * s, 290 * s);
  const hlCust = hlBox(r, X + 860 * s, Y + 166 * s, 265 * s, 290 * s);
  const hlPay = hlBox(r, X + 630 * s, Y + 488 * s, 240 * s, 170 * s);
  const hlFilters = hlBox(r, X + 1158 * s, Y + 96 * s, 214 * s, 560 * s);
  const hlRole = hlBox(r, X + 1178 * s, Y + 14 * s, 196 * s, 48 * s, true);

  const live = E('div', 'chip g', { position: 'absolute', left: '1400px', top: '120px', height: '38px', padding: '0 14px', fontSize: '13px' });
  live.innerHTML = `<span style="width:8px;height:8px;border-radius:50%;background:#2F7D4F"></span>Cập nhật trực tiếp`;
  r.appendChild(live);

  const c1 = callout(r, 1, 'Tổng hợp mọi hoạt động', 700, 240);
  const c2 = callout(r, 2, 'Doanh thu, đơn hàng, top món', 500, 366);
  const c3 = callout(r, 3, 'Khách mới và thanh toán', 1080, 366);
  const c4 = callout(r, 4, 'Cập nhật theo thời gian thực', 1250, 240, true);
  const c6 = callout(r, 5, 'Phân quyền quyết định người xem', 1080, 300, true);

  const overlay = E('div', '', { position: 'absolute', left: '170px', top: '176px', width: '1500px', height: '760px', background: 'rgba(255,248,240,.93)', borderRadius: '18px', opacity: 0 });
  overlay.appendChild(T('', 'CÁC PHÂN HỆ QUẢN TRỊ', { position: 'absolute', left: '0', right: '0', top: '96px', textAlign: 'center', fontSize: '15px', fontWeight: '800', letterSpacing: '4px', color: '#A08A78' }));
  const mods = [
    { ic: 'menu', t: 'Thực đơn' }, { ic: 'box', t: 'Kho' }, { ic: 'users', t: 'Nhân sự' },
    { ic: 'report', t: 'Báo cáo' }, { ic: 'shield', t: 'Phân quyền' }
  ];
  const modEls = mods.map((m, i) => {
    const x = 182 + i * 316;
    const el = E('div', 'card', { position: 'absolute', left: x + 'px', top: '190px', width: '292px', height: '210px', borderRadius: '22px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' });
    el.innerHTML = `<div style="width:66px;height:66px;border-radius:18px;background:#FFF0E6;display:flex;align-items:center;justify-content:center">${iconSvg(m.ic, '#E8622C', 32)}</div><div style="font-size:22px;font-weight:800">${m.t}</div>`;
    overlay.appendChild(el); return el;
  });
  r.appendChild(overlay);

  S.update = t => {
    const pin = eOut(pr(t, .2, .95));
    B.f.style.opacity = pin; B.f.style.transform = `translateY(${(1 - pin) * 30}px) scale(${lerp(.985, 1, pin)})`;
    live.style.opacity = eOut(pr(t, .6, 1.2)) * (t > 10.4 ? 1 : .55);
    live.style.transform = `scale(${1 + .03 * Math.sin(t * 2.4)})`;

    showC(c1, vis(t, .5, 3.2));
    showC(c2, vis(t, 3.3, 7.0));
    showC(c3, vis(t, 7.4, 10.4));
    showC(c4, vis(t, 10.6, 13.2, .35, .3));
    showC(c6, vis(t, 18.4, 21.0, .35, .3));
    showHl(hlSide, vis(t, .5, 3.2));
    showHl(hlDonut, vis(t, 3.3, 7.0));
    showHl(hlTop, vis(t, 3.3, 7.0));
    showHl(hlCust, vis(t, 7.4, 10.4));
    showHl(hlPay, vis(t, 7.4, 10.4));
    showHl(hlFilters, vis(t, 10.6, 13.2, .35, .3));
    showHl(hlRole, vis(t, 18.4, 21.0, .35, .3));

    const op = eOut(pr(t, 13.7, 14.4)) * (1 - eOut(pr(t, 17.1, 17.7)));
    overlay.style.opacity = op;
    overlay.style.visibility = op > .01 ? 'visible' : 'hidden';
    modEls.forEach((el, i) => {
      const p = eOut(pr(t, 13.9 + i * .12, 14.6 + i * .12)) * (1 - pr(t, 17.0, 17.4));
      el.style.opacity = p;
      el.style.transform = `translateY(${(1 - p) * 26}px)`;
    });
  };
}

/* ================= 12 · ADMIN AI ================= */
{
  const S = scene(12), r = S.root;
  head(r, 'DỮ LIỆU CÁ NHÂN HÓA', 'Khẩu vị, tri thức chatbot và luật kết hợp', 140, 88);

  const prefs = browserAt(r, 140, 180, 1000, 457, 'Ẩm Thực Phương Nam · Sở thích khách hàng');
  prefs.shot.appendChild(img('assets/ui/admin_prefs_2.png', { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left' }));
  const s1 = 1000 / 1386, X1 = 140, Y1 = 224;
  const hlTaste = hlBox(r, X1 + 580 * s1, Y1 + 16 * s1, 218 * s1, 150 * s1, true);
  const hlAI = hlBox(r, X1 + 798 * s1, Y1 + 16 * s1, 392 * s1, 150 * s1);

  const kb = browserAt(r, 1170, 180, 620, 281, 'Quản trị · Tri thức Chatbot');
  kb.shot.appendChild(img('assets/ui/admin_chatbot_kb.png', { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left' }));
  const s2 = 620 / 1386, X2 = 1170, Y2 = 224;
  const hlKb = hlBox(r, X2 + 272 * s2, Y2 + 92 * s2, 340 * s2, 210 * s2, true);

  const apr = E('div', 'card', { position: 'absolute', left: '1170px', top: '530px', width: '620px', height: '330px', borderRadius: '22px', padding: '24px 26px' });
  apr.appendChild(T('', 'Luật kết hợp · Apriori', { fontSize: '21px', fontWeight: '800' }));
  apr.appendChild(T('', 'Hiển thị để kiểm tra', { position: 'absolute', right: '24px', top: '28px', fontSize: '12px', fontWeight: '700', color: '#A08A78', letterSpacing: '1px' }));
  const pipe = E('div', '', { position: 'absolute', left: '26px', top: '78px', width: '568px', display: 'flex', alignItems: 'center', gap: '10px' });
  [['Giỏ hàng', '#E8622C'], ['Tập phổ biến', '#B7791F'], ['Luật kết hợp', '#2F7D4F']].forEach(([tx, c], i) => {
    if (i) pipe.appendChild(T('', '→', { fontSize: '18px', color: '#C9B4A2', fontWeight: '800' }));
    pipe.appendChild(E('div', 'chip', { height: '38px', padding: '0 14px', fontSize: '14px', color: c, borderColor: c + '55' }, tx));
  });
  apr.appendChild(pipe);
  [0, 1, 2].forEach(i => {
    const y = 140 + i * 54;
    apr.appendChild(T('', 'Luật ' + (i + 1), { position: 'absolute', left: '26px', top: (y + 8) + 'px', fontSize: '13px', fontWeight: '700', color: '#A08A78' }));
    apr.appendChild(E('div', '', { position: 'absolute', left: '96px', top: (y + 16) + 'px', width: (330 - i * 40) + 'px', height: '10px', borderRadius: '5px', background: 'linear-gradient(90deg,#EFDCCB,#E8CDB6)', filter: 'blur(1.2px)' }));
    apr.appendChild(E('div', '', { position: 'absolute', left: '446px', top: (y + 12) + 'px', width: '112px', height: '18px', borderRadius: '6px', background: '#F3E7DB', filter: 'blur(1.6px)' }));
  });
  apr.appendChild(T('', 'Hỗ trợ và độ tin cậy được tính từ lịch sử đơn hàng.', { position: 'absolute', left: '26px', top: '286px', fontSize: '13px', color: '#9A8575' }));
  r.appendChild(apr);

  const c1 = callout(r, 1, 'Ghi lại khẩu vị và món quan tâm', 300, 300);
  const c2 = callout(r, 2, 'Mức độ tương đồng giữa các khách', 560, 340, true);
  const c3 = callout(r, 3, 'Sửa kho tri thức trực tiếp', 1200, 420);
  const c4 = callout(r, 4, 'Trợ lý luôn trả lời đúng thông tin', 1180, 470, true);

  S.update = t => {
    const p1 = eOut(pr(t, .2, .95));
    prefs.f.style.opacity = p1; prefs.f.style.transform = `translateY(${(1 - p1) * 30}px) scale(${lerp(.985, 1, p1)})`;
    const p2 = eOut(pr(t, 7.0, 7.8));
    kb.f.style.opacity = p2; kb.f.style.transform = `translateY(${(1 - p2) * 26}px)`;
    const p3 = eOut(pr(t, 13.8, 14.6));
    apr.style.opacity = p3; apr.style.transform = `translateY(${(1 - p3) * 26}px)`;

    showC(c1, vis(t, .5, 3.6));
    showC(c2, vis(t, 3.8, 6.8, .35, .3));
    showC(c3, vis(t, 7.2, 10.0, .35, .3));
    showC(c4, vis(t, 10.2, 13.4, .35, .3));
    showHl(hlTaste, vis(t, .5, 3.6));
    showHl(hlAI, vis(t, 3.8, 6.8, .35, .3));
    showHl(hlKb, vis(t, 7.2, 10.0, .35, .3));
    showHl(hlKb, vis(t, 10.2, 13.4, .35, .3));
  };
}

/* ================= 13 · OUTRO ================= */
{
  const S = scene(13), r = S.root;
  const logo = img('assets/logo.png', { position: 'absolute', left: '900px', top: '146px', width: '120px', height: '120px', borderRadius: '50%', boxShadow: '0 22px 48px rgba(40,70,40,.22)' });
  r.appendChild(logo);
  const k = place(T('kicker', 'ĐỒ ÁN TỐT NGHIỆP · 2026', { position: 'absolute', left: '0', right: '0', top: '296px', textAlign: 'center', fontSize: '16px', letterSpacing: '5px' }), r);
  const title = place(T('h1', 'ẨM THỰC PHƯƠNG NAM', { position: 'absolute', left: '0', right: '0', top: '330px', textAlign: 'center', fontSize: '72px', letterSpacing: '-1.6px' }), r);
  const rule = E('div', '', { position: 'absolute', left: '860px', top: '432px', width: '200px', height: '3px', borderRadius: '2px', background: 'linear-gradient(90deg,rgba(232,98,44,0),#E8622C,rgba(232,98,44,0))', transformOrigin: 'center' });
  r.appendChild(rule);
  const tagline = place(T('', 'Hương vị Vĩnh Long', { position: 'absolute', left: '0', right: '0', top: '458px', textAlign: 'center', fontSize: '32px', fontWeight: '600', color: '#B7791F', letterSpacing: '5px' }), r);

  const feats = [
    ['cart', 'Đặt món'], ['calendar', 'Đặt bàn'], ['chat', 'Trợ lý ảo'], ['admin', 'Quản trị']
  ];
  const tiles = feats.map(([ic, tx], i) => {
    const x = 364 + i * 304;
    const el = E('div', 'card', { position: 'absolute', left: x + 'px', top: '556px', width: '280px', height: '132px', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' });
    el.innerHTML = `<div style="width:52px;height:52px;border-radius:15px;background:#FFF0E6;display:flex;align-items:center;justify-content:center">${iconSvg(ic, '#E8622C', 26)}</div><div style="font-size:21px;font-weight:800">${tx}</div>`;
    r.appendChild(el); return el;
  });

  const credit = E('div', '', { position: 'absolute', left: '0', right: '0', top: '736px', textAlign: 'center' });
  credit.innerHTML = `<div style="font-size:23px;font-weight:800;color:#3A2A20">Nguyễn Huỳnh Kỹ Thuật <span style="color:#B59A86;font-weight:600">· 110122175</span></div>
    <div style="margin-top:10px;font-size:18px;color:#7A6658;font-weight:500">Trường Đại học Trà Vinh · GVHD: ThS. Phạm Minh Đương</div>`;
  r.appendChild(credit);
  const thanks = place(T('', 'Cảm ơn bạn đã theo dõi.', { position: 'absolute', left: '0', right: '0', top: '818px', textAlign: 'center', fontSize: '17px', color: '#A08A78', fontStyle: 'italic' }), r);

  S.update = t => {
    const p0 = eOut(pr(t, .15, .85));
    logo.style.opacity = p0;
    logo.style.transform = `translateY(${(1 - p0) * 20}px) scale(${lerp(.85, 1, p0)}) rotate(${(1 - p0) * -8}deg)`;
    k.style.opacity = eOut(pr(t, .5, 1.2));
    const pt = eOut(pr(t, .7, 1.6));
    title.style.opacity = pt; title.style.transform = `translateY(${(1 - pt) * 22}px)`;
    rule.style.transform = `scaleX(${eInOut(pr(t, 1.2, 1.9))})`;
    tagline.style.opacity = eOut(pr(t, 1.4, 2.2));
    tiles.forEach((el, i) => {
      const p = eOut(pr(t, 5.0 + i * .18, 5.8 + i * .18));
      el.style.opacity = p; el.style.transform = `translateY(${(1 - p) * 30}px)`;
    });
    credit.style.opacity = eOut(pr(t, 8.0, 8.9));
    credit.style.transform = `translateY(${(1 - eOut(pr(t, 8.0, 8.9))) * 18}px)`;
    thanks.style.opacity = eOut(pr(t, 9.0, 9.9));
  };
}

/* ================= GLOBAL RENDER ================= */
function renderAt(T) {
  T = Math.max(0, Math.min(DATA.total, T));
  prog.style.width = (T / DATA.total * 100).toFixed(3) + '%';

  let cur = DATA.scenes[0];
  for (const sc of DATA.scenes) if (T >= sc.start - 1e-4) cur = sc;
  idxNum.textContent = String(cur.num).padStart(2, '0');
  brand.style.opacity = (cur.num === 1 || cur.num === 13) ? '0' : '1';

  SCENES.forEach(s => {
    const local = T - s.meta.start;
    const on = local >= -1e-4 && local <= s.meta.dur + 1e-4;
    s.root.classList.toggle('on', on);
    if (on) s.update(local);
  });

  let op = 0, tr = 0;
  for (const sc of DATA.scenes) {
    const d = T - sc.start;
    if (d >= -.45 && d <= .45) {
      const p = (d + .45) / .9;
      op = Math.pow(Math.sin(p * Math.PI), 1.4) * .8;
      tr = lerp(-14, 12, p);
    }
  }
  sweep.style.opacity = op;
  sweep.style.transform = `translateX(${tr}%)`;

  const cue = DATA.cues.find(c => T >= c.start - .12 && T <= c.end + .5);
  if (cue) {
    if (subText.textContent !== cue.text) subText.textContent = cue.text;
    const o = Math.min(cl((T - cue.start) / .1), cl((cue.end + .5 - T) / .28));
    subBox.style.opacity = Math.max(0, o);
  } else {
    subBox.style.opacity = 0;
  }

  const grid = document.getElementById('bggrid');
  if (grid) grid.style.transform = `translate(${-24 + 18 * Math.sin(T * .045)}px,${-16 + 10 * Math.cos(T * .037)}px)`;
}
window.renderAt = renderAt;
renderAt(0);

