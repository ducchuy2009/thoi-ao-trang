'use strict';
/* ============================================================
 *  04b. QUẬY & THỰC HÀNH
 *  - Làm việc riêng trong giờ học (bạn rủ ăn vụng, tám chuyện, chơi game, xem video)
 *  - Trốn học / quậy cùng bạn (trà sữa, đá bóng, arcade, thí nghiệm dởm, hút thuốc)
 *  - Buổi thực hành với minigame kiểu câu cá của Stardew Valley
 * ============================================================ */
const resWrap = L => '<ul class="res">' + L.join('') + '</ul>';

/* ---------- làm việc riêng trong giờ ---------- */
// Trả về { delta: thay đổi điểm bài học, lines }
async function classFun() {
  const ev = pick(CLASS_FUN), fid = Math.random() < 0.6 ? 'khoa' : pick(['vy', 'dat']), F = FRIENDS[fid], L = [];
  const c = await UI.ask('Trong giờ học', `<p><b>${F.name}</b> ${ev.text}</p><p class="dim">Tham gia: thân với ${F.name} hơn (+${ev.friend}) nhưng mất tập trung (−2 điểm bài học) và có thể bị cô bắt. Từ chối: tập trung nghe giảng (+1 điểm bài học).</p>`, [`${ev.join} cùng ${F.name}`, 'Từ chối, tập trung học']);
  if (c !== 0) return { delta: 1, lines: [li('Bạn từ chối làm việc riêng, tập trung nghe giảng: +1 điểm bài học.', 'good')] };
  addFriend(fid, ev.friend); G.daily.fun++;
  L.push(li(`${ev.join} cùng ${F.name}: thân thiết +${ev.friend}, mất tập trung.`, 'warn'));
  if (ev.stam) G.stamina = Math.min(maxStam(), G.stamina + ev.stam);
  if (ev.giaotiep) addStat('giaotiep', ev.giaotiep);
  if (Math.random() < ev.risk + 0.05 * G.caughtCycle) L.push(...caughtInClass(ev));
  else L.push(li('Cô không để ý. Trót lọt!', 'dim'));
  return { delta: -2, lines: L };
}
// Bị cô bắt: lỗi nhẹ lần đầu chỉ nhắc nhở; lỗi nặng hoặc tái phạm thì trừ hạnh kiểm và có thể báo phụ huynh
function caughtInClass(ev) {
  const n = ++G.caughtCycle, L = [];
  if (ev.sev === 1 && n === 1) { L.push(li('Bị cô bắt gặp! Lỗi nhẹ, lần đầu nên cô chỉ nhắc nhở.', 'warn')); return L; }
  L.push(li(`Bị cô bắt quả tang${ev.sev === 2 ? ' dùng điện thoại trong giờ' : ''}${n > 1 ? ` — lần thứ ${n} trong kỳ hạnh kiểm này` : ''}.`, 'bad'));
  addConduct(-(n >= 3 ? 1 : 0.5), 'làm việc riêng trong giờ học');
  const pCall = ev.sev === 2 ? (n > 1 ? 0.5 : 0.25) : 0.15;
  if (Math.random() < pCall) { addParent(PARENT.teacherCall, 'cô giáo gọi điện báo phụ huynh'); L.push(li('Cô gọi điện báo về gia đình.', 'bad')); }
  else L.push(li('Cô phê bình trước lớp nhưng không báo phụ huynh.', 'dim'));
  return L;
}

