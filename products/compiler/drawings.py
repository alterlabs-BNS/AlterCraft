"""Technical drawings (PDF + SVG) projected from the part boxes.
Orthographic, first-angle layout, mm. Generic for any box-panel product."""
from __future__ import annotations

import os

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.backends.backend_pdf import PdfPages  # noqa: E402
from matplotlib.patches import Rectangle  # noqa: E402

from .model import ProductModel  # noqa: E402

INK = "#1e1a16"
DIM = "#8a3b1c"
A3 = (16.54, 11.69)


def _proj(b, view):
    x0, y0, z0, x1, y1, z1 = b
    if view == "front":   # look from -Y: horizontal X, vertical Z, depth Y (smaller = nearer)
        return (x0, z0, x1, z1), y0
    if view == "side":    # look from +X (right side): horizontal Y reversed so front is on the left... keep Y
        return (y0, z0, y1, z1), -x1
    if view == "top":     # look down: horizontal X, vertical -Y (front at bottom)
        return (x0, -y1, x1, -y0), -z1
    raise ValueError(view)


def draw_view(ax, parts, view, ox, oy, clip=None, hidden_roles=()):
    items = []
    for p in parts:
        if p.role in hidden_roles:
            continue
        b = p.box
        if clip is not None:  # section plane x = clip (side section)
            if not (b[0] <= clip <= b[3]):
                continue
        r, d = _proj(b, view)
        items.append((d, r, p))
    for d, (a, b_, c, e), p in sorted(items, key=lambda t: -t[0]):
        fc = "#efe7da" if p.role not in ("kick",) else "#6b6b6b"
        if clip is not None:
            fc = "#d9c9b0" if p.role not in ("cushion",) else "#efe4d0"
        ax.add_patch(Rectangle((ox + a, oy + b_), c - a, e - b_, fc=fc, ec=INK, lw=0.6,
                               hatch="////" if clip is not None and p.kind == "panel" else None))


def dim(ax, x0, y0, x1, y1, off, text=None, vertical=False, fs=7):
    if vertical:
        xo = x0 + off
        ax.plot([x0, xo + (2 if off > 0 else -2)], [y0, y0], color=DIM, lw=0.4)
        ax.plot([x1, xo + (2 if off > 0 else -2)], [y1, y1], color=DIM, lw=0.4)
        ax.annotate("", (xo, y0), (xo, y1), arrowprops=dict(arrowstyle="<->", color=DIM, lw=0.6))
        ax.text(xo - 4 if off < 0 else xo + 4, (y0 + y1) / 2, text or f"{abs(y1 - y0):g}", rotation=90,
                ha="right" if off < 0 else "left", va="center", fontsize=fs, color=DIM)
    else:
        yo = y0 + off
        ax.plot([x0, x0], [y0, yo - (2 if off > 0 else -2) * -1], color=DIM, lw=0.4)
        ax.plot([x1, x1], [y1, yo - (2 if off > 0 else -2) * -1], color=DIM, lw=0.4)
        ax.annotate("", (x0, yo), (x1, yo), arrowprops=dict(arrowstyle="<->", color=DIM, lw=0.6))
        ax.text((x0 + x1) / 2, yo + (3 if off > 0 else -3), text or f"{abs(x1 - x0):g}",
                ha="center", va="bottom" if off > 0 else "top", fontsize=fs, color=DIM)


def _sheet(title, m: ProductModel, sheet_no, note=""):
    fig = plt.figure(figsize=A3)
    ax = fig.add_axes([0.03, 0.12, 0.94, 0.84])
    ax.set_aspect("equal")
    ax.axis("off")
    tb = fig.add_axes([0.03, 0.02, 0.94, 0.09])
    tb.axis("off")
    tb.add_patch(Rectangle((0, 0), 1, 1, fill=False, ec=INK, lw=1, transform=tb.transAxes))
    p = m.params
    tb.text(0.01, 0.70, f"ALTERCRAFT  |  {m.product_id} {m.name.upper()}  |  {title}", fontsize=12, weight="bold")
    tb.text(0.01, 0.40, f"Variant {m.variant}  |  W {p['WIDTH']:g} x D {p['DEPTH']:g} x H {p['TOTAL_HEIGHT']:g} mm  |  "
                        f"board {p['BOARD_THICKNESS']:g} mm {p['MATERIAL']}  |  back {p['BACK_PANEL_THICKNESS']:g} mm  |  "
                        f"finish {p['FINISH']}  |  units mm  |  scale: fit to sheet (do not scale)", fontsize=8)
    tb.text(0.01, 0.12, "DIGITAL MASTER v1 - NOT RELEASED FOR PRODUCTION. Structure, fasteners, tolerances and hardware "
                        "boring require fabrication validation. " + note, fontsize=8, color=DIM)
    tb.text(0.90, 0.40, f"{m.tag}\nsheet {sheet_no}", fontsize=8, ha="left")
    return fig, ax


