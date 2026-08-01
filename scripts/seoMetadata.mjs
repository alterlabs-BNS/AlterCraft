const baseUrl = 'https://www.altercraft.in';
const defaultImage = `${baseUrl}/images/generated/v1/brand-hero.webp`;
const modularKitchenPrice = 'INR 1,200 / sq. ft.';

const defaultSeo = {
  title: `Custom Furniture, Beds & Modular Kitchens from ${modularKitchenPrice} | AlterCraft`,
  description:
    `AlterCraft designs and delivers custom furniture, beds, wardrobes, mandir units, shoe racks and modular kitchens from ${modularKitchenPrice}, made to order and installed Pan-India. Visit our Ghaziabad experience store.`,
  robots: 'index, follow',
};

const noindexSeo = {
  robots: 'noindex, follow',
};

const routeSeo = {
  '/404': {
    title: 'Page Not Found | AlterCraft',
    description: 'This AlterCraft page is not available. Return home or request a furniture, modular kitchen or interior quotation.',
    robots: 'noindex, follow',
    canonical: `${baseUrl}/`,
  },
  '/gallery': {
    title: 'Gallery & Portfolio | AlterCraft Furniture and Interiors',
    description:
      'View AlterCraft portfolio work for modular kitchens, wardrobes, beds, doors, office interiors, TV units and custom furniture, delivered Pan-India.',
    canonical: `${baseUrl}/gallery`,
  },
  '/portfolio': {
    title: 'Portfolio | AlterCraft Custom Furniture and Interiors',
    description:
      'Explore AlterCraft project and product directions for custom furniture, modular kitchens, wardrobes, bedrooms and commercial interiors.',
  },
  '/products': {
    title: 'Products & Custom Furniture Pricing | AlterCraft',
    description:
      'Browse AlterCraft furniture categories, product pricing, modular kitchen units, wardrobes, beds, doors and custom furniture options.',
    canonical: `${baseUrl}/products`,
  },
  '/blog': {
    title: 'AlterCraft Blog | Modular Kitchen, Furniture and Contractor Desk Guides',
    description:
      'Read AlterCraft guides on modular kitchen pricing, custom furniture, wardrobes, office interiors, Contractor Desk APK, payment gates and site execution.',
    canonical: `${baseUrl}/blog/`,
  },
  '/ContractorDesk': {
    title: 'AlterCraft Contractor Desk | Execution Control System',
    description:
      'Mobile-first contractor execution control system for payment gates, labour deployment, material desk, site reports, cash ledger and dispute protection.',
    canonical: `${baseUrl}/ContractorDesk/`,
  },
  '/contractor-desk': {
    title: 'AlterCraft Contractor Desk | Execution Control System',
    description:
      'Mobile-first contractor execution control system for payment gates, labour deployment, material desk, site reports, cash ledger and dispute protection.',
    canonical: `${baseUrl}/ContractorDesk/`,
  },
  '/contractor-admin': {
    title: 'Contractor Admin Desk | AlterCraft',
    description: 'Private local admin desk for Contractor Desk user setup, starter data and support notes.',
    robots: 'noindex, nofollow',
  },
  '/OperatorDesk': {
    title: 'OperatorDesk | AlterCraft Internal Execution App',
    description:
      'AlterCraft OperatorDesk mobile command center for contractor leads, jobs, payment gates, cash, labour, materials, reports and disputes.',
    robots: 'noindex, follow',
    canonical: `${baseUrl}/operator-desk/dashboard`,
  },
  '/operator-desk': {
    title: 'OperatorDesk | AlterCraft Internal Execution App',
    description:
      'AlterCraft OperatorDesk mobile command center for contractor leads, jobs, payment gates, cash, labour, materials, reports and disputes.',
    robots: 'noindex, follow',
    canonical: `${baseUrl}/operator-desk/dashboard`,
  },
  '/operator-desk/dashboard': {
    title: 'OperatorDesk Dashboard | AlterCraft',
    description: 'Mobile execution dashboard for AlterCraft contractor jobs, payment gates, labour, materials and operational risk.',
    robots: 'noindex, follow',
  },
  '/operator-desk/leads': {
    title: 'OperatorDesk Leads | AlterCraft',
    description: 'Lead desk for contractor enquiries, customer follow-ups and job conversion.',
    robots: 'noindex, follow',
  },
  '/operator-desk/jobs': {
    title: 'OperatorDesk Jobs | AlterCraft',
    description: 'Job desk for execution stages, proof, blockers and payment-gate control.',
    robots: 'noindex, follow',
  },
  '/operator-desk/cash': {
    title: 'OperatorDesk Cash | AlterCraft',
    description: 'Cash ledger with inflow, outflow, buckets, proof and job linkage.',
    robots: 'noindex, follow',
  },
  '/operator-desk/labour': {
    title: 'OperatorDesk Labour | AlterCraft',
    description: 'Labour deployment desk for attendance, advances, daily rates and reliability.',
    robots: 'noindex, follow',
  },
  '/operator-desk/materials': {
    title: 'OperatorDesk Materials | AlterCraft',
    description: 'Material desk for vendor, rate, payment, procurement and delivery tracking.',
    robots: 'noindex, follow',
  },
  '/operator-desk/site-reports': {
    title: 'OperatorDesk Site Reports | AlterCraft',
    description: 'Daily site report desk for work updates, proof, issues and next actions.',
    robots: 'noindex, follow',
  },
  '/operator-desk/disputes': {
    title: 'OperatorDesk Disputes | AlterCraft',
    description: 'Dispute desk for evidence, amount at risk, proof and lawful next actions.',
    robots: 'noindex, follow',
  },
  '/operator-desk/reports': {
    title: 'OperatorDesk Reports | AlterCraft',
    description: 'Owner reports for active job value, pending payment, proof gaps and cash risk.',
    robots: 'noindex, follow',
  },
  '/operator-desk/settings': {
    title: 'OperatorDesk Settings | AlterCraft',
    description: 'OperatorDesk settings for JSON import, export, data reset and company doctrine.',
    robots: 'noindex, follow',
  },
  '/modular-kitchen': {
    title: `Modular Kitchen from ${modularKitchenPrice} in Ghaziabad & Delhi NCR | AlterCraft`,
    description:
      `Modular kitchen starts at ${modularKitchenPrice} for the agreed modular cabinet scope, with material guidance, measured planning and no hidden cost after scope confirmation.`,
  },
  '/modular-kitchen-near-me': {
    title: `Modular Kitchen Near Me from ${modularKitchenPrice} | AlterCraft`,
    description:
      `Find custom modular kitchen planning near you with AlterCraft. Kitchens start at ${modularKitchenPrice} for agreed cabinet scope in Ghaziabad, Noida and Delhi NCR.`,
  },
  '/modular-kitchen-ghaziabad': {
    title: `Modular Kitchen in Ghaziabad from ${modularKitchenPrice} | AlterCraft`,
    description:
      `AlterCraft modular kitchens in Ghaziabad start at ${modularKitchenPrice} for agreed cabinet scope, with storage planning, premium finishes and installation support.`,
  },
  '/modular-kitchen-noida': {
    title: `Modular Kitchen in Noida from ${modularKitchenPrice} | AlterCraft`,
    description:
      `Plan a modular kitchen in Noida from ${modularKitchenPrice} for agreed cabinet scope, with measured layout, material guidance and execution support by AlterCraft.`,
  },
  '/custom-furniture-maker-near-me': {
    title: 'Custom Furniture Maker Near Me | AlterCraft Ghaziabad NCR',
    description:
      'AlterCraft makes custom wardrobes, beds, shoe racks, TV units, office furniture and storage units for Ghaziabad, Noida, Greater Noida and Delhi NCR.',
  },
  '/furniture-maker-ghaziabad': {
    title: 'Furniture Maker in Ghaziabad | Custom Furniture by AlterCraft',
    description:
      'AlterCraft is a furniture maker in Ghaziabad for wardrobes, beds, modular kitchens, TV units, shoe racks, office furniture and measured custom storage work.',
  },
  '/furniture-maker-modinagar-ghaziabad': {
    title: 'Furniture Maker in Modinagar Ghaziabad | AlterCraft',
    description:
      'Furniture maker in Modinagar Ghaziabad for custom wardrobes, beds, shoe racks, TV units, office furniture, modular kitchen and made-to-measure storage.',
  },
  '/furniture-maker-in-modinagar-ghaziabad': {
    title: 'Furniture Maker in Modinagar Ghaziabad | AlterCraft',
    description:
      'Furniture maker in Modinagar Ghaziabad for custom wardrobes, beds, shoe racks, TV units, office furniture, modular kitchen and made-to-measure storage.',
    canonical: `${baseUrl}/furniture-maker-modinagar-ghaziabad/`,
  },
  '/modular-kitchen-quotation-ghaziabad': {
    title: `Modular Kitchen Quotation in Ghaziabad from ${modularKitchenPrice} | AlterCraft`,
    description:
      `Request a modular kitchen quotation in Ghaziabad from ${modularKitchenPrice} for agreed cabinet scope, with material, finish, hardware and installation details checked before final quote.`,
  },
  '/wardrobe-quotation-ghaziabad': {
    title: 'Wardrobe Quotation in Ghaziabad | Sliding, Swing and Loft Wardrobes',
    description:
      'Request a wardrobe quotation in Ghaziabad for sliding wardrobes, swing wardrobes, lofts, drawers, saree storage, luggage zones, material, finish and hardware.',
  },
  '/custom-furniture-quotation-ghaziabad': {
    title: 'Custom Furniture Quotation in Ghaziabad | AlterCraft',
    description:
      'Get a custom furniture quotation in Ghaziabad for wardrobes, beds, shoe racks, TV units, mandirs, office furniture and made-to-measure storage.',
  },
  '/workstation-manufacturers-ghaziabad': {
    title: 'Workstation Manufacturers in Ghaziabad | Office Furniture AlterCraft',
    description:
      'Workstation manufacturers in Ghaziabad for office desks, team workstations, cable-managed tables, storage, reception counters and commercial furniture.',
  },
  '/custom-furniture-ghaziabad': {
    title: 'Custom Furniture Maker in Ghaziabad | AlterCraft',
    description:
      'Custom furniture maker in Ghaziabad for wardrobes, beds, shoe racks, TV units, office furniture, storage, mandir units and made-to-measure interiors.',
  },
  '/custom-furniture-noida': {
    title: 'Custom Furniture Maker in Noida | AlterCraft',
    description:
      'AlterCraft plans and executes custom furniture in Noida, including wardrobes, beds, work desks, TV units, storage, office furniture and apartment interiors.',
  },
  '/custom-furniture-greater-noida': {
    title: 'Custom Furniture Maker in Greater Noida | AlterCraft',
    description:
      'Custom furniture in Greater Noida and Greater Noida West for new flats, wardrobes, beds, kitchens, storage, TV units and commercial furniture.',
  },
  '/ai-interior-design-planner': {
    title: 'AI Interior Design Planner India | AlterCraft Imagination Preview',
    description:
      'Upload site photos, dimensions, style and budget to request an AI-assisted imagination preview with human review for execution design and quotation.',
  },
  '/office-interior-ghaziabad': {
    title: 'Office Interior in Ghaziabad | AlterCraft Commercial Interiors',
    description:
      'Office interior and commercial furniture in Ghaziabad for workstations, reception counters, cabins, meeting rooms, storage and execution planning.',
  },
  '/office-interior-noida': {
    title: 'Office Interior in Noida | Workstations & Commercial Furniture',
    description:
      'Office interiors in Noida by AlterCraft with workstations, reception furniture, cabins, meeting tables, storage units and practical commercial execution.',
  },
  '/wardrobe-design-ghaziabad': {
    title: 'Wardrobe Design in Ghaziabad | Custom Wardrobes by AlterCraft',
    description:
      'Custom wardrobe design in Ghaziabad for sliding wardrobes, swing wardrobes, lofts, saree storage, luggage storage and premium bedroom finishes.',
  },
  '/wardrobe-ghaziabad': {
    title: 'Wardrobe in Ghaziabad | Sliding & Custom Wardrobes AlterCraft',
    description:
      'AlterCraft builds custom wardrobes in Ghaziabad with sliding, hinged, loft, mirror, saree storage, luggage storage and made-to-measure internal planning.',
  },
  '/tv-unit-ghaziabad': {
    title: 'TV Unit Design in Ghaziabad | Custom TV Wall by AlterCraft',
    description:
      'Custom TV unit design in Ghaziabad for living rooms with wall panels, storage, cable concealment, lighting, drawers and made-to-measure execution.',
  },
  '/office-furniture-ghaziabad': {
    title: 'Office Furniture in Ghaziabad | Workstations & Storage AlterCraft',
    description:
      'Office furniture in Ghaziabad by AlterCraft for workstations, reception desks, cabins, storage, meeting tables and commercial furniture execution.',
  },
  '/interiors-ghaziabad': {
    title: 'Interiors in Ghaziabad | Furniture-Led Home & Office Execution',
    description:
      'AlterCraft interiors in Ghaziabad for modular kitchens, wardrobes, beds, TV units, office furniture, storage and furniture-led execution planning.',
  },
  '/bed-manufacturer-ghaziabad': {
    title: 'Bed Manufacturer in Ghaziabad | Custom Beds by AlterCraft',
    description:
      'Custom bed manufacturer in Ghaziabad for storage beds, hydraulic beds, designer headboards, bedroom sets and made-to-measure furniture.',
  },
  '/shoe-rack-design': {
    title: 'Shoe Rack Design for Home Entrance | Custom Shoe Rack AlterCraft',
    description:
      'Plan custom shoe rack designs for home entrances with ventilation, seating, hidden storage, cleaning access and made-to-measure furniture by AlterCraft.',
  },
  '/kitchen': {
    title: `Modular Kitchen from ${modularKitchenPrice} | AlterCraft`,
    description:
      `Measured modular kitchens from ${modularKitchenPrice} for the agreed cabinet scope, with storage planning, material guidance and installation support.`,
    canonical: `${baseUrl}/modular-kitchen/`,
  },
  '/designer-beds': {
    title: 'Designer Beds & Bedroom Furniture | AlterCraft',
    description:
      'Custom designer beds, storage beds, hydraulic beds, headboards, side tables and coordinated bedroom furniture by AlterCraft.',
  },
  '/beds': {
    title: 'Designer Beds from INR 15,000 + Tax | AlterCraft Ghaziabad',
    description:
      'Explore 40 AlterCraft designer beds with Pan-India delivery. Straight non-hydraulic box beds from INR 15,000 + tax, curved from INR 17,500 + tax and signature from INR 21,000 + tax.',
    canonical: `${baseUrl}/beds/`,
  },
  '/flush-doors': {
    title: 'Premium Flush Doors & Room Doors | AlterCraft',
    description:
      'Premium flush doors and room doors with wood, laminate, textured, paint-ready and coordinated interior finish options by AlterCraft.',
  },
  '/doors': {
    title: 'Interior Doors & Flush Doors | AlterCraft',
    description:
      'Interior room doors, premium flush doors, hardware guidance and finish coordination with AlterCraft furniture and interior work.',
    canonical: `${baseUrl}/flush-doors/`,
  },
  '/wardrobes': {
    title: 'Wardrobes & Storage Furniture | AlterCraft',
    description:
      'Custom wardrobes and storage systems for bedrooms, utility spaces and homes, including sliding wardrobes, swing wardrobes, lofts and internal planning.',
  },
  '/storage': {
    title: 'Custom Storage Furniture | AlterCraft',
    description:
      'Custom storage furniture for wardrobes, lofts, utility cabinets, shoe racks and bedroom storage by AlterCraft.',
    canonical: `${baseUrl}/wardrobes/`,
  },
  '/office-commercial': {
    title: 'Office & Commercial Interiors | AlterCraft',
    description:
      'Office and commercial interiors by AlterCraft, including workstations, reception counters, cabins, meeting rooms, storage and commercial furniture.',
  },
  '/office': {
    title: 'Office Furniture & Commercial Interiors | AlterCraft',
    description:
      'Office furniture, workstations, reception counters, cabins, commercial storage and interior execution support by AlterCraft.',
    canonical: `${baseUrl}/office-commercial/`,
  },
  '/warranty-quality': {
    title: 'Warranty & Quality | AlterCraft',
    description:
      'AlterCraft warranty and quality information for eligible products, materials, hardware, workmanship, installation and after-sales support.',
  },
  '/warranty': {
    title: 'Warranty Support | AlterCraft',
    description:
      'Warranty support across eligible AlterCraft furniture, modular kitchen, wardrobe, bed, door, hardware, workmanship and installation work.',
    canonical: `${baseUrl}/warranty-quality/`,
  },
  '/shop': {
    title: 'Shop Custom Furniture Online | Beds, Wardrobes & Kitchens | AlterCraft',
    description:
      'Shop AlterCraft beds, wardrobes, mandir units, shoe racks, custom mattresses and modular kitchens. Fixed-price pieces and made-to-order work, delivered and installed Pan-India.',
  },
  // Signed-in surfaces: real pages so they do not 404, but nothing here is worth
  // indexing and the content differs per visitor.
  '/account': {
    title: 'Your Account | AlterCraft',
    description: 'Sign in to track AlterCraft orders, saved addresses and design requests.',
    robots: 'noindex, follow',
  },
  '/account/sign-in': {
    title: 'Sign In | AlterCraft',
    description: 'Sign in to your AlterCraft account to track orders and design requests.',
    robots: 'noindex, follow',
  },
  '/account/sign-up': {
    title: 'Create an Account | AlterCraft',
    description: 'Create an AlterCraft account to track orders, addresses and design requests.',
    robots: 'noindex, follow',
  },
  '/about': {
    title: 'About AlterCraft | Custom Furniture and Interiors',
    description:
      'About AlterCraft, a custom furniture, modular kitchen and interior execution studio delivering and installing Pan-India from our Ghaziabad experience store.',
  },
  '/contact': {
    title: 'Contact AlterCraft | Get Furniture and Interior Quote',
    description:
      'Contact AlterCraft for custom furniture, modular kitchen, wardrobe, bed, door, office interior and design preview enquiries, delivered Pan-India.',
  },
  '/get-quote': {
    title: 'Get a Quote | AlterCraft Furniture and Interiors',
    description:
      'Share photos, dimensions and requirements to get a measured quote for custom furniture, modular kitchen, wardrobe, bed, door or office interior work.',
    canonical: `${baseUrl}/contact/`,
  },
  '/ai-planner': {
    title: 'Create Your AI-Assisted Imagination Preview | AlterCraft',
    description:
      'Start an AlterCraft design preview request by sharing photos, measurements, budget and style. Human designers review concepts before execution.',
  },
  '/ai-planner/start': {
    title: 'Select Project Type | AlterCraft AI Design Planner',
    description:
      'Choose the room or furniture category for your AlterCraft AI-assisted imagination preview request.',
    ...noindexSeo,
  },
  '/ai-planner/upload': {
    title: 'Upload Site Photos | AlterCraft AI Design Planner',
    description:
      'Upload site photos, rough plans and references for an AlterCraft imagination preview request.',
    ...noindexSeo,
  },
  '/ai-planner/dimensions': {
    title: 'Add Fixed Dimensions | AlterCraft AI Design Planner',
    description:
      'Add length, width, height, door, window and service point details for an AlterCraft imagination preview request.',
    ...noindexSeo,
  },
  '/ai-planner/requirements': {
    title: 'Add Requirements | AlterCraft AI Design Planner',
    description:
      'Share style, budget, city, timeline and special notes for an AlterCraft imagination preview request.',
    ...noindexSeo,
  },
  '/ai-planner/confirm': {
    title: 'Confirm Measurement Lock | AlterCraft AI Design Planner',
    description:
      'Review and confirm fixed measurements before submitting your AlterCraft imagination preview request.',
    ...noindexSeo,
  },
  '/ai-planner/submitted': {
    title: 'Request Submitted | AlterCraft AI Design Planner',
    description:
      'Your AlterCraft imagination preview request has been received for team review.',
    robots: 'noindex, nofollow',
  },
};

