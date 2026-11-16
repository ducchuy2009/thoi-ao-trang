'use strict';
/* ============================================================
 *  04g. TẾT TRUNG THU (giữa mùa thu) ở phố Hoa Phượng
 *  - Trước 1 tuần: tạp hoá Cô Ba, căn tin bán nguyên liệu làm đèn lồng (nan tre, giấy bóng kính, nến)
 *  - Sáng hôm đó: mẹ rủ cả nhà đi, bạn thân nhắn tin rủ rước đèn
 *  - 20:00–23:00 tới phố Hoa Phượng là vào hội (thời gian đứng yên): đập niêu, kéo co, làm đèn ông sao, sạp bánh
 *  - Gặp ông thị trưởng để bắt đầu buổi lễ: múa lân → rước đèn quanh phố → chụp ảnh → 24:00 về nhà
 * ============================================================ */
const ttDayOf = year => year * YEAR_DAYS + TT.season * CFG.DAYS_PER_SEASON + TT.day - 1;
const ttY = () => { const y = cal(G.day).year; return (G.tt[y] = G.tt[y] || {}); };
const ttMatOpen = day => { const d0 = ttDayOf(cal(day).year); return day >= d0 - TT.matDays && day <= d0; };
const ttOk = () => !!G && isTTDay(G.day) && G.time < TT.until && !ttY().done;          // tối nay còn vào hội được
const ttMatsMissing = () => TT_MATS.filter(m => !G.inv[m.id]);
const ttMatsHave = () => !ttMatsMissing().length;
// nguyên liệu bày bán ở tạp hoá / căn tin (chỉ trong tuần trước Trung thu)
const ttMatItems = () => (ttMatOpen(G.day) ? TT_MATS.map(m => ({ id: m.id, name: m.name, price: m.price, desc: m.desc + ' Chỉ bán trong tuần trước Trung thu.', inv: m.id, mat: true })) : []);
function buyMat(it) {
  if (G.money < it.price) return UI.toast('Không đủ tiền.', 'bad');
  addMoney(-it.price, true); G.inv[it.id] = (G.inv[it.id] || 0) + 1;
  UI.toast(`Đã mua ${it.name} (−${fmtMoney(it.price)}). ${ttMatsHave() ? 'Đủ nguyên liệu làm đèn ông sao rồi!' : 'Còn thiếu: ' + ttMatsMissing().map(m => m.name.toLowerCase()).join(', ') + '.'}`, 'good');
  UI.hud();
}

/* ---------- lời rủ đi chơi Trung thu ---------- */
async function ttInvite() {
  G.daily.ttAsked = true;
  const T = ttY(), at = fmtTime(TT.from);
  const c = await UI.ask('Mẹ', `<p>“Hôm nay là Tết Trung thu đó con! Tối nay ${at} cả nhà ra phố Hoa Phượng xem múa lân, rước đèn nhé. Ngoài đó còn có đập niêu, kéo co, làm đèn ông sao nữa.”</p>`, ['Dạ, con đi cùng cả nhà!', 'Con tự đi với bạn ạ'], { who: { look: 'mom', outfit: 'noapron' } });
  if (c === 0) { T.fam = true; G.daily.outPerm = true; }
  const fid = Object.keys(FRIENDS).filter(f => !grudge(f) && hearts(f) >= 2).sort((a, b) => (G.friends[b] || 0) - (G.friends[a] || 0))[0];
  if (fid) {
    const d = await UI.ask(FRIENDS[fid].name, `<p class="dim">Tin nhắn điện thoại</p><p>“Tối nay Trung thu đi rước đèn với tớ không? ${at} gặp nhau ở phố Hoa Phượng nha! Nghe nói có múa lân với đập niêu đó!”</p>`, ['Đi chứ! Hẹn cậu ở phố', 'Hôm nay tớ bận rồi'], { who: { look: fid, outfit: friendOutfit(fid) } });
    if (d === 0) { T.fid = fid; G.daily.outPerm = true; }
  }
  UI.toast(`Tối nay ${at}–${fmtTime(TT.until)} tới phố Hoa Phượng là vào hội Trung thu.${ttMatsHave() ? '' : ' Muốn tự làm đèn ông sao thì mua nan tre, giấy bóng kính, nến ở tạp hoá Cô Ba, căn tin hoặc sạp trong hội.'}`, 'good');
}

