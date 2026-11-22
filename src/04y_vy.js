'use strict';
/* ============================================================
 *  04y. TUYẾN TRUYỆN VY — "Phía sau nụ cười hoa khôi" (theo bản đề xuất cốt truyện của người làm game)
 *  Nguyễn Khánh Vy: hoa khôi, lớp phó học tập, ngồi bàn bên phải. Ngoài lạnh lùng, trong nhạy cảm, sợ bị lãng quên.
 *  Bố: Đại tướng Nguyễn Minh Quân — chỉ huy ở khu quân sự, nghiêm khắc, đi từ tờ mờ sáng, có tuần đi nhiệm vụ xa.
 *  Mẹ: nghệ sĩ kịch nói Lê Thanh Hương — hay đi lưu diễn, mỗi tháng chỉ ở nhà một tuần (tối diễn ở Nhà hát Hoa Phượng).
 *  Nhà rộng (biệt thự ở phố Hoa Phượng), thường chỉ có bác Lài giúp việc.
 *
 *  CHƯƠNG (G.vy.ch = chương đã xong) — mốc tim + thời điểm năm học + chương trước:
 *   1 Hoa khôi bàn bên (≥ ngày 4): tan học Vy ngồi lại lớp, nhìn tin nhắn mẹ báo không về kịp → nói chuyện với Vy
 *   2 Chiều mưa ở thư viện (1♥, chiều mưa sau giờ học): Vy rủ ngồi cùng, kể về mẹ — lựa chọn tinh tế / trêu chọc
 *   3 Sinh nhật chỉ có một người (2♥, sinh nhật Vy 8 Đông, tới 3 ngày sau): Vy ngồi một mình ở ghế đá công viên
 *   4 Bữa cơm nhà đại tướng (3♥, từ mùa Xuân lớp 10): thứ 6 Vy rủ thứ 7 tới nhà học nhóm, bố về sớm, bữa cơm căng thẳng
 *   5 Có phải tớ thích cậu rồi không? (4♥): thứ 7 Vy rủ chủ nhật picnic trên núi — bày tỏ / xin thêm thời gian / làm bạn
 *   Ngỏ lời: 5♥ + đã qua chương 5 → tặng bó hoa oải hương → hẹn hò (04x_love.js)
 *   6♥ Hộp cơm đầu tiên (giờ nghỉ trưa ở trường) · 7♥ Ngày bố mẹ cãi nhau (tối, Vy nhắn ra ghế đá công viên)
 *   6 Ánh đèn sân khấu (lớp 12, hoặc mùa Xuân lớp 11 nếu đã qua sự kiện 7♥): vở kịch cuối năm ở Nhà hát (Xuân 20, 19:00)
 *   8♥ Chiếc hộp kỷ niệm (thứ 7 Vy mời lên phòng) · 7 Lời hẹn dưới tán phượng (ngày tốt nghiệp: kết thúc theo lựa chọn)
 *  SỰ KIỆN PHỤ: chiếc ô dưới mưa · con mèo đi lạc sau trường · cô lớp phó bị ốm · vé xem kịch của mẹ · bức ảnh gia đình
 *  KHI HẸN HÒ: hộp cơm Vy làm, đề cương trước kiểm tra, nhắc lịch buổi sáng, động viên ngày thi, học nhóm cùng Vy.
 * ============================================================ */
const VY = { lib: 50, libRain: 75, tea: [600, 690], flower: [510, 600], park: [540, 660], parkSat: [900, 1080], lunchWeek: 2, lunchStam: [16, 20], lunch8: [21, 25], playDos: 20, playAt: 1140 };
Object.assign(LOOKS, {
  vyDad: { hair: '#6b6b6b', style: 'buzz', cap: '#3f5a24', shirt: '#4f6b2f', pants: '#3f5a24', badge: '#ffd23a', skin: '#c98a5a', eye: 'narrow' },
  vyMom: { hair: '#2a1a1a', style: 'long', shirt: '#b8304a', pants: '#2a2136', earring: '#ffd23a', eye: 'big', skin: '#f6d2b4' },
  vyMaid: { hair: '#7a7a7a', style: 'bun', shirt: '#8fa86a', pants: '#4a4f5a', apron: '#fffaf0', skin: '#d9a070' },
});
FRIEND_PARENTS.vy = ['vyDad', 'vyMom'];
Object.assign(FOODS, { comvy: { name: 'Hộp cơm Vy làm', stam: 18, gift: 4 }, comvy8: { name: 'Hộp cơm Vy làm (ngon tuyệt)', stam: 24, gift: 5 } });
const vyWho = () => ({ look: 'vy', outfit: friendOutfit('vy') });
const vyAsk = (t, opts) => UI.ask('Vy', `<p>${t}</p>`, opts || ['…'], { who: vyWho() });
const vyF = k => !!(G.vy && G.vy.flags[k]);
const vySet = k => { G.vy.flags[k] = G.day + 1; };              // lưu ngày (+1 để ngày 0 vẫn là đúng)
const wk = d => Math.floor(d / 7);
// lịch bố mẹ Vy
const vyMomHome = d => { d = d === undefined ? G.day : d; return wk(d) % 4 === 2 || Math.abs(d - vyPlayDay()) <= 1 || !!tetTime(); };
const vyDadAway = d => { d = d === undefined ? G.day : d; return (wk(d) % 5 === 3 || isDate(FRIENDS.vy.bday, d)) && !tetTime() && Math.abs(d - vyPlayDay()) > 0; };
function vyDadPlace() {
  const t = G.time, c = cal(G.day); if (vyDadAway()) return 'away';
  if (t < 330 || t >= 1380) return 'sleep';
  if (c.dow === 6 && !tetTime()) return 'home';
  if (c.dow === 5) return inWin(t, 360, 420) ? 'jog' : 'home';
  if (tetTime()) return 'home';
  if (inWin(t, 330, 360)) return 'leave'; if (inWin(t, 360, 1110)) return 'base'; if (inWin(t, 1110, 1140)) return 'back';
  return 'home';
}
function vyMomPlace() {
  const t = G.time, c = cal(G.day); if (!vyMomHome()) return 'tour';
  if (t < 420 || t >= 1380) return 'sleep';
  const show = c.dow >= 4 && !tetTime();                 // thứ 6, 7, CN diễn tối ở nhà hát
  if (show && inWin(t, 1040, 1080)) return 'leave'; if (show && inWin(t, 1080, 1320)) return 'theater';
  return 'home';
}
const vyMomShow = () => vyMomPlace() === 'theater' && inWin(G.time, 1080, 1170);
// ngày diễn vở kịch cuối năm (Xuân 20 của năm học này)
function vyPlayDay() { const y = cal(G ? G.day : 0).year; return y * YEAR_DAYS + 2 * CFG.DAYS_PER_SEASON + VY.playDos - 1; }
const vyPlayOn = () => G.vy.ch === 5 && (G.grade >= 12 || (G.grade === 11 && vyF('e7'))) && !vyF('play');
// lịch của Vy: trả về chỗ Vy đang ở
function vyPlace() {
  if (!G || !G.vy) return null;
  const t = G.time, d = G.day, c = cal(d), V = G.vy;
  if (meetToday('vy') || isComp('vy')) return 'out';
  if (V.sick === d) return 'sick';
  if (t < 390 || t >= 1290) return 'sleep';
  if (tetTime()) return 'home';
  if (V.inv && V.inv.day === d && V.inv.place && inWin(t, V.inv.from, V.inv.to)) return V.inv.place;     // đang chờ theo lời hẹn
  if (vyBdayBench() && inWin(t, schoolToday() ? schoolEndT() + 20 : 900, 1150)) return 'bench';
  if (schoolToday()) {
    const end = schoolEndT();
    if (t < end) return 'school';
    if (vyPlayOn() && d >= vyPlayDay() - 7 && d < vyPlayDay()) return inWin(t, end, end + 90) ? 'rehearse' : 'home';
    if (V.ch < 1 && d >= 3) return inWin(t, end, end + 60) ? 'class' : 'home';
    if (vyGateRain()) return inWin(t, end, end + 40) ? 'gate' : 'home';
    if (vyCatDay()) return inWin(t, end, end + 35) ? 'cat' : 'home';
    const rain = rainAt(d, end + 20) > 0;
    if (c.dow % 2 === 0 || rain) return inWin(t, end, end + (rain ? VY.libRain : VY.lib)) ? 'library' : 'home';
    return inWin(t, end + 45, end + 120) && !raining() ? 'park' : t < end + 45 ? 'commute' : 'home';
  }
  if (c.dow === 5) {
    if (inWin(t, ...VY.flower)) return 'flower'; if (inWin(t, ...VY.tea)) return 'tea';
    if (inWin(t, ...VY.parkSat)) return raining() ? 'home' : 'park';
    return 'home';
  }
  if (inWin(t, ...VY.park)) return raining() ? 'home' : 'park';
  return 'home';
}
const friendSpot = fid => (fid === 'vy' ? vyPlace() : 'park');
const vyBdayBench = () => G.vy.ch === 2 && hearts('vy') >= 2 && cal(G.day).season === FRIENDS.vy.bday[0] && cal(G.day).dos >= FRIENDS.vy.bday[1] && cal(G.day).dos <= FRIENDS.vy.bday[1] + 3;
const vyGateRain = () => hearts('vy') >= 1 && !vyF('umbrella') && G.owned.o && rainAt(G.day, schoolEndT() + 10) > 0;
const vyCatDay = () => G.vy.ch >= 1 && hearts('vy') >= 1 && !vyF('cat') && cal(G.day).dow === 3;
// tim của Vy khi hẹn hò: tim 7 cần sự kiện "Hộp cơm đầu tiên", tim 8 cần "Ngày bố mẹ cãi nhau"
const vyLoveCap = () => (vyF('e7') ? 160 : vyF('e6') ? 140 : 120);
const vyCanDate = () => G.vy.ch >= 5 && (!vyF('friend') || hearts('vy') >= 5 && G.vy.trust >= 70);

