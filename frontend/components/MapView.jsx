'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import Skeleton from '@/components/ui/Skeleton';

// Dynamically import Leaflet with ssr: false
const LeafletMapInner = dynamic(
  () => import('./LeafletMapInner').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="w-full h-full min-h-[350px] border-2 border-border shadow-box" />
    ),
  }
);

export default function MapView(props) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Skeleton className="w-full h-full min-h-[350px] border-2 border-border shadow-box" />;
  }

  return (
    <LeafletMapInner
      {...props}
      isDark={resolvedTheme === 'dark'}
    />
  );
}
