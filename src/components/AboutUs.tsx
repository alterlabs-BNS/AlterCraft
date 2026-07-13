import React from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Layers, ShieldCheck, Ruler, Hammer, MessageSquare, Search, CheckCircle2, Truck } from 'lucide-react';

export function AboutUs() {
  const materials = [
    {
      icon: Layers,
      title: "Plywood Grades",
      description: "We understand BWR, BWP, marine grades. We know what works in Indian climates and what fails."
    },
    {
      icon: ShieldCheck,
      title: "Strength Testing",
      description: "Every batch is verified. We've seen failures firsthand and know what to look for."
    },
    {
      icon: Ruler,
      title: "Board Quality",
      description: "Thickness, core structure, surface finish. We don't compromise on foundational material."
    },
    {
      icon: Hammer,
      title: "Real-World Durability",
      description: "Materials are tested in actual builds, not just on spec sheets. We learn through doing."
    }
  ];

  const projects = [
    {
      title: "Custom Wardrobes",
      description: "Built to fit your space precisely. Designed for strength and daily use over decades.",
      image: "/images/generated/v1/wardrobe-sliding-smoked.webp"
    },
    {
      title: "Kitchen Cabinetry",
      description: "Moisture-resistant materials. Robust construction. Built to handle real kitchen demands.",
      image: "/images/generated/v1/kitchen-premium-u-shape.webp"
    },
    {
      title: "Storage Solutions",
      description: "Every shelf, every joint designed to bear real weight without compromise.",
      image: "/images/generated/v1/joinery-soft-close.webp"
    }
  ];

  const steps = [
    {
      number: "01",
      icon: MessageSquare,
      title: "Understanding Requirements",
      description: "We listen to your space needs, usage patterns, and budget. No pressure, just clarity."
    },
    {
      number: "02",
      icon: Search,
      title: "Material Selection",
      description: "Based on your requirements, we recommend specific materials with honest pros and cons."
    },
    {
      number: "03",
      icon: Hammer,
      title: "Building Phase",
      description: "Precision cutting, careful assembly, and continuous quality checks throughout construction."
    },
    {
      number: "04",
      icon: CheckCircle2,
      title: "Finishing & Quality Control",
      description: "Surface treatment, hardware installation, and thorough inspection before delivery."
    },
    {
      number: "05",
      icon: Truck,
      title: "Installation",
      description: "Careful transport and professional installation. We take responsibility until it's complete."
    }
  ];

  return (
    <div className="bg-[#FAF7F2]">
      {/* Woods Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <div className="inline-block px-3 py-1 border border-[#6B5D4F]/30 rounded-full mb-4">
                <span className="text-xs tracking-widest text-[#6B5D4F]">MATERIALS</span>
              </div>
              <h2 className="text-[#2C2419] mb-6">
                Understanding Wood Deeply
              </h2>
              <p className="text-[#5A4D3F] text-lg leading-relaxed mb-6">
                Material choice determines everything. Weak plywood means weak furniture, 
                no matter how well it's built.
              </p>
              <p className="text-[#6B5D4F] leading-relaxed">
                We've cut through hundreds of boards, tested them under stress, 
                and watched them perform in real homes. This knowledge guides 
                every material decision we make.
              </p>
            </div>
            
            <div className="relative h-[500px] rounded-sm overflow-hidden shadow-2xl">
              <ImageWithFallback 
                src="/images/generated/v1/joinery-soft-close.webp"
                alt="Wood grain texture"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {materials.map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={index} 
                  className="group p-8 bg-white rounded-sm shadow-md hover:shadow-xl transition-shadow border border-[#E5DDD1]"
                >
                  <div className="w-12 h-12 bg-[#6B5D4F]/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#6B5D4F]/20 transition-colors">
                    <Icon className="w-6 h-6 text-[#6B5D4F]" />
                  </div>
                  <h3 className="text-lg mb-3 text-[#2C2419]">
                    {item.title}
                  </h3>
                  <p className="text-[#6B5D4F] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-16 p-12 bg-[#2C2419] rounded-sm text-center">
            <p className="text-xl text-[#D4C5B0] max-w-3xl mx-auto leading-relaxed">
              "We don't sell materials we haven't worked with. Every recommendation 
              comes from real experience, not supplier catalogs."
            </p>
          </div>
        </div>
      </section>

      {/* Furniture Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <div className="inline-block px-3 py-1 border border-[#6B5D4F]/30 rounded-full mb-4">
              <span className="text-xs tracking-widest text-[#6B5D4F]">WHAT WE BUILD</span>
            </div>
            <h2 className="text-[#2C2419] mb-6">
              Furniture Built to Last
            </h2>
            <p className="text-[#5A4D3F] text-lg leading-relaxed">
              We don't follow templates. Every piece is designed for your space, 
              your needs, and built to handle real daily use without degradation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {projects.map((project, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="relative h-80 mb-6 overflow-hidden rounded-sm">
                  <ImageWithFallback 
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2C2419]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <h3 className="text-xl mb-3 text-[#2C2419] group-hover:text-[#6B5D4F] transition-colors">
                  {project.title}
                </h3>
                <p className="text-[#6B5D4F] leading-relaxed">
                  {project.description}
                </p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center bg-[#FAF7F2] p-12 rounded-sm">
            <div className="relative h-96 rounded-sm overflow-hidden">
              <ImageWithFallback 
                src="/images/generated/v1/cnc-workshop.webp"
                alt="Indian carpenter at work"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-2xl mb-6 text-[#2C2419]">
                Process Over Appearance
              </h3>
              <div className="space-y-4 text-[#5A4D3F]">
                <p className="leading-relaxed">
                  Beautiful furniture is a byproduct of good construction. 
                  We focus on joints that don't loosen, finishes that don't chip, 
                  and materials that don't warp.
                </p>
                <p className="leading-relaxed">
                  Each piece goes through the same discipline: careful material selection, 
                  precise cuts, proper seasoning, and tested assembly methods.
                </p>
                <p className="leading-relaxed">
                  If it looks good but won't last, we don't build it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <div className="inline-block px-3 py-1 border border-[#6B5D4F]/30 rounded-full mb-4">
              <span className="text-xs tracking-widest text-[#6B5D4F]">HOW WE WORK</span>
            </div>
            <h2 className="text-[#2C2419] mb-6">
              Clear Process, No Surprises
            </h2>
            <p className="text-[#5A4D3F] text-lg leading-relaxed">
              From first conversation to final installation, every step is transparent 
              and designed to reduce your anxiety about the outcome.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-8 mb-20">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-full h-0.5 bg-[#E5DDD1]" />
                  )}
                  
                  <div className="relative">
                    <div className="relative mb-6">
                      <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-[#6B5D4F]/20">
                        <Icon className="w-10 h-10 text-[#6B5D4F]" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#6B5D4F] text-white rounded-full flex items-center justify-center text-xs">
                        {step.number}
                      </div>
                    </div>
                    
                    <h3 className="text-center mb-3 text-[#2C2419]">
                      {step.title}
                    </h3>
                    <p className="text-sm text-center text-[#6B5D4F] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center bg-white p-12 rounded-sm shadow-md">
            <div className="relative h-96 rounded-sm overflow-hidden">
              <ImageWithFallback 
                src="/images/generated/v1/site-installation.webp"
                alt="Woodworking tools"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-2xl mb-6 text-[#2C2419]">
                Typical Project Timeline
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-20 text-[#6B5D4F]">
                    Week 1
                  </div>
                  <div className="text-[#5A4D3F]">
                    Consultation, measurement, and material selection
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-20 text-[#6B5D4F]">
                    Week 2-3
                  </div>
                  <div className="text-[#5A4D3F]">
                    Material sourcing and workshop construction
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-20 text-[#6B5D4F]">
                    Week 4
                  </div>
                  <div className="text-[#5A4D3F]">
                    Finishing, quality checks, and installation
                  </div>
                </div>
              </div>
              <p className="mt-6 text-[#6B5D4F] text-sm italic">
                * Timeline varies based on project complexity and material availability
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <div className="inline-block px-3 py-1 border border-[#6B5D4F]/30 rounded-full mb-4">
              <span className="text-xs tracking-widest text-[#6B5D4F]">OUR STORY</span>
            </div>
            <h2 className="text-[#2C2419] mb-6">
              Built Through Experience
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-start mb-20">
            <div className="space-y-6 text-[#5A4D3F] leading-relaxed">
              <p>
                AlterCraft didn't start in a showroom. It started in a workshop, 
                with sawdust, failed joints, and the hard-earned understanding of 
                what actually works.
              </p>
              <p>
                Every recommendation we make comes from cutting boards ourselves, 
                testing material strength under real stress, and watching furniture 
                perform in actual homes over months and years.
              </p>
              <p>
                We've seen plywood delaminate. We've seen finishes chip off poorly 
                prepared surfaces. We've rebuilt weak joints that couldn't handle 
                daily use.
              </p>
              <p>
                These failures taught us more than any supplier catalog ever could.
              </p>
            </div>

            <div className="relative h-[600px] rounded-sm overflow-hidden shadow-2xl">
              <ImageWithFallback 
                src="/images/generated/v1/joinery-soft-close.webp"
                alt="Wood materials"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="bg-[#2C2419] rounded-sm p-12 text-center mb-20">
            <h3 className="text-2xl mb-12 text-[#FAF7F2]">
              What We Stand For
            </h3>
            <div className="grid md:grid-cols-3 gap-12">
              <div>
                <div className="text-4xl mb-4 text-[#D4C5B0]">01</div>
                <h4 className="text-lg mb-3 text-[#FAF7F2]">Material Truth</h4>
                <p className="text-[#9A8A77] text-sm leading-relaxed">
                  We only use materials we understand deeply through hands-on work
                </p>
              </div>
              <div>
                <div className="text-4xl mb-4 text-[#D4C5B0]">02</div>
                <h4 className="text-lg mb-3 text-[#FAF7F2]">Full Accountability</h4>
                <p className="text-[#9A8A77] text-sm leading-relaxed">
                  From raw board to installed furniture, we control every step
                </p>
              </div>
              <div>
                <div className="text-4xl mb-4 text-[#D4C5B0]">03</div>
                <h4 className="text-lg mb-3 text-[#FAF7F2]">Long-Term Vision</h4>
                <p className="text-[#9A8A77] text-sm leading-relaxed">
                  Building toward precision manufacturing, rooted in craft tradition
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl mb-6 text-[#2C2419] text-center">
              Where We're Heading
            </h3>
            <div className="space-y-4 text-[#5A4D3F] leading-relaxed">
              <p>
                AlterCraft is designed as a vertical brand. We are not staying small by choice -
                we are building foundations for scale without compromising on what we have learned.
              </p>
              <p>
                The next phase involves CNC precision, engineered components, and controlled 
                manufacturing. But the same material discipline and quality obsession will remain.
              </p>
              <p className="text-center text-[#6B5D4F] italic pt-6">
                This is a builder's legacy in progress.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
