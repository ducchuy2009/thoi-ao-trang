#!/usr/bin/env python3
"""Cắt ảnh thiết kế nhân vật (art/chars/*.webp, mỗi ảnh 5 cột × 2 hàng ô) thành sprite sheet cho game.

Mỗi nhân vật 8 khung, độ phân giải gấp đôi điểm ảnh bản đồ (canvas W×H, vẽ ra W/2×H/2 trên bản đồ):
  0–2: nhìn xuống (đứng, bước chân trái, bước chân phải) · 3–5: nhìn lên (quay lưng) · 6–7: đi sang phải (lật lại thành sang trái)
Khung bước chân tự tạo bằng cách nhấc một bên chân lên; khung sang phải lấy từ ô "đi bộ" (dáng 3/4 quay phải).
Ghi ra src/02c_sprites.js (ảnh PNG nhúng base64). Chạy: python3 tools/make_sprites.py && python3 build.py
Cần Pillow, numpy, scipy.
"""
import base64, io, os
import numpy as np
from collections import deque
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'art', 'chars')
OUT = os.path.join(ROOT, 'src', '02c_sprites.js')
COLS = [(26, 203), (225, 402), (424, 600), (623, 799), (821, 998)]       # các ô trong ảnh 1024×765
ROWS = [(178, 389), (495, 709)]
W, H = 56, 62                                                             # canvas mỗi khung (gấp đôi)
TARGET = 52                                                               # chiều cao dáng đứng (điểm ảnh canvas)
CLOUDS = {'thao'}                                                         # ảnh có mây trang trí dính vào tóc
TALL = {'hoang': 1.06, 'phong': 1.05, 'ngan': 1.04}                      # anh chị khoá trên cao hơn một chút

# nhân vật: (file, ô đứng nhìn xuống, ô quay lưng, ô đi sang phải 1, ô đi sang phải 2 hoặc None) — ô ghi 'hàng cột'
CHARS = {
    'boy': ('main_a', '10', ('main_b', '13'), '12', '13'),
    'girl': ('main_a', '00', ('main_b', '03'), '02', '03'),
    'vy': ('vy', '00', '10', '01', '03'),
    'quang': ('quang', '00', '10', '01', '04'),
    'hoang': ('hoang', '00', '10', '01', None),
    'phong': ('phong', '00', '10', '01', None),
    'ngan': ('ngan', '00', '10', '01', None),
    'hien': ('hien', '00', '10', '01', '02'),
    'dat': ('dat', '00', '10', '01', None),
    'hoa': ('hoa', '00', '10', '01', None),
    'minhanh': ('minhanh', '00', '10', '01', None),
    'thao': ('thao', '00', '10', '01', None),
    'namanh': ('namanh', '00', '10', '01', None),
    'vu': ('vu', '00', '10', '01', None),
    'duc': ('duc', '00', '10', '01', None),
    'duyen': ('duyen', '00', '10', '01', None),
    'phuong': ('phuong', '00', '10', '01', None),
    'thai': ('thai', '00', '10', '01', None),
}

_cache = {}
def sheet(name):
    if name not in _cache:
        _cache[name] = np.array(Image.open(os.path.join(SRC, name + '.webp')).convert('RGB')).astype(int)
    return _cache[name]

