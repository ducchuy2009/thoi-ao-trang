'use strict';
/* ============================================================
 *  04j. NHÓM HỌC SINH TRƯỜNG TRÊN ĐIỆN THOẠI
 *  - Ai cũng tự động được vào nhóm “Học sinh THPT Hoa Phượng” (dòng đầu tiên trong danh bạ điện thoại)
 *  - Ngày đi học, ngoài giờ học: bạn thân và anh chị khoá trên đăng nhờ vả (GROUP_REQS), mọi người nhắn chuyện phiếm
 *  - Bấm “Nhận” ngay trong nhóm → vào danh sách nhiệm vụ → lấy đồ cho vào túi → cầm lên → bấm vào người nhờ để đưa
 *  - Thưởng điểm thân thiết · để lâu không ai nhận thì bạn khác giúp mất · nhận rồi mà quá hạn thì người nhờ hơi buồn
 * ============================================================ */
const grIsFriend = k => !!FRIENDS[k];
// tên, chân dung của một người trong nhóm
function grWho(k) {
  if (FRIENDS[k]) return { name: FRIENDS[k].name, look: k, outfit: typeof friendOutfit === 'function' ? friendOutfit(k) : null };
  if (SOCIETY[k]) return { name: SOCIETY[k].name, look: SOCIETY[k].look, outfit: SOCIETY[k].outfit || null };
  const P = GROUP_PEOPLE[k]; return P ? { name: P[0], look: P[1], outfit: null } : { name: 'Bạn', look: 'c1', outfit: null };
}
const grName = k => grWho(k).name;
const grLow = k => (grIsFriend(k) ? grName(k) : grName(k).replace(/^./, c => c.toLowerCase()));   // “Vy”, “anh Hùng” (giữa câu)
const grReq = uid => G.group.reqs.find(r => r.uid === uid);
const grActive = () => G.tasks.active.filter(t => t.gr);
// hạn chót: hết giờ ra sân sau tan học (ngày học nửa buổi: hết giờ nghỉ trưa) của hôm nay, hoặc của buổi học kế tiếp
const grUntilOf = day => (halfDay(day) ? PM_START : CFG.SCHOOL_END + 40);
function nextSchoolDay(day) { let d = day + 1; while (!isSchoolDay(d) && d < day + 14) d++; return d; }

// Định nghĩa dạng giống việc thầy cô / bố mẹ nhờ: 2 bước (lấy đồ → đưa tận tay người nhờ)
const GR_CACHE = {};
function grDef(id, who) {
  const key = id + ':' + who; if (GR_CACHE[key]) return GR_CACHE[key];
  const Q = GROUP_REQS[id], fr = grIsFriend(who);
  return (GR_CACHE[key] = { gw: who, name: Q.name, desc: Q.msg, mins: 5, win: [300, 1440], aff: fr ? GROUP.aff : GROUP.socAff, item: Q.item, cost: Q.cost || 0, where: `Gặp ${grLow(who)}: ${GROUP_MEET[who]}`,
    steps: [Object.assign({}, Q.pick), { give: who, do: `Cầm ${GROUP_ITEMS[Q.item].replace(/^./, c => c.toLowerCase())} đưa tận tay ${grLow(who)}`, where: `Gặp ${grLow(who)}: ${GROUP_MEET[who]}` }] });
}
const grRewardText = T => (grIsFriend(T.gw) ? `+${T.aff} ♥ thân thiết với ${grName(T.gw)}` : `+${T.aff} quen thân với ${grLow(T.gw)}`) + (T.cost ? ` · được trả lại ${fmtMoney(T.cost)} tiền mua đồ` : '');
function grAff(who, n) { if (grIsFriend(who)) addFriend(who, n, n < 0); else G.soc[who] = clamp((G.soc[who] || 0) + n, 0, 100); }

/* ---------- tin nhắn trong nhóm ---------- */
function grPush(by, t, rq) {
  const a = (G.phone.msgs.group = G.phone.msgs.group || []);
  a.push(rq ? { by, t, rq } : { by, t });
  if (a.length > 40) a.splice(0, a.length - 40);
  if (by !== 'me') G.phone.unread.group = (G.phone.unread.group || 0) + 1;
}
function grPost(by, t, rq, note) {
  grPush(by, t, rq);
  UI.toast(note || `Nhóm ${GROUP.name}: ${grName(by)} vừa nhắn — mở Điện thoại (P) để xem`, 'info');
}
// người nhờ còn ở trường và không giận mình (bạn thân giận vì bị mách thì không nhờ)
const grCanAsk = k => (grIsFriend(k) ? !grudge(k) : true);

