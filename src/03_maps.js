'use strict';
/* ============================================================
 *  03. BẢN ĐỒ — Nhà · Khu phố · Phố Hoa Phượng · Trường · Lớp học · Phòng thí nghiệm · Núi · Bờ sông · Ga tàu · Bãi biển
 *  Toạ độ tính bằng pixel game (1 ô = 16px).
 * ============================================================ */
const MAPS = {};
const NPCS = [];
function mapNew(id, name, w, h, indoor) {
  const m = { id, name, w, h, pw: w * 16, ph: h * 16, indoor, solid: new Uint8Array(w * h), tile: new Array(w * h), g: mk(w * 16, h * 16), objs: [], warps: [], zones: [], labels: [], solids: [] };
  m.x = cx(m.g); MAPS[id] = m; return m;
}
function paint(m, kind, tx, ty, tw, th, solid) {
  for (let j = 0; j < th; j++) for (let i = 0; i < tw; i++) {
    GROUND[kind](m.x, (tx + i) * 16, (ty + j) * 16, tx + i, ty + j);
    m.tile[(ty + j) * m.w + tx + i] = kind;
    if (solid !== undefined) m.solid[(ty + j) * m.w + tx + i] = solid ? 1 : 0;
  }
}
// o: {s: tên sprite, x, y, sol:[dx,dy,w,h] vùng chặn, ir: vùng tương tác (mặc định = sol), flat, act, label, vis, dyn}
function addObj(m, o) {
  const spr = SPR[o.s]; o.w = spr.width; o.h = spr.height;
  if (o.base === undefined) o.base = o.flat ? o.y - 1000 : o.y + o.h - 1;
  m.objs.push(o); return o;
}
function wallFace(m, px, py, w, h, col, lower) {
  const x = m.x;
  R(x, col, px, py, w, h); R(x, shade(col, 12), px, py + 5, w, 1);
  if (lower) { R(x, lower, px, py + h - 14, w, 11); R(x, shade(lower, 16), px, py + h - 14, w, 1); }
  R(x, shade(col, -30), px, py + h - 3, w, 3);
  R(x, '#3f354c', px, py, w, 5); R(x, '#57496b', px, py, w, 1);
}

/* ---------------- NHÀ ---------------- */
// Phòng ngủ | Phòng khách (TV, sofa, bàn làm việc của bố, cửa phòng bố mẹ) | Bếp
function buildHome() {
  const m = mapNew('home', 'Nhà', 30, 15, true);
  paint(m, 'void', 0, 0, 30, 15, 1);
  paint(m, 'wood', 1, 2, 8, 12, 0); paint(m, 'wood', 10, 2, 12, 12, 0); paint(m, 'ktile', 23, 2, 6, 12, 0);
  wallFace(m, 16, 0, 128, 32, '#cfe0ea'); wallFace(m, 160, 0, 192, 32, '#f3e7cc'); wallFace(m, 368, 0, 96, 32, '#dcebd2');
  paint(m, 'walltop', 0, 0, 1, 15, 1); paint(m, 'walltop', 29, 0, 1, 15, 1); paint(m, 'walltop', 0, 14, 30, 1, 1);
  for (const [col, g0] of [[9, 8], [22, 6]]) {
    paint(m, 'walltop', col, 0, 1, 14, 1); paint(m, 'wood', col, g0, 1, 2, 0);
    R(m.x, '#d9ccb2', col * 16, g0 * 16 - 10, 16, 10); R(m.x, '#a8997e', col * 16, g0 * 16 - 3, 16, 3);
    R(m.x, '#57496b', col * 16, (g0 + 2) * 16, 16, 1);
  }
  // cửa ra vào (cột 13-14, hàng 14)
  paint(m, 'wood', 13, 14, 2, 1, 0); R(m.x, '#8a5a3a', 208, 236, 32, 4); R(m.x, '#3f354c', 206, 224, 2, 16); R(m.x, '#3f354c', 240, 224, 2, 16);
  m.x.drawImage(SPR.doormat, 210, 212);
  drawWin(m.x, 70, 9, 18, 13); drawWin(m.x, 322, 9, 18, 13); drawWin(m.x, 404, 8, 18, 11);
  addObj(m, { s: 'calendar', x: 52, y: 8, base: 0, ir: [-3, 0, 20, 36], label: () => 'Lịch treo tường — xem ngày tháng, sinh nhật, lịch kiểm tra', act: () => UI.calendar() });
  drawDoor(m.x, 250, 7, 16, 25, '#a9703f');                       // cửa phòng bố mẹ
  R(m.x, '#8a5a3a', 173, 9, 14, 11); R(m.x, '#fff3c8', 174, 10, 12, 9); R(m.x, '#e98fa5', 176, 13, 3, 4); R(m.x, '#6f8fb8', 181, 13, 3, 4);   // ảnh gia đình
  // phòng ngủ
  addObj(m, { s: 'rugBlue', x: 62, y: 104, flat: true });
  addObj(m, { s: 'bed', x: 17, y: 24, sol: [1, 4, 32, 42], label: () => 'Giường — đi ngủ', act: () => ACT.bed() });
  addObj(m, { s: 'desk', x: 58, y: 24, sol: [1, 2, 34, 25], label: () => 'Bàn học — soạn cặp, tự học', act: () => ACT.desk() });
  addObj(m, { s: 'chair', x: 70, y: 49, sol: [1, 1, 12, 11] });
  addObj(m, { s: 'wardrobe', x: 95, y: 6, sol: [1, 10, 30, 29] });
  addObj(m, { s: 'shelf', x: 126, y: 12, sol: [1, 8, 16, 25] });
  addObj(m, { s: 'mat', x: 24, y: 150, flat: true, label: () => 'Thảm tập — chạy tại chỗ, hít đất', act: () => ACT.exercise('tay') });
  addObj(m, { s: 'plant', x: 20, y: 194, sol: [2, 14, 12, 9] });
  // phòng khách
  addObj(m, { s: 'rug', x: 188, y: 60, flat: true });
  addObj(m, { s: 'broom', x: 163, y: 22, sol: [1, 16, 16, 11], label: () => choreLabel('quetnha'), act: () => ACT.chore('quetnha') });
  addObj(m, { s: 'tvcab', x: 195, y: 19, sol: [1, 12, 38, 17], label: () => tvLabel(), act: () => ACT.tv() });
  addObj(m, { s: 'workdesk', x: 282, y: 22, sol: [1, 2, 34, 25] });
  addObj(m, { s: 'chair', x: 293, y: 50, sol: [1, 1, 12, 11] });
  addObj(m, { s: 'plant', x: 334, y: 196, sol: [2, 14, 12, 9] });
  addObj(m, { s: 'plant', x: 164, y: 196, sol: [2, 14, 12, 9] });
  addObj(m, { s: 'sofa', x: 191, y: 104, sol: [1, 6, 46, 15] });
  // bếp
  addObj(m, { s: 'stove', x: 368, y: 20, sol: [1, 4, 16, 23] });
  addObj(m, { s: 'counter', x: 384, y: 20, sol: [1, 4, 16, 23] });
  addObj(m, { s: 'sink', x: 400, y: 20, sol: [1, 4, 16, 23], label: () => choreLabel('ruabat'), act: () => ACT.chore('ruabat') });
  addObj(m, { s: 'counter', x: 416, y: 20, sol: [1, 4, 16, 23] });
  addObj(m, { s: 'counter', x: 432, y: 20, sol: [1, 4, 16, 23] });
  addObj(m, { s: 'lunchbox', x: 421, y: 21, base: 60, ir: [0, 0, 12, 28], vis: () => lunchboxAvail(), label: () => 'Cơm hộp mẹ nấu — mang đi ăn trưa', act: () => ACT.lunchbox() });
  addObj(m, { s: 'fridge', x: 447, y: 12, sol: [1, 12, 16, 23] });
  addObj(m, { s: 'table', x: 394, y: 112, sol: [1, 2, 44, 26], dyn: () => (mealNow() ? 'tableFood' : 'table'), label: () => mealLabel(), act: () => ACT.table() });
  addObj(m, { s: 'stool', x: 380, y: 122 }); addObj(m, { s: 'stool', x: 442, y: 122 });
  m.warps.push({ x: 208, y: 230, w: 32, h: 10, dir: 0, to: { map: 'town', x: 96, y: 140, dir: 0 } });
}

