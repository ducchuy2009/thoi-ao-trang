'use strict';
/* ============================================================
 *  04q. ĐỒ VẬT · BÁN / TẶNG · THÙNG CHỨA · VƯỜN (chậu cây) · THÚ CƯNG · CỬA HÀNG HOA, THÚ CƯNG, ĐỒ CÂU · CHỢ
 *  - Mọi món mang theo (trừ thẻ học sinh) đều có GIÁ TRỊ cố định (cao hơn giá mua một chút) → cầm lên, bấm vào ai đó:
 *    Tặng (không lấy tiền; sở thích quyết định thân thiết: thích +nhiều, bình thường +ít, không thích −ít, ghét −nhiều, sinh nhật ×2)
 *    hoặc Bán (được tiền, không thêm thân thiết; người ta có thể từ chối). Bán sách / hộp bút / đồng phục thì mua lại ở TTTM.
 *  - Vườn = sân trước nhà mình (khu phố): cầm chậu hoặc thùng chứa, bấm chỗ trống để đặt. Chậu thì gieo hạt, tưới mỗi ngày.
 * ============================================================ */
const r1000 = v => Math.max(1000, Math.round(v / 1000) * 1000);
const FISH_BY = Object.fromEntries(FISH.map(f => [f.id, f]));
const isFish = id => !!FISH_BY[id];
// Hàng chợ, hàng hoa, đồ câu, hoạ cụ (giá mua; giá trị bán lại tính từ giá này)
const MARKET = {
  rau: [{ id: 'rau', name: 'Bó rau muống', price: 8000, desc: 'Rau tươi buổi sáng, mẹ thích lắm' }, { id: 'c_cachua', name: 'Cà chua', price: 12000, desc: 'Một quả cà chua đỏ mọng' }, { id: 'c_chanh', name: 'Chanh', price: 6000, desc: 'Chanh tươi vắt nước' }, { id: 'c_dau', name: 'Dâu tây', price: 30000, desc: 'Hộp dâu tây Đà Lạt' }],
  ca: [{ id: 'ro', name: 'Cá rô', price: 8000, desc: 'Cá rô đồng tươi rói', fish: true }, { id: 'chep', name: 'Cá chép', price: 20000, desc: 'Cá chép to, kho tộ là ngon', fish: true }, { id: 'nuc', name: 'Cá nục', price: 10000, desc: 'Cá nục biển', fish: true }, { id: 'thu', name: 'Cá thu', price: 32000, desc: 'Khúc cá thu chiên giòn', fish: true }],
  an: [{ id: 'banhcuon', name: 'Bánh cuốn', price: 15000, desc: 'Bánh cuốn nóng chấm nước mắm', food: true }, { id: 'xoi', name: 'Xôi gấc', price: 12000, desc: 'Gói xôi gấc đỏ au', food: true }, { id: 'nuocdua', name: 'Nước dừa', price: 12000, desc: 'Trái dừa xiêm mát lạnh', food: true }, { id: 'banhmi', name: 'Bánh mì', price: 10000, desc: 'Bánh mì nóng giòn', food: true }],
};
Object.assign(FOODS, { banhcuon: { name: 'Bánh cuốn', stam: 18, gift: 3 }, nuocdua: { name: 'Nước dừa', stam: 8, drink: true, gift: 3 } });
const FLOWER_SHOP = () => [{ id: 'chau', name: 'Chậu trồng cây', price: FARM.pot, desc: 'Đặt ngoài vườn trước nhà rồi gieo hạt. Không có chậu thì không trồng được.' }]
  .concat(Object.keys(CROPS).map(k => ({ id: 'h_' + k, name: `Hạt ${CROPS[k].name.toLowerCase()}`, price: CROPS[k].seed, desc: CROPS[k].kind === 'hoa' ? `Nở sau ${CROPS[k].grow} ngày tưới · thu 1 lần · bông bán ${fmtMoney(CROPS[k].price)}` : `Lứa đầu sau ${CROPS[k].grow} ngày, rồi ${CROPS[k].regrow} ngày một lứa · ${CROPS[k].yield} quả × ${fmtMoney(CROPS[k].price)}` })));
