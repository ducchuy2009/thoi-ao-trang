'use strict';
/* ============================================================
 *  04e. SỰ KIỆN & KỶ NIỆM
 *  - Lưu bút: kỷ vật, khoảnh khắc, lời lưu bút (viết vào ngày tốt nghiệp)
 *  - Chùa: thắp nhang, lắc ống xăm
 *  - Tết: bố mẹ rủ đi chùa sáng mùng 1, lì xì, đi chúc Tết bạn bè và thầy cô
 *  - Đêm giao thừa: hội chợ trên núi sau trường (thời gian đứng yên), pháo hoa
 *  - Hội thi gói bánh chưng (chiều ngày học cuối cùng trước Tết)
 * ============================================================ */

/* ---------- LƯU BÚT ---------- */
function addMemo(kind, id) {
  const box = kind === 'item' ? G.memo.items : kind === 'badge' ? G.memo.badges : G.memo.scenes, D = (kind === 'item' ? MEMO_ITEMS : kind === 'badge' ? MEMO_BADGES : MEMO_SCENES)[id];
  if (!D || box[id] !== undefined) return false;
  box[id] = G.day;
  UI.toast(kind === 'badge' ? `Lưu bút: nhận danh hiệu “${D.name}”!` : `Lưu bút: ghi thêm “${D.name}”`, 'good');
  return true;
}
// Chụp lại khung hình đang hiện (phần giữa màn hình, bỏ hai dải đen của cắt cảnh) làm ảnh lưu bút. Chụp lần sau đè ảnh cũ.
// (wx, wy): điểm trên bản đồ đặt ở giữa ảnh · ww: bề ngang khung ảnh (đơn vị bản đồ)
function snapPhoto(id, wx, wy, ww) {
  try {
    const W = cv.width, H = cv.height, S = VIEW.S, cw = Math.round(Math.min(W * 0.9, (ww || 150) * S)), ch = Math.round(Math.min(cw * 0.625, H * 0.8));
    const sx = Math.round(clamp(VIEW.ox + wx * S - cw / 2, 0, W - cw)), sy = Math.round(clamp(VIEW.oy + wy * S - ch / 2, H * 0.085, H * 0.915 - ch));
    const c = mk(256, 160), x = c.getContext('2d'); x.imageSmoothingEnabled = true; x.filter = 'brightness(1.22) contrast(1.06) saturate(1.1)'; x.drawImage(cv, sx, sy, cw, ch, 0, 0, 256, 160);   // ánh đèn flash
    G.memo.pics[id] = c.toDataURL('image/jpeg', 0.72);
  } catch (e) { /* trình duyệt chặn đọc canvas: bỏ qua ảnh, vẫn ghi kỷ vật */ }
}
// Đèn flash khi chụp ảnh (vẽ đè cả màn hình, mờ dần)
const flashGlow = t0 => now => { const k = (now - t0) / 600; if (k >= 0 && k < 1) { ctx.fillStyle = `rgba(255,255,255,${1 - k})`; ctx.fillRect(0, 0, cv.width, cv.height); } };
// Ai sẽ viết lưu bút: bạn thân, thầy cô, bố mẹ — đủ thân vào ngày tốt nghiệp thì viết
function memoPeople() {
  const a = [];
  for (const f in FRIENDS) a.push({ id: f, name: FRIENDS[f].name, look: f, n: hearts(f) });
  for (const t of ['hanh', 'lan', 'tung', 'manh', 'quan']) a.push({ id: t, name: TEACHERS[t].name, look: TEACHERS[t].look, n: teacherLv(t) });
  a.push({ id: 'parents', name: 'Bố mẹ', look: 'mom', n: Math.min(5, Math.ceil(parentInfo(G.parent).lv / 2)) });
  return a;
}
async function graduationDay() {
  if (G.memo.notes) return;
  G.memo.notes = {};
  const wrote = [];
  for (const p of memoPeople()) if (p.n >= MEMO_NOTE_HEARTS) { G.memo.notes[p.id] = { day: G.day, hearts: p.n }; wrote.push(p.name); }
  addMemo('scene', 'totnghiep');
  await UI.ask('Ngày tốt nghiệp', `<p>Lễ tốt nghiệp kết thúc, mọi người chuyền tay nhau cuốn lưu bút của bạn.</p>` + (wrote.length ? `<p>Những người đã viết lưu bút cho bạn: <b>${wrote.join(', ')}</b>.</p>` : '<p>Chưa ai đủ thân để viết lưu bút cho bạn…</p>') + '<p class="dim">Mở Menu → Lưu bút để đọc lại.</p>', ['Mở lưu bút', 'Để sau']).then(c => { if (c === 0) { UI._mstab = 'notes'; UI.menu('memo'); } });
}