const productSeo = {
  'wardrobe-01': {
    title: 'Custom Wardrobe Design | AlterCraft',
    description:
      'Explore custom wardrobe design by AlterCraft with storage planning, premium finishes, internal layout and made-to-measure execution.',
  },
  'wardrobe-02': {
    title: 'Modular Wardrobe & Storage | AlterCraft',
    description:
      'Modular wardrobe and bedroom storage options by AlterCraft with sliding, swing, loft and internal organization planning.',
  },
  'study-01': {
    title: 'Study Table & Work Desk | AlterCraft',
    description:
      'Custom study table and work desk furniture by AlterCraft with storage, cable access, shelves and room-fit planning.',
  },
  'mandir-01': {
    title: 'Pooja Mandir Design | AlterCraft',
    description:
      'Custom pooja mandir design for homes by AlterCraft with compact storage, lighting direction and elegant furniture finishes.',
  },
  'panel-01': {
    title: 'CNC Wall Panel & TV Unit Panels | AlterCraft',
    description:
      'CNC wall panels, TV unit panels and feature wall furniture directions by AlterCraft for homes and commercial interiors.',
  },
  'nameplate-01': {
    title: 'Custom LED Nameplate | AlterCraft',
    description:
      'Custom LED nameplates and entrance details by AlterCraft with premium finish options for homes, offices and shops.',
  },
  'rental-01': {
    title: 'Furniture on Rent in Ghaziabad & Noida | AlterCraft',
    description:
      'Furniture rental options for homes, offices, temporary setups and events in Ghaziabad, Noida and Delhi NCR by AlterCraft.',
  },
};

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const humanizeSlug = (route) =>
  route
    .split('/')
    .filter(Boolean)
    .pop()
    ?.replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase()) || 'AlterCraft';

