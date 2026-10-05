"""AlterCraft Product Compiler CLI.

    python3 -m compiler.compile S01-shoe-bench            # full master build + validation

Loads products/<folder>/source/*_parametric.py and derives every artifact.
"""
from __future__ import annotations

import datetime
import glob
import importlib.util
import json
import os
import shutil
import sys

from . import cad, drawings, manufacturing, render, validate

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load_source(folder):
    src = glob.glob(os.path.join(ROOT, folder, "source", "*_parametric.py"))[0]
    spec = importlib.util.spec_from_file_location("product_source", src)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod, os.path.relpath(src, os.path.join(ROOT, folder))


def export_set(m, out, with_dxf=True):
    paths = {"step": cad.export_step(m, os.path.join(out, "master", f"{m.tag}.step"))}
    paths.update(manufacturing.write_all(m, os.path.join(out, "manufacturing")))
    dxf_dir = os.path.join(out, "cnc")
    if with_dxf:
        shutil.rmtree(dxf_dir, ignore_errors=True)
        paths["dxf"] = cad.export_part_dxfs(m, dxf_dir)
    paths["validation"] = validate.validate(m, paths["step"], paths["cutlist"], paths["bom"], dxf_dir)
    return paths


def product_json(mod, m, rel_src):
    P = mod.PARAMETERS
    return {
        "product_id": mod.PRODUCT_ID, "name": mod.PRODUCT_NAME, "category": mod.CATEGORY, "version": mod.VERSION,
        "status": "DIGITAL_MASTER_v1 (not released for production)",
        "default_variant": mod.DEFAULT_VARIANT,
        "dimensions": {"width": m.params["WIDTH"], "depth": m.params["DEPTH"], "total_height": m.params["TOTAL_HEIGHT"],
                       "body_height": m.params["BODY_HEIGHT"], "unit": "mm"},
        "parameter_limits": {k: {kk: vv for kk, vv in v.items() if kk in ("min", "max", "options", "unit")}
                             for k, v in P.items() if any(x in v for x in ("min", "options"))},
        "presets": {**mod.PRESETS, "CUSTOM": {"WIDTH": f"{P['WIDTH']['min']}-{P['WIDTH']['max']}"}},
        "materials": mod.MATERIALS, "finishes": mod.FINISHES,
        "components": [{"part_id": p.id, "name": p.name, "role": p.role, "material": p.material,
                        "size_mm": [p.length, p.width, p.thickness]} for p in m.parts],
        "variant_options": mod.VARIANTS,
        "derived": m.derived,
        "manufacturing_method": mod.MANUFACTURING_METHOD,
        "bom_reference": "manufacturing/BOM.csv", "cutlist_reference": "manufacturing/CUTLIST.csv",
        "hardware_reference": "manufacturing/HARDWARE.csv", "edge_banding_reference": "manufacturing/EDGE_BANDING.csv",
        "cad_reference": {"source": rel_src, "step": f"master/{m.tag}.step", "glb": f"master/{m.tag}.glb",
                          "dxf_dir": "cnc/"},
        "website": mod.WEBSITE,
    }


def main(folder="S01-shoe-bench"):
    mod, rel_src = load_source(folder)
    out = os.path.join(ROOT, folder)
    m = mod.build(mod.DEFAULT_VARIANT)
    print("master", m.tag)
    paths = export_set(m, out)
    cad.export_mesh(m, os.path.join(out, "master", f"{m.tag}.glb"))
    cad.export_mesh(m, os.path.join(out, "master", f"{m.tag}.stl"))
    os.makedirs(os.path.join(out, "config"), exist_ok=True)
    json.dump(product_json(mod, m, rel_src), open(os.path.join(out, "config", "product.json"), "w"), indent=2)
    json.dump({"resolved": m.params, "spec": mod.PARAMETERS}, open(os.path.join(out, "config", "parameters.json"), "w"), indent=2)

    # renders
    rd = os.path.join(out, "renders")
    os.makedirs(rd, exist_ok=True)
    R = lambda n, **kw: render.render(m, os.path.join(rd, n), **kw)  # noqa: E731
    R("01_hero_45.png", view="hero")
    R("02_front.png", view="front")
    R("03_side.png", view="side")
    R("04_open_storage.png", view="hero", state="open", show_proxies=True,
      title="Open / storage - blue blocks = reference shoe-pair envelopes (not product parts)")
    R("05_detail.png", view="detail")
    R("07_exploded.png", view="iso", explode=1.0, labels=True, title="Exploded assembly")
    if any(p.kind == "light" for p in m.parts):
        R("08_night_plinth_light.png", view="hero", night=True, cam_override=dict(az=-30, el=14))
        R("09_night_open_interior_light.png", view="hero", state="open", night=True)
    # variant renders (same source, other parameters)
    for v in mod.VARIANTS:
        mv = mod.build(v)
        render.render(mv, os.path.join(rd, f"variant_{v}.png"), view="hero", state="closed",
                      title=f"S01-{v}  {mod.VARIANTS[v]['label']}")
    # drawings
    dd = os.path.join(out, "drawings")
    os.makedirs(dd, exist_ok=True)
    drawings.general_dimensions(m, os.path.join(dd, "S01_GENERAL_DIMENSIONS.pdf"),
                                os.path.join(dd, "S01_GENERAL_DIMENSIONS.svg"))
    shutil.copy(os.path.join(dd, "S01_GENERAL_DIMENSIONS.svg"), os.path.join(rd, "06_dimensions.svg"))
    drawings.image_sheets(m, os.path.join(dd, "S01_EXPLODED.pdf"), "EXPLODED VIEW",
                          [(os.path.join(rd, "07_exploded.png"), "Exploded view - part IDs match CUTLIST.csv / BOM.csv")])
    steps = []
    tmp = os.path.join(out, "drawings", "_steps")
    os.makedirs(tmp, exist_ok=True)
    for k, txt in m.assembly_steps.items():
        f = os.path.join(tmp, f"step{k}.png")
        render.render(m, f, view="iso", highlight=k, labels=True, title=f"Step {k}: {txt}")
        steps.append((f, f"Step {k}: {txt}"))
    drawings.image_sheets(m, os.path.join(dd, "S01_ASSEMBLY.pdf"), "ASSEMBLY SEQUENCE", steps)
    shutil.rmtree(tmp)

    # width sweep validation
    sweep = {}
    for w in (600, 750, 900):
        for v in mod.VARIANTS:
            mv = mod.build(v, WIDTH=w)
            vo = os.path.join(out, "validation", "builds", mv.tag)
            pv = export_set(mv, vo, with_dxf=True)
            sweep[mv.tag] = (mv, pv["validation"])
    for w in getattr(mod, "CUSTOM_TEST_WIDTHS", []):  # CUSTOM width regeneration test
        mv = mod.build(mod.DEFAULT_VARIANT, WIDTH=w)
        pv = export_set(mv, os.path.join(out, "validation", "builds", mv.tag))
        sweep[mv.tag] = (mv, pv["validation"])
    write_report(mod, m, paths["validation"], sweep, os.path.join(out, "validation", "validation_report.md"))
    from . import marketplace
    marketplace.build_set(m, os.path.join(rd, "marketplace"))
    print("done")


