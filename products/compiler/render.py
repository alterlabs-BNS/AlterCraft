"""Deterministic z-buffer renderer driven by the CAD B-rep.

Each part's OpenCascade solid (same one exported to STEP, incl. radiused
corners) is tessellated and rasterised - there is no separate visual model.
Supports day (catalogue) and night (LED profile lights on) modes.
"""
from __future__ import annotations

import math

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

from .cad import mesh_of
from .model import AXES, ProductModel

BG = np.array([0.965, 0.953, 0.933])
FLOOR = np.array([0.93, 0.915, 0.89])
NIGHT_BG = np.array([0.10, 0.09, 0.085])
NIGHT_FLOOR = np.array([0.20, 0.18, 0.165])
WARM = np.array([1.0, 0.80, 0.52])
_MESH = {}


def _hex(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)])


class Camera:
    def __init__(self, target, az=-35, el=22, dist=3000, fov=24, w=1600, h=1200, ortho=None):
        self.w, self.h = w, h
        a, e = math.radians(az), math.radians(el)
        d = np.array([math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e)])
        self.eye = np.array(target, float) + d * dist
        f = np.array(target, float) - self.eye
        f /= np.linalg.norm(f)
        up = np.array([0, 0, 1.0]) if abs(f[2]) < 0.999 else np.array([0, 1.0, 0])
        r = np.cross(f, up); r /= np.linalg.norm(r)
        u = np.cross(r, f)
        self.R = np.stack([r, u, -f])
        self.ortho = ortho
        self.focal = (h / 2) / math.tan(math.radians(fov) / 2)

    def project(self, P):
        c = (np.asarray(P, float) - self.eye) @ self.R.T
        if self.ortho:
            s = self.h / self.ortho
            return np.stack([self.w / 2 + c[:, 0] * s, self.h / 2 - c[:, 1] * s], 1), -c[:, 2], np.ones(len(c))
        z = -c[:, 2]
        return (np.stack([self.w / 2 + c[:, 0] * self.focal / z, self.h / 2 - c[:, 1] * self.focal / z], 1), z, z)


def _part_mesh(p, b):
    """Triangles for part p placed at box b (translation of p.box, or a new pose)."""
    base = p.box
    same_size = all(abs((b[i + 3] - b[i]) - (base[i + 3] - base[i])) < 1e-6 for i in range(3))
    key = (p.id, p.box, tuple(sorted(p.corner_radii.items())), None if same_size else b)
    if key not in _MESH:
        _MESH[key] = mesh_of(p, None if same_size else b)
    faces = _MESH[key]
    off = np.array(b[:3]) - np.array(base[:3]) if same_size else np.zeros(3)
    return [np.array(f) + off for f in faces if len(f)]


