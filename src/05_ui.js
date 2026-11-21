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
  _open(title, body, res, esc, wide, who) {
    if (this.isOpen()) this.close(-1);
    $('m-title').textContent = title; $('m-body').innerHTML = body;
    $('modal').classList.toggle('wide', !!wide);
    const sp = who || (res ? speakerOf(title) : null);         // hội thoại với nhân vật: hiện ở dưới, có chân dung
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
      this._open(title, html + `<div class="btns ${opts.cls || (opts.grid ? 'grid' : (buttons.length > 2 ? 'col' : ''))}">${btns}</div>`, res, opts.esc !== undefined ? opts.esc : buttons.length - 1, false, opts.who);      // opts.who = { look, outfit }: ép hiện hội thoại ở dưới với chân dung này
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
    const pl = periodLabel(); $('h-phase').textContent = pl || phaseLabel().replace(/^Giai đoạn \d · /, ''); $('h-phase').classList.toggle('per', !!pl);
    $('h-phase').title = phaseLabel();
    const sp = Math.max(0, Math.min(1, G.stamina / mx));
    $('h-stam').style.height = Math.round(100 * sp) + '%';
    $('h-stam').className = sp < 0.2 || G.stamina < 15 ? 'low' : sp < 0.5 ? 'mid' : '';
    $('stambar').title = `Thể lực ${Math.round(G.stamina)}/${mx}`;
    $('h-stamtx').textContent = Math.round(G.stamina);
    $('h-money').innerHTML = fmtMoney(G.money) + (wageTotal() ? ` <small class="wage" title="Tiền công hôm nay — nhận vào cuối ngày">+${fmtMoney(wageTotal())}</small>` : '');
    $('h-conduct').textContent = fmtScore(G.conduct);
    const un = unreadCount(), dot = $('ph-dot'); dot.textContent = un || ''; dot.classList.toggle('on', un > 0);
    const nq = G.tasks ? G.tasks.active.length : 0, qd = $('q-dot'); qd.textContent = nq || ''; qd.classList.toggle('on', nq > 0);
    this.hotbar();
    // việc cần làm: dạng dropdown, mặc định thu gọn (bấm tiêu đề để mở / đóng) cho khỏi che nhân vật
    const td = todoList(), left = td.filter(x => !x[0]).length, el = $('todo');
    if (!el._bound) { el._bound = true; el.addEventListener('click', () => { UI._todoOpen = !UI._todoOpen; try { localStorage.setItem('tat_todo', UI._todoOpen ? '1' : ''); } catch (e) {} UI.hud(); }); try { UI._todoOpen = !!localStorage.getItem('tat_todo'); } catch (e) {} }
    el.classList.toggle('open', !!UI._todoOpen);
    el.innerHTML = td.length ? `<b class="th">Việc cần làm${left ? ` <span class="n">${left}</span>` : ''}<span class="ar">${UI._todoOpen ? '▾' : '▸'}</span></b>` + (UI._todoOpen ? td.map(([ok, s]) => `<div class="${ok ? 'ok' : ''}"><i></i>${s}</div>`).join('') : '') : '';
  },
  /* ---------- Thanh đồ (góc dưới): đang mang gì trong cặp ---------- */
  hotbarItems() {
    const it = [], add = (id, n, title, act, lab) => it.push({ id, n, title, act: act || '', lab: lab || '' });
    for (const k of Object.keys(ITEMS)) if (G.bag[k]) add(k, 0, ITEMS[k].name + (ITEMS[k].desc ? ' — ' + ITEMS[k].desc : ''), '', ITEMS[k].subj ? SUBJ[ITEMS[k].subj].short : '');
    for (const k in FOODS) if (G.inv[k]) add(k, G.inv[k], `${FOODS[k].name} — bấm để cầm lên (bấm vào mình để ăn, vào người khác để tặng)`, 'hold');
    if (G.inv.banhtrang) add('banhtrang', G.inv.banhtrang, 'Bánh tráng trộn — hàng để mời bạn mua giờ ra chơi');
    if (cardCount()) add('the', cardCount(), 'Thẻ cầu thủ — bấm để xem bộ sưu tập', 'cards');
    if (G.inv.gaubong) add('gaubong', G.inv.gaubong, 'Gấu bông — bấm để cầm lên rồi bấm vào bạn để tặng', 'hold');
    if (G.inv.voso) add('voso', G.inv.voso, 'Vỏ sò — bấm để cầm lên rồi bấm vào bạn để tặng', 'hold');
    for (const k in PARENT_ITEMS) if (G.inv[k]) add(k, 1, `${PARENT_ITEMS[k]} — bấm để cầm lên rồi bấm vào bố / mẹ để đưa tận tay`, 'hold');
    for (const k in GROUP_ITEMS) if (G.inv[k]) add(k, 1, `${GROUP_ITEMS[k]} — bấm để cầm lên rồi bấm vào bạn đã nhờ để đưa tận tay`, 'hold');
    if (G.inv.denongsao) add('denongsao', G.inv.denongsao, 'Đèn ông sao tự làm — bấm để cầm lên (rước đèn, hoặc tặng bạn)', 'hold');
    for (const m of TT_MATS) if (G.inv[m.id]) add(m.id, G.inv[m.id], `${m.name} — nguyên liệu làm đèn ông sao (mang tới sạp làm đèn lồng đêm Trung thu)`);
    if (fishCount()) add('ca', fishCount(), 'Cá câu được — bán cho Cô Ba hoặc đưa mẹ nấu');
    if (G.owned.cancau) add('cancau', 0, 'Cần câu — câu cá ở bờ sông');
    return it;
  },
  hotbar() {
    const it = this.hotbarItems(), sig = it.map(x => x.id + ':' + x.n).join('|') + '#' + (G.ride || '') + '#' + (RT.hold || '');
    if (sig === this._hb) return; this._hb = sig;
    $('hotbar').innerHTML = it.map(x => `<button class="slot ${RT.hold === x.id ? 'held' : ''}" data-hb="${x.act}" data-id="${x.id}" title="${x.title}"><img src="${itemIcon(x.id)}" alt="">${x.n ? `<b>${x.n}</b>` : ''}${x.lab ? `<i>${x.lab}</i>` : ''}</button>`).join('')
      + (G.ride ? `<button class="slot txt" data-hb="off" title="Xuống xe">Xuống xe <kbd>X</kbd></button>` : '');
  },
  hint(text, ok, key) {
    const h = $('hint');
    if (!text) { h.classList.remove('on'); return; }
    if (h._t !== text || h._ok !== ok || h._key !== key) { h._t = text; h._ok = ok; h._key = key; h.innerHTML = (key ? `<kbd>${key}</kbd>` : ok ? '<kbd>Chuột phải</kbd><kbd>E</kbd>' : '<em>Lại gần hơn</em>') + '<span></span>'; h.lastChild.textContent = text; h.classList.toggle('far', !ok); h.classList.toggle('btnlike', key === 'X'); }
    h.classList.add('on');
  },

  /* ---------- Cặp sách ---------- */
  bag() {
    this.panel('Túi đồ', () => {
      const inBag = Object.keys(ITEMS).filter(i => G.bag[i]);
      let h = '<h4>Đang mang trong cặp</h4><div class="chips">' + (inBag.length ? inBag.map(i => `<span class="it on">${ITEMS[i].name}</span>`).join('') : '<span class="dim">Cặp trống.</span>') + '</div>';
      if (schoolToday() && G.time < schoolEndT()) { const ms = missingToday(); h += ms.length ? `<p class="warnbox">So với thời khoá biểu hôm nay còn thiếu ${ms.length} món. Chỉ soạn cặp được ở bàn học tại nhà.</p>` : '<p class="okbox">Đủ đồ cho thời khoá biểu hôm nay.</p>'; }
      h += '<h4>Đồ ăn mang theo</h4><div class="rows">';
      let any = false;
      for (const id in FOODS) if (G.inv[id]) { any = true; h += `<div class="rowi"><span><b>${FOODS[id].name}</b> ×${G.inv[id]} <small>+${FOODS[id].stam} thể lực</small></span><button class="btn sm" data-act="hold" data-id="${id}">${RT.hold === id ? 'Cất đi' : 'Cầm lên'}</button></div>`; }
      if (!any) h += '<span class="dim">Không có gì để ăn.</span>';
      h += '</div><h4>Hàng để bán</h4><p>Bánh tráng trộn: <b>' + (G.inv.banhtrang || 0) + '</b> bịch <small class="dim">— mời bạn mua trong giờ ra chơi</small></p>';
      h += `<h4>Thẻ cầu thủ & quà</h4><div class="rowi"><span><b>Thẻ cầu thủ</b> ${cardCount()} lá · ${cardKinds()}/${CARDS.length} loại <small>bóc trong gói bim bim Sao Vàng, đem đấu với bạn</small></span><button class="btn sm" data-act="cards">Bộ sưu tập</button></div>`;
      if (G.inv.gaubong) h += `<div class="rowi"><span><b>Gấu bông</b> ×${G.inv.gaubong} <small>quà tặng bạn thân</small></span><button class="btn sm" data-act="hold" data-id="gaubong">${RT.hold === 'gaubong' ? 'Cất đi' : 'Cầm lên'}</button></div>`;
      const own = [['xedap', 'Xe đạp'], ['xedapdien', 'Xe đạp điện'], ['xemay', 'Xe máy 50cc'], ['daynhay', 'Dây nhảy'], ['tatay', 'Tạ tay'], ['xadon', 'Xà đơn'], ['cancau', 'Cần câu']].filter(([k]) => G.owned[k]).map(([, n]) => n);
      if (fishCount()) h += '<p>Cá câu được: ' + FISH.filter(f => G.fish[f.id]).map(f => `<b>${f.name}</b> ×${G.fish[f.id]}`).join(' · ') + ` <small class="dim">— bán cho Cô Ba được ${fmtMoney(fishValue())}, hoặc đưa mẹ nấu</small></p>`;
      if (G.inv.voso) h += `<div class="rowi"><span><b>Vỏ sò</b> ×${G.inv.voso} <small>quà tặng bạn thân</small></span><button class="btn sm" data-act="hold" data-id="voso">${RT.hold === 'voso' ? 'Cất đi' : 'Cầm lên'}</button></div>`;
      if (G.inv.denongsao) h += `<div class="rowi"><span><b>Đèn ông sao</b> ×${G.inv.denongsao} <small>tự làm đêm Trung thu</small></span><button class="btn sm" data-act="hold" data-id="denongsao">${RT.hold === 'denongsao' ? 'Cất đi' : 'Cầm lên'}</button></div>`;
      if (TT_MATS.some(m => G.inv[m.id])) h += `<h4>Nguyên liệu làm đèn lồng</h4><p>${TT_MATS.map(m => `${m.name}: <b>${G.inv[m.id] || 0}</b>`).join(' · ')} <small class="dim">— đủ cả ba thì làm được một chiếc đèn ông sao ở hội Trung thu</small></p>`;
      h += '<h4>Tài sản ở nhà</h4><p>' + (own.length ? own.join(' · ') : '<span class="dim">Chưa có gì.</span>') + '</p>';
      if (G.busPassUntil >= G.day) h += `<p>Vé tháng xe bus còn hạn đến <b>${dateLabel(G.busPassUntil)}</b>.</p>`;
      return h;
    }, { hold: d => { toggleHold(d.id); if (RT.hold) UI.close(-1); }, cards: () => UI.cards() });
  },

  cards() { this.menu('cards'); },

  /* ---------- Điện thoại: nhắn tin ---------- */
  phone() {
    this._chat = null; this._chatSub = null;
    const hs = id => { const n = hearts(id); return `<span class="hearts">${'♥'.repeat(n)}<i>${'♥'.repeat(5 - n)}</i></span>`; };
    this.panel('Điện thoại', () => {
      const id = UI._chat;
      if (!id) {
        let h = '<div class="rows">';
        const ga = G.phone.msgs.group || [], gl = ga[ga.length - 1], gu = G.phone.unread.group || 0, gopen = G.group ? G.group.reqs.filter(r => r.st === 'open').length : 0;
        h += `<button class="crow grp" data-act="open" data-id="group"><span class="gfaces">${['khoa', 'vy', 'sA'].map(l => `<img src="${faceOf(l, null)}" alt="">`).join('')}</span><b>Nhóm ${GROUP.name}</b>${gopen ? `<em class="gtag">${gopen} lời nhờ</em>` : ''}${gu ? `<i class="dot on">${gu}</i>` : ''}<small>${gl ? (gl.by === 'me' ? 'Bạn: ' : grName(gl.by) + ': ') + gl.t : 'Nhóm chung của học sinh toàn trường'}</small></button>`;
        for (const c of phoneList()) {
          const C = contactOf(c), a = G.phone.msgs[c] || [], last = a[a.length - 1], un = G.phone.unread[c] || 0;
          h += `<button class="crow" data-act="open" data-id="${c}"><b>${C.name}</b>${FRIENDS[c] ? hs(c) : ''}${un ? `<i class="dot on">${un}</i>` : ''}<small>${last ? (last.m ? 'Bạn: ' : '') + last.t : C.note}</small></button>`;
        }
        h += '</div>';
        if (phoneList().length < 2 + Object.keys(FRIENDS).length) h += `<p class="dim">Danh bạ mới chỉ có ${phoneList().length === 2 ? 'bố mẹ' : 'bố mẹ và vài người bạn'}. Chơi thân với bạn nào (từ ${PHONE_HEARTS}♥) thì gặp bạn ấy, chọn “Xin số điện thoại”.</p>`;
        if (G.meet && G.meet.day >= G.day) h += `<p class="okbox">Đã hẹn ${FRIENDS[G.meet.fid].name}: ${meetWhen(G.meet)} ở ${PLACES[G.meet.place].name}.</p>`;
        return h + '<p class="dim">Nhắn tin không tốn thời gian. Rủ bạn đi chơi: bạn ấy sẽ đợi ở chỗ hẹn (trà sữa, TTTM, khu game ở phố Hoa Phượng; công viên; núi sau trường; bãi biển). Lỡ hẹn là bạn giận đó.</p>';
      }
      if (id === 'group') return `<div class="chead"><button class="btn sm" data-act="back">‹ Danh bạ</button><b>Nhóm ${GROUP.name}</b></div><div class="chat gchat">${groupChatHtml()}</div><p class="dim">Bạn tự động được vào nhóm chung của trường. Ngày đi học, các bạn và anh chị khoá trên hay đăng nhờ vả (không đăng trong giờ học). Bấm <b>Nhận giúp</b> → việc vào danh sách Nhiệm vụ → lấy đồ cho vào túi → cầm lên → bấm vào người nhờ để đưa tận tay. Giúp xong được thân thiết hơn. Để lâu không ai nhận thì bạn khác giúp mất.</p>`;
      const C = contactOf(id), a = (G.phone.msgs[id] || []).slice(-9);
      let h = `<div class="chead"><button class="btn sm" data-act="back">‹ Danh bạ</button><b>${C.name}</b>${FRIENDS[id] ? hs(id) : ''}</div><div class="chat">`;
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
      grtake: d => { groupTake(+d.id); },
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
        left = `<div class="pcol"><h4>${day === G.day ? 'Hôm nay' : 'Ngày học tới'} · ${dateLabel(day)}</h4><ol class="ttl">` + tt.map((s, i) => s ? `<li class="${i === 4 ? 'pm' : ''}"><span class="chip" style="background:${SUBJ[s].color}">${SUBJ[s].short}</span>${SUBJ[s].name}</li>` : (i === 4 ? '<li class="pm"><i>Chiều nghỉ học</i></li>' : '')).join('') + '</ol></div>';
      }
      let right = '<div class="pcol"><h4>Dụng cụ</h4><div class="chips">' + it('hopbut') + it('thehs') + (G.busPassUntil >= G.day ? it('vethang') : '') + '</div><h4>Đồng phục</h4><div class="chips">' + it('dp_td') + it('dp_qp') + '</div><h4>Sách</h4><div class="bgrid">';
      for (const s of BOOK_SUBJ) right += it('sach_' + s);
      right += '</div></div>';
      const status = day === null ? '' : (miss ? `<p class="warnbox">Còn thiếu <b>${miss}</b> món so với thời khoá biểu.</p>` : '<p class="okbox">Đã đủ đồ theo thời khoá biểu.</p>');
      return `<div class="pack">${left}${right}</div>${status}<div class="btns"><button class="btn" data-act="quick">Soạn nhanh theo TKB (mất 10 phút)</button><button class="btn ghost" data-act="clear">Bỏ hết ra</button><button class="btn primary" data-close="1">Xong</button></div><p class="dim">Mỗi tiết chỉ cần mang <b>sách</b> của môn đó. Quên sách thì phải quay sang mượn bạn. Tự học ở trường cũng chỉ học được môn có mang sách.</p>`;
    }, {
      tg: d => { if (G.bag[d.id]) delete G.bag[d.id]; else G.bag[d.id] = true; },
      clear: () => { G.bag = {}; },
      quick: () => { const day = packTargetDay(); if (day === null) return; quickPack(day); advanceTime(10); UI.toast('Đã soạn cặp theo thời khoá biểu (10 phút).', 'good'); },
    }, true);
  },

  /* ---------- các bảng trong menu chung: xem MV bên dưới ---------- */
  stats() { this.menu('stats'); },
  timetable() { this.menu('tt'); },
  calendar() { this.menu('cal'); },
  grades() { this.menu('grades'); },

  /* Tạp hoá, căn tin, gian hàng TTTM: UI.store (cửa hàng dạng icon) — xem 05b_games.js */

  settings() { this.menu('set'); },
};
// refresh() vẽ lại nội dung nên nút "chơi lại" cần giữ trạng thái xác nhận: bỏ qua refresh một lần
const _refresh = UI.refresh.bind(UI);
UI.refresh = function () { if (this._panel && this._panel._keep) { this._panel._keep = false; return; } _refresh(); };

