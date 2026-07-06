import React, { useState, useEffect } from 'react';
import { siteDetails } from '../data/siteDetails';
import { trackEvent } from '../utils/analytics';

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Kitchen', href: '/modular-kitchen' },
    { label: 'Beds', href: '/beds' },
    { label: 'Doors', href: '/flush-doors' },
    { label: 'Wardrobes', href: '/wardrobes' },
    { label: 'Office', href: '/office-commercial' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Warranty', href: '/warranty-quality' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50">
      <div
        className={`w-full transition-all duration-300 ${
          isScrolled ? 'bg-[#2C2419]/95 backdrop-blur-md' : 'bg-[#2C2419]/80 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-2 text-xs text-[#D4C5B0] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <span>{siteDetails.addressLine}</span>
            <span>{siteDetails.cityBase}</span>
            <span>{siteDetails.serviceRadius} radius</span>
            <span>{siteDetails.workingHours}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={siteDetails.phoneHref}
              onClick={() => trackEvent('phone_click', { location: 'nav_top' })}
              className="transition-colors hover:text-[#FAF7F2]"
            >
              Phone: {siteDetails.phoneDisplay}
            </a>
            <a
              href={siteDetails.whatsappHref}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent('whatsapp_click', { location: 'nav_top' })}
              className="transition-colors hover:text-[#FAF7F2]"
            >
              WhatsApp: {siteDetails.phoneDisplay}
            </a>
          </div>
        </div>
      </div>

      <div
        className={`transition-all duration-300 ${
          isScrolled ? 'bg-[#2C2419]/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a
              href="#home"
              aria-label="AlterCraft"
              className="transition-opacity hover:opacity-80"
            >
              <span className="nav-logo-mark ac-logo-mark" aria-hidden="true">
                <img src="/altercraft-logo-mark.png" alt="" />
              </span>
            </a>

            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-[#D4C5B0] text-sm tracking-wide transition-colors hover:text-[#FAF7F2]"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