const TACKLE_SHOP = () => [{ id: 'cancau', name: 'Cần câu', price: 80000, desc: 'Câu được ở sông, hồ công viên và biển', own: 'cancau' }, { id: 'cancau2', name: 'Cần câu sợi carbon', price: 350000, desc: 'Vùng giữ lực rộng hơn, dễ kéo cá to', own: 'cancau2' }, { id: 'moi', name: 'Hộp mồi câu ×5', price: 15000, desc: 'Mỗi lần thả câu dùng 1 mồi: dễ gặp cá quý hơn', n: 5 }];
const ART_SHOP = () => [{ id: 'giayve', name: 'Giấy vẽ', price: PAINT.paper, desc: 'Cầm theo người, bấm vào mình để ngồi vẽ ở bất cứ đâu' }, { id: 'khungtranh', name: 'Khung tranh (giá vẽ)', price: PAINT.frame, desc: 'Dựng ở phòng khách nhà mình để ngồi vẽ tranh', own: 'khungtranh' }];
const SCHOOL_PRICE = { hopbut: 25000, dp_td: 90000, dp_qp: 110000, vethang: 35000 };
// giá mua tham khảo (để tính giá trị bán lại)
function buyPrice(id) {
  if (buyPrice._m === undefined) {
    const m = buyPrice._m = {}, put = (k, p) => { if (k && p && !m[k]) m[k] = p; };
    for (const it of SHOP.concat(CANTEEN, TT_FOOD, TT_MATS)) put(it.inv || it.id, it.n > 1 ? it.price / it.n : it.price);
    for (const k in MALL_GOODS) for (const it of MALL_GOODS[k]) put(it.inv || it.id, it.price);
    for (const k in MARKET) for (const it of MARKET[k]) put(it.id, it.price);
    for (const it of FLOWER_SHOP().concat(TACKLE_SHOP(), ART_SHOP())) put(it.id, it.n > 1 ? it.price / it.n : it.price);
  }
  return buyPrice._m[id] || 0;
}
// Thông tin một món: tên, giá trị bán cố định, nhóm (dùng cho sở thích quà)
function goodsInfo(id) {
  if (!id || id === 'thehs') return null;
  if (isFish(id)) return { name: FISH_BY[id].name, value: FISH_BY[id].price, cat: 'fish' };
  if (id.startsWith('c_') && CROPS[id.slice(2)]) { const C = CROPS[id.slice(2)]; return { name: C.name, value: C.price, cat: C.kind === 'hoa' ? 'flower' : 'fruit' }; }
  if (id.startsWith('h_') && CROPS[id.slice(2)]) return { name: `Hạt ${CROPS[id.slice(2)].name.toLowerCase()}`, value: r1000(CROPS[id.slice(2)].seed * 1.15), cat: 'seed' };
  const T = PAINT.tiers.find(t => t[0] === id); if (T) return { name: T[1], value: T[2], cat: 'art' };
  if (ITEMS[id]) return { name: ITEMS[id].name, value: r1000((id.startsWith('sach_') ? 35000 : SCHOOL_PRICE[id] || 20000) * 1.15), cat: 'school' };
  const special = { gaubong: ['Gấu bông', 70000, 'gift'], voso: ['Vỏ sò', 9000, 'gift'], denongsao: ['Đèn ông sao', 35000, 'gift'], banhtrang: ['Bánh tráng trộn', 6000, 'food'], rau: ['Bó rau muống', 9000, 'veg'], chau: ['Chậu trồng cây', 23000, 'tool'], thung: ['Thùng chứa nhỏ', 69000, 'tool'], giayve: ['Giấy vẽ', 12000, 'tool'], moi: ['Mồi câu', 3000, 'tool'] }[id];
  if (special) return { name: special[0], value: special[1], cat: special[2] };
  if (FOODS[id]) return { name: FOODS[id].name, value: r1000((buyPrice(id) || FOODS[id].stam * 700) * 1.15), cat: FOODS[id].drink ? 'drink' : 'food' };
  const m = TT_MATS.find(t => t.id === id); if (m) return { name: m.name, value: r1000(m.price * 1.15), cat: 'tool' };
  if (isFurn(id)) return { name: FURN[id].name, value: r1000((buyPrice(id) || 50000) * 1.15), cat: 'furn' };
  return null;
}
// cất / lấy đồ: cá ở G.fish, đồ dùng học tập ở G.bag (bán đi thì phải mua lại: G.noOwn), còn lại ở G.inv
const gCount = id => (isFish(id) ? G.fish[id] || 0 : ITEMS[id] ? (G.bag[id] ? 1 : 0) : G.inv[id] || 0);
function gAdd(id, n) { n = n || 1; if (isFish(id)) G.fish[id] = (G.fish[id] || 0) + n; else if (ITEMS[id]) { G.bag[id] = true; delete G.noOwn[id]; } else G.inv[id] = (G.inv[id] || 0) + n; }
function gTake(id, n) {
  n = n || 1;
  if (isFish(id)) G.fish[id] = Math.max(0, (G.fish[id] || 0) - n);
  else if (ITEMS[id]) { delete G.bag[id]; G.noOwn[id] = true; if (id === 'vethang') G.busPassUntil = -1; }
  else G.inv[id] = Math.max(0, (G.inv[id] || 0) - n);
  if (isFurn(id) && !FURN[id].decor && !gCount(id) && !furnPlaced(id).length) delete G.owned[id];
  if (!gCount(id) && RT.hold === id) RT.hold = null;
}
// tất cả đồ đang mang theo (bán / tặng / cất thùng được)
function goodsCarried() {
  const out = [];
  for (const id in G.inv) if (G.inv[id] > 0 && goodsInfo(id) && !PARENT_ITEMS[id] && !GROUP_ITEMS[id] && id !== 'xeng' && id !== 'comhop') out.push({ id, n: G.inv[id] });
  for (const id in G.fish) if (G.fish[id] > 0) out.push({ id, n: G.fish[id] });
  for (const id in ITEMS) if (G.bag[id] && id !== 'thehs') out.push({ id, n: 1 });
  return out;
}

