'use strict';
/* ============================================================
 *  04l. ĐI LẠI THEO LỊCH — bạn bè, thầy cô, bố mẹ ra khỏi nhà đi học / đi làm
 *  - Phố Hoa Phượng, sáng ngày đi học: các bạn ra khỏi nhà rồi đạp xe / ra trạm bắt xe bus / đi bộ về phía trường;
 *    thầy cô chạy xe ngang qua; bố mẹ chạy xe tới công ty (mẹ) và xuống bờ sông sang nhà máy (bố). Chiều thì đi ngược lại.
 *  - Trường: các bạn đi bộ / xuống xe bus / đạp xe vào cổng (xe đạp cất ở nhà xe) rồi ra chỗ tụ chơi;
 *    thầy cô chạy xe vào cổng, dựng xe ở nhà xe rồi lên cầu thang. Học sinh khác lần lượt đi qua cổng vào sân.
 *  - Mỗi chuyến chỉ chạy khi mình đang ở bản đồ đó (giờ bắt đầu nằm trong khoảng cho phép), chạy theo thời gian thực.
 * ============================================================ */
const TRIP_SPEED = { walk: 40, bike: 64, moto: 92, motoMom: 92, jeep: 110 };
const RIDE_SPR = { bike: 'bike', moto: 'moto', motoMom: 'motoMom', jeep: 'jeep' };
// bạn thân đi học bằng gì, mấy giờ ra khỏi nhà · thời gian đi từ phố Hoa Phượng tới trường
const COMMUTE = { khoa: { mode: 'bike', leave: 410 }, vy: { mode: 'bus', leave: 395 }, dat: { mode: 'walk', leave: 380 }, ngan: { mode: 'walk', leave: 400 } };
const COMMUTE_MIN = { bike: 18, bus: 22, walk: 35 };
// thầy cô: [id, xe, giờ chạy qua phố Hoa Phượng]
const TEACH_COMMUTE = [['nghiem', 'moto', 392], ['tung', 'moto', 400], ['lan', 'motoMom', 408], ['hanh', 'motoMom', 416], ['manh', 'bike', 424], ['quan', 'moto', 432]];
const TRIPS = [];
// giờ có mặt ở trường buổi sáng: bạn thân theo lịch đi học, học sinh khác rải từ 06:10 tới 07:20
function arriveAt(sid) {
  const c = COMMUTE[sid]; if (c) return c.leave + COMMUTE_MIN[c.mode];
  let h = 0; for (const ch of sid) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return 370 + (h % 8) * 10;
}
// học sinh ngoài sân buổi sáng chỉ hiện khi đã tới trường (đang trên đường vào cổng thì do chuyến đi vẽ)
function yardArrived(sid) {
  if (!G || !schoolToday() || G.time >= PERIODS[0].start) return true;
  const s = tripState('s_' + sid); if (s) return s.done;
  return G.time >= arriveAt(sid);
}
// chỗ ra vào của học sinh ngoài sân: sáng sớm / tan học là cổng trường, giờ ra chơi là cửa lớp mình
function yardPortal(sid, inn) {
  if (!G || G.time < PERIODS[0].start || G.time >= schoolEndT()) return [352, 452];
  if (/^s[A-D]$/.test(sid)) return [352, 114];
  return { x1: [319, 114], x2: [319, 114], x3: [385, 114], x4: [494, 114] }[sid] || [244, 114];
}