/* ---------- vào hội / rời hội ---------- */
function startTT() {
  RT.ttFest = true; G.daily.outPerm = true;
  const T = ttY(), w = T.fid;
  if (!T.joined) { T.joined = true; UI.toast('Đêm hội Trung thu! Trong hội thời gian tạm dừng. Khi muốn xem múa lân, rước đèn thì gặp ông thị trưởng ở sân khấu.', 'good'); }
  if (w && FRIENDS[w] && !grudge(w) && !(G.comp && G.comp.fid === w)) {
    setComp(w, false); RT.fol = { map: G.map, x: G.x + 14, y: G.y - 6, dir: 0, walk: -1 };
    UI.ask(FRIENDS[w].name, '<p>“Cậu tới rồi! Đông vui ghê! Đi đập niêu, kéo co trước rồi xem múa lân nha?”</p>', ['Đi thôi!'], { who: { look: w, outfit: friendOutfit(w) } });
  }
}
async function leaveTT() {
  const c = await meSay('<p>Rời hội Trung thu? Múa lân với rước đèn còn chưa bắt đầu.</p><p class="dim">Ra khỏi phố thì thời gian chạy tiếp; quay lại trước 23:00 vẫn vào hội được.</p>', ['Ở lại chơi tiếp', 'Rời hội']);
  if (c !== 1) { G.x = clamp(G.x, 26, 870); G.y = clamp(G.y, 26, 394); return false; }
  RT.ttFest = false;
  return true;
}
function ttChat(i, look, of) {
  const k = 'ttc' + i; if (!G.daily[k]) { G.daily[k] = true; }
  UI.ask('Người xem hội', `<p>“${TT_CHAT[i % TT_CHAT.length]}”</p>`, ['Trung thu vui vẻ!'], { who: { look, outfit: of } });
}

/* ---------- sạp hàng ---------- */
const ttClosed = name => UI.say(name, `Sạp đang bày hàng. Hội mở lúc ${fmtTime(TT.from)}.`);
ACT.ttMats = () => {
  if (!ttOn()) return ttClosed('Sạp nguyên liệu');
  UI.store('Sạp nguyên liệu làm đèn', '“Nan tre, giấy bóng kính, nến đây con! Đủ ba thứ là sang sạp bên cạnh làm đèn ông sao.”', () => TT_MATS.map(m => ({ id: m.id, name: m.name, price: m.price, desc: m.desc, inv: m.id, mat: true })), buyMat);
};
ACT.ttFood = () => {
  if (!ttOn()) return ttClosed('Sạp bánh trung thu');
  UI.store('Sạp bánh trung thu', '“Bánh nướng, bánh dẻo mới ra lò nè!”', TT_FOOD.map(f => ({ id: f.id, name: f.name, price: f.price, desc: f.desc, inv: f.id })), f => buyFood(f.id, f.price, f.name));
};
ACT.ttLantern = async () => {
  if (RT.lock) return;
  if (!ttOn()) return ttClosed('Sạp làm đèn lồng');
  const who = { look: 'c3', outfit: 'cas_khoa' }, miss = ttMatsMissing();
  if (miss.length) return UI.ask('Chú làm đèn', `<p>“Muốn làm đèn ông sao thì phải có đủ <b>nan tre, giấy bóng kính và nến</b> nha cháu. Cháu còn thiếu: <b>${miss.map(m => m.name.toLowerCase()).join(', ')}</b>.”</p><p class="dim">Mua ở sạp nguyên liệu ngay bên cạnh (hoặc tạp hoá Cô Ba, căn tin trường trong tuần trước Trung thu).</p>`, ['Dạ'], { who });
  const c = await UI.ask('Chú làm đèn', '<p>“Đủ đồ rồi! Ngồi xuống đây chú chỉ: nối nan tre thành ngôi sao năm cánh, dán giấy bóng kính, rồi gắn nến với cán cầm.”</p><p class="dim">Dùng 1 nan tre, 1 giấy bóng kính, 1 nến. Làm hỏng thì mất nguyên liệu.</p>', ['Làm đèn!', 'Để sau'], { who });
  if (c !== 0) return;
  for (const m of TT_MATS) G.inv[m.id]--;
  RT.lock = true;
  const r = await playGame('denlong', lv('kheotay') >= 6 ? 1 : 2);
  RT.lock = false;
  if (r.score >= 0.6) {
    G.inv.denongsao = (G.inv.denongsao || 0) + 1; ttY().lantern = true; addStat('kheotay', 3);
    addMemo('item', 'denongsao'); addMemo('badge', 'trungthu');
    await UI.ask('Đèn ông sao', `<div class="tt-lantern"><img src="${itemIcon('denongsao')}" alt=""></div><p>Chiếc đèn ông sao đỏ rực, ánh nến lung linh. Lát nữa rước đèn sẽ cầm chiếc này!</p>`, ['Tuyệt!']);
  } else UI.toast('Khung đèn bị méo, giấy rách mất rồi… Mua nguyên liệu làm lại nhé.', 'bad');
  UI.hud();
};