/* ---------- Tặng / bán khi đưa đồ cho người khác ---------- */
function tasteOf(key, id) {
  const T = GIFT_TASTE[key]; if (!T) return 'norm';
  const cat = (goodsInfo(id) || {}).cat, hit = a => (a || []).some(k => k === id || k === cat);
  return hit(T.hate) ? 'hate' : hit(T.love) ? 'love' : hit(T.dislike) ? 'dislike' : 'norm';
}
function personOf(T) {
  if (T.kind === 'friend') { const F = FRIENDS[T.id]; return { name: F.name, who: { look: T.id, outfit: friendOutfit(T.id) }, key: T.id, bday: isDate(F.bday, G.day), hearts: hearts(T.id), add: n => addFriend(T.id, n) }; }
  if (T.kind === 'parent') return { name: PNAME[T.id], who: { look: T.id, outfit: T.id === 'mom' && G.map !== 'home' ? 'noapron' : null }, key: T.id, bday: isDate(PARENT_BDAY[T.id], G.day), hearts: Math.min(5, Math.ceil(parentInfo(G.parent).lv / 2)), add: n => addParent(n, '', true) };
  if (T.kind === 'teacher') { const Tc = TEACHERS[T.id]; return { name: Tc.name, who: { look: Tc.look }, key: T.id, bday: false, hearts: teacherLv(T.id), add: n => addTeacher(n, T.id) }; }
  if (T.kind === 'soc') { const S = SOCIETY[T.id]; return { name: S.name, who: { look: S.look }, key: T.id, bday: false, hearts: Math.floor((G.soc[T.id] || 0) / 20), add: n => { G.soc[T.id] = clamp((G.soc[T.id] || 0) + n, 0, 100); } }; }
  return { name: T.name || 'Bạn', who: { look: T.look, outfit: T.outfit }, key: 'o_' + T.id, bday: false, hearts: 1, add: () => { } };
}
const GIFT_LINE = {
  love: ['Ôi! Đúng thứ mình thích nhất luôn! Cảm ơn nhiều nha!', 'Trời ơi, sao biết mình mê cái này? Vui quá đi!'],
  norm: ['Cho mình à? Cảm ơn nhé!', 'Quà hả? Cảm ơn nha, dễ thương ghê.'],
  dislike: ['À… ừ, cảm ơn. Mình không thích cái này lắm…', 'Ờm… cũng được, cảm ơn nhé.'],
  hate: ['Cái này… thật lòng mình ghét lắm. Cầm về đi.', 'Ơ… sao lại tặng mình cái này? Mình không thích chút nào.'],
};
async function giveOrSell(T, id) {
  const I = goodsInfo(id), P = personOf(T);
  const c = await UI.ask(P.name, `<p>Bạn đưa <b>${I.name}</b> cho ${P.name}.</p><p class="dim">Tặng: không lấy tiền, hợp sở thích thì thân hơn (không hợp thì bị trừ)${P.bday ? ' — <b>hôm nay sinh nhật, hiệu ứng gấp đôi</b>' : ''}. Bán: được ${fmtMoney(I.value)}, không thêm thân thiết, có thể bị từ chối.</p>`, ['Tặng', `Bán · ${fmtMoney(I.value)}`, 'Thôi'], { who: P.who });
  if (c === 0) return giftTo(T, id, P, I);
  if (c === 1) return sellTo(T, id, P, I);
}
async function giftTo(T, id, P, I) {
  const key = 'g_' + T.kind + '_' + T.id;
  if (T.kind === 'friend' && grudge(T.id)) return UI.ask(P.name, '<p>“Tớ không nhận quà của đứa mách lẻo đâu.”</p>', ['…'], { who: P.who });
  if (G.daily.gift[key]) return UI.ask(P.name, '<p>“Hôm nay tặng quà rồi mà, giữ lại mà dùng đi!”</p>', ['OK'], { who: P.who });
  const t = T.kind === 'other' ? 'norm' : tasteOf(P.key, id), pts = GIFT_PTS[t] * (P.bday ? 2 : 1);
  G.daily.gift[key] = true; gTake(id); P.add(pts);
  UI._hb = null; UI.hud();
  const line = pick(GIFT_LINE[t]) + (P.bday && pts > 0 ? ' Lại đúng sinh nhật nữa chứ!' : '');
  await UI.ask(P.name, `<p>Bạn tặng <b>${I.name.toLowerCase()}</b>.</p><p>“${line}”</p>${T.kind !== 'other' ? `<p class="dim">${{ love: 'Quà rất thích', norm: 'Quà bình thường', dislike: 'Quà không thích lắm', hate: 'Quà ghét' }[t]}: ${pts > 0 ? '+' : '−'}${Math.abs(pts)} thân thiết${P.bday ? ' (sinh nhật ×2)' : ''}</p>` : ''}`, ['Không có gì!'], { who: P.who });
  if (I.cat === 'school') UI.toast(`Đã tặng ${I.name.toLowerCase()} — muốn có lại thì mua ở TTTM (nhà sách / gian thể thao).`, 'info');
}
async function sellTo(T, id, P, I) {
  const key = 'sv_' + T.kind + '_' + T.id;
  if (G.daily.sold[key]) return UI.ask(P.name, '<p>“Hôm nay mua của cậu một lần rồi, thôi nhé!”</p>', ['Dạ'], { who: P.who });
  const t = T.kind === 'other' ? 'norm' : tasteOf(P.key, id), S = SELL_TO;
  let p = (S[T.kind] || S.other) + S.perHeart * P.hearts + (t === 'love' ? S.love : t === 'dislike' ? S.dislike : t === 'hate' ? S.hate : 0);
  if (T.kind === 'soc' && T.id === 'coba' && ['food', 'drink', 'fish', 'fruit', 'veg'].includes(I.cat)) p += 0.35;        // cô Ba buôn bán, hay mua lại hàng ăn
  G.daily.sold[key] = true;
  if (Math.random() >= clamp(p, 0.05, 0.95)) {
    const no = t === 'hate' ? 'Cái này hả? Cho không mình cũng không lấy đâu.' : t === 'dislike' ? 'Mình không thích cái này lắm, không mua đâu.' : pick(['Thôi, mình không cần cái này đâu. Cậu đem bán chỗ khác nhé.', 'Giá đó hơi cao với mình… thôi khỏi nhé.', 'Mình đang hết tiền rồi, hôm khác nha.']);
    return UI.ask(P.name, `<p>“${no}”</p>`, ['Vậy thôi'], { who: P.who });
  }
  gTake(id); addMoney(I.value); addStat('buonban', 1);
  UI._hb = null; UI.hud();
  await UI.ask(P.name, `<p>“${t === 'love' ? 'Đúng cái mình đang tìm! Mình lấy luôn.' : 'Ừ được, mình lấy cái này.'}”</p><p class="dim">Bán ${I.name.toLowerCase()} được ${fmtMoney(I.value)} · +1 Buôn bán</p>`, ['Cảm ơn nhé!'], { who: P.who });
  if (I.cat === 'school') UI.toast(`Đã bán ${I.name.toLowerCase()} — cần thì phải mua lại ở TTTM (nhà sách / gian thể thao).`, 'bad');
}

