import React, { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, MapPin, Phone, Ruler, ShieldCheck } from 'lucide-react';
import { siteDetails } from '../data/siteDetails';
import { modularKitchenStartingPrice } from '../data/pricingFacts';
import { createWhatsappLink } from '../utils/contact';
import { trackEvent } from '../utils/analytics';

type HeroCategory = {
  key: string;
  label: string;
  image: string;
  to: string;
};

// Full-strength imagery, served crisp. One image leads; the rest are
// swapped in on tap/click so the "explore the scene" idea works on touch too.
const HERO_CATEGORIES: HeroCategory[] = [
  {
    key: 'kitchen',
    label: 'Modular Kitchens',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1920&h=1080&fit=crop&q=82',
    to: '/modular-kitchen-near-me',
  },
  {
    key: 'wardrobe',
    label: 'Wardrobes',
    image: 'https://images.unsplash.com/photo-1672137233327-37b0c1049e77?w=1920&h=1080&fit=crop&q=82',
    to: '/wardrobes',
  },
  {
    key: 'beds',
    label: 'Beds',
    image: 'https://images.unsplash.com/photo-1644057501622-dfa7dd26dbfb?w=1920&h=1080&fit=crop&q=82',
    to: '/beds',
  },
  {
    key: 'doors',
    label: 'Doors',
    image: 'https://images.unsplash.com/photo-1634822930432-0594057fdff2?w=1920&h=1080&fit=crop&q=82',
    to: '/flush-doors',
  },
  {
    key: 'office',
    label: 'Office Interiors',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1920&h=1080&fit=crop&q=82',
    to: '/office-commercial',
  },
];

// "INR 1,200 / sq. ft." -> "1,200 / sq. ft." for a compact price hook.
const priceValue = modularKitchenStartingPrice.replace(/^INR\s*/i, '');

export function HeroPoster() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = HERO_CATEGORIES[activeIndex];

  return (
    <section className="ac-hero" aria-label="AlterCraft custom and modular furniture">
      {/* Background image — crisp, full strength, with a scrim only where text sits */}
      <div className="ac-hero-media">
        {HERO_CATEGORIES.map((cat, idx) => (
          <img
            key={cat.key}
            src={cat.image}
            alt={idx === activeIndex ? `${cat.label} by AlterCraft` : ''}
            className={`ac-hero-image ${idx === activeIndex ? 'is-active' : ''}`}
            loading={idx === 0 ? 'eager' : 'lazy'}
            decoding="async"
            aria-hidden={idx === activeIndex ? undefined : true}
          />
        ))}
        <div className="ac-hero-scrim" />
      </div>

      <div className="ac-hero-inner">
        <p className="ac-hero-eyebrow">
          <span className="ac-hero-eyebrow-dot" />
          AlterCraft Woods &amp; Furniture · Ghaziabad &amp; Delhi NCR
        </p>

        <h1 className="ac-hero-title">
          Custom &amp; modular furniture,<br className="ac-hero-br" /> built to your exact space.
        </h1>

        <p className="ac-hero-subhead">
          Modular kitchens, wardrobes, beds, doors and office interiors — measured, quoted
          and installed by our own team across Delhi NCR.
        </p>

        <div className="ac-hero-price">
          <span className="ac-hero-price-value">₹{priceValue}</span>
          <span className="ac-hero-price-label">starting, modular kitchens</span>
        </div>

        <div className="ac-hero-actions">
          <a
            href={createWhatsappLink('Hi AlterCraft, I would like a quote for my furniture / interior work.')}
            target="_blank"
            rel="noreferrer"
            className="ac-hero-cta"
            onClick={() => trackEvent('whatsapp_click', { location: 'hero_primary' })}
          >
            Get a Free Quote
            <ArrowRight size={18} />
          </a>
          <a
            href={siteDetails.phoneHref}
            className="ac-hero-call"
            onClick={() => trackEvent('phone_click', { location: 'hero' })}
          >
            <Phone size={16} />
            {siteDetails.phoneDisplay}
          </a>
        </div>

        {/* Tap/click category switcher — the touch-friendly "explore" fallback */}
        <div className="ac-hero-tabs" role="tablist" aria-label="Browse furniture categories">
          {HERO_CATEGORIES.map((cat, idx) => (
            <button
              key={cat.key}
              type="button"
              role="tab"
              aria-selected={idx === activeIndex}
              className={`ac-hero-tab ${idx === activeIndex ? 'is-active' : ''}`}
              onClick={() => setActiveIndex(idx)}
            >
              {cat.label}
            </button>
          ))}
          <Link to={active.to} className="ac-hero-tab-link" aria-label={`View ${active.label}`}>
            View {active.label}
            <ArrowRight size={14} />
          </Link>
        </div>

        <ul className="ac-hero-trust">
          <li>
            <MapPin size={15} />
            {siteDetails.serviceRadius} service radius
          </li>
          <li>
            <ShieldCheck size={15} />
            Warranty support on eligible work
          </li>
          <li>
            <Ruler size={15} />
            Measured, made-to-order
          </li>
        </ul>
      </div>

      {/* Right-column journey visual — desktop only, decorative */}
      <div className="ac-hero-showcase" aria-hidden="true">
        <figure className="ac-hero-showcase-card lead">
          <img src={active.image} alt="" loading="lazy" decoding="async" />
          <figcaption>
            <span className="ac-hero-showcase-step">03 · Installed</span>
            <strong>{active.label}</strong>
          </figcaption>
        </figure>
        <figure className="ac-hero-showcase-card mid">
          <img src={HERO_CATEGORIES[(activeIndex + 1) % HERO_CATEGORIES.length].image} alt="" loading="lazy" decoding="async" />
          <figcaption>
            <span className="ac-hero-showcase-step">02 · Design preview</span>
          </figcaption>
        </figure>
        <div className="ac-hero-showcase-badge">
          <span className="ac-hero-showcase-badge-value">{siteDetails.serviceRadius.replace(/\s*km/i, '')}</span>
          <span className="ac-hero-showcase-badge-unit">km reach</span>
        </div>
      </div>
    </section>
  );
}
