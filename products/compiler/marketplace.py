"""Marketplace (Flipkart/Amazon-style) image set from the CAD master.

Square, pure-white background, product filling ~85% of the frame, no text on
the primary image. Same geometry as STEP/cut list. Generic for any product.
"""
from __future__ import annotations

import os

import numpy as np
from PIL import Image, ImageDraw, ImageFont

from . import render

WHITE = (1.0, 1.0, 1.0)
SIDE = 2000
FILL = 0.85

SHOTS = [
    ("01_main_front_45", dict(view="hero", cam_override=dict(az=-35, el=18))),
    ("02_front", dict(view="front")),
    ("03_right_45", dict(view="hero", cam_override=dict(az=35, el=18))),
    ("04_left_side", dict(view="hero", cam_override=dict(az=-90, el=0.01))),
    ("05_back", dict(view="hero", cam_override=dict(az=180, el=12))),
    ("06_top", dict(view="hero", cam_override=dict(az=0, el=60))),
    ("07_open_45", dict(view="hero", state="open", cam_override=dict(az=-30, el=22))),
    ("08_open_front", dict(view="hero", state="open", cam_override=dict(az=0, el=10))),
    ("09_detail_seat_corner", dict(view="detail")),
    ("10_detail_plinth", dict(view="detail", cam_override=dict(az=-40, el=8))),
    ("12_exploded", dict(view="iso", explode=1.0)),
]


def _fit_square(src, dst):
    im = Image.open(src).convert("RGB")
    a = np.asarray(im).astype(int)
    mask = (np.abs(a - 255).sum(2) > 30)
    ys, xs = np.where(mask)
    im = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    s = SIDE * FILL / max(im.size)
    im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)
    out = Image.new("RGB", (SIDE, SIDE), (255, 255, 255))
    out.paste(im, ((SIDE - im.width) // 2, (SIDE - im.height) // 2))
    out.save(dst, optimize=True)


def _dimension_image(m, dst, tmp):
    cam, _ = render.render(m, tmp, view="hero", size=(1800, 1800), bg=WHITE, cam_override=dict(az=-35, el=18))
    im = Image.open(tmp).convert("RGB")
    dr = ImageDraw.Draw(im)
    try:
        f = ImageFont.truetype("DejaVuSans-Bold.ttf", 64)
    except OSError:
        f = ImageFont.load_default()
    x0, y0, z0, x1, y1, z1 = m.overall()
    off = 70
    P = lambda pts: [tuple(v / 2) for v in cam.project(np.array(pts, float))[0]]  # noqa: E731 (ss=2)
    ink = (60, 40, 25)
    for (a, b, txt) in (((x0, y0 - off, z0), (x1, y0 - off, z0), f"W {x1 - x0:g} mm"),
                        ((x1 + off, y0, z0), (x1 + off, y1, z0), f"D {y1 - y0:g} mm"),
                        ((x0 - off, y0, z0), (x0 - off, y0, z1), f"H {z1 - z0:g} mm")):
        pa, pb = P([a, b])
        dr.line([pa, pb], fill=ink, width=5)
        for p in (pa, pb):
            dr.ellipse([p[0] - 9, p[1] - 9, p[0] + 9, p[1] + 9], fill=ink)
        mx, my = (pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2
        tw = dr.textlength(txt, font=f)
        dr.rectangle([mx - tw / 2 - 12, my - 42, mx + tw / 2 + 12, my + 42], fill=(255, 255, 255))
        dr.text((mx - tw / 2, my - 36), txt, fill=ink, font=f)
    im.save(tmp)
    _fit_square(tmp, dst)


def build_set(m, folder):
    os.makedirs(folder, exist_ok=True)
    tmp = os.path.join(folder, "_tmp.png")
    out = []
    for name, kw in SHOTS:
        render.render(m, tmp, size=(1800, 1800), bg=WHITE, **kw)
        dst = os.path.join(folder, f"{m.tag}_{name}.png")
        _fit_square(tmp, dst)
        out.append(dst)
    dst = os.path.join(folder, f"{m.tag}_11_dimensions.png")
    _dimension_image(m, dst, tmp)
    out.append(dst)
    os.remove(tmp)
    return sorted(out)
