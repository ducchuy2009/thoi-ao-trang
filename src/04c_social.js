'use strict';
/* ============================================================
 *  04c. BẠN BÈ & VUI CHƠI
 *  - Đi lại giữa các khu · xe đạp / xe máy · xe bus · tàu ra biển · câu cá
 *  - Bộ máy hoạt cảnh (playCut): lau nhà, rửa xe, đấm lưng, trèo tường trốn học, bị giám thị bắt
 *  - Tương tác với bạn (trường, lớp, công viên, nhà bạn, chỗ hẹn) · tặng quà
 *  - Giải lao giữa 2 tiết: đi vệ sinh chung / yoyo, con quay, đánh bài (có cắt cảnh)
 *  - Mượn sách, mượn bút · sự kiện trong giờ học và giờ nghỉ trưa · thư viện
 *  - Trà sữa, TTTM, khu game, xe xiên que, picnic trên núi
 *  - Thẻ cầu thủ: bóc gói, đấu thẻ · Điện thoại: nhắn tin, hẹn đi chơi
 * ============================================================ */

/* ---------- đi lại giữa các khu ---------- */
async function goPlace(map, x, y, dir, mins, label) {
  if (RT.lock) return;
  RT.lock = true;
  await UI.fade(true);
  if (mins) { await UI.progress(label, 600); advanceTime(mins); }
  setMap(map, x, y, dir);
  await UI.fade(false);
  RT.lock = false; UI.hud();
}
// Ranh giới giữa các khu. hop: số phút mất thêm khi ĐI BỘ qua (đi xe thì không mất) · foot: phải xuống xe
const LINKS = {
  'town>pho': { at: ['pho', 16, 204, 2], hop: WALK_HOP, label: 'Đi sang phố Hoa Phượng…' },
  'pho>town': { at: ['town', 782, 204, 1], hop: WALK_HOP, label: 'Đi về khu phố nhà mình…' },
  'pho>school': { at: ['school', 14, 456, 2], hop: WALK_HOP, label: 'Đi sang trường…' },
  'school>pho': { at: ['pho', PHO_W * 16 - 18, 204, 1], hop: WALK_HOP, label: 'Đi về phố Hoa Phượng…' },
  'pho>ga': { at: ['ga', 288, 300, 3], hop: 0 }, 'ga>pho': { at: ['pho', 456, 22, 0], hop: 0 },
  'pho>song': { at: ['song', 320, 24, 0], hop: 0 }, 'song>pho': { at: ['pho', 440, 396, 3], hop: 0 },
  'school>nui': { at: ['nui', 320, 456, 3], hop: HILL_CLIMB, foot: true, hours: HILL_HOURS, label: 'Theo lối mòn sau trường lên núi…' },
  'nui>school': { at: ['school', 736, 26, 0], hop: HILL_CLIMB, foot: true, label: 'Xuống núi…' },
  'town>chua': { at: ['chua', 176, 24, 0], hop: WALK_HOP, label: 'Đi xuống chùa…' }, 'chua>town': { at: ['town', 176, 396, 3], hop: WALK_HOP, label: 'Về khu phố nhà mình…' },
  'song>chua': { at: ['chua', 620, 176, 1], hop: WALK_HOP, label: 'Đi sang chùa…' }, 'chua>song': { at: ['song', 20, 70, 2], hop: WALK_HOP, label: 'Ra bờ sông…' },
  'song>dong': { at: ['dong', 16, 204, 2], hop: WALK_HOP, label: 'Đi sang phố Bờ Đông…' }, 'dong>song': { at: ['song', 620, 70, 1], hop: WALK_HOP, label: 'Về bờ sông…' },
};
ACT.go = (from, to) => {
  if (RT.lock) return;
  const L = LINKS[from + '>' + to];
  if (from === 'nui' && RT.fest) return leaveFest();               // đang trong hội giao thừa: hỏi lại trước khi về
  if (from === 'pho' && RT.ttFest) return leaveTT().then(ok => { if (ok) ACT.go(from, to); });   // đang trong hội Trung thu: hỏi lại
  if (L.hours && !inWin(G.time, L.hours[0], L.hours[1]) && !(to === 'nui' && eveOk())) return UI.say('Đường lên núi', `Trời tối rồi, đường núi nguy hiểm lắm.<p class="dim">Chỉ lên núi được từ ${fmtTime(L.hours[0])} đến ${fmtTime(L.hours[1])}.</p>`);
  if (L.foot && G.ride) dismount(true);
  goPlace(L.at[0], L.at[1], L.at[2], L.at[3], G.ride ? 0 : L.hop, L.label).then(() => {
    if (G.ride && !rideOk(MAPS[G.map], G.x, G.y)) { dismount(true); UI.toast('Chỗ này không có đường cho xe chạy — dựng xe lại đây.', 'info'); }
  });
};

/* ---------- xe đạp / xe đạp điện / xe máy: bấm vào xe để lên, X để xuống ---------- */
const vehAtHome = id => !!G && !!G.owned[VEHICLES[id].own] && G.ride !== id && !(G.park && G.park.id === id);
// Xe chỉ chạy trên đường (lòng đường, vỉa hè) và trong sân nhà mình
const RIDE_TILES = ['road', 'walk'];
function rideOk(m, x, y) {
  if (!m.tile || m.indoor) return !m.indoor;
  if (m.id === 'town' && x < 272 && y < 160) return true;          // sân nhà mình: dắt xe ra cổng
  if (m.id === 'school' && x >= GATE.x && x < GATE.x + GATE.w && y >= 416 && y < 448) return true;   // chạy tới cổng trường để gửi xe
  return RIDE_TILES.includes(m.tile[(y >> 4) * m.w + (x >> 4)]);
}
ACT.mount = async id => {
  if (RT.lock) return;
  if (G.park && G.park.id !== id) return UI.toast(`Bạn đang để ${VEHICLES[G.park.id].name.toLowerCase()} ở chỗ khác. Mang xe đó về đã.`);
  const V = VEHICLES[id];
  if (G.comp) {          // đang đi chơi với bạn: chở bạn ngồi sau
    const fid = G.comp.fid, F = FRIENDS[fid];
    const c = await UI.ask(F.name, `<p>“${V.name} của cậu hả? Cho tớ ngồi sau với!”</p>`, [`Lên xe, chở ${F.name} đi cùng`, 'Thôi, đi bộ cùng nhau'], { who: { look: fid, outfit: friendOutfit(fid) } });
    if (c !== 0) return;
  }
  if (G.ride) dismount(true);
  G.ride = id; G.park = null;
  UI.toast(G.comp ? `Chở ${FRIENDS[G.comp.fid].name} trên ${V.name.toLowerCase()}. Chỉ chạy xe trên đường · bấm X để xuống xe.` : `Lên ${V.name.toLowerCase()}. Chỉ chạy xe trên đường · bấm X để xuống xe.`, 'good'); UI.hud();
};
function dismount(quiet) {
  if (!G.ride) return;
  const id = G.ride, m = MAPS[G.map];
  G.ride = null;
  G.park = atHome() ? null : { id, map: G.map, x: clamp(G.x + (RT.faceL ? 14 : -14), 18, m.pw - 18), y: G.y };
  if (!quiet) UI.toast(G.park ? `Dựng ${VEHICLES[id].name.toLowerCase()} ở đây. Bấm vào xe để đi tiếp.` : 'Dựng xe ở sân nhà.');
  UI.hud();
}
const shedLabel = () => (G && G.park && G.park.shed ? `Nhà xe — lấy ${VEHICLES[G.park.id].name.toLowerCase()}` : 'Nhà xe học sinh');
// Xe gửi ở nhà xe trường: chỉ lấy được khi đã hết mọi tiết học (hoặc được cho về vì ngất); lấy xe thì dắt ra cổng rồi mới lên xe
const classesOver = () => !schoolToday() || G.time >= schoolEndT() || !!G.daily.fainted;
ACT.shed = async () => {
  if (RT.lock) return;
  if (!G.park || !G.park.shed) return UI.toast('Nhà xe học sinh. Đi xe đến trường thì xe gửi ở đây.');
  const V = VEHICLES[G.park.id];
  if (!classesOver()) return UI.ask('Bác bảo vệ', `<p>“Chưa tan học đâu cháu. Học hết các tiết (${fmtTime(CFG.SCHOOL_END)}) rồi hẵng ra lấy xe.”</p>`, ['Dạ'], { who: { look: 'guard' } });
  RT.lock = true; await UI.fade(true);
  G.ride = G.park.id; G.park = null; G.atSchool = false;
  setMap('school', GATE.x + GATE.w / 2, GATE.yOut + 8, 0);
  await UI.fade(false); RT.lock = false;
  UI.toast(`Dắt ${V.name.toLowerCase()} ra khỏi cổng trường. Chỉ chạy xe trên đường · bấm X để xuống xe.`, 'good'); UI.hud();
};

/* ---------- hoạt cảnh đi xe: xe bus · bố mẹ chở · tàu hoả ---------- */
// Xe chạy từ đầu này sang đầu kia cảnh đường; right = chạy sang phải. Sau hoạt cảnh màn hình vẫn tối để bên gọi đặt bản đồ mới.
async function rideCut(kind, title, right, who) {
  const rail = kind === 'train', map = rail ? 'rail' : 'ride', W = MAPS[map].pw, dur = UI._fast ? 40 : 3200;
  await UI.fade(true);
  setMap(map, 100, 150, 0);
  const t0 = performance.now(), x0 = right ? 40 : W - 240, x1 = right ? W - 240 : 40;
  RT.scene = {
    type: 'cut', map, hideMe: true, cam: { x: x0, y: 96 }, title, actors: [], hide: [], tw: [], bubble: null,
    props: [now => {
      const k = clamp((now - t0) / dur, 0, 1), e = k * k * (3 - 2 * k), x = x0 + (x1 - x0) * e, bob = Math.floor(now / 110) % 2;
      RT.scene.cam.x = x + (rail ? 84 : 36);
      if (rail) drawSpr(SPR[right ? 'train' : 'trainL'], x, 104);
      else if (kind === 'bus') drawSpr(SPR[right ? 'bus' : 'busL'], x, 128 + bob);
      else {       // xe máy của bố / mẹ, mình ngồi sau
        const cx0 = x + 16, cy0 = 162 + bob;
        drawSpr(SHADOW, cx0 - 7, cy0 - 3); drawSpr(SPR[BIKE[who].spr], cx0 - 16, cy0 - 21);
        drawSpr(charSheet(G.gender)[2][0], cx0 - 17, cy0 - 31);
        drawSpr(charSheet(who, who === 'mom' ? 'noapron' : null)[2][0], cx0 - 8, cy0 - 32);
      }
    }],
  };
  UI.hint(null); document.body.classList.add('cut');
  await UI.fade(false); await UI.wait(dur); await UI.fade(true);
  RT.scene = null; document.body.classList.remove('cut');
}
// Xe bus: lên xe ở bến rồi chọn điểm đến. Vé đồng giá; càng xa càng lâu.
ACT.bus = async from => {
  if (RT.lock) return;
  if (!busHere()) return UI.say('Trạm xe bus', `Hết chuyến rồi.<p class="dim">Xe bus chạy từ ${fmtTime(BUS_HOURS[0])} đến ${fmtTime(BUS_HOURS[1])}.</p>`);
  const f = busFare(), stops = Object.keys(BUS_STOPS).filter(k => k !== from);
  const c = await UI.ask('Xe bus', `<p>Bác tài: “Lên xe đi cháu. Về đâu nào?”</p><p class="dim">Vé đồng giá <b>${f.cost ? fmtMoney(f.cost) : 'miễn phí'}</b> (${f.note}).</p>`, stops.map(k => `${BUS_STOPS[k].name} · ${busMins(from, k)} phút`).concat('Xuống xe'));
  if (c < 0 || c >= stops.length) return;
  if (G.money < f.cost) return UI.toast('Không đủ tiền vé.', 'bad');
  const to = stops[c], A = BUS_STOPS[from], B = BUS_STOPS[to];
  RT.lock = true; meetSoc('taixe');
  if (G.ride) dismount(true);
  if (f.cost) addMoney(-f.cost, true);
  await rideCut('bus', `Xe bus · ${A.name} → ${B.name}`, B.pos + B.off * 0.5 >= A.pos + A.off * 0.5);
  advanceTime(busMins(from, to)); setMap(B.map, B.x, B.y, 0); RT.snapNpcs = true;
  await UI.fade(false);
  RT.lock = false; UI.hud();
  if (to === 'truong' && schoolToday() && G.time < schoolEndT()) UI.toast('Xuống xe trước cổng trường. Đi qua cổng để vào trường.', 'info');
};
// Tàu hoả: chỉ có tàu mới ra được biển
ACT.train = async from => {
  if (RT.lock) return;
  const out = from === 'ga', T = TRAIN;
  if (out && !inWin(G.time, T.hours[0], T.hours[1])) return UI.say('Cô soát vé', `“Hết chuyến ra biển rồi cháu.”<p class="dim">Tàu ra biển chạy từ ${fmtTime(T.hours[0])} đến ${fmtTime(T.hours[1])}. Chuyến về thì có tới khuya.</p>`);
  const c = await UI.ask('Cô soát vé', `<p>“${out ? 'Tàu ra biển' : 'Tàu về ga Hoa Phượng'}, vé ${fmtMoney(T.price)}, đi ${T.mins} phút. Cháu lên tàu chứ?”</p><p class="dim">Bây giờ ${fmtTime(G.time)}.${out && schoolToday() && G.time < CFG.SCHOOL_END ? ' Hôm nay là ngày đi học đấy…' : ''}</p>`, [`Mua vé lên tàu (${fmtMoney(T.price)})`, 'Thôi']);
  if (c !== 0) return;
  if (G.money < T.price) return UI.toast('Không đủ tiền vé.', 'bad');
  RT.lock = true; meetSoc('soatve');
  if (G.ride) dismount(true);
  addMoney(-T.price, true);
  await rideCut('train', out ? 'Tàu hoả · Ga Hoa Phượng → Biển' : 'Tàu hoả · Biển → Ga Hoa Phượng', out);
  advanceTime(T.mins); if (out) setMap('bien', 330, 70, 0); else setMap('ga', 300, 70, 0); RT.snapNpcs = true;
  await UI.fade(false);
  RT.lock = false; UI.hud();
  if (out) { UI.toast('Tới biển rồi! Tắm biển, xây lâu đài cát, nhặt vỏ sò, ăn hải sản…', 'good'); addMemo('scene', 'bien'); }
};
ACT.beach = async kind => {
  const B = BEACH, d = G.daily.beach, fid = palAt('bien'), wf = fid ? ` cùng ${FRIENDS[fid].name}` : '';
  if (kind === 'shell') {
    if (G.daily.shells >= B.shell.perDay) return UI.toast('Hôm nay nhặt đủ vỏ sò đẹp rồi.');
    await activity('Đang nhặt vỏ sò…', B.shell.mins, () => { G.daily.shells++; G.inv.voso++; UI.toast('Nhặt được một vỏ sò đẹp. Đem tặng bạn nhé.', 'good'); addMemo('item', 'voso'); });
  } else if (kind === 'rest') {
    if (d.rest) return UI.toast('Hôm nay nằm nghỉ ở ghế dù rồi.');
    await activity('Nằm ghế dù nghe sóng vỗ…', B.rest.mins, () => { d.rest = true; gainStam(B.rest.stam); });
  } else if (kind === 'food') {
    if (!inWin(G.time, 540, 1230)) return UI.say('Quán hải sản', 'Quán chưa mở.<p class="dim">Bán từ 09:00 đến 20:30.</p>');
    UI.store('Quán hải sản', '“Mực nướng, nghêu hấp sả, bắp nướng mỡ hành đây!”', [{ id: 'haisan', name: 'Hải sản nướng', price: B.food.price, desc: `Mực nướng, nghêu hấp sả gói mang theo${wf ? ' — ăn cùng bạn càng vui' : ''}`, inv: 'haisan' }], it => buyFood('haisan', it.price, it.name));
  } else if (kind === 'castle') {
    if (d.castle) return UI.toast('Lâu đài cát hôm nay xây xong rồi.');
    await jointAct(`Đang xây lâu đài cát${wf}…`, B.castle.mins, 'castle', fid, () => { d.castle = true; useStam(B.castle.stam); addStat('kheotay', B.castle.pts); palGain('bien', 6); });
  } else if (kind === 'swim') {
    if (d.swim) return UI.toast('Hôm nay tắm biển rồi, da nhăn hết cả.');
    if (G.stamina < B.swim.stam) return UI.toast('Không đủ thể lực.', 'bad');
    await jointAct(`Đang tắm biển${wf}…`, B.swim.mins, 'swim', fid, () => { d.swim = true; useStam(B.swim.stam, true); addStat('thethao', B.swim.pts); palGain('bien', B.friend); });
  }
};

