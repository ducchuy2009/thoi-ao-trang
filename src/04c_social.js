'use strict';
/* ============================================================
 *  04c. BẠN BÈ & VUI CHƠI
 *  - Đi lại giữa khu phố · phố Hoa Sữa · núi sau trường
 *  - Tương tác với bạn (trường, lớp, công viên, nhà bạn, chỗ hẹn) · tặng quà
 *  - Giải lao giữa 2 tiết: đi vệ sinh chung / yoyo, con quay, đánh bài (có cắt cảnh)
 *  - Mượn sách, mượn bút · sự kiện trong giờ học và giờ nghỉ trưa · thư viện
 *  - Trà sữa, TTTM, khu game, xe xiên que, picnic trên núi
 *  - Thẻ cầu thủ: bóc gói, đấu thẻ · Điện thoại: nhắn tin, hẹn đi chơi
 * ============================================================ */

/* ---------- đi lại giữa các khu ---------- */
async function goPlace(map, x, y, dir, mins, label) {
  if (RT.lock) return;
  RT.lock = true;
  await UI.fade(true);
  if (mins) { await UI.progress(label, 600); advanceTime(mins); }
  setMap(map, x, y, dir);
  await UI.fade(false);
  RT.lock = false; UI.hud();
}
ACT.toPho = () => goPlace('pho', 16, 204, 2, TRAVEL.townPho, 'Đi bộ sang phố Hoa Sữa…');
ACT.toTown = () => goPlace('town', 782, 204, 1, TRAVEL.townPho, 'Đi bộ về khu phố nhà mình…');
ACT.toHill = from => {
  if (RT.lock) return;
  if (from === 'school' && schoolToday() && G.time < CFG.SCHOOL_END) return UI.say('Cổng sau', 'Cổng sau khoá trong giờ học.<p class="dim">Tan học (17:00) bác bảo vệ mới mở. Muốn lên núi trong giờ thì… phải rủ bạn cúp tiết.</p>');
  if (!inWin(G.time, HILL_HOURS[0], HILL_HOURS[1])) return UI.say('Đường lên núi', `Trời tối rồi, đường núi nguy hiểm lắm.<p class="dim">Chỉ lên núi được từ ${fmtTime(HILL_HOURS[0])} đến ${fmtTime(HILL_HOURS[1])}.</p>`);
  G.hillFrom = from;
  goPlace('nui', 320, 456, 3, from === 'school' ? TRAVEL.schoolNui : TRAVEL.phoNui, 'Leo đường mòn lên núi sau trường…');
};
ACT.leaveHill = () => (G.hillFrom === 'school' && G.atSchool
  ? goPlace('school', 24, 32, 0, TRAVEL.schoolNui, 'Xuống núi về cổng sau trường…')
  : goPlace('pho', 874, 204, 1, TRAVEL.phoNui, 'Xuống núi về phố Hoa Sữa…'));

/* ---------- hẹn đi chơi ---------- */
const meetOn = () => (G && G.meet && G.meet.day === G.day ? G.meet : null);
function meetWindow(m) { const P = PLACES[m.place]; return [Math.max(isSchoolDay(m.day) ? 1040 : 480, P.open[0], m.from || 0), Math.min(MEET_END, P.open[1])]; }
const meetTimeText = m => { const w = meetWindow(m); return `${fmtTime(w[0])}–${fmtTime(w[1])}`; };
function meetToday(fid) { const m = meetOn(); if (!m || m.fid !== fid) return false; const w = meetWindow(m); return inWin(G.time, w[0], w[1]); }
function meetHere(place) { const m = meetOn(); if (!m || m.place !== place) return null; const w = meetWindow(m); return inWin(G.time, w[0], w[1]) ? m.fid : null; }
// Đi cùng bạn đã hẹn: lần đầu cộng đủ điểm thân thiết, các lần sau trong buổi hẹn cộng một nửa
function meetGain(place, pts) {
  const fid = meetHere(place); if (!fid) return;
  const gain = G.meet.n++ ? Math.ceil(pts / 2) : pts;
  addFriend(fid, gain); UI.toast(`Đi chơi cùng ${FRIENDS[fid].name}: thân thiết +${gain}`, 'good');
}
const withLine = fid => (fid ? `<p class="okbox">${FRIENDS[fid].name} đang ở đây với bạn — đi chung sẽ thân nhau hơn.</p>` : '');
function friendHome(fid) {
  if (!G || meetToday(fid)) return false;
  const t = G.time;
  return schoolToday() ? inWin(t, 1210, 1290) : (inWin(t, 390, 480) || inWin(t, 1090, 1290));
}
function placeOpen(P) {
  if (inWin(G.time, P.open[0], P.open[1])) return true;
  UI.say(P.name, `Đóng cửa rồi.<p class="dim">Mở cửa ${fmtTime(P.open[0])}–${fmtTime(P.open[1])}</p>`); return false;
}

/* ---------- tương tác với bạn bè ---------- */
const MEET_VERB = { tea: 'Vào tiệm trà sữa cùng nhau', mall: 'Vào trung tâm thương mại cùng nhau', arcade: 'Vào khu game cùng nhau', park: "Chơi thể thao cùng nhau (60')", nui: 'Trải bạt picnic cùng nhau' };
function breakFunFor(fid) {
  const F = FRIENDS[fid];
  if (!G.atSchool || !schoolToday() || G.time >= 1060 || F.g !== G.gender || grudge(fid)) return [];
  if (hearts(fid) < BREAK_FUN_MIN_HEARTS || (G.daily.brk[fid] || 0) >= BREAK_FUN_PER_DAY) return [];
  return Object.keys(BREAK_FUN).filter(id => BREAK_FUN[id].g === G.gender);
}
ACT.mate = async sid => {
  const opts = ['Trò chuyện'], ids = ['chat'];
  if (cardCount()) { opts.push('Đấu thẻ cầu thủ (thắng lấy thẻ, thua mất thẻ)'); ids.push('duel'); }
  if (G.inv.banhtrang) { opts.push(`Mời mua bánh tráng (${fmtMoney(sellPrice())})`); ids.push('sell'); }
  opts.push('Thôi'); ids.push('x');
  const c = ids[await UI.ask('Bạn cùng lớp', '<p>“Gì đó?”</p>', opts)];
  if (c === 'chat') chat(sid, null); else if (c === 'sell') trySell(sid, null); else if (c === 'duel') cardDuel(sid, null, 'bạn cùng lớp', 'lop');
};
ACT.friend = async (fid, where) => {
  const F = FRIENDS[fid], opts = [], ids = [], add = (id, text) => { ids.push(id); opts.push(text); };
  const free = freeTime(), atSch = (where === 'school' || where === 'class') && G.atSchool, hs = hearts(fid);
  add('chat', 'Trò chuyện');
  if (where === 'meet' && meetOn()) add('place', MEET_VERB[G.meet.place]);
  if (where === 'park') {
    add('sport', "Rủ chơi thể thao (60')"); add('tea', "Rủ đi trà sữa (60' · 25.000đ)");
    add('arcade', "Rủ ra trung tâm thương mại chơi arcade (90' · 30.000đ)");
  }
  if (where === 'park' || where === 'house' || (atSch && free)) add('out', atSch ? 'Rủ đi chơi… (tan học rồi, không ai cấm)' : 'Rủ đi chơi chỗ khác…');
  if (atSch && !free) add('mis', where === 'class' ? 'Rủ cúp tiết sau / đi quậy… (có thể bị phạt)' : 'Rủ cúp tiết / đi quậy… (có thể bị phạt)');
  if (atSch) for (const id of breakFunFor(fid)) add('brk:' + id, `${BREAK_FUN[id].name} (${BREAK_FUN_MINS}' · thân thiết +${BREAK_FUN[id].friend})`);
  if (cardCount()) add('duel', 'Đấu thẻ cầu thủ (thắng lấy thẻ, thua mất thẻ)');
  if (G.inv.gaubong && !G.daily.gift[fid]) add('gift', `Tặng gấu bông gắp được (thân thiết +${GIFT_FRIEND})`);
  if (G.inv.banhtrang) add('sell', `Mời mua bánh tráng (${fmtMoney(sellPrice())})`);
  add('x', 'Thôi');
  let note = '';
  if (grudge(fid)) note = `<p class="warnbox">${F.name} đang giận vì bị bạn tố cáo (đến ${dateLabel(G.grudge[fid])}).</p>`;
  else if (atSch && F.g === G.gender && hs < BREAK_FUN_MIN_HEARTS) note = `<p class="dim">Thân hơn chút nữa (${BREAK_FUN_MIN_HEARTS} tim) là giờ giải lao rủ được ${F.name} ${G.gender === 'girl' ? 'đi vệ sinh chung, tô son' : 'chơi yoyo, con quay, đánh bài'}.</p>`;
  const c = ids[await UI.ask(F.name, `<p>${F.note}. Độ thân thiết: <span class="hearts">${'♥'.repeat(hs)}<i>${'♥'.repeat(5 - hs)}</i></span></p>` + note, opts)] || 'x';
  if (c === 'chat') chat('f_' + fid, fid);
  else if (c === 'sell') trySell('f_' + fid, fid);
  else if (c === 'mis' || c === 'out') mischiefMenu(fid);
  else if (c === 'duel') cardDuel('f_' + fid, fid, F.name, F.duel);
  else if (c.startsWith('brk:')) doBreakFun(fid, c.slice(4));
  else if (c === 'gift') { G.inv.gaubong--; G.daily.gift[fid] = true; addFriend(fid, GIFT_FRIEND); UI.toast(`${F.name} ôm con gấu bông cười tít mắt. Thân thiết +${GIFT_FRIEND}`, 'good'); }
  else if (c === 'place') {
    const pl = G.meet.place;
    if (pl === 'tea') ACT.tea(); else if (pl === 'mall') ACT.mall(); else if (pl === 'arcade') ACT.arcade(); else if (pl === 'nui') ACT.picnic();
    else {
      if (G.stamina < 15) return UI.toast('Không đủ thể lực.', 'bad');
      await activity(`Chơi thể thao với ${F.name}…`, 60, () => { useStam(15, true); addStat('thethao', 6); addStat('giaotiep', 3); meetGain('park', 10); });
    }
  } else if (c === 'sport') {
    if (G.stamina < 15) return UI.toast('Không đủ thể lực.', 'bad');
    await activity(`Chơi thể thao với ${F.name}…`, 60, () => { useStam(15, true); addStat('thethao', 6); addStat('giaotiep', 3); addFriend(fid, 6); });
  } else if (c === 'tea') {
    if (G.money < 25000) return UI.toast('Không đủ tiền.', 'bad');
    await activity(`Đi trà sữa với ${F.name}…`, 60, () => { addMoney(-25000); gainStam(10); addStat('giaotiep', 5); addFriend(fid, 10); });
  } else if (c === 'arcade') {
    if (G.money < 30000) return UI.toast('Không đủ tiền.', 'bad');
    await activity(`Chơi arcade với ${F.name}…`, 90, () => { addMoney(-30000); gainStam(6); addStat('giaotiep', 4); addFriend(fid, 10); });
  }
};
// Bấm chuông nhà bạn ở phố Hoa Sữa
ACT.house = fid => {
  const F = FRIENDS[fid];
  if (friendHome(fid)) return ACT.friend(fid, 'house');
  let where;
  if (G.time >= 1290 || G.time < 390) where = `“Khuya rồi cháu ơi, ${F.name} ngủ rồi.”`;
  else if (meetToday(fid)) where = `“${F.name} ra ${PLACES[G.meet.place].name} rồi, bảo là có hẹn với cháu mà?”`;
  else if (parkTime()) where = `“${F.name} ra công viên bên khu nhà cháu chơi rồi.”`;
  else if (schoolToday() && G.time < 1040) where = `“Giờ này ${F.name} đang ở trường mà cháu?”`;
  else where = `“${F.name} vừa chạy đi đâu đó rồi cháu ạ.”`;
  UI.say(`Nhà ${F.name}`, `Bấm chuông… Mẹ ${F.name} ló đầu ra: ${where}<p class="dim">${F.name} có nhà: ngày đi học 20:10–21:30 · ngày nghỉ 06:30–08:00 và 18:10–21:30. Muốn chắc ăn thì nhắn tin hẹn trước (Điện thoại).</p>`);
};

