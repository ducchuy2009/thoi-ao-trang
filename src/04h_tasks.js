'use strict';
/* ============================================================
 *  04h. VIỆC THẦY CÔ NHỜ
 *  - Bảng thông báo ở sân trường (cạnh căn tin): mỗi ngày học thầy cô dán thêm việc cần học sinh giúp
 *  - Việc có hạn chót (ngày + giờ) và thời gian cần làm; chỉ việc đã bấm "Nhận việc" mới vào danh sách nhiệm vụ
 *  - Danh sách nhiệm vụ: nút "Nhiệm vụ" cạnh menu (phím J) · chỗ cần tới có dấu chấm than vàng
 *  - Làm xong: thêm điểm thân thiết với thầy cô + ít tiền công (trả cuối ngày) · nhận rồi mà quá hạn: thầy cô buồn
 * ============================================================ */
const tName = tid => TEACHERS[tid].name;
const tLow = tid => tName(tid).replace(/^./, c => c.toLowerCase());          // “thầy Tùng”, “cô Lan” (giữa câu)
const taskById = uid => G.tasks.active.find(t => t.uid === uid) || G.tasks.board.find(t => t.uid === uid);
const taskWin = (T, k) => (T.steps[k] && T.steps[k].win) || T.win;
const taskLate = t => G.day > t.exp || (G.day === t.exp && G.time > TASKS[t.id].until);
const taskDeadline = t => `${dateLabel(t.exp)}, trước ${fmtTime(TASKS[t.id].until)}`;
const stepMins = T => Math.round(T.mins / T.steps.length);
const winText = (T, k) => { const w = taskWin(T, k || 0); return `làm được ${fmtTime(w[0])}–${fmtTime(w[1])}`; };
const daysLeft = t => t.exp - G.day;

// Đầu mỗi ngày: việc đã nhận mà quá hạn → thầy cô buồn; gỡ việc hết hạn; ngày học thì dán thêm việc mới
function taskNewDay() {
  const S = G.tasks;
  for (const t of S.active.filter(t => t.exp < G.day)) {
    const T = TASKS[t.id]; addTeacher(TASK_BOARD.failAff, T.tid, true);
    if (RT.morning) RT.morning.push(`Không kịp làm việc “${T.name}” — ${tName(T.tid)} hơi buồn vì em đã nhận mà không làm.`);
  }
  S.active = S.active.filter(t => t.exp >= G.day);
  S.board = S.board.filter(t => t.exp >= G.day);
  if (!schoolToday()) return;
  const busy = new Set(S.board.concat(S.active).map(t => t.id)), pool = Object.keys(TASKS).filter(k => !busy.has(k));
  let added = 0;
  while (S.board.length < TASK_BOARD.open && pool.length) {
    const id = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    S.board.push({ uid: ++S.seq, id, posted: G.day, exp: G.day + TASKS[id].days }); added++;
  }
  if (added && RT.morning) RT.morning.push(`Bảng thông báo ở sân trường có ${added} việc mới thầy cô cần giúp.`);
}