/* ---------- dựng nhân vật, chỗ đứng, nhà hát ---------- */
function buildVyStory() {
  const pv = (id, map, x, y, dir, place, label, extra) => NPCS.push(Object.assign({ id, fid: 'vy', name: 'Vy', look: 'vy', outfit: () => friendOutfit('vy'), map, x, y, dir, vis: () => vyPlace() === place && !sceneHides(id), label: () => `Vy — ${label}`, act: () => ACT.friend('vy', place) }, extra || {}));
  pv('vy_cls', 'class', 191, 134, 3, 'class', 'ngồi một mình trong lớp, nhìn điện thoại');
  pv('vy_lib', 'thuvien', 205, 126, 1, 'library', 'đang ôn bài ở thư viện');
  pv('vy_gate', 'school', GATE.x + 26, GATE.yIn - 4, 0, 'gate', 'đứng nép dưới mái hiên cổng trường, không mang ô');
  pv('vy_cat', 'school', 716, 74, 1, 'cat', 'đang lúi húi sau trường');
  pv('vy_flower', 'town', 262, 392, 3, 'flower', 'đang ngắm hoa ở cửa hàng hoa');
  pv('vy_tea', 'pho', 520, 146, 0, 'tea', 'đang mua trà sữa');
  pv('vy_reh', 'nhac', 120, 110, 0, 'rehearse', 'đang tập thoại cho vở kịch cuối năm');
  pv('vy_bench', 'town', BENCH.x + 12, BENCH.y + 4, 1, 'bench', 'ngồi một mình ở ghế đá');
  pv('vy_inv', 'town', BENCH.x + 12, BENCH.y + 4, 1, 'night', 'đang chờ cậu ở ghế đá');
  NPCS.push({ id: 'vy_catpet', name: 'Mèo hoang', map: 'school', x: 700, y: 80, dir: 0, critter: n => (Math.floor(performance.now() / 400) % 2 ? 'cat0' : 'cat1'), vis: () => vyPlace() === 'cat' });
  // hôm Vy ốm: không có mặt ở lớp, sân trường, trên đường đi học
  for (const n of NPCS) if ((n.fid === 'vy' || n.sid === 'vy') && ['school', 'class', 'pho'].includes(n.map) && !String(n.id).startsWith('vy_')) { const v0 = n.vis; n.vis = () => (!v0 || v0()) && !(G && G.vy && G.vy.sick === G.day); }
  for (const T of TRIPS) if (/^(p|h|s)_vy$/.test(T.id)) { const w0 = T.when; T.when = () => w0() && !(G.vy && G.vy.sick === G.day); }
  // nhà Vy: bố mẹ (theo lịch), bác giúp việc, ảnh gia đình trong phòng Vy
  const fp = id => NPCS.find(n => n.id === id);
  for (const [id, who] of [['fhp_bo', 'dad'], ['fhp_me', 'mom']]) {
    const n = fp(id); if (!n) continue;
    const v0 = n.vis, a0 = n.act;
    n.vis = () => !sceneHides(id) && (v0() || (G.visit === 'vy' && (who === 'dad' ? vyDadPlace() === 'home' : vyMomPlace() === 'home')));
    n.act = () => (tetTime() ? a0() : vyParentTalk(who));
    n.label = () => (G.visit === 'vy' ? (who === 'dad' ? 'Đại tướng Nguyễn Minh Quân — bố của Vy' : 'Nghệ sĩ Lê Thanh Hương — mẹ của Vy') : `${who === 'dad' ? 'Bố' : 'Mẹ'} của ${FRIENDS[G.visit].name}`);
  }
  NPCS.push({ id: 'vy_maid', name: 'Bác Lài', look: 'vyMaid', map: 'fhome', x: 150, y: 70, dir: 0, wander: 20, vis: () => G.visit === 'vy' && !sceneHides('vy_maid'), label: () => 'Bác Lài — giúp việc nhà Vy', act: () => UI.ask('Bác Lài', `<p>“${pick(['Cháu là bạn của Vy hả? Con bé ít khi dẫn bạn về nhà lắm, bác mừng ghê.', 'Ông bà chủ bận suốt, bữa cơm nhà này thường chỉ có mình con bé.', 'Vy nấu ăn khéo lắm đó, toàn học bác. Có điều hay cho nhiều muối, hì hì.'])}”</p>`, ['Dạ'], { who: { look: 'vyMaid' } }) });
  addObj(MAPS.fhome, { s: 'vyPhotoOld', dyn: () => (vyF('play') ? 'vyPhotoNew' : 'vyPhotoOld'), x: 286, y: 10, base: 0, vis: () => G.visit === 'vy', ir: [-4, 0, 24, 34], label: () => 'Ảnh gia đình nhà Vy', act: () => UI.say('Ảnh gia đình', vyF('play') ? '<p>Tấm ảnh mới chụp sau đêm diễn: bố mặc quân phục, mẹ ôm bó hoa, Vy cười tươi ở giữa.</p>' : '<p>Một tấm ảnh cũ: bố mẹ trẻ hơn bây giờ nhiều, ở giữa là cô bé Vy chừng sáu tuổi mặc váy hồng, cười rất tươi.</p>') });
  // bố Vy ở khu quân sự (nhìn thấy sau hàng rào), xe công vụ đón đưa; mẹ Vy ở nhà hát
  NPCS.push({ id: 'vy_dad_base', name: 'Đại tướng', look: 'vyDad', map: 'svd', x: 905, y: 210, dir: 0, wander: 30, vis: () => vyDadPlace() === 'base', label: () => 'Đại tướng Nguyễn Minh Quân (bố của Vy) — đang làm việc trong khu quân sự', act: () => UI.toast('Bố của Vy đang làm việc bên trong khu quân sự.') });
  const PW = PHO_W * 16, hx = FRIEND_HOUSE.vy[1] + 49;
  addTrip({ id: 'vyd_l', map: 'pho', look: 'vyDad', name: 'Đại tướng', at: 330, win: 25, when: () => vyDadPlace() === 'leave', legs: () => [[hx, 130, 'walk'], [hx, 176, 'walk'], [hx, 214, 'jeep'], [PW + 50, 214, 'jeep']] });
  addTrip({ id: 'vyd_s', map: 'svd', look: 'vyDad', name: 'Đại tướng', at: 342, win: 20, when: () => !vyDadAway() && cal(G.day).dow < 5, legs: () => [[-50, 410, 'jeep'], [790, 410, 'jeep']] });
  addTrip({ id: 'vyd_r', map: 'svd', look: 'vyDad', name: 'Đại tướng', at: 1110, win: 20, when: () => !vyDadAway() && cal(G.day).dow < 5, legs: () => [[790, 404, 'jeep'], [-50, 404, 'jeep']] });
  addTrip({ id: 'vyd_h', map: 'pho', look: 'vyDad', name: 'Đại tướng', at: 1125, win: 25, when: () => vyDadPlace() === 'back' || (!vyDadAway() && cal(G.day).dow < 5), legs: () => [[PW + 50, 214, 'jeep'], [hx, 214, 'jeep'], [hx, 176, 'walk'], [hx, 130, 'walk']] });
  addTrip({ id: 'vyd_j', map: 'pho', look: 'vyDad', outfit: 'td', name: 'Đại tướng', at: 362, win: 50, when: () => vyDadPlace() === 'jog', legs: () => [[hx, 130, 'walk'], [hx, 178, 'walk'], [PW - 40, 178, 'walk'], [hx, 178, 'walk'], [hx, 130, 'walk']] });
  addTrip({ id: 'vym_l', map: 'pho', look: 'vyMom', name: 'Nghệ sĩ Thanh Hương', at: 1040, win: 30, when: () => vyMomPlace() === 'leave', legs: () => [[hx, 130, 'walk'], [hx, 176, 'walk'], [224, 188, 'walk'], { wait: 1058 }, [208, 204, 'walk']] });
  addTrip({ id: 'vym_s', map: 'svd', look: 'vyMom', name: 'Nghệ sĩ Thanh Hương', at: 1068, win: 25, when: () => vyMomHome() && cal(G.day).dow >= 4 && !tetTime(), legs: () => [[642, 368, 'walk'], [660, 340, 'walk'], [660, 302, 'walk']] });
  NPCS.push({ id: 'vy_mom_th', name: 'Nghệ sĩ Thanh Hương', look: 'vyMom', map: 'svd', x: 690, y: 308, dir: 0, wander: 10, vis: () => vyMomPlace() === 'theater' && inWin(G.time, 1085, 1135), label: () => 'Nghệ sĩ Lê Thanh Hương — mẹ của Vy, đang ký tặng khán giả', act: () => vyParentTalk('mom') });

  /* ---------- Nhà hát Hoa Phượng (khu sân vận động) ---------- */
  const m = MAPS.svd;
  const th = addObj(m, { door: true, s: 'theaterB', x: 584, y: 298 - SPR.theaterB.height + 2, sol: [4, 60, 146, 52], label: () => 'Nhà hát Hoa Phượng — xem kịch', act: () => ACT.theater() });
  m.labels.push({ x: th.x + 77, y: th.y + 45.5, text: 'NHÀ HÁT', size: 6, col: '#ffe066', maxw: 56 });
  const n = roomBase('nhahat', 'Nhà hát Hoa Phượng', '#5a2430', '#3a1820', 'dtile', 24, 16);
  roomExit(n, { map: 'svd', x: 660, y: 310, dir: 0 });
  R(n.x, '#3a2418', 40, 30, 304, 64); R(n.x, '#6f472c', 40, 30, 304, 3); R(n.x, '#2a1810', 40, 92, 304, 4);               // sân khấu
  for (let i = 0; i < 9; i++) { R(n.x, '#9a2a35', 16 + i * 4, 0, 4, 100); R(n.x, '#9a2a35', 348 + i * 4 - 16, 0, 4, 100); }
  for (let i = 0; i < 9; i++) R(n.x, i % 2 ? '#b83a45' : '#9a2a35', 16 + i * 4, 0, 2, 100);
  R(n.x, '#7a1f28', 16, 0, 352, 10); for (let i = 16; i < 368; i += 12) R(n.x, '#ffd23a', i + 4, 9, 4, 2);
  for (let r = 0; r < 5; r++) for (let i = 0; i < 14; i++) { if (i === 6 || i === 7) continue; const a = 34 + i * 23, b = 120 + r * 24; R(n.x, '#6f1f28', a, b, 18, 12); R(n.x, '#9a2a35', a + 1, b + 1, 16, 6); R(n.x, '#4a1218', a, b + 10, 18, 2); }
}
// chuyện trò với bố mẹ Vy
function vyParentTalk(who) {
  if (who === 'dad') return UI.ask('Đại tướng Nguyễn Minh Quân', `<p>${vyF('play') ? '“Cháu đấy à. Vy dạo này cười nhiều hơn. Bác… cảm ơn cháu.”' : pick(['“Cháu học lớp nào? Học lực thế nào?”', '“Đến nhà người khác thì chào hỏi cho đàng hoàng. Ngồi đi.”', '“Vy nó phải lo học. Mấy chuyện văn nghệ, kịch kiếc để sau.”'])}</p>`, ['Dạ'], { who: { look: 'vyDad' } });
  return UI.ask('Nghệ sĩ Lê Thanh Hương', `<p>${vyF('play') ? '“Cô xin lỗi Vy nhiều lắm vì những năm vắng nhà. Cảm ơn cháu đã ở bên con bé.”' : pick(['“Cháu là bạn của Vy hả? Cô ít ở nhà quá, chẳng biết con bé chơi với ai…”', '“Tối nay cô diễn ở Nhà hát Hoa Phượng, rảnh thì rủ Vy đến xem nhé.”', '“Vy hồi nhỏ hay đòi theo cô ra nhà hát lắm, giờ lớn rồi lại ít nói.”'])}</p>`, ['Dạ'], { who: { look: 'vyMom' } });
}
// Nhà hát: mẹ Vy ở nhà thì tối thứ 6–CN có diễn (mua vé ở cửa); ngày vở kịch cuối năm của trường thì vào xem Vy diễn
const THEATER = { price: 80000, show: 1170 };
ACT.theater = async () => {
  if (RT.lock) return;
  if (vyPlayOn() && G.day === vyPlayDay() && inWin(G.time, VY.playAt - 60, VY.playAt + 20)) return vyPlayNight();
  if (G.vy.inv && G.vy.inv.kind === 'ticket' && G.vy.inv.day === G.day && inWin(G.time, 1080, 1185)) { G.vy.inv = null; return vyTicketShow(); }
  if (!vyMomShow()) return UI.say('Nhà hát Hoa Phượng', `<p>Hôm nay không có suất diễn nào lúc này.</p><p class="dim">${vyMomHome() ? 'Đoàn kịch đang về thành phố: tối thứ 6, 7, chủ nhật diễn lúc 19:30 (mở cửa 18:00).' : 'Đoàn kịch của nghệ sĩ Lê Thanh Hương đang lưu diễn ở tỉnh khác.'}</p>`);
  const c = await UI.ask('Nhà hát Hoa Phượng', `<p>Vở <b>“Chuyện tình bên sông Hoa”</b> — vai chính: nghệ sĩ Lê Thanh Hương. Vé ${fmtMoney(THEATER.price)}.</p>`, ['Mua vé vào xem', 'Thôi']);
  if (c !== 0) return;
  if (G.money < THEATER.price) return UI.toast('Không đủ tiền mua vé.', 'bad');
  addMoney(-THEATER.price, true); RT.lock = true;
  await theaterCut([{ say: [0, 'Ta đợi chàng bên bến sông này đã mười năm…'] }, { wait: 800 }, { say: [0, 'Nước sông Hoa vẫn chảy, chỉ lòng người là đổi thay!'] }], null);
  if (G.time < 1290) advanceTime(1290 - G.time);
  addStat('vannghe', 2); RT.lock = false; UI.hud();
  UI.toast('Vở kịch hay quá, cả khán phòng đứng dậy vỗ tay (+2 Văn nghệ).', 'good');
};
// cảnh trong nhà hát: mẹ Vy (actor 0) trên sân khấu, mình ngồi hàng ghế giữa (+ Vy ngồi cạnh nếu có)
function theaterCut(steps, withVy, extra) {
  const actors = [{ look: 'vyMom', x: 192, y: 78, dir: 0 }, { look: 'rocker', x: 150, y: 80, dir: 2 }];
  if (withVy) actors.push({ look: 'vy', outfit: 'casual', x: 206, y: 176, dir: 3 });
  for (let i = 0; i < 8; i++) actors.push({ look: ['c1', 'c3', 'c5', 'c7', 'c9', 'x1', 'c2', 'c4'][i], outfit: 'casual', x: 60 + i * 38 + (i > 3 ? 60 : 0), y: 152 + (i % 2) * 24, dir: 3 });
  return playCut(Object.assign({ map: 'nhahat', me: [184, 176, 3], cam: { x: 192, y: 112 }, title: 'Nhà hát Hoa Phượng', actors, steps, props: [now => { const S = VIEW.S; ctx.fillStyle = 'rgba(255,240,180,0.13)'; ctx.beginPath(); ctx.moveTo(VIEW.ox + 172 * S, VIEW.oy); ctx.lineTo(VIEW.ox + 212 * S, VIEW.oy); ctx.lineTo(VIEW.ox + 236 * S, VIEW.oy + 96 * S); ctx.lineTo(VIEW.ox + 148 * S, VIEW.oy + 96 * S); ctx.fill(); }] }, extra || {}));
}

