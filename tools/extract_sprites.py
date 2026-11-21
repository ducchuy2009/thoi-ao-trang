#!/usr/bin/env python3
"""Tách sprite từ ảnh sprite sheet nhân vật (ảnh AI 1024×765, mỗi ảnh 5 cột × 2 hàng ô) vào assets/.

Quy trình (theo skill sprite-sheet-extract):
  1. Dò từng ô (vùng chữ nhật bo góc khác màu nền) bằng connected components → ảnh kiểm tra assets/check/<sheet>_check.png
  2. Cắt ô, xoá nền ô bằng flood fill từ các cạnh (dung sai nhỏ)
  3. Bỏ chữ / hiệu ứng rời (lấp lánh, nốt nhạc, mây): giữ thành phần liên thông lớn nhất + mảnh dính sát thân (đồ cầm tay, cặp)
  4. Ước lượng kích thước khối điểm ảnh thật (lưới phóng của ảnh AI), thu về lưới gốc bằng nearest (lấy màu giữa khối)
  5. Đặt mọi frame vào ô cùng kích thước, neo chân giữa đáy
  6. Xuất PNG từng frame (nhanvat_hanhdong_huong_so.png), spritesheet đóng gói + atlas JSON, contact sheet nền caro, GIF xem thử
Ảnh gốc giữ nguyên trong assets/source/. Chạy: python3 tools/extract_sprites.py  (cần Pillow, numpy, scipy)
"""
import json, os
from collections import deque
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets', 'source')
OUT = os.path.join(ROOT, 'assets', 'sprites')
CHECK = os.path.join(ROOT, 'assets', 'check')
PREV = os.path.join(ROOT, 'assets', 'preview')

