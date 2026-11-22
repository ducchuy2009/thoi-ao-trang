'use strict';
/* ============================================================
 *  04s. HỘI HOẠ (vẽ tranh ở giá vẽ / giấy vẽ) · TRUNG TÂM NĂNG KHIẾU (vẽ, thanh nhạc — gói tháng, học thứ 7)
 *       PHỤ CÔ BA BÁN HÀNG (hoạt cảnh) · TẾT: đóng cửa mùng 1, chúc Tết bố mẹ bạn / hàng xóm nhận lì xì, lì xì cho bạn bè
 * ============================================================ */
const EASEL = { x: 305, y: 118, stand: [316, 160, 3] };          // giá vẽ: lấy theo chỗ đã đặt khung tranh trong nhà (04t_furn.js)
Object.assign(LOOKS, {
  artT: { hair: '#6b3f2a', style: 'bob', shirt: '#e98fa5', pants: '#3a3340', apron: '#d9c690', eye: 'smile', hb: '#5fb0e8' },   // cô dạy vẽ
  musicT: { hair: '#2c2733', style: 'side', shirt: '#2f4a7a', pants: '#2a2136', tie: '#d9534f', eye: 'round' },                  // thầy dạy thanh nhạc
});
const FRIEND_PARENTS = { khoa: ['ph2', 'ph1'], vy: ['ph6', 'ph5'], dat: ['ph4', 'ph3'], ngan: ['ph8', 'ph7'] };

/* ---------- Vẽ tranh ---------- */
const paintTier = () => clamp(1 + Math.floor((lv('kheotay') + rnd(0, 3)) / 2.4), 1, 5);
ACT.paint = async (kind, go, it) => {
  if (RT.lock) return;
  if (kind === 'paper' && !(G.inv.giayve > 0)) return;
  if (G.stamina < PAINT.stam) return UI.toast('Mệt quá, không vẽ nổi.', 'bad');
  if (kind === 'easel') { it = it || furnPlaced('khungtranh')[0]; if (!it) return; const [x, y] = furnRect('khungtranh', it.x, it.y); Object.assign(EASEL, { x, y, stand: furnStand(it) }); }
  const c = go ? 0 : await meSay(`<p>${kind === 'paper' ? 'Ngồi xuống trải giấy ra vẽ một bức tranh?' : 'Ngồi vào giá vẽ vẽ một bức tranh?'}</p><p class="dim">${PAINT.mins} phút · −${PAINT.stam} thể lực · +${PAINT.pts} Hội hoạ. Cấp Hội hoạ càng cao tranh càng đẹp, bán càng được giá (chợ Bờ Đông, hoặc bán / tặng người khác).</p>`, ['Ngồi vẽ', 'Thôi']);
  if (c !== 0) return;
  RT.lock = true;
  if (kind === 'paper') G.inv.giayve--;
  const tier = paintTier();
  await paintCut(kind, tier);
  advanceTime(PAINT.mins); useStam(PAINT.stam); addStat('kheotay', PAINT.pts);
  const T = PAINT.tiers[tier - 1]; gAdd(T[0]);
  RT.lock = false; UI._hb = null; UI.hud();
  UI.toast(`Vẽ xong “${T[1]}” — bán được ${fmtMoney(T[2])}.`, 'good');
};
// hoạt cảnh vẽ: nét cọ hiện dần lên khung tranh (giá vẽ) hoặc tờ giấy trải dưới đất
async function paintCut(kind, tier) {
  const easel = kind === 'easel', pal = ['#5fae4a', '#9cc8e6', '#ffd23a', '#e2574c', '#7a5fc9', '#f2a93b', '#3b6fb6'].slice(0, 3 + tier), t0 = performance.now(), dur = UI._fast ? 30 : 2600;
  if (easel) { G.x = EASEL.stand[0]; G.y = EASEL.stand[1]; G.dir = EASEL.stand[2]; }
  UI.progress(easel ? 'Đang vẽ tranh ở giá vẽ…' : 'Đang ngồi vẽ trên giấy…', dur, '#9a72d6');
  await playCut({ inPlace: true, bars: false, steps: [{ fn: sc => { if (!easel) sc.meOy = 3; } }, { wait: dur }, { fn: sc => { sc.meOy = 0; } }], props: [now => {
    const k = clamp((now - t0) / dur, 0, 1), ax = easel ? EASEL.x + 3 : G.x - 8, ay = easel ? EASEL.y + 5 : G.y + 2, w = 16, h = easel ? 13 : 10;
    if (!easel) { wRect('#2a2136', ax - 1, ay - 1, w + 2, h + 2); wRect('#fffaf0', ax, ay, w, h); }
    const n = Math.floor(k * 22);
    for (let i = 0; i < n; i++) wRect(pal[i % pal.length], ax + 1 + (i * 5) % (w - 3), ay + 1 + Math.floor(i * 7 / 3) % (h - 2), 2 + (i % 2), 1 + (i % 3 === 0 ? 1 : 0));
    const bx = ax + 2 + Math.sin(now / 90) * 5 + w / 2, by = ay + h / 2 + Math.cos(now / 120) * 3;   // cây cọ
    wRect('#8a5a3a', bx, by - 4, 1, 5); wRect(pal[Math.floor(now / 400) % pal.length], bx, by + 1, 1, 1);
  }] });
}

