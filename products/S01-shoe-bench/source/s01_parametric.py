"""S01 Shoe Bench - parametric source (canonical product definition).

Everything downstream (STEP, DXF, BOM, cut list, drawings, renders) is
derived from build(). Change a parameter here or pass overrides; never edit
exported files by hand.

Construction (all variants)
---------------------------
* Two full-height side panels stand on the floor (plinth-base construction).
* Bottom panel sits between the sides at PLINTH_HEIGHT.
* Front kick rail (recessed) + rear plinth rail sit under the bottom panel,
  between the sides, and bear on the floor: they carry bottom/partition load.
* Vertical partition(s) run bottom panel -> underside of seat top; they are
  the seat's intermediate supports (seat span <= MAX_SEAT_SPAN).
* Seat top (the "top") sits ON the sides and partitions, overhangs the front.
* Back panel is fixed over the rear edges of sides/top-underside, floor to
  underside of seat top (squares the carcass, takes racking).
* Shelves are loose, on 5 mm shelf pins (adjustable).
* Doors: full overlay, one per bay, push-to-open (no handles).
* Upholstered seat (SEAT_MODE=upholstered): 18 mm substrate top + separate
  cushion pad (ply base + foam + fabric) screwed up from below.
"""
from __future__ import annotations

import math
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from compiler.model import (CONCEALED, EXPOSED, FLOOR, SEMI, WALL, Hardware,  # noqa: E402
                            Part, ProductModel, box)

PRODUCT_ID = "S01"
PRODUCT_NAME = "Shoe Bench"

# --------------------------------------------------------------------------
# Parameters: default, limits, unit, meaning. Limits are DESIGN limits for
# v1, not structurally verified limits.
# --------------------------------------------------------------------------
PARAMETERS = {
    "WIDTH":                 {"default": 900, "min": 500, "max": 1200, "unit": "mm", "desc": "Overall width (seat top)"},
    "DEPTH":                 {"default": 350, "min": 300, "max": 420, "unit": "mm", "desc": "Overall depth incl. seat overhang"},
    "TOTAL_HEIGHT":          {"default": 450, "min": 420, "max": 480, "unit": "mm", "desc": "Floor to finished seating surface"},
    "BODY_HEIGHT":           {"default": None, "unit": "mm", "desc": "Derived: floor to underside of seat top"},
    "BOARD_THICKNESS":       {"default": 18, "options": [18], "unit": "mm", "desc": "Carcass/shelf/door board"},
    "BACK_PANEL_THICKNESS":  {"default": 6, "options": [6, 8, 9], "unit": "mm", "desc": "Back panel board"},
    "PLINTH_HEIGHT":         {"default": 75, "min": 60, "max": 100, "unit": "mm", "desc": "Floor to underside of bottom panel"},
    "PLINTH_RECESS":         {"default": 40, "min": 20, "max": 60, "unit": "mm", "desc": "Kick rail set-back from carcass front"},
    "SHELF_COUNT":           {"default": 1, "min": 0, "max": 2, "unit": "per bay", "desc": "Adjustable shelves per bay"},
    "SHELF_SPACING":         {"default": "auto", "unit": "mm", "desc": "'auto' = equal tiers, or a number = tier pitch from bottom panel"},
    "SHELF_SETBACK":         {"default": 15, "unit": "mm", "desc": "Shelf front edge set back from carcass front"},
    "DOOR_MODE":             {"default": "closed", "options": ["open", "closed", "mixed"], "desc": "open = no doors, closed = door per bay, mixed = first bay open"},
    "SEAT_MODE":             {"default": "wood", "options": ["wood", "upholstered"], "desc": "Seat finish"},
    "SEAT_THICKNESS":        {"default": 25, "options": [18, 25], "unit": "mm", "desc": "Seat top board (wood mode). Upholstered uses 18 substrate"},
    "SEAT_OVERHANG":         {"default": 10, "min": 0, "max": 25, "unit": "mm", "desc": "Seat top projection beyond door face"},
    "CUSHION_THICKNESS":     {"default": 40, "options": [30, 40, 50], "unit": "mm", "desc": "Foam (upholstered mode)"},
    "CUSHION_BASE_THICKNESS": {"default": 9, "unit": "mm", "desc": "Cushion ply base (upholstered mode)"},
    "MAX_SEAT_SPAN":         {"default": 450, "unit": "mm", "desc": "Max unsupported seat span between supports (ASSUMPTION)"},
    "DOOR_GAP":              {"default": 3, "unit": "mm", "desc": "Gap between doors / door to top"},
    "MATERIAL":              {"default": "BWP_PLY", "options": ["BWP_PLY", "HDHMR"], "desc": "Carcass/door substrate"},
    "FINISH":                {"default": "WALNUT", "options": ["WALNUT", "NATURAL_OAK", "ASH", "WARM_BEIGE", "MATTE_WHITE", "CHARCOAL"], "desc": "Exterior laminate/veneer"},
    "EDGE_BANDING_THICKNESS": {"default": 2.0, "unit": "mm", "desc": "Exposed edge band"},
    "EDGE_BANDING_INTERNAL":  {"default": 0.8, "unit": "mm", "desc": "Semi-exposed (internal) edge band"},
}