# sheet → [(tên nhân vật, hướng, [hành động 5 ô])] cho hàng trên, hàng dưới; 'down' = mặt trước, 'up' = mặt sau
# nhãn hành động lấy theo chữ dưới từng ô của ảnh gốc
SHEETS = {
    'main_a': [('nusinh', 'down', ['dungim', 'dungim', 'dibo', 'dibo', 'vuive']), ('namsinh', 'down', ['dungim', 'dungim', 'dibo', 'dibo', 'vaychao'])],
    'main_b': [('nusinh', ['down', 'down', 'down', 'up', 'up'], ['dungim', 'dibo', 'vuive', 'dibo', 'vuive']), ('namsinh', ['down', 'down', 'down', 'up', 'up'], ['dungim', 'dibo', 'vaychao', 'dibo', 'vaychao'])],
    'vy': [('hoakhoi', 'down', ['dungim', 'dibo', 'duyendang', 'dibo', 'duyendang']), ('hoakhoi', 'up', ['dungim', 'dibo', 'duyendang', 'duyendang', 'duyendang'])],
    'quang': [('hocba', 'down', ['dungim', 'dibo', 'hocba', 'dungim', 'dibo']), ('hocba', 'up', ['dungim', 'dibo', 'giotay', 'dibo', 'giotay'])],
    'hoang': [('daugau', 'down', ['dungim', 'dibo', 'gaysu', 'dungim', 'gaysu']), ('daugau', 'up', ['dungim', 'dibo', 'gaysu', 'gaysu', 'gaysu'])],
    'phong': [('hamchoi', 'down', ['dungim', 'dibo', 'hamchoi', 'dungim', 'dibo']), ('hamchoi', 'up', ['dungim', 'dibo', 'hamchoi', 'gaysu', 'gaysu'])],
    'ngan': [('thethao', 'down', ['dungim', 'dibo', 'thethao', 'dungim', 'dibo']), ('thethao', 'up', ['dungim', 'dibo', 'thethao', 'dibo', 'thethao'])],
    'hien': [('truyenthong', 'down', ['dungim', 'dibo', 'dibo', 'eap', 'eap']), ('truyenthong', 'up', ['dungim', 'dibo', 'dibo', 'eap', 'eap'])],
    'dat': [('lanhloi', 'down', ['dungim', 'dibo', 'lanhloi', 'dungim', 'lanhloi']), ('lanhloi', 'up', ['dungim', 'dibo', 'lanhloi', 'dibo', 'lanhloi'])],
    'hoa': [('khoahoc', 'down', ['dungim', 'dibo', 'nghiencuu', 'dibo', 'nghiencuu']), ('khoahoc', 'up', ['dungim', 'dibo', 'dibo', 'nghiencuu', 'nghiencuu'])],
    'minhanh': [('yeuve', 'down', ['dungim', 'dibo', 'yeuve', 'sangtac', 'vuive']), ('yeuve', 'up', ['dungim', 'dibo', 'yeuve', 'sangtac', 'vuive'])],
    'thao': [('mongmo', 'down', ['dungim', 'dibo', 'mongmo', 'baybong', 'vuive']), ('mongmo', 'up', ['dungim', 'dibo', 'mongmo', 'baybong', 'vuive'])],
    'namanh': [('daigia', 'down', ['dungim', 'dibo', 'daigia', 'sangchanh', 'vuive']), ('daigia', 'up', ['dungim', 'dibo', 'daigia', 'sangchanh', 'vuive'])],
    'vu': [('metieuthuyet', 'down', ['dungim', 'dibo', 'sayme', 'momong', 'vuive']), ('metieuthuyet', 'up', ['dungim', 'dibo', 'sayme', 'momong', 'vuive'])],
    'duc': [('vamvo', 'down', ['dungim', 'dibo', 'nghiemtuc', 'manhme', 'quyettam']), ('vamvo', 'up', ['dungim', 'dibo', 'nghiemtuc', 'manhme', 'quyettam'])],
    'duyen': [('haudau', 'down', ['dungim', 'dibo', 'haudau', 'ngocnghech', 'vuive']), ('haudau', 'up', ['dungim', 'dibo', 'haudau', 'ngocnghech', 'vuive'])],
    'phuong': [('lambao', 'down', ['dungim', 'dibo', 'chupanh', 'ghichep', 'vuive']), ('lambao', 'up', ['dungim', 'dibo', 'chupanh', 'ghichep', 'vuive'])],
    'thai': [('idol', 'down', ['dungim', 'dibo', 'bieudien', 'giaoluu', 'chayhetminh']), ('idol', 'up', ['dungim', 'dibo', 'bieudien', 'giaoluu', 'chayhetminh'])],
}
TITLES = {'nusinh': 'Nữ sinh (nhân vật chính)', 'namsinh': 'Nam sinh (nhân vật chính)', 'hoakhoi': 'Hoa khôi trường — Vy', 'hocba': 'Nam sinh học bá — Quang', 'daugau': 'Nam sinh đầu gấu — Hoàng',
          'hamchoi': 'Nam sinh ham chơi — anh Phong', 'thethao': 'Nữ sinh thể thao — Ngân', 'truyenthong': 'Nữ sinh truyền thống — Hiền', 'lanhloi': 'Nam sinh lanh lợi — Đạt', 'khoahoc': 'Nữ sinh khoa học — Hoa',
          'yeuve': 'Nữ sinh yêu vẽ — Minh Anh', 'mongmo': 'Nữ sinh mộng mơ — Thảo', 'daigia': 'Nam sinh đại gia — Nam Anh', 'metieuthuyet': 'Nam sinh mê tiểu thuyết — Vũ', 'vamvo': 'Nam sinh vạm vỡ — Đức',
          'haudau': 'Nữ sinh hậu đậu — Duyên', 'lambao': 'Nữ sinh làm báo — Phương', 'idol': 'Nam sinh idol — Thái'}

# Hiệu ứng vẽ dính sát người (mây, bong bóng, lấp lánh, nốt nhạc, chữ, bụi) không tách được bằng thành phần liên thông
# → xoá tay theo hộp (x0, y0, x1, y1) trên ảnh đã thu về lưới gốc (trước khi cắt viền); tuỳ chọn chỉ xoá điểm cùng loại màu
ERASE = {
    'thao#1': [(33, 0, 42, 7)], 'thao#2': [(31, 0, 41, 8), (0, 12, 8, 18)], 'thao#3': [(32, 0, 41, 11), (0, 30, 8, 37), (0, 28, 11, 39, 'light'), (31, 34, 41, 40)], 'thao#5': [(33, 10, 41, 18)],
    'vu#3': [(35, 0, 42, 10), (31, 0, 33, 3), (34, 0, 35, 7), (0, 10, 7, 17), (5, 35, 9, 41)], 'vu#4': [(34, 1, 41, 7)], 'vu#8': [(35, 0, 41, 9), (34, 0, 35, 7)],
    'thai#3': [(0, 11, 6, 20), (36, 10, 41, 19), (31, 35, 41, 42), (28, 35, 31, 42, 'warm')], 'thai#4': [(0, 19, 10, 41), (34, 7, 41, 18)], 'thai#5': [(2, 27, 8, 35)],
    'namanh#1': [(33, 30, 40, 41), (28, 26, 41, 42, 'yellow'), (7, 34, 15, 41, 'yellow')], 'namanh#5': [(35, 12, 41, 19)],
    'hoa#5': [(34, 1, 41, 9), (35, 10, 39, 14)], 'hoang#3': [(36, 0, 42, 8), (0, 42, 42, 50, 'dust')], 'duyen#4': [(5, 2, 15, 11, 'blue')],
}
PRED = {
    'warm': lambda c: (c[..., 0] > 170) & (c[..., 0] - c[..., 2] > 50),
    'yellow': lambda c: (c[..., 0] > 190) & (c[..., 1] > 170) & (c[..., 2] < 170),
    'dust': lambda c: (c.sum(-1) > 250) & (c.min(-1) < 200) & (c[..., 0] >= c[..., 1]) & (c[..., 1] >= c[..., 2]) & (c[..., 0] - c[..., 2] > 25),
    'light': lambda c: c.min(-1) > 170,
    'blue': lambda c: (c[..., 2] > c[..., 0] + 30) & (c[..., 2] > 150),
}

