'use strict';
/* ============================================================
 *  04t. NỘI THẤT TRONG NHÀ
 *  - Mua ở TTTM (gian Nội thất, Nhạc cụ, Thể thao, Hoạ cụ) → món đồ vào TÚI, chưa tự bày ra đâu cả
 *  - Cầm lên (thanh đồ / túi) rồi vào nhà: bóng mờ của món đồ chạy theo con trỏ (viền xanh: đặt được · đỏ: vướng) → bấm để đặt.
 *    Không có chuột (phím E): đặt ngay trước mặt. Đồ treo tường (áp phích, đồng hồ) chỉ đặt lên mảng tường; thảm trải dưới sàn.
 *  - Không đặt chắn cửa ra vào, lối thông giữa các phòng, chỗ bố mẹ hay đứng; đồ nào trong nhà cũng phải còn lối tới được.
 *  - Bấm vào món đã đặt: dùng (tập, hát, vẽ) · nhấc lên dời chỗ · cất vào túi. Phòng ngủ có đồ trang trí thì ngủ ngon hơn.
 * ============================================================ */
const FURN = {
  d_poster: { name: 'Tấm áp phích', s: 'poster', wall: true, decor: true },
  d_dongho: { name: 'Đồng hồ treo tường', s: 'f_clock', wall: true, decor: true },
  d_den: { name: 'Đèn cây', s: 'floorlamp', sol: [3, 22, 6, 6], decor: true },
  d_cay: { name: 'Chậu cây cảnh', s: 'plant', sol: [2, 14, 12, 9], decor: true },
  d_tham: { name: 'Thảm trải sàn', s: 'rug', flat: true, decor: true },
  d_ghelui: { name: 'Ghế lười', s: 'f_beanbag', sol: [2, 7, 20, 10], decor: true },
  d_ke: { name: 'Kệ trang trí', s: 'f_shelf', sol: [1, 20, 22, 9], decor: true },
  d_beca: { name: 'Bể cá cảnh', s: 'f_tank', sol: [1, 17, 26, 10], decor: true },
  guitar: { name: 'Đàn guitar', s: 'guitar', sol: [2, 20, 8, 8] },
  micro: { name: 'Micro karaoke', s: 'mic', sol: [2, 17, 6, 6], use: 'Tập hát', go: () => ACT.music('home', true) },
  daynhay: { name: 'Dây nhảy', s: 'eq_daynhay', use: 'Nhảy dây', go: it => ACT.exercise('daynhay', true, it) },
  tatay: { name: 'Tạ tay', s: 'eq_tatay', use: 'Tập tạ', go: it => ACT.exercise('tatay', true, it) },
  xadon: { name: 'Xà đơn', s: 'eq_xadon', sol: [0, 38, 30, 6], use: 'Hít xà', go: it => ACT.exercise('xadon', true, it) },
  khungtranh: { name: 'Khung tranh (giá vẽ)', s: 'easel', sol: [2, 22, 20, 9], use: 'Ngồi vẽ tranh', go: it => ACT.paint('easel', true, it) },
};
const FURN_MAP = 'home';
const FURN_WALLS = [[18, 142], [162, 350], [370, 462]];                       // mảng tường của phòng ngủ, phòng khách, bếp (x)
const FURN_WALL_FIXED = [[70, 9, 19, 14], [322, 9, 19, 14], [404, 8, 19, 12], [248, 5, 20, 28], [172, 8, 16, 13]];   // cửa sổ, cửa phòng bố mẹ, ảnh gia đình
const FURN_KEEP = [[196, 194, 56, 46], [134, 118, 36, 52], [342, 86, 36, 52], [242, 30, 32, 20], [16, 136, 46, 34]];  // cửa chính, 2 lối thông phòng, trước cửa phòng bố mẹ, thảm tập
const isFurn = id => !!FURN[id];
const furnDecor = id => !!(FURN[id] && FURN[id].decor);
const furnPlaced = id => (G.furn ? G.furn.items : []).filter(it => !id || it.id === id);
const furnSpr = id => SPR[FURN[id].s];
function furnRect(id, ax, ay) {                                                // khung hình của món đồ khi chân đặt ở (ax, ay)
  const s = furnSpr(id); return [Math.round(ax - s.width / 2), Math.round(ay - s.height), s.width, s.height];
}
function furnFoot(id, ax, ay) {                                                // chỗ món đồ chiếm trên sàn
  const F = FURN[id], [x, y, w, h] = furnRect(id, ax, ay);
  if (F.flat || F.wall) return [x, y, w, h];
  if (F.sol) return [x + F.sol[0], y + F.sol[1], F.sol[2], F.sol[3]];
  return [x + 1, y + Math.floor(h / 2), w - 2, Math.ceil(h / 2)];
}
const rHit = (a, b, pad) => { pad = pad || 0; return a[0] < b[0] + b[2] + pad && a[0] + a[2] + pad > b[0] && a[1] < b[1] + b[3] + pad && a[1] + a[3] + pad > b[1]; };

