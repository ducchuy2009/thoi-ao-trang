'use strict';
/* ============================================================
 *  04m. TRÒ CHƠI DẠNG CẮT CẢNH (thay các mini-game khung riêng của môn thực hành và sự kiện)
 *  Diễn ngay trong cảnh đang có (phòng thí nghiệm, sân tập, phố, sân trường): bạn bè, thầy cô ở nguyên chỗ, bảng điểm ở trên màn hình.
 *  Trò cần nhìn rõ đồ vật thì mở KHUNG CẬN CẢNH phóng to giữa màn hình (nền bản đồ tối đi):
 *  - TH Lý: ném xiên qua bức tường vào rổ (labThrow) · TH Hoá: rót hoá chất đúng liều (labMix)
 *  - TH Sinh: soi kính hiển vi tìm vi sinh vật (labMicro) · Quốc phòng: lắp súng AK mô hình theo thứ tự (qpAssemble)
 *  - Trung thu: làm đèn ông sao (sceneLantern) · Hội gói bánh chưng: khuôn bánh ở giữa, kéo nguyên liệu hai bên vào (sceneBanhChung)
 *  Trò vận động thì diễn thẳng trên bản đồ: tâng cầu / tâng bóng (sceneKeepup), bịt mắt đập niêu (sceneNieu)
 *  Esc: bỏ qua (điểm thấp như mini-game cũ). Kết quả trả về giống playGame(): { score: 0..1, skipped }.
 * ============================================================ */
// trò nào đã có cảnh thì dùng cảnh, còn lại vẫn dùng mini-game khung riêng
async function playScene(kind, diff, a, b) {
  const f = { physics: labThrow, mix: labMix, micro: labMicro, jigsaw: qpAssemble, keepup: sceneKeepup, denlong: sceneLantern, dapnieu: sceneNieu }[kind];
  return f ? f(diff || 2, a, b) : playGame(kind, diff, a, b);
}
// Khung chung: giữ nguyên cảnh đang diễn (tiết học có bạn bè, thầy cô), thêm đạo cụ, chơi xong trả lại cảnh cũ
// o: { map, me:[x,y,dir], cam, title, actors, props, glow, intro(base) → bước, play(sc, base, esc) → điểm, outro(base, điểm) → bước, bot, key, tap, btn }
async function stageGame(o) {
  const prev = RT.scene, back = { map: G.map, x: G.x, y: G.y, dir: G.dir }, move = !!o.map && o.map !== G.map, fade = move || !!o.fade;
  if (fade) await UI.fade(true);
  if (move) setMap(o.map, o.me[0], o.me[1], o.me[2]);
  else if (o.me) { G.x = o.me[0]; G.y = o.me[1]; G.dir = o.me[2]; }
  const keep = prev && prev.actors && prev.map === G.map ? prev.actors.map(a => Object.assign({}, a)) : [];
  const sc = RT.scene = { type: 'cut', map: G.map, actors: keep.concat(o.actors || []), cam: o.cam, props: (prev && prev.props && prev.map === G.map ? prev.props : []).concat(o.props || []), glow: o.glow || null,
    hide: (o.hide || []).concat(prev && prev.hide ? prev.hide : []), bubble: null, title: o.title, tw: [], bars: false,
    stage: prev && prev.map === G.map ? prev.type : null, kind: prev && prev.kind };            // giữ hoạt cảnh của tiết học (bạn bè tâng cầu, lắp súng…) — classProps
  const base = keep.length;
  UI.hint(null);
  if (fade) await UI.fade(false);
  let score = 0, skipped = false;
  try {
    for (const st of (o.intro ? o.intro(base) : [])) await runStep(st, {});
    if (UI._mgBot) score = typeof o.bot === 'function' ? o.bot() : (o.bot === undefined ? 0.8 : o.bot);
    else {
      let esc = false;
      arenaOpen(k => { if (k === 'escape') esc = true; else if (o.key) o.key(k); }, o.tap || null, o.btn);
      score = await o.play(sc, base, () => esc);
      if (esc) { skipped = true; score = 0.35; }
    }
  } finally { arenaClose(); sc.drive = null; }
  sc.bubble = null;
  if (o.outro) for (const st of o.outro(base, score)) await runStep(st, {});
  if (fade) await UI.fade(true);
  RT.scene = prev;
  if (move) setMap(back.map, back.x, back.y, back.dir);
  else { G.x = back.x; G.y = back.y; G.dir = back.dir; }                                       // chơi xong đứng lại chỗ cũ
  if (fade) await UI.fade(false);
  return { score: clamp(score, 0, 1), skipped };
}
const sgSay = (sc, i, text, s) => { const a = i === 'me' ? G : sc.actors[i]; if (!a) return; sc.bubble = { x: a.x, y: a.y - 27, text }; sc._bt = s || 1.6; };
const sgBubble = (sc, dt) => { if (sc._bt !== undefined) { sc._bt -= dt; if (sc._bt <= 0) { sc.bubble = null; sc._bt = undefined; } } };
const toWorld = e => [(e.clientX * VIEW.dpr - VIEW.ox) / VIEW.S, (e.clientY * VIEW.dpr - VIEW.oy) / VIEW.S];
// bắt chuột / chạm trên bản đồ trong lúc chơi; trả về hàm gỡ
function sgPointer(down, move, up, map) {
  const W = map || toWorld;                                                     // toWorld: toạ độ bản đồ · cuPt: toạ độ trong khung cận cảnh
  const d = e => { if (UI.isOpen()) return; e.preventDefault(); e.stopPropagation(); down && down(W(e)); };
  const m = e => { move && move(W(e)); }, u = e => { up && up(W(e)); };
  cv.addEventListener('pointerdown', d, true); window.addEventListener('pointermove', m, true); window.addEventListener('pointerup', u, true);
  return () => { cv.removeEventListener('pointerdown', d, true); window.removeEventListener('pointermove', m, true); window.removeEventListener('pointerup', u, true); };
}
const labTeacher = () => (RT.scene && RT.scene.actors && RT.scene.actors.length ? RT.scene.actors.length - 1 : -1);   // trong tiết thực hành: cô giáo đứng cuối danh sách
const inLab = () => G.map === 'lab';
const LABME = () => [LAB_SPOT.x, LAB_SPOT.y, 3];

/* ============================================================
 *  CẬN CẢNH: khung 240×135 phóng to giữa màn hình (nền bản đồ tối đi, bạn bè / thầy cô vẫn ở phía sau)
 *  Dùng cho các trò cần nhìn rõ đồ vật: ném xiên, pha chế, lắp súng, làm đèn ông sao, gói bánh chưng.
 *  draw(c, T, now): vẽ lên khung nhỏ bằng gR(...) · T.text(chữ, x, y, cỡ, màu, viền) ghi chữ nét (vẽ sau, không bị vỡ hạt)
 * ============================================================ */
const CUW = 240, CUH = 135;
let cuCv = null;
function cuBox() {
  const d = VIEW.dpr, W = cv.width, H = cv.height, top = Math.min(H * 0.24, 166 * d), bot = Math.min(H * 0.12, 84 * d), side = 12 * d;
  let k = Math.min((W - side * 2) / CUW, (H - top - bot) / CUH);
  if (k >= 2) k = Math.floor(k);
  const w = CUW * k, h = CUH * k;
  return { k, x: Math.round((W - w) / 2), y: Math.round(top + (H - top - bot - h) / 2), w, h };
}
const cuPt = e => { const B = cuBox(), d = VIEW.dpr; return [(e.clientX * d - B.x) / B.k, (e.clientY * d - B.y) / B.k]; };
const cuIn = p => p[0] >= 0 && p[0] <= CUW && p[1] >= 0 && p[1] <= CUH;
function cuLayer(draw) {
  if (!cuCv) { cuCv = document.createElement('canvas'); cuCv.width = CUW; cuCv.height = CUH; }
  const texts = [], T = { text: (s, x, y, size, col, stroke, align) => texts.push([s, x, y, size, col, stroke, align]) };
  return now => {
    const c = cuCv.getContext('2d'); c.imageSmoothingEnabled = false; c.clearRect(0, 0, CUW, CUH); texts.length = 0;
    draw(c, T, now);
    const B = cuBox(), d = VIEW.dpr;
    ctx.save();
    ctx.fillStyle = 'rgba(15,12,25,0.62)'; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = '#2a2136'; ctx.fillRect(B.x - 7 * d, B.y - 7 * d, B.w + 14 * d, B.h + 14 * d);
    ctx.fillStyle = '#c9a467'; ctx.fillRect(B.x - 4 * d, B.y - 4 * d, B.w + 8 * d, B.h + 8 * d);
    ctx.imageSmoothingEnabled = false; ctx.drawImage(cuCv, B.x, B.y, B.w, B.h);
    ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    for (const [s, x, y, size, col, stroke, align] of texts) {
      ctx.font = `800 ${Math.max(10, Math.round(size * B.k))}px "Baloo 2", system-ui, sans-serif`; ctx.textAlign = align || 'center';
      const X = B.x + x * B.k, Y = B.y + y * B.k;
      if (stroke !== null) { ctx.lineWidth = Math.max(2.5, B.k * 1.1); ctx.strokeStyle = stroke || '#2a2136'; ctx.strokeText(s, X, Y); }
      ctx.fillStyle = col || '#fff6e3'; ctx.fillText(s, X, Y);
    }
    ctx.restore();
  };
}
// chơi trong khung cận cảnh: o.tick(dt) trả về điểm khi xong (undefined khi đang chơi) · o.down / move / up(điểm trong khung) · o.keyup(e) · o.btnUp()
function cuPlay(sc, o, esc) {
  return new Promise(res => {
    sc.glow = [cuLayer(o.draw)];
    const off = sgPointer(o.down, o.move, o.up, cuPt);
    const ku = o.keyup || null; if (ku) window.addEventListener('keyup', ku, true);
    const bu = o.btnUp || null; if (bu && ARENA.b) ARENA.b.addEventListener('pointerup', bu);
    liveLoop(sc, dt => {
      sgBubble(sc, dt);
      const r = esc() ? 0 : o.tick(dt), done = esc() || (r !== undefined && r !== false);
      if (done) { off(); if (ku) window.removeEventListener('keyup', ku, true); if (bu && ARENA.b) ARENA.b.removeEventListener('pointerup', bu); sc.glow = null; res(r || 0); }
      return done;
    });
  });
}
const cuBench = (c, top) => {                                  // tường phòng thí nghiệm + mặt bàn
  gR(c, '#dfe9ee', 0, 0, CUW, top); for (let x = 12; x < CUW; x += 24) gR(c, '#d5e1e8', x, 0, 1, top);
  gR(c, '#c7d4dc', 0, 16, CUW, 2);
  gR(c, '#8a5a3a', 0, top, CUW, CUH - top); gR(c, '#a9703f', 0, top, CUW, 3); gR(c, '#6f472c', 0, CUH - 3, CUW, 3);
};
// bình tam giác (lọ hoá chất): đáy rộng, cổ hẹp
function cuFlask(c, x, y, col, lvl) {
  gR(c, '#2a2136', x - 3, y - 27, 7, 1);
  for (let i = 0; i < 26; i++) {
    const w = i < 8 ? 5 : Math.min(19, 5 + (i - 8) * 1.2), xx = x - w / 2;
    gR(c, '#2a2136', xx - 1, y - 26 + i, w + 2, 1);
    gR(c, i >= 26 - lvl ? col : '#eef7fb', xx, y - 26 + i, w, 1);
  }
  gR(c, '#2a2136', x - 10, y, 21, 1); gR(c, 'rgba(255,255,255,0.6)', x - 4, y - 14, 1, 8);
}

