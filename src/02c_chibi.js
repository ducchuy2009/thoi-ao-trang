'use strict';
/* ============================================================
 *  02c. NHÂN VẬT CHIBI — vẽ bằng code theo phong cách bản thảo (art/chars):
 *  đầu to, mắt to có điểm sáng, má hồng, viền tối, da ngăm · nam sơ mi trắng + khăn quàng đỏ · nữ áo dài trắng có tà
 *  Khung 24×33 điểm ảnh (cùng cỡ điểm ảnh với bản đồ, viền thêm 1 điểm mỗi bên), chân ở hàng cuối.
 *  Hướng: 0 xuống · 1 trái · 2 phải (lật từ trái) · 3 lên. Khung: xuống / lên 3 khung (đứng, bước trái, bước phải),
 *  ngang 4 khung (bước – đứng – bước – đứng, tay vung theo), dáng ngồi xe: 'rideB' đạp xe (2 khung đạp), 'rideM' xe máy / ngồi sau.
 *  Mỗi nhân vật là một bộ tham số (CHIBI, hoặc tự đổi từ LOOKS cũ — chibiSpec).
 * ============================================================ */
const CHW = 24, CHH = 33, INK = '#2a2136';
const SKIN = '#e9a978', SHIRT = '#f6f4ee', PANTS = '#2b2a38', SHOE = '#1f1a26', SCARF = '#d8403a';
// đầu (nhìn xuống / lên): [x đầu, x cuối] theo từng hàng, đỉnh đầu ở hàng HY
const HY = 3, HEAD = [[8, 15], [6, 17], [5, 18], [4, 19], [4, 19], [4, 19], [4, 19], [4, 19], [4, 19], [4, 19], [4, 19], [5, 18], [6, 17], [8, 15]];
// đầu nhìn ngang (quay trái): mặt bên trái, gáy bên phải
const HEADS = [[8, 14], [6, 16], [5, 17], [4, 18], [4, 18], [4, 18], [4, 18], [4, 18], [4, 18], [4, 18], [4, 18], [5, 17], [6, 16], [8, 14]];

/* ---------- bộ tham số từng nhân vật ----------
 * hair: kiểu tóc · hc: màu tóc · skin · eye: 'smile' (mắt cười) · iris · dress: 'uni' (sơ mi + quần) | 'aodai' | 'shirt' | 'blouse' | 'tee' | 'robe' | 'coat'
 * shirt, pants, scarf (khăn quàng), tie, bag (màu cặp), bagT: 'back' | 'shoulder', glasses (màu gọng, round), band (bờm), bow (nơ), clip (kẹp),
 * cap (mũ lưỡi trai: hướng 'back' | 'front'), sun (kính râm cài đầu), phones (tai nghe), bandage (băng cá nhân), jacket, apron, mustache, conical (nón lá), old (tóc bạc) */
const CHIBI = {
  boy: { hair: 'spiky', hc: '#1f3346', dress: 'uni', scarf: true, bag: '#c8553d' },
  girl: { hair: 'bob', hc: '#5a3326', dress: 'aodai', band: '#7a4fa0', clip: '#ffd23a', bag: '#c98a4a', bagT: 'shoulder' },
  vy: { hair: 'long', hc: '#6b3f28', wave: true, dress: 'aodai', bow: '#f07aa8', bag: '#f07aa8', bagT: 'shoulder' },
  quang: { hair: 'neat', hc: '#1d3a40', dress: 'uni', tie: '#b23b3b', glasses: '#2a2136', bag: '#2f5d4f' },
  hoang: { hair: 'undercut', hc: '#d0632a', dress: 'uni', open: true, bandage: true, bag: '#5b4a36', bagT: 'shoulder' },
  phong: { hair: 'shaggy', hc: '#1f1f29', dress: 'uni', scarf: true, bag: '#3f6b3a' },
  ngan: { hair: 'pony', hc: '#6b4029', dress: 'aodai', bag: '#2f3f63' },
  hien: { hair: 'braids', hc: '#1c1a22', dress: 'aodai', tie2: '#d8403a', bag: '#8a5a3a', bagT: 'shoulder' },
  dat: { hair: 'cap', hc: '#1f1f29', cap: '#24324a', capDir: 'back', dress: 'uni', scarf: true, chub: true, bag: '#3f6b3a' },
  hoa: { hair: 'bun', hc: '#1c1a22', dress: 'aodai', glasses: '#2a2136', round: true, bag: '#2f4a6b' },
  minhanh: { hair: 'wavy', hc: '#6b4029', dress: 'aodai', clip: '#8fd067', chub: true, bag: '#2f4a6b' },
  thao: { hair: 'long', hc: '#5a3a26', wave: true, dress: 'aodai', bow: '#7fb8e8', bowS: true, bag: '#d9c690', bagT: 'shoulder' },
  namanh: { hair: 'sweep', hc: '#4a2f22', dress: 'uni', scarf: true, sun: true, bag: '#2a2a32' },
  vu: { hair: 'neat', hc: '#1c2230', dress: 'uni', scarf: true, bag: '#2a2a32' },
  duc: { hair: 'buzz', hc: '#2a2a33', dress: 'uni', scarf: true, skin: '#c9875a', bag: '#2a2a32' },
  duyen: { hair: 'messy', hc: '#5a3a26', dress: 'aodai', clip: '#f07aa8', bag: '#2f3a32', bagT: 'shoulder' },
  phuong: { hair: 'long', hc: '#6b4029', dress: 'aodai', clip: '#7fb8e8', low: true, bag: '#2f3a32', bagT: 'shoulder' },
  thai: { hair: 'curly', hc: '#1a1a22', dress: 'uni', jacket: '#36507a', phones: '#d8403a', bag: '#3a3a44', bagT: 'shoulder' },
};
// mã look trong game → nhân vật chibi: bạn cùng bàn (khoa) là Đạt nếu nhân vật chính là nam, Duyên nếu là nữ; Thái giữ mã 'dat'
const ART = { khoa: () => (isGirlMain() ? 'duyen' : 'dat'), c10: () => (isGirlMain() ? 'dat' : 'duyen'), dat: 'thai', datA: 'dat', sC: 'phong', c1: 'quang', c2: 'thao', c3: 'duc', c4: 'minhanh', c5: 'vu', c6: 'hoa', c7: 'namanh', c8: 'phuong', c9: 'hien' };
const isGirlMain = () => typeof G !== 'undefined' && !!G && G.gender === 'girl';
const artOf = key => { const a = ART[key]; return typeof a === 'function' ? a() : a || key; };
// đổi bộ tham số LOOKS cũ (thầy cô, bố mẹ, học sinh lớp khác, anh chị khoá trên, người ngoài xã hội) sang chibi
const OLD_HAIR = { short: 'short', spiky: 'spiky', buzz: 'buzz', side: 'neat', curly: 'curly', bowl: 'bowl', long: 'long', pony: 'pony', bun: 'bun', bob: 'bob', twin: 'twin' };
function chibiSpec(key, outfit) {
  const a = artOf(key);
  let S;
  if (CHIBI[a]) S = Object.assign({}, CHIBI[a]);
  else {
    const L = LOOKS[key] || LOOKS.boy, student = L.badge !== undefined || L.shirt === UNI.shirt;
    const girlish = !!(L.skirt || L.aodai);
    S = { hair: (L.style === 'curly' && !girlish ? 'shaggy' : OLD_HAIR[L.style]) || 'short', hc: L.hair || '#2c2733', skin: L.skin, eye: L.eye === 'smile' ? 'smile' : null, glasses: L.glasses ? (L.glassCol || '#8d93a6') : null, round: L.glasses === 'round',
      dress: L.aodai ? 'aodai' : L.skirt ? 'aodai' : student ? 'uni' : L.apron ? 'blouse' : 'shirt', shirt: L.shirt, pants: L.pants, tie: L.tie, mustache: L.mustache, earring: L.earring, clip: L.clip,
      band: L.band, badge: L.badge, cap: L.cap, capDir: L.cap ? 'front' : null, apron: L.apron, scarf: student && !L.skirt && !L.aodai, bag: student ? ['#3f6b3a', '#2f4a6b', '#8a5a3a', '#5b3d63', '#2a2a32'][key.charCodeAt(key.length - 1) % 5] : null, adult: !student };
    if (key === 'monk') Object.assign(S, { hair: 'bald', dress: 'robe' });
    if (key === 'doctor') Object.assign(S, { dress: 'coat' });
    if (key === 'vendor') Object.assign(S, { conical: true });
    if (key === 'principal' || key === 'bac_tu') S.old = true;
  }
  const O = outfit && OUTFITS[outfit];
  if (O) {
    if (O.shirt) { S.dress = 'tee'; S.shirt = O.shirt; S.pants = O.pants || S.pants || PANTS; S.scarf = false; S.tie = null; S.open = false; S.jacket = null; S.stripe = O.stripe || null; }
    if (O.cap) { S.cap = O.cap; S.capDir = 'front'; S.mil = true; }
    if ('apron' in O && O.apron === null) S.apron = null;
    if ('tie' in O && O.tie === null) S.tie = null;
    if (O.badge === null) S.badge = null;
  }
  if (typeof isWinter === 'function' && isWinter() && !S.adult && !O && S.dress !== 'robe') S.jacket = S.jacket || (S.dress === 'aodai' ? '#e7d2a8' : '#34466e');   // mùa đông: áo khoác
  return S;
}

