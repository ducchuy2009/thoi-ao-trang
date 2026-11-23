'use strict';
/* ============================================================
 *  04z. TUYẾN TRUYỆN QUANG — "Chàng lớp trưởng luôn đứng đầu" (theo bản thiết kế cốt truyện của người làm game)
 *  Nguyễn Minh Quang: lớp trưởng 10A1, học bá Toán, mê thẻ cầu thủ, hoạt bát, giấu cảm xúc của mình. Ngoại hình: mã c1
 *  (nhân vật “học bá” tóc rẽ hai mái, đeo kính trong bộ ảnh). Thích thầm Vy từ hồi tiểu học.
 *  Mẹ — cô Lan: bán đồ khô ở chợ Bờ Đông (sạp có bán hàng). Bố — chú Thành: công nhân kỹ thuật ở nhà máy bánh kẹo, làm theo ca
 *  (tuần chẵn ca sáng 06:00–14:00, tuần lẻ ca chiều 14:00–22:00). Nhà Quang: nhà cấp 4 mái tôn cuối phố Bờ Đông, cạnh chợ.
 *
 *  LỊCH CỦA QUANG (qgPlace): ngày đi học thì ở trường; tan học thứ 2–4–6 ra chợ phụ mẹ, thứ 3–5 đá bóng ở sân công viên;
 *  thứ 7: sáng phụ chợ, chiều đá bóng · chủ nhật: sáng + chiều phụ chợ · còn lại ở nhà.
 *  CHƯƠNG (G.qg.ch): 1 Lớp trưởng cái gì cũng biết (rủ đấu thẻ, cho mượn thẻ) · 2 Thiên tài tính nhẩm ở chợ (mini-game bán hàng)
 *   3 Đối thủ số một (khi giỏi Toán: thi giải Toán ở thư viện) · 4 Bí mật của lớp trưởng (ảnh cũ với Vy, từ lớp 11 hoặc mùa Xuân lớp 10)
 *   5 Tớ nên nói với Vy thế nào? — đang hẹn hò với Vy: Quang chúc phúc ở sân bóng (nhánh A) · không: nhờ làm “quân sư”, Quang tỏ tình
 *     với Vy ở quán trà sữa Mây (nhánh B: Vy từ chối, hoặc nhận lời nếu Vy không có cảm tình với mình)
 *   6 Không phải bài toán nào cũng có đáp án — “Buổi chiều cuối cùng ở chợ” (chủ nhật, độc thân, 5♥, Quang đã khép lại tình cảm với Vy);
 *     vài hôm sau Quang tự tỏ tình (hoặc tặng hoa oải hương) → hẹn hò. Khó hơn các tuyến khác: quà không thay được các sự kiện.
 *   6♥ khi hẹn hò: bữa cơm nhà Quang (mở tim 7–8) · 8♥: Cúp Đội trưởng + thẻ kỷ niệm “Quang Đội Trưởng” · 7 tốt nghiệp: 4 kết thúc.
 *  KHI YÊU QUANG: hẹn Quang tối qua nhà kèm học, hoặc sang nhà Quang học chung — hiệu quả như một buổi học thêm (tối đa 2 buổi/tuần);
 *  đá bóng cùng, đổi thẻ trùng, phụ bán ở sạp nhà Quang (tiền công + Buôn bán), giảm giá ở sạp nhà Quang (từ 7♥), nhắc lịch thi.
 * ============================================================ */
LOOK_OF.quang = () => 'c1';
Object.assign(OUTFITS, { cas_quang: { shirt: '#3b6fb6', pants: '#2a2f3a', badge: null } });
Object.assign(LOOKS, {
  quangMom: { hair: '#3a2a2a', style: 'bun', shirt: '#e98f4a', pants: '#4a3f5b', apron: '#5fae4a', skin: '#e3ae80', eye: 'smile' },
  quangDad: { hair: '#2c2733', style: 'short', cap: '#3b6fb6', shirt: '#4a6fa5', pants: '#3a4a6b', skin: '#c98a5a' },
});
FRIEND_PARENTS.quang = ['quangDad', 'quangMom'];
Object.assign(FOODS, { lacrang: { name: 'Lạc rang', stam: 6, gift: 2 }, banhquy: { name: 'Bánh quy bơ', stam: 8, gift: 3 }, migoi: { name: 'Mì gói', stam: 14, gift: 2 } });
DATABLE.push('quang');
Object.assign(MEMO_SCENES, {
  qg_c1: { name: 'Lớp trưởng cái gì cũng biết', icon: 'qg_card', desc: 'Ngày đầu đi học, lớp trưởng Quang rủ đấu thẻ cầu thủ ngay giờ ra chơi.' },
  qg_c2: { name: 'Thiên tài tính nhẩm ở chợ Bờ Đông', icon: 'qg_calc', desc: 'Đứng sạp đồ khô của cô Lan, tính tiền thối tiền cùng Quang.' },
  qg_c3: { name: 'Đối thủ số một', icon: 'sc_hsg', desc: 'Trận thi tính nhẩm ở thư viện — từ hôm đó hai đứa thành đối thủ.' },
  qg_c4: { name: 'Bí mật của lớp trưởng', icon: 'qg_photo', desc: 'Tấm ảnh cũ rơi ra từ xấp thẻ: Quang và Vy hồi tiểu học.' },
  qg_c5: { name: 'Tớ nên nói với Vy thế nào?', icon: 'vy_heart', desc: 'Quang cuối cùng cũng nói ra điều giấu kín từ hồi tiểu học.' },
  qg_c6: { name: 'Buổi chiều cuối cùng ở chợ', icon: 'banhmi', desc: 'Dọn sạp, ăn bánh mì, nói chuyện về sau này: “Cậu chờ tớ được không?”' },
  qg_date: { name: 'Câu trả lời là cậu', icon: 'vy_heart', desc: '“Không phải bài toán nào cũng có đáp án… nhưng câu trả lời của tớ là cậu.”' },
  qg_dinner: { name: 'Bữa cơm nhà Quang', icon: 'comhop', desc: 'Canh cua, cà pháo và những câu chuyện bố Quang kể mãi không hết.' },
  qg_cup: { name: 'Cúp Đội trưởng', icon: 'qg_cup', desc: 'Giải đấu thẻ do Quang tổ chức, chung kết chỉ có hai đứa.' },
  qg_grad: { name: 'Người giỏi nhất không nhất thiết phải đứng nhất', icon: 'b_hocba', desc: 'Ngày tốt nghiệp, lớp trưởng nói lời cảm ơn dưới sân trường.' },
});
Object.assign(MEMO_ITEMS, { cupdoitruong: { name: 'Cúp Đội trưởng', desc: 'Chiếc cúp sơn vàng cùng lá thẻ “Quang Đội Trưởng” có chữ ký của lớp trưởng.', hint: 'Đạt 8 tim khi hẹn hò với Quang' } });
const QG = { house: 962, stall: [224, 142], me: [258, 146], field: [700, 330], tutWeek: 2, help: { pay: 30000, pts: 3, mins: 60 }, lesson: 90, toanBonus: 4 };
const QG_STALL = [{ id: 'lacrang', name: 'Lạc rang', price: 8000, desc: 'Túi lạc rang muối cô Lan tự rang' }, { id: 'banhquy', name: 'Bánh quy bơ', price: 12000, desc: 'Hộp bánh quy giòn tan' }, { id: 'migoi', name: 'Mì gói', price: 6000, desc: 'Gói mì ăn liền, đói bụng là có ngay' }];
const qgWho = () => ({ look: 'quang', outfit: friendOutfit('quang') });
const qgAsk = (t, opts) => UI.ask('Quang', `<p>${t}</p>`, opts || ['…'], { who: qgWho() });
const qgF = k => !!(G.qg && G.qg.flags[k]);
const qgSet = k => { G.qg.flags[k] = G.day + 1; };
const qgA = (x, y, dir, extra) => Object.assign({ look: 'quang', outfit: friendOutfit('quang'), x, y, dir }, extra || {});
const qgMathGood = () => lv('toan') >= 3 || Object.values(G.grades || {}).some(g => (g.toan || []).some(x => x.s >= 8));

