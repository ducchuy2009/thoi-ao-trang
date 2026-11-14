'use strict';
/* ============================================================
 *  05b. MINI-GAME — khung chung UI.game() + các trò:
 *  keepup (tâng cầu) · arrows (bấm mũi tên theo nhịp: nhảy, rồng rắn, đối kháng) · notes (nốt nhạc rơi: hát)
 *  physics (Lý: ném bóng vào rổ) · mix (Hoá: pha đúng liều) · jigsaw (Quốc phòng: ghép hình) · micro (Sinh: soi kính tìm sinh vật)
 *  seek (trốn tìm) · claw (gắp thú) · slot (máy may rủi)
 *  Trò nào cũng có nút "Bỏ qua" (Esc): tính điểm trung bình thấp.
 * ============================================================ */
// o: { title, help, w, h, setup(S), step(S, dt, inp), draw(c, S, inp), bot } → Promise<{ score: 0..1, skipped }>
UI.game = function (o) {
  return new Promise(res => {
    const W = o.w || 260, H = o.h || 210;
    this._open(o.title, `<div class="gm"><canvas id="gm-cv" width="${W * 2}" height="${H * 2}" style="width:${W}px;height:${H}px"></canvas><div class="gm-side">${o.help || ''}<p id="gm-info" class="big"></p><div class="btns"><button class="btn ghost" id="gm-skip">Bỏ qua</button></div></div></div>`, null, null, true);
    const cvs = $('gm-cv'), c = cvs.getContext('2d'), S = { t: 0, done: false, score: 0, W, H, info: '' };
    const inp = { keys: {}, hit: [], mx: W / 2, my: H / 2, down: false, clicks: [] };
    const kn = e => { const k = e.key.toLowerCase(); return k === ' ' ? 'space' : k; };
    const kd = e => { const k = kn(e); if (k === 'escape') return; if (!inp.keys[k]) inp.hit.push(k); inp.keys[k] = true; if (k.startsWith('arrow') || k === 'space' || k === 'enter') e.preventDefault(); };
    const ku = e => { inp.keys[kn(e)] = false; };
    const pos = e => { const r = cvs.getBoundingClientRect(), t = e.touches ? (e.touches[0] || e.changedTouches[0]) : e; inp.mx = (t.clientX - r.left) / r.width * W; inp.my = (t.clientY - r.top) / r.height * H; };
    const md = e => { pos(e); inp.down = true; inp.clicks.push([inp.mx, inp.my]); e.preventDefault(); }, mm = e => { pos(e); if (e.touches) e.preventDefault(); }, mu = () => { inp.down = false; };
    window.addEventListener('keydown', kd, true); window.addEventListener('keyup', ku, true); window.addEventListener('mouseup', mu); window.addEventListener('touchend', mu);
    cvs.addEventListener('mousedown', md); cvs.addEventListener('mousemove', mm); cvs.addEventListener('touchstart', md, { passive: false }); cvs.addEventListener('touchmove', mm, { passive: false });
    const skip = () => { S.skipped = true; S.done = true; };
    $('gm-skip').addEventListener('click', skip); UI._mini = skip;
    o.setup(S);
    let last = 0, n = 0;
    const end = () => {
      window.removeEventListener('keydown', kd, true); window.removeEventListener('keyup', ku, true); window.removeEventListener('mouseup', mu); window.removeEventListener('touchend', mu);
      const sc = S.skipped ? 0.35 : clamp(S.score, 0, 1), el = $('gm-info');
      if (el) { el.textContent = S.skipped ? 'Bỏ qua.' : sc >= 0.95 ? 'Xuất sắc!' : sc >= 0.6 ? 'Đạt!' : 'Chưa đạt…'; el.style.color = sc >= 0.6 ? '#2f7d5b' : '#d9534f'; }
      setTimeout(() => { UI._mini = null; UI.close(-1); res({ score: sc, skipped: !!S.skipped }); }, UI._mgBot ? 20 : 900);
    };
    const loop = t => {
      const dt = Math.min(0.04, (t - last) / 1000 || 0.016); last = t;
      if (UI._mgBot && ++n > 2 && !S.done) { S.score = o.bot === undefined ? 0.8 : (typeof o.bot === 'function' ? o.bot() : o.bot); S.done = true; }
      if (!S.done) { S.t += dt; o.step(S, dt, inp); inp.hit.length = 0; inp.clicks.length = 0; }
      c.setTransform(2, 0, 0, 2, 0, 0); c.clearRect(0, 0, W, H); o.draw(c, S, inp);
      const el = $('gm-info'); if (el && !S.done) el.textContent = S.info;
      if (S.done) return end();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });
};
const gR = (c, col, x, y, w, h) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
const gC = (c, col, x, y, r) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 6.3); c.fill(); };
const gT = (c, col, txt, x, y, size, align) => { c.fillStyle = col; c.font = `800 ${size || 11}px "Baloo 2", system-ui, sans-serif`; c.textAlign = align || 'center'; c.textBaseline = 'middle'; c.fillText(txt, x, y); };
const gTime = (c, S, left, total) => { gR(c, '#2a2136', 8, 6, S.W - 16, 7); gR(c, left / total > 0.3 ? '#5fae4a' : '#d9534f', 9, 7, Math.max(0, (S.W - 18) * left / total), 5); };
// mũi tên: 0 trái · 1 xuống · 2 lên · 3 phải
const ARROW_KEYS = [['arrowleft', 'a'], ['arrowdown', 's'], ['arrowup', 'w'], ['arrowright', 'd']];
function gArrow(c, col, d, x, y, r) {
  c.save(); c.translate(x, y); c.rotate([Math.PI, Math.PI / 2, -Math.PI / 2, 0][d]);
  c.fillStyle = col; c.beginPath(); c.moveTo(r, 0); c.lineTo(-r * 0.3, -r); c.lineTo(-r * 0.3, -r * 0.4); c.lineTo(-r, -r * 0.4); c.lineTo(-r, r * 0.4); c.lineTo(-r * 0.3, r * 0.4); c.lineTo(-r * 0.3, r); c.closePath(); c.fill(); c.restore();
}
const GAMES = {
  /* ---------- tâng cầu: bấm vào quả cầu đang rơi (hoặc Space khi cầu xuống gần chân) ---------- */
  keepup(diff, title) {
    const need = 8 + diff * 2, T = 22;
    return {
      title: title || 'Tâng cầu', bot: 0.8, help: `<p><b>Bấm vào quả cầu</b> đang rơi để tâng lên (hoặc <kbd>Space</kbd> khi cầu xuống gần chân). Tâng đủ <b>${need}</b> lần, rơi 3 lần là hết lượt.</p>`,
      setup(S) { Object.assign(S, { x: S.W / 2, y: 40, vx: 20, vy: 0, kicks: 0, lives: 3 }); },
      step(S, dt, inp) {
        S.vy += (230 + 25 * diff) * dt; S.x += S.vx * dt; S.y += S.vy * dt;
        if (S.x < 12 || S.x > S.W - 12) { S.vx *= -1; S.x = clamp(S.x, 12, S.W - 12); }
        const kick = () => { S.vy = -(190 + Math.random() * 50); S.vx = rnd(-55, 55); S.kicks++; };
        if (S.vy > 0 && ((inp.clicks.some(([a, b]) => Math.hypot(a - S.x, b - S.y) < 24)) || (inp.hit.includes('space') && S.y > S.H - 74 && S.y < S.H - 14))) kick();
        if (S.y > S.H - 10) { S.lives--; S.x = S.W / 2; S.y = 30; S.vy = 0; S.vx = rnd(-30, 30); }
        S.score = S.kicks / need; S.info = `Tâng: ${S.kicks}/${need} · còn ${S.lives} lượt rơi`;
        if (S.lives <= 0 || S.kicks >= need || S.t > T) S.done = true;
      },
      draw(c, S) {
        gR(c, '#bfe6f7', 0, 0, S.W, S.H); gR(c, '#e6cfa6', 0, S.H - 22, S.W, 22); gR(c, '#5fae78', 0, S.H - 26, S.W, 4); gTime(c, S, T - S.t, T);
        gR(c, 'rgba(95,174,74,.18)', 0, S.H - 74, S.W, 60);
        gR(c, '#34425e', S.x - 9, S.H - 20, 18, 6); gR(c, '#2e2738', S.x - 9, S.H - 15, 22, 5);       // bàn chân chạy theo cầu
        gR(c, '#fffaf0', S.x - 5, S.y - 12, 2, 10); gR(c, '#fffaf0', S.x - 1, S.y - 14, 2, 12); gR(c, '#fffaf0', S.x + 3, S.y - 12, 2, 10); gC(c, '#d9534f', S.x, S.y, 5); gC(c, '#f79a90', S.x - 1, S.y - 1, 2);
      },
    };
  },
  /* ---------- bấm đúng chuỗi mũi tên trước khi hết giờ ---------- */
  arrows(diff, title, what) {
    const rounds = 4, len = 3 + Math.ceil(diff / 2), per = 5.2 - 0.35 * diff;
    return {
      title: title || 'Bấm theo nhịp', bot: 0.8, help: `<p>${what || 'Bấm các phím mũi tên'} theo đúng thứ tự hiện trên màn hình (<kbd>←</kbd><kbd>↓</kbd><kbd>↑</kbd><kbd>→</kbd> hoặc bấm vào nút). Bấm sai phải làm lại từ đầu chuỗi. Có ${rounds} lượt.</p>`,
      setup(S) { Object.assign(S, { r: 0, ok: 0, i: 0, rt: 0, shake: 0, seq: [] }); S.seq = Array.from({ length: len }, () => Math.floor(Math.random() * 4)); },
      step(S, dt, inp) {
        S.rt += dt; S.shake = Math.max(0, S.shake - dt);
        const pressed = []; for (const k of inp.hit) { const d = ARROW_KEYS.findIndex(a => a.includes(k)); if (d >= 0) pressed.push(d); }
        for (const [a, b] of inp.clicks) if (b > S.H - 44) pressed.push(clamp(Math.floor((a - (S.W / 2 - 80)) / 40), 0, 3));
        for (const d of pressed) { if (d === S.seq[S.i]) S.i++; else { S.i = 0; S.shake = 0.25; } }
        const next = () => { S.r++; S.i = 0; S.rt = 0; S.seq = Array.from({ length: len }, () => Math.floor(Math.random() * 4)); if (S.r >= rounds) S.done = true; };
        if (S.i >= len) { S.ok++; next(); } else if (S.rt > per) next();
        S.score = S.ok / rounds; S.info = `Lượt ${Math.min(rounds, S.r + 1)}/${rounds} · đúng ${S.ok}`;
      },
      draw(c, S) {
        gR(c, '#2a2136', 0, 0, S.W, S.H); gTime(c, S, per - S.rt, per);
        const x0 = S.W / 2 - (len - 1) * 17 + (S.shake ? Math.sin(S.t * 80) * 3 : 0);
        S.seq.forEach((d, k) => { gC(c, k < S.i ? '#5fae4a' : k === S.i ? '#f2a93b' : '#4a3f6b', x0 + k * 34, 70, 15); gArrow(c, k < S.i ? '#d8f2c9' : '#fff6e3', d, x0 + k * 34, 70, 9); });
        for (let d = 0; d < 4; d++) { gR(c, '#4a3f6b', S.W / 2 - 80 + d * 40 + 2, S.H - 42, 36, 36); gArrow(c, ['#5fe0f0', '#ff5fa8', '#ffe066', '#8fd067'][d], d, S.W / 2 - 80 + d * 40 + 20, S.H - 24, 11); }
        gT(c, '#fff6e3', title || 'Bấm theo nhịp', S.W / 2, 30, 13);
      },
    };
  },
  /* ---------- nốt nhạc rơi: bấm đúng làn khi nốt chạm vạch ---------- */
  notes(diff, title) {
    const N = 16 + diff * 3, sp = 105 + diff * 14, keys = [['d', 'arrowleft'], ['f', 'arrowdown'], ['j', 'arrowup'], ['k', 'arrowright']], col = ['#5fe0f0', '#ff5fa8', '#ffe066', '#8fd067'];
    return {
      title: title || 'Luyện thanh', bot: 0.8, help: '<p>Nốt nhạc rơi xuống theo 4 làn. Khi nốt chạm <b>vạch sáng</b> thì bấm phím của làn đó: <kbd>D</kbd><kbd>F</kbd><kbd>J</kbd><kbd>K</kbd> (hoặc <kbd>←</kbd><kbd>↓</kbd><kbd>↑</kbd><kbd>→</kbd>, hoặc bấm vào làn).</p>',
      setup(S) { S.notes = []; let t = 0.9; for (let i = 0; i < N; i++) { t += rnd(0.42, 0.85) / (0.85 + diff * 0.07); S.notes.push({ l: Math.floor(Math.random() * 4), t, st: 0 }); } S.hits = 0; S.flash = [0, 0, 0, 0]; S.end = t + 2; },
      step(S, dt, inp) {
        const line = S.H - 34, lw = S.W / 4, lanes = [];
        for (const k of inp.hit) { const l = keys.findIndex(a => a.includes(k)); if (l >= 0) lanes.push(l); }
        for (const [a] of inp.clicks) lanes.push(clamp(Math.floor(a / lw), 0, 3));
        for (const l of lanes) { S.flash[l] = 0.15; const n = S.notes.find(q => !q.st && q.l === l && Math.abs(line - (line - (q.t - S.t) * sp)) < 17); if (n) { n.st = 1; S.hits++; } }
        for (const q of S.notes) if (!q.st && (q.t - S.t) * sp < -20) q.st = -1;
        for (let l = 0; l < 4; l++) S.flash[l] = Math.max(0, S.flash[l] - dt);
        S.score = S.hits / N; S.info = `Trúng ${S.hits}/${N}`;
        if (S.t > S.end) S.done = true;
      },
      draw(c, S) {
        const line = S.H - 34, lw = S.W / 4;
        gR(c, '#241c3d', 0, 0, S.W, S.H);
        for (let l = 0; l < 4; l++) { gR(c, S.flash[l] ? '#4a3f6b' : (l % 2 ? '#2c2347' : '#30264f'), l * lw, 0, lw - 1, S.H); gT(c, col[l], 'DFJK'[l], l * lw + lw / 2, S.H - 12, 13); }
        gR(c, '#fff6e3', 0, line - 2, S.W, 4);
        for (const q of S.notes) { const y = line - (q.t - S.t) * sp; if (q.st === 1 || y < -10 || y > S.H) continue; gC(c, q.st < 0 ? '#5f656f' : col[q.l], q.l * lw + lw / 2, y, 9); gC(c, 'rgba(255,255,255,.5)', q.l * lw + lw / 2 - 3, y - 3, 3); }
      },
    };
  },
  /* ---------- Vật lý: ném xiên — chỉnh góc, canh lực, ném bóng vào rổ qua bức tường ---------- */
  physics(diff) {
    const shots = 5, need = 3, G0 = 300;
    return {
      title: 'Thí nghiệm Vật lý: chuyển động ném xiên', bot: 0.8, w: 300, h: 210,
      help: `<p>Ném quả cầu vào <b>rổ</b> phía sau bức tường. <b>Di chuột</b> để chỉnh góc ném, <b>giữ chuột</b> (hoặc <kbd>Space</kbd>) để lấy lực rồi thả ra. Phím: <kbd>↑</kbd><kbd>↓</kbd> chỉnh góc.</p><p>Có ${shots} quả, cần trúng <b>${need}</b>.</p>`,
      setup(S) { Object.assign(S, { ang: 0.9, pw: 0, ch: false, ball: null, left: shots, hits: 0, wall: 46 + diff * 9 }); S.newT = () => { S.tx = rnd(170, S.W - 34); S.ty = S.H - rnd(34, 96); }; S.newT(); },
      step(S, dt, inp) {
        const ox = 26, oy = S.H - 30;
        if (!S.ball) {
          if (inp.keys.arrowup) S.ang = Math.min(1.45, S.ang + dt); else if (inp.keys.arrowdown) S.ang = Math.max(0.15, S.ang - dt);
          else if (inp.mx > ox + 4 && inp.my < oy) S.ang = clamp(Math.atan2(oy - inp.my, inp.mx - ox), 0.15, 1.45);
          const hold = inp.down || inp.keys.space;
          if (hold) { S.ch = true; S.pw = Math.abs(Math.sin(S.t * 2.2)); }       // lực dao động lên xuống: phải canh đúng lúc thả
          else if (S.ch) { S.ch = false; const v = 150 + S.pw * 210; S.ball = { x: ox, y: oy, vx: Math.cos(S.ang) * v, vy: -Math.sin(S.ang) * v, tr: [] }; S.left--; }
        } else {
          const b = S.ball; b.vy += G0 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.tr.push([b.x, b.y]);
          const hit = b.vy > 0 && Math.abs(b.x - S.tx) < 13 && Math.abs(b.y - S.ty) < 8;
          if (b.x > 118 && b.x < 128 && b.y > S.H - 22 - S.wall) { b.vx *= -0.4; b.x = b.vx < 0 ? 117 : 129; }
          if (hit || b.y > S.H - 22 || b.x > S.W + 10 || b.x < -10) { if (hit) { S.hits++; S.newT(); } S.ball = null; S.pw = 0; if (!S.left || S.hits >= need) S.done = true; }
        }
        S.score = S.hits / need; S.info = `Trúng ${S.hits}/${need} · còn ${S.left} quả`;
      },
      draw(c, S) {
        const ox = 26, oy = S.H - 30;
        gR(c, '#eef3f6', 0, 0, S.W, S.H); for (let x = 0; x < S.W; x += 20) gR(c, '#dfe9ee', x, 0, 1, S.H); for (let y = 0; y < S.H; y += 20) gR(c, '#dfe9ee', 0, y, S.W, 1);
        gR(c, '#7b8a99', 0, S.H - 22, S.W, 22); gR(c, '#b47a48', 118, S.H - 22 - S.wall, 10, S.wall); gR(c, '#8a5a3a', 126, S.H - 22 - S.wall, 2, S.wall);
        gR(c, '#d9534f', S.tx - 14, S.ty - 2, 28, 4); c.strokeStyle = '#fffaf0'; c.lineWidth = 1; for (let i = -12; i <= 12; i += 6) { c.beginPath(); c.moveTo(S.tx + i, S.ty + 2); c.lineTo(S.tx + i * 0.6, S.ty + 14); c.stroke(); }
        gC(c, '#3a3f55', ox, oy, 9); c.strokeStyle = '#3a3f55'; c.lineWidth = 6; c.beginPath(); c.moveTo(ox, oy); c.lineTo(ox + Math.cos(S.ang) * 24, oy - Math.sin(S.ang) * 24); c.stroke();
        if (!S.ball) for (let k = 1; k <= 5; k++) { const t = k * 0.06, v = 150 + (S.ch ? S.pw : 0.5) * 210; gC(c, 'rgba(59,130,196,.45)', ox + Math.cos(S.ang) * v * t, oy - Math.sin(S.ang) * v * t + G0 * t * t / 2, 1.6); }
        else { for (const [a, b] of S.ball.tr) gR(c, 'rgba(226,87,76,.35)', a, b, 1.5, 1.5); gC(c, '#e2574c', S.ball.x, S.ball.y, 5); }
        gR(c, '#2a2136', 8, 10, 8, 80); gR(c, S.pw > 0.75 ? '#d9534f' : '#5fae4a', 9, 89 - S.pw * 78, 6, S.pw * 78); gT(c, '#2a2136', 'Lực', 12, 98, 9);
        gT(c, '#2a2136', `Góc ${Math.round(S.ang * 57.3)}°`, 46, 14, 10, 'left');
      },
    };
  },
  /* ---------- Hoá: rót ba chất đúng liều yêu cầu (rót quá tay là hỏng) ---------- */
  mix(diff) {
    const T = 26, tol = Math.max(3, 8 - diff), col = ['#3b82c4', '#e2574c', '#f4d35e'], name = ['Xanh', 'Đỏ', 'Vàng'];
    return {
      title: 'Pha chế trong phòng Hoá', bot: 0.8,
      help: `<p>Rót ba chất vào bình cho <b>đúng vạch yêu cầu</b>. Giữ phím <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> (hoặc giữ chuột trên cột) để rót — càng giữ lâu càng chảy nhanh. Rót quá vạch là hỏng chất đó.</p><p>Xong thì bấm <kbd>Enter</kbd> (hoặc nút <b>Pha xong</b>).</p>`,
      setup(S) { S.tg = [0, 1, 2].map(() => Math.round(rnd(22, 78))); S.am = [0, 0, 0]; S.hold = [0, 0, 0]; },
      step(S, dt, inp) {
        for (let i = 0; i < 3; i++) {
          const x = 30 + i * 62, on = inp.keys[String(i + 1)] || (inp.down && inp.mx > x - 6 && inp.mx < x + 42 && inp.my > 24 && inp.my < S.H - 46);
          if (on) { S.hold[i] += dt; S.am[i] = Math.min(100, S.am[i] + (14 + 46 * Math.min(1, S.hold[i] / 1.1)) * dt); } else S.hold[i] = 0;
        }
        const ok = S.am.map((a, i) => Math.abs(a - S.tg[i]) <= tol);
        S.score = ok.filter(Boolean).length / 3 * 0.8 + (ok.every(Boolean) ? 0.2 : 0); S.info = `Đúng liều: ${ok.filter(Boolean).length}/3`;
        if (S.t > T || inp.hit.includes('enter') || inp.clicks.some(([a, b]) => a > S.W - 76 && b > S.H - 34)) S.done = true;
      },
      draw(c, S) {
        gR(c, '#eef3f6', 0, 0, S.W, S.H); gTime(c, S, T - S.t, T);
        const top = 26, hh = S.H - 76;
        for (let i = 0; i < 3; i++) {
          const x = 30 + i * 62, a = S.am[i], t = S.tg[i], over = a > t + tol;
          gR(c, '#2a2136', x - 1, top - 1, 38, hh + 2); gR(c, '#fff', x, top, 36, hh);
          gR(c, 'rgba(95,174,74,.35)', x, top + hh - (t + tol) / 100 * hh, 36, 2 * tol / 100 * hh); gR(c, '#2f7d5b', x - 4, top + hh - t / 100 * hh, 44, 1);
          gR(c, over ? '#8b8f9c' : col[i], x + 3, top + hh - a / 100 * hh, 30, a / 100 * hh);
          gT(c, '#2a2136', `${i + 1} · ${name[i]}`, x + 18, S.H - 40, 10); gT(c, over ? '#d9534f' : '#2a2136', `${Math.round(a)}/${t}`, x + 18, S.H - 28, 10);
        }
        const tot = S.am[0] + S.am[1] + S.am[2], fx = 224;
        gR(c, '#2a2136', fx - 1, 59, 26, 92); gR(c, '#fff', fx, 60, 24, 90);
        if (tot > 0) { const r = (59 * S.am[0] + 226 * S.am[1] + 244 * S.am[2]) / tot, g = (130 * S.am[0] + 87 * S.am[1] + 211 * S.am[2]) / tot, b = (196 * S.am[0] + 76 * S.am[1] + 94 * S.am[2]) / tot; gR(c, `rgb(${r | 0},${g | 0},${b | 0})`, fx + 2, 150 - Math.min(88, tot / 3.2), 20, Math.min(88, tot / 3.2)); }
        gT(c, '#2a2136', 'Bình pha', fx + 12, 50, 9);
        gR(c, '#2f7d5b', S.W - 74, S.H - 30, 68, 22); gT(c, '#fff', 'Pha xong ⏎', S.W - 40, S.H - 19, 10);
      },
    };
  },
  /* ---------- Quốc phòng: ghép hình khẩu súng / quả lựu đạn (bấm 2 mảnh để đổi chỗ) ---------- */
  jigsaw(diff) {
    const [cols, rows] = diff <= 2 ? [3, 2] : diff <= 4 ? [4, 2] : [4, 3], T = 50 - diff * 3, PW = 240, PH = 144, what = Math.random() < 0.5 ? 'ak' : 'luudan';
    const pic = mk(PW, PH), x = cx(pic);
    R(x, '#dfe6d2', 0, 0, PW, PH); for (let i = 0; i < PW; i += 12) R(x, '#cfd8bf', i, 0, 1, PH); for (let j = 0; j < PH; j += 12) R(x, '#cfd8bf', 0, j, PW, 1);
    if (what === 'ak') {
      R(x, '#3a3f55', 70, 58, 96, 16); R(x, '#4a5068', 70, 58, 96, 4); R(x, '#3a3f55', 166, 62, 58, 6); R(x, '#2a2136', 218, 56, 4, 8); R(x, '#3a3f55', 186, 52, 6, 10);
      R(x, '#8a5a3a', 14, 62, 58, 18); R(x, '#a9703f', 14, 62, 58, 5); R(x, '#8a5a3a', 14, 78, 22, 14); R(x, '#8a5a3a', 128, 64, 40, 9);
      for (let k = 0; k < 6; k++) R(x, '#55662f', 112 + k * 3, 74 + k * 7, 18, 8); R(x, '#8a5a3a', 86, 74, 12, 26); R(x, '#2a2136', 100, 74, 12, 2); R(x, '#2a2136', 104, 76, 2, 8);
      R(x, '#6f8440', 0, 120, PW, 24); for (let i = 0; i < 12; i++) R(x, '#55662f', i * 21, 124 + (i % 3) * 4, 12, 5);
    } else {
      ell(x, '#55662f', 120, 84, 38, 46); ell(x, '#6f8440', 112, 76, 26, 34); for (let j = 0; j < 5; j++) for (let i = 0; i < 4; i++) R(x, '#3f4d24', 92 + i * 16, 50 + j * 16, 12, 1); for (let i = 0; i < 5; i++) R(x, '#3f4d24', 90 + i * 15, 46, 1, 78);
      R(x, '#8b8f9c', 108, 26, 24, 16); R(x, '#c9ccd4', 108, 26, 24, 4); R(x, '#5f656f', 128, 30, 34, 6); R(x, '#5f656f', 158, 30, 6, 60); ring(x, '#f4d35e', 86, 30, 9); ring(x, '#f4d35e', 86, 30, 8); R(x, '#f4d35e', 94, 29, 14, 2);
      R(x, '#6f8440', 0, 132, PW, 12);
    }
    const n = cols * rows, tw = PW / cols, th = PH / rows;
    return {
      title: what === 'ak' ? 'Ghép hình: súng AK' : 'Ghép hình: lựu đạn', bot: 0.8, w: 260, h: 190,
      help: `<p>Các mảnh hình bị xáo trộn. <b>Bấm một mảnh rồi bấm mảnh khác</b> để đổi chỗ, ghép lại thành ${what === 'ak' ? 'khẩu súng AK' : 'quả lựu đạn'} trước khi hết giờ.</p>`,
      setup(S) { S.p = Array.from({ length: n }, (v, i) => i); do { for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[S.p[i], S.p[j]] = [S.p[j], S.p[i]]; } } while (S.p.every((v, i) => v === i)); S.sel = -1; },
      step(S, dt, inp) {
        for (const [a, b] of inp.clicks) {
          const i = Math.floor((a - 10) / tw), j = Math.floor((b - 22) / th); if (i < 0 || j < 0 || i >= cols || j >= rows) continue;
          const k = j * cols + i; if (S.sel < 0) S.sel = k; else { [S.p[k], S.p[S.sel]] = [S.p[S.sel], S.p[k]]; S.sel = -1; }
        }
        const ok = S.p.filter((v, i) => v === i).length;
        S.info = `Đúng chỗ ${ok}/${n}`;
        if (ok === n) { S.score = 0.7 + 0.3 * Math.max(0, 1 - S.t / T); S.done = true; } else { S.score = ok / n * 0.55; if (S.t > T) S.done = true; }
      },
      draw(c, S) {
        gR(c, '#2a2136', 0, 0, S.W, S.H); gTime(c, S, T - S.t, T);
        S.p.forEach((v, k) => { const dx = 10 + (k % cols) * tw, dy = 22 + Math.floor(k / cols) * th; c.drawImage(pic, (v % cols) * tw, Math.floor(v / cols) * th, tw, th, dx, dy, tw - 1, th - 1); if (k === S.sel) { c.strokeStyle = '#f2a93b'; c.lineWidth = 2.5; c.strokeRect(dx + 1, dy + 1, tw - 3, th - 3); } });
      },
    };
  },
  /* ---------- Sinh: soi kính hiển vi, tìm đúng sinh vật trước khi hết giờ ---------- */
  micro(diff) {
    const rounds = 4, T = 32 - diff * 2, R0 = 88, names = ['trùng biến hình', 'trùng giày', 'trực khuẩn', 'xoắn khuẩn', 'tảo lục', 'tảo silic'];
    const dr = (c, k, x, y, a) => {
      c.save(); c.translate(x, y); c.rotate(a);
      if (k === 0) { gC(c, '#b99ad9', 0, 0, 8); gC(c, '#b99ad9', 6, 4, 5); gC(c, '#b99ad9', -5, -5, 5); gC(c, '#7a5fc9', 1, 0, 2.5); }
      else if (k === 1) { c.fillStyle = '#8fd0a8'; c.beginPath(); c.ellipse(0, 0, 11, 5, 0, 0, 6.3); c.fill(); gC(c, '#3f8f6b', 3, 0, 2); gC(c, '#fff', -4, 0, 1.5); }
      else if (k === 2) { gR(c, '#f0a6b8', -8, -2.5, 16, 5); gC(c, '#f0a6b8', -8, 0, 2.5); gC(c, '#f0a6b8', 8, 0, 2.5); }
      else if (k === 3) { c.strokeStyle = '#5a8fd6'; c.lineWidth = 2.4; c.beginPath(); for (let i = -10; i <= 10; i += 2) c.lineTo(i, Math.sin(i * 0.9) * 3.4); c.stroke(); }
      else if (k === 4) { gC(c, '#5fae4a', 0, 0, 7); gC(c, '#2f7d3a', 2, 1, 2.5); gC(c, '#a8e08a', -3, -2, 1.6); }
      else { c.fillStyle = '#e0b84a'; c.beginPath(); c.moveTo(-10, 0); c.lineTo(0, -5); c.lineTo(10, 0); c.lineTo(0, 5); c.closePath(); c.fill(); gR(c, '#a8862b', -6, -0.5, 12, 1); }
      c.restore();
    };
    return {
      title: 'Soi mẫu vật dưới kính hiển vi', bot: 0.8,
      help: `<p>Trong thị trường kính có nhiều vi sinh vật đang bơi. <b>Bấm đúng</b> loài được yêu cầu (hình mẫu ở góc). Tìm đủ <b>${rounds}</b> lần trước khi hết giờ; bấm nhầm bị trừ 3 giây.</p>`,
      setup(S) {
        S.found = 0; S.o = [];
        S.spawn = () => { S.tgt = Math.floor(Math.random() * 6); S.o = Array.from({ length: 9 + diff * 2 }, (v, i) => { const a = Math.random() * 6.28, r = Math.random() * (R0 - 14); return { k: i === 0 ? S.tgt : Math.floor(Math.random() * 6), x: Math.cos(a) * r, y: Math.sin(a) * r, vx: rnd(-1, 1) * (10 + diff * 5), vy: rnd(-1, 1) * (10 + diff * 5), a: Math.random() * 6 }; }); S.o.forEach((q, i) => { if (i && q.k === S.tgt && Math.random() < 0.7) q.k = (q.k + 1) % 6; }); };
        S.spawn();
      },
      step(S, dt, inp) {
        const cx0 = 100, cy0 = S.H / 2 + 4;
        for (const q of S.o) { q.x += q.vx * dt; q.y += q.vy * dt; q.a += dt * 0.6; if (Math.hypot(q.x, q.y) > R0 - 10) { const d = Math.hypot(q.x, q.y); q.vx -= q.x / d * 30 * dt * 4; q.vy -= q.y / d * 30 * dt * 4; } }
        for (const [a, b] of inp.clicks) { const q = S.o.find(z => Math.hypot(z.x + cx0 - a, z.y + cy0 - b) < 12); if (!q) continue; if (q.k === S.tgt) { S.found++; if (S.found >= rounds) S.done = true; else S.spawn(); } else S.t += 3; }
        S.score = S.found / rounds; S.info = `Tìm: ${names[S.tgt]} · ${S.found}/${rounds}`;
        if (S.t > T) S.done = true;
      },
      draw(c, S) {
        const cx0 = 100, cy0 = S.H / 2 + 4;
        gR(c, '#2a2136', 0, 0, S.W, S.H); gTime(c, S, T - S.t, T); gC(c, '#3a3f55', cx0, cy0, R0 + 5); gC(c, '#eaf6f0', cx0, cy0, R0);
        c.save(); c.beginPath(); c.arc(cx0, cy0, R0, 0, 6.3); c.clip(); for (const q of S.o) dr(c, q.k, cx0 + q.x, cy0 + q.y, q.a); c.restore();
        gR(c, '#fff6e3', 200, 40, 52, 52); dr(c, S.tgt, 226, 66, 0); gT(c, '#fff6e3', 'Cần tìm', 226, 30, 10); gT(c, '#fff6e3', names[S.tgt], 226, 104, 9);
      },
    };
  },
  /* ---------- trốn tìm: bấm vào bụi cây có bạn đang nấp (lộ chỏm tóc) ---------- */
  seek(diff) {
    const T = 22 - diff, kids = 3;
    return {
      title: 'Trốn tìm', bot: 0.8, help: `<p>Các bạn đang nấp sau bụi cây, thỉnh thoảng <b>ló chỏm tóc</b> lên. Bấm vào đúng bụi có người để bắt. Tìm đủ <b>${kids}</b> bạn trước khi hết giờ; bấm nhầm bị trừ 2 giây.</p>`,
      setup(S) { S.b = Array.from({ length: 12 }, (v, i) => ({ x: 34 + (i % 4) * 62, y: 60 + Math.floor(i / 4) * 52, kid: false, ph: Math.random() * 6, got: false })); let k = 0; while (k < kids) { const q = pick(S.b); if (!q.kid) { q.kid = true; k++; } } S.found = 0; },
      step(S, dt, inp) {
        for (const [a, b] of inp.clicks) { const q = S.b.find(z => !z.got && Math.abs(z.x - a) < 22 && Math.abs(z.y - b) < 18); if (!q) continue; if (q.kid) { q.got = true; S.found++; } else S.t += 2; }
        S.score = S.found / kids; S.info = `Tìm được ${S.found}/${kids}`;
        if (S.found >= kids || S.t > T) S.done = true;
      },
      draw(c, S) {
        gR(c, '#86c35d', 0, 0, S.W, S.H); gTime(c, S, T - S.t, T);
        for (const q of S.b) {
          const up = q.kid && !q.got && Math.sin(S.t * (1.6 + diff * 0.25) + q.ph) > 0.72;
          if (q.got) { gC(c, '#f8d0a8', q.x, q.y - 14, 8); gR(c, '#2c2733', q.x - 8, q.y - 22, 16, 7); gR(c, '#2a2136', q.x - 4, q.y - 14, 2, 2); gR(c, '#2a2136', q.x + 2, q.y - 14, 2, 2); }
          else if (up) gR(c, '#2c2733', q.x - 6, q.y - 17, 12, 6);
          c.fillStyle = '#4f9d48'; c.beginPath(); c.ellipse(q.x, q.y, 22, 14, 0, 0, 6.3); c.fill(); c.fillStyle = '#69b85a'; c.beginPath(); c.ellipse(q.x - 6, q.y - 4, 10, 6, 0, 0, 6.3); c.fill();
        }
      },
    };
  },
  /* ---------- máy gắp thú: càng chạy qua lại, bấm để thả càng xuống ---------- */
  claw(diff) {
    const tries = 3;
    return {
      title: 'Máy gắp thú', bot: 0.75, w: 240, h: 200, help: `<p>Càng gắp chạy qua chạy lại. Bấm <kbd>Space</kbd> (hoặc bấm chuột) để <b>thả càng</b> đúng lúc nó ở ngay trên một con gấu. Có ${tries} lượt.</p>`,
      setup(S) { S.x = 30; S.dir = 1; S.y = 34; S.st = 0; S.left = tries; S.toys = [50, 96, 142, 188].map((x, i) => ({ x, col: ['#b9824f', '#e98fa5', '#8fd067', '#5a8fd6'][i], got: false })); S.grab = null; },
      step(S, dt, inp) {
        const go = inp.hit.includes('space') || inp.clicks.length;
        if (S.st === 0) { S.x += S.dir * (70 + diff * 22) * dt; if (S.x > S.W - 26 || S.x < 26) S.dir *= -1; if (go) S.st = 1; }
        else if (S.st === 1) { S.y += 150 * dt; if (S.y >= S.H - 58) { S.grab = S.toys.find(t => !t.got && Math.abs(t.x - S.x) < 13 - diff) || null; S.st = 2; } }
        else { S.y -= 120 * dt; if (S.y <= 34) { S.y = 34; S.st = 0; S.left--; if (S.grab) { S.grab.got = true; S.score = 1; S.done = true; } else if (!S.left) S.done = true; S.grab = null; } }
        S.info = `Còn ${S.left} lượt`;
      },
      draw(c, S) {
        gR(c, '#2c2347', 0, 0, S.W, S.H); gR(c, '#bfe3f2', 10, 14, S.W - 20, S.H - 44); gR(c, '#e2574c', 10, S.H - 30, S.W - 20, 22); gR(c, '#8b8f9c', 10, 20, S.W - 20, 4);
        for (const t of S.toys) { if (t.got) continue; const y = S.grab === t ? S.y + 24 : S.H - 44; gC(c, t.col, t.x, y, 10); gC(c, t.col, t.x - 8, y - 9, 4); gC(c, t.col, t.x + 8, y - 9, 4); gR(c, '#2a2136', t.x - 4, y - 3, 2, 2); gR(c, '#2a2136', t.x + 2, y - 3, 2, 2); }
        gR(c, '#5f656f', S.x - 1, 22, 2, S.y - 14); gR(c, '#8b8f9c', S.x - 9, S.y + 6, 18, 4); gR(c, '#8b8f9c', S.x - 9, S.y + 8, 3, 12); gR(c, '#8b8f9c', S.x + 6, S.y + 8, 3, 12);
      },
    };
  },
  /* ---------- máy may rủi: bấm để dừng từng ô; trùng nhau thì trúng xèng ---------- */
  slot() {
    const sym = ['7', '★', '♥', '♣', '◆'], col = ['#e2574c', '#f2a93b', '#e98fa5', '#5fae4a', '#3b82c4'];
    return {
      title: 'Máy may rủi', bot: () => pick([0, 0, 0.5, 0.5, 1]), w: 220, h: 170, help: '<p>Ba ô quay liên tục. Bấm <kbd>Space</kbd> (hoặc bấm chuột) để <b>dừng từng ô</b>. Ba ô giống nhau: trúng lớn. Hai ô giống nhau: trúng nhỏ.</p>',
      setup(S) { S.v = [0, 2, 4]; S.stop = 0; S.acc = 0; },
      step(S, dt, inp) {
        S.acc += dt; if (S.acc > 0.07) { S.acc = 0; for (let i = S.stop; i < 3; i++) S.v[i] = (S.v[i] + 1 + Math.floor(Math.random() * 2)) % 5; }
        if (inp.hit.includes('space') || inp.clicks.length) S.stop++;
        if (S.stop >= 3) { const [a, b, d] = S.v; S.score = a === b && b === d ? 1 : (a === b || b === d || a === d) ? 0.5 : 0; S.done = true; }
        S.info = `Đã dừng ${Math.min(3, S.stop)}/3 ô`;
      },
      draw(c, S) {
        gR(c, '#d9534f', 0, 0, S.W, S.H); gR(c, '#f4d35e', 8, 8, S.W - 16, S.H - 16); gR(c, '#2a2136', 20, 40, S.W - 40, 80);
        for (let i = 0; i < 3; i++) { gR(c, '#fffaf0', 28 + i * 56, 48, 50, 64); gT(c, col[S.v[i]], sym[S.v[i]], 53 + i * 56, 82, 38); if (i < S.stop) { c.strokeStyle = '#5fae4a'; c.lineWidth = 3; c.strokeRect(28 + i * 56, 48, 50, 64); } }
        gT(c, '#2a2136', 'MAY MẮN', S.W / 2, 24, 14);
      },
    };
  },
};
// Chơi một trò; trả về { score, skipped }. Tự khoá điều khiển trong lúc chơi nếu chưa khoá.
async function playGame(kind, diff, a, b) { return UI.game(GAMES[kind](diff || 2, a, b)); }

