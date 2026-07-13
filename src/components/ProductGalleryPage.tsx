import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ElegantLayout } from './elegant/ElegantLayout';
import { galleryCategories, galleryProducts } from '../data/productGallery';
import { siteDetails } from '../data/siteDetails';
import { createWhatsappLink } from '../utils/contact';
import './product-gallery.css';

type CategoryFilter = 'all' | (typeof galleryCategories)[number]['id'];

export function ProductGalleryPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const categoryLabelById = useMemo(() => {
    return galleryCategories.reduce<Record<string, string>>((acc, category) => {
      acc[category.id] = category.label;
      return acc;
    }, {});
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') {
      return galleryProducts;
    }
    return galleryProducts.filter((product) => product.category === activeCategory);
  }, [activeCategory]);

  const activeProduct = useMemo(() => {
    if (!activeProductId) {
      return null;
    }
    return galleryProducts.find((product) => product.id === activeProductId) ?? null;
  }, [activeProductId]);

  useEffect(() => {
    if (!activeProduct) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveProductId(null);
        return;
      }

      if (event.key === 'ArrowLeft') {
        setActiveImageIndex((current) =>
          current === 0 ? activeProduct.photos.length - 1 : current - 1
        );
      }

      if (event.key === 'ArrowRight') {
        setActiveImageIndex((current) => (current + 1) % activeProduct.photos.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProduct]);

  useEffect(() => {
    if (activeProduct) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
    return undefined;
  }, [activeProduct]);

  const openProductViewer = (productId: string) => {
    setActiveProductId(productId);
    setActiveImageIndex(0);
  };

  const closeProductViewer = () => {
    setActiveProductId(null);
    setActiveImageIndex(0);
  };

  const showPreviousPhoto = () => {
    if (!activeProduct) {
      return;
    }
    setActiveImageIndex((current) =>
      current === 0 ? activeProduct.photos.length - 1 : current - 1
    );
  };

  const showNextPhoto = () => {
    if (!activeProduct) {
      return;
    }
    setActiveImageIndex((current) => (current + 1) % activeProduct.photos.length);
  };

  return (
    <ElegantLayout>
    <div className="product-gallery-page">
      <div className="product-gallery-topline" />
      <main className="product-gallery-shell">
        <div className="product-gallery-header">
          <a href="/" className="product-gallery-back-link">
            Back to Home
          </a>
          <a href={siteDetails.whatsappHref} className="product-gallery-whatsapp">
            Enquire on WhatsApp
          </a>
        </div>

        <div className="product-gallery-title-wrap">
          <span className="product-gallery-kicker">Design Gallery</span>
          <h1 className="product-gallery-title">Explore AlterCraft Design Directions</h1>
          <p className="product-gallery-subtitle">
            These AI-assisted concept visualizations communicate style and material direction.
            Final sizes, finishes and execution are confirmed after site measurement.
          </p>
        </div>

        <div className="product-gallery-filter-row">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`product-gallery-filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
          >
            All Products
          </button>
          {galleryCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className={`product-gallery-filter-btn ${
                activeCategory === category.id ? 'active' : ''
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <section className="product-gallery-grid">
          {filteredProducts.map((product) => (
            <article key={product.id} className="product-gallery-card">
              <div className="product-gallery-cover">
                <ImageWithFallback src={product.photos[0].src} alt={product.name} />
                <span className="product-gallery-angle-chip">Concept visual</span>
              </div>

              <div className="product-gallery-card-body">
                <p className="product-gallery-card-category">{categoryLabelById[product.category]}</p>
                <h2 className="product-gallery-card-title">{product.name}</h2>
                <p className="product-gallery-card-copy">{product.shortDescription}</p>

                <div className="product-gallery-card-meta">
                  <p className="product-gallery-meta-item">
                    Material: <strong>{product.material}</strong>
                  </p>
                  <p className="product-gallery-meta-item">
                    Size: <strong>{product.dimensions}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openProductViewer(product.id)}
                  className="product-gallery-view-btn"
                >
                  View Design
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>

      {activeProduct && (
        <div className="product-gallery-modal-backdrop" onClick={closeProductViewer}>
          <div className="product-gallery-modal" onClick={(event) => event.stopPropagation()}>
            <div className="product-gallery-modal-stage">
              <ImageWithFallback
                src={activeProduct.photos[activeImageIndex].src}
                alt={`${activeProduct.name} ${activeProduct.photos[activeImageIndex].label}`}
              />
              <span className="product-gallery-modal-angle">
                {activeProduct.photos[activeImageIndex].label}
              </span>
              {activeProduct.photos.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={showPreviousPhoto}
                    className="product-gallery-modal-nav prev"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={showNextPhoto}
                    className="product-gallery-modal-nav next"
                    aria-label="Next photo"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              ) : null}
            </div>

            <div className="product-gallery-modal-panel">
              <button
                type="button"
                onClick={closeProductViewer}
                className="product-gallery-close-btn"
                aria-label="Close viewer"
              >
                <X size={16} />
              </button>
              <p className="product-gallery-panel-category">
                {categoryLabelById[activeProduct.category]}
              </p>
              <h2 className="product-gallery-panel-title">{activeProduct.name}</h2>
              <p className="product-gallery-panel-copy">{activeProduct.shortDescription}</p>

              <div className="product-gallery-spec-list">
                <div className="product-gallery-spec-item">
                  <span className="product-gallery-spec-label">Material</span>
                  <span className="product-gallery-spec-value">{activeProduct.material}</span>
                </div>
                <div className="product-gallery-spec-item">
                  <span className="product-gallery-spec-label">Dimensions</span>
                  <span className="product-gallery-spec-value">{activeProduct.dimensions}</span>
                </div>
                <div className="product-gallery-spec-item">
                  <span className="product-gallery-spec-label">Finish</span>
                  <span className="product-gallery-spec-value">{activeProduct.finish}</span>
                </div>
              </div>

              <div className="product-gallery-thumb-row">
                {activeProduct.photos.map((photo, index) => (
                  <button
                    key={`${activeProduct.id}-${photo.label}`}
                    type="button"
                    className={`product-gallery-thumb-btn ${index === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(index)}
                    aria-label={`View ${photo.label}`}
                  >
                    <ImageWithFallback src={photo.src} alt={`${activeProduct.name} ${photo.label}`} />
                  </button>
                ))}
              </div>

              <a
                href={createWhatsappLink(`Hi AlterCraft, I want details for ${activeProduct.name}.`)}
                className="product-gallery-modal-whatsapp"
              >
                Enquire This Product
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
    </ElegantLayout>
  );
}
