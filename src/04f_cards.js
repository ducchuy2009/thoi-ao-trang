'use strict';
/* ============================================================
 *  04f. ĐẤU THẺ CẦU THỦ (chiến thuật)
 *  - Đội hình 11 người đủ vị trí, tổng lương không vượt trần (SQUAD)
 *  - Trận 5 lượt (MATCH): lượt đầu oẳn tù xì giành quyền ra lệnh; người ra lệnh chọn chỉ số + số lá (3–5);
 *    hai bên chọn đúng số lá đó; cùng CLB / quốc tịch thì mỗi cầu thủ được cộng thêm; tổng cao hơn thắng lượt;
 *    người thua lượt được ra lệnh lượt sau; ai thắng 3 lượt trước thắng trận
 *  - Thắng: mở album người thua, chọn 1 thẻ · Thua: đối thủ lấy 1 thẻ trong đội hình của mình
 *  - Tụ đấu thẻ ngoài sân: lần đầu anh Phong hướng dẫn, cho mượn bộ thẻ, đấu thử, rồi tặng 11 thẻ
 * ============================================================ */
const POS_SHORT = { tm: 'TM', hv: 'HV', tv: 'TV', td: 'TĐ' };
const cardsOf = ids => ids.map(id => CARD_BY_ID[id]).filter(Boolean);
const statName = k => CARD_STATS.find(s => s[0] === k)[1];
const nickOf = c => { const m = c.name.match(/^(.*?)\s*“(.*)”$/); return m ? [m[1], m[2]] : [c.name, '']; };
// Cộng chỉ số nhờ “màu áo”: mỗi nhóm k cầu thủ cùng CLB (hoặc cùng quốc tịch) → mỗi người +(k − 1)
function teamBonus(cards) {
  const b = {}, groups = [];
  for (const c of cards) b[c.id] = 0;
  for (const key of ['club', 'nat']) {
    const g = {}; for (const c of cards) if (c[key]) (g[c[key]] = g[c[key]] || []).push(c);
    for (const k in g) if (g[k].length >= 2) { groups.push({ key, k, n: g[k].length }); for (const c of g[k]) b[c.id] += g[k].length - 1; }
  }
  return { b, groups };
}
const setTotal = (cards, stat) => { const { b } = teamBonus(cards); return cards.reduce((s, c) => s + c[stat] + b[c.id], 0); };
// Mọi cách chọn n lá trong bộ, xếp theo tổng chỉ số (đã cộng màu áo) giảm dần
function bestSets(cards, stat, n) {
  const out = [], pick = [], rec = i => {
    if (pick.length === n) { out.push({ set: pick.slice(), v: setTotal(pick, stat) }); return; }
    for (let j = i; j <= cards.length - (n - pick.length); j++) { pick.push(cards[j]); rec(j + 1); pick.pop(); }
  };
  rec(0); return out.sort((a, b) => b.v - a.v);
}