/* ---------- Vườn trước nhà: đặt chậu, thùng chứa ở chỗ trống ---------- */
const YARD = { x0: 8, x1: 270, y0: 22, y1: 156, door: [76, 120, 40, 40] };   // vùng sân vườn trên bản đồ khu phố · tránh lối vào cửa nhà
const inYard = (x, y) => G.map === 'town' && x >= YARD.x0 && x <= YARD.x1 && y >= YARD.y0 && y <= YARD.y1;
function yardSync() {
  const m = MAPS.town; if (!m || !G) return;
  m.objs = m.objs.filter(o => !o.yard);
  for (const it of (G.yard && G.yard.items) || []) {
    if (it.k === 'pot') addObj(m, { yard: it.uid, s: 'potE', dyn: () => potState(it).key, x: it.x - 8, y: it.y - 20, sol: [3, 15, 10, 6], ir: [-4, -2, 24, 26], label: () => potLabel(it), act: () => potAct(it) });
    else addObj(m, { yard: it.uid, s: 'chestS', x: it.x - 9, y: it.y - 14, sol: [1, 6, 16, 9], ir: [-4, -2, 26, 20], label: () => `Thùng chứa (${chestUsed(it)}/${FARM.chestCap}) — cất / lấy đồ`, act: () => chestUI(it) });
  }
}
function placeSpot() {                                         // chỗ đặt: ngay trước mặt theo hướng nhìn
  const d = [[0, 14], [-14, 0], [14, 0], [0, -14]][G.dir] || [0, 14];
  return [Math.round(G.x + d[0]), Math.round(G.y + d[1])];
}
function canPlace(x, y) {
  if (!inYard(x, y)) return false;
  const [a, b, w, h] = YARD.door; if (x > a && x < a + w && y > b && y < b + h) return false;
  for (const it of G.yard.items) if (Math.abs(it.x - x) < 16 && Math.abs(it.y - y) < 14) return false;
  for (const [dx, dy] of [[-6, 0], [6, 0], [0, -4], [0, 2]]) if (blocked(MAPS.town, x + dx, y + dy)) return false;
  return Math.abs(G.x - x) > 6 || Math.abs(G.y - y) > 6;
}
async function placeHeld(id) {
  const [x, y] = placeSpot();
  if (G.map !== 'town' || !inYard(G.x, G.y)) return UI.toast(`${id === 'chau' ? 'Chậu' : 'Thùng chứa'} chỉ đặt được ngoài vườn trước nhà mình.`, 'info');
  if (!canPlace(x, y)) return UI.toast('Chỗ này vướng rồi — quay sang chỗ trống khác rồi đặt nhé.', 'info');
  const c = await meSay(`<p>Đặt ${id === 'chau' ? 'chậu trồng cây' : 'thùng chứa'} ở ngay trước mặt?</p>`, ['Đặt ở đây', 'Thôi']);
  if (c !== 0) return;
  gTake(id); G.yard.items.push(id === 'chau' ? { uid: ++G.yard.seq, k: 'pot', x, y, crop: null } : { uid: ++G.yard.seq, k: 'chest', x, y, items: {} });
  yardSync(); UI._hb = null; UI.hud();
  UI.toast(id === 'chau' ? 'Đã đặt chậu. Bấm vào chậu để gieo hạt (mua hạt ở cửa hàng hoa trong công viên).' : 'Đã đặt thùng chứa. Bấm vào để cất / lấy đồ.', 'good');
}

/* ---------- Chậu cây: gieo hạt · tưới · lớn dần · héo · thu hoạch ---------- */
function potState(it) {
  const C = it.crop && CROPS[it.crop];
  if (!C) return { key: potKey(null, 0, false, false), stage: -1 };
  const need = it.harv ? C.regrow : C.grow, ready = !it.dead && it.grow >= need, wet = it.last === G.day;
  const stage = it.dead ? 0 : ready ? 3 : it.grow >= need * 0.6 || it.harv ? 2 : it.grow >= 1 ? 1 : 0;
  return { key: potKey(it.crop, stage, it.dead, wet), stage, ready, need };
}
function potLabel(it) {
  const C = it.crop && CROPS[it.crop], S = potState(it);
  if (!C) return 'Chậu trống — gieo hạt';
  if (it.dead) return `${C.name} đã héo (quên tưới 3 ngày) — dọn đi`;
  if (S.ready) return `${C.name} — thu hoạch!`;
  return `${C.name} · ${it.grow}/${S.need} ngày · ${it.last === G.day ? 'đã tưới hôm nay' : 'cần tưới nước'}`;
}
async function potAct(it) {
  if (RT.lock) return;
  const C = it.crop && CROPS[it.crop], S = potState(it);
  if (!C) {
    const seeds = Object.keys(CROPS).filter(k => G.inv['h_' + k] > 0);
    const opts = seeds.map(k => `Gieo hạt ${CROPS[k].name.toLowerCase()} (còn ${G.inv['h_' + k]})`).concat('Cất chậu vào túi', 'Thôi');
    const c = await meSay(seeds.length ? '<p>Gieo hạt gì vào chậu này?</p>' : '<p>Chậu trống. Chưa có hạt giống nào — mua ở cửa hàng hoa trong công viên khu nhà.</p>', opts);
    if (c >= 0 && c < seeds.length) {
      const k = seeds[c]; G.inv['h_' + k]--; Object.assign(it, { crop: k, grow: 0, last: -9, planted: G.day, harv: 0, dead: false });
      await waterCut(it, true); UI._hb = null; UI.hud();
      return UI.toast(`Đã gieo ${CROPS[k].name.toLowerCase()}. Nhớ tưới nước mỗi ngày — bỏ 3 ngày không tưới là cây héo.`, 'good');
    }
    if (c === seeds.length) { G.yard.items = G.yard.items.filter(x => x !== it); gAdd('chau'); yardSync(); UI._hb = null; UI.hud(); UI.toast('Đã cất chậu vào túi.'); }
    return;
  }
  if (it.dead) { const c = await meSay(`<p>Cây ${C.name.toLowerCase()} héo khô rồi vì mấy ngày không tưới…</p>`, ['Dọn cây héo', 'Thôi']); if (c === 0) { it.crop = null; yardSync(); } return; }
  if (S.ready) return harvest(it);
  if (it.last === G.day) return UI.toast(`${C.name} hôm nay tưới rồi. Còn ${S.need - it.grow} ngày nữa.`, 'info');
  if (!G.owned.binhtuoi) return UI.toast('Chưa có bình tưới — mua hạt giống ở cửa hàng hoa sẽ được tặng một bình.', 'bad');
  if (G.stamina < FARM.waterStam) return UI.toast('Mệt quá, không tưới nổi.', 'bad');
  await waterCut(it); useStam(FARM.waterStam); advanceTime(5); it.last = G.day; UI.hud();
  UI.toast(`Đã tưới ${C.name.toLowerCase()} (−${FARM.waterStam} thể lực).`, 'good');
}
// tưới nước: nhìn về phía chậu, bình tưới nghiêng, nước nhỏ giọt
async function waterCut(it, sow) {
  RT.lock = true;
  const dir = Math.abs(it.x - G.x) > Math.abs(it.y - G.y) ? (it.x < G.x ? 1 : 2) : (it.y < G.y ? 3 : 0);
  G.dir = dir; it.last = sow ? -9 : it.last;
  await playCut({ inPlace: true, bars: false, steps: [{ wait: UI._fast ? 10 : 1300 }], props: [now => {
    const t = (now % 1300) / 1300, cx0 = it.x + (it.x < G.x ? 6 : -6), top = it.y - 26;
    if (sow) { for (let i = 0; i < 3; i++) wRect('#8a6a3a', it.x - 3 + i * 3, it.y - 14 + ((now / 120 + i * 3) % 6), 1, 1); return; }
    wRect('#3f8f3a', cx0 - 4, top, 8, 6); wRect('#5fae4a', cx0 - 4, top, 8, 2); wRect('#3f8f3a', it.x < G.x ? cx0 - 8 : cx0 + 4, top + 1, 4, 2);
    for (let i = 0; i < 4; i++) { const k = (t + i / 4) % 1; wRect('#7fc1ee', it.x - 3 + i * 2, top + 6 + k * 12, 1, 2); }
  }] });
  if (sow) it.last = -9;
  RT.lock = false;
}
async function harvest(it) {
  const C = CROPS[it.crop], n = C.yield;
  RT.lock = true;
  await playCut({ inPlace: true, bars: false, steps: [{ hop: 'me' }, { wait: UI._fast ? 10 : 500 }] });
  RT.lock = false;
  gAdd('c_' + it.crop, n); addStat('nongsan', C.fp); G.farmLog = G.farmLog || {}; G.farmLog[it.crop] = (G.farmLog[it.crop] || 0) + n;
  if (C.kind === 'hoa') it.crop = null; else { it.harv = (it.harv || 0) + 1; it.grow = 0; }
  yardSync(); UI._hb = null; UI.hud();
  UI.toast(`Thu hoạch ${n > 1 ? n + ' ' : ''}${C.name.toLowerCase()}! +${C.fp} Nông sản${C.kind === 'qua' ? ` · lứa sau ${C.regrow} ngày nữa` : ''}.`, 'good');
}
// đầu ngày mới: cây được tưới hôm qua thì lớn thêm 1 ngày; 3 ngày liền không tưới thì héo
function farmNewDay() {
  for (const it of (G.yard && G.yard.items) || []) {
    if (it.k !== 'pot' || !it.crop || it.dead) continue;
    if (it.last === G.day - 1) it.grow++;
    if (G.day - Math.max(it.last, it.planted) >= FARM.wither) it.dead = true;
  }
  yardSync();
}