/* ---------------- KHU PHỐ ---------------- */
function buildTown() {
  const m = mapNew('town', 'Khu phố', 50, 26, false);
  paint(m, 'grass', 0, 0, 50, 26, 0);
  [[2, 3], [14, 2], [10, 8], [2, 8], [15, 7], [20, 3], [27, 1], [34, 4], [41, 2], [48, 6], [3, 19], [12, 23], [19, 19], [29, 24], [31, 19], [14, 19], [21, 24], [8, 18], [28, 22]].forEach(([a, b]) => paint(m, 'flowers', a, b, 1, 1, 0));
  paint(m, 'walk', 0, 10, 50, 2, 0); paint(m, 'road', 0, 12, 50, 3, 0); paint(m, 'walk', 0, 15, 50, 2, 0);
  paint(m, 'walk', 18, 8, 17, 2, 0); paint(m, 'dirt', 5, 8, 2, 2, 0);
  for (let i = 0; i < 50; i += 2) R(m.x, '#f3e6a8', i * 16 + 4, 13 * 16 + 7, 12, 2);
  for (let k = 0; k < 6; k++) R(m.x, '#f4f2ea', 22 * 16 + 2, 12 * 16 + 2 + k * 8, 28, 4);
  R(m.x, '#aaa392', 0, 190, 800, 2); R(m.x, '#aaa392', 0, 240, 800, 2);
  // công viên
  paint(m, 'dirt', 23, 17, 3, 9, 0); paint(m, 'dirt', 11, 21, 23, 1, 0);
  ell(m.x, '#9cc48a', 110, 372, 48, 26); ell(m.x, '#5fb0e0', 110, 372, 44, 22); ell(m.x, '#8fd0f0', 100, 366, 26, 9); ell(m.x, '#5fb0e0', 104, 368, 18, 5);
  ell(m.x, '#5fae4a', 132, 380, 5, 3); ell(m.x, '#5fae4a', 84, 384, 4, 2.4); R(m.x, '#ff8fa8', 132, 379, 2, 1);
  m.solids.push([70, 354, 80, 36]);
  paint(m, 'court', 34, 18, 13, 7, 0);
  const W = '#eef7ee'; R(m.x, W, 548, 292, 200, 1); R(m.x, W, 548, 395, 200, 1); R(m.x, W, 548, 292, 1, 104); R(m.x, W, 747, 292, 1, 104); R(m.x, W, 548, 344, 200, 1); ring(m.x, W, 648, 344, 14);
  // hàng rào quanh sân nhà
  for (let i = 0; i <= 17; i++) addObj(m, { s: 'hedge', x: i * 16, y: 2, sol: [0, 4, 18, 12] });
  for (let j = 1; j <= 8; j++) { addObj(m, { s: 'hedge', x: 0, y: 2 + j * 16, sol: [0, 4, 18, 12] }); addObj(m, { s: 'hedge', x: 272, y: 2 + j * 16, sol: [0, 4, 18, 12] }); }
  for (let i = 1; i <= 16; i++) { if (i === 5 || i === 6) continue; addObj(m, { s: 'fence', x: i * 16 - 1, y: 143, sol: [0, 8, 18, 8] }); }
  // nhà mình + sân
  addObj(m, { s: 'house', x: 47, y: 47, sol: [1, 30, 96, 51] });
  m.warps.push({ x: 88, y: 126, w: 16, h: 12, dir: 3, to: { map: 'home', x: 224, y: 218, dir: 3 } });
  addObj(m, { s: 'tree', x: 228, y: 14, sol: [13, 38, 10, 9] });
  addObj(m, { s: 'mailbox', x: 50, y: 118, sol: [1, 10, 10, 9] });
  // xe của mẹ và bố: chỉ có ở sân khi bố mẹ ở nhà
  addObj(m, { s: 'motoMom', x: 118, y: 112, sol: [2, 10, 28, 10], vis: () => !G || !FAM.mom.bikeAway, label: () => choreLabel('ruaxe'), act: () => ACT.chore('ruaxe', 133) });
  addObj(m, { s: 'moto', x: 152, y: 112, sol: [2, 10, 28, 10], vis: () => !G || !FAM.dad.bikeAway, label: () => choreLabel('ruaxe'), act: () => ACT.chore('ruaxe', 167) });
  addObj(m, { s: 'weeds', x: 186, y: 84, vis: () => !G || !G.daily.chores.nhoco, label: () => choreLabel('nhoco'), act: () => ACT.chore('nhoco') });
  addObj(m, { s: 'weeds', x: 22, y: 96, vis: () => !G || !G.daily.chores.nhoco });
  // xe của mình để ở sân: bấm vào xe để lên xe đi (chạy nhanh hơn đi bộ)
  for (const [id, a, b] of [['bike', 192, 120], ['ebike', 222, 116], ['moto', 232, 90]]) {
    const V = VEHICLES[id];
    addObj(m, { s: V.spr, x: a, y: b, sol: V.sol, vis: () => vehAtHome(id), label: () => `${V.name} — lên xe`, act: () => ACT.mount(id) });
  }
  // dãy phố
  addObj(m, { s: 'shop', x: 303, y: 51, sol: [1, 24, 96, 53], label: () => 'Tạp hoá Cô Ba — mua đồ, phụ bán hàng', act: () => ACT.shop() });
  addObj(m, { s: 'center', x: 431, y: 51, sol: [1, 24, 96, 53], label: () => 'Trung tâm Sao Mai — đăng ký học thêm', act: () => ACT.center() });
  // nhà cô chủ nhiệm và thầy Tùng (ngày Tết tới chúc Tết)
  addObj(m, { s: 'houseB', x: 575, y: 47, sol: [1, 30, 96, 51], label: () => 'Nhà cô Hạnh (cô chủ nhiệm)', act: () => ACT.teacherHouse('hanh') });
  addObj(m, { s: 'houseC', x: 687, y: 47, sol: [1, 30, 96, 51], label: () => 'Nhà thầy Tùng', act: () => ACT.teacherHouse('tung') });
  addObj(m, { s: 'bush', x: 405, y: 113, sol: [2, 4, 18, 9] }); addObj(m, { s: 'tree2', x: 533, y: 80, sol: [13, 38, 10, 9] });
  addObj(m, { s: 'treePink', x: 292, y: 4, sol: [13, 38, 10, 9] }); addObj(m, { s: 'tree', x: 404, y: 2, sol: [13, 38, 10, 9] }); addObj(m, { s: 'treeOrange', x: 534, y: 6, sol: [13, 38, 10, 9] });
  m.labels.push({ x: 352, y: 66.5, text: 'TẠP HOÁ CÔ BA', size: 8.5, col: '#2a2136', maxw: 78 });
  m.labels.push({ x: 480, y: 67.5, text: 'HỌC THÊM SAO MAI', size: 7.5, col: '#ffffff', maxw: 78 });
  for (const lx of [286, 520, 742]) addObj(m, { s: 'lamp', x: lx, y: 112, sol: [3, 38, 6, 6] });
  addBusStop(m, 'home', 608, 146, 590, 188);
  addObj(m, { s: 'signpost', x: 766, y: 148, sol: [10, 22, 8, 8], label: () => 'Phố Hoa Phượng → (đi tiếp nữa là tới trường)', act: () => ACT.go('town', 'pho') });
  m.zones.push({ x: 792, y: 160, w: 8, h: 112, fn: () => ACT.go('town', 'pho'), bx: -6 });
  // công viên
  for (let i = 0; i < 50; i++) { if ((i >= 23 && i <= 25) || i === 10 || i === 11) continue; addObj(m, { s: 'hedge', x: i * 16, y: 270, sol: [0, 4, 18, 12] }); }
  paint(m, 'dirt', 10, 17, 2, 9, 0);                                  // lối mòn xuống chùa
  addObj(m, { s: 'trailsign', x: 194, y: 378, sol: [9, 16, 6, 8], label: () => '↓ Chùa Hoa Phượng (thắp nhang, xin xăm)', act: () => ACT.go('town', 'chua') });
  m.zones.push({ x: 160, y: 408, w: 32, h: 8, fn: () => ACT.go('town', 'chua'), by: -10 });
  for (const [s, a, b] of [['tree', 24, 290], ['treePink', 116, 282], ['tree2', 250, 286], ['treeOrange', 300, 356], ['treePink', 436, 282], ['tree', 480, 352], ['treePink', 506, 284], ['tree2', 190, 362]]) addObj(m, { s, x: a, y: b, sol: [13, 38, 10, 9] });
  addObj(m, { s: 'bench', x: 318, y: 316, sol: [1, 1, 28, 12] }); addObj(m, { s: 'bench', x: 420, y: 356, sol: [1, 1, 28, 12] });
  addObj(m, { s: 'goal', x: 628, y: 276, sol: [1, 2, 38, 8], label: () => 'Sân bóng công viên — chơi thể thao', act: () => ACT.field() });
  addObj(m, { s: 'ball', x: 664, y: 336, flat: true });
  addObj(m, { s: 'bush', x: 30, y: 350, sol: [2, 4, 18, 9] }); addObj(m, { s: 'bush', x: 118, y: 398, sol: [2, 4, 18, 9] });
  const parkT = () => parkTime();
  for (const [fid, a, b, d, wd] of [['khoa', 636, 348, 0, 26], ['dat', 694, 368, 1, 26], ['vy', 338, 344, 0, 14], ['ngan', 452, 340, 0, 12]]) {
    const F = FRIENDS[fid];
    NPCS.push({ id: 'p_' + fid, fid, name: F.name, look: fid, outfit: () => friendOutfit(fid), map: 'town', x: a, y: b, dir: d, wander: wd, vis: () => parkT() && !meetToday(fid) && !isComp(fid), label: () => F.name, act: () => ACT.friend(fid, 'park') });
  }
}
const friendOutfit = fid => (schoolToday() ? null : 'cas_' + fid);
const busHere = () => !G || inWin(G.time, BUS_HOURS[0], BUS_HOURS[1]);
// Trạm xe bus: nhà chờ + biển báo + chiếc xe bus đỗ sẵn ở bến (bấm vào xe để lên xe, chọn điểm đến)
function addBusStop(m, id, sx, sy, bx, by, noSol) {
  addObj(m, { s: 'busshelter', x: sx, y: sy, sol: [1, 26, 44, 10], label: () => 'Trạm xe bus — ' + BUS_STOPS[id].name, act: () => ACT.bus(id) });
  addObj(m, { s: 'bussign', x: sx + 52, y: sy + 4, sol: [4, 24, 6, 8] });
  addObj(m, { s: 'bus', x: bx, y: by, sol: noSol ? undefined : [2, 14, 70, 16], ir: [0, 6, 74, 28], vis: busHere, label: () => 'Xe bus — lên xe, chọn điểm đến', act: () => ACT.bus(id) });
}