/* ---------- bịt mắt đập niêu · kéo co ---------- */
ACT.ttNieu = async () => {
  if (RT.lock) return;
  if (!ttOn()) return ttClosed('Bịt mắt đập niêu');
  const fid = G.comp && G.comp.fid, guide = fid ? FRIENDS[fid].name : 'Chú quản trò';
  const c = await UI.ask('Bịt mắt đập niêu', `<p>“Bịt mắt lại, cầm gậy, nghe ${fid ? FRIENDS[fid].name : 'chú'} chỉ đường mà đập! Vỡ niêu là kẹo rơi đầy đất!” · ${fmtMoney(TT.nieuPrice)} một lượt</p><p class="dim">Đám đông xung quanh hay la ó chỉ bậy — chỉ nghe theo người dẫn đường thôi nhé.</p>`, ['Chơi một lượt', 'Thôi'], { who: { look: 'driver' } });
  if (c !== 0) return;
  if (G.money < TT.nieuPrice) return UI.toast('Không đủ tiền.', 'bad');
  addMoney(-TT.nieuPrice, true); RT.lock = true;
  const r = await playGame('dapnieu', 2, guide);
  const win = r.score >= 0.6, [nx, ny] = TT_SPOTS.nieu, t0 = { v: 0 };
  // cảnh ngắn: vung gậy, niêu vỡ thì kẹo rơi tung toé
  const prop = now => {
    const t = (now - t0.v) / 1000; if (t < 0) return;
    if (!win) return;
    for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283, k = Math.min(1, t * 1.4), x = nx + 22 + Math.cos(a) * 18 * k, y = ny + 18 + Math.sin(a) * 6 * k + k * k * 22; wRect(['#ffd23a', '#e2574c', '#5fe0f0', '#8fd067'][i % 4], x, y, 2, 2); }
  };
  await playCut({ inPlace: true, bars: false, title: 'Đập niêu', props: [prop], hide: [],
    steps: [{ move: ['me', nx + 22, ny + 44, 400] }, { fn: () => { G.dir = 3; } }, { hop: 'me' }, { fn: () => { t0.v = performance.now(); } }, { wait: 700 }, { say: ['me', win ? 'Bốp! Vỡ rồi! Kẹo rơi đầy nè!' : 'Ơ… đập trượt rồi! Cả đám cười ầm…'] }] });
  if (win) { addMemo('badge', 'dapnieu'); gainStam(5); if (!G.daily.ttNieu) { G.daily.ttNieu = true; addStat('kheotay', 2); } }
  if (fid) addFriend(fid, 3);
  RT.lock = false; UI.hud();
};
ACT.ttKeoco = async () => {
  if (RT.lock) return;
  if (!ttOn()) return ttClosed('Kéo co');
  const fid = G.comp && G.comp.fid, fam = !!ttY().fam, mates = [fid && FRIENDS[fid].name, fam && 'bố'].filter(Boolean);
  const c = await UI.ask('Trọng tài kéo co', `<p>“Đội Hoa Phượng đang thiếu người! Vào kéo với đội Bờ Sông không? Kéo dải lụa đỏ qua vạch bên mình trước là thắng!”</p><p class="dim">Bấm <b>Space</b> thật nhanh (hoặc nút KÉO!) để cả đội kéo.</p>${mates.length ? `<p class="dim">${mates.join(' và ')} vào đội cùng bạn.</p>` : ''}`, ['Vào đội!', 'Thôi'], { who: { look: 'c5', outfit: 'cas_khoa' } });
  if (c !== 0) return;
  RT.lock = true;
  let r;
  try { const m = await ttTug(fid, fam); r = { score: m.win ? 1 : 0.3 }; } finally { RT.lock = false; arenaClose(); }   // kéo co dạng cắt cảnh chơi được (04k)
  if (r.score >= 0.95) { addMemo('badge', 'keoco'); UI.toast('Đội Hoa Phượng thắng! Cả đội ôm nhau nhảy cẫng lên.', 'good'); if (!G.daily.ttKeo) { G.daily.ttKeo = true; addStat('thethao', 3); } }
  else UI.toast('Đội Bờ Sông khoẻ quá, đội mình thua rồi…', 'info');
  addStat('thethao', 1); if (fid) addFriend(fid, TT.keocoFriend);
  UI.hud();
};