/* ---------- CHÙA: THẮP NHANG, XIN XĂM ---------- */
const rollQue = () => { let r = Math.random() * QUE.reduce((s, q) => s + q.w, 0); for (let k = 0; k < QUE.length; k++) { r -= QUE[k].w; if (r < 0) return k; } return 2; };
// Ống xăm: bấm “Lắc” cho tới khi một thẻ rơi ra → trả về chỉ số quẻ
function xinxamUI() {
  return new Promise(res => {
    const W = 220, H = 220, k = rollQue(), num = 1 + Math.floor(Math.random() * 60), Q = QUE[k];
    UI._open('Xin xăm', `<div class="gm"><canvas id="xx-cv" width="${W * 2}" height="${H * 2}" style="width:${W}px;height:${H}px"></canvas><div class="gm-side" id="xx-side"><p>Thành tâm khấn nguyện rồi <b>lắc ống xăm</b> (bấm nút, bấm vào ống xăm hoặc phím <kbd>Space</kbd>). Lắc tới khi có một thẻ xăm rơi ra.</p><p id="xx-info" class="big">Chưa có thẻ nào rơi…</p><div class="btns"><button class="btn primary" id="xx-shake">Lắc ống xăm</button></div></div></div>`, null, null, true);
    const cv = $('xx-cv'), c = cv.getContext('2d');
    const S = { t: 0, sh: 0, n: 0, need: 3 + Math.floor(Math.random() * 3), fall: -1, shown: false, sticks: Array.from({ length: 16 }, (v, i) => ({ dx: -15 + i * 2 + Math.random() * 1.5, h: 26 + Math.random() * 14, ph: Math.random() * 6 })) };
    const shake = () => { if (S.fall >= 0) return; S.sh = 0.5; S.n++; $('xx-info').textContent = `Lắc lần ${S.n}…`; if (S.n >= S.need) S.fall = 0; };
    const key = e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); if (!S.shown) shake(); } };
    window.addEventListener('keydown', key, true);
    $('xx-shake').addEventListener('click', shake); cv.addEventListener('mousedown', shake);
    UI._mini = () => { };          // đang xin xăm thì không bỏ ngang
    let last = 0, bot = 0;
    const done = () => {
      window.removeEventListener('keydown', key, true); UI._mini = null;
      const side = $('xx-side'); if (!side) return res(k);
      side.innerHTML = `<p>Xăm số <b>${num}</b></p><p class="big" style="color:${Q.col}"><b>${Q.name}</b></p><p class="que-poem">${Q.poem}</p><p><b>Lời giải:</b> ${Q.giai}</p><p class="dim">${Q.luck > 0 ? `May mắn hôm nay +${Q.luck}` : Q.luck < 0 ? `May mắn hôm nay ${Q.luck}` : 'May mắn hôm nay giữ nguyên'}</p><div class="btns"><button class="btn primary" id="xx-ok">Nhận quẻ</button></div>`;
      $('xx-ok').addEventListener('click', () => { UI.close(-1); res(k); });
      if (UI._mgBot || UI._fast) setTimeout(() => { if ($('xx-ok')) { UI.close(-1); res(k); } }, 30);
    };
    const loop = t => {
      const dt = Math.min(0.04, (t - last) / 1000 || 0.016); last = t;
      if ((UI._mgBot || UI._fast) && S.fall < 0 && (bot += dt) > 0.05) { bot = 0; shake(); }
      S.t += dt; S.sh = Math.max(0, S.sh - dt);
      if (S.fall >= 0) S.fall += dt * (UI._fast ? 6 : 1);
      // vẽ: khăn trải bàn đỏ, ống xăm tre lắc qua lại, thẻ rơi ra
      c.setTransform(2, 0, 0, 2, 0, 0);
      c.fillStyle = '#7a2a22'; c.fillRect(0, 0, W, H); c.fillStyle = '#8f3a2c'; for (let i = 0; i < W; i += 12) c.fillRect(i, 0, 6, H);
      c.fillStyle = '#5b1d17'; c.fillRect(0, H - 40, W, 40); c.fillStyle = '#e8b83a'; c.fillRect(0, H - 40, W, 2);
      const ang = Math.sin(S.t * 38) * 0.28 * (S.sh / 0.5) + (S.fall >= 0 && S.fall < 0.5 ? 0.45 * Math.min(1, S.fall * 4) : 0);
      c.save(); c.translate(W / 2, H - 50); c.rotate(ang);
      for (const s of S.sticks) { c.fillStyle = '#e8c27a'; c.fillRect(s.dx, -96 - s.h + Math.sin(S.t * 30 + s.ph) * 2 * (S.sh / 0.5), 2, s.h + 10); c.fillStyle = '#d9534f'; c.fillRect(s.dx, -96 - s.h + Math.sin(S.t * 30 + s.ph) * 2 * (S.sh / 0.5), 2, 4); }
      c.fillStyle = '#8a5a3a'; c.fillRect(-20, -96, 40, 96); c.fillStyle = '#a9703f'; c.fillRect(-20, -96, 8, 96); c.fillStyle = '#5b3d27'; c.fillRect(-20, -96, 40, 4); c.fillRect(-20, -40, 40, 3); c.fillRect(-20, -4, 40, 4);
      c.fillStyle = '#e8b83a'; c.font = '800 14px "Baloo 2", system-ui'; c.textAlign = 'center'; c.fillText('XĂM', 0, -55);
      c.restore();
      if (S.fall >= 0) {          // thẻ xăm vọt lên khỏi miệng ống rồi rơi xuống mặt bàn
        const f = S.fall, x0 = W / 2 + 6, y0 = H - 160;
        let x1 = x0, y1 = y0 - Math.min(1, f / 0.5) * 30, a = 0;
        if (f > 0.5) { const g = Math.min(1, (f - 0.5) / 0.6); x1 = x0 + g * 50; y1 = y0 - 30 + g * g * 125; a = g * 1.45; }
        c.save(); c.translate(x1, y1); c.rotate(a); c.fillStyle = '#f4d68a'; c.fillRect(-2, -26, 5, 52); c.fillStyle = '#d9534f'; c.fillRect(-2, -26, 5, 8); c.restore();
        if (f > 1.15) { c.fillStyle = '#fff6e3'; c.font = '800 13px "Baloo 2", system-ui'; c.textAlign = 'center'; c.fillText(`Xăm số ${num}`, W / 2 + 56, H - 14); }
        if (f > 1.4 && !S.shown) { S.shown = true; done(); }
      }
      if (!UI.isOpen() || !$('xx-cv')) return;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });
}
ACT.incense = async () => {
  if (RT.lock) return;
  if (G.daily.que !== undefined && G.daily.que !== null) return meSay(`<p>Hôm nay mình đã xin được quẻ <b>${QUE[G.daily.que].name}</b> rồi. Mai lại tới vậy.</p>`);
  const c = await meSay('<p>Lư hương nghi ngút khói. Thắp một nén nhang rồi xin một quẻ?</p><p class="dim">Mỗi ngày xin được một quẻ. Quẻ tốt thì may mắn hôm nay tăng, quẻ xấu thì giảm.</p>', ['Thắp nhang, xin quẻ', 'Thôi']);
  if (c !== 0) return;
  RT.lock = true;
  UI.progress('Thắp nhang, khấn nguyện…', 2200, '#c8583f');
  await playCut({
    inPlace: true, bars: false, title: '',
    steps: [{ move: ['me', 321, 232, 450] }, { fn: sc => { G.dir = 3; sc.bow = true; sc.drive = () => { sc.meOy = sc.bow ? Math.round(1 + Math.sin(performance.now() / 170) * 1.5) : 0; return false; }; } }, { wait: 1700 }, { fn: sc => { sc.bow = false; sc.meOy = 0; } }],
    props: [now => { const ph = (now / 600) % 1; drawSpr(SPR.smoke0, G.x - 2, G.y - 30 - ph * 10); }],
  });
  const k = await xinxamUI();
  G.daily.que = k; G.daily.luck = clamp((G.daily.luck === undefined ? 50 : G.daily.luck) + QUE[k].luck, 0, 100);
  addMemo('scene', 'xinxam'); if (k === 0) addMemo('item', 'que');
  meetSoc('su');
  advanceTime(15);
  RT.lock = false; UI.hud();
};
ACT.monk = () => {
  meetSoc('su');
  const lines = tetTime()
    ? ['A Di Đà Phật. Năm mới chúc con bình an, học hành tấn tới. Con vào thắp nén nhang đầu năm đi.', 'Đầu năm đi chùa là để lòng mình thanh tịnh, không phải để cầu xin cho bằng được đâu con.']
    : ['A Di Đà Phật. Con muốn xin quẻ thì thắp nén nhang ở lư hương trước chính điện.', 'Quẻ tốt hay xấu cũng chỉ là lời nhắc. Chăm chỉ học hành mới là gốc của may mắn, con ạ.', 'Ao sen sau chùa mùa hè nở đẹp lắm, lúc nào rảnh con ghé ngắm.'];
  UI.ask('Sư thầy', `<p>“${lines[G.day % lines.length]}”</p>`, ['Con cảm ơn thầy'], { who: { look: 'monk' } });
};

/* ============================================================
 *  TẾT NGUYÊN ĐÁN (Xuân 1–3): lì xì, đi chùa đầu năm, đi chúc Tết
 * ============================================================ */
