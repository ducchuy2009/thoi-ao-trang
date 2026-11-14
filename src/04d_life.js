'use strict';
/* ============================================================
 *  04d. ĐỜI SỐNG HỌC ĐƯỜNG
 *  - Tụ chơi giờ ra chơi / nghỉ trưa (tám chuyện, đánh bài, chọi con quay, rồng rắn lên mây, trốn tìm, đuổi bắt, đá bóng, đá cầu, ăn trưa)
 *  - Hoạt ảnh trong tiết học (đọc sách / chép bài, lắp súng, ném bóng – tâng cầu), kiểm tra miệng, phát đề kiểm tra
 *  - Kiệt sức ngủ gật → trạm y tế · phòng ngủ trưa · phòng nhạc · thư viện · khu vệ sinh
 *  - Bên trong TTTM, khu game, nhà bạn · cửa hàng dạng icon · danh bạ điện thoại
 * ============================================================ */
const dirOf = (dx, dy) => (Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0));
const meWho = () => ({ look: G.gender, outfit: RT.outfit || (schoolToday() ? null : 'casual') });
const meSay = (html, buttons) => UI.ask(G.name, html, buttons || ['OK'], { who: meWho() });       // tự sự: hội thoại dưới màn hình, chân dung của mình
const coOf = subj => (TEACHER_OF[subj] === 'teacherC' || subj === 'qp' || subj === 'td' ? 'Thầy' : 'Cô');
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ============================================================
 *  TỤ CHƠI NGOÀI SÂN
 * ============================================================ */