/* ---------- lịch Quang và bố mẹ ---------- */
function qgPlace() {
  if (!G || !G.qg) return null;
  const t = G.time, c = cal(G.day), Q = G.qg;
  if (meetToday('quang') || isComp('quang')) return 'out';
  if (Q.inv && Q.inv.day === G.day && Q.inv.place && inWin(t, Q.inv.from, Q.inv.to)) return Q.inv.place;
  if (t < 360 || t >= 1290) return 'sleep';
  if (tetTime()) return 'home';
  if (schoolToday()) {
    const end = schoolEndT();
    if (t < end) return 'school';
    if (c.dow % 2 === 0) return inWin(t, end + 30, 1080) ? 'market' : t < end + 30 ? 'commute' : 'home';
    return inWin(t, end + 20, end + 100) && !raining() ? 'field' : t < end + 20 ? 'commute' : 'home';
  }
  if (inWin(t, 390, 660)) return 'market';
  if (c.dow === 5 && inWin(t, 870, 1020)) return raining() ? 'home' : 'field';
  if (c.dow === 6 && inWin(t, 840, 1050)) return 'market';
  return 'home';
}
const qgMomPlace = () => { const t = G.time; if (tetTime()) return 'home'; if (inWin(t, 330, 1080)) return 'market'; return t >= 1290 || t < 330 ? 'sleep' : 'home'; };
const qgShift = d => (wk(d) % 2 === 0 ? [360, 840] : [840, 1320]);              // tuần chẵn ca sáng, tuần lẻ ca chiều
function qgDadPlace() {
  const c = cal(G.day), t = G.time;
  if (tetTime() || c.dow === 6) return t >= 1320 || t < 360 ? 'sleep' : 'home';
  const [a, b] = qgShift(G.day);
  if (inWin(t, a - 20, a)) return 'go'; if (inWin(t, a, b)) return 'factory'; if (inWin(t, b, b + 20)) return 'back';
  return t >= 1350 || t < 330 ? 'sleep' : 'home';
}

/* ---------- dựng nhân vật, nhà Quang ---------- */
function buildQuangStory() {
  const d = MAPS.dong, hx = QG.house + 49;
  const H0 = addHouse(d, 'hs_quang', QG.house, 47, { door: true, label: () => 'Nhà Quang — bấm chuông', act: () => ACT.house('quang') });
  d.labels.push({ x: H0.x + 49, y: H0.y + 40, text: 'TẠP HOÁ LAN', size: 5, col: '#ffe066', maxw: 36 });
  const pq = (id, map, x, y, dir, place, label, extra) => NPCS.push(Object.assign({ id, fid: 'quang', name: 'Quang', look: 'quang', outfit: () => friendOutfit('quang'), map, x, y, dir, vis: () => qgPlace() === place && !sceneHides(id), label: () => `Quang — ${label}`, act: () => ACT.friend('quang', place) }, extra || {}));
  pq('qg_mk', 'cho', QG.me[0], QG.me[1], 0, 'market', 'đang phụ mẹ bán hàng ở sạp đồ khô');
  pq('qg_field', 'town', QG.field[0], QG.field[1], 1, 'field', 'đang đá bóng ở sân công viên', { wander: 24 });
  pq('qg_front', 'dong', hx + 22, 146, 0, 'home', 'đang xếp thùng hàng trước nhà', { wander: 8, vis: () => qgPlace() === 'home' && inWin(G.time, 1080, 1110) && !raining() && !tripRun('qg_home') && !sceneHides('qg_front') });
  pq('qg_myhome', 'home', 92, 62, 1, 'myhome', 'sang kèm bạn học bài (bấm để bắt đầu học)', { act: () => qgLesson('home') });
  // mẹ Quang ở sạp đồ khô trong chợ (thay người bán cũ), bố Quang ở nhà máy theo ca
  const mk = NPCS.find(n => n.id === 'mk_mk_kho');
  if (mk) Object.assign(mk, { name: 'Cô Lan', look: 'quangMom', vis: () => qgMomPlace() === 'market' && !sceneHides('mk_mk_kho'), label: () => 'Cô Lan (mẹ Quang) — sạp đồ khô', act: () => ACT.qgStall() });
  NPCS.push({ id: 'qg_dad_f', name: 'Chú Thành', look: 'quangDad', map: 'nhamay', x: 200, y: 120, dir: 3, vis: () => qgDadPlace() === 'factory', label: () => 'Chú Thành — bố Quang, công nhân kỹ thuật', act: () => qgParentTalk('dad') });
  const [a0, b0] = [700, 132];
  addTrip({ id: 'qgd_go', map: 'dong', look: 'quangDad', name: 'Chú Thành', at: () => qgShift(G.day)[0] - 20, win: 20, when: () => qgDadPlace() === 'go', legs: () => [[hx, 130, 'walk'], [hx, 176, 'walk'], [a0, 176, 'walk'], [a0, b0, 'walk']] });
  addTrip({ id: 'qgd_bk', map: 'dong', look: 'quangDad', name: 'Chú Thành', at: () => qgShift(G.day)[1], win: 20, when: () => qgDadPlace() === 'back', legs: () => [[a0, b0, 'walk'], [a0, 176, 'walk'], [hx, 176, 'walk'], [hx, 130, 'walk']] });
  // Quang đi học / ra chợ / về nhà trên phố Bờ Đông (mép trái là đường ra bờ sông, sang trường)
  const MK = [883, 130], qo = { look: 'quang', outfit: () => friendOutfit('quang'), name: 'Quang', map: 'dong' }, free = () => !!G && !isComp('quang') && !meetToday('quang');
  const marketDay = () => schoolToday() && cal(G.day).dow % 2 === 0;
  addTrip(Object.assign({ id: 'qg_sch', at: 372, win: 22, when: () => free() && schoolToday(), legs: () => [[hx, 130, 'walk'], [hx, 176, 'walk'], [-14, 176, 'walk']] }, qo));
  addTrip(Object.assign({ id: 'qg_tomk', at: () => schoolEndT() + 16, win: 14, when: () => free() && marketDay(), legs: () => [[-14, 176, 'walk'], [MK[0], 176, 'walk'], [MK[0], MK[1], 'walk']] }, qo));
  const ballEnd = () => schoolEndT() + (rainAt(G.day, schoolEndT() + 20) > 0 ? 22 : 102);       // thứ 3–5: đá bóng xong mới về (mưa thì về luôn)
  addTrip(Object.assign({ id: 'qg_home', at: () => (marketDay() ? 1080 : ballEnd()), win: 16, when: () => free() && schoolToday(), legs: () => (marketDay() ? [[MK[0], MK[1], 'walk'], [MK[0], 176, 'walk'], [hx, 176, 'walk'], [hx, 130, 'walk']] : [[-14, 176, 'walk'], [hx, 176, 'walk'], [hx, 130, 'walk']]) }, qo));
  addTrip(Object.assign({ id: 'qg_wk', at: 376, win: 14, when: () => free() && !schoolToday() && !tetTime(), legs: () => [[hx, 130, 'walk'], [hx, 176, 'walk'], [MK[0], 176, 'walk'], [MK[0], MK[1], 'walk']] }, qo));
  // bố mẹ Quang trong nhà khi sang nhà Quang
  for (const [id, who] of [['fhp_bo', 'dad'], ['fhp_me', 'mom']]) {
    const n = NPCS.find(q => q.id === id); if (!n) continue;
    const v1 = n.vis, a1 = n.act, l1 = n.label;
    n.vis = () => (G.visit === 'quang' ? !sceneHides(id) && (tetTime() || (who === 'dad' ? qgDadPlace() === 'home' : qgMomPlace() === 'home')) : v1());
    n.act = () => (G.visit === 'quang' && !tetTime() ? qgParentTalk(who) : a1());
    n.label = () => (G.visit === 'quang' ? (who === 'dad' ? 'Chú Thành — bố Quang' : 'Cô Lan — mẹ Quang') : l1());
  }
}
function qgParentTalk(who) {
  if (who === 'dad') return UI.ask('Chú Thành', `<p>“${pick(['Thằng Quang nhà chú ham học lắm, chú chỉ lo nó học khuya quá thôi.', 'Hôm nay chú làm ca ' + (qgShift(G.day)[0] === 360 ? 'sáng' : 'chiều') + '. Máy móc ở xưởng chạy đều, không sao cả.', 'Cháu chơi với Quang thì nhắc nó nghỉ ngơi giúp chú nhé.'])}”</p>`, ['Dạ'], { who: { look: 'quangDad' } });
  return UI.ask('Cô Lan', `<p>“${pick(['Bạn của Quang hả? Ăn gói lạc này đi cháu, cô vừa rang!', 'Thằng Quang nhà cô tính tiền còn nhanh hơn máy tính đấy, hihi.', 'Cuối tuần chợ đông, rảnh thì ra phụ cô với Quang nhé, cô trả công đàng hoàng.'])}”</p>`, ['Dạ'], { who: { look: 'quangMom' } });
}
// sạp đồ khô của cô Lan: mua hàng (từ 7♥ khi hẹn hò với Quang: giảm 10%)
ACT.qgStall = () => {
  if (!inWin(G.time, 300, 1080)) return UI.say('Sạp đồ khô cô Lan', 'Chợ đã tan.<p class="dim">Chợ họp 05:00–18:00.</p>');
  const off = isPartner('quang') && hearts('quang') >= 7 ? 0.9 : 1;
  const items = () => QG_STALL.map(it => Object.assign({}, it, { price: Math.round(it.price * off / 1000) * 1000 || 1000 }));
  UI.store('Sạp đồ khô cô Lan', `“Mua gì cháu ơi? ${off < 1 ? 'Người nhà cả, cô bớt cho!' : 'Hàng mới về, rẻ lắm!'}”`, items, it => {
    if (G.money < it.price) return UI.toast('Không đủ tiền.', 'bad');
    addMoney(-it.price, true); gAdd(it.id); UI._hb = null; UI.hud(); UI.toast(`Đã mua ${it.name.toLowerCase()} (−${fmtMoney(it.price)}).`, 'good');
  }, () => (off < 1 ? '<p class="dim">Ưu đãi người nhà: giảm 10% ở sạp nhà Quang.</p>' : ''));
};

