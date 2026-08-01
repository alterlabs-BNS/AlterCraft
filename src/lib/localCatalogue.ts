import { bedProducts } from '../data/beds';
import type { Category, Product, PurchaseFlow } from './catalogue';

/**
 * Local catalogue fallback — lets the storefront run BEFORE Supabase is wired,
 * and mirrors exactly what the flip homepage shows so every homepage card links
 * to a real product/category in the store. Beds are the real 40 from
 * src/data/beds.ts; other categories mirror the homepage `CATS` data.
 * Once Supabase has rows, shopData.ts prefers the live catalogue and this is ignored.
 */
export const localCategories: Category[] = [
  { id: 'beds', slug: 'beds', name: 'Beds', flow: 'cart', anchorPricePaise: 1500000, sortOrder: 1 },
  { id: 'kitchen', slug: 'kitchen', name: 'Modular Kitchen', flow: 'quoted', anchorPricePaise: null, sortOrder: 2 },
  { id: 'mandir', slug: 'mandir', name: 'Mandir Units', flow: 'cart', anchorPricePaise: 2150000, sortOrder: 3 },
  { id: 'wardrobe', slug: 'wardrobe', name: 'Wardrobes', flow: 'cart', anchorPricePaise: 2450000, sortOrder: 4 },
  { id: 'shoe-rack', slug: 'shoe-rack', name: 'Shoe Racks', flow: 'cart', anchorPricePaise: 600000, sortOrder: 5 },
  { id: 'custom-mattress', slug: 'custom-mattress', name: 'Custom Mattress', flow: 'quoted', anchorPricePaise: null, sortOrder: 6 },
  { id: 'living-dining', slug: 'living-dining', name: 'Living & Dining', flow: 'cart', anchorPricePaise: 900000, sortOrder: 7 },
  { id: 'balcony-storage', slug: 'balcony-storage', name: 'Balcony Storage', flow: 'cart', anchorPricePaise: 1000000, sortOrder: 8 },
];

const slugify = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

type Seed = { name: string; pricePaise: number | null; tag: string; img: string };

function buildCategory(
  categorySlug: string,
  prefix: string,
  highlights: string[],
  description: string,
  seeds: Seed[],
): Product[] {
  return seeds.map((seed, index) => ({
    id: `${prefix}-${String(index + 1).padStart(3, '0')}`,
    sku: `${prefix}-${String(index + 1).padStart(3, '0')}`,
    name: seed.name,
    slug: slugify(seed.name),
    subtitle: seed.tag,
    description,
    basePricePaise: seed.pricePaise,
    flow: (seed.pricePaise == null ? 'quoted' : 'cart') as PurchaseFlow,
    highlights,
    specs: { type: seed.tag, delivery: 'Pan-India, quoted per destination' },
    images: [{ url: seed.img, alt: seed.name, isPrimary: true, sortOrder: index }],
    variants: [],
    categorySlug,
  }));
}

const bedsAsProducts: Product[] = bedProducts.map((bed, index) => ({
  id: bed.id,
  sku: bed.id,
  name: bed.name,
  slug: slugify(bed.name),
  subtitle: bed.finish,
  description: bed.description,
  basePricePaise: bed.price * 100,
  flow: 'cart' as PurchaseFlow,
  highlights: [
    'Upholstered designer headboard',
    'Listed price is for a non-hydraulic box bed',
    'Hydraulic storage available (hardware charged extra)',
    'Made to your mattress size',
    'Pan-India delivery & installation',
  ],
  specs: { style: bed.style, finish: bed.finish, storage: 'Non-hydraulic box bed (hydraulic extra)' },
  images: [{ url: bed.image, alt: `${bed.name} upholstered designer bed`, isPrimary: true, sortOrder: index }],
  variants: [],
  categorySlug: 'beds',
}));

const KITCHEN_IMG_L = '/images/generated/v1/kitchen-compact-l-shape.webp';
const KITCHEN_IMG_U = '/images/generated/v1/kitchen-premium-u-shape.webp';
const MANDIR_IMG = '/images/generated/v1/pooja-mandir-cnc.webp';
const WARDROBE_SLIDING = '/images/generated/v1/wardrobe-sliding-smoked.webp';
const WARDROBE_INTERNAL = '/images/generated/v1/wardrobe-internal-storage.webp';
const WALKIN = '/images/generated/v1/walk-in-indian-storage.webp';
const JOINERY = '/images/generated/v1/joinery-soft-close.webp';
const LIVING_CURVED = '/images/generated/v1/living-curved-collection.webp';
const LIVING_MEDIA = '/images/generated/v1/living-media-wall.webp';

const kitchens = buildCategory(
  'kitchen',
  'AC-KIT',
  ['Priced from ₹1,200 / sq. ft. for the agreed cabinet scope', 'Measured layout & material guidance', 'Installation support', 'Book a design visit to confirm'],
  'Modular kitchen planned around your layout and cabinet scope, from ₹1,200 / sq. ft.',
  [
    { name: 'Compact L-Shape Kitchen', pricePaise: null, tag: 'Popular', img: KITCHEN_IMG_L },
    { name: 'Premium U-Shape Kitchen', pricePaise: null, tag: 'U-Shape', img: KITCHEN_IMG_U },
    { name: 'Parallel Kitchen Plan', pricePaise: null, tag: 'Space-efficient', img: KITCHEN_IMG_L },
    { name: 'Island Kitchen Direction', pricePaise: null, tag: 'Premium', img: KITCHEN_IMG_U },
  ],
);

