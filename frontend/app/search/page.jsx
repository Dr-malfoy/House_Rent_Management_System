'use client';

import React, { useState, useEffect, useRef } from 'react';
import MapView from '@/components/MapView';
import HouseCard from '@/components/HouseCard';
import BoxButton from '@/components/ui/BoxButton';
import BoxBadge from '@/components/ui/BoxBadge';
import Skeleton from '@/components/ui/Skeleton';
import { PRICE_RANGE_OPTIONS } from '@/components/FilterBar';
import { api } from '@/lib/api';
import {
  Search,
  MapPin,
  Navigation,
  Map,
  List,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SplitScreenSearchPage() {
  const [center, setCenter] = useState([23.8759, 90.3980]); // Default Uttara
  const [radius, setRadius] = useState(1000); // 500 or 1000
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [houses, setHouses] = useState([]);
  const [activeHouseId, setActiveHouseId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mobileTab, setMobileTab] = useState('list'); // 'list' or 'map'

  const handlePriceRangeChange = (val) => {
    setPriceRange(val);
    const matched = PRICE_RANGE_OPTIONS.find((opt) => opt.value === val);
    if (matched) {
      setMinRent(matched.min);
      setMaxRent(matched.max);
    } else {
      setMinRent('');
      setMaxRent('');
    }
  };

  const listContainerRef = useRef(null);

  // Search nearby houses
  const fetchNearbyHouses = async (lat, lng, r) => {
    setLoading(true);
    try {
      const qParams = new URLSearchParams({
        lat: String(lat),
        lng: String(lng),
        radius: String(r),
      });
      if (minRent) qParams.set('min_rent', minRent);
      if (maxRent) qParams.set('max_rent', maxRent);
      if (bedrooms) qParams.set('bedrooms', bedrooms);

      const res = await api.get(`/search/nearby?${qParams.toString()}`);
      if (res?.success && res.data) {
        setHouses(res.data.houses || []);
      }
    } catch (err) {
      console.error('Search nearby error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearbyHouses(center[0], center[1], radius);
  }, [center, radius, minRent, maxRent, bedrooms]);

  // Handle map click to reposition center
  const handlePinDrop = ({ lat, lng }) => {
    setCenter([lat, lng]);
  };

  // Handle address geocoding
  const handleAddressSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const res = await api.get(`/geocode?q=${encodeURIComponent(searchQuery.trim())}`);
      if (res?.success && res.data) {
        setCenter([res.data.lat, res.data.lng]);
      }
    } catch (err) {
      alert('Location not found in Dhaka. Please drop a pin on the map instead.');
    }
  };

  // Browser Geolocation
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        alert('Could not detect location. Please check browser permissions.');
      }
    );
  };

  // Marker click -> scroll to card
  const handleMarkerClick = (house) => {
    setActiveHouseId(house.id);
    const cardEl = document.getElementById(`split-card-${house.id}`);
    if (cardEl && listContainerRef.current) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="w-full h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-bg">
      {/* Top Controls Bar */}
      <div className="w-full bg-surface border-b border-border p-3.5 shrink-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Address Search */}
          <div className="flex items-center gap-2 w-full lg:w-96">
            <div className="flex-1 flex items-center bg-surface-alt/50 border border-border rounded-xl px-3 py-1.5 shadow-sm">
              <MapPin className="w-4 h-4 text-primary shrink-0 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch(e)}
                placeholder="Search landmark or address..."
                className="w-full bg-transparent text-text text-xs font-medium outline-none placeholder:text-text-muted/70"
              />
              <button onClick={handleAddressSearch} className="text-text-muted hover:text-primary transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </div>

            <BoxButton size="sm" variant="secondary" onClick={handleUseMyLocation} title="Use my GPS location" className="shadow-sm">
              <Navigation className="w-3.5 h-3.5 text-primary" />
            </BoxButton>
          </div>

          {/* Radius Selector: strictly 500m / 1000m */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-text-muted">Radius:</span>
            <div className="flex border border-border rounded-xl bg-surface-alt/40 p-0.5 shadow-sm">
              {[500, 1000].map((r) => (
                <button
                  key={r}
                  onClick={() => setRadius(r)}
                  className={cn(
                    'px-3 py-1 text-xs font-semibold rounded-lg transition-all',
                    radius === r ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text'
                  )}
                >
                  {r}m
                </button>
              ))}
            </div>
          </div>

          {/* Price range selector & bedrooms */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <select
              value={priceRange}
              onChange={(e) => handlePriceRangeChange(e.target.value)}
              className="bg-surface border border-border text-text px-2.5 py-1 text-xs font-medium rounded-xl outline-none shadow-sm focus:border-primary cursor-pointer"
            >
              {PRICE_RANGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="bg-surface border border-border text-text px-2.5 py-1 text-xs font-medium rounded-xl outline-none shadow-sm focus:border-primary cursor-pointer"
            >
              <option value="">Beds</option>
              <option value="1">1+ Bed</option>
              <option value="2">2+ Beds</option>
              <option value="3">3+ Beds</option>
            </select>
          </div>

          {/* Mobile View Toggle Button (List vs Map) */}
          <div className="flex lg:hidden items-center border border-border rounded-xl p-0.5 bg-surface-alt">
            <button
              onClick={() => setMobileTab('list')}
              className={cn(
                'px-3 py-1 text-xs font-semibold flex items-center gap-1.5 rounded-lg transition-colors',
                mobileTab === 'list' ? 'bg-primary text-white shadow-sm' : 'text-text-muted'
              )}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => setMobileTab('map')}
              className={cn(
                'px-3 py-1 text-xs font-semibold flex items-center gap-1.5 rounded-lg transition-colors',
                mobileTab === 'map' ? 'bg-primary text-white shadow-sm' : 'text-text-muted'
              )}
            >
              <Map className="w-3.5 h-3.5" /> Map
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Area (Map + List split uses ~70% of viewport) */}
      <div className="flex-1 w-full flex overflow-hidden">
        {/* Left Side: Scrollable Listing Panel */}
        <div
          ref={listContainerRef}
          className={cn(
            'w-full lg:w-[48%] h-full overflow-y-auto p-4 space-y-4 border-r border-border bg-surface/30',
            mobileTab === 'map' ? 'hidden lg:block' : 'block'
          )}
          data-lenis-prevent
        >
          {/* Header count */}
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <h2 className="text-sm font-semibold text-text">
                {loading ? 'Searching...' : `${houses.length} Properties Found`}
              </h2>
            </div>
            <BoxBadge variant="success" size="sm">
              Radius: {radius}m
            </BoxBadge>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-2xl" />
              ))}
            </div>
          ) : houses.length === 0 ? (
            <div className="p-8 border border-dashed border-border rounded-2xl text-center space-y-3 bg-surface">
              <p className="text-xs font-semibold text-text-muted">
                No houses found within {radius}m of this location.
              </p>
              <p className="text-xs text-text-muted">
                Try switching radius to 1000m or clicking another point on the map.
              </p>
              <BoxButton size="sm" variant="primary" onClick={() => setRadius(1000)} className="shadow-sm">
                Expand to 1000m
              </BoxButton>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {houses.map((house) => (
                <div key={house.id} id={`split-card-${house.id}`}>
                  <HouseCard
                    house={house}
                    isActive={activeHouseId === house.id}
                    showDistance={true}
                    onHover={() => setActiveHouseId(house.id)}
                    onClick={() => setActiveHouseId(house.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Interactive Leaflet Map */}
        <div
          className={cn(
            'w-full lg:w-[52%] h-full relative',
            mobileTab === 'list' ? 'hidden lg:block' : 'block'
          )}
          data-lenis-prevent
        >
          <MapView
            center={center}
            zoom={14}
            houses={houses}
            activeHouseId={activeHouseId}
            radius={radius}
            searchCenter={center}
            allowPinDrop={true}
            droppedPin={center}
            onPinDrop={handlePinDrop}
            onMarkerClick={handleMarkerClick}
            onMarkerHover={(house) => setActiveHouseId(house.id)}
            height="100%"
          />
        </div>
      </div>
    </div>
  );
}