/* ---------- bảng màu ---------- */
function chPal(S) {
  const sk = S.skin || SKIN, hc = S.old ? '#c9ccd4' : S.hc || '#2c2733';
  const sh = S.dress === 'aodai' ? S.shirt || SHIRT : S.dress === 'robe' ? '#d98a2b' : S.dress === 'coat' ? '#fbfdff' : S.shirt || SHIRT;
  return { sk, skS: shade(sk, -22), skL: shade(sk, 14), hc, hcS: shade(hc, -28), hcL: shade(hc, 30), sh, shS: shade(sh, -18), shL: shade(sh, 10), pt: S.pants || (S.dress === 'aodai' ? '#ecebf2' : PANTS), ptS: shade(S.pants || PANTS, -16) };
}

/* ---------- vẽ một khung ---------- */
function chibiFrame(S, dir, fr, pose) {
  const c = mk(CHW, CHH), x = cx(c), P = chPal(S);
  const r = (col, a, b, w, h) => R(x, col, a, b, w === undefined ? 1 : w, h === undefined ? 1 : h);
  const span = (y, a, b, col) => { if (b >= a) r(col, a, y, b - a + 1, 1); };
  const ctx2 = { x, r, span, S, P };
  if (pose === 'rideB' || pose === 'rideM') drawRide(ctx2, pose, fr);
  else if (dir === 1) drawSide(ctx2, fr);
  else drawFront(ctx2, dir === 3, fr);
  const o = outline(c, INK); o.hi = 1; o.foot = CHH;                      // sau khi viền: chân ở hàng 33 (hàng 34 là viền)
  return o;
}

