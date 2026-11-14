'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export default function BoxCard({
  children,
  className,
  hoverEffect = false,
  variant = 'surface',
  ...props
}) {
  const bgStyles = {
    surface: 'bg-surface border border-border shadow-sm',
    alt: 'bg-surface-alt border border-border/80 shadow-sm',
    primarySoft: 'bg-primary-soft border border-primary/20',
    flat: 'bg-surface border border-border',
  };

  return (
    <div
      className={cn(
        'rounded-2xl p-5 sm:p-6 transition-all duration-200',
        bgStyles[variant] || bgStyles.surface,
        hoverEffect &&
          'hover:-translate-y-1 hover:shadow-lg hover:border-slate-300 dark:hover:border-zinc-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