/* ---------------- PHỐ HOA PHƯỢNG (trung tâm thành phố): nhà bạn bè · trà sữa · TTTM · khu game ----------------
 * Trái: về khu phố nhà mình · Phải: sang trường · Trên: ga tàu · Dưới: bờ sông */
const FRIEND_HOUSE = { khoa: ['houseB', 12], dat: ['houseC', 120], vy: ['houseD', 228], ngan: ['houseE', 336] };
function buildPho() {
  const m = mapNew('pho', 'Phố Hoa Phượng', 56, 26, false);
  paint(m, 'grass', 0, 0, 56, 26, 0);
  [[1, 2], [7, 1], [13, 3], [20, 2], [25, 1], [33, 3], [54, 5], [54, 2], [1, 19], [17, 23], [18, 19], [36, 20], [37, 24], [47, 19], [50, 23], [53, 21], [45, 24]].forEach(([a, b]) => paint(m, 'flowers', a, b, 1, 1, 0));
  paint(m, 'walk', 0, 8, 56, 4, 0); paint(m, 'road', 0, 12, 56, 3, 0); paint(m, 'walk', 0, 15, 56, 2, 0);
  paint(m, 'walk', 27, 0, 3, 8, 0);                                   // đường lên ga tàu
  for (let i = 0; i < 56; i += 2) R(m.x, '#f3e6a8', i * 16 + 4, 13 * 16 + 7, 12, 2);
  for (let k = 0; k < 6; k++) R(m.x, '#f4f2ea', 27 * 16 + 10, 12 * 16 + 2 + k * 8, 28, 4);
  R(m.x, '#aaa392', 0, 190, 896, 2); R(m.x, '#aaa392', 0, 240, 896, 2);
  // dãy nhà bạn bè
  for (const fid in FRIEND_HOUSE) {
    const [spr, hx] = FRIEND_HOUSE[fid], F = FRIENDS[fid];
    addObj(m, { s: spr, x: hx, y: 47, sol: [1, 30, 96, 51], label: () => 'Nhà bạn — bấm chuông', act: () => ACT.house(fid) });
    NPCS.push({ id: 'h_' + fid, fid, name: F.name, look: fid, outfit: () => friendOutfit(fid), map: 'pho', x: hx + 49, y: 144, dir: 0, wander: 8, vis: () => friendHome(fid), label: () => F.name + ' — đang ở trước nhà', act: () => ACT.friend(fid, 'house') });
  }
  // dãy vui chơi
  addObj(m, { s: 'teashop', x: 484, y: 51, sol: [1, 24, 80, 53], label: () => PLACES.tea.name + ' — uống trà sữa', act: () => ACT.tea() });
  m.labels.push({ x: 525, y: 67.5, text: 'TRÀ SỮA MÂY', size: 8, col: '#b5677c', maxw: 62 });
  addObj(m, { s: 'mall', x: 572, y: 23, sol: [1, 30, 176, 75], label: () => PLACES.mall.name + ' — vào trong', act: () => ACT.enter('mall') });
  m.labels.push({ x: 661, y: 44.5, text: 'HOA PHƯỢNG PLAZA', size: 9, col: '#ffffff', maxw: 128 });
  addObj(m, { s: 'arcade', x: 758, y: 51, sol: [1, 24, 96, 53], label: () => PLACES.arcade.name + ' — vào trong', act: () => ACT.enter('arcade') });
  m.labels.push({ x: 807, y: 68, text: 'GAME ARCADE', size: 8, col: '#ffe066', maxw: 76 });
  for (const lx of [112, 262, 416, 862]) addObj(m, { s: 'lamp', x: lx, y: 112, sol: [3, 38, 6, 6] });
  addObj(m, { s: 'treePink', x: 862, y: 10, sol: [13, 38, 10, 9] });
  addBusStop(m, 'pho', 196, 146, 176, 188);
  // bốn hướng
  addObj(m, { s: 'signpostL', x: 22, y: 148, sol: [10, 22, 8, 8], label: () => '← Khu phố nhà mình, tạp hoá Cô Ba', act: () => ACT.go('pho', 'town') });
  m.zones.push({ x: 0, y: 160, w: 8, h: 112, fn: () => ACT.go('pho', 'town'), bx: 6 });
  addObj(m, { s: 'signpost', x: 866, y: 150, sol: [10, 22, 8, 8], label: () => 'Trường THPT Hoa Phượng →', act: () => ACT.go('pho', 'school') });
  m.zones.push({ x: 888, y: 160, w: 8, h: 112, fn: () => ACT.go('pho', 'school'), bx: -6 });
  addObj(m, { s: 'trailsign', x: 406, y: 16, sol: [9, 16, 6, 8], label: () => '↑ Ga tàu (tàu ra biển)', act: () => ACT.go('pho', 'ga') });
  m.zones.push({ x: 432, y: 5, w: 48, h: 7, fn: () => ACT.go('pho', 'ga'), by: 10 });
  // phía dưới: sân bóng mini · quảng trường đài phun nước · xe xiên que · lối xuống bờ sông
  for (let i = 0; i < 56; i++) { if (i >= 26 && i <= 28) continue; addObj(m, { s: 'hedge', x: i * 16, y: 270, sol: [0, 4, 18, 12] }); }
  paint(m, 'court', 2, 18, 13, 7, 0);
  const W = '#eef7ee'; R(m.x, W, 36, 292, 200, 1); R(m.x, W, 36, 395, 200, 1); R(m.x, W, 36, 292, 1, 104); R(m.x, W, 235, 292, 1, 104); R(m.x, W, 36, 344, 200, 1); ring(m.x, W, 136, 344, 14);
  addObj(m, { s: 'goal', x: 116, y: 276, sol: [1, 2, 38, 8], label: () => 'Sân bóng mini — chơi thể thao', act: () => ACT.field() });
  addObj(m, { s: 'ball', x: 150, y: 338, flat: true });
  paint(m, 'yard', 20, 18, 15, 7, 0); paint(m, 'yard', 26, 17, 3, 1, 0); paint(m, 'yard', 26, 25, 3, 1, 0);
  addObj(m, { s: 'fountain', x: 366, y: 326, sol: [2, 8, 42, 20] });
  for (const [a, b] of [[344, 296], [498, 296], [344, 380], [498, 380]]) addObj(m, { s: 'bench', x: a, y: b, sol: [1, 1, 28, 12] });
  addObj(m, { s: 'trailsign', x: 470, y: 384, sol: [9, 16, 6, 8], label: () => '↓ Bờ sông (câu cá)', act: () => ACT.go('pho', 'song') });
  m.zones.push({ x: 416, y: 409, w: 48, h: 7, fn: () => ACT.go('pho', 'song'), by: -10 });
  addObj(m, { s: 'cart', x: 620, y: 290, sol: [1, 22, 38, 18], label: () => 'Xe xiên que, kem ốc quế', act: () => ACT.cart() });
  for (const [s2, a, b] of [['tree', 262, 286], ['treeOrange', 272, 356], ['treePink', 580, 352], ['tree2', 700, 292], ['treePink', 780, 348], ['tree', 840, 290], ['tree2', 690, 362]]) addObj(m, { s: s2, x: a, y: b, sol: [13, 38, 10, 9] });
  addObj(m, { s: 'bush', x: 600, y: 340, sol: [2, 4, 18, 9] }); addObj(m, { s: 'bush', x: 760, y: 300, sol: [2, 4, 18, 9] });
  addObj(m, { s: 'bench', x: 740, y: 380, sol: [1, 1, 28, 12] });
  NPCS.push({ id: 'pho_a', name: 'Người đi dạo', look: 'c7', outfit: () => 'cas_dat', map: 'pho', x: 300, y: 252, dir: 2, wander: 46, vis: () => inWin(G.time, 420, 1290) });
  NPCS.push({ id: 'pho_b', name: 'Người đi dạo', look: 'c6', outfit: () => 'cas_vy', map: 'pho', x: 600, y: 176, dir: 1, wander: 46, vis: () => inWin(G.time, 480, 1290) });
  NPCS.push({ id: 'pho_c', name: 'Người đi dạo', look: 'c3', outfit: () => 'cas_khoa', map: 'pho', x: 400, y: 304, dir: 0, wander: 22, vis: () => inWin(G.time, 540, 1260) });
}

