'use strict';
/* ============================================================
 *  04b. QUẬY & THỰC HÀNH
 *  - Làm việc riêng trong giờ học (bạn rủ ăn vụng, tám chuyện, chơi game, xem video)
 *  - Trốn học / quậy cùng bạn (trà sữa, đá bóng, arcade, xem phim, leo núi, ngồi căn tin, thí nghiệm dởm, hút thuốc)
 *  - Trốn học cùng bạn: trèo tường ra ngoài thật, thời gian trôi thật, quay lại qua cổng mới là về lớp
 *  - Sau giờ học / ngày nghỉ: rủ bạn đi chơi (bạn đi theo) · tố cáo bạn rủ rê với giám thị (có hoạt cảnh bị phạt)
 *  - Buổi thực hành với minigame kiểu câu cá của Stardew Valley
 * ============================================================ */
const resWrap = L => '<ul class="res">' + L.join('') + '</ul>';

/* ---------- làm việc riêng trong giờ ---------- */
// Trả về { delta: thay đổi điểm bài học, lines }
async function classFun() {
  const ok = Object.keys(FRIENDS).filter(f => !grudge(f)); if (!ok.length) return { delta: 0, lines: [] };
  const ev = pick(CLASS_FUN), fid = ok.includes('khoa') && Math.random() < 0.55 ? 'khoa' : pick(ok), F = FRIENDS[fid], L = [];
  const c = await UI.ask('Trong giờ học', `<p><b>${F.name}</b> ${ev.text}</p>`, [`${ev.join} cùng ${F.name}`, 'Từ chối, tập trung học', `Giơ tay mách cô (tố cáo ${F.name})`], { esc: 1 });
  if (c === 2) { await playCut(snitchCut(fid, true)); return { delta: 1, lines: snitch(fid, true) }; }
  if (c !== 0) return { delta: 1, lines: [] };
  addFriend(fid, ev.friend); G.daily.fun++;
  L.push(li(`${ev.join} cùng ${F.name}, hơi mất tập trung.`, 'warn'));
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
  L.push(li(`Bị cô bắt quả tang${ev.id && ev.sev === 2 ? ' dùng điện thoại trong giờ' : ''}${n > 1 ? ` — lần thứ ${n} trong kỳ hạnh kiểm này` : ''}.`, 'bad'));
  addConduct(-(n >= 3 ? 1 : 0.5), 'làm việc riêng trong giờ học'); addTeacher(TEACHER.caughtFun);
  const pCall = ev.sev === 2 ? (n > 1 ? 0.5 : 0.25) : 0.15;
  if (Math.random() < pCall) { addParent(PARENT.teacherCall, 'cô giáo gọi điện báo phụ huynh'); L.push(li('Cô gọi điện báo về gia đình.', 'bad')); }
  else L.push(li('Cô phê bình trước lớp nhưng không báo phụ huynh.', 'dim'));
  return L;
}

