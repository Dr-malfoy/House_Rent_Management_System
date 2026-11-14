'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export default function BoxButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  const variantStyles = {
    primary:
      'bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-hover shadow-sm hover:shadow-md hover:shadow-primary/20',
    secondary:
      'bg-surface text-text border border-border hover:bg-surface-alt hover:border-slate-300 dark:hover:border-zinc-700 shadow-sm',
    danger:
      'bg-danger text-white hover:opacity-90 active:opacity-100 shadow-sm',
    outline:
      'bg-transparent text-text border border-border hover:bg-surface-alt hover:border-slate-300 dark:hover:border-zinc-700',
    ghost:
      'bg-transparent text-text hover:bg-surface-alt',
    subtle:
      'bg-primary-soft text-primary hover:opacity-90 font-medium',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs font-medium rounded-lg',
    md: 'px-4 py-2 text-sm font-semibold rounded-xl',
    lg: 'px-5 py-2.5 text-base font-semibold rounded-xl',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all duration-180 select-none cursor-pointer',
        'active:scale-[0.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:shadow-none',
        variantStyles[variant] || variantStyles.primary,
        sizeStyles[size] || sizeStyles.md,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