/* ---------- mini-game: bán hàng cùng Quang (tính tiền, trả tiền thừa, thương lượng) ---------- */
async function qgSellGame(title) {
  let ok = 0, n = 0;
  const customers = [['c4', 'Cô Hoa'], ['ph3', 'Bác Năm'], ['c9', 'Chị Thảo']];
  for (const [look, nm] of customers) {
    const k = 2 + Math.floor(Math.random() * 2), pick3 = QG_STALL.slice().sort(() => Math.random() - 0.5).slice(0, k), qty = pick3.map(() => 1 + Math.floor(Math.random() * 3));
    const total = pick3.reduce((s, it, i) => s + it.price * qty[i], 0), pay = total <= 20000 ? 20000 : total <= 50000 ? 50000 : 100000;
    const list = pick3.map((it, i) => `${qty[i]} ${it.name.toLowerCase()} (${fmtMoney(it.price)})`).join(', ');
    const opts1 = [total, total + 2000, total - 2000].sort(() => Math.random() - 0.5);
    const c1 = await UI.ask(`${title} · ${nm}`, `<p>${nm}: “Lấy cho cô ${list} nhé.”</p><p class="dim">Tổng bao nhiêu?</p>`, opts1.map(fmtMoney), { who: { look } });
    n++; if (opts1[c1] === total) ok++;
    const ch = pay - total, opts2 = [ch, ch + 1000, ch + 5000].sort(() => Math.random() - 0.5);
    const c2 = await UI.ask(`${title} · ${nm}`, `<p>${nm} đưa tờ ${fmtMoney(pay)}. Trả lại bao nhiêu?</p>`, opts2.map(fmtMoney), { who: { look } });
    n++; if (opts2[c2] === ch) ok++;
  }
  const c3 = await UI.ask(`${title} · thương lượng`, '<p>Một bà cụ xin bớt: “Bớt cho bà ít đi cháu, bà mua nhiều mà.”</p>', ['Bớt cho bà 2 nghìn, tặng thêm cái túi', 'Dạ giá này là rẻ nhất rồi ạ', 'Bớt một nửa luôn bà ơi'], { who: { look: 'ph1' } });
  n++; if (c3 === 0) ok++;
  return ok / n;
}
async function qgHelpStall() {
  if (G.daily.qgHelp) return UI.toast('Hôm nay đã phụ sạp nhà Quang rồi.');
  if (G.stamina < 6) return UI.toast('Mệt quá, không phụ bán nổi.', 'bad');
  G.daily.qgHelp = true; RT.lock = true;
  const s = await qgSellGame('Phụ bán cùng Quang');
  const dating = isPartner('quang'), pts = Math.round(QG.help.pts * (0.6 + s) * (dating ? 1.1 : 1)), pay = Math.round(QG.help.pay * (0.5 + s) / 1000) * 1000;
  advanceTime(QG.help.mins); useStam(6, true); addStat('buonban', pts); addWage('Phụ bán ở sạp nhà Quang', pay); addFriend('quang', 3); if (dating) bondAdd(4);
  RT.lock = false; UI.hud();
  UI.toast(`Phụ bán xong: đúng ${Math.round(s * 100)}% · +${pts} Buôn bán · tiền công ${fmtMoney(pay)} (trả cuối ngày).`, 'good');
}

