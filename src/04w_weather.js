'use strict';
/* ============================================================
 *  04w. THỜI TIẾT (mưa, nắng) · THÚ CƯNG (chó: thân nhanh hơn · mèo: thêm may mắn)
 *  - Mỗi ngày một kiểu trời theo mùa (cố định theo ngày, tivi dự báo đúng): nắng, nắng gắt (hè), nhiều mây, mưa phùn, mưa, mưa giông.
 *    Mưa có khung giờ (mưa chiều, mưa đêm…). Ngoài trời: hạt mưa, mặt đất tối lại, giông có chớp; nắng gắt buổi trưa ửng vàng;
 *    trời nhiều mây có bóng mây trôi.
 *  - Đi ngoài trời lúc mưa mà không có ô → ướt, mất thể lực; dầm mưa lâu thì hôm sau bị cảm (thể lực đầu ngày giảm).
 *    Ô mua ở tạp hoá Cô Ba (có ô thì tự che khi trời mưa).
 *  - Mưa thì chậu cây ngoài vườn được tưới, cá cắn câu nhiều hơn; bạn bè không ra công viên mà ở nhà.
 * ============================================================ */
const WX = {
  kinds: {
    nang: { name: 'Nắng', icon: 'w_nang' }, nanggat: { name: 'Nắng gắt', icon: 'w_nanggat' }, may: { name: 'Nhiều mây', icon: 'w_may' },
    phun: { name: 'Mưa phùn', icon: 'w_phun', rain: 0.35 }, mua: { name: 'Mưa', icon: 'w_mua', rain: 0.7 }, giong: { name: 'Mưa giông', icon: 'w_giong', rain: 1 },
  },
  // tỉ lệ theo mùa (Thu, Đông, Xuân, Hè)
  odds: [{ nang: 40, may: 25, mua: 25, giong: 10 }, { nang: 25, may: 45, phun: 25, mua: 5 }, { nang: 30, may: 30, phun: 30, mua: 10 }, { nanggat: 45, nang: 10, may: 10, mua: 20, giong: 15 }],
  temp: [[23, 30], [12, 19], [17, 25], [30, 37]],
  wetSoaked: 30, wetSick: 90, sickStam: 20, wetStam: 1,       // phút dầm mưa: ướt sũng · bị cảm hôm sau · thể lực mất mỗi 10 phút
  umbrella: 45000,
};
function weatherOf(day) {
  if (!weatherOf._c) weatherOf._c = {};
  if (weatherOf._c[day]) return weatherOf._c[day];
  const r = mulberry(day * 977 + 31), c = cal(day), O = WX.odds[c.season];
  let x = r() * Object.values(O).reduce((a, b) => a + b, 0), kind = 'nang';
  for (const k in O) { x -= O[k]; if (x < 0) { kind = k; break; } }
  let win = null;                                              // khung giờ mưa (phút trong ngày)
  if (kind === 'phun') { const s = 300 + Math.floor(r() * 6) * 60; win = [s, s + 240 + Math.floor(r() * 4) * 60]; }
  else if (kind === 'mua') { const s = 360 + Math.floor(r() * 13) * 60; win = [s, s + 120 + Math.floor(r() * 5) * 60]; }
  else if (kind === 'giong') { const s = 780 + Math.floor(r() * 5) * 60; win = [s, s + 90 + Math.floor(r() * 3) * 30]; }
  const [lo, hi] = WX.temp[c.season], t0 = lo + Math.floor(r() * 3) - (WX.kinds[kind].rain ? 1 : 0), t1 = hi - Math.floor(r() * 3) - (WX.kinds[kind].rain ? 2 : 0);
  return (weatherOf._c[day] = { day, kind, win, lo: t0, hi: Math.max(t0 + 3, t1) });
}
const wxToday = () => weatherOf(G.day);
// đang mưa không (cường độ 0 … 1)
function rainAt(day, t) { const W = weatherOf(day); return W.win && t >= W.win[0] && t < W.win[1] ? WX.kinds[W.kind].rain : 0; }
const raining = () => !!G && rainAt(G.day, G.time) > 0;
const outdoorNow = () => !!G && MAPS[G.map] && !MAPS[G.map].indoor && !['ride', 'rail'].includes(G.map);
function wxLabel(W) {
  const K = WX.kinds[W.kind];
  return `${K.name}${W.win ? ` ${fmtTime(W.win[0])}–${fmtTime(W.win[1] % 1440)}` : ''} · ${W.lo}–${W.hi}°C`;
}
// câu bản tin thời tiết (hôm nay + ngày mai)
function wxNews(day) {
  const W = weatherOf(day), T = weatherOf(day + 1), K = WX.kinds[W.kind].name.toLowerCase();
  const rain = W.win ? (W.kind === 'giong' ? `Chiều nay có <b>mưa giông</b> khoảng ${fmtTime(W.win[0])}–${fmtTime(W.win[1])}, kèm sấm chớp, mọi người hạn chế ra đường.` : `Có ${K} khoảng <b>${fmtTime(W.win[0])}–${fmtTime(W.win[1] % 1440)}</b>, ra đường nhớ mang ô.`)
    : W.kind === 'nanggat' ? 'Trời <b>nắng gắt</b>, buổi trưa rất nóng, nhớ uống đủ nước và đội mũ.' : W.kind === 'may' ? 'Trời <b>nhiều mây</b>, không mưa.' : 'Trời <b>nắng đẹp</b>, rất hợp để đi chơi.';
  return `${rain} Nhiệt độ ${W.lo}–${W.hi}°C. Ngày mai: ${WX.kinds[T.kind].name.toLowerCase()}${T.win ? ` (${fmtTime(T.win[0])}–${fmtTime(T.win[1] % 1440)})` : ''}.`;
}

