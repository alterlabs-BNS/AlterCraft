import React from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { siteDetails } from '../data/siteDetails';
import { trackEvent } from '../utils/analytics';

export function LandingHero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <ImageWithFallback 
          src="/images/generated/v1/brand-hero.webp"
          alt="Modern living room furniture"
          loading="eager"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#2C2419]/80 via-[#2C2419]/70 to-[#2C2419]/85" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center text-[#FAF7F2] py-32">
        <div className="mb-8">
          <div className="inline-block px-4 py-2 border border-[#D4C5B0]/30 rounded-full mb-6">
            <span className="text-sm tracking-widest text-[#D4C5B0]">CUSTOM + MODULAR FURNITURE</span>
          </div>
        </div>
        
        <h1 className="mb-8 text-[#FAF7F2] leading-tight max-w-4xl mx-auto">
          AlterCraft Woods & Furniture for Premium Modular Interiors
        </h1>
        
        <p className="text-2xl text-[#D4C5B0] max-w-3xl mx-auto mb-12 leading-relaxed">
          Modular kitchens, wardrobes, designer beds, flush doors and office interiors with
          {` ${siteDetails.pricingPromise.toLowerCase()}`} across Ghaziabad and Delhi NCR.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <a
            href={siteDetails.whatsappHref}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent('whatsapp_click', { location: 'hero' })}
            className="px-10 py-5 bg-[#6B5D4F] text-[#FAF7F2] tracking-wide transition-all hover:bg-[#5A4D3F] hover:shadow-2xl"
          >
            Get Quote on WhatsApp
          </a>
          <a
            href={siteDetails.phoneHref}
            onClick={() => trackEvent('phone_click', { location: 'hero' })}
            className="px-10 py-5 bg-transparent border-2 border-[#D4C5B0] text-[#FAF7F2] tracking-wide transition-all hover:bg-[#D4C5B0]/10 hover:shadow-2xl"
          >
            Call Now
          </a>
        </div>

        <div className="mt-20 grid grid-cols-3 gap-12 max-w-3xl mx-auto pt-12 border-t border-[#D4C5B0]/20">
          <div>
            <div className="text-4xl mb-2 text-[#D4C5B0]">All</div>
            <div className="text-sm text-[#9A8A77]">Eligible Categories</div>
          </div>
          <div>
            <div className="text-4xl mb-2 text-[#D4C5B0]">150</div>
            <div className="text-sm text-[#9A8A77]">km Service Radius</div>
          </div>
          <div>
            <div className="text-4xl mb-2 text-[#D4C5B0]">100%</div>
            <div className="text-sm text-[#9A8A77]">Measured Planning</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-[#D4C5B0]/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-[#D4C5B0]/50 rounded-full" />
        </div>
      </div>
    </section>
  );
}
