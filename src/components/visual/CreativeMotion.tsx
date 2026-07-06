import { useEffect, useRef } from 'react';

const REVEAL_SELECTOR = [
  '.home-section > .home-container',
  '.home-ai-final-cta > .home-container',
  '.home-offer-card',
  '.home-feature-card',
  '.home-portfolio-grid article',
  '.home-category-card',
  '.home-blog-card',
  '.elegant-section .elegant-container',
  '.elegant-card',
  '.elegant-product-card',
  '.product-gallery-card',
  '.planner-section .elegant-container',
  '.planner-step-card',
  '.planner-type-card',
  '.planner-service-card',
  '.planner-concept-card',
  '.planner-summary-card',
  '.planner-side-card',
  '.hero-poster-copy',
  '.hero-poster-panel',
  '.spatial-studio-copy',
  '.spatial-stage',
  '.canva-showcase-copy',
  '.canva-visual-stage',
].join(',');

const MAGNETIC_SELECTOR = [
  '.home-button',
  '.elegant-button',
  '.elegant-button-secondary',
  '.hero-poster-primary',
  '.hero-poster-secondary',
  '.planner-cta',
  '.home-card-link',
  '.home-inline-link',
  '.planner-card-actions a',
  '.planner-card-actions button',
  '.spatial-control-row button',
  '.spatial-hotspot-layer button',
  '.canva-direction-tabs button',
].join(',');

