'use strict';
/* ============================================================
 *  04v. KHU SÂN VẬN ĐỘNG (bên phải phố Bờ Đông) · KHU QUÂN SỰ (tạm khoá, chưa vào được)
 *  - Sân vận động Hoa Phượng: thứ 7 có sự kiện — đêm nhạc (4 tuần một lần, 19:30–22:00) hoặc trận bóng đá của CLB Hoa Phượng
 *    trên sân nhà (2 tuần một lần, 17:00–19:00). Lịch có trên tab Lịch, bảng điện tử trước cổng và bản tin thời sự trên tivi.
 *  - Mua vé ở 2 quầy vé hai bên cổng (mua trước được). Cổng mở trước giờ diễn 60', vào muộn quá 30' thì bảo vệ không cho vào.
 *  - Vào sân: hoạt cảnh khán đài (ca nhạc: sân khấu, đèn, que sáng · bóng đá: cầu thủ chạy, bàn thắng, khán giả reo hò)
 *  - Khu quân sự: tường rào dây thép gai, cổng barie có chiến sĩ gác — không phận sự miễn vào.
 * ============================================================ */
const SVD = { w: 64, h: 34, open: 60, late: 30, price: { concert: 120000, match: 50000 }, friend: 8, stam: 6 };
const SVD_BANDS = ['Ban nhạc Gió Mùa', 'Nhóm nhạc Mây Trắng', 'Ban nhạc Phố Cũ', 'Dàn nhạc Sao Đêm'];
const SVD_SHOWS = ['Đêm nhạc Thu Vàng', 'Đêm nhạc Đông Ấm', 'Đêm nhạc Mừng Xuân', 'Đêm nhạc Hè Rực Rỡ'];     // theo mùa (Thu, Đông, Xuân, Hè)
Object.assign(LOOKS, {
  soldier: { hair: '#2c2733', style: 'buzz', cap: '#4f6b2f', shirt: '#5a7a3a', pants: '#4f6b2f', badge: '#d9342b', skin: '#d9a070' },
  fbA1: { hair: '#2c2733', style: 'short', shirt: '#d9342b', pants: '#fffaf0' }, fbA2: { hair: '#5a3a24', style: 'spiky', shirt: '#d9342b', pants: '#fffaf0', skin: '#c98a5a' },
  fbB1: { hair: '#2c2733', style: 'buzz', shirt: '#3b6fb6', pants: '#2a2136' }, fbB2: { hair: '#8a5a3a', style: 'side', shirt: '#3b6fb6', pants: '#2a2136', skin: '#e3ae80' },
  singer: { hair: '#2a2136', style: 'long', shirt: '#ff5a96', pants: '#2a2136', earring: '#ffd23a' }, rocker: { hair: '#3a2a2a', style: 'spiky', shirt: '#2a2136', pants: '#3a3f55' },
});
function svdEventOn(day) {
  const c = cal(day); if (c.dow !== 5 || holidayOf(day)) return null;                       // chỉ thứ 7, trừ ngày lễ
  const w = Math.floor(day / 7);
  if (w % 4 === 1) { const band = SVD_BANDS[(w >> 2) % SVD_BANDS.length]; return { kind: 'concert', day, name: SVD_SHOWS[c.season], band, from: 1170, to: 1320, price: SVD.price.concert, desc: `${band} cùng nhiều ca sĩ trẻ lên sân khấu, vé bán ở quầy vé sân vận động.` }; }
  if (w % 2 === 0) { const rival = RIVALS[(w >> 1) % RIVALS.length]; return { kind: 'match', day, name: `Trận CLB Hoa Phượng – ${rival}`, rival, from: 1020, to: 1140, price: SVD.price.match, desc: 'Vòng đấu giải hạng Nhất trên sân nhà, vé bán ở quầy vé sân vận động.' }; }
  return null;
}
function svdNext(day, n) { const out = []; for (let d = day; d < day + 70 && out.length < n; d++) { const e = svdEventOn(d); if (e) out.push(e); } return out; }
const svdLine = e => `${e.name} · ${dateLabel(e.day)} ${fmtTime(e.from)}`;
BUS_STOPS.svd = { name: 'Sân vận động', map: 'svd', x: 642, y: 368, pos: 3, off: 1 };
LINKS['dong>svd'] = { at: ['svd', 16, 356, 2], hop: WALK_HOP, label: 'Đi sang khu sân vận động…' };
LINKS['svd>dong'] = { at: ['dong', 944, 172, 1], hop: WALK_HOP, label: 'Về phố Bờ Đông…' };
const MZ_X = 832;                                                         // tường khu quân sự (x)

