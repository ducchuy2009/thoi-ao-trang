'use strict';
/* ============================================================
 *  04u. MINI-GAME VĂN NGHỆ dạng CẬN CẢNH (cùng khung với các môn thực hành: stageGame + cuPlay, bảng điểm arena)
 *  - HÁT (sceneSing): mỗi nốt là một chữ của lời bài hát, chạy trên 3 dòng cao độ (Cao / Trung / Trầm) về vạch hát.
 *    Nốt chạm vạch thì bấm đúng dòng: phím 1 / 2 / 3 (hoặc J / K / L), hay bấm thẳng vào dòng đó.
 *    Nốt dài (có đuôi) là chỗ NGÂN: giữ phím tới hết đuôi mới thả. Hát trúng thì thanh “Độ hay” lên, nhân vật hát ra nốt nhạc.
 *  - NHẢY (sceneDance): mũi tên ← ↓ ↑ → bay từ dưới lên ô đích phía trên; tới ô thì bấm đúng phím mũi tên (hoặc W A S D,
 *    hay bấm vào cột). Nhân vật làm động tác theo mũi tên vừa bấm, sàn nhảy nháy đèn theo nhịp.
 *  Dùng ở: micro ở nhà, phòng thu & sân khấu phòng nhạc trường, karaoke Âm Vang.
 * ============================================================ */
