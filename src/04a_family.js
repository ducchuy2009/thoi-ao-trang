'use strict';
/* ============================================================
 *  04a. GIA ĐÌNH — bố mẹ đi lại theo lịch (có tìm đường), ra cửa lấy xe đi làm,
 *  mẹ đi chợ, bố xem bóng đá / ngồi làm việc; thiện cảm → tiền tiêu vặt
 * ============================================================ */
// Các điểm bố mẹ hay lui tới. sit: chỗ ngồi (không đi bộ vào được, nhân vật "ngồi" lên)
const POI = {
  stove: { map: 'home', x: 376, y: 60, dir: 3, txt: 'đang nấu ăn' },
  sink: { map: 'home', x: 408, y: 60, dir: 3, txt: 'đang dọn bếp' },
  tableL: { map: 'home', x: 386, y: 130, dir: 2, txt: 'đang ngồi ở bàn ăn' },
  tableR: { map: 'home', x: 448, y: 130, dir: 1, txt: 'đang ngồi ở bàn ăn' },
  sofaL: { map: 'home', x: 206, y: 113, dir: 3, sit: true, txt: 'đang xem tivi' },
  sofaR: { map: 'home', x: 228, y: 113, dir: 3, sit: true, txt: 'đang xem tivi' },
  desk: { map: 'home', x: 299, y: 60, dir: 3, sit: true, txt: 'đang ngồi làm việc' },
  living: { map: 'home', x: 284, y: 150, dir: 0, txt: 'đang dọn nhà' },
  living2: { map: 'home', x: 178, y: 168, dir: 2, txt: 'đang đi lại trong nhà' },
  yardL: { map: 'town', x: 44, y: 140, dir: 3, txt: 'đang tưới cây' },
  yardR: { map: 'town', x: 236, y: 146, dir: 3, txt: 'đang chăm cây ngoài sân' },
  shop: { map: 'town', x: 376, y: 134, dir: 3, txt: 'đang đi chợ' },
  room: { away: 'room', txt: 'đang ở trong phòng' },
  work: { away: 'work', txt: 'đang đi làm' },
};
const ROOM_DOOR = { x: 258, y: 42 };                       // cửa phòng bố mẹ (trong phòng khách)
const HOME_DOOR = { x: 224, y: 222 }, TOWN_DOOR = { x: 96, y: 142 };
const BIKE = { mom: { mx: 133, my: 138, spr: 'motoMom' }, dad: { mx: 167, my: 138, spr: 'moto' } };
const RIDE_OUT = [[100, 142], [96, 162], [96, 206], [-28, 206]];   // từ sân ra cổng, xuống đường, chạy khỏi bản đồ
// Lịch trong ngày: [giờ bắt đầu (phút), điểm đến]. work = ngày đi làm (T2–T6), off = ngày nghỉ
const SCHED = {
  mom: {
    work: [[300, 'stove'], [390, 'tableL'], [420, 'sink'], [440, 'living'], [CFG.PARENT_LEAVE, 'work'], [1050, 'stove'], [1140, 'tableL'], [1200, 'sink'], [1220, 'sofaR'], [1290, 'room']],
    off: [[300, 'room'], [330, 'stove'], [420, 'tableL'], [450, 'sink'], [480, 'shop'], [540, 'yardL'], [600, 'living'], [660, 'stove'], [720, 'tableL'], [780, 'sofaR'], [900, 'yardL'], [960, 'living2'], [1020, 'stove'], [1140, 'tableL'], [1200, 'sink'], [1220, 'sofaR'], [1290, 'room']],
  },
  dad: {
    work: [[300, 'room'], [345, 'tableR'], [405, 'desk'], [CFG.PARENT_LEAVE, 'work'], [1065, 'desk'], [1140, 'tableR'], [1200, 'sofaL'], [1320, 'room']],
    off: [[300, 'room'], [390, 'tableR'], [450, 'yardR'], [570, 'desk'], [690, 'tableR'], [780, 'sofaL'], [960, 'yardR'], [1050, 'desk'], [1140, 'tableR'], [1200, 'sofaL'], [1320, 'room']],
  },
};
const mkFam = () => ({ n: null, goal: null, legs: [], path: null, hidden: true, hiddenAt: 'room', riding: false, bikeAway: false, ridePts: null });
const FAM = { mom: mkFam(), dad: mkFam() };
const PNAME = { mom: 'Mẹ', dad: 'Bố' };

