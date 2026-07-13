export interface Product {
  id: string;
  code: string;
  name: string;
  category: 'Beds' | 'Wardrobes' | 'Study Tables' | 'Mandirs' | 'Panels' | 'Nameplates' | 'Rentals';
  shortDescription: string;
  prices: {
    mrp: number;
    offer: number;
    save: number;
  };
  rent: {
    monthly: number;
    deposit: number;
  };
  deliveryDays: number;
  materials: string;
  dimensions: string;
  images: string[];
  features: string[];
  availability: ('rent' | 'buy')[];
}

export const products: Product[] = [
  {
    id: 'bed-01',
    code: 'BED-01',
    name: 'Luxury King Platform Bed',
    category: 'Beds',
    shortDescription: 'Custom king-size platform bed with engineered wood, CNC detailing and premium storage-ready finishing',
    prices: {
      mrp: 45000,
      offer: 32000,
      save: 13000,
    },
    rent: {
      monthly: 2500,
      deposit: 10000,
    },
    deliveryDays: 7,
    materials: 'Engineered Wood with Walnut Veneer',
    dimensions: '210cm x 200cm x 120cm (L x W x H)',
    images: ['/images/generated/v1/bed-upholstered-drawer.webp'],
    features: [
      'CNC-carved headboard with custom patterns for luxury bedrooms',
      'Reinforced slat system for durability',
      'Anti-slip felt base protection',
      'Premium walnut finish with gold accents',
      'Made-to-order bed sizing for Delhi NCR homes',
    ],
    availability: ['rent', 'buy'],
  },
  {
    id: 'bed-02',
    code: 'BED-02',
    name: 'Modern Storage Bed',
    category: 'Beds',
    shortDescription: 'Modern hydraulic storage bed for compact Indian bedrooms and rental flats',
    prices: {
      mrp: 38000,
      offer: 28500,
      save: 9500,
    },
    rent: {
      monthly: 2200,
      deposit: 8500,
    },
    deliveryDays: 10,
    materials: 'Engineered Wood with Melamine Finish',
    dimensions: '190cm x 150cm x 110cm (L x W x H)',
    images: ['/images/generated/v1/bed-hydraulic-storage.webp'],
    features: [
      'Hydraulic lift storage for bedding, luggage and seasonal clothes',
      'Soft-close mechanism for safety',
      'Scratch-resistant melamine coating',
      'Easy assembly with modular design',
    ],
    availability: ['rent', 'buy'],
  },
  {
    id: 'wardrobe-01',
    code: 'WAR-01',
    name: 'Executive Sliding Door Wardrobe',
    category: 'Wardrobes',
    shortDescription: 'Modular sliding wardrobe with mirror, loft-ready storage and premium soft-close fittings',
    prices: {
      mrp: 65000,
      offer: 48000,
      save: 17000,
    },
    rent: {
      monthly: 3500,
      deposit: 15000,
    },
    deliveryDays: 14,
    materials: 'Engineered Wood + Bagasse Board Interior',
    dimensions: '240cm x 60cm x 210cm (H x D x W)',
    images: ['/images/generated/v1/wardrobe-sliding-smoked.webp'],
    features: [
      'Soft-close sliding door mechanism',
      'Full-length mirror on center panel',
      'Customizable interior shelving, drawers, hanging space and loft planning',
      'Anti-rust premium fittings',
      'Eco-friendly bagasse board interiors for sustainable storage',
    ],
    availability: ['rent', 'buy'],
  },
  {
    id: 'wardrobe-02',
    code: 'WAR-02',
    name: 'Compact Swing Door Wardrobe',
    category: 'Wardrobes',
    shortDescription: 'Compact swing-door modular wardrobe for small bedrooms, PG rooms and apartments',
    prices: {
      mrp: 32000,
      offer: 24500,
      save: 7500,
    },
    rent: {
      monthly: 1800,
      deposit: 7000,
    },
    deliveryDays: 7,
    materials: 'Engineered Wood with Laminate Finish',
    dimensions: '180cm x 50cm x 150cm (H x D x W)',
    images: ['/images/generated/v1/wardrobe-internal-storage.webp'],
    features: [
      'Magnetic door locks',
      '4 internal shelves + hanging rod',
      'Compact design for small bedrooms and rented homes',
      'Durable laminate exterior',
    ],
    availability: ['buy'],
  },
  {
    id: 'study-01',
    code: 'STD-01',
    name: 'Ergonomic Study Table with Storage',
    category: 'Study Tables',
    shortDescription: 'Work-from-home study table with cable management, drawers and ergonomic height',
    prices: {
      mrp: 18000,
      offer: 13500,
      save: 4500,
    },
    rent: {
      monthly: 1200,
      deposit: 5000,
    },
    deliveryDays: 5,
    materials: 'Engineered Wood with Matt Finish',
    dimensions: '120cm x 60cm x 75cm (L x W x H)',
    images: ['/images/generated/v1/office-commercial-interior.webp'],
    features: [
      'Built-in cable management system',
      '2 large drawers with smooth glides',
      'Scratch-resistant matt surface',
      'Ergonomic height for study, work-from-home and laptop use',
      'Optional keyboard tray add-on',
    ],
    availability: ['rent', 'buy'],
  },
  {
    id: 'study-02',
    code: 'STD-02',
    name: 'Wall-Mounted Foldable Study Desk',
    category: 'Study Tables',
    shortDescription: 'Wall-mounted foldable study desk for small rooms and work-from-home corners',
    prices: {
      mrp: 12000,
      offer: 9500,
      save: 2500,
    },
    rent: {
      monthly: 800,
      deposit: 3500,
    },
    deliveryDays: 3,
    materials: 'Engineered Wood with PU Polish',
    dimensions: '100cm x 50cm x 10cm (folded)',
    images: ['/images/generated/v1/design-planning.webp'],
    features: [
      'Folds flat when not in use',
      'Heavy-duty wall brackets included',
      'Smooth PU polished surface',
      'Supports up to 25kg',
    ],
    availability: ['buy'],
  },
  {
    id: 'mandir-01',
    code: 'MND-01',
    name: 'Traditional Teak Temple',
    category: 'Mandirs',
    shortDescription: 'Custom pooja mandir with CNC carvings, LED-ready shelves and premium teak finish',
    prices: {
      mrp: 55000,
      offer: 42000,
      save: 13000,
    },
    rent: {
      monthly: 0,
      deposit: 0,
    },
    deliveryDays: 21,
    materials: 'Premium Teak Wood with Natural Polish',
    dimensions: '90cm x 45cm x 150cm (W x D x H)',
    images: ['/images/generated/v1/pooja-mandir-cnc.webp'],
    features: [
      'CNC-carved traditional motifs',
      'Multiple idol shelves with LED backlighting',
      'Drawer for pooja essentials',
      'Natural teak finish with hand-polishing',
      'Custom pooja mandir height and design options available',
    ],
    availability: ['buy'],
  },
  {
    id: 'mandir-02',
    code: 'MND-02',
    name: 'Wall-Mounted Modern Mandir',
    category: 'Mandirs',
    shortDescription: 'Wall-mounted modern mandir with warm LED lighting for compact homes',
    prices: {
      mrp: 28000,
      offer: 21500,
      save: 6500,
    },
    rent: {
      monthly: 0,
      deposit: 0,
    },
    deliveryDays: 10,
    materials: 'Engineered Wood with Veneer Finish',
    dimensions: '75cm x 35cm x 100cm (W x D x H)',
    images: ['/images/generated/v1/pooja-mandir-cnc.webp'],
    features: [
      'Space-saving wall-mounted design',
      'Integrated warm LED strip lighting',
      'Minimalist modern aesthetics',
      'Easy installation kit included',
    ],
    availability: ['buy'],
  },
  {
    id: 'panel-01',
    code: 'PNL-01',
    name: 'Geometric Wall Panel Set',
    category: 'Panels',
    shortDescription: '3D CNC-cut wall panel set for living rooms, bedrooms and feature walls',
    prices: {
      mrp: 15000,
      offer: 11500,
      save: 3500,
    },
    rent: {
      monthly: 0,
      deposit: 0,
    },
    deliveryDays: 7,
    materials: 'MDF with Lacquer Finish',
    dimensions: '60cm x 60cm x 2cm each (6 panels)',
    images: ['/images/generated/v1/cnc-workshop.webp'],
    features: [
      'Precision CNC geometric patterns',
      'High-gloss lacquer finish',
      'Easy wall mounting system',
      'Custom colors available',
      'Create unique 3D wall art for TV units and feature walls',
    ],
    availability: ['buy'],
  },
  {
    id: 'panel-02',
    code: 'PNL-02',
    name: 'Floral Pattern Decorative Panel',
    category: 'Panels',
    shortDescription: 'Large CNC decorative wall panel with floral pattern for premium room accents',
    prices: {
      mrp: 12000,
      offer: 9000,
      save: 3000,
    },
    rent: {
      monthly: 0,
      deposit: 0,
    },
    deliveryDays: 5,
    materials: 'Plywood with UV Print + CNC Cut',
    dimensions: '120cm x 90cm x 1.5cm',
    images: ['/images/generated/v1/joinery-soft-close.webp'],
    features: [
      'Intricate floral CNC cutting',
      'UV-printed background colors',
      'Lightweight plywood construction',
      'Ready to hang',
    ],
    availability: ['buy'],
  },
  {
    id: 'nameplate-01',
    code: 'NMP-01',
    name: 'Custom Family Nameplate',
    category: 'Nameplates',
    shortDescription: 'Custom acrylic LED nameplate with CNC engraving for home entrances and offices',
    prices: {
      mrp: 4500,
      offer: 3200,
      save: 1300,
    },
    rent: {
      monthly: 0,
      deposit: 0,
    },
    deliveryDays: 3,
    materials: 'Acrylic with LED Strip',
    dimensions: '45cm x 30cm x 1.5cm (customizable)',
    images: ['/images/generated/v1/cnc-workshop.webp'],
    features: [
      'Custom text and font selection',
      'Warm white LED backlighting',
      'Weather-resistant acrylic material for Indian home entrances',
      'Multiple color options',
      'Quick CNC engraving turnaround',
    ],
    availability: ['buy'],
  },
  {
    id: 'rental-01',
    code: 'RNT-01',
    name: 'Premium Event Furniture Package',
    category: 'Rentals',
    shortDescription: 'Furniture rental package for weddings, corporate events, office setups and temporary spaces',
    prices: {
      mrp: 0,
      offer: 0,
      save: 0,
    },
    rent: {
      monthly: 15000,
      deposit: 50000,
    },
    deliveryDays: 2,
    materials: 'Mixed: Wood, Metal, Upholstery',
    dimensions: 'Package includes 20 chairs + 4 tables',
    images: ['/images/generated/v1/living-curved-collection.webp'],
    features: [
      'Complete event setup included',
      'Professional delivery and pickup',
      'Cleaning service included',
      'Flexible rental periods for events, offices and temporary home setups',
      'Custom configurations available',
    ],
    availability: ['rent'],
  },
];
