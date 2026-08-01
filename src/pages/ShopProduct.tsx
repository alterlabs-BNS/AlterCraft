import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Check, ChevronLeft, MessageCircle, ShoppingBag } from 'lucide-react';
import { ElegantLayout } from '../components/elegant/ElegantLayout';
import { SEOHead } from '../components/seo/SEOHead';
import { createWhatsappLink } from '../utils/contact';
import { trackEvent } from '../utils/analytics';
import { formatInrPaise, loadProductAnyCategory, loadProducts, type Product } from '../lib/shopData';
import { addToCart } from '../lib/cartStore';
import '../styles/shop.css';

export default function ShopProduct() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const found = slug ? await loadProductAnyCategory(slug) : null;
      if (!active) return;
      setProduct(found);
      setActiveImage(0);
      setVariantId(found?.variants[0]?.id ?? null);
      if (found) {
        const siblings = await loadProducts(found.categorySlug);
        if (active) setRelated(siblings.filter((entry) => entry.id !== found.id).slice(0, 4));
      } else {
        setRelated([]);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  const quoted = product ? product.flow === 'quoted' || product.basePricePaise == null : false;
  const variant = useMemo(
    () => product?.variants.find((entry) => entry.id === variantId) ?? null,
    [product, variantId],
  );
  const pricePaise = variant?.pricePaise ?? product?.basePricePaise ?? null;

  if (loading) {
    return (
      <ElegantLayout>
        <main className="shop-pdp">
          <p className="shop-pdp-loading">Loading…</p>
        </main>
      </ElegantLayout>
    );
  }

  if (!product) {
    return (
      <ElegantLayout>
        <main className="shop-pdp shop-pdp-missing">
          <h1>Product not found</h1>
          <Link to="/shop" className="shop-btn shop-btn-solid">
            Back to shop
          </Link>
        </main>
      </ElegantLayout>
    );
  }

  const handleAdd = () => {
    addToCart(product, variantId);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
    trackEvent('add_to_cart', {
      item_id: product.id,
      item_name: product.name,
      value: (pricePaise ?? 0) / 100,
      currency: 'INR',
    });
  };

  const enquiryLink = createWhatsappLink(
    `Hi AlterCraft, I'm interested in ${product.name} (${product.sku}).${
      pricePaise ? ` Listed price ${formatInrPaise(pricePaise)}.` : ''
    } Please share details.`,
  );
  const specEntries = Object.entries(product.specs || {}).filter(([, value]) => typeof value === 'string');

  return (
    <ElegantLayout>
      <SEOHead
        title={`${product.name} | AlterCraft`}
        description={(product.description ?? `${product.name} by AlterCraft. ${product.subtitle ?? ''}`).trim()}
        canonical={`https://www.altercraft.in/shop/p/${product.slug}`}
      />
      <main className="shop-pdp">
        <Link to="/shop" className="shop-pdp-back">
          <ChevronLeft size={16} /> Back to shop
        </Link>

        <div className="shop-pdp-top">
          <div className="shop-pdp-gallery">
            <div className="shop-pdp-main">
              {product.images[activeImage]?.url ? (
                <img
                  src={product.images[activeImage].url}
                  alt={product.images[activeImage].alt ?? product.name}
                />
              ) : (
                <div className="shop-card-noimg" />
              )}
            </div>
            {product.images.length > 1 && (
              <div className="shop-pdp-thumbs">
                {product.images.map((image, index) => (
                  <button
                    type="button"
                    key={`${image.url}-${index}`}
                    className={index === activeImage ? 'active' : ''}
                    onClick={() => setActiveImage(index)}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img src={image.url} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="shop-pdp-info">
            {product.categorySlug && <p className="shop-eyebrow">{product.categorySlug.replace(/-/g, ' ')}</p>}
            <h1>{product.name}</h1>
            {product.subtitle && <p className="shop-pdp-subtitle">{product.subtitle}</p>}

            <div className="shop-pdp-price">
              {quoted ? (
                <strong>Priced on request</strong>
              ) : (
                <>
                  <span>From</span>
                  <strong>{formatInrPaise(pricePaise)}</strong>
                  <small>+ tax</small>
                </>
              )}
            </div>

            {product.variants.length > 0 && (
              <div className="shop-pdp-variants">
                <h3>Options</h3>
                <div className="shop-chips">
                  {product.variants.map((entry) => (
                    <button
                      type="button"
                      key={entry.id}
                      className={entry.id === variantId ? 'active' : ''}
                      onClick={() => setVariantId(entry.id)}
                    >
                      {entry.label} · {formatInrPaise(entry.pricePaise)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="shop-pdp-actions">
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
                <>
                  <button type="button" className="shop-btn shop-btn-solid" onClick={handleAdd}>
                    {added ? (
                      <>
                        <Check size={16} /> Added to cart
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={16} /> Add to cart
                      </>
                    )}
                  </button>
                  <a className="shop-btn shop-btn-ghost" href={enquiryLink} target="_blank" rel="noreferrer">
                    <MessageCircle size={16} /> Enquire on WhatsApp
                  </a>
                </>
              )}
            </div>

            {product.highlights.length > 0 && (
              <ul className="shop-pdp-highlights">
                {product.highlights.map((highlight) => (
                  <li key={highlight}>
                    <Check size={15} /> {highlight}
                  </li>
                ))}
              </ul>
            )}

            {specEntries.length > 0 && (
              <div className="shop-pdp-specs">
                <h3>Details</h3>
                <dl>
                  {specEntries.map(([key, value]) => (
                    <React.Fragment key={key}>
                      <dt>{key}</dt>
                      <dd>{String(value)}</dd>
                    </React.Fragment>
                  ))}
                </dl>
              </div>
            )}

            {product.description && <p className="shop-pdp-desc">{product.description}</p>}

            <div className="shop-pdp-delivery">
              <p>
                <strong>Delivery &amp; installation:</strong> Pan-India, quoted per destination. Made after
                confirmation of size, storage and finish.
              </p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="shop-pdp-related">
            <h2>More products</h2>
            <div className="shop-grid">
              {related.map((entry) => {
                const relQuoted = entry.flow === 'quoted' || entry.basePricePaise == null;
                return (
                  <article className="shop-card" key={entry.id}>
                    <Link to={`/shop/p/${entry.slug}`} className="shop-card-media">
                      {entry.images[0]?.url ? (
                        <img src={entry.images[0].url} alt={entry.images[0].alt ?? entry.name} loading="lazy" />
                      ) : (
                        <div className="shop-card-noimg" />
                      )}
                    </Link>
                    <div className="shop-card-body">
                      <div className="shop-card-heading">
                        <h3>
                          <Link to={`/shop/p/${entry.slug}`}>{entry.name}</Link>
                        </h3>
                      </div>
                      <div className="shop-card-price">
                        {relQuoted ? (
                          <strong>On request</strong>
                        ) : (
                          <>
                            <span>From</span>
                            <strong>{formatInrPaise(entry.basePricePaise)}</strong>
                          </>
                        )}
                      </div>
                      <Link className="shop-btn shop-btn-ghost" to={`/shop/p/${entry.slug}`}>
                        View more
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </ElegantLayout>
  );
}
