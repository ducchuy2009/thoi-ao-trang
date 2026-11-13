'use strict';
/* ============================================================
 *  04. LUẬT CHƠI — thời gian, chỉ số, trường học, điểm số
 * ============================================================ */
let G = null;   // trạng thái được lưu
const RT = { lock: false, pendingClass: null, pendingInvite: null, pendingBreak: null, pendingEvent: null, forceSleep: false, scene: null, outfit: null, skip: null, snapNpcs: true, floats: [], tickAcc: 0, hover: null, near: null, morning: [], walkT: -1 };
const ACT = {}; // các hành động tương tác
const SAVE_KEY = 'thoi_ao_trang_save_v2';

/* ---------- khởi tạo / lưu ---------- */
function newGame(name, gender) {
  G = {
    v: 2, name: name || 'Bạn', gender: gender === 'girl' ? 'girl' : 'boy',
    day: 0, time: CFG.DAY_START, map: 'home', x: 58, y: 76, dir: 0,
    money: CFG.START_MONEY, earned: 0, stamina: 100, tlXp: 0,
    parent: PARENT.start,   // thiện cảm của bố mẹ → cấp tiền tiêu vặt
    stats: { toan: 0, van: 0, anh: 0, ly: 0, hoa: 0, sinh: 0, su: 0, dia: 0, qp: 0, th_ly: 0, th_hoa: 0, th_sinh: 0, thethao: 0, buonban: 0, giaotiep: 0, kheotay: 0 },
    bag: { hopbut: true, thehs: true }, inv: { comhop: 0, banhmi: 0, sua: 0, banhtrang: 0, bimbim: 0, gaubong: 0 },
    owned: {}, busPassUntil: -1,
    conduct: 10, conductLog: [], conductWeeks: 0, caughtCycle: 0,
    grades: {}, tests: [], pending: {}, quiz: {}, testPen: {},
    friends: { khoa: 0, vy: 0, dat: 0, ngan: 0 }, review: {},
    atSchool: false, cameBy: null, grade: 10, schoolDays: 0,
    speed: CFG.TICK_SEC, reports: [], daily: null, graduated: false,
  };
  migrate();
  RT.morning = [];
  beginDay(true);
}
// Bổ sung các trường mới cho bản lưu cũ (và cho ván mới)
function migrate() {
  const def = (k, v) => { if (G[k] === undefined) G[k] = v; };
  def('teacher', TEACHER.start);                       // thiện cảm thầy cô
  def('cards', {}); def('cardDone', false);            // thẻ cầu thủ: id → số lá
  def('phone', { msgs: {}, unread: {}, pend: null });  // tin nhắn
  def('meet', null);                                   // cuộc hẹn đi chơi: { fid, place, day, from, n }
  def('grudge', {});                                   // bạn đang giận vì bị tố cáo: fid → ngày hết giận
  def('tips', {}); def('outAsk', { week: -1, n: 0 }); def('hillFrom', 'pho');
  for (const f in FRIENDS) if (G.friends[f] === undefined) G.friends[f] = 0;
  for (const k of ['bimbim', 'gaubong']) if (G.inv[k] === undefined) G.inv[k] = 0;
  if (G.daily) { const d = G.daily; resetDaily(); G.daily = Object.assign(G.daily, d); }
}
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(G)); return true; } catch (e) { return false; } }
function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
function loadData(d) {
  if (!d || d.v !== 2 || !d.stats || !d.daily) return false;
  G = d; migrate(); RT.scene = null; RT.outfit = null; RT.pendingClass = null; RT.pendingInvite = null; RT.pendingBreak = null; RT.pendingEvent = null; RT.forceSleep = false; RT.lock = false; RT.skip = null; RT.snapNpcs = true;
  if (schoolToday() && G.atSchool) { const p = PERIODS.find(p => p.start === G.time && !G.daily.done[p.n]); if (p) RT.pendingClass = p; }
  return true;
}
function load() { try { const s = localStorage.getItem(SAVE_KEY); return s ? loadData(JSON.parse(s)) : false; } catch (e) { return false; } }
function exportCode() { return btoa(unescape(encodeURIComponent(JSON.stringify(G)))); }
function importCode(code) { try { return loadData(JSON.parse(decodeURIComponent(escape(atob(code.trim()))))); } catch (e) { return false; } }

/* ---------- tiện ích trạng thái ---------- */
const today = () => cal(G.day);
const schoolToday = () => isSchoolDay(G.day);
const ttToday = () => (schoolToday() ? TIMETABLE[today().dow] : null);
const maxStam = () => tlInfo(G.tlXp).max;
const lv = k => lvlInfo(G.stats[k]).lv;
const avgOf = a => a.reduce((s, v) => s + v, 0) / a.length;
const lyThuyet = () => avgOf(THEORY.map(lv));
const thucHanh = () => avgOf(PRACTICE.map(lv));
// Năng lực tổng hợp ảnh hưởng tới may rủi khi kiểm tra
function compOf(subj) {
  if (subj === 'qp') return thucHanh();
  if (subj === 'td') return lv('thethao');
  if (subj === 'ly' || subj === 'hoa' || subj === 'sinh') return (lyThuyet() + thucHanh()) / 2;
  return lyThuyet();
}
const hearts = id => Math.min(5, Math.floor((G.friends[id] || 0) / 20));
const addFriend = (id, n) => { G.friends[id] = clamp((G.friends[id] || 0) + n, 0, 100); };
const inWin = (t, a, b) => t >= a && t < b;
// Ở trong nhà hoặc ngoài sân nhà đều tính là đang ở nhà
const atHome = () => G.map === 'home' || (G.map === 'town' && G.x < 272 && G.y < 160);
// Tan học hoặc ngày nghỉ: đi đâu cũng được, không ai bắt
const freeTime = () => !schoolToday() || G.time >= CFG.SCHOOL_END;
const teacherLv = () => teacherLvOf(G.teacher);
const grudge = fid => (G.grudge[fid] === undefined ? -1 : G.grudge[fid]) >= G.day;
const sceneHides = sid => !!(RT.scene && RT.scene.hide && RT.scene.hide.includes(sid));
// "Đã về nhà": có mặt ở nhà trong khoảng tan học → 20:00 (ngày nghỉ: từ 12:00). Sau đó có ra ngoài chơi tiếp thì bố mẹ không mắng.
function checkIn() { if (G.time >= (schoolToday() ? CFG.SCHOOL_END : CFG.HOME_CHECK_OFF) && G.time < CFG.LATE_HOME && atHome()) G.daily.checkedIn = true; }
function yardTime() { return schoolToday() && !RT.scene && YARD_WINDOWS.some(([a, b]) => inWin(G.time, a, b)); }
function classSeated() { const t = G.time; return (RT.scene && RT.scene.type === 'class') || (schoolToday() && (inWin(t, 420, 640) || inWin(t, 790, 1020))); }
function teacherIn() { const t = G.time; if (RT.scene && RT.scene.type === 'cut') return false; return (RT.scene && RT.scene.type === 'class') || (schoolToday() && (inWin(t, 460, 640) || inWin(t, 790, 1020))); }
function parkTime() { const t = G.time; return schoolToday() ? inWin(t, 1040, 1210) : inWin(t, 480, 1090); }
function nextPeriod() { return schoolToday() ? PERIODS.find(p => p.start > G.time && !G.daily.done[p.n]) || null : null; }
function currentPeriod() { return schoolToday() ? PERIODS.find(p => inWin(G.time, p.start, p.start + PERIOD_LEN)) || null : null; }
function phaseLabel() {
  if (!schoolToday()) { const h = holidayOf(G.day); return h ? 'Nghỉ lễ · ' + h.name : (SEASONS[today().season].school ? 'Cuối tuần · Tự do' : 'Nghỉ hè · Tự do'); }
  if (G.time >= CFG.SCHOOL_END) return 'Giai đoạn 3 · Sau giờ học';
  if (G.atSchool || G.time >= CFG.GATE_TIME) return 'Giai đoạn 2 · Giờ đi học';
  return 'Giai đoạn 1 · Chuẩn bị đi học';
}

