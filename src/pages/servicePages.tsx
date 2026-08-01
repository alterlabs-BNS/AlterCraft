import React from 'react';
import { ServicePage } from '../components/elegant/ServicePage';
import '../styles/service-page.css';
import { products } from '../data/products';
import { catalogProducts } from '../data/catalog';
import { canvaVisuals } from '../data/visualAssets';
import { modularKitchenPricingLine, modularKitchenStartingPrice } from '../data/pricingFacts';
import { siteDetails } from '../data/siteDetails';
import { formatInr } from '../utils/pricing';

const productPrice = (id: string) => {
  const product = products.find((item) => item.id === id);
  return product && product.prices.offer > 0 ? formatInr(product.prices.offer) : 'Quote based on size';
};

const catalogBuyPrice = (id: string) => {
  const product = catalogProducts.find((item) => item.id === id);
  return product ? formatInr(product.marketBuy) : 'Quote based on size';
};

const flushDoorStart = formatInr(7600);

export function ModularKitchen() {
  return (
    <ServicePage
      seo={{
        title: `Modular Kitchen from ${modularKitchenStartingPrice}, Installed Pan-India | AlterCraft`,
        description: `${modularKitchenPricingLine} AlterCraft designs, manufactures and installs modular kitchens with BWP/BWR plywood options, laminate finishes, hardware guidance and measured quotations.`,
        canonical: 'https://www.altercraft.in/modular-kitchen/',
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'Modular Kitchen Design, Manufacturing and Installation',
            serviceType: 'Modular Kitchen',
            url: 'https://www.altercraft.in/modular-kitchen/',
            provider: {
              '@type': 'LocalBusiness',
              name: 'AlterCraft',
              telephone: '+918817503658',
              email: siteDetails.email,
            },
            areaServed: siteDetails.serviceAreas,
            description: `${modularKitchenPricingLine} Includes material guidance, measured planning and installation support after scope confirmation.`,
            offers: {
              '@type': 'Offer',
              priceCurrency: 'INR',
              price: '1200',
              unitText: 'sq. ft.',
              description:
                'Starting price for agreed modular cabinet scope; final quote after measurement and scope confirmation.',
            },
          },
        ],
      }}
      hero={{
        title: 'Modular Kitchen Solutions',
        subtitle:
          `Measured modular kitchens from ${modularKitchenStartingPrice} for homes across India, with practical storage, moisture-aware materials, branded hardware and elegant finishes.`,
        breadcrumb: 'Products / Modular Kitchen',
        image:
          '/images/generated/v1/kitchen-premium-u-shape.webp',
        imageAlt: 'Elegant modular kitchen with warm cabinetry',
        priceTag: `Modular kitchen from ${modularKitchenStartingPrice}`,
      }}
      priceStrip={{
        title: 'Modular kitchen starts at',
        highlight: modularKitchenStartingPrice,
        note: 'No hidden cost in the agreed modular cabinet scope after material, hardware, finish and site work are confirmed.',
      }}
      intro={{
        kicker: 'Kitchen Planning',
        title: 'A kitchen designed around how you cook every day',
        body:
          'AlterCraft plans modular kitchen estimates around real site measurements, base units, wall cabinets, tall storage, sink zones, appliance clearances and shutters. The finish stays elegant while the inside is built for daily Indian cooking.',
        image: canvaVisuals.kitchenVisual,
        imageAlt: 'AlterCraft Canva modular kitchen planning visual',
        points: [
          'BWR or BWP plywood options for moisture-prone kitchen zones.',
          'Soft-close hinges, drawers, bottle pull-outs and pantry hardware where required.',
          'Layout planning for straight, L-shaped, U-shaped, parallel and island kitchens.',
          'Warranty support across eligible materials, hardware, workmanship and installation.',
        ],
      }}
      cards={{
        kicker: 'Layouts',
        title: 'Kitchen Layout Options',
        items: [
          {
            title: 'L-Shape Kitchen',
            description: 'A balanced layout for medium rooms, with efficient cooking and storage flow.',
          },
          {
            title: 'Parallel Kitchen',
            description: 'Two-wall planning for apartments where counter space and movement matter.',
          },
          {
            title: 'U-Shape Kitchen',
            description: 'High-storage planning for larger kitchens with multiple work zones.',
          },
          {
            title: 'Straight Kitchen',
            description: 'Clean, compact cabinetry for studio apartments, rentals and smaller homes.',
          },
          {
            title: 'Island Kitchen',
            description: 'Premium planning with a central island for prep, serving and social use.',
          },
          {
            title: 'Tall Storage',
            description: 'Pantry and appliance towers for better use of vertical kitchen space.',
          },
        ],
      }}
      prices={[
        {
          label: 'Modular kitchen starting price',
          value: modularKitchenStartingPrice,
          note: 'Per sq. ft. for the agreed modular cabinet scope; final quote follows measurement and scope confirmation.',
        },
        {
          label: 'Kitchen wall unit',
          value: catalogBuyPrice('kitchen-wall-unit'),
          note: 'Current catalog buy price for unit-level planning',
        },
        {
          label: 'Kitchen tall unit',
          value: catalogBuyPrice('kitchen-tall-unit'),
          note: 'Current catalog buy price for unit-level planning',
        },
        {
          label: 'Kitchen base unit',
          value: catalogBuyPrice('kitchen-base-unit'),
          note: 'Current catalog buy price for unit-level planning',
        },
      ]}
      gallery={[
        {
          title: 'Warm Laminate Kitchen',
          description: 'Balanced storage with premium shutters and easy-clean surfaces.',
          image: canvaVisuals.kitchenVisual,
        },
        {
          title: 'Modern White Kitchen',
          description: 'Light finishes with practical wall storage and appliance space.',
          image: canvaVisuals.kitchenVisual,
        },
        {
          title: 'Island Planning',
          description: 'A premium prep and serving zone for open kitchens.',
          image:
            '/images/generated/v1/kitchen-premium-u-shape.webp',
        },
        {
          title: 'Compact Kitchen',
          description: 'Straight and parallel layouts for tighter apartment spaces.',
          image:
            '/images/generated/v1/kitchen-compact-l-shape.webp',
        },
      ]}
      quoteService="Modular Kitchen"
    />
  );
}

