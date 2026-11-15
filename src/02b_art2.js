'use strict';
/* ============================================================
 *  02b. ĐỒ HOẠ BỔ SUNG — phố Hoa Phượng (TTTM, khu game, trà sữa), núi sau trường,
 *  nhà vệ sinh, đạo cụ cho các đoạn cắt cảnh (yoyo, con quay, bài, son phấn), chân dung thẻ cầu thủ
 * ============================================================ */
function tri(x, col, cxm, top, h, halfW) { for (let j = 0; j < h; j++) { const w = Math.max(1, Math.round(halfW * (j + 1) / h)); R(x, col, Math.round(cxm - w), top + j, w * 2, 1); } }

function buildSprites2() {
  /* ---------- trung tâm thương mại ---------- */
  def('mall', 176, 104, x => {
    R(x, '#7b8499', 0, 0, 176, 8); R(x, '#99a2b6', 0, 0, 176, 2); R(x, '#5f677a', 0, 6, 176, 2);
    R(x, '#e9eef5', 2, 8, 172, 96); R(x, '#cdd6e2', 2, 98, 172, 6);
    // bảng hiệu
    R(x, '#2a2136', 18, 11, 140, 19); R(x, '#d9534f', 19, 12, 138, 17); R(x, '#ef7a70', 19, 12, 138, 2); R(x, '#b23b3b', 19, 27, 138, 2);
    // mặt kính
    for (let i = 0; i < 7; i++) {
      const a = 6 + i * 24; if (i === 3) continue;
      R(x, '#5c6f7c', a, 34, 20, 60); R(x, '#9cc7dd', a + 1, 35, 18, 58); R(x, '#b9dcf2', a + 1, 35, 18, 3);
      line(x, '#cfe8f7', a + 3, 60, a + 14, 38); line(x, '#cfe8f7', a + 6, 62, a + 16, 43);
      R(x, '#5c6f7c', a, 63, 20, 2);
    }
    // áp phích trong kính
    R(x, '#2a2136', 9, 68, 14, 20); R(x, '#f2a93b', 10, 69, 12, 18); R(x, '#e2574c', 12, 72, 8, 6); R(x, '#fff', 12, 81, 8, 1); R(x, '#fff', 12, 84, 6, 1);
    R(x, '#2a2136', 33, 68, 14, 20); R(x, '#7a5fc9', 34, 69, 12, 18); ell(x, '#ffe066', 40, 75, 3, 3); R(x, '#fff', 36, 82, 8, 1);
    R(x, '#2a2136', 129, 68, 14, 20); R(x, '#5fae4a', 130, 69, 12, 18); R(x, '#fffaf0', 132, 72, 8, 9); R(x, '#e2574c', 133, 74, 6, 1); R(x, '#3b82c4', 133, 77, 6, 1);
    R(x, '#2a2136', 153, 68, 14, 20); R(x, '#e98fa5', 154, 69, 12, 18); R(x, '#fff', 157, 72, 6, 8); R(x, '#8b5e3c', 158, 74, 4, 5);
    // cửa chính + mái đón
    R(x, '#b23b3b', 66, 58, 44, 7); R(x, '#d9534f', 66, 58, 44, 2); R(x, '#8a2f2f', 66, 64, 44, 1);
    R(x, '#3a3f55', 72, 65, 32, 39); R(x, '#8fb9cf', 74, 67, 13, 37); R(x, '#8fb9cf', 89, 67, 13, 37); R(x, '#b9dcf2', 74, 67, 13, 3); R(x, '#b9dcf2', 89, 67, 13, 3);
    R(x, '#f4d35e', 85, 84, 1, 5); R(x, '#f4d35e', 90, 84, 1, 5);
    R(x, '#d5d1c8', 64, 100, 48, 4); R(x, '#eceae4', 64, 100, 48, 1);
    // chậu cây hai bên cửa
    for (const a of [58, 112]) { R(x, '#c8583f', a, 94, 6, 8); ell(x, '#5fae4a', a + 3, 90, 4, 5); ell(x, '#7cc75f', a + 2, 88, 2, 2); }
  });
  /* ---------- khu game arcade ---------- */
  def('arcade', 96, 76, x => {
    R(x, '#2a2136', 0, 2, 96, 5); R(x, '#4a3f6b', 0, 2, 96, 2);
    R(x, '#3a2f5b', 2, 6, 92, 70); R(x, '#2c2347', 2, 70, 92, 6);
    R(x, '#2a2136', 5, 8, 86, 16); R(x, '#1b1530', 6, 9, 84, 14); R(x, '#ff5fa8', 6, 9, 84, 1); R(x, '#ff5fa8', 6, 22, 84, 1); R(x, '#5fe0f0', 6, 10, 1, 12); R(x, '#5fe0f0', 89, 10, 1, 12);
    for (let i = 0; i < 12; i++) R(x, i % 2 ? '#ffe066' : '#ff8fd0', 3 + i * 8, 26, 2, 2);
    // cửa kính thấy máy game
    R(x, '#1b1530', 8, 32, 46, 34); R(x, '#241c3d', 9, 33, 44, 32);
    for (let i = 0; i < 4; i++) {
      const a = 11 + i * 11, c = ['#5fe0f0', '#ff5fa8', '#ffe066', '#8fd067'][i];
      R(x, '#4a3f6b', a, 40, 9, 24); R(x, '#5c4f85', a, 40, 9, 2); R(x, c, a + 1, 43, 7, 6); R(x, '#fff', a + 2, 44, 2, 1);
      R(x, '#2a2136', a + 1, 51, 7, 3); R(x, '#e2574c', a + 2, 51, 1, 2); R(x, '#f4d35e', a + 5, 52, 1, 1); R(x, '#f4d35e', a + 7, 52, 1, 1);
    }
    drawDoor(x, 64, 42, 20, 34, '#5a4a8a'); R(x, '#5fe0f0', 67, 46, 14, 12); R(x, '#b9f3fa', 67, 46, 14, 2);
    R(x, '#ff5fa8', 62, 38, 24, 2); R(x, '#5fe0f0', 62, 40, 24, 1);
    // máy gắp thú ngoài hiên
    R(x, '#e2574c', 87, 48, 7, 28); R(x, '#bfe3f2', 88, 50, 5, 12); R(x, '#f2a93b', 89, 57, 3, 4); R(x, '#8b5e3c', 89, 55, 3, 2); R(x, '#2a2136', 88, 64, 5, 4); R(x, '#ffe066', 90, 65, 1, 2);
  });
  /* ---------- tiệm trà sữa ---------- */
  def('teashop', 80, 76, x => {
    R(x, '#fde3ea', 2, 6, 76, 70); R(x, '#f3c6d3', 2, 70, 76, 6); R(x, '#c98f9f', 0, 2, 80, 5); R(x, '#e3aebb', 0, 2, 80, 2);
    R(x, '#2a2136', 5, 8, 70, 15); R(x, '#fffaf0', 6, 9, 68, 13); R(x, '#f7d3dc', 6, 20, 68, 2);
    for (let i = 0; i < 10; i++) { R(x, i % 2 ? '#fffaf0' : '#e98fa5', i * 8, 25, 8, 9); R(x, i % 2 ? '#e3ddd0' : '#c96f86', i * 8, 33, 8, 2); R(x, i % 2 ? '#fffaf0' : '#e98fa5', i * 8 + 1, 35, 6, 2); }
    R(x, '#8a6a74', 6, 42, 38, 24); R(x, '#cfe8f7', 7, 43, 36, 22); R(x, '#eaf6fc', 7, 43, 36, 2);
    // ba cốc trà sữa trong tủ kính
    for (let i = 0; i < 3; i++) { const a = 11 + i * 11, c = ['#c98f5a', '#e98fa5', '#8fd067'][i]; R(x, '#fffaf0', a, 50, 7, 12); R(x, c, a + 1, 53, 5, 8); R(x, '#2a2136', a + 1, 59, 1, 1); R(x, '#2a2136', a + 3, 60, 1, 1); R(x, '#2a2136', a + 5, 59, 1, 1); R(x, '#fff', a - 1, 49, 9, 2); R(x, '#d9534f', a + 4, 44, 1, 6); }
    R(x, '#c98f5a', 6, 66, 38, 3);
    drawDoor(x, 52, 44, 18, 32, '#b5677c'); R(x, '#cfe8f7', 55, 48, 12, 12); R(x, '#eaf6fc', 55, 48, 12, 2);
    R(x, '#fffaf0', 72, 50, 6, 10); R(x, '#e98fa5', 73, 52, 4, 1); R(x, '#5f656f', 73, 55, 4, 1); R(x, '#5f656f', 73, 57, 3, 1);
  });
  /* ---------- xe đẩy xiên que ---------- */
  def('cart', 38, 40, x => {
    tri(x, '#e2574c', 19, 0, 8, 19);
    for (let j = 0; j < 8; j++) { const w = Math.round(19 * (j + 1) / 8 / 3); R(x, '#fffaf0', 19 - w, j, w * 2, 1); }
    for (let i = 0; i < 5; i++) R(x, i % 2 ? '#e2574c' : '#fffaf0', 2 + i * 7, 7, 7, 3);
    R(x, '#8b8f9c', 18, 9, 2, 12);
    const v = charSheet('vendor')[0][0]; x.drawImage(v, 4, 8);
    R(x, '#c9ccd4', 2, 22, 34, 4); R(x, '#e6e8ee', 2, 22, 34, 1); R(x, '#3b82c4', 2, 26, 34, 9); R(x, '#5a8fd6', 2, 26, 34, 2); R(x, '#2f5a94', 2, 33, 34, 2);
    for (let i = 0; i < 5; i++) { R(x, '#c98f5a', 20 + i * 3, 15, 1, 8); R(x, ['#e2574c', '#f2a93b', '#8b5e3c'][i % 3], 19 + i * 3, 15, 3, 4); }
    ell(x, '#2f2a3a', 8, 36, 3, 3); ell(x, '#8b8f9c', 8, 36, 1, 1); ell(x, '#2f2a3a', 29, 36, 3, 3); ell(x, '#8b8f9c', 29, 36, 1, 1);
    R(x, '#fffaf0', 6, 28, 14, 5); R(x, '#e2574c', 8, 30, 10, 1);
  });
  def('fountain', 44, 30, x => {
    ell(x, '#b3aea3', 21.5, 17, 21.5, 12); ell(x, '#d5d1c8', 21.5, 16, 20, 11); ell(x, '#5fb0e0', 21.5, 16, 16, 8); ell(x, '#8fd0f0', 18, 14, 8, 3);
    R(x, '#d5d1c8', 19, 6, 5, 11); R(x, '#eceae4', 19, 6, 2, 11); ell(x, '#d5d1c8', 21.5, 6, 5, 2);
    R(x, '#cfeefa', 21, 1, 1, 5); R(x, '#cfeefa', 17, 3, 1, 3); R(x, '#cfeefa', 25, 3, 1, 3); R(x, '#fff', 16, 6, 1, 2); R(x, '#fff', 26, 6, 1, 2);
  });

  /* ---------- núi sau trường ---------- */
  const pine = (name, c) => def(name, 30, 50, x => {
    R(x, '#7a5232', 13, 36, 4, 14); R(x, '#5f3f26', 15, 36, 2, 14); R(x, '#5f3f26', 11, 48, 8, 2);
    tri(x, c, 15, 22, 16, 14); tri(x, c, 15, 11, 15, 11); tri(x, c, 15, 1, 13, 8);
    tri(x, shade(c, 18), 12, 4, 9, 3); tri(x, shade(c, 18), 11, 15, 9, 4); tri(x, shade(c, 18), 10, 27, 8, 5);
    R(x, shade(c, -24), 2, 37, 26, 1); R(x, shade(c, -24), 5, 25, 20, 1); R(x, shade(c, -24), 8, 13, 14, 1);
  });
  pine('pine', '#3f8a52'); pine('pine2', '#2f7550');
  def('rock', 18, 13, x => { ell(x, '#9c978c', 8.5, 7, 8.5, 5.5); ell(x, '#b9b4a8', 6.5, 5, 5, 3); ell(x, '#d5d1c8', 5, 4, 2, 1); R(x, '#7f7a70', 4, 11, 11, 1); });
  def('rockBig', 30, 22, x => { ell(x, '#8f8a80', 14.5, 12, 14.5, 9.5); ell(x, '#aaa598', 11, 9, 9, 6); ell(x, '#c9c4b8', 9, 6, 4, 2); R(x, '#757067', 6, 20, 19, 1); R(x, '#5fae4a', 18, 4, 5, 2); R(x, '#7cc75f', 19, 3, 3, 1); });
  def('picnicmat', 44, 28, x => {
    for (let j = 0; j < 7; j++) for (let i = 0; i < 11; i++) R(x, (i + j) % 2 ? '#fffaf0' : '#e2574c', i * 4, j * 4, 4, 4);
    R(x, '#c2453b', 0, 27, 44, 1);
    // giỏ mây + đồ ăn
    R(x, '#c98f5a', 5, 7, 12, 9); R(x, '#a8713f', 5, 14, 12, 2); R(x, '#dba56e', 5, 7, 12, 2); R(x, '#a8713f', 8, 3, 1, 4); R(x, '#a8713f', 13, 3, 1, 4); R(x, '#a8713f', 8, 3, 6, 1);
    ell(x, '#ffffff', 28, 10, 5, 4); ell(x, '#f2a93b', 28, 10, 3, 2); R(x, '#5fae4a', 27, 9, 2, 1);
    R(x, '#8fd067', 34, 16, 4, 7); R(x, '#fff', 34, 16, 4, 1); R(x, '#f2a93b', 21, 18, 5, 4); R(x, '#fff', 22, 17, 3, 1);
  }, true);
  def('summit', 18, 28, x => {
    R(x, '#b3aea3', 3, 20, 12, 8); R(x, '#d5d1c8', 3, 20, 12, 2); R(x, '#9c978c', 3, 26, 12, 2);
    R(x, '#d5d1c8', 6, 8, 6, 12); R(x, '#eceae4', 6, 8, 2, 12); R(x, '#e2574c', 6, 10, 6, 3);
    R(x, '#8b8f9c', 8, 0, 1, 8); R(x, '#f4d35e', 9, 0, 6, 4); R(x, '#d9b23c', 9, 3, 6, 1);
  });
  def('trailsign', 22, 24, x => { R(x, '#8b5e3c', 10, 8, 2, 16); R(x, '#6f472c', 11, 8, 1, 16); R(x, '#c98f5a', 0, 0, 22, 9); R(x, '#dba56e', 0, 0, 22, 2); R(x, '#8a5a3a', 0, 8, 22, 1); tri(x, '#3f7d5c', 7, 2, 5, 4); tri(x, '#3f7d5c', 14, 1, 6, 5); R(x, '#fff', 14, 2, 1, 1); });
  def('backgate', 34, 26, x => {
    R(x, '#f4d273', 0, 4, 6, 22); R(x, '#fff3c4', 0, 4, 2, 22); R(x, '#c8583f', 0, 1, 6, 4); R(x, '#f4d273', 28, 4, 6, 22); R(x, '#e2bb57', 32, 4, 2, 22); R(x, '#c8583f', 28, 1, 6, 4);
    for (let i = 0; i < 6; i++) R(x, '#5f656f', 7 + i * 4, 6, 1, 18); R(x, '#5f656f', 6, 8, 22, 1); R(x, '#5f656f', 6, 21, 22, 1);
  });
  def('libsign', 20, 24, x => {
    R(x, '#8b5e3c', 9, 12, 2, 12); R(x, '#6f472c', 5, 22, 10, 2);
    R(x, '#2a2136', 0, 0, 20, 14); R(x, '#3f7d5c', 1, 1, 18, 12); R(x, '#4f9a6b', 1, 1, 18, 2);
    R(x, '#fffaf0', 4, 5, 5, 6); R(x, '#fffaf0', 11, 5, 5, 6); R(x, '#d9d0bd', 9, 5, 2, 6); R(x, '#8fa0ab', 5, 7, 3, 1); R(x, '#8fa0ab', 12, 7, 3, 1); R(x, '#8fa0ab', 5, 9, 3, 1); R(x, '#8fa0ab', 12, 9, 3, 1);
  });

  /* ---------- nhà vệ sinh ---------- */
  def('wcsink', 24, 22, x => {
    R(x, '#fbf8f0', 0, 0, 24, 9); R(x, '#ffffff', 0, 0, 24, 2); R(x, '#d6cfbe', 0, 8, 24, 1); R(x, '#e9c9d3', 0, 9, 24, 13); R(x, '#d3a9b7', 0, 20, 24, 2);
    R(x, '#b8c4cc', 6, 2, 12, 6); R(x, '#6fb4dc', 8, 3, 8, 4); R(x, '#c9ccd4', 11, 0, 2, 3); R(x, '#e98fa5', 20, 3, 2, 4); R(x, '#fff', 20, 2, 2, 1);
  });

  /* ---------- đạo cụ cắt cảnh (không viền để vẽ đè lên nhân vật) ---------- */
  def('yoyo', 5, 5, x => { ell(x, '#e2574c', 2, 2, 2, 2); R(x, '#ffe066', 2, 2, 1, 1); R(x, '#f79a90', 1, 1, 1, 1); });
  def('yoyoB', 5, 5, x => { ell(x, '#3b82c4', 2, 2, 2, 2); R(x, '#ffe066', 2, 2, 1, 1); R(x, '#8fc1ee', 1, 1, 1, 1); });
  const top = (name, a, b, f) => def(name, 7, 9, x => {
    R(x, '#8b5e3c', 3, 0, 1, 2); R(x, a, 1, 2, 5, 2); R(x, b, 0, 3, 7, 2); R(x, a, 1, 5, 5, 1); R(x, shade(a, -20), 2, 6, 3, 1); R(x, '#8b8f9c', 3, 7, 1, 2);
    R(x, '#fff', f ? 1 : 4, 3, 2, 1);
  });
  top('top0', '#e2574c', '#f4d35e', 0); top('top1', '#e2574c', '#f4d35e', 1); top('topB0', '#3b82c4', '#8fd067', 0); top('topB1', '#3b82c4', '#8fd067', 1);
  def('cardBack', 6, 8, x => { R(x, '#fffaf0', 0, 0, 6, 8); R(x, '#d9534f', 1, 1, 4, 6); R(x, '#ffe066', 2, 3, 2, 2); });
  def('cardFace', 6, 8, x => { R(x, '#fffaf0', 0, 0, 6, 8); R(x, '#2a2136', 1, 1, 1, 2); R(x, '#d9534f', 3, 4, 2, 2); });
  def('cardPile', 12, 7, x => { R(x, '#fffaf0', 0, 1, 7, 6); R(x, '#d9534f', 1, 2, 5, 4); R(x, '#fffaf0', 5, 0, 7, 6); R(x, '#2a2136', 6, 1, 1, 2); R(x, '#d9534f', 9, 3, 2, 2); });
  def('lipstick', 3, 7, x => { R(x, '#d9534f', 1, 0, 1, 2); R(x, '#d9534f', 0, 1, 3, 2); R(x, '#f4d35e', 0, 3, 3, 1); R(x, '#2a2136', 0, 4, 3, 3); }, true);
  def('puff', 6, 5, x => { ell(x, '#f7c9b8', 2.5, 2, 2.5, 2); R(x, '#fff', 1, 1, 2, 1); }, true);
  def('sparkle0', 5, 5, x => { R(x, '#fff7c2', 2, 0, 1, 5); R(x, '#fff7c2', 0, 2, 5, 1); R(x, '#ffffff', 2, 2, 1, 1); }, true);
  def('sparkle1', 5, 5, x => { R(x, '#fff7c2', 2, 1, 1, 3); R(x, '#fff7c2', 1, 2, 3, 1); }, true);

  /* ---------- xe bus, tàu hoả, ga tàu ---------- */
  def('bus', 72, 32, x => {
    R(x, '#d9d3c4', 2, 0, 68, 2); R(x, '#fbf7ee', 0, 2, 72, 13); R(x, '#e2574c', 0, 14, 72, 2); R(x, '#3f9a6b', 0, 16, 72, 10); R(x, '#2f7d5b', 0, 24, 72, 2);
    for (let i = 0; i < 5; i++) { R(x, '#5c6f7c', 3 + i * 10, 4, 9, 9); R(x, '#8fc1e3', 4 + i * 10, 5, 7, 7); R(x, '#b9dcf2', 4 + i * 10, 5, 7, 2); }
    R(x, '#5c6f7c', 53, 4, 9, 21); R(x, '#9cc7dd', 54, 5, 7, 11); R(x, '#7ba9c2', 54, 17, 7, 7); R(x, '#5c6f7c', 57, 5, 1, 19);
    R(x, '#8fc1e3', 64, 4, 7, 10); R(x, '#b9dcf2', 64, 4, 7, 2); R(x, '#ffe9a0', 70, 18, 2, 3); R(x, '#e2574c', 0, 18, 1, 3);
    R(x, '#fffaf0', 6, 18, 30, 5); R(x, '#3f9a6b', 8, 20, 6, 1); R(x, '#3f9a6b', 16, 20, 10, 1); R(x, '#3f9a6b', 28, 20, 6, 1);
    for (const a of [14, 46]) { ell(x, '#2f2a3a', a, 27, 5, 5); ell(x, '#8b8f9c', a, 27, 2, 2); }
  });
  SPR.busL = flipH(SPR.bus);
  def('train', 168, 34, x => {
    const car = (a, col) => {
      R(x, '#fbf7ee', a, 4, 52, 3); R(x, col, a, 7, 52, 17); R(x, shade(col, -22), a, 21, 52, 4); R(x, '#ffe066', a, 17, 52, 1);
      for (let i = 0; i < 4; i++) { R(x, '#8fc1e3', a + 4 + i * 12, 9, 9, 7); R(x, '#b9dcf2', a + 4 + i * 12, 9, 9, 2); }
      for (const w of [10, 42]) { ell(x, '#2f2a3a', a + w, 29, 4, 4); ell(x, '#8b8f9c', a + w, 29, 1.5, 1.5); }
      R(x, '#5f656f', a + 52, 19, 4, 3);
    };
    car(0, '#3b82c4'); car(56, '#3b82c4');
    R(x, '#fbf7ee', 112, 3, 44, 3); R(x, '#d9534f', 112, 6, 50, 18); R(x, '#b23b3b', 112, 21, 52, 4); R(x, '#ffe066', 112, 17, 52, 1);
    R(x, '#d9534f', 160, 10, 6, 14); R(x, '#d9534f', 164, 14, 3, 10); R(x, '#8fc1e3', 148, 8, 11, 8); R(x, '#b9dcf2', 148, 8, 11, 2); R(x, '#8fc1e3', 116, 9, 9, 7); R(x, '#8fc1e3', 130, 9, 9, 7);
    R(x, '#ffe9a0', 165, 18, 2, 4); R(x, '#2a2136', 118, 0, 6, 3);
    for (const w of [122, 138, 154]) { ell(x, '#2f2a3a', w, 29, 4, 4); ell(x, '#8b8f9c', w, 29, 1.5, 1.5); }
  });
  SPR.trainL = flipH(SPR.train);
  def('station', 128, 84, x => {
    R(x, '#a84530', 0, 4, 128, 20); R(x, '#c8583f', 0, 4, 128, 3); R(x, '#8a3625', 0, 22, 128, 2);
    for (let i = 0; i < 128; i += 8) { R(x, '#8a3625', i, 9, 1, 5); R(x, '#8a3625', i + 4, 15, 1, 5); }
    R(x, '#c8583f', 48, 0, 32, 8); R(x, '#fff6d8', 56, 2, 16, 16); ell(x, '#2a2136', 63.5, 10, 6, 6); ell(x, '#fffaf0', 63.5, 10, 5, 5); R(x, '#2a2136', 63, 6, 1, 5); R(x, '#2a2136', 63, 10, 4, 1);
    R(x, '#f6e6c2', 4, 24, 120, 60); R(x, '#e0cfa6', 4, 24, 120, 2); R(x, '#cdbb92', 4, 78, 120, 6);
    R(x, '#2a2136', 22, 28, 84, 14); R(x, '#2f5d8a', 23, 29, 82, 12); R(x, '#4a7fb5', 23, 29, 82, 2);
    R(x, '#5b4636', 50, 50, 28, 34); R(x, '#7a5f48', 52, 52, 11, 32); R(x, '#7a5f48', 65, 52, 11, 32); R(x, '#9cc7dd', 54, 55, 7, 10); R(x, '#9cc7dd', 67, 55, 7, 10);
    drawWin(x, 12, 50, 16, 16); R(x, '#8b5e3c', 10, 68, 20, 3); R(x, '#fffaf0', 12, 44, 16, 5); R(x, '#e2574c', 14, 46, 12, 1);
    drawWin(x, 98, 50, 16, 16); R(x, '#fffaf0', 86, 52, 9, 12); R(x, '#5f656f', 87, 54, 7, 1); R(x, '#5f656f', 87, 57, 7, 1); R(x, '#5f656f', 87, 60, 5, 1);
  });
  /* ---------- biển, bờ sông ---------- */
  def('palm', 34, 48, x => {
    line(x, '#a37248', 17, 46, 15, 16); line(x, '#a37248', 18, 46, 16, 16); line(x, '#8b5e3c', 19, 46, 17, 16); R(x, '#6f472c', 14, 46, 8, 2);
    for (const [dx, dy] of [[-14, 2], [-10, -8], [-3, -12], [6, -11], [13, -5], [15, 4], [-13, 8], [10, 10]]) { line(x, '#3f8a52', 16, 16, 16 + dx, 16 + dy); line(x, '#5fae4a', 16, 15, 16 + dx, 15 + dy); line(x, '#4c9a3c', 17, 17, 17 + dx, 17 + dy); }
    ell(x, '#8b5e3c', 15, 18, 2, 2); ell(x, '#8b5e3c', 19, 19, 2, 2);
  });
  def('parasol', 34, 34, x => {
    for (let j = 0; j < 9; j++) { const w = Math.round(16 * (j + 1) / 9); for (let i = -w; i < w; i++) R(x, Math.floor((i + 32) / 5) % 2 ? '#fffaf0' : '#e2574c', 17 + i, j, 1, 1); }
    R(x, '#c2453b', 1, 9, 32, 1); R(x, '#8b8f9c', 16, 10, 2, 18);
    R(x, '#5a8fd6', 4, 24, 22, 5); R(x, '#7fb0ea', 4, 24, 22, 1); R(x, '#3b6fb6', 4, 28, 22, 1); R(x, '#5a8fd6', 2, 19, 5, 6); R(x, '#8b8f9c', 5, 29, 2, 4); R(x, '#8b8f9c', 23, 29, 2, 4);
  });
  def('castle', 22, 18, x => { R(x, '#e6d096', 2, 8, 18, 10); R(x, '#f1dfae', 2, 8, 18, 2); for (const a of [2, 9, 16]) { R(x, '#e6d096', a, 3, 4, 6); R(x, '#f1dfae', a, 3, 4, 1); } R(x, '#c9b170', 9, 12, 4, 6); R(x, '#8b8f9c', 11, 0, 1, 4); R(x, '#e2574c', 12, 0, 4, 2); });
  def('buoy', 14, 22, x => { R(x, '#8b8f9c', 6, 6, 2, 16); R(x, '#fffaf0', 0, 0, 14, 8); R(x, '#3b82c4', 1, 1, 12, 6); R(x, '#fff', 3, 3, 3, 1); R(x, '#fff', 8, 4, 3, 1); R(x, '#fff', 5, 5, 3, 1); });
  def('shells', 16, 9, x => { ell(x, '#f7c9b8', 3, 5, 3, 3); R(x, '#e9a48e', 2, 4, 1, 3); R(x, '#e9a48e', 4, 4, 1, 3); ell(x, '#fffaf0', 11, 4, 3, 2.4); R(x, '#d9d0bd', 10, 3, 1, 3); R(x, '#d9d0bd', 12, 3, 1, 3); R(x, '#c9a0f0', 7, 7, 2, 2); });
  def('fishspot', 18, 18, x => { R(x, '#8b8f9c', 2, 8, 9, 9); R(x, '#c9ccd4', 2, 8, 9, 2); R(x, '#5fb0e0', 3, 10, 7, 2); R(x, '#5f656f', 1, 6, 11, 1); line(x, '#8b5e3c', 12, 16, 17, 0); R(x, '#fffaf0', 17, 0, 1, 6); });
  def('boat', 44, 18, x => { R(x, '#8a5a3a', 2, 6, 40, 8); R(x, '#a9703f', 2, 6, 40, 2); R(x, '#6f472c', 6, 14, 32, 3); R(x, '#6f472c', 0, 4, 4, 4); R(x, '#6f472c', 40, 4, 4, 4); R(x, '#c58c56', 12, 8, 3, 5); R(x, '#c58c56', 28, 8, 3, 5); line(x, '#c9a467', 20, 9, 34, 0); });
  /* ---------- đạo cụ hoạt cảnh: lau nhà, rửa xe, đấm lưng, khói, bị bắt ---------- */
  def('mop', 7, 18, x => { R(x, '#b98253', 3, 0, 1, 13); R(x, '#8a5a3a', 0, 12, 7, 2); R(x, '#eaf3fb', 0, 14, 7, 4); R(x, '#c9d8ea', 1, 15, 1, 3); R(x, '#c9d8ea', 3, 15, 1, 3); R(x, '#c9d8ea', 5, 15, 1, 3); });
  def('sponge', 6, 4, x => { R(x, '#f4d35e', 0, 0, 6, 4); R(x, '#5fae4a', 0, 3, 6, 1); }, true);
  def('bub0', 5, 5, x => { ring(x, '#eaf6fc', 2, 2, 2); R(x, '#ffffff', 1, 1, 1, 1); }, true);
  def('bub1', 3, 3, x => { R(x, '#eaf6fc', 1, 0, 1, 3); R(x, '#eaf6fc', 0, 1, 3, 1); }, true);
  def('smoke0', 8, 7, x => { ell(x, '#e6e6ea', 3, 4, 3, 2.4); ell(x, '#f4f4f6', 5, 2, 2, 2); }, true);
  def('smoke1', 10, 8, x => { ell(x, '#e0e0e6', 4, 5, 4, 2.6); ell(x, '#f0f0f3', 6, 2, 3, 2); ell(x, '#f8f8fa', 2, 2, 1.6, 1.6); }, true);
  def('hit', 7, 7, x => { R(x, '#ffe066', 3, 0, 1, 7); R(x, '#ffe066', 0, 3, 7, 1); R(x, '#fff', 2, 2, 3, 3); R(x, '#ffe066', 1, 1, 1, 1); R(x, '#ffe066', 5, 1, 1, 1); R(x, '#ffe066', 1, 5, 1, 1); R(x, '#ffe066', 5, 5, 1, 1); }, true);
  def('emoBang', 5, 9, x => { R(x, '#e2574c', 1, 0, 3, 5); R(x, '#e2574c', 2, 5, 1, 1); R(x, '#e2574c', 1, 7, 3, 2); });
  def('cup', 6, 8, x => { R(x, '#fffaf0', 0, 2, 6, 6); R(x, '#c98f5a', 1, 4, 4, 3); R(x, '#2a2136', 1, 6, 1, 1); R(x, '#2a2136', 3, 6, 1, 1); R(x, '#d9534f', 4, 0, 1, 3); });
  /* ---------- các phòng trong trường, TTTM, khu game, nhà bạn ---------- */
  // cửa phòng đè lên ô cửa sổ tầng trệt của dãy nhà trường (không viền)
  def('sdoor', 22, 36, x => { R(x, '#f4d273', 0, 0, 22, 36); R(x, '#fffaf0', 3, 1, 16, 6); R(x, '#5f656f', 3, 6, 16, 1); drawDoor(x, 4, 8, 14, 27, '#3f7d5c'); }, true);
  def('sdoorBig', 40, 8, x => { R(x, '#fffaf0', 0, 0, 40, 8); R(x, '#5f656f', 0, 7, 40, 1); }, true);
  const bshelf = (name, col) => def(name, 26, 38, x => {
    R(x, '#8a5a3a', 0, 0, 26, 38); R(x, '#a9703f', 0, 0, 26, 2); R(x, col, 2, 3, 22, 6); R(x, shade(col, 30), 2, 3, 22, 1);
    for (let j = 0; j < 3; j++) { R(x, '#5b3d27', 2, 11 + j * 9, 22, 7); for (let i = 0; i < 7; i++) R(x, i % 3 === 0 ? col : ['#fffaf0', shade(col, -25), '#e3ddd0'][(i + j) % 3], 3 + i * 3, 12 + j * 9 + ((i + j) % 2), 2, 6 - ((i + j) % 2)); }
  });
  for (const s of BOOK_SUBJ) bshelf('bs_' + s, SUBJ[s].color);
  def('shelfsign', 26, 9, x => { R(x, '#2a2136', 0, 0, 26, 9); R(x, '#fffaf0', 1, 1, 24, 7); R(x, '#e3ddd0', 1, 7, 24, 1); }, true);   // biển tên môn trên đầu tủ sách
  def('napmat', 30, 18, x => { R(x, '#e6d096', 0, 0, 30, 18); R(x, '#c9b170', 0, 16, 30, 2); for (let i = 0; i < 30; i += 4) R(x, '#d9c27f', i, 0, 1, 16); R(x, '#fffaf0', 2, 3, 8, 11); R(x, '#e3ddd0', 2, 12, 8, 2); });
  def('sleeper', 30, 18, x => { x.drawImage(SPR.napmat, -1, -1); R(x, '#f8d0a8', 3, 5, 7, 7); R(x, '#2c2733', 2, 4, 5, 8); R(x, '#8fb0d8', 10, 3, 18, 12); R(x, '#6f8fb8', 10, 13, 18, 2); R(x, '#2a2136', 8, 8, 1, 1); });
  def('medbed', 34, 22, x => { R(x, '#c9ccd4', 0, 4, 34, 18); R(x, '#fbfdff', 1, 5, 32, 14); R(x, '#ffffff', 2, 6, 9, 11); R(x, '#9fd6c4', 12, 6, 20, 12); R(x, '#7fbfa9', 12, 16, 20, 2); R(x, '#8b8f9c', 0, 0, 2, 22); R(x, '#8b8f9c', 32, 2, 2, 20); });
  def('redcross', 14, 14, x => { R(x, '#fffaf0', 0, 0, 14, 14); R(x, '#d9534f', 5, 2, 4, 10); R(x, '#d9534f', 2, 5, 10, 4); });
  def('mic', 8, 22, x => { R(x, '#5f656f', 3, 6, 2, 14); R(x, '#3a3f55', 0, 20, 8, 2); ell(x, '#2a2136', 3.5, 3, 3, 3); R(x, '#8b8f9c', 2, 2, 2, 1); });
  def('speaker', 14, 22, x => { R(x, '#2a2136', 0, 0, 14, 22); ell(x, '#5f656f', 6.5, 6, 4, 4); ell(x, '#3a3f55', 6.5, 6, 2, 2); ell(x, '#5f656f', 6.5, 15, 5, 5); ell(x, '#3a3f55', 6.5, 15, 2.5, 2.5); });
  def('guitar', 10, 26, x => { R(x, '#8a5a3a', 4, 0, 2, 14); R(x, '#2a2136', 3, 0, 4, 3); ell(x, '#c98f5a', 4.5, 19, 4.5, 6); ell(x, '#dba56e', 4.5, 15, 3.4, 3.4); ell(x, '#3a2a22', 4.5, 18, 1.6, 1.6); R(x, '#fffaf0', 4, 4, 1, 16); });
  def('poster', 14, 18, x => { R(x, '#fffaf0', 0, 0, 14, 18); R(x, '#7a5fc9', 1, 1, 12, 16); ell(x, '#ffe066', 7, 7, 3.5, 3.5); R(x, '#fff', 3, 13, 8, 1); R(x, '#fff', 4, 15, 6, 1); });
  def('floorlamp', 12, 28, x => { R(x, '#5f656f', 5, 10, 2, 16); R(x, '#4a4f5a', 2, 26, 8, 2); tri(x, '#ffe9a0', 6, 0, 10, 6); R(x, '#f4d35e', 0, 9, 12, 1); });
  // gian hàng trong TTTM (mái hiên theo màu) và quầy
  const stall = (name, col) => def(name, 52, 46, x => {
    for (let i = 0; i < 7; i++) { R(x, i % 2 ? '#fbf7ee' : col, i * 8 - 2, 0, 8, 10); R(x, i % 2 ? '#e3ddd0' : shade(col, -22), i * 8 - 2, 9, 8, 2); }
    R(x, '#8b5e3c', 1, 11, 3, 20); R(x, '#8b5e3c', 48, 11, 3, 20);
    const v = charSheet('vendor')[0][0]; x.drawImage(v, 17, 8);
    R(x, '#e9e4d8', 0, 28, 52, 6); R(x, '#fbf8f0', 0, 28, 52, 2); R(x, shade(col, 35), 0, 34, 52, 12); R(x, shade(col, -10), 0, 43, 52, 3);
    R(x, col, 4, 24, 6, 6); R(x, shade(col, 30), 12, 25, 5, 5); R(x, '#f4d35e', 38, 24, 5, 6); R(x, '#5a8fd6', 44, 25, 5, 5);
  });
  stall('stA', '#d9534f'); stall('stB', '#3b82c4'); stall('stC', '#5fae4a'); stall('stD', '#f2a93b'); stall('stE', '#7a5fc9'); stall('stF', '#2e9e86'); stall('stG', '#e06a9a');
  // máy trong khu game
  const cab = (name, body, scr, top) => def(name, 20, 36, x => {
    R(x, body, 0, 4, 20, 32); R(x, shade(body, 25), 0, 4, 20, 2); R(x, shade(body, -25), 0, 32, 20, 4); R(x, top, 1, 0, 18, 5); R(x, '#fff', 3, 1, 3, 1); R(x, '#fff', 12, 2, 4, 1);
    R(x, '#1b1530', 2, 8, 16, 12); R(x, scr, 3, 9, 14, 10); R(x, shade(scr, 40), 4, 10, 5, 2); R(x, '#2a2136', 1, 22, 18, 5); R(x, '#e2574c', 4, 21, 2, 4); R(x, '#f4d35e', 11, 23, 2, 2); R(x, '#5fe0f0', 15, 23, 2, 2);
  });
  cab('cabFight', '#4a3f6b', '#ff5fa8', '#ff5fa8'); cab('cabSlot', '#d9534f', '#ffe066', '#f4d35e'); cab('cabRace', '#3b6fb6', '#5fe0f0', '#5fe0f0'); cab('cabDance', '#7a5fc9', '#8fd067', '#ffe066');
  def('cabClaw', 22, 38, x => { R(x, '#e2574c', 0, 0, 22, 38); R(x, '#f07a6f', 0, 0, 22, 2); R(x, '#bfe3f2', 2, 4, 18, 20); R(x, '#8b8f9c', 10, 4, 2, 8); R(x, '#8b8f9c', 7, 12, 8, 2); for (const [a, c2] of [[4, '#b9824f'], [10, '#e98fa5'], [15, '#8fd067']]) ell(x, c2, a + 1, 20, 2.6, 2.6); R(x, '#2a2136', 3, 27, 16, 6); R(x, '#ffe066', 9, 28, 3, 3); R(x, '#b23b3b', 0, 34, 22, 4); });
  def('dancepad', 34, 22, x => { R(x, '#2a2136', 0, 0, 34, 22); for (let j = 0; j < 2; j++) for (let i = 0; i < 3; i++) R(x, ['#5fe0f0', '#ff5fa8', '#ffe066', '#8fd067', '#ff5fa8', '#5fe0f0'][j * 3 + i], 2 + i * 11, 2 + j * 10, 9, 8); }, true);
  def('gameconsole', 22, 18, x => { R(x, '#2f2a3a', 1, 0, 20, 12); R(x, '#5fe0f0', 3, 2, 16, 8); R(x, '#ff5fa8', 5, 4, 4, 3); R(x, '#ffe066', 12, 5, 3, 3); R(x, '#8a5a3a', 0, 12, 22, 6); R(x, '#5f656f', 4, 14, 5, 2); R(x, '#5f656f', 13, 14, 5, 2); });
  def('toiletdoor', 20, 30, x => { drawDoor(x, 1, 1, 18, 29, '#8fb9cf'); R(x, '#fffaf0', 7, 5, 6, 5); R(x, '#3b6fb6', 9, 6, 2, 3); }, true);
  def('paper', 6, 5, x => { R(x, '#fffaf0', 0, 0, 6, 5); R(x, '#8fa0ab', 1, 1, 4, 1); R(x, '#8fa0ab', 1, 3, 3, 1); }, true);
  def('book', 7, 5, x => { R(x, '#fffaf0', 0, 0, 7, 5); R(x, '#d9d0bd', 3, 0, 1, 5); R(x, '#8fa0ab', 1, 2, 2, 1); R(x, '#8fa0ab', 4, 2, 2, 1); }, true);
  def('gunpart', 12, 5, x => { R(x, '#3a3f55', 0, 1, 12, 3); R(x, '#8a5a3a', 0, 1, 4, 4); R(x, '#55662f', 6, 3, 2, 2); }, true);
  def('bball', 7, 7, x => { ell(x, '#e98a3c', 3, 3, 3, 3); R(x, '#8a4a1c', 3, 0, 1, 7); R(x, '#8a4a1c', 0, 3, 7, 1); });
  def('shuttle', 5, 7, x => { R(x, '#fffaf0', 0, 0, 1, 4); R(x, '#fffaf0', 2, 0, 1, 4); R(x, '#fffaf0', 4, 0, 1, 4); R(x, '#d9534f', 1, 4, 3, 3); }, true);
  def('zzz', 9, 9, x => { R(x, '#5a8fd6', 0, 0, 5, 1); R(x, '#5a8fd6', 3, 1, 1, 1); R(x, '#5a8fd6', 2, 2, 1, 1); R(x, '#5a8fd6', 0, 3, 5, 1); R(x, '#8fc1ee', 5, 5, 4, 1); R(x, '#8fc1ee', 6, 6, 2, 1); R(x, '#8fc1ee', 5, 8, 4, 1); }, true);
  def('weedfly', 5, 6, x => { R(x, '#4c9a3c', 2, 0, 1, 6); R(x, '#6fbd4f', 0, 2, 2, 1); R(x, '#6fbd4f', 3, 1, 2, 1); }, true);
  def('ricebox', 8, 6, x => { R(x, '#e2574c', 0, 2, 8, 4); R(x, '#fbf7ee', 0, 0, 8, 3); }, true);
  for (const k of ['bike', 'ebike', 'moto50']) SPR[k + 'L'] = flipH(SPR[k]);

  /* ---------- khối nhà vệ sinh riêng ngoài sân trường: cửa NAM (xanh) · cửa NỮ (hồng) ---------- */
  def('wcblock', 72, 58, x => {
    R(x, '#8fa0ab', 0, 4, 72, 8); R(x, '#a8b6bf', 0, 4, 72, 2); R(x, '#6f7f8a', 0, 11, 72, 1);
    R(x, '#eef3f6', 2, 12, 68, 46); R(x, '#d6e0e6', 2, 12, 68, 2); R(x, '#c9d6dd', 2, 52, 68, 6);
    for (let i = 4; i < 70; i += 6) R(x, '#dfe9ee', i, 15, 1, 36);
    R(x, '#3a3f55', 18, 0, 36, 7); R(x, '#fffaf0', 19, 1, 34, 5);
    // cửa nam
    drawDoor(x, 6, 26, 22, 30, '#5a8fd6'); R(x, '#fffaf0', 11, 16, 12, 8); ell(x, '#3b6fb6', 17, 18, 1.6, 1.6); R(x, '#3b6fb6', 15, 20, 5, 3);
    // cửa nữ
    drawDoor(x, 44, 26, 22, 30, '#e98fa5'); R(x, '#fffaf0', 49, 16, 12, 8); ell(x, '#d9537a', 55, 18, 1.6, 1.6); tri(x, '#d9537a', 55, 19, 4, 3); R(x, '#d9537a', 53, 22, 5, 1);
    R(x, '#8b8f9c', 34, 30, 4, 22); R(x, '#5fae4a', 33, 46, 6, 6);
  });
  /* ---------- các cửa hàng trong TTTM: mỗi nhà một kiểu, hàng hoá bày ra trước mặt ---------- */
  // phần sau: tường + biển hiệu + kệ trưng bày; phần trước: quầy (người bán đứng giữa hai phần)
  const shopBack = (name, wall, sign, fn) => def(name + '_b', 54, 44, x => {
    R(x, shade(wall, -22), 0, 0, 54, 44); R(x, wall, 1, 9, 52, 35); R(x, shade(wall, 10), 1, 9, 52, 1);
    R(x, sign, 0, 0, 54, 9); R(x, shade(sign, 28), 0, 0, 54, 1); R(x, shade(sign, -28), 0, 8, 54, 1);
    fn(x);
  });
  const shopFront = (name, col, fn) => def(name + '_f', 54, 22, x => {
    R(x, shade(col, 32), 0, 7, 54, 3); R(x, col, 0, 10, 54, 9); R(x, shade(col, -25), 0, 19, 54, 3);
    if (fn) fn(x);
  });
  const ic = (x, id, a, b) => x.drawImage(iconCv(id), a, b);
  const shirt = (x, col, a, b) => { R(x, col, a + 3, b, 8, 11); R(x, col, a, b, 3, 5); R(x, col, a + 11, b, 3, 5); R(x, shade(col, -25), a + 3, b + 9, 8, 2); R(x, '#fffaf0', a + 6, b, 2, 2); R(x, '#fffaf0', a + 5, b + 4, 4, 3); };
  // RẠP PHIM: bóng đèn quanh biển, hai tấm áp phích phim, cửa bán vé, xô bắp rang
  shopBack('sh_phim', '#3a2140', '#b23b3b', x => {
    for (let i = 0; i < 13; i++) { R(x, '#ffe066', 2 + i * 4, 1, 2, 1); R(x, '#ffe066', 2 + i * 4, 7, 2, 1); }
    R(x, '#ffe066', 3, 11, 15, 22); R(x, '#3b82c4', 4, 12, 13, 20); ell(x, '#ffe066', 13, 16, 2.5, 2.5); tri(x, '#2e9e86', 10, 20, 8, 7); R(x, '#2e9e86', 4, 26, 13, 6); R(x, '#fffaf0', 5, 28, 11, 1);
    R(x, '#ffe066', 36, 11, 15, 22); R(x, '#7a5fc9', 37, 12, 13, 20); R(x, '#ff9fc0', 41, 15, 5, 5); R(x, '#ff9fc0', 39, 17, 9, 3); R(x, '#fffaf0', 38, 26, 11, 1); R(x, '#fffaf0', 39, 29, 9, 1);
    R(x, '#1b1530', 19, 11, 16, 15); R(x, '#24406b', 20, 12, 14, 13); ic(x, 'vephim', 18, 10);
    for (let i = 0; i < 6; i++) R(x, i % 2 ? '#fffaf0' : '#d9534f', 21 + i * 2, 33, 2, 10);
    ell(x, '#fff3c8', 23, 31, 3, 2.4); ell(x, '#ffe9a0', 27, 30, 3, 2.6); ell(x, '#fff3c8', 31, 31, 3, 2.4); R(x, '#f4d35e', 25, 29, 2, 1);
  });
  shopFront('sh_phim', '#b23b3b', x => { R(x, '#ffe066', 0, 11, 54, 1); for (let i = 0; i < 5; i++) { R(x, '#ffe066', 5 + i * 11, 14, 3, 3); } for (let k = 0; k < 2; k++) { const a = 4 + k * 40; for (let i = 0; i < 4; i++) R(x, i % 2 ? '#fffaf0' : '#d9534f', a + i * 2, 2, 2, 6); ell(x, '#fff3c8', a + 4, 1, 4, 1.6); } });
  // NHÀ SÁCH: kệ gỗ kín sách đủ màu, cuốn sách tham khảo mở ra ở giữa
  shopBack('sh_sach', '#f3e7cc', '#3b82c4', x => {
    R(x, '#8a5a3a', 2, 10, 50, 34); const cols = ['#d9534f', '#3b82c4', '#f2a93b', '#5fae4a', '#7a5fc9', '#e06a9a', '#2e9e86', '#fffaf0', '#c9862b'];
    for (let r = 0; r < 3; r++) { R(x, '#5b3d27', 3, 11 + r * 11, 48, 9); let a = 4, k = r * 3; while (a < 49) { const w = 2 + ((k * 7) % 2), h = 6 + ((k * 5) % 3); R(x, cols[k % cols.length], a, 20 + r * 11 - h, w, h); R(x, shade(cols[k % cols.length], -25), a, 20 + r * 11 - h, w, 1); a += w + ((k % 5) === 0 ? 1 : 0); k++; } R(x, '#a9703f', 3, 20 + r * 11, 48, 2); }
    R(x, '#fffaf0', 16, 20, 22, 14); ic(x, 'sachtk', 18, 18); R(x, '#a9703f', 15, 34, 24, 2);
  });
  shopFront('sh_sach', '#a9703f', x => { for (let i = 0; i < 4; i++) R(x, ['#d9534f', '#3b82c4', '#5fae4a', '#f2a93b'][i], 4, 5 - i * 2 + 2, 11 - i, 2); R(x, '#fffaf0', 36, 3, 13, 5); R(x, '#d9d0bd', 42, 3, 1, 5); R(x, '#8fa0ab', 38, 5, 3, 1); R(x, '#8fa0ab', 44, 5, 3, 1); R(x, '#6f472c', 0, 13, 54, 1); });
  // SIÊU THỊ: hai tầng kệ bày bim bim, hộp thẻ, sữa, bánh mì
  shopBack('sh_sieuthi', '#eef7ee', '#5fae4a', x => {
    for (let r = 0; r < 2; r++) R(x, '#8b8f9c', 1, 26 + r * 17, 52, 2);
    ic(x, 'bimbim', 1, 9); ic(x, 'bimbim', 18, 9); ic(x, 'hopthe', 35, 9);
    ic(x, 'sua', 1, 26); ic(x, 'banhmi', 18, 26); ic(x, 'sua', 35, 26);
  });
  shopFront('sh_sieuthi', '#fbfdff', x => { R(x, '#5fae4a', 0, 12, 54, 3); R(x, '#5f656f', 38, 1, 12, 7); R(x, '#8fd067', 40, 2, 8, 3); R(x, '#3a3f55', 39, 6, 10, 1); R(x, '#f4d35e', 6, 3, 8, 5); R(x, '#d9534f', 9, 4, 2, 2); });
  // ĂN UỐNG: bảng thực đơn có hình gà rán, trà sữa, xiên que; quầy có xô gà và cốc nước
  shopBack('sh_anuong', '#fde8c8', '#f2a93b', x => {
    for (let i = 0; i < 7; i++) R(x, i % 2 ? '#fffaf0' : '#d9534f', 1 + i * 8, 9, 8, 4);
    R(x, '#2a2136', 2, 14, 50, 24); R(x, '#3a3f55', 3, 15, 48, 22);
    ic(x, 'garan', 3, 15); ic(x, 'trasua', 18, 15); ic(x, 'xien', 33, 15);
    R(x, '#ffe066', 6, 34, 10, 1); R(x, '#ffe066', 21, 34, 10, 1); R(x, '#ffe066', 36, 34, 10, 1);
  });
  shopFront('sh_anuong', '#f2a93b', x => { for (let i = 0; i < 5; i++) R(x, i % 2 ? '#fffaf0' : '#d9534f', 5 + i * 2, 2, 2, 6); ell(x, '#d9883c', 7, 1, 2, 1.6); ell(x, '#c97a2b', 12, 1, 2, 1.6); for (const a of [36, 44]) { R(x, '#e8d6b0', a, 2, 6, 6); R(x, '#8a5a3a', a, 6, 6, 2); R(x, '#5f656f', a + 3, 0, 1, 3); } R(x, '#d9534f', 0, 13, 54, 2); });
  // NỘI THẤT: đèn cây, áp phích, chậu cây, tấm thảm treo tường
  shopBack('sh_noithat', '#efe7f7', '#7a5fc9', x => {
    x.drawImage(SPR.floorlamp, 2, 11); x.drawImage(SPR.poster, 20, 11); x.drawImage(SPR.plant, 38, 17);
    ic(x, 'd_tham', 17, 26);
  });
  shopFront('sh_noithat', '#b9aee0', x => { tri(x, '#ffe9a0', 9, 0, 4, 4); R(x, '#5f656f', 9, 4, 2, 3); R(x, '#f4d35e', 4, 3, 10, 1); ell(x, '#5fae4a', 44, 3, 4, 2.5); R(x, '#c8583f', 42, 5, 5, 3); R(x, '#8f7fd0', 0, 13, 54, 2); });
  // NHẠC CỤ: hai cây đàn treo tường, micro, trống, nốt nhạc; mặt quầy là phím đàn piano
  shopBack('sh_nhaccu', '#dff2ee', '#2e9e86', x => {
    x.drawImage(SPR.guitar, 3, 11); x.drawImage(SPR.guitar, 41, 11);
    ic(x, 'micro', 18, 11);
    ell(x, '#d9534f', 26, 36, 9, 5); R(x, '#d9534f', 17, 33, 19, 6); ell(x, '#fffaf0', 26, 33, 9, 3); R(x, '#8b8f9c', 20, 39, 1, 4); R(x, '#8b8f9c', 32, 39, 1, 4);
    for (const [a, b] of [[16, 12], [36, 16]]) { R(x, '#2a2136', a, b, 1, 6); ell(x, '#2a2136', a - 1, b + 6, 1.6, 1.2); R(x, '#2a2136', a, b, 3, 1); }
  });
  shopFront('sh_nhaccu', '#fbfdff', x => { for (let i = 0; i < 54; i += 4) R(x, '#2a2136', i + 3, 10, 1, 12); for (let i = 0; i < 54; i += 8) { if ((i / 8) % 4 === 2) continue; R(x, '#2a2136', i + 2, 10, 3, 6); } R(x, '#2e9e86', 0, 7, 54, 3); });
  // THỂ THAO: áo đấu treo, tạ tay, dây nhảy, xà đơn, bóng rổ
  shopBack('sh_thethao', '#fde4ee', '#e06a9a', x => {
    shirt(x, '#3b82c4', 3, 12); ic(x, 'tatay', 18, 10); shirt(x, '#d9534f', 37, 12);
    ic(x, 'daynhay', 1, 26); ic(x, 'xadon', 18, 26); x.drawImage(SPR.bball, 40, 33); x.drawImage(SPR.bball, 44, 27);
  });
  shopFront('sh_thethao', '#e06a9a', x => { R(x, '#5f656f', 4, 4, 2, 4); R(x, '#5f656f', 12, 4, 2, 4); R(x, '#8b8f9c', 6, 5, 6, 2); x.drawImage(SPR.bball, 40, 0); R(x, '#fffaf0', 0, 13, 54, 1); });
  // QUẦY ĐỔI XÈNG trong khu game
  shopBack('sh_xeng', '#2c2347', '#ff5fa8', x => {
    for (let i = 0; i < 13; i++) R(x, i % 2 ? '#ffe066' : '#5fe0f0', 2 + i * 4, 1, 2, 1);
    ic(x, 'xeng', 2, 14); ic(x, 'xeng', 18, 11); ic(x, 'xeng', 34, 14);
    for (let i = 0; i < 4; i++) { ell(x, '#f4d35e', 12 + i * 10, 38, 4, 1.8); R(x, '#c9a227', 8 + i * 10, 38, 8, 3); }
  });
  shopFront('sh_xeng', '#ff5fa8', x => { for (let i = 0; i < 3; i++) ell(x, '#f4d35e', 8, 6 - i * 2, 4, 1.6); for (let i = 0; i < 2; i++) ell(x, '#f4d35e', 46, 6 - i * 2, 4, 1.6); R(x, '#ffe066', 0, 13, 54, 1); });


  /* ---------- CHÙA: chính điện mái cong hai tầng, lư hương, đèn đá ---------- */
  def('pagoda', 176, 112, x => {
    const roof = '#8a3a2a', roofS = '#6e2a1e', gold = '#e8b83a', wall = '#f1d9a0', pil = '#b23b3b';
    const trap = (y0, y1, w0, w1) => { for (let y = y0; y < y1; y++) { const w = Math.round(w0 + (w1 - w0) * (y - y0) / (y1 - y0)), a = 88 - (w >> 1); R(x, roof, a, y, w, 1); for (let i = a + 2; i < a + w; i += 4) R(x, roofS, i, y, 1, 1); } R(x, gold, 88 - (w1 >> 1), y1 - 2, w1, 2); };
    trap(5, 27, 92, 142); trap(35, 59, 146, 176);
    for (const [a, b, d] of [[15, 22, -1], [161, 22, 1], [0, 54, -1], [176, 54, 1]]) { R(x, gold, a - (d > 0 ? 3 : 0), b, 3, 2); R(x, gold, a + (d > 0 ? 0 : -1) + d * 2, b - 3, 2, 3); }
    R(x, gold, 42, 3, 92, 3); ell(x, '#ffcf3a', 88, 2, 3, 2.6); R(x, gold, 46, 0, 4, 3); R(x, gold, 126, 0, 4, 3);
    R(x, wall, 44, 27, 88, 9); R(x, '#d8bd80', 44, 34, 88, 2); for (const a of [64, 108]) { ell(x, '#8a5a3a', a, 31, 3, 3); ell(x, '#f4d35e', a, 31, 1.6, 1.6); }
    R(x, wall, 8, 59, 160, 41); R(x, '#d8bd80', 8, 59, 160, 2);
    for (const a of [10, 38, 66, 104, 132, 160]) { R(x, pil, a, 60, 6, 40); R(x, '#d9534f', a, 60, 2, 40); R(x, '#5b3d27', a - 1, 97, 8, 3); }
    R(x, '#5b3d27', 74, 70, 28, 31); R(x, '#8a5a3a', 76, 72, 11, 29); R(x, '#8a5a3a', 89, 72, 11, 29); for (let j = 0; j < 4; j++) { R(x, gold, 77, 75 + j * 7, 9, 1); R(x, gold, 90, 75 + j * 7, 9, 1); }
    for (const a of [44, 112]) { R(x, '#5b3d27', a, 74, 20, 27); R(x, '#8a5a3a', a + 2, 76, 16, 25); R(x, gold, a + 2, 82, 16, 1); R(x, gold, a + 2, 92, 16, 1); }
    R(x, '#2a2136', 63, 61, 50, 9); R(x, pil, 64, 62, 48, 7); R(x, gold, 64, 62, 48, 1); R(x, gold, 64, 68, 48, 1);
    for (const a of [26, 150]) { R(x, '#2a2136', a - 1, 60, 1, 3); ell(x, '#e2574c', a - 1, 66, 3.4, 4); R(x, gold, a - 3, 61, 5, 1); R(x, gold, a - 2, 70, 3, 2); }
    R(x, '#c9c2b3', 4, 100, 168, 6); R(x, '#e2ddd2', 4, 100, 168, 1);
    for (let j = 0; j < 3; j++) { R(x, ['#b9b2a6', '#cfc8bb', '#e2ddd2'][j], 64 - j * 3, 106 + j * 2, 48 + j * 6, 2); }
  });
  for (let f = 0; f < 2; f++) def('luhuong' + f, 24, 30, x => {
    R(x, '#5b3d27', 4, 26, 3, 4); R(x, '#5b3d27', 17, 26, 3, 4);
    ell(x, '#b8862b', 12, 21, 11, 6); ell(x, '#d9a53a', 12, 19, 10, 4); R(x, '#7a5a1c', 2, 17, 20, 2); ell(x, '#3a2a22', 12, 17, 9, 2);
    R(x, '#b8862b', 1, 15, 22, 2); R(x, '#e8c25a', 1, 15, 22, 1);
    for (const [a, h] of [[8, 9], [11, 11], [14, 10], [17, 8]]) { R(x, '#c8583f', a, 16 - h, 1, h); R(x, (a + f) % 2 ? '#ffd23a' : '#ff7a3a', a, 16 - h, 1, 1); }
  });
  def('stonelamp', 12, 24, x => { R(x, '#a8a39a', 3, 18, 6, 6); R(x, '#cfcac0', 1, 16, 10, 2); R(x, '#bfbab0', 2, 8, 8, 8); R(x, '#ffe9a0', 4, 10, 4, 4); R(x, '#a8a39a', 0, 5, 12, 3); R(x, '#cfcac0', 2, 2, 8, 3); R(x, '#a8a39a', 5, 0, 2, 2); });
  def('chaumai', 16, 26, x => { R(x, '#c8583f', 3, 19, 10, 7); R(x, '#e07a5f', 2, 18, 12, 2); R(x, '#6f472c', 7, 9, 2, 10); line(x, '#6f472c', 8, 12, 3, 6); line(x, '#6f472c', 8, 11, 13, 5); for (const [a, b] of [[3, 5], [5, 3], [8, 4], [11, 3], [13, 5], [2, 8], [14, 8], [6, 7], [10, 7], [8, 1]]) { R(x, '#ffd23a', a, b, 2, 2); R(x, '#f2a93b', a, b + 1, 1, 1); } });
  // Tết miền Bắc: chậu đào hồng và chậu quất trĩu quả (treo bao lì xì)
  def('chaudao', 16, 28, x => { R(x, '#c8583f', 3, 21, 10, 7); R(x, '#e07a5f', 2, 20, 12, 2); R(x, '#ffd23a', 6, 23, 4, 2); R(x, '#5b3d27', 7, 9, 2, 12); line(x, '#5b3d27', 8, 13, 2, 5); line(x, '#5b3d27', 8, 11, 14, 4); line(x, '#5b3d27', 8, 9, 6, 1); for (const [a, b] of [[1, 4], [3, 6], [2, 2], [6, 1], [9, 2], [13, 3], [14, 6], [11, 5], [5, 8], [12, 9], [7, 4], [4, 10]]) { R(x, '#f3a6c0', a, b, 2, 2); R(x, '#ffe3ec', a, b, 1, 1); } R(x, '#d9534f', 12, 11, 2, 3); });
  def('chauquat', 18, 26, x => { R(x, '#c8583f', 4, 19, 10, 7); R(x, '#e07a5f', 3, 18, 12, 2); R(x, '#ffd23a', 7, 21, 4, 2); R(x, '#5b3d27', 8, 13, 2, 6); ell(x, '#3f8f3a', 9, 8, 8.5, 7.5); ell(x, '#57a548', 7, 6, 4, 3); for (const [a, b] of [[3, 6], [6, 3], [10, 4], [14, 6], [5, 10], [9, 9], [13, 11], [11, 13], [7, 13], [2, 9], [15, 9]]) { R(x, '#f2a93b', a, b, 2, 2); R(x, '#ffd23a', a, b, 1, 1); } R(x, '#d9534f', 12, 5, 2, 3); R(x, '#d9534f', 4, 12, 2, 3); });
  def('lanterns', 80, 24, x => {
    R(x, '#6f472c', 0, 0, 2, 24); R(x, '#6f472c', 78, 0, 2, 24);
    for (let i = 0; i <= 76; i++) R(x, '#3a2a22', 2 + i, 2 + Math.round(Math.sin(i / 76 * Math.PI) * 6), 1, 1);
    for (let k = 0; k < 5; k++) { const a = 10 + k * 15, b = 4 + Math.round(Math.sin((a - 2) / 76 * Math.PI) * 6); R(x, '#3a2a22', a + 2, b, 1, 2); ell(x, '#e2574c', a + 2, b + 7, 4, 5); R(x, '#ffd23a', a, b + 2, 5, 1); R(x, '#ffd23a', a, b + 11, 5, 1); R(x, '#ff8f7a', a + 1, b + 5, 1, 4); R(x, '#ffd23a', a + 2, b + 13, 1, 2); }
  });
  def('bunting', 96, 14, x => {
    for (let i = 0; i <= 94; i++) R(x, '#5f656f', 1 + i, 1 + Math.round(Math.sin(i / 94 * Math.PI) * 4), 1, 1);
    for (let k = 0; k < 8; k++) { const a = 4 + k * 11, b = 2 + Math.round(Math.sin((a + 3) / 94 * Math.PI) * 4); if (k % 2) { R(x, '#da251d', a, b, 8, 6); R(x, '#ffde59', a + 3, b + 2, 2, 2); R(x, '#ffde59', a + 4, b + 1, 1, 1); } else { tri(x, '#ffde59', a + 4, b, 7, 4); } }
  });
  /* ---------- sạp hội chợ đêm giao thừa (2 lớp: sạp + quầy) ---------- */
  const boothBack = (name, col, fn) => def(name + '_b', 54, 44, x => {
    for (let i = 0; i < 7; i++) { R(x, i % 2 ? '#fbf7ee' : col, i * 8 - 1, 0, 8, 9); R(x, i % 2 ? '#e3ddd0' : shade(col, -25), i * 8 - 1, 9, 8, 1); ell(x, i % 2 ? '#fbf7ee' : col, i * 8 + 3, 10, 4, 2); }
    R(x, '#8b5e3c', 1, 12, 3, 32); R(x, '#8b5e3c', 50, 12, 3, 32); R(x, '#3a2f4a', 4, 12, 46, 32);
    fn(x);
  });
  boothBack('fb_nemvong', '#d9534f', x => {
    for (let r = 0; r < 2; r++) { R(x, '#a9703f', 5, 24 + r * 10, 44, 2); for (let i = 0; i < 6; i++) { R(x, ['#5fae4a', '#3b82c4', '#f2a93b'][(i + r) % 3], 7 + i * 7, 17 + r * 10, 4, 7); R(x, '#fffaf0', 8 + i * 7, 15 + r * 10, 2, 2); } }
    ic(x, 'gaubong', 4, 0 + 12); ic(x, 'longden', 33, 12);
  });
  shopFront('fb_nemvong', '#d9534f', x => { for (let i = 0; i < 4; i++) { ell(x, '#ffd23a', 8 + i * 4, 5, 3.5, 1.6); ell(x, '#3a2f4a', 8 + i * 4, 5, 1.6, 0.6); } R(x, '#ffd23a', 0, 13, 54, 1); });
  boothBack('fb_banna', '#3b82c4', x => {
    ell(x, '#fffaf0', 27, 22, 10, 9); ell(x, '#d9534f', 27, 22, 7, 6); ell(x, '#fffaf0', 27, 22, 4, 3.4); ell(x, '#d9534f', 27, 22, 1.5, 1.5);
    R(x, '#a9703f', 5, 38, 44, 2); for (let i = 0; i < 6; i++) { R(x, '#c9ccd4', 6 + i * 7, 32, 5, 6); R(x, ['#e2574c', '#5fae4a', '#f2a93b'][i % 3], 6 + i * 7, 34, 5, 2); }
  });
  shopFront('fb_banna', '#3b82c4', x => { R(x, '#8a5a3a', 8, 1, 2, 7); R(x, '#8a5a3a', 6, 0, 2, 3); R(x, '#8a5a3a', 10, 0, 2, 3); R(x, '#d9534f', 7, 1, 4, 1); for (let i = 0; i < 4; i++) R(x, '#8b8f9c', 38 + i * 3, 5, 2, 2); R(x, '#fffaf0', 0, 13, 54, 1); });
  boothBack('fb_doan', '#f2a93b', x => {
    R(x, '#2a2136', 6, 13, 42, 22); ic(x, 'banhchung', 6, 14); ic(x, 'xoi', 18, 14); ic(x, 'keobong', 30, 14);
    for (let i = 0; i < 3; i++) R(x, '#ffe066', 10 + i * 12, 33, 8, 1);
  });
  shopFront('fb_doan', '#f2a93b', x => { ell(x, '#5f656f', 12, 5, 8, 4); R(x, '#5f656f', 4, 5, 17, 4); ell(x, '#8b8f9c', 12, 4, 7, 2); R(x, 'rgba(240,240,240,.7)', 9, 0, 1, 2); R(x, 'rgba(240,240,240,.7)', 14, 0, 1, 2); for (let i = 0; i < 3; i++) { R(x, '#3f8f3a', 36 + i * 5, 3 - (i % 2), 5, 5); R(x, '#d9c690', 38 + i * 5, 3 - (i % 2), 1, 5); } R(x, '#d9534f', 0, 13, 54, 1); });


  /* ---------- nơi làm việc của bố mẹ, phố Bờ Đông: công ty, nhà máy, nhà hàng, karaoke ---------- */
  def('congty', 152, 82, x => {
    R(x, '#3a4a6b', 0, 0, 152, 82); R(x, '#4f6390', 2, 2, 148, 78);
    R(x, '#24406b', 2, 8, 148, 12); R(x, '#3b6fb6', 3, 9, 146, 10);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) { const a = 6 + c * 16, b = 24 + r * 14; R(x, '#8fc1e3', a, b, 12, 10); R(x, '#cfe8f7', a, b, 12, 2); R(x, '#6f9fc9', a + 9, b + 2, 2, 8); }
    R(x, '#c9c2b3', 52, 62, 48, 20); R(x, '#2a2136', 60, 64, 32, 18); R(x, '#8fc1e3', 62, 66, 13, 16); R(x, '#8fc1e3', 77, 66, 13, 16); R(x, '#cfe8f7', 62, 66, 13, 2); R(x, '#cfe8f7', 77, 66, 13, 2);
    R(x, '#ffd23a', 60, 58, 32, 3); for (const a of [40, 108]) { R(x, '#3f8f3a', a, 70, 8, 12); ell(x, '#57a548', a + 4, 68, 6, 5); }
  });
  def('nhamayB', 200, 92, x => {
    R(x, '#8b8f9c', 150, 0, 14, 40); R(x, '#a8acb6', 151, 0, 4, 40); R(x, '#d9534f', 150, 6, 14, 3); R(x, '#d9534f', 150, 18, 14, 3);
    R(x, '#c9c2b3', 0, 24, 200, 68); R(x, '#b9b2a6', 0, 24, 200, 4);
    for (let i = 0; i < 5; i++) { const a = i * 40; R(x, '#7a8796', a, 14, 40, 12); for (let k = 0; k < 40; k++) R(x, '#5f6b7a', a + k, 14 + Math.round(k * 0.3), 1, 1); }
    R(x, '#e8833a', 10, 32, 180, 12); R(x, '#f2a93b', 11, 33, 178, 10);
    for (let i = 0; i < 6; i++) { R(x, '#8fc1e3', 12 + i * 30, 50, 18, 12); R(x, '#cfe8f7', 12 + i * 30, 50, 18, 2); }
    R(x, '#5f656f', 78, 64, 44, 28); for (let k = 0; k < 7; k++) R(x, '#8b8f9c', 80, 66 + k * 4, 40, 2);
    R(x, '#3f8f3a', 4, 80, 20, 12); R(x, '#3f8f3a', 176, 80, 20, 12);
  });
  def('nhahangB', 110, 82, x => {
    R(x, '#7a2f2a', 0, 0, 110, 18); R(x, '#a8413a', 2, 2, 106, 14); for (let i = 0; i < 110; i += 10) R(x, '#7a2f2a', i, 2, 1, 14);
    R(x, '#f6e6c8', 4, 18, 102, 64); R(x, '#e3cfa6', 4, 18, 102, 3);
    R(x, '#3a2a22', 14, 22, 82, 12); R(x, '#ffd23a', 15, 23, 80, 1); R(x, '#ffd23a', 15, 32, 80, 1);
    for (let i = 0; i < 6; i++) { R(x, i % 2 ? '#fffaf0' : '#d9534f', 8 + i * 16, 36, 16, 6); }
    drawWin(x, 12, 46, 22, 18); drawWin(x, 76, 46, 22, 18);
    R(x, '#5b3d27', 42, 48, 26, 34); drawDoor(x, 44, 50, 11, 32, '#8a5a3a'); drawDoor(x, 55, 50, 11, 32, '#8a5a3a');
    for (const a of [6, 98]) { R(x, '#3a2a22', a, 18, 1, 6); ell(x, '#e2574c', a, 28, 3, 4); R(x, '#ffd23a', a - 2, 24, 5, 1); }
  });
  def('karaokeB', 100, 82, x => {
    R(x, '#2a2136', 0, 0, 100, 82); R(x, '#3a2f4a', 2, 2, 96, 78);
    R(x, '#ff5fa8', 8, 8, 84, 16); R(x, '#2a2136', 10, 10, 80, 12); for (let i = 0; i < 9; i++) R(x, ['#ff5fa8', '#5fe0f0', '#ffe066'][i % 3], 14 + i * 8, 14, 5, 4);
    for (let i = 0; i < 3; i++) { R(x, '#7a5fc9', 10 + i * 28, 30, 22, 18); R(x, '#c9b8f2', 11 + i * 28, 31, 20, 3); }
    R(x, '#5fe0f0', 0, 52, 100, 2); R(x, '#ff5fa8', 0, 56, 100, 2);
    R(x, '#14111c', 36, 58, 28, 24); R(x, '#5f4a8a', 38, 60, 24, 22); R(x, '#ffe066', 48, 70, 2, 2);
    for (let i = 0; i < 6; i++) R(x, '#ffe066', 6 + i * 16, 4, 3, 2);
  });
  def('bed2', 48, 44, x => {
    R(x, '#6f472c', 0, 0, 48, 8); R(x, '#8a5a3a', 1, 1, 46, 6);
    R(x, '#8a5a3a', 0, 6, 48, 38); R(x, '#fffaf0', 3, 8, 42, 34);
    ell(x, '#fffaf0', 13, 13, 8, 4); ell(x, '#fffaf0', 35, 13, 8, 4); ell(x, '#e3ddd0', 13, 14, 8, 3); ell(x, '#e3ddd0', 35, 14, 8, 3);
    R(x, '#e98fa5', 3, 20, 42, 22); R(x, '#f3b8c8', 3, 20, 42, 3); for (let i = 0; i < 4; i++) R(x, '#d97a92', 6 + i * 11, 26, 6, 1);
  });
  def('dresser', 30, 34, x => { R(x, '#8a5a3a', 0, 14, 30, 20); R(x, '#a9703f', 1, 15, 28, 3); R(x, '#6f472c', 14, 18, 2, 14); R(x, '#ffd23a', 8, 24, 3, 1); R(x, '#ffd23a', 19, 24, 3, 1); ell(x, '#c9ccd4', 15, 7, 9, 7); ell(x, '#dff1fa', 15, 7, 7.5, 5.5); R(x, '#eef8fd', 11, 4, 4, 2); R(x, '#e2574c', 4, 11, 2, 3); R(x, '#f3a6c0', 24, 11, 3, 3); });
  def('nightstand', 14, 16, x => { R(x, '#8a5a3a', 0, 4, 14, 12); R(x, '#a9703f', 1, 5, 12, 2); R(x, '#ffd23a', 6, 10, 2, 1); R(x, '#fff6c8', 4, 0, 6, 4); R(x, '#c9962a', 6, 3, 2, 2); });
  def('famphoto', 20, 14, x => { R(x, '#8a5a3a', 0, 0, 20, 14); R(x, '#cfe8f7', 2, 2, 16, 10); for (const [a, c2] of [[4, '#2c2733'], [9, '#6b4429'], [14, '#2c2733']]) { R(x, '#f8d0a8', a, 5, 3, 3); R(x, c2, a, 4, 3, 1); R(x, '#3b6fb6', a - 1, 8, 5, 4); } });
  for (let f = 0; f < 2; f++) def('conveyor' + f, 120, 16, x => { R(x, '#5f656f', 0, 4, 120, 10); R(x, '#3a3f55', 0, 6, 120, 6); for (let i = 0; i < 120; i += 8) R(x, '#8b8f9c', i + (f ? 4 : 0), 7, 2, 4); for (let i = 0; i < 6; i++) { const a = 6 + i * 20 + (f ? 4 : 0); R(x, ['#e2574c', '#ffd23a', '#5fe0f0'][i % 3], a, 2, 8, 5); R(x, '#fffaf0', a + 1, 3, 2, 1); } R(x, '#8b8f9c', 0, 13, 4, 3); R(x, '#8b8f9c', 116, 13, 4, 3); });
  def('machine', 30, 34, x => { R(x, '#8b8f9c', 0, 6, 30, 28); R(x, '#a8acb6', 1, 7, 28, 3); R(x, '#2a2136', 4, 12, 14, 9); R(x, '#5fe0f0', 5, 13, 12, 7); R(x, '#8fd067', 21, 13, 4, 3); R(x, '#e2574c', 21, 18, 4, 3); R(x, '#5f656f', 10, 0, 10, 6); R(x, '#ffd23a', 2, 26, 26, 2); });
  def('officedesk', 34, 26, x => { R(x, '#c9c2b3', 0, 10, 34, 16); R(x, '#e2ddd2', 0, 10, 34, 3); R(x, '#8b8f9c', 2, 24, 3, 2); R(x, '#8b8f9c', 29, 24, 3, 2); R(x, '#2a2136', 9, 0, 16, 11); R(x, '#5fa8e0', 10, 1, 14, 8); R(x, '#cfe8f7', 10, 1, 14, 2); R(x, '#5f656f', 16, 9, 2, 2); R(x, '#fffaf0', 26, 12, 6, 4); R(x, '#3b3f55', 11, 14, 12, 3); });
  def('ktv', 60, 34, x => { R(x, '#2a2136', 0, 0, 60, 34); R(x, '#3b6fb6', 3, 3, 54, 26); R(x, '#ff5fa8', 6, 20, 30, 3); R(x, '#fffaf0', 6, 25, 40, 2); ell(x, '#ffe066', 46, 10, 5, 5); R(x, '#5f656f', 26, 29, 8, 5); });
  def('rtable', 36, 24, x => { R(x, '#8a5a3a', 6, 4, 24, 14); R(x, '#a9703f', 7, 5, 22, 3); R(x, '#fffaf0', 10, 8, 6, 4); R(x, '#fffaf0', 20, 8, 6, 4); R(x, '#d9534f', 12, 9, 2, 2); R(x, '#57a548', 22, 9, 2, 2); R(x, '#6f472c', 0, 8, 5, 9); R(x, '#6f472c', 31, 8, 5, 9); R(x, '#6f472c', 8, 18, 3, 6); R(x, '#6f472c', 25, 18, 3, 6); });
  // khu nhà thư viện riêng trong sân trường
  def('libhouse', 120, 84, x => {
    const wall = '#f6efd8', wallS = '#e3d6b4', roof = '#3f7d5c', roofS = '#2f5f45';
    R(x, roofS, 2, 2, 116, 22); R(x, roof, 4, 0, 112, 20); for (let i = 4; i < 116; i += 8) { R(x, roofS, i, 4, 1, 14); } R(x, shade(roof, 25), 4, 0, 112, 2); R(x, roofS, 0, 20, 120, 4);
    R(x, wall, 6, 24, 108, 56); R(x, wallS, 6, 24, 108, 3); R(x, wallS, 6, 76, 108, 4);
    for (const a of [6, 38, 78, 110]) R(x, '#d8bd80', a, 27, 4, 49);
    for (const a of [14, 90]) drawWin(x, a, 34, 18, 20, '#3f7d5c');
    R(x, '#24406b', 36, 30, 48, 10); R(x, '#3b6fb6', 37, 31, 46, 8); R(x, '#ffd23a', 37, 39, 46, 1);
    R(x, '#5b3d27', 48, 46, 24, 34); drawDoor(x, 50, 48, 10, 32, '#8a5a3a'); drawDoor(x, 60, 48, 10, 32, '#8a5a3a');
    R(x, '#c9c2b3', 42, 80, 36, 4); R(x, '#e2ddd2', 42, 80, 36, 1);
    for (const a of [26, 94]) { R(x, '#3a2a22', a, 24, 1, 3); ell(x, '#e2574c', a, 30, 2.5, 3); }
  });
  // cầu thang lên tầng 2 ở cửa giữa dãy nhà chính
  def('stairs', 36, 34, x => {
    R(x, '#3a2f4a', 0, 0, 36, 34); R(x, '#2a2136', 0, 0, 36, 3);
    for (let i = 0; i < 7; i++) { const y = 30 - i * 4, l = 2 + i * 3; R(x, '#c9c2b3', l, y, 34 - l, 3); R(x, '#e2ddd2', l, y, 34 - l, 1); R(x, '#8b8f9c', l, y + 3, 34 - l, 1); }
    for (let i = 0; i <= 26; i++) R(x, '#8a5a3a', 2 + i, 22 - Math.round(i * 0.75), 1, 1);
    R(x, '#8a5a3a', 2, 22, 1, 10); R(x, '#8a5a3a', 28, 2, 1, 10);
  }, true);
  // lỗ cầu thang đi xuống ở hành lang tầng 2
  def('stairdown', 34, 18, x => { R(x, '#5f565f', 0, 0, 34, 18); for (let i = 0; i < 5; i++) { R(x, '#c9c2b3', 1, 1 + i * 3.4, 32, 2); R(x, '#8b8f9c', 1, 3 + i * 3.4, 32, 1); } R(x, '#8a5a3a', 0, 0, 2, 18); R(x, '#8a5a3a', 32, 0, 2, 18); }, true);
  // ảnh Bác Hồ treo trên tường lớp học
  def('hoportrait', 14, 18, x => {
    R(x, '#c9962a', 0, 0, 14, 18); R(x, '#ffd23a', 1, 1, 12, 1); R(x, '#efe6d2', 2, 2, 10, 14);
    R(x, '#e8e4dc', 4, 3, 6, 2); R(x, '#e8b48a', 4, 5, 6, 4); R(x, '#2a2136', 5, 6, 1, 1); R(x, '#2a2136', 8, 6, 1, 1);
    R(x, '#f4f2ea', 5, 9, 4, 3); R(x, '#f4f2ea', 6, 12, 2, 1); R(x, '#c9b58a', 3, 12, 8, 4); R(x, '#a89060', 6, 12, 2, 4);
    R(x, '#da251d', 0, 17, 14, 1);
  });
  // bảng thông báo ở sân trường: khung gỗ, tấm bần, giấy ghim
  def('bangtin', 36, 30, x => {
    R(x, '#6f472c', 3, 18, 3, 12); R(x, '#6f472c', 30, 18, 3, 12);
    R(x, '#6f472c', 0, 0, 36, 22); R(x, '#c9935a', 2, 6, 32, 14); R(x, '#3b6fb6', 2, 1, 32, 5);
    for (const [a, b, c2] of [[4, 8, '#fffaf0'], [13, 7, '#fff6a8'], [23, 8, '#fffaf0'], [8, 13, '#ffd2e0'], [19, 13, '#fffaf0']]) { R(x, c2, a, b, 8, 6); R(x, '#8b8f9c', a + 1, b + 2, 6, 1); R(x, '#8b8f9c', a + 1, b + 4, 4, 1); R(x, '#e2574c', a + 3, b, 2, 1); }
  });
  /* ---------- Tết Trung thu: sân khấu, lân, ông Địa, trống, niêu, đèn ông sao, sạp hàng ---------- */
  def('ttstage', 100, 46, x => {
    R(x, '#8a5a3a', 4, 0, 3, 31); R(x, '#8a5a3a', 93, 0, 3, 31);
    R(x, '#b23b3b', 7, 2, 86, 28); R(x, '#d9534f', 7, 2, 86, 3); R(x, '#ffd23a', 9, 6, 82, 1); R(x, '#ffd23a', 9, 27, 82, 1);
    ell(x, '#ffe9a0', 82, 16, 7, 7); ell(x, '#fff6c8', 80, 14, 3, 3); ell(x, '#f2d98a', 85, 18, 1.5, 1.5);
    for (const a of [12, 20]) { R(x, '#3a2a22', a, 0, 1, 3); ell(x, a === 12 ? '#ffd23a' : '#e2574c', a, 6, 2.5, 3); }
    R(x, '#6f472c', 0, 30, 100, 16); R(x, '#a9703f', 0, 30, 100, 3); for (let i = 6; i < 100; i += 12) R(x, '#5b3d27', i, 33, 1, 13);
    R(x, '#5b3d27', 40, 42, 20, 4); R(x, '#8a5a3a', 42, 40, 16, 2);
  });
  for (let f = 0; f < 2; f++) def('lion' + f, 34, 26, x => {
    const hy = f ? 0 : 2;
    R(x, '#e2574c', 2, 8, 20, 10); R(x, '#ffd23a', 2, 8, 20, 2); for (let i = 0; i < 20; i += 3) R(x, i % 6 ? '#ffd23a' : '#fffaf0', 2 + i, 16, 2, 3);
    R(x, '#3f8f3a', 6, 11, 3, 3); R(x, '#3b82c4', 13, 11, 3, 3); R(x, '#ffd23a', 0, 6, 3, 5); R(x, '#fffaf0', 0, 10, 2, 2);
    for (const [a, d] of [[4, f], [10, -f], [17, -f], [23, f]]) { R(x, '#ffd23a', a + d, 18, 3, 6); R(x, '#2a2136', a + d, 24, 4, 2); }
    R(x, '#d9534f', 18, hy + 2, 15, 12); R(x, '#ffd23a', 18, hy + 2, 15, 3); R(x, '#3f8f3a', 25, hy, 2, 3); R(x, '#ffd23a', 17, hy + 4, 2, 5);
    R(x, '#fffaf0', 21, hy + 6, 4, 3); R(x, '#2a2136', 23, hy + 7, 1, 1); R(x, '#fffaf0', 27, hy + 6, 4, 3); R(x, '#2a2136', 29, hy + 7, 1, 1);
    R(x, '#2a2136', 21, hy + 11, 12, 2); R(x, '#fffaf0', 22, hy + 11, 10, 1); R(x, '#fffaf0', 21, hy + 13, 12, 2); R(x, '#3b82c4', 31, hy + 4, 2, 2);
  });
  for (let f = 0; f < 2; f++) def('ongdia' + f, 20, 26, x => {
    ell(x, '#f6b3a0', 10, 8, 8, 7.5); ell(x, '#ffd2c4', 8, 5, 3, 2); R(x, '#2a2136', 5, 6, 3, 1); R(x, '#2a2136', 12, 6, 3, 1);
    R(x, '#b23b3b', 6, 10, 8, 3); R(x, '#fffaf0', 7, 10, 6, 1); ell(x, '#ff8f9a', 4, 9, 1.5, 1); ell(x, '#ff8f9a', 16, 9, 1.5, 1);
    R(x, '#e8b83a', 4, 15, 12, 9); R(x, '#c9962a', 4, 15, 12, 1); ell(x, '#f6b3a0', 10, 19, 3, 3); R(x, '#8a5a3a', 5, 24, 3, 2); R(x, '#8a5a3a', 12, 24, 3, 2);
    const fy = f ? 10 : 14; R(x, '#fffaf0', 15, fy, 5, 5); R(x, '#d9c690', 16, fy + 1, 1, 4); R(x, '#d9c690', 18, fy + 1, 1, 4); R(x, '#f6b3a0', 15, fy + 4, 2, 2);
  });
  def('trong', 20, 20, x => { R(x, '#6f472c', 3, 12, 2, 8); R(x, '#6f472c', 15, 12, 2, 8); ell(x, '#b23b3b', 10, 8, 9, 6); ell(x, '#d9534f', 10, 7, 8, 5); ell(x, '#f3e2c0', 10, 5, 7, 3); for (const a of [3, 7, 13, 17]) R(x, '#ffd23a', a, 9, 1, 1); R(x, '#8a5a3a', 15, 0, 1, 5); });
  def('nieupole', 44, 46, x => {
    R(x, '#a9703f', 1, 2, 3, 44); R(x, '#a9703f', 40, 2, 3, 44); R(x, '#d9c690', 1, 2, 1, 44); R(x, '#d9c690', 40, 2, 1, 44);
    for (let i = 0; i <= 36; i++) R(x, '#3a2a22', 4 + i, 4 + Math.round(Math.sin(i / 36 * Math.PI) * 4), 1, 1);
    R(x, '#3a2a22', 22, 8, 1, 6); ell(x, '#8a5a3a', 22, 19, 6, 5); ell(x, '#a9703f', 21, 18, 3, 2); R(x, '#d9534f', 17, 13, 11, 2); R(x, '#ffd23a', 18, 13, 2, 1); R(x, '#5b3d27', 18, 22, 9, 1);
  });
  for (let f = 0; f < 2; f++) def('sao' + f, 9, 12, x => { R(x, '#8a5a3a', 4, 7, 1, 5); pat(x, STAR7, 1, 0, '#e2574c', '#e2574c'); R(x, f ? '#fff6a8' : '#ffd23a', 4, 2, 1, 2); R(x, f ? '#ffd23a' : '#fff6a8', 3, 3, 3, 1); });
  def('sanh', 8, 16, x => { R(x, '#8a5a3a', 3, 0, 2, 16); R(x, '#5fae4a', 0, 2, 8, 5); R(x, '#3f8f3a', 1, 3, 6, 3); R(x, '#d9534f', 2, 8, 4, 4); R(x, '#ffd23a', 3, 9, 2, 2); });
  boothBack('fb_nguyenlieu', '#3f8f3a', x => { R(x, '#a9703f', 5, 30, 44, 2); ic(x, 'nl_tre', 4, 13); ic(x, 'nl_giay', 18, 13); ic(x, 'nl_nen', 32, 13); for (let i = 0; i < 5; i++) R(x, '#d9c690', 8 + i * 8, 33, 1, 9); });
  shopFront('fb_nguyenlieu', '#3f8f3a', x => { for (let i = 0; i < 6; i++) R(x, '#d9c690', 4 + i * 2, 1, 1, 8); R(x, '#e2574c', 20, 2, 9, 6); R(x, '#ffd23a', 24, 1, 9, 6); R(x, '#fffaf0', 40, 2, 3, 7); R(x, '#ffd23a', 41, 0, 1, 2); R(x, '#fffaf0', 0, 13, 54, 1); });
  boothBack('fb_denlong', '#e2574c', x => { for (const [a, b] of [[6, 13], [22, 15], [38, 13], [14, 28], [30, 28]]) { R(x, '#3a2a22', a + 3, b - 2, 1, 2); pat(x, STAR7, a, b, (a + b) % 3 ? '#e2574c' : '#ffd23a', '#ffd23a'); } });
  shopFront('fb_denlong', '#e2574c', x => { pat(x, STAR7, 4, 1, '#ffd23a', '#ffd23a'); for (let i = 0; i < 5; i++) R(x, '#d9c690', 16 + i * 3, 2, 1, 6); R(x, '#3b82c4', 34, 2, 7, 5); R(x, '#e2574c', 43, 2, 7, 5); R(x, '#ffd23a', 0, 13, 54, 1); });
  boothBack('fb_banhtt', '#c9862f', x => { R(x, '#2a2136', 6, 13, 42, 22); ic(x, 'banhnuong', 5, 14); ic(x, 'banhdeo', 18, 14); ic(x, 'buoi', 31, 14); for (let i = 0; i < 3; i++) R(x, '#ffe066', 10 + i * 13, 33, 8, 1); });
  shopFront('fb_banhtt', '#c9862f', x => { for (let i = 0; i < 4; i++) { ell(x, i % 2 ? '#fbf8ef' : '#e0a54a', 7 + i * 7, 5, 3, 2.5); } ell(x, '#7fbf5a', 42, 5, 4, 3.5); R(x, '#d9534f', 0, 13, 54, 1); });

  /* ---------- dụng cụ tập thể dục ở nhà (mua ở gian Thể thao, TTTM) ---------- */
  def('eq_daynhay', 16, 10, x => { ell(x, '#e2574c', 8, 5, 6, 3.5); ell(x, '#3a2a22', 8, 5, 4, 2); ell(x, '#e2574c', 8, 5, 3, 1.5); R(x, '#3b82c4', 0, 2, 3, 6); R(x, '#3b82c4', 13, 2, 3, 6); R(x, '#6fa0e0', 0, 2, 1, 6); R(x, '#6fa0e0', 13, 2, 1, 6); });
  def('eq_tatay', 18, 9, x => { for (const b of [0, 5]) { R(x, '#3a3f55', 0, b, 4, 4); R(x, '#3a3f55', 12, b, 4, 4); R(x, '#8b8f9c', 4, b + 1, 8, 2); R(x, '#5f656f', 0, b, 4, 1); R(x, '#5f656f', 12, b, 4, 1); } });
  def('eq_xadon', 28, 42, x => { R(x, '#5f656f', 2, 4, 3, 38); R(x, '#5f656f', 23, 4, 3, 38); R(x, '#8b8f9c', 2, 4, 1, 38); R(x, '#8b8f9c', 23, 4, 1, 38); R(x, '#c9ccd4', 0, 4, 28, 3); R(x, '#eceef2', 0, 4, 28, 1); R(x, '#3a3f55', 0, 39, 8, 3); R(x, '#3a3f55', 20, 39, 8, 3); R(x, '#e2574c', 6, 3, 3, 5); R(x, '#e2574c', 19, 3, 3, 5); });


  /* ---------- hội gói bánh chưng ở sân trường ---------- */
  def('bctable', 36, 18, x => {
    R(x, '#c9a467', 0, 4, 36, 12); R(x, '#dcb878', 0, 4, 36, 2); R(x, '#a9853f', 0, 14, 36, 2); for (let i = 3; i < 36; i += 5) R(x, '#b8944f', i, 5, 1, 9);
    for (let i = 0; i < 3; i++) R(x, ['#3f8f3a', '#4ea248', '#5fae4a'][i], 2 + i, 1 + i, 9, 5);
    ell(x, '#fbfdff', 16, 7, 4, 2.5); ell(x, '#efe6d2', 16, 6, 3, 1.5); ell(x, '#f2c94c', 25, 7, 3.5, 2.2); R(x, '#e98fa5', 28, 10, 5, 3); R(x, '#d9c690', 12, 11, 8, 1); R(x, '#d9c690', 12, 13, 8, 1);
    R(x, '#3f8f3a', 2, 9, 7, 6); R(x, '#d9c690', 5, 9, 1, 6); R(x, '#d9c690', 2, 11, 7, 1);
  });
  for (let f = 0; f < 2; f++) def('noibanh' + f, 34, 30, x => {
    for (let i = 0; i < 3; i++) R(x, '#a8513a', 2 + i * 11, 22, 9, 8);
    for (let i = 0; i < 4; i++) { const h = 4 + ((i + f) % 2) * 3; R(x, '#ff7a3a', 6 + i * 6, 24 - h, 3, h); R(x, '#ffd23a', 7 + i * 6, 25 - h + 2, 1, h - 2); }
    R(x, '#8b8f9c', 3, 6, 28, 16); R(x, '#c9ccd4', 3, 6, 28, 3); R(x, '#5f656f', 3, 20, 28, 2); R(x, '#5f656f', 0, 8, 3, 3); R(x, '#5f656f', 31, 8, 3, 3);
    R(x, '#3f8f3a', 6, 4, 22, 3); R(x, '#d9c690', 12, 4, 1, 3); R(x, '#d9c690', 21, 4, 1, 3);
  });
  def('bcbanner', 100, 34, x => {
    R(x, '#8a5a3a', 0, 0, 4, 34); R(x, '#8a5a3a', 96, 0, 4, 34); R(x, '#a9703f', 1, 0, 1, 34); R(x, '#a9703f', 97, 0, 1, 34);
    R(x, '#d9534f', 4, 2, 92, 14); R(x, '#ffd23a', 4, 2, 92, 1); R(x, '#ffd23a', 4, 15, 92, 1); R(x, '#b23b3b', 4, 16, 92, 1);
    for (const a of [10, 86]) { R(x, '#ffd23a', a, 6, 4, 4); R(x, '#d9534f', a + 1, 7, 2, 2); }
  });

}