/* ============================================================
 *  MENU CHUNG (Esc hoặc M): một bảng duy nhất, các tab là icon
 *  Chỉ số · Bạn bè · Thời khoá biểu · Học bạ · Lịch · Thẻ cầu thủ · Cài đặt
 * ============================================================ */
const MENU_TABS = [['stats', 'Chỉ số'], ['friends', 'Bạn bè'], ['tt', 'Thời khoá biểu'], ['grades', 'Học bạ'], ['cal', 'Lịch'], ['cards', 'Thẻ cầu thủ'], ['map', 'Bản đồ'], ['memo', 'Lưu bút'], ['set', 'Cài đặt']];
const MV = {};
const subTabs = (act, cur, list) => '<div class="tabs">' + list.map(([id, name]) => `<button class="tab ${cur === id ? 'on' : ''}" data-act="${act}" data-id="${id}">${name}</button>`).join('') + '</div>';
const heartsHtml = n => `<span class="hearts">${'♥'.repeat(n)}<i>${'♥'.repeat(5 - n)}</i></span>`;
UI.menu = function (tab) {
  if (tab && MV[tab]) { this._tab = tab; if (MV[tab].init) MV[tab].init(); }
  if (!this._tab) { this._tab = 'stats'; }
  const H = { tab: d => { UI._tab = d.id; if (MV[d.id].init) MV[d.id].init(); } };
  for (const k in MV) Object.assign(H, MV[k].h || {});
  const name = () => MENU_TABS.find(x => x[0] === UI._tab)[1];
  this.panel('', () => {
    $('m-title').textContent = name();
    return `<div class="mtabs">${MENU_TABS.map(([id, nm]) => `<button class="mtab ${id === UI._tab ? 'on' : ''}" data-act="tab" data-id="${id}" title="${nm}"><img src="${itemIcon('m_' + id)}" alt="${nm}"></button>`).join('')}</div>` + MV[UI._tab].render();
  }, H, true);
  $('m-title').textContent = name();
};