/* ============================================================
 *  TH LÝ — NÉM XIÊN (cận cảnh nhìn ngang): bệ phóng bên trái, bức tường gạch ở giữa, rổ phía sau tường
 *  W / S (↑ ↓, A / D, hoặc rê chuột) chỉnh góc · giữ SPACE / chuột / nút BẮN để lấy lực, thả ra để bắn
 * ============================================================ */
async function labThrow(d) {
  const F = 108, L = [36, F - 6], WX = 118, wh = 30 + d * 6, BX = 176 + d * 7, bw = Math.max(16, 26 - d * 2), shots = 3 + (d >= 4 ? 1 : 0), need = d <= 2 ? 1 : d <= 4 ? 2 : 3, g = 260;
  const st = { ang: 45, pow: 0, ch: false, chT: 0, ball: null, trail: [], old: [], hits: 0, miss: 0, left: shots, msg: '', fin: 0, t: 0, flash: 0, sink: null };
  const charge = () => { if (!st.ball && !st.fin && st.left > 0) { st.ch = true; st.chT = 0; } };
  const fire = () => {
    if (!st.ch) return; st.ch = false;
    const a = st.ang * Math.PI / 180, v = 95 + 150 * st.pow;
    st.ball = { x: L[0] + Math.cos(a) * 18, y: L[1] - Math.sin(a) * 18, vx: v * Math.cos(a), vy: -v * Math.sin(a) }; st.trail = []; st.left--; st.msg = '';
  };
  const endShot = (ok, why) => { st.old.unshift(st.trail); st.old.length = Math.min(st.old.length, 2); st.ball = null; if (ok) { st.hits++; st.flash = 1.1; } else { st.miss++; st.msg = why; } };
  const draw = (c, T) => {
    cuBench(c, F);
    for (let x = 20; x < CUW; x += 20) gR(c, '#9fb2bd', x, F - 4, 1, 4);                       // thước đo trên tường
    for (const tr of st.old) for (let i = 0; i < tr.length; i += 2) gR(c, 'rgba(59,130,196,0.28)', tr[i][0], tr[i][1], 1, 1);
    // bức tường gạch
    for (let y = F - wh, r = 0; y < F; y += 5, r++) { gR(c, '#b5533c', WX - 5, y, 11, 4); gR(c, '#8f3f2c', WX - 5, y + 4, 11, 1); gR(c, '#8f3f2c', WX + (r % 2 ? -2 : 2), y, 1, 4); }
    gR(c, '#7a8a96', WX - 6, F - wh - 2, 13, 2);
    // rổ lưới
    const bx = Math.round(BX - bw / 2);
    if (st.sink) gR(c, '#3b82c4', st.sink.x - 2, st.sink.y - 2, 4, 4);
    gR(c, '#2a2136', bx - 1, F - 16, 1, 16); gR(c, '#2a2136', bx + bw, F - 16, 1, 16);
    for (let x = bx + 2; x < bx + bw; x += 3) gR(c, 'rgba(255,255,255,0.75)', x, F - 14, 1, 14);
    for (let y = F - 11; y < F; y += 4) gR(c, 'rgba(255,255,255,0.75)', bx, y, bw, 1);
    gR(c, '#e98a3c', bx - 1, F - 17, bw + 2, 2);
    if (st.flash > 0) T.text('VÀO RỔ!', BX, F - 30 - (1.1 - st.flash) * 10, 9, '#8fd067');
    // bệ phóng: nòng xoay theo góc
    const a = st.ang * Math.PI / 180;
    c.save(); c.translate(L[0], L[1]); c.rotate(-a); c.fillStyle = '#2a2136'; c.fillRect(-1, -4, 20, 8); c.fillStyle = '#4a5068'; c.fillRect(0, -3, 18, 6); c.fillStyle = '#8b8f9c'; c.fillRect(15, -3, 3, 6); c.restore();
    gR(c, '#2a2136', L[0] - 11, L[1] - 1, 22, 9); gR(c, '#5f656f', L[0] - 10, L[1], 20, 7); gR(c, '#e2574c', L[0] - 2, L[1] - 3, 5, 5);
    if (!st.ball && !st.fin) for (let i = 1; i <= 6; i++) gR(c, '#2a2136', L[0] + Math.cos(a) * (20 + i * 7) - 1, L[1] - Math.sin(a) * (20 + i * 7) - 1, 2, 2);   // đường ngắm
    // thanh lực
    gR(c, '#2a2136', 8, 36, 8, 66); gR(c, '#fff6e3', 9, 37, 6, 64); const ph = Math.round(st.pow * 62); gR(c, st.pow > 0.85 ? '#e2574c' : st.pow > 0.5 ? '#f2c94c' : '#5fae4a', 10, 100 - ph, 4, ph);
    T.text('LỰC', 12, 30, 5, '#2a2136', '#fff6e3');
    T.text(`${Math.round(st.ang)}°`, L[0] + 2, F + 15, 7);
    // quả cầu
    for (const p of st.trail) gR(c, 'rgba(59,130,196,0.55)', p[0], p[1], 1, 1);
    if (st.ball) { gR(c, '#2a2136', st.ball.x - 3, st.ball.y - 3, 6, 6); gR(c, '#3b82c4', st.ball.x - 2, st.ball.y - 2, 4, 4); gR(c, '#9cc8ec', st.ball.x - 2, st.ball.y - 2, 2, 2); }
    else if (st.left > 0 && !st.fin) { gR(c, '#3b82c4', L[0] + Math.cos(a) * 19 - 2, L[1] - Math.sin(a) * 19 - 2, 4, 4); }
    for (let i = 0; i < shots; i++) { gR(c, '#2a2136', 196 + i * 10, 6, 7, 7); gR(c, i < st.left ? '#3b82c4' : '#b9b2a6', 197 + i * 10, 7, 5, 5); }
    T.text(`Lọt rổ ${st.hits}/${need}`, 120, 9, 8, '#2a2136', '#fff6e3');
    if (st.msg) T.text(st.msg, 120, 24, 6, '#e2574c', '#fff6e3');
  };
  const tick = dt => {
    st.t += dt; st.flash = Math.max(0, st.flash - dt);
    if (st.sink) { st.sink.y += 60 * dt; if (st.sink.y > F - 3) st.sink = null; }
    if (!st.ball) {
      if (KEYS.w || KEYS.arrowup || KEYS.a || KEYS.arrowleft) st.ang = clamp(st.ang + 35 * dt, 10, 80);
      if (KEYS.s || KEYS.arrowdown || KEYS.d || KEYS.arrowright) st.ang = clamp(st.ang - 35 * dt, 10, 80);
    }
    if (st.ch) { st.chT += dt; st.pow = 1 - Math.abs(1 - (st.chT / 0.9) % 2); }
    if (st.ball) {
      const b = st.ball; b.vy += g * dt; b.x += b.vx * dt; b.y += b.vy * dt; st.trail.push([b.x, b.y]);
      if (b.x > WX - 7 && b.x < WX + 7 && b.y > F - wh - 4) endShot(false, 'Đập vào tường rồi — ném cao hơn!');
      else if (b.vy > 0 && b.y >= F - 17 && b.y <= F - 8 && Math.abs(b.x - BX) <= bw / 2 - 1) { st.sink = { x: b.x, y: b.y }; endShot(true); }
      else if (b.y >= F - 3) endShot(false, b.x < BX ? 'Rơi trước rổ — mạnh tay hơn!' : 'Bay quá rổ — nhẹ tay hơn!');
      else if (b.x > CUW + 6 || b.x < -6) endShot(false, 'Bay quá rổ — nhẹ tay hơn!');
    }
    if (!st.fin && !st.ball && (st.hits >= need || st.left <= 0)) st.fin = st.t;
    arenaText(`<b>Thí nghiệm ném xiên</b><div class="sc">Lọt rổ <i>${st.hits}/${need}</i> · còn ${st.left} lượt</div><small>W/S (↑ ↓ hoặc rê chuột) chỉnh góc · giữ SPACE / chuột / nút BẮN lấy lực, thả ra để bắn</small>`);
    if (st.fin && st.t - st.fin > 1) return st.hits >= need ? (st.miss === 0 ? 1 : 0.8) : 0.5 * st.hits / need;
  };
  return stageGame({ map: 'lab', me: LABME(), cam: { x: 158, y: 118 }, title: 'Thí nghiệm ném xiên', btn: 'BẮN',
    intro: () => { const t = labTeacher(); return t >= 0 ? [{ say: [t, `Chỉnh góc, canh lực ném quả cầu qua bức tường vào rổ. Cần lọt ${need} lần trong ${shots} lượt.`] }] : []; },
    key: k => { if (k === ' ') charge(); }, tap: charge,
    bot: () => clamp(0.55 + 0.04 * lv('th_ly') - 0.05 * d + 0.15 * Math.random(), 0.3, 1),
    play: (sc, base, esc) => cuPlay(sc, { draw, tick,
      down: p => { if (cuIn(p)) charge(); },
      move: p => { if (cuIn(p) && !st.ball && p[0] > L[0] + 4) st.ang = clamp(Math.atan2(L[1] - p[1], p[0] - L[0]) * 180 / Math.PI, 10, 80); },
      up: fire, keyup: e => { if (e.code === 'Space') fire(); }, btnUp: fire }, esc),
    outro: (b, s) => [{ say: ['me', s >= 0.6 ? 'Thí nghiệm thành công!' : 'Chưa trúng đủ… về nhà tính lại góc.'] }] });
}

/* ============================================================
 *  TH HOÁ — PHA CHẾ (cận cảnh): cốc chia vạch to ở giữa, 4 bình hoá chất hai bên
 *  Bấm / kéo bình vào cốc (hoặc 1–4, ← →) rồi GIỮ để rót, thả ra khi mực chất lỏng chạm vạch đỏ
 * ============================================================ */
