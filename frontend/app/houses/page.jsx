'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import FilterBar from '@/components/FilterBar';
import HouseCard from '@/components/HouseCard';
import MapView from '@/components/MapView';
import BoxButton from '@/components/ui/BoxButton';
import Skeleton from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Building2, SearchX, LayoutGrid, Map as MapIcon, Columns } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HousesPage() {
  const [houses, setHouses] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'split' | 'map'
  const [activeHouseId, setActiveHouseId] = useState(null);
  const listContainerRef = useRef(null);

  const [filters, setFilters] = useState({
    division: '',
    district: '',
    area: '',
    min_rent: '',
    max_rent: '',
    bedrooms: '',
    property_type_id: '',
    sort: 'newest',
    page: 1,
  });
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, total_pages: 1 });

  // Load property types lookup
  useEffect(() => {
    api.get('/admin/lookups')
      .then((res) => {
        if (res?.success && res.data?.property_types) {
          setPropertyTypes(res.data.property_types);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch houses whenever filters change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const queryParams = new URLSearchParams();
    if (filters.division) queryParams.set('division', filters.division);
    if (filters.district) queryParams.set('district', filters.district);
    if (filters.area) queryParams.set('area', filters.area);
    if (filters.min_rent) queryParams.set('min_rent', filters.min_rent);
    if (filters.max_rent) queryParams.set('max_rent', filters.max_rent);
    if (filters.bedrooms) queryParams.set('bedrooms', filters.bedrooms);
    if (filters.property_type_id) queryParams.set('property_type_id', filters.property_type_id);
    if (filters.sort) queryParams.set('sort', filters.sort);
    queryParams.set('page', filters.page || 1);
    queryParams.set('limit', viewMode === 'split' ? 24 : 12);

    api.get(`/houses?${queryParams.toString()}`)
      .then((res) => {
        if (isMounted && res?.success) {
          setHouses(res.data?.houses || []);
          if (res.data?.pagination) {
            setPagination(res.data.pagination);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to fetch houses:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [filters, viewMode]);

  // Compute map center from active houses
  const mapCenter = useMemo(() => {
    if (houses.length > 0) {
      const firstValid = houses.find((h) => {
        const lat = parseFloat(h.coordinates?.lat ?? h.latitude);
        const lng = parseFloat(h.coordinates?.lng ?? h.longitude);
        return !isNaN(lat) && !isNaN(lng);
      });
      if (firstValid) {
        return [
          parseFloat(firstValid.coordinates?.lat ?? firstValid.latitude),
          parseFloat(firstValid.coordinates?.lng ?? firstValid.longitude),
        ];
      }
    }
    return [23.8103, 90.4125];
  }, [houses]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      division: '',
      district: '',
      area: '',
      min_rent: '',
      max_rent: '',
      bedrooms: '',
      property_type_id: '',
      sort: 'newest',
      page: 1,
    });
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const handleMarkerClick = (house) => {
    setActiveHouseId(house.id);
    const cardEl = document.getElementById(`catalog-card-${house.id}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-border pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-[#57BA29]" />
            <span>Browse Houses & Apartments</span>
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Search with precision across Bangladesh divisions, districts, and interactive map pins.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs font-medium text-text bg-surface border border-border px-3.5 py-2 rounded-xl shadow-sm">
            Total: <span className="text-[#57BA29] font-bold">{pagination.total}</span> Properties
          </div>

          {/* View Mode Toggle: Grid / Split / Map */}
          <div className="flex items-center bg-surface border border-border rounded-xl p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
                viewMode === 'grid'
                  ? 'bg-[#57BA29] text-white shadow-sm'
                  : 'text-text-muted hover:text-text'
              )}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
                viewMode === 'split'
                  ? 'bg-[#57BA29] text-white shadow-sm'
                  : 'text-text-muted hover:text-text'
              )}
              title="Split Map & List View"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split Map</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
                viewMode === 'map'
                  ? 'bg-[#57BA29] text-white shadow-sm'
                  : 'text-text-muted hover:text-text'
              )}
              title="Full Map View"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Filter Bar */}
      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
        propertyTypes={propertyTypes}
      />

      {/* VIEW MODE 1: SPLIT SCREEN (Half Cards, Half Sticky Leaflet Map) */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Scrollable List of Houses */}
          <div
            ref={listContainerRef}
            className="lg:col-span-6 space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto pr-2"
            data-lenis-prevent
          >
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-72 rounded-2xl" />
                ))}
              </div>
            ) : houses.length === 0 ? (
              <div className="p-8 border border-dashed border-border rounded-2xl text-center space-y-3 bg-surface">
                <SearchX className="w-10 h-10 text-text-muted mx-auto" />
                <h3 className="text-sm font-semibold text-text">No Matching Properties Found</h3>
                <BoxButton size="sm" variant="primary" onClick={handleClearFilters}>
                  Clear All Filters
                </BoxButton>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {houses.map((house) => (
                  <div key={house.id} id={`catalog-card-${house.id}`}>
                    <HouseCard
                      house={house}
                      isActive={activeHouseId === house.id}
                      onHover={() => setActiveHouseId(house.id)}
                      onClick={() => setActiveHouseId(house.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Sticky Interactive Leaflet Map */}
          <div className="lg:col-span-6 sticky top-24 h-[650px] border border-border rounded-3xl overflow-hidden shadow-lg bg-surface-alt">
            <MapView
              center={mapCenter}
              zoom={13}
              houses={houses}
              activeHouseId={activeHouseId}
              onMarkerClick={handleMarkerClick}
              onMarkerHover={(house) => setActiveHouseId(house.id)}
              height="100%"
            />
          </div>
        </div>
      )}

      {/* VIEW MODE 2: FULL MAP VIEW */}
      {viewMode === 'map' && (
        <div className="space-y-6">
          <div className="relative w-full h-[620px] border border-border rounded-3xl overflow-hidden shadow-xl bg-surface-alt">
            <MapView
              center={mapCenter}
              zoom={13}
              houses={houses}
              activeHouseId={activeHouseId}
              onMarkerClick={handleMarkerClick}
              onMarkerHover={(house) => setActiveHouseId(house.id)}
              height="100%"
            />
          </div>

          {/* Horizontal scroll cards strip beneath map */}
          {houses.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-text">Listing Cards ({houses.length})</h3>
              <div className="flex items-center gap-4 overflow-x-auto pb-3" data-lenis-prevent>
                {houses.map((house) => (
                  <div key={house.id} className="w-72 shrink-0">
                    <HouseCard
                      house={house}
                      isActive={activeHouseId === house.id}
                      onHover={() => setActiveHouseId(house.id)}
                      onClick={() => setActiveHouseId(house.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 3: STANDARD GRID */}
      {viewMode === 'grid' && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-2xl" />
              ))}
            </div>
          ) : houses.length === 0 ? (
            <div className="p-12 border border-dashed border-border rounded-3xl bg-surface-alt/30 text-center space-y-4">
              <SearchX className="w-12 h-12 text-text-muted mx-auto" />
              <h3 className="text-base font-semibold text-text">No Matching Properties Found</h3>
              <p className="text-xs text-text-muted max-w-md mx-auto">
                Try adjusting your price range, choosing a broader area, or clearing some filters to see more results.
              </p>
              <BoxButton size="sm" variant="primary" onClick={handleClearFilters} className="shadow-sm">
                Clear All Filters
              </BoxButton>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {houses.map((house) => (
                  <motion.div
                    key={house.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <HouseCard house={house} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Pagination Controls */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <BoxButton
                size="sm"
                variant="secondary"
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="shadow-sm"
              >
                &larr; Previous
              </BoxButton>

              <span className="text-xs font-medium text-text px-4 py-2 bg-surface border border-border rounded-xl shadow-sm">
                Page {pagination.page} of {pagination.total_pages}
              </span>

              <BoxButton
                size="sm"
                variant="secondary"
                disabled={pagination.page >= pagination.total_pages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="shadow-sm"
              >
                Next &rarr;
              </BoxButton>
            </div>
          )}
        </>
      )}
    </div>
  );
}