/* ---------- câu cá ở bờ sông ---------- */
const fishCount = () => Object.values(G.fish).reduce((a, b) => a + b, 0);
const fishValue = () => FISH.reduce((a, f) => a + (G.fish[f.id] || 0) * f.price, 0);
const fishLabel = () => (G && G.owned.cancau ? 'Câu cá' : 'Chỗ câu cá — cần có cần câu (bán ở tạp hoá Cô Ba)');
ACT.fish = async () => {
  if (RT.lock) return;
  if (!G.owned.cancau) return UI.say('Bờ sông', 'Sông rộng mênh mông, cá quẫy lách tách.<p class="dim">Muốn câu cá phải có cần câu — bán ở tạp hoá Cô Ba (80.000đ). Cá câu được bán lại cho Cô Ba hoặc mang về cho mẹ nấu.</p>');
  if (G.stamina < FISHING.stam) return UI.toast('Mệt quá, không câu nổi.', 'bad');
  RT.lock = true;
  await UI.progress('Thả câu, chờ cá cắn…', 1300);
  advanceTime(FISHING.mins); useStam(FISHING.stam);
  if (Math.random() < FISHING.nothing) { RT.lock = false; UI.hud(); return UI.toast('Ngồi mãi chẳng con nào cắn câu.'); }
  let r = Math.random() * FISH.reduce((a, f) => a + f.w, 0), f = FISH[0];
  for (const q of FISH) { r -= q.w; if (r < 0) { f = q; break; } }
  const res = await UI.minigame({ title: 'Cá cắn câu!', task: 'Giữ con cá trong vùng xanh cho tới khi kéo được lên bờ', icon: 'ca', diff: f.diff, level: lv('kheotay'), tired: G.stamina < 10 });
  if (res.win) { G.fish[f.id] = (G.fish[f.id] || 0) + 1; addStat('kheotay', 2); UI.toast(`Câu được một con ${f.name.toLowerCase()}!`, 'good'); }
  else { addStat('kheotay', 1); UI.toast(`Con ${f.name.toLowerCase()} giật đứt dây, sổng mất rồi…`, 'info'); }
  RT.lock = false; UI.hud();
};
function sellFish() {
  const v = fishValue(); if (!v) return UI.toast('Bạn không có con cá nào.');
  G.fish = {}; addMoney(v); addStat('buonban', 2); addMoney(0, true); UI.toast('Bán hết cá cho Cô Ba.', 'good'); UI.hud();
}

/* ---------- hẹn đi chơi · bạn đi cùng ---------- */
const meetOn = () => (G && G.meet && G.meet.day === G.day ? G.meet : null);
function meetWindow(m) { const P = PLACES[m.place]; return [Math.max(isSchoolDay(m.day) ? AFTER_SCHOOL : 480, P.open[0], m.from || 0), Math.min(MEET_END, P.open[1])]; }
const meetTimeText = m => { const w = meetWindow(m); return `${fmtTime(w[0])}–${fmtTime(w[1])}`; };
function meetToday(fid) { const m = meetOn(); if (!m || m.fid !== fid) return false; const w = meetWindow(m); return inWin(G.time, w[0], w[1]); }
function meetHere(place) { const m = meetOn(); if (!m || m.place !== place) return null; const w = meetWindow(m); return inWin(G.time, w[0], w[1]) ? m.fid : null; }
// Bạn đi cùng: đi theo sau mình qua các khu (trốn học hoặc đi chơi); tới chỗ vui chơi thì hai đứa cùng chơi, có hoạt cảnh
function setComp(fid, skip) { G.comp = { fid, skip: !!skip, n: 0 }; RT.fol = null; }
function endComp(msg, walkAway) {
  if (!G.comp) return;
  const fid = G.comp.fid, f = RT.fol;
  if (walkAway && f && f.map === G.map && !(RT.scene && RT.scene.type === 'cut')) {        // tạm biệt: bạn tự đi bộ ra cửa / mép bản đồ gần nhất rồi mới khuất
    const x = G.ride ? G.x + 10 : f.x, y = G.ride ? G.y + 2 : f.y;
    let to = null, bd = 1e9; for (const p of mapPortals(MAPS[G.map])) { const d = Math.hypot(p[0] - x, p[1] - y); if (d < bd && d > 12) { bd = d; to = p; } }
    if (to) (RT.walkers = RT.walkers || []).push({ fid, look: fid, outfit: friendOutfit(fid), map: G.map, x, y, to, dir: 0, walk: 0, t: 0 });
  }
  G.comp = null; RT.fol = null; if (msg) UI.toast(msg, 'info');
}
// Ai đang chơi cùng mình ở đây: bạn đang đi theo, hoặc bạn đang đợi ở chỗ hẹn này
const palAt = place => (G.comp ? G.comp.fid : meetHere(place));
// Cùng chơi: lần đầu trong buổi cộng đủ điểm thân thiết, các lần sau cộng một nửa
function palGain(place, pts) {
  if (G.comp) return addFriend(G.comp.fid, G.comp.n++ ? Math.ceil(pts / 2) : pts);
  const fid = meetHere(place); if (fid) addFriend(fid, G.meet.n++ ? Math.ceil(pts / 2) : pts);
}
// Lời thoại hoạt cảnh khi hai đứa cùng làm một việc: [tên cảnh, câu của bạn, câu của mình]
const DUO = {
  tea: ['Tiệm trà sữa Mây', 'Trà sữa trân châu đường đen, full topping!', 'Của tớ ít đá, nhiều trân châu nha.'],
  movie: ['Rạp chiếu phim', 'Mua bắp rang chưa? Sắp chiếu rồi đó.', 'Rồi nè. Ghế giữa hàng cuối, đẹp luôn!'],
  chicken: ['Khu ăn uống', 'Gà rán giòn rụm luôn. Chấm tương ớt mới đã!', 'Cho tớ xin miếng đùi nha.'],
  cab: ['Khu game Arcade', 'Đua xe không? Thua bao nước!', 'Chơi luôn! Tớ chấp cậu nửa vòng.'],
  dance: ['Máy nhảy', 'Nhảy bài này đi, nhạc bốc lắm!', 'Coi tớ quẩy nè… ối, trật nhịp rồi!'],
  kem: ['Xe kem', 'Tớ lấy kem dâu. Cậu ăn vị gì?', 'Sô-cô-la! Ăn lẹ kẻo chảy.'],
  xien: ['Xe xiên que', 'Cá viên chiên chấm tương đen là số một!', 'Cô ơi cho con thêm hai xiên xúc xích!'],
  sport: ['Chơi thể thao', 'Chuyền đây! Sút nèee!', 'Vàooo! Đỉnh quá!'],
  picnic: ['Picnic trên núi', 'Trên này gió mát ghê. Nhìn kìa, trường mình bé tí!', 'Ước gì ngày nào cũng được lên đây.'],
  view: ['Đỉnh núi', 'Đẹp quá trời… chụp tấm hình đi!', 'Một, hai, ba… cười!'],
  swim: ['Tắm biển', 'Nước mát lắm, xuống đi!', 'Đợi tớ với! Đừng tạt nước!'],
  castle: ['Lâu đài cát', 'Đắp cái tháp cao cao vào!', 'Sóng lên rồi, giữ lấy lâu đài!'],
  seafood: ['Quán hải sản', 'Mực nướng thơm quá trời.', 'Nghêu hấp sả cũng ngon lắm, ăn thử đi.'],
  fish: ['Câu cá', 'Suỵt… cá sắp cắn câu rồi.', 'Giật! Giật đi!'],
};
function duoCut(fid, key) {
  const D = DUO[key] || DUO.sport, m = MAPS[G.map], fx = G.x + 20 < m.pw - 10 ? G.x + 20 : G.x - 20;
  return {
    inPlace: true, title: D[0], actors: [{ look: fid, outfit: friendOutfit(fid), x: fx, y: G.y, dir: fx > G.x ? 1 : 2 }],
    steps: [{ fn: () => { G.dir = fx > G.x ? 2 : 1; } }, { say: [0, D[1]] }, { say: ['me', D[2]] }],
  };
}
// Hoạt động ở chỗ vui chơi: một mình thì chỉ có thanh tiến độ; có bạn đi cùng thì diễn hoạt cảnh hai đứa
async function jointAct(label, mins, key, fid, fn) {
  if (!fid) return activity(label, mins, fn);
  if (RT.lock) return;
  RT.lock = true;
  await playCut(duoCut(fid, key));
  advanceTime(mins);
  if (fn) fn();
  RT.lock = false; UI.hud();
}
function friendHome(fid) {
  if (!G || meetToday(fid) || isComp(fid)) return false;
  const t = G.time;
  if (tetTime()) return inWin(t, 420, 1290);                        // Tết: bạn ở nhà cả ngày
  return schoolToday() ? inWin(t, 1210, 1290) : (inWin(t, 390, 480) || inWin(t, 1090, 1290));
}
function placeOpen(P) {
  if (inWin(G.time, P.open[0], P.open[1])) return true;
  UI.say(P.name, `Đóng cửa rồi.<p class="dim">Mở cửa ${fmtTime(P.open[0])}–${fmtTime(P.open[1])}</p>`); return false;
}

