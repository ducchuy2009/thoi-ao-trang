'use strict';
/* ============================================================
 *  04n. HỌP PHỤ HUYNH CUỐI HỌC KỲ · XẾP HẠNG CẢ LỚP · HUY HIỆU HỌC BÁ · ĐỘI TUYỂN HỌC SINH GIỎI
 *  - Ngày họp = ngày học cuối cùng của mỗi học kỳ (sau ngày thi cuối cùng): cả ngày nghỉ học (isPmDay → isSchoolDay = false).
 *  - 08:00–11:00 bố (HK2) / mẹ (HK1) lên lớp 10A1 họp; mình phải có mặt ở trường (đứng ngoài cửa lớp) — tới trường là vào cảnh họp.
 *  - Cô chủ nhiệm đọc thành tích + xếp hạng của mọi học sinh trong lớp (bảng xếp hạng); hạng 1 → huy hiệu Học bá;
 *    cuối học kỳ 2 lọt top 3 → vào đội tuyển học sinh giỏi chuẩn bị thi quốc gia.
 *  - Không có mặt trước 11:00 → coi như vắng họp: trừ nặng hạnh kiểm vào ngày học đầu tiên của học kỳ sau (PM.pen).
 * ============================================================ */
const PM = { from: 480, to: 660, pen: 4 };
// phụ huynh các bạn khác ngồi họp
Object.assign(LOOKS, {
  ph1: { hair: '#3a2a2a', style: 'bun', shirt: '#c9a0f0', pants: '#4a3f5b', earring: '#ffd23a' }, ph2: { hair: '#2c2733', style: 'short', shirt: '#dfe7ef', pants: '#3a3f55', tie: '#3b6fb6' },
  ph3: { hair: '#4a3328', style: 'long', shirt: '#f2a93b', pants: '#5b4a6b' }, ph4: { hair: '#5f656f', style: 'short', shirt: '#7fa07a', pants: '#3a3f55', mustache: true },
  ph5: { hair: '#2c2733', style: 'bob', shirt: '#e98fa5', pants: '#5b4a6b', glasses: 'round' }, ph6: { hair: '#3a3340', style: 'side', shirt: '#4fa3b8', pants: '#2f3550' },
  ph7: { hair: '#4a3328', style: 'bun', aodai: true, shirt: '#5fae9a', shoe: '#f4f0ff' }, ph8: { hair: '#2c2733', style: 'buzz', shirt: '#d9c690', pants: '#3a3f55' },
});

/* ---------- ngày họp (pmDayOf, isPmDay ở 01_data.js) ---------- */
const pmKey = day => cal(day).year + '-' + semOf(day).id;
const pmParent = day => (semOf(day).id === 1 ? 'mom' : 'dad');
const pmState = day => { G.pm = G.pm || {}; const k = pmKey(day); return (G.pm[k] = G.pm[k] || {}); };
const pmOn = () => !!G && isPmDay(G.day);

/* ---------- xếp hạng cả lớp ---------- */
// [mã look, tên (null = theo nhân vật), ĐTB trung bình, độ dao động, hạnh kiểm trung bình]
const PM_NAMED = [['c1', 'Quang', 8.9, 0.5, 9.6], ['vy', 'Vy', 8.7, 0.5, 9.5], ['c6', 'Hoa', 8.5, 0.6, 9.4], ['c8', 'Phương', 7.9, 0.7, 9.2], ['c9', 'Hiền', 7.6, 0.7, 9.6],
  ['c5', 'Vũ', 7.4, 0.7, 9.0], ['c4', 'Minh Anh', 7.3, 0.8, 9.1], ['khoa', null, 7.1, 0.8, 8.6], ['c2', 'Thảo', 7.0, 0.8, 9.0], ['dat', 'Thái', 6.9, 0.8, 8.4],
  ['c10', null, 7.0, 0.8, 8.8], ['c7', 'Nam Anh', 6.8, 0.9, 8.2], ['c3', 'Đức', 6.6, 0.9, 7.8]];