const YARD_KIDS = ['khoa', 'vy', 'dat', 'ngan', 'm1', 'm3', 'm4', 'm5', 'x1', 'x2', 'x3', 'x4'];
// chỗ đặt từng tụ: [x, y] tâm
const YARD_SPOT = { chat: [250, 256], chat2: [168, 326], danhbai: [200, 206], conquay: [384, 216], dacau: [302, 236], duoibat: [352, 300], rongran: [232, 316], dabong: [584, 250], trontim: [448, 304], eat: [150, 192], eat2: [80, 116] };
const HIDE_SPOTS = [[448, 174], [110, 284], [70, 203], [110, 174], [44, 240]];          // núp sau gốc cây, bụi rậm
const EAT_SEATS = { eat: [[124, 187], [176, 187]], eat2: [[62, 112], [84, 113]] };          // hai bên ghế đá · trước quầy căn tin
let YS = null;
function yardState() {
  if (!G || !schoolToday() || RT.scene) return null;
  const wi = YARD_WINDOWS.findIndex(([a, b]) => inWin(G.time, a, b)); if (wi < 0) return null;
  const key = G.day * 10 + wi; if (YS && YS.key === key) return YS;
  const rnd01 = mulberry(key * 7919 + 13), sh = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd01() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const kids = sh(YARD_KIDS.slice()), groups = [], where = {}, lunch = wi === 2;
  const take = (kind, spot, n) => { const mem = kids.splice(0, n); if (!mem.length) return; const g = { id: spot, kind, mem, c: YARD_SPOT[spot] }; groups.push(g); mem.forEach((k, i) => { where[k] = [g, i]; }); };
  if (lunch) {        // nghỉ trưa: vài bạn vào phòng ngủ trưa, vài bạn ăn ở căn tin / ghế đá
    const nap = kids.filter(k => !FRIENDS[k]).slice(0, 2); for (const k of nap) kids.splice(kids.indexOf(k), 1);
    take('eat', 'eat2', 2); take('eat', 'eat', 2);
  }
  const kinds = sh(['danhbai', 'conquay', 'rongran', 'trontim', 'duoibat', 'dabong', 'dacau']);
  take('chat', 'chat', lunch ? 2 : 3);
  for (const k of kinds) { if (kids.length < 2) break; take(k, k, Math.min(YARD_GAMES[k].n, kids.length)); }
  if (kids.length > 1) take('chat', 'chat2', kids.length);
  else if (kids.length) { const g = groups[groups.length - 1]; where[kids[0]] = [g, g.mem.length]; g.mem.push(kids[0]); }
  return (YS = { key, wi, groups, where });
}
// Vị trí + dáng của một học sinh trong tụ chơi (gọi mỗi khung hình)
function yardPos(sid) {
  const st = yardState(); if (!st) return null;
  const w = st.where[sid]; if (!w) return null;
  const [g, i] = w, n = g.mem.length, [cx0, cy0] = g.c, t = performance.now() / 1000, ring = (r, ry) => { const a = i / n * 6.283 + 0.6; return { x: cx0 + Math.cos(a) * r, y: cy0 + Math.sin(a) * ry }; };
  if (g.kind === 'chat' || g.kind === 'danhbai' || g.kind === 'conquay') {
    const p = ring(g.kind === 'chat' ? 12 : 15, g.kind === 'chat' ? 8 : 10), talk = g.kind === 'chat' && (Math.floor(t / 1.6) + i) % n === 0;
    return { x: p.x, y: p.y, dir: dirOf(cx0 - p.x, cy0 - p.y), oy: talk ? -Math.abs(Math.sin(t * 6)) * 2 : 0 };
  }
  if (g.kind === 'eat') { const s = EAT_SEATS[g.id][i] || EAT_SEATS[g.id][0]; return { x: s[0], y: s[1], dir: 0 }; }
  if (g.kind === 'rongran') {        // nối đuôi nhau lượn hình số 8
    const f = a => [cx0 + Math.sin(a) * 40, cy0 + Math.sin(a * 2) * 11], a = t * 0.9 - i * 0.42, p = f(a), q = f(a + 0.05);
    return { x: p[0], y: p[1], dir: dirOf(q[0] - p[0], q[1] - p[1]), walk: t + i * 0.3 };
  }
  if (g.kind === 'duoibat') {
    const a = t * 1.5 + i * (6.283 / n) + Math.sin(t * 0.7 + i) * 0.35, x = cx0 + Math.cos(a) * 34, y = cy0 + Math.sin(a) * 17;
    return { x, y, dir: dirOf(-Math.sin(a) * 34, Math.cos(a) * 17), walk: t + i * 0.3 };
  }
  if (g.kind === 'trontim') {
    if (i === 0) return { x: cx0, y: cy0, dir: 3, oy: 0 };                               // người đếm úp mặt vào gốc phượng
    const h = HIDE_SPOTS[(i - 1) % HIDE_SPOTS.length];
    return { x: h[0] + Math.round(Math.sin(t * 0.8 + i * 2) * 2), y: h[1], dir: 0 };      // thập thò ló ra nhìn
  }
  if (g.kind === 'dabong') {
    const b = ballPos(g, t), bx = cx0 + [-46, 40, -10, 20][i % 4], by = cy0 + [-22, 26, 34, -34][i % 4];
    const x = bx + (b.x - bx) * 0.45 + Math.sin(t * 1.1 + i * 1.7) * 6, y = by + (b.y - by) * 0.45 + Math.cos(t * 0.9 + i * 2.3) * 4;
    return { x, y, dir: dirOf(b.x - x, b.y - y), walk: t + i * 0.25 };
  }
  if (g.kind === 'dacau') { const p = ring(20, 13); return { x: p.x, y: p.y, dir: dirOf(cx0 - p.x, cy0 - p.y), oy: (Math.floor(t / 0.8) % n === i && (t % 0.8) < 0.2) ? -3 : 0 }; }
  return { x: cx0, y: cy0, dir: 0 };
}
const ballPos = (g, t) => ({ x: g.c[0] + Math.sin(t * 0.9) * 62, y: g.c[1] + Math.sin(t * 1.7 + 1) * 34 });
// Đạo cụ của các tụ chơi: bài, con quay, quả bóng, quả cầu, hộp cơm
function drawYardProps(now) {
  const st = yardState(); if (!st || G.map !== 'school') return;
  const t = now / 1000;
  for (const g of st.groups) {
    const [x, y] = g.c, n = g.mem.length;
    if (g.kind === 'danhbai') cardsProp(now, x - 6, y - 4);
    else if (g.kind === 'conquay') { topProp(now, x - 5, y + 2, 'top', 0); topProp(now, x + 4, y + 3, 'topB', 1); }
    else if (g.kind === 'dabong') { const b = ballPos(g, t); drawSpr(SHADOW, b.x - 7, b.y - 1); drawSpr(SPR.ball, b.x - 3, b.y - 5 - Math.abs(Math.sin(t * 5)) * 4); }
    else if (g.kind === 'dacau') {      // quả cầu bay theo đường vòng cung từ bạn này sang bạn kia
      const k = Math.floor(t / 0.8) % n, f = (t % 0.8) / 0.8, a = k / n * 6.283 + 0.6, b = ((k + 1) % n) / n * 6.283 + 0.6;
      const ax = x + Math.cos(a) * 20, ay = y + Math.sin(a) * 13, bx = x + Math.cos(b) * 20, by = y + Math.sin(b) * 13;
      drawSpr(SPR.shuttle, ax + (bx - ax) * f - 2, ay + (by - ay) * f - 12 - Math.sin(f * 3.14) * 20);
    }
    else if (g.kind === 'eat') g.mem.forEach((k, i) => { const s = EAT_SEATS[g.id][i]; if (s) drawSpr(SPR.ricebox, s[0] - 4, s[1] - 11 + (Math.floor(t * 2 + i) % 4 === 0 ? -1 : 0)); });
    else if (g.kind === 'trontim') { const c5 = 5 - Math.floor(t % 5); wRect('#2a2136', x - 3, y - 36, 7, 9); wRect('#fff6e3', x - 2, y - 35, 5, 7); for (let d = 0; d < c5; d++) wRect('#d9534f', x - 1 + (d % 2) * 2, y - 34 + Math.floor(d / 2) * 2, 1, 1); }
  }
}
// Điểm tương tác ở giữa mỗi tụ: bấm để xin vào chơi
function yardTargets(a) {
  if (G.map !== 'school') return;
  const st = yardState(); if (!st) return;
  for (const g of st.groups) {
    const [x, y] = g.c, Y = YARD_GAMES[g.kind];
    a.push({ x: x - 8, y: y - 8, w: 16, h: 14, rx: x - 5, ry: y - 4, rw: 10, rh: 6, base: y - 30, label: () => `Tụ ${Y.name} — xin vào chơi cùng`, act: () => ACT.yardJoin(g), range: 30 });
  }
}
const kidName = k => (FRIENDS[k] ? FRIENDS[k].name : null);
ACT.yardJoin = async g => {
  if (RT.lock) return;
  const Y = YARD_GAMES[g.kind], st = yardState(), key = st.key + ':' + g.id, fr = g.mem.filter(k => FRIENDS[k] && !grudge(k) && !isComp(k));
  if (G.daily.yard[key]) return UI.toast('Bạn vừa chơi với tụ này xong rồi.');
  const names = fr.map(kidName), who = names.length ? names.join(', ') + (g.mem.length > fr.length ? ' và mấy bạn khác' : '') : 'Mấy bạn cùng khối';
  if (Y.sport && G.stamina < 6) return UI.toast('Mệt quá, chơi không nổi.', 'bad');
  const c = await UI.ask(`Tụ ${Y.name}`, `<p>${who} đang ${Y.game && !Y.sport && g.kind !== 'danhbai' ? 'chơi ' : ''}${Y.name}. Xin vào cùng?</p>`, [Y.game ? 'Vào chơi cùng' : 'Ngồi xuống cùng', 'Thôi']);
  if (c !== 0) return;
  RT.lock = true; G.daily.yard[key] = true;
  let sc = 0.7;
  if (Y.game) sc = (await playGame(Y.game, 2, Y.name.replace(/^./, x => x.toUpperCase()), Y.what)).score;
  const win = sc >= 0.6;
  for (const k of fr) addFriend(k, YARD_JOIN.friend + (win ? YARD_JOIN.bonus : 0), true);
  if (fr.length) UI.float(`+${YARD_JOIN.friend + (win ? YARD_JOIN.bonus : 0)} thân thiết với ${names.join(', ')}`, '#ff9fc0');
  addStat('giaotiep', fr.length ? 2 : 1);
  if (Y.sport) { useStam(5, true); addStat('thethao', Y.sport + (win ? 1 : 0)); }
  if (g.kind === 'conquay' || g.kind === 'danhbai') addStat('kheotay', 1);
  if (g.kind === 'eat') { const f = ['comhop', 'banhmi', 'sua'].find(k => G.inv[k]); if (f) eat(f); else gainStam(3); }
  advanceTime(YARD_JOIN.mins);
  RT.lock = false; UI.hud();
  UI.toast(Y.game ? (win ? `Chơi ${Y.name} vui quá trời!` : `Chơi ${Y.name} hơi vụng, nhưng vui là chính.`) : 'Ngồi xuống góp chuyện cùng cả bọn.', win ? 'good' : 'info');
};