export function DesignerBeds() {
  return (
    <ServicePage
      hero={{
        title: 'Designer Beds & Bedroom Furniture',
        subtitle:
          'Custom beds, storage beds and coordinated bedroom furniture with premium finishes and practical everyday detailing.',
        breadcrumb: 'Products / Designer Beds',
        image:
          '/images/generated/v1/bed-upholstered-drawer.webp',
        imageAlt: 'Premium designer bedroom',
        priceTag: `Designer beds from ${productPrice('bed-02')}`,
      }}
      priceStrip={{
        title: 'Designer beds from',
        highlight: productPrice('bed-02'),
        note: 'Current bed pricing is taken from the product data already present in the repo.',
      }}
      intro={{
        kicker: 'Bedroom Craft',
        title: 'Comfort, storage and visual calm in one bedroom system',
        body:
          'The bed is planned with room movement, side tables, headboard height, switch points and storage access in mind. Finishes can be coordinated with wardrobes, wall panels and study corners.',
        image:
          '/images/generated/v1/bed-hydraulic-storage.webp',
        imageAlt: 'Designer bed with premium headboard',
        points: [
          'Hydraulic storage, box storage and drawer storage options.',
          'Custom queen, king and made-to-measure sizing.',
          'Upholstered, fluted, wooden, veneer and laminate headboard finishes.',
          'Warranty support across eligible structure, hardware, workmanship and installation.',
        ],
      }}
      cards={{
        kicker: 'Bed Styles',
        title: 'Bedroom Furniture Options',
        items: [
          {
            title: 'Storage Bed',
            description: 'Hydraulic or drawer storage for bedding, luggage and seasonal items.',
          },
          {
            title: 'Platform Bed',
            description: 'A low, clean silhouette for modern bedrooms and compact layouts.',
          },
          {
            title: 'Upholstered Bed',
            description: 'Soft fabric or leatherette headboards for a warmer, more luxurious room.',
          },
          {
            title: 'Panel Headboard',
            description: 'Wall-mounted or bed-mounted panels with fluted, veneer or laminate finish.',
          },
          {
            title: 'Bedroom Storage',
            description: 'Side tables, dressers and storage units coordinated with the bed.',
          },
          {
            title: 'Rental Friendly',
            description: 'Selected beds are available for rent with monthly pricing in the product data.',
          },
        ],
      }}
      prices={[
        {
          label: 'Modern storage bed',
          value: productPrice('bed-02'),
          note: 'Current offer price',
        },
        {
          label: 'Luxury king platform bed',
          value: productPrice('bed-01'),
          note: 'Current offer price',
        },
        {
          label: 'Queen bed with storage',
          value: catalogBuyPrice('queen-bed'),
          note: 'Current catalog buy price',
        },
      ]}
      gallery={[
        {
          title: 'Storage Bed',
          description: 'Clean storage access without making the bedroom feel heavy.',
          image:
            '/images/generated/v1/bed-hydraulic-storage.webp',
        },
        {
          title: 'Upholstered Headboard',
          description: 'Soft finish, premium comfort and a calm visual anchor.',
          image:
            '/images/generated/v1/bed-upholstered-drawer.webp',
        },
        {
          title: 'Platform Bed',
          description: 'Modern low-profile structure with warm material detailing.',
          image:
            '/images/generated/v1/bed-upholstered-drawer.webp',
        },
        {
          title: 'Coordinated Bedroom',
          description: 'Bed, wardrobe and wall finish planned together.',
          image:
            '/images/generated/v1/walk-in-indian-storage.webp',
        },
      ]}
      quoteService="Designer Beds"
    />
  );
}