/* ---------- cắt cảnh ---------- */
// o: { map, me:[x,y,dir], actors:[{look,x,y,dir}], cam, props:[fn(now)], hide:[sid], title, lines:[[who,text]] } — who: 'me' hoặc chỉ số actor
async function playCut(o) {
  const back = { map: G.map, x: G.x, y: G.y, dir: G.dir };
  await UI.fade(true);
  setMap(o.map, o.me[0], o.me[1], o.me[2]);
  RT.scene = { type: 'cut', map: o.map, actors: o.actors || [], cam: o.cam, props: o.props || [], hide: o.hide || [], bubble: null, title: o.title || '' };
  UI.hint(null);
  document.body.classList.add('cut');
  await UI.fade(false);
  for (const [who, text] of o.lines) {
    const a = who === 'me' ? { x: G.x, y: G.y } : RT.scene.actors[who];
    RT.scene.bubble = o.below ? { x: a.x, y: a.y + 4, text, below: true } : { x: a.x, y: a.y - 27, text };
    await UI.wait(1500 + text.length * 30);
  }
  RT.scene.bubble = null;
  await UI.fade(true);
  RT.scene = null; document.body.classList.remove('cut');
  setMap(back.map, back.x, back.y, back.dir);
  await UI.fade(false);
}
// Gương nhà vệ sinh: phản chiếu khuôn mặt + thỏi son / bông phấn + lấp lánh
function mirrorProp(now, mx, look, kind, k) {
  const S = VIEW.S, fr = charSheet(look)[0][0];
  ctx.drawImage(fr, 0, 0, 18, 15, VIEW.ox + (mx + 3) * S, VIEW.oy + 9 * S, 18 * S, 15 * S);
  const sway = Math.round(Math.sin(now / 240 + k * 2.1) * 1.4);
  if (kind === 'son') drawSpr(SPR.lipstick, mx + 12 + sway, 17); else drawSpr(SPR.puff, mx + 15 + sway, 15 + Math.round(Math.cos(now / 240 + k) * 1.2));
  const f = Math.floor(now / 160 + k * 3);
  if (f % 4 !== 3) drawSpr(SPR['sparkle' + (f % 2)], mx + 1 + ((f >> 2) % 2) * 17, 8 + ((f >> 3) % 2) * 6);
}
function yoyoProp(now, hx, fy, spr, ph) {
  const d = 3 + Math.abs(Math.sin(now / 230 + ph)) * 10;
  wRect('#fffaf0', hx, fy - 9, 1, d); drawSpr(SPR[spr], hx - 3, fy - 9 + d);
}
function topProp(now, x0, y0, spr, k) {
  const wob = Math.round(Math.sin(now / 320 + k * 3) * 2);
  drawSpr(SPR[spr + (Math.floor(now / 70) % 2)], x0 + wob, y0 - 9);
  if (Math.floor(now / 120 + k) % 2) wRect('#c9b58a', x0 + wob - 2 + k * 9, y0 + 1, 2, 1);
}
function cardsProp(now, x0, y0) {
  drawSpr(SPR.cardPile, x0, y0);
  const f = Math.floor(now / 420) % 4;
  drawSpr(SPR[f % 2 ? 'cardFace' : 'cardBack'], x0 - 8 + f * 7, y0 - 7 - (f % 2) * 2);
}
function wcCut(fid, kind) {
  const m1 = WC_MIRRORS[1], m2 = WC_MIRRORS[2];
  const lines = kind === 'son'
    ? [[0, 'Tớ mới mua thỏi son màu cam đất nè. Thử không?'], ['me', 'Cho tớ quẹt thử một tí!'], [0, 'Xinh ghê! Nhớ lau bớt trước khi vào lớp kẻo cô la.']]
    : [[0, 'Dặm tí phấn cho tươi tỉnh nào.'], ['me', 'Kẻ mắt giùm tớ với…'], [0, 'Xong! Chuông reo rồi, chạy lẹ!']];
  return {
    map: 'wc', me: [m1 + 12, 68, 3], actors: [{ look: fid, x: m2 + 12, y: 68, dir: 3 }], cam: { x: 96, y: 60 }, lines, below: true,   // thoại hiện dưới chân để không che gương
    title: kind === 'son' ? 'Giải lao · tô son trong nhà vệ sinh nữ' : 'Giải lao · trang điểm trong nhà vệ sinh nữ',
    props: [now => mirrorProp(now, m1, G.gender, kind, 0), now => mirrorProp(now, m2, fid, kind, 1)],
  };
}
function yardCut(fid, kind) {
  const yo = kind === 'yoyo';
  return {
    map: 'school', me: [222, 250, 2], cam: { x: 243, y: 240 }, title: yo ? 'Giải lao · chơi yoyo' : 'Giải lao · chọi con quay',
    actors: [{ look: fid, x: 264, y: 250, dir: 1 }, { look: 'c5', x: 243, y: 224, dir: 0 }, { look: 'c1', x: 243, y: 280, dir: 3 }],
    lines: yo
      ? [[0, 'Xem tớ “dắt chó đi dạo” nè!'], ['me', 'Chưa ăn thua. Coi chiêu “vòng quanh thế giới” đây!'], [1, 'Đỉnh dữ vậy trời!']]
      : [[0, 'Con quay tớ mới chuốt lại mũi đinh đó. Chọi không?'], ['me', 'Chọi thì chọi! Một… hai… ba!'], [1, 'Quay tít luôn kìa! Coi chừng văng!']],
    props: yo ? [now => yoyoProp(now, 231, 250, 'yoyo', 0), now => yoyoProp(now, 255, 250, 'yoyoB', 1.3)] : [now => topProp(now, 236, 256, 'top', 0), now => topProp(now, 245, 256, 'topB', 1)],
  };
}
const CUTS = {
  son: fid => wcCut(fid, 'son'), phan: fid => wcCut(fid, 'phan'),
  yoyo: fid => yardCut(fid, 'yoyo'), conquay: fid => yardCut(fid, 'conquay'),
  danhbai: fid => ({
    map: 'class', me: [146, 164, 2], actors: [{ look: fid, x: 172, y: 164, dir: 1 }, { look: 'c5', x: 159, y: 148, dir: 0 }], cam: { x: 160, y: 140 }, hide: [fid],
    title: 'Giải lao · ván tiến lên chớp nhoáng cuối lớp',
    lines: [[0, 'Chia bài lẹ lên, có 10 phút thôi đó!'], ['me', 'Ba bích đi trước nha. Đôi heo chặt nè!'], [1, 'Suỵt! Canh cửa đi, giám thị đi ngang là toi…']],
    props: [now => cardsProp(now, 153, 163)],
  }),
};