/* ---------- trốn học cùng bạn · quậy trong trường · tố cáo ---------- */
const isOuting = M => !!M.leave && !M.inside;            // trò phải ra khỏi trường
function canDo(M) { return (!M.cost || G.money >= M.cost) && (!M.stamCost || G.stamina >= M.stamCost) && (!M.day || inWin(G.time, HILL_HOURS[0], HILL_HOURS[1] - 30)); }
// Bạn rủ mình (đầu giờ ra chơi). Bạn đang giận vì bị tố cáo thì không rủ nữa.
function rollInvite() {
  const fids = Object.keys(FRIENDS).filter(f => !grudge(f)); if (!fids.length) return null;
  const fid = pick(fids), ids = FRIEND_LIKES[fid].filter(id => canDo(MISCHIEF[id]));
  return ids.length ? { fid, id: pick(ids) } : null;
}
async function showInvite(inv) {
  const F = FRIENDS[inv.fid], M = MISCHIEF[inv.id], out = isOuting(M);
  G.daily.invites++;
  const c = await UI.ask(`${F.name} rủ rê`, `<p>${F.name} ghé tai bạn: ${INVITE_TEXT[inv.id]}</p>`, [out ? 'Trốn học đi luôn!' : 'Đi luôn!', 'Thôi, tớ không đi', `Báo giám thị (tố cáo ${F.name})`], { esc: 1 });
  if (c === 0) { if (out) startSkip(inv.fid); else doMischief(inv.id, inv.fid); }
  else if (c === 2) { RT.lock = true; await playCut(snitchCut(inv.fid, false)); RT.lock = false; UI.ask('Tố cáo với giám thị', resWrap(snitch(inv.fid, false)), ['OK']); }
}
// Tố cáo bạn rủ rê trốn học / làm việc riêng: thầy cô quý hơn, bạn giận SNITCH.grudgeDays ngày
function snitch(fid, inClass) {
  const F = FRIENDS[fid], L = [];
  addFriend(fid, inClass ? SNITCH.friendClass : SNITCH.friend); G.grudge[fid] = G.day + SNITCH.grudgeDays;
  for (const o in FRIENDS) if (o !== fid) addFriend(o, SNITCH.others, true);
  addTeacher(inClass ? TEACHER.snitchClass : TEACHER.snitch, inClass ? null : 'nghiem');
  L.push(li(inClass ? `${F.name} bị phạt đứng úp mặt vào bảng tới hết tiết.` : `${F.name} bị phạt đứng dưới cột cờ và viết bản kiểm điểm.`, 'warn'));
  L.push(li(inClass ? 'Cô khen bạn có ý thức xây dựng nề nếp lớp.' : 'Thầy giám thị khen bạn trung thực.', 'good'));
  if (!inClass && G.conduct < 10) addConduct(0.25, 'báo cáo vi phạm với giám thị');
  L.push(li(`${F.name} giận bạn: ${SNITCH.grudgeDays} ngày tới không rủ rê, không cho mượn đồ. Cả nhóm bạn cũng nhìn bạn khác đi.`, 'bad'));
  return L;
}
// Hoạt cảnh bị phạt sau khi bị tố cáo
function snitchCut(fid, inClass) {
  const F = FRIENDS[fid];
  if (inClass) return {
    map: 'class', me: [SEAT.x, SEAT.y, 3], cam: { x: 160, y: 80 }, hide: [fid], title: `${F.name} bị phạt`,
    actors: [{ look: fid, x: fid === 'khoa' ? 125 : fid === 'vy' ? 191 : fid === 'ngan' ? 61 : 111, y: fid === 'dat' ? 168 : 134, dir: 3 }, { look: (RT.scene && RT.scene.teacher) || 'teacherA', x: 160, y: 52, dir: 0 }],
    steps: [{ say: [1, `Em ${F.name}! Trong giờ học mà làm việc riêng à? Lên đây đứng úp mặt vào bảng cho tôi!`] }, { move: [0, 150, 96, 500] }, { move: [0, 84, 60, 700] }, { fn: sc => { sc.actors[0].dir = 3; } }, { say: [0, '(Đồ mách lẻo… nhớ mặt đó!)'] }],
  };
  return {
    map: 'school', me: [300, 196, 2], cam: { x: 350, y: 170 }, title: `${F.name} bị phạt dưới cột cờ`,
    actors: [{ look: fid, x: 330, y: 196, dir: 3 }, { look: 'giamthi', x: 330, y: 150, dir: 0 }],
    steps: [{ say: [1, `Em ${F.name}! Rủ bạn trốn học phải không? Ra đứng nghiêm dưới cột cờ, cuối giờ nộp bản kiểm điểm!`] }, { move: [0, 372, 176, 700] }, { fn: sc => { sc.actors[0].dir = 0; } }, { say: [0, 'Dạ… em biết lỗi rồi ạ…'] }, { say: [0, '(Đồ mách lẻo… nhớ mặt đó!)'] }],
  };
}

