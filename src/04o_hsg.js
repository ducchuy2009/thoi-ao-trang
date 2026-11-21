'use strict';
/* ============================================================
 *  04o. ĐỘI TUYỂN HỌC SINH GIỎI → THI CHỌN ĐỘI TUYỂN → THI QUỐC GIA → LỄ TRAO GIẢI
 *  1) Họp phụ huynh cuối HK2 lọt tốp 3 (04n_meeting.js đặt G.hsg[năm]) → bố/mẹ về nhà báo tin, chọn môn dự thi
 *     (chỉ môn tổng kết cả năm từ 9,0 trở lên; không thi Quốc phòng, Thể dục).
 *  2) Hè: học đội tuyển thứ 2–4–6 trong 2 tuần đầu (6 buổi), mỗi buổi 2 tiết liền 30' lúc 08:00 ở lớp 10A1.
 *     Buổi đầu thầy cô giải thích luật thi. Phải mang sách môn đó và có mặt ở trường trước giờ học, không thì tính vắng.
 *     Vắng 3 buổi → bị loại khỏi đội tuyển (cảnh gọi lên trường thông báo). Học đội tuyển cộng nhiều điểm môn hơn, tốn nhiều thể lực hơn.
 *  3) Thứ 2 tuần thứ 3: thi chọn đội tuyển. Cả khối chỉ lấy 3 bạn → cô đọc tên 3 bạn từ cao xuống thấp (không hiện điểm).
 *  4) Vào đội tuyển quốc gia: huy hiệu Học sinh tiêu biểu · học tiếp các buổi 2–4–6 còn lại của hè, vào năm học thì học thay
 *     các tiết nghỉ chiều thứ 4, thứ 6 (13:30) · vắng 5 buổi thì bị loại.
 *  5) Ngày 19 Thu: miễn học. Xe trường chở tới THPT chuyên Hoa Đào → vào phòng thi → giám thị phát đề → làm bài → xe bus
 *     chở về trường Hoa Phượng lúc 12:00, chiều được nghỉ. Không biết điểm.
 *  6) Buổi chào cờ kế tiếp: thầy hiệu trưởng đọc tên + giải, các bạn lên đứng cạnh thầy nhận bằng khen, huy chương, chụp ảnh.
 *     Mình đoạt giải: huy hiệu Đẳng cấp quốc gia, ảnh vào lưu bút, thầy cô và bố mẹ quý hơn, tối về bố mẹ dẫn đi nhà hàng ăn mừng.
 * ============================================================ */
const HSG = {
  min: 9, summer: 90, startDos: 3, dows: [0, 2, 4], natDos: 19,  // môn dự thi ≥ 9,0 · hè bắt đầu ngày 90 trong năm · học từ thứ 2 đầu tiên kể từ 3 Hè · ngày thi quốc gia 19 Thu
  from: 480, natFrom: 810, len: 60,                               // hè học 08:00 · năm học học chiều 13:30 · 2 tiết × 30'
  gain: 9, stam: 10,                                              // mỗi tiết: +9 điểm môn (tiết thường +5), −10 thể lực (tiết thường −6)
  kick: 3, kickNat: 5,                                            // vắng bao nhiêu buổi thì bị loại (chọn đội tuyển / đội tuyển quốc gia)
  // điểm thi chọn (thang 20): đi đủ + tự học khá thường xuyên + chăm chú → vừa đủ tốp 3; học thêm giúp lên hạng
  sel: { base: 6, att: 5, self: 3, selfNeed: 5, focus: 2, lv: 0.25, tut: 0.8, tutMax: 3, rnd: 1 },
  rivals: [18.4, 17.6, 16.9, 16.3, 15.6, 14.8, 14.0, 12.9],
  // điểm thi quốc gia: đi đủ + tự học khá thường xuyên + học thêm 2–3 buổi/tuần → vừa đủ giải Ba
  nat: { base: 4, att: 4, self: 3, selfRate: 0.45, tut: 0.9, tutMax: 3, lv: 0.2, focus: 0.6, rnd: 1, prize: [14.8, 16.2, 17.4] },
};
const HSG_SUBJ = ['toan', 'van', 'anh', 'ly', 'hoa', 'sinh', 'su', 'dia'];
const HSG_POOL = [['c1', 'Quang', 'A1'], ['vy', 'Vy', 'A1'], ['c6', 'Hoa', 'A1'], ['x1', 'Minh Khôi', 'A2'], ['x2', 'Thu Trang', 'A2'], ['x3', 'Đức Anh', 'A3'], ['x4', 'Bảo Ngọc', 'A4'], ['c8', 'Phương', 'A1'], ['sG', 'Gia Huy', 'A3'], ['sH', 'Khánh Linh', 'A4'], ['c9', 'Hiền', 'A1'], ['c5', 'Vũ', 'A1']];
const PRIZE = ['', 'giải Nhất', 'giải Nhì', 'giải Ba'];
Object.assign(LOOKS, {
  proctor: { hair: '#3a2430', style: 'bun', shirt: '#dfe7ef', pants: '#3a3f55', glasses: true, eye: 'round' },   // giám thị phòng thi
});