/* ---------- hằng ngày: tin nhắn chủ động, lời hẹn, ốm, quyền lợi khi hẹn hò ---------- */
function vyNewDay() {
  const V = G.vy, c = cal(G.day), dating = isPartner('vy'), msg = t => { if (hasNum('vy')) inbox('vy', t); };
  if (V.inv && V.inv.day < G.day) vyMissed(V.inv);
  if (V.sick >= 0 && V.sick < G.day) V.sick = -1;
  if (V.umbrellaBack && V.umbrellaBack <= G.day) { V.umbrellaBack = 0; msg('Tớ trả ô rồi nhé, để ở ngăn bàn cậu đó. Có kèm mẩu giấy… đọc rồi đừng có cười tớ! — “Cảm ơn hôm đó đã che mưa cho tớ.”'); addFriend('vy', 2, true); }
  // ốm: sau chương 2, thỉnh thoảng một ngày đi học Vy nghỉ ốm
  if (V.ch >= 2 && !vyF('sick') && schoolToday() && Math.random() < 0.07) { V.sick = G.day; RT.morning && RT.morning.push('Hôm nay Vy nghỉ học vì bị cảm. Tan học có thể mang vở ghi sang nhà Vy (phố Hoa Phượng).'); }
  // lời hẹn của các chương
  if (!V.inv) {
    if (V.ch === 3 && hearts('vy') >= 3 && (G.grade >= 11 || c.season >= 2) && c.dow === 4) { V.inv = { kind: 'dinner', day: G.day + 1, from: 990, to: 1110 }; msg('Mai (thứ 7) khoảng 16:30–18:30 cậu qua nhà tớ học nhóm được không? Nhà tớ ở dãy nhà bạn bè, phố Hoa Phượng.'); }
    else if (V.ch === 4 && hearts('vy') >= 4 && c.dow === 5) { V.inv = { kind: 'picnic', day: G.day + 1, from: 510, to: 690, map: 'nui', x: 200, y: 290 }; msg('Chủ nhật này lên núi sau trường picnic không? Tớ làm bánh mì kẹp rồi. 8:30–11:30 nhé, ở bãi picnic.'); }
    else if (V.ch >= 2 && hearts('vy') >= 3 && !vyF('ticket') && vyMomHome() && c.dow === 4) { V.inv = { kind: 'ticket', day: G.day + 1 }; msg('Tớ có hai vé xem kịch của mẹ tối mai (thứ 7, 19:30, Nhà hát Hoa Phượng ở khu sân vận động). Đi… một mình thì chán lắm. Cậu đi cùng không?'); }
    else if (dating && hearts('vy') >= 7 && vyF('e6') && !vyF('e7') && Math.random() < 0.25 && !busyLove()) { V.inv = { kind: 'night', day: G.day, from: 1170, to: 1320, place: 'night', map: 'town', x: BENCH.x, y: BENCH.y, late: true }; }
    else if (dating && hearts('vy') >= 8 && vyF('e7') && !vyF('e8') && c.dow === 5) { V.inv = { kind: 'box', day: G.day, from: 840, to: 1020 }; msg('Chiều nay (14:00–17:00) cậu qua nhà tớ được không? Tớ có cái này muốn cho cậu xem… lên thẳng phòng tớ nhé.'); }
  }
  if (vyPlayOn() && G.day === vyPlayDay() - 7) msg('Tớ… quyết định đăng ký vở kịch cuối năm của trường rồi. Bố chắc sẽ không vui. Tuần này chiều nào tớ cũng tập ở phòng nhạc. Hôm diễn là ' + dateLabel(vyPlayDay()) + ', 19:00 ở Nhà hát Hoa Phượng. Cậu… sẽ đến chứ?');
  if (!dating || !lovePerks()) return;
  // khi hẹn hò: nhắc lịch buổi sáng, đề cương trước kiểm tra, động viên ngày thi
  const tests = (G.tests || []).filter(t => !t.done && t.day >= G.day && t.day <= G.day + 1);
  const today = tests.filter(t => t.day === G.day), tmr = tests.find(t => t.day === G.day + 1 && BOOK_SUBJ.includes(t.subj));
  if (schoolToday() && (today.length || Math.random() < 0.35)) msg(today.length ? `Cậu dậy chưa đó? Hôm nay có ${TEST_NAME[today[0].type].toLowerCase()} ${SUBJ[today[0].subj].name} đấy. Nhớ ăn sáng nữa nha, đừng có vừa chạy vừa ăn như lần trước!` : pick(['Cậu dậy chưa đó? Hôm nay nhớ mang đủ sách nha.', 'Chào buổi sáng! Hôm nay trời ' + WX.kinds[wxToday().kind].name.toLowerCase() + (wxToday().win ? ', nhớ mang ô đó.' : ' đẹp ghê.'), 'Dậy đi học thôi, lớp phó điểm danh nè!']));
  if (tmr && G.review[tmr.subj] !== tmr.day) { G.review[tmr.subj] = tmr.day; msg(`Mai kiểm tra ${SUBJ[tmr.subj].name} đó. Tớ gửi cậu đề cương tớ tự soạn rồi, xem kỹ phần tớ tô đỏ nha.`); }
  if (today.some(t => t.type === 'thi')) { G.daily.luck = Math.min(100, (G.daily.luck || 50) + 8); msg('Hôm nay thi rồi. Cậu làm được mà, tớ tin cậu. Thi xong tớ khao trà sữa!'); }
  // hộp cơm (sau sự kiện 6 tim): tối đa 2 lần/tuần, không khi Vy bận tập kịch / ốm
  const W = wk(G.day); V.lunchWk = V.lunchWk || {};
  if (vyF('e6') && schoolToday() && V.sick !== G.day && !(vyPlayOn() && G.day >= vyPlayDay() - 7) && (V.lunchWk[W] || 0) < VY.lunchWeek && Math.random() < 0.45) { V.lunchWk[W] = (V.lunchWk[W] || 0) + 1; V.lunchDay = G.day; }
}
function vyMissed(inv) {
  const V = G.vy; V.inv = null;
  if (inv.kind === 'dinner' || inv.kind === 'picnic') { addFriend('vy', -4, true); V.trust -= 5; if (hasNum('vy')) inbox('vy', inv.kind === 'dinner' ? 'Hôm qua tớ chờ cậu mãi… Thôi không sao, bữa khác nhé.' : 'Hôm qua tớ ngồi một mình trên núi ăn hết chỗ bánh mì rồi đó. Lần sau đừng quên nữa nha.'); }
  if (inv.kind === 'ticket') { addFriend('vy', -3, true); vySet('ticket'); }
  if (inv.kind === 'night') { bondAdd(LOVE.missEvent, 'bỏ lỡ lúc Vy cần cậu nhất'); V.trust -= 8; if (hasNum('vy')) inbox('vy', 'Tối qua tớ ngồi ở công viên tới khuya… Không sao đâu. Chắc cậu bận.'); }
  if (inv.kind === 'box') { /* hẹn lại tuần sau */ }
}
// lời hẹn tối (sự kiện 7 tim): 19:30 Vy mới nhắn
function vyTick() {
  const V = G.vy; if (!V || RT.lock || RT.scene || UI.isOpen()) return false;
  if (V.inv && V.inv.kind === 'night' && V.inv.day === G.day && !V.inv.sent && G.time >= V.inv.from) { V.inv.sent = true; if (hasNum('vy')) inbox('vy', 'Cậu… ra công viên được không? Tớ đang ngồi ở ghế đá. Chỉ cần ai đó nói chuyện với tớ một lát thôi.'); }
  // picnic trên núi: tới bãi picnic đúng giờ
  if (V.inv && V.inv.kind === 'picnic' && V.inv.day === G.day && G.map === 'nui' && inWin(G.time, V.inv.from, V.inv.to) && Math.hypot(G.x - 200, G.y - 290) < 70) { V.inv = null; vyCh5(); return true; }
  // hộp cơm đầu tiên (6 tim): giờ nghỉ trưa ở trường
  if (isPartner('vy') && hearts('vy') >= 6 && !vyF('e6') && schoolToday() && G.atSchool && inWin(G.time, AM_END, PM_START - 30) && (G.map === 'school' || G.map === 'class')) { vyE6(); return true; }
  return false;
}
// bấm chuông nhà Vy: các sự kiện ở nhà Vy
function vyHouseHook() {
  const V = G.vy, t = G.time;
  if (V.inv && V.inv.day === G.day && V.inv.kind === 'dinner' && inWin(t, V.inv.from, V.inv.to)) { V.inv = null; vyCh4(); return true; }
  if (V.inv && V.inv.day === G.day && V.inv.kind === 'box' && inWin(t, V.inv.from, V.inv.to)) { V.inv = null; vyE8(); return true; }
  if (V.sick === G.day && !vyF('sick') && t >= schoolEndT() && t < 1260) { vySick(); return true; }
  return false;
}
// nói chuyện với Vy: các sự kiện kích hoạt khi gặp
async function vyTalkHook(where) {
  const V = G.vy;
  if (where === 'class' && V.ch === 0 && vyPlace() === 'class') { await vyCh1(); return true; }
  if (where === 'library' && V.ch === 1 && hearts('vy') >= 1 && raining()) { await vyCh2(); return true; }
  if (where === 'bench' && vyBdayBench()) { await vyCh3(); return true; }
  if (where === 'gate' && vyGateRain()) { await vyUmbrella(); return true; }
  if (where === 'cat' && vyCatDay()) { await vyCat(); return true; }
  if (where === 'night' && V.inv && V.inv.kind === 'night') { V.inv = null; await vyE7(); return true; }
  if (isPartner('vy') && V.lunchDay === G.day && G.atSchool && !G.daily.vyLunch) { G.daily.vyLunch = true; const top = hearts('vy') >= 8, id = top ? 'comvy8' : 'comvy'; gAdd(id); await vyAsk(`${pick(['Cơm cuộn', 'Sandwich trứng', 'Trứng cuộn', 'Cơm nắm'])} hôm nay tớ làm nè. ${top ? 'Lần này tớ nêm vừa rồi, không mặn nữa đâu!' : 'Ăn đi, chê là tớ giận đó.'}`, ['Cảm ơn Vy!']); UI.toast(`Vy tặng hộp cơm tự làm (+${FOODS[id].stam} thể lực khi ăn).`, 'good'); return true; }
  return false;
}
// lời thoại thường ngày theo mức thân thiết
const VY_TALK = [
  ['“Có việc gì không? Tớ đang soạn bài.”', '“Nhớ nộp vở bài tập trước thứ Sáu nhé.”', '“Tuần này tổ mình trực nhật, đừng quên.”'],
  ['“Bài hôm nay cậu hiểu không? Không hiểu thì hỏi tớ.”', '“Cậu… cũng hay vào thư viện à?”', '“Hôm nay trời đẹp ghê.”'],
  ['“Tớ mới đọc xong một cuốn tiểu thuyết, đoạn kết làm tớ khóc mất.”', '“Hôm nào mưa tớ hay ngồi bên cửa sổ ngắm mưa. Nghe kỳ ha?”', '“Cậu thích ăn gì? Hỏi vậy thôi, không có gì đâu.”'],
  ['“Cậu ngủ đủ không đó? Mắt thâm quầng kìa.”', '“Mẹ tớ lại sắp đi lưu diễn… quen rồi.”', '“Ở cạnh cậu tớ nói nhiều hơn hẳn, lạ thật.”'],
  ['“Chiều nay rảnh không? …Ý tớ là, đi ôn bài chung ấy.”', '“Hôm qua thấy cậu đi với ai vui lắm nhỉ. Hỏi vậy thôi.”', '“Cậu nhớ ăn sáng chưa? Đây, tớ dư một hộp sữa.”'],
  ['“Lạ thật đấy… bình thường tớ không thích nói nhiều với ai.”', '“Cậu có bao giờ nghĩ sau này sẽ học ở đâu không?”', '“Đừng nhìn tớ như thế… ngại lắm.”'],
];
function vyLoveLine() {
  const h = hearts('vy'), c = loveCool();
  if (c >= 3) return pick(['“Ừ… dạo này tớ bận ôn bài.”', '“Không có gì đâu.”']);
  if (c >= 1) return pick(['“Không có gì đâu…” (rõ ràng là đang buồn)', '“Dạo này cậu bận lắm à?”']);
  if (h >= 8) return pick(['“Hôm nay tớ hơi thất vọng vì bài kiểm tra… nhưng kể cho cậu nghe xong thấy nhẹ hẳn.”', '“Mình cùng trưởng thành nhé. Có chuyện gì cậu cũng phải nói với tớ đó.”', '“Hôm nay cậu thế nào? Đến lượt tớ nghe cậu kể.”']);
  if (h >= 7) return pick(['“Hôm nay ở lớp có đứa trêu tớ, tức ghê! …Mà thôi, gặp cậu là hết tức rồi.”', '“Hừ, hôm qua cậu không nhắn tớ chúc ngủ ngon. Giận đó. Đùa thôi.”']);
  return pick(['“Trên lớp phải ra dáng lớp phó… nhưng giờ chỉ có hai đứa thôi mà.”', '“Ê, cậu có tóc dính phấn kìa. Lại đây tớ phủi cho. Hì.”', '“Chủ nhật đi uống trà sữa không? Tớ mời!”']);
}
async function vyChat() {
  const t = Math.min(5, hearts('vy')), L = isPartner('vy') ? vyLoveLine() : pick(VY_TALK[t]);
  await vyAsk(L, ['…']);
}