/* ---------- thay đổi chỉ số ---------- */
function addStat(k, pts) {
  if (!pts) return;
  const before = lvlInfo(G.stats[k]).lv;
  G.stats[k] = Math.max(0, (G.stats[k] || 0) + pts);
  UI.float((pts > 0 ? '+' : '') + pts + ' ' + STAT_NAMES[k], pts > 0 ? '#ffe066' : '#ff9a9a');
  const after = lvlInfo(G.stats[k]).lv;
  if (after > before) UI.toast(`${STAT_NAMES[k]} lên cấp ${after}!`, 'good');
}
function addMoney(n, quiet) {
  G.money += n; if (n > 0) G.earned += n;
  if (!quiet) UI.float((n > 0 ? '+' : '') + fmtMoney(n), n > 0 ? '#a8f08a' : '#ff9a9a');
}
function useStam(n, physical) {
  G.stamina = Math.max(0, G.stamina - n);
  if (physical) { const b = tlInfo(G.tlXp).lv; G.tlXp += n; const a = tlInfo(G.tlXp).lv; if (a > b) UI.toast(`Thể lực lên cấp ${a}! Thể lực tối đa ${tlInfo(G.tlXp).max}.`, 'good'); }
}
function gainStam(n) { G.stamina = Math.min(maxStam(), G.stamina + n); UI.float('+' + n + ' thể lực', '#8fd8ff'); }
function addConduct(d, why) {
  G.conduct = clamp(Math.round((G.conduct + d) * 100) / 100, 0, 10);
  UI.toast(`Hạnh kiểm ${d > 0 ? '+' : '−'}${fmtScore(Math.abs(d))}: ${why}`, d > 0 ? 'good' : 'bad');
}
// Thiện cảm của thầy cô: chấm bài nhẹ tay hơn, quay cóp khó bị bắt hơn
function addTeacher(d, quiet) {
  if (!d) return;
  const b = teacherLv(); G.teacher = clamp(G.teacher + d, 0, TEACHER.max); const a = teacherLv();
  if (!quiet) UI.float(`${d > 0 ? '+' : '−'}${Math.abs(d)} thiện cảm thầy cô`, d > 0 ? '#d9b8ff' : '#ff9a9a');
  if (a !== b) UI.toast(`Thiện cảm thầy cô ${a > b ? 'lên' : 'tụt xuống'} cấp ${a}: ${TEACHER_TITLE[a]}`, a > b ? 'good' : 'bad');
}
// Thiện cảm của bố mẹ: quyết định cấp Tiền tiêu vặt (tiền mẹ cho đầu tuần)
function addParent(d, why, quiet) {
  const b = parentInfo(G.parent).lv;
  G.parent = clamp(G.parent + d, 0, PARENT_MAX);
  const a = parentInfo(G.parent);
  if (!quiet) UI.toast(`${d > 0 ? 'Bố mẹ hài lòng +' : 'Bố mẹ phiền lòng −'}${Math.abs(d)}${why ? ': ' + why : ''}`, d > 0 ? 'good' : 'bad');
  if (a.lv > b) UI.toast(`Tiền tiêu vặt lên cấp ${a.lv}: mỗi tuần được ${fmtMoney(a.allowance)}`, 'good');
  else if (a.lv < b) UI.toast(`Tiền tiêu vặt tụt xuống cấp ${a.lv}: mỗi tuần còn ${fmtMoney(a.allowance)}`, 'bad');
}

/* ---------- thời gian ---------- */
function advanceTime(mins) {
  const steps = Math.round(mins / CFG.TICK_MIN);
  if (mins >= 30) RT.snapNpcs = true;   // thời gian nhảy xa: bố mẹ có mặt luôn ở chỗ mới
  for (let i = 0; i < steps; i++) {
    G.time += CFG.TICK_MIN; tickEvents();
    if (RT.pendingClass || RT.forceSleep) break;
  }
  UI.hud();
}
function tickEvents() {
  const t = G.time;
  if (t >= CFG.DAY_END) { RT.forceSleep = true; return; }
  checkIn();
  // 20:00 mà chưa về: bố mẹ phiền lòng — TRỪ KHI đã về nhà trước đó rồi mới đi chơi tiếp, hoặc đã xin phép
  if (t === CFG.LATE_HOME) G.daily.outAt20 = !atHome() && !G.daily.checkedIn && !G.daily.outPerm;
  socialTick(t);
  if (!schoolToday()) return;
  if (!G.daily.arrived && !G.atSchool && !RT.skip) {   // nhắc giờ buổi sáng
    if (t === 410) UI.toast('06:50 — đi bộ thì phải ra đường ngay mới kịp trước 08:00!', 'bad');
    else if (t === CFG.RIDE_DEADLINE) UI.toast('07:20 — bố mẹ sắp đi làm, không kịp nhờ chở nữa.', 'info');
    else if (t === 450) UI.toast('07:30 — chỉ còn xe bus hoặc xe riêng là kịp giờ.', 'bad');
  }
  // giờ ra chơi: thỉnh thoảng bạn rủ đi quậy
  if (G.atSchool && !RT.skip && [550, 640, 880, 970].includes(t) && G.daily.invites < INVITE_MAX_PER_DAY && Math.random() < INVITE_CHANCE) RT.pendingInvite = rollInvite();
  // giờ nghỉ trưa: thỉnh thoảng có sự kiện
  if (t === LUNCH_EVENT_TIME && G.atSchool && !RT.skip && !G.daily.lunchEv && Math.random() < LUNCH_EVENT_CHANCE) RT.pendingEvent = rollLunchEvent();
  const p = PERIODS.find(p => p.start === t);
  if (p && !G.daily.done[p.n]) { if (G.atSchool) RT.pendingClass = p; else missPeriod(p); }
}
function missPeriod(p) {
  G.daily.done[p.n] = true; G.daily.missed++;
  if (RT.skip) { RT.skip.missed.push(p.n); return; }   // đang trốn học: bị phạt hay không còn tuỳ có bị phát hiện
  const s = ttToday()[p.n - 1];
  if (G.daily.penalty < 2) { G.daily.penalty += 0.5; addConduct(-0.5, `vắng tiết ${p.n} (${SUBJ[s].name})`); }
  else UI.toast(`Vắng tiết ${p.n} (${SUBJ[s].name})`, 'bad');
}
async function activity(label, mins, fn) {
  if (RT.lock) return;
  RT.lock = true;
  await UI.progress(label, Math.min(1700, 650 + mins * 12));
  advanceTime(mins);
  if (fn) fn();
  RT.lock = false; UI.hud();
}

/* ---------- ngày mới / đi ngủ ---------- */
function resetDaily() {
  G.daily = {
    chores: {}, meals: {}, lunchbox: false, exercise: 0, done: {}, missed: 0, penalty: 0, late: false, arrived: false,
    sold: {}, chat: {}, partTime: false, field: 0, tv: false,
    pchat: {}, massage: {}, cook: false, football: false, drove: null, outAt20: false, scolded: false,
    invites: 0, fun: 0, labPractice: false,
    checkedIn: false, outPerm: false, askOut: false, momAsk: false,          // đã về nhà / đã xin phép đi chơi
    brk: {}, duel: {}, msg: {}, ask: {}, ru: {}, gift: {}, hill: {},          // giải lao, đấu thẻ, nhắn tin, rủ rê, quà, núi
    lib: false, nap: false, lunchEv: false, tipVy: false, book: false,
  };
}
function beginDay(first) {
  const c = today();
  G.time = CFG.DAY_START; resetDaily(); G.atSchool = false; G.cameBy = null;
  G.map = 'home'; G.x = 58; G.y = 76; G.dir = 0;
  RT.snapNpcs = true;
  if (c.doy === 0) G.schoolDays = 0;
  for (const s of SEMESTERS) if (c.doy === s.from) scheduleSemester(c.year, s);
  if (schoolToday()) G.schoolDays++;
  const k = semKey(G.day);
  for (const t of G.tests) if (!t.q && t.day <= G.day && t.sem === k) { t.q = true; (G.pending[t.subj] = G.pending[t.subj] || []).push(t.type); }
  for (const s in G.review) if (G.review[s] < G.day) delete G.review[s];
  socialNewDay();
  if (c.dow === 0 && !first) { const a = parentInfo(G.parent).allowance; addMoney(a, true); RT.morning.push(`Mẹ cho tiền tiêu vặt đầu tuần: +${fmtMoney(a)}`); }
  save();
}
function closeConduct() {
  const hk = hanhKiem(G.conduct);
  G.conductLog.push({ day: G.day, score: G.conduct });
  RT.morning.push(`Tổng kết hạnh kiểm 2 tuần: ${fmtScore(G.conduct)} điểm — ${hk}. Điểm được đặt lại về 10.`);
  if (hk === 'Tốt') addParent(PARENT.hkTot, '', true); else if (hk === 'Yếu') addParent(PARENT.hkYeu, '', true);
  G.conduct = 10; G.caughtCycle = 0;
}
function endDay() {
  const c = today(), reports = [];
  if (c.dow === 6) {
    let had = false; for (let d = G.day - 6; d <= G.day; d++) if (d >= 0 && isSchoolDay(d)) had = true;
    if (had) { G.conductWeeks++; if (G.conductWeeks % 2 === 0) closeConduct(); }
  }
  const sem = semOf(G.day);
  if (sem && c.doy === sem.to) {
    const key = c.year + '-' + sem.id;
    for (const s in G.pending) for (const type of G.pending[s]) recordScore(s, type, 0, key); // vắng kiểm tra → 0 điểm
    G.pending = {};
    for (const t of G.tests) if (t.sem === key) t.done = true;
    if (G.conductWeeks % 2 === 1) { closeConduct(); G.conductWeeks++; }
    reports.push({ type: 'sem', year: c.year, sem: sem.id });
    if (sem.id === SEMESTERS.length) reports.push({ type: 'year', year: c.year });
  }
  G.day++;
  return reports;
}
async function goSleep(forced) {
  RT.lock = true;
  await UI.fade(true);
  const hours = (CFG.DAY_START + 1440 - G.time) / 60, mx = maxStam();
  RT.morning = [];
  if (forced && G.map !== 'home') { addParent(PARENT.notHome, '', true); RT.morning.push('Cả đêm bạn không về nhà — bố mẹ rất lo và giận.'); }
  const reports = endDay();
  G.stamina = forced ? Math.round(mx * 0.5) : Math.min(mx, Math.round(G.stamina + mx * Math.min(1, hours / 7)));
  if (forced) RT.morning.push('Bạn thức quá 3 giờ sáng và ngủ gục. Sáng nay chỉ hồi được một nửa thể lực.');
  for (const r of reports) await showReport(r);
  beginDay(false);
  RT.scene = null; RT.outfit = null; RT.forceSleep = false; RT.pendingClass = null; RT.pendingInvite = null; RT.pendingBreak = null; RT.pendingEvent = null;
  await UI.fade(false);
  RT.lock = false; UI.hud();
  morningBrief();
}
function morningBrief() {
  const c = today();
  UI.toast(`${dateLabel(G.day)} · Lớp ${G.grade}`, 'info');
  for (const s of RT.morning) UI.toast(s, 'info');
  RT.morning = [];
  const h = holidayOf(G.day);
  if (h) UI.toast(`Hôm nay nghỉ lễ: ${h.name}`, 'good');
  else if (schoolToday()) {
    const tt = ttToday(), due = [...new Set(tt)].filter(s => (G.pending[s] || []).length);
    if (due.length) UI.toast('Hôm nay kiểm tra: ' + due.map(s => `${SUBJ[s].name} (${TEST_NAME[G.pending[s][0]]})`).join(', '), 'bad');
  } else if (c.season === 3 && c.dos === 1) UI.toast('Nghỉ hè rồi! Tự do đi chơi, học thêm hoặc kiếm tiền.', 'good');
}