function buildFamily() {
  for (const who of ['mom', 'dad']) {
    const n = {
      id: who, fam: who, name: PNAME[who], look: who, map: 'home', x: 0, y: 0, cx: 376, cy: 60, cdir: 3, walk: -1,
      vis: () => !FAM[who].hidden, label: () => `${PNAME[who]} — ${parentTxt(who)}`, act: () => ACT.parent(who),
    };
    n.outfit = who === 'mom' ? () => (n.map === 'town' ? 'noapron' : null) : () => (today().dow >= 5 || holidayOf(G.day) ? 'dadhome' : null);
    FAM[who].n = n; NPCS.push(n);
  }
}
const workDay = () => today().dow < 5 && !holidayOf(G.day);
function parentGoal(who) {
  const t = G.time, wd = workDay();
  if (wd && G.daily.drove === who && t < 1050) return 'work';    // đã chở con đi học thì đi làm luôn
  const list = SCHED[who][wd ? 'work' : 'off']; let k = list[0][1];
  for (const [s, key] of list) if (t >= s) k = key;
  if (who === 'dad' && k === 'sofaL' && t >= 1200 && G.day % 3 === 0) k = 'desk';   // có hôm bố mang việc về làm thay vì xem bóng đá
  return k;
}
function parentTxt(who) {
  const f = FAM[who];
  if (f.legs.length) return f.goal === 'work' ? 'đang chuẩn bị đi làm' : f.goal === 'shop' ? 'đang đi chợ' : f.goal === 'room' ? 'đang về phòng' : 'đang đi lại';
  if (who === 'dad' && f.goal === 'sofaL' && G.time >= 1200) return 'đang xem bóng đá';
  return POI[f.goal] ? POI[f.goal].txt : '';
}
const parentHome = who => { const f = FAM[who]; return !f.hidden && !f.riding && f.n.map === 'home'; };

/* ---------- tìm đường A* trên lưới 8px ---------- */
const DIRS8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
function findPath(m, sx, sy, tx, ty) {
  const W = Math.ceil(m.pw / 8), H = Math.ceil(m.ph / 8), free = new Int8Array(W * H);
  const ok = (i, j) => { if (i < 0 || j < 0 || i >= W || j >= H) return false; const k = j * W + i; if (!free[k]) free[k] = blocked(m, i * 8 + 4, j * 8 + 8) ? -1 : 1; return free[k] === 1; };
  const near = (x, y) => {
    const ci = Math.floor(x / 8), cj = Math.floor((y - 1) / 8); let b = null, bd = 1e9;
    for (let r = 0; r <= 7 && !b; r++) for (let j = cj - r; j <= cj + r; j++) for (let i = ci - r; i <= ci + r; i++) {
      if (Math.max(Math.abs(i - ci), Math.abs(j - cj)) !== r || !ok(i, j)) continue;
      const d = Math.hypot(i * 8 + 4 - x, j * 8 + 8 - y); if (d < bd) { bd = d; b = [i, j]; }
    }
    return b;
  };
  const S = near(sx, sy), T = near(tx, ty); if (!S || !T) return null;
  const N = W * H, g = new Float32Array(N).fill(1e9), from = new Int32Array(N).fill(-1), open = [];
  const sk = S[1] * W + S[0], tk = T[1] * W + T[0]; g[sk] = 0; open.push([0, sk]);
  while (open.length) {
    let bi = 0; for (let q = 1; q < open.length; q++) if (open[q][0] < open[bi][0]) bi = q;
    const k = open.splice(bi, 1)[0][1]; if (k === tk) break;
    const i = k % W, j = (k / W) | 0;
    for (const [di, dj] of DIRS8) {
      const ni = i + di, nj = j + dj; if (!ok(ni, nj)) continue;
      if (di && dj && (!ok(i + di, j) || !ok(i, j + dj))) continue;
      const nk = nj * W + ni, c = g[k] + (di && dj ? 1.414 : 1);
      if (c < g[nk]) { g[nk] = c; from[nk] = k; open.push([c + Math.hypot(ni - T[0], nj - T[1]), nk]); }
    }
  }
  if (tk !== sk && from[tk] < 0) return null;
  const pts = []; for (let k = tk; k !== sk && k >= 0; k = from[k]) pts.push([(k % W) * 8 + 4, ((k / W) | 0) * 8 + 8]);
  pts.reverse(); pts.push([tx, ty]); return pts;
}

