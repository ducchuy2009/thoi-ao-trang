'use strict';
/* ============================================================
 *  02g. ĐỒ HOẠ VÒNG 24: đồ nội thất mới (đồng hồ, ghế lười, kệ, bể cá)
 * ============================================================ */
function buildSprites4() {
  /* ---------- nội thất ---------- */
  def('f_clock', 12, 12, x => {                                          // đồng hồ treo tường
    ell(x, '#8a5a3a', 5.5, 5.5, 5.5, 5.5); ell(x, '#fffaf0', 5.5, 5.5, 4.2, 4.2);
    for (const [a, b] of [[5, 1], [5, 9], [1, 5], [9, 5]]) R(x, '#57496b', a, b, 2, 1);
    R(x, '#2a2136', 5, 3, 1, 3); R(x, '#2a2136', 5, 5, 3, 1); R(x, '#e2574c', 5, 5, 1, 1);
  });
  def('f_beanbag', 22, 16, x => {                                        // ghế lười
    ell(x, '#c96a3f', 11, 10, 10.5, 5.5); ell(x, '#e08a52', 11, 8, 9, 5); ell(x, '#f0a86e', 9, 6, 5, 2.5);
    R(x, '#a9532f', 3, 13, 16, 2); R(x, '#fffaf0', 15, 6, 2, 1);
  });
  def('f_shelf', 22, 28, x => {                                          // kệ trang trí 3 tầng: sách, chậu cây, hộp, cúp
    R(x, '#8a5a3a', 0, 0, 22, 28); R(x, '#c58c56', 1, 1, 20, 26);
    for (const b of [8, 16, 24]) { R(x, '#8a5a3a', 1, b, 20, 2); R(x, '#a9703f', 1, b - 1, 20, 1); }
    [['#e2574c', 2], ['#3b82c4', 4], ['#ffd23a', 6], ['#5fae4a', 8]].forEach(([c, a]) => R(x, c, a, 2, 2, 6));
    R(x, '#c8583f', 13, 5, 6, 3); ell(x, '#5fae4a', 16, 3.5, 3.5, 2.5);
    R(x, '#ffd23a', 4, 12, 4, 3); R(x, '#ffd23a', 5, 15, 2, 1); R(x, '#d9a441', 3, 11, 6, 1);   // cúp
    R(x, '#fffaf0', 12, 10, 7, 6); R(x, '#9cc8e6', 13, 11, 5, 4);                              // khung ảnh
    R(x, '#b07ad6', 3, 19, 6, 5); R(x, '#7a5fc9', 3, 19, 6, 1); R(x, '#8fd067', 12, 20, 2, 4); R(x, '#e98fa5', 15, 18, 3, 6);
  });
  def('f_tank', 26, 26, x => {                                           // bể cá trên tủ gỗ
    R(x, '#6f472c', 1, 14, 24, 12); R(x, '#a9703f', 2, 15, 22, 10); R(x, '#6f472c', 12, 15, 1, 10); R(x, '#ffd23a', 10, 19, 1, 2); R(x, '#ffd23a', 14, 19, 1, 2);
    R(x, '#2a2136', 0, 0, 26, 15); R(x, '#5fb0e8', 1, 1, 24, 13); R(x, '#8fd0f2', 1, 1, 24, 3); R(x, '#c9a467', 1, 11, 24, 3);
    R(x, '#3f8f3a', 4, 6, 1, 6); R(x, '#5fae4a', 5, 4, 1, 8); R(x, '#3f8f3a', 20, 7, 1, 5); R(x, '#5fae4a', 21, 5, 1, 7);
    R(x, '#f2a93b', 9, 6, 4, 2); R(x, '#f2a93b', 8, 5, 1, 4); R(x, '#e2574c', 15, 9, 3, 2); R(x, '#e2574c', 18, 8, 1, 4);
    R(x, '#fffaf0', 12, 3, 1, 1); R(x, '#fffaf0', 17, 5, 1, 1);
  });
  buildHouses(); buildMarketArt(); buildStadiumArt();
}

/* ============================================================
 *  NHÀ Ở: mỗi nhà một kiểu kiến trúc (khung rộng 96, chân nhà ở mép dưới, cửa chính luôn ở giữa x 41–55)
 *  hs_tube: nhà ống 3 tầng có ban công, bồn nước inox · hs_trad: nhà cấp 4 mái ngói, hiên cột gỗ · hs_villa: biệt thự mái Thái
 *  hs_modern: nhà hiện đại mái bằng, kính lớn, gara · hs_garden: nhà vườn mái lệch, giàn hoa giấy · hs_pastel: nhà phố vàng cửa chớp xanh
 *  hs_bungalow: nhà gỗ hiên quanh, ghế bập bênh, lồng chim · hs_shop: nhà ống mặt tiền có mái hiên, quầy bánh cuốn
 * ============================================================ */
