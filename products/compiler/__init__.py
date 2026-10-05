"""AlterCraft Product Compiler.

Product-agnostic pipeline: a product's parametric source returns a ProductModel
(panels + hardware + metadata); everything else (STEP, DXF, BOM, cut list,
edge banding, drawings, renders, validation) is derived from that one model.
"""