def write_report(mod, m, master_val, sweep, path):
    L = [f"# {mod.PRODUCT_ID} {mod.PRODUCT_NAME} - Validation Report", "",
         f"Generated {datetime.datetime.utcnow():%Y-%m-%d %H:%M} UTC by `products/compiler` (CadQuery/OpenCascade). "
         "Every check re-reads the exported file (STEP re-imported through OCC, DXF re-read with ezdxf, CSV re-parsed).", "",
         f"Version {mod.VERSION}. Status: **DIGITAL MASTER - geometry & data consistency validated. NOT structurally validated. "
         "NOT released for CNC.**", "",
         f"## Master ({m.tag})", "", "| Check | Result | Detail |", "|---|---|---|"]
    L += [f"| {c['check']} | {c['result']} | {c['detail']} |" for c in master_val]
    L += ["", "## Width x variant sweep (each build regenerated from parameters and fully re-exported)", "",
          "| Build | Parts | Bays | Seat span | Tier clear (mm) | Est. pairs | Data checks | Design-rule | Overall W x D x H |",
          "|---|---|---|---|---|---|---|---|---|"]
    for tag, (mv, val) in sweep.items():
        data = [c for c in val if not c["check"].startswith("DR")]
        dr = [c for c in val if c["check"].startswith("DR")]
        o = mv.overall()
        fails = [c["check"] for c in data if c["result"] != "PASS"]
        warns = [c["check"][3:] + ":" + c["result"] for c in dr if c["result"] != "PASS"]
        L.append(f"| {tag} | {len(mv.parts)} | {mv.derived['bays']} | {mv.derived['seat_max_span']} | "
                 f"{mv.derived['tier_clear_heights']} | {mv.derived['estimated_capacity_pairs']} | "
                 f"{'ALL PASS (' + str(len(data)) + ')' if not fails else 'FAIL: ' + ', '.join(fails)} | "
                 f"{'PASS' if not warns else '; '.join(warns)} | {o[3] - o[0]:g} x {o[4] - o[1]:g} x {o[5] - o[2]:g} |")
    L += ["", "Per-build STEP / CSV / DXF are in `validation/builds/<tag>/`.", "",
          "## Not validated by this pass (requires fabrication review)", "",
          "- Seat load capacity / deflection of the seat top and partition load path (no FEA, no physical test).",
          f"- `MAX_SEAT_SPAN = {m.params['MAX_SEAT_SPAN']} mm` is an engineering assumption, not a tested limit.",
          "- Cam-lock / dowel / hinge / shelf-pin boring: hardware not selected, so no boring is in the DXFs.",
          "- Tolerances, pre-milling allowance for edge banding, saw kerf, nesting: not applied.",
          "- CNC toolpaths: none generated. DXFs are outlines for CAM preparation only.",
          "- Back-panel ventilation for shoe odour: not modelled (open decision).",
          "- Shoe capacity uses an assumed pair envelope; confirm with a physical mock-up.",
          "- Particle board: seat-top creep/sag under repeated sitting, screw-holding in PB edges, and hinge-plate "
          "fixing (euro screws / dowel plates) must be proven on the prototype.",
          f"- Curved banding: MIN_BAND_RADIUS = {m.params.get('MIN_BAND_RADIUS')} mm is an assumption - confirm on the edge bander.",
          "- LED lighting: 24 V SELV only; driver, sensor and cable selection, heat and wiring route need electrical review. "
          "Back-panel grommet hole not yet modelled."]
    open(path, "w").write("\n".join(L) + "\n")


if __name__ == "__main__":
    main(*sys.argv[1:])