/* ---------- đội hình ---------- */
const squadSal = ids => cardsOf(ids).reduce((s, c) => s + cardSal(c), 0);
function squadIssues(ids) {
  const cs = cardsOf(ids), cnt = { tm: 0, hv: 0, tv: 0, td: 0 }, out = [];
  for (const c of cs) cnt[c.pos]++;
  if (new Set(ids).size !== ids.length) out.push('Một cầu thủ chỉ được chọn một lần');
  if (cs.length !== SQUAD.size) out.push(`Cần đúng ${SQUAD.size} cầu thủ (đang có ${cs.length})`);
  for (const p in SQUAD.need) { const [lo, hi] = SQUAD.need[p]; if (cnt[p] < lo) out.push(`Thiếu ${CARD_POS[p].toLowerCase()} (cần ${lo === hi ? 'đúng' : 'ít nhất'} ${lo})`); else if (cnt[p] > hi) out.push(`Chỉ được ${hi} ${CARD_POS[p].toLowerCase()}`); }
  const sal = squadSal(ids); if (sal > SQUAD.cap) out.push(`Vượt trần lương: ${sal}/${SQUAD.cap}`);
  return out;
}
const squadOk = () => !!G.squad && G.squad.every(id => G.cards[id] > 0) && squadIssues(G.squad).length === 0;
// Xếp đội hình tự động từ một kho thẻ: mạnh nhất có thể mà vẫn đủ vị trí, không vượt trần lương
function autoSquad(pool) {
  const val = cardPower, by = p => pool.filter(c => c.pos === p).sort((a, b) => val(b) - val(a));
  if (by('tm').length < 1 || by('hv').length < 2 || by('tv').length < 2 || by('td').length < 1 || pool.length < SQUAD.size) return null;
  let sq = [by('tm')[0], ...by('hv').slice(0, 2), ...by('tv').slice(0, 2), by('td')[0]];
  const rest = pool.filter(c => c.pos !== 'tm' && !sq.includes(c)).sort((a, b) => val(b) - val(a));
  sq = sq.concat(rest.slice(0, SQUAD.size - sq.length));
  for (let guard = 0; guard < 60 && squadSal(sq.map(c => c.id)) > SQUAD.cap; guard++) {
    // đổi cầu thủ lương cao nhất lấy người rẻ hơn (cùng vị trí, hoặc vị trí khác nếu vẫn đủ người)
    const cur = sq.slice().sort((a, b) => cardSal(b) - cardSal(a)); let done = false;
    for (const out of cur) {
      const alt = pool.filter(c => !sq.includes(c) && cardSal(c) < cardSal(out) && (c.pos === out.pos || (out.pos !== 'tm' && c.pos !== 'tm' && squadIssues(sq.filter(x => x !== out).concat(c).map(x => x.id)).every(t => /trần lương/.test(t))))).sort((a, b) => val(b) - val(a))[0];
      if (alt) { sq[sq.indexOf(out)] = alt; done = true; break; }
    }
    if (!done) return null;
  }
  return squadIssues(sq.map(c => c.id)).length ? null : sq.map(c => c.id);
}
// Bộ thẻ ngẫu nhiên theo trình (đối thủ, bộ cho mượn, bộ quà): 1 TM · 3 HV · 4 TV · 3 TĐ, không vượt trần lương
function genDeck(tier, seed) {
  const r = typeof seed === 'number' ? mulberry(seed) : seed ? mulberry([...String(seed)].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) | 0, 7)) : Math.random;
  const w = DUEL_TIER[tier] || DUEL_TIER.lop, tot = w.reduce((a, b) => a + b, 0), deck = [];
  const rar = () => { let x = r() * tot, k = 0; for (; k < 3; k++) { x -= w[k]; if (x < 0) break; } return k; };
  for (const [p, n] of [['tm', 1], ['hv', 3], ['tv', 4], ['td', 3]]) for (let i = 0; i < n; i++) {
    let c = null;
    for (let t = 0; t < 12 && !c; t++) { const k = rar(), pool = CARDS.filter(x => x.pos === p && x.r === k && !deck.includes(x)); if (pool.length) c = pool[Math.floor(r() * pool.length)]; }
    if (!c) { const pool = CARDS.filter(x => x.pos === p && !deck.includes(x)); c = pool[Math.floor(r() * pool.length)]; }
    deck.push(c);
  }
  for (let g = 0; g < 40 && squadSal(deck.map(c => c.id)) > SQUAD.cap; g++) {      // quá trần: thay người đắt nhất bằng người rẻ hơn cùng vị trí
    const out = deck.slice().sort((a, b) => cardSal(b) - cardSal(a))[0], alt = CARDS.filter(x => x.pos === out.pos && !deck.includes(x) && cardSal(x) < cardSal(out));
    if (!alt.length) break; deck[deck.indexOf(out)] = alt[Math.floor(r() * alt.length)];
  }
  return deck.map(c => c.id);
}

