"""Validation pass: re-reads the exported files and cross-checks them
against the parametric model. Generic for any box-panel ProductModel."""
from __future__ import annotations

import csv
import glob
import itertools
import os

from .cad import read_dxf_extents, reimport_step
from .model import ProductModel

TOL = 0.05


def _ov(a, b):
    v = 1.0
    for i in range(3):
        d = min(a[i + 3], b[i + 3]) - max(a[i], b[i])
        if d <= TOL:
            return 0.0
        v *= d
    return v


def validate(m: ProductModel, step_path, cut_csv, bom_csv, dxf_dir) -> list[dict]:
    R = []

    def r(n, ok, detail):
        R.append({"check": n, "result": "PASS" if ok else "FAIL", "detail": detail})

    p = m.params
    # 1/2 STEP
    ok = os.path.isfile(step_path) and os.path.getsize(step_path) > 1000
    r("1 STEP exists & non-empty", ok, f"{os.path.basename(step_path)} {os.path.getsize(step_path) if ok else 0} bytes")
    info = reimport_step(step_path)
    ov = m.overall()
    bb_ok = all(abs(a - b) < 0.05 for a, b in zip(info["bbox"], ov))
    r("2 STEP re-imports (OCC) with all solids", info["solids"] == len(m.parts) and bb_ok,
      f"{info['solids']} solids (model {len(m.parts)}); bbox {info['bbox']}")
    vol = sum((q.box[3] - q.box[0]) * (q.box[4] - q.box[1]) * (q.box[5] - q.box[2]) for q in m.parts)
    r("2b STEP volume equals model volume", abs(info["volume"] - vol) / vol < 1e-6,
      f"STEP {info['volume'] / 1e6:.4f} dm3 vs model {vol / 1e6:.4f} dm3")
    # 3 dimensions
    dims = (ov[3] - ov[0], ov[4] - ov[1], ov[5] - ov[2])
    exp = (p["WIDTH"], p["DEPTH"], p["TOTAL_HEIGHT"])
    r("3 Overall dims match parameters", all(abs(a - b) < TOL for a, b in zip(dims, exp)),
      f"model {dims} vs params W/D/H {exp}")
    # 4 intersections / duplicates
    clashes = [(a.id, b.id, round(_ov(a.box, b.box))) for a, b in itertools.combinations(m.parts, 2) if _ov(a.box, b.box) > 0]
    dups = [(a.id, b.id) for a, b in itertools.combinations(m.parts, 2) if a.box == b.box]
    r("4 No intersecting / duplicate parts", not clashes and not dups, f"clashes {clashes} dups {dups}")
    if any(q.open_box for q in m.parts):
        opened = [q.open_box or q.box for q in m.parts]
        oc = [(m.parts[i].id, m.parts[j].id) for i, j in itertools.combinations(range(len(opened)), 2)
              if _ov(opened[i], opened[j]) > 0]
        r("4b Doors at 90 deg clear the carcass (open pose)", not oc, f"clashes {oc}")
    # 5 cut list vs CAD
    rows = list(csv.DictReader(open(cut_csv)))
    panels = {q.id: q for q in m.parts if q.kind == "panel"}
    bad = [rw["part_id"] for rw in rows if rw["part_id"] not in panels or
           abs(float(rw["length_mm"]) - panels[rw["part_id"]].length) > TOL or
           abs(float(rw["width_mm"]) - panels[rw["part_id"]].width) > TOL or
           abs(float(rw["thickness_mm"]) - panels[rw["part_id"]].thickness) > TOL]
    r("5 Cut list matches CAD panel sizes", not bad and len(rows) == len(panels),
      f"{len(rows)} rows / {len(panels)} panels; mismatches {bad}")
    # 6 BOM quantities
    brows = list(csv.DictReader(open(bom_csv)))
    comp = [b for b in brows if "-B" in b["item_id"]]
    q = sum(int(b["quantity"]) for b in comp)
    ids = set(i.split(" |")[0] for b in comp for i in b["notes"].split(" |")[0].split("; "))
    r("6 BOM component quantities = modelled parts", q == len(m.parts) and ids == {x.id for x in m.parts},
      f"BOM qty {q}, model parts {len(m.parts)}")
    # 7 DXF
    files = sorted(glob.glob(os.path.join(dxf_dir, "*.dxf")))
    dbad = []
    for f in files:
        pid = os.path.basename(f).split("_")[0]
        L, Wd, layers = read_dxf_extents(f)
        pp = panels.get(pid)
        if not pp or abs(L - pp.length) > TOL or abs(Wd - pp.width) > TOL or layers != {"OUTLINE"}:
            dbad.append(os.path.basename(f))
    r("7 DXF outlines match parts (layer OUTLINE only)", not dbad and len(files) == len(panels),
      f"{len(files)} DXF / {len(panels)} panels; bad {dbad}")
    # 8 IDs
    pids = [x.id for x in m.parts]
    ok = len(set(pids)) == len(pids) and all(x.startswith(m.product_id + "-") for x in pids) \
        and m.product_id in os.path.basename(step_path)
    r("8 IDs unique & consistent with product", ok, f"{len(pids)} part ids, prefix {m.product_id}-")
    # product design-rule checks
    for c in m.checks:
        R.append({"check": "DR " + c["check"], "result": c["result"], "detail": c["detail"]})
    return R
