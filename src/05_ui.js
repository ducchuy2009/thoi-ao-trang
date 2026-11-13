'use strict';
/* ============================================================
 *  05. GIAO DIỆN — HUD, hộp thoại, cặp sách, chỉ số, TKB, sổ điểm
 * ============================================================ */
const $ = id => document.getElementById(id);
// Ai đang nói? Hộp thoại với nhân vật hiện ở phía dưới màn hình kèm chân dung (dò theo tiêu đề hộp thoại)
const SPEAKERS = { 'Mẹ': 'mom', 'Bố': 'dad', 'Bác bảo vệ': 'guard', 'Cô chủ nhiệm': 'teacherA', 'Căn tin': 'vendor', 'Xe xiên que': 'vendor', 'Quán hải sản': 'vendor', 'Tiệm trà sữa Mây': 'vendor', 'Xe bus': 'driver', 'Trạm xe bus': 'driver', 'Cô soát vé': 'clerk', 'Bạn cùng lớp': 'c1', 'Thư viện': 'teacherB' };
function speakerOf(title) {
  if (!G) return null;
  if (SPEAKERS[title]) { const k = SPEAKERS[title]; return { look: k, outfit: k === 'mom' && G.map !== 'home' ? 'noapron' : k === 'dad' && !workDay() ? 'dadhome' : null }; }
  const words = title.split(/[\s·,/:!?]+/);
  for (const f in FRIENDS) if (words.includes(FRIENDS[f].name)) return { look: f, outfit: friendOutfit(f) };
  return null;
}
const UI = {
  _res: null, _esc: 0, _panel: null, _gsem: 1, _mini: null, _mgBot: false, _fast: false, _chat: null, _chatSub: null,
  isOpen() { return $('modal-wrap').classList.contains('on'); },

  /* ---------- hộp thoại ---------- */
  _open(title, body, res, esc, wide) {
    if (this.isOpen()) this.close(-1);
    $('m-title').textContent = title; $('m-body').innerHTML = body;
    $('modal').classList.toggle('wide', !!wide);
    const sp = res ? speakerOf(title) : null;         // hội thoại với nhân vật: hiện ở dưới, có chân dung
    $('modal-wrap').classList.toggle('talk', !!sp);
    if (sp) $('m-face').src = faceOf(sp.look, sp.outfit);
    $('modal-wrap').classList.add('on');
    this._res = res; this._esc = esc;
    $('m-body').scrollTop = 0;
    for (const k in KEYS) KEYS[k] = false;
  },
  close(v) {
    if (!this.isOpen()) return;
    if (this._mini) return this._mini();      // đang chơi minigame: đóng = bỏ cuộc
    $('modal-wrap').classList.remove('on');
    const r = this._res; this._res = null; this._panel = null;
    if (r) r(v === undefined ? this._esc : v);
  },
  ask(title, html, buttons, opts) {
    opts = opts || {};
    return new Promise(res => {
      const btns = buttons.map((b, i) => `<button class="btn ${i === 0 && !opts.grid && buttons.length < 4 ? 'primary' : ''} ${b === 'Thôi' || b === 'Chưa' ? 'ghost' : ''}" data-i="${i}">${opts.grid || buttons.length < 2 ? '' : `<kbd>${i + 1}</kbd>`}${b}</button>`).join('');
      // opts.esc: giá trị trả về khi bấm Esc / nút ✕ (mặc định = nút cuối cùng)
      this._open(title, html + `<div class="btns ${opts.grid ? 'grid' : (buttons.length > 2 ? 'col' : '')}">${btns}</div>`, res, opts.esc !== undefined ? opts.esc : buttons.length - 1);
    });
  },
  say(title, html) { return this.ask(title, `<p>${html}</p>`, ['OK']); },
  transport(title, html, opts) {
    return new Promise(res => {
      const rows = opts.map(o => `<button class="trow" data-tr="${o.id}" ${o.ok ? '' : 'disabled'}><b>${o.name}</b><span>${o.mins} phút</span><span>${o.cost ? fmtMoney(o.cost) : 'Miễn phí'}</span><small>${o.ok ? (o.note || '') : o.why}</small></button>`).join('');
      this._open(title, html + `<div class="tlist">${rows}</div><div class="btns"><button class="btn ghost" data-close="1">Thôi</button></div>`, v => res(typeof v === 'string' ? v : null), null);
    });
  },
  panel(title, render, handlers, wide) {
    this._open(title, render(), null, null, wide);
    this._panel = { render, handlers: handlers || {} };
  },
  refresh() { if (this._panel) { const st = $('m-body').scrollTop; $('m-body').innerHTML = this._panel.render(); $('m-body').scrollTop = st; } },
  _click(e) {
    const t = e.target.closest('[data-i],[data-tr],[data-close],[data-act]'); if (!t || t.disabled) return;
    if (t.dataset.i !== undefined) return UI.close(+t.dataset.i);
    if (t.dataset.tr) return UI.close(t.dataset.tr);
    if (t.dataset.close) return UI.close(-1);
    if (t.dataset.act && UI._panel) { const h = UI._panel.handlers[t.dataset.act]; if (h) { h(t.dataset, t); UI.refresh(); UI.hud(); } }
  },
  _key(e) {
    if (UI._mini) { if (e.key === 'Escape') UI._mini(); return; }
    if (e.repeat) return;   // đang giữ phím (vd. vừa chơi minigame xong) thì không tự bấm nút
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (e.key === 'Escape') { e.preventDefault(); return UI.close(UI._res ? UI._esc : -1); }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const b = $('m-body').querySelector('.btn.primary') || $('m-body').querySelector('.btn[data-i]'); if (b) b.click(); else UI.close(-1); return; }
    if (/^[1-9]$/.test(e.key)) { const b = $('m-body').querySelector(`.btns:not(.grid) [data-i="${+e.key - 1}"]`); if (b) b.click(); }
  },

  /* ---------- minigame thực hành (kiểu câu cá) ---------- */
  minigame(o) {
    return new Promise(res => {
      const W = 150, HH = 284;
      this._open(o.title, `<div class="mg"><canvas id="mg-cv" width="${W * 2}" height="${HH * 2}"></canvas><div class="mg-side"><p><b>${o.task || ''}</b></p><p>Độ khó: <span class="stars">${starStr(o.diff)}</span></p>${MG_HELP}<p id="mg-msg" class="big"></p></div></div>`, null, null, false);
      const c = $('mg-cv').getContext('2d'), s = mgNew(o.diff, o.level, o.tired), modal = $('modal');
      let held = false, last = 0, ended = false;
      const isUp = e => e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W';
      const kd = e => { if (isUp(e)) { held = true; e.preventDefault(); } }, ku = e => { if (isUp(e)) held = false; };
      const md = e => { if (e.target.id !== 'm-x') { held = true; e.preventDefault(); } }, mu = () => { held = false; };
      window.addEventListener('keydown', kd, true); window.addEventListener('keyup', ku, true);
      modal.addEventListener('mousedown', md); window.addEventListener('mouseup', mu);
      modal.addEventListener('touchstart', md, { passive: false }); window.addEventListener('touchend', mu);
      UI._mini = () => { s.done = s.done || -1; };   // đóng hộp thoại / Esc = bỏ cuộc
      const y = v => 10 + s.H - v;
      const draw = () => {
        c.setTransform(2, 0, 0, 2, 0, 0); c.clearRect(0, 0, W, HH);
        c.fillStyle = '#2a2136'; c.fillRect(27, 7, 50, s.H + 6); c.fillStyle = '#e9f1f4'; c.fillRect(30, 10, 44, s.H);
        c.fillStyle = '#cfdbe1'; for (let v = 0; v <= s.H; v += 25) c.fillRect(30, y(v), v % 50 ? 8 : 14, 1);
        c.fillStyle = s.inside ? '#5fd08a' : '#9fd9b5'; c.fillRect(31, y(s.bp + s.bh), 42, s.bh);
        c.fillStyle = s.inside ? '#2f9a5b' : '#6fb58a'; c.fillRect(31, y(s.bp + s.bh), 42, 3); c.fillRect(31, y(s.bp) - 3, 42, 3);
        const ty = y(s.tp);
        if (o.icon === 'nhiet') { c.fillStyle = '#e2574c'; c.beginPath(); c.arc(52, ty, 7, 0, 6.3); c.fill(); c.fillStyle = '#ffd6cf'; c.fillRect(49, ty - 4, 2, 4); }
        else if (o.icon === 'mau') { c.fillStyle = '#7a5fc9'; c.beginPath(); c.ellipse(52, ty, 9, 6, 0, 0, 6.3); c.fill(); c.fillStyle = '#d9cdf5'; c.beginPath(); c.arc(54, ty - 1, 2.2, 0, 6.3); c.fill(); }
        else if (o.icon === 'gau') { c.fillStyle = '#b9824f'; c.beginPath(); c.arc(52, ty, 8, 0, 6.3); c.fill(); c.beginPath(); c.arc(45, ty - 7, 3.2, 0, 6.3); c.arc(59, ty - 7, 3.2, 0, 6.3); c.fill(); c.fillStyle = '#f0d09a'; c.beginPath(); c.arc(52, ty + 2, 4, 0, 6.3); c.fill(); c.fillStyle = '#2a2136'; c.fillRect(48, ty - 3, 2, 2); c.fillRect(54, ty - 3, 2, 2); c.fillRect(51, ty + 1, 2, 2); }
        else if (o.icon === 'bong') { c.fillStyle = '#fbf7ee'; c.strokeStyle = '#2a2136'; c.lineWidth = 1.5; c.beginPath(); c.arc(52, ty, 8, 0, 6.3); c.fill(); c.stroke(); c.fillStyle = '#2a2136'; c.beginPath(); c.arc(52, ty, 3, 0, 6.3); c.fill(); c.fillRect(46, ty - 6, 2, 2); c.fillRect(57, ty - 5, 2, 2); c.fillRect(47, ty + 5, 2, 2); c.fillRect(56, ty + 5, 2, 2); }
        else if (o.icon === 'ca') { c.fillStyle = '#6fa8dc'; c.beginPath(); c.ellipse(50, ty, 11, 6, 0, 0, 6.3); c.fill(); c.beginPath(); c.moveTo(60, ty); c.lineTo(69, ty - 6); c.lineTo(69, ty + 6); c.fill(); c.fillStyle = '#cfe6f7'; c.beginPath(); c.ellipse(48, ty + 2, 6, 2.4, 0, 0, 6.3); c.fill(); c.fillStyle = '#2a2136'; c.fillRect(42, ty - 2, 2, 2); }
        else if (o.icon === 'nhip') { c.fillStyle = '#f2a93b'; c.beginPath(); c.moveTo(52, ty - 8); c.lineTo(61, ty); c.lineTo(52, ty + 8); c.lineTo(43, ty); c.fill(); }
        else { c.fillStyle = '#d9534f'; c.beginPath(); c.moveTo(34, ty); c.lineTo(66, ty - 5); c.lineTo(66, ty + 5); c.fill(); c.fillStyle = '#2a2136'; c.beginPath(); c.arc(68, ty, 3, 0, 6.3); c.fill(); }
        // thanh tiến độ
        c.fillStyle = '#2a2136'; c.fillRect(97, 7, 22, s.H + 6); c.fillStyle = '#efe6d2'; c.fillRect(100, 10, 16, s.H);
        c.fillStyle = s.pr > 0.66 ? '#5fae4a' : s.pr > 0.33 ? '#f2a93b' : '#d9534f'; c.fillRect(100, y(s.pr * s.H), 16, s.pr * s.H);
        c.fillStyle = '#2a2136'; c.font = '700 10px "Baloo 2", system-ui, sans-serif'; c.textAlign = 'center'; c.fillText('Tiến độ', 108, s.H + 27); c.fillText('Thang đo', 52, s.H + 27);
      };
      const finish = () => {
        window.removeEventListener('keydown', kd, true); window.removeEventListener('keyup', ku, true); modal.removeEventListener('mousedown', md); window.removeEventListener('mouseup', mu);
        modal.removeEventListener('touchstart', md); window.removeEventListener('touchend', mu);
        const r = mgResult(s), msg = $('mg-msg');
        if (msg) { msg.textContent = r.win ? (r.perfect ? 'Hoàn hảo!' : 'Hoàn thành!') : 'Chưa đạt…'; msg.style.color = r.win ? '#2f7d5b' : '#d9534f'; }
        setTimeout(() => { UI._mini = null; UI.close(-1); res(r); }, UI._mgBot ? 30 : 900);
      };
      const loop = t => {
        const dt = Math.min(0.04, (t - last) / 1000 || 0.016); last = t;
        if (ended) return;
        const n = UI._mgBot ? 30 : 1;     // chế độ tự chơi dùng khi kiểm thử
        for (let k = 0; k < n && !s.done; k++) mgStep(s, UI._mgBot ? s.tp > s.bp + s.bh / 2 : held, UI._mgBot ? 0.016 : dt);
        draw();
        if (s.done) { ended = true; finish(); return; }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    });
  },

  /* ---------- hiệu ứng ---------- */
  toast(msg, kind) {
    const d = document.createElement('div'); d.className = 'toast ' + (kind || ''); d.textContent = msg;
    const box = $('toasts'); box.appendChild(d);
    while (box.children.length > 5) box.removeChild(box.firstChild);
    setTimeout(() => { d.classList.add('out'); setTimeout(() => d.remove(), 400); }, 3800);
  },
  float(text, col) { if (!G) return; const n = RT.floats.filter(f => f.t < 0.5).length; RT.floats.push({ text, col, x: G.x, y: G.y - 28, t: -n * 0.22 }); },
  // Chờ ms mili giây; bấm chuột / Space / Enter để lướt nhanh (dùng cho lời thoại trong cắt cảnh)
  wait(ms) {
    if (this._fast) ms = 15;
    return new Promise(res => {
      let done = false, t = 0;
      const key = e => { if (e.key === ' ' || e.key === 'Enter' || e.key === 'e' || e.key === 'E') fin(); };
      const fin = () => { if (done) return; done = true; clearTimeout(t); window.removeEventListener('keydown', key, true); window.removeEventListener('mousedown', fin, true); window.removeEventListener('touchstart', fin, true); res(); };
      t = setTimeout(fin, ms);
      setTimeout(() => { if (done) return; window.addEventListener('keydown', key, true); window.addEventListener('mousedown', fin, true); window.addEventListener('touchstart', fin, true); }, Math.min(350, ms));
    });
  },
  progress(label, ms, col) {
    if (this._fast) ms = 15;
    return new Promise(res => {
      const b = $('banner'); $('b-label').textContent = label; const f = $('b-fill');
      f.style.transition = 'none'; f.style.width = '0%'; f.style.background = col || '';
      b.classList.add('on'); void f.offsetWidth;
      f.style.transition = `width ${ms}ms linear`; f.style.width = '100%';
      setTimeout(() => { b.classList.remove('on'); res(); }, ms + 60);
    });
  },
  fade(on, ms) {
    ms = this._fast ? 10 : (ms || 240);
    return new Promise(res => { const f = $('fade'); f.style.transition = `opacity ${ms}ms`; f.style.opacity = on ? 1 : 0; f.style.pointerEvents = on ? 'auto' : 'none'; setTimeout(res, ms + 20); });
  },

  /* ---------- HUD ---------- */
  hud() {
    if (!G) return;
    const c = today(), mx = maxStam();
    $('h-date').textContent = `${DOW[c.dow]}, ${c.dos} ${c.sName}`;
    $('h-year').textContent = `Năm ${c.year + 1} · Lớp ${G.grade}`;
    $('h-time').textContent = fmtTime(G.time);
    $('h-phase').textContent = phaseLabel();
    $('h-stam').style.width = Math.round(100 * G.stamina / mx) + '%';
    $('h-stam').className = G.stamina < 15 ? 'low' : '';
    $('h-stamtx').textContent = `${Math.round(G.stamina)}/${mx}`;
    $('h-money').textContent = fmtMoney(G.money);
    $('h-conduct').textContent = fmtScore(G.conduct);
    const un = unreadCount(), dot = $('ph-dot'); dot.textContent = un || ''; dot.classList.toggle('on', un > 0);
    this.hotbar();
    const td = todoList();
    $('todo').innerHTML = td.map(([ok, s]) => `<div class="${ok ? 'ok' : ''}"><i></i>${s}</div>`).join('');
  },
  /* ---------- Thanh đồ (góc dưới): đang mang gì trong cặp ---------- */
  hotbarItems() {
    const it = [], add = (id, n, title, act, lab) => it.push({ id, n, title, act: act || '', lab: lab || '' });
    for (const k of Object.keys(ITEMS)) if (G.bag[k]) add(k, 0, ITEMS[k].name + (ITEMS[k].desc ? ' — ' + ITEMS[k].desc : ''), '', ITEMS[k].subj ? SUBJ[ITEMS[k].subj].short : '');
    for (const k in FOODS) if (G.inv[k]) add(k, G.inv[k], `${FOODS[k].name} — bấm để ăn (+${FOODS[k].stam} thể lực)`, 'eat');
    if (G.inv.banhtrang) add('banhtrang', G.inv.banhtrang, 'Bánh tráng trộn — hàng để mời bạn mua giờ ra chơi');
    if (cardCount()) add('the', cardCount(), 'Thẻ cầu thủ — bấm để xem bộ sưu tập', 'cards');
    if (G.inv.gaubong) add('gaubong', G.inv.gaubong, 'Gấu bông — tặng bạn thân');
    if (G.inv.voso) add('voso', G.inv.voso, 'Vỏ sò — tặng bạn thân');
    if (fishCount()) add('ca', fishCount(), `Cá câu được — bán cho Cô Ba (${fmtMoney(fishValue())}) hoặc đưa mẹ nấu`);
    if (G.owned.cancau) add('cancau', 0, 'Cần câu — câu cá ở bờ sông');
    return it;
  },
  hotbar() {
    const it = this.hotbarItems(), sig = it.map(x => x.id + ':' + x.n).join('|') + '#' + (G.ride || '');
    if (sig === this._hb) return; this._hb = sig;
    $('hotbar').innerHTML = it.map(x => `<button class="slot" data-hb="${x.act}" data-id="${x.id}" title="${x.title}"><img src="${itemIcon(x.id)}" alt="">${x.n ? `<b>${x.n}</b>` : ''}${x.lab ? `<i>${x.lab}</i>` : ''}</button>`).join('')
      + (G.ride ? `<button class="slot txt" data-hb="off" title="Xuống xe">Xuống xe <kbd>X</kbd></button>` : '');
  },
  hint(text, ok) {
    const h = $('hint');
    if (!text) { h.classList.remove('on'); return; }
    if (h._t !== text || h._ok !== ok) { h._t = text; h._ok = ok; h.innerHTML = (ok ? '<kbd>Chuột phải</kbd><kbd>E</kbd>' : '<em>Lại gần hơn</em>') + '<span></span>'; h.lastChild.textContent = text; h.classList.toggle('far', !ok); }
    h.classList.add('on');
  },

  /* ---------- Cặp sách ---------- */
  bag() {
    this.panel('Cặp sách', () => {
      const inBag = Object.keys(ITEMS).filter(i => G.bag[i]);
      let h = '<h4>Đang mang trong cặp</h4><div class="chips">' + (inBag.length ? inBag.map(i => `<span class="it on">${ITEMS[i].name}</span>`).join('') : '<span class="dim">Cặp trống.</span>') + '</div>';
      if (schoolToday() && G.time < CFG.SCHOOL_END) { const ms = missingToday(); h += ms.length ? `<p class="warnbox">So với thời khoá biểu hôm nay còn thiếu ${ms.length} món. Chỉ soạn cặp được ở bàn học tại nhà.</p>` : '<p class="okbox">Đủ đồ cho thời khoá biểu hôm nay.</p>'; }
      h += '<h4>Đồ ăn mang theo</h4><div class="rows">';
      let any = false;
      for (const id in FOODS) if (G.inv[id]) { any = true; h += `<div class="rowi"><span><b>${FOODS[id].name}</b> ×${G.inv[id]} <small>+${FOODS[id].stam} thể lực</small></span><button class="btn sm" data-act="eat" data-id="${id}">Dùng</button></div>`; }
      if (!any) h += '<span class="dim">Không có gì để ăn.</span>';
      h += '</div><h4>Hàng để bán</h4><p>Bánh tráng trộn: <b>' + (G.inv.banhtrang || 0) + '</b> bịch <small class="dim">— mời bạn mua trong giờ ra chơi</small></p>';
      h += `<h4>Thẻ cầu thủ & quà</h4><div class="rowi"><span><b>Thẻ cầu thủ</b> ${cardCount()} lá · ${cardKinds()}/${CARDS.length} loại <small>bóc trong gói bim bim Sao Vàng, đem đấu với bạn</small></span><button class="btn sm" data-act="cards">Bộ sưu tập</button></div>`;
      if (G.inv.gaubong) h += `<p>Gấu bông gắp được: <b>${G.inv.gaubong}</b> con <small class="dim">— tặng bạn thân (+${GIFT_FRIEND} thân thiết)</small></p>`;
      const own = [['xedap', 'Xe đạp'], ['xedapdien', 'Xe đạp điện'], ['xemay', 'Xe máy 50cc'], ['daynhay', 'Dây nhảy'], ['tatay', 'Tạ tay'], ['xadon', 'Xà đơn'], ['cancau', 'Cần câu']].filter(([k]) => G.owned[k]).map(([, n]) => n);
      if (fishCount()) h += '<p>Cá câu được: ' + FISH.filter(f => G.fish[f.id]).map(f => `<b>${f.name}</b> ×${G.fish[f.id]}`).join(' · ') + ` <small class="dim">— bán cho Cô Ba được ${fmtMoney(fishValue())}, hoặc đưa mẹ nấu</small></p>`;
      if (G.inv.voso) h += `<p>Vỏ sò: <b>${G.inv.voso}</b> <small class="dim">— tặng bạn thân (+${SHELL_FRIEND} thân thiết)</small></p>`;
      h += '<h4>Tài sản ở nhà</h4><p>' + (own.length ? own.join(' · ') : '<span class="dim">Chưa có gì.</span>') + '</p>';
      if (G.busPassUntil >= G.day) h += `<p>Vé tháng xe bus còn hạn đến <b>${dateLabel(G.busPassUntil)}</b>.</p>`;
      return h;
    }, { eat: d => eat(d.id), cards: () => UI.cards() });
  },

  /* ---------- Bộ sưu tập thẻ cầu thủ ---------- */
  cards() {
    this.panel('Bộ sưu tập thẻ cầu thủ', () => {
      let h = `<p>Đã sưu tầm <b>${cardKinds()}/${CARDS.length}</b> loại · tổng <b>${cardCount()}</b> lá.${G.cardDone ? ' <b class="tag">Đủ bộ!</b>' : ` Đủ bộ được thưởng ${fmtMoney(CARD_SET_REWARD)}.`}</p><div class="pcards">`;
      for (const c of CARDS) h += G.cards[c.id] ? cardHtml(c, '×' + G.cards[c.id]) : `<div class="pcard none" style="--rc:${CARD_RARITY[c.r].col}"><div class="pc-q">?</div><div class="pc-n">Số ${c.no}</div><div class="pc-r">${starsOf(c)} ${CARD_RARITY[c.r].name}</div></div>`;
      return h + '</div><p class="dim">Mỗi gói bim bim Sao Vàng (căn tin, tạp hoá Cô Ba, TTTM) có 1 thẻ. TC = Tấn công · PT = Phòng thủ · TĐ = Tốc độ. Đấu thẻ với bạn: chọn 1 lá và 1 chỉ số để so — thắng lấy lá của bạn, thua mất lá của mình.</p>';
    }, {}, true);
  },

  /* ---------- Điện thoại: nhắn tin ---------- */
  phone() {
    this._chat = null; this._chatSub = null;
    const hs = id => { const n = hearts(id); return `<span class="hearts">${'♥'.repeat(n)}<i>${'♥'.repeat(5 - n)}</i></span>`; };
    this.panel('Điện thoại', () => {
      const id = UI._chat;
      if (!id) {
        let h = '<div class="rows">';
        for (const c of PHONE_CONTACTS) {
          const C = contactOf(c), a = G.phone.msgs[c] || [], last = a[a.length - 1], un = G.phone.unread[c] || 0;
          h += `<button class="crow" data-act="open" data-id="${c}"><b>${C.name}</b>${c === 'mom' ? '' : hs(c)}${un ? `<i class="dot on">${un}</i>` : ''}<small>${last ? (last.m ? 'Bạn: ' : '') + last.t : C.note}</small></button>`;
        }
        h += '</div>';
        if (G.meet && G.meet.day >= G.day) h += `<p class="okbox">Đã hẹn ${FRIENDS[G.meet.fid].name}: ${meetWhen(G.meet)} ở ${PLACES[G.meet.place].name}.</p>`;
        return h + '<p class="dim">Nhắn tin không tốn thời gian. Rủ bạn đi chơi: bạn ấy sẽ đợi ở chỗ hẹn (trà sữa, TTTM, khu game ở phố Hoa Phượng; công viên; núi sau trường; bãi biển). Lỡ hẹn là bạn giận đó.</p>';
      }
      const C = contactOf(id), a = (G.phone.msgs[id] || []).slice(-9);
      let h = `<div class="chead"><button class="btn sm" data-act="back">‹ Danh bạ</button><b>${C.name}</b>${id === 'mom' ? '' : hs(id)}</div><div class="chat">`;
      h += a.length ? a.map(m => `<div class="msg ${m.m ? 'me' : ''}"><span>${m.t}</span></div>`).join('') : '<p class="dim">Chưa có tin nhắn nào. Gõ gì đó đi!</p>';
      h += '</div><div class="btns">';
      if (UI._chatSub === 'place') h += Object.keys(PLACES).map(p => `<button class="btn" data-act="go" data-id="${p}">${PLACES[p].name}${PLACE_LIKES[id].includes(p) ? ' ♥' : ''}</button>`).join('') + '<button class="btn ghost" data-act="sub" data-id="">Thôi</button>';
      else h += phoneActions(id).map(([k, t]) => `<button class="btn" data-act="${k === 'ru' ? 'sub' : 'send'}" data-id="${k === 'ru' ? 'place' : k}">${t}</button>`).join('');
      return h + '</div>' + (UI._chatSub === 'place' ? `<p class="dim">♥ = chỗ ${C.name} thích (dễ nhận lời hơn). Đang trong giờ học thì hẹn sau khi tan; muộn quá thì hẹn hôm sau.</p>` : '');
    }, {
      open: d => { UI._chat = d.id; UI._chatSub = null; G.phone.unread[d.id] = 0; },
      back: () => { UI._chat = null; UI._chatSub = null; },
      sub: d => { UI._chatSub = d.id || null; },
      send: d => { phoneSend(UI._chat, d.id); },
      go: d => { UI._chatSub = null; phoneSend(UI._chat, 'go', d.id); },
    });
  },

  /* ---------- Soạn cặp (ở bàn học) ---------- */
  pack() {
    const it = id => `<button class="it ${G.bag[id] ? 'on' : ''}" data-act="tg" data-id="${id}">${ITEMS[id].name}</button>`;
    this.panel('Soạn cặp sách', () => {
      const day = packTargetDay();
      let left = '<div class="pcol"><h4>Chưa có ngày học nào sắp tới</h4></div>', miss = 0;
      if (day !== null) {
        const tt = TIMETABLE[cal(day).dow];
        miss = neededItems(day).filter(i => !G.bag[i] && i !== 'thehs' && i !== 'vethang').length;
        left = `<div class="pcol"><h4>${day === G.day ? 'Hôm nay' : 'Ngày học tới'} · ${dateLabel(day)}</h4><ol class="ttl">` + tt.map((s, i) => `<li class="${i === 4 ? 'pm' : ''}"><span class="chip" style="background:${SUBJ[s].color}">${SUBJ[s].short}</span>${SUBJ[s].name}</li>`).join('') + '</ol></div>';
      }
      let right = '<div class="pcol"><h4>Dụng cụ</h4><div class="chips">' + it('hopbut') + it('thehs') + (G.busPassUntil >= G.day ? it('vethang') : '') + '</div><h4>Đồng phục</h4><div class="chips">' + it('dp_td') + it('dp_qp') + '</div><h4>Sách</h4><div class="bgrid">';
      for (const s of BOOK_SUBJ) right += it('sach_' + s);
      right += '</div></div>';
      const status = day === null ? '' : (miss ? `<p class="warnbox">Còn thiếu <b>${miss}</b> món so với thời khoá biểu.</p>` : '<p class="okbox">Đã đủ đồ theo thời khoá biểu.</p>');
      return `<div class="pack">${left}${right}</div>${status}<div class="btns"><button class="btn" data-act="quick">Soạn nhanh theo TKB (mất 10 phút)</button><button class="btn ghost" data-act="clear">Bỏ hết ra</button><button class="btn primary" data-close="1">Xong</button></div><p class="dim">Mỗi tiết chỉ cần mang <b>sách</b> của môn đó: +5 điểm/tiết. Quên sách: quay sang mượn bạn (+3/+4, không mượn được thì +1). Tự học ở trường cũng chỉ học được môn có mang sách.</p>`;
    }, {
      tg: d => { if (G.bag[d.id]) delete G.bag[d.id]; else G.bag[d.id] = true; },
      clear: () => { G.bag = {}; },
      quick: () => { const day = packTargetDay(); if (day === null) return; quickPack(day); advanceTime(10); UI.toast('Đã soạn cặp theo thời khoá biểu (10 phút).', 'good'); },
    }, true);
  },

  /* ---------- Chỉ số ---------- */
  stats() {
    const bar = (cur, need, col) => `<div class="pb"><div style="width:${need ? Math.round(100 * cur / need) : 100}%;background:${col || ''}"></div></div>`;
    const cell = k => { const i = lvlInfo(G.stats[k]), col = SUBJ[k] ? SUBJ[k].color : ({ thethao: '#d9742b', buonban: '#c9862b', giaotiep: '#e06a9a', kheotay: '#3f8f9b' })[k]; return `<div class="st"><div class="sth"><b>${STAT_NAMES[k]}</b><span class="lv">Lv ${i.lv}</span></div>${bar(i.cur, i.need, col)}<small>${i.lv >= 10 ? 'Tối đa' : `${i.cur}/${i.need}`}</small></div>`; };
    this.panel('Chỉ số', () => {
      const tl = tlInfo(G.tlXp), pa = parentInfo(G.parent);
      let h = '<h4>Chỉ số chính</h4><div class="sgrid two">';
      h += `<div class="st"><div class="sth"><b>Thể lực</b><span class="lv">Lv ${tl.lv}</span></div>${bar(tl.cur, tl.need, '#5fb0e0')}<small>${tl.lv >= 10 ? 'Tối đa' : `${Math.round(tl.cur)}/${tl.need} để lên cấp`} · tối đa ${tl.max} thể lực</small></div>`;
      h += `<div class="st"><div class="sth"><b>Tiền tiêu vặt</b><span class="lv">Lv ${pa.lv}</span></div>${bar(pa.cur, pa.need, '#5fae4a')}<small>${PARENT_TITLE[pa.lv]} · thiện cảm bố mẹ ${Math.round(pa.pts)}/${PARENT_MAX} · mẹ cho ${fmtMoney(pa.allowance)}/tuần</small></div>`;
      const tl2 = teacherLv();
      h += `<div class="st"><div class="sth"><b>Thiện cảm thầy cô</b><span class="lv">Lv ${tl2}</span></div>${bar(tl2 >= 5 ? 1 : G.teacher % TEACHER.perLv, tl2 >= 5 ? 1 : TEACHER.perLv, '#9a72d6')}<small>${TEACHER_TITLE[tl2]} · ${Math.round(G.teacher)}/${TEACHER.max} · chấm bài ${tl2 > 1 ? '+' + fmtScore(TEACHER.gradePerLv * (tl2 - 1)) : tl2 < 1 ? '−' + fmtScore(TEACHER.gradePerLv) : '±0'} điểm · quay cóp bị bắt ${Math.round(cheatRisk() * 100)}%</small></div>`;
      h += `<div class="st"><div class="sth"><b>Thẻ cầu thủ</b><span class="lv">${cardKinds()}/${CARDS.length}</span></div>${bar(cardKinds(), CARDS.length, '#f2a93b')}<small>${cardCount()} lá · xem bộ sưu tập trong Cặp sách</small></div>`;
      h += '</div><p class="dim">Bố mẹ càng hài lòng (trò chuyện, đấm lưng, phụ việc nhà, điểm cao) thì tiền tiêu vặt càng nhiều. 20:00 chưa về nhà (mà cũng chưa xin phép), bị cô báo phụ huynh hay bị bắt hút thuốc sẽ làm bố mẹ phiền lòng. Thầy cô quý (xung phong, phát biểu, trực nhật, tố cáo bạn rủ rê) thì chấm bài nhẹ tay và khó bắt quay cóp hơn; bị bắt làm việc riêng, trốn học, quay cóp thì mất thiện cảm.</p>';
      h += '<h4>Năng lực tổng hợp</h4><div class="sgrid two"><div class="st big"><div class="sth"><b>Lý thuyết</b><span class="lv">' + fmtAvg(lyThuyet()) + '</span></div><small>TB cấp: Toán, Văn, Anh, Lý, Hoá, Sử, Địa</small></div><div class="st big"><div class="sth"><b>Thực hành</b><span class="lv">' + fmtAvg(thucHanh()) + '</span></div><small>TB cấp: Quốc phòng + thực hành Lý, Hoá, Sinh</small></div></div><h4>Môn học (lý thuyết)</h4><div class="sgrid">';
      for (const k of ['toan', 'van', 'anh', 'ly', 'hoa', 'sinh', 'su', 'dia']) h += cell(k);
      h += '</div><h4>Thực hành (tăng qua buổi thực hành và minigame)</h4><div class="sgrid">';
      for (const k of PRACTICE) h += cell(k);
      h += '</div><h4>Kỹ năng khác</h4><div class="sgrid">';
      for (const k of ['thethao', 'buonban', 'giaotiep', 'kheotay']) h += cell(k);
      h += '</div><h4>Bạn bè</h4><div class="sgrid">';
      for (const f in FRIENDS) { const hs = hearts(f); h += `<div class="st"><div class="sth"><b>${FRIENDS[f].name}</b><span class="hearts">${'♥'.repeat(hs)}<i>${'♥'.repeat(5 - hs)}</i></span></div><small>${FRIENDS[f].note}</small></div>`; }
      return h + '</div><p class="dim">Mỗi chỉ số hỗ trợ có 10 cấp: cấp 1 cần 50 điểm, mỗi cấp sau cần thêm 20 điểm so với cấp trước. Lý thuyết và Thực hành càng cao thì càng dễ gặp may khi kiểm tra.</p>';
    }, {}, true);
  },

  /* ---------- Thời khoá biểu + lịch kiểm tra ---------- */
  timetable() {
    this.panel('Thời khoá biểu', () => {
      const c = today(), sd = schoolToday(), cp = currentPeriod();
      let h = '<table class="tt"><tr><th></th>' + [0, 1, 2, 3, 4].map(d => `<th class="${sd && c.dow === d ? 'now' : ''}">${DOW[d]}</th>`).join('') + '</tr>';
      for (let p = 0; p < 9; p++) {
        if (p === 4) h += '<tr class="gap"><td colspan="6">Nghỉ trưa · 10:40 – 13:30</td></tr>';
        h += `<tr><td class="pn">Tiết ${p + 1}<small>${fmtTime(PERIODS[p].start)}</small></td>` + [0, 1, 2, 3, 4].map(d => { const s = TIMETABLE[d][p]; return `<td class="${sd && c.dow === d ? 'now' : ''} ${sd && c.dow === d && cp && cp.n === p + 1 ? 'cur' : ''}"><span class="chip" style="background:${SUBJ[s].color}">${SUBJ[s].short}</span></td>`; }).join('') + '</tr>';
      }
      return h + "</table><p class=\"dim\">Ô “TH” là buổi thực hành riêng (minigame). Mỗi tiết 30', nghỉ 10'; sau mỗi 2 tiết ra chơi 20'. Lịch kiểm tra 1 tiết và thi học kỳ xem ở <b>Lịch</b> (phím L).</p><div class=\"btns\"><button class=\"btn\" data-act=\"cal\">Mở Lịch</button></div>";
    }, { cal: () => UI.calendar() }, true);
  },

  /* ---------- Lịch (kiểu Stardew Valley): ngày tháng, ngày lễ / lễ hội, sinh nhật, lịch kiểm tra ---------- */
  calendar() {
    const c0 = today(); this._calS = c0.season; this._calY = c0.year;
    this.panel('Lịch', () => {
      const yr = UI._calY, se = UI._calS, base = yr * YEAR_DAYS + se * CFG.DAYS_PER_SEASON, tests = {};
      for (const t of G.tests) (tests[t.day] = tests[t.day] || []).push(t);
      let h = `<div class="calhead"><button class="btn sm" data-act="prev">‹</button><b>Mùa ${SEASONS[se].name} · Năm ${yr + 1}</b><button class="btn sm" data-act="next">›</button><button class="btn sm ghost" data-act="now">Hôm nay</button><span class="dim">${dateLabel(G.day)}</span></div><div class="cal">`;
      h += DOW.map((d, i) => `<div class="cd h ${i >= 5 ? 'we' : ''}">${d}</div>`).join('');
      for (let i = 0; i < cal(base).dow; i++) h += '<div class="cd x"></div>';
      for (let d = 0; d < CFG.DAYS_PER_SEASON; d++) {
        const day = base + d, c = cal(day), ev = [], hol = holidayOf(day), sem = semOf(day);
        if (sem && c.doy === sem.from) ev.push(`<span class="ev sem">Bắt đầu ${sem.name}</span>`);
        if (sem && c.doy === sem.to) ev.push(`<span class="ev sem">Tổng kết ${sem.name}</span>`);
        if (hol) ev.push(`<span class="ev hol">${hol.name}</span>`);
        for (const f of FESTIVALS) if (f.season === se && f.day === d + 1) ev.push(`<span class="ev fes">${f.name}</span>`);
        for (const f in FRIENDS) if (isDate(FRIENDS[f].bday, day)) ev.push(`<span class="ev bd">Sinh nhật ${FRIENDS[f].name}</span>`);
        for (const w in PARENT_BDAY) if (isDate(PARENT_BDAY[w], day)) ev.push(`<span class="ev bd">Sinh nhật ${PNAME[w].toLowerCase()}</span>`);
        for (const t of tests[day] || []) ev.push(`<span class="ev ts ${t.done ? 'done' : ''}" style="--c:${SUBJ[t.subj].color}" title="${TEST_NAME[t.type]} · ${SUBJ[t.subj].name}">${SUBJ[t.subj].short} · ${t.type === 'thi' ? 'thi' : '1 tiết'}</span>`);
        if (G.meet && G.meet.day === day) ev.push(`<span class="ev mt">Hẹn ${FRIENDS[G.meet.fid].name}</span>`);
        const off = c.dow >= 5 || !SEASONS[se].school || hol;
        h += `<div class="cd ${day === G.day ? 'today' : ''} ${day < G.day ? 'past' : ''} ${off ? 'we' : ''}"><b>${d + 1}</b>${ev.join('')}</div>`;
      }
      h += '</div><div class="callegend"><span class="ev ts" style="--c:#7a7085">Kiểm tra 1 tiết / thi</span><span class="ev bd">Sinh nhật</span><span class="ev hol">Ngày lễ</span><span class="ev fes">Lễ hội</span><span class="ev mt">Cuộc hẹn</span><span class="ev sem">Học kỳ</span></div>';
      return h + `<p class="dim">${SEASONS[se].school ? 'Ô màu nhạt là ngày nghỉ (thứ 7, chủ nhật, ngày lễ).' : 'Nghỉ hè — không có tiết học.'} Lịch kiểm tra của một học kỳ được xếp vào ngày đầu học kỳ đó. Sinh nhật bạn bè: chúc mừng được +${BDAY_FRIEND} thân thiết, tặng quà hôm đó được cộng gấp đôi.${FESTIVALS.length ? '' : ' Lễ hội sẽ được bổ sung sau.'}</p>`;
    }, {
      prev: () => { if (--UI._calS < 0) { if (UI._calY > 0) { UI._calS = SEASONS.length - 1; UI._calY--; } else UI._calS = 0; } },
      next: () => { if (++UI._calS >= SEASONS.length) { UI._calS = 0; UI._calY++; } },
      now: () => { const c = today(); UI._calS = c.season; UI._calY = c.year; },
    }, true);
  },

  /* ---------- Sổ điểm ---------- */
  grades() {
    const s0 = semOf(G.day); this._gsem = s0 ? s0.id : (today().doy > 59 ? 2 : 1);
    this.panel('Sổ điểm', () => {
      const year = today().year, key = year + '-' + UI._gsem, g = G.grades[key] || {}, rep = semReport(key);
      let h = '<div class="tabs">' + SEMESTERS.map(s => `<button class="tab ${UI._gsem === s.id ? 'on' : ''}" data-act="sem" data-id="${s.id}">${s.name}</button>`).join('') + '</div>';
      h += "<table class=\"tb\"><tr><th>Môn</th><th>Miệng ×1</th><th>15' ×1</th><th>1 tiết ×2</th><th>Thi ×3</th><th>TB</th></tr>";
      for (const s of GRADED) {
        const a = g[s] || [], col = t => a.filter(x => x.t === t).map(x => fmtScore(x.s)).join(' · ') || '–';
        h += `<tr><td><span class="chip" style="background:${SUBJ[s].color}">${SUBJ[s].short}</span></td><td>${col('mieng')}</td><td>${col('p15')}</td><td>${col('tiet')}</td><td>${col('thi')}</td><td><b>${fmtAvg(rep.rows[s])}</b></td></tr>`;
      }
      h += `</table><div class="sum"><span>Điểm tổng kết <b>${fmtAvg(rep.avg)}</b></span><span>Học lực tạm tính <b class="tag">${rep.hl}</b></span></div>`;
      const yr = yearReport(year);
      if (yr.hk1.avg !== null && yr.hk2.avg !== null) h += `<div class="sum"><span>Cả năm <b>${fmtAvg(yr.avg)}</b></span><span>Học lực <b class="tag">${yr.hl}</b></span></div>`;
      const log = G.conductLog.filter(e => cal(e.day).year === year);
      h += `<h4>Hạnh kiểm</h4><div class="sum"><span>Hiện tại <b>${fmtScore(G.conduct)}</b>/10</span><span><b class="tag">${hanhKiem(G.conduct)}</b></span></div>`;
      if (log.length) h += '<p>Các kỳ 2 tuần đã chốt: ' + log.map(e => `<b>${fmtScore(e.score)}</b> (${hanhKiem(e.score)})`).join(' · ') + '</p>';
      h += '<p class="dim">Giỏi: ĐTB ≥ 8,0 và Toán hoặc Văn ≥ 8,0 · Khá: ≥ 6,0 · Trung bình: ≥ 4,0. Hạnh kiểm: 8–10 Tốt · 6–8 Khá · 4–6 Trung bình · dưới 4 Yếu.</p>';
      if (G.reports.length) h += '<h4>Các năm trước</h4>' + G.reports.map(r => `<p>Lớp ${r.grade}: ĐTB <b>${fmtAvg(r.avg)}</b> · ${r.hl} · Hạnh kiểm ${r.hk}${r.title ? ' · ' + r.title : ''}</p>`).join('');
      return h;
    }, { sem: d => { UI._gsem = +d.id; } }, true);
  },

  /* ---------- Tạp hoá ---------- */
  shop() {
    this.panel('Tạp hoá Cô Ba', () => {
      let h = `<p>“Mua gì con?” — Bạn đang có <b>${fmtMoney(G.money)}</b>.</p><div class="rows">`;
      for (const it of SHOP) {
        const owned = (it.own && G.owned[it.own]) || (it.special === 'vethang' && G.busPassUntil >= G.day);
        h += `<div class="rowi"><span><b>${it.name}</b> <small>${it.desc}</small></span><button class="btn sm" data-act="buy" data-id="${it.id}" ${owned || G.money < it.price ? 'disabled' : ''}>${owned ? 'Đã có' : fmtMoney(it.price)}</button></div>`;
      }
      if (fishCount()) h += `</div><h4>Bán cá câu được</h4><div class="rowi"><span><b>${fishCount()} con cá</b> <small>${FISH.filter(f => G.fish[f.id]).map(f => `${f.name} ×${G.fish[f.id]}`).join(' · ')}</small></span><button class="btn sm" data-act="fish">Bán hết · ${fmtMoney(fishValue())}</button>`;
      h += `</div><h4>Phụ bán hàng (ngày nghỉ, 08:00–18:00)</h4><div class="rowi"><span><b>Phụ cô Ba 2 tiếng</b> <small>+${fmtMoney(PART_TIME.pay + PART_TIME.payPerLv * lv('buonban'))} · +${PART_TIME.pts} Buôn bán · −${PART_TIME.stam} thể lực</small></span><button class="btn sm" data-act="pt">Nhận việc</button></div>`;
      return h;
    }, { buy: d => buy(SHOP.find(x => x.id === d.id)), pt: () => { partTime(); }, fish: () => sellFish() }, true);
  },

  /* ---------- Cài đặt ---------- */
  settings() {
    this.panel('Cài đặt', () => {
      return `<h4>Tốc độ thời gian</h4><p>Mỗi <b id="spv">${G.speed}</b> giây thực = 10 phút trong game <small class="dim">(một ngày 05:00 → 03:00 dài khoảng ${Math.round(132 * G.speed / 60)} phút nếu không bỏ qua)</small></p>
      <input type="range" id="spd" min="2" max="12" step="1" value="${G.speed}">
      <h4>Điều khiển</h4><p><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> di chuyển · <kbd>Chuột phải</kbd> vào đồ vật để tương tác (hoặc <kbd>E</kbd>) · <kbd>B</kbd> cặp · <kbd>C</kbd> chỉ số · <kbd>T</kbd> thời khoá biểu · <kbd>G</kbd> sổ điểm · <kbd>L</kbd> lịch · <kbd>P</kbd> điện thoại · <kbd>X</kbd> xuống xe · <kbd>Esc</kbd> cài đặt</p>
      <h4>Lưu game</h4><p class="dim">Game tự lưu mỗi sáng vào trình duyệt này. Muốn chuyển máy hoặc giữ chắc, hãy sao chép mã lưu.</p>
      <div class="btns"><button class="btn" data-act="save">Lưu ngay</button><button class="btn" data-act="copy">Sao chép mã lưu</button></div>
      <textarea id="imp" placeholder="Dán mã lưu vào đây…"></textarea>
      <div class="btns"><button class="btn" data-act="imp">Nhập mã lưu</button><button class="btn danger" data-act="reset">Chơi lại từ đầu</button></div>`;
    }, {
      save: () => { UI.toast(save() ? 'Đã lưu.' : 'Trình duyệt không cho lưu. Hãy sao chép mã lưu.', 'good'); },
      copy: () => { const code = exportCode(); const ta = $('imp'); const done = ok => UI.toast(ok ? 'Đã sao chép mã lưu.' : 'Mã lưu nằm trong ô bên dưới — hãy chép tay.', 'good'); try { navigator.clipboard.writeText(code).then(() => done(true), () => { ta.value = code; done(false); }); } catch (e) { ta.value = code; done(false); } },
      imp: () => { const v = $('imp').value; if (!v.trim()) return UI.toast('Chưa dán mã lưu.'); if (importCode(v)) { save(); UI.close(-1); UI.hud(); UI.toast('Đã nhập mã lưu.', 'good'); } else UI.toast('Mã lưu không hợp lệ.', 'bad'); },
      reset: (d, el) => { if (el.dataset.sure) { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } location.reload(); } else { el.dataset.sure = '1'; el.textContent = 'Bấm lần nữa để xoá'; UI._panel._keep = true; } },
    }, true);
  },
};
// refresh() vẽ lại nội dung nên nút "chơi lại" cần giữ trạng thái xác nhận: bỏ qua refresh một lần
const _refresh = UI.refresh.bind(UI);
UI.refresh = function () { if (this._panel && this._panel._keep) { this._panel._keep = false; return; } _refresh(); };

function bindUI() {
  $('modal').addEventListener('click', UI._click);
  $('m-x').addEventListener('click', () => UI.close(UI._res ? UI._esc : -1));
  $('modal-wrap').addEventListener('input', e => { if (e.target.id === 'spd') { G.speed = +e.target.value; $('spv').textContent = G.speed; } });
  $('hotbar').addEventListener('click', e => {
    const b = e.target.closest('[data-hb]'); if (!b) return; b.blur();
    if (!G || RT.lock || UI.isOpen()) return;
    const a = b.dataset.hb;
    if (a === 'eat') eat(b.dataset.id); else if (a === 'cards') UI.cards(); else if (a === 'off') dismount(); else UI.toast(b.title);
  });
  $('menu').addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (!b) return; b.blur(); if (!G || RT.lock) return; openMenu(b.dataset.m); });
}
function openMenu(k) {
  if (!G || RT.lock) return;
  if (k === 'bag') UI.bag(); else if (k === 'stats') UI.stats(); else if (k === 'tt') UI.timetable(); else if (k === 'grades') UI.grades(); else if (k === 'phone') UI.phone(); else if (k === 'cal') UI.calendar(); else if (k === 'set') UI.settings();
}
