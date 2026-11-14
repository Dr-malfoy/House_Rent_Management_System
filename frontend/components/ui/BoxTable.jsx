'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export default function BoxTable({ headers = [], children, className }) {
  return (
    <div
      className={cn(
        'w-full overflow-x-auto border border-border rounded-2xl shadow-sm bg-surface',
        className
      )}
      data-lenis-prevent
    >
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-alt/60 border-b border-border">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 text-sm">{children}</tbody>
      </table>
    </div>
  );
}