/* ============================================================
 *  TRONG TIẾT HỌC: đạo cụ + hoạt ảnh
 * ============================================================ */
const CLASS_X = [40, 104, 184, 248], CLASS_Y = [70, 104, 138, 172];
// sách mở trên bàn / giấy kiểm tra / bút chì ngoáy ngoáy
function classProps(now) {
  const sc = RT.scene; if (!sc) return;
  const f = Math.floor(now / 170);
  if (sc.type === 'class') {
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) for (let sd = 0; sd < 2; sd++) {
      const x = CLASS_X[c] + 3 + sd * 14, y = CLASS_Y[r] + 1, mine = c === 1 && r === 1 && sd === 0, k = c * 7 + r * 3 + sd;
      if (mine && (sc.away || sc.mode === 'sleep')) continue;
      if (sc.mode === 'test') { if (r >= (sc.papers || 0)) continue; drawSpr(SPR.paper, x, y); if (sc.writing) wRect('#2a2136', x + 1 + (f + k) % 4, y + 1 + ((f + k) >> 2) % 3, 1, 1); }
      else { drawSpr(SPR.book, x, y); if ((k + (f >> 4)) % 3 === 0) wRect('#3b82c4', x + 1 + (f + k) % 5, y + 5, 2, 1); }       // bạn thì đọc, bạn thì chép bài
    }
    if (sc.mode === 'sleep') drawSpr(SPR.zzz, G.x + 4, G.y - 34 - (f >> 1) % 4);
  } else if (sc.type === 'yard' && sc.kind) {
    const all = sc.actors.slice(0, -1).map(a => [a.x, a.y]).concat([[G.x, G.y]]), t = now / 1000;
    all.forEach(([x, y], i) => {
      if (sc.kind === 'qp') { drawSpr(SPR.gunpart, x - 6, y - 10 + ((f + i) % 6 === 0 ? -1 : 0)); if ((f + i * 2) % 8 < 2) wRect('#fff6e3', x + 4, y - 12, 1, 1); }
      else if (i % 2) drawSpr(SPR.shuttle, x + 5, y - 6 - Math.abs(Math.sin(t * 4 + i)) * 14);          // tâng cầu
      else drawSpr(SPR.bball, x - 3, y - 26 - Math.abs(Math.sin(t * 3 + i)) * 12);                        // ném bóng rổ
    });
  }
}
// Cô đi dọc lối giữa phát giấy kiểm tra từng dãy bàn, rồi cả lớp cắm cúi làm bài
async function handOut() {
  const sc = RT.scene; if (!sc || sc.type !== 'class') return;
  sc.mode = 'test'; sc.papers = 0; sc.writing = false;
  await tween(0, 158, 62, 260);
  for (let r = 0; r < 4; r++) { await tween(0, 158, CLASS_Y[r] + 24, 240); sc.papers = r + 1; await UI.wait(140); }
  await tween(0, 158, 62, 420); await tween(0, 160, 52, 160); sc.actors[0].dir = 0;
  sc.writing = true;
}
// Lên bàn giáo viên trả bài
async function toTeacherDesk() {
  const sc = RT.scene; sc.away = true;
  tween(0, 54, 34, 600).then(() => { sc.actors[0].dir = 0; });
  await tween('me', 111, 144, 160); await tween('me', 152, 144, 300); await tween('me', 152, 68, 520); await tween('me', 54, 68, 620); G.dir = 3;
}
async function backToSeat() {
  const sc = RT.scene;
  tween(0, 160, 52, 600).then(() => { sc.actors[0].dir = 0; });
  await tween('me', 152, 68, 620); await tween('me', 152, 144, 520); await tween('me', 111, 144, 300); await tween('me', SEAT.x, SEAT.y, 160); G.dir = 3; sc.away = false;
}
const scoreTalk = (who, title, label, r) => UI.ask(title, `<p>${label} <span class="score">${fmtScore(r.score)}</span></p>` + (r.notes.length ? '<p class="dim">' + r.notes.join(' · ') + '</p>' : ''), ['Dạ'], { who });

/* ============================================================
 *  KIỆT SỨC: ngủ gật trong lớp → trạm y tế, nghỉ học luôn hôm đó
 * ============================================================ */
