import React from 'react';

const policies = [
  {
    id: 'terms',
    title: 'Terms and Conditions',
    items: [
      'Rental tenure follows standard 3, 6, 12, or 24 month plans.',
      'Security deposits are refundable after inspection at return.',
      'Damage beyond normal wear may incur charges.',
      'Payments accepted via UPI, cards, bank transfer, or cash as per invoice terms.',
      'Trade-in offers are subject to inspection and approval.',
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    items: [
      'We collect data only to process orders and support services.',
      'We do not sell customer data to third parties.',
      'Analytics and cookies are used to improve the website.',
      'Customers can request data updates or deletion.',
    ],
  },
  {
    id: 'refunds',
    title: 'Refund and Cancellation',
    items: [
      'Cancellations before dispatch are eligible for refunds.',
      'Deposits are returned after pickup and inspection.',
      'Custom builds may not be eligible for returns.',
      'Refund timelines are shared at confirmation.',
    ],
  },
  {
    id: 'delivery',
    title: 'Delivery and Assembly',
    items: [
      'Delivery and assembly are available Pan-India, quoted per destination.',
      'Slots are confirmed after order approval.',
      'Staircase or lift constraints should be shared in advance.',
      'Assembly is completed on-site by AlterCraft technicians.',
    ],
  },
  {
    id: 'trade-in-policy',
    title: 'Trade-In Policy',
    items: [
      'Trade-in offers depend on age, condition, and category.',
      'Photos and details are required for evaluation.',
      'Pickup is arranged after offer acceptance.',
      'Trade-in terms will be finalized and published soon.',
    ],
  },
];

const headingFont = { fontFamily: '"Playfair Display", Georgia, serif' } as const;

export function PoliciesSection() {
  return (
    <section id="policies" className="py-24 bg-[#f8f4ee]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 border border-[#b3773c]/40 rounded-full mb-4">
            <span className="text-xs tracking-widest text-[#8a5a2b]">POLICIES</span>
          </div>
          <h2 className="text-[#1c1a17] mb-4" style={headingFont}>Clear Terms, Transparent Policies</h2>
          <p className="text-[#5c564e] text-lg max-w-2xl mx-auto">
            Essential policies covering rentals, purchases, delivery, and trade-ins.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {policies.map((policy) => (
            <div
              key={policy.id}
              id={policy.id}
              className="bg-white rounded-2xl border border-[#e7ded0] p-8 shadow-[0_14px_30px_rgba(28,26,23,0.06)]"
            >
              <h3 className="text-lg text-[#1c1a17] mb-4" style={headingFont}>{policy.title}</h3>
              <ul className="space-y-2 text-sm text-[#5c564e]">
                {policy.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-[#b3773c]">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
