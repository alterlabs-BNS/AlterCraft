"""Deterministic z-buffer renderer for box-panel products.

Renders the SAME part boxes that go to STEP/cut list - no separate visual
model. Output is a clean catalogue-style shaded image with edge lines,
subtle grain, and a soft contact shadow. Not photoreal; lifestyle
compositing is a later stage.
"""
from __future__ import annotations

import math

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

from .model import AXES, ProductModel, Part

BG = np.array([0.965, 0.953, 0.933])
FLOOR = np.array([0.93, 0.915, 0.89])


def _hex(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)])


def _faces(b):
    x0, y0, z0, x1, y1, z1 = b
    v = np.array([[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0],
                  [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], float)
    quads = [((0, 3, 2, 1), (0, 0, -1)), ((4, 5, 6, 7), (0, 0, 1)), ((0, 1, 5, 4), (0, -1, 0)),
             ((2, 3, 7, 6), (0, 1, 0)), ((1, 2, 6, 5), (1, 0, 0)), ((3, 0, 4, 7), (-1, 0, 0))]
    return [(v[list(q)], np.array(n, float)) for q, n in quads]


class Camera:
    def __init__(self, target, az=-35, el=22, dist=3000, fov=24, w=1600, h=1200, ortho=None):
        self.w, self.h = w, h
        a, e = math.radians(az), math.radians(el)
        # az measured from the front (-Y) towards +X
        d = np.array([math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e)])
        self.eye = np.array(target) + d * dist
        f = np.array(target) - self.eye
        f /= np.linalg.norm(f)
        r = np.cross(f, [0, 0, 1.0]); r /= np.linalg.norm(r)
        u = np.cross(r, f)
        self.R = np.stack([r, u, -f])
        self.ortho = ortho  # mm visible vertically if orthographic
        self.focal = (h / 2) / math.tan(math.radians(fov) / 2)

    def project(self, P):
        c = (P - self.eye) @ self.R.T
        if self.ortho:
            s = self.h / self.ortho
            x, y, w = c[:, 0] * s, c[:, 1] * s, np.ones(len(c))
            depth = -c[:, 2]
        else:
            z = -c[:, 2]
            x, y, w = c[:, 0] * self.focal / z, c[:, 1] * self.focal / z, z
            depth = z
        return np.stack([self.w / 2 + x, self.h / 2 - y], 1), depth, w


def render(m: ProductModel, path, view="hero", state="closed", explode=0.0, show_proxies=False,
           size=(1600, 1200), labels=False, title=None, highlight=None, ss=2):
    """view: hero | front | side | top | detail | iso"""
    parts = [p for p in m.parts if not (highlight is not None and p.assembly_step > highlight)]
    items = []
    for p in parts:
        b = p.open_box if (state == "open" and p.open_box) else p.box
        if explode:
            b = tuple(b[i] + p.explode[i % 3] * explode for i in range(6))
        items.append((p, b))
    if show_proxies:
        items += [(p, p.box) for p in m.proxies]
    allb = np.array([b for _, b in items])
    lo, hi = allb[:, :3].min(0), allb[:, 3:].max(0)
    ctr = (lo + hi) / 2
    ext = float(np.linalg.norm(hi - lo))
    W, H = size[0] * ss, size[1] * ss
    views = {"hero": dict(az=-38, el=20), "front": dict(az=0, el=0), "side": dict(az=90, el=0),
             "top": dict(az=0, el=89.9), "detail": dict(az=-50, el=28), "iso": dict(az=-40, el=28)}
    vv = views[view]
    ortho = None
    if view in ("front", "side", "top"):
        dims = hi - lo
        vis = {"front": (dims[0], dims[2]), "side": (dims[1], dims[2]), "top": (dims[0], dims[1])}[view]
        ortho = max(vis[1] * 1.35, vis[0] * 1.35 * H / W)
    if view == "detail":
        # close-up on the seat front-left corner
        tgt = np.array([lo[0] + 120, lo[1] + 40, hi[2] - 90])
        cam = Camera(tgt, dist=900, fov=30, w=W, h=H, **vv)
    else:
        cam = Camera(ctr, dist=ext * 2.15, fov=26, w=W, h=H, ortho=ortho, **vv)

    zbuf = np.full((H, W), np.inf)
    col = np.tile(BG, (H, W, 1))
    fid = np.full((H, W), -1, int)
    light = np.array([-0.45, -0.7, 0.85]); light /= np.linalg.norm(light)

    # floor (with contact shadow)
    if view not in ("top",):
        fp = 4 * ext
        floor = np.array([[ctr[0] - fp, ctr[1] - fp, 0], [ctr[0] + fp, ctr[1] - fp, 0],
                          [ctr[0] + fp, ctr[1] + fp, 0], [ctr[0] - fp, ctr[1] + fp, 0]])
        _raster(cam, floor, np.array([0, 0, 1.0]), None, -2, zbuf, col, fid, light, floor=(lo, hi))

    for k, (p, b) in enumerate(items):
        base = _hex(p.color)
        for j, (quad, n) in enumerate(_faces(b)):
            _raster(cam, quad, n, (base, p), k * 6 + j, zbuf, col, fid, light)

    img = (np.clip(col, 0, 1) * 255).astype(np.uint8)
    # edge lines from face-id discontinuities
    e = np.zeros((H, W), bool)
    e[:, 1:] |= fid[:, 1:] != fid[:, :-1]
    e[1:, :] |= fid[1:, :] != fid[:-1, :]
    floor_px = fid == -2
    e &= ~(floor_px & np.roll(floor_px, 1, 0) & np.roll(floor_px, 1, 1))
    e &= ~((fid == -1) & np.roll(fid == -1, 1, 1))
    em = Image.fromarray((e * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3 if ss >= 2 else 1))
    ea = np.asarray(em)[..., None] / 255.0 * 0.55
    img = (img * (1 - ea) + np.array([40, 34, 28]) * ea).astype(np.uint8)
    im = Image.fromarray(img).resize(size, Image.LANCZOS)

    if labels or title:
        dr = ImageDraw.Draw(im)
        try:
            font = ImageFont.truetype("DejaVuSans.ttf", 15)
            tfont = ImageFont.truetype("DejaVuSans-Bold.ttf", 22)
        except OSError:
            font = tfont = ImageFont.load_default()
        if labels:
            placed = []
            for p, b in items:
                if p.kind == "proxy":
                    continue
                c = np.array([[(b[0] + b[3]) / 2, (b[1] + b[4]) / 2, (b[2] + b[5]) / 2]])
                xy, _, _ = cam.project(c)
                x, y = xy[0] / ss
                txt = f"{p.id[-3:]} {p.name}"
                while any(abs(y - py) < 18 and abs(x - px) < 170 for px, py in placed):
                    y += 18
                placed.append((x, y))
                dr.ellipse([x - 3, y - 3, x + 3, y + 3], fill=(150, 60, 30))
                dr.text((x + 6, y - 8), txt, fill=(30, 26, 22), font=font)
        if title:
            dr.text((28, 22), title, fill=(30, 26, 22), font=tfont)
            dr.text((28, 52), f"{m.tag} - derived from CAD master - DIGITAL MASTER v1", fill=(110, 100, 90), font=font)
    im.save(path)
    return cam, items