const BED_SPOT = { x: 66, y: 112 };
async function faintFlow(p, subj) {
  const sc = RT.scene, co = coOf(subj);
  if (sc && sc.type === 'class') { sc.mode = 'sleep'; await UI.progress('Mắt díp lại… gục xuống bàn…', 2200, '#8b8f9c'); }
  else await UI.progress('Mắt hoa lên… chân đứng không vững…', 1800, '#8b8f9c');
  await UI.ask(`${co} giáo`, `<p>“${G.name}! ${G.name} ơi! Em sao thế này? Các em đỡ bạn xuống trạm y tế giúp ${co.toLowerCase()}!”</p>`, ['…'], { who: { look: (sc && sc.actors && sc.actors.length && sc.actors[sc.actors.length - 1].look) || 'teacherA' } });
  await UI.fade(true);
  RT.scene = null; RT.outfit = null; RT.tid = null;
  setMap('yte', BED_SPOT.x, BED_SPOT.y, 0);
  for (const q of PERIODS) G.daily.done[q.n] = true;          // nghỉ hết các tiết còn lại, không tính vắng
  G.daily.fainted = true;
  advanceTime(Math.max(FAINT.rest, PERIOD_LEN));
  G.stamina = Math.max(G.stamina, Math.round(maxStam() * FAINT.stam));
  await UI.fade(false);
  await UI.ask('Cô y tá', `<p>“Em tỉnh rồi à? Em bị <b>ngất trong giờ học</b> vì kiệt sức đấy. Cô cho em nghỉ hết buổi hôm nay rồi.”</p><p>“Lần sau nhớ ăn uống đầy đủ, buổi trưa xuống phòng ngủ trưa chợp mắt một lát, đừng thức khuya nữa. Phải để ý sức khoẻ của mình hơn nhé.”</p>`, ['Dạ, em cảm ơn cô'], { who: { look: 'doctor' } });
  addParent(-1, '', true);
  UI.toast('Hôm nay được nghỉ học. Cổng trường mở cho bạn về.', 'info');
}
ACT.infirmary = async () => {
  if (RT.lock) return;
  if (G.daily.rest >= 2) return UI.ask('Cô y tá', '<p>“Em nghỉ ở đây hai lần rồi. Khoẻ rồi thì về lớp đi em.”</p>', ['Dạ'], { who: { look: 'doctor' } });
  const c = await UI.ask('Cô y tá', `<p>“Em thấy trong người thế nào? Mệt thì nằm nghỉ một lát.”</p><p class="dim">Nằm nghỉ 30 phút hồi ${INFIRM.stam} thể lực. Nghỉ trong giờ học thì vẫn bị tính vắng tiết.</p>`, ['Nằm nghỉ 30 phút', 'Thôi ạ'], { who: { look: 'doctor' } });
  if (c !== 0) return;
  await activity('Đang nằm nghỉ ở trạm y tế…', INFIRM.mins, () => { G.daily.rest = (G.daily.rest || 0) + 1; gainStam(INFIRM.stam); });
};

/* ============================================================
 *  PHÒNG NGỦ TRƯA · THƯ VIỆN · PHÒNG NHẠC · KHU VỆ SINH
 * ============================================================ */
ACT.nap = async () => {
  if (!schoolToday() || !inWin(G.time, AM_END, PM_START - 30)) return meSay(`<p>Phòng ngủ trưa chỉ mở giờ nghỉ trưa (${fmtTime(AM_END)}–${fmtTime(PM_START - 30)}).</p>`);
  if (G.daily.nap) return UI.toast('Hôm nay bạn ngủ trưa rồi.');
  if (RT.lock) return;
  RT.lock = true;
  UI.progress('Đang ngủ trưa…', 2400, '#8f7fd0');
  await playCut({ inPlace: true, bars: false, hideMe: true, steps: [{ wait: 2400 }], props: [now => { drawSpr(SPR.sleeper, 130, 114); drawSpr(SPR.zzz, 150, 104 - Math.floor(now / 300) % 5); }] });
  advanceTime(NAP.mins); G.daily.nap = true; gainStam(NAP.stam);
  RT.lock = false; UI.hud();
};
ACT.readBook = async s => {
  if (schoolToday() && G.atSchool && G.time < CFG.SCHOOL_END && !inWin(G.time, AM_END, PM_START - 10) && G.time >= PERIODS[0].start) return UI.say('Thư viện', 'Cô thủ thư: “Đang giờ học, về lớp đi em.”<p class="dim">Thư viện mở trước giờ học, giờ nghỉ trưa và sau giờ tan học.</p>');
  if ((G.daily.lib || 0) >= LIBRARY.perDay) return UI.toast('Hôm nay bạn đọc sách ở thư viện đủ rồi.');
  if (G.stamina < LIBRARY.stam) return UI.toast('Mệt quá, đọc không vào.', 'bad');
  const c = await UI.ask(`Tủ sách ${SUBJ[s].name}`, `<p>Lấy một cuốn ${SUBJ[s].name} xuống đọc ${LIBRARY.mins} phút?</p>`, ['Đọc sách', 'Thôi']);
  if (c !== 0 || RT.lock) return;
  RT.lock = true;
  UI.progress(`Đang đọc sách ${SUBJ[s].name}…`, 2000, SUBJ[s].color);
  await playCut({ inPlace: true, bars: false, steps: [{ fn: () => { G.dir = 0; } }, { wait: 2000 }], props: [now => { drawSpr(SPR.book, G.x - 3, G.y - 13 + (Math.floor(now / 500) % 2)); if (Math.floor(now / 900) % 2) wRect('#fffaf0', G.x + 2, G.y - 12, 2, 1); }] });
  advanceTime(LIBRARY.mins);
  G.daily.lib = (G.daily.lib || 0) + 1; useStam(LIBRARY.stam); addStat(s, LIBRARY.pts);
  if (!grudge('vy') && !isComp('vy') && Math.random() < 0.3) { addFriend('vy', 2); UI.toast('Gặp Vy cũng đang ngồi đọc sách.', 'good'); }
  RT.lock = false; UI.hud();
};
ACT.library = () => UI.toast('Thư viện giờ là một phòng riêng: cửa lớn giữa dãy nhà chính của trường.');
// Phòng nhạc: sân khấu tập nhảy (bấm mũi tên theo nhịp) · phòng thu tập hát (bấm nốt rơi) · ở nhà: micro
ACT.music = async kind => {
  if (RT.lock) return;
  const home = kind === 'home', sing = kind !== 'dance';
  if (!home && schoolToday() && G.atSchool && G.time < CFG.SCHOOL_END && !inWin(G.time, AM_END, PM_START - 10) && G.time >= PERIODS[0].start) return UI.say('Phòng nhạc', 'Đang giờ học, phòng nhạc khoá cửa phòng thu.<p class="dim">Tập được trước giờ học, giờ nghỉ trưa và sau giờ tan học.</p>');
  if ((G.daily.music || 0) >= MUSIC.perDay) return UI.toast('Hôm nay tập văn nghệ đủ rồi, khản cả giọng.');
  if (G.stamina < MUSIC.stam) return UI.toast('Mệt quá, không tập nổi.', 'bad');
  const c = await UI.ask(sing ? (home ? 'Micro ở nhà' : 'Phòng thu') : 'Sân khấu', sing ? '<p>Bật nhạc nền lên rồi luyện thanh: bấm đúng nốt khi nốt chạm vạch.</p>' : '<p>Bật nhạc lên rồi nhảy: bấm mũi tên theo đúng chuỗi động tác.</p>', ['Bắt đầu', 'Thôi']);
  if (c !== 0) return;
  RT.lock = true;
  const d = 1 + Math.min(3, Math.floor(lv('vannghe') / 3));
  const r = sing ? await playGame('notes', d, home ? 'Hát ở nhà' : 'Thu âm') : await playGame('arrows', d + 1, 'Tập nhảy', 'Nhảy');
  const pts = Math.round((home ? MUSIC.homeBase : MUSIC.base) + (home ? MUSIC.homeBonus : MUSIC.bonus) * r.score);
  G.daily.music = (G.daily.music || 0) + 1; useStam(MUSIC.stam, !sing); addStat('vannghe', pts); if (!sing) addStat('thethao', 1);
  advanceTime(MUSIC.mins); RT.lock = false; UI.hud();
  UI.toast(r.score >= 0.95 ? 'Xuất sắc! Lên sân khấu văn nghệ được rồi đó.' : r.score >= 0.6 ? 'Tập khá ổn.' : 'Còn chệch nhịp nhiều, tập thêm nhé.', r.score >= 0.6 ? 'good' : 'info');
};
ACT.washFace = async () => {
  if (G.daily.wash) return UI.toast('Vừa rửa mặt xong, tỉnh táo rồi.');
  await activity('Vốc nước rửa mặt cho tỉnh…', 5, () => { G.daily.wash = true; gainStam(3); });
};
// Buồng vệ sinh: trốn vào hút thuốc — giám thị đi kiểm tra là bị bắt
ACT.stall = async i => {
  if (RT.lock) return;
  const c = await meSay('<p>Một buồng vệ sinh trống. Chốt cửa lại là không ai thấy…</p>', ['Đi vệ sinh', 'Trốn trong buồng hút thuốc', 'Thôi']);
  if (c === 0) return activity('…', 5, () => { });
  if (c !== 1) return;
  if ((G.daily.smoke || 0) >= SMOKE.perDay) return meSay('<p>Hôm nay hút đủ rồi, cổ họng khét lẹt.</p>');
  RT.lock = true;
  const sx = 150 + i * 30, caught = Math.random() < SMOKE.risk + 0.05 * G.caughtCycle;
  UI.progress('Trốn trong buồng vệ sinh…', 2600, '#8b8f9c');
  await playCut({
    inPlace: true, bars: false, stay: true, hideMe: true, actors: caught ? [{ look: 'teacherM', x: 289, y: 204, dir: 3, hidden: true }] : [],
    props: [now => smokeProp(now, sx, 30)],
    steps: caught
      ? [{ wait: 1300 }, { fn: s => { s.actors[0].hidden = false; } }, { move: [0, sx, 62, 900] }, { say: [0, 'Buồng nào bốc khói thế kia?! Ra đây ngay!'] }]
      : [{ wait: 2600 }],
  });
  G.daily.smoke = (G.daily.smoke || 0) + 1; advanceTime(SMOKE.mins);
  if (caught) {
    G.caughtCycle++; addConduct(-SMOKE.conduct, 'hút thuốc trong nhà vệ sinh'); addTeacher(TEACHER.caughtFun, 'nghiem'); addParent(-2, '', true);
    RT.lock = false; UI.hud();
    await UI.ask('Thầy giám thị', '<p>“Học sinh mà hút thuốc à? Lên phòng giám thị viết bản kiểm điểm, tôi sẽ gọi điện cho phụ huynh!”</p>', ['Dạ…'], { who: { look: 'teacherM' } });
  } else { gainStam(SMOKE.stam); RT.lock = false; UI.hud(); UI.toast('Không ai phát hiện. Người tỉnh hẳn ra.', 'info'); }
};