/* ---------- trốn học: ra ngoài thật, thời gian trôi thật ---------- */
const skipAccept = (fid, free) => clamp(SKIP.accept + SKIP.perHeart * hearts(fid) + (free ? SKIP.freeBonus : 0), 0.05, 0.97);
const REFUSE = ['“Thôi, hôm nay tớ không có hứng.”', '“Tớ sợ bị bắt lắm, cậu rủ đứa khác đi.”', '“Tớ còn bài chưa làm xong. Để bữa khác nha.”'];
// BẠN chủ động rủ. Trong giờ học ở trường = rủ trốn học; tan học / ngày nghỉ = rủ đi chơi (không ai cấm).
async function askOut(fid) {
  const F = FRIENDS[fid], skip = G.atSchool && !freeTime();
  if (grudge(fid)) return UI.say(F.name, '“Tớ không đi đâu với đứa mách lẻo hết.”');
  if (G.comp) return UI.say(F.name, `“Cậu đang đi với ${FRIENDS[G.comp.fid].name} mà?”`);
  if (G.time >= SKIP.endAt - 30) return UI.say(F.name, '“Muộn rồi, tớ phải về. Để bữa khác nha.”');
  const asked = G.daily.ask[fid] || 0;
  if (asked >= SKIP.perDay) return UI.say(F.name, '“Hôm nay cậu rủ hoài à. Tớ nói không là không mà!”');
  G.daily.ask[fid] = asked + 1;
  if (Math.random() >= skipAccept(fid, !skip)) return UI.say(F.name, pick(REFUSE));
  if (skip) startSkip(fid); else { setComp(fid, false); UI.say(F.name, '“Đi chứ! Cậu dẫn đường đi, đi đâu tớ theo đó.”'); }
}
// Trèo tường (hoặc rình lúc bác bảo vệ sơ ý) rồi ra ngoài luôn. Từ đây tự đi chơi; quay lại đi qua cổng trường mới là về lớp.
async function startSkip(fid) {
  if (RT.lock) return;
  RT.lock = true;
  await playCut(Math.random() < 0.5 ? wallCut(fid, false, false) : sneakCut(fid));
  G.atSchool = false; RT.skip = { missed: [], fid }; G.daily.skips++;
  setMap('school', 150, 404, 0); setComp(fid, true);
  RT.lock = false; UI.hud();
  UI.toast('Ra ngoài rồi! Đi chơi đâu thì đi. Khi nào quay lại, đi qua cổng trường là về lớp.', 'info');
}
const skipRisk = n => clamp(SKIP.risk + SKIP.perMissed * n + 0.04 * G.caughtCycle, 0.05, 0.9);
// Kết thúc buổi trốn học: quay lại qua cổng (atGate), hoặc tan học mà vẫn chưa về
async function resolveSkip(atGate) {
  const sk = RT.skip; if (!sk) return;
  RT.skip = null;
  const fid = sk.fid, F = FRIENDS[fid], tt = ttToday(), missed = sk.missed.slice(), caught = Math.random() < skipRisk(missed.length), L = [];
  RT.lock = true;
  if (atGate) { await playCut(gateBackCut(fid, caught)); endComp(); } else if (G.comp) G.comp.skip = false;
  addFriend(fid, SKIP.friend);
  L.push(li(atGate ? `Trốn học đi chơi với ${F.name} rồi lẻn về trường.` : `Trốn học đi chơi với ${F.name} tới tận lúc tan trường.`, 'warn'));
  if (missed.length && tt) L.push(li('Bỏ lỡ ' + missed.map(n => `tiết ${n} (${SUBJ[tt[n - 1]].short})`).join(', ') + '.', 'warn'));
  if (caught) L.push(...mischiefCaught({ sev: missed.length >= 3 ? 2 : 1, leave: true, skip: true, atGate }, missed, tt, fid));
  else L.push(li(missed.length ? 'Bạn cùng bàn điểm danh hộ. Trót lọt, không ai biết!' : 'Trót lọt, không ai phát hiện!', 'good'));
  await UI.ask('Trốn học', resWrap(L), ['OK']);
  RT.lock = false; UI.hud();
}
// Quậy trong trường do bạn rủ (phòng hoá, nhà vệ sinh, căn tin): hoạt cảnh tại chỗ; bị giám thị bắt thì cả hai giật mình nhảy dựng lên
async function doMischief(id, fid) {
  const M = MISCHIEF[id], F = FRIENDS[fid], L = [];
  if (M.cost && G.money < M.cost) return UI.toast('Không đủ tiền.', 'bad');
  if (M.stamCost && G.stamina < M.stamCost) return UI.toast('Không đủ thể lực.', 'bad');
  if (RT.lock) return;
  RT.lock = true;
  const wasAt = G.atSchool, tt = ttToday();
  RT.skip = { missed: [] };
  if (M.leave) G.atSchool = false;                 // không có mặt trong lớp: tiết nào trôi qua là tiết bị bỏ
  advanceTime(M.mins);
  const skipped = RT.skip.missed.slice(); RT.skip = null;
  if (M.leave && wasAt) G.atSchool = true;
  const caught = Math.random() < M.risk + 0.1 * skipped.length + 0.04 * G.caughtCycle;
  await playCut(venueCut(id, fid, caught, false));
  if (M.inside && wasAt) setMap('school', 80, 118, 0);
  addFriend(fid, M.friend);
  L.push(li(`${M.verb} với ${F.name}.`, 'good'));
  if (M.cost) addMoney(-M.cost, true);
  if (M.stam) G.stamina = Math.min(maxStam(), G.stamina + M.stam);
  if (M.stamCost) useStam(M.stamCost, !M.smoke);
  for (const k of ['giaotiep', 'thethao', 'th_hoa']) if (M[k]) addStat(k, M[k]);
  if (M.smoke) L.push(li('Ho sặc sụa, người mệt hẳn đi.', 'bad'));
  if (skipped.length && tt) L.push(li('Bỏ lỡ ' + skipped.map(n => `tiết ${n} (${SUBJ[tt[n - 1]].short})`).join(', ') + '.', 'warn'));
  if (caught) L.push(...mischiefCaught(M, skipped, tt, fid));
  else L.push(li(skipped.length ? 'Bạn cùng bàn điểm danh hộ. Trót lọt, không ai biết!' : 'Trót lọt, không ai phát hiện!', 'good'));
  RT.snapNpcs = true;
  await UI.ask(M.name, resWrap(L), ['OK']);
  RT.lock = false; UI.hud();
}
// Bị phát hiện: phạt hạnh kiểm, hoặc trừ điểm bài kiểm tra, hoặc báo về gia đình (càng nghiêm trọng càng nhiều hình phạt)
function mischiefCaught(M, skipped, tt, fid) {
  const L = [], out = [], gradedSkipped = (tt ? skipped.map(n => SUBJ[tt[n - 1]].base || tt[n - 1]) : []).filter(s => GRADED.includes(s));
  G.caughtCycle++; addTeacher(TEACHER.caughtSkip, 'nghiem');
  if (M.sev >= 3) { out.push('hk'); if (Math.random() < 0.7) out.push('parents'); }
  else if (M.sev === 2) { out.push('hk'); if (Math.random() < 0.4) out.push('parents'); if (gradedSkipped.length && Math.random() < 0.5) out.push('test'); }
  else out.push(pick(gradedSkipped.length ? ['hk', 'test', 'parents'] : ['hk', 'hk', 'parents']));
  L.push(li(M.skip ? (M.atGate ? 'Thầy giám thị đứng chờ sẵn ở cổng — bị bắt quả tang trốn học!' : 'Giám thị đi điểm danh từng lớp, phát hiện hai đứa vắng mặt cả buổi.') : M.smoke ? 'Thầy giám thị đẩy cửa nhà vệ sinh — bị bắt quả tang hút thuốc!' : (M.inside ? 'Thầy giám thị đi tuần xuống căn tin, bắt gặp hai đứa ngồi lì trong giờ học.' : M.leave ? 'Bác bảo vệ bắt gặp lúc trèo tường vào, báo lên giám thị.' : 'Thầy giám thị đi ngang qua và bắt quả tang.'), 'bad'));
  for (const o of out) {
    if (o === 'hk') { const pen = 0.5 + 0.5 * M.sev; addConduct(-pen, M.smoke ? 'hút thuốc trong trường' : (M.leave ? 'trốn học' : 'vi phạm nội quy')); L.push(li('Bị trừ điểm hạnh kiểm.', 'bad')); }
    else if (o === 'test') { const s = pick(gradedSkipped); G.testPen[s] = (G.testPen[s] || 0) + 2; L.push(li(`Giáo viên môn ${SUBJ[s].name} ghi sổ: bài kiểm tra tới của môn này bị trừ 2 điểm.`, 'bad')); }
    else { const d = M.smoke ? PARENT.smoke : PARENT.skipCall; addParent(d, M.smoke ? 'bị phát hiện hút thuốc' : 'nhà trường báo về gia đình'); L.push(li('Nhà trường gọi điện báo phụ huynh.', 'bad')); }
  }
  addFriend(fid, 3); L.push(li(`Cùng chịu phạt với ${FRIENDS[fid].name} nên hai đứa lại thân hơn.`, 'dim'));
  return L;
}

