'use strict';
/* ============================================================
 *  04x. TÌNH CẢM
 *  - Mọi nhân vật tối đa 5 tim (100 điểm thân thiết, 20 điểm mỗi tim).
 *  - NPC chính hẹn hò được (DATABLE: Vy, Thái, Ngân): đủ 5 tim thì tặng BÓ HOA OẢI HƯƠNG (mua ở cửa hàng hoa) để ngỏ lời.
 *    Nhận lời → đang hẹn hò, mở thêm tim 6–8 (tới 160 điểm). Mỗi lúc chỉ hẹn hò một người. Vy cần đi hết chương 5 mới nhận lời
 *    (cô ấy muốn hiểu người kia trước), tim 7 và 8 của Vy còn cần sự kiện tương ứng (04y_vy.js).
 *  - ĐỘ GẮN KẾT (ẩn, 0–100) của người yêu: trò chuyện, giữ hẹn thì tăng; lâu không gặp, lỡ hẹn, bỏ lỡ sự kiện đã hứa thì giảm.
 *    Bận thi học kỳ / sự kiện bắt buộc của trường thì không bị trừ. Gắn kết thấp → nhánh NGUỘI LẠNH 4 giai đoạn:
 *    1 tin nhắn thưa dần · 2 lần đầu giận nhau (cảnh tranh luận, có lựa chọn) · 3 khoảng cách (tạm khoá quyền lợi hẹn hò,
 *    người kia hẹn "một lần nói chuyện thật lòng" — nói chuyện tốt thì sang ĐANG HÀN GẮN) · 4 lời chia tay ở ghế đá công viên.
 *    Chia tay: đóng quyền lợi hẹn hò, giữ kỷ niệm, quay về tối đa 5 tim; tặng quà không làm người kia đổi ý.
 * ============================================================ */
const DATABLE = ['vy', 'dat', 'ngan'];
const LOVE = { flower: 'oaihuong', bond0: 72, idleDays: 4, idleLoss: 3, chat: 2, meetKept: 8, meetMissed: -8, missEvent: -15, cool: [55, 40, 25, 12], mendDays: 8, breakDays: 4 };
const isPartner = fid => !!(G && G.love && G.love.fid === fid);
const heartMax = id => (isPartner(id) ? 8 : 5);
const friendCap = id => (!isPartner(id) ? 100 : id === 'vy' ? vyLoveCap() : id === 'quang' ? qgLoveCap() : 160);
const loveCool = () => (G && G.love ? G.love.cool || 0 : 0);
const lovePerks = () => !!G.love && loveCool() < 2;                       // quyền lợi hẹn hò còn mở (giai đoạn 1 vẫn mở)
const busyLove = () => schoolEventsOn(G.day).length > 0 || (G.tests || []).some(t => t.type === 'thi' && Math.abs(t.day - G.day) <= 1);   // đang thi / sự kiện trường: không bị trừ
function bondAdd(n, why) {
  if (!G.love) return;
  if (n > 0 && G.love.mend >= G.day) n = Math.ceil(n * 1.5);                // đang hàn gắn: cố gắng được ghi nhận nhiều hơn
  G.love.bond = clamp(G.love.bond + n, 0, 100);
  if (n > 0) G.love.last = G.day;
  if (why && Math.abs(n) >= 8) UI.toast(`${n > 0 ? '♥' : '💔'} ${FRIENDS[G.love.fid].name}: ${why}`, n > 0 ? 'good' : 'bad');
}
const LOVE_MSG = {
  cool1: { vy: 'Dạo này cậu bận lắm à? Hình như lâu rồi chúng mình chưa có buổi đi chơi nào tử tế.', dat: 'Dạo này cậu bận gì mà mất tích vậy? Hẹn đi chơi mãi chẳng thấy đâu.', ngan: 'Bận gì mà chẳng thấy nhắn chị vậy? Tuần này đi chơi bù đi nha.' },
  cool3: { vy: 'Tớ nghĩ thời gian này chúng mình nên tập trung vào chuyện của mỗi người một chút.', dat: 'Chắc dạo này tụi mình nên để cho nhau chút không gian.', ngan: 'Chị nghĩ tụi mình nên tạm tập trung việc riêng một thời gian.' },
  mend: { vy: 'Chiều nay sau giờ học cậu ra ghế đá công viên được không? Tớ muốn nói chuyện thật lòng với cậu.', dat: 'Chiều nay ra ghế đá công viên nói chuyện chút nhé.', ngan: 'Chiều nay gặp chị ở ghế đá công viên nhé, mình nói chuyện.' },
  bye: { vy: 'Mai sau giờ học cậu ra ghế đá công viên nhé. Tớ có chuyện muốn nói.', dat: 'Mai ra ghế đá công viên nhé, có chuyện muốn nói.', ngan: 'Mai ra ghế đá công viên gặp chị nhé.' },
};
// Quang giấu cảm xúc bằng sự vui vẻ và bận rộn (04z_quang.js)
Object.assign(LOVE_MSG.cool1, { quang: 'Dạo này tớ bận ôn đội tuyển với phụ mẹ quá, hì. Cuối tuần mình đi đâu đó nhé, lần này tớ không trễ hẹn đâu!' });
Object.assign(LOVE_MSG.cool3, { quang: 'Chắc thời gian này tớ phải tập trung cho đội tuyển với cửa hàng của mẹ. Cậu cũng lo việc của cậu nhé.' });
Object.assign(LOVE_MSG.mend, { quang: 'Chiều nay ra ghế đá công viên được không? Lần này tớ không đùa nữa, tớ muốn nói chuyện nghiêm túc.' });
Object.assign(LOVE_MSG.bye, { quang: 'Mai sau giờ học ra ghế đá công viên nhé. Tớ nghĩ… hai đứa mình cần nói chuyện.' });
const loveLine = (k, fid) => LOVE_MSG[k][fid] || LOVE_MSG[k].vy;