const tetYear = () => { const y = cal(G.day).year; return (G.tet[y] = G.tet[y] || { f: {}, t: {} }); };
const isTetDay1 = () => { const c = cal(G.day); return c.season === 2 && c.dos === 1; };
const famPos = (w, dx) => { const f = FAM[w]; return !f.hidden && f.n.map === 'home' ? [f.n.cx, f.n.cy] : [G.x + dx * 3, G.y + 40]; };
// Sáng mùng 1: bố mẹ tới lì xì rồi rủ cả nhà đi chùa cầu may
async function tetMorning() {
  const T = tetYear(); T.ask = true;
  RT.lock = true; RT.famHide = true;
  const [mx, my] = famPos('mom', -8), [dx, dy] = famPos('dad', 8);
  await playCut({
    inPlace: true, title: 'Mùng 1 Tết', actors: [{ look: 'mom', outfit: 'noapron', x: mx, y: my, dir: 0 }, { look: 'dad', outfit: 'dadhome', x: dx, y: dy, dir: 0 }],
    steps: [{ par: [{ move: [0, G.x - 16, G.y + 4, 900] }, { move: [1, G.x + 16, G.y + 4, 900] }] }, { fn: sc => { sc.actors[0].dir = 2; sc.actors[1].dir = 1; G.dir = 0; } },
      { say: [1, 'Chúc mừng năm mới! Bố mẹ lì xì con lấy may đầu năm này.'] }, { say: [0, 'Năm mới con chăm ngoan, học giỏi, mạnh khoẻ nhé.'] }, { say: ['me', 'Con cảm ơn bố mẹ! Chúc bố mẹ năm mới an khang thịnh vượng ạ!'] }],
  });
  RT.famHide = false; RT.lock = false;
  const money = LIXI.parents + LIXI.perParentLv * parentInfo(G.parent).lv;
  addMoney(money); T.lixi = true; addMemo('item', 'lixi');
  const c = await UI.ask('Mẹ', '<p>“Sáng nay cả nhà đi chùa cầu may đầu năm. Con đi cùng bố mẹ không?”</p>', ['Đi chùa cùng bố mẹ', 'Con đi chơi với bạn ạ'], { who: { look: 'mom', outfit: 'noapron' } });
  if (c === 0) return templeWithFamily();
  UI.ask('Mẹ', '<p>“Ừ, đi chơi vui nhé. Tết nhất nhớ đi chúc Tết thầy cô, bạn bè đấy!”</p>', ['Dạ'], { who: { look: 'mom', outfit: 'noapron' } });
}
async function templeWithFamily() {
  const T = tetYear(); if (RT.lock) return;
  RT.lock = true; T.chua = true;
  const sway = sc => { sc.drive = () => { const k = sc.bow ? Math.round(1 + Math.sin(performance.now() / 170) * 1.5) : 0; sc.meOy = k; for (const a of sc.actors) a.oy = k; return false; }; };
  await playCut({
    map: 'chua', me: [321, 300, 3], title: 'Đi chùa đầu năm', stay: true,
    actors: [{ look: 'mom', outfit: 'noapron', x: 298, y: 304, dir: 3 }, { look: 'dad', outfit: 'dadhome', x: 344, y: 304, dir: 3 }],
    steps: [{ par: [{ move: ['me', 321, 232, 1300] }, { move: [0, 298, 236, 1300] }, { move: [1, 344, 236, 1300] }] }, { fn: sc => { G.dir = 3; for (const a of sc.actors) a.dir = 3; sc.bow = true; sway(sc); } },
      { say: [1, 'Cầu cho cả nhà năm mới mạnh khoẻ, bình an.'] }, { say: [0, 'Mong con học hành tấn tới, thi đâu đỗ đấy.'] }, { say: ['me', 'Con cầu năm nay gặp nhiều may mắn ạ!'] },
      { fn: sc => { sc.bow = false; sc.meOy = 0; for (const a of sc.actors) a.oy = 0; } }, { say: [0, 'Bố mẹ về trước nhé. Con muốn ở lại xin quẻ thì cứ ở.'] }],
    props: [now => smokeProp(now, 322, 196)],
  });
  G.daily.luck = clamp((G.daily.luck === undefined ? 50 : G.daily.luck) + TET_TEMPLE.luck, 0, 100);
  addParent(TET_TEMPLE.parent, 'đi chùa đầu năm cùng bố mẹ'); addMemo('scene', 'chuatet');
  advanceTime(TET_TEMPLE.mins);
  RT.lock = false; UI.hud();
  UI.toast('Đầu năm đi chùa, may mắn hôm nay tăng thêm. Thắp nhang ở lư hương để xin quẻ nhé.', 'good');
}
// Chúc Tết bạn bè: tới nhà bạn trong 3 ngày Tết (bạn ở nhà cả ngày), được lì xì + thân thiết hơn
async function tetVisitFriend(fid) {
  const F = FRIENDS[fid], T = tetYear(), who = { look: fid, outfit: friendOutfit(fid) };
  if (T.f[fid]) return UI.ask(F.name, '<p>“Cậu chúc Tết tớ rồi mà! Vào nhà chơi đi.”</p>', ['OK'], { who });
  T.f[fid] = true;
  const money = LIXI.friend + LIXI.perHeart * hearts(fid);
  if (G.grudge[fid] !== undefined) delete G.grudge[fid];           // năm mới bỏ qua chuyện cũ
  addFriend(fid, LIXI.friendGain); addMoney(money); addMemo('scene', 'tetvisit');
  await UI.ask(F.name, `<p>“Chúc mừng năm mới! Chúc cậu năm nay học giỏi, hay ăn chóng lớn!”</p><p>Mẹ ${F.name} cười hiền, dúi vào tay bạn một bao lì xì đỏ: <b>${fmtMoney(money)}</b>.</p>`, ['Cháu cảm ơn cô ạ!'], { who });
}
// Nhà thầy cô ở khu phố nhà mình: ngày Tết tới chúc Tết được lì xì, thầy cô quý hơn
ACT.teacherHouse = async tid => {
  const Tc = TEACHERS[tid], who = { look: Tc.look }, tn = Tc.name.replace(/^\S+/, w => w.toLowerCase());   // “cô Hạnh”, “thầy Tùng”
  if (!tetTime() || !inWin(G.time, 420, 1290)) return UI.say(`Nhà ${Tc.name}`, `Bấm chuông… không có ai ra mở cửa.<p class="dim">Ngày thường ${tn} ở trường. Dịp Tết (Xuân 1–3, 07:00–21:30) hãy tới chúc Tết nhé.</p>`);
  const T = tetYear();
  if (T.t[tid]) return UI.ask(Tc.name, '<p>“Em chúc Tết rồi mà. Ăn thêm miếng mứt rồi về kẻo tối nhé!”</p>', ['Dạ'], { who });
  const c = await UI.ask(Tc.name, `<p>“Ôi, ${G.name} tới thăm ${Tc.name.split(' ')[0].toLowerCase()} đấy à? Vào nhà đi em!”</p>`, [`Chúc Tết ${tn}`, 'Em chỉ ghé qua thôi ạ'], { who });
  if (c !== 0) return;
  T.t[tid] = true;
  const money = LIXI.teacher + LIXI.perHeart * teacherLv(tid);
  addTeacher(LIXI.teacherGain, tid); addMoney(money); addMemo('scene', 'tetvisit');
  await UI.ask(Tc.name, `<p>“Cảm ơn em. Chúc em năm mới chăm ngoan, học giỏi!”</p><p>${Tc.name} lì xì cho bạn <b>${fmtMoney(money)}</b>.</p>`, ['Em cảm ơn ạ!'], { who });
};

/* ============================================================
 *  ĐÊM GIAO THỪA: sáng ngày cuối năm được rủ; từ 18:30 đến trước 24:00 ai lên núi sau trường cũng vào được hội chợ
 *  Trong hội thời gian đứng yên · rời hội (đi xuống núi) có hỏi lại · xem pháo hoa rồi về nhà lúc 01:00
 * ============================================================ */