/* ---------- buổi thực hành ---------- */
function rollDiff() { let r = Math.random(); for (let d = 0; d < 5; d++) { r -= DIFF_WEIGHTS[d]; if (r < 0) return d + 1; } return 3; }
const starStr = d => '★'.repeat(d) + '☆'.repeat(5 - d);
const MG_HELP = '<p class="dim">Giữ <kbd>Space</kbd> hoặc nhấn giữ chuột để nâng vùng xanh, thả ra để hạ. Giữ kim trong vùng xanh cho đến khi thanh tiến độ đầy.</p>';
async function practicalSession(key, half) {
  const P = PRACTICALS[key], d = rollDiff(), L = [];
  await UI.ask(P.title, `<p>${P.task}.</p><p>Độ khó hôm nay: <span class="stars">${starStr(d)}</span></p><p class="dim">Có thể bấm “Bỏ qua” trong lúc làm — khi đó chỉ được điểm chuyên cần.</p>`, ['Bắt đầu']);
  const r = gameRes(await playGame(P.game, d));
  let pts = practicalReward(d, r.win, r.perfect); if (half) pts = Math.ceil(pts / 2);
  L.push(li(`${P.title} · độ khó <span class="stars">${starStr(d)}</span>`, 'warn'));
  L.push(li(r.win ? (r.perfect ? 'Hoàn thành xuất sắc, không lệch nhịp nào!' : 'Hoàn thành bài thực hành.') : 'Chưa hoàn thành — vẫn được điểm chuyên cần.', r.win ? 'good' : 'bad'));
  addStat(P.stat, pts);
  return { d, r, pts, lines: L };
}
ACT.labBench = async () => {
  if (RT.lock) return;
  if (G.daily.labPractice) return UI.toast('Hôm nay bạn đã tự luyện thực hành rồi.');
  if (G.stamina < 4) return UI.toast('Mệt quá, không luyện nổi.', 'bad');
  const keys = ['th_ly', 'th_hoa', 'th_sinh'];
  const c = await UI.ask('Tự luyện thực hành', '<p>Luyện thêm ngoài giờ, mỗi ngày một lần.</p>', keys.map(k => PRACTICALS[k].title).concat('Thôi'));
  if (c < 0 || c >= keys.length) return;
  RT.lock = true;
  const r = await practicalSession(keys[c], true);
  G.daily.labPractice = true; useStam(4); advanceTime(20);
  RT.lock = false; UI.hud();
  UI.toast(r.r.win ? 'Luyện xong!' : 'Chưa đạt, mai luyện tiếp.', r.r.win ? 'good' : 'info');
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
