import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { ElegantLayout } from '../components/elegant/ElegantLayout';
import { SEOHead } from '../components/seo/SEOHead';
import { bedProducts, bedStyleDescriptions, type BedProduct, type BedStyle } from '../data/beds';
import { createWhatsappLink } from '../utils/contact';
import { trackEvent } from '../utils/analytics';
import { formatInr } from '../utils/pricing';
import '../styles/beds-storefront.css';

type Filter = 'All' | BedStyle;
type CartLine = { productId: string; quantity: number };

const CART_KEY = 'altercraft-bed-cart-v1';
const filters: Filter[] = ['All', 'Straight', 'Curved', 'Signature'];

const readCart = (): CartLine[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

const buyMessage = (product: BedProduct) =>
  [
    `Hi AlterCraft, I want to buy the ${product.name} (${product.id}).`,
    `Listed starting price: ${formatInr(product.price)} + tax.`,
    `Headboard style: ${product.style}.`,
    'Listed price is for a non-hydraulic box bed. Hydraulic hardware is extra.',
    'Pan-India delivery is available; please confirm freight and installation for my location.',
    'Please confirm size, storage option, upholstery, delivery and final quotation.',
  ].join('\n');

export default function BedsStorefront() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [cart, setCart] = useState<CartLine[]>(readCart);
  const [cartOpen, setCartOpen] = useState(false);
  const [addedProduct, setAddedProduct] = useState<string | null>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (!cartOpen) return undefined;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setCartOpen(false);
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [cartOpen]);

  const visibleProducts = useMemo(
    () =>
      activeFilter === 'All'
        ? bedProducts
        : bedProducts.filter((product) => product.style === activeFilter),
    [activeFilter],
  );

  const cartItems = useMemo(
    () =>
      cart.flatMap((line) => {
        const product = bedProducts.find((item) => item.id === line.productId);
        return product ? [{ ...line, product }] : [];
      }),
    [cart],
  );

  const cartCount = cart.reduce((total, line) => total + line.quantity, 0);
  const subtotal = cartItems.reduce(
    (total, line) => total + line.product.price * line.quantity,
    0,
  );

  const addToCart = (product: BedProduct) => {
    setCart((current) => {
      const existing = current.find((line) => line.productId === product.id);
      return existing
        ? current.map((line) =>
            line.productId === product.id ? { ...line, quantity: line.quantity + 1 } : line,
          )
        : [...current, { productId: product.id, quantity: 1 }];
    });
    setAddedProduct(product.id);
    window.setTimeout(() => setAddedProduct(null), 1400);
    trackEvent('add_to_cart', {
      item_id: product.id,
      item_name: product.name,
      value: product.price,
      currency: 'INR',
    });
  };

  const updateQuantity = (productId: string, change: number) => {
    setCart((current) =>
      current
        .map((line) =>
          line.productId === productId
            ? { ...line, quantity: Math.max(0, line.quantity + change) }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
  };

  const checkoutMessage = [
    'Hi AlterCraft, I would like a quotation for these designer beds:',
    ...cartItems.map(
      ({ product, quantity }) =>
        `- ${product.name} (${product.id}) x ${quantity}: ${formatInr(product.price)} + tax each`,
    ),
    `Starting subtotal before tax: ${formatInr(subtotal)}`,
    'Listed prices are for non-hydraulic box beds. Hydraulic hardware is extra.',
    'Pan-India delivery is available; please confirm freight and installation for my location.',
    'Please confirm dimensions, storage, upholstery, delivery and the final quotation.',
  ].join('\n');

  const schemas = useMemo(
    () => [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Designer Beds by AlterCraft',
        url: 'https://www.altercraft.in/beds/',
        description:
          'Shop straight, curved and signature upholstered designer beds by AlterCraft in Ghaziabad and Delhi NCR.',
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: bedProducts.length,
          itemListElement: bedProducts.map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'Product',
              name: product.name,
              sku: product.id,
              image: `https://www.altercraft.in${product.image}`,
              description: product.description,
              brand: { '@type': 'Brand', name: 'AlterCraft' },
              offers: {
                '@type': 'Offer',
                priceCurrency: 'INR',
                price: product.price,
                availability: 'https://schema.org/PreOrder',
                url: 'https://www.altercraft.in/beds/',
              },
            },
          })),
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.altercraft.in/' },
          { '@type': 'ListItem', position: 2, name: 'Designer Beds', item: 'https://www.altercraft.in/beds/' },
        ],
      },
    ],
    [],
  );

  const handleHeroPointer = (event: React.PointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    heroRef.current?.style.setProperty('--pointer-x', `${x}%`);
    heroRef.current?.style.setProperty('--pointer-y', `${y}%`);
  };

  return (
    <ElegantLayout>
      <SEOHead
        title="Designer Beds from INR 15,000 + Tax | AlterCraft Ghaziabad"
        description="Explore 40 upholstered designer beds by AlterCraft with Pan-India delivery. Non-hydraulic box beds start at INR 15,000 + tax, with curved and signature headboard options."
        canonical="https://www.altercraft.in/beds/"
        jsonLd={schemas}
      />

      <main className="beds-storefront">
        <section
          ref={heroRef}
          className="beds-hero"
          onPointerMove={handleHeroPointer}
          style={{ '--pointer-x': '35%', '--pointer-y': '45%' } as React.CSSProperties}
        >
          <div className="beds-hero-image" aria-hidden="true" />
          <div className="beds-hero-shade" aria-hidden="true" />
          <div className="beds-hero-glow" aria-hidden="true" />
          <div className="beds-shell beds-hero-content">
            <p className="beds-eyebrow"><Sparkles size={14} /> AlterCraft Bed Collection</p>
            <h1>Sleep beautifully.<br />Choose your shape.</h1>
            <p className="beds-hero-copy">
              Upholstered designer beds shaped around your room, your comfort and your style.
              Pick a headboard you love, then confirm size, storage and fabric with our team.
            </p>
            <div className="beds-hero-price-row" aria-label="Designer bed starting prices">
              <div><span>Straight</span><strong>{formatInr(15000)} + tax</strong></div>
              <div><span>Curved</span><strong>{formatInr(17500)} + tax</strong></div>
              <div><span>Signature</span><strong>{formatInr(21000)} + tax</strong></div>
            </div>
            <p className="beds-hydraulic-note">
              Listed prices are for a non-hydraulic box bed. Hydraulic storage is charged extra
              according to the selected hardware quality. Pan-India delivery is available;
              freight and installation are quoted for the destination.
            </p>
            <a className="beds-hero-cta" href="#bed-collection">
              Explore all 40 designs <ArrowRight size={17} />
            </a>
          </div>
          <div className="beds-hero-index" aria-hidden="true">01 / 40</div>
        </section>

        <section className="beds-price-guide" aria-labelledby="bed-price-guide-title">
          <div className="beds-shell">
            <div className="beds-section-heading">
              <div>
                <p className="beds-eyebrow">Simple pricing by headboard</p>
                <h2 id="bed-price-guide-title">See the shape. Know the starting price.</h2>
              </div>
              <p>
                Final price depends on bed size, storage, fabric, material, delivery and site
                requirements. Listed prices are for a non-hydraulic box bed; hydraulic storage is
                extra according to hardware quality. Mattress, side tables, wall panels and
                decorative lighting are not included unless listed in your quotation.
              </p>
            </div>
            <div className="beds-price-grid">
              {(['Straight', 'Curved', 'Signature'] as BedStyle[]).map((style, index) => (
                <button
                  type="button"
                  className="beds-price-card"
                  key={style}
                  onClick={() => {
                    setActiveFilter(style);
                    document.getElementById('bed-collection')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span>0{index + 1}</span>
                  <h3>{style}</h3>
                  <strong>{formatInr(style === 'Straight' ? 15000 : style === 'Curved' ? 17500 : 21000)} + tax</strong>
                  <p>{bedStyleDescriptions[style]}</p>
                  <em>View designs <ArrowRight size={15} /></em>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="beds-catalogue" id="bed-collection" aria-labelledby="bed-collection-title">
          <div className="beds-shell">
            <div className="beds-catalogue-toolbar">
              <div>
                <p className="beds-eyebrow">The collection</p>
                <h2 id="bed-collection-title">Find your headboard</h2>
                <p>{visibleProducts.length} designs shown</p>
              </div>
              <div className="beds-filters" aria-label="Filter bed designs">
                {filters.map((filter) => (
                  <button
                    type="button"
                    key={filter}
                    className={activeFilter === filter ? 'active' : ''}
                    onClick={() => setActiveFilter(filter)}
                    aria-pressed={activeFilter === filter}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="beds-product-grid">
              {visibleProducts.map((product, index) => (
                <article className="beds-product-card" key={product.id}>
                  <div className="beds-product-media">
                    <img
                      src={product.image}
                      alt={`${product.name} upholstered designer bed`}
                      width="900"
                      height="504"
                      loading={index < 4 ? 'eager' : 'lazy'}
                    />
                    <span>{product.style}</span>
                    <small>{product.id}</small>
                  </div>
                  <div className="beds-product-body">
                    <div className="beds-product-heading">
                      <div>
                        <h3>{product.name}</h3>
                        <p>{product.finish}</p>
                      </div>
                      <div className="beds-product-price">
                        <span>From</span>
                        <strong>{formatInr(product.price)}</strong>
                        <small>+ tax</small>
                      </div>
                    </div>
                    <p className="beds-product-description">{product.description}</p>
                    <p className="beds-product-hydraulic">
                      Non-hydraulic box bed price. Hydraulic hardware costs extra.
                    </p>
                    <div className="beds-product-actions">
                      <button
                        type="button"
                        className="beds-add-button"
                        onClick={() => addToCart(product)}
                      >
                        {addedProduct === product.id ? <Check size={17} /> : <ShoppingBag size={17} />}
                        {addedProduct === product.id ? 'Added' : 'Add to cart'}
                      </button>
                      <a
                        className="beds-buy-button"
                        href={createWhatsappLink(buyMessage(product))}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() =>
                          trackEvent('begin_checkout', {
                            item_id: product.id,
                            item_name: product.name,
                            value: product.price,
                            currency: 'INR',
                          })
                        }
                      >
                        Buy now <ArrowRight size={16} />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="beds-order-note">
          <div className="beds-shell beds-order-note-inner">
            <div>
              <p className="beds-eyebrow">Made after confirmation</p>
              <h2>Your design, properly sized for your room.</h2>
            </div>
            <div className="beds-order-points">
              {[
                'Choose queen, king or a custom size',
                'Select box, drawer or hydraulic storage',
                'Confirm fabric and colour before production',
                'Pan-India delivery with destination-based freight',
                'Receive a final quotation before work begins',
              ].map((point) => <p key={point}><Check size={16} /> {point}</p>)}
            </div>
          </div>
        </section>
      </main>

      {cartCount > 0 && (
        <button
          type="button"
          className="beds-cart-fab"
          onClick={() => setCartOpen(true)}
          aria-label={`Open cart with ${cartCount} item${cartCount === 1 ? '' : 's'}`}
        >
          <ShoppingBag size={20} />
          <span>Cart</span>
          <strong>{cartCount}</strong>
        </button>
      )}

      <div className={`beds-cart-layer ${cartOpen ? 'open' : ''}`} aria-hidden={!cartOpen}>
        <button
          type="button"
          className="beds-cart-backdrop"
          onClick={() => setCartOpen(false)}
          aria-label="Close cart"
          tabIndex={cartOpen ? 0 : -1}
        />
        <aside className="beds-cart-drawer" role="dialog" aria-modal="true" aria-label="Your bed cart">
          <div className="beds-cart-header">
            <div><span>Your shortlist</span><h2>Bed Cart</h2></div>
            <button type="button" onClick={() => setCartOpen(false)} aria-label="Close cart"><X size={20} /></button>
          </div>

          <div className="beds-cart-items">
            {cartItems.length === 0 ? (
              <div className="beds-cart-empty">
                <ShoppingBag size={30} />
                <h3>Your cart is ready for a favourite.</h3>
                <p>Add any design, then send the shortlist to AlterCraft for size and material confirmation.</p>
                <button type="button" onClick={() => setCartOpen(false)}>Browse beds</button>
              </div>
            ) : (
              cartItems.map(({ product, quantity }) => (
                <article className="beds-cart-item" key={product.id}>
                  <img src={product.image} alt="" width="112" height="70" />
                  <div>
                    <h3>{product.name}</h3>
                    <p>{formatInr(product.price)} + tax</p>
                    <div className="beds-cart-quantity" aria-label={`Quantity for ${product.name}`}>
                      <button type="button" onClick={() => updateQuantity(product.id, -1)} aria-label="Decrease quantity"><Minus size={14} /></button>
                      <span>{quantity}</span>
                      <button type="button" onClick={() => updateQuantity(product.id, 1)} aria-label="Increase quantity"><Plus size={14} /></button>
                    </div>
                  </div>
                  <button type="button" className="beds-cart-remove" onClick={() => updateQuantity(product.id, -quantity)} aria-label={`Remove ${product.name}`}><Trash2 size={16} /></button>
                </article>
              ))
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="beds-cart-footer">
              <div><span>Starting subtotal</span><strong>{formatInr(subtotal)} + tax</strong></div>
              <p>
                Listed prices are for non-hydraulic box beds. Final price is confirmed after size,
                storage, upholstery, hydraulic hardware quality and delivery details are reviewed.
              </p>
              <a
                href={createWhatsappLink(checkoutMessage)}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('begin_checkout', { value: subtotal, currency: 'INR', items: cartCount })}
              >
                Send shortlist on WhatsApp <ArrowRight size={17} />
              </a>
            </div>
          )}
        </aside>
      </div>
    </ElegantLayout>
  );
}