/* ---------- nhìn xuống / quay lưng ---------- */
function drawFront(C, back, fr) {
  const { r, span, S, P } = C, chub = S.chub ? 1 : 0, L0 = 7 - chub, R0 = 16 + chub;   // thân rộng hơn một chút nếu tròn trịa
  const lu = fr === 1 ? 1 : 0, ru = fr === 2 ? 1 : 0;                     // bước chân: nhấc chân trái / phải
  // chân + giày
  if (S.dress === 'aodai') {
    r(P.pt, 8, 29 - lu, 3, 2); r(P.pt, 13, 29 - ru, 3, 2);
    r(SHOE, 8, 31 - lu, 3, 2); r(SHOE, 13, 31 - ru, 3, 2); r('#4a4458', 8, 31 - lu, 1, 1); r('#4a4458', 13, 31 - ru, 1, 1);
  } else if (S.dress === 'robe') {
    r(SHOE, 8, 31 - lu, 3, 2); r(SHOE, 13, 31 - ru, 3, 2);
  } else {
    r(P.pt, 8, 24, 4, 7 - lu); r(P.pt, 12, 24, 4, 7 - ru); r(P.ptS, 11, 25, 1, 5); r(P.ptS, 12, 25, 1, 5);
    r(SHOE, 7, 31 - lu, 5, 2); r(SHOE, 12, 31 - ru, 5, 2); r('#4a4458', 8, 31 - lu, 2, 1); r('#4a4458', 13, 31 - ru, 2, 1);
  }
  // thân áo
  const top = 17;
  if (S.dress === 'aodai') {
    r(P.sh, L0, top, R0 - L0 + 1, 7);                                     // thân trên áo dài
    const sway = fr === 1 ? -1 : fr === 2 ? 1 : 0;
    r(P.sh, L0 + sway, 24, R0 - L0 + 1, 5); r(P.shS, L0 + sway, 24, 1, 5); r(P.shS, R0 + sway, 24, 1, 5);   // hai tà áo
    r(P.shS, 10 + sway, 24, 1, 5); r(P.shS, 13 + sway, 24, 1, 5);          // đường xẻ tà
    r(P.shS, L0, top, 1, 7); r(P.shS, R0, top, 1, 7);
    if (!back) { r(P.shS, 11, top, 2, 1); r(P.shL, 9, top + 1, 1, 4); }      // cổ áo
  } else if (S.dress === 'robe') {
    r(P.sh, L0, top, R0 - L0 + 1, 14); r(P.shS, L0, top, 1, 14); r(P.shS, R0, top, 1, 14); if (!back) r(P.shS, 10, top, 4, 6);
  } else if (S.dress === 'coat') {
    r(P.sh, L0, top, R0 - L0 + 1, 10); r(P.shS, L0, top, 1, 10); r(P.shS, R0, top, 1, 10); if (!back) { r('#9fd6c4', 10, top, 4, 7); r(P.shS, 11, top + 2, 2, 7); }
  } else {
    r(P.sh, L0, top, R0 - L0 + 1, 7); r(P.shS, L0, top, 1, 7); r(P.shS, R0, top, 1, 7); r(P.shL, L0 + 1, top + 1, 1, 4);
    if (S.stripe) { r(S.stripe, L0, top + 2, R0 - L0 + 1, 1); }
    if (!back) {
      if (S.dress === 'uni' || S.dress === 'shirt') { r(P.shS, 9, top, 2, 1); r(P.shS, 13, top, 2, 1); r(P.shS, 11, top + 1, 2, 5); }   // cổ áo + nẹp
      if (S.scarf) { r(SCARF, 10, top, 4, 1); r(SCARF, 11, top + 1, 2, 1); r(SCARF, 10, top + 2, 2, 2); r(SCARF, 12, top + 2, 2, 3); r(shade(SCARF, -25), 11, top + 1, 2, 1); }   // khăn quàng đỏ
      else if (S.tie) { r(S.tie, 11, top, 2, 6); r(shade(S.tie, -25), 11, top, 2, 1); }
      if (S.badge) r(S.badge, 14, top + 1, 1, 1);
      if (S.open) { r(P.shS, 11, top, 2, 1); r(P.sk, 11, top, 2, 2); }      // cổ áo phanh (đầu gấu)
    }
    if (S.dress === 'uni' || S.dress === 'shirt' || S.dress === 'tee') r(P.ptS, L0, top + 7, R0 - L0 + 1, 1);   // thắt lưng
  }
  if (S.apron) { r(S.apron, 9, top + 2, 6, 9); r(shade(S.apron, -14), 9, top + 2, 6, 1); }
  if (S.jacket) { r(S.jacket, L0, top, 3, 8); r(S.jacket, R0 - 2, top, 3, 8); if (back) r(S.jacket, L0, top, R0 - L0 + 1, 8); r(shade(S.jacket, -20), L0, top, 1, 8); r(shade(S.jacket, -20), R0, top, 1, 8); }
  // cặp sách sau lưng (quay lưng) / quai đeo (nhìn xuống)
  if (S.bag) {
    if (back && S.bagT !== 'shoulder') { r(S.bag, 8, top + 1, 8, 7); r(shade(S.bag, 22), 8, top + 1, 8, 1); r(shade(S.bag, -25), 8, top + 3, 8, 1); r(shade(S.bag, -15), 10, top + 5, 4, 2); r('#ffd23a', 11, top + 4, 2, 1); }
    else if (back) { for (let i = 0; i < 6; i++) r(shade(S.bag, -10), L0 + 1 + i, top + i, 1, 1); r(S.bag, R0 - 2, top + 5, 4, 4); r(shade(S.bag, -25), R0 - 2, top + 5, 4, 1); }
    else if (S.bagT === 'shoulder') { for (let i = 0; i < 7; i++) r(shade(S.bag, -10), R0 - 1 - i, top + i, 1, 1); r(S.bag, L0 - 2, top + 6, 3, 4); }
    else { r(shade(S.bag, -10), L0 + 1, top, 1, 4); r(shade(S.bag, -10), R0 - 1, top, 1, 4); }
  }
  // tay: tay áo + bàn tay, vung nhẹ khi bước
  const la = fr === 1 ? -1 : fr === 2 ? 1 : 0, sleeve = S.jacket || P.sh, sleeveS = S.jacket ? shade(S.jacket, -20) : P.shS, long = S.dress === 'aodai' || S.jacket || S.dress === 'coat' || S.dress === 'robe';
  for (const [ax, d] of [[L0 - 2, la], [R0 + 1, -la]]) {
    r(sleeve, ax, top + 1, 2, long ? 5 : 3); r(sleeveS, ax, top + 1, 2, 1);
    if (!long) r(P.sk, ax, top + 4, 2, 2);
    r(P.sk, ax, top + 6 + d, 2, 2); r(P.skS, ax, top + 7 + d, 2, 1);
  }
  // đầu
  drawHeadFB(C, back);
}
function drawHeadFB(C, back) {
  const { r, span, S, P } = C;
  for (let i = 0; i < HEAD.length; i++) span(HY + i, HEAD[i][0], HEAD[i][1], back ? P.hc : P.sk);
  if (!back) { span(HY + 12, 6, 17, P.skS); span(HY + 13, 8, 15, P.skS); }   // bóng dưới cằm
  // tai (tóc ngắn)
  const short = ['spiky', 'short', 'buzz', 'neat', 'undercut', 'cap', 'shaggy', 'sweep', 'bald', 'bowl', 'curly'].includes(S.hair);
  if (short && S.hair !== 'curly') { r(P.sk, 3, HY + 7, 1, 3); r(P.sk, 20, HY + 7, 1, 3); r(P.skS, 3, HY + 9, 1, 1); r(P.skS, 20, HY + 9, 1, 1); }
  HAIR[S.hair] ? HAIR[S.hair](C, back ? 'b' : 'f') : HAIR.short(C, back ? 'b' : 'f');
  if (!back) drawFace(C);
  drawHeadwear(C, back ? 'b' : 'f');
}
function drawFace(C) {
  const { r, S, P } = C, y = HY + 6, iris = S.iris || '#3d2333', irisL = S.irisL || '#9b4a5e', girl = S.dress === 'aodai';
  if (S.eye === 'smile') { for (const e of [7, 14]) { r(INK, e, y + 2, 1, 1); r(INK, e + 1, y + 1, 1, 1); r(INK, e + 2, y + 2, 1, 1); } }
  else for (const e of [7, 14]) {                                                   // mắt to: mi trên đậm, tròng mắt sẫm, điểm sáng trắng, đáy mắt sáng hơn
    r(INK, e, y, 3, 1); r(iris, e, y + 1, 3, 2); r(irisL, e, y + 3, 3, 1); r('#ffffff', e, y + 1, 1, 1); r(shade(irisL, 25), e + 1, y + 3, 1, 1);
    if (girl) r(INK, e === 7 ? e - 1 : e + 3, y, 1, 1);                              // mi cong (nữ)
  }
  r('#f08a7e', 6, y + 4, 2, 1); r('#f08a7e', 16, y + 4, 2, 1);                       // má hồng
  r(S.chub ? '#a8443c' : '#9c3f38', 11, y + 5, 2, 1);                                // miệng
  if (S.mustache) r(shade(P.hc, -10), 9, y + 5, 6, 1);
  if (S.bandage) { r('#f2dcc0', 15, y + 4, 3, 1); r('#e8c9a6', 16, y + 4, 1, 1); }      // băng cá nhân trên má
  if (S.earring) { r(S.earring, 3, y + 4, 1, 1); r(S.earring, 20, y + 4, 1, 1); }
  if (S.glasses) {                                                                   // kính cận: gọng mảnh, mắt kính trong (ánh xanh nhạt)
    const g = S.glasses;
    for (const e of [6, 13]) { r('rgba(200,230,255,0.35)', e + 1, y, 3, 4); r(g, e + 1, y - 1, 3, 1); r(g, e + 1, y + 4, 3, 1); if (!S.round) { r(g, e, y - 1, 1, 6); r(g, e + 4, y - 1, 1, 6); } else { r(g, e, y, 1, 4); r(g, e + 4, y, 1, 4); } r('rgba(255,255,255,0.7)', e + 3, y, 1, 1); }
    r(g, 11, y + 1, 2, 1);
  }
}

