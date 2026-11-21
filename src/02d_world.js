'use strict';
/* ============================================================
 *  02d. CÔNG TRÌNH THEO PHONG CÁCH BẢN THẢO (art/chars/tileset_mau.webp)
 *  Vẽ lại các công trình chính, GIỮ NGUYÊN kích thước sprite cũ (toạ độ, va chạm, cửa ra vào trên bản đồ không đổi):
 *  mái ngói đỏ có từng hàng ngói + nóc sáng, tường vàng kem có chân tường gạch, cửa sổ chớp xanh, biển hiệu nền xanh chữ trắng,
 *  cổng trường trụ gạch đỏ mái ngói, hàng rào trụ gạch + song trắng, chòi bảo vệ, nhà xe mái tôn, quầy căn tin kiểu cơm bình dân,
 *  vỉa hè lát gạch đỏ, cột điện kéo dây, ghế nhựa, xe máy dựng trước nhà.
 *  buildWorldArt() chạy sau buildSprites / buildSprites2, trước buildMaps.
 * ============================================================ */
const WC = {
  roof: '#c8583f', roofL: '#e27b5c', roofS: '#9c3f33', roofD: '#7a2f2a',
  wall: '#f6dfa6', wallL: '#fff0c4', wallS: '#dcbf82', trim: '#fff8e2',
  brick: '#b5533c', brickL: '#cf6a4e', mortar: '#e9c9a3', stone: '#cfc6b4', stoneS: '#ada392',
  shutter: '#3f8f5a', shutterS: '#2f6d44', glass: '#8fc3dc', glassL: '#c8e8f2', wood: '#8a5a3a', woodS: '#6b4029', woodL: '#a9703f',
  sign: '#2f5d8a', signL: '#4a7fb5', signS: '#21456a', metal: '#8b93a6', metalS: '#636b7e', ink: '#2a2136',
};
// mái ngói: hàng ngói so le, nóc mái sáng, mép mái có bóng — (x, y) góc trên trái, rộng w, cao h
function tileRoof(x, a, b, w, h, base, opt) {
  const o = opt || {}, L = shade(base, 22), S = shade(base, -24), D = shade(base, -42);
  R(x, D, a, b + h - 2, w, 2);                                                  // mép mái (bóng đổ xuống tường)
  R(x, base, a, b, w, h - 2);
  for (let y = b + 2, row = 0; y < b + h - 2; y += 3, row++) {                  // từng hàng ngói vảy cá
    R(x, S, a, y + 2, w, 1);
    for (let i = a + (row % 2 ? 2 : 0); i < a + w; i += 4) { R(x, L, i, y, 2, 1); R(x, S, i + 3, y, 1, 2); }
  }
  R(x, L, a, b, w, 1); R(x, shade(base, 36), a + 2, b, w - 4, 1);               // nóc mái
  if (o.ridge) { R(x, D, a, b, w, 2); R(x, L, a, b, w, 1); }
  if (o.eave !== false) { R(x, D, a - 1, b + h - 3, 1, 3); R(x, D, a + w, b + h - 3, 1, 3); }
}
// tôn lượn sóng (mái nhà xe, quán)
function tinRoof(x, a, b, w, h, base) {
  const L = shade(base, 20), S = shade(base, -22);
  R(x, base, a, b, w, h); for (let i = a; i < a + w; i += 3) R(x, i % 2 ? L : S, i, b, 1, h);
  R(x, S, a, b + h - 1, w, 1); R(x, L, a, b, w, 1);
}
// gạch đỏ có mạch vữa
function brickWall(x, a, b, w, h, col, mortar) {
  const c = col || WC.brick, m = mortar || WC.mortar;
  R(x, c, a, b, w, h);
  for (let y = b + 3, j = 0; y < b + h; y += 4, j++) { R(x, m, a, y, w, 1); for (let i = a + (j % 2 ? 2 : 5); i < a + w; i += 6) R(x, m, i, y - 3, 1, 3); }
  R(x, shade(c, 18), a, b, w, 1);
}
// cửa sổ có chớp hai bên
function shutterWin(x, a, b, w, h, sh) {
  const s = sh || WC.shutter;
  R(x, WC.trim, a - 1, b - 1, w + 2, h + 2); R(x, WC.glass, a, b, w, h); R(x, WC.glassL, a + 1, b + 1, Math.max(1, w / 3 | 0), h - 2);
  R(x, WC.trim, a + (w >> 1), b, 1, h); R(x, WC.trim, a, b + (h >> 1), w, 1);
  for (const sx of [a - 4, a + w + 1]) { R(x, s, sx, b - 1, 3, h + 2); for (let y = b; y < b + h; y += 2) R(x, shade(s, -20), sx, y, 3, 1); }
  R(x, WC.wallS, a - 1, b + h + 1, w + 2, 1);
}
// biển hiệu nền xanh, chữ trắng
function signBoard(x, a, b, w, h, text, col, fs) {
  const c = col || WC.sign;
  R(x, WC.ink, a - 1, b - 1, w + 2, h + 2); R(x, c, a, b, w, h); R(x, shade(c, 18), a, b, w, 1); R(x, shade(c, -20), a, b + h - 1, w, 1);
  // chữ trên biển hiệu vẽ bằng nhãn chữ nét của bản đồ (m.labels — xem SIGNS trong decorWorld), không vẽ vào ảnh cho khỏi nhoè
}
function woodDoor(x, a, b, w, h) {
  R(x, WC.woodS, a - 1, b - 1, w + 2, h + 1); R(x, WC.wood, a, b, w, h); R(x, WC.woodL, a + 1, b + 1, 1, h - 2); R(x, WC.woodS, a + (w >> 1), b, 1, h);
  R(x, WC.woodL, a + 2, b + 3, (w >> 1) - 3, (h >> 1) - 4); R(x, WC.woodL, a + (w >> 1) + 2, b + 3, (w >> 1) - 3, (h >> 1) - 4); R(x, '#f4d35e', a + (w >> 1) - 2, b + (h >> 1) + 2, 1, 2);
}

