'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Calendar,
  Building2,
  Search,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Bed,
  Bath,
  Maximize2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { formatBDT } from '@/lib/utils';

export default function HeroCleanRental({ featuredHouses = [], allHouses = [] }) {
  const router = useRouter();

  // Search Bar States
  const [location, setLocation] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [propertyType, setPropertyType] = useState('');

  // Promoted Houses List (Admin Controlled via is_featured)
  const displayHouses =
    featuredHouses && featuredHouses.length > 0
      ? featuredHouses
      : allHouses && allHouses.length > 0
      ? allHouses.slice(0, 5)
      : [
          {
            id: 1,
            title: 'Lakeview Luxury 3BHK Flat in Uttara Sector 3',
            area_name: 'Uttara Sector 3',
            city: 'Dhaka',
            rent_amount: 36000,
            bedrooms: 3,
            bathrooms: 2,
            size_sqft: 1450,
            cover_image:
              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
            property_type_name: 'Apartment',
          },
        ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-cycle through promoted houses every 6 seconds unless hovered
  useEffect(() => {
    if (displayHouses.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayHouses.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [displayHouses.length, isHovered]);

  const currentHouse = displayHouses[currentIndex] || displayHouses[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayHouses.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayHouses.length) % displayHouses.length);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set('area', location.trim());
    if (propertyType) params.set('property_type_id', propertyType);
    router.push(`/houses?${params.toString()}`);
  };

  return (
    <div className="w-full relative pt-4 sm:pt-6 pb-12 lg:pb-16 overflow-hidden">
      {/* Background Soft Glow matching #57BA29 */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#57BA29]/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-10 w-80 h-80 bg-[#57BA29]/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* 1. Hero Showcase: Directly Displays the Paid / Promoted House with pic and middle card */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative w-full h-[480px] sm:h-[520px] lg:h-[560px] rounded-3xl overflow-hidden shadow-2xl border border-border group bg-[#181D12]"
        >
          {/* House Picture (Full Cover Background) */}
          <Image
            src={
              currentHouse?.cover_image ||
              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200'
            }
            alt={currentHouse?.title || 'Promoted House'}
            fill
            priority
            className="object-cover transition-transform duration-1000 group-hover:scale-105 brightness-[0.92] dark:brightness-[0.85]"
          />

          {/* Light gradient overlay to preserve picture clarity */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/30 pointer-events-none" />

          {/* Top Header Badge: Paid Promotion (Admin Controlled) */}
          <div className="absolute top-5 left-5 sm:top-6 sm:left-6 z-20 flex flex-wrap items-center gap-2">
            <span className="bg-[#57BA29] text-white text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-[#57BA29]/30">
              <Sparkles className="w-3.5 h-3.5 fill-white" />
              <span>Paid Promotion • Promoted House</span>
            </span>

            {currentHouse?.property_type_name && (
              <span className="bg-black/40 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/25">
                {currentHouse.property_type_name}
              </span>
            )}
          </div>

          {/* Top Right: House Counter (e.g. 1 / 5 Promoted) */}
          {displayHouses.length > 1 && (
            <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-20">
              <span className="bg-black/50 backdrop-blur-sm text-white text-xs font-mono font-bold px-3 py-1.5 rounded-full border border-white/25">
                {currentIndex + 1} / {displayHouses.length}
              </span>
            </div>
          )}

          {/* Left / Right Carousel Navigation Controls */}
          {displayHouses.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/45 hover:bg-[#57BA29] text-white backdrop-blur-sm border border-white/25 flex items-center justify-center transition-all cursor-pointer shadow-xl hover:scale-110 active:scale-95"
                title="Previous Promoted House"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/45 hover:bg-[#57BA29] text-white backdrop-blur-sm border border-white/25 flex items-center justify-center transition-all cursor-pointer shadow-xl hover:scale-110 active:scale-95"
                title="Next Promoted House"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* MIDDLE: Transparent Card with House Name, Price, Location, and Book Button (Background pic clearly visible) */}
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <div className="pointer-events-auto max-w-2xl w-full bg-black/30 dark:bg-black/40 backdrop-blur-[2px] rounded-3xl p-6 sm:p-8 border border-white/25 shadow-[0_20px_50px_rgba(0,0,0,0.35)] text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
              
              {/* Location */}
              <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white/95 bg-black/40 backdrop-blur-sm border border-white/25 px-4 py-1.5 rounded-full mx-auto shadow-sm">
                <MapPin className="w-4 h-4 text-[#57BA29]" />
                <span className="truncate max-w-xs sm:max-w-md">
                  {currentHouse?.area_name || currentHouse?.address_text || 'Dhaka'}, {currentHouse?.city || 'Dhaka'}
                </span>
              </div>

              {/* House Name */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight line-clamp-2 leading-snug drop-shadow-md">
                {currentHouse?.title}
              </h1>

              {/* Price */}
              <div className="flex items-baseline justify-center gap-2 pt-0.5">
                <span className="text-3xl sm:text-4xl font-black text-[#57BA29] drop-shadow-sm">
                  {formatBDT(currentHouse?.rent_amount || 0)}
                </span>
                <span className="text-sm sm:text-base font-semibold text-white/90">/ month</span>
              </div>

              {/* Property Specs Pill Strip */}
              <div className="flex items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-white/95 font-medium pt-2 border-t border-white/20">
                {currentHouse?.bedrooms && (
                  <span className="flex items-center gap-1.5">
                    <Bed className="w-4 h-4 text-[#57BA29]" />
                    <span>{currentHouse.bedrooms} Bedrooms</span>
                  </span>
                )}
                {currentHouse?.bathrooms && (
                  <span className="flex items-center gap-1.5">
                    <Bath className="w-4 h-4 text-[#57BA29]" />
                    <span>{currentHouse.bathrooms} Baths</span>
                  </span>
                )}
                {currentHouse?.size_sqft && (
                  <span className="flex items-center gap-1.5">
                    <Maximize2 className="w-4 h-4 text-[#57BA29]" />
                    <span>{currentHouse.size_sqft} sqft</span>
                  </span>
                )}
              </div>

              {/* Book Button & View Details Button */}
              <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
                <Link href={`/book/${currentHouse?.id}`}>
                  <button
                    type="button"
                    className="bg-[#57BA29] hover:bg-[#479E1F] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-[#57BA29]/35 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm sm:text-base cursor-pointer flex items-center gap-2"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </Link>

                <Link href={`/houses/${currentHouse?.id}`}>
                  <button
                    type="button"
                    className="bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm border border-white/25 px-6 py-3.5 rounded-xl font-semibold shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm sm:text-base cursor-pointer"
                  >
                    View Details
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Slide Indicators */}
          {displayHouses.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {displayHouses.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentIndex
                      ? 'w-8 bg-[#57BA29]'
                      : 'w-2 bg-white/50 hover:bg-white'
                  }`}
                  title={`Go to house ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* 2. Floating Search Bar below Hero (Location, Move-in Date, House Type, Search Houses) */}
        <div className="relative z-20">
          <form
            onSubmit={handleSearch}
            className="w-full bg-white dark:bg-[#181D12] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-border/80 p-5 sm:p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              {/* Field 1: Location */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-text-muted">
                  <MapPin className="w-3.5 h-3.5 text-[#57BA29]" />
                  <span>Location</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter city or address"
                  className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/80 rounded-xl px-4 py-2.5 text-sm text-text outline-none focus:border-[#57BA29] focus:ring-2 focus:ring-[#57BA29]/20 transition-all placeholder:text-text-muted/60"
                />
              </div>

              {/* Field 2: Move-in Date */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-text-muted">
                  <Calendar className="w-3.5 h-3.5 text-[#57BA29]" />
                  <span>Move-in Date</span>
                </label>
                <input
                  type="date"
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/80 rounded-xl px-4 py-2.5 text-sm text-text outline-none focus:border-[#57BA29] focus:ring-2 focus:ring-[#57BA29]/20 transition-all cursor-pointer"
                />
              </div>

              {/* Field 3: House Type */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-text-muted">
                  <Building2 className="w-3.5 h-3.5 text-[#57BA29]" />
                  <span>House Type</span>
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/80 rounded-xl px-4 py-2.5 text-sm text-text outline-none focus:border-[#57BA29] focus:ring-2 focus:ring-[#57BA29]/20 transition-all cursor-pointer"
                >
                  <option value="">Select type</option>
                  <option value="1">Apartment</option>
                  <option value="2">Family Flat</option>
                  <option value="3">Bachelor Flat</option>
                  <option value="4">Studio Apartment</option>
                  <option value="5">Sublet / Single Room</option>
                  <option value="6">Duplex House</option>
                </select>
              </div>

              {/* Field 4: Search Button */}
              <div>
                <button
                  type="submit"
                  className="w-full bg-[#57BA29] hover:bg-[#479E1F] text-white font-semibold rounded-xl h-[44px] shadow-md shadow-[#57BA29]/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Houses</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