/* ============================================================
 *  CỬA HÀNG DẠNG ICON (tạp hoá, căn tin, các gian trong TTTM, quầy xèng)
 * ============================================================ */
// UI.store / UI.shop: xem 05b_games.js (nạp sau 05_ui.js)
ACT.canteen = () => {
  if (!inWin(G.time, 360, 1030)) return UI.say('Căn tin', 'Căn tin đã nghỉ bán.');
  meetSoc('cantin');
  UI.store('Căn tin', '“Ăn gì con?”', CANTEEN, async f => {
    if (G.money < f.price) return UI.toast('Không đủ tiền.', 'bad');
    UI.close();
    if (f.mins) await activity(`Đang ăn ${f.name.toLowerCase()}…`, f.mins, () => { addMoney(-f.price); gainStam(f.stam); });
    else { addMoney(-f.price); gainStam(f.stam); UI.hud(); if (f.pack) await showPack(openPacks(f.pack), 'Bóc gói bim bim Sao Vàng'); }
  });
};

/* ============================================================
 *  PHỐ HOA PHƯỢNG: vào trong TTTM, khu game, nhà bạn
 * ============================================================ */
const DOORS = { mall: ['tttm', 'mall'], arcade: ['arc', 'arcade'] };
ACT.enter = async k => {
  const [map, pl] = DOORS[k], P = PLACES[pl];
  if (RT.lock || !placeOpen(P)) return;
  if (G.ride) dismount(true);
  const e = MAPS[map].entry;
  await goPlace(map, e[0], e[1], e[2], 0);
  if (G.comp && k === 'mall') UI.toast(`${FRIENDS[G.comp.fid].name} theo bạn vào trong.`, 'info');
};
ACT.mall = () => ACT.enter('mall'); ACT.arcade = () => ACT.enter('arcade');
// Một gian hàng trong TTTM
ACT.stallShop = id => {
  const name = MALL_STALLS.find(s => s[0] === id)[1], fid = palAt('mall'), wf = withF(fid), M = MALL;
  const items = () => MALL_GOODS[id].map(it => Object.assign({}, it, { owned: !!(it.own && G.owned[it.own]), desc: (it.desc || '') + (it.duo && fid ? ` (đi${wf})` : '') }));
  UI.store(name, '“Mời em xem hàng.”', items, async it => {
    if (G.money < it.price) return UI.toast('Không đủ tiền.', 'bad');
    if (it.act === 'movie') { UI.close(); return jointAct(`Đang xem phim${wf}…`, M.movie.mins, 'movie', fid, () => { addMoney(-it.price); gainStam(M.movie.stam); addStat('giaotiep', fid ? 3 : 1); palGain('mall', M.movie.friend); }); }
    if (it.act === 'chicken') { UI.close(); return jointAct(`Đang ăn gà rán${wf}…`, M.chicken.mins, 'chicken', fid, () => { addMoney(-it.price); gainStam(M.chicken.stam); palGain('mall', M.chicken.friend); }); }
    if (it.act === 'teamall') { UI.close(); return jointAct(`Đang uống trà sữa${wf}…`, 20, 'tea', fid, () => { addMoney(-it.price); gainStam(12); palGain('mall', 5); }); }
    if (it.act === 'book') {
      if (G.daily.book) return UI.toast('Hôm nay bạn mua sách tham khảo rồi, đọc hết cuốn đó đã.');
      UI.close();
      const k = await UI.ask('Nhà sách', '<p>Chọn sách tham khảo môn nào?</p>', BOOK_SUBJ.map(s => SUBJ[s].name).concat('Thôi'), { grid: true });
      if (k < 0 || k >= BOOK_SUBJ.length) return;
      G.daily.book = true; addMoney(-it.price); addStat(BOOK_SUBJ[k], M.book.pts); UI.hud(); return;
    }
    if (it.act === 'box') { UI.close(); addMoney(-it.price); UI.hud(); return showPack(openPacks(M.box.n, 1), 'Mở hộp thẻ đặc biệt'); }
    if (it.act === 'bim') { UI.close(); addMoney(-it.price); G.inv.bimbim++; UI.hud(); return showPack(openPacks(1), 'Bóc gói bim bim Sao Vàng'); }
    addMoney(-it.price, true);
    if (it.inv) G.inv[it.inv] = (G.inv[it.inv] || 0) + (it.n || 1);
    if (it.own) G.owned[it.own] = true;
    UI.toast(`Đã mua ${it.name} (−${fmtMoney(it.price)})${it.own && it.id.startsWith('d_') ? ' — đã bày trong phòng ngủ ở nhà' : ''}`, 'good'); UI.hud();
  });
};
// Khu game: đổi xèng ở quầy, mỗi máy tốn vài xèng
ACT.tokens = () => {
  UI.store('Quầy đổi xèng', `“Xèng đây, xèng đây!” — Bạn có <b>${G.inv.xeng || 0}</b> xèng`, () => [{ id: 'xeng', name: `${TOKENS.n} xèng`, price: TOKENS.price, desc: `Máy gắp thú ${MACHINES.claw} xèng · đối kháng ${MACHINES.fight} · đua xe ${MACHINES.race} · máy nhảy ${MACHINES.dance} · máy may rủi ${MACHINES.slot} (trúng thì ra thêm xèng). Đang có: ${G.inv.xeng || 0} xèng.` }], it => {
    if (G.money < it.price) return UI.toast('Không đủ tiền.', 'bad');
    addMoney(-it.price, true); G.inv.xeng = (G.inv.xeng || 0) + TOKENS.n; UI.toast(`Đổi được ${TOKENS.n} xèng. Đang có ${G.inv.xeng} xèng.`, 'good'); UI.hud();
  });
};
const MACHINE_NAME = { claw: 'Máy gắp thú', fight: 'Game đối kháng', slot: 'Máy may rủi', race: 'Game thùng đua xe', dance: 'Máy nhảy' };
ACT.machine = async kind => {
  if (RT.lock) return;
  const cost = MACHINES[kind], have = G.inv.xeng || 0, fid = palAt('arcade'), wf = withF(fid), A = ARCADE;
  if (have < cost) return UI.say(MACHINE_NAME[kind], `Máy này cần <b>${cost} xèng</b>, bạn đang có ${have}.<p class="dim">Đổi xèng ở quầy bên trái (${fmtMoney(TOKENS.price)} = ${TOKENS.n} xèng).</p>`);
  if (kind === 'dance' && G.stamina < A.dance.stam) return UI.toast('Không đủ thể lực.', 'bad');
  const c = await UI.ask(MACHINE_NAME[kind], `<p>Bỏ ${cost} xèng vào máy? (đang có ${have} xèng)</p>`, [`Chơi${wf}`, 'Thôi']);
  if (c !== 0) return;
  RT.lock = true; G.inv.xeng -= cost;
  // hoạt ảnh: đứng trước máy, màn hình nhấp nháy
  await playCut({ inPlace: true, bars: false, stay: true, steps: [{ fn: () => { G.dir = 3; } }, { hop: 'me' }, { wait: 500 }], props: [now => { const f = Math.floor(now / 90); wRect(['#5fe0f0', '#ff5fa8', '#ffe066'][f % 3], G.x - 6 + (f % 4) * 3, G.y - 40, 3, 2); }] });
  let msg = '', good = true;
  if (kind === 'claw') {
    const r = await playGame('claw', 1 + Math.floor(Math.random() * 3)); addStat('kheotay', r.score >= 1 ? 3 : 1);
    if (r.score >= 1) { G.inv.gaubong = (G.inv.gaubong || 0) + 1; msg = 'Gắp được một con gấu bông! Đem tặng bạn thân nhé.'; } else { msg = 'Càng gắp tuột mất rồi…'; good = false; }
    advanceTime(10);
  } else if (kind === 'slot') {
    const r = await playGame('slot'), win = r.skipped ? 0 : r.score >= 1 ? 8 : r.score >= 0.5 ? 2 : 0;
    G.inv.xeng += win; msg = win >= 8 ? 'TRÚNG LỚN! Máy nhả ra 8 xèng!' : win ? 'Trúng nhỏ: ra 2 xèng.' : 'Trượt rồi…'; good = win > 0;
    advanceTime(5);
  } else if (kind === 'fight') {
    const r = await playGame('arrows', 2 + Math.floor(Math.random() * 2), 'Game đối kháng', 'Ra chiêu'), win = r.score >= 0.6;
    addStat('kheotay', win ? 2 : 1); gainStam(3); if (fid) { addStat('giaotiep', 2); palGain('arcade', win ? 8 : 6); }
    if (win) { G.inv.xeng += 1; msg = 'K.O.! Thắng trận, máy thưởng 1 xèng.'; } else { msg = 'Thua sát nút… làm ván nữa không?'; good = false; }
    advanceTime(15);
  } else if (kind === 'race') {
    RT.lock = false;
    await jointAct(`Đang chơi game thùng${wf}…`, A.cab.mins / 2, 'cab', fid, () => { gainStam(A.cab.stam); addStat('giaotiep', fid ? 3 : 1); addStat('kheotay', 1); palGain('arcade', A.cab.friend); });
    return;
  } else {
    const r = await playGame('arrows', 2 + Math.floor(Math.random() * 2), 'Máy nhảy', 'Nhảy');
    useStam(A.dance.stam, true); addStat('vannghe', Math.round(1 + A.dance.pts * r.score)); addStat('thethao', 1); palGain('arcade', A.dance.friend);
    msg = r.score >= 0.6 ? 'Nhảy đẹp quá, mấy đứa đứng xem vỗ tay rần rần!' : 'Trật nhịp tùm lum, nhưng mà vui!'; good = r.score >= 0.6;
    advanceTime(A.dance.mins);
  }
  RT.lock = false; UI.hud(); UI.toast(msg, good ? 'good' : 'info');
};

