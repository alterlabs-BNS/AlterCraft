import React from 'react';
import { CheckCircle, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { ElegantLayout } from '../components/elegant/ElegantLayout';
import { PageHero } from '../components/elegant/PageHero';
import { QuoteForm } from '../components/elegant/QuoteForm';
import { siteDetails } from '../data/siteDetails';

const qualityPoints = [
  'Material recommendations based on room use, moisture exposure and budget.',
  'Hardware selected for everyday durability, not only appearance.',
  'Measured fabrication with installation details checked before handover.',
  'Warranty support across eligible products, services, hardware, workmanship and installation.',
];

export function WarrantyQuality() {
  return (
    <ElegantLayout>
      <PageHero
        title="Warranty & Quality"
        subtitle="Clear material choices, careful fabrication, professional installation and warranty support across eligible AlterCraft products and services."
        breadcrumb="Company / Warranty"
        image="/images/generated/v1/joinery-soft-close.webp"
        imageAlt="Premium furniture quality details"
        priceTag="Warranty support across eligible categories"
      />

      <section className="elegant-section">
        <div className="elegant-container elegant-split">
          <div>
            <p className="elegant-kicker">Quality Promise</p>
            <h2 className="elegant-heading">Built for daily Indian homes and working spaces</h2>
            <p className="elegant-copy">
              Warranty is not limited to doors. AlterCraft provides warranty support wherever
              applicable across furniture, interiors, hardware, workmanship and installation,
              depending on the selected category, material and usage conditions.
            </p>
            <div className="elegant-check-list">
              {qualityPoints.map((point) => (
                <div className="elegant-check" key={point}>
                  <CheckCircle size={18} />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
          <img
            src="/images/generated/v1/living-media-wall.webp"
            alt="Premium interior finish quality"
          />
        </div>
      </section>

      <section className="elegant-section elegant-section-muted">
        <div className="elegant-container">
          <div className="elegant-section-head">
            <p className="elegant-kicker">Coverage</p>
            <h2 className="elegant-heading">Warranty Support by Category</h2>
            <p className="elegant-copy">
              Coverage is documented at quotation and invoice stage so the scope stays clear.
            </p>
          </div>
          <div className="elegant-grid">
            {[
              ['Furniture & Storage', 'Eligible wardrobes, beds, study tables, cabinets and storage units receive support for specified structure, workmanship and hardware.'],
              ['Kitchens & Interiors', 'Eligible modular kitchens and commercial interiors receive support based on materials, hardware and installation scope.'],
              ['Flush Doors', 'Door-specific warranty remains available for eligible flush door specifications, including relevant manufacturing defects.'],
              ['Hardware', 'Branded hinges, channels, tracks and fittings are covered according to product category and brand terms.'],
              ['Installation', 'Installation workmanship is supported according to site scope and documented handover conditions.'],
              ['After-Sales Help', 'Share photos and invoice details on WhatsApp and the team will guide the next step.'],
            ].map(([title, description]) => (
              <article className="elegant-card" key={title}>
                <div className="elegant-card-body">
                  <ShieldCheck size={28} color="var(--accent)" />
                  <h3 style={{ marginTop: '1rem' }}>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="elegant-section">
        <div className="elegant-container">
          <div className="elegant-quote-card">
            <p className="elegant-kicker">Support</p>
            <h2 className="elegant-heading">Need warranty or service help?</h2>
            <p className="elegant-copy">
              Send product photos, invoice details and the issue summary on WhatsApp. We will review
              the case and advise repair, adjustment, replacement or site inspection where applicable.
            </p>
            <div style={{ marginTop: '1.5rem' }}>
              <QuoteForm defaultService="Repair / Warranty Support" />
            </div>
          </div>
        </div>
      </section>
    </ElegantLayout>
  );
}

export function About() {
  return (
    <ElegantLayout>
      <PageHero
        title="About AlterCraft"
        subtitle="A Ghaziabad-based furniture and interiors studio building measured furniture, modular storage and elegant interior elements for homes and businesses."
        breadcrumb="Company / About"
        image="/images/generated/v1/cnc-workshop.webp"
        imageAlt="Furniture craftsmanship workshop detail"
        priceTag="Serving Ghaziabad, Delhi NCR and nearby cities"
      />

      <section className="elegant-section">
        <div className="elegant-container elegant-split">
          <div>
            <p className="elegant-kicker">Our Work</p>
            <h2 className="elegant-heading">Custom furniture with a measured, premium finish</h2>
            <p className="elegant-copy">
              AlterCraft works on modular kitchens, designer beds, wardrobes, flush doors, office
              furniture, CNC panels, mandirs, study tables and storage systems. Every project begins
              with the room, the use case and the material choice, then moves into fabrication and
              installation.
            </p>
            <div className="elegant-check-list">
              {[
                'Transparent, itemized quotations based on size, material, finish and hardware.',
                'Practical planning for Indian homes, apartments, offices and rental spaces.',
                'Premium beige, wood, laminate, veneer and neutral palettes available.',
                'Warranty support across eligible products and services wherever applicable.',
              ].map((point) => (
                <div className="elegant-check" key={point}>
                  <CheckCircle size={18} />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
          <img
            src="/images/generated/v1/joinery-soft-close.webp"
            alt="Wood material and furniture craftsmanship"
          />
        </div>
      </section>

      <section className="elegant-section elegant-section-muted">
        <div className="elegant-container">
          <div className="elegant-section-head">
            <p className="elegant-kicker">Values</p>
            <h2 className="elegant-heading">How We Work</h2>
          </div>
          <div className="elegant-grid">
            {[
              ['Measured First', 'Room dimensions, socket positions, clearance and daily use guide the design.'],
              ['Material Honesty', 'We explain where plywood, HDHMR, MDF, veneer, laminate or other boards make sense.'],
              ['Clean Finish', 'Edges, hardware, symmetry and installation details are treated as part of the design.'],
              ['Reliable Support', 'After handover, warranty and service support remain part of the relationship.'],
              ['Clear Scope', 'Professional quotations, realistic timelines and careful execution.'],
              ['Registered Business', `GSTIN ${siteDetails.gstin} and Udyam ${siteDetails.udyamRegistration}.`],
              ['Regional Reach', `Projects are served across ${siteDetails.serviceRadius} from ${siteDetails.shortAddress}.`],
            ].map(([title, description]) => (
              <article className="elegant-card" key={title}>
                <div className="elegant-card-body">
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </ElegantLayout>
  );
}

export function Contact() {
  return (
    <ElegantLayout>
      <PageHero
        title="Contact / Get Quote"
        subtitle="Share room measurements, reference photos, material preference and timeline. Your enquiry goes directly to WhatsApp for faster response."
        breadcrumb="Contact"
        image="/images/generated/v1/brand-hero.webp"
        imageAlt="Elegant interior contact page"
        priceTag={`WhatsApp ${siteDetails.phoneDisplay}`}
      />

      <section className="elegant-section">
        <div className="elegant-container elegant-split">
          <div className="elegant-quote-card" style={{ margin: 0 }}>
            <p className="elegant-kicker">Get Quote</p>
            <h2 className="elegant-heading">Tell us what you want built</h2>
            <p className="elegant-copy">
              Include room size, product type, finish preference and any reference photo details.
              The form opens WhatsApp with your enquiry ready to send.
            </p>
            <div style={{ marginTop: '1.5rem' }}>
              <QuoteForm defaultService="Custom Furniture" />
            </div>
          </div>

          <div>
            <p className="elegant-kicker">Contact Details</p>
            <h2 className="elegant-heading">Reach AlterCraft Directly</h2>
            <div className="elegant-check-list">
              <a className="elegant-check" href={siteDetails.phoneHref}>
                <Phone size={18} />
                <span>{siteDetails.phoneDisplay}</span>
              </a>
              <a className="elegant-check" href={siteDetails.whatsappHref}>
                <MessageCircle size={18} />
                <span>WhatsApp {siteDetails.phoneDisplay}</span>
              </a>
              <a className="elegant-check" href={siteDetails.emailHref}>
                <Mail size={18} />
                <span>{siteDetails.email}</span>
              </a>
              <div className="elegant-check">
                <MapPin size={18} />
                <span>{siteDetails.fullAddress}</span>
              </div>
            </div>
            <div className="elegant-pricing-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="elegant-price-card">
                <span>Working Hours</span>
                <strong>{siteDetails.workingHours}</strong>
                <p>For faster quotation, send measurements and photos on WhatsApp.</p>
              </div>
              <div className="elegant-price-card">
                <span>Service Coverage</span>
                <strong>{siteDetails.serviceRadius}</strong>
                <p>Ghaziabad, Noida, Greater Noida, Delhi, Gurugram and nearby locations.</p>
              </div>
              <div className="elegant-price-card">
                <span>GSTIN</span>
                <strong>{siteDetails.gstin}</strong>
                <p>Registered trade name: {siteDetails.tradeName}. Legal name: {siteDetails.legalName}.</p>
              </div>
              <div className="elegant-price-card">
                <span>Udyam Registration</span>
                <strong>{siteDetails.udyamRegistration}</strong>
                <p>{siteDetails.unitName} is registered for {siteDetails.businessActivity.toLowerCase()}.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ElegantLayout>
  );
}

export function NotFound() {
  return (
    <ElegantLayout>
      <section className="elegant-section">
        <div className="elegant-container" style={{ textAlign: 'center' }}>
          <p className="elegant-kicker">404</p>
          <h1 className="elegant-heading">Page Not Found</h1>
          <p className="elegant-copy">This page is not available. Return home or request a quote.</p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a className="elegant-button" href="/">Go Home</a>
            <a className="elegant-button-secondary" href={siteDetails.whatsappHref}>Get Quote</a>
          </div>
        </div>
      </section>
    </ElegantLayout>
  );
}
