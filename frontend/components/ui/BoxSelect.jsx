'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export default function BoxSelect({
  label,
  error,
  helperText,
  options = [],
  children,
  className,
  id,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold text-text flex items-center justify-between"
        >
          <span>{label}</span>
          {props.required && <span className="text-danger font-normal ml-0.5">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full bg-surface border border-border text-text px-3.5 py-2.5 rounded-xl text-sm font-normal outline-none transition-all duration-150 cursor-pointer shadow-sm',
          'focus:border-primary focus:ring-2 focus:ring-primary/20',
          'disabled:bg-surface-alt disabled:opacity-60 disabled:cursor-not-allowed',
          error && 'border-danger focus:border-danger',
          className
        )}
        {...props}
      >
        {children ||
          options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val} className="bg-surface text-text">
                {lbl}
              </option>
            );
          })}
      </select>
      {error && <p className="text-xs font-medium text-danger">{error}</p>}
      {helperText && !error && <p className="text-xs text-text-muted">{helperText}</p>}
    </div>
  );
}
