'use strict';
/* ============================================================
 *  03b. CÁC PHÒNG & KHÔNG GIAN TRONG NHÀ
 *  Trong trường: Trạm y tế · Phòng nhạc · Thư viện · Phòng ngủ trưa · Khu vệ sinh (cửa nằm trên dãy nhà chính)
 *  Phố Hoa Phượng: bên trong TTTM (các gian hàng) · bên trong khu game · nhà bạn (phòng khách + phòng riêng)
 *  Đồ trang trí phòng ngủ ở nhà (mua ở TTTM)
 * ============================================================ */
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
const SCHOOL_ROOMS = [['yte', 202, 'Y TẾ'], ['nhac', 264, 'NHẠC'], ['ngutrua', 419, 'NGỦ'], ['wcs', 481, 'WC']];

function buildRooms() {
  const sch = MAPS.school;
  /* ---------- cửa phòng trên dãy nhà trường ---------- */
  for (const [id, dx, text] of SCHOOL_ROOMS) {
    addObj(sch, { s: 'sdoor', x: dx, y: 64, base: 106 });
    sch.warps.push({ x: dx + 2, y: 102, w: 18, h: 12, dir: 3, to: { map: id, x: 289, y: 204, dir: 3 } });
    sch.labels.push({ x: dx + 11, y: 68.5, text, size: 4.2, col: '#2a2136', maxw: 15 });
  }
  addObj(sch, { s: 'sdoorBig', x: 332, y: 55, base: 106 });
  sch.labels.push({ x: 352, y: 59.5, text: 'THƯ VIỆN', size: 5, col: '#2a2136', maxw: 36 });
  sch.warps.push({ x: 342, y: 102, w: 20, h: 12, dir: 3, to: { map: 'thuvien', x: 289, y: 204, dir: 3 } });
  // thêm học sinh ra sân cho đông vui + cho mọi học sinh ngoài sân nhập vào các tụ chơi
  for (const [id, a, b] of [['x1', 150, 240], ['x2', 420, 300], ['x3', 260, 200], ['x4', 340, 330]]) NPCS.push({ id: 'y_' + id, sid: id, name: 'Bạn lớp bên', look: id, map: 'school', x: a, y: b, dir: 0, wander: 30, vis: () => yardTime() && !!yardPos(id), label: () => 'Bạn lớp bên', act: () => ACT.mate(id) });
  // học sinh ngoài sân: đứng theo tụ chơi; nói chuyện với bạn nào thì bạn đó hỏi có vào chơi cùng không
  for (const n of NPCS) if (n.id.startsWith('y_')) {
    n.pos = () => yardPos(n.sid); n.act0 = n.act; n.act = () => ACT.yardTalk(n);
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
  roomExit(m, { map: 'school', x: 352, y: 116, dir: 0 });

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

  /* ---------- KHU VỆ SINH: bồn rửa + các buồng ---------- */
  m = roomBase('wcs', 'Khu vệ sinh', '#e4eef7', '#a9c6dc', 'ltile');
  for (const mx of WC_MIRRORS) { R(m.x, '#2a2136', mx - 1, 5, 26, 21); R(m.x, '#c9ccd4', mx, 6, 24, 19); R(m.x, '#dff1fa', mx + 1, 7, 22, 17); R(m.x, '#eef8fd', mx + 1, 7, 22, 2); addObj(m, { s: 'wcsink', x: mx - 1, y: 26, sol: [1, 2, 24, 18], label: () => 'Bồn rửa — rửa mặt cho tỉnh', act: () => ACT.washFace() }); }
  for (let i = 0; i < 5; i++) addObj(m, { s: 'toiletdoor', x: 140 + i * 30, y: 2, base: 0, ir: [0, 0, 20, 40], label: () => 'Buồng vệ sinh', act: () => ACT.stall(i) });
  addObj(m, { s: 'plant', x: 20, y: 180, sol: [2, 14, 12, 9] });
  roomExit(m, { map: 'school', x: 492, y: 116, dir: 0 });

  /* ---------- BÊN TRONG TTTM: mỗi gian hàng bán một loại ---------- */
  m = roomBase('tttm', 'TTTM Hoa Phượng Plaza', '#eef3f8', '#b9c9dc', 'ltile', 28, 16);
  MALL_STALLS.forEach(([id, name, spr], k) => {
    const a = 18 + k * 58;
    addObj(m, { s: spr, x: a, y: 8, sol: [1, 24, 52, 22], label: () => name, act: () => ACT.stallShop(id) });
    m.labels.push({ x: a + 27, y: 47.5, text: name.toUpperCase(), size: 4.6, col: '#2a2136', maxw: 50 });
  });
  addObj(m, { s: 'fountain', x: 200, y: 130, sol: [2, 8, 42, 20] });
  for (const [a, b] of [[110, 136], [300, 136], [110, 190], [300, 190]]) addObj(m, { s: 'bench', x: a, y: b, sol: [1, 1, 28, 12] });
  for (const a of [20, 400]) addObj(m, { s: 'plant', x: a, y: 200, sol: [2, 14, 12, 9] });
  NPCS.push({ id: 'mall_a', name: 'Khách', look: 'c6', outfit: () => 'cas_ngan', map: 'tttm', x: 150, y: 110, dir: 0, wander: 40 });
  NPCS.push({ id: 'mall_b', name: 'Khách', look: 'c7', outfit: () => 'cas_khoa', map: 'tttm', x: 330, y: 170, dir: 1, wander: 40 });
  roomExit(m, { map: 'pho', x: 660, y: 138, dir: 0 });

  /* ---------- BÊN TRONG KHU GAME ---------- */
  m = roomBase('arc', 'Khu game Arcade', '#2c2347', '#ff5fa8', 'dtile');
  for (let i = 0; i < 18; i++) R(m.x, i % 2 ? '#ffe066' : '#5fe0f0', 20 + i * 16, 22, 3, 3);
  addObj(m, { s: 'stE', x: 20, y: 8, sol: [1, 24, 52, 22], label: () => 'Quầy đổi xèng', act: () => ACT.tokens() });
  m.labels.push({ x: 47, y: 47.5, text: 'ĐỔI XÈNG', size: 4.6, col: '#2a2136', maxw: 50 });
  for (const [spr, a, kind, name] of [['cabClaw', 88, 'claw', 'Máy gắp thú'], ['cabFight', 122, 'fight', 'Game đối kháng'], ['cabFight', 146, 'fight', 'Game đối kháng'], ['cabSlot', 178, 'slot', 'Máy may rủi'], ['cabRace', 210, 'race', 'Game thùng đua xe'], ['cabRace', 234, 'race', 'Game thùng đua xe'], ['cabDance', 268, 'dance', 'Máy nhảy']])
    addObj(m, { s: spr, x: a, y: 4, sol: [1, 14, 20, 22], label: () => name, act: () => ACT.machine(kind) });
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

  /* ---------- đồ trang trí phòng ngủ ở nhà (mua ở gian Nội thất, Nhạc cụ) ---------- */
  const h = MAPS.home, own = k => () => !!G && !!G.owned[k];
  addObj(h, { s: 'poster', x: 24, y: 8, base: 0, vis: own('d_poster') });
  addObj(h, { s: 'floorlamp', x: 128, y: 150, sol: [3, 22, 6, 6], vis: own('d_den') });
  addObj(h, { s: 'plant', x: 104, y: 194, sol: [2, 14, 12, 9], vis: own('d_cay') });
  addObj(h, { s: 'rug', x: 66, y: 166, flat: true, vis: own('d_tham') });
  addObj(h, { s: 'guitar', x: 112, y: 50, sol: [2, 18, 6, 8], vis: own('guitar') });
  addObj(h, { s: 'mic', x: 132, y: 96, sol: [2, 16, 6, 6], ir: [-8, 0, 24, 30], vis: own('micro'), label: () => 'Micro — tập hát ở nhà', act: () => ACT.music('home') });
}