/* ---------- hoa oải hương: ngỏ lời hẹn hò ---------- */
async function confess(fid) {
  const F = FRIENDS[fid], who = { look: fid, outfit: friendOutfit(fid) }, flower = LOVE.flower;
  const say = t => UI.ask(F.name, `<p>${t}</p>`, ['…'], { who });
  if (!DATABLE.includes(fid)) return say(`“Hả? Hoa oải hương cho tớ á? Tụi mình là bạn thân mà, tặng nhầm người rồi đó ngốc!” — ${F.name} cười phá lên.`);
  if (isPartner(fid)) { gTake(flower); addFriend(fid, 4); bondAdd(6); return say('“Tụi mình đang hẹn hò rồi mà… nhưng mà cảm ơn nha. Thơm quá đi.”'); }
  if (G.love) return say(`“Cậu đang hẹn hò với ${FRIENDS[G.love.fid].name} mà? Đừng đùa kiểu đó.”`);
  if (G.exLove && G.exLove.fid === fid && G.day - G.exLove.day < 30) return say('“Chuyện của tụi mình… mới qua chưa lâu. Để thời gian trả lời đã nhé.”');
  if (hearts(fid) < 5) return say(`“Hoa đẹp quá… nhưng mà, tụi mình mới quen nhau thôi mà.” — ${F.name} đỏ mặt trả lại bó hoa.`);
  if (fid === 'vy' && G.qg && G.qg.vyCouple) return say('“Cảm ơn cậu… nhưng tớ đang hẹn hò với Quang rồi mà. Mình vẫn là bạn tốt nhé.” — Vy khẽ cười, đưa lại bó hoa.');
  if (fid === 'quang' && !qgCanDate()) return say(qgNoDateLine());
  if (fid === 'vy' && !vyCanDate()) return say(G.vy.flags.friend ? '“Tớ cứ nghĩ… tụi mình đã chọn làm bạn tốt rồi. Cho tớ suy nghĩ thêm nhé.” — Vy ôm bó hoa một lúc rồi đưa lại cho cậu.' : '“Hoa oải hương… tớ biết ý nghĩa của nó.” Vy cúi đầu: “Nhưng tớ còn chưa biết phải trả lời cậu thế nào. Cho tớ thêm thời gian nhé.”');
  RT.lock = true;
  gTake(flower);
  if (fid === 'vy') await vyConfessCut(); else if (fid === 'quang') await qgConfessCut(); else await genericConfess(fid);
  G.love = { fid, since: G.day, bond: LOVE.bond0, last: G.day, cool: 0, coolDay: 0, mend: 0, argued: 0, inv: null };
  if (fid === 'vy') { G.vy.romance = 'dating'; G.vy.flags.dated = true; }
  if (fid === 'quang') { qgSet('qconf'); addMemo('scene', 'qg_date'); }
  addFriend(fid, 6, true); addMemo('scene', 'henho');
  RT.lock = false; UI._hb = null; UI.hud();
  UI.toast(`${F.name} đã nhận lời! Hai người chính thức hẹn hò — mở thêm tim 6–8.`, 'good');
}
async function genericConfess(fid) {
  const F = FRIENDS[fid], who = { look: fid, outfit: friendOutfit(fid) };
  await UI.ask(F.name, `<p>Bạn chìa bó hoa oải hương ra, tim đập thình thịch: “${F.name} ơi… tớ thích cậu. Mình hẹn hò nhé?”</p>`, ['…'], { who });
  await UI.ask(F.name, `<p>${F.name} sững người mất mấy giây, rồi bật cười, má đỏ ửng: “Đồ ngốc… sao giờ mới nói. Ừ, đồng ý!”</p>`, ['♥'], { who });
}