def general_dimensions(m: ProductModel, pdf_path: str, svg_path: str | None = None):
    p, d = m.params, m.derived
    W, D, H = p["WIDTH"], p["DEPTH"], p["TOTAL_HEIGHT"]
    t = p["BOARD_THICKNESS"]
    parts = m.parts
    gap = 260
    fig, ax = _sheet("GENERAL DIMENSIONS", m, "1/2")
    # FRONT (closed)
    draw_view(ax, parts, "front", 0, 0)
    ax.text(0, H + 70, "FRONT", fontsize=10, weight="bold")
    dim(ax, 0, H, W, H, 40)
    dim(ax, 0, 0, 0, H, -60, vertical=True)
    dim(ax, 0, 0, 0, d["BODY_HEIGHT"], -25, vertical=True, text=f"{d['BODY_HEIGHT']:g} body")
    doors = [q for q in parts if q.role == "door"]
    if doors:
        q = doors[0]
        dim(ax, q.box[0], q.box[2], q.box[3], q.box[2], -45, text=f"door {q.size('x'):g}")
        dim(ax, q.box[3], q.box[2], q.box[3], q.box[5], 25, vertical=True, text=f"door {q.size('z'):g}")
    # SIDE (right)
    sx = W + gap
    draw_view(ax, parts, "side", sx, 0)
    ax.text(sx, H + 70, "SIDE (RIGHT)", fontsize=10, weight="bold")
    dim(ax, sx, H, sx + D, H, 40)
    dim(ax, sx + D, 0, sx + D, p["PLINTH_HEIGHT"], 30, vertical=True, text=f"plinth {p['PLINTH_HEIGHT']:g}")
    # TOP
    ty = -D - 260
    draw_view(ax, parts, "top", 0, ty + D)
    ax.text(0, ty + D + 25, "TOP", fontsize=10, weight="bold")
    dim(ax, W, ty, W, ty + D, 35, vertical=True)
    # FRONT, doors removed (internal)
    ix = W + gap
    draw_view(ax, parts, "front", ix, ty - 40, hidden_roles=("door", "cushion", "cushion_base"))
    ax.text(ix, ty - 40 + H + 30, "FRONT - DOORS REMOVED (INTERNAL)", fontsize=10, weight="bold")
    bays = d["bays"]
    x = ix + t
    for b in range(bays):
        dim(ax, x, ty - 40 + p["PLINTH_HEIGHT"], x + d["bay_inner_width"], ty - 40 + p["PLINTH_HEIGHT"], -30,
            text=f"{d['bay_inner_width']:g}")
        x += d["bay_inner_width"] + t
    z = p["PLINTH_HEIGHT"] + t
    for k, c in enumerate(d["tier_clear_heights"]):
        dim(ax, ix + W, ty - 40 + z, ix + W, ty - 40 + z + c, 25 + 0 * k, vertical=True, text=f"{c:g} clr")
        z += c + t
    ax.text(ix, ty - 40 - 70, f"Board {t:g} mm throughout; shelves {t:g} mm loose on pins; "
                              f"internal depth {d['carcass_depth']:g}; shelf depth {d['shelf_depth']:g}",
            fontsize=8)
    ax.autoscale_view()
    ax.set_xlim(-160, 2 * W + gap + 200 if D < W else W + gap + D + 200)
    ax.set_ylim(ty - 260, H + 140)
    fig2, ax2 = _sheet("SECTION A-A (THROUGH BAY 1 CENTRE)", m, "2/2")
    cx = t + d["bay_inner_width"] / 2
    draw_view(ax2, parts, "side", 0, 0, clip=cx)
    ax2.text(0, H + 60, f"SECTION A-A at X = {cx:g} mm (looking from right)", fontsize=10, weight="bold")
    dim(ax2, 0, H, D, H, 35)
    car0 = min(q.box[1] for q in parts if q.role == "side")
    car1 = max(q.box[4] for q in parts if q.role == "side")
    dim(ax2, car0, 0, car1, 0, -40, text=f"carcass {car1 - car0:g}")
    sh = [q for q in parts if q.role == "shelf"]
    if sh:
        dim(ax2, sh[0].box[1], sh[0].box[5], sh[0].box[4], sh[0].box[5], 25, text=f"shelf {sh[0].size('y'):g}")
    dim(ax2, D, 0, D, d["BODY_HEIGHT"], 40, vertical=True, text=f"body {d['BODY_HEIGHT']:g}")
    dim(ax2, 0, d["BODY_HEIGHT"], 0, H, -30, vertical=True)
    ax2.text(D + 120, H - 20, "\n".join([
        f"Seat top {next(q for q in parts if q.role == 'top').thickness:g} mm, overhang {p['SEAT_OVERHANG']:g} mm past door face",
        f"Door {t:g} mm full overlay, {p['DOOR_GAP']:g} mm gap under seat" if any(q.role == 'door' for q in parts) else "No doors",
        f"Back {p['BACK_PANEL_THICKNESS']:g} mm fixed over carcass rear edges, floor to seat underside",
        f"Kick rail recessed {p['PLINTH_RECESS']:g} mm behind carcass front",
        f"Rear plinth rail bears on floor; anti-tip bracket zone",
        f"Load path: seat -> sides + partition(s) -> bottom -> plinth rails -> floor",
        f"Max seat span {d['seat_max_span']:g} mm (assumed limit {p['MAX_SEAT_SPAN']:g})",
    ]), fontsize=9, va="top")
    ax2.set_xlim(-150, D + 900)
    ax2.set_ylim(-150, H + 120)
    with PdfPages(pdf_path) as pdf:
        pdf.savefig(fig)
        pdf.savefig(fig2)
    if svg_path:
        fig.savefig(svg_path)
    plt.close("all")
    return pdf_path


def image_sheets(m: ProductModel, pdf_path: str, title: str, pages: list):
    """pages: list of (image_path, caption)."""
    with PdfPages(pdf_path) as pdf:
        for i, (img, cap) in enumerate(pages, 1):
            fig, ax = _sheet(title, m, f"{i}/{len(pages)}")
            ax.imshow(plt.imread(img))
            ax.text(0, -20, cap, fontsize=11, weight="bold")
            pdf.savefig(fig)
            plt.close(fig)
    return pdf_path