/* ---------- giao diện thẻ nhỏ ---------- */
function ctile(c, o) {
  o = o || {};
  const R = CARD_RARITY[c.r], [n1, n2] = nickOf(c), bo = o.bonus || 0;
  const st = CARD_STATS.map(([k, , s]) => `<span class="${o.stat === k ? 'hl' : ''}">${s} <b>${c[k]}${o.stat === k && bo ? `<i>+${bo}</i>` : ''}</b></span>`).join('');
  return `<${o.act ? 'button' : 'div'} class="ct ${o.on ? 'on' : ''} ${o.dim ? 'dim' : ''}" ${o.act ? `data-act="${o.act}" data-id="${c.id}"` : ''} style="--rc:${R.col}">
    <i class="ct-pos p-${c.pos}">${POS_SHORT[c.pos]}</i><i class="ct-sal">${cardSal(c)}💰</i><img src="${cardPortrait(c)}" alt=""><b>${n1}</b><small>${n2}</small>
    <span class="ct-s">${st}</span><span class="ct-tags">${cardBadges(c)}</span></${o.act ? 'button' : 'div'}>`;
}
const synergyText = cards => { const { groups } = teamBonus(cards); return groups.length ? groups.map(g => `${badgeImg(g.key, g.k, 'bdg in')} ${g.key === 'club' ? CARD_CLUBS[g.k].name : CARD_NATS[g.k].name} ×${g.n} (+${g.n - 1}/người)`).join(' · ') : 'Chưa có cặp cùng CLB hay cùng quốc tịch'; };

