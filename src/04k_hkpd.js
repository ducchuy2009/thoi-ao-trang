'use strict';
/* ============================================================
 *  04k. HỘI KHOẺ PHÙ ĐỔNG — thứ 7 đầu tiên của mùa đông, ở sân trường
 *  - 08:00–11:00 phải qua cổng vào trường; không tới thì lớp bị xử thua cả 4 môn, mọi thầy cô và bạn bè mất điểm thân thiết
 *  - Vào trường là vào hội: thời gian đứng yên. Trường trang trí cờ, băng rôn, gian đồ ăn, khu thi đấu từng môn
 *  - 4 môn thi cùng cả lớp (đoạn cắt cảnh chơi được, không phải mini-game): kéo co, cướp cờ, tung còn đấu vòng tròn với 3 lớp
 *    (đối thủ khó dần), nhảy bao bố tiếp sức một lượt chung cả 4 lớp → xếp hạng từng môn, huy chương vàng / bạc / đồng
 *  - Xong cả 4 môn: gặp thầy hiệu trưởng → lễ trao giải (cúp tập thể xếp như bảng tổng sắp huy chương Olympic) → ảnh lớp → 17:00
 * ============================================================ */
function hkDayOf(year) { const d0 = year * YEAR_DAYS + HKPD.season * CFG.DAYS_PER_SEASON; for (let d = d0; d < d0 + 7; d++) if (cal(d).dow === 5) return d; return d0; }
const isHkDay = day => day === hkDayOf(cal(day).year);
const hkY = () => { const y = cal(G.day).year; return (G.hk[y] = G.hk[y] || { sp: {} }); };
const hkName = k => `${G ? G.grade : 10}${HK_CLASSES[k].suf}`;
const hkOn = () => !!G && !!RT.hkFest && G.map === 'school' && !sceneHides('hk');
const hkDecor = () => !!G && isHkDay(G.day) && G.time >= HKPD.open && G.time < HKPD.end + 120 && !hkY().forfeit;   // đồ trang trí (vẫn hiện trong cắt cảnh)
const hkUniform = () => !!G && isHkDay(G.day) && G.time <= HKPD.end && !hkY().forfeit;       // ngày hội mặc đồng phục
const hkGateOpen = () => !!G && isHkDay(G.day) && !hkY().done && !hkY().forfeit && G.time >= HKPD.open && G.time < HKPD.until;
const hkLeft = () => Object.keys(HK_SPORTS).filter(k => !hkY().sp[k]);
const hkMate = k => ({ look: k, outfit: null, name: HK_MATES[k] || 'Bạn' });
const hkOpp = (cls, n, seed) => Array.from({ length: n }, (_, i) => ({ look: HK_CLASSES[cls].looks[(i + (seed || 0)) % HK_CLASSES[cls].looks.length], outfit: null }));
const hkCheer = () => pick(HK_CHEER).replace('10A1', hkName('a1'));
const hkBonus = () => 1 + 0.05 * lv('thethao');                       // điểm Thể thao giúp kéo khoẻ hơn, chạy nhanh hơn
const hkSpeed = () => (UI._mgBot ? 6 : 1);                             // chế độ kiểm thử tự chơi: tua nhanh

/* ---------- vào hội / xử thua ---------- */
function startHk() {
  const H = hkY();
  RT.hkFest = true;
  if (G.time < HKPD.from) G.time = HKPD.from;
  if (!H.joined) {
    H.joined = true;
    UI.toast(`Hội khoẻ Phù Đổng! Trong hội thời gian tạm dừng. Tới gặp trọng tài ở 4 khu thi đấu (kéo co, cướp cờ, tung còn, nhảy bao bố) để thi cùng lớp ${hkName('a1')}. Thi xong cả 4 môn thì gặp thầy hiệu trưởng ở bục trao giải.`, 'good');
  }
  RT.snapNpcs = true; UI.hud();
}
// 11:00 mà chưa vào trường: lớp bị xử thua cả 4 môn
function hkTick(t) {
  if (!isHkDay(G.day)) return;
  const H = hkY();
  if (t === HKPD.from - 60 && !H.joined && !H.forfeit) UI.toast(`Hôm nay có Hội khoẻ Phù Đổng ở trường — phải có mặt từ ${fmtTime(HKPD.from)} đến ${fmtTime(HKPD.until)}!`, 'info');
  if (t >= HKPD.until && !H.joined && !H.forfeit) {
    H.forfeit = true; H.done = true;
    for (const k in TEACHERS) addTeacher(HKPD.failTeacher, k, true);
    for (const f in FRIENDS) addFriend(f, HKPD.failFriend, true);
    UI.toast(`11:00 — bạn không tới Hội khoẻ Phù Đổng. Lớp ${hkName('a1')} thiếu người nên bị xử thua cả 4 môn. Thầy cô và bạn bè đều rất buồn…`, 'bad');
    const f = Object.keys(FRIENDS).find(x => hasNum(x));
    if (f) inbox(f, 'Sao cậu không tới hội khoẻ? Lớp mình thiếu người, bị xử thua hết cả 4 môn rồi… Cả lớp buồn lắm.');
  }
}
// gọi từ eventTick: đi qua cổng vào trường trong ngày hội là vào hội
function hkEventTick() {
  if (!isHkDay(G.day)) return false;
  const H = hkY();
  if (!RT.hkFest && !H.done && G.atSchool && G.map === 'school' && G.time < HKPD.until) { startHk(); return true; }
  return false;
}

/* ---------- trên sân trường: trang trí, gian hàng, trọng tài, các bạn ---------- */
const HK_SPOT = { keoco: [584, 182], cuopco: [584, 284], tungcon: [164, 232], baobo: [290, 348], podium: [310, 178], principal: [392, 198] };
const HK_POLES = [164, 232];                       // cột còn của lớp mình và lớp bạn
// đường đua bao bố: vòng quanh khoảng sân giữa (sân đã nới rộng nên không đè lên sân bóng và cổng trường)
const HK_TRACK = [[290, 348], [290, 222], [412, 222], [412, 348], [290, 348]];
const HK_REF = { keoco: [584, 152, 0], cuopco: [584, 326, 3], tungcon: [208, 336, 3], baobo: [262, 362, 2] };
function buildHkpd() {
  const m = MAPS.school;
  addObj(m, { s: 'hkbanner', x: 300, y: 40, base: 106, vis: hkDecor });
  m.labels.push({ x: 352, y: 47.5, text: 'HỘI KHOẺ PHÙ ĐỔNG', size: 6.4, col: '#ffe066', maxw: 96, vis: hkDecor });
  for (const [a, b] of [[388, 122], [470, 344]]) addBunting(m, a, b, hkDecor);      // dây cờ căng giữa các cột tre
  addObj(m, { s: 'hkpodium', x: HK_SPOT.podium[0], y: HK_SPOT.podium[1], base: 170, sol: [0, 6, 66, 22], vis: hkDecor });
  const sign = (id, x, y, text) => { addObj(m, { s: 'hksign', x, y, sol: [14, 26, 6, 4], vis: hkDecor, label: () => `Khu thi ${HK_SPORTS[id].name.toLowerCase()}`, act: () => ACT.hkSport(id) }); m.labels.push({ x: x + 17, y: y + 9.5, text, size: 4.6, col: '#2a2136', maxw: 30, vis: hkDecor }); };
  sign('keoco', 620, 104, 'KÉO CO'); sign('cuopco', 446, 296, 'CƯỚP CỜ'); sign('tungcon', 128, 246 + 60, 'TUNG CÒN'); sign('baobo', 222, 362, 'BAO BỐ');
  // ghế đá giữa sân dọn đi trong ngày hội (nằm trên đường đua)
  for (const o of m.objs) if (o.s === 'benchstone' && o.x === 396 && o.y === 282) o.vis = () => !hkDecor();
  // gian đồ ăn
  const booth = (id, a, name, items) => {
    const act = () => ACT.hkFood(name, items);
    addObj(m, { s: `fb_${id}_b`, x: a, y: 106, sol: [0, 26, 56, 20], vis: hkDecor });
    addObj(m, { s: `fb_${id}_f`, x: a, y: 144, sol: [1, 8, 54, 15], vis: hkDecor, label: () => `${name} — mua đồ ăn`, act });
    NPCS.push({ id: 'hkv_' + id, name: 'Cô bán hàng', look: 'vendor', map: 'school', x: a + 28, y: 156, dir: 0, vis: hkOn, label: () => name, act });
  };
  booth('hknuoc', 186, 'Gian nước mía, kem', ['nuocmia', 'kem']); booth('hkxoi', 244, 'Gian xôi, bánh mì', ['xoi', 'banhmi', 'xien']);
  // trọng tài từng môn (thầy cô)
  for (const id in HK_SPORTS) { const [x, y, d] = HK_REF[id], tid = HK_SPORTS[id].ref; NPCS.push({ id: 'hkr_' + id, tid, name: TEACHERS[tid].name, look: TEACHERS[tid].look, map: 'school', x, y, dir: d, vis: hkOn, label: () => `${TEACHERS[tid].name} — trọng tài ${HK_SPORTS[id].name.toLowerCase()}${hkY().sp[id] ? ' (lớp mình thi xong rồi)' : ''}`, act: () => ACT.hkSport(id) }); }
  NPCS.push({ id: 'hk_principal', soc: 'hieutruong', name: 'Thầy hiệu trưởng', look: 'principal', map: 'school', x: HK_SPOT.principal[0], y: HK_SPOT.principal[1], dir: 0, vis: hkOn, label: () => 'Thầy hiệu trưởng — trao giải', act: () => ACT.hkPrincipal() });
  NPCS.push({ id: 'hk_hanh', tid: 'hanh', name: 'Cô Hạnh', look: 'teacherA', map: 'school', x: 456, y: 210, dir: 1, vis: hkOn, label: () => 'Cô Hạnh — chủ nhiệm lớp mình', act: () => hkTalk('Cô Hạnh', { look: 'teacherA' }, `Cả lớp mình cố lên nhé! Thi xong môn nào cô cũng tự hào về các em. Còn ${hkLeft().length} môn nữa đấy.`, 'hanh') });
  // các bạn đứng xem, cổ vũ quanh khu thi
  const spect = [['khoa', 548, 210, 0, 'Kéo co để tớ với Đạt lo! Cậu vào kéo cùng nha!'], ['dat', 620, 210, 0, 'Lớp 10A2 khoẻ lắm đó, nhưng tụi mình đoàn kết hơn!'], ['vy', 196, 290, 3, 'Tung còn phải canh gió đó, đừng ném mạnh quá!'], ['ngan', 226, 296, 3, 'Ném lọt vòng là có điểm, cố lên!'],
    ['c1', 262, 212, 0, 'Cả lớp ra sân cổ vũ đông đủ luôn!'], ['c4', 340, 300, 0, 'Tớ không thi nhưng hò hét khản cả cổ rồi đây.'], ['c2', 456, 330, 1, 'Cô Hạnh mua nước mía cho cả lớp đó!'],
    ['x1', 652, 214, 0, 'Lớp 10A2 bọn tớ vô địch năm ngoái đấy nhé!'], ['x3', 120, 280, 2, 'Lớp 10A3 luyện tung còn cả tuần rồi.'], ['x4', 362, 276, 1, 'Tớ lớp 10A4, chơi vui là chính thôi!']];
  for (const [k, x, y, d, line] of spect) {
    const fr = !!FRIENDS[k], name = fr ? FRIENDS[k].name : k[0] === 'x' ? GROUP_PEOPLE[k][0] : `${HK_MATES[k]} · lớp mình`;
    NPCS.push({ id: 'hk_' + k, fid: fr ? k : null, name, look: k, map: 'school', x, y, dir: d, vis: hkOn, label: () => name, act: () => (fr ? ACT.friend(k, 'school') : hkTalk(name.split(' · ')[0], { look: k }, line.replace(/10A(\d)/g, (_, n) => `${G.grade}A${n}`))) });
  }
}
function hkTalk(name, who, line, tid) {
  const k = 'hkt_' + name; if (!G.daily[k]) { G.daily[k] = true; if (tid) addTeacher(1, tid); }
  UI.ask(name, `<p>“${line}”</p>`, ['Cố lên!'], { who });
}
ACT.hkFood = (name, items) => {
  if (!hkOn()) return;
  UI.store(name, '“Ăn uống cho khoẻ rồi thi đấu tiếp nha các em!”', HK_FOOD.filter(f => items.includes(f.id)).map(f => ({ id: f.id, name: f.name, price: f.price, desc: `Hồi ${FOODS[f.id].stam} thể lực.`, inv: f.id })), f => buyFood(f.id, f.price, f.name));
};
// đồ trang trí: dây cờ đuôi nheo, dây kéo co nằm trên sân, cờ, cột còn, vạch đường đua (vẽ trước lớp tối)
function drawHkProps(now) {
  if (G.map !== 'school' || !hkDecor()) return;
  if (RT.scene && RT.scene.type === 'cut') return;
  const [kx, ky] = HK_SPOT.keoco; for (let i = -50; i <= 50; i++) wRect('#c9a467', kx + i, ky + Math.sin(i / 7) * 0.8, 1, 1.4);
  wRect('#e2574c', kx - 1, ky - 3, 2, 6); wRect('#fffaf0', kx - 17, ky - 8, 1, 16); wRect('#fffaf0', kx + 16, ky - 8, 1, 16);
  const [fx, fy] = HK_SPOT.cuopco; drawSpr(SPR.hkflagstand, fx - 7, fy - 24); wRect('#fffaf0', fx - 66, fy - 38, 1, 76); wRect('#fffaf0', fx + 65, fy - 38, 1, 76);
  for (const px of HK_POLES) hkPole(px, now);
  wRect('#fffaf0', 136, 304, 124, 1);
  hkTrackLines();
}
function hkPole(px, now, wind) {
  wRect('#8a5a3a', px - 1, 202, 3, 70); wRect('#a9703f', px - 1, 202, 1, 70);
  const ring = (a, r, col) => { for (let i = 0; i < 24; i++) { const t = i / 24 * 6.283; wRect(col, px + Math.cos(t) * r - 0.5, 192 + Math.sin(t) * r - 0.5, 1.2, 1.2); } };
  ring(0, 7, '#c8312b'); ring(0, 6, '#ffd23a');
  const w = wind === undefined ? Math.sin(now / 900) * 0.5 : wind, fl = Math.round(Math.sin(now / 120) * 1);
  wRect('#e2574c', px + (w >= 0 ? 1 : -7), 199 + fl, 6, 3);
}
// vạch kẻ đường đua bao bố: 4 làn quanh sân, vạch xuất phát / về đích kẻ ô cờ
function hkTrackLines(lanes) {
  const n = lanes || 4;
  for (let k = 0; k <= n; k++) { const o = k * 7 - 3.5, col = k === 0 || k === n ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.45)'; for (let i = 0; i < 4; i++) { const [a, b] = HK_TRACK[i], [c, d] = HK_TRACK[i + 1], len = Math.hypot(c - a, d - b); for (let s = 0; s < len; s += 4) { const p = trackPos(HK_TRACK, i, s / len, o); wRect(col, p.x, p.y, a === c ? 1 : 3, a === c ? 3 : 1); } } }
  const s0 = trackAt(0, 0); for (let i = 0; i < n * 7; i += 2) for (let j = 0; j < 2; j++) wRect((i / 2 + j) % 2 ? '#2a2136' : '#fffaf0', s0.x + 3.5 - i - 2, s0.y - 2 + j * 2, 2, 2);
}

