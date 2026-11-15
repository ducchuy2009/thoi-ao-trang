'use strict';
/* ============================================================
 *  05c. LƯU BÚT (tab trong menu): kỷ vật · khoảnh khắc · lời lưu bút
 * ============================================================ */
MV.memo = {
  h: { mst: d => { UI._mstab = d.id; } },
  render() {
    const st = UI._mstab || 'items', M = G.memo, nI = Object.keys(M.items).length, nS = Object.keys(M.scenes).length;
    let h = subTabs('mst', st, [['items', 'Kỷ vật'], ['scenes', 'Khoảnh khắc'], ['notes', 'Lời lưu bút']]);
    h += `<p class="dim">Đã sưu tầm ${nI}/${Object.keys(MEMO_ITEMS).length} kỷ vật · ${nS}/${Object.keys(MEMO_SCENES).length} khoảnh khắc.</p>`;
    if (st === 'items') {
      h += '<div class="memo-grid">';
      for (const id in MEMO_ITEMS) {
        const D = MEMO_ITEMS[id], got = M.items[id] !== undefined;
        h += `<div class="memo-item ${got ? '' : 'lock'}"><img src="${itemIcon(id)}" alt=""><b>${got ? D.name : '???'}</b><small>${got ? D.desc + `<br><i>${dateLabel(M.items[id])}, năm ${cal(M.items[id]).year + 1}</i>` : 'Gợi ý: ' + D.hint}</small></div>`;
      }
      return h + '</div>';
    }
    if (st === 'scenes') {
      h += '<div class="rows">';
      for (const id in MEMO_SCENES) {
        const D = MEMO_SCENES[id], got = M.scenes[id] !== undefined;
        h += `<div class="memo-row ${got ? '' : 'lock'}"><img src="${itemIcon(D.icon)}" alt=""><span><b>${got ? D.name : '???'}</b><small>${got ? D.desc : 'Chưa có khoảnh khắc này.'}</small></span>${got ? `<i>${dateLabel(M.scenes[id])}<br>năm ${cal(M.scenes[id]).year + 1}</i>` : ''}</div>`;
      }
      return h + '</div>';
    }
    // lời lưu bút
    if (!M.notes) {
      h += `<p>Vào <b>ngày tốt nghiệp</b>, những người thân với bạn từ ${MEMO_NOTE_HEARTS}♥ trở lên sẽ viết lưu bút cho bạn.</p><div class="fgrid">`;
      for (const p of memoPeople()) h += `<div class="frow"><img src="${faceOf(p.look, null)}" alt=""><div><b>${p.name}</b><small>${p.n >= MEMO_NOTE_HEARTS ? 'Sẽ viết lưu bút cho bạn' : `Cần thân thêm (${p.n}/${MEMO_NOTE_HEARTS}♥)`}</small></div>${heartsHtml(p.n)}</div>`;
      return h + '</div>';
    }
    h += '<div class="rows">';
    for (const p of memoPeople()) {
      const n = M.notes[p.id];
      h += n ? `<div class="memo-note"><img src="${faceOf(p.look, null)}" alt=""><div><b>${p.name}</b><p>“${MEMO_NOTES[p.id]}”</p></div></div>` : `<div class="memo-note lock"><img src="${faceOf(p.look, null)}" alt=""><div><b>${p.name}</b><p class="dim">Không viết lưu bút.</p></div></div>`;
    }
    return h + '</div>';
  },
};
