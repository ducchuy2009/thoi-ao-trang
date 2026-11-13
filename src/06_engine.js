'use strict';
/* ============================================================
 *  06. ENGINE — vòng lặp, điều khiển (WASD + chuột phải), va chạm, vẽ
 * ============================================================ */
const VIEW = { S: 3, ox: 0, oy: 0, dpr: 1 };
const KEYS = {};
const MOUSE = { x: 0, y: 0, on: false };
const JOY = { id: null, sx: 0, sy: 0, dx: 0, dy: 0 };
let cv, ctx, lastT = 0, hudAcc = 0;

function resize() {
  VIEW.dpr = Math.min(3, window.devicePixelRatio || 1);
  cv.width = Math.max(320, Math.round(window.innerWidth * VIEW.dpr));
  cv.height = Math.max(200, Math.round(window.innerHeight * VIEW.dpr));
  VIEW.S = Math.max(2, Math.round(Math.min(cv.width / 320, cv.height / 190)));
}
function setMap(id, x, y, dir) {
  G.map = id; if (x !== undefined) { G.x = x; G.y = y; } if (dir !== undefined) G.dir = dir;
  RT.hover = null; RT.near = null; RT.walkT = -1;
}

/* ---------- va chạm ---------- */
function blocked(m, x, y) {
  const x0 = x - 4, x1 = x + 3.99, y0 = y - 5, y1 = y - 0.01;
  if (x0 < 0 || y0 < 0 || x1 >= m.pw || y1 >= m.ph) return true;
  const tx0 = x0 >> 4, tx1 = x1 >> 4, ty0 = y0 >> 4, ty1 = y1 >> 4;
  if (m.solid[ty0 * m.w + tx0] || m.solid[ty0 * m.w + tx1] || m.solid[ty1 * m.w + tx0] || m.solid[ty1 * m.w + tx1]) return true;
  for (const o of m.objs) {
    if (!o.sol) continue;
    const a = o.x + o.sol[0], b = o.y + o.sol[1];
    if (x1 > a && x0 < a + o.sol[2] && y1 > b && y0 < b + o.sol[3]) { if (o.vis && !o.vis()) continue; return true; }
  }
  for (const s of m.solids) if (x1 > s[0] && x0 < s[0] + s[2] && y1 > s[1] && y0 < s[1] + s[3]) return true;
  // người đang ngồi (học sinh trong lớp) chỉ chặn khi thực sự có mặt
  for (const n of NPCS) if (n.solid && n.map === m.id && x1 > n.x - 5 && x0 < n.x + 5 && y1 > n.y - 6 && y0 < n.y + 1 && (!n.vis || n.vis())) return true;
  return false;
}

/* ---------- NPC ---------- */
function npcsHere() { return NPCS.filter(n => n.map === G.map && (!n.vis || n.vis())); }
function updateNpcs(dt, busy) {
  const m = MAPS[G.map];
  for (const n of NPCS) {
    if (n.fam || n.map !== G.map) continue;      // bố mẹ do updateFamily điều khiển
    if (n.pos) { const p = n.pos(); n.cx = p.x; n.cy = p.y; n.cdir = p.dir; n.walk = -1; continue; }
    if (n.cx === undefined) { n.cx = n.x; n.cy = n.y; n.cdir = n.dir; n.walk = -1; n.wt = Math.random() * 3; }
    if (n.solid && !busy) n.cdir = n.dir;         // bạn đang ngồi: nói chuyện xong thì quay lại nhìn bảng
    if (!n.wander || busy) { n.walk = -1; continue; }
    if (n.tx !== undefined) {
      const dx = n.tx - n.cx, dy = n.ty - n.cy, d = Math.hypot(dx, dy);
      if (d < 1.5) { n.tx = undefined; n.walk = -1; continue; }
      const sp = 24 * dt, nx = n.cx + dx / d * sp, ny = n.cy + dy / d * sp;
      if (blocked(m, nx, ny) || Math.hypot(nx - G.x, ny - G.y) < 12) { n.tx = undefined; n.walk = -1; continue; }
      n.cx = nx; n.cy = ny; n.cdir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0); n.walk = (n.walk < 0 ? 0 : n.walk) + dt;
    } else {
      n.wt -= dt;
      if (n.wt <= 0) { n.wt = rnd(1.5, 5); n.tx = n.x + rnd(-n.wander, n.wander); n.ty = n.y + rnd(-n.wander, n.wander); }
    }
  }
}