/* ---------- vào thi một môn (bấm trọng tài / biển khu thi) ---------- */
ACT.hkSport = async id => {
  if (RT.lock) return;
  const S = HK_SPORTS[id], H = hkY(), who = { look: TEACHERS[S.ref].look };
  if (!RT.hkFest) return UI.ask(TEACHERS[S.ref].name, `<p>“Khu thi ${S.name.toLowerCase()} của Hội khoẻ Phù Đổng đây. ${isHkDay(G.day) && !H.done ? 'Vào hội rồi hẵng thi nhé.' : 'Hội đã kết thúc rồi em ạ.'}”</p>`, ['Dạ'], { who });
  if (H.sp[id]) return UI.ask(TEACHERS[S.ref].name, `<p>“Lớp ${hkName('a1')} thi môn ${S.name.toLowerCase()} xong rồi — xếp <b>hạng ${H.sp[id].place}</b>. ${hkLeft().length ? 'Sang khu khác thi tiếp đi em!' : 'Xong cả 4 môn rồi, ra gặp thầy hiệu trưởng ở bục trao giải nhé!'}”</p>`, ['Dạ!'], { who });
  const vs = id === 'baobo' ? 'Cả 4 lớp cùng đua một lượt.' : `Thi loại trực tiếp: lần lượt gặp ${HK_ORDER.map(hkName).join(' → ')} (càng về sau càng khó, trận cuối là chung kết). <b>Thua trận nào là bị loại ngay.</b>`;
  const c = await UI.ask(TEACHERS[S.ref].name, `<p>“Lớp ${hkName('a1')} thi môn <b>${S.name}</b> nhé! ${vs}”</p><p class="dim">${S.rule}</p><p class="dim">Đội lớp mình: bạn, ${S.team.map(k => HK_MATES[k]).join(', ')}.</p>`, ['Vào thi!', 'Để sau'], { who });
  if (c !== 0) return;
  RT.lock = true;
  try {
    if (id === 'baobo') await hkRace();
    else await hkGroup(id);
  } finally { RT.lock = false; arenaClose(); UI.hud(); }
};
// Thi loại trực tiếp (kéo co, cướp cờ, tung còn): lần lượt gặp 10A4 → 10A3 → chung kết với 10A2 (khó dần), THUA LÀ BỊ LOẠI NGAY
async function hkGroup(id) {
  const S = HK_SPORTS[id], path = [];
  let lostTo = null;
  for (let i = 0; i < HK_ORDER.length; i++) {
    const o = HK_ORDER[i];
    const r = id === 'keoco' ? await hkTugRound(o, i) : id === 'cuopco' ? await hkFlagRound(o, i) : await hkConRound(o, i);
    const win = r.win !== undefined ? !!r.win : r.sa > r.sb;
    path.push({ o, sa: r.sa, sb: r.sb, win });
    if (!win) { lostTo = o; break; }
    if (i < HK_ORDER.length - 1) await UI.ask(S.name, `<p>${hkRound(i)[0].toUpperCase() + hkRound(i).slice(1)}: ${hkName('a1')} <b>thắng</b> ${hkName(o)}${id === 'keoco' ? '' : ` (${r.sa} – ${r.sb})`}, được đi tiếp!</p><p>${i + 1 === HK_ORDER.length - 1 ? 'Vào <b>chung kết</b>' : 'Vòng tiếp theo'} gặp <b>${hkName(HK_ORDER[i + 1])}</b> — khó hơn đấy!</p>`, ['Thi tiếp!']);
  }
  const wins = path.filter(p => p.win).length, order = hkKoOrder(lostTo, wins), place = order.indexOf('a1') + 1;
  hkFinish(id, order, wins);
  const rows = path.map((p, i) => `<tr class="${p.win ? 'me' : ''}"><td>${hkRound(i)}</td><td>${hkName('a1')} – ${hkName(p.o)}</td><td>${id === 'keoco' ? (p.win ? 'thắng' : 'thua') : `${p.sa} – ${p.sb}`}</td><td>${p.win ? 'đi tiếp' : 'bị loại'}</td></tr>`).join('');
  await UI.ask(`Kết quả môn ${S.name}`, `<table class="hktab"><tr><th>Vòng</th><th>Trận</th><th>Kết quả</th><th></th></tr>${rows}</table>
    <table class="hktab"><tr><th>#</th><th>Lớp</th></tr>${order.map((k, i) => `<tr class="${k === 'a1' ? 'me' : ''}"><td>${i + 1}</td><td>${hkName(k)}</td></tr>`).join('')}</table>
    <p>${lostTo ? `Lớp ${hkName('a1')} thua ${hkName(lostTo)} ở ${hkRound(path.length - 1)} nên bị loại — ` : `Lớp ${hkName('a1')} thắng cả 3 trận — `}xếp <b>hạng ${place}</b>${place <= 3 ? `, được huy chương ${['vàng', 'bạc', 'đồng'][place - 1]}!` : '.'}</p><p class="dim">Thi loại trực tiếp: thua trận nào là dừng ở trận đó. ${hkLeft().length ? `Còn ${hkLeft().length} môn: ${hkLeft().map(k => HK_SPORTS[k].name.toLowerCase()).join(', ')}.` : 'Xong cả 4 môn rồi — ra gặp thầy hiệu trưởng ở bục trao giải!'}</p>`, ['OK']);
}
// thứ hạng sau thi loại trực tiếp: thắng cả 3 trận → nhất, thua ở chung kết → nhì, thua ở vòng 2 → ba, thua ngay vòng 1 → bét.
// Lớp thắng mình luôn xếp trên mình; các lớp còn lại xếp theo sức (có chút may rủi)
function hkKoOrder(lostTo, wins) {
  const place = HK_ORDER.length + 1 - wins, score = {};
  for (const k of HK_ORDER) score[k] = HK_CLASSES[k].str + Math.random() * 1.6;
  const others = HK_ORDER.filter(k => k !== lostTo).sort((a, b) => score[b] - score[a]), above = lostTo ? [lostTo] : [], below = [];
  for (const k of others) (above.length < place - 1 ? above : below).push(k);
  above.sort((a, b) => score[b] - score[a]);
  return above.concat(['a1'], below);
}
function hkFinish(id, order, wins) {
  const H = hkY(), place = order.indexOf('a1') + 1;
  H.sp[id] = { order, place };
  addStat('thethao', 2 + wins); useStam(6, true);
  for (const k of HK_SPORTS[id].team) if (FRIENDS[k]) addFriend(k, HKPD.playFriend + (place <= 3 ? 2 : 0));
  if (place <= 3) addTeacher(2, HK_SPORTS[id].ref);
}
// trận giữa hai lớp bạn: lớp mạnh hơn dễ thắng hơn
function hkSimMatch(id, a, b) {
  const p = 0.5 + 0.13 * (HK_CLASSES[a].str - HK_CLASSES[b].str), win = Math.random() < p, lose = id === 'keoco' ? 0 : Math.floor(Math.random() * 3);
  const hi = id === 'keoco' ? 1 : id === 'cuopco' ? 3 : lose + 1 + Math.floor(Math.random() * 3);
  if (id === 'tungcon' && Math.random() < 0.12) return { a, b, sa: lose + 1, sb: lose + 1 };
  return win ? { a, b, sa: hi, sb: lose } : { a, b, sa: lose, sb: hi };
}
function hkStats(ms, k) {
  const s = { w: 0, d: 0, l: 0, f: 0, a: 0, pts: 0 };
  for (const m of ms) { if (m.a !== k && m.b !== k) continue; const my = m.a === k ? m.sa : m.sb, ot = m.a === k ? m.sb : m.sa; s.f += my; s.a += ot; if (my > ot) { s.w++; s.pts += 3; } else if (my === ot) { s.d++; s.pts += 1; } else s.l++; }
  return s;
}
// xếp hạng: điểm → hiệu số → bàn thắng → đối đầu → lớp yếu hơn được xếp trên (ít khi xảy ra)
function hkRank(ms) {
  const ks = Object.keys(HK_CLASSES);
  return ks.sort((x, y) => {
    const A = hkStats(ms, x), B = hkStats(ms, y);
    if (B.pts !== A.pts) return B.pts - A.pts;
    if (B.f - B.a !== A.f - A.a) return (B.f - B.a) - (A.f - A.a);
    if (B.f !== A.f) return B.f - A.f;
    const h = ms.find(m => (m.a === x && m.b === y) || (m.a === y && m.b === x));
    if (h && h.sa !== h.sb) { const xw = (h.a === x) === (h.sa > h.sb); return xw ? -1 : 1; }
    return HK_CLASSES[x].str - HK_CLASSES[y].str;
  });
}
// bảng tổng sắp huy chương: nhiều HCV xếp trên, bằng thì so HCB, rồi HCĐ (như Olympic); bằng hết thì tổng thứ hạng các môn
function hkMedals() {
  const H = hkY(), T = {};
  for (const k in HK_CLASSES) T[k] = { k, g: 0, s: 0, b: 0, sum: 0 };
  for (const id in HK_SPORTS) { const o = H.sp[id] ? H.sp[id].order : []; o.forEach((k, i) => { T[k].sum += i + 1; if (i === 0) T[k].g++; else if (i === 1) T[k].s++; else if (i === 2) T[k].b++; }); }
  return Object.values(T).sort((p, q) => q.g - p.g || q.s - p.s || q.b - p.b || p.sum - q.sum || HK_CLASSES[p.k].str - HK_CLASSES[q.k].str);
}

