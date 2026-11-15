'use strict';
/* ============================================================
 *  03b. CÁC PHÒNG & KHÔNG GIAN TRONG NHÀ
 *  Trong trường: Trạm y tế · Phòng nhạc · Thư viện · Phòng ngủ trưa · Khu vệ sinh (cửa nằm trên dãy nhà chính)
 *  Phố Hoa Phượng: bên trong TTTM (các gian hàng) · bên trong khu game · nhà bạn (phòng khách + phòng riêng)
 *  Đồ trang trí phòng ngủ ở nhà (mua ở TTTM)
 * ============================================================ */
// Cây ngoài trời đổi theo mùa (không đụng tới cây trang trí riêng ngày Tết)
const TREE_KINDS = ['tree', 'tree2', 'treeRed', 'treePink', 'treeOrange'];
const SEASON_TREES = [['au_sua', 'tree', 'au_sua', 'tree2'], ['wi_bang', 'wi_bang2', 'wi_bang', 'tree2'], ['sp_dao', 'sp_loc', 'sp_sua', 'sp_loc'], ['su_phuong', 'su_bang', 'su_phuong', 'su_bang']];
function seasonTrees() {
  for (const id in MAPS) for (const o of MAPS[id].objs) {
    if (!TREE_KINDS.includes(o.s) || o.dyn || o.vis === tetTime) continue;
    const k = (o.x * 7 + o.y * 13) % 4, base = o.s;
    o.dyn = () => (G ? (base === 'treeRed' && cal(G.day).season === 3 ? 'su_phuong' : SEASON_TREES[cal(G.day).season][k]) : base);
  }
}
// Thư viện (khu nhà riêng trong sân) · tầng 2 dãy nhà chính: hành lang + 4 lớp anh chị khoá trên
const LIB_HOUSE = [4, 236], LIB_DOOR = [64, 330];
const TANG2 = { stair: 224, rooms: [['l11a1', '11A1', 40, ['sC', 'sG', 'sE', 'sH', 'sA', 'sF']], ['l11a3', '11A3', 130, ['sD', 'sH', 'sG', 'sF', 'sE', 'sC']], ['l12a1', '12A1', 300, ['sA', 'sE', 'sF', 'sG', 'sH', 'sB']], ['l12a2', '12A2', 390, ['sB', 'sF', 'sE', 'sH', 'sA', 'sD']]] };
const SENIOR_OF = { l11a1: 'a_phong', l11a3: 'c_thao', l12a1: 'a_hung', l12a2: 'c_mai' };
const SENIOR_TALK = ['Năm cuối rồi, ôn thi đại học muốn xỉu luôn em ạ.', 'Em lớp 10 hả? Có bài gì khó cứ lên đây hỏi anh chị.', 'Đề cương ôn thi dày như cuốn từ điển ấy…', 'Tuần sau lớp chị diễn văn nghệ, nhớ xuống xem nha!', 'Đội bóng khối 11 đang tuyển thêm người đó, em đá được không?', 'Hồi lớp 10 anh cũng hay trốn lên đây ngắm sân trường.', 'Ra chơi mà lên tận tầng 2 chơi à? Dũng cảm ghê!', 'Thư viện có cuốn đề cương Toán hay lắm, xuống mượn đi em.'];
const seniorChat = (key, name, look, i) => { const k = 'snr_' + key; if (!G.daily[k]) { G.daily[k] = true; addStat('giaotiep', 1); } UI.ask(name, `<p>“${SENIOR_TALK[i % SENIOR_TALK.length]}”</p>`, ['Dạ, em cảm ơn anh chị!'], { who: { look } }); };
function buildUpstairs() {
  // hành lang tầng 2: tường có 4 cửa lớp, lan can nhìn xuống sân, lỗ cầu thang ở giữa
  const m = mapNew('tang2', 'Tầng 2 · các lớp khối 11, 12', 30, 9, true);
  paint(m, 'void', 0, 0, 30, 9, 1); paint(m, 'ctile', 1, 2, 28, 6, 0);
  wallFace(m, 16, 0, 448, 32, '#f4d273', '#e2bb57');
  paint(m, 'walltop', 0, 0, 1, 9, 1); paint(m, 'walltop', 29, 0, 1, 9, 1);
  // lan can + khoảng trời, cây phượng phía xa
  R(m.x, '#a8dcf5', 16, 128, 448, 16); R(m.x, '#5fae4a', 16, 138, 448, 6); for (let i = 0; i < 8; i++) ell(m.x, '#3f8f3a', 40 + i * 56, 138, 14, 5);
  R(m.x, '#c9c2b3', 16, 120, 448, 4); R(m.x, '#e2ddd2', 16, 120, 448, 1); for (let i = 16; i < 464; i += 12) R(m.x, '#c9c2b3', i, 124, 3, 12); R(m.x, '#8b8f9c', 16, 135, 448, 2);
  for (let i = 0; i < 30; i++) m.solid[8 * 30 + i] = 1;
  for (const [id, label, dx] of TANG2.rooms) {
    addObj(m, { s: 'sdoor', x: dx, y: 0, base: 34 });
    m.labels.push({ x: dx + 11, y: 4.5, text: label, size: 4.6, col: '#2a2136', maxw: 18 });
    m.warps.push({ x: dx + 2, y: 30, w: 18, h: 10, dir: 3, to: { map: id, x: 289, y: 204, dir: 3 } });
    drawWin(m.x, dx + 30, 10, 18, 14);
  }
  addObj(m, { s: 'stairdown', x: TANG2.stair, y: 118, base: 0, flat: true });
  for (let i = 0; i < 2; i++) m.solid[8 * 30 + 14 + i] = 0;
  m.warps.push({ x: TANG2.stair + 2, y: 128, w: 30, h: 10, dir: 0, to: { map: 'school', x: 352, y: 118, dir: 0 } });
  m.labels.push({ x: TANG2.stair + 17, y: 113, text: '↓ XUỐNG SÂN', size: 4.4, col: '#2a2136', maxw: 40 });
  addObj(m, { s: 'plant', x: 100, y: 28, sol: [2, 14, 12, 9] }); addObj(m, { s: 'plant', x: 370, y: 28, sol: [2, 14, 12, 9] });
  // anh chị đứng hành lang giờ ra chơi
  [[86, 72, 'sE', 0], [196, 88, 'sF', 1], [272, 70, 'sG', 2], [440, 84, 'sH', 3]].forEach(([a, b, look, i]) => NPCS.push({ id: 'cor_' + i, name: i % 2 ? 'Chị khoá trên' : 'Anh khoá trên', look, map: 'tang2', x: a, y: b, dir: i % 4, wander: 16, vis: () => yardTime(), label: () => (i % 2 ? 'Chị' : 'Anh') + ' khoá trên — trò chuyện', act: () => seniorChat('cor' + i, i % 2 ? 'Chị khoá trên' : 'Anh khoá trên', look, i + 4) }));
  // các lớp anh chị: bảng, ảnh Bác, bàn ghế, anh chị ngồi học / tụ tập
  for (const [id, label, dx, looks] of TANG2.rooms) {
    const r = roomBase(id, 'Lớp ' + label, '#f7efd0', '#8fc7a8', 'ctile');
    R(r.x, '#2a2136', 95, 5, 130, 22); R(r.x, '#8a5a3a', 96, 6, 128, 20); R(r.x, '#2f6b4f', 98, 8, 124, 15); R(r.x, '#dfeee6', 106, 12, 40, 1); R(r.x, '#dfeee6', 106, 16, 28, 1);
    drawWin(r.x, 34, 9, 22, 13); drawWin(r.x, 262, 9, 22, 13);
    addObj(r, { s: 'hoportrait', x: 73, y: 6, base: 0 });
    addObj(r, { s: 'tdesk', x: 38, y: 34, sol: [1, 2, 32, 19] });
    r.labels.push({ x: 160, y: 30, text: label, size: 4.6, col: '#2a2136', maxw: 18 });
    const X = [40, 104, 184, 248], Y = [70, 120, 170], seats = [];
    for (let row = 0; row < 3; row++) for (let c = 0; c < 4; c++) if ((row * 4 + c + label.charCodeAt(2)) % 3 !== 0) { addObj(r, { s: 'sdesk', x: X[c] - 1, y: Y[row] - 1, sol: [1, 1, 28, 12] }); seats.push([X[c] + 7, Y[row] + 30], [X[c] + 21, Y[row] + 30]); }
    const soc = SENIOR_OF[id], S = SOCIETY[soc];
    seats.filter((_, k) => k % 2 === 0 || k % 5 === 1).slice(0, 7).forEach(([a, b], k) => {
      const named = k === 1, look = named ? S.look : looks[k % looks.length], name = named ? S.name : (['sB', 'sD', 'sF', 'sH'].includes(look) ? 'Chị lớp ' : 'Anh lớp ') + label;
      NPCS.push({ id: `${id}_${k}`, sid: named ? 'r_' + soc : null, soc: named ? soc : null, name, look, map: id, x: a, y: b, dir: 3, solid: true,
        vis: named ? () => !(yardTime() && !!yardPos(S.look)) : null, label: () => name + (named ? '' : ' — trò chuyện'), act: () => (named ? ACT.senior(soc) : seniorChat(`${id}${k}`, name, look, k)) });
    });
    roomExit(r, { map: 'tang2', x: dx + 11, y: 46, dir: 0 });
  }
}
// Phòng chữ nhật có cửa ra ở góc dưới bên phải (giống lớp học)
function roomBase(id, name, wall, lower, floor, w, h) {
  w = w || 20; h = h || 14;
  const m = mapNew(id, name, w, h, true);
  paint(m, 'void', 0, 0, w, h, 1); paint(m, floor, 1, 2, w - 2, h - 3, 0);
  wallFace(m, 16, 0, (w - 2) * 16, 32, wall, lower);
  paint(m, 'walltop', 0, 0, 1, h, 1); paint(m, 'walltop', w - 1, 0, 1, h, 1); paint(m, 'walltop', 0, h - 1, w, 1, 1);
  paint(m, floor, w - 3, h - 1, 2, 1, 0); R(m.x, '#8a5a3a', (w - 3) * 16, (h - 1) * 16 + 12, 32, 4); R(m.x, '#3f354c', (w - 3) * 16 - 2, (h - 1) * 16, 2, 16);
  m.entry = [(w - 3) * 16 + 17, (h - 1) * 16 - 4, 3];
  return m;
}
const roomExit = (m, to) => m.warps.push({ x: (m.w - 3) * 16, y: (m.h - 1) * 16 + 6, w: 32, h: 10, dir: 0, to });
const napTime = () => !!G && schoolToday() && inWin(G.time, AM_END, PM_START - 10);
// Cửa các phòng trên dãy nhà chính của trường: [id phòng, x cửa, chữ trên biển]
const SCHOOL_ROOMS = [['yte', 202, 'Y TẾ'], ['nhac', 264, 'NHẠC'], ['ngutrua', 419, 'NGỦ']];
// Khối nhà vệ sinh riêng ở góc sân (cạnh nhà xe): cửa trái NAM, cửa phải NỮ — con trai không vào được bên nữ và ngược lại
const WC_BLOCK = { x: 628, y: 36, nam: 646, nu: 684 };
const wcGate = g => () => (G.gender === g ? null : g === 'girl' ? 'Đây là nhà vệ sinh NỮ — con trai không được vào!' : 'Đây là nhà vệ sinh NAM — con gái không được vào!');
// Nhân viên đứng quầy ở từng cửa hàng trong TTTM: [dáng, trang phục]
const MALL_VENDOR = { phim: ['clerk', null], sach: ['teacherB', null], sieuthi: ['vendor', null], anuong: ['c6', 'cas_ngan'], noithat: ['c7', 'cas_vy'], nhaccu: ['c3', 'cas_dat'], thethao: ['c5', 'cas_khoa'] };
// Cửa hàng 2 lớp: kệ trưng bày phía sau + quầy phía trước, người bán đứng giữa
function addShop(m, id, a, name, label, act, vendor) {
  addObj(m, { s: `sh_${id}_b`, x: a, y: 4, sol: [0, 26, 56, 20] });
  addObj(m, { s: `sh_${id}_f`, x: a, y: 42, sol: [1, 8, 54, 15], label, act });
  m.labels.push({ x: a + 28, y: 9.6, text: name.toUpperCase(), size: 4.6, col: '#fffaf0', maxw: 50 });
  NPCS.push({ id: `mv_${id}`, name: 'Nhân viên', look: vendor[0], outfit: vendor[1] ? () => vendor[1] : undefined, map: m.id, x: a + 28, y: 54, dir: 0, label, act });
}