/* ---------- lịch kiểm tra ---------- */
function scheduleSemester(year, sem) {
  const base = year * YEAR_DAYS, days = [];
  for (let d = sem.from; d <= sem.to; d++) if (isSchoolDay(base + d)) days.push(base + d);
  const n = days.length; if (!n) return;
  const key = year + '-' + sem.id;
  G.tests = G.tests.filter(t => t.sem !== key);
  const has = (i, s) => TIMETABLE[cal(days[i]).dow].includes(s);
  // 2 bài 1 tiết (giữa kỳ, cuối kỳ) + 1 bài thi cuối kỳ cho mỗi môn; rải đều trong 5 ngày học, ưu tiên môn ít tiết xếp trước
  for (const [type, start] of [['tiet', Math.floor(n * 0.4)], ['tiet', Math.max(0, n - 10)], ['thi', Math.max(0, n - 5)]]) {
    const win = [], load = {};
    for (let i = start; i < Math.min(n, start + 5); i++) win.push(i);
    const subs = GRADED.map(s => ({ s, c: win.filter(i => has(i, s)) })).sort((a, b) => a.c.length - b.c.length);
    for (const { s, c } of subs) {
      let cand = c;
      if (!cand.length) {
        let f = -1;
        for (let i = start + 5; i < n && f < 0; i++) if (has(i, s)) f = i;
        for (let i = start - 1; i >= 0 && f < 0; i--) if (has(i, s)) f = i;
        if (f < 0) continue; cand = [f];
      }
      let best = cand[0]; for (const i of cand) if ((load[i] || 0) < (load[best] || 0)) best = i;
      load[best] = (load[best] || 0) + 1;
      G.tests.push({ day: days[best], subj: s, type, sem: key, q: false, done: false });
    }
  }
  G.tests.sort((a, b) => a.day - b.day);
}
function upcomingTests(limit) {
  const k = semKey(G.day);
  return G.tests.filter(t => t.sem === k && !t.done).slice(0, limit || 99);
}

/* ---------- điểm số ---------- */
function recordScore(subj, type, score, key) {
  key = key || semKey(G.day); if (!key) return;
  const g = (G.grades[key] = G.grades[key] || {});
  (g[subj] = g[subj] || []).push({ t: type, s: score, d: G.day });
}
function finishTest(subj, type, s) {
  s = clamp(Math.round(s * 4) / 4, 0, 10);
  recordScore(subj, type, s);
  const t = G.tests.find(t => t.sem === semKey(G.day) && t.subj === subj && t.type === type && t.q && !t.done); if (t) t.done = true;
  if (type === 'tiet' || type === 'thi') { if (s >= 8) addParent(PARENT.goodScore, `khoe điểm ${fmtScore(s)} môn ${SUBJ[subj].short}`); else if (s < 4) addParent(PARENT.badScore, `điểm kém môn ${SUBJ[subj].short}`); }
  return s;
}
// Trừ điểm dùng chung cho mọi bài kiểm tra
function testPenalties(subj, type, notes) {
  let d = 0;
  if (G.stamina < 15) { d -= 1; notes.push('Kiệt sức: −1,0'); }
  if (G.testPen[subj]) { d -= G.testPen[subj]; notes.push(`Bị trừ điểm vì trốn tiết: −${fmtScore(G.testPen[subj])}`); delete G.testPen[subj]; }
  return d;
}
/* Làm bài kiểm tra: điểm = năng lực môn + may rủi.
 * - Năng lực môn: cấp của chỉ số môn đó.
 * - Lý thuyết / Thực hành càng cao thì càng dễ rơi vào nửa điểm trên và dễ "trúng tủ".
 * - Vẫn có lúc "học tài thi phận" (đề rơi đúng phần chưa ôn).
 * - style: 0 làm chắc (ít dao động, tối đa 9) · 1 cân bằng · 2 liều (dao động lớn, may rủi gấp đôi) */