const PM_OTHERS = ['Lan', 'Tuấn', 'Mai', 'Hùng', 'Trang', 'Bình', 'Linh', 'Khánh', 'Ngọc', 'Sơn', 'Yến', 'Phúc', 'Hà', 'Long', 'Thư', 'Kiên', 'My', 'Toàn'];
function classRanking(day) {
  const key = pmKey(day), sem = semOf(day), year = cal(day).year, rnd01 = mulberry([...key].reduce((a, ch) => a * 31 + ch.charCodeAt(0), 7) >>> 0);
  const rows = [];
  for (const [id, name, m, sp, hk] of PM_NAMED) rows.push({ name: name || (id === 'khoa' ? FRIENDS.khoa.name : HK_MATES.c10), avg: r1(clamp(m + (rnd01() * 2 - 1) * sp, 4.5, 9.8)), hk: r1(clamp(hk + (rnd01() * 2 - 1) * 0.8, 5, 10)) });
  for (const name of PM_OTHERS) rows.push({ name, avg: r1(clamp(6.6 + (rnd01() * 2 - 1) * 1.6, 4.2, 9.3)), hk: r1(clamp(8.6 + (rnd01() * 2 - 1) * 1.6, 4.5, 10)) });
  const rep = semReport(key), hk = conductAvg(year, sem.id);
  rows.push({ name: G.name, me: true, avg: rep.avg === null ? 0 : rep.avg, hk, rawHl: rep.hl });
  for (const r of rows) r.hl = capByConduct(r.me ? r.rawHl : hocLuc(r.avg, r.avg, r.avg), r.hk);
  rows.sort((a, b) => b.avg - a.avg || b.hk - a.hk || (a.me ? 1 : -1));
  rows.forEach((r, i) => { r.rank = i + 1; });
  return rows;
}
function rankingHtml(rows) {
  const cnt = k => rows.filter(r => r.hl === k).length;
  let h = `<p>Sĩ số <b>${rows.length}</b> · Giỏi <b>${cnt('Giỏi')}</b> · Khá <b>${cnt('Khá')}</b> · Trung bình <b>${cnt('Trung bình')}</b> · Yếu <b>${cnt('Yếu')}</b></p>`;
  h += '<div class="pm-rank"><table class="tb"><tr><th>Hạng</th><th>Học sinh</th><th>ĐTB</th><th>Học lực</th><th>Hạnh kiểm</th></tr>';
  for (const r of rows) h += `<tr class="${r.me ? 'me' : ''}"><td>${r.rank <= 3 ? ['🥇', '🥈', '🥉'][r.rank - 1] : r.rank}</td><td>${r.name}${r.me ? ' (bạn)' : ''}</td><td><b>${fmtAvg(r.avg)}</b></td><td>${r.hl}</td><td>${hanhKiem(r.hk)} (${fmtAvg(r.hk)})</td></tr>`;
  return h + '</table></div>';
}

/* ---------- mỗi khung hình (gọi từ eventTick): tới trường trong giờ họp là vào cảnh họp; quá 11:00 chưa tới là vắng ---------- */
function pmTick() {
  if (!pmOn() || RT.lock || UI.isOpen() || RT.scene) return false;
  const S = pmState(G.day);
  if (S.done || S.absent) return false;
  if (G.time >= PM.to) { pmAbsent(); return true; }
  if (G.time >= PM.from && ['school', 'class'].includes(G.map)) { pmMeeting(); return true; }
  return false;
}
function pmAbsent() {
  const S = pmState(G.day), who = pmParent(G.day), rows = classRanking(G.day), me = rows.find(r => r.me);
  S.absent = true; S.rank = me.rank;
  const next = SEMESTERS.find(q => q.id === semOf(G.day).id + 1), base = cal(G.day).year * YEAR_DAYS;
  let due = -1; for (let d = next ? base + next.from : base + YEAR_DAYS; d < (next ? base + next.to : base + YEAR_DAYS + 60); d++) if (isSchoolDay(d)) { due = d; break; }
  G.pmPen = { due, pts: PM.pen, sem: semOf(G.day).name };
  addParent(-8, 'vắng mặt buổi họp phụ huynh', true);
  pmAwards(rows, me, true);
  UI.ask(PNAME[who], `<p>“Con đi đâu mà không lên trường? Cô chủ nhiệm hỏi mãi, bố mẹ ngại quá!”</p><p class="dim">Vắng họp phụ huynh: tuần đầu học kỳ sau bị trừ <b>${PM.pen} điểm hạnh kiểm</b>. Lớp xếp bạn hạng <b>${me.rank}/${rows.length}</b>.</p>`, ['Con xin lỗi…'], { who: { look: who } });
}
// trừ hạnh kiểm vì vắng họp: ngày học đầu tiên của học kỳ sau (gọi trong beginDay)
function pmNewDay() {
  if (G.pmPen && G.pmPen.due >= 0 && G.day >= G.pmPen.due && isSchoolDay(G.day)) {
    G.conduct = Math.max(0, r1(G.conduct - G.pmPen.pts));
    RT.morning.push(`Vắng buổi họp phụ huynh cuối ${G.pmPen.sem}: bị trừ ${G.pmPen.pts} điểm hạnh kiểm (còn ${fmtScore(G.conduct)}).`);
    G.pmPen = null;
  }
}
// huy hiệu Học bá (hạng 1), đội tuyển học sinh giỏi (cuối HK2, top 3)
function pmAwards(rows, me, quiet) {
  const out = [];
  if (me.rank === 1 && addMemo('badge', 'hocba')) out.push('hocba');
  if (semOf(G.day).id === SEMESTERS.length && me.rank <= 3) { G.hsg = G.hsg || {}; if (!G.hsg[cal(G.day).year]) { G.hsg[cal(G.day).year] = { grade: G.grade, rank: me.rank }; addMemo('badge', 'hsg'); out.push('hsg'); } }
  return out;
}