const CHEMS = [['Dung dịch A', '#3b82c4'], ['Dung dịch B', '#e2574c'], ['Dung dịch C', '#5fae4a'], ['Dung dịch D', '#f2c94c']];
async function labMix(d) {
  const nStep = 2 + Math.floor(d / 2), tol = Math.max(2, 5 - d * 0.5 + lv('th_hoa') * 0.3), steps = [];
  let total = 0;
  for (let i = 0; i < nStep; i++) { const ml = 5 * (2 + Math.floor(Math.random() * Math.min(7, (95 - total) / 5 - 2))); steps.push({ k: (i + Math.floor(Math.random() * 4)) % 4, ml }); total += ml; }
  const F = 112, FX = [26, 58, 182, 214], BX = 120, BB = 106, PX = 0.68;           // vị trí 4 bình · cốc: tâm x, đáy y, số px mỗi ml
  const st = { sel: 0, i: 0, poured: 0, layers: [], pouring: false, errs: 0, acc: 0, msg: '', fin: 0, t: 0, held: false, pk: {} };
  const sumMl = () => st.layers.reduce((a, L) => a + L.ml, 0);
  const startPour = () => { if (!st.fin && st.i < steps.length) st.pouring = true; };
  const stop = () => {
    if (!st.pouring) return; st.pouring = false;
    const S = steps[st.i], err = Math.abs(st.poured - S.ml);
    if (st.sel !== S.k) { st.errs++; st.msg = `Rót nhầm ${CHEMS[st.sel][0]}! Phải là ${CHEMS[S.k][0]}.`; }
    else if (err <= tol) { st.acc += 1 - err / (tol * 2); st.msg = `Chuẩn! ${Math.round(st.poured)} ml.`; }
    else { st.errs++; st.msg = st.poured > S.ml ? `Rót quá tay (${Math.round(st.poured)} ml)!` : `Chưa đủ (${Math.round(st.poured)} ml)!`; }
    st.layers.push({ k: st.sel, ml: st.poured }); st.poured = 0; st.i++;
    if (st.i >= steps.length) st.fin = st.t;
  };
  const draw = (c, T, now) => {
    cuBench(c, F);
    // cốc chia vạch 0–100 ml
    const top = BB - 100 * PX, l = BX - 20, r = BX + 20;
    gR(c, '#2a2136', l - 2, top - 3, 2, BB - top + 5); gR(c, '#2a2136', r, top - 3, 2, BB - top + 5); gR(c, '#2a2136', l - 2, BB + 1, 44, 2);
    gR(c, 'rgba(230,244,250,0.85)', l, top - 3, 40, BB - top + 4);
    let y = BB; for (const L of st.layers) { const h = L.ml * PX; gR(c, CHEMS[L.k][1], l, y - h, 40, h); y -= h; }
    if (st.poured) { const h = st.poured * PX; gR(c, CHEMS[st.sel][1], l, y - h, 40, h); y -= h; }
    if (st.layers.length || st.poured) gR(c, 'rgba(255,255,255,0.45)', l, Math.round(y), 40, 1);
    gR(c, 'rgba(255,255,255,0.5)', l + 3, top, 2, BB - top - 4);
    for (let m = 10; m <= 100; m += 10) { gR(c, '#2a2136', r - 7, BB - m * PX, 7, 1); if (m % 20 === 0) T.text(String(m), r + 9, BB - m * PX, 5, '#2a2136', '#fff6e3'); }
    if (st.i < steps.length) { const ty = BB - (sumMl() + steps[st.i].ml) * PX; gR(c, '#e2574c', l - 9, ty, 58, 1); gR(c, '#e2574c', l - 9, ty - 1, 4, 3); T.text(`${steps[st.i].ml} ml`, l - 18, ty, 6, '#e2574c', '#fff6e3'); }
    // các bình: bình đang rót bay lên miệng cốc, nghiêng xuống
    for (let k = 0; k < 4; k++) {
      const lift = k === st.sel && st.pouring, x = FX[k];
      if (!lift) { cuFlask(c, x, F - 2, CHEMS[k][1], 13); T.text(String(k + 1), x, F + 10, 7); if (k === st.sel) { gR(c, '#ffd23a', x - 11, F + 1, 23, 2); } }
      else {
        c.save(); c.translate(BX + 24, top - 14); c.rotate(-1.92); cuFlask(c, 0, 13, CHEMS[k][1], 9); c.restore();         // nghiêng bình, miệng chúc xuống cốc
        for (let j = Math.round(top - 9); j < y; j += 2) gR(c, CHEMS[k][1], BX + 10 + ((j + Math.floor(now / 60)) % 4 < 2 ? 0 : 1), j, 2, 2);   // dòng chất lỏng chảy xuống
      }
    }
    // công thức (góc trái)
    steps.forEach((S, i) => T.text(`${i < st.i ? '✓' : i === st.i ? '▶' : '·'} ${S.ml} ml ${CHEMS[S.k][0].replace('Dung dịch ', '')}`, 6, 10 + i * 9, 6, i === st.i ? '#e2574c' : i < st.i ? '#3f8f3a' : '#2a2136', '#fff6e3', 'left'));
    T.text(`Đang rót: ${Math.round(st.poured)} ml`, 200, 10, 6, '#2a2136', '#fff6e3');
    if (st.msg) T.text(st.msg, 120, top - 20 < 6 ? 6 : 14, 6, /Chuẩn/.test(st.msg) ? '#3f8f3a' : '#e2574c', '#fff6e3');
  };
  const tick = dt => {
    st.t += dt;
    // ← → chọn bình (phím di chuyển đi qua KEYS)
    for (const [k, dd] of [['arrowleft', -1], ['a', -1], ['arrowright', 1], ['d', 1]]) { if (KEYS[k] && !st.pk[k] && !st.pouring) st.sel = (st.sel + dd + 4) % 4; st.pk[k] = !!KEYS[k]; }
    if (st.pouring) { st.poured += 15 * dt; if (st.poured > steps[st.i].ml + tol * 2.5) stop(); }
    const S = steps[st.i];
    arenaText(`<b>Pha chế hoá chất</b><div class="sc">Bước <i>${Math.min(st.i + 1, steps.length)}/${steps.length}</i>${S ? ` · ${S.ml} ml <span style="color:${CHEMS[S.k][1]}">${CHEMS[S.k][0]}</span>` : ''}</div><small>Bấm vào bình (hoặc 1–4, ← →) để chọn · GIỮ chuột / SPACE / nút RÓT để rót, thả ra khi chạm vạch đỏ</small>`);
    if (st.fin && st.t - st.fin > 1) return st.errs ? clamp(st.acc / steps.length * 0.7, 0, 0.59) : clamp(0.6 + 0.4 * st.acc / steps.length, 0.6, 1);
  };
  return stageGame({ map: 'lab', me: LABME(), cam: { x: 156, y: 116 }, title: 'Pha chế hoá chất', btn: 'RÓT',
    intro: () => { const t = labTeacher(); return t >= 0 ? [{ say: [t, `Rót lần lượt ${steps.map(s => `${s.ml} ml ${CHEMS[s.k][0].replace('Dung dịch ', '')}`).join(', ')}. Cẩn thận đừng rót quá tay!`] }] : []; },
    key: k => { if (/^[1-4]$/.test(k) && !st.pouring) st.sel = +k - 1; else if (k === ' ') startPour(); },
    tap: startPour,
    bot: () => clamp(0.55 + 0.04 * lv('th_hoa') - 0.05 * d + 0.15 * Math.random(), 0.3, 1),
    play: (sc, base, esc) => cuPlay(sc, { draw, tick,
      down: p => { if (!cuIn(p) || st.pouring) return; for (let k = 0; k < 4; k++) if (Math.abs(p[0] - FX[k]) < 12 && p[1] > F - 32 && p[1] < F + 14) { st.sel = k; break; } startPour(); },
      up: stop, keyup: e => { if (e.code === 'Space') stop(); }, btnUp: stop }, esc),
    outro: (b, s) => [{ say: ['me', s >= 0.6 ? 'Dung dịch chuyển màu đúng như cô nói!' : 'Ơ… cốc sủi bọt lung tung rồi.'] }] });
}

/* ============================================================
 *  TH SINH — KÍNH HIỂN VI: nhìn qua thị kính, di chuyển tiêu bản tìm đúng loài vi sinh vật cô yêu cầu
 *  W A S D (← ↑ → ↓ hoặc kéo chuột) di chuyển tiêu bản · SPACE (nút CHỤP) đánh dấu con nằm giữa vòng ngắm.
 * ============================================================ */