/* ---------- giải lao giữa 2 tiết ---------- */
const BREAK_ASK = {
  wc: 'kéo tay bạn: “Đi vệ sinh với tớ đi, tiện dặm lại tí son.”',
  yoyo: 'rút trong cặp ra cái yoyo: “Ra hành lang làm vài đường không?”',
  conquay: 'khoe con quay mới: “Chọi quay không? Ra sân lẹ!”',
  danhbai: 'xào bộ bài dưới gầm bàn: “Làm ván tiến lên chớp nhoáng không?”',
};
const BREAK_DONE = { son: 'Rủ nhau đi vệ sinh, tô son trước gương', phan: 'Rủ nhau đi vệ sinh, trang điểm trước gương', yoyo: 'Chơi yoyo', conquay: 'Chọi con quay', danhbai: 'Đánh ván tiến lên' };
// Sau các tiết 1, 3, 5, 7 chỉ nghỉ 10': bạn thân cùng giới thỉnh thoảng rủ; còn không thì tự bấm vào bạn ngồi gần
function shortBreak() {
  if (!nextPeriod()) return;
  const fids = Object.keys(FRIENDS).filter(f => breakFunFor(f).length);
  if (fids.length && Math.random() < BREAK_INVITE_CHANCE) { const fid = pick(fids); RT.pendingBreak = { fid, id: pick(breakFunFor(fid)) }; return; }
  if ((G.tips.brk || 0) < 3) { G.tips.brk = (G.tips.brk || 0) + 1; UI.toast("Giải lao 10' — bấm vào bạn ngồi gần để trò chuyện, rủ cúp tiết, mượn đồ, đấu thẻ…", 'info'); }
}
async function breakInvite(b) {
  const F = FRIENDS[b.fid], B = BREAK_FUN[b.id];
  const c = await UI.ask(`Giải lao · ${F.name} rủ`, `<p>${F.name} ${BREAK_ASK[b.id]}</p><p class="dim">${BREAK_FUN_MINS} phút · thân thiết +${B.friend}${B.risk ? ' · có chút rủi ro bị nhắc nhở' : ''}</p>`, ['Đi luôn!', 'Thôi, để lần khác']);
  if (c === 0) doBreakFun(b.fid, b.id);
}
async function doBreakFun(fid, id) {
  if (RT.lock) return;
  const B = BREAK_FUN[id], F = FRIENDS[fid], kind = id === 'wc' ? pick(['son', 'phan']) : id, L = [];
  RT.lock = true;
  await playCut(CUTS[kind](fid));
  G.daily.brk[fid] = (G.daily.brk[fid] || 0) + 1;
  addFriend(fid, B.friend);
  L.push(li(`${BREAK_DONE[kind]} cùng ${F.name}: thân thiết +${B.friend}.`, 'good'));
  if (B.giaotiep) addStat('giaotiep', B.giaotiep);
  if (B.kheotay) addStat('kheotay', B.kheotay);
  if (B.risk) {
    if (Math.random() < B.risk + 0.03 * G.caughtCycle) {
      if (id === 'danhbai') { G.caughtCycle++; addConduct(-0.5, 'đánh bài trong trường'); addTeacher(TEACHER.caughtFun); L.push(li('Thầy giám thị đi ngang cửa sổ, tịch thu bộ bài: hạnh kiểm −0,5.', 'bad')); }
      else { addTeacher(-1); L.push(li('Vào lớp cô nhìn thấy vệt son: “Em kia, ra rửa mặt ngay!” — bị nhắc nhở trước lớp.', 'warn')); }
    } else L.push(li(id === 'danhbai' ? 'Nghe tiếng dép giám thị là cất bài vội vào cặp. Không ai phát hiện!' : 'Kịp lau bớt son trước khi vào lớp. Không ai để ý!', 'dim'));
  }
  advanceTime(BREAK_FUN_MINS);
  RT.lock = false; UI.hud();
  await UI.ask(B.name.replace(/^Rủ /, '').replace(/^./, c => c.toUpperCase()), resWrap(L), ['OK']);
}

/* ---------- quên sách / quên bút: quay sang hỏi mượn bạn ---------- */
const borrowChance = fid => clamp((fid === 'khoa' ? BORROW.deskmate : BORROW.other) + BORROW.perHeart * hearts(fid) + BORROW.perTalk * lv('giaotiep') + (grudge(fid) ? BORROW.grudge : 0), 0.03, 0.95);
async function askBorrow(subj, what) {
  const book = what === 'sach', item = book ? `sách ${SUBJ[subj].short}` : 'bút', fids = Object.keys(FRIENDS), L = [];
  const c = await UI.ask(`Quên ${item}!`, `<p>Vào tiết rồi mới phát hiện quên ${item}. Quay sang hỏi mượn ai?</p><p class="dim">Càng thân thì càng dễ được cho mượn. ${book ? 'Khoa ngồi cùng bàn: xem chung sách (+3 điểm bài học). Bạn bàn khác cho mượn hẳn cuốn sách (+4).' : 'Mượn được bút thì chép bài đầy đủ (+5 điểm bài học).'} Không mượn được: ${book ? '+1' : '+3'}.</p>`,
    fids.map(f => `${FRIENDS[f].name} (${FRIENDS[f].seat}) · khả năng cho mượn ${Math.round(borrowChance(f) * 100)}%`).concat(book ? 'Thôi, ngồi nghe chay' : 'Thôi, chỉ theo dõi trong sách'));
  const fail = book ? 1 : 3;
  if (c < 0 || c >= fids.length) return { gain: fail, lines: [li(book ? 'Quên sách — không mượn ai, ngồi nghe chay.' : 'Có vở nhưng quên hộp bút — không chép được bài.', book ? 'bad' : 'warn')] };
  const fid = fids[c], F = FRIENDS[fid];
  let gain = fail;
  if (Math.random() < borrowChance(fid)) {
    gain = book ? (fid === 'khoa' ? 3 : 4) : 5; addFriend(fid, 1);
    L.push(li(book ? (fid === 'khoa' ? 'Quên sách — Khoa đẩy sách ra giữa bàn cho xem chung.' : `Quên sách — ${F.name} đưa sách cho mượn, bạn ấy xem chung với bạn cùng bàn.`) : `Quên hộp bút — ${F.name} cho mượn cây bút, chép bài đầy đủ.`, 'warn'));
  } else L.push(li(grudge(fid) ? `${F.name} quay mặt đi: “Đi mà mượn giám thị ấy.”` : `${F.name} lắc đầu: “Tớ cũng ${book ? 'đang cần sách' : 'chỉ có một cây'}, cậu hỏi bạn khác đi.” — không mượn được.`, 'bad'));
  if (fid !== 'khoa' && Math.random() < BORROW.scold) L.push(li('Cô gõ thước: “Em kia, đừng quay ngang quay ngửa!”', 'dim'));
  return { gain, lines: L };
}