def render(m: ProductModel, path, view="hero", state="closed", explode=0.0, show_proxies=False,
           size=(1600, 1200), labels=False, title=None, highlight=None, ss=2, bg=None, cam_override=None,
           night=False):
    """view: hero | front | side | top | detail | iso. night=True switches LED lights on."""
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
    vv = dict(views.get(view, views["hero"]))
    if cam_override:
        vv.update(cam_override)
    ortho = None
    if view in ("front", "side", "top"):
        dims = hi - lo
        vis = {"front": (dims[0], dims[2]), "side": (dims[1], dims[2]), "top": (dims[0], dims[1])}[view]
        ortho = max(vis[1] * 1.35, vis[0] * 1.35 * H / W)
    if view == "detail":
        tgt = np.array([lo[0] + 120, lo[1] + 40, hi[2] - 90])
        cam = Camera(tgt, dist=900, fov=30, w=W, h=H, **vv)
    else:
        cam = Camera(ctr, dist=ext * 2.15, fov=26, w=W, h=H, ortho=ortho, **vv)

    bgc = np.array(bg) if bg is not None else (NIGHT_BG if night else BG)
    zbuf = np.full((H, W), np.inf)
    col = np.tile(bgc, (H, W, 1))
    pid = np.full((H, W), -1, int)
    nrm = np.zeros((H, W, 3))
    light = np.array([-0.45, -0.7, 0.85]); light /= np.linalg.norm(light)

    # active LED lights: (segment a, segment b, z of emitter) - interior lights only when doors open
    lights = []
    if night:
        for p, b in items:
            if p.kind == "light" and (p.role != "light_interior" or state == "open"):
                zc = b[2]
                lights.append((np.array([b[0], (b[1] + b[4]) / 2, zc]), np.array([b[3], (b[1] + b[4]) / 2, zc])))
    ctx = dict(cam=cam, zbuf=zbuf, col=col, pid=pid, nrm=nrm, light=light, lights=lights, night=night)

    if view != "top":
        fp = 4 * ext
        fl = np.array([[ctr[0] - fp, ctr[1] - fp, 0], [ctr[0] + fp, ctr[1] - fp, 0],
                       [ctr[0] + fp, ctr[1] + fp, 0], [ctr[0] - fp, ctr[1] + fp, 0]])
        fcol = bgc if bg is not None else (NIGHT_FLOOR if night else FLOOR)
        for tri in (fl[[0, 1, 2]], fl[[0, 2, 3]]):
            _raster(ctx, tri, np.array([0, 0, 1.0]), -2, floor=(lo, hi, fcol, bg is not None))

    for k, (p, b) in enumerate(items):
        base = _hex(p.color)
        pc = (lo + hi) / 2 if False else np.array([(b[0] + b[3]) / 2, (b[1] + b[4]) / 2, (b[2] + b[5]) / 2])
        for face in _part_mesh(p, b):
            for tri in face:
                n = np.cross(tri[1] - tri[0], tri[2] - tri[0])
                ln = np.linalg.norm(n)
                if ln < 1e-9:
                    continue
                n /= ln
                if np.dot(n, tri.mean(0) - pc) < 0:
                    n = -n
                    tri = tri[::-1]
                _raster(ctx, tri, n, k, mat=(base, p))

    img = np.clip(col, 0, 1)
    # edges: part change, or crease (normal change) - tangent fillet seams are suppressed
    e = np.zeros((H, W), bool)
    for ax in (0, 1):
        a_ = pid
        b_ = np.roll(pid, 1, ax)
        dn = (nrm * np.roll(nrm, 1, ax)).sum(2)
        e |= (a_ != b_) | ((a_ >= 0) & (dn < 0.82))
    bgmask = pid < 0
    e &= ~(bgmask & np.roll(bgmask, 1, 0) & np.roll(bgmask, 1, 1))
    em = Image.fromarray((e * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3 if ss >= 2 else 1))
    ea = np.asarray(em)[..., None] / 255.0 * (0.30 if night else 0.55)
    img = img * (1 - ea) + (np.array([40, 34, 28]) / 255) * ea
    im = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8))
    if night and lights:  # bloom
        lum = np.asarray(im).astype(float)
        bright = np.clip(lum - 200, 0, 255)
        bl = np.asarray(Image.fromarray(bright.astype(np.uint8)).filter(ImageFilter.GaussianBlur(18 * ss))).astype(float)
        im = Image.fromarray(np.clip(lum + bl * 1.2, 0, 255).astype(np.uint8))
    im = im.resize(size, Image.LANCZOS)

    if labels or title:
        dr = ImageDraw.Draw(im)
        try:
            font = ImageFont.truetype("DejaVuSans.ttf", 15)
            tfont = ImageFont.truetype("DejaVuSans-Bold.ttf", 22)
        except OSError:
            font = tfont = ImageFont.load_default()
        tc = (235, 225, 210) if night else (30, 26, 22)
        if labels:
            placed = []
            for p, b in items:
                if p.kind == "proxy":
                    continue
                c = np.array([[(b[0] + b[3]) / 2, (b[1] + b[4]) / 2, (b[2] + b[5]) / 2]])
                xy, _, _ = cam.project(c)
                x, y = xy[0] / ss
                while any(abs(y - py) < 18 and abs(x - px) < 170 for px, py in placed):
                    y += 18
                placed.append((x, y))
                dr.ellipse([x - 3, y - 3, x + 3, y + 3], fill=(150, 60, 30))
                dr.text((x + 6, y - 8), f"{p.id[-3:]} {p.name}", fill=tc, font=font)
        if title:
            dr.text((28, 22), title, fill=tc, font=tfont)
            dr.text((28, 52), f"{m.tag} - derived from CAD master - DIGITAL MASTER v1.1", fill=(140, 128, 115), font=font)
    im.save(path)
    return cam, items


def _glow(ctx, wp, n):
    g = 0
    for a, b in ctx["lights"]:
        ab = b - a
        t = np.clip(((wp[0] - a[0]) * ab[0] + (wp[1] - a[1]) * ab[1] + (wp[2] - a[2]) * ab[2]) / (ab @ ab), 0, 1)
        d = [wp[k] - (a[k] + t * ab[k]) for k in range(3)]
        dist = np.sqrt(d[0] ** 2 + d[1] ** 2 + d[2] ** 2) + 1
        below = (wp[2] < a[2] - 0.5)  # profiles emit downwards
        facing = -(d[0] * n[0] + d[1] * n[1] + d[2] * n[2]) / dist  # surface faces the light
        g = g + below * np.clip(facing, 0, 1) * np.exp(-dist / 170) * 2.2
    return g