/* ---------- Thùng chứa ngoài vườn (tối đa 30 món) ---------- */
const chestUsed = it => Object.values(it.items).reduce((a, b) => a + b, 0);
function chestUI(it) {
  UI.panel('Thùng chứa ngoài vườn', () => {
    const used = chestUsed(it), carried = goodsCarried().filter(g => !ITEMS[g.id]);
    let h = `<p>Đã dùng <b>${used}/${FARM.chestCap}</b> chỗ. Đồ dùng học tập (sách, đồng phục…) thì để ở tủ sách trong phòng.</p><h4>Trong thùng</h4><div class="rows">`;
    const inn = Object.keys(it.items).filter(k => it.items[k] > 0);
    h += inn.length ? inn.map(k => `<div class="rowi"><span><img class="ico" src="${itemIcon(k)}" alt=""><b>${goodsInfo(k).name}</b> ×${it.items[k]}</span><button class="btn sm" data-act="out" data-id="${k}">Lấy 1</button><button class="btn sm ghost" data-act="outall" data-id="${k}">Lấy hết</button></div>`).join('') : '<span class="dim">Thùng trống.</span>';
    h += '</div><h4>Đang mang theo</h4><div class="rows">';
    h += carried.length ? carried.map(g => `<div class="rowi"><span><img class="ico" src="${itemIcon(g.id)}" alt=""><b>${goodsInfo(g.id).name}</b> ×${g.n}</span><button class="btn sm" data-act="in" data-id="${g.id}" ${used >= FARM.chestCap ? 'disabled' : ''}>Cất 1</button><button class="btn sm ghost" data-act="inall" data-id="${g.id}" ${used >= FARM.chestCap ? 'disabled' : ''}>Cất hết</button></div>`).join('') : '<span class="dim">Không mang theo gì cất được.</span>';
    return h + '</div><div class="btns"><button class="btn ghost" data-act="pick">Cất thùng vào túi (thùng phải trống)</button><button class="btn primary" data-close="1">Xong</button></div>';
  }, {
    in: d => { if (chestUsed(it) >= FARM.chestCap || !gCount(d.id)) return; gTake(d.id); it.items[d.id] = (it.items[d.id] || 0) + 1; },
    inall: d => { while (chestUsed(it) < FARM.chestCap && gCount(d.id)) { gTake(d.id); it.items[d.id] = (it.items[d.id] || 0) + 1; } },
    out: d => { if (!it.items[d.id]) return; it.items[d.id]--; gAdd(d.id); },
    outall: d => { const n = it.items[d.id] || 0; if (n) { it.items[d.id] = 0; gAdd(d.id, n); } },
    pick: () => { if (chestUsed(it)) return UI.toast('Lấy hết đồ ra trước đã.', 'info'); G.yard.items = G.yard.items.filter(x => x !== it); gAdd('thung'); yardSync(); UI.close(-1); UI.toast('Đã cất thùng chứa vào túi.'); },
  });
}

