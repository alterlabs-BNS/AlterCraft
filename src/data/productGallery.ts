export type GalleryCategory = {
  id: string;
  label: string;
};

export type GalleryPhoto = {
  src: string;
  label: string;
};

export type GalleryProduct = {
  id: string;
  name: string;
  category: string;
  shortDescription: string;
  material: string;
  dimensions: string;
  finish: string;
  photos: GalleryPhoto[];
};

export const galleryCategories: GalleryCategory[] = [
  { id: 'living', label: 'Living' },
  { id: 'bedroom', label: 'Bedroom' },
  { id: 'dining', label: 'Dining' },
  { id: 'office', label: 'Office' },
  { id: 'decor', label: 'Panels and Decor' },
  { id: 'mandir', label: 'Mandir Units' },
];

export const galleryProducts: GalleryProduct[] = [
  {
    id: 'nova-l-shape-sofa',
    name: 'Nova L-Shape Sofa',
    category: 'living',
    shortDescription: 'Deep seat sectional designed for modern living rooms.',
    material: 'Kiln-dried hardwood and premium upholstery',
    dimensions: '96 in x 64 in x 33 in',
    finish: 'Matte beige fabric',
    photos: [
      { src: '/images/generated/v1/living-curved-collection.webp', label: 'AI-assisted concept visualization' },
    ],
  },
  {
    id: 'regal-tv-console',
    name: 'Regal TV Console',
    category: 'living',
    shortDescription: 'Low profile media unit with concealed storage.',
    material: 'Pre-laminated board with hardwood frame',
    dimensions: '72 in x 16 in x 22 in',
    finish: 'Walnut and charcoal dual tone',
    photos: [
      { src: '/images/generated/v1/living-media-wall.webp', label: 'AI-assisted concept visualization' },
    ],
  },
  {
    id: 'aurora-wardrobe',
    name: 'Aurora Sliding Wardrobe',
    category: 'bedroom',
    shortDescription: 'Space-efficient wardrobe with smooth sliding tracks.',
    material: 'BWR plywood with soft-close hardware',
    dimensions: '84 in x 72 in x 24 in',
    finish: 'Oak laminate with fluted accents',
    photos: [
      { src: '/images/generated/v1/wardrobe-sliding-smoked.webp', label: 'AI-assisted concept visualization' },
    ],
  },
  {
    id: 'heritage-dining-set',
    name: 'Heritage Dining Set',
    category: 'dining',
    shortDescription: 'Six-seater dining set built for daily family use.',
    material: 'Solid wood top with cushioned chairs',
    dimensions: 'Table 60 in x 36 in',
    finish: 'Natural teak matte polish',
    photos: [
      { src: '/images/generated/v1/living-curved-collection.webp', label: 'AI-assisted concept visualization' },
    ],
  },
  {
    id: 'summit-workstation',
    name: 'Summit Executive Workstation',
    category: 'office',
    shortDescription: 'CNC-finished workstation for studios and offices.',
    material: 'Powder-coated steel frame and laminate top',
    dimensions: '78 in x 30 in x 30 in',
    finish: 'Matte black with walnut grain',
    photos: [
      { src: '/images/generated/v1/office-commercial-interior.webp', label: 'AI-assisted concept visualization' },
    ],
  },
  {
    id: 'aura-panel-system',
    name: 'Aura Fluted Panel System',
    category: 'decor',
    shortDescription: 'Wall panel solution for feature walls and lobbies.',
    material: 'MDF core with decorative laminate',
    dimensions: 'Custom modules',
    finish: 'Warm oak fluted profile',
    photos: [
      { src: '/images/generated/v1/living-media-wall.webp', label: 'AI-assisted concept visualization' },
    ],
  },
  {
    id: 'shree-mandir-unit',
    name: 'Shree Mandir Unit',
    category: 'mandir',
    shortDescription: 'Traditional style mandir unit with CNC jaali detailing.',
    material: 'BWP plywood with PU-coated front',
    dimensions: '48 in x 24 in x 78 in',
    finish: 'Ivory with gold accent trims',
    photos: [
      { src: '/images/generated/v1/pooja-mandir-cnc.webp', label: 'AI-assisted concept visualization' },
    ],
  },
];