/* ---------- bản đồ ---------- */
function buildStadium() {
  const m = mapNew('svd', 'Khu sân vận động', SVD.w, SVD.h, false), x = m.x, W = MZ_X >> 4;
  paint(m, 'grass', 0, 0, SVD.w, SVD.h, 0);
  paint(m, 'walk', 0, 20, W, 4, 0); paint(m, 'road', 0, 24, W, 3, 0); paint(m, 'walk', 0, 27, W, 2, 0);
  for (let i = 0; i < W; i += 2) R(x, '#f3e6a8', i * 16 + 4, 25 * 16 + 7, 12, 2);
  R(x, '#aaa392', 0, 382, MZ_X, 2); R(x, '#aaa392', 0, 432, MZ_X, 2);
  paint(m, 'yard', 12, 17, 38, 3, 0);                                     // quảng trường trước cổng
  paint(m, 'road', 1, 9, 11, 11, 0); for (let i = 0; i < 5; i++) { R(x, '#fffaf0', 20 + i * 34, 156, 2, 36); R(x, '#fffaf0', 20 + i * 34, 226, 2, 36); }   // bãi đỗ xe
  R(x, '#fffaf0', 18, 208, 172, 2);
  // sân vận động
  const sv = addObj(m, { door: true, s: 'svdB', x: 210, y: 38, sol: [10, 120, 340, 130], label: () => svdGateLabel(), act: () => ACT.svdGate() });
  m.labels.push({ x: sv.x + 181, y: sv.y + 196, text: 'SVĐ HOA PHƯỢNG', size: 6, col: '#ffe066', maxw: 46 });
  for (const kx of [300, 448]) addObj(m, { s: 'svdKiosk', x: kx, y: 266, sol: [1, 24, 34, 12], ir: [-4, 0, 42, 44], label: () => 'Quầy vé sân vận động — mua vé', act: () => ACT.svdKiosk() });
  addObj(m, { s: 'svdBoard', x: 236, y: 268, sol: [6, 30, 30, 8], ir: [-4, 0, 48, 42], label: () => 'Bảng điện tử — lịch sự kiện ở sân vận động', act: () => ACT.svdBoard() });
  for (const [s2, a, b] of [['car1', 26, 168], ['car2', 94, 168], ['car2', 26, 236], ['bike', 140, 240], ['moto50', 160, 236], ['car1', 128, 168]]) addObj(m, { s: s2, x: a, y: b, sol: [2, 12, SPR[s2].width - 4, 9] });
  for (const [a, b] of [[16, 296], [194, 296], [196, 40], [570, 40], [16, 40], [96, 40]]) addObj(m, { s: 'tree', x: a, y: b - 30, sol: [13, 38, 10, 9] });
  for (const lx of [200, 560, 760]) addObj(m, { s: 'lamp', x: lx, y: 304, sol: [3, 38, 6, 6] });
  addBusStop(m, 'svd', 620, 330, 600, 380);
  addObj(m, { s: 'signpostL', x: 22, y: 330, sol: [10, 22, 8, 8], label: () => '← Phố Bờ Đông, chợ', act: () => ACT.go('svd', 'dong') });
  m.zones.push({ x: 0, y: 320, w: 8, h: 144, fn: () => ACT.go('svd', 'dong'), bx: 6 });
  // người đi xem: có sự kiện thì kéo tới cổng
  ['c3', 'c5', 'c7', 'x1', 'c9', 'c2'].forEach((look, i) => NPCS.push({ id: 'svd_f' + i, name: 'Người đi xem', look, map: 'svd', x: 270 + i * 46, y: 300 + (i % 2) * 10, dir: 3, wander: 30, vis: () => { const e = svdEventOn(G.day); return !!e && inWin(G.time, e.from - SVD.open, e.from + SVD.late); } }));
  NPCS.push({ id: 'svd_guard', name: 'Bảo vệ cổng', look: 'guard', map: 'svd', x: 362, y: 300, dir: 0, label: () => 'Bảo vệ cổng sân vận động', act: () => ACT.svdGate() });

  /* ---------- khu quân sự: tường rào, cổng barie, chòi gác, biển cấm (không vào được) ---------- */
  paint(m, 'dirt', W + 1, 0, SVD.w - W - 1, SVD.h, 1);
  for (let j = 0; j < SVD.h; j++) for (let i = W; i < SVD.w; i++) m.solid[j * SVD.w + i] = 1;
  R(x, '#b8b2a0', MZ_X, 0, 12, m.ph); R(x, '#d4cfbf', MZ_X, 0, 3, m.ph); R(x, '#8f8a7a', MZ_X + 11, 0, 1, m.ph);
  for (let y = 4; y < m.ph; y += 6) { ell(x, '#5f656f', MZ_X + 6, y, 3, 3); ell(x, '#9aa0aa', MZ_X + 6, y, 1.5, 1.5); }   // dây thép gai
  R(x, '#6f6a5a', MZ_X - 12, 384, 12, 48); for (let j = 0; j < 6; j++) R(x, j % 2 ? '#fffaf0' : '#d9342b', MZ_X - 6, 386 + j * 7.5, 4, 7.5);       // barie chắn ngang đường
  for (let j = 0; j < SVD.h; j++) m.solid[j * SVD.w + W - 1] = (j >= 20 && j <= 28) ? 1 : m.solid[j * SVD.w + W - 1];
  addObj(m, { s: 'mzGate', x: MZ_X - 16, y: 300, sol: [2, 70, 14, 22] }); addObj(m, { s: 'mzGate', x: MZ_X - 16, y: 384 + 6, sol: [2, 70, 14, 22] });
  addObj(m, { s: 'mzBooth', x: 776, y: 298, sol: [1, 22, 24, 12] });
  addObj(m, { s: 'mzSign', x: 752, y: 252, sol: [6, 28, 34, 6], label: () => 'Biển: KHU VỰC QUÂN SỰ — CẤM VÀO', act: () => ACT.mzGate() });
  m.labels.push({ x: 775, y: 262.5, text: 'KHU QUÂN SỰ', size: 5.5, col: '#fffaf0', maxw: 40 });
  addObj(m, { s: 'blank', x: MZ_X - 20, y: 360, ir: [-10, 0, 30, 104], label: () => 'Cổng khu quân sự — không phận sự miễn vào', act: () => ACT.mzGate() });
  NPCS.push({ id: 'mz_soldier', name: 'Chiến sĩ gác cổng', look: 'soldier', map: 'svd', x: 808, y: 372, dir: 1, label: () => 'Chiến sĩ gác cổng — khu quân sự', act: () => ACT.mzGate() });
  for (const [s2, a, b] of [['mzBarrack', 870, 60], ['mzTower', 980, 200], ['mzFlag', 880, 140], ['mzTruck', 900, 300], ['mzBarrack', 880, 420], ['mzTower', 860, 6]]) addObj(m, { s: s2, x: a, y: b });

  /* ---------- lối sang từ phố Bờ Đông ---------- */
  const d = MAPS.dong;
  addObj(d, { s: 'signpost', x: 926, y: 148, sol: [10, 22, 8, 8], label: () => 'Sân vận động →', act: () => ACT.go('dong', 'svd') });
  d.zones.push({ x: d.pw - 8, y: 160, w: 8, h: 112, fn: () => ACT.go('dong', 'svd'), bx: -6 });

  /* ---------- bên trong sân: khán đài, mặt cỏ (sân khấu / khung thành tuỳ sự kiện) ---------- */
  const s = mapNew('svd_in', 'Sân vận động Hoa Phượng', 40, 24, true), y = s.x;
  paint(s, 'void', 0, 0, 40, 24, 1);
  const crowd = (y0, h, seat) => { R(y, seat, 0, y0, 640, h); for (let j = y0 + 2; j < y0 + h; j += 6) { R(y, shade(seat, -18), 0, j + 4, 640, 1); for (let i = 2; i < 640; i += 5) { const r = (i * 31 + j * 17) % 23; if (r < 15) { R(y, ['#f8d0a8', '#e3ae80', '#c98a5a'][r % 3], i, j, 3, 2); R(y, ['#d9342b', '#3b6fb6', '#ffd23a', '#fffaf0', '#5fae4a', '#2a2136'][r % 6], i, j + 2, 3, 2); } } } };
  crowd(0, 92, '#3b6fb6'); crowd(332, 52, '#d9534f');
  R(y, '#9aa0aa', 0, 92, 640, 4); R(y, '#9aa0aa', 0, 328, 640, 4);
  for (let i = 0; i < 40; i++) R(y, i % 2 ? '#4f9d48' : '#57a850', i * 16, 96, 16, 232);
  const L = (a, b, w, h) => R(y, '#fffaf0', a, b, w, h);
  L(16, 104, 608, 2); L(16, 318, 608, 2); L(16, 104, 2, 216); L(622, 104, 2, 216); L(319, 104, 2, 216);
  ell(y, '#fffaf0', 320, 211, 34, 30); ell(y, '#4f9d48', 320, 211, 32, 28); L(319, 182, 2, 58);
  L(16, 156, 70, 2); L(16, 266, 70, 2); L(86, 156, 2, 112); L(554, 156, 70, 2); L(554, 266, 70, 2); L(552, 156, 2, 112);
  addObj(s, { s: 'svdStage', x: 220, y: 18, base: 60, vis: () => RT.svdKind === 'concert' });       // ban nhạc đứng trên sàn sân khấu (vẽ sau sân khấu)
  addObj(s, { s: 'goalL', x: 6, y: 194, vis: () => RT.svdKind === 'match' }); addObj(s, { s: 'goalR', x: 622, y: 194, vis: () => RT.svdKind === 'match' });
}
function svdGateLabel() {
  const e = svdEventOn(G.day);
  return e ? `Sân vận động — ${e.name} (${fmtTime(e.from)})` : 'Sân vận động Hoa Phượng — hôm nay không có sự kiện';
}

