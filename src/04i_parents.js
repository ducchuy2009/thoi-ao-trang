'use strict';
/* ============================================================
 *  04i. VIỆC BỐ MẸ NHỜ · NƠI LÀM VIỆC CỦA BỐ MẸ · NHÀ HÀNG, KARAOKE (phố Bờ Đông)
 *  - Bố mẹ nhắn tin nhờ việc (không bao giờ nhắn trong giờ học): nhận / từ chối ngay trong điện thoại
 *  - Nhận rồi thì vào danh sách nhiệm vụ: tới chỗ lấy đồ (cho vào túi) → cầm lên → bấm vào bố / mẹ để đưa tận tay
 *  - Tới công ty / nhà máy gặp bố mẹ đang làm việc
 * ============================================================ */
const ptActive = () => G.tasks.active.find(t => t.pt);
// Gửi lời nhờ vào đầu mỗi khung giờ (gọi theo từng mốc 10 phút từ socialTick)
function parentPing(t) {
  if (!G || G.daily.ptask || G.phone.ptask || ptActive() || RT.skip) return;
  const S = PARENT_TASK.slots, wd = workDay(), sch = schoolToday();
  let slot = null;
  if (wd && sch && t === S.lunch[0] && G.atSchool) slot = 'lunch';
  else if (wd && sch && t === S.after[0]) slot = 'after';
  else if (wd && !sch && t === S.summer[0]) slot = 'summer';
  else if (!wd && t === S.off[0]) slot = 'off';
  if (!slot || Math.random() >= PARENT_TASK.chance * 2.2 || !(G.daily.taskPlan || []).includes('parent')) return;
  const ids = Object.keys(PARENT_TASKS).filter(id => { const P = PARENT_TASKS[id]; return slot === 'off' ? P.off : !P.off && (slot === 'lunch' || !P.lunch); });
  const id = pick(ids), P = PARENT_TASKS[id];
  if (slot !== 'off' && !atWork(P.who)) return;
  takeTaskSlot('parent'); G.daily.ptask = true;
  G.phone.ptask = { id, who: P.who, day: G.day, until: S[slot][1] };
  inbox(P.who, P.msg + ` (Trước ${fmtTime(S[slot][1])} nhé con.)`);
}
// lời nhờ còn hiệu lực
function ptInvite() {
  const p = G.phone.ptask;
  if (p && (p.day !== G.day || G.time >= p.until)) { G.phone.ptask = null; pushMsg(p.who, false, 'Thôi, bố mẹ tự xoay xở được rồi. Con cứ học bài đi nhé.'); return null; }
  return p;
}
// trả lời trong điện thoại
function parentReply(who, yes) {
  const p = ptInvite(); if (!p || p.who !== who) return;
  G.phone.ptask = null;
  const P = PARENT_TASKS[p.id];
  if (!yes) { pushMsg(who, true, 'Con đang bận một chút, bố mẹ thông cảm cho con nhé.'); pushMsg(who, false, 'Ừ, không sao, để bố mẹ nhờ người khác.'); return; }
  pushMsg(who, true, 'Dạ, con mang tới ngay ạ!'); pushMsg(who, false, 'Ngoan quá! Cảm ơn con nhé.');
  G.tasks.active.push({ uid: ++G.tasks.seq, id: p.id, pt: true, step: 0, exp: G.day, until: p.until, took: G.day });
  UI.toast(`Đã nhận việc “${P.name}”. Xem trong danh sách Nhiệm vụ (cạnh menu).`, 'good'); UI.hud();
}
// bước 1: tới chỗ lấy đồ, cho vào túi
async function pickParentItem(t, T, s) {
  if (taskLate(t)) return UI.say(T.name, `Đã quá giờ hẹn (${taskDeadline(t)}) mất rồi…`);
  if (T.cost && G.money < T.cost) return UI.toast(`Cần ${fmtMoney(T.cost)} để mua — mẹ sẽ gửi lại sau.`, 'bad');
  await activity(`${s.do}…`, 5, () => { if (T.cost) addMoney(-T.cost, true); G.inv[T.item] = 1; t.step = 1; });
  if (t.step !== 1) return;
  UI.toast(`Đã cho ${PARENT_ITEMS[T.item].toLowerCase()} vào túi. Bấm vào món đó ở thanh đồ để cầm lên, rồi tới ${T.where.toLowerCase()} bấm vào ${PNAME[T.who].toLowerCase()} để đưa.`, 'good');
  UI.hud();
}
// bước 2: cầm đồ đưa tận tay bố / mẹ (ở nhà, trong phòng, công ty, nhà máy). Trả về true nếu đã xử lý.
async function parentDeliver(who) {
  const t = G.tasks.active.find(x => x.pt && x.step === 1 && ptDef(x.id).who === who), T = t && ptDef(t.id);
  if (!t || RT.hold !== T.item || !G.inv[T.item]) return false;
  const late = taskLate(t);
  G.tasks.active = G.tasks.active.filter(x => x !== t); G.tasks.done++;
  delete G.inv[T.item]; RT.hold = null;
  const paid = !late && taskPays();
  addParent(late ? 1 : T.aff, '', true);
  if (paid) addWage(`Giúp ${PNAME[who].toLowerCase()}`, T.pay + T.cost);
  else if (T.cost) addMoney(T.cost, true);
  UI.hud();
  const line = late ? 'Hơi muộn rồi con ạ, nhưng bố mẹ vẫn cảm ơn con đã mang tới.' : who === 'dad' ? 'Đúng cái bố cần! Con giỏi quá, tối về bố thưởng cho.' : 'Mẹ cảm ơn con nhé! Không có con chắc mẹ rối tung lên mất.';
  await UI.ask(PNAME[who], `<p>“${line}”</p><p class="dim">+${late ? 1 : T.aff} thiện cảm của bố mẹ${paid ? ` · tiền công ${fmtMoney(T.pay)}${T.cost ? ` + ${fmtMoney(T.cost)} tiền mua đồ` : ''} — nhận vào cuối ngày` : T.cost ? ` · được trả lại ${fmtMoney(T.cost)} tiền mua đồ` : ''}</p>`, ['Dạ!'], { who: { look: who, outfit: who === 'mom' ? 'noapron' : null } });
  return true;
}
// gặp bố mẹ ở chỗ làm
ACT.parentWork = async who => {
  if (RT.lock) return;
  if (await parentDeliver(who)) return;
  const name = PNAME[who], k = 'visit_' + who;
  const line = who === 'dad' ? pick(['Con lên thăm bố à? Bố đang trực ca, con đi xem dây chuyền một vòng rồi về học bài nhé.', 'Kẹo mới ra lò đấy, cầm vài viên mà ăn. Đừng đi gần máy nhé con.', 'Học xong rồi à? Chiều về bố mẹ nấu món con thích.'])
    : pick(['Con qua công ty thăm mẹ à? Mẹ đang dở việc, con ngồi chờ chút rồi về nhé.', 'Đồng nghiệp mẹ khen con ngoan lắm đấy.', 'Đi đường cẩn thận nhé con, nhớ về trước 8 giờ tối.']);
  if (!G.daily[k]) { G.daily[k] = true; addParent(1, '', true); }
  await UI.ask(name, `<p>“${line}”</p>`, ['Dạ!'], { who: { look: who, outfit: who === 'mom' ? 'noapron' : null } });
};