/* ---------- TRẬN ĐẤU ---------- */
const RPS = [['bua', '✊', 'Búa'], ['keo', '✌️', 'Kéo'], ['bao', '✋', 'Bao']];
const rpsWin = (a, b) => (a === 'bua' && b === 'keo') || (a === 'keo' && b === 'bao') || (a === 'bao' && b === 'bua');
// o: { name, look, outfit, deck, album, tier, mine, borrowed, noPrize, smart } → Promise<{ res: 1 | 0 | -1 | null, took, lost }>
function cardMatch(o) {
  return new Promise(resolve => {
    const M = { round: 1, sc: [0, 0], cmd: null, stat: 'atk', n: 3, pick: [], opp: [], phase: 'rps', rps: null, log: [], took: null, lost: null, used: [] }, my = cardsOf(o.mine), op = cardsOf(o.deck);
    const who = o.name, smart = o.smart || o.tier === 'caothu', noise = { 'gà': 0.4, lop: 0.15, kha: 0.06, caothu: 0 }[o.tier] || 0.1;
    let closed = false;
    const finish = res => { if (closed) return; closed = true; UI._res = null; if (UI.isOpen()) UI.close(-1); resolve({ res, took: M.took, lost: M.lost }); };
    const aiPick = (stat, n) => { const all = bestSets(op, stat, n), k = Math.min(all.length - 1, Math.floor(Math.random() * Math.max(1, all.length * noise))); return all[k].set; };
    const aiCommand = () => {
      let best = null;
      for (const s of CARD_STATS.filter(x => !M.used.includes(x[0]))) for (let n = MATCH.nMin; n <= MATCH.nMax; n++) {
        const mine = bestSets(op, s[0], n)[0].v, theirs = smart ? bestSets(my, s[0], n)[0].v : n * 6.2, v = mine - theirs + Math.random() * 1.5;
        if (!best || v > best.v) best = { stat: s[0], n, v };
      }
      M.stat = best.stat; M.n = best.n;
    };
    const nextRound = () => {
      if (M.sc[0] >= MATCH.win || M.sc[1] >= MATCH.win || M.round > MATCH.rounds) return end();
      M.pick = []; M.opp = [];
      if (M.cmd === 'opp') { aiCommand(); M.phase = 'oppcmd'; } else { if (M.used.includes(M.stat)) M.stat = CARD_STATS.find(x => !M.used.includes(x[0]))[0]; M.phase = 'cmd'; }
    };
    const end = () => {
      M.res = M.sc[0] > M.sc[1] ? 1 : M.sc[0] < M.sc[1] ? -1 : 0;
      M.phase = 'end';
      if (M.res === -1 && !o.borrowed) {           // thua: đối thủ lấy 1 thẻ trong đội hình
        const c = my[Math.floor(Math.random() * my.length)]; M.lost = c.id;
        G.cards[c.id]--; if (!G.cards[c.id]) { delete G.cards[c.id]; if (G.squad) G.squad = G.squad.filter(x => x !== c.id); }
      }
    };
    const head = () => `<div class="cm-head"><img src="${faceOf(G.gender, null)}" alt=""><b>Bạn ${M.sc[0]}</b><span>Lượt ${Math.min(M.round, MATCH.rounds)}/${MATCH.rounds} · thắng ${MATCH.win} lượt là thắng trận${M.used.length ? `<br><small>Đã so: ${M.used.map(k => CARD_STATS.find(x => x[0] === k)[2]).join(' · ')}</small>` : ''}</span><b>${M.sc[1]} ${who}</b><img src="${faceOf(o.look, o.outfit)}" alt=""></div>`;
    const render = () => {
      let h = head();
      if (M.phase === 'rps') {
        h += `<p class="cm-big">Oẳn tù xì giành quyền <b>ra lệnh lượt đầu</b>!</p><div class="btns rps">${RPS.map(([k, e, n]) => `<button class="btn" data-act="rps" data-id="${k}"><span class="emo">${e}</span>${n}</button>`).join('')}</div>`;
        if (M.rps) { const [a, b] = M.rps, A = RPS.find(x => x[0] === a), B = RPS.find(x => x[0] === b); h += `<p class="cm-big"><span class="emo">${A[1]}</span> vs <span class="emo">${B[1]}</span> — ${a === b ? 'Hoà! Oẳn lại nào.' : rpsWin(a, b) ? 'Bạn thắng, bạn ra lệnh trước!' : `${who} thắng, ${who} ra lệnh trước.`}</p>`; if (a !== b) h += '<div class="btns"><button class="btn primary" data-act="go">Bắt đầu lượt 1</button></div>'; }
      } else if (M.phase === 'cmd') {
        h += `<p class="cm-big">Bạn <b>ra lệnh</b>: chọn chỉ số so tài và số lá mỗi bên ra sân.</p><p class="dim">Mỗi chỉ số chỉ được so <b>một lần</b> trong trận — chỉ số đã so thì gạch đi.</p><div class="btns stats6">${CARD_STATS.map(([k, n, s]) => `<button class="btn ${M.stat === k ? 'primary' : ''} ${M.used.includes(k) ? 'used' : ''}" data-act="stat" data-id="${k}" ${M.used.includes(k) ? 'disabled' : ''}>${s} · ${n}</button>`).join('')}</div>`;
        h += `<div class="btns">${[3, 4, 5].map(n => `<button class="btn ${M.n === n ? 'primary' : ''}" data-act="num" data-id="${n}">${n} lá</button>`).join('')}</div>`;
        h += `<p class="dim">Mạnh nhất của bạn với ${M.n} lá: ${CARD_STATS.filter(([k]) => !M.used.includes(k)).map(([k, , s]) => `${s} ${bestSets(my, k, M.n)[0].v}`).join(' · ')} (đã cộng màu áo)</p><div class="btns"><button class="btn primary" data-act="order">Ra lệnh: ${statName(M.stat)}, ${M.n} lá</button></div>`;
      } else if (M.phase === 'oppcmd') {
        h += `<p class="cm-big">${who} <b>ra lệnh</b>: so <b>${statName(M.stat)}</b>, mỗi bên <b>${M.n} lá</b>.</p><div class="btns"><button class="btn primary" data-act="topick">Chọn cầu thủ</button></div>`;
      } else if (M.phase === 'pick') {
        const sel = cardsOf(M.pick), b = teamBonus(sel).b;
        h += `<p>So <b>${statName(M.stat)}</b> · chọn <b>${M.n}</b> lá (đã chọn ${sel.length}). Tổng tạm tính: <b class="cm-tot">${setTotal(sel, M.stat)}</b></p><p class="dim">${synergyText(sel)}</p>`;
        h += `<div class="cts">${my.map(c => ctile(c, { act: 'pk', on: M.pick.includes(c.id), stat: M.stat, bonus: b[c.id] || 0 })).join('')}</div>`;
        h += `<div class="btns"><button class="btn primary" data-act="play" ${sel.length === M.n ? '' : 'disabled'}>Ra sân!</button></div>`;
      } else if (M.phase === 'reveal') {
        const A = cardsOf(M.pick), B = cardsOf(M.opp), ba = teamBonus(A).b, bb = teamBonus(B).b, ta = setTotal(A, M.stat), tb = setTotal(B, M.stat);
        h += `<p class="cm-big">So ${statName(M.stat)}: <b>${ta}</b> – <b>${tb}</b> · ${M.last === 1 ? 'Bạn thắng lượt này!' : M.last === -1 ? `${who} thắng lượt này.` : 'Hoà!'}</p>`;
        h += `<div class="cm-row"><b>Bạn</b><div class="cts sm">${A.map(c => ctile(c, { stat: M.stat, bonus: ba[c.id] })).join('')}</div><small>${synergyText(A)}</small></div>`;
        h += `<div class="cm-row"><b>${who}</b><div class="cts sm">${B.map(c => ctile(c, { stat: M.stat, bonus: bb[c.id] })).join('')}</div><small>${synergyText(B)}</small></div>`;
        h += `<div class="btns"><button class="btn primary" data-act="next">${M.sc[0] >= MATCH.win || M.sc[1] >= MATCH.win || M.round > MATCH.rounds ? 'Xem kết quả' : `Lượt ${M.round}: ${M.cmd === 'me' ? 'bạn' : who} ra lệnh`}</button></div>`;
      } else if (M.phase === 'end') {
        h += `<p class="cm-big">${M.res === 1 ? `🏆 Bạn thắng ${M.sc[0]}–${M.sc[1]}!` : M.res === -1 ? `Thua ${M.sc[0]}–${M.sc[1]}…` : `Hoà ${M.sc[0]}–${M.sc[1]}.`}</p>`;
        if (M.res === 1 && !o.noPrize && !M.took) h += `<p>Bạn được mở album của ${who} và <b>chọn 1 thẻ</b> mang về:</p><div class="cts">${cardsOf(o.album || o.deck).map(c => ctile(c, { act: 'take' })).join('')}</div>`;
        else {
          if (M.took) h += `<p class="okbox">Bạn lấy được thẻ <b>${CARD_BY_ID[M.took].name}</b>${M.tookNew ? ' — thẻ mới!' : ''}.</p>`;
          if (M.lost) h += `<p class="warnbox">${who} lấy thẻ <b>${CARD_BY_ID[M.lost].name}</b> trong đội hình của bạn.${G.cards[M.lost] ? '' : ' Đội hình thiếu người — vào Menu → Thẻ cầu thủ → Đội hình để xếp lại.'}</p>`;
          if (M.res === -1 && o.borrowed) h += '<p class="dim">Bộ thẻ đi mượn nên không mất thẻ nào.</p>';
          h += '<div class="btns"><button class="btn primary" data-act="close">Xong</button></div>';
        }
      }
      return h;
    };
    UI.panel(`Đấu thẻ với ${who}`, render, {
      rps: d => { const b = RPS[Math.floor(Math.random() * 3)][0]; M.rps = [d.id, b]; if (d.id !== b) M.cmd = rpsWin(d.id, b) ? 'me' : 'opp'; },
      go: () => nextRound(),
      stat: d => { if (!M.used.includes(d.id)) M.stat = d.id; }, num: d => { M.n = +d.id; },
      order: () => { M.phase = 'pick'; },
      topick: () => { M.phase = 'pick'; },
      pk: d => { const i = M.pick.indexOf(d.id); if (i >= 0) M.pick.splice(i, 1); else if (M.pick.length < M.n) M.pick.push(d.id); },
      play: () => {
        const opp = aiPick(M.stat, M.n); M.opp = opp.map(c => c.id);
        const ta = setTotal(cardsOf(M.pick), M.stat), tb = setTotal(opp, M.stat);
        M.last = ta > tb ? 1 : ta < tb ? -1 : 0;
        if (M.last === 1) M.sc[0]++; else if (M.last === -1) M.sc[1]++;
        M.cmd = M.last === 1 ? 'opp' : M.last === -1 ? 'me' : (M.cmd === 'me' ? 'opp' : 'me');     // người thua lượt (hoà: đổi lượt) ra lệnh lượt sau
        M.used.push(M.stat); M.round++; M.phase = 'reveal';
      },
      next: () => nextRound(),
      take: d => { M.took = d.id; M.tookNew = gainCard(CARD_BY_ID[d.id]); if (o.onTake) o.onTake(d.id); },
      close: () => finish(M.res),
    }, true);
    UI._res = () => finish(M.phase === 'end' ? M.res : null);         // đóng ngang: coi như bỏ trận
  });
}

