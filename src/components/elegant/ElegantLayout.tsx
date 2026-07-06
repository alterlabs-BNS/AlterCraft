import React, { useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
  ClipboardList,
  Clock,
  Home,
  Images,
  LayoutGrid,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  X,
} from 'lucide-react';
import { siteDetails } from '../../data/siteDetails';
import { createWhatsappLink } from '../../utils/contact';
import { useAuth } from '../../contexts/AuthContext';

// Trimmed to the core customer journey (Phase 0), matching the homepage nav.
// Design Preview, Office, Warranty and About remain reachable from the footer.
const navItems = [
  { to: '/modular-kitchen', label: 'Kitchen' },
  { to: '/wardrobes', label: 'Wardrobes' },
  { to: '/beds', label: 'Beds' },
  { to: '/flush-doors', label: 'Doors' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
];

type ElegantLayoutProps = {
  children: React.ReactNode;
};

const mobileNavItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/modular-kitchen', label: 'Products', icon: LayoutGrid },
  { to: '/gallery', label: 'Projects', icon: Images },
  { to: '/ai-planner/start', label: 'Quote', icon: ClipboardList },
  { to: '/contact', label: 'Contact', icon: Phone },
];

const productRoutePrefixes = [
  '/modular-kitchen',
  '/modular-kitchen-near-me',
  '/designer-beds',
  '/beds',
  '/flush-doors',
  '/doors',
  '/wardrobes',
  '/storage',
  '/office-commercial',
  '/office',
];