/* ---------------- NÚI SAU TRƯỜNG: đường mòn, bãi cỏ picnic, hồ, đỉnh núi ---------------- */
// Lên núi: từ vỉa hè trước cổng trường, theo lối mòn vòng bên ngoài hàng rào ra phía sau khuôn viên
function buildHill() {
  const m = mapNew('nui', 'Núi sau trường', 40, 30, false), x = m.x;
  paint(m, 'grass2', 0, 0, 40, 30, 0);
  // bầu trời và cảnh phía xa nhìn từ đỉnh (không đi vào được)
  for (let i = 0; i < 40 * 4; i++) m.solid[i] = 1;
  R(x, '#a8dcf5', 0, 0, 640, 18); R(x, '#bfe6f7', 0, 18, 640, 14); R(x, '#d9f0f9', 0, 32, 640, 16);
  for (const [a, b, r1, r2] of [[80, 12, 22, 5], [96, 9, 12, 5], [250, 20, 26, 5], [236, 16, 14, 5], [520, 10, 24, 5], [540, 7, 12, 4], [400, 26, 16, 4]]) ell(x, '#ffffff', a, b, r1, r2);
  ell(x, '#9fd0b4', 110, 56, 130, 22); ell(x, '#8cc4a4', 420, 60, 170, 26); ell(x, '#b4dcc4', 620, 56, 90, 18);
  // ngôi trường bé xíu dưới chân núi
  R(x, '#c8583f', 292, 36, 44, 4); R(x, '#f4d273', 294, 40, 40, 7); R(x, '#fff6d8', 310, 38, 8, 9); R(x, '#8b8f9c', 340, 32, 1, 15); R(x, '#da251d', 341, 32, 5, 4);
  for (let i = 0; i < 6; i++) R(x, '#4f9a6b', 296 + i * 6, 42, 3, 3);
  paint(m, 'grass2', 0, 3, 40, 3);
  R(x, '#9c978c', 0, 48, 640, 7); R(x, '#b9b4a8', 0, 48, 640, 2); R(x, '#7f7a70', 0, 55, 640, 2);
  for (let i = 0; i < 40; i++) { R(x, '#8b5e3c', i * 16 + 7, 38, 2, 12); R(x, '#6f472c', i * 16 + 8, 38, 1, 12); }
  R(x, '#a8713f', 0, 41, 640, 2); R(x, '#a8713f', 0, 45, 640, 1);
  // đường mòn ngoằn ngoèo từ chân núi lên đỉnh
  paint(m, 'dirt', 19, 24, 2, 6, 0); paint(m, 'dirt', 8, 22, 13, 2, 0); paint(m, 'dirt', 8, 13, 2, 9, 0);
  paint(m, 'dirt', 8, 12, 20, 2, 0); paint(m, 'dirt', 26, 6, 2, 6, 0); paint(m, 'dirt', 23, 4, 9, 2, 0);
  // bãi cỏ picnic
  paint(m, 'grass', 11, 15, 8, 6, 0);
  [[11, 15], [18, 15], [14, 20], [11, 19], [17, 18]].forEach(([a, b]) => paint(m, 'flowers', a, b, 1, 1, 0));
  [[3, 9], [5, 17], [14, 8], [22, 17], [24, 26], [33, 9], [36, 24], [30, 23], [3, 25]].forEach(([a, b]) => paint(m, 'flowers2', a, b, 1, 1, 0));
  addObj(m, { s: 'picnicmat', x: 214, y: 276, flat: true, label: () => 'Bãi cỏ picnic', act: () => ACT.picnic() });
  // hồ nước + suối
  ell(x, '#9cc48a', 528, 290, 62, 40); ell(x, '#5fb0e0', 528, 290, 58, 36); ell(x, '#8fd0f0', 510, 280, 30, 10); ell(x, '#5fb0e0', 516, 283, 22, 6);
  ell(x, '#5fae4a', 560, 300, 6, 3); ell(x, '#5fae4a', 496, 306, 5, 2.6); R(x, '#ff8fa8', 560, 299, 2, 1);
  R(x, '#9cc48a', 566, 322, 14, 158); R(x, '#5fb0e0', 568, 322, 10, 158); for (let j = 0; j < 9; j++) R(x, '#8fd0f0', 570 + (j % 2) * 3, 330 + j * 17, 4, 1);
  m.solids.push([472, 258, 112, 64], [566, 322, 14, 158]);
  addObj(m, { s: 'rock', x: 448, y: 304, sol: [1, 3, 16, 9], label: () => 'Hồ nước — rửa mặt cho tỉnh táo', act: () => ACT.stream() });
  // đỉnh núi
  addObj(m, { s: 'summit', x: 478, y: 58, sol: [3, 20, 12, 8], vis: () => !sceneHides('nuiTop'), label: () => 'Đỉnh núi — ngắm cảnh', act: () => ACT.summit() });   // ẩn khi cả nhà đứng chụp ảnh bên lan can
  addObj(m, { s: 'bench', x: 388, y: 66, sol: [1, 1, 28, 12], vis: () => !sceneHides('nuiTop') });
  addObj(m, { s: 'trailsign', x: 348, y: 432, sol: [9, 16, 6, 8], label: () => 'Đường mòn — chạy bộ leo dốc', act: () => ACT.hike() });
  // cây thông, đá
  for (let j = 0; j < 9; j++) { addObj(m, { s: j % 2 ? 'pine2' : 'pine', x: 0, y: 46 + j * 46, sol: [10, 36, 12, 14] }); addObj(m, { s: j % 2 ? 'pine' : 'pine2', x: 608, y: 40 + j * 46, sol: [10, 36, 12, 14] }); }
  for (const [s2, a, b] of [['pine', 60, 70], ['pine2', 200, 62], ['pine', 300, 96], ['pine2', 344, 50], ['pine', 560, 110], ['pine2', 68, 250], ['pine', 180, 130], ['pine2', 250, 138], ['pine', 330, 250], ['pine2', 386, 330], ['pine', 430, 380], ['pine2', 96, 380], ['pine', 220, 390], ['pine2', 500, 400], ['pine', 40, 150], ['pine2', 360, 138], ['pine', 470, 150], ['pine2', 590, 190]]) addObj(m, { s: s2, x: a, y: b, sol: [10, 36, 12, 14] });
  for (const [a, b] of [[110, 180], [290, 340], [410, 260], [70, 330], [540, 210], [240, 440], [160, 240]]) addObj(m, { s: 'rock', x: a, y: b, sol: [1, 3, 16, 9] });
  addObj(m, { s: 'rockBig', x: 340, y: 380, sol: [1, 6, 28, 14] }); addObj(m, { s: 'rockBig', x: 30, y: 420, sol: [1, 6, 28, 14] });
  addObj(m, { s: 'bush', x: 180, y: 262, sol: [2, 4, 18, 9] }); addObj(m, { s: 'bush', x: 296, y: 300, sol: [2, 4, 18, 9] });
  // chân núi: bụi rậm chắn hai bên lối xuống
  for (let i = 0; i < 40; i++) { if (i >= 18 && i <= 21) continue; addObj(m, { s: 'hedge', x: i * 16, y: 464, sol: [0, 4, 18, 12] }); }
  m.zones.push({ x: 290, y: 472, w: 60, h: 8, fn: () => ACT.go('nui', 'school'), by: -8 });
}

