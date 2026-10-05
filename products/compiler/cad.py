"""CAD export: STEP assembly, STL, per-part DXF. Engine: CadQuery / OpenCascade."""
from __future__ import annotations

import os

import cadquery as cq
import ezdxf

from .model import ProductModel, Part


AX = "xyz"


def corner_point(p: Part, corner: str):
    """3D (length-axis, width-axis) coordinates of a 2D corner bl/br/tl/tr."""
    li, wi = AX.index(p.length_axis), AX.index(p.width_axis)
    lv = p.box[li + 3] if corner[1] == "r" else p.box[li]
    wv = p.box[wi + 3] if corner[0] == "t" else p.box[wi]
    return li, lv, wi, wv


def solid_of(p: Part, b=None) -> cq.Solid:
    x0, y0, z0, x1, y1, z1 = b or p.box
    s = cq.Solid.makeBox(x1 - x0, y1 - y0, z1 - z0, cq.Vector(x0, y0, z0))
    if b is None and p.corner_radii:
        ti = AX.index(p.thickness_axis)
        for corner, r in p.corner_radii.items():
            li, lv, wi, wv = corner_point(p, corner)
            for e in s.Edges():
                c = e.Center().toTuple()
                d = [abs(a - b_) for a, b_ in zip(e.startPoint().toTuple(), e.endPoint().toTuple())]
                if d[ti] > 1 and abs(c[li] - lv) < 1e-3 and abs(c[wi] - wv) < 1e-3:
                    s = s.fillet(r, [e])
                    break
    return s


def _solid(p: Part) -> cq.Workplane:
    return cq.Workplane("XY").add(solid_of(p))


def mesh_of(p: Part, b=None, tol=0.4):
    """List of (triangles Nx3x3, face_id) per B-rep face, for the renderer."""
    out = []
    for f in solid_of(p, b).Faces():
        v, t = f.tessellate(tol, 0.2)
        V = [x.toTuple() for x in v]
        out.append([[V[i] for i in tri] for tri in t])
    return out


def _rgb(hexs: str):
    h = hexs.lstrip("#")
    return cq.Color(*(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)))


def assembly(m: ProductModel) -> cq.Assembly:
    a = cq.Assembly(name=m.tag)
    for p in m.parts:
        if p.kind == "proxy":
            continue
        a.add(_solid(p), name=f"{p.id}_{p.name.replace(' ', '_')}", color=_rgb(p.color))
    return a


def export_step(m: ProductModel, path: str) -> str:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    assembly(m).save(path, exportType="STEP")
    return path


def export_mesh(m: ProductModel, path: str) -> str:
    """STL (single mesh) or GLB (coloured assembly) chosen by extension."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if path.endswith(".glb") or path.endswith(".gltf"):
        assembly(m).save(path)
    else:
        comp = cq.Compound.makeCompound([solid_of(p) for p in m.parts])
        cq.exporters.export(comp, path, tolerance=0.1)
    return path


def reimport_step(path: str) -> dict:
    shape = cq.importers.importStep(path)
    solids = shape.solids().vals()
    bb = shape.val().BoundingBox() if len(shape.vals()) == 1 else cq.Compound.makeCompound(shape.vals()).BoundingBox()
    return {"solids": len(solids),
            "bbox": (round(bb.xmin, 2), round(bb.ymin, 2), round(bb.zmin, 2),
                     round(bb.xmax, 2), round(bb.ymax, 2), round(bb.zmax, 2)),
            "volume": sum(s.Volume() for s in solids)}


def export_part_dxfs(m: ProductModel, folder: str) -> list[str]:  # noqa: C901
    """One DXF per board part: finished outline on layer OUTLINE (2D frame:
    X = cut-list length, Y = cut-list width, origin at lower-left).
    Hardware boring is intentionally NOT included (no hardware selected)."""
    os.makedirs(folder, exist_ok=True)
    out = []
    for p in m.parts:
        if p.kind != "panel":
            continue
        doc = ezdxf.new("R2010", setup=False)
        doc.units = ezdxf.units.MM
        doc.layers.add("OUTLINE", color=7)
        msp = doc.modelspace()
        L, Wd = p.length, p.width
        r = {k: p.corner_radii.get(k, 0) for k in ("bl", "br", "tr", "tl")}
        B = 0.41421356237  # tan(90deg/4): CCW quarter arc
        pts = [(r["bl"], 0, 0), (L - r["br"], 0, B if r["br"] else 0)]
        if r["br"]:
            pts.append((L, r["br"], 0))
        pts.append((L, Wd - r["tr"], B if r["tr"] else 0))
        if r["tr"]:
            pts.append((L - r["tr"], Wd, 0))
        pts.append((r["tl"], Wd, B if r["tl"] else 0))
        if r["tl"]:
            pts.append((0, Wd - r["tl"], 0))
        pts.append((0, r["bl"], B if r["bl"] else 0))
        if not r["bl"]:
            pts = pts[:-1]
        msp.add_lwpolyline(pts, format="xyb", close=True, dxfattribs={"layer": "OUTLINE"})
        doc.header["$INSUNITS"] = 4
        fn = os.path.join(folder, f"{p.id}_{p.role}_{p.name.replace(' ', '_')}_{L:g}x{Wd:g}x{p.thickness:g}.dxf")
        doc.saveas(fn)
        out.append(fn)
    return out


def read_dxf_extents(path: str) -> tuple:
    doc = ezdxf.readfile(path)
    from ezdxf import bbox
    ext = bbox.extents(doc.modelspace())
    arcs = sum(1 for e in doc.modelspace() for v in e.get_points("xyb") if v[2])
    return (round(ext.size.x, 3), round(ext.size.y, 3), {e.dxf.layer for e in doc.modelspace()}, arcs)