/* ---------- trốn học / quậy cùng bạn ---------- */
const riskWord = M => (M.risk >= 0.33 ? 'cao' : M.risk >= 0.25 ? 'vừa' : 'thấp');
function willMiss(M) { const np = nextPeriod(); return !!(M.leave && np && np.start < G.time + M.mins); }
function mischiefInfo(M) {
  return `<p class="dim">${M.mins} phút${M.cost ? ' · ' + fmtMoney(M.cost) : ''} · thân thiết +${M.friend} · nguy cơ bị phát hiện: ${riskWord(M)}${willMiss(M) ? ' · <b>sẽ bỏ lỡ tiết học</b>' : ''}${M.smoke ? ' · hại sức khoẻ' : ''}</p>`;
}
function canDo(M) { return (!M.cost || G.money >= M.cost) && (!M.stamCost || G.stamina >= M.stamCost); }
function rollInvite() {
  const fid = pick(Object.keys(FRIENDS)), ids = FRIEND_LIKES[fid].filter(id => canDo(MISCHIEF[id]));
  return ids.length ? { fid, id: pick(ids) } : null;
}
async function showInvite(inv) {
  const F = FRIENDS[inv.fid], M = MISCHIEF[inv.id];
  G.daily.invites++;
  const c = await UI.ask(`${F.name} rủ rê`, `<p>${F.name} ghé tai bạn: ${INVITE_TEXT[inv.id]}</p>${mischiefInfo(M)}`, ['Đi luôn!', 'Thôi, tớ không đi']);
  if (c === 0) doMischief(inv.id, inv.fid);
}
async function mischiefMenu(fid) {
  const F = FRIENDS[fid], ids = Object.keys(MISCHIEF);
  const c = await UI.ask(`Rủ ${F.name} đi quậy`, '<p>Càng liều thì càng thân, nhưng bị bắt thì phạt nặng: trừ hạnh kiểm, trừ điểm bài kiểm tra hoặc báo về gia đình.</p>',
    ids.map(id => { const M = MISCHIEF[id]; return `${M.name} · ${M.mins}'${M.cost ? ' · ' + fmtMoney(M.cost) : ''} · rủi ro ${riskWord(M)}${willMiss(M) ? ' · bỏ tiết' : ''}`; }).concat('Thôi'));
  if (c >= 0 && c < ids.length) doMischief(ids[c], fid);
}
async function doMischief(id, fid) {
  const M = MISCHIEF[id], F = FRIENDS[fid], L = [];
  if (M.cost && G.money < M.cost) return UI.toast('Không đủ tiền.', 'bad');
  if (M.stamCost && G.stamina < M.stamCost) return UI.toast('Không đủ thể lực.', 'bad');
  RT.lock = true;
  await UI.fade(true);
  const wasAt = G.atSchool, tt = ttToday();
  RT.skip = { missed: [] };
  if (M.leave) G.atSchool = false;                 // rời trường: tiết nào trôi qua là tiết bị bỏ
  await UI.progress(`${M.verb} với ${F.name}…`, 1400);
  advanceTime(M.mins);
  const skipped = RT.skip.missed.slice(); RT.skip = null;
  if (M.leave && wasAt) { G.atSchool = true; setMap('school', 352, 372, 3); }
  addFriend(fid, M.friend);
  L.push(li(`${M.verb} với ${F.name}: thân thiết +${M.friend}.`, 'good'));
  if (M.cost) addMoney(-M.cost, true);
  if (M.stam) G.stamina = Math.min(maxStam(), G.stamina + M.stam);
  if (M.stamCost) useStam(M.stamCost, !M.smoke);
  for (const k of ['giaotiep', 'thethao', 'th_hoa']) if (M[k]) addStat(k, M[k]);
  if (M.smoke) L.push(li('Ho sặc sụa, người mệt hẳn đi: −8 thể lực, −2 Thể thao.', 'bad'));
  if (skipped.length && tt) L.push(li('Bỏ lỡ ' + skipped.map(n => `tiết ${n} (${SUBJ[tt[n - 1]].short})`).join(', ') + ' — không được điểm bài học.', 'warn'));
  if (Math.random() < M.risk + 0.1 * skipped.length + 0.04 * G.caughtCycle) L.push(...mischiefCaught(M, skipped, tt, fid));
  else L.push(li(skipped.length ? 'Bạn cùng bàn điểm danh hộ. Trót lọt, không ai biết!' : 'Trót lọt, không ai phát hiện!', 'good'));
  RT.snapNpcs = true;
  await UI.fade(false);
  await UI.ask(M.name, resWrap(L), ['OK']);
  RT.lock = false; UI.hud();
}
// Bị phát hiện: phạt hạnh kiểm, hoặc trừ điểm bài kiểm tra, hoặc báo về gia đình (càng nghiêm trọng càng nhiều hình phạt)
function mischiefCaught(M, skipped, tt, fid) {
  const L = [], out = [], gradedSkipped = (tt ? skipped.map(n => SUBJ[tt[n - 1]].base || tt[n - 1]) : []).filter(s => GRADED.includes(s));
  G.caughtCycle++;
  if (M.sev >= 3) { out.push('hk'); if (Math.random() < 0.7) out.push('parents'); }
  else if (M.sev === 2) { out.push('hk'); if (Math.random() < 0.4) out.push('parents'); if (gradedSkipped.length && Math.random() < 0.5) out.push('test'); }
  else out.push(pick(gradedSkipped.length ? ['hk', 'test', 'parents'] : ['hk', 'hk', 'parents']));
  L.push(li(M.smoke ? 'Thầy giám thị đẩy cửa nhà vệ sinh — bị bắt quả tang hút thuốc!' : (M.leave ? 'Bác bảo vệ bắt gặp lúc trèo tường vào, báo lên giám thị.' : 'Thầy giám thị đi ngang qua và bắt quả tang.'), 'bad'));
  for (const o of out) {
    if (o === 'hk') { const pen = 0.5 + 0.5 * M.sev; addConduct(-pen, M.smoke ? 'hút thuốc trong trường' : (M.leave ? 'trốn học' : 'vi phạm nội quy')); L.push(li(`Hạnh kiểm −${fmtScore(pen)}.`, 'bad')); }
    else if (o === 'test') { const s = pick(gradedSkipped); G.testPen[s] = (G.testPen[s] || 0) + 2; L.push(li(`Giáo viên môn ${SUBJ[s].name} ghi sổ: bài kiểm tra tới của môn này bị trừ 2 điểm.`, 'bad')); }
    else { const d = M.smoke ? PARENT.smoke : PARENT.skipCall; addParent(d, M.smoke ? 'bị phát hiện hút thuốc' : 'nhà trường báo về gia đình'); L.push(li(`Nhà trường gọi điện báo phụ huynh (thiện cảm −${Math.abs(d)}).`, 'bad')); }
  }
  addFriend(fid, 3); L.push(li(`Cùng chịu phạt với ${FRIENDS[fid].name}: thân thiết +3.`, 'dim'));
  return L;
}