/* ---------- sự kiện nho nhỏ trong giờ học ---------- */
// Trả về { delta: thay đổi điểm bài học, lines }
async function classEvent(subj) {
  const S = SUBJ[subj], stat = statOfSubj(subj), L = [], co = TEACHER_OF[subj] === 'teacherC' ? 'Thầy' : 'Cô';
  const ok = Object.keys(FRIENDS).filter(f => !grudge(f)), fid = ok.length ? pick(ok) : null, F = fid && FRIENDS[fid];
  const list = ['phatbieu', 'ngoaile', 'kiemtravo'];
  if (fid) list.push('thutay', 'nhacbai'); if (!grudge('khoa')) list.push('hoibai');
  const id = pick(list);
  let delta = 0;
  if (id === 'phatbieu') {
    const p = clamp(0.35 + 0.1 * lv(stat), 0.2, 0.95);
    const c = await UI.ask(`Trong giờ ${S.name}`, `<p>${co} đặt một câu hỏi khó rồi nhìn quanh lớp: “Bạn nào trả lời được nào?”</p><p class="dim">Khả năng trả lời đúng: ${Math.round(p * 100)}% (theo cấp môn ${S.short}). Đúng: +2 điểm bài học, thầy cô quý hơn.</p>`, ['Giơ tay phát biểu', 'Ngồi im']);
    if (c !== 0) L.push(li('Bạn ngồi im. Một bạn khác đứng lên trả lời.', 'dim'));
    else if (Math.random() < p) { delta = 2; addTeacher(TEACHER.answer); addStat('giaotiep', 1); L.push(li(`Giơ tay trả lời đúng — ${co.toLowerCase()} khen trước lớp: +2 điểm bài học, thầy cô quý hơn.`, 'good')); }
    else { addStat('giaotiep', 1); L.push(li(`Trả lời chưa đúng, nhưng ${co.toLowerCase()} khen tinh thần xây dựng bài.`, 'warn')); }
  } else if (id === 'thutay') {
    const c = await UI.ask(`Trong giờ ${S.name}`, `<p>Một mẩu giấy gấp tư được chuyền tới bàn bạn. Chữ của <b>${F.name}</b>: “Tan học đi chơi không? Trả lời tớ nha!”</p><p class="dim">Viết trả lời: thân với ${F.name} hơn (+3) nhưng mất tập trung và có thể bị bắt.</p>`, ['Viết trả lời rồi chuyền lại', 'Cất đi, tập trung học']);
    if (c !== 0) { delta = 1; L.push(li('Bạn cất mẩu giấy vào hộp bút, tập trung nghe giảng: +1 điểm bài học.', 'good')); }
    else {
      delta = -1; addFriend(fid, 3);
      if (Math.random() < 0.18 + 0.04 * G.caughtCycle) { addTeacher(-1); L.push(li(`${co} bắt được mẩu giấy và đọc to trước lớp. Ngượng chín mặt! (thân thiết với ${F.name} +3)`, 'bad')); }
      else L.push(li(`Chuyền giấy qua lại với ${F.name} trót lọt: thân thiết +3, hơi mất tập trung.`, 'warn'));
    }
  } else if (id === 'hoibai') {
    const c = await UI.ask(`Trong giờ ${S.name}`, '<p><b>Khoa</b> huých tay bạn thì thào: “Ê, chỗ này làm sao vậy? Giảng tớ với.”</p>', ['Giảng lại cho Khoa', '“Suỵt, nghe giảng đi!”']);
    if (c !== 0) L.push(li('Bạn ra hiệu cho Khoa im lặng nghe giảng.', 'dim'));
    else {
      addFriend('khoa', 3);
      if (lv(stat) >= 1) { delta = 1; L.push(li('Giảng lại cho Khoa cũng là một lần ôn bài: +1 điểm bài học, thân thiết +3.', 'good')); }
      else L.push(li(`Bạn cũng chưa hiểu lắm (môn ${S.short} chưa lên cấp 1)… hai đứa cùng ngơ ngác. Thân thiết +3.`, 'warn'));
    }
  } else if (id === 'nhacbai') {
    const p = clamp(0.3 - 0.04 * (teacherLv() - 1), 0.08, 0.5);
    const c = await UI.ask(`Trong giờ ${S.name}`, `<p><b>${F.name}</b> bị gọi lên bảng trả bài, đứng ấp úng, liếc xuống bạn cầu cứu.</p><p class="dim">Nhắc bài: thân thiết +5, nhưng ${Math.round(p * 100)}% bị ${co.toLowerCase()} phát hiện.</p>`, ['Nhắc bài cho bạn', 'Ngồi im']);
    if (c !== 0) { addFriend(fid, -1); L.push(li(`${F.name} bị điểm kém, lúc về chỗ nhìn bạn hơi trách: thân thiết −1.`, 'dim')); }
    else if (Math.random() < p) { addFriend(fid, 3); addTeacher(-2); L.push(li(`${co} quay phắt lại: “Em nào nhắc bài đấy?” — cả hai bị phê bình (thân thiết +3).`, 'bad')); }
    else { addFriend(fid, 5); L.push(li(`Nhắc bài trót lọt, ${F.name} thoát hiểm: thân thiết +5.`, 'good')); }
  } else if (id === 'ngoaile') {
    G.stamina = Math.min(maxStam(), G.stamina + 4);
    L.push(li(`${co} kể chuyện thời đi học của mình, cả lớp cười nghiêng ngả: +4 thể lực.`, 'good'));
  } else {
    if (G.bag['vo_' + subj] && G.bag.hopbut) { addTeacher(TEACHER.notebook); L.push(li(`${co} kiểm tra vở đột xuất: vở bạn chép đầy đủ, được khen.`, 'good')); }
    else { addTeacher(TEACHER.noNotebook); L.push(li(`${co} kiểm tra vở đột xuất: bạn không có vở ghi — bị ghi tên vào sổ.`, 'bad')); }
  }
  return { delta, lines: L };
}

