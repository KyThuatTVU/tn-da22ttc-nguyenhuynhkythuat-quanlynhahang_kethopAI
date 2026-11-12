/* Deterministic motion-graphics scenes. renderAt(t) fully describes the frame. */
const DATA = window.DATA;
const sceneRoot = document.getElementById('scenes');
const subBox = document.getElementById('subBox');
const subText = document.getElementById('subText');
const prog = document.getElementById('prog');
const idxNum = document.getElementById('idxNum');
const sweep = document.getElementById('sweep');

const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const pr = (t, a, b) => cl((t - a) / (b - a));
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeOut5 = t => 1 - Math.pow(1 - t, 5);
const easeInOut = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeBack = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const fmt = (n, d = 0) => n.toFixed(d);
const ease = easeOut;

function E(tag, cls, css, html) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (css) Object.assign(el.style, css);
  if (html != null) el.innerHTML = html;
  return el;
}
function T(cls, txt, css) { return E('div', cls, css, txt); }
function place(el, r, x, y) { el.style.position = 'absolute'; if (x != null) el.style.left = x + 'px'; if (y != null) el.style.top = y + 'px'; r.appendChild(el); return el; }
function opacity(el, p) { el.style.opacity = cl(p); }
function pop(el, p, dy = 26, dx = 0) {
  const e = easeOut(cl(p));
  el.style.opacity = e;
  el.style.transform = `translate(${(1 - e) * dx}px,${(1 - e) * dy}px)`;
}
function grow(el, p, dir = 'x') {
  const e = easeOut(cl(p));
  if (dir === 'x') { el.style.transformOrigin = 'left center'; el.style.transform = `scaleX(${e})`; }
  else { el.style.transformOrigin = 'center bottom'; el.style.transform = `scaleY(${e})`; }
}

const SCENES = [];
function scene(id) {
  const root = E('section', 'scene');
  root.id = id;
  sceneRoot.appendChild(root);
  const obj = { root, update: () => { } };
  SCENES.push(obj);
  return { root, obj };
}