/* ---------- các chương ---------- */
async function qgCh1() {
  RT.lock = true;
  await playCut({ inPlace: true, bars: true, title: 'Chương 1 · Lớp trưởng cái gì cũng biết', actors: [qgA(G.x + 18, G.y, 1)], hide: ['m1'],
    steps: [{ say: [0, `Chào ${G.name}! Tớ là Quang, lớp trưởng. Có gì chưa biết cứ hỏi tớ: lịch học, thầy cô, nhà vệ sinh ở đâu, tớ biết hết!`] },
      { say: ['me', 'Nghe bảo cậu làm bài Toán nhanh nhất lớp hả?'] }, { say: [0, 'Ờ thì… Toán dễ mà. Nhưng ra chơi thì tớ chỉ quan tâm cái này thôi!'] },
      { say: [0, 'Thẻ cầu thủ! Đấu với tớ một trận không? Tiền đạo của tớ mạnh nhất lớp đó.'] }] });
  if (!cardCount()) {
    const commons = CARDS.filter(c => c.r === 0).sort(() => Math.random() - 0.5).slice(0, 5);
    for (const c of commons) G.cards[c.id] = (G.cards[c.id] || 0) + 1;
    await qgAsk('“Chưa có thẻ hả? Cầm tạm mấy lá này của tớ mà chơi thử. Thua cũng không sao, coi như học việc!”', ['Cảm ơn lớp trưởng!']);
  }
  G.qg.ch = 1; addFriend('quang', 4); addMemo('scene', 'qg_c1'); RT.lock = false; UI.hud();
  if (!G.cardTut) return qgAsk('“À mà cậu chưa biết luật chơi hả? Ra sân trường nhờ mấy anh khoá trên chỉ cho, xong đấu với tớ nhé. Tớ chờ đấy!”', ['Ok lớp trưởng']);
  await cardDuel('f_quang', 'quang', 'Quang', 'kha');
}
async function qgCh2() {
  RT.lock = true;
  await playCut({ map: 'cho', me: [QG.me[0] + 4, QG.me[1] + 26, 3], cam: { x: 230, y: 120 }, title: 'Chương 2 · Thiên tài tính nhẩm ở chợ Bờ Đông', hide: ['qg_mk', 'mk_mk_kho'], actors: [qgA(QG.me[0], QG.me[1], 0), { look: 'quangMom', x: QG.stall[0], y: QG.stall[1], dir: 0 }, { look: 'c4', x: 290, y: 170, dir: 1 }],
    steps: [{ say: [2, 'Hai lạc, một bánh quy, ba mì gói. Bao nhiêu cháu?'] }, { say: [0, 'Dạ 16 nghìn lạc, 12 nghìn bánh, 18 nghìn mì — 46 nghìn ạ! Cô đưa 50 thì cháu thối 4 nghìn.'] },
      { say: ['me', 'Ơ… Quang tính nhanh thế!'] }, { fn: sc => { sc.actors[0].dir = 3; } }, { say: [0, `Ủa, ${G.name}! Cậu đi chợ hả? Tớ tính nhanh là nhờ phụ mẹ từ bé đấy, chứ sách vở dạy đâu có thối tiền.`] },
      { say: [1, 'Bạn của Quang hả? Hôm nay chợ đông quá, cháu phụ cô với Quang một tay nhé!'] }] });
  const s = await qgSellGame('Bán hàng cùng Quang');
  await qgAsk(s >= 0.7 ? '“Đỉnh! Cậu có khiếu buôn bán đấy. Lúc nào rảnh ra phụ tớ, mẹ tớ trả công đàng hoàng.”' : '“Không sao, lần đầu ai cũng vậy. Tính tiền thì cứ cộng từng món, làm nhiều là quen tay.”', ['Ừ!']);
  addStat('buonban', 3 + Math.round(4 * s)); addFriend('quang', 6); advanceTime(40);
  G.qg.ch = 2; addMemo('scene', 'qg_c2'); RT.lock = false; UI.hud();
  UI.toast('Mở khoá: phụ bán ở sạp nhà Quang (thứ 2–4–6 sau giờ học, sáng cuối tuần) — có tiền công và điểm Buôn bán.', 'good');
}
async function qgCh3() {
  RT.lock = true; let win = 0;
  const qs = [[17, 6], [24, 15], [13, 13]].map(([a, b]) => { const v = a * b; return [`${a} × ${b} = ?`, [v, v + 10, v - 6].sort(() => Math.random() - 0.5), v]; });
  await playCut({ map: 'thuvien', me: [143, 126, 2], cam: { x: 176, y: 110 }, title: 'Chương 3 · Đối thủ số một', actors: [qgA(205, 126, 1)],
    steps: [{ say: [0, 'Nghe nói bài Toán vừa rồi cậu được điểm cao lắm hả? Cuối cùng cũng có đối thủ xứng tầm!'] }, { say: [0, 'Thi tính nhẩm với tớ đi. Ba câu, ai nhanh hơn thắng!'] },
      { live: async () => { for (const [q, opts, v] of qs) { const c = await UI.ask('Thi tính nhẩm với Quang', `<p><b>${q}</b></p><p class="dim">Quang đang nhẩm…</p>`, opts.map(String), { who: qgWho() }); if (opts[c] === v) win++; } } },
      { say: [0, ''] }] });
  const won = win >= 2;
  await qgAsk(won ? '“Cậu đúng ' + win + '/3! Ghê thật… Tớ thua rồi nhưng vui ghê, từ giờ mình là đối thủ nhé!”' : `“Đúng ${win}/3, tớ thắng nha! Nhưng cậu tiến bộ nhanh lắm, lần sau chưa chắc đâu.”`, ['Hẹn tái đấu!']);
  addStat('toan', won ? 6 : 3); addFriend('quang', won ? 7 : 5); if (freeTime()) advanceTime(20);
  G.qg.ch = 3; addMemo('scene', 'qg_c3'); RT.lock = false; UI.hud();
}
async function qgCh4() {
  RT.lock = true;
  await playCut({ inPlace: true, bars: true, title: 'Chương 4 · Bí mật của lớp trưởng', actors: [qgA(G.x + 18, G.y, 1)], hide: ['m1', 'qg_mk', 'qg_field', 'qg_front'],
    props: [now => { if (RT.scene && RT.scene.photo) { wRect('#2a2136', G.x + 4, G.y + 2, 10, 8); wRect('#fff6e3', G.x + 5, G.y + 3, 8, 6); wRect('#3b6fb6', G.x + 6, G.y + 5, 2, 3); wRect('#ff8fb4', G.x + 10, G.y + 5, 2, 3); } }],
    steps: [{ say: [0, 'Đấu thêm ván nữa không? Để tớ xào bài…'] }, { fn: sc => { sc.photo = true; } }, { say: ['me', 'Ơ, có tấm ảnh rơi ra này. Hai đứa nhỏ… đây là cậu với Vy hả?'] },
      { say: [0, 'À… ừ. Hồi tiểu học. Tớ với Vy chơi với nhau từ bé. Tớ hay giảng Toán cho Vy, còn Vy giúp tớ mấy bài cắt dán tỉ mỉ.'] },
      { say: [0, 'Tớ… thích Vy lâu rồi. Định nói mấy lần mà sợ mọi chuyện khó xử, hai đứa là bạn lâu quá rồi.'] }, { fn: sc => { sc.photo = false; } },
      { say: [0, 'Cậu giữ bí mật giúp tớ nhé. Lớp trưởng mà cũng có lúc không biết giải bài toán của chính mình.'] }] });
  G.qg.ch = 4; addFriend('quang', 5); addMemo('scene', 'qg_c4'); RT.lock = false; UI.hud();
}
// chương 5 · nhánh A: đang hẹn hò với Vy → Quang chúc phúc ở sân bóng
async function qgCh5A() {
  RT.lock = true;
  await playCut({ map: 'town', me: [QG.field[0] - 20, QG.field[1], 2], cam: { x: QG.field[0], y: QG.field[1] - 10 }, title: 'Chương 5 · Ê, cậu với Vy…', hide: ['qg_field', 'p_khoa', 'p_dat'], actors: [qgA(QG.field[0], QG.field[1], 1)],
    steps: [{ say: [0, 'Ê, cậu với Vy… đang hẹn hò thật à?'] }, { say: ['me', 'Ừ, sao thế?'] }, { wait: 500 },
      { say: [0, 'Không có gì. Tớ với Vy chơi từ hồi tiểu học. Tớ biết cậu ấy đôi lúc hơi khó hiểu, nhưng thật ra rất tốt bụng.'] },
      { say: [0, 'Nhớ quan tâm cậu ấy nhé. Thôi, ra sân đá bóng với tớ đi!'] }] });
  G.qg.vy = 'blessed'; G.qg.ch = 5; addFriend('quang', 6); addMemo('scene', 'qg_c5'); RT.lock = false; UI.hud();
}
// chương 5 · nhánh B: Quang nhờ làm quân sư, hẹn tỏ tình với Vy ở quán trà sữa Mây
async function qgCh5B() {
  RT.lock = true;
  const c = await qgAsk('Quang gãi đầu: “Ờm… cậu có kinh nghiệm tỏ tình không? Tớ muốn nói với Vy. Nhưng nếu cậu ấy từ chối, tớ sợ mất luôn một người bạn.”', ['Cứ thành thật với Vy, nói rõ lòng mình', 'Để tớ giúp cậu chuẩn bị lời nói và chọn lúc thích hợp', 'Nói đi, nhưng phải tôn trọng câu trả lời của Vy']);
  await qgAsk(c === 1 ? '“Cậu giúp tớ thật hả? Vậy… chiều mai ở quán trà sữa Mây (phố Hoa Phượng), 16:30. Cậu ghé qua cổ vũ tớ nhé!”' : '“Ừ… Tớ sẽ nói. Chiều mai 16:30 ở quán trà sữa Mây. Có gì tớ kể cậu nghe.”', ['Cố lên lớp trưởng!']);
  G.qg.inv = { kind: 'qconfess', day: G.day + 1, from: 990, to: 1080, map: 'pho', x: 520, y: 150 }; G.qg.advice = c;
  addFriend('quang', c === 1 ? 6 : 4); RT.lock = false; UI.hud();
}
// kết quả lời tỏ tình của Quang với Vy (có mặt thì xem cảnh, vắng thì Quang nhắn kể lại)
function qgVyAnswer() {
  const V = G.vy;
  return !!V && !V.flags.dated && V.romance !== 'crush' && !isPartner('vy') && hearts('vy') <= 3 && V.ch < 5;
}
async function qgConfessVy(seen) {
  const yes = qgVyAnswer(); G.qg.ch = 5; G.qg.vy = yes ? 'couple' : 'declined'; addMemo('scene', 'qg_c5');
  if (yes) { G.qg.vyCouple = true; if (G.vy) G.vy.romance = 'quang'; }
  if (!seen) { if (hasNum('quang')) inbox('quang', yes ? 'Vy… đồng ý rồi! Tớ không tin nổi. Cảm ơn cậu vì đã làm quân sư cho tớ!' : 'Vy bảo chỉ coi tớ là bạn thân thôi. Cũng tốt, ít nhất tớ đã nói ra. Mai đá bóng nhé.'); return; }
  RT.lock = true;
  await playCut({ map: 'pho', me: [470, 152, 2], cam: { x: 510, y: 140 }, title: 'Chương 5 · Tớ nên nói với Vy thế nào?', hide: ['vy_tea'], actors: [qgA(506, 146, 2), { look: 'vy', outfit: friendOutfit('vy'), x: 530, y: 146, dir: 1 }],
    steps: [{ say: [0, 'Vy… tớ thích cậu từ hồi tiểu học. Không phải kiểu bạn thân đâu.'] }, { wait: 600 },
      ...(yes ? [{ say: [1, '…Đồ ngốc. Tớ cứ chờ mãi xem bao giờ cậu mới chịu nói.'] }, { say: [0, 'Thật… thật hả?!'] }]
        : [{ say: [1, 'Quang… cảm ơn cậu đã thật lòng. Nhưng tớ chỉ coi cậu là bạn thân nhất thôi. Mình vẫn là bạn như trước nhé?'] }, { say: [0, 'Ừ… Ừ, tất nhiên rồi. Bạn thân mà!'] }])] });
  if (!yes) await qgAsk('Vy đi rồi, Quang quay sang cười gượng: “Thôi thì… ít nhất tớ đã nói ra được. Cảm ơn cậu đã ở đây.”', ['Lớp trưởng giỏi lắm']);
  addFriend('quang', 6); RT.lock = false; UI.hud();
}
// chương 6: “Buổi chiều cuối cùng ở chợ” (chủ nhật, mẹ Quang bận, giúp Quang dọn sạp)
async function qgLastMarket() {
  RT.lock = true;
  await playCut({ map: 'cho', me: [QG.me[0] + 4, QG.me[1] + 26, 3], cam: { x: 230, y: 130 }, title: 'Chương 6 · Không phải bài toán nào cũng có đáp án', hide: ['qg_mk', 'mk_mk_kho'], actors: [qgA(QG.me[0], QG.me[1], 0)],
    props: [() => { wRect('#f2c27a', QG.me[0] + 10, QG.me[1] + 14, 6, 3); wRect('#f2c27a', QG.me[0] + 16, QG.me[1] + 18, 6, 3); }],
    steps: [{ say: [0, 'Mẹ tớ đi lấy hàng rồi, nay hai đứa dọn sạp nhé. Xong tớ khao bánh mì!'] }, { wait: 900 },
      { say: [0, 'Ngồi đây ăn bánh mì đi. Sau này… cậu định học gì?'] }, { say: ['me', 'Chưa biết nữa. Còn cậu?'] },
      { say: [0, 'Tớ thích Toán, nhưng cũng muốn mở rộng cửa hàng cho mẹ. Học kinh tế thì sao nhỉ?'] }, { wait: 500 },
      { say: [0, 'Lạ thật. Mấy chuyện này tớ chưa từng kể với ai, kể cả Vy. Vậy mà nói với cậu lại thấy dễ.'] },
      { say: [0, 'Tớ cần thêm chút thời gian để hiểu cảm giác này là gì. Cậu… chờ tớ được không?'] }] });
  qgSet('lastMarket'); G.qg.ch = 6; addFriend('quang', 6); addMemo('scene', 'qg_c6'); advanceTime(60);
  RT.lock = false; UI.hud();
}
// Quang tự tỏ tình (vài hôm sau chương 6, nếu mình chưa tặng hoa oải hương)
async function qgConfessSelf() {
  qgSet('qconf');
  const c = await qgAsk('Quang đứng trước mặt bạn, hít một hơi thật sâu: “Tớ nghĩ kỹ rồi. Không phải bài toán nào cũng có đáp án… nhưng câu trả lời của tớ là cậu. Mình hẹn hò nhé?”', ['Ừ, tớ đồng ý!', 'Cho tớ thời gian suy nghĩ thêm', 'Mình cứ làm bạn tốt nhé']);
  if (c === 0) { await qgStartDating(); return; }
  if (c === 2) { qgSet('friend'); return qgAsk('“…Ừ. Đối thủ truyền kiếp vẫn là đối thủ truyền kiếp nhỉ. Không sao, mình vẫn là bạn thân!”', ['Cảm ơn cậu']); }
  return qgAsk('“Ừ, tớ chờ. Khi nào sẵn sàng thì nói tớ biết — hoặc tặng tớ một bó hoa oải hương cũng được, hì.”', ['Ừ']);
}
async function qgStartDating() {
  if (G.love) return;
  G.love = { fid: 'quang', since: G.day, bond: LOVE.bond0, last: G.day, cool: 0, coolDay: 0, mend: 0, argued: 0, inv: null };
  addFriend('quang', 6, true); addMemo('scene', 'henho'); addMemo('scene', 'qg_date'); UI.hud();
  UI.toast('Bạn và Quang chính thức hẹn hò — mở thêm tim 6–8. Từ giờ có thể hẹn Quang qua nhà kèm học, hoặc sang nhà Quang học chung.', 'good');
}
const qgCanDate = () => G.qg.ch >= 6 && ['declined', 'blessed'].includes(G.qg.vy) && !G.qg.vyCouple && !qgF('friend');
// tim của Quang khi hẹn hò: tim 7–8 cần bữa cơm nhà Quang
const qgLoveCap = () => (qgF('dinner') ? 160 : 120);
// tặng hoa oải hương khi Quang chưa sẵn sàng: quà không thay được các sự kiện của tuyến
function qgNoDateLine() {
  const Q = G.qg;
  if (Q.vyCouple) return '“Cảm ơn cậu… nhưng tớ đang hẹn hò với Vy rồi. Mình vẫn là bạn thân nhất nhé!” — Quang gãi đầu, trả lại bó hoa.';
  if (qgF('friend')) return '“Mình đã chọn làm đối thủ truyền kiếp rồi mà, nhớ không? …Cho tớ thêm thời gian nhé.”';
  if (Q.ch < 4) return '“Hoa oải hương? Ha ha, cậu tặng nhầm người rồi! Để dành cho ai đặc biệt hơn đi.” — Quang cười lớn, nhưng tai đỏ bừng.';
  if (Q.ch < 6) return '“Tớ… chưa sắp xếp xong mọi chuyện trong lòng mình. Còn chuyện của tớ với Vy nữa. Cho tớ thời gian nhé.” — Quang cúi đầu, đưa lại bó hoa.';
  return '“Tớ vẫn đang nghĩ… Cho tớ thêm chút thời gian.”';
}
// bấm chuông lúc Quang không ở nhà
function qgNotHome() {
  const p = qgPlace();
  return { school: 'Giờ này Quang đang ở trường mà cháu?', market: 'Quang ra chợ phụ cô bán hàng rồi, sạp đồ khô trong chợ ấy.', field: 'Quang đi đá bóng ở sân công viên rồi cháu ạ.', commute: 'Quang chưa về tới nhà, chắc đang trên đường.', myhome: 'Quang sang nhà cháu kèm học rồi còn gì!', sleep: 'Khuya rồi cháu ơi, Quang ngủ rồi.' }[p] || 'Quang vừa chạy đi đâu đó rồi cháu ạ.';
}
async function qgConfessCut() {
  await qgAsk('Bạn chìa bó hoa oải hương ra. Quang đỏ bừng mặt, kính trễ xuống mũi: “Hoa… cho tớ á?”', ['Tớ thích cậu. Mình hẹn hò nhé?']);
  await qgAsk('“Tớ tính được mọi thứ, trừ lúc này. Ừ… tớ đồng ý. Cảm ơn cậu đã chờ tớ.”', ['♥']);
}
// 6♥ khi hẹn hò: bữa cơm nhà Quang (mở tim 7–8)
async function qgDinner() {
  if (G.ride) dismount(true);
  G.visit = 'quang'; await goPlace('fhome', 46, 196, 3, 0);
  RT.lock = true;
  await playCut({ map: 'fhome', inPlace: true, cam: { x: 110, y: 150 }, title: '6 tim · Bữa cơm nhà Quang', hide: ['fh', 'fhp_bo', 'fhp_me'], actors: [qgA(84, 172, 1), { look: 'quangMom', x: 36, y: 150, dir: 0 }, { look: 'quangDad', x: 60, y: 150, dir: 0 }],
    steps: [{ move: ['me', 12, 172, 500] }, { fn: () => { G.dir = 2; } }, { say: [1, 'Ăn đi cháu, cô nấu canh cua với cà pháo đấy. Nhà cô đơn giản thôi.'] }, { say: [2, 'Quang nó kể về cháu suốt. Hôm nào cũng “hôm nay bạn ấy giải được bài khó”…'] },
      { say: [0, 'Bố! Đừng kể nữa mà!'] }, { say: [1, 'Sau này hai đứa mở cửa hàng to, cô ra làm thu ngân cho, hihi.'] }, { say: ['me', 'Dạ, cơm ngon lắm ạ!'] }] });
  qgSet('dinner'); bondAdd(8); addFriend('quang', 4, true); addMemo('scene', 'qg_dinner'); advanceTime(60);
  RT.lock = false; UI.hud();
  UI.toast('Quang đưa bạn vào cuộc sống gia đình mình. Mở tim 7–8.', 'good');
}
// 8♥: Cúp Đội trưởng + thẻ kỷ niệm “Quang Đội Trưởng”
async function qgCup() {
  RT.lock = true;
  await playCut({ inPlace: true, bars: true, title: '8 tim · Cúp Đội trưởng', actors: [qgA(G.x + 18, G.y, 1)], hide: ['m1'], props: [() => drawSpr(SPR.qgCup, G.x + 4, G.y - 44)],
    steps: [{ say: [0, 'Giải đấu thẻ “Cúp Đội trưởng” do tớ tổ chức! Cả lớp đăng ký rồi, chung kết là cậu với tớ.'] }, { wait: 800 },
      { say: [0, 'Cậu thắng rồi… À không, tớ cố ý nhường đâu! Cậu giỏi thật đấy.'] }, { say: [0, 'Tặng cậu lá thẻ này. Bản duy nhất, có chữ ký của đội trưởng.'] }] });
  const card = CARDS.find(c => /Quang/.test(c.name)); if (card) G.cards[card.id] = (G.cards[card.id] || 0) + 1;
  qgSet('cup'); addMemo('item', 'cupdoitruong'); addMemo('scene', 'qg_cup'); bondAdd(10);
  RT.lock = false; UI.hud();
}