/* ---------- sự kiện giờ nghỉ trưa ---------- */
function rollLunchEvent() {
  const list = ['bongda', 'trucnhat'];
  if (!grudge('vy')) list.push('onnhom'); if (!grudge('dat')) list.push('guitar'); if (!grudge('khoa')) list.push('khao'); if (!grudge('ngan')) list.push('tapchi');
  if (cardCount()) list.push('giaithe');
  return pick(list);
}
async function runLunchEvent(id) {
  G.daily.lunchEv = true;
  const T = 'Giờ nghỉ trưa';
  if (id === 'bongda') {
    const c = await UI.ask(`${T} · Trận cầu giao hữu`, '<p>Lớp 10A2 kéo sang thách đấu bóng đá ngoài sân thể dục. Cả lớp nhìn bạn: “Vào đá cho đủ đội đi!”</p><p class="dim">30 phút · −10 thể lực · thắng: +8 Thể thao và cả nhóm bạn thân hơn (+2 mỗi người) · thua: +3 Thể thao</p>', ['Xắn quần vào sân!', 'Thôi, tớ ngồi cổ vũ']);
    if (c !== 0) return UI.toast('Bạn ngồi cổ vũ ngoài đường biên.');
    if (G.stamina < 10) return UI.toast('Mệt quá, đá không nổi.', 'bad');
    RT.lock = true;
    const r = await UI.minigame({ title: 'Giao hữu 10A1 – 10A2', task: 'Giữ bóng trong vùng xanh để dẫn bóng qua hàng thủ và ghi bàn', icon: 'bong', diff: 2 + Math.floor(Math.random() * 3), level: lv('thethao'), tired: G.stamina < 15 });
    useStam(10, true); addStat('thethao', r.win ? 8 : 3);
    if (r.win) for (const f in FRIENDS) addFriend(f, 2);
    advanceTime(30); RT.lock = false; UI.hud();
    UI.toast(r.win ? '10A1 thắng! Cả lớp reo hò, bạn bè thân hơn (+2 mỗi người).' : 'Thua sát nút… nhưng đá vui là chính.', r.win ? 'good' : 'info');
  } else if (id === 'onnhom') {
    const up = upcomingTests(8).find(t => t.day >= G.day && t.day <= G.day + 3 && BOOK_SUBJ.includes(t.subj)), s = up ? up.subj : pick(BOOK_SUBJ);
    const c = await UI.ask(`${T} · Ôn bài nhóm`, `<p>Vy ôm tập đề cương đi ngang: “Tớ với mấy bạn ôn ${SUBJ[s].name} ở thư viện, cậu vào không?”${up ? ` <b>(${TEST_NAME[up.type]} ${dateLabel(up.day)})</b>` : ''}</p><p class="dim">40 phút · +5 điểm ${SUBJ[s].short} · thân với Vy +4 · −4 thể lực${up && up.day <= G.day + 1 ? ' · tính là đã ôn bài (+1 điểm khi kiểm tra)' : ''}</p>`, ['Vào ôn cùng', 'Thôi, tớ nghỉ trưa']);
    if (c !== 0) return;
    await activity(`Ôn ${SUBJ[s].name} cùng nhóm của Vy…`, 40, () => { useStam(4); addStat(s, 5); addFriend('vy', 4); if (up && up.day <= G.day + 1) G.review[s] = Math.max(G.review[s] === undefined ? -1 : G.review[s], up.day); });
  } else if (id === 'guitar') {
    const c = await UI.ask(`${T} · Ghế đá sân trường`, '<p>Đạt ôm cây guitar ra ghế đá dưới gốc phượng, mấy đứa xúm lại hát theo. “Ngồi xuống đây hát chung đi!”</p><p class="dim">20 phút · +8 thể lực · +2 Giao tiếp · thân với Đạt +4</p>', ['Ngồi xuống hát cùng', 'Thôi']);
    if (c !== 0) return;
    await activity('Nghêu ngao hát cùng Đạt…', 20, () => { gainStam(8); addStat('giaotiep', 2); addFriend('dat', 4); });
  } else if (id === 'trucnhat') {
    const c = await UI.ask(`${T} · Trực nhật`, '<p>Cô chủ nhiệm ghé lớp: “Em ở lại giúp cô lau bảng, tưới mấy chậu cây và xếp lại bàn ghế nhé?”</p><p class="dim">20 phút · −5 thể lực · thầy cô quý hơn · +2 Khéo tay</p>', ['Dạ, để em làm ạ', '“Em… em đang bận ạ”']);
    if (c !== 0) return;
    if (G.stamina < 5) return UI.toast('Mệt quá, làm không nổi.', 'bad');
    await activity('Đang trực nhật giúp cô…', 20, () => { useStam(5, true); addTeacher(TEACHER.duty); addStat('kheotay', 2); if (G.conduct < 10) addConduct(0.25, 'chăm chỉ trực nhật'); });
  } else if (id === 'khao') {
    await UI.ask(`${T} · Khoa khao`, '<p>Khoa hí hửng chạy tới: “Hôm qua tớ trúng thưởng nắp chai! Ra căn tin, tớ khao cả bọn trà đá với bánh tráng nướng!”</p>', ['Đi liền!']);
    await activity('Ăn vặt cùng cả bọn…', 10, () => { gainStam(10); addFriend('khoa', 3); addStat('giaotiep', 1); });
  } else if (id === 'tapchi') {
    const c = await UI.ask(`${T} · Tạp chí mới`, '<p>Ngân vẫy bạn ra ghế đá: “Tớ mới mua tạp chí tuần này, có bài trắc nghiệm tính cách vui lắm. Làm thử không?”</p><p class="dim">20 phút · +5 thể lực · +1 Giao tiếp · thân với Ngân +4</p>', ['Ngồi xem cùng', 'Thôi']);
    if (c !== 0) return;
    await activity('Đọc tạp chí cùng Ngân…', 20, () => { gainStam(5); addStat('giaotiep', 1); addFriend('ngan', 4); });
  } else if (id === 'giaithe') {
    const c = await UI.ask(`${T} · Giải đấu thẻ`, '<p>Đám con trai lớp bên bày thẻ cầu thủ ra bậc thềm: “Ai thắng được bọn tớ thì được thêm một gói bim bim!”</p><p class="dim">Đấu như thường (thua mất lá, thắng lấy lá) — thắng còn được thưởng thêm 1 thẻ.</p>', ['Vào đấu', 'Thôi']);
    if (c !== 0) return;
    const r = await cardDuel('giai', null, 'cao thủ lớp bên', 'kha', { free: true });
    if (r === 1) await showPack(openPacks(1), 'Phần thưởng giải đấu');
  }
}
ACT.library = async () => {
  if (!G.atSchool || !schoolToday()) return UI.say('Thư viện', 'Thư viện đóng cửa.');
  if (!(inWin(G.time, 640, 800) || inWin(G.time, 1020, 1110))) return UI.say('Thư viện', 'Cô thủ thư: “Giờ học thì về lớp đi em.”<p class="dim">Thư viện mở giờ nghỉ trưa (10:40–13:20) và sau giờ học (17:00–18:30).</p>');
  if (G.daily.lib) return UI.toast('Hôm nay bạn đọc sách ở thư viện rồi.');
  if (G.stamina < LIBRARY.stam) return UI.toast('Mệt quá, đọc không vào.', 'bad');
  const c = await UI.ask('Thư viện', `<p>Chọn sách để đọc: ${LIBRARY.mins} phút · +${LIBRARY.pts} điểm môn học · −${LIBRARY.stam} thể lực. Mỗi ngày một lần.</p>`, BOOK_SUBJ.map(s => SUBJ[s].name).concat('Thôi'), { grid: true });
  if (c < 0 || c >= BOOK_SUBJ.length) return;
  const s = BOOK_SUBJ[c];
  await activity(`Đang đọc sách ${SUBJ[s].name} ở thư viện…`, LIBRARY.mins, () => {
    G.daily.lib = true; useStam(LIBRARY.stam); addStat(s, LIBRARY.pts);
    if (!grudge('vy') && Math.random() < 0.35) { addFriend('vy', 2); UI.toast('Gặp Vy cũng đang ngồi đọc sách. Thân thiết +2', 'good'); }
  });
};