/* ---------- Chỉ số: Lý thuyết · Thực hành · Khác ---------- */
MV.stats = {
  h: { stab: d => { UI._stab = d.id; } },
  render() {
    const st = UI._stab || 'ly';
    const bar = (cur, need, col) => `<div class="pb"><div style="width:${need ? Math.round(100 * cur / need) : 100}%;background:${col || ''}"></div></div>`;
    const cell = k => { const i = lvlInfo(G.stats[k]), col = SUBJ[k] ? SUBJ[k].color : ({ thethao: '#d9742b', buonban: '#c9862b', kheotay: '#3f8f9b', vannghe: '#9a72d6' })[k]; return `<div class="st"><div class="sth"><b>${STAT_NAMES[k]}</b><span class="lv">Lv ${i.lv}</span></div>${bar(i.cur, i.need, col)}<small>${i.lv >= 10 ? 'Tối đa' : `${i.cur}/${i.need}`}</small></div>`; };
    const big = (name, v, note) => `<div class="st big"><div class="sth"><b>${name}</b><span class="lv">${fmtAvg(v)}</span></div><small>${note}</small></div>`;
    let h = subTabs('stab', st, [['ly', 'Lý thuyết'], ['th', 'Thực hành'], ['khac', 'Khác']]);
    if (st === 'ly') h += big('Lý thuyết', lyThuyet(), 'Trung bình cấp các môn Toán, Văn, Anh, Lý, Hoá, Sử, Địa') + '<div class="sgrid">' + ['toan', 'van', 'anh', 'ly', 'hoa', 'sinh', 'su', 'dia'].map(cell).join('') + '</div>';
    else if (st === 'th') h += big('Thực hành', thucHanh(), 'Trung bình cấp Quốc phòng và thực hành Lý, Hoá, Sinh') + '<div class="sgrid">' + PRACTICE.map(cell).join('') + '</div>';
    else h += '<div class="sgrid">' + ['thethao', 'buonban', 'kheotay', 'vannghe'].map(cell).join('') + '</div>';
    return h;
  },
};

/* ---------- Bạn bè: bạn cùng lớp · gia đình · thầy cô · người ngoài xã hội ---------- */
MV.friends = {
  render() {
    const dl = d => `${d[1]} ${SEASONS[d[0]].name}`;
    const row = (look, outfit, name, note, n) => `<div class="frow"><img src="${faceOf(look, outfit)}" alt=""><div><b>${name}</b><small>${note}</small></div>${heartsHtml(n)}</div>`;
    let h = '<h4>Bạn bè</h4><div class="fgrid">';
    for (const f in FRIENDS) { const F = FRIENDS[f]; h += row(f, null, F.name, `${F.note} · sinh nhật ${dl(F.bday)}${grudge(f) ? ' · <b>đang giận bạn</b>' : ''}${isComp(f) ? ' · đang đi cùng bạn' : ''}`, hearts(f)); }
    h += '</div><h4>Gia đình</h4><div class="fgrid">';
    const pl = Math.min(5, Math.ceil(parentInfo(G.parent).lv / 2));
    for (const w of ['mom', 'dad']) h += row(w, null, PNAME[w], `sinh nhật ${dl(PARENT_BDAY[w])}`, pl);
    h += '</div><h4>Thầy cô</h4><div class="fgrid">';
    for (const t in TEACHERS) h += row(TEACHERS[t].look, null, TEACHERS[t].name, TEACHERS[t].note, teacherLv(t));
    h += '</div><h4>Ngoài xã hội</h4><div class="fgrid">';
    for (const k in SOCIETY) h += row(SOCIETY[k].look, null, SOCIETY[k].name, SOCIETY[k].note, Math.min(5, Math.floor((G.soc[k] || 0) / 20)));
    return h + '</div>';
  },
};

