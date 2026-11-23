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
  const caught = Math.random() < ev.risk + 0.05 * G.caughtCycle, light = ev.sev === 1 && G.caughtCycle === 0, { co } = classTeacher();
  if (inClassScene()) await playCut(classFunCut(ev.id, fid, caught ? (light ? 'light' : 'hard') : null));
  L.push(li(`${ev.join} cùng ${F.name}, hơi mất tập trung.`, 'warn'));
  if (ev.stam) G.stamina = Math.min(maxStam(), G.stamina + ev.stam);
  if (caught) { L.push(...caughtInClass(ev)); if (!light && FUN_KIND[ev.id].take) L.push(li(FUN_KIND[ev.id].take.replace(/\{co\}/g, co).replace(/^./, c => c.toUpperCase()), 'warn')); }
  else L.push(li(`${co[0].toUpperCase() + co.slice(1)} không để ý. Trót lọt!`, 'dim'));
  return { delta: -2, lines: L };
}
// Bị cô bắt: lỗi nhẹ lần đầu chỉ nhắc nhở; lỗi nặng hoặc tái phạm thì trừ hạnh kiểm và có thể báo phụ huynh
function caughtInClass(ev) {
  addMemo('scene', 'caught');
  const n = ++G.caughtCycle, L = [], { co } = classTeacher(), Co = co[0].toUpperCase() + co.slice(1);
  if (ev.sev === 1 && n === 1) { L.push(li(`Bị ${co} bắt gặp! Lỗi nhẹ, lần đầu nên ${co} chỉ nhắc nhở.`, 'warn')); return L; }
  L.push(li(`Bị ${co} bắt quả tang${ev.id && ev.sev === 2 ? ' dùng điện thoại trong giờ' : ''}${n > 1 ? ` — lần thứ ${n} trong kỳ hạnh kiểm này` : ''}.`, 'bad'));
  addConduct(-(n >= 3 ? 1 : 0.5), 'làm việc riêng trong giờ học'); addTeacher(TEACHER.caughtFun);
  const pCall = ev.sev === 2 ? (n > 1 ? 0.5 : 0.25) : 0.15;
  if (Math.random() < pCall) { addParent(PARENT.teacherCall, `${co} giáo gọi điện báo phụ huynh`); L.push(li(`${Co} gọi điện báo về gia đình.`, 'bad')); }
  else L.push(li(`${Co} phê bình trước lớp nhưng không báo phụ huynh.`, 'dim'));
  return L;
}