/* ---------- nhà bạn ---------- */
ACT.house = async fid => {
  const F = FRIENDS[fid];
  if (!friendHome(fid)) {
    let where;
    if (G.time >= 1290 || G.time < 390) where = `“Khuya rồi cháu ơi, ${F.name} ngủ rồi.”`;
    else if (meetToday(fid)) where = `“${F.name} ra ${PLACES[G.meet.place].name} rồi, bảo là có hẹn với cháu mà?”`;
    else if (parkTime()) where = `“${F.name} ra công viên bên khu nhà cháu chơi rồi.”`;
    else if (isComp(fid)) where = `“Ơ, ${F.name} đang đi với cháu đấy thôi?”`;
    else if (schoolToday() && G.time < AFTER_SCHOOL) where = `“Giờ này ${F.name} đang ở trường mà cháu?”`;
    else where = `“${F.name} vừa chạy đi đâu đó rồi cháu ạ.”`;
    return UI.say(`Nhà ${F.name}`, `Bấm chuông… Người nhà ${F.name} ló đầu ra: ${where}<p class="dim">${F.name} có nhà: ngày đi học 20:10–21:30 · ngày nghỉ 06:30–08:00 và 18:10–21:30.</p>`);
  }
  if (grudge(fid)) return UI.say(F.name, `“Cậu về đi. Tớ chưa hết giận đâu.”`);
  if (hearts(fid) < FRIEND_HOME_HEARTS) return UI.say(F.name, `“Ủa ${G.name}? Có gì không? … Nhà tớ đang bừa lắm, hôm khác vào chơi nha.”<p class="dim">Cần thân thiết ${FRIEND_HOME_HEARTS}♥ để được mời vào nhà (${FRIEND_ROOM_HEARTS}♥ thì vào được cả phòng riêng).</p>`);
  const c = await UI.ask(F.name, `<p>“A, ${G.name}! Vào nhà chơi đi!”</p>`, ['Vào nhà chơi', 'Thôi, tớ chỉ ghé qua thôi']);
  if (c !== 0) return;
  if (G.ride) dismount(true);
  G.visit = fid;
  await goPlace('fhome', 289, 204, 3, 0);
};
ACT.leaveFh = () => { const hx = (FRIEND_HOUSE[G.visit] || FRIEND_HOUSE.khoa)[1]; goPlace('pho', hx + 49, 152, 0, 0); };
ACT.fh = async kind => {
  const fid = G.visit, F = FRIENDS[fid], X = FH[kind], key = kind + '_' + fid;
  if (RT.lock) return;
  if (G.daily.fh[key]) return UI.toast(kind === 'tv' ? 'Hai đứa vừa xem xong rồi.' : 'Chơi nữa là mỏi tay lắm.');
  if (G.time > 1280) return UI.say(F.name, '“Khuya rồi, cậu về đi kẻo bố mẹ mắng.”');
  RT.lock = true;
  if (kind === 'tv') {
    await playCut({ inPlace: true, title: `Nhà ${F.name}`, hide: ['fh'], actors: [{ look: fid, outfit: friendOutfit(fid), x: 110, y: 138, dir: 3 }], steps: [{ move: ['me', 86, 138, 500] }, { fn: () => { G.dir = 3; } }, { say: [0, 'Tập này hay lắm, coi đi!'] }, { say: ['me', 'Ha ha ha! Tua lại khúc đó đi!'] }], stay: true });
    gainStam(6); addStat('giaotiep', 1);
  } else {
    await playCut({ inPlace: true, title: `Phòng riêng của ${F.name}`, hide: ['fh'], actors: [{ look: fid, outfit: friendOutfit(fid), x: 262, y: 184, dir: 3 }], steps: [{ move: ['me', 226, 184, 400] }, { fn: () => { G.dir = 3; } }, { say: [0, 'Chơi đối kháng không? Thua rửa bát nha!'] }], stay: true });
    const r = await playGame('arrows', 2, 'Chơi điện tử', 'Ra chiêu');
    addStat('kheotay', r.score >= 0.6 ? 2 : 1); gainStam(4);
    UI.toast(r.score >= 0.6 ? `Thắng ${F.name} rồi! “Ván nữa, ván nữa!”` : `${F.name} thắng: “Gà quá nha!”`, 'info');
  }
  G.daily.fh[key] = true; addFriend(fid, X.friend); advanceTime(X.mins);
  RT.lock = false; UI.hud();
};