const normalizeRoute = (route) => {
  const cleanRoute = route.replace(/[?#].*$/, '').replace(/\/$/, '');
  if (!cleanRoute || cleanRoute === '/') return '/';
  return cleanRoute.startsWith('/') ? cleanRoute : `/${cleanRoute}`;
};

const defaultCanonical = (route) => {
  const path = normalizeRoute(route);
  if (path === '/') return `${baseUrl}/`;
  if (path.startsWith('/product/')) return `${baseUrl}${path}`;
  return `${baseUrl}${path}/`;
};

const resolveProductSeo = (route) => {
  const productId = route.match(/^\/product\/([^/]+)$/)?.[1];
  if (!productId) return null;
  const seo = productSeo[productId] || {
    title: `${humanizeSlug(productId)} | AlterCraft Product`,
    description:
      'View AlterCraft product details, pricing direction and custom furniture enquiry options for Delhi NCR homes and offices.',
  };

  return {
    ...seo,
    canonical: `${baseUrl}/product/${productId}`,
  };
};

export const resolveSeoMetadata = (route) => {
  const path = normalizeRoute(route);
  const product = resolveProductSeo(path);
  const routeSpecific = routeSeo[path] || product || {};
  const canonical = routeSpecific.canonical || defaultCanonical(path);

  return {
    ...defaultSeo,
    ...routeSpecific,
    canonical,
    image: routeSpecific.image || defaultImage,
    ogType: routeSpecific.ogType || 'website',
  };
};

const replaceOrInsert = (html, pattern, replacement) => {
  if (pattern.test(html)) return html.replace(pattern, replacement);
  return html.replace('</head>', `      ${replacement}\n    </head>`);
};

export const applySeoMetadata = (html, route) => {
  const seo = resolveSeoMetadata(route);
  const title = escapeHtml(seo.title);
  const description = escapeHtml(seo.description);
  const canonical = escapeHtml(seo.canonical);
  const robots = escapeHtml(seo.robots);
  const image = escapeHtml(seo.image);
  const ogType = escapeHtml(seo.ogType);

  let nextHtml = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);

  nextHtml = replaceOrInsert(
    nextHtml,
    /<meta\s+name=["']description["'][\s\S]*?>/i,
    `<meta name="description" content="${description}" />`,
  );
  nextHtml = replaceOrInsert(
    nextHtml,
    /<meta\s+name=["']robots["'][\s\S]*?>/i,
    `<meta name="robots" content="${robots}" />`,
  );
  nextHtml = replaceOrInsert(
    nextHtml,
    /<link\s+rel=["']canonical["'][\s\S]*?>/i,
    `<link rel="canonical" href="${canonical}" />`,
  );
  nextHtml = replaceOrInsert(
    nextHtml,
    /<meta\s+property=["']og:title["'][\s\S]*?>/i,
    `<meta property="og:title" content="${title}" />`,
  );
  nextHtml = replaceOrInsert(
    nextHtml,
    /<meta\s+property=["']og:description["'][\s\S]*?>/i,
    `<meta property="og:description" content="${description}" />`,
  );
  nextHtml = replaceOrInsert(
    nextHtml,
    /<meta\s+property=["']og:url["'][\s\S]*?>/i,
    `<meta property="og:url" content="${canonical}" />`,
  );
  nextHtml = replaceOrInsert(
    nextHtml,
    /<meta\s+property=["']og:type["'][\s\S]*?>/i,
    `<meta property="og:type" content="${ogType}" />`,
  );
  nextHtml = replaceOrInsert(
    nextHtml,
    /<meta\s+property=["']og:image["'][\s\S]*?>/i,
    `<meta property="og:image" content="${image}" />`,
  );

  return nextHtml;
};