/* ---------- shared bits ---------- */
function titleBlock(r, kicker, heading, sub) {
  place(T('kicker', kicker, {}), r, 120, 158);
  place(T('h1', heading, { fontSize: '60px' }), r, 116, 196);
  if (sub) place(T('', sub, { position: 'absolute', fontSize: '24px', letterSpacing: '3px', color: 'rgba(214,232,255,.5)' }), r, 120, 274);
}
function divider(r) {
  const d = E('div', '', { position: 'absolute', left: '1010px', top: '210px', width: '1px', height: '600px', background: 'linear-gradient(180deg,rgba(120,190,255,0),rgba(120,190,255,.28),rgba(120,190,255,0))' });
  r.appendChild(d); return d;
}
function legend(r, items, x = 1150, y = 170) {
  const wrap = E('div', '', { position: 'absolute', left: x + 'px', top: y + 'px', display: 'flex', gap: '26px' });
  items.forEach(([c, label]) => {
    const it = E('div', '', { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', color: 'rgba(220,236,255,.7)', letterSpacing: '1px' });
    const sw = E('div', '', { width: '14px', height: '14px', borderRadius: '4px', background: c });
    it.appendChild(sw); it.appendChild(document.createTextNode(label));
    wrap.appendChild(it);
  });
  r.appendChild(wrap); return wrap;
}

/* ================= 01 HOOK ================= */
{
  const { root, obj } = scene('s01');
  const k = place(T('kicker', 'BÀI TOÁN THỰC TẾ', {}), root, 120, 166);
  const l1 = place(T('h1', 'CÙNG MỘT', { fontSize: '56px', color: 'rgba(214,232,255,.58)', letterSpacing: '3px' }), root, 120, 214);
  const l2 = place(T('h1', 'THỰC ĐƠN', { fontSize: '148px', letterSpacing: '-5px' }), root, 114, 276);
  const l3 = place(T('h1', 'CHO MỌI KHÁCH', { fontSize: '56px', color: 'rgba(214,232,255,.58)', letterSpacing: '3px' }), root, 120, 462);
  const n1 = place(T('', '0', { fontSize: '96px', fontWeight: '800', color: '#FFB347' }), root, 120, 586);
  const n1l = place(T('', 'KHÁCH MỖI TỐI', { fontSize: '22px', letterSpacing: '3px', color: 'rgba(214,232,255,.55)' }), root, 124, 700);
  const n2 = place(T('', '1', { fontSize: '96px', fontWeight: '800', color: '#38E1FF' }), root, 500, 586);
  const n2l = place(T('', 'THỰC ĐƠN CHUNG', { fontSize: '22px', letterSpacing: '3px', color: 'rgba(214,232,255,.55)' }), root, 504, 700);
  const quote = place(E('div', '', {
    position: 'absolute', left: '1010px', top: '206px', width: '1px', height: '400px',
    background: 'linear-gradient(180deg,rgba(120,190,255,0),rgba(120,190,255,.25),rgba(120,190,255,0))'
  }), root);

  const cards = [], plates = [];
  const tags = ['MÓN 01', 'MÓN 02', 'MÓN 03', 'MÓN 04', 'MÓN 05', 'MÓN 06'];
  for (let i = 0; i < 6; i++) {
    const cx = 1060 + (i % 3) * 248, cy = 218 + Math.floor(i / 3) * 208;
    const card = E('div', 'card', { position: 'absolute', left: cx + 'px', top: cy + 'px', width: '228px', height: '188px' });
    const pl = E('div', 'plate', { position: 'absolute', left: '66px', top: '34px', width: '96px', height: '96px' });
    if (i % 3 === 1) pl.style.borderColor = 'rgba(255,179,71,.35)';
    const lab = E('div', '', { position: 'absolute', left: '0', right: '0', top: '142px', textAlign: 'center', fontSize: '18px', letterSpacing: '2px', color: 'rgba(214,232,255,.5)' });
    lab.textContent = tags[i];
    card.appendChild(pl); card.appendChild(lab);
    root.appendChild(card); cards.push(card); plates.push(pl);
  }
  const q = place(T('', '?', { fontSize: '300px', fontWeight: '800', color: '#38E1FF', lineHeight: '1', textShadow: '0 0 60px rgba(56,225,255,.55)' }), root, 1300, 320);
  q.style.width = '260px'; q.style.textAlign = 'center';

  obj.update = (t) => {
    const e = easeOut(pr(t, 0, .9));
    l2.style.transform = `translateY(${(1 - e) * 40}px)`;
    l2.style.opacity = e;
    l1.style.opacity = easeOut(pr(t, .25, 1.0)) * .9;
    l3.style.opacity = easeOut(pr(t, 1.2, 2.0)) * .9;
    quote.style.opacity = easeOut(pr(t, .6, 1.4));
    cards.forEach((c, i) => {
      const p = easeOut(pr(t, .35 + i * .09, 1.15 + i * .09));
      c.style.opacity = p * (1 - .82 * easeOut(pr(t, 8.4, 9.4)));
      c.style.transform = `translateY(${(1 - p) * 24}px)`;
    });
    const count = Math.round(100 * easeInOut(pr(t, 3.1, 5.4)));
    n1.textContent = count;
    n1.style.opacity = easeOut(pr(t, 2.9, 3.6));
    n1l.style.opacity = easeOut(pr(t, 3.0, 3.8)) * .95;
    n2.style.opacity = easeOut(pr(t, 5.4, 6.1));
    n2l.style.opacity = easeOut(pr(t, 5.5, 6.3)) * .95;
    const qp = pr(t, 8.5, 9.6);
    q.style.opacity = qp;
    q.style.transform = `scale(${.7 + .3 * easeBack(cl(qp))}) rotate(${(1 - easeOut(cl(qp))) * -12}deg)`;
  };
}

/* ================= 02 GOALS ================= */
{
  const { root, obj } = scene('s02');
  const k = place(T('kicker', 'MỤC TIÊU', {}), root, 120, 160);
  const h = place(T('h1', 'SAU 5 PHÚT', { fontSize: '86px' }), root, 116, 198);
  const s = place(T('', 'bạn sẽ nắm được', { fontSize: '32px', color: 'rgba(214,232,255,.55)' }), root, 122, 306);
  const rows = [
    ['01', 'PIPELINE 4 TÍN HIỆU', 'chuẩn hóa · trọng số · fusion'],
    ['02', 'SVD & APRIORI', 'dự đoán khẩu vị · luật kết hợp'],
    ['03', 'COLD START & ĐÁNH GIÁ', 'fallback · RMSE · precision@5']
  ].map(([n, ti, sub], i) => {
    const y = 402 + i * 168;
    const g = E('div', '', { position: 'absolute', left: '120px', top: y + 'px', width: '1660px', height: '140px' });
    const top = E('div', '', { position: 'absolute', left: '0', top: '0', width: '100%', height: '1px', background: 'rgba(120,190,255,.22)' });
    const idx = E('div', '', { position: 'absolute', left: '0', top: '22px', fontSize: '38px', fontWeight: '800', color: '#FFB347', letterSpacing: '2px' }); idx.textContent = n;
    const ttl = E('div', '', { position: 'absolute', left: '106px', top: '10px', fontSize: '44px', fontWeight: '700', letterSpacing: '-.5px' }); ttl.textContent = ti;
    const sb = E('div', '', { position: 'absolute', left: '108px', top: '74px', fontSize: '26px', color: 'rgba(214,232,255,.55)' }); sb.textContent = sub;
    const ln = E('div', '', { position: 'absolute', left: '0', bottom: '6px', width: '100%', height: '3px', background: 'linear-gradient(90deg,#38E1FF,rgba(56,225,255,0))' });
    g.append(top, idx, ttl, sb, ln); root.appendChild(g);
    return { g, ln };
  });
  obj.update = (t) => {
    pop(k, pr(t, 0, .6), 12);
    pop(h, pr(t, .05, .8), 24);
    pop(s, pr(t, .3, 1.1), 16);
    rows.forEach((r, i) => {
      const p = pr(t, .5 + i * 1.45, 1.35 + i * 1.45);
      pop(r.g, p, 26);
      grow(r.ln, pr(t, 1.0 + i * 1.45, 2.0 + i * 1.45), 'x');
    });
  };
}

/* ================= 03 DATA MATRIX ================= */
{
  const { root, obj } = scene('s03');
  titleBlock(root, 'DỮ LIỆU ĐẦU VÀO', 'HÀNH VI → MA TRẬN');
  divider(root);
  const vals = { '0,0': 5, '0,3': 4, '1,1': 4, '1,4': 5, '2,2': 3, '3,0': 4, '3,3': 5 };
  const cells = [];
  for (let c = 0; c < 5; c++) {
    place(T('', 'M' + (c + 1), { position: 'absolute', fontSize: '22px', letterSpacing: '2px', color: 'rgba(214,232,255,.45)' }), root, 300 + c * 120, 296);
  }
  for (let rr = 0; rr < 4; rr++) {
    place(T('', 'K' + (rr + 1), { position: 'absolute', fontSize: '22px', letterSpacing: '2px', color: 'rgba(214,232,255,.45)' }), root, 242, 352 + rr * 102);
  }
  for (let rr = 0; rr < 4; rr++) {
    for (let c = 0; c < 5; c++) {
      const v = vals[rr + ',' + c];
      const cell = E('div', 'cell', {
        left: (300 + c * 120) + 'px', top: (330 + rr * 102) + 'px', width: '108px', height: '90px', fontSize: '42px'
      });
      if (v) {
        cell.textContent = v;
        cell.style.color = '#C9F4FF';
        cell.style.background = 'rgba(56,225,255,.13)';
        cell.style.border = '1px solid rgba(56,225,255,.5)';
        cell.style.boxShadow = '0 0 26px rgba(56,225,255,.10)';
      } else {
        cell.style.border = '2px dashed rgba(120,190,255,.20)';
        cell.style.background = 'rgba(10,22,42,.35)';
      }
      root.appendChild(cell);
      cells.push({ cell, rr, c, filled: !!v });
    }
  }
  const stat = place(T('', '0%', { fontSize: '150px', fontWeight: '800', color: '#FFB347', lineHeight: '1' }), root, 1076, 332);
  place(T('', 'Ô TRỐNG', { position: 'absolute', fontSize: '30px', letterSpacing: '4px', color: 'rgba(214,232,255,.75)' }), root, 1080, 502);
  place(T('', '7 / 20 ô có dữ liệu', { position: 'absolute', fontSize: '24px', color: 'rgba(214,232,255,.5)' }), root, 1080, 552);
  const c1 = place(E('div', 'chip', { position: 'absolute', left: '1080px', top: '632px', padding: '14px 26px', fontSize: '24px' }, 'MUA → 3 ĐIỂM'), root);
  const c2 = place(E('div', 'chip', { position: 'absolute', left: '1080px', top: '712px', padding: '14px 26px', fontSize: '24px' }, 'CÓ ĐÁNH GIÁ → SỐ SAO'), root);
  c2.style.background = 'rgba(255,179,71,.08)'; c2.style.borderColor = 'rgba(255,179,71,.35)'; c2.style.color = '#FFD9A3';

  obj.update = (t) => {
    cells.forEach(({ cell, c, filled }) => {
      const p = pr(t, .45 + c * .32, 1.25 + c * .32);
      const e = easeOut(cl(p));
      cell.style.opacity = filled ? e : e * .55;
      cell.style.transform = `scale(${.82 + .18 * e})`;
    });
    const pct = Math.round(65 * easeInOut(pr(t, 4.6, 6.4)));
    stat.textContent = pct + '%';
    opacity(c1, pr(t, 6.4, 7.1));
    opacity(c2, pr(t, 7.0, 7.8));
  };
}

/* ================= 04 FOUR SIGNALS ================= */
{
  const { root, obj } = scene('s04');
  titleBlock(root, 'ĐẦU VÀO', 'BỐN TÍN HIỆU');
  const icons = {
    svd: '<svg width="54" height="54" viewBox="0 0 54 54"><g fill="none" stroke="#38E1FF" stroke-width="2.4"><rect x="6" y="10" width="18" height="34" rx="3"/><rect x="30" y="10" width="18" height="34" rx="3"/><path d="M6 24h42M6 31h42"/></g></svg>',
    tfidf: '<svg width="54" height="54" viewBox="0 0 54 54"><g fill="none" stroke="#7C9CFF" stroke-width="2.4"><circle cx="23" cy="23" r="12"/><path d="M32 32l12 12"/><path d="M15 20h16M15 26h11"/></g></svg>',
    chat: '<svg width="54" height="54" viewBox="0 0 54 54"><g fill="none" stroke="#B388FF" stroke-width="2.4"><path d="M8 13h38v24H24l-10 8v-8H8z"/><path d="M16 24h20M16 30h13"/></g></svg>',
    star: '<svg width="54" height="54" viewBox="0 0 54 54"><path d="M27 8l6 13 14 1.6-10.4 9.3 2.8 13.8L27 38.4 14.6 45.7l2.8-13.8L7 22.6 21 21z" fill="none" stroke="#FFB347" stroke-width="2.4" stroke-linejoin="round"/></svg>'
  };
  const defs = [
    ['01', 'SVD', 'lọc cộng tác', 'khách giống nhau đã mua gì', icons.svd],
    ['02', 'TF-IDF', 'độ khớp nội dung', 'từ khóa × tên & mô tả món', icons.tfidf],
    ['03', 'CHATBOT', 'ngữ cảnh 24 giờ', '50 tin nhắn gần nhất', icons.chat],
    ['04', 'RATING', 'chất lượng món', 'điểm sao · Bayesian', icons.star]
  ];
  const cards = defs.map((d, i) => {
    const x = 162 + i * 405;
    const card = E('div', 'card', { left: x + 'px', top: '300px', width: '380px', height: '300px' });
    const idx = E('div', '', { position: 'absolute', left: '22px', top: '18px', fontSize: '22px', fontWeight: '800', color: '#FFB347', letterSpacing: '2px' }); idx.textContent = d[0];
    const ic = E('div', '', { position: 'absolute', left: '22px', top: '62px' }, d[4]);
    const ti = E('div', '', { position: 'absolute', left: '22px', top: '146px', fontSize: '32px', fontWeight: '800', letterSpacing: '.5px' }); ti.textContent = d[1];
    const su = E('div', '', { position: 'absolute', left: '22px', top: '188px', width: '330px', fontSize: '23px', lineHeight: '1.35', color: 'rgba(214,232,255,.6)' }); su.textContent = d[2] + ' · ' + d[3];
    card.append(idx, ic, ti, su); root.appendChild(card);
    return card;
  });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'arrows'); svg.setAttribute('viewBox', '0 0 1920 1080');
  const paths = defs.map((_, i) => {
    const x = 162 + i * 405 + 190;
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', `M${x} 606 C ${x} 690, 960 660, 960 752`);
    p.setAttribute('stroke-dasharray', '800'); p.setAttribute('stroke-dashoffset', '800');
    svg.appendChild(p); return p;
  });
  root.appendChild(svg);
  const node = E('div', 'card', { left: '690px', top: '752px', width: '540px', height: '94px', borderColor: 'rgba(56,225,255,.45)', background: 'rgba(8,26,48,.9)' });
  const nt = E('div', '', { position: 'absolute', left: '0', right: '0', top: '24px', textAlign: 'center', fontSize: '30px', fontWeight: '800', letterSpacing: '1.5px', color: '#BDF3FF' }); nt.textContent = 'ĐIỂM TỔNG HỢP';
  node.appendChild(nt); root.appendChild(node);

  obj.update = (t) => {
    cards.forEach((c, i) => { pop(c, pr(t, .35 + i * 1.35, 1.2 + i * 1.35), 30); });
    paths.forEach((p, i) => {
      const e = easeOut(pr(t, 5.6 + i * .22, 6.8 + i * .22));
      p.setAttribute('stroke-dashoffset', String(800 * (1 - e)));
    });
    const np = easeOut(pr(t, 7.0, 7.8));
    node.style.opacity = np;
    node.style.transform = `scale(${.92 + .08 * np})`;
    const pulse = 1 + .03 * Math.sin((t - 7.0) * 4);
    if (t > 7.0) node.style.transform = `scale(${np * pulse})`;
  };
}

/* ================= 05 WEIGHTS ================= */
{
  const { root, obj } = scene('s05');
  titleBlock(root, 'CHUẨN HÓA', 'TRỌNG SỐ 30 · 25 · 25 · 20');
  place(T('', 'MIN-MAX  →  [0, 1]', { position: 'absolute', fontSize: '24px', letterSpacing: '3px', color: 'rgba(214,232,255,.55)' }), root, 120, 316);
  const scale = E('div', '', { position: 'absolute', left: '120px', top: '352px', width: '1680px', height: '2px', background: 'rgba(120,190,255,.25)' });
  root.appendChild(scale);
  place(T('', '0', { position: 'absolute', fontSize: '20px', color: 'rgba(214,232,255,.45)' }), root, 120, 362);
  place(T('', '1', { position: 'absolute', fontSize: '20px', color: 'rgba(214,232,255,.45)' }), root, 1784, 362);

  const barWrap = E('div', '', { position: 'absolute', left: '120px', top: '400px', width: '1680px', height: '104px', borderRadius: '16px', overflow: 'hidden', background: 'rgba(10,22,42,.6)' });
  const segsDef = [
    [504, '#38E1FF', 'SVD 30%', '#04121F'],
    [420, '#7C9CFF', 'NỘI DUNG 25%', '#060D20'],
    [420, '#B388FF', 'CHATBOT 25%', '#0B0618'],
    [336, '#FFB347', 'RATING 20%', '#1A0F02']
  ];
  const segs = segsDef.map(([w, c, label, fg]) => {
    const d = E('div', '', { position: 'absolute', left: '0', top: '0', width: w + 'px', height: '104px', background: c });
    const l = E('div', '', { position: 'absolute', left: '0', top: '34px', width: w + 'px', textAlign: 'center', fontSize: '28px', fontWeight: '800', color: fg, letterSpacing: '1px' });
    l.textContent = label; d.appendChild(l); barWrap.appendChild(d); return d;
  });
  root.appendChild(barWrap);
  segs.forEach((s, i) => { s.style.transformOrigin = 'left center'; s.style.transform = 'scaleX(0)'; });

  const terms = [
    ['0.30 · SVD', '#38E1FF'],
    ['0.25 · TF-IDF', '#7C9CFF'],
    ['0.25 · CHAT', '#B388FF'],
    ['0.20 · RATING', '#FFB347']
  ];
  const row = E('div', '', { position: 'absolute', left: '120px', top: '560px', display: 'flex', alignItems: 'center', gap: '10px' });
  const termEls = [];
  terms.forEach(([tx, c], i) => {
    if (i) { const plus = E('div', '', { fontSize: '34px', color: 'rgba(214,232,255,.4)', width: '34px', textAlign: 'center' }); plus.textContent = '+'; row.appendChild(plus); }
    const t = E('div', '', { padding: '18px 26px', borderRadius: '12px', border: '1px solid ' + c + '55', background: c + '14', color: c, fontSize: '30px', fontWeight: '700', letterSpacing: '.5px', whiteSpace: 'nowrap' });
    t.textContent = tx; row.appendChild(t); termEls.push(t);
  });
  root.appendChild(row);
  const note = place(E('div', 'chip', { position: 'absolute', left: '120px', top: '700px', padding: '14px 26px', fontSize: '23px' }, 'THIẾU TÍN HIỆU → 0'), root);
  note.style.borderColor = 'rgba(255,179,71,.4)'; note.style.background = 'rgba(255,179,71,.08)'; note.style.color = '#FFD9A3';

  obj.update = (t) => {
    let offset = 0;
    segs.forEach((s, i) => {
      const p = easeOut(pr(t, 2.6 + i * 1.15, 3.9 + i * 1.15));
      s.style.transform = `scaleX(${p})`;
      s.style.left = offset + 'px';
      offset += segsDef[i][0];
      const l = s.firstChild;
      l.style.opacity = pr(t, 3.2 + i * 1.15, 4.2 + i * 1.15);
    });
    termEls.forEach((e, i) => pop(e, pr(t, 8.4 + i * 1.05, 9.4 + i * 1.05), 18));
    opacity(note, pr(t, 13.2, 14.0));
  };
}

/* ================= 06 SVD ================= */
{
  const { root, obj } = scene('s06');
  titleBlock(root, 'THUẬT TOÁN 1', 'SVD · PHÂN RÃ MA TRẬN', 'SINGULAR VALUE DECOMPOSITION');
  const cellW = 60, cellH = 52, gap = 6;
  const vals = { '0,0': 1, '0,3': 1, '1,1': 1, '1,4': 1, '2,2': 1, '3,0': 1, '3,3': 1 };
  const A = [], U = [], V = [];
  const ax = 140, ay = 420, ux = 590, uy = 420, vx = 830, vy = 476;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) {
    const filled = !!vals[r + ',' + c];
    const cell = E('div', 'cell', { position: 'absolute', left: (ax + c * (cellW + gap)) + 'px', top: (ay + r * (cellH + gap)) + 'px', width: cellW + 'px', height: cellH + 'px', borderRadius: '8px', background: filled ? 'rgba(56,225,255,.18)' : 'rgba(12,26,50,.55)', border: filled ? '1px solid rgba(56,225,255,.55)' : '1px dashed rgba(120,190,255,.18)' });
    root.appendChild(cell); A.push(cell);
  }
  for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) {
    const cell = E('div', '', { position: 'absolute', left: (ux + c * 66) + 'px', top: (uy + r * 58) + 'px', width: '60px', height: '52px', borderRadius: '8px', background: `rgba(124,156,255,${.12 + (r + c) % 3 * .10})`, border: '1px solid rgba(124,156,255,.45)' });
    root.appendChild(cell); U.push(cell);
  }
  for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) {
    const cell = E('div', '', { position: 'absolute', left: (vx + c * 66) + 'px', top: (vy + r * 58) + 'px', width: '60px', height: '52px', borderRadius: '8px', background: `rgba(179,136,255,${.12 + (r + c) % 3 * .10})`, border: '1px solid rgba(179,136,255,.45)' });
    root.appendChild(cell); V.push(cell);
  }
  place(T('', '=', { position: 'absolute', fontSize: '46px', fontWeight: '700', color: 'rgba(214,232,255,.45)' }), root, 500, 452);
  place(T('', '×', { position: 'absolute', fontSize: '46px', fontWeight: '700', color: 'rgba(214,232,255,.45)' }), root, 746, 452);
  place(T('', '4 × 5', { position: 'absolute', fontSize: '22px', letterSpacing: '2px', color: 'rgba(214,232,255,.45)' }), root, 140, 664);
  place(T('', '4 × k', { position: 'absolute', fontSize: '22px', letterSpacing: '2px', color: 'rgba(214,232,255,.45)' }), root, 590, 664);
  place(T('', 'k × 5', { position: 'absolute', fontSize: '22px', letterSpacing: '2px', color: 'rgba(214,232,255,.45)' }), root, 830, 602);
  const chip = place(E('div', 'chip', { position: 'absolute', left: '1340px', top: '420px', padding: '18px 30px', fontSize: '34px' }, 'k ≤ 20'), root);
  place(T('', 'đặc trưng ẩn tối đa', { position: 'absolute', fontSize: '24px', color: 'rgba(214,232,255,.55)' }), root, 1344, 492);
  place(T('', 'k = 2 · minh họa', { position: 'absolute', fontSize: '21px', color: 'rgba(214,232,255,.38)' }), root, 590, 700);
  place(T('', 'U × V  →  dự đoán số sao', { position: 'absolute', fontSize: '30px', fontWeight: '700', color: '#BDF3FF' }), root, 1330, 590);
  const pred = E('div', '', { position: 'absolute', left: (ax + 2 * 66) + 'px', top: (ay + 58) + 'px', width: '60px', height: '52px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: '#04121F', background: '#38E1FF', opacity: 0, boxShadow: '0 0 30px rgba(56,225,255,.6)' });
  pred.textContent = '4.4'; root.appendChild(pred);
  const predLab = place(T('', 'DỰ ĐOÁN', { position: 'absolute', fontSize: '17px', letterSpacing: '2px', color: '#38E1FF' }), root, (ax + 2 * 66) - 6, (ay + 58) + 62);
  predLab.style.background = 'rgba(4,16,31,.92)'; predLab.style.padding = '2px 8px'; predLab.style.borderRadius = '6px';

  obj.update = (t) => {
    A.forEach((c, i) => { const p = easeOut(pr(t, .4 + (i % 5) * .16, 1.2 + (i % 5) * .16)); c.style.opacity = p * (c.style.borderStyle === 'dashed' ? .55 : 1); c.style.transform = `scale(${.86 + .14 * p})`; });
    U.forEach((c, i) => { pop(c, pr(t, 4.4 + i * .06, 5.2 + i * .06), 18); });
    V.forEach((c, i) => { pop(c, pr(t, 6.0 + i * .06, 6.8 + i * .06), 18); });
    opacity(chip, pr(t, 8.2, 8.9));
    const pp = pr(t, 13.6, 14.6);
    pred.style.opacity = pp;
    pred.style.transform = `scale(${.6 + .4 * easeBack(cl(pp))})`;
    opacity(predLab, pr(t, 14.2, 15.0));
  };
}

/* ================= 07 APRIORI ================= */
{
  const { root, obj } = scene('s07');
  titleBlock(root, 'THUẬT TOÁN 2', 'APRIORI · LUẬT KẾT HỢP');
  place(T('', '100 ĐƠN GẦN NHẤT', { position: 'absolute', fontSize: '22px', letterSpacing: '3px', color: 'rgba(214,232,255,.5)' }), root, 120, 292);
  const gaArr = [0, 7, 14, 21, 28, 35, 42, 49, 56, 63, 70, 77];
  const overlap = new Set(gaArr.slice(0, 9));
  const camOnly = new Set([1, 2, 3, 4, 5, 8, 9, 11, 16, 17, 19, 23, 26, 31, 33, 38, 44, 52, 58, 66, 74]);
  const dots = [];
  for (let i = 0; i < 100; i++) {
    const r = Math.floor(i / 10), c = i % 10;
    const isGa = gaArr.includes(i), isOv = overlap.has(i), isCam = camOnly.has(i);
    const d = E('div', '', {
      position: 'absolute', left: (120 + c * 23) + 'px', top: (336 + r * 23) + 'px', width: '17px', height: '17px', borderRadius: '50%',
      background: isGa ? '#38E1FF' : isCam ? 'rgba(255,179,71,.35)' : 'rgba(160,200,240,.13)',
      border: isOv ? '2px solid #FFB347' : isCam ? '1px solid rgba(255,179,71,.55)' : 'none'
    });
    root.appendChild(d); dots.push(d);
  }
  const leg = E('div', '', { position: 'absolute', left: '120px', top: '620px', display: 'flex', flexDirection: 'column', gap: '14px' });
  [['#38E1FF', 'GÀ NƯỚNG · 12', ''], ['#38E1FF', 'GÀ + CƠM · 9', '2px solid #FFB347'], ['rgba(255,179,71,.35)', 'CƠM TRẮNG · 30', '1px solid rgba(255,179,71,.5)']].forEach(([c, l, bd]) => {
    const it = E('div', '', { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '21px', color: 'rgba(214,232,255,.62)' });
    const sw = E('div', '', { width: '14px', height: '14px', borderRadius: '50%', background: c, border: bd || 'none' });
    it.append(sw, document.createTextNode(l)); leg.appendChild(it);
  });
  root.appendChild(leg);

  const tiles = [
    ['0%', 'SUPPORT({GÀ}) · 12/100'],
    ['0%', 'CONFIDENCE · 9/12'],
    ['0.0×', 'LIFT · 0.75 / 0.30']
  ].map(([v, l], i) => {
    const y = 330 + i * 172;
    const card = E('div', 'card', { left: '470px', top: y + 'px', width: '660px', height: '150px' });
    const val = E('div', '', { position: 'absolute', left: '30px', top: '26px', fontSize: '66px', fontWeight: '800', color: i === 2 ? '#FFB347' : '#38E1FF', width: '300px' }); val.textContent = v;
    const lab = E('div', '', { position: 'absolute', left: '320px', top: '46px', width: '310px', fontSize: '21px', lineHeight: '1.35', color: 'rgba(214,232,255,.62)', letterSpacing: '.5px' }); lab.textContent = l;
    card.append(val, lab); root.appendChild(card);
    return val;
  });

  const tc = E('div', 'card', { left: '1200px', top: '330px', width: '580px', height: '300px' });
  const tch = E('div', '', { position: 'absolute', left: '30px', top: '26px', fontSize: '22px', letterSpacing: '3px', color: '#FFB347' }); tch.textContent = 'NGƯỠNG CẤU HÌNH';
  const lines = ['min_support ≥ 1.5%', 'min_confidence ≥ 30%', 'lift > 1 → ưu tiên'];
  const tls = lines.map((l, i) => {
    const d = E('div', '', { position: 'absolute', left: '30px', top: (86 + i * 58) + 'px', fontSize: '26px', color: 'rgba(226,240,255,.82)', fontVariantNumeric: 'tabular-nums' });
    d.textContent = l; tc.appendChild(d); return d;
  });
  tc.appendChild(tch); root.appendChild(tc);
  place(T('', 'lift = P(B|A) / P(B)', { position: 'absolute', fontSize: '24px', color: 'rgba(214,232,255,.5)' }), root, 1200, 690);
  const liftEq = place(T('', '= 0.75 / 0.30 = 2.5', { position: 'absolute', fontSize: '38px', fontWeight: '800', color: '#FFB347' }), root, 1200, 730);
  liftEq.style.opacity = 0;

  obj.update = (t) => {
    dots.forEach((d, i) => {
      const p = easeOut(pr(t, .3 + (i % 10) * .05, 1.2 + (i % 10) * .05));
      d.style.opacity = p; d.style.transform = `scale(${.6 + .4 * p})`;
    });
    const s1 = Math.round(12 * easeInOut(pr(t, 3.4, 5.0)));
    const s2 = Math.round(75 * easeInOut(pr(t, 6.6, 8.2)));
    const s3 = 2.5 * easeInOut(pr(t, 10.2, 11.8));
    tiles[0].textContent = s1 + '%';
    tiles[1].textContent = s2 + '%';
    tiles[2].textContent = fmt(s3, 1) + '×';
    opacity(liftEq, pr(t, 11.0, 11.8));
  };
}

/* ================= 08 CART ================= */
{
  const { root, obj } = scene('s08');
  titleBlock(root, 'TRONG GIỎ HÀNG', 'LUẬT → GỢI Ý KÈM');
  const cart = E('div', 'card', { left: '120px', top: '320px', width: '450px', height: '380px' });
  const ch = E('div', '', { position: 'absolute', left: '28px', top: '24px', fontSize: '22px', letterSpacing: '3px', color: 'rgba(214,232,255,.55)' }); ch.textContent = 'GIỎ HÀNG';
  cart.appendChild(ch);
  ['GÀ NƯỚNG', 'RAU XÀO'].forEach((n, i) => {
    const c = E('div', '', { position: 'absolute', left: '28px', top: (86 + i * 92) + 'px', width: '394px', height: '72px', borderRadius: '12px', background: 'rgba(56,225,255,.08)', border: '1px solid rgba(56,225,255,.28)', display: 'flex', alignItems: 'center', padding: '0 22px', fontSize: '27px', fontWeight: '600' });
    c.textContent = n; cart.appendChild(c);
  });
  root.appendChild(cart);
  const rule = E('div', 'card', { left: '660px', top: '320px', width: '480px', height: '380px', borderColor: 'rgba(255,179,71,.35)' });
  const rh = E('div', '', { position: 'absolute', left: '28px', top: '24px', fontSize: '22px', letterSpacing: '3px', color: '#FFB347' }); rh.textContent = 'LUẬT KẾT HỢP';
  const rl = E('div', '', { position: 'absolute', left: '28px', top: '92px', width: '424px', fontSize: '30px', fontWeight: '700', lineHeight: '1.3' }); rl.textContent = 'GÀ NƯỚNG → CƠM TRẮNG';
  const rf = E('div', '', { position: 'absolute', left: '28px', top: '184px', fontSize: '23px', color: 'rgba(214,232,255,.6)' }); rf.textContent = 'lift 2.5 × conf 0.75';
  const rv = E('div', '', { position: 'absolute', left: '28px', top: '228px', fontSize: '66px', fontWeight: '800', color: '#FFB347' }); rv.textContent = '= 1.875';
  rule.append(rh, rl, rf, rv); root.appendChild(rule);
  const rec = E('div', 'card', { left: '1190px', top: '300px', width: '590px', height: '440px' });
  const rech = E('div', '', { position: 'absolute', left: '28px', top: '22px', fontSize: '22px', letterSpacing: '3px', color: '#38E1FF' }); rech.textContent = 'GỢI Ý KÈM · TOP 4';
  rec.appendChild(rech); root.appendChild(rec);
  const items = [
    ['CƠM TRẮNG', '1.875', 1], ['CANH CHUA', '1.32', .86], ['DƯA LEO', '0.98', .7], ['RAU XÀO', 'đã có', 0]
  ].map(([n, s, w], i) => {
    const y = 80 + i * 84;
    const row = E('div', '', { position: 'absolute', left: '28px', top: y + 'px', width: '534px', height: '66px' });
    const nm = E('div', '', { position: 'absolute', left: '0', top: '18px', fontSize: '25px', fontWeight: '600', width: '220px' }); nm.textContent = n;
    const bar = E('div', '', { position: 'absolute', left: '230px', top: '24px', height: '16px', borderRadius: '8px', background: w ? '#38E1FF' : 'rgba(255,255,255,.18)', width: (w ? 210 * w : 120) + 'px', opacity: w ? .85 : .3 });
    const sc = E('div', '', { position: 'absolute', right: '0', top: '8px', width: '90px', textAlign: 'right', fontSize: '26px', fontWeight: '800', color: w ? '#BDF3FF' : 'rgba(214,232,255,.4)' }); sc.textContent = s;
    row.append(nm, bar, sc); rec.appendChild(row);
    if (!w) { nm.style.textDecoration = 'line-through'; nm.style.color = 'rgba(214,232,255,.4)'; }
    return row;
  });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'arrows'); svg.setAttribute('viewBox', '0 0 1920 1080');
  const mk = (d) => { const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', d); p.setAttribute('marker-end', 'url(#ar)'); p.setAttribute('stroke-dasharray', '300'); p.setAttribute('stroke-dashoffset', '300'); return p; };
  svg.innerHTML = '<defs><marker id="ar" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38E1FF"/></marker></defs>';
  const a1 = mk('M580 500 L648 500'), a2 = mk('M1150 500 L1182 500');
  svg.append(a1, a2); root.appendChild(svg);

  obj.update = (t) => {
    pop(cart, pr(t, .4, 1.2), 26);
    const e1 = easeOut(pr(t, 2.0, 2.8)); a1.setAttribute('stroke-dashoffset', String(300 * (1 - e1)));
    pop(rule, pr(t, 3.0, 3.8), 26);
    const e2 = easeOut(pr(t, 6.0, 6.8)); a2.setAttribute('stroke-dashoffset', String(300 * (1 - e2)));
    items.forEach((r, i) => pop(r, pr(t, 6.6 + i * .55, 7.4 + i * .55), 16));
    const rp = pr(t, 9.6, 10.4);
    rv.style.opacity = rp; rv.style.transform = `scale(${.8 + .2 * easeBack(cl(rp))})`;
  };
}

/* ================= 09 FUSION ================= */
{
  const { root, obj } = scene('s09');
  titleBlock(root, 'KẾT QUẢ', 'GHÉP ĐIỂM · XẾP HẠNG');
  legend(root, [['#38E1FF', 'SVD'], ['#7C9CFF', 'NỘI DUNG'], ['#B388FF', 'CHATBOT'], ['#FFB347', 'RATING']], 1200, 160);
  const rows = [
    { name: 'MÓN C', parts: [.225, .100, .225, .120], total: .670, rank: 1 },
    { name: 'MÓN B', parts: [.180, .200, .125, .140], total: .645, rank: 2 },
    { name: 'MÓN A', parts: [.270, .050, .025, .170], total: .515, rank: 3 }
  ];
  const colors = ['#38E1FF', '#7C9CFF', '#B388FF', '#FFB347'];
  const built = rows.map((row, i) => {
    const y = 300 + i * 196;
    const card = E('div', 'card', { left: '120px', top: y + 'px', width: '1680px', height: '160px' });
    const rank = E('div', '', { position: 'absolute', left: '26px', top: '38px', width: '78px', height: '78px', borderRadius: '50%', border: '2px solid ' + (i === 0 ? '#38E1FF' : 'rgba(214,232,255,.3)'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '800', color: i === 0 ? '#38E1FF' : 'rgba(214,232,255,.6)' });
    rank.textContent = '#' + row.rank;
    const nm = E('div', '', { position: 'absolute', left: '132px', top: '54px', fontSize: '38px', fontWeight: '800', letterSpacing: '1px' }); nm.textContent = row.name;
    const barWrap = E('div', '', { position: 'absolute', left: '390px', top: '52px', height: '56px', width: '1000px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,.03)' });
    const segs = row.parts.map((v, j) => {
      const s = E('div', '', { position: 'absolute', top: '0', height: '56px', width: (v * 1450) + 'px', background: colors[j] });
      s.style.transformOrigin = 'left center'; s.style.transform = 'scaleX(0)';
      barWrap.appendChild(s); return s;
    });
    const tot = E('div', '', { position: 'absolute', left: '1418px', top: '42px', width: '230px', textAlign: 'right', fontSize: '56px', fontWeight: '800', color: i === 0 ? '#38E1FF' : 'rgba(226,240,255,.85)' }); tot.textContent = '0.000';
    card.append(rank, nm, barWrap, tot); root.appendChild(card);
    return { card, segs, tot, total: row.total };
  });
  obj.update = (t) => {
    built.forEach((b, i) => {
      const p = pr(t, 2.4 + i * 2.3, 3.4 + i * 2.3);
      pop(b.card, p, 24);
      let off = 0;
      b.segs.forEach((s, j) => {
        const q = easeOut(pr(t, 2.8 + i * 2.3 + j * .18, 4.0 + i * 2.3 + j * .18));
        s.style.transform = `scaleX(${q})`;
        s.style.left = off + 'px';
        off += rows[i].parts[j] * 1450;
      });
      const n = b.total * easeInOut(pr(t, 3.2 + i * 2.3, 4.6 + i * 2.3));
      b.tot.textContent = fmt(n, 3);
      if (i === 0) {
        const g = pr(t, 11.6, 12.4);
        b.card.style.borderColor = `rgba(56,225,255,${.2 + .45 * g})`;
        b.card.style.boxShadow = `0 18px 50px rgba(0,0,0,.3), 0 0 ${50 * g}px rgba(56,225,255,${.20 * g})`;
      }
    });
  };
}

/* ================= 10 COLD START ================= */
{
  const { root, obj } = scene('s10');
  titleBlock(root, 'KHI THIẾU DỮ LIỆU', 'COLD START · FALLBACK');
  const note = place(E('div', 'chip', { position: 'absolute', left: '1300px', top: '172px', padding: '12px 22px', fontSize: '21px' }, 'SVD KHÔNG DỰ ĐOÁN ĐƯỢC'), root);
  note.style.borderColor = 'rgba(255,179,71,.45)'; note.style.background = 'rgba(255,179,71,.08)'; note.style.color = '#FFD9A3';
  const rowsDef = [
    ['KHÁCH CHƯA CÓ LỊCH SỬ', 'MÓN THỊNH HÀNH · TRENDING', false],
    ['MÓN MỚI RA MẮT', 'LỌC THEO NHÃN KHẨU VỊ', false],
    ['THIẾU TÍN HIỆU', 'ĐIỂM 0 · XUỐNG CUỐI BẢNG', true]
  ];
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'arrows'); svg.setAttribute('viewBox', '0 0 1920 1080');
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  marker.setAttribute('id', 'ar2'); marker.setAttribute('markerWidth', '8');
  marker.setAttribute('markerHeight', '8'); marker.setAttribute('refX', '5');
  marker.setAttribute('refY', '3'); marker.setAttribute('orient', 'auto');
  const head = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  head.setAttribute('d', 'M0,0 L0,6 L6,3 z'); head.setAttribute('fill', '#38E1FF');
  marker.appendChild(head); defs.appendChild(marker); svg.appendChild(defs);
  const arrows = [];
  const rows = rowsDef.map(([cond, res, dim], i) => {
    const y = 320 + i * 190;
    const c = E('div', 'card', { left: '120px', top: y + 'px', width: '600px', height: '126px', display: 'flex', alignItems: 'center', padding: '0 30px', fontSize: '28px', fontWeight: '600', letterSpacing: '.5px' });
    c.textContent = cond;
    if (dim) { c.style.borderColor = 'rgba(214,232,255,.12)'; }
    const r = E('div', 'card', { left: '920px', top: y + 'px', width: '880px', height: '126px', display: 'flex', alignItems: 'center', padding: '0 30px', fontSize: '28px', fontWeight: '700' });
    r.textContent = res;
    r.style.borderColor = dim ? 'rgba(214,232,255,.12)' : 'rgba(56,225,255,.38)';
    r.style.background = dim ? 'rgba(10,20,38,.5)' : 'rgba(12,34,58,.8)';
    if (dim) { r.style.color = 'rgba(214,232,255,.45)'; }
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', `M740 ${y + 63} L916 ${y + 63}`);
    p.setAttribute('marker-end', 'url(#ar2)');
    p.setAttribute('stroke-dasharray', '180'); p.setAttribute('stroke-dashoffset', '180');
    svg.appendChild(p); arrows.push(p);
    root.append(c, r);
    return { c, r };
  });
  root.appendChild(svg);
  const foot = place(T('', 'fallback giữ trải nghiệm liền mạch khi thiếu dữ liệu', { position: 'absolute', fontSize: '24px', color: 'rgba(214,232,255,.5)' }), root, 120, 900);
  obj.update = (t) => {
    opacity(note, pr(t, .2, .8));
    rows.forEach((r, i) => {
      const st = 1.4 + i * 3.6;
      pop(r.c, pr(t, st, st + .7), 22);
      pop(r.r, pr(t, st + .45, st + 1.2), 22);
      const e = easeOut(pr(t, st + .2, st + .9));
      arrows[i].setAttribute('stroke-dashoffset', String(180 * (1 - e)));
      if (i === 2) { r.c.style.opacity *= .55; r.r.style.opacity *= .55; }
    });
    opacity(foot, pr(t, 15.5, 16.3));
  };
}

/* ================= 11 EVALUATION ================= */
{
  const { root, obj } = scene('s11');
  titleBlock(root, 'KIỂM CHỨNG', 'ĐÁNH GIÁ · ĐÁNH ĐỔI');
  const chip = place(E('div', 'chip', { position: 'absolute', left: '1310px', top: '176px', padding: '12px 24px', fontSize: '22px' }, '80/20 TRAIN – TEST'), root);
  opacity(chip, 0);
  place(T('', 'SVD', { position: 'absolute', left: '700px', top: '286px', fontSize: '24px', fontWeight: '800', letterSpacing: '3px', color: '#38E1FF' }), root);
  place(T('', 'NCF', { position: 'absolute', left: '1160px', top: '286px', fontSize: '24px', fontWeight: '800', letterSpacing: '3px', color: '#FFB347' }), root);
  const rows = [
    ['RMSE', '0.82', '0.79'],
    ['PRECISION@5', '68.5%', '78.5%'],
    ['LATENCY', '12 ms', '95 ms'],
    ['TRAIN TIME', '0.45 s', '185 s']
  ].map(([l, a, b], i) => {
    const y = 340 + i * 138;
    const line = E('div', '', { position: 'absolute', left: '120px', top: (y - 18) + 'px', width: '1660px', height: '1px', background: 'rgba(120,190,255,.14)' });
    const lb = E('div', '', { position: 'absolute', left: '120px', top: (y + 20) + 'px', fontSize: '28px', letterSpacing: '2px', color: 'rgba(214,232,255,.55)' }); lb.textContent = l;
    const va = E('div', '', { position: 'absolute', left: '700px', top: (y + 2) + 'px', fontSize: '52px', fontWeight: '800', color: '#38E1FF', fontVariantNumeric: 'tabular-nums' }); va.textContent = a;
    const vb = E('div', '', { position: 'absolute', left: '1160px', top: (y + 2) + 'px', fontSize: '52px', fontWeight: '800', color: '#FFB347', fontVariantNumeric: 'tabular-nums' }); vb.textContent = b;
    root.append(line, lb, va, vb);
    return { line, lb, va, vb };
  });
  const speed = place(E('div', 'chip', { position: 'absolute', left: '700px', top: '690px', padding: '10px 20px', fontSize: '21px' }, 'NHANH HƠN 7.9×'), root);
  speed.style.background = 'rgba(56,225,255,.16)';
  speed.style.opacity = 0;
  const src = place(T('', 'Nguồn: evaluate_models.py — bảng đối chứng của đồ án', { position: 'absolute', fontSize: '20px', color: 'rgba(214,232,255,.38)', letterSpacing: '.5px' }), root, 120, 892);
  obj.update = (t) => {
    opacity(chip, pr(t, .2, .8));
    rows.forEach((r, i) => {
      const st = .5 + i * 2.4;
      pop(r.line, pr(t, st, st + .4), 0);
      pop(r.lb, pr(t, st, st + .6), 14);
      pop(r.va, pr(t, st + .1, st + .75), 18);
      pop(r.vb, pr(t, st + .2, st + .85), 18);
    });
    const sp = pr(t, 11.6, 12.4);
    speed.style.opacity = sp * .95;
    speed.style.transform = `translateY(${(1 - easeOut(sp)) * 14}px)`;
    opacity(src, pr(t, 15.6, 16.4) * .9);
  };
}

/* ================= 12 SUMMARY ================= */
{
  const { root, obj } = scene('s12');
  titleBlock(root, 'TÓM TẮT', 'NHỚ BA ĐIỀU');
  const defs = [
    ['01', 'MA TRẬN THƯA', 'hành vi khách tạo ra dữ liệu; phần trống là cơ hội gợi ý'],
    ['02', 'SVD + APRIORI', 'SVD đoán khẩu vị, Apriori bắt thói quen mua kèm'],
    ['03', 'TRỌNG SỐ', 'quyết định món nào lên đầu; chỉnh theo mục tiêu kinh doanh']
  ];
  const cards = defs.map(([n, ti, sub], i) => {
    const x = 180 + i * 530;
    const c = E('div', 'card', { left: x + 'px', top: '310px', width: '500px', height: '276px' });
    const acc = E('div', '', { position: 'absolute', left: '0', top: '0', width: '100%', height: '4px', background: 'linear-gradient(90deg,#38E1FF,rgba(56,225,255,0))' });
    const num = E('div', '', { position: 'absolute', left: '30px', top: '28px', fontSize: '26px', fontWeight: '800', color: '#FFB347', letterSpacing: '2px' }); num.textContent = n;
    const t = E('div', '', { position: 'absolute', left: '30px', top: '74px', fontSize: '36px', fontWeight: '800', letterSpacing: '-.5px' }); t.textContent = ti;
    const s = E('div', '', { position: 'absolute', left: '30px', top: '132px', width: '430px', fontSize: '23px', lineHeight: '1.45', color: 'rgba(214,232,255,.6)' }); s.textContent = sub;
    c.append(acc, num, t, s); root.appendChild(c); return c;
  });
  const banner = E('div', 'card', { left: '120px', top: '660px', width: '1680px', height: '104px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: 'rgba(56,225,255,.35)', background: 'rgba(10,30,52,.8)' });
  banner.innerHTML = '<span style="font-size:36px;font-weight:800;letter-spacing:.5px">4 TÍN HIỆU&nbsp; + &nbsp;2 THUẬT TOÁN&nbsp; <span style="color:#38E1FF">→</span>&nbsp; 1 BẢNG XẾP HẠNG</span>';
  root.appendChild(banner);
  const f = place(T('', '0.30·SVD + 0.25·TF-IDF + 0.25·CHAT + 0.20·RATING', { position: 'absolute', fontSize: '25px', letterSpacing: '1px', color: 'rgba(214,232,255,.45)', fontVariantNumeric: 'tabular-nums' }), root, 120, 806);
  obj.update = (t) => {
    cards.forEach((c, i) => pop(c, pr(t, .4 + i * 1.35, 1.3 + i * 1.35), 30));
    const bp = pr(t, 14.2, 15.2);
    banner.style.opacity = bp;
    banner.style.transform = `translateY(${(1 - easeOut(bp)) * 24}px) scale(${.97 + .03 * easeOut(bp)})`;
    opacity(f, pr(t, 18.0, 18.8) * .9);
  };
}

/* ================= QUIZ ================= */
function buildQuiz(sc, idx) {
  const { root, obj } = scene(sc.id);
  const q = sc.quiz;
  const k = place(E('div', 'chip', { position: 'absolute', left: '120px', top: '160px', padding: '12px 24px', fontSize: '21px' }, 'KIỂM TRA NHANH'), root);
  place(T('', `CÂU ${idx} / 3`, { position: 'absolute', left: '1660px', top: '162px', fontSize: '22px', letterSpacing: '3px', color: 'rgba(214,232,255,.55)' }), root);
  const question = place(T('', q.q, { position: 'absolute', left: '120px', top: '224px', width: '1460px', fontSize: '48px', fontWeight: '800', lineHeight: '1.24', letterSpacing: '-.5px' }), root);
  const ringWrap = E('div', '', { position: 'absolute', left: '1670px', top: '230px', width: '150px', height: '150px' });
  ringWrap.innerHTML = `<svg width="150" height="150" viewBox="0 0 150 150">
      <circle cx="75" cy="75" r="60" fill="none" stroke="rgba(120,190,255,.18)" stroke-width="10"/>
      <circle id="ring" cx="75" cy="75" r="60" fill="none" stroke="#38E1FF" stroke-width="10" stroke-linecap="round"
        transform="rotate(-90 75 75)" stroke-dasharray="377" stroke-dashoffset="0"/>
    </svg><div id="cnum" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:46px;font-weight:800;color:#BDF3FF"></div>`;
  root.appendChild(ringWrap);
  const ring = ringWrap.querySelector('#ring'), cnum = ringWrap.querySelector('#cnum');
  const opts = q.options.map((txt, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 120 + col * 830, y = 440 + row * 156;
    const o = E('div', 'opt', { left: x + 'px', top: y + 'px', width: '790px', height: '126px' });
    const lt = E('div', 'lt'); lt.textContent = 'ABCD'[i];
    const tx = E('div', 'tx'); tx.textContent = txt;
    o.append(lt, tx); root.appendChild(o);
    return o;
  });
  const explain = place(T('', '', { position: 'absolute', left: '120px', top: '790px', width: '1680px', fontSize: '28px', fontWeight: '600', color: '#38E1FF' }), root);
  explain.innerHTML = '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#38E1FF;margin-right:14px;vertical-align:middle"></span>' + q.explain;

  const c0 = sc.countdown[0] - sc.start, c1 = sc.countdown[1] - sc.start, rv = sc.reveal - sc.start;
  const qi = sc.times[0][0] - sc.start;
  const ai = sc.times[1][0] - sc.start;
  obj.update = (t) => {
    pop(k, pr(t, .1, .6), 12);
    pop(question, pr(t, .15, .85), 20);
    opts.forEach((o, i) => pop(o, pr(t, .5 + i * .22, 1.25 + i * .22), 24));
    const inCd = t >= c0 - .05 && t < c1;
    const cdProgress = cl((t - c0) / 4);
    ringWrap.style.opacity = t < c0 ? 0 : (t < rv ? 1 : .25);
    cnum.textContent = t < c0 ? '' : (t < c1 ? String(Math.max(1, Math.ceil(4 * (1 - cdProgress)))) : '✓');
    ring.style.strokeDashoffset = String(377 * cdProgress);
    ring.style.stroke = t < c1 ? '#38E1FF' : '#7CFFB2';
    const rp = pr(t, rv - .05, rv + .25);
    opts.forEach((o, i) => {
      if (i === q.answer) {
        o.classList.toggle('correct', t >= rv - .05);
      } else {
        o.style.opacity = (1 - .68 * rp);
      }
    });
    explain.style.opacity = pr(t, rv + .1, rv + .7);
    explain.style.transform = `translateY(${(1 - easeOut(pr(t, rv + .1, rv + .7))) * 14}px)`;
  };
}
DATA.scenes.filter(s => s.kind === 'quiz').forEach((s, i) => buildQuiz(s, i + 1));

/* ================= 16 OUTRO ================= */
{
  const { root, obj } = scene('s16');
  const l1 = place(T('h1', 'TỪ MỘT THỰC ĐƠN CHUNG', { fontSize: '52px', color: 'rgba(214,232,255,.55)', letterSpacing: '2px' }), root, 120, 214);
  const l2 = place(T('h1', 'MỖI KHÁCH', { fontSize: '92px' }), root, 116, 288);
  const l3 = place(T('h1', 'MỘT THỰC ĐƠN RIÊNG', { fontSize: '78px', color: '#38E1FF', letterSpacing: '-2px' }), root, 116, 404);
  const tags = [['CAY', '#FF8A5B'], ['CHAY', '#7CFFB2'], ['HẢI SẢN', '#38E1FF'], ['MÓN MỚI', '#FFB347'], ['GIA ĐÌNH', '#B388FF'], ['NHANH', '#7C9CFF']];
  const cards = tags.map(([label, c], i) => {
    const x = 1120 + (i % 2) * 344, y = 250 + Math.floor(i / 2) * 178;
    const card = E('div', 'card', { left: x + 'px', top: y + 'px', width: '318px', height: '140px' });
    const dot = E('div', '', { position: 'absolute', left: '22px', top: '24px', width: '46px', height: '46px', borderRadius: '50%', border: '2px solid ' + c, background: c + '22' });
    const t1 = E('div', '', { position: 'absolute', left: '84px', top: '30px', fontSize: '24px', fontWeight: '800', letterSpacing: '2px', color: c }); t1.textContent = label;
    const t2 = E('div', '', { position: 'absolute', left: '84px', top: '68px', fontSize: '17px', color: 'rgba(214,232,255,.45)' }); t2.textContent = 'thực đơn riêng';
    card.append(dot, t1, t2); root.appendChild(card); return card;
  });
  place(T('', 'ẨM THỰC PHƯƠNG NAM', { position: 'absolute', fontSize: '26px', fontWeight: '700', letterSpacing: '5px', color: 'rgba(226,240,255,.75)' }), root, 120, 840);
  place(T('', 'KLTN 2026 · NGUYỄN HUỲNH KỸ THUẬT · ĐH TRÀ VINH', { position: 'absolute', fontSize: '20px', letterSpacing: '2px', color: 'rgba(214,232,255,.4)' }), root, 120, 884);
  obj.update = (t) => {
    pop(l1, pr(t, .1, .7), 16);
    pop(l2, pr(t, .25, 1.0), 26);
    pop(l3, pr(t, .55, 1.3), 26);
    cards.forEach((c, i) => {
      const p = pr(t, 1.2 + i * .22, 2.1 + i * .22);
      pop(c, p, 24);
      const drift = easeOut(pr(t, 5.6, 7.4));
      c.style.transform = `translate(${(i % 2 ? 1 : -1) * 14 * drift}px, ${(Math.floor(i / 2) - 1) * 7 * drift}px)`;
    });
  };
}

/* ================= renderer ================= */
let active = -1;
function setActive(i) {
  if (i === active) return;
  SCENES.forEach((s, k) => s.root.classList.toggle('on', k === i));
  active = i;
}
const cues = DATA.cues;
let cueIdx = -2;
function updateSubs(T) {
  let found = -1;
  for (let i = 0; i < cues.length; i++) {
    if (T >= cues[i].start - .02 && T < cues[i].end + .10) { found = i; break; }
  }
  if (found !== cueIdx) {
    cueIdx = found;
    if (found < 0) { subBox.style.opacity = 0; }
    else {
      subText.textContent = wrapText(cues[found].text);
      subBox.style.opacity = 1;
    }
  }
}
function wrapText(text) {
  const LIMIT = 56;
  if (text.length <= LIMIT) return text;
  const words = text.split(/\s+/);
  let best = null;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
    if (a.length <= LIMIT && b.length <= LIMIT) {
      const sc = Math.abs(a.length - b.length);
      if (!best || sc < best.sc) best = { sc, a, b };
    }
  }
  if (best) return best.a + '\n' + best.b;
  return text;
}
window.renderAt = function (T) {
  let idx = 0;
  for (let i = 0; i < DATA.scenes.length; i++) if (T >= DATA.scenes[i].start - 1e-6) idx = i;
  setActive(idx);
  const sc = DATA.scenes[idx];
  SCENES[idx].update(T - sc.start, sc);
  updateSubs(T);
  idxNum.textContent = String(sc.num).padStart(2, '0');
  prog.style.width = (cl(T / DATA.total) * 100).toFixed(3) + '%';
  const local = T - sc.start;
  sweep.style.opacity = (0.55 * (1 - easeOut(pr(local, 0, .5)))).toFixed(3);
  sweep.style.transform = `translateX(${(local * 900).toFixed(0)}px)`;
  const grid = document.getElementById('bggrid');
  grid.style.transform = `translate(${Math.sin(T * .06) * 14}px,${Math.cos(T * .05) * 10}px)`;
  return idx;
};
window.__sceneCount = SCENES.length;
