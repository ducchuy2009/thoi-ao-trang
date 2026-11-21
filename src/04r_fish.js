'use strict';
/* ============================================================
 *  04r. CÂU CÁ (cận cảnh như các môn thực hành) · BỘ SƯU TẬP CÁ
 *  - Ba chỗ câu: bến sông dưới phố Hoa Phượng · ao trong công viên khu nhà · mép nước bãi biển. Cần có cần câu.
 *  - Mỗi nơi có loài riêng, tuỳ mùa và giờ trong ngày (FISH ở 01_data.js). Cá càng quý càng hiếm, càng khó kéo, càng nhiều điểm Nông sản.
 *  - Cá cắn câu → khung cận cảnh: GIỮ chuột / SPACE / nút KÉO để kéo dây (lực tăng), thả ra để nhả (lực giảm).
 *    Giữ kim lực trong VÙNG XANH (vùng này trôi theo con cá vùng vẫy) thì thanh kéo cá đầy dần; ra ngoài thì tụt.
 *    Lực chạm đỏ → đứt dây · thanh kéo về 0 → cá sổng. Đầy thanh → kéo được cá lên.
 * ============================================================ */
const fishCount = () => Object.values(G.fish).reduce((a, b) => a + b, 0);
const fishValue = () => FISH.reduce((a, f) => a + (G.fish[f.id] || 0) * f.price, 0);
const fishLabel = where => (G && G.owned.cancau ? `Câu cá ở ${FISH_WHERE[where || 'song'].toLowerCase()}` : 'Chỗ câu cá — cần có cần câu (tạp hoá Cô Ba hoặc sạp đồ câu ngoài biển)');
const fishHere = (f, where, day, time) => {
  if (f.where !== where || !f.seasons.includes(cal(day).season)) return false;
  if (!f.hours) return true;
  const t = time < 300 ? time + 1440 : time;                                      // sau nửa đêm tính tiếp ngày hôm trước
  return t >= f.hours[0] && t < f.hours[1];
};
const FISH_W = [40, 26, 16, 9, 4];                                                  // tỉ lệ gặp theo độ khó
function rollFish(where, bait) {
  const L = FISH.filter(f => fishHere(f, where, G.day, G.time));
  if (!L.length) return null;
  const w = f => FISH_W[f.diff - 1] * (bait && f.diff >= 3 ? FISHING.baitRare : 1);
  let r = Math.random() * L.reduce((a, f) => a + w(f), 0);
  for (const f of L) { r -= w(f); if (r < 0) return f; }
  return L[0];
}
ACT.fish = async where => {
  where = where || 'song';
  if (RT.lock) return;
  if (!G.owned.cancau && !G.owned.cancau2) return UI.say(FISH_WHERE[where], 'Mặt nước lăn tăn, cá quẫy lách tách.<p class="dim">Muốn câu phải có cần câu — bán ở tạp hoá Cô Ba (khu nhà) hoặc sạp đồ câu ngoài biển. Cá câu được bán ở chợ phố Bờ Đông, tặng người khác, hoặc mang về cho mẹ nấu.</p>');
  if (G.stamina < FISHING.stam) return UI.toast('Mệt quá, không câu nổi.', 'bad');
  const bait = (G.inv.moi || 0) > 0;
  const c = await meSay(`<p>Thả câu ở ${FISH_WHERE[where].toLowerCase()}?</p><p class="dim">${FISHING.mins} phút · −${FISHING.stam} thể lực${bait ? ` · dùng 1 mồi câu (còn ${G.inv.moi}) — dễ gặp cá quý` : ''}</p>`, ['Thả câu', 'Thôi']);
  if (c !== 0) return;
  RT.lock = true;
  if (bait) G.inv.moi--;
  await UI.progress('Thả câu, chờ cá cắn…', UI._fast ? 10 : 1300, '#3b82c4');
  advanceTime(FISHING.mins); useStam(FISHING.stam);
  const f = Math.random() < FISHING.nothing ? null : rollFish(where, bait);
  if (!f) { RT.lock = false; UI.hud(); return UI.toast('Ngồi mãi chẳng con nào cắn câu. Thử giờ khác, chỗ khác xem.'); }
  const r = await fishScene(f, where);
  RT.lock = false;
  if (r.score >= 0.5) {
    G.fish[f.id] = (G.fish[f.id] || 0) + 1; addStat('nongsan', f.fp);
    const L = (G.fishLog[f.id] = G.fishLog[f.id] || { n: 0, day: G.day }); L.n++;
    UI.toast(`${L.n === 1 ? 'Loài mới! ' : ''}Câu được ${f.name.toLowerCase()} (${fmtMoney(f.price)}) · +${f.fp} Nông sản.`, 'good');
  } else UI.toast(r.skipped ? 'Bạn thả cần, con cá bơi mất.' : `Con ${f.name.toLowerCase()} giật đứt dây, sổng mất rồi…`, 'info');
  UI._hb = null; UI.hud();
};
// khung cận cảnh câu cá
async function fishScene(f, where) {
  const d = f.diff, rod = G.owned.cancau2 ? 0.05 : 0, zw = clamp(0.21 - 0.024 * d + rod + 0.004 * lv('nongsan'), 0.08, 0.3);   // cá càng quý vùng xanh càng hẹp; cần carbon, cấp Nông sản nới rộng
  const st = { T: 0.3, P: 0.3, zc: 0.5, zv: 0, pull: 0, pt: 0, held: false, t: 0, fin: 0, res: 0, msg: 'Giữ chuột / SPACE để kéo dây · thả ra để nhả', splash: 0, fx: 0 };
  const sea = where === 'bien', water = sea ? '#3b82c4' : where === 'ho' ? '#4fa3b8' : '#5f9fc4', waterL = shade(water, 22);
  const draw = (c, T, now) => {
    gR(c, sea ? '#9fd6f2' : '#bfe6c8', 0, 0, CUW, 34); gR(c, sea ? '#f2e2a8' : '#5fae4a', 0, 30, CUW, 6);                // trời, bờ
    if (!sea) for (let i = 0; i < 6; i++) { gR(c, '#3f8f3a', 10 + i * 38, 18, 10, 14); gR(c, '#5fae4a', 12 + i * 38, 16, 6, 4); }
    else { gR(c, '#fff6c8', 190, 6, 14, 14); gR(c, '#ffe066', 192, 8, 10, 10); }
    gR(c, water, 0, 36, CUW, CUH - 36);
    for (let i = 0; i < 14; i++) { const x = (i * 37 + now / 40) % (CUW + 20) - 10; gR(c, waterL, x, 44 + (i * 13) % 80, 10, 1); }
    // cá vùng vẫy dưới nước (lệch theo lực kéo của cá)
    const fx = 120 + Math.sin(now / 260) * 26 + st.pull * 30, fy = 96 + Math.cos(now / 340) * 6;
    st.fx = fx;
    gR(c, shade(water, -25), fx - 14, fy - 4, 28, 8); gR(c, shade(water, -25), fx + 12, fy - 6, 6, 12);
    // phao và dây câu: từ đầu cần (góc trên trái) tới phao; cần cong theo lực
    const bx = fx - 20, by = 62 + st.T * 6, bend = st.T * 22, tipX = 50 + bend * 0.6, tipY = 14 + bend;
    for (let i = 0; i < 20; i++) { const k = i / 20; gR(c, '#8a5a3a', 6 + (tipX - 6) * k, 70 - (70 - tipY) * k + Math.sin(k * 3.1) * bend * 0.3, 2, 2); }
    for (let i = 0; i < 24; i++) { const k = i / 24; gR(c, 'rgba(255,255,255,0.8)', tipX + (bx - tipX) * k, tipY + (by - tipY) * k + Math.sin(k * 3.14) * (1 - st.T) * 10, 1, 1); }
    gR(c, '#e2574c', bx - 2, by - 3, 4, 3); gR(c, '#fffaf0', bx - 2, by, 4, 2);
    if (st.splash > 0) for (let i = 0; i < 6; i++) gR(c, '#eaf6fc', bx - 8 + i * 3, by - 4 - ((i * 7 + now / 30) % 8), 1, 2);
    // thước lực bên phải: vùng xanh + kim
    const GX = 214, GY = 12, GH = 110;
    gR(c, '#2a2136', GX - 2, GY - 2, 14, GH + 4); gR(c, '#fff6e3', GX, GY, 10, GH); gR(c, '#e2574c', GX, GY, 10, 6);
    const z0 = GY + GH - (st.zc + zw) * GH, z1 = GY + GH - (st.zc - zw) * GH; gR(c, '#8fd067', GX, Math.max(GY, z0), 10, Math.min(GY + GH, z1) - Math.max(GY, z0));
    const ny = GY + GH - st.T * GH; gR(c, '#2a2136', GX - 4, ny - 1, 18, 3); gR(c, inZone() ? '#3f8f3a' : '#e2574c', GX - 3, ny, 16, 1);
    // thanh kéo cá
    gR(c, '#2a2136', GX - 18, GY - 2, 9, GH + 4); gR(c, '#5f656f', GX - 16, GY, 5, GH); gR(c, '#ffd23a', GX - 16, GY + GH - st.P * GH, 5, st.P * GH);
    T.text('LỰC', GX + 5, GY + GH + 8, 5); T.text('KÉO', GX - 13, GY + GH + 8, 5);
    T.text(`${f.name} ${'★'.repeat(d)}`, 92, 8, 7, '#2a2136', '#fff6e3');
    if (st.msg) T.text(st.msg, 100, 128, 5.5);
  };
  const inZone = () => Math.abs(st.T - st.zc) <= zw;
  const tick = dt => {
    st.t += dt; st.splash = Math.max(0, st.splash - dt);
    if (st.fin) { st.fw = (st.fw || 0) + dt; return st.fw > 0.9 ? st.res : undefined; }
    // cá đổi hướng vùng vẫy · vùng xanh trôi theo cá
    st.pt -= dt; if (st.pt <= 0) { st.pt = 0.5 + Math.random() * (1.3 - d * 0.12); st.pull = (Math.random() * 2 - 1) * (0.25 + d * 0.13); }
    st.zv += (st.pull * 0.5 - st.zv) * dt * 3; st.zc = clamp(st.zc + st.zv * dt, zw * 0.6, 1 - zw * 0.6 - 0.06);
    st.T = clamp(st.T + (st.held ? 0.85 : -0.7) * dt + st.pull * 0.12 * dt, 0, 1);
    const ok = inZone();
    st.P = clamp(st.P + (ok ? 0.16 + 0.02 * (5 - d) : -(0.12 + 0.025 * d)) * dt, 0, 1);
    st.msg = st.T > 0.9 ? 'Căng quá! Thả bớt dây ra!' : ok ? 'Tốt lắm, giữ lực đều tay…' : st.T < st.zc ? 'Dây chùng rồi, kéo thêm!' : 'Nhả bớt dây ra!';
    if (!ok && Math.random() < dt * 2) st.splash = 0.4;
    arenaText(`<b>Câu cá · ${FISH_WHERE[where]}</b><div class="sc">${f.name} <i>${'★'.repeat(d)}</i></div><small>GIỮ chuột / SPACE / nút KÉO để kéo dây, thả ra để nhả · giữ kim lực trong vùng xanh cho tới khi đầy thanh KÉO</small>`);
    if (st.T >= 1) { st.fin = 1; st.res = 0; st.msg = 'Phựt! Đứt dây rồi…'; }
    else if (st.P <= 0) { st.fin = 1; st.res = 0; st.msg = 'Cá giãy mạnh, sổng mất rồi!'; }
    else if (st.P >= 1) { st.fin = 1; st.res = 1; st.msg = `Kéo lên rồi! Một con ${f.name.toLowerCase()}!`; }
  };
  const hold = () => { st.held = true; }, rel = () => { st.held = false; };
  return stageGame({ title: `Câu cá · ${FISH_WHERE[where]}`, btn: 'KÉO',
    intro: () => [{ say: ['me', 'Phao chìm rồi! Cá cắn câu!'] }],
    key: k => { if (k === ' ') hold(); }, tap: hold,
    bot: () => (Math.random() < clamp(0.92 - 0.14 * (d - 1) + 0.02 * lv('nongsan') + rod * 2, 0.15, 0.97) ? 1 : 0),
    play: (sc, base, esc) => cuPlay(sc, { draw, tick, down: p => { if (cuIn(p)) hold(); }, up: rel, keyup: e => { if (e.code === 'Space') rel(); }, btnUp: rel }, esc),
    outro: (b, s) => [{ say: ['me', s >= 0.5 ? `Được một con ${f.name.toLowerCase()}!` : 'Tiếc quá…'] }] });
}
function sellFish() {
  const v = fishValue(); if (!v) return UI.toast('Bạn không có con cá nào.');
  const n = fishCount(); G.fish = {}; addMoney(v); addStat('buonban', Math.min(4, n)); UI.toast(`Bán hết ${n} con cá cho Cô Ba được ${fmtMoney(v)}.`, 'good'); UI.hud();
}
// tab Bộ sưu tập · Cá
function fishAlbumHtml() {
  const got = FISH.filter(f => G.fishLog[f.id]).length;
  let h = `<p>Đã câu được <b>${got}/${FISH.length}</b> loài · điểm Nông sản cấp <b>${lv('nongsan')}</b>.</p>`;
  for (const w of Object.keys(FISH_WHERE)) {
    h += `<h4>${FISH_WHERE[w]}</h4><div class="fishgrid">`;
    for (const f of FISH.filter(x => x.where === w)) {
      const L = G.fishLog[f.id], seas = f.seasons.map(s => SEASONS[s].name).join(', '), hrs = f.hours ? `${fmtTime(f.hours[0])}–${fmtTime(f.hours[1] % 1440)}` : 'cả ngày';
      h += L ? `<div class="fishc"><img src="${itemIcon(f.id)}" alt=""><b>${f.name}</b><small>${'★'.repeat(f.diff)} · ${fmtMoney(f.price)} · +${f.fp} nông sản</small><small>Mùa ${seas} · ${hrs}</small><small>Đã câu ${L.n} con${G.fish[f.id] ? ` · đang có ${G.fish[f.id]}` : ''}</small></div>`
        : `<div class="fishc none"><span class="q">?</span><b>Chưa câu được</b><small>${'★'.repeat(f.diff)} · mùa ${seas}</small><small>${f.hours ? 'Có giờ nhất định' : 'Câu cả ngày'}</small></div>`;
    }
    h += '</div>';
  }
  return h + '<p class="dim">Cá câu được bán ở chợ phố Bờ Đông (quầy thu mua), cho Cô Ba, tặng người khác, hoặc mang về cho mẹ nấu.</p>';
}