/* ---------- tương tác với bạn bè: Nói chuyện · Trốn học / Rủ đi chơi · Bán đồ · Rời đi ---------- */
function breakFunFor(fid) {
  const F = FRIENDS[fid];
  if (!G.atSchool || !schoolToday() || G.time >= CFG.SCHOOL_END + 40 || F.g !== G.gender || grudge(fid)) return [];
  if (hearts(fid) < BREAK_FUN_MIN_HEARTS || (G.daily.brk[fid] || 0) >= BREAK_FUN_PER_DAY) return [];
  return Object.keys(BREAK_FUN).filter(id => BREAK_FUN[id].g === G.gender);
}
// Đồ đem bán được cho bạn: bánh tráng, đồ ăn mang theo, thẻ cầu thủ
function sellables() {
  const a = [];
  if (G.inv.banhtrang) a.push({ k: 'banhtrang', name: 'Bánh tráng trộn', price: sellPrice() });
  for (const k in SELL_FOOD) if (G.inv[k]) a.push({ k, name: FOODS[k].name, price: SELL_FOOD[k] });
  for (const c of CARDS) if (G.cards[c.id]) a.push({ k: 'card', c, name: `Thẻ ${starsOf(c)} ${c.name}`, price: SELL_CARD[c.r] });
  return a;
}
async function sellMenu(sid, fid, name) {
  if (G.daily.sold[sid]) return UI.toast(`Hôm nay ${name} mua của bạn rồi.`);
  const items = sellables(); if (!items.length) return UI.toast('Bạn không có gì để bán.');
  const c = await UI.ask('Bán đồ', `<p>Mời ${name} mua món gì?</p>`, items.map(i => `${i.name} · ${fmtMoney(i.price)}`).concat('Thôi'), { grid: items.length > 5 });
  if (c < 0 || c >= items.length) return;
  const it = items[c], take = () => { if (it.k === 'card') { G.cards[it.c.id]--; if (!G.cards[it.c.id]) delete G.cards[it.c.id]; } else G.inv[it.k]--; };
  G.daily.sold[sid] = true;
  if (G.atSchool && Math.random() < SELL.caught) { take(); addConduct(-0.5, 'bán hàng trong trường bị giám thị bắt'); return; }
  const ch = SELL.baseChance + 0.05 * lv('buonban') + (fid ? 0.05 * hearts(fid) : 0) - (it.k === 'card' ? 0.08 * it.c.r : 0);
  if (Math.random() < ch) { take(); addMoney(it.price); addStat('buonban', 4); UI.toast(`${name.replace(/^./, x => x.toUpperCase())} mua ${it.name.toLowerCase()} rồi!`, 'good'); }
  else { addStat('buonban', 1); UI.toast(fid ? `${name} lắc đầu: “Hôm nay tớ hết tiền rồi.”` : 'Bạn ấy lắc đầu: “Hôm nay tớ hết tiền rồi.”'); }
}
// "Nói chuyện": tám chuyện, và các việc thân mật khác nếu có (chúc sinh nhật, tặng quà, đấu thẻ, trò riêng giờ ra chơi)
async function talkMenu(fid, where) {
  const F = FRIENDS[fid], bd = isDate(F.bday, G.day), opts = ['Tám chuyện'], ids = ['chat'], add = (id, t) => { ids.push(id); opts.push(t); };
  if (bd && !G.daily.bday[fid]) add('bday', `Chúc mừng sinh nhật ${F.name}!`);
  if ((where === 'school' || where === 'class') && G.atSchool) for (const id of breakFunFor(fid)) add('brk:' + id, BREAK_FUN[id].name);
  if (cardCount()) add('duel', 'Đấu thẻ cầu thủ');
  const c = ids.length === 1 ? 'chat' : (add('x', 'Thôi'), ids[await UI.ask(F.name, '<p>“Sao đó?”</p>', opts)] || 'x');
  if (c === 'chat') chat('f_' + fid, fid);
  else if (c === 'duel') cardDuel('f_' + fid, fid, F.name, F.duel);
  else if (c.startsWith('brk:')) doBreakFun(fid, c.slice(4));
  else if (c === 'gift') { G.inv.gaubong--; G.daily.gift[fid] = true; addFriend(fid, GIFT_FRIEND * (bd ? 2 : 1)); UI.toast(`${F.name} ôm con gấu bông cười tít mắt.`, 'good'); }
  else if (c === 'shell') { G.inv.voso--; G.daily.gift['v_' + fid] = true; addFriend(fid, SHELL_FRIEND * (bd ? 2 : 1)); UI.toast(`${F.name} áp vỏ sò lên tai nghe tiếng sóng.`, 'good'); }
  else if (c === 'bday') { G.daily.bday[fid] = true; addFriend(fid, BDAY_FRIEND); UI.say(F.name, '“Cậu nhớ sinh nhật tớ á? Cảm ơn nhiều nha!”'); }
}
ACT.mate = async sid => {
  const opts = ['Nói chuyện'], ids = ['talk'];
  if (sellables().length) { opts.push('Bán đồ'); ids.push('sell'); }
  opts.push('Rời đi'); ids.push('x');
  const c = ids[await UI.ask('Bạn cùng lớp', '<p>“Gì đó?”</p>', opts)];
  if (c === 'sell') return sellMenu(sid, null, 'bạn ấy');
  if (c !== 'talk') return;
  if (!cardCount()) return chat(sid, null);
  const k = await UI.ask('Bạn cùng lớp', '<p>“Sao đó?”</p>', ['Tám chuyện', 'Đấu thẻ cầu thủ', 'Thôi']);
  if (k === 0) chat(sid, null); else if (k === 1) cardDuel(sid, null, 'bạn cùng lớp', 'lop');
};
// where: 'school' sân trường · 'class' trong lớp · 'park' công viên · 'house' trước nhà bạn · 'meet' chỗ hẹn · 'comp' đang đi cùng mình
ACT.friend = async (fid, where) => {
  const F = FRIENDS[fid], hs = hearts(fid), opts = ['Nói chuyện'], ids = ['talk'], add = (id, t) => { ids.push(id); opts.push(t); };
  const atSch = (where === 'school' || where === 'class') && G.atSchool;
  if (where === 'comp') { if (!G.comp.skip) add('bye', 'Tạm biệt, ai về nhà nấy'); }
  else if (where === 'meet') add('join', 'Đi chơi cùng nhau');
  else if (where === 'in') { }
  else if (atSch && !freeTime()) add('out', 'Trốn học');
  else if (where !== 'class') add('out', 'Rủ đi chơi');
  if (!hasNum(fid)) add('num', 'Xin số điện thoại');
  if (sellables().length) add('sell', 'Bán đồ');
  add('x', 'Rời đi');
  const note = grudge(fid) ? `<p class="warnbox">${F.name} đang giận vì bị bạn tố cáo (đến ${dateLabel(G.grudge[fid])}).</p>` : '';
  const c = ids[await UI.ask(F.name, `<p>${F.note}. <span class="hearts">${'♥'.repeat(hs)}<i>${'♥'.repeat(5 - hs)}</i></span></p>` + note, opts)] || 'x';
  if (c === 'talk') talkMenu(fid, where);
  else if (c === 'sell') sellMenu('f_' + fid, fid, F.name);
  else if (c === 'out') askOut(fid);
  else if (c === 'num') askNumber(fid);
  else if (c === 'join') { if (G.meet) G.meet.n = Math.max(1, G.meet.n); setComp(fid, false); UI.say(F.name, '“Tới rồi hả! Đi thôi, cậu dẫn đường đi.”'); }
  else if (c === 'bye') endComp(`${F.name} vẫy tay chào rồi đi về nhà.`, true);
};
// ACT.house (bấm chuông, vào nhà bạn chơi): xem 04d_life.js

