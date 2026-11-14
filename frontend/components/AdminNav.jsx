'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Building2,
  MessageSquare,
  Receipt,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminNav() {
  const pathname = usePathname();

  const links = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/nid', label: 'NID Queue', icon: ShieldCheck },
    { href: '/admin/houses', label: 'Houses', icon: Building2 },
    { href: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
    { href: '/admin/billing', label: 'Billing Audit', icon: Receipt },
  ];

  return (
    <div className="w-full bg-surface border-b border-border mb-8 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-xs font-medium text-text-muted hover:text-text flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Portal</span>
          </Link>
          <span className="text-border">•</span>
          <span className="text-xs font-semibold text-primary">
            Admin Console
          </span>
        </div>

        <nav className="flex flex-wrap items-center gap-1 bg-surface-alt/50 p-1 rounded-2xl border border-border/60">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl transition-all duration-150',
                  isActive
                    ? 'bg-surface text-primary shadow-sm font-semibold'
                    : 'text-text-muted hover:text-text hover:bg-surface/50'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