const H_ROOF = (x, col, rows) => rows.forEach(([a, y, w]) => R(x, col, a, y, w, 1));
function hRail(x, a, b, w, h, col) { R(x, col, a, b, w, 2); for (let i = a; i < a + w; i += 3) R(x, col, i, b, 1, h); R(x, shade(col, -25), a, b + h - 1, w, 1); }
function hGlass(x, a, b, w, h) { R(x, '#2a2f3a', a - 1, b - 1, w + 2, h + 2); R(x, '#5f8fb8', a, b, w, h); R(x, '#8fc1e3', a, b, w, 2); for (let i = 0; i < w + h; i += 9) for (let k = 0; k < 3; k++) { const px = a + i - k, py = b + k; if (px >= a && px < a + w) R(x, 'rgba(255,255,255,0.35)', px, py, 1, Math.min(h - k, 4)); } }
function hShutter(x, a, b, w, h, col) {                                    // cửa sổ có 2 cánh chớp mở hai bên
  R(x, '#2a2136', a - 1, b - 1, w + 2, h + 2); R(x, '#6f9fc4', a, b, w, h); R(x, '#a9d0ea', a, b, w, 2); R(x, '#fffaf0', a + (w >> 1), b, 1, h);
  for (const sx of [a - 5, a + w + 1]) { R(x, col, sx, b, 4, h); for (let j = b + 1; j < b + h; j += 2) R(x, shade(col, -25), sx, j, 4, 1); }
}
function hArch(x, a, b, w, h, glass) { ell(x, '#fffaf0', a + w / 2 - 0.5, b + w / 2, w / 2 + 1, w / 2 + 1); R(x, '#fffaf0', a - 1, b + w / 2, w + 2, h - w / 2 + 1); ell(x, glass || '#6f9fc4', a + w / 2 - 0.5, b + w / 2, w / 2 - 0.5, w / 2 - 0.5); R(x, glass || '#6f9fc4', a, b + w / 2, w, h - w / 2 - 1); R(x, '#fffaf0', a + (w >> 1), b + 2, 1, h - 3); R(x, '#fffaf0', a, b + w / 2 + 3, w, 1); }
function hPot(x, a, b, leaf) { R(x, '#c8583f', a, b + 4, 6, 4); R(x, '#e07a5f', a - 1, b + 3, 8, 2); ell(x, leaf || '#4f9a4a', a + 2.5, b + 1, 4, 3); ell(x, shade(leaf || '#4f9a4a', 20), a + 1.5, b, 2, 1.5); }
function hBouga(x, a, b, w, h) {                                           // hoa giấy phủ tường
  for (let i = 0; i < w * h / 10; i++) { const r = (i * 7919) % 997 / 997, q = (i * 104729) % 991 / 991; ell(x, i % 3 ? '#d94f8a' : '#f07ab0', a + r * w, b + q * h, 1.6, 1.4); if (i % 4 === 0) R(x, '#4f8f3a', a + q * w, b + r * h, 2, 1); }
}
function buildHouses() {
  /* nhà ống 3 tầng: tường rào thấp, cổng, ban công lan can inox, cửa kính, bồn nước trên mái */
  const tube = (name, wall, roof, gate, flower, flat) => def(name, 96, 112, x => {
    const Ws = shade(wall, -14), Wd = shade(wall, -28);
    R(x, '#d9d2c2', 0, 96, 18, 16); R(x, '#ece6d6', 0, 94, 18, 3); R(x, '#d9d2c2', 78, 96, 18, 16); R(x, '#ece6d6', 78, 94, 18, 3);
    for (const px of [13, 79]) { R(x, '#bdb4a0', px, 88, 5, 24); R(x, '#d9d2c2', px - 1, 86, 7, 3); }
    if (flower) hBouga(x, 0, 82, 16, 14); else { R(x, '#6f472c', 88, 78, 3, 18); ell(x, '#3f8f3a', 89, 72, 7, 8); ell(x, '#5fae4a', 87, 70, 4, 4); }
    R(x, wall, 18, 22, 60, 90); R(x, Ws, 18, 22, 2, 90); R(x, Wd, 76, 22, 2, 90);
    if (!flat) {           // mái thái nhỏ + bồn nước
      for (let i = 0; i < 11; i++) R(x, i % 3 === 2 ? shade(roof, -18) : roof, 14 + i * 2, 22 - i, 68 - i * 4, 1);
      R(x, shade(roof, 25), 14, 22, 68, 1);
      R(x, '#8b8f9c', 24, 12, 2, 3); R(x, '#8b8f9c', 34, 12, 2, 3); R(x, '#c9d0d8', 21, 2, 18, 10); R(x, '#eef2f5', 22, 3, 6, 8); R(x, '#a9b0ba', 21, 6, 18, 1);
      drawWin(x, 26, 28, 14, 13, gate); drawWin(x, 56, 28, 14, 13, gate);
    } else {               // mái bằng: sân thượng lan can, giàn phơi, chậu cây · tầng 3 cửa kính dài, ô văng màu
      R(x, Wd, 16, 20, 64, 3); hRail(x, 17, 12, 62, 8, '#5f656f'); R(x, '#c9d0d8', 60, 4, 12, 8); R(x, '#eef2f5', 61, 5, 4, 6);
      R(x, '#8b8f9c', 24, 6, 1, 8); R(x, '#8b8f9c', 44, 6, 1, 8); R(x, '#8b8f9c', 24, 6, 21, 1); R(x, '#e2574c', 28, 7, 4, 5); R(x, '#5fb0e8', 35, 7, 4, 4);
      hPot(x, 47, 9, '#3f8f3a');
      R(x, roof, 22, 25, 52, 3); hGlass(x, 26, 30, 44, 12); R(x, '#2a2f3a', 48, 30, 1, 12);
    }
    R(x, Wd, 16, 46, 64, 3);
    // tầng 2: cửa kính 2 cánh, cục nóng điều hoà, ban công
    R(x, '#2a2136', 33, 51, 30, 26); R(x, '#fffaf0', 34, 52, 28, 25); hGlass(x, 36, 54, 11, 21); hGlass(x, 49, 54, 11, 21);
    R(x, '#e7e9ec', 66, 56, 10, 7); R(x, '#a9b0ba', 67, 57, 5, 5); ell(x, '#8b8f9c', 69.5, 59.5, 2, 2);
    R(x, Wd, 10, 77, 76, 3); R(x, shade(wall, 10), 10, 77, 76, 1);
    if (flat) { R(x, '#cfe8f7', 11, 67, 74, 10); R(x, '#9fc6e0', 11, 67, 74, 1); for (let i = 18; i < 85; i += 9) R(x, '#b8d8ec', i, 68, 1, 9); R(x, '#5f656f', 11, 66, 74, 1); }
    else { hRail(x, 11, 67, 74, 10, '#9aa3ad'); hPot(x, 13, 69, '#3f8f3a'); hPot(x, 76, 69, '#5fae4a'); }
    // tầng trệt: cửa kính lùa, 2 cửa sổ, bậc thềm, biển số nhà
    R(x, '#2a2136', 37, 83, 22, 29); R(x, '#6f472c', 38, 84, 20, 28); hGlass(x, 40, 86, 7, 24); hGlass(x, 49, 86, 7, 24);
    hGlass(x, 22, 88, 11, 12); hGlass(x, 63, 88, 11, 12);
    R(x, '#3b6fb6', 64, 82, 8, 4); R(x, '#fffaf0', 65, 83, 6, 2);
    R(x, '#cfc8b8', 33, 110, 30, 2);
  });
  tube('hs_tube', '#f6efe2', '#c8583f', '#4f9a6b', true);
  tube('hs_tube2', '#dfe8d6', '#3b6fb6', '#d9a441', false, true);

  /* nhà cấp 4: mái ngói đỏ 4 mái, hiên rộng 4 cột gỗ, cửa bức bàn, cửa sổ chấn song, chum nước */
  def('hs_trad', 96, 84, x => {
    const roof = '#b5503a', rS = '#8f3a2a', wall = '#f2d58a';
    for (let j = 0; j < 31; j++) { const a = Math.round(22 - j * 22 / 30); R(x, j % 4 === 3 ? rS : roof, a, 4 + j, 96 - a * 2, 1); for (let i = a + ((j >> 2) % 2 ? 3 : 0); i < 96 - a; i += 6) if (j % 4 !== 3) R(x, shade(roof, 14), i, 4 + j, 1, 1); }
    R(x, '#7a2f22', 20, 1, 56, 4); R(x, '#a9473a', 20, 1, 56, 1); R(x, '#7a2f22', 17, 0, 3, 2); R(x, '#7a2f22', 76, 0, 3, 2);
    R(x, '#3a2418', 0, 34, 96, 2); R(x, '#5a3a24', 0, 36, 96, 3);
    R(x, wall, 6, 39, 84, 39); R(x, shade(wall, -16), 6, 39, 84, 2);
    R(x, '#5a3a24', 33, 45, 30, 33); for (let i = 0; i < 4; i++) { R(x, '#8a5a3a', 34 + i * 7, 46, 6, 32); R(x, '#a9703f', 35 + i * 7, 48, 4, 10); R(x, '#a9703f', 35 + i * 7, 62, 4, 12); }
    for (const a of [12, 68]) { R(x, '#5a3a24', a - 1, 47, 18, 16); R(x, '#2a2136', a, 48, 16, 14); for (let i = a + 1; i < a + 16; i += 3) R(x, '#a9703f', i, 48, 2, 14); R(x, '#8a5a3a', a - 1, 62, 18, 2); }
    for (const a of [5, 30, 62, 87]) { R(x, '#6f472c', a, 36, 4, 42); R(x, '#8a5a3a', a + 1, 36, 1, 42); R(x, '#bdb4a0', a - 1, 74, 6, 4); }
    R(x, '#c9b38f', 0, 77, 96, 7); for (let i = 0; i < 96; i += 8) R(x, '#b49c78', i, 77, 1, 7); R(x, '#e2d2b0', 34, 80, 28, 4); R(x, '#b49c78', 0, 77, 96, 1);
    ell(x, '#8a5a3a', 91, 72, 4, 5); R(x, '#6f472c', 88, 66, 7, 2); R(x, '#5a3a24', 89, 67, 5, 1);
    hPot(x, 18, 70, '#3f8f3a');
  });

  /* biệt thự mái Thái: mái dốc xám xanh, cửa sổ mái, ban công lan can con tiện, sảnh 2 cột, cửa vòm */
  def('hs_villa', 96, 108, x => {
    const roof = '#5a6b80', rS = '#43526a', wall = '#f4f1ea', wS = '#dcd6c8';
    R(x, wall, 8, 36, 80, 70); R(x, wS, 8, 36, 2, 70); R(x, wS, 86, 36, 2, 70);
    for (let j = 0; j < 34; j++) { const a = Math.round(26 - j * 24 / 33); R(x, j % 3 === 2 ? rS : roof, a, 3 + j, 96 - a * 2, 1); }
    R(x, '#3a4558', 26, 2, 44, 2); R(x, shade(roof, 25), 2, 36, 92, 1); R(x, '#2f3a4a', 2, 37, 92, 2);
    R(x, wall, 41, 12, 14, 16); for (let j = 0; j < 7; j++) R(x, rS, 40 + j, 12 - j, 16 - j * 2, 1); hArch(x, 44, 15, 8, 11);
    hArch(x, 15, 44, 12, 20); hArch(x, 69, 44, 12, 20);
    R(x, '#2a2136', 37, 43, 22, 24); R(x, '#fffaf0', 38, 44, 20, 23); hGlass(x, 40, 46, 7, 20); hGlass(x, 49, 46, 7, 20);
    R(x, wS, 28, 66, 40, 3); for (let i = 30; i < 67; i += 3) { R(x, '#fffaf0', i, 59, 2, 7); R(x, '#cfc8b8', i + 1, 60, 1, 6); } R(x, '#fffaf0', 28, 58, 40, 2);
    R(x, wS, 8, 70, 80, 3);
    for (let j = 0; j < 7; j++) R(x, j ? '#e8e2d4' : '#bdb4a0', 33 + j * 2, 72 + j, 30 - j * 4, 1);
    R(x, '#e8e2d4', 32, 79, 32, 2);
    for (const a of [34, 58]) { R(x, '#fffaf0', a, 81, 5, 24); R(x, '#d9d2c2', a + 3, 81, 2, 24); R(x, '#d9d2c2', a - 1, 81, 7, 2); R(x, '#d9d2c2', a - 1, 102, 7, 2); }
    R(x, '#2a2136', 40, 84, 16, 22); ell(x, '#2a2136', 47.5, 85, 8, 5); R(x, '#6f472c', 41, 85, 14, 21); ell(x, '#6f472c', 47.5, 85, 7, 4); R(x, '#4a3020', 47, 82, 2, 24); R(x, '#ffd23a', 45, 95, 1, 2); R(x, '#ffd23a', 50, 95, 1, 2);
    hArch(x, 15, 80, 12, 18); hArch(x, 69, 80, 12, 18);
    R(x, '#bdb4a0', 8, 102, 80, 4); R(x, '#d9d2c2', 36, 104, 24, 4);
    for (const a of [12, 74]) { ell(x, '#3f8f3a', a + 5, 103, 8, 4); ell(x, '#5fae4a', a + 3, 101, 4, 2); }
  });

  /* nhà hiện đại mái bằng: khối tầng 2 đua ra ốp gỗ + kính lớn, sân thượng lan can kính, gara cửa cuốn */
  def('hs_modern', 96, 100, x => {
    R(x, '#e8e6e1', 6, 60, 86, 40); R(x, '#cfccc4', 6, 60, 86, 2); R(x, '#5f656f', 6, 97, 86, 3);
    hGlass(x, 10, 66, 24, 27);
    R(x, '#2a2f38', 36, 66, 26, 3); R(x, '#2a2136', 40, 71, 16, 29); R(x, '#a9703f', 41, 72, 14, 28); for (let i = 43; i < 55; i += 3) R(x, '#8a5a3a', i, 72, 1, 28); hGlass(x, 52, 75, 2, 20); R(x, '#d9d2c2', 53, 86, 1, 4);
    R(x, '#2a2136', 61, 71, 28, 29); R(x, '#8b8f9c', 62, 72, 26, 28); for (let j = 74; j < 100; j += 3) R(x, '#6f747e', 62, j, 26, 1);
    R(x, '#2a2f38', 0, 22, 74, 40); R(x, '#3a3f4a', 2, 26, 70, 34);
    R(x, '#b07a4a', 5, 29, 24, 28); for (let i = 7; i < 29; i += 3) R(x, '#8a5a3a', i, 29, 1, 28);
    hGlass(x, 32, 29, 37, 28); R(x, '#2a2f38', 50, 29, 1, 28);
    for (let i = 0; i < 9; i++) ell(x, i % 2 ? '#3f8f3a' : '#5fae4a', 6 + i * 7, 20, 4, 3);
    R(x, '#2a2f38', 72, 58, 22, 3); R(x, '#cfe8f7', 74, 46, 19, 12); R(x, '#9fc6e0', 74, 46, 19, 1); for (let i = 78; i < 93; i += 5) R(x, '#b8d8ec', i, 47, 1, 11);
    R(x, '#6f472c', 86, 40, 2, 8); ell(x, '#3f8f3a', 87, 37, 5, 6); R(x, '#8b8f9c', 84, 52, 6, 6);
    R(x, '#cfc8b8', 36, 98, 26, 2);
  });

  /* nhà vườn: mái lệch rêu xanh, cửa gỗ lùa, giàn hoa giấy, ghế đá, chậu bonsai, lối đá */
  def('hs_garden', 96, 86, x => {
    const roof = '#5f7f4a', wall = '#efe6d2';
    for (let i = 30; i < 96; i++) { const t = Math.round(42 - (i - 30) * 0.42); R(x, wall, i + 2 > 94 ? 94 : i + 2, t + 6, 1, 80 - t - 6); }
    R(x, wall, 34, 40, 60, 40);
    for (let i = 28; i < 96; i++) { const t = Math.round(42 - (i - 28) * 0.42); R(x, roof, i, t, 1, 6); if (i % 5 === 0) R(x, shade(roof, -18), i, t, 1, 6); R(x, shade(roof, 22), i, t, 1, 1); R(x, '#3a4a2c', i, t + 6, 1, 1); }
    R(x, '#8b8f9c', 32, 72, 64, 14); for (let i = 0; i < 9; i++) R(x, '#a9adb6', 34 + i * 7 + (i % 2) * 2, 74 + (i % 3) * 3, 5, 3);
    R(x, '#5a3a24', 40, 48, 17, 32); R(x, '#a9703f', 41, 49, 7, 31); R(x, '#a9703f', 49, 49, 7, 31); R(x, '#d9c8a0', 42, 51, 5, 12); R(x, '#d9c8a0', 50, 51, 5, 12);
    R(x, '#5a3a24', 61, 46, 30, 18); R(x, '#cfe8f7', 62, 47, 28, 16); for (let i = 64; i < 90; i += 7) R(x, '#5a3a24', i, 47, 1, 16); hPot(x, 66, 56, '#3f8f3a'); hPot(x, 80, 56, '#e2574c');
    for (const a of [3, 28]) { R(x, '#6f472c', a, 28, 3, 56); R(x, '#8a5a3a', a, 28, 1, 56); }
    for (let i = 0; i < 36; i += 4) R(x, '#6f472c', i, 26, 2, 4); R(x, '#8a5a3a', 0, 28, 36, 2);
    hBouga(x, 0, 22, 34, 16); hBouga(x, 0, 34, 6, 22); hBouga(x, 26, 34, 6, 18);
    R(x, '#9a9ea8', 8, 70, 18, 3); R(x, '#8b8f9c', 10, 73, 2, 6); R(x, '#8b8f9c', 22, 73, 2, 6);
    for (const [a, c] of [[6, '#3f8f3a'], [20, '#5fae4a']]) { R(x, '#4a6fa5', a, 80, 8, 5); R(x, '#6f472c', a + 3, 75, 2, 5); ell(x, c, a + 4, 74, 5, 3); }
    R(x, '#d9d2c2', 38, 82, 22, 4);
  });

  /* nhà phố vàng: mái ngói ống, cửa chớp xanh, ban công gỗ treo đèn lồng, mái hiên ngói giữa 2 tầng, cửa gỗ xếp */
  def('hs_pastel', 96, 104, x => {
    const wall = '#e8b84a', wS = '#cf9f36', green = '#3f7a5a';
    R(x, wall, 12, 22, 72, 82); R(x, wS, 12, 22, 2, 82); R(x, wS, 82, 22, 2, 82);
    R(x, '#8f3a2a', 6, 10, 84, 14); for (let i = 7; i < 90; i += 3) { R(x, '#b5503a', i, 11, 2, 12); R(x, '#cf6a4a', i, 11, 1, 12); } R(x, '#6f2a20', 6, 22, 84, 2); R(x, '#6f2a20', 4, 9, 88, 2);
    for (const a of [20, 43, 66]) { R(x, '#2a2136', a - 1, 29, 12, 18); R(x, '#4a3020', a, 30, 10, 16); for (const sx of [a - 4, a + 10]) { R(x, green, sx, 30, 4, 16); for (let j = 31; j < 46; j += 2) R(x, shade(green, -25), sx, j, 4, 1); } }
    R(x, '#6f472c', 10, 50, 76, 2); for (let i = 11; i < 86; i += 4) R(x, '#8a5a3a', i, 52, 2, 8); R(x, '#5a3a24', 10, 59, 76, 2);
    for (const a of [18, 76]) { R(x, '#2a2136', a + 1, 51, 1, 2); ell(x, '#e2574c', a + 1.5, 55.5, 3, 3.5); R(x, '#ffd23a', a, 52, 3, 1); R(x, '#ffd23a', a, 59, 3, 1); }
    R(x, '#8f3a2a', 6, 62, 84, 7); for (let i = 7; i < 90; i += 3) R(x, '#b5503a', i, 63, 2, 5); R(x, '#6f2a20', 6, 68, 84, 2);
    R(x, '#3a2418', 29, 72, 38, 32); for (let i = 0; i < 6; i++) { R(x, '#6f472c', 30 + i * 6, 73, 5, 31); R(x, '#8a5a3a', 31 + i * 6, 75, 3, 10); R(x, '#8a5a3a', 31 + i * 6, 88, 3, 12); }
    for (const a of [17, 73]) { R(x, '#2a2136', a - 1, 77, 9, 14); R(x, '#4a3020', a, 78, 7, 12); for (let j = 79; j < 90; j += 2) R(x, green, a, j, 7, 1); }
    hPot(x, 14, 94, '#3f8f3a'); hPot(x, 76, 94, '#5fae4a');
    R(x, '#cfc8b8', 26, 102, 44, 2);
  });

  /* nhà gỗ: mái dốc 2 mái lộ kèo, vách ván ngang, hiên quanh có lan can, ghế bập bênh, lồng chim */
  def('hs_bungalow', 96, 88, x => {
    const roof = '#5a3a2a', wood = '#a9703f', wS = '#8a5a3a';
    R(x, wood, 8, 38, 80, 40); for (let j = 40; j < 78; j += 3) R(x, wS, 8, j, 80, 1);
    for (let j = 0; j < 36; j++) { const hw = Math.round(j * 50 / 35); R(x, j % 4 === 3 ? shade(roof, -15) : roof, 48 - hw, 4 + j, hw * 2, 1); }
    for (let j = 8; j < 34; j += 2) { const hw = Math.round((j - 6) * 38 / 35); R(x, '#c58c56', 48 - hw, 4 + j, hw * 2, 1); } for (let i = 20; i < 77; i += 6) R(x, wS, i, 14 + Math.abs(48 - i) * 0.3, 1, 26 - Math.abs(48 - i) * 0.3);
    R(x, '#3a2418', 0, 39, 96, 2); for (let i = 2; i < 96; i += 6) R(x, '#3a2418', i, 41, 2, 3);
    R(x, '#fffaf0', 39, 50, 18, 28); R(x, '#6f472c', 41, 52, 14, 26); R(x, '#8a5a3a', 42, 54, 5, 9); R(x, '#8a5a3a', 49, 54, 5, 9); R(x, '#ffd23a', 52, 66, 1, 2);
    for (const a of [14, 64]) { R(x, '#fffaf0', a - 1, 47, 20, 16); R(x, '#6f9fc4', a + 1, 49, 16, 12); R(x, '#fffaf0', a + 8, 49, 1, 12); R(x, '#fffaf0', a + 1, 54, 16, 1); }
    R(x, '#c58c56', 0, 77, 96, 6); for (let i = 0; i < 96; i += 5) R(x, '#a9703f', i, 77, 1, 6); R(x, '#8a5a3a', 0, 82, 96, 1);
    for (const a of [2, 16, 30, 62, 76, 90]) R(x, '#fffaf0', a, 58, 3, 20);
    R(x, '#fffaf0', 0, 66, 34, 2); R(x, '#fffaf0', 62, 66, 34, 2); for (let i = 4; i < 32; i += 4) R(x, '#e8e2d4', i, 68, 1, 9); for (let i = 64; i < 94; i += 4) R(x, '#e8e2d4', i, 68, 1, 9);
    R(x, '#6f472c', 18, 66, 10, 2); R(x, '#6f472c', 18, 58, 2, 10); R(x, '#6f472c', 26, 66, 2, 9); R(x, '#5a3a24', 16, 75, 14, 1);
    R(x, '#8b8f9c', 71, 41, 1, 4); ell(x, '#d9c8a0', 71.5, 49, 4, 5); for (let i = 68; i < 76; i += 2) R(x, '#a9853f', i, 45, 1, 8); R(x, '#ffd23a', 71, 49, 2, 2);
    R(x, '#d9c8a0', 36, 82, 24, 3); R(x, '#c9b38f', 34, 85, 28, 3);
  });

  /* nhà ống mặt tiền: lan can hoa sắt, mái hiên sọc, cửa cuốn kéo lên một nửa, quầy hấp bánh cuốn bốc hơi */
  def('hs_shop', 96, 100, x => {
    const wall = '#f0d9d2', wS = '#d9bfb6';
    R(x, wall, 6, 18, 84, 82); R(x, wS, 6, 18, 2, 82); R(x, wS, 88, 18, 2, 82);
    R(x, '#c9b8b0', 4, 14, 88, 6); for (let i = 8; i < 90; i += 8) R(x, '#e8dad4', i, 10, 4, 4); R(x, '#a9968c', 4, 19, 88, 1);
    R(x, '#2a2136', 17, 25, 62, 28); R(x, '#6f9fc4', 18, 26, 60, 26); R(x, '#a9d0ea', 18, 26, 60, 3);
    for (let i = 18; i < 78; i += 6) { R(x, '#3a3f4a', i, 26, 1, 26); ell(x, '#3a3f4a', i + 3, 39, 2.5, 3); }
    R(x, '#3a3f4a', 18, 38, 60, 1); R(x, '#8a5a3a', 15, 52, 66, 3); hPot(x, 22, 46, '#3f8f3a'); hPot(x, 66, 46, '#e98fa5');
    for (let i = 0; i < 12; i++) R(x, i % 2 ? '#fffaf0' : '#3b82c4', 2 + i * 8, 58, 8, 8); R(x, '#2f5a94', 2, 66, 92, 2);
    R(x, '#2a2136', 8, 70, 28, 30); R(x, '#8b8f9c', 9, 71, 26, 14); for (let j = 72; j < 85; j += 2) R(x, '#6f747e', 9, j, 26, 1); R(x, '#3a3040', 9, 85, 26, 15);
    R(x, '#2a2136', 39, 71, 18, 29); hGlass(x, 40, 72, 16, 27); R(x, '#2a2f3a', 47, 72, 1, 27);
    R(x, '#8a5a3a', 60, 84, 28, 3); R(x, '#a9703f', 60, 87, 28, 13);
    for (const a of [63, 76]) { R(x, '#c9d0d8', a, 76, 10, 8); R(x, '#eef2f5', a + 1, 77, 3, 6); R(x, '#8b8f9c', a - 1, 75, 12, 2); }
    for (let i = 0; i < 4; i++) R(x, 'rgba(255,255,255,0.7)', 66 + i * 4, 70 - (i % 2) * 2, 1, 4);
    R(x, '#cfc8b8', 36, 98, 24, 2);
  });
}
// đặt nhà lên bản đồ: khung cao bao nhiêu cũng giữ chân nhà ở cùng chỗ (y gốc tính cho nhà cao 80) và vùng chặn chân nhà
function addHouse(m, spr, x, y, o) {
  const dh = SPR[spr].height - 82;
  return addObj(m, Object.assign({ s: spr, x, y: y - dh, sol: [1, 30 + dh, 96, 51] }, o || {}));
}
// icon đồ nội thất trong túi / thanh đồ: hình món đồ thu nhỏ vừa ô 14×14 (giữ nét điểm ảnh)
function furnIcon(id, x) {
  if (typeof FURN === 'undefined' || !FURN[id] || !SPR[FURN[id].s]) return false;
  const s = SPR[FURN[id].s], k = Math.min(1, 14 / s.width, 14 / s.height), w = Math.max(1, Math.round(s.width * k)), h = Math.max(1, Math.round(s.height * k));
  x.imageSmoothingEnabled = false; x.drawImage(s, Math.round((16 - w) / 2), Math.round((16 - h) / 2), w, h);
  return true;
}