/* ---------- hoạt cảnh ---------- */
// o: { map, me:[x,y,dir], actors:[{look,x,y,dir,hidden}], cam, props:[fn(now)], hide:[sid], title, below,
//      steps:[…] hoặc lines:[[who,text]] · inPlace: diễn ngay tại chỗ, không chuyển cảnh · bars:false: không có dải đen · stay: diễn xong ở lại chỗ mới }
// Bước: {say:[who,text]} · {move:[who,x,y,ms,hop,keep]} · {hop:who} · {wait:ms} · {fn} · {par:[bước…]} · {live: async sc => …} — who: 'me' hoặc chỉ số actor
function tween(who, x, y, ms, hop, keep) {
  return new Promise(res => {
    const sc = RT.scene, e = who === 'me' ? 'me' : sc.actors[who], cur = e === 'me' ? G : e;
    sc.tw.push({ who: e, x0: cur.x, y0: cur.y, x1: x === null ? cur.x : x, y1: y === null ? cur.y : y, ms: UI._fast ? 1 : ms, t: 0, hop: hop || 0, keep: !!keep, res });
  });
}
async function runStep(st, o) {
  const sc = RT.scene;
  if (st.say) {
    const a = st.say[0] === 'me' ? G : sc.actors[st.say[0]], text = st.say[1];
    sc.bubble = o.below ? { x: a.x, y: a.y + 4, text, below: true } : { x: a.x, y: a.y - 27, text };
    await UI.wait(1500 + text.length * 30); sc.bubble = null;
  } else if (st.move) await tween(...st.move);
  else if (st.hop !== undefined) await tween(st.hop, null, null, 300, 9, true);
  else if (st.wait) await UI.wait(st.wait);
  else if (st.fn) st.fn(sc);
  else if (st.par) await Promise.all(st.par.map(q => runStep(q, o)));
  else if (st.live) await st.live(sc);              // đoạn chơi được: hàm tự điều khiển cảnh (sc.drive mỗi khung hình), xong thì trả về
}
async function playCut(o) {
  const back = { map: G.map, x: G.x, y: G.y, dir: G.dir }, prev = RT.scene;      // đang trong tiết học mà diễn hoạt cảnh thì xong trả lại cảnh lớp học
  if (!o.inPlace) await UI.fade(true);
  if (o.me) setMap(o.map, o.me[0], o.me[1], o.me[2]);
  RT.scene = { type: 'cut', map: o.map || G.map, actors: o.actors || [], cam: o.cam, props: o.props || [], hide: o.hide || [], bubble: null, title: o.title || '', tw: [], bars: o.bars, hideMe: o.hideMe };
  UI.hint(null);
  if (o.bars !== false) document.body.classList.add('cut');
  if (!o.inPlace) await UI.fade(false);
  for (const st of (o.steps || (o.lines || []).map(l => ({ say: l })))) await runStep(st, o);
  if (!o.inPlace) await UI.fade(true);
  RT.scene = prev && prev.type !== 'cut' ? prev : null; document.body.classList.remove('cut');
  if (!o.stay) setMap(back.map, back.x, back.y, back.dir);
  if (!o.inPlace) await UI.fade(false);
}
// Việc có hoạt cảnh tại chỗ (lau nhà, rửa xe, đấm lưng): vừa diễn vừa hiện thanh tiến độ, xong mới tính thời gian + phần thưởng
async function animActivity(label, mins, cutDef, fn) {
  if (RT.lock) return;
  RT.lock = true;
  UI.progress(label, cutDef.est || 2600);
  await playCut(cutDef);
  advanceTime(mins);
  if (fn) fn();
  RT.lock = false; UI.hud();
}
// Lau nhà: cầm cây lau đi một vòng quanh phòng khách
function mopCut() {
  const pts = [[176, 150], [254, 150], [336, 150], [336, 192], [254, 192], [176, 192], [176, 96], [262, 82], [176, 62]];
  return {
    inPlace: true, bars: false, est: pts.length * 400,
    steps: pts.map(p => ({ move: ['me', p[0], p[1], 400] })),
    props: [now => drawSpr(SPR.mop, G.x + (G.dir === 1 || G.dir === 3 ? -13 : 5), G.y - 17 + (Math.floor(now / 130) % 2))],
  };
}
// Rửa xe: đứng cạnh xe cọ qua cọ lại, bọt xà phòng bay lên
function washCut(ax) {
  const y = 139;
  return {
    inPlace: true, bars: false, est: 3300,
    steps: [{ move: ['me', ax, y, 300] }, { fn: () => { G.dir = 3; } }, { move: ['me', ax - 11, y, 600, 0, true] }, { move: ['me', ax + 11, y, 800, 0, true] }, { move: ['me', ax - 9, y, 800, 0, true] }, { move: ['me', ax, y, 500, 0, true] }],
    props: [now => {
      drawSpr(SPR.sponge, G.x - 3 + Math.round(Math.sin(now / 90) * 3), G.y - 22);
      for (let i = 0; i < 5; i++) { const ph = (now / 900 + i * 0.2) % 1; drawSpr(SPR[i % 2 ? 'bub0' : 'bub1'], ax - 16 + i * 7 + Math.round(Math.sin(now / 300 + i) * 2), 126 - ph * 22); }
      for (let i = 0; i < 3; i++) wRect('#8fd0f0', ax - 10 + i * 9, 134 + ((now / 60 + i * 5) % 6), 1, 2);
    }],
  };
}
// Đấm lưng: đứng sát bên, nhún nhún đấm, bật tia "bụp bụp" sau lưng bố mẹ
function massageCut(n) {
  const x = n.cx + 11, y = n.cy + 1, steps = [{ move: ['me', x, y, 320] }, { fn: () => { G.dir = 1; } }];
  for (let i = 0; i < 8; i++) steps.push({ move: ['me', x, y, 240, 2, true] });
  return {
    inPlace: true, bars: false, est: 320 + 8 * 240, steps,
    props: [now => { const f = Math.floor(now / 240) % 2; if (f) drawSpr(SPR.hit, n.cx + 1, n.cy - 17); else drawSpr(SPR.hit, n.cx + 3, n.cy - 12); }],
  };
}
// Trèo tường: trốn ra (backIn = false) hoặc trèo về lại trường (backIn = true; caught: giám thị đứng chờ sẵn)
function wallCut(fid, backIn, caught) {
  const A = [150, 406], B = [174, 406], A2 = [150, 450], B2 = [174, 450], gt = { look: 'giamthi', x: 262, y: 400, dir: 1, hidden: true };
  const bang = sc => { sc.bang = true; if (sc.actors[1]) sc.actors[1].hidden = false; };
  const steps = backIn
    ? [{ say: ['me', 'Trèo vào lẹ lên, sắp hết giờ rồi!'] }, { move: ['me', A[0], A[1], 520, 26] }, { move: [0, B[0], B[1], 520, 26] }]
        .concat(caught
          ? [{ fn: bang }, { par: [{ hop: 'me' }, { hop: 0 }] }, { move: [1, 206, 404, 550] }, { say: [1, 'Đứng lại! Hai em trốn học phải không? Lên phòng giám thị ngay!'] }]
          : [{ say: [0, 'Phù… không ai thấy. Về lớp thôi!'] }])
    : [{ say: [0, 'Suỵt… bác bảo vệ đang quay lưng. Trèo lẹ!'] }, { move: ['me', A2[0], A2[1], 520, 26] }, { move: [0, B2[0], B2[1], 520, 26] }, { say: ['me', 'Thoát rồi! Chạy lẹ ra phố Hoa Phượng!'] }];
  return {
    map: 'school', me: backIn ? [A2[0], A2[1], 3] : [A[0], A[1], 0], actors: [{ look: fid, x: backIn ? B2[0] : B[0], y: backIn ? B2[1] : B[1], dir: backIn ? 3 : 0 }, gt],
    cam: { x: 176, y: 420 }, title: backIn ? 'Trèo tường về lại trường' : 'Trèo tường trốn học', steps, props: [bangProp],
  };
}
// Rình lúc bác bảo vệ sơ ý rồi lẻn qua cổng
function sneakCut(fid) {
  return {
    map: 'school', me: [338, 398, 0], actors: [{ look: fid, x: 362, y: 398, dir: 0 }], cam: { x: 350, y: 420 }, title: 'Rình bác bảo vệ sơ ý',
    steps: [{ say: [0, 'Bác bảo vệ đang gật gù kìa. Đi nhẹ thôi…'] }, { par: [{ move: ['me', 338, 452, 1000] }, { move: [0, 362, 452, 1000] }] }, { say: ['me', 'Trót lọt! Đi thôi!'] }],
  };
}
// Quay lại trường sau khi trốn học: lẻn qua cổng; bị bắt thì giám thị đứng chờ, hai đứa giật mình nhảy dựng lên
function gateBackCut(fid, caught) {
  const steps = [{ par: [{ move: ['me', 338, 402, 900] }, { move: [0, 362, 402, 900] }] }];
  if (caught) steps.push({ fn: sc => { sc.bang = true; sc.actors[1].hidden = false; } }, { par: [{ hop: 'me' }, { hop: 0 }] }, { move: [1, 300, 398, 500] }, { say: [1, 'Đứng lại! Hai em trốn học đi đâu về đấy? Lên phòng giám thị ngay!'] });
  else steps.push({ say: [0, 'Phù… không ai thấy. Về lớp thôi!'] });
  return {
    map: 'school', me: [338, 452, 3], actors: [{ look: fid, x: 362, y: 452, dir: 3 }, { look: 'giamthi', x: 240, y: 378, dir: 2, hidden: true }],
    cam: { x: 350, y: 420 }, title: 'Lẻn về trường', steps, props: [bangProp],
  };
}
// Phụ mẹ nấu ăn: đứng cạnh mẹ ở bếp thái rau, nồi bốc khói
function cookCut(n) {
  const x = n.cx + 18, y = n.cy + 1, steps = [{ move: ['me', x, y, 350] }, { fn: () => { G.dir = 3; } }];
  for (let i = 0; i < 9; i++) steps.push({ move: ['me', x, y, 230, 1.5, true] });
  return {
    inPlace: true, bars: false, est: 350 + 9 * 230, steps,
    props: [now => { smokeProp(now, n.cx, n.cy - 26); if (Math.floor(now / 230) % 2) drawSpr(SPR.hit, x - 4, y - 24); }],
  };
}
// Dấu "!" trên đầu khi bị bắt quả tang
function bangProp(now) {
  const sc = RT.scene; if (!sc.bang) return;
  const b = Math.floor(now / 160) % 2;
  drawSpr(SPR.emoBang, G.x - 3, G.y - 38 + (sc.meOy || 0) - b);
  const a = sc.actors[0]; if (a) drawSpr(SPR.emoBang, a.x - 3, a.y - 38 + (a.oy || 0) - b);
}
function smokeProp(now, x0, y0) { for (let i = 0; i < 3; i++) { const ph = (now / 1300 + i / 3) % 1; drawSpr(SPR[ph > 0.5 ? 'smoke1' : 'smoke0'], x0 - 4 + Math.round(Math.sin(now / 400 + i * 2) * 3), y0 - ph * 26); } }
// Cảnh ở chỗ đi chơi / chỗ quậy. gt: giám thị xuất hiện từ đâu, đi tới đâu (khi bị bắt trong trường)
const VENUE = {
  trasua: { map: 'pho', me: [500, 146, 2], fr: [524, 146, 1], title: 'Tiệm trà sữa Mây', lines: [[0, 'Trà sữa trân châu đường đen, full topping!'], ['me', 'Của tớ ít đá, nhiều trân châu nha.']], props: (a, b) => [() => { drawSpr(SPR.cup, a[0] + 6, a[1] - 13); drawSpr(SPR.cup, b[0] - 13, b[1] - 13); }] },
  arcade: { map: 'pho', me: [794, 146, 3], fr: [816, 146, 3], title: 'Khu game Arcade', lines: [[0, 'Đua xe không? Thua bao nước!'], ['me', 'Chơi luôn! Tớ chấp cậu nửa vòng.']] },
  tttm: { map: 'pho', me: [650, 140, 3], fr: [672, 140, 3], title: 'Rạp chiếu phim · Hoa Phượng Plaza', lines: [[0, 'Mua bắp rang chưa? Sắp chiếu rồi đó.'], ['me', 'Rồi nè. Ghế giữa hàng cuối, đẹp luôn!']] },
  dabong: { map: 'pho', me: [100, 344, 2], fr: [176, 344, 1], title: 'Sân bóng mini', lines: [[0, 'Chuyền đây! Sút nèee!'], ['me', 'Vàooo! Đỉnh quá!']], props: () => [now => drawSpr(SPR.ball, 134 + Math.round(Math.sin(now / 260) * 30), 338 - Math.round(Math.abs(Math.sin(now / 130)) * 5))] },
  nui: { map: 'nui', me: [230, 300, 2], fr: [258, 300, 1], title: 'Núi sau trường', lines: [[0, 'Trên này gió mát ghê. Nhìn kìa, trường mình bé tí!'], ['me', 'Ước gì ngày nào cũng được lên đây.']] },
  cantin: { map: 'school', me: [66, 120, 3], fr: [90, 120, 3], title: 'Căn tin giữa giờ học', lines: [[0, 'Cô ơi cho hai ly nước mía với bịch bánh tráng!'], ['me', 'Ngồi khuất vào, giám thị hay đi ngang lắm.']], gt: [170, 150, 116, 124] },
  thinghiem: { map: 'lab', me: [146, 156, 3], fr: [170, 156, 3], cam: { x: 160, y: 110 }, title: 'Phòng thí nghiệm Hoá', lines: [[0, 'Đổ lọ xanh vào lọ đỏ xem ra màu gì…'], ['me', 'Ối, bốc khói kìa! Mở cửa sổ lẹ!']], props: () => [now => smokeProp(now, 152, 120)], gt: [286, 200, 214, 166] },
  hutthuoc: { map: 'wcm', me: [62, 78, 2], fr: [94, 78, 1], cam: { x: 96, y: 60 }, title: 'Nhà vệ sinh nam', lines: [[0, 'Làm một hơi đi. Canh cửa giùm tớ.'], ['me', 'Khụ… khụ… sặc quá!']], props: () => [now => smokeProp(now, 78, 62)], gt: [150, 122, 128, 84] },
};
function venueCut(id, fid, caught, stay) {
  const V = VENUE[id], actors = [{ look: fid, x: V.fr[0], y: V.fr[1], dir: V.fr[2] }], steps = V.lines.map(l => ({ say: l }));
  if (caught && V.gt) {
    actors.push({ look: 'giamthi', x: V.gt[0], y: V.gt[1], dir: 3, hidden: true });
    steps.push({ fn: sc => { sc.bang = true; sc.actors[1].hidden = false; } }, { par: [{ hop: 'me' }, { hop: 0 }] }, { move: [1, V.gt[2], V.gt[3], 500] },
      { say: [1, id === 'hutthuoc' ? 'Hút thuốc trong trường à? Hai em theo tôi lên phòng giám thị!' : 'Giờ học mà làm gì ở đây? Lên phòng giám thị ngay!'] });
  }
  return { map: V.map, me: V.me, actors, cam: V.cam, title: V.title, steps, stay, props: (V.props ? V.props(V.me, V.fr) : []).concat(bangProp) };
}
// Gương nhà vệ sinh: phản chiếu khuôn mặt + thỏi son / bông phấn + lấp lánh
function mirrorProp(now, mx, look, kind, k) {
  const S = VIEW.S, fr = charSheet(look)[0][0];
  const [fx, fy, fw, fh] = faceRect(fr); ctx.drawImage(fr, fx, fy, fw, fh * (fr.hi ? 0.85 : 15 / 19), VIEW.ox + (mx + 3) * S, VIEW.oy + 9 * S, 18 * S, 15 * S);
  const sway = Math.round(Math.sin(now / 240 + k * 2.1) * 1.4);
  if (kind === 'son') drawSpr(SPR.lipstick, mx + 12 + sway, 17); else drawSpr(SPR.puff, mx + 15 + sway, 15 + Math.round(Math.cos(now / 240 + k) * 1.2));
  const f = Math.floor(now / 160 + k * 3);
  if (f % 4 !== 3) drawSpr(SPR['sparkle' + (f % 2)], mx + 1 + ((f >> 2) % 2) * 17, 8 + ((f >> 3) % 2) * 6);
}
function yoyoProp(now, hx, fy, spr, ph) {
  const d = 3 + Math.abs(Math.sin(now / 230 + ph)) * 10;
  wRect('#fffaf0', hx, fy - 9, 1, d); drawSpr(SPR[spr], hx - 3, fy - 9 + d);
}
function topProp(now, x0, y0, spr, k) {
  const wob = Math.round(Math.sin(now / 320 + k * 3) * 2);
  drawSpr(SPR[spr + (Math.floor(now / 70) % 2)], x0 + wob, y0 - 9);
  if (Math.floor(now / 120 + k) % 2) wRect('#c9b58a', x0 + wob - 2 + k * 9, y0 + 1, 2, 1);
}
function cardsProp(now, x0, y0) {
  drawSpr(SPR.cardPile, x0, y0);
  const f = Math.floor(now / 420) % 4;
  drawSpr(SPR[f % 2 ? 'cardFace' : 'cardBack'], x0 - 8 + f * 7, y0 - 7 - (f % 2) * 2);
}
function wcCut(fid, kind) {
  const m1 = WC_MIRRORS[1], m2 = WC_MIRRORS[2];
  const lines = kind === 'son'
    ? [[0, 'Tớ mới mua thỏi son màu cam đất nè. Thử không?'], ['me', 'Cho tớ quẹt thử một tí!'], [0, 'Xinh ghê! Nhớ lau bớt trước khi vào lớp kẻo cô la.']]
    : [[0, 'Dặm tí phấn cho tươi tỉnh nào.'], ['me', 'Kẻ mắt giùm tớ với…'], [0, 'Xong! Chuông reo rồi, chạy lẹ!']];
  return {
    map: 'wc', me: [m1 + 12, 68, 3], actors: [{ look: fid, x: m2 + 12, y: 68, dir: 3 }], cam: { x: 96, y: 60 }, lines, below: true,   // thoại hiện dưới chân để không che gương
    title: kind === 'son' ? 'Giải lao · tô son trong nhà vệ sinh nữ' : 'Giải lao · trang điểm trong nhà vệ sinh nữ',
    props: [now => mirrorProp(now, m1, G.gender, kind, 0), now => mirrorProp(now, m2, fid, kind, 1)],
  };
}
function yardCut(fid, kind, inClass) {
  const yo = kind === 'yoyo';
  if (inClass) return {       // trong giờ học: chọi con quay lén ở lối đi cuối lớp
    map: 'class', me: [146, 164, 2], actors: [{ look: fid, x: 172, y: 164, dir: 1 }], cam: { x: 160, y: 140 }, hide: [fid], title: 'Trong giờ học · lén chọi con quay',
    lines: [[0, 'Quay khẽ thôi, cô đang viết bảng…'], ['me', 'Của tớ quay lâu hơn nè!']], props: [now => topProp(now, 153, 170, 'top', 0), now => topProp(now, 162, 170, 'topB', 1)],
  };
  return {
    map: 'school', me: [222, 250, 2], cam: { x: 243, y: 240 }, title: yo ? 'Giải lao · chơi yoyo' : 'Giải lao · chọi con quay',
    actors: [{ look: fid, x: 264, y: 250, dir: 1 }, { look: 'c5', x: 243, y: 224, dir: 0 }, { look: 'c1', x: 243, y: 280, dir: 3 }],
    lines: yo
      ? [[0, 'Xem tớ “dắt chó đi dạo” nè!'], ['me', 'Chưa ăn thua. Coi chiêu “vòng quanh thế giới” đây!'], [1, 'Đỉnh dữ vậy trời!']]
      : [[0, 'Con quay tớ mới chuốt lại mũi đinh đó. Chọi không?'], ['me', 'Chọi thì chọi! Một… hai… ba!'], [1, 'Quay tít luôn kìa! Coi chừng văng!']],
    props: yo ? [now => yoyoProp(now, 231, 250, 'yoyo', 0), now => yoyoProp(now, 255, 250, 'yoyoB', 1.3)] : [now => topProp(now, 236, 256, 'top', 0), now => topProp(now, 245, 256, 'topB', 1)],
  };
}
const CUTS = {
  son: fid => wcCut(fid, 'son'), phan: fid => wcCut(fid, 'phan'),
  yoyo: fid => yardCut(fid, 'yoyo'), conquay: (fid, inClass) => yardCut(fid, 'conquay', inClass),
  danhbai: fid => ({
    map: 'class', me: [146, 164, 2], actors: [{ look: fid, x: 172, y: 164, dir: 1 }, { look: 'c5', x: 159, y: 148, dir: 0 }], cam: { x: 160, y: 140 }, hide: [fid],
    title: 'Giải lao · ván tiến lên chớp nhoáng cuối lớp',
    lines: [[0, 'Chia bài lẹ lên, có 10 phút thôi đó!'], ['me', 'Ba bích đi trước nha. Đôi heo chặt nè!'], [1, 'Suỵt! Canh cửa đi, giám thị đi ngang là toi…']],
    props: [now => cardsProp(now, 153, 163)],
  }),
};