/* ---------- biểu tượng vật phẩm cho thanh đồ (16×16 → dataURL) ---------- */
const _icons = {}, _iconCv = {};
const iconCv = id => { itemIcon(id); return _iconCv[id]; };     // canvas của icon (để vẽ hàng hoá lên quầy, kệ)
// mẫu điểm ảnh: '#' = màu chính, 'o' = màu viền sáng
const STAR11 = ['.....#.....', '....###....', '....#o#....', '###########', '.##ooooo##.', '..#ooooo#..', '..#######..', '.####.####.', '.###...###.', '##.......##'];
const STAR7 = ['...#...', '..###..', '#######', '.#####.', '..###..', '.##.##.', '#.....#'];
function pat(x, rows, ox, oy, col, col2) { rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] !== '.') R(x, r[i] === 'o' ? col2 : col, ox + i, oy + j, 1, 1); }); }
function itemIcon(id) {
  if (_icons[id]) return _icons[id];
  const c = mk(16, 16), x = cx(c);
  const shirt = (col, st) => { R(x, col, 4, 3, 8, 11); R(x, col, 1, 3, 3, 5); R(x, col, 12, 3, 3, 5); R(x, shade(col, -20), 4, 12, 8, 2); R(x, '#fffaf0', 7, 3, 2, 2); if (st) { R(x, st, 4, 3, 1, 9); R(x, st, 11, 3, 1, 9); } };
  if (id.startsWith('sach_')) { const col = SUBJ[id.slice(5)].color; R(x, shade(col, -28), 2, 2, 12, 13); R(x, col, 4, 2, 10, 12); R(x, '#fffaf0', 4, 13, 10, 1); R(x, shade(col, 35), 6, 4, 6, 2); R(x, shade(col, 35), 6, 8, 4, 1); }
  else if (id === 'hopbut') { R(x, '#3b82c4', 1, 5, 14, 7); R(x, '#5a8fd6', 1, 5, 14, 2); R(x, '#2f5a94', 1, 11, 14, 1); R(x, '#f4d35e', 3, 8, 7, 1); R(x, '#e2574c', 10, 8, 2, 1); R(x, '#fffaf0', 12, 8, 1, 1); }
  else if (id === 'thehs') { R(x, '#fffaf0', 1, 3, 14, 10); R(x, '#3b6fb6', 1, 3, 14, 3); R(x, '#f8d0a8', 3, 7, 4, 4); R(x, '#2c2733', 3, 7, 4, 1); R(x, '#8fa0ab', 8, 8, 5, 1); R(x, '#8fa0ab', 8, 10, 4, 1); }
  else if (id === 'vethang') { R(x, '#3f9a6b', 1, 4, 14, 8); R(x, '#fffaf0', 3, 6, 10, 4); R(x, '#3f9a6b', 4, 7, 5, 1); R(x, '#e2574c', 10, 7, 2, 2); }
  else if (id === 'dp_td') shirt('#4d86de', '#ffffff');
  else if (id === 'dp_qp') shirt('#6f8440', null);
  else if (id === 'comhop') { R(x, '#e2574c', 2, 6, 12, 7); R(x, '#fbf7ee', 2, 4, 12, 3); R(x, '#c2453b', 2, 11, 12, 2); R(x, '#8b8f9c', 7, 3, 2, 1); }
  else if (id === 'banhmi') { ell(x, '#e0a85a', 7.5, 8, 6.5, 3.6); ell(x, '#f2c27a', 7, 7, 5, 2); R(x, '#b47a48', 4, 7, 1, 2); R(x, '#b47a48', 7, 6, 1, 2); R(x, '#b47a48', 10, 7, 1, 2); }
  else if (id === 'sua') { R(x, '#fffaf0', 4, 3, 8, 11); R(x, '#5a8fd6', 4, 7, 8, 4); R(x, '#d9d0bd', 4, 3, 8, 2); R(x, '#e2574c', 10, 0, 1, 4); }
  else if (id === 'bimbim') { R(x, '#f2a93b', 3, 2, 10, 12); R(x, '#d9862b', 3, 2, 10, 1); R(x, '#d9862b', 3, 13, 10, 1); R(x, '#fffaf0', 7, 5, 2, 6); R(x, '#fffaf0', 5, 7, 6, 2); R(x, '#e2574c', 7, 7, 2, 2); }
  else if (id === 'banhtrang') { R(x, '#eaf3fb', 3, 3, 10, 11); R(x, '#e98a3c', 4, 7, 8, 6); R(x, '#5fae4a', 5, 8, 2, 1); R(x, '#e2574c', 9, 10, 2, 1); R(x, '#8b8f9c', 6, 2, 4, 1); }
  else if (id === 'gaubong') { ell(x, '#b9824f', 7.5, 9, 5, 4.5); ell(x, '#b9824f', 7.5, 4.5, 4, 3.5); ell(x, '#b9824f', 4, 2, 1.6, 1.6); ell(x, '#b9824f', 11, 2, 1.6, 1.6); ell(x, '#f0d09a', 7.5, 6, 2, 1.5); R(x, '#2a2136', 6, 4, 1, 1); R(x, '#2a2136', 9, 4, 1, 1); R(x, '#e2574c', 6, 8, 4, 1); }
  else if (id === 'the') { R(x, '#fffaf0', 2, 3, 8, 11); R(x, '#d9534f', 3, 4, 6, 9); R(x, '#fffaf0', 6, 2, 8, 11); R(x, '#3b82c4', 7, 3, 6, 9); R(x, '#ffe066', 9, 6, 2, 3); }
  else if (id === 'ca') { ell(x, '#6fa8dc', 7, 8, 5.5, 3.2); R(x, '#6fa8dc', 12, 5, 3, 7); R(x, '#4f86b8', 13, 7, 2, 3); ell(x, '#cfe6f7', 6, 9, 3, 1.4); R(x, '#2a2136', 3, 7, 1, 1); }
  else if (id === 'cancau') { line(x, '#8b5e3c', 2, 14, 13, 1); line(x, '#8b5e3c', 3, 14, 14, 1); R(x, '#fffaf0', 14, 2, 1, 8); R(x, '#e2574c', 13, 10, 3, 2); R(x, '#5f656f', 4, 11, 3, 3); }
  else if (id === 'voso') { ell(x, '#f7c9b8', 7.5, 8.5, 6, 5); for (const a of [4, 6, 8, 10]) R(x, '#e9a48e', a, 5, 1, 7); R(x, '#fffaf0', 6, 12, 4, 2); }
  // hàng hoá ở tạp hoá, căn tin, TTTM, khu game
  else if (id === 'daynhay') { ring(x, '#e2574c', 8, 8, 6); R(x, '#fff6e3', 2, 2, 12, 5); R(x, '#3b82c4', 2, 3, 3, 5); R(x, '#3b82c4', 11, 3, 3, 5); }
  else if (id === 'tatay') { R(x, '#8b8f9c', 4, 7, 8, 2); R(x, '#3a3f55', 1, 4, 3, 8); R(x, '#3a3f55', 12, 4, 3, 8); R(x, '#5f656f', 1, 4, 3, 2); R(x, '#5f656f', 12, 4, 3, 2); }
  else if (id === 'xadon') { R(x, '#8b8f9c', 1, 3, 14, 2); R(x, '#5f656f', 2, 5, 2, 9); R(x, '#5f656f', 12, 5, 2, 9); R(x, '#f4d35e', 6, 3, 4, 2); }
  else if (id === 'xedap' || id === 'xedapdien' || id === 'xemay') { const col = id === 'xedap' ? '#3b82c4' : id === 'xedapdien' ? '#5fae4a' : '#d9534f'; ring(x, '#2f2a3a', 4, 11, 3); ring(x, '#2f2a3a', 12, 11, 3); R(x, col, 4, 7, 9, 3); R(x, col, 10, 4, 2, 5); R(x, '#2f2a3a', 9, 3, 4, 1); R(x, '#2f2a3a', 3, 5, 4, 2); }
  else if (id === 'bimbim5') { for (const [a, b2] of [[1, 3], [5, 1], [8, 4]]) { R(x, '#f2a93b', a, b2, 7, 10); R(x, '#d9862b', a, b2, 7, 1); R(x, '#e2574c', a + 2, b2 + 4, 3, 3); } }
  else if (id === 'comtrua') { ell(x, '#fffaf0', 7.5, 9, 7, 5); ell(x, '#f4e3b0', 5.5, 8, 3.4, 2.6); ell(x, '#5fae4a', 10.5, 9, 2.6, 2); R(x, '#c9862b', 6, 10, 3, 2); }
  else if (id === 'nuocmia') { R(x, '#eaf6fc', 4, 3, 8, 11); R(x, '#c9d98a', 5, 6, 6, 7); R(x, '#fffaf0', 6, 7, 2, 2); R(x, '#d9534f', 9, 0, 1, 7); }
  else if (id === 'trasua') { R(x, '#fffaf0', 4, 4, 8, 10); R(x, '#c98f5a', 5, 6, 6, 7); for (const a of [5, 7, 9]) R(x, '#2a2136', a, 11, 1, 1); R(x, '#fff', 3, 3, 10, 2); R(x, '#d9534f', 9, 0, 1, 5); }
  else if (id === 'tradao') { R(x, '#fffaf0', 4, 4, 8, 10); R(x, '#f2a93b', 5, 6, 6, 7); ell(x, '#e98a3c', 7.5, 10, 2, 2); R(x, '#fff', 3, 3, 10, 2); R(x, '#5fae4a', 9, 0, 1, 5); }
  else if (id === 'xien') { R(x, '#c98f5a', 7, 1, 1, 14); for (const [b2, c2] of [[3, '#e2574c'], [7, '#f2a93b'], [11, '#8b5e3c']]) ell(x, c2, 7.5, b2, 2.6, 1.8); }
  else if (id === 'kem') { tri(x, '#dba56e', 7.5, 8, 7, 4); ell(x, '#f7c9d6', 7.5, 6, 4.4, 4); ell(x, '#fffaf0', 6, 4.5, 1.6, 1.4); R(x, '#d9534f', 7, 0, 2, 2); }
  else if (id === 'garan') { ell(x, '#c9862b', 6, 7, 5, 4.4); ell(x, '#e0a85a', 5, 6, 3, 2.4); R(x, '#fffaf0', 10, 9, 5, 2); R(x, '#fffaf0', 13, 8, 2, 4); }
  else if (id === 'haisan') { ell(x, '#f79a90', 7, 8, 5, 3); R(x, '#f79a90', 10, 5, 4, 2); R(x, '#f79a90', 10, 10, 4, 2); R(x, '#2a2136', 4, 7, 1, 1); R(x, '#c98f5a', 0, 13, 16, 1); }
  else if (id === 'vephim') { R(x, '#f4d35e', 1, 4, 14, 8); R(x, '#d9b23c', 5, 4, 1, 8); R(x, '#2a2136', 8, 6, 5, 1); R(x, '#2a2136', 8, 9, 4, 1); R(x, '#e2574c', 2, 6, 2, 4); }
  else if (id === 'sachtk') { R(x, '#3f7d5c', 2, 2, 12, 13); R(x, '#2f5f46', 2, 2, 2, 13); R(x, '#fffaf0', 6, 5, 6, 2); R(x, '#f4d35e', 6, 9, 4, 1); R(x, '#fffaf0', 4, 14, 10, 1); }
  else if (id === 'hopthe') { R(x, '#d9534f', 2, 4, 12, 10); R(x, '#f4d35e', 2, 4, 12, 3); R(x, '#fffaf0', 5, 8, 6, 4); R(x, '#3b82c4', 6, 9, 4, 2); }
  else if (id === 'xeng') { ell(x, '#d9b23c', 6, 9, 5, 5); ell(x, '#f4d35e', 6, 8, 5, 5); R(x, '#d9b23c', 5, 6, 2, 5); ell(x, '#d9b23c', 11, 6, 3.4, 3.4); ell(x, '#f4d35e', 11, 5.4, 3.4, 3.4); }
  else if (id === 'd_poster') { R(x, '#fffaf0', 3, 1, 10, 14); R(x, '#7a5fc9', 4, 2, 8, 12); ell(x, '#ffe066', 8, 6, 2.4, 2.4); R(x, '#fff', 5, 11, 6, 1); }
  else if (id === 'd_den') { tri(x, '#ffe9a0', 8, 1, 7, 5); R(x, '#f4d35e', 3, 7, 10, 1); R(x, '#5f656f', 7, 8, 2, 6); R(x, '#4a4f5a', 4, 14, 8, 1); }
  else if (id === 'd_cay') { R(x, '#c8583f', 5, 10, 6, 5); ell(x, '#5fae4a', 8, 6, 5, 5); ell(x, '#7cc75f', 6, 4, 2.4, 2.4); }
  else if (id === 'd_tham') { ell(x, '#d9695f', 7.5, 8, 7.5, 5); ell(x, '#f0c9a0', 7.5, 8, 5.5, 3.5); ell(x, '#d9695f', 7.5, 8, 3, 1.8); }
  else if (id === 'guitar') { R(x, '#8a5a3a', 7, 0, 2, 8); ell(x, '#c98f5a', 7.5, 11, 4, 4.4); ell(x, '#3a2a22', 7.5, 10.5, 1.4, 1.4); R(x, '#2a2136', 6, 0, 4, 2); }
  else if (id === 'micro') { ell(x, '#3a3f55', 8, 4, 3.4, 3.4); R(x, '#8b8f9c', 6, 3, 2, 1); R(x, '#5f656f', 7, 7, 2, 7); R(x, '#3a3f55', 4, 14, 8, 1); }
  // biểu tượng các tab của menu
  else if (id === 'm_stats') { R(x, '#3b82c4', 2, 9, 3, 5); R(x, '#5fae4a', 6, 5, 3, 9); R(x, '#f2a93b', 10, 2, 3, 12); R(x, '#2a2136', 1, 14, 14, 1); }
  else if (id === 'm_friends') { ell(x, '#e2574c', 4.5, 5.5, 3.5, 3.5); ell(x, '#e2574c', 10.5, 5.5, 3.5, 3.5); for (let j = 0; j < 7; j++) R(x, '#e2574c', 1 + j, 7 + j, 14 - 2 * j, 1); R(x, '#ffb3c7', 3, 4, 2, 2); }
  else if (id === 'm_tt') { R(x, '#fffaf0', 1, 2, 14, 12); R(x, '#3b6fb6', 1, 2, 14, 3); for (const a of [5, 10]) R(x, '#8fa0ab', a, 5, 1, 9); for (const b2 of [8, 11]) R(x, '#8fa0ab', 1, b2, 14, 1); R(x, '#e2574c', 6, 6, 4, 2); R(x, '#5fae4a', 11, 9, 3, 2); R(x, '#f2a93b', 2, 12, 3, 2); }
  else if (id === 'm_grades') { R(x, '#3f7d5c', 2, 1, 12, 14); R(x, '#2f5f46', 2, 1, 2, 14); R(x, '#fffaf0', 6, 3, 6, 7); R(x, '#e2574c', 7, 4, 4, 1); R(x, '#e2574c', 7, 4, 1, 5); R(x, '#e2574c', 10, 4, 1, 5); R(x, '#e2574c', 7, 6, 4, 1); R(x, '#f4d35e', 6, 12, 6, 1); }
  else if (id === 'm_cal') { R(x, '#fffaf0', 1, 3, 14, 11); R(x, '#e2574c', 1, 3, 14, 4); R(x, '#2a2136', 4, 1, 1, 4); R(x, '#2a2136', 11, 1, 1, 4); for (let j = 0; j < 2; j++) for (let i = 0; i < 4; i++) R(x, i === 2 && j === 1 ? '#e2574c' : '#8fa0ab', 3 + i * 3, 9 + j * 3, 2, 2); }
  else if (id === 'm_cards') { R(x, '#fffaf0', 2, 3, 8, 11); R(x, '#d9534f', 3, 4, 6, 9); R(x, '#fffaf0', 6, 2, 8, 11); R(x, '#3b82c4', 7, 3, 6, 9); R(x, '#ffe066', 9, 6, 2, 3); }
  else if (id === 'm_set') { ell(x, '#8b8f9c', 7.5, 7.5, 5, 5); for (const [a, b2] of [[7, 0], [7, 13], [0, 7], [13, 7], [2, 2], [12, 2], [2, 12], [12, 12]]) R(x, '#8b8f9c', a, b2, 2, 2); ell(x, '#fff6e3', 7.5, 7.5, 2, 2); R(x, '#c9ccd4', 5, 4, 4, 1); }
  else if (id === 'banhchung' || id === 'sc_banhchung') { R(x, '#3f8f3a', 2, 3, 12, 11); R(x, '#5fae4a', 2, 3, 12, 2); R(x, '#d9c690', 7, 3, 2, 11); R(x, '#d9c690', 2, 8, 12, 2); R(x, '#2f6b2b', 2, 13, 12, 1); }
  else if (id === 'xoi') { ell(x, '#5fae4a', 8, 11, 7, 3.5); ell(x, '#e2574c', 8, 8, 5.5, 4); ell(x, '#f07a6f', 7, 7, 3, 2); R(x, '#fffaf0', 5, 6, 1, 1); R(x, '#fffaf0', 10, 8, 1, 1); }
  else if (id === 'keobong') { R(x, '#d9c690', 7, 9, 2, 7); ell(x, '#ff9fc0', 8, 6, 6, 5); ell(x, '#ffc6dc', 6, 5, 3, 2.4); ell(x, '#ff7fa8', 10, 8, 2.4, 2); }
  else if (id === 'longden') { R(x, '#3a2a22', 7, 0, 2, 2); R(x, '#ffd23a', 4, 2, 8, 2); ell(x, '#e2574c', 8, 8, 6, 5); R(x, '#ff8f7a', 5, 6, 2, 4); R(x, '#ffd23a', 4, 12, 8, 2); R(x, '#ffd23a', 7, 14, 2, 2); }
  else if (id === 'lixi') { R(x, '#d9534f', 3, 1, 10, 14); R(x, '#b23b3b', 3, 1, 10, 4); R(x, '#ffd23a', 6, 6, 4, 4); R(x, '#d9534f', 7, 7, 2, 2); R(x, '#ffd23a', 4, 12, 8, 1); }
  else if (id === 'cup') { R(x, '#e8b83a', 4, 2, 8, 6); R(x, '#ffd23a', 5, 2, 3, 5); R(x, '#e8b83a', 1, 3, 3, 1); R(x, '#e8b83a', 1, 3, 1, 3); R(x, '#e8b83a', 12, 3, 3, 1); R(x, '#e8b83a', 14, 3, 1, 3); R(x, '#c9962a', 6, 8, 4, 3); R(x, '#8a5a3a', 4, 11, 8, 4); R(x, '#ffd23a', 6, 12, 4, 1); }
  else if (id === 'photo') { R(x, '#fffaf0', 1, 2, 14, 12); R(x, '#8fc1e3', 2, 3, 12, 7); for (let i = 0; i < 4; i++) { ell(x, '#f8d0a8', 4 + i * 3, 7, 1.2, 1.2); R(x, ['#2c2733', '#6b4429', '#3a2a2a', '#1f1f29'][i], 3 + i * 3, 5, 3, 1); R(x, '#f6f6f2', 3 + i * 3, 9, 3, 1); } R(x, '#e8b83a', 7, 4, 2, 2); }
  else if (id === 'que' || id === 'sc_xinxam') { R(x, '#8a5a3a', 4, 6, 8, 10); R(x, '#a9703f', 4, 6, 2, 10); R(x, '#5b3d27', 4, 6, 8, 1); for (const a of [5, 7, 9, 11]) R(x, '#e8c27a', a, 1 + (a % 3), 1, 6); R(x, '#d9534f', 7, 1, 2, 2); }
  else if (id === 'nhang') { for (const a of [5, 8, 11]) { R(x, '#c8583f', a, 4, 1, 11); R(x, '#ffb03a', a, 4, 1, 1); } R(x, 'rgba(200,200,200,.8)', 8, 0, 1, 3); }
  else if (id === 'm_memo') { R(x, '#7a5fc9', 2, 1, 12, 14); R(x, '#5f47a8', 2, 1, 2, 14); R(x, '#fffaf0', 13, 2, 1, 12); ell(x, '#ff9fc0', 8, 7, 2.6, 2.4); ell(x, '#ff9fc0', 11, 7, 2.6, 2.4); tri(x, '#ff9fc0', 9.5, 8, 4, 4); }
  else if (id === 'sc_giaothua') { R(x, '#24406b', 0, 0, 16, 16); for (const [a, b, c2] of [[5, 5, '#ffd23a'], [11, 8, '#ff7fa8'], [7, 11, '#5fe0f0']]) { R(x, c2, a, b - 3, 1, 7); R(x, c2, a - 3, b, 7, 1); R(x, c2, a - 2, b - 2, 1, 1); R(x, c2, a + 2, b + 2, 1, 1); R(x, c2, a + 2, b - 2, 1, 1); R(x, c2, a - 2, b + 2, 1, 1); } }
  else if (id === 'sc_chua') { R(x, '#8a3a2a', 2, 3, 12, 3); R(x, '#8a3a2a', 0, 7, 16, 3); R(x, '#e8b83a', 0, 9, 16, 1); R(x, '#f1d9a0', 2, 10, 12, 5); R(x, '#b23b3b', 3, 10, 1, 5); R(x, '#b23b3b', 12, 10, 1, 5); R(x, '#5b3d27', 6, 11, 4, 4); R(x, '#e8b83a', 4, 2, 8, 1); }
  else if (id === 'sc_tet') { line(x, '#6f472c', 2, 14, 13, 3); line(x, '#6f472c', 7, 9, 3, 4); for (const [a, b] of [[12, 2], [10, 5], [13, 6], [6, 7], [3, 3], [8, 10], [4, 12]]) { R(x, '#ffd23a', a, b, 2, 2); R(x, '#f2a93b', a, b + 1, 1, 1); } }
  else if (id === 'sc_skip') { R(x, '#e9c46a', 0, 6, 16, 10); for (let i = 0; i < 16; i += 4) R(x, '#c9a24a', i, 6, 1, 10); R(x, '#c9a24a', 0, 10, 16, 1); R(x, '#8a5a3a', 4, 1, 1, 15); R(x, '#8a5a3a', 8, 1, 1, 15); for (let j = 2; j < 16; j += 3) R(x, '#8a5a3a', 4, j, 5, 1); }
  else if (id === 'sc_picnic') { R(x, '#e2574c', 1, 8, 14, 7); for (let i = 1; i < 15; i += 4) R(x, '#fffaf0', i, 8, 2, 7); R(x, '#a9703f', 5, 3, 7, 6); R(x, '#8a5a3a', 6, 1, 5, 2); }
  else if (id === 'sc_bien') { R(x, '#8fd0f0', 0, 0, 16, 9); ell(x, '#ffd23a', 11, 4, 3, 3); R(x, '#3b82c4', 0, 9, 16, 3); R(x, '#fffaf0', 2, 9, 4, 1); R(x, '#fffaf0', 9, 10, 4, 1); R(x, '#f4e2b0', 0, 12, 16, 4); }
  else if (id === 'sc_movie') { R(x, '#2a2136', 1, 3, 14, 10); R(x, '#fffaf0', 2, 4, 1, 1); R(x, '#fffaf0', 2, 11, 1, 1); R(x, '#fffaf0', 13, 4, 1, 1); R(x, '#fffaf0', 13, 11, 1, 1); R(x, '#5fe0f0', 4, 5, 8, 6); ell(x, '#ffd23a', 8, 8, 2, 2); }
  else if (id === 'sc_faint') { R(x, '#c9ccd4', 1, 7, 14, 6); R(x, '#fbfdff', 2, 8, 12, 4); R(x, '#9fd6c4', 6, 8, 8, 4); ell(x, '#f8d0a8', 4, 9, 1.6, 1.6); R(x, '#fffaf0', 10, 1, 5, 5); R(x, '#d9534f', 12, 2, 1, 3); R(x, '#d9534f', 11, 3, 3, 1); }
  else if (id === 'sc_caught') { ell(x, '#c9ccd4', 7, 9, 5, 4); R(x, '#8b8f9c', 10, 6, 5, 2); R(x, '#2a2136', 6, 9, 2, 2); R(x, '#ffde59', 1, 1, 2, 3); R(x, '#ffde59', 4, 0, 1, 3); R(x, '#ffde59', 13, 1, 2, 2); }
  else if (id === 'sc_ngu') { ell(x, '#ffe066', 11, 5, 4, 4); ell(x, '#24406b', 13, 4, 3, 3); R(x, '#8fb0d8', 1, 9, 14, 6); R(x, '#fffaf0', 2, 9, 5, 4); }
  else if (id === 'sc_totnghiep') { R(x, '#2a2136', 1, 5, 14, 3); R(x, '#2a2136', 4, 8, 8, 4); R(x, '#3a3f55', 4, 8, 8, 1); R(x, '#ffd23a', 12, 6, 1, 6); R(x, '#ffd23a', 11, 12, 3, 2); }
  else if (id === 'sc_tetvisit') { R(x, '#d9534f', 2, 3, 6, 9); R(x, '#ffd23a', 4, 6, 2, 2); R(x, '#d9534f', 8, 4, 6, 9); R(x, '#ffd23a', 10, 7, 2, 2); R(x, '#ffd23a', 2, 13, 12, 1); }
  else if (id === 'm_map') { R(x, '#fffaf0', 1, 3, 14, 11); R(x, '#cfe8b8', 1, 3, 4, 11); R(x, '#bfe3f2', 10, 3, 5, 11); R(x, '#d9ccb2', 5, 3, 1, 11); R(x, '#d9ccb2', 10, 3, 1, 11); R(x, '#e2574c', 6, 5, 3, 3); R(x, '#e2574c', 7, 8, 1, 2); R(x, '#8b8f9c', 2, 10, 6, 1); }
  else if (id === 'm_menu') { for (const b2 of [3, 7, 11]) { R(x, '#2a2136', 2, b2, 12, 2); R(x, '#5f656f', 2, b2, 12, 1); } }
  else if (id === 'tailieu') { R(x, '#3b6fb6', 2, 2, 12, 13); R(x, '#fffaf0', 4, 3, 9, 11); for (const b of [5, 7, 9, 11]) R(x, '#8b8f9c', 5, b, 7, 1); R(x, '#e2574c', 2, 2, 2, 13); }
  else if (id === 'comme') { R(x, '#3b82c4', 2, 6, 12, 8); R(x, '#5a9ad6', 2, 6, 12, 2); R(x, '#e2574c', 1, 4, 14, 3); R(x, '#fffaf0', 7, 3, 2, 2); }
  else if (id === 'vibo') { R(x, '#6f472c', 2, 4, 12, 9); R(x, '#8a5a3a', 2, 4, 12, 3); R(x, '#5b3d27', 9, 7, 5, 3); R(x, '#ffd23a', 11, 8, 1, 1); }
  else if (id === 'kinhme') { ell(x, '#2a2136', 4.5, 8, 3.5, 3); ell(x, '#cfe8f7', 4.5, 8, 2.5, 2); ell(x, '#2a2136', 11.5, 8, 3.5, 3); ell(x, '#cfe8f7', 11.5, 8, 2.5, 2); R(x, '#2a2136', 7, 7, 2, 1); }
  else if (id === 'usb') { R(x, '#3a3f55', 4, 5, 9, 6); R(x, '#5f656f', 4, 5, 9, 2); R(x, '#c9ccd4', 13, 6, 3, 4); R(x, '#2a2136', 14, 7, 1, 1); R(x, '#8fd067', 6, 8, 2, 1); }
  else if (id === 'nuocmam') { R(x, '#c9862f', 5, 5, 6, 10); R(x, '#e0a54a', 5, 5, 2, 10); R(x, '#5f656f', 6, 2, 4, 3); R(x, '#d9534f', 5, 9, 6, 3); R(x, '#ffd23a', 7, 10, 2, 1); }
  else if (id === 'pho') { ell(x, '#fffaf0', 8, 10, 7, 4); ell(x, '#e8c47a', 8, 9, 6, 2.5); R(x, '#57a548', 5, 8, 2, 1); R(x, '#c8583f', 9, 8, 3, 1); R(x, '#8a5a3a', 11, 2, 1, 7); R(x, '#8a5a3a', 13, 3, 1, 6); }
  else if (id === 'buncha') { ell(x, '#fffaf0', 8, 11, 7, 4); ell(x, '#c9862f', 8, 10, 5, 2); R(x, '#8a4a1c', 5, 9, 3, 2); R(x, '#8a4a1c', 9, 10, 3, 2); R(x, '#fbf7ee', 2, 3, 6, 3); R(x, '#57a548', 10, 3, 4, 3); }
  else if (id === 'comrang') { ell(x, '#fffaf0', 8, 11, 7, 4); ell(x, '#f2c94c', 8, 9, 5.5, 3); R(x, '#57a548', 6, 8, 1, 1); R(x, '#c8583f', 9, 9, 2, 1); R(x, '#e98a3c', 7, 10, 1, 1); }
  else if (id === 'nemran') { for (const a of [3, 7, 11]) { R(x, '#c9862f', a, 4, 3, 9); R(x, '#e0a54a', a, 4, 1, 9); } R(x, '#57a548', 2, 13, 12, 2); }
  else if (id === 'm_quest') { R(x, '#a9703f', 2, 2, 12, 14); R(x, '#fffaf0', 3, 4, 10, 11); R(x, '#5f656f', 5, 1, 6, 3); R(x, '#8b8f9c', 6, 1, 4, 1); for (const b of [6, 9, 12]) { R(x, '#3f8f3a', 4, b, 2, 1); R(x, '#8b8f9c', 7, b, 5, 1); } R(x, '#e2574c', 4, 12, 2, 1); }
  else if (id === 'm_phone') { R(x, '#2a2136', 4, 1, 8, 14); R(x, '#8fd0f0', 5, 3, 6, 8); R(x, '#cfeefa', 5, 3, 6, 2); R(x, '#fff6e3', 7, 12, 2, 1); }
  else if (id === 'denongsao' || id === 'sc_trungthu') {
    if (id === 'sc_trungthu') { R(x, '#24406b', 0, 0, 16, 16); ell(x, '#ffe9a0', 12, 4, 3, 3); ell(x, '#fff6c8', 11, 3, 1.5, 1.5); }
    pat(x, STAR11, id === 'sc_trungthu' ? 0 : 2, id === 'sc_trungthu' ? 5 : 2, '#e2574c', '#ffd23a'); R(x, '#8a5a3a', id === 'sc_trungthu' ? 5 : 7, id === 'sc_trungthu' ? 14 : 12, 1, 4); R(x, '#fff6c8', id === 'sc_trungthu' ? 5 : 7, id === 'sc_trungthu' ? 9 : 6, 1, 1);
  }
  else if (id === 'nl_tre') { for (let i = 0; i < 5; i++) { R(x, '#d9c690', 2 + i * 2, 2 + (i % 2), 1, 12); R(x, '#b8a46a', 2 + i * 2, 13 + (i % 2), 1, 1); } R(x, '#d9534f', 1, 7, 12, 2); R(x, '#d9c690', 12, 3, 2, 10); }
  else if (id === 'nl_giay') { R(x, '#e2574c', 1, 4, 10, 10); R(x, '#ff8f7a', 2, 5, 3, 3); R(x, '#ffd23a', 5, 2, 10, 10); R(x, '#fff6a8', 6, 3, 3, 3); R(x, 'rgba(255,255,255,.6)', 12, 3, 1, 6); }
  else if (id === 'nl_nen') { R(x, '#fffaf0', 6, 6, 4, 9); R(x, '#e3ddd0', 9, 6, 1, 9); R(x, '#2a2136', 7, 4, 1, 2); ell(x, '#ffd23a', 7.5, 2.5, 1.5, 2.2); R(x, '#ff7a3a', 7, 3, 1, 1); R(x, '#c9c2b3', 4, 14, 8, 2); }
  else if (id === 'banhnuong') { ell(x, '#c9862f', 8, 9, 6.5, 5.5); ell(x, '#e0a54a', 8, 8, 5.5, 4.5); R(x, '#a86a22', 5, 7, 6, 1); R(x, '#a86a22', 7, 5, 2, 6); ell(x, '#f2c76a', 6, 6, 1, 1); }
  else if (id === 'banhdeo') { ell(x, '#e9e4d6', 8, 9, 6.5, 5.5); ell(x, '#fbf8ef', 8, 8, 5.5, 4.5); R(x, '#d9cfb8', 5, 8, 6, 1); R(x, '#d9cfb8', 7, 6, 2, 5); ell(x, '#9fd6a4', 11, 5, 1.5, 1); }
  else if (id === 'buoi') { ell(x, '#7fbf5a', 8, 9, 6.5, 6); ell(x, '#f6c4c0', 8, 9, 5, 4.6); for (const a of [5, 8, 11]) R(x, '#f9dcd8', a, 6, 1, 6); R(x, '#5a8f3a', 7, 2, 2, 2); }
  else if (id === 'anhgiaothua' || id === 'anhtrungthu') { R(x, '#fffdf6', 1, 2, 14, 12); R(x, id === 'anhgiaothua' ? '#24406b' : '#2f3f6b', 2, 3, 12, 8); R(x, id === 'anhgiaothua' ? '#ff5fa8' : '#ffe9a0', 10, 4, 2, 2); for (const a of [4, 7, 10]) { R(x, '#f8d0a8', a, 8, 2, 2); R(x, '#2c2733', a, 7, 2, 1); } R(x, '#8b8f9c', 2, 12, 12, 1); }
  else if (id.startsWith('b_')) {
    R(x, '#d9534f', 4, 0, 3, 6); R(x, '#3b82c4', 9, 0, 3, 6); R(x, '#b23b3b', 4, 5, 3, 1); R(x, '#2a5f99', 9, 5, 3, 1);
    ell(x, '#c9962a', 8, 10, 5.8, 5.8); ell(x, '#ffd23a', 8, 10, 4.8, 4.8); ell(x, '#f2c94c', 8, 11, 4, 3.6);
    const k = id.slice(2);
    if (k === 'giaothua') { const c2 = '#e2574c'; R(x, c2, 8, 6, 1, 9); R(x, c2, 4, 10, 9, 1); R(x, c2, 6, 8, 1, 1); R(x, c2, 10, 8, 1, 1); R(x, c2, 6, 12, 1, 1); R(x, c2, 10, 12, 1, 1); }
    else if (k === 'trungthu') pat(x, STAR7, 5, 7, '#e2574c', '#e2574c');
    else if (k === 'dapnieu') { ell(x, '#8a5a3a', 8, 11, 3.2, 2.6); R(x, '#5b3d27', 6, 8, 5, 1); R(x, '#5b3d27', 8, 6, 1, 2); R(x, '#d9534f', 6, 11, 1, 1); R(x, '#3b82c4', 9, 12, 1, 1); }
    else if (k === 'keoco') { R(x, '#8a5a3a', 4, 10, 9, 1); R(x, '#a9703f', 4, 11, 9, 1); R(x, '#d9534f', 8, 8, 1, 5); R(x, '#2a2136', 4, 8, 1, 2); R(x, '#2a2136', 12, 8, 1, 2); }
  }
  else { R(x, '#c9b58a', 3, 3, 10, 10); }
  const oc = outline(c); _iconCv[id] = oc;
  return (_icons[id] = oc.toDataURL());
}
// Chân dung nhân vật cho hộp thoại (đầu + vai, phóng to)
const _faces = {};
function faceOf(look, outfit) {
  const k = look + ':' + (outfit || '');
  if (_faces[k]) return _faces[k];
  const f = charSheet(look, outfit)[0][0], c = mk(18, 19), x = cx(c);
  x.drawImage(f, 0, 0, 18, 19, 0, 0, 18, 19);
  return (_faces[k] = c.toDataURL());
}