function testScore(subj, type, o) {
  o = o || {};
  const li0 = lvlInfo(G.stats[statOfSubj(subj)]), notes = [], comp = compOf(subj), style = o.style === undefined ? 1 : o.style;
  // đề khó dần theo khối lớp: mỗi năm đòi hỏi thêm 2 cấp
  let s = 4.5 + li0.lv + li0.frac + 0.08 * comp - 2 * (G.grade - 10);
  let roll = rnd(-1, 1);
  if (Math.random() < Math.min(0.85, 0.1 + comp * 0.12)) roll = Math.max(roll, rnd(-1, 1));
  s += roll * [0.5, 0.9, 1.6][style];
  const lk = Math.random(), k = [0.5, 1, 2][style];
  if (lk < 0.06 * k) { const d = Math.round(rnd(1.5, 2.5) * 4) / 4; s -= d; notes.push(`Học tài thi phận — đề rơi đúng phần chưa ôn: −${fmtScore(d)}`); }
  else if (lk > 1 - (0.05 + comp * 0.01) * k) { const d = Math.round(rnd(1, 1.75) * 4) / 4; s += d; notes.push(`Trúng tủ: +${fmtScore(d)}`); }
  if (G.review[subj] !== undefined && G.review[subj] >= G.day) { s += 1; notes.push('Đã ôn bài: +1,0'); delete G.review[subj]; }
  if (BOOK_SUBJ.includes(subj) && !G.bag.hopbut && type !== 'mieng') { s -= 1; notes.push('Quên hộp bút: −1,0'); }
  if (o.bonus) { s += o.bonus; notes.push('Xung phong: +' + fmtScore(o.bonus)); }
  s += testPenalties(subj, type, notes) + TEST_DIFF[type] + teacherGrading(notes);
  if (style === 0) s = Math.min(s, 9);
  if (o.cheat === 'ok') {
    const vy = hearts('vy') >= 3 && !grudge('vy'), d = Math.round(rnd(CHEAT.min, CHEAT.max) * 4) / 4 + (vy ? CHEAT.vyBonus : 0);
    s += d; notes.push(`Quay cóp trót lọt${vy ? ' (Vy ném phao sang)' : ''}: +${fmtScore(d)}`);
  } else if (o.cheat === 'caught') { s = Math.max(0, s) / 2; notes.push('Bị bắt quả tang quay cóp — bài bị trừ một nửa số điểm.'); }
  return { score: finishTest(subj, type, s), notes };
}
// Thầy cô quý thì chấm nhẹ tay, bị để ý thì chấm chặt
function teacherGrading(notes) {
  const d = Math.round(TEACHER.gradePerLv * (teacherLv() - 1) * 100) / 100;
  if (d > 0) notes.push(`Thầy cô quý nên chấm nhẹ tay: +${fmtScore(d)}`); else if (d < 0) notes.push(`Bị thầy cô để ý nên chấm chặt: −${fmtScore(-d)}`);
  return d;
}
const cheatRisk = () => clamp(TEACHER.cheatBase - TEACHER.cheatPerLv * (teacherLv() - 1) - 0.02 * hearts('khoa') + 0.05 * G.caughtCycle, 0.05, 0.75);
// Quay cóp: trả về kết quả bài làm + các dòng thông báo hậu quả
function cheatTest(subj, type, L) {
  const caught = Math.random() < cheatRisk();
  const r = testScore(subj, type, { style: 1, cheat: caught ? 'caught' : 'ok' });
  if (caught) {
    G.caughtCycle++; addConduct(CHEAT.conduct, 'quay cóp trong giờ kiểm tra'); addTeacher(TEACHER.caughtCheat);
    L.push(li('Giám thị thu phao và lập biên bản: hạnh kiểm −1, thầy cô mất thiện cảm.', 'bad'));
    if (Math.random() < CHEAT.parentCall) { addParent(PARENT.teacherCall, 'nhà trường báo việc quay cóp'); L.push(li('Nhà trường gọi điện báo phụ huynh.', 'bad')); }
  } else L.push(li('Liếc bài bạn bên cạnh, giở phao dưới gầm bàn… không ai phát hiện.', 'warn'));
  return r;
}
// Bài kiểm tra thực hành (Quốc phòng): điểm dựa vào kết quả minigame
function practicalTestScore(subj, type, r) {
  const notes = [];
  let s = 3 + 4.2 * r.progress + 0.3 * lv(statOfSubj(subj)) + 0.08 * thucHanh() + (r.perfect ? 0.8 : 0) + rnd(-0.3, 0.3) - 0.6 * (G.grade - 10);
  notes.push(r.win ? (r.perfect ? 'Thao tác hoàn hảo.' : 'Hoàn thành bài thực hành.') : `Chưa hoàn thành (được ${Math.round(r.progress * 100)}%).`);
  if (subj === 'qp' && !G.bag.dp_qp) { s -= 1; notes.push('Sai trang phục: −1,0'); }
  s += testPenalties(subj, type, notes) + teacherGrading(notes);
  return { score: finishTest(subj, type, s), notes };
}
const r1 = v => (v === null ? null : Math.round(v * 10) / 10);
function subjAvg(key, subj) {
  const a = (G.grades[key] || {})[subj]; if (!a || !a.length) return null;
  let s = 0, c = 0; for (const g of a) { s += g.s * COEF[g.t]; c += COEF[g.t]; }
  return r1(s / c);
}
function semReport(key) {
  const rows = {}; let sum = 0, n = 0;
  for (const s of GRADED) { const v = subjAvg(key, s); rows[s] = v; if (v !== null) { sum += v; n++; } }
  const avg = n ? r1(sum / n) : null;
  return { rows, avg, hl: hocLuc(avg, rows.toan, rows.van) };
}
// Cả năm: (HK1 + 2 × HK2) / 3
function yearReport(year) {
  const a = semReport(year + '-1'), b = semReport(year + '-2'), rows = {}; let sum = 0, n = 0;
  for (const s of GRADED) {
    const v1 = a.rows[s], v2 = b.rows[s];
    const v = (v1 !== null && v2 !== null) ? r1((v1 + 2 * v2) / 3) : (v1 !== null ? v1 : v2);
    rows[s] = v; if (v !== null) { sum += v; n++; }
  }
  const avg = n ? r1(sum / n) : null;
  return { rows, avg, hl: hocLuc(avg, rows.toan, rows.van), hk1: a, hk2: b };
}
function conductAvg(year, semId) {
  const a = G.conductLog.filter(e => cal(e.day).year === year && (!semId || (semOf(e.day) || {}).id === semId));
  return a.length ? r1(avgOf(a.map(e => e.score))) : r1(G.conduct);
}
function reportTable(rows, extraCols) {
  let h = '<table class="tb"><tr><th>Môn</th>' + (extraCols ? '<th>HK1</th><th>HK2</th>' : '') + '<th>Trung bình</th></tr>';
  for (const s of GRADED) h += `<tr><td>${SUBJ[s].name}</td>` + (extraCols ? `<td>${fmtAvg(extraCols[0].rows[s])}</td><td>${fmtAvg(extraCols[1].rows[s])}</td>` : '') + `<td><b>${fmtAvg(rows[s])}</b></td></tr>`;
  return h + '</table>';
}
async function showReport(r) {
  if (r.type === 'sem') {
    const rep = semReport(r.year + '-' + r.sem), hk = conductAvg(r.year, r.sem);
    const react = { 'Giỏi': [PARENT.semGioi, 'Bố mẹ rất tự hào về kết quả học kỳ này.'], 'Khá': [PARENT.semKha, 'Bố mẹ hài lòng với kết quả học kỳ này.'], 'Yếu': [PARENT.semYeu, 'Bố mẹ rất buồn vì kết quả học kỳ này.'] }[rep.hl];
    if (react) addParent(react[0], '', true);
    const html = reportTable(rep.rows) + `<div class="sum"><span>Điểm tổng kết <b>${fmtAvg(rep.avg)}</b></span><span>Học lực <b class="tag">${rep.hl}</b></span><span>Hạnh kiểm <b class="tag">${hanhKiem(hk)}</b> (${fmtAvg(hk)})</span></div>` + (react ? `<p>${react[1]} (thiện cảm ${react[0] > 0 ? '+' : '−'}${Math.abs(react[0])})</p>` : '');
    await UI.ask(`Tổng kết ${SEMESTERS[r.sem - 1].name} · Lớp ${G.grade}`, html, ['Tiếp tục']);
  } else {
    const rep = yearReport(r.year), hk = conductAvg(r.year, 0), hkx = hanhKiem(hk);
    const pass = rep.hl !== 'Yếu' && rep.hl !== '–' && hkx !== 'Yếu';
    let title = '';
    if (rep.hl === 'Giỏi' && hkx === 'Tốt') title = 'Học sinh Giỏi';
    else if ((rep.hl === 'Giỏi' || rep.hl === 'Khá') && (hkx === 'Tốt' || hkx === 'Khá')) title = 'Học sinh Tiên tiến';
    const g0 = G.grade; let msg;
    if (pass) { if (G.grade >= 12) { G.graduated = true; msg = 'Chúc mừng! Bạn đã <b>tốt nghiệp THPT</b>. Bạn có thể chơi tiếp để hoàn thiện các chỉ số.'; } else { G.grade++; msg = `Bạn được <b>lên lớp ${G.grade}</b>. Nghỉ hè thôi!`; } }
    else msg = `Học lực hoặc hạnh kiểm loại Yếu — bạn phải <b>học lại lớp ${G.grade}</b>.`;
    G.reports.push({ year: r.year, grade: g0, avg: rep.avg, hl: rep.hl, hk: hkx, title });
    const html = reportTable(rep.rows, [rep.hk1, rep.hk2]) + `<div class="sum"><span>Điểm tổng kết cả năm <b>${fmtAvg(rep.avg)}</b></span><span>Học lực <b class="tag">${rep.hl}</b></span><span>Hạnh kiểm <b class="tag">${hkx}</b> (${fmtAvg(hk)})</span></div>` + (title ? `<p class="big">Danh hiệu: <b>${title}</b></p>` : '') + `<p>${msg}</p><p class="dim">Cả năm = (HK1 + 2 × HK2) / 3.</p>`;
    await UI.ask(`Tổng kết năm học · Lớp ${g0}`, html, ['Nghỉ hè']);
  }
}

