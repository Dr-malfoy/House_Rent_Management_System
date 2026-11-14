'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export default function BoxInput({
  label,
  error,
  helperText,
  className,
  id,
  type = 'text',
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-text flex items-center justify-between"
        >
          <span>{label}</span>
          {props.required && <span className="text-danger font-normal ml-0.5">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={cn(
          'w-full bg-surface border border-border text-text px-3.5 py-2.5 rounded-xl text-sm font-normal outline-none transition-all duration-150',
          'placeholder:text-text-muted/60',
          'focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm',
          'disabled:bg-surface-alt disabled:opacity-60 disabled:cursor-not-allowed',
          error && 'border-danger focus:border-danger focus:ring-danger/20',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs font-medium text-danger">{error}</p>}
      {helperText && !error && <p className="text-xs text-text-muted">{helperText}</p>}
    </div>
  );
}