/* ---------- các chương (cắt cảnh) ---------- */
const vyA = (x, y, dir, extra) => Object.assign({ look: 'vy', outfit: friendOutfit('vy'), x, y, dir }, extra || {});
const live = fn => ({ live: async () => { await fn(); } });
async function vyCh1() {
  RT.lock = true; let c = 0;
  await playCut({ map: 'class', me: [252, 196, 3], cam: { x: 200, y: 130 }, title: 'Chương 1 · Hoa khôi bàn bên', hide: ['vy_cls'], actors: [vyA(191, 134, 3)],
    props: [now => { if (RT.scene && RT.scene.phone) { wRect('#2a2136', 196, 116, 8, 11); wRect('#cfe8f7', 197, 117, 6, 8); } }],
    steps: [{ fn: sc => { sc.phone = true; } }, { wait: 700 }, { say: [0, '“Mẹ: Con ơi, tối nay mẹ không về kịp. Con ăn tối trước nhé.”'] }, { wait: 500 }, { move: ['me', 214, 146, 900] }, { say: ['me', 'Vy chưa về à?'] },
      { fn: sc => { sc.phone = false; } }, { say: [0, '…Tớ đang chờ tài xế.'] },
      live(async () => { c = await vyAsk('Vy cất vội điện thoại vào cặp, quay mặt nhìn ra cửa sổ. Lớp học vắng tanh.', ['Ngồi chờ cùng Vy một lát', 'Vậy tớ về trước nhé', 'Hoa khôi mà cũng phải chờ xe à? Sang ghê']); }),
      { say: [0, 'Cảm ơn… Cậu về cẩn thận.'] }] });
  if (c === 0) { addFriend('vy', 5); G.vy.trust += 5; } else if (c === 1) addFriend('vy', 2); else { G.vy.trust -= 5; }
  G.vy.ch = 1; addMemo('scene', 'vy_c1'); RT.lock = false; UI.hud();
}
async function vyCh2() {
  RT.lock = true; let c = 0;
  const rain = now => { for (let i = 0; i < 18; i++) { const k = (now / 700 + i * 0.13) % 1; wRect('rgba(160,190,230,0.6)', 60 + (i * 37) % 200, 6 + k * 22, 1, 3); } };
  await playCut({ map: 'thuvien', me: [143, 126, 2], cam: { x: 176, y: 110 }, title: 'Chương 2 · Chiều mưa ở thư viện', hide: ['vy_lib'], actors: [vyA(205, 126, 1)], props: [rain],
    steps: [{ say: [0, 'Mưa to thế này… cậu ngồi đây đi. Tớ cũng chưa muốn về nhà sớm.'] }, { say: ['me', 'Nhà cậu không có ai à?'] },
      { say: [0, 'Bác giúp việc thôi. Mẹ tớ là diễn viên kịch, đi lưu diễn suốt.'] }, { say: [0, 'Hồi cấp hai tớ diễn văn nghệ ở trường… lần nào cũng để dành ghế đầu cho mẹ.'] }, { say: [0, 'Lần nào cái ghế cũng trống.'] },
      { move: [0, 205, 108, 500] }, { fn: () => { RT.scene.actors[0].dir = 3; } }, { say: [0, 'Ơ… tớ đi tìm cuốn sách này đã.'] },
      live(async () => { c = await vyAsk('Vy quay mặt vào giá sách, vai khẽ run. Hình như cô đang rơm rớm nước mắt.', ['Lặng im ngồi đợi, khẽ đưa Vy gói khăn giấy', 'Nếu cậu muốn kể thì tớ nghe, không thì thôi', 'Hoa khôi mà cũng mít ướt à?']); }),
      { move: [0, 205, 126, 500] }, { fn: () => { RT.scene.actors[0].dir = 1; } }, { say: [0, c === 2 ? 'Không vui đâu.' : '…Cảm ơn cậu. Tự nhiên thấy nhẹ lòng ghê.'] }] });
  if (c === 0) { addFriend('vy', 8); G.vy.trust += 10; } else if (c === 1) { addFriend('vy', 6); G.vy.trust += 7; } else { addFriend('vy', -3); G.vy.trust -= 10; }
  G.vy.ch = 2; vySet('msg'); addMemo('scene', 'vy_c2'); RT.lock = false; UI.hud();
  if (c !== 2) UI.toast('Từ giờ Vy sẽ chủ động nhắn tin hỏi thăm, rủ ôn bài.', 'good');
}
async function vyCh3() {
  RT.lock = true;
  const id = RT.hold, love = id && tasteOf('vy', id) === 'love', any = !!id && gCount(id) > 0;
  await benchCut('vy', [{ say: ['me', 'Sinh nhật mà ngồi một mình ở đây à?'] }, { say: [0, 'Cậu… biết hôm nay sinh nhật tớ hả? Mẹ đi diễn xa, bố đi làm nhiệm vụ. Tớ cũng chẳng thích tiệc tùng.'] },
    ...(any ? [{ say: ['me', `Tớ có quà cho cậu nè. ${holdName(id)}.`] }] : [{ say: ['me', 'Chúc mừng sinh nhật Vy. Tớ không kịp chuẩn bị quà…'] }]),
    { wait: 500 }, { say: [0, love ? 'Cậu đúng là đồ ngốc… Tớ đã bảo không cần làm gì mà. Nhưng… cảm ơn cậu nhiều lắm.' : any ? 'Cảm ơn cậu… Vui thật đó.' : 'Không sao. Có người nhớ là tớ vui rồi.'] },
    { say: [0, 'Bố tớ… lúc nào cũng đặt tiêu chuẩn rất cao. Điểm số, giờ giấc, đến cả cách ngồi ăn.'] }, { say: [0, 'Tớ cứ sợ, nếu không giỏi nữa thì bố có còn thương tớ không.'] }], 'Chương 3 · Sinh nhật chỉ có một người');
  if (any) { gTake(id); RT.hold = gCount(id) ? id : null; }
  addFriend('vy', love ? 12 : any ? 8 : 4); G.vy.trust += love ? 10 : 5;
  G.vy.ch = 3; vySet('night'); addMemo('scene', 'vy_c3'); RT.lock = false; UI._hb = null; UI.hud();
  if (love) UI.toast('Vy bật khóc vì cảm động. Mở khoá: tâm sự riêng, tin nhắn buổi tối, lời mời đến nhà Vy.', 'good');
}
async function vyCh4() {
  RT.lock = true; let a = 0, b = 0;
  await UI.fade(true); G.visit = 'vy'; setMap('fhome', 46, 186, 3); await UI.fade(false);
  const dad = { look: 'vyDad', x: 284, y: 200, dir: 3 };
  await playCut({ map: 'fhome', me: [16, 168, 2], cam: { x: 120, y: 130 }, title: 'Chương 4 · Bữa cơm nhà đại tướng', inPlace: true, hide: ['fh', 'fhp_bo', 'fhp_me', 'vy_maid'], actors: [vyA(78, 168, 1), dad, { look: 'vyMaid', x: 150, y: 70, dir: 0 }],
    steps: [{ say: [0, 'Bài này giải theo hướng tổng quát trước, rồi mới thay số…'] }, { wait: 600 }, { say: [2, 'Ông chủ về rồi!'] }, { move: [1, 46, 146, 1400] }, { fn: () => { RT.scene.actors[1].dir = 0; } },
      { say: [1, 'Bạn của Vy đấy à. Ở lại ăn cơm luôn. Ngồi thẳng lưng lên.'] }, { say: [1, 'Cháu học lực thế nào? Sau này định thi trường gì? Bố mẹ cháu làm nghề gì?'] },
      live(async () => { a = await UI.ask('Đại tướng Nguyễn Minh Quân', '<p>Ông nhìn thẳng vào mắt bạn, chờ câu trả lời.</p>', ['Dạ, cháu học khá, còn nhiều môn phải cố ạ', 'Dạ cháu học giỏi nhất lớp đó bác!', 'Dạ… cháu chưa nghĩ tới ạ'], { who: { look: 'vyDad' } }); }),
      { say: [1, a === 0 ? 'Biết mình còn thiếu là tốt.' : a === 1 ? 'Giỏi nhất lớp là Vy. Đừng nói quá.' : 'Phải nghĩ đi. Mười sáu tuổi rồi.'] },
      { say: [0, 'Bố… cuối năm trường có vở kịch, con muốn đăng ký tham gia.'] }, { say: [1, 'Không được. Năm nay lo học. Kịch kiếc làm gì cho mất thời gian.'] }, { say: [0, 'Lúc nào bố cũng chỉ hỏi điểm số!'] },
      { move: [0, 200, 120, 900] }, { say: [1, '…'] },
      live(async () => { b = await UI.ask('Bữa cơm', '<p>Vy bỏ đũa, lặng lẽ đi vào phòng. Đại tướng ngồi im, không ăn nữa.</p>', ['Thưa bác, Vy diễn hay lắm ạ. Cậu ấy rất muốn bác đến xem', 'Cúi đầu ăn tiếp cho xong', 'Xin phép bác, cháu vào xem Vy thế nào'], { who: { look: 'vyDad' } }); }),
      { say: [1, b === 0 ? '…Cháu nói thẳng đấy. Được, để bác nghĩ.' : b === 2 ? 'Ừ. Vào đi.' : '…'] },
      { move: ['me', 180, 128, 900] }, { say: [0, 'Tớ mệt lắm… lúc nào cũng phải cố làm bố hài lòng. Nếu tớ không còn là đứa con xuất sắc nữa, bố có còn thương tớ không?'] }] });
  const c = await vyAsk('Vy ngồi bó gối bên cửa sổ, mắt đỏ hoe.', ['Cậu nên nói chuyện nghiêm túc với bác một lần. Tớ nghĩ bác thương cậu theo cách của bác', 'Kệ đi, đừng nghĩ nữa']);
  if (c === 0) { G.vy.trust += 8; vySet('talkDad'); }
  addFriend('vy', 6 + (b === 0 ? 3 : 0)); if (a === 0) G.vy.trust += 3;
  advanceTime(90); G.vy.ch = 4; addMemo('scene', 'vy_c4'); RT.lock = false; UI.hud();
}
async function vyCh5() {
  RT.lock = true; let c = 0;
  const hasF = gCount(LOVE.flower) > 0;
  await playCut({ map: 'nui', me: [186, 300, 2], cam: { x: 200, y: 280 }, title: 'Chương 5 · Có phải tớ thích cậu rồi không?', actors: [vyA(214, 300, 1)],
    props: [() => { wRect('#e2574c', 188, 304, 30, 14); wRect('#fffaf0', 188, 304, 30, 1); for (let i = 0; i < 3; i++) wRect('#f2c27a', 194 + i * 8, 308, 6, 4); }],
    steps: [{ say: [0, 'Bánh mì kẹp tớ tự làm đó. Ăn thử đi.'] }, { say: ['me', 'Ngon ghê! Vy nấu khéo thật.'] }, { wait: 600 }, { say: [0, 'Lạ thật đấy… Bình thường tớ không thích nói nhiều với ai.'] }, { say: [0, 'Nhưng ở bên cậu, hình như có bao nhiêu chuyện tớ cũng muốn kể.'] },
      live(async () => { c = await vyAsk('Vy cúi đầu, má đỏ ửng, tay vân vê mép khăn trải.', (hasF ? ['Tặng Vy bó hoa oải hương: “Tớ thích cậu. Mình hẹn hò nhé?”'] : []).concat(['Tớ cũng thích ở bên cậu', 'Cho tớ thêm thời gian để hiểu lòng mình', 'Mình cứ là bạn tốt của nhau nhé'])); if (!hasF) c++; }),
      { say: [0, c === 0 ? '…Hoa oải hương. Cậu có biết nó nghĩa là gì không?' : c === 1 ? 'Thật hả? …Nếu cậu nghiêm túc, thì hãy nói lại với tớ bằng một cách thật đặc biệt nhé.' : c === 2 ? 'Ừ. Tớ cũng vậy. Mình cứ từ từ thôi.' : 'Ừ… bạn tốt. Cảm ơn cậu đã thật lòng.'] }] });
  G.vy.ch = 5; addMemo('scene', 'vy_c5'); addFriend('vy', 6);
  if (c === 3) vySet('friend'); else if (c >= 1) G.vy.romance = 'crush';
  advanceTime(60); RT.lock = false; UI.hud();
  if (c === 0) { confess('vy'); return; }
  if (c === 1) UI.toast('Gợi ý: đủ 5 tim, mua bó hoa oải hương ở cửa hàng hoa rồi tặng Vy để ngỏ lời.', 'info');
}
// ngỏ lời bằng hoa oải hương: Vy kéo cậu ra ghế đá công viên lúc hoàng hôn
async function vyConfessCut() {
  await benchCut('vy', [{ say: ['me', 'Vy… tớ thích cậu. Mình hẹn hò nhé?'] }, { say: [0, 'Hoa oải hương… là sự chân thành, và chờ đợi.'] }, { wait: 500 },
    { say: [0, 'Tớ đã chờ câu này lâu lắm rồi đó, đồ ngốc.'] }, { say: [0, 'Nhưng mà… trên lớp vẫn phải gọi tớ là lớp phó nhé!'] }], 'Hoa oải hương');
}
async function vyE6() {
  RT.lock = true; let c = 0;
  await playCut({ map: G.map, inPlace: true, bars: true, title: '6 tim · Hộp cơm đầu tiên', actors: [vyA(G.x + 18, G.y, 1)],
    props: [() => { wRect('#e98fa5', G.x + 2, G.y - 12, 10, 7); wRect('#fffaf0', G.x + 3, G.y - 11, 8, 3); wRect('#3f8f3a', G.x + 4, G.y - 8, 2, 2); wRect('#ffd23a', G.x + 7, G.y - 8, 3, 2); }],
    steps: [{ say: [0, 'Nè… cơm cuộn. Tớ tự làm. Lần đầu đó, đừng chê nha.'] }, { say: ['me', 'Cho tớ á? Để tớ ăn thử…'] },
      live(async () => { c = await vyAsk('Vy hồi hộp nhìn bạn cắn miếng đầu tiên. Cơm hơi nát, hơi mặn, nhưng là của Vy làm.', ['Ngon lắm! Hơi mặn chút thôi, nhưng tớ thích', 'Ngon tuyệt, không chê vào đâu được!', 'Mặn quá, cậu nấu dở thật']); }),
      { say: [0, c === 0 ? 'Thật hả? Vậy lần sau tớ bớt muối! Hì.' : c === 1 ? 'Xạo ghê… nhưng mà vui.' : 'Hừ… lần sau tự đi mà mua cơm căn tin.'] }] });
  if (c === 0) { bondAdd(8); G.vy.trust += 6; } else if (c === 1) bondAdd(6); else bondAdd(-10, 'chê thẳng hộp cơm đầu tiên');
  gainStam(c === 2 ? 6 : 16); vySet('e6'); addMemo('scene', 'vy_e6'); RT.lock = false; UI.hud();
  UI.toast('Từ giờ thỉnh thoảng Vy sẽ mang hộp cơm cho bạn (gặp Vy ở trường vào ngày Vy làm cơm).', 'good');
}
async function vyE7() {
  RT.lock = true; let c = 0;
  await playCut({ map: 'town', me: [BENCH.x - 12, BENCH.y + 6, 2], cam: { x: BENCH.x, y: BENCH.y - 10 }, title: '7 tim · Ngày bố mẹ cãi nhau', hide: ['p_vy', 'vy_inv', 'vy_bench'], actors: [vyA(BENCH.x + 12, BENCH.y + 6, 1)],
    props: [() => { ctx.fillStyle = 'rgba(255,230,150,0.10)'; ctx.fillRect(0, 0, cv.width, cv.height); }],
    steps: [{ say: [0, 'Cậu đến thật này…'] }, { say: [0, 'Bố mẹ tớ vừa cãi nhau. Về chuyện tớ thi trường nào. Bố bảo học kinh tế, mẹ bảo để con tự chọn.'] }, { say: [0, 'Chẳng ai hỏi tớ muốn gì cả.'] },
      live(async () => { c = await vyAsk('Vy ôm chặt cặp sách, ánh đèn đường hắt xuống khuôn mặt buồn.', ['Ngồi xuống cạnh Vy, im lặng lắng nghe', 'Hay mình cùng chuẩn bị cách nói với bố mẹ cậu điều cậu thật sự muốn?', 'Tớ đang bận, mai nói nhé']); }),
      { say: [0, c === 0 ? 'Cảm ơn cậu đã ở đây. Thế là đủ rồi.' : c === 1 ? 'Ừ… Tớ sẽ viết ra những gì tớ muốn, rồi nói với bố mẹ. Cậu giúp tớ nhé?' : '…Ừ. Cậu về đi.'] },
      ...(c < 2 ? [{ say: [0, 'Tớ nhận ra… một mối quan hệ tốt cần cả hai cùng chia sẻ. Từ giờ tớ cũng sẽ kể cho cậu, không giấu nữa.'] }] : [])] });
  if (c === 0) { bondAdd(6); G.vy.trust += 8; vySet('e7'); } else if (c === 1) { bondAdd(15, 'cùng Vy tìm cách giải quyết'); G.vy.trust += 10; vySet('e7'); } else { bondAdd(-12, 'bỏ mặc Vy lúc cô cần'); G.vy.trust -= 10; }
  if (vyF('e7')) addMemo('scene', 'vy_e7');
  RT.lock = false; UI.hud();
}
async function vyE8() {
  RT.lock = true;
  await UI.fade(true); G.visit = 'vy'; setMap('fhome', 220, 140, 3); await UI.fade(false);
  await playCut({ map: 'fhome', inPlace: true, me: [214, 140, 2], cam: { x: 236, y: 110 }, title: '8 tim · Chiếc hộp kỷ niệm', hide: ['fh', 'vy_maid', 'fhp_bo', 'fhp_me'], actors: [vyA(238, 140, 1)],
    props: [() => drawSpr(SPR.memBox, 216, 146)],
    steps: [{ say: [0, 'Đây là hộp kỷ niệm của tụi mình. Ảnh chụp chung, vé xem kịch, cả mấy mẩu giấy cậu viết vội nữa.'] }, { say: ['me', 'Cậu giữ hết luôn à?'] },
      { say: [0, 'Ừ. Trước đây tớ cứ phải tỏ ra hoàn hảo. Giờ thì… vui hay buồn tớ đều muốn kể với cậu.'] },
      { say: [0, 'Mình viết một bức thư gửi bản thân sau khi tốt nghiệp nhé. Ước mơ, và những điều muốn làm.'] }, { wait: 1200 }, { say: [0, 'Xong rồi! Không được đọc trộm của tớ đâu đó. Mình cùng trưởng thành nhé.'] }] });
  vySet('e8'); addMemo('item', 'hopkyniem'); addMemo('scene', 'vy_e8'); bondAdd(10); advanceTime(60);
  RT.lock = false; UI.hud();
}
// chương 6: đêm diễn vở kịch cuối năm ở nhà hát
async function vyPlayNight() {
  RT.lock = true; const help = G.vy.help || 0;
  await UI.fade(true);
  const actors = [vyA(192, 76, 0, { outfit: 'casual' }), { look: 'c6', x: 150, y: 80, dir: 2 }, { look: 'vyMom', x: 330, y: 220, dir: 3, hidden: true }, { look: 'vyDad', x: 92, y: 232, dir: 3, hidden: true }];
  for (let i = 0; i < 6; i++) actors.push({ look: ['c1', 'c3', 'c5', 'c7', 'c9', 'x1'][i], outfit: 'casual', x: 60 + i * 50 + (i > 2 ? 40 : 0), y: 152 + (i % 2) * 24, dir: 3 });
  await playCut({ map: 'nhahat', me: [184, 176, 3], cam: { x: 192, y: 120 }, title: 'Chương 6 · Ánh đèn sân khấu', actors,
    steps: [{ say: [0, 'Dù bão tố có kéo tới, tôi vẫn sẽ đứng đây — vì đây là con đường tôi tự chọn!'] }, { fn: sc => { sc.actors[2].hidden = false; } }, { move: [2, 290, 176, 1400] }, { say: [2, '(Mẹ Vy lặng lẽ ngồi xuống hàng ghế cuối, vẫn còn mặc áo khoác lưu diễn.)'] },
      { fn: sc => { sc.actors[3].hidden = false; } }, { say: [3, '(Một người đàn ông mặc quân phục đứng ở cuối khán phòng, nghiêm nghị khoanh tay.)'] }, { say: [0, help >= 2 ? 'Cảm ơn những người đã ở bên tôi, kể cả khi tôi chưa đủ dũng cảm!' : 'Cảm ơn tất cả mọi người!'] }, { wait: 800 },
      { move: [0, 200, 150, 900] }, { move: [2, 222, 150, 900] }, { say: [2, 'Vy… mẹ xin lỗi. Bao nhiêu năm mẹ vắng mặt. Hôm nay con diễn đẹp lắm.'] }, { move: [3, 178, 150, 1100] },
      { say: [3, 'Bố vẫn nghĩ học hành là quan trọng nhất.'] }, { wait: 500 }, { say: [3, '…Nhưng hôm nay bố tự hào vì con dám theo đuổi điều mình thích.'] }, { say: [0, 'Bố… mẹ…'] }] });
  vySet('play'); G.vy.ch = 6; addMemo('scene', 'vy_play'); addFriend('vy', 10); G.vy.trust += 10; if (isPartner('vy')) bondAdd(10);
  if (G.time < 1290) advanceTime(Math.max(0, 1290 - G.time));
  RT.lock = false; UI.hud();
  UI.toast('Vy đã hàn gắn với bố mẹ. Tấm ảnh gia đình trong phòng Vy được thay bằng ảnh mới.', 'good');
}
async function vyTicketShow() {
  RT.lock = true; vySet('ticket');
  await theaterCut([{ say: [0, 'Ta đợi chàng bên bến sông này đã mười năm…'] }, { say: [2, 'Hồi nhỏ tớ hay trốn sau cánh gà xem mẹ diễn. Mẹ đứng trên sân khấu đẹp lắm.'] }, { say: [2, 'Rồi tớ lớn, mẹ đi xa hơn… tớ chỉ còn giữ mấy cái vé này thôi.'] }, { say: ['me', 'Hôm nay có tớ ngồi cạnh rồi.'] }, { say: [2, 'Ừ. Cảm ơn cậu.'] }], true);
  addFriend('vy', 8); G.vy.trust += 6; addMemo('scene', 'vy_ve'); if (G.time < 1290) advanceTime(1290 - G.time);
  RT.lock = false; UI.hud();
}
async function vyUmbrella() {
  RT.lock = true; let c = 0;
  c = await vyAsk('“Tớ quên mang ô… chờ tạnh rồi về.” Vy co ro dưới mái hiên cổng trường.', ['Cho Vy mượn ô của tớ', 'Đi chung một ô ra bến xe bus nhé']);
  if (c === 1) await playCut({ map: 'school', inPlace: true, title: 'Chiếc ô dưới mưa', hide: ['vy_gate'], actors: [vyA(G.x + 10, G.y, 0)], props: [() => drawUmbrella(G.x + 5, G.y, '#3b82c4')],
    steps: [{ par: [{ move: ['me', GATE.x + 40, GATE.yOut + 40, 1800] }, { move: [0, GATE.x + 50, GATE.yOut + 40, 1800] }] }, { say: [0, 'Ô nhỏ thế này… cậu ướt hết vai rồi kìa.'] }, { say: ['me', 'Không sao, cậu không ướt là được.'] }] });
  vySet('umbrella'); G.vy.umbrellaBack = G.day + 3; addFriend('vy', c === 1 ? 6 : 4);
  if (c === 0) { G.daily.noUmb = true; } RT.lock = false; UI.hud();
}
async function vyCat() {
  RT.lock = true;
  await playCut({ map: 'school', inPlace: true, title: 'Con mèo đi lạc', hide: ['vy_cat'], actors: [vyA(716, 74, 1)],
    steps: [{ say: [0, 'Meo ơi, ăn đi nào… hôm nay có cá nè. Ngoan lắm.'] }, { say: ['me', '(Hoa khôi nghiêm nghị… lại nói chuyện dịu dàng thế này với mèo.)'] }, { fn: sc => { sc.actors[0].dir = 2; } }, { say: [0, 'Ơ! Cậu đứng đó từ bao giờ? Đừng nói với ai nhé!'] }] });
  vySet('cat'); addFriend('vy', 5); RT.lock = false; UI.hud();
}
async function vySick() {
  RT.lock = true;
  await UI.ask('Bác Lài', '<p>“Cháu mang vở sang cho Vy hả? Con bé sốt từ sáng. Để bác gọi.”</p>', ['Dạ'], { who: { look: 'vyMaid' } });
  await vyAsk('Vy ra cửa, mặc đồ ngủ, quàng khăn kín cổ: “Cậu… mang vở ghi sang cho tớ thật à? Tớ có đạt thành tích gì đâu mà cậu phải lo cho tớ vậy…”', ['Bạn ốm thì mang vở sang thôi mà']);
  await vyAsk('“…Cảm ơn cậu. Tự nhiên thấy khoẻ hơn một chút rồi.”', ['Nghỉ ngơi đi nhé']);
  vySet('sick'); addFriend('vy', 6); G.vy.trust += 8; RT.lock = false; UI.hud();
}