/* ---------- Trung tâm năng khiếu (phố Hoa Phượng): lễ tân · phòng vẽ · phòng thanh nhạc ---------- */
const TL_ROOM = 'nangkhieu', TL_KEYS = ['ve', 'hat'];
const talentOn = k => !!(G.talent && G.talent[k] >= G.day);
const TL_SEAT = { ve: [76, 150], hat: [270, 104] };
function buildHobbyPlaces() {
  addObj(MAPS.pho, { door: true, s: 'talentB', x: 900, y: 300, sol: [1, 24, 96, 53], label: () => 'Trung tâm năng khiếu Hoạ Mi — lớp vẽ, lớp thanh nhạc', act: () => ACT.talent() });
  const m = roomBase(TL_ROOM, 'Trung tâm năng khiếu Hoạ Mi', '#f3e7f6', '#c9b0e0', 'wood', 22, 14);
  roomExit(m, { map: 'pho', x: 948, y: 390, dir: 0 });
  paint(m, 'walltop', 13, 2, 1, 8, 1);                                                // vách ngăn: phòng vẽ (trái) · phòng thanh nhạc + lễ tân (phải)
  m.labels.push({ x: 104, y: 16, text: 'PHÒNG VẼ', size: 5, col: '#7a5fc9', maxw: 80 }, { x: 280, y: 16, text: 'THANH NHẠC · LỄ TÂN', size: 4.6, col: '#7a5fc9', maxw: 100 });
  for (let i = 0; i < 6; i++) addObj(m, { s: 'easel', x: 26 + (i % 3) * 58, y: 60 + Math.floor(i / 3) * 52, sol: [2, 22, 18, 8] });
  addObj(m, { s: 'piano', x: 236, y: 40, sol: [0, 12, 40, 14] }); addObj(m, { s: 'mic', x: 296, y: 56, sol: [1, 16, 6, 6] });
  for (const a of [276, 292]) addObj(m, { s: 'counter', x: a, y: 136, sol: [1, 4, 16, 23] });
  addObj(m, { s: 'plant', x: 232, y: 140, sol: [2, 14, 12, 9] });
  NPCS.push({ id: 'tl_letan', name: 'Chị lễ tân', look: 'letan', map: TL_ROOM, x: 292, y: 130, dir: 0, label: () => 'Chị lễ tân — đăng ký gói học tháng', act: () => ACT.talentDesk() });
  NPCS.push({ id: 'tl_ve', name: 'Cô Mai Anh', look: 'artT', map: TL_ROOM, x: 104, y: 46, dir: 0, vis: () => !sceneHides('tl_ve'), label: () => 'Cô Mai Anh — dạy vẽ', act: () => UI.ask('Cô Mai Anh', `<p>“Lớp vẽ học sáng thứ 7, ${fmtTime(TALENT.ve.from)}–${fmtTime(TALENT.ve.from + 60)}. Em đăng ký gói tháng ở quầy lễ tân nhé.”</p>`, ['Dạ'], { who: { look: 'artT' } }) });
  NPCS.push({ id: 'tl_hat', name: 'Thầy Khang', look: 'musicT', map: TL_ROOM, x: 250, y: 74, dir: 0, vis: () => !sceneHides('tl_hat'), label: () => 'Thầy Khang — dạy thanh nhạc', act: () => UI.ask('Thầy Khang', `<p>“Lớp thanh nhạc học chiều thứ 7, ${fmtTime(TALENT.hat.from)}–${fmtTime(TALENT.hat.from + 60)}. Đăng ký ở quầy lễ tân là vào học được.”</p>`, ['Dạ'], { who: { look: 'musicT' } }) });
}
ACT.talent = async () => {
  if (RT.lock || tetShut('Trung tâm năng khiếu Hoạ Mi')) return;
  if (!inWin(G.time, 420, 1260)) return UI.say('Trung tâm năng khiếu Hoạ Mi', 'Trung tâm đã đóng cửa.<p class="dim">Mở cửa 07:00–21:00. Lớp học vào thứ 7.</p>');
  if (G.ride) dismount(true);
  const e = MAPS[TL_ROOM].entry; await goPlace(TL_ROOM, e[0], e[1], e[2], 0);
};
ACT.talentDesk = async () => {
  const who = { look: 'letan' }, line = k => `${TALENT[k].name}: thứ 7 ${fmtTime(TALENT[k].from)}–${fmtTime(TALENT[k].from + 60)} (2 tiết liền)${talentOn(k) ? ` · đã đăng ký đến <b>${dateLabel(G.talent[k])}</b>` : ''}`;
  const opts = TL_KEYS.map(k => `${talentOn(k) ? 'Gia hạn' : 'Mua'} gói tháng ${TALENT[k].name.toLowerCase()} · ${fmtMoney(TALENT.price)}`).concat('Thôi');
  const c = await UI.ask('Chị lễ tân · Trung tâm năng khiếu', `<p>“Trung tâm có lớp vẽ và lớp thanh nhạc, học theo gói tháng (${TALENT.days} ngày) nhé em.”</p><ul class="res"><li>${line('ve')} → +Hội hoạ</li><li>${line('hat')} → +Văn nghệ</li></ul><p class="dim">Phải có mặt ở trung tâm trước giờ học mới được vào lớp; tới muộn thì mất tiết đó.</p>`, opts, { who });
  if (c < 0 || c >= TL_KEYS.length) return;
  const k = TL_KEYS[c];
  if (G.money < TALENT.price) return UI.ask('Chị lễ tân', `<p>“Gói tháng ${fmtMoney(TALENT.price)} em ạ, em chưa đủ tiền rồi.”</p>`, ['Dạ'], { who });
  addMoney(-TALENT.price, true); G.talent[k] = Math.max(G.talent[k] || G.day - 1, G.day - 1) + TALENT.days;
  addMemo('scene', 'nangkhieu');
  await UI.ask('Chị lễ tân', `<p>“Xong rồi! ${TALENT[k].name} của em học sáng / chiều thứ 7 hằng tuần, lúc ${fmtTime(TALENT[k].from)}, đến hết ${dateLabel(G.talent[k])}. Nhớ tới sớm nhé!”</p>`, ['Dạ, em cảm ơn chị!'], { who });
  UI.hud();
};
// mỗi khung hình: thứ 7 tới giờ học thì vào lớp nếu đang ở trung tâm; không có mặt thì mất tiết
function talentTick() {
  if (!G || !G.talent || RT.lock || UI.isOpen() || RT.scene || cal(G.day).dow !== 5) return false;
  for (const k of TL_KEYS) {
    if (!talentOn(k)) continue;
    const L = TALENT[k], st = G.daily['tl_' + k] || 0, here = G.map === TL_ROOM;
    if (st === 0 && G.time >= L.from) {
      if (here && G.time < L.from + 30) { talentClass(k, 2); return true; }
      G.daily['tl_' + k] = 1; UI.toast(`Không có mặt ở trung tâm lúc ${fmtTime(L.from)} — mất tiết 1 ${L.name.toLowerCase()}.`, 'bad');
      return true;
    }
    if (st === 1 && G.time >= L.from + 30) {
      if (here && G.time < L.from + 60) { talentClass(k, 1); return true; }
      G.daily['tl_' + k] = 3; UI.toast(`Mất cả buổi ${L.name.toLowerCase()} hôm nay.`, 'bad');
      return true;
    }
  }
  return false;
}
async function talentClass(k, n) {
  RT.lock = true; G.daily['tl_' + k] = 3;
  const L = TALENT[k], [sx, sy] = TL_SEAT[k], tl = k === 've' ? { look: 'artT', x: 104, y: 46, id: 'tl_ve' } : { look: 'musicT', x: 250, y: 74, id: 'tl_hat' };
  const mates = k === 've' ? [['x2', 26 + 58 + 11, 60 + 30], ['sF', 26 + 116 + 11, 60 + 30], ['x4', 26 + 11, 112 + 30]] : [['c4', 236, 104], ['x1', 300, 104]];
  await playCut({ inPlace: true, bars: false, title: L.name, hide: [tl.id], cam: { x: k === 've' ? 110 : 270, y: 100 },
    actors: [{ look: tl.look, x: tl.x, y: tl.y, dir: 0 }].concat(mates.map(([look, x, y]) => ({ look, x, y, dir: 3 }))),
    props: k === 've' ? [now => { const n2 = Math.floor(now / 300) % 12; for (let i = 0; i < n2; i++) wRect(['#5fae4a', '#e2574c', '#ffd23a', '#3b82c4'][i % 4], sx - 7 + (i * 3) % 12, sy - 40 + (i * 5) % 9, 2, 1); }] : [now => { const f = Math.floor(now / 260) % 3; wRect('#2a2136', sx + 8 + f * 3, sy - 34 - f * 2, 1, 4); wRect('#2a2136', sx + 8 + f * 3, sy - 31 - f * 2, 2, 1); }],
    steps: [{ move: ['me', sx, sy, 700] }, { fn: () => { G.dir = 3; } },
      { say: [0, n === 2 ? (k === 've' ? 'Hôm nay cô hướng dẫn vẽ phong cảnh màu nước nhé!' : 'Chúng ta khởi động giọng trước, rồi tập bài mới nhé!') : 'Em đến muộn, vào học nốt tiết sau nhé.'] },
      { live: async () => { for (let i = 0; i < n; i++) await UI.progress(`Tiết ${3 - n + i} · ${L.name}`, UI._fast ? 10 : 1700, k === 've' ? '#9a72d6' : '#d9742b'); } },
      { say: [0, 'Hôm nay các em làm tốt lắm. Hẹn thứ 7 tuần sau!'] }] });
  advanceTime(Math.max(0, L.from + 60 - G.time)); useStam(TALENT.stam * n); addStat(L.stat, L.pts * n);
  RT.lock = false; UI.hud();
  UI.toast(`Xong ${n} tiết ${L.name.toLowerCase()}: +${L.pts * n} ${STAT_NAMES[L.stat]}.`, 'good');
}