/* ---------- buổi thực hành ---------- */
function rollDiff() { let r = Math.random(); for (let d = 0; d < 5; d++) { r -= DIFF_WEIGHTS[d]; if (r < 0) return d + 1; } return 3; }
const starStr = d => '★'.repeat(d) + '☆'.repeat(5 - d);
const MG_HELP = '<p class="dim">Giữ <kbd>Space</kbd> hoặc nhấn giữ chuột để nâng vùng xanh, thả ra để hạ. Giữ kim trong vùng xanh cho đến khi thanh tiến độ đầy.</p>';
async function practicalSession(key, half) {
  const P = PRACTICALS[key], d = rollDiff(), lvP = lv(P.stat), L = [], full = practicalReward(d, true, false);
  await UI.ask(P.title, `<p>${P.task}.</p><p>Độ khó hôm nay: <span class="stars">${starStr(d)}</span> — hoàn thành được <b>+${half ? Math.ceil(full / 2) : full}</b> điểm ${STAT_NAMES[P.stat]}.</p><p class="dim">Cấp ${STAT_NAMES[P.stat]} hiện tại: ${lvP}. Cấp càng cao, vùng xanh càng rộng nên càng dễ hoàn thành.</p>${MG_HELP}`, ['Bắt đầu']);
  const r = await UI.minigame({ title: P.title, task: P.task, icon: P.icon, diff: d, level: lvP, tired: G.stamina < 10 });
  let pts = practicalReward(d, r.win, r.perfect); if (half) pts = Math.ceil(pts / 2);
  L.push(li(`${P.title} · độ khó <span class="stars">${starStr(d)}</span>`, 'warn'));
  L.push(li(r.win ? (r.perfect ? 'Hoàn thành xuất sắc, không lệch nhịp nào!' : 'Hoàn thành bài thực hành.') : 'Chưa hoàn thành — vẫn được điểm chuyên cần.', r.win ? 'good' : 'bad'));
  addStat(P.stat, pts); L.push(li(`+${pts} điểm ${STAT_NAMES[P.stat]}`, 'good'));
  return { d, r, pts, lines: L };
}
ACT.labBench = async () => {
  if (RT.lock) return;
  if (G.daily.labPractice) return UI.toast('Hôm nay bạn đã tự luyện thực hành rồi.');
  if (G.stamina < 4) return UI.toast('Mệt quá, không luyện nổi.', 'bad');
  const keys = ['th_ly', 'th_hoa', 'th_sinh'];
  const c = await UI.ask('Tự luyện thực hành', '<p>Luyện thêm 20 phút ngoài giờ: được một nửa số điểm so với buổi thực hành chính. Mỗi ngày một lần.</p>', keys.map(k => PRACTICALS[k].title).concat('Thôi'));
  if (c < 0 || c >= keys.length) return;
  RT.lock = true;
  const r = await practicalSession(keys[c], true);
  G.daily.labPractice = true; useStam(4); advanceTime(20);
  RT.lock = false; UI.hud();
  UI.toast(r.r.win ? `Luyện xong: +${r.pts} điểm ${STAT_NAMES[PRACTICALS[keys[c]].stat]}` : `Chưa đạt, được +${r.pts} điểm chuyên cần`, r.r.win ? 'good' : 'info');
};

