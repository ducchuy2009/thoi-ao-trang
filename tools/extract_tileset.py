#!/usr/bin/env python3
"""Tách ảnh "Tài nguyên game" (assets/source/tileset_mau.webp) vào assets/sprites/tainguyen/.

Ảnh này khác bố cục sheet nhân vật: 12 ô nhỏ (hoạt ảnh thêm của nhân vật chính), 6 ô NPC (mỗi ô 1–3 người),
1 ô cảnh cổng trường (có nền trời/đất riêng → xuất nguyên cảnh), các công trình / đồ vật vẽ thẳng trên nền tối.
Khối điểm ảnh ≈ 3 px (nhỏ hơn sheet nhân vật 4 px và nhân vật cũng vẽ nhỏ hơn) → giữ atlas riêng, không trộn với
assets/sprites/<nhân vật>.png. Dùng lại các hàm của tools/extract_sprites.py. Chạy: python3 tools/extract_tileset.py
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import extract_sprites as E

B = 3.0
OUT = os.path.join(E.OUT, 'tainguyen')
SMALL_ROWS = [('nusinh', 206), ('namsinh', 350)]                     # (nhân vật, y hàng ô)
SMALL_COLS = [29, 117, 205, 299, 388, 477]
SMALL_ACT = [('saugay', 'up')] * 3 + [('noichuyen', 'down')] * 3       # "sau gáy (đằng sau)" = đi bộ mặt sau; "nói chuyện"
NPC = [((589, 186, 124, 103), ['baove', 'baove']), ((721, 186, 123, 103), ['banrong']), ((853, 186, 142, 103), ['cogiao', 'thaygiao']),
       ((589, 322, 191, 101), ['ongthay', 'hocsinh', 'hocsinh']), ((788, 322, 207, 101), ['hocsinh', 'hocsinh', 'hocsinh'])]
SCENE = (23, 500, 497, 250)
# đồ vật trên nền tối: (tên, hộp tìm) — mỗi hộp lấy các thành phần liên thông nằm gọn bên trong
PROPS = [('taphoa', (596, 495, 126, 142)), ('nuocmia', (722, 497, 120, 126)), ('combinhdan', (843, 493, 118, 132)), ('tulanh', (956, 550, 44, 62)),
         ('cotdien_1', (530, 498, 64, 124)), ('meo', (546, 584, 25, 29)), ('phuong', (528, 620, 112, 132)), ('caycay', (660, 620, 84, 132)),
         ('cotdien_2', (744, 620, 52, 124)), ('xemay', (900, 616, 70, 44)), ('tuongrao', (848, 652, 152, 100)), ('xedap', (782, 704, 64, 42))]


def cut_free(im, sbg, box):
    """Tách đồ vật vẽ trên nền tối: nền = gần màu nền sheet; giữ thành phần lớn nhất + mảnh dính sát."""
    x, y, w, h = box
    sub = im[y:y + h, x:x + w]
    fg = ndimage.binary_opening(np.abs(sub - sbg).sum(2) > 24, iterations=1)
    lab, n = ndimage.label(fg)
    if n == 0: return sub, fg
    sz = ndimage.sum(fg, lab, range(1, n + 1)); main = int(np.argmax(sz)) + 1
    keep = lab == main
    for _ in range(3):                                                  # gom các mảnh dính dần vào (dây điện, bánh xe, chân ghế)
        near = ndimage.binary_dilation(keep, iterations=2)
        for i in range(1, n + 1):
            if not keep[lab == i].any() and sz[i - 1] >= 12 and (near & (lab == i)).any(): keep |= lab == i
    return sub, keep


def people(im, sbg, box):
    """Ô NPC có nhiều người: xoá nền ô rồi tách từng người theo thành phần liên thông lớn, trái → phải."""
    sub, fg, _ = cut_all(im, box)
    lab, n = ndimage.label(fg)
    sz = ndimage.sum(fg, lab, range(1, n + 1))
    big = [i + 1 for i in range(n) if sz[i] > 400]
    out = []
    for i in big:
        m = lab == i
        near = ndimage.binary_dilation(m, iterations=2)
        for j in range(1, n + 1):
            if j not in big and sz[j - 1] >= 12 and (near & (lab == j)).any(): m |= lab == j
        xs = np.nonzero(m.any(0))[0]; out.append((xs.mean(), m))
    out.sort(key=lambda t: t[0])
    return sub, [m for _, m in out]


def cut_all(im, box):
    """Như E.cut_panel nhưng không lọc thành phần (ô có nhiều người)."""
    x, y, w, h = box
    sub = im[y + 4:y + h - 4, x + 4:x + w - 4]
    qc = (sub // 6).reshape(-1, 3); k = qc[:, 0] * 10000 + qc[:, 1] * 100 + qc[:, 2]
    keys, cnt = np.unique(k, return_counts=True); pbg = np.median(sub.reshape(-1, 3)[k == keys[np.argmax(cnt)]], axis=0)
    bgc = np.abs(sub - pbg).sum(2) < 30
    cols = np.nonzero(bgc.mean(0) > 0.45)[0]; rows = np.nonzero(bgc.mean(1) > 0.45)[0]
    sub, bgc = sub[rows[0] + 1:rows[-1], cols[0] + 1:cols[-1]], bgc[rows[0] + 1:rows[-1], cols[0] + 1:cols[-1]]
    lab, n = ndimage.label(bgc)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fg = ~np.isin(lab, list(edge))
    return sub, ndimage.binary_opening(fg, iterations=1), 0


def drop_bubble(sub, fg):
    """Bong bóng thoại "…" dính sát tóc ở góc trên phải: lấy hộp các điểm sáng ở góc đó, nới viền, xoá khỏi nhân vật."""
    H, W = fg.shape; reg = np.zeros_like(fg); reg[:int(H * 0.35), int(W * 0.6):] = True
    light = reg & fg & (sub.min(2) > 185)
    if light.sum() < 10: return fg
    ys, xs = np.nonzero(light); fg = fg.copy()
    fg[max(0, ys.min() - 4):ys.max() + 5, max(0, xs.min() - 4):] = False
    lab, n = ndimage.label(fg)
    if n > 1: sz = ndimage.sum(fg, lab, range(1, n + 1)); fg = lab == int(np.argmax(sz)) + 1
    return fg


def native(sub, fg):
    return E.quantize(E.trim(E.downscale(sub, fg, B)))


def main():
    im = E.load('tileset_mau'); sbg = np.median(im[:10, :10].reshape(-1, 3), axis=0)
    os.makedirs(OUT, exist_ok=True); os.makedirs(E.CHECK, exist_ok=True)
    chk = Image.fromarray(im.astype(np.uint8)); d = ImageDraw.Draw(chk); no = [0]
    def mark(x, y, w, h, col=(255, 60, 60)):
        no[0] += 1; d.rectangle([x, y, x + w - 1, y + h - 1], outline=col, width=2); d.rectangle([x + 1, y + 1, x + 18, y + 13], fill=col); d.text((x + 4, y + 2), str(no[0]), fill=(255, 255, 255))
    items, report = [], []                                              # (tên frame, ảnh RGBA, nhóm, nguồn)
    # 1) 12 ô nhỏ: hoạt ảnh thêm của nhân vật chính (bỏ bong bóng thoại, xuất bong bóng riêng 1 lần)
    for char, y in SMALL_ROWS:
        for c, x in enumerate(SMALL_COLS):
            box = (x, y, 83, 94); mark(*box)
            act, dr = SMALL_ACT[c]
            sub, fg, removed = E.cut_panel(im, box, sbg)
            if act == 'noichuyen': fg = drop_bubble(sub, fg)
            items.append((f'{char}_{act}_{dr}_{c % 3 + 1}', native(sub, fg), 'nhanvat', f'tileset#{no[0]}'))
            if char == 'nusinh' and c == 3:                             # bong bóng "…" = thành phần lớn thứ hai trong ô
                s2, f2, _ = cut_all(im, box); lab, n = ndimage.label(f2); sz = ndimage.sum(f2, lab, range(1, n + 1))
                order = np.argsort(sz)[::-1]
                if n > 1: items.append(('ui_bongbongthoai_1', native(s2, lab == order[1] + 1), 'ui', f'tileset#{no[0]}'))
    # 2) ô NPC: tách từng người
    cnt = {}
    for box, names in NPC:
        mark(*box, (60, 160, 255))
        sub, ms = people(im, sbg, box)
        if len(ms) != len(names): report.append(f'ô NPC {box}: tách được {len(ms)} người (cần {len(names)})')
        for nm, m in zip(names, ms):
            cnt[nm] = cnt.get(nm, 0) + 1
            items.append((f'{nm}_dungim_down_{cnt[nm]}', native(sub, m), 'npc', f'tileset#{no[0]}'))
    # 3) đồ vật / công trình trên nền tối
    for nm, box in PROPS:
        mark(*box, (90, 220, 120))
        sub, m = cut_free(im, sbg, box)
        items.append((nm, native(sub, m), 'congtrinh', f'tileset#{no[0]}'))
    # 4) cảnh cổng trường: xuất nguyên ô (có nền), thu về lưới gốc
    x, y, w, h = SCENE; mark(*SCENE, (255, 200, 60))
    sc = im[y + 5:y + h - 5, x + 5:x + w - 5]
    scene = E.downscale(sc, np.ones(sc.shape[:2], bool), B)
    Image.fromarray(scene, 'RGBA').save(os.path.join(OUT, 'canh_congtruong.png'))
    chk.save(os.path.join(E.CHECK, 'tileset_mau_check.webp'), quality=82)
    # xuất PNG từng mục: nhân vật/NPC neo chân giữa đáy trong ô chung; công trình giữ nguyên kích thước
    chars = [it for it in items if it[2] in ('nhanvat', 'npc')]
    cw = E.cell_w([a for _, a, _, _ in chars]); ch = max(a.shape[0] for _, a, _, _ in chars) + 1
    atlas = {'frames': {}, 'animations': {}, 'meta': {'image': 'tainguyen.png', 'scale': 1, 'note': 'Ảnh "Tài nguyên game": khối điểm ảnh 3 px, nhân vật nhỏ hơn sheet nhân vật (≈ nửa chiều cao). Nhân vật/NPC: ô chung, neo chân giữa đáy. Công trình: giữ kích thước, neo giữa đáy.', 'cell': {'w': cw, 'h': ch}}}
    placed = []
    for nm, a, grp, src in items:
        img = E.place(a, cw, ch) if grp in ('nhanvat', 'npc') else a
        Image.fromarray(img, 'RGBA').save(os.path.join(OUT, nm + '.png')); placed.append((nm, img, grp, src, a.shape))
        if grp in ('nhanvat', 'npc'):
            key = '_'.join(nm.split('_')[:3]); atlas['animations'].setdefault(key, []).append(nm)
    # đóng gói: xếp hàng theo chiều cao (kệ), rộng tối đa 512
    placed.sort(key=lambda t: -t[1].shape[0]); W = 512; xx = yy = rowh = 0; pos = []
    for p in placed:
        h, w = p[1].shape[:2]
        if xx + w > W: xx, yy, rowh = 0, yy + rowh + 1, 0
        pos.append((xx, yy)); xx += w + 1; rowh = max(rowh, h)
    H = yy + rowh; sheet = np.zeros((H, W, 4), np.uint8)
    for (nm, img, grp, src, shp), (px, py) in zip(placed, pos):
        h, w = img.shape[:2]; sheet[py:py + h, px:px + w] = img
        atlas['frames'][nm] = {'frame': {'x': px, 'y': py, 'w': w, 'h': h}, 'rotated': False, 'trimmed': False, 'sourceSize': {'w': w, 'h': h}, 'anchor': {'x': 0.5, 'y': 1.0}, 'group': grp, 'source': src}
    atlas['meta']['size'] = {'w': W, 'h': H}
    Image.fromarray(sheet, 'RGBA').save(os.path.join(E.OUT, 'tainguyen.png'))
    json.dump(atlas, open(os.path.join(E.OUT, 'tainguyen.json'), 'w'), ensure_ascii=False, indent=1)
    # contact sheet nền caro ×3
    Z = 3; cs = Image.new('RGBA', (W * Z, H * Z)); cs.paste(Image.fromarray(E.checker(W, H, 2)).resize((W * Z, H * Z), Image.NEAREST))
    big = Image.fromarray(sheet, 'RGBA').resize((W * Z, H * Z), Image.NEAREST); cs.paste(big, (0, 0), big)
    cs.save(os.path.join(E.PREV, 'tainguyen_contact.png'))
    # GIF: đi bộ mặt sau + nói chuyện
    for key, nms in atlas['animations'].items():
        if len(nms) < 2: continue
        fr = []
        for nm in nms:
            a = next(p[1] for p in placed if p[0] == nm); bg = E.checker(cw, ch, 2); al = a[:, :, 3:] / 255.0
            fr.append(Image.fromarray((a[:, :, :3] * al + bg[:, :, :3] * (1 - al)).astype(np.uint8)).resize((cw * 5, ch * 5), Image.NEAREST))
        fr[0].save(os.path.join(E.PREV, f'tainguyen_{key}.gif'), save_all=True, append_images=fr[1:], duration=320, loop=0)
    idx_p = os.path.join(E.ROOT, 'assets', 'index.json'); idx = json.load(open(idx_p))
    idx['tainguyen'] = {'title': 'Tài nguyên game (nhân vật nhỏ, NPC, công trình, cảnh cổng trường)', 'sheet': 'sprites/tainguyen.png', 'atlas': 'sprites/tainguyen.json', 'scene': 'sprites/tainguyen/canh_congtruong.png', 'frames': len(items)}
    json.dump(idx, open(idx_p, 'w'), ensure_ascii=False, indent=1)
    rp = os.path.join(E.ROOT, 'assets', 'extract_report.txt'); old = [l for l in open(rp).read().splitlines(True) if not l.startswith(('tileset_mau', 'ô NPC'))] if os.path.exists(rp) else []
    open(rp, 'w').write(''.join(old) + 'tileset_mau: khối điểm ảnh ≈ 3 px; ' + f'{len(items)} mục + cảnh cổng trường {scene.shape[1]}×{scene.shape[0]}\n' + ''.join(r + '\n' for r in report))
    print('\n'.join(report)); print('tainguyen', len(items), 'mục · cell', cw, ch, '· sheet', W, H, '· cảnh', scene.shape[:2])


if __name__ == '__main__':
    main()
