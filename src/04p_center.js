'use strict';
/* ============================================================
 *  04p. TRUNG TÂM SAO MAI (phố nhà mình): sảnh lễ tân + phòng học thêm
 *  - Cửa trung tâm trên phố → vào sảnh. Chị lễ tân nhận đăng ký học thêm (chọn môn, đóng học phí từng buổi).
 *  - Đăng ký xong: cảnh đi vào phòng học bên trong, ngồi vào bàn, thầy giảng trên bảng, hết buổi ra về.
 *  - Giờ học: ngày đi học sau giờ tan học → 20:00 · ngày nghỉ 08:00 → 19:00 (như trước). Mỗi buổi 90 phút.
 * ============================================================ */
const CENTER = { open: [420, 1260], room: 'saomai' };
Object.assign(LOOKS, {
  letan: { hair: '#3a2430', style: 'long', shirt: '#3b6fb6', pants: '#2a2136', clip: '#ffd23a', eye: 'smile', collar: '#fbfdff' },          // chị lễ tân
  tutor: { hair: '#2c2733', style: 'side', shirt: '#fbf7ee', pants: '#3a3f55', tie: '#3b6fb6', glasses: true, glassCol: '#3a3340' },     // thầy dạy thêm
});
const centerClassOpen = () => (schoolToday() ? inWin(G.time, schoolEndT(), 1200) : inWin(G.time, 480, 1140));
const CENTER_DESKS = (() => { const a = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) a.push([28 + c * 62, 74 + r * 38]); return a; })();
const CENTER_SEAT = [CENTER_DESKS[4][0] + 7, CENTER_DESKS[4][1] + 30];        // chỗ mình ngồi (bàn giữa)