def _raster(cam, quad, n, mat, face_id, zbuf, col, fid, light, floor=None):
    xy, depth, w = cam.project(quad)
    if not floor:
        # back-face cull
        ctr = quad.mean(0)
        if cam.ortho:
            vd = -cam.R[2]
        else:
            vd = ctr - cam.eye
        if np.dot(n, vd) >= 0:
            return
    if np.any(depth <= 1):
        return
    H, W = zbuf.shape
    for tri in ((0, 1, 2), (0, 2, 3)):
        t = list(tri)
        p, d, ww, P = xy[t], depth[t], w[t], quad[t]
        xmin, xmax = int(max(0, np.floor(p[:, 0].min()))), int(min(W - 1, np.ceil(p[:, 0].max())))
        ymin, ymax = int(max(0, np.floor(p[:, 1].min()))), int(min(H - 1, np.ceil(p[:, 1].max())))
        if xmin > xmax or ymin > ymax:
            continue
        gx, gy = np.meshgrid(np.arange(xmin, xmax + 1) + 0.5, np.arange(ymin, ymax + 1) + 0.5)
        (x0, y0), (x1, y1), (x2, y2) = p
        den = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2)
        if abs(den) < 1e-9:
            continue
        a = ((y1 - y2) * (gx - x2) + (x2 - x1) * (gy - y2)) / den
        b = ((y2 - y0) * (gx - x2) + (x0 - x2) * (gy - y2)) / den
        c = 1 - a - b
        inside = (a >= -1e-6) & (b >= -1e-6) & (c >= -1e-6)
        if not inside.any():
            continue
        iw = 1 / ww
        q = a * iw[0] + b * iw[1] + c * iw[2]
        z = (a * d[0] * iw[0] + b * d[1] * iw[1] + c * d[2] * iw[2]) / q
        sub = zbuf[ymin:ymax + 1, xmin:xmax + 1]
        upd = inside & (z < sub - 0.01)
        if not upd.any():
            continue
        wp = [(a * iw[0] * P[0][k] + b * iw[1] * P[1][k] + c * iw[2] * P[2][k]) / q for k in range(3)]
        if floor:
            lo, hi = floor
            dx = np.maximum(np.maximum(lo[0] - wp[0], wp[0] - hi[0]), 0)
            dy = np.maximum(np.maximum(lo[1] - wp[1], wp[1] - hi[1]), 0)
            dist = np.hypot(dx, dy)
            sh = 1 - 0.42 * np.exp(-dist / 45) - 0.14 * np.exp(-dist / 220)
            rgb = FLOOR[None, None, :] * sh[..., None]
        else:
            base, part = mat
            lam = max(0.0, float(np.dot(n, light)))
            shade = 0.58 + 0.42 * lam
            rgb = np.broadcast_to(base * shade, upd.shape + (3,)).copy()
            if part.grain != "none" and part.kind == "panel" and part.color not in ("#e9e3d8",):
                ax = AXES.index(part.length_axis if part.grain == "length" else part.width_axis)
                across = [k for k in range(3) if k != ax and abs(n[k]) < 0.5]
                if across:
                    u = wp[across[0]]
                    g = 1 + 0.035 * np.sin(u * 0.9 + 3 * np.sin(wp[ax] * 0.004 + u * 0.05)) \
                        + 0.02 * np.sin(u * 0.23)
                    rgb *= g[..., None]
        sub[upd] = z[upd]
        cs = col[ymin:ymax + 1, xmin:xmax + 1]
        cs[upd] = rgb[upd]
        fid[ymin:ymax + 1, xmin:xmax + 1][upd] = face_id
