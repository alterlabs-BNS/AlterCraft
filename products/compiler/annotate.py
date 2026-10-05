"""Measured marketplace images: every shot carries real dimensions read from
the ProductModel (same numbers as the cut list / drawings). Generic: works
with any compiler render() that returns (camera, items) and renders at ss=2."""
from __future__ import annotations

import os

import numpy as np
from PIL import Image, ImageDraw, ImageFont

INK = (70, 45, 25)
SS = 2


def _font(sz, bold=True):
    try:
        return ImageFont.truetype("DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf", sz)
    except OSError:
        return ImageFont.load_default()


class Dimmer:
    def __init__(self, im, cam, scale=1.0):
        self.im, self.cam = im, cam
        self.dr = ImageDraw.Draw(im)
        self.f = _font(int(40 * scale))
        self.lw = max(2, int(4 * scale))
        self.r = 7 * scale

    def P(self, pts):
        return [tuple(v / SS) for v in self.cam.project(np.array(pts, float))[0]]

    def dim(self, a, b, off, text, ext=True):
        a, b, off = np.array(a, float), np.array(b, float), np.array(off, float)
        pa, pb, qa, qb = self.P([a, b, a + off, b + off])
        if ext:
            self.dr.line([pa, qa], fill=(150, 130, 110), width=max(1, self.lw // 2))
            self.dr.line([pb, qb], fill=(150, 130, 110), width=max(1, self.lw // 2))
        self.dr.line([qa, qb], fill=INK, width=self.lw)
        for q in (qa, qb):
            self.dr.ellipse([q[0] - self.r, q[1] - self.r, q[0] + self.r, q[1] + self.r], fill=INK)
        self.label(((qa[0] + qb[0]) / 2, (qa[1] + qb[1]) / 2), text)

    def label(self, xy, text, f=None):
        f = f or self.f
        x, y = xy
        tw = self.dr.textlength(text, font=f)
        h = f.size
        self.dr.rounded_rectangle([x - tw / 2 - 12, y - h * 0.75, x + tw / 2 + 12, y + h * 0.75], 8,
                                  fill=(255, 255, 255), outline=INK, width=2)
        self.dr.text((x - tw / 2, y - h * 0.6), text, fill=INK, font=f)


def _parts(m, role):
    return [p for p in m.parts if p.role == role]


def dims_for(shot, m, D, state):
    """Draw the dimension set appropriate to each shot."""
    x0, y0, z0, x1, y1, z1 = m.overall()
    W, Dp, H = x1 - x0, y1 - y0, z1 - z0
    g = 90  # offset from body
    d = m.derived
    p = m.params
    t = p["BOARD_THICKNESS"]
    sides = _parts(m, "side")
    cy0 = min(s.box[1] for s in sides)
    cy1 = max(s.box[4] for s in sides)
    cx0 = min(s.box[0] for s in sides)
    ph = p["PLINTH_HEIGHT"]
    tiers = d["tier_clear_heights"]

    def overall(left=True, depth_side="left"):
        D.dim((x0, y0, 0), (x1, y0, 0), (0, -g, 0), f"W {W:g} mm")
        xs = x0 if left else x1
        D.dim((xs, y0, 0), (xs, y0, H), (-g if left else g, 0, 0), f"H {H:g} mm")
        xd = x0 if depth_side == "left" else x1
        D.dim((xd, y0, 0), (xd, y1, 0), (-g if depth_side == "left" else g, 0, 0), f"D {Dp:g} mm")

    def internal(front_y):
        x = cx0 + t
        for k in range(d["bays"]):
            D.dim((x, front_y, ph + t), (x + d["bay_inner_width"], front_y, ph + t), (0, 0, 0),
                  f"{d['bay_inner_width']:g}", ext=False)
            x += d["bay_inner_width"] + t
        z = ph + t
        xr = cx0 + t + d["bay_inner_width"] / 2
        for c in tiers:
            D.dim((xr, front_y, z), (xr, front_y, z + c), (0, 0, 0), f"{c:g} clear", ext=False)
            z += c + t

    if shot in ("01_main_front_45",):
        overall(True, "left")
        D.dim((x1, y0, 0), (x1, y0, ph), (g, 0, 0), f"plinth {ph:g}")
    elif shot == "11_dimensions":
        overall(True, "left")
        D.dim((x1, y0, 0), (x1, y0, ph), (g, 0, 0), f"plinth {ph:g}")
        top = _parts(m, "top")[0]
        D.dim((x1, y0, top.box[2]), (x1, y0, top.box[5]), (g, 0, 0), f"seat {top.thickness:g}")
        for dr_ in _parts(m, "door")[:1]:
            b = dr_.box
            D.dim((b[0], b[1], b[2]), (b[3], b[1], b[2]), (0, 0, 0), f"door {b[3] - b[0]:g}", ext=False)
            D.dim(((b[0] + b[3]) / 2, b[1], b[2]), ((b[0] + b[3]) / 2, b[1], b[5]), (0, 0, 0),
                  f"door {b[5] - b[2]:g}", ext=False)
    elif shot == "03_right_45":
        overall(False, "right")
    elif shot == "02_front":
        D.dim((x0, y0, 0), (x1, y0, 0), (0, 0, -g), f"W {W:g} mm")
        D.dim((x0, y0, 0), (x0, y0, H), (-g, 0, 0), f"H {H:g} mm")
        D.dim((x1, y0, 0), (x1, y0, ph), (g, 0, 0), f"plinth {ph:g}")
        for dr_ in _parts(m, "door")[:1]:
            b = dr_.box
            D.dim((b[0], b[1], b[5]), (b[3], b[1], b[5]), (0, 0, 0), f"door {b[3] - b[0]:g}", ext=False)
            D.dim(((b[0] + b[3]) / 2, b[1], b[2]), ((b[0] + b[3]) / 2, b[1], b[5]), (0, 0, 0),
                  f"door {b[5] - b[2]:g}", ext=False)
    elif shot == "04_left_side":
        D.dim((x0, y0, 0), (x0, y1, 0), (0, 0, -g), f"D {Dp:g} mm")
        D.dim((x0, y1, 0), (x0, y1, H), (0, g, 0), f"H {H:g} mm")
        top = _parts(m, "top")[0]
        D.dim((x0, y0, top.box[2]), (x0, y0, top.box[5]), (0, -g, 0), f"seat {top.thickness:g}")
    elif shot == "05_back":
        D.dim((x0, y1, 0), (x1, y1, 0), (0, 0, -g), f"W {W:g} mm")
        D.dim((x1, y1, 0), (x1, y1, H), (g, 0, 0), f"H {H:g} mm")
    elif shot == "06_top":
        D.dim((x0, y0, H), (x1, y0, H), (0, -g, 0), f"W {W:g} mm")
        D.dim((x1, y0, H), (x1, y1, H), (g, 0, 0), f"D {Dp:g} mm")
    elif shot in ("07_open_45", "08_open_front"):
        internal(cy0)
        D.dim((x0, y0, 0), (x1, y0, 0), (0, -g, -g if shot == "08_open_front" else 0), f"W {W:g} mm")
        if shot == "07_open_45":
            D.dim((cx0, cy0, ph + t), (cx0, cy1, ph + t), (0, 0, 0), f"inside depth {cy1 - cy0:g}", ext=False)
    elif shot == "09_detail_seat_corner":
        top = _parts(m, "top")[0]
        D.dim((x0, y0, top.box[2]), (x0, y0, top.box[5]), (-60, 0, 0), f"seat {top.thickness:g} mm")
        doors = _parts(m, "door")
        if doors:
            dy = doors[0].box[1] - y0
            D.dim((x0 + 150, y0, top.box[2]), (x0 + 150, y0 + dy, top.box[2]), (0, 0, -60), f"overhang {dy:g}")
    elif shot == "10_detail_plinth":
        doors = _parts(m, "door")
        if doors:
            b = doors[0].box
            D.dim((b[0], b[1], b[5]), (b[0], b[4], b[5]), (0, 0, 60), f"door {b[4] - b[1]:g} mm")
    elif shot.startswith("variant"):
        overall(True, "left")


def size_labels(m, D, items):
    """Exploded view: each part tagged with its cut-list size."""
    placed = []
    f = _font(int(D.f.size * 0.7))
    for p, b in items:
        if p.kind == "proxy":
            continue
        c = [(b[0] + b[3]) / 2, (b[1] + b[4]) / 2, (b[2] + b[5]) / 2]
        x, y = D.P([c])[0]
        while any(abs(y - py) < f.size * 1.6 and abs(x - px) < 330 for px, py in placed):
            y += f.size * 1.6
        placed.append((x, y))
        D.label((x, y), f"{p.name}: {p.length:g} x {p.width:g} x {p.thickness:g}", f=f)


def fit_square(im, dst, side=2000, fill=0.9):
    a = np.asarray(im.convert("RGB")).astype(int)
    ys, xs = np.where(np.abs(a - 255).sum(2) > 30)
    im = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    s = side * fill / max(im.size)
    im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)
    out = Image.new("RGB", (side, side), (255, 255, 255))
    out.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
    out.save(dst, optimize=True)


def build_measured_set(m, render_mod, shots, folder, prefix, variants=None):
    """shots: list of (name, render kwargs). variants: {label: model}."""
    os.makedirs(folder, exist_ok=True)
    orig = render_mod.Camera

    def wide(*a, **k):  # zoom out so dimension lines have room
        k["dist"] = k["dist"] * 1.4
        if k.get("ortho"):
            k["ortho"] *= 1.4
        return orig(*a, **k)
    render_mod.Camera = wide
    tmp = os.path.join(folder, "_tmp.png")
    out = []
    jobs = [(n, m, kw) for n, kw in shots] + [(f"variant_{k}", vm, dict(view="hero")) for k, vm in (variants or {}).items()]
    for name, mm, kw in jobs:
        kw = dict(kw)
        cam, items = render_mod.render(mm, tmp, size=(2000, 2000), bg=(1.0, 1.0, 1.0), **kw)
        im = Image.open(tmp).convert("RGB")
        # pad so dimension lines outside the product fit
        D = Dimmer(im, cam, scale=1.0)
        if name.endswith("exploded"):
            size_labels(mm, D, items)
        else:
            dims_for(name if not name.startswith("variant") else "variant", mm, D, kw.get("state", "closed"))
        dst = os.path.join(folder, f"{prefix}{name}.png")
        fit_square(im, dst)
        out.append(dst)
    os.remove(tmp)
    render_mod.Camera = orig
    return out