/* ---------- trò riêng với bạn cùng giới (giờ ra chơi hoặc lén trong giờ học) ---------- */
const BREAK_DONE = { son: 'Rủ nhau đi vệ sinh, tô son trước gương', phan: 'Rủ nhau đi vệ sinh, trang điểm trước gương', yoyo: 'Chơi yoyo', conquay: 'Chọi con quay', danhbai: 'Đánh ván tiến lên' };
// Lõi: diễn hoạt cảnh + cộng điểm + xét rủi ro. inClass = làm ngay trong giờ học (dễ bị cô bắt hơn)
async function breakFunCore(fid, id, inClass) {
  const B = BREAK_FUN[id], F = FRIENDS[fid], kind = id === 'wc' ? pick(['son', 'phan']) : id, L = [];
  await playCut(CUTS[kind](fid, inClass));
  G.daily.brk[fid] = (G.daily.brk[fid] || 0) + 1;
  addFriend(fid, B.friend);
  L.push(li(`${BREAK_DONE[kind]} cùng ${F.name}.`, 'good'));
  if (B.kheotay) addStat('kheotay', B.kheotay);
  const risk = (B.risk || 0) + (inClass ? IN_CLASS.riskAdd : 0);
  if (risk) {
    if (Math.random() < risk + 0.03 * G.caughtCycle) {
      if (inClass) { const sev = id === 'danhbai' ? 2 : 1; await caughtScene(fid, id, sev); L.push(...caughtInClass({ sev, what: id === 'wc' ? 'Hai đứa đi quá lâu, vào lớp cô hỏi tội' : 'Cô quay xuống đúng lúc' })); }
      else if (id === 'danhbai') { G.caughtCycle++; addConduct(-0.5, 'đánh bài trong trường'); addTeacher(TEACHER.caughtFun, 'nghiem'); L.push(li('Thầy giám thị đi ngang cửa sổ, tịch thu bộ bài.', 'bad')); }
      else { addTeacher(-1, 'hanh'); L.push(li('Vào lớp cô nhìn thấy vệt son: “Em kia, ra rửa mặt ngay!” — bị nhắc nhở trước lớp.', 'warn')); }
    } else L.push(li(inClass ? `${classTeacher().co.replace(/^./, c => c.toUpperCase())} không để ý. Trót lọt!` : id === 'danhbai' ? 'Nghe tiếng dép giám thị là cất bài vội vào cặp. Không ai phát hiện!' : 'Kịp lau bớt son trước khi vào lớp. Không ai để ý!', 'dim'));
  }
  return L;
}
async function doBreakFun(fid, id) {
  if (RT.lock) return;
  RT.lock = true;
  const L = await breakFunCore(fid, id, false);
  advanceTime(BREAK_FUN_MINS);
  RT.lock = false; UI.hud();
  if (L.some(x => /class="(bad|warn)"/.test(x))) await UI.ask(BREAK_FUN[id].name.replace(/^Rủ /, '').replace(/^./, c => c.toUpperCase()), resWrap(L), ['OK']);
}
// Chọn một người bằng ô avatar + tên (người: { look, outfit, name }); trả về chỉ số, hoặc -1 nếu bấm nút cuối / Esc
async function pickPerson(title, html, people, cancel) {
  const btns = people.map(p => `<img src="${faceOf(p.look, p.outfit || null)}" alt=""><b>${p.name}</b>`).concat(cancel || 'Thôi');
  const k = await UI.ask(title, html || '', btns, { grid: true, cls: 'avas' });
  return k >= 0 && k < people.length ? k : -1;
}
const friendPeople = fids => fids.map(f => ({ look: f, name: FRIENDS[f].name }));
// TRONG GIỜ HỌC (bấm Q lúc cô đang giảng): quay sang bạn tám chuyện, đấu thẻ, chơi bài, chọi con quay; nữ: xin ra ngoài đi vệ sinh chung.
// Trả về null nếu đổi ý nghe giảng tiếp; ngược lại { delta, lines } (mất tập trung, có thể bị cô bắt).
async function classAction(p, subj) {
  const fids = Object.keys(FRIENDS).filter(f => !grudge(f) && !FRIENDS[f].senior);          // chị Ngân học lớp 11, không ngồi trong lớp mình
  if (!fids.length) { UI.toast('Mấy đứa bạn đang giận, chẳng ai thèm quay sang chơi với bạn.'); return null; }
  const k = await pickPerson('Quay sang ai?', '', friendPeople(fids), 'Thôi, nghe giảng tiếp');
  if (k < 0) return null;
  const fid = fids[k], F = FRIENDS[fid], opts = ['Thì thầm tám chuyện'], ids = ['chat'];
  if (cardCount() && !G.daily.duel['f_' + fid]) { opts.push('Đấu thẻ cầu thủ dưới gầm bàn'); ids.push('duel'); }
  const same = F.g === G.gender && hearts(fid) >= BREAK_FUN_MIN_HEARTS && (G.daily.brk[fid] || 0) < BREAK_FUN_PER_DAY;
  if (same && G.gender === 'girl') { opts.push(`Xin cô ra ngoài, rủ ${F.name} đi vệ sinh chung`); ids.push('wc'); }
  if (same && G.gender === 'boy') { opts.push('Chơi bài dưới gầm bàn'); ids.push('danhbai'); opts.push('Lén chọi con quay'); ids.push('conquay'); }
  opts.push('Thôi, nghe giảng tiếp'); ids.push('x');
  const a = ids[await UI.ask(F.name, `<p>${F.name} liếc sang: “Gì đó? Cô đang nhìn kìa…”</p>`, opts)] || 'x';
  if (a === 'x') return null;
  let L = [];
  const roll = r => Math.random() < r + 0.05 * G.caughtCycle;
  if (a === 'chat') {
    const caught = roll(IN_CLASS.chat.risk), light = G.caughtCycle === 0;
    if (inClassScene()) await playCut(classFunCut('tam', fid, caught ? (light ? 'light' : 'hard') : null));
    addFriend(fid, IN_CLASS.chat.friend); L.push(li(`Thì thầm tám chuyện với ${F.name}.`, 'warn'));
    if (caught) L.push(...caughtInClass({ sev: 1 }));
  } else if (a === 'duel') {
    const r = await cardDuel('f_' + fid, fid, F.name, F.duel); L.push(li(r === null ? 'Chưa kịp đấu thì thôi.' : `Đấu thẻ dưới gầm bàn với ${F.name}.`, 'warn'));
    if (r !== null && roll(IN_CLASS.duelRisk)) { await caughtScene(fid, 'duel', 1); L.push(...caughtInClass({ sev: 1 })); }
  }
  else L = await breakFunCore(fid, a, true);
  return { delta: IN_CLASS.delta, lines: L };
}

/* ---------- quên sách: quay sang hỏi mượn bạn ---------- */
const borrowChance = fid => clamp((fid === 'khoa' ? BORROW.deskmate : BORROW.other) + BORROW.perHeart * hearts(fid) + (grudge(fid) ? BORROW.grudge : 0), 0.03, 0.95);
async function askBorrow(subj) {
  const item = `sách ${SUBJ[subj].short}`, fids = Object.keys(FRIENDS), L = [];
  const c = await pickPerson('Quên sách', `<p><i>Thôi chết… lục tung cả cặp mà không thấy ${item} đâu. Chắc để quên ở nhà rồi. Quay sang hỏi mượn ai bây giờ?</i></p>`, friendPeople(fids), 'Thôi, ngồi nghe chay');
  if (c < 0) return { gain: 1, lines: [li('Quên sách, ngồi nghe chay.', 'warn')] };
  const fid = fids[c], F = FRIENDS[fid];
  let gain = 1;
  if (Math.random() < borrowChance(fid)) {
    gain = fid === 'khoa' ? 3 : 4; addFriend(fid, 1);
    L.push(li(fid === 'khoa' ? `${F.name} đẩy sách ra giữa bàn cho xem chung.` : `${F.name} đưa sách cho mượn, bạn ấy xem chung với bạn cùng bàn.`, 'good'));
  } else L.push(li(grudge(fid) ? `${F.name} quay mặt đi: “Đi mà mượn giám thị ấy.”` : `${F.name} lắc đầu: “Tớ cũng đang cần sách, cậu hỏi bạn khác đi.”`, 'warn'));
  if (fid !== 'khoa' && Math.random() < BORROW.scold) L.push(li('Cô gõ thước: “Em kia, đừng quay ngang quay ngửa!”', 'warn'));
  return { gain, lines: L };
}