def _raster(ctx, P, n, k, mat=None, floor=None):
    cam, zbuf, col = ctx["cam"], ctx["zbuf"], ctx["col"]
    vd = -cam.R[2] if cam.ortho else P.mean(0) - cam.eye
    if floor is None and np.dot(n, vd) >= 0:
        return
    xy, depth, w = cam.project(P)
    if np.any(depth <= 1):
        return
    H, W = zbuf.shape
    xmin, xmax = int(max(0, np.floor(xy[:, 0].min()))), int(min(W - 1, np.ceil(xy[:, 0].max())))
    ymin, ymax = int(max(0, np.floor(xy[:, 1].min()))), int(min(H - 1, np.ceil(xy[:, 1].max())))
    if xmin > xmax or ymin > ymax:
        return
    gx, gy = np.meshgrid(np.arange(xmin, xmax + 1) + 0.5, np.arange(ymin, ymax + 1) + 0.5)
    (x0, y0), (x1, y1), (x2, y2) = xy
    den = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2)
    if abs(den) < 1e-9:
        return
    a = ((y1 - y2) * (gx - x2) + (x2 - x1) * (gy - y2)) / den
    b = ((y2 - y0) * (gx - x2) + (x0 - x2) * (gy - y2)) / den
    c = 1 - a - b
    inside = (a >= -1e-6) & (b >= -1e-6) & (c >= -1e-6)
    if not inside.any():
        return
    iw = 1 / w
    q = a * iw[0] + b * iw[1] + c * iw[2]
    z = (a * depth[0] * iw[0] + b * depth[1] * iw[1] + c * depth[2] * iw[2]) / q
    sub = zbuf[ymin:ymax + 1, xmin:xmax + 1]
    upd = inside & (z < sub - 0.01)
    if not upd.any():
        return
    wp = [(a * iw[0] * P[0][j] + b * iw[1] * P[1][j] + c * iw[2] * P[2][j]) / q for j in range(3)]
    night = ctx["night"]
    if floor is not None:
        lo, hi, fcol, tight = floor
        dx = np.maximum(np.maximum(lo[0] - wp[0], wp[0] - hi[0]), 0)
        dy = np.maximum(np.maximum(lo[1] - wp[1], wp[1] - hi[1]), 0)
        dist = np.hypot(dx, dy)
        sh = (1 - 0.30 * np.exp(-dist / 18)) if tight else (1 - 0.42 * np.exp(-dist / 45) - 0.14 * np.exp(-dist / 220))
        rgb = np.asarray(fcol)[None, None, :] * sh[..., None]
    else:
        base, part = mat
        if part.kind == "light":
            rgb = np.broadcast_to((np.array([1.0, 0.93, 0.8]) if night else np.array([0.80, 0.80, 0.78])) *
                                  (1 if night else 0.6 + 0.4 * max(0, n @ ctx["light"])), upd.shape + (3,)).copy()
        else:
            lam = max(0.0, float(np.dot(n, ctx["light"])))
            shade = (0.22 + 0.18 * lam) if night else (0.58 + 0.42 * lam)
            rgb = np.broadcast_to(base * shade, upd.shape + (3,)).copy()
            if part.grain != "none" and part.kind == "panel" and part.laminate not in ("FROSTY_WHITE", "INTERIOR"):
                ax = AXES.index(part.length_axis if part.grain == "length" else part.width_axis)
                across = [j for j in range(3) if j != ax and abs(n[j]) < 0.5]
                if across:
                    u = wp[across[0]]
                    g = 1 + 0.035 * np.sin(u * 0.9 + 3 * np.sin(wp[ax] * 0.004 + u * 0.05)) + 0.02 * np.sin(u * 0.23)
                    rgb *= g[..., None]
        n_ = n
    if night and ctx["lights"] and not (floor is None and mat[1].kind == "light"):
        base_c = (np.asarray(floor[2]) * 2.2) if floor is not None else mat[0]
        gl = _glow(ctx, wp, n if floor is None else np.array([0, 0, 1.0]))
        rgb = rgb + (np.asarray(base_c) * WARM)[None, None, :] * np.asarray(gl)[..., None]
    sub[upd] = z[upd]
    col[ymin:ymax + 1, xmin:xmax + 1][upd] = rgb[upd]
    ctx["pid"][ymin:ymax + 1, xmin:xmax + 1][upd] = k
    ctx["nrm"][ymin:ymax + 1, xmin:xmax + 1][upd] = n
