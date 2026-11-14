'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bed, Bath, Maximize2, MapPin, Navigation, ArrowRight } from 'lucide-react';
import { formatBDT, cn } from '@/lib/utils';
import BoxBadge from '@/components/ui/BoxBadge';

export default function HouseCard({
  house,
  isActive = false,
  onHover,
  onLeave,
  onClick,
  showDistance = false,
  className,
}) {
  if (!house) return null;

  const coverUrl = house.cover_image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800';

  return (
    <div
      onMouseEnter={() => onHover && onHover(house)}
      onMouseLeave={() => onLeave && onLeave(house)}
      onClick={() => onClick && onClick(house)}
      className={cn(
        'group relative bg-surface border rounded-2xl overflow-hidden flex flex-col transition-all duration-200 select-none cursor-pointer',
        isActive
          ? 'border-primary ring-2 ring-primary/20 shadow-lg -translate-y-1'
          : 'border-border shadow-sm hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-lg hover:-translate-y-1',
        className
      )}
    >
      {/* Thumbnail with status badge & distance pill */}
      <div className="relative w-full h-48 bg-surface-alt overflow-hidden">
        <Image
          src={coverUrl}
          alt={house.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          {house.is_featured ? (
            <BoxBadge variant="featured" size="sm">
              Featured
            </BoxBadge>
          ) : (
            <BoxBadge variant="success" size="sm">
              {house.status === 'approved' ? 'Available' : house.status}
            </BoxBadge>
          )}

          {house.property_type_name && (
            <BoxBadge variant="neutral" size="sm">
              {house.property_type_name}
            </BoxBadge>
          )}
        </div>

        {/* Distance badge if nearby search */}
        {(showDistance || house.distance_text || house.distance_m !== undefined) && (
          <div className="absolute bottom-2.5 right-2.5 z-10 backdrop-blur-md bg-black/60 text-white rounded-full px-2.5 py-0.5 text-xs font-medium shadow-sm flex items-center gap-1">
            <Navigation className="w-3 h-3 text-emerald-400 stroke-[2]" />
            <span>{house.distance_text || `${house.distance_m}m away`}</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
        <div>
          {/* Location Area */}
          <div className="flex items-center gap-1 text-xs text-text-muted font-medium mb-1">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">{house.area_name || house.city || 'Dhaka'}</span>
          </div>

          {/* House Title */}
          <h3 className="text-sm font-semibold text-text group-hover:text-primary transition-colors line-clamp-1">
            {house.title}
          </h3>
        </div>

        {/* Features row: Beds, Baths, Sqft */}
        <div className="grid grid-cols-3 gap-1 py-2.5 border-y border-border/60 text-center text-xs font-medium text-text-muted">
          <div className="flex items-center justify-center gap-1.5">
            <Bed className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{house.bedrooms || 1} Bed</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 border-x border-border/60">
            <Bath className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{house.bathrooms || 1} Bath</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{house.size_sqft || 500} sqft</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-[11px] text-text-muted block leading-none">
              Monthly Rent
            </span>
            <span className="text-base font-bold text-text tracking-tight">
              {formatBDT(house.rent_amount)}
              <span className="text-xs font-normal text-text-muted"> / mo</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {(house.latitude || house.coordinates?.lat) && (
              <Link
                href={`/map?lat=${parseFloat(house.coordinates?.lat ?? house.latitude)}&lng=${parseFloat(house.coordinates?.lng ?? house.longitude)}&houseId=${house.id}`}
                onClick={(e) => e.stopPropagation()}
                title="View on Map"
                className="w-8 h-8 rounded-xl border border-border bg-surface-alt/60 hover:bg-[#57BA29] hover:border-[#57BA29] text-text-muted hover:text-white flex items-center justify-center transition-colors shadow-sm"
              >
                <MapPin className="w-3.5 h-3.5" />
              </Link>
            )}

            <Link href={`/houses/${house.id}`}>
              <span className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-[#57BA29]/10 text-[#57BA29] text-xs font-semibold rounded-xl group-hover:bg-[#57BA29] group-hover:text-white transition-all duration-150">
                <span>View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