function buildRooms() {
  buildChua();
  const sch = MAPS.school;
  /* ---------- cửa phòng trên dãy nhà trường ---------- */
  for (const [id, dx, text] of SCHOOL_ROOMS) {
    addObj(sch, { s: 'sdoor', x: dx, y: 64, base: 106 });
    sch.warps.push({ x: dx + 2, y: 102, w: 18, h: 12, dir: 3, to: { map: id, x: 289, y: 204, dir: 3 } });
    sch.labels.push({ x: dx + 11, y: 68.5, text, size: 4.2, col: '#2a2136', maxw: 15 });
  }
  const W = WC_BLOCK;
  addObj(sch, { s: 'wcblock', x: W.x, y: W.y, sol: [1, 14, 72, 44] });
  sch.labels.push({ x: W.x + 37, y: W.y + 4.5, text: 'NHÀ VỆ SINH', size: 4.2, col: '#2a2136', maxw: 32 });
  sch.labels.push({ x: W.nam, y: W.y + 31, text: 'NAM', size: 4.4, col: '#fffaf0', maxw: 18 });
  sch.labels.push({ x: W.nu, y: W.y + 31, text: 'NỮ', size: 4.4, col: '#fffaf0', maxw: 18 });
  sch.warps.push({ x: W.nam - 10, y: 94, w: 20, h: 12, dir: 3, gate: wcGate('boy'), to: { map: 'wcnam', x: 289, y: 204, dir: 3 } });
  sch.warps.push({ x: W.nu - 10, y: 94, w: 20, h: 12, dir: 3, gate: wcGate('girl'), to: { map: 'wcnu', x: 289, y: 204, dir: 3 } });
  // cửa giữa dãy nhà: cầu thang lên tầng 2 (các lớp anh chị khoá trên)
  addObj(sch, { s: 'sdoorBig', x: 332, y: 55, base: 106 });
  addObj(sch, { s: 'stairs', x: 334, y: 72, base: 106 });
  sch.labels.push({ x: 352, y: 59.5, text: 'CẦU THANG', size: 5, col: '#2a2136', maxw: 36 });
  sch.warps.push({ x: 342, y: 102, w: 20, h: 12, dir: 3, to: { map: 'tang2', x: TANG2.stair + 16, y: 118, dir: 3 } });
  // thư viện: khu nhà riêng ở góc trái sân trường (dời mấy cây, bụi ở đó đi)
  const [lx, ly] = LIB_HOUSE;
  sch.objs = sch.objs.filter(o => !((o.s === 'tree2' && o.x === 34 && o.y === 244) || (o.s === 'bush' && o.x === 12 && o.y === 318) || (o.s === 'treeRed' && o.x === 96 && o.y === 250)));
  addObj(sch, { s: 'libhouse', x: lx, y: ly, sol: [1, 18, 118, 60] });
  sch.labels.push({ x: lx + 60, y: ly + 35.5, text: 'THƯ VIỆN', size: 6, col: '#ffffff', maxw: 44 });
  sch.warps.push({ x: lx + 50, y: ly + 76, w: 20, h: 12, dir: 3, to: { map: 'thuvien', x: 289, y: 204, dir: 3 } });
  buildUpstairs();
  // thêm học sinh ra sân cho đông vui + cho mọi học sinh ngoài sân nhập vào các tụ chơi
  for (const [id, a, b, name] of [['x1', 150, 240, 'Tú · 10A2'], ['x2', 420, 300, 'Linh · 10A2'], ['x3', 260, 200, 'Bảo · 10A3'], ['x4', 340, 330, 'Nhi · 10A4']]) NPCS.push({ id: 'y_' + id, sid: id, name, look: id, map: 'school', x: a, y: b, dir: 0, wander: 30, vis: () => yardTime() && !!yardPos(id), label: () => name, act: () => ACT.mate(id) });
  // anh chị khoá trên (11, 12): nói chuyện riêng thì được chỉ mẹo học hành, đi lại trong trường
  for (const [id, soc] of [['sA', 'a_hung'], ['sB', 'c_mai'], ['sC', 'a_phong'], ['sD', 'c_thao']]) { const S = SOCIETY[soc]; NPCS.push({ id: 'y_' + id, sid: id, soc, name: `${S.name} · ${S.note.split(' · ')[1].split(',')[0]}`, look: id, map: 'school', x: 300, y: 260, dir: 0, vis: () => yardTime() && !!yardPos(id), label: () => S.name, act: () => ACT.senior(soc) }); }
  // học sinh ngoài sân: đứng theo tụ chơi; nói chuyện với bạn nào thì bạn đó hỏi có vào chơi cùng không
  for (const n of NPCS) if (n.id.startsWith('y_')) {
    const v0 = n.vis; n.vis = () => !!leavePos(n) || (!v0 || v0());       // tan học: đi bộ ra cổng rồi mới khuất
    n.pos = () => leavePos(n) || yardPos(n.sid); n.act0 = n.act; n.act = () => ACT.yardTalk(n);
    n.label = () => { const st = yardState(), w = st && st.where[n.sid]; return w ? `${n.name} — đang ${yardVerb(w[0].kind)}` : n.name; };
  }

  /* ---------- TRẠM Y TẾ ---------- */
  let m = roomBase('yte', 'Trạm y tế', '#eef6f3', '#9fd6c4', 'ltile');
  m.x.drawImage(SPR.redcross, 148, 8); drawWin(m.x, 220, 9, 22, 13);
  for (let i = 0; i < 3; i++) addObj(m, { s: 'medbed', x: 24, y: 44 + i * 46, sol: [1, 4, 34, 18], label: () => 'Giường bệnh — nằm nghỉ', act: () => ACT.infirmary() });
  addObj(m, { s: 'cabinet', x: 252, y: 2, sol: [1, 12, 32, 25] }); addObj(m, { s: 'tdesk', x: 150, y: 34, sol: [1, 2, 32, 19] }); addObj(m, { s: 'plant', x: 100, y: 12, sol: [2, 14, 12, 9] });
  NPCS.push({ id: 'doctor', name: 'Cô y tá', look: 'doctor', map: 'yte', x: 166, y: 70, dir: 0, label: () => 'Cô y tá', act: () => ACT.infirmary() });
  roomExit(m, { map: 'school', x: 213, y: 116, dir: 0 });

  /* ---------- PHÒNG NHẠC: sân khấu tập nhảy + phòng thu tập hát ---------- */
  m = roomBase('nhac', 'Phòng nhạc', '#f6e9d8', '#d9a878', 'wood');
  let x = m.x;
  R(x, '#8a5a3a', 22, 36, 138, 92); R(x, '#b47a48', 24, 36, 134, 84); R(x, '#c98f5a', 24, 36, 134, 3); R(x, '#6f472c', 22, 120, 138, 8);
  for (let i = 0; i < 6; i++) R(x, '#a8713f', 24 + i * 23, 40, 1, 78);
  R(x, '#b23b3b', 18, 5, 14, 34); R(x, '#d9534f', 20, 5, 4, 34); R(x, '#b23b3b', 150, 5, 14, 34); R(x, '#d9534f', 156, 5, 4, 34); R(x, '#8a2f2f', 18, 5, 146, 6);
  for (const a of [50, 90, 130]) { R(x, '#3a3f55', a, 12, 6, 6); R(x, '#ffe9a0', a + 1, 17, 4, 2); }
  R(x, '#5c6f7c', 196, 32, 3, 96); x.fillStyle = 'rgba(190,225,245,0.45)'; x.fillRect(199, 32, 102, 96); R(x, '#5c6f7c', 196, 126, 105, 3); R(x, '#fffaf0', 232, 10, 36, 9); R(x, '#d9534f', 236, 13, 4, 3);
  for (let i = 0; i < 4; i++) R(x, '#57496b', 204 + i * 24, 34, 18, 8);
  addObj(m, { s: 'speaker', x: 28, y: 34, sol: [1, 12, 12, 10] }); addObj(m, { s: 'speaker', x: 140, y: 34, sol: [1, 12, 12, 10] });
  addObj(m, { s: 'dancepad', x: 74, y: 74, flat: true, ir: [-20, -24, 74, 64], label: () => 'Sân khấu — tập nhảy', act: () => ACT.music('dance') });
  addObj(m, { s: 'mic', x: 246, y: 64, sol: [2, 16, 6, 6], ir: [-22, -10, 54, 50], label: () => 'Phòng thu — tập hát', act: () => ACT.music('sing') });
  addObj(m, { s: 'speaker', x: 282, y: 36, sol: [1, 12, 12, 10] }); addObj(m, { s: 'guitar', x: 208, y: 40, sol: [2, 18, 6, 8] });
  m.labels.push({ x: 91, y: 30, text: 'SÂN KHẤU', size: 5, col: '#fff6e3', maxw: 60 }); m.labels.push({ x: 250, y: 14.5, text: 'ĐANG THU', size: 4, col: '#2a2136', maxw: 24 });
  roomExit(m, { map: 'school', x: 275, y: 116, dir: 0 });

  /* ---------- THƯ VIỆN: mỗi môn một tủ sách ---------- */
  m = roomBase('thuvien', 'Thư viện', '#efe6d2', '#c9a467', 'wood');
  BOOK_SUBJ.forEach((s, i) => {
    addObj(m, { s: 'bs_' + s, x: 22 + i * 34, y: 2, sol: [1, 10, 26, 28], label: () => `Tủ sách ${SUBJ[s].name} — đọc sách`, act: () => ACT.readBook(s) });
    addObj(m, { s: 'shelfsign', x: 22 + i * 34, y: 0, base: 60 });                     // biển danh mục trên đầu tủ
    m.labels.push({ x: 35 + i * 34, y: 4.6, text: SUBJ[s].short.toUpperCase(), size: 4.4, col: '#2a2136', maxw: 22 });
  });
  for (const a of [44, 150]) { addObj(m, { s: 'table', x: a, y: 104, sol: [1, 2, 44, 26] }); addObj(m, { s: 'stool', x: a - 12, y: 114 }); addObj(m, { s: 'stool', x: a + 48, y: 114 }); }
  addObj(m, { s: 'tdesk', x: 236, y: 120, sol: [1, 2, 32, 19] }); addObj(m, { s: 'plant', x: 20, y: 180, sol: [2, 14, 12, 9] });
  NPCS.push({ id: 'thuthu', name: 'Cô thủ thư', look: 'teacherB', map: 'thuvien', x: 252, y: 154, dir: 0, label: () => 'Cô thủ thư', act: () => UI.say('Thư viện', '“Sách xếp theo từng môn trên các tủ sát tường. Em tới tủ nào thì đọc sách môn đó. Giữ trật tự nhé.”') });
  roomExit(m, { map: 'school', x: LIB_DOOR[0], y: LIB_DOOR[1], dir: 0 });

  /* ---------- PHÒNG NGỦ TRƯA ---------- */
  m = roomBase('ngutrua', 'Phòng ngủ trưa', '#e8e4f5', '#b9aee0', 'wood');
  drawWin(m.x, 60, 9, 22, 13); drawWin(m.x, 220, 9, 22, 13);
  for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) {
    const a = 26 + i * 52, b = 52 + r * 62, mine = r === 1 && i === 2;
    const busy = () => !mine && napTime() && (i * 7 + r * 3 + G.day) % 5 < 3;           // chiếu đã có bạn nằm
    addObj(m, { s: 'napmat', x: a, y: b, flat: true, ir: [-4, -6, 40, 32], label: () => (busy() ? 'Có bạn đang ngủ ở chiếu này' : 'Chiếu trống — ngủ trưa'), act: () => (busy() ? UI.toast('Có bạn đang ngủ rồi, tìm chiếu khác nhé.') : ACT.nap(a, b)) });
    if (!mine) addObj(m, { s: 'sleeper', x: a, y: b, sol: [1, 2, 30, 16], vis: busy });
  }
  roomExit(m, { map: 'school', x: 430, y: 116, dir: 0 });

  /* ---------- NHÀ VỆ SINH NAM / NỮ: bồn rửa + buồng (nam có thêm bồn tiểu) ---------- */
  for (const [id, name, wall, lower, tile, door, x0, stalls] of [['wcnam', 'Nhà vệ sinh nam', '#e4eef7', '#a9c6dc', 'ltile', WC_BLOCK.nam, 140, 3], ['wcnu', 'Nhà vệ sinh nữ', '#fbe4ea', '#eab2c2', 'wtile', WC_BLOCK.nu, 140, 5]]) {
    m = roomBase(id, name, wall, lower, tile);
    for (const mx of WC_MIRRORS) { R(m.x, '#2a2136', mx - 1, 5, 26, 21); R(m.x, '#c9ccd4', mx, 6, 24, 19); R(m.x, '#dff1fa', mx + 1, 7, 22, 17); R(m.x, '#eef8fd', mx + 1, 7, 22, 2); addObj(m, { s: 'wcsink', x: mx - 1, y: 26, sol: [1, 2, 24, 18], label: () => 'Bồn rửa — rửa mặt cho tỉnh', act: () => ACT.washFace() }); }
    for (let i = 0; i < stalls; i++) addObj(m, { s: 'toiletdoor', x: x0 + i * 30, y: 2, base: 0, ir: [0, 0, 20, 40], label: () => 'Buồng vệ sinh', act: () => ACT.stall(i) });
    if (id === 'wcnam') for (let i = 0; i < 3; i++) { const ux = 236 + i * 22; R(m.x, '#c9ccd4', ux - 1, 11, 14, 19); R(m.x, '#fbfdff', ux, 12, 12, 17); R(m.x, '#dfe9ee', ux + 2, 20, 8, 7); R(m.x, '#8b8f9c', ux + 5, 8, 2, 4); }
    R(m.x, id === 'wcnam' ? '#5a8fd6' : '#e98fa5', 276, 213, 24, 3);
    addObj(m, { s: 'plant', x: 20, y: 180, sol: [2, 14, 12, 9] });
    roomExit(m, { map: 'school', x: door, y: 108, dir: 0 });
  }

  /* ---------- BÊN TRONG TTTM: mỗi gian hàng bán một loại ---------- */
  m = roomBase('tttm', 'TTTM Hoa Phượng Plaza', '#eef3f8', '#b9c9dc', 'ltile', 28, 16);
  MALL_STALLS.forEach(([id, name], k) => addShop(m, id, 18 + k * 58, name, () => `${name} — xem hàng`, () => ACT.stallShop(id), MALL_VENDOR[id]));
  addObj(m, { s: 'fountain', x: 200, y: 130, sol: [2, 8, 42, 20] });
  for (const [a, b] of [[110, 136], [300, 136], [110, 190], [300, 190]]) addObj(m, { s: 'bench', x: a, y: b, sol: [1, 1, 28, 12] });
  for (const a of [20, 400]) addObj(m, { s: 'plant', x: a, y: 200, sol: [2, 14, 12, 9] });
  NPCS.push({ id: 'mall_a', name: 'Khách', look: 'c6', outfit: () => 'cas_ngan', map: 'tttm', x: 150, y: 110, dir: 0, wander: 40 });
  NPCS.push({ id: 'mall_b', name: 'Khách', look: 'c7', outfit: () => 'cas_khoa', map: 'tttm', x: 330, y: 170, dir: 1, wander: 40 });
  roomExit(m, { map: 'pho', x: 660, y: 138, dir: 0 });

  /* ---------- BÊN TRONG KHU GAME ---------- */
  m = roomBase('arc', 'Khu game Arcade', '#2c2347', '#ff5fa8', 'dtile');
  for (let i = 0; i < 18; i++) R(m.x, i % 2 ? '#ffe066' : '#5fe0f0', 20 + i * 16, 22, 3, 3);
  addShop(m, 'xeng', 20, 'Đổi xèng', () => 'Quầy đổi xèng', () => ACT.tokens(), ['c1', 'cas_dat']);
  for (const [spr, a, kind, name] of [['cabClaw', 88, 'claw', 'Máy gắp thú'], ['cabFight', 122, 'fight', 'Game đối kháng'], ['cabFight', 146, 'fight', 'Game đối kháng'], ['cabSlot', 178, 'slot', 'Máy may rủi'], ['cabRace', 210, 'race', 'Game thùng đua xe'], ['cabRace', 234, 'race', 'Game thùng đua xe'], ['cabDance', 268, 'dance', 'Máy nhảy']])
    addObj(m, { s: spr, x: a, y: 4, sol: [1, 14, 20, 22], label: () => name, act: () => ACT.machine(kind, a) });
  addObj(m, { s: 'dancepad', x: 262, y: 46, flat: true });
  NPCS.push({ id: 'arc_a', name: 'Người chơi', look: 'c5', outfit: () => 'cas_dat', map: 'arc', x: 156, y: 52, dir: 3 });
  NPCS.push({ id: 'arc_b', name: 'Người chơi', look: 'c3', outfit: () => 'cas_khoa', map: 'arc', x: 120, y: 150, dir: 0, wander: 30 });
  roomExit(m, { map: 'pho', x: 812, y: 138, dir: 0 });

  /* ---------- NHÀ BẠN: phòng khách (đủ thân mới được vào) + phòng riêng (thân hơn nữa) ---------- */
  m = roomBase('fhome', 'Nhà bạn', '#f6ead2', '#c9b58a', 'wood');
  m.warps.length = 0;
  paint(m, 'walltop', 11, 0, 1, 13, 1); paint(m, 'wood', 11, 6, 1, 2, 0); R(m.x, '#d9ccb2', 176, 86, 16, 10); R(m.x, '#57496b', 176, 128, 16, 1);
  drawWin(m.x, 60, 9, 22, 13); drawWin(m.x, 240, 9, 20, 13);
  addObj(m, { s: 'rug', x: 70, y: 96, flat: true }); addObj(m, { s: 'tvcab', x: 78, y: 19, sol: [1, 12, 38, 17], label: () => 'Tivi — xem cùng bạn', act: () => ACT.fh('tv') });
  addObj(m, { s: 'sofa', x: 74, y: 140, sol: [1, 6, 46, 15] }); addObj(m, { s: 'plant', x: 22, y: 20, sol: [2, 14, 12, 9] }); addObj(m, { s: 'table', x: 24, y: 150, sol: [1, 2, 44, 26] });
  addObj(m, { s: 'bed', x: 196, y: 24, sol: [1, 4, 32, 42], label: () => `Giường của ${FRIENDS[G.visit].name} — nằm nghỉ`, act: () => ACT.fhBed() }); addObj(m, { s: 'desk', x: 262, y: 24, sol: [1, 2, 34, 25] }); addObj(m, { s: 'rugBlue', x: 220, y: 120, flat: true });
  addObj(m, { s: 'gameconsole', x: 232, y: 160, sol: [1, 8, 22, 10], label: () => 'Máy chơi game — chơi điện tử cùng bạn', act: () => ACT.fh('game') });
  addObj(m, { s: 'poster', x: 234, y: 8, base: 0 });
  // cửa phòng riêng: chưa đủ thân thì bị chặn lại
  def('blank', 1, 1, () => { }, true);
  addObj(m, { s: 'blank', x: 176, y: 96, sol: [0, 0, 16, 32], ir: [-8, 0, 24, 32], vis: () => hearts(G.visit) < FRIEND_ROOM_HEARTS, label: () => 'Phòng riêng — chưa đủ thân để vào', act: () => UI.say(FRIENDS[G.visit].name, '“Phòng tớ bừa lắm, bữa khác thân hơn tớ cho vào chơi.”') });
  NPCS.push({ id: 'fh', name: 'Bạn', look: 'khoa', dynLook: () => G.visit || 'khoa', outfit: () => friendOutfit(G.visit || 'khoa'), map: 'fhome', x: 130, y: 110, dir: 0, wander: 18, vis: () => !sceneHides('fh'), label: () => FRIENDS[G.visit].name, act: () => ACT.friend(G.visit, 'in') });
  m.zones.push({ x: 272, y: 216, w: 32, h: 8, fn: () => ACT.leaveFh(), by: -8 });

  buildFest(); buildBcFest(); buildTrungThu(); buildTaskSpots();
  /* ---------- đồ trang trí phòng ngủ ở nhà (mua ở gian Nội thất, Nhạc cụ) ---------- */
  const h = MAPS.home, own = k => () => !!G && !!G.owned[k];
  addObj(h, { s: 'poster', x: 24, y: 8, base: 0, vis: own('d_poster') });
  addObj(h, { s: 'floorlamp', x: 128, y: 150, sol: [3, 22, 6, 6], vis: own('d_den') });
  addObj(h, { s: 'plant', x: 104, y: 194, sol: [2, 14, 12, 9], vis: own('d_cay') });
  addObj(h, { s: 'rug', x: 66, y: 166, flat: true, vis: own('d_tham') });
  addObj(h, { s: 'guitar', x: 112, y: 50, sol: [2, 18, 6, 8], vis: own('guitar') });
  // dụng cụ thể thao: để quanh thảm tập, bấm vào để tập (có hoạt ảnh)
  addObj(h, { s: 'eq_daynhay', x: 60, y: 148, ir: [-4, -4, 24, 18], vis: own('daynhay'), label: () => 'Dây nhảy — nhảy dây', act: () => ACT.exercise('daynhay') });
  addObj(h, { s: 'eq_tatay', x: 60, y: 166, ir: [-4, -4, 26, 17], vis: own('tatay'), label: () => 'Tạ tay — tập tạ', act: () => ACT.exercise('tatay') });
  addObj(h, { s: 'eq_xadon', x: 96, y: 110, sol: [0, 38, 28, 6], ir: [0, 20, 28, 26], vis: own('xadon'), label: () => 'Xà đơn — hít xà', act: () => ACT.exercise('xadon') });
  addObj(h, { s: 'mic', x: 132, y: 96, sol: [2, 16, 6, 6], ir: [-8, 0, 24, 30], vis: own('micro'), label: () => 'Micro — tập hát ở nhà', act: () => ACT.music('home') });
}