/* ---------- trạng thái & lịch ---------- */
// Chương trình của năm Y (mời vào đội cuối năm học Y): hè năm Y và mùa Thu năm Y+1
const hsgYearNow = () => { const c = cal(G.day); return c.season === 3 ? c.year : c.year - 1; };
function hsgCur() { if (!G || !G.hsg) return null; const H = G.hsg[hsgYearNow()]; return H && H.subj && !H.out ? H : null; }
const _hsgPlan = {};
function hsgPlan(Y) {
  if (_hsgPlan[Y]) return _hsgPlan[Y];
  const base = Y * YEAR_DAYS, end = base + YEAR_DAYS - 1;
  let d = base + HSG.summer + HSG.startDos - 1; while (cal(d).dow !== 0) d++;
  const train = [0, 2, 4, 7, 9, 11].map(k => d + k), exam = d + 14, nat = [], natDay = base + YEAR_DAYS + HSG.natDos - 1;
  for (let x = exam + 1; x <= end; x++) if (HSG.dows.includes(cal(x).dow)) nat.push(x);                                         // hè còn lại: thứ 2–4–6
  for (let x = base + YEAR_DAYS; x < natDay; x++) if ((cal(x).dow === 2 || cal(x).dow === 4) && isSchoolDay(x)) nat.push(x);  // năm học: chiều nghỉ thứ 4, thứ 6
  let cer = natDay + 1; while (!(isSchoolDay(cer) && cal(cer).dow === 0)) cer++;                                                 // buổi chào cờ kế tiếp
  return (_hsgPlan[Y] = { train, exam, nat, natDay, cer });
}
const hsgAt = day => (cal(day).season === 3 ? HSG.from : HSG.natFrom);
// Hôm nay có gì: { kind: 'train' | 'exam' | 'nat' | 'natexam', at }
function hsgToday(H) {
  H = H || hsgCur(); if (!H) return null;
  const P = hsgPlan(H.year), d = G.day;
  if (!H.picked && !H.selDone) { if (P.train.includes(d)) return { kind: 'train', at: HSG.from }; if (d === P.exam) return { kind: 'exam', at: HSG.from }; }
  if (H.picked && !H.natDone) { if (P.nat.includes(d)) return { kind: 'nat', at: hsgAt(d) }; if (d === P.natDay) return { kind: 'natexam', at: 390 }; }
  return null;
}
const SCHOOL_INSIDE = ['class', 'lab', 'yte', 'nhac', 'thuvien', 'ngutrua', 'wcnam', 'wcnu', 'tang2', 'l11a1', 'l11a3', 'l12a1', 'l12a2', 'l10a2', 'l10a3', 'l10a4'];
const atSchoolArea = () => SCHOOL_INSIDE.includes(G.map) || (G.map === 'school' && G.y < GATE.yIn + 4);
const hsgTeacher = H => TEACHERS[teacherOf(H.subj)];
function hsgRivals(H) {   // các bạn khác trong khối cùng thi chọn môn này (cố định theo năm + môn)
  const r = mulberry((H.year * 977 + HSG_SUBJ.indexOf(H.subj) * 131 + 17) >>> 0), pool = HSG_POOL.slice();
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, HSG.rivals.length).map(([look, name, cls], i) => ({ look, name, cls: `${H.grade}${cls}`, mean: HSG.rivals[i] }));
}

/* ---------- mỗi khung hình (gọi từ eventTick) ---------- */
function hsgTick() {
  if (!G || !G.hsg || RT.lock || UI.isOpen() || RT.scene) return false;
  // bố / mẹ đi họp về: về tới nhà là được báo tin (từ hôm họp phụ huynh cuối năm đến hết hè)
  const Yc = cal(G.day).year, Ht = G.hsg[Yc];
  if (Ht && !Ht.told && !Ht.out && cal(G.day).season >= 2 && G.map === 'home' && inWin(G.time, 360, 1320)) { hsgTell(Yc); return true; }
  // lễ trao giải đã qua mà mình vắng buổi chào cờ đó
  const Hp = G.hsg[cal(G.day).year - 1];
  if (Hp && Hp.year !== undefined && Hp.natDone && !Hp.cer && G.day > hsgPlan(Hp.year).cer) { hsgCerMissed(Hp); return true; }
  if (Hp && Hp.year !== undefined && Hp.prize && Hp.cer && !Hp.celeb && G.map === 'home' && inWin(G.time, 1020, 1290)) { hsgCelebrate(Hp); return true; }
  const H = hsgCur(); if (!H) return false;
  const t = hsgToday(H); if (!t || (H.daysDone || {})[G.day] || G.time < t.at) return false;
  (H.daysDone = H.daysDone || {})[G.day] = 1;
  if (t.kind === 'natexam') { hsgNational(H); return true; }
  if (!atSchoolArea()) { hsgAbsent(H, t.kind === 'exam' ? 'exam' : t.kind); return true; }
  if (t.kind === 'exam') hsgSelect(H); else hsgSession(H, t.kind);
  return true;
}
// ngày thi quốc gia: miễn mọi tiết học (gọi trong beginDay)
function hsgNewDay() {
  const Hp = G.hsg && G.hsg[cal(G.day).year - 1];
  if (Hp && Hp.picked && !Hp.out && !Hp.natDone && G.day === hsgPlan(Hp.year).natDay) {
    G.daily.hsgExempt = true; for (const q of PERIODS) G.daily.done[q.n] = true;
    RT.morning.push(`Hôm nay thi học sinh giỏi quốc gia môn ${SUBJ[Hp.subj].name} ở trường THPT chuyên Hoa Đào — được miễn mọi tiết học. Xe trường đón lúc 06:30.`);
  }
  const H = hsgCur(), t = H && hsgToday(H);
  if (t && t.kind !== 'natexam') RT.morning.push(`${t.kind === 'exam' ? 'Hôm nay THI CHỌN đội tuyển' : 'Hôm nay học đội tuyển'} HSG môn ${SUBJ[H.subj].name} lúc ${fmtTime(t.at)} ở lớp 10A1 — nhớ mang sách ${SUBJ[H.subj].name} và có mặt ở trường trước giờ.`);
}
function hsgTodo() {
  const out = [], H = hsgCur(), t = H && hsgToday(H);
  if (t && !(H.daysDone || {})[G.day]) {
    if (t.kind === 'natexam') out.push([false, `Thi HSG quốc gia môn ${SUBJ[H.subj].name} — xe trường đón lúc 06:30`]);
    else { out.push([false, `${t.kind === 'exam' ? 'Thi chọn đội tuyển' : 'Học đội tuyển'} HSG ${SUBJ[H.subj].name} lúc ${fmtTime(t.at)} (có mặt ở trường trước giờ)`]); out.push([!!G.bag['sach_' + H.subj], `Mang sách ${SUBJ[H.subj].name} cho buổi đội tuyển`]); }
  }
  return out;
}
// tự học / học thêm đúng môn đội tuyển: ghi lại để tính điểm thi
function hsgNoteStudy(subj, kind) {
  const H = hsgCur(); if (!H || H.subj !== subj) return;
  if (kind === 'self') { if (H.lastSelf === G.day) return; H.lastSelf = G.day; if (H.picked) H.selfNat = (H.selfNat || 0) + 1; else H.self = (H.self || 0) + 1; }
  else if (H.picked) H.tutNat = (H.tutNat || 0) + 1; else H.tut = (H.tut || 0) + 1;
}

