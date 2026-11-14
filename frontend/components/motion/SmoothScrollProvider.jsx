'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

export default function SmoothScrollProvider({ children }) {
  const pathname = usePathname();
  const lenisRef = useRef(null);

  useEffect(() => {
    // Check user's prefers-reduced-motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      prevent: (node) => {
        // Prevent Lenis on map container so mouse wheel zooms the map directly
        return Boolean(
          node?.closest?.('[data-lenis-prevent]') ||
          node?.closest?.('.leaflet-container') ||
          node?.closest?.('.leaflet-pane')
        );
      },
    });
    lenisRef.current = lenis;

    // Immediately stop Lenis if on /map page
    if (pathname === '/map') {
      lenis.stop();
    }

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [pathname]);

  // Handle route changes
  useEffect(() => {
    if (!lenisRef.current) return;
    if (pathname === '/map') {
      lenisRef.current.stop();
    } else {
      lenisRef.current.start();
    }
  }, [pathname]);

  return <>{children}</>;
}
