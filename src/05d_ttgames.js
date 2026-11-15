'use strict';
/* ============================================================
 *  05d. MINI-GAME ĐÊM TRUNG THU: bịt mắt đập niêu · kéo co · ghép đèn ông sao
 *  (cùng khung UI.game ở 05b_games.js)
 * ============================================================ */
Object.assign(GAMES, {
  /* ---------- bịt mắt đập niêu: không nhìn thấy niêu, nghe người dẫn đường (chữ vàng) mà đi, đám đông la ó chỉ bậy (chữ xám) ---------- */
  dapnieu(diff, guide) {
    const R0 = 17 - diff * 2, T = 32, SWINGS = 3, SP = 58;
    const BTN = { l: [176, 168], r: [232, 168], u: [204, 146], d: [204, 190], hit: [140, 182] };
    const inBtn = (k, x, y) => { const [bx, by] = BTN[k]; return k === 'hit' ? Math.abs(x - bx) < 24 && Math.abs(y - by) < 13 : Math.abs(x - bx) < 12 && Math.abs(y - by) < 10; };
    return {
      title: 'Bịt mắt đập niêu', w: 260, h: 210, bot: 0.8,
      help: `<p>Mắt bị bịt kín! Nghe <b style="color:#c9962a">${guide}</b> chỉ đường (chữ vàng) mà đi tới chỗ treo niêu. Đám đông hay la ó chỉ bậy (chữ xám) — đừng nghe!</p><p class="dim">Mũi tên / WASD (hoặc giữ nút mũi tên) để đi · <kbd>Space</kbd> hoặc nút ĐẬP để vung gậy · ${SWINGS} lần vung.</p>`,
      setup(S) { Object.assign(S, { px: 60 + Math.random() * 140, py: 150, nx: 34 + Math.random() * 120, ny: 40 + Math.random() * 70, sw: SWINGS, say: 'Đi từ từ thôi, tớ chỉ cho!', sayT: 0.9, noise: '', noiseT: 1.6, nzx: 0, nzy: 0, swing: 0, broke: false, end: null, miss: 0 }); },
      step(S, dt, inp) {
        const K = inp.keys, held = k => inp.down && inBtn(k, inp.mx, inp.my);
        if (S.end === null) {
          let dx = 0, dy = 0;
          if (K.arrowleft || K.a || held('l')) dx--; if (K.arrowright || K.d || held('r')) dx++;
          if (K.arrowup || K.w || held('u')) dy--; if (K.arrowdown || K.s || held('d')) dy++;
          S.px = clamp(S.px + dx * SP * dt, 12, 248); S.py = clamp(S.py + dy * SP * dt, 24, 196);
          const ex = S.nx - S.px, ey = S.ny - S.py, dist = Math.hypot(ex, ey);
          S.sayT -= dt;
          if (S.sayT <= 0) {
            S.sayT = 0.7 + diff * 0.08;
            S.say = dist < R0 ? 'Đập đi! Ngay trên đầu đó!' : Math.abs(ex) > Math.abs(ey) ? (ex < 0 ? 'Sang trái!' : 'Sang phải!') + (Math.abs(ex) < 26 ? ' Chút xíu nữa!' : '') : (ey < 0 ? 'Tiến lên!' : 'Lùi lại!') + (Math.abs(ey) < 26 ? ' Gần lắm rồi!' : '');
          }
          S.noiseT -= dt;
          if (S.noiseT <= 0) { S.noiseT = 1.1 + Math.random() * 1.3; S.noise = pick(['Trái! Trái!', 'Phải cơ!', 'Lên nữa! Lên!', 'Lùi lại đi!', 'Đập luôn đi!', 'Sai rồi, quay lại!']); S.nzx = 40 + Math.random() * 180; S.nzy = 60 + Math.random() * 70; }
          const hit = inp.hit.includes('space') || inp.hit.includes('enter') || inp.clicks.some(([x, y]) => inBtn('hit', x, y));
          if (hit && S.swing <= 0 && S.sw > 0) {
            S.sw--; S.swing = 0.45;
            if (dist < R0) { S.broke = true; S.end = 1.4; }
            else { S.miss = 0.6; if (S.sw === 0) S.end = 1.2; }
          }
          if (S.t >= T) S.end = 1.0;
        } else { S.end -= dt; if (S.end <= 0) { S.score = S.broke ? clamp(0.7 + 0.15 * S.sw, 0, 1) : 0.2; S.done = true; } }
        if (S.swing > 0) S.swing -= dt; if (S.miss > 0) S.miss -= dt;
        S.info = S.broke ? 'Bốp! Vỡ niêu rồi!' : S.end !== null ? 'Hết lượt rồi…' : `Còn ${S.sw} lần vung gậy`;
      },
      draw(c, S) {
        const reveal = S.end !== null;
        gR(c, reveal ? '#2f3f2a' : '#15121f', 0, 0, S.W, S.H);
        if (!reveal) { for (let i = 0; i < 6; i++) gC(c, 'rgba(255,255,255,0.025)', S.px, S.py, 14 + i * 9); }
        gTime(c, S, Math.max(0, T - S.t), T);
        // chính mình (biết mình đã đi tới đâu) + gậy
        gC(c, '#f8d0a8', S.px, S.py, 6); gR(c, '#2a2136', S.px - 6, S.py - 3, 12, 3);           // khăn bịt mắt
        const a = S.swing > 0 ? -2.2 + (0.45 - S.swing) * 6 : -0.6;
        c.strokeStyle = '#a9703f'; c.lineWidth = 3; c.beginPath(); c.moveTo(S.px + 4, S.py + 2); c.lineTo(S.px + 4 + Math.cos(a) * 22, S.py + 2 + Math.sin(a) * 22); c.stroke();
        if (S.miss > 0) gT(c, '#cfc8bb', 'Vụt! Trượt rồi…', S.px, S.py - 18, 9);
        // khi hết lượt mới thấy niêu
        if (reveal) {
          gR(c, '#3a2a22', S.nx, 14, 1, S.ny - 20);
          if (S.broke) { for (let i = 0; i < 12; i++) { const k = 1.4 - S.end, an = i / 12 * 6.283; gC(c, ['#ffd23a', '#e2574c', '#5fe0f0', '#8fd067'][i % 4], S.nx + Math.cos(an) * 22 * k, S.ny + Math.sin(an) * 10 * k + k * k * 30, 2.5); } gR(c, '#8a5a3a', S.nx - 8, S.ny + 2, 6, 4); gR(c, '#8a5a3a', S.nx + 3, S.ny + 3, 6, 4); }
          else { gC(c, '#8a5a3a', S.nx, S.ny, 9); gR(c, '#d9534f', S.nx - 9, S.ny - 9, 18, 3); }
        }
        // người dẫn đường (vàng) và tiếng la ó (xám)
        if (!reveal) {
          c.fillStyle = 'rgba(255,246,227,0.95)'; c.fillRect(10, 18, 166, 22); gT(c, '#c9962a', guide + ':', 14, 29, 9, 'left'); gT(c, '#2a2136', S.say, 14 + (guide.length + 1) * 5.6, 29, 10, 'left');
          if (S.noise && S.noiseT > 0.4) gT(c, 'rgba(200,196,210,0.75)', S.noise, S.nzx, S.nzy, 10);
        }
        // nút bấm (chuột / cảm ứng)
        for (const k of ['l', 'r', 'u', 'd']) { const [bx, by] = BTN[k]; gR(c, 'rgba(255,255,255,0.12)', bx - 11, by - 9, 22, 18); gArrow(c, '#fff6e3', { l: 0, d: 1, u: 2, r: 3 }[k], bx, by, 6); }
        gR(c, S.sw > 0 && !reveal ? '#d9534f' : '#5f565f', BTN.hit[0] - 24, BTN.hit[1] - 12, 48, 24); gT(c, '#fff6e3', 'ĐẬP!', BTN.hit[0], BTN.hit[1], 11);
      },
    };
  },
  /* ---------- kéo co: bấm thật nhanh để có lực kéo ---------- */
  keoco(diff, mates, nMates) {
    const T = 15, LINE = 64;
    return {
      title: 'Kéo co', w: 260, h: 200, bot: 0.96,
      help: `<p>Bấm <kbd>Space</kbd> (hoặc bấm chuột liên tục vào sân) <b>thật nhanh</b> để kéo! Kéo dải lụa đỏ qua vạch trắng bên mình (bên trái) là thắng.</p>${mates ? `<p class="dim">${mates} cùng đội góp sức.</p>` : ''}<p class="dim">Đội bạn hay dồn sức từng đợt — giữ nhịp bấm đều tay!</p>`,
      setup(S) { Object.assign(S, { p: 0, taps: [], opp: 0, my: 0 }); },
      step(S, dt, inp) {
        const n = inp.hit.filter(k => k === 'space' || k === 'enter').length + inp.clicks.length;
        for (let i = 0; i < n; i++) S.taps.push(S.t);
        S.taps = S.taps.filter(t => S.t - t < 1);
        S.my = S.taps.length * 0.055 * (1 + 0.04 * lv('thethao')) + (nMates || 0) * 0.05;
        const surge = Math.max(0, Math.sin(S.t * 1.7)) * 0.16 + (Math.sin(S.t * 0.55) > 0.75 ? 0.14 : 0);
        S.opp = 0.24 + diff * 0.07 + surge;
        S.p = clamp(S.p + (S.opp - S.my) * dt * 1.6, -1, 1);
        if (S.p <= -1) { S.score = 1; S.done = true; } else if (S.p >= 1) { S.score = 0.25; S.done = true; } else if (S.t >= T) { S.score = S.p < 0 ? 0.75 : 0.35; S.done = true; }
        S.info = S.taps.length >= 7 ? 'Dô ta! Dô ta!' : 'Bấm nhanh nữa lên!';
      },
      draw(c, S) {
        gR(c, '#4f8f3a', 0, 0, S.W, S.H); gR(c, '#5fa046', 0, 120, S.W, 80);
        gTime(c, S, Math.max(0, T - S.t), T);
        const cx = 130, off = S.p * LINE;
        gR(c, '#fffaf0', cx - LINE, 96, 2, 44); gR(c, '#fffaf0', cx + LINE, 96, 2, 44); gR(c, 'rgba(255,255,255,0.4)', cx, 100, 1, 36);
        gT(c, '#fff6e3', 'Hoa Phượng', 40, 150, 10); gT(c, '#fff6e3', 'Bờ Sông', 220, 150, 10);
        // dây
        c.strokeStyle = '#c9a467'; c.lineWidth = 3; c.beginPath(); c.moveTo(12, 118); c.quadraticCurveTo(cx + off, 116 + Math.sin(S.t * 9) * 1.5, 248, 118); c.stroke();
        gR(c, '#e2574c', cx + off - 2, 110, 4, 14);
        // hai đội (người ngả ra sau)
        const lean = Math.sin(S.t * 12) * 1.5;
        for (let i = 0; i < 4; i++) { const x = 20 + i * 18 + off * 0.6, y = 112; gC(c, '#f8d0a8', x - 3 + lean, y - 14, 4); gR(c, i === 3 ? '#4fb3a6' : '#e98fa5', x - 5 + lean, y - 10, 8, 12); gR(c, '#3a3f55', x - 4, y + 2, 7, 8); }
        for (let i = 0; i < 4; i++) { const x = 186 + i * 18 + off * 0.6, y = 112; gC(c, '#f8d0a8', x + 3 - lean, y - 14, 4); gR(c, '#3b82c4', x - 3 - lean, y - 10, 8, 12); gR(c, '#3a3f55', x - 3, y + 2, 7, 8); }
        // lực hai bên
        gR(c, '#2a2136', 14, 172, 100, 8); gR(c, '#8fd067', 15, 173, Math.min(98, S.my * 140), 6);
        gR(c, '#2a2136', 146, 172, 100, 8); gR(c, '#e2574c', 147, 173, Math.min(98, S.opp * 140), 6);
        gT(c, '#fff6e3', 'Lực đội mình', 64, 188, 9); gT(c, '#fff6e3', 'Lực đội bạn', 196, 188, 9);
      },
    };
  },
  /* ---------- ghép đèn ông sao: nối nan tre thành ngôi sao → dán giấy bóng kính 5 cánh + giữa → gắn nến, gắn cán ---------- */
  denlong(diff) {
    const T = 55 - diff * 6, CX = 130, CY = 104, RO = 66, RI = RO * 0.382, MAXMISS = 3;
    const P = [], I = [];
    for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * 2 * Math.PI / 5; P.push([CX + Math.cos(a) * RO, CY + Math.sin(a) * RO]); const b = a + Math.PI / 5; I.push([CX + Math.cos(b) * RI, CY + Math.sin(b) * RI]); }
    const arm = k => [P[k], I[k], I[(k + 4) % 5]], cen = pts => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
    const segKey = (a, b) => Math.min(a, b) + '-' + Math.max(a, b);
    return {
      title: 'Ghép đèn ông sao', w: 260, h: 220, bot: 0.85,
      help: `<p><b>1.</b> Nối nan tre: bấm các đỉnh <b>cách một</b> để thành ngôi sao năm cánh.<br><b>2.</b> Bấm vào 5 cánh và phần giữa để dán giấy bóng kính.<br><b>3.</b> Bấm giữa ngôi sao để gắn nến, rồi bấm dưới đáy để gắn cán cầm.</p><p class="dim">Sai quá ${MAXMISS} lần là hỏng đèn.</p>`,
      setup(S) { Object.assign(S, { ph: 'khung', cur: -1, segs: {}, nSeg: 0, arms: [0, 0, 0, 0, 0], mid: false, nen: false, can: false, miss: 0, shake: 0 }); },
      step(S, dt, inp) {
        if (S.shake > 0) S.shake -= dt;
        const bad = () => { S.miss++; S.shake = 0.3; if (S.miss > MAXMISS) { S.score = 0.25 * S.prog; S.done = true; } };
        S.prog = (S.nSeg + S.arms.filter(Boolean).length + (S.mid ? 1 : 0) + (S.nen ? 1 : 0) + (S.can ? 1 : 0)) / 13;
        for (const [x, y] of inp.clicks) {
          if (S.done) break;
          if (S.ph === 'khung') {
            const k = P.findIndex(([px, py]) => Math.hypot(px - x, py - y) < 13); if (k < 0) continue;
            if (S.cur < 0) { S.cur = k; continue; }
            const step = (k - S.cur + 5) % 5;
            if ((step === 2 || step === 3) && !S.segs[segKey(S.cur, k)]) { S.segs[segKey(S.cur, k)] = 1; S.nSeg++; S.cur = k; if (S.nSeg === 5) S.ph = 'giay'; }
            else if (k !== S.cur) bad();
          } else if (S.ph === 'giay') {
            const k = [0, 1, 2, 3, 4].find(i => { const [ax, ay] = cen(arm(i)); return Math.hypot(ax - x, ay - y) < 15; });
            if (k !== undefined && !S.arms[k]) S.arms[k] = 1;
            else if (Math.hypot(x - CX, y - CY) < RI * 0.9 && !S.mid) S.mid = true;
            else if (k === undefined) bad();
            if (S.arms.every(Boolean) && S.mid) S.ph = 'nen';
          } else if (S.ph === 'nen') {
            if (!S.nen) { if (Math.hypot(x - CX, y - CY) < 14) S.nen = true; else bad(); }
            else if (!S.can) { if (y > CY + RO * 0.55 && Math.abs(x - CX) < 40) { S.can = true; S.score = clamp(1 - 0.08 * S.miss - 0.15 * (S.t / T), 0.6, 1); S.end = 1; } else bad(); }
          }
        }
        if (S.end) { S.end -= dt; if (S.end <= 0) S.done = true; }
        if (!S.end && !S.done && S.t >= T) { S.score = 0.3 * S.prog; S.done = true; }
        S.info = S.ph === 'khung' ? `Nối nan tre: ${S.nSeg}/5` : S.ph === 'giay' ? `Dán giấy: ${S.arms.filter(Boolean).length + (S.mid ? 1 : 0)}/6` : !S.nen ? 'Gắn nến vào giữa' : !S.can ? 'Gắn cán cầm ở dưới' : 'Xong rồi!';
      },
      draw(c, S) {
        const sx = S.shake > 0 ? Math.sin(S.t * 80) * 3 : 0;
        gR(c, '#f3e6c8', 0, 0, S.W, S.H); gR(c, '#e6d4ae', 0, 196, S.W, 24);
        gTime(c, S, Math.max(0, T - S.t), T);
        c.save(); c.translate(sx, 0);
        // giấy bóng kính
        const poly = (pts, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) c.lineTo(p[0], p[1]); c.closePath(); c.fill(); };
        for (let k = 0; k < 5; k++) if (S.arms[k]) poly(arm(k), k % 2 ? 'rgba(242,201,76,0.85)' : 'rgba(226,87,76,0.85)');
        if (S.mid) poly(I, 'rgba(226,87,76,0.85)');
        if (S.nen) { const g = c.createRadialGradient(CX, CY, 2, CX, CY, 46); g.addColorStop(0, 'rgba(255,236,150,0.85)'); g.addColorStop(1, 'rgba(255,236,150,0)'); c.fillStyle = g; c.fillRect(CX - 46, CY - 46, 92, 92); gR(c, '#fffaf0', CX - 2, CY - 2, 4, 8); gC(c, '#ffb43a', CX, CY - 5, 2.5); }
        if (S.can) { gR(c, '#8a5a3a', CX - 1.5, CY + RO * 0.62, 3, 60); }
        // nan tre đã nối
        c.strokeStyle = '#a9703f'; c.lineWidth = 3;
        for (const k in S.segs) { const [a, b] = k.split('-').map(Number); c.beginPath(); c.moveTo(P[a][0], P[a][1]); c.lineTo(P[b][0], P[b][1]); c.stroke(); }
        // đỉnh
        P.forEach(([x, y], k) => { gC(c, k === S.cur && S.ph === 'khung' ? '#e2574c' : '#5b3d27', x, y, S.ph === 'khung' ? 6 : 3.5); });
        // gợi ý vị trí bấm
        if (S.ph === 'giay') for (let k = 0; k < 5; k++) if (!S.arms[k]) { const [ax, ay] = cen(arm(k)); gC(c, 'rgba(91,61,39,0.25)', ax, ay, 5); }
        if (S.ph === 'giay' && !S.mid) gC(c, 'rgba(91,61,39,0.25)', CX, CY, 6);
        if (S.ph === 'nen' && !S.nen) gT(c, '#5b3d27', '↓ nến', CX, CY - 14, 9);
        if (S.ph === 'nen' && S.nen && !S.can) gT(c, '#5b3d27', 'bấm đây gắn cán', CX, CY + RO * 0.75, 9);
        c.restore();
        gT(c, '#5b3d27', `Lỗi: ${S.miss}/${MAXMISS}`, 226, 24, 9);
      },
    };
  },
});