function buildWorldArt() {
  /* ---------- cổng trường: hai trụ gạch đỏ mái ngói, mái ngói giữa che biển tên trường, cánh cổng sắt mở sang hai bên ---------- */
  def('gate', 128, 46, x => {
    const pillar = a => { brickWall(x, a, 10, 14, 36); R(x, shade(WC.brick, -25), a + 12, 10, 2, 36); tileRoof(x, a - 2, 4, 18, 7, WC.roof, { eave: false }); R(x, WC.stone, a - 1, 43, 16, 3); };
    pillar(0); pillar(114);
    // cánh cổng sắt mở áp vào trụ
    for (const gx of [15, 101]) { R(x, '#3f5f4a', gx, 22, 12, 1); R(x, '#3f5f4a', gx, 44, 12, 1); for (let i = gx; i < gx + 12; i += 3) R(x, '#2f4a3a', i, 22, 1, 23); R(x, '#5f8a6a', gx, 30, 12, 1); }
    // mái giữa + biển tên trường
    R(x, WC.woodS, 18, 9, 3, 13); R(x, WC.woodS, 107, 9, 3, 13);
    tileRoof(x, 14, 0, 100, 9, WC.roof);
    signBoard(x, 22, 10, 84, 10, 'TRƯỜNG THPT HOA PHƯỢNG', WC.sign, 6);
  });
  /* ---------- hàng rào: chân gạch đỏ, song trắng, trụ gạch có mũ (đặt xen kẽ — 'wallsegP') ---------- */
  const fence = (name, pillar) => def(name, 16, 20, x => {
    brickWall(x, 0, 13, 16, 7); R(x, WC.stone, 0, 12, 16, 1);
    R(x, '#fbf7ee', 0, 3, 16, 2); R(x, '#d8d2c2', 0, 4, 16, 1); R(x, '#fbf7ee', 0, 9, 16, 1);
    for (let i = 1; i < 16; i += 3) { R(x, '#fbf7ee', i, 3, 2, 9); R(x, '#d8d2c2', i + 1, 5, 1, 7); }
    if (pillar) { brickWall(x, 4, 2, 8, 18); R(x, shade(WC.brick, -25), 10, 2, 2, 18); R(x, WC.roof, 3, 0, 10, 3); R(x, WC.roofL, 3, 0, 10, 1); }
  });
  fence('wallseg', false); fence('wallsegP', true);
  /* ---------- chòi bảo vệ: mái ngói đỏ, tường kem, ô cửa kính ---------- */
  def('booth', 30, 40, x => {
    R(x, WC.wall, 2, 10, 26, 30); R(x, WC.wallL, 2, 10, 26, 1); R(x, WC.wallS, 24, 10, 4, 30); brickWall(x, 2, 34, 26, 6);
    R(x, WC.ink, 5, 14, 18, 12); R(x, WC.glass, 6, 15, 16, 10); R(x, WC.glassL, 7, 16, 4, 8); R(x, WC.trim, 5, 26, 18, 2);
    R(x, '#3b5f9c', 13, 19, 6, 6); R(x, '#e9a978', 14, 16, 4, 3); R(x, '#2f4a7a', 13, 15, 6, 2);   // bác bảo vệ ngồi sau ô kính
    tileRoof(x, 0, 0, 30, 11, WC.roof);
    R(x, WC.sign, 8, 28, 12, 4); R(x, '#fff8e2', 10, 29, 8, 1);
  });
  /* ---------- dãy nhà chính của trường: giữ nguyên vị trí các cửa (lớp 10A1, phòng thí nghiệm, sảnh giữa) ---------- */
  def('school', 320, 100, x => {
    const wall = WC.wall, wallS = WC.wallS, trim = WC.trim;
    R(x, wall, 2, 18, 316, 82); R(x, WC.wallL, 2, 18, 316, 1);
    R(x, trim, 2, 55, 316, 3); R(x, wallS, 2, 58, 316, 1);                            // ban công / gờ tầng
    brickWall(x, 2, 92, 316, 8);                                                      // chân tường gạch
    tileRoof(x, 0, 4, 320, 15, WC.roof);
    for (let i = 0; i < 10; i++) {
      if (i >= 3 && i <= 6) continue; const wx = 13 + i * 31;
      shutterWin(x, wx + 2, 30, 12, 16);
      if (i === 1 || i === 8) { woodDoor(x, wx + 1, 68, 14, 24); R(x, WC.ink, wx, 61, 16, 6); R(x, '#fff8e2', wx + 1, 62, 14, 4); }
      else shutterWin(x, wx + 2, 68, 12, 16);
    }
    for (let i = 0; i <= 10; i++) { if (i >= 4 && i <= 6) continue; const p = 5 + i * 31; R(x, trim, p, 59, 3, 33); R(x, wallS, p + 2, 59, 1, 33); }
    for (let i = 4; i < 316; i += 6) R(x, '#e8d3a0', i, 56, 2, 1);                   // lan can tầng 2
    // khối giữa: mái cao hơn, biển tên trường, quốc huy, cửa chính + bậc thềm
    R(x, trim, 112, 10, 96, 90); R(x, wall, 115, 13, 90, 79); brickWall(x, 112, 92, 96, 8);
    tileRoof(x, 106, 0, 108, 12, WC.roof, { ridge: true });
    signBoard(x, 120, 18, 80, 14, 'THPT HOA PHƯỢNG', WC.sign, 7);
    R(x, '#da251d', 152, 38, 16, 11); R(x, '#ffde59', 159, 41, 2, 5); R(x, '#ffde59', 157, 43, 6, 1); R(x, '#ffde59', 158, 45, 1, 1); R(x, '#ffde59', 161, 45, 1, 1);
    R(x, WC.ink, 141, 59, 38, 33); woodDoor(x, 143, 61, 34, 31);
    for (let i = 0; i < 3; i++) R(x, i % 2 ? WC.stoneS : WC.stone, 136 - i * 2, 92 + i * 3, 48 + i * 4, 3);
    shutterWin(x, 122, 64, 10, 14); shutterWin(x, 188, 64, 10, 14);
  });
  /* ---------- nhà ở: mái ngói đỏ / xanh, tường kem, cửa gỗ, cửa sổ chớp có bồn hoa ---------- */
  const house = (name, wall, roof, shut) => def(name, 96, 80, x => {
    const wS = shade(wall, -14);
    R(x, wall, 4, 28, 88, 52); R(x, shade(wall, 10), 4, 28, 88, 1); R(x, wS, 86, 28, 6, 52);
    brickWall(x, 4, 74, 88, 6, '#a9a090', '#c9c1b0');
    tileRoof(x, 0, 4, 96, 26, roof);
    R(x, shade(roof, -14), 38, 0, 20, 7); R(x, shade(roof, 20), 38, 0, 20, 1);            // ống khói / mái giữa
    woodDoor(x, 41, 52, 14, 28); R(x, WC.stone, 37, 78, 22, 2);
    R(x, '#ffe9a0', 39, 48, 2, 3); R(x, '#5f656f', 39, 47, 2, 1);                          // đèn hiên
    shutterWin(x, 15, 40, 14, 14, shut); shutterWin(x, 69, 40, 14, 14, shut);
    for (const fx of [11, 65]) { R(x, WC.woodS, fx, 57, 22, 3); for (let i = 0; i < 6; i++) { R(x, '#5fae4a', fx + 1 + i * 3.5, 55, 3, 2); R(x, ['#ff8fa8', '#ffd84d', '#e2574c'][i % 3], fx + 2 + i * 3.5, 54, 1, 1); } }
    R(x, '#fff3c8', 58, 60, 6, 5); R(x, WC.sign, 59, 61, 4, 3);                           // biển số nhà
  });
  house('house', '#f6e2b0', WC.roof, WC.shutter);
  house('houseB', '#e4ecf2', '#4f6f9c', '#5f8fbf');
  house('houseC', '#f4dcc6', '#c8583f', '#7a9a4a');
  house('houseD', '#efe2f2', '#8a5fa8', '#5fb0e0');
  house('houseE', '#fde6d8', '#b8503c', '#3f8f5a');
  /* ---------- tạp hoá Cô Ba: mái ngói, biển "TẠP HOÁ CÔ BA", mái hiên sọc, kệ hàng đầy ắp, tủ nước ---------- */
  def('shop', 96, 76, x => {
    R(x, WC.wall, 2, 10, 92, 66); R(x, WC.wallS, 88, 10, 6, 66);
    tileRoof(x, 0, 0, 96, 12, WC.roof);
    signBoard(x, 8, 13, 80, 11, 'TẠP HOÁ CÔ BA', WC.sign, 7);
    for (let i = 0; i < 12; i++) { R(x, i % 2 ? '#fbf7ee' : '#e2574c', i * 8, 26, 8, 8); R(x, i % 2 ? '#e3ddd0' : '#b8443a', i * 8, 32, 8, 2); R(x, i % 2 ? '#fbf7ee' : '#e2574c', i * 8 + 1, 34, 6, 2); }
    R(x, '#3a3046', 6, 37, 62, 34);                                                       // gian hàng mở cửa
    for (let s = 0; s < 4; s++) { R(x, WC.woodL, 7, 44 + s * 7, 60, 1); for (let i = 0; i < 14; i++) R(x, ['#e2574c', '#f2c94c', '#5fae4a', '#3b82c4', '#f08a7e', '#fbf7ee'][(i + s * 3) % 6], 8 + i * 4, 39 + s * 7, 3, 5); }
    R(x, '#dfe9ee', 72, 38, 18, 32); R(x, WC.metalS, 72, 38, 18, 2); R(x, WC.glass, 74, 41, 14, 24); for (let i = 0; i < 3; i++) { R(x, '#e2574c', 75 + i * 4, 44, 3, 6); R(x, '#5fae4a', 75 + i * 4, 53, 3, 6); }   // tủ nước ngọt
    brickWall(x, 2, 70, 92, 6, '#a9a090', '#c9c1b0');
  });
  /* ---------- trung tâm học thêm Sao Mai ---------- */
  def('center', 96, 76, x => {
    R(x, '#eef2f4', 2, 10, 92, 66); R(x, '#cfd8de', 88, 10, 6, 66);
    tileRoof(x, 0, 0, 96, 12, '#4f6f9c');
    signBoard(x, 10, 14, 76, 11, 'HỌC THÊM SAO MAI', '#2f7d5b', 7);
    for (let i = 0; i < 3; i++) shutterWin(x, 12 + i * 28, 32, 14, 12, '#4f6f9c');
    R(x, WC.ink, 38, 49, 20, 27); R(x, WC.glass, 39, 50, 18, 26); R(x, WC.glassL, 40, 51, 4, 24); R(x, WC.metalS, 47, 50, 1, 26);
    R(x, '#fff8e2', 8, 52, 24, 14); R(x, '#e2574c', 10, 54, 20, 2); for (let i = 0; i < 4; i++) R(x, '#8b8f9c', 10, 58 + i * 2, 16 - i * 3, 1);   // bảng thông báo tuyển sinh
    for (const px of [66, 80]) { R(x, '#8a5a3a', px, 64, 8, 6); R(x, '#5fae4a', px - 1, 58, 10, 7); R(x, '#7cc75f', px, 58, 5, 3); }
    brickWall(x, 2, 70, 92, 6, '#a9a090', '#c9c1b0');
  });
  /* ---------- căn tin: kiểu quán cơm bình dân — mái tôn, biển hiệu, tủ kính thức ăn ---------- */
  def('canteen', 76, 54, x => {
    R(x, WC.wall, 2, 12, 72, 42); R(x, WC.wallS, 68, 12, 6, 42);
    tinRoof(x, 0, 0, 76, 10, '#8a6a4a');
    signBoard(x, 10, 9, 56, 9, 'CĂN TIN', '#c8583f', 6);
    R(x, '#3a3046', 6, 20, 64, 18);
    const v = charSheet('vendor')[0][0]; x.drawImage(v, 0, 0, v.width, 24, 26, 14, v.width, 24);   // cô bán hàng đứng sau quầy
    R(x, '#dfe9ee', 4, 34, 68, 14); R(x, WC.metalS, 4, 34, 68, 2); R(x, WC.glass, 6, 37, 64, 8);   // tủ kính bày món
    for (let i = 0; i < 7; i++) { R(x, '#fbf7ee', 8 + i * 9, 39, 7, 4); R(x, ['#e98fa5', '#f2c94c', '#5fae4a', '#c8583f', '#8a5a3a', '#f2c94c', '#5fae4a'][i], 9 + i * 9, 39, 5, 2); }
    R(x, WC.woodS, 4, 48, 68, 6); R(x, WC.wood, 4, 48, 68, 2);
  });
  /* ---------- nhà xe: mái tôn xanh trên cột sắt, xe đạp dựng hàng ---------- */
  def('bikeshed', 96, 42, x => {
    for (const px of [2, 46, 90]) R(x, WC.metalS, px, 8, 3, 34);
    tinRoof(x, 0, 0, 96, 9, '#4f7fa8');
    signBoard(x, 36, 9, 24, 7, 'NHÀ XE', WC.sign, 5);
    for (let i = 0; i < 5; i++) {
      const bx = 6 + i * 17, col = ['#3b82c4', '#e2574c', '#5fae4a', '#f2c94c', '#c9a0f0'][i];
      for (const wx of [bx, bx + 10]) { R(x, '#2f2a3a', wx, 30, 6, 1); R(x, '#2f2a3a', wx, 35, 6, 1); R(x, '#2f2a3a', wx, 31, 1, 4); R(x, '#2f2a3a', wx + 5, 31, 1, 4); }
      R(x, col, bx + 3, 27, 10, 1); R(x, col, bx + 7, 24, 1, 6); R(x, col, bx + 3, 28, 1, 4); R(x, '#2f2a3a', bx + 5, 23, 4, 1); R(x, '#2f2a3a', bx + 12, 23, 1, 3);
    }
  });
  /* ---------- đạo cụ phố phường: cột điện, dây điện, ghế nhựa, xe máy dựng ---------- */
  def('epole', 8, 64, x => {
    R(x, '#8b8f9c', 3, 4, 3, 60); R(x, '#a9adb9', 3, 4, 1, 60); R(x, '#636b7e', 0, 6, 8, 2); R(x, '#636b7e', 1, 12, 6, 1);
    R(x, '#e6e1d5', 0, 4, 1, 2); R(x, '#e6e1d5', 7, 4, 1, 2); R(x, '#3a3f55', 2, 16, 4, 5); R(x, '#5f656f', 2, 16, 4, 1);   // sứ cách điện + hộp điện
  });
  def('wires', 160, 12, x => {
    for (const [y0, sag] of [[0, 9], [3, 7]]) for (let i = 0; i <= 160; i++) { const t = i / 160, y = y0 + Math.round(4 * sag * t * (1 - t)); R(x, '#2a2136', i, y, 1, 1); }
  }, true);
  def('ghenhua', 10, 9, x => { R(x, '#e2574c', 0, 0, 10, 3); R(x, '#f07a6f', 0, 0, 10, 1); R(x, '#c2453b', 1, 3, 2, 6); R(x, '#c2453b', 7, 3, 2, 6); R(x, '#c2453b', 2, 6, 6, 1); });
  def('ghenhuaB', 10, 9, x => { R(x, '#3b82c4', 0, 0, 10, 3); R(x, '#5a9fe0', 0, 0, 10, 1); R(x, '#2f6aa8', 1, 3, 2, 6); R(x, '#2f6aa8', 7, 3, 2, 6); R(x, '#2f6aa8', 2, 6, 6, 1); });
  def('caylon', 16, 18, x => { R(x, '#8a5a3a', 3, 11, 10, 7); R(x, '#a9703f', 3, 11, 10, 2); R(x, '#4a9340', 1, 2, 14, 10); R(x, '#5fae4a', 3, 1, 10, 6); R(x, '#7cc75f', 4, 2, 4, 2); R(x, '#e2574c', 10, 4, 2, 2); R(x, '#e2574c', 5, 7, 2, 2); });
  /* ---------- quầy nước mía (mái tôn, xe đẩy có cây mía) ---------- */
  def('nuocmia', 48, 50, x => {
    tinRoof(x, 0, 0, 48, 7, '#8a7a6a'); R(x, WC.metalS, 2, 7, 2, 30); R(x, WC.metalS, 44, 7, 2, 30);
    signBoard(x, 8, 8, 32, 8, 'NƯỚC MÍA', '#3f8f3a', 5);
    R(x, '#dfe9ee', 6, 26, 36, 18); R(x, '#5fae4a', 6, 26, 36, 3); R(x, WC.glass, 8, 30, 20, 10); for (let i = 0; i < 5; i++) R(x, '#a8c46a', 10 + i * 3, 31, 2, 8);   // ống mía trong tủ
    R(x, '#8b8f9c', 30, 29, 10, 11); R(x, '#636b7e', 30, 29, 10, 2);                                                            // máy ép
    for (let i = 0; i < 3; i++) { R(x, '#f2e9a0', 32 + i * 3, 22, 2, 4); R(x, '#fbf7ee', 32 + i * 3, 21, 2, 1); }
    for (const wx of [8, 34]) { R(x, '#2f2a3a', wx, 44, 6, 6); R(x, '#8b8f9c', wx + 2, 46, 2, 2); }
  });
  /* ---------- vỉa hè lát gạch đỏ (thay gạch xám) ---------- */
  GROUND.walk = (x, px, py, tx, ty) => {
    R(x, '#d9a48c', px, py, 16, 16);
    for (let j = 0; j < 4; j++) {
      R(x, '#c08470', px, py + j * 4 + 3, 16, 1);
      for (let i = (j % 2 ? 4 : 0); i < 16; i += 8) R(x, '#c08470', px + i, py + j * 4, 1, 3);
      R(x, '#e6b8a2', px + ((j * 5 + tx * 3) % 12), py + j * 4, 3, 1);
    }
  };
}