/* ---------- Thú cưng: mua ở cửa hàng, hôm sau giao tới nhà ---------- */
function petNewDay() {
  if (G.pet && !G.pet.home && G.day >= G.pet.day) { G.pet.home = true; RT.morning.push(`Cửa hàng thú cưng đã giao ${PETS[G.pet.kind].name.toLowerCase()} tới nhà! Bé tên là ${G.pet.name}, đang chạy quanh phòng khách đó.`); }
}
ACT.pet = async () => {
  if (!G.pet) return;
  const P = PETS[G.pet.kind], n = G.pet.name;
  const c = await meSay(`<p>${n} ${G.pet.kind === 'dog' ? 'vẫy đuôi rối rít' : 'cọ cọ vào chân, kêu meo meo'}.</p>`, [`Vuốt ve ${n}`, 'Chơi đùa một lát', 'Thôi']);
  if (c === 0) { if (!G.daily.petted) { G.daily.petted = true; gainStam(4); UI.toast(`${n} sướng lắm, bạn cũng thấy khoẻ khoắn hơn (+4 thể lực).`, 'good'); } else UI.toast(`${n} lim dim ngủ trong lòng bạn.`); }
  else if (c === 1) await activity(`Đang chơi với ${n}…`, 15, () => { if (!G.daily.petPlay) { G.daily.petPlay = true; gainStam(6); } });
};

/* ---------- Cửa hàng hoa, thú cưng, đồ câu ---------- */
const closedTet = () => !!G && cal(G.day).season === 2 && cal(G.day).dos === 1;   // mùng 1 Tết: cửa hàng, dịch vụ, văn phòng đều nghỉ
const tetShut = name => { if (!closedTet()) return false; UI.say(name, 'Cửa đóng then cài, treo tấm biển đỏ: “Nghỉ Tết — mùng 2 mở cửa lại. Chúc mừng năm mới!”'); return true; };
ACT.flowerShop = () => {
  if (tetShut('Cửa hàng hoa Hồng Nhung')) return;
  if (!inWin(G.time, 420, 1200)) return UI.say('Cửa hàng hoa Hồng Nhung', 'Cửa hàng đã đóng.<p class="dim">Mở cửa 07:00–20:00.</p>');
  UI.store('Cửa hàng hoa Hồng Nhung', '“Chào em! Mua hạt về trồng hả? Mua hạt lần đầu chị tặng luôn bình tưới nhé!”', FLOWER_SHOP, it => {
    if (G.money < it.price) return UI.toast('Không đủ tiền.', 'bad');
    addMoney(-it.price, true); gAdd(it.id);
    let note = '';
    if (it.id.startsWith('h_') && !G.owned.binhtuoi) { G.owned.binhtuoi = true; note = ' · được tặng bình tưới'; }
    UI.toast(`Đã mua ${it.name.toLowerCase()} (−${fmtMoney(it.price)})${note}.`, 'good'); UI.hud();
  }, () => '<p class="dim">Đặt chậu ngoài vườn trước nhà (cầm chậu lên, bấm vào chỗ trống), gieo hạt rồi tưới mỗi ngày. Hoa nở nhanh, thu 1 lần; cây quả thu được nhiều lứa. Hoa, quả bán ở chợ phố Bờ Đông.</p>');
};
ACT.petShop = () => {
  if (tetShut('Cửa hàng thú cưng Bông Gòn')) return;
  if (!inWin(G.time, 480, 1140)) return UI.say('Cửa hàng thú cưng Bông Gòn', 'Cửa hàng đã đóng.<p class="dim">Mở cửa 08:00–19:00.</p>');
  const items = () => Object.keys(PETS).map(k => ({ id: 'p_' + k, kind: k, name: PETS[k].name, price: PETS[k].price, desc: `Hôm sau cửa hàng giao tận nhà. Mỗi ngày vuốt ve, chơi đùa được thêm thể lực.`, owned: !!G.pet }));
  UI.store('Cửa hàng thú cưng Bông Gòn', G.pet ? `“${G.pet.name} ở nhà em khoẻ chứ? Nhà mình nuôi một bé là đủ rồi.”` : '“Em muốn nuôi bé chó hay bé mèo nào?”', items, it => {
    if (G.pet) return UI.toast('Nhà mình đã có thú cưng rồi.');
    if (G.money < it.price) return UI.toast('Không đủ tiền.', 'bad');
    addMoney(-it.price, true); G.pet = { kind: it.kind, name: PETS[it.kind].pet, day: G.day + 1, home: false };
    UI.toast(`Đã mua ${it.name.toLowerCase()}! Ngày mai cửa hàng giao tới nhà.`, 'good'); UI.hud(); UI.refresh();
  });
};
ACT.tackleShop = () => {
  if (tetShut('Sạp đồ câu Biển Xanh')) return;
  if (!inWin(G.time, 360, 1140)) return UI.say('Sạp đồ câu Biển Xanh', 'Sạp đã dọn hàng.<p class="dim">Mở 06:00–19:00.</p>');
  const items = () => TACKLE_SHOP().map(it => Object.assign({}, it, { owned: !!(it.own && G.owned[it.own]) }));
  UI.store('Sạp đồ câu Biển Xanh', '“Câu biển phải có cần tốt, mồi ngon! Cá ngừ đại dương chỉ có mùa hè, sáng sớm thôi nhé.”', items, it => {
    if (it.own && G.owned[it.own]) return UI.toast('Bạn có rồi.');
    if (G.money < it.price) return UI.toast('Không đủ tiền.', 'bad');
    addMoney(-it.price, true); if (it.own) G.owned[it.own] = true; else gAdd(it.id, it.n || 1);
    UI.toast(`Đã mua ${it.name.toLowerCase()} (−${fmtMoney(it.price)}).`, 'good'); UI.hud();
  }, () => `<p class="dim">Chỗ câu: bến sông dưới phố Hoa Phượng · ao trong công viên khu nhà · mép nước bãi biển này. Mỗi nơi, mỗi mùa, mỗi giờ có loài cá khác nhau — xem trong Bộ sưu tập.</p>`);
};

