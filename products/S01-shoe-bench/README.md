# S01 Shoe Bench: DIGITAL MASTER v1

**SIT. STORE. ARRIVE.** Compact entryway bench with closed shoe storage.

Status: geometry and data consistency are validated. The design is **not** structurally validated and **not released for CNC**.
See `validation/validation_report.md`.

| Folder | Contents |
|---|---|
| `source/s01_parametric.py` | Canonical parametric definition: parameters, variants A–D, construction, design rules, hardware |
| `master/` | `S01-B-W900.step` (master assembly, 12 named solids), `.glb`, `.stl` |
| `cnc/` | 12 DXFs: finished panel outlines, layer `OUTLINE`, no boring |
| `manufacturing/` | BOM, CUTLIST (finished and cut sizes), EDGE_BANDING, HARDWARE, PRICING_INPUTS |
| `drawings/` | General dimensions + section (PDF/SVG), exploded (PDF), assembly sequence (PDF) |
| `renders/` | Hero, front, side, open with shoe envelopes, detail, dimensions, exploded, variants A–D |
| `config/` | `product.json`, `parameters.json` |
| `validation/` | Report; `builds/` holds the full re-export for 600/750/900 × A–D, plus custom 1100 |

The master is **S01-B** (closed storage, wooden seat), W 900 × D 350 × H 450 mm, 18 mm BWP ply, walnut laminate.
Regenerate with `cd products && python3 -m compiler.compile S01-shoe-bench`. Do not hand-edit outputs.