/* ---------- nhìn ngang (quay trái; quay phải thì lật) ---------- */
function drawSide(C, fr) {
  const { r, S, P } = C, top = 17, chub = S.chub ? 1 : 0;
  // 4 khung: 0 bước (chân trước ra trước), 1 đứng, 2 bước (chân kia), 3 đứng — tay vung ngược chân
  const step = fr === 0 || fr === 2, arm = fr === 0 ? -2 : fr === 2 ? 2 : 0;
  // chân
  if (S.dress === 'aodai') {
    if (step) { r(P.pt, 8, 29, 3, 2); r(P.pt, 13, 29, 3, 2); r(SHOE, 6, 31, 4, 2); r(SHOE, 13, 31, 4, 2); }
    else { r(P.pt, 10, 29, 4, 2); r(SHOE, 8, 31, 5, 2); }
  } else if (S.dress !== 'robe') {
    const far = shade(P.pt, -14);
    if (step) {
      for (let i = 0; i < 7; i++) { r(far, 12 + Math.floor(i * 0.5), 24 + i, 3, 1); r(P.pt, 10 - Math.floor(i * 0.5), 24 + i, 3, 1); }   // chân sau / chân trước choãi ra
      r(SHOE, 5, 31, 5, 2); r(SHOE, 14, 31, 4, 2); r('#4a4458', 5, 31, 2, 1);
    } else { r(far, 11, 24, 3, 7); r(P.pt, 10, 24, 3, 7); r(SHOE, 8, 31, 6, 2); r('#4a4458', 8, 31, 2, 1); }
  } else { r(SHOE, 8, 31, 6, 2); }
  // cặp sau lưng
  if (S.bag && S.bagT !== 'shoulder') { r(S.bag, 15, top + 1, 4, 7); r(shade(S.bag, 22), 15, top + 1, 4, 1); r(shade(S.bag, -25), 18, top + 1, 1, 7); }
  // thân
  if (S.dress === 'aodai') {
    r(P.sh, 9, top, 7, 7); r(P.shS, 15, top, 1, 7);
    const fl = step ? 2 : 1;                                                 // tà sau bay ra phía sau khi bước
    r(P.sh, 9, 24, 5, 5); r(P.sh, 13, 24, 2 + fl, 5); r(P.shS, 14 + fl, 25, 1, 4); r(P.shS, 13, 24, 1, 5);
  } else if (S.dress === 'robe') { r(P.sh, 8, top, 8, 14); r(P.shS, 15, top, 1, 14); }
  else if (S.dress === 'coat') { r(P.sh, 9 - chub, top, 7 + chub, 10); r(P.shS, 15, top, 1, 10); }
  else {
    r(P.sh, 9 - chub, top, 7 + chub, 7); r(P.shS, 15, top, 1, 7); r(P.shL, 9 - chub, top + 1, 1, 4);
    if (S.stripe) r(S.stripe, 9 - chub, top + 2, 7 + chub, 1);
    if (S.scarf) { r(SCARF, 8 - chub, top, 3, 1); r(SCARF, 8 - chub, top + 1, 2, 2); }
    else if (S.tie) r(S.tie, 9 - chub, top, 1, 5);
    r(P.ptS, 9 - chub, top + 7, 7 + chub, 1);
  }
  if (S.apron) r(S.apron, 8, top + 2, 3, 9);
  if (S.jacket) { r(S.jacket, 10, top, 6, 8); r(shade(S.jacket, -20), 15, top, 1, 8); }
  if (S.bag && S.bagT === 'shoulder') { r(shade(S.bag, -10), 11, top, 1, 6); r(S.bag, 13, top + 5, 4, 4); r(shade(S.bag, -25), 13, top + 5, 4, 1); }
  // tay gần (vung theo bước chân)
  const long = S.dress === 'aodai' || S.jacket || S.dress === 'coat' || S.dress === 'robe', sl = S.jacket || P.sh;
  r(sl, 11, top + 1, 3, long ? 5 : 3); r(shade(sl, -16), 11, top + 1, 3, 1);
  const hx = 11 + arm;
  if (!long) r(P.sk, 11 + Math.sign(arm), top + 4, 3, 2);
  r(sl, 11 + Math.round(arm / 2), top + 3, 3, 2);
  r(P.sk, hx, top + 6, 3, 2); r(P.skS, hx, top + 7, 3, 1);
  drawHeadS(C);
}
function drawHeadS(C, dx, dy) {
  const { r, span, S, P } = C, ox = dx || 0, oy = dy || 0;
  for (let i = 0; i < HEADS.length; i++) span(HY + i + oy, HEADS[i][0] + ox, HEADS[i][1] + ox, P.sk);
  span(HY + 12 + oy, 5 + ox, 13 + ox, P.skS); span(HY + 13 + oy, 8 + ox, 13 + ox, P.skS);
  const short = ['spiky', 'short', 'buzz', 'neat', 'undercut', 'cap', 'shaggy', 'sweep', 'bald', 'bowl'].includes(S.hair);
  if (short) { r(P.sk, 12 + ox, HY + 7 + oy, 2, 3); r(P.skS, 13 + ox, HY + 8 + oy, 1, 1); }          // tai
  C.ox = ox; C.oy = oy;
  HAIR[S.hair] ? HAIR[S.hair](C, 's') : HAIR.short(C, 's');
  // mặt nghiêng: một mắt, má, miệng, mũi nhô
  const y = HY + 6 + oy, ex = 5 + ox, iris = S.iris || '#3d2333', irisL = S.irisL || '#9b4a5e';
  if (S.eye === 'smile') { r(INK, ex, y + 2, 1, 1); r(INK, ex + 1, y + 1, 1, 1); r(INK, ex + 2, y + 2, 1, 1); }
  else { r(INK, ex, y, 3, 1); r(iris, ex, y + 1, 2, 2); r(irisL, ex, y + 3, 2, 1); r('#ffffff', ex, y + 1, 1, 1); if (S.dress === 'aodai') r(INK, ex - 1, y, 1, 1); }
  r('#f08a7e', ex + 1, y + 4, 2, 1); r('#9c3f38', 4 + ox, y + 5, 2, 1);
  if (S.bandage) r('#f2dcc0', ex + 1, y + 4, 2, 1);
  if (S.mustache) r(shade(P.hc, -10), 3 + ox, y + 5, 3, 1);
  if (S.glasses) { const g = S.glasses; r('rgba(200,230,255,0.35)', ex, y, 3, 4); r(g, ex - 1, y - 1, 5, 1); r(g, ex - 1, y + 4, 5, 1); r(g, ex - 1, y, 1, 4); r(g, ex + 3, y + 1, 6, 1); }
  drawHeadwear(C, 's');
  C.ox = 0; C.oy = 0;
}

