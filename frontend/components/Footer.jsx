'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, Phone, Mail, MessageCircle, MapPin, ShieldCheck, ArrowUpRight } from 'lucide-react';
import BoxBadge from '@/components/ui/BoxBadge';

export default function Footer() {
  return (
    <footer className="w-full bg-surface border-t border-border mt-20 text-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: About & Project Info */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-primary text-white rounded-xl flex items-center justify-center font-bold shadow-sm">
                <Building2 className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-base font-bold tracking-tight text-text leading-tight">
                Smart<span className="text-primary">Rent</span>
              </span>
            </Link>
            <p className="text-xs text-text-muted leading-relaxed">
              Replacing vague text addresses with precision GPS spatial storage and sub-second 500m / 1000m radius proximity search across Dhaka.
            </p>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <BoxBadge size="sm" variant="success">
                <ShieldCheck className="w-3 h-3" /> NID Verified
              </BoxBadge>
              <BoxBadge size="sm" variant="neutral">
                SRID 4326 GIS
              </BoxBadge>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs font-medium text-text-muted">
              <li>
                <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  Home (Landing)
                </Link>
              </li>
              <li>
                <Link href="/houses" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  Houses Catalog
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  Full Radius Map
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  Split-Screen Search
                </Link>
              </li>
              <li>
                <Link href="/post" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  Post a Property
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Direct Connect */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text">
              Direct Contact
            </h4>
            <ul className="space-y-2.5 text-xs text-text-muted font-medium">
              <li>
                <a
                  href="https://wa.me/8801700000001?text=Hello%20Smart%20House%20Rent%20Support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-500" />
                  <span>WhatsApp: +880 1700-000001</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+8801700000001"
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4 text-text-muted" />
                  <span>Call: +880 1700-000001</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@smarthouse.com"
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4 text-text-muted" />
                  <span>support@smarthouse.com</span>
                </a>
              </li>
              <li className="flex items-center gap-2 pt-1 text-[11px]">
                <MapPin className="w-4 h-4 text-text-muted shrink-0" />
                <span>Uttara, Dhaka - 1230, Bangladesh</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Academic Credits */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text">
              Academic Project
            </h4>
            <div className="p-4 border border-border rounded-2xl bg-surface-alt/40 space-y-1.5 shadow-sm">
              <p className="text-xs font-semibold text-text">Uttara University</p>
              <p className="text-[11px] text-text-muted">
                Department of Computer Science & Engineering (CSE)
              </p>
              <p className="text-[10px] font-medium text-primary">
                Course: CSE0613310 Software Engineering
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-2">
          <p>© {new Date().getFullYear()} Smart House Rent Management System. All rights reserved.</p>
          <p className="text-[11px] font-medium">
            Smart Living · Sub-Second Dhaka Geocoding & Radius Filtering
          </p>
        </div>
      </div>
    </footer>
  );
}