/* ---------- quầy vé · bảng lịch · cổng ---------- */
ACT.svdBoard = () => {
  const L = svdNext(G.day, 4);
  UI.say('Lịch sự kiện · SVĐ Hoa Phượng', (L.length ? L.map(e => `<p><b>${e.name}</b><br>${dateLabel(e.day)} · ${fmtTime(e.from)}–${fmtTime(e.to)} · vé ${fmtMoney(e.price)}${G.svd.tix[e.day] ? ' · <i>đã có vé</i>' : ''}</p>`).join('') : '<p>Chưa có lịch.</p>') + '<p class="dim">Vé bán ở quầy vé hai bên cổng. Cổng mở trước giờ diễn 60 phút.</p>');
};
ACT.svdKiosk = async () => {
  if (RT.lock) return;
  const list = svdNext(G.day, 3).filter(e => !(e.day === G.day && G.time > e.from + SVD.late));
  if (!list.length) return UI.say('Quầy vé', 'Chưa mở bán vé sự kiện nào.');
  const fid = G.comp && G.comp.fid;
  const c = await UI.ask('Quầy vé', `<p>“Em mua vé sự kiện nào?”</p>${fid ? `<p class="dim">${FRIENDS[fid].name} tự mua vé của mình.</p>` : ''}`, list.map(e => `${svdLine(e)} — ${fmtMoney(e.price)}${G.svd.tix[e.day] ? ' (đã có vé)' : ''}`).concat('Thôi'), { who: { look: 'clerk' } });
  const e = list[c]; if (!e) return;
  if (G.svd.tix[e.day]) return UI.toast('Bạn có vé sự kiện này rồi.');
  if (G.money < e.price) return UI.toast('Không đủ tiền mua vé.', 'bad');
  addMoney(-e.price, true); G.svd.tix[e.day] = e.kind; UI.hud();
  UI.toast(`Đã mua vé ${e.name} (${dateLabel(e.day)}, ${fmtTime(e.from)}). Tới cổng trước giờ diễn nhé!`, 'good');
};
ACT.svdGate = async () => {
  if (RT.lock) return;
  const e = svdEventOn(G.day), T = 'Sân vận động Hoa Phượng', guard = { who: { look: 'guard' } };
  if (!e) { const n = svdNext(G.day + 1, 2); return UI.say(T, `Hôm nay sân không có sự kiện, cổng đóng.${n.length ? `<p class="dim">Sắp tới: ${n.map(svdLine).join(' · ')}</p>` : ''}`); }
  if (G.time < e.from - SVD.open) return UI.ask('Bảo vệ cổng', `<p>“Chưa mở cổng đâu cháu. ${fmtTime(e.from - SVD.open)} mới cho khán giả vào.”</p>`, ['Dạ'], guard);
  if (G.time >= e.to) return UI.ask('Bảo vệ cổng', '<p>“Tan rồi cháu ơi, khán giả về hết rồi.”</p>', ['Dạ'], guard);
  if (G.time > e.from + SVD.late) return UI.ask('Bảo vệ cổng', `<p>“Bắt đầu lâu rồi, chú không cho vào nữa đâu. Lần sau đến sớm nhé!”</p><p class="dim">Chỉ vào được tới ${fmtTime(e.from + SVD.late)}.</p>`, ['Dạ'], guard);
  if (G.svd.seen[e.day]) return UI.ask('Bảo vệ cổng', '<p>“Vé này soát rồi, ra rồi thì không vào lại được cháu ạ.”</p>', ['Dạ'], guard);
  if (!G.svd.tix[e.day]) return UI.ask('Bảo vệ cổng', '<p>“Cháu cho chú xem vé. Chưa có thì ra quầy vé hai bên cổng mua nhé!”</p>', ['Dạ'], guard);
  const conc = e.kind === 'concert';
  const c = await UI.ask(e.name, `<p>Bác bảo vệ soát vé, xé cuống. Vào sân xem ${conc ? 'ca nhạc' : 'bóng đá'} tới lúc kết thúc (${fmtTime(e.to)})?</p>`, ['Vào sân', 'Thôi'], guard);
  if (c === 0) await svdShow(e);
};
ACT.mzGate = () => UI.ask('Chiến sĩ gác cổng', '<p>“Đây là khu vực quân sự, không phận sự miễn vào. Cháu quay lại nhé!”</p><p class="dim">Khu quân sự tạm thời đóng, chưa vào được.</p>', ['Dạ, cháu chào chú ạ'], { who: { look: 'soldier' } });

