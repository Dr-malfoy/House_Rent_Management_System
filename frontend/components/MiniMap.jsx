'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import MapView from './MapView';
import BoxButton from './ui/BoxButton';
import BoxCard from './ui/BoxCard';
import { MapPin, Eye, EyeOff, ExternalLink } from 'lucide-react';

export default function MiniMap({ houses = [] }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <BoxCard className="w-full space-y-4">
      {/* Header with Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text">
              Interactive Mini Map
            </h3>
            <p className="text-xs text-text-muted">
              Toggle map to view active property pins across Dhaka
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Toggle Control Button */}
          <BoxButton
            size="sm"
            variant={isOpen ? 'secondary' : 'primary'}
            onClick={() => setIsOpen(!isOpen)}
            className="gap-1.5 shadow-sm"
          >
            {isOpen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isOpen ? 'Hide Mini Map' : 'Show Mini Map'}</span>
          </BoxButton>

          {/* View Map Full Page Button */}
          {isOpen && (
            <Link href="/map">
              <BoxButton size="sm" variant="secondary" className="gap-1.5 shadow-sm">
                <span>Full Map</span>
                <ExternalLink className="w-3.5 h-3.5 text-text-muted" />
              </BoxButton>
            </Link>
          )}
        </div>
      </div>

      {/* Map Body */}
      {isOpen ? (
        <div className="relative w-full h-[360px] border border-border rounded-2xl overflow-hidden shadow-sm animate-in fade-in duration-200">
          <MapView
            center={[23.8103, 90.4125]}
            zoom={12}
            houses={houses}
            height="360px"
          />
        </div>
      ) : (
        <div
          onClick={() => setIsOpen(true)}
          className="w-full py-8 border border-dashed border-border rounded-2xl bg-surface-alt/40 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-surface-alt/70 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-text">
            Mini Map is currently minimized
          </p>
          <p className="text-[11px] text-text-muted">
            Click here to preview Dhaka listings geographically
          </p>
        </div>
      )}
    </BoxCard>
  );
}
