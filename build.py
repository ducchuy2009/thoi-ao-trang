#!/usr/bin/env python3
"""Gộp src/*.js + style.css vào một file index.html duy nhất."""
import glob, os
here = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(here, 'src')
tpl = open(os.path.join(src, 'index.template.html'), encoding='utf-8').read()
css = open(os.path.join(src, 'style.css'), encoding='utf-8').read()
js = '\n'.join(open(f, encoding='utf-8').read() for f in sorted(glob.glob(os.path.join(src, '*.js'))))
assert '</script' not in js
out = tpl.replace('/*__CSS__*/', css).replace('/*__JS__*/', js)
os.makedirs(os.path.join(here, 'dist'), exist_ok=True)
open(os.path.join(here, 'dist', 'index.html'), 'w', encoding='utf-8').write(out)
print('built', len(out), 'bytes')