export function FlushDoors() {
  return (
    <ServicePage
      hero={{
        title: 'Premium Room Flush Doors',
        subtitle:
          'Elegant room doors with durable cores, refined finishes and door-specific warranty coverage, planned alongside your interiors.',
        breadcrumb: 'Products / Flush Doors',
        image:
          '/images/generated/v1/flush-door.webp',
        imageAlt: 'Premium wooden room door',
        priceTag: `Flush doors from ${flushDoorStart}`,
      }}
      priceStrip={{
        title: 'Room flush doors from',
        highlight: flushDoorStart,
        note: 'Final door pricing depends on size, core, finish, frame, hardware and installation scope.',
      }}
      intro={{
        kicker: 'Door Quality',
        title: 'Doors that feel aligned with the rest of the interior',
        body:
          'Flush doors can be finished in veneer, laminate, PVC, paint-ready or premium textured surfaces. The goal is a durable door that matches the room instead of looking like an afterthought.',
        image:
          '/images/generated/v1/flush-door.webp',
        imageAlt: 'Flush door detail in warm wood finish',
        points: [
          'Termite-resistant and moisture-aware core options.',
          'Veneer, matte laminate, textured PVC and paint-ready finishes.',
          'Custom door sizes and finish coordination with wardrobes and wall panels.',
          'Door warranty available for eligible flush door specifications.',
        ],
      }}
      cards={{
        kicker: 'Finishes',
        title: 'Door Finish Options',
        items: [
          {
            title: 'Natural Wood Veneer',
            description: 'Rich wood grain for premium bedrooms, living rooms and office cabins.',
          },
          {
            title: 'Matte Laminate',
            description: 'Clean, practical and easy to maintain for modern home interiors.',
          },
          {
            title: 'Textured PVC',
            description: 'A moisture-friendly surface option for suitable wet or utility zones.',
          },
          {
            title: 'High Gloss',
            description: 'A reflective, contemporary finish for statement interior doors.',
          },
          {
            title: 'Paint Ready',
            description: 'Primed doors that can be matched to wall and trim colours.',
          },
          {
            title: 'Digital Finish',
            description: 'Custom patterns, concrete looks or marble-inspired surfaces.',
          },
        ],
      }}
      prices={[
        {
          label: 'Flush door starting price',
          value: flushDoorStart,
          note: 'Final quote after size and finish selection',
        },
        {
          label: 'Warranty support',
          value: 'Category based',
          note: 'Door-specific warranty where applicable',
        },
        {
          label: 'Installation',
          value: 'Quoted with scope',
          note: 'Depends on frame, hardware and site condition',
        },
      ]}
      gallery={[
        {
          title: 'Warm Wood Door',
          description: 'A premium finish for bedrooms and family spaces.',
          image:
            '/images/generated/v1/flush-door.webp',
        },
        {
          title: 'Panel Door Look',
          description: 'A refined visual upgrade for modern interiors.',
          image:
            '/images/generated/v1/flush-door.webp',
        },
        {
          title: 'Classic Finish',
          description: 'Simple, durable and easy to coordinate.',
          image:
            '/images/generated/v1/flush-door.webp',
        },
        {
          title: 'Interior Coordination',
          description: 'Doors planned with wardrobes, floors and wall panels.',
          image:
            '/images/generated/v1/flush-door.webp',
        },
      ]}
      quoteService="Flush Doors"
    />
  );
}