const SONG_LINES = [                                                       // lời bài hát tự viết
  'Áo trắng bay trong nắng sân trường',
  'Hàng phượng đỏ thắm góc trời thương',
  'Chung lớp chung bàn chung ước mơ',
  'Mai này xa nhau vẫn nhớ từng giờ',
  'Tiếng ve râm ran gọi hè sang',
  'Lưu bút ghi vội lời chưa nói',
  'Bạn ơi cười lên cho nắng tươi',
  'Một thời áo trắng đẹp tuyệt vời',
];
const MUSIC_JUDGE = { perfect: 0.075, good: 0.16, stray: 0.32 };          // cửa sổ chấm (giây): trúng phóc · trúng · bấm bừa
// nhân vật phóng to ×2 trong khung cận cảnh (chân ở y + 44)
function cuBig(c, look, outfit, dir, x, y, oy, sx) {
  const fr = charSheet(look, outfit)[dir][0], k = fr.hi ? 2 / fr.hi : 2, w = fr.width * k, h = fr.height * k * (sx || 1);
  c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(x + 4, y + 46, 26, 4);
  c.drawImage(fr, x + 16 - w / 2, y + 44 - h + (oy || 0), w, h);
}
// phông nền theo chỗ hát / nhảy
function musicBackdrop(c, place, now, beat) {
  if (place === 'karaoke') {                                                // phòng karaoke: tối, đèn xoay, màn hình lời
    gR(c, '#1d1630', 0, 0, CUW, CUH); gR(c, '#2a2046', 0, 96, CUW, 39);
    for (let i = 0; i < 5; i++) { const a = now / 900 + i * 1.3, x = 120 + Math.cos(a) * 110, y = 20 + Math.sin(a * 1.3) * 12; c.fillStyle = ['rgba(255,90,150,0.18)', 'rgba(90,200,255,0.18)', 'rgba(255,220,90,0.18)'][i % 3]; c.beginPath(); c.moveTo(120, -4); c.lineTo(x - 14, y + 120); c.lineTo(x + 14, y + 120); c.fill(); }
    gR(c, '#c9a467', 0, 96, CUW, 1); for (let x = 0; x < CUW; x += 20) gR(c, (x / 20 + beat) % 2 ? '#3a2d5c' : '#2f2550', x, 97, 20, 38);
    return;
  }
  if (place === 'stage') {                                                  // sân khấu phòng nhạc: rèm đỏ, đèn rọi, sàn nhảy
    gR(c, '#2a1d2e', 0, 0, CUW, CUH);
    for (let x = 0; x < CUW; x += 10) { gR(c, '#9a2a35', x, 0, 9, 92); gR(c, '#b83a45', x + 2, 0, 3, 92); }
    gR(c, '#6f1f28', 0, 0, CUW, 8); for (let x = 0; x < CUW; x += 16) gR(c, '#ffd23a', x + 6, 7, 3, 2);
    for (const sx of [40, 200]) { c.fillStyle = 'rgba(255,246,200,0.13)'; c.beginPath(); c.moveTo(sx - 3, 0); c.lineTo(sx + 3, 0); c.lineTo(sx + 34, 120); c.lineTo(sx - 34, 120); c.fill(); }
    for (let j = 0; j < 3; j++) for (let i = 0; i < 12; i++) { const on = (i + j + beat) % 3 === 0; gR(c, on ? ['#ff5a96', '#5ac8ff', '#ffdc5a'][(i + beat) % 3] : '#3a2d4c', i * 20, 92 + j * 15, 19, 14); }
    return;
  }
  if (place === 'studio') {                                                 // phòng thu: tường mút cách âm, đèn ON AIR
    gR(c, '#4a4560', 0, 0, CUW, CUH);
    for (let y = 0; y < 96; y += 12) for (let x = (y / 12 % 2) * 6; x < CUW; x += 12) { gR(c, '#5a5474', x, y, 10, 10); gR(c, '#6a6488', x + 1, y + 1, 4, 4); }
    gR(c, '#2a2136', 8, 6, 30, 11); gR(c, Math.floor(now / 600) % 2 ? '#e2574c' : '#9a3a33', 9, 7, 28, 9);
    gR(c, '#3a3450', 0, 96, CUW, 39); gR(c, '#2a2136', 0, 96, CUW, 1);
    return;
  }
  // ở nhà: tường phòng ngủ, cửa sổ, sàn gỗ
  gR(c, '#cfe0ea', 0, 0, CUW, 96); gR(c, '#bfd3df', 0, 90, CUW, 6);
  gR(c, '#fffaf0', 10, 14, 28, 22); gR(c, '#8fc1e3', 12, 16, 24, 18); gR(c, '#fffaf0', 23, 16, 2, 18);
  gR(c, '#8a5a3a', 0, 96, CUW, 39); for (let y = 100; y < CUH; y += 8) gR(c, '#a9703f', 0, y, CUW, 1);
}
// hai bên chung: dựng nốt, chấm điểm, nút bấm theo cột / dòng
function rhythmCore(notes, lanes) {
  const st = { t: -2.2, notes, combo: 0, best: 0, sum: 0, fb: '', fbT: 0, fbLane: 0, held: new Array(lanes).fill(null), flash: new Array(lanes).fill(0), last: -1, lastT: 0, end: 0 };
  st.press = lane => {
    st.flash[lane] = 0.15; st.last = lane; st.lastT = 0.35;
    let n = null;
    for (const x of st.notes) if (!x.j && x.lane === lane && Math.abs(x.t - st.t) <= MUSIC_JUDGE.good) { n = x; break; }
    if (!n) { if (st.notes.some(x => !x.j && Math.abs(x.t - st.t) < MUSIC_JUDGE.stray)) { st.combo = 0; st.fb = 'Lạc nhịp!'; st.fbT = 0.5; st.fbLane = lane; } return; }
    const e = Math.abs(n.t - st.t), p = e <= MUSIC_JUDGE.perfect;
    n.j = p ? 2 : 1; n.v = p ? 1 : 0.7;
    if (n.len) { st.held[lane] = n; n.v *= 0.5; } else st.sum += n.v;
    st.combo++; st.best = Math.max(st.best, st.combo); st.fb = p ? 'Tuyệt!' : 'Hay!'; st.fbT = 0.5; st.fbLane = lane;
  };
  st.release = lane => {
    const n = st.held[lane]; if (!n) return;
    st.held[lane] = null;
    if (st.t >= n.t + n.len - 0.14) { n.v *= 2; st.fb = 'Ngân tròn!'; } else { st.fb = 'Ngân hụt hơi'; st.combo = 0; }
    st.sum += n.v; st.fbT = 0.5; st.fbLane = lane;
  };
  st.step = dt => {
    st.t += dt; st.fbT = Math.max(0, st.fbT - dt); st.lastT = Math.max(0, st.lastT - dt);
    for (let i = 0; i < lanes; i++) st.flash[i] = Math.max(0, st.flash[i] - dt);
    for (const n of st.notes) if (!n.j && st.t > n.t + MUSIC_JUDGE.good) { n.j = -1; n.v = 0; st.combo = 0; st.fb = 'Trượt'; st.fbT = 0.4; st.fbLane = n.lane; }
    for (let i = 0; i < lanes; i++) { const n = st.held[i]; if (n && st.t >= n.t + n.len + 0.05) st.release(i); }     // giữ quá đuôi: tự tính ngân tròn
    const lastT = st.notes.reduce((a, n) => Math.max(a, n.t + (n.len || 0)), 0);
    if (st.t > lastT + 0.8) st.end += dt;
  };
  st.score = () => st.sum / Math.max(1, st.notes.length);
  return st;
}

