-- ============================================================================
-- AlterCraft — Seed: Beds catalogue (40 designs)
-- Mirrors src/data/beds.ts (AC-BED-001 .. AC-BED-040) so the storefront can read
-- the same 40 beds from Supabase instead of the hardcoded TS array.
--
-- Depends on: 20260723120000_store_core.sql (categories, products, product_images)
-- Apply AFTER the core schema, in Supabase Dashboard → SQL Editor. Re-runnable.
--
-- Prices (paise): Straight 15,000 = 1500000 · Curved 17,500 = 1750000 · Signature 21,000 = 2100000
-- Images resolve to /images/beds/bed-NN.jpg (already in public/images/beds/).
-- ============================================================================

-- 1) Insert the 40 products under the 'beds' category
insert into public.products (sku, category_id, name, slug, base_price_paise, status, sort_order, specs)
select
  v.sku,
  cat.id,
  v.name,
  v.slug,
  case v.style when 'Straight' then 1500000 when 'Curved' then 1750000 else 2100000 end,
  'published',
  v.idx,
  jsonb_build_object(
    'style', v.style,
    'finish', v.finish,
    'storage', 'Non-hydraulic box bed (hydraulic hardware charged extra)',
    'tax', 'Listed price excludes tax'
  )
from (select id from public.categories where slug = 'beds') cat,
(values
  (1,'AC-BED-001','Emerald Channel Bed','emerald-channel-bed','Straight','Forest green channel upholstery'),
  (2,'AC-BED-002','Ivory Arc Bed','ivory-arc-bed','Curved','Warm ivory upholstery'),
  (3,'AC-BED-003','Royal Sapphire Bed','royal-sapphire-bed','Signature','Sapphire blue with gold detail'),
  (4,'AC-BED-004','Blush Petal Bed','blush-petal-bed','Signature','Blush pink petal upholstery'),
  (5,'AC-BED-005','Mocha Scallop Bed','mocha-scallop-bed','Curved','Soft mocha upholstery'),
  (6,'AC-BED-006','Urban Step Bed','urban-step-bed','Signature','Graphite stepped headboard'),
  (7,'AC-BED-007','Lavender Dream Bed','lavender-dream-bed','Curved','Lavender button upholstery'),
  (8,'AC-BED-008','Pearl Wave Bed','pearl-wave-bed','Signature','Pearl white sculpted upholstery'),
  (9,'AC-BED-009','Noir Diamond Bed','noir-diamond-bed','Signature','Black quilted upholstery'),
  (10,'AC-BED-010','Ocean Halo Bed','ocean-halo-bed','Signature','Deep teal halo upholstery'),
  (11,'AC-BED-011','Champagne Arc Bed','champagne-arc-bed','Curved','Champagne beige upholstery'),
  (12,'AC-BED-012','Midnight Sapphire Bed','midnight-sapphire-bed','Signature','Midnight blue geometric upholstery'),
  (13,'AC-BED-013','Pearl Contour Bed','pearl-contour-bed','Signature','Layered pearl wave upholstery'),
  (14,'AC-BED-014','Blush Bloom Bed','blush-bloom-bed','Signature','Blush shell upholstery'),
  (15,'AC-BED-015','Noir Crest Bed','noir-crest-bed','Signature','Black diamond upholstery'),
  (16,'AC-BED-016','Olive Crest Bed','olive-crest-bed','Straight','Olive vertical-panel upholstery'),
  (17,'AC-BED-017','Lavender Royale Bed','lavender-royale-bed','Curved','Lavender tufted upholstery'),
  (18,'AC-BED-018','Sand Wave Bed','sand-wave-bed','Signature','Sand-toned flowing upholstery'),
  (19,'AC-BED-019','Golden Panel Bed','golden-panel-bed','Signature','Black and gold panel upholstery'),
  (20,'AC-BED-020','Lagoon Halo Bed','lagoon-halo-bed','Signature','Lagoon teal round upholstery'),
  (21,'AC-BED-021','Marble Crest Bed','marble-crest-bed','Signature','Ivory asymmetric upholstery'),
  (22,'AC-BED-022','Sage Arch Bed','sage-arch-bed','Curved','Sage green arch upholstery'),
  (23,'AC-BED-023','Midnight Crown Bed','midnight-crown-bed','Signature','Black crown-panel upholstery'),
  (24,'AC-BED-024','Rose Shell Bed','rose-shell-bed','Signature','Rose pink shell upholstery'),
  (25,'AC-BED-025','Golden Curve Bed','golden-curve-bed','Curved','Cream curved upholstery'),
  (26,'AC-BED-026','Teal Royale Bed','teal-royale-bed','Curved','Jewel teal curved upholstery'),
  (27,'AC-BED-027','Cocoa Halo Bed','cocoa-halo-bed','Signature','Cocoa round upholstery'),
  (28,'AC-BED-028','Ivory Bloom Bed','ivory-bloom-bed','Signature','Ivory petal upholstery'),
  (29,'AC-BED-029','Ash Panel Bed','ash-panel-bed','Straight','Ash grey panel upholstery'),
  (30,'AC-BED-030','Plum Royale Bed','plum-royale-bed','Straight','Plum button upholstery'),
  (31,'AC-BED-031','Crystal Arc Bed','crystal-arc-bed','Signature','Crystal beige round upholstery'),
  (32,'AC-BED-032','Emerald Panel Bed','emerald-panel-bed','Straight','Emerald green panel upholstery'),
  (33,'AC-BED-033','Royal Onyx Bed','royal-onyx-bed','Signature','Onyx geometric upholstery'),
  (34,'AC-BED-034','Blush Shell Bed','blush-shell-bed','Signature','Blush pink shell upholstery'),
  (35,'AC-BED-035','Ocean Curve Bed','ocean-curve-bed','Signature','Ocean blue fan upholstery'),
  (36,'AC-BED-036','Walnut Luxe Bed','walnut-luxe-bed','Straight','Walnut and beige panel upholstery'),
  (37,'AC-BED-037','Lavender Crest Bed','lavender-crest-bed','Curved','Lavender winged upholstery'),
  (38,'AC-BED-038','Cloud Wave Bed','cloud-wave-bed','Signature','Cloud white flowing upholstery'),
  (39,'AC-BED-039','Midnight Frame Bed','midnight-frame-bed','Signature','Black illuminated frame upholstery'),
  (40,'AC-BED-040','Sand Halo Bed','sand-halo-bed','Signature','Sand beige halo upholstery')
) as v(idx, sku, name, slug, style, finish)
on conflict (sku) do nothing;

