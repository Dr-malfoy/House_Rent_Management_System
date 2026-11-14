'use client';

import React, { useState } from 'react';
import MapView from './MapView';
import BoxButton from './ui/BoxButton';
import { api } from '@/lib/api';
import { MapPin, Search, Navigation } from 'lucide-react';

export default function LocationPicker({
  value = { lat: 23.8759, lng: 90.3980 },
  onChange,
  defaultAreaName = '',
}) {
  const [coords, setCoords] = useState(value || { lat: 23.8759, lng: 90.3980 });
  const [searchQuery, setSearchQuery] = useState(defaultAreaName || '');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handlePinDrop = (newCoords) => {
    setCoords(newCoords);
    if (onChange) {
      onChange(newCoords);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError('');
    try {
      const res = await api.get(`/geocode?q=${encodeURIComponent(searchQuery.trim())}`);
      if (res?.success && res.data) {
        const newCoords = { lat: res.data.lat, lng: res.data.lng };
        setCoords(newCoords);
        if (onChange) onChange(newCoords);
      }
    } catch (err) {
      setSearchError('Location not found. Please click anywhere on the map to drop pin.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(newCoords);
        if (onChange) onChange(newCoords);
      },
      (err) => {
        alert('Could not detect your current location. Please grant permission or drop pin manually.');
      }
    );
  };

  return (
    <div className="space-y-3">
      {/* Search & Location Tools */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
            placeholder="Type area or landmark (e.g. Uttara Sector 10, Mirpur 10, Dhanmondi)..."
            className="flex-1 bg-surface border border-border text-text px-3.5 py-2 text-xs font-medium rounded-xl shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <BoxButton size="sm" variant="secondary" onClick={handleSearch} disabled={isSearching}>
            <Search className="w-3.5 h-3.5 text-text-muted" />
            <span>Search</span>
          </BoxButton>
        </div>

        <BoxButton size="sm" variant="outline" onClick={handleUseCurrentLocation} className="gap-1.5 shrink-0">
          <Navigation className="w-3.5 h-3.5 text-primary" />
          <span>My Location</span>
        </BoxButton>
      </div>

      {searchError && <p className="text-xs text-danger font-medium">{searchError}</p>}

      {/* Instructions Banner */}
      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-900 dark:text-emerald-200 font-medium">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary shrink-0" />
          <span>Click anywhere on the map or drag the pin to set the exact property location.</span>
        </div>
        {/* Read-only Coordinates Box */}
        <div className="font-mono text-xs bg-surface px-2.5 py-1 border border-border rounded-xl text-text shrink-0 self-start sm:self-auto shadow-sm">
          {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
        </div>
      </div>

      {/* Interactive Leaflet Pin Drop Map */}
      <div className="w-full h-[380px] border border-border rounded-2xl shadow-sm overflow-hidden">
        <MapView
          center={[coords.lat, coords.lng]}
          zoom={14}
          allowPinDrop={true}
          droppedPin={[coords.lat, coords.lng]}
          onPinDrop={handlePinDrop}
          height="380px"
        />
      </div>
    </div>
  );
}