/* ---------- Phụ cô Ba bán hàng: đứng quầy trước tạp hoá, khách tới thì đưa hàng ---------- */
async function partTimeCut() {
  const CX = 351, CY = 146, items = ['bimbim', 'sua', 'banhmi', 'nuocmia'], st = { give: null };
  const cust = [['x1', 'Cho cháu gói bim bim ạ!'], ['ph3', 'Cô lấy hai hộp sữa nhé.'], ['c5', 'Một ổ bánh mì nha bạn!'], ['ph4', 'Chai nước mắm với gói mì nhé cháu.']];
  const actors = [{ look: 'vendor', x: CX - 30, y: CY - 6, dir: 2 }].concat(cust.map(([look], i) => ({ look, x: i % 2 ? 560 : 140, y: CY + 22, dir: i % 2 ? 1 : 2 })));
  const steps = [{ say: [0, 'Con đứng quầy giúp cô nhé, khách tới thì đưa hàng, thu tiền cẩn thận!'] }];
  cust.forEach(([, line], i) => {
    const k = i + 1;
    steps.push({ move: [k, CX, CY + 22, 900] }, { fn: sc => { sc.actors[k].dir = 3; } }, { say: [k, line] },
      { fn: () => { st.give = { t: performance.now(), it: items[i], to: k }; } }, { wait: 550 }, { fn: () => { st.give = null; } },
      { say: ['me', pick(['Dạ, của cô / chú đây ạ!', 'Cảm ơn ạ, lần sau lại ghé nhé!', 'Dạ có ngay!'])] },
      { move: [k, i % 2 ? 140 : 560, CY + 22, 900] });
  });
  await playCut({ map: 'town', me: [CX, CY - 4, 0], cam: { x: CX, y: CY }, title: 'Phụ cô Ba bán hàng', actors, steps,
    props: [now => {
      wRect('#6f472c', CX - 22, CY + 2, 44, 3); wRect('#a9703f', CX - 22, CY + 5, 44, 9); wRect('#c58c56', CX - 22, CY + 2, 44, 1);   // quầy hàng
      items.forEach((it, i) => drawSpr(iconCv(it), CX - 21 + i * 11, CY - 9));
      if (st.give) { const k = clamp((now - st.give.t) / 450, 0, 1), a = RT.scene.actors[st.give.to]; drawSpr(iconCv(st.give.it), CX - 8 + (a.x - CX) * k, CY - 14 + (a.y - 20 - CY + 14) * k - Math.sin(k * 3.14) * 8); }
    }] });
}

