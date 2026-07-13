import React, { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Check, Layers, Package, Ruler, ShieldCheck } from 'lucide-react';
import { ElegantLayout } from '../components/elegant/ElegantLayout';
import { ProductCard } from '../components/ProductCard';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { products } from '../data/products';
import { formatInr } from '../utils/pricing';
import { createWhatsappLink } from '../utils/contact';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const product = products.find((item) => item.id === id);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!product) {
    return (
      <ElegantLayout>
        <section className="elegant-section">
          <div className="elegant-container" style={{ textAlign: 'center' }}>
            <p className="elegant-kicker">Product</p>
            <h1 className="elegant-heading">Product Not Found</h1>
            <p className="elegant-copy">The selected product is not available.</p>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/gallery" className="elegant-button">Back to Gallery</Link>
            </div>
          </div>
        </section>
      </ElegantLayout>
    );
  }

  const hasRent = product.availability.includes('rent') && product.rent.monthly > 0;
  const hasBuy = product.availability.includes('buy') && product.prices.offer > 0;
  const similarProducts = products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 3);

  return (
    <ElegantLayout>
      <main className="elegant-product-shell">
        <div className="elegant-container">
          <div className="elegant-product-layout">
            <div>
              <div className="elegant-product-main-image">
                <ImageWithFallback
                  src={product.images[selectedImageIndex]}
                  alt={`${product.name} view ${selectedImageIndex + 1}`}
                />
                <span className="elegant-product-code">{product.code}</span>
              </div>
              <div className="elegant-product-thumbs">
                {product.images.map((image, index) => (
                  <button
                    key={`${product.id}-${index}`}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`elegant-product-thumb ${
                      selectedImageIndex === index ? 'active' : ''
                    }`}
                    aria-label={`View ${product.name} image ${index + 1}`}
                  >
                    <ImageWithFallback src={image} alt={`${product.name} thumbnail ${index + 1}`} />
                  </button>
                ))}
              </div>
            </div>

            <section className="elegant-product-info">
              <span className="elegant-badge">{product.category}</span>
              <h1 className="elegant-product-title">{product.name}</h1>
              <p className="elegant-copy">{product.shortDescription}</p>
              <p className="elegant-copy">
                Design visualization only. Final dimensions, materials, price and delivery are
                confirmed after measurement and scope review.
              </p>

              <div className="elegant-product-price-panel">
                {hasBuy ? (
                  <div className="elegant-price-row">
                    <span>Offer Price</span>
                    <strong>{formatInr(product.prices.offer)}</strong>
                    <p>
                      MRP {formatInr(product.prices.mrp)} | Save {formatInr(product.prices.save)}
                    </p>
                  </div>
                ) : null}

                {hasRent ? (
                  <div className="elegant-price-row">
                    <span>Rental Option</span>
                    <strong>{formatInr(product.rent.monthly)} / month</strong>
                    <p>Refundable deposit {formatInr(product.rent.deposit)}</p>
                  </div>
                ) : null}
              </div>

              <div className="elegant-spec-list">
                <div className="elegant-spec-item">
                  <Package size={18} />
                  <span>
                    <strong>Delivery</strong>
                    {product.deliveryDays} days
                  </span>
                </div>
                <div className="elegant-spec-item">
                  <Ruler size={18} />
                  <span>
                    <strong>Dimensions</strong>
                    {product.dimensions}
                  </span>
                </div>
                <div className="elegant-spec-item">
                  <Layers size={18} />
                  <span>
                    <strong>Materials</strong>
                    {product.materials}
                  </span>
                </div>
                <div className="elegant-spec-item">
                  <ShieldCheck size={18} />
                  <span>
                    <strong>Warranty</strong>
                    Warranty support available across eligible products, hardware, workmanship and
                    installation.
                  </span>
                </div>
              </div>

              <div className="elegant-check-list">
                {product.features.map((feature) => (
                  <div className="elegant-check" key={feature}>
                    <Check size={18} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                <a
                  className="elegant-button"
                  href={createWhatsappLink(
                    `Hi AlterCraft, I am interested in ${product.name} (${product.code}).`
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  Get a Custom Quote
                </a>
                <Link className="elegant-button-secondary" to="/gallery">
                  Back to Gallery
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>

      {similarProducts.length > 0 ? (
        <section className="elegant-related">
          <div className="elegant-container">
            <div className="elegant-section-head">
              <p className="elegant-kicker">Related</p>
              <h2 className="elegant-heading">Similar Products</h2>
            </div>
            <div className="elegant-grid">
              {similarProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </ElegantLayout>
  );
}
