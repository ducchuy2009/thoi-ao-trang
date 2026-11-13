'use strict';
/* ============================================================
 *  03. BẢN ĐỒ — Nhà · Khu phố · Sân trường · Lớp học · Phòng thí nghiệm · Phố Hoa Sữa · Núi sau trường
 *  Toạ độ tính bằng pixel game (1 ô = 16px).
 * ============================================================ */
const MAPS = {};
const NPCS = [];
function mapNew(id, name, w, h, indoor) {
  const m = { id, name, w, h, pw: w * 16, ph: h * 16, indoor, solid: new Uint8Array(w * h), g: mk(w * 16, h * 16), objs: [], warps: [], zones: [], labels: [], solids: [] };
  m.x = cx(m.g); MAPS[id] = m; return m;
}
function paint(m, kind, tx, ty, tw, th, solid) {
  for (let j = 0; j < th; j++) for (let i = 0; i < tw; i++) {
    GROUND[kind](m.x, (tx + i) * 16, (ty + j) * 16, tx + i, ty + j);
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
  m.x.drawImage(SPR.calendar, 53, 9);
  drawDoor(m.x, 250, 7, 16, 25, '#a9703f');                       // cửa phòng bố mẹ
  R(m.x, '#8a5a3a', 173, 9, 14, 11); R(m.x, '#fff3c8', 174, 10, 12, 9); R(m.x, '#e98fa5', 176, 13, 3, 4); R(m.x, '#6f8fb8', 181, 13, 3, 4);   // ảnh gia đình
  // phòng ngủ
  addObj(m, { s: 'rugBlue', x: 62, y: 104, flat: true });
  addObj(m, { s: 'bed', x: 17, y: 24, sol: [1, 4, 32, 42], label: () => 'Giường — đi ngủ', act: () => ACT.bed() });
  addObj(m, { s: 'desk', x: 58, y: 24, sol: [1, 2, 34, 25], label: () => 'Bàn học — soạn cặp, tự học', act: () => ACT.desk() });
  addObj(m, { s: 'chair', x: 70, y: 49, sol: [1, 1, 12, 11] });
  addObj(m, { s: 'wardrobe', x: 95, y: 6, sol: [1, 10, 30, 29] });
  addObj(m, { s: 'shelf', x: 126, y: 12, sol: [1, 8, 16, 25] });
  addObj(m, { s: 'mat', x: 24, y: 150, flat: true, label: () => 'Thảm tập — tập thể dục', act: () => ACT.exercise() });
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
  addObj(m, { s: 'motoMom', x: 118, y: 112, sol: [2, 10, 28, 10], vis: () => !G || !FAM.mom.bikeAway, label: () => choreLabel('ruaxe'), act: () => ACT.chore('ruaxe') });
  addObj(m, { s: 'moto', x: 152, y: 112, sol: [2, 10, 28, 10], vis: () => !G || !FAM.dad.bikeAway, label: () => choreLabel('ruaxe'), act: () => ACT.chore('ruaxe') });
  addObj(m, { s: 'weeds', x: 186, y: 84, vis: () => !G || !G.daily.chores.nhoco, label: () => choreLabel('nhoco'), act: () => ACT.chore('nhoco') });
  addObj(m, { s: 'weeds', x: 22, y: 96, vis: () => !G || !G.daily.chores.nhoco });
  addObj(m, { s: 'bike', x: 192, y: 120, sol: [2, 10, 24, 8], vis: () => G && G.owned.xedap && !(G.atSchool && G.cameBy === 'bike') });
  addObj(m, { s: 'ebike', x: 222, y: 116, sol: [2, 10, 28, 10], vis: () => G && G.owned.xedapdien });
  addObj(m, { s: 'moto50', x: 232, y: 90, sol: [2, 10, 28, 10], vis: () => G && G.owned.xemay });
  // dãy phố
  addObj(m, { s: 'shop', x: 303, y: 51, sol: [1, 24, 96, 53], label: () => 'Tạp hoá Cô Ba — mua đồ, phụ bán hàng', act: () => ACT.shop() });
  addObj(m, { s: 'center', x: 431, y: 51, sol: [1, 24, 96, 53], label: () => 'Trung tâm Sao Mai — đăng ký học thêm', act: () => ACT.center() });
  addObj(m, { s: 'houseB', x: 575, y: 47, sol: [1, 30, 96, 51] }); addObj(m, { s: 'houseC', x: 687, y: 47, sol: [1, 30, 96, 51] });
  addObj(m, { s: 'bush', x: 405, y: 113, sol: [2, 4, 18, 9] }); addObj(m, { s: 'tree2', x: 533, y: 80, sol: [13, 38, 10, 9] });
  addObj(m, { s: 'treePink', x: 292, y: 4, sol: [13, 38, 10, 9] }); addObj(m, { s: 'tree', x: 404, y: 2, sol: [13, 38, 10, 9] }); addObj(m, { s: 'treeOrange', x: 534, y: 6, sol: [13, 38, 10, 9] });
  m.labels.push({ x: 352, y: 66.5, text: 'TẠP HOÁ CÔ BA', size: 8.5, col: '#2a2136', maxw: 78 });
  m.labels.push({ x: 480, y: 67.5, text: 'HỌC THÊM SAO MAI', size: 7.5, col: '#ffffff', maxw: 78 });
  for (const lx of [286, 520, 742]) addObj(m, { s: 'lamp', x: lx, y: 112, sol: [3, 38, 6, 6] });
  addObj(m, { s: 'busshelter', x: 608, y: 146, sol: [1, 26, 44, 10], label: () => 'Trạm xe bus — đi học', act: () => ACT.goSchool() });
  addObj(m, { s: 'bussign', x: 660, y: 150, sol: [4, 24, 6, 8] });
  addObj(m, { s: 'signpost', x: 766, y: 148, sol: [10, 22, 8, 8], label: () => "Phố Hoa Sữa — nhà bạn bè, trung tâm thương mại, khu game (đi bộ 10')", act: () => ACT.toPho() });
  m.zones.push({ x: 792, y: 160, w: 8, h: 112, fn: () => ACT.toPho(), bx: -6 });
  addObj(m, { s: 'signpostL', x: 22, y: 148, sol: [10, 22, 8, 8], label: () => 'Đường đến trường', act: () => ACT.goSchool() });
  m.zones.push({ x: 0, y: 160, w: 8, h: 112, fn: () => ACT.goSchool(), bx: 6 });
  // công viên
  for (let i = 0; i < 50; i++) { if (i >= 23 && i <= 25) continue; addObj(m, { s: 'hedge', x: i * 16, y: 270, sol: [0, 4, 18, 12] }); }
  for (const [s, a, b] of [['tree', 24, 290], ['treePink', 150, 282], ['tree2', 250, 286], ['treeOrange', 300, 356], ['treePink', 436, 282], ['tree', 480, 352], ['treePink', 506, 284], ['tree2', 190, 362]]) addObj(m, { s, x: a, y: b, sol: [13, 38, 10, 9] });
  addObj(m, { s: 'bench', x: 318, y: 316, sol: [1, 1, 28, 12] }); addObj(m, { s: 'bench', x: 420, y: 356, sol: [1, 1, 28, 12] });
  addObj(m, { s: 'goal', x: 628, y: 276, sol: [1, 2, 38, 8] });
  addObj(m, { s: 'ball', x: 664, y: 336, flat: true });
  addObj(m, { s: 'bush', x: 30, y: 350, sol: [2, 4, 18, 9] }); addObj(m, { s: 'bush', x: 160, y: 388, sol: [2, 4, 18, 9] });
  const parkT = () => parkTime();
  for (const [fid, a, b, d, wd] of [['khoa', 636, 348, 0, 26], ['dat', 694, 368, 1, 26], ['vy', 338, 344, 0, 14], ['ngan', 452, 340, 0, 12]]) {
    const F = FRIENDS[fid];
    NPCS.push({ id: 'p_' + fid, fid, name: F.name, look: fid, outfit: () => friendOutfit(fid), map: 'town', x: a, y: b, dir: d, wander: wd, vis: () => parkT() && !meetToday(fid), label: () => F.name + ' — rủ đi chơi', act: () => ACT.friend(fid, 'park') });
  }
}
const friendOutfit = fid => (schoolToday() ? null : 'cas_' + fid);

/* ---------------- PHỐ HOA SỮA: nhà bạn bè · trà sữa · TTTM · khu game ---------------- */
const FRIEND_HOUSE = { khoa: ['houseB', 12], dat: ['houseC', 120], vy: ['houseD', 228], ngan: ['houseE', 336] };
function buildPho() {
  const m = mapNew('pho', 'Phố Hoa Sữa', 56, 26, false);
  paint(m, 'grass', 0, 0, 56, 26, 0);
  [[1, 2], [7, 1], [13, 3], [20, 2], [27, 1], [33, 3], [53, 5], [54, 2], [1, 19], [17, 23], [18, 19], [36, 20], [37, 24], [47, 19], [50, 23], [53, 21], [45, 24]].forEach(([a, b]) => paint(m, 'flowers', a, b, 1, 1, 0));
  paint(m, 'walk', 0, 8, 56, 4, 0); paint(m, 'road', 0, 12, 56, 3, 0); paint(m, 'walk', 0, 15, 56, 2, 0);
  for (let i = 0; i < 56; i += 2) R(m.x, '#f3e6a8', i * 16 + 4, 13 * 16 + 7, 12, 2);
  for (let k = 0; k < 6; k++) R(m.x, '#f4f2ea', 39 * 16 + 2, 12 * 16 + 2 + k * 8, 28, 4);
  R(m.x, '#aaa392', 0, 190, 896, 2); R(m.x, '#aaa392', 0, 240, 896, 2);
  // dãy nhà bạn bè
  for (const fid in FRIEND_HOUSE) {
    const [spr, hx] = FRIEND_HOUSE[fid], F = FRIENDS[fid];
    addObj(m, { s: spr, x: hx, y: 47, sol: [1, 30, 96, 51], label: () => `Nhà ${F.name} — bấm chuông`, act: () => ACT.house(fid) });
    m.labels.push({ x: hx + 49, y: 82.5, text: 'NHÀ ' + F.name.toUpperCase(), size: 5.5, col: '#2a2136', maxw: 60 });
    NPCS.push({ id: 'h_' + fid, fid, name: F.name, look: fid, outfit: () => friendOutfit(fid), map: 'pho', x: hx + 49, y: 144, dir: 0, wander: 8, vis: () => friendHome(fid), label: () => F.name + ' — đang ở trước nhà', act: () => ACT.friend(fid, 'house') });
  }
  // dãy vui chơi
  addObj(m, { s: 'teashop', x: 448, y: 51, sol: [1, 24, 80, 53], label: () => PLACES.tea.name + ' — uống trà sữa', act: () => ACT.tea() });
  m.labels.push({ x: 489, y: 67.5, text: 'TRÀ SỮA MÂY', size: 8, col: '#b5677c', maxw: 62 });
  addObj(m, { s: 'mall', x: 540, y: 23, sol: [1, 30, 176, 75], label: () => PLACES.mall.name + ' — xem phim, nhà sách, siêu thị', act: () => ACT.mall() });
  m.labels.push({ x: 629, y: 44.5, text: 'HOA PHƯỢNG PLAZA', size: 9, col: '#ffffff', maxw: 128 });
  addObj(m, { s: 'arcade', x: 728, y: 51, sol: [1, 24, 96, 53], label: () => PLACES.arcade.name + ' — gắp thú, game thùng, máy nhảy', act: () => ACT.arcade() });
  m.labels.push({ x: 777, y: 68, text: 'GAME ARCADE', size: 8, col: '#ffe066', maxw: 76 });
  for (const lx of [112, 220, 436, 718, 838]) addObj(m, { s: 'lamp', x: lx, y: 112, sol: [3, 38, 6, 6] });
  addObj(m, { s: 'treePink', x: 846, y: 20, sol: [13, 38, 10, 9] }); addObj(m, { s: 'tree', x: 420, y: 2, sol: [13, 38, 10, 9] });
  // lối đi: trái về khu phố nhà mình, phải lên núi sau trường
  addObj(m, { s: 'signpostL', x: 22, y: 148, sol: [10, 22, 8, 8], label: () => "Về khu phố nhà mình (đi bộ 10')", act: () => ACT.toTown() });
  m.zones.push({ x: 0, y: 160, w: 8, h: 112, fn: () => ACT.toTown(), bx: 6 });
  addObj(m, { s: 'trailsign', x: 862, y: 150, sol: [9, 16, 6, 8], label: () => "Đường lên núi sau trường (đi bộ 20')", act: () => ACT.toHill('pho') });
  m.zones.push({ x: 888, y: 160, w: 8, h: 112, fn: () => ACT.toHill('pho'), bx: -6 });
  // phía dưới: sân bóng mini · quảng trường đài phun nước · xe xiên que
  for (let i = 0; i < 56; i++) { if (i >= 26 && i <= 28) continue; addObj(m, { s: 'hedge', x: i * 16, y: 270, sol: [0, 4, 18, 12] }); }
  paint(m, 'court', 2, 18, 13, 7, 0);
  const W = '#eef7ee'; R(m.x, W, 36, 292, 200, 1); R(m.x, W, 36, 395, 200, 1); R(m.x, W, 36, 292, 1, 104); R(m.x, W, 235, 292, 1, 104); R(m.x, W, 36, 344, 200, 1); ring(m.x, W, 136, 344, 14);
  addObj(m, { s: 'goal', x: 116, y: 276, sol: [1, 2, 38, 8], label: () => "Sân bóng mini — chơi thể thao 20'", act: () => ACT.field() });
  addObj(m, { s: 'ball', x: 150, y: 338, flat: true });
  paint(m, 'yard', 20, 18, 15, 7, 0); paint(m, 'yard', 26, 17, 3, 1, 0);
  addObj(m, { s: 'fountain', x: 418, y: 326, sol: [2, 8, 42, 20] });
  for (const [a, b] of [[344, 300], [488, 300], [344, 376], [488, 376]]) addObj(m, { s: 'bench', x: a, y: b, sol: [1, 1, 28, 12] });
  addObj(m, { s: 'cart', x: 620, y: 290, sol: [1, 22, 38, 18], label: () => 'Xe xiên que — ăn vặt 10.000đ', act: () => ACT.cart() });
  for (const [s2, a, b] of [['tree', 262, 286], ['treeOrange', 272, 356], ['treePink', 580, 352], ['tree2', 700, 292], ['treePink', 780, 348], ['tree', 840, 290], ['tree2', 690, 362]]) addObj(m, { s: s2, x: a, y: b, sol: [13, 38, 10, 9] });
  addObj(m, { s: 'bush', x: 600, y: 340, sol: [2, 4, 18, 9] }); addObj(m, { s: 'bush', x: 760, y: 300, sol: [2, 4, 18, 9] });
  addObj(m, { s: 'bench', x: 740, y: 380, sol: [1, 1, 28, 12] });
  // vài người đi dạo cho phố có hơi người
  NPCS.push({ id: 'pho_a', name: 'Người đi dạo', look: 'c7', outfit: () => 'cas_dat', map: 'pho', x: 300, y: 252, dir: 2, wander: 46, vis: () => inWin(G.time, 420, 1290) });
  NPCS.push({ id: 'pho_b', name: 'Người đi dạo', look: 'c6', outfit: () => 'cas_vy', map: 'pho', x: 560, y: 176, dir: 1, wander: 46, vis: () => inWin(G.time, 480, 1290) });
  NPCS.push({ id: 'pho_c', name: 'Người đi dạo', look: 'c3', outfit: () => 'cas_khoa', map: 'pho', x: 430, y: 310, dir: 0, wander: 30, vis: () => inWin(G.time, 540, 1260) });
}

/* ---------------- NÚI SAU TRƯỜNG: đường mòn, bãi cỏ picnic, hồ, đỉnh núi ---------------- */
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
  addObj(m, { s: 'picnicmat', x: 214, y: 276, flat: true, label: () => "Bãi cỏ picnic — trải bạt ăn uống, hóng gió (90')", act: () => ACT.picnic() });
  // hồ nước + suối
  ell(x, '#9cc48a', 528, 290, 62, 40); ell(x, '#5fb0e0', 528, 290, 58, 36); ell(x, '#8fd0f0', 510, 280, 30, 10); ell(x, '#5fb0e0', 516, 283, 22, 6);
  ell(x, '#5fae4a', 560, 300, 6, 3); ell(x, '#5fae4a', 496, 306, 5, 2.6); R(x, '#ff8fa8', 560, 299, 2, 1);
  R(x, '#9cc48a', 566, 322, 14, 158); R(x, '#5fb0e0', 568, 322, 10, 158); for (let j = 0; j < 9; j++) R(x, '#8fd0f0', 570 + (j % 2) * 3, 330 + j * 17, 4, 1);
  m.solids.push([472, 258, 112, 64], [566, 322, 14, 158]);
  addObj(m, { s: 'rock', x: 448, y: 304, sol: [1, 3, 16, 9], label: () => 'Hồ nước — rửa mặt cho tỉnh táo', act: () => ACT.stream() });
  // đỉnh núi
  addObj(m, { s: 'summit', x: 478, y: 58, sol: [3, 20, 12, 8], label: () => "Đỉnh núi — ngắm cảnh (20')", act: () => ACT.summit() });
  addObj(m, { s: 'bench', x: 388, y: 66, sol: [1, 1, 28, 12] });
  addObj(m, { s: 'trailsign', x: 348, y: 432, sol: [9, 16, 6, 8], label: () => "Đường mòn — chạy bộ leo dốc (30')", act: () => ACT.hike() });
  // cây thông, đá
  for (let j = 0; j < 9; j++) { addObj(m, { s: j % 2 ? 'pine2' : 'pine', x: 0, y: 46 + j * 46, sol: [10, 36, 12, 14] }); addObj(m, { s: j % 2 ? 'pine' : 'pine2', x: 608, y: 40 + j * 46, sol: [10, 36, 12, 14] }); }
  for (const [s2, a, b] of [['pine', 60, 70], ['pine2', 200, 62], ['pine', 300, 96], ['pine2', 344, 50], ['pine', 560, 110], ['pine2', 68, 250], ['pine', 180, 130], ['pine2', 250, 138], ['pine', 330, 250], ['pine2', 386, 330], ['pine', 430, 380], ['pine2', 96, 380], ['pine', 220, 390], ['pine2', 500, 400], ['pine', 40, 150], ['pine2', 360, 138], ['pine', 470, 150], ['pine2', 590, 190]]) addObj(m, { s: s2, x: a, y: b, sol: [10, 36, 12, 14] });
  for (const [a, b] of [[110, 180], [290, 340], [410, 260], [70, 330], [540, 210], [240, 440], [160, 240]]) addObj(m, { s: 'rock', x: a, y: b, sol: [1, 3, 16, 9] });
  addObj(m, { s: 'rockBig', x: 340, y: 380, sol: [1, 6, 28, 14] }); addObj(m, { s: 'rockBig', x: 30, y: 420, sol: [1, 6, 28, 14] });
  addObj(m, { s: 'bush', x: 180, y: 262, sol: [2, 4, 18, 9] }); addObj(m, { s: 'bush', x: 296, y: 300, sol: [2, 4, 18, 9] });
  // chân núi: bụi rậm chắn hai bên lối xuống
  for (let i = 0; i < 40; i++) { if (i >= 18 && i <= 21) continue; addObj(m, { s: 'hedge', x: i * 16, y: 464, sol: [0, 4, 18, 12] }); }
  m.zones.push({ x: 290, y: 472, w: 60, h: 8, fn: () => ACT.leaveHill(), by: -8 });
}