/* ============================================================
 *  CHÙA HOA PHƯỢNG (dưới khu phố nhà mình, bên trái bờ sông): chính điện, lư hương — thắp nhang, xin xăm
 * ============================================================ */
const tetTime = () => !!G && !!holidayOf(G.day) && holidayOf(G.day).name === 'Tết Nguyên Đán';
function buildChua() {
  const m = mapNew('chua', 'Chùa Hoa Phượng', 40, 26, false), x = m.x;
  paint(m, 'grass', 0, 0, 40, 26, 0);
  [[3, 3], [6, 18], [14, 23], [26, 23], [34, 4], [37, 17], [2, 12], [31, 22]].forEach(([a, b]) => paint(m, 'flowers', a, b, 1, 1, 0));
  paint(m, 'yard', 11, 8, 18, 14, 0);                                // sân chùa lát gạch
  paint(m, 'dirt', 10, 0, 2, 10, 0);                                 // lối từ khu phố xuống
  paint(m, 'dirt', 29, 10, 11, 2, 0);                                // lối sang bờ sông
  // ao sen
  ell(x, '#9cc48a', 96, 316, 62, 34); ell(x, '#5fb0e0', 96, 316, 58, 30); ell(x, '#8fd0f0', 80, 306, 26, 8);
  for (const [a, b] of [[70, 320], [104, 304], [124, 326], [86, 332], [60, 302]]) { ell(x, '#5fae4a', a, b, 6, 3.5); R(x, '#ff8fb8', a - 1, b - 3, 3, 3); R(x, '#ffd6e4', a, b - 3, 1, 1); }
  m.solids.push([36, 286, 120, 60]);
  addObj(m, { s: 'pagoda', x: 231, y: 18, sol: [0, -18, 178, 124] });           // chặn cả khối chính điện (kể cả phía sau mái) — không đi xuyên được
  m.labels.push({ x: 320, y: 84.5, text: 'CHÙA HOA PHƯỢNG', size: 4.4, col: '#ffe066', maxw: 46 });
  addObj(m, { s: 'luhuong0', x: 309, y: 186, sol: [3, 18, 20, 10], smoke: [13, 4], dyn: () => 'luhuong' + (Math.floor(performance.now() / 350) % 2), label: () => (G.daily.que !== undefined && G.daily.que !== null ? 'Lư hương — hôm nay đã xin quẻ' : 'Lư hương — thắp nhang, xin xăm'), act: () => ACT.incense() });
  for (const a of [252, 380]) { addObj(m, { s: 'stonelamp', x: a, y: 160, sol: [1, 16, 12, 8] }); addObj(m, { s: 'stonelamp', x: a, y: 260, sol: [1, 16, 12, 8] }); }
  for (const [s2, a, b] of [['tree2', 150, 110], ['tree', 480, 110], ['tree2', 470, 290], ['tree', 40, 30], ['treePink', 560, 260], ['tree2', 590, 40], ['tree', 300, 340], ['tree2', 200, 330]]) addObj(m, { s: s2, x: a, y: b, sol: [13, 38, 10, 9] });
  for (const a of [176, 448]) addObj(m, { s: 'benchstone', x: a, y: 230, sol: [1, 1, 28, 12] });
  for (let i = 0; i < 40; i++) addObj(m, { s: 'hedge', x: i * 16, y: 398, sol: [0, 4, 18, 12] });
  // ngày Tết: mai vàng, đào, lồng đèn
  for (const a of [292, 336]) addObj(m, { s: a === 292 ? 'chaudao' : 'chauquat', x: a, y: 124, sol: [3, 20, 10, 6], vis: tetTime });
  addObj(m, { s: 'treeQuat', x: 200, y: 150, sol: [13, 38, 10, 9], vis: tetTime }); addObj(m, { s: 'treePink', x: 410, y: 150, sol: [13, 38, 10, 9], vis: tetTime });
  addObj(m, { s: 'lanterns', x: 280, y: 136, base: 0, vis: tetTime });
  NPCS.push({ id: 'su', name: 'Sư thầy', look: 'monk', map: 'chua', x: 372, y: 210, dir: 0, wander: 10, vis: () => inWin(G.time, 330, 1260), label: () => 'Sư thầy', act: () => ACT.monk() });
  NPCS.push({ id: 'chua_a', name: 'Người đi lễ', look: 'c6', outfit: () => 'cas_ngan', map: 'chua', x: 220, y: 280, dir: 0, wander: 30, vis: () => inWin(G.time, 360, 1140) });
  NPCS.push({ id: 'chua_b', name: 'Người đi lễ', look: 'c7', outfit: () => 'cas_dat', map: 'chua', x: 430, y: 300, dir: 1, wander: 30, vis: () => tetTime() || inWin(G.time, 420, 660) });
  NPCS.push({ id: 'chua_c', name: 'Người đi lễ', look: 'vendor', outfit: () => 'noapron', map: 'chua', x: 300, y: 240, dir: 3, wander: 20, vis: () => tetTime() && inWin(G.time, 360, 1140) });
  addObj(m, { s: 'trailsign', x: 196, y: 6, sol: [9, 16, 6, 8], label: () => '↑ Về khu phố nhà mình', act: () => ACT.go('chua', 'town') });
  m.zones.push({ x: 160, y: 5, w: 32, h: 7, fn: () => ACT.go('chua', 'town'), by: 10 });
  addObj(m, { s: 'signpost', x: 600, y: 140, sol: [10, 22, 8, 8], label: () => 'Bờ sông →', act: () => ACT.go('chua', 'song') });
  m.zones.push({ x: 632, y: 156, w: 8, h: 40, fn: () => ACT.go('chua', 'song'), bx: -6 });
}