/* ---------------- NHÀ VỆ SINH nữ / nam (chỉ dùng cho hoạt cảnh) ---------------- */
const WC_MIRRORS = [28, 60, 92];
function buildWC(id, name, wall, lower, door, tile) {
  const m = mapNew(id, name, 12, 9, true), x = m.x;
  paint(m, 'void', 0, 0, 12, 9, 1); paint(m, tile, 1, 2, 10, 6, 0);
  wallFace(m, 16, 0, 160, 32, wall, lower);
  paint(m, 'walltop', 0, 0, 1, 9, 1); paint(m, 'walltop', 11, 0, 1, 9, 1); paint(m, 'walltop', 0, 8, 12, 1, 1);
  for (const mx of WC_MIRRORS) { R(x, '#2a2136', mx - 1, 5, 26, 21); R(x, '#c9ccd4', mx, 6, 24, 19); R(x, '#dff1fa', mx + 1, 7, 22, 17); R(x, '#eef8fd', mx + 1, 7, 22, 2); addObj(m, { s: 'wcsink', x: mx - 1, y: 26, sol: [1, 2, 24, 18] }); }
  drawDoor(x, 126, 7, 14, 25, door); drawDoor(x, 146, 7, 14, 25, door);
  addObj(m, { s: 'plant', x: 160, y: 96, sol: [2, 14, 12, 9] });
}

/* ---------------- BỜ SÔNG (dưới phố Hoa Phượng): cầu gỗ câu cá ---------------- */
function buildRiver() {
  const m = mapNew('song', 'Bờ sông', 40, 24, false), x = m.x;
  paint(m, 'grass', 0, 0, 40, 7, 0); paint(m, 'sand', 0, 7, 40, 1, 0); paint(m, 'water', 0, 8, 40, 16, 1);
  [[3, 2], [9, 4], [14, 1], [26, 3], [31, 1], [36, 4], [6, 5]].forEach(([a, b]) => paint(m, 'flowers', a, b, 1, 1, 0));
  paint(m, 'dirt', 19, 0, 2, 7, 0);
  paint(m, 'plank', 19, 7, 2, 7, 0);                               // cầu gỗ vươn ra sông
  for (let j = 0; j < 7; j++) { R(x, '#8a5a3a', 303, 116 + j * 16, 2, 6); R(x, '#8a5a3a', 335, 116 + j * 16, 2, 6); }
  R(x, '#d9c690', 0, 126, 640, 2); for (let i = 0; i < 40; i++) R(x, '#eaf6fc', i * 16 + (i % 3) * 3, 130 + (i % 2) * 2, 7, 1);
  addObj(m, { s: 'fishspot', x: 322, y: 196, sol: [2, 8, 9, 9], ir: [-14, 0, 30, 22], label: () => fishLabel(), act: () => ACT.fish() });
  addObj(m, { s: 'boat', x: 430, y: 150, flat: true }); addObj(m, { s: 'boat', x: 120, y: 250, flat: true });
  for (const [s2, a, b] of [['tree', 40, 10], ['tree2', 150, 30], ['treePink', 230, 4], ['tree', 380, 8], ['treeOrange', 470, 30], ['tree2', 570, 12]]) addObj(m, { s: s2, x: a, y: b, sol: [13, 38, 10, 9] });
  addObj(m, { s: 'bench', x: 250, y: 84, sol: [1, 1, 28, 12] }); addObj(m, { s: 'bench', x: 366, y: 84, sol: [1, 1, 28, 12] });
  for (const a of [20, 96, 190, 420, 520, 600]) addObj(m, { s: 'bush', x: a, y: 98, sol: [2, 4, 18, 9] });
  addObj(m, { s: 'trailsign', x: 344, y: 8, sol: [9, 16, 6, 8], label: () => '↑ Về phố Hoa Phượng', act: () => ACT.go('song', 'pho') });
  m.zones.push({ x: 304, y: 5, w: 32, h: 7, fn: () => ACT.go('song', 'pho'), by: 10 });
  addObj(m, { s: 'signpostL', x: 14, y: 26, sol: [10, 22, 8, 8], label: () => '← Chùa Hoa Phượng', act: () => ACT.go('song', 'chua') });
  m.zones.push({ x: 0, y: 40, w: 8, h: 60, fn: () => ACT.go('song', 'chua'), bx: 6 });
}

/* ---------------- GA TÀU (trên phố Hoa Phượng): chỉ có tàu mới ra được biển ---------------- */
function drawRails(x, y, w) {
  R(x, '#b9b2a6', 0, y, w, 30); R(x, '#a39c8f', 0, y + 28, w, 2);
  for (let i = 0; i < w; i += 8) R(x, '#6f472c', i + 2, y + 6, 4, 18);
  R(x, '#5f656f', 0, y + 8, w, 2); R(x, '#8b8f9c', 0, y + 8, w, 1); R(x, '#5f656f', 0, y + 20, w, 2); R(x, '#8b8f9c', 0, y + 20, w, 1);
}
function buildStation() {
  const m = mapNew('ga', 'Ga Hoa Phượng', 36, 20, false), x = m.x;
  paint(m, 'grass', 0, 0, 36, 20, 0);
  for (let i = 0; i < 36 * 3; i++) m.solid[i] = 1;
  drawRails(x, 14, 576);
  paint(m, 'walk', 0, 3, 36, 2, 0); R(x, '#f4d35e', 0, 48, 576, 2);        // sân ga
  paint(m, 'walk', 0, 10, 36, 3, 0); paint(m, 'road', 0, 13, 36, 3, 0); paint(m, 'walk', 16, 5, 4, 5, 0); paint(m, 'walk', 16, 16, 4, 4, 0);
  for (let i = 0; i < 36; i += 2) R(x, '#f3e6a8', i * 16 + 4, 14 * 16 + 7, 12, 2);
  addObj(m, { s: 'train', x: 190, y: 8, ir: [0, 20, 170, 20], label: () => 'Tàu ra biển — mua vé lên tàu', act: () => ACT.train('ga') });
  addObj(m, { s: 'station', x: 60, y: 76, sol: [1, 28, 128, 56], label: () => 'Phòng vé — mua vé tàu ra biển', act: () => ACT.train('ga') });
  m.labels.push({ x: 125, y: 112, text: 'GA HOA PHƯỢNG', size: 7.5, col: '#ffffff', maxw: 78 });
  addBusStop(m, 'ga', 380, 166, 366, 210);
  for (const [s2, a, b] of [['tree', 4, 70], ['treePink', 470, 70], ['tree2', 530, 80], ['tree', 10, 262], ['treeOrange', 100, 266], ['tree2', 400, 264], ['treePink', 500, 268]]) addObj(m, { s: s2, x: a, y: b, sol: [13, 38, 10, 9] });
  for (const lx of [220, 340]) addObj(m, { s: 'lamp', x: lx, y: 124, sol: [3, 38, 6, 6] });
  addObj(m, { s: 'bench', x: 60, y: 60, sol: [1, 1, 28, 12] }); addObj(m, { s: 'bench', x: 420, y: 60, sol: [1, 1, 28, 12] });
  addObj(m, { s: 'trailsign', x: 326, y: 284, sol: [9, 16, 6, 8], label: () => '↓ Phố Hoa Phượng', act: () => ACT.go('ga', 'pho') });
  m.zones.push({ x: 256, y: 313, w: 64, h: 7, fn: () => ACT.go('ga', 'pho'), by: -10 });
  NPCS.push({ id: 'clerk', name: 'Cô soát vé', look: 'clerk', map: 'ga', x: 330, y: 72, dir: 0, vis: () => inWin(G.time, 330, 1260), label: () => 'Cô soát vé', act: () => ACT.train('ga') });
}