/* ---------- vào tiết học ---------- */
const TEACHER_OF = { toan: 'teacherC', van: 'teacherA', anh: 'teacherB', ly: 'teacherC', hoa: 'teacherB', sinh: 'teacherA', su: 'teacherC', dia: 'teacherB', shl: 'teacherA' };
const MATE_LOOKS = ['khoa', 'vy', 'dat', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'];
function formation(x0, y0, dx, dy, cols, rows, skipC, skipR, outfit) {
  const a = []; let k = 0;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { if (c === skipC && r === skipR) continue; a.push({ look: MATE_LOOKS[k++ % MATE_LOOKS.length], outfit, x: x0 + c * dx, y: y0 + r * dy, dir: 3 }); }
  return a;
}
function placeForClass(subj) {
  const S = SUBJ[subj];
  if (subj === 'cc') {
    setMap('school', 328, 228, 3);
    RT.scene = { type: 'yard', map: 'school', actors: formation(280, 206, 24, 22, 6, 4, 2, 1).concat([{ look: 'teacherA', x: 352, y: 186, dir: 0 }]) };
  } else if (subj === 'td' || subj === 'qp' || subj === 'th_qp') {
    const of = subj === 'td' ? 'td' : 'qp';
    setMap('school', 572, 244, 3);
    RT.outfit = G.bag['dp_' + of] ? of : null;
    RT.scene = { type: 'yard', map: 'school', actors: formation(520, 220, 26, 24, 6, 4, 2, 1, of).concat([{ look: of === 'td' ? 'teacherM' : 'teacherQ', x: 585, y: 192, dir: 0 }]) };
  } else if (S.lab) {
    setMap('lab', LAB_SPOT.x, LAB_SPOT.y, 3);
    const actors = []; let k = 0;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) for (let sd = 0; sd < 2; sd++) { if (c === 1 && r === 1 && sd === 0) continue; actors.push({ look: MATE_LOOKS[k++ % MATE_LOOKS.length], x: LAB_X[c] + 12 + sd * 22, y: LAB_Y[r] + 34, dir: 3 }); }
    actors.push({ look: TEACHER_OF[S.base] || 'teacherB', x: 200, y: 52, dir: 0 });
    RT.scene = { type: 'lab', map: 'lab', actors, cam: { x: 160, y: 80 } };
  } else {
    setMap('class', SEAT.x, SEAT.y, 3);
    RT.scene = { type: 'class', teacher: TEACHER_OF[subj] || 'teacherA', cam: { x: 160, y: 80 } };   // camera nhìn lên bảng
  }
}
async function runClass(p) {
  RT.lock = true;
  G.daily.done[p.n] = true;
  const subj = ttToday()[p.n - 1], S = SUBJ[subj], title = `Tiết ${p.n} · ${S.name}`;
  await UI.fade(true); placeForClass(subj); await UI.fade(false);
  await UI.progress(title, 1700, S.color);
  const html = await resolveClass(p, subj);
  await UI.ask(title, html, ['Tiếp tục']);
  RT.scene = null; RT.outfit = null;
  advanceTime(PERIOD_LEN);
  RT.lock = false; UI.hud();
  if (p.n === 4) UI.toast('Nghỉ trưa đến 13:30. Ghé căn tin ăn trưa nhé!', 'info');
  if (p.n === 9) UI.toast('Tan học! Giờ rủ bạn đi đâu chơi cũng được. Nhớ về nhà trước 20:00 (hoặc xin phép bố mẹ).', 'good');
  if (SHORT_BREAK_AFTER.includes(p.n)) shortBreak();
}
const li = (s, cls) => `<li class="${cls || ''}">${s}</li>`;
const scoreLi = (label, sc) => `<li class="scoreline">${label} <span class="score">${fmtScore(sc)}</span></li>`;
async function resolveClass(p, subj) {
  const L = [], S = SUBJ[subj], stat = statOfSubj(subj), wrap = () => '<ul class="res">' + L.join('') + '</ul>';
  /* --- Chào cờ --- */
  if (subj === 'cc') {
    L.push(li('Cả trường xếp hàng chào cờ đầu tuần.'));
    const wk = upcomingTests().filter(t => t.day >= G.day && t.day < G.day + 7);
    if (wk.length) L.push(li('Thông báo lịch kiểm tra tuần này: ' + wk.map(t => `<b>${SUBJ[t.subj].short}</b> ${DOW[cal(t.day).dow]} (${TEST_NAME[t.type]})`).join(', '), 'warn'));
    else L.push(li('Tuần này chưa có bài kiểm tra nào được xếp lịch.'));
    return wrap();
  }
  /* --- Sinh hoạt lớp --- */
  if (subj === 'shl') {
    L.push(li(`Cô chủ nhiệm tổng kết tuần. Điểm hạnh kiểm hiện tại của bạn: <b>${fmtScore(G.conduct)}</b> — ${hanhKiem(G.conduct)}.`));
    L.push(li(G.conductWeeks % 2 === 1 ? 'Cuối tuần này sẽ chốt hạnh kiểm 2 tuần và đặt lại về 10.' : 'Hạnh kiểm được chốt 2 tuần một lần.'));
    if (G.caughtCycle) L.push(li(`Kỳ này bạn đã bị bắt lỗi ${G.caughtCycle} lần — tái phạm sẽ bị phạt nặng hơn.`, 'warn'));
    else if (G.daily.missed === 0 && !G.daily.late) L.push(li('Tuần này bạn đi học đều — cô khen trước lớp.', 'good'));
    return wrap();
  }
  /* --- buổi thực hành riêng: minigame --- */
  if (PRACTICALS[subj]) {
    if (subj === 'th_qp' && !G.bag.dp_qp) { L.push(li('Quên đồ quốc phòng — không được vào thực hành, chỉ đứng ngoài quan sát.', 'bad')); addStat('qp', 1); useStam(2); return wrap(); }
    const r = await practicalSession(subj, false);
    L.push(...r.lines); useStam(subj === 'th_qp' ? 5 : 3, subj === 'th_qp');
    return wrap();
  }
  const tired = G.stamina < 10;
  /* --- bài kiểm tra đã xếp lịch (1 tiết / thi) --- */
  const pend = G.pending[subj];
  if (pend && pend.length) {
    const type = pend.shift(); let r;
    L.push(li(`<b>${TEST_NAME[type]}</b> · hệ số ${COEF[type]}`, 'warn'));
    if (subj === 'qp') {
      const d = type === 'thi' ? 4 : 3;
      await UI.ask(`${TEST_NAME[type]} · Quốc phòng`, `<p>Kiểm tra thực hành: ${PRACTICALS.th_qp.task.toLowerCase()}.</p><p>Độ khó: <span class="stars">${starStr(d)}</span></p>${MG_HELP}`, ['Bắt đầu']);
      r = practicalTestScore(subj, type, await UI.minigame({ title: 'Kiểm tra thực hành Quốc phòng', task: PRACTICALS.th_qp.task, icon: 'nhip', diff: d, level: lv('qp'), tired }));
    } else if (subj === 'td') r = testScore(subj, type, {});
    else {
      const style = await UI.ask(`${TEST_NAME[type]} · ${S.name}`, `<p>Phát đề rồi. Bạn làm bài theo cách nào?</p><p class="dim">Điểm phụ thuộc vào cấp môn ${S.short} của bạn cộng với may rủi. ${THEORY.includes(subj) && subj !== 'ly' && subj !== 'hoa' ? 'Lý thuyết' : 'Lý thuyết và Thực hành'} càng cao thì càng dễ gặp may.</p><p class="dim">Quay cóp: trót lọt được cộng ${fmtScore(CHEAT.min)}–${fmtScore(CHEAT.max)} điểm; bị bắt thì bài bị trừ một nửa, hạnh kiểm −1. Thầy cô càng quý (đang cấp ${teacherLv()}) thì càng khó bị bắt.</p>`,
        ['Làm chắc từng câu — ít rủi ro, tối đa 9 điểm', 'Cân bằng', 'Liều các câu khó — được ăn cả, ngã về không', `Quay cóp — liếc bài bạn, dùng phao (nguy cơ bị bắt ${Math.round(cheatRisk() * 100)}%)`], { esc: 1 });
      r = style === 3 ? cheatTest(subj, type, L) : testScore(subj, type, { style: style < 0 || style > 2 ? 1 : style });
    }
    L.push(scoreLi('Điểm của bạn:', r.score));
    r.notes.forEach(n => L.push(li(n, 'dim')));
    addStat(stat, 2); useStam(subj === 'td' || subj === 'qp' ? 6 : 3, subj === 'td' || subj === 'qp');
    return wrap();
  }
  /* --- học bình thường --- */
  let gain = 0;
  if (subj === 'td') {
    if (G.bag.dp_td) { gain = 5; L.push(li('Mặc đồng phục thể dục đầy đủ.', 'good')); }
    else { gain = 0; L.push(li('Quên đồng phục thể dục — bị nhắc nhở, không được cộng điểm Thể thao.', 'bad')); }
    useStam(8, true);
  } else if (subj === 'qp') {
    if (G.bag.dp_qp) { gain = 5; L.push(li('Mặc áo lính đúng quy định, học điều lệnh đội ngũ.', 'good')); }
    else { gain = 1; L.push(li('Quên đồ quốc phòng — chỉ được đứng ngoài quan sát.', 'bad')); }
    useStam(5, true);
  } else {
    const hasBook = !!G.bag['sach_' + subj], hasVoRaw = !!G.bag['vo_' + subj], hasVo = hasVoRaw && !!G.bag.hopbut;
    if (hasBook && hasVo) { gain = 5; L.push(li('Mang đủ sách và vở.', 'good')); }
    else if (!hasBook && hasVo) { const b = await askBorrow(subj, 'sach'); gain = b.gain; L.push(...b.lines); }      // quên sách: quay sang hỏi mượn bạn
    else if (hasBook && hasVoRaw) { const b = await askBorrow(subj, 'but'); gain = b.gain; L.push(...b.lines); }     // có vở nhưng quên hộp bút: mượn bút
    else if (hasBook) { gain = 3; L.push(li('Quên vở — chỉ theo dõi được trong sách.', 'warn')); }
    else { gain = -2; L.push(li('Không mang cả sách lẫn vở — bị cô phê bình.', 'bad')); }
    useStam(3);
    // bạn rủ làm việc riêng trong giờ
    // trong giờ: bạn rủ làm việc riêng, hoặc một sự kiện nho nhỏ của tiết học
    const ev = Math.random();
    if (ev < CLASS_FUN_CHANCE) { const f = await classFun(); L.push(...f.lines); if (gain > 0) gain = Math.max(1, gain + f.delta); }
    else if (ev < CLASS_FUN_CHANCE + CLASS_EVENT_CHANCE) { const f = await classEvent(subj); L.push(...f.lines); if (gain > 0) gain = Math.max(1, gain + f.delta); }
  }
  if (tired && gain > 1) { gain = Math.max(1, Math.floor(gain / 2)); L.push(li('Bạn quá mệt, ngủ gật trong giờ — tiếp thu giảm một nửa.', 'bad')); }
  if (gain) { addStat(stat, gain); L.push(li(`${gain > 0 ? '+' : ''}${gain} điểm ${STAT_NAMES[stat]}`, gain > 0 ? 'good' : 'bad')); }
  /* --- kiểm tra đột xuất: miệng (sau tuần 1), 15' (sau tuần 2) --- */
  const key = semKey(G.day), q = (G.quiz[key] = G.quiz[key] || {}), qs = (q[subj] = q[subj] || { mieng: 0, p15: 0 });
  const roll = Math.random();
  if (roll < 0.10 && qs.p15 < 3 && G.schoolDays > CFG.P15_AFTER_SCHOOLDAYS) {
    qs.p15++; const r = testScore(subj, 'p15', {});
    L.push(li('<b>Kiểm tra 15 phút đột xuất!</b> Làm bài xong cả lớp học tiếp.', 'warn'));
    L.push(scoreLi("Điểm 15':", r.score)); r.notes.forEach(n => L.push(li(n, 'dim')));
  } else if (roll >= 0.10 && roll < 0.30 && qs.mieng < 2 && subj !== 'td' && G.schoolDays > CFG.ORAL_AFTER_SCHOOLDAYS) {
    const c = await UI.ask('Kiểm tra miệng', `<p>${subj === 'qp' ? 'Thầy' : 'Cô'} nhìn quanh lớp: “Bạn nào xung phong lên trả bài nào?”</p><p class="dim">Xung phong được cộng 0,5 điểm và điểm Giao tiếp.</p>`, ['Xung phong!', 'Ngồi im']);
    let called = false, bonus = 0;
    if (c === 0) { called = true; bonus = 0.5; }
    else if (Math.random() < 0.2) { called = true; L.push(li('Bạn bị gọi tên lên bảng!', 'warn')); }
    else L.push(li('Một bạn khác được gọi lên bảng. Thoát!', 'dim'));
    if (called) {
      qs.mieng++; const r = testScore(subj, 'mieng', { bonus });
      L.push(scoreLi('Điểm miệng:', r.score)); r.notes.forEach(n => L.push(li(n, 'dim')));
      if (bonus) { addStat('giaotiep', 3); addTeacher(TEACHER.volunteer); if (G.conduct < 10) addConduct(0.25, 'xung phong phát biểu'); }
    }
  }
  return wrap();
}