/* ============================================================
 *  TRANG TRÍ NGÀY TẾT ở nhà mình, nhà các bạn · HỘI CHỢ ĐÊM GIAO THỪA trên núi sau trường
 * ============================================================ */
const isEveDay = day => { const c = cal(day); return c.season === 1 && c.dos === CFG.DAYS_PER_SEASON; };
const festDecor = () => !!G && (RT.fest || (isEveDay(G.day) && G.time >= 1020 && G.time < CFG.DAY_END));
// tụ chơi trong hội chợ: [id, kiểu, tâm x, tâm y]
const FEST_SPOTS = { rope: [130, 424], cau: [250, 420], skip: [462, 252] };
function buildFest() {
  const t = MAPS.town;
  for (const [a, k] of [[64, 'chaudao'], [110, 'chauquat'], [290, 'chaudao'], [402, 'chauquat']]) addObj(t, { s: k, x: a, y: 106, sol: [3, 20, 10, 6], vis: tetTime });
  const p = MAPS.pho;
  for (const fid in FRIEND_HOUSE) { const hx = FRIEND_HOUSE[fid][1]; addObj(p, { s: 'chaudao', x: hx + 12, y: 104, sol: [3, 20, 10, 6], vis: tetTime }); addObj(p, { s: 'chauquat', x: hx + 72, y: 106, sol: [3, 20, 10, 6], vis: tetTime }); }
  for (const [a, k] of [[468, 'chauquat'], [568, 'chaudao'], [748, 'chauquat']]) addObj(p, { s: k, x: a, y: 106, sol: [3, 20, 10, 6], vis: tetTime });
  // trong nhà: chậu đào cạnh tivi, chậu quất cạnh sofa
  const h0 = MAPS.home; addObj(h0, { s: 'chaudao', x: 240, y: 14, sol: [3, 20, 10, 6], vis: tetTime }); addObj(h0, { s: 'chauquat', x: 244, y: 98, sol: [3, 18, 12, 6], vis: tetTime });
  const m = MAPS.nui;
  // dọn chỗ cho hội chợ: vài cây thông, tảng đá ẩn đi trong đêm hội
  const clear = [[386, 330], [430, 380], [500, 400], [340, 380], [96, 380], [220, 390], [240, 440], [290, 340], [410, 260]];
  for (const o of m.objs) if (clear.some(([a, b]) => o.x === a && o.y === b)) { const v0 = o.vis; o.vis = () => !festDecor() && (!v0 || v0()); }
  // lồng đèn, cờ, dây cờ
  for (const [a, b] of [[280, 444], [190, 236], [430, 316], [90, 360], [520, 196]]) addObj(m, { s: 'lanterns', x: a, y: b, base: 900, glow: true, vis: festDecor });
  for (const [a, b] of [[150, 196], [330, 196], [380, 440]]) addObj(m, { s: 'bunting', x: a, y: b, base: 900, vis: festDecor });
  for (const [a, b] of [[170, 238], [300, 234]]) addObj(m, { s: 'flagpole', x: a, y: b, sol: [3, 52, 14, 9], vis: festDecor });
  // sạp trò chơi, sạp đồ ăn (có người bán đứng quầy)
  const booth = (id, a, name, label, act, look, of) => {
    addObj(m, { s: `fb_${id}_b`, x: a, y: 334, sol: [0, 26, 56, 20], vis: festDecor });
    addObj(m, { s: `fb_${id}_f`, x: a, y: 372, sol: [1, 8, 54, 15], label, act, vis: festDecor });
    NPCS.push({ id: 'fv_' + id, name, look, outfit: () => of, map: 'nui', x: a + 28, y: 384, dir: 0, vis: festDecor, label, act });
  };
  booth('nemvong', 372, 'Chú bán sạp', () => 'Sạp ném vòng — trúng vòng thì lấy quà', () => ACT.festGame('nemvong'), 'driver', null);
  booth('banna', 432, 'Anh bán sạp', () => 'Sạp bắn ná cao su — bắn đổ lon', () => ACT.festGame('banna'), 'c5', 'cas_khoa');
  booth('doan', 492, 'Cô bán hàng', () => 'Sạp đồ ăn đêm giao thừa', () => ACT.festFood(), 'vendor', null);
  // mọi người ngồi chờ pháo hoa, nói chuyện
  const FEST_CHAT = ['Còn mấy tiếng nữa là bắn pháo hoa rồi, háo hức ghê!', 'Năm nay tớ ước thi đậu đại học, cả nhà mạnh khoẻ.', 'Đứng chỗ này nhìn pháo hoa là đẹp nhất đó, tin tớ!', 'Ăn bánh chưng rán ở sạp kia chưa? Giòn lắm!', 'Mới gói bánh chưng với ông bà xong là chạy lên đây luôn.'];
  [['c2', 'cas_vy', 206, 300], ['c4', 'cas_ngan', 232, 314], ['c7', 'cas_dat', 290, 300], ['c3', 'cas_khoa', 268, 322]].forEach(([look, of, a, b], i) => NPCS.push({ id: 'fc_' + i, name: 'Người dự hội', look, outfit: () => of, map: 'nui', x: a, y: b, dir: i % 2 ? 1 : 2, vis: festDecor, label: () => 'Người dự hội — trò chuyện', act: () => festChat(i, look, of, FEST_CHAT[i % FEST_CHAT.length]) }));
  addObj(m, { s: 'picnicmat', x: 236, y: 290, flat: true, vis: festDecor });
  // bố mẹ (nếu cả nhà cùng đi)
  NPCS.push({ id: 'f_mom', name: 'Mẹ', look: 'mom', outfit: () => 'noapron', map: 'nui', x: 250, y: 296, dir: 0, vis: () => RT.fest && G.eve && G.eve.who === 'parents', label: () => 'Mẹ', act: () => UI.ask('Mẹ', '<p>“Đi chơi một vòng đi con, gần giao thừa thì về đây cả nhà cùng xem pháo hoa.”</p>', ['Dạ'], { who: { look: 'mom', outfit: 'noapron' } }) });
  NPCS.push({ id: 'f_dad', name: 'Bố', look: 'dad', outfit: () => 'dadhome', map: 'nui', x: 268, y: 296, dir: 0, vis: () => RT.fest && G.eve && G.eve.who === 'parents', label: () => 'Bố', act: () => UI.ask('Bố', '<p>“Ném vòng ở sạp kia khó lắm đấy, con thử xem có trúng con gấu không.”</p>', ['Dạ'], { who: { look: 'dad', outfit: 'dadhome' } }) });
  // nhảy dây (2 bạn quay dây, 1 bạn nhảy) · đá cầu · ném đá thia lia xuống hồ
  const R0 = FEST_SPOTS.rope, C0 = FEST_SPOTS.cau, S0 = FEST_SPOTS.skip;
  [['x2', 'cas_vy', -22, 0, 2], ['x4', 'cas_ngan', 22, 0, 1], ['c6', 'cas_ngan', 0, 2, 0]].forEach(([look, of, dx, dy, d], i) => NPCS.push({ id: 'fr_' + i, name: 'Bạn nhảy dây', look, outfit: () => of, map: 'nui', x: R0[0] + dx, y: R0[1] + dy, dir: d, vis: festDecor, pos: i === 2 ? () => ({ x: R0[0], y: R0[1] + 2, dir: 0, oy: -Math.abs(Math.sin(performance.now() / 260)) * 6 }) : undefined, label: () => 'Nhảy dây — xin vào nhảy cùng', act: () => ACT.festJoin('rope') }));
  [0, 1, 2].forEach(i => { const a = i / 3 * 6.283 + 0.6; NPCS.push({ id: 'fk_' + i, name: 'Bạn đá cầu', look: ['c1', 'c8', 'x3'][i], outfit: () => ['cas_dat', 'cas_vy', 'cas_khoa'][i], map: 'nui', x: Math.round(C0[0] + Math.cos(a) * 20), y: Math.round(C0[1] + Math.sin(a) * 13), dir: dirOf(-Math.cos(a), -Math.sin(a)), vis: festDecor, label: () => 'Đá cầu — xin vào đá cùng', act: () => ACT.festJoin('cau') }); });
  NPCS.push({ id: 'fs_0', name: 'Bạn ném đá', look: 'c5', outfit: () => 'cas_dat', map: 'nui', x: S0[0] - 14, y: S0[1] + 26, dir: 2, vis: festDecor, label: () => 'Ném đá thia lia xuống hồ', act: () => ACT.festSkip() });
  addObj(m, { s: 'blank', x: S0[0], y: S0[1], ir: [-10, -6, 20, 30], vis: festDecor, label: () => 'Bờ hồ — ném đá thia lia', act: () => ACT.festSkip() });
}

