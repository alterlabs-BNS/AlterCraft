import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
  Clock,
  Home,
  Images,
  LayoutGrid,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  ShoppingBag,
  UserRound,
  X,
} from 'lucide-react';
import { siteDetails } from '../../data/siteDetails';
import { createWhatsappLink } from '../../utils/contact';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/site-chrome.css';

// Sitewide nav routes into the new /shop ecom, matching the homepage taxonomy.
const navItems = [
  { to: '/shop', label: 'Shop' },
  { to: '/shop?category=beds', label: 'Beds' },
  { to: '/shop?category=kitchen', label: 'Kitchen' },
  { to: '/shop?category=wardrobe', label: 'Wardrobes' },
  { to: '/shop?category=mandir', label: 'Mandir' },
  { to: '/shop?category=shoe-rack', label: 'Shoe Racks' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

type ElegantLayoutProps = {
  children: React.ReactNode;
};

const mobileNavItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/shop', label: 'Shop', icon: LayoutGrid },
  { to: '/gallery', label: 'Projects', icon: Images },
  { to: '/account', label: 'Account', icon: UserRound },
  { to: '/contact', label: 'Contact', icon: Phone },
];

export function MobileBottomNav() {
  const { pathname } = useLocation();

  const isActive = (to: string) => {
    if (to === '/') return pathname === '/';
    return pathname === to || pathname.startsWith(`${to}/`) || pathname.startsWith(`${to}?`);
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
      className="ac-floating-whatsapp"
      href={siteDetails.whatsappHref}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with AlterCraft on WhatsApp"
    >
      <MessageCircle size={18} />
      <span>WhatsApp</span>
    </a>
  );
}

export function ElegantHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAdmin } = useAuth();
  const visibleNavItems = isAdmin
    ? [...navItems, { to: '/operator-desk/dashboard', label: 'OperatorDesk' }]
    : navItems;

  return (
    <header className="ac-header">
      <div className="ac-topbar">
        <div className="ac-topbar-inner">
          <span><MapPin size={13} /> {siteDetails.shortAddress}</span>
          <span><Clock size={13} /> {siteDetails.workingHours}</span>
          <a href={siteDetails.phoneHref}><Phone size={13} /> {siteDetails.phoneDisplay}</a>
        </div>
      </div>

      <div className="ac-nav-row">
        <Link to="/" className="ac-brand" aria-label="AlterCraft home">
          <span className="ac-brand-mark" aria-hidden="true">
            <img src="/altercraft-logo-mark.png" alt="" />
          </span>
          <span className="ac-brand-text">
            <span className="ac-brand-name">AlterCraft</span>
            <span className="ac-brand-sub">Design · Plan · Produce · Execute</span>
          </span>
        </Link>

        <nav className="ac-nav" aria-label="Main navigation">
          {visibleNavItems.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ac-actions">
          <Link className="ac-icon-btn" to="/account" aria-label="Your account — sign in or sign up">
            <UserRound size={18} />
          </Link>
          <Link className="ac-icon-btn" to="/shop" aria-label="Shop the catalogue">
            <ShoppingBag size={18} />
          </Link>
          <a
            className="ac-btn ac-btn-solid"
            href={createWhatsappLink('Hi AlterCraft, I would like to discuss my furniture or interior work.')}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={16} />
            Talk to Us
          </a>
          <button
            type="button"
            className="ac-mobile-toggle"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-label="Toggle navigation"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <div className={`ac-mobile-panel ${isOpen ? 'open' : ''}`}>
        <div className="ac-mobile-panel-inner">
          {visibleNavItems.map((item) => (
            <Link key={item.to} to={item.to} onClick={() => setIsOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link to="/account" onClick={() => setIsOpen(false)}>Sign in / Create account</Link>
        </div>
      </div>
    </header>
  );
}

export function ElegantFooter() {
  return (
    <footer className="ac-footer" id="site-footer">
      <div className="ac-footer-inner">
        <div className="ac-footer-cta">
          <div>
            <span>AlterCraft Studio</span>
            <h2>Tell us about your space. We take it from idea to installation.</h2>
          </div>
          <a
            className="ac-btn ac-btn-solid"
            href={createWhatsappLink('Hi AlterCraft, I want help planning furniture or interiors for my space.')}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={18} />
            Start on WhatsApp
          </a>
        </div>

        <div className="ac-footer-grid">
          <div>
            <h3>AlterCraft</h3>
            <p>
              Factory-made furniture and complete interiors — beds, wardrobes, mandir units,
              modular kitchens and full execution, delivered and installed Pan-India.
            </p>
          </div>
          <div>
            <h4>Shop</h4>
            <ul>
              <li><Link to="/shop?category=beds">Designer Beds</Link></li>
              <li><Link to="/shop?category=kitchen">Modular Kitchen</Link></li>
              <li><Link to="/shop?category=wardrobe">Wardrobes & Storage</Link></li>
              <li><Link to="/shop?category=mandir">Mandir Units</Link></li>
              <li><Link to="/shop?category=shoe-rack">Shoe Racks</Link></li>
              <li><Link to="/shop?category=custom-mattress">Custom Mattress</Link></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><Link to="/shop">All Products</Link></li>
              <li><Link to="/gallery">Gallery / Portfolio</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/account">My Account</Link></li>
              <li><Link to="/contact">Contact / Get Quote</Link></li>
              <li><a href="/privacy-policy/">Privacy Policy</a></li>
              <li><a href="/terms-and-conditions/">Terms & Conditions</a></li>
            </ul>
          </div>
          <div>
            <h4>Visit or Call</h4>
            <ul>
              <li><Phone size={14} /><a href={siteDetails.phoneHref}>{siteDetails.phoneDisplay}</a></li>
              <li><MessageCircle size={14} /><a href={siteDetails.whatsappHref}>WhatsApp us</a></li>
              <li><Mail size={14} /><a href={siteDetails.emailHref}>{siteDetails.email}</a></li>
              <li><MapPin size={14} /><span>{siteDetails.fullAddress}</span></li>
              <li><span>GSTIN: {siteDetails.gstin}</span></li>
            </ul>
          </div>
        </div>

        <div className="ac-footer-bottom">
          <span>© {new Date().getFullYear()} AlterCraft. All rights reserved.</span>
          <span>Designed, delivered and installed Pan-India. Experience store in Ghaziabad.</span>
        </div>
      </div>
    </footer>
  );
}

// Scroll-reveal: gently fades page sections up as they enter the viewport, matching
// the homepage's presentation feel. Progressive-enhancement — hiding only applies to
// elements this JS has tagged, and prefers-reduced-motion disables it entirely.
function useScrollReveal() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const root = document.querySelector('.elegant-site.ac-site');
    if (!root) return undefined;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: '0px 0px -6% 0px' },
    );

    const tag = () => {
      const main = root.querySelector('main');
      let blocks;
      if (main) {
        // main-wrapped pages (shop, account): tag direct sections, else top-level blocks
        const direct = main.querySelectorAll(':scope > section');
        blocks = direct.length ? direct : main.children;
      } else {
        // service / info pages render <section> blocks directly inside the root
        blocks = root.querySelectorAll(':scope > section');
      }
      Array.from(blocks).forEach((el) => {
        // Never hide above-the-fold heroes (avoids a blank-hero flash on load).
        if (el.matches('.elegant-hero, .beds-hero, .shop-hero')) return;
        if (!el.classList.contains('reveal')) {
          el.classList.add('reveal');
          io.observe(el);
        }
      });
    };

    tag();
    const mo = new MutationObserver(tag);
    mo.observe(root, { childList: true, subtree: true });
    const stopWatch = window.setTimeout(() => mo.disconnect(), 4000);

    return () => {
      io.disconnect();
      mo.disconnect();
      window.clearTimeout(stopWatch);
    };
  }, [pathname]);
}

export function ElegantLayout({ children }: ElegantLayoutProps) {
  useScrollReveal();
  return (
    <div className="elegant-site ac-site">
      <ElegantHeader />
      {children}
      <ElegantFooter />
      <FloatingWhatsApp />
      <MobileBottomNav />
    </div>
  );
}
