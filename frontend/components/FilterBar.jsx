'use client';

import React, { useState, useEffect } from 'react';
import BoxCard from './ui/BoxCard';
import BoxButton from './ui/BoxButton';
import { BD_LOCATIONS } from '@/lib/locations-data';
import { formatBDT } from '@/lib/utils';
import { Filter, RotateCcw, X, MapPin, Building, Bed } from 'lucide-react';

export const PRICE_RANGE_OPTIONS = [
  { value: '', label: 'All Prices', min: '', max: '' },
  { value: '0-10000', label: 'Under ৳10,000', min: '', max: '10000' },
  { value: '10000-20000', label: '৳10,000 - ৳20,000', min: '10000', max: '20000' },
  { value: '20000-30000', label: '৳20,000 - ৳30,000', min: '20000', max: '30000' },
  { value: '30000-50000', label: '৳30,000 - ৳50,000', min: '30000', max: '50000' },
  { value: '50000-75000', label: '৳50,000 - ৳75,000', min: '50000', max: '75000' },
  { value: '75000-100000', label: '৳75,000 - ৳1,00,000', min: '75000', max: '100000' },
  { value: '100000+', label: 'Above ৳1,00,000', min: '100000', max: '' },
];

function getPriceRangeValue(min, max) {
  const minStr = min ? String(min) : '';
  const maxStr = max ? String(max) : '';
  if (!minStr && !maxStr) return '';
  const matched = PRICE_RANGE_OPTIONS.find((opt) => opt.min === minStr && opt.max === maxStr);
  return matched ? matched.value : '';
}