/* ---------- mỗi ngày: gắn kết giảm khi lâu không gặp, các giai đoạn nguội lạnh ---------- */
function loveNewDay() {
  if (typeof vyNewDay === 'function') vyNewDay();
  if (typeof qgNewDay === 'function') qgNewDay();
  const L = G.love; if (!L) return;
  const fid = L.fid, idle = G.day - (L.last || L.since);
  if (idle > LOVE.idleDays && !busyLove()) L.bond = clamp(L.bond - LOVE.idleLoss, 0, 100);
  if (L.mend && L.mend < G.day && L.cool === 0) { L.mend = 0; L.mended = true; }
  const msg = t => { if (hasNum(fid)) inbox(fid, t); };
  if (L.cool === 0 && L.bond < LOVE.cool[0] && !(L.mend >= G.day)) { L.cool = 1; L.coolDay = G.day; msg(loveLine('cool1', fid)); }
  else if (L.cool >= 1 && L.bond >= 65) { L.cool = 0; }
  else if (L.cool === 1 && L.bond < LOVE.cool[1]) { L.cool = 2; L.coolDay = G.day; }                 // lần tới gặp: cảnh tranh luận
  else if (L.cool === 2 && L.bond < LOVE.cool[2]) { L.cool = 3; L.coolDay = G.day; msg(loveLine('cool3', fid)); }
  if (L.cool === 3 && !L.inv && G.day - L.coolDay >= 2 && L.bond >= LOVE.cool[3]) { L.inv = { kind: 'mend', day: G.day }; msg(loveLine('mend', fid)); }
  if (L.cool === 3 && !L.inv && L.bond < LOVE.cool[3] && G.day - L.coolDay >= LOVE.breakDays) { L.inv = { kind: 'bye', day: G.day + 1 }; msg(loveLine('bye', fid)); }
  if (L.inv && G.day > L.inv.day + (L.inv.kind === 'bye' ? 1 : 0)) {                                   // lỡ cuộc hẹn nói chuyện
    if (L.inv.kind === 'mend') { L.inv = null; bondAdd(-10); }
    else { breakUp(true); }
  }
}
// gặp người yêu ở ghế đá công viên theo lời hẹn (nói chuyện thật lòng / chia tay)
const BENCH = { x: 334, y: 336 };
function loveTick() {
  if (typeof vyTick === 'function' && vyTick()) return true;
  if (typeof qgTick === 'function' && qgTick()) return true;
  const L = G.love; if (!L || !L.inv || RT.lock || RT.scene || UI.isOpen()) return false;
  if (G.day !== L.inv.day || G.map !== 'town' || !inWin(G.time, freeTime() ? Math.max(schoolEndT(), 840) : 1440, 1290)) return false;
  if (Math.hypot(G.x - BENCH.x, G.y - BENCH.y) > 46) return false;
  const k = L.inv.kind; L.inv = null;
  if (k === 'mend') mendTalk(); else breakUp(false);
  return true;
}
const benchCut = (fid, steps, title) => playCut({ map: 'town', me: [BENCH.x - 12, BENCH.y + 6, 2], cam: { x: BENCH.x, y: BENCH.y - 10 }, title, actors: [{ look: fid, outfit: friendOutfit(fid), x: BENCH.x + 12, y: BENCH.y + 6, dir: 1 }], hide: ['p_' + fid], steps });
// cảnh tranh luận (giai đoạn 2): bật lên khi nói chuyện với người yêu
async function loveArgue() {
  const L = G.love, fid = L.fid, F = FRIENDS[fid], who = { look: fid, outfit: friendOutfit(fid) };
  L.argued = G.day; RT.lock = true;
  const c = await UI.ask(F.name, `<p>${fid === 'quang' ? 'Quang gãi đầu, cười gượng một lúc rồi mới nói: “Tớ biết ai cũng có việc riêng. Nhưng nếu hôm nào bận, cậu cứ nói trước với tớ nhé. Tớ cũng phải sắp xếp thời gian ở chợ với lịch đội tuyển nữa.”' : fid === 'vy' ? 'Vy nhìn xuống, giọng nhỏ lại: “Không có gì đâu…” Một lúc sau cô mới nói tiếp: “Thật ra… tớ buồn. Mấy lần mình hẹn rồi cậu quên mất. Tớ cứ tưởng chỉ mình tớ để ý.”' : `${F.name} khoanh tay: “Mấy lần hẹn rồi lại quên. Cậu có còn để ý tới tớ không vậy?”`}</p>`,
    ['Xin lỗi, là lỗi của tớ. Từ giờ tớ sẽ báo trước nếu không giữ hẹn được', 'Dạo này tớ bận học thật mà… nhưng tớ hiểu cậu buồn', 'Có gì đâu mà giận dữ vậy'], { who });
  if (c === 0) { bondAdd(15, 'cùng giải quyết mâu thuẫn'); if (fid === 'vy') G.vy.trust += 6; await UI.ask(F.name, '<p>“…Ừ. Cảm ơn vì đã nói thật. Tớ cũng sẽ nói ra khi buồn, không giấu nữa.”</p>', ['♥'], { who }); }
  else if (c === 1) { bondAdd(6); await UI.ask(F.name, '<p>“Tớ biết cậu bận. Chỉ là… lần sau nhắn tớ một câu thôi cũng được.”</p>', ['Ừ'], { who }); }
  else { bondAdd(-12, 'trả lời thiếu tôn trọng'); if (fid === 'vy') G.vy.trust -= 8; await UI.ask(F.name, '<p>Không khí lặng đi. “Vậy à… Tớ về trước đây.”</p>', ['…'], { who }); }
  if (G.love && G.love.bond >= LOVE.cool[1]) G.love.cool = 1;
  RT.lock = false; UI.hud();
}
// "Một lần nói chuyện thật lòng" (giai đoạn 3 → hàn gắn)
async function mendTalk() {
  const L = G.love, fid = L.fid, F = FRIENDS[fid], who = { look: fid, outfit: friendOutfit(fid) };
  RT.lock = true;
  let good = 0;
  await benchCut(fid, [{ say: [0, fid === 'vy' ? 'Cậu đến rồi… Tớ cứ sợ cậu lại quên.' : fid === 'quang' ? 'Cậu đến rồi. Hôm nay tớ không pha trò đâu, hứa đấy.' : 'Tới rồi hả. Ngồi đi.'] }, { say: ['me', 'Tớ đến rồi đây. Mình nói chuyện nhé.'] }], 'Một lần nói chuyện thật lòng');
  const q = [
    [`${F.name}: “Dạo này tụi mình cứ như hai người xa lạ. Cậu nghĩ sao?”`, ['Tớ muốn nghe cậu nói trước', 'Thì cũng bình thường mà'], 0],
    ['“Mấy lần cậu thất hứa, tớ đã rất buồn.”', ['Tớ thừa nhận, tớ đã không giữ lời. Xin lỗi cậu', 'Tại tớ bận chứ bộ'], 0],
    ['“Cậu có điều gì khó khăn mà chưa kể với tớ không?”', ['Thật ra dạo này tớ áp lực chuyện học lắm…', 'Không, chẳng có gì'], 0],
  ];
  for (const [t, opts, ok] of q) { const c = await UI.ask(F.name, `<p>${t}</p>`, opts, { who }); if (c === ok) good++; }
  if (good >= 2) {
    L.cool = 0; L.bond = Math.max(L.bond, 52); L.mend = G.day + LOVE.mendDays; if (fid === 'vy') { G.vy.trust += 10; G.vy.flags.mended = true; }
    await UI.ask(F.name, `<p>“Vậy… mình thử lại nhé. Gặp nhau khi cả hai rảnh, không giữ được hẹn thì nói trước, và quan tâm tới việc của nhau.” ${F.name} khẽ cười.</p><p class="dim">Trạng thái: <b>Đang hàn gắn</b> — ${LOVE.mendDays} ngày tới cố gắng đều đặn thì mọi chuyện sẽ ổn.</p>`, ['Hứa nhé'], { who });
  } else {
    bondAdd(-5);
    await UI.ask(F.name, '<p>“Tớ nghĩ… cậu vẫn chưa sẵn sàng nói chuyện thật lòng. Tớ về đây.”</p>', ['…'], { who });
  }
  RT.lock = false; UI.hud();
}
// chia tay (atBench: gặp ở ghế đá; không thì qua tin nhắn)
async function breakUp(byMsg) {
  const L = G.love; if (!L) return;
  const fid = L.fid, F = FRIENDS[fid], line = fid === 'quang' ? 'Tớ nghĩ hai đứa đều đã cố gắng. Nhưng có lẽ bây giờ chúng mình muốn những điều khác nhau. Tớ vẫn quý cậu, chỉ là tớ không muốn cả hai cứ tiếp tục mà không thật sự vui.' : fid === 'vy' ? 'Tớ vẫn rất trân trọng những ngày chúng mình ở bên nhau. Nhưng gần đây, tớ cảm thấy hai đứa không còn hiểu nhau như trước nữa. Tớ nghĩ chúng mình nên dừng lại.' : 'Tụi mình dừng lại ở đây nhé. Cảm ơn cậu vì quãng thời gian vừa qua.';
  if (byMsg) { if (hasNum(fid)) inbox(fid, line); RT.morning && RT.morning.push(`${F.name} nhắn tin chia tay. Hai người không còn hẹn hò nữa.`); }
  else {
    RT.lock = true;
    await benchCut(fid, [{ say: [0, fid === 'vy' ? 'Cảm ơn cậu đã đến.' : 'Cậu đến rồi.'] }, { wait: 600 }, { say: [0, line] }, { say: ['me', '…'] }, { say: [0, fid === 'quang' ? 'Mai vẫn đấu thẻ với tớ chứ? Đối thủ số một thì không được bỏ cuộc đâu đấy.' : 'Mình vẫn là bạn nhé. Đừng ghét tớ.'] }], 'Lời chia tay');
    RT.lock = false;
  }
  G.exLove = { fid, day: G.day, mended: !!L.mended };
  G.love = null; G.friends[fid] = Math.min(G.friends[fid] || 0, 80);
  if (fid === 'vy') { G.vy.romance = 'ex'; G.vy.flags.brokeUp = true; }
  UI.hud();
}
// giữ hẹn / lỡ hẹn với người yêu (gọi từ hệ thống hẹn đi chơi)
function loveMeet(fid, kept) {
  if (!isPartner(fid)) return;
  if (kept) bondAdd(LOVE.meetKept, 'giữ đúng hẹn đi chơi');
  else if (!busyLove()) { bondAdd(LOVE.meetMissed, 'huỷ hẹn mà không báo trước'); if (fid === 'vy') G.vy.trust -= 3; }
}
// trò chuyện với người yêu: tâm sự (mỗi ngày một lần)
async function loveTalk(fid) {
  const F = FRIENDS[fid], who = { look: fid, outfit: friendOutfit(fid) };
  if (loveCool() === 2 && G.love.argued !== G.day) return loveArgue();
  if (G.daily['lt_' + fid]) return UI.ask(F.name, '<p>“Hôm nay tâm sự đủ rồi, mai kể tiếp nha.”</p>', ['Ừ'], { who });
  G.daily['lt_' + fid] = true;
  bondAdd(loveCool() >= 1 ? 6 : LOVE.chat);
  const L = fid === 'vy' ? vyLoveLine() : fid === 'quang' ? qgLoveLine() : pick([`“Hôm nay ở lớp có chuyện buồn cười lắm, để tớ kể cho nghe…”`, '“Cuối tuần này mình đi đâu chơi nhỉ?”', '“Ở cạnh cậu thấy vui ghê.”']);
  await UI.ask(F.name, `<p>${L}</p>`, ['♥'], { who });
}