/* ============================================================
 *  CỬA HÀNG DẠNG ICON: bấm vào món để xem tên, mô tả rồi mua
 * ============================================================ */
// items: [{ id, icon, name, price, desc, owned, off }] · onBuy(item) · extra(): html thêm phía dưới · handlers thêm
UI.store = function (title, greet, items, onBuy, extra, more) {
  let sel = null;
  const list = () => (typeof items === 'function' ? items() : items);
  this.panel(title, () => {
    const L = list(), it = L.find(x => x.id === sel);
    let h = `<p>${greet} — Bạn đang có <b>${fmtMoney(G.money)}</b>.</p><div class="tiles">`;
    for (const x of L) h += `<button class="tile ${x.id === sel ? 'on' : ''} ${x.owned ? 'own' : ''}" data-act="sel" data-id="${x.id}" title="${x.name}"><img src="${itemIcon(x.icon || x.id)}" alt="${x.name}"><small>${x.owned ? 'Đã có' : fmtMoney(x.price)}</small></button>`;
    h += '</div>';
    h += it ? `<div class="tinfo"><img src="${itemIcon(it.icon || it.id)}" alt=""><span><b>${it.name}</b><small>${it.desc || ''}</small></span><button class="btn sm primary" data-act="buy" ${it.owned || it.off || G.money < it.price ? 'disabled' : ''}>${it.owned ? 'Đã có' : 'Mua · ' + fmtMoney(it.price)}</button></div>`
      : '<div class="tinfo dim">Bấm vào một món để xem.</div>';
    return h + (extra ? extra() : '');
  }, Object.assign({ sel: d => { sel = d.id; }, buy: () => { const it = list().find(x => x.id === sel); if (it) onBuy(it); } }, more || {}), true);
};
UI.shop = function () {
  const owned = it => !!((it.own && G.owned[it.own]) || (it.special === 'vethang' && G.busPassUntil >= G.day));
  UI.store('Tạp hoá Cô Ba', '“Mua gì con?”', () => SHOP.map(it => Object.assign({}, it, { owned: owned(it) })), it => buy(SHOP.find(x => x.id === it.id)), () => {
    let h = '';
    if (fishCount()) h += `<h4>Bán cá câu được</h4><div class="rowi"><span><b>${fishCount()} con cá</b> <small>${FISH.filter(f => G.fish[f.id]).map(f => `${f.name} ×${G.fish[f.id]}`).join(' · ')}</small></span><button class="btn sm" data-act="fish">Bán hết · ${fmtMoney(fishValue())}</button></div>`;
    return h + `<h4>Phụ bán hàng (ngày nghỉ, 08:00–18:00)</h4><div class="rowi"><span><b>Phụ cô Ba 2 tiếng</b> <small>Cô Ba trả công ${fmtMoney(PART_TIME.pay + PART_TIME.payPerLv * lv('buonban'))}</small></span><button class="btn sm" data-act="pt">Nhận việc</button></div>`;
  }, { pt: () => { partTime(); }, fish: () => sellFish() });
};