/* ============================================================
 *  TẾT TRUNG THU ở phố Hoa Phượng (giữa mùa thu, 20:00–23:00): sân khấu + thị trưởng ở quảng trường,
 *  đội lân, sạp nguyên liệu / làm đèn lồng / bánh trung thu, góc bịt mắt đập niêu, sân kéo co, trẻ con cầm đèn ông sao
 * ============================================================ */
const isTTDay = day => isDate([TT.season, TT.day], day);
const ttDecor = () => !!G && isTTDay(G.day) && G.time >= TT.decor && G.time < CFG.DAY_END;   // từ chiều đã treo đèn, dựng sạp
const ttOn = () => !!G && !!RT.ttFest && G.map === 'pho';                                      // đang trong hội
const TT_SPOTS = { nieu: [800, 318], keoco: [130, 344], stage: [452, 280], mayor: [502, 334], lion: [440, 352], ongdia: [482, 358], drum: [530, 342] };
const TT_KIDS = [[300, 256], [520, 252], [640, 258], [150, 254], [352, 386], [574, 390], [760, 256], [236, 256]];
const TT_CHAT = ['Năm nay đội lân múa đẹp lắm, ráng xem nha!', 'Con tôi tự làm đèn ông sao đó, sáng chưa!', 'Ăn miếng bánh nướng không cháu? Nhân thập cẩm ngon lắm.', 'Trăng rằm tháng Tám tròn nhất năm đó.'];
const TT_FRIEND_AT = { khoa: [330, 258], vy: [600, 374], dat: [92, 374], ngan: [690, 374] };
function buildTrungThu() {
  const m = MAPS.pho, K = TT_SPOTS;
  // dọn chỗ cho hội: xe xiên que, vài cây, bụi, ghế đá ẩn đi trong đêm hội
  const clear = [[620, 290], [580, 352], [700, 292], [840, 290], [780, 348], [690, 362], [600, 340], [760, 300], [740, 380], [498, 296], [498, 380], [150, 338]];
  for (const o of m.objs) if (clear.some(([a, b]) => o.x === a && o.y === b)) { const v0 = o.vis; o.vis = () => !ttDecor() && (!v0 || v0()); }
  // đèn lồng, dây cờ
  for (const [a, b] of [[40, 230], [210, 230], [560, 230], [740, 230], [160, 110], [332, 110], [650, 110]]) addObj(m, { s: 'lanterns', x: a, y: b, base: 900, glow: true, vis: ttDecor });
  for (const [a, b] of [[44, 284], [584, 282], [334, 282]]) addObj(m, { s: 'bunting', x: a, y: b, base: 900, vis: ttDecor });
  // sân khấu + thị trưởng
  addObj(m, { s: 'ttstage', x: K.stage[0], y: K.stage[1], sol: [0, 30, 100, 16], vis: ttDecor });
  m.labels.push({ x: K.stage[0] + 40, y: K.stage[1] + 17, text: 'ĐÊM HỘI TRĂNG RẰM', size: 7, col: '#ffe066', maxw: 62, vis: ttDecor });
  NPCS.push({ id: 'tt_mayor', sid: 'tt_mayor', soc: 'thitruong', name: 'Ông thị trưởng', look: 'mayor', map: 'pho', x: K.mayor[0], y: K.mayor[1], dir: 0, vis: () => ttOn() && !sceneHides('tt_mayor'), label: () => 'Ông thị trưởng — bắt đầu buổi lễ', act: () => ACT.mayor() });
  // đội lân chờ khai hội: lân, ông Địa, trống
  const idle = () => ttDecor() && !sceneHides('ttlion');
  addObj(m, { s: 'lion0', dyn: () => 'lion' + (Math.floor(performance.now() / 420) % 2), x: K.lion[0], y: K.lion[1], sol: [2, 18, 30, 8], vis: idle, label: () => 'Đội lân — chờ thị trưởng khai hội', act: () => UI.ask('Đội lân', '<p>“Gặp ông thị trưởng ở sân khấu đi cháu, ông khai hội là tụi chú múa liền!”</p>', ['Dạ!'], { who: { look: 'c5', outfit: 'cas_dat' } }) });
  addObj(m, { s: 'ongdia0', dyn: () => 'ongdia' + (Math.floor(performance.now() / 300) % 2), x: K.ongdia[0], y: K.ongdia[1], sol: [4, 20, 12, 6], vis: idle });
  addObj(m, { s: 'trong', x: K.drum[0], y: K.drum[1], sol: [2, 12, 16, 8], vis: idle });
  NPCS.push({ id: 'tt_drum', name: 'Chú đánh trống', look: 'driver', map: 'pho', x: K.drum[0] + 22, y: K.drum[1] + 14, dir: 1, vis: () => ttOn() && !sceneHides('ttlion'), label: () => 'Chú đánh trống lân', act: () => UI.ask('Chú đánh trống', '<p>“Tùng tùng cắc! Thị trưởng khai hội là trống nổi lên liền!”</p>', ['Dạ!'], { who: { look: 'driver' } }) });
  // sạp hàng: nguyên liệu làm đèn · làm đèn lồng · bánh trung thu
  const booth = (id, a, name, label, act, look, of) => {
    addObj(m, { s: `fb_${id}_b`, x: a, y: 292, sol: [0, 26, 56, 20], vis: ttDecor });
    addObj(m, { s: `fb_${id}_f`, x: a, y: 330, sol: [1, 8, 54, 15], label, act, vis: ttDecor });
    NPCS.push({ id: 'ttv_' + id, name, look, outfit: () => of, map: 'pho', x: a + 28, y: 342, dir: 0, vis: ttOn, label, act });
  };
  booth('nguyenlieu', 590, 'Cô bán nguyên liệu', () => 'Sạp nguyên liệu làm đèn lồng', () => ACT.ttMats(), 'vendor', null);
  booth('denlong', 650, 'Chú làm đèn', () => 'Sạp làm đèn lồng — tự ghép đèn ông sao', () => ACT.ttLantern(), 'c3', 'cas_khoa');
  booth('banhtt', 710, 'Cô bán bánh', () => 'Sạp bánh trung thu', () => ACT.ttFood(), 'vendor', null);
  // bịt mắt đập niêu
  addObj(m, { s: 'nieupole', x: K.nieu[0], y: K.nieu[1], sol: [0, 40, 44, 6], ir: [-6, 10, 56, 44], vis: ttDecor, label: () => 'Bịt mắt đập niêu', act: () => ACT.ttNieu() });
  NPCS.push({ id: 'tt_nieu', name: 'Chú quản trò', look: 'driver', outfit: () => null, map: 'pho', x: K.nieu[0] - 12, y: K.nieu[1] + 50, dir: 2, vis: ttOn, label: () => 'Chú quản trò — bịt mắt đập niêu', act: () => ACT.ttNieu() });
  // kéo co: hai đội trên sân bóng mini
  const [kx, ky] = K.keoco;
  [-60, -44, -28, 28, 44, 60].forEach((dx, i) => NPCS.push({ id: 'ttc_' + i, name: i < 3 ? 'Đội Hoa Phượng' : 'Đội Bờ Sông', look: ['c1', 'c4', 'x1', 'c7', 'c2', 'x3'][i], outfit: () => ['cas_dat', 'cas_ngan', 'cas_khoa', 'cas_dat', 'cas_vy', 'cas_khoa'][i], map: 'pho', x: kx + dx, y: ky, dir: i < 3 ? 2 : 1, vis: ttOn,
    pos: () => ({ x: kx + dx + Math.round(Math.sin(performance.now() / 300) * 2), y: ky, dir: i < 3 ? 2 : 1 }), label: () => 'Kéo co — vào đội Hoa Phượng', act: () => ACT.ttKeoco() }));
  NPCS.push({ id: 'ttc_ref', name: 'Trọng tài', look: 'c5', outfit: () => 'cas_khoa', map: 'pho', x: kx, y: ky - 26, dir: 0, vis: ttOn, label: () => 'Trọng tài kéo co', act: () => ACT.ttKeoco() });
  // trẻ con cầm đèn ông sao, người xem hội
  TT_KIDS.forEach(([a, b], i) => NPCS.push({ id: 'ttk_' + i, name: 'Bạn nhỏ rước đèn', look: ['c1', 'c2', 'c3', 'c4', 'c6', 'c8', 'x1', 'x3'][i], outfit: () => ['cas_dat', 'cas_vy', 'cas_khoa', 'cas_ngan'][i % 4], map: 'pho', x: a, y: b, dir: i % 4, wander: 28, vis: ttOn, label: () => 'Bạn nhỏ cầm đèn ông sao', act: () => UI.ask('Bạn nhỏ', `<p>“${['Đèn ông sao của em đẹp không anh chị?', 'Lát nữa rước đèn em đi đầu nha!', 'Em mới đập niêu trúng được kẹo nè!', 'Múa lân sắp bắt đầu chưa ạ?'][i % 4]}”</p>`, ['Đẹp lắm!'], { who: { look: ['c1', 'c2', 'c3', 'c4', 'c6', 'c8', 'x1', 'x3'][i] } }) }));
  [[424, 384, 'c7', 'cas_dat'], [468, 394, 'c2', 'cas_vy'], [612, 392, 'c4', 'cas_ngan'], [280, 300, 'c3', 'cas_khoa']].forEach(([a, b, look, of], i) => NPCS.push({ id: 'ttp_' + i, name: 'Người xem hội', look, outfit: () => of, map: 'pho', x: a, y: b, dir: i % 2 ? 3 : 0, vis: ttOn, label: () => 'Người xem hội — trò chuyện', act: () => ttChat(i, look, of) }));
  // bạn bè (không đi cùng mình) cũng ra phố chơi Trung thu · bố mẹ (nếu cả nhà cùng đi)
  for (const fid in TT_FRIEND_AT) { const [a, b] = TT_FRIEND_AT[fid]; NPCS.push({ id: 'tt_' + fid, fid, name: FRIENDS[fid].name, look: fid, outfit: () => friendOutfit(fid), map: 'pho', x: a, y: b, dir: 0, wander: 10, vis: () => ttOn() && !(G.comp && G.comp.fid === fid) && !sceneHides('tt_' + fid), label: () => `${FRIENDS[fid].name} — đang chơi Trung thu`, act: () => talkMenu(fid, 'pho') }); }
  NPCS.push({ id: 'tt_mom', name: 'Mẹ', look: 'mom', outfit: () => 'noapron', map: 'pho', x: 346, y: 300, dir: 0, vis: () => ttOn() && !!ttY().fam && !sceneHides('tt_mom'), label: () => 'Mẹ', act: () => UI.ask('Mẹ', '<p>“Đi chơi một vòng đi con. Lúc nào muốn xem múa lân thì ra gặp ông thị trưởng ở sân khấu nhé.”</p>', ['Dạ'], { who: { look: 'mom', outfit: 'noapron' } }) });
  NPCS.push({ id: 'tt_dad', name: 'Bố', look: 'dad', outfit: () => 'dadhome', map: 'pho', x: 326, y: 304, dir: 0, vis: () => ttOn() && !!ttY().fam && !sceneHides('tt_dad'), label: () => 'Bố', act: () => UI.ask('Bố', '<p>“Hồi bố bằng tuổi con, bố đập niêu giỏi nhất xóm đấy. Thử xem nào!”</p>', ['Dạ'], { who: { look: 'dad', outfit: 'dadhome' } }) });
}