/* ---------------- BÃI BIỂN (đi tàu từ ga) ---------------- */
function buildBeach() {
  const m = mapNew('bien', 'Bãi biển', 44, 26, false), x = m.x;
  paint(m, 'grass', 0, 0, 44, 5, 0);
  for (let i = 0; i < 44 * 3; i++) m.solid[i] = 1;
  drawRails(x, 14, 704);
  paint(m, 'walk', 0, 3, 44, 2, 0); R(x, '#f4d35e', 0, 48, 704, 2);
  paint(m, 'plank', 0, 5, 44, 2, 0); paint(m, 'sand', 0, 7, 44, 12, 0); paint(m, 'water', 0, 19, 44, 7, 1);
  R(x, '#e6d096', 0, 296, 704, 4); for (let i = 0; i < 44; i++) { R(x, '#eaf6fc', i * 16 + (i % 3) * 2, 302 + (i % 2) * 2, 10, 2); R(x, '#cfeefa', i * 16 + 5, 312 + (i % 3), 6, 1); }
  addObj(m, { s: 'train', x: 250, y: 8, ir: [0, 20, 170, 20], label: () => 'Tàu về ga Hoa Phượng', act: () => ACT.train('bien') });
  addObj(m, { s: 'trailsign', x: 210, y: 52, sol: [9, 16, 6, 8], label: () => 'Ga Biển — tàu về thành phố', act: () => ACT.train('bien') });
  for (const a of [20, 150, 470, 600, 668]) addObj(m, { s: 'palm', x: a, y: 62, sol: [13, 40, 8, 8] });
  for (const [a, b] of [[60, 150], [140, 190], [420, 150], [600, 200]]) addObj(m, { s: 'parasol', x: a, y: b, sol: [3, 22, 26, 10], label: () => 'Ghế dù — nằm nghỉ', act: () => ACT.beach('rest') });
  addObj(m, { s: 'cart', x: 520, y: 100, sol: [1, 22, 38, 18], label: () => `Quán hải sản nướng — ${fmtMoney(BEACH.food.price)}`, act: () => ACT.beach('food') });
  addObj(m, { s: 'castle', x: 220, y: 236, sol: [2, 8, 18, 10], label: () => 'Xây lâu đài cát', act: () => ACT.beach('castle') });
  addObj(m, { s: 'buoy', x: 348, y: 268, sol: [5, 14, 4, 8], label: () => 'Tắm biển', act: () => ACT.beach('swim') });
  addObj(m, { s: 'shells', x: 500, y: 264, flat: true, ir: [-4, -6, 24, 20], label: () => 'Nhặt vỏ sò (làm quà tặng bạn)', act: () => ACT.beach('shell') });
  addObj(m, { s: 'shells', x: 90, y: 270, flat: true }); addObj(m, { s: 'shells', x: 640, y: 250, flat: true });
  addObj(m, { s: 'boat', x: 560, y: 330, flat: true });
}

/* ---------------- CẢNH ĐI XE (hoạt cảnh xe bus / bố mẹ chở / tàu hoả) ---------------- */
function buildRide(id, rail) {
  const m = mapNew(id, rail ? 'Đường tàu ra biển' : 'Trên đường', 64, 12, false), x = m.x;
  R(x, '#a8dcf5', 0, 0, 1024, 30); R(x, '#bfe6f7', 0, 30, 1024, 20); R(x, '#d9f0f9', 0, 50, 1024, 14);
  for (let i = 0; i < 9; i++) { ell(x, '#ffffff', 60 + i * 118, 14 + (i % 3) * 7, 22, 5); ell(x, '#ffffff', 74 + i * 118, 10 + (i % 3) * 7, 11, 5); }
  if (rail) {
    ell(x, '#9fd0b4', 140, 70, 180, 26); ell(x, '#8cc4a4', 420, 72, 150, 22);
    R(x, '#5fb0e0', 560, 52, 464, 12); for (let i = 0; i < 20; i++) R(x, '#8fd0f0', 570 + i * 23, 55 + (i % 3) * 3, 9, 1);
    paint(m, 'grass', 0, 4, 34, 8); paint(m, 'sand', 34, 4, 30, 8);
    drawRails(x, 112, 1024);
    for (const [s2, a] of [['tree', 30], ['tree2', 150], ['pine', 250], ['tree', 360], ['pine2', 450], ['palm', 600], ['palm', 720], ['palm', 860], ['palm', 960]]) addObj(m, { s: s2, x: a, y: 58 });
    addObj(m, { s: 'bush', x: 200, y: 160 }); addObj(m, { s: 'rock', x: 420, y: 164 }); addObj(m, { s: 'shells', x: 700, y: 170, flat: true }); addObj(m, { s: 'boat', x: 880, y: 160, flat: true });
  } else {
    for (let i = 0; i < 11; i++) { const bx = 10 + i * 96, bh = 22 + (i * 7) % 16, col = ['#c9d6e2', '#d9cfe6', '#e6d8c9'][i % 3]; R(x, col, bx, 64 - bh, 40, bh); for (let k = 0; k < 3; k++) for (let j = 0; j < Math.floor(bh / 8); j++) R(x, '#9fb4c7', bx + 5 + k * 12, 66 - bh + j * 8 + 3, 6, 4); }
    paint(m, 'grass', 0, 4, 64, 3); paint(m, 'walk', 0, 7, 64, 1); paint(m, 'road', 0, 8, 64, 3); paint(m, 'grass', 0, 11, 64, 1);
    for (let i = 0; i < 64; i += 2) R(x, '#f3e6a8', i * 16 + 4, 9 * 16 + 7, 12, 2);
    for (const [s2, a, b] of [['houseB', 60, 30], ['shop', 250, 34], ['houseC', 470, 30], ['center', 660, 34], ['houseD', 850, 30]]) addObj(m, { s: s2, x: a, y: b });
    for (const [s2, a] of [['tree', 10], ['treePink', 180], ['tree2', 380], ['treeOrange', 590], ['tree', 780], ['treeRed', 970]]) addObj(m, { s: s2, x: a, y: 66 });
    for (const a of [160, 440, 640, 830]) addObj(m, { s: 'lamp', x: a, y: 74 });
  }
}

/* ---------- bạn bè đứng đợi ở chỗ hẹn ---------- */
function addMeetNpcs() {
  for (const pl in PLACES) Object.keys(FRIENDS).forEach((fid, i) => {
    const P = PLACES[pl], F = FRIENDS[fid];
    NPCS.push({ id: 'meet_' + pl + '_' + fid, fid, name: F.name, look: fid, outfit: () => friendOutfit(fid), map: P.map, x: P.x + (i % 2) * 6, y: P.y, dir: 0, vis: () => meetHere(pl) === fid && !isComp(fid), label: () => `${F.name} — đang đợi bạn ở đây`, act: () => ACT.friend(fid, 'meet') });
  });
}