/* ---------- học cùng Quang: như một buổi học thêm (tối đa 2 buổi/tuần khi hẹn hò) ---------- */
const qgTutLeft = () => QG.tutWeek - ((G.qg.tutWk || {})[wk(G.day)] || 0);
async function qgLesson(where) {
  if (RT.lock) return;
  if (!isPartner('quang') || !lovePerks()) return qgAsk('“Dạo này tớ bận ôn đội tuyển quá, để hôm khác nhé.”', ['Ừ']);
  if (qgTutLeft() <= 0) return qgAsk('“Tuần này học đủ hai buổi rồi, nghỉ ngơi đi. Tuần sau tớ kèm tiếp!”', ['Ừ']);
  if (G.stamina < TUTOR.stam) return qgAsk('“Trông cậu mệt lắm, đi ngủ sớm đi, mai học.”', ['Ừ']);
  const c = await UI.ask(where === 'home' ? 'Quang sang kèm học' : 'Học chung ở nhà Quang', '<p>“Học môn gì nào? Toán là sở trường của tớ, nhưng môn nào tớ cũng kèm được.”</p><p class="dim">90 phút · hiệu quả như một buổi học thêm (cộng vào bài kiểm tra môn đó trong học kỳ) · Toán được thêm điểm.</p>', BOOK_SUBJ.map(s => SUBJ[s].name).concat('Thôi'), { grid: true, who: qgWho() });
  if (c < 0 || c >= BOOK_SUBJ.length) return;
  const s = BOOK_SUBJ[c], S = SUBJ[s]; RT.lock = true;
  const home = where === 'home', A = home ? qgA(92, 62, 1) : qgA(290, 62, 1);
  await playCut({ map: home ? 'home' : 'fhome', me: home ? [70, 62, 2] : [268, 62, 2], bars: false, title: `Học ${S.name} cùng Quang`, actors: [A], hide: ['qg_myhome', 'fh'],
    steps: [{ say: [0, s === 'toan' ? 'Bài này mẹo nè: đặt ẩn phụ là ra liền.' : `${S.name} thì phải nắm ý chính trước đã, để tớ tóm tắt cho.`] },
      { live: async () => { await UI.progress(`Đang học ${S.name} cùng Quang… (90 phút)`, UI._fast ? 10 : 2000, S.color); } }, { say: [0, 'Xong! Về làm thêm bài tập nhé, mai tớ kiểm tra đó.'] }] });
  const W = wk(G.day); (G.qg.tutWk = G.qg.tutWk || {})[W] = (G.qg.tutWk[W] || 0) + 1;
  advanceTime(QG.lesson); useStam(TUTOR.stam); addStat(s, TUTOR.pts + (s === 'toan' ? QG.toanBonus : 0));
  const k = semKey(G.day) || 'x', T = ((G.tutor = G.tutor || {})[k] = G.tutor[k] || {}); T[s] = (T[s] || 0) + 1;
  if (typeof hsgNoteStudy === 'function') hsgNoteStudy(s, 'tutor');
  addFriend('quang', 3); bondAdd(4);
  if (home && G.qg.inv && G.qg.inv.kind === 'tutor') G.qg.inv = null;
  RT.lock = false; UI.hud();
  UI.toast(`Học ${S.name} cùng Quang xong (+${TUTOR.pts + (s === 'toan' ? QG.toanBonus : 0)} điểm môn, như một buổi học thêm). Tuần này còn ${qgTutLeft()} buổi.`, 'good');
}

