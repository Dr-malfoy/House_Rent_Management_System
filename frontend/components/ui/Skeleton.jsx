'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export default function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'animate-pulse bg-surface-alt border border-border-soft rounded-sm',
        className
      )}
      {...props}
    />
  );
}