// Gọi theo từng mốc 10 phút từ socialTick
function groupTick(t) {
  if (!G || !G.group || RT.skip) return;
  grExpire();
  const sch = schoolToday();
  if (sch && GROUP.slots.includes(t) && t < schoolEndT() && (G.daily.grp || 0) < GROUP.max && Math.random() < GROUP.chance) grNewReq();
  else if (GROUP.chat.includes(t) && Math.random() < GROUP.chatChance * (sch ? 1 : 0.6)) { const [by, line] = pick(GROUP_CHAT); grPost(by, line, null, `Nhóm ${GROUP.name}: ${grName(by)} — “${line.length > 48 ? line.slice(0, 46) + '…' : line}”`); }
}
// đăng một lời nhờ mới
function grNewReq(id, who) {
  const busy = new Set(G.group.reqs.filter(r => r.st === 'open' || r.st === 'mine').map(r => r.id).concat(G.tasks.active.map(t => t.id)));
  const ids = id ? [id] : Object.keys(GROUP_REQS).filter(k => !busy.has(k) && !G.inv[GROUP_REQS[k].item]);
  if (!ids.length) return null;
  const qid = pick(ids), Q = GROUP_REQS[qid], ws = who ? [who] : Q.who.filter(grCanAsk);
  if (!ws.length) return null;
  const w = pick(ws), exp = Q.days ? nextSchoolDay(G.day) : G.day;
  const r = { uid: ++G.group.seq, id: qid, who: w, day: G.day, t: G.time, exp, until: grUntilOf(exp), st: 'open' };
  G.group.reqs.push(r); G.daily.grp = (G.daily.grp || 0) + 1;
  grPost(w, Q.msg, r.uid, `Nhóm ${GROUP.name}: ${grName(w)} nhờ “${Q.name.toLowerCase()}” — mở Điện thoại (P) để nhận giúp`);
  return r;
}
// lời nhờ để lâu không ai nhận → bạn khác nhận mất; quá hạn → đóng
function grExpire() {
  for (const r of G.group.reqs) {
    if (r.st !== 'open') continue;
    const late = G.day > r.exp || (G.day === r.exp && G.time >= r.until), old = G.day > r.day || G.time - r.t >= GROUP.claim;
    if (!late && !old) continue;
    r.st = 'gone';
    const others = Object.keys(GROUP_PEOPLE).concat(Object.keys(FRIENDS), ['a_hung', 'c_mai', 'a_phong', 'c_thao']).filter(k => k !== r.who);
    const by = pick(others);
    if (!late) r.by = by;
    if (!late) grPush(by, pick([`Để mình giúp ${grLow(r.who)} cho!`, `Mình đang ở gần đó, để mình mang qua cho ${grLow(r.who)} nha.`, `Ok để mình lo vụ này 👍`]));
  }
  G.group.reqs = G.group.reqs.filter(r => r.day >= G.day - 3 || r.st === 'mine');
}
// nhận lời nhờ ngay trong nhóm
function groupTake(uid) {
  const r = grReq(uid); grExpire();
  if (!r || r.st !== 'open') return UI.toast('Lời nhờ này đã có người nhận rồi.', 'info');
  if (grActive().length >= GROUP.maxActive) return UI.toast(`Đang nhận ${GROUP.maxActive} việc của các bạn rồi — giúp xong bớt rồi hãy nhận thêm.`, 'bad');
  const T = grDef(r.id, r.who);
  r.st = 'mine';
  G.tasks.active.push({ uid: ++G.tasks.seq, id: r.id, gr: r.uid, who: r.who, step: 0, exp: r.exp, until: r.until, took: G.day });
  grPush('me', pick(['Để mình giúp cho!', 'Mình nhận nha, đợi mình chút!', `Để mình lo cho ${grLow(r.who)} 👌`]));
  grPush(r.who, grIsFriend(r.who) ? pick(['Cảm ơn cậu nhiều nha! 🥰', 'Cứu tinh đây rồi! Cảm ơn cậu!', 'Thương cậu ghê, cảm ơn nha!']) : pick(['Cảm ơn em nhiều nhé!', 'Ok em, cảm ơn em nha!', 'Em nhiệt tình quá, cảm ơn em!']));
  G.phone.unread.group = 0;
  UI.toast(`Đã nhận “${T.name}”. Xem trong danh sách Nhiệm vụ (cạnh menu).`, 'good'); UI.hud();
}
// bước 1: tới chỗ lấy đồ, cho vào túi
async function pickGroupItem(t, T, s) {
  if (taskLate(t)) return UI.say(T.name, `Đã quá giờ hẹn (${taskDeadline(t)}) mất rồi…`);
  if (T.cost && G.money < T.cost) return UI.toast(`Cần ${fmtMoney(T.cost)} để mua — ${grLow(T.gw)} sẽ trả lại sau.`, 'bad');
  await activity(`${s.do}…`, 5, () => { if (T.cost) addMoney(-T.cost, true); G.inv[T.item] = 1; t.step = 1; });
  if (t.step !== 1) return;
  UI.toast(`Đã cho ${GROUP_ITEMS[T.item].replace(/^./, c => c.toLowerCase())} vào túi. Bấm vào món đó ở thanh đồ để cầm lên, rồi bấm vào ${grLow(T.gw)} để đưa (${GROUP_MEET[T.gw]}).`, 'good');
  UI.hud();
}
// bước 2: cầm đồ đưa tận tay người nhờ. Trả về true nếu đã xử lý.
async function groupDeliver(who) {
  const t = G.tasks.active.find(x => x.gr && x.step === 1 && x.who === who), T = t && taskDef(t);
  if (!t || RT.hold !== T.item || !G.inv[T.item]) return false;
  const late = taskLate(t), r = grReq(t.gr), W = grWho(who), fr = grIsFriend(who);
  G.tasks.active = G.tasks.active.filter(x => x !== t); G.tasks.done++;
  delete G.inv[T.item]; RT.hold = null;
  if (r) r.st = 'done';
  grAff(who, late ? GROUP.lateAff : T.aff);
  if (T.cost) addMoney(T.cost, true);
  if (!late) addStat('giaotiep', 1);
  grPush(who, late ? 'Nhận được rồi, hơi muộn chút nhưng vẫn cảm ơn nha.' : pick([`Nhận được rồi! Cảm ơn ${G.name} nhiều nha ❤️`, `${G.name} đáng yêu quá, cảm ơn nhiều!`, `Xong rồi nha mọi người, ${G.name} giúp mình rồi 🙌`]));
  G.phone.unread.group = Math.max(0, (G.phone.unread.group || 0) - 1);
  UI._hb = null; UI.hud();
  const line = late ? (fr ? 'Hơi muộn rồi… nhưng thôi, cảm ơn cậu đã mang tới.' : 'Hơi muộn rồi em ạ, nhưng vẫn cảm ơn em nhé.')
    : fr ? pick(['Đúng cái tớ cần luôn! Cảm ơn cậu nha, hôm nào tớ khao trà sữa.', 'Cậu nhanh ghê! Không có cậu chắc tớ toi rồi.', 'Cảm ơn cậu nhiều nha, cậu tốt bụng nhất lớp!'])
      : pick(['Cảm ơn em nhé! Có gì cần cứ hỏi anh chị.', 'Em nhanh nhẹn ghê, cảm ơn em nhiều!', 'Đúng cái anh chị cần, em giỏi quá!']);
  await UI.ask(W.name, `<p>“${line}”</p><p class="dim">${late ? `+${GROUP.lateAff}` : `+${T.aff}`} ${fr ? '♥ thân thiết' : 'quen thân'}${T.cost ? ` · được trả lại ${fmtMoney(T.cost)}` : ''}${late ? '' : ' · +1 Giao tiếp'}</p>`, ['Không có gì!'], { who: { look: W.look, outfit: W.outfit } });
  return true;
}
// đầu ngày: việc của các bạn đã nhận mà quá hạn
function groupFail(t, T, drop) {
  grAff(T.gw, drop ? -1 : GROUP.failAff);
  if (T.item) { delete G.inv[T.item]; if (RT.hold === T.item) RT.hold = null; }
  const r = grReq(t.gr); if (r) r.st = 'gone';
  if (!drop && RT.morning) RT.morning.push(`Hôm qua không kịp “${T.name.toLowerCase()}” — ${grLow(T.gw)} hơi buồn vì bạn đã nhận mà không làm.`);
}