/* ---------- hằng ngày ---------- */
function qgNewDay() {
  const Q = G.qg, c = cal(G.day), msg = t => { if (hasNum('quang')) inbox('quang', t); };
  if (Q.inv && Q.inv.day < G.day) { const k = Q.inv.kind; Q.inv = null; if (k === 'qconfess') qgConfessVy(false); if (k === 'dinner') { bondAdd(-8, 'không tới bữa cơm nhà Quang'); msg('Hôm qua mẹ tớ nấu cả mâm chờ cậu… Thôi, bữa khác nhé.'); } if (k === 'tutor') bondAdd(-4); }
  if (!Q.inv && isPartner('quang') && hearts('quang') >= 6 && !qgF('dinner') && c.dow === 4) { Q.inv = { kind: 'dinner', day: G.day + 1, from: 1050, to: 1170 }; msg('Tối mai (thứ 7) 17:30–19:30 qua nhà tớ ăn cơm nhé! Mẹ tớ bảo muốn gặp cậu. Nhà tớ ở cuối phố Bờ Đông, cạnh chợ.'); }
  // giải Nhất Toán quốc gia của Quang (mùa Thu từ lớp 11, sau buổi chào cờ trao giải)
  const y = c.year;
  if (y >= 1 && Q.natPrize !== y && c.season === 0 && G.day >= hsgPlan(y - 1).cer) {
    Q.natPrize = y;
    if (RT.morning) RT.morning.push('Bảng tin trường: lớp trưởng Quang (10A1) đoạt <b>giải Nhất Toán</b> kỳ thi học sinh giỏi quốc gia! Gặp Quang để chúc mừng nhé.');
  }
  if (!isPartner('quang') || !lovePerks()) return;
  const tmr = (G.tests || []).find(t => !t.done && t.day === G.day + 1);
  if (tmr) msg(`Mai kiểm tra ${SUBJ[tmr.subj].name} đó. Tối nay muốn tớ qua kèm không? Nhắn tớ nhé (gặp tớ rồi hẹn).`);
  const H = typeof hsgCur === 'function' && hsgCur(), hk = H && hsgToday(H);
  if (hk) msg('Hôm nay có buổi đội tuyển HSG đó, nhớ mang sách và tới sớm nha!');
}
// gặp Quang: sự kiện chương
async function qgTalkHook(where) {
  const Q = G.qg, h = hearts('quang'), sch = where === 'school' || where === 'class';
  if (Q.ch === 0 && sch && G.day >= 1) { await qgCh1(); return true; }
  if (Q.ch === 1 && h >= 1 && where === 'market') { await qgCh2(); return true; }
  if (Q.ch === 2 && h >= 2 && sch && qgMathGood() && (freeTime() || yardTime())) { await qgCh3(); return true; }
  if (Q.ch === 3 && h >= 3 && (G.grade >= 11 || cal(G.day).season >= 2) && where !== 'market') { await qgCh4(); return true; }
  if (Q.ch === 4 && h >= 4 && !Q.inv) { if (isPartner('vy')) { if (where === 'field') { await qgCh5A(); return true; } } else { await qgCh5B(); return true; } }
  if (Q.ch === 5 && ['declined', 'blessed'].includes(Q.vy) && !Q.vyCouple && !G.love && h >= 5 && where === 'market' && cal(G.day).dow === 6 && G.time >= 840) { await qgLastMarket(); return true; }
  if (Q.ch === 6 && qgCanDate() && !G.love && !qgF('qconf') && G.day - (Q.flags.lastMarket - 1) >= 3) { await qgConfessSelf(); return true; }
  if (isPartner('quang') && h >= 8 && !qgF('cup') && sch) { await qgCup(); return true; }
  return false;
}
// tới quán trà sữa đúng giờ hẹn → xem cảnh Quang tỏ tình với Vy
function qgTick() {
  const Q = G.qg; if (!Q || !Q.inv || RT.lock || RT.scene || UI.isOpen()) return false;
  if (Q.inv.kind === 'tutor' && Q.inv.day === G.day && G.time >= Q.inv.from && !Q.inv.told) { Q.inv.told = true; UI.toast(G.map === 'home' ? 'Quang tới rồi! Cậu ấy đang chờ ở bàn học.' : 'Quang đã tới nhà bạn, đang chờ ở bàn học (19:00–21:30).', 'info'); }
  if (Q.inv.kind === 'qconfess' && Q.inv.day === G.day && G.map === 'pho' && inWin(G.time, Q.inv.from, Q.inv.to) && Math.hypot(G.x - Q.inv.x, G.y - Q.inv.y) < 60) { Q.inv = null; qgConfessVy(true); return true; }
  return false;
}
// bấm chuông nhà Quang
function qgHouseHook() {
  const Q = G.qg;
  if (Q.inv && Q.inv.kind === 'dinner' && Q.inv.day === G.day && inWin(G.time, Q.inv.from, Q.inv.to)) { Q.inv = null; qgDinner(); return true; }
  return false;
}
// lời thoại thường ngày
const QG_TALK = [
  ['“Lịch tuần này: thứ 3 kiểm tra 15 phút Toán, thứ 5 trực nhật tổ 2. Nhớ nha!”', '“Có bài nào khó cứ hỏi tớ, lớp trưởng phục vụ 24/7.”', '“Ra chơi đấu thẻ không?”'],
  ['“Hôm qua tớ bóc được thẻ hiếm, tiền đạo cánh tốc độ 9! Ghen tị chưa?”', '“Chợ Bờ Đông sáng chủ nhật đông vui lắm, ra chơi đi.”', '“Tối tớ phụ mẹ tính sổ, toàn số lẻ, mỏi tay ghê.”'],
  ['“Bố tớ làm ca đêm tuần này, sáng về là ngủ tới trưa luôn.”', '“Mẹ tớ mà tính nhẩm thì tớ cũng chịu thua đấy.”', '“Cậu thấy tớ có nên thi chuyên Toán không nhỉ?”'],
  ['“Cậu là người đầu tiên tớ kể chuyện nhà mình nhiều vậy đó.”', '“Đôi khi tớ mệt vì lúc nào cũng phải đứng nhất…”', '“Hội khoẻ Phù Đổng năm nay lớp mình phải lấy cúp!”'],
  ['“Có cậu làm đối thủ, học Toán vui hơn hẳn.”', '“Tớ hay nghĩ linh tinh về sau này lắm. Kể cậu nghe nha?”', '“Cảm ơn cậu đã lắng nghe tớ.”'],
  ['“Lạ thật, ở cạnh cậu tớ chẳng cần tỏ ra giỏi giang gì cả.”', '“Cậu nghĩ… hai người hợp nhau thì có cần giống nhau không?”'],
];
function qgLoveLine() {
  const h = hearts('quang'), c = loveCool();
  if (c >= 3) return pick(['“Dạo này tớ bận ôn đội tuyển với phụ mẹ, chắc ít đi chơi được.” (cậu ấy cười, nhưng cuộc nói chuyện ngắn hẳn)', '“Ừ, cũng ổn. Thôi tớ ra chợ đây.”']);
  if (c >= 1) return pick(['“Hôm nay lại bận hả? Không sao không sao, tớ quen rồi, hì.” (cậu ấy cố nói đùa)', '“Tớ đặt lịch rồi đó nha, lần này cậu đừng quên nữa!”']);
  if (h >= 8) return pick(['“Hai ngôi sao của Hoa Phượng phải cùng nhau tốt nghiệp chứ nhỉ!”', '“Tớ quyết rồi: học thứ gì kết hợp được Toán với kinh doanh. Cậu thấy sao?”']);
  if (h >= 7) return pick(['“Mẹ tớ hỏi bao giờ cậu ra chợ phụ tiếp, bà quý cậu hơn cả tớ rồi.”', '“Bố tớ bảo cậu đá bóng hay hơn tớ. Không chịu đâu!”']);
  return pick(['“Hẹn hò mà vẫn thách đấu Toán được không? Được chứ!”', '“Tối nay qua tớ kèm học nhé? Cậu học xong tớ khao chè.”', '“Ê, cậu cười trông ngốc ghê… nhưng tớ thích.”']);
}
async function qgChat() {
  if (isPartner('vy') && loveCool() >= 2) return qgAsk('“Cậu với Vy giận nhau hả? Tớ không đứng về bên nào đâu, nhưng hai cậu nên nói chuyện trực tiếp với nhau. Vy ngoài lạnh trong ấm lắm.”', ['Ừ, cảm ơn cậu']);
  return qgAsk(isPartner('quang') ? qgLoveLine() : pick(QG_TALK[Math.min(5, hearts('quang'))]), ['…']);
}
// menu nói chuyện với Quang
function qgTalkOpts(add, where) {
  const Q = G.qg, dating = isPartner('quang') && lovePerks();         // giai đoạn nguội lạnh 3: tạm khoá quyền lợi người yêu
  if (where === 'market' && Q.ch >= 2 && !G.daily.qgHelp) add('qghelp', 'Phụ bán hàng cùng Quang');
  if (where === 'market') add('qgstall', 'Mua hàng ở sạp cô Lan');
  if (where === 'field' && !G.daily.qgBall) add('qgball', 'Đá bóng cùng Quang');
  if (!dating && hearts('quang') >= 2 && Q.mathWk !== wk(G.day)) add('qgmath', 'Nhờ Quang giảng bài Toán');
  if (hearts('quang') >= 4 && Q.swapWk !== wk(G.day) && Object.values(G.cards).some(n => n > 1)) add('qgswap', 'Đổi thẻ cầu thủ trùng');
  if (dating && qgTutLeft() > 0 && G.time < 1140 && !(Q.inv && Q.inv.kind === 'tutor')) add('qgtutor', 'Hẹn Quang tối nay qua nhà kèm học');
  if (dating && where === 'in' && G.visit === 'quang' && qgTutLeft() > 0) add('qgstudy', 'Học chung với Quang');
  if (Q.natPrize === cal(G.day).year && Q.congrats !== Q.natPrize) add('qgcongrats', 'Chúc mừng Quang đoạt giải Toán quốc gia');
}
async function qgTalkDo(c) {
  const Q = G.qg;
  if (c === 'qghelp') { await qgHelpStall(); return true; }
  if (c === 'qgstall') { ACT.qgStall(); return true; }
  if (c === 'qgball') { G.daily.qgBall = true; await activity('Đá bóng cùng Quang ở sân công viên…', 45, () => { useStam(8, true); addStat('thethao', 3); addFriend('quang', 3); if (isPartner('quang')) bondAdd(4); }); return true; }
  if (c === 'qgmath') { Q.mathWk = wk(G.day); await activity('Quang giảng bài Toán cho bạn…', 25, () => { addStat('toan', 4); addFriend('quang', 2); }); return true; }
  if (c === 'qgswap') {
    Q.swapWk = wk(G.day);
    const dup = Object.keys(G.cards).filter(id => G.cards[id] > 1).sort((a, b) => CARD_BY_ID[b].r - CARD_BY_ID[a].r)[0], C = CARD_BY_ID[dup];
    const pool = CARDS.filter(x => x.r === C.r && !G.cards[x.id]), got = pool.length ? pick(pool) : pick(CARDS.filter(x => x.r === C.r && x.id !== dup));
    G.cards[dup]--; G.cards[got.id] = (G.cards[got.id] || 0) + 1; addFriend('quang', 2);
    await qgAsk(`“Đổi ${C.name} lấy ${got.name} nhé! Thẻ trùng để làm gì, đổi cho nhau mới vui.”`, ['Chốt!']); return true;
  }
  if (c === 'qgtutor') { Q.inv = { kind: 'tutor', day: G.day, from: 1140, to: 1290, place: 'myhome' }; await qgAsk('“Ok! 19:00 tớ qua nhà cậu, nhớ dọn bàn học đấy. Mang theo sách môn cần học nha.”', ['Tớ chờ']); return true; }
  if (c === 'qgstudy') { await qgLesson('fhome'); return true; }
  if (c === 'qgcongrats') { Q.congrats = Q.natPrize; addFriend('quang', 5); await qgAsk('“Cảm ơn cậu! Giải Toán quốc gia đó. Năm sau cậu cũng thi đi, mình cùng lên bục.”', ['Chúc mừng lớp trưởng!']); return true; }
  return false;
}