export function Wardrobes() {
  return (
    <ServicePage
      hero={{
        title: 'Wardrobes & Storage',
        subtitle:
          'Sliding wardrobes, swing wardrobes, lofts and internal storage systems designed around your room and daily routine.',
        breadcrumb: 'Products / Wardrobes',
        image:
          '/images/generated/v1/walk-in-indian-storage.webp',
        imageAlt: 'Walk-in wardrobe with elegant storage',
        priceTag: `Wardrobes from ${productPrice('wardrobe-02')}`,
      }}
      priceStrip={{
        title: 'Wardrobes from',
        highlight: productPrice('wardrobe-02'),
        note: 'Current wardrobe offer pricing is taken from the product data.',
      }}
      intro={{
        kicker: 'Storage Planning',
        title: 'A wardrobe should make the room easier to live in',
        body:
          'We plan hanging space, drawers, shelves, loft storage, luggage zones, mirror shutters and lighting before fabrication. The outside stays elegant while the inside solves daily storage.',
        image: canvaVisuals.wardrobeVisual,
        imageAlt: 'AlterCraft Canva wardrobe and storage planning visual',
        points: [
          'Sliding, swing, mirror, loft and walk-in wardrobe options.',
          'Internal layouts for sarees, lehengas, luggage, daily wear and seasonal storage.',
          'Soft-close channels, hinges and premium hardware where specified.',
          'Warranty support across eligible products, hardware, workmanship and installation.',
        ],
      }}
      cards={{
        kicker: 'Wardrobe Types',
        title: 'Storage Systems We Build',
        items: [
          {
            title: 'Sliding Wardrobe',
            description: 'Space-saving shutters for compact bedrooms and clean modern fronts.',
          },
          {
            title: 'Swing Wardrobe',
            description: 'Full access storage with classic hinged doors and easy hardware service.',
          },
          {
            title: 'Mirror Wardrobe',
            description: 'A brighter room with full-length mirror shutters and balanced storage.',
          },
          {
            title: 'Loft Storage',
            description: 'Upper storage for luggage, blankets and occasional-use items.',
          },
          {
            title: 'Walk-in Closet',
            description: 'Premium open and closed storage zones for larger bedrooms.',
          },
          {
            title: 'Utility Storage',
            description: 'Balcony, hallway and service storage planned for practical daily use.',
          },
        ],
      }}
      prices={[
        {
          label: 'Compact swing-door wardrobe',
          value: productPrice('wardrobe-02'),
          note: 'Current offer price',
        },
        {
          label: 'Executive sliding wardrobe',
          value: productPrice('wardrobe-01'),
          note: 'Current offer price',
        },
        {
          label: 'Two door wardrobe',
          value: catalogBuyPrice('wardrobe-2-door'),
          note: 'Current catalog buy price',
        },
      ]}
      gallery={[
        {
          title: 'Sliding Wardrobe',
          description: 'Smooth tracks, mirror option and compact room clearance.',
          image: canvaVisuals.wardrobeVisual,
        },
        {
          title: 'Walk-in Storage',
          description: 'Premium organisation for larger bedrooms and dressing zones.',
          image: canvaVisuals.wardrobeVisual,
        },
        {
          title: 'Warm Laminate Finish',
          description: 'Elegant neutral finish for daily-use bedrooms.',
          image:
            '/images/generated/v1/wardrobe-sliding-smoked.webp',
        },
        {
          title: 'Compact Storage',
          description: 'Measured units for apartments, rentals and PG rooms.',
          image:
            '/images/generated/v1/wardrobe-internal-storage.webp',
        },
      ]}
      quoteService="Wardrobes & Storage"
    />
  );
}