def cell(name, rc):
    """Cắt một ô, bỏ nền ô (loang từ mép) và các vệt trang trí nhỏ (dấu góc ô, lấp lánh)."""
    r, c = int(rc[0]), int(rc[1])
    (y0, y1), (x0, x1) = ROWS[r], COLS[c]
    sub = sheet(name)[y0 + 3:y1 - 3, x0 + 3:x1 - 3]
    h, w, _ = sub.shape
    edge = np.concatenate([sub[2:6].reshape(-1, 3), sub[-6:-2].reshape(-1, 3), sub[:, 2:6].reshape(-1, 3), sub[:, -6:-2].reshape(-1, 3)])
    bgc = np.abs(sub - np.median(edge, axis=0)).sum(2) < 34
    seen = np.zeros((h, w), bool); q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if bgc[y, x] and not seen[y, x]: seen[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if bgc[y, x] and not seen[y, x]: seen[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not seen[ny, nx] and bgc[ny, nx]:
                seen[ny, nx] = True; q.append((ny, nx))
    fg = ~seen
    if name in CLOUDS:                                                  # mây trang trí dính vào tóc: xoá vùng sáng ngả xanh ở nửa trên ô
        r_, g_, b_ = sub[:, :, 0], sub[:, :, 1], sub[:, :, 2]
        blu = fg & (b_ - r_ > 20) & (b_ > 170)
        lab2, n2 = ndimage.label(blu)
        for i in range(1, n2 + 1):
            yy, xx = np.where(lab2 == i)
            if len(yy) < 40 or yy.mean() > h * 0.4: continue
            y_0, y_1, x_0, x_1 = max(0, yy.min() - 4), yy.max() + 5, max(0, xx.min() - 4), xx.max() + 5
            box = fg[y_0:y_1, x_0:x_1]; light = sub[y_0:y_1, x_0:x_1].min(2) > 150
            box[light] = False
    lab, n = ndimage.label(fg)
    if n > 1:                                                           # giữ thân nhân vật + mảnh nằm trong khung của nó
        sizes = ndimage.sum(fg, lab, range(1, n + 1)); main = int(np.argmax(sizes)) + 1
        ys, xs = np.where(lab == main); by0, by1, bx0, bx1 = ys.min(), ys.max(), xs.min(), xs.max()
        keep = lab == main
        near = ndimage.binary_dilation(keep, iterations=3)
        for i in range(1, n + 1):                                       # chỉ giữ mảnh dính sát thân (bỏ nốt nhạc, lấp lánh bay quanh)
            if i == main or sizes[i - 1] < 30 or not (near & (lab == i)).any(): continue
            yy, xx = np.where(lab == i)
            if by0 <= yy.mean() <= by1 and bx0 <= xx.mean() <= bx1: keep |= lab == i
        fg = keep
    ys, xs = np.where(fg)
    rgba = np.dstack([sub.astype(np.uint8), np.where(fg, 255, 0).astype(np.uint8)])[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    return Image.fromarray(rgba, 'RGBA')

def shrink(im, k):
    w, h = max(1, round(im.width * k)), max(1, round(im.height * k))
    sm = im.convert('RGBa').resize((w, h), Image.LANCZOS).convert('RGBA')
    a = np.array(sm); a[:, :, 3] = np.where(a[:, :, 3] >= 110, 255, 0)
    return Image.fromarray(a, 'RGBA')

def place(im):
    """Đặt vào canvas W×H, chân chạm đáy, giữa theo chiều ngang."""
    c = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    if im.width > W or im.height > H: im = im.crop((max(0, (im.width - W) // 2), max(0, im.height - H), max(0, (im.width - W) // 2) + min(W, im.width), im.height))
    c.paste(im, ((W - im.width) // 2, H - im.height), im)
    return c

def step(im, side):
    """Khung bước chân: nhấc một bên chân (trái / phải) lên 2 điểm ảnh."""
    a = np.array(im); al = a[:, :, 3] > 0
    ys, xs = np.where(al)
    if not len(ys): return im
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    leg = max(6, int((y1 - y0) * 0.15)); ly0, xm = y1 - leg, (x0 + x1) // 2
    xa, xb = (x0, xm) if side == 'L' else (xm, x1)
    out = a.copy()
    reg = a[ly0:y1, xa:xb].copy()
    out[ly0:y1, xa:xb] = 0
    m = reg[:, :, 3] > 0
    tgt = out[ly0 - 2:y1 - 2, xa:xb]
    tgt[m] = reg[m]
    keep = out[ly0 - 2:ly0, xa:xb]                                      # chỗ trên đầu gối giữ nguyên thân
    src = a[ly0 - 2:ly0, xa:xb]; mm = src[:, :, 3] > 0; keep[mm & (keep[:, :, 3] == 0)] = src[mm & (keep[:, :, 3] == 0)]
    return Image.fromarray(out, 'RGBA')

def frames(key):
    f, fr, bk, r1, r2 = CHARS[key]
    f0 = cell(f, fr); k = TARGET * TALL.get(key, 1) / f0.height        # mỗi nhân vật thu nhỏ theo chiều cao dáng đứng
    F = place(shrink(f0, k))
    B = place(shrink(cell(*bk) if isinstance(bk, tuple) else cell(f, bk), k))
    R1 = place(shrink(cell(f, r1), k))
    R2 = place(shrink(cell(f, r2), k)) if r2 else step(R1, 'R')
    return [F, step(F, 'L'), step(F, 'R'), B, step(B, 'L'), step(B, 'R'), R1, R2]

def main():
    keys = list(CHARS)
    atlas = Image.new('RGBA', (W * 8, H * len(keys)), (0, 0, 0, 0))
    for j, k in enumerate(keys):
        for i, im in enumerate(frames(k)): atlas.paste(im, (i * W, j * H), im)
    buf = io.BytesIO(); atlas.save(buf, 'PNG', optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode()
    atlas.save(os.path.join(ROOT, 'art', 'sprites_preview.png'))
    js = ("'use strict';\n/* ============================================================\n"
          " *  02c. SPRITE NHÂN VẬT VẼ TỪ ẢNH THIẾT KẾ (art/chars) — tạo bằng tools/make_sprites.py, đừng sửa tay\n"
          " *  Mỗi hàng một nhân vật, 8 khung " + f"{W}×{H}" + " (gấp đôi điểm ảnh bản đồ): xuống ×3, lên ×3, sang phải ×2\n"
          " * ============================================================ */\n"
          f"const ATLAS_W = {W}, ATLAS_H = {H};\n"
          f"const ATLAS_KEYS = {keys!r};\n".replace("'", "'")
          + f"const ATLAS_SRC = 'data:image/png;base64,{b64}';\n")
    open(OUT, 'w').write(js)
    print('atlas', atlas.size, 'png', len(buf.getvalue()) // 1024, 'KB')

if __name__ == '__main__':
    main()