/* ---------- HÁT ---------- */
async function sceneSing(d, place, title) {
  d = clamp(d || 2, 1, 5);
  const beat = 0.62 - 0.05 * d, travel = 2.5 - 0.22 * d, lines = [];
  const pool = SONG_LINES.slice(); for (let i = 0; i < 2; i++) lines.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  const notes = []; let t = 0.4, lane = 1;
  lines.forEach((ln, li) => {
    const words = ln.split(' ');
    words.forEach((w, wi) => {
      lane = clamp(lane + (Math.random() < 0.5 ? -1 : 1) * (Math.random() < 0.7 ? 1 : 0), 0, 2);
      const long = wi === words.length - 1 || (d >= 2 && wi === 3 && Math.random() < 0.5);
      notes.push({ t, lane, w, len: long ? beat * (1.6 + 0.2 * d) : 0, line: li, wi });
      t += long ? beat * (2.4 + 0.2 * d) : beat * (Math.random() < 0.25 && d >= 3 ? 0.5 : 1);
    });
    t += beat;
  });
  const st = rhythmCore(notes, 3), HX = 96, LY = [32, 54, 76], X1 = 236, sp = (X1 - HX) / travel, look = G.gender, outfit = RT.outfit || 'casual';
  const LC = ['#ff8fb4', '#ffd23a', '#7fd1ff'], LN = ['Cao', 'Trung', 'Trầm'], KEYN = ['1', '2', '3'];
  const draw = (c, T, now) => {
    const bt = Math.floor((st.t + 3) / beat);
    musicBackdrop(c, place, now, bt);
    // người hát cầm micro bên trái; đang hát trúng thì nốt nhạc bay ra
    const singing = st.held.some(Boolean) || st.lastT > 0, bob = Math.round(Math.sin(st.t / beat * Math.PI) * (singing ? 1.5 : 0.6));
    cuBig(c, look, outfit, 0, 12, 50, bob);
    gR(c, '#2a2136', 33, 57 + bob, 4, 4); gR(c, '#5f656f', 34, 61 + bob, 2, 10); gR(c, '#8b8f9c', 34, 57 + bob, 2, 1);
    if (singing) for (let i = 0; i < 3; i++) { const k = ((now / 700) + i / 3) % 1, x = 40 + k * 18 + Math.sin(k * 9 + i) * 3, y = 56 - k * 26; c.globalAlpha = 1 - k; gR(c, LC[i], x, y, 3, 3); gR(c, LC[i], x + 2, y - 5, 1, 5); c.globalAlpha = 1; }
    // bảng nốt
    c.fillStyle = 'rgba(20,16,36,0.72)'; c.fillRect(64, 18, 174, 72);
    for (let i = 0; i < 3; i++) {
      gR(c, 'rgba(255,255,255,0.12)', 64, LY[i], 174, 1);
      T.text(LN[i], 75, LY[i], 4.6, LC[i]);
      const f = st.flash[i] > 0; gR(c, f ? '#fffaf0' : '#2a2136', HX - 7, LY[i] - 7, 14, 14); gR(c, f ? LC[i] : '#3a3050', HX - 6, LY[i] - 6, 12, 12);
      T.text(KEYN[i], HX, LY[i], 5, f ? '#2a2136' : '#c9c2dc', null);
    }
    gR(c, 'rgba(255,246,227,0.5)', HX, 20, 1, 68);
    for (const n of st.notes) {
      const x = HX + (n.t - st.t) * sp, w = n.len ? Math.max(12, n.len * sp) : 0;
      if (x > X1 + 4 || x + w < 64 || n.j === 2 && !n.len || n.j === 1 && !n.len) continue;
      if (n.j === -1 && x < HX - 10) continue;
      const y = LY[n.lane], col = n.j === -1 ? '#6a647a' : LC[n.lane];
      if (n.len) { const x0 = Math.max(HX, x), x1 = x + w; if (x1 > x0) { gR(c, shade(col, -30), x0, y - 3, x1 - x0, 6); gR(c, col, x0, y - 2, x1 - x0, 4); } }
      if (!(n.len && n.j > 0)) { gR(c, '#2a2136', x - 9, y - 6, 18, 12); gR(c, col, x - 8, y - 5, 16, 10); gR(c, shade(col, 30), x - 8, y - 5, 16, 2); T.text(n.w, x, y + 0.5, 4.2, '#2a2136', null); }
    }
    // lời bài hát kiểu karaoke: dòng đang hát, chữ đã hát đổi màu
    const cur = st.notes.find(n => !n.j) || st.notes[st.notes.length - 1], li = cur.line, ws = lines[li].split(' '), done = st.notes.filter(n => n.line === li && n.j).length;
    c.fillStyle = 'rgba(20,16,36,0.6)'; c.fillRect(8, 104, 224, 24);
    const L = ws.reduce((a, w) => a + w.length + 1, -1), cw = Math.min(5.6, 200 / L);
    let xx = 120 - L * cw / 2;
    ws.forEach((w, i) => { T.text(w, xx + w.length * cw / 2, 116, 6, i < done ? '#ffd23a' : '#fff6e3'); xx += (w.length + 1) * cw; });
    // thanh độ hay
    const sc = st.score() * notes.length / Math.max(1, st.notes.filter(n => n.j).length || 1);
    gR(c, '#2a2136', 64, 6, 116, 8); gR(c, '#5f656f', 65, 7, 114, 6); gR(c, sc >= 0.8 ? '#5fd068' : sc >= 0.5 ? '#ffd23a' : '#e2574c', 65, 7, 114 * clamp(st.sum / notes.length * 1.15, 0, 1), 6);
    T.text('ĐỘ HAY', 205, 10, 5);
    if (st.combo >= 3) T.text(`${st.combo} nốt liền`, 150, 96, 5, '#ffd23a');
    if (st.fbT > 0) T.text(st.fb, HX + 14, LY[st.fbLane] - 9 - (0.5 - st.fbT) * 12, 6, /Trượt|Lạc|hụt/.test(st.fb) ? '#ffb4a8' : '#fff6e3');
    if (st.t < 0) T.text(String(Math.ceil(-st.t / 0.75)), 150, 54, 16, '#ffd23a');
  };
  const tick = dt => {
    st.step(dt);
    arenaText(`<b>${title || 'Hát'}</b><div class="sc">Độ hay <i>${Math.round(st.sum / notes.length * 100)}%</i> · chuỗi ${st.combo} (cao nhất ${st.best})</div><small>Nốt chạm vạch thì bấm đúng dòng: 1 = Cao · 2 = Trung · 3 = Trầm (hoặc J K L / bấm vào dòng). Nốt có đuôi: GIỮ tới hết đuôi để ngân.</small>`);
    if (st.end > 0.6) return Math.max(0.0001, st.score());
  };
  const laneOf = p => { let b = 0; for (let i = 1; i < 3; i++) if (Math.abs(p[1] - LY[i]) < Math.abs(p[1] - LY[b])) b = i; return b; };
  const keyLane = k => ({ 1: 0, 2: 1, 3: 2, j: 0, k: 1, l: 2 })[k];
  const codeLane = c => ({ Digit1: 0, Numpad1: 0, KeyJ: 0, Digit2: 1, Numpad2: 1, KeyK: 1, Digit3: 2, Numpad3: 2, KeyL: 2 })[c];
  let ptrLane = -1;
  return stageGame({ title: title || 'Hát', cam: { x: G.x, y: G.y - 24 },
    intro: () => [{ say: ['me', place === 'karaoke' ? 'Bài tủ của mình đây! Mic đâu rồi?' : 'Hít một hơi thật sâu… bắt đầu nào!'] }],
    key: k => { const l = keyLane(k); if (l !== undefined) st.press(l); },
    bot: () => clamp(0.5 + 0.045 * lv('vannghe') - 0.05 * d + 0.25 * Math.random(), 0.2, 1),
    play: (sc, base, esc) => cuPlay(sc, { draw, tick,
      down: p => { if (!cuIn(p) || p[0] < 64) return; ptrLane = laneOf(p); st.press(ptrLane); },
      up: () => { if (ptrLane >= 0) st.release(ptrLane); ptrLane = -1; },
      keyup: e => { const l = codeLane(e.code); if (l !== undefined) st.release(l); } }, esc),
    outro: (b, s) => [{ say: ['me', s >= 0.8 ? 'Hát phiêu quá, nổi da gà luôn!' : s >= 0.5 ? 'Cũng tròn vành rõ chữ đấy chứ.' : 'Lạc giọng hơi nhiều… tập thêm thôi.'] }] });
}