export function MobileBottomNav() {
  const { pathname } = useLocation();

  const isActive = (to: string) => {
    if (to === '/') return pathname === '/';
    if (to === '/modular-kitchen') {
      return productRoutePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
    }
    if (to === '/ai-planner/start') {
      return pathname.startsWith('/ai-planner') || pathname.startsWith('/my-projects');
    }
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  return (
    <nav className="ac-mobile-bottom-nav" aria-label="Mobile quick navigation">
      {mobileNavItems.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          className={`ac-mobile-bottom-link ${isActive(to) ? 'active' : ''}`}
          aria-current={isActive(to) ? 'page' : undefined}
        >
          <Icon size={18} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function FloatingWhatsApp() {
  return (
    <a
      className="elegant-floating-whatsapp"
      href={siteDetails.whatsappHref}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with AlterCraft on WhatsApp"
    >
      <MessageCircle size={19} />
      <span className="elegant-floating-whatsapp-text">WhatsApp</span>
    </a>
  );
}

export function ElegantHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAdmin } = useAuth();
  const visibleNavItems = isAdmin ? [...navItems, { to: '/operator-desk/dashboard', label: 'OperatorDesk' }] : navItems;

  return (
    <>
      <div className="elegant-topbar">
        <div className="elegant-container elegant-topbar-inner">
          <span>
            <MapPin size={14} />
            {siteDetails.shortAddress}
          </span>
          <span>
            <Clock size={14} />
            {siteDetails.workingHours}
          </span>
          <a href={siteDetails.phoneHref}>
            <Phone size={14} />
            {siteDetails.phoneDisplay}
          </a>
        </div>
      </div>

      <header className="elegant-header">
        <div className="elegant-container elegant-header-inner">
          <Link to="/" className="elegant-brand" aria-label="AlterCraft home">
            <span className="elegant-brand-mark ac-logo-mark" aria-hidden="true">
              <img src="/altercraft-logo-mark.png" alt="" />
            </span>
            <span className="elegant-brand-text">
              <span className="elegant-brand-name">AlterCraft</span>
              <span className="elegant-brand-subtitle">Woods & Furniture</span>
            </span>
          </Link>

          <nav className="elegant-nav" aria-label="Main navigation">
            {visibleNavItems.map((item) => (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="elegant-actions">
            <a className="elegant-button-secondary" href={siteDetails.phoneHref}>
              <Phone size={16} />
              Call
            </a>
            <a
              className="elegant-button"
              href={createWhatsappLink('Hi AlterCraft, I would like to discuss my furniture or interior work.')}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={16} />
              Talk to Us
            </a>
          </div>

          <button
            type="button"
            className="elegant-mobile-toggle"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-label="Toggle navigation"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className={`elegant-mobile-panel ${isOpen ? 'open' : ''}`}>
          <div className="elegant-container">
            {visibleNavItems.map((item) => (
              <Link key={item.to} to={item.to} onClick={() => setIsOpen(false)}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </header>
    </>
  );
}

export function ElegantFooter() {
  return (
    <footer className="elegant-footer" id="site-footer">
      <div className="elegant-container">
        <div className="elegant-footer-intro">
          <div>
            <span>AlterCraft Studio</span>
            <h2>Tell us about your space. We will guide you from idea to installation.</h2>
          </div>
          <a
            className="elegant-footer-cta"
            href={createWhatsappLink('Hi AlterCraft, I want help planning furniture or interiors for my space.')}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={18} />
            Start on WhatsApp
          </a>
        </div>

        <div className="elegant-footer-grid">
          <div className="elegant-footer-card">
            <h3>AlterCraft Woods & Furniture</h3>
            <p>
              Custom furniture, modular kitchens, wardrobes, beds, doors and office interiors
              made for real homes and workspaces, with clear pricing and helpful after-sales
              support wherever applicable.
            </p>
          </div>
          <div className="elegant-footer-card">
            <h4>What We Make</h4>
            <ul>
              <li><Link to="/modular-kitchen">Modular Kitchen</Link></li>
              <li><Link to="/beds">Designer Beds</Link></li>
              <li><Link to="/flush-doors">Flush Doors</Link></li>
              <li><Link to="/wardrobes">Wardrobes & Storage</Link></li>
              <li><Link to="/office-commercial">Office Interiors</Link></li>
              <li><Link to="/ai-planner">Design Preview Request</Link></li>
            </ul>
          </div>
          <div className="elegant-footer-card">
            <h4>Helpful Links</h4>
            <ul>
              <li><Link to="/gallery">Gallery / Portfolio</Link></li>
              <li><Link to="/warranty-quality">Warranty & Quality</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact / Get Quote</Link></li>
              <li><Link to="/my-projects">My Projects</Link></li>
              <li><a href="/privacy-policy/">Privacy Policy</a></li>
              <li><a href="/terms-and-conditions/">Terms & Conditions</a></li>
              <li><a href="/return-refund-policy/">Return & Refund</a></li>
            </ul>
          </div>
          <div className="elegant-footer-card elegant-footer-contact-card">
            <h4>Visit or Call</h4>
            <ul>
              <li><Phone size={14} /><a href={siteDetails.phoneHref}>{siteDetails.phoneDisplay}</a></li>
              <li><MessageCircle size={14} /><a href={siteDetails.whatsappHref}>WhatsApp us</a></li>
              <li><Mail size={14} /><a href={siteDetails.emailHref}>{siteDetails.email}</a></li>
              <li><MapPin size={14} /><span>{siteDetails.fullAddress}</span></li>
              <li><span>GSTIN: {siteDetails.gstin}</span></li>
              <li><span>Udyam: {siteDetails.udyamRegistration}</span></li>
            </ul>
          </div>
        </div>
        <div className="elegant-footer-bottom">
          <span>Copyright {new Date().getFullYear()} AlterCraft. All rights reserved.</span>
          <span>Serving homes and offices within {siteDetails.serviceRadius} from Ghaziabad.</span>
        </div>
      </div>
    </footer>
  );
}

export function ElegantLayout({ children }: ElegantLayoutProps) {
  return (
    <div className="elegant-site">
      <ElegantHeader />
      {children}
      <ElegantFooter />
      <FloatingWhatsApp />
      <MobileBottomNav />
    </div>
  );
}