/* ---------- HUD trên màn hình khi đang thi (tỉ số, đồng hồ, hướng dẫn) + bắt phím ---------- */
const ARENA = { el: null, h: null, b: null, off: null, tap: null };
function arenaOpen(onKey, onTap, btnText) {
  if (!ARENA.el) {
    const d = document.createElement('div'); d.id = 'arena'; d.innerHTML = '<div class="ah"></div><button class="ab" type="button"></button>';
    document.body.appendChild(d); ARENA.el = d; ARENA.h = d.firstChild; ARENA.b = d.lastChild;
    ARENA.b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (ARENA.tap) ARENA.tap(); });
  }
  if (ARENA.off) ARENA.off();
  ARENA.tap = onTap || null; ARENA.b.style.display = onTap ? '' : 'none'; ARENA.b.textContent = btnText || 'BẤM!';
  ARENA.el.classList.add('on'); ARENA.h.innerHTML = '';
  const mv = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
  const h = e => {
    if (UI.isOpen()) return;
    const k = e.code === 'Space' ? ' ' : e.code && /^Key[A-Z]$/.test(e.code) ? e.code.slice(3).toLowerCase() : e.key.toLowerCase();
    if (mv.includes(k)) return;                      // phím di chuyển vẫn đi tiếp tới bộ điều khiển chung (KEYS)
    e.preventDefault(); e.stopImmediatePropagation();
    if (!e.repeat && onKey) onKey(k);
  };
  window.addEventListener('keydown', h, true);
  ARENA.off = () => window.removeEventListener('keydown', h, true);
}
const arenaText = html => { if (ARENA.h && ARENA.h.innerHTML !== html) ARENA.h.innerHTML = html; };
function arenaClose() { if (ARENA.off) ARENA.off(); ARENA.off = null; ARENA.tap = null; if (ARENA.el) ARENA.el.classList.remove('on'); }
// chữ trên bản đồ (số áo, tỉ số…)
function wText(t, x, y, size, col, stroke) {
  const S = VIEW.S; ctx.font = `800 ${Math.round(size * S)}px "Baloo 2", system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const X = VIEW.ox + x * S, Y = VIEW.oy + y * S;
  if (stroke) { ctx.lineWidth = Math.max(2, S * 0.9); ctx.lineJoin = 'round'; ctx.strokeStyle = stroke; ctx.strokeText(t, X, Y); }
  ctx.fillStyle = col; ctx.fillText(t, X, Y);
}
// chạy một đoạn chơi được trong cắt cảnh: tick(dt) mỗi khung hình, trả về true khi xong
// tick trả về true = xong; giá trị khác (1 / 0) = mình có đang bước đi không (để vẽ chân bước)
const liveLoop = (sc, tick) => new Promise(res => { sc.drive = dt0 => { const r = tick(Math.min(0.05, dt0) * hkSpeed()); if (r === true) { sc.drive = null; res(); return false; } return !!r; }; });
const hkRound = r => ['vòng 1', 'vòng 2', 'chung kết'][r] || `vòng ${r + 1}`;
const mmss = t => `${Math.floor(Math.max(0, t) / 60)}:${String(Math.ceil(Math.max(0, t)) % 60).padStart(2, '0')}`;
const medalCol = p => ['#ffd23a', '#d6dbe3', '#c8834a'][p - 1];
// sau trận: đội thắng nhảy cẫng lên, đội thua cúi đầu
async function hkAfter(sc, win, mine, theirs, lineW, lineL, teacher) {
  arenaText('');
  const hop = idx => idx.map(i => ({ hop: i }));
  if (win) await runStep({ par: hop(mine).concat([{ say: ['me', lineW] }]) }, {});
  else await runStep({ par: hop(theirs).concat([{ say: ['me', lineL] }]) }, {});
  if (teacher !== undefined) await runStep({ say: [teacher, win ? 'Giỏi lắm các em! Cả lớp đoàn kết quá!' : 'Không sao đâu, các em đã cố hết sức rồi!'] }, {});
}

/* ============================================================
 *  KÉO CO — dùng chung cho Hội khoẻ Phù Đổng và hội Trung thu
 *  Hai đội đứng hai bên dây (đội mình bên trái, mình đứng đầu dây). Bấm Space / nút BẤM thật nhanh để cả đội kéo.
 *  Dải lụa đỏ qua vạch bên nào thì đội đó thắng; hết giờ thì dải lụa lệch về bên nào bên đó thắng.
 *  o: { map, cx, cy, L: [đồng đội], R: [đội bạn], opp: lực đội bạn, time, title, names: [đội mình, đội bạn], cheer: [{look,outfit,x,y,dir}], hide }
 * ============================================================ */
async function tugMatch(o) {
  const cx = o.cx, cy = o.cy, gap = 13, actors = [], mine = ['me'], theirs = [], base = [];
  o.L.forEach((a, i) => { mine.push(actors.length); base.push(cx - 22 - (i + 1) * gap); actors.push({ look: a.look, outfit: a.outfit, x: cx - 22 - (i + 1) * gap, y: cy + (i % 2 ? 2 : -1), dir: 2 }); });
  o.R.forEach((a, i) => { theirs.push(actors.length); base.push(cx + 22 + i * gap); actors.push({ look: a.look, outfit: a.outfit, x: cx + 22 + i * gap, y: cy + (i % 2 ? -1 : 2), dir: 1 }); });
  const iCheer = actors.length; for (const c of o.cheer || []) actors.push(Object.assign({ walk: -1 }, c));
  const st = { p: 0, pulse: 0, them: 0 };
  const prop = () => {
    const y = cy - 11, x0 = cx - 22 - o.L.length * gap - 10 + st.p, x1 = cx + 22 + (o.R.length - 1) * gap + 10 + st.p;
    wRect('#fffaf0', cx - 17, cy - 9, 1, 14); wRect('#fffaf0', cx + 16, cy - 9, 1, 14); for (let yy = cy - 9; yy < cy + 5; yy += 3) wRect('rgba(255,255,255,0.6)', cx, yy, 1, 1.5);
    for (let x = x0; x < x1; x++) wRect('#c9a467', x, y + Math.sin((x - x0) / 6) * 0.4, 1, 1.4);
    wRect('#e2574c', cx + st.p - 1, y - 3, 2, 7); wRect('#b23b3b', cx + st.p - 1, y + 3, 2, 1);
  };
  let result = null;
  await playCut({ map: o.map, me: [cx - 22, cy, 2], cam: { x: cx, y: cy - 16 }, title: o.title, actors, props: [prop], hide: o.hide || ['hk'],
    steps: [{ say: [iCheer, o.intro || 'Hai đội vào vị trí… cầm chắc dây!'] }, { live: async sc => {
      let t = 0, rate = 0, presses = [], ci = 0, cT = 0;
      const press = () => { if (result !== null || t < 1.5) return; presses.push(t); st.pulse = 1; };
      arenaOpen(k => { if (k === ' ' || k === 'enter' || k === 'e' || k === 'j' || k === 'k') press(); }, press, 'KÉO!');
      await liveLoop(sc, dt => {
        t += dt;
        if (UI._mgBot && Math.random() < dt * (o.botRate || 7.2)) press();
        presses = presses.filter(x => t - x < 1); rate += (presses.length - rate) * Math.min(1, dt * 5);
        const go = t >= 1.5 ? 1 : 0, our = (rate / 6) * hkBonus(), their = o.opp * (1 + 0.14 * Math.sin(t * 2.3 + 1) + 0.07 * Math.sin(t * 5.3));
        st.p = clamp(st.p + go * (their - our) * 12 * dt, -17, 17); st.pulse = Math.max(0, st.pulse - dt * 6); st.them = (st.them + dt * their * 6) % 1;
        // cả hai đội dịch theo dây; người đội mình rướn người mỗi lần bấm, chân bước theo khi dây trôi
        const moving = Math.abs(their - our) > 0.05 && go;
        mine.forEach((i, n) => { const j = i === 'me' ? null : sc.actors[i], bx = (i === 'me' ? cx - 22 : base[i]) + st.p - st.pulse * 1.5; if (i === 'me') { G.x = bx; G.dir = 2; } else { j.x = bx; j.walk = moving ? (j.walk >= 0 ? j.walk : 0) + dt : -1; j.oy = n % 2 ? -st.pulse : 0; } });
        theirs.forEach(i => { const j = sc.actors[i]; j.x = base[i] + st.p + Math.sin(st.them * 6.283) * 0.8; j.walk = moving ? (j.walk >= 0 ? j.walk : 0) + dt : -1; });
        cT -= dt; if (o.cheer && o.cheer.length && cT <= 0 && t > 1.5) { cT = 2.4; const c = sc.actors[iCheer + (ci++ % o.cheer.length)]; sc.bubble = { x: c.x, y: c.y - 27, text: (o.cheerLines || HK_CHEER.map(x => x.replace('10A1', o.names[0])))[ci % (o.cheerLines || HK_CHEER).length] }; }
        if (t < 1.5) sc.bubble = { x: cx, y: cy - 34, text: t < 0.5 ? 'Chuẩn bị…' : t < 1 ? 'Một, hai…' : 'KÉO!!!' };
        else if (t < 1.7 && sc.bubble && sc.bubble.text === 'KÉO!!!') sc.bubble = null;
        const left = Math.max(0, o.time - t + 1.5);
        arenaText(`<b>${o.title}</b><div class="sc">${o.names[0]} <i>vs</i> ${o.names[1]}</div><div class="bar"><span style="width:${Math.round(clamp(rate / 9, 0, 1) * 100)}%"></span></div><small>${t < 1.5 ? 'Chuẩn bị…' : 'Bấm SPACE thật nhanh để kéo!'} · còn ${Math.ceil(left)} giây</small>`);
        if (st.p <= -16) result = true; else if (st.p >= 16) result = false; else if (t >= o.time + 1.5) result = st.p <= 0;
        return result !== null;
      });
      arenaClose(); sc.bubble = null;
      // thắng: đội bạn chúi về phía mình · thua: đội mình bị kéo qua vạch
      const k = result ? -1 : 1;
      await runStep({ par: (result ? theirs : mine.filter(i => i !== 'me')).map(i => ({ move: [i, sc.actors[i].x + k * 8, null, 300, 0, true] })).concat(result ? [] : [{ move: ['me', G.x + 8, null, 300, 0, true] }]) }, {});
      await hkAfter(sc, result, mine, theirs, o.winLine || 'Thắng rồi!!! Kéo được rồi!', o.loseLine || 'Tiếc quá… đội bạn khoẻ quá!', o.cheer && o.cheer.length ? iCheer : undefined);
    } }] });
  return { win: !!result, sa: result ? 1 : 0, sb: result ? 0 : 1 };
}
function hkTugRound(opp, round) {
  const [cx, cy] = HK_SPOT.keoco, S = HK_SPORTS.keoco;
  return tugMatch({ map: 'school', cx, cy, L: S.team.map(hkMate), R: hkOpp(opp, 6, round), opp: [0.95, 1.15, 1.35][round], time: 25,
    title: `Kéo co · ${hkRound(round)}`, names: [hkName('a1'), hkName(opp)], intro: `Kéo co ${hkRound(round)}: ${hkName('a1')} gặp ${hkName(opp)}! Hai đội cầm chắc dây!`,
    cheer: [{ look: TEACHERS.manh.look, x: cx, y: cy - 28, dir: 0 }, { look: 'teacherA', x: cx - 70, y: cy + 26, dir: 3 }] });
}
// Kéo co ở hội Trung thu: đội Hoa Phượng (mình, bạn thân, bố, các bạn nhỏ) đấu đội Bờ Sông
async function ttTug(fid, fam) {
  const [kx, ky] = TT_SPOTS.keoco, L = [];
  if (fid) L.push({ look: fid, outfit: friendOutfit(fid) });
  if (fam) L.push({ look: 'dad', outfit: 'dadhome' });
  for (const [look, of] of [['c1', 'cas_dat'], ['c3', 'cas_khoa'], ['c6', 'cas_vy']]) if (L.length < 4) L.push({ look, outfit: of });
  const R = [['c5', 'cas_khoa'], ['c7', 'cas_dat'], ['c2', 'cas_ngan'], ['c8', 'cas_vy'], ['x1', 'cas_dat']].map(([look, outfit]) => ({ look, outfit }));
  return tugMatch({ map: 'pho', cx: kx, cy: ky + 4, L, R, opp: 1.1, time: 20, title: 'Kéo co hội Trung thu', names: ['Đội Hoa Phượng', 'Đội Bờ Sông'], hide: ['tt_mom', 'tt_dad'].concat(Object.keys(FRIENDS).map(f => 'tt_' + f), TT_KIDS.map((_, i) => 'ttk_' + i)),
    intro: 'Đội Hoa Phượng gặp đội Bờ Sông! Chuẩn bị nào!', cheer: [{ look: 'c5', outfit: 'cas_khoa', x: kx, y: ky - 26, dir: 0 }], cheerLines: ['Cố lên đội Hoa Phượng!', 'Kéo mạnh lên nào!', 'Một, hai, ba… kéo!', 'Sắp thắng rồi kìa!'],
    winLine: 'Đội Hoa Phượng thắng rồi!!!', loseLine: 'Đội Bờ Sông khoẻ ghê…' });
}

/* ============================================================
 *  CƯỚP CỜ — hai đội đứng hai hàng dọc đối diện, mỗi người một số, lá cờ cắm ở giữa
 *  Trọng tài gọi số nào thì hai bạn số đó chạy ra: cướp được cờ mang về hàng mình là được 1 điểm; đang cầm cờ mà bị đối phương
 *  chạm vào thì đối phương được điểm. Chỉ khi gọi đúng số của mình mới được chạy (W A S D / phím mũi tên / cần điều khiển).
 *  Chạy ra sai lượt, hoặc trọng tài hô "về" mà không chạy về vạch kịp: phạm quy — 3 lần phạm quy thì đội bạn được 1 điểm.
 *  Mỗi trận tối đa 5 lượt điểm: đội nào được 3 điểm trước thắng. Các bạn khác chạy theo máy.
 * ============================================================ */
async function hkFlagRound(opp, round) {
  const [cx, cy] = HK_SPOT.cuopco, XL = cx - 64, XR = cx + 64, Y = i => cy - 32 + i * 16, S = HK_SPORTS.cuopco;
  const myNo = 1 + Math.floor(Math.random() * 5), team = S.team.map(hkMate), opps = hkOpp(opp, 5, round + 2);
  const actors = [], ours = {}, thrs = {};                         // số áo → chỉ số actor ('me' cho mình)
  let ti = 0;
  for (let n = 1; n <= 5; n++) { if (n === myNo) { ours[n] = 'me'; continue; } const a = team[ti++]; ours[n] = actors.length; actors.push({ look: a.look, outfit: a.outfit, x: XL, y: Y(n - 1), dir: 2 }); }
  for (let n = 1; n <= 5; n++) { thrs[n] = actors.length; actors.push({ look: opps[n - 1].look, outfit: null, x: XR, y: Y(5 - n), dir: 1 }); }   // đội bạn đánh số ngược chiều
  const iRef = actors.length; actors.push({ look: TEACHERS.quan.look, x: cx, y: cy + 44, dir: 3 });
  const home = (side, n) => (side === 'L' ? [XL, Y(n - 1)] : [XR, Y(5 - n)]);
  const st = { flag: [cx, cy - 2], holder: null, sa: 0, sb: 0, fouls: 0, msg: '', num: 0 };
  const sp = [44, 50, 57][round], react = [0.6, 0.45, 0.3][round], meV = 58 * hkBonus();
  const prop = now => {
    wRect('#fffaf0', XL + 6, cy - 40, 1, 78); wRect('#fffaf0', XR - 7, cy - 40, 1, 78);
    const [fx, fy] = st.flag; if (!st.holder) drawSpr(SPR.hkflagstand, fx - 7, fy - 22); else { wRect('#8a5a3a', fx + 3, fy - 30, 1, 12); wRect('#e2574c', fx + 4, fy - 30, 6, 4); }
    const sc = RT.scene; if (!sc) return;
    for (let n = 1; n <= 5; n++) {
      const a = ours[n] === 'me' ? G : sc.actors[ours[n]], b = sc.actors[thrs[n]], hot = st.num === n;
      wText(String(n), a.x, a.y - 7, 4.6, ours[n] === 'me' ? '#ffd23a' : hot ? '#ffe9a0' : '#fffaf0', '#2a2136');      // số in trên áo
      wText(String(n), b.x, b.y - 7, 4.6, hot ? '#ffe9a0' : '#ffc0b8', '#2a2136');
    }
  };
  let win = false;
  await playCut({ map: 'school', me: [XL, Y(myNo - 1), 2], cam: { x: cx, y: cy - 6 }, title: `Cướp cờ · ${hkRound(round)}`, actors, props: [prop], hide: ['hk'],
    steps: [{ say: [iRef, `Cướp cờ ${hkRound(round)}: ${hkName('a1')} gặp ${hkName(opp)}! Nhớ số của mình nhé!`] }, { say: ['me', `Mình là số ${myNo}!`] }, { live: async sc => {
      arenaOpen(() => {}, null);
      const R = sc.actors[iRef], say = (txt, ms) => { sc.bubble = { x: R.x, y: R.y - 27, text: txt }; st.bubT = (ms || 1400) / 1000; };
      const hud = () => arenaText(`<b>Cướp cờ · ${hkRound(round)}</b><div class="sc">${hkName('a1')} <i>${st.sa} – ${st.sb}</i> ${hkName(opp)}</div><small>Số của bạn: <b>${myNo}</b> · Phạm quy: ${st.fouls}/3</small><small>${st.msg || 'Chờ trọng tài gọi đúng số của mình rồi mới chạy (W A S D)'}</small>`);
      const keysMove = () => { let vx = 0, vy = 0; if (KEYS.a || KEYS.arrowleft) vx--; if (KEYS.d || KEYS.arrowright) vx++; if (KEYS.w || KEYS.arrowup) vy--; if (KEYS.s || KEYS.arrowdown) vy++; if (JOY.id !== null && Math.hypot(JOY.dx, JOY.dy) > 12) { vx = JOY.dx; vy = JOY.dy; } const l = Math.hypot(vx, vy); return l ? [vx / l, vy / l] : [0, 0]; };
      const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
      const moveTo = (a, tx, ty, v, dt) => { const dx = tx - a.x, dy = ty - a.y, l = Math.hypot(dx, dy); if (l < 0.5) return true; const k = Math.min(1, v * dt / l); a.x += dx * k; a.y += dy * k; if (a !== G) { a.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0); a.walk = (a.walk >= 0 ? a.walk : 0) + dt; } else G.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0); return l <= v * dt; };
      const reset = () => { st.flag = [cx, cy - 2]; st.holder = null; for (let n = 1; n <= 5; n++) { const [ax, ay] = home('L', n), [bx, by] = home('R', n); if (ours[n] === 'me') { G.x = ax; G.y = ay; G.dir = 2; } else Object.assign(sc.actors[ours[n]], { x: ax, y: ay, dir: 2, walk: -1 }); Object.assign(sc.actors[thrs[n]], { x: bx, y: by, dir: 1, walk: -1 }); } };
      const point = (us, why) => { if (us) st.sa++; else st.sb++; st.msg = why; st.ph = 'point'; st.t = 0; say(why, 1600); };
      const foul = why => { if (!st.foulNow) st.foulNow = why; };           // dừng lại diễn cảnh phạm quy (bên dưới)
      // mỗi lượt chỉ gọi MỘT số: chỉ khi có đội ăn điểm mới gọi số mới; bị hô "về" hoặc lâu quá thì gọi lại đúng số đó
      const call = () => {
        reset();
        if (st.fresh || !st.num) { const w = [1, 2, 3, 4, 5].map(n => (n === myNo ? 3 : 1)), tot = w.reduce((a, b) => a + b, 0); let r = Math.random() * tot, n = 1; for (; n <= 5; n++) { r -= w[n - 1]; if (r <= 0) break; } st.num = Math.min(5, n); st.backDone = false; }
        st.fresh = false; st.ph = 'run'; st.t = 0;
        st.back = st.num === myNo && !st.backDone && Math.random() < 0.25 ? 0.7 + Math.random() * 0.8 : -1;
        st.aiD = react * (0.8 + Math.random() * 0.5); st.ours = 44 + Math.random() * 16; st.thr = sp - 4 + Math.random() * 10;
        st.msg = st.num === myNo ? 'Gọi số của bạn — CHẠY ra cướp cờ!' : `Số ${st.num} đang thi — đứng yên trong hàng!`; say(`Số ${st.num}!`, 1000);
      };
      // cảnh phạm quy: trọng tài thổi còi, đi tới nhắc, mình xin lỗi rồi về vạch. 3 lần phạm quy: lớp mình bị trừ 1 điểm, trận đấu vẫn tiếp tục
      const foulScene = async why => {
        const rx = R.x, ry = R.y, [hx, hy] = home('L', myNo);
        sc.bubble = null; arenaText(`<b>Cướp cờ · ${hkRound(round)}</b><div class="sc">${hkName('a1')} <i>${st.sa} – ${st.sb}</i> ${hkName(opp)}</div><small>Phạm quy!</small>`);
        await runStep({ say: [iRef, 'Tuýt! Tuýt! Dừng lại!'] }, {});
        await runStep({ move: [iRef, clamp(G.x + 18, XL + 10, XR - 10), G.y + 2, 500] }, {});
        R.dir = 1; G.dir = 2;
        await runStep({ say: [iRef, `Phạm quy! ${why}`] }, {});
        await runStep({ par: [{ hop: 'me' }, { say: ['me', pick(['Em xin lỗi thầy ạ…', 'Chết, em lỡ chân…', 'Em không cố ý đâu ạ…'])] }] }, {});
        st.fouls++;
        if (st.fouls >= 3) { st.fouls = 0; st.sa -= 1; st.msg = `Phạm quy 3 lần — ${hkName('a1')} bị trừ 1 điểm`; await runStep({ say: [iRef, `Phạm quy 3 lần rồi! ${hkName('a1')} bị trừ 1 điểm!`] }, {}); }
        else { st.msg = `Phạm quy lần ${st.fouls}/3`; await runStep({ say: [iRef, `Phạm quy lần ${st.fouls}. Đủ 3 lần là bị trừ 1 điểm đấy!`] }, {}); }
        await runStep({ par: [{ move: ['me', hx, hy, 500] }, { move: [iRef, rx, ry, 500] }] }, {});
        R.dir = 3; G.dir = 2; for (const k in KEYS) KEYS[k] = false;
        st.ph = 'wait'; st.t = 0;                                              // chơi tiếp lượt đang dở: gọi lại đúng số đó
      };
      const tick = dt => {
        st.t += dt; if (st.bubT !== undefined) { st.bubT -= dt; if (st.bubT <= 0) { sc.bubble = null; st.bubT = undefined; } }
        let meMove = false;
        const [mx, my] = UI._mgBot ? [0, 0] : keysMove(), mine = st.num === myNo && st.ph === 'run';
        const home0 = home('L', myNo);
        // mình: được chạy khi đúng số; sai lượt mà rời hàng là phạm quy
        if (st.ph !== 'point' && st.ph !== 'over') {
          if (mx || my) { G.x = clamp(G.x + mx * meV * dt, XL - 6, XR + 6); G.y = clamp(G.y + my * meV * dt, cy - 44, cy + 38); G.dir = Math.abs(mx) > Math.abs(my) ? (mx < 0 ? 1 : 2) : (my < 0 ? 3 : 0); meMove = true; }
          if (!mine && st.ph !== 'back' && Math.hypot(G.x - home0[0], G.y - home0[1]) > 5) foul(`Số ${myNo} chưa được gọi mà đã chạy ra!`);
        }
        if (st.foulNow) return true;
        if (st.ph === 'wait') { if (st.t > 0.8) call(); }
        else if (st.ph === 'point') { if (st.t > 1.8) { if (st.sa >= 3 || st.sb >= 3) { st.ph = 'over'; return true; } st.ph = 'wait'; st.t = 0; st.fresh = true; reset(); } }
        else if (st.ph === 'back') {
          // trọng tài hô "về": hai bạn phải chạy về vạch xuất phát rồi trọng tài gọi lại đúng số đó
          const b = sc.actors[thrs[st.num]], [bx, by] = home('R', st.num); moveTo(b, bx, by, st.thr, dt);
          if (UI._mgBot) moveTo(G, home0[0], home0[1], meV, dt);
          if (st.t > 2.5) { st.backDone = true; if (G.x > XL + 4) { foul(`Số ${myNo} không chạy về vạch!`); return true; } st.ph = 'wait'; st.t = 0; reset(); }
        }
        else if (st.ph === 'run') {
          const n = st.num, b = sc.actors[thrs[n]], A = ours[n] === 'me' ? G : sc.actors[ours[n]], f = { x: st.flag[0], y: st.flag[1] };
          if (st.back > 0 && st.t > st.back && !st.holder) { st.ph = 'back'; st.t = 0; st.msg = `Trọng tài hô "Số ${n} về!" — chạy về vạch ngay!`; say(`Số ${n} về!`, 1200); return meMove ? 1 : 0; }
          // người của đội mình (máy hoặc chế độ tự chơi)
          if (A !== G || UI._mgBot) {
            if (!st.holder) { if (moveTo(A, f.x - 3, f.y, A === G ? meV * 0.9 : st.ours, dt)) st.holder = 'L'; }
            else if (st.holder === 'L') { const [hx, hy] = home('L', n); moveTo(A, hx - 2, hy, (A === G ? meV * 0.9 : st.ours) * 0.95, dt); }
            else if (st.holder === 'R') moveTo(A, b.x, b.y, (A === G ? meV : st.ours) * 1.02, dt);
          } else if (!st.holder && Math.hypot(G.x - f.x, G.y - f.y) < 6) st.holder = 'L';
          // đối thủ: phản xạ chậm một nhịp, chạy ra cờ; nếu mình đã sát cờ thì đứng rình để chạm
          if (st.t > st.aiD) {
            if (!st.holder) { const close = dist(A, f) < dist(b, f) - 6 && dist(b, f) < 24; if (close) moveTo(b, f.x + 12, f.y, st.thr * 0.6, dt); else if (moveTo(b, f.x + 3, f.y, st.thr, dt)) st.holder = 'R'; }
            else if (st.holder === 'R') { const [hx, hy] = home('R', n); moveTo(b, hx + 2, hy, st.thr * 0.95, dt); }
            else moveTo(b, A.x, A.y, st.thr, dt);
          }
          if (st.holder === 'L') st.flag = [A.x, A.y]; else if (st.holder === 'R') st.flag = [b.x, b.y];
          const tag = dist(A, b) < 8;
          if (st.holder === 'L' && tag) point(false, `${hkName(opp)} chạm được người cầm cờ!`);
          else if (st.holder === 'R' && tag) point(true, `${hkName('a1')} chạm được người cầm cờ!`);
          else if (st.holder === 'L' && A.x <= XL + 2) point(true, `${hkName('a1')} mang cờ về hàng!`);
          else if (st.holder === 'R' && b.x >= XR - 2) point(false, `${hkName(opp)} mang cờ về hàng!`);
          else if (st.t > 12) { st.ph = 'wait'; st.t = 0; say(`Lâu quá! Về vạch, gọi lại số ${n}!`, 1000); }
        }
        hud();
        return meMove ? 1 : 0;                                                // (true là tín hiệu xong trận — đi lại thì trả về 1)
      };
      st.ph = 'wait'; st.t = 0; st.fresh = true; reset();
      for (;;) {
        st.foulNow = null;
        await liveLoop(sc, tick);
        if (st.foulNow) { await foulScene(st.foulNow); continue; }
        break;
      }
      arenaClose();
      win = st.sa > st.sb; st.num = 0;
      const mine = Object.values(ours), theirs = Object.values(thrs);
      await hkAfter(sc, win, mine, theirs, 'Thắng rồi! Cờ là của lớp mình!', 'Tiếc quá, đội bạn nhanh hơn…', iRef);
    } }] });
  return { win, sa: st.sa, sb: st.sb };
}

/* ============================================================
 *  TUNG CÒN — mỗi lớp một hàng đứng cạnh nhau, trước mặt là cột còn có vòng tròn trên đỉnh
 *  Nhấn giữ chuột (hoặc chạm) rồi kéo để vẽ hướng + lực ném (hiện đường bay dự kiến), thả ra để tung.
 *  Gió đổi hướng mỗi vài giây, đẩy quả còn bay lệch · ngày may mắn thì vòng "rộng" hơn · các bạn khác ném theo máy.
 *  Hết giờ, lớp nào tung lọt vòng nhiều hơn thì thắng (bằng nhau thì hoà).
 * ============================================================ */
async function hkConRound(opp, round) {
  const S = HK_SPORTS.tungcon, [PA, PB] = HK_POLES, RY = 192, GY = 316, T = 40, g = 150;
  const team = S.team.map(hkMate), opps = hkOpp(opp, 4, round + 1), actors = [], ours = ['me'], theirs = [];
  [136, 150, 180].forEach((x, i) => { ours.push(actors.length); actors.push({ look: team[i].look, outfit: null, x, y: GY + (i % 2 ? 2 : 0), dir: 3 }); });
  [206, 220, 244, 258].forEach((x, i) => { theirs.push(actors.length); actors.push({ look: opps[i].look, outfit: null, x, y: GY + (i % 2 ? 0 : 2), dir: 3 }); });
  const iRef = actors.length; actors.push({ look: TEACHERS.lan.look, x: 112, y: 300, dir: 2 });
  const st = { cons: [], sa: 0, sb: 0, wind: 0, aim: null, ready: true, cd: 0, pops: [] };
  const rr = 4.6 + 1.5 * luckK();                                   // ngày may mắn: còn dễ lọt vòng hơn
  const prop = now => {
    hkPole(PA, now, st.wind); hkPole(PB, now, st.wind);
    wRect('#fffaf0', 126, GY - 8, 146, 1);
    wText(hkName('a1'), PA, 280, 4.6, '#fffaf0', '#2a2136'); wText(hkName(opp), PB, 280, 4.6, '#fffaf0', '#2a2136');
    for (const c of st.cons) { const l = Math.hypot(c.vx, c.vy) || 1, ux = -c.vx / l, uy = -c.vy / l; ['#e2574c', '#ffd23a', '#3f8f3a'].forEach((col, i) => { for (let k = 1; k < 6; k++) wRect(col, c.x + ux * k * 1.6 + (i - 1) * uy * 1.2, c.y + uy * k * 1.6 - (i - 1) * ux * 1.2, 1, 1); }); wRect('#c8312b', c.x - 1.5, c.y - 1.5, 3, 3); wRect('#ffd23a', c.x - 0.5, c.y - 1.5, 1, 1); }
    if (st.ready && !st.aim) { wRect('#c8312b', G.x + 4, G.y - 15, 3, 3); }
    if (st.aim) { const [vx, vy] = st.aim.v; for (let k = 1; k <= 9; k++) { const t = k * 0.05, x = G.x + 3 + vx * t, y = G.y - 16 + vy * t + 0.5 * g * t * t; wRect('rgba(255,255,255,0.85)', x - 0.5, y - 0.5, 1.5, 1.5); } }
    for (const q of st.pops) { const k = q.t / 0.6; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; wRect(['#ffd23a', '#fffaf0', '#e2574c'][i % 3], q.x + Math.cos(a) * k * 10, q.y + Math.sin(a) * k * 10, 1.5, 1.5); } }
  };
  const throwAt = (who, x0, y0, side, success) => {
    const P = side === 'L' ? PA : PB, off = success ? 0 : (Math.random() < 0.5 ? -1 : 1) * (8 + Math.random() * 8), dy = success ? 0 : (Math.random() - 0.5) * 6, Tt = 0.85 + Math.random() * 0.2;
    const tx = P + off, ty = RY + dy; st.cons.push({ x: x0, y: y0, vx: (tx - x0) / Tt, vy: (ty - y0) / Tt - 0.5 * g * Tt, side, ai: true, done: false });
    if (who !== null) who.oy = -3;
  };
  let res = null;
  await playCut({ map: 'school', me: [164, GY, 3], cam: { x: 196, y: 230 }, title: `Tung còn · ${hkRound(round)}`, actors, props: [prop], hide: ['hk'],
    steps: [{ say: [iRef, `Tung còn ${hkRound(round)}: ${hkName('a1')} gặp ${hkName(opp)}! Mỗi quả lọt vòng được 1 điểm!`] }, { live: async sc => {
      let t = 0, windT = 0, limit = T;                                       // limit: hết giờ (cộng thêm hiệp phụ khi hoà)
      const ai = actors.map(() => 1 + Math.random() * 2.5), over = () => t >= limit + 1.5;
      const toW = e => [(e.clientX * VIEW.dpr - VIEW.ox) / VIEW.S, (e.clientY * VIEW.dpr - VIEW.oy) / VIEW.S];
      const pd = e => { if (UI.isOpen() || t < 1.5 || res || over()) return; e.preventDefault(); e.stopPropagation(); if (!st.ready) return; const [x, y] = toW(e); st.aim = { s: [x, y], v: [0, 0] }; };
      const pm = e => { if (!st.aim) return; e.preventDefault(); const [x, y] = toW(e); let vx = (x - st.aim.s[0]) * 4.2, vy = (y - st.aim.s[1]) * 4.2; const l = Math.hypot(vx, vy); if (l > 270) { vx *= 270 / l; vy *= 270 / l; } st.aim.v = [vx, vy]; };
      const pu = e => { if (!st.aim) return; e.preventDefault(); const [vx, vy] = st.aim.v; st.aim = null; if (Math.hypot(vx, vy) < 30 || !st.ready || over()) return; st.cons.push({ x: G.x + 3, y: G.y - 16, vx, vy, side: 'L', me: true, done: false }); st.ready = false; st.cd = 0.9; sc.meOy = -3; };
      cv.addEventListener('pointerdown', pd, true); window.addEventListener('pointermove', pm, true); window.addEventListener('pointerup', pu, true);
      arenaOpen(() => {}, null);
      try {
        await liveLoop(sc, dt => {
          t += dt; windT -= dt;
          if (windT <= 0) { windT = 6 + Math.random() * 3; st.wind = Math.round((Math.random() * 2 - 1) * 10) / 10; }
          if (over()) st.aim = null;
          if (t >= 1.5 && !over()) {
            // các bạn khác ném theo máy
            actors.forEach((a, i) => { if (i === iRef) return; ai[i] -= dt; a.oy = Math.min(0, (a.oy || 0) + dt * 20); if (ai[i] <= 0) { ai[i] = 2.6 + Math.random() * 1.4; const side = ours.includes(i) ? 'L' : 'R'; throwAt(a, a.x + 3, a.y - 16, side, Math.random() < (side === 'L' ? 0.3 : [0.25, 0.32, 0.4][round])); } });
            if (UI._mgBot && st.ready) { st.ready = false; st.cd = 1.6; throwAt(null, G.x + 3, G.y - 16, 'L', Math.random() < 0.45); st.cons[st.cons.length - 1].me = true; }
          }
          if (!st.ready) { st.cd -= dt; if (st.cd <= 0) st.ready = true; }
          sc.meOy = Math.min(0, (sc.meOy || 0) + dt * 20);
          for (const c of st.cons) {
            if (c.me && !c.ai) c.vx += st.wind * 26 * dt;                    // gió chỉ làm lệch quả của mình (các bạn khác đã căn gió sẵn)
            c.vy += g * dt; c.x += c.vx * dt; c.y += c.vy * dt;
            const P = c.side === 'L' ? PA : PB;
            if (!c.done && Math.hypot(c.x - P, c.y - RY) < (c.me && !c.ai ? rr : 5)) { c.done = true; if (c.side === 'L') st.sa++; else st.sb++; st.pops.push({ x: P, y: RY, t: 0 }); if (c.me) { sc.bubble = { x: G.x, y: G.y - 27, text: pick(['Lọt rồi!!!', 'Vào!', 'Đẹp quá!']) }; st.bubT = 0.9; } }
          }
          st.cons = st.cons.filter(c => c.y < GY + 14 && c.x > 90 && c.x < 300);
          st.pops = st.pops.filter(q => (q.t += dt) < 0.6);
          if (st.bubT !== undefined) { st.bubT -= dt; if (st.bubT <= 0) { sc.bubble = null; st.bubT = undefined; } }
          if (t < 1.5) sc.bubble = { x: 112, y: 273, text: t < 0.8 ? 'Chuẩn bị…' : 'Bắt đầu!' }; else if (t < 1.6) sc.bubble = null;
          const wtxt = st.wind === 0 ? 'lặng gió' : `${st.wind < 0 ? '←'.repeat(Math.ceil(Math.abs(st.wind) * 3)) : '→'.repeat(Math.ceil(Math.abs(st.wind) * 3))} ${Math.abs(st.wind) > 0.6 ? 'gió mạnh' : 'gió nhẹ'}`;
          arenaText(`<b>Tung còn · ${hkRound(round)}</b><div class="sc">${hkName('a1')} <i>${st.sa} – ${st.sb}</i> ${hkName(opp)}</div><small>⏱ ${over() ? 'HẾT GIỜ' : mmss(limit + 1.5 - t)}${st.ot ? ' (hiệp phụ)' : ''} · Gió: <b>${wtxt}</b>${luckK() > 0.2 ? ' · ngày may mắn ✨' : ''}</small><small>${over() ? 'Hết giờ — chờ các quả còn đang bay rơi xuống' : st.ready ? 'Nhấn giữ chuột, kéo theo hướng muốn ném rồi thả ra' : 'Đang lấy quả còn mới…'}</small>`);
          if (over() && !st.cons.length) {
            // hoà thì đá hiệp phụ 15 giây (thua là bị loại nên phải phân thắng thua)
            if (st.sa === st.sb && !st.ot) { st.ot = true; limit += 15; sc.bubble = { x: 112, y: 273, text: 'Hoà! Hiệp phụ 15 giây!' }; st.bubT = 1.6; return false; }
            res = true; return true;
          }
          return false;
        });
      } finally { cv.removeEventListener('pointerdown', pd, true); window.removeEventListener('pointermove', pm, true); window.removeEventListener('pointerup', pu, true); arenaClose(); }
      sc.bubble = null;
      // hết hiệp phụ vẫn hoà: bốc thăm (ngày may mắn dễ trúng hơn)
      if (st.sa === st.sb) { st.lot = Math.random() < 0.5 + 0.15 * luckK(); await runStep({ say: [iRef, `Vẫn hoà ${st.sa} – ${st.sb}! Bốc thăm chọn đội đi tiếp… ${st.lot ? hkName('a1') : hkName(opp)}!`] }, {}); }
      const win = st.sa > st.sb || (st.sa === st.sb && !!st.lot);
      await hkAfter(sc, win, ours, theirs, 'Thắng rồi! Còn bay vào vòng như có phép!', 'Tiếc quá, gió thổi lệch hết…', iRef);
    } }] });
  return { win: st.sa > st.sb || (st.sa === st.sb && !!st.lot), sa: st.sa, sb: st.sb };
}

/* ============================================================
 *  NHẢY BAO BỐ TIẾP SỨC — cả 4 lớp cùng một đường đua vòng quanh sân trường, mỗi lớp một làn
 *  Mỗi lớp 4 người đứng rải ở 4 chặng; nhảy tới chỗ bạn kế tiếp là đổi người. Mình điều khiển lần lượt cả 4 bạn
 *  trong đội lớp mình: bấm Space thật nhanh để nhảy (bấm càng nhanh nhảy càng xa). Về đích trước xếp trên.
 * ============================================================ */
const HK_LEN = (() => { let L = 0; for (let i = 0; i < HK_TRACK.length - 1; i++) L += Math.hypot(HK_TRACK[i + 1][0] - HK_TRACK[i][0], HK_TRACK[i + 1][1] - HK_TRACK[i][1]); return L; })();
function trackPos(P, i, k, o) {
  const [a, b] = P[i], [c, d] = P[i + 1], x = a + (c - a) * k, y = b + (d - b) * k;
  let nx = 0, ny = 0; if (a === c) nx = a < 351 ? -1 : 1; else ny = b < 285 ? -1 : 1;      // lệch ra phía ngoài vòng
  return { x: x + nx * o, y: y + ny * o, dir: a === c ? (d < b ? 3 : 0) : (c < a ? 1 : 2) };
}
function trackAt(s, o) {
  s = ((s % HK_LEN) + HK_LEN) % HK_LEN;
  for (let i = 0; i < HK_TRACK.length - 1; i++) { const [a, b] = HK_TRACK[i], [c, d] = HK_TRACK[i + 1], l = Math.hypot(c - a, d - b); if (s <= l) return trackPos(HK_TRACK, i, s / l, o); s -= l; }
  return trackPos(HK_TRACK, HK_TRACK.length - 2, 1, o);
}
async function hkRace() {
  const S = HK_SPORTS.baobo, ks = ['a1', 'a2', 'a3', 'a4'], leg = HK_LEN / 4, actors = [];
  // làn: lớp mình làn trong cùng; mỗi lớp 4 người ở 4 chặng (người đầu của lớp mình là chính mình)
  const R = ks.map((k, lane) => {
    const run = [];
    for (let j = 0; j < 4; j++) {
      if (k === 'a1' && j === 0) { run.push('me'); continue; }
      const look = k === 'a1' ? S.team[j - 1] : HK_CLASSES[k].looks[j], p = trackAt(j * leg, lane * 7);
      run.push(actors.length); actors.push({ look, outfit: null, x: p.x, y: p.y, dir: p.dir });
    }
    return { k, lane, run, j: 0, s: 0, v: 0, hop: 0, stun: 0, wait: 0, done: null, base: k === 'a1' ? 0 : [0, 41, 38, 35][lane] * (0.97 + Math.random() * 0.06) };
  });
  const iRef = actors.length; actors.push({ look: TEACHERS.tung.look, x: 262, y: 364, dir: 2 });
  const me = R[0], start = trackAt(0, 0);
  let t = 0, presses = [], rate = 0, fin = [];
  const ent = (r, j) => (r.run[j] === 'me' ? G : RT.scene.actors[r.run[j]]);
  const prop = now => {
    hkTrackLines(4);
    for (const r of R) for (let j = 0; j < 4; j++) {
      const e = ent(r, j), oy = e === G ? (RT.scene.meOy || 0) : (e.oy || 0);
      wRect('#a9703f', e.x - 6, e.y - 8 + oy, 12, 9); wRect('#c9a467', e.x - 6, e.y - 8 + oy, 12, 2); wRect('#8a5a3a', e.x - 5, e.y - 2 + oy, 10, 1); wRect(HK_CLASSES[r.k].col, e.x - 2, e.y - 5 + oy, 4, 3);
    }
    const a = ent(me, Math.min(3, me.j)); if (!me.done) wText('▼', a.x, a.y - 34 + Math.sin(now / 150), 5, '#ffd23a', '#2a2136');
  };
  await playCut({ map: 'school', me: [start.x, start.y, 3], cam: { x: start.x, y: start.y - 20 }, title: 'Nhảy bao bố tiếp sức', actors, props: [prop], hide: ['hk'],
    steps: [{ say: [iRef, 'Bốn lớp vào vạch xuất phát! Tới chỗ bạn kế tiếp là đổi người nhé!'] }, { live: async sc => {
      const press = () => { if (t >= 1.5 && !me.done) presses.push(t); };
      arenaOpen(k => { if (k === ' ' || k === 'enter' || k === 'e' || k === 'j' || k === 'k') press(); }, press, 'NHẢY!');
      await liveLoop(sc, dt => {
        t += dt;
        if (UI._mgBot && Math.random() < dt * 7) press();
        presses = presses.filter(x => t - x < 0.8); rate += (presses.length / 0.8 - rate) * Math.min(1, dt * 6);
        if (t < 1.5) sc.bubble = { x: 262, y: 337, text: t < 0.5 ? 'Vào vạch…' : t < 1 ? 'Chuẩn bị…' : 'Xuất phát!' }; else if (t < 1.6) sc.bubble = null;
        for (const r of R) {
          if (r.done !== null || t < 1.5) continue;
          if (r.wait > 0) { r.wait -= dt; continue; }
          if (r.stun > 0) { r.stun -= dt; continue; }
          const v = r.k === 'a1' ? Math.min(70, rate * 6.2 * hkBonus()) : r.base * (0.9 + 0.2 * Math.sin(t * 1.3 + r.lane));
          if (r.k !== 'a1' && Math.random() < dt * 0.06) { r.stun = 0.7; sc.actors[r.run[r.j]] && (sc.actors[r.run[r.j]].oy = 0); continue; }   // vấp ngã
          r.s += v * dt; r.hop += v * dt / 9;
          const end = (r.j + 1) * leg, e = ent(r, r.j), p = trackAt(Math.min(r.s, end), r.lane * 7), oy = v > 3 ? -Math.abs(Math.sin(r.hop * Math.PI)) * 5 : 0;
          e.x = p.x; e.y = p.y; if (e === G) { G.dir = p.dir; sc.meOy = oy; } else { e.dir = p.dir; e.oy = oy; }
          if (r.s >= end - 3) {
            if (e === G) sc.meOy = 0; else e.oy = 0;
            r.j++;
            if (r.j >= 4) { r.done = t; fin.push(r.k); if (r.k === 'a1') sc.bubble = { x: e.x, y: e.y - 27, text: fin.length === 1 ? 'Về nhất rồi!!!' : `Về đích thứ ${fin.length}!` }; }
            else { r.s = r.j * leg; r.wait = 0.35; }
          }
        }
        const cur = ent(me, Math.min(3, me.j)); sc.cam = { x: cur.x, y: cur.y - 20 };
        const who = me.j >= 4 ? 'về đích' : me.run[me.j] === 'me' ? 'bạn' : HK_MATES[S.team[me.j - 1]];
        arenaText(`<b>Nhảy bao bố tiếp sức</b><div class="sc">${R.map(r => `<span style="color:${HK_CLASSES[r.k].col}">${hkName(r.k)} ${r.done !== null ? '✓' : `${Math.min(4, r.j + 1)}/4`}</span>`).join(' · ')}</div><div class="bar"><span style="width:${Math.round(clamp(rate / 9, 0, 1) * 100)}%"></span></div><small>Đang điều khiển: <b>${who}</b> (chặng ${Math.min(4, me.j + 1)}/4) · bấm SPACE thật nhanh để nhảy!</small>`);
        if (me.done !== null && (fin.length === 4 || t > me.done + 2.5)) return true;
        if (t > 90) return true;
        return false;
      });
      arenaClose();
      // lớp chưa về đích: xếp theo quãng đường đã nhảy
      const rest = R.filter(r => r.done === null).sort((a, b) => b.s - a.s).map(r => r.k);
      fin = fin.concat(rest);
      const place = fin.indexOf('a1') + 1, mine = me.run.slice(), theirs = R.slice(1).flatMap(r => r.run);
      sc.cam = { x: 351, y: 290 };
      await hkAfter(sc, place === 1, mine, theirs, 'Về nhất rồi! Cả lớp giỏi quá!', place <= 3 ? `Về thứ ${place}, cũng có huy chương rồi!` : 'Về chót mất rồi… nhưng vui ghê!', iRef);
    } }] });
  hkFinish('baobo', fin, fin.indexOf('a1') === 0 ? 3 : fin.indexOf('a1') < 3 ? 1 : 0);
  const place = fin.indexOf('a1') + 1;
  await UI.ask('Kết quả nhảy bao bố', `<table class="hktab"><tr><th>#</th><th>Lớp</th></tr>${fin.map((k, i) => `<tr class="${k === 'a1' ? 'me' : ''}"><td>${i + 1}</td><td>${hkName(k)}</td></tr>`).join('')}</table><p>${place <= 3 ? `Lớp ${hkName('a1')} về <b>thứ ${place}</b> — huy chương ${['vàng', 'bạc', 'đồng'][place - 1]}!` : `Lớp ${hkName('a1')} về thứ ${place}.`}</p><p class="dim">${hkLeft().length ? `Còn ${hkLeft().length} môn: ${hkLeft().map(k => HK_SPORTS[k].name.toLowerCase()).join(', ')}.` : 'Xong cả 4 môn rồi — ra gặp thầy hiệu trưởng ở bục trao giải!'}</p>`, ['OK']);
}

