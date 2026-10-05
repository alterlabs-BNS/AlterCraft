"""Core data model shared by every AlterCraft product.

Coordinate system (mm), right-handed:
  X = width  (left -> right, viewed from the front)
  Y = depth  (front -> rear / wall)
  Z = height (floor -> up)
Every part is an axis-aligned board, optionally with radiused corners in its
own plane (CNC-routed). Boards stay flat rectangles-with-radii on purpose:
that is what a panel saw / CNC router + edge bander can make from
pre-laminated particle board, and it keeps BOM / cut list / DXF exact.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

AXES = "xyz"

# Edge classes for the banding schedule.
EXPOSED = "EXPOSED"      # visible to the customer, full-thickness band
SEMI = "SEMI"            # visible only when a door is open / inside a bay
CONCEALED = "CONCEALED"  # hidden by another panel, no band
WALL = "WALL"            # faces the wall, no band
FLOOR = "FLOOR"          # sits on the floor: thin band to SEAL the particle board core (wet mopping)
NO_BAND = {CONCEALED, WALL}

# Physical face names by axis direction.
FACE_NAMES = {("x", 0): "left", ("x", 1): "right",
              ("y", 0): "front", ("y", 1): "rear",
              ("z", 0): "lower", ("z", 1): "upper"}

Box = Tuple[float, float, float, float, float, float]  # x0,y0,z0,x1,y1,z1


@dataclass
class Part:
    id: str                       # e.g. S01-P01
    name: str                     # e.g. "Side panel L"
    role: str                     # e.g. side, top, bottom, shelf, door ...
    box: Box
    thickness_axis: str           # axis through the board thickness
    length_axis: str              # axis the cut-list "length" runs along
    material: str
    finish: str
    grain: str = "length"         # length | width | none
    edges: Dict[str, str] = field(default_factory=dict)  # physical face -> edge class
    kind: str = "panel"           # panel (board -> cut list/DXF) | soft (foam) | light (LED profile) | proxy
    laminate: str = ""            # ONE laminate code per part (no collage within a piece)
    corner_radii: Dict[str, float] = field(default_factory=dict)  # 2D corners bl/br/tl/tr -> radius mm
    light_dir: str = ""           # for kind=light: "down" (emits towards -Z)
    color: str = "#b08a62"
    explode: Tuple[float, float, float] = (0.0, 0.0, 0.0)
    open_box: Optional[Box] = None   # pose in the "open" state (doors)
    assembly_step: int = 1
    notes: str = ""

    # ---- geometry helpers -------------------------------------------------
    def size(self, axis: str) -> float:
        i = AXES.index(axis)
        return round(self.box[i + 3] - self.box[i], 3)

    @property
    def width_axis(self) -> str:
        return next(a for a in AXES if a not in (self.thickness_axis, self.length_axis))

    @property
    def length(self) -> float:
        return self.size(self.length_axis)

    @property
    def width(self) -> float:
        return self.size(self.width_axis)

    @property
    def thickness(self) -> float:
        return self.size(self.thickness_axis)

    @property
    def volume(self) -> float:
        import math
        cut = sum((1 - math.pi / 4) * r * r for r in self.corner_radii.values())
        return (self.length * self.width - cut) * self.thickness

    def edge_2d(self) -> Dict[str, Tuple[str, str]]:
        """Map the four board edges onto the 2D cut-list / DXF frame.

        2D frame: X = length axis, Y = width axis.
        left/right = ends of the length (x-/x+), bottom/top = y-/y+.
        Returns {"left": (physical_face, edge_class), ...}.
        """
        out = {}
        for name2d, axis, end in (("left", self.length_axis, 0), ("right", self.length_axis, 1),
                                  ("bottom", self.width_axis, 0), ("top", self.width_axis, 1)):
            phys = FACE_NAMES[(axis, end)]
            out[name2d] = (phys, self.edges.get(phys, CONCEALED))
        return out


@dataclass
class Hardware:
    id: str
    category: str
    description: str
    quantity: int
    used_for: str
    status: str = "GENERIC - model not selected"
    notes: str = ""


@dataclass
class ProductModel:
    product_id: str
    name: str
    variant: str
    params: dict
    parts: List[Part]
    hardware: List[Hardware]
    proxies: List[Part] = field(default_factory=list)   # non-product display geometry (shoe envelopes)
    derived: dict = field(default_factory=dict)          # computed figures (capacity, clearances ...)
    checks: List[dict] = field(default_factory=list)     # product-specific design-rule results
    assembly_steps: Dict[int, str] = field(default_factory=dict)

    @property
    def tag(self) -> str:
        return f"{self.product_id}-{self.variant}-W{int(self.params['WIDTH'])}"

    def overall(self) -> Box:
        bs = [p.box for p in self.parts]
        return (min(b[0] for b in bs), min(b[1] for b in bs), min(b[2] for b in bs),
                max(b[3] for b in bs), max(b[4] for b in bs), max(b[5] for b in bs))


def box(x0, y0, z0, x1, y1, z1) -> Box:
    return tuple(round(v, 3) for v in (x0, y0, z0, x1, y1, z1))