/* ---------- điều khiển bố mẹ ---------- */
// Đặt thẳng vào vị trí theo lịch (đầu ngày, sau khi thời gian nhảy xa, sau khi tải game)
function snapParent(who, gk) {
  const f = FAM[who], n = f.n, P = POI[gk];
  f.goal = gk; f.legs = []; f.path = null; f.riding = false; f.ridePts = null; n.walk = -1;
  if (P.away) { f.hidden = true; f.hiddenAt = P.away; f.bikeAway = P.away === 'work'; }
  else { f.hidden = false; f.bikeAway = false; n.map = P.map; n.cx = P.x; n.cy = P.y; n.cdir = P.dir; }
}
// Lập lộ trình từ vị trí hiện tại tới mục tiêu mới
function planParent(who, gk) {
  const f = FAM[who], n = f.n, P = POI[gk], legs = [];
  let cur = n.map;
  if (f.hidden) {
    if (f.hiddenAt === 'work') { legs.push({ t: 'ridein' }); cur = 'town'; }
    else { legs.push({ t: 'show', map: 'home', x: ROOM_DOOR.x, y: ROOM_DOOR.y, dir: 0 }); cur = 'home'; }
  }
  const goTo = (map, x, y) => {
    if (cur !== map) {
      if (cur === 'home') { legs.push({ t: 'walk', x: HOME_DOOR.x, y: HOME_DOOR.y }); legs.push({ t: 'warp', map: 'town', x: TOWN_DOOR.x, y: TOWN_DOOR.y }); }
      else { legs.push({ t: 'walk', x: TOWN_DOOR.x, y: TOWN_DOOR.y - 2 }); legs.push({ t: 'warp', map: 'home', x: HOME_DOOR.x, y: HOME_DOOR.y - 6 }); }
      cur = map;
    }
    legs.push({ t: 'walk', x, y });
  };
  if (P.away === 'room') { goTo('home', ROOM_DOOR.x, ROOM_DOOR.y); legs.push({ t: 'hide', at: 'room' }); }
  else if (P.away === 'work') { goTo('town', BIKE[who].mx, BIKE[who].my); legs.push({ t: 'rideout' }); legs.push({ t: 'hide', at: 'work' }); }
  else { goTo(P.map, P.x, P.y); legs.push({ t: 'settle', x: P.x, y: P.y, dir: P.dir }); }
  f.goal = gk; f.legs = legs; f.path = null;
}
function moveAlong(n, pts, speed, dt, keepDir) {
  let rem = speed * dt;
  while (rem > 0 && pts.length) {
    const tx = pts[0][0], ty = pts[0][1], dx = tx - n.cx, dy = ty - n.cy, d = Math.hypot(dx, dy);
    if (d > 0.01) { if (Math.abs(dx) > Math.abs(dy)) n.cdir = dx < 0 ? 1 : 2; else if (!keepDir) n.cdir = dy < 0 ? 3 : 0; }
    if (d <= rem) { n.cx = tx; n.cy = ty; rem -= d; pts.shift(); } else { n.cx += dx / d * rem; n.cy += dy / d * rem; rem = 0; }
  }
}
function stepParent(who, dt) {
  const f = FAM[who], n = f.n, leg = f.legs[0];
  if (!leg) { n.walk = -1; return; }
  if (leg.t === 'show') { f.hidden = false; n.map = leg.map; n.cx = leg.x; n.cy = leg.y; n.cdir = leg.dir; f.legs.shift(); }
  else if (leg.t === 'warp') { n.map = leg.map; n.cx = leg.x; n.cy = leg.y; f.path = null; f.legs.shift(); }
  else if (leg.t === 'walk') {
    if (!f.path) f.path = findPath(MAPS[n.map], n.cx, n.cy, leg.x, leg.y) || [[leg.x, leg.y]];
    moveAlong(n, f.path, 40, dt, false); n.walk = (n.walk < 0 ? 0 : n.walk) + dt;
    if (!f.path.length) { f.path = null; f.legs.shift(); }
  }
  else if (leg.t === 'settle') { n.cx = leg.x; n.cy = leg.y; n.cdir = leg.dir; n.walk = -1; f.legs.shift(); }
  else if (leg.t === 'hide') { f.hidden = true; f.hiddenAt = leg.at; n.walk = -1; f.legs.shift(); }
  else if (leg.t === 'rideout' || leg.t === 'ridein') {
    const b = BIKE[who];
    if (!f.riding) {
      f.riding = true; f.bikeAway = true; f.hidden = false; n.map = 'town'; n.walk = -1;
      if (leg.t === 'ridein') { const p = RIDE_OUT[RIDE_OUT.length - 1]; n.cx = p[0]; n.cy = p[1]; n.cdir = 2; f.ridePts = RIDE_OUT.slice(0, -1).reverse().concat([[b.mx, b.my]]); }
      else { n.cdir = 1; f.ridePts = RIDE_OUT.map(p => p.slice()); }
    }
    moveAlong(n, f.ridePts, 96, dt, true);
    if (!f.ridePts.length) { f.riding = false; if (leg.t === 'ridein') f.bikeAway = false; f.legs.shift(); }
  }
}
function updateFamily(dt, frozen) {
  for (const who of ['mom', 'dad']) {
    const f = FAM[who], gk = parentGoal(who);
    if (RT.snapNpcs || f.goal === null) { snapParent(who, gk); continue; }
    if (gk !== f.goal && !f.riding) planParent(who, gk);
    if (frozen) { if (!f.riding) f.n.walk = -1; continue; }
    stepParent(who, dt);
  }
  RT.snapNpcs = false;
}