/* ============================================================
 *  ĐIỆN THOẠI: ban đầu chỉ có số bố mẹ; thân với bạn rồi mới xin được số
 * ============================================================ */
const hasNum = id => id === 'mom' || id === 'dad' || G.phone.contacts.includes(id);
const phoneList = () => ['mom', 'dad'].concat(Object.keys(FRIENDS).filter(f => G.phone.contacts.includes(f)));
async function askNumber(fid) {
  const F = FRIENDS[fid];
  if (hearts(fid) < PHONE_HEARTS || grudge(fid)) return UI.say(F.name, `“Số điện thoại hả? Ờm… để hôm nào thân hơn tớ cho nha.”<p class="dim">Cần thân thiết ít nhất ${PHONE_HEARTS}♥ mới xin được số.</p>`);
  G.phone.contacts.push(fid); addFriend(fid, 1);
  UI.say(F.name, `“Số tớ nè, lưu vào đi. Tối rảnh nhắn tin nha!”<p class="dim">Đã thêm ${F.name} vào danh bạ (phím P).</p>`);
}

/* ============================================================
 *  HOẠT ẢNH: nhổ cỏ, đá bóng
 * ============================================================ */
function weedCut(ax, ay) {
  const pts = [[ax + 4, ay + 18], [ax + 18, ay + 20], [ax + 32, ay + 18]];
  return {
    inPlace: true, bars: false, est: 3300,
    steps: pts.flatMap(p => [{ move: ['me', p[0], p[1], 350] }, { fn: () => { G.dir = 3; } }, { hop: 'me' }, { wait: 420 }]),
    props: [now => { const f = (now / 500) % 1; drawSpr(SPR.weedfly, G.x + 6 + f * 10, G.y - 12 - Math.sin(f * 3.14) * 14); }],
  };
}
function ballCut(fid) {
  const x0 = G.x, y0 = G.y + 26, pal = fid ? [{ look: fid, outfit: friendOutfit(fid), x: x0 + 40, y: y0 + 16, dir: 1 }] : [];
  const st = { x: x0 + 8, y: y0, tx: x0 + 8, ty: y0, t0: 0 };
  const kick = (x, y) => ({ fn: () => { st.x = st.tx; st.y = st.ty; st.tx = x; st.ty = y; st.t0 = performance.now(); } });
  return {
    inPlace: true, bars: !!fid, title: fid ? 'Chơi thể thao' : '', est: 3600, actors: pal,
    steps: [{ move: ['me', x0, y0, 300] }, kick(x0 + 34, y0 + 14), { move: ['me', x0 + 14, y0 + 8, 450] }, fid ? { hop: 0 } : { wait: 250 }, kick(x0 - 20, y0 + 22), { move: ['me', x0 - 12, y0 + 20, 500] }, kick(x0 + 4, y0 - 12), { hop: 'me' }, { move: ['me', x0 + 2, y0 - 4, 450] }, kick(x0 + 4, y0 - 40), { hop: 'me' }, fid ? { say: [0, 'Vàooo! Sút đẹp lắm!'] } : { wait: 500 }],
    props: [now => { const k = Math.min(1, (now - st.t0) / 420), bx = st.x + (st.tx - st.x) * k, by = st.y + (st.ty - st.y) * k; drawSpr(SHADOW, bx - 7, by - 1); drawSpr(SPR.ball, bx - 3, by - 6 - Math.sin(k * 3.14) * 7); }],
  };
}
ACT.field = async () => {
  if (G.daily.field >= 2) return UI.toast('Hôm nay chơi thể thao đủ rồi.');
  if (G.stamina < 8) return UI.toast('Không đủ thể lực.', 'bad');
  const fid = G.comp ? G.comp.fid : null;
  await animActivity(`Đang đá bóng${withF(fid)}…`, 20, ballCut(fid), () => { G.daily.field++; useStam(8, true); addStat('thethao', 3); palGain('park', 6); });
};

