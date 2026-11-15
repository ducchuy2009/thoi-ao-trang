'use strict';
/* ============================================================
 *  02. ĐỒ HOẠ PIXEL — toàn bộ được vẽ bằng code (không dùng ảnh ngoài)
 *  Phong cách: nhìn từ trên xuống, nhân vật chibi đầu to, viền đậm, bóng đổ.
 * ============================================================ */
const OUT = '#2a2136';
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function cx(c) { const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return x; }
function R(x, col, a, b, w, h) { x.fillStyle = col; x.fillRect(a | 0, b | 0, w === undefined ? 1 : w, h === undefined ? 1 : h); }
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; const f = amt / 100;
  if (f < 0) { r *= 1 + f; g *= 1 + f; b *= 1 + f; } else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
  return '#' + ((1 << 24) | (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)).toString(16).slice(1);
}
// Tự động thêm viền đậm 1px quanh sprite
function outline(src, col) {
  const w = src.width, h = src.height, c = mk(w + 2, h + 2), x = cx(c);
  const d = src.getContext('2d').getImageData(0, 0, w, h).data;
  const A = (i, j) => (i < 0 || j < 0 || i >= w || j >= h) ? 0 : d[(j * w + i) * 4 + 3];
  x.fillStyle = col || OUT;
  for (let j = -1; j <= h; j++) for (let i = -1; i <= w; i++) {
    if (A(i, j) < 128 && (A(i - 1, j) >= 128 || A(i + 1, j) >= 128 || A(i, j - 1) >= 128 || A(i, j + 1) >= 128)) x.fillRect(i + 1, j + 1, 1, 1);
  }
  x.drawImage(src, 1, 1); return c;
}
function ell(x, col, cx0, cy0, rx, ry) {
  x.fillStyle = col;
  for (let j = Math.floor(-ry); j <= ry; j++) for (let i = Math.floor(-rx); i <= rx; i++) {
    if ((i * i) / (rx * rx) + (j * j) / (ry * ry) <= 1.02) x.fillRect(Math.round(cx0 + i), Math.round(cy0 + j), 1, 1);
  }
}
function ring(x, col, cx0, cy0, r) {
  x.fillStyle = col;
  for (let j = -r - 1; j <= r + 1; j++) for (let i = -r - 1; i <= r + 1; i++) { const d = Math.sqrt(i * i + j * j); if (d >= r - 0.6 && d <= r + 0.5) x.fillRect(cx0 + i, cy0 + j, 1, 1); }
}
function line(x, col, x0, y0, x1, y1) {
  x.fillStyle = col; let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, e = dx + dy;
  for (; ;) { x.fillRect(x0, y0, 1, 1); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
}

/* ======================= NHÂN VẬT ======================= */
const UNI = { shirt: '#f6f6f2', pants: '#34425e', badge: '#3b6fb6' };
const LOOKS = {
  boy: { ...UNI, hair: '#2c2733', style: 'short' },
  girl: { ...UNI, hair: '#2c2733', style: 'pony', skirt: true, band: '#e2574c' },
  mom: { hair: '#4a3328', style: 'bun', shirt: '#e98fa5', pants: '#5b4a6b', apron: '#fff1d2' },
  dad: { hair: '#3a3340', style: 'short', shirt: '#dfe7ef', pants: '#3a3f55', tie: '#3b6fb6', mustache: true },
  teacherA: { hair: '#2c2733', style: 'long', shirt: '#9a72d6', aodai: true, shoe: '#f4f0ff' },
  teacherB: { hair: '#3b2a22', style: 'bun', shirt: '#4fa3b8', aodai: true, shoe: '#f0fbff' },
  teacherC: { hair: '#3a3340', style: 'short', shirt: '#c9d8ea', pants: '#3a3f55', tie: '#b23b3b' },
  teacherM: { hair: '#2c2733', style: 'short', shirt: '#d9534f', pants: '#2f3550', stripe: '#ffffff' },
  teacherQ: { hair: '#2c2733', style: 'short', shirt: '#6f8440', pants: '#55662f', cap: '#6f8440' },
  khoa: { ...UNI, hair: '#6b4429', style: 'spiky' },
  vy: { ...UNI, hair: '#3a2a2a', style: 'long', skirt: true, band: '#f2a93b' },
  dat: { ...UNI, hair: '#1f1f29', style: 'buzz', skin: '#e3ae80' },
  ngan: { ...UNI, hair: '#5a3020', style: 'pony', skirt: true, band: '#e98fa5' },
  guard: { hair: '#5a5a66', style: 'short', cap: '#2f4a7a', shirt: '#9cc3e6', pants: '#2f3e63', mustache: true },
  giamthi: { hair: '#3a3340', style: 'short', shirt: '#fbf7ee', pants: '#2f3550', tie: '#2a2136', mustache: true, skin: '#eab98c' },
  driver: { hair: '#3a3340', style: 'short', cap: '#3f9a6b', shirt: '#dfe7ef', pants: '#3a3f55' },
  clerk: { hair: '#3b2a22', style: 'bun', cap: '#b23b3b', shirt: '#3b6fb6', pants: '#2f3550' },
  doctor: { hair: '#3b2a22', style: 'bun', shirt: '#fbfdff', pants: '#9fd6c4', aodai: true, shoe: '#fbfdff' },
  x1: { ...UNI, hair: '#3b2a22', style: 'spiky', skin: '#eab98c' }, x2: { ...UNI, hair: '#2c2733', style: 'pony', skirt: true, band: '#f2a93b' },
  x3: { ...UNI, hair: '#1f1f29', style: 'short' }, x4: { ...UNI, hair: '#5a3020', style: 'long', skirt: true, band: '#5fb0e8' },
  sA: { ...UNI, hair: '#1f1f29', style: 'spiky', badge: '#d9534f', pants: '#2b3550' }, sB: { ...UNI, hair: '#3a2a2a', style: 'long', skirt: true, band: '#7a5fc9', badge: '#d9534f' },
  sC: { ...UNI, hair: '#5a3a26', style: 'short', badge: '#2e9e86', skin: '#e3ae80' }, sD: { ...UNI, hair: '#2c2733', style: 'bun', skirt: true, badge: '#2e9e86' },
  // thêm anh chị khoá trên (phù hiệu đỏ: khối 12 · xanh: khối 11) ngồi ở các lớp tầng 2
  sE: { ...UNI, hair: '#2a2136', style: 'buzz', badge: '#d9534f', skin: '#eab98c' }, sF: { ...UNI, hair: '#4a3324', style: 'long', skirt: true, badge: '#d9534f', band: '#e98fa5' },
  sG: { ...UNI, hair: '#1f1f29', style: 'short', badge: '#2e9e86', glasses: true }, sH: { ...UNI, hair: '#5b3d27', style: 'bun', skirt: true, badge: '#2e9e86', skin: '#e3ae80' },
  principal: { hair: '#c9ccd4', style: 'short', shirt: '#3a3f55', pants: '#2a2136', tie: '#d9534f', mustache: true, skin: '#eab98c' },
  mayor: { hair: '#5f656f', style: 'short', shirt: '#24406b', pants: '#1f2a44', tie: '#e8b83a', mustache: true, skin: '#e8b48a' },
  monk: { hair: '#f2c9a0', style: 'buzz', shirt: '#d98a2b', pants: '#b8701f', aodai: true, shoe: '#6f472c' },
  vendor: { hair: '#4a3328', style: 'bun', shirt: '#f2a93b', pants: '#5b4a6b', apron: '#ffffff' },
  c1: { ...UNI, hair: '#3b2a22', style: 'short' },
  c2: { ...UNI, hair: '#2c2733', style: 'long', skirt: true },
  c3: { ...UNI, hair: '#5a3a26', style: 'buzz', skin: '#eab98c' },
  c4: { ...UNI, hair: '#2c2733', style: 'pony', skirt: true, band: '#5fb0e8' },
  c5: { ...UNI, hair: '#1f1f29', style: 'spiky' },
  c6: { ...UNI, hair: '#4a3328', style: 'long', skirt: true, band: '#e98fa5' },
  c7: { ...UNI, hair: '#2c2733', style: 'short', skin: '#e3ae80' },
  c8: { ...UNI, hair: '#3a2a2a', style: 'pony', skirt: true, band: '#8fd067' },
};
// Trang phục thay theo tiết học
const OUTFITS = {
  td: { shirt: '#4d86de', pants: '#2b3a66', stripe: '#ffffff', skirt: false, badge: null },
  qp: { shirt: '#6f8440', pants: '#55662f', cap: '#6f8440', skirt: false, badge: null, band: null },
  casual: { shirt: '#4fb3a6', pants: '#3a3f55', badge: null },      // ngày nghỉ
  noapron: { apron: null },                                          // mẹ ra đường
  dadhome: { shirt: '#7fa07a', tie: null },                          // bố ở nhà ngày nghỉ
  cas_khoa: { shirt: '#f2a93b', pants: '#3a4a6b', badge: null },
  cas_vy: { shirt: '#e98fa5', pants: '#5b4a6b', badge: null },
  cas_dat: { shirt: '#5fae4a', pants: '#2f3550', badge: null },
  cas_ngan: { shirt: '#c9a0f0', pants: '#5b4a6b', badge: null },
};
const HEADROWS = [[4, 11], [2, 13], [1, 14], [1, 14], [1, 14], [1, 14], [1, 14], [1, 14], [1, 14], [1, 14], [2, 13], [4, 11]];

function drawCharFrame(L, dir, fr) {
  const c = mk(16, 22), x = cx(c), Y = 2;
  const sk = L.skin || '#f8d0a8', skS = shade(sk, -16);
  const hr = L.hair || '#2c2733', hrS = shade(hr, -30), hrL = shade(hr, 22);
  const sh = L.shirt || '#f6f6f2', shS = shade(sh, -13);
  const pt = L.pants || '#34425e', shoe = L.shoe || '#2e2738', st = L.style || 'short';
  const headFill = (col, from, to) => { for (let i = from; i < to; i++) { const [a, b] = HEADROWS[i]; R(x, col, a, Y + i, b - a + 1, 1); } };
  if (dir !== 1) {
    /* ----- nhìn xuống (0) / nhìn lên (3) ----- */
    for (const [lx, up] of [[5, fr === 1], [9, fr === 2]]) {
      if (L.aodai) { if (!up) R(x, shoe, lx, 21, 2, 1); }
      else if (L.skirt) { if (up) R(x, shoe, lx, 20, 2, 1); else { R(x, sk, lx, 20, 2, 1); R(x, shoe, lx, 21, 2, 1); } }
      else { R(x, pt, lx, 19, 2, up ? 1 : 2); R(x, shoe, lx, up ? 20 : 21, 2, 1); }
    }
    const bh = L.aodai ? 7 : 4;
    R(x, sh, 4, 14, 8, bh); R(x, shS, 11, 14, 1, bh);
    if (L.aodai) { R(x, sh, 3, 19, 10, 2); R(x, shS, 12, 19, 1, 2); R(x, shS, 7, 19, 2, 2); }
    else if (L.skirt) { R(x, pt, 4, 18, 8, 1); R(x, pt, 3, 19, 10, 1); }
    else R(x, pt, 4, 18, 8, 1);
    const arm = (ax, short) => { const len = short ? 3 : 4, sl = L.long ? len : L.aodai ? len - 1 : 2; R(x, shS, ax, 14, 1, sl); R(x, sk, ax, 14 + sl, 1, len - sl); };
    arm(3, fr === 1); arm(12, fr === 2);
    if (L.stripe) { R(x, L.stripe, 4, 14, 1, 4); R(x, L.stripe, 11, 14, 1, 4); }
    if (L.puffer) { R(x, shade(sh, -12), 4, 16, 8, 1); }
    if (dir === 0) {
      R(x, L.collar || sk, 7, 14, 2, 1);
      if (L.zip) { R(x, L.collar, 6, 14, 4, 1); R(x, shade(sh, -32), 8, 15, 1, 3); }
      if (L.scarf) { R(x, L.scarf, 5, 14, 6, 1); R(x, shade(L.scarf, -20), 9, 15, 2, 2); }
      if (L.tie && !L.zip) R(x, L.tie, 7, 15, 2, 2);
      if (L.badge) R(x, L.badge, 9, 15, 1, 1);
      if (L.apron) { R(x, L.apron, 5, 15, 6, 4); R(x, shade(L.apron, -14), 5, 18, 6, 1); }
    }
    headFill(sk, 0, 12);
    if (dir === 0) {
      headFill(hr, 0, st === 'buzz' ? 4 : 5);
      if (st === 'short') { R(x, hr, 1, Y + 5, 3, 1); R(x, hr, 12, Y + 5, 3, 1); R(x, hr, 6, Y + 5, 3, 1); R(x, hr, 1, Y + 6, 1, 1); R(x, hr, 14, Y + 6, 1, 1); }
      else if (st === 'spiky') { [1, 2, 4, 5, 8, 9, 12, 13, 14].forEach(i => R(x, hr, i, Y + 5, 1, 1)); R(x, hr, 1, Y + 6, 1, 1); R(x, hr, 14, Y + 6, 1, 1); }
      else if (st === 'buzz') { R(x, hr, 1, Y + 4, 2, 1); R(x, hr, 13, Y + 4, 2, 1); }
      else {
        R(x, hr, 1, Y + 5, 6, 1); R(x, hr, 9, Y + 5, 6, 1); R(x, hr, 1, Y + 6, 2, 1); R(x, hr, 13, Y + 6, 2, 1);
        if (st === 'long') { R(x, hr, 1, Y + 7, 1, 3); R(x, hr, 14, Y + 7, 1, 3); R(x, hrS, 2, 13, 2, 3); R(x, hrS, 12, 13, 2, 3); }
        if (st === 'pony') { R(x, hr, 14, Y + 8, 2, 4); R(x, hrS, 15, Y + 8, 1, 4); R(x, L.band || hrL, 14, Y + 7, 1, 1); }
      }
      R(x, hrL, 4, Y + 1, 4, 1); R(x, hrL, 3, Y + 2, 2, 1);
      if (L.band && st === 'long') R(x, L.band, 2, Y + 3, 12, 1);
      R(x, OUT, 4, Y + 7, 2, 2); R(x, OUT, 10, Y + 7, 2, 2);
      R(x, '#f5a79b', 3, Y + 9, 2, 1); R(x, '#f5a79b', 11, Y + 9, 2, 1);
      R(x, skS, 7, Y + 10, 2, 1);
      if (L.mustache) R(x, '#5a5a66', 6, Y + 9, 4, 1);
    } else {
      const rows = st === 'buzz' ? 9 : 11;
      headFill(hr, 0, rows - 3); headFill(hrS, rows - 3, rows);
      R(x, hrL, 4, Y + 1, 4, 1);
      if (st === 'long') { R(x, hr, 3, 13, 10, 3); R(x, hrS, 3, 16, 10, 1); if (L.band) R(x, L.band, 2, Y + 3, 12, 1); }
      if (st === 'pony') { R(x, L.band || hrL, 7, Y + 9, 2, 1); R(x, hr, 7, Y + 10, 2, 7); R(x, hrS, 8, Y + 10, 1, 7); }
    }
    if (st === 'bun') { R(x, hr, 6, 0, 4, 1); R(x, hr, 5, 1, 6, 2); R(x, hrL, 6, 1, 2, 1); }
    if (L.cap) {
      const cp = L.cap, cpS = shade(cp, -28);
      R(x, cp, 4, Y - 1, 8, 1); headFill(cp, 0, 4); R(x, shade(cp, 25), 5, Y, 3, 1);
      if (dir === 0) R(x, cpS, 0, Y + 4, 16, 1); else R(x, cpS, 1, Y + 4, 14, 1);
    }
  } else {
    /* ----- nhìn sang trái (phải = lật ngang) ----- */
    if (L.aodai) R(x, shoe, 5, 21, 5, 1);
    else if (L.skirt) { if (fr) { R(x, sk, 5, 20, 2, 1); R(x, sk, 9, 20, 2, 1); R(x, shoe, 4, 21, 3, 1); R(x, shoe, 9, 21, 3, 1); } else { R(x, sk, 6, 20, 4, 1); R(x, shoe, 5, 21, 5, 1); } }
    else if (fr) { R(x, pt, 4, 19, 3, 2); R(x, pt, 9, 19, 3, 2); R(x, shoe, 3, 21, 4, 1); R(x, shoe, 9, 21, 4, 1); }
    else { R(x, pt, 6, 19, 4, 2); R(x, shoe, 5, 21, 5, 1); }
    const bh = L.aodai ? 7 : 4;
    R(x, sh, 5, 14, 6, bh); R(x, shS, 10, 14, 1, bh);
    if (L.aodai) R(x, sh, 4, 19, 8, 2);
    else if (L.skirt) { R(x, pt, 5, 18, 6, 1); R(x, pt, 4, 19, 8, 1); }
    else R(x, pt, 5, 18, 6, 1);
    if (L.stripe) R(x, L.stripe, 5, 14, 1, 4);
    if (L.apron) R(x, L.apron, 5, 15, 2, 4);
    if (L.puffer) R(x, shade(sh, -12), 5, 16, 6, 1);
    if (L.scarf) R(x, L.scarf, 5, 14, 5, 1);
    const ax = fr ? 6 : 7, sl = L.long ? 4 : L.aodai ? 3 : 2;
    R(x, shS, ax, 14, 2, sl); R(x, sk, ax, 14 + sl, 2, 4 - sl);
    headFill(sk, 0, 12);
    headFill(hr, 0, st === 'buzz' ? 4 : 5);
    if (st === 'buzz') R(x, hr, 10, Y + 4, 5, 4);
    else { R(x, hr, 9, Y + 5, 6, 5); R(x, hrS, 10, Y + 10, 4, 1); R(x, hr, 1, Y + 5, 5, 1); }
    if (st === 'long') { R(x, hr, 9, Y + 5, 6, 6); R(x, hr, 10, Y + 11, 4, 1); R(x, hrS, 10, 14, 3, 3); R(x, hr, 1, Y + 6, 2, 1); if (L.band) R(x, L.band, 2, Y + 3, 12, 1); }
    if (st === 'pony') { R(x, L.band || hrL, 14, Y + 6, 1, 2); R(x, hr, 14, Y + 7, 2, 5); R(x, hrS, 15, Y + 8, 1, 4); R(x, hr, 1, Y + 6, 2, 1); }
    if (st === 'bun') { R(x, hr, 8, 0, 4, 1); R(x, hr, 7, 1, 6, 2); R(x, hr, 1, Y + 6, 1, 1); }
    R(x, hrL, 4, Y + 1, 4, 1);
    R(x, OUT, 3, Y + 7, 2, 2); R(x, '#f5a79b', 2, Y + 9, 2, 1); R(x, skS, 8, Y + 7, 1, 2);
    if (L.mustache) R(x, '#5a5a66', 2, Y + 9, 3, 1);
    if (L.cap) { const cp = L.cap; R(x, cp, 4, Y - 1, 8, 1); headFill(cp, 0, 4); R(x, shade(cp, -28), 0, Y + 4, 9, 1); R(x, shade(cp, 25), 5, Y, 3, 1); }
  }
  return outline(c);
}
function flipH(src) { const c = mk(src.width, src.height), x = cx(c); x.translate(src.width, 0); x.scale(-1, 1); x.drawImage(src, 0, 0); return c; }
const SHEETS = {};
// Mùa đông: đồng phục khoác thêm áo khoác đồng phục xanh than, quần áo thường thành áo phao dài tay (con gái quàng khăn), người lớn mặc dài tay
const isWinter = () => typeof G !== 'undefined' && !!G && cal(G.day).season === 1;
function winterize(L, outfit) {
  if (outfit === 'td' || outfit === 'qp' || L.aodai) return { ...L, long: true };
  if (!outfit && L.shirt === UNI.shirt) return { ...L, shirt: '#2f4a7a', long: true, collar: '#f6f6f2', zip: true };
  if (outfit && /^cas/.test(outfit)) return { ...L, long: true, puffer: true, scarf: L.skirt ? '#e2574c' : null };
  return { ...L, long: true };
}
function charSheet(key, outfit) {
  const w = isWinter(), id = key + (outfit ? ':' + outfit : '') + (w ? ':w' : '');
  if (SHEETS[id]) return SHEETS[id];
  let L = LOOKS[key] || LOOKS.boy;
  if (outfit && OUTFITS[outfit]) L = { ...L, ...OUTFITS[outfit] };
  if (w) L = winterize(L, outfit);
  const left = [drawCharFrame(L, 1, 0), drawCharFrame(L, 1, 1)];
  const s = {
    0: [0, 1, 2].map(f => drawCharFrame(L, 0, f)),
    3: [0, 1, 2].map(f => drawCharFrame(L, 3, f)),
    1: left, 2: left.map(flipH),
  };
  return (SHEETS[id] = s);
}
function charFrame(sheet, dir, walkT) {
  if (walkT < 0) return sheet[dir][0];
  const k = Math.floor(walkT * 8) % 4;
  if (dir === 1 || dir === 2) return sheet[dir][k % 2 ? 1 : 0];
  return sheet[dir][[0, 1, 0, 2][k]];
}
const SHADOW = (() => { const c = mk(14, 5), x = cx(c); x.fillStyle = 'rgba(30,20,50,0.28)'; x.fillRect(2, 0, 10, 1); x.fillRect(0, 1, 14, 3); x.fillRect(2, 4, 10, 1); return c; })();

/* ======================= VẬT THỂ ======================= */
const SPR = {};
function def(name, w, h, fn, noOutline) { const c = mk(w, h); fn(cx(c), w, h); SPR[name] = noOutline ? c : outline(c); return SPR[name]; }

function drawWin(x, a, b, w, h, shutter) {
  R(x, '#fffaf0', a, b, w, h); R(x, '#8fc1e3', a + 1, b + 1, w - 2, h - 2); R(x, '#b9dcf2', a + 1, b + 1, w - 2, 2);
  line(x, '#cfe8f7', a + 2, b + h - 3, a + Math.min(w, h) - 3, b + 2);
  R(x, '#fffaf0', a + (w >> 1), b, 1, h); R(x, '#fffaf0', a, b + (h >> 1), w, 1);
  R(x, '#d9d0bd', a, b + h, w, 1);
  if (shutter) { R(x, shutter, a - 3, b, 3, h); R(x, shutter, a + w, b, 3, h); R(x, shade(shutter, -20), a - 3, b + 3, 3, 1); R(x, shade(shutter, -20), a - 3, b + 7, 3, 1); R(x, shade(shutter, -20), a + w, b + 3, 3, 1); R(x, shade(shutter, -20), a + w, b + 7, 3, 1); }
}
function drawDoor(x, a, b, w, h, col) {
  R(x, shade(col, -30), a - 1, b - 1, w + 2, h + 1); R(x, col, a, b, w, h); R(x, shade(col, 16), a + 1, b + 1, w - 2, 1);
  R(x, shade(col, -16), a + 2, b + 3, w - 4, (h >> 1) - 4); R(x, shade(col, -16), a + 2, b + (h >> 1) + 1, w - 4, (h >> 1) - 4);
  R(x, '#f4d35e', a + w - 3, b + (h >> 1), 1, 2);
}

function buildSprites() {
  /* ---------- cây cối ---------- */
  const tree = (name, leaf, flower, seed, nf) => def(name, 34, 46, x => {
    const r = rng(seed), d = shade(leaf, -24), l = shade(leaf, 20);
    R(x, '#8b5e3c', 14, 29, 6, 16); R(x, '#6f472c', 18, 29, 2, 16); R(x, '#a37248', 14, 31, 1, 12); R(x, '#6f472c', 12, 44, 10, 2);
    for (let py = 0; py < 34; py++) for (let px = 0; px < 34; px++) {
      const dx = px - 16.5, dy = py - 16.5, ang = Math.atan2(dy, dx), rr = 1 + 0.07 * Math.sin(ang * 7 + seed);
      if ((dx * dx) / (15.5 * 15.5) + (dy * dy) / (15 * 15) > rr * rr * 0.98) continue;
      const v = dx * 0.55 + dy; let col = v > 8 ? d : (v < -11 ? l : leaf);
      const q = r(); if (q < 0.07) col = d; else if (q < 0.13) col = l;
      R(x, col, px, py);
    }
    if (flower) for (let i = 0; i < (nf || 26); i++) { const a = r() * 6.28, rad = r() * 13, fx = Math.round(16.5 + Math.cos(a) * rad), fy = Math.round(15 + Math.sin(a) * rad * 0.9); R(x, flower, fx, fy, 2, 1); R(x, shade(flower, 30), fx, fy - 1, 1, 1); }
  });
  tree('tree', '#5fae4a', null, 3); tree('tree2', '#4c9f58', null, 9);
  tree('treePink', '#f3a6c0', '#ffd6e4', 5); tree('treeOrange', '#e98a3c', '#f6c35a', 4);
  tree('treeMai', '#6aa848', '#ffd23a', 11);                       // cây mai vàng ngày Tết
  // cây theo mùa (Hà Nội): xuân đào hồng, lộc non, hoa sưa · hè phượng đỏ, bàng vàng · thu hoa sữa · đông bàng lá đỏ
  tree('sp_dao', '#f3a6c0', '#ffe3ec', 13, 34); tree('sp_loc', '#9fd46a', '#e2f5b0', 15, 20); tree('sp_sua', '#86c46a', '#fbfbf2', 17, 46);
  tree('su_bang', '#e8c547', '#f6e08a', 21, 18);
  // phượng vĩ: thân thấp chia nhánh, tán xoè rộng như chiếc ô, lá lông chim li ti, chùm hoa đỏ cam phủ kín mặt tán
  const phuong = (name, nFlower, seed) => def(name, 34, 46, x => {
    const r = rng(seed);
    // thân thấp, chia nhiều nhánh toả ra đỡ lấy tán
    R(x, '#8b5e3c', 15, 29, 5, 16); R(x, '#6f472c', 18, 29, 2, 16); R(x, '#a37248', 15, 31, 1, 12); R(x, '#6f472c', 10, 44, 15, 2); R(x, '#8b5e3c', 13, 43, 2, 2); R(x, '#8b5e3c', 20, 43, 2, 2);
    for (const [tx, ty] of [[4, 18], [30, 18], [11, 19], [23, 19], [17, 17]]) { line(x, '#6f472c', 17, 30, tx, ty); line(x, '#8b5e3c', 17, 29, tx, ty - 1); }
    // tán dẹt xoè như chiếc ô: mặt trên sáng, mép dưới tối, lá lông chim li ti
    const inside = (px, py) => { const dx = px - 16.5, dy = py - 11, ang = Math.atan2(dy, dx), e = 1 + 0.07 * Math.sin(ang * 11 + seed) + (dy > 2 ? 0.06 * Math.sin(px * 1.9 + seed) : 0); return (dx * dx) / (16.5 * 16.5) + (dy * dy) / (dy > 0 ? 8.5 * 8.5 : 9 * 9) <= e * e; };
    for (let py = 1; py < 21; py++) for (let px = 0; px < 34; px++) {
      if (!inside(px, py)) continue;
      const dy = py - 11, q = r();
      let col = dy > 4 ? '#3a7f36' : dy < -4 ? '#74bc54' : '#5aa548';
      if (q < 0.18) col = dy > 4 ? '#46923e' : '#8ccd62'; else if (q < 0.3) col = '#4a983f';
      R(x, col, px, py);
    }
    // hoa phượng: từng mảng đỏ cam phủ trên mặt tán (nhiều ở nửa trên)
    for (let i = 0; i < nFlower; i++) {
      const fx = 3 + r() * 28, fy = 2 + Math.pow(r(), 1.4) * 12; if (!inside(Math.round(fx), Math.round(fy))) continue;
      const rx = 1.4 + r() * 1.6, ry = 1 + r() * 0.8;
      ell(x, '#d93a30', fx, fy + 0.5, rx, ry); ell(x, '#f0503c', fx - 0.3, fy, rx - 0.4, ry - 0.3);
      R(x, '#ff9a52', Math.round(fx - rx / 2), Math.round(fy - ry / 2), 1, 1); R(x, '#a82a24', Math.round(fx + rx / 2), Math.round(fy + ry / 2), 1, 1);
    }
  });
  phuong('su_phuong', 30, 19); phuong('treeRed', 12, 7);

  // hoa sữa: tán xếp tầng như chiếc ô, chùm hoa trắng kem mọc thành cụm trên đỉnh mỗi tầng lá
  def('au_sua', 34, 46, x => {
    R(x, '#8b5e3c', 15, 12, 4, 33); R(x, '#6f472c', 18, 12, 1, 33); R(x, '#a37248', 15, 14, 1, 28); R(x, '#6f472c', 12, 44, 10, 2);
    line(x, '#6f472c', 16, 23, 9, 19); line(x, '#6f472c', 18, 23, 25, 19); line(x, '#6f472c', 16, 33, 7, 29); line(x, '#6f472c', 18, 33, 27, 29);
    const tier = (cy, rx, ry) => { ell(x, '#3b7340', 17, cy + 1, rx, ry); ell(x, '#4f8f4a', 17, cy, rx - 0.5, ry - 0.8); ell(x, '#6aa85a', 17, cy - 1.5, rx - 3, ry - 2.6); };
    tier(31, 16, 5); tier(20, 12.5, 4.6); tier(9, 8.5, 4.2);
    const cluster = (cx2, cy2, r) => { ell(x, '#d8d1a2', cx2, cy2 + 0.6, r, r * 0.8); ell(x, '#f6f2d8', cx2, cy2, r - 0.3, r * 0.75); R(x, '#fffdf2', Math.round(cx2 - r / 2), Math.round(cy2 - r / 2), 2, 1); R(x, '#cfd98f', Math.round(cx2 + 0.5), Math.round(cy2), 1, 1); };
    for (const [a, b, r] of [[12, 6, 2.4], [20, 5, 2.6], [16, 8, 2], [7, 17, 2.4], [14, 16, 2.6], [21, 16, 2.4], [27, 18, 2.2], [4, 28, 2.4], [11, 27, 2.6], [18, 27, 2.4], [25, 27, 2.6], [30, 29, 2]]) cluster(a, b, r);
  });
  tree('wi_bang', '#c8483a', '#e8833a', 25, 30); tree('wi_bang2', '#b8402f', '#d9534f', 27, 22);
  tree('treeQuat', '#3f8f3a', '#f2a93b', 29, 44);                  // cây quất lớn ngày Tết
  def('bush', 20, 13, x => { ell(x, '#5fae4a', 9.5, 7, 9.5, 5.5); ell(x, '#7cc75f', 6, 5, 4, 2.5); ell(x, '#4a9340', 13, 9, 5, 2.5); R(x, '#ff8fa8', 4, 4, 1, 1); R(x, '#ffd84d', 12, 3, 1, 1); R(x, '#fff', 15, 6, 1, 1); });
  def('hedge', 16, 14, x => { R(x, '#4f9d48', 0, 2, 16, 12); R(x, '#69b85a', 0, 0, 16, 4); R(x, '#69b85a', 2, 4, 3, 1); R(x, '#69b85a', 9, 5, 4, 1); R(x, '#3f8a3e', 0, 11, 16, 3); R(x, '#3f8a3e', 5, 8, 2, 1); R(x, '#3f8a3e', 12, 9, 2, 1); });
  def('fence', 16, 14, x => { for (let i = 0; i < 3; i++) { const a = 1 + i * 5; R(x, '#fbf7ee', a, 1, 3, 13); R(x, '#fbf7ee', a + 1, 0, 1, 1); R(x, '#d8d2c2', a + 2, 2, 1, 12); } R(x, '#ece6d6', 0, 4, 16, 2); R(x, '#ece6d6', 0, 9, 16, 2); R(x, '#cfc8b6', 0, 5, 16, 1); R(x, '#cfc8b6', 0, 10, 16, 1); });
  def('wallseg', 16, 20, x => { R(x, '#f4d273', 0, 4, 16, 16); R(x, '#fff3c4', 0, 2, 16, 3); R(x, '#c8583f', 0, 0, 16, 2); R(x, '#e2bb57', 0, 16, 16, 4); R(x, '#e2bb57', 7, 6, 2, 9); R(x, '#e9c564', 0, 9, 16, 1); });
  def('weeds', 36, 15, x => { const r = rng(21); for (let i = 0; i < 11; i++) { const a = 1 + i * 3 + (r() * 2 | 0), h = 6 + (r() * 7 | 0), col = ['#4c9a3c', '#6fbd4f', '#3f8436'][i % 3]; R(x, col, a, 15 - h, 1, h); R(x, col, a + 1, 15 - h + 2, 1, h - 2); R(x, col, a - 1, 15 - h + 3, 1, h - 3); if (r() < 0.4) R(x, '#ffe066', a, 14 - h, 2, 1); } });

  /* ---------- nhà cửa ---------- */
  const house = (name, wall, roof, door, shut) => def(name, 96, 80, x => {
    const rS = shade(roof, -22), wS = shade(wall, -12);
    R(x, roof, 0, 4, 96, 24); R(x, shade(roof, 20), 0, 4, 96, 2); R(x, rS, 0, 25, 96, 3);
    for (let j = 0; j < 3; j++) for (let i = 0; i < 12; i++) R(x, rS, i * 8 + (j % 2 ? 4 : 0), 8 + j * 6, 1, 5);
    for (let j = 1; j < 3; j++) R(x, rS, 0, 7 + j * 6, 96, 1);
    R(x, shade(roof, -10), 40, 0, 16, 6); R(x, rS, 40, 5, 16, 1);
    R(x, wall, 4, 28, 88, 52); R(x, wS, 4, 28, 88, 2); R(x, wS, 4, 74, 88, 6); R(x, shade(wall, 12), 4, 30, 88, 1);
    drawDoor(x, 41, 52, 14, 28, door);
    R(x, '#cfc8b8', 37, 78, 22, 2);
    drawWin(x, 13, 40, 16, 16, shut); drawWin(x, 67, 40, 16, 16, shut);
    R(x, '#8b5e3c', 11, 58, 20, 3); R(x, '#8b5e3c', 65, 58, 20, 3);
    for (let i = 0; i < 5; i++) { R(x, '#5fae4a', 12 + i * 4, 56, 3, 2); R(x, i % 2 ? '#ff8fa8' : '#ffd84d', 13 + i * 4, 55, 1, 1); R(x, '#5fae4a', 66 + i * 4, 56, 3, 2); R(x, i % 2 ? '#ffd84d' : '#ff8fa8', 67 + i * 4, 55, 1, 1); }
    R(x, '#fff3c8', 58, 60, 6, 5); R(x, '#3b6fb6', 59, 61, 4, 3);
  });
  house('house', '#f6e6c2', '#cc5b40', '#8a5a3a', '#4f9a6b');
  house('houseB', '#d9e8f2', '#4f6f9c', '#6b4a36', '#e98fa5');
  house('houseC', '#f4d9c9', '#7a8f5a', '#7a4f33', '#f2a93b');
  house('houseD', '#e7dcf2', '#8a5fa8', '#6b4a36', '#5fb0e0');
  house('houseE', '#fde3ea', '#d9695f', '#7a4f33', '#8fd067');
  def('shop', 96, 76, x => {
    R(x, '#b7ddd0', 2, 6, 92, 70); R(x, '#9cc9ba', 2, 70, 92, 6); R(x, '#8b8f9c', 0, 2, 96, 5); R(x, '#a9adb9', 0, 2, 96, 2);
    R(x, '#2a2136', 5, 7, 86, 15); R(x, '#f4c64e', 6, 8, 84, 13); R(x, '#ffe08a', 6, 8, 84, 2);
    for (let i = 0; i < 12; i++) { R(x, i % 2 ? '#fbf7ee' : '#e2574c', i * 8, 24, 8, 10); R(x, i % 2 ? '#e3ddd0' : '#c2453b', i * 8, 32, 8, 2); R(x, i % 2 ? '#fbf7ee' : '#e2574c', i * 8 + 1, 34, 6, 2); }
    R(x, '#5c6f7c', 8, 40, 46, 26); R(x, '#9cc7dd', 9, 41, 44, 24);
    R(x, '#8b5e3c', 9, 49, 44, 2); R(x, '#8b5e3c', 9, 58, 44, 2);
    const cols = ['#e2574c', '#f2a93b', '#5fae4a', '#3b82c4', '#e98fa5', '#fff', '#7a5fc9', '#f4d35e'];
    for (let j = 0; j < 3; j++) for (let i = 0; i < 10; i++) R(x, cols[(i * 3 + j * 5) % 8], 10 + i * 4 + (j % 2), 43 + j * 9 + (i % 2), 3, 5 - (i % 2));
    drawDoor(x, 64, 44, 18, 32, '#7a5a44'); R(x, '#9cc7dd', 67, 48, 12, 12); R(x, '#cfe8f7', 67, 48, 12, 2);
    R(x, '#c98f5a', 8, 68, 20, 8); R(x, '#f2a93b', 10, 67, 3, 2); R(x, '#f2a93b', 14, 67, 3, 2); R(x, '#e2574c', 18, 67, 3, 2); R(x, '#5fae4a', 22, 67, 3, 2);
    R(x, '#c98f5a', 32, 68, 20, 8); R(x, '#5fae4a', 34, 67, 4, 2); R(x, '#8fd067', 39, 67, 4, 2); R(x, '#e2574c', 44, 67, 4, 2);
  });
  def('center', 96, 76, x => {
    R(x, '#dfe9f5', 2, 6, 92, 70); R(x, '#c3d3e6', 2, 70, 92, 6); R(x, '#7b8499', 0, 2, 96, 5); R(x, '#99a2b6', 0, 2, 96, 2);
    R(x, '#2a2136', 5, 8, 86, 15); R(x, '#3b6fb6', 6, 9, 84, 13); R(x, '#5a8fd6', 6, 9, 84, 2);
    drawWin(x, 10, 30, 18, 16); drawWin(x, 39, 30, 18, 16); drawWin(x, 68, 30, 18, 16);
    drawDoor(x, 39, 50, 18, 26, '#4f6f9c'); R(x, '#9cc7dd', 42, 53, 12, 10);
    R(x, '#3f7d5c', 10, 52, 22, 16); R(x, '#2f5f46', 10, 52, 22, 1); R(x, '#fff', 13, 56, 10, 1); R(x, '#fff', 13, 59, 14, 1); R(x, '#fff', 13, 62, 8, 1); R(x, '#8b5e3c', 9, 68, 24, 2);
    R(x, '#fffaf0', 64, 52, 22, 16); R(x, '#e2574c', 66, 54, 18, 3); R(x, '#5f656f', 66, 59, 14, 1); R(x, '#5f656f', 66, 62, 16, 1); R(x, '#5f656f', 66, 65, 10, 1);
  });
  def('busshelter', 44, 36, x => {
    R(x, '#3b6fb6', 0, 0, 44, 7); R(x, '#5a8fd6', 0, 0, 44, 2); R(x, '#2f5a94', 0, 6, 44, 2);
    R(x, '#8b8f9c', 3, 8, 2, 28); R(x, '#8b8f9c', 39, 8, 2, 28);
    x.fillStyle = 'rgba(190,225,245,0.55)'; x.fillRect(5, 9, 34, 15);
    R(x, '#fffaf0', 14, 11, 16, 9); R(x, '#e2574c', 15, 12, 14, 2); R(x, '#5f656f', 15, 15, 10, 1); R(x, '#5f656f', 15, 17, 12, 1);
    R(x, '#c98f5a', 6, 25, 32, 4); R(x, '#a8713f', 6, 28, 32, 2); R(x, '#8b8f9c', 8, 30, 2, 5); R(x, '#8b8f9c', 34, 30, 2, 5);
  });
  def('bussign', 12, 30, x => { R(x, '#8b8f9c', 5, 10, 2, 20); ell(x, '#3b6fb6', 5.5, 5.5, 5.5, 5.5); R(x, '#fff', 3, 3, 6, 5); R(x, '#3b6fb6', 4, 4, 4, 2); R(x, '#2a2136', 3, 8, 2, 1); R(x, '#2a2136', 7, 8, 2, 1); });
  def('lamp', 10, 42, x => { R(x, '#5f656f', 4, 8, 2, 34); R(x, '#4a4f5a', 3, 38, 4, 4); R(x, '#5f656f', 1, 4, 8, 4); R(x, '#ffe9a0', 2, 5, 6, 3); R(x, '#4a4f5a', 2, 2, 6, 2); R(x, '#4a4f5a', 4, 0, 2, 2); });
  def('signpost', 26, 28, x => { R(x, '#8b5e3c', 12, 10, 2, 18); R(x, '#6f472c', 13, 10, 1, 18); R(x, '#3f7d5c', 0, 1, 26, 10); R(x, '#4f9a6b', 0, 1, 26, 2); R(x, '#fff', 3, 5, 14, 2); R(x, '#fff', 17, 3, 2, 6); R(x, '#fff', 19, 4, 2, 4); R(x, '#fff', 21, 5, 2, 2); });
  SPR.signpostL = flipH(SPR.signpost);
  def('mailbox', 10, 18, x => { R(x, '#8b5e3c', 4, 8, 2, 10); R(x, '#e2574c', 0, 0, 10, 8); R(x, '#f07a6f', 0, 0, 10, 2); R(x, '#fff', 2, 4, 6, 1); });
  def('bench', 28, 14, x => { R(x, '#c98f5a', 0, 0, 28, 3); R(x, '#a8713f', 0, 3, 28, 1); R(x, '#c98f5a', 0, 6, 28, 4); R(x, '#dba56e', 0, 6, 28, 1); R(x, '#a8713f', 0, 9, 28, 1); R(x, '#5f656f', 2, 4, 2, 2); R(x, '#5f656f', 24, 4, 2, 2); R(x, '#5f656f', 2, 10, 2, 4); R(x, '#5f656f', 24, 10, 2, 4); });
  def('benchstone', 28, 13, x => { R(x, '#d5d1c8', 0, 0, 28, 7); R(x, '#eceae4', 0, 0, 28, 2); R(x, '#b3aea3', 0, 6, 28, 2); R(x, '#b3aea3', 2, 8, 5, 5); R(x, '#b3aea3', 21, 8, 5, 5); R(x, '#9c978c', 5, 8, 2, 5); R(x, '#9c978c', 24, 8, 2, 5); });
  def('goal', 38, 24, x => { R(x, '#fbf7ee', 0, 0, 38, 2); R(x, '#fbf7ee', 0, 0, 2, 24); R(x, '#fbf7ee', 36, 0, 2, 24); x.fillStyle = 'rgba(255,255,255,0.55)'; for (let i = 4; i < 36; i += 4) x.fillRect(i, 2, 1, 18); for (let j = 5; j < 20; j += 4) x.fillRect(2, j, 34, 1); });
  def('ball', 7, 7, x => { ell(x, '#fbf7ee', 3, 3, 3, 3); R(x, '#2a2136', 3, 1, 1, 1); R(x, '#2a2136', 1, 3, 1, 1); R(x, '#2a2136', 5, 4, 1, 1); R(x, '#2a2136', 3, 5, 1, 1); });

  /* ---------- xe cộ ---------- */
  const scooter = (name, body) => def(name, 30, 20, x => {
    const bs = shade(body, -22);
    ell(x, '#2f2a3a', 6, 15, 4, 4); ell(x, '#8b8f9c', 6, 15, 1.5, 1.5); ell(x, '#2f2a3a', 23, 15, 4, 4); ell(x, '#8b8f9c', 23, 15, 1.5, 1.5);
    R(x, body, 5, 8, 16, 5); R(x, bs, 5, 12, 16, 1); R(x, body, 2, 9, 5, 3); R(x, body, 19, 3, 4, 11); R(x, bs, 22, 3, 1, 11);
    R(x, '#2f2a3a', 6, 6, 11, 2); R(x, '#4a4458', 6, 6, 11, 1); R(x, '#2f2a3a', 18, 1, 7, 1); R(x, '#2f2a3a', 20, 1, 1, 3);
    R(x, '#ffe9a0', 23, 5, 2, 2); R(x, '#e2574c', 1, 9, 1, 2); R(x, '#8b8f9c', 12, 13, 7, 1); R(x, shade(body, 25), 6, 9, 8, 1);
  });
  scooter('moto', '#d9534f'); scooter('moto50', '#3b82c4'); scooter('ebike', '#5fae4a'); scooter('motoMom', '#2e9e86');
  SPR.motoL = flipH(SPR.moto); SPR.motoMomL = flipH(SPR.motoMom);
  def('bike', 26, 17, x => {
    ring(x, '#2f2a3a', 5, 11, 5); ring(x, '#2f2a3a', 20, 11, 5); R(x, '#8b8f9c', 5, 11); R(x, '#8b8f9c', 20, 11);
    line(x, '#3b82c4', 5, 11, 10, 5); line(x, '#3b82c4', 10, 5, 17, 5); line(x, '#3b82c4', 17, 5, 20, 11); line(x, '#3b82c4', 10, 5, 12, 11); line(x, '#3b82c4', 12, 11, 17, 5); line(x, '#3b82c4', 5, 11, 12, 11);
    R(x, '#2f2a3a', 8, 3, 5, 2); R(x, '#2f2a3a', 16, 1, 1, 5); R(x, '#2f2a3a', 15, 1, 4, 1); R(x, '#8b8f9c', 11, 11, 3, 1);
  });

  /* ---------- trường học ---------- */
  def('school', 320, 100, x => {
    const wall = '#f4d273', wallS = '#e2bb57', roof = '#c8583f', roofS = '#a84530', trim = '#fff6d8';
    R(x, roof, 0, 4, 320, 14); R(x, shade(roof, 18), 0, 4, 320, 2); R(x, roofS, 0, 16, 320, 2);
    for (let i = 0; i < 320; i += 8) { R(x, roofS, i, 7, 1, 4); R(x, roofS, i + 4, 11, 1, 5); } R(x, roofS, 0, 10, 320, 1);
    R(x, wall, 2, 18, 316, 82); R(x, wallS, 2, 18, 316, 2); R(x, trim, 2, 55, 316, 3); R(x, wallS, 2, 58, 316, 1); R(x, '#b9b2a6', 2, 95, 316, 5);
    for (let i = 0; i < 10; i++) { if (i >= 3 && i <= 6) continue; const wx = 13 + i * 31; drawWin(x, wx, 29, 16, 18, '#4f9a6b'); }
    for (let i = 0; i < 10; i++) {
      if (i >= 3 && i <= 6) continue; const wx = 13 + i * 31;
      if (i === 1 || i === 8) { drawDoor(x, wx + 1, 68, 14, 27, '#3f7d5c'); R(x, '#fffaf0', wx, 61, 16, 6); R(x, '#5f656f', wx, 66, 16, 1); }
      else drawWin(x, wx, 66, 16, 18, '#4f9a6b');
    }
    for (let i = 0; i <= 10; i++) { if (i >= 4 && i <= 6) continue; const p = 5 + i * 31; R(x, trim, p, 59, 3, 36); R(x, wallS, p + 2, 59, 1, 36); }
    // khối giữa
    R(x, roof, 108, 0, 104, 10); R(x, shade(roof, 18), 108, 0, 104, 2); R(x, roofS, 108, 8, 104, 2);
    R(x, trim, 112, 10, 96, 90); R(x, wall, 115, 13, 90, 87); R(x, '#b9b2a6', 112, 95, 96, 5);
    R(x, '#2a2136', 119, 18, 82, 17); R(x, '#2f5d8a', 120, 19, 80, 15); R(x, '#4a7fb5', 120, 19, 80, 2);
    R(x, '#da251d', 152, 38, 16, 11); R(x, '#ffde59', 159, 41, 2, 5); R(x, '#ffde59', 157, 43, 6, 1); R(x, '#ffde59', 158, 45, 1, 1); R(x, '#ffde59', 161, 45, 1, 1);
    R(x, '#5b4636', 142, 60, 36, 40); R(x, '#7a5f48', 144, 62, 15, 38); R(x, '#7a5f48', 161, 62, 15, 38); R(x, '#f4d35e', 157, 80, 1, 3); R(x, '#f4d35e', 162, 80, 1, 3);
    R(x, '#9cc7dd', 146, 65, 11, 10); R(x, '#9cc7dd', 163, 65, 11, 10);
    drawWin(x, 121, 66, 14, 18); drawWin(x, 185, 66, 14, 18);
    R(x, '#d5d1c8', 136, 96, 48, 4); R(x, '#eceae4', 136, 96, 48, 1);
  });
  def('gate', 128, 46, x => {
    const p = (a) => { R(x, '#f4d273', a, 10, 14, 36); R(x, '#fff3c4', a, 10, 3, 36); R(x, '#e2bb57', a + 11, 10, 3, 36); R(x, '#c8583f', a - 1, 6, 16, 5); R(x, '#e07a5f', a - 1, 6, 16, 1); R(x, '#b9b2a6', a - 1, 42, 16, 4); };
    p(1); p(113);
    R(x, '#2a2136', 12, 0, 104, 15); R(x, '#2f5d8a', 13, 1, 102, 13); R(x, '#4a7fb5', 13, 1, 102, 2);
  });
  def('booth', 30, 40, x => { R(x, '#3b6fb6', 0, 0, 30, 9); R(x, '#5a8fd6', 0, 0, 30, 2); R(x, '#2f5a94', 0, 8, 30, 2); R(x, '#fbf7ee', 2, 10, 26, 30); R(x, '#e3ddd0', 2, 34, 26, 6); drawWin(x, 5, 14, 12, 12); drawDoor(x, 19, 18, 8, 22, '#6b8fb5'); });
  def('flagpole', 30, 60, x => {
    R(x, '#d5d1c8', 2, 52, 14, 8); R(x, '#eceae4', 2, 52, 14, 2); R(x, '#b3aea3', 2, 58, 14, 2); R(x, '#d5d1c8', 5, 48, 8, 4);
    R(x, '#c9ccd4', 8, 3, 2, 46); R(x, '#9aa0ad', 9, 3, 1, 46); ell(x, '#f4d35e', 8.5, 2, 1.6, 1.6);
    R(x, '#da251d', 10, 5, 19, 13); R(x, '#f04a3f', 10, 5, 19, 2); R(x, '#b81d17', 10, 16, 19, 2);
    const s = [[19, 8], [18, 9], [19, 9], [20, 9], [16, 10], [17, 10], [18, 10], [19, 10], [20, 10], [21, 10], [22, 10], [17, 11], [18, 11], [19, 11], [20, 11], [21, 11], [18, 12], [19, 12], [20, 12], [17, 13], [18, 13], [20, 13], [21, 13], [17, 14], [21, 14]];
    for (const [a, b] of s) R(x, '#ffde59', a, b);
  });
  def('canteen', 76, 54, x => {
    for (let i = 0; i < 10; i++) { R(x, i % 2 ? '#fbf7ee' : '#3f9a6b', i * 8 - 2, 0, 8, 11); R(x, i % 2 ? '#e3ddd0' : '#2f7d5b', i * 8 - 2, 10, 8, 2); }
    R(x, '#2a2136', 16, 2, 44, 9); R(x, '#fff3c8', 17, 3, 42, 7);
    R(x, '#8b5e3c', 2, 12, 3, 24); R(x, '#8b5e3c', 71, 12, 3, 24);
    const v = charSheet('vendor')[0][0]; x.drawImage(v, 29, 12);
    R(x, '#e9e4d8', 0, 32, 76, 7); R(x, '#fbf8f0', 0, 32, 76, 2); R(x, '#c98f5a', 0, 39, 76, 15); R(x, '#a8713f', 0, 50, 76, 4);
    R(x, '#a8713f', 25, 39, 1, 11); R(x, '#a8713f', 50, 39, 1, 11);
    R(x, '#e0a85a', 4, 30, 10, 4); R(x, '#f2c27a', 4, 30, 10, 1); R(x, '#e0a85a', 15, 31, 8, 3);
    R(x, '#8fd067', 52, 27, 4, 7); R(x, '#f2a93b', 58, 27, 4, 7); R(x, '#e2574c', 64, 27, 4, 7); R(x, '#fff', 52, 27, 4, 1); R(x, '#fff', 58, 27, 4, 1); R(x, '#fff', 64, 27, 4, 1);
    R(x, '#fff3c8', 6, 42, 14, 7); R(x, '#5f656f', 8, 44, 10, 1); R(x, '#5f656f', 8, 46, 8, 1);
  });
  def('bikeshed', 96, 42, x => {
    R(x, '#5a8fd6', 0, 0, 96, 12); R(x, '#7fb0ea', 0, 0, 96, 2); R(x, '#3b6fb6', 0, 10, 96, 3); for (let i = 6; i < 96; i += 8) R(x, '#3b6fb6', i, 2, 1, 8);
    R(x, '#8b8f9c', 3, 13, 2, 29); R(x, '#8b8f9c', 47, 13, 2, 29); R(x, '#8b8f9c', 91, 13, 2, 29);
    const b = SPR.bike, e = SPR.ebike, m = SPR.moto50; x.drawImage(b, 7, 22); x.drawImage(e, 52, 20); x.drawImage(b, 24, 23); x.drawImage(m, 64, 20);
  });

  /* ---------- nội thất nhà ---------- */
  def('bed', 32, 46, x => {
    R(x, '#9c6b43', 0, 0, 32, 46); R(x, '#b98253', 1, 1, 30, 3); R(x, '#7d5232', 0, 6, 32, 2);
    R(x, '#fbf7ee', 2, 8, 28, 35); R(x, '#ffffff', 6, 10, 20, 8); R(x, '#e3ddd0', 6, 17, 20, 1); R(x, '#e3ddd0', 25, 10, 1, 8);
    R(x, '#6fa8dc', 2, 22, 28, 21); R(x, '#eaf3fb', 2, 20, 28, 3); R(x, '#8cbcea', 2, 27, 28, 2); R(x, '#8cbcea', 2, 33, 28, 2); R(x, '#5a8fc4', 2, 39, 28, 4); R(x, '#5a8fc4', 28, 22, 2, 21);
    R(x, '#7d5232', 0, 44, 32, 2);
  });
  def('desk', 34, 26, x => {
    R(x, '#c58c56', 0, 0, 34, 16); R(x, '#dba56e', 0, 0, 34, 2); R(x, '#a8713f', 0, 16, 34, 10); R(x, '#8a5a3a', 0, 24, 34, 2);
    R(x, '#8a5a3a', 16, 17, 1, 7); R(x, '#f4d35e', 7, 20, 3, 1); R(x, '#f4d35e', 24, 20, 3, 1);
    R(x, '#3f9a6b', 3, 2, 5, 3); R(x, '#2f7d5b', 5, 5, 1, 4); R(x, '#2f7d5b', 3, 9, 5, 2); R(x, '#ffe9a0', 4, 5, 3, 1);
    R(x, '#fffaf0', 12, 6, 11, 8); R(x, '#d9d0bd', 17, 6, 1, 8); R(x, '#8fa0ab', 13, 8, 3, 1); R(x, '#8fa0ab', 13, 10, 3, 1); R(x, '#8fa0ab', 19, 8, 3, 1); R(x, '#8fa0ab', 19, 10, 3, 1); R(x, '#e2574c', 23, 11, 4, 1);
    R(x, '#e2574c', 26, 2, 6, 2); R(x, '#3b82c4', 26, 4, 6, 2); R(x, '#f2a93b', 26, 6, 6, 2); R(x, '#5fae4a', 27, 8, 5, 2);
  });
  def('workdesk', 34, 26, x => {
    R(x, '#b98253', 0, 0, 34, 16); R(x, '#d19a5f', 0, 0, 34, 2); R(x, '#9c6b43', 0, 16, 34, 10); R(x, '#7d5232', 0, 24, 34, 2); R(x, '#7d5232', 16, 17, 1, 7); R(x, '#f4d35e', 7, 20, 3, 1); R(x, '#f4d35e', 24, 20, 3, 1);
    R(x, '#3a3f55', 10, 1, 14, 9); R(x, '#7fb0ea', 11, 2, 12, 7); R(x, '#cfe8f7', 12, 3, 5, 1); R(x, '#cfe8f7', 12, 5, 8, 1); R(x, '#c9ccd4', 9, 10, 16, 4); R(x, '#8b8f9c', 11, 11, 12, 1); R(x, '#8b8f9c', 11, 12, 12, 1);
    R(x, '#ffffff', 27, 4, 4, 5); R(x, '#6f472c', 28, 5, 2, 2); R(x, '#fffaf0', 2, 5, 6, 8); R(x, '#8fa0ab', 3, 7, 4, 1); R(x, '#8fa0ab', 3, 9, 4, 1);
  });
  def('chair', 12, 12, x => { R(x, '#b9824f', 1, 0, 10, 8); R(x, '#d19a5f', 1, 0, 10, 2); R(x, '#8a5a3a', 1, 8, 2, 4); R(x, '#8a5a3a', 9, 8, 2, 4); R(x, '#9c6b43', 1, 7, 10, 1); });
  def('wardrobe', 30, 38, x => {
    R(x, '#8a5a3a', 0, 0, 30, 6); R(x, '#a9703f', 0, 0, 30, 2); R(x, '#b47a48', 0, 6, 30, 30); R(x, '#8a5a3a', 14, 6, 2, 30); R(x, '#c58c56', 2, 8, 11, 26); R(x, '#c58c56', 17, 8, 11, 26);
    R(x, '#dba56e', 2, 8, 11, 1); R(x, '#dba56e', 17, 8, 11, 1); R(x, '#f4d35e', 11, 20, 1, 3); R(x, '#f4d35e', 18, 20, 1, 3); R(x, '#6f472c', 1, 36, 3, 2); R(x, '#6f472c', 26, 36, 3, 2);
  });
  def('shelf', 16, 32, x => {
    R(x, '#8a5a3a', 0, 0, 16, 32); R(x, '#a9703f', 0, 0, 16, 2); R(x, '#5b3d27', 2, 4, 12, 7); R(x, '#5b3d27', 2, 13, 12, 7); R(x, '#5b3d27', 2, 22, 12, 7);
    const cs = ['#e2574c', '#3b82c4', '#f2a93b', '#5fae4a', '#7a5fc9', '#fff', '#e98fa5'];
    for (let j = 0; j < 3; j++) for (let i = 0; i < 6; i++) R(x, cs[(i * 2 + j * 3) % 7], 2 + i * 2, 5 + j * 9 + ((i + j) % 3 === 0 ? 1 : 0), 2, 6 - ((i + j) % 3 === 0 ? 1 : 0));
  });
  def('mat', 30, 14, x => { R(x, '#4fb3a6', 0, 0, 30, 14); R(x, '#7fd1c6', 1, 1, 28, 1); R(x, '#3f978c', 1, 12, 28, 1); R(x, '#7fd1c6', 3, 4, 24, 1); R(x, '#7fd1c6', 3, 9, 24, 1); });
  def('tvcab', 38, 28, x => {
    R(x, '#2f2a3a', 3, 0, 32, 17); R(x, '#4f7fb5', 5, 2, 28, 12); R(x, '#7fa9d6', 5, 2, 28, 2); line(x, '#9cc3e6', 8, 12, 16, 4); line(x, '#9cc3e6', 11, 12, 17, 6);
    R(x, '#2f2a3a', 16, 17, 6, 2); R(x, '#8a5a3a', 0, 18, 38, 10); R(x, '#a9703f', 0, 18, 38, 2); R(x, '#6f472c', 12, 21, 1, 6); R(x, '#6f472c', 25, 21, 1, 6); R(x, '#f4d35e', 6, 23, 2, 1); R(x, '#f4d35e', 18, 23, 2, 1); R(x, '#f4d35e', 30, 23, 2, 1);
  });
  def('sofa', 46, 20, x => { R(x, '#5f7fa8', 0, 2, 46, 18); R(x, '#7b9bc4', 2, 0, 42, 6); R(x, '#8fb0d8', 3, 1, 40, 1); R(x, '#4f6c92', 0, 14, 46, 6); R(x, '#4f6c92', 0, 4, 4, 14); R(x, '#4f6c92', 42, 4, 4, 14); R(x, '#6f8fb8', 5, 7, 17, 7); R(x, '#6f8fb8', 24, 7, 17, 7); R(x, '#f2a93b', 8, 5, 6, 5); });
  def('rug', 54, 30, x => { ell(x, '#d9695f', 26.5, 14.5, 26.5, 14.5); ell(x, '#f0c9a0', 26.5, 14.5, 22, 11); ell(x, '#d9695f', 26.5, 14.5, 19, 9); ell(x, '#e88b7f', 26.5, 14.5, 10, 4.5); }, true);
  def('rugBlue', 46, 24, x => { ell(x, '#5f8fc4', 22.5, 11.5, 22.5, 11.5); ell(x, '#cfe0f2', 22.5, 11.5, 19, 9); ell(x, '#5f8fc4', 22.5, 11.5, 16, 7); }, true);
  def('broom', 16, 26, x => { R(x, '#b98253', 10, 0, 2, 18); R(x, '#8a5a3a', 11, 0, 1, 18); R(x, '#f4d35e', 7, 17, 8, 6); R(x, '#d9b23c', 8, 19, 1, 4); R(x, '#d9b23c', 11, 19, 1, 4); R(x, '#d9b23c', 13, 19, 1, 4); R(x, '#e2574c', 7, 16, 8, 2); R(x, '#5a8fd6', 0, 16, 7, 9); R(x, '#7fb0ea', 0, 16, 7, 2); R(x, '#3b6fb6', 0, 23, 7, 2); R(x, '#c9ccd4', 1, 13, 5, 1); R(x, '#c9ccd4', 0, 14, 1, 2); R(x, '#c9ccd4', 6, 14, 1, 2); });
  const counter = (name, extra) => def(name, 16, 26, x => { R(x, '#efe9dc', 0, 0, 16, 10); R(x, '#fbf8f0', 0, 0, 16, 2); R(x, '#d6cfbe', 0, 9, 16, 1); R(x, '#c98f5a', 0, 10, 16, 16); R(x, '#a8713f', 0, 24, 16, 2); R(x, '#b47a48', 2, 12, 12, 10); R(x, '#dba56e', 2, 12, 12, 1); R(x, '#f4d35e', 11, 16, 1, 2); if (extra) extra(x); });
  counter('counter');
  counter('stove', x => { R(x, '#3a3340', 1, 2, 14, 7); ell(x, '#5f656f', 4.5, 5.5, 2.5, 2.5); ell(x, '#5f656f', 11.5, 5.5, 2.5, 2.5); R(x, '#c9ccd4', 2, 1, 6, 5); R(x, '#e6e8ee', 2, 1, 6, 1); R(x, '#8b8f9c', 1, 2, 1, 2); R(x, '#8b8f9c', 8, 2, 1, 2); R(x, '#f2a93b', 3, 2, 4, 2); });
  counter('sink', x => { R(x, '#b8c4cc', 2, 2, 9, 7); R(x, '#8fa0ab', 3, 3, 7, 5); R(x, '#6fb4dc', 4, 4, 5, 3); R(x, '#c9ccd4', 6, 0, 1, 3); R(x, '#c9ccd4', 6, 0, 3, 1); R(x, '#fff', 12, 3, 3, 1); R(x, '#fff', 12, 5, 3, 1); R(x, '#e3ddd0', 12, 4, 3, 1); R(x, '#fff', 12, 7, 3, 1); R(x, '#e3ddd0', 12, 6, 3, 1); });
  def('fridge', 16, 34, x => { R(x, '#eef2f5', 0, 0, 16, 34); R(x, '#ffffff', 0, 0, 16, 3); R(x, '#cfd6dc', 0, 13, 16, 1); R(x, '#cfd6dc', 14, 0, 2, 34); R(x, '#8b8f9c', 2, 6, 1, 5); R(x, '#8b8f9c', 2, 16, 1, 8); R(x, '#b9c0c7', 0, 32, 16, 2); R(x, '#e2574c', 7, 5, 3, 3); R(x, '#f4d35e', 10, 18, 3, 3); });
  const table = (name, food) => def(name, 44, 30, x => {
    R(x, '#d19a5f', 0, 0, 44, 20); R(x, '#e4b279', 0, 0, 44, 2); R(x, '#b47a48', 0, 18, 44, 2); R(x, '#a8713f', 0, 20, 44, 5); R(x, '#8a5a3a', 2, 25, 3, 5); R(x, '#8a5a3a', 39, 25, 3, 5);
    if (food) {
      ell(x, '#ffffff', 9, 7, 5, 4); ell(x, '#f4e3b0', 9, 7, 3.4, 2.6); ell(x, '#ffffff', 34, 7, 5, 4); ell(x, '#f4e3b0', 34, 7, 3.4, 2.6);
      ell(x, '#ffffff', 21.5, 9, 7, 5); ell(x, '#5fae4a', 21.5, 9, 5, 3.4); R(x, '#e2574c', 19, 8, 2, 2); R(x, '#f2a93b', 23, 9, 2, 2); R(x, '#fff', 21, 7, 1, 1);
      ell(x, '#ffffff', 21.5, 15.5, 4, 2.5); ell(x, '#c9862b', 21.5, 15.5, 2.6, 1.4);
      R(x, '#8a5a3a', 14, 12, 1, 5); R(x, '#8a5a3a', 15, 12, 1, 5); R(x, '#8a5a3a', 28, 12, 1, 5); R(x, '#8a5a3a', 29, 12, 1, 5);
    } else { R(x, '#fffaf0', 18, 6, 8, 8); R(x, '#e98fa5', 20, 8, 4, 4); R(x, '#5fae4a', 21, 5, 2, 3); }
  });
  table('table', false); table('tableFood', true);
  def('stool', 10, 9, x => { R(x, '#c58c56', 0, 0, 10, 5); R(x, '#dba56e', 0, 0, 10, 1); R(x, '#8a5a3a', 1, 5, 2, 4); R(x, '#8a5a3a', 7, 5, 2, 4); });
  def('lunchbox', 10, 8, x => { R(x, '#e2574c', 0, 2, 10, 6); R(x, '#fbf7ee', 0, 0, 10, 3); R(x, '#c2453b', 0, 6, 10, 2); R(x, '#8b8f9c', 4, 0, 2, 1); });
  def('plant', 14, 22, x => { R(x, '#c8583f', 3, 15, 8, 7); R(x, '#e07a5f', 2, 14, 10, 2); R(x, '#a84530', 3, 20, 8, 2); ell(x, '#5fae4a', 6.5, 7, 6.5, 7); ell(x, '#7cc75f', 4.5, 5, 3, 3); ell(x, '#4a9340', 9, 10, 3.4, 3); });
  def('doormat', 28, 10, x => { R(x, '#b5651d', 0, 0, 28, 10); R(x, '#d9863a', 2, 2, 24, 6); R(x, '#b5651d', 5, 4, 18, 2); }, true);
  def('calendar', 12, 14, x => { R(x, '#fffaf0', 0, 0, 12, 14); R(x, '#e2574c', 0, 0, 12, 4); R(x, '#5f656f', 2, 6, 2, 2); R(x, '#5f656f', 5, 6, 2, 2); R(x, '#5f656f', 8, 6, 2, 2); R(x, '#5f656f', 2, 10, 2, 2); R(x, '#e2574c', 5, 10, 2, 2); R(x, '#5f656f', 8, 10, 2, 2); });

  /* ---------- lớp học ---------- */
  def('sdesk', 28, 13, x => { R(x, '#e2bd82', 0, 0, 28, 9); R(x, '#f0d09a', 0, 0, 28, 2); R(x, '#b98a52', 0, 9, 28, 3); R(x, '#8a5a3a', 1, 12, 2, 1); R(x, '#8a5a3a', 25, 12, 2, 1); R(x, '#c9a467', 13, 2, 2, 7); R(x, '#fffaf0', 3, 3, 6, 4); R(x, '#fffaf0', 18, 3, 6, 4); R(x, '#8fa0ab', 4, 5, 4, 1); R(x, '#8fa0ab', 19, 5, 4, 1); });
  def('tdesk', 32, 20, x => { R(x, '#b47a48', 0, 0, 32, 12); R(x, '#c98f5a', 0, 0, 32, 2); R(x, '#8a5a3a', 0, 12, 32, 8); R(x, '#6f472c', 0, 18, 32, 2); R(x, '#fffaf0', 4, 3, 8, 6); R(x, '#e2574c', 14, 4, 6, 2); R(x, '#3b82c4', 14, 6, 6, 2); R(x, '#5a8fd6', 24, 4, 4, 5); R(x, '#5fae4a', 24, 1, 4, 3); R(x, '#ff8fa8', 25, 0, 2, 2); });
  /* ---------- phòng thí nghiệm ---------- */
  def('labbench', 46, 20, x => {
    R(x, '#dfe6ea', 0, 0, 46, 12); R(x, '#f2f6f8', 0, 0, 46, 2); R(x, '#b9c4cc', 0, 11, 46, 1); R(x, '#7b8a99', 0, 12, 46, 8); R(x, '#657382', 0, 18, 46, 2); R(x, '#657382', 15, 13, 1, 5); R(x, '#657382', 30, 13, 1, 5);
    R(x, '#e6f4fa', 5, 1, 2, 3); R(x, '#e6f4fa', 4, 4, 4, 2); R(x, '#e6f4fa', 3, 6, 6, 4); R(x, '#5fd08a', 4, 7, 4, 3);
    R(x, '#8b5e3c', 12, 8, 11, 2); ['#e2574c', '#f2a93b', '#7a5fc9'].forEach((c, i) => { R(x, '#e6f4fa', 13 + i * 3, 2, 2, 7); R(x, c, 13 + i * 3, 5, 2, 4); });
    R(x, '#3a3f55', 28, 2, 2, 7); R(x, '#3a3f55', 27, 1, 4, 2); R(x, '#3a3f55', 26, 8, 7, 2); R(x, '#8b8f9c', 30, 4, 3, 2); R(x, '#c9ccd4', 27, 6, 5, 1);
    R(x, '#c98f5a', 37, 6, 6, 4); R(x, '#8b8f9c', 38, 5, 4, 1); R(x, '#f2a93b', 39, 3, 2, 2); R(x, '#ffe066', 39, 1, 2, 2);
  });
  def('cabinet', 32, 36, x => {
    R(x, '#c9d3da', 0, 0, 32, 36); R(x, '#e6edf1', 0, 0, 32, 2); R(x, '#9aa8b3', 0, 34, 32, 2); R(x, '#eaf4f8', 2, 4, 13, 28); R(x, '#eaf4f8', 17, 4, 13, 28);
    R(x, '#9aa8b3', 2, 13, 28, 1); R(x, '#9aa8b3', 2, 23, 28, 1); R(x, '#9aa8b3', 15, 4, 2, 28);
    const cs = ['#e2574c', '#5fd08a', '#3b82c4', '#f2a93b', '#7a5fc9', '#e98fa5', '#8b5e3c'];
    for (let j = 0; j < 3; j++) for (let i = 0; i < 8; i++) { const bx = (i < 4 ? 3 : 18) + (i % 4) * 3; R(x, '#ffffff', bx, 7 + j * 10, 2, 2); R(x, cs[(i * 3 + j * 2) % 7], bx, 9 + j * 10, 2, 4); }
  });
  def('skeleton', 14, 32, x => {
    const b = '#f4f1e6', d = '#cfc9b6';
    ell(x, b, 6.5, 4, 3.5, 3.6); R(x, '#2a2136', 5, 3, 1, 2); R(x, '#2a2136', 8, 3, 1, 2); R(x, d, 6, 6, 2, 1);
    R(x, b, 6, 8, 2, 12); for (let j = 0; j < 4; j++) R(x, b, 3, 10 + j * 2, 8, 1);
    R(x, b, 2, 9, 1, 9); R(x, b, 11, 9, 1, 9); R(x, b, 4, 20, 6, 2); R(x, b, 4, 22, 2, 7); R(x, b, 8, 22, 2, 7);
    R(x, '#8b8f9c', 6, 28, 2, 2); R(x, '#5f656f', 2, 30, 10, 2);
  });
  def('marker', 9, 7, x => { R(x, '#f4d35e', 0, 0, 9, 2); R(x, '#f4d35e', 1, 2, 7, 2); R(x, '#f4d35e', 2, 4, 5, 1); R(x, '#f4d35e', 3, 5, 3, 1); R(x, '#f4d35e', 4, 6, 1, 1); R(x, '#ffe9a0', 1, 0, 7, 1); });
}

/* ======================= NỀN (ô 16×16) ======================= */
const GROUND = {
  grass(x, px, py, tx, ty) {
    R(x, '#86c35d', px, py, 16, 16); const r = rng(tx * 92837 + ty * 1237 + 11);
    for (let i = 0; i < 4; i++) { const a = px + 1 + (r() * 13 | 0), b = py + 2 + (r() * 13 | 0); R(x, '#6fae4d', a, b, 2, 1); R(x, '#6fae4d', a + (r() < .5 ? 0 : 1), b - 1, 1, 1); }
    for (let i = 0; i < 3; i++) R(x, '#9bd470', px + (r() * 15 | 0), py + (r() * 15 | 0), 2, 1);
  },
  flowers(x, px, py, tx, ty) {
    GROUND.grass(x, px, py, tx, ty); const r = rng(tx * 31 + ty * 77 + 5);
    for (let i = 0; i < 3; i++) { const a = px + 2 + (r() * 11 | 0), b = py + 2 + (r() * 11 | 0), c = ['#ffffff', '#ffd84d', '#ff8fa8', '#c9a0f0'][r() * 4 | 0]; R(x, c, a - 1, b, 3, 1); R(x, c, a, b - 1, 1, 3); R(x, '#f2a93b', a, b); }
  },
  dirt(x, px, py, tx, ty) {
    R(x, '#cfa775', px, py, 16, 16); const r = rng(tx * 517 + ty * 911 + 3);
    for (let i = 0; i < 6; i++) R(x, r() < .5 ? '#bd9462' : '#dcb887', px + (r() * 15 | 0), py + (r() * 15 | 0), 2, 1);
  },
  walk(x, px, py, tx, ty) {
    R(x, '#d8d2c4', px, py, 16, 16); R(x, '#c3bcab', px, py + 7, 16, 1); R(x, '#c3bcab', px, py + 15, 16, 1);
    R(x, '#c3bcab', px + 7, py, 1, 7); R(x, '#c3bcab', px + 15, py + 8, 1, 7); R(x, '#e6e1d5', px, py, 7, 1); R(x, '#e6e1d5', px + 8, py + 8, 7, 1);
  },
  road(x, px, py, tx, ty) {
    R(x, '#6a6d78', px, py, 16, 16); const r = rng(tx * 713 + ty * 177 + 9);
    for (let i = 0; i < 5; i++) R(x, r() < .5 ? '#5f626d' : '#767985', px + (r() * 15 | 0), py + (r() * 15 | 0), 2, 1);
  },
  yard(x, px, py, tx, ty) {
    R(x, '#e6cfa6', px, py, 16, 16); R(x, '#d7bd90', px, py + 7, 16, 1); R(x, '#d7bd90', px, py + 15, 16, 1);
    R(x, '#d7bd90', px + 15, py, 1, 7); R(x, '#d7bd90', px + 7, py + 8, 1, 7); R(x, '#efdcb9', px, py, 15, 1); R(x, '#efdcb9', px + 8, py + 8, 7, 1);
  },
  court(x, px, py, tx, ty) {
    R(x, '#5fae78', px, py, 16, 16); const r = rng(tx * 331 + ty * 733 + 2);
    for (let i = 0; i < 4; i++) R(x, r() < .5 ? '#56a36f' : '#69b983', px + (r() * 15 | 0), py + (r() * 15 | 0), 2, 1);
  },
  wood(x, px, py, tx, ty) {
    R(x, '#e2b77c', px, py, 16, 16);
    for (let k = 0; k < 4; k++) { R(x, '#c99a5f', px, py + k * 4 + 3, 16, 1); const jx = (tx * 5 + k * 7 + ty * 3) % 16; R(x, '#c99a5f', px + jx, py + k * 4, 1, 3); R(x, '#edc78f', px, py + k * 4, 16, 1); }
  },
  ktile(x, px, py, tx, ty) {
    for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) { R(x, (i + j) % 2 ? '#e6ddc6' : '#f3ecda', px + i * 8, py + j * 8, 8, 8); R(x, '#d3c9b0', px + i * 8 + 7, py + j * 8, 1, 8); R(x, '#d3c9b0', px + i * 8, py + j * 8 + 7, 8, 1); }
  },
  ctile(x, px, py, tx, ty) {
    R(x, '#e3e6d4', px, py, 16, 16); R(x, '#ced3bd', px + 15, py, 1, 16); R(x, '#ced3bd', px, py + 15, 16, 1); R(x, '#eef0e2', px, py, 15, 1);
  },
  // cỏ núi: sẫm hơn, lẫn sỏi
  grass2(x, px, py, tx, ty) {
    R(x, '#6fae58', px, py, 16, 16); const r = rng(tx * 4127 + ty * 977 + 7);
    for (let i = 0; i < 4; i++) { const a = px + 1 + (r() * 13 | 0), b = py + 2 + (r() * 13 | 0); R(x, '#5a9648', a, b, 2, 1); R(x, '#5a9648', a + 1, b - 1, 1, 1); }
    for (let i = 0; i < 2; i++) R(x, '#86c35d', px + (r() * 15 | 0), py + (r() * 15 | 0), 2, 1);
    if (r() < 0.12) R(x, '#b9b2a6', px + 3 + (r() * 9 | 0), py + 4 + (r() * 9 | 0), 2, 1);
  },
  flowers2(x, px, py, tx, ty) {
    GROUND.grass2(x, px, py, tx, ty); const r = rng(tx * 53 + ty * 91 + 8);
    for (let i = 0; i < 3; i++) { const a = px + 2 + (r() * 11 | 0), b = py + 2 + (r() * 11 | 0), c = ['#ffffff', '#ffd84d', '#ff8fa8', '#c9a0f0'][r() * 4 | 0]; R(x, c, a - 1, b, 3, 1); R(x, c, a, b - 1, 1, 3); R(x, '#f2a93b', a, b); }
  },
  water(x, px, py, tx, ty) {
    R(x, '#5fb0e0', px, py, 16, 16); const r = rng(tx * 211 + ty * 613 + 4);
    for (let i = 0; i < 3; i++) R(x, r() < .5 ? '#8fd0f0' : '#4f9bcb', px + (r() * 12 | 0), py + 2 + (r() * 12 | 0), 4, 1);
  },
  sand(x, px, py, tx, ty) {
    R(x, '#f1dfae', px, py, 16, 16); const r = rng(tx * 389 + ty * 571 + 6);
    for (let i = 0; i < 5; i++) R(x, r() < .5 ? '#e6d096' : '#f8ecc6', px + (r() * 15 | 0), py + (r() * 15 | 0), 2, 1);
  },
  // ván gỗ cầu tàu / lối đi lót ván
  plank(x, px, py) { R(x, '#c58c56', px, py, 16, 16); for (let k = 0; k < 4; k++) { R(x, '#a8713f', px, py + k * 4 + 3, 16, 1); R(x, '#dba56e', px, py + k * 4, 16, 1); } R(x, '#a8713f', px + 7, py, 1, 16); },
  // gạch nhà vệ sinh
  wtile(x, px, py) { for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) { R(x, (i + j) % 2 ? '#f7e9ee' : '#fdf6f8', px + i * 8, py + j * 8, 8, 8); R(x, '#e6cdd6', px + i * 8 + 7, py + j * 8, 1, 8); R(x, '#e6cdd6', px + i * 8, py + j * 8 + 7, 8, 1); } },
  dtile(x, px, py, tx, ty) { R(x, (tx + ty) % 2 ? '#3a2f5b' : '#43376a', px, py, 16, 16); R(x, '#2c2347', px + 15, py, 1, 16); R(x, '#2c2347', px, py + 15, 16, 1); },
  ltile(x, px, py) { R(x, '#dfe9ee', px, py, 16, 16); R(x, '#c9d6dd', px + 15, py, 1, 16); R(x, '#c9d6dd', px, py + 15, 16, 1); R(x, '#eef4f7', px, py, 15, 1); },
  walltop(x, px, py) { R(x, '#3f354c', px, py, 16, 16); },
  void(x, px, py) { R(x, '#1f1b2e', px, py, 16, 16); },
};