// Hôm nay là đêm giao thừa, chưa quá nửa đêm, chưa về: núi mở cửa tới 24:00 cho mọi người (không cần nhận lời rủ)
const eveOk = () => isEveDay(G.day) && G.time < EVE.until && !(G.eve && G.eve.day === G.day && G.eve.done);
async function eveInvite() {
  G.daily.eveAsked = true;
  const fids = Object.keys(FRIENDS).filter(f => !grudge(f) && hearts(f) >= 1).sort((a, b) => (G.friends[b] || 0) - (G.friends[a] || 0)), fid = fids[0];
  let c;
  const when = `từ ${fmtTime(EVE.from)}`;
  if (fid) c = await UI.ask(FRIENDS[fid].name, `<p>“Hôm nay là ngày cuối năm rồi! Tối nay ${when} lên núi sau trường đón giao thừa với tớ không? Trên đó có hội chợ, nửa đêm bắn pháo hoa nữa!”</p>`, ['Đi chứ! Tối hẹn cậu trên núi', 'Thôi, tớ ở nhà'], { who: { look: fid, outfit: friendOutfit(fid) } });
  else c = await UI.ask('Mẹ', `<p>“Hôm nay là ngày cuối năm. Tối nay ${when} cả nhà lên núi sau trường đón giao thừa nhé! Trên đó có hội chợ, nửa đêm bắn pháo hoa.”</p>`, ['Dạ, con đi!', 'Con ở nhà thôi ạ'], { who: { look: 'mom', outfit: 'noapron' } });
  if (c !== 0) return UI.toast(`Đổi ý thì tối nay ${when} đến trước 24:00 cứ lên núi sau trường là vào được lễ hội.`, 'info');
  G.eve = { day: G.day, who: fid || 'parents' }; G.daily.outPerm = true;
  UI.toast(`Lên núi sau trường (đi lối mòn bên ngoài hàng rào trường) từ ${fmtTime(EVE.from)} đến trước 24:00 để vào hội đón giao thừa.`, 'good');
}
function startFest() {
  RT.fest = true; G.daily.outPerm = true;
  if (!(G.eve && G.eve.day === G.day)) G.eve = { day: G.day, who: null };     // tự đi không cần ai rủ
  UI.toast('Hội chợ đón giao thừa! Trong hội thời gian tạm dừng — cứ chơi thoả thích, xuống núi là về nhà.', 'good');
  const w = G.eve.who;
  if (FRIENDS[w] && !grudge(w)) { setComp(w, false); RT.fol = { map: G.map, x: G.x + 14, y: G.y - 6, dir: 0, walk: -1 }; UI.ask(FRIENDS[w].name, '<p>“Cậu tới rồi! Đông vui ghê chưa? Đi một vòng hội chợ đi!”</p>', ['Đi thôi!'], { who: { look: w, outfit: friendOutfit(w) } }); }
}
async function leaveFest() {
  const c = await meSay('<p>Rời hội chợ để về nhà? Sắp tới giao thừa rồi, mọi người đang đếm ngược chờ pháo hoa.</p><p class="dim">Ngắm pháo hoa thì được chụp ảnh cùng gia đình, bạn bè và nhận danh hiệu “Người đón giao thừa”. Về tới nhà là 01:00 sáng.</p>', ['Ngắm pháo hoa giao thừa rồi về nhà', 'Về nhà luôn, không chờ pháo hoa', 'Ở lại chơi thêm']);
  if (c !== 0 && c !== 1) { G.y = Math.min(G.y, 452); return; }
  RT.lock = true;
  const fid = G.comp && G.comp.fid;
  let inPhoto = [];
  if (c === 0) { G.time = EVE.until; inPhoto = await fireworksCut(); }      // tới giao thừa: nửa đêm, trời tối hẳn
  await UI.fade(true);
  RT.fest = false; G.eve.done = true; endComp();
  if (c === 0) G.time = EVE.home;
  G.daily.checkedIn = true; G.daily.scolded = true; G.daily.outAt20 = false; G.atSchool = false;
  setMap('home', 58, 76, 0); RT.snapNpcs = true;
  if (c === 0) {
    addMemo('scene', 'giaothua'); addMemo('item', 'anhgiaothua'); addMemo('badge', 'giaothua');
    if (fid) addFriend(fid, 8);
    for (const f of inPhoto) if (f !== fid) addFriend(f, 3);
  }
  await UI.fade(false);
  RT.lock = false; UI.hud();
  UI.toast(c === 0 ? 'Về tới nhà lúc 01:00. Ảnh đón giao thừa đã dán vào lưu bút. Ngủ một giấc là sang mùng 1 Tết!' : 'Về nhà sớm, ngủ một giấc là sang mùng 1 Tết.', 'info');
}
// Pháo hoa nửa đêm: đếm ngược, pháo nổ rực trời, rồi cả nhà và bạn bè ra đứng thành hàng bên lan can đỉnh núi,
// pháo hoa nở trên trời phía sau, cùng nhìn vào máy ảnh chụp chung một tấm. Trả về các bạn có trong ảnh.
const EVE_PHOTO = { x: 460, y: 72, gap: 18 };          // hàng người đứng sát lan can (lan can ở y 38–57, trời ở trên)
async function fireworksCut() {
  const fid = G.comp && G.comp.fid, cx0 = 440, cy0 = 124, t0 = { v: 0 }, bursts = [], P = EVE_PHOTO;
  for (let i = 0; i < 16; i++) bursts.push({ x: (i % 2 ? 380 : 330) + Math.random() * (i % 2 ? 180 : 260), y: 6 + Math.random() * 30, at: 3400 + i * 330 + Math.random() * 200, col: ['#ffd23a', '#ff5fa8', '#5fe0f0', '#8fd067', '#ff7a3a', '#fffaf0'][i % 6], r: 12 + Math.random() * 12 });
  const extra = [];                                                         // loạt pháo canh đúng lúc bấm máy chụp ảnh
  const glow = now => {
    const raw = now - t0.v; let t = raw; if (t > 3400) t = 3400 + (t - 3400) % 5600;        // pháo bắn liên tục suốt cảnh
    for (const b of bursts.concat(extra)) {
      const k = ((b.raw ? raw : t) - b.at) / 1100; if (k < -0.35 || k > 1) continue;
      if (k < 0) { wRect('#ffe9a0', b.x, b.y + 90 * (-k / 0.35), 1, 4); continue; }        // pháo bay lên
      for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283, r = b.r * Math.sqrt(k); wRect(k > 0.75 && i % 2 ? '#fff6e3' : b.col, b.x + Math.cos(a) * r, b.y + Math.sin(a) * r + k * k * 8, 2, 2); }
    }
  };
  // người trong ảnh: bố mẹ + bạn đi cùng + các bạn thân (từ 2 tim, không giận)
  const pals = Object.keys(FRIENDS).filter(f => f !== fid && !grudge(f) && hearts(f) >= 2).slice(0, 3), friends = (fid ? [fid] : []).concat(pals);
  const withPar = G.eve.who === 'parents';
  const fam = [{ look: 'mom', outfit: 'noapron', x: withPar ? cx0 - 22 : cx0 - 70, y: withPar ? cy0 + 2 : cy0 + 30, dir: 3 }, { look: 'dad', outfit: 'dadhome', x: withPar ? cx0 + 22 : cx0 - 56, y: withPar ? cy0 + 2 : cy0 + 34, dir: 3 }];
  const frs = friends.map((f, i) => ({ look: f, outfit: friendOutfit(f), x: f === fid ? cx0 + 18 : cx0 + 60 + i * 12, y: f === fid ? cy0 : cy0 + 28 + i * 4, dir: 3 }));
  const crowd = [['c2', 'cas_vy', cx0 - 48, cy0 + 6], ['c7', 'cas_dat', cx0 + 48, cy0 + 4], ['c4', 'cas_ngan', cx0 - 26, cy0 + 22], ['c3', 'cas_khoa', cx0 + 30, cy0 + 24]].map(([look, of, x, y]) => ({ look, outfit: of, x, y, dir: 3 }));
  const cam = { look: 'c5', outfit: 'cas_khoa', x: cx0 + 90, y: cy0 + 40, dir: 1 };          // chú chụp ảnh giùm
  const all = fam.concat(frs, crowd, [cam]), iF = 2, iC = 2 + frs.length, iCam = all.length - 1;
  // hàng chụp ảnh sát lan can: mình đứng giữa, bố mẹ hai bên, các bạn đứng tiếp ra hai đầu
  const order = [0, 1].concat(frs.map((_, i) => iF + i)), offs = [-1, 1, 2, -2, 3, -3];
  const line = order.map((k, j) => ({ move: [k, P.x + offs[j] * P.gap, P.y, 900] }));
  const firstSay = fid ? { say: [iF, 'Năm mới tụi mình vẫn chơi thân như vầy nha!'] } : (withPar ? { say: [0, 'Năm mới chúc con luôn vui vẻ, mạnh khoẻ!'] } : { wait: 600 });
  await playCut({
    map: 'nui', me: [cx0, cy0, 3], cam: { x: cx0, y: 92 }, title: 'Giao thừa', actors: all, hide: ['fh', 'f_mom', 'f_dad', 'nuiTop'],
    steps: [{ fn: sc => { t0.v = performance.now(); sc.glow = [glow]; } },
      { say: [iC, 'Mười… chín… tám…'] }, { say: [iC + 1, 'Ba… hai… một…'] },
      { fn: sc => { for (const a of sc.actors) a.dir = 3; } }, { say: ['me', 'CHÚC MỪNG NĂM MỚI!'] }, firstSay,
      { say: [0, withPar ? 'Cả nhà ra đứng bên lan can chụp một tấm với pháo hoa nào!' : 'Bố mẹ cũng lên núi xem pháo hoa nè! Ra lan can chụp chung một tấm nào!'] },
      { par: [{ move: ['me', P.x, P.y, 900] }].concat(line, [{ move: [iCam, P.x, P.y + 66, 1000] }, { move: [iC, cx0 - 80, cy0 + 20, 900] }, { move: [iC + 1, cx0 + 110, cy0 + 10, 900] }]) },
      { fn: sc => { G.dir = 0; for (const k of order) sc.actors[k].dir = 0; sc.actors[iCam].dir = 3; sc.cam = { x: P.x, y: P.y - 14 }; const r0 = performance.now() - t0.v; for (let i = 0; i < 6; i++) extra.push({ raw: true, x: P.x - 80 + i * 32 + Math.random() * 8, y: 6 + (i % 2) * 14, at: r0 + 4200 + i * 150, col: ['#ffd23a', '#ff5fa8', '#5fe0f0', '#8fd067', '#ff7a3a', '#fffaf0'][i], r: 14 + Math.random() * 6 }); } },
      { say: [iCam, 'Mọi người nhìn vào máy ảnh nào! Pháo hoa đang nở ngay sau lưng đó!'] }, { say: [iCam, 'Một, hai, ba… cười!'] }, { wait: 160 },
      { fn: sc => { snapPhoto('anhgiaothua', P.x, P.y - 30, 128); sc.glow = [glow, flashGlow(performance.now())]; } }, { wait: 900 },
      { say: ['me', 'Tấm ảnh đẹp nhất năm luôn!'] }, { wait: 1200 }],
  });
  return friends;
}
// Sạp ném vòng, bắn ná: trả tiền, xem hoạt cảnh, trúng nhiều thì có quà
ACT.festGame = async kind => {
  if (RT.lock) return;
  const name = kind === 'nemvong' ? 'Sạp ném vòng' : 'Sạp bắn ná cao su', P = FEST_GAME.price;
  const c = await UI.ask(name, `<p>${kind === 'nemvong' ? '“Ba vòng tre, ném lọt cổ chai nào thì lấy quà chai đó!”' : '“Ba viên sỏi, bắn đổ được bao nhiêu lon thì nhận quà bấy nhiêu!”'} · ${fmtMoney(P)} một lượt</p><p class="dim">Trúng 3: gấu bông · trúng 2: ${kind === 'nemvong' ? 'lồng đèn' : 'kẹo bông'} · trúng 1: kẹo.</p>`, ['Chơi một lượt', 'Thôi'], { who: { look: kind === 'nemvong' ? 'driver' : 'c5', outfit: kind === 'nemvong' ? null : 'cas_khoa' } });
  if (c !== 0) return;
  if (G.money < P) return UI.toast('Không đủ tiền.', 'bad');
  addMoney(-P, true); RT.lock = true;
  const pHit = clamp(0.42 + 0.03 * lv('kheotay') + 0.15 * luckK(), 0.15, 0.85), hits = [0, 1, 2].map(() => Math.random() < pHit);
  const n = hits.filter(Boolean).length, bx = kind === 'nemvong' ? 372 : 432, sx = bx + 28, sy = 408, fid = G.comp && G.comp.fid;
  const t0 = { v: 0 };
  const prop = now => {
    const t = now - t0.v;
    for (let i = 0; i < 3; i++) {
      const k = (t - i * 700) / 600; if (k < 0) continue;
      const tx = bx + 10 + i * 16, ty = hits[i] ? 352 : 366 + (i % 2) * 4, kk = Math.min(1, k);
      const x = sx + (tx - sx) * kk, y = sy - 20 + (ty - sy + 20) * kk - Math.sin(kk * 3.14) * 22;
      if (kind === 'nemvong') { wRect('#ffd23a', x - 3, y, 7, 1); wRect('#ffd23a', x - 3, y + 2, 7, 1); wRect('#ffd23a', x - 3, y, 1, 3); wRect('#ffd23a', x + 3, y, 1, 3); }
      else { wRect('#8b8f9c', x, y, 2, 2); if (k >= 1 && hits[i]) wRect('#ffe066', tx - 2, ty - 6 - Math.min(6, (k - 1) * 20), 1, 3); }
    }
  };
  await playCut({ inPlace: true, title: name, actors: fid ? [{ look: fid, outfit: friendOutfit(fid), x: sx + 20, y: sy + 8, dir: 3 }] : [], hide: ['fh'], props: [prop],
    steps: [{ move: ['me', sx, sy, 400] }, { fn: () => { G.dir = 3; t0.v = performance.now(); } }, { wait: 2300 }, { say: ['me', n === 3 ? 'Trúng cả ba! Đỉnh chưa!' : n ? `Trúng ${n} rồi!` : 'Trượt hết rồi… hu hu.'] }].concat(fid ? [{ say: [0, n >= 2 ? 'Cậu khéo tay ghê!' : 'Không sao, lượt sau tớ ném cho!'] }] : []) });
  addStat('kheotay', n ? 2 : 1); if (fid) addFriend(fid, FEST_GAME.friend);
  if (n === 3) { G.inv.gaubong = (G.inv.gaubong || 0) + 1; UI.toast('Phần thưởng: một con gấu bông! (đem tặng bạn được)', 'good'); }
  if (n === 2) { if (kind === 'nemvong') { addMemo('item', 'longden'); UI.toast('Phần thưởng: một chiếc lồng đèn đỏ!', 'good'); } else { gainStam(8); UI.toast('Phần thưởng: một que kẹo bông.', 'good'); } }
  if (n === 1) { gainStam(3); UI.toast('Phần thưởng: một viên kẹo.', 'info'); }
  if (n === 3 && kind === 'nemvong') addMemo('item', 'longden');
  RT.lock = false; UI.hud();
};
ACT.festFood = () => {
  UI.store('Sạp đồ ăn đêm giao thừa', '“Ăn gì cho ấm bụng nè con?”', FEST_FOOD.map(f => ({ id: f.id, name: f.name, price: f.price, desc: f.desc, inv: f.id })), f => buyFood(f.id, f.price, f.name));
};
// Nhảy dây · đá cầu cùng mọi người · ném đá thia lia: hoạt cảnh, không có mini-game
ACT.festJoin = async kind => {
  if (RT.lock) return;
  const key = 'fj_' + kind; if (G.daily[key]) return UI.toast('Vừa chơi xong, nghỉ tay chút đã!');
  const c = await UI.ask(kind === 'rope' ? 'Bạn nhảy dây' : 'Bạn đá cầu', `<p>“${kind === 'rope' ? 'Vào nhảy dây không? Tụi tớ quay cho!' : 'Thiếu một người, vào đá cầu đi!'}”</p>`, ['Vào chơi cùng!', 'Thôi'], { who: { look: kind === 'rope' ? 'c6' : 'c1', outfit: kind === 'rope' ? 'cas_ngan' : 'cas_dat' } });
  if (c !== 0) return;
  RT.lock = true; G.daily[key] = true;
  const [X, Y] = FEST_SPOTS[kind === 'rope' ? 'rope' : 'cau'], fid = G.comp && G.comp.fid;
  const steps = [{ move: ['me', kind === 'rope' ? X + 8 : X, kind === 'rope' ? Y + 6 : Y + 14, 500] }, { fn: () => { G.dir = 0; } }];
  for (let i = 0; i < 6; i++) steps.push({ hop: 'me' }, kind === 'rope' ? { wait: 120 } : { fn: () => { G.dir = [0, 1, 0, 2][i % 4]; } });
  steps.push({ say: ['me', kind === 'rope' ? 'Mười lăm… mười sáu… vẫn chưa vướng!' : 'Đỡ này! Má trong má ngoài!'] });
  if (fid) steps.push({ say: [0, 'Cậu nhảy giỏi ghê!'.replace('nhảy', kind === 'rope' ? 'nhảy' : 'đá')] });
  await playCut({ inPlace: true, title: kind === 'rope' ? 'Nhảy dây đêm giao thừa' : 'Đá cầu đêm giao thừa', actors: fid ? [{ look: fid, outfit: friendOutfit(fid), x: X + 34, y: Y + 8, dir: 1 }] : [], hide: ['fh'], steps });
  addStat('thethao', 2); if (fid) addFriend(fid, FEST_GAME.friend);
  RT.lock = false; UI.hud();
};
ACT.festSkip = async () => {
  if (RT.lock) return;
  RT.lock = true;
  const n = Math.max(1, Math.round(2 + 3 * (0.5 + 0.5 * luckK()) + Math.random() * 3)), [X, Y] = FEST_SPOTS.skip, t0 = { v: 0 }, fid = G.comp && G.comp.fid;
  const prop = now => {
    const t = (now - t0.v) / 1000; if (t < 0) return;
    const hop = Math.floor(t / 0.28), f = (t % 0.28) / 0.28;
    if (hop < n) { const x = X + 10 + hop * 13 + f * 13, y = Y + 34 - Math.sin(f * 3.14) * (8 - hop * 0.6); wRect('#8b8f9c', x, y, 2, 2); }
    for (let i = 0; i < Math.min(hop, n); i++) { const r = (t - i * 0.28) * 6; if (r < 6) { wRect('#d9f0f9', X + 23 + i * 13 - r, Y + 36, r * 2, 1); } }
  };
  await playCut({ inPlace: true, title: 'Ném đá thia lia', actors: fid ? [{ look: fid, outfit: friendOutfit(fid), x: X - 6, y: Y + 50, dir: 2 }] : [], hide: ['fh'], props: [prop],
    steps: [{ move: ['me', X - 2, Y + 36, 400] }, { fn: () => { G.dir = 2; } }, { hop: 'me' }, { fn: () => { t0.v = performance.now(); } }, { wait: 300 + n * 280 }, { say: ['me', n >= 6 ? `${n} lần nảy! Kỷ lục luôn!` : `Được ${n} lần nảy.`] }] });
  if (fid && n >= 5) addFriend(fid, 2);
  RT.lock = false; UI.hud();
};
function festChat(i, look, of, line) {
  const k = 'fc' + i; if (!G.daily[k]) { G.daily[k] = true; }
  UI.ask('Người dự hội', `<p>“${line}”</p>`, ['Chúc mừng năm mới!'], { who: { look, outfit: of } });
}
// Dây nhảy quay, quả cầu bay, ánh lồng đèn trong hội chợ
function drawFestProps(now) {
  if (G.map !== 'nui' || !festDecor()) return;
  const t = now / 1000, [rx, ry] = FEST_SPOTS.rope, ph = (t / 0.52) % 1, up = Math.sin(ph * 6.283);
  for (let i = 0; i <= 20; i++) { const k = i / 20, x = rx - 20 + k * 40, y = ry - 8 - Math.sin(k * 3.14) * 16 * up; wRect('#e2574c', x, y, 1, 1); }
  const [cx0, cy0] = FEST_SPOTS.cau, k = Math.floor(t / 0.8) % 3, f = (t % 0.8) / 0.8, a = k / 3 * 6.283 + 0.6, b = ((k + 1) % 3) / 3 * 6.283 + 0.6;
  const ax = cx0 + Math.cos(a) * 20, ay = cy0 + Math.sin(a) * 13, bx = cx0 + Math.cos(b) * 20, by = cy0 + Math.sin(b) * 13;
  if (!(RT.scene && RT.scene.title === 'Đá cầu đêm giao thừa')) drawSpr(SPR.shuttle, ax + (bx - ax) * f - 2, ay + (by - ay) * f - 12 - Math.sin(f * 3.14) * 20);
}