const mandir = buildCategory(
  'mandir',
  'AC-MND',
  ['CNC jaali detailing options', 'Wall-mounted or floor-standing', 'Lighting and storage planning', 'Pan-India delivery & installation'],
  'Pooja mandir units planned around your wall, storage and lighting.',
  [
    { name: 'Traditional Teak Temple', pricePaise: 4200000, tag: 'Teak', img: MANDIR_IMG },
    { name: 'Wall-Mounted Modern Mandir', pricePaise: 2150000, tag: 'Compact', img: MANDIR_IMG },
    { name: 'Jali Mandir with Storage', pricePaise: null, tag: 'Custom', img: MANDIR_IMG },
  ],
);

const wardrobes = buildCategory(
  'wardrobe',
  'AC-WRD',
  ['Sliding, hinged and walk-in options', 'Internal storage planning', 'Soft-close hardware', 'Made to your wall dimensions'],
  'Wardrobes planned from your wall dimensions and storage requirements.',
  [
    { name: 'Executive Sliding Wardrobe', pricePaise: 4800000, tag: 'Sliding', img: WARDROBE_SLIDING },
    { name: 'Compact Swing Wardrobe', pricePaise: 2450000, tag: 'Hinged', img: WARDROBE_INTERNAL },
    { name: 'Custom Wardrobe Build', pricePaise: null, tag: 'Measured', img: WARDROBE_SLIDING },
    { name: 'Indian Storage Layout', pricePaise: null, tag: 'Internal', img: WARDROBE_INTERNAL },
    { name: 'Walk-in Storage Plan', pricePaise: null, tag: 'Premium', img: WALKIN },
  ],
);

const shoeRacks = buildCategory(
  'shoe-rack',
  'AC-SHO',
  ['Ventilated entry storage', 'Seating and tall-unit options', 'Planned for your pair count', 'Pan-India delivery & installation'],
  'Entry shoe storage designed for your pair count and wall space.',
  [
    { name: 'Compact Shoe Rack', pricePaise: 600000, tag: 'Compact', img: WARDROBE_INTERNAL },
    { name: 'Ventilated Entry Unit', pricePaise: null, tag: 'Custom', img: JOINERY },
    { name: 'Seated Shoe Bench', pricePaise: null, tag: 'Entryway', img: LIVING_CURVED },
    { name: 'Tall Shoe Storage', pricePaise: null, tag: 'High capacity', img: WARDROBE_SLIDING },
  ],
);

const customMattress = buildCategory(
  'custom-mattress',
  'AC-MAT',
  ['Sized to your bed and room', 'Comfort direction guidance', 'Planned with your headboard and storage', 'Book a size consultation'],
  'Custom mattress sizing and comfort planning matched to your bed.',
  [
    { name: 'Queen Mattress Fit Check', pricePaise: null, tag: 'Queen', img: '/images/generated/v1/bed-hydraulic-storage.webp' },
    { name: 'King Mattress Fit Check', pricePaise: null, tag: 'King', img: '/images/generated/v1/bed-upholstered-drawer.webp' },
    { name: 'Bed + Mattress Planning', pricePaise: null, tag: 'Assisted', img: '/images/beds/bed-11.jpg' },
  ],
);

const livingDining = buildCategory(
  'living-dining',
  'AC-LIV',
  ['Made or selected to fit your room', 'Sofas, TV units, tables and storage', 'Pan-India delivery & installation', 'Final quote after confirmation'],
  'Living and dining furniture selected or made to fit Indian homes.',
  [
    { name: 'Three Seater Sofa', pricePaise: 3600000, tag: 'Living', img: LIVING_CURVED },
    { name: 'L-Shape Sofa', pricePaise: 6000000, tag: 'Lounge', img: LIVING_MEDIA },
    { name: 'Classic TV Unit', pricePaise: 1500000, tag: 'Media', img: LIVING_MEDIA },
    { name: 'Solid Wood Coffee Table', pricePaise: 900000, tag: 'Table', img: LIVING_CURVED },
    { name: 'Six Seater Dining Set', pricePaise: 3800000, tag: 'Dining', img: LIVING_CURVED },
  ],
);

const allLocalProducts: Product[] = [
  ...bedsAsProducts,
  ...kitchens,
  ...mandir,
  ...wardrobes,
  ...shoeRacks,
  ...customMattress,
  ...livingDining,
];

export function getLocalProducts(categorySlug?: string): Product[] {
  return categorySlug
    ? allLocalProducts.filter((product) => product.categorySlug === categorySlug)
    : allLocalProducts;
}

export function getLocalProduct(productSlug: string): Product | null {
  return allLocalProducts.find((product) => product.slug === productSlug) ?? null;
}