/* ---------- dựng các món đã đặt thành vật thể trên bản đồ ---------- */
function furnSync() {
  const m = MAPS[FURN_MAP]; if (!m || !G) return;
  m.objs = m.objs.filter(o => !o.furn);
  for (const it of furnPlaced()) {
    const F = FURN[it.id]; if (!F) continue;
    const [x, y] = furnRect(it.id, it.x, it.y);
    const o = { furn: it.uid, s: F.s, x, y, label: () => `${F.name} — ${F.use ? F.use.toLowerCase() + ' · ' : ''}dời chỗ`, act: () => furnAct(it) };
    if (F.wall) { o.base = 0; o.ir = [-2, 0, SPR[F.s].width + 4, SPR[F.s].height + 14]; }
    else if (F.flat) { o.flat = true; o.ir = [8, 6, SPR[F.s].width - 16, SPR[F.s].height - 12]; }
    else { if (F.sol) o.sol = F.sol; o.ir = [-4, -2, SPR[F.s].width + 8, SPR[F.s].height + 6]; }
    addObj(m, o);
  }
}

/* ---------- kiểm tra chỗ đặt ---------- */
function furnWhy(id, ax, ay, full, skipUid) {
  const m = MAPS[FURN_MAP], F = FURN[id];
  if (G.map !== FURN_MAP) return 'Đồ nội thất chỉ bày được trong nhà mình.';
  const r = furnRect(id, ax, ay), others = furnPlaced().filter(it => it.uid !== skipUid);
  if (F.wall) {
    if (!FURN_WALLS.some(([a, b]) => r[0] >= a && r[0] + r[2] <= b) || r[1] < 2 || r[1] + r[3] > 31) return 'Đồ treo tường thì bấm lên mảng tường phía trên phòng.';
    if (FURN_WALL_FIXED.some(w => rHit(r, w))) return 'Vướng cửa sổ / cửa / ảnh treo tường rồi.';
    for (const o of m.objs) if (!o.flat && !o.furn && (!o.vis || o.vis()) && o.y < 32 && rHit(r, [o.x, o.y, o.w, o.h])) return 'Chỗ đó có đồ đạc che mất rồi.';
    for (const it of others) if (FURN[it.id].wall && rHit(r, furnRect(it.id, it.x, it.y), 1)) return 'Sát món treo tường khác quá.';
    return '';
  }
  const f = furnFoot(id, ax, ay);
  if (r[0] < 16 || r[0] + r[2] > m.pw - 16 || f[1] < 32 || f[1] + f[3] > m.ph - 16) return 'Phải đặt trên sàn nhà.';
  for (let yy = f[1]; yy <= f[1] + f[3] - 1; yy += Math.max(1, Math.min(4, f[3] - 1))) for (let xx = f[0]; xx <= f[0] + f[2] - 1; xx += Math.max(1, Math.min(4, f[2] - 1))) {
    const k = (yy >> 4) * m.w + (xx >> 4); if (m.solid[k] || ['void', 'walltop'].includes(m.tile[k])) return 'Phải đặt trên sàn, không chồng lên tường.';
  }
  if (F.flat) { for (const it of others) if (FURN[it.id].flat && rHit(f, furnFoot(it.id, it.x, it.y))) return 'Chồng lên tấm thảm khác rồi.'; return ''; }
  if (FURN_KEEP.some(k => rHit(f, k))) return 'Đừng đặt chắn cửa / lối đi / thảm tập.';
  for (const P of Object.values(POI)) if (P.map === FURN_MAP && !P.sit && rHit(f, [P.x - 5, P.y - 6, 10, 7])) return 'Chỗ đó bố mẹ hay đứng làm việc, để trống ra.';
  for (const o of m.objs) { if (o.furn === skipUid || !o.sol || (o.vis && !o.vis())) continue; if (rHit(f, [o.x + o.sol[0], o.y + o.sol[1], o.sol[2], o.sol[3]], 1)) return 'Vướng đồ đạc khác rồi.'; }
  for (const it of others) if (!FURN[it.id].flat && !FURN[it.id].wall && !FURN[it.id].sol && rHit(f, furnFoot(it.id, it.x, it.y), 1)) return 'Vướng đồ đạc khác rồi.';
  if (rHit(f, [G.x - 5, G.y - 6, 10, 7])) return 'Đang đứng đúng chỗ đó — lùi ra một chút.';
  for (const n of NPCS) if (n.map === FURN_MAP && n.cx !== undefined && (!n.vis || n.vis()) && rHit(f, [n.cx - 5, n.cy - 6, 10, 7])) return 'Có người đang đứng ở đó.';
  if (full && !furnPathOk(F.sol ? f : null)) return 'Đặt ở đó thì chắn mất lối đi tới đồ khác trong nhà.';
  return '';
}
// Loang từ cửa chính: mọi đồ có thể bấm vào (giường, bàn học, tivi, bếp…) và chỗ bố mẹ đứng phải còn tới được
function furnReach(extra) {
  const m = MAPS[FURN_MAP], S = 4, W = m.pw / S | 0, H = m.ph / S | 0, seen = new Uint8Array(W * H), q = [];
  const ok = (i, j) => { const x = i * S, y = j * S; if (blocked(m, x, y)) return false; return !(extra && rHit([x - 4, y - 5, 8, 5], extra)); };
  const s0 = [224 / S | 0, 212 / S | 0]; if (!ok(s0[0], s0[1])) return seen;
  seen[s0[1] * W + s0[0]] = 1; q.push(s0);
  while (q.length) { const [i, j] = q.pop(); for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= W || b >= H || seen[b * W + a]) continue; if (!ok(a, b)) continue; seen[b * W + a] = 1; q.push([a, b]); } }
  seen.W = W; seen.S = S; return seen;
}
function furnTargets() {
  const m = MAPS[FURN_MAP], t = [];
  for (const o of m.objs) if (o.act && (!o.vis || o.vis())) { const s = o.ir || o.sol || [0, 0, o.w, o.h]; t.push([o.x + s[0], o.y + s[1], s[2], s[3], 18]); }
  for (const P of Object.values(POI)) if (P.map === FURN_MAP && !P.sit) t.push([P.x - 2, P.y - 2, 4, 4, 6]);
  return t;
}
function furnCanReach(seen, T) {
  const W = seen.W, S = seen.S;
  for (let k = 0; k < seen.length; k++) if (seen[k]) { const px = (k % W) * S, py = Math.floor(k / W) * S - 2; if (Math.hypot(Math.max(T[0] - px, 0, px - (T[0] + T[2])), Math.max(T[1] - py, 0, py - (T[1] + T[3]))) <= T[4]) return true; }
  return false;
}
function furnPathOk(foot) {
  if (!foot) return true;
  const base = furnReach(null), now = furnReach(foot);
  if (!base.W || !now.W) return true;
  return furnTargets().every(T => !furnCanReach(base, T) || furnCanReach(now, T));
}