/* ---------- cảnh họp phụ huynh trong lớp ---------- */
async function pmMeeting() {
  if (RT.lock) return;
  RT.lock = true;
  const S = pmState(G.day), who = pmParent(G.day), sem = semOf(G.day), rows = classRanking(G.day), me = rows.find(r => r.me), n = rows.length;
  const T = TEACHERS.hanh, X = CLASS_X, Y = CLASS_Y, seat = (c, r, sd) => [X[c] + 7 + sd * 14, Y[r] + 30];
  // phụ huynh ngồi kín các bàn, bố / mẹ mình ngồi chỗ của mình; mình đứng ở cửa lớp nhìn vào
  const actors = [{ look: T.look, x: 160, y: 52, dir: 0 }];
  const [px, py] = seat(1, 1, 0); actors.push({ look: who, outfit: who === 'mom' ? 'noapron' : null, x: px, y: py, dir: 3 });
  const others = ['ph1', 'ph2', 'ph3', 'ph4', 'ph5', 'ph6', 'ph7', 'ph8'];
  let k = 0; for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) for (let sd = 0; sd < 2; sd++) { if ((c === 1 && r === 1 && sd === 0) || (r * 4 + c + sd) % 3 === 2) continue; const [x, y] = seat(c, r, sd); actors.push({ look: others[k++ % others.length], x, y, dir: 3 }); }
  const hlMe = me.hl, praise = me.rank === 1 ? `Em ${G.name} đứng đầu lớp — một “học bá” thực thụ!` : me.rank <= 3 ? `Em ${G.name} nằm trong tốp 3 của lớp, rất đáng khen.` : me.rank <= 10 ? `Em ${G.name} học khá ổn, cố thêm chút nữa sẽ vào tốp đầu.` : hlMe === 'Yếu' ? `Em ${G.name} cần cố gắng nhiều hơn, học kỳ sau gia đình kèm cặp thêm nhé.` : `Em ${G.name} học ở mức trung bình của lớp, cần chăm chỉ hơn.`;
  const pRe = me.rank <= 3 ? 'Dạ, gia đình cảm ơn cô đã dạy dỗ cháu ạ!' : hlMe === 'Yếu' ? 'Dạ… về nhà tôi sẽ nhắc cháu học hành nghiêm túc hơn.' : 'Dạ, gia đình sẽ động viên cháu cố gắng thêm ạ.';
  const hsg = sem.id === SEMESTERS.length && me.rank <= 3;
  await playCut({
    map: 'class', me: [288, 204, 3], cam: { x: 168, y: 104 }, title: `Họp phụ huynh · ${sem.name}`, actors,
    steps: [
      { say: [0, `Kính chào các bậc phụ huynh. Hôm nay lớp 10A1 họp tổng kết ${sem.name.toLowerCase()}.`] },
      { say: [0, 'Sau đây cô xin thông báo kết quả học tập và xếp hạng của từng em trong lớp.'] },
      { live: () => UI.ask(`Bảng xếp hạng lớp ${G.grade}A1 · ${sem.name}`, rankingHtml(rows) + '<p class="dim">Học lực bị giới hạn bởi hạnh kiểm của kỳ: dưới 8 không được Giỏi, dưới 6 không được Khá, dưới 5 không được Trung bình.</p>', ['Tiếp tục'], { wide: true }) },
      { say: [0, `${praise} Hạng ${me.rank}/${n}, học lực ${hlMe.toLowerCase()}, hạnh kiểm ${hanhKiem(me.hk).toLowerCase()}.`] },
      { say: [1, pRe] },
      ...(hsg ? [{ say: [0, `Nhà trường chọn em ${G.name} vào đội tuyển học sinh giỏi để chuẩn bị cho kỳ thi học sinh giỏi quốc gia. Chúc mừng gia đình!`] }, { say: ['me', 'Woa… mình được vào đội tuyển rồi!'] }] : []),
      { say: ['me', me.rank <= 3 ? '(Nghe cô khen mà vui quá!)' : '(Lần sau phải cố gắng hơn mới được…)'] },
    ],
  });
  S.done = true; S.rank = me.rank;
  addMemo('scene', 'hopph');
  if (me.rank === 1) addParent(10, 'đứng đầu lớp', true); else if (me.rank <= 3) addParent(6, 'lọt tốp 3 của lớp', true); else if (hlMe === 'Yếu') addParent(-6, 'học lực yếu', true);
  advanceTime(Math.max(0, Math.min(PM.to, G.time + 90) - G.time));
  pmAwards(rows, me);
  RT.lock = false; UI.hud();
}
