#!/usr/bin/env python3
"""Build web-sized copies of every photo in img/ (originals are left untouched).

  img/web/<name>    1600 px long edge  - the large carousel image
  img/thumb/<name>   300 px long edge  - the thumbnail grid

EXIF rotation is applied, then metadata is dropped. Re-run after adding photos
to img/; existing outputs are skipped unless the original is newer.
Usage: python3 tools/resize_images.py
"""
import os
from PIL import Image, ImageOps

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'img')
SIZES = {'web': (1600, 82), 'thumb': (300, 75)}


def build(name):
    src = os.path.join(ROOT, name)
    for folder, (edge, quality) in SIZES.items():
        dst = os.path.join(ROOT, folder, name)
        if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src):
            continue
        im = ImageOps.exif_transpose(Image.open(src))
        im.thumbnail((edge, edge), Image.LANCZOS)
        if name.lower().endswith('.png'):
            im.save(dst, optimize=True)
        else:
            im.convert('RGB').save(dst, quality=quality, optimize=True, progressive=True)


def main():
    for folder in SIZES:
        os.makedirs(os.path.join(ROOT, folder), exist_ok=True)
    names = sorted(n for n in os.listdir(ROOT)
                   if os.path.isfile(os.path.join(ROOT, n))
                   and n.lower().endswith(('.jpg', '.jpeg', '.png')))
    for n in names:
        build(n)
    print(f'{len(names)} images processed')


if __name__ == '__main__':
    main()