/* ---------------- NHÀ VỆ SINH NỮ (chỉ dùng cho đoạn cắt cảnh) ---------------- */
const WC_MIRRORS = [28, 60, 92];
function buildWC() {
  const m = mapNew('wc', 'Nhà vệ sinh nữ', 12, 9, true), x = m.x;
  paint(m, 'void', 0, 0, 12, 9, 1); paint(m, 'wtile', 1, 2, 10, 6, 0);
  wallFace(m, 16, 0, 160, 32, '#fbe4ea', '#eab2c2');
  paint(m, 'walltop', 0, 0, 1, 9, 1); paint(m, 'walltop', 11, 0, 1, 9, 1); paint(m, 'walltop', 0, 8, 12, 1, 1);
  for (const mx of WC_MIRRORS) { R(x, '#2a2136', mx - 1, 5, 26, 21); R(x, '#c9ccd4', mx, 6, 24, 19); R(x, '#dff1fa', mx + 1, 7, 22, 17); R(x, '#eef8fd', mx + 1, 7, 22, 2); addObj(m, { s: 'wcsink', x: mx - 1, y: 26, sol: [1, 2, 24, 18] }); }
  drawDoor(x, 126, 7, 14, 25, '#e98fa5'); drawDoor(x, 146, 7, 14, 25, '#e98fa5');
  addObj(m, { s: 'plant', x: 160, y: 96, sol: [2, 14, 12, 9] });
}