/* ---------- 1) bố / mẹ về nhà báo tin, chọn môn ---------- */
async function hsgTell(Y) {
  RT.lock = true;
  const H = G.hsg[Y], who = H.parent || 'mom', name = PNAME[who];
  H.told = true; H.year = Y;
  if ((H.grade || G.grade) >= 12) {
    await UI.ask(name, `<p>“Cô chủ nhiệm khen con lọt tốp 3 của lớp, nhà trường muốn chọn vào đội tuyển học sinh giỏi. Nhưng con sắp tốt nghiệp rồi, đội tuyển để dành cho các em lớp dưới.”</p><p>“Bố mẹ vẫn tự hào về con lắm!”</p>`, ['Dạ, con cảm ơn ' + name.toLowerCase()], { who: { look: who } });
    H.out = 'senior'; addParent(3, '', true); RT.lock = false; UI.hud(); return;
  }
  const yr = yearReport(Y), ok = HSG_SUBJ.filter(s => yr.rows[s] !== null && yr.rows[s] >= HSG.min);
  await UI.ask(name, `<p>“Con ơi! Hôm họp phụ huynh, cô chủ nhiệm báo con lọt <b>tốp 3 của lớp</b>, nhà trường mời con vào <b>đội tuyển học sinh giỏi</b> để ôn thi học sinh giỏi quốc gia đấy!”</p><p>“Bố mẹ mừng lắm! Giờ con chọn môn mình sẽ thi nhé.”</p>`, ['Thật ạ? Con vui quá!'], { who: { look: who } });
  if (!ok.length) {
    await UI.ask(name, `<p>“Nhưng cô bảo môn thi phải có điểm tổng kết cả năm từ <b>9,0</b> trở lên, mà con chưa có môn nào đạt… Năm sau cố lên nhé!”</p><p class="dim">Quốc phòng và Thể dục không thi học sinh giỏi.</p>`, ['Dạ, năm sau con cố ạ'], { who: { look: who } });
    H.out = 'nosubj'; RT.lock = false; UI.hud(); return;
  }
  const P = hsgPlan(Y), btns = ok.map(s => `${SUBJ[s].name} (${fmtAvg(yr.rows[s])})`).concat('Con chưa muốn tham gia');
  const c = await UI.ask('Chọn môn thi học sinh giỏi', `<p>Chỉ chọn được môn có <b>điểm tổng kết cả năm từ 9,0</b>. Quốc phòng và Thể dục không thi.</p><p class="dim">Lịch học đội tuyển: thứ 2, thứ 4, thứ 6 trong 2 tuần đầu hè (từ ${dateLabel(P.train[0])}), mỗi buổi 2 tiết liền lúc ${fmtTime(HSG.from)} ở lớp 10A1. Thi chọn đội tuyển ${dateLabel(P.exam)}.</p>`, btns, { grid: ok.length > 2 });
  if (c < 0 || c >= ok.length) { H.out = 'decline'; await UI.ask(name, '<p>“Ừ, tuỳ con. Hè này nghỉ ngơi cho khoẻ rồi năm học mới cố gắng nhé.”</p>', ['Dạ'], { who: { look: who } }); RT.lock = false; UI.hud(); return; }
  H.subj = ok[c]; H.abs = 0; H.absNat = 0; H.att = 0; H.focus = 0; H.self = 0; H.tut = 0;
  addParent(4, '', true);
  await UI.ask(name, `<p>“Môn <b>${SUBJ[H.subj].name}</b> à? Hay đấy! Nhớ đi học đội tuyển đầy đủ, mang sách theo, có mặt ở trường trước giờ học nhé. Vắng nhiều là bị loại đấy.”</p>`, ['Dạ, con nhớ rồi!'], { who: { look: who } });
  addMemo('scene', 'hsgchon');
  RT.lock = false; UI.hud();
  UI.toast(`Đội tuyển HSG môn ${SUBJ[H.subj].name}: buổi đầu ${dateLabel(P.train[0])} lúc ${fmtTime(HSG.from)} ở lớp 10A1.`, 'good');
}