/* ---------- sự kiện nho nhỏ trong giờ học ---------- */
// Trả về { delta: thay đổi điểm bài học, lines }
async function classEvent(subj) {
  const S = SUBJ[subj], stat = statOfSubj(subj), L = [], co = TEACHER_OF[subj] === 'teacherC' ? 'Thầy' : 'Cô';
  const ok = Object.keys(FRIENDS).filter(f => !grudge(f)), fid = ok.length ? pick(ok) : null, F = fid && FRIENDS[fid];
  const list = ['phatbieu', 'ngoaile', 'kiemtrasach'];
  if (fid) list.push('thutay', 'nhacbai'); if (!grudge('khoa')) list.push('hoibai');
  const id = pick(list), T = `Trong giờ ${S.name}`;
  let delta = 0;
  if (id === 'phatbieu') {
    const c = await UI.ask(T, `<p>${co} đặt một câu hỏi khó rồi nhìn quanh lớp: “Bạn nào trả lời được nào?”</p>`, ['Giơ tay phát biểu', 'Ngồi im']);
    if (c !== 0) return { delta, lines: L };
    if (Math.random() < clamp(0.35 + 0.1 * lv(stat), 0.2, 0.95)) { delta = 2; addTeacher(TEACHER.answer); L.push(li(`Giơ tay trả lời đúng — ${co.toLowerCase()} khen trước lớp.`, 'good')); }
    else { L.push(li(`Trả lời chưa đúng, nhưng ${co.toLowerCase()} khen tinh thần xây dựng bài.`, 'warn')); }
  } else if (id === 'thutay') {
    const c = await UI.ask(T, `<p>Một mẩu giấy gấp tư được chuyền tới bàn bạn. Chữ của <b>${F.name}</b>: “Tan học đi chơi không? Trả lời tớ nha!”</p>`, ['Viết trả lời rồi chuyền lại', 'Cất đi, tập trung học']);
    if (c !== 0) return { delta: 1, lines: L };
    delta = -1; addFriend(fid, 3);
    if (Math.random() < 0.18 + 0.04 * G.caughtCycle) { addTeacher(-1); L.push(li(`${co} bắt được mẩu giấy và đọc to trước lớp. Ngượng chín mặt!`, 'bad')); }
  } else if (id === 'hoibai') {
    const c = await UI.ask(T, `<p><b>${FRIENDS.khoa.name}</b> huých tay bạn thì thào: “Ê, chỗ này làm sao vậy? Giảng tớ với.”</p>`, [`Giảng lại cho ${FRIENDS.khoa.name}`, '“Suỵt, nghe giảng đi!”']);
    if (c !== 0) return { delta, lines: L };
    addFriend('khoa', 3);
    if (lv(stat) >= 1) delta = 1; else L.push(li('Bạn cũng chưa hiểu lắm… hai đứa cùng ngơ ngác.', 'warn'));
  } else if (id === 'nhacbai') {
    const c = await UI.ask(T, `<p><b>${F.name}</b> bị gọi lên bảng trả bài, đứng ấp úng, liếc xuống bạn cầu cứu.</p>`, ['Nhắc bài cho bạn', 'Ngồi im']);
    if (c !== 0) { addFriend(fid, -1); return { delta, lines: L }; }
    const caught = Math.random() < clamp(0.3 - 0.04 * (teacherLv() - 1), 0.08, 0.5);
    if (inClassScene() && SEAT_OF[fid]) await playCut(promptCut(fid, subj, caught));
    if (caught) { addFriend(fid, 3); addTeacher(-2); L.push(li(`${co} quay phắt lại: “Em nào nhắc bài đấy?” — cả hai bị phê bình.`, 'bad')); }
    else { addFriend(fid, 5); L.push(li(`Nhắc bài trót lọt, ${F.name} thoát hiểm.`, 'good')); }
  } else if (id === 'ngoaile') {
    G.stamina = Math.min(maxStam(), G.stamina + 4);
    L.push(li(`${co} kể chuyện thời đi học của mình, cả lớp cười nghiêng ngả.`, 'good'));
  } else if (G.bag['sach_' + subj]) { addTeacher(TEACHER.notebook); L.push(li(`${co} đi một vòng kiểm tra xem ai quên sách: bạn mang đầy đủ, được khen.`, 'good')); }
  else { addTeacher(TEACHER.noNotebook); L.push(li(`${co} đi một vòng kiểm tra: bạn không mang sách — bị ghi tên vào sổ.`, 'bad')); }
  return { delta, lines: L };
}

/* ---------- sự kiện giờ nghỉ trưa ---------- */
// Lời rủ của bạn thân giờ trưa: chỉ khi đã thân (từ 1 tim) và đã cho số điện thoại — bạn nhắn tin, mình trả lời trong điện thoại
const LUNCH_JOIN = {
  onnhom: { fid: 'vy', msg: s => `Trưa nay tớ với mấy bạn ôn ${SUBJ[s].name} ở thư viện, cậu vào không? Tớ đang ôm một chồng sách ngoài sân, ra phụ tớ bê với!`, yes: 'Ok, tớ ra phụ cậu bê sách liền!' },
  guitar: { fid: 'dat', msg: () => 'Ra ghế đá dưới gốc phượng đi, tớ mang guitar rồi, hát chung cho vui!', yes: 'Tới liền! Nhớ chừa chỗ cho tớ.' },
  khao: { fid: 'khoa', msg: () => 'Hôm qua tớ trúng thưởng nắp chai! Ra căn tin tớ khao trà đá với bánh tráng nướng nè!', yes: 'Có khao là có tớ, ra liền!' },
  tapchi: { fid: 'ngan', msg: () => 'Tớ mới mua tạp chí tuần này, có bài trắc nghiệm tính cách vui lắm. Ra ghế đá làm thử với tớ không?', yes: 'Ra liền, chờ tớ với!' },
};
const canPing = fid => !grudge(fid) && hasNum(fid) && hearts(fid) >= 1;
function rollLunchEvent() {
  const list = ['bongda', 'trucnhat'];
  for (const k in LUNCH_JOIN) if (canPing(LUNCH_JOIN[k].fid)) list.push(k);
  if (cardCount()) list.push('giaithe');
  return pick(list);
}
async function runLunchEvent(id) {
  G.daily.lunchEv = true;
  const T = 'Giờ nghỉ trưa';
  if (id === 'bongda') {
    const c = await UI.ask(`${T} · Trận cầu giao hữu`, '<p>Lớp 10A2 kéo sang thách đấu bóng đá ngoài sân thể dục. Cả lớp nhìn bạn: “Vào đá cho đủ đội đi!”</p>', ['Xắn quần vào sân!', 'Thôi, tớ ngồi cổ vũ']);
    if (c !== 0) return;
    if (G.stamina < 10) return UI.toast('Mệt quá, đá không nổi.', 'bad');
    RT.lock = true;
    const r = gameRes(await sceneKeepup(2 + Math.floor(Math.random() * 2), 'Giao hữu 10A1 – 10A2: tâng bóng', { ball: true }));
    useStam(10, true); addStat('thethao', r.win ? 8 : 3);
    if (r.win) for (const f in FRIENDS) addFriend(f, 2, true);
    advanceTime(30); RT.lock = false; UI.hud();
    UI.toast(r.win ? '10A1 thắng! Cả lớp reo hò.' : 'Thua sát nút… nhưng đá vui là chính.', r.win ? 'good' : 'info');
  } else if (LUNCH_JOIN[id]) {
    // bạn nhắn tin rủ — trả lời trong điện thoại
    const J = LUNCH_JOIN[id], up = upcomingTests(8).find(t => t.day >= G.day && t.day <= G.day + 3 && BOOK_SUBJ.includes(t.subj)), s = up ? up.subj : pick(BOOK_SUBJ);
    if (!canPing(J.fid)) return;
    G.phone.act = { fid: J.fid, kind: id, subj: s, review: up && up.day <= G.day + 1 ? up.day : null, day: G.day, exp: PM_START - 15 };
    inbox(J.fid, J.msg(s));
  } else if (id === 'trucnhat') {
    const c = await UI.ask(`${T} · Trực nhật`, '<p>Cô chủ nhiệm ghé lớp: “Em ở lại giúp cô lau bảng, tưới mấy chậu cây và xếp lại bàn ghế nhé?”</p>', ['Dạ, để em làm ạ', '“Em… em đang bận ạ”']);
    if (c !== 0) return;
    if (G.stamina < 5) return UI.toast('Mệt quá, làm không nổi.', 'bad');
    await activity('Đang trực nhật giúp cô…', 20, () => { useStam(5, true); addTeacher(TEACHER.duty, 'hanh'); addStat('kheotay', 2); if (G.conduct < 10) addConduct(0.25, 'chăm chỉ trực nhật'); });
  } else if (id === 'giaithe') {
    const c = await UI.ask(`${T} · Giải đấu thẻ`, '<p>Đám con trai lớp bên bày thẻ cầu thủ ra bậc thềm: “Ai thắng được bọn tớ thì được thêm một gói bim bim!”</p>', ['Vào đấu', 'Thôi']);
    if (c !== 0) return;
    const r = await cardDuel('giai', null, 'cao thủ lớp bên', 'kha', { free: true });
    if (r === 1) await showPack(openPacks(1), 'Phần thưởng giải đấu');
  }
}
// lời rủ giờ trưa còn hiệu lực (chưa trả lời, chưa hết giờ nghỉ trưa)
function lunchAct() {
  const j = G.phone.act;
  if (j && (j.day !== G.day || G.time >= j.exp)) { G.phone.act = null; pushMsg(j.fid, false, 'Thôi tụi tớ xong rồi, lần sau nha!'); return null; }
  return j;
}
// Nhận lời qua điện thoại → hoạt cảnh làm cùng bạn rồi mới tính điểm, thời gian
async function lunchJoin(fid, j) {
  if (RT.lock) return;
  RT.lock = true;
  const F = FRIENDS[fid], s = j.subj, bob = () => Math.floor(performance.now() / 200) % 2;
  if (j.kind === 'onnhom') {
    const [dx, dy] = LIB_DOOR;
    const books = now => { const sc = RT.scene; for (const a of [G, sc.actors[0]]) { wRect('#3b82c4', a.x - 5, a.y - 26 + bob(), 10, 3); wRect('#e2574c', a.x - 4, a.y - 29 + bob(), 9, 3); wRect('#f2c94c', a.x - 5, a.y - 32 + bob(), 10, 3); } };
    await playCut({ map: 'school', me: [dx + 150, dy - 20, 1], cam: { x: dx + 80, y: dy - 20 }, title: 'Bê sách cùng Vy ra thư viện', hide: ['vy'], actors: [{ look: 'vy', x: dx + 130, y: dy - 24, dir: 2 }], props: [books],
      steps: [{ say: [0, 'Cậu tới rồi! Cầm giúp tớ nửa chồng này nha, nặng ghê.'] }, { say: ['me', 'Đưa đây! Ôi, đề cương gì mà dày thế…'] },
        { par: [{ move: [0, dx + 20, dy + 12, 1500] }, { move: ['me', dx + 40, dy + 14, 1500] }] }, { say: [0, `Hôm nay ôn ${SUBJ[s].name} nha, sắp kiểm tra rồi.`] },
        { par: [{ move: [0, dx - 4, dy + 8, 500] }, { move: ['me', dx + 8, dy + 8, 500] }] }, { par: [{ move: [0, dx - 4, dy - 6, 300] }, { move: ['me', dx + 8, dy - 6, 300] }] }] });
    const pages = now => { for (const [x, y] of [[58, 112], [78, 112], [66, 120], [86, 120]]) { wRect('#fffaf0', x, y, 8, 5); wRect('#8fa0ab', x + 1, y + 2 + (bob() && x % 2 ? 1 : 0), 6, 1); } };
    await playCut({ map: 'thuvien', me: [96, 132, 1], cam: { x: 120, y: 100 }, title: `Ôn ${SUBJ[s].name} cùng nhóm của Vy`, actors: [{ look: 'vy', x: 40, y: 132, dir: 2 }, { look: 'c1', x: 52, y: 100, dir: 0 }, { look: 'c4', x: 84, y: 100, dir: 0 }], props: [pages],
      steps: [{ say: [0, 'Phần này hay ra lắm, cậu ghi lại đi.'] }, { say: [1, 'Câu này làm sao vậy Vy?'] }, { say: ['me', 'À, để tớ giảng thử… à hiểu rồi!'] }, { say: [2, 'Ôn nhóm vui ghê, mai kiểm tra chắc ổn!'] }] });
    advanceTime(40); useStam(4); addStat(s, 5); addFriend('vy', 4);
    if (j.review) G.review[s] = Math.max(G.review[s] === undefined ? -1 : G.review[s], j.review);
  } else if (j.kind === 'guitar') {
    const [bx, by] = [136, 172], notes = now => { const t = now / 1000; for (let i = 0; i < 3; i++) { const k = (t * 0.8 + i / 3) % 1; wRect('#7a5fc9', bx + 6 + i * 8 + Math.sin(k * 6) * 3, by - 18 - k * 22, 2, 2); wRect('#7a5fc9', bx + 7 + i * 8 + Math.sin(k * 6) * 3, by - 22 - k * 22, 1, 4); } drawSpr(SPR.guitar, bx + 4, by - 20); };
    await playCut({ map: 'school', me: [bx + 46, by + 12, 1], cam: { x: bx + 20, y: by }, title: `Hát cùng ${FRIENDS.dat.name} dưới gốc phượng`, hide: ['dat'], actors: [{ look: 'dat', x: bx + 12, y: by + 10, dir: 0 }, { look: 'c2', x: bx - 6, y: by + 22, dir: 2 }, { look: 'x3', x: bx + 30, y: by + 26, dir: 1 }], props: [notes],
      steps: [{ say: [0, 'Ngồi xuống đây! Bài này ai cũng thuộc nè.'] }, { move: ['me', bx + 26, by + 14, 400] }, { fn: () => { G.dir = 1; } }, { say: ['me', 'La la la… hát to lên nào!'] }, { say: [1, 'Đạt đánh đàn hay ghê!'] }, { say: [0, 'Mai mốt tụi mình lập ban nhạc đi!'] }] });
    advanceTime(20); gainStam(8); addStat('vannghe', 3); addFriend('dat', 4);
  } else if (j.kind === 'khao') {
    const snack = now => { for (const [a, k] of [[G, 0], [RT.scene.actors[0], 1]]) { wRect('#c9862f', a.x + 4, a.y - 16 + ((bob() + k) % 2), 5, 3); wRect('#c9e9f2', a.x - 8, a.y - 18, 3, 5); } };
    await playCut({ map: 'school', me: [96, 128, 3], cam: { x: 80, y: 110 }, title: `${FRIENDS.khoa.name} khao ăn vặt ở căn tin`, hide: ['khoa'], actors: [{ look: 'khoa', x: 72, y: 126, dir: 3 }, { look: 'c3', x: 56, y: 134, dir: 2 }], props: [snack],
      steps: [{ say: [0, 'Cô ơi cho con ba ly trà đá với ba bịch bánh tráng nướng!'] }, { fn: sc => { G.dir = 1; sc.actors[0].dir = 2; } }, { say: ['me', `${FRIENDS.khoa.name} hôm nay chơi lớn ghê!`] }, { say: [0, 'Trúng nắp chai mà, ăn đi đừng ngại!'] }, { say: [1, 'Giòn quá trời luôn!'] }] });
    advanceTime(10); gainStam(10); addFriend('khoa', 3); 
  } else if (j.kind === 'tapchi') {
    const [bx, by] = [396, 172], mag = now => { const a = RT.scene.actors[0]; wRect('#e98fa5', a.x + 4, a.y - 20, 9, 7); wRect('#fffaf0', a.x + 5, a.y - 19 + bob(), 7, 2); };
    await playCut({ map: 'school', me: [bx + 40, by + 12, 1], cam: { x: bx + 16, y: by }, title: 'Đọc tạp chí cùng Ngân', hide: ['ngan'], actors: [{ look: 'ngan', x: bx + 8, y: by + 12, dir: 2 }], props: [mag],
      steps: [{ say: [0, 'Câu 1: Đi chơi cậu thích lên núi hay ra biển?'] }, { move: ['me', bx + 24, by + 12, 400] }, { fn: () => { G.dir = 1; } }, { say: ['me', 'Biển! Có trà sữa thì càng tốt.'] }, { say: [0, 'Kết quả: cậu là kiểu người vui vẻ, ai cũng quý! Đúng ghê!'] }, { say: ['me', 'Haha, tạp chí nói chuẩn quá!'] }] });
    advanceTime(20); gainStam(5); addFriend('ngan', 4);
  }
  RT.lock = false; UI.hud();
}
/* ---------- phố Hoa Phượng: trà sữa · TTTM · khu game · xiên que, kem ---------- */
const withF = fid => (fid ? ` cùng ${FRIENDS[fid].name}` : '');
ACT.tea = () => {
  const P = PLACES.tea; if (RT.lock || !placeOpen(P)) return;
  const fid = palAt('tea'), wf = withF(fid), T = TEA;
  UI.store(P.name, '“Em uống gì nè?”', () => [
    { id: 'trasua', name: 'Trà sữa trân châu', price: T.cup.price, desc: `Ly to, trân châu đường đen${fid ? ' — mời cả ' + FRIENDS[fid].name + ' uống chung' : ''}`, inv: 'trasua' },
    { id: 'tradao', name: 'Trà đào', price: T.togo.price, desc: 'Ly trà đào cam sả mát lạnh', inv: 'tradao' },
  ], it => buyFood(it.id, it.price, it.name));
};
// ACT.mall / ACT.arcade: giờ đi hẳn vào bên trong (xem 04d_life.js)
ACT.cart = () => {
  if (!inWin(G.time, 600, 1290)) return UI.say('Xe xiên que', 'Xe chưa dọn hàng.<p class="dim">Bán từ 10:00 đến 21:30.</p>');
  const fid = palAt('cart'), wf = withF(fid);
  UI.store('Xe xiên que', '“Xiên gì con? Cá viên, xúc xích, đậu hũ, kem ốc quế, đủ hết!”', () => [
    { id: 'xien', name: 'Đĩa xiên que', price: 10000, desc: 'Cá viên, xúc xích chấm tương', inv: 'xien' },
    { id: 'kem', name: 'Kem ốc quế', price: 8000, desc: 'Mát lạnh, ăn lẹ kẻo chảy', inv: 'kem' },
  ], it => buyFood(it.id, it.price, it.name));
};
// ACT.field (đá bóng có hoạt ảnh): xem 04d_life.js