/* ============================================================
 *  NHỊP SỐNG: kẹt thì gỡ ra · tới chỗ hẹn gặp bạn là đi chơi luôn · nhắc kiểm tra
 * ============================================================ */
function unstick() {
  const m = MAPS[G.map]; if (!blocked(m, G.x, G.y)) return;
  for (let r = 4; r <= 48; r += 4) for (let a = 0; a < 12; a++) {
    const x = G.x + Math.cos(a * 0.5236) * r, y = G.y + Math.sin(a * 0.5236) * r;
    if (!blocked(m, x, y)) { G.x = x; G.y = y; return; }
  }
}
function lifeTick() {
  unstick();
  // tới chỗ hẹn, lại gần bạn đang đợi là hai đứa bắt đầu đi chơi với nhau
  const m = meetOn();
  if (m && !G.comp && !G.ride && PLACES[m.place].map === G.map && meetHere(m.place)) {
    const n = NPCS.find(q => q.id === 'meet_' + m.place + '_' + m.fid);
    if (n && n.cx !== undefined && Math.hypot(n.cx - G.x, n.cy - G.y) < 34) {
      m.n = Math.max(1, m.n); setComp(m.fid, false); RT.fol = { map: G.map, x: n.cx, y: n.cy, dir: 0, walk: -1 };
      UI.ask(FRIENDS[m.fid].name, '<p>“Tới rồi hả! Tớ đợi nãy giờ. Đi thôi, cậu dẫn đường đi!”</p><p class="dim">Bạn ấy sẽ đi theo bạn. Vào quán, vào TTTM, khu game… là hai đứa chơi chung.</p>', ['Đi thôi!']);
    }
  }
}
// Sáng ra: hôm nay có bài kiểm tra 1 tiết / thi môn gì, ở tiết mấy
function testsToday() {
  const tt = ttToday(); if (!tt) return [];
  const out = [];
  for (const s in G.pending) if ((G.pending[s] || []).length) { const i = tt.findIndex((x, k) => x === s && !G.daily.done[k + 1]); if (i >= 0) out.push({ subj: s, type: G.pending[s][0], n: i + 1 }); }
  return out.sort((a, b) => a.n - b.n);
}