/* ---------- 2) buổi học đội tuyển ---------- */
const HSG_SEATS = [[0, 0, 0], [0, 0, 1], [2, 0, 0], [2, 0, 1], [3, 1, 0], [0, 1, 1], [2, 1, 1], [3, 0, 0], [1, 2, 1]];
function hsgClassScene(H, mates, title) {
  const T = hsgTeacher(H), X = CLASS_X, Y = CLASS_Y, seat = (c, r, sd) => [X[c] + 7 + sd * 14, Y[r] + 30];
  const actors = [{ look: T.look, x: 160, y: 52, dir: 0 }];
  mates.forEach((m, i) => { const [x, y] = seat(...HSG_SEATS[i % HSG_SEATS.length]); actors.push({ look: m.look, x, y, dir: 3 }); });
  setMap('class', SEAT.x, SEAT.y, 3);
  RT.scene = { type: 'cut', map: 'class', actors, cam: { x: 160, y: 96 }, hide: [], props: [], tw: [], bubble: null, title, bars: false };
  return RT.scene;
}
const hsgMates = H => (H.picked ? (H.team || []) : hsgRivals(H).slice(0, 6));
async function hsgSession(H, kind) {
  RT.lock = true;
  const T = hsgTeacher(H), S = SUBJ[H.subj], who = { look: T.look }, nat = kind === 'nat', title = `${nat ? 'Đội tuyển quốc gia' : 'Đội tuyển HSG'} · ${S.name}`;
  await UI.fade(true);
  hsgClassScene(H, hsgMates(H), title);
  await UI.fade(false);
  const tell = (t, b) => UI.ask(T.name, t, [b || 'Dạ'], { who });
  if (!nat && !H.intro) {
    H.intro = true; const P = hsgPlan(H.year);
    await tell(`<p>“Chào các em! Chào mừng các em đến với <b>đội tuyển học sinh giỏi môn ${S.name}</b> của trường. Trước khi học, ${T.name.split(' ')[0].toLowerCase()} nói qua luật chơi nhé.”</p>`);
    await tell(`<p>“Lịch học: <b>thứ 2, thứ 4, thứ 6</b> trong 2 tuần đầu hè, mỗi buổi <b>2 tiết liền</b>, mỗi tiết 30 phút, bắt đầu lúc ${fmtTime(HSG.from)}. Học đội tuyển nặng hơn trên lớp nhiều, về nhà nhớ ăn ngủ đủ.”</p>`);
    await tell(`<p>“Mỗi buổi phải <b>mang sách ${S.name}</b> và <b>có mặt ở trường trước giờ học</b>. Không có mặt là tính vắng. <b>Vắng 3 buổi</b> là bị loại khỏi đội tuyển, không có ngoại lệ.”</p>`);
    await tell(`<p>“${dateLabel(P.exam)} sẽ có <b>bài thi chọn đội tuyển</b>. Cả khối chỉ lấy <b>3 bạn điểm cao nhất</b> vào đội tuyển ôn thi quốc gia. Đề khó hơn kiểm tra trên lớp nhiều lắm.”</p>`);
    await tell(`<p>“Muốn có cửa thì phải đi học đủ buổi, chăm chú nghe giảng, ở nhà chịu khó <b>tự làm bài tập</b>. Bạn nào đi <b>học thêm</b> nữa thì càng chắc. Kỳ thi quốc gia diễn ra <b>ngày 19 mùa Thu</b> năm sau ở trường THPT chuyên Hoa Đào.”</p>`, 'Dạ, em hiểu rồi ạ!');
  }
  if (nat && !H.introNat) {
    H.introNat = true;
    await tell(`<p>“Chúc mừng ba em đã vào <b>đội tuyển ôn thi quốc gia</b>! Từ giờ tới ngày thi (19 Thu), các em học tiếp các buổi thứ 2–4–6 còn lại của hè; vào năm học thì học vào <b>chiều thứ 4, thứ 6 lúc ${fmtTime(HSG.natFrom)}</b>, thay cho buổi chiều nghỉ.”</p>`);
    await tell(`<p>“Vẫn phải mang sách, có mặt đúng giờ. Đội tuyển quốc gia nghiêm hơn: <b>vắng 5 buổi</b> là bị loại. Muốn có giải thì tự học thường xuyên, mỗi tuần đi học thêm 2–3 buổi nữa nhé.”</p>`, 'Dạ, chúng em sẽ cố gắng ạ!');
  }
  if (!G.bag['sach_' + H.subj]) {
    await tell(`<p>“${G.name}, sách ${S.name} của em đâu? Học đội tuyển mà không mang sách thì ngồi đây cũng như không. Hôm nay ${T.name.split(' ')[0].toLowerCase()} tính em <b>vắng buổi này</b>.”</p>`, 'Dạ… em xin lỗi');
    await UI.fade(true); RT.scene = null; setMap('school', 244, 118, 0); await UI.fade(false);
    RT.lock = false; UI.hud();
    return hsgAbsent(H, kind, true);
  }
  const tired = G.stamina < HSG.stam * 2;
  const c = await UI.ask(title, `<p>Hai tiết liền, mỗi tiết 30 phút. ${tired ? '<b>Bạn đang mệt</b> — khó mà tập trung được lâu.' : 'Hôm nay học chuyên đề khó, cả phòng im phăng phắc.'}</p>`, ['Chăm chú nghe giảng', 'Lén làm việc riêng']);
  const focus = c === 0 && !tired;
  for (const n of [1, 2]) { await UI.progress(`Tiết ${n} · ${title}`, UI._fast ? 10 : 1700, S.color); advanceTime(HSG.len / 2); }
  useStam(HSG.stam * 2); addStat(H.subj, focus ? HSG.gain * 2 : Math.round(HSG.gain * (c === 0 ? 1.2 : 0.6)));
  H.att = (H.att || 0) + (nat ? 0 : 1); if (nat) H.attNat = (H.attNat || 0) + 1;
  if (focus) { if (nat) H.focusNat = (H.focusNat || 0) + 1; else H.focus = (H.focus || 0) + 1; }
  await runStep({ say: [0, focus ? 'Hôm nay các em làm tốt lắm. Về nhà nhớ làm hết bài tập nhé!' : 'Có bạn hôm nay chưa tập trung đâu đấy. Về nhà làm bài tập đầy đủ!'] }, {});
  await UI.fade(true); RT.scene = null; setMap('school', 244, 118, 0); await UI.fade(false);
  RT.lock = false; UI.hud();
  UI.toast(focus ? `Xong buổi đội tuyển: +${HSG.gain * 2} điểm ${S.name}.` : 'Xong buổi đội tuyển, nhưng không tập trung nên học được ít.', focus ? 'good' : 'info');
}
async function hsgAbsent(H, kind, noBook) {
  const nat = !!H.picked, lim = nat ? HSG.kickNat : HSG.kick, T = hsgTeacher(H);
  if (kind === 'exam') {   // bỏ thi chọn đội tuyển = bị loại
    H.selDone = true; H.out = 'skip';
    return UI.ask(T.name, `<p>“${G.name} không đến thi chọn đội tuyển à? Tiếc quá, em không còn trong đội tuyển nữa.”</p>`, ['Dạ…'], { who: { look: T.look } });
  }
  if (nat) H.absNat = (H.absNat || 0) + 1; else H.abs = (H.abs || 0) + 1;
  const n = nat ? H.absNat : H.abs;
  if (n >= lim) return hsgExpel(H, n);
  UI.toast(`${noBook ? 'Không mang sách — bị tính' : 'Bạn đã'} vắng buổi học đội tuyển ${SUBJ[H.subj].name} (${n}/${lim}). Vắng ${lim} buổi là bị loại!`, 'bad');
}
async function hsgExpel(H, n) {
  RT.lock = true;
  const T = hsgTeacher(H), S = SUBJ[H.subj];
  await UI.ask(T.name, `<p>“Alo, ${G.name} đấy à? ${T.name.split(' ')[0]} đây. Em lên trường gặp ${T.name.split(' ')[0].toLowerCase()} ngay nhé, có việc quan trọng.”</p>`, ['Dạ… em lên ngay'], { who: { look: T.look } });
  const mates = hsgMates(H), actors = [{ look: T.look, x: 160, y: 52, dir: 0 }], X = CLASS_X, Y = CLASS_Y;
  mates.forEach((m, i) => { const s = HSG_SEATS[i % HSG_SEATS.length]; actors.push({ look: m.look, x: X[s[0]] + 7 + s[2] * 14, y: Y[s[1]] + 30, dir: 3 }); });
  await playCut({ map: 'class', me: [288, 204, 3], cam: { x: 168, y: 100 }, title: `Đội tuyển ${S.name}`, actors, steps: [
    { move: ['me', 230, 150, 900] },
    { move: [0, 200, 120, 700] },
    { say: [0, `${G.name}, em đã vắng ${n} buổi học đội tuyển rồi.`] },
    { say: [0, 'Theo đúng luật đã nói từ buổi đầu, em không thể ở lại đội tuyển được nữa.'] },
    { say: ['me', 'Em xin lỗi cô… em biết lỗi rồi ạ.'] },
    { say: [0, 'Cô tiếc lắm. Em về đi, năm học mới cố gắng hơn nhé.'] },
    { move: ['me', 288, 204, 900] },
  ] });
  H.out = 'kick';
  addParent(-4, 'bị loại khỏi đội tuyển', true); addTeacher(-3, teacherOf(H.subj), true);
  RT.lock = false; UI.hud();
  UI.toast(`Bạn bị loại khỏi đội tuyển học sinh giỏi môn ${S.name} vì vắng ${n} buổi.`, 'bad');
}