/* ============================================================
 *  LỄ TRAO GIẢI: thầy hiệu trưởng (chỉ khi lớp mình đã thi xong cả 4 môn) → huy chương từng môn trên bục →
 *  bảng tổng sắp → cúp tập thể → cả lớp chụp ảnh (người thi đấu hàng trước đeo huy chương, còn lại + cô chủ nhiệm hàng sau) → 17:00
 * ============================================================ */
ACT.hkPrincipal = async () => {
  if (RT.lock) return;
  meetSoc('hieutruong');
  const who = { look: 'principal' }, left = hkLeft();
  if (left.length) return UI.ask('Thầy hiệu trưởng', `<p>“Lớp ${hkName('a1')} còn chưa thi môn <b>${left.map(k => HK_SPORTS[k].name.toLowerCase()).join(', ')}</b> đấy em! Thi xong cả 4 môn rồi quay lại đây dự lễ trao giải nhé.”</p><p class="dim">Gặp trọng tài ở khu thi từng môn (biển đỏ trên sân).</p>`, ['Dạ, em đi thi ngay!'], { who });
  const c = await UI.ask('Thầy hiệu trưởng', `<p>“Các lớp đã thi xong cả 4 môn rồi. Bắt đầu <b>lễ trao giải</b> nhé? Sau lễ trao giải là chụp ảnh lưu niệm, rồi các em được về.”</p>`, ['Bắt đầu lễ trao giải!', 'Em đi chơi thêm chút đã'], { who });
  if (c === 0) await hkCeremony();
};
async function hkCeremony() {
  RT.lock = true;
  const H = hkY(), [px, py] = HK_SPOT.podium, top = [[px + 33, py + 6], [px + 11, py + 14], [px + 55, py + 20]];   // chỗ đứng trên bục: nhất, nhì, ba
  const reps = { a1: 'me' }, actors = [];
  for (const k of ['a2', 'a3', 'a4']) { reps[k] = actors.length; actors.push({ look: HK_CLASSES[k].looks[0], x: 250 + actors.length * 18, y: 252, dir: 3 }); }
  const iP = actors.length; actors.push({ look: 'principal', x: px + 84, y: py + 30, dir: 1 });          // đứng cạnh bục, không che
  const crowd = [];
  ['khoa', 'vy', 'dat', 'ngan', 'c1', 'c3', 'c4', 'c5', 'c2', 'c6'].forEach((k, i) => { crowd.push(actors.length); actors.push({ look: k, x: px - 20 + (i % 5) * 26 + (i > 4 ? 13 : 0), y: py + 70 + (i > 4 ? 14 : 0), dir: 3 }); });
  const iH = actors.length; actors.push({ look: 'teacherA', x: px + 120, y: py + 62, dir: 1 });
  const st = { medals: {} }, M = hkMedals(), cup = M[0].k;
  const prop = () => { for (const k in st.medals) { const e = reps[k] === 'me' ? G : RT.scene.actors[reps[k]]; const c = medalCol(st.medals[k]); wRect('#3b82c4', e.x - 1, e.y - 9, 1, 2); wRect('#e2574c', e.x, e.y - 9, 1, 2); wRect(c, e.x - 1.5, e.y - 7, 3, 3); } if (st.cup) { const e = reps[st.cup] === 'me' ? G : RT.scene.actors[reps[st.cup]]; drawSpr(SPR.hkcup, e.x - 6, e.y - 40 + (Math.floor(performance.now() / 300) % 2)); } };
  const stand = async (order, line) => {
    const moves = [];
    order.slice(0, 3).forEach((k, i) => { moves.push({ move: [reps[k], top[i][0], top[i][1], 700] }); });
    await runStep({ say: [iP, line] }, {});
    await runStep({ par: moves }, {});
    order.slice(0, 3).forEach((k, i) => { st.medals[k] = i + 1; });
    await runStep({ par: order.slice(0, 3).map(k => ({ hop: reps[k] })).concat(order.indexOf('a1') < 3 ? crowd.slice(0, 5).map(i => ({ hop: i })) : []) }, {});
    await UI.wait(500);
    st.medals = {};
    await runStep({ par: order.slice(0, 3).map(k => ({ move: [reps[k], reps[k] === 'me' ? px + 33 : 250 + reps[k] * 18, reps[k] === 'me' ? py + 60 : 252, 500] })) }, {});
  };
  await playCut({ map: 'school', me: [px + 33, py + 60, 3], cam: { x: px + 33, y: py + 40 }, title: 'Lễ trao giải Hội khoẻ Phù Đổng', actors, props: [prop], hide: ['hk'],
    steps: [{ say: [iP, 'Hội khoẻ Phù Đổng năm nay các lớp đã thi đấu hết mình! Sau đây là lễ trao giải!'] },
      { live: async () => { for (const id of ['keoco', 'cuopco', 'tungcon', 'baobo']) { const o = H.sp[id].order; await stand(o, `Môn ${HK_SPORTS[id].name}: Nhất ${hkName(o[0])}, Nhì ${hkName(o[1])}, Ba ${hkName(o[2])}!`); } } },
      { live: async () => {
        const rows = M.map((r, i) => `<tr class="${r.k === 'a1' ? 'me' : ''}"><td>${i + 1}</td><td>${hkName(r.k)}</td><td>${r.g}</td><td>${r.s}</td><td>${r.b}</td></tr>`).join('');
        await UI.ask('Bảng tổng sắp huy chương', `<table class="hktab med"><tr><th>#</th><th>Lớp</th><th><i class="md g"></i>Vàng</th><th><i class="md s"></i>Bạc</th><th><i class="md b"></i>Đồng</th></tr>${rows}</table><p class="dim">Xếp như bảng tổng sắp Olympic: nhiều huy chương vàng hơn đứng trên; bằng nhau thì so huy chương bạc, rồi đồng.</p>`, ['Xem trao cúp']);
      } },
      { say: [iP, 'Và cúp tập thể Hội khoẻ Phù Đổng năm nay thuộc về…'] }, { wait: 700 },
      { say: [iP, `…lớp ${hkName(cup)}! Xin chúc mừng!`] },
      { move: [cup === 'a1' ? 'me' : reps[cup], top[0][0], top[0][1], 700] }, { fn: () => { st.cup = cup; } },
      { par: (cup === 'a1' ? crowd.map(i => ({ hop: i })).concat([{ hop: 'me' }, { say: ['me', 'Lớp mình vô địch rồi!!!'] }]) : [{ hop: reps[cup] }, { say: [iH, 'Lớp mình đã cố gắng lắm rồi, cô rất tự hào về các em!'] }]) },
      { wait: 600 }] });
  H.cup = cup;
  await hkPhoto(cup === 'a1');
  // xong hội: 17:00, ra về tự do
  await UI.fade(true);
  RT.hkFest = false; H.done = true; G.time = Math.max(G.time, HKPD.end);
  setMap('school', 352, 250, 0); RT.snapNpcs = true;
  addMemo('scene', 'hkpd'); addMemo('item', 'anhhkpd');
  if (cup === 'a1') { addMemo('badge', 'phudong'); for (const f in FRIENDS) addFriend(f, HKPD.cupFriend, true); for (const k in TEACHERS) addTeacher(HKPD.cupTeacher, k, true); }
  else for (const f in FRIENDS) addFriend(f, 2, true);
  await UI.fade(false);
  RT.lock = false; UI.hud();
  UI.toast(`Hội khoẻ Phù Đổng khép lại — cúp tập thể thuộc về lớp ${hkName(cup)}. 17:00 rồi, ra cổng về nhà được rồi. Ảnh lớp đã dán vào lưu bút.`, 'info');
}
// Ảnh lớp: hàng trước là các bạn đã thi đấu (đeo huy chương nếu có), hàng sau là các bạn không thi + cô chủ nhiệm
async function hkPhoto(cup) {
  const H = hkY(), [px, py] = HK_SPOT.podium, cx = px + 33, y1 = py + 52, y0 = py + 38;
  const played = new Set(); for (const id in HK_SPORTS) HK_SPORTS[id].team.forEach(k => played.add(k));
  const front = [...played], back = Object.keys(HK_MATES).filter(k => !played.has(k)).concat(['teacherA']);
  const medalsOf = k => Object.keys(HK_SPORTS).filter(id => (k === 'me' || HK_SPORTS[id].team.includes(k)) && H.sp[id].place <= 3).map(id => H.sp[id].place).sort();
  const actors = [], who = [];
  const fr = front.slice(0, Math.ceil(front.length / 2)).concat(['me'], front.slice(Math.ceil(front.length / 2)));
  fr.forEach((k, i) => { const x = cx + (i - (fr.length - 1) / 2) * 15; if (k === 'me') { who.push(['me', 'me']); return; } who.push([actors.length, k]); actors.push({ look: k, x, y: y1, dir: 0 }); });
  back.forEach((k, i) => { actors.push({ look: k, x: cx + (i - (back.length - 1) / 2) * 15, y: y0, dir: 0 }); });
  const meX = cx + (fr.indexOf('me') - (fr.length - 1) / 2) * 15, iCam = actors.length; actors.push({ look: 'c5', x: cx, y: py + 112, dir: 3 });
  const prop = () => {
    for (const [i, k] of who) { const e = i === 'me' ? G : RT.scene.actors[i], ms = medalsOf(k); ms.slice(0, 2).forEach((p, j) => { const x = e.x - 2 + j * 3 - (ms.length > 1 ? 1 : 0); wRect('#3b82c4', x, e.y - 9, 1, 2); wRect(medalCol(p), x - 0.5, e.y - 7, 2.5, 2.5); }); }
    if (cup) drawSpr(SPR.hkcup, G.x - 6, G.y - 41);
  };
  await playCut({ map: 'school', me: [meX, y1, 0], cam: { x: cx, y: py + 30 }, title: 'Ảnh lớp Hội khoẻ Phù Đổng', actors, props: [prop], hide: ['hk'],
    steps: [{ say: [iCam, 'Cả lớp đứng vào chụp ảnh nào! Ai thi đấu thì đứng hàng trước nhé!'] }, { say: [iCam, cup ? 'Giơ cúp lên cao nào! Một, hai, ba… Phù Đổng!' : 'Một, hai, ba… cười lên nào!'] }, { wait: 160 },
      { fn: sc => { snapPhoto('anhhkpd', cx, py + 26, 180); sc.glow = [flashGlow(performance.now())]; } }, { wait: 900 }] });
}