/* ---------- chạy chuyến ---------- */
const tripState = id => { const s = RT.trips && RT.trips[id]; return s && G && s.day === G.day ? s : null; };
const tripRun = id => { const s = tripState(id); return !!(s && !s.done); };
function tripPos(id) {
  const s = tripState(id); if (!s || s.done) return null;
  return { x: s.x, y: s.y, dir: s.dir, walk: s.mode === 'walk' && s.moving ? s.walk : -1, ride: s.mode === 'walk' ? null : RIDE_SPR[s.mode] };
}
function addTrip(o) {
  TRIPS.push(o);
  NPCS.push({ id: 'trip_' + o.id, name: o.name, look: o.look, outfit: () => (typeof o.outfit === 'function' ? o.outfit() : o.outfit || null), map: o.map, x: 0, y: 0, tr: false, pos: () => tripPos(o.id), vis: () => tripRun(o.id) });
}
function updateTrips(dt, snap) {
  if (!G) return;
  RT.trips = RT.trips || {};
  const cut = RT.scene && RT.scene.type === 'cut';
  for (const T of TRIPS) {
    const at = typeof T.at === 'function' ? T.at() : T.at, win = T.win || 30;
    let s = tripState(T.id);
    if (!s) {
      if (T.map !== G.map || cut || snap || G.time < at || G.time >= at + win || !T.when()) continue;
      const legs = T.legs(); if (!legs || legs.length < 2) continue;
      s = RT.trips[T.id] = { day: G.day, legs, i: 1, x: legs[0][0], y: legs[0][1], dir: legs[1][0] < legs[0][0] ? 1 : 2, walk: 0, mode: legs[0][2] || 'walk', moving: false, done: false };
    }
    if (s.done) continue;
    if (snap || G.time >= at + win + 90) { s.done = true; if (T.onDone) T.onDone(s); continue; }   // thời gian nhảy xa: coi như đã tới nơi
    if (T.map !== G.map) continue;
    const L = s.legs[s.i];
    if (!L) { s.done = true; if (T.onDone) T.onDone(s); continue; }
    if (L.wait !== undefined) { s.moving = false; if (G.time >= L.wait) s.i++; continue; }        // đứng chờ (xe bus)
    const [tx, ty, mode] = L; s.mode = mode || 'walk';
    const sp = TRIP_SPEED[s.mode] * dt, dx = tx - s.x, dy = ty - s.y, d = Math.hypot(dx, dy);
    if (Math.abs(dx) > Math.abs(dy) || s.mode === 'walk') s.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0);
    if (s.mode !== 'walk' && s.dir !== 1 && s.dir !== 2) s.dir = 2;                                // xe chỉ vẽ nghiêng trái / phải
    if (d <= sp) { s.x = tx; s.y = ty; s.i++; } else { s.x += dx / d * sp; s.y += dy / d * sp; }
    s.moving = true; s.walk += dt;
  }
}

