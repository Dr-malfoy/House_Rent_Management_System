'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { formatBDT } from '@/lib/utils';
import BoxButton from '@/components/ui/BoxButton';
import BoxBadge from '@/components/ui/BoxBadge';
import Skeleton from '@/components/ui/Skeleton';
import { ChevronLeft, ChevronRight, MapPin, Sparkles, Bed, Bath, Maximize2, ArrowRight } from 'lucide-react';

export default function FeaturedSlider({ houses = [], isLoading = false }) {
  const router = useRouter();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);

  // Auto-scroll every ~4 seconds unless paused or user prefers reduced motion
  useEffect(() => {
    if (!houses || houses.length <= 1 || isPaused) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % houses.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [houses, isPaused]);

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Skeleton className="w-full h-[460px] md:h-[500px] rounded-3xl" />
      </div>
    );
  }

  if (!houses || houses.length === 0) {
    return null;
  }

  const currentHouse = houses[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + houses.length) % houses.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % houses.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) handleNext();
    if (diff < -50) handlePrev();
  };

  const handleBookClick = () => {
    if (!user) {
      router.push(`/login?redirect=/book/${currentHouse.id}`);
    } else {
      router.push(`/book/${currentHouse.id}`);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div
        className="relative w-full h-[460px] md:h-[500px] border border-border/60 rounded-3xl overflow-hidden shadow-2xl bg-zinc-950 select-none group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slide Background Images */}
        {houses.map((house, idx) => (
          <div
            key={house.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <Image
              src={house.cover_image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200'}
              alt={house.title}
              fill
              priority={idx === 0}
              className="object-cover"
            />
            {/* Cinematic Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />
          </div>
        ))}

        {/* Top Badges */}
        <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
          <div className="backdrop-blur-md bg-emerald-500/90 text-white rounded-full px-3 py-1 text-xs font-semibold shadow-sm flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            <span>Featured Spotlight</span>
          </div>
          <div className="backdrop-blur-md bg-white/20 text-white rounded-full px-3 py-1 text-xs font-medium border border-white/20">
            {currentHouse.property_type_name || 'Apartment'}
          </div>
        </div>

        {/* Centered House Name & Information Box */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6 max-w-3xl mx-auto">
          {/* Location Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/15 border border-white/20 rounded-full text-xs font-medium text-white mb-4 backdrop-blur-md">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>{currentHouse.address_text || currentHouse.area_name}</span>
          </div>

          {/* House Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight drop-shadow-sm mb-4">
            {currentHouse.title}
          </h1>

          {/* Quick specs pill */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm font-medium text-zinc-200 mb-8 bg-white/10 border border-white/15 px-4 sm:px-6 py-2 rounded-2xl backdrop-blur-md">
            <span className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-emerald-400" /> {currentHouse.bedrooms || 3} Beds
            </span>
            <span className="text-white/40">•</span>
            <span className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-emerald-400" /> {currentHouse.bathrooms || 3} Baths
            </span>
            <span className="text-white/40">•</span>
            <span className="flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-emerald-400" /> {currentHouse.size_sqft || 1500} sqft
            </span>
            <span className="text-white/40">•</span>
            <span className="text-emerald-400 font-bold text-base">
              {formatBDT(currentHouse.rent_amount)} <span className="text-xs font-normal text-zinc-300">/ mo</span>
            </span>
          </div>

          {/* Action Buttons: Book & View Details */}
          <div className="flex items-center gap-3">
            <BoxButton
              size="lg"
              variant="primary"
              onClick={handleBookClick}
              className="px-8 shadow-lg shadow-emerald-600/30 font-semibold"
            >
              Book Now
            </BoxButton>

            <Link href={`/houses/${currentHouse.id}`}>
              <BoxButton
                size="lg"
                variant="secondary"
                className="bg-white/15 hover:bg-white/25 text-white border-white/20 backdrop-blur-md font-semibold"
              >
                <span>View Details</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </BoxButton>
            </Link>
          </div>
        </div>

        {/* Carousel Arrow Controls */}
        <button
          onClick={handlePrev}
          aria-label="Previous slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 bg-white/15 hover:bg-white text-white hover:text-zinc-900 border border-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-150 shadow-lg"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        <button
          onClick={handleNext}
          aria-label="Next slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 bg-white/15 hover:bg-white text-white hover:text-zinc-900 border border-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-150 shadow-lg"
        >
          <ChevronRight className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Carousel Indicator Dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/15 backdrop-blur-md">
          {houses.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 transition-all rounded-full ${
                i === currentIndex ? 'w-6 bg-emerald-400' : 'w-2 bg-white/40 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
