#!/usr/bin/env python3
"""Sinh src/02e_avatars.js: avatar (đầu + vai) cắt từ sprite đã tách trong assets/sprites/, nhúng dạng data URL.

Mỗi mã ngoại hình trong game (LOOKS ở 02_art.js) ứng với một nhân vật trong assets: frame "đứng im, mặt trước" đầu tiên
→ cắt khung quanh đầu (tỉ lệ ~ 18:19 như khung chân dung cũ) → PNG → base64. faceOf() dùng avatar này nếu có.
Chạy lại sau khi tách sprite: python3 tools/make_avatars.py && python3 build.py
"""
import base64, io, os
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPR = os.path.join(ROOT, 'assets', 'sprites')
# mã look trong game → (thư mục, tên frame)
MAP = {
    'boy': ('namsinh', 'namsinh_dungim_down_1'), 'girl': ('nusinh', 'nusinh_dungim_down_1'),
    'vy': ('hoakhoi', 'hoakhoi_dungim_down_1'), 'c1': ('hocba', 'hocba_dungim_down_1'), 'hoang': ('daugau', 'daugau_dungim_down_1'),
    'sC': ('hamchoi', 'hamchoi_dungim_down_1'), 'ngan': ('thethao', 'thethao_dungim_down_1'), 'c9': ('truyenthong', 'truyenthong_dungim_down_1'),
    'khoa': ('lanhloi', 'lanhloi_dungim_down_1'), 'c6': ('khoahoc', 'khoahoc_dungim_down_1'), 'c4': ('yeuve', 'yeuve_dungim_down_1'),
    'c2': ('mongmo', 'mongmo_dungim_down_1'), 'c7': ('daigia', 'daigia_dungim_down_1'), 'c5': ('metieuthuyet', 'metieuthuyet_dungim_down_1'),
    'c3': ('vamvo', 'vamvo_dungim_down_1'), 'duyen': ('haudau', 'haudau_dungim_down_1'), 'c8': ('lambao', 'lambao_dungim_down_1'),
    'dat': ('idol', 'idol_dungim_down_1'),
    # ảnh "Tài nguyên game" (nhân vật vẽ nhỏ hơn)
    'guard': ('tainguyen', 'baove_dungim_down_1'), 'vendor': ('tainguyen', 'banrong_dungim_down_1'), 'teacherA': ('tainguyen', 'cogiao_dungim_down_1'),
    'principal': ('tainguyen', 'thaygiao_dungim_down_1'), 'giamthi': ('tainguyen', 'ongthay_dungim_down_1'),
    'x1': ('tainguyen', 'hocsinh_dungim_down_1'), 'x3': ('tainguyen', 'hocsinh_dungim_down_2'), 'sE': ('tainguyen', 'hocsinh_dungim_down_3'),
    'sG': ('tainguyen', 'hocsinh_dungim_down_4'), 'sA': ('tainguyen', 'hocsinh_dungim_down_5'),
}


def avatar(path, small):
    a = np.array(Image.open(path).convert('RGBA'))
    ys, xs = np.nonzero(a[:, :, 3])
    top = ys.min()
    hh = 13 if small else 27                                                  # chiều cao đầu (kể cả tóc) ước lượng
    band = a[top + hh // 3: top + hh, :, 3] > 0                               # vùng mặt: lấy giữa theo bề ngang
    cols = np.nonzero(band.any(0))[0]
    cxm = (cols.min() + cols.max()) / 2
    W, H = (18, 19) if small else (34, 36)
    x0 = int(round(cxm - W / 2)); y0 = top - 1
    out = np.zeros((H, W, 4), np.uint8)
    for j in range(H):
        for i in range(W):
            y, x = y0 + j, x0 + i
            if 0 <= y < a.shape[0] and 0 <= x < a.shape[1]: out[j, i] = a[y, x]
    buf = io.BytesIO(); Image.fromarray(out, 'RGBA').save(buf, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()


def main():
    lines = ['/* TỰ SINH bởi tools/make_avatars.py — đừng sửa tay.',
             ' * Avatar (đầu + vai) cắt từ sprite nhân vật đã tách trong assets/sprites/; faceOf() ưu tiên dùng nếu có. */',
             'const AVATARS = {']
    for look, (folder, frame) in MAP.items():
        p = os.path.join(SPR, folder, frame + '.png')
        lines.append(f"  {look}: '{avatar(p, folder == 'tainguyen')}',")
    lines.append('};')
    out = os.path.join(ROOT, 'src', '02e_avatars.js')
    open(out, 'w').write('\n'.join(lines) + '\n')
    print('wrote', out, os.path.getsize(out), 'bytes,', len(MAP), 'avatars')


if __name__ == '__main__':
    main()