export function CreativeMotion() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const desktopViewport = window.matchMedia('(min-width: 1024px)').matches;
    const navigatorWithMemory = navigator as Navigator & { deviceMemory?: number };
    const capableDevice =
      (navigator.hardwareConcurrency ?? 4) >= 4 && (navigatorWithMemory.deviceMemory ?? 4) >= 4;
    const enableCursor = finePointer && desktopViewport && capableDevice && !reduceMotion;
    const enableMagnetic = enableCursor;

    document.body.classList.add('ac-motion-ready');
    if (enableCursor) {
      document.body.classList.add('ac-has-cursor');
    }

    const dot = dotRef.current;
    const ring = ringRef.current;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let cursorFrame = 0;
    let scrollFrame = 0;
    let scanFrame = 0;

    const updateCursor = () => {
      if (!dot || !ring || !enableCursor) return;
      dot.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
      ring.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
      cursorFrame = 0;
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (cursorFrame || !enableCursor) return;
      cursorFrame = window.requestAnimationFrame(updateCursor);
    };

    const handlePointerDown = () => document.body.classList.add('ac-cursor-pressed');
    const handlePointerUp = () => document.body.classList.remove('ac-cursor-pressed');

    const updateScrollState = () => {
      const scrollMax = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const ratio = Math.min(window.scrollY / scrollMax, 1);
      if (scrollRef.current) {
        scrollRef.current.style.transform = `scaleY(${ratio})`;
      }
      scrollFrame = 0;
    };
    const requestScrollState = () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(updateScrollState);
    };

    if (enableCursor) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      window.addEventListener('pointerdown', handlePointerDown, { passive: true });
      window.addEventListener('pointerup', handlePointerUp, { passive: true });
    }
    window.addEventListener('scroll', requestScrollState, { passive: true });
    window.addEventListener('resize', requestScrollState, { passive: true });
    updateScrollState();
    updateCursor();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('ac-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      // threshold 0 so any pixel entering triggers the reveal (tall sections
      // could never reach a higher ratio and would stay hidden).
      { threshold: 0, rootMargin: '0px 0px 10% 0px' }
    );

    // Backstop: never let a container stay invisible. On scroll/resize (and once
    // now) reveal anything within reach of the viewport, in case the observer
    // misses an element. Keeps the animation for the normal case.
    let revealSweepFrame = 0;
    const revealInView = () => {
      revealSweepFrame = 0;
      const limit = window.innerHeight * 1.15;
      document.querySelectorAll<HTMLElement>('.ac-reveal:not(.ac-revealed)').forEach((item) => {
        if (item.getBoundingClientRect().top < limit) {
          item.classList.add('ac-revealed');
          observer.unobserve(item);
        }
      });
    };
    const requestRevealSweep = () => {
      if (revealSweepFrame) return;
      revealSweepFrame = window.requestAnimationFrame(revealInView);
    };
    window.addEventListener('scroll', requestRevealSweep, { passive: true });
    window.addEventListener('resize', requestRevealSweep, { passive: true });

    const revealedItems = new WeakSet<HTMLElement>();
    const magneticCleanups = new Map<HTMLElement, () => void>();
    const motionRoot = document.getElementById('root') ?? document.body;

    const attachMagnetic = (item: HTMLElement) => {
      if (magneticCleanups.has(item)) return;
      if (!enableMagnetic) return;
      let magneticFrame = 0;
      let nextX = 0;
      let nextY = 0;
      const move = (event: PointerEvent) => {
        if (!enableMagnetic) return;
        const rect = item.getBoundingClientRect();
        nextX = (event.clientX - rect.left - rect.width / 2) * 0.1;
        nextY = (event.clientY - rect.top - rect.height / 2) * 0.1;
        if (magneticFrame) return;
        magneticFrame = window.requestAnimationFrame(() => {
          item.style.setProperty('--ac-magnet-x', `${nextX}px`);
          item.style.setProperty('--ac-magnet-y', `${nextY}px`);
          magneticFrame = 0;
        });
      };
      const leave = () => {
        if (magneticFrame) {
          window.cancelAnimationFrame(magneticFrame);
          magneticFrame = 0;
        }
        item.style.setProperty('--ac-magnet-x', '0px');
        item.style.setProperty('--ac-magnet-y', '0px');
      };
      item.addEventListener('pointermove', move);
      item.addEventListener('pointerleave', leave);
      magneticCleanups.set(item, () => {
        item.removeEventListener('pointermove', move);
        item.removeEventListener('pointerleave', leave);
      });
    };

    const scanMotionTargets = () => {
      Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)).forEach((item, index) => {
        if (revealedItems.has(item)) return;
        revealedItems.add(item);
        item.classList.add('ac-reveal');
        item.style.setProperty('--ac-reveal-delay', `${Math.min(index % 8, 7) * 55}ms`);
        observer.observe(item);
      });

      if (enableMagnetic) {
        Array.from(document.querySelectorAll<HTMLElement>(MAGNETIC_SELECTOR)).forEach(attachMagnetic);
      }
    };

    scanMotionTargets();
    revealInView();

    const mutationObserver = new MutationObserver((mutations) => {
      const hasMotionCandidate = mutations.some((mutation) =>
        Array.from(mutation.addedNodes).some((node) => {
          if (!(node instanceof HTMLElement)) return false;
          return (
            node.matches(REVEAL_SELECTOR) ||
            node.querySelector(REVEAL_SELECTOR) ||
            (enableMagnetic &&
              (node.matches(MAGNETIC_SELECTOR) || node.querySelector(MAGNETIC_SELECTOR)))
          );
        })
      );

      if (!hasMotionCandidate) return;
      if (scanFrame) return;
      scanFrame = window.requestAnimationFrame(() => {
        scanMotionTargets();
        scanFrame = 0;
      });
    });

    mutationObserver.observe(motionRoot, {
      childList: true,
      subtree: true,
    });

    return () => {
      document.body.classList.remove('ac-motion-ready', 'ac-has-cursor', 'ac-cursor-pressed');
      window.cancelAnimationFrame(cursorFrame);
      window.cancelAnimationFrame(scrollFrame);
      window.cancelAnimationFrame(scanFrame);
      window.cancelAnimationFrame(revealSweepFrame);
      window.removeEventListener('scroll', requestRevealSweep);
      window.removeEventListener('resize', requestRevealSweep);
      if (enableCursor) {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerdown', handlePointerDown);
        window.removeEventListener('pointerup', handlePointerUp);
      }
      window.removeEventListener('scroll', requestScrollState);
      window.removeEventListener('resize', requestScrollState);
      observer.disconnect();
      mutationObserver.disconnect();
      magneticCleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return (
    <>
      <div className="ac-light-field" aria-hidden="true" />
      <div className="ac-gold-ribbon" aria-hidden="true" />
      <div className="ac-atelier-frame" aria-hidden="true" />
      <div className="ac-scroll-rail" aria-hidden="true">
        <span ref={scrollRef} />
      </div>
      <div className="ac-cursor-dot" ref={dotRef} aria-hidden="true" />
      <div className="ac-cursor-ring" ref={ringRef} aria-hidden="true" />
    </>
  );
}