/* ---------------- TRƯỜNG (bên phải phố Hoa Phượng) ----------------
 * Trong tường rào là khuôn viên (G.atSchool). Ngoài tường: vỉa hè trước cổng có trạm xe bus;
 * mép trái về phố Hoa Phượng; mép phải có lối mòn vòng bên ngoài hàng rào ra sau trường để lên núi. */
const GATE = { x: 303, w: 97, yIn: 366, yOut: 396 };
function buildSchool() {
  const m = mapNew('school', 'Trường THPT Hoa Phượng', 47, 30, false);
  paint(m, 'yard', 0, 0, 44, 24, 0); paint(m, 'grass', 44, 0, 3, 24, 0); paint(m, 'dirt', 45, 0, 2, 24, 0);
  paint(m, 'grass', 0, 7, 6, 16, 0); paint(m, 'flowers', 1, 9, 1, 1, 0); paint(m, 'flowers', 4, 13, 1, 1, 0); paint(m, 'flowers', 2, 19, 1, 1, 0); paint(m, 'flowers', 4, 21, 1, 1, 0);
  paint(m, 'court', 30, 8, 13, 13, 0);
  const W = '#eef7ee'; R(m.x, W, 484, 132, 200, 1); R(m.x, W, 484, 331, 200, 1); R(m.x, W, 484, 132, 1, 200); R(m.x, W, 683, 132, 1, 200); R(m.x, W, 484, 232, 200, 1); ring(m.x, W, 584, 232, 18);
  paint(m, 'walk', 0, 24, 47, 3, 0); paint(m, 'road', 0, 27, 47, 3, 1); paint(m, 'dirt', 45, 23, 2, 2, 0);
  for (let i = 0; i < 47; i += 2) R(m.x, '#f3e6a8', i * 16 + 4, 28 * 16 + 7, 12, 2);
  R(m.x, '#aaa392', 0, 430, 752, 2);
  addObj(m, { s: 'school', x: 191, y: 3, sol: [1, 22, 320, 79], label: () => 'Bảng tin — thời khoá biểu', act: () => UI.timetable() });
  m.warps.push({ x: 235, y: 102, w: 18, h: 12, dir: 3, to: { map: 'class', x: 289, y: 204, dir: 3 } });
  m.labels.push({ x: 352, y: 30.5, text: 'THPT HOA PHƯỢNG', size: 9, col: '#ffffff', maxw: 74 });
  m.labels.push({ x: 244.5, y: 68.5, text: '10A1', size: 4.6, col: '#2a2136', maxw: 14 });
  m.warps.push({ x: 452, y: 102, w: 18, h: 12, dir: 3, to: { map: 'lab', x: 289, y: 204, dir: 3 } });
  m.labels.push({ x: 461.5, y: 68.5, text: 'LAB', size: 4.6, col: '#2a2136', maxw: 14 });
  addObj(m, { s: 'canteen', x: 40, y: 50, sol: [1, 32, 76, 23], label: () => 'Căn tin — mua đồ ăn', act: () => ACT.canteen() });
  m.labels.push({ x: 79, y: 57.5, text: 'CĂN TIN', size: 6.5, col: '#2a2136', maxw: 40 });
  addObj(m, { s: 'bikeshed', x: 524, y: 62, sol: [1, 26, 96, 17], label: () => shedLabel(), act: () => ACT.shed() });
  addObj(m, { s: 'flagpole', x: 342, y: 108, sol: [3, 52, 14, 9] });
  for (const [a, b] of [[96, 140], [96, 250], [430, 140], [430, 250]]) addObj(m, { s: 'treeRed', x: a, y: b, sol: [13, 38, 10, 9] });
  for (const [a, b] of [[136, 172], [136, 282], [396, 172], [396, 282]]) addObj(m, { s: 'benchstone', x: a, y: b, sol: [1, 1, 28, 12] });
  addObj(m, { s: 'tree', x: 18, y: 150, sol: [13, 38, 10, 9] }); addObj(m, { s: 'tree2', x: 34, y: 244, sol: [13, 38, 10, 9] }); addObj(m, { s: 'bush', x: 60, y: 206, sol: [2, 4, 18, 9] }); addObj(m, { s: 'bush', x: 12, y: 318, sol: [2, 4, 18, 9] });
  addObj(m, { s: 'goal', x: 564, y: 118, sol: [1, 2, 38, 8], label: () => 'Sân thể dục — chơi thể thao', act: () => ACT.field() });
  addObj(m, { s: 'ball', x: 600, y: 250, flat: true });
  // tường rào + cổng + hàng rào phía đông
  for (let i = 0; i <= 44; i++) { if (i >= 18 && i <= 25) continue; addObj(m, { s: 'wallseg', x: i * 16 - 1, y: 363, sol: [0, 8, 18, 14] }); }
  for (let j = 0; j < 23; j++) addObj(m, { s: 'hedge', x: 704, y: 2 + j * 16, sol: [0, 4, 18, 12] });
  addObj(m, { s: 'gate', x: 287, y: 340, label: () => 'Cổng trường', act: () => ACT.guard() });
  m.solids.push([288, 372, 15, 14], [400, 372, 15, 14]);
  m.labels.push({ x: 351.5, y: 348.5, text: 'TRƯỜNG THPT HOA PHƯỢNG', size: 7, col: '#ffffff', maxw: 96 });
  addObj(m, { s: 'booth', x: 422, y: 322, sol: [1, 14, 30, 27] });
  m.zones.push({ x: GATE.x, y: 377, w: GATE.w, h: 9, fn: () => gateCross() });
  // ngoài cổng: trạm xe bus, đường về phố, lối mòn vòng ra sau trường
  addBusStop(m, 'truong', 110, 386, 96, 436, true);
  addObj(m, { s: 'signpostL', x: 20, y: 380, sol: [10, 22, 8, 8], label: () => '← Phố Hoa Phượng', act: () => ACT.go('school', 'pho') });
  m.zones.push({ x: 0, y: 386, w: 8, h: 46, fn: () => ACT.go('school', 'pho'), bx: 6 });
  addObj(m, { s: 'trailsign', x: 690, y: 384, sol: [9, 16, 6, 8], label: () => 'Lối mòn vòng ra sau trường → lên núi', act: () => UI.toast('Đi theo lối đất bên ngoài hàng rào lên phía trên là tới núi.') });
  m.zones.push({ x: 720, y: 5, w: 32, h: 7, fn: () => ACT.go('school', 'nui'), by: 10 });

  NPCS.push({ id: 'guard', name: 'Bác bảo vệ', look: 'guard', map: 'school', x: 392, y: 362, dir: 1, vis: () => G.time < 1200, label: () => 'Bác bảo vệ', act: () => ACT.guard() });
  // học sinh ra sân giờ ra chơi
  const yard = () => yardTime();
  const spots = [[250, 250], [300, 300], [180, 220], [220, 320], [380, 240], [330, 200], [200, 280], [360, 310]];
  const mates = [['khoa', 'Khoa', 'khoa'], ['vy', 'Vy', 'vy'], ['dat', 'Đạt', 'dat'], ['m1', 'Bạn cùng lớp', 'c1'], ['ngan', 'Ngân', 'ngan'], ['m3', 'Bạn cùng lớp', 'c3'], ['m4', 'Bạn cùng lớp', 'c4'], ['m5', 'Bạn cùng lớp', 'c5']];
  mates.forEach(([id, name, look], i) => {
    const fr = !!FRIENDS[id];
    NPCS.push({ id: 'y_' + id, fid: fr ? id : null, sid: id, name, look, map: 'school', x: spots[i][0], y: spots[i][1], dir: i % 4, wander: 34, vis: () => yard() && !isComp(id) && !!yardPos(id), label: () => name, act: () => (fr ? ACT.friend(id, 'school') : ACT.mate(id)) });
  });
}