export default function FilterBar({ filters, onChange, onClear, propertyTypes = [] }) {
  const [selectedDivision, setSelectedDivision] = useState(filters.division || '');
  const [selectedDistrict, setSelectedDistrict] = useState(filters.district || '');
  const [selectedArea, setSelectedArea] = useState(filters.area || '');
  const [selectedPriceRange, setSelectedPriceRange] = useState(() =>
    getPriceRangeValue(filters.min_rent, filters.max_rent)
  );
  const [minRent, setMinRent] = useState(filters.min_rent || '');
  const [maxRent, setMaxRent] = useState(filters.max_rent || '');
  const [bedrooms, setBedrooms] = useState(filters.bedrooms || '');
  const [propertyTypeId, setPropertyTypeId] = useState(filters.property_type_id || '');
  const [sort, setSort] = useState(filters.sort || 'newest');

  useEffect(() => {
    setSelectedDivision(filters.division || '');
    setSelectedDistrict(filters.district || '');
    setSelectedArea(filters.area || '');
    setMinRent(filters.min_rent || '');
    setMaxRent(filters.max_rent || '');
    setSelectedPriceRange(getPriceRangeValue(filters.min_rent, filters.max_rent));
    setBedrooms(filters.bedrooms || '');
    setPropertyTypeId(filters.property_type_id || '');
    setSort(filters.sort || 'newest');
  }, [filters]);

  const divisions = Object.keys(BD_LOCATIONS);
  const districts = selectedDivision && BD_LOCATIONS[selectedDivision] ? Object.keys(BD_LOCATIONS[selectedDivision]) : [];
  const areas =
    selectedDivision && selectedDistrict && BD_LOCATIONS[selectedDivision]?.[selectedDistrict]
      ? BD_LOCATIONS[selectedDivision][selectedDistrict]
      : [];

  const handlePriceRangeChange = (val) => {
    setSelectedPriceRange(val);
    const matched = PRICE_RANGE_OPTIONS.find((opt) => opt.value === val);
    if (matched) {
      setMinRent(matched.min);
      setMaxRent(matched.max);
    } else {
      setMinRent('');
      setMaxRent('');
    }
  };

  const handleApply = () => {
    onChange({
      division: selectedDivision,
      district: selectedDistrict,
      area: selectedArea,
      min_rent: minRent,
      max_rent: maxRent,
      bedrooms,
      property_type_id: propertyTypeId,
      sort,
    });
  };

  const handleClearAll = () => {
    setSelectedDivision('');
    setSelectedDistrict('');
    setSelectedArea('');
    setMinRent('');
    setMaxRent('');
    setSelectedPriceRange('');
    setBedrooms('');
    setPropertyTypeId('');
    setSort('newest');
    onClear();
  };

  const activeChips = [];
  if (filters.division) activeChips.push({ key: 'division', label: `Division: ${filters.division}` });
  if (filters.district) activeChips.push({ key: 'district', label: `District: ${filters.district}` });
  if (filters.area) activeChips.push({ key: 'area', label: `Area: ${filters.area}` });

  if (filters.min_rent || filters.max_rent) {
    const matched = PRICE_RANGE_OPTIONS.find(
      (opt) => opt.min === String(filters.min_rent || '') && opt.max === String(filters.max_rent || '')
    );
    const label = matched && matched.value
      ? `Price: ${matched.label}`
      : filters.min_rent && filters.max_rent
        ? `Price: ${formatBDT(filters.min_rent)} - ${formatBDT(filters.max_rent)}`
        : filters.min_rent
          ? `Price: ${formatBDT(filters.min_rent)}+`
          : `Price: Up to ${formatBDT(filters.max_rent)}`;

    activeChips.push({ key: 'price_range', label });
  }

  if (filters.bedrooms) activeChips.push({ key: 'bedrooms', label: `${filters.bedrooms}+ Beds` });
  if (filters.property_type_id) {
    const pt = propertyTypes.find((p) => String(p.id) === String(filters.property_type_id));
    if (pt) activeChips.push({ key: 'property_type_id', label: pt.name });
  }

  const removeChip = (key) => {
    if (key === 'division') { setSelectedDivision(''); setSelectedDistrict(''); setSelectedArea(''); }
    if (key === 'district') { setSelectedDistrict(''); setSelectedArea(''); }
    if (key === 'area') setSelectedArea('');
    if (key === 'price_range' || key === 'min_rent' || key === 'max_rent') {
      setMinRent('');
      setMaxRent('');
      setSelectedPriceRange('');
    }
    if (key === 'bedrooms') setBedrooms('');
    if (key === 'property_type_id') setPropertyTypeId('');

    const updated = { ...filters };
    if (key === 'price_range' || key === 'min_rent' || key === 'max_rent') {
      delete updated.min_rent;
      delete updated.max_rent;
    } else {
      delete updated[key];
    }
    if (key === 'division') { delete updated.district; delete updated.area; }
    if (key === 'district') { delete updated.area; }
    onChange(updated);
  };

  return (
    <BoxCard className="w-full space-y-4">
      {/* Filters Form Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Division */}
        <div>
          <label className="text-xs font-medium text-text-muted block mb-1">
            Division
          </label>
          <select
            value={selectedDivision}
            onChange={(e) => {
              setSelectedDivision(e.target.value);
              setSelectedDistrict('');
              setSelectedArea('');
            }}
            className="w-full bg-surface border border-border text-text px-3 py-2 text-xs font-medium rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
          >
            <option value="">All Divisions</option>
            {divisions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="text-xs font-medium text-text-muted block mb-1">
            District
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setSelectedArea('');
            }}
            disabled={!selectedDivision}
            className="w-full bg-surface border border-border text-text px-3 py-2 text-xs font-medium rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm disabled:opacity-50 transition-all"
          >
            <option value="">All Districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Area */}
        <div>
          <label className="text-xs font-medium text-text-muted block mb-1">
            Area / Thana
          </label>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            disabled={!selectedDistrict}
            className="w-full bg-surface border border-border text-text px-3 py-2 text-xs font-medium rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm disabled:opacity-50 transition-all"
          >
            <option value="">All Areas</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range Selector */}
        <div>
          <label className="text-xs font-medium text-text-muted block mb-1">
            Price Range
          </label>
          <select
            value={selectedPriceRange}
            onChange={(e) => handlePriceRangeChange(e.target.value)}
            className="w-full bg-surface border border-border text-text px-3 py-2 text-xs font-medium rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all cursor-pointer"
          >
            {PRICE_RANGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="text-xs font-medium text-text-muted block mb-1">
            Bedrooms
          </label>
          <select
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            className="w-full bg-surface border border-border text-text px-3 py-2 text-xs font-medium rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all cursor-pointer"
          >
            <option value="">Any Beds</option>
            <option value="1">1+ Bed</option>
            <option value="2">2+ Beds</option>
            <option value="3">3+ Beds</option>
            <option value="4">4+ Beds</option>
          </select>
        </div>
      </div>

      {/* Second Row: Property Type, Sort, Apply & Reset */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Property type */}
          <select
            value={propertyTypeId}
            onChange={(e) => setPropertyTypeId(e.target.value)}
            className="bg-surface border border-border text-text px-3 py-1.5 text-xs font-medium rounded-xl outline-none focus:border-primary shadow-sm"
          >
            <option value="">All Property Types</option>
            {propertyTypes.map((pt) => (
              <option key={pt.id} value={pt.id}>
                {pt.name}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-surface border border-border text-text px-3 py-1.5 text-xs font-medium rounded-xl outline-none focus:border-primary shadow-sm"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="size_desc">Largest Sqft</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <BoxButton size="sm" variant="primary" onClick={handleApply} className="gap-1.5 shadow-sm">
            <Filter className="w-3.5 h-3.5" />
            <span>Apply Filters</span>
          </BoxButton>

          <BoxButton size="sm" variant="secondary" onClick={handleClearAll} className="gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-text-muted" />
            <span>Reset</span>
          </BoxButton>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
          <span className="text-xs font-medium text-text-muted">Active:</span>
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 text-xs font-medium rounded-full"
            >
              <span>{chip.label}</span>
              <button
                onClick={() => removeChip(chip.key)}
                className="hover:text-danger focus:outline-none ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={handleClearAll}
            className="text-xs font-medium text-danger hover:underline ml-2"
          >
            Clear all
          </button>
        </div>
      )}
    </BoxCard>
  );
}
