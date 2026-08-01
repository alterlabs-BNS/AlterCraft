import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  ArrowRight,
  Check,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import { ElegantLayout } from '../components/elegant/ElegantLayout';
import { SEOHead } from '../components/seo/SEOHead';
import { createWhatsappLink } from '../utils/contact';
import { trackEvent } from '../utils/analytics';
import {
  catalogueSource,
  formatInrPaise,
  loadCategories,
  loadProducts,
  type Category,
  type Product,
} from '../lib/shopData';
import { addToCart, removeFromCart, setQuantity, useCart, type CartItem } from '../lib/cartStore';
import '../styles/shop.css';

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'name-asc', label: 'Name: A–Z' },
  { key: 'name-desc', label: 'Name: Z–A' },
];

const priceOf = (product: Product) => product.basePricePaise;
const isQuoted = (product: Product) => product.flow === 'quoted' || product.basePricePaise == null;
const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

function buildFacets(products: Product[]) {
  const map = new Map<string, Set<string>>();
  for (const product of products) {
    for (const [key, value] of Object.entries(product.specs || {})) {
      if (typeof value !== 'string') continue;
      if (!map.has(key)) map.set(key, new Set());
      map.get(key)!.add(value);
    }
  }
  // Only surface facets with a useful number of distinct values (2..12).
  return [...map.entries()]
    .filter(([, values]) => values.size >= 2 && values.size <= 12)
    .map(([key, values]) => ({ key, values: [...values].sort() }));
}

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState<string>(searchParams.get('category') || 'all');
  const [selectedFacets, setSelectedFacets] = useState<Record<string, string[]>>({});
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState<SortKey>('featured');
  const [cartOpen, setCartOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [added, setAdded] = useState<string | null>(null);

  const cart = useCart();

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const [cats, prods] = await Promise.all([loadCategories(), loadProducts()]);
      if (!active) return;
      setCategories(cats);
      setProducts(prods);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setCategory(searchParams.get('category') || 'all');
  }, [searchParams]);

  const facets = useMemo(() => buildFacets(products), [products]);

  const toggleFacet = (key: string, value: string) => {
    setSelectedFacets((prev) => {
      const current = new Set(prev[key] || []);
      if (current.has(value)) current.delete(value);
      else current.add(value);
      const next = { ...prev, [key]: [...current] };
      if (next[key].length === 0) delete next[key];
      return next;
    });
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setSelectedFacets({});
    setMinPrice('');
    setMaxPrice('');
    setSort('featured');
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const min = minPrice ? Number(minPrice) * 100 : null;
    const max = maxPrice ? Number(maxPrice) * 100 : null;

    const list = products.filter((product) => {
      if (category !== 'all' && product.categorySlug !== category) return false;
      if (query) {
        const haystack = `${product.name} ${product.subtitle ?? ''} ${product.description ?? ''} ${product.sku}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      for (const [key, values] of Object.entries(selectedFacets)) {
        const specValue = product.specs?.[key];
        if (typeof specValue !== 'string' || !values.includes(specValue)) return false;
      }
      const price = priceOf(product);
      if (price != null) {
        if (min != null && price < min) return false;
        if (max != null && price > max) return false;
      }
      return true;
    });

    const byName = (a: Product, b: Product) => a.name.localeCompare(b.name);
    const sorted = [...list];
    switch (sort) {
      case 'price-asc':
        sorted.sort((a, b) => (priceOf(a) ?? Infinity) - (priceOf(b) ?? Infinity));
        break;
      case 'price-desc':
        sorted.sort((a, b) => (priceOf(b) ?? -Infinity) - (priceOf(a) ?? -Infinity));
        break;
      case 'name-asc':
        sorted.sort(byName);
        break;
      case 'name-desc':
        sorted.sort((a, b) => byName(b, a));
        break;
      default:
        break;
    }
    return sorted;
  }, [products, category, search, selectedFacets, minPrice, maxPrice, sort]);

  const handleAdd = (product: Product) => {
    addToCart(product);
    setAdded(product.id);
    window.setTimeout(() => setAdded((current) => (current === product.id ? null : current)), 1400);
    trackEvent('add_to_cart', {
      item_id: product.id,
      item_name: product.name,
      value: (product.basePricePaise ?? 0) / 100,
      currency: 'INR',
    });
  };

  const checkoutMessage = useMemo(
    () =>
      [
        'Hi AlterCraft, I would like to order / get a quote for:',
        ...cart.items.map(
          (item) => `- ${item.name} (${item.sku}) x ${item.quantity}: ${formatInrPaise(item.pricePaise)} each`,
        ),
        `Subtotal: ${cart.subtotalLabel}`,
        'Please confirm sizes, options, delivery and the final quotation.',
      ].join('\n'),
    [cart.items, cart.subtotalLabel],
  );

  return (
    <ElegantLayout>
      <SEOHead
        title="Shop Custom Furniture Online — Beds, Wardrobes & More | AlterCraft"
        description="Shop AlterCraft custom furniture with search, filters and Pan-India delivery. Designer beds from INR 15,000 + tax, plus wardrobes, mandir units, shoe racks and more."
        canonical="https://www.altercraft.in/shop"
      />
      <main className="shop">
        <header className="shop-hero">
          <p className="shop-eyebrow">AlterCraft Store</p>
          <h1>Shop factory-made furniture, delivered Pan-India.</h1>
          <p className="shop-hero-sub">
            Search, filter and compare designs. Fixed-price pieces add to cart; made-to-measure lines
            book a design visit.
          </p>
          {catalogueSource() === 'local' && (
            <p className="shop-note">
              Live bed catalogue shown. Connect Supabase to load every category from the database.
            </p>
          )}
        </header>

        <div className="shop-toolbar">
          <div className="shop-search">
            <Search size={18} aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search beds, finishes, styles…"
              aria-label="Search products"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </div>
          <div className="shop-sort">
            <label htmlFor="shop-sort-select">Sort</label>
            <select
              id="shop-sort-select"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
            >
              {SORTS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="shop-filter-toggle"
            onClick={() => setFiltersOpen((value) => !value)}
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>

        <div className="shop-body">
          <aside className={`shop-filters ${filtersOpen ? 'open' : ''}`}>
            <div className="shop-filter-group">
              <h3>Category</h3>
              <div className="shop-chips">
                <button
                  type="button"
                  className={category === 'all' ? 'active' : ''}
                  onClick={() => setCategory('all')}
                >
                  All
                </button>
                {categories.map((entry) => (
                  <button
                    type="button"
                    key={entry.slug}
                    className={category === entry.slug ? 'active' : ''}
                    onClick={() => setCategory(entry.slug)}
                  >
                    {entry.name}
                  </button>
                ))}
              </div>
            </div>

            {facets.map((facet) => (
              <div className="shop-filter-group" key={facet.key}>
                <h3>{titleCase(facet.key)}</h3>
                <div className="shop-chips">
                  {facet.values.map((value) => {
                    const on = (selectedFacets[facet.key] || []).includes(value);
                    return (
                      <button
                        type="button"
                        key={value}
                        className={on ? 'active' : ''}
                        onClick={() => toggleFacet(facet.key, value)}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="shop-filter-group">
              <h3>Price (₹)</h3>
              <div className="shop-price-range">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                  aria-label="Minimum price"
                />
                <span>—</span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  aria-label="Maximum price"
                />
              </div>
            </div>

            <button type="button" className="shop-clear" onClick={clearFilters}>
              Clear all filters
            </button>
          </aside>

          <section className="shop-results" aria-live="polite">
            <div className="shop-results-head">
              <p>{loading ? 'Loading…' : `${filtered.length} product${filtered.length === 1 ? '' : 's'}`}</p>
            </div>

            {!loading && filtered.length === 0 && (
              <div className="shop-empty">
                <p>No products match your filters.</p>
                <button type="button" onClick={clearFilters}>
                  Reset filters
                </button>
              </div>
            )}

            <div className="shop-grid">
              {filtered.map((product) => {
                const quoted = isQuoted(product);
                return (
                  <article className="shop-card" key={product.id}>
                    <Link to={`/shop/p/${product.slug}`} className="shop-card-media">
                      {product.images[0]?.url ? (
                        <img src={product.images[0].url} alt={product.images[0].alt ?? product.name} loading="lazy" />
                      ) : (
                        <div className="shop-card-noimg" aria-hidden="true" />
                      )}
                      {product.categorySlug && (
                        <span className="shop-card-tag">{product.categorySlug.replace(/-/g, ' ')}</span>
                      )}
                    </Link>
                    <div className="shop-card-body">
                      <div className="shop-card-heading">
                        <h3>
                          <Link to={`/shop/p/${product.slug}`}>{product.name}</Link>
                        </h3>
                        {product.subtitle && <p className="shop-card-sub">{product.subtitle}</p>}
                      </div>
                      <div className="shop-card-price">
                        {quoted ? (
                          <strong>On request</strong>
                        ) : (
                          <>
                            <span>From</span>
                            <strong>{formatInrPaise(product.basePricePaise)}</strong>
                          </>
                        )}
                      </div>
                      <div className="shop-card-actions">
                        <Link className="shop-btn shop-btn-ghost" to={`/shop/p/${product.slug}`}>
                          View more
                        </Link>
                        {quoted ? (
                          <a
                            className="shop-btn shop-btn-solid"
                            href={createWhatsappLink(`Hi AlterCraft, I'd like to book a design visit for ${product.name}.`)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Book a Design Visit
                          </a>
                        ) : (
                          <button type="button" className="shop-btn shop-btn-solid" onClick={() => handleAdd(product)}>
                            {added === product.id ? (
                              <>
                                <Check size={16} /> Added
                              </>
                            ) : (
                              <>
                                <ShoppingBag size={16} /> Add to cart
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {cart.count > 0 && (
        <button
          type="button"
          className="shop-cart-fab"
          onClick={() => setCartOpen(true)}
          aria-label={`Open cart, ${cart.count} item${cart.count === 1 ? '' : 's'}`}
        >
          <ShoppingBag size={20} />
          <span>Cart</span>
          <strong>{cart.count}</strong>
        </button>
      )}

      <div className={`shop-cart-layer ${cartOpen ? 'open' : ''}`} aria-hidden={!cartOpen}>
        <button
          type="button"
          className="shop-cart-backdrop"
          onClick={() => setCartOpen(false)}
          aria-label="Close cart"
          tabIndex={cartOpen ? 0 : -1}
        />
        <aside className="shop-cart" role="dialog" aria-modal="true" aria-label="Your cart">
          <div className="shop-cart-head">
            <h2>Your Cart</h2>
            <button type="button" onClick={() => setCartOpen(false)} aria-label="Close cart">
              <X size={20} />
            </button>
          </div>
          <div className="shop-cart-items">
            {cart.items.length === 0 ? (
              <div className="shop-cart-empty">
                <ShoppingBag size={28} />
                <p>Your cart is empty.</p>
              </div>
            ) : (
              cart.items.map((item: CartItem) => (
                <article className="shop-cart-item" key={item.key}>
                  {item.image ? <img src={item.image} alt="" /> : <div className="shop-cart-noimg" />}
                  <div>
                    <h4>{item.name}</h4>
                    <p>{formatInrPaise(item.pricePaise)}</p>
                    <div className="shop-qty">
                      <button type="button" onClick={() => setQuantity(item.key, item.quantity - 1)} aria-label="Decrease quantity">
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => setQuantity(item.key, item.quantity + 1)} aria-label="Increase quantity">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <button type="button" className="shop-cart-remove" onClick={() => removeFromCart(item.key)} aria-label={`Remove ${item.name}`}>
                    <Trash2 size={16} />
                  </button>
                </article>
              ))
            )}
          </div>
          {cart.items.length > 0 && (
            <div className="shop-cart-foot">
              <div className="shop-cart-subtotal">
                <span>Subtotal</span>
                <strong>{cart.subtotalLabel}</strong>
              </div>
              <p className="shop-cart-note">
                Online payment checkout is coming next. For now, send your cart and we’ll confirm sizes,
                delivery and the final quotation.
              </p>
              <a
                className="shop-btn shop-btn-solid shop-cart-checkout"
                href={createWhatsappLink(checkoutMessage)}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('begin_checkout', { value: cart.subtotalPaise / 100, currency: 'INR', items: cart.count })}
              >
                Send cart on WhatsApp <ArrowRight size={16} />
              </a>
            </div>
          )}
        </aside>
      </div>
    </ElegantLayout>
  );
}