/* ---------- chương 7: tốt nghiệp ---------- */
function qgEnding() {
  const h = hearts('quang');
  if (isPartner('quang') && h >= 7) return 'true';
  if (G.qg.vyCouple) return 'alt';
  if (G.exLove && G.exLove.fid === 'quang') return 'break';
  if (h >= 4) return 'friend';
  return null;
}
const QG_END = {
  true: ['Hai ngôi sao của Hoa Phượng', 'Tớ chọn ngành kết hợp Toán với kinh doanh rồi. Chặng đường mới, mình vẫn đi cùng nhau nhé — hai ngôi sao của Hoa Phượng!'],
  friend: ['Đối thủ truyền kiếp', 'Ba năm làm lớp trưởng, người tớ muốn thắng nhất luôn là cậu. Tặng cậu lá thẻ quý nhất của tớ — hẹn một ngày tái đấu!'],
  alt: ['Người bạn năm ấy', 'Cảm ơn cậu đã làm quân sư cho tớ năm lớp 11. Tớ với Vy sẽ cố gắng cùng nhau. Mãi là bạn thân nhé!'],
  break: ['Mỗi người một hành trình', 'Mình từng là một đôi, giờ mỗi người một hành trình. Tớ vẫn tôn trọng cậu và chúc cậu thật nhiều thành công.'],
};
async function qgGraduation() {
  const e = qgEnding(); if (!e) return;
  const [name, note] = QG_END[e]; G.qg.note = note; G.qg.ending = e;
  const dating = e === 'true';
  if (dating) await playCut({ map: 'cho', me: [QG.me[0] + 4, QG.me[1] + 26, 3], cam: { x: 230, y: 130 }, title: `Chương 7 · ${name}`, hide: ['qg_mk', 'mk_mk_kho'], actors: [qgA(QG.me[0], QG.me[1], 0), { look: 'quangMom', x: QG.stall[0], y: QG.stall[1], dir: 0 }],
    steps: [{ say: [1, 'Hai đứa tốt nghiệp rồi! Cô mừng quá, tối nay cô làm cả mâm chè.'] }, { say: [0, 'Ở chợ này tớ học được nhiều hơn cả ở lớp. Và gặp được cậu.'] }] });
  await playCut({ map: 'school', me: [330, 300, 2], cam: { x: 350, y: 280 }, title: `Chương 7 · Người giỏi nhất không nhất thiết phải đứng nhất — ${name}`, actors: [qgA(354, 300, 1)],
    steps: [{ say: [0, 'Ba năm rồi. Hồi đầu tớ cứ nghĩ đứng nhất là quan trọng nhất.'] }, { say: [0, 'Giờ tớ hiểu, giá trị của mình còn ở những người đã đi cùng mình.'] }, { say: [0, note] }] });
  if (e === 'friend') { const rare = CARDS.filter(c => c.r >= 2).sort(() => Math.random() - 0.5)[0]; if (rare) G.cards[rare.id] = (G.cards[rare.id] || 0) + 1; }
  addMemo('scene', 'qg_grad');
}