/* ---------- mỗi khung hình: ướt mưa, tưới cây, cảm ---------- */
function weatherTick() {
  if (!G) return;
  const t = G.time;
  if (RT.wxT === undefined || RT.wxDay !== G.day) { RT.wxT = t; RT.wxDay = G.day; }
  let dm = t - RT.wxT; if (dm < 0 || dm > 120) { RT.wxT = t; return; }
  if (dm < 1) return;
  RT.wxT = t;
  const r = rainAt(G.day, t);
  if (r && G.yard && !RT.wxWatered) { RT.wxWatered = G.day; let n = 0; for (const it of G.yard.items || []) if (it.k === 'pot' && it.crop && !it.dead && it.last !== G.day) { it.last = G.day; n++; } if (n) { yardSync(); if (G.map === 'town') UI.toast('Trời mưa, chậu cây ngoài vườn được tưới rồi.', 'info'); } }   // mưa tưới cây ngoài vườn
  if (RT.wxWatered && RT.wxWatered !== G.day) RT.wxWatered = 0;
  if (!r || !outdoorNow() || RT.scene || G.owned.o) return;
  const d = G.daily; d.wet = (d.wet || 0) + dm * r;
  const lost = Math.floor(d.wet / 10) - (d.wetLost || 0);
  if (lost > 0) { d.wetLost = (d.wetLost || 0) + lost; useStam(WX.wetStam * lost, true); }
  if (d.wet >= WX.wetSoaked && !d.wetMsg) { d.wetMsg = true; UI.toast('Ướt sũng cả người rồi! Mua một cái ô ở tạp hoá Cô Ba đi, dầm mưa lâu là cảm đấy.', 'bad'); }
  if (d.wet >= WX.wetSick && !d.sickNote) { d.sickNote = true; G.sickDay = G.day + 1; UI.toast('Hắt xì! Dầm mưa lâu quá, chắc mai bị cảm mất…', 'bad'); }
}
// sáng ra: hôm qua dầm mưa thì bị cảm, thể lực đầu ngày thấp hơn
function weatherNewDay() {
  if (G.sickDay === G.day) { G.stamina = Math.max(10, G.stamina - WX.sickStam); RT.morning && RT.morning.push(`Hôm qua dầm mưa nên hôm nay bị cảm, người mệt rã rời (−${WX.sickStam} thể lực).`); }
  const W = wxToday(); if (W.win && RT.morning) RT.morning.push(`Thời tiết hôm nay: ${wxLabel(W)}.${G.owned.o ? '' : ' Nhớ mang ô!'}`);
}