/* ---------- tương tác ---------- */
function interactables() {
  const m = MAPS[G.map], a = [];
  for (const o of m.objs) {
    if (!o.act || (o.vis && !o.vis())) continue;
    const s = o.ir || o.sol || [0, 0, o.w, o.h];
    a.push({ x: o.x, y: o.y, w: o.w, h: o.h, rx: o.x + s[0], ry: o.y + s[1], rw: s[2], rh: s[3], base: o.base, label: o.label, act: o.act, range: 18 });
  }
  for (const n of npcsHere()) if (n.act && !(n.fam && FAM[n.fam].riding)) a.push({ x: n.cx - 9, y: n.cy - 24, w: 18, h: 25, rx: n.cx - 4, ry: n.cy - 5, rw: 8, rh: 5, base: n.cy, label: n.label, act: n.act, range: 24, npc: n });
  return a;
}
function distTo(t) { const px = G.x, py = G.y - 2; return Math.hypot(Math.max(t.rx - px, 0, px - (t.rx + t.rw)), Math.max(t.ry - py, 0, py - (t.ry + t.rh))); }
const inRange = t => distTo(t) <= t.range;
function scanTargets() {
  const list = interactables();
  let near = null, nd = 1e9, hov = null;
  const wx = (MOUSE.x * VIEW.dpr - VIEW.ox) / VIEW.S, wy = (MOUSE.y * VIEW.dpr - VIEW.oy) / VIEW.S;
  for (const t of list) {
    const d = distTo(t); if (d <= t.range && d < nd) { nd = d; near = t; }
    if (MOUSE.on && wx >= t.x - 1 && wx <= t.x + t.w + 1 && wy >= t.y - 1 && wy <= t.y + t.h + 1 && (!hov || t.base > hov.base)) hov = t;
  }
  RT.near = near; RT.hover = hov;
}
function doInteract(t) {
  if (!G || RT.lock || UI.isOpen() || !t) return;
  if (!inRange(t)) return UI.toast('Lại gần hơn một chút nhé.');
  const cxm = t.rx + t.rw / 2, cym = t.ry + t.rh / 2, dx = cxm - G.x, dy = cym - G.y;
  G.dir = Math.abs(dx) > Math.abs(dy) * 1.4 ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0);
  if (t.npc && !t.npc.pos) { t.npc.tx = undefined; t.npc.cdir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 1) : (dy < 0 ? 0 : 3); }
  t.act();
}
function interactPointer() { scanTargets(); doInteract(RT.hover || RT.near); }