/* ---------- nhà hàng Sen Hồng · karaoke Âm Vang ---------- */
const RESTAURANT = [
  { id: 'pho', name: 'Phở bò', price: 40000, stam: 30, desc: 'Nước dùng trong, thơm quế hồi, bánh phở mềm.' },
  { id: 'buncha', name: 'Bún chả', price: 45000, stam: 32, desc: 'Chả nướng than hoa, nước chấm chua ngọt.' },
  { id: 'comrang', name: 'Cơm rang dưa bò', price: 40000, stam: 34, desc: 'Cơm rang tơi hạt, dưa chua giòn.' },
  { id: 'nemran', name: 'Nem rán', price: 30000, stam: 18, desc: 'Vỏ giòn rụm, chấm nước mắm chua ngọt.' },
];
ACT.restaurant = () => {
  if (RT.lock) return;
  meetSoc('anh_long');
  const fid = G.comp && G.comp.fid;
  UI.store('Nhà hàng Sen Hồng', `“Mời ${fid ? 'hai em' : 'em'} ngồi! Hôm nay ăn gì nào?”${fid ? ' (gọi một món là hai đứa ăn chung)' : ''}`, RESTAURANT.map(f => ({ id: f.id, name: f.name, price: f.price, desc: `${f.desc} Ăn tại chỗ khoảng 30 phút.`, stam: f.stam, mins: 30 })), async f => {
    if (G.money < f.price) return UI.toast('Không đủ tiền.', 'bad');
    addMoney(-f.price, true); UI.close();
    await activity(`Đang ăn ${f.name.toLowerCase()}${fid ? ' cùng ' + FRIENDS[fid].name : ''}…`, 30, () => { gainStam(f.stam); if (fid) addFriend(fid, 4); });
    UI.toast(fid ? `Hai đứa ăn ${f.name.toLowerCase()} no căng bụng!` : `${f.name} ngon tuyệt!`, 'good');
  });
};
const KARAOKE = { price: 60000, mins: 60 };
ACT.karaoke = async () => {
  if (RT.lock) return;
  const fid = G.comp && G.comp.fid, price = fid ? KARAOKE.price / 2 : KARAOKE.price;
  const c = await UI.ask('Karaoke Âm Vang', `<p>“Phòng hát ${fmtMoney(KARAOKE.price)} một tiếng${fid ? ' — hai đứa chia đôi, mỗi người ' + fmtMoney(price) : ''}. Hát bài gì cũng có!”</p><p class="dim">Hát theo nốt nhạc rơi (giống tập hát ở phòng nhạc). Tăng Văn nghệ${fid ? ', thân thiết với ' + FRIENDS[fid].name : ''}.</p>`, ['Thuê phòng hát', 'Thôi'], { who: { look: 'c5', outfit: 'cas_khoa' } });
  if (c !== 0) return;
  if (G.money < price) return UI.toast('Không đủ tiền.', 'bad');
  if (G.stamina < 8) return UI.toast('Mệt quá, không hát nổi.', 'bad');
  addMoney(-price, true); RT.lock = true;
  const r = await sceneSing(1 + Math.min(3, Math.floor(lv('vannghe') / 3)), 'karaoke', 'Hát karaoke');
  advanceTime(KARAOKE.mins); useStam(8, true);
  addStat('vannghe', 3 + Math.round(3 * r.score)); 
  if (fid) addFriend(fid, 5);
  RT.lock = false; UI.hud();
  UI.toast(r.score >= 0.8 ? 'Hát hay như ca sĩ! Màn hình chấm 98 điểm.' : r.score >= 0.5 ? 'Hát cũng ổn, màn hình chấm 85 điểm.' : 'Hơi lạc giọng… nhưng vui là chính!', 'good');
};