/* ---------- đặt thêm đạo cụ phố phường lên bản đồ (chạy sau buildMaps) ---------- */
function decorWorld() {
  const poleRow = (m, y, xs) => {                                              // cột điện dọc vỉa hè, dây điện võng giữa hai cột
    xs.forEach((px, i) => {
      addObj(m, { s: 'epole', x: px, y: y - 64, sol: [2, 58, 6, 6] });
      if (i < xs.length - 1) addObj(m, { s: 'wires', x: px + 4, y: y - 60, base: 99999, flat: false, w: xs[i + 1] - px, h: 12 });
    });
  };
  const T = MAPS.town, P = MAPS.pho, S = MAPS.school;
  // nhãn chữ nét cho biển hiệu: đặt đúng giữa biển (toạ độ biển trong ảnh + vị trí đồ vật + 1 điểm viền)
  const SIGNS = [[T, 'shop', 'TẠP HOÁ CÔ BA', 8, 13, 80, 11, 7.5], [T, 'center', 'HỌC THÊM SAO MAI', 10, 14, 76, 11, 7], [S, 'gate', 'TRƯỜNG THPT HOA PHƯỢNG', 22, 10, 84, 10, 6.5],
    [S, 'school', 'THPT HOA PHƯỢNG', 120, 18, 80, 14, 9], [S, 'canteen', 'CĂN TIN', 10, 9, 56, 9, 6.5], [S, 'bikeshed', 'NHÀ XE', 36, 9, 24, 7, 4.6]];
  for (const [m, spr, text, a, b, w, h, size] of SIGNS) {
    const o = m && m.objs.find(q => q.s === spr); if (!o) continue;
    const L = m.labels.find(l => l.text === text), cx0 = o.x + 1 + a + w / 2, cy0 = o.y + 1 + b + h / 2 + 0.5;
    if (L) Object.assign(L, { x: cx0, y: cy0, col: '#fff8e2', size, maxw: w - 4 }); else m.labels.push({ x: cx0, y: cy0, text, size, col: '#fff8e2', maxw: w - 4 });
  }
  if (T) {
    poleRow(T, 190, [20, 180, 340, 500, 660]);
    for (const [sx, sy, b] of [[300, 134, 0], [313, 137, 1], [326, 134, 0]]) addObj(T, { s: b ? 'ghenhuaB' : 'ghenhua', x: sx, y: sy, sol: [1, 4, 9, 5] });   // ghế nhựa trước tạp hoá
    addObj(T, { s: 'caylon', x: 400, y: 112, sol: [2, 12, 13, 6] });
  }
  if (P) {
    poleRow(P, 188, [20, 180, 340, 500, 660, 820, 980]);
    for (const hx of [12, 120, 228, 336]) addObj(P, { s: hx % 216 === 12 ? 'motoMom' : 'moto', x: hx + 64, y: 112, sol: [3, 14, 26, 8] });   // xe máy dựng trước nhà
    for (const hx of [12, 228]) addObj(P, { s: 'caylon', x: hx + 22, y: 112, sol: [2, 12, 13, 6] });
  }
  if (S) {
    // hàng rào trường: cứ 3 đoạn có một trụ gạch
    S.objs.filter(o => o.s === 'wallseg').sort((a, b) => a.x - b.x).forEach((o, i) => { if (i % 3 === 0) o.s = 'wallsegP'; });
    addObj(S, { s: 'nuocmia', x: 540, y: 428, sol: [2, 40, 46, 9] });            // quầy nước mía trước cổng trường
    S.labels.push({ x: 540 + 1 + 8 + 16, y: 428 + 1 + 8 + 4.5, text: 'NƯỚC MÍA', size: 4.6, col: '#fff8e2', maxw: 30 });
    addObj(S, { s: 'ghenhua', x: 596, y: 466, sol: [1, 4, 9, 5] }); addObj(S, { s: 'ghenhuaB', x: 608, y: 469, sol: [1, 4, 9, 5] });
  }
}