/* ---------- đến trường / về nhà ---------- */
function busFare() {
  if (G.busPassUntil >= G.day) {
    if (G.bag.vethang) return { cost: 0, note: 'Vé tháng còn hạn' };
    return { cost: G.bag.thehs ? BUS_FARE_CARD : BUS_FARE_NOCARD, note: 'Quên mang vé tháng!' };
  }
  return G.bag.thehs ? { cost: BUS_FARE_CARD, note: 'Có thẻ học sinh' } : { cost: BUS_FARE_NOCARD, note: 'Không mang thẻ học sinh' };
}
function transportOptions(toSchool) {
  const out = [], mine = ['bike', 'ebike', 'moto'].includes(G.cameBy);
  const add = (id, ok, why, cost, note) => out.push({ id, name: TRANSPORT[id].name, mins: TRANSPORT[id].mins, cost, ok, why, note });
  add('walk', toSchool || !mine, 'Phải mang xe về', 0);
  for (const id of ['bike', 'ebike', 'moto']) {
    const T = TRANSPORT[id];
    if (!G.owned[T.own]) add(id, false, 'Chưa có xe', toSchool ? T.cost : 0);
    else if (toSchool) add(id, G.money >= T.cost, 'Không đủ tiền gửi xe', T.cost, 'Phí gửi xe');
    else add(id, G.cameBy === id, 'Xe đang để ở nhà', 0);
  }
  const f = busFare(); add('bus', (toSchool || !mine) && G.money >= f.cost, mine && !toSchool ? 'Phải mang xe về' : 'Không đủ tiền vé', f.cost, f.note);
  return out;
}
ACT.goSchool = async () => {
  if (RT.lock) return;
  if (!schoolToday()) return UI.say('Đường đến trường', 'Hôm nay không phải ngày đi học. Trường đóng cửa.');
  if (G.time >= CFG.SCHOOL_END) return UI.say('Đường đến trường', 'Trường đã tan học rồi.');
  const miss = missingToday();
  const warn = miss.length ? `<p class="warnbox">Cặp còn thiếu: ${miss.map(i => ITEMS[i].name).join(', ')}</p>` : '';
  const c = await UI.transport('Đi học bằng gì?', `<p>Bây giờ là <b>${fmtTime(G.time)}</b>. Phải có mặt ở trường <b>trước 08:00</b> — tiết 1 bắt đầu đúng 08:00.</p>` + warn, transportOptions(true));
  if (c) travel(c, true);
};
ACT.leaveSchool = async () => {
  if (RT.lock) return;
  if (schoolToday() && G.time < CFG.SCHOOL_END) return UI.say('Bác bảo vệ', '“Chưa tan học đâu cháu, quay vào lớp đi!”<p class="dim">Cổng trường mở lúc 17:00. Muốn ra ngoài trong giờ thì… phải rủ bạn (hoặc được bạn rủ) trốn.</p>');
  const c = await UI.transport('Về nhà bằng gì?', `<p>Bây giờ là <b>${fmtTime(G.time)}</b>. Nhớ về nhà trước 20:00.</p>`, transportOptions(false));
  if (c) travel(c, false);
};
function arriveSchool() {
  G.daily.arrived = true;
  if (G.time >= CFG.GATE_TIME && !G.daily.late) { G.daily.late = true; addConduct(-0.5, 'đi học muộn (từ 08:00 trở đi)'); }
  else UI.toast('Đến trường đúng giờ.', 'good');
}
async function travel(id, toSchool) {
  const T = TRANSPORT[id];
  let cost = 0;
  if (id === 'bus') cost = busFare().cost; else if (toSchool) cost = T.cost || 0;
  RT.lock = true;
  if (cost) addMoney(-cost, true);
  await UI.fade(true);
  await UI.progress(`${T.name} ${toSchool ? 'đến trường' : 'về nhà'}…`, 1100);
  if (toSchool) {
    advanceTime(T.mins - CFG.TICK_MIN);
    G.atSchool = true; G.cameBy = id; setMap('school', 352, 374, 3);
    advanceTime(CFG.TICK_MIN); arriveSchool();
  } else {
    G.atSchool = false; advanceTime(T.mins);
    if (id === 'bus') setMap('town', 632, 192, 0); else if (id === 'walk') setMap('town', 34, 186, 2); else setMap('town', 96, 152, 0);
    G.cameBy = null;
  }
  RT.snapNpcs = true;
  await UI.fade(false);
  RT.lock = false; UI.hud();
}