/* ---------- dáng ngồi xe (quay trái): 'rideB' đạp xe (2 khung), 'rideM' xe máy / ngồi sau ---------- */
// điểm tựa: hông ở (12, 22) trong khung — drawRider đặt hông vào yên xe
function drawRide(C, pose, fr) {
  const { r, S, P } = C, top = 15;
  // chân: đùi đưa ra trước, cẳng chân xuống bàn đạp
  const pt = S.dress === 'aodai' ? P.pt : P.pt, far = shade(pt, -14);
  if (pose === 'rideB') {
    const a = fr ? 1 : 0;
    r(far, 9, 23, 5, 2); r(far, 9 - a, 25, 2, 5 - a); r(SHOE, 7 - a, 30 - a, 4, 2);          // chân xa
    r(pt, 8, 22, 6, 2); r(pt, 8 + a - 1, 24, 2, 4 + a); r(SHOE, 6 + a, 28 + a, 4, 2);          // chân gần
  } else {
    r(far, 8, 23, 6, 2); r(far, 8, 25, 2, 4); r(SHOE, 6, 28, 4, 2);
    r(pt, 7, 22, 7, 2); r(pt, 7, 24, 2, 4); r(SHOE, 5, 27, 4, 2);
  }
  // thân ngả về trước
  if (S.dress === 'aodai') { r(P.sh, 10, top, 6, 8); r(P.sh, 13, 22, 4, 4); r(P.shS, 16, 22, 1, 4); r(P.sh, 7, 21, 5, 2); }
  else { r(P.sh, 10, top, 6, 8); r(P.shS, 15, top, 1, 8); if (S.scarf) { r(SCARF, 9, top, 3, 1); r(SCARF, 9, top + 1, 2, 2); } else if (S.tie) r(S.tie, 10, top, 1, 5); r(P.ptS, 10, top + 7, 6, 1); }
  if (S.jacket) { r(S.jacket, 11, top, 5, 8); }
  if (S.bag && S.bagT !== 'shoulder') { r(S.bag, 16, top + 1, 3, 6); r(shade(S.bag, -25), 18, top + 1, 1, 6); }
  // tay với ra phía trước cầm tay lái
  const sl = S.jacket || P.sh;
  r(sl, 8, top + 2, 4, 2); r(sl, 6, top + 3, 3, 2); r(P.sk, 4, top + 4, 3, 2); r(P.skS, 4, top + 5, 3, 1);
  drawHeadS(C, 1, -2);
}

/* ---------- mũ, nón, kính râm, tai nghe ---------- */
function drawHeadwear(C, v) {
  const { r, S, P } = C, ox = C.ox || 0, oy = C.oy || 0, Y = HY + oy;
  if (S.band) {                                                             // bờm tóc
    if (v === 'f' || v === 'b') { r(S.band, 5, Y + 2, 14, 1); r(shade(S.band, 25), 7, Y + 2, 4, 1); }
    else r(S.band, 5 + ox, Y + 2, 10, 1);
  }
  if (S.bow) {                                                              // nơ: to (Vy) cài đỉnh đầu bên trái · nhỏ (Thảo) cài bên tai
    const b = S.bow, bs = shade(b, -28), sm = S.bowS;
    if (v === 'f') { const bx = 2, by = sm ? Y + 5 : Y - 2; r(b, bx, by, 3, 3); r(b, bx + 4, by, 3, 3); r(bs, bx + 3, by + 1, 1, 1); r(shade(b, 30), bx, by, 1, 1); if (!sm) { r(b, bx + 1, by + 3, 2, 1); r(b, bx + 4, by + 3, 2, 1); } }
    else if (v === 'b') { const by = sm ? Y + 6 : Y + 1; r(b, 7, by, 4, 3); r(b, 13, by, 4, 3); r(bs, 11, by + 1, 2, 1); if (!sm) { r(b, 8, by + 3, 2, 2); r(b, 14, by + 3, 2, 2); } }
    else { const by = sm ? Y + 6 : Y; r(b, 13 + ox, by, 3, 3); r(b, 17 + ox, by, 3, 3); r(bs, 16 + ox, by + 1, 1, 1); }
  }
  if (S.clip) {                                                             // kẹp tóc
    if (v === 'f') { r(S.clip, 15, Y + 3, 3, 1); r(shade(S.clip, 30), 15, Y + 3, 1, 1); }
    else if (v === 's') r(S.clip, 9 + ox, Y + 3, 3, 1);
  }
  if (S.cap && S.capDir === 'front') {                                     // mũ lưỡi trai (bảo vệ, bác tài, quân sự): lưỡi trai chìa ra trước
    const cp = S.cap, cs = shade(cp, -25);
    if (v === 'f' || v === 'b') { for (let i = 0; i < 5; i++) r(cp, HEAD[i][0], Y + i, HEAD[i][1] - HEAD[i][0] + 1, 1); r(cs, 4, Y + 4, 16, 1); if (v === 'f') { r(cs, 5, Y + 5, 14, 1); if (!S.mil) r('#ffd23a', 11, Y + 2, 2, 1); } }
    else { for (let i = 0; i < 5; i++) r(cp, HEADS[i][0] + ox, Y + i, HEADS[i][1] - HEADS[i][0] + 1, 1); r(cs, 1 + ox, Y + 4, 8, 1); r(cs, 4 + ox, Y + 4, 15, 1); }
  }
  if (S.conical) {                                                          // nón lá
    const nc = '#e8d29a', ns = '#c9ad6c';
    for (let i = 0; i < 6; i++) r(i === 5 ? ns : nc, 11 - i * 2 - (i > 3 ? 1 : 0) + ox, Y - 3 + i, (i * 2 + (i > 3 ? 1 : 0)) * 2 + 2, 1);
    r(ns, 11 + ox, Y - 3, 2, 1); r('#a88a4a', 1 + ox, Y + 2, 22, 1);
  }
  if (S.sun && v !== 'b') {                                                 // kính râm cài trên đầu
    if (v === 'f') { r('#2a2a32', 6, Y + 2, 5, 2); r('#2a2a32', 13, Y + 2, 5, 2); r('#5f656f', 11, Y + 2, 2, 1); r('#8fb0d8', 7, Y + 2, 1, 1); r('#8fb0d8', 14, Y + 2, 1, 1); }
    else { r('#2a2a32', 4 + ox, Y + 2, 5, 2); r('#5f656f', 9 + ox, Y + 2, 6, 1); }
  }
  if (S.phones) {                                                           // tai nghe
    const pc = S.phones;
    if (v === 'f' || v === 'b') { r('#2a2a32', 5, Y, 14, 1); r(pc, 3, Y + 6, 2, 4); r(pc, 19, Y + 6, 2, 4); }
    else { r('#2a2a32', 7 + ox, Y - 1, 8, 1); r(pc, 11 + ox, Y + 6, 3, 4); }
  }
}

/* ============================================================
 *  KIỂU TÓC: mỗi kiểu vẽ 3 góc nhìn — 'f' trước, 'b' sau, 's' nghiêng (quay trái)
 * ============================================================ */
