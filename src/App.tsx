import React, { Suspense, useEffect, useRef } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { CreativeMotion } from './components/visual/CreativeMotion';
import { AuthProvider } from './contexts/AuthContext';

const resetPageTop = () => {
  const root = document.documentElement;
  const body = document.body;
  const rootScrollBehavior = root.style.scrollBehavior;
  const bodyScrollBehavior = body.style.scrollBehavior;

  root.style.scrollBehavior = 'auto';
  body.style.scrollBehavior = 'auto';
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  root.scrollTop = 0;
  body.scrollTop = 0;

  root.style.scrollBehavior = rootScrollBehavior;
  body.style.scrollBehavior = bodyScrollBehavior;
};

const schedulePageTopReset = () => {
  document.documentElement.classList.add('route-scroll-resetting');
  resetPageTop();
  const frame = window.requestAnimationFrame(resetPageTop);

  const settleTimer = window.setTimeout(() => {
    document.documentElement.classList.remove('route-scroll-resetting');
  }, 120);

  return () => {
    window.cancelAnimationFrame(frame);
    window.clearTimeout(settleTimer);
    document.documentElement.classList.remove('route-scroll-resetting');
  };
};

export default function App() {
  const lastRouteKey = useRef(`${router.state.location.pathname}${router.state.location.search}`);
  const cleanupScrollReset = useRef<null | (() => void)>(null);

  useEffect(() => {
    const capacitor = (window as typeof window & {
      Capacitor?: { isNativePlatform?: () => boolean };
    }).Capacitor;

    if (window.location.pathname === '/' && capacitor?.isNativePlatform?.()) {
      router.navigate('/contractor-desk', { replace: true });
    }

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    cleanupScrollReset.current = schedulePageTopReset();

    const unsubscribe = router.subscribe((state) => {
      const nextRouteKey = `${state.location.pathname}${state.location.search}`;
      if (nextRouteKey === lastRouteKey.current) return;

      lastRouteKey.current = nextRouteKey;
      cleanupScrollReset.current?.();
      cleanupScrollReset.current = schedulePageTopReset();
    });

    return () => {
      unsubscribe();
      cleanupScrollReset.current?.();
    };
  }, []);

  return (
    <AuthProvider>
      <CreativeMotion />
      <Suspense fallback={<div className="route-loading">Loading AlterCraft...</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </AuthProvider>
  );
}