/* ---------- NHẢY ---------- */
async function sceneDance(d, place, title) {
  d = clamp(d || 2, 1, 5);
  const beat = 0.56 - 0.04 * d, travel = 1.9 - 0.18 * d, n0 = 14 + 4 * d, notes = [];
  let t = 0.4, prev = -1;
  for (let i = 0; i < n0; i++) {
    let lane = Math.floor(Math.random() * 4); if (lane === prev && Math.random() < 0.6) lane = (lane + 1 + Math.floor(Math.random() * 3)) % 4; prev = lane;
    notes.push({ t, lane, len: 0 });
    t += beat * (d >= 3 && Math.random() < 0.3 ? 0.5 : 1) + (i % 8 === 7 ? beat : 0);
  }
  const st = rhythmCore(notes, 4), CX = [134, 160, 186, 212], TY = 22, Y1 = 132, sp = (Y1 - TY) / travel, look = G.gender, outfit = RT.outfit || 'casual';
  const AC = ['#ff8fb4', '#7fd1ff', '#8fe06f', '#ffd23a'];
  // mũi tên: 0 trái · 1 xuống · 2 lên · 3 phải
  const ARW = ['....#....', '...###...', '..#####..', '.#######.', '#########', '...###...', '...###...', '...###...'];
  const arrow = (c, cx0, cy0, dir, col) => {
    const pts = [];
    for (let j = 0; j < ARW.length; j++) for (let i = 0; i < 9; i++) if (ARW[j][i] === '#') { const a = i - 4, b = j - 4; pts.push([...(dir === 2 ? [a, b] : dir === 1 ? [a, -b] : dir === 0 ? [b, a] : [-b, a]), j]); }
    for (const [x, y] of pts) gR(c, '#2a2136', cx0 + x - 1, cy0 + y - 1, 3, 3);
    for (const [x, y, j] of pts) gR(c, j < 3 ? shade(col, 28) : col, cx0 + x, cy0 + y, 1, 1);
  };
  const draw = (c, T, now) => {
    const bt = Math.floor((st.t + 3) / beat);
    musicBackdrop(c, place, now, bt);
    // người nhảy: động tác theo mũi tên vừa bấm
    const mv = st.lastT > 0 ? st.last : -1, ph = (st.t / beat) % 1;
    let dir = 0, ox = 0, oy = -Math.round(Math.abs(Math.sin(ph * Math.PI)) * 2), sq = 1;
    if (mv === 0) { dir = 1; ox = -6; } else if (mv === 3) { dir = 2; ox = 6; } else if (mv === 2) { oy = -10; } else if (mv === 1) { sq = 0.82; oy = 0; }
    cuBig(c, look, outfit, dir, 40 + ox, 48, oy, sq);
    if (mv === 2) for (let i = 0; i < 4; i++) gR(c, '#fff6c8', 46 + i * 7, 96 + (i % 2) * 2, 2, 1);
    // bảng mũi tên
    c.fillStyle = 'rgba(20,16,36,0.6)'; c.fillRect(120, 4, 106, 128);
    for (let i = 0; i < 4; i++) { gR(c, 'rgba(255,255,255,0.08)', CX[i] - 9, 4, 18, 128); arrow(c, CX[i], TY, i, '#4a4266'); if (st.flash[i] > 0) { c.globalAlpha = st.flash[i] / 0.15; arrow(c, CX[i], TY, i, AC[i]); c.globalAlpha = 1; } }
    for (const n of st.notes) {
      if (n.j > 0) continue;
      const y = TY + (n.t - st.t) * sp; if (y > Y1 + 8 || y < -8) continue;
      arrow(c, CX[n.lane], Math.round(y), n.lane, n.j === -1 ? '#6a647a' : AC[n.lane]);
    }
    if (st.combo >= 3) T.text(`${st.combo} COMBO`, 56, 16, 7, '#ffd23a');
    if (st.fbT > 0) T.text(st.fb, CX[st.fbLane], TY + 14 + (0.5 - st.fbT) * 10, 6, /Trượt|Lạc/.test(st.fb) ? '#ffb4a8' : '#fff6e3');
    gR(c, '#2a2136', 8, 122, 104, 7); gR(c, '#5f656f', 9, 123, 102, 5); gR(c, '#5fd068', 9, 123, 102 * clamp(st.sum / notes.length * 1.15, 0, 1), 5);
    if (st.t < 0) T.text(String(Math.ceil(-st.t / 0.75)), 172, 66, 16, '#ffd23a');
  };
  const KK = [['arrowleft', 'a'], ['arrowdown', 's'], ['arrowup', 'w'], ['arrowright', 'd']], prevK = [false, false, false, false];
  const tick = dt => {
    for (let i = 0; i < 4; i++) { const on = KK[i].some(k => KEYS[k]); if (on && !prevK[i]) st.press(i); prevK[i] = on; }
    st.step(dt);
    arenaText(`<b>${title || 'Nhảy'}</b><div class="sc">Điểm <i>${Math.round(st.sum / notes.length * 100)}%</i> · combo ${st.combo} (cao nhất ${st.best})</div><small>Mũi tên bay lên chạm ô phía trên thì bấm đúng phím ← ↓ ↑ → (hoặc A S W D / bấm vào cột).</small>`);
    if (st.end > 0.6) return Math.max(0.0001, st.score());
  };
  return stageGame({ title: title || 'Nhảy', cam: { x: G.x, y: G.y - 24 },
    intro: () => [{ say: ['me', 'Nhạc lên rồi! Một, hai, ba, nhảy!'] }],
    bot: () => clamp(0.48 + 0.045 * lv('vannghe') + 0.01 * lv('thethao') - 0.05 * d + 0.25 * Math.random(), 0.2, 1),
    play: (sc, base, esc) => { for (const k in KEYS) KEYS[k] = false; return cuPlay(sc, { draw, tick, down: p => { if (!cuIn(p) || p[0] < 120) return; let b = 0; for (let i = 1; i < 4; i++) if (Math.abs(p[0] - CX[i]) < Math.abs(p[0] - CX[b])) b = i; st.press(b); } }, esc); },
    outro: (b, s) => [{ say: ['me', s >= 0.8 ? 'Nhảy cháy sàn luôn!' : s >= 0.5 ? 'Cũng ra dáng vũ công đấy.' : 'Chân nọ đá chân kia rồi…'] }] });
}