// vào nơi làm việc của bố mẹ / nhà hàng / karaoke
const WORKPLACE = { mom: 'congty', dad: 'nhamay' };
ACT.enterWork = async who => {
  if (RT.lock || tetShut(who === 'mom' ? 'Công ty Sen Vàng' : 'Nhà máy bánh kẹo')) return;
  if (!inWin(G.time, 360, 1140)) return UI.say(who === 'mom' ? 'Công ty Sen Vàng' : 'Nhà máy bánh kẹo', 'Đã hết giờ làm việc, cửa đóng rồi.<p class="dim">Mở cửa 06:00–19:00</p>');
  if (G.ride) dismount(true);
  const e = MAPS[WORKPLACE[who]].entry; await goPlace(WORKPLACE[who], e[0], e[1], e[2], 0);
};
ACT.enterDong = async id => {
  if (RT.lock || tetShut(id === 'nhahang' ? 'Nhà hàng Sen Hồng' : 'Karaoke Âm Vang')) return;
  const hours = id === 'nhahang' ? [600, 1320] : [840, 1380];
  if (!inWin(G.time, hours[0], hours[1])) return UI.say(id === 'nhahang' ? 'Nhà hàng Sen Hồng' : 'Karaoke Âm Vang', `Chưa tới giờ mở cửa.<p class="dim">Mở cửa ${fmtTime(hours[0])}–${fmtTime(hours[1])}</p>`);
  if (G.ride) dismount(true);
  const e = MAPS[id].entry; await goPlace(id, e[0], e[1], e[2], 0);
};