const hspan = (C, y, a, b, col) => { if (b >= a) C.r(col, a, y, b - a + 1, 1); };
function capF(C, rows, col) { for (let i = 0; i < rows; i++) hspan(C, HY + i, HEAD[i][0], HEAD[i][1], col); }
function capS(C, rows, col) { const o = C.ox || 0, oy = C.oy || 0; for (let i = 0; i < rows; i++) hspan(C, HY + i + oy, HEADS[i][0] + o, HEADS[i][1] + o, col); }
// tóc sau gáy khi nhìn nghiêng: phủ nửa sau của đầu từ hàng a tới hàng b
function backS(C, from, to, x0, col) { const o = C.ox || 0, oy = C.oy || 0; for (let i = from; i <= Math.min(to, HEADS.length - 1); i++) hspan(C, HY + i + oy, x0 + o, HEADS[i][1] + o, col); }
// tóc phủ kín đầu khi quay lưng (+ dài xuống tới hàng toY)
function fullB(C, toY, col, w) {
  const { P } = C; capF(C, HEAD.length, col);
  for (let y = HY + HEAD.length; y <= toY; y++) { const k = y > toY - 2 ? 1 : 0; hspan(C, y, 5 + k + (w ? 0 : 0), 18 - k, col); }
  hspan(C, HY + 1, 8, 11, P.hcL);
}
function hi(C, v) { const { P, r } = C; if (v === 'f' || v === 'b') { r(P.hcL, 7, HY + 1, 4, 1); r(P.hcL, 6, HY + 2, 2, 1); } else { const o = C.ox || 0, oy = C.oy || 0; r(P.hcL, 7 + o, HY + 1 + oy, 4, 1); } }
const HAIR = {
  // tóc ngắn rối, có chỏm nhọn (nhân vật chính nam, anh Phong)
  spiky(C, v) {
    const { r, P } = C;
    if (v === 'f') {
      capF(C, 4, P.hc); for (const [a, h] of [[6, 2], [9, 3], [12, 2], [15, 3]]) r(P.hc, a, HY - h + 1, 2, h);   // chỏm tóc nhọn trên đỉnh
      for (let x = 5; x <= 18; x++) { const d = [2, 3, 1, 3, 2, 1, 3, 2, 1, 3, 2, 3, 1, 2][x - 5]; r(P.hc, x, HY + 4, 1, d); }   // mái lởm chởm
      r(P.hc, 4, HY + 3, 1, 6); r(P.hc, 19, HY + 3, 1, 6); r(P.hcS, 4, HY + 7, 1, 2); r(P.hcS, 19, HY + 7, 1, 2); hi(C, v);
    } else if (v === 'b') { fullB(C, HY + 13, P.hc); for (const [a, h] of [[6, 2], [9, 3], [12, 2], [15, 3]]) r(P.hc, a, HY - h + 1, 2, h); for (let x = 6; x <= 17; x += 2) r(P.hcS, x, HY + 13, 1, 2); }
    else { capS(C, 4, P.hc); const o = C.ox || 0, oy = C.oy || 0; for (const [a, h] of [[6, 2], [9, 3], [13, 3]]) r(P.hc, a + o, HY - h + 1 + oy, 2, h); r(P.hc, 4 + o, HY + 4 + oy, 4, 2); r(P.hc, 4 + o, HY + 6 + oy, 2, 1); backS(C, 4, 11, 12, P.hc); r(P.hc, 18 + o, HY + 3 + oy, 2, 3); hi(C, v); }
  },
  shaggy(C, v) { HAIR.spiky(C, v); if (v === 'f') { C.r(C.P.hc, 5, HY + 6, 2, 2); C.r(C.P.hc, 17, HY + 6, 2, 2); } },
  // tóc ngắn gọn (người lớn, học sinh khác)
  short(C, v) {
    const { r, P } = C;
    if (v === 'f') { capF(C, 4, P.hc); r(P.hc, 5, HY + 4, 14, 1); r(P.hc, 5, HY + 5, 4, 1); r(P.hc, 15, HY + 5, 4, 1); r(P.hc, 4, HY + 3, 1, 5); r(P.hc, 19, HY + 3, 1, 5); hi(C, v); }
    else if (v === 'b') fullB(C, HY + 12, P.hc);
    else { capS(C, 4, P.hc); r(P.hc, 4 + (C.ox || 0), HY + 4 + (C.oy || 0), 5, 1); backS(C, 4, 10, 12, P.hc); hi(C, v); }
  },
  // rẽ ngôi gọn gàng (Quang, Vũ)
  neat(C, v) {
    const { r, P } = C;
    if (v === 'f') { capF(C, 5, P.hc); for (let x = 5; x <= 18; x++) r(P.hc, x, HY + 5, 1, x < 11 ? 2 : x < 15 ? 1 : 2); r(P.hcS, 10, HY + 2, 1, 3); r(P.hc, 4, HY + 4, 1, 5); r(P.hc, 19, HY + 4, 1, 5); r(P.hcL, 12, HY + 1, 4, 1); r(P.hcL, 13, HY + 2, 3, 1); }
    else if (v === 'b') fullB(C, HY + 12, P.hc);
    else { capS(C, 5, P.hc); const o = C.ox || 0, oy = C.oy || 0; r(P.hc, 4 + o, HY + 5 + oy, 5, 2); backS(C, 5, 11, 11, P.hc); hi(C, v); }
  },
  // undercut tóc cam dựng (Hoàng): đỉnh bồng, hai bên cạo sát
  undercut(C, v) {
    const { r, P } = C, sh = shade(P.hc, -40);
    if (v === 'f') {
      capF(C, 4, P.hc); for (const [a, h] of [[5, 2], [7, 3], [10, 3], [13, 3], [16, 2]]) r(P.hc, a, HY - h + 1, 2, h);
      for (let x = 6; x <= 17; x++) r(P.hc, x, HY + 4, 1, [2, 1, 2, 3, 1, 2, 1, 3, 2, 1, 2, 1][x - 6]);
      r(sh, 4, HY + 4, 2, 5); r(sh, 18, HY + 4, 2, 5); r(P.hcL, 8, HY, 4, 1); r(P.hcL, 9, HY - 1, 2, 1);
    } else if (v === 'b') { capF(C, 7, P.hc); for (let i = 7; i < HEAD.length; i++) hspan(C, HY + i, HEAD[i][0], HEAD[i][1], sh); for (const [a, h] of [[6, 2], [9, 4], [13, 3]]) r(P.hc, a, HY - h + 1, 2, h); r(P.hcL, 8, HY + 1, 5, 1); }
    else { capS(C, 4, P.hc); const o = C.ox || 0, oy = C.oy || 0; for (const [a, h] of [[5, 2], [8, 4], [12, 3], [15, 2]]) r(P.hc, a + o, HY - h + 1 + oy, 2, h); r(P.hc, 3 + o, HY + 3 + oy, 4, 2); backS(C, 4, 11, 12, sh); r(P.hcL, 8 + o, HY + oy, 4, 1); }
  },
  // đầu đinh (Đức)
  buzz(C, v) {
    const { r, P } = C, c = shade(P.hc, 8);
    if (v === 'f') { capF(C, 3, c); r(c, 5, HY + 3, 14, 1); r(c, 4, HY + 3, 1, 3); r(c, 19, HY + 3, 1, 3); }
    else if (v === 'b') { capF(C, 10, c); r(P.hcS, 6, HY + 9, 12, 1); }
    else { capS(C, 3, c); backS(C, 3, 9, 11, c); }
  },
  bald(C, v) { const { r, P } = C; if (v !== 's') r(P.skL, 8, HY + 1, 4, 1); else r(P.skL, 7 + (C.ox || 0), HY + 1, 4, 1); },
  // rẽ một bên lật (Nam Anh): mái lệch sang phải
  sweep(C, v) {
    const { r, P } = C;
    if (v === 'f') { capF(C, 4, P.hc); for (let x = 5; x <= 18; x++) r(P.hc, x, HY + 4, 1, x > 12 ? 3 : x > 8 ? 2 : 1); r(P.hc, 4, HY + 3, 1, 5); r(P.hc, 19, HY + 3, 1, 6); r(P.hc, 15, HY - 1, 4, 2); r(P.hcL, 13, HY, 4, 1); }
    else if (v === 'b') fullB(C, HY + 12, P.hc);
    else { capS(C, 4, P.hc); const o = C.ox || 0, oy = C.oy || 0; r(P.hc, 3 + o, HY + 3 + oy, 6, 2); r(P.hc, 5 + o, HY - 1 + oy, 5, 2); backS(C, 4, 11, 12, P.hc); hi(C, v); }
  },
  // tóc xoăn bồng (Thái)
  curly(C, v) {
    const { r, P } = C;
    if (v === 'f') { capF(C, 5, P.hc); for (let x = 4; x <= 19; x += 2) r(P.hc, x, HY - 1, 2, 2); for (let x = 5; x <= 18; x++) r(P.hc, x, HY + 5, 1, x % 3 ? 2 : 1); r(P.hc, 3, HY + 3, 2, 10); r(P.hc, 19, HY + 3, 2, 10); for (let y = HY + 4; y < HY + 13; y += 2) { r(P.hcS, 3, y, 1, 1); r(P.hcS, 20, y, 1, 1); } r(P.hcL, 8, HY, 5, 1); }
    else if (v === 'b') { fullB(C, HY + 15, P.hc); for (let x = 4; x <= 19; x += 2) r(P.hc, x, HY - 1, 2, 2); for (let x = 5; x <= 18; x += 2) r(P.hcS, x, HY + 15, 1, 1); }
    else { capS(C, 5, P.hc); const o = C.ox || 0, oy = C.oy || 0; for (let x = 4; x <= 18; x += 2) r(P.hc, x + o, HY - 1 + oy, 2, 2); r(P.hc, 3 + o, HY + 4 + oy, 4, 2); backS(C, 4, 13, 10, P.hc); r(P.hc, 12 + o, HY + 13 + oy, 7, 3); hi(C, v); }
  },
  // tóc bát (học sinh lớp khác)
  bowl(C, v) { const { r, P } = C; if (v === 'f') { capF(C, 6, P.hc); r(P.hc, 4, HY + 6, 16, 1); r(P.hc, 4, HY + 7, 2, 2); r(P.hc, 18, HY + 7, 2, 2); hi(C, v); } else if (v === 'b') fullB(C, HY + 11, P.hc); else { capS(C, 6, P.hc); backS(C, 6, 10, 9, P.hc); hi(C, v); } },
  // tóc bob ngang cằm có bờm (nhân vật chính nữ)
  bob(C, v) {
    const { r, P } = C;
    if (v === 'f') { capF(C, 4, P.hc); r(P.hc, 5, HY + 4, 14, 2); for (let x = 5; x <= 18; x++) if (x % 3) r(P.hc, x, HY + 6, 1, 1); r(P.hc, 3, HY + 3, 3, 11); r(P.hc, 18, HY + 3, 3, 11); r(P.hcS, 3, HY + 12, 3, 2); r(P.hcS, 18, HY + 12, 3, 2); hi(C, v); }
    else if (v === 'b') { capF(C, HEAD.length, P.hc); hspan(C, HY + 14, 4, 19, P.hc); hspan(C, HY + 15, 4, 19, P.hcS); hspan(C, HY + 1, 8, 11, P.hcL); }
    else { capS(C, 4, P.hc); const o = C.ox || 0, oy = C.oy || 0; r(P.hc, 4 + o, HY + 4 + oy, 5, 2); backS(C, 4, 13, 9, P.hc); r(P.hc, 9 + o, HY + 14 + oy, 10, 2); r(P.hcS, 9 + o, HY + 15 + oy, 10, 1); hi(C, v); }
  },
  // tóc ngắn lượn sóng (Minh Anh)
  wavy(C, v) { HAIR.bob(C, v); const { r, P } = C; if (v === 'f') { r(P.hc, 2, HY + 8, 1, 6); r(P.hc, 21, HY + 8, 1, 6); r(P.hcS, 3, HY + 14, 3, 2); r(P.hcS, 18, HY + 14, 3, 2); } else if (v === 'b') { hspan(C, HY + 16, 5, 18, P.hcS); } },
  // tóc dài (Vy, Thảo, Phương, cô giáo)
  long(C, v) {
    const { r, P, S } = C, end = S.low ? HY + 22 : HY + 24, wv = S.wave;
    if (v === 'f') {
      capF(C, 4, P.hc); r(P.hc, 5, HY + 4, 14, 2); for (let x = 5; x <= 18; x++) if (x % 4 !== 1) r(P.hc, x, HY + 6, 1, 1);
      for (let y = HY + 3; y <= end; y++) { const w = wv ? ((y >> 1) % 2) : 0; r(P.hc, 2 + w, y, 4 - w, 1); r(P.hc, 18, y, 4 - w, 1); }
      r(P.hcS, 3, end - 1, 3, 2); r(P.hcS, 18, end - 1, 3, 2); hi(C, v);
    } else if (v === 'b') {
      capF(C, HEAD.length, P.hc);
      for (let y = HY + 14; y <= end; y++) { const w = wv ? ((y >> 1) % 2) : 0; hspan(C, y, 3 + w, 20 - w, y > end - 2 ? P.hcS : P.hc); }
      if (S.low) { r(S.clip || '#7fb8e8', 10, HY + 12, 4, 1); }
      hspan(C, HY + 1, 8, 11, P.hcL); for (let y = HY + 6; y < end - 2; y += 3) r(P.hcS, 11, y, 1, 2);
    } else {
      capS(C, 4, P.hc); const o = C.ox || 0, oy = C.oy || 0; r(P.hc, 4 + o, HY + 4 + oy, 5, 2);
      backS(C, 4, 13, 9, P.hc); for (let y = HY + 14 + oy; y <= end + oy; y++) { const w = wv ? ((y >> 1) % 2) : 0; r(P.hc, 11 + w + o, y, 8, 1); }
      r(P.hcS, 11 + o, end - 1 + oy, 8, 2); hi(C, v);
    }
  },
  // tóc đuôi ngựa (Ngân)
  pony(C, v) {
    const { r, P } = C;
    if (v === 'f') { capF(C, 4, P.hc); for (let x = 5; x <= 18; x++) r(P.hc, x, HY + 4, 1, x < 12 ? 3 - ((x - 5) >> 2) : 1); r(P.hc, 4, HY + 3, 2, 8); r(P.hc, 18, HY + 3, 2, 8); r(P.hc, 19, HY + 1, 3, 12); r(P.hcS, 20, HY + 9, 2, 4); hi(C, v); }
    else if (v === 'b') { capF(C, HEAD.length, P.hc); r('#d8403a', 10, HY + 3, 4, 1); r(P.hc, 10, HY + 4, 4, 15); r(P.hc, 9, HY + 8, 6, 8); r(P.hcS, 10, HY + 16, 4, 3); hspan(C, HY + 1, 8, 11, P.hcL); }
    else { capS(C, 4, P.hc); const o = C.ox || 0, oy = C.oy || 0; r(P.hc, 4 + o, HY + 4 + oy, 5, 2); backS(C, 4, 10, 12, P.hc); r('#d8403a', 17 + o, HY + 3 + oy, 1, 2); r(P.hc, 18 + o, HY + 2 + oy, 3, 4); r(P.hc, 19 + o, HY + 6 + oy, 3, 9); r(P.hcS, 19 + o, HY + 13 + oy, 3, 2); hi(C, v); }
  },
  // tóc dài tết hai bím (Hiền)
  braids(C, v) {
    const { r, P, S } = C, tie = S.tie2 || '#d8403a';
    if (v === 'f') { capF(C, 5, P.hc); r(P.sk, 11, HY + 2, 2, 3); r(P.hc, 4, HY + 4, 4, 3); r(P.hc, 16, HY + 4, 4, 3); r(P.hc, 3, HY + 3, 2, 12); r(P.hc, 19, HY + 3, 2, 12);
      for (const bx of [3, 19]) { for (let y = HY + 15; y < HY + 25; y++) r((y & 1) ? P.hcS : P.hc, bx, y, 2, 1); r(tie, bx, HY + 25, 2, 1); r(P.hc, bx, HY + 26, 2, 1); } hi(C, v); }
    else if (v === 'b') { capF(C, HEAD.length, P.hc); r(P.hcS, 11, HY + 1, 2, 12); for (const bx of [8, 14]) { for (let y = HY + 14; y < HY + 24; y++) r((y & 1) ? P.hcS : P.hc, bx, y, 2, 1); r(tie, bx, HY + 24, 2, 1); } }
    else { capS(C, 5, P.hc); const o = C.ox || 0, oy = C.oy || 0; r(P.hc, 4 + o, HY + 4 + oy, 4, 2); backS(C, 4, 13, 10, P.hc); for (let y = HY + 14 + oy; y < HY + 24 + oy; y++) r((y & 1) ? P.hcS : P.hc, 12 + o, y, 2, 1); r(tie, 12 + o, HY + 24 + oy, 2, 1); hi(C, v); }
  },
  // búi tóc (Hoa, mẹ, cô giáo, cô bán hàng)
  bun(C, v) {
    const { r, P, S } = C;
    if (v === 'f') { capF(C, 4, P.hc); r(P.hc, 5, HY + 4, 14, 1); r(P.hc, 5, HY + 5, 5, 1); r(P.hc, 4, HY + 3, 2, 6); r(P.hc, 18, HY + 3, 2, 6); r(P.hc, 9, HY - 2, 6, 3); r(P.hcS, 9, HY, 6, 1); if (!S.adult) r('#e8b84a', 15, HY - 3, 1, 4); hi(C, v); }
    else if (v === 'b') { capF(C, HEAD.length - 1, P.hc); r(P.hc, 8, HY + 4, 8, 6); r(P.hcS, 8, HY + 9, 8, 1); r(P.hcL, 10, HY + 5, 3, 1); if (!S.adult) r('#e8b84a', 14, HY + 2, 1, 5); }
    else { capS(C, 4, P.hc); const o = C.ox || 0, oy = C.oy || 0; r(P.hc, 4 + o, HY + 4 + oy, 4, 1); backS(C, 4, 11, 11, P.hc); r(P.hc, 16 + o, HY + 1 + oy, 4, 5); r(P.hcS, 16 + o, HY + 5 + oy, 4, 1); hi(C, v); }
  },
  // tóc rối hai chỏm buộc thấp (Duyên)
  messy(C, v) {
    const { r, P, S } = C, tie = S.clip || '#f07aa8';
    if (v === 'f') { capF(C, 4, P.hc); for (const [a, h] of [[7, 2], [12, 2], [16, 1]]) r(P.hc, a, HY - h + 1, 2, h); for (let x = 5; x <= 18; x++) r(P.hc, x, HY + 4, 1, [2, 1, 3, 2, 1, 2, 3, 1, 2, 1, 3, 2, 1, 2][x - 5]); r(P.hc, 3, HY + 3, 3, 10); r(P.hc, 18, HY + 3, 3, 10); r(P.hc, 1, HY + 12, 3, 4); r(P.hc, 20, HY + 12, 3, 4); r(tie, 3, HY + 12, 1, 2); r(tie, 20, HY + 12, 1, 2); hi(C, v); }
    else if (v === 'b') { fullB(C, HY + 14, P.hc); r(P.hc, 2, HY + 13, 3, 4); r(P.hc, 19, HY + 13, 3, 4); r(tie, 4, HY + 13, 1, 2); r(tie, 19, HY + 13, 1, 2); for (const [a, h] of [[7, 2], [12, 2]]) r(P.hc, a, HY - h + 1, 2, h); }
    else { capS(C, 4, P.hc); const o = C.ox || 0, oy = C.oy || 0; r(P.hc, 4 + o, HY + 4 + oy, 5, 2); r(P.hc, 7 + o, HY - 1 + oy, 2, 2); backS(C, 4, 13, 10, P.hc); r(P.hc, 15 + o, HY + 13 + oy, 4, 4); r(tie, 15 + o, HY + 13 + oy, 1, 2); hi(C, v); }
  },
  // hai bím buộc cao (học sinh lớp khác)
  twin(C, v) {
    const { r, P } = C;
    if (v === 'f') { HAIR.bob(C, v); r(P.hc, 1, HY + 2, 3, 9); r(P.hc, 20, HY + 2, 3, 9); }
    else if (v === 'b') { HAIR.bob(C, v); r(P.hc, 1, HY + 2, 3, 9); r(P.hc, 20, HY + 2, 3, 9); }
    else { HAIR.bob(C, v); const o = C.ox || 0, oy = C.oy || 0; r(P.hc, 17 + o, HY + 2 + oy, 3, 9); }
  },
  // đội mũ lưỡi trai quay ngược (Đạt): vẫn thấy mái tóc dưới vành
  cap(C, v) {
    const { r, P, S } = C, cp = S.cap || '#24324a', cs = shade(cp, -25), cl = shade(cp, 25);
    if (v === 'f') { HAIR.short(C, v); for (let i = 0; i < 5; i++) hspan(C, HY + i, HEAD[i][0], HEAD[i][1], cp); hspan(C, HY + 4, 4, 19, cs); r(cl, 8, HY + 1, 5, 1); r(cs, 10, HY + 3, 4, 1); for (let x = 6; x <= 17; x += 2) r(P.hc, x, HY + 5, 1, 2); }
    else if (v === 'b') { fullB(C, HY + 12, P.hc); for (let i = 0; i < 6; i++) hspan(C, HY + i, HEAD[i][0], HEAD[i][1], cp); r(cs, 6, HY + 6, 12, 2); r(cl, 8, HY + 1, 5, 1); r('#fff6e3', 10, HY + 4, 4, 1); }
    else { HAIR.short(C, v); capS(C, 5, cp); const o = C.ox || 0, oy = C.oy || 0; r(cs, 16 + o, HY + 4 + oy, 6, 2); r(cl, 7 + o, HY + 1 + oy, 4, 1); }
  },
};

/* ---------- bộ khung của một nhân vật (gọi từ charSheet) ---------- */
function chibiSheet(key, outfit) {
  const S = chibiSpec(key, outfit), left = [0, 1, 2, 3].map(f => chibiFrame(S, 1, f));
  const flip = cs => cs.map(f => { const c = flipH(f); c.hi = 1; c.foot = f.foot; return c; });
  const rideB = [chibiFrame(S, 1, 0, 'rideB'), chibiFrame(S, 1, 1, 'rideB')], rideM = [chibiFrame(S, 1, 0, 'rideM')];
  return { 0: [0, 1, 2].map(f => chibiFrame(S, 0, f)), 3: [0, 1, 2].map(f => chibiFrame(S, 3, f)), 1: left, 2: flip(left), rideB: { 1: rideB, 2: flip(rideB) }, rideM: { 1: rideM, 2: flip(rideM) }, spec: S };
}