/* ============================================================
 *  HỘI GÓI BÁNH CHƯNG ở sân trường (chiều ngày học cuối mùa đông): băng rôn, bàn trao giải, nồi luộc bánh, các tụ gói bánh
 * ============================================================ */
const BC_GROUPS = [
  { name: 'Tụ 10A1', at: [190, 320], ask: 'Ngồi đây gói cùng tụi tớ nè, lá dong rửa sạch rồi!', me: 'Gấp mép lá cho vuông nè… xong một cái!', mem: [{ look: 'khoa', fid: 'khoa' }, { look: 'c1', name: 'Minh · 10A1' }, { look: 'x1', name: 'Tú · 10A2' }] },
  { name: 'Tụ văn nghệ', at: [270, 300], ask: 'Vừa gói vừa hát cho vui nè, vào đây!', me: 'Một chiếc bánh xanh, buộc lạt thật chặt nào!', mem: [{ look: 'vy', fid: 'vy' }, { look: 'c4', name: 'Bạn lớp 10A1' }, { look: 'sB', soc: 'c_mai' }] },
  { name: 'Tụ 10A3', at: [360, 320], ask: 'Thiếu người buộc lạt, giúp tụi tớ với!', me: 'Lạt chéo hình chữ thập… chặt rồi!', mem: [{ look: 'dat', fid: 'dat' }, { look: 'c3', name: 'Bạn lớp 10A1' }, { look: 'x3', name: 'Bảo · 10A3' }] },
  { name: 'Tụ 10A2', at: [520, 190], ask: 'Ngồi xuống đi, tớ chỉ cách gấp lá cho đẹp!', me: 'Bánh này vuông nhất tụ luôn!', mem: [{ look: 'ngan', fid: 'ngan' }, { look: 'c6', name: 'Bạn lớp 10A1' }, { look: 'x2', name: 'Linh · 10A2' }] },
  { name: 'Tụ khối 12', at: [640, 196], ask: 'Em lớp 10 hả? Vào đây anh chị chỉ gói!', me: 'Em gói xong rồi, anh chị xem có đẹp không!', mem: [{ look: 'sA', soc: 'a_hung' }, { look: 'c5', name: 'Anh lớp 12A1' }, { look: 'c8', name: 'Chị lớp 12A2' }] },
  { name: 'Tụ khối 11', at: [600, 300], ask: 'Gói nhanh rồi còn đem luộc nữa, phụ chị với!', me: 'Thêm một chiếc nữa cho nồi bánh!', mem: [{ look: 'sD', soc: 'c_thao' }, { look: 'c7', name: 'Anh lớp 11A1' }, { look: 'x4', name: 'Nhi · 10A4' }] },
];
const BC_TEACHERS = [['hanh', 220, 296, 'Gói bánh chưng là nét đẹp ngày Tết đấy em. Lá phải gấp thật vuông mới đẹp.'], ['tung', 392, 300, 'Một chiếc bánh vuông có bốn góc vuông — Toán học ở khắp nơi, em thấy không?'], ['lan', 560, 176, 'In English, bánh chưng is a “square sticky rice cake”. Remember that!'], ['manh', 468, 344, 'Nồi bánh phải canh lửa cả đêm đấy. Nhìn thì nhẹ nhưng mệt lắm!']];
const BC_ALL = ['bc_principal'];
const bcFestOn = () => !!G && !!RT.bcFest && G.map === 'school';
function buildBcFest() {
  const m = MAPS.school;
  SPR.bccup = iconCv('cup');
  addObj(m, { s: 'bcbanner', x: 230, y: 112, sol: [0, 28, 4, 6], vis: bcDecor }); addObj(m, { s: 'blank', x: 326, y: 140, sol: [0, 0, 4, 6], vis: bcDecor });
  m.labels.push({ x: 280, y: 121, text: 'HỘI GÓI BÁNH CHƯNG', size: 5.4, col: '#ffe066', maxw: 88, vis: bcDecor });
  addObj(m, { s: 'tdesk', x: 290, y: 148, sol: [1, 2, 32, 19], vis: bcDecor }); addObj(m, { s: 'bccup', x: 297, y: 136, base: 175, vis: bcDecor });
  addObj(m, { s: 'noibanh0', x: 420, y: 318, sol: [0, 20, 34, 10], smoke: [16, 0], dyn: () => 'noibanh' + (Math.floor(performance.now() / 260) % 2), vis: bcDecor, label: () => 'Nồi luộc bánh chưng', act: () => UI.toast('Nồi bánh sôi lục bục, thơm mùi lá dong. Phải luộc cả đêm mới chín!') });
  for (const [a, b] of [[160, 236], [400, 236], [480, 150]]) addObj(m, { s: 'bunting', x: a, y: b, base: 900, vis: bcDecor });
  BC_GROUPS.forEach((T, i) => {
    const [cx, cy] = T.at;
    addObj(m, { s: 'bctable', x: cx - 18, y: cy - 10, sol: [0, 4, 36, 12], vis: bcFestOn, label: () => `${T.name} — ngồi gói bánh cùng`, act: () => ACT.bcTable(i) });
    T.mem.forEach((mm, k) => {
      const key = 'bc_' + mm.look, F = mm.fid && FRIENDS[mm.fid], S = mm.soc && SOCIETY[mm.soc], name = F ? F.name : S ? S.name : mm.name;
      const [x, y, d] = [[cx - 22, cy + 4, 2], [cx + 22, cy + 4, 1], [cx, cy + 16, 3]][k];
      BC_ALL.push(key); mm.of = null;
      NPCS.push({ id: key, sid: key, fid: mm.fid || null, soc: mm.soc, name, look: mm.look, map: 'school', x, y, dir: d, vis: () => bcFestOn() && !sceneHides(key), label: () => `${name} — đang gói bánh`, act: () => (F ? talkMenu(mm.fid, 'school') : S ? ACT.senior(mm.soc) : UI.ask(name, `<p>“${['Gói bánh vui ghê!', 'Lá dong phải lau khô mới gói được đó.', 'Chiếc này để biếu cô chủ nhiệm nè.'][k]}”</p>`, ['Ừ!'], { who: { look: mm.look } })) });
    });
  });
  for (const [tid, x, y, line] of BC_TEACHERS) NPCS.push({ id: 'bct_' + tid, tid, name: TEACHERS[tid].name, look: TEACHERS[tid].look, map: 'school', x, y, dir: 0, wander: 8, vis: () => bcFestOn(), label: () => `${TEACHERS[tid].name} — trò chuyện`, act: () => bcTeacherTalk(tid, line) });
  NPCS.push({ id: 'bc_principal', sid: 'bc_principal', soc: 'hieutruong', name: 'Thầy hiệu trưởng', look: 'principal', map: 'school', x: 272, y: 174, dir: 0, vis: () => bcFestOn() && !sceneHides('bc_principal'), label: () => 'Thầy hiệu trưởng — đăng ký thi gói bánh chưng', act: () => ACT.principal() });
}
// tay gói lá dong ở các tụ
function drawBcProps(now) {
  if (!bcFestOn() || (RT.scene && RT.scene.hide && RT.scene.hide.includes('bc_principal'))) return;
  const f = Math.floor(now / 280);
  BC_GROUPS.forEach((T, i) => { const [cx, cy] = T.at; for (let k = 0; k < 3; k++) if ((f + i + k) % 3) { const [x, y] = [[cx - 14, cy - 2], [cx + 12, cy - 2], [cx - 2, cy + 4]][k]; wRect('#3f8f3a', x, y, 4, 3); } });
}
