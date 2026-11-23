'use strict';
/* ============================================================
 *  04d. ĐỜI SỐNG HỌC ĐƯỜNG
 *  - Tụ chơi giờ ra chơi / nghỉ trưa (tám chuyện, đánh bài, chọi con quay, rồng rắn lên mây, trốn tìm, đuổi bắt, đá bóng, đá cầu, ăn trưa)
 *  - Hoạt ảnh trong tiết học (đọc sách / chép bài, lắp súng, ném bóng – tâng cầu), kiểm tra miệng, phát đề kiểm tra
 *  - Kiệt sức ngủ gật → trạm y tế · phòng ngủ trưa · phòng nhạc · thư viện · khu vệ sinh
 *  - Bên trong TTTM, khu game, nhà bạn · cửa hàng dạng icon · danh bạ điện thoại
 * ============================================================ */
const dirOf = (dx, dy) => (Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0));
const meWho = () => ({ look: G.gender, outfit: RT.outfit || (schoolToday() || hkUniform() ? null : 'casual') });
const meSay = (html, buttons) => UI.ask(G.name, html, buttons || ['OK'], { who: meWho() });       // tự sự: hội thoại dưới màn hình, chân dung của mình
const coOf = subj => (TEACHER_OF[subj] === 'teacherC' || subj === 'qp' || subj === 'td' ? 'Thầy' : 'Cô');
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ============================================================
 *  TỤ CHƠI NGOÀI SÂN
 * ============================================================ */
const YARD_KIDS = ['khoa', 'vy', 'dat', 'ngan', 'm1', 'm2', 'm3', 'm4', 'm5', 'x1', 'x2', 'x3', 'x4', 'sA', 'sB', 'sC', 'sD', 'hoang'];
// chỗ đặt từng tụ: [x, y] tâm
const YARD_SPOT = { dauthe: [196, 272], chat: [250, 256], chat2: [168, 326], danhbai: [200, 206], conquay: [384, 216], dacau: [302, 236], duoibat: [352, 300], rongran: [232, 316], dabong: [584, 250], trontim: [448, 304], eat: [150, 192], eat2: [80, 116] };
const HIDE_SPOTS = [[448, 174], [150, 334], [70, 203], [110, 174], [22, 200]];          // núp sau gốc cây, bụi rậm
const EAT_SEATS = { eat: [[124, 187], [176, 187], [150, 199]], eat2: [[62, 112], [84, 113], [106, 112]] };          // hai bên ghế đá · trước quầy căn tin
let YS = null;
function yardState() {
  if (!G || !schoolToday() || (RT.scene && !RT.scene.yard)) return null;
  const wi = YARD_WINDOWS.findIndex((_, i) => inWin(G.time, ...yardWin(i))); if (wi < 0 || (halfDay(G.day) && wi > 2)) return null;   // chiều nghỉ học: hết tiết 4 là ai về nhà nấy
  const key = G.day * 10 + wi; if (YS && YS.key === key) return YS;
  const rnd01 = mulberry(key * 7919 + 13), sh = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd01() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const kids = sh(YARD_KIDS.slice()), groups = [], where = {}, lunch = wi === 2 && !halfDay(G.day);
  const take = (kind, spot, n) => { const mem = kids.splice(0, n); if (!mem.length) return; const g = { id: spot, kind, mem, c: YARD_SPOT[spot] }; groups.push(g); mem.forEach((k, i) => { where[k] = [g, i]; }); };
  if (lunch) {        // nghỉ trưa: vài bạn vào phòng ngủ trưa, vài bạn ăn ở căn tin / ghế đá
    const nap = kids.filter(k => !FRIENDS[k]).slice(0, 2); for (const k of nap) kids.splice(kids.indexOf(k), 1);
    take('eat', 'eat2', 2); take('eat', 'eat', 2);
  }
  if (kids.includes('sC')) { kids.splice(kids.indexOf('sC'), 1); kids.unshift('sC'); take('dauthe', 'dauthe', 3); }   // tụ đấu thẻ của anh Phong
  const kinds = sh(['danhbai', 'conquay', 'rongran', 'trontim', 'duoibat', 'dabong', 'dacau']);
  take('chat', 'chat', lunch ? 2 : 3);
  for (const k of kinds) { if (kids.length < 2) break; take(k, k, Math.min(YARD_GAMES[k].n, kids.length)); }
  if (kids.length > 1) take('chat', 'chat2', kids.length);
  else if (kids.length) { const g = groups[groups.length - 1]; where[kids[0]] = [g, g.mem.length]; g.mem.push(kids[0]); }
  return (YS = { key, wi, groups, where });
}
/* ---------- tan học: hết giờ ở sân thì các bạn lần lượt đi bộ ra cổng trường rồi mới khuất ---------- */
const LEAVE = { gate: [352, 414], out: [352, 460], speed: 44, gap: 0.35, late: 30 };
function leaveTick() {
  if (!G || G.map !== 'school' || !schoolToday()) return;
  const W = halfDay(G.day) ? yardWin(2) : YARD_WINDOWS[YARD_WINDOWS.length - 1];
  if (inWin(G.time, W[0], W[1]) && !(RT.scene && RT.scene.type === 'cut')) {
    // còn giờ ra sân sau tan học: nhớ chỗ từng bạn đang đứng
    const at = {}; for (const n of NPCS) if (n.map === 'school' && n.id.startsWith('y_') && n.cx !== undefined && n.vis && n.vis()) at[n.id] = [n.cx, n.cy];
    RT.lastYard = { day: G.day, at, real: performance.now() };
  } else if (G.time >= W[1] && G.time < W[1] + LEAVE.late && RT.lastYard && RT.lastYard.day === G.day && performance.now() - RT.lastYard.real < 3000 && !(RT.leave && RT.leave.day === G.day)) {
    const g = LEAVE.gate, ids = Object.keys(RT.lastYard.at).sort((a, b) => Math.hypot(RT.lastYard.at[a][0] - g[0], RT.lastYard.at[a][1] - g[1]) - Math.hypot(RT.lastYard.at[b][0] - g[0], RT.lastYard.at[b][1] - g[1]));
    RT.leave = { day: G.day, t0: performance.now(), list: {} };
    ids.forEach((id, i) => { const [x, y] = RT.lastYard.at[id]; RT.leave.list[id] = { x, y, d: i * LEAVE.gap }; });
  }
}
// Vị trí của một bạn đang trên đường ra cổng (null nếu không / đã ra khỏi trường)
function leavePos(n) {
  const L = RT.leave; if (!L || L.day !== G.day || G.map !== 'school' || (RT.scene && RT.scene.type === 'cut')) return null;
  const e = L.list[n.id]; if (!e) return null;
  const t = (performance.now() - L.t0) / 1000 - e.d, pts = [[e.x, e.y], [LEAVE.gate[0] + (n.id.length % 5 - 2) * 6, LEAVE.gate[1]], LEAVE.out];
  if (t < 0) return { x: e.x, y: e.y, dir: dirOf(pts[1][0] - e.x, pts[1][1] - e.y) };
  let s = t * LEAVE.speed;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1], d = Math.hypot(bx - ax, by - ay);
    if (s <= d) { const k = d ? s / d : 1; return { x: ax + (bx - ax) * k, y: ay + (by - ay) * k, dir: dirOf(bx - ax, by - ay), walk: t }; }
    s -= d;
  }
  return null;
}