/* ---------- 3) thi chọn đội tuyển + cô đọc tên 3 bạn ---------- */
function hsgSelScore(H) {
  const k = HSG.sel, P = hsgPlan(H.year), att = (H.att || 0) / P.train.length, self = Math.min(1, (H.self || 0) / k.selfNeed), foc = H.att ? (H.focus || 0) / P.train.length : 0;
  return k.base + k.att * att + k.self * self + k.focus * foc + k.lv * lv(H.subj) + k.tut * Math.min(k.tutMax, H.tut || 0) + rnd(-k.rnd, k.rnd);
}
async function hsgSelect(H) {
  RT.lock = true;
  const T = hsgTeacher(H), S = SUBJ[H.subj], rivals = hsgRivals(H), who = { look: T.look };
  await UI.fade(true);
  const sc = hsgClassScene(H, rivals, `Thi chọn đội tuyển · ${S.name}`);
  sc.props = [() => { for (const a of sc.actors.slice(1)) wRect('#fffaf0', a.x - 4, a.y - 30, 8, 5); wRect('#fffaf0', G.x - 4, G.y - 30, 8, 5); }];
  await UI.fade(false);
  await runStep({ say: [0, `Hôm nay thi chọn đội tuyển môn ${S.name}. Làm bài trong 90 phút, cả khối chỉ lấy 3 bạn!`] }, {});
  if (!G.bag['sach_' + H.subj]) await runStep({ say: ['me', '(Quên sách rồi… may mà hôm nay chỉ cần bút.)'] }, {});
  await UI.progress(`Đang làm bài thi chọn đội tuyển ${S.name}…`, UI._fast ? 10 : 2600, S.color); advanceTime(90); useStam(HSG.stam * 2);
  await runStep({ say: [0, 'Hết giờ! Các em nộp bài. Một tiếng nữa cô công bố kết quả.'] }, {});
  // chấm: mình + các bạn trong khối, lấy 3 bạn cao nhất (không hiện điểm)
  const rows = rivals.map(r => ({ name: `${r.name} (${r.cls})`, look: r.look, s: r.mean + rnd(-0.5, 0.5) })).concat([{ name: `${G.name} (${H.grade}A1)`, me: true, s: hsgSelScore(H) }]).sort((a, b) => b.s - a.s);
  const top = rows.slice(0, 3), mine = top.some(r => r.me);
  await UI.fade(true); advanceTime(60); await UI.wait(400); await UI.fade(false);
  await runStep({ say: [0, `Cô xin công bố 3 bạn được chọn vào đội tuyển ôn thi học sinh giỏi quốc gia môn ${S.name}…`] }, {});
  for (let i = 0; i < 3; i++) {
    const r = top[i];
    await runStep({ say: [0, `${['Thứ nhất', 'Thứ hai', 'Thứ ba'][i]}: ${r.me ? 'em ' + G.name : r.name}!`] }, {});
    if (r.me) { await runStep({ hop: 'me' }, {}); await runStep({ say: ['me', 'Là mình! Mình được chọn rồi!!!'] }, {}); }
    else { const k = sc.actors.findIndex((a, j) => j > 0 && a.look === r.look); if (k > 0) await runStep({ hop: k }, {}); }
  }
  if (!mine) { await runStep({ say: [0, 'Các em còn lại đừng buồn nhé, các em đều đã rất cố gắng.'] }, {}); await runStep({ say: ['me', '(Không có tên mình… tiếc quá.)'] }, {}); }
  H.selDone = true; H.selRank = rows.findIndex(r => r.me) + 1;
  await UI.fade(true); RT.scene = null; setMap('school', 244, 118, 0); await UI.fade(false);
  if (mine) {
    H.picked = true; H.team = top.filter(r => !r.me).map(r => ({ look: r.look, name: r.name }));
    addMemo('badge', 'hstb'); addParent(8, 'được chọn vào đội tuyển quốc gia', true); addTeacher(6, teacherOf(H.subj), true);
    UI.toast(`Bạn vào đội tuyển ôn thi học sinh giỏi quốc gia môn ${S.name}! Buổi học tiếp theo: ${dateLabel(hsgPlan(H.year).nat[0])}.`, 'good');
  } else { H.out = 'fail'; addParent(2, '', true); UI.toast('Không lọt tốp 3 lần này. Năm sau thử lại nhé!', 'info'); }
  RT.lock = false; UI.hud();
}