/* ---------- Thời khoá biểu ---------- */
MV.tt = {
  render() {
    const c = today(), sd = schoolToday(), cp = currentPeriod(), mon = G.day - c.dow, cut = [0, 1, 2, 3, 4].map(d => cutPeriods(mon + d)), evs = [0, 1, 2, 3, 4].map(d => schoolEventsOn(mon + d));
    let h = '<table class="tt"><tr><th></th>' + [0, 1, 2, 3, 4].map(d => `<th class="${sd && c.dow === d ? 'now' : ''}">${DOW[d]}<small>${cal(mon + d).dos} ${cal(mon + d).sName}</small></th>`).join('') + '</tr>';
    for (let p = 0; p < 9; p++) {
      if (p === 4) h += `<tr class="gap"><td colspan="6">Nghỉ trưa · ${fmtTime(AM_END)} – ${fmtTime(PM_START)}</td></tr>`;
      h += `<tr><td class="pn">Tiết ${p + 1}<small>${fmtTime(PERIODS[p].start)}</small></td>` + [0, 1, 2, 3, 4].map(d => { const s = TIMETABLE[d][p], ev = cut[d].has(p + 1) && evs[d].find(e => e.periods.includes(p + 1)); if (ev) return `<td class="${sd && c.dow === d ? 'now' : ''}"><span class="chip ev" style="background:${ev.col}">${ev.short}</span></td>`; if (!s) return `<td class="${sd && c.dow === d ? 'now' : ''}"><span class="chip off">Nghỉ</span></td>`; return `<td class="${sd && c.dow === d ? 'now' : ''} ${sd && c.dow === d && cp && cp.n === p + 1 ? 'cur' : ''}"><span class="chip" style="background:${SUBJ[s].color}">${SUBJ[s].short}</span></td>`; }).join('') + '</tr>';
    }
    const up = []; for (let d = G.day; d < G.day + 14; d++) for (const e of schoolEventsOn(d)) up.push(`<b>${dateLabel(d)}</b>: ${e.name} ${fmtTime(e.from)}–${fmtTime(e.to)} — nghỉ tiết ${e.periods.join(', ')}`);
    if (up.length) h += '</table><p class="okbox">Sự kiện của trường: ' + up.join(' · ') + '</p><table class="tt" style="display:none">';
    return h + `</table><p class="dim">Ô “TH” là buổi thực hành riêng. Mỗi tiết 30', hai tiết học liền nhau rồi ra chơi 30'; tan học ${fmtTime(CFG.SCHOOL_END)}, riêng thứ 4 và thứ 6 chỉ học buổi sáng (tan học ${fmtTime(AM_END)}). Lịch kiểm tra xem ở tab Lịch.</p>`;
  },
};

/* ---------- Học bạ ---------- */
MV.grades = {
  init() { const s0 = semOf(G.day); UI._gsem = s0 ? s0.id : (today().doy > 59 ? 2 : 1); },
  h: { sem: d => { UI._gsem = +d.id; } },
  render() {
    if (!UI._gsem) MV.grades.init();
    const year = today().year, key = year + '-' + UI._gsem, g = G.grades[key] || {}, rep = semReport(key);
    let h = subTabs('sem', UI._gsem, SEMESTERS.map(s => [s.id, s.name]));
    h += "<table class=\"tb\"><tr><th>Môn</th><th>Miệng</th><th>15'</th><th>1 tiết</th><th>Thi</th><th>TB</th></tr>";
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
  },
};