/* ---------- bảng thông báo ---------- */
function taskCard(t, mode) {
  const T = TASKS[t.id], tc = TEACHERS[T.tid], late = taskLate(t), dl = daysLeft(t);
  const where = T.steps.map((s, i) => (mode === 'active' ? `<span class="${i < t.step ? 'ok' : i === t.step ? 'cur' : ''}">${i < t.step ? '✓ ' : ''}${s.where}</span>` : s.where)).join(' → ');
  const due = `${taskDeadline(t)}${late ? ' — đã quá hạn' : dl === 0 ? ' — hôm nay!' : dl === 1 ? ' — còn 1 ngày' : ` — còn ${dl} ngày`}`;
  const reward = `+${T.aff} thân thiết với ${tLow(T.tid)} · ${fmtMoney(T.pay)}${T.stat ? ` · +${T.stat[1]} ${STAT_NAMES[T.stat[0]]}` : ''}`;
  const btn = mode === 'board' ? `<button class="btn sm primary" data-act="take" data-id="${t.uid}">Nhận việc</button>` : `<button class="btn sm ghost" data-act="drop" data-id="${t.uid}">Bỏ việc</button>`;
  return `<div class="task ${mode} ${late ? 'late' : ''}"><img src="${faceOf(tc.look, null)}" alt=""><div class="tbody"><b>${T.name}</b><small>${tc.name}: “${T.desc}”</small>
    <dl><dt>Ở đâu</dt><dd>${where}</dd><dt>Cần</dt><dd>khoảng ${T.mins} phút · ${winText(T, mode === 'active' ? t.step : 0)}</dd><dt>Hạn chót</dt><dd class="${late || dl === 0 ? 'bad' : ''}">${due}</dd><dt>Thưởng</dt><dd>${reward}</dd></dl></div>${btn}</div>`;
}
ACT.board = () => {
  if (RT.lock) return;
  UI.panel('Bảng thông báo — thầy cô cần giúp', () => {
    const S = G.tasks;
    let h = `<p class="dim">Việc thầy cô cần học sinh giúp. Chỉ việc bạn bấm <b>Nhận việc</b> mới vào danh sách nhiệm vụ (nút <b>Nhiệm vụ</b> cạnh menu, phím J). Làm xong được thầy cô quý hơn và ít tiền công (trả vào cuối ngày). Đã nhận mà để quá hạn thì thầy cô sẽ buồn.</p>`;
    h += S.board.length ? `<div class="tasks">${S.board.map(t => taskCard(t, 'board')).join('')}</div>` : '<p class="okbox">Hôm nay chưa có việc mới. Ngày học nào thầy cô cũng dán thêm việc lên bảng.</p>';
    h += `<p class="dim">Đang nhận ${S.active.length}/${TASK_BOARD.maxActive} việc · đã giúp thầy cô ${S.done} việc.</p>`;
    return h;
  }, { take: d => takeTask(+d.id) }, true);
};
async function takeTask(uid) {
  const S = G.tasks, t = S.board.find(x => x.uid === uid); if (!t) return;
  const T = TASKS[t.id];
  if (S.active.length >= TASK_BOARD.maxActive) return UI.toast(`Đang nhận ${TASK_BOARD.maxActive} việc rồi — làm xong bớt rồi hãy nhận thêm.`, 'bad');
  const c = await UI.ask(T.name, `<p>${tName(T.tid)} nhờ: “${T.desc}”</p><p>Cần khoảng <b>${T.mins} phút</b>, ${winText(T)}. Hạn chót: <b>${taskDeadline(t)}</b>.</p><p class="dim">Nhận rồi mà không làm kịp thì ${tLow(T.tid)} sẽ buồn đấy.</p>`, ['Em nhận việc này!', 'Thôi'], { who: { look: TEACHERS[T.tid].look } });
  if (c !== 0) return ACT.board();
  S.board = S.board.filter(x => x !== t);
  S.active.push(Object.assign(t, { step: 0, took: G.day }));
  UI.toast(`Đã nhận việc “${T.name}”. Xem trong danh sách Nhiệm vụ (cạnh menu).`, 'good');
  UI.hud(); ACT.board();
}

