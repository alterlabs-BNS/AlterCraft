import React from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Award, ShieldCheck, RefreshCw, Hammer } from 'lucide-react';
import { siteDetails } from '../data/siteDetails';

export function BuySection() {
  const warrantyFeatures = [
    {
      icon: ShieldCheck,
      title: "Category-Based Warranty",
      description: "Warranty support across eligible products, hardware, workmanship and installation."
    },
    {
      icon: RefreshCw,
      title: "Repairs & Replacements",
      description: "Confirmed warranty issues are handled through repair, adjustment or replacement as applicable."
    },
    {
      icon: Hammer,
      title: "Lifetime Support",
      description: "Even after documented warranty coverage ends, repair services and replacement parts can be arranged where available."
    },
    {
      icon: Award,
      title: "Quality Certification",
      description: "Every purchase comes with material certificates and a detailed quality report."
    }
  ];

  return (
    <section id="buy" className="py-24 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <div className="inline-block px-3 py-1 border border-[#6B5D4F]/30 rounded-full mb-4">
            <span className="text-xs tracking-widest text-[#6B5D4F]">FURNITURE SALES</span>
          </div>
          <h2 className="text-[#2C2419] mb-6">
            Buy with Confidence and Clear Warranty Support.
          </h2>
          <p className="text-[#5A4D3F] text-lg leading-relaxed">
            When you purchase from AlterCraft, you're not just buying furniture - you're
            investing in craftsmanship backed by {siteDetails.warranty}.
          </p>
        </div>

        {/* Main warranty highlight */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <div className="inline-flex items-center gap-3 bg-[#6B5D4F] text-[#FAF7F2] px-6 py-3 rounded-full mb-8">
              <Award className="w-6 h-6" />
              <span className="tracking-wide">WARRANTY SUPPORT</span>
            </div>
            
            <h3 className="text-3xl mb-6 text-[#2C2419]">
              Built to Last, Supported After Installation
            </h3>
            
            <p className="text-[#5A4D3F] mb-6 leading-relaxed">
              We stand behind the furniture, kitchens, doors and interiors we build. Warranty
              support is documented by category so the coverage is clear before work begins.
            </p>
            
            <p className="text-[#6B5D4F] leading-relaxed mb-8">
              Materials are recommended according to room use, moisture exposure, hardware load
              and installation conditions, so the result is practical as well as elegant.
            </p>

            <div className="bg-white p-6 rounded-sm border-l-4 border-[#6B5D4F]">
              <p className="text-[#2C2419] italic">
                "Warranty support is available across eligible products, services, hardware,
                workmanship and installation, based on the selected specification and documented
                scope."
              </p>
            </div>
          </div>

          <div className="relative h-[550px] rounded-sm overflow-hidden shadow-2xl">
            <ImageWithFallback 
              src="/images/generated/v1/joinery-soft-close.webp"
              alt="Quality furniture warranty support"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Warranty features grid */}
        <div className="mb-20">
          <h3 className="text-2xl text-center mb-12 text-[#2C2419]">
            What Warranty Support Can Cover
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {warrantyFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="p-8 bg-white rounded-sm shadow-md hover:shadow-xl transition-shadow border border-[#E5DDD1]"
                >
                  <div className="w-14 h-14 bg-[#6B5D4F]/10 rounded-full flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-[#6B5D4F]" />
                  </div>
                  <h4 className="text-lg mb-3 text-[#2C2419]">
                    {feature.title}
                  </h4>
                  <p className="text-[#6B5D4F] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coverage Details */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white p-8 rounded-sm border border-[#E5DDD1]">
            <h4 className="text-lg mb-4 text-[#2C2419]">
               Covered
            </h4>
            <ul className="space-y-2 text-[#5A4D3F] text-sm">
              <li>-  Plywood delamination</li>
              <li>-  Joint failures</li>
              <li>-  Hardware malfunctions</li>
              <li>-  Finish degradation</li>
              <li>-  Structural warping</li>
              <li>-  Manufacturing defects</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-sm border border-[#E5DDD1]">
            <h4 className="text-lg mb-4 text-[#2C2419]">
              What We Do
            </h4>
            <ul className="space-y-2 text-[#5A4D3F] text-sm">
              <li>-  Free on-site inspection</li>
              <li>-  Immediate repair scheduling</li>
              <li>-  Component replacement</li>
              <li>-  Full unit replacement if needed</li>
              <li>-  No-cost service visits</li>
              <li>-  Priority support line</li>
            </ul>
          </div>

          <div className="bg-[#2C2419] p-8 rounded-sm text-[#D4C5B0]">
            <h4 className="text-lg mb-4 text-[#FAF7F2]">
              Beyond Warranty
            </h4>
            <ul className="space-y-2 text-sm">
              <li>-  Lifetime repair services</li>
              <li>-  Spare parts availability</li>
              <li>-  Refinishing options</li>
              <li>-  Upgrade consultations</li>
              <li>-  Material documentation</li>
              <li>-  Care & maintenance guide</li>
            </ul>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-[#6B5D4F] to-[#5A4D3F] rounded-sm p-12 text-center text-[#FAF7F2]">
          <h3 className="text-3xl mb-4">
            Ready to Invest in Quality?
          </h3>
          <p className="text-xl text-[#D4C5B0] mb-8 max-w-2xl mx-auto">
            Schedule a consultation to discuss your needs, see materials firsthand, 
            and understand exactly what you're paying for.
          </p>
          <a
            href="#contact"
            className="px-10 py-4 bg-[#FAF7F2] text-[#2C2419] tracking-wide transition-all hover:bg-white hover:shadow-2xl inline-flex items-center justify-center"
          >
            Schedule Consultation
          </a>
        </div>
      </div>
    </section>
  );
}