/* ---------------- LỚP HỌC ---------------- */
const SEAT = { x: 111, y: 134 };
// Chỗ có người ngồi trong lớp (cột, hàng, bên): 8 bạn có tên + vài bạn khác — lớp không còn kín chỗ
const CLASS_SEATED = new Set();
const seatTaken = (c, r, sd, sp) => !!sp || (c * 3 + r * 5 + sd * 7) % 4 === 1;
function buildClass() {
  const m = mapNew('class', 'Lớp 10A1', 20, 14, true);
  paint(m, 'void', 0, 0, 20, 14, 1);
  paint(m, 'ctile', 1, 2, 18, 11, 0);
  wallFace(m, 16, 0, 288, 32, '#f7efd0', '#8fc7a8');
  paint(m, 'walltop', 0, 0, 1, 14, 1); paint(m, 'walltop', 19, 0, 1, 14, 1); paint(m, 'walltop', 0, 13, 20, 1, 1);
  paint(m, 'ctile', 17, 13, 2, 1, 0); R(m.x, '#8a5a3a', 272, 220, 32, 4); R(m.x, '#3f354c', 270, 208, 2, 16);
  // bảng xanh
  R(m.x, '#2a2136', 95, 5, 130, 22); R(m.x, '#8a5a3a', 96, 6, 128, 20); R(m.x, '#2f6b4f', 98, 8, 124, 15); R(m.x, '#3a7d5d', 98, 8, 124, 2); R(m.x, '#c9a467', 98, 23, 124, 2);
  R(m.x, '#dfeee6', 106, 12, 30, 1); R(m.x, '#dfeee6', 106, 15, 44, 1); R(m.x, '#dfeee6', 106, 18, 22, 1); R(m.x, '#dfeee6', 170, 12, 36, 1); R(m.x, '#dfeee6', 170, 16, 26, 1); R(m.x, '#fff', 200, 23, 6, 1); R(m.x, '#e98fa5', 190, 23, 5, 1);
  drawWin(m.x, 34, 9, 22, 13); drawWin(m.x, 262, 9, 22, 13);
  ell(m.x, '#2a2136', 240, 12, 5.5, 5.5); ell(m.x, '#fffaf0', 240, 12, 4.5, 4.5); R(m.x, '#2a2136', 240, 9, 1, 4); R(m.x, '#2a2136', 240, 12, 3, 1);
  addObj(m, { s: 'tdesk', x: 38, y: 34, sol: [1, 2, 32, 19] });
  const X = [40, 104, 184, 248], Y = [70, 104, 138, 172];
  const looks = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'];
  const special = { '1,1,1': 'khoa', '2,1,0': 'vy', '1,2,0': 'dat', '0,1,1': 'ngan', '0,0,0': 'm1', '3,0,0': 'm3', '2,2,1': 'm4', '3,3,0': 'm5' };
  const spLook = { khoa: 'khoa', vy: 'vy', dat: 'dat', ngan: 'ngan', m1: 'c1', m3: 'c3', m4: 'c4', m5: 'c5' };
  let k = 0;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    const mine = (c === 1 && r === 1);
    addObj(m, { s: 'sdesk', x: X[c] - 1, y: Y[r] - 1, sol: [1, 1, 28, 12], label: mine ? () => 'Bàn của bạn — ngồi chờ, tự học' : null, act: mine ? () => ACT.mydesk() : null });
    for (let sd = 0; sd < 2; sd++) {
      const sx = X[c] + 7 + sd * 14, sy = Y[r] + 30;
      if (mine && sd === 0) continue;
      const sp = special[c + ',' + r + ',' + sd], fr = sp && FRIENDS[sp];
      if (!seatTaken(c, r, sd, sp)) continue;
      CLASS_SEATED.add(c + ',' + r + ',' + sd);
      // bạn thân ngồi gần: giờ giải lao 10' giữa 2 tiết có thể quay sang rủ rê, trò chuyện, đấu thẻ
      NPCS.push({
        id: 's_' + c + r + sd, sid: sp || null, fid: fr ? sp : null, name: fr ? fr.name : 'Bạn học', look: sp ? spLook[sp] : looks[(k++ * 3 + r) % 8], map: 'class', x: sx, y: sy, dir: 3, solid: true,
        vis: sp ? () => classSeated() && !yardTime() && !sceneHides(sp) && !isComp(sp) : () => classSeated(),
        label: fr ? () => `${fr.name} (${fr.seat})` : null, act: fr ? () => ACT.friend(sp, 'class') : null,
      });
    }
  }
  m.warps.push({ x: 272, y: 214, w: 32, h: 10, dir: 0, to: { map: 'school', x: 244, y: 116, dir: 0 } });
  NPCS.push({ id: 'teacher', name: 'Cô giáo', look: 'teacherA', map: 'class', x: 160, y: 52, dir: 0, vis: () => teacherIn(), dynLook: () => (RT.scene && RT.scene.teacher) || 'teacherA', label: () => 'Cô chủ nhiệm', act: () => ACT.teacher() });
}

/* ---------------- PHÒNG THÍ NGHIỆM ---------------- */
const LAB_SPOT = { x: 146, y: 156 };
const LAB_X = [36, 134, 232], LAB_Y = [78, 122, 166];
function buildLab() {
  const m = mapNew('lab', 'Phòng thí nghiệm', 20, 14, true);
  paint(m, 'void', 0, 0, 20, 14, 1);
  paint(m, 'ltile', 1, 2, 18, 11, 0);
  wallFace(m, 16, 0, 288, 32, '#eef3f6', '#9fc3d6');
  paint(m, 'walltop', 0, 0, 1, 14, 1); paint(m, 'walltop', 19, 0, 1, 14, 1); paint(m, 'walltop', 0, 13, 20, 1, 1);
  paint(m, 'ltile', 17, 13, 2, 1, 0); R(m.x, '#8a5a3a', 272, 220, 32, 4); R(m.x, '#3f354c', 270, 208, 2, 16);
  // bảng trắng
  R(m.x, '#2a2136', 109, 6, 102, 20); R(m.x, '#c9ccd4', 110, 7, 100, 18); R(m.x, '#fbfdff', 112, 9, 96, 14);
  R(m.x, '#3b82c4', 118, 12, 26, 1); R(m.x, '#e2574c', 118, 15, 38, 1); R(m.x, '#3b82c4', 118, 18, 20, 1); R(m.x, '#5fae4a', 168, 12, 24, 1); ring(m.x, '#e2574c', 190, 17, 3); R(m.x, '#5fae4a', 168, 16, 12, 1);
  drawWin(m.x, 220, 9, 20, 13);
  R(m.x, '#f4d35e', 98, 10, 8, 8); R(m.x, '#2a2136', 101, 12, 2, 3); R(m.x, '#2a2136', 101, 16, 2, 1);   // biển cảnh báo
  addObj(m, { s: 'cabinet', x: 22, y: 2, sol: [1, 12, 32, 25] }); addObj(m, { s: 'cabinet', x: 58, y: 2, sol: [1, 12, 32, 25] }); addObj(m, { s: 'cabinet', x: 246, y: 2, sol: [1, 12, 32, 25] });
  addObj(m, { s: 'skeleton', x: 284, y: 10, sol: [2, 24, 12, 9] });
  addObj(m, { s: 'tdesk', x: 142, y: 34, sol: [1, 2, 32, 19] });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    const mine = (c === 1 && r === 1);
    addObj(m, { s: 'labbench', x: LAB_X[c] - 1, y: LAB_Y[r] - 1, sol: [1, 1, 46, 18], label: mine ? () => 'Bàn thí nghiệm của bạn — tự luyện thực hành' : null, act: mine ? () => ACT.labBench() : null });
  }
  m.warps.push({ x: 272, y: 214, w: 32, h: 10, dir: 0, to: { map: 'school', x: 461, y: 116, dir: 0 } });
}

function buildMaps() {
  buildHome(); buildTown(); buildSchool(); buildClass(); buildLab(); buildPho(); buildHill(); buildRiver(); buildStation(); buildBeach();
  buildWC('wc', 'Nhà vệ sinh nữ', '#fbe4ea', '#eab2c2', '#e98fa5', 'wtile'); buildWC('wcm', 'Nhà vệ sinh nam', '#e4eef7', '#a9c6dc', '#5a8fd6', 'ltile');
  buildRide('ride', false); buildRide('rail', true);
  buildRooms();
  addMeetNpcs(); buildFamily();
}