/* ---------- 5) thi quốc gia ở THPT chuyên Hoa Đào ---------- */
function hsgNatScore(H) {
  const k = HSG.nat, P = hsgPlan(H.year), n = Math.max(1, P.nat.length), span = Math.max(7, P.natDay - P.exam), weeks = span / 7;
  const att = (H.attNat || 0) / n, self = Math.min(1, (H.selfNat || 0) / (span * k.selfRate)), tutW = (H.tutNat || 0) / weeks, foc = (H.focusNat || 0) / n;
  return k.base + k.att * att + k.self * self + k.tut * Math.min(k.tutMax, tutW) + k.lv * lv(H.subj) + k.focus * foc + rnd(-k.rnd, k.rnd);
}
async function hsgNational(H) {
  RT.lock = true;
  const S = SUBJ[H.subj];
  if (G.ride) dismount(true);
  await UI.ask('Xe trường', `<p>Xe của trường đã đến đón. Thầy cô dẫn đoàn: “Lên xe nào ${G.name}, hôm nay đi thi quốc gia môn ${S.name}. Bình tĩnh, tự tin nhé!”</p>`, ['Lên xe']);
  await rideCut('bus', 'Xe trường · Hoa Phượng → THPT chuyên Hoa Đào', true);
  // phòng thi
  const desks = HSG_EXAM_DESKS, me = desks[5], actors = [{ look: 'proctor', x: 166, y: 56, dir: 0 }], st = { papers: 0 };
  desks.forEach((d, i) => { if (i !== 5) actors.push({ look: ['x1', 'x2', 'sG', 'x4', 'sH', 'x3', 'sE', 'c3', 'sF', 'sA', 'x2'][i % 11], x: d[0] + 14, y: d[1] + 22, dir: 3 }); });
  setMap('phongthi', 288, 200, 3);
  RT.scene = { type: 'cut', map: 'phongthi', actors, cam: { x: 160, y: 104 }, hide: [], tw: [], bubble: null, title: 'Trường THPT chuyên Hoa Đào · Phòng thi số 07', bars: true,
    props: [() => { desks.slice(0, st.papers).forEach(d => { wRect('#fffaf0', d[0] + 4, d[1] + 2, 8, 6); wRect('#fffaf0', d[0] + 16, d[1] + 2, 8, 6); wRect('#8fa0ab', d[0] + 5, d[1] + 4, 6, 1); }); }] };
  document.body.classList.add('cut');
  await UI.fade(false);
  await tween('me', 270, 196, 300); await tween('me', me[0] + 14, 196, 500); await tween('me', me[0] + 14, me[1] + 22, 700); G.dir = 3;
  await runStep({ say: [0, 'Các em ngồi đúng số báo danh. Tắt điện thoại, để cặp sách lên bàn đầu phòng.'] }, {});
  await runStep({ say: [0, 'Bây giờ cô phát đề. Thời gian làm bài 180 phút, không kể thời gian phát đề.'] }, {});
  for (let r = 0; r < 3; r++) { await tween(0, 72 + r * 64, 84 + r * 36, 500); st.papers = Math.min(desks.length, (r + 1) * 4); }
  await tween(0, 166, 56, 600); RT.scene.actors[0].dir = 0;
  await runStep({ say: ['me', `(Đề ${S.name} khó thật… bình tĩnh nào, làm câu dễ trước.)`] }, {});
  await UI.progress(`Đang làm bài thi học sinh giỏi quốc gia môn ${S.name}…`, UI._fast ? 10 : 3000, S.color);
  G.time = Math.max(G.time, 660); useStam(25);
  await runStep({ say: [0, 'Hết giờ làm bài! Các em dừng bút, ngồi tại chỗ để cô thu bài.'] }, {});
  await tween('me', me[0] + 14, 196, 700); await tween('me', 270, 206, 400);
  await UI.fade(true);
  RT.scene = null; document.body.classList.remove('cut');
  H.natScore = hsgNatScore(H); const p = HSG.nat.prize;
  H.prize = H.natScore >= p[2] ? 1 : H.natScore >= p[1] ? 2 : H.natScore >= p[0] ? 3 : 0;
  H.natDone = true; addMemo('scene', 'hsgthi');
  await rideCut('bus', 'Xe bus trường · THPT chuyên Hoa Đào → trường Hoa Phượng', false);
  G.time = Math.max(G.time, 720);
  setMap('school', GATE.x + 48, GATE.yIn - 18, 0); G.daily.arrived = true; G.atSchool = false;
  await UI.fade(false);
  await UI.ask('Thi xong rồi!', `<p>12:00 — xe bus trường đã chở cả đoàn về tới trường Hoa Phượng. Bài làm thế nào thì phải chờ nhà trường công bố…</p><p class="dim">Chiều nay bạn được nghỉ. Đi đâu chơi cũng được!</p>`, ['Đi chơi thôi!']);
  RT.lock = false; UI.hud();
}
const HSG_EXAM_DESKS = (() => { const a = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) a.push([46 + c * 64, 76 + r * 36]); return a; })();

