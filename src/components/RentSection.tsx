import React from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Shield, Wrench, Repeat, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { siteDetails } from '../data/siteDetails';

export function RentSection() {
  const benefits = [
    {
      icon: Shield,
      title: "Full Maintenance Coverage",
      description: "Any damage or wear during your rental? We handle repairs and replacements at no extra cost."
    },
    {
      icon: Wrench,
      title: "24/7 Support Service",
      description: "Installation issues, repair needs, or questions - our team is available whenever you need us."
    },
    {
      icon: Repeat,
      title: "Flexible Upgrades",
      description: "Want to change your furniture? Upgrade, downgrade, or swap pieces during your tenure hassle-free."
    },
    {
      icon: TrendingUp,
      title: "Rent-to-Own Option",
      description: "Love your rental? Apply your rent toward ownership and make it yours permanently."
    },
    {
      icon: CheckCircle2,
      title: "Quality Assurance",
      description: "Every piece is inspected before delivery. We deliver only furniture we'd use in our own homes."
    },
    {
      icon: Clock,
      title: "No Long-Term Lock-In",
      description: "3, 6, 12, or 24 month plans. Pause, extend, or end your rental based on your changing needs."
    }
  ];

  const trustPoints = [
    "Pre-delivery inspection & quality check",
    "Professional installation included",
    "Regular maintenance visits",
    "Damage protection at no extra charge",
    "Easy return process when you're done",
    "Transparent pricing - no hidden fees"
  ];

  return (
    <section id="rent" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <div className="inline-block px-3 py-1 border border-[#6B5D4F]/30 rounded-full mb-4">
            <span className="text-xs tracking-widest text-[#6B5D4F]">FURNITURE RENTAL</span>
          </div>
          <h2 className="text-[#2C2419] mb-6">
            Premium Furniture Without the Commitment
          </h2>
          <p className="text-[#5A4D3F] text-lg leading-relaxed">
            Get fully furnished in days, not weeks. Quality furniture on flexible terms 
            with complete peace of mind throughout your rental period. {siteDetails.pricingPromise}.
          </p>
        </div>

        {/* Main Image + Trust Statement */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="relative h-[500px] rounded-sm overflow-hidden shadow-2xl order-2 md:order-1">
            <ImageWithFallback 
              src="/images/generated/v1/living-curved-collection.webp"
              alt="Furnished apartment interior"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="order-1 md:order-2">
            <h3 className="text-2xl mb-6 text-[#2C2419]">
              We Take Care of Everything
            </h3>
            <p className="text-[#5A4D3F] mb-8 leading-relaxed">
              Renting furniture shouldn't come with anxiety. That's why we provide 
              comprehensive support from delivery to the day you return it - and every 
              moment in between.
            </p>
            
            <div className="space-y-3">
              {trustPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-5 h-5 rounded-full bg-[#6B5D4F]/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#6B5D4F]" />
                    </div>
                  </div>
                  <p className="text-[#5A4D3F]">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mb-20">
          <h3 className="text-2xl text-center mb-12 text-[#2C2419]">
            Rental Benefits That Build Trust
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={index}
                  className="p-8 bg-[#FAF7F2] rounded-sm border border-[#E5DDD1] hover:shadow-lg transition-shadow"
                >
                  <div className="w-14 h-14 bg-[#6B5D4F] rounded-sm flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-[#FAF7F2]" />
                  </div>
                  <h4 className="text-lg mb-3 text-[#2C2419]">
                    {benefit.title}
                  </h4>
                  <p className="text-[#6B5D4F] leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Service Promise */}
        <div className="bg-[#2C2419] rounded-sm p-12 text-center">
          <h3 className="text-2xl mb-6 text-[#FAF7F2]">
            Our Service Promise During Your Tenure
          </h3>
          <p className="text-[#D4C5B0] text-lg max-w-3xl mx-auto mb-8 leading-relaxed">
            We don't just rent furniture and disappear. Throughout your rental period, 
            we're responsible for keeping every piece in perfect condition.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6 bg-[#3A3128] rounded-sm">
              <div className="text-3xl mb-3 text-[#D4C5B0]">Same-Day</div>
              <p className="text-[#9A8A77] text-sm">Response to maintenance requests</p>
            </div>
            <div className="p-6 bg-[#3A3128] rounded-sm">
              <div className="text-3xl mb-3 text-[#D4C5B0]">Zero-Cost</div>
              <p className="text-[#9A8A77] text-sm">Repairs during rental period</p>
            </div>
            <div className="p-6 bg-[#3A3128] rounded-sm">
              <div className="text-3xl mb-3 text-[#D4C5B0]">Anytime</div>
              <p className="text-[#9A8A77] text-sm">Furniture exchange if needed</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