/* ---------- các chuyến trong ngày ---------- */
function buildTrips() {
  const PW = PHO_W * 16, work = who => () => !!G && workDay() && G.daily.drove !== who;
  const sch = () => !!G && schoolToday();
  // bạn thân: ra khỏi nhà ở phố Hoa Phượng → trường; chiều về nhà
  for (const fid in COMMUTE) {
    const c = COMMUTE[fid], dx = FRIEND_HOUSE[fid][1] + 49, name = FRIENDS[fid].name, base = { look: fid, outfit: () => friendOutfit(fid), name };
    const free = () => sch() && !isComp(fid) && !(G.meet && G.meet.fid === fid && G.meet.day === G.day);
    addTrip(Object.assign({}, base, { id: 'p_' + fid, map: 'pho', at: c.leave, win: 40, when: free, legs: () =>
      c.mode === 'bike' ? [[dx, 130, 'walk'], [dx, 150, 'walk'], [dx, 210, 'bike'], [PW + 30, 210, 'bike']]
        : c.mode === 'bus' ? [[dx, 130, 'walk'], [dx, 176, 'walk'], [224, 188, 'walk'], { wait: c.leave + 14 }, [208, 204, 'walk']]
          : [[dx, 130, 'walk'], [dx, 178, 'walk'], [PW + 20, 178, 'walk']] }));
    addTrip(Object.assign({}, base, { id: 'h_' + fid, map: 'pho', at: () => schoolEndT() + 45 + (dx % 20), win: 40, when: free, legs: () =>
      c.mode === 'bike' ? [[PW + 30, 210, 'bike'], [dx, 210, 'bike'], [dx, 150, 'walk'], [dx, 130, 'walk']]
        : c.mode === 'bus' ? [[208, 204, 'walk'], [224, 188, 'walk'], [dx, 176, 'walk'], [dx, 130, 'walk']]
          : [[PW + 20, 178, 'walk'], [dx, 178, 'walk'], [dx, 130, 'walk']] }));
    // tới trường: đi bộ dọc vỉa hè / xuống xe bus / đạp xe dưới đường → qua cổng → (cất xe ở nhà xe) → ra chỗ tụ chơi
    addTrip(Object.assign({}, base, { id: 's_' + fid, map: 'school', at: arriveAt(fid) - 14, win: 14, when: () => sch() && !isComp(fid), legs: () => {
      const p = yardPos(fid) || { x: 300, y: 300 }, E = [p.x, p.y, 'walk'];
      if (c.mode === 'bike') return [[-30, 502, 'bike'], [330, 502, 'bike'], [352, 448, 'bike'], [352, 404, 'bike'], [562, 118, 'bike'], E];
      if (c.mode === 'bus') return [[132, 470, 'walk'], [352, 454, 'walk'], [352, 404, 'walk'], E];
      return [[-14, 456, 'walk'], [352, 456, 'walk'], [352, 404, 'walk'], E];
    }, onDone: () => { const n = NPCS.find(q => q.id === 'y_' + fid); if (n) { n._sv = true; n._tr = null; } } }));
  }
  // thầy cô: chạy xe qua phố Hoa Phượng, vào cổng trường, dựng xe ở nhà xe rồi lên cầu thang; chiều về thì ngược lại
  TEACH_COMMUTE.forEach(([tid, m, at], i) => {
    const T = TEACHERS[tid], base = { look: T.look, name: T.name };
    addTrip(Object.assign({}, base, { id: 'tp_' + tid, map: 'pho', at, win: 30, when: sch, legs: () => [[-30, 226, m], [PW + 30, 226, m]] }));
    addTrip(Object.assign({}, base, { id: 'ts_' + tid, map: 'school', at: at + 10, win: 25, when: sch, legs: () => [[-30, 506, m], [330, 506, m], [352, 448, m], [352, 404, m], [590 + i * 4, 118, m], [352, 114, 'walk']] }));
    addTrip(Object.assign({}, base, { id: 'tl_' + tid, map: 'school', at: () => schoolEndT() + 20 + i * 5, win: 30, when: sch, legs: () => [[352, 114, 'walk'], [590 + i * 4, 118, 'walk'], [352, 404, m], [352, 448, m], [330, 506, m], [-30, 506, m]] }));
    addTrip(Object.assign({}, base, { id: 'tr_' + tid, map: 'pho', at: () => schoolEndT() + 30 + i * 5, win: 30, when: sch, legs: () => [[PW + 30, 218, m], [-30, 218, m]] }));
  });
  // bố mẹ: chạy xe qua phố Hoa Phượng — mẹ vào công ty Sen Vàng (cuối phố), bố xuống lối bờ sông sang nhà máy ở phố Bờ Đông
  const cx = MOM_CO.x + 76;
  addTrip({ id: 'pm_mom', map: 'pho', look: 'mom', outfit: 'noapron', name: 'Mẹ', at: CFG.PARENT_LEAVE + 6, win: 30, when: work('mom'), legs: () => [[-30, 220, 'motoMom'], [cx, 220, 'motoMom'], [cx, 150, 'motoMom'], [cx, 104, 'walk']] });
  addTrip({ id: 'pm_dad', map: 'pho', look: 'dad', outfit: null, name: 'Bố', at: CFG.PARENT_LEAVE + 6, win: 30, when: work('dad'), legs: () => [[-30, 232, 'moto'], [440, 232, 'moto'], [440, 420, 'moto']] });
  addTrip({ id: 'pe_mom', map: 'pho', look: 'mom', outfit: 'noapron', name: 'Mẹ', at: 1040, win: 30, when: work('mom'), legs: () => [[cx, 104, 'walk'], [cx, 150, 'walk'], [cx, 220, 'motoMom'], [-30, 220, 'motoMom']] });
  addTrip({ id: 'pe_dad', map: 'pho', look: 'dad', outfit: null, name: 'Bố', at: 1052, win: 30, when: work('dad'), legs: () => [[440, 420, 'moto'], [440, 232, 'moto'], [-30, 232, 'moto']] });
}