/* ---------- cập nhật ---------- */
function movePlayer(dt) {
  let vx = 0, vy = 0;
  if (KEYS.a || KEYS.arrowleft) vx -= 1; if (KEYS.d || KEYS.arrowright) vx += 1;
  if (KEYS.w || KEYS.arrowup) vy -= 1; if (KEYS.s || KEYS.arrowdown) vy += 1;
  if (JOY.id !== null) { const l = Math.hypot(JOY.dx, JOY.dy); if (l > 10) { vx = JOY.dx / l; vy = JOY.dy / l; } }
  if (!vx && !vy) { RT.walkT = -1; return; }
  const l = Math.hypot(vx, vy), sp = (G.stamina <= 0 ? 48 : 76) * dt; vx = vx / l * sp; vy = vy / l * sp;
  G.dir = Math.abs(vx) > Math.abs(vy) ? (vx < 0 ? 1 : 2) : (vy < 0 ? 3 : 0);
  const m = MAPS[G.map];
  if (vx && !blocked(m, G.x + vx, G.y)) G.x += vx;
  if (vy && !blocked(m, G.x, G.y + vy)) G.y += vy;
  RT.walkT = (RT.walkT < 0 ? 0 : RT.walkT) + dt;
  for (const w of m.warps) if (G.dir === w.dir && G.x >= w.x && G.x < w.x + w.w && G.y >= w.y && G.y < w.y + w.h) { doWarp(w); return; }
  for (const z of m.zones) if (G.x >= z.x && G.x < z.x + z.w && G.y >= z.y && G.y < z.y + z.h) { G.x += z.bx || 0; G.y += z.by || 0; for (const k in KEYS) KEYS[k] = false; z.fn(); return; }
}
async function doWarp(w) {
  RT.lock = true; await UI.fade(true, 110);
  setMap(w.to.map, w.to.x, w.to.y, w.to.dir);
  await UI.fade(false, 110); RT.lock = false;
  if (w.to.map === 'home') onEnterHome();
}
function update(dt) {
  if (!G) return;
  const busy = RT.lock || UI.isOpen();
  if (!busy) {
    if (RT.forceSleep) { goSleep(true); return; }
    if (RT.pendingBreak) { const b = RT.pendingBreak; RT.pendingBreak = null; if (!RT.pendingClass && breakFunFor(b.fid).includes(b.id)) { breakInvite(b); return; } }
    if (RT.pendingClass) { const p = RT.pendingClass; RT.pendingClass = null; runClass(p); return; }
    if (RT.pendingEvent) { const e = RT.pendingEvent; RT.pendingEvent = null; if (G.atSchool && inWin(G.time, 640, 790)) { runLunchEvent(e); return; } }
    if (RT.pendingInvite) { const inv = RT.pendingInvite; RT.pendingInvite = null; if (yardTime()) { showInvite(inv); return; } }
    movePlayer(dt);
    RT.tickAcc += dt;
    if (RT.tickAcc >= G.speed) { RT.tickAcc = 0; advanceTime(CFG.TICK_MIN); }
    scanTargets();
    const t = RT.hover || RT.near;
    if (t) UI.hint(t.label ? t.label() : '', inRange(t)); else UI.hint(null);
  } else { RT.walkT = -1; UI.hint(null); }
  updateFamily(dt, busy);
  updateNpcs(dt, busy);
  for (const f of RT.floats) f.t += dt;
  RT.floats = RT.floats.filter(f => f.t < 1.6);
  hudAcc += dt; if (hudAcc > 0.3) { hudAcc = 0; UI.hud(); }
}