/* ---------- Lịch (kiểu Stardew Valley) — kiêm bảng chọn ngày khi du hành thời gian ---------- */
MV.cal = {
  init() { const c = today(); UI._calS = c.season; UI._calY = c.year; },
  h: {
    prev: () => { if (--UI._calS < 0) { if (UI._calY > 0) { UI._calS = SEASONS.length - 1; UI._calY--; } else UI._calS = 0; } },
    next: () => { if (++UI._calS >= SEASONS.length) { UI._calS = 0; UI._calY++; } },
    now: () => MV.cal.init(),
    jump: d => { const day = +d.id; UI._travel = false; UI.close(-1); timeTravelAsk(day); },
    notravel: () => { UI._travel = false; },
    day: d => { UI._calDay = UI._calDay === +d.id ? null : +d.id; },     // bấm vào một ngày: xem danh sách sự kiện
  },
  render() {
    if (UI._calS === undefined) MV.cal.init();
    const yr = UI._calY, se = UI._calS, base = yr * YEAR_DAYS + se * CFG.DAYS_PER_SEASON, tests = {}, tv = !!UI._travel;
    for (const t of G.tests) (tests[t.day] = tests[t.day] || []).push(t);
    let h = tv ? '<p class="warnbox">Du hành thời gian: bấm vào một ngày bất kỳ để nhảy tới ngày đó. <button class="btn sm ghost" data-act="notravel">Thôi</button></p>' : '';
    h += `<div class="calhead"><button class="btn sm" data-act="prev">‹</button><b>Mùa ${SEASONS[se].name} · Năm ${yr + 1}</b><button class="btn sm" data-act="next">›</button><button class="btn sm ghost" data-act="now">Hôm nay</button><span class="dim">${dateLabel(G.day)}</span></div><div class="cal">`;
    h += DOW.map((d, i) => `<div class="cd h ${i >= 5 ? 'we' : ''}">${d}</div>`).join('');
    for (let i = 0; i < cal(base).dow; i++) h += '<div class="cd x"></div>';
    for (let d = 0; d < CFG.DAYS_PER_SEASON; d++) {
      const day = base + d, c = cal(day), ev = [], hol = holidayOf(day), sem = semOf(day);
      // sự kiện hiện thành icon (di chuột / chạm vào icon để xem tên, bấm vào ngày để xem danh sách)
      if (sem && c.doy === sem.from) ev.push(calIco('ci_sem', `Bắt đầu ${sem.name}`, 'sem'));
      if (sem && c.doy === sem.to) ev.push(calIco('ci_semend', `Tổng kết ${sem.name}`, 'sem'));
      if (hol) ev.push(calIco(/Tết/.test(hol.name) ? 'ci_tet' : 'ci_hol', hol.name, 'hol'));
      if (isEveDay(day)) ev.push(calIco('sc_giaothua', 'Đón giao thừa trên núi', 'fes'));
      for (const f of FESTIVALS) if (f.season === se && f.day === d + 1) ev.push(calIco(f.icon || 'ci_fes', f.name, 'fes'));
      for (const e of schoolEventsOn(day)) ev.push(calIco(e.id === 'banhchung' ? 'sc_banhchung' : 'ci_fes', e.name, 'fes'));
      if (isHkDay(day)) ev.push(calIco('sc_hkpd', 'Hội khoẻ Phù Đổng', 'fes'));
      for (const f in FRIENDS) if (isDate(FRIENDS[f].bday, day)) ev.push(calIco('ci_bd', `Sinh nhật ${FRIENDS[f].name}`, 'bd av', '', faceOf(f, null)));          // avatar người có sinh nhật
      for (const w in PARENT_BDAY) if (isDate(PARENT_BDAY[w], day)) ev.push(calIco('ci_bd', `Sinh nhật ${PNAME[w].toLowerCase()}`, 'bd av', '', faceOf(w, w === 'mom' ? 'noapron' : null)));
      for (const t of tests[day] || []) ev.push(calIco('ci_test', `${TEST_NAME[t.type]} · ${SUBJ[t.subj].name}${t.done ? ' (đã làm)' : ''}`, `ts ${t.done ? 'done' : ''}`, `--c:${SUBJ[t.subj].color}`));
      if (G.meet && G.meet.day === day) ev.push(calIco('ci_meet', `Hẹn ${FRIENDS[G.meet.fid].name}`, 'mt'));
      const off = c.dow >= 5 || !SEASONS[se].school || hol;
      if (UI._calDay === day) UI._calEv = ev.slice();
      h += `<div class="cd ${day === G.day ? 'today' : ''} ${day < G.day ? 'past' : ''} ${off ? 'we' : ''} pick ${UI._calDay === day ? 'sel' : ''}" data-act="${tv ? 'jump' : 'day'}" data-id="${day}"><b>${d + 1}</b><div class="evs">${ev.join('')}</div></div>`;
    }
    h += '</div>';
    if (UI._calDay !== null && UI._calDay !== undefined && UI._calDay >= base && UI._calDay < base + CFG.DAYS_PER_SEASON) {
      const L = (UI._calEv || []).map(x => { const t = (x.match(/data-t="([^"]*)"/) || [])[1] || ''; return `<li>${x.replace(/tabindex="0"/, '')}<span>${t}</span></li>`; });
      h += `<div class="calday"><b>${dateLabel(UI._calDay)}</b>${L.length ? `<ul>${L.join('')}</ul>` : '<p class="dim">Không có sự kiện nào.</p>'}</div>`;
    }
    h += '<div class="callegend"><div class="callegend">' + [['ci_test', 'Kiểm tra 1 tiết / thi (màu theo môn)', 'ts', '--c:#7a7085'], ['ci_bd', 'Sinh nhật', 'bd'], ['ci_tet', 'Ngày lễ, Tết', 'hol'], ['ci_fes', 'Lễ hội, sự kiện', 'fes'], ['ci_meet', 'Cuộc hẹn', 'mt'], ['ci_sem', 'Học kỳ', 'sem']].map(([i, t, c, st]) => `<span>${calIco(i, t, c, st)}${t}</span>`).join('') + '</div><p class="dim">Di chuột (hoặc chạm) vào icon để xem tên sự kiện · bấm vào một ngày để xem danh sách sự kiện của ngày đó.</p>';
    return h + `<p class="dim">${SEASONS[se].school ? 'Ô màu nhạt là ngày nghỉ (thứ 7, chủ nhật, ngày lễ).' : 'Nghỉ hè — không có tiết học.'} Lịch kiểm tra của một học kỳ được xếp vào ngày đầu học kỳ đó.${FESTIVALS.length ? '' : ' Lễ hội sẽ được bổ sung sau.'}</p>`;
  },
};

/* ---------- Thẻ cầu thủ ---------- */
MV.cards = {
  h: {
    ctab: d => { UI._ctab = d.id; },
    sq: d => { const s = UI._sq || (UI._sq = (G.squad || []).filter(id => G.cards[id] > 0)); const i = s.indexOf(d.id); if (i >= 0) s.splice(i, 1); else if (s.length < SQUAD.size) s.push(d.id); else UI.toast(`Đội hình đủ ${SQUAD.size} người rồi — bỏ bớt một người trước.`); },
    sqauto: () => { const a = autoSquad(CARDS.filter(c => G.cards[c.id] > 0)); if (a) UI._sq = a; else UI.toast('Chưa đủ thẻ để xếp một đội hình hợp lệ (cần ít nhất 1 thủ môn, 2 hậu vệ, 2 tiền vệ, 1 tiền đạo, tổng lương ≤ ' + SQUAD.cap + ').', 'bad'); },
    sqclear: () => { UI._sq = []; },
    sqsave: () => { const s = UI._sq || []; const is = squadIssues(s); if (is.length) return UI.toast(is[0], 'bad'); G.squad = s.slice(); UI.toast('Đã lưu đội hình!', 'good'); },
  },
  init() { UI._sq = null; },
  render() {
    const t = UI._ctab || 'album';
    let h = subTabs('ctab', t, [['album', 'Bộ sưu tập'], ['squad', 'Đội hình']]);
    if (t === 'album') {
      h += `<p>Đã sưu tầm <b>${cardKinds()}/${CARDS.length}</b> loại · tổng <b>${cardCount()}</b> lá.${G.cardDone === CARDS.length ? ' <b class="tag">Đủ bộ!</b>' : ''}</p><div class="pcards">`;
      for (const c of CARDS) h += G.cards[c.id] ? cardHtml(c, '×' + G.cards[c.id]) : `<div class="pcard none" style="--rc:${CARD_RARITY[c.r].col}"><div class="pc-q">?</div><div class="pc-n">Số ${c.no}</div><div class="pc-r">${starsOf(c)} ${CARD_RARITY[c.r].name}</div></div>`;
      return h + `</div><p class="dim">Mỗi gói bim bim Sao Vàng có 1 thẻ (hôm nào may mắn dễ ra thẻ hiếm). ${CARD_STATS.map(([k, n]) => `${statImg(k)} ${n}`).join(' · ')}. Đấu thẻ: mỗi chỉ số chỉ được so một lần trong trận. Đủ bộ ${CARDS.length} thẻ được thưởng ${fmtMoney(CARD_SET_REWARD)}.</p>`;
    }
    const s = UI._sq || (UI._sq = (G.squad || []).filter(id => G.cards[id] > 0)), cs = cardsOf(s), is = squadIssues(s), cnt = p => cs.filter(c => c.pos === p).length;
    h += `<p>Lương <b class="${squadSal(s) > SQUAD.cap ? 'bad' : ''}">${squadSal(s)}/${SQUAD.cap}</b> · ${cs.length}/${SQUAD.size} người · TM ${cnt('tm')} · HV ${cnt('hv')} · TV ${cnt('tv')} · TĐ ${cnt('td')}</p>`;
    h += is.length ? `<p class="warnbox">${is.join(' · ')}</p>` : '<p class="okbox">Đội hình hợp lệ!' + (JSON.stringify(s) === JSON.stringify(G.squad) ? ' (đã lưu)' : ' Bấm “Lưu đội hình”.') + '</p>';
    h += `<p class="dim">Màu áo trong đội: ${synergyText(cs)}</p><div class="btns"><button class="btn primary" data-act="sqsave">Lưu đội hình</button><button class="btn" data-act="sqauto">Xếp tự động</button><button class="btn ghost" data-act="sqclear">Bỏ chọn hết</button></div>`;
    h += `<div class="cts">${CARDS.filter(c => G.cards[c.id] > 0).sort((a, b) => 'tm hv tv td'.indexOf(a.pos) - 'tm hv tv td'.indexOf(b.pos) || b.r - a.r).map(c => ctile(c, { act: 'sq', on: s.includes(c.id) })).join('') || '<p class="dim">Chưa có thẻ nào.</p>'}</div>`;
    return h + `<p class="dim">Đội hình: đúng 1 thủ môn, ít nhất 2 hậu vệ, 2 tiền vệ, 1 tiền đạo; tổng lương ≤ ${SQUAD.cap}. Cầu thủ nào cũng có CLB (huy hiệu) và quốc tịch (lá cờ); cùng CLB hoặc cùng quốc tịch ra sân chung được cộng chỉ số.</p>`;
  },
};


/* ---------- Cài đặt: Hiệu chỉnh game · Điều khiển · Cài đặt khác ---------- */
/* ---------- Bản đồ thành phố: ghép các khu thật thu nhỏ lại, đánh dấu chỗ mình đang đứng ---------- */
const CITY_GAP = 64;
// Toạ độ góc trái-trên của từng khu trên bản đồ chung (đơn vị pixel game), xếp theo đúng lối đi giữa các khu
function cityLayout() {
  const M = MAPS, g = CITY_GAP, L = {};
  L.town = [0, 0]; L.pho = [M.town.pw + g, 0];
  L.school = [L.pho[0] + M.pho.pw + g, 204 - 408];                 // cổng phố → vỉa hè trường
  L.nui = [L.school[0] + 736 - 320, L.school[1] - M.nui.ph - g];   // lối mòn sau trường → chân núi
  L.ga = [L.pho[0] + 456 - 288, -M.ga.ph - g];                       // đường lên ga
  L.bien = [L.ga[0] - M.bien.pw - g, L.ga[1] - 96];                  // tàu hoả ra biển
  L.song = [L.pho[0] + 440 - 320, M.pho.ph + g];                     // lối xuống bờ sông
  L.chua = [0, M.town.ph + g];                                       // dưới khu phố nhà mình, bên trái bờ sông
  L.dong = [L.song[0] + M.song.pw + g, L.song[1] - 120];              // phố Bờ Đông: bên phải bờ sông
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const k in L) { x0 = Math.min(x0, L[k][0]); y0 = Math.min(y0, L[k][1]); x1 = Math.max(x1, L[k][0] + M[k].pw); y1 = Math.max(y1, L[k][1] + M[k].ph); }
  const pad = 56;                                                    // lề quanh bản đồ để tên khu không bị cắt
  for (const k in L) L[k] = [L[k][0] - x0 + pad, L[k][1] - y0 + pad];
  return { L, W: x1 - x0 + pad * 2, H: y1 - y0 + pad * 2 };
}
const CITY_POI = [
  ['town', 95, 100, 'Nhà mình'], ['town', 351, 86, 'Tạp hoá Cô Ba'], ['town', 479, 86, 'Học thêm'], ['town', 630, 166, 'Trạm bus'], ['town', 380, 334, 'Công viên'],
  ['pho', 175, 86, 'Nhà các bạn'], ['pho', 524, 86, 'Trà sữa'], ['pho', 660, 66, 'TTTM'], ['pho', 806, 86, 'Khu game'], ['pho', 218, 166, 'Trạm bus'], ['pho', 640, 316, 'Xiên que'], ['pho', 136, 344, 'Sân bóng'],
  ['school', 352, 66, 'Dãy lớp học'], ['school', 79, 80, 'Căn tin'], ['school', 572, 84, 'Nhà xe'], ['school', 664, 64, 'Vệ sinh'], ['school', 584, 232, 'Sân thể dục'], ['school', 352, 400, 'Cổng'], ['school', 130, 454, 'Trạm bus'],
  ['nui', 200, 290, 'Bãi picnic'], ['song', 320, 180, 'Câu cá'], ['chua', 321, 222, 'Lư hương · xin xăm'],
  ['pho', MOM_CO.x + 76, 70, 'Công ty của mẹ'], ['dong', DONG.factory + 100, 70, 'Nhà máy của bố'], ['dong', DONG.rest + 55, 86, 'Nhà hàng'], ['dong', DONG.kara + 50, 86, 'Karaoke'], ['dong', 150, 86, 'Nhà hàng xóm'], ['school', LIB_DOOR[0], 250, 'Thư viện'],
];
// Icon sự kiện trên lịch (tên sự kiện ở tooltip)
// (tên hiện ngay khi di chuột / chạm vào icon — tooltip bằng CSS) · src: ảnh riêng thay icon (avatar người có sinh nhật)
const calIco = (id, t, cls, st, src) => `<i class="evi ${cls || ''}" data-t="${t}" tabindex="0" aria-label="${t}"${st ? ` style="${st}"` : ''}><img src="${src || itemIcon(id)}" alt=""></i>`;
// Chỗ mình đang ở trên bản đồ chung (ở trong nhà / phòng thì lấy cửa ra vào)
function whereAmI() {
  const R0 = { home: ['town', 96, 128, 'trong nhà'], class: ['school', 244, 104, 'lớp 10A1'], lab: ['school', 461, 104, 'phòng thí nghiệm'], yte: ['school', 213, 104, 'trạm y tế'], nhac: ['school', 275, 104, 'phòng nhạc'], thuvien: ['school', LIB_DOOR[0], LIB_DOOR[1] - 10, 'thư viện'], ngutrua: ['school', 430, 104, 'phòng ngủ trưa'], wcnam: ['school', WC_BLOCK.nam, 100, 'nhà vệ sinh nam'], wcnu: ['school', WC_BLOCK.nu, 100, 'nhà vệ sinh nữ'], wc: ['school', WC_BLOCK.nu, 100, 'nhà vệ sinh'], wcm: ['school', WC_BLOCK.nam, 100, 'nhà vệ sinh'], tttm: ['pho', 660, 128, 'trong TTTM'], arc: ['pho', 806, 128, 'trong khu game'], phongbm: ['town', 96, 128, 'phòng bố mẹ'], congty: ['pho', MOM_CO.x + 76, 128, 'công ty của mẹ'], nhamay: ['dong', DONG.factory + 100, 128, 'nhà máy của bố'], nhahang: ['dong', DONG.rest + 55, 128, 'nhà hàng Sen Hồng'], karaoke: ['dong', DONG.kara + 50, 128, 'karaoke Âm Vang'], tang2: ['school', 352, 104, 'tầng 2'], l11a1: ['school', 352, 104, 'lớp 11A1'], l11a3: ['school', 352, 104, 'lớp 11A3'], l12a1: ['school', 352, 104, 'lớp 12A1'], l12a2: ['school', 352, 104, 'lớp 12A2'], l10a2: ['school', 319, 104, 'lớp 10A2'], l10a3: ['school', 385, 104, 'lớp 10A3'], l10a4: ['school', 494, 104, 'lớp 10A4'], fhome: ['pho', (FRIEND_HOUSE[G.visit] || FRIEND_HOUSE.khoa)[1] + 49, 128, 'nhà ' + ((FRIENDS[G.visit] || FRIENDS.khoa).name)] };
  if (R0[G.map]) { const [a, x, y, room] = R0[G.map]; return { a, x, y, room }; }
  if (MAPS[G.map] && !MAPS[G.map].indoor && G.map !== 'ride' && G.map !== 'rail') return { a: G.map, x: G.x, y: G.y, room: '' };
  return null;
}
function cityMapImage() {
  const { L, W, H } = cityLayout(), S = Math.min(1500 / W, 0.55), c = mk(Math.round(W * S), Math.round(H * S)), x = cx(c);
  const P = (a, px, py) => [(L[a][0] + px) * S, (L[a][1] + py) * S];
  x.fillStyle = '#7fb36a'; x.fillRect(0, 0, c.width, c.height);
  x.fillStyle = '#6aa05a'; for (let i = 0; i < c.width; i += 22) for (let j = (i / 22) % 2 * 11; j < c.height; j += 22) x.fillRect(i, j, 3, 3);
  // đường nối giữa các khu
  const road = (pts, w, col) => { x.strokeStyle = col; x.lineWidth = w * S; x.lineJoin = 'round'; x.beginPath(); pts.forEach(([a, px, py], i) => { const [X, Y] = P(a, px, py); i ? x.lineTo(X, Y) : x.moveTo(X, Y); }); x.stroke(); };
  road([['town', 790, 216], ['pho', 10, 216]], 48, '#5f656f'); road([['pho', MAPS.pho.pw - 10, 216], ['school', -10, 478]], 48, '#5f656f'); road([['song', MAPS.song.pw - 6, 70], ['dong', 10, 216]], 36, '#d9ccb2');
  road([['pho', 456, 6], ['ga', 288, 314]], 40, '#d9ccb2'); road([['town', 176, 410], ['chua', 176, 6]], 32, '#d9ccb2'); road([['chua', 634, 176], ['song', 6, 70]], 32, '#d9ccb2'); road([['pho', 440, 410], ['song', 320, 10]], 40, '#d9ccb2'); road([['school', 736, 4], ['nui', 320, 470]], 30, '#b89a6a');
  x.setLineDash([10, 8]); road([['ga', 0, 250], ['bien', MAPS.bien.pw, 250]], 10, '#8a5a3a'); x.setLineDash([]);
  // từng khu: nền + đồ vật
  x.imageSmoothingEnabled = true;
  for (const a in L) {
    const m = MAPS[a], [X, Y] = P(a, 0, 0);
    x.drawImage(m.g, X, Y, m.pw * S, m.ph * S);
    const objs = m.objs.filter(o => { try { return !o.vis || o.vis(); } catch (e) { return true; } }).sort((p, q) => p.base - q.base);
    for (const o of objs) { const sp = o.dyn ? SPR[o.dyn()] : SPR[o.s]; if (sp) x.drawImage(sp, X + o.x * S, Y + o.y * S, sp.width * S, sp.height * S); }
    x.strokeStyle = '#2a2136'; x.lineWidth = 3; x.strokeRect(X, Y, m.pw * S, m.ph * S);
  }
  const label = (t, X, Y, size, bg, fg) => {
    x.font = `800 ${size}px "Baloo 2", system-ui, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
    const w = x.measureText(t).width + size * 0.9, h = size * 1.35;
    x.fillStyle = bg; x.beginPath(); x.roundRect ? x.roundRect(X - w / 2, Y - h / 2, w, h, h / 2) : x.rect(X - w / 2, Y - h / 2, w, h); x.fill();
    x.fillStyle = fg; x.fillText(t, X, Y + 1);
  };
  for (const [a, px, py, t] of CITY_POI) { const [X, Y] = P(a, px, py); label(t, X, Y, 25, 'rgba(255,246,227,.94)', '#2a2136'); }
  for (const a in L) { const [X, Y] = P(a, MAPS[a].pw / 2, 0); label(MAPS[a].name, X, Y + 2, 30, '#2a2136', '#ffe066'); }
  const [rx, ry] = P('ga', -CITY_GAP / 2, 236); label('tàu hoả', rx, ry, 22, '#8a5a3a', '#fff6e3');
  // chỗ hẹn với bạn
  const m = meetOn();
  if (m) { const Pl = PLACES[m.place]; if (L[Pl.map]) { const [X, Y] = P(Pl.map, Pl.x, Pl.y); x.fillStyle = '#ff5fa8'; x.font = '900 40px system-ui, sans-serif'; x.textAlign = 'center'; x.fillText('♥', X, Y); label('Hẹn ' + FRIENDS[m.fid].name, X, Y - 34, 24, '#ff5fa8', '#fff'); } }
  // xe đang dựng
  if (G.park) { const pk = G.park.shed ? ['school', 572, 96] : L[G.park.map] ? [G.park.map, G.park.x, G.park.y] : null; if (pk) { const [X, Y] = P(...pk), sp = SPR[VEHICLES[G.park.id].spr]; x.drawImage(sp, X - sp.width * 0.6, Y - sp.height, sp.width * 1.2, sp.height * 1.2); label('Xe của bạn', X, Y + 16, 22, '#3b6fb6', '#fff'); } }
  // mình đang ở đây
  const me = whereAmI();
  if (me && L[me.a]) {
    const [X, Y] = P(me.a, me.x, me.y);
    x.fillStyle = 'rgba(226,87,76,.28)'; x.beginPath(); x.arc(X, Y, 34, 0, 6.3); x.fill();
    x.fillStyle = '#fff'; x.beginPath(); x.arc(X, Y, 15, 0, 6.3); x.fill(); x.fillStyle = '#e2574c'; x.beginPath(); x.arc(X, Y, 11, 0, 6.3); x.fill();
    label('BẠN Ở ĐÂY', X, Y - 40, 27, '#e2574c', '#fff');
  }
  return c.toDataURL();
}
MV.map = {
  render() {
    const me = whereAmI(), m = meetOn(), area = me ? MAPS[me.a].name : '';
    let h = `<div class="cmap"><img src="${cityMapImage()}" alt="Bản đồ thành phố"></div><div class="cmap-info">`;
    h += `<p>${me ? `Bạn đang ở: <b>${area}</b>${me.room ? ' — ' + me.room : ''}` : 'Bạn đang trên đường đi…'} · ${fmtTime(G.time)}</p>`;
    if (G.comp) h += `<p>Đang đi cùng <b>${FRIENDS[G.comp.fid].name}</b>${G.ride ? ' (chở sau xe)' : ''}.</p>`;
    if (m) h += `<p>♥ Hẹn <b>${FRIENDS[m.fid].name}</b> ở ${PLACES[m.place].name} (${meetTimeText(m)}).</p>`;
    if (G.park) h += `<p>${VEHICLES[G.park.id].name} của bạn ${G.park.shed ? 'đang gửi ở nhà xe trường' : 'đang dựng ở ' + MAPS[G.park.map].name}.</p>`;
    return h + '<p class="dim">Đi bộ qua mép mỗi khu là sang khu bên cạnh (đường xám là đường xe chạy được). Ra trạm bấm vào xe bus để đi nhanh; lên ga bắt tàu ra biển.</p></div>';
  },
};

const KEYMAP = [['W A S D / ↑ ↓ ← →', 'Di chuyển'], ['Chuột_phải / E', 'Tương tác với người, đồ vật'], ['Q', 'Trong giờ học: quay sang bạn'], ['X', 'Xuống xe'], ['B', 'Mở túi đồ'], ['Esc / M', 'Mở menu'],
  ['C', 'Chỉ số'], ['F', 'Bạn bè'], ['T', 'Thời khoá biểu'], ['G', 'Học bạ'], ['L', 'Lịch'], ['K', 'Thẻ cầu thủ'], ['N', 'Bản đồ thành phố'], ['P', 'Điện thoại'], ['Space / Enter', 'Chọn nút chính trong hộp thoại; lướt nhanh lời thoại'], ['1 – 9', 'Chọn nhanh lựa chọn trong hộp thoại']];
MV.set = {
  h: {
    sset: d => { UI._sset = d.id; },
    save: () => { UI.toast(save() ? 'Đã lưu.' : 'Trình duyệt không cho lưu. Hãy sao chép mã lưu.', 'good'); },
    copy: () => { const code = exportCode(), ta = $('imp'); UI._panel._keep = true; const done = ok => UI.toast(ok ? 'Đã sao chép mã lưu.' : 'Mã lưu nằm trong ô “Dán mã” — hãy chép tay.', 'good'); try { navigator.clipboard.writeText(code).then(() => done(true), () => { ta.value = code; done(false); }); } catch (e) { ta.value = code; done(false); } },
    imp: () => {
      const v = $('imp').value.trim(), up = v.toUpperCase();       // mã thử nghiệm không phân biệt hoa thường
      if (!v) return UI.toast('Chưa dán mã.');
      if (up === CHEATS.money) { addMoney(CHEAT_MONEY, true); UI.toast(`Tiền tiêu vặt +${fmtMoney(CHEAT_MONEY)}.`, 'good'); }
      else if (up === CHEATS.love) { cheatLove(); UI.toast(`Mọi nhân vật quý bạn hơn (+${CHEAT_LOVE} thiện cảm).`, 'good'); }
      else if (up === CHEATS.level) { const n = cheatLevel(); UI.toast(n ? `Thiên tài! Tất cả ${n} môn học tăng thêm 1 cấp.` : 'Các môn đều đã đạt cấp tối đa.', 'good'); }
      else if (CHEAT_STAT[up]) { const k = CHEAT_STAT[up], lvN = cheatStat(k); UI.toast(lvN ? `${STAT_NAMES[k]} lên cấp ${lvN}!` : `${STAT_NAMES[k]} đã đạt cấp tối đa.`, 'good'); }
      else if (up === CHEATS.time) { UI._travel = true; UI._tab = 'cal'; MV.cal.init(); UI.toast('Du hành thời gian: chọn một ngày trên lịch.', 'info'); }
      else if (importCode(v)) { save(); UI.close(-1); UI.toast('Đã nhập mã lưu.', 'good'); }
      else UI.toast('Mã không hợp lệ.', 'bad');
    },
    reset: (d, el) => { if (el.dataset.sure) { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } location.reload(); } else { el.dataset.sure = '1'; el.textContent = 'Bấm lần nữa để xoá'; UI._panel._keep = true; } },
  },
  render() {
    const st = UI._sset || 'game';
    let h = subTabs('sset', st, [['game', 'Hiệu chỉnh game'], ['keys', 'Điều khiển'], ['other', 'Cài đặt khác']]);
    if (st === 'game') h += `<h4>Âm thanh</h4><p>Âm lượng <b id="volv">${G.vol === undefined ? 70 : G.vol}</b>% <small class="dim">(âm thanh sẽ được lồng vào sau)</small></p><input type="range" id="vol" min="0" max="100" step="5" value="${G.vol === undefined ? 70 : G.vol}">
      <h4>Tốc độ thời gian</h4><p>Mỗi <b id="spv">${G.speed}</b> giây thực = 10 phút trong game <small class="dim">(một ngày 06:00 → 03:00 dài khoảng ${Math.round(126 * G.speed / 60)} phút nếu không bỏ qua)</small></p><input type="range" id="spd" min="2" max="12" step="1" value="${G.speed}">`;
    else if (st === 'keys') h += '<table class="tb keys">' + KEYMAP.map(([k, v]) => `<tr><td>${k.split(' / ').map(x => x.split(' ').map(y => (y === '–' ? '–' : `<kbd>${y.replace('_', ' ')}</kbd>`)).join('')).join(' hoặc ')}</td><td>${v}</td></tr>`).join('') + '</table>';
    else h += `<h4>Lưu game</h4><p class="dim">Game tự lưu vào trình duyệt này mỗi khi bạn đi ngủ. Muốn chuyển máy hoặc giữ chắc, hãy sao chép mã lưu.</p>
      <div class="btns"><button class="btn" data-act="save">Lưu ngay</button><button class="btn" data-act="copy">Sao chép mã lưu</button></div>
      <h4>Dán mã</h4><textarea id="imp" placeholder="Dán mã lưu hoặc mã đặc biệt vào đây…"></textarea>
      <div class="btns"><button class="btn primary" data-act="imp">Nhập mã</button></div>
      <h4>Chơi lại</h4><div class="btns"><button class="btn danger" data-act="reset">Chơi lại từ đầu</button></div>`;
    return h;
  },
};
// Mã thử nghiệm: mọi môn học (lý thuyết, thực hành, quốc phòng, thể dục) lên thêm 1 cấp, giữ nguyên phần trăm đang có của cấp hiện tại
const SUBJ_STATS = ['toan', 'van', 'anh', 'ly', 'hoa', 'sinh', 'su', 'dia', 'qp', 'th_ly', 'th_hoa', 'th_sinh', 'thethao'];
function cheatLevel() {
  let n = 0;
  for (const k of SUBJ_STATS) {
    const i = lvlInfo(G.stats[k]); if (i.lv >= 10) continue;
    let start = 0, need = 50; for (let l = 0; l <= i.lv; l++) { start += need; need += 20; }     // điểm bắt đầu của cấp lv+1
    G.stats[k] = start + (i.lv + 1 >= 10 ? 0 : Math.floor(i.frac * need)); n++;
  }
  return n;
}
// Mã thử nghiệm: một chỉ số hỗ trợ lên thêm 1 cấp (giữ phần trăm của cấp hiện tại). Trả về cấp mới, 0 nếu đã tối đa
function cheatStat(k) {
  const i = lvlInfo(G.stats[k]); if (i.lv >= 10) return 0;
  let start = 0, need = 50; for (let l = 0; l <= i.lv; l++) { start += need; need += 20; }
  G.stats[k] = start + (i.lv + 1 >= 10 ? 0 : Math.floor(i.frac * need)); UI.hud();
  return i.lv + 1;
}
// Mã thử nghiệm: +thiện cảm với mọi nhân vật
function cheatLove() {
  for (const f in FRIENDS) addFriend(f, CHEAT_LOVE, true);
  for (const t in TEACHERS) addTeacher(CHEAT_LOVE, t, true);
  for (const k in SOCIETY) G.soc[k] = clamp((G.soc[k] || 0) + CHEAT_LOVE, 0, 100);
  addParent(CHEAT_LOVE, '', true);
}
// Mã thử nghiệm: du hành tới một ngày bất kỳ trên lịch
async function timeTravelAsk(day) {
  const sd = isSchoolDay(day);
  const opts = sd ? [['06:00 — vừa ngủ dậy ở nhà', 360], ['07:30 — trước cổng trường', 450], [`${fmtTime(AM_END)} — nghỉ trưa ở trường`, AM_END], [`${fmtTime(CFG.SCHOOL_END)} — tan học, ở sân trường`, CFG.SCHOOL_END], ['19:00 — buổi tối ở nhà', 1140]]
    : [['06:00 — vừa ngủ dậy', 360], ['09:00 — buổi sáng', 540], ['14:00 — buổi chiều', 840], ['19:00 — buổi tối', 1140]];
  const c = await UI.ask('Du hành thời gian', `<p>Tới <b>${dateLabel(day)}</b>, năm ${cal(day).year + 1}. Vào lúc nào?</p>`, opts.map(o => o[0]).concat('Thôi'));
  if (c < 0 || c >= opts.length) return;
  timeTravel(day, opts[c][1]);
}
function timeTravel(day, time) {
  const c = cal(day), sem = semOf(day), key = semKey(day);
  G.day = day; G.comp = null; G.meet = null; G.phone.pend = null;
  if (sem && !G.tests.some(t => t.sem === key)) scheduleSemester(c.year, sem);
  for (const t of G.tests) if (t.day < day && !t.done) { t.done = true; t.q = true; }     // các bài kiểm tra đã trôi qua coi như bỏ qua
  G.pending = {};
  G.schoolDays = 0; for (let d = c.year * YEAR_DAYS; d < day; d++) if (isSchoolDay(d)) G.schoolDays++;
  RT.morning = []; RT.pendingClass = null; RT.pendingInvite = null; RT.pendingEvent = null; RT.scene = null;
  beginDay(false);
  if (time > CFG.DAY_START) {
    G.time = time;
    if (isSchoolDay(day)) {
      for (const p of PERIODS) if (p.start < time) G.daily.done[p.n] = true;
      if (time === 450) setMap('school', 350, 452, 3);
      else if (time <= CFG.SCHOOL_END) { G.atSchool = true; G.daily.arrived = true; setMap('school', 300, 300, 0); }
    }
  }
  RT.snapNpcs = true; UI.hud();
  UI.toast(`Đã du hành tới ${dateLabel(day)}, ${fmtTime(G.time)}.`, 'good');
}

function bindUI() {
  $('ic-menu').src = itemIcon('m_menu'); $('ic-phone').src = itemIcon('m_phone'); $('ic-map').src = itemIcon('m_map'); $('ic-quest').src = itemIcon('m_quest');
  $('banner').addEventListener('click', () => turnToFriend());
  $('hint').addEventListener('click', () => { if (G && G.ride && !RT.lock && !UI.isOpen() && $('hint')._key === 'X') dismount(); });   // bấm vào nút “X Xuống xe”
  $('modal').addEventListener('click', UI._click);
  $('m-x').addEventListener('click', () => UI.close(UI._res ? UI._esc : -1));
  $('modal-wrap').addEventListener('input', e => {
    if (e.target.id === 'spd') { G.speed = +e.target.value; $('spv').textContent = G.speed; }
    else if (e.target.id === 'vol') { G.vol = +e.target.value; $('volv').textContent = G.vol; }
  });
  $('hotbar').addEventListener('click', e => {
    const b = e.target.closest('[data-hb]'); if (!b) return; b.blur();
    if (!G || RT.lock || UI.isOpen()) return;
    const a = b.dataset.hb;
    if (a === 'hold') toggleHold(b.dataset.id); else if (a === 'cards') UI.cards(); else if (a === 'off') dismount(); else UI.toast(b.title);
  });
  $('menu').addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (!b) return; b.blur(); if (!G || RT.lock) return; openMenu(b.dataset.m); });
}
function openMenu(k) {
  if (!G || RT.lock) return;
  if (k === 'bag') UI.bag(); else if (k === 'phone') UI.phone(); else if (k === 'quest') questPanel(); else UI.menu(k === 'menu' ? null : k);
}
