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
  if (G.ride && MAPS[id].indoor) { G.ride = null; G.park = null; }          // không bao giờ đi xe vào trong nhà
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
    if (n.pos) { const p = n.pos(); if (!p) continue; n.cx = p.x; n.cy = p.y; n.cdir = p.dir; n.walk = p.walk === undefined ? -1 : p.walk; n.coy = p.oy || 0; continue; }
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

// Bạn đang đi cùng: lẽo đẽo theo sau mình (đi xe thì ngồi sau xe)
function updateFollower(dt, busy) {
  const c = G.comp; if (!c) { RT.fol = null; return; }
  let f = RT.fol;
  if (!f || f.map !== G.map) f = RT.fol = { map: G.map, x: G.x, y: G.y, dir: G.dir, walk: -1 };
  if (G.ride) { f.x = G.x; f.y = G.y; f.walk = -1; return; }
  if (busy) { f.walk = -1; return; }
  const m = MAPS[G.map], dx = G.x - f.x, dy = G.y - f.y, d = Math.hypot(dx, dy);
  if (d > 110) { f.x = G.x; f.y = G.y; f.walk = -1; return; }
  if (d <= 19) { f.walk = -1; return; }
  const sp = Math.min(d - 17, 84 * dt), vx = dx / d * sp, vy = dy / d * sp;
  if (!blocked(m, f.x + vx, f.y + vy)) { f.x += vx; f.y += vy; }
  else if (!blocked(m, f.x + vx, f.y)) f.x += vx;
  else if (!blocked(m, f.x, f.y + vy)) f.y += vy;
  else { f.x += vx; f.y += vy; }          // kẹt thì đi xuyên cho khỏi lạc
  f.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0);
  f.walk = (f.walk < 0 ? 0 : f.walk) + dt;
}

/* ---------- tương tác ---------- */
function interactables() {
  const m = MAPS[G.map], a = [];
  for (const o of m.objs) {
    if (!o.act || (o.vis && !o.vis())) continue;
    const s = o.ir || o.sol || [0, 0, o.w, o.h];
    a.push({ x: o.x, y: o.y, w: o.w, h: o.h, rx: o.x + s[0], ry: o.y + s[1], rw: s[2], rh: s[3], base: o.base, label: o.label, act: o.act, range: 18 });
  }
  // xe của mình đang dựng ở đâu đó: bấm vào để lên xe
  if (G.park && !G.park.shed && G.park.map === G.map) { const P = G.park; a.push({ x: P.x - 14, y: P.y - 18, w: 28, h: 20, rx: P.x - 12, ry: P.y - 8, rw: 24, rh: 8, base: P.y, label: () => `${VEHICLES[P.id].name} — lên xe`, act: () => ACT.mount(P.id), range: 20 }); }
  if (G.comp && RT.fol && !G.ride) { const f = RT.fol, fid = G.comp.fid; a.push({ x: f.x - 9, y: f.y - 24, w: 18, h: 25, rx: f.x - 4, ry: f.y - 5, rw: 8, rh: 5, base: f.y, fol: true, label: () => `${FRIENDS[fid].name} — đang đi cùng bạn`, act: () => ACT.friend(fid, 'comp'), range: 24 }); }
  for (const n of npcsHere()) if (n.act && n.cx !== undefined && !(n.fam && FAM[n.fam].riding)) a.push({ x: n.cx - 9, y: n.cy - 24, w: 18, h: 25, rx: n.cx - 4, ry: n.cy - 5, rw: 8, rh: 5, base: n.cy, label: n.label, act: n.act, range: 24, npc: n });
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
  if (!G || RT.lock || UI.isOpen()) return;
  if (!t) { if (RT.hold) heldSelf(); return; }                    // đang cầm đồ mà không nhắm vào ai: ăn
  if (!inRange(t)) return UI.toast('Lại gần hơn một chút nhé.');
  const cxm = t.rx + t.rw / 2, cym = t.ry + t.rh / 2, dx = cxm - G.x, dy = cym - G.y;
  G.dir = Math.abs(dx) > Math.abs(dy) * 1.4 ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0);
  if (t.npc && !t.npc.pos) { t.npc.tx = undefined; t.npc.cdir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 1) : (dy < 0 ? 0 : 3); }
  if (RT.hold && (t.npc || t.fol)) return giveHeld(t);              // đang cầm đồ: tặng quà cho người đó
  t.act();
}
// Bấm chuột: đang cầm đồ thì bấm vào chính mình / chỗ trống là ăn, bấm vào người khác là tặng
const onPlayer = () => { const wx = (MOUSE.x * VIEW.dpr - VIEW.ox) / VIEW.S, wy = (MOUSE.y * VIEW.dpr - VIEW.oy) / VIEW.S; return wx >= G.x - 8 && wx <= G.x + 8 && wy >= G.y - 24 && wy <= G.y + 1; };
function interactPointer() { scanTargets(); if (RT.hold && (onPlayer() || !RT.hover)) return doInteract(null); doInteract(RT.hover || RT.near); }