/* ---------- Chợ phố Bờ Đông: mua rau, cá, đồ ăn · bán lại hoa, quả, cá, tranh ---------- */
const MARKET_NAME = { rau: 'Hàng rau quả', ca: 'Hàng cá', an: 'Hàng ăn sáng' };
ACT.marketStall = k => {
  if (!inWin(G.time, 300, 1080)) return UI.say(MARKET_NAME[k], 'Chợ đã tan.<p class="dim">Chợ họp 05:00–18:00.</p>');
  const items = () => MARKET[k].map(it => Object.assign({}, it));
  UI.store(MARKET_NAME[k], pick(['“Mua gì đi cháu, hàng tươi lắm!”', '“Cháu lấy gì? Cô bớt cho!”']), items, async it => {
    if (G.money < it.price) return UI.toast('Không đủ tiền.', 'bad');
    const pt = G.tasks.active.find(t => t.pt && t.step === 0 && PARENT_TASKS[t.id].market === k);
    if (pt) return pickParentItem(pt, ptDef(pt.id), ptDef(pt.id).steps[0]);
    if (it.food) return buyFood(it.id, it.price, it.name);
    addMoney(-it.price, true); gAdd(it.id); UI.toast(`Đã mua ${it.name.toLowerCase()} (−${fmtMoney(it.price)}).`, 'good'); UI.hud();
  }, () => { const pt = G.tasks.active.find(t => t.pt && t.step === 0 && PARENT_TASKS[t.id].market === k); return pt ? `<p class="okbox">${PARENT_TASKS[pt.id].name}: bấm mua bất kỳ món nào để mua giúp ${PNAME[PARENT_TASKS[pt.id].who].toLowerCase()}.</p>` : ''; });
};
const MARKET_BUY = ['flower', 'fruit', 'fish', 'veg', 'art'];
ACT.marketBuyer = () => {
  if (!inWin(G.time, 300, 1080)) return UI.say('Quầy thu mua', 'Chợ đã tan.<p class="dim">Chợ họp 05:00–18:00.</p>');
  UI.panel('Quầy thu mua · chợ Bờ Đông', () => {
    const L = goodsCarried().filter(g => MARKET_BUY.includes(goodsInfo(g.id).cat));
    let h = '<p>“Hoa, quả trồng được, cá câu được, tranh vẽ — mang ra đây cô mua hết!”</p><div class="rows">';
    h += L.length ? L.map(g => { const I = goodsInfo(g.id); return `<div class="rowi"><span><img class="ico" src="${itemIcon(g.id)}" alt=""><b>${I.name}</b> ×${g.n} <small>${fmtMoney(I.value)} / món</small></span><button class="btn sm" data-act="one" data-id="${g.id}">Bán 1</button><button class="btn sm ghost" data-act="all" data-id="${g.id}">Bán hết · ${fmtMoney(I.value * g.n)}</button></div>`; }).join('') : '<span class="dim">Bạn không mang theo hoa, quả, cá hay tranh nào.</span>';
    return h + '</div><p class="dim">Mỗi món bán được cộng tiền ngay và điểm Buôn bán.</p><div class="btns"><button class="btn primary" data-close="1">Xong</button></div>';
  }, { one: d => marketSell(d.id, 1), all: d => marketSell(d.id, gCount(d.id)) });
};
function marketSell(id, n) {
  const I = goodsInfo(id); n = Math.min(n, gCount(id)); if (!n) return;
  gTake(id, n); addMoney(I.value * n);
  const pts = Math.min(n, Math.max(0, 8 - (G.daily.mkPts || 0))); if (pts) { G.daily.mkPts = (G.daily.mkPts || 0) + pts; addStat('buonban', pts); }
  UI.toast(`Bán ${n} ${I.name.toLowerCase()} được ${fmtMoney(I.value * n)}${pts ? ` · +${pts} Buôn bán` : ''}.`, 'good'); UI._hb = null; UI.hud();
}

