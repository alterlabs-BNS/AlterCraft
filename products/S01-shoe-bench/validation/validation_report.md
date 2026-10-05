# S01 Shoe Bench - Validation Report

Generated 2026-10-05 10:02 UTC by `products/compiler` (CadQuery/OpenCascade). Every check re-reads the exported file (STEP re-imported through OCC, DXF re-read with ezdxf, CSV re-parsed).

Status: **DIGITAL MASTER v1 - geometry & data consistency validated. NOT structurally validated. NOT released for CNC.**

## Master (S01-B-W900)

| Check | Result | Detail |
|---|---|---|
| 1 STEP exists & non-empty | PASS | S01-B-W900.step 200489 bytes |
| 2 STEP re-imports (OCC) with all solids | PASS | 12 solids (model 12); bbox (0.0, 0.0, 0.0, 900.0, 350.0, 450.0) |
| 2b STEP volume equals model volume | PASS | STEP 34.2863 dm3 vs model 34.2863 dm3 |
| 3 Overall dims match parameters | PASS | model (900, 350, 450) vs params W/D/H (900, 350, 450) |
| 4 No intersecting / duplicate parts | PASS | clashes [] dups [] |
| 4b Doors at 90 deg clear the carcass (open pose) | PASS | clashes [] |
| 5 Cut list matches CAD panel sizes | PASS | 12 rows / 12 panels; mismatches [] |
| 6 BOM component quantities = modelled parts | PASS | BOM qty 12, model parts 12 |
| 7 DXF outlines match parts (layer OUTLINE only) | PASS | 12 DXF / 12 panels; bad [] |
| 8 IDs unique & consistent with product | PASS | 12 part ids, prefix S01- |
| DR Seat span <= MAX_SEAT_SPAN | PASS | span 423.0 mm vs limit 450 mm (limit is an ASSUMPTION - needs load test) |
| DR Shoe length fits carcass depth | PASS | internal depth 316 mm vs 300 mm reference shoe |
| DR Shoe length fits shelf depth | PASS | shelf depth 301 mm; shoe may overhang shelf front by 0 mm (door still clears: overhang < setback) |
| DR Every tier sneaker-capable | PASS | tier clear heights [157.0, 157.0] mm vs min 125 |
| DR Door clears seat top | PASS | 3 mm gap under seat top |
| DR Door clears floor | PASS | door bottom at 75 mm above floor (plinth zone) |
| DR Door width practical (<= 600) | PASS | door widths [447.0, 447.0] |
| DR Kick rail clear of door swing | PASS | kick recessed 40 mm behind carcass front |

## Width x variant sweep (each build regenerated from parameters and fully re-exported)

| Build | Parts | Bays | Seat span | Tier clear (mm) | Est. pairs | Data checks | Design-rule | Overall W x D x H |
|---|---|---|---|---|---|---|---|---|
| S01-A-W600 | 10 | 2 | 273.0 | [157.0, 157.0] | 4 | ALL PASS (9) | PASS | 600 x 350 x 450 |
| S01-B-W600 | 12 | 2 | 273.0 | [157.0, 157.0] | 4 | ALL PASS (10) | PASS | 600 x 350 x 450 |
| S01-C-W600 | 14 | 2 | 273.0 | [136.0, 136.0] | 4 | ALL PASS (10) | PASS | 600 x 350 x 450 |
| S01-D-W600 | 11 | 2 | 273.0 | [157.0, 157.0] | 4 | ALL PASS (10) | PASS | 600 x 350 x 450 |
| S01-A-W750 | 10 | 2 | 348.0 | [157.0, 157.0] | 4 | ALL PASS (9) | PASS | 750 x 350 x 450 |
| S01-B-W750 | 12 | 2 | 348.0 | [157.0, 157.0] | 4 | ALL PASS (10) | PASS | 750 x 350 x 450 |
| S01-C-W750 | 14 | 2 | 348.0 | [136.0, 136.0] | 4 | ALL PASS (10) | PASS | 750 x 350 x 450 |
| S01-D-W750 | 11 | 2 | 348.0 | [157.0, 157.0] | 4 | ALL PASS (10) | PASS | 750 x 350 x 450 |
| S01-A-W900 | 10 | 2 | 423.0 | [157.0, 157.0] | 8 | ALL PASS (9) | PASS | 900 x 350 x 450 |
| S01-B-W900 | 12 | 2 | 423.0 | [157.0, 157.0] | 8 | ALL PASS (10) | PASS | 900 x 350 x 450 |
| S01-C-W900 | 14 | 2 | 423.0 | [136.0, 136.0] | 8 | ALL PASS (10) | PASS | 900 x 350 x 450 |
| S01-D-W900 | 11 | 2 | 423.0 | [157.0, 157.0] | 8 | ALL PASS (10) | PASS | 900 x 350 x 450 |
| S01-B-W1100 | 15 | 3 | 342.7 | [157.0, 157.0] | 6 | ALL PASS (10) | PASS | 1100 x 350 x 450 |

Per-build STEP / CSV / DXF are in `validation/builds/<tag>/`.

## Not validated by this pass (requires fabrication review)

- Seat load capacity / deflection of the seat top and partition load path (no FEA, no physical test).
- `MAX_SEAT_SPAN = 450 mm` is an engineering assumption, not a tested limit.
- Cam-lock / dowel / hinge / shelf-pin boring: hardware not selected, so no boring is in the DXFs.
- Tolerances, pre-milling allowance for edge banding, saw kerf, nesting: not applied.
- CNC toolpaths: none generated. DXFs are outlines for CAM preparation only.
- Back-panel ventilation for shoe odour: not modelled (open decision).
- Shoe capacity uses an assumed pair envelope; confirm with a physical mock-up.