/* ============================================================
 *  CHỢ BỜ ĐÔNG: mặt tiền nhà chợ 2 tầng mái, cổng vòm lớn có biển, sạp ngoài trời (ô dù, thúng hoa quả, rau, xe đạp)
 *  Bên trong: nền gạch xi măng, mỗi sạp một kiểu theo mặt hàng (rau củ · cá tươi · hàng ăn · quầy thu mua)
 * ============================================================ */
GROUND.mtile = (x, px, py, tx, ty) => {                                   // nền chợ: gạch xi măng cũ, rãnh thoát nước
  R(x, (tx * 3 + ty) % 5 ? '#cbc3b2' : '#c2b9a6', px, py, 16, 16); R(x, '#b3aa96', px + 15, py, 1, 16); R(x, '#b3aa96', px, py + 15, 16, 1); R(x, '#d8d1c2', px, py, 15, 1);
  const r = rng(tx * 7331 + ty * 131); if (r() < 0.3) R(x, '#b8ae9a', px + 2 + (r() * 10 | 0), py + 3 + (r() * 9 | 0), 2, 1);
};
function buildMarketArt() {
  def('marketB2', 136, 104, x => {
    const wall = '#f2e2b8', wS = '#d9c690', roof = '#b5503a', rS = '#8f3a2a';
    R(x, wall, 4, 44, 128, 52); R(x, wS, 4, 44, 128, 2);
    for (let j = 0; j < 16; j++) { const a = Math.round(30 - j * 16 / 15); R(x, j % 4 === 3 ? rS : roof, a, 8 + j, 136 - a * 2, 1); }      // mái trên
    R(x, '#7a2f22', 30, 6, 76, 3); R(x, '#ffd23a', 66, 2, 4, 4); R(x, '#e2574c', 67, 3, 2, 2);
    R(x, '#e8d4a0', 18, 24, 100, 11); for (let i = 20; i < 116; i += 4) { R(x, '#8a5a3a', i, 25, 2, 9); R(x, '#5a3a24', i, 25, 2, 1); }        // cửa thông gió
    for (let j = 0; j < 12; j++) R(x, j % 4 === 3 ? rS : roof, 0, 34 + j, 136, 1);                                                      // mái dưới
    for (let i = 0; i < 136; i += 6) R(x, shade(roof, 16), i + ((i / 6) % 2 ? 3 : 0), 35, 1, 10); R(x, '#5a2418', 0, 46, 136, 2);
    // cổng vòm + 2 trụ
    R(x, '#2a1d24', 46, 62, 44, 34); ell(x, '#2a1d24', 67.5, 63, 22, 13);
    for (let i = 0; i < 5; i++) { R(x, '#ffd23a', 52 + i * 8, 58 + (i % 2) * 3, 2, 2); R(x, '#5a4a3a', 52 + i * 8, 52, 1, 6 + (i % 2) * 3); }   // bóng đèn treo
    for (const [a, c] of [[50, '#5fae4a'], [62, '#3b82c4'], [74, '#f2a93b']]) { R(x, c, a, 72, 12, 3); R(x, '#fffaf0', a + 3, 72, 3, 3); R(x, '#8a5a3a', a + 1, 75, 10, 6); }
    R(x, '#3a2a30', 46, 86, 44, 10); for (let i = 50; i < 88; i += 9) { R(x, '#5f656f', i, 88, 6, 4); ell(x, ['#e2574c', '#5fae4a', '#ffd23a', '#e98f4a', '#5fae4a'][(i / 9 | 0) % 5], i + 3, 87, 3, 1.5); }
    for (const a of [38, 90]) { R(x, '#e8d4a0', a, 52, 8, 44); R(x, '#cdb878', a + 6, 52, 2, 44); R(x, '#cdb878', a - 1, 52, 10, 3); R(x, '#cdb878', a - 1, 93, 10, 3); }
    R(x, '#e8d4a0', 44, 50, 48, 5); ell(x, '#e8d4a0', 67.5, 58, 23, 8); R(x, '#2a1d24', 47, 62, 42, 2);
    R(x, '#5a2418', 30, 36, 76, 15); R(x, '#d9342b', 31, 37, 74, 13); R(x, '#ffd23a', 31, 37, 74, 1); R(x, '#ffd23a', 31, 49, 74, 1); R(x, '#ffd23a', 31, 37, 1, 13); R(x, '#ffd23a', 104, 37, 1, 13);
    // cánh trái: ô dù đỏ, bàn thúng hoa quả
    R(x, '#8b8f9c', 20, 56, 1, 30); ell(x, '#d9342b', 20.5, 57, 15, 5); R(x, '#d9342b', 6, 57, 30, 3); for (let i = 7; i < 35; i += 6) R(x, '#fffaf0', i, 58, 3, 2);
    R(x, '#6f472c', 6, 84, 30, 3); R(x, '#8a5a3a', 8, 87, 2, 9); R(x, '#8a5a3a', 32, 87, 2, 9);
    for (const [a, c, c2] of [[9, '#ffd23a', '#e8c23a'], [19, '#f2a93b', '#e2574c'], [29, '#e2477a', '#5fae4a']]) { ell(x, '#c9a467', a, 82, 5, 3); ell(x, '#a9853f', a, 83, 5, 2); for (let k = 0; k < 4; k++) ell(x, k % 2 ? c2 : c, a - 3 + k * 2, 79.5 - (k % 2), 1.8, 1.6); }
    // cánh phải: bạt xanh, rổ rau, sọt nhựa, xe đạp
    R(x, '#3b82c4', 98, 58, 34, 4); R(x, '#5a9ad6', 98, 58, 34, 1); for (let i = 99; i < 132; i += 4) R(x, '#2f6aa8', i, 62, 2, 2); R(x, '#8b8f9c', 100, 62, 1, 22); R(x, '#8b8f9c', 130, 62, 1, 22);
    R(x, '#6f472c', 100, 82, 22, 3); R(x, '#8a5a3a', 101, 85, 2, 11); R(x, '#8a5a3a', 119, 85, 2, 11);
    for (const [a, c] of [[104, '#4f9a4a'], [111, '#6fbd4f'], [118, '#e98f4a']]) { ell(x, '#c9a467', a, 80, 3.5, 2.5); ell(x, c, a, 78, 3, 2.4); }
    for (let j = 0; j < 2; j++) { R(x, '#2f8f5a', 123, 84 - j * 7, 9, 7); for (let i = 124; i < 132; i += 2) R(x, '#1f6f44', i, 85 - j * 7, 1, 5); }
    R(x, '#cfc9bc', 0, 96, 136, 8); R(x, '#b8b1a2', 0, 96, 136, 1); R(x, '#e2dccf', 44, 98, 48, 6);
  });
  // sạp trong chợ: [quầy 64×40]
  def('mk_rau', 64, 40, x => {                                           // sạp rau củ: bàn tre, rổ rau xanh, bắp cải, cà rốt, cà chua, biển giá bìa các-tông
    R(x, '#8a5a3a', 2, 24, 60, 4); R(x, '#c9a467', 0, 22, 64, 4); for (let i = 1; i < 64; i += 4) R(x, '#a9853f', i, 22, 1, 4); R(x, '#8a5a3a', 4, 28, 3, 12); R(x, '#8a5a3a', 57, 28, 3, 12);
    for (const [a, c, k] of [[8, '#3f8f3a', 'leaf'], [20, '#9fd06f', 'cab'], [32, '#e98f4a', 'car'], [44, '#e2574c', 'tom'], [56, '#d93a3a', 'chi']]) {
      ell(x, '#b08a4a', a, 21, 6, 3); ell(x, '#c9a467', a, 20, 6, 2.5);
      if (k === 'leaf') for (let i = 0; i < 5; i++) { R(x, '#2f6f2b', a - 4 + i * 2, 11, 1, 9); ell(x, c, a - 4 + i * 2, 11, 1.6, 3); }
      if (k === 'cab') { ell(x, c, a - 2, 16, 4, 3.5); ell(x, '#bfe39a', a + 2, 17, 3.5, 3); }
      if (k === 'car') for (let i = 0; i < 4; i++) { R(x, c, a - 4 + i * 2, 15 + (i % 2), 2, 4); R(x, '#4f9a4a', a - 4 + i * 2, 13 + (i % 2), 1, 2); }
      if (k === 'tom') for (let i = 0; i < 4; i++) ell(x, c, a - 3 + (i % 2) * 4, 16 - (i >> 1) * 2.5, 2.2, 2);
      if (k === 'chi') for (let i = 0; i < 4; i++) R(x, c, a - 3 + i * 2, 16 + (i % 2), 1, 3);
    }
    R(x, '#e8d4a0', 24, 2, 16, 9); R(x, '#5a3a24', 24, 2, 16, 1); R(x, '#5f656f', 31, 0, 1, 2); R(x, '#3f8f3a', 27, 5, 10, 1); R(x, '#3f8f3a', 27, 7, 7, 1);
  });
  def('mk_ca', 64, 40, x => {                                            // sạp cá: bệ lát gạch men, thau nhôm có cá bơi, đá lạnh, cân treo, sục khí
    R(x, '#e8eef2', 0, 20, 64, 20); R(x, '#cfd9e0', 0, 20, 64, 2); for (let i = 0; i < 64; i += 8) R(x, '#bfcad2', i, 22, 1, 18); R(x, '#bfcad2', 0, 30, 64, 1);
    for (const [a, w, fc] of [[4, 18, '#8a9aa8'], [24, 18, '#e2574c'], [44, 16, '#c9a441']]) {
      ell(x, '#8b8f9c', a + w / 2, 18, w / 2 + 1, 4); ell(x, '#5f9fc4', a + w / 2, 17.5, w / 2 - 0.5, 3);
      for (let k = 0; k < 2; k++) { const fx = a + 4 + k * (w / 2 - 2); R(x, fc, fx, 16 + k, 5, 2); R(x, shade(fc, -25), fx + 5, 15 + k, 1, 4); }
      R(x, '#eaf6fc', a + 3, 16, 1, 1); R(x, '#eaf6fc', a + w - 4, 18, 1, 1);
    }
    for (let i = 0; i < 4; i++) { R(x, '#dff3fb', 6 + i * 4, 30, 3, 3); R(x, '#ffffff', 6 + i * 4, 30, 1, 1); }
    R(x, '#5f656f', 52, 0, 1, 6); R(x, '#d9342b', 47, 6, 11, 8); ell(x, '#fffaf0', 52.5, 10, 3.5, 3); R(x, '#2a2136', 52, 8, 1, 2); R(x, '#8b8f9c', 46, 14, 13, 2);
    R(x, '#3a3f4a', 26, 4, 1, 12); for (let i = 0; i < 3; i++) R(x, '#eaf6fc', 25 + (i % 2), 9 + i * 3, 1, 1);
  });
  def('mk_an', 64, 40, x => {                                            // hàng ăn: nồi nước dùng bốc hơi, chồng bát, thúng xôi phủ khăn, ghế nhựa đỏ xanh
    R(x, '#8a5a3a', 0, 20, 40, 4); R(x, '#a9703f', 0, 24, 40, 10); R(x, '#6f472c', 0, 33, 40, 2);
    R(x, '#5f656f', 3, 9, 16, 12); R(x, '#8b8f9c', 2, 8, 18, 3); R(x, '#c98a4a', 4, 10, 14, 2); R(x, '#3a3f4a', 9, 6, 4, 2);
    for (let i = 0; i < 3; i++) R(x, 'rgba(255,255,255,0.75)', 6 + i * 5, 1 + (i % 2) * 2, 1, 4);
    for (let j = 0; j < 4; j++) { R(x, '#fffaf0', 22, 17 - j * 2, 8, 2); R(x, '#3b82c4', 22, 18 - j * 2, 8, 1); }
    ell(x, '#c9a467', 35, 16, 5, 3); ell(x, '#e2574c', 35, 14, 4.5, 2.5); R(x, '#fffaf0', 31, 12, 8, 2);
    for (const [a, c] of [[44, '#e2574c'], [54, '#3b82c4']]) { R(x, c, a, 28, 8, 2); R(x, shade(c, -25), a, 30, 1, 8); R(x, shade(c, -25), a + 7, 30, 1, 8); R(x, shade(c, 20), a, 28, 8, 1); }
    R(x, '#e8d4a0', 44, 4, 18, 10); R(x, '#5a3a24', 44, 4, 18, 1); R(x, '#d9342b', 46, 7, 14, 1); R(x, '#d9342b', 46, 10, 10, 1);
  });
  def('mk_mua', 64, 40, x => {                                           // quầy thu mua: bàn gỗ, cân đồng hồ, giỏ hoa, sọt quả, thau cá, bảng phấn bảng giá, hộp tiền
    R(x, '#6f472c', 0, 20, 64, 4); R(x, '#8a5a3a', 0, 24, 64, 12); R(x, '#5a3a24', 0, 35, 64, 2); for (let i = 4; i < 64; i += 12) R(x, '#6f472c', i, 25, 1, 10);
    R(x, '#d9342b', 24, 12, 12, 9); ell(x, '#fffaf0', 30, 15, 4, 3.5); R(x, '#2a2136', 30, 13, 1, 3); R(x, '#8b8f9c', 22, 10, 16, 2);
    ell(x, '#c9a467', 8, 19, 6, 3); for (let i = 0; i < 4; i++) ell(x, ['#e2574c', '#ffd23a', '#e98fa5', '#b07ad6'][i], 5 + i * 2, 15 - (i % 2), 2, 2);
    R(x, '#2f8f5a', 42, 13, 10, 8); ell(x, '#f2a93b', 45, 13, 2, 2); ell(x, '#ffd23a', 49, 13, 2, 2);
    ell(x, '#8b8f9c', 58, 18, 5, 3); ell(x, '#5f9fc4', 58, 17.5, 4, 2);
    R(x, '#3a3f4a', 4, 0, 22, 11); R(x, '#2a3a30', 5, 1, 20, 9); for (let j = 0; j < 3; j++) R(x, '#e8eef2', 7, 3 + j * 2, 10 + (j % 2) * 4, 1);
    R(x, '#c9a441', 38, 4, 10, 6); R(x, '#a9853f', 38, 4, 10, 1); R(x, '#5a3a24', 42, 6, 2, 1);
  });
  def('mk_hoa', 48, 30, x => {                                          // sạp hoa: xô nhôm cắm hoa cúc, hồng, ly, lay ơn
    R(x, '#6f472c', 0, 22, 48, 3); R(x, '#8a5a3a', 2, 25, 2, 5); R(x, '#8a5a3a', 44, 25, 2, 5);
    for (const [a, c, h] of [[6, '#ffd23a', 10], [16, '#e2574c', 14], [26, '#fffaf0', 12], [36, '#e98fa5', 16]]) {
      R(x, '#8b8f9c', a - 4, 14, 9, 8); R(x, '#c9d0d8', a - 3, 15, 3, 6);
      for (let i = 0; i < 4; i++) { R(x, '#3f8f3a', a - 3 + i * 2, 14 - h + 4, 1, h - 4); ell(x, c, a - 3 + i * 2, 14 - h + 3 + (i % 2) * 2, 2, 2); }
    }
  });
  def('mk_kho', 48, 30, x => {                                          // sạp đồ khô: bao gạo, đậu, lạc, mẹt nấm khô
    R(x, '#6f472c', 0, 22, 48, 3); R(x, '#8a5a3a', 2, 25, 2, 5); R(x, '#8a5a3a', 44, 25, 2, 5);
    for (const [a, c] of [[7, '#fffaf0'], [19, '#e8c46a'], [31, '#c98a4a']]) { R(x, '#e8dcc0', a - 6, 8, 12, 14); R(x, '#d4c49e', a - 6, 8, 12, 2); ell(x, c, a, 9, 5, 2.5); R(x, '#b8a47e', a - 6, 20, 12, 2); }
    ell(x, '#c9a467', 42, 18, 6, 3); for (let i = 0; i < 4; i++) ell(x, '#6f472c', 39 + i * 2, 16.5, 1.5, 1.2);
  });
  def('mk_bulb', 6, 12, x => { R(x, '#3a3040', 2, 0, 1, 7); ell(x, '#ffe680', 2.5, 9, 2.5, 2.5); R(x, '#fffbe0', 1, 8, 1, 1); });
  def('mk_crate', 14, 12, x => { R(x, '#2f8f5a', 0, 0, 14, 12); for (let i = 1; i < 14; i += 3) R(x, '#1f6f44', i, 2, 1, 8); R(x, '#4fae7a', 0, 0, 14, 1); });
  def('mk_basket', 14, 10, x => { ell(x, '#b08a4a', 7, 6, 7, 4); ell(x, '#c9a467', 7, 5, 6, 3); for (let i = 0; i < 4; i++) ell(x, ['#ffd23a', '#f2a93b', '#e2574c', '#5fae4a'][i], 3 + i * 2.6, 3.5, 2, 1.8); });
}