const MICROBES = [['trùng giày', '#5fae4a'], ['trùng roi', '#3b82c4'], ['tảo lục', '#2e9e86'], ['hồng cầu', '#e2574c']];
async function labMicro(d) {
  const tk = Math.floor(Math.random() * 4), need = 2 + Math.floor(d / 2), T = 36 - d * 2, R = 180, bugs = [];
  for (let i = 0; i < 12 + d * 3; i++) bugs.push({ k: i < need + 2 ? tk : (tk + 1 + (i % 3)) % 4, x: (Math.random() * 2 - 1) * R, y: (Math.random() * 2 - 1) * R, a: Math.random() * 6.28, sp: 4 + Math.random() * 6 + d * 2, got: false });
  const st = { vx: 0, vy: 0, t: 0, found: 0, wrong: 0, msg: '', drag: null };
  const drawBug = (k, X, Y, z, a) => {
    ctx.save(); ctx.translate(X, Y); ctx.rotate(a); ctx.fillStyle = MICROBES[k][1]; ctx.strokeStyle = '#2a2136'; ctx.lineWidth = Math.max(1, z * 0.5);
    ctx.beginPath();
    if (k === 0) ctx.ellipse(0, 0, 6 * z, 3 * z, 0, 0, 6.283); else if (k === 1) { ctx.ellipse(0, 0, 4 * z, 3 * z, 0, 0, 6.283); } else if (k === 2) ctx.arc(0, 0, 4 * z, 0, 6.283); else ctx.ellipse(0, 0, 4.5 * z, 4.5 * z, 0, 0, 6.283);
    ctx.fill(); ctx.stroke();
    if (k === 1) { ctx.beginPath(); ctx.moveTo(4 * z, 0); ctx.quadraticCurveTo(8 * z, 3 * z, 11 * z, 0); ctx.stroke(); }
    if (k === 3) { ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(0, 0, 2 * z, 0, 6.283); ctx.fill(); }
    if (k === 0) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(-3 * z, -1 * z, 2 * z, 2 * z); }
    ctx.restore();
  };
  // thị kính: tối xung quanh, vòng tròn sáng ở giữa màn hình, sinh vật trôi trong đó
  const glow = () => {
    const W = cv.width, H = cv.height, r = Math.min(W, H) * 0.36, cx0 = W / 2, cy0 = H * 0.54, z = r / 90;
    ctx.save(); ctx.fillStyle = 'rgba(15,12,25,0.82)'; ctx.fillRect(0, 0, W, H);
    ctx.beginPath(); ctx.arc(cx0, cy0, r, 0, 6.283); ctx.clip();
    ctx.fillStyle = '#eef6e6'; ctx.fillRect(cx0 - r, cy0 - r, r * 2, r * 2);
    for (const b of bugs) if (!b.got) { const X = cx0 + (b.x - st.vx) * z, Y = cy0 + (b.y - st.vy) * z; if (Math.abs(X - cx0) < r + 20 && Math.abs(Y - cy0) < r + 20) drawBug(b.k, X, Y, z, b.a); }
    ctx.restore();
    ctx.strokeStyle = '#2a2136'; ctx.lineWidth = r * 0.06; ctx.beginPath(); ctx.arc(cx0, cy0, r, 0, 6.283); ctx.stroke();
    ctx.strokeStyle = 'rgba(42,33,54,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx0, cy0, 12 * z, 0, 6.283); ctx.moveTo(cx0 - r, cy0); ctx.lineTo(cx0 - 14 * z, cy0); ctx.moveTo(cx0 + 14 * z, cy0); ctx.lineTo(cx0 + r, cy0); ctx.moveTo(cx0, cy0 - r); ctx.lineTo(cx0, cy0 - 14 * z); ctx.moveTo(cx0, cy0 + 14 * z); ctx.lineTo(cx0, cy0 + r); ctx.stroke();
    drawBug(tk, cx0 + r * 0.82, cy0 - r * 0.92, z * 1.2, 0);                     // mẫu cần tìm (góc thị kính)
  };
  const snap = () => {
    let best = null, bd = 12;
    for (const b of bugs) if (!b.got) { const dd = Math.hypot(b.x - st.vx, b.y - st.vy); if (dd < bd) { bd = dd; best = b; } }
    if (best && best.k === tk) { best.got = true; st.found++; st.msg = `Tìm thấy ${MICROBES[tk][0]}!`; }
    else { st.wrong++; st.t += 2; st.msg = best ? `Đó là ${MICROBES[best.k][0]}, không phải ${MICROBES[tk][0]}! (−2 giây)` : 'Giữa vòng ngắm không có gì cả. (−2 giây)'; }
  };
  const scope = () => { wRect('#2a2136', 152, 106, 4, 14); wRect('#5f656f', 150, 118, 9, 3); wRect('#8b8f9c', 153, 102, 2, 5); };
  return stageGame({ map: 'lab', me: LABME(), cam: { x: 156, y: 118 }, title: 'Soi kính hiển vi', props: [scope], btn: 'CHỤP',
    intro: () => { const t = labTeacher(); return (t >= 0 ? [{ say: [t, `Hôm nay quan sát ${MICROBES[tk][0]}. Tìm và đánh dấu ${need} con trước khi hết giờ nhé.`] }] : []).concat([{ fn: s => { s.glow = [glow]; } }]); },
    key: k => { if (k === ' ') snap(); },
    tap: snap,
    bot: () => clamp(0.55 + 0.04 * lv('th_sinh') - 0.05 * d + 0.15 * Math.random(), 0.3, 1),
    play: (sc, base, esc) => new Promise(res => {
      sc.glow = [glow];
      const off = sgPointer(p => { st.drag = p; }, p => { if (st.drag) { st.vx -= (p[0] - st.drag[0]) * 1.6; st.vy -= (p[1] - st.drag[1]) * 1.6; st.drag = p; } }, () => { st.drag = null; });
      liveLoop(sc, dt => {
        st.t += dt;
        const sp = 70 * dt; if (KEYS.a || KEYS.arrowleft) st.vx -= sp; if (KEYS.d || KEYS.arrowright) st.vx += sp; if (KEYS.w || KEYS.arrowup) st.vy -= sp; if (KEYS.s || KEYS.arrowdown) st.vy += sp;
        st.vx = clamp(st.vx, -R, R); st.vy = clamp(st.vy, -R, R);
        for (const b of bugs) { b.a += (Math.random() - 0.5) * dt * 2; b.x += Math.cos(b.a) * b.sp * dt; b.y += Math.sin(b.a) * b.sp * dt; if (Math.abs(b.x) > R) b.a = Math.PI - b.a; if (Math.abs(b.y) > R) b.a = -b.a; }
        arenaText(`<b>Soi kính hiển vi</b><div class="sc">Tìm <i>${st.found}/${need}</i> ${MICROBES[tk][0]}</div><small>⏱ ${mmss(T - st.t)} · W A S D (← ↑ → ↓ / kéo chuột) di chuyển tiêu bản · SPACE (nút CHỤP) đánh dấu con ở giữa vòng ngắm</small><small>${st.msg}</small>`);
        const done = esc() || st.found >= need || st.t >= T;
        if (done) { off(); sc.glow = null; res(st.found >= need ? (st.wrong === 0 ? 1 : clamp(0.95 - 0.1 * st.wrong, 0.6, 0.9)) : 0.5 * st.found / need); }
        return done;
      });
    }),
    outro: (b, s) => [{ say: ['me', s >= 0.6 ? 'Thấy rõ mồn một luôn!' : 'Chúng bơi nhanh quá, không kịp đánh dấu…'] }] });
}

/* ============================================================
 *  QUỐC PHÒNG — LẮP SÚNG AK MÔ HÌNH (cận cảnh mặt bàn): khung súng mờ ở giữa, các bộ phận bày dưới khay
 *  Kéo bộ phận lên đúng chỗ trên khung súng (hoặc bấm số ghi trên bộ phận) theo đúng thứ tự thầy dạy. Sai thứ tự: trừ 2 giây.
 * ============================================================ */
const AK_PARTS = ['Thân súng', 'Bệ khoá nòng', 'Nắp hộp khoá nòng', 'Báng súng', 'Ốp lót tay', 'Hộp tiếp đạn', 'Lưỡi lê'];
// hình từng bộ phận: [x, y, w, h, màu] tính từ góc của bộ phận · vị trí trên súng đã lắp (to) · kích thước (sz)
const AK_SHAPE = [
  { to: [64, 50], sz: [108, 20], r: [[0, 3, 58, 11, '#2a2e3d'], [1, 4, 56, 9, '#3a3f55'], [56, 6, 52, 4, '#2a2e3d'], [57, 7, 50, 2, '#4a5068'], [104, 3, 3, 3, '#2a2e3d'], [40, 14, 8, 6, '#5b3d27'], [30, 13, 8, 4, '#2a2e3d']] },
  { to: [92, 49], sz: [28, 6], r: [[0, 1, 26, 4, '#5f656f'], [1, 2, 24, 2, '#8b8f9c'], [24, 0, 4, 3, '#3a3f55']] },
  { to: [66, 46], sz: [54, 5], r: [[0, 1, 54, 4, '#2a2e3d'], [1, 1, 52, 3, '#5f656f'], [8, 1, 1, 3, '#3a3f55'], [16, 1, 1, 3, '#3a3f55'], [24, 1, 1, 3, '#3a3f55']] },
  { to: [24, 53], sz: [42, 15], r: [[0, 0, 42, 9, '#6f472c'], [1, 1, 40, 7, '#8a5a3a'], [0, 9, 16, 6, '#6f472c'], [1, 9, 14, 5, '#8a5a3a'], [2, 2, 36, 1, '#a9703f']] },
  { to: [122, 54], sz: [30, 8], r: [[0, 0, 30, 8, '#6f472c'], [1, 1, 28, 6, '#a9703f'], [8, 1, 1, 6, '#8a5a3a'], [16, 1, 1, 6, '#8a5a3a'], [24, 1, 1, 6, '#8a5a3a']] },
  { to: [98, 63], sz: [14, 24], r: [[0, 0, 10, 8, '#2a2e3d'], [1, 7, 10, 8, '#2a2e3d'], [3, 14, 10, 8, '#2a2e3d'], [5, 21, 9, 3, '#2a2e3d'], [1, 1, 3, 6, '#4a5068'], [2, 8, 3, 6, '#4a5068']] },
  { to: [172, 54], sz: [30, 5], r: [[0, 0, 6, 5, '#5f656f'], [5, 1, 25, 3, '#c9ccd4'], [5, 1, 25, 1, '#fffaf0'], [28, 2, 2, 1, '#c9ccd4']] },
];
function akDraw(c, k, x, y, s, col) {
  c.save(); c.translate(x, y); if (s !== 1) c.scale(s, s);
  for (const [a, b, w, h, cc] of AK_SHAPE[k].r) { c.fillStyle = col || cc; c.fillRect(a, b, w, h); }
  c.restore();
}
async function qpAssemble(d) {
  const n = Math.min(7, 3 + d), T = 22 + n * 4, order = AK_PARTS.slice(0, n), S = Math.min(0.8, 205 / AK_SHAPE.slice(0, n).reduce((a, q) => a + q.sz[0], 0));
  const tray = order.map((_, k) => k).sort(() => Math.random() - 0.5);              // thứ tự bày trên khay (xáo trộn)
  const labels = []; tray.forEach((k, i) => { labels[k] = i + 1; });
  const slotX = []; { let x = 10; const W = tray.reduce((a, k) => a + AK_SHAPE[k].sz[0] * S, 0), gap = (220 - W) / Math.max(1, n - 1); tray.forEach(k => { slotX[k] = x; x += AK_SHAPE[k].sz[0] * S + gap; }); }
  const SY = 106, st = { i: 0, t: 0, err: 0, msg: '', fly: null, shake: 0, bad: -1, drag: null, fin: 0, flash: 0 };
  const slotPos = k => [slotX[k], SY + (22 - AK_SHAPE[k].sz[1] * S) / 2];
  const pickPart = (k, dropped) => {
    if (st.fin || k < 0 || k >= n || k < st.i) return;
    if (k === st.i) { st.fly = { k, from: dropped || slotPos(k), t: 0, s: dropped ? 1 : S }; st.i++; st.msg = `Lắp xong ${order[k].toLowerCase()}!`; st.flash = 0.4; if (st.i >= n) st.fin = 1; }
    else { st.err++; st.t += 2; st.bad = k; st.shake = 0.45; st.msg = `Sai thứ tự! Phải lắp ${order[st.i].toLowerCase()} trước (−2 giây)`; }
  };
  const draw = (c, T2, now) => {
    gR(c, '#6f472c', 0, 0, CUW, CUH); for (let y = 0; y < CUH; y += 9) gR(c, '#7a4f33', 0, y, CUW, 1);   // mặt bàn gỗ
    gR(c, '#3f6b3a', 6, 26, 228, 72); gR(c, '#4a7a44', 7, 27, 226, 70);                                // tấm bạt xanh trải bàn
    gR(c, '#5b3d27', 4, 100, 232, 30); gR(c, '#e8dcc0', 5, 101, 230, 28); gR(c, '#d6c8a6', 5, 101, 230, 2);   // khay vải sáng màu bày bộ phận
    // khung súng: bộ phận chưa lắp hiện mờ, bộ phận cần lắp tiếp nhấp nháy
    for (let k = 0; k < n; k++) {
      const [tx, ty] = AK_SHAPE[k].to;
      if (k < st.i && !(st.fly && st.fly.k === k)) akDraw(c, k, tx, ty, 1);
      else if (k >= st.i) akDraw(c, k, tx, ty, 1, k === st.i && Math.floor(now / 300) % 2 ? 'rgba(255,224,110,0.8)' : 'rgba(255,255,255,0.22)');
    }
    // khay: bộ phận chưa lắp, kèm số
    for (const k of tray) {
      if (k < st.i || (st.drag && st.drag.k === k)) continue;
      const [x, y] = slotPos(k), sh = st.shake > 0 && st.bad === k ? Math.round(Math.sin(st.shake * 50) * 2) : 0;
      akDraw(c, k, x + sh, y, S); T2.text(String(labels[k]), x + AK_SHAPE[k].sz[0] * S / 2, SY - 2, 6.5);
    }
    if (st.drag) akDraw(c, st.drag.k, st.drag.x - AK_SHAPE[st.drag.k].sz[0] / 2, st.drag.y - AK_SHAPE[st.drag.k].sz[1] / 2, 1);
    if (st.fly) { const f = st.fly, q = Math.min(1, f.t / 0.3), [tx, ty] = AK_SHAPE[f.k].to; akDraw(c, f.k, f.from[0] + (tx - f.from[0]) * q, f.from[1] + (ty - f.from[1]) * q - Math.sin(q * 3.14) * 10, f.s + (1 - f.s) * q); }
    if (st.flash > 0) T2.text('✓', 210, 40, 12, '#8fd067');
    T2.text(st.i < n ? `Lắp tiếp: ${order[st.i]}` : 'Lắp xong!', 120, 12, 8);
    gR(c, '#2a2136', 150, 92, 82, 5); gR(c, (T - st.t) / T > 0.3 ? '#5fae4a' : '#e2574c', 151, 93, Math.max(0, 80 * (T - st.t) / T), 3);
    if (st.msg) T2.text(st.msg, 76, 94, 5, /Sai/.test(st.msg) ? '#ffb4a8' : '#d8f5c8');
  };
  const tick = dt => {
    if (!st.fin) st.t += dt;
    st.shake = Math.max(0, st.shake - dt); st.flash = Math.max(0, st.flash - dt);
    if (st.fly) { st.fly.t += dt; if (st.fly.t > 0.3) st.fly = null; }
    arenaText(`<b>Lắp súng AK mô hình</b><div class="sc">Đã lắp <i>${st.i}/${n}</i> · ⏱ ${mmss(Math.max(0, T - st.t))}</div><small>Kéo bộ phận lên chỗ đang nhấp nháy trên khung súng (hoặc bấm số trên bộ phận). Lắp đúng thứ tự!</small>`);
    if (!st.fin && st.t >= T) st.fin = 1;
    if (st.fin && (st.finW = (st.finW || 0) + dt) > 1.2) return st.i >= n ? clamp(1 - 0.08 * st.err - Math.max(0, st.t - T * 0.7) / T, 0.6, 1) : 0.5 * st.i / n;
  };
  return stageGame({ title: 'Lắp súng AK mô hình', cam: { x: G.x, y: G.y - 24 },
    intro: () => { const t = labTeacher(); return t >= 0 ? [{ say: [t, `Lắp theo thứ tự: ${order.join(' → ')}. Có ${T} giây!`] }] : []; },
    key: k => { if (/^[1-7]$/.test(k)) pickPart(tray[+k - 1] === undefined ? -1 : tray[+k - 1]); },
    bot: () => clamp(0.55 + 0.04 * lv('qp') - 0.05 * d + 0.15 * Math.random(), 0.3, 1),
    play: (sc, base, esc) => cuPlay(sc, { draw, tick,
      down: p => { if (st.fin) return; for (const k of tray) { if (k < st.i) continue; const [x, y] = slotPos(k), [w, h] = AK_SHAPE[k].sz; if (p[0] >= x - 2 && p[0] <= x + w * S + 2 && p[1] >= y - 4 && p[1] <= y + h * S + 4) { st.drag = { k, x: p[0], y: p[1], x0: p[0], y0: p[1] }; return; } } },
      move: p => { if (st.drag) { st.drag.x = p[0]; st.drag.y = p[1]; } },
      up: p => {
        const D = st.drag; if (!D) return; st.drag = null;
        const moved = Math.hypot(p[0] - D.x0, p[1] - D.y0) > 6, [tx, ty] = AK_SHAPE[D.k].to, [w, h] = AK_SHAPE[D.k].sz;
        if (!moved) pickPart(D.k);                                                                      // bấm vào bộ phận = lắp luôn
        else if (p[1] < 98) pickPart(D.k, [p[0] - w / 2, p[1] - h / 2]);                                // thả lên khung súng
        else if (Math.hypot(p[0] - tx - w / 2, p[1] - ty - h / 2) < 40) pickPart(D.k);
      } }, esc),
    outro: (b, s) => [{ say: ['me', s >= 0.6 ? 'Báo cáo thầy, lắp xong!' : 'Còn thiếu mấy bộ phận… em tập thêm ạ.'] }] });
}