/* ---------- soạn cặp ---------- */
function packTargetDay() {
  if (schoolToday() && G.time < PERIODS[0].start && !G.daily.arrived) return G.day;
  for (let d = G.day + 1; d < G.day + 60; d++) if (isSchoolDay(d)) return d;
  return null;
}
function neededItems(day) {
  if (day === null || !isSchoolDay(day)) return [];
  const tt = TIMETABLE[cal(day).dow], need = ['hopbut', 'thehs'];
  for (const s of BOOK_SUBJ) if (tt.includes(s)) need.push('sach_' + s, 'vo_' + s);
  if (tt.includes('td')) need.push('dp_td');
  if (tt.includes('qp') || tt.includes('th_qp')) need.push('dp_qp');
  if (G.busPassUntil >= day) need.push('vethang');
  return need;
}
function missingToday() { return neededItems(G.day).filter(i => !G.bag[i] && i !== 'thehs' && i !== 'vethang'); }
function quickPack(day) { G.bag = {}; for (const i of neededItems(day)) G.bag[i] = true; }

/* ---------- ăn uống ---------- */
function mealNow() {
  if (!G) return null;
  const t = G.time, sd = schoolToday(), m = G.daily.meals;
  if (inWin(t, 300, sd ? 490 : 580) && !m.sang) return { id: 'sang', name: 'Bữa sáng', stam: 25, mins: 10 };
  if (!sd && inWin(t, 660, 820) && !m.trua) return { id: 'trua', name: 'Bữa trưa', stam: 30, mins: 20 };
  if (inWin(t, 1080, 1300) && !m.toi) return { id: 'toi', name: 'Bữa tối', stam: 30, mins: 20 };
  return null;
}
function mealLabel() { const m = mealNow(); return m ? `${m.name} mẹ nấu — ăn ${m.mins}' (+${m.stam} thể lực)` : 'Bàn ăn'; }
ACT.table = async () => {
  const m = mealNow();
  if (!m) return UI.say('Bàn ăn', 'Chưa đến bữa.<p class="dim">Sáng 05:00–08:00 · Trưa (ngày nghỉ) 11:00–13:30 · Tối 18:00–21:30</p>');
  await activity(`Đang ăn ${m.name.toLowerCase()}…`, m.mins, () => { G.daily.meals[m.id] = true; gainStam(m.stam); });
};
function lunchboxAvail() { return !!G && schoolToday() && G.time < 470 && !G.daily.lunchbox; }
ACT.lunchbox = () => { G.daily.lunchbox = true; G.inv.comhop++; UI.toast('Đã lấy cơm hộp mẹ nấu. Mở Cặp sách để ăn vào giờ nghỉ trưa.', 'good'); };
function eat(id) {
  const f = FOODS[id]; if (!f || !G.inv[id]) return;
  G.inv[id]--; gainStam(f.stam); UI.toast(`Đã dùng ${f.name}: +${f.stam} thể lực`, 'good'); UI.hud();
}

/* ---------- việc nhà, tập luyện, học ---------- */
const choreStam = c => Math.max(1, Math.round(c.stam * (1 - 0.05 * lv('kheotay'))));
function choreLabel(id) { const c = CHORES[id]; if (G && G.daily.chores[id]) return c.name + ' — hôm nay làm rồi'; return `${c.name} — ${c.mins}' · +${fmtMoney(c.pay)}`; }
ACT.chore = async id => {
  const c = CHORES[id];
  if (G.daily.chores[id]) return UI.toast('Việc này hôm nay bạn đã làm rồi.');
  const cost = choreStam(c);
  if (G.stamina < cost) return UI.toast('Không đủ thể lực. Ăn gì đó hoặc nghỉ ngơi đã!', 'bad');
  await activity(`Đang ${c.name.toLowerCase()}…`, c.mins, () => { G.daily.chores[id] = true; useStam(cost, true); addMoney(c.pay); addStat('kheotay', c.kt); addParent(PARENT.chore, '', true); });
};
ACT.exercise = async () => {
  if (G.daily.exercise >= EXERCISE_MAX_PER_DAY) return UI.toast('Hôm nay tập đủ rồi, mai tập tiếp.');
  if (G.stamina < EXERCISE_STAM) return UI.toast('Không đủ thể lực để tập.', 'bad');
  const opts = EXERCISES.filter(e => !e.need || G.owned[e.need]);
  const c = await UI.ask('Tập thể dục', `<p>Mỗi buổi ${EXERCISE_MIN} phút, tốn ${EXERCISE_STAM} thể lực. Hôm nay đã tập ${G.daily.exercise}/${EXERCISE_MAX_PER_DAY} buổi.</p><p class="dim">Mua thêm đạo cụ ở tạp hoá để được cộng nhiều điểm hơn.</p>`, opts.map(e => `${e.name} · +${e.pts} Thể thao`).concat('Thôi'));
  if (c < 0 || c >= opts.length) return;
  await activity('Đang tập thể dục…', EXERCISE_MIN, () => { G.daily.exercise++; useStam(EXERCISE_STAM, true); addStat('thethao', opts[c].pts); });
};
async function studyMenu(mins, pts, stam, review) {
  if (G.stamina < stam) return UI.toast('Mệt quá, không học nổi nữa.', 'bad');
  const up = upcomingTests(6);
  const hint = up.length ? '<p class="dim">Sắp kiểm tra: ' + up.map(t => `${SUBJ[t.subj].short} (${dateLabel(t.day)})`).join(' · ') + '</p>' : '';
  const c = await UI.ask('Chọn môn để học', `<p>${mins} phút · +${pts} điểm môn học · −${stam} thể lực${review ? ' · ôn bài giúp +1 điểm nếu kiểm tra môn đó trong hôm nay hoặc ngày mai' : ''}.</p>` + hint, BOOK_SUBJ.map(s => SUBJ[s].name).concat('Thôi'), { grid: true });
  if (c < 0 || c >= BOOK_SUBJ.length) return;
  const s = BOOK_SUBJ[c];
  await activity(`Đang học ${SUBJ[s].name}…`, mins, () => { useStam(stam); addStat(s, pts); if (review) G.review[s] = G.day + 1; });
}
ACT.desk = async () => {
  const c = await UI.ask('Bàn học', '<p>Bạn muốn làm gì?</p>', ['Soạn cặp sách', `Tự học / ôn bài (${SELF_STUDY.mins} phút)`, 'Xem thời khoá biểu', 'Thôi']);
  if (c === 0) UI.pack(); else if (c === 1) studyMenu(SELF_STUDY.mins, SELF_STUDY.pts, SELF_STUDY.stam, true); else if (c === 2) UI.timetable();
};
ACT.bed = async () => {
  if (G.time < CFG.SLEEP_FROM) return UI.say('Giường', `Trời còn sáng, chưa ngủ được.<p class="dim">Có thể đi ngủ từ ${fmtTime(CFG.SLEEP_FROM)}. Muộn nhất 03:00 sáng bạn sẽ tự ngủ gục.</p>`);
  const c = await UI.ask('Đi ngủ?', `<p>Ngủ đến 05:00 sáng mai. Ngủ đủ 7 tiếng sẽ hồi đầy thể lực.</p><p class="dim">Game tự lưu mỗi sáng.</p>`, ['Đi ngủ', 'Chưa']);
  if (c === 0) goSleep(false);
};
ACT.mydesk = async () => {
  const np = nextPeriod();
  const opts = ['Ngồi chờ đến tiết sau', 'Tự học 30 phút'], ids = ['wait', 'study'];
  if (schoolToday() && inWin(G.time, 640, 780) && !G.daily.nap) { opts.push(`Ngủ trưa ${NAP.mins}' (+${NAP.stam} thể lực)`); ids.push('nap'); }
  opts.push('Thôi'); ids.push('x');
  const c = ids[await UI.ask('Bàn của bạn', np ? `<p>Tiết tiếp theo: <b>Tiết ${np.n} · ${SUBJ[ttToday()[np.n - 1]].name}</b> lúc ${fmtTime(np.start)}.</p>` : '<p>Hôm nay không còn tiết nào.</p>', opts)];
  if (c === 'wait') {
    if (!np) return UI.toast('Hôm nay hết tiết rồi.');
    RT.lock = true; await UI.progress('Ngồi chờ vào tiết…', 700); advanceTime(np.start - G.time); RT.lock = false;
  } else if (c === 'study') studyMenu(30, 2, 4, false);
  else if (c === 'nap') await activity('Đang gục xuống bàn ngủ trưa…', NAP.mins, () => { G.daily.nap = true; gainStam(NAP.stam); });
};
ACT.field = async () => {
  if (G.daily.field >= 2) return UI.toast('Hôm nay chơi thể thao ở trường đủ rồi.');
  if (G.stamina < 8) return UI.toast('Không đủ thể lực.', 'bad');
  await activity('Đang chơi thể thao…', 20, () => { G.daily.field++; useStam(8, true); addStat('thethao', 3); });
};