/* ---------- đấu với bạn bè / bạn học / tụ đấu thẻ ---------- */
const oppLost = sid => (G.oppLost[sid] = G.oppLost[sid] || []);
function oppDeck(sid, tier) {
  const lost = oppLost(sid), base = genDeck(tier, 'deck:' + sid + ':' + Math.floor(G.day / 14));
  const deck = base.map(id => { if (!lost.includes(id)) return id; const c = CARD_BY_ID[id], alt = CARDS.find(x => x.pos === c.pos && !base.includes(x.id) && !lost.includes(x.id) && cardSal(x) <= cardSal(c)); return alt ? alt.id : id; });
  const extra = genDeck(tier, 'album:' + sid + ':' + Math.floor(G.day / 14)).filter(id => !deck.includes(id) && !lost.includes(id)).slice(0, 4);
  return { deck, album: deck.concat(extra) };
}
function needSquadMsg() {
  if (!G.cardTut) return UI.say('Đấu thẻ cầu thủ', 'Bạn chưa biết luật chơi mới và chưa có đội hình.<p class="dim">Giờ ra chơi ra sân trường, tìm <b>tụ đấu thẻ</b> có anh Phong (11A1) — anh ấy sẽ hướng dẫn và tặng bạn một bộ 11 thẻ.</p>');
  return UI.say('Đấu thẻ cầu thủ', `Đội hình chưa hợp lệ: ${squadIssues(G.squad || []).join('; ') || 'chưa xếp đội hình'}.<p class="dim">Vào Menu → Thẻ cầu thủ → Đội hình để xếp (có nút xếp tự động).</p>`);
}
// Giữ tên cũ để các chỗ gọi (bạn bè, bạn cùng lớp, dưới gầm bàn, giải đấu giờ nghỉ trưa) dùng được luật mới
async function cardDuel(sid, fid, name, tier, o) {
  o = o || {};
  if (RT.lock) return null;
  if (fid && grudge(fid)) { UI.say(name, '“Tớ không chơi với đứa mách lẻo.”'); return null; }
  if (!o.free && G.daily.duel[sid]) { UI.toast(`Hôm nay ${name} đấu thẻ với bạn rồi.`); return null; }
  if (!squadOk()) { needSquadMsg(); return null; }
  const D = oppDeck(sid, tier || 'lop'), look = fid || o.look || 'c1';
  const r = await cardMatch({ name, look, outfit: fid ? friendOutfit(fid) : o.outfit, deck: D.deck, album: D.album, tier: tier || 'lop', mine: G.squad, onTake: id => oppLost(sid).push(id) });
  if (r.res === null) return null;                                  // bỏ ngang: không tính lượt đấu hôm nay
  if (!o.free) G.daily.duel[sid] = true;
  addStat('giaotiep', 1); if (fid) addFriend(fid, 2);
  return r.res;
}
// Tụ đấu thẻ ngoài sân: lần đầu anh Phong hướng dẫn, cho mượn thẻ đấu thử, rồi tặng 11 thẻ
async function cardGroupTalk(g, n) {
  const S = SOCIETY.a_phong, who = { look: 'sC' }, page = t => UI.ask(S.name, `<p>${t}</p>`, ['Dạ, tiếp đi anh'], { who });
  if (G.cardTut) {
    const isSenior = n.sid === 'sC', name = isSenior ? 'anh Phong' : n.name;
    const c = await UI.ask(n.name, `<p>“${isSenior ? 'Làm một trận không em? Anh không nhường đâu nhé!' : 'Đấu thẻ không? Năm lượt, ai thắng ba trước!'}”</p>`, ['Đấu luôn!', 'Thôi'], { who: { look: n.look, outfit: n.outfit ? n.outfit() : null } });
    if (c !== 0) return;
    const r = await cardDuel('yard_' + n.sid, n.fid || null, name, isSenior ? 'caothu' : 'lop', { look: n.look });
    if (r === 1) UI.toast('Cả tụ trầm trồ: “Đỉnh thật!”', 'good');
    return;
  }
  await page('“Em cũng mê thẻ cầu thủ à? Ngồi đây anh chỉ luật chơi mới cho. Không phải cứ rút một lá ra so là xong đâu!”');
  await page(`“Mỗi người xếp một <b>đội hình 11 người</b>: đúng 1 thủ môn, ít nhất 2 hậu vệ, 2 tiền vệ và 1 tiền đạo. Thẻ càng hiếm càng mạnh thì <b>lương</b> càng cao — tổng lương không được quá ${SQUAD.cap}, nên không ai nhồi toàn thẻ xịn được đâu.”`);
  await page('“Trận đấu có <b>5 lượt</b>. Lượt đầu oẳn tù xì giành quyền <b>ra lệnh</b>. Người ra lệnh chọn so chỉ số nào và mỗi bên ra sân mấy lá, từ 3 tới 5. Có 6 chỉ số: Tấn công, Phòng thủ, Tốc độ, Sức mạnh, Kỹ thuật, Tư duy — <b>mỗi chỉ số chỉ được so một lần</b> trong trận, nên đừng dồn hết vào một chỉ số nha!”');
  await page('“Hai bên chọn đúng số lá đó, cộng tổng chỉ số, ai cao hơn thắng lượt. <b>Người thua lượt</b> được ra lệnh lượt sau — để còn gỡ lại. Ai thắng 3 lượt trước là thắng trận.”');
  await page('“Mẹo nè: cầu thủ <b>cùng câu lạc bộ</b> hoặc <b>cùng quốc tịch</b> ra sân chung thì ăn ý, mỗi người được cộng thêm. Hai người +1, ba người +2… càng đông càng mạnh. Thắng trận thì được mở album của người thua, chọn 1 thẻ mang về.”');
  await page('“Giờ em cầm tạm bộ thẻ này của anh, đấu thử với anh một trận cho quen tay nhé!”');
  const lend = genDeck('kha', 'lend:' + G.day), mineD = genDeck('kha', 'phong:' + G.day);
  const r = await cardMatch({ name: 'anh Phong', look: 'sC', deck: mineD, album: mineD, tier: 'lop', mine: lend, borrowed: true, noPrize: true });
  meetSoc('a_phong');
  // tặng bộ 11 thẻ (đủ vị trí, trong trần lương) + thêm 1 thẻ Hiếm trở lên nếu thắng (may mắn hôm nay quyết định độ hiếm)
  const gift = genDeck('lop'); for (const id of gift) gainCard(CARD_BY_ID[id]);
  G.squad = gift.slice(); G.cardTut = true;
  let extra = '';
  if (r.res === 1) {
    const L = luckK(), c = rollCard([0, Math.max(10, 70 - 25 * L), 25 + 15 * L, 5 + 8 * Math.max(0, L)]);
    gainCard(c); extra = `<p>“Em thắng được anh luôn à? Giỏi đấy! Anh tặng thêm lá này làm kỷ niệm.”</p><div class="pcards">${cardHtml(c, 'THƯỞNG')}</div>`;
  }
  await UI.ask(S.name, `<p>“${r.res === 1 ? 'Ván này em chơi hay lắm!' : r.res === 0 ? 'Hoà à, khá đấy!' : 'Thua anh là chuyện thường, chơi nhiều sẽ lên tay.'} Anh tặng em <b>bộ 11 thẻ</b> này để đi đấu với bạn bè. Vào Menu → Thẻ cầu thủ → Đội hình mà sắp xếp lại cho mạnh nhé!”</p>${extra}`, ['Em cảm ơn anh!'], { who });
}
