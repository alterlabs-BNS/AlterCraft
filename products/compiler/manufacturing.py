"""BOM, cut list, edge-banding schedule, hardware list, pricing inputs.
All values are read from the ProductModel geometry - never typed by hand."""
from __future__ import annotations

import csv
import os
from collections import OrderedDict

import math

from .model import EXPOSED, FLOOR, NO_BAND, SEMI, ProductModel


def band_thk(cls: str, params: dict) -> float:
    if cls == EXPOSED:
        return params["EDGE_BANDING_THICKNESS"]
    if cls in (SEMI, FLOOR):
        return params["EDGE_BANDING_INTERNAL"]
    return 0.0


def _write(path, header, rows):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(rows)
    return path


def grouped(m: ProductModel):
    """Identical parts (same role, size, material, finish, edges) grouped."""
    g = OrderedDict()
    for p in m.parts:
        key = (p.role, p.length, p.width, p.thickness, p.material, p.finish, p.laminate, p.kind,
               tuple(sorted(p.corner_radii.items())),
               tuple(sorted(p.edge_2d().items())))
        g.setdefault(key, []).append(p)
    return list(g.values())


def bom_rows(m):
    rows = []
    for i, grp in enumerate(grouped(m), 1):
        p = grp[0]
        rows.append([f"{m.product_id}-B{i:02d}", p.name if len(grp) == 1 else p.name.rsplit(" ", 1)[0] + " (x%d)" % len(grp),
                     len(grp), p.material, p.thickness, p.length, p.width, p.finish,
                     "; ".join(x.id for x in grp) + (f" | {p.notes}" if p.notes else "")])
    for h in m.hardware:
        rows.append([f"{m.product_id}-{h.id}", h.description, h.quantity, h.category, "", "", "", "",
                     f"{h.used_for} | {h.status}" + (f" | {h.notes}" if h.notes else "")])
    return rows


def cut_rows(m):
    rows = []
    for p in m.parts:
        if p.kind != "panel":
            continue
        e = p.edge_2d()
        bl, br = band_thk(e["left"][1], m.params), band_thk(e["right"][1], m.params)
        bb, bt = band_thk(e["bottom"][1], m.params), band_thk(e["top"][1], m.params)
        rows.append([p.id, p.name, 1, p.length, p.width, p.thickness, p.material,
                     {"length": "along length", "width": "along width", "none": "none"}[p.grain],
                     *(f"{c}:{band_thk(c, m.params):g}" if c not in NO_BAND else f"{c}:0"
                       for c in (e["top"][1], e["bottom"][1], e["left"][1], e["right"][1])),
                     round(p.length - bl - br, 1), round(p.width - bb - bt, 1), p.laminate or "-",
                     ";".join(f"{k}:R{v:g}" for k, v in p.corner_radii.items()) or "-",
                     f"length={p.length_axis.upper()}-axis; " + p.notes])
    return rows


CUT_HEADER = ["part_id", "part_name", "quantity", "length_mm", "width_mm", "thickness_mm", "material",
              "grain_direction", "edge_band_top", "edge_band_bottom", "edge_band_left", "edge_band_right",
              "cut_length_mm", "cut_width_mm", "laminate", "corner_radii", "notes"]
BOM_HEADER = ["item_id", "component_name", "quantity", "material", "thickness", "length", "width", "finish", "notes"]


def edge_rows(m):
    rows = []
    for p in m.parts:
        if p.kind != "panel":
            continue
        cr = p.corner_radii
        ends = {"bottom": ("bl", "br"), "top": ("tl", "tr"), "left": ("bl", "tl"), "right": ("br", "tr")}
        for e2d, (phys, cls) in p.edge_2d().items():
            ln = (p.length if e2d in ("top", "bottom") else p.width) - sum(cr.get(c, 0) for c in ends[e2d])
            rows.append([p.id, p.name, e2d, phys, cls, band_thk(cls, m.params), round(ln, 1), p.laminate,
                         {"EXPOSED": "Customer-visible: matching finish band",
                          "SEMI": "Visible inside bay/at reveal: thin band",
                          "CONCEALED": "Hidden by adjoining panel: no band",
                          "WALL": "Against wall: no band",
                          "FLOOR": "On floor: thin band to seal particle-board core against mopping water"}[cls]])
        for c, r_ in cr.items():
            cls = p.edge_2d()["bottom" if c[0] == "b" else "top"][1]
            rows.append([p.id, p.name, f"corner {c} R{r_:g}", "curved", cls, band_thk(cls, m.params),
                         round(math.pi * r_ / 2, 1), p.laminate,
                         "Curved edge: continuous band around radius (no joint at the corner)"])
    return rows


def write_all(m: ProductModel, folder: str) -> dict:
    paths = {}
    paths["bom"] = _write(os.path.join(folder, "BOM.csv"), BOM_HEADER, bom_rows(m))
    paths["cutlist"] = _write(os.path.join(folder, "CUTLIST.csv"), CUT_HEADER, cut_rows(m))
    paths["hardware"] = _write(os.path.join(folder, "HARDWARE.csv"),
                               ["hw_id", "category", "description", "quantity", "used_for", "status", "notes"],
                               [[h.id, h.category, h.description, h.quantity, h.used_for, h.status, h.notes] for h in m.hardware])
    er = edge_rows(m)
    paths["edge"] = _write(os.path.join(folder, "EDGE_BANDING.csv"),
                           ["part_id", "part_name", "edge_2d", "physical_edge", "edge_class", "band_thickness_mm",
                            "edge_length_mm", "band_colour_laminate", "rule"], er)
    # Pricing inputs (quantities only - no prices invented)
    area = {}
    for p in m.parts:
        if p.kind == "panel":
            k = f"{p.material} {p.thickness:g} mm {p.laminate}"
            area[k] = area.get(k, 0) + p.length * p.width / 1e6
    band = {}
    for r in er:
        if r[5] > 0:
            k = f"{r[5]:g} mm band {r[7]}"
            band[k] = band.get(k, 0) + r[6] / 1000
    rows = [["board_area_m2", k, round(v, 3)] for k, v in area.items()]
    rows += [["edge_band_m", k, round(v, 2)] for k, v in band.items()]
    rows += [["panel_count", "board parts", sum(1 for p in m.parts if p.kind == "panel")],
             ["hardware_lines", "items", len(m.hardware)]]
    paths["pricing"] = _write(os.path.join(folder, "PRICING_INPUTS.csv"), ["input", "key", "value"], rows)
    return paths