/* ============================================================
 *  THỂ DỤC — TÂNG CẦU (giao hữu: tâng bóng) · cận cảnh sân tập: mình đứng giữa, thầy đếm bên trái, bạn cùng lớp tập bên phải
 *  Quả cầu rơi xuống ngang chân (vạch vàng) thì bấm SPACE / chuột / nút ĐÁ để tâng lên. Đá hụt thì khựng chân một chút.
 * ============================================================ */
async function sceneKeepup(d, title, opt) {
  const ball = typeof opt === 'object' && opt && opt.ball, need = 5 + 2 * d, lives = 3, T = labTeacher(), FOOT = 106, GROUND = 114, PXX = 128;
  const st = { h: 60, v: 0, kicks: 0, drops: 0, wait: 0.8, msg: '', kickT: 0, cool: 0, fin: 0, t: 0, pop: 0 };
  const sc0 = RT.scene, tLook = T >= 0 && sc0 && sc0.actors[T] ? sc0.actors[T].look : null, mate = sc0 && sc0.actors && sc0.actors[0] ? sc0.actors[0] : { look: 'c3', outfit: null };
  const big = (c, look, outfit, dir, x, y, oy) => { const fr = charSheet(look, outfit)[dir][0], k = fr.hi ? 2 / fr.hi : 2, w = fr.width * k, h = fr.height * k; c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(x + 6, y + 46, 24, 4); c.drawImage(fr, x + 16 - w / 2, y + 44 - h + (oy || 0), w, h); };
  const shuttle = (c, x, y, up) => {
    if (ball) { gR(c, '#2a2136', x - 4, y - 4, 9, 9); gR(c, '#fbf7ee', x - 3, y - 3, 7, 7); gR(c, '#2a2136', x, y - 2, 2, 2); gR(c, '#2a2136', x - 2, y + 1, 2, 2); gR(c, '#2a2136', x + 2, y + 1, 1, 1); return; }
    const s = up ? -1 : 1;                                                     // cầu lông gà: đế đỏ hướng xuống khi rơi
    gR(c, '#c8463f', x - 2, y + (up ? -3 : 1), 5, 3);
    for (let i = 0; i < 4; i++) gR(c, '#fffaf0', x - 3 + i * 2, y - (up ? -1 : 6) + 0 * s, 1, 6);
    gR(c, '#d9d2c2', x - 3, y + (up ? 6 : -6), 7, 1);
  };
  const kick = () => {
    if (st.wait > 0 || st.cool > 0 || st.fin) return;
    if (st.v < 0 && st.h <= 16 && st.h >= -3) { st.kicks++; st.v = 118 + Math.random() * 26 + st.kicks; st.kickT = 0.18; st.pop = 0.4; st.msg = st.h < 5 ? 'Tâng sát đất, đẹp!' : 'Tâng!'; if (RT.scene) RT.scene.meOy = -3; }
    else { st.msg = st.v > 0 || st.h > 16 ? 'Sớm quá, hụt chân!' : 'Muộn quá!'; st.kickT = 0.18; st.cool = 0.45; }
  };
  const draw = (c, Tx, now) => {
    gR(c, '#bfe3f2', 0, 0, CUW, 52); gR(c, '#e8d4a8', 0, 40, CUW, 14); for (let x = 0; x < CUW; x += 16) gR(c, '#d8c08e', x, 40, 1, 14);   // trời + tường rào trường
    for (let x = -6; x < CUW; x += 22) { gR(c, '#2f6b2b', x, 30 + (x % 3), 20, 16); gR(c, '#3f8f3a', x + 2, 32 + (x % 3), 16, 10); }       // hàng cây
    gR(c, '#5fae4a', 0, 54, CUW, CUH - 54); for (let y = 58; y < CUH; y += 8) gR(c, '#57a443', 0, y, CUW, 1); gR(c, '#fffaf0', 0, 92, CUW, 1);
    if (tLook) { big(c, tLook, null, 2, 8, 62); if (Math.floor(now / 500) % 2) Tx.text(String(st.kicks), 26, 56, 7, '#2a2136', '#fff6e3'); }
    const mt = now / 1000; big(c, mate.look, mate.outfit, 1, 196, 62); shuttle(c, 206, 104 - Math.abs(Math.sin(mt * 3.2)) * 34, Math.cos(mt * 3.2) * Math.sin(mt * 3.2) > 0);   // bạn bên cạnh cũng tâng
    // vạch chạm chân
    const hot = st.v < 0 && st.h <= 22 && !st.wait;
    gR(c, hot ? 'rgba(255,214,90,0.85)' : 'rgba(255,255,255,0.35)', PXX - 10, FOOT - 16, 20, 1); gR(c, hot ? 'rgba(255,214,90,0.85)' : 'rgba(255,255,255,0.35)', PXX - 10, FOOT, 20, 1);
    big(c, G.gender, RT.outfit || null, 0, 102, 62, RT.scene && RT.scene.meOy ? Math.round(RT.scene.meOy) : 0);
    if (st.kickT > 0) { gR(c, '#2a2136', 117, 92, 14, 6); gR(c, RT.outfit === 'td' ? '#3b6fb6' : '#2a2136', 118, 93, 12, 4); gR(c, '#fffaf0', 128, 92, 4, 6); }   // chân đá lên
    shuttle(c, PXX, FOOT - st.h, st.v > 0);
    gR(c, 'rgba(0,0,0,0.2)', PXX - 3, GROUND, 7, 2);
    if (st.pop > 0) Tx.text(`${st.kicks}!`, PXX + 10, FOOT - st.h - 10 - (0.4 - st.pop) * 20, 8, '#ffd23a');
    Tx.text(`${st.kicks}/${need}`, 120, 10, 10);
    for (let i = 0; i < lives; i++) { gR(c, '#2a2136', 200 + i * 11, 5, 9, 9); gR(c, i < lives - st.drops ? '#e2574c' : '#8b8f9c', 201 + i * 11, 6, 7, 7); }
    if (st.msg) Tx.text(st.msg, 120, 24, 6, /hụt|Muộn|Rơi/.test(st.msg) ? '#ffb4a8' : '#fff6e3');
  };
  const tick = dt => {
    st.t += dt; st.kickT = Math.max(0, st.kickT - dt); st.cool = Math.max(0, st.cool - dt); st.pop = Math.max(0, st.pop - dt);
    if (RT.scene) RT.scene.meOy = Math.min(0, (RT.scene.meOy || 0) + dt * 20);
    if (!st.fin) {
      if (st.wait > 0) { st.wait -= dt; if (st.wait <= 0) { st.h = 64; st.v = 40; } }
      else { const g = 200 + st.kicks * 5; st.v -= g * dt; st.h += st.v * dt; if (st.h < -8) { st.drops++; st.wait = 1; st.h = -8; st.v = 0; st.msg = `Rơi mất rồi! (còn ${lives - st.drops} lượt)`; } }
      if (st.kicks >= need || st.drops >= lives) st.fin = 1e-9;
    }
    arenaText(`<b>${title || 'Tâng cầu'}</b><div class="sc">Tâng được <i>${st.kicks}/${need}</i> · còn ${lives - st.drops} lượt rơi</div><small>${ball ? 'Bóng' : 'Cầu'} rơi xuống ngang chân (vạch vàng) thì bấm SPACE / chuột / nút ĐÁ</small>`);
    if (st.fin) { st.fin += dt; if (st.fin > 1) return Math.max(0.0001, st.kicks / need); }
  };
  return stageGame({ title: title || 'Tâng cầu', btn: 'ĐÁ', cam: { x: G.x, y: G.y - 24 },
    intro: () => (T >= 0 ? [{ say: [T, `Tâng ${need} lần không để rơi nhé! ${ball ? 'Bóng' : 'Cầu'} rơi tới chân thì đá lên.`] }] : []),
    key: k => { if (k === ' ' || k === 'enter') kick(); }, tap: kick,
    bot: () => clamp(0.55 + 0.04 * lv('thethao') - 0.04 * d + 0.2 * Math.random(), 0.3, 1),
    play: (sc, base, esc) => cuPlay(sc, { draw, tick, down: p => { if (cuIn(p)) kick(); } }, esc),
    outro: (b, s) => [{ say: ['me', s >= 0.6 ? 'Đạt rồi!' : 'Chân tay lóng ngóng quá…'] }] });
}