/* ---------- TẾT: chúc Tết người lớn → lì xì (mỗi người 1 lần mỗi Tết) · lì xì cho bạn ---------- */
const tetY2 = () => { const T = tetYear(); T.lx = T.lx || {}; T.give = T.give || {}; return T; };
async function tetElder(key, name, who, base) {
  const T = tetY2();
  if (T.lx[key]) return UI.ask(name, '<p>“Cháu chúc Tết rồi mà! Ăn miếng mứt rồi đi chơi tiếp đi cháu.”</p>', ['Dạ'], { who });
  const c = await UI.ask(name, `<p>“Ôi, ${G.name} đấy à? Năm mới vào nhà chơi đi cháu!”</p>`, [`Chúc Tết ${name.replace(/^./, s => s.toLowerCase())}`, 'Cháu chào ạ'], { who });
  if (c !== 0) return;
  T.lx[key] = true;
  const money = r1000((base || 20000) + Math.random() * 30000);
  addMoney(money); addMemo('scene', 'tetvisit');
  await UI.ask(name, `<p>Bạn khoanh tay: “Cháu chúc ${name.replace(/^./, s => s.toLowerCase())} năm mới an khang thịnh vượng, vạn sự như ý ạ!”</p><p>“Cháu ngoan quá! Lì xì cho cháu lấy may đầu năm này.” — nhận bao lì xì <b>${fmtMoney(money)}</b>.</p>`, ['Cháu cảm ơn ạ!'], { who });
}
const LIXI_GIVE = [[10000, 2], [20000, 4], [50000, 7], [100000, 10], [200000, 14]];
async function giveLixi(fid) {
  const F = FRIENDS[fid], T = tetY2(), who = { look: fid, outfit: friendOutfit(fid) };
  if (T.give[fid]) return UI.ask(F.name, '<p>“Cậu lì xì tớ rồi mà, cảm ơn nha!”</p>', ['Hihi'], { who });
  const L = LIXI_GIVE.filter(([v]) => v <= G.money);
  if (!L.length) return UI.toast('Không đủ tiền để lì xì.', 'bad');
  const c = await UI.ask(`Lì xì cho ${F.name}`, `<p>Bỏ bao nhiêu tiền vào phong bao lì xì?</p><p class="dim">Bạn đang có ${fmtMoney(G.money)}. Lì xì càng hậu, ${F.name} càng quý.</p>`, L.map(([v]) => fmtMoney(v)).concat('Thôi'), { grid: true });
  if (c < 0 || c >= L.length) return;
  const [v, pts] = L[c];
  T.give[fid] = true; addMoney(-v, true);
  const n = NPCS.find(q => q.map === G.map && (q.fid === fid || q.sid === fid || (q.id === 'fh' && G.visit === fid)) && (!q.vis || q.vis())), fx = n ? n.cx : G.x + 16, fy = n ? n.cy : G.y, t0 = { t: 0 };
  await playCut({ inPlace: true, bars: false, title: 'Lì xì đầu năm', actors: [{ look: fid, outfit: friendOutfit(fid), x: fx, y: fy, dir: fx < G.x ? 2 : 1 }],
    props: [now => { if (!t0.t) return; const k = clamp((now - t0.t) / 600, 0, 1); drawSpr(iconCv('lixi'), G.x - 8 + (fx - G.x) * k, G.y - 30 + (fy - G.y) * k - Math.sin(k * 3.14) * 10); }],
    steps: [{ fn: () => { G.dir = fx < G.x ? 1 : 2; } }, { say: ['me', `Chúc mừng năm mới! Lì xì cho ${F.name} lấy may nè!`] }, { fn: () => { t0.t = performance.now(); } }, { wait: 650 }, { fn: () => { t0.t = 0; } }, { hop: 0 },
      { say: [0, v >= 100000 ? 'Trời ơi nhiều thế! Cảm ơn cậu nhiều lắm, năm mới phát tài nha!' : 'Ôi, cảm ơn cậu! Chúc cậu năm mới học giỏi, may mắn nha!'] }] });
  addFriend(fid, pts);
  UI.toast(`Đã lì xì ${fmtMoney(v)} cho ${F.name} (+${pts} ♥).`, 'good'); UI.hud();
}