/* ---------- danh sách nhiệm vụ (cạnh menu) ---------- */
function questPanel() {
  UI.panel('Nhiệm vụ', () => {
    const S = G.tasks;
    let h = S.active.length ? `<div class="tasks">${S.active.map(t => taskCard(t, 'active')).join('')}</div>` : '<p class="okbox">Chưa nhận việc nào. Ra <b>bảng thông báo</b> ở sân trường (cạnh căn tin) xem thầy cô cần giúp gì nhé.</p>';
    h += `<p class="dim">Chỗ cần tới có dấu <b style="color:#c9962a">!</b> vàng nhấp nháy. Đi tới đó rồi bấm E (hoặc chuột phải) để làm. Đã giúp thầy cô ${S.done} việc.</p>`;
    return h;
  }, { drop: d => dropTask(+d.id) }, true);
}
async function dropTask(uid) {
  const t = G.tasks.active.find(x => x.uid === uid); if (!t) return;
  const T = TASKS[t.id];
  const c = await UI.ask('Bỏ việc', `<p>Bỏ việc “${T.name}”? ${tName(T.tid)} sẽ hơi buồn.</p>`, ['Bỏ việc', 'Thôi, để em làm']);
  if (c === 0) { G.tasks.active = G.tasks.active.filter(x => x !== t); addTeacher(TASK_BOARD.dropAff, T.tid, true); UI.toast(`Đã bỏ việc “${T.name}”.`, 'info'); UI.hud(); }
  questPanel();
}
// việc đang chờ mình làm ở chỗ này
const taskAt = (id, k) => G && G.tasks && G.tasks.active.find(t => t.id === id && t.step === k);
async function doTaskStep(id, k) {
  if (RT.lock) return;
  const t = taskAt(id, k); if (!t) return;
  const T = TASKS[id], s = T.steps[k], w = taskWin(T, k);
  if (taskLate(t)) return UI.say(T.name, `Đã quá hạn chót (${taskDeadline(t)}) mất rồi…`);
  if (!inWin(G.time, w[0], w[1])) return UI.say(T.name, `Việc này ${winText(T, k)}. Giờ chưa làm được.`);
  if (G.stamina < TASK_BOARD.stam) return UI.toast('Mệt quá, ăn gì đó đã rồi hãy làm.', 'bad');
  const last = k === T.steps.length - 1;
  await activity(`${s.do}…`, stepMins(T), () => { useStam(TASK_BOARD.stam, true); if (last) { G.tasks.active = G.tasks.active.filter(x => x !== t); G.tasks.done++; } else t.step++; });
  if (taskAt(id, k) === t) return;                 // bị chặn giữa chừng (đang bận việc khác)
  if (!last) { const nx = T.steps[k + 1]; UI.toast(`Xong: ${s.do.toLowerCase()}. Tiếp theo: ${nx.do.toLowerCase()} — ${nx.where}.`, 'good'); UI.hud(); return; }
  // hoàn thành
  addTeacher(T.aff, T.tid); addWage(`Giúp ${tLow(T.tid)}`, T.pay);
  if (T.stat) addStat(T.stat[0], T.stat[1]);
  UI.hud();
  const co = tName(T.tid).split(' ')[0].toLowerCase();
  await UI.ask(tName(T.tid), `<p>“Cảm ơn em nhiều nhé! Việc này em làm chu đáo lắm. Tiền công ${fmtMoney(T.pay)} cuối ngày ${co} gửi em.”</p>`, ['Dạ, không có gì ạ!'], { who: { look: TEACHERS[T.tid].look } });
}
// chỗ làm việc trên bản đồ: chỉ hiện (và bấm được) khi đang có việc ở bước đó
function buildTaskSpots() {
  for (const id in TASKS) TASKS[id].steps.forEach((s, k) => {
    const m = MAPS[s.map]; if (!m) return;
    addObj(m, { s: 'blank', x: s.x, y: s.y, ir: [-14, -20, 28, 30], vis: () => !!taskAt(id, k), label: () => `Việc ${tLow(TASKS[id].tid)} nhờ: ${s.do.toLowerCase()} (${stepMins(TASKS[id])} phút)`, act: () => doTaskStep(id, k) });
  });
  const sch = MAPS.school;
  addObj(sch, { s: 'bangtin', x: 144, y: 90, sol: [2, 24, 32, 6], label: () => `Bảng thông báo — thầy cô cần giúp${G.tasks.board.length ? ` (${G.tasks.board.length} việc)` : ''}`, act: () => ACT.board() });
  sch.labels.push({ x: 162, y: 95.5, text: 'THÔNG BÁO', size: 4.2, col: '#fffaf0', maxw: 26 });
}
// dấu chấm than vàng trên chỗ cần tới (vẽ mỗi khung hình)
function drawTaskMarkers(now) {
  if (!G.tasks || !G.tasks.active.length || (RT.scene && RT.scene.type === 'cut')) return;
  const b = Math.round(Math.sin(now / 180) * 2);
  for (const t of G.tasks.active) {
    const s = TASKS[t.id].steps[t.step]; if (!s || s.map !== G.map) continue;
    wRect('#2a2136', s.x - 3, s.y - 32 + b, 7, 11); wRect('#ffd23a', s.x - 2, s.y - 31 + b, 5, 9); wRect('#2a2136', s.x, s.y - 30 + b, 1, 4); wRect('#2a2136', s.x, s.y - 25 + b, 1, 1);
    if (Math.floor(now / 400) % 2) wRect('rgba(255,210,58,0.35)', s.x - 9, s.y - 2, 18, 5);
  }
  if (G.map === 'school' && G.tasks.board.length && schoolToday()) wRect(Math.floor(now / 500) % 2 ? '#e2574c' : '#ffd23a', 172, 86 + b, 4, 4);
}
// việc cần làm hôm nay (cho danh sách việc ở góc trái)
const taskTodo = () => (G.tasks ? G.tasks.active.filter(t => TASKS[t.id].steps[t.step]).map(t => { const T = TASKS[t.id], s = T.steps[t.step]; return [false, `${T.name}: ${s.do.toLowerCase()} — ${s.where} (hạn ${daysLeft(t) <= 0 ? 'hôm nay ' + fmtTime(T.until) : dateLabel(t.exp)})`]; }) : []);
