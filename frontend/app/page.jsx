'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import HeroCleanRental from '@/components/HeroCleanRental';
import HouseCard from '@/components/HouseCard';
import MiniMap from '@/components/MiniMap';
import BoxButton from '@/components/ui/BoxButton';
import BoxCard from '@/components/ui/BoxCard';
import Skeleton from '@/components/ui/Skeleton';
import { FadeInStagger, FadeInItem } from '@/components/motion/FadeInStagger';
import { api } from '@/lib/api';
import { Building2, Search, MapPin, ArrowRight, ShieldCheck, Navigation, Compass } from 'lucide-react';

export default function HomePage() {
  const [featuredHouses, setFeaturedHouses] = useState([]);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [featRes, housesRes] = await Promise.all([
          api.get('/houses/featured'),
          api.get('/houses?limit=12'),
        ]);

        if (featRes?.success) setFeaturedHouses(featRes.data || []);
        if (housesRes?.success) setHouses(housesRes.data?.houses || []);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="w-full space-y-16 pb-20">
      {/* 1. Hero Section: Paid Promotion House Showcase with pic, middle name, price, location & book button */}
      <HeroCleanRental featuredHouses={featuredHouses} allHouses={houses} />

      {/* 2. Available Verified Houses Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text tracking-tight flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-[#57BA29]" />
              <span>Available Verified Houses</span>
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              Verified rental listings across Uttara, Mirpur, Dhanmondi, Gulshan & Banani
            </p>
          </div>

          <Link href="/houses" className="hidden sm:inline-block">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#57BA29] bg-[#E6F5DD] dark:bg-[#1E3314] rounded-xl hover:opacity-90 transition-opacity"
            >
              <span>View All Houses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>

        {/* Vertically scrolling container with data-lenis-prevent */}
        <div
          className="relative max-h-[760px] overflow-y-auto pr-2 border border-border rounded-3xl p-4 sm:p-6 bg-surface/50 shadow-sm"
          data-lenis-prevent
        >
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-2xl" />
              ))}
            </div>
          ) : houses.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Building2 className="w-12 h-12 text-text-muted mx-auto" />
              <p className="text-sm font-medium text-text-muted">No listings available at the moment.</p>
            </div>
          ) : (
            <FadeInStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {houses.map((house) => (
                <FadeInItem key={house.id}>
                  <HouseCard house={house} />
                </FadeInItem>
              ))}
            </FadeInStagger>
          )}
        </div>

        {/* View More Button below House Section */}
        <div className="text-center pt-2">
          <Link href="/houses">
            <button
              type="button"
              className="bg-[#57BA29] hover:bg-[#479E1F] text-white px-8 py-3 rounded-xl font-semibold shadow-md shadow-[#57BA29]/25 hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              <span>View More Houses</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

      {/* 3. Quick Radius Search Entry Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BoxCard className="p-6 sm:p-8 bg-gradient-to-r from-[#57BA29]/10 via-[#57BA29]/5 to-transparent border border-[#57BA29]/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#57BA29] mb-1">
              <Compass className="w-4 h-4" />
              <span>Spatial Geo Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-text tracking-tight">
              Looking for Precise Radius Search?
            </h2>
            <p className="text-xs sm:text-sm text-text-muted max-w-xl">
              Drop a pin anywhere in Dhaka and discover all verified properties within 500m or 1000m with sub-second spatial queries.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-center">
            <Link href="/map" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#57BA29] hover:bg-[#479E1F] text-white px-6 py-2.5 rounded-xl font-semibold shadow-md shadow-[#57BA29]/25 transition-all text-sm"
              >
                <Navigation className="w-4 h-4" />
                <span>Radius Map View</span>
              </button>
            </Link>

            <Link href="/search" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-surface border border-border text-text hover:bg-surface-alt px-6 py-2.5 rounded-xl font-semibold shadow-sm transition-all text-sm"
              >
                <Search className="w-4 h-4 text-text-muted" />
                <span>Split-Screen</span>
              </button>
            </Link>
          </div>
        </BoxCard>
      </section>

      {/* 4. Mini Map Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MiniMap houses={houses} />
      </section>
    </div>
  );
}
