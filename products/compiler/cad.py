"""CAD export: STEP assembly, STL, per-part DXF. Engine: CadQuery / OpenCascade."""
from __future__ import annotations

import os

import cadquery as cq
import ezdxf

from .model import ProductModel, Part


def _solid(p: Part) -> cq.Workplane:
    x0, y0, z0, x1, y1, z1 = p.box
    return cq.Workplane("XY").box(x1 - x0, y1 - y0, z1 - z0, centered=False).translate((x0, y0, z0))


def _rgb(hexs: str):
    h = hexs.lstrip("#")
    return cq.Color(*(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)))


def assembly(m: ProductModel) -> cq.Assembly:
    a = cq.Assembly(name=m.tag)
    for p in m.parts:
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
        comp = cq.Compound.makeCompound([_solid(p).val() for p in m.parts])
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


def export_part_dxfs(m: ProductModel, folder: str) -> list[str]:
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
        msp.add_lwpolyline([(0, 0), (L, 0), (L, Wd), (0, Wd)], close=True, dxfattribs={"layer": "OUTLINE"})
        doc.header["$INSUNITS"] = 4
        fn = os.path.join(folder, f"{p.id}_{p.role}_{p.name.replace(' ', '_')}_{L:g}x{Wd:g}x{p.thickness:g}.dxf")
        doc.saveas(fn)
        out.append(fn)
    return out


def read_dxf_extents(path: str) -> tuple:
    doc = ezdxf.readfile(path)
    pts = [v for e in doc.modelspace() for v in e.get_points("xy")]
    xs, ys = [v[0] for v in pts], [v[1] for v in pts]
    return round(max(xs) - min(xs), 3), round(max(ys) - min(ys), 3), {e.dxf.layer for e in doc.modelspace()}