/* ---------- buổi lễ: thị trưởng khai hội → múa lân → rước đèn → ảnh → 24:00 về nhà ---------- */
ACT.mayor = async () => {
  if (RT.lock) return;
  if (!ttOn()) return UI.ask('Ông thị trưởng', `<p>“Hội Trung thu bắt đầu lúc ${fmtTime(TT.from)}, cháu nhớ ra chơi nhé!”</p>`, ['Dạ'], { who: { look: 'mayor' } });
  meetSoc('thitruong');
  const lan = G.inv.denongsao > 0;
  const c = await UI.ask('Ông thị trưởng', `<p>“Chào cháu! Bà con đã tụ họp đông đủ rồi. Cháu có muốn bắt đầu buổi lễ ngay không? Mở màn là múa lân, sau đó cả phố cùng rước đèn. Buổi lễ kết thúc lúc 24:00.”</p><p class="dim">Bắt đầu rồi thì các sạp trò chơi đóng cửa. ${lan ? 'Bạn sẽ cầm đèn ông sao tự làm đi rước.' : 'Chưa có đèn ông sao tự làm — ban tổ chức sẽ phát cho bạn một chiếc để rước.'}</p>`, ['Bắt đầu buổi lễ!', 'Cháu chơi thêm chút đã'], { who: { look: 'mayor' } });
  if (c === 0) await ttCeremony();
};
async function ttCeremony() {
  RT.lock = true;
  const T = ttY(), fid = G.comp && G.comp.fid, fam = !!T.fam;
  await playCut(lionDanceCut(fid, fam));
  G.time = Math.max(G.time, TT.until);
  await playCut(processionCut(fid, fam));
  await UI.fade(true);
  RT.ttFest = false; T.done = true; endComp();
  G.time = TT.end; G.daily.checkedIn = true; G.daily.scolded = true; G.daily.outAt20 = false; G.atSchool = false;
  setMap('home', 58, 76, 0); RT.snapNpcs = true;
  addMemo('scene', 'trungthu'); addMemo('item', 'anhtrungthu');
  if (fid) addFriend(fid, 8);
  if (fam) addParent(2, 'cả nhà đi chơi Trung thu');
  await UI.fade(false);
  RT.lock = false; UI.hud();
  UI.toast('Buổi lễ kết thúc lúc 24:00. Về tới nhà rồi — ảnh rước đèn đã dán vào lưu bút.', 'info');
}
// vẽ sprite lật ngang (lân, ông Địa quay sang trái)
function drawSprFlip(spr, x, y) { const S = VIEW.S; ctx.save(); ctx.translate(VIEW.ox + Math.round(x) * S + spr.width * S, VIEW.oy + Math.round(y) * S); ctx.scale(-1, 1); ctx.drawImage(spr, 0, 0, spr.width * S, spr.height * S); ctx.restore(); }
function lionDanceCut(fid, fam) {
  const [mx, my] = TT_SPOTS.mayor, [lx, ly] = TT_SPOTS.lion, [ox, oy] = TT_SPOTS.ongdia, [dx0, dy0] = TT_SPOTS.drum, cx0 = 470, cy0 = 376, t0 = { v: 0 };
  const ring = [[-62, -10, 2, 'c1', 'cas_dat'], [-66, 14, 2, 'c2', 'cas_vy'], [-44, 32, 3, 'c3', 'cas_khoa'], [-8, 38, 3, 'c4', 'cas_ngan'], [28, 36, 3, 'c6', 'cas_vy'], [62, 18, 1, 'c8', 'cas_ngan'], [70, -6, 1, 'x1', 'cas_khoa']];
  const actors = [{ look: 'mayor', x: mx, y: my, dir: 0 }, { look: 'driver', x: dx0 + 22, y: dy0 + 14, dir: 1 }].concat(ring.map(([a, b, d, look, of]) => ({ look, outfit: of, x: cx0 + a, y: cy0 + b, dir: d })));
  if (fid) actors.push({ look: fid, outfit: friendOutfit(fid), x: cx0 - 26, y: cy0 + 46, dir: 3 });
  if (fam) actors.push({ look: 'mom', outfit: 'noapron', x: cx0 + 12, y: cy0 + 50, dir: 3 }, { look: 'dad', outfit: 'dadhome', x: cx0 + 28, y: cy0 + 50, dir: 3 });
  const hide = ['ttlion', 'tt_mayor', 'tt_mom', 'tt_dad'].concat(Object.keys(FRIENDS).map(f => 'tt_' + f));
  const st = { ph: 'idle' };
  const prop = now => {
    const t = (now - t0.v) / 1000, f = Math.floor(now / 160) % 2;
    let x = lx, y = ly, left = false, bob = 0, gx = ox, gy = oy;
    if (st.ph === 'dance') { x = cx0 - 18 + Math.sin(t * 1.5) * 34; y = cy0 - 18 + Math.sin(t * 3) * 8; left = Math.cos(t * 1.5) < 0; bob = -Math.abs(Math.sin(t * 5)) * (t % 3 > 2 ? 10 : 3); gx = cx0 - 10 + Math.sin(t * 1.5 - 0.9) * 40; gy = cy0 - 6 + Math.sin(t * 3 - 1.8) * 6; }
    if (st.ph === 'bow') { x = mx - 18; y = my + 14; left = false; bob = f ? 2 : 0; gx = mx + 22; gy = my + 18; }
    (left ? drawSprFlip : drawSpr)(SPR['lion' + f], x, y + bob);
    (gx < x ? drawSpr : drawSprFlip)(SPR['ongdia' + (Math.floor(now / 220) % 2)], gx, gy);
    drawSpr(SPR.trong, dx0, dy0);
    if (st.ph === 'dance' && Math.floor(now / 230) % 2) { drawSpr(SPR.hit, dx0 + 4, dy0 - 10); }
  };
  return {
    map: 'pho', me: [cx0 + 46, cy0 + 44, 3], cam: { x: cx0 + 6, y: cy0 - 26 }, title: 'Múa lân khai hội Trung thu', actors, hide, props: [prop],
    steps: [{ fn: sc => { sc.glow = [ttMoon]; } },
      { say: [0, 'Kính thưa bà con cô bác và các cháu thiếu nhi!'] },
      { say: [0, 'Tôi xin tuyên bố khai mạc Đêm hội Trăng rằm phố Hoa Phượng!'] },
      { fn: () => { st.ph = 'dance'; t0.v = performance.now(); } }, { say: [1, 'Tùng tùng cắc! Tùng tùng cắc!'] }, { wait: 1800 },
      { say: [4, 'Lân nhảy cao quá kìa!'] }, { say: [6, 'Ông Địa phe phẩy quạt mắc cười ghê!'] }, { wait: 1200 },
      { fn: () => { st.ph = 'bow'; } }, { wait: 600 },
      { say: [0, 'Chúc bà con một mùa trăng no đủ, an vui! Giờ mời cả phố cùng rước đèn!'] },
      { say: ['me', 'Hay quá đi!'] }],
  };
}
function processionCut(fid, fam) {
  const L0 = 560, Y = 256, dx = -400, own = G.inv.denongsao > 0;
  // đoàn rước: lân dẫn đầu, ông Địa, trống, rồi mình, bạn, bố mẹ, các bạn nhỏ cầm đèn
  const col = [{ look: 'c5', x: 0, y: 0, hidden: true, k: 'lion' }, { look: 'c5', x: 30, y: 2, hidden: true, k: 'ongdia' }, { look: 'driver', x: 56, y: 0 }];
  if (fid) col.push({ look: fid, outfit: friendOutfit(fid), x: 82, y: 14, lan: true });
  if (fam) col.push({ look: 'mom', outfit: 'noapron', x: 106, y: -6, lan: true }, { look: 'dad', outfit: 'dadhome', x: 106, y: 12 });
  const kids = [['c1', 'cas_dat'], ['c2', 'cas_vy'], ['c3', 'cas_khoa'], ['c4', 'cas_ngan'], ['c6', 'cas_vy'], ['x1', 'cas_khoa']];
  kids.forEach(([look, of], i) => col.push({ look, outfit: of, x: 132 + (i >> 1) * 22, y: i % 2 ? 12 : -6, lan: true }));
  const actors = col.map(a => ({ look: a.look, outfit: a.outfit, x: L0 + a.x, y: Y + a.y, dir: 1, hidden: a.hidden, lan: a.lan, k: a.k }));
  const meX = L0 + 82, meY = Y - 6, nA = actors.length, iDrum = 2, iKid = actors.findIndex(a => a.look === 'c1');
  const hide = ['ttlion', 'tt_mayor', 'tt_mom', 'tt_dad'].concat(Object.keys(FRIENDS).map(f => 'tt_' + f), TT_KIDS.map((_, i) => 'ttk_' + i));
  const meWalk = (ms, k) => ({ move: ['me', meX + dx * k, meY, ms] });
  const cam = { look: 'c5', outfit: 'cas_khoa', x: L0 + dx + 80, y: Y + 64, dir: 3 };
  actors.push(cam); const iCam = actors.length - 1;
  const prop = now => {
    const sc = RT.scene, f = Math.floor(now / 160) % 2, bob = Math.floor(now / 200) % 2;
    for (const a of sc.actors) {
      if (a.k === 'lion') (a.dir === 2 ? drawSpr : drawSprFlip)(SPR['lion' + f], a.x - 18, a.y - 24 - (f ? 2 : 0));
      if (a.k === 'ongdia') (a.dir === 2 ? drawSpr : drawSprFlip)(SPR['ongdia' + (Math.floor(now / 220) % 2)], a.x - 10, a.y - 24);
      if (a.lan) drawSpr(SPR['sao' + bob], a.x + 3, a.y - 30 + bob);
    }
    drawSpr(SPR['sao' + (1 - bob)], G.x + 3, G.y - 30 + bob);
    const d = sc.actors[iDrum]; drawSpr(SPR.trong, d.x - 10, d.y - 14);
  };
  const steps = [{ fn: sc => { sc.glow = [ttMoon, ttLanternGlow]; } },
    { par: actors.slice(0, nA).map((a, i) => ({ move: [i, a.x + dx / 2, a.y, 3200] })).concat([meWalk(3200, 0.5), { say: [iKid, 'Rước đèn ông sao, đi khắp phố phường!'] }]) },
    { par: actors.slice(0, nA).map((a, i) => ({ move: [i, a.x + dx, a.y, 3200] })).concat([meWalk(3200, 1), { say: ['me', own ? 'Đèn tự làm của mình sáng nhất phố luôn!' : 'Trăng rằm tròn quá, đèn ông sao đẹp ghê!'] }]) },
    { fn: sc => { G.dir = 0; for (let i = 0; i < nA; i++) sc.actors[i].dir = 0; sc.actors[0].dir = 2; sc.actors[1].dir = 2; } },
    { move: [iCam, L0 + dx + 80, Y + 46, 600] },
    { say: [iCam, 'Cả đoàn đứng lại chụp tấm ảnh kỷ niệm nào!'] }, { say: [iCam, 'Một, hai, ba… Trung thu vui vẻ!'] }, { wait: 160 },
    { fn: sc => { snapPhoto('anhtrungthu', L0 + dx + 90, Y - 14, 190); sc.glow = [ttMoon, ttLanternGlow, flashGlow(performance.now())]; } }, { wait: 900 },
    fam ? { say: [actors.findIndex(a => a.look === 'mom'), 'Khuya rồi, cả nhà mình về thôi con!'] } : fid ? { say: [3, 'Vui ghê! Khuya rồi, mình về thôi!'] } : { say: ['me', 'Khuya rồi, về nhà thôi!'] }];
  return { map: 'pho', me: [meX, meY, 1], title: 'Rước đèn Trung thu', actors, hide, props: [prop], steps };
}
// trăng rằm (góc trên bên phải màn hình) và quầng sáng đèn ông sao — vẽ sau lớp tối ban đêm
function ttMoon() {
  const S = VIEW.S, X = cv.width - 46 * S, Y = 34 * S, r = 13 * S;
  const g = ctx.createRadialGradient(X, Y, r * 0.6, X, Y, r * 2.6); g.addColorStop(0, 'rgba(255,240,180,0.45)'); g.addColorStop(1, 'rgba(255,240,180,0)');
  ctx.fillStyle = g; ctx.fillRect(X - r * 3, Y - r * 3, r * 6, r * 6);
  ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.arc(X, Y, r, 0, 6.283); ctx.fill();
  ctx.fillStyle = 'rgba(214,196,140,0.55)'; for (const [a, b, c] of [[-0.35, -0.2, 0.22], [0.25, 0.15, 0.16], [-0.05, 0.4, 0.12]]) { ctx.beginPath(); ctx.arc(X + a * r, Y + b * r, c * r, 0, 6.283); ctx.fill(); }
}
function ttLanternGlow() {
  const S = VIEW.S, pts = [];
  if (RT.scene && RT.scene.actors) { for (const a of RT.scene.actors) if (a.lan) pts.push([a.x + 7, a.y - 25]); if (RT.scene.title === 'Rước đèn Trung thu') pts.push([G.x + 7, G.y - 25]); }
  else for (const n of npcsHere()) if (n.id.startsWith('ttk_') && n.cx !== undefined) pts.push([n.cx + 7, n.cy - 25]);
  if (!RT.scene && RT.hold === 'denongsao') pts.push([G.x, G.y - 40]);
  ctx.globalCompositeOperation = 'lighter';
  for (const [x, y] of pts) { const X = VIEW.ox + x * S, Y = VIEW.oy + y * S, g = ctx.createRadialGradient(X, Y, 0, X, Y, 11 * S); g.addColorStop(0, 'rgba(255,150,90,0.38)'); g.addColorStop(1, 'rgba(255,150,90,0)'); ctx.fillStyle = g; ctx.fillRect(X - 11 * S, Y - 11 * S, 22 * S, 22 * S); }
  ctx.globalCompositeOperation = 'source-over';
}
// gọi mỗi khung hình (06_engine): trên phố đêm Trung thu thì có trăng và ánh đèn của các bạn nhỏ
function drawTTGlow(now) {
  if (G.map !== 'pho' || !ttDecor() || nightAlpha(G.time) < 0.05) return;
  if (RT.scene && RT.scene.glow && RT.scene.glow.includes(ttMoon)) return;     // cắt cảnh đã tự vẽ
  ttMoon(); if (ttOn()) ttLanternGlow();
}
// đèn ông sao của các bạn nhỏ, dây kéo co trên sân bóng mini (vẽ trước lớp tối)
function drawTTProps(now) {
  if (G.map !== 'pho' || !ttOn() || (RT.scene && RT.scene.type === 'cut')) return;
  const bob = Math.floor(now / 200) % 2;
  for (const n of npcsHere()) if (n.id.startsWith('ttk_') && n.cx !== undefined) drawSpr(SPR['sao' + ((bob + n.id.length) % 2)], n.cx + 3, n.cy - 30 + bob);
  const [kx, ky] = TT_SPOTS.keoco, w = Math.round(Math.sin(now / 300) * 2);
  for (let i = -66; i <= 66; i++) wRect('#c9a467', kx + i + w, ky - 9, 1, 1);
  wRect('#e2574c', kx - 1 + w, ky - 12, 2, 6); wRect('#fffaf0', kx - 20, ky + 2, 1, 6); wRect('#fffaf0', kx + 20, ky + 2, 1, 6);
}