/* ---------- Bản đồ: cửa hàng mới, chợ, chỗ câu cá, vườn, thú cưng ---------- */
function buildEcoPlaces() {
  const t = MAPS.town;
  // dải công viên khu nhà: dọn bớt cây để dựng cửa hàng hoa, thú cưng
  t.objs = t.objs.filter(o => !(o.y > 270 && ((o.x > 196 && o.x < 300) || (o.x > 420 && o.x < 545))));
  addObj(t, { door: true, s: 'flowershop', x: 200, y: 300, sol: [1, 24, 96, 53], label: () => 'Cửa hàng hoa Hồng Nhung — chậu, hạt giống', act: () => ACT.flowerShop() });
  addObj(t, { door: true, s: 'petshop', x: 440, y: 300, sol: [1, 24, 96, 53], label: () => 'Cửa hàng thú cưng Bông Gòn — chó, mèo', act: () => ACT.petShop() });
  addObj(t, { s: 'fishspot', x: 150, y: 352, sol: [2, 8, 9, 9], ir: [-14, 0, 30, 22], label: () => fishLabel('ho'), act: () => ACT.fish('ho') });   // bờ ao công viên
  // thú cưng chạy quanh phòng khách
  NPCS.push({ id: 'pet', name: 'Thú cưng', look: 'boy', map: 'home', x: 320, y: 170, dir: 1, wander: 60, critter: n => `${G.pet.kind}${n.cdir === 2 ? '' : 'L'}${n.walk >= 0 ? Math.floor(performance.now() / 160) % 2 : 0}`, vis: () => !!(G.pet && G.pet.home), label: () => `${G.pet.name} — ${PETS[G.pet.kind].name.toLowerCase()} nhà mình`, act: () => ACT.pet() });
  // biển: sạp đồ câu + chỗ câu cá ở mép nước
  const b = MAPS.bien;
  addObj(b, { door: true, s: 'tackle', x: 270, y: 104, sol: [1, 30, 62, 16], label: () => 'Sạp đồ câu Biển Xanh — cần câu, mồi', act: () => ACT.tackleShop() });
  addObj(b, { s: 'fishspot', x: 196, y: 282, sol: [2, 8, 9, 9], ir: [-14, 0, 30, 22], label: () => fishLabel('bien'), act: () => ACT.fish('bien') });
  // chợ phố Bờ Đông
  const d = MAPS.dong;
  const mdh = SPR.marketB2.height - 82;                               // nhà chợ cao hơn: giữ chân nhà và cửa ở chỗ cũ
  addObj(d, { door: true, s: 'marketB2', x: 814, y: 46 - mdh, sol: [1, 30 + mdh, 136, 50], label: () => 'Chợ Bờ Đông — mua rau, cá, đồ ăn · bán hoa, quả, cá, tranh', act: () => (tetShut('Chợ Bờ Đông') ? null : goPlace('cho', MAPS.cho.entry[0], MAPS.cho.entry[1], 3, 0)) });
  d.labels.push({ x: 883, y: 46 - mdh + 44.5, text: 'CHỢ BỜ ĐÔNG', size: 7, col: '#ffe066', maxw: 70 });
  const m = roomBase('cho', 'Chợ Bờ Đông', '#efe2c4', '#b5503a', 'mtile', 22, 13);
  roomExit(m, { map: 'dong', x: 884, y: 140, dir: 0 });
  // mỗi sạp một kiểu theo mặt hàng, biển treo trên tường ghi rõ bán gì
  const ST = [['rau', 'mk_rau', 20, 38, 'vendor', 'RAU CỦ', '#3f8f3a'], ['ca', 'mk_ca', 102, 38, 'clerk', 'CÁ TƯƠI', '#3b82c4'], ['an', 'mk_an', 184, 38, 'c2', 'ĂN UỐNG', '#e98f4a'], ['mua', 'mk_mua', 266, 38, 'c4', 'THU MUA', '#d9342b']];
  for (const [k, spr, a, y, look, sign, col] of ST) {
    R(m.x, '#5a3a24', a + 14, 6, 38, 14); R(m.x, col, a + 15, 7, 36, 12); R(m.x, shade(col, 30), a + 15, 7, 36, 1); R(m.x, '#3a3040', a + 20, 2, 1, 4); R(m.x, '#3a3040', a + 45, 2, 1, 4);
    m.labels.push({ x: a + 33, y: 13.5, text: sign, size: 6, col: '#fffaf0', maxw: 34 });
    addObj(m, { s: 'mk_bulb', x: a + 4, y: 22, base: 0 }); addObj(m, { s: 'mk_bulb', x: a + 56, y: 22, base: 0 });
    addObj(m, { s: spr, x: a, y, sol: [0, 22, 66, 18], label: () => (k === 'mua' ? 'Quầy thu mua — bán hoa, quả, cá, tranh' : `${MARKET_NAME[k]} — xem hàng`), act: () => (k === 'mua' ? ACT.marketBuyer() : ACT.marketStall(k)) });
    NPCS.push({ id: 'mk_' + k, name: k === 'mua' ? 'Cô thu mua' : 'Người bán hàng', look, outfit: look === 'c2' || look === 'c4' ? () => 'cas_ngan' : undefined, map: 'cho', x: a + 33, y: y + 16, dir: 0, label: () => (k === 'mua' ? 'Cô thu mua — bán hoa, quả, cá, tranh' : `${MARKET_NAME[k]} — mua hàng`), act: () => (k === 'mua' ? ACT.marketBuyer() : ACT.marketStall(k)) });
  }
  // hàng giữa: sạp hoa, sạp đồ khô (bày cho có không khí chợ, người bán chào mời)
  for (const [spr, a, b2, look, nm, line] of [['mk_hoa', 120, 128, 'ph5', 'Cô bán hoa', 'Hoa mới về sáng nay, cắm bàn thờ hay tặng người thương đều đẹp cháu ạ!'], ['mk_kho', 200, 128, 'ph2', 'Chú bán đồ khô', 'Gạo tám thơm, đậu xanh, lạc, nấm hương… nhà cháu cần gì mai bảo mẹ ra chú để cho.']]) {
    addObj(m, { s: spr, x: a, y: b2, sol: [0, 20, 50, 10] });
    NPCS.push({ id: 'mk_' + spr, name: nm, look, map: 'cho', x: a + 24, y: b2 + 12, dir: 0, vis: () => inWin(G.time, 300, 1080), label: () => `${nm} — chào hỏi`, act: () => UI.ask(nm, `<p>“${line}”</p><p class="dim">Muốn mua thì sang sạp rau củ, cá tươi, hàng ăn ở dãy trên; bán hàng thì ra quầy thu mua.</p>`, ['Dạ, cháu cảm ơn'], { who: { look } }) });
  }
  // sọt nhựa, thúng hàng xếp dọc tường, rãnh thoát nước giữa lối đi
  for (const [s2, a, b2] of [['mk_crate', 20, 176], ['mk_crate', 20, 164], ['mk_crate', 36, 176], ['mk_basket', 90, 178], ['mk_basket', 106, 180], ['mk_crate', 300, 120], ['mk_basket', 312, 140]]) addObj(m, { s: s2, x: a, y: b2, sol: [1, 4, 13, 7] });
  for (let i = 1; i < 21; i++) R(m.x, '#9e957f', i * 16, 104, 16, 2);
  for (const id in PARENT_TASKS) { const P = PARENT_TASKS[id], s = P.pick; if (s.map !== 'cho') continue;     // việc bố mẹ nhờ mua ở chợ (bản đồ chợ dựng sau buildTaskSpots)
    addObj(m, { s: 'blank', x: s.x, y: s.y, ir: [-14, -20, 28, 30], vis: () => !!taskAt(id, 0), label: () => `Việc ${PNAME[P.who].toLowerCase()} nhờ: ${s.do.toLowerCase()}`, act: () => doTaskStep(id, 0) }); }
  for (const [look, a, b2] of [['x2', 90, 100], ['ph3', 180, 178], ['ph4', 290, 118]]) NPCS.push({ id: 'mk_k' + a, name: 'Người đi chợ', look, outfit: look === 'x2' ? () => 'cas_vy' : undefined, map: 'cho', x: a, y: b2, dir: 3, wander: 30, vis: () => inWin(G.time, 300, 1080) });
}