PRESETS = {
    "W600": {"WIDTH": 600},
    "W750": {"WIDTH": 750},
    "W900": {"WIDTH": 900},
    # CUSTOM: any WIDTH within PARAMETERS["WIDTH"] limits
}

VARIANTS = {
    "A": {"label": "Open shelves + wooden seat",   "DOOR_MODE": "open",   "SEAT_MODE": "wood"},
    "B": {"label": "Closed storage + wooden seat", "DOOR_MODE": "closed", "SEAT_MODE": "wood"},
    "C": {"label": "Closed storage + upholstered seat", "DOOR_MODE": "closed", "SEAT_MODE": "upholstered"},
    "D": {"label": "Mixed open/closed storage + wooden seat", "DOOR_MODE": "mixed", "SEAT_MODE": "wood"},
}
DEFAULT_VARIANT = "B"

MATERIALS = {
    "BWP_PLY": {"name": "BWP plywood IS:710, 18 mm, pre-laminated or site-laminated", "board": "BWP ply"},
    "HDHMR":   {"name": "HDHMR board, 18 mm, pre-laminated", "board": "HDHMR"},
    "BACK":    {"name": "HDHMR / ply back panel, laminate inner face", "board": "HDHMR back"},
    "FOAM":    {"name": "PU foam, 40 density (ASSUMPTION)", "board": "foam"},
}

FINISHES = {
    "WALNUT":      {"hex": "#7a5236", "label": "Walnut"},
    "NATURAL_OAK": {"hex": "#c49a6c", "label": "Natural oak"},
    "ASH":         {"hex": "#d8c3a0", "label": "Ash"},
    "WARM_BEIGE":  {"hex": "#d9c7ae", "label": "Warm beige"},
    "MATTE_WHITE": {"hex": "#ecebe6", "label": "Matte white"},
    "CHARCOAL":    {"hex": "#3b3b3d", "label": "Charcoal"},
}
INTERIOR_FINISH = "Off-white laminate (interior)"
INTERIOR_HEX = "#e9e3d8"
KICK_HEX = "#3b3b3d"
CUSHION_HEX = "#cdbb9c"

# Reference shoe envelope for capacity estimate (ASSUMPTION, adult pair).
SHOE_PAIR_W, SHOE_PAIR_L, SHOE_PAIR_H = 200, 300, 120
MIN_TIER_CLEAR = 125  # mm, min clear height for a tier to count as sneaker-capable