/* ---------- núi sau trường ---------- */
ACT.picnic = async () => {
  if (G.daily.hill.picnic) return UI.toast('Hôm nay picnic rồi, hôm khác lại lên nhé.');
  const fid = palAt('nui'), wf = withF(fid);
  const foods = Object.keys(FOODS).filter(id => G.inv[id]).sort((a, b) => FOODS[b].stam - FOODS[a].stam), best = foods[0];
  const gain = PICNIC.base + (best ? Math.round(FOODS[best].stam * 1.5) : 0);
  const c = await UI.ask('Bãi cỏ picnic', `<p>Bãi cỏ thoai thoải đầy hoa dại, gió thổi lồng lộng.${best ? ` Bạn mang theo ${FOODS[best].name.toLowerCase()}.` : ' Bạn không mang gì để ăn, chỉ nằm hóng gió được thôi.'}</p>`, [`Trải bạt picnic${wf}`, 'Thôi']);
  if (c !== 0) return;
  await jointAct(`Đang picnic${wf}…`, PICNIC.mins, 'picnic', fid, () => { G.daily.hill.picnic = true; if (best) G.inv[best]--; gainStam(gain); palGain('nui', PICNIC.friend); addMemo('scene', 'picnic'); });
};
ACT.summit = async () => {
  if (G.daily.hill.view) return UI.toast('Hôm nay bạn ngắm cảnh trên đỉnh rồi.');
  const sunset = inWin(G.time, CFG.SCHOOL_END, 1110), fid = palAt('nui');
  await jointAct(sunset ? 'Ngắm hoàng hôn trên đỉnh núi…' : 'Ngắm cảnh trên đỉnh núi…', 20, 'view', fid, () => {
    G.daily.hill.view = true; gainStam(sunset ? 12 : 8); palGain('nui', 6);
    UI.toast(sunset ? 'Mặt trời đỏ ối lặn sau dãy núi xa. Đẹp nao lòng.' : 'Từ đây nhìn xuống thấy cả ngôi trường bé xíu.', 'good');
  });
};
ACT.stream = () => {
  if (G.daily.hill.wash) return UI.toast('Nước hồ mát lạnh. Hôm nay bạn rửa mặt rồi.');
  G.daily.hill.wash = true; gainStam(5); UI.toast('Vốc nước hồ rửa mặt, tỉnh cả người.', 'good'); UI.hud();
};
ACT.hike = async () => {
  if (G.daily.hill.hike) return UI.toast('Hôm nay chạy leo dốc rồi, mai chạy tiếp.');
  if (G.stamina < 12) return UI.toast('Không đủ thể lực.', 'bad');
  await activity('Đang chạy bộ leo dốc…', 30, () => { G.daily.hill.hike = true; useStam(12, true); addStat('thethao', 7); });
};

/* ---------- thẻ cầu thủ ---------- */
const cardCount = () => Object.values(G.cards).reduce((s, n) => s + n, 0);
const cardKinds = () => CARDS.filter(c => G.cards[c.id] > 0).length;
const starsOf = c => '★'.repeat(c.r + 1);
const statLine = c => CARD_STATS.map(([k, , s]) => `${s} ${c[k]}`).join(' · ');
// Bóc thẻ: không truyền tỉ lệ thì dùng tỉ lệ gói bim bim — hôm nào may mắn thì dễ ra thẻ hiếm hơn
function rollCard(w) {
  if (!w) { const L = G ? luckK() : 0; w = CARD_RARITY.map((r, k) => r.w * Math.max(0.25, k === 0 ? 1 - 0.3 * L : 1 + [0, 0.6, 1.0, 1.6][k] * L)); }
  let r = Math.random() * w.reduce((a, b) => a + b, 0), k = 0;
  for (; k < w.length - 1; k++) { r -= w[k]; if (r < 0) break; }
  const pool = CARDS.filter(c => c.r === k);
  return pick(pool.length ? pool : CARDS);
}
function gainCard(c) {
  if (c.r === 3) setTimeout(() => addMemo('item', 'the'), 0);           // thẻ huyền thoại vào lưu bút
  const isNew = !G.cards[c.id];
  G.cards[c.id] = (G.cards[c.id] || 0) + 1;
  if (G.cardDone !== CARDS.length && cardKinds() === CARDS.length) {        // đủ bộ: tiền thưởng + hồi ký “Nhà sưu tầm” trong lưu bút
    G.cardDone = CARDS.length; addMoney(CARD_SET_REWARD, true); UI.toast(`Đủ bộ ${CARDS.length} thẻ cầu thủ! Hãng bim bim Sao Vàng tặng thưởng ${fmtMoney(CARD_SET_REWARD)}.`, 'good');
    setTimeout(() => addMemo('scene', 'suutam'), 0);
  }
  return isNew;
}
// minRare: lá đầu tiên chắc chắn từ độ hiếm này trở lên (hộp thẻ đặc biệt)
function openPacks(n, minRare) {
  const out = [];
  for (let i = 0; i < n; i++) { let c = rollCard(); if (minRare && i === 0 && c.r < minRare) c = rollCard([0, 75, 22, 3]); out.push({ c, isNew: gainCard(c) }); }
  return out;
}
function packToast(res) { for (const { c, isNew } of res) UI.toast(`Bóc thẻ: ${starsOf(c)} ${c.name}${isNew ? ' — thẻ mới!' : ''}`, isNew || c.r ? 'good' : 'info'); }
function cardHtml(c, tag, hidden) {
  const R = CARD_RARITY[c.r], t = tag ? `<i class="pc-t">${tag}</i>` : '';
  if (hidden) return `<div class="pcard back" style="--rc:${R.col}">${t}<div class="pc-q">?</div><div class="pc-n">${CARD_POS[c.pos]}</div><div class="pc-r">${starsOf(c)} ${R.name}</div></div>`;
  return `<div class="pcard" style="--rc:${R.col}">${t}<span class="pc-b">${cardBadges(c)}</span><img src="${cardPortrait(c)}" alt=""><div class="pc-n">${c.name}</div><div class="pc-r">${starsOf(c)} ${CARD_POS[c.pos]}</div><div class="pc-s">${CARD_STATS.map(([k, n]) => `<span title="${n}">${statImg(k)}<b>${c[k]}</b></span>`).join('')}</div></div>`;
}
function showPack(res, title) {
  return UI.ask(title || 'Bóc thẻ', `<div class="pcards">${res.map(({ c, isNew }) => cardHtml(c, isNew ? 'MỚI' : '')).join('')}</div><p class="dim">Đã sưu tầm ${cardKinds()}/${CARDS.length} loại thẻ. Xem bộ sưu tập và xếp đội hình trong Menu → Thẻ cầu thủ.</p>`, ['OK']);
}
// cardDuel (đấu thẻ theo luật mới, đội hình 11 người): xem 04f_cards.js