/* ============================================================
 *  TRUNG THU — LÀM ĐÈN ÔNG SAO (cận cảnh tấm bảng ở sạp làm đèn)
 *  1) Uốn khung: bấm lần lượt các đốt tre theo hình ngôi sao (đốt cần nối nhấp nháy, hoặc bấm số 1–5)
 *  2) Dán giấy bóng kính: GIỮ chuột / SPACE để miết giấy lên từng cánh, thả ra khi vừa kín cánh (đầy tới vạch)
 *  3) Gắn nến: bấm khi cây nến đung đưa tới chính giữa đèn → đèn sáng, gắn cán cầm và tua giấy
 * ============================================================ */
async function sceneLantern(d) {
  const CX = 120, CY = 66, RO = 46, RI = 18, ORDER = [0, 2, 4, 1, 3, 0];
  const P = k => { const a = -Math.PI / 2 + k * 2 * Math.PI / 5; return [CX + Math.cos(a) * RO, CY + Math.sin(a) * RO]; };
  const Q = k => { const a = -Math.PI / 2 + (k + 0.5) * 2 * Math.PI / 5; return [CX + Math.cos(a) * RI, CY + Math.sin(a) * RI]; };
  const st = { ph: 0, i: 0, err: 0, t: 0, stickT: 0, fill: 0, held: false, cand: 0, msg: 'Bấm đốt tre đang nhấp nháy để uốn nan theo hình ngôi sao', fin: 0, shake: 0, papers: [] };
  const poly = (c, pts, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) c.lineTo(p[0], p[1]); c.closePath(); c.fill(); };
  const stick = (c, a, b, k) => {                                              // nan tre: nét dày có đốt
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) * k;
    c.save(); c.translate(a[0], a[1]); c.rotate(Math.atan2(dy, dx)); c.fillStyle = '#6f472c'; c.fillRect(0, -1.5, L, 3); c.fillStyle = '#c9a467'; c.fillRect(0, -1, L, 2); c.fillStyle = '#8a5a3a'; for (let x = 14; x < L; x += 16) c.fillRect(x, -1.5, 1.5, 3); c.restore();
  };
  const arm = k => [P(k), Q(k), Q((k + 4) % 5)];                               // cánh sao thứ k: đỉnh ngoài + 2 điểm trong
  const draw = (c, T, now) => {
    gR(c, '#c9a467', 0, 0, CUW, CUH); gR(c, '#e8d4a8', 4, 4, CUW - 8, CUH - 8);           // tấm bảng làm đèn
    for (let y = 10; y < CUH - 6; y += 12) gR(c, '#dfc896', 4, y, CUW - 8, 1);
    if (st.ph >= 3) { const g = c.createRadialGradient(CX, CY, 4, CX, CY, 70); g.addColorStop(0, 'rgba(255,214,90,0.75)'); g.addColorStop(1, 'rgba(255,214,90,0)'); c.fillStyle = g; c.fillRect(0, 0, CUW, CUH); }
    // giấy bóng kính trên từng cánh + ô giữa
    for (let k = 0; k < 5; k++) {
      const f = st.papers[k] !== undefined ? st.papers[k] : (st.ph === 1 && k === st.i ? st.fill : 0); if (!f) continue;
      const [tip, q1, q2] = arm(k), q = Math.min(1, f), lerp = (p, r) => [p[0] + (tip[0] - p[0]) * r, p[1] + (tip[1] - p[1]) * r];
      poly(c, q >= 1 ? [tip, q1, q2] : [q1, lerp(q1, q), lerp(q2, q), q2], st.ph >= 3 ? '#ff6a4d' : '#e2574c');
      if (f > 1.15) { c.fillStyle = '#fff6e3'; c.fillRect(tip[0] - 1, tip[1] + 3, 2, 3); }                 // giấy rách ở mũi cánh
    }
    if (st.ph >= 2) poly(c, [0, 1, 2, 3, 4].map(Q), st.ph >= 3 ? '#ffd23a' : '#f2c94c');
    // khung tre
    const done = st.ph === 0 ? Math.max(0, st.i - 1) : 5;                       // st.i = số đốt đã bấm (6 lần bấm: 1→3→5→2→4→1)
    for (let e = 0; e < done; e++) stick(c, P(ORDER[e]), P(ORDER[e + 1]), 1);
    if (st.ph === 0) for (let k = 0; k < 5; k++) {                                // các đốt tre: đốt cần nối nhấp nháy
      const [x, y] = P(k), hot = k === ORDER[st.i] && Math.floor(now / 260) % 2 === 0, sh = st.shake > 0 && st.bad === k ? Math.round(Math.sin(st.shake * 50) * 2) : 0;
      gR(c, '#2a2136', x - 4 + sh, y - 4, 8, 8); gR(c, hot ? '#ffd23a' : '#a9703f', x - 3 + sh, y - 3, 6, 6); T.text(String(k + 1), x + sh, y - 9, 6, '#2a2136', '#fff6e3');
    }
    // nến: đung đưa trên sợi chỉ, bấm để thả vào giữa
    if (st.ph === 2) { const x = CX + Math.sin(st.t * 2.6) * 26; gR(c, '#2a2136', x, 4, 1, 18); gR(c, '#fffaf0', x - 2, 22, 5, 9); gR(c, '#ffd23a', x - 1, 18, 3, 4); gR(c, '#e2574c', x, 19, 1, 2); gR(c, 'rgba(42,33,54,0.35)', CX - 1, CY - 2, 3, 5); }
    if (st.ph >= 3) {
      gR(c, '#fffaf0', CX - 2, CY - 3, 5, 8); const fl = Math.floor(now / 120) % 2; gR(c, '#ffd23a', CX - 1, CY - 7 - fl, 3, 4); gR(c, '#e2574c', CX, CY - 6 - fl, 1, 2);
      const [b1, b2] = [P(2), P(3)]; for (const b of [b1, b2]) for (let j = 0; j < 4; j++) gR(c, j % 2 ? '#ffd23a' : '#e2574c', b[0] - 1 + j - 2, b[1] + 2, 1, 8 + (j % 2) * 3);   // tua giấy
      gR(c, '#6f472c', CX + 14, CY + 18, 3, 50); gR(c, '#c9a467', CX + 15, CY + 18, 1, 50);                                            // cán cầm
    }
    // thanh miết giấy
    if (st.ph === 1) { gR(c, '#2a2136', 196, 30, 10, 72); gR(c, '#fff6e3', 197, 31, 8, 70); const z0 = 31 + 70 - 70 * 1.15 / 1.5, z1 = 31 + 70 - 70 * 0.8 / 1.5; gR(c, '#8fd067', 197, z0, 8, z1 - z0); const h = Math.min(70, 70 * st.fill / 1.5); gR(c, st.fill > 1.15 ? '#e2574c' : '#e98a3c', 199, 101 - h, 4, h); T.text('MIẾT', 201, 24, 5, '#2a2136', '#fff6e3'); }
    T.text(['Uốn khung tre', 'Dán giấy bóng kính', 'Gắn nến', 'Đèn ông sao!'][st.ph] + (st.ph === 1 ? ` (cánh ${Math.min(5, st.i + 1)}/5)` : st.ph === 0 ? ` (${Math.max(0, st.i - 1)}/5 nan)` : ''), 120, 9, 8, '#2a2136', '#fff6e3');
    if (st.msg) T.text(st.msg, 120, 127, 5.5, '#6f472c', '#fff6e3');
  };
  const pickNode = k => {
    if (st.ph !== 0 || st.fin) return;
    if (k === ORDER[st.i]) { st.i++; st.stickT = 0; st.msg = st.i === 1 ? 'Nối sang đốt đang nhấp nháy!' : 'Chuẩn! Nối tiếp…'; }
    else { st.err++; st.bad = k; st.shake = 0.4; st.msg = st.i === 0 ? 'Bắt đầu từ đốt trên cùng (đốt 1)!' : 'Uốn sai đốt, nan tre hơi cong vênh…'; }
    if (st.i >= 6) { st.ph = 1; st.i = 0; st.msg = 'Giữ chuột / SPACE để miết giấy lên cánh sao, thả khi vào vạch xanh'; }
  };
  const hold = () => { if (st.ph === 1 && !st.fin) st.held = true; else if (st.ph === 2) dropCandle(); };
  const release = () => {
    if (st.ph !== 1 || !st.held) return; st.held = false;
    if (st.fill >= 0.8 && st.fill <= 1.15) st.msg = 'Dán phẳng phiu!'; else { st.err++; st.msg = st.fill < 0.8 ? 'Giấy chưa phủ kín cánh…' : 'Miết mạnh quá, giấy rách một chút!'; }
    st.papers[st.i] = st.fill; st.fill = 0; st.i++;
    if (st.i >= 5) { st.ph = 2; st.t = 0; st.msg = 'Bấm (SPACE / chuột) khi cây nến ở chính giữa đèn'; }
  };
  const dropCandle = () => { if (st.ph !== 2) return; const x = Math.sin(st.t * 2.6) * 26; if (Math.abs(x) > 5) { st.err++; st.msg = 'Nến hơi lệch… nhưng vẫn sáng!'; } else st.msg = 'Nến ngay chính giữa, đèn sáng rực!'; st.ph = 3; st.fin = st.t; };
  const tick = dt => {
    st.t += dt; st.shake = Math.max(0, st.shake - dt);
    if (st.ph === 0 && st.i > 0) { st.stickT += dt; if (st.stickT > 4.2 - d * 0.5) { st.err++; st.stickT = 0; st.msg = 'Chậm quá, nan tre bật ra! Nối lại nhanh lên.'; } }
    if (st.ph === 1 && st.held) { st.fill += dt / (1.1 - d * 0.08); if (st.fill > 1.5) release(); }
    arenaText(`<b>Làm đèn ông sao</b><div class="sc">Lỗi <i>${st.err}</i></div><small>${st.ph === 0 ? 'Bấm đốt tre đang nhấp nháy (hoặc phím số 1–5) để uốn nan thành ngôi sao' : st.ph === 1 ? 'GIỮ chuột / SPACE / nút BẤM để miết giấy, thả khi thanh vào vạch xanh' : st.ph === 2 ? 'Bấm khi cây nến ở chính giữa đèn' : 'Xong!'}</small>`);
    if (st.fin && st.t - st.fin > 1.4) return clamp(1 - st.err * 0.1, 0, 1);
  };
  return stageGame({ map: 'pho', me: [678, 362, 3], cam: { x: 678, y: 330 }, title: 'Làm đèn ông sao', btn: 'BẤM',
    intro: () => [{ say: ['me', 'Nào, uốn nan tre thành ngôi sao năm cánh trước!'] }],
    key: k => { if (/^[1-5]$/.test(k)) pickNode(+k - 1); else if (k === ' ') hold(); },
    tap: hold,
    bot: () => clamp(0.6 + 0.04 * lv('kheotay') - 0.05 * d + 0.2 * Math.random(), 0.3, 1),
    play: (sc, base, esc) => cuPlay(sc, { draw, tick,
      down: p => { if (!cuIn(p)) return; if (st.ph === 0) { for (let k = 0; k < 5; k++) { const [x, y] = P(k); if (Math.hypot(p[0] - x, p[1] - y) < 9) return pickNode(k); } } else hold(); },
      up: release, keyup: e => { if (e.code === 'Space') release(); }, btnUp: release }, esc),
    outro: (b, s) => [{ say: ['me', s >= 0.6 ? 'Đèn ông sao của mình đây rồi!' : 'Hơi méo một chút…'] }] });
}