// Vị trí + dáng của một học sinh trong tụ chơi (gọi mỗi khung hình)
function yardPos(sid) {
  const st = yardState(); if (!st) return null;
  const w = st.where[sid]; if (!w) return null;
  const [g, i] = w, n = g.mem.length, [cx0, cy0] = g.c, t = performance.now() / 1000, ring = (r, ry) => { const a = i / n * 6.283 + 0.6; return { x: cx0 + Math.cos(a) * r, y: cy0 + Math.sin(a) * ry }; };
  if (g.kind === 'chat' || g.kind === 'danhbai' || g.kind === 'conquay' || g.kind === 'dauthe') {
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
    if (g.kind === 'danhbai' || g.kind === 'dauthe') cardsProp(now, x - 6, y - 4);
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
const kidName = k => (FRIENDS[k] ? FRIENDS[k].name : null);
const yardVerb = kind => (['rongran', 'trontim', 'duoibat'].includes(kind) ? 'chơi ' : '') + YARD_GAMES[kind].name;
const kidNpc = k => NPCS.find(n => n.id === 'y_' + k);
// Câu mời khi mình lại gần một bạn trong tụ
const YARD_ASK = {
  chat: 'Ê, lại đây tám chung nè! Đang kể chuyện vui lắm.', eat: 'Ngồi xuống ăn trưa chung với bọn tớ không?',
  danhbai: 'Thiếu một tay, vào đánh tiến lên không?', conquay: 'Có con quay không? Vào chọi với bọn tớ đi!',
  rongran: 'Vào chơi rồng rắn lên mây không? Đang thiếu khúc đuôi nè!', trontim: 'Chơi trốn tìm không? Ván sau vào luôn nha!',
  duoibat: 'Vào chơi đuổi bắt không? Chạy vui lắm!', dauthe: 'Đấu thẻ cầu thủ không?', dabong: 'Vào đá bóng không? Đội tớ đang thiếu người!', dacau: 'Vào đá cầu không? Đứng thành vòng tròn nè!',
};
// Hoạt cảnh khi vào chơi: t = bạn mình vừa nói chuyện, o = một bạn khác trong tụ, me = mình
const YARD_LINES = {
  chat: [['t', 'Hôm qua cậu xem tập phim mới chưa? Gay cấn lắm!'], ['me', 'Chưa! Kể nghe với, đừng tiết lộ đoạn cuối nha.'], ['o', 'Ha ha, để tớ kể từ đầu…']],
  eat: [['t', 'Ngồi đây nè, tớ có trứng chiên, ăn chung đi.'], ['me', 'Cảm ơn nha! Ăn thử miếng chả mẹ tớ làm nè.']],
  danhbai: [['t', 'Chia bài đi! Ba bích đi trước.'], ['me', 'Đôi heo nè, chặt luôn!'], ['o', 'Trời ơi, tới trắng rồi!']],
  conquay: [['t', 'Quấn dây cho chặt rồi giật thật mạnh nha!'], ['me', 'Một… hai… ba… bung!'], ['o', 'Con của cậu quay lâu ghê!']],
  rongran: [['t', 'Rồng rắn lên mây, có cây núc nắc…'], ['me', 'Có nhà điểm binh! Bám chặt vào nha!'], ['o', 'Khúc đuôi chạy lẹ lên, bị bắt bây giờ!']],
  trontim: [['t', 'Tớ đếm tới mười nha, trốn lẹ đi!'], ['me', 'Suỵt… núp sau gốc cây là không ai thấy đâu.'], ['t', 'Mười! Tớ đi tìm đây!']],
  duoibat: [['t', 'Cậu làm “mèo” đi, đuổi bọn tớ nè!'], ['me', 'Đứng lại! Bắt được cậu rồi nhé!'], ['o', 'Ha ha, hụt rồi!']],
  dabong: [['t', 'Chuyền đây! Chuyền cho tớ!'], ['me', 'Đỡ này… sút nèee!'], ['o', 'Vàooo! Đẹp quá trời!']],
  dacau: [['t', 'Tâng sang tớ nè! Đừng để rơi!'], ['me', 'Đỡ này! Má trong má ngoài!'], ['o', 'Được hai chục quả rồi!']],
};
// Nói chuyện với một bạn đang ở trong tụ chơi: bạn ấy hỏi có vào chơi cùng không (hội thoại dưới màn hình)
ACT.yardTalk = async n => {
  const st = yardState(), w = st && st.where[n.sid];
  if (!w || RT.lock) return n.act0 && n.act0();
  const g = w[0], Y = YARD_GAMES[g.kind], key = st.key + ':' + g.id, who = { look: n.dynLook ? n.dynLook() : n.look, outfit: n.outfit ? n.outfit() : null };
  if (g.kind === 'dauthe') return cardGroupTalk(g, n);            // tụ đấu thẻ cầu thủ
  if (n.fid && grudge(n.fid)) return UI.ask(n.name, '<p>“Không chơi với đồ mách lẻo đâu. Đi chỗ khác đi!”</p>', ['…'], { who });
  const done = !!G.daily.yard[key], opts = [], ids = [];
  if (!done) { opts.push(g.kind === 'chat' || g.kind === 'eat' ? 'Ngồi xuống cùng' : 'Vào chơi cùng!'); ids.push('join'); }
  if (n.fid || sellables().length || cardCount()) { opts.push('Nói chuyện riêng'); ids.push('talk'); }
  opts.push('Thôi'); ids.push('x');
  const line = done ? 'Vừa chơi xong mà, nghỉ tí đã. Sắp vào lớp rồi đó!' : YARD_ASK[g.kind];
  const c = ids[await UI.ask(n.name, `<p>“${line}”</p>`, opts, { who })] || 'x';
  if (c === 'join') ACT.yardJoin(g, n);
  else if (c === 'talk' && n.act0) n.act0();
};
// Vào chơi: mình nhập vào tụ (đi tới chỗ, rồi chơi theo nhịp của cả tụ), có lời thoại; không có mini-game
ACT.yardJoin = async (g, n) => {
  if (RT.lock) return;
  const Y = YARD_GAMES[g.kind], st = yardState(); if (!st) return;
  const key = st.key + ':' + g.id, fr = g.mem.filter(k => FRIENDS[k] && !grudge(k) && !isComp(k));
  if (G.daily.yard[key]) return UI.toast('Bạn vừa chơi với tụ này xong rồi.');
  if (Y.sport && G.stamina < 6) return UI.toast('Mệt quá, chơi không nổi.', 'bad');
  RT.lock = true; G.daily.yard[key] = true;
  const talker = n ? n.sid : g.mem[0], other = g.mem.find(k => k !== talker) || talker;
  await yardScene(g, talker, other);
  const names = fr.map(kidName);
  for (const k of fr) addFriend(k, YARD_JOIN.friend, true);
  if (fr.length) UI.float(`+${YARD_JOIN.friend} thân thiết với ${names.join(', ')}`, '#ff9fc0');
  
  if (Y.sport) { useStam(5, true); addStat('thethao', Y.sport); }
  if (g.kind === 'conquay' || g.kind === 'danhbai') addStat('kheotay', 1);
  if (g.kind === 'eat') { const f = ['comhop', 'banhmi', 'sua'].find(k => G.inv[k]); if (f) eat(f); else gainStam(3); }
  advanceTime(YARD_JOIN.mins);
  RT.lock = false; UI.hud();
};
const ME_SID = '__me';
async function yardScene(g, talker, other) {
  const st = YS, lines = YARD_LINES[g.kind] || YARD_LINES.chat, Y = YARD_GAMES[g.kind], lunch = st.wi === 2;
  g.mem.push(ME_SID); st.where[ME_SID] = [g, g.mem.length - 1];
  const sc = RT.scene = { type: 'cut', yard: true, map: 'school', actors: [], props: [], hide: [], bubble: null, tw: [], title: `${lunch ? 'Nghỉ trưa' : 'Giờ ra chơi'} · ${yardVerb(g.kind)} cùng các bạn`, joined: false };
  // mình đi tới chỗ trong tụ, tới nơi thì chơi theo nhịp chung (vị trí lấy từ yardPos giống các bạn)
  sc.drive = dt => {
    const p = yardPos(ME_SID); if (!p) return false;
    if (!sc.joined) {
      const dx = p.x - G.x, dy = p.y - G.y, d = Math.hypot(dx, dy), sp = 100 * dt;
      if (d > sp + 1 && !UI._fast) { G.x += dx / d * sp; G.y += dy / d * sp; G.dir = dirOf(dx, dy); return true; }
      sc.joined = true;
    }
    G.x = p.x; G.y = p.y; G.dir = p.dir; sc.meOy = p.oy || 0;
    return p.walk !== undefined;
  };
  UI.hint(null); document.body.classList.add('cut');
  for (let t = 0; !sc.joined && t < 60; t++) await new Promise(r => setTimeout(r, 50));
  sc.joined = true;
  const at = k => { if (k === 'me') return { x: G.x, y: G.y + (sc.meOy || 0) }; const q = kidNpc(k); return q && q.cx !== undefined ? { x: q.cx, y: q.cy + (q.coy || 0) } : { x: G.x, y: G.y }; };
  for (const [w, text] of lines) {
    const k = w === 'me' ? 'me' : w === 't' ? talker : other;
    sc.bubbleOf = k;
    sc.bubble = { text, ...at(k) }; sc.bubble.y -= 27;
    await UI.wait(1300 + text.length * 28); sc.bubble = null; sc.bubbleOf = null;
  }
  await UI.wait(700);
  g.mem.splice(g.mem.indexOf(ME_SID), 1); delete st.where[ME_SID];
  RT.scene = null; document.body.classList.remove('cut');
}
// bong bóng thoại đi theo người nói (tụ đang chạy nhảy)
function followBubble() {
  const sc = RT.scene; if (!sc || !sc.yard || !sc.bubble || !sc.bubbleOf) return;
  const k = sc.bubbleOf, q = k === 'me' ? null : kidNpc(k);
  if (k === 'me') { sc.bubble.x = G.x; sc.bubble.y = G.y + (sc.meOy || 0) - 27; }
  else if (q && q.cx !== undefined) { sc.bubble.x = q.cx; sc.bubble.y = q.cy + (q.coy || 0) - 27; }
}

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
      if (!mine && !CLASS_SEATED.has(c + ',' + r + ',' + sd)) continue;      // bàn trống thì không có sách vở
      if (mine && (sc.away || sc.mode === 'sleep')) continue;
      if (sc.mode === 'test') { if (r >= (sc.papers || 0)) continue; drawSpr(SPR.paper, x, y); if (sc.writing) wRect('#2a2136', x + 1 + (f + k) % 4, y + 1 + ((f + k) >> 2) % 3, 1, 1); }
      else { drawSpr(SPR.book, x, y); if ((k + (f >> 4)) % 3 === 0) wRect('#3b82c4', x + 1 + (f + k) % 5, y + 5, 2, 1); }       // bạn thì đọc, bạn thì chép bài
    }
    if (sc.mode === 'sleep') drawSpr(SPR.zzz, G.x + 4, G.y - 34 - (f >> 1) % 4);
  } else if ((sc.type === 'yard' || sc.stage === 'yard') && sc.kind) {         // stage: đang chơi cảnh tâng cầu / lắp súng thì các bạn vẫn tập, riêng mình do cảnh vẽ
    const all = sc.actors.slice(0, -1).map(a => [a.x, a.y]).concat(sc.stage ? [] : [[G.x, G.y]]), t = now / 1000;
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
const MEDBED = { x: 24, y: 90 };                                              // giường giữa trong trạm y tế
/* why: 'doze' — đêm qua thức quá 2 giờ sáng nên ngủ gục ở mấy tiết cuối (dù đã ăn sáng) · không có: kiệt sức vì hết thể lực
 * Tiết học kết thúc luôn (không tính vắng, không được cộng điểm) → cảnh kiệt sức → tỉnh dậy ở trạm y tế, cô y tá khuyên → nghỉ hết buổi */
async function faintFlow(p, subj, why) {
  const sc = RT.scene, co = coOf(subj), inClass = sc && sc.type === 'class';
  const tIdx = sc && sc.actors && sc.actors.length ? sc.actors.length - 1 : -1, tLook = tIdx >= 0 ? sc.actors[tIdx].look : 'teacherA';
  if (inClass) sc.mode = 'sleep';
  UI.progress(why === 'doze' ? 'Đêm qua thức khuya quá… mắt díp lại…' : 'Mắt hoa lên… người lả đi…', UI._fast ? 10 : 2600, '#8b8f9c');
  for (const ms of [360, 520, 700]) { await UI.fade(true, ms * 0.6); await UI.wait(ms === 700 ? 380 : 140); await UI.fade(false, ms); await UI.wait(220); }   // mắt nhắm lại rồi mở ra, mỗi lúc một lâu hơn
  if (tIdx >= 0 && !UI._fast) {                                               // thầy cô vội chạy xuống bàn
    const T = sc.actors[tIdx];
    await tween(tIdx, G.x + (inClass ? 18 : 20), G.y - (inClass ? 2 : 0), 650);
    T.dir = 1; sc.bubble = { x: T.x, y: T.y - 27, text: `${G.name}! ${G.name} ơi!` }; await UI.wait(1200); sc.bubble = null;
  }
  await UI.ask(`${co} giáo`, `<p>“${G.name}! Em sao thế này? Mặt tái hết cả rồi… Các em đỡ bạn xuống trạm y tế giúp ${co.toLowerCase()}!”</p>`, ['…'], { who: { look: tLook } });
  await UI.fade(true, 600);
  RT.scene = null; RT.outfit = null; RT.tid = null;
  setMap('yte', BED_SPOT.x, BED_SPOT.y, 0);
  for (const q of PERIODS) G.daily.done[q.n] = true;          // tiết này kết thúc luôn, nghỉ hết các tiết còn lại (không tính vắng)
  G.daily.fainted = true; addMemo('scene', 'faint');
  advanceTime(Math.max(FAINT.rest, PERIOD_LEN));
  G.stamina = Math.max(G.stamina, Math.round(maxStam() * FAINT.stam));
  // tỉnh dậy trên giường bệnh, cô y tá đứng cạnh
  const st = { open: false }, cs = RT.scene = { type: 'cut', map: 'yte', actors: [{ look: 'doctor', x: 72, y: 106, dir: 1 }], hide: ['doctor'], hideMe: true, bars: false, tw: [], bubble: null,
    props: [now => { drawSpr(sleeperOf(G.gender, 'med', st.open), MEDBED.x, MEDBED.y); if (!st.open) drawSpr(SPR.zzz, MEDBED.x + 10, MEDBED.y - 8 - Math.floor(now / 300) % 4); }] };
  await UI.fade(false, 700);
  await UI.wait(900); st.open = true;
  cs.bubble = { x: MEDBED.x + 8, y: MEDBED.y - 2, text: 'Ơ… mình đang ở đâu thế này?' }; await UI.wait(1500);
  cs.bubble = { x: 72, y: 106 - 27, text: 'Em tỉnh rồi à?' }; await UI.wait(1100); cs.bubble = null;
  const adv = why === 'doze'
    ? `<p>“Em <b>ngủ gục trong lớp</b> rồi được các bạn đưa xuống đây. Đêm qua em thức tới quá 2 giờ sáng phải không? Thiếu ngủ thì dù có ăn sáng đầy đủ, tới mấy tiết cuối người vẫn lả đi thôi.”</p><p>“Tối nay đi ngủ sớm, trước 12 giờ đêm nhé. Học khuya mấy cũng không bằng ngủ đủ giấc đâu em.”</p>`
    : `<p>“Em bị <b>ngất trong giờ học</b> vì kiệt sức đấy. Cô cho em nghỉ hết buổi hôm nay rồi.”</p><p>“Lần sau nhớ ăn uống đầy đủ, buổi trưa xuống phòng ngủ trưa chợp mắt một lát, đừng thức khuya nữa. Phải để ý sức khoẻ của mình hơn nhé.”</p>`;
  await UI.ask('Cô y tá', adv, ['Dạ, em cảm ơn cô'], { who: { look: 'doctor' } });
  RT.scene = null; G.x = BED_SPOT.x; G.y = BED_SPOT.y; G.dir = 0;
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
ACT.nap = async (mx, my) => {
  mx = mx === undefined ? 130 : mx; my = my === undefined ? 114 : my;
  if (!schoolToday() || !inWin(G.time, AM_END, PM_START - 30)) return meSay(`<p>Phòng ngủ trưa chỉ mở giờ nghỉ trưa (${fmtTime(AM_END)}–${fmtTime(PM_START - 30)}).</p>`);
  if (G.daily.nap) return UI.toast('Hôm nay bạn ngủ trưa rồi.');
  if (RT.lock) return;
  RT.lock = true;
  UI.progress('Đang ngủ trưa…', 2400, '#8f7fd0');
  await playCut({ inPlace: true, bars: false, hideMe: true, steps: [{ wait: 2400 }], props: [now => { drawSpr(sleeperOf(G.gender, 'mat'), mx, my); drawSpr(SPR.zzz, mx + 20, my - 10 - Math.floor(now / 300) % 5); }] });
  advanceTime(NAP.mins); G.daily.nap = true; gainStam(NAP.stam);
  RT.lock = false; UI.hud();
};
// Thư viện mở trước giờ học, giờ ra chơi, nghỉ trưa và sau giờ tan học. Ra chơi thì chỉ đọc được tới lúc vào lớp.
const LIB_TABLES = [[44, 104], [150, 104]];
function libWindow() {
  if (!(schoolToday() && G.atSchool && G.time >= PERIODS[0].start && G.time < schoolEndT())) return { mins: LIBRARY.mins };
  const w = YARD_WINDOWS.find(([a, b2]) => inWin(G.time, a, b2));
  return w ? { mins: Math.min(LIBRARY.mins, w[1] - G.time), brk: w[1] - w[0] <= 40 } : null;
}
ACT.readBook = async s => {
  if (RT.lock) return;
  const W = libWindow();
  if (!W) return UI.say('Thư viện', 'Cô thủ thư: “Đang giờ học, về lớp đi em.”<p class="dim">Thư viện mở trước giờ học, giờ ra chơi, giờ nghỉ trưa và sau giờ tan học.</p>');
  if (W.mins < 8) return UI.toast('Sắp vào lớp rồi, không kịp đọc đâu. Để giờ ra chơi sau nhé.');
  if ((G.daily.lib || 0) >= LIBRARY.perDay) return UI.toast('Hôm nay bạn đọc sách ở thư viện đủ rồi.');
  if (G.stamina < LIBRARY.stam) return UI.toast('Mệt quá, đọc không vào.', 'bad');
  const c = await UI.ask(`Tủ sách ${SUBJ[s].name}`, `<p>Lấy một cuốn ${SUBJ[s].name} ra bàn ngồi đọc ${W.mins} phút?${W.brk ? ' <span class="dim">(giờ ra chơi — đọc tới lúc vào lớp)</span>' : ''}</p>`, ['Đọc sách', 'Thôi']);
  if (c !== 0 || RT.lock) return;
  RT.lock = true;
  // hoạt cảnh: rút sách trên tủ → mang ra bàn → ngồi xuống ghế đẩu, mở sách đọc
  const i = BOOK_SUBJ.indexOf(s), shelfX = 36 + i * 34, [tx, ty] = LIB_TABLES[shelfX < 120 ? 0 : 1], seat = [tx - 6, ty + 20];
  const vy = !grudge('vy') && !isComp('vy') && Math.random() < 0.3, col = SUBJ[s].color, st = { ph: 0 };
  const prop = now => {
    const f = Math.floor(now / 500) % 2;
    if (st.ph === 1) { wRect(col, G.x - 4, G.y - 22 + f, 8, 6); wRect('#fffaf0', G.x - 4, G.y - 17 + f, 8, 1); }           // ôm sách trên tay
    if (st.ph === 2) { wRect('#fffaf0', tx + 6, ty + 6, 12, 7); wRect(col, tx + 5, ty + 5, 1, 9); wRect(col, tx + 18, ty + 5, 1, 9); wRect('#8fa0ab', tx + 7, ty + 8, 4, 1); wRect('#8fa0ab', tx + 13, ty + 8 + f, 4, 1); if (Math.floor(now / 1300) % 2) wRect('#efe6d2', tx + 12, ty + 6, 6, 7); }   // sách mở trên bàn, lật trang
    if (vy && st.ph === 2) { wRect('#e98fa5', tx + 28, ty + 7, 9, 6); wRect('#fffaf0', tx + 29, ty + 8, 7, 1); }
  };
  UI.progress(`Đang đọc sách ${SUBJ[s].name}…`, 3600, col);
  await playCut({ inPlace: true, bars: false, stay: true, actors: vy ? [{ look: 'vy', x: tx + 50, y: ty + 20, dir: 1 }] : [], hide: vy ? ['vy'] : [], props: [prop],
    steps: [{ move: ['me', shelfX, 50, 380] }, { fn: () => { G.dir = 3; } }, { wait: 250 }, { fn: () => { st.ph = 1; } }, { wait: 200 },
      { move: ['me', shelfX, 90, 360] }, { move: ['me', seat[0], 90, 380] }, { move: ['me', seat[0], seat[1], 260] }, { fn: () => { G.dir = 2; st.ph = 2; } }, { wait: 1500 }]
      .concat(vy ? [{ say: [0, 'Ơ, cậu cũng ra thư viện đọc sách à? Ngồi cùng bàn đi!'] }] : [{ wait: 600 }]) });
  advanceTime(W.mins);
  const pts = Math.max(1, Math.round(LIBRARY.pts * W.mins / LIBRARY.mins));
  G.daily.lib = (G.daily.lib || 0) + 1; useStam(LIBRARY.stam); addStat(s, pts);
  if (vy) { addFriend('vy', 2); UI.toast('Đọc sách cùng bàn với Vy.', 'good'); }
  RT.lock = false; UI.hud();
};
ACT.library = () => UI.toast('Thư viện là khu nhà riêng ở góc trái sân trường. Cửa giữa dãy nhà chính là cầu thang lên tầng 2 (các lớp anh chị khoá trên).');
// Phòng nhạc: sân khấu tập nhảy (bấm mũi tên theo nhịp) · phòng thu tập hát (bấm nốt rơi) · ở nhà: micro
ACT.music = async (kind, go) => {
  if (RT.lock) return;
  const home = kind === 'home', sing = kind !== 'dance';
  if (!home && schoolToday() && G.atSchool && G.time < schoolEndT() && !inWin(G.time, AM_END, PM_START - 10) && G.time >= PERIODS[0].start) return UI.say('Phòng nhạc', 'Đang giờ học, phòng nhạc khoá cửa phòng thu.<p class="dim">Tập được trước giờ học, giờ nghỉ trưa và sau giờ tan học.</p>');
  if ((G.daily.music || 0) >= MUSIC.perDay) return UI.toast('Hôm nay tập văn nghệ đủ rồi, khản cả giọng.');
  if (G.stamina < MUSIC.stam) return UI.toast('Mệt quá, không tập nổi.', 'bad');
  const c = go ? 0 : await UI.ask(sing ? (home ? 'Micro ở nhà' : 'Phòng thu') : 'Sân khấu', sing ? '<p>Bật nhạc nền lên rồi luyện thanh: bấm đúng nốt khi nốt chạm vạch.</p>' : '<p>Bật nhạc lên rồi nhảy: bấm mũi tên theo đúng chuỗi động tác.</p>', ['Bắt đầu', 'Thôi']);
  if (c !== 0) return;
  RT.lock = true;
  const d = 1 + Math.min(3, Math.floor(lv('vannghe') / 3));
  const r = sing ? await sceneSing(d, home ? 'home' : 'studio', home ? 'Hát ở nhà' : 'Thu âm') : await sceneDance(d + 1, 'stage', 'Tập nhảy');
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
    G.caughtCycle++; addConduct(-SMOKE.conduct, 'hút thuốc trong nhà vệ sinh'); addMemo('scene', 'caught'); addTeacher(TEACHER.caughtFun, 'nghiem'); addParent(-2, '', true);
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
  UI.store('Căn tin', ttMatOpen(G.day) ? '“Ăn gì con? Sắp Trung thu, căn tin có bán cả nguyên liệu làm đèn lồng đó!”' : '“Ăn gì con?”', () => CANTEEN.concat(ttMatItems()), f => (f.mat ? buyMat(f) : buyFood(f.inv, f.price, f.name)));

};

/* ============================================================
 *  PHỐ HOA PHƯỢNG: vào trong TTTM, khu game, nhà bạn
 * ============================================================ */
const DOORS = { mall: ['tttm', 'mall'], arcade: ['arc', 'arcade'] };
ACT.enter = async k => {
  const [map, pl] = DOORS[k], P = PLACES[pl];
  if (RT.lock || tetShut(P.name) || !placeOpen(P)) return;
  if (G.ride) dismount(true);
  const e = MAPS[map].entry;
  await goPlace(map, e[0], e[1], e[2], 0);
  if (G.comp && k === 'mall') UI.toast(`${FRIENDS[G.comp.fid].name} theo bạn vào trong.`, 'info');
};
ACT.mall = () => ACT.enter('mall'); ACT.arcade = () => ACT.enter('arcade');
// Một gian hàng trong TTTM
ACT.stallShop = id => {
  const name = MALL_STALLS.find(s => s[0] === id)[1], fid = palAt('mall'), wf = withF(fid), M = MALL;
  const items = () => MALL_GOODS[id].filter(it => !it.school || G.noOwn[it.id]).map(it => Object.assign({}, it, { owned: !!(it.own && G.owned[it.own]), desc: (it.desc || '') + (it.duo && fid ? ` (đi${wf})` : '') }));
  UI.store(name, '“Mời em xem hàng.”', items, async it => {
    if (G.money < it.price) return UI.toast('Không đủ tiền.', 'bad');
    if (it.act === 'movie') { UI.close(); return jointAct(`Đang xem phim${wf}…`, M.movie.mins, 'movie', fid, () => { if (fid) addMemo('scene', 'movie'); addMoney(-it.price); gainStam(M.movie.stam); palGain('mall', M.movie.friend); }); }
    if (it.act === 'book') {
      if (G.daily.book) return UI.toast('Hôm nay bạn mua sách tham khảo rồi, đọc hết cuốn đó đã.');
      UI.close();
      const k = await UI.ask('Nhà sách', '<p>Chọn sách tham khảo môn nào?</p>', BOOK_SUBJ.map(s => SUBJ[s].name).concat('Thôi'), { grid: true });
      if (k < 0 || k >= BOOK_SUBJ.length) return;
      G.daily.book = true; addMoney(-it.price); addStat(BOOK_SUBJ[k], M.book.pts); UI.hud(); return;
    }
    if (it.school) { addMoney(-it.price, true); delete G.noOwn[it.id]; UI.toast(`Đã mua lại ${it.name.toLowerCase()} — để sẵn ở tủ sách trong phòng ngủ.`, 'good'); UI.hud(); return; }
    if (it.act === 'box') { UI.close(); addMoney(-it.price); UI.hud(); return showPack(openPacks(M.box.n, 1), 'Mở hộp thẻ đặc biệt'); }
    if (it.inv && FOODS[it.inv]) return buyFood(it.inv, it.price, it.name);
    addMoney(-it.price, true);
    if (isFurn(it.id)) {           // đồ nội thất: cho vào túi, về nhà cầm lên rồi tự bày
      gAdd(it.id); if (it.own) G.owned[it.own] = true;
      UI._hb = null; UI.hud(); return UI.toast(`Đã mua ${it.name} (−${fmtMoney(it.price)}) — cho vào túi. Về nhà cầm lên rồi bấm chỗ muốn đặt.`, 'good');
    }
    if (it.inv) G.inv[it.inv] = (G.inv[it.inv] || 0) + (it.n || 1);
    if (it.own) G.owned[it.own] = true;
    UI.toast(`Đã mua ${it.name} (−${fmtMoney(it.price)})`, 'good'); UI.hud();
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
// Máy trong khu game: không có mini-game, chỉ có hoạt cảnh; thắng thua tuỳ điểm may mắn hôm nay và độ khéo tay
const MACH_LINES = {   // câu của bạn đi cùng khi đứng xem
  claw: 'Gắp con màu hồng đi! Canh cho kỹ vào!', fight: 'Đấu với tớ một ván không? Thua bao nước đó!', slot: 'Bấm đi bấm đi, hôm nay số đỏ mà!',
  race: 'Đua không? Tớ chấp cậu nửa vòng!', dance: 'Nhảy bài này đi, nhạc bốc lắm!',
};
function machineCut(kind, mx, res, fid) {
  const T = { claw: 3000, fight: 2800, slot: 2600, race: 2800, dance: 2900 }[kind];
  const pad = kind === 'dance', sx = pad ? 279 : mx + 12, sy = pad ? 62 : 52, now0 = () => performance.now() - (RT.scene.t0 || performance.now());
  const actors = fid ? [{ look: fid, outfit: friendOutfit(fid), x: pad ? 306 : sx + 17, y: pad ? 70 : sy + 15, dir: pad ? 1 : 3 }] : [];   // bạn đứng chếch phía sau xem
  const scr = (x, y, w, h, col) => wRect(col, mx + x, y, w, h);
  const props = [];
  if (kind === 'claw') props.push(() => {      // càng gắp chạy qua lại, hạ xuống, gắp, kéo lên
    const t = now0(), win = res === 'win', tx = mx + 12;
    let cx = mx + 5 + (Math.sin(t / 180) * 0.5 + 0.5) * 14, cy = 12;
    if (t > 1200) { cx = tx; cy = t < 1900 ? 12 + (t - 1200) / 700 * 11 : t < 2600 ? 23 - (t - 1900) / 700 * 11 : 12; }
    if (t > 2600) cx = tx + Math.min(6, (t - 2600) / 60);
    wRect('#8b8f9c', cx, 9, 1, cy - 9); wRect('#5f656f', cx - 3, cy, 7, 2); wRect('#5f656f', cx - 3, cy + 2, 1, 3); wRect('#5f656f', cx + 3, cy + 2, 1, 3);
    if (win && t > 1900) { wRect('#bfe3f2', tx - 3, 23, 7, 6); wRect('#e98fa5', cx - 2, cy + 3, 5, 4); wRect('#e98fa5', cx - 3, cy + 2, 2, 2); wRect('#e98fa5', cx + 2, cy + 2, 2, 2); }
  });
  if (kind === 'fight') props.push(() => {    // hai võ sĩ tí hon đấm nhau trên màn hình
    const t = now0(), k = Math.min(1, t / T), d = Math.round(Math.sin(t / 90) * 1.5), end = t > T - 700, win = res === 'win';
    scr(4, 14, 14, 10, '#1b1530'); scr(4, 22, 14, 2, '#3a3f55');
    const a = mx + 6 + Math.round(k * 2) + d, b = mx + 15 - Math.round(k * 2) - d;
    if (end && !win) wRect('#5a8fd6', a - 1, 21, 4, 1); else wRect('#5a8fd6', a, 17, 2, 5);
    if (end && win) wRect('#e2574c', b - 2, 21, 4, 1); else wRect('#e2574c', b, 17, 2, 5);
    if (!end && Math.floor(t / 260) % 2) wRect('#fffaf0', mx + 10, 17 + (Math.floor(t / 130) % 3), 2, 2);
    wRect('#ffe066', mx + 5, 15, Math.max(0, Math.round(5 * (1 - k * (win ? 0.3 : 1)))), 1); wRect('#ffe066', mx + 12, 15, Math.max(0, Math.round(5 * (1 - k * (win ? 1 : 0.3)))), 1);
  });
  if (kind === 'slot') props.push(() => {     // ba ô quay rồi dừng lần lượt
    const t = now0(), cols = ['#e2574c', '#f2a93b', '#5fae4a', '#3b82c4', '#e98fa5'];
    const fin = res === 'big' ? [1, 1, 1] : res === 'small' ? [3, 3, 0] : [0, 2, 4];
    scr(4, 14, 14, 10, '#fffaf0');
    for (let i = 0; i < 3; i++) { const stop = t > 900 + i * 500; wRect(cols[stop ? fin[i] : Math.floor(t / 70 + i * 2) % 5], mx + 5 + i * 4, 16, 3, 6); }
    if (t > 2000 && res !== 'none' && Math.floor(t / 150) % 2) for (let i = 0; i < 5; i++) wRect('#ffe066', mx + 2 + i * 4, 6, 2, 2);
  });
  if (kind === 'race') props.push(() => {     // đường đua chạy, xe của mình lách qua xe khác
    const t = now0();
    scr(4, 14, 14, 10, '#5f656f'); for (let i = 0; i < 3; i++) wRect('#fffaf0', mx + 10, 14 + ((Math.floor(t / 40) + i * 4) % 10), 1, 2);
    wRect('#e2574c', mx + 6 + Math.round(Math.sin(t / 300) * 2 + 2), 20, 3, 3);
    wRect(res === 1 ? '#5fae4a' : '#3b82c4', mx + 13, 15 + ((Math.floor(t / 60)) % 8), 3, 3);
  });
  if (kind === 'dance') props.push(() => {    // ô sáng trên sàn nhảy theo nhịp
    const t = now0(), k = Math.floor(t / 320), cell = (k * 5 + 2) % 6;
    if (t < T) wRect('rgba(255,255,255,.55)', 262 + 1 + (cell % 3) * 11, 46 + 1 + Math.floor(cell / 3) * 10, 9, 8);
  });
  const steps = [{ move: ['me', sx, sy, 450] }, { fn: sc => { G.dir = 3; sc.t0 = performance.now(); } }];
  if (fid) steps.push({ say: [0, MACH_LINES[kind]] }, { fn: sc => { sc.t0 = performance.now(); } });
  if (kind === 'dance') for (let i = 0; i < 8; i++) steps.push({ fn: () => { G.dir = [3, 1, 2, 0][i % 4]; } }, { hop: 'me' });
  else steps.push({ wait: T * 0.45 }, { hop: 'me' }, { wait: T * 0.45 });
  const said = {
    claw: res === 'win' ? 'Gắp được rồi! Một con gấu bông!' : 'Ơ… sắp lên tới nơi thì tuột mất!',
    fight: res === 'win' ? 'K.O.! Thắng rồi nhé!' : 'Thua sát nút… làm ván nữa!',
    slot: res === 'big' ? 'Ba ô giống nhau! TRÚNG LỚN!' : res === 'small' ? 'Hai ô giống nhau, trúng nhỏ!' : 'Trượt rồi… lần sau vậy.',
    race: res === 1 ? 'Về nhất! Đỉnh chưa!' : res === 2 ? 'Về nhì, suýt chút nữa!' : 'Về chót rồi, xe lật mấy vòng…',
    dance: res >= 0.8 ? 'PERFECT! Không trật nhịp nào!' : res >= 0.5 ? 'GREAT! Nhảy cũng ra gì đấy chứ!' : 'Trật nhịp tùm lum… mà vui!',
  }[kind];
  steps.push({ say: ['me', said] });
  if (fid && (kind === 'fight' || kind === 'race')) steps.push({ say: [0, res === 'win' || res === 1 ? 'Gì vậy trời, ván sau tớ phục thù!' : 'Ha ha, gà quá đi!'] });
  return { inPlace: true, title: MACHINE_NAME[kind], actors, props, steps };
}
ACT.machine = async (kind, mx) => {
  if (RT.lock) return;
  const cost = MACHINES[kind], have = G.inv.xeng || 0, fid = palAt('arcade'), wf = withF(fid), A = ARCADE;
  if (have < cost) return UI.say(MACHINE_NAME[kind], `Máy này cần <b>${cost} xèng</b>, bạn đang có ${have}.<p class="dim">Đổi xèng ở quầy bên trái (${fmtMoney(TOKENS.price)} = ${TOKENS.n} xèng).</p>`);
  if (kind === 'dance' && G.stamina < A.dance.stam) return UI.toast('Không đủ thể lực.', 'bad');
  const c = await UI.ask(MACHINE_NAME[kind], `<p>Bỏ ${cost} xèng vào máy? (đang có ${have} xèng)</p><p class="dim">Hôm nay may hay xui, khéo tay hay không đều ảnh hưởng tới kết quả.</p>`, [`Chơi${wf}`, 'Thôi']);
  if (c !== 0) return;
  RT.lock = true; G.inv.xeng -= cost;
  if (mx === undefined) mx = Math.round(G.x - 12);
  const L = luckK(), kt = lv('kheotay'), r = Math.random();
  let res;
  if (kind === 'claw') res = r < clamp(0.25 + 0.03 * kt + 0.15 * L, 0.08, 0.65) ? 'win' : 'lose';
  else if (kind === 'fight') res = r < clamp(0.45 + 0.03 * kt + 0.12 * L, 0.15, 0.85) ? 'win' : 'lose';
  else if (kind === 'slot') { const big = clamp(0.07 + 0.06 * L, 0.02, 0.15); res = r < big ? 'big' : r < big + 0.3 ? 'small' : 'none'; }
  else if (kind === 'race') res = r < clamp(0.35 + 0.03 * kt + 0.1 * L, 0.1, 0.8) ? 1 : r < 0.78 ? 2 : 3;
  else res = clamp(0.35 + 0.05 * lv('vannghe') + 0.15 * L + rnd(-0.2, 0.25), 0, 1);
  await playCut(machineCut(kind, mx, res, fid));
  if (kind === 'claw') { addStat('kheotay', res === 'win' ? 3 : 1); if (res === 'win') { G.inv.gaubong = (G.inv.gaubong || 0) + 1; addMemo('item', 'gaubong'); UI.toast('Được một con gấu bông! Đem tặng bạn thân nhé.', 'good'); } advanceTime(10); }
  else if (kind === 'slot') { const n = res === 'big' ? 8 : res === 'small' ? 2 : 0; if (n) { G.inv.xeng += n; UI.toast(`Máy nhả ra ${n} xèng! Đang có ${G.inv.xeng} xèng.`, 'good'); } advanceTime(5); }
  else if (kind === 'fight') { addStat('kheotay', res === 'win' ? 2 : 1); gainStam(3); if (fid) { palGain('arcade', res === 'win' ? 8 : 6); } if (res === 'win') { G.inv.xeng += 1; UI.toast('Thắng trận, máy thưởng 1 xèng.', 'good'); } advanceTime(15); }
  else if (kind === 'race') { gainStam(A.cab.stam); addStat('kheotay', 1); palGain('arcade', A.cab.friend); if (res === 1) { G.inv.xeng += 1; UI.toast('Về nhất, máy thưởng 1 xèng.', 'good'); } advanceTime(A.cab.mins / 2); }
  else { useStam(A.dance.stam, true); addStat('vannghe', Math.round(1 + A.dance.pts * res)); addStat('thethao', 1); palGain('arcade', A.dance.friend); advanceTime(A.dance.mins); }
  RT.lock = false; UI.hud();
};

/* ---------- nhà bạn ---------- */
ACT.house = async fid => {
  if (fid === 'vy' && vyHouseHook()) return;                           // sự kiện ở nhà Vy (học nhóm, hộp kỷ niệm, mang vở khi Vy ốm)
  if (fid === 'quang' && qgHouseHook()) return;                        // bữa cơm nhà Quang (04z_quang.js)
  const F = FRIENDS[fid];
  if (!friendHome(fid)) {
    let where;
    if (G.time >= 1290 || G.time < 390) where = `“Khuya rồi cháu ơi, ${F.name} ngủ rồi.”`;
    else if (meetToday(fid)) where = `“${F.name} ra ${PLACES[G.meet.place].name} rồi, bảo là có hẹn với cháu mà?”`;
    else if (fid === 'vy') where = `“${{ school: 'Giờ này Vy đang ở trường mà cháu?', library: 'Vy ở lại thư viện trường ôn bài rồi.', park: 'Vy ra công viên bên khu nhà cháu đọc sách rồi.', flower: 'Vy ra cửa hàng hoa ở công viên khu nhà cháu rồi.', tea: 'Vy đi mua trà sữa ở đầu phố rồi.', rehearse: 'Vy ở lại phòng nhạc của trường tập kịch.', class: 'Vy chưa về, chắc còn ở lớp.', gate: 'Vy chưa về, trời mưa thế này chắc đang trú ở cổng trường.', cat: 'Vy chưa về đâu cháu.', bench: 'Vy ra công viên ngồi rồi.', night: 'Vy ra công viên rồi.', commute: 'Vy đang trên đường về.' }[vyPlace()] || 'Vy vừa ra ngoài rồi cháu ạ.'}” — bác Lài nói.`;
    else if (fid === 'quang') where = `“${qgNotHome()}”`;
    else if (parkTime()) where = `“${F.name} ra công viên bên khu nhà cháu chơi rồi.”`;
    else if (isComp(fid)) where = `“Ơ, ${F.name} đang đi với cháu đấy thôi?”`;
    else if (schoolToday() && G.time < AFTER_SCHOOL) where = `“Giờ này ${F.name} đang ở trường mà cháu?”`;
    else where = `“${F.name} vừa chạy đi đâu đó rồi cháu ạ.”`;
    return UI.say(`Nhà ${F.name}`, `Bấm chuông… Người nhà ${F.name} ló đầu ra: ${where}<p class="dim">${fid === 'vy' ? 'Vy có nhà: sáng trước giờ học, chiều tối sau giờ học (thứ 2–4–6 ở lại thư viện, thứ 3–5 ra công viên đọc sách), cuối tuần ngoài giờ đi chơi.' : `${F.name} có nhà: ngày đi học 20:10–21:30 · ngày nghỉ 06:30–08:00 và 18:10–21:30.`}</p>`);
  }
  if (tetTime()) {                 // ngày Tết: chúc Tết, vào nhà tự do
    const T = tetYear(), opts = [], ids = [];
    if (!T.f[fid]) { opts.push(`Chúc Tết ${F.name}`); ids.push('chuc'); }
    opts.push('Vào nhà chơi', 'Thôi'); ids.push('in', 'x');
    const c = ids[await UI.ask(F.name, `<p>“A, ${G.name}! Năm mới năm me, vào nhà đi!”</p>`, opts, { who: { look: fid, outfit: friendOutfit(fid) } })];
    if (c === 'chuc') return tetVisitFriend(fid);
    if (c !== 'in') return;
    if (G.ride) dismount(true);
    G.visit = fid; return goPlace('fhome', 289, 204, 3, 0);
  }
  if (grudge(fid)) return UI.say(F.name, `“Cậu về đi. Tớ chưa hết giận đâu.”`);
  if (hearts(fid) < FRIEND_HOME_HEARTS) return UI.say(F.name, `“Ủa ${G.name}? Có gì không? … Nhà tớ đang bừa lắm, hôm khác vào chơi nha.”<p class="dim">Cần thân thiết ${FRIEND_HOME_HEARTS}♥ để được mời vào nhà (${FRIEND_ROOM_HEARTS}♥ thì vào được cả phòng riêng).</p>`);
  const c = await UI.ask(F.name, `<p>“A, ${G.name}! Vào nhà chơi đi!”</p>`, ['Vào nhà chơi', 'Thôi, tớ chỉ ghé qua thôi']);
  if (c !== 0) return;
  if (G.ride) dismount(true);
  G.visit = fid;
  await goPlace('fhome', 289, 204, 3, 0);
};
ACT.leaveFh = () => { if (G.visit === 'quang') return goPlace('dong', QG.house + 49, 152, 0, 0); const hx = (FRIEND_HOUSE[G.visit] || FRIEND_HOUSE.khoa)[1]; goPlace('pho', hx + 49, 152, 0, 0); };
ACT.fh = async kind => {
  const fid = G.visit, F = FRIENDS[fid], X = FH[kind], key = kind + '_' + fid;
  if (RT.lock) return;
  if (G.daily.fh[key]) return UI.toast(kind === 'tv' ? 'Hai đứa vừa xem xong rồi.' : 'Chơi nữa là mỏi tay lắm.');
  if (G.time > 1280) return UI.say(F.name, '“Khuya rồi, cậu về đi kẻo bố mẹ mắng.”');
  RT.lock = true;
  if (kind === 'tv') {
    await playCut({ inPlace: true, title: `Nhà ${F.name}`, hide: ['fh'], actors: [{ look: fid, outfit: friendOutfit(fid), x: 110, y: 138, dir: 3 }], steps: [{ move: ['me', 86, 138, 500] }, { fn: () => { G.dir = 3; } }, { say: [0, 'Tập này hay lắm, coi đi!'] }, { say: ['me', 'Ha ha ha! Tua lại khúc đó đi!'] }], stay: true });
    gainStam(6); 
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
const hasNum = id => id === 'mom' || id === 'dad' || id === 'fam' || G.phone.contacts.includes(id);
const phoneList = () => ['fam'].concat(Object.keys(FRIENDS).filter(f => G.phone.contacts.includes(f)));
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

/* ============================================================
 *  GIƯỜNG: ban ngày chợp mắt (giường nào cũng được) · tối ở nhà bạn thì ngủ lại
 * ============================================================ */
const sleepProp = (now, bx, by, open) => { drawSpr(sleeperOf(G.gender, 'bed', open), bx, by); if (!open) drawSpr(SPR.zzz, bx + 24, by - 2 - Math.floor(now / 300) % 5); };
async function bedNap(title, bx, by, after) {
  if (RT.lock) return;
  if (G.daily.bedNap >= BED_NAP.perDay) return meSay('<p>Nằm mãi mà không ngủ được nữa… dậy làm việc khác thôi.</p>');
  const c = await meSay(`<p>Trời còn sáng. Nằm xuống chợp mắt ${BED_NAP.mins} phút cho lại sức?</p><p class="dim">Hồi ${BED_NAP.stam} thể lực · ngủ hẳn qua đêm từ ${fmtTime(CFG.SLEEP_FROM)}.</p>`, ['Chợp mắt một lát', 'Thôi']);
  if (c !== 0) return;
  RT.lock = true; UI.progress('Đang chợp mắt…', 2200, '#8f7fd0');
  await playCut({ inPlace: true, bars: false, hideMe: true, steps: [{ wait: 2200 }], props: [now => sleepProp(now, bx, by)] });
  advanceTime(BED_NAP.mins); G.daily.bedNap++; gainStam(BED_NAP.stam); if (after) after();
  RT.lock = false; UI.hud();
}
ACT.fhBed = async () => {
  const fid = G.visit, F = FRIENDS[fid], who = { look: fid, outfit: friendOutfit(fid) };
  if (G.time >= CFG.SLEEP_FROM || G.time < CFG.DAY_START) {
    const c = await UI.ask(F.name, `<p>“Muộn rồi, hay ngủ lại nhà tớ luôn đi? Mai dậy sớm về.”</p>` + (G.daily.outPerm ? '' : '<p class="dim">Chưa xin phép bố mẹ: ngủ lại nhà bạn sẽ làm bố mẹ phiền lòng.</p>'), [`Ngủ lại nhà ${F.name}`, 'Thôi, tớ về nhà ngủ'], { who });
    if (c !== 0) return;
    addFriend(fid, 6, true); addMemo('scene', 'ngu');
    let note = `Tối qua bạn ngủ lại nhà ${F.name}, sáng sớm chào bạn rồi về nhà.`;
    if (!G.daily.outPerm) { addParent(PARENT.lateHome, '', true); note += ' Bố mẹ gọi điện mãi — lần sau nhớ xin phép trước nhé.'; }
    return goSleep(false, note);
  }
  return bedNap(`Giường của ${F.name}`, 196, 24, () => addFriend(fid, 2, true));
};

/* ============================================================
 *  TIVI: bản tin thời sự hằng ngày · vận may hôm nay
 * ============================================================ */
const NEWS_POOL = [
  'Thành phố Hoa Phượng trồng thêm 500 cây phượng dọc bờ sông, hứa hẹn mùa hè rực đỏ.',
  'Tuyến xe bus nội thành tăng chuyến vào giờ tan học, học sinh đi lại thuận tiện hơn.',
  'Giá rau xanh ở chợ Hoa Phượng giảm nhẹ sau đợt nắng ráo kéo dài.',
  'TTTM Hoa Phượng Plaza mở thêm gian hàng nội thất, nhiều ưu đãi cho học sinh.',
  'Khu game Arcade về thêm máy nhảy đời mới, các bạn trẻ xếp hàng chơi thử.',
  'Đội tuyển học sinh giỏi của thành phố giành 3 huy chương vàng cấp quốc gia.',
  'Ngư dân vùng biển Hoa Phượng trúng mẻ cá lớn đầu mùa.',
  'Công viên khu phố lắp thêm đèn chiếu sáng, người dân yên tâm đi dạo buổi tối.',
  'Bác sĩ khuyên học sinh ăn sáng đầy đủ và ngủ trưa 20 phút để học tập hiệu quả hơn.',
  'Ga Hoa Phượng thêm chuyến tàu ra biển vào sáng thứ Bảy và Chủ nhật.',
  'Phong trào “Mỗi ngày một trang sách” lan rộng ở các trường THPT trong thành phố.',
  'Cảnh sát giao thông nhắc học sinh đội mũ bảo hiểm khi đi xe máy, xe đạp điện.',
  'Tiệm trà sữa Mây ra mắt vị trà đào cam sả, khách xếp hàng dài cả buổi chiều.',
  'Nhà sách trong TTTM giảm giá sách tham khảo cho học sinh suốt tuần này.',
  'Bộ sưu tập thẻ cầu thủ trong bim bim Sao Vàng đang gây sốt, nhiều bạn săn thẻ huyền thoại.',
  'Trường THPT Hoa Phượng phát động phong trào giữ gìn vệ sinh lớp học, sân trường.',
];
const WEATHER = [
  ['Trời thu mát mẻ, chiều tối có mưa rào nhẹ. Nhiệt độ {a}–{b}°C.', 'Thu trong xanh, nắng nhẹ, rất hợp để đi dạo. Nhiệt độ {a}–{b}°C.', 23, 30],
  ['Gió mùa đông bắc tràn về, trời rét {a}–{b}°C. Các bạn học sinh nhớ mặc ấm khi tới trường.', 'Trời âm u, rét đậm về đêm. Nhiệt độ {a}–{b}°C.', 11, 18],
  ['Mưa phùn, nồm ẩm, đường trơn. Nhiệt độ {a}–{b}°C.', 'Xuân ấm áp, trời hửng nắng vào buổi trưa. Nhiệt độ {a}–{b}°C.', 17, 25],
  ['Nắng nóng gay gắt, nhiệt độ {a}–{b}°C. Nhớ uống đủ nước và đội mũ khi ra đường.', 'Trời nóng, chiều có giông. Nhiệt độ {a}–{b}°C.', 30, 37],
];
const RIVALS = ['CLB Sông Xanh', 'CLB Đồi Thông', 'CLB Cảng Biển', 'CLB Núi Đá', 'CLB Phố Cổ'];
// Sự kiện sắp tới trong `span` ngày: lễ hội (FESTIVALS), ngày lễ (HOLIDAYS), thi học kỳ, nghỉ hè, khai giảng
function upcomingEvents(day, span) {
  const out = [], add = (name, d, kind, desc) => { if (!out.some(o => o.name === name)) out.push({ name, d, kind, desc }); };
  for (let d = 0; d <= span; d++) {
    const dd = day + d, c = cal(dd), fe = FESTIVALS.find(f => isDate([f.season, f.day], dd)), h = holidayOf(dd);
    if (fe) add(fe.name, d, 'fes', fe.desc); if (h) add(h.name, d, 'hol', h.desc);
    if (d > 0 && c.season === 3 && c.dos === 1) add('kỳ nghỉ hè', d, 'summer');
    if (d > 0 && c.doy === 0) add('ngày khai giảng năm học mới', d, 'school');
  }
  const bd = contestDay(cal(day).year); if (bd >= day && bd <= day + span) add('Hội thi gói bánh chưng chào xuân', bd - day, 'fes', 'Các lớp đang tập gói bánh thật nhanh, thật đẹp.');
  const thi = G.tests.filter(t => t.type === 'thi' && !t.done && t.day >= day && t.day <= day + span).sort((a, b) => a.day - b.day)[0];
  if (thi) add('kỳ thi học kỳ', thi.day - day, 'exam');
  for (const e of svdNext(day, 2)) if (e.day - day <= span) add(e.name, e.day - day, 'svd', e);     // sự kiện ở sân vận động
  return out.sort((a, b) => a.d - b.d);
}
function eventLine(e) {
  if (e.kind === 'exam') return e.d === 0 ? 'Hôm nay các trường THPT bước vào <b>kỳ thi học kỳ</b>. Chúc các sĩ tử bình tĩnh, tự tin!' : `Còn <b>${e.d} ngày</b> nữa các trường THPT bước vào <b>kỳ thi học kỳ</b>. Học sinh nhớ ôn tập thật kỹ!`;
  if (e.kind === 'svd') { const v = e.desc, when = e.d === 0 ? 'Tối nay' : e.d === 1 ? 'Ngày mai' : `Còn <b>${e.d} ngày</b> nữa`; return v.kind === 'concert' ? `${when}${e.d > 1 ? ' là' : ''} <b>${v.name}</b> lúc ${fmtTime(v.from)} tại Sân vận động Hoa Phượng, với ${v.band}. ${v.desc}` : `${when}${e.d > 1 ? ' là' : ''} <b>${v.name}</b> lúc ${fmtTime(v.from)} trên sân vận động Hoa Phượng. ${v.desc}`; }
  if (e.kind === 'summer') return `Còn <b>${e.d} ngày</b> nữa là tới <b>kỳ nghỉ hè</b>. Học sinh cả thành phố đang đếm ngược từng ngày!`;
  if (e.kind === 'school') return `Còn <b>${e.d} ngày</b> nữa là <b>khai giảng năm học mới</b>. Các nhà sách đông nghịt phụ huynh mua sách vở.`;
  const desc = e.desc ? ' ' + e.desc : '';
  if (e.d === 0) return `Hôm nay là <b>${e.name}</b>!${desc || ' Chúc mọi người một ngày lễ thật vui vẻ.'}`;
  if (e.d === 1) return `Ngày mai là <b>${e.name}</b>.${desc || ' Phố phường đang tất bật chuẩn bị.'}`;
  return `Còn <b>${e.d} ngày</b> nữa là <b>${e.name}</b>.${desc || ' Phố phường bắt đầu trang hoàng rực rỡ.'}`;
}
function newsOf(day) {
  const r = mulberry(day * 131 + 7), pk = a => a[Math.floor(r() * a.length)], c = cal(day), L = [], tag = t => `<i class="tag">${t}</i>`;
  L.push(tag('THỜI TIẾT') + wxNews(day));
  for (const e of upcomingEvents(day, 10)) L.push(tag(e.kind === 'exam' || e.kind === 'school' || e.kind === 'summer' ? 'GIÁO DỤC' : e.kind === 'svd' ? 'SÂN VẬN ĐỘNG' : 'LỄ HỘI') + eventLine(e));
  const W = WEATHER[c.season] || WEATHER[0], lo = W[2] + Math.floor(r() * 3), hi = W[3] - Math.floor(r() * 3);
  const i1 = Math.floor(r() * NEWS_POOL.length), i2 = (i1 + 1 + Math.floor(r() * (NEWS_POOL.length - 1))) % NEWS_POOL.length;
  L.push(tag('TIN NHANH') + NEWS_POOL[i1]);
  if (L.length < 5) L.push(tag('TIN NHANH') + NEWS_POOL[i2]);
  const a = Math.floor(r() * 4), b = Math.floor(r() * 4);
  L.push(tag('THỂ THAO') + `CLB Hoa Phượng ${a > b ? 'thắng' : a < b ? 'để thua' : 'hoà'} ${pk(RIVALS)} với tỉ số ${a}–${b} ở vòng ${1 + (day % 26)} giải hạng Nhất.`);
  return L;
}
const TV_SIT = [{ move: ['me', 252, 92, 300] }, { move: ['me', 252, 116, 260] }, { fn: () => { G.dir = 3; } }];   // đi tới ghế bành cạnh sofa rồi ngồi xuống, quay mặt về tivi
const tvGlow = now => { const f = Math.floor(now / 220) % 4; wRect(['rgba(255,255,255,.28)', 'rgba(120,200,255,.32)', 'rgba(255,230,140,.28)', 'rgba(255,255,255,.12)'][f], 200, 21, 28, 12); };
// Xem tivi: lần đầu mỗi kênh trong ngày thì ngồi xem (mất chút thời gian), xem lại thì chỉ bật lên coi
async function tvWatch(kind) {
  if (RT.lock) return;
  if (!G.daily.tvSeen[kind]) {
    RT.lock = true;
    UI.progress(kind === 'news' ? 'Đang xem bản tin thời sự…' : 'Đang xem chương trình vận may…', 1800, '#3b82c4');
    await playCut({ inPlace: true, bars: false, steps: TV_SIT.concat([{ wait: 1300 }]), props: [tvGlow] });   // ngồi xuống ghế bành xem tivi
    advanceTime(kind === 'news' ? 15 : 10);
    G.daily.tvSeen[kind] = true;
    if (!G.daily.tv) { G.daily.tv = true; gainStam(6); }
    RT.lock = false; UI.hud();
  }
  if (kind === 'luck') G.daily.luckSeen = true;
  await tvTalk(kind);
}
// Bản tin / vận may hiện thành hội thoại nhỏ ở dưới màn hình: người dẫn chương trình đọc từng tin, mỗi tin một lần bấm
function tvLines(kind) {
  if (kind === 'news') return newsOf(G.day);
  const r = mulberry(G.day * 977 + 3), v = G.daily.luck, k = luckLv(), lvl = LUCK_LV[k];
  const col = ['đỏ', 'vàng', 'xanh lá', 'xanh dương', 'tím', 'trắng', 'hồng', 'cam'][Math.floor(r() * 8)], num = Math.floor(r() * 10);
  return [`Chào mừng các bạn đến với <b>Vận may hôm nay</b>! Vận may của <b>${G.name}</b>: <span class="lk-mini">${'★'.repeat(k + 1)}<i>${'★'.repeat(4 - k)}</i></span> <b>${lvl[1]}</b> (${v}/100 điểm).`,
    lvl[2], `Màu may mắn hôm nay là <b>${col}</b>, con số may mắn là <b>${num}</b>. May mắn cao thì bài kiểm tra dễ được điểm cao hơn. Hẹn gặp lại ngày mai!`];
}
async function tvTalk(kind) {
  const L = tvLines(kind), who = { look: kind === 'news' ? 'anchor' : 'luckhost', outfit: null }, title = kind === 'news' ? 'Thời sự Hoa Phượng · Phát thanh viên' : 'Vận may hôm nay · MC';
  for (let i = 0; i < L.length; i++) {
    const last = i === L.length - 1;
    const c = await UI.ask(title, `<p class="tvline">${L[i]}</p><p class="dim">${kind === 'news' ? 'Tin' : 'Phần'} ${i + 1}/${L.length}</p>`, last ? ['Tắt tivi'] : ['Tiếp ▸', 'Tắt tivi'], { who });
    if (last || c !== 0) return;
  }
}

/* ============================================================
 *  ANH CHỊ KHOÁ TRÊN: chỉ mẹo học hành, đời sống trong trường
 * ============================================================ */
const SENIOR_TIPS = {
  a_hung: ['Thi học kỳ hay ra mấy phần cuối chương lắm, ôn kỹ đoạn đó nhé em.', 'Hạnh kiểm chốt hai tuần một lần, đừng để bị giám thị ghi tên nhiều quá.', 'Đoàn trường sắp có hội thi gói bánh chưng trước Tết đấy, lớp em đăng ký chưa?'],
  c_mai: ['Phòng nhạc ở dãy nhà chính, nghỉ trưa vào tập hát là lên tay nhanh lắm.', 'Muốn lên sân khấu văn nghệ thì luyện máy nhảy ở khu game cũng được đó!', 'Giao thừa năm nào trên núi sau trường cũng có hội chợ, vui cực!'],
  a_phong: ['Thể lực yếu thì sáng tập hít đất, chiều ra sân đá bóng với tụi anh.', 'Tiết thể dục nhớ mang đồng phục, quên là thầy Mạnh không cho điểm đâu.', 'Đói thì xuống căn tin, cơm trưa hồi nhiều thể lực nhất.'],
  a_hoang: ['Ở trường này có gì cứ báo anh, đứa nào bắt nạt em là biết tay anh!', 'Đừng có trốn học ra quán net như anh hồi lớp 10, bị ghi tên mãi đấy.', 'Đá bóng giờ ra chơi thì gọi anh, anh đá tiền đạo.'],
  c_thao: ['Thư viện có tủ sách từng môn, nghỉ trưa vào đọc một cuốn là đỡ lắm.', 'Ngủ trưa ở phòng ngủ trưa đi em, chiều đỡ gục trong lớp.', 'Trước hôm kiểm tra nhớ ôn bài ở bàn học, vào lớp được cộng điểm đó.', 'Ngày nào xui thì đi chùa xin quẻ, hên thì làm bài cũng dễ trúng tủ hơn.'],
};
ACT.senior = async soc => {
  const S = SOCIETY[soc], first = !G.daily.soc[soc];
  meetSoc(soc);
  const tips = SENIOR_TIPS[soc], tip = tips[(G.day + (G.soc[soc] || 0)) % tips.length];
  const c = await UI.ask(S.name, `<p>“${tip}”</p>`, ['Dạ, em cảm ơn ạ', 'Rời đi'], { who: { look: S.look } });
};

/* ============================================================
 *  CẦM VẬT PHẨM: bấm món đồ trong túi / thanh đồ để cầm lên
 *  Đang cầm mà tương tác với người khác → tặng quà · bấm vào mình hoặc chỗ trống → ăn (nếu ăn được)
 * ============================================================ */
const holdName = id => (FOODS[id] ? FOODS[id].name : PARENT_ITEMS[id] || GROUP_ITEMS[id] || (goodsInfo(id) || {}).name || id);
const holdable = id => !!(FOODS[id] || PARENT_ITEMS[id] || GROUP_ITEMS[id] || goodsInfo(id));
function toggleHold(id) {
  if (!holdable(id) || !gCount(id)) return;
  RT.hold = RT.hold === id ? null : id;
  const self = FOODS[id] ? ', bấm vào mình để ăn' : id === 'giayve' ? ', bấm vào mình để ngồi vẽ' : id === 'chau' || id === 'thung' ? ', quay mặt về chỗ trống ngoài vườn rồi bấm vào mình để đặt xuống' : isFurn(id) ? '. Trong nhà: bấm vào chỗ muốn đặt (bóng mờ viền xanh là đặt được)' : '';
  UI.toast(RT.hold ? `Đang cầm ${holdName(id)}. Bấm vào người khác để bán hoặc tặng${self}. Bấm lại món đó để cất đi.` : `Cất ${holdName(id)} vào túi.`, 'info');
  UI._hb = null; UI.hotbar();
}
// Ai đang đứng trước mặt: bạn thân, bố mẹ, thầy cô, người quen ngoài xã hội, hay một bạn học bình thường
function giftTarget(t) {
  if (t.fol && G.comp) return { kind: 'friend', id: G.comp.fid };
  const n = t.npc; if (!n) return null;
  if (n.id === 'fh') return { kind: 'friend', id: G.visit };
  if (n.fid && FRIENDS[n.fid]) return { kind: 'friend', id: n.fid };
  if (n.fam || n.pf) return { kind: 'parent', id: n.fam || n.pf };
  if (n.id === 'teacher') return { kind: 'teacher', id: RT.tid || 'hanh' };
  if (n.tid) return { kind: 'teacher', id: n.tid };
  const soc = n.soc || { guard: 'baove', su: 'su' }[n.id];
  if (soc && SOCIETY[soc]) return { kind: 'soc', id: soc };
  return { kind: 'other', id: n.id, name: n.name, look: n.dynLook ? n.dynLook() : n.look, outfit: n.outfit ? n.outfit() : null };
}
async function giveHeld(t) {
  const id = RT.hold, T = giftTarget(t); if (!id || !T || !gCount(id)) return;
  if (PARENT_ITEMS[id]) { if (T.kind === 'parent' && await parentDeliver(T.id)) return; return UI.toast(`${PARENT_ITEMS[id]} là đồ của ${Object.values(PARENT_TASKS).find(P => P.item === id).who === 'dad' ? 'bố' : 'mẹ'} — mang tới đưa tận tay nhé.`, 'info'); }
  if (GROUP_ITEMS[id]) {
    if ((T.kind === 'friend' || T.kind === 'soc') && await groupDeliver(T.id)) return;
    const t = G.tasks.active.find(x => x.gr && taskDef(x).item === id);
    return UI.toast(t ? `${GROUP_ITEMS[id]} là đồ ${grLow(t.who)} nhờ lấy — mang tới đưa tận tay ${grLow(t.who)} nhé.` : `${GROUP_ITEMS[id]} không phải của người này.`, 'info');
  }
  if (id === LOVE.flower && T.kind === 'friend') return confess(T.id);          // hoa oải hương: ngỏ lời hẹn hò
  if (goodsInfo(id)) return giveOrSell(T, id);                                   // món đồ thường: hỏi bán hay tặng
  const key = 'g_' + T.kind + '_' + T.id, isFood = !!FOODS[id], it = holdName(id).toLowerCase();
  let who, name, line, done = () => { };
  if (T.kind === 'friend') {
    const F = FRIENDS[T.id], bd = isDate(F.bday, G.day), pts = (id === 'gaubong' ? GIFT_FRIEND : id === 'voso' ? SHELL_FRIEND : FOODS[id].gift || 2) * (bd ? 2 : 1);
    who = { look: T.id, outfit: friendOutfit(T.id) }; name = F.name;
    if (grudge(T.id)) return UI.ask(name, '<p>“Tớ không nhận quà của đứa mách lẻo đâu.”</p>', ['…'], { who });
    line = id === 'gaubong' ? 'Gấu bông cho tớ hả? Dễ thương quá trời!' : id === 'voso' ? 'Vỏ sò đẹp ghê! Áp lên tai nghe được tiếng sóng nè.' : `${holdName(id)} hả? Cảm ơn cậu nha, đúng lúc tớ đang thèm!`;
    if (bd) line += ' Lại đúng sinh nhật tớ nữa chứ!';
    done = () => addFriend(T.id, pts);
  } else if (T.kind === 'parent') {
    who = { look: T.id, outfit: T.id === 'mom' && G.map !== 'home' ? 'noapron' : null }; name = PNAME[T.id];
    line = isFood ? `Con mua ${it} cho ${name.toLowerCase()} đấy à? Ngoan quá!` : 'Quà cho bố mẹ hả con? Bố mẹ cảm ơn nhé.';
    done = () => addParent(id === 'gaubong' ? 3 : 1, '', true);
  } else if (T.kind === 'teacher') {
    const Tc = TEACHERS[T.id]; who = { look: Tc.look }; name = Tc.name;
    line = 'Cảm ơn em. Lần sau không cần quà cáp đâu, chăm học là thầy cô vui rồi.';
    done = () => addTeacher(2, T.id);
  } else if (T.kind === 'soc') {
    const S = SOCIETY[T.id]; who = { look: S.look }; name = S.name;
    line = T.id === 'su' ? 'A Di Đà Phật. Thầy cảm ơn tấm lòng của con.' : 'Ôi, quà cho bác/cô à? Cảm ơn cháu nhé!';
    done = () => { G.soc[T.id] = clamp((G.soc[T.id] || 0) + 6, 0, 100); };
  } else {
    who = { look: T.look, outfit: T.outfit }; name = T.name || 'Bạn';
    line = isFood ? 'Cho tớ thật hả? Cảm ơn nha!' : 'Ơ… cho tớ á? Cảm ơn cậu!';
    done = () => { };
  }
  if (G.daily.gift[key]) return UI.ask(name, '<p>“Hôm nay cậu tặng quà rồi mà, giữ lại mà dùng đi!”</p>', ['OK'], { who });
  G.daily.gift[key] = true; G.inv[id]--; if (!G.inv[id]) RT.hold = null;
  done(); UI._hb = null; UI.hud();
  await UI.ask(name, `<p>Bạn tặng <b>${it}</b>.</p><p>“${line}”</p>`, ['Không có gì!'], { who });
}
// Bấm vào chính mình hoặc chỗ trống khi đang cầm đồ: đồ ăn được thì hỏi có ăn không, còn lại thì thôi
async function heldSelf() {
  const id = RT.hold; if (!id || !gCount(id)) return;
  if (id === 'chau' || id === 'thung') return placeHeld(id);
  if (isFurn(id)) return furnPlace(false);
  if (id === 'giayve') return ACT.paint('paper');
  if (!FOODS[id]) return;
  const c = await meSay(`<p>Ăn ${FOODS[id].drink ? 'uống ' : ''}<b>${FOODS[id].name.toLowerCase()}</b> luôn bây giờ?</p><p class="dim">Hồi ${FOODS[id].stam} thể lực${FOODS[id].pack ? ' · mở gói ra có 1 thẻ cầu thủ' : ''}${G.comp ? ' · ăn chung với ' + FRIENDS[G.comp.fid].name : ''}.</p>`, [FOODS[id].drink ? 'Uống' : 'Ăn', 'Không ăn']);
  if (c === 0) { await eat(id); UI._hb = null; UI.hud(); }
}
// vẽ món đang cầm lơ lửng trên đầu nhân vật
function drawHeld(now) {
  if (!RT.hold || (RT.scene && RT.scene.hideMe) || !gCount(RT.hold)) return;
  drawSpr(iconCv(RT.hold), G.x - 9, G.y - 42 + Math.round(Math.sin(now / 260)) + (RT.scene && RT.scene.meOy || 0));
}

/* ---------- hoạt ảnh tập thể dục ở nhà ---------- */
function exerciseCut(id, it) {
  // chỗ đứng: thảm tập cố định; dây nhảy / tạ tay: cạnh chỗ để dụng cụ; xà đơn: đứng giữa khung, tay bám thanh trên
  let spot = [39, 166], barY = 118;
  if (it && id === 'xadon') { const [x, y] = furnRect('xadon', it.x, it.y); spot = [x + 15, y + 42]; barY = y + 8; }
  else if (it) spot = furnStand(it);
  const t0 = { v: performance.now() };
  const steps = [{ move: ['me', spot[0], spot[1], 450] }, { fn: sc => { G.dir = 0; t0.v = performance.now(); sc.drive = () => drive(sc); } }, { wait: 2300 }, { fn: sc => { sc.drive = null; sc.meOy = 0; } }];
  const T = () => (performance.now() - t0.v) / 1000;
  const drive = sc => {
    const t = T();
    if (id === 'tay') { const k = Math.floor(t / 1.15) % 2; if (k === 0) { sc.meOy = -Math.abs(Math.sin(t * 9)) * 3; return true; } sc.meOy = Math.round(2 + Math.sin(t * 7) * 2); return false; }   // chạy tại chỗ rồi hít đất (nhún xuống)
    if (id === 'daynhay') { sc.meOy = -Math.abs(Math.sin(t * Math.PI / 0.45)) * 7; return false; }
    if (id === 'tatay') { sc.meOy = Math.round(Math.sin(t * 2) * 0.5); return false; }
    if (id === 'xadon') { sc.meOy = -Math.round((Math.sin(t * 2.6 - 1.57) * 0.5 + 0.5) * 10); return false; }
    return false;
  };
  const props = [];
  if (id === 'daynhay') props.push(() => {       // dây quay vòng qua đầu, dưới chân
    const t = T(), ph = (t / 0.45) % 1, a = ph * 6.283, oy = RT.scene ? RT.scene.meOy || 0 : 0;
    for (let i = 0; i <= 14; i++) { const k = i / 14, x = G.x - 8 + k * 16, y = G.y - 12 + oy + Math.cos(a) * (12 + Math.sin(k * 3.14) * 3) * Math.sin(k * 3.14); wRect('#e2574c', x, y, 1, 1); }
    wRect('#3b82c4', G.x - 9, G.y - 13 + oy, 2, 3); wRect('#3b82c4', G.x + 7, G.y - 13 + oy, 2, 3);
  });
  if (id === 'tatay') props.push(() => {          // hai tay nâng tạ lên xuống so le
    const t = T(), l = Math.round((Math.sin(t * 5) * 0.5 + 0.5) * 8), r = Math.round((Math.sin(t * 5 + 3.14) * 0.5 + 0.5) * 8);
    for (const [x, up] of [[G.x - 11, l], [G.x + 6, r]]) { wRect('#3a3f55', x, G.y - 12 - up, 2, 4); wRect('#3a3f55', x + 3, G.y - 12 - up, 2, 4); wRect('#8b8f9c', x + 1, G.y - 11 - up, 3, 2); }
  });
  if (id === 'xadon') props.push(() => {          // tay bám xà
    const oy = RT.scene ? RT.scene.meOy || 0 : 0;
    wRect('#f8d0a8', G.x - 6, barY, 3, Math.max(2, G.y - 18 + oy - barY)); wRect('#f8d0a8', G.x + 3, barY, 3, Math.max(2, G.y - 18 + oy - barY));
  });
  return { inPlace: true, bars: false, steps, props };
}