/* ============================================================
 *  KHU SÂN VẬN ĐỘNG: sân hình bầu dục (khán đài 2 màu, mái che, 4 cột đèn pha, cổng chính), quầy vé, bảng sự kiện, ô tô đỗ
 *  KHU QUÂN SỰ: tường rào dây thép gai, cổng có barie + biển cấm, chòi gác, doanh trại, tháp canh, cột cờ, xe tải quân sự
 * ============================================================ */
function buildStadiumArt() {
  def('svdB', 360, 250, x => {
    const cx0 = 180, cy0 = 104, RX = 176, RY = 96;
    ell(x, '#9aa0aa', cx0, cy0, RX, RY);                                                         // vành ngoài
    for (let k = 0; k < 7; k++) ell(x, k % 2 ? '#3b6fb6' : '#d9534f', cx0, cy0 + 4, RX - 10 - k * 7, RY - 8 - k * 5);    // các tầng ghế
    for (let k = 0; k < 7; k++) { const rx = RX - 13 - k * 7, ry = RY - 11 - k * 5; for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; R(x, k % 2 ? '#2f5a94' : '#b8403a', cx0 + Math.cos(a) * rx, cy0 + 4 + Math.sin(a) * ry, 2, 1); } }
    ell(x, '#3f8f3a', cx0, cy0 + 8, RX - 62, RY - 46); ell(x, '#4f9d48', cx0, cy0 + 8, RX - 64, RY - 48);   // mặt sân cỏ
    for (let i = -100; i < 100; i += 14) R(x, '#57a850', cx0 + i, cy0 - 30, 7, 76);
    R(x, '#fffaf0', cx0 - 1, cy0 - 30, 2, 76); ell(x, '#fffaf0', cx0, cy0 + 8, 13, 9); ell(x, '#4f9d48', cx0, cy0 + 8, 11.5, 7.5);
    R(x, '#fffaf0', cx0 - 96, cy0 - 6, 1, 28); R(x, '#fffaf0', cx0 + 95, cy0 - 6, 1, 28); R(x, '#fffaf0', cx0 - 96, cy0 - 6, 16, 1); R(x, '#fffaf0', cx0 - 96, cy0 + 21, 16, 1); R(x, '#fffaf0', cx0 + 80, cy0 - 6, 16, 1); R(x, '#fffaf0', cx0 + 80, cy0 + 21, 16, 1);
    for (let i = 0; i < 46; i++) { const a = Math.PI + i / 45 * Math.PI, px = cx0 + Math.cos(a) * (RX - 4), py = cy0 + Math.sin(a) * (RY - 4); R(x, '#f4f6f8', px - 3, py - 8, 7, 9); R(x, '#cfd6dc', px - 3, py, 7, 1); }   // mái che khán đài phía sau
    // mặt tường phía trước: cong theo vành bầu dục, các vòm cửa
    for (let px = 4; px < 356; px++) {
      const dx = (px - cx0) / RX, yb = cy0 + Math.sqrt(Math.max(0, 1 - dx * dx)) * RY;
      R(x, '#c9ccd2', px, yb - 2, 1, 44); R(x, '#e8eaee', px, yb - 2, 1, 3); R(x, '#a9adb6', px, yb + 38, 1, 4);
      if (px % 20 > 6 && px % 20 < 15 && Math.abs(px - cx0) > 26) R(x, '#3a3f4a', px, yb + 10, 1, 22 - Math.abs(px % 20 - 10.5) * 0.6);
    }
    // cổng chính + biển tên
    R(x, '#2a2136', cx0 - 26, 186, 52, 18); R(x, '#d9342b', cx0 - 25, 187, 50, 16); R(x, '#ffd23a', cx0 - 25, 187, 50, 1); R(x, '#ffd23a', cx0 - 25, 202, 50, 1);
    R(x, '#e8eaee', cx0 - 24, 204, 48, 44); R(x, '#2a2f3a', cx0 - 18, 208, 36, 40); for (let i = cx0 - 17; i < cx0 + 18; i += 4) R(x, '#5f656f', i, 208, 1, 40); R(x, '#8b8f9c', cx0 - 18, 226, 36, 1);
    for (const sx of [cx0 - 30, cx0 + 24]) { R(x, '#b8bcc4', sx, 186, 6, 62); R(x, '#d9dce2', sx, 186, 2, 62); }
    for (const [sx, c] of [[cx0 - 70, '#3b6fb6'], [cx0 - 52, '#ffd23a'], [cx0 + 46, '#d9534f'], [cx0 + 64, '#5fae4a']]) { R(x, '#8b8f9c', sx, 170, 1, 34); R(x, c, sx + 1, 170, 9, 6); }
    // 4 cột đèn pha
    for (const [sx, sy] of [[18, 40], [334, 40], [44, 150], [310, 150]]) { R(x, '#6f747e', sx, sy, 3, 44); R(x, '#2a2136', sx - 7, sy - 10, 17, 11); for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) R(x, '#fffbe0', sx - 6 + i * 4, sy - 9 + j * 5, 3, 4); }
  });
  def('svdKiosk', 34, 34, x => {                                         // quầy vé
    R(x, '#3b6fb6', 0, 0, 34, 8); for (let i = 0; i < 34; i += 6) R(x, '#fffaf0', i, 2, 3, 4); R(x, '#2f5a94', 0, 8, 34, 2);
    R(x, '#e8eaee', 2, 10, 30, 24); R(x, '#2a2136', 7, 13, 20, 11); R(x, '#8fc1e3', 8, 14, 18, 9); R(x, '#a9adb6', 6, 24, 22, 2);
    R(x, '#d9342b', 9, 28, 16, 4); R(x, '#fffaf0', 11, 29, 12, 2);
  });
  def('svdBoard', 40, 36, x => {                                         // bảng điện tử lịch sự kiện
    R(x, '#5f656f', 8, 22, 3, 14); R(x, '#5f656f', 29, 22, 3, 14);
    R(x, '#2a2136', 0, 0, 40, 24); R(x, '#1d2a3a', 1, 1, 38, 22);
    R(x, '#ffd23a', 4, 4, 22, 2); R(x, '#5fd0ff', 4, 9, 30, 1); R(x, '#5fd0ff', 4, 12, 26, 1); R(x, '#ff8fb4', 4, 16, 28, 1); R(x, '#ff8fb4', 4, 19, 18, 1);
  });
  def('car1', 36, 22, x => { R(x, '#2a2136', 3, 18, 7, 4); R(x, '#2a2136', 26, 18, 7, 4); R(x, '#d9534f', 0, 9, 36, 10); R(x, '#e2574c', 6, 2, 22, 9); R(x, '#8fc1e3', 8, 4, 8, 6); R(x, '#8fc1e3', 18, 4, 8, 6); R(x, '#fffaf0', 32, 11, 3, 2); R(x, '#b8403a', 0, 16, 36, 2); });
  def('car2', 36, 22, x => { R(x, '#2a2136', 3, 18, 7, 4); R(x, '#2a2136', 26, 18, 7, 4); R(x, '#e8eaee', 0, 9, 36, 10); R(x, '#f4f6f8', 6, 2, 22, 9); R(x, '#5f8fb8', 8, 4, 8, 6); R(x, '#5f8fb8', 18, 4, 8, 6); R(x, '#ffd23a', 32, 11, 3, 2); R(x, '#c9ccd2', 0, 16, 36, 2); });
  // khu quân sự
  def('mzGate', 30, 92, x => {                                           // cột cổng cao + barie đỏ trắng hạ xuống
    R(x, '#7a8a5a', 2, 0, 14, 92); R(x, '#8f9f6a', 2, 0, 4, 92); R(x, '#5f6f45', 14, 0, 2, 92); R(x, '#d9342b', 3, 6, 12, 10); R(x, '#ffd23a', 7, 9, 4, 4);
    R(x, '#2a2136', 16, 60, 14, 6); for (let i = 0; i < 4; i++) R(x, i % 2 ? '#fffaf0' : '#d9342b', 16 + i * 3.5, 61, 3.5, 4);
  });
  def('mzBooth', 26, 34, x => { R(x, '#5f6f45', 0, 0, 26, 6); R(x, '#7a8a5a', 1, 6, 24, 28); R(x, '#2a2136', 5, 10, 16, 10); R(x, '#8fc1e3', 6, 11, 14, 8); R(x, '#5f6f45', 1, 30, 24, 4); for (let i = 0; i < 26; i += 6) R(x, '#d9342b', i, 2, 3, 2); });
  def('mzSign', 46, 34, x => { R(x, '#5f656f', 8, 18, 2, 16); R(x, '#5f656f', 36, 18, 2, 16); R(x, '#fffaf0', 0, 0, 46, 20); R(x, '#d9342b', 1, 1, 44, 18); R(x, '#fffaf0', 3, 3, 40, 1); R(x, '#fffaf0', 3, 16, 40, 1); });
  def('mzBarrack', 120, 54, x => {                                       // doanh trại: nhà dài mái ngói, tường vàng, cửa sổ đều
    R(x, '#8f3a2a', 0, 4, 120, 14); for (let i = 2; i < 120; i += 4) R(x, '#b5503a', i, 5, 2, 12); R(x, '#6f2a20', 0, 17, 120, 2);
    R(x, '#e8c46a', 4, 19, 112, 35); R(x, '#cfa950', 4, 19, 112, 2);
    for (let i = 0; i < 7; i++) { R(x, '#2a2136', 10 + i * 15, 26, 9, 12); R(x, '#5f8f5a', 11 + i * 15, 27, 7, 10); }
    R(x, '#5a3a24', 54, 38, 12, 16); R(x, '#d9342b', 52, 21, 16, 4); R(x, '#ffd23a', 58, 22, 4, 2);
  });
  def('mzTower', 30, 70, x => { R(x, '#6f747e', 4, 20, 2, 50); R(x, '#6f747e', 24, 20, 2, 50); for (let j = 24; j < 70; j += 10) line(x, '#8b8f9c', 5, j, 24, j + 8); R(x, '#5f6f45', 0, 8, 30, 14); R(x, '#2a2136', 4, 11, 22, 6); R(x, '#4f5f3a', 0, 4, 30, 4); R(x, '#4f5f3a', 3, 0, 24, 4); });
  def('mzFlag', 30, 64, x => { R(x, '#c9ccd2', 2, 0, 2, 64); R(x, '#8b8f9c', 0, 60, 6, 4); R(x, '#d9342b', 4, 2, 26, 17); pat(x, STAR11, 12, 5, '#ffd23a', '#ffd23a'); });
  def('mzTruck', 56, 32, x => { R(x, '#2a2136', 6, 26, 9, 6); R(x, '#2a2136', 40, 26, 9, 6); R(x, '#4f6b2f', 0, 6, 38, 22); for (let i = 2; i < 38; i += 6) R(x, '#5f7f3a', i, 6, 1, 22); R(x, '#5f7f3a', 38, 12, 18, 16); R(x, '#8fc1e3', 44, 14, 9, 6); R(x, '#3f5a24', 0, 26, 56, 2); });
  def('mzWire', 16, 8, x => { for (let i = 0; i < 16; i += 4) { ell(x, '#5f656f', i + 2, 4, 2.5, 2.5); ell(x, '#9aa0aa', i + 2, 4, 1.5, 1.5); } }, true);
  // bên trong sân: sân khấu ca nhạc, khung thành
  def('svdStage', 200, 92, x => {
    R(x, '#3a3040', 0, 60, 200, 32); R(x, '#4a4058', 0, 60, 200, 3); R(x, '#2a2136', 0, 88, 200, 4);
    R(x, '#6f747e', 6, 0, 4, 62); R(x, '#6f747e', 190, 0, 4, 62); R(x, '#6f747e', 6, 0, 188, 4); for (let i = 10; i < 190; i += 8) line(x, '#8b8f9c', i, 1, i + 4, 3);
    R(x, '#1d2a3a', 50, 8, 100, 44); R(x, '#2a2136', 49, 7, 102, 46);
    for (const sx of [14, 170]) { R(x, '#2a2136', sx, 24, 16, 36); ell(x, '#5f656f', sx + 8, 34, 5, 5); ell(x, '#5f656f', sx + 8, 50, 6, 6); ell(x, '#2a2136', sx + 8, 50, 3, 3); }
    for (let i = 0; i < 8; i++) { R(x, '#2a2136', 16 + i * 24, 4, 6, 6); R(x, ['#ff5a96', '#5ac8ff', '#ffdc5a', '#8fe06f'][i % 4], 17 + i * 24, 8, 4, 2); }
  });
  def('goalL', 12, 34, x => { R(x, '#fffaf0', 0, 0, 12, 2); R(x, '#fffaf0', 0, 32, 12, 2); R(x, '#fffaf0', 10, 0, 2, 34); for (let j = 2; j < 32; j += 3) R(x, 'rgba(255,255,255,0.45)', 0, j, 10, 1); for (let i = 0; i < 10; i += 3) R(x, 'rgba(255,255,255,0.45)', i, 2, 1, 30); });
  def('goalR', 12, 34, x => { R(x, '#fffaf0', 0, 0, 12, 2); R(x, '#fffaf0', 0, 32, 12, 2); R(x, '#fffaf0', 0, 0, 2, 34); for (let j = 2; j < 32; j += 3) R(x, 'rgba(255,255,255,0.45)', 2, j, 10, 1); for (let i = 3; i < 12; i += 3) R(x, 'rgba(255,255,255,0.45)', i, 2, 1, 30); });
}
// icon vòng 24: lịch sân vận động (micro / quả bóng) + đồ nội thất
function icon24(id, x) {
  if (id === 'ci_concert') { R(x, '#5f656f', 7, 8, 2, 7); ell(x, '#2a2136', 8, 5, 4, 4.5); ell(x, '#8b8f9c', 8, 4, 2.5, 2.5); R(x, '#ff5a96', 12, 1, 1, 5); R(x, '#ff5a96', 12, 1, 3, 1); ell(x, '#ff5a96', 11.5, 6, 1.5, 1.2); return true; }
  if (id === 'ci_match') { ell(x, '#fffaf0', 8, 8, 6.5, 6.5); pat(x, ['.###.', '#####', '.###.'], 6, 6, '#2a2136'); R(x, '#2a2136', 3, 4, 2, 2); R(x, '#2a2136', 11, 4, 2, 2); R(x, '#2a2136', 3, 11, 2, 2); R(x, '#2a2136', 11, 11, 2, 2); return true; }
  return furnIcon(id, x);
}