/* ---------- phố Hoa Sữa: trà sữa · TTTM · khu game · xiên que ---------- */
ACT.tea = async () => {
  const P = PLACES.tea; if (RT.lock || !placeOpen(P)) return;
  const fid = meetHere('tea'), wf = fid ? ` cùng ${FRIENDS[fid].name}` : '', T = TEA;
  const c = await UI.ask(P.name, `<p>“Em uống gì nè?” — Bạn đang có <b>${fmtMoney(G.money)}</b>.</p>` + withLine(fid), [`Trà sữa trân châu, ngồi lại quán${wf} · ${fmtMoney(T.cup.price)} · ${T.cup.mins}' · +${T.cup.stam} thể lực`, `Trà đào mang đi · ${fmtMoney(T.togo.price)} · +${T.togo.stam} thể lực`, 'Thôi']);
  if (c === 0) {
    if (G.money < T.cup.price) return UI.toast('Không đủ tiền.', 'bad');
    await activity(`Đang uống trà sữa${wf}…`, T.cup.mins, () => { addMoney(-T.cup.price); gainStam(T.cup.stam); addStat('giaotiep', fid ? 4 : 1); meetGain('tea', T.cup.friend); });
  } else if (c === 1) {
    if (G.money < T.togo.price) return UI.toast('Không đủ tiền.', 'bad');
    addMoney(-T.togo.price); gainStam(T.togo.stam); UI.hud();
  }
};
ACT.mall = async () => {
  const P = PLACES.mall; if (RT.lock || !placeOpen(P)) return;
  const fid = meetHere('mall'), wf = fid ? ` cùng ${FRIENDS[fid].name}` : '', M = MALL, ids = ['movie', 'book', 'box', 'bim', 'chicken', 'x'];
  const c = ids[await UI.ask(P.name, `<p>Trung tâm thương mại sáng choang, máy lạnh mát rượi. Bạn đang có <b>${fmtMoney(G.money)}</b>.</p>` + withLine(fid), [
    `Rạp chiếu phim${wf} · ${fmtMoney(M.movie.price)} · ${M.movie.mins}' · +${M.movie.stam} thể lực`,
    `Nhà sách: sách tham khảo · ${fmtMoney(M.book.price)} · +${M.book.pts} điểm một môn (mỗi ngày 1 cuốn)`,
    `Siêu thị: hộp thẻ cầu thủ đặc biệt · ${fmtMoney(M.box.price)} · ${M.box.n} thẻ, chắc chắn có thẻ Hiếm trở lên`,
    `Siêu thị: bim bim Sao Vàng · ${fmtMoney(5000)} · kèm 1 thẻ cầu thủ`,
    `Khu ăn uống: gà rán${wf} · ${fmtMoney(M.chicken.price)} · ${M.chicken.mins}' · +${M.chicken.stam} thể lực`, 'Thôi'])];
  if (c === 'movie') {
    if (G.money < M.movie.price) return UI.toast('Không đủ tiền.', 'bad');
    await activity(`Đang xem phim${wf}…`, M.movie.mins, () => { addMoney(-M.movie.price); gainStam(M.movie.stam); addStat('giaotiep', fid ? 3 : 1); meetGain('mall', M.movie.friend); });
  } else if (c === 'book') {
    if (G.daily.book) return UI.toast('Hôm nay bạn mua sách tham khảo rồi, đọc hết cuốn đó đã.');
    if (G.money < M.book.price) return UI.toast('Không đủ tiền.', 'bad');
    const k = await UI.ask('Nhà sách', `<p>Chọn sách tham khảo môn nào? (${fmtMoney(M.book.price)} · +${M.book.pts} điểm)</p>`, BOOK_SUBJ.map(s => SUBJ[s].name).concat('Thôi'), { grid: true });
    if (k < 0 || k >= BOOK_SUBJ.length) return;
    G.daily.book = true; addMoney(-M.book.price); addStat(BOOK_SUBJ[k], M.book.pts); UI.hud();
    UI.toast(`Đã mua sách tham khảo ${SUBJ[BOOK_SUBJ[k]].name}.`, 'good');
  } else if (c === 'box') {
    if (G.money < M.box.price) return UI.toast('Không đủ tiền.', 'bad');
    addMoney(-M.box.price); UI.hud();
    await showPack(openPacks(M.box.n, 1), 'Mở hộp thẻ đặc biệt');
  } else if (c === 'bim') {
    if (G.money < 5000) return UI.toast('Không đủ tiền.', 'bad');
    addMoney(-5000); G.inv.bimbim++; UI.hud();
    await showPack(openPacks(1), 'Bóc gói bim bim Sao Vàng');
  } else if (c === 'chicken') {
    if (G.money < M.chicken.price) return UI.toast('Không đủ tiền.', 'bad');
    await activity(`Đang ăn gà rán${wf}…`, M.chicken.mins, () => { addMoney(-M.chicken.price); gainStam(M.chicken.stam); meetGain('mall', M.chicken.friend); });
  }
};
ACT.arcade = async () => {
  const P = PLACES.arcade; if (RT.lock || !placeOpen(P)) return;
  const fid = meetHere('arcade'), wf = fid ? ` cùng ${FRIENDS[fid].name}` : '', A = ARCADE;
  const c = await UI.ask(P.name, `<p>Tiếng nhạc xập xình, đèn nhấp nháy đủ màu. Bạn đang có <b>${fmtMoney(G.money)}</b>${G.inv.gaubong ? ` và <b>${G.inv.gaubong}</b> con gấu bông` : ''}.</p>` + withLine(fid), [
    `Máy gắp thú · ${fmtMoney(A.claw.price)}/lượt · gắp được gấu bông để tặng bạn`,
    `Game thùng đua xe, bắn súng${wf} · ${fmtMoney(A.cab.price)} · ${A.cab.mins}' · +${A.cab.stam} thể lực`,
    `Máy nhảy${wf} · ${fmtMoney(A.dance.price)} · ${A.dance.mins}' · +${A.dance.pts} Thể thao · −${A.dance.stam} thể lực`, 'Thôi']);
  if (c === 0) {
    if (G.money < A.claw.price) return UI.toast('Không đủ tiền.', 'bad');
    RT.lock = true; addMoney(-A.claw.price); UI.hud();
    const r = await UI.minigame({ title: 'Máy gắp thú', task: 'Giữ con gấu nằm trong vùng xanh (càng gắp) cho tới khi nhấc được lên', icon: 'gau', diff: 2 + Math.floor(Math.random() * 3), level: lv('kheotay'), tired: G.stamina < 10 });
    addStat('kheotay', r.win ? 3 : 1);
    if (r.win) { G.inv.gaubong++; UI.toast('Gắp được một con gấu bông! Đem tặng bạn thân nhé.', 'good'); } else UI.toast('Càng gắp tuột mất rồi… thử lại lần nữa?', 'info');
    advanceTime(10); RT.lock = false; UI.hud();
  } else if (c === 1) {
    if (G.money < A.cab.price) return UI.toast('Không đủ tiền.', 'bad');
    await activity(`Đang chơi game thùng${wf}…`, A.cab.mins, () => { addMoney(-A.cab.price); gainStam(A.cab.stam); addStat('giaotiep', fid ? 3 : 1); addStat('kheotay', 1); meetGain('arcade', A.cab.friend); });
  } else if (c === 2) {
    if (G.money < A.dance.price) return UI.toast('Không đủ tiền.', 'bad');
    if (G.stamina < A.dance.stam) return UI.toast('Không đủ thể lực.', 'bad');
    await activity(`Đang quẩy máy nhảy${wf}…`, A.dance.mins, () => { addMoney(-A.dance.price); useStam(A.dance.stam, true); addStat('thethao', A.dance.pts); meetGain('arcade', A.dance.friend); });
  }
};
ACT.cart = async () => {
  if (!inWin(G.time, 900, 1290)) return UI.say('Xe xiên que', 'Xe chưa dọn hàng.<p class="dim">Bán từ 15:00 đến 21:30.</p>');
  const c = await UI.ask('Xe xiên que', '<p>“Xiên gì con? Cá viên, xúc xích, đậu hũ, đủ hết!”</p>', ["Một đĩa xiên que · 10.000đ · 10' · +12 thể lực", 'Thôi']);
  if (c !== 0) return;
  if (G.money < 10000) return UI.toast('Không đủ tiền.', 'bad');
  await activity('Đang ăn xiên que…', 10, () => { addMoney(-10000); gainStam(12); });
};

/* ---------- núi sau trường ---------- */
ACT.picnic = async () => {
  if (G.daily.hill.picnic) return UI.toast('Hôm nay picnic rồi, hôm khác lại lên nhé.');
  const fid = meetHere('nui'), wf = fid ? ` cùng ${FRIENDS[fid].name}` : '';
  const foods = Object.keys(FOODS).filter(id => G.inv[id]).sort((a, b) => FOODS[b].stam - FOODS[a].stam), best = foods[0];
  const gain = PICNIC.base + (best ? Math.round(FOODS[best].stam * 1.5) : 0);
  const c = await UI.ask('Bãi cỏ picnic', `<p>Bãi cỏ thoai thoải đầy hoa dại, gió thổi lồng lộng.</p>` + withLine(fid) + `<p class="dim">${PICNIC.mins} phút · ${best ? `mang ${FOODS[best].name} ra ăn: +${gain} thể lực (đồ ăn ngon gấp rưỡi khi picnic)` : `không mang đồ ăn, chỉ nằm hóng gió: +${gain} thể lực`}${fid ? ` · thân thiết +${PICNIC.friend}` : ' · hẹn bạn qua điện thoại để đi cùng'}</p>`, [`Trải bạt picnic${wf}`, 'Thôi']);
  if (c !== 0) return;
  await activity(`Đang picnic${wf}…`, PICNIC.mins, () => { G.daily.hill.picnic = true; if (best) G.inv[best]--; gainStam(gain); addStat('giaotiep', fid ? 3 : 1); meetGain('nui', PICNIC.friend); });
};
ACT.summit = async () => {
  if (G.daily.hill.view) return UI.toast('Hôm nay bạn ngắm cảnh trên đỉnh rồi.');
  const sunset = inWin(G.time, 1020, 1110);
  await activity(sunset ? 'Ngắm hoàng hôn trên đỉnh núi…' : 'Ngắm cảnh trên đỉnh núi…', 20, () => {
    G.daily.hill.view = true; gainStam(sunset ? 12 : 8); meetGain('nui', 6);
    UI.toast(sunset ? 'Mặt trời đỏ ối lặn sau dãy núi xa. Đẹp nao lòng.' : 'Từ đây nhìn xuống thấy cả ngôi trường bé xíu.', 'good');
  });
};
ACT.stream = () => {
  if (G.daily.hill.wash) return UI.toast('Nước hồ mát lạnh. Hôm nay bạn rửa mặt rồi.');
  G.daily.hill.wash = true; gainStam(5); UI.toast('Vốc nước hồ rửa mặt, tỉnh cả người: +5 thể lực', 'good'); UI.hud();
};
ACT.hike = async () => {
  if (G.daily.hill.hike) return UI.toast('Hôm nay chạy leo dốc rồi, mai chạy tiếp.');
  if (G.stamina < 12) return UI.toast('Không đủ thể lực.', 'bad');
  await activity('Đang chạy bộ leo dốc…', 30, () => { G.daily.hill.hike = true; useStam(12, true); addStat('thethao', 7); });
};