/* ---------- vẽ ---------- */
function nightAlpha(t) {
  if (t < 320) return 0.42; if (t < 400) return 0.42 * (1 - (t - 320) / 80);
  if (t < 1050) return 0; if (t < 1200) return 0.5 * (t - 1050) / 150; return 0.5;
}
function wRect(col, x, y, w, h) { const S = VIEW.S; ctx.fillStyle = col; ctx.fillRect(VIEW.ox + Math.round(x * S), VIEW.oy + Math.round(y * S), Math.max(1, Math.round(w * S)), Math.max(1, Math.round(h * S))); }
// Bong bóng lời thoại trong cắt cảnh
function drawBubble(b) {
  const S = VIEW.S, fs = Math.max(11, Math.round(5.6 * S)), pad = Math.round(2.5 * S), maxw = 116 * S, bd = Math.max(2, Math.round(S * 0.7));
  ctx.font = `700 ${fs}px "Baloo 2", system-ui, sans-serif`; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  const lines = []; let cur = '';
  for (const w of b.text.split(' ')) { const t = cur ? cur + ' ' + w : w; if (cur && ctx.measureText(t).width > maxw) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur);
  const lh = Math.round(fs * 1.25), bw = Math.ceil(Math.max(...lines.map(l => ctx.measureText(l).width))) + pad * 2, bh = lines.length * lh + pad * 2;
  const ax = VIEW.ox + b.x * S, ay = VIEW.oy + b.y * S, tail = 3 * S;
  const x = Math.round(clamp(ax - bw / 2, 6, cv.width - bw - 6)), y = Math.round(b.below ? ay + tail : Math.max(6, ay - bh - tail));
  const ty = b.below ? y : y + bh, sg = b.below ? -1 : 1;          // đuôi bong bóng: chĩa xuống đầu người nói, hoặc chĩa lên nếu bong bóng nằm dưới chân
  ctx.fillStyle = '#2a2136'; ctx.fillRect(x - bd, y - bd, bw + bd * 2, bh + bd * 2);
  ctx.beginPath(); ctx.moveTo(ax - tail - bd, ty); ctx.lineTo(ax + tail + bd, ty); ctx.lineTo(ax, ty + sg * (tail + bd * 1.5)); ctx.fill();
  ctx.fillStyle = '#fff6e3'; ctx.fillRect(x, y, bw, bh);
  ctx.beginPath(); ctx.moveTo(ax - tail, ty - sg); ctx.lineTo(ax + tail, ty - sg); ctx.lineTo(ax, ty + sg * tail); ctx.fill();
  ctx.fillStyle = '#2a2136'; lines.forEach((l, i) => ctx.fillText(l, x + pad, y + pad + i * lh));
}
function drawSpr(spr, x, y) { const S = VIEW.S; ctx.drawImage(spr, VIEW.ox + Math.round(x) * S, VIEW.oy + Math.round(y) * S, spr.width * S, spr.height * S); }
function drawChar(look, outfit, x, y, dir, walkT) {
  const sh = charSheet(look, outfit), fr = charFrame(sh, dir, walkT);
  const bob = walkT >= 0 && (Math.floor(walkT * 8) % 2 === 1) ? -1 : 0;
  drawSpr(SHADOW, x - 7, y - 3); drawSpr(fr, x - 9, y - 23 + bob);
}
function render(now) {
  const S = VIEW.S, m = MAPS[G ? G.map : 'town'];
  const vw = cv.width / S, vh = cv.height / S;
  const sc = G && RT.scene && RT.scene.cam;
  const fx = sc ? sc.x : (G ? G.x : 400 + Math.sin(now / 7000) * 230), fy = sc ? sc.y : (G ? G.y - 10 : 150);
  // trong nhà: cho camera trượt ra ngoài mép bản đồ để HUD không che nhân vật
  const pl = m.indoor ? (window.innerWidth <= 720 ? 204 : 262) * VIEW.dpr / S : 0, pt = m.indoor ? 24 : 0, pr = m.indoor ? 16 : 0, pb = m.indoor ? 30 : 0;
  const camx = m.pw + pl + pr <= vw ? (m.pw - vw) / 2 : clamp(fx - vw / 2, -pl, m.pw + pr - vw);
  const camy = m.ph + pt + pb <= vh ? (m.ph - vh) / 2 : clamp(fy - vh / 2, -pt, m.ph + pb - vh);
  VIEW.ox = Math.round(-camx * S); VIEW.oy = Math.round(-camy * S);
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#1f1b2e'; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.drawImage(m.g, VIEW.ox, VIEW.oy, m.pw * S, m.ph * S);
  // gom mọi thứ rồi sắp theo chiều sâu
  const list = [];
  for (const o of m.objs) {
    if (o.x + o.w < camx - 4 || o.x > camx + vw + 4 || o.y + o.h < camy - 4 || o.y > camy + vh + 4) continue;
    if (o.vis && !o.vis()) continue;
    list.push({ b: o.base, o });
  }
  if (G) {
    for (const n of npcsHere()) if (n.cx !== undefined) list.push({ b: n.cy, n });
    if (RT.scene && RT.scene.actors && G.map === RT.scene.map) for (const a of RT.scene.actors) list.push({ b: a.y, a });
    list.push({ b: G.y, p: 1 });
  }
  list.sort((p, q) => p.b - q.b);
  for (const e of list) {
    if (e.o) drawSpr(e.o.dyn ? SPR[e.o.dyn()] : SPR[e.o.s], e.o.x, e.o.y);
    else if (e.n && e.n.fam && FAM[e.n.fam].riding) {   // bố mẹ đang chạy xe
      const n = e.n, left = n.cdir === 1, b = SPR[BIKE[n.fam].spr + (left ? 'L' : '')];
      drawSpr(SHADOW, n.cx - 7, n.cy - 3); drawSpr(b, n.cx - 16, n.cy - 21);
      drawSpr(charSheet(n.look, n.outfit ? n.outfit() : null)[left ? 1 : 2][0], n.cx - 9 + (left ? 2 : -2), n.cy - 32);
    }
    else if (e.n) drawChar(e.n.dynLook ? e.n.dynLook() : e.n.look, e.n.outfit ? e.n.outfit() : null, e.n.cx, e.n.cy, e.n.cdir, e.n.walk);
    else if (e.a) drawChar(e.a.look, e.a.outfit, e.a.x, e.a.y, e.a.dir, -1);
    else drawChar(G.gender, RT.outfit || (schoolToday() ? null : 'casual'), G.x, G.y, G.dir, RT.walkT);
  }
  // đạo cụ của đoạn cắt cảnh (yoyo, con quay, bài, gương soi…) vẽ đè lên nhân vật
  if (G && RT.scene && RT.scene.props && G.map === RT.scene.map) for (const p of RT.scene.props) p(now);
  // biển hiệu (chữ nét)
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const l of m.labels) { ctx.font = `800 ${l.size * S}px "Baloo 2", system-ui, sans-serif`; ctx.fillStyle = l.col; ctx.fillText(l.text, VIEW.ox + l.x * S, VIEW.oy + l.y * S, l.maxw * S); }
  // sáng / tối theo giờ
  if (G) { const a = nightAlpha(G.time) * (m.indoor ? 0.4 : 1); if (a > 0.01) { ctx.fillStyle = `rgba(22,20,74,${a})`; ctx.fillRect(0, 0, cv.width, cv.height); } }
  // quầng sáng đèn đường ban đêm
  if (G && !m.indoor) { const a = nightAlpha(G.time); if (a > 0.05) { ctx.globalCompositeOperation = 'lighter'; for (const o of m.objs) { if (o.s !== 'lamp') continue; const X = VIEW.ox + (o.x + 6) * S, Y = VIEW.oy + (o.y + 8) * S, g = ctx.createRadialGradient(X, Y, 0, X, Y, 52 * S); g.addColorStop(0, `rgba(255,214,130,${0.55 * a * 2})`); g.addColorStop(1, 'rgba(255,214,130,0)'); ctx.fillStyle = g; ctx.fillRect(X - 52 * S, Y - 52 * S, 104 * S, 104 * S); } ctx.globalCompositeOperation = 'source-over'; } }
  // cắt cảnh: hai dải đen kiểu phim + tên cảnh + bong bóng thoại
  if (G && RT.scene && RT.scene.type === 'cut') {
    const bh = Math.round(cv.height * 0.085);
    ctx.fillStyle = '#15121f'; ctx.fillRect(0, 0, cv.width, bh); ctx.fillRect(0, cv.height - bh, cv.width, bh);
    if (RT.scene.title) { ctx.font = `700 ${Math.max(12, Math.round(bh * 0.36))}px "Baloo 2", system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff6e3'; ctx.fillText(RT.scene.title, cv.width / 2, cv.height - bh / 2); }
    if (RT.scene.bubble) drawBubble(RT.scene.bubble);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  }
  if (G && !RT.lock && !UI.isOpen()) {
    const t = RT.hover || RT.near;
    if (t && inRange(t)) drawSpr(SPR.marker, t.x + t.w / 2 - 5, t.y - 10 + Math.round(Math.sin(now / 160) * 1.5));
  }
  // chữ bay (+5 Toán, +3.000đ…)
  for (const f of RT.floats) {
    if (f.t < 0) continue;
    const a = f.t > 1.1 ? Math.max(0, 1 - (f.t - 1.1) / 0.5) : 1;
    ctx.globalAlpha = a; ctx.font = `800 ${7 * S}px "Baloo 2", system-ui, sans-serif`;
    const X = VIEW.ox + f.x * S, Y = VIEW.oy + (f.y - f.t * 16) * S;
    ctx.lineWidth = Math.max(3, S * 1.2); ctx.lineJoin = 'round'; ctx.strokeStyle = '#2a2136'; ctx.strokeText(f.text, X, Y);
    ctx.fillStyle = f.col; ctx.fillText(f.text, X, Y); ctx.globalAlpha = 1;
  }
  if (JOY.id !== null) {
    const d = VIEW.dpr; ctx.globalAlpha = 0.35; ctx.fillStyle = '#fff6e3'; ctx.beginPath(); ctx.arc(JOY.sx * d, JOY.sy * d, 46 * d, 0, 6.3); ctx.fill();
    ctx.globalAlpha = 0.7; ctx.beginPath(); const l = Math.hypot(JOY.dx, JOY.dy), k = l > 40 ? 40 / l : 1; ctx.arc((JOY.sx + JOY.dx * k) * d, (JOY.sy + JOY.dy * k) * d, 20 * d, 0, 6.3); ctx.fill(); ctx.globalAlpha = 1;
  }
}
function frame(t) {
  const dt = Math.min(0.05, (t - lastT) / 1000 || 0); lastT = t;
  update(dt); render(t);
  requestAnimationFrame(frame);
}

/* ---------- điều khiển ---------- */
function bindInput() {
  window.addEventListener('keydown', e => {
    if (!G) return;
    if (UI.isOpen()) return UI._key(e);
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    const k = e.key.toLowerCase(); KEYS[k] = true;
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    if (e.repeat) return;
    if (k === 'e' || k === ' ' || k === 'enter') { scanTargets(); doInteract(RT.near || RT.hover); }
    else if (k === 'b') openMenu('bag'); else if (k === 'c') openMenu('stats'); else if (k === 't') openMenu('tt'); else if (k === 'g') openMenu('grades'); else if (k === 'p') openMenu('phone'); else if (k === 'escape') openMenu('set');
  });
  window.addEventListener('keyup', e => { KEYS[e.key.toLowerCase()] = false; });
  window.addEventListener('blur', () => { for (const k in KEYS) KEYS[k] = false; });
  window.addEventListener('contextmenu', e => e.preventDefault());
  cv.addEventListener('mousemove', e => { MOUSE.x = e.clientX; MOUSE.y = e.clientY; MOUSE.on = true; });
  cv.addEventListener('mouseleave', () => { MOUSE.on = false; });
  cv.addEventListener('mousedown', e => { MOUSE.x = e.clientX; MOUSE.y = e.clientY; MOUSE.on = true; if (e.button === 2 || e.button === 0) { e.preventDefault(); interactPointer(); } });
  // cảm ứng: nửa trái là cần điều khiển, chạm vào đồ vật để tương tác
  cv.addEventListener('touchstart', e => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (JOY.id === null && t.clientX < window.innerWidth * 0.42) { JOY.id = t.identifier; JOY.sx = t.clientX; JOY.sy = t.clientY; JOY.dx = JOY.dy = 0; }
      else { MOUSE.x = t.clientX; MOUSE.y = t.clientY; MOUSE.on = true; interactPointer(); MOUSE.on = false; }
    }
  }, { passive: false });
  cv.addEventListener('touchmove', e => { e.preventDefault(); for (const t of e.changedTouches) if (t.identifier === JOY.id) { JOY.dx = t.clientX - JOY.sx; JOY.dy = t.clientY - JOY.sy; } }, { passive: false });
  const end = e => { for (const t of e.changedTouches) if (t.identifier === JOY.id) { JOY.id = null; JOY.dx = JOY.dy = 0; } };
  cv.addEventListener('touchend', end); cv.addEventListener('touchcancel', end);
  window.addEventListener('resize', resize);
}

/* ---------- màn hình mở đầu ---------- */
function drawPreview(id, look) {
  const c = $(id), x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.clearRect(0, 0, c.width, c.height);
  x.drawImage(charSheet(look)[0][0], 0, 0, 18, 24, 3, 0, 72, 96);
}
function startGame(isNew) {
  if (isNew) newGame($('t-name').value.trim().slice(0, 16), TITLE.gender);
  $('title').classList.add('off'); document.body.classList.add('playing');
  UI.hud();
  if (isNew) {
    UI.ask('Ngày đầu tiên vào lớp 10', `<p>Chào <b>${G.name}</b>! Hôm nay là ${dateLabel(G.day)} — buổi học đầu tiên ở Trường THPT Hoa Phượng.</p>
      <ul class="res"><li><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> để di chuyển, <kbd>Chuột phải</kbd> vào đồ vật để tương tác.</li>
      <li>Buổi sáng: ăn sáng trong bếp, <b>soạn cặp ở bàn học</b> theo thời khoá biểu, rồi ra đường đến trường <b>trước 08:00</b>.</li>
      <li>Bố mẹ đi làm lúc 07:30 — muốn nhờ chở phải hỏi trước 07:20. Đi bộ mất 1 tiếng, xe bus 20 phút.</li>
      <li>Trò chuyện, đấm lưng, phụ việc nhà để bố mẹ vui: tiền tiêu vặt đầu tuần sẽ nhiều hơn. Tan học nhớ về nhà trước 20:00 — về rồi muốn đi chơi tiếp thì xin phép bố mẹ (được cho tiền đi chơi).</li>
      <li>Ở trường bạn bè sẽ rủ rê đủ trò, và bạn cũng có thể chủ động rủ bạn cúp tiết. Vui thì có vui, nhưng bị bắt là bị phạt. Tan học rồi thì đi đâu cũng được.</li>
      <li>Đi hết đường về bên phải khu phố là <b>phố Hoa Sữa</b>: nhà bạn bè, tiệm trà sữa, trung tâm thương mại, khu game, đường lên <b>núi sau trường</b>. Bấm <kbd>P</kbd> để nhắn tin hẹn bạn.</li>
      <li>Mua bim bim Sao Vàng để sưu tầm <b>thẻ cầu thủ</b> rồi đem đấu với bạn.</li></ul>`, ['Bắt đầu']).then(() => morningBrief());
  } else morningBrief();
}
const TITLE = { gender: 'boy' };
function initTitle() {
  drawPreview('pv-boy', 'boy'); drawPreview('pv-girl', 'girl');
  const sel = g => { TITLE.gender = g; $('g-boy').classList.toggle('on', g === 'boy'); $('g-girl').classList.toggle('on', g === 'girl'); };
  $('g-boy').addEventListener('click', () => sel('boy')); $('g-girl').addEventListener('click', () => sel('girl'));
  $('t-start').addEventListener('click', () => startGame(true));
  const cont = $('t-cont');
  if (hasSave()) { $('t-warn').style.display = ''; cont.style.display = ''; cont.addEventListener('click', () => { if (load()) startGame(false); else UI.toast('Không đọc được bản lưu.', 'bad'); }); }
  $('t-name').addEventListener('keydown', e => { if (e.key === 'Enter') startGame(true); });
}

function boot() {
  cv = $('cv'); ctx = cv.getContext('2d');
  buildSprites(); buildSprites2(); buildMaps();
  resize(); bindInput(); bindUI(); initTitle();
  requestAnimationFrame(frame);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