/* ---------- 6) chào cờ: lễ trao giải học sinh giỏi quốc gia ---------- */
function hsgWinners(H) {   // các bạn khác của trường đoạt giải (cố định theo năm), cộng mình nếu có giải
  const r = mulberry((H.year * 613 + 29) >>> 0), pool = [['c1', 'Quang', 'toan'], ['sB', 'Chị Mai', 'van'], ['sD', 'Chị Trang', 'hoa'], ['c6', 'Hoa', 'sinh'], ['sG', 'Gia Huy', 'ly'], ['vy', 'Vy', 'anh']].filter(w => w[2] !== H.subj);
  const n = 1 + Math.floor(r() * 2), out = [];
  for (let i = 0; i < n; i++) { const w = pool.splice(Math.floor(r() * pool.length), 1)[0]; out.push({ look: w[0], name: w[1], subj: w[2], prize: 1 + Math.floor(r() * 3) }); }
  if (H.prize) out.push({ me: true, name: G.name, subj: H.subj, prize: H.prize });
  return out.sort((a, b) => a.prize - b.prize);
}
async function hsgCeremony(H) {
  const W = hsgWinners(H), X0 = 352, Y0 = 182, won = !!H.prize;
  const actors = formation(280, 206, 24, 22, 6, 4, 2, 1).concat([{ look: 'principal', x: X0, y: Y0, dir: 0 }]), iP = actors.length - 1, st = { medal: {} };
  const idx = W.map(w => { if (w.me) return 'me'; actors.push({ look: w.look, x: 250 + actors.length % 3 * 14, y: 252, dir: 3 }); return actors.length - 1; });
  const ent = k => (k === 'me' ? G : RT.scene.actors[k]);
  const prop = () => { for (const k in st.medal) { const e = ent(k === 'me' ? 'me' : +k), p = st.medal[k]; wRect('#d9534f', e.x - 1, e.y - 10, 1, 3); wRect('#d9534f', e.x + 1, e.y - 10, 1, 3); wRect(medalCol(p), e.x - 1.5, e.y - 7, 3, 3); wRect('#fffaf0', e.x + 4, e.y - 13, 6, 5); wRect('#d9534f', e.x + 4, e.y - 13, 6, 1); } };
  const steps = [{ say: [iP, 'Trước giờ chào cờ hôm nay, nhà trường xin công bố kết quả kỳ thi chọn học sinh giỏi quốc gia vừa qua.'] }];
  if (!won) steps.push({ say: [iP, 'Năm nay trường ta có các em sau đạt giải:'] });
  W.forEach((w, i) => {
    const k = idx[i], spot = X0 + (i % 2 ? 1 : -1) * (18 + Math.floor(i / 2) * 16);
    steps.push({ say: [iP, `Em ${w.me ? G.name : w.name}${w.me ? ` lớp ${G.grade}A1` : ''} — ${PRIZE[w.prize]} môn ${SUBJ[w.subj].name}! Mời em lên nhận giải.`] });
    steps.push({ move: [k, spot, Y0 + 2, 900] }, { fn: () => { st.medal[k] = w.prize; } }, { say: [iP, 'Thầy trao bằng khen và huy chương cho em. Chúc mừng em!'] });
    if (w.me) steps.push({ say: ['me', 'Em cảm ơn thầy ạ!'] });
  });
  steps.push({ say: [iP, 'Bây giờ các em đứng lại chụp ảnh lưu niệm cùng thầy nhé. Một, hai, ba… cười!'] }, { wait: 160 },
    { fn: sc => { if (won) snapPhoto('anhhsg', X0, Y0 - 12, 150); sc.glow = [flashGlow(performance.now())]; } }, { wait: 900 });
  if (!won && H.prize === 0) steps.push({ say: ['me', '(Lần này mình chưa có giải… nhưng đã học được rất nhiều.)'] });
  await playCut({ map: 'school', me: [328, 228, 3], cam: { x: X0, y: 206 }, title: 'Lễ trao giải học sinh giỏi quốc gia', actors, props: [prop], steps });
  H.cer = true;
  if (won) {
    addMemo('badge', 'quocgia'); addMemo('item', 'anhhsg');
    for (const k in TEACHERS) addTeacher(12, k, true);
    addParent(15, `đoạt ${PRIZE[H.prize]} học sinh giỏi quốc gia`, true);
    UI.toast(`Bạn đoạt ${PRIZE[H.prize]} học sinh giỏi quốc gia môn ${SUBJ[H.subj].name}! Ảnh lưu niệm đã dán vào lưu bút. Tối về bố mẹ có bất ngờ đấy.`, 'good');
  } else UI.toast('Lần này bạn chưa có giải. Cố gắng ở những kỳ thi sau nhé!', 'info');
}
function hsgCerMissed(H) {
  H.cer = true;
  if (H.prize) { addMemo('badge', 'quocgia'); addParent(10, `đoạt ${PRIZE[H.prize]} học sinh giỏi quốc gia`, true); UI.toast(`Nhà trường đã công bố: bạn đoạt ${PRIZE[H.prize]} học sinh giỏi quốc gia môn ${SUBJ[H.subj].name}! (Hôm đó bạn vắng buổi chào cờ nên không có ảnh lưu niệm.)`, 'good'); }
  else UI.toast('Nhà trường đã công bố giải học sinh giỏi quốc gia: lần này bạn chưa có giải.', 'info');
}
// tối hôm nhận giải: bố mẹ chúc mừng, dẫn đi nhà hàng Sen Hồng ăn mừng
async function hsgCelebrate(H) {
  RT.lock = true; H.celeb = true; RT.famHide = true;
  await playCut({ map: 'home', me: [300, 150, 0], cam: { x: 300, y: 130 }, title: 'Ăn mừng', actors: [{ look: 'mom', outfit: 'noapron', x: 278, y: 132, dir: 2 }, { look: 'dad', outfit: 'dadhome', x: 322, y: 132, dir: 1 }], hide: ['mom', 'dad', 'pr_mom', 'pr_dad'],
    steps: [{ say: [0, `${G.name} ơi, cô chủ nhiệm gọi điện báo con đoạt ${PRIZE[H.prize]} quốc gia rồi! Mẹ tự hào về con quá!`] }, { say: [1, 'Giỏi lắm con trai bố! Tối nay cả nhà đi nhà hàng Sen Hồng ăn mừng!'.replace('con trai', G.gender === 'girl' ? 'con gái' : 'con trai')] }, { hop: 'me' }, { say: ['me', 'Thật ạ? Con cảm ơn bố mẹ!'] }] });
  await rideCut('moto', 'Cả nhà đi ăn mừng', true, 'dad');
  const T = [110, 110];
  setMap('nhahang', T[0] + 18, T[1] + 30, 3);
  await playCut({ inPlace: true, cam: { x: 140, y: 110 }, title: 'Nhà hàng Sen Hồng', actors: [{ look: 'mom', outfit: 'noapron', x: T[0] + 2, y: T[1] + 18, dir: 2 }, { look: 'dad', outfit: null, x: T[0] + 34, y: T[1] + 18, dir: 1 }, { look: 'chef', x: 230, y: 96, dir: 0 }],
    props: [() => { wRect('#fffaf0', T[0] + 8, T[1] + 6, 6, 4); wRect('#e98f4a', T[0] + 9, T[1] + 7, 4, 2); wRect('#fffaf0', T[0] + 20, T[1] + 6, 6, 4); wRect('#5fae4a', T[0] + 21, T[1] + 7, 4, 2); wRect('#d9534f', T[0] + 15, T[1] + 4, 4, 5); }],
    steps: [{ say: [2, 'Nghe nói nhà mình có người đoạt giải quốc gia hả? Món này anh tặng thêm nhé!'] }, { say: [1, 'Nào, cả nhà nâng ly chúc mừng ' + G.name + '!'] }, { say: [0, 'Ăn nhiều vào con, mấy tháng ôn thi vất vả rồi.'] }, { say: ['me', 'Đây là bữa tối ngon nhất của con!'] }] });
  G.daily.meals.toi = true; advanceTime(90); gainStam(30);
  addParent(8, 'cả nhà đi ăn mừng', true); addMemo('scene', 'anmung');
  await UI.fade(true); RT.famHide = false; setMap('home', 300, 150, 0); RT.snapNpcs = true; await UI.fade(false);
  RT.lock = false; UI.hud();
}
// sự kiện đội tuyển trên Lịch
function hsgCalEvents(day) {
  const out = [];
  for (const y in G.hsg || {}) {
    const H = G.hsg[y]; if (!H.subj || H.year === undefined) continue;
    const P = hsgPlan(H.year), s = SUBJ[H.subj].name;
    if (!H.out || H.out === 'fail') {
      if (P.train.includes(day) && !H.selDone) out.push(`Học đội tuyển HSG ${s} ${fmtTime(HSG.from)}`);
      if (day === P.exam && !(H.selDone && !H.picked)) out.push(`Thi chọn đội tuyển ${s} ${fmtTime(HSG.from)}`);
    }
    if (H.picked && H.out !== 'kick') {
      if (P.nat.includes(day) && !H.natDone) out.push(`Đội tuyển quốc gia ${s} ${fmtTime(hsgAt(day))}`);
      if (day === P.natDay) out.push(`Thi HSG quốc gia môn ${s} (THPT chuyên Hoa Đào)`);
      if (day === P.cer && H.natDone) out.push('Chào cờ: lễ trao giải HSG quốc gia');
    }
  }
  return out;
}
// phòng thi ở trường THPT chuyên Hoa Đào (chỉ dùng trong cảnh thi quốc gia)
function buildHsgPlaces() {
  const m = roomBase('phongthi', 'Trường THPT chuyên Hoa Đào · Phòng thi', '#eef1f6', '#a9b8cc', 'ltile', 20, 14);
  roomExit(m, { map: 'school', x: 244, y: 118, dir: 0 });
  R(m.x, '#3f5f4a', 96, 4, 128, 22); R(m.x, '#2f4a3a', 96, 24, 128, 2); R(m.x, '#8a5a3a', 94, 2, 132, 2);
  m.labels.push({ x: 160, y: 12, text: 'KỲ THI CHỌN HSG QUỐC GIA', size: 5, col: '#fffaf0', maxw: 120 }, { x: 160, y: 20, text: 'PHÒNG THI SỐ 07', size: 4.4, col: '#ffe066', maxw: 80 });
  drawWin(m.x, 30, 9, 22, 13); drawWin(m.x, 268, 9, 22, 13);
  addObj(m, { s: 'tdesk', x: 150, y: 30, sol: [1, 2, 32, 19] });
  for (const [a, b] of HSG_EXAM_DESKS) addObj(m, { s: 'sdesk', x: a, y: b, sol: [1, 2, 28, 10] });
}