/* ---------- khung chat của nhóm (trong điện thoại) ---------- */
function groupChatHtml() {
  grExpire();
  const a = (G.phone.msgs.group || []).slice(-12);
  let h = '';
  if (!a.length) h += '<p class="dim">Nhóm chưa có tin nhắn nào. Ngày đi học, các bạn và anh chị khoá trên hay lên đây nhờ vả hoặc nhắn chuyện trường lớp.</p>';
  for (const m of a) {
    if (m.by === 'me') { h += `<div class="msg me"><span>${m.t}</span></div>`; continue; }
    const W = grWho(m.by), r = m.rq && grReq(m.rq);
    let box = '';
    if (m.rq) {
      const T = r && grDef(r.id, r.who);
      if (!r) box = '<em class="gst">Đã xong</em>';
      else {
        const due = `${r.exp === G.day ? 'hôm nay' : dateLabel(r.exp)}, trước ${fmtTime(r.until)}`;
        box = `<div class="greq"><b>${T.name}</b><small>Hạn: ${due} · ${grRewardText(T)}</small>`;
        if (r.st === 'open') box += `<button class="btn sm primary" data-act="grtake" data-id="${r.uid}">Nhận giúp</button>`;
        else box += `<em class="gst ${r.st}">${r.st === 'mine' ? 'Bạn đã nhận — xem danh sách Nhiệm vụ' : r.st === 'done' ? '✓ Bạn đã giúp xong' : (r.by ? `${grName(r.by)} đã nhận giúp` : 'Đã hết hạn')}</em>`;
        box += '</div>';
      }
    }
    h += `<div class="gmsg"><img src="${faceOf(W.look, W.outfit)}" alt=""><div><b>${W.name}</b><span>${m.t}</span>${box}</div></div>`;
  }
  setTimeout(() => { const c = document.querySelector('.gchat'); if (c) c.scrollTop = c.scrollHeight; }, 0);   // cuộn xuống tin mới nhất
  return h;
}