def erase_fx(a, boxes):
    a = a.copy()
    for b in boxes:
        x0, y0, x1, y1 = b[:4]; reg = a[y0:y1, x0:x1]
        m = PRED[b[4]](reg[..., :3].astype(int)) if len(b) > 4 else np.ones(reg.shape[:2], bool)
        reg[m] = 0
    lab, n = ndimage.label(a[..., 3] > 0, structure=np.ones((3, 3)))          # bỏ mảnh vụn còn sót ngoài hộp
    if n > 1:
        sz = ndimage.sum(np.ones(lab.shape), lab, range(1, n + 1)); big = int(np.argmax(sz)) + 1
        for i in range(1, n + 1):
            if i != big and sz[i - 1] < 20: a[lab == i] = 0
    return a

def load(name):
    return np.array(Image.open(os.path.join(SRC, name + '.webp')).convert('RGB')).astype(int)

def find_panels(im):
    """Các ô bo góc: thành phần liên thông khác màu nền, cỡ ~180×215."""
    bg = np.median(im[:10, :10].reshape(-1, 3), axis=0)
    m = ndimage.binary_fill_holes(np.abs(im - bg).sum(2) > 20)                     # ô = viền kín → lấp đặc (nhân vật áo tối không cắt đôi ô)
    m = ndimage.binary_opening(m, structure=np.ones((13, 13)))                      # cắt cầu nối mảnh (chữ nhãn, lấp lánh) giữa các ô
    lab, n = ndimage.label(m)
    boxes = []
    for s in ndimage.find_objects(lab):
        x, y, w, h = s[1].start, s[0].start, s[1].stop - s[1].start, s[0].stop - s[0].start
        if 140 < w < 220 and 170 < h < 240: boxes.append((x, y, w, h))
    boxes.sort(key=lambda b: (round(b[1] / 100), b[0]))
    return boxes

def check_image(name, im, boxes):
    os.makedirs(CHECK, exist_ok=True)
    img = Image.fromarray(im.astype(np.uint8)); d = ImageDraw.Draw(img)
    for i, (x, y, w, h) in enumerate(boxes):
        d.rectangle([x, y, x + w - 1, y + h - 1], outline=(255, 60, 60), width=3); d.rectangle([x + 2, y + 2, x + 30, y + 22], fill=(255, 60, 60)); d.text((x + 8, y + 5), str(i + 1), fill=(255, 255, 255))
    img.save(os.path.join(CHECK, name + '_check.webp'), quality=82)                # ảnh kiểm tra: webp cho nhẹ repo