function buildCenter() {
  const m = roomBase(CENTER.room, 'Trung tâm Sao Mai', '#e6eef8', '#9fb6d6', 'ltile', 22, 14);
  roomExit(m, { map: 'town', x: 479, y: 136, dir: 0 });
  m.labels.push({ x: 286, y: 14, text: 'TRUNG TÂM SAO MAI', size: 5.2, col: '#3b6fb6', maxw: 90 }, { x: 286, y: 23, text: 'LỄ TÂN · ĐĂNG KÝ HỌC', size: 4, col: '#5f6b7a', maxw: 90 });
  // vách ngăn giữa phòng học (trái) và sảnh lễ tân (phải); lối đi ở phía dưới
  paint(m, 'walltop', 14, 2, 1, 8, 1);
  // phòng học: bảng trắng, bàn thầy, 9 bàn học viên
  R(m.x, '#8b8f9c', 46, 6, 132, 22); R(m.x, '#fbfdff', 48, 8, 128, 18); R(m.x, '#3b6fb6', 56, 12, 60, 2); R(m.x, '#e2574c', 56, 17, 44, 2); R(m.x, '#8fa0ab', 120, 12, 48, 1); R(m.x, '#8fa0ab', 120, 16, 40, 1);
  m.labels.push({ x: 112, y: 30, text: 'PHÒNG HỌC', size: 3.8, col: '#5f6b7a', maxw: 60 });
  addObj(m, { s: 'tdesk', x: 158, y: 36, sol: [1, 2, 32, 19] });
  for (const [a, b] of CENTER_DESKS) addObj(m, { s: 'sdesk', x: a, y: b, sol: [1, 2, 28, 10] });
  // sảnh lễ tân: quầy, sofa chờ, bảng lịch học, cây
  drawWin(m.x, 300, 9, 22, 13);
  for (const a of [252, 268, 284]) addObj(m, { s: 'counter', x: a, y: 56, sol: [1, 4, 16, 23] });
  R(m.x, '#2a2136', 316, 40, 22, 26); R(m.x, '#fff6e3', 317, 41, 20, 24); for (let i = 0; i < 5; i++) R(m.x, ['#e2574c', '#3b82c4', '#5fae4a', '#f2a93b', '#7a5fc9'][i], 319, 44 + i * 4, 4, 2), R(m.x, '#8fa0ab', 325, 44 + i * 4, 10, 1);
  addObj(m, { s: 'sofa', x: 252, y: 128, sol: [1, 4, 44, 16] });
  addObj(m, { s: 'plant', x: 318, y: 120, sol: [2, 14, 12, 9] }); addObj(m, { s: 'plant', x: 244, y: 30, sol: [2, 14, 12, 9] });
  NPCS.push({ id: 'sm_letan', name: 'Chị lễ tân', look: 'letan', map: CENTER.room, x: 276, y: 50, dir: 0, vis: () => !sceneHides('sm_letan'), label: () => 'Chị lễ tân — đăng ký học thêm', act: () => ACT.centerDesk() });
  NPCS.push({ id: 'sm_thay', name: 'Thầy Bình', look: 'tutor', map: CENTER.room, x: 112, y: 52, dir: 0, vis: () => centerClassOpen() && !sceneHides('sm_thay'), label: () => 'Thầy Bình — đăng ký ở quầy lễ tân để vào học', act: () => UI.ask('Thầy Bình', '<p>“Em muốn học thì ra quầy lễ tân đăng ký với chị lễ tân trước nhé.”</p>', ['Dạ'], { who: { look: 'tutor' } }) });
  [['x1', 0], ['x2', 2], ['sG', 6], ['x4', 8]].forEach(([look, k], i) => { const [a, b] = CENTER_DESKS[k]; NPCS.push({ id: 'sm_hv' + i, name: 'Học viên', look, map: CENTER.room, x: a + 7 + (i % 2) * 14, y: b + 30, dir: 3, vis: () => centerClassOpen() && !sceneHides('sm_hv' + i), label: () => 'Học viên đang chép bài', act: () => UI.toast('Bạn ấy đang chăm chú chép bài, đừng làm phiền.') }); });
}
// cửa trung tâm trên phố: vào sảnh lễ tân
ACT.center = async () => {
  if (RT.lock) return;
  if (!inWin(G.time, CENTER.open[0], CENTER.open[1])) return UI.say('Trung tâm Sao Mai', `Trung tâm đã đóng cửa.<p class="dim">Mở cửa ${fmtTime(CENTER.open[0])}–${fmtTime(CENTER.open[1])}. Lớp học: ngày đi học sau giờ tan học đến 20:00 · ngày nghỉ 08:00–19:00.</p>`);
  if (G.ride) dismount(true);
  const e = MAPS[CENTER.room].entry; await goPlace(CENTER.room, e[0], e[1], e[2], 0);
};
// quầy lễ tân: đăng ký buổi học → cảnh vào phòng học
ACT.centerDesk = async () => {
  if (RT.lock) return;
  const who = { look: 'letan' };
  if (!centerClassOpen()) return UI.ask('Chị lễ tân', `<p>“Giờ này không có lớp em ạ.”</p><p class="dim">Lớp học: ngày đi học sau giờ tan học đến 20:00 · ngày nghỉ 08:00–19:00.</p>`, ['Dạ'], { who });
  if (G.money < TUTOR.price) return UI.ask('Chị lễ tân', `<p>“Học phí mỗi buổi ${fmtMoney(TUTOR.price)} em nhé. Em chưa đủ tiền rồi.”</p>`, ['Dạ'], { who });
  if (G.stamina < TUTOR.stam) return UI.ask('Chị lễ tân', '<p>“Trông em mệt lắm, về nghỉ đi rồi hôm khác học nhé.”</p>', ['Dạ'], { who });
  const H = typeof hsgCur === 'function' && hsgCur();
  const c = await UI.ask('Chị lễ tân · đăng ký học thêm', `<p>“Chào em! Em muốn đăng ký học môn nào? Học phí <b>${fmtMoney(TUTOR.price)}</b> một buổi, học 90 phút.”</p>${H ? `<p class="dim">Đang trong đội tuyển HSG môn ${SUBJ[H.subj].name}: học thêm đúng môn này giúp lên hạng khi thi.</p>` : ''}`, BOOK_SUBJ.map(s => SUBJ[s].name).concat('Thôi'), { grid: true, who });
  if (c < 0 || c >= BOOK_SUBJ.length) return;
  await centerLesson(BOOK_SUBJ[c]);
};
async function centerLesson(s) {
  RT.lock = true;
  const S = SUBJ[s], [sx, sy] = CENTER_SEAT;
  addMoney(-TUTOR.price);
  await playCut({ inPlace: true, bars: false, title: `Học thêm ${S.name}`, cam: { x: 150, y: 110 },
    actors: [{ look: 'letan', x: 276, y: 50, dir: 0 }, { look: 'tutor', x: 112, y: 52, dir: 0 }], hide: ['sm_letan', 'sm_thay'],
    props: [() => { wRect('#fffaf0', sx - 4, sy - 30, 8, 5); wRect('#8fa0ab', sx - 3, sy - 28, 6, 1); }],
    steps: [
      { say: [0, `Lớp ${S.name} đang học ở phòng bên trong, em vào ngồi bàn giữa nhé!`] },
      { move: ['me', 236, 184, 500] }, { move: ['me', sx, 184, 700] }, { move: ['me', sx, sy, 600] }, { fn: () => { G.dir = 3; } },
      { say: [1, `Chào em! Hôm nay thầy chữa đề ${S.name} nâng cao, các em chép bài nhé.`] },
      { move: [1, 80, 48, 600] }, { move: [1, 150, 48, 900] }, { move: [1, 112, 52, 500] },
      { live: async () => { await UI.progress(`Đang học thêm ${S.name}… (90 phút)`, UI._fast ? 10 : 2200, S.color); } },
      { say: [1, 'Hôm nay đến đây thôi. Về nhà làm hết bài tập thầy giao nhé!'] },
      { move: ['me', sx, 184, 500] }, { move: ['me', 270, 184, 700] },
    ] });
  advanceTime(TUTOR.mins); useStam(TUTOR.stam); addStat(s, TUTOR.pts);
  const k = semKey(G.day) || 'x', T = ((G.tutor = G.tutor || {})[k] = G.tutor[k] || {}); T[s] = (T[s] || 0) + 1;
  if (typeof hsgNoteStudy === 'function') hsgNoteStudy(s, 'tutor');
  RT.lock = false; UI.hud();
  const n = T[s];
  UI.toast(`Xong buổi học thêm ${S.name} (+${TUTOR.pts} điểm môn). Đã học ${n} buổi học kỳ này: bài kiểm tra môn này +${fmtScore(Math.min(STUDY.tutorMax, STUDY.tutor * n))} điểm (tối đa +${fmtScore(STUDY.tutorMax)}).`, 'good');
}