/* ---------- minigame: vật lý tách riêng để dễ chỉnh và kiểm thử ---------- */
// H: chiều cao thang đo · bh: độ cao vùng xanh · bp: đáy vùng xanh · tp: vị trí kim · pr: tiến độ 0..1
const MGP = {
  barBase: 64, barPerLv: 5.5, barPerDiff: 3, barTired: 14, barMin: 46, barMax: 165,   // độ cao vùng xanh: cấp thực hành càng cao càng rộng
  up: 520, down: 430, drag: 0.12,                                                     // lực nâng / rơi / cản của vùng xanh
  range: 34, rangePerDiff: 24, follow: 0.9, followPerDiff: 0.5, jitter: 0.26, dart: 0.12, // kim di chuyển: càng khó càng nhanh, thất thường
  gain: 0.17, drain: 0.085, drainPerDiff: 0.028, drainPerLv: 0.005, drainMin: 0.05, grace: 1.0,
};
function mgNew(diff, level, tired) {
  const P = MGP;
  return { H: 250, bh: clamp(P.barBase + P.barPerLv * level - P.barPerDiff * diff - (tired ? P.barTired : 0), P.barMin, P.barMax), bp: 30, bv: 0, tp: 70, dest: 70, tt: 0.6, pr: 0.3, maxPr: 0.3, t: 0, outT: 0, diff, level, done: 0, inside: true };
}
function mgStep(s, held, dt) {
  const P = MGP;
  s.t += dt;
  // vùng xanh: giữ thì bay lên, thả thì rơi, chạm đáy nảy nhẹ
  s.bv += (held ? P.up : -P.down) * dt; s.bv *= Math.pow(P.drag, dt);
  s.bp += s.bv * dt;
  if (s.bp < 0) { s.bp = 0; s.bv = s.bv < -70 ? -s.bv * 0.3 : 0; }
  if (s.bp > s.H - s.bh) { s.bp = s.H - s.bh; s.bv = 0; }
  // kim: thỉnh thoảng đổi hướng; càng khó càng nhanh và thất thường
  s.tt -= dt;
  if (s.tt <= 0) {
    const R = P.range + P.rangePerDiff * s.diff;
    s.dest = clamp(s.tp + rnd(-R, R), 14, s.H - 14);
    if (s.diff >= 4 && Math.random() < P.dart) s.dest = rnd(14, s.H - 14);
    s.tt = rnd(0.6, 1.6) / (0.7 + 0.18 * s.diff);
  }
  s.tp = clamp(s.tp + (s.dest - s.tp) * Math.min(1, (P.follow + P.followPerDiff * s.diff) * dt) + Math.sin(s.t * (4 + s.diff)) * s.diff * P.jitter, 6, s.H - 6);
  s.inside = s.tp >= s.bp && s.tp <= s.bp + s.bh;
  if (s.inside) s.pr += P.gain * dt;
  else if (s.t > P.grace) { s.pr -= Math.max(P.drainMin, P.drain + P.drainPerDiff * s.diff - P.drainPerLv * s.level) * dt; s.outT += dt; }
  s.maxPr = Math.max(s.maxPr, s.pr);
  if (s.pr >= 1) { s.pr = 1; s.done = 1; } else if (s.pr <= 0) { s.pr = 0; s.done = -1; }
  return s;
}
const mgResult = s => ({ win: s.done === 1, perfect: s.done === 1 && s.outT < 0.25, progress: s.done === 1 ? 1 : s.maxPr });