/* ---------- thẻ cầu thủ ---------- */
const cardCount = () => Object.values(G.cards).reduce((s, n) => s + n, 0);
const cardKinds = () => CARDS.filter(c => G.cards[c.id] > 0).length;
const starsOf = c => '★'.repeat(c.r + 1);
const statLine = c => CARD_STATS.map(([k, , s]) => `${s} ${c[k]}`).join(' · ');
function rollCard(w) {
  w = w || CARD_RARITY.map(r => r.w);
  let r = Math.random() * w.reduce((a, b) => a + b, 0), k = 0;
  for (; k < w.length - 1; k++) { r -= w[k]; if (r < 0) break; }
  const pool = CARDS.filter(c => c.r === k);
  return pick(pool.length ? pool : CARDS);
}
function gainCard(c) {
  const isNew = !G.cards[c.id];
  G.cards[c.id] = (G.cards[c.id] || 0) + 1;
  if (!G.cardDone && cardKinds() === CARDS.length) { G.cardDone = true; addMoney(CARD_SET_REWARD, true); UI.toast(`Đủ bộ ${CARDS.length} thẻ cầu thủ! Hãng bim bim Sao Vàng tặng thưởng ${fmtMoney(CARD_SET_REWARD)}.`, 'good'); }
  return isNew;
}
// minRare: lá đầu tiên chắc chắn từ độ hiếm này trở lên (hộp thẻ đặc biệt)
function openPacks(n, minRare) {
  const out = [];
  for (let i = 0; i < n; i++) { let c = rollCard(); if (minRare && i === 0 && c.r < minRare) c = rollCard([0, 75, 22, 3]); out.push({ c, isNew: gainCard(c) }); }
  return out;
}
function packToast(res) { for (const { c, isNew } of res) UI.toast(`Bóc thẻ: ${starsOf(c)} ${c.name}${isNew ? ' — thẻ mới!' : ''}`, isNew || c.r ? 'good' : 'info'); }
function cardHtml(c, tag, hidden) {
  const R = CARD_RARITY[c.r], t = tag ? `<i class="pc-t">${tag}</i>` : '';
  if (hidden) return `<div class="pcard back" style="--rc:${R.col}">${t}<div class="pc-q">?</div><div class="pc-n">${CARD_POS[c.pos]}</div><div class="pc-r">${starsOf(c)} ${R.name}</div></div>`;
  return `<div class="pcard" style="--rc:${R.col}">${t}<img src="${cardPortrait(c)}" alt=""><div class="pc-n">${c.name}</div><div class="pc-r">${starsOf(c)} ${CARD_POS[c.pos]}</div><div class="pc-s">${CARD_STATS.map(([k, , s]) => `<span>${s} <b>${c[k]}</b></span>`).join('')}</div></div>`;
}
function showPack(res, title) {
  return UI.ask(title || 'Bóc thẻ', `<div class="pcards">${res.map(({ c, isNew }) => cardHtml(c, isNew ? 'MỚI' : '')).join('')}</div><p class="dim">Đã sưu tầm ${cardKinds()}/${CARDS.length} loại thẻ. Xem bộ sưu tập trong Cặp sách. Rủ bạn đấu thẻ: thắng lấy thẻ của bạn, thua mất thẻ của mình.</p>`, ['OK']);
}
// Đấu thẻ: chọn 1 lá, rồi chọn 1 chỉ số để so với lá đối thủ đang úp. Trả về 1 thắng · 0 hoà · −1 thua · null không đấu
async function cardDuel(sid, fid, name, tier, o) {
  o = o || {};
  if (RT.lock) return null;
  if (!cardCount()) { UI.toast('Bạn chưa có thẻ nào. Mua bim bim Sao Vàng ở căn tin, tạp hoá Cô Ba hoặc TTTM để lấy thẻ.'); return null; }
  if (fid && grudge(fid)) { UI.say(name, '“Tớ không chơi với đứa mách lẻo.”'); return null; }
  if (!o.free && G.daily.duel[sid]) { UI.toast(`Hôm nay ${name} đấu thẻ với bạn rồi.`); return null; }
  const mine = CARDS.filter(c => G.cards[c.id] > 0).sort((a, b) => b.r - a.r || a.no - b.no);
  const i = await UI.ask(`Đấu thẻ với ${name}`, `<p>Chọn một lá để ra sân. <b>Thắng</b>: lấy lá của ${name}. <b>Thua</b>: mất lá vừa ra. Hoà: ai giữ bài nấy.</p>`, mine.map(c => `${starsOf(c)} ${c.name}<br><small>${statLine(c)} · ×${G.cards[c.id]}</small>`).concat('Thôi'), { grid: true });
  if (i < 0 || i >= mine.length) return null;
  const me = mine[i], opp = rollCard(DUEL_TIER[tier] || DUEL_TIER.lop);
  if (!o.free) G.daily.duel[sid] = true;
  const a = await UI.ask('Chọn chỉ số để so', `<div class="pcards">${cardHtml(me, 'BẠN')}${cardHtml(opp, 'ĐỐI THỦ', true)}</div><p>${name.replace(/^./, c => c.toUpperCase())} úp một lá <b>${CARD_RARITY[opp.r].name}</b> — ${CARD_POS[opp.pos]}. Bạn muốn so chỉ số nào?</p><p class="dim">Mẹo: thủ môn và hậu vệ phòng thủ cao; tiền đạo tấn công và tốc độ cao; thẻ càng nhiều sao chỉ số càng lớn.</p>`, CARD_STATS.map(([k, n]) => `${n}: ${me[k]}`), { esc: 0 });
  const st = CARD_STATS[a >= 0 && a < CARD_STATS.length ? a : 0], mv = me[st[0]], ov = opp[st[0]];
  let res = 0, msg;
  if (mv > ov) { res = 1; const isNew = gainCard(opp); msg = `<p class="okbox">Thắng! ${st[1]} ${mv} &gt; ${ov}. Bạn lấy được lá <b>${opp.name}</b>${isNew ? ' — thẻ mới!' : ''}.</p>`; }
  else if (mv < ov) { res = -1; G.cards[me.id]--; if (!G.cards[me.id]) delete G.cards[me.id]; msg = `<p class="warnbox">Thua… ${st[1]} ${mv} &lt; ${ov}. Lá <b>${me.name}</b> của bạn về tay ${name}.</p>`; }
  else msg = `<p class="warnbox">Hoà ${mv} – ${ov}. Ai giữ bài nấy.</p>`;
  addStat('giaotiep', 1); if (fid) addFriend(fid, 2);
  await UI.ask(`Đấu thẻ với ${name}`, `<div class="pcards">${cardHtml(me, 'BẠN')}${cardHtml(opp, 'ĐỐI THỦ')}</div>` + msg + (fid ? '<p class="dim">Chơi cùng nhau: thân thiết +2.</p>' : ''), ['OK']);
  return res;
}

