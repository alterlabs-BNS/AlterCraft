# AlterCraft Product Compiler

Define a product once, as parametric geometry. Everything else is derived from that definition:

```
source/<id>_parametric.py  ->  ProductModel (parts + hardware)
   -> master/*.step, *.glb, *.stl   (CadQuery / OpenCascade)
   -> cnc/*.dxf                     (one finished outline per board)
   -> manufacturing/BOM, CUTLIST, EDGE_BANDING, HARDWARE, PRICING_INPUTS (.csv)
   -> drawings/*.pdf                (orthographic, section, exploded, assembly)
   -> renders/*.png                 (z-buffer render of the same part boxes)
   -> config/product.json           (web, configurator and CRM schema)
   -> validation/validation_report.md (exports re-read and cross-checked)
```

Build:

```
pip install cadquery ezdxf matplotlib pillow
cd products && python3 -m compiler.compile S01-shoe-bench
```

`compiler/` contains no S01 code. To add a new product (S02, S03, W01 …), create
`products/<folder>/source/<id>_parametric.py` exposing `PRODUCT_ID, PRODUCT_NAME, CATEGORY, VERSION,
PARAMETERS, PRESETS, VARIANTS, DEFAULT_VARIANT, MATERIALS, FINISHES, WEBSITE, MANUFACTURING_METHOD`
and `build(variant, **overrides) -> ProductModel`.
