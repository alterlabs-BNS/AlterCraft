import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router';
import '../styles/home.css';
import '../styles/spatial-studio.css';
import {
  ArrowRight,
  Award,
  CheckCircle,
  Clock,
  Eye,
  Hammer,
  Mail,
  MapPin,
  Menu,
  Phone,
  Ruler,
  Shield,
  Sparkles,
  Star,
  Upload,
  X,
} from 'lucide-react';
import { ElegantFooter, FloatingWhatsApp, MobileBottomNav } from '../components/elegant/ElegantLayout';
import { QuoteForm } from '../components/elegant/QuoteForm';
import { PreviewDisclaimer, ServiceCard } from '../components/aiPlanner/PlannerComponents';
import { products } from '../data/products';
import { modularKitchenStartingPrice } from '../data/pricingFacts';
import { siteDetails } from '../data/siteDetails';
import { trackEvent } from '../utils/analytics';
import { createWhatsappLink } from '../utils/contact';
import { HeroPoster } from '../components/HeroPoster';
import { SpatialStudio } from '../components/visual/SpatialStudio';
import { CanvaVisualShowcase } from '../components/visual/CanvaVisualShowcase';
import { canvaVisuals } from '../data/visualAssets';
import { useAuth } from '../contexts/AuthContext';
import { SEOHead } from '../components/seo/SEOHead';

// Trimmed to the core customer journey (Phase 0). Contractor Desk is a separate
// B2B product and gets its own entry outside this public nav (see header).
const NAV_LINKS: Array<{ to: string; label: string; anchor?: boolean }> = [
  { to: '/modular-kitchen-near-me', label: 'Kitchen' },
  { to: '/wardrobes', label: 'Wardrobes' },
  { to: '/beds', label: 'Beds' },
  { to: '/flush-doors', label: 'Doors' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
];


const formatInr = (value: number) => `INR ${value.toLocaleString('en-IN')}`;

const homeLocalBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'AlterCraft',
  legalName: siteDetails.legalName,
  url: 'https://www.altercraft.in/',
  telephone: '+918817503658',
  email: siteDetails.email,
  image: `https://www.altercraft.in${canvaVisuals.aiJourney}`,
  description:
    `Custom furniture, modular kitchens from ${modularKitchenStartingPrice}, wardrobes, beds, doors, office interiors and AI-assisted imagination previews in Ghaziabad, Noida, Greater Noida and Delhi NCR.`,
  taxID: `GSTIN ${siteDetails.gstin}`,
  identifier: siteDetails.udyamRegistration,
  address: {
    '@type': 'PostalAddress',
    streetAddress: `${siteDetails.addressLine}, ${siteDetails.landmarkLine}, ${siteDetails.locality}`,
    addressLocality: 'Ghaziabad',
    addressRegion: 'Uttar Pradesh',
    postalCode: siteDetails.postalCode,
    addressCountry: 'IN',
  },
  areaServed: siteDetails.serviceAreas,
  openingHours: 'Mo-Sa 10:00-19:00',
  priceRange: 'Measured quote',
};

const lowestProductPrice = (category: string) => {
  const prices = products
    .filter((product) => product.category === category)
    .map((product) => product.prices.offer)
    .filter(Boolean);
  return prices.length ? Math.min(...prices) : 0;
};

function HomeHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAdmin } = useAuth();
  const navLinks = useMemo(
    () => (isAdmin ? [...NAV_LINKS, { to: '/operator-desk/dashboard', label: 'OperatorDesk' }] : NAV_LINKS),
    [isAdmin]
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`home-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="home-container home-header-inner">
        <Link to="/" className="home-brand" aria-label="AlterCraft home">
          <span className="home-brand-mark ac-logo-mark" aria-hidden="true">
            <img src="/altercraft-logo-mark.png" alt="" />
          </span>
          <span>
            <span className="home-brand-kicker">Premium Interiors</span>
            <span className="home-brand-name">AlterCraft</span>
          </span>
        </Link>

        <nav className="home-nav" aria-label="Main navigation">
          {navLinks.map((item) =>
            item.anchor ? (
              <a key={item.to} href={item.to}>
                {item.label}
              </a>
            ) : (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}>
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="home-header-actions">
          <Link to="/ContractorDesk" className="home-header-contractor">
            Contractor Desk
          </Link>
          <a href={siteDetails.phoneHref} className="home-header-contact">
            <Phone size={16} />
            {siteDetails.phoneDisplay}
          </a>
          <a
            href={createWhatsappLink('Hi AlterCraft, I would like to discuss my furniture or interior work.')}
            className="home-button home-button-solid"
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent('whatsapp_click', { location: 'home_header' })}
          >
            Talk to Us
          </a>
        </div>

        <button
          type="button"
          className="home-menu-button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      <div className={`home-mobile-panel ${menuOpen ? 'open' : ''}`}>
        <div className="home-container">
          {navLinks.map((item) =>
            item.anchor ? (
              <a key={item.to} href={item.to} onClick={() => setMenuOpen(false)}>
                {item.label}
              </a>
            ) : (
              <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            )
          )}
          <Link
            to="/ContractorDesk"
            className="home-mobile-contractor"
            onClick={() => setMenuOpen(false)}
          >
            Contractor Desk
          </Link>
          <a
            href={createWhatsappLink('Hi AlterCraft, I would like a furniture quote.')}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent('whatsapp_click', { location: 'home_mobile_menu' })}
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const bedStartingPrice = useMemo(() => lowestProductPrice('Beds'), []);
  const wardrobeStartingPrice = useMemo(() => lowestProductPrice('Wardrobes'), []);
  const [expandedOffer, setExpandedOffer] = useState<string | null>(null);

  const trustBadges = [
    { icon: Award, label: 'Custom made furniture' },
    { icon: Star, label: 'Premium finishing' },
    { icon: Shield, label: 'Warranty support across eligible products' },
    { icon: Hammer, label: 'Professional installation' },
    { icon: Ruler, label: 'Site measurement support' },
  ];

  const kitchenMaterialDetails = [
    'BWP/BWR plywood options for moisture-prone kitchen zones.',
    'Laminate finish with clean edge banding for daily-use shutters.',
    'Soft-close drawer and shutter hardware where selected in the scope.',
    'Base, wall and tall unit planning after site measurement.',
    'Written quotation before work starts, so the agreed scope stays clear.',
  ];

  const offerCards = [
    {
      title: 'Modular Kitchen',
      price: `Modular kitchen at ${modularKitchenStartingPrice}`,
      note: 'No hidden cost in the agreed modular cabinet scope. Material, hardware and finish are explained before work starts.',
      detailsLabel: 'View material details',
      details: kitchenMaterialDetails,
      image: canvaVisuals.kitchenVisual,
      to: '/modular-kitchen-near-me',
      cta: 'Kitchen Near Me',
    },
    {
      title: 'Designer Beds',
      price: `Starting from ${formatInr(bedStartingPrice)}`,
      note: 'Hydraulic storage, platform and made-to-size bedroom furniture.',
      image:
        '/images/generated/v1/bed-hydraulic-storage.webp',
      to: '/beds',
      cta: 'View Bed Designs',
    },
    {
      title: 'Flush Doors',
      price: 'Starting from INR 7,600 / door',
      note: 'Door-specific warranty available for eligible specifications.',
      image:
        '/images/generated/v1/flush-door.webp',
      to: '/flush-doors',
      cta: 'Check Door Options',
    },
  ];

  const whyUs = [
    {
      icon: Award,
      title: 'Premium Quality Materials',
      desc: 'Thoughtful board selection, refined laminates, reliable hardware and finishes chosen for everyday Indian homes.',
    },
    {
      icon: Ruler,
      title: 'Custom-Made to Fit',
      desc: 'Every cabinet, bed, wardrobe and office unit is planned around your measurements, storage needs and usage.',
    },
    {
      icon: Hammer,
      title: 'Expert Installation',
      desc: 'Installation is handled with careful alignment, clean finishing and practical handover guidance.',
    },
    {
      icon: Shield,
      title: 'Warranty Across Categories',
      desc: 'Warranty support is available across eligible products, hardware, workmanship and installation scope.',
    },
    {
      icon: Star,
      title: 'Transparent Pricing',
      desc: 'Quotes are itemized by size, material, finish and site work so decisions stay clear from the beginning.',
    },
    {
      icon: CheckCircle,
      title: 'After-Sales Support',
      desc: 'The relationship continues after handover with service, warranty guidance and support where applicable.',
    },
  ];

  const processSteps = [
    ['01', 'Site Measurement', 'Room measurements, product requirements and site details are noted clearly.'],
    ['02', 'Design & Estimate', 'Material, finish, storage and pricing options are planned before production starts.'],
    ['03', 'Manufacturing', 'Furniture is fabricated with the agreed specifications, hardware and finishing details.'],
    ['04', 'Installation', 'The team installs, checks alignment and completes final touch-ups at site.'],
    ['05', 'Support', 'Care guidance, warranty support and service coordination remain available after handover.'],
  ];

  const categories = [
    {
      title: 'Modular Kitchen',
      to: '/modular-kitchen',
      image:
        '/images/generated/v1/kitchen-compact-l-shape.webp',
    },
    {
      title: 'Designer Beds',
      to: '/beds',
      image:
        '/images/generated/v1/bed-upholstered-drawer.webp',
    },
    {
      title: 'Flush Doors',
      to: '/flush-doors',
      image:
        '/images/generated/v1/flush-door.webp',
    },
    {
      title: 'Wardrobes & Storage',
      to: '/wardrobes',
      image:
        '/images/generated/v1/wardrobe-sliding-smoked.webp',
    },
    {
      title: 'Office Interiors',
      to: '/office-commercial',
      image:
        '/images/generated/v1/office-commercial-interior.webp',
    },
  ];

  const portfolio = [
    {
      label: 'Warm Modular Kitchen',
      image:
        '/images/generated/v1/kitchen-premium-u-shape.webp',
    },
    {
      label: 'Premium Living Storage',
      image:
        '/images/generated/v1/living-media-wall.webp',
    },
    {
      label: 'Wardrobe Planning',
      image:
        '/images/generated/v1/wardrobe-internal-storage.webp',
    },
    {
      label: 'Designer Bedroom',
      image:
        '/images/generated/v1/bed-upholstered-drawer.webp',
    },
  ];

  const testimonials = [
    {
      name: 'Homeowner, Ghaziabad',
      text: 'The quotation was clear, the finishes were explained properly and the installation team kept the work neat.',
    },
    {
      name: 'Bedroom Furniture Client',
      text: 'The bed and wardrobe were planned around our exact room size. Storage became much easier without making the room heavy.',
    },
    {
      name: 'Office Interior Client',
      text: 'AlterCraft understood the office workflow first, then planned workstations, storage and cable movement very practically.',
    },
  ];

  const blogPosts = [
    {
      category: 'Contractor Desk APK',
      title: 'Contractor Desk APK for contractors',
      summary:
        'A mobile-first execution control app for contractor jobs, payment gates, labour, material, site reports, cash ledger and dispute protection.',
      href: '/blog/contractor-desk-apk-for-contractors/',
      image: '/images/blog/contractor-desk/contractor-desk-apk-cover.svg',
      readTime: '7 min read',
    },
    {
      category: 'Contractor Management',
      title: 'What a contractor management app in India must actually solve',
      summary:
        'A practical guide to field-ready contractor software for Indian teams handling site work, cash, labour, material and proof.',
      href: '/blog/contractor-management-app-india/',
      image: '/images/blog/contractor-desk/contractor-desk-apk-cover.svg',
      readTime: '7 min read',
    },
    {
      category: 'Payment Gates',
      title: 'Contractor payment gate system',
      summary:
        'How advance, material, labour and milestone gates can stop risky site movement before cash leakage begins.',
      href: '/blog/contractor-desk-payment-gate-system/',
      image: '/images/blog/contractor-desk/payment-gate-cover.svg',
      readTime: '6 min read',
    },
    {
      category: 'Site Reports',
      title: 'Daily site report app for contractors',
      summary:
        "A clean reporting rhythm for attendance, progress photos, material usage, client approvals and tomorrow's next action.",
      href: '/blog/daily-site-report-app-for-contractors/',
      image: '/images/blog/contractor-desk/labour-material-cover.svg',
      readTime: '6 min read',
    },
    {
      category: 'Ghaziabad Cost Guide',
      title: 'Modular kitchen cost in Ghaziabad',
      summary:
        'See how layout, cabinet scope, material, finish, hardware, accessories and site work affect a practical kitchen quote.',
      href: '/blog/modular-kitchen-cost-ghaziabad/',
      image: canvaVisuals.kitchenVisual,
      readTime: '7 min read',
    },
    {
      category: 'Kitchen Quote Guide',
      title: 'Modular kitchen price per sq ft in Ghaziabad',
      summary:
        'Understand what INR 1,200 / sq. ft. means, where per-sq-ft pricing helps and what must be written in the estimate.',
      href: '/blog/modular-kitchen-price-per-sq-ft-ghaziabad/',
      image: canvaVisuals.kitchenVisual,
      readTime: '6 min read',
    },
    {
      category: '2BHK Kitchen Planning',
      title: 'Best modular kitchen layout for 2BHK flats in Ghaziabad',
      summary:
        'Choose between straight, L-shaped, parallel and compact layouts using movement, storage, ventilation and quote scope.',
      href: '/blog/best-modular-kitchen-layout-2bhk-ghaziabad/',
      image: canvaVisuals.kitchenVisual,
      readTime: '7 min read',
    },
    {
      category: 'Local Kitchen Guide',
      title: 'Modular kitchen for Indirapuram, Vaishali and Vasundhara flats',
      summary:
        'Local flat kitchen planning notes for layout, moisture-aware material, storage and INR 1,200 / sq. ft. starting scope.',
      href: '/blog/modular-kitchen-indirapuram-vaishali-vasundhara/',
      image: canvaVisuals.kitchenVisual,
      readTime: '6 min read',
    },
    {
      category: 'Wardrobe Cost Guide',
      title: 'Wardrobe cost in Ghaziabad',
      summary:
        'Compare wardrobe cost drivers including sliding versus hinged shutters, internals, lofts, drawers, material and finish.',
      href: '/blog/wardrobe-cost-ghaziabad/',
      image: canvaVisuals.wardrobeVisual,
      readTime: '6 min read',
    },
    {
      category: 'Wardrobe Planning',
      title: 'Small bedroom wardrobe design ideas for Ghaziabad flats',
      summary:
        'Plan sliding shutters, lofts, mirrors and internal storage without making compact bedrooms feel blocked.',
      href: '/blog/small-bedroom-wardrobe-design-ghaziabad-flats/',
      image: canvaVisuals.wardrobeVisual,
      readTime: '6 min read',
    },
    {
      category: 'Material Guide',
      title: 'Best material for modular kitchen in Delhi NCR',
      summary:
        'Compare plywood, BWR, BWP, HDHMR, laminate and finish choices by kitchen zone, moisture risk and budget.',
      href: '/blog/best-material-for-modular-kitchen-delhi-ncr/',
      image: canvaVisuals.kitchenVisual,
      readTime: '6 min read',
    },
    {
      category: 'Hardware Comparison',
      title: 'Hettich vs Blum vs Hafele for kitchens and wardrobes',
      summary:
        'Understand when premium hinges, channels, lift-ups and pull-outs are worth paying for in daily-use cabinets.',
      href: '/blog/hettich-vs-blum-vs-hafele-kitchen-wardrobe/',
      image: canvaVisuals.aiJourney,
      readTime: '6 min read',
    },
    {
      category: 'Interior Budget Guide',
      title: 'Interior design cost in Ghaziabad for 2BHK and 3BHK homes',
      summary:
        'Build a room-wise budget for kitchen, wardrobes, beds, TV unit, storage, office furniture and finishes.',
      href: '/blog/interior-design-cost-ghaziabad-2bhk-3bhk/',
      image: canvaVisuals.aiJourney,
      readTime: '7 min read',
    },
    {
      category: 'Custom Furniture Cost',
      title: 'Custom furniture cost in Ghaziabad',
      summary:
        'See how size, material, finish, hardware, storage complexity and installation scope affect custom furniture quotes.',
      href: '/blog/custom-furniture-cost-ghaziabad/',
      image: canvaVisuals.wardrobeVisual,
      readTime: '6 min read',
    },
    {
      category: 'Living Room Planning',
      title: 'TV unit design for small living rooms in Ghaziabad',
      summary:
        'Plan cable concealment, panel depth, storage and service access for a clean compact living room TV wall.',
      href: '/blog/tv-unit-design-small-living-room-ghaziabad/',
      image: canvaVisuals.office,
      readTime: '5 min read',
    },
    {
      category: 'Office Furniture',
      title: 'Office furniture manufacturer in Ghaziabad',
      summary:
        'Plan workstations, reception desks, cabins, meeting tables, storage and commercial furniture around real workflow.',
      href: '/blog/office-furniture-manufacturer-ghaziabad/',
      image: canvaVisuals.office,
      readTime: '6 min read',
    },
    {
      category: 'Buyer Checklist',
      title: 'Custom furniture maker near me: quote checklist',
      summary:
        'A practical checklist for measurements, material, finish, hardware, warranty support and written quote comparison.',
      href: '/blog/custom-furniture-maker-near-me-checklist/',
      image: canvaVisuals.wardrobeVisual,
      readTime: '5 min read',
    },
    {
      category: 'Kitchen Comparison',
      title: 'Factory-made vs carpenter-made modular kitchen',
      summary:
        'A practical comparison for Ghaziabad homes covering finish consistency, timeline, cost myths and site execution risk.',
      href: '/blog/factory-made-vs-carpenter-made-modular-kitchen-ghaziabad/',
      image: canvaVisuals.kitchenVisual,
      readTime: '6 min read',
    },
    {
      category: 'Project Story',
      title: 'Office interior project in Ghaziabad',
      summary:
        'Workstation, reception, waiting area, storage and lighting notes for a practical Ghaziabad office interior.',
      href: '/blog/office-interior-project-ghaziabad/',
      image: canvaVisuals.office,
      readTime: '5 min read',
    },
    {
      category: 'Project Detail',
      title: 'Blue carpet office waiting area design',
      summary:
        'How to balance blue carpet with reception furniture, warm lighting, brand walls and durable commercial storage.',
      href: '/blog/blue-carpet-office-waiting-area-design/',
      image: canvaVisuals.office,
      readTime: '4 min read',
    },
    {
      category: 'Kitchen Project',
      title: 'Modular kitchen with warm profile lights',
      summary:
        'Plan profile lighting with storage, sink durability, appliance clearance and a human-verified execution quote.',
      href: '/blog/modular-kitchen-warm-profile-lights/',
      image: canvaVisuals.kitchenVisual,
      readTime: '5 min read',
    },
    {
      category: 'Wardrobe Project',
      title: 'Custom wardrobe for saree storage',
      summary:
        'Internal wardrobe planning for sarees, luggage, drawers, hanging space, lofts and daily-use access.',
      href: '/blog/custom-wardrobe-saree-storage/',
      image: canvaVisuals.wardrobeVisual,
      readTime: '4 min read',
    },
    {
      category: 'Space Conversion',
      title: 'Garage to office interior transformation',
      summary:
        'A practical checklist for converting an unused garage or utility space into a small working office.',
      href: '/blog/garage-to-office-interior-transformation/',
      image: canvaVisuals.office,
      readTime: '5 min read',
    },
    {
      category: 'Kitchen Cost Guide',
      title: 'What changes modular kitchen cost in Delhi NCR?',
      summary:
        'Understand how layout, cabinet material, shutter finish, hardware, countertop and site work shape a practical kitchen quotation.',
      href: '/blog/modular-kitchen-cost-delhi-ncr/',
      image: canvaVisuals.kitchenVisual,
      readTime: '6 min read',
    },
    {
      category: 'Wardrobe Planning',
      title: 'Sliding vs swing wardrobe for a small bedroom',
      summary:
        'A clear guide to shutter clearance, access, maintenance and storage planning before ordering a custom wardrobe.',
      href: '/blog/sliding-vs-swing-wardrobe-small-bedroom/',
      image: canvaVisuals.wardrobeVisual,
      readTime: '5 min read',
    },
    {
      category: 'Finish Guide',
      title: 'Laminate, acrylic or veneer: which finish should you choose?',
      summary:
        'Compare finishes by daily use, cleaning, durability, budget and the premium look you want for your interiors.',
      href: '/blog/laminate-vs-acrylic-vs-veneer-finish/',
      image: canvaVisuals.aiJourney,
      readTime: '5 min read',
    },
    {
      category: 'Interior Coordination',
      title: 'Coordinate false ceiling, wall panels and furniture before work starts',
      summary:
        'Plan lighting, TV units, ceiling drops, wall panels and furniture together so the room feels intentional.',
      href: '/blog/false-ceiling-and-wall-panel-coordination/',
      image: canvaVisuals.office,
      readTime: '4 min read',
    },
    {
      category: 'Measurement Guide',
      title: 'How to measure a room for custom furniture',
      summary:
        'Know what wall sizes, switchboards, windows, doors and clearance details help create a more accurate first quote.',
      href: '/blog/how-to-measure-room-for-custom-furniture/',
      image: canvaVisuals.aiJourney,
      readTime: '4 min read',
    },
    {
      category: 'CNC Panels',
      title: 'CNC wall panels for TV units and feature walls',
      summary:
        'Choose pattern, depth, lighting and wiring access carefully before adding CNC wall panels to a TV wall.',
      href: '/blog/cnc-wall-panels-for-tv-unit/',
      image: canvaVisuals.office,
      readTime: '4 min read',
    },
  ];

  const aiJourneySteps = [
    {
      icon: Upload,
      title: 'Upload Site Photo',
      desc: 'Share clear photos from multiple angles, plus a sketch or reference if available.',
    },
    {
      icon: Ruler,
      title: 'Add Exact Dimensions',
      desc: 'Add length, width, height, doors, windows and other details as accurately as possible.',
    },
    {
      icon: Sparkles,
      title: 'Get a First Design Preview',
      desc: 'AlterCraft prepares visual directions so you can compare possible looks before deciding.',
    },
    {
      icon: CheckCircle,
      title: 'Discuss the Final Plan',
      desc: 'Our team checks materials, sizes, pricing and production details with you.',
    },
  ];

  const aiTutorialTips = [
    'Upload clear photos from multiple angles.',
    'Add length, width and height.',
    'Mention door and window position.',
    'Add budget range.',
    'Mention preferred style.',
    'Upload reference image if available.',
  ];

  const realWorkCategories = [
    'Office Interiors',
    'Modular Kitchens',
    'Wardrobes',
    'Beds',
    'Doors',
    'TV Units',
    'Custom Furniture',
    'Commercial Spaces',
  ];

  const storyStages = [
    {
      title: 'Upload & Measure',
      desc: 'Share your actual room photos and measurements. This is a planning visualization.',
      image: '/images/generated/v1/design-planning.webp',
    },
    {
      title: 'Concept Direction',
      desc: 'An AI-assisted design visualization to help choose the look and direction.',
      image: canvaVisuals.aiJourney,
    },
    {
      title: 'Material & Scope Review',
      desc: 'AlterCraft checks sizes, materials, scope and quotation with you.',
      image: '/images/generated/v1/joinery-soft-close.webp',
    },
    {
      title: 'Execution Planning',
      desc: 'A process visualization of production, installation and handover after confirmation.',
      image: '/images/generated/v1/site-installation.webp',
    },
  ];

  const plannerServices = [
    {
      title: 'Modular Kitchen',
      description: 'Layout, storage, appliance spaces and finish suggestions for your kitchen.',
      image: canvaVisuals.kitchenVisual,
    },
    {
      title: 'Office Interior',
      description: 'Workstations, reception, storage and furniture planning for offices.',
      image: canvaVisuals.office,
    },
    {
      title: 'Wardrobe',
      description: 'Sliding, swing, loft, drawer and internal storage suggestions.',
      image: canvaVisuals.wardrobeVisual,
    },
    {
      title: 'Bedroom Furniture',
      description: 'Bed, headboard, side table and storage ideas based on your room.',
      image:
        '/images/generated/v1/bed-upholstered-drawer.webp',
    },
    {
      title: 'Beds',
      description: 'Hydraulic, drawer, platform and upholstered bed options.',
      image:
        '/images/generated/v1/bed-hydraulic-storage.webp',
    },
    {
      title: 'Flush Doors',
      description: 'Door finishes, hardware and room-wise matching guidance.',
      image:
        '/images/generated/v1/flush-door.webp',
    },
    {
      title: 'TV Units',
      description: 'Wall panel, console, storage, wiring and lighting ideas.',
      image:
        '/images/generated/v1/living-media-wall.webp',
    },
    {
      title: 'Custom Furniture',
      description: 'Measured ideas for mandirs, study tables, storage, counters and special units.',
      image:
        '/images/generated/v1/pooja-mandir-cnc.webp',
    },
    {
      title: 'Full Interior Execution',
      description: 'Room-by-room planning that can move into quotation and production.',
      image:
        '/images/generated/v1/brand-hero.webp',
    },
  ];

  return (
    <div className="home-site">
      <SEOHead
        title="Custom Furniture & Modular Kitchen in Ghaziabad | AlterCraft"
        description={`AlterCraft designs custom furniture, modular kitchens from ${modularKitchenStartingPrice}, wardrobes, beds, office interiors and AI-assisted imagination previews in Ghaziabad, Noida, Greater Noida and Delhi NCR.`}
        canonical="https://www.altercraft.in/"
        jsonLd={[homeLocalBusinessSchema]}
      />
      <HomeHeader />

      <main>
        <HeroPoster />

        <section className="home-trust-strip">
          <div className="home-container home-trust-grid">
            {trustBadges.map(({ icon: Icon, label }) => (
              <div key={label} className="home-trust-item">
                <Icon size={19} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <SpatialStudio />

        <CanvaVisualShowcase />

        <section className="home-section home-ai-intro">
          <div className="home-container home-ai-intro-grid">
            <div>
              <p className="home-kicker">Start With A Design Idea</p>
              <h2>See the idea first. Decide after our team reviews it.</h2>
              <p>
                Share your room photos, sizes, budget and requirements. We prepare a first design
                preview so you can understand the direction before discussing materials, quotation,
                production and installation.
              </p>
              <PreviewDisclaimer compact />
              <div className="home-ai-actions">
                <Link to="/ai-planner/start" className="home-button home-button-solid">
                  Start My Design Preview
                  <ArrowRight size={16} />
                </Link>
                <Link to="/my-projects/AC-IMG-0001" className="home-button home-button-ghost">
                  View Preview Example
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
            <div className="home-ai-flow-card">
              {['Design Preview', 'Designer Review', 'Final Details', 'Quotation', 'Production', 'Installation'].map((stage, index) => (
                <article key={stage}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{stage}</strong>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-section home-section-muted">
          <div className="home-container">
            <div className="home-section-head">
              <p className="home-kicker">How It Works</p>
              <h2>Four simple steps before we begin the work</h2>
            </div>
            <div className="home-ai-step-grid">
              {aiJourneySteps.map(({ icon: Icon, title, desc }) => (
                <article key={title} className="home-ai-step-card">
                  <span><Icon size={24} /></span>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-section">
          <div className="home-container home-ai-tutorial-grid">
            <div>
              <p className="home-kicker">How To Share Details</p>
              <h2>Clear photos and sizes help us guide you better</h2>
              <p>
                Add the details you know. If something is missing, we will keep it marked as
                "Not provided" and confirm it with you before moving ahead.
              </p>
            </div>
            <div className="home-ai-tip-list">
              {aiTutorialTips.map((tip) => (
                <div key={tip}>
                  <CheckCircle size={18} />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="home-section home-section-muted">
          <div className="home-container">
            <div className="home-split-head">
              <div>
                <p className="home-kicker">Portfolio / Real Work</p>
                <h2>Choose the kind of space you want to improve</h2>
              </div>
              <Link to="/gallery" className="home-inline-link">
                View Portfolio
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="home-ai-category-strip">
              {realWorkCategories.map((category) => (
                <Link key={category} to="/gallery">
                  <Eye size={17} />
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="home-section home-ai-story-section">
          <div className="home-container">
            <div className="home-section-head">
              <p className="home-kicker">Before - Idea - Finished Work</p>
              <h2>A simpler way to understand your project</h2>
            </div>
            <div className="home-ai-story-grid">
              {storyStages.map((stage, index) => (
                <article key={stage.title}>
                  <img src={stage.image} alt={stage.title} />
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <h3>{stage.title}</h3>
                  <p>{stage.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-section home-section-muted">
          <div className="home-container">
            <div className="home-section-head">
              <p className="home-kicker">Services</p>
              <h2>Start with the room or furniture you need</h2>
              <p>
                Choose a category, share the room details and we will help you plan the next step.
              </p>
            </div>
            <div className="planner-service-grid home-planner-service-grid">
              {plannerServices.map((service) => (
                <ServiceCard key={service.title} {...service} />
              ))}
            </div>
          </div>
        </section>

        <section className="home-section">
          <div className="home-container">
            <div className="home-section-head">
              <p className="home-kicker">Popular Starting Points</p>
              <h2>Clear starting prices for common furniture work</h2>
              <p>
                Prices shown here are starting points for planning. Final quotations are shared
                after measurement, material choice and clear scope confirmation.
              </p>
            </div>

            <div className="home-offer-grid">
              {offerCards.map((card) => {
                const isExpanded = expandedOffer === card.title;

                return (
                  <article key={card.title} className="home-offer-card">
                    <div className="home-offer-image">
                      <img src={card.image} alt={card.title} />
                    </div>
                    <div className="home-offer-body">
                      <h3>{card.title}</h3>
                      <strong>{card.price}</strong>
                      <p>{card.note}</p>
                      {card.details ? (
                        <div className="home-offer-details">
                          <button
                            type="button"
                            className="home-offer-detail-toggle"
                            aria-expanded={isExpanded}
                            onClick={() => setExpandedOffer(isExpanded ? null : card.title)}
                          >
                            {isExpanded ? 'Hide material details' : card.detailsLabel}
                          </button>
                          {isExpanded ? (
                            <ul className="home-offer-material-list">
                              {card.details.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      ) : null}
                      <Link to={card.to} className="home-card-link">
                        {card.cta}
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="home-section home-section-muted">
          <div className="home-container">
            <div className="home-section-head">
              <p className="home-kicker">Our Promise</p>
              <h2>Why choose AlterCraft?</h2>
            </div>

            <div className="home-feature-grid">
              {whyUs.map(({ icon: Icon, title, desc }) => (
                <article key={title} className="home-feature-card">
                  <span>
                    <Icon size={26} />
                  </span>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-material-band">
          <img
            src="/images/generated/v1/joinery-soft-close.webp"
            alt="Premium modular kitchen material finish"
          />
          <div className="home-material-overlay" />
          <div className="home-container home-material-content">
            <div>
              <p className="home-kicker">Materials We Use</p>
              <h2>Crafted with materials selected for daily use</h2>
              <p>
                Kitchen moisture, bedroom storage load, shutter size, hardware movement and
                finish maintenance are considered before we recommend materials.
              </p>
              <Link to="/warranty-quality" className="home-inline-link">
                Learn about quality standards
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="home-material-list">
              {[
                ['Moisture-aware boards', 'Chosen according to site exposure and product category.'],
                ['Premium laminates', 'Warm, easy-to-maintain finishes for homes and offices.'],
                ['Reliable hardware', 'Soft-close hinges, channels and storage fittings where applicable.'],
                ['Clean detailing', 'Edge bands, alignment and handover checks before completion.'],
              ].map(([title, desc]) => (
                <article key={title}>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-section">
          <div className="home-container">
            <div className="home-section-head">
              <p className="home-kicker">How It Works</p>
              <h2>Our design and delivery process</h2>
            </div>
            <div className="home-process-grid">
              {processSteps.map(([num, title, desc]) => (
                <article key={num} className="home-process-step">
                  <span>{num}</span>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-section home-section-muted">
          <div className="home-container">
            <div className="home-split-head">
              <div>
                <p className="home-kicker">Design Direction</p>
              <h2>AI-assisted concept ideas</h2>
              </div>
              <Link to="/gallery" className="home-inline-link">
                View all
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="home-portfolio-grid">
              {portfolio.map((item) => (
                <article key={item.label}>
                  <img src={item.image} alt={item.label} />
                  <span>{item.label}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-section">
          <div className="home-container">
            <div className="home-section-head">
              <p className="home-kicker">Explore</p>
              <h2>Product categories</h2>
              <p>
                Wardrobes currently start from {formatInr(wardrobeStartingPrice)} in the
                product data, with final size and finish adjusted to your room.
              </p>
            </div>
            <div className="home-category-grid">
              {categories.map((category) => (
                <Link key={category.title} to={category.to} className="home-category-card">
                  <img src={category.image} alt={category.title} />
                  <span>{category.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="home-warranty-band">
          <div className="home-container home-warranty-inner">
            <div>
              <p className="home-kicker">Our Commitment</p>
              <h2>Warranty & after-sales support across eligible work</h2>
              <p>
                Warranty is not limited to doors. AlterCraft provides warranty support across
                eligible products, services, hardware, workmanship and installation scope.
              </p>
            </div>
            <div className="home-warranty-grid">
              {[
                ['Products', 'Eligible furniture and interior categories'],
                ['Hardware', 'Brand and specification based coverage'],
                ['Doors', 'Door-specific warranty where applicable'],
                ['Service', 'Repair and support coordination after handover'],
              ].map(([title, desc]) => (
                <article key={title}>
                  <strong>{title}</strong>
                  <span>{desc}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-section home-section-card">
          <div className="home-container">
            <div className="home-section-head">
              <p className="home-kicker">Client Notes</p>
              <h2>What customers value</h2>
            </div>
            <div className="home-testimonial-grid">
              {testimonials.map((item) => (
                <article key={item.name}>
                  <div>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} size={16} />
                    ))}
                  </div>
                  <p>"{item.text}"</p>
                  <strong>{item.name}</strong>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-section home-blog-section" id="blog">
          <div className="home-container">
            <div className="home-split-head">
              <div>
                <p className="home-kicker">Design Journal</p>
                <h2>Project stories and planning guides from AlterCraft</h2>
                <p>
                  Crawlable project stories and practical guides for office interiors, modular
                  kitchens, wardrobes, custom furniture, finishes and site-visit preparation.
                </p>
              </div>
              <a href="/blog/" className="home-inline-link">
                View all guides
                <ArrowRight size={16} />
              </a>
            </div>

            <div className="home-blog-grid">
              {blogPosts.map((post, index) => (
                <a
                  key={post.href}
                  href={post.href}
                  className={`home-blog-card ${index === 0 ? 'featured' : ''}`}
                >
                  <span className="home-blog-image">
                    <img src={post.image} alt={post.title} />
                  </span>
                  <span className="home-blog-body">
                    <span className="home-blog-meta">
                      {post.category}
                      <span>{post.readTime}</span>
                    </span>
                    <strong>{post.title}</strong>
                    <span>{post.summary}</span>
                    <span className="home-blog-link">
                      Read guide
                      <ArrowRight size={15} />
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="home-ai-final-cta">
          <div className="home-container">
            <p className="home-kicker">Start Planning</p>
            <h2>Ready to see what your space can become?</h2>
            <p>
              Share your space, add the important sizes and start a design preview request with
              AlterCraft.
            </p>
            <Link to="/ai-planner/start" className="home-button home-button-solid">
              Share Your Space Now
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        <section className="home-section home-contact-section">
          <div className="home-container home-contact-grid">
            <div>
              <p className="home-kicker">Get Started</p>
              <h2>Request a free consultation</h2>
              <p>
                Share the room size, product type, preferred finish and timeline. Your message
                opens on WhatsApp so we can continue the conversation quickly.
              </p>
              <div className="home-contact-list">
                <a href={siteDetails.phoneHref}>
                  <Phone size={17} />
                  {siteDetails.phoneDisplay}
                </a>
                <a href={siteDetails.emailHref}>
                  <Mail size={17} />
                  {siteDetails.email}
                </a>
                <span>
                  <MapPin size={17} />
                  {siteDetails.fullAddress}
                </span>
                <span>
                  <Shield size={17} />
                  GSTIN: {siteDetails.gstin}
                </span>
                <span>
                  <Shield size={17} />
                  Udyam: {siteDetails.udyamRegistration}
                </span>
                <span>
                  <Shield size={17} />
                  {siteDetails.warranty}
                </span>
              </div>
            </div>
            <div className="home-quote-card">
              <h3>Request Free Quote</h3>
              <QuoteForm defaultService="Full Home Furniture" />
            </div>
          </div>
        </section>
      </main>

      <ElegantFooter />
      <FloatingWhatsApp />
      <MobileBottomNav />
    </div>
  );
}