/* ============================================================
 *  TRUNG THU — BỊT MẮT ĐẬP NIÊU: mắt bịt kín (màn hình tối), nghe người dẫn đường chỉ hướng — đám đông hay la chỉ bậy
 *  W A S D di chuyển · SPACE (nút ĐẬP) vung gậy. 3 lần vung, 30 giây.
 * ============================================================ */
async function sceneNieu(diff, guide) {
  const [nx, ny] = TT_SPOTS.nieu, T = [nx + 22, ny + 44], a0 = Math.random() * 6.283, dist0 = 46 + Math.random() * 22;
  const start = [clamp(T[0] + Math.cos(a0) * dist0, 40, 1040), clamp(T[1] + Math.abs(Math.sin(a0)) * dist0 * 0.6 + 10, T[1] + 8, 400)];
  const gName = guide || 'Chú quản trò', st = { t: 0, swings: 3, said: 0, hit: false, msg: '', swingT: 0 };
  const glow = () => {
    const S = VIEW.S, X = VIEW.ox + G.x * S, Y = VIEW.oy + (G.y - 12) * S, g2 = ctx.createRadialGradient(X, Y, 6 * S, X, Y, 26 * S);
    g2.addColorStop(0, 'rgba(10,8,18,0.55)'); g2.addColorStop(1, 'rgba(10,8,18,0.96)'); ctx.fillStyle = g2; ctx.fillRect(0, 0, cv.width, cv.height);
  };
  const prop = () => { wRect('#e2574c', G.x - 4, G.y - 18, 9, 2); if (st.swingT > 0) { const k = st.swingT / 0.3; wRect('#8a5a3a', G.x + 4, G.y - 22 + (1 - k) * 12, 2, 12); } else wRect('#8a5a3a', G.x + 5, G.y - 18, 1, 12); };
  const dirTo = () => { const dx = T[0] - G.x, dy = T[1] - G.y; if (Math.hypot(dx, dy) < 9) return 'Đập đi! Đập ngay!'; return Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'Sang trái! Sang trái!' : 'Sang phải! Sang phải!') : (dy < 0 ? 'Đi lên trước! Lên nữa!' : 'Lùi lại! Lùi xuống!'); };
  const wrong = () => pick(['Sang trái kìa!', 'Lùi lại đi!', 'Phải! Phải!', 'Đập luôn đi!', 'Lên trước nữa!']);
  const swing = () => { if (st.swingT > 0 || st.hit || st.swings <= 0) return; st.swingT = 0.3; st.swings--; if (Math.hypot(T[0] - G.x, T[1] - G.y) < 10) { st.hit = true; st.msg = 'BỐP!'; } else st.msg = `Trượt rồi! Còn ${st.swings} lần vung.`; };
  return stageGame({ map: 'pho', me: [start[0], start[1], 3], cam: { x: (start[0] + T[0]) / 2, y: (start[1] + T[1]) / 2 - 10 }, title: 'Bịt mắt đập niêu', props: [prop], btn: 'ĐẬP',
    actors: [{ look: guide ? (G.comp && G.comp.fid) || 'driver' : 'driver', outfit: G.comp ? friendOutfit(G.comp.fid) : null, x: T[0] - 40, y: T[1] + 24, dir: 2 }, { look: 'c5', outfit: 'cas_khoa', x: T[0] + 44, y: T[1] + 30, dir: 1 }],
    intro: base => [{ say: [base, `Bịt mắt lại! Nghe ${guide ? 'tớ' : 'chú'} chỉ đường nhé, đừng nghe mọi người la bậy!`] }, { fn: s => { s.glow = [glow]; } }],
    key: k => { if (k === ' ') swing(); }, tap: swing,
    bot: () => clamp(0.55 + 0.03 * lv('kheotay') + 0.15 * luckK() + 0.2 * Math.random(), 0.2, 1),
    play: (sc, base, esc) => new Promise(res => {
      let sayT = 0.4;
      liveLoop(sc, dt => {
        st.t += dt; st.swingT = Math.max(0, st.swingT - dt); sgBubble(sc, dt);
        let vx = 0, vy = 0; if (KEYS.a || KEYS.arrowleft) vx--; if (KEYS.d || KEYS.arrowright) vx++; if (KEYS.w || KEYS.arrowup) vy--; if (KEYS.s || KEYS.arrowdown) vy++;
        if (JOY.id !== null && Math.hypot(JOY.dx, JOY.dy) > 12) { vx = JOY.dx; vy = JOY.dy; }
        const l = Math.hypot(vx, vy), mv = l > 0 && !st.hit;
        if (mv) { G.x = clamp(G.x + vx / l * 32 * dt, 30, 1050); G.y = clamp(G.y + vy / l * 32 * dt, 250, 400); G.dir = Math.abs(vx) > Math.abs(vy) ? (vx < 0 ? 1 : 2) : (vy < 0 ? 3 : 0); }
        sayT -= dt;
        if (sayT <= 0 && !st.hit) { sayT = 1.2; if (Math.random() < 0.3) sgSay(sc, base + 1, `(đám đông) ${wrong()}`, 1); else sgSay(sc, base, `${gName}: ${dirTo()}`, 1.1); }
        arenaText(`<b>Bịt mắt đập niêu</b><div class="sc">Còn <i>${st.swings}</i> lần vung · ⏱ ${mmss(30 - st.t)}</div><small>Nghe theo <b>${gName}</b> (đám đông hay la chỉ bậy) · W A S D để đi · SPACE (nút ĐẬP) để vung gậy</small><small>${st.msg}</small>`);
        const done = esc() || st.hit || st.swings <= 0 || st.t >= 30;
        if (done) { sc.glow = null; res(st.hit ? (st.swings >= 2 ? 1 : 0.8) : 0.3); }
        return mv ? (done ? true : 1) : done;
      });
    }),
    // tháo khăn bịt mắt: trúng thì niêu vỡ, kẹo rơi tung toé
    outro: (base, s) => {
      const win = s >= 0.6, t0 = { v: 1e15 };
      return [{ fn: sc => { sc.props = sc.props.concat([now => { const t = (now - t0.v) / 1000; if (t < 0 || !win) return; for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283, k = Math.min(1, t * 1.4); wRect(['#ffd23a', '#e2574c', '#5fe0f0', '#8fd067'][i % 4], nx + 22 + Math.cos(a) * 18 * k, ny + 18 + Math.sin(a) * 6 * k + k * k * 22, 2, 2); } }]); t0.v = performance.now(); } },
        { hop: 'me' }, { wait: 500 }, { say: ['me', win ? 'Bốp! Vỡ rồi! Kẹo rơi đầy nè!' : 'Ơ… đập trượt rồi! Cả đám cười ầm…'] }];
    } });
}

/* ============================================================
 *  HỘI GÓI BÁNH CHƯNG — THI GÓI BÁNH (cận cảnh): khuôn bánh ở giữa, 6 khay nguyên liệu hai bên
 *  Kéo nguyên liệu thả vào khuôn (hoặc bấm vào khay / phím 1–6) đúng thứ tự 8 bước: lá dong → gạo → đậu → thịt → đậu → gạo → gấp lá → buộc lạt.
 *  Bấm nhầm thì lóng ngóng mất một lúc. 3 bạn ở các bàn bên cạnh gói cùng lúc.
 * ============================================================ */