/* ---------- đặt món đang cầm ---------- */
const mouseWorld = () => [(MOUSE.x * VIEW.dpr - VIEW.ox) / VIEW.S, (MOUSE.y * VIEW.dpr - VIEW.oy) / VIEW.S];
function furnSpotAt(id, wx, wy) {                                              // con trỏ ở (wx, wy) → chân món đồ
  const s = furnSpr(id);
  return FURN[id].wall ? [Math.round(wx), Math.round(wy + s.height / 2)] : [Math.round(wx), Math.round(wy + s.height / 2 - (FURN[id].flat ? 0 : 2))];
}
function furnSpotFront(id) {
  const s = furnSpr(id), d = [[0, 14 + s.height], [-10 - s.width / 2, 2], [10 + s.width / 2, 2], [0, -12]][G.dir] || [0, 14];
  if (FURN[id].wall) return [Math.round(G.x), 28];
  return [Math.round(G.x + d[0]), Math.round(G.y + d[1])];
}
async function furnPlace(byMouse) {
  const id = RT.hold; if (!isFurn(id) || !gCount(id)) return;
  if (G.map !== FURN_MAP) return UI.toast(`${FURN[id].name}: đồ nội thất mang về nhà rồi cầm lên, bấm vào chỗ muốn đặt.`, 'info');
  const [ax, ay] = byMouse && MOUSE.on ? furnSpotAt(id, ...mouseWorld()) : furnSpotFront(id);
  const why = furnWhy(id, ax, ay, true);
  if (why) return UI.toast(why, 'bad');
  G.furn.items.push({ uid: ++G.furn.seq, id, x: ax, y: ay });
  gTake(id);
  if (!gCount(id)) RT.hold = null;
  furnSync(); UI._hb = null; UI.hud();
  UI.toast(`Đã đặt ${FURN[id].name.toLowerCase()}. Bấm vào để ${FURN[id].use ? FURN[id].use.toLowerCase() + ' hoặc ' : ''}dời chỗ.`, 'good');
}
// bóng mờ của món đang cầm theo con trỏ (hoặc ngay trước mặt nếu không dùng chuột)
function drawFurnGhost(now) {
  const id = RT.hold;
  if (!G || !isFurn(id) || G.map !== FURN_MAP || RT.scene || UI.isOpen() || !gCount(id)) return;
  const [ax, ay] = MOUSE.on ? furnSpotAt(id, ...mouseWorld()) : furnSpotFront(id);
  const key = id + ':' + ax + ':' + ay + ':' + G.furn.items.length + ':' + Math.round(G.x / 4) + ':' + Math.round(G.y / 4);
  if (RT.fgKey !== key) { RT.fgKey = key; RT.fgOk = !furnWhy(id, ax, ay, false); }
  const r = furnRect(id, ax, ay), f = furnFoot(id, ax, ay), col = RT.fgOk ? '#5fd068' : '#e2574c';
  ctx.globalAlpha = 0.5 + Math.sin(now / 200) * 0.1; drawSpr(furnSpr(id), r[0], r[1]); ctx.globalAlpha = 0.35;
  wRect(col, f[0], f[1], f[2], f[3]); ctx.globalAlpha = 1;
  wRect(col, f[0], f[1], f[2], 1); wRect(col, f[0], f[1] + f[3] - 1, f[2], 1); wRect(col, f[0], f[1], 1, f[3]); wRect(col, f[0] + f[2] - 1, f[1], 1, f[3]);
}