/* ---------- vẽ: mưa, mây, nắng ---------- */
function drawWeather(now) {
  if (!G) return;
  const m = MAPS[G.map]; if (!m) return;
  const r = rainAt(G.day, G.time), W = wxToday(), out = !m.indoor && !['ride', 'rail'].includes(G.map), Wd = cv.width, Hd = cv.height, d = VIEW.dpr;
  if (!out) { if (r) { ctx.fillStyle = `rgba(40,50,80,${0.06 * r})`; ctx.fillRect(0, 0, Wd, Hd); } return; }
  if (r) {
    ctx.fillStyle = `rgba(30,40,70,${0.1 + 0.16 * r})`; ctx.fillRect(0, 0, Wd, Hd);
    const n = Math.round((130 + 240 * r) * Wd / 1400), len = (10 + 12 * r) * d, sp = now * (0.9 + r * 0.6);
    ctx.strokeStyle = `rgba(200,218,250,${0.55 + 0.3 * r})`; ctx.lineWidth = Math.max(1.5, d * (r > 0.5 ? 2 : 1.6)); ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const sx = ((i * 9301 + 49297) % 233280) / 233280, sy = ((i * 4253 + 7713) % 99991) / 99991;
      const x = (sx * (Wd + 200) + sp * 0.25) % (Wd + 200) - 100, y = (sy * (Hd + 100) + sp * (0.9 + (i % 3) * 0.15)) % (Hd + 100) - 50;
      ctx.moveTo(x, y); ctx.lineTo(x - len * 0.3, y + len);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(220,235,255,0.55)';                              // tóe nước trên mặt đất
    for (let i = 0; i < n / 4; i++) { const k = (now / 260 + i * 0.37) % 1, x = ((i * 7919) % 1000) / 1000 * Wd, y = ((i * 104729) % 1000) / 1000 * Hd; ctx.globalAlpha = 1 - k; ctx.fillRect(x - k * 4 * d, y, k * 8 * d, d); }
    ctx.globalAlpha = 1;
    if (W.kind === 'giong') { const f = (now / 1000) % 7; if (f < 0.12 || (f > 0.22 && f < 0.3)) { ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(0, 0, Wd, Hd); } }
    return;
  }
  if (W.kind === 'may' || (W.win && !r)) {                                 // bóng mây trôi
    ctx.fillStyle = 'rgba(40,50,70,0.10)';
    for (let i = 0; i < 4; i++) { const x = ((now / 60 + i * 520) % (Wd + 600)) - 300, y = (i * 0.27 % 1) * Hd; ctx.beginPath(); ctx.ellipse(x, y, 220 * d, 90 * d, 0, 0, 6.283); ctx.fill(); }
  }
  if (W.kind === 'nanggat' && inWin(G.time, 600, 960)) { ctx.fillStyle = 'rgba(255,200,90,0.09)'; ctx.fillRect(0, 0, Wd, Hd); }
  else if ((W.kind === 'nang' || W.kind === 'nanggat') && inWin(G.time, 420, 1020)) { ctx.fillStyle = 'rgba(255,240,180,0.04)'; ctx.fillRect(0, 0, Wd, Hd); }
}
// cái ô che trên đầu nhân vật khi trời mưa (có ô, đang ở ngoài trời, không đi xe)
function drawUmbrella(x, y, col) {
  const c = col || '#e2574c', cx0 = x + 3, top = y - 29;
  wRect('#5f656f', x + 5, top, 1, 17); wRect('#5f656f', x + 4, y - 12, 2, 1);          // cán ô cầm ở tay
  for (let i = -10; i <= 10; i++) { const h = Math.round(Math.sqrt(Math.max(0, 100 - i * i)) * 0.5); wRect(Math.abs(i) % 4 < 2 ? c : shade(c, 18), cx0 + i, top - h, 1, h + 2); }
  wRect(shade(c, -30), cx0 - 10, top + 1, 21, 1);
}

/* ---------- thú cưng ---------- */
const petKind = () => (G && G.pet && G.pet.home ? G.pet.kind : null);
const PET_PERK = { dog: 1.25, cat: 6 };   // chó: điểm thân thiết cộng thêm 25% · mèo: may mắn mỗi ngày +6
const petFriendMul = n => (n > 0 && petKind() === 'dog' ? Math.ceil(n * PET_PERK.dog) : n);
const petLuck = () => (petKind() === 'cat' ? PET_PERK.cat : 0);