/* ---------- điện thoại: nhắn tin với bạn bè, mẹ ---------- */
const PHONE_CONTACTS = ['khoa', 'vy', 'dat', 'ngan', 'mom'];
const contactOf = id => (id === 'mom' ? { name: 'Mẹ', note: 'Xin phép về muộn' } : id === 'dad' ? { name: 'Bố', note: 'Hỏi thăm bố' } : FRIENDS[id]);
const MSG_ME = ['Đang làm gì đó?', 'Hôm nay học mệt ghê…', 'Ăn cơm chưa?', 'Chán quá, tám tí đi.', 'Bài hôm nay cậu hiểu không?'];
const MSG_TAM = {
  khoa: ['Đang cày game nè, tí nữa mới học.', 'Mai đá bóng không? Tớ mới mua đôi giày mới.', 'Bài Toán hôm nay khó ghê, tớ chép của Vy rồi.', 'Tớ vừa bóc được thẻ hiếm, mai mang lên lớp khoe.'],
  vy: ['Tớ đang soạn đề cương. Cậu ôn bài chưa đó?', 'Mai nhớ mang đủ sách vở nha, cô hay kiểm tra vở lắm.', 'Học xong tớ ra ban công ngắm sao, trời đẹp ghê.', 'Cuối tuần lên núi sau trường picnic đi, tớ làm cơm cuộn.'],
  dat: ['Đang tập bài hát mới cho văn nghệ, nghe thử không?', 'Chán học quá, mai kiếm trò gì vui đi.', 'Tớ mới săn được thẻ siêu hiếm, mai đấu không?', 'Khu game mới về máy nhảy đó, đi thử không?'],
  ngan: ['Tớ đang đắp mặt nạ, hihi.', 'Cuối tuần đi trung tâm thương mại không? Đang giảm giá.', 'Cậu thấy màu son cam đất hợp với tớ không?', 'Tiệm trà sữa Mây có vị mới, phải thử mới được.'],
};
const MSG_NO = ['Hôm đó tớ kẹt rồi, để bữa khác nha.', 'Mẹ tớ không cho đi rồi…', 'Tớ còn một đống bài chưa làm. Lần sau nhé!'];
function pushMsg(id, me, t) { const a = (G.phone.msgs[id] = G.phone.msgs[id] || []); a.push({ m: me ? 1 : 0, t }); if (a.length > 30) a.splice(0, a.length - 30); }
function inbox(id, t) { if (!hasNum(id)) return; pushMsg(id, false, t); G.phone.unread[id] = (G.phone.unread[id] || 0) + 1; UI.toast(`Tin nhắn mới từ ${contactOf(id).name} — mở Điện thoại (P) để xem`, 'info'); }
const unreadCount = () => Object.values(G.phone.unread).reduce((s, n) => s + n, 0);
const meetBusy = () => !!(G.meet && G.meet.day >= G.day);
function setMeet(fid, place, day, from) { G.meet = { fid, place, day, from: from || 0, n: 0 }; }
const meetWhen = m => (m.day === G.day ? 'Hôm nay' : 'Ngày mai') + ' ' + meetTimeText(m);
// Các câu trả lời nhanh trong khung chat
function phoneActions(id) {
  const a = [];
  const pti = (id === 'mom' || id === 'dad') && ptInvite();
  if (pti && pti.who === id) { a.push(['pyes', 'Dạ, con mang tới ngay ạ!']); a.push(['pno', 'Con đang bận ạ']); }
  if (id === 'mom') {
    if (!G.daily.momAsk && !G.daily.outPerm && G.time < 1320) a.push(['late', 'Xin phép về muộn']);
    a.push(['hoi', 'Hỏi mẹ tối nay ăn gì']);
    return a;
  }
  if (id === 'dad') return a.concat([['dad', 'Hỏi thăm bố']]);
  const p = G.phone.pend, j = lunchAct();
  if (j && j.fid === id) { a.push(['jyes', LUNCH_JOIN[j.kind].yes]); a.push(['jno', 'Thôi, trưa nay tớ nghỉ']); }
  if (p && p.fid === id && p.day >= G.day) { a.push(['yes', 'Đi chứ!']); a.push(['no', 'Tớ bận rồi, để bữa khác']); }
  a.push(['tam', 'Tám chuyện']); a.push(['bai', 'Hỏi lịch kiểm tra']);
  if (!meetBusy()) a.push(['ru', 'Rủ đi chơi…']);
  if (grudge(id)) a.push(['sorry', 'Xin lỗi vì đã tố cáo']);
  return a;
}
function phoneSend(id, act, arg) {
  if (act === 'pyes' || act === 'pno') return parentReply(id, act === 'pyes');
  if (id === 'mom') {
    if (act === 'late') {
      pushMsg('mom', true, 'Mẹ ơi, hôm nay con xin phép về muộn một chút ạ.'); G.daily.momAsk = true;
      const p = clamp(0.3 + 0.06 * parentInfo(G.parent).lv + (G.conduct >= 8 ? 0.1 : -0.1) - (G.daily.scolded ? 0.3 : 0), 0.1, 0.9);
      if (Math.random() < p) { G.daily.outPerm = true; G.daily.outAt20 = false; pushMsg('mom', false, 'Ừ, đi đâu nhớ cẩn thận, đừng về khuya quá nhé con.'); UI.toast('Mẹ đồng ý: hôm nay về sau 20:00 không bị mắng.', 'good'); }
      else pushMsg('mom', false, 'Không được. Về ăn cơm rồi còn học bài, con.');
    } else { pushMsg('mom', true, 'Mẹ ơi tối nay nhà mình ăn gì ạ?'); pushMsg('mom', false, pick(['Canh chua cá với thịt kho. Về sớm ăn cho nóng.', 'Mẹ nấu cà ri gà. Nhớ về trước 8 giờ nhé.', 'Rau muống xào tỏi, trứng chiên. Bố con đang đợi cơm đấy.'])); }
    return;
  }
  if (id === 'dad') {
    pushMsg('dad', true, pick(['Bố ơi bố đang làm gì đấy ạ?', 'Bố ăn cơm chưa ạ?', 'Hôm nay bố về sớm không ạ?']));
    pushMsg('dad', false, pick(['Bố đang bận chút việc. Học hành cẩn thận nhé con.', 'Bố ăn rồi. Con nhớ ăn uống đầy đủ, đừng để đói rồi ngất ra đấy.', 'Tối bố về. Cuối tuần hai bố con đi câu cá nhé.']));
    if (!G.daily.msg.dad) { G.daily.msg.dad = true; addParent(1, '', true); }
    return;
  }
  const F = FRIENDS[id], say = t => pushMsg(id, false, t);
  if (act === 'tam') {
    pushMsg(id, true, pick(MSG_ME));
    if (grudge(id)) return say('Đã xem.');
    say(pick(MSG_TAM[id]));
    if (!G.daily.msg[id]) { G.daily.msg[id] = true; addFriend(id, 2); }
  } else if (act === 'bai') {
    pushMsg(id, true, 'Sắp tới có kiểm tra môn gì không? Tớ quên mất rồi.');
    if (grudge(id)) return say('Tự đi mà xem bảng tin.');
    const up = upcomingTests(40).filter(t => t.day >= G.day).slice(0, 3);
    if (!up.length) return say('Chưa thấy cô báo lịch gì. Cứ học đều là được.');
    say(up.map(t => `${SUBJ[t.subj].short}: ${TEST_NAME[t.type]}, ${dateLabel(t.day)}`).join(' · '));
    const t0 = up[0];
    if (id === 'vy' && hearts('vy') >= 2 && !G.daily.tipVy && t0.day <= G.day + 2 && BOOK_SUBJ.includes(t0.subj)) {
      G.daily.tipVy = true; G.review[t0.subj] = Math.max(G.review[t0.subj] === undefined ? -1 : G.review[t0.subj], t0.day);
      say(`Tớ gửi cậu đề cương ${SUBJ[t0.subj].name} rồi đó, xem kỹ là ăn điểm.`); UI.toast(`Vy gửi đề cương ôn ${SUBJ[t0.subj].name}.`, 'good');
    }
  } else if (act === 'go') phoneInvite(id, arg);
  else if (act === 'jyes' || act === 'jno') {
    const j = lunchAct(); if (!j || j.fid !== id) return;
    G.phone.act = null;
    if (act === 'jno') { pushMsg(id, true, 'Thôi, trưa nay tớ nghỉ một chút. Lần sau nha!'); say('Ừ, vậy lần sau nhé!'); return; }
    pushMsg(id, true, LUNCH_JOIN[j.kind].yes);
    if (!G.atSchool || !inWin(G.time, AM_END, PM_START - 15)) { say('Ơ, cậu không ở trường à? Thôi để lần sau nha.'); return; }
    say('Nhanh lên nha, tớ chờ!');
    setTimeout(() => { UI.close(); setTimeout(() => lunchJoin(id, j), 120); }, 400);
  }
  else if (act === 'yes') {
    const p = G.phone.pend; G.phone.pend = null; pushMsg(id, true, 'Đi chứ! Hẹn cậu ở đó nha.');
    setMeet(id, p.place, p.day, 0); say(`Chốt! ${meetWhen(G.meet)} ở ${PLACES[p.place].name} nha. Đừng cho tớ leo cây đó.`);
    UI.toast(`Đã hẹn ${F.name}: ${meetWhen(G.meet)} ở ${PLACES[p.place].name}`, 'good');
  } else if (act === 'no') { G.phone.pend = null; pushMsg(id, true, 'Tớ bận rồi, để bữa khác nha.'); say('Tiếc ghê. Lần sau nhớ đi đó!'); addFriend(id, -1); }
  else if (act === 'sorry') {
    pushMsg(id, true, 'Cho tớ xin lỗi chuyện hôm trước nha. Tớ sai rồi.');
    if (G.daily.msg['s_' + id]) return say('…');
    G.daily.msg['s_' + id] = true;
    if (Math.random() < 0.5) { delete G.grudge[id]; addFriend(id, 3); say('Thôi được rồi, lần này tớ bỏ qua. Đừng có mách lẻo nữa đó!'); UI.toast(`${F.name} hết giận bạn rồi.`, 'good'); }
    else say('Để tớ nghĩ đã. Giờ chưa muốn nói chuyện.');
  }
}
// Rủ bạn đi chơi qua tin nhắn: đang trong giờ học thì hẹn sau khi tan; muộn quá thì hẹn hôm sau
function phoneInvite(fid, place) {
  const F = FRIENDS[fid], P = PLACES[place], last = Math.min(MEET_END, P.open[1]) - 90;
  let day = G.day, from = schoolToday() && G.time < schoolEndT() ? (halfDay(G.day) ? AM_END + 20 : AFTER_SCHOOL) : Math.ceil((G.time + 30) / 10) * 10;
  if (from > last) { day = G.day + 1; from = 0; }
  const when = day > G.day ? 'Mai' : (from === AFTER_SCHOOL ? 'Chiều nay tan học' : 'Lát nữa');
  pushMsg(fid, true, `${when} đi ${P.short} không?`);
  const say = t => pushMsg(fid, false, t);
  if (grudge(fid)) return say('Không. Đi mà rủ thầy giám thị ấy.');
  const asked = G.daily.ru[fid] || 0; G.daily.ru[fid] = asked + 1;
  if (asked >= 2) return say('Tớ nói rồi mà, hôm khác nha.');
  if (Math.random() >= clamp(0.4 + 0.1 * hearts(fid) + (PLACE_LIKES[fid].includes(place) ? 0.2 : 0), 0.1, 0.95)) return say(pick(MSG_NO));
  setMeet(fid, place, day, from);
  say(`Ok luôn! ${meetWhen(G.meet)} tớ đợi ở ${P.name} nha.`);
  UI.toast(`Đã hẹn ${F.name}: ${meetWhen(G.meet)} ở ${P.name}`, 'good');
}
// Bạn bè chủ động nhắn: nhắc lịch kiểm tra, rủ đi chơi, tám chuyện
function friendPing(evening) {
  const fids = Object.keys(FRIENDS).filter(f => !grudge(f) && hasNum(f)); if (!fids.length) return;      // chỉ bạn nào đã cho số mới nhắn
  const fid = pick(fids), r = Math.random();
  const tmr = G.tests.find(t => t.day === G.day + 1 && !t.done);
  if (evening && tmr && r < 0.45) return inbox(fid, `Mai có ${TEST_NAME[tmr.type]} môn ${SUBJ[tmr.subj].name} đó. Ôn chưa?`);
  if (!meetBusy() && !G.phone.pend && r < 0.8) {
    const day = evening ? G.day + 1 : G.day, opts = PLACE_LIKES[fid].filter(p => !((p === 'nui' || p === 'bien') && isSchoolDay(day))), place = pick(opts);
    G.phone.pend = { fid, place, day };
    return inbox(fid, `${evening ? 'Mai' : 'Hôm nay'}${isSchoolDay(day) ? ' tan học' : ''} đi ${PLACES[place].short} không? Trả lời tớ nha!`);
  }
  inbox(fid, pick(MSG_TAM[fid]));
}
function socialTick(t) {
  parentPing(t);                                                                  // bố mẹ nhắn nhờ việc (ngoài giờ học)
  groupTick(t);                                                                   // nhóm học sinh trường: nhờ vả, chuyện phiếm
  if (t === 1170 && Math.random() < 0.5) friendPing(true);                       // 19:30
  else if (t === 510 && !schoolToday() && Math.random() < 0.45) friendPing(false);   // sáng ngày nghỉ
  const m = meetOn();
  if (m && !m.n && t === meetWindow(m)[0]) UI.toast(`${FRIENDS[m.fid].name} đang đợi bạn ở ${PLACES[m.place].name} (đến ${fmtTime(meetWindow(m)[1])}).`, 'info');
}
function socialNewDay() {
  if (G.meet && G.meet.day < G.day) {
    if (!G.meet.n) {
      const f = G.meet.fid; addFriend(f, -5, true);
      if (hasNum(f)) { pushMsg(f, false, 'Hôm qua tớ đợi mãi mà không thấy cậu. Cho tớ leo cây hả? :('); G.phone.unread[f] = (G.phone.unread[f] || 0) + 1; }
      RT.morning.push(`Hôm qua bạn lỡ hẹn với ${FRIENDS[f].name}. Bạn ấy giận rồi.`);
    }
    G.meet = null;
  }
  if (G.phone.pend && G.phone.pend.day < G.day) G.phone.pend = null;
  const wk = Math.floor(G.day / 7);
  if (G.outAsk.week !== wk) G.outAsk = { week: wk, n: 0 };
}