/* ---------- hoạt cảnh trong giờ học: làm việc riêng & bị thầy cô bắt quả tang ---------- */
// Hai đứa chụm đầu vào nhau ở đâu: f = chỗ bạn (x, y, hướng), me = chỗ mình, p = chỗ đặt đồ, t = đường thầy cô đi xuống (điểm cuối kèm hướng nhìn)
const FUN_SPOT = {
  khoa: { f: [125, 134, 1], me: [111, 134, 2], p: [118, 121], t: [[158, 62], [158, 124], [149, 124, 1]] },
  ngan: { f: [78, 134, 2], me: [109, 134, 1], p: [93, 121], t: [[92, 62], [92, 112, 0]] },
  dat: { f: [111, 168, 3], me: [111, 134, 0], p: [108, 142], t: [[158, 62], [158, 152], [138, 152, 1]] },
  vy: { f: [161, 134, 1], me: [113, 134, 2], p: [144, 121], t: [[176, 62], [176, 112, 0]], mate: ['khoa', 128, 134, 2] },
  quang: { f: [97, 134, 2], me: [111, 134, 1], p: [104, 121], t: [[92, 62], [92, 112, 0]] },
  back: { f: [172, 164, 1], me: [146, 164, 2], p: [154, 162], t: [[158, 62], [158, 144, 0]] },
};
// {co} = cô / thầy. lead: câu mở đầu khi chỉ diễn cảnh bị bắt (sau một trò khác)
const FUN_KIND = {
  banhtrang: { title: 'ăn vụng bánh tráng trộn', prop: 'snack', laugh: false,
    intro: [[0, 'Bánh tráng trộn nè, bốc một nhúm đi!'], ['me', 'Cho tớ một miếng… cay xé lưỡi!'], [0, 'Hít hà… khẽ thôi kẻo {co} nghe!']],
    catchT: 'Mùi gì thơm thế này? À, ra là hai em ăn quà trong giờ!', take: 'Bịch bánh này {co} giữ. Ra chơi hãy ăn!' },
  tam: { title: 'tám chuyện', prop: 'whisper', laugh: true, stand: true,
    intro: [[0, 'Nè… hôm qua tớ thấy chuyện này hay lắm…'], ['me', 'Thật á?! Kể tiếp đi!'], [0, 'Suỵt… nhỏ thôi, nghe nè…']],
    catchT: 'Hai em nói chuyện gì vui thế? Đứng dậy kể cho cả lớp cùng nghe!' },
  game: { title: 'chơi game dưới gầm bàn', prop: 'phone',
    intro: [[0, 'Vào trận nhanh, đội tớ thiếu một người!'], ['me', 'Vào rồi! Né… né… bắn nó đi!'], [0, 'Sắp thắng rồi, giữ trụ!']],
    catchT: 'Thắng chưa em? Có cần {co} vào đội cùng không?', take: 'Điện thoại {co} thu. Cuối buổi lên văn phòng gặp {co} mà lấy!' },
  video: { title: 'xem video hài', prop: 'phone', ear: true, laugh: true,
    intro: [[0, 'Video này hài lắm, đeo một bên tai nghe vào!'], ['me', 'Hí hí… ha ha ha…'], [0, 'Khúc này mới mắc cười nè, hí hí…']],
    catchT: 'Có gì vui thế? Mở to lên cho cả lớp cùng xem nào!', take: 'Điện thoại với tai nghe {co} giữ. Cuối buổi lên gặp {co}!' },
  duel: { title: 'đấu thẻ dưới gầm bàn', prop: 'cards', lead: [0, 'Lá này PT 9 đó, đỡ nổi không?'],
    catchT: 'Hai em cúi gằm xuống gầm bàn làm gì đấy?', take: 'Xấp thẻ này {co} giữ tới cuối giờ!' },
  danhbai: { title: 'đánh bài cuối lớp', prop: 'deck', spot: 'back', lead: [0, 'Đôi heo! Chặt nè!'],
    catchT: 'Ai cho các em ngồi đánh bài trong lớp?!', take: 'Bộ bài này tịch thu! Cuối giờ lên văn phòng!' },
  conquay: { title: 'chọi con quay', prop: 'tops', spot: 'back', lead: ['me', 'Quay tiếp ván nữa!'],
    catchT: 'Con quay quay vui quá nhỉ? Hai em đứng lên!', take: 'Hai con quay này {co} giữ, cuối buổi lên mà lấy!' },
};
// hướng nhìn từ a về điểm b: 0 xuống · 1 trái · 2 phải · 3 lên
const faceTo = (a, b) => { const dx = b[0] - a.x, dy = b[1] - a.y; return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 2 : 1) : (dy > 0 ? 0 : 3); };
const classTeacher = () => { const l = (RT.scene && RT.scene.teacher) || 'teacherA'; return { look: l, co: l === 'teacherC' ? 'thầy' : 'cô' }; };
const inClassScene = () => !!(RT.scene && RT.scene.type === 'class');
// Đồ của trò đang chơi (điện thoại, bịch bánh, bài, con quay…) + phấn viết bảng, dấu chấm than, mồ hôi
function funProps(K, p) {
  const item = (x, y, now, held) => {
    if (K.prop === 'phone') {
      if (!held) wRect('rgba(150,230,255,0.28)', x - 2, y - 2, 9, 11);
      wRect('#2a2136', x, y, 5, 7); const f = Math.floor(now / 150);
      if (K.ear) { wRect(f % 4 < 2 ? '#ffe066' : '#ff9fc4', x + 1, y + 1, 3, 5); wRect('#fffaf0', x + 2, y + 2 + f % 2, 1, 1); }
      else { wRect('#3b6fb6', x + 1, y + 1, 3, 5); wRect('#ffe066', x + 1 + f % 3, y + 4, 1, 1); wRect('#ff5fa8', x + 3 - (f >> 1) % 3, y + 2, 1, 1); }
    } else if (K.prop === 'snack') { wRect('rgba(255,255,255,0.8)', x, y, 6, 6); wRect('#e98a3c', x + 1, y + 2, 4, 3); wRect('#5fae4a', x + 2, y + 3, 1, 1); wRect('#c0392b', x + 4, y + 2, 1, 1); wRect('#d9534f', x + 2, y, 2, 1); }
    else if (K.prop === 'cards' || K.prop === 'deck') { drawSpr(SPR.cardBack, x - 3, y); drawSpr(SPR.cardFace, x + 2, y - 1 - (held ? 0 : Math.floor(now / 380) % 2)); }
    else if (K.prop === 'tops') { drawSpr(SPR.top0, x - 4, y); drawSpr(SPR.topB0, x + 3, y); }
  };
  return [now => {
    const sc = RT.scene, st = sc.st || {}, T = sc.actors[1], fr = sc.actors[0];
    if (st.write) { const n = Math.floor(now / 110) % 30; wRect('#eef7ee', T.x - 13, 14, Math.min(n, 14), 1); if (n > 14) wRect('#eef7ee', T.x - 13, 18, n - 14, 1); }
    if (st.bang) drawSpr(SPR.emoBang, T.x - 3, T.y - 38 - (Math.floor(now / 150) % 2));
    if (st.laugh) { const j = Math.floor(now / 110) % 2; sc.meOy = -j; fr.oy = j - 1; } else { sc.meOy = 0; fr.oy = 0; }
    if (st.held) item(T.x + 4, T.y - 13, now, true);
    else if (st.show && !st.hidden) {
      const [x, y] = p;
      if (K.prop === 'whisper') { const wx = Math.round((G.x + fr.x) / 2), wy = Math.min(G.y, fr.y) - 33; wRect('#2a2136', wx - 5, wy, 11, 6); wRect('#fffaf0', wx - 4, wy + 1, 9, 4); wRect('#2a2136', wx - 1, wy + 6, 2, 1); for (let i = 0; i < 3; i++) if (Math.floor(now / 220) % 4 > i) wRect('#2a2136', wx - 3 + i * 3, wy + 2, 1, 1); }
      else if (K.prop === 'deck') cardsProp(now, x - 1, y + 1);
      else if (K.prop === 'tops') { topProp(now, x - 1, y + 8, 'top', 0); topProp(now, x + 8, y + 8, 'topB', 1); }
      else item(x - 2, y - 3, now, false);
      if (K.ear) for (const [hx, hy] of [[G.x, G.y], [fr.x, fr.y]]) for (let k = 1; k < 8; k++) wRect('#5f656f', x + (hx - x) * k / 8, y - 3 + (hy - 16 - y + 3) * k / 8, 1, 1);
      if (K.prop === 'snack') { const t = (now / 700) % 1, a = Math.floor(now / 700) % 2 ? fr : G; wRect('#e98a3c', x + (a.x - x) * t, y - 2 + (a.y - 14 - y) * t, 1, 1); }
    }
    if (st.sweat) for (const a of [G, fr]) wRect('#7fc8f0', a.x + 6, a.y - 25 + (Math.floor(now / 200) % 3), 2, 3);
  }];
}
// kind: một trong FUN_KIND · caught: null (trót lọt) | 'light' (nhắc nhở) | 'hard' (bắt quả tang, tịch thu) · only: chỉ diễn đoạn bị bắt
function classFunCut(kind, fid, caught, only) {
  const K = FUN_KIND[kind], F = FRIENDS[fid], S = FUN_SPOT[K.spot || fid] || FUN_SPOT.khoa, { look, co } = classTeacher();
  const Co = co[0].toUpperCase() + co.slice(1), say = (who, t) => ({ say: [who, t.replace(/\{co\}/g, co)] });
  const actors = [{ look: fid, x: S.f[0], y: S.f[1], dir: S.f[2] }, { look, x: 160, y: 46, dir: 3 }];
  const hide = [fid]; if (S.mate) { actors.push({ look: S.mate[0], x: S.mate[1], y: S.mate[2], dir: S.mate[3] }); hide.push(S.mate[0]); }
  const st = (o) => ({ fn: sc => Object.assign(sc.st || (sc.st = {}), o) }), path = S.t, end = path[path.length - 1];
  const steps = [st({ write: true, show: true })];
  if (only) { steps.push({ wait: 700 }); if (K.lead) steps.push(say(...K.lead)); }
  else for (const [i, l] of (K.intro || (K.lead ? [K.lead] : [])).entries()) { if (i === 1 && K.laugh) steps.push(st({ laugh: true })); steps.push(say(l[0], l[1])); }
  steps.push(st({ laugh: false }));
  if (!caught) {
    steps.push({ fn: sc => { const T = sc.actors[1]; T.dir = 0; sc.st.write = false; sc.st.hidden = true; sc.st.sweat = true; G.dir = 3; sc.actors[0].dir = 3; } });
    steps.push(say(1, pick(['Cả lớp chép bài vào vở nhé.', 'Trật tự nào! Ai còn nói chuyện đấy?', 'Bạn nào chưa hiểu chỗ nào thì hỏi nhé.'])), { wait: 300 });
    steps.push({ fn: sc => { sc.actors[1].dir = 3; sc.st.write = true; sc.st.sweat = false; } }, say('me', '(Hú hồn… suýt nữa thì toi!)'));
    return { map: 'class', me: S.me, cam: { x: 160, y: 96 }, title: `Trong giờ học · ${K.title}`, actors, hide, props: funProps(K, S.p), steps };
  }
  steps.push({ fn: sc => { sc.st.write = false; sc.st.bang = true; sc.actors[1].dir = 0; } }, { wait: 500 });
  for (const q of path) steps.push({ move: [1, q[0], q[1], 520] });
  steps.push({ fn: sc => { sc.st.bang = false; sc.actors[1].dir = end[2]; G.dir = faceTo(G, end); sc.actors[0].dir = faceTo(sc.actors[0], end); if (K.prop === 'whisper') sc.st.show = false; } });
  steps.push(say(1, K.catchT));
  if (K.stand || caught === 'hard') steps.push({ par: [{ hop: 'me' }, { hop: 0 }] });
  steps.push(st({ sweat: true }), say('me', `Dạ… em xin lỗi ${co} ạ…`));
  if (caught === 'hard' && K.take) steps.push(st({ held: true }), say(1, K.take));
  steps.push(say(0, 'Em… em không dám nữa ạ…'));
  steps.push(say(1, caught === 'light' ? `Lần đầu nên ${co} chỉ nhắc nhở thôi đấy. Tập trung vào bài!` : `Cuối giờ hai em ở lại gặp ${co}. ${Co} sẽ ghi vào sổ đầu bài!`));
  for (const q of path.slice(0, -1).reverse()) steps.push({ move: [1, q[0], q[1], 420] });
  steps.push({ move: [1, 160, 46, 420] }, { fn: sc => { sc.actors[1].dir = 3; sc.st.write = true; sc.st.sweat = false; } }, { wait: 500 });
  return { map: 'class', me: S.me, cam: { x: 160, y: 96 }, title: `Trong giờ học · ${K.title}`, actors, hide, props: funProps(K, S.p), steps };
}
// Bạn bị gọi lên bảng trả bài, mình ngồi dưới nhắc bài · caught: bị thầy cô phát hiện
const SEAT_OF = { khoa: [125, 134], vy: [191, 134], dat: [111, 168], quang: [47, 100] };   // chị Ngân học lớp 11 nên không có chỗ trong lớp
const SEAT_AISLE = { khoa: 150, vy: 170, ngan: 86, dat: 150, quang: 86 };
const PROMPT_HINT = { toan: ['bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông…', 'Dạ… bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông ạ!'], van: ['bài thơ viết năm 1948… tình đồng chí…', 'Dạ… bài thơ ra đời năm 1948, nói về tình đồng chí ạ!'], anh: ['have/has cộng quá khứ phân từ…', 'Dạ… thì hiện tại hoàn thành là have hoặc has cộng quá khứ phân từ ạ!'], ly: ['F bằng m nhân a…', 'Dạ… lực bằng khối lượng nhân gia tốc ạ!'], hoa: ['hai H một O…', 'Dạ… công thức của nước là H2O ạ!'], sinh: ['ti thể… nhà máy năng lượng…', 'Dạ… ti thể là nơi tạo năng lượng cho tế bào ạ!'], su: ['năm 1945… mùng 2 tháng 9…', 'Dạ… ngày 2 tháng 9 năm 1945 ạ!'], dia: ['sông Hồng… phù sa…', 'Dạ… đồng bằng sông Hồng do phù sa bồi đắp ạ!'] };
function promptCut(fid, subj, caught) {
  const F = FRIENDS[fid], S = SUBJ[subj], { look, co } = classTeacher(), Co = co[0].toUpperCase() + co.slice(1);
  const [sx, sy] = SEAT_OF[fid] || SEAT_OF.khoa, ax = SEAT_AISLE[fid] || 150, bx = 132, by = 60, [hint, ans] = PROMPT_HINT[subj] || ['trang 25 trong sách đó…', 'Dạ… như trong sách trang 25 ạ!'];
  const st = {};
  const go = [{ move: [0, ax, sy, 300] }, { move: [0, ax, 66, 500] }, { move: [0, bx, by, 300] }], back = [{ move: [0, ax, 66, 300] }, { move: [0, ax, sy, 500] }, { move: [0, sx, sy, 300] }];
  const prop = now => {
    const sc = RT.scene, T = sc.actors[1], fr = sc.actors[0];
    if (st.whisper) { const x = G.x + 8, y = G.y - 36; wRect('#2a2136', x - 1, y - 1, 13, 7); wRect('#fffaf0', x, y, 11, 5); for (let i = 0; i < 3; i++) if (Math.floor(now / 200) % 4 > i) wRect('#2a2136', x + 2 + i * 3, y + 2, 1, 1); wRect('#f8d0a8', G.x + 4, G.y - 22, 3, 3); }
    if (st.bang) drawSpr(SPR.emoBang, T.x - 3, T.y - 38 - (Math.floor(now / 150) % 2));
    if (st.sweat) for (const a of [G, fr]) wRect('#7fc8f0', a.x + 6, a.y - 25 + (Math.floor(now / 200) % 3), 2, 3);
    if (st.chalk) { const n = Math.floor(now / 120) % 16; wRect('#eef7ee', 110, 16, Math.min(n, 10), 1); }
  };
  const steps = [{ say: [1, `Em ${F.name}, lên bảng trả bài cũ!`] }, ...go, { fn: sc => { sc.actors[0].dir = 0; st.chalk = true; } },
    { say: [0, 'Dạ… thưa ' + co + '… bài này… ờ…'] }, { say: [1, 'Sao? Không thuộc bài à?'] },
    { fn: sc => { sc.actors[0].dir = faceTo(sc.actors[0], [G.x, G.y]); st.whisper = true; } }, { say: ['me', `(Pssst… ${hint})`] },
    { fn: sc => { st.whisper = false; sc.actors[0].dir = 0; } }, { say: [0, ans] }];
  if (caught) steps.push({ fn: sc => { st.bang = true; sc.actors[1].dir = faceTo(sc.actors[1], [G.x, G.y]); } }, { wait: 400 },
    { say: [1, `Em nào nhắc bài đấy? Em ${G.name}, đứng lên!`] }, { hop: 'me' }, { fn: () => { st.bang = false; st.sweat = true; } },
    { say: ['me', `Dạ… em xin lỗi ${co} ạ…`] }, { say: [1, `Cả hai em đều bị phê bình. ${F.name} về chỗ, lần sau học bài cho kỹ!`] }, ...back, { fn: sc => { sc.actors[0].dir = 3; } }, { say: [0, '(Tại tớ hết… xin lỗi nha.)'] });
  else steps.push({ say: [1, 'Ừ… cũng được. Lần sau học kỹ hơn nhé. Về chỗ!'] }, ...back, { fn: sc => { sc.actors[0].dir = faceTo(sc.actors[0], [G.x, G.y]); } }, { say: [0, '(Cảm ơn cậu nha, cứu tớ một bàn thua!)'] });
  return { map: 'class', me: [SEAT.x, SEAT.y, 3], cam: { x: 160, y: 96 }, title: `Trong giờ ${S.name} · nhắc bài cho ${F.name}`, hide: [fid], actors: [{ look: fid, x: sx, y: sy, dir: 3 }, { look, x: 186, y: 54, dir: 1 }], props: [prop], steps };
}
// Rủ nhau đi vệ sinh quá lâu: về tới cửa lớp thì bị hỏi tội
function wcCaughtCut(fid, light) {
  const { look, co } = classTeacher();
  return {
    map: 'class', me: [283, 216, 3], cam: { x: 220, y: 140 }, hide: [fid], title: `Về lớp muộn · bị ${co} hỏi tội`,
    actors: [{ look: fid, x: 299, y: 216, dir: 3 }, { look, x: 160, y: 46, dir: 3 }],
    props: [now => { const sc = RT.scene, st = sc.st || {}, T = sc.actors[1]; if (st.bang) drawSpr(SPR.emoBang, T.x - 3, T.y - 38 - (Math.floor(now / 150) % 2)); if (st.sweat) for (const a of [G, sc.actors[0]]) wRect('#7fc8f0', a.x + 6, a.y - 25 + (Math.floor(now / 200) % 3), 2, 3); }],
    steps: [{ par: [{ move: ['me', 283, 194, 600] }, { move: [0, 299, 194, 600] }] }, { fn: sc => { sc.st = { bang: true }; sc.actors[1].dir = 0; } }, { wait: 400 },
      { move: [1, 290, 60, 700] }, { move: [1, 290, 170, 600] }, { fn: sc => { sc.st.bang = false; sc.actors[1].dir = 0; sc.st.sweat = true; } },
      { say: [1, 'Hai em đi vệ sinh gì mà hết nửa tiết mới về?'] }, { say: ['me', `Dạ… tại đông người quá ạ…`] }, { say: [0, 'Dạ… tụi em xin lỗi ạ…'] },
      { say: [1, light ? 'Lần sau ra chơi hãy đi. Về chỗ ngồi!' : `Son phấn thế kia mà bảo đi vệ sinh à? Cuối giờ ở lại gặp ${co}!`] },
      { move: [1, 290, 60, 500] }, { move: [1, 160, 52, 600] }],
  };
}
// Cảnh bị bắt sau một trò khác (đấu thẻ, đánh bài, chọi con quay, đi vệ sinh lâu) — chỉ diễn khi đang trong lớp
async function caughtScene(fid, kind, sev) {
  if (!inClassScene()) return;
  const light = sev === 1 && G.caughtCycle === 0;
  await playCut(kind === 'wc' ? wcCaughtCut(fid, light) : classFunCut(kind, fid, light ? 'light' : 'hard', true));
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
  setMap('school', 150, 452, 0); setComp(fid, true);
  RT.lock = false; UI.hud(); addMemo('scene', 'skip');
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
  for (const k of ['thethao', 'th_hoa']) if (M[k]) addStat(statOfSubj(k), M[k]);
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
  addMemo('scene', 'caught');
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
  const r = gameRes(await playScene(P.game, d));                  // diễn ngay trên bàn thí nghiệm / sân tập (04m)
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