export function OfficeCommercial() {
  return (
    <ServicePage
      hero={{
        title: 'Office & Commercial Interiors',
        subtitle:
          'Workstations, storage, reception units and commercial furniture with restrained, durable detailing for everyday business use.',
        breadcrumb: 'Products / Office Interiors',
        image:
          '/images/generated/v1/office-commercial-interior.webp',
        imageAlt: 'Premium office interior with workstations',
        priceTag: `Study desks from ${productPrice('study-02')}`,
      }}
      priceStrip={{
        title: 'Office furniture from',
        highlight: productPrice('study-02'),
        note: 'Current office and study furniture pricing comes from the product and catalog data.',
      }}
      intro={{
        kicker: 'Commercial Planning',
        title: 'Quiet, efficient furniture for real workspaces',
        body:
          'Office furniture should be easy to maintain, comfortable to use and neat enough for clients. We plan workstations, cable routing, storage, reception counters and meeting furniture with durable finishes.',
        image: canvaVisuals.office,
        imageAlt: 'AlterCraft Canva office interior planning visual',
        points: [
          'Workstations, study desks, office chairs, storage and meeting furniture.',
          'Cable management, modesty panels and practical laminate surfaces.',
          'Custom layouts for offices, studios, clinics, shops and commercial cabins.',
          'Warranty support across eligible products, hardware, workmanship and installation.',
        ],
      }}
      cards={{
        kicker: 'Commercial Categories',
        title: 'Office Furniture We Build',
        items: [
          {
            title: 'Workstations',
            description: 'Single, two-person and team workstations with cable-ready planning.',
          },
          {
            title: 'Reception Counters',
            description: 'Front desks with storage, branding space and durable surfaces.',
          },
          {
            title: 'Storage Units',
            description: 'Files, bookshelves, cabinets and lockable storage for offices.',
          },
          {
            title: 'Meeting Tables',
            description: 'Professional tables built to suit room size and seating count.',
          },
          {
            title: 'Study Desks',
            description: 'Compact work-from-home desks and wall-mounted furniture.',
          },
          {
            title: 'Commercial Fitouts',
            description: 'Furniture planning for shops, studios, offices and service spaces.',
          },
        ],
      }}
      prices={[
        {
          label: 'Wall-mounted study desk',
          value: productPrice('study-02'),
          note: 'Current offer price',
        },
        {
          label: 'Ergonomic study table',
          value: productPrice('study-01'),
          note: 'Current offer price',
        },
        {
          label: 'Two person workstation',
          value: catalogBuyPrice('workstation-2p'),
          note: 'Current catalog buy price',
        },
      ]}
      gallery={[
        {
          title: 'Workstation Layout',
          description: 'Clean desks with cable planning and practical surfaces.',
          image: canvaVisuals.office,
        },
        {
          title: 'Office Storage',
          description: 'Shelving and cabinets for organized workspaces.',
          image:
            '/images/generated/v1/office-commercial-interior.webp',
        },
        {
          title: 'Executive Cabin',
          description: 'Warm wood finishes with a professional, restrained look.',
          image:
            '/images/generated/v1/design-planning.webp',
        },
        {
          title: 'Commercial Furniture',
          description: 'Durable furniture systems for everyday business use.',
          image:
            '/images/generated/v1/office-commercial-interior.webp',
        },
      ]}
      quoteService="Office & Commercial Interiors"
    />
  );
}