/* ---------- bấm vào món đã đặt ---------- */
async function furnAct(it) {
  if (RT.lock) return;
  const F = FURN[it.id], btn = (F.use ? [F.use] : []).concat(['Nhấc lên dời chỗ', 'Cất vào túi', 'Thôi']);
  const info = F.use ? furnUseInfo(it.id) : F.decor ? `<p class="dim">Đồ trang trí${F.decor ? ` — để trong phòng ngủ thì ngủ dậy hồi thêm ${DECOR_SLEEP} thể lực (tối đa ${DECOR_MAX} món)` : ''}.</p>` : '';
  const c = await UI.ask(F.name, info || '<p>Món đồ trong nhà.</p>', btn);
  const k = F.use ? c - 1 : c;
  if (F.use && c === 0) return F.go(it);
  if (k === 0 || k === 1) {
    G.furn.items = G.furn.items.filter(x => x.uid !== it.uid); gAdd(it.id); furnSync();
    if (k === 0) RT.hold = it.id;
    UI._hb = null; UI.hud();
    UI.toast(k === 0 ? `Đang cầm ${F.name.toLowerCase()} — bấm vào chỗ khác trong nhà để đặt.` : `Cất ${F.name.toLowerCase()} vào túi.`, 'info');
  }
}
function furnUseInfo(id) {
  if (id === 'micro') return `<p>Bật nhạc nền lên luyện thanh.</p><p class="dim">${MUSIC.mins} phút · −${MUSIC.stam} thể lực · cộng Văn nghệ theo điểm</p>`;
  if (id === 'khungtranh') return `<p>Ngồi vào giá vẽ vẽ một bức tranh.</p><p class="dim">${PAINT.mins} phút · −${PAINT.stam} thể lực · +${PAINT.pts} Hội hoạ · tranh bán được</p>`;
  const E = EXERCISES.find(e => e.id === id);
  return E ? `<p>${E.name}.</p><p class="dim">+${E.pts} Thể thao · −${EXERCISE_STAM} thể lực · ${EXERCISE_MIN} phút · tối đa ${EXERCISE_MAX_PER_DAY} lần/ngày</p>` : '';
}
// chỗ đứng cạnh món đồ để dùng: thử phía dưới, trái, phải, trên
function furnStand(it) {
  const m = MAPS[FURN_MAP], f = furnFoot(it.id, it.x, it.y), cx0 = f[0] + f[2] / 2;
  const tries = [[cx0, f[1] + f[3] + 6, 3], [f[0] - 6, f[1] + f[3] - 1, 2], [f[0] + f[2] + 6, f[1] + f[3] - 1, 1], [cx0, f[1] - 2, 0]];
  for (const [x, y, d] of tries) if (!blocked(m, x, y)) return [Math.round(x), Math.round(y), d];
  return [Math.round(cx0), Math.round(f[1] + f[3] + 6), 3];
}
const DECOR_MAX = 5;
const decorInBedroom = () => new Set(furnPlaced().filter(it => furnDecor(it.id) && it.x < 144).map(it => it.id)).size;
// bản lưu cũ: đồ đã mua trước đây (bày cố định trong phòng ngủ) chuyển vào túi để tự bày lại
function furnMigrate() {
  if (G.furn) return;
  G.furn = { seq: 0, items: [] };
  const moved = Object.keys(FURN).filter(k => G.owned[k]);
  for (const k of moved) { gAdd(k); if (FURN[k].decor) delete G.owned[k]; }
  if (moved.length) RT.furnNote = moved.map(k => FURN[k].name.toLowerCase()).join(', ');
}