/* ---------- chân dung cầu thủ trên thẻ (chibi mặc áo đấu) ---------- */
const CARD_KITS = [['#d9534f', '#fffaf0'], ['#3b82c4', '#ffe066'], ['#5fae4a', '#fffaf0'], ['#f2a93b', '#2a2136'], ['#7a5fc9', '#fffaf0'], ['#2e9e86', '#ffe066']];
const CARD_HAIR = [['#2c2733', 'short'], ['#6b4429', 'spiky'], ['#1f1f29', 'buzz'], ['#3a3340', 'short'], ['#c9a05a', 'spiky']];
const _portraits = {};
function cardPortrait(c) {
  if (_portraits[c.id]) return _portraits[c.id];
  const kit = c.r === 3 ? ['#f4d35e', '#d9534f'] : c.club ? CARD_CLUBS[c.club].kit : CARD_KITS[c.no % CARD_KITS.length], hr = CARD_HAIR[(c.no * 7) % CARD_HAIR.length];
  const L = { hair: hr[0], style: hr[1], shirt: c.pos === 'tm' ? '#3a3f55' : kit[0], pants: c.pos === 'tm' ? '#2a2136' : '#fffaf0', stripe: kit[1], skin: c.no % 3 === 0 ? '#e3ae80' : '#f8d0a8', shoe: '#2a2136' };
  const f = drawCharFrame(L, 0, 0), cv2 = mk(72, 96), x = cx(cv2);
  x.drawImage(f, 0, 0, 18, 24, 0, 0, 72, 96);
  return (_portraits[c.id] = cv2.toDataURL());
}
/* ---------- huy hiệu CLB và cờ quốc tịch trên thẻ cầu thủ ---------- */
const _badges = {};
const SHIELD = [[1, 10], [0, 11], [0, 11], [0, 11], [0, 11], [0, 11], [0, 11], [0, 11], [0, 11], [1, 10], [2, 9], [3, 8], [4, 7], [5, 6]];
function clubCrest(k) {
  if (_badges['c' + k]) return _badges['c' + k];
  const C = CARD_CLUBS[k], c = mk(12, 14), x = cx(c), [a, b] = C.kit, ink = '#2a2136';
  SHIELD.forEach(([l, r], y) => R(x, ink, l, y, r - l + 1, 1));
  SHIELD.forEach(([l, r], y) => { if (y > 0 && y < 13 && r - l > 1) R(x, a, l + 1, y, r - l - 1, 1); });
  R(x, shade(a, 30), 2, 1, 8, 1);                                    // viền sáng phía trên
  const P = (px, py, w, h, col) => R(x, col || b, px, py, w || 1, h || 1);
  if (k === 'HP') { P(5, 2, 2, 2); P(3, 4, 2, 2); P(7, 4, 2, 2); P(5, 6, 2, 2); P(4, 8, 1, 1); P(7, 8, 1, 1); P(5, 4, 2, 2, '#e98a3c'); P(5, 8, 2, 2, '#3f8f3a'); }     // hoa phượng
  else if (k === 'SX') { for (const yy of [3, 6, 9]) { P(2, yy + 1); P(3, yy); P(4, yy); P(5, yy + 1); P(6, yy + 1); P(7, yy); P(8, yy); P(9, yy + 1); } }            // sóng nước
  else if (k === 'CB') { P(5, 2, 2, 1); P(4, 3, 1, 1); P(7, 3, 1, 1); P(5, 4, 2, 1); P(5, 5, 2, 5); P(3, 6, 6, 1); P(2, 8, 1, 2); P(9, 8, 1, 2); P(3, 10, 2, 1); P(7, 10, 2, 1); }   // mỏ neo
  else if (k === 'ND') { P(4, 2); P(3, 3, 3); P(2, 4, 5); P(8, 4); P(7, 5, 3); P(2, 5, 5); P(1, 6, 10); P(1, 7, 10, 2); P(4, 2, 1, 1, '#fffaf0'); P(3, 3, 3, 1, '#fffaf0'); P(8, 4, 1, 1, '#fffaf0'); P(5, 8, 2, 1, shade(a, -25)); }  // hai đỉnh núi phủ tuyết
  return (_badges['c' + k] = c.toDataURL());
}
function natFlag(k) {
  if (_badges['n' + k]) return _badges['n' + k];
  const c = mk(16, 11), x = cx(c), ink = '#2a2136';
  R(x, ink, 0, 0, 16, 11);
  const F = (px, py, w, h, col) => R(x, col, px, py, w, h);
  if (k === 'VN') { F(1, 1, 14, 9, '#da251d'); const y = '#ffdd00'; F(7, 2, 2, 2, y); F(4, 4, 8, 1, y); F(5, 5, 6, 1, y); F(6, 6, 4, 1, y); F(5, 7, 2, 1, y); F(9, 7, 2, 1, y); F(4, 8, 2, 1, y); F(10, 8, 2, 1, y); }
  else if (k === 'NB') { F(1, 1, 14, 9, '#fbfbf7'); ell(x, '#bc002d', 8, 5.5, 2.6, 2.6); }
  else if (k === 'TH') { F(1, 1, 14, 2, '#a51931'); F(1, 3, 14, 1, '#f4f5f8'); F(1, 4, 14, 3, '#2d2a4a'); F(1, 7, 14, 1, '#f4f5f8'); F(1, 8, 14, 2, '#a51931'); }
  else if (k === 'BR') { F(1, 1, 14, 9, '#009c3b'); const y = '#ffdf00'; F(7, 2, 2, 1, y); F(5, 3, 6, 1, y); F(3, 4, 10, 3, y); F(5, 7, 6, 1, y); F(7, 8, 2, 1, y); F(6, 4, 4, 3, '#1f3c88'); F(6, 5, 4, 1, '#fbfbf7'); }
  return (_badges['n' + k] = c.toDataURL());
}
// icon 6 chỉ số thẻ cầu thủ: Tấn công (bóng sút) · Phòng thủ (khiên) · Tốc độ (tia chớp) · Sức mạnh (tạ) · Kỹ thuật (ngôi sao) · Tư duy (bộ não)
function statIcon(k) {
  if (_badges['s' + k]) return _badges['s' + k];
  const c = mk(12, 12), x = cx(c);
  if (k === 'atk') { ell(x, '#fffaf0', 7, 6, 4, 4); R(x, '#2a2136', 6, 5, 2, 2); R(x, '#2a2136', 9, 3, 1, 1); R(x, '#2a2136', 4, 8, 1, 1); R(x, '#2a2136', 9, 8, 1, 1); R(x, '#e2574c', 0, 3, 3, 1); R(x, '#e2574c', 0, 6, 2, 1); R(x, '#e2574c', 0, 9, 3, 1); }
  else if (k === 'def') { for (const [l, r2, y] of [[1, 10, 1], [1, 10, 2], [1, 10, 3], [1, 10, 4], [1, 10, 5], [2, 9, 6], [2, 9, 7], [3, 8, 8], [4, 7, 9], [5, 6, 10]]) R(x, '#3b82c4', l, y, r2 - l + 1, 1); R(x, '#8fc1e3', 3, 2, 2, 4); R(x, '#fffaf0', 5, 3, 2, 5); R(x, '#fffaf0', 4, 4, 4, 2); }
  else if (k === 'spd') { pat(x, ['.....###', '....###.', '...###..', '..######', '.....##.', '....##..', '...##...', '..##....', '.##.....'], 2, 1, '#f2c94c', '#f2c94c'); R(x, '#fff6a8', 6, 1, 1, 1); }
  else if (k === 'str') { R(x, '#5f656f', 0, 3, 3, 6); R(x, '#5f656f', 9, 3, 3, 6); R(x, '#8b8f9c', 0, 3, 3, 1); R(x, '#8b8f9c', 9, 3, 3, 1); R(x, '#3a3f55', 3, 5, 6, 2); R(x, '#c9ccd4', 3, 5, 6, 1); }
  else if (k === 'tec') { pat(x, ['....#....', '....#....', '...###...', '#########', '.#######.', '..#####..', '..##.##..', '.##...##.', '##.....##'], 1, 1, '#7a5fc9', '#7a5fc9'); R(x, '#c9b8f2', 5, 4, 1, 2); }
  else if (k === 'iq') { ell(x, '#e98fa5', 6, 6, 5, 4.5); R(x, '#c9667f', 6, 2, 1, 8); R(x, '#c9667f', 3, 4, 2, 1); R(x, '#c9667f', 8, 5, 2, 1); R(x, '#c9667f', 3, 7, 2, 1); R(x, '#c9667f', 8, 8, 2, 1); R(x, '#ffd2dc', 3, 3, 1, 1); }
  return (_badges['s' + k] = outline(c).toDataURL());
}
const statName2 = k => CARD_STATS.find(s2 => s2[0] === k)[1];
const statImg = (k, cls) => `<img class="${cls || 'sic'}" src="${statIcon(k)}" alt="${statName2(k)}" title="${statName2(k)}">`;
// <img> huy hiệu / cờ, kèm tên khi rê chuột
const badgeImg = (kind, k, cls) => kind === 'club'
  ? `<img class="${cls || 'bdg'}" src="${clubCrest(k)}" alt="${CARD_CLUBS[k].name}" title="CLB ${CARD_CLUBS[k].name}">`
  : `<img class="${cls || 'bdg'} flag" src="${natFlag(k)}" alt="${CARD_NATS[k].name}" title="Quốc tịch ${CARD_NATS[k].name}">`;
const cardBadges = (c, cls) => badgeImg('club', c.club, cls) + badgeImg('nat', c.nat, cls);