/* ---------- tương tác với bố mẹ ---------- */
const MOM_TIPS = [
  'Tối trước khi ngủ con soạn cặp sẵn đi, sáng đỡ cuống.',
  'Mang đủ sách thì mỗi tiết mới được cộng trọn 5 điểm đấy con.',
  'Muốn bố mẹ chở thì nhờ trước 7 giờ 20 nhé, muộn là trễ làm.',
  'Phụ mẹ việc nhà, mẹ vui thì đầu tuần mẹ cho thêm tiền tiêu vặt.',
  'Ôn bài tối hôm trước thì hôm sau kiểm tra dễ được điểm cao hơn.',
  'Ngày đi học thì 8 giờ tối phải có mặt ở nhà nghe chưa. Thứ 7, chủ nhật mẹ cho thoải mái hơn.',
  'Câu được cá ngoài sông thì mang về, mẹ nấu canh chua cho.',
  'Tan học về nhà đã rồi muốn đi chơi tiếp thì xin phép, mẹ cho ít tiền mà đi.',
  'Toán hoặc Văn phải từ 8,0 thì mới được học sinh Giỏi đó.',
];
const DAD_TIPS = [
  'Học thực hành cho chắc tay vào, sau này đi làm mới thấy quý.',
  'Tối nay có trận hay lắm, xong bài thì ra xem với bố.',
  'Trong giờ mà nghịch điện thoại, cô gọi về là bố không bênh đâu nhé.',
  'Bạn bè rủ rê gì cũng phải biết điểm dừng con ạ.',
  'Tập thể dục đều thì học mới có sức. Sáng dậy chạy vài vòng đi.',
  'Thuốc lá là bố cấm tuyệt đối. Bố mà biết thì đừng trách.',
  'Thi cử có lúc học tài thi phận, nhưng chắc kiến thức thì vẫn hơn.',
];
ACT.parent = async who => {
  const f = FAM[who], name = PNAME[who], d = G.daily, opts = [], ids = [];
  const morning = schoolToday() && !d.arrived && G.time < CFG.PARENT_LEAVE && parentHome(who);
  if (morning) { opts.push(`Nhờ ${name.toLowerCase()} chở đi học`); ids.push('ride'); }
  opts.push('Trò chuyện'); ids.push('talk');
  if (!d.massage[who]) { opts.push(`Đấm lưng cho ${name.toLowerCase()}`); ids.push('massage'); }
  if (who === 'mom' && f.goal === 'stove' && !f.legs.length && !d.cook) { opts.push('Phụ mẹ nấu ăn'); ids.push('cook'); }
  if (who === 'dad' && dadWatching() && !d.football) { opts.push('Xem bóng đá cùng bố'); ids.push('football'); }
  if (freeTime() && !d.askOut && G.time < 1290) { opts.push('Xin phép đi chơi'); ids.push('out'); }
  if (who === 'mom' && fishCount() && !d.fishMom) { opts.push('Đưa cá cho mẹ nấu'); ids.push('fish'); }
  if (isDate(PARENT_BDAY[who], G.day) && !d.bday[who]) { opts.unshift(`Chúc mừng sinh nhật ${name.toLowerCase()}!`); ids.unshift('bday'); }
  opts.push('Thôi'); ids.push('x');
  const pi = parentInfo(G.parent);
  const c = ids[await UI.ask(name, `<p>${name} ${parentTxt(who)}. “${who === 'mom' ? 'Con cần gì không?' : 'Sao thế con?'}”</p>`, opts)];
  if (c === 'ride') {
    if (G.time >= CFG.RIDE_DEADLINE) return UI.say(name, `“Muộn rồi con ơi, ${name.toLowerCase()} phải đi làm ngay. Con tự đi nhé!”<p class="dim">Chỉ nhờ chở được trước 07:20.</p>`);
    const miss = missingToday();
    const c2 = await UI.ask(name, `<p>“Soạn cặp xong chưa? Lên xe ${name.toLowerCase()} chở, 10 phút là tới, rồi ${name.toLowerCase()} đi làm luôn.”</p>` + (miss.length ? `<p class="warnbox">Cặp còn thiếu: ${miss.map(i => ITEMS[i].name).join(', ')}</p>` : ''), ['Đi luôn ạ', 'Con chưa xong']);
    if (c2 === 0) { G.daily.drove = who; parentDrive(who); }
  } else if (c === 'talk') {
    if (!d.pchat[who]) { d.pchat[who] = true; addParent(PARENT.chat, `trò chuyện với ${name.toLowerCase()}`); }
    UI.say(name, '“' + pick(who === 'mom' ? MOM_TIPS : DAD_TIPS) + '”');
  } else if (c === 'massage') {
    if (G.stamina < 3) return UI.toast('Mệt quá, đấm không nổi.', 'bad');
    await animActivity(`Đang đấm lưng cho ${name.toLowerCase()}…`, 20, massageCut(f.n), () => { d.massage[who] = true; useStam(3); addParent(PARENT.massage, `đấm lưng cho ${name.toLowerCase()}`); });
  } else if (c === 'cook') {
    await animActivity('Đang phụ mẹ nấu ăn…', 20, cookCut(f.n), () => { d.cook = true; useStam(3); addStat('kheotay', 2); addParent(PARENT.cook, 'phụ mẹ nấu ăn'); });
  } else if (c === 'football') watchFootball();
  else if (c === 'out') askOuting(name);
  else if (c === 'fish') { const id = Object.keys(G.fish).find(k => G.fish[k] > 0); G.fish[id]--; d.fishMom = true; addParent(FISHING.momGift, 'mang cá về cho mẹ nấu'); UI.say('Mẹ', `“Ôi, ${FISH.find(x => x.id === id).name.toLowerCase()} tươi thế! Tối nay mẹ nấu canh chua nhé.”`); }
  else if (c === 'bday') { d.bday[who] = true; addParent(BDAY_PARENT, `chúc mừng sinh nhật ${name.toLowerCase()}`); UI.say(name, `“${name} cảm ơn con. Con nhớ sinh nhật ${name.toLowerCase()} là ${name.toLowerCase()} vui lắm rồi.”`); }
};
// Bố / mẹ chở đi học: hoạt cảnh xe máy chạy trên đường, thả mình trước cổng trường
async function parentDrive(who) {
  if (RT.lock) return;
  RT.lock = true;
  await rideCut('moto', `${PNAME[who]} chở đi học`, true, who);
  advanceTime(PARENT_RIDE_MIN); setMap('school', 330, 404, 3); RT.snapNpcs = true;
  await UI.fade(false);
  RT.lock = false; UI.hud();
  UI.toast(`${PNAME[who]} thả bạn trước cổng trường. Đi qua cổng để vào trường.`, 'info');
}
// Đã về nhà rồi muốn ra ngoài chơi tiếp: xin phép bố mẹ → được cho tiền đi chơi (tối đa OUTING.perWeek lần/tuần), mỗi ngày hỏi một lần
function outingChance() {
  const d = G.daily;
  return clamp(OUTING.chance + OUTING.perLvChance * parentInfo(G.parent).lv + (G.conduct >= 8 ? 0.1 : G.conduct < 6 ? -0.15 : 0) + (Object.keys(d.chores).length ? 0.1 : 0) - (d.scolded ? 0.3 : 0), 0.15, 0.95);
}
function askOuting(name) {
  const d = G.daily, lc = name.toLowerCase();
  d.askOut = true;
  if (Math.random() >= outingChance()) return UI.say(name, '“Hôm nay ở nhà học bài đi con, để hôm khác.”');
  d.outPerm = true; d.outAt20 = false;
  if (G.outAsk.n < OUTING.perWeek) {
    const amt = OUTING.base + OUTING.perLv * parentInfo(G.parent).lv;
    G.outAsk.n++; addMoney(amt);
    return UI.say(name, `“Ừ, đi chơi vui nhé. ${name} cho ${fmtMoney(amt)} đây, tiêu vừa thôi, đừng về khuya quá.”`);
  }
  UI.say(name, `“Đi thì được, nhưng tuần này ${lc} cho tiền đi chơi ${OUTING.perWeek} lần rồi. Lấy tiền tiêu vặt mà tiêu nhé.”`);
}
function dadWatching() { const f = FAM.dad; return !!G && f.goal === 'sofaL' && !f.legs.length && !f.hidden && G.time >= 1200; }
function tvLabel() { return dadWatching() && !G.daily.football ? 'Tivi — xem bóng đá cùng bố' : 'Tivi'; }
async function watchFootball() {
  await activity('Đang xem bóng đá cùng bố…', 30, () => { G.daily.football = true; G.daily.tv = true; gainStam(6); addParent(PARENT.football, 'xem bóng đá cùng bố'); });
}
ACT.tv = async () => {
  if (dadWatching() && !G.daily.football) return watchFootball();
  if (G.daily.tv) return UI.toast('Hôm nay xem tivi đủ rồi.');
  await activity('Đang xem tivi…', 30, () => { G.daily.tv = true; gainStam(6); });
};
// Về nhà sau 20:00 mà trước đó chưa ghé nhà, cũng chưa xin phép: bố mẹ phiền lòng.
// Đã về nhà trước 20:00 rồi mới đi chơi tiếp thì KHÔNG bị mắng.
function onEnterHome() {
  checkIn();
  if (G.comp && !G.comp.skip) endComp(`${FRIENDS[G.comp.fid].name} chào bạn rồi về.`);
  if (G.daily.outAt20 && !G.daily.scolded) {
    G.daily.scolded = true;
    addParent(PARENT.lateHome, 'về nhà sau 20:00');
    return UI.say('Mẹ', '“Mấy giờ rồi mà giờ này con mới về? Lần sau đi đâu cũng phải về nhà trước 8 giờ tối, hoặc xin phép bố mẹ trước nhé.”');
  }
}