/* ---------- điện thoại: nhắn tin với bạn bè, mẹ ---------- */
const PHONE_CONTACTS = ['khoa', 'vy', 'dat', 'ngan', 'mom'];
const contactOf = id => (id === 'mom' ? { name: 'Mẹ', note: 'Xin phép về muộn' } : FRIENDS[id]);
const MSG_ME = ['Đang làm gì đó?', 'Hôm nay học mệt ghê…', 'Ăn cơm chưa?', 'Chán quá, tám tí đi.', 'Bài hôm nay cậu hiểu không?'];
const MSG_TAM = {
  khoa: ['Đang cày game nè, tí nữa mới học.', 'Mai đá bóng không? Tớ mới mua đôi giày mới.', 'Bài Toán hôm nay khó ghê, tớ chép của Vy rồi.', 'Tớ vừa bóc được thẻ hiếm, mai mang lên lớp khoe.'],
  vy: ['Tớ đang soạn đề cương. Cậu ôn bài chưa đó?', 'Mai nhớ mang đủ sách vở nha, cô hay kiểm tra vở lắm.', 'Học xong tớ ra ban công ngắm sao, trời đẹp ghê.', 'Cuối tuần lên núi sau trường picnic đi, tớ làm cơm cuộn.'],
  dat: ['Đang tập bài hát mới cho văn nghệ, nghe thử không?', 'Chán học quá, mai kiếm trò gì vui đi.', 'Tớ mới săn được thẻ siêu hiếm, mai đấu không?', 'Khu game mới về máy nhảy đó, đi thử không?'],
  ngan: ['Tớ đang đắp mặt nạ, hihi.', 'Cuối tuần đi trung tâm thương mại không? Đang giảm giá.', 'Cậu thấy màu son cam đất hợp với tớ không?', 'Tiệm trà sữa Mây có vị mới, phải thử mới được.'],
};
const MSG_NO = ['Hôm đó tớ kẹt rồi, để bữa khác nha.', 'Mẹ tớ không cho đi rồi…', 'Tớ còn một đống bài chưa làm. Lần sau nhé!'];
function pushMsg(id, me, t) { const a = (G.phone.msgs[id] = G.phone.msgs[id] || []); a.push({ m: me ? 1 : 0, t }); if (a.length > 30) a.splice(0, a.length - 30); }
function inbox(id, t) { pushMsg(id, false, t); G.phone.unread[id] = (G.phone.unread[id] || 0) + 1; UI.toast(`Tin nhắn mới từ ${contactOf(id).name} — mở Điện thoại (P) để xem`, 'info'); }
const unreadCount = () => Object.values(G.phone.unread).reduce((s, n) => s + n, 0);
const meetBusy = () => !!(G.meet && G.meet.day >= G.day);
function setMeet(fid, place, day, from) { G.meet = { fid, place, day, from: from || 0, n: 0 }; }
const meetWhen = m => (m.day === G.day ? 'Hôm nay' : 'Ngày mai') + ' ' + meetTimeText(m);
// Các câu trả lời nhanh trong khung chat
function phoneActions(id) {
  const a = [];
  if (id === 'mom') {
    if (!G.daily.momAsk && !G.daily.outPerm && G.time < 1320) a.push(['late', 'Xin phép về muộn']);
    a.push(['hoi', 'Hỏi mẹ tối nay ăn gì']);
    return a;
  }
  const p = G.phone.pend;
  if (p && p.fid === id && p.day >= G.day) { a.push(['yes', 'Đi chứ!']); a.push(['no', 'Tớ bận rồi, để bữa khác']); }
  a.push(['tam', 'Tám chuyện']); a.push(['bai', 'Hỏi lịch kiểm tra']);
  if (!meetBusy()) a.push(['ru', 'Rủ đi chơi…']);
  if (grudge(id)) a.push(['sorry', 'Xin lỗi vì đã tố cáo']);
  return a;
}
function phoneSend(id, act, arg) {
  if (id === 'mom') {
    if (act === 'late') {
      pushMsg('mom', true, 'Mẹ ơi, hôm nay con xin phép về muộn một chút ạ.'); G.daily.momAsk = true;
      const p = clamp(0.3 + 0.06 * parentInfo(G.parent).lv + (G.conduct >= 8 ? 0.1 : -0.1) - (G.daily.scolded ? 0.3 : 0), 0.1, 0.9);
      if (Math.random() < p) { G.daily.outPerm = true; G.daily.outAt20 = false; pushMsg('mom', false, 'Ừ, đi đâu nhớ cẩn thận, đừng về khuya quá nhé con.'); UI.toast('Mẹ đồng ý: hôm nay về sau 20:00 không bị mắng.', 'good'); }
      else pushMsg('mom', false, 'Không được. Về ăn cơm rồi còn học bài, con.');
    } else { pushMsg('mom', true, 'Mẹ ơi tối nay nhà mình ăn gì ạ?'); pushMsg('mom', false, pick(['Canh chua cá với thịt kho. Về sớm ăn cho nóng.', 'Mẹ nấu cà ri gà. Nhớ về trước 8 giờ nhé.', 'Rau muống xào tỏi, trứng chiên. Bố con đang đợi cơm đấy.'])); }
    return;
  }
  const F = FRIENDS[id], say = t => pushMsg(id, false, t);
  if (act === 'tam') {
    pushMsg(id, true, pick(MSG_ME));
    if (grudge(id)) return say('Đã xem.');
    say(pick(MSG_TAM[id]));
    if (!G.daily.msg[id]) { G.daily.msg[id] = true; addFriend(id, 2); addStat('giaotiep', 1); UI.toast(`Nhắn tin với ${F.name}: thân thiết +2`, 'good'); }
  } else if (act === 'bai') {
    pushMsg(id, true, 'Sắp tới có kiểm tra môn gì không? Tớ quên mất rồi.');
    if (grudge(id)) return say('Tự đi mà xem bảng tin.');
    const up = upcomingTests(40).filter(t => t.day >= G.day).slice(0, 3);
    if (!up.length) return say('Chưa thấy cô báo lịch gì. Cứ học đều là được.');
    say(up.map(t => `${SUBJ[t.subj].short}: ${TEST_NAME[t.type]}, ${dateLabel(t.day)}`).join(' · '));
    const t0 = up[0];
    if (id === 'vy' && hearts('vy') >= 2 && !G.daily.tipVy && t0.day <= G.day + 2 && BOOK_SUBJ.includes(t0.subj)) {
      G.daily.tipVy = true; G.review[t0.subj] = Math.max(G.review[t0.subj] === undefined ? -1 : G.review[t0.subj], t0.day);
      say(`Tớ gửi cậu đề cương ${SUBJ[t0.subj].name} rồi đó, xem kỹ là ăn điểm.`); UI.toast(`Đề cương của Vy: +1 điểm khi kiểm tra ${SUBJ[t0.subj].name}`, 'good');
    }
  } else if (act === 'go') phoneInvite(id, arg);
  else if (act === 'yes') {
    const p = G.phone.pend; G.phone.pend = null; pushMsg(id, true, 'Đi chứ! Hẹn cậu ở đó nha.');
    setMeet(id, p.place, p.day, 0); say(`Chốt! ${meetWhen(G.meet)} ở ${PLACES[p.place].name} nha. Đừng cho tớ leo cây đó.`);
    UI.toast(`Đã hẹn ${F.name}: ${meetWhen(G.meet)} ở ${PLACES[p.place].name}`, 'good');
  } else if (act === 'no') { G.phone.pend = null; pushMsg(id, true, 'Tớ bận rồi, để bữa khác nha.'); say('Tiếc ghê. Lần sau nhớ đi đó!'); addFriend(id, -1); }
  else if (act === 'sorry') {
    pushMsg(id, true, 'Cho tớ xin lỗi chuyện hôm trước nha. Tớ sai rồi.');
    if (G.daily.msg['s_' + id]) return say('…');
    G.daily.msg['s_' + id] = true;
    if (Math.random() < 0.5) { delete G.grudge[id]; addFriend(id, 3); say('Thôi được rồi, lần này tớ bỏ qua. Đừng có mách lẻo nữa đó!'); UI.toast(`${F.name} hết giận bạn rồi.`, 'good'); }
    else say('Để tớ nghĩ đã. Giờ chưa muốn nói chuyện.');
  }
}
// Rủ bạn đi chơi qua tin nhắn: đang trong giờ học thì hẹn sau khi tan; muộn quá thì hẹn hôm sau
function phoneInvite(fid, place) {
  const F = FRIENDS[fid], P = PLACES[place], last = Math.min(MEET_END, P.open[1]) - 90;
  let day = G.day, from = schoolToday() && G.time < CFG.SCHOOL_END ? 1040 : Math.ceil((G.time + 30) / 10) * 10;
  if (from > last) { day = G.day + 1; from = 0; }
  const when = day > G.day ? 'Mai' : (from === 1040 ? 'Chiều nay tan học' : 'Lát nữa');
  pushMsg(fid, true, `${when} đi ${P.short} không?`);
  const say = t => pushMsg(fid, false, t);
  if (grudge(fid)) return say('Không. Đi mà rủ thầy giám thị ấy.');
  const asked = G.daily.ru[fid] || 0; G.daily.ru[fid] = asked + 1;
  if (asked >= 2) return say('Tớ nói rồi mà, hôm khác nha.');
  if (Math.random() >= clamp(0.4 + 0.1 * hearts(fid) + (PLACE_LIKES[fid].includes(place) ? 0.2 : 0), 0.1, 0.95)) return say(pick(MSG_NO));
  setMeet(fid, place, day, from);
  say(`Ok luôn! ${meetWhen(G.meet)} tớ đợi ở ${P.name} nha.`);
  UI.toast(`Đã hẹn ${F.name}: ${meetWhen(G.meet)} ở ${P.name}`, 'good');
}
// Bạn bè chủ động nhắn: nhắc lịch kiểm tra, rủ đi chơi, tám chuyện
function friendPing(evening) {
  const fids = Object.keys(FRIENDS).filter(f => !grudge(f)); if (!fids.length) return;
  const fid = pick(fids), r = Math.random();
  const tmr = G.tests.find(t => t.day === G.day + 1 && !t.done);
  if (evening && tmr && r < 0.45) return inbox(fid, `Mai có ${TEST_NAME[tmr.type]} môn ${SUBJ[tmr.subj].name} đó. Ôn chưa?`);
  if (!meetBusy() && !G.phone.pend && r < 0.8) {
    const day = evening ? G.day + 1 : G.day, opts = PLACE_LIKES[fid].filter(p => !(p === 'nui' && isSchoolDay(day))), place = pick(opts);
    G.phone.pend = { fid, place, day };
    return inbox(fid, `${evening ? 'Mai' : 'Hôm nay'}${isSchoolDay(day) ? ' tan học' : ''} đi ${PLACES[place].short} không? Trả lời tớ nha!`);
  }
  inbox(fid, pick(MSG_TAM[fid]));
}
function socialTick(t) {
  if (t === 1170 && Math.random() < 0.5) friendPing(true);                       // 19:30
  else if (t === 510 && !schoolToday() && Math.random() < 0.45) friendPing(false);   // sáng ngày nghỉ
  const m = meetOn();
  if (m && !m.n && t === meetWindow(m)[0]) UI.toast(`${FRIENDS[m.fid].name} đang đợi bạn ở ${PLACES[m.place].name} (đến ${fmtTime(meetWindow(m)[1])}).`, 'info');
}
function socialNewDay() {
  if (G.meet && G.meet.day < G.day) {
    if (!G.meet.n) {
      const f = G.meet.fid; addFriend(f, -5);
      pushMsg(f, false, 'Hôm qua tớ đợi mãi mà không thấy cậu. Cho tớ leo cây hả? :('); G.phone.unread[f] = (G.phone.unread[f] || 0) + 1;
      RT.morning.push(`Bạn lỡ hẹn với ${FRIENDS[f].name}: thân thiết −5.`);
    }
    G.meet = null;
  }
  if (G.phone.pend && G.phone.pend.day < G.day) G.phone.pend = null;
  const wk = Math.floor(G.day / 7);
  if (G.outAsk.week !== wk) G.outAsk = { week: wk, n: 0 };
}