/* ---------- điều phối sự kiện mỗi khung hình (khi không bận) ---------- */
function eventTick() {
  if (hkEventTick()) return true;                                   // Hội khoẻ Phù Đổng: qua cổng trường là vào hội
  if (isTetDay1() && G.map === 'home' && G.time < 720 && !tetYear().ask) { tetMorning(); return true; }
  if (isEveDay(G.day) && !G.daily.eveAsked && !RT.fest && G.time < EVE.from) { eveInvite(); return true; }   // sáng ngày cuối năm: được rủ đón giao thừa
  if (G.map === 'nui' && !RT.fest && eveOk() && G.time < EVE.from && !G.daily.eveEarly) { G.daily.eveEarly = true; UI.toast(`Lễ hội đón giao thừa bắt đầu lúc ${fmtTime(EVE.from)}. Mọi người đang dựng sạp, treo lồng đèn…`, 'info'); }
  if (!RT.bcFest && G.atSchool && G.day === contestDay(cal(G.day).year) && !bcY().done && inWin(G.time, PM_START, BANHCHUNG.end)) { startBcFest(); return true; }   // 13:30 ngày học cuối mùa đông
  if (G.map === 'nui' && !RT.fest && eveOk() && G.time >= EVE.from) { startFest(); return true; }
  // Tết Trung thu: sáng được bố mẹ, bạn thân rủ · tới phố Hoa Phượng 20:00–23:00 là vào hội · ra khỏi phố thì thời gian chạy tiếp
  if (isTTDay(G.day) && !G.daily.ttAsked && G.time < TT.from) { ttInvite(); return true; }
  if (RT.ttFest && G.map !== 'pho' && !RT.scene) RT.ttFest = false;
  if (G.map === 'pho' && !RT.ttFest && isTTDay(G.day) && !ttY().done && G.time >= TT.decor && G.time < TT.from && !G.daily.ttEarly) { G.daily.ttEarly = true; UI.toast(`Hội Trung thu bắt đầu lúc ${fmtTime(TT.from)}. Mọi người đang treo đèn lồng, dựng sân khấu…`, 'info'); }
  if (G.map === 'pho' && !RT.ttFest && ttOk() && G.time >= TT.from) { startTT(); return true; }
  return false;
}

