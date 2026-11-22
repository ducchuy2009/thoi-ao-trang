'use strict';
/* ============================================================
 *  03c. GIA ĐÌNH & PHỐ BỜ ĐÔNG
 *  - Phòng bố mẹ (cửa trong phòng khách): giường đôi, bàn làm việc của bố (hộc bàn), bàn trang điểm của mẹ
 *  - Công ty Sen Vàng của mẹ (cuối phố Hoa Phượng) · nhà máy bánh kẹo của bố (phố Bờ Đông) — vào được để gặp bố mẹ
 *  - Phố Bờ Đông (bên phải bờ sông, có trạm xe buýt): nhà vài cô chú hàng xóm, nhà hàng Sen Hồng, karaoke Âm Vang
 * ============================================================ */
const atWork = who => !!FAM[who] && FAM[who].hidden && FAM[who].hiddenAt === 'work';
const inRoom = who => !!FAM[who] && FAM[who].hidden && FAM[who].hiddenAt === 'room';
const DONG = { w: 60, h: 26, factory: 600, rest: 344, kara: 470, bus: [300, 146, 280, 188] };
const DONG_HOUSES = [['hs_bungalow', 20, 'bac_tu'], ['hs_shop', 124, 'co_lanh'], ['hs_tube2', 228, 'anh_long']];   // nhà gỗ hiên quanh · nhà ống có quầy bánh cuốn · nhà ống 3 tầng
const NEIGHBOR_TALK = {
  bac_tu: ['Bác về hưu rồi, sáng nào cũng ra bờ sông đánh cờ với mấy ông bạn.', 'Học hành cho giỏi vào cháu, bác ngày xưa đi học phải lội bộ qua sông đấy.', 'Nhà máy bánh kẹo đầu phố thơm mùi đường cả ngày, cháu ngửi thấy không?'],
  co_lanh: ['Cô bán bánh cuốn ở chợ, sáng mai qua cô làm cho đĩa nóng hổi nhé.', 'Con nhà ai mà ngoan thế, đi đâu đấy cháu?', 'Tối nay quán karaoke kia lại hát to cho xem, cả phố nghe.'],
  anh_long: ['Anh làm đầu bếp ở nhà hàng Sen Hồng. Món bún chả bên anh ngon nhất phố!', 'Học xong cấp ba em định thi trường gì? Anh hồi đó thi trường nấu ăn.', 'Cuối tuần rủ bạn qua hát karaoke đi, vui lắm.'],
};
function neighborTalk(soc) {
  const S = SOCIETY[soc]; meetSoc(soc);
  if (tetTime()) return tetElder('nb_' + soc, S.name, { look: S.look }, 20000);
  const k = 'nb_' + soc; if (!G.daily[k]) { G.daily[k] = true; }
  UI.ask(S.name, `<p>“${pick(NEIGHBOR_TALK[soc])}”</p>`, ['Dạ, cháu chào ạ!'], { who: { look: S.look } });
}
function buildFamilyPlaces() {
  /* ---------- phòng bố mẹ ---------- */
  const h = MAPS.home;
  h.warps.push({ x: 250, y: 30, w: 16, h: 12, dir: 3, to: { map: 'phongbm', x: 209, y: 156, dir: 3 } });
  let m = roomBase('phongbm', 'Phòng bố mẹ', '#f3e7cc', '#d9c4a0', 'wood', 16, 11);
  roomExit(m, { map: 'home', x: 258, y: 50, dir: 0 });
  drawWin(m.x, 120, 9, 22, 13);
  addObj(m, { s: 'famphoto', x: 60, y: 10, base: 0 });
  addObj(m, { s: 'bed2', x: 104, y: 36, sol: [1, 6, 46, 36], label: () => 'Giường của bố mẹ', act: () => UI.say('Phòng bố mẹ', inRoom('mom') || inRoom('dad') ? 'Bố mẹ đang nghỉ trong phòng, đi nhẹ thôi.' : 'Chăn gối gấp gọn gàng. Giường của bố mẹ, không nằm lung tung được.') });
  addObj(m, { s: 'nightstand', x: 88, y: 46, sol: [1, 6, 12, 10] }); addObj(m, { s: 'nightstand', x: 154, y: 46, sol: [1, 6, 12, 10] });
  addObj(m, { s: 'workdesk', x: 20, y: 26, sol: [1, 2, 34, 25], label: () => 'Bàn làm việc của bố — hộc bàn đựng giấy tờ', act: () => UI.say('Bàn làm việc của bố', 'Giấy tờ của bố xếp gọn trong hộc bàn. Không có việc gì thì đừng lục lọi đồ của bố nhé.') });
  addObj(m, { s: 'chair', x: 32, y: 52, sol: [1, 1, 12, 11] });
  addObj(m, { s: 'dresser', x: 196, y: 20, sol: [1, 16, 28, 16], label: () => 'Bàn trang điểm của mẹ', act: () => UI.say('Bàn trang điểm của mẹ', 'Lọ kem, thỏi son, cặp kính đọc sách của mẹ xếp ngay ngắn.') });
  addObj(m, { s: 'wardrobe', x: 20, y: 96, sol: [1, 10, 30, 29] }); addObj(m, { s: 'plant', x: 216, y: 120, sol: [2, 14, 12, 9] }); addObj(m, { s: 'rug', x: 96, y: 104, flat: true });
  // bố mẹ đang nghỉ trong phòng thì thấy ở đây (đêm ngủ trên giường)
  for (const [who, x, y] of [['mom', 116, 62], ['dad', 140, 62]]) NPCS.push({ id: 'pr_' + who, pf: who, name: PNAME[who], look: who, outfit: () => (who === 'dad' ? 'dadhome' : null), map: 'phongbm', x, y, dir: 0, vis: () => inRoom(who), label: () => `${PNAME[who]} — đang nghỉ trong phòng`, act: () => (G.time >= 1290 || G.time < 330 ? UI.say(PNAME[who], `${PNAME[who]} đang ngủ say. Khẽ thôi kẻo ${PNAME[who].toLowerCase()} thức giấc.`) : ACT.parent(who)) });

  /* ---------- công ty Sen Vàng của mẹ (cuối phố Hoa Phượng) ---------- */
  m = roomBase('congty', 'Công ty Sen Vàng', '#eef3f8', '#b9c9dc', 'ltile', 20, 13);
  roomExit(m, { map: 'pho', x: MOM_CO.x + 76, y: 136, dir: 0 });
  drawWin(m.x, 40, 9, 22, 13); drawWin(m.x, 140, 9, 22, 13); drawWin(m.x, 240, 9, 22, 13);
  m.labels.push({ x: 160, y: 22, text: 'SEN VÀNG', size: 7, col: '#c9962a', maxw: 60 });
  addObj(m, { s: 'counter', x: 238, y: 140, sol: [1, 4, 16, 23] }); addObj(m, { s: 'counter', x: 254, y: 140, sol: [1, 4, 16, 23] });
  NPCS.push({ id: 'ct_le', name: 'Chị lễ tân', look: 'c6', outfit: () => 'cas_vy', map: 'congty', x: 254, y: 132, dir: 0, label: () => 'Chị lễ tân', act: () => UI.ask('Chị lễ tân', `<p>“${atWork('mom') ? 'Em tìm mẹ à? Mẹ em ngồi bàn trong góc kia, cạnh cửa sổ đó.' : 'Hôm nay mẹ em không ở công ty, em về nhà tìm mẹ nhé.'}”</p>`, ['Dạ, em cảm ơn chị!'], { who: { look: 'c6', outfit: 'cas_vy' } }) });
  const desks = [[30, 50], [100, 50], [170, 50], [30, 104], [100, 104], [170, 104]];
  desks.forEach(([a, b], i) => { addObj(m, { s: 'officedesk', x: a, y: b, sol: [1, 10, 32, 14] }); addObj(m, { s: 'chair', x: a + 11, y: b + 26, sol: [1, 1, 12, 11] }); });
  [['c3', 'cas_khoa', 1], ['c7', 'cas_dat', 2], ['c2', 'cas_ngan', 4]].forEach(([look, of, i]) => { const [a, b] = desks[i]; NPCS.push({ id: 'ct_w' + i, name: 'Đồng nghiệp của mẹ', look, outfit: () => of, map: 'congty', x: a + 17, y: b + 34, dir: 3, label: () => 'Đồng nghiệp của mẹ', act: () => UI.ask('Đồng nghiệp của mẹ', `<p>“${pick(['Con của chị ấy đây à? Ngoan quá!', 'Mẹ cháu làm việc giỏi lắm, cả phòng ai cũng quý.', 'Cuối tháng công ty đi du lịch, mẹ cháu có rủ cả nhà không?'])}”</p>`, ['Dạ, cháu chào cô chú!'], { who: { look, outfit: of } }) }); });
  NPCS.push({ id: 'w_mom', pf: 'mom', name: 'Mẹ', look: 'mom', outfit: () => 'noapron', map: 'congty', x: desks[0][0] + 17, y: desks[0][1] + 34, dir: 3, vis: () => atWork('mom'), label: () => 'Mẹ — đang làm việc ở công ty', act: () => ACT.parentWork('mom') });

  /* ---------- phố Bờ Đông (bên phải bờ sông) ---------- */
  m = mapNew('dong', 'Phố Bờ Đông', DONG.w, DONG.h, false);
  paint(m, 'grass', 0, 0, DONG.w, DONG.h, 0);
  paint(m, 'walk', 0, 8, DONG.w, 4, 0); paint(m, 'road', 0, 12, DONG.w, 3, 0); paint(m, 'walk', 0, 15, DONG.w, 2, 0);
  for (let i = 0; i < DONG.w; i += 2) R(m.x, '#f3e6a8', i * 16 + 4, 13 * 16 + 7, 12, 2);
  R(m.x, '#aaa392', 0, 190, DONG.w * 16, 2); R(m.x, '#aaa392', 0, 240, DONG.w * 16, 2);
  // bờ sông phía dưới: bãi cỏ, ghế đá, hàng cây
  R(m.x, '#5fb0e0', 0, 360, DONG.w * 16, 56); R(m.x, '#8fd0f0', 0, 360, DONG.w * 16, 3); for (let i = 0; i < 40; i++) R(m.x, '#eaf6fc', i * 24 + (i % 3) * 5, 372 + (i % 2) * 14, 9, 1);
  for (let i = 0; i < DONG.w; i++) m.solid[22 * DONG.w + i] = m.solid[23 * DONG.w + i] = m.solid[24 * DONG.w + i] = m.solid[25 * DONG.w + i] = 1;
  for (const [hs, hx, soc] of DONG_HOUSES) {
    const S = SOCIETY[soc];
    addHouse(m, hs, hx, 47, { label: () => `Nhà ${S.name.toLowerCase()} — hàng xóm phố Bờ Đông`, act: () => neighborTalk(soc) });
    NPCS.push({ id: 'nb_' + soc, soc, name: S.name, look: S.look, outfit: S.outfit ? () => S.outfit : undefined, map: 'dong', x: hx + 49, y: 146, dir: 0, wander: 10, vis: () => inWin(G.time, 360, 1260), label: () => S.name + ' — trò chuyện', act: () => neighborTalk(soc) });
  }
  addObj(m, { door: true, s: 'nhahangB', x: DONG.rest, y: 46, sol: [1, 32, 108, 50], label: () => 'Nhà hàng Sen Hồng — vào ăn', act: () => ACT.enterDong('nhahang') });
  m.labels.push({ x: DONG.rest + 55, y: 74.5, text: 'NHÀ HÀNG SEN HỒNG', size: 6, col: '#ffd23a', maxw: 78 });
  addObj(m, { door: true, s: 'karaokeB', x: DONG.kara, y: 46, sol: [1, 32, 98, 50], label: () => 'Karaoke Âm Vang — vào hát', act: () => ACT.enterDong('karaoke') });
  m.labels.push({ x: DONG.kara + 50, y: 62.5, text: 'KARAOKE ÂM VANG', size: 6.5, col: '#ffe066', maxw: 76 });
  addObj(m, { door: true, s: 'nhamayB', x: DONG.factory, y: 36, sol: [1, 40, 198, 52], label: () => 'Nhà máy bánh kẹo Hoa Phượng — chỗ bố làm việc', act: () => ACT.enterWork('dad') });
  m.labels.push({ x: DONG.factory + 100, y: 74.5, text: 'NHÀ MÁY BÁNH KẸO HOA PHƯỢNG', size: 6, col: '#ffffff', maxw: 170 });
  for (const lx of [110, 330, 560, 830]) addObj(m, { s: 'lamp', x: lx, y: 112, sol: [3, 38, 6, 6] });
  for (const [s2, a, b] of [['tree', 20, 280], ['tree2', 160, 290], ['tree', 420, 284], ['tree2', 640, 292], ['tree', 860, 282]]) addObj(m, { s: s2, x: a, y: b, sol: [13, 38, 10, 9] });
  for (const a of [90, 280, 520, 740]) addObj(m, { s: 'bench', x: a, y: 316, sol: [1, 1, 28, 12] });
  addBusStop(m, 'dong', ...DONG.bus);
  addObj(m, { s: 'signpostL', x: 22, y: 148, sol: [10, 22, 8, 8], label: () => '← Bờ sông, câu cá', act: () => ACT.go('dong', 'song') });
  m.zones.push({ x: 0, y: 160, w: 8, h: 112, fn: () => ACT.go('dong', 'song'), bx: 6 });
  NPCS.push({ id: 'dong_a', name: 'Người đi dạo', look: 'c5', outfit: () => 'cas_khoa', map: 'dong', x: 380, y: 300, dir: 2, wander: 46, vis: () => inWin(G.time, 420, 1290) });
  NPCS.push({ id: 'dong_b', name: 'Người đi dạo', look: 'c8', outfit: () => 'cas_ngan', map: 'dong', x: 700, y: 176, dir: 1, wander: 46, vis: () => inWin(G.time, 480, 1290) });
  // đường từ bờ sông sang phố Bờ Đông
  const song = MAPS.song;
  addObj(song, { s: 'signpost', x: 610, y: 26, sol: [10, 22, 8, 8], label: () => 'Phố Bờ Đông →', act: () => ACT.go('song', 'dong') });
  song.zones.push({ x: 632, y: 40, w: 8, h: 60, fn: () => ACT.go('song', 'dong'), bx: -6 });

  /* ---------- nhà hàng Sen Hồng ---------- */
  m = roomBase('nhahang', 'Nhà hàng Sen Hồng', '#f6e6c8', '#c9862f', 'wood', 20, 13);
  roomExit(m, { map: 'dong', x: DONG.rest + 55, y: 140, dir: 0 });
  drawWin(m.x, 40, 9, 22, 13); drawWin(m.x, 240, 9, 22, 13);
  for (const [a, b] of [[30, 50], [110, 50], [190, 50], [30, 110], [110, 110]]) addObj(m, { s: 'rtable', x: a, y: b, sol: [1, 6, 34, 14], label: () => 'Bàn ăn — gọi món', act: () => ACT.restaurant() });
  addObj(m, { s: 'counter', x: 226, y: 104, sol: [1, 4, 16, 23] }); addObj(m, { s: 'counter', x: 242, y: 104, sol: [1, 4, 16, 23] }); addObj(m, { s: 'stove', x: 258, y: 104, sol: [1, 4, 16, 23] });
  NPCS.push({ id: 'nh_bep', soc: 'anh_long', name: 'Anh Long (đầu bếp)', look: 'chef', map: 'nhahang', x: 248, y: 96, dir: 0, label: () => 'Anh Long — đầu bếp', act: () => ACT.restaurant() });
  NPCS.push({ id: 'nh_pv', name: 'Chị phục vụ', look: 'c2', outfit: () => 'cas_vy', map: 'nhahang', x: 160, y: 96, dir: 0, wander: 30, label: () => 'Chị phục vụ — gọi món', act: () => ACT.restaurant() });
  [['c4', 'cas_ngan', 44, 78], ['c1', 'cas_dat', 210, 78], ['c8', 'cas_vy', 124, 138]].forEach(([look, of, a, b], i) => NPCS.push({ id: 'nh_k' + i, name: 'Thực khách', look, outfit: () => of, map: 'nhahang', x: a, y: b, dir: 3 }));

  /* ---------- karaoke Âm Vang ---------- */
  m = roomBase('karaoke', 'Karaoke Âm Vang', '#3a2f4a', '#5f4a8a', 'ctile', 14, 10);
  roomExit(m, { map: 'dong', x: DONG.kara + 50, y: 140, dir: 0 });
  addObj(m, { s: 'ktv', x: 82, y: 2, base: 36, label: () => 'Màn hình karaoke — thuê phòng hát', act: () => ACT.karaoke() });
  addObj(m, { s: 'sofa', x: 70, y: 96, sol: [1, 6, 46, 15], label: () => 'Ghế sofa — thuê phòng hát', act: () => ACT.karaoke() });
  addObj(m, { s: 'mic', x: 64, y: 50, sol: [2, 16, 6, 6] }); addObj(m, { s: 'speaker', x: 30, y: 30, sol: [1, 12, 12, 10] }); addObj(m, { s: 'speaker', x: 170, y: 30, sol: [1, 12, 12, 10] });
  NPCS.push({ id: 'kr_nv', name: 'Anh nhân viên', look: 'c5', outfit: () => 'cas_khoa', map: 'karaoke', x: 180, y: 120, dir: 1, label: () => 'Anh nhân viên — thuê phòng', act: () => ACT.karaoke() });

  /* ---------- nhà máy bánh kẹo của bố ---------- */
  m = roomBase('nhamay', 'Nhà máy bánh kẹo Hoa Phượng', '#e2ddd2', '#a8acb6', 'ctile', 24, 13);
  roomExit(m, { map: 'dong', x: DONG.factory + 100, y: 140, dir: 0 });
  for (const b of [56, 112]) addObj(m, { s: 'conveyor0', dyn: () => 'conveyor' + (Math.floor(performance.now() / 260) % 2), x: 40, y: b, sol: [0, 4, 120, 10] });
  for (const [a, b] of [[176, 46], [176, 102], [230, 46]]) addObj(m, { s: 'machine', x: a, y: b, sol: [1, 10, 28, 24], label: () => 'Máy đóng gói kẹo', act: () => UI.say('Nhà máy', 'Máy chạy ro ro, từng gói kẹo Sao Vàng nối đuôi nhau ra băng chuyền. Thơm mùi đường quá!') });
  addObj(m, { s: 'officedesk', x: 300, y: 112, sol: [1, 10, 32, 14] });
  [['c3', 'cas_khoa', 60, 92], ['c6', 'cas_ngan', 120, 92], ['c7', 'cas_dat', 90, 148]].forEach(([look, of, a, b], i) => NPCS.push({ id: 'nm_w' + i, name: 'Công nhân', look, outfit: () => of, map: 'nhamay', x: a, y: b, dir: 3, label: () => 'Cô chú công nhân', act: () => UI.ask('Cô chú công nhân', `<p>“${pick(['Con của trưởng ca đây à? Bố cháu là trưởng ca giỏi nhất xưởng đấy.', 'Kẹo vừa ra lò còn nóng, cháu cầm vài viên ăn thử này.', 'Đi lại cẩn thận nhé cháu, máy móc nguy hiểm lắm.'])}”</p>`, ['Dạ, cháu cảm ơn!'], { who: { look, outfit: of } }) }));
  NPCS.push({ id: 'w_dad', pf: 'dad', name: 'Bố', look: 'dad', map: 'nhamay', x: 316, y: 146, dir: 3, vis: () => atWork('dad'), label: () => 'Bố — đang làm việc ở nhà máy', act: () => ACT.parentWork('dad') });
  NPCS.push({ id: 'nm_bv', name: 'Chú bảo vệ', look: 'guard', map: 'nhamay', x: 330, y: 190, dir: 1, label: () => 'Chú bảo vệ nhà máy', act: () => UI.ask('Chú bảo vệ', `<p>“${atWork('dad') ? 'Cháu tìm bố à? Bố cháu ngồi bàn trưởng ca ở góc trong kia.' : 'Bố cháu hết ca về rồi, cháu về nhà tìm nhé.'}”</p>`, ['Dạ!'], { who: { look: 'guard' } }) });
}