const BC_SIDE = ['la', 'gao', 'dau', 'thit', 'gap', 'lat'];                    // trái: 1–3 · phải: 4–6
function bcIng(c, k, x, y, s) {                                               // vẽ nguyên liệu trong khay (tâm x, y)
  const r = (col, a, b, w, h) => gR(c, col, x + a * s, y + b * s, w * s, h * s);
  if (k === 'la') { r('#2f6b2b', -11, -6, 22, 12); r('#3f8f3a', -10, -5, 20, 10); r('#5fae4a', -9, -1, 18, 1); for (let i = -7; i < 8; i += 4) r('#2f6b2b', i, -4, 1, 3); }
  else if (k === 'gao') { r('#d9d2c2', -11, -5, 22, 10); r('#fbf7ee', -10, -4, 20, 8); for (let i = 0; i < 9; i++) r('#cfc6b2', -8 + (i * 7) % 17, -3 + (i * 3) % 6, 1, 1); }
  else if (k === 'dau') { r('#c99a2e', -10, -4, 20, 9); r('#f2c94c', -9, -5, 18, 8); r('#f8dd84', -6, -4, 6, 2); }
  else if (k === 'thit') { r('#b85a6e', -10, -5, 20, 10); r('#e98fa5', -9, -4, 18, 8); r('#fbf7ee', -9, -1, 18, 2); r('#fbf7ee', -9, 3, 18, 1); }
  else if (k === 'gap') { r('#2f6b2b', -10, -6, 20, 12); r('#5fae4a', -9, -5, 18, 10); for (let i = 0; i < 9; i++) r('#2f6b2b', -9 + i * 2, -5 + i, 2, 1); r('#fff6e3', 4, -6, 6, 1); r('#fff6e3', 9, -6, 1, 5); }
  else if (k === 'lat') { for (let i = 0; i < 4; i++) { r('#a88a4a', -11, -5 + i * 3, 22, 2); r('#d9c690', -11, -5 + i * 3, 22, 1); } }
}
async function sceneBanhChung(actors, intro) {
  const T = BANHCHUNG.time, [mx, my] = BC_TABLES[0], MX = 92, MY = 22, Z = 56;
  const tray = i => [i < 3 ? 36 : 204, 30 + (i % 3) * 34];
  const st = { t: 0, step: 0, cakes: 0, pen: 0, msg: 'Kéo nguyên liệu thả vào khuôn bánh ở giữa', drag: null, fly: null, pop: 0, bad: -1, shake: 0, fin: 0,
    npc: BANHCHUNG.npc.map(([, name, rate]) => ({ name, rate: rate * (0.85 + Math.random() * 0.3) / T, acc: 0, made: 0 })) };
  const apply = (i, dropped) => {
    if (st.pen > 0 || st.fin || i < 0 || i > 5) return;
    const k = BC_SIDE[i];
    if (k === BC_STEPS[st.step][0]) {
      if (!dropped) st.fly = { k, from: tray(i), t: 0 };
      st.step++; st.msg = BC_STEPS[st.step - 1][1] + ' ✓'; RT.scene.meOy = -1;
      if (st.step >= BC_STEPS.length) { st.cakes++; st.step = 0; st.pop = 0.9; st.msg = 'Xong một chiếc bánh vuông vức!'; }
    } else { st.pen = 1.1; st.bad = i; st.shake = 0.5; st.msg = `Nhầm ${BC_ING[k][0].toLowerCase()} rồi! Bước này là ${BC_STEPS[st.step][1].toLowerCase()}.`; }
  };
  const draw = (c, Tx, now) => {
    gR(c, '#c98f5a', 0, 0, CUW, CUH); for (let y = 0; y < CUH; y += 6) gR(c, '#bd8550', 0, y, CUW, 1); for (let x = 0; x < CUW; x += 6) gR(c, 'rgba(120,70,30,0.12)', x, 0, 1, CUH);   // chiếu tre
    // thời gian
    gR(c, '#2a2136', 60, 3, 120, 6); gR(c, (T - st.t) / T > 0.3 ? '#5fae4a' : '#e2574c', 61, 4, Math.max(0, 118 * (T - st.t) / T), 4);
    // khuôn gỗ + bánh thành hình từng lớp
    const sh = st.pen > 0.6 ? Math.round(Math.sin(st.pen * 60)) : 0, X = MX + sh, Y = MY, s = st.step;
    gR(c, '#5b3d27', X - 5, Y - 5, Z + 10, Z + 10); gR(c, '#8a5a3a', X - 4, Y - 4, Z + 8, Z + 8); gR(c, '#e8d6b0', X, Y, Z, Z);
    if (s >= 1) { gR(c, '#3f8f3a', X, Y, Z, Z); for (let i = 4; i < Z; i += 8) gR(c, '#357a31', X + i, Y, 1, Z); }
    if (s >= 2) gR(c, '#fbf7ee', X + 7, Y + 7, Z - 14, Z - 14);
    if (s >= 3) gR(c, '#f2c94c', X + 14, Y + 14, Z - 28, Z - 28);
    if (s >= 4) { gR(c, '#e98fa5', X + 20, Y + 20, Z - 40, Z - 40); gR(c, '#fbf7ee', X + 20, Y + 25, Z - 40, 2); }
    if (s >= 5) { gR(c, '#f2c94c', X + 14, Y + 14, Z - 28, Z - 28); gR(c, '#e98fa5', X + 24, Y + 25, 8, 5); }
    if (s >= 6) gR(c, '#fbf7ee', X + 7, Y + 7, Z - 14, Z - 14);
    if (s >= 7) { gR(c, '#5fae4a', X, Y, Z, Z); for (let i = 0; i < Z; i += 2) { gR(c, '#3f8f3a', X + i, Y + i, 2, 2); gR(c, '#3f8f3a', X + Z - 2 - i, Y + i, 2, 2); } }
    if (st.pop > 0) { gR(c, '#3f8f3a', X, Y, Z, Z); gR(c, '#d9c690', X + Z / 2 - 2, Y, 4, Z); gR(c, '#d9c690', X, Y + Z / 2 - 2, Z, 4); gR(c, '#d9c690', X + 12, Y, 2, Z); gR(c, '#d9c690', X, Y + 40, Z, 2); Tx.text('+1 bánh!', MX + Z / 2, MY + Z / 2 - (0.9 - st.pop) * 30, 9, '#ffd23a'); }
    // khay nguyên liệu hai bên
    BC_SIDE.forEach((k, i) => {
      const [x, y] = tray(i), sh2 = st.shake > 0 && st.bad === i ? Math.round(Math.sin(st.shake * 50) * 2) : 0, want = BC_STEPS[st.step][0] === k;
      gR(c, '#2a2136', x - 18 + sh2, y - 12, 36, 24); gR(c, st.pen > 0 ? '#bdb6a8' : '#fff6e3', x - 17 + sh2, y - 11, 34, 22);
      if (!(st.drag && st.drag.i === i)) bcIng(c, k, x + sh2, y - 1, 1);
      Tx.text(`${i + 1}. ${BC_ING[k][0]}`, x, y + 17, 5.5, want && st.pen <= 0 && Math.floor(now / 400) % 2 ? '#ffd23a' : '#fff6e3');
      if (st.shake > 0 && st.bad === i) Tx.text('✗', x, y - 2, 14, '#e2574c');
    });
    if (st.drag) bcIng(c, BC_SIDE[st.drag.i], st.drag.x, st.drag.y, 0.8);
    if (st.fly) { const q = Math.min(1, st.fly.t / 0.25); bcIng(c, st.fly.k, st.fly.from[0] + (MX + Z / 2 - st.fly.from[0]) * q, st.fly.from[1] + (MY + Z / 2 - st.fly.from[1]) * q - Math.sin(q * 3.14) * 12, 0.8); }
    // bánh đã gói xếp dưới khuôn
    for (let i = 0; i < Math.min(st.cakes, 12); i++) { const x = 84 + (i % 6) * 12, y = 98 + Math.floor(i / 6) * 11; gR(c, '#2f6b2b', x, y, 10, 10); gR(c, '#3f8f3a', x + 1, y + 1, 8, 8); gR(c, '#d9c690', x + 4, y + 1, 2, 8); gR(c, '#d9c690', x + 1, y + 4, 8, 2); }
    Tx.text(`Bước ${st.step + 1}/8: ${BC_STEPS[st.step][1]}`, 120, 14 + 0, 6.5, '#2a2136', '#fff6e3');
    Tx.text(`Bạn ${st.cakes} · ` + st.npc.map(n => `${n.name.split(' ')[0]} ${n.made}`).join(' · '), 120, 128, 6);
    if (st.msg) Tx.text(st.msg, 120, 92, 5.5, /Nhầm/.test(st.msg) ? '#ffb4a8' : '#fff6e3');
  };
  const tick = (sc, base) => dt => {
    if (!st.fin) st.t += dt;
    st.pen = Math.max(0, st.pen - dt); st.shake = Math.max(0, st.shake - dt); st.pop = Math.max(0, st.pop - dt); sc.meOy = Math.min(0, (sc.meOy || 0) + dt * 10);
    if (st.fly) { st.fly.t += dt; if (st.fly.t > 0.25) st.fly = null; }
    if (!st.fin) st.npc.forEach((n, i) => { const a = sc.actors[base + i]; n.acc += n.rate * dt; const m = Math.floor(n.acc); if (m > n.made) n.hop = 0.3; n.hop = Math.max(0, (n.hop || 0) - dt); if (a) a.oy = n.hop > 0 ? -3 : Math.floor(st.t * 6 + i) % 2 ? -1 : 0; n.made = m; });   // đối thủ lúi húi gói, xong chiếc nào thì nhún lên
    arenaText(`<b>Thi gói bánh chưng</b><div class="sc">Bạn <i>${st.cakes}</i> bánh · ${st.npc.map(n => `${n.name.split(' ')[0]} ${n.made}`).join(' · ')} · ⏱ ${mmss(Math.max(0, T - st.t))}</div><small>Kéo nguyên liệu vào khuôn (hoặc bấm khay / phím 1–6) đúng thứ tự từng bước</small>`);
    if (!st.fin && st.t >= T) st.fin = 1e-9;
    if (st.fin) { st.fin += dt; if (st.fin > 1) { const best = Math.max(...st.npc.map(n => n.made)); return clamp(st.cakes / Math.max(1, best + 1), 0, 1); } }
  };
  const others = () => { for (let i = 1; i < 4; i++) { const [x, y] = BC_TABLES[i]; wRect('#8a5a3a', x - 13, y - 10, 26, 8); wRect('#a9703f', x - 13, y - 10, 26, 2); wRect('#3f8f3a', x - 4, y - 9, 8, 5); } };
  const mine = () => { wRect('#8a5a3a', mx - 13, my - 10, 26, 8); wRect('#a9703f', mx - 13, my - 10, 26, 2); };
  const r = await stageGame({ map: 'school', me: [mx, my, 0], fade: true, hide: BC_HIDE, actors: actors || [], title: 'Hội thi gói bánh chưng', props: [others, mine], cam: { x: 290, y: 196 },
    intro: () => intro || [],
    key: k => { if (/^[1-6]$/.test(k)) apply(+k - 1); },
    bot: () => { st.cakes = 6; for (const n of st.npc) n.made = Math.round(n.rate * T * 0.95); return 0.8; },
    play: (sc, base, esc) => cuPlay(sc, { draw, tick: tick(sc, base),
      down: p => { if (st.fin || st.pen > 0) return; for (let i = 0; i < 6; i++) { const [x, y] = tray(i); if (Math.abs(p[0] - x) <= 18 && Math.abs(p[1] - y) <= 13) { st.drag = { i, x: p[0], y: p[1], x0: p[0], y0: p[1] }; return; } } },
      move: p => { if (st.drag) { st.drag.x = p[0]; st.drag.y = p[1]; } },
      up: p => {
        const D = st.drag; if (!D) return; st.drag = null;
        if (Math.hypot(p[0] - D.x0, p[1] - D.y0) < 6) apply(D.i);                                         // bấm vào khay
        else if (p[0] >= MX - 8 && p[0] <= MX + Z + 8 && p[1] >= MY - 8 && p[1] <= MY + Z + 8) apply(D.i, true);   // thả vào khuôn
      } }, esc) });
  return { cakes: st.cakes, npc: st.npc, score: r.score, skipped: r.skipped };
}