/* ============================================================
 *  HỘI GÓI BÁNH CHƯNG: chiều ngày học cuối cùng của mùa đông, thay các tiết buổi chiều
 *  Từ 13:30 sân trường thành hội — thời gian đứng yên; nhiều tụ ngồi gói bánh, thầy cô và bạn bè đi lại trò chuyện
 *  Gặp thầy hiệu trưởng: tham gia thi (mini-game) hoặc chỉ xem → trao giải → 17:00, đứng ở sân trường
 * ============================================================ */
// ngày học cuối cùng của mùa đông
const contestDay = year => { const x = year * YEAR_DAYS + 2 * CFG.DAYS_PER_SEASON; for (let d = x - 1; d >= x - CFG.DAYS_PER_SEASON; d--) if (isSchoolDay(d)) return d; return -1; };
const bcY = () => { const y = cal(G.day).year; return (G.bc[y] = G.bc[y] || {}); };
// sự kiện của trường diễn ra trong ngày, và các tiết bị thay
const schoolEventsOn = day => SCHOOL_EVENTS.filter(e => isSchoolDay(day) && e.when(cal(day).year) === day);
function cutPeriods(day) { const s = new Set(); for (const e of schoolEventsOn(day)) for (const n of e.periods) s.add(n); TIMETABLE[cal(day).dow] && TIMETABLE[cal(day).dow].forEach((x, i) => { if (!x) s.add(i + 1); }); return s; }
// ngày chỉ học buổi sáng: tan học lúc nghỉ trưa
const halfDay = day => isSchoolDay(day) && HALF_DAYS.includes(cal(day).dow) && !schoolEventsOn(day).length;   // ngày có sự kiện của trường thì vẫn ở lại trường cả chiều
const schoolEndT = () => (G && halfDay(G.day) ? AM_END : CFG.SCHOOL_END);
const bcDecor = () => !!G && G.day === contestDay(cal(G.day).year) && (RT.bcFest || (G.time >= AM_END && !bcY().done));
const bcWho = { look: 'principal' };
function startBcFest() {
  RT.bcFest = true;
  const indoor = MAPS[G.map].indoor;
  if (indoor) { setMap('school', 300, 250, 3); RT.snapNpcs = true; }
  UI.toast('Chiều nay nghỉ học — cả trường ra sân gói bánh chưng! Trong hội thời gian tạm dừng. Gặp thầy hiệu trưởng (trước bàn trao giải) khi muốn thi.', 'good');
}
async function endBcFest(winner) {
  const B = bcY(); B.done = true;
  await UI.fade(true);
  RT.bcFest = false; G.time = BANHCHUNG.end;
  for (const q of PERIODS) G.daily.done[q.n] = true;
  setMap('school', 300, 250, 0); RT.snapNpcs = true;
  addMemo('scene', 'banhchung');
  await UI.fade(false);
  UI.hud();
  UI.toast(`Hội gói bánh chưng khép lại (${winner} là Vua gói bánh chưng). 17:00 rồi — ra cổng về nhà được rồi.`, 'info');
}
// Thầy hiệu trưởng hỏi có tham gia thi không (không cần đăng ký trước)
ACT.principal = async () => {
  if (RT.lock) return;
  meetSoc('hieutruong');
  if (!RT.bcFest) return UI.ask('Thầy hiệu trưởng', '<p>“Chào em. Học hành chăm chỉ nhé! Cuối năm trường có hội gói bánh chưng, nhớ tham gia đấy.”</p>', ['Dạ'], { who: bcWho });
  const c = await UI.ask('Thầy hiệu trưởng', '<p>“Chào em! Chiều nay cả trường nghỉ học để gói bánh chưng đón Tết. Cuối buổi có <b>thi gói bánh chưng</b>: trong một phút, ai gói được nhiều bánh nhất sẽ được nhận cúp. Em có muốn tham gia thi không?”</p><p class="dim">Thi xong (hoặc chỉ xem) là trao giải, hội kết thúc lúc 17:00. Muốn đi chơi với các bạn trước thì cứ đi một vòng đã.</p>', ['Em tham gia thi ạ!', 'Em chỉ xem thôi', 'Để em đi chơi một vòng đã'], { who: bcWho });
  if (c === 0) return bcContest(true);
  if (c === 1) return bcContest(false);
};
// Ngồi vào một tụ gói bánh cùng mọi người: hoạt cảnh tay gói lá dong, thêm thân với bạn trong tụ
ACT.bcTable = async i => {
  if (RT.lock) return;
  const T = BC_GROUPS[i], key = 'bct' + i;
  if (G.daily[key]) return UI.toast('Vừa gói xong một mẻ với tụ này rồi.');
  const c = await UI.ask(T.name, `<p>“${T.ask}”</p>`, ['Ngồi xuống gói cùng', 'Thôi'], { who: { look: T.mem[0].look, outfit: T.mem[0].of } });
  if (c !== 0) return;
  RT.lock = true; G.daily[key] = true;
  const [cx, cy] = T.at, t0 = { v: performance.now() };
  await playCut({
    inPlace: true, title: 'Gói bánh chưng cùng các bạn',
    steps: [{ move: ['me', cx, cy - 16, 450] }, { fn: () => { G.dir = 0; t0.v = performance.now(); } }, { wait: 900 }, { say: ['me', T.me] }, { wait: 500 }],
    props: [now => { const k = Math.floor((now - t0.v) / 300) % 4; wRect('#3f8f3a', G.x - 4 + (k % 2) * 2, G.y - 10, 7, 5); if (k > 1) wRect('#fbf7ee', G.x - 2, G.y - 9, 3, 3); }],
  });
  for (const m of T.mem) if (m.fid) addFriend(m.fid, 4);
  addStat('kheotay', 1); 
  RT.lock = false; UI.hud();
  UI.toast('Gói xong một chiếc bánh vuông vức! Cả tụ khen khéo tay.', 'good');
};
// Thầy cô đi lại trong hội: trò chuyện (lần đầu trong ngày thầy cô quý hơn)
function bcTeacherTalk(tid, line) {
  const Tc = TEACHERS[tid];
  if (!G.daily['bcte' + tid]) { G.daily['bcte' + tid] = true; addTeacher(1, tid); }
  UI.ask(Tc.name, `<p>“${line}”</p>`, ['Dạ!'], { who: { look: Tc.look } });
}
const BC_STEPS = [['la', 'Lót lá dong'], ['gao', 'Đổ gạo nếp'], ['dau', 'Rải đậu xanh'], ['thit', 'Đặt thịt'], ['dau', 'Rải thêm đậu xanh'], ['gao', 'Phủ gạo nếp'], ['gap', 'Gấp lá'], ['lat', 'Buộc lạt']];
const BC_ING = { la: ['Lá dong', '#3f8f3a'], gao: ['Gạo nếp', '#fbf7ee'], dau: ['Đậu xanh', '#f2c94c'], thit: ['Thịt ba chỉ', '#e98fa5'], gap: ['Gấp lá', '#5fae4a'], lat: ['Lạt tre', '#d9c690'] };
// Mini-game: bấm đúng nguyên liệu theo thứ tự 8 bước để gói xong một chiếc bánh; các khay đổi chỗ sau mỗi chiếc
function bcGame() {
  const T = BANHCHUNG.time, KS = Object.keys(BC_ING); let ref = null;
  const shuffle = () => { const a = KS.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const btn = i => ({ x: 8 + (i % 3) * 96, y: 160 + Math.floor(i / 3) * 34, w: 90, h: 30 });
  return UI.game({
    title: 'Hội thi gói bánh chưng', w: 300, h: 230,
    bot: () => { if (ref) { ref.cakes = 6; for (const n of ref.npc) n.made = Math.round(n.rate * T * 0.95); } return 0.8; },
    help: `<p>Gói đúng thứ tự: <b>lót lá dong → gạo nếp → đậu xanh → thịt → đậu xanh → gạo nếp → gấp lá → buộc lạt</b>. Đủ 8 bước là xong một chiếc bánh.</p><p>Bấm vào khay nguyên liệu (hoặc phím <kbd>1</kbd>–<kbd>6</kbd>). Khay đổi chỗ sau mỗi chiếc bánh; bấm sai thì bị khựng lại một chút.</p><p>Trong ${T} giây, gói được nhiều hơn mọi đối thủ là thắng!</p>`,
    setup(S) { ref = S; Object.assign(S, { step: 0, cakes: 0, order: shuffle(), pen: 0, pop: 0, npc: BANHCHUNG.npc.map(([, name, rate]) => ({ name, rate: rate * (0.85 + Math.random() * 0.3) / T, acc: 0, made: 0 })) }); },
    step(S, dt, inp) {
      for (const n of S.npc) { n.acc += n.rate * dt; n.made = Math.floor(n.acc); }
      S.pop = Math.max(0, S.pop - dt);
      if (S.pen > 0) S.pen -= dt;
      else {
        const picks = [];
        for (const k of inp.hit) if (/^[1-6]$/.test(k)) picks.push(+k - 1);
        for (const [a, b] of inp.clicks) for (let i = 0; i < 6; i++) { const B = btn(i); if (a >= B.x && a < B.x + B.w && b >= B.y && b < B.y + B.h) picks.push(i); }
        for (const i of picks) {
          if (S.order[i] === BC_STEPS[S.step][0]) { S.step++; if (S.step >= BC_STEPS.length) { S.cakes++; S.step = 0; S.order = shuffle(); S.pop = 0.8; } }
          else { S.pen = 1.1; break; }
        }
      }
      const best = Math.max(...S.npc.map(n => n.made));
      S.score = clamp(S.cakes / Math.max(1, best + 1), 0, 1);
      S.info = `Bạn: ${S.cakes} bánh · ` + S.npc.map(n => `${n.name.split(' ')[0]}: ${n.made}`).join(' · ');
      if (S.t >= T) S.done = true;
    },
    draw(c, S) {
      gR(c, '#c98f5a', 0, 0, S.W, S.H); for (let i = 0; i < S.W; i += 20) gR(c, '#bd8550', i, 0, 1, 150); gR(c, '#9c6a3c', 0, 150, S.W, S.H - 150); gTime(c, S, BANHCHUNG.time - S.t, BANHCHUNG.time);
      // danh sách bước (trái)
      BC_STEPS.forEach(([k, name], i) => gT(c, i < S.step ? '#3f8f3a' : i === S.step ? '#2a2136' : '#7a5a3a', `${i < S.step ? '✓' : i + 1 + '.'} ${name}`, 8, 26 + i * 15, 9, 'left'));
      // khuôn bánh: từng lớp hiện dần
      const X = 112, Y = 30, Z = 84, st = S.step;
      gR(c, '#6f472c', X - 4, Y - 4, Z + 8, Z + 8); gR(c, '#e8d6b0', X, Y, Z, Z);
      if (st >= 1) gR(c, '#3f8f3a', X, Y, Z, Z);
      if (st >= 2) gR(c, '#fbf7ee', X + 8, Y + 8, Z - 16, Z - 16);
      if (st >= 3) gR(c, '#f2c94c', X + 18, Y + 18, Z - 36, Z - 36);
      if (st >= 4) { gR(c, '#e98fa5', X + 28, Y + 28, Z - 56, Z - 56); gR(c, '#fbf7ee', X + 30, Y + 34, Z - 60, 3); }
      if (st >= 5) { gR(c, '#f2c94c', X + 18, Y + 18, Z - 36, Z - 36); gR(c, '#e98fa5', X + 34, Y + 36, 8, 5); }
      if (st >= 6) gR(c, '#fbf7ee', X + 8, Y + 8, Z - 16, Z - 16);
      if (st >= 7) { gR(c, '#5fae4a', X, Y, Z, Z); c.strokeStyle = '#3f8f3a'; c.lineWidth = 2; c.beginPath(); c.moveTo(X, Y); c.lineTo(X + Z, Y + Z); c.moveTo(X + Z, Y); c.lineTo(X, Y + Z); c.stroke(); }
      if (S.pop > 0) { gR(c, '#3f8f3a', X, Y, Z, Z); gR(c, '#d9c690', X + Z / 2 - 3, Y, 6, Z); gR(c, '#d9c690', X, Y + Z / 2 - 3, Z, 6); gT(c, '#fffaf0', '+1 bánh!', X + Z / 2, Y + Z / 2 - 14 - (0.8 - S.pop) * 20, 16); }
      // chồng bánh đã gói (phải)
      for (let i = 0; i < S.cakes; i++) { const px = 214 + (i % 3) * 26, py = 126 - Math.floor(i / 3) * 18; gR(c, '#2f6b2b', px - 1, py - 1, 24, 18); gR(c, '#3f8f3a', px, py, 22, 16); gR(c, '#d9c690', px + 10, py, 2, 16); gR(c, '#d9c690', px, py + 7, 22, 2); }
      gT(c, '#2a2136', `Đã gói: ${S.cakes}`, 252, 22, 12);
      // khay nguyên liệu
      S.order.forEach((k, i) => { const B = btn(i); gR(c, '#2a2136', B.x - 1, B.y - 1, B.w + 2, B.h + 2); gR(c, S.pen > 0 ? '#bdb6a8' : '#fff6e3', B.x, B.y, B.w, B.h); gR(c, BC_ING[k][1], B.x + 5, B.y + 6, 18, 18); gR(c, 'rgba(42,33,54,.25)', B.x + 5, B.y + 22, 18, 2); gT(c, '#2a2136', `${i + 1}. ${BC_ING[k][0]}`, B.x + 56, B.y + 15, 10); });
      if (S.pen > 0) gT(c, '#d9534f', 'Sai rồi! Xem lại thứ tự…', S.W / 2, 146, 12);
    },
  }).then(r => ({ cakes: ref ? ref.cakes : 0, npc: ref ? ref.npc : [], skipped: r.skipped }));
}
const BC_TABLES = [[220, 204], [260, 204], [300, 204], [340, 204]];          // hàng bàn thi trước bàn trao giải
const BC_HIDE = ['bc_c1', 'bc_x1', 'bc_x3', 'bc_principal'];               // người đang diễn trong cảnh thi thì ẩn khỏi tụ
const bcTableProp = () => { for (const [x, y] of BC_TABLES) { wRect('#8a5a3a', x - 13, y - 10, 26, 8); wRect('#a9703f', x - 13, y - 10, 26, 2); wRect('#3f8f3a', x - 10, y - 9, 7, 5); wRect('#fbf7ee', x - 1, y - 9, 5, 4); wRect('#f2c94c', x + 6, y - 8, 4, 3); } };   // bàn ngang hông: không che mặt người đứng sau
async function bcContest(join) {
  const B = bcY(); if (B.done || RT.lock) return;
  RT.lock = true;
  const looks = { m1: 'c1', x1: 'x1', x3: 'x3' }, comp = BANHCHUNG.npc.map(([sid], i) => ({ look: looks[sid] || 'c1', x: BC_TABLES[i + 1][0], y: BC_TABLES[i + 1][1], dir: 0 }));
  const judge = { look: 'principal', x: 280, y: 236, dir: 3 };
  let board;
  if (join) {
    // thi ngay tại bàn trên sân trường (04m): khay nguyên liệu trước mặt, bánh thành hình trên bàn, 3 đối thủ gói ở các bàn bên
    const r = await sceneBanhChung(comp.concat([judge]), [{ say: [3, 'Phần thi gói bánh chưng bắt đầu! Trong một phút, ai gói được nhiều bánh nhất sẽ thắng!'] }, { say: ['me', 'Lá dong, gạo nếp, đậu xanh, thịt… nhớ rồi!'] }, { say: [2, 'Tớ không nhường đâu nhé!'] }]);
    board = [{ name: G.name, n: r.cakes, me: true }].concat(r.npc.map(n => ({ name: n.name, n: n.made })));
  } else {
    const t0 = { v: 0 };
    await playCut({
      map: 'school', me: [280, 262, 3], cam: { x: 290, y: 200 }, title: 'Xem thi gói bánh chưng', hide: BC_HIDE,
      actors: comp.concat([judge]), props: [bcTableProp, now => { const k = Math.floor((now - t0.v) / 250); for (let i = 1; i < 4; i++) if ((k + i) % 3) wRect('#3f8f3a', BC_TABLES[i][0] - 3, BC_TABLES[i][1] - 7, 6, 5); }],
      steps: [{ fn: () => { t0.v = performance.now(); } }, { say: [3, 'Ba bạn vào thi nào! Chuẩn bị… bắt đầu!'] }, { wait: 1800 }, { say: ['me', 'Cố lên! Cố lên!'] }],
    });
    board = BANHCHUNG.npc.map(([, name, rate]) => ({ name, n: Math.max(1, Math.round(rate * (0.8 + Math.random() * 0.45))) }));
  }
  board.sort((a, b) => b.n - a.n || (a.me ? 1 : -1));                     // bằng nhau thì xếp đối thủ lên trước
  const win = !!board[0].me && (board.length < 2 || board[0].n > board[1].n), winner = win ? G.name : board[0].name;
  const html = '<ol class="bc-board">' + board.map(b => `<li class="${b.me ? 'me' : ''}"><b>${b.name}</b> — ${b.n} bánh</li>`).join('') + '</ol>';
  const meRow = board.find(b => b.me);
  await UI.ask('Thầy hiệu trưởng', `<p>“Kết quả phần thi gói bánh chưng!”</p>${html}<p>${win ? `“Chúc mừng ${G.name} — <b>Vua gói bánh chưng</b> năm nay!”` : meRow && meRow.n === board[0].n ? `“Em bằng số bánh với ${board[0].name} rồi — phải gói nhiều hơn mới vô địch được. Tiếc ghê!”` : `“Chúc mừng ${board[0].name}!${join ? ' Các em đều gói rất khéo.' : ''}”`}</p>`, [win ? 'Lên nhận cúp!' : 'Vỗ tay!'], { who: bcWho });
  await awardCut(win, board[0]);
  if (join) { addStat('kheotay', win ? 5 : 2); }
  if (win) { B.won = true; addTeacher(5, 'hanh'); await winPhotoCut(); addMemo('item', 'cup'); addMemo('item', 'photo'); }
  RT.lock = false;
  await endBcFest(winner);
}
// Trao giải: người thắng lên bục nhận cúp từ thầy hiệu trưởng
function awardCut(win, top) {
  const looks = { 'Minh (10A1)': 'c1', 'Tú (10A2)': 'x1', 'Bảo (10A3)': 'x3' }, P = { look: 'principal', x: 272, y: 174, dir: 0 }, t0 = { v: 1e12 };
  const actors = [P].concat(win ? [] : [{ look: looks[top.name] || 'c1', x: 250, y: 236, dir: 3 }]);
  const winnerWho = win ? 'me' : 1;
  return playCut({
    map: 'school', me: win ? [250, 236, 3] : [310, 250, 3], cam: { x: 280, y: 190 }, title: 'Trao giải Vua gói bánh chưng', hide: BC_HIDE, actors,
    props: [now => { if (now < t0.v) return; const a = winnerWho === 'me' ? G : RT.scene.actors[1]; drawSpr(iconCv('cup'), a.x - 9, a.y - 44 + Math.round(Math.sin(now / 200))); }],
    steps: [{ say: [0, `Xin mời ${win ? G.name : top.name} lên nhận cúp Vua gói bánh chưng!`] }, { move: [winnerWho, 272, 194, 900] }, { fn: () => { t0.v = performance.now(); } },
      { say: [0, 'Chúc mừng em! Chúc cả trường ăn Tết thật vui!'] }, { hop: winnerWho }, { say: [winnerWho, win ? 'Em cảm ơn thầy ạ!' : 'Em cảm ơn thầy!'] }],
  });
}
// Chụp ảnh cả lớp ăn mừng quanh chiếc cúp
function winPhotoCut() {
  const cx0 = 300, cy0 = 222;
  const row = [['khoa', -44, -16], ['vy', -22, -18], ['dat', 22, -18], ['ngan', 44, -16], ['c3', -60, 2], ['c4', 60, 2], ['c5', -34, 4], ['c8', 34, 4]];
  const actors = row.map(([look, dx, dy]) => ({ look, x: cx0 + dx, y: cy0 + dy, dir: 0 })).concat([{ look: 'teacherA', x: cx0, y: cy0 + 50, dir: 3 }]);
  return playCut({
    map: 'school', me: [cx0, cy0, 0], cam: { x: cx0, y: cy0 - 10 }, title: 'Ảnh lưu niệm — Vua gói bánh chưng', actors, hide: BC_ALL.concat(['bc_principal']),
    props: [() => drawSpr(iconCv('cup'), G.x - 9, G.y - 44 + Math.round(Math.sin(performance.now() / 200)))],
    steps: [{ say: [8, 'Cả lớp đứng vào chụp ảnh nào! Nhìn vào đây!'] }, { par: actors.slice(0, 8).map((a, i) => ({ hop: i })) }, { say: [0, 'Lớp mình vô địch rồi!'] },
      { say: [8, 'Một, hai, ba… cười!'] }, { wait: 160 }, { fn: sc => { snapPhoto('photo', cx0, cy0 - 12); sc.glow = [flashGlow(performance.now())]; } }, { wait: 1200 }],
  });
}