/* ---------- bạn bè đứng đợi ở chỗ hẹn ---------- */
function addMeetNpcs() {
  for (const pl in PLACES) Object.keys(FRIENDS).forEach((fid, i) => {
    const P = PLACES[pl], F = FRIENDS[fid];
    NPCS.push({ id: 'meet_' + pl + '_' + fid, fid, name: F.name, look: fid, outfit: () => friendOutfit(fid), map: P.map, x: P.x + (i % 2) * 6, y: P.y, dir: 0, vis: () => meetHere(pl) === fid, label: () => `${F.name} — đang đợi bạn ở đây`, act: () => ACT.friend(fid, 'meet') });
  });
}

/* ---------------- SÂN TRƯỜNG ---------------- */
function buildSchool() {
  const m = mapNew('school', 'Sân trường', 44, 28, false);
  paint(m, 'yard', 0, 0, 44, 24, 0);
  paint(m, 'grass', 0, 7, 6, 16, 0); paint(m, 'flowers', 1, 9, 1, 1, 0); paint(m, 'flowers', 4, 13, 1, 1, 0); paint(m, 'flowers', 2, 19, 1, 1, 0); paint(m, 'flowers', 4, 21, 1, 1, 0);
  paint(m, 'court', 30, 8, 13, 13, 0);
  const W = '#eef7ee'; R(m.x, W, 484, 132, 200, 1); R(m.x, W, 484, 331, 200, 1); R(m.x, W, 484, 132, 1, 200); R(m.x, W, 683, 132, 1, 200); R(m.x, W, 484, 232, 200, 1); ring(m.x, W, 584, 232, 18);
  paint(m, 'walk', 0, 24, 44, 2, 0); paint(m, 'road', 0, 26, 44, 2, 1);
  for (let i = 0; i < 44; i += 2) R(m.x, '#f3e6a8', i * 16 + 4, 27 * 16 + 4, 12, 2);
  R(m.x, '#aaa392', 0, 414, 704, 2);
  addObj(m, { s: 'school', x: 191, y: 3, sol: [1, 22, 320, 79], label: () => 'Bảng tin — thời khoá biểu, lịch kiểm tra', act: () => UI.timetable() });
  m.warps.push({ x: 235, y: 102, w: 18, h: 12, dir: 3, to: { map: 'class', x: 289, y: 204, dir: 3 } });
  m.labels.push({ x: 352, y: 30.5, text: 'THPT HOA PHƯỢNG', size: 9, col: '#ffffff', maxw: 74 });
  m.labels.push({ x: 244.5, y: 68.5, text: '10A1', size: 4.6, col: '#2a2136', maxw: 14 });
  m.warps.push({ x: 452, y: 102, w: 18, h: 12, dir: 3, to: { map: 'lab', x: 289, y: 204, dir: 3 } });
  m.labels.push({ x: 461.5, y: 68.5, text: 'LAB', size: 4.6, col: '#2a2136', maxw: 14 });
  addObj(m, { s: 'canteen', x: 40, y: 50, sol: [1, 32, 76, 23], label: () => 'Căn tin — mua đồ ăn', act: () => ACT.canteen() });
  m.labels.push({ x: 79, y: 57.5, text: 'CĂN TIN', size: 6.5, col: '#2a2136', maxw: 40 });
  addObj(m, { s: 'bikeshed', x: 524, y: 62, sol: [1, 26, 96, 17] });
  addObj(m, { s: 'flagpole', x: 342, y: 108, sol: [3, 52, 14, 9] });
  for (const [a, b] of [[96, 140], [96, 250], [430, 140], [430, 250]]) addObj(m, { s: 'treeRed', x: a, y: b, sol: [13, 38, 10, 9] });
  for (const [a, b] of [[136, 172], [136, 282], [396, 172], [396, 282]]) addObj(m, { s: 'benchstone', x: a, y: b, sol: [1, 1, 28, 12] });
  addObj(m, { s: 'tree', x: 18, y: 150, sol: [13, 38, 10, 9] }); addObj(m, { s: 'tree2', x: 34, y: 244, sol: [13, 38, 10, 9] }); addObj(m, { s: 'bush', x: 60, y: 206, sol: [2, 4, 18, 9] }); addObj(m, { s: 'bush', x: 12, y: 318, sol: [2, 4, 18, 9] });
  addObj(m, { s: 'goal', x: 564, y: 118, sol: [1, 2, 38, 8], label: () => "Sân thể dục — chơi thể thao 20'", act: () => ACT.field() });
  addObj(m, { s: 'ball', x: 600, y: 250, flat: true });
  // tường rào + cổng
  for (let i = 0; i < 44; i++) { if (i >= 18 && i <= 25) continue; addObj(m, { s: 'wallseg', x: i * 16 - 1, y: 363, sol: [0, 8, 18, 14] }); }
  addObj(m, { s: 'gate', x: 287, y: 340, label: () => 'Cổng trường — về nhà', act: () => ACT.leaveSchool() });
  m.solids.push([288, 372, 15, 14], [400, 372, 15, 14]);
  m.labels.push({ x: 351.5, y: 348.5, text: 'TRƯỜNG THPT HOA PHƯỢNG', size: 7, col: '#ffffff', maxw: 96 });
  addObj(m, { s: 'booth', x: 422, y: 322, sol: [1, 14, 30, 27] });
  m.zones.push({ x: 296, y: 398, w: 112, h: 20, fn: () => ACT.leaveSchool(), by: -10 });

  // cổng sau: lối mòn lên núi sau trường (chỉ mở khi tan học)
  paint(m, 'dirt', 1, 0, 2, 7, 0);
  addObj(m, { s: 'backgate', x: 6, y: 0 }); m.solids.push([7, 0, 7, 24], [35, 0, 7, 24]);
  addObj(m, { s: 'trailsign', x: 48, y: 6, sol: [9, 16, 6, 8], label: () => "Cổng sau — lối lên núi sau trường (đi bộ 10')", act: () => ACT.toHill('school') });
  m.zones.push({ x: 14, y: 5, w: 21, h: 8, fn: () => ACT.toHill('school'), by: 12 });
  addObj(m, { s: 'libsign', x: 378, y: 92, sol: [6, 18, 10, 7], label: () => `Thư viện — đọc sách ${LIBRARY.mins}'`, act: () => ACT.library() });

  NPCS.push({ id: 'guard', name: 'Bác bảo vệ', look: 'guard', map: 'school', x: 392, y: 362, dir: 1, vis: () => G.time < 1200, label: () => 'Bác bảo vệ', act: () => ACT.guard() });
  // học sinh ra sân giờ ra chơi
  const yard = () => yardTime();
  const spots = [[250, 250], [300, 300], [180, 220], [220, 320], [380, 240], [330, 200], [200, 280], [360, 310]];
  const mates = [['khoa', 'Khoa', 'khoa'], ['vy', 'Vy', 'vy'], ['dat', 'Đạt', 'dat'], ['m1', 'Bạn cùng lớp', 'c1'], ['ngan', 'Ngân', 'ngan'], ['m3', 'Bạn cùng lớp', 'c3'], ['m4', 'Bạn cùng lớp', 'c4'], ['m5', 'Bạn cùng lớp', 'c5']];
  mates.forEach(([id, name, look], i) => {
    const fr = !!FRIENDS[id];
    NPCS.push({ id: 'y_' + id, fid: fr ? id : null, sid: id, name, look, map: 'school', x: spots[i][0], y: spots[i][1], dir: i % 4, wander: 34, vis: yard, label: () => name + (fr ? ' — trò chuyện' : ' — bắt chuyện'), act: () => (fr ? ACT.friend(id, 'school') : ACT.mate(id)) });
  });
}

/* ---------------- LỚP HỌC ---------------- */
const SEAT = { x: 111, y: 134 };
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
      // bạn thân ngồi gần: giờ giải lao 10' giữa 2 tiết có thể quay sang rủ rê, trò chuyện, đấu thẻ
      NPCS.push({
        id: 's_' + c + r + sd, sid: sp || null, fid: fr ? sp : null, name: fr ? fr.name : 'Bạn học', look: sp ? spLook[sp] : looks[(k++ * 3 + r) % 8], map: 'class', x: sx, y: sy, dir: 3, solid: true,
        vis: sp ? () => classSeated() && !yardTime() && !sceneHides(sp) : () => classSeated(),
        label: fr ? () => `${fr.name} (${fr.seat}) — trò chuyện, rủ rê` : null, act: fr ? () => ACT.friend(sp, 'class') : null,
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

function buildMaps() { buildHome(); buildTown(); buildSchool(); buildClass(); buildLab(); buildPho(); buildHill(); buildWC(); addMeetNpcs(); buildFamily(); }