/* ---------- chương 7: ngày tốt nghiệp — kết thúc theo lựa chọn ---------- */
function vyEnding() {
  const V = G.vy, h = hearts('vy');
  if (isPartner('vy')) return h >= 8 && vyF('play') && !V.flags.mended ? 'A' : V.flags.mended ? 'B2' : 'A';
  if (G.exLove && G.exLove.fid === 'vy') return h >= 3 ? 'C2' : 'D2';
  if (vyF('play') && h >= 4) return 'B';
  if (V.ch >= 5) return 'C';
  return null;
}
const VY_END = {
  A: ['Mùa phượng nở', 'Sau này dù có học ở đâu, cậu vẫn phải ăn uống tử tế đấy nhé. Với lại… đừng quên cô lớp phó khó tính từng ngồi cạnh cậu.'],
  B2: ['Tìm lại nhau', 'Tụi mình từng suýt đánh mất nhau. Cảm ơn cậu đã quay lại nói chuyện thật lòng. Từ giờ, mình cùng nhau đi tiếp nhé.'],
  B: ['Những người bạn đặc biệt', 'Cảm ơn cậu đã giúp tớ dám nói chuyện với bố mẹ. Cậu là người bạn đặc biệt nhất của tớ. Nhớ giữ liên lạc đó!'],
  C: ['Điều chưa kịp nói', 'Có những điều tớ chưa kịp nói với cậu… Thôi, để dành cho một ngày nào đó. Chúc cậu thật nhiều may mắn trên con đường sắp tới.'],
  C2: ['Người từng thương', 'Cảm ơn cậu vì những ngày đã qua. Tớ chân thành mong cậu luôn hạnh phúc, và mình mãi là bạn tốt nhé.'],
  D2: ['Hai con đường', 'Mỗi người một con đường. Tớ vẫn tôn trọng cậu, và mong cậu sẽ tìm được điều mình muốn.'],
};
async function vyGraduation() {
  const e = vyEnding(); if (!e) return;
  const [name, note] = VY_END[e], dating = isPartner('vy');
  G.vy.note = note; G.vy.ending = e;
  await playCut({ map: 'class', me: [111, 134, 3], cam: { x: 160, y: 120 }, title: `Chương 7 · Lời hẹn dưới tán phượng — ${name}`, actors: [vyA(191, 134, 3)],
    steps: [{ say: [0, 'Ngày đầu tiên vào lớp, tớ đã nghĩ cậu là đứa phiền phức nhất bàn bên.'] }, { say: [0, 'Ba năm rồi. Tớ đã khác nhiều lắm, đúng không?'] }, { say: [0, 'Tớ sẽ thi vào trường sân khấu. Bố mẹ tớ… đồng ý rồi.'] },
      ...(dating ? [{ say: [0, 'Đây, hộp cơm tớ tự làm. Còn bức thư này tớ giữ từ năm lớp 11… về nhà hẵng đọc!'] }] : []), { say: [0, note] }] });
  if (dating) { gAdd('comvy8'); addMemo('item', 'thuvy'); }
  addMemo('scene', 'vy_grad');
}

/* ---------- menu nói chuyện với Vy: học nhóm, giúp tập thoại ---------- */
function vyTalkOpts(add, where) {
  if (isPartner('vy') || hearts('vy') >= 2) if (['library', 'in', 'park', 'comp'].includes(where) && !G.daily.vyStudy) add('vystudy', 'Học nhóm cùng Vy');
  if (vyPlace() === 'rehearse' && !G.daily.vyHelp) add('vyhelp', 'Giúp Vy tập thoại');
}
async function vyTalkDo(c) {
  if (c === 'vystudy') { G.daily.vyStudy = true; await studyMenu(SELF_STUDY.mins, Math.round(SELF_STUDY.pts * 1.5), SELF_STUDY.stam, true); addFriend('vy', 3); if (isPartner('vy')) bondAdd(4); return true; }
  if (c === 'vyhelp') { G.daily.vyHelp = true; G.vy.help = (G.vy.help || 0) + 1; await activity('Cầm kịch bản nhắc thoại cho Vy…', 40, () => { addFriend('vy', 4); addStat('vannghe', 2); }); if (isPartner('vy')) bondAdd(4); return true; }
  return false;
}