-- 2) Fill subtitle / description / highlights from the headboard style
update public.products p set
  subtitle = p.specs->>'finish',
  description = case p.specs->>'style'
    when 'Straight' then 'A clean upholstered headboard with an easy-to-coordinate modern profile.'
    when 'Curved'   then 'A softly shaped upholstered headboard that adds warmth without feeling heavy.'
    else 'A statement headboard with sculpted, round or detailed upholstery work.'
  end,
  highlights = jsonb_build_array(
    'Upholstered designer headboard',
    'Listed price is for a non-hydraulic box bed',
    'Hydraulic storage available (hardware charged extra)',
    'Made to your mattress size',
    'Pan-India delivery & installation, quoted per destination'
  )
where p.sku like 'AC-BED-%'
  and (p.description is null or p.description = '');

-- 3) Primary image, derived from the sku number → /images/beds/bed-NN.jpg
insert into public.product_images (product_id, url, alt, is_primary, sort_order)
select
  p.id,
  '/images/beds/bed-' || lpad(substring(p.sku from 8)::int::text, 2, '0') || '.jpg',
  p.name || ' upholstered designer bed',
  true,
  0
from public.products p
where p.sku like 'AC-BED-%'
  and not exists (select 1 from public.product_images pi where pi.product_id = p.id);