/* ---------- cập nhật ---------- */
function movePlayer(dt) {
  let vx = 0, vy = 0;
  if (KEYS.a || KEYS.arrowleft) vx -= 1; if (KEYS.d || KEYS.arrowright) vx += 1;
  if (KEYS.w || KEYS.arrowup) vy -= 1; if (KEYS.s || KEYS.arrowdown) vy += 1;
  if (JOY.id !== null) { const l = Math.hypot(JOY.dx, JOY.dy); if (l > 10) { vx = JOY.dx / l; vy = JOY.dy / l; } }
  if (!vx && !vy) { RT.walkT = -1; return; }
  // đang đi xe thì chạy nhanh hơn đi bộ
  const l = Math.hypot(vx, vy), sp = (G.stamina <= 0 ? 48 : 76) * (G.ride ? VEHICLES[G.ride].speed : 1) * dt; vx = vx / l * sp; vy = vy / l * sp;
  G.dir = Math.abs(vx) > Math.abs(vy) ? (vx < 0 ? 1 : 2) : (vy < 0 ? 3 : 0);
  if (G.dir === 1) RT.faceL = true; else if (G.dir === 2) RT.faceL = false;
  const m = MAPS[G.map];
  // đang đi xe: không cho chạy từ đường vào chỗ không phải đường (sân, cỏ, công viên…)
  const offRoad = (x, y) => G.ride && rideOk(m, G.x, G.y) && !rideOk(m, x, y);
  const warn = () => { const t = performance.now(); if (t - (RT.rideWarn || 0) > 2500) { RT.rideWarn = t; UI.toast('Chỉ chạy xe trên đường. Bấm X để xuống xe rồi đi bộ vào.', 'info'); } };
  if (vx) { if (offRoad(G.x + vx, G.y)) warn(); else if (!blocked(m, G.x + vx, G.y)) G.x += vx; }
  if (vy) { if (offRoad(G.x, G.y + vy)) warn(); else if (!blocked(m, G.x, G.y + vy)) G.y += vy; }
  RT.walkT = (RT.walkT < 0 ? 0 : RT.walkT) + dt;
  for (const w of m.warps) if (G.dir === w.dir && G.x >= w.x && G.x < w.x + w.w && G.y >= w.y && G.y < w.y + w.h) {
    const no = w.gate && w.gate();          // cửa có điều kiện (vd. nhà vệ sinh nam / nữ)
    if (no) { G.y = w.y + w.h + 1; for (const k in KEYS) KEYS[k] = false; UI.toast(no, 'bad'); return; }
    doWarp(w); return;
  }
  for (const z of m.zones) if (G.x >= z.x && G.x < z.x + z.w && G.y >= z.y && G.y < z.y + z.h) { G.x += z.bx || 0; G.y += z.by || 0; for (const k in KEYS) KEYS[k] = false; z.fn(); return; }
}
async function doWarp(w) {
  if (G.ride) { if (w.to.map === 'home') { G.ride = null; G.park = null; UI.toast('Dựng xe ngoài sân rồi vào nhà.'); } else dismount(true); }   // không đi xe vào trong nhà / lớp
  RT.lock = true; await UI.fade(true, 110);
  setMap(w.to.map, w.to.x, w.to.y, w.to.dir);
  await UI.fade(false, 110); RT.lock = false;
  if (w.to.map === 'home') onEnterHome();
}
// Chuyển động theo kịch bản của hoạt cảnh: nhân vật / diễn viên đi tới một điểm, hoặc nhảy lên (hop)
function stepScene(dt) {
  const sc = RT.scene; if (!sc) return;
  const dm = sc.drive ? sc.drive(dt) : false;          // cảnh tự điều khiển nhân vật (vd. nhập vào tụ chơi)
  if (sc.yard) followBubble();
  if (!sc.tw || !sc.tw.length) { sc.meMove = dm; if (dm) RT.walkT = (RT.walkT < 0 ? 0 : RT.walkT) + dt; return; }
  let meMove = dm;
  for (const t of sc.tw) {
    t.t += dt * 1000; const k = Math.min(1, t.t / t.ms), e = t.who;
    const x = t.x0 + (t.x1 - t.x0) * k, y = t.y0 + (t.y1 - t.y0) * k, oy = t.hop ? -t.hop * Math.sin(Math.PI * k) : 0;
    const dx = t.x1 - t.x0, dy = t.y1 - t.y0, moving = !!(dx || dy);
    const dir = !moving || t.keep ? null : Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0);
    if (e === 'me') { G.x = x; G.y = y; sc.meOy = oy; if (dir !== null) G.dir = dir; if (moving && !t.hop) { RT.walkT = (RT.walkT < 0 ? 0 : RT.walkT) + dt; meMove = true; } }
    else { e.x = x; e.y = y; e.oy = oy; if (dir !== null) e.dir = dir; e.walk = moving && !t.hop ? (e.walk >= 0 ? e.walk : 0) + dt : -1; }
    if (k >= 1) { t.done = true; if (e !== 'me') e.walk = -1; t.res(); }
  }
  sc.tw = sc.tw.filter(t => !t.done); sc.meMove = meMove;
}
function update(dt) {
  if (!G) return;
  stepScene(dt);
  const busy = RT.lock || UI.isOpen();
  if (!busy) {
    if (RT.forceSleep) { goSleep(true); return; }
    if (RT.pendingSkipEnd) { RT.pendingSkipEnd = false; if (RT.skip) { resolveSkip(false); return; } }
    if (RT.pendingClass) { const p = RT.pendingClass; RT.pendingClass = null; runClass(p); return; }
    if (RT.pendingEvent) { const e = RT.pendingEvent; RT.pendingEvent = null; if (G.atSchool && inWin(G.time, AM_END, PM_START - 20)) { runLunchEvent(e); return; } }
    if (RT.pendingInvite) { const inv = RT.pendingInvite; RT.pendingInvite = null; if (yardTime()) { showInvite(inv); return; } }
    if (eventTick()) return;                       // Tết, giao thừa, thi gói bánh chưng
    movePlayer(dt); lifeTick();
    RT.tickAcc += dt;
    if (RT.tickAcc >= G.speed) { RT.tickAcc = 0; advanceTime(CFG.TICK_MIN); }
    scanTargets();
    const t = RT.hover || RT.near;
    if (t) UI.hint(RT.hold && (t.npc || t.fol) ? `${PARENT_ITEMS[RT.hold] || GROUP_ITEMS[RT.hold] ? 'Đưa' : 'Tặng'} ${holdName(RT.hold).toLowerCase()} cho ${(t.npc && t.npc.name) || 'bạn'}` : (t.label ? t.label() : ''), inRange(t));
    else if (RT.hold) UI.hint(`Đang cầm ${holdName(RT.hold).toLowerCase()}${FOODS[RT.hold] ? ' — bấm vào mình để ăn' : ''}`, true);
    else UI.hint(null);
  } else { if (!(RT.scene && RT.scene.meMove)) RT.walkT = -1; UI.hint(null); }
  updateFamily(dt, busy);
  leaveTick();                                     // tan học: các bạn đi bộ ra cổng
  updateNpcs(dt, busy);
  updateFollower(dt, busy);
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
function drawChar(look, outfit, x, y, dir, walkT, oy) {
  const sh = charSheet(look, outfit), fr = charFrame(sh, dir, walkT);
  const bob = walkT >= 0 && (Math.floor(walkT * 8) % 2 === 1) ? -1 : 0;
  drawSpr(SHADOW, x - 7, y - 3); drawSpr(fr, x - 9, y - 23 + bob + (oy || 0));
}
// Người ngồi trên xe (xe đạp, xe đạp điện, xe máy): vẽ xe rồi vẽ người lệch lên trên
function drawRider(look, outfit, veh, x, y, left, pal) {
  drawSpr(SHADOW, x - 7, y - 3); drawSpr(SPR[veh + (left ? 'L' : '')], x - 15, y - 19);
  if (pal) drawSpr(charSheet(pal, friendOutfit(pal))[left ? 1 : 2][0], x - 9 + (left ? 9 : -9), y - 30);     // bạn ngồi sau xe
  drawSpr(charSheet(look, outfit)[left ? 1 : 2][0], x - 9 + (left ? 2 : -2), y - 31);
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
    if (!(RT.scene && RT.scene.hideMe)) list.push({ b: G.y, p: 1 });
    if (G.park && !G.park.shed && G.park.map === G.map) list.push({ b: G.park.y, v: G.park });
    if (G.comp && RT.fol && !RT.scene && !G.ride) list.push({ b: RT.fol.y - 0.5, f: RT.fol });
  }
  list.sort((p, q) => p.b - q.b);
  for (const e of list) {
    if (e.o) drawSpr(e.o.dyn ? SPR[e.o.dyn()] : SPR[e.o.s], e.o.x, e.o.y);
    else if (e.n && e.n.fam && FAM[e.n.fam].riding) {   // bố mẹ đang chạy xe
      const n = e.n, left = n.cdir === 1, b = SPR[BIKE[n.fam].spr + (left ? 'L' : '')];
      drawSpr(SHADOW, n.cx - 7, n.cy - 3); drawSpr(b, n.cx - 16, n.cy - 21);
      drawSpr(charSheet(n.look, n.outfit ? n.outfit() : null)[left ? 1 : 2][0], n.cx - 9 + (left ? 2 : -2), n.cy - 32);
    }
    else if (e.n) drawChar(e.n.dynLook ? e.n.dynLook() : e.n.look, e.n.outfit ? e.n.outfit() : null, e.n.cx, e.n.cy, e.n.cdir, e.n.walk, e.n.coy);
    else if (e.a) { if (!e.a.hidden) drawChar(e.a.look, e.a.outfit, e.a.x, e.a.y, e.a.dir, e.a.walk === undefined ? -1 : e.a.walk, e.a.oy); }
    else if (e.v) drawSpr(SPR[VEHICLES[e.v.id].spr], e.v.x - 15, e.v.y - 19);
    else if (e.f) drawChar(G.comp.fid, friendOutfit(G.comp.fid), e.f.x, e.f.y, e.f.dir, e.f.walk);
    else if (G.ride && !RT.scene) drawRider(G.gender, RT.outfit || (schoolToday() || hkUniform() ? null : 'casual'), VEHICLES[G.ride].spr, G.x, G.y, !!RT.faceL, G.comp ? G.comp.fid : null);
    else drawChar(G.gender, RT.outfit || (schoolToday() || hkUniform() ? null : 'casual'), G.x, G.y, G.dir, RT.walkT, RT.scene && RT.scene.meOy);
  }
  // đạo cụ của đoạn cắt cảnh (yoyo, con quay, bài, gương soi…) vẽ đè lên nhân vật
  if (G && RT.scene && RT.scene.props && G.map === RT.scene.map) for (const p of RT.scene.props) p(now);
  if (G && (!RT.scene || RT.scene.yard)) drawYardProps(now);
  if (G) { drawFestProps(now); drawBcProps(now); drawTTProps(now); drawHkProps(now); drawTaskMarkers(now); }
  if (G) drawHeld(now);                           // món đang cầm trên tay
  for (const o of m.objs) if (o.smoke && (!o.vis || o.vis())) smokeProp(now, o.x + o.smoke[0], o.y + o.smoke[1]);   // khói nhang        // bài, con quay, bóng, cầu… của các tụ chơi ngoài sân
  // biển hiệu (chữ nét)
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const l of m.labels) { if (l.vis && !l.vis()) continue; ctx.font = `800 ${l.size * S}px "Baloo 2", system-ui, sans-serif`; ctx.fillStyle = l.col; ctx.fillText(l.text, VIEW.ox + l.x * S, VIEW.oy + l.y * S, l.maxw * S); }
  // sáng / tối theo giờ
  if (G) { const a = nightAlpha(G.time) * (m.indoor ? 0.4 : 1); if (a > 0.01) { ctx.fillStyle = `rgba(22,20,74,${a})`; ctx.fillRect(0, 0, cv.width, cv.height); } }
  // quầng sáng đèn đường ban đêm
  if (G && !m.indoor) { const a = nightAlpha(G.time); if (a > 0.05) { ctx.globalCompositeOperation = 'lighter'; for (const o of m.objs) { if (o.s !== 'lamp' && !(o.glow && (!o.vis || o.vis()))) continue; const X = VIEW.ox + (o.x + 6) * S, Y = VIEW.oy + (o.y + 8) * S, g = ctx.createRadialGradient(X, Y, 0, X, Y, 52 * S); g.addColorStop(0, `rgba(255,214,130,${0.55 * a * 2})`); g.addColorStop(1, 'rgba(255,214,130,0)'); ctx.fillStyle = g; ctx.fillRect(X - 52 * S, Y - 52 * S, 104 * S, 104 * S); } ctx.globalCompositeOperation = 'source-over'; } }
  if (G && RT.scene && RT.scene.glow) for (const p of RT.scene.glow) p(now);   // pháo hoa: vẽ sau lớp tối ban đêm cho sáng rực
  if (G) drawTTGlow(now);                         // trăng rằm, ánh đèn ông sao đêm Trung thu
  // cắt cảnh: hai dải đen kiểu phim + tên cảnh + bong bóng thoại
  if (G && RT.scene && RT.scene.type === 'cut') {
    const bh = RT.scene.bars === false ? 0 : Math.round(cv.height * 0.085);
    if (bh) { ctx.fillStyle = '#15121f'; ctx.fillRect(0, 0, cv.width, bh); ctx.fillRect(0, cv.height - bh, cv.width, bh); }
    if (bh && RT.scene.title) { ctx.font = `700 ${Math.max(12, Math.round(bh * 0.36))}px "Baloo 2", system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff6e3'; ctx.fillText(RT.scene.title, cv.width / 2, cv.height - bh / 2); }
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
    // chữ cái lấy theo vị trí phím: bộ gõ tiếng Việt (Telex: x = dấu ngã, s = dấu sắc…) không làm mất phím
    const k = e.code && /^Key[A-Z]$/.test(e.code) ? e.code.slice(3).toLowerCase() : e.key.toLowerCase(); KEYS[k] = true;
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    if (e.repeat) return;
    if (k === 'q') turnToFriend();                  // trong giờ học: quay sang bạn
    if (k === 'e' || k === ' ' || k === 'enter') { scanTargets(); doInteract(RT.near || RT.hover); }
    else if (k === 'b') openMenu('bag'); else if (k === 'c') openMenu('stats'); else if (k === 'f') openMenu('friends'); else if (k === 't') openMenu('tt'); else if (k === 'g') openMenu('grades'); else if (k === 'k') openMenu('cards'); else if (k === 'n') openMenu('map'); else if (k === 'j') openMenu('quest');
    else if (k === 'p') openMenu('phone'); else if (k === 'l') openMenu('cal'); else if (k === 'x') { if (G.ride && !RT.lock) dismount(); } else if (k === 'escape' || k === 'm') openMenu('menu');
  });
  window.addEventListener('keyup', e => { KEYS[e.key.toLowerCase()] = false; if (e.code && /^Key[A-Z]$/.test(e.code)) KEYS[e.code.slice(3).toLowerCase()] = false; });
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
<li>Buổi sáng: ăn sáng trong bếp, <b>soạn sách ở bàn học</b> theo thời khoá biểu, rồi đến trường <b>trước 08:00</b>.</li>
      <li>Thành phố: <b>nhà mình</b> bên trái — <b>phố Hoa Phượng</b> ở giữa — <b>trường</b> bên phải. Đi bộ dọc đường sang phải (khoảng 1 tiếng), hoặc ra <b>trạm xe bus</b> bấm vào xe để lên xe rồi chọn điểm đến. Có xe đạp thì bấm vào xe ở sân nhà để đi (<kbd>X</kbd> để xuống xe).</li>
      <li>Bố mẹ đi làm lúc 07:30 — muốn nhờ chở phải hỏi trước 07:20. Đến nơi nhớ <b>đi qua cổng trường</b> để vào lớp.</li>
      <li>Trò chuyện, đấm lưng, phụ việc nhà để bố mẹ vui. Ngày đi học nhớ về nhà trước 20:00 (hoặc xin phép); thứ 7, chủ nhật thì thoải mái.</li>
      <li>Phố Hoa Phượng có trà sữa, TTTM, khu game; đi xuống là <b>bờ sông</b> (câu cá), đi lên là <b>ga tàu</b> ra biển. <b>Núi</b> ở sau trường: theo lối mòn bên phải cổng trường.</li>
      <li>Trong lớp cứ để yên là chăm chú nghe giảng; muốn quay sang bạn thì bấm <kbd>Q</kbd> lúc thầy cô đang giảng. Giờ ra chơi, bấm vào bạn để nói chuyện hoặc rủ trốn học.</li>
      <li><kbd>Esc</kbd> hoặc <kbd>M</kbd> mở menu (chỉ số, bạn bè, thời khoá biểu, học bạ, lịch, thẻ, cài đặt) · <kbd>B</kbd> túi đồ · <kbd>P</kbd> điện thoại. Game tự lưu mỗi khi bạn đi ngủ.</li></ul>`, ['Bắt đầu']).then(() => morningBrief());
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
