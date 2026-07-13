import React from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { siteDetails } from '../data/siteDetails';
import { catalogProducts } from '../data/catalog';
import { products } from '../data/products';
import { formatInr } from '../utils/pricing';
import { createWhatsappLink } from '../utils/contact';
import { trackEvent } from '../utils/analytics';

const productById = (id: string) => products.find((product) => product.id === id);
const catalogById = (id: string) => catalogProducts.find((product) => product.id === id);

const cards = [
  {
    name: 'Compact Swing Wardrobe',
    lineOne: 'Measured storage for compact bedrooms and apartments.',
    lineTwo: 'Swing doors, internal shelves and practical daily storage.',
    price: productById('wardrobe-02')?.prices.offer,
    image: productById('wardrobe-02')?.images[0],
  },
  {
    name: 'Modern Storage Bed',
    lineOne: 'A clean bed design with hydraulic storage.',
    lineTwo: 'Suitable for bedding, luggage and seasonal items.',
    price: productById('bed-02')?.prices.offer,
    image: productById('bed-02')?.images[0],
  },
  {
    name: 'Study Table with Storage',
    lineOne: 'Work-from-home desk with cable and drawer planning.',
    lineTwo: 'Built for study corners, bedrooms and home offices.',
    price: productById('study-01')?.prices.offer,
    image: productById('study-01')?.images[0],
  },
  {
    name: 'Kitchen Wall Unit',
    lineOne: 'Modular wall storage for Indian kitchens.',
    lineTwo: 'Current kitchen catalog pricing, refined after measurement.',
    price: catalogById('kitchen-wall-unit')?.marketBuy,
    image: catalogById('kitchen-wall-unit')?.image,
  },
  {
    name: 'Custom LED Nameplate',
    lineOne: 'Acrylic LED nameplates for homes and offices.',
    lineTwo: 'Weather-aware design with clean typography.',
    price: productById('nameplate-01')?.prices.offer,
    image: productById('nameplate-01')?.images[0],
  },
];

export function ProductHighlights() {
  return (
    <section id="products" className="py-24 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 border border-[#6B5D4F]/30 rounded-full mb-4">
            <span className="text-xs tracking-widest text-[#6B5D4F]">POPULAR UNITS</span>
          </div>
          <h2 className="text-[#2C2419] mb-4">Popular Modular Units</h2>
          <p className="text-[#5A4D3F] text-lg max-w-2xl mx-auto">
            Pricing is displayed from the current product and catalog data. Final quotes depend on
            measurements, material grade, finish and site scope.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((product) => (
            <div
              key={product.name}
              className="bg-white rounded-sm overflow-hidden shadow-md border border-[#E5DDD1] flex flex-col"
            >
              <div className="relative h-64 overflow-hidden">
                <ImageWithFallback
                  src={product.image ?? '/images/generated/v1/brand-hero.webp'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex flex-col h-full">
                <h3 className="text-xl mb-3 text-[#2C2419]">{product.name}</h3>
                <p className="text-sm text-[#5A4D3F] leading-relaxed">{product.lineOne}</p>
                <p className="text-sm text-[#5A4D3F] leading-relaxed mb-4">{product.lineTwo}</p>
                <div className="text-[#2C2419] mb-5">
                  {product.price ? `From ${formatInr(product.price)}` : 'Quote after measurement'}
                </div>
                <a
                  href={createWhatsappLink(`Hi AlterCraft, I want a quote for ${product.name}.`)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() =>
                    trackEvent('whatsapp_click', {
                      location: 'product_card',
                      item_name: product.name,
                    })
                  }
                  className="mt-6 inline-flex items-center justify-center px-4 py-3 bg-[#6B5D4F] text-[#FAF7F2] text-sm tracking-wide hover:bg-[#5A4D3F] transition-colors"
                >
                  Get Quote on WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[#6B5D4F] text-sm mt-8">
          Contact {siteDetails.phoneDisplay} for measured estimates and availability.
        </p>
      </div>
    </section>
  );
}