/* ---------- hoạt cảnh trong sân ---------- */
async function svdShow(e) {
  RT.lock = true;
  const conc = e.kind === 'concert', fid = G.comp && G.comp.fid, F = fid && FRIENDS[fid];
  if (G.time < e.from) advanceTime(e.from - G.time);
  RT.svdKind = e.kind;
  const looks = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'x1', 'x3', 'duyen', 'hoang'];
  const actors = [], me = [320, 346, 3];
  for (let i = 0; i < 14; i++) actors.push({ look: looks[i % looks.length], outfit: 'casual', x: 40 + i * 44 + (i % 2) * 8, y: 352 + (i % 3) * 8, dir: 3 });   // khán giả hàng trước
  if (F) actors.push({ look: fid, outfit: friendOutfit(fid), x: 340, y: 348, dir: 3 });
  const crowdN = actors.length, perf = [];
  if (conc) {
    actors.push({ look: 'singer', x: 320, y: 98, dir: 0 }, { look: 'rocker', x: 270, y: 102, dir: 0 }, { look: 'rocker', x: 372, y: 102, dir: 0 });
    for (let i = 0; i < 16; i++) actors.push({ look: looks[(i + 5) % looks.length], outfit: 'casual', x: 150 + (i % 8) * 46, y: 170 + Math.floor(i / 8) * 34 + (i % 2) * 6, dir: 3 });
  } else {
    for (let i = 0; i < 5; i++) { actors.push({ look: i % 2 ? 'fbA2' : 'fbA1', x: 0, y: 0, dir: 2, walk: 0 }); actors.push({ look: i % 2 ? 'fbB2' : 'fbB1', x: 0, y: 0, dir: 1, walk: 0 }); }
  }
  // tỉ số trận đấu: CLB Hoa Phượng (nhà) – đội khách
  const goals = [], gH = Math.floor(Math.random() * 4), gA = Math.floor(Math.random() * 3);
  for (let i = 0; i < gH; i++) goals.push('H'); for (let i = 0; i < gA; i++) goals.push('A'); goals.sort(() => Math.random() - 0.5);
  const st = { t0: performance.now(), h: 0, a: 0, goal: null, gT: 0, boom: [] };
  const props = [now => {
    const t = (now - st.t0) / 1000;
    for (let i = 0; i < crowdN; i++) { const A = RT.scene && RT.scene.actors[i]; if (A) A.oy = -Math.round(Math.abs(Math.sin(t * (conc ? 5 : 3) + i * 1.7)) * (st.gT > 0 || conc ? 4 : 1.5)); }
    if (conc) {
      const S = VIEW.S;
      for (let k = 0; k < 4; k++) {                                           // đèn sân khấu quét
        const a = Math.sin(t * 1.3 + k * 1.6) * 0.6, sx = 240 + k * 54, col = ['rgba(255,90,150,0.20)', 'rgba(90,200,255,0.20)', 'rgba(255,220,90,0.20)', 'rgba(140,230,110,0.18)'][k];
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(VIEW.ox + sx * S, VIEW.oy + 26 * S); ctx.lineTo(VIEW.ox + (sx + Math.sin(a) * 160 - 26) * S, VIEW.oy + 260 * S); ctx.lineTo(VIEW.ox + (sx + Math.sin(a) * 160 + 26) * S, VIEW.oy + 260 * S); ctx.fill();
      }
      for (let i = crowdN + 3; i < (RT.scene ? RT.scene.actors.length : 0); i++) { const A = RT.scene.actors[i]; A.oy = -Math.round(Math.abs(Math.sin(t * 4.5 + i)) * 5); wRect(['#ff5a96', '#5ac8ff', '#ffdc5a', '#8fe06f'][i % 4], A.x - 1 + Math.sin(t * 6 + i) * 3, A.y - 30 + A.oy, 2, 5); }   // que phát sáng
      for (let i = 0; i < 4; i++) { const k = (t * 0.7 + i / 4) % 1; wRect(['#ff5a96', '#ffd23a', '#5ac8ff', '#fffaf0'][i], 326 + Math.sin(k * 8 + i) * 14, 80 - k * 46, 2, 2); }   // nốt nhạc bay
      if (RT.scene && RT.scene.actors[crowdN]) RT.scene.actors[crowdN].oy = -Math.round(Math.abs(Math.sin(t * 3)) * 2);
      for (const b of st.boom) { const k = (now - b.t) / 900; if (k > 1) continue; for (let j = 0; j < 12; j++) { const a = j / 12 * 6.283; wRect(b.c, b.x + Math.cos(a) * k * 30, b.y + Math.sin(a) * k * 30 + k * k * 8, 2, 2); } }
    } else {
      // cầu thủ chạy theo đội hình, bóng lăn giữa các cầu thủ; có bàn thắng thì bóng bay vào lưới
      const sc = RT.scene; if (!sc) return;
      let bx = 320 + Math.sin(t * 0.9) * 200, by = 211 + Math.sin(t * 1.7) * 70;
      if (st.goal) { const k = clamp((now - st.goal.t) / 900, 0, 1); bx = st.goal.x0 + (st.goal.side === 'H' ? 612 - st.goal.x0 : 18 - st.goal.x0) * k; by = st.goal.y0 + (211 - st.goal.y0) * k; }
      for (let i = 0; i < 10; i++) {
        const A = sc.actors[crowdN + i]; if (!A) continue;
        const home = i % 2 === 0, row = Math.floor(i / 2), hx = (home ? 200 : 440) + (row - 2) * 30 * (home ? 1 : -1), hy = 130 + row * 42;
        const tx = hx * 0.55 + bx * 0.45 + Math.sin(t * 2 + i) * 10, ty = hy * 0.6 + by * 0.4;
        A.x += (tx - A.x) * 0.05; A.y += (ty - A.y) * 0.05; A.walk = t; A.dir = bx < A.x ? 1 : 2;
      }
      wRect('#2a2136', bx - 2, by - 2, 5, 5); wRect('#fffaf0', bx - 1, by - 1, 3, 3);
      const top = (-VIEW.oy + 46 * VIEW.dpr) / VIEW.S, mid = (cv.width / 2 - VIEW.ox) / VIEW.S;            // bảng tỉ số luôn ở mép trên màn hình
      wRect('#2a2136', mid - 62, top, 124, 20); wRect('#1d2a3a', mid - 61, top + 1, 122, 18); wRect('#d9342b', mid - 60, top + 2, 6, 16); wRect('#3b6fb6', mid + 54, top + 2, 6, 16);
      ctx.save(); ctx.font = `800 ${9 * VIEW.S}px "Baloo 2", system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffe066';
      ctx.fillText(`HOA PHƯỢNG  ${st.h} – ${st.a}  KHÁCH`, VIEW.ox + mid * VIEW.S, VIEW.oy + (top + 10.5) * VIEW.S, 104 * VIEW.S); ctx.restore();
    }
  }];
  const steps = [{ say: ['me', conc ? 'Đông quá trời! Sân khấu sáng rực luôn!' : 'Vào sân rồi! Khán đài kín người!'] }];
  if (F) steps.push({ say: [crowdN - 1, conc ? 'Bài mở màn là bài tớ thích nhất đó!' : 'Hôm nay Hoa Phượng phải thắng!'] });
  if (conc) {
    steps.push({ say: [crowdN, `Xin chào Hoa Phượng! ${e.band} đã trở lại rồi đây!`] }, { wait: 1600 },
      { say: [crowdN, 'Cả sân mình cùng hát nào! Một, hai, ba…'] }, { wait: 1400 },
      { fn: () => { const n = performance.now(); for (let i = 0; i < 5; i++) st.boom.push({ t: n + i * 260, x: 220 + i * 50, y: 30 + (i % 2) * 14, c: ['#ffd23a', '#ff5a96', '#5ac8ff', '#8fe06f', '#fffaf0'][i] }); } }, { wait: 1300 },
      { say: ['me', 'Hay quá! Hét khản cả cổ luôn!'] });
  } else {
    steps.push({ wait: 1200 });
    for (const g of goals) steps.push({ fn: () => { const sc = RT.scene; st.goal = { side: g, t: performance.now(), x0: 320, y0: 211 }; } }, { wait: 950 },
      { fn: () => { if (g === 'H') st.h++; else st.a++; st.gT = 1; st.goal = null; UI.toast(g === 'H' ? `VÀOOO! Hoa Phượng ghi bàn! ${st.h}–${st.a}` : `${e.rival} gỡ một bàn… ${st.h}–${st.a}`, g === 'H' ? 'good' : 'info'); } }, { wait: 900 }, { fn: () => { st.gT = 0; } });
    steps.push({ wait: 900 }, { say: ['me', gH > gA ? 'Thắng rồi! Hoa Phượng vô địch!' : gH === gA ? 'Hoà… tiếc ghê, suýt nữa thì thắng.' : 'Thua mất rồi… trận sau gỡ lại!'] });
  }
  await playCut({ map: 'svd_in', me, cam: { x: 320, y: conc ? 132 : 214 }, title: e.name, actors, props, steps });
  RT.svdKind = null;
  advanceTime(Math.max(0, e.to - G.time));
  G.svd.seen[e.day] = true; useStam(SVD.stam, true);
  if (conc) addStat('vannghe', 4); else addStat('thethao', 2);
  if (fid) addFriend(fid, SVD.friend);
  addMemo('scene', conc ? 'svd_concert' : 'svd_match');
  RT.lock = false; UI.hud();
  UI.toast(conc ? `Đêm nhạc kết thúc: +4 Văn nghệ${fid ? `, thân với ${F.name} hơn` : ''}.` : `Hết trận ${gH}–${gA}: +2 Thể thao${fid ? `, thân với ${F.name} hơn` : ''}.`, 'good');
}