def resolve(variant: str = DEFAULT_VARIANT, **overrides) -> dict:
    p = {k: v["default"] for k, v in PARAMETERS.items()}
    p.update({k: v for k, v in VARIANTS[variant].items() if k != "label"})
    p.update(overrides)
    for k, spec in PARAMETERS.items():
        v = p[k]
        if isinstance(v, (int, float)) and "min" in spec and not (spec["min"] <= v <= spec["max"]):
            raise ValueError(f"{k}={v} outside v1 limits {spec['min']}..{spec['max']}")
        if "options" in spec and v not in spec["options"]:
            raise ValueError(f"{k}={v} not in {spec['options']}")
    p["PRODUCT_ID"] = PRODUCT_ID
    return p


def build(variant: str = DEFAULT_VARIANT, **overrides) -> ProductModel:
    p = resolve(variant, **overrides)
    W, D, H = p["WIDTH"], p["DEPTH"], p["TOTAL_HEIGHT"]
    t, tb = p["BOARD_THICKNESS"], p["BACK_PANEL_THICKNESS"]
    ph, gap = p["PLINTH_HEIGHT"], p["DOOR_GAP"]
    mat = MATERIALS[p["MATERIAL"]]["board"]
    fin_hex = FINISHES[p["FINISH"]]["hex"]
    fin = FINISHES[p["FINISH"]]["label"] + " laminate (exterior)"
    upholstered = p["SEAT_MODE"] == "upholstered"
    has_doors = p["DOOR_MODE"] in ("closed", "mixed")

    seat_t = t if upholstered else p["SEAT_THICKNESS"]
    cushion_stack = (p["CUSHION_THICKNESS"] + p["CUSHION_BASE_THICKNESS"]) if upholstered else 0
    body_h = H - cushion_stack - seat_t           # floor -> underside of top
    p["BODY_HEIGHT"] = body_h

    # Depth stack, front -> rear: [overhang][door][carcass][back]
    door_y0 = p["SEAT_OVERHANG"]
    car_y0 = door_y0 + (t if has_doors else 0)
    car_y1 = D - tb
    car_d = car_y1 - car_y0

    inner_w = W - 2 * t
    bays = max(1, math.ceil(inner_w / p["MAX_SEAT_SPAN"]))
    n_part = bays - 1
    bay_w = (inner_w - n_part * t) / bays
    bay_x = [t + i * (bay_w + t) for i in range(bays)]           # inner left x of each bay

    parts: list[Part] = []
    pid = iter(range(1, 100))

    def P(name, role, b, thk, length, **kw):
        parts.append(Part(id=f"{PRODUCT_ID}-P{next(pid):02d}", name=name, role=role, box=b,
                          thickness_axis=thk, length_axis=length, **kw))
        return parts[-1]

    side_edges_front = SEMI if p["DOOR_MODE"] == "closed" else EXPOSED
    # Sides
    for side, x0 in (("L", 0), ("R", W - t)):
        front_cls = SEMI if (p["DOOR_MODE"] == "closed" or (p["DOOR_MODE"] == "mixed" and side == "R")) else EXPOSED
        P(f"Side panel {side}", "side", box(x0, car_y0, 0, x0 + t, car_y1, body_h), "x", "z",
          material=mat, finish=fin + " outer / interior inner", color=fin_hex,
          edges={"front": front_cls, "rear": CONCEALED, "lower": FLOOR, "upper": CONCEALED},
          explode=(-160 if side == "L" else 160, 0, 0), assembly_step=1,
          notes="Front edge visible at door reveal; exposed if bay open")
    # Bottom
    bottom = P("Bottom panel", "bottom", box(t, car_y0, ph, W - t, car_y1, ph + t), "z", "x",
               material=mat, finish=INTERIOR_FINISH, color=INTERIOR_HEX,
               edges={"front": side_edges_front if p["DOOR_MODE"] == "closed" else EXPOSED,
                      "rear": CONCEALED, "left": CONCEALED, "right": CONCEALED},
               explode=(0, 0, -60), assembly_step=1)
    # Plinth rails
    ky0 = car_y0 + p["PLINTH_RECESS"]
    P("Kick rail (front plinth)", "kick", box(t, ky0, 0, W - t, ky0 + t, ph), "y", "x",
      material=mat, finish="Charcoal laminate", color=KICK_HEX,
      edges={"left": CONCEALED, "right": CONCEALED, "lower": FLOOR, "upper": CONCEALED},
      explode=(0, -140, -120), assembly_step=1, notes="Recessed toe-kick; bears on floor")
    P("Rear plinth rail", "plinth_rear", box(t, car_y1 - t, 0, W - t, car_y1, ph), "y", "x",
      material=mat, finish="Unfinished / balancing laminate", color="#8d7f6c",
      edges={"left": CONCEALED, "right": CONCEALED, "lower": FLOOR, "upper": CONCEALED},
      explode=(0, 140, -120), assembly_step=1, notes="Bears on floor; anti-tip bracket fixing zone")
    # Partitions
    for i in range(n_part):
        x0 = bay_x[i] + bay_w
        P(f"Partition {i + 1}", "partition", box(x0, car_y0, ph + t, x0 + t, car_y1, body_h), "x", "z",
          material=mat, finish=INTERIOR_FINISH, color=INTERIOR_HEX,
          edges={"front": SEMI if p["DOOR_MODE"] == "closed" else EXPOSED, "rear": CONCEALED,
                 "lower": CONCEALED, "upper": CONCEALED},
          explode=(0, 0, 40), assembly_step=2,
          notes="Seat intermediate support; carries load to bottom panel + plinth rails")
    # Shelves
    clear_lo, clear_hi = ph + t, body_h
    n_sh = p["SHELF_COUNT"]
    if p["SHELF_SPACING"] == "auto":
        tier = (clear_hi - clear_lo - n_sh * t) / (n_sh + 1)
        shelf_z = [clear_lo + (k + 1) * tier + k * t for k in range(n_sh)]
    else:
        shelf_z = [clear_lo + (k + 1) * p["SHELF_SPACING"] + k * t for k in range(n_sh)]
    shelf_clear = 1.0  # per side, for loose shelves on pins
    for b in range(bays):
        for k, z in enumerate(shelf_z):
            P(f"Shelf bay{b + 1}-{k + 1}", "shelf",
              box(bay_x[b] + shelf_clear, car_y0 + p["SHELF_SETBACK"], z,
                  bay_x[b] + bay_w - shelf_clear, car_y1, z + t), "z", "x",
              material=mat, finish=INTERIOR_FINISH, color=INTERIOR_HEX,
              edges={"front": SEMI if (p["DOOR_MODE"] == "closed" or (p["DOOR_MODE"] == "mixed" and b > 0)) else EXPOSED, "rear": CONCEALED,
                     "left": CONCEALED, "right": CONCEALED},
              explode=(0, -220, 0), assembly_step=4, notes="Loose shelf on 4 x 5 mm pins")
    # Back
    P("Back panel", "back", box(0, car_y1, 0, W, D, body_h), "y", "x",
      material=MATERIALS["BACK"]["board"], finish="Interior laminate inner face", color="#cfc6b6",
      grain="none", edges={"left": WALL, "right": WALL, "lower": FLOOR, "upper": CONCEALED},
      explode=(0, 220, 0), assembly_step=3,
      notes="Screwed to sides/bottom/partitions/rails. Ventilation slots: see validation (open item)")
    # Seat top
    P("Seat top", "top", box(0, 0, body_h, W, D, body_h + seat_t), "z", "x",
      material=mat if seat_t == t else f"{mat} {seat_t} mm",
      finish=fin if not upholstered else "Exterior laminate on visible edges",
      color=fin_hex,
      edges={"front": EXPOSED, "left": EXPOSED, "right": EXPOSED, "rear": WALL},
      explode=(0, 0, 200), assembly_step=3,
      notes=("Seating surface. " if not upholstered else "Upholstery substrate. ") +
            f"Overhangs door face by {p['SEAT_OVERHANG']} mm")
    if upholstered:
        inset = 10
        cz0 = body_h + seat_t
        P("Cushion base", "cushion_base",
          box(inset, inset, cz0, W - inset, D - inset, cz0 + p["CUSHION_BASE_THICKNESS"]), "z", "x",
          material=f"BWP ply {p['CUSHION_BASE_THICKNESS']} mm", finish="Wrapped in fabric", color="#a89a84",
          grain="none", edges={}, explode=(0, 0, 300), assembly_step=5,
          notes="Fabric wrapped and stapled underneath")
        P("Cushion foam", "cushion", box(inset, inset, cz0 + p["CUSHION_BASE_THICKNESS"],
                                          W - inset, D - inset, H), "z", "x",
          material=MATERIALS["FOAM"]["name"], finish="Upholstery fabric (TBD)", color=CUSHION_HEX,
          grain="none", kind="soft", explode=(0, 0, 360), assembly_step=5)
    # Doors
    door_bays = []
    if has_doors:
        door_bays = list(range(bays)) if p["DOOR_MODE"] == "closed" else list(range(1, bays))
        bounds = [0.0] + [bay_x[i] + bay_w + t / 2 for i in range(n_part)] + [float(W)]
        dz0, dz1 = ph, body_h - gap
        for b in door_bays:
            x0, x1 = bounds[b] + gap / 2, bounds[b + 1] - gap / 2
            hinge_left = b < bays / 2  # outer-hinged pairs
            w = x1 - x0
            if hinge_left:
                ob = box(x0 - t, door_y0 - w, dz0, x0, door_y0, dz1)
            else:
                ob = box(x1, door_y0 - w, dz0, x1 + t, door_y0, dz1)
            P(f"Door bay{b + 1}", "door", box(x0, door_y0, dz0, x1, door_y0 + t, dz1), "y", "z",
              material=mat, finish=fin, color=fin_hex,
              edges={"left": EXPOSED, "right": EXPOSED, "lower": EXPOSED, "upper": EXPOSED},
              explode=(0, -320, 0), open_box=ob, assembly_step=6,
              notes=f"Full overlay, push-to-open, hinged {'left' if hinge_left else 'right'}. Vertical grain")

    # ---------------- derived figures & design-rule checks ----------------
    tier_clear = []
    n_tiers = n_sh + 1
    edges_z = [clear_lo] + [z for z0 in shelf_z for z in (z0, z0 + t)] + [clear_hi]
    for k in range(n_tiers):
        tier_clear.append(round(edges_z[2 * k + 1] - edges_z[2 * k], 1))
    usable_depth = car_d
    shelf_depth = car_d - p["SHELF_SETBACK"]
    pairs_per_tier = int((bay_w) // SHOE_PAIR_W)
    tiers_ok = [c for c in tier_clear if c >= MIN_TIER_CLEAR]
    capacity = bays * pairs_per_tier * len(tiers_ok)
    door_w = [round(pp.length if pp.length_axis == 'x' else pp.width, 1) for pp in parts if pp.role == "door"]

    derived = {
        "BODY_HEIGHT": body_h, "bays": bays, "partitions": n_part, "bay_inner_width": round(bay_w, 1),
        "carcass_depth": car_d, "shelf_depth": shelf_depth, "shelf_z": [round(z, 1) for z in shelf_z],
        "tier_clear_heights": tier_clear, "seat_max_span": round(bay_w, 1),
        "shoe_pairs_per_tier_per_bay": pairs_per_tier,
        "estimated_capacity_pairs": capacity,
        "capacity_basis": f"pair envelope {SHOE_PAIR_W}W x {SHOE_PAIR_L}L x {SHOE_PAIR_H}H mm; tiers >= {MIN_TIER_CLEAR} mm clear",
        "door_widths": door_w,
    }
    checks = []

    def chk(name, ok, detail, severity="FAIL"):
        checks.append({"check": name, "result": "PASS" if ok else severity, "detail": detail})

    chk("Seat span <= MAX_SEAT_SPAN", bay_w <= p["MAX_SEAT_SPAN"],
        f"span {bay_w:.1f} mm vs limit {p['MAX_SEAT_SPAN']} mm (limit is an ASSUMPTION - needs load test)")
    chk("Shoe length fits carcass depth", usable_depth >= SHOE_PAIR_L,
        f"internal depth {usable_depth} mm vs {SHOE_PAIR_L} mm reference shoe", "WARN")
    chk("Shoe length fits shelf depth", shelf_depth >= SHOE_PAIR_L - 10,
        f"shelf depth {shelf_depth} mm; shoe may overhang shelf front by "
        f"{max(0, SHOE_PAIR_L - shelf_depth)} mm (door still clears: overhang < setback)", "WARN")
    chk("Every tier sneaker-capable", len(tiers_ok) == n_tiers,
        f"tier clear heights {tier_clear} mm vs min {MIN_TIER_CLEAR}", "WARN")
    if has_doors:
        chk("Door clears seat top", (body_h - (body_h - gap)) >= 2, f"{gap} mm gap under seat top")
        chk("Door clears floor", ph >= 10, f"door bottom at {ph} mm above floor (plinth zone)")
        chk("Door width practical (<= 600)", all(w <= 600 for w in door_w), f"door widths {door_w}")
    chk("Kick rail clear of door swing", True if not has_doors else p["PLINTH_RECESS"] >= 20,
        f"kick recessed {p['PLINTH_RECESS']} mm behind carcass front")

    # ---------------- hardware (generic, counts derived) ----------------
    joints = 2 + n_part          # top to sides + partitions
    joints += 2 + n_part         # bottom to sides + partitions
    joints += 4                  # kick + rear rail to sides
    n_doors = len(door_bays)
    back_perim = 2 * (W + body_h)
    back_screws = math.ceil(back_perim / 150) + n_part * math.ceil(body_h / 150) + 2 * math.ceil(W / 300)
    hw = [
        Hardware("H01", "Connector", "Cam-lock (minifix-type) connector set, 15 mm cam, for 18 mm board",
                 2 * joints, "Carcass joints (top/bottom/rails to sides and partitions)",
                 notes=f"{joints} joints x 2. Bore pattern depends on selected brand - NOT final"),
        Hardware("H02", "Dowel", "Fluted beech dowel 8 x 35 mm", 2 * joints, "Location at every cam-lock joint"),
        Hardware("H03", "Screw", "Chipboard screw 4 x 30 mm", 4 * 2 + 2 * n_part, "Bottom panel to plinth rails (from above, under shelves)"),
        Hardware("H04", "Screw", "Panhead screw 3.5 x 16 mm", back_screws, "Back panel fixing @ <=150 mm pitch"),
        Hardware("H05", "Shelf support", "Shelf pin 5 mm, metal", 4 * n_sh * bays, "Adjustable shelves",
                 notes="System-32 line holes assumed - confirm with machine"),
        Hardware("H06", "Floor contact", "Adhesive felt/PVC floor protector pads", 4 + 2, "Under sides and plinth rails"),
        Hardware("H07", "Anti-tip", "Wall anti-tip bracket + 6 mm wall plug and screw", 1, "Rear plinth rail to wall",
                 notes="Recommended for seat furniture; installer to fit"),
    ]
    if n_doors:
        hw += [
            Hardware("H08", "Hinge", "35 mm cup concealed hinge, full overlay, 110 deg, non-spring (for push-to-open), with mounting plate",
                     2 * n_doors, "Doors (2 per door, door height < 900 mm)",
                     notes="Cup boring position from selected hinge datasheet - NOT final"),
            Hardware("H09", "Push latch", "Push-to-open magnetic latch / tip-on unit", n_doors, "Doors"),
            Hardware("H10", "Bumper", "Self-adhesive silicone door bumper 8 mm", 2 * n_doors, "Doors"),
        ]
    if upholstered:
        hw += [
            Hardware("H11", "Screw", "Chipboard screw 4 x 25 mm", 6 + 2 * n_part, "Cushion base fixed from below through seat substrate"),
            Hardware("H12", "Upholstery", "Upholstery fabric (TBD), approx. area m2",
                     1, "Cushion", notes=f"~{((W + 2 * 60) * (D + 2 * 60)) / 1e6:.2f} m2 incl. wrap allowance"),
            Hardware("H13", "Upholstery", "Staples 10 mm + spray adhesive", 1, "Cushion"),
        ]
    hw.append(Hardware("H14", "Ventilation", "Vent grommet / slot pattern in back panel", 0, "Odour ventilation",
                       status="OPEN - founder decision", notes="Not modelled in v1"))

    proxies = []
    for b in range(bays):
        for k in range(n_tiers):
            if tier_clear[k] < MIN_TIER_CLEAR:
                continue
            z0 = edges_z[2 * k]
            for s in range(pairs_per_tier):
                x0 = bay_x[b] + 8 + s * (SHOE_PAIR_W + 4)
                proxies.append(Part(id=f"PROXY-{b}{k}{s}", name="Shoe envelope", role="proxy",
                                    box=box(x0, car_y0 + 6, z0, x0 + SHOE_PAIR_W - 8, car_y0 + 6 + SHOE_PAIR_L - 10,
                                            z0 + min(SHOE_PAIR_H, tier_clear[k] - 10)),
                                    thickness_axis="z", length_axis="x", material="-", finish="-",
                                    color="#9fb3c2", kind="proxy"))

    steps = {1: "Carcass base: sides + bottom panel + kick rail + rear plinth rail (cam-lock + dowels)",
             2: "Insert partition(s) onto bottom panel",
             3: "Fit seat top onto sides/partitions; square carcass and fix back panel",
             4: "Insert shelf pins and loose shelves",
             5: "Fix cushion pad from below (upholstered only)",
             6: "Hang doors, fit push latches, adjust reveals to 3 mm"}

    return ProductModel(PRODUCT_ID, PRODUCT_NAME, variant, p, parts, hw, proxies, derived, checks,
                        {k: v for k, v in steps.items() if any(pp.assembly_step == k for pp in parts)})


# --------------------------------------------------------------------------
# Product metadata consumed by the compiler (product.json / website)
# --------------------------------------------------------------------------
CATEGORY = "Shoe Storage / Entryway Furniture"
VERSION = "1.0.0-dm1"
WEBSITE = {
    "slug": "/shoe-bench",
    "title": "Shoe Bench - Made-to-Measure Entryway Seating with Shoe Storage | AlterCraft",
    "short_description": "A compact entryway bench: sit to put on shoes, store them below. "
                         "Built to your width (600-900 mm presets or custom) in ply or HDHMR "
                         "with laminate finishes.",
    "tagline": "SIT. STORE. ARRIVE.",
    "target_queries": ["shoe bench", "shoe rack seating"],
}
MANUFACTURING_METHOD = {
    "construction": "Flat-pack-capable panel carcass, plinth base, cam-lock + dowel joints",
    "processes": ["panel sizing (beam/panel saw or CNC nesting)", "edge banding",
                  "line boring for shelf pins (System 32 assumed)", "connector boring (per selected hardware)",
                  "hinge cup boring 35 mm (per selected hinge)", "assembly", "QC"],
    "release_status": "DIGITAL MASTER v1 - not released for production",
}
CUSTOM_TEST_WIDTHS = [1100]