/* ---------- thầy cô, bảo vệ ---------- */
ACT.teacher = () => {
  const up = upcomingTests(5);
  UI.say('Cô chủ nhiệm', '“Em nhớ theo dõi lịch kiểm tra trên bảng tin nhé.”' + (up.length ? '<p class="dim">Sắp tới: ' + up.map(t => `${SUBJ[t.subj].short} — ${TEST_NAME[t.type]} (${dateLabel(t.day)})`).join(' · ') + '</p>' : ''));
};
ACT.guard = () => UI.say('Bác bảo vệ', schoolToday() && G.time < CFG.SCHOOL_END ? '“Vào lớp đi cháu. 5 giờ chiều bác mới mở cổng.”' : '“Tan học rồi, về cẩn thận nhé cháu.”');

/* ---------- bạn bè & buôn bán ---------- */
function sellPrice() { return SELL.price + SELL.pricePerLv * lv('buonban'); }
async function trySell(sid, fid) {
  if (G.daily.sold[sid]) return UI.toast('Bạn ấy hôm nay mua rồi.');
  if (!G.inv.banhtrang) return UI.toast('Hết bánh tráng để bán. Mua thêm ở tạp hoá.');
  G.daily.sold[sid] = true;
  if (G.atSchool && Math.random() < SELL.caught) { G.inv.banhtrang--; addConduct(-0.5, 'bán hàng trong trường bị giám thị bắt'); return; }
  const ch = SELL.baseChance + 0.05 * lv('buonban') + (fid ? 0.05 * hearts(fid) : 0);
  if (Math.random() < ch) { G.inv.banhtrang--; addMoney(sellPrice()); addStat('buonban', 4); UI.toast('Bán được một bịch bánh tráng!', 'good'); }
  else { addStat('buonban', 1); UI.toast('Bạn ấy lắc đầu: “Hôm nay tớ hết tiền rồi.”'); }
}
function chat(sid, fid) {
  if (G.daily.chat[sid]) return UI.toast('Hai đứa vừa nói chuyện xong rồi.');
  G.daily.chat[sid] = true; addStat('giaotiep', fid ? 2 : 1);
  if (fid) { addFriend(fid, 3); UI.toast(`Trò chuyện với ${FRIENDS[fid].name} vui ghê. Thân thiết +3`, 'good'); }
  else UI.toast('Tán gẫu vài câu với bạn cùng lớp.');
}
// ACT.mate / ACT.friend: xem 04c_social.js

/* ---------- cửa hàng, học thêm, căn tin ---------- */
ACT.shop = () => { if (!inWin(G.time, 360, 1260)) return UI.say('Tạp hoá Cô Ba', 'Tiệm đóng cửa rồi.<p class="dim">Mở cửa 06:00–21:00</p>'); UI.shop(); };
function buy(it) {
  if (it.own && G.owned[it.own]) return UI.toast('Bạn đã có món này rồi.');
  if (it.special === 'vethang' && G.busPassUntil >= G.day) return UI.toast('Vé tháng vẫn còn hạn đến ' + dateLabel(G.busPassUntil) + '.');
  if (G.money < it.price) return UI.toast('Không đủ tiền.', 'bad');
  addMoney(-it.price, true);
  if (it.inv) G.inv[it.inv] = (G.inv[it.inv] || 0) + it.n;
  if (it.own) G.owned[it.own] = true;
  if (it.special === 'vethang') { G.busPassUntil = G.day + BUS_PASS_DAYS - 1; G.bag.vethang = true; }
  UI.toast(`Đã mua ${it.name} (−${fmtMoney(it.price)})`, 'good'); UI.hud();
  if (it.pack) packToast(openPacks(it.pack));        // bim bim Sao Vàng: mỗi gói kèm 1 thẻ cầu thủ
}
async function partTime() {
  if (schoolToday()) return UI.toast('Cô Ba chỉ nhận phụ bán vào ngày nghỉ.');
  if (!inWin(G.time, 480, 1080)) return UI.toast('Phụ bán từ 08:00 đến 18:00.');
  if (G.daily.partTime) return UI.toast('Hôm nay bạn đã phụ bán rồi.');
  if (G.stamina < PART_TIME.stam) return UI.toast('Không đủ thể lực.', 'bad');
  UI.close();
  await activity('Đang phụ bán hàng…', PART_TIME.mins, () => { G.daily.partTime = true; useStam(PART_TIME.stam, true); addMoney(PART_TIME.pay + PART_TIME.payPerLv * lv('buonban')); addStat('buonban', PART_TIME.pts); });
}
ACT.center = async () => {
  const ok = schoolToday() ? inWin(G.time, 1020, 1200) : inWin(G.time, 480, 1140);
  if (!ok) return UI.say('Trung tâm Sao Mai', 'Hiện không có lớp.<p class="dim">Ngày đi học: 17:00–20:00 · Ngày nghỉ: 08:00–19:00</p>');
  if (G.money < TUTOR.price) return UI.say('Trung tâm Sao Mai', `Học phí mỗi buổi ${fmtMoney(TUTOR.price)}. Bạn chưa đủ tiền.`);
  if (G.stamina < TUTOR.stam) return UI.toast('Mệt quá, không học thêm nổi.', 'bad');
  const c = await UI.ask('Đăng ký học thêm', `<p>Mỗi buổi ${TUTOR.mins} phút · học phí ${fmtMoney(TUTOR.price)} · +${TUTOR.pts} điểm môn học · −${TUTOR.stam} thể lực.</p>`, BOOK_SUBJ.map(s => SUBJ[s].name).concat('Thôi'), { grid: true });
  if (c < 0 || c >= BOOK_SUBJ.length) return;
  const s = BOOK_SUBJ[c];
  await activity(`Đang học thêm ${SUBJ[s].name}…`, TUTOR.mins, () => { addMoney(-TUTOR.price); useStam(TUTOR.stam); addStat(s, TUTOR.pts); });
};
ACT.canteen = async () => {
  if (!inWin(G.time, 360, 1030)) return UI.say('Căn tin', 'Căn tin đã nghỉ bán.');
  const c = await UI.ask('Căn tin', '<p>“Ăn gì con?”</p>', CANTEEN.map(f => `${f.name} · ${fmtMoney(f.price)} · +${f.stam} thể lực`).concat('Thôi'));
  if (c < 0 || c >= CANTEEN.length) return;
  const f = CANTEEN[c];
  if (G.money < f.price) return UI.toast('Không đủ tiền.', 'bad');
  if (f.mins) await activity(`Đang ăn ${f.name.toLowerCase()}…`, f.mins, () => { addMoney(-f.price); gainStam(f.stam); });
  else { addMoney(-f.price); gainStam(f.stam); UI.hud(); if (f.pack) await showPack(openPacks(f.pack), 'Bóc gói bim bim Sao Vàng'); }
};

/* ---------- việc cần làm (gợi ý) ---------- */
function todoList() {
  const t = [];
  if (schoolToday()) {
    if (!G.daily.arrived && G.time < CFG.SCHOOL_END) {
      t.push([!!G.daily.meals.sang, 'Ăn sáng mẹ nấu']);
      t.push([missingToday().length === 0, 'Soạn cặp theo thời khoá biểu']);
      t.push([false, 'Đến trường trước 08:00']);
    } else if (G.time < CFG.SCHOOL_END) {
      const np = nextPeriod(), cp = currentPeriod();
      if (np) t.push([false, `Tiết ${np.n} · ${SUBJ[ttToday()[np.n - 1]].name} lúc ${fmtTime(np.start)}`]);
      else if (cp) t.push([false, `Đang học tiết ${cp.n}`]);
    } else {
      if (G.atSchool) t.push([false, 'Ra cổng trường để về nhà']);
      const m = meetOn();
      if (m) t.push([m.n > 0, `Hẹn ${FRIENDS[m.fid].name} ở ${PLACES[m.place].name} (${meetTimeText(m)})`]);
      if (G.daily.outPerm) t.push([true, 'Đã xin phép bố mẹ đi chơi']);
      else t.push([G.daily.checkedIn || G.map === 'home' || (G.time >= CFG.LATE_HOME && !G.daily.outAt20), G.daily.checkedIn ? 'Đã về nhà — đi chơi tiếp được' : 'Về nhà trước 20:00']);
      t.push([!!G.daily.meals.toi, 'Ăn tối (18:00–21:30)']);
      const nd = packTargetDay(); if (nd !== null && nd === G.day + 1) t.push([neededItems(nd).every(i => G.bag[i] || i === 'thehs' || i === 'vethang'), 'Soạn cặp cho ngày mai']);
      t.push([false, 'Đi ngủ trước 03:00']);
    }
  } else {
    t.push([false, 'Tự do: việc nhà · học thêm · đi chơi']);
    const m = meetOn();
    if (m) t.push([m.n > 0, `Hẹn ${FRIENDS[m.fid].name} ở ${PLACES[m.place].name} (${meetTimeText(m)})`]);
    if (G.time >= 1080) t.push([false, 'Đi ngủ trước 03:00']);
  }
  return t;
}
