'use strict';
/* ============================================================
 *  02f. ĐỒ HOẠ VÒNG 23: cửa hàng hoa, thú cưng, trung tâm năng khiếu, chợ, sạp đồ câu, gian hoạ cụ trong TTTM,
 *  chậu cây theo từng giai đoạn, thùng chứa, giá vẽ, chó mèo, icon cá / hoa quả / hạt giống / tranh…
 * ============================================================ */
function shopHouse(name, wall, roof, awning, sign, deco) {   // nhà cửa hàng 96×76 kiểu dãy phố
  def(name, 96, 76, x => {
    R(x, shade(roof, -25), 0, 2, 96, 6); R(x, roof, 2, 0, 92, 6); R(x, shade(roof, 20), 4, 0, 88, 2);
    R(x, wall, 4, 8, 88, 66); R(x, shade(wall, -14), 4, 70, 88, 4); R(x, shade(wall, 12), 4, 8, 88, 2);
    R(x, '#2a2136', 10, 12, 76, 14); R(x, sign, 11, 13, 74, 12); R(x, shade(sign, 30), 11, 13, 74, 2);
    for (let i = 0; i < 8; i++) R(x, i % 2 ? '#fffaf0' : awning, 6 + i * 10.5, 28, 10.5, 7); R(x, shade(awning, -30), 6, 35, 84, 2);
    R(x, '#cfe8f7', 10, 40, 30, 24); R(x, '#9cc8e6', 10, 40, 30, 3); R(x, '#2a2136', 24, 40, 1, 24);
    R(x, '#8a5a3a', 58, 40, 24, 34); R(x, '#a9703f', 60, 42, 20, 32); R(x, '#cfe8f7', 63, 45, 14, 12); R(x, '#f4d35e', 76, 58, 2, 3);
    if (deco) deco(x);
  });
}
function buildSprites3() {
  shopHouse('flowershop', '#f6efe2', '#c96a8a', '#e98fa5', '#5fae4a', x => {
    for (const [a, c] of [[12, '#e2574c'], [18, '#ffd23a'], [24, '#b07ad6'], [30, '#f2a93b']]) { R(x, '#5fae4a', a, 56, 4, 6); ell(x, c, a + 2, 54, 2.5, 2.5); }
    for (let i = 0; i < 4; i++) { R(x, '#c8583f', 6 + i * 8, 66, 6, 6); ell(x, ['#e2574c', '#ffd23a', '#e98fa5', '#fffaf0'][i], 9 + i * 8, 63, 3, 3); }
    R(x, '#fffaf0', 30, 17, 36, 3); ell(x, '#e2574c', 22, 19, 4, 4); ell(x, '#ffd23a', 74, 19, 4, 4);
  });
  shopHouse('petshop', '#eef3f8', '#3b6fb6', '#5fb0e8', '#f2a93b', x => {
    R(x, '#fffaf0', 26, 17, 44, 3); ell(x, '#8a5a3a', 18, 19, 4, 3); R(x, '#8a5a3a', 15, 15, 2, 3); R(x, '#8a5a3a', 20, 15, 2, 3);   // mặt chó trên biển
    R(x, '#f2a93b', 12, 52, 10, 8); R(x, '#f2a93b', 12, 49, 3, 3); R(x, '#f2a93b', 19, 49, 3, 3); R(x, '#2a2136', 14, 54, 1, 1); R(x, '#2a2136', 19, 54, 1, 1);   // mèo trong tủ kính
    R(x, '#c9a467', 26, 54, 12, 8); R(x, '#a8853f', 26, 60, 12, 2); ell(x, '#fffaf0', 32, 56, 3, 2);
  });
  shopHouse('talentB', '#f3e7f6', '#7a5fc9', '#b49ae8', '#7a5fc9', x => {
    R(x, '#fffaf0', 24, 17, 48, 3); R(x, '#ffd23a', 16, 15, 2, 7); ell(x, '#ffd23a', 15, 21, 2, 1.6);                 // nốt nhạc
    R(x, '#e2574c', 76, 16, 6, 6); R(x, '#3b82c4', 79, 18, 4, 4); R(x, '#8a5a3a', 78, 22, 1, 3);                        // bảng màu
    R(x, '#8a5a3a', 14, 46, 2, 16); R(x, '#fffaf0', 12, 44, 14, 10); R(x, '#5fae4a', 14, 48, 10, 3); R(x, '#5a8fd6', 14, 45, 10, 3);   // giá vẽ trong tủ kính
  });
  def('marketB', 128, 80, x => {                                          // chợ: mái ngói đỏ, cửa rộng, sạp hàng bày trước
    R(x, '#8a3a2a', 0, 4, 128, 14); R(x, '#b2503a', 4, 0, 120, 14); for (let i = 6; i < 124; i += 8) R(x, '#9a4230', i, 2, 1, 14);
    R(x, '#f2e6c8', 6, 18, 116, 58); R(x, '#d9c8a0', 6, 72, 116, 4);
    R(x, '#2a2136', 34, 22, 60, 13); R(x, '#d9534f', 35, 23, 58, 11); R(x, '#ffd23a', 35, 23, 58, 2);
    R(x, '#4a3020', 44, 40, 40, 36); R(x, '#6f472c', 46, 42, 36, 34); R(x, '#3a2418', 63, 42, 2, 34);
    for (const [a, c] of [[8, '#5fae4a'], [96, '#e2574c']]) { R(x, '#8a5a3a', a, 56, 24, 4); R(x, '#a9703f', a, 60, 24, 14); for (let i = 0; i < 5; i++) ell(x, c, a + 3 + i * 4.5, 54, 2.4, 2.4); }
    R(x, '#5fb0e8', 10, 40, 20, 12); R(x, '#cfe8f7', 10, 40, 20, 3); R(x, '#5fb0e8', 98, 40, 20, 12); R(x, '#cfe8f7', 98, 40, 20, 3);
  });
  def('tackle', 64, 50, x => {                                            // sạp đồ câu ngoài biển
    for (let i = 0; i < 6; i++) R(x, i % 2 ? '#fffaf0' : '#3b82c4', 2 + i * 10, 0, 10, 8); R(x, '#2f5a94', 2, 8, 60, 2);
    R(x, '#8a5a3a', 4, 10, 3, 26); R(x, '#8a5a3a', 57, 10, 3, 26);
    R(x, '#c9a467', 0, 30, 64, 16); R(x, '#a9853f', 0, 44, 64, 4); R(x, '#dcb878', 0, 30, 64, 2);
    R(x, '#2a2136', 14, 14, 36, 10); R(x, '#5fb0e8', 15, 15, 34, 8); ell(x, '#fffaf0', 32, 19, 7, 2.5); R(x, '#fffaf0', 38, 17, 3, 4);   // biển hình cá
    for (let i = 0; i < 3; i++) { R(x, '#6f472c', 12 + i * 16, 32, 1, 10); R(x, '#2a2136', 12 + i * 16, 31, 6, 1); }
    R(x, '#5f656f', 46, 34, 10, 8); R(x, '#8b8f9c', 47, 35, 8, 3);
  });
  def('potE', 16, 22, () => { }, true);                                   // khung kích thước cho chậu (sprite thật vẽ theo giai đoạn: potKey)
  def('chestS', 18, 16, x => { R(x, '#6f472c', 0, 4, 18, 12); R(x, '#a9703f', 1, 5, 16, 10); R(x, '#8a5a3a', 0, 0, 18, 6); R(x, '#c58c56', 1, 1, 16, 4); R(x, '#5a3a24', 0, 6, 18, 1); R(x, '#ffd23a', 8, 5, 2, 3); for (const a of [4, 13]) R(x, '#5a3a24', a, 1, 1, 15); });
  def('easel', 22, 30, x => {                                             // giá vẽ có khung tranh
    R(x, '#8a5a3a', 3, 10, 2, 20); R(x, '#8a5a3a', 17, 10, 2, 20); R(x, '#8a5a3a', 10, 2, 2, 28); R(x, '#6f472c', 2, 22, 18, 2);
    R(x, '#c9a467', 1, 3, 20, 17); R(x, '#fffaf0', 3, 5, 16, 13); R(x, '#cfe8f7', 3, 5, 16, 6); R(x, '#5fae4a', 3, 13, 16, 5); ell(x, '#ffd23a', 14, 8, 2, 2); R(x, '#6f472c', 6, 10, 2, 5); ell(x, '#3f8f3a', 7, 9, 3, 2.5);
  });
  def('mstallG', 52, 30, x => mstall(x, '#5fae4a', ['#5fae4a', '#8fd067', '#e2574c', '#f2a93b']));
  def('mstallB', 52, 30, x => mstall(x, '#3b82c4', ['#9fb6d6', '#5a8fc4', '#c9ccd4', '#d9a441']));
  def('mstallO', 52, 30, x => mstall(x, '#f2a93b', ['#fffaf0', '#e98f4a', '#c9862b', '#f4d35e']));
  def('mstallR', 52, 30, x => mstall(x, '#d9534f', ['#e2574c', '#ffd23a', '#b07ad6', '#fffaf0']));
  def('piano', 40, 26, x => { R(x, '#2a2136', 0, 0, 40, 20); R(x, '#3a3f55', 1, 1, 38, 6); R(x, '#fffaf0', 2, 9, 36, 7); for (let i = 4; i < 38; i += 4) R(x, '#2a2136', i, 9, 2, 4); R(x, '#2a2136', 2, 20, 3, 6); R(x, '#2a2136', 35, 20, 3, 6); });
  // gian hoạ cụ trong TTTM (cùng kiểu các gian khác)
  def('sh_hoacu_b', 54, 44, x => {
    R(x, shade('#f6e9f6', -22), 0, 0, 54, 44); R(x, '#f6e9f6', 1, 9, 52, 35); R(x, '#9a72d6', 0, 0, 54, 9); R(x, shade('#9a72d6', 28), 0, 0, 54, 1);
    for (let i = 0; i < 4; i++) { R(x, '#c9a467', 4 + i * 12, 14, 10, 12); R(x, '#fffaf0', 5 + i * 12, 15, 8, 10); R(x, ['#5fae4a', '#e2574c', '#3b82c4', '#f2a93b'][i], 6 + i * 12, 20, 6, 4); }
    R(x, '#8a5a3a', 8, 30, 2, 12); R(x, '#8a5a3a', 18, 30, 2, 12); R(x, '#fffaf0', 6, 28, 16, 8);
  });
  def('sh_hoacu_f', 54, 22, x => { R(x, shade('#9a72d6', 32), 0, 7, 54, 3); R(x, '#9a72d6', 0, 10, 54, 9); R(x, shade('#9a72d6', -25), 0, 19, 54, 3); for (let i = 0; i < 5; i++) R(x, ['#e2574c', '#ffd23a', '#5fae4a', '#3b82c4', '#fffaf0'][i], 6 + i * 10, 12, 6, 2); });
  // chó, mèo (2 khung đi bộ, quay trái thì lật)
  for (const k of ['dog', 'cat']) for (let f = 0; f < 2; f++) { def(`${k}${f}`, 16, 14, x => petDraw(x, k, f)); SPR[`${k}L${f}`] = flipH(SPR[`${k}${f}`]); }
}
function mstall(x, roof, goods) {
  for (let i = 0; i < 5; i++) R(x, i % 2 ? '#fffaf0' : roof, i * 10.4, 0, 10.4, 7); R(x, shade(roof, -30), 0, 7, 52, 2);
  R(x, '#8a5a3a', 2, 9, 2, 12); R(x, '#8a5a3a', 48, 9, 2, 12);
  R(x, '#a9703f', 0, 18, 52, 12); R(x, '#c58c56', 0, 18, 52, 2); R(x, '#6f472c', 0, 28, 52, 2);
  goods.forEach((c, i) => { R(x, '#6f472c', 3 + i * 12, 14, 10, 5); for (let j = 0; j < 3; j++) ell(x, c, 5.5 + i * 12 + j * 2.5, 13.5 - (j % 2), 1.8, 1.8); });
}
function petDraw(x, k, f) {
  const c = k === 'dog' ? '#c9862b' : '#e8a94a', d = shade(c, -28), l = shade(c, 25), o = f ? 1 : 0;
  R(x, c, 4, 6, 9, 5); R(x, l, 5, 6, 7, 1);                                                        // thân
  R(x, d, 4 + o, 11, 2, 3); R(x, d, 10 - o, 11, 2, 3);                                              // chân
  R(x, c, 0, 3, 6, 6); R(x, l, 1, 3, 4, 1);                                                         // đầu (quay trái)
  if (k === 'dog') { R(x, d, 0, 2, 2, 4); R(x, d, 5, 2, 2, 3); R(x, '#2a2136', 0, 6, 1, 1); } else { R(x, c, 0, 1, 2, 2); R(x, c, 4, 1, 2, 2); R(x, '#f5a79b', 0, 2, 1, 1); R(x, '#f5a79b', 5, 2, 1, 1); R(x, '#8fd067', 1, 5, 1, 1); R(x, '#8fd067', 4, 5, 1, 1); }
  R(x, '#2a2136', 2, 5, 1, 1);
  if (k === 'dog') { R(x, c, 13, 5 - o, 2, 2); } else { R(x, c, 13, 3, 1, 4); R(x, c, 14, 2 - o, 1, 2); }   // đuôi
}
// Chậu cây ngoài vườn theo giai đoạn: stage 0 mới gieo · 1 nảy mầm · 2 cây non · 3 ra hoa / chín quả · dead: héo · water: đất ẩm
function potKey(crop, stage, dead, wet) {
  const k = `pot:${crop || ''}:${stage}:${dead ? 1 : 0}:${wet ? 1 : 0}`;
  if (SPR[k]) return k;
  const c = mk(16, 22), x = cx(c), C = crop && CROPS[crop];
  if (C && !dead) {
    const g = '#3f8f3a', gl = '#5fae4a';
    if (stage >= 1) { R(x, g, 7, 10, 2, 6); R(x, gl, 5, 10, 2, 2); R(x, gl, 9, 11, 2, 2); }
    if (stage >= 2) { R(x, g, 7, 5, 2, 6); R(x, gl, 4, 6, 3, 2); R(x, gl, 9, 7, 3, 2); R(x, gl, 3, 9, 3, 2); R(x, gl, 10, 4, 3, 2); }
    if (stage >= 3) {
      if (C.kind === 'hoa') { const big = crop === 'huongduong'; ell(x, C.col, 8, big ? 3 : 4, big ? 4 : 3, big ? 4 : 3); ell(x, shade(C.col, 30), 7, 3, 1.4, 1.4); if (big) ell(x, '#6f472c', 8, 3, 1.6, 1.6); if (crop === 'cuc' || crop === 'hong') { ell(x, C.col, 4, 7, 2, 2); ell(x, C.col, 12, 6, 2, 2); } }
      else { for (const [a, b] of [[4, 8], [11, 6], [7, 4], [10, 10]].slice(0, C.yield >= 4 ? 4 : C.yield + 1)) { ell(x, C.col, a, b, 1.8, 1.8); R(x, shade(C.col, 35), a - 1, b - 1, 1, 1); } }
    }
  } else if (C && dead) { R(x, '#8a6a3a', 7, 8, 2, 8); R(x, '#a8853f', 4, 9, 3, 1); R(x, '#a8853f', 9, 11, 4, 1); R(x, '#6f5a3a', 5, 12, 2, 2); }
  R(x, '#a84530', 2, 15, 12, 7); R(x, '#c8583f', 1, 14, 14, 3); R(x, '#e07a5f', 2, 14, 12, 1); R(x, '#8a3a28', 3, 20, 10, 2);   // chậu đất nung
  R(x, wet ? '#4a3020' : '#6f472c', 2, 14, 12, 1);
  if (stage === 0 && C && !dead) { R(x, '#8a6a3a', 5, 13, 1, 1); R(x, '#8a6a3a', 9, 13, 1, 1); }
  SPR[k] = outline(c);
  return k;
}
// Icon thêm cho thanh đồ / cửa hàng (gọi từ itemIcon khi không có sẵn)
function extraIcon(id, x) {
  const fish = typeof FISH !== 'undefined' && FISH.find(f => f.id === id);
  if (fish) {                                                                 // cá: thân bầu dục, đuôi, vây, mắt
    const c = fish.col, d = shade(c, -30), l = shade(c, 30);
    if (id === 'muc') { ell(x, c, 9, 6, 4, 5); R(x, c, 5, 9, 8, 3); for (let i = 0; i < 4; i++) R(x, d, 5 + i * 2, 12, 1, 3); R(x, '#2a2136', 7, 7, 1, 1); R(x, '#2a2136', 10, 7, 1, 1); return true; }
    ell(x, c, 7, 8, 6, 3.5); R(x, l, 3, 6, 7, 1); R(x, d, 12, 5, 3, 7); R(x, c, 13, 6, 2, 5); R(x, d, 6, 4, 3, 2); R(x, '#2a2136', 3, 7, 1, 1); R(x, d, 2, 9, 2, 1);
    if (id === 'koi') { R(x, '#fffaf0', 6, 7, 3, 2); R(x, '#fffaf0', 9, 9, 2, 1); }
    return true;
  }
  if (id.startsWith('c_') && CROPS[id.slice(2)]) {                           // bông hoa / quả thu hoạch
    const C = CROPS[id.slice(2)];
    if (C.kind === 'hoa') { R(x, '#3f8f3a', 7, 7, 2, 8); R(x, '#5fae4a', 4, 10, 3, 2); ell(x, C.col, 8, 5, 4, 4); ell(x, shade(C.col, 30), 7, 4, 1.5, 1.5); if (id === 'c_huongduong') ell(x, '#6f472c', 8, 5, 2, 2); }
    else { for (const [a, b] of id === 'c_ot' ? [[5, 8], [10, 7]] : [[5, 9], [10, 9], [8, 5]]) { ell(x, C.col, a, b, id === 'c_ot' ? 1.6 : 3, id === 'c_ot' ? 4 : 3); R(x, '#3f8f3a', a, b - (id === 'c_ot' ? 5 : 4), 1, 2); R(x, shade(C.col, 40), a - 1, b - 1, 1, 1); } }
    return true;
  }
  if (id.startsWith('h_') && CROPS[id.slice(2)]) { const C = CROPS[id.slice(2)]; R(x, '#e8d6b0', 3, 2, 10, 13); R(x, '#c9a467', 3, 2, 10, 2); ell(x, C.col, 8, 9, 3, 3); R(x, '#3f8f3a', 7, 11, 2, 3); R(x, '#6f472c', 5, 14, 6, 1); return true; }   // gói hạt giống
  if (id === 'chau') { R(x, '#a84530', 3, 7, 10, 8); R(x, '#c8583f', 2, 5, 12, 3); R(x, '#e07a5f', 3, 5, 10, 1); R(x, '#6f472c', 3, 5, 10, 1); return true; }
  if (id === 'thung') { R(x, '#6f472c', 1, 5, 14, 10); R(x, '#a9703f', 2, 6, 12, 8); R(x, '#8a5a3a', 1, 2, 14, 4); R(x, '#ffd23a', 7, 5, 2, 3); return true; }
  if (id === 'binhtuoi') { R(x, '#5fae4a', 3, 6, 8, 7); R(x, '#8fd067', 3, 6, 8, 2); R(x, '#3f8f3a', 11, 5, 4, 2); R(x, '#3f8f3a', 14, 3, 1, 3); R(x, '#3f8f3a', 4, 3, 6, 1); R(x, '#3f8f3a', 4, 3, 1, 3); R(x, '#3f8f3a', 9, 3, 1, 3); return true; }
  if (id === 'giayve') { R(x, '#fffaf0', 2, 2, 12, 12); R(x, '#e3ddd0', 2, 12, 12, 2); R(x, '#cfe8f7', 4, 4, 8, 4); R(x, '#8fd067', 4, 8, 8, 3); R(x, '#e2574c', 11, 1, 2, 9); R(x, '#ffd23a', 11, 0, 2, 1); return true; }
  if (id === 'khungtranh') { R(x, '#8a5a3a', 3, 8, 2, 8); R(x, '#8a5a3a', 11, 8, 2, 8); R(x, '#c9a467', 1, 1, 14, 10); R(x, '#fffaf0', 2, 2, 12, 8); R(x, '#cfe8f7', 2, 2, 12, 4); R(x, '#5fae4a', 2, 7, 12, 3); return true; }
  if (/^tranh[1-5]$/.test(id)) {                                             // tranh đã vẽ: khung càng đẹp khi tranh càng giá trị
    const t = +id[5], fr = ['#8a5a3a', '#a9703f', '#c9a467', '#d9b23a', '#ffd23a'][t - 1];
    R(x, fr, 1, 2, 14, 12); R(x, '#fffaf0', 2, 3, 12, 10); R(x, '#9cc8e6', 2, 3, 12, 5); R(x, '#5fae4a', 2, 8, 12, 5);
    if (t >= 2) ell(x, '#ffd23a', 11, 5, 1.6, 1.6); if (t >= 3) { R(x, '#6f472c', 5, 6, 1, 4); ell(x, '#3f8f3a', 5, 6, 2, 2); } if (t >= 4) { R(x, '#e2574c', 9, 9, 2, 2); R(x, '#ffd23a', 4, 10, 2, 1); } if (t >= 5) { R(x, '#fff6c8', 1, 2, 14, 1); R(x, '#fffaf0', 0, 1, 1, 1); R(x, '#fffaf0', 15, 13, 1, 1); }
    return true;
  }
  if (id === 'moi') { R(x, '#c9a467', 3, 5, 10, 9); R(x, '#a8853f', 3, 5, 10, 2); for (let i = 0; i < 3; i++) R(x, '#e98fa5', 5 + i * 3, 8 + (i % 2), 2, 3); return true; }
  if (id === 'cancau' || id === 'cancau2') { const c = id === 'cancau2' ? '#d9534f' : '#8a5a3a'; for (let i = 0; i < 12; i++) R(x, c, 2 + i, 13 - i, 1, 1); R(x, '#cfe8f7', 13, 2, 1, 10); R(x, '#5f656f', 4, 10, 3, 3); return true; }
  if (id === 'rau') { for (let i = 0; i < 4; i++) { R(x, '#3f8f3a', 4 + i * 2, 4, 2, 10); ell(x, '#5fae4a', 5 + i * 2, 4, 2, 3); } R(x, '#d9c690', 3, 10, 10, 2); return true; }
  if (id === 'banhcuon') { ell(x, '#fffaf0', 8, 10, 6, 3); R(x, '#f4ead2', 3, 8, 10, 3); R(x, '#c98f5a', 5, 8, 6, 1); R(x, '#5fae4a', 10, 7, 2, 1); return true; }
  if (id === 'nuocdua') { ell(x, '#5fae4a', 8, 10, 5, 5); ell(x, '#8fd067', 8, 7, 4, 2); R(x, '#fffaf0', 9, 1, 1, 6); R(x, '#e2574c', 9, 1, 3, 1); return true; }
  if (id === 'p_dog' || id === 'p_cat') { x.drawImage(SPR[id === 'p_dog' ? 'dog0' : 'cat0'], 0, 1); return true; }
  if (id === 'goi_ve' || id === 'goi_hat') { R(x, '#fffaf0', 2, 2, 12, 12); R(x, id === 'goi_ve' ? '#9a72d6' : '#e98fa5', 2, 2, 12, 4); if (id === 'goi_ve') { R(x, '#e2574c', 5, 8, 3, 3); R(x, '#3b82c4', 8, 9, 3, 3); } else { R(x, '#2a2136', 8, 7, 1, 5); ell(x, '#2a2136', 7, 12, 1.6, 1.2); R(x, '#2a2136', 8, 7, 3, 1); } return true; }
  return false;
}