def cut_panel(im, box, sheet_bg):
    """Xoá nền ô bằng flood fill từ các cạnh, bỏ chữ / hiệu ứng rời."""
    x, y, w, h = box
    sub = im[y + 4:y + h - 4, x + 4:x + w - 4]
    # màu nền ô = màu xuất hiện nhiều nhất trong ô (khung dò hơi rộng có thể lẫn dải nền sheet ở mép → coi cả màu nền sheet là nền)
    qc = (sub // 6).reshape(-1, 3); keys, cnt = np.unique(qc[:, 0] * 10000 + qc[:, 1] * 100 + qc[:, 2], return_counts=True)
    top = keys[np.argmax(cnt)]; pbg = np.median(sub.reshape(-1, 3)[(qc[:, 0] * 10000 + qc[:, 1] * 100 + qc[:, 2]) == top], axis=0)
    bgc = np.abs(sub - pbg).sum(2) < 30
    # khung dò rộng hơn ô thật (mảnh lấp lánh dính mép) → co về các hàng/cột có nhiều màu nền ô
    cols = np.nonzero(bgc.mean(0) > 0.45)[0]; rows = np.nonzero(bgc.mean(1) > 0.45)[0]
    sub, bgc = sub[rows[0] + 1:rows[-1], cols[0] + 1:cols[-1]], bgc[rows[0] + 1:rows[-1], cols[0] + 1:cols[-1]]
    H, W, _ = sub.shape
    seen = np.zeros((H, W), bool); q = deque()
    for i in range(W):
        for j in (0, H - 1):
            if bgc[j, i] and not seen[j, i]: seen[j, i] = True; q.append((j, i))
    for j in range(H):
        for i in (0, W - 1):
            if bgc[j, i] and not seen[j, i]: seen[j, i] = True; q.append((j, i))
    while q:
        j, i = q.popleft()
        for dj, di in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nj, ni = j + dj, i + di
            if 0 <= nj < H and 0 <= ni < W and not seen[nj, ni] and bgc[nj, ni]: seen[nj, ni] = True; q.append((nj, ni))
    fg = ~seen
    fg = ndimage.binary_opening(fg, iterations=1)                                   # bỏ hạt nhiễu 1–2 điểm
    lab, n = ndimage.label(fg)
    removed = 0
    if n > 1:
        sizes = ndimage.sum(fg, lab, range(1, n + 1)); main = int(np.argmax(sizes)) + 1
        keep = lab == main; ys, xs = np.where(keep); by0, by1, bx0, bx1 = ys.min(), ys.max(), xs.min(), xs.max()
        near = ndimage.binary_dilation(keep, iterations=1)                     # chỉ giữ mảnh dính sát thân (đồ cầm tay), bỏ lấp lánh / chữ / nốt nhạc
        for i in range(1, n + 1):
            if i == main: continue
            yy, xx = np.where(lab == i)
            if sizes[i - 1] >= 30 and (near & (lab == i)).any() and by0 <= yy.mean() <= by1 and bx0 <= xx.mean() <= bx1: keep |= lab == i
            else: removed += 1
        fg = keep
    return sub, fg, removed

def grid_fit(sub, fg, b):
    """Pha lưới (x, y) khớp nhất với các cạnh đổi màu, với kích thước khối b."""
    d = np.abs(np.diff(sub, axis=1)).sum(2) > 60; d &= fg[:, 1:] | fg[:, :-1]
    e = np.abs(np.diff(sub, axis=0)).sum(2) > 60; e &= fg[1:] | fg[:-1]
    ix = np.nonzero(d)[1] + 1; iy = np.nonzero(e)[0] + 1
    def best(idx):
        sc = []
        for ph in np.arange(0, b, 0.25):
            r = ((idx - ph) / b) % 1.0; sc.append((np.mean(np.minimum(r, 1 - r) < 0.2), ph))
        return max(sc)
    return best(ix), best(iy)

def block_size(samples):
    """Kích thước khối điểm ảnh của cả sheet: thử 3.0–8.0, chọn khớp cạnh tốt nhất."""
    res = []
    for b in np.arange(3.0, 8.01, 0.05):
        s = 0
        for sub, fg in samples: (sx, _), (sy, _) = grid_fit(sub, fg, b); s += sx + sy
        res.append((s / len(samples), round(float(b), 2)))
    res.sort(reverse=True)
    return res[0][1], res[0][0]

def downscale(sub, fg, b):
    """Thu về lưới gốc: mỗi khối lấy màu trung vị vùng giữa khối, độ trong suốt theo đa số."""
    (_, px), (_, py) = grid_fit(sub, fg, b)
    H, W, _ = sub.shape
    nx, ny = int((W - px) // b), int((H - py) // b)
    out = np.zeros((ny, nx, 4), np.uint8)
    for j in range(ny):
        for i in range(nx):
            x0, y0 = px + i * b, py + j * b
            cx0, cx1, cy0, cy1 = int(x0 + b * 0.3), int(x0 + b * 0.7) + 1, int(y0 + b * 0.3), int(y0 + b * 0.7) + 1
            blk = fg[int(y0):int(y0 + b), int(x0):int(x0 + b)]
            if blk.size == 0 or blk.mean() < 0.5: continue
            c = sub[cy0:cy1, cx0:cx1].reshape(-1, 3); m = fg[cy0:cy1, cx0:cx1].reshape(-1)
            c = c[m] if m.any() else c
            out[j, i, :3] = np.median(c, axis=0); out[j, i, 3] = 255
    return out

def trim(a):
    ys, xs = np.where(a[:, :, 3] > 0)
    return a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]

def quantize(a, colors=40):
    """Gom màu nhiễu do nén ảnh (giữ nguyên độ trong suốt)."""
    img = Image.fromarray(a, 'RGBA'); rgb = img.convert('RGB'); al = np.array(img)[:, :, 3]
    q = rgb.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
    out = np.dstack([np.array(q), al]); out[al == 0] = 0
    return out

def feet_x(a):
    """Hoành độ giữa hai bàn chân: điểm giữa các cột có điểm ảnh ở 4 hàng dưới cùng."""
    xs = np.nonzero((a[-4:, :, 3] > 0).any(0))[0]
    return int(round((xs.min() + xs.max()) / 2)) if len(xs) else a.shape[1] // 2

def cell_w(arrs):
    """Bề rộng ô đủ chứa mọi frame khi đặt giữa hai bàn chân vào giữa ô."""
    return max(2 * max(feet_x(a) + 1, a.shape[1] - feet_x(a)) for a in arrs) + 2

def place(a, cw, ch):
    """Đặt frame vào ô: giữa hai bàn chân ở giữa ô, chân chạm đáy → đổi frame không trượt ngang / nhảy dọc."""
    c = np.zeros((ch, cw, 4), np.uint8); h, w = a.shape[:2]
    x0 = cw // 2 - feet_x(a); c[ch - h:ch, x0:x0 + w] = a
    return c

def checker(w, h, s=4):
    yy, xx = np.mgrid[0:h, 0:w]; c = ((yy // s + xx // s) % 2).astype(np.uint8)
    return np.dstack([np.where(c, 205, 235)] * 3 + [np.full((h, w), 255)]).astype(np.uint8)

def main():
    frames = {}                                                        # nhân vật → [(hành động, hướng, ảnh, nguồn)]
    report = []
    for sheet, rows in SHEETS.items():
        im = load(sheet); boxes = find_panels(im); check_image(sheet, im, boxes)
        if len(boxes) != 10: report.append(f'{sheet}: dò được {len(boxes)} ô (cần 10) — bỏ qua'); continue
        sbg = np.median(im[:10, :10].reshape(-1, 3), axis=0); cuts = [cut_panel(im, bx, sbg) for bx in boxes]
        b, fit = block_size([(s, f) for s, f, _ in cuts[:4]])
        report.append(f'{sheet}: khối điểm ảnh ≈ {b} px (khớp lưới {fit:.2f}/2)')
        for k, (sub, fg, removed) in enumerate(cuts):
            r, c = divmod(k, 5); char, dirs, acts = rows[r]
            d = dirs[c] if isinstance(dirs, list) else dirs
            a = downscale(sub, fg, b)
            if f'{sheet}#{k + 1}' in ERASE: a = erase_fx(a, ERASE[f'{sheet}#{k + 1}']); report.append(f'{sheet}#{k + 1}: xoá tay hiệu ứng dính người')
            a = quantize(trim(a))
            frames.setdefault(char, []).append((acts[c], d, a, f'{sheet}#{k + 1}', removed))
    # bỏ frame trùng (sheet "mặt trước & mặt sau" lặp lại các ô của sheet "sprite animation")
    for char, lst in frames.items():
        uniq = []
        for f in lst:
            dup = next((u for u in uniq if u[2].shape == f[2].shape and np.abs(u[2].astype(int) - f[2].astype(int)).mean() < 6), None)
            if dup: report.append(f'{char}: {f[3]} trùng {dup[3]} — bỏ'); continue
            uniq.append(f)
        frames[char] = uniq
    cw = cell_w([f[2] for lst in frames.values() for f in lst])
    ch = max(f[2].shape[0] for lst in frames.values() for f in lst) + 1
    os.makedirs(OUT, exist_ok=True); os.makedirs(PREV, exist_ok=True)
    index = {'cell': [cw, ch], 'anchor': 'bottom-center (giữa hai bàn chân)', 'characters': {}}
    for char, lst in frames.items():
        d = os.path.join(OUT, char); os.makedirs(d, exist_ok=True)
        cnt, names, anims = {}, [], {}
        for act, dr, a, src, removed in lst:
            key = f'{act}_{dr}'; cnt[key] = cnt.get(key, 0) + 1
            nm = f'{char}_{act}_{dr}_{cnt[key]}'; names.append((nm, a, src, removed)); anims.setdefault(key, []).append(nm)
            Image.fromarray(place(a, cw, ch), 'RGBA').save(os.path.join(d, nm + '.png'))
        # spritesheet đóng gói (mỗi hàng 8 ô) + atlas JSON (kiểu JSON Hash: frame, sourceSize, anchor; thêm animations)
        cols = min(8, len(names)); rws = (len(names) + cols - 1) // cols
        sh = np.zeros((rws * ch, cols * cw, 4), np.uint8); atlas = {'frames': {}, 'animations': anims,
            'meta': {'image': f'{char}.png', 'size': {'w': cols * cw, 'h': rws * ch}, 'cell': {'w': cw, 'h': ch}, 'anchor': {'x': 0.5, 'y': 1.0}, 'scale': 1, 'title': TITLES.get(char, char), 'note': 'down = mặt trước, up = mặt sau; frame neo chân giữa đáy ô'}}
        for i, (nm, a, src, removed) in enumerate(names):
            r, c = divmod(i, cols); sh[r * ch:(r + 1) * ch, c * cw:(c + 1) * cw] = place(a, cw, ch)
            h, w = a.shape[:2]
            atlas['frames'][nm] = {'frame': {'x': c * cw, 'y': r * ch, 'w': cw, 'h': ch}, 'rotated': False, 'trimmed': False, 'spriteSourceSize': {'x': cw // 2 - feet_x(a), 'y': ch - h, 'w': w, 'h': h}, 'sourceSize': {'w': cw, 'h': ch}, 'anchor': {'x': 0.5, 'y': 1.0}, 'source': src}
        Image.fromarray(sh, 'RGBA').save(os.path.join(OUT, char + '.png'))
        json.dump(atlas, open(os.path.join(OUT, char + '.json'), 'w'), ensure_ascii=False, indent=1)
        index['characters'][char] = {'title': TITLES.get(char, char), 'sheet': f'sprites/{char}.png', 'atlas': f'sprites/{char}.json', 'frames': len(names), 'animations': {k: len(v) for k, v in anims.items()}}
        # GIF xem thử từng hành động (phóng ×4 nearest, nền caro)
        for key, nms in anims.items():
            imgs = []
            for nm in nms:
                a = place(next(x[1] for x in names if x[0] == nm), cw, ch); bg = checker(cw, ch, 2); al = a[:, :, 3:] / 255.0
                comp = (a[:, :, :3] * al + bg[:, :, :3] * (1 - al)).astype(np.uint8)
                imgs.append(Image.fromarray(comp).resize((cw * 4, ch * 4), Image.NEAREST))
            imgs[0].save(os.path.join(PREV, f'{char}_{key}.gif'), save_all=True, append_images=imgs[1:] or [imgs[0]], duration=320, loop=0)
    json.dump(index, open(os.path.join(ROOT, 'assets', 'index.json'), 'w'), ensure_ascii=False, indent=1)
    # contact sheet: mọi frame của mọi nhân vật trên nền caro, phóng ×3
    Z = 3; maxn = max(len(v) for v in frames.values()); chars = list(frames)
    cs = Image.new('RGBA', (maxn * cw * Z, len(chars) * ch * Z))
    for r, char in enumerate(chars):
        for c in range(maxn):
            cs.paste(Image.fromarray(checker(cw, ch, 2)).resize((cw * Z, ch * Z), Image.NEAREST), (c * cw * Z, r * ch * Z))
        for c, f in enumerate(sorted(os.listdir(os.path.join(OUT, char)))):
            fr = Image.open(os.path.join(OUT, char, f)).resize((cw * Z, ch * Z), Image.NEAREST); cs.paste(fr, (c * cw * Z, r * ch * Z), fr)
    cs.save(os.path.join(PREV, 'contact_sheet.png'))
    open(os.path.join(ROOT, 'assets', 'extract_report.txt'), 'w').write('\n'.join(report) + '\n')
    print('\n'.join(report)); print('cell', cw, ch, '· nhân vật', len(frames), '· frame', sum(len(v) for v in frames.values()))

if __name__ == '__main__':
    main()
