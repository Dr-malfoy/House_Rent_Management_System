'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MapView from '@/components/MapView';
import HouseCard from '@/components/HouseCard';
import BoxButton from '@/components/ui/BoxButton';
import { api } from '@/lib/api';
import {
  MapPin,
  Search,
  Navigation,
  ChevronDown,
  ChevronUp,
  Building2,
  Globe2,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Verified default sample properties in Dhaka across popular areas
const FALLBACK_DHAKA_HOUSES = [
  {
    id: 1,
    title: 'Lakeview Luxury 3BHK Flat in Uttara Sector 3',
    area_name: 'Uttara Sector 3',
    address_text: 'House 22, Road 7, Sector 3, Uttara, Dhaka',
    city: 'Dhaka',
    latitude: 23.8682,
    longitude: 90.3985,
    rent_amount: 36000,
    bedrooms: 3,
    bathrooms: 3,
    size_sqft: 1650,
    cover_image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    property_type: 'Apartment',
    property_type_name: 'Apartment',
  },
  {
    id: 2,
    title: 'Sunny 2BHK Family Flat in Uttara Sector 7',
    area_name: 'Uttara Sector 7',
    address_text: 'House 18, Road 2, Sector 7, Uttara, Dhaka',
    city: 'Dhaka',
    latitude: 23.8715,
    longitude: 90.4012,
    rent_amount: 24000,
    bedrooms: 2,
    bathrooms: 2,
    size_sqft: 1100,
    cover_image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    property_type: 'Family Flat',
    property_type_name: 'Family Flat',
  },
  {
    id: 3,
    title: 'Modern 3BHK Residence in Uttara Sector 10',
    area_name: 'Uttara Sector 10',
    address_text: 'House 14, Road 5, Sector 10, Uttara, Dhaka',
    city: 'Dhaka',
    latitude: 23.8790,
    longitude: 90.3945,
    rent_amount: 28000,
    bedrooms: 3,
    bathrooms: 3,
    size_sqft: 1400,
    cover_image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    property_type: 'Apartment',
    property_type_name: 'Apartment',
  },
  {
    id: 4,
    title: 'Executive Studio Suite in Uttara Sector 11',
    area_name: 'Uttara Sector 11',
    address_text: 'Plot 31, Road 18, Sector 11, Uttara, Dhaka',
    city: 'Dhaka',
    latitude: 23.8820,
    longitude: 90.3900,
    rent_amount: 18000,
    bedrooms: 1,
    bathrooms: 1,
    size_sqft: 650,
    cover_image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    property_type: 'Studio Apartment',
    property_type_name: 'Studio Apartment',
  },
  {
    id: 5,
    title: 'Spacious 4BHK Family Apartment in Dhanmondi 27',
    area_name: 'Dhanmondi',
    address_text: 'House 34, Road 27, Dhanmondi, Dhaka',
    city: 'Dhaka',
    latitude: 23.7510,
    longitude: 90.3725,
    rent_amount: 55000,
    bedrooms: 4,
    bathrooms: 4,
    size_sqft: 2200,
    cover_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    property_type: 'Apartment',
    property_type_name: 'Apartment',
  },
  {
    id: 6,
    title: 'Cozy 2BHK Flat in Dhanmondi 9/A',
    area_name: 'Dhanmondi',
    address_text: 'Road 9/A, Dhanmondi, Dhaka',
    city: 'Dhaka',
    latitude: 23.7440,
    longitude: 90.3740,
    rent_amount: 30000,
    bedrooms: 2,
    bathrooms: 2,
    size_sqft: 1250,
    cover_image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    property_type: 'Family Flat',
    property_type_name: 'Family Flat',
  },
  {
    id: 7,
    title: 'Affordable 2BHK Bachelor Flat in Mirpur 10',
    area_name: 'Mirpur 10',
    address_text: 'Block C, Section 10, Mirpur, Dhaka',
    city: 'Dhaka',
    latitude: 23.8070,
    longitude: 90.3686,
    rent_amount: 17000,
    bedrooms: 2,
    bathrooms: 2,
    size_sqft: 950,
    cover_image: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
    property_type: 'Bachelor Flat',
    property_type_name: 'Bachelor Flat',
  },
  {
    id: 8,
    title: 'Peaceful 2BHK Apartment in Mirpur DOHS',
    area_name: 'Mirpur DOHS',
    address_text: 'Road 8, Mirpur DOHS, Dhaka',
    city: 'Dhaka',
    latitude: 23.8340,
    longitude: 90.3700,
    rent_amount: 25000,
    bedrooms: 2,
    bathrooms: 2,
    size_sqft: 1150,
    cover_image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
    property_type: 'Apartment',
    property_type_name: 'Apartment',
  },
  {
    id: 9,
    title: 'Luxury Duplex Penthouse in Gulshan 2',
    area_name: 'Gulshan 2',
    address_text: 'Road 55, Gulshan 2, Dhaka',
    city: 'Dhaka',
    latitude: 23.7937,
    longitude: 90.4137,
    rent_amount: 120000,
    bedrooms: 4,
    bathrooms: 5,
    size_sqft: 3500,
    cover_image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    property_type: 'Duplex House',
    property_type_name: 'Duplex House',
  },
  {
    id: 10,
    title: 'Premium 3BHK Apartment in Banani Road 11',
    area_name: 'Banani',
    address_text: 'House 77, Road 11, Banani, Dhaka',
    city: 'Dhaka',
    latitude: 23.7937,
    longitude: 90.4043,
    rent_amount: 65000,
    bedrooms: 3,
    bathrooms: 3,
    size_sqft: 1850,
    cover_image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    property_type: 'Apartment',
    property_type_name: 'Apartment',
  },
  {
    id: 11,
    title: 'Modern 3BHK Flat in Bashundhara Block C',
    area_name: 'Bashundhara',
    address_text: 'Road 6, Block C, Bashundhara R/A, Dhaka',
    city: 'Dhaka',
    latitude: 23.8191,
    longitude: 90.4357,
    rent_amount: 32000,
    bedrooms: 3,
    bathrooms: 3,
    size_sqft: 1550,
    cover_image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
    property_type: 'Apartment',
    property_type_name: 'Apartment',
  },
  {
    id: 12,
    title: 'Quiet 3BHK Home in Uttara Sector 14',
    area_name: 'Uttara Sector 14',
    address_text: 'Road 16, Sector 14, Uttara, Dhaka',
    city: 'Dhaka',
    latitude: 23.8880,
    longitude: 90.3850,
    rent_amount: 26000,
    bedrooms: 3,
    bathrooms: 2,
    size_sqft: 1350,
    cover_image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
    property_type: 'Family Flat',
    property_type_name: 'Family Flat',
  },
  {
    id: 13,
    title: 'Comfortable 2BHK Apartment in Mirpur 1',
    area_name: 'Mirpur 1',
    address_text: 'Near Sony Cinema Hall, Mirpur 1, Dhaka',
    city: 'Dhaka',
    latitude: 23.7960,
    longitude: 90.3540,
    rent_amount: 15000,
    bedrooms: 2,
    bathrooms: 2,
    size_sqft: 900,
    cover_image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    property_type: 'Family Flat',
    property_type_name: 'Family Flat',
  },
  {
    id: 14,
    title: 'Convenient 2BHK Flat in Mirpur 2',
    area_name: 'Mirpur 2',
    address_text: 'Block D, Section 2, Mirpur, Dhaka',
    city: 'Dhaka',
    latitude: 23.8035,
    longitude: 90.3620,
    rent_amount: 16000,
    bedrooms: 2,
    bathrooms: 2,
    size_sqft: 1000,
    cover_image: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
    property_type: 'Apartment',
    property_type_name: 'Apartment',
  },
  {
    id: 15,
    title: 'Chic 3BHK Residence in Gulshan 1',
    area_name: 'Gulshan 1',
    address_text: 'Road 23, Gulshan 1, Dhaka',
    city: 'Dhaka',
    latitude: 23.7780,
    longitude: 90.4160,
    rent_amount: 55000,
    bedrooms: 3,
    bathrooms: 3,
    size_sqft: 1750,
    cover_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    property_type: 'Apartment',
    property_type_name: 'Apartment',
  },
  {
    id: 16,
    title: 'Airy 3BHK Flat in Mohammadpur Ring Road',
    area_name: 'Mohammadpur',
    address_text: 'Ring Road, Mohammadpur, Dhaka',
    city: 'Dhaka',
    latitude: 23.7658,
    longitude: 90.3585,
    rent_amount: 25000,
    bedrooms: 3,
    bathrooms: 2,
    size_sqft: 1300,
    cover_image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    property_type: 'Family Flat',
    property_type_name: 'Family Flat',
  },
  {
    id: 17,
    title: 'Modern 2BHK Flat in Khilkhet Nikunja 2',
    area_name: 'Khilkhet',
    address_text: 'Road 5, Nikunja 2, Khilkhet, Dhaka',
    city: 'Dhaka',
    latitude: 23.8290,
    longitude: 90.4200,
    rent_amount: 22000,
    bedrooms: 2,
    bathrooms: 2,
    size_sqft: 1050,
    cover_image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
    property_type: 'Apartment',
    property_type_name: 'Apartment',
  },
];

export const DHAKA_AREAS = [
  { name: 'Uttara', label: 'Uttara (Sector 1-14)', lat: 23.8759, lng: 90.3980, zoom: 15 },
  { name: 'Mirpur 10', label: 'Mirpur 10 (Metro Station)', lat: 23.8070, lng: 90.3686, zoom: 15 },
  { name: 'Mirpur DOHS', label: 'Mirpur DOHS', lat: 23.8340, lng: 90.3680, zoom: 15 },
  { name: 'Mirpur 1', label: 'Mirpur 1 (Sony Square)', lat: 23.7960, lng: 90.3540, zoom: 15 },
  { name: 'Mirpur 2', label: 'Mirpur 2 (Stadium)', lat: 23.8035, lng: 90.3620, zoom: 15 },
  { name: 'Dhanmondi', label: 'Dhanmondi (Lake & 27)', lat: 23.7465, lng: 90.3760, zoom: 15 },
  { name: 'Gulshan 2', label: 'Gulshan 2 (Diplomatic Zone)', lat: 23.7937, lng: 90.4137, zoom: 15 },
  { name: 'Gulshan 1', label: 'Gulshan 1 Circle', lat: 23.7780, lng: 90.4160, zoom: 15 },
  { name: 'Banani', label: 'Banani (Road 11 / Block D)', lat: 23.7937, lng: 90.4043, zoom: 15 },
  { name: 'Bashundhara', label: 'Bashundhara R/A (Block A-I)', lat: 23.8191, lng: 90.4357, zoom: 15 },
  { name: 'Baridhara', label: 'Baridhara Diplomatic Zone', lat: 23.8010, lng: 90.4230, zoom: 15 },
  { name: 'Mohakhali', label: 'Mohakhali / DOHS', lat: 23.7780, lng: 90.3980, zoom: 15 },
  { name: 'Mohammadpur', label: 'Mohammadpur / Ring Road', lat: 23.7658, lng: 90.3585, zoom: 15 },
  { name: 'Lalmatia', label: 'Lalmatia', lat: 23.7540, lng: 90.3680, zoom: 15 },
  { name: 'Badda', label: 'Badda / Merul Badda', lat: 23.7805, lng: 90.4267, zoom: 15 },
  { name: 'Banasree', label: 'Banasree / Rampura', lat: 23.7620, lng: 90.4310, zoom: 15 },
  { name: 'Khilkhet', label: 'Khilkhet / Nikunja', lat: 23.8290, lng: 90.4200, zoom: 15 },
  { name: 'Motijheel', label: 'Motijheel / Commercial Zone', lat: 23.7330, lng: 90.4170, zoom: 15 },
];

const POPULAR_DHAKA_AREAS = [
  DHAKA_AREAS.find((a) => a.name === 'Uttara'),
  DHAKA_AREAS.find((a) => a.name === 'Mirpur 10'),
  DHAKA_AREAS.find((a) => a.name === 'Dhanmondi'),
  DHAKA_AREAS.find((a) => a.name === 'Gulshan 2'),
  DHAKA_AREAS.find((a) => a.name === 'Banani'),
  DHAKA_AREAS.find((a) => a.name === 'Bashundhara'),
  DHAKA_AREAS.find((a) => a.name === 'Mohammadpur'),
].filter(Boolean);

const RADIUS_OPTIONS = [500, 1000, 2000, 3000, 5000];

// Accurate Haversine distance in meters
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function MapContent() {
  const searchParams = useSearchParams();
  const paramLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')) : null;
  const paramLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')) : null;
  const paramRadius = searchParams.get('radius') ? parseInt(searchParams.get('radius'), 10) : 1000;
  const paramHouseId = searchParams.get('houseId') ? parseInt(searchParams.get('houseId'), 10) : null;

  const [center, setCenter] = useState(
    paramLat && paramLng ? [paramLat, paramLng] : [23.8759, 90.3980]
  );
  const [droppedPin, setDroppedPin] = useState(
    paramLat && paramLng ? [paramLat, paramLng] : [23.8759, 90.3980]
  );
  const [mapZoom, setMapZoom] = useState(14);
  const [selectedArea, setSelectedArea] = useState('Uttara');
  const [radius, setRadius] = useState(RADIUS_OPTIONS.includes(paramRadius) ? paramRadius : 1000);
  const [searchQuery, setSearchQuery] = useState('');
  const [houses, setHouses] = useState([]);
  const [activeHouseId, setActiveHouseId] = useState(paramHouseId);
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [showAllHouses, setShowAllHouses] = useState(false);

  const cardContainerRef = useRef(null);

  // PREVENT Browser Software Page Zoom (Ctrl + Wheel, Trackpad Pinch, Ctrl + '+/-') on map page
  useEffect(() => {
    const handleGlobalWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    const handleGlobalKeyDown = (e) => {
      if (e.ctrlKey && (e.key === '=' || e.key === '-' || e.key === '+' || e.key === '0')) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', handleGlobalWheel, { passive: false });
    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      window.removeEventListener('wheel', handleGlobalWheel);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  // Show ALL houses matching the radius (no limit)
  const displayedHouses = useMemo(() => {
    return houses || [];
  }, [houses]);

  // Client-side fallback proximity search when API is offline or returns empty
  const getClientProximityHouses = (pinCoords, targetRadius) => {
    if (!pinCoords) return FALLBACK_DHAKA_HOUSES;
    const [pinLat, pinLng] = pinCoords;

    return FALLBACK_DHAKA_HOUSES.map((h) => {
      const lat = parseFloat(h.latitude);
      const lng = parseFloat(h.longitude);
      const dist = calculateDistanceMeters(pinLat, pinLng, lat, lng);
      return { ...h, distance_meters: dist };
    })
      .filter((h) => h.distance_meters <= targetRadius)
      .sort((a, b) => a.distance_meters - b.distance_meters);
  };

  // Fetch houses whenever droppedPin, radius or showAllHouses changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    if (showAllHouses) {
      api.get('/houses?limit=50')
        .then((res) => {
          if (isMounted && res?.success && res.data?.houses?.length > 0) {
            setHouses(res.data.houses);
          } else if (isMounted) {
            setHouses(FALLBACK_DHAKA_HOUSES);
          }
        })
        .catch(() => {
          if (isMounted) setHouses(FALLBACK_DHAKA_HOUSES);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
      return () => { isMounted = false; };
    }

    if (!droppedPin) return;

    api.get(`/search/nearby?lat=${droppedPin[0]}&lng=${droppedPin[1]}&radius=${radius}`)
      .then((res) => {
        if (isMounted && res?.success && res.data?.houses?.length > 0) {
          setHouses(res.data.houses);
        } else if (isMounted) {
          const clientNearby = getClientProximityHouses(droppedPin, radius);
          setHouses(clientNearby);
        }
      })
      .catch(() => {
        if (isMounted) {
          const clientNearby = getClientProximityHouses(droppedPin, radius);
          setHouses(clientNearby);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [droppedPin, radius, showAllHouses]);

  // Click on map to drop or reposition pin
  const handleMapPinDrop = ({ lat, lng }) => {
    setShowAllHouses(false);
    setDroppedPin([lat, lng]);
    setCenter([lat, lng]);

    const nearest = DHAKA_AREAS.find(
      (a) => calculateDistanceMeters(lat, lng, a.lat, a.lng) < 900
    );
    if (nearest) {
      setSelectedArea(nearest.name);
    } else {
      setSelectedArea('');
    }
  };

  // Select area from dropdown
  const handleAreaSelect = (areaName) => {
    if (!areaName) return;
    setSelectedArea(areaName);
    const found = DHAKA_AREAS.find((a) => a.name === areaName);
    if (found) {
      setShowAllHouses(false);
      const newCoords = [found.lat, found.lng];
      setDroppedPin(newCoords);
      setCenter(newCoords);
      setMapZoom(found.zoom || 15);
      setSearchQuery(found.name);
    }
  };

  // Address search via geocoding
  const handleAddressSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchingAddress(true);
    setShowAllHouses(false);
    try {
      const match = DHAKA_AREAS.find((a) =>
        a.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        a.label.toLowerCase().includes(searchQuery.trim().toLowerCase())
      );
      if (match) {
        handleAreaSelect(match.name);
        setIsSearchingAddress(false);
        return;
      }

      const res = await api.get(`/geocode?q=${encodeURIComponent(searchQuery.trim())}`);
      if (res?.success && res.data) {
        const newCoords = [res.data.lat, res.data.lng];
        setDroppedPin(newCoords);
        setCenter(newCoords);
        setSelectedArea('');
      } else {
        alert('Location not found. Please click anywhere on the map to drop your search pin.');
      }
    } catch (err) {
      alert('Location not found. Please click anywhere on the map to drop your search pin.');
    } finally {
      setIsSearchingAddress(false);
    }
  };

  // Quick jump to famous area
  const handleJumpArea = (area) => {
    handleAreaSelect(area.name);
  };

  // Browser Geolocation
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setShowAllHouses(false);
        const newCoords = [pos.coords.latitude, pos.coords.longitude];
        setDroppedPin(newCoords);
        setCenter(newCoords);
        setSelectedArea('');
      },
      () => {
        alert('Could not detect your current location. Please grant location permission.');
      }
    );
  };

  // Marker click -> scroll right sidebar to corresponding card
  const handleMarkerClick = (house) => {
    setActiveHouseId(house.id);
    if (cardContainerRef.current) {
      const cardEl = document.getElementById(`map-card-${house.id}`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const formattedRadius = radius >= 1000 ? `${radius / 1000}km` : `${radius}m`;

  return (
    <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden bg-surface-alt select-none" data-lenis-prevent>
      {/* Full-Page Leaflet Map Background with Isolated Stacking Context */}
      <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ zIndex: 1, isolation: 'isolate' }}>
        <MapView
          center={center}
          zoom={mapZoom}
          houses={displayedHouses}
          activeHouseId={activeHouseId}
          radius={showAllHouses ? null : radius}
          searchCenter={showAllHouses ? null : droppedPin}
          allowPinDrop={true}
          droppedPin={showAllHouses ? null : droppedPin}
          onPinDrop={handleMapPinDrop}
          onMarkerClick={handleMarkerClick}
          onMarkerHover={(house) => setActiveHouseId(house.id)}
          height="100%"
          className="w-full h-full"
        />
      </div>

      {/* Top Floating Control Bar (Left/Center aligned, clear of Right Panel) */}
      <div
        className="absolute top-4 left-4 right-4 lg:right-[410px] flex flex-col gap-2 pointer-events-none"
        style={{ zIndex: 1200 }}
      >
        {/* Main Search & Tool Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pointer-events-auto">
          {/* Area Select Dropdown */}
          <div className="flex items-center gap-2 bg-surface/95 backdrop-blur-md border border-border hover:border-[#57BA29]/70 rounded-2xl shadow-lg px-3 py-2 shrink-0 transition-colors w-full sm:w-auto">
            <div className="w-6 h-6 rounded-lg bg-[#57BA29]/15 flex items-center justify-center text-[#57BA29] shrink-0">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col flex-1 sm:flex-initial">
              <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted leading-none mb-0.5">
                Dhaka Area
              </span>
              <select
                value={selectedArea}
                onChange={(e) => handleAreaSelect(e.target.value)}
                className="bg-transparent text-text font-bold text-xs outline-none cursor-pointer pr-1"
                aria-label="Select Dhaka Area"
              >
                <option value="" className="bg-surface text-text">Choose Area...</option>
                {DHAKA_AREAS.map((a) => (
                  <option key={a.name} value={a.name} className="bg-surface text-text font-medium">
                    {a.label || a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address Search Box */}
          <div className="flex-1 w-full flex items-center bg-surface/95 backdrop-blur-md border border-border rounded-2xl shadow-lg px-3.5 py-2">
            <MapPin className="w-4 h-4 text-[#57BA29] shrink-0 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch(e)}
              placeholder="Search address or street in Dhaka..."
              className="flex-1 bg-transparent text-text text-xs font-medium outline-none placeholder:text-text-muted/70"
            />
            <button
              onClick={handleAddressSearch}
              disabled={isSearchingAddress}
              title="Search"
              className="p-1 text-text-muted hover:text-[#57BA29] transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Right Buttons: My Location, Radius Selector & All Listings */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <BoxButton
              size="sm"
              variant="secondary"
              onClick={handleUseMyLocation}
              className="gap-1.5 shrink-0 bg-surface/95 backdrop-blur-md border border-border shadow-md"
            >
              <Navigation className="w-3.5 h-3.5 text-[#57BA29]" />
              <span className="hidden sm:inline">My Location</span>
            </BoxButton>

            {/* Radius Selector */}
            <div className="flex items-center bg-surface/95 backdrop-blur-md border border-border rounded-2xl shadow-md p-1">
              <span className="text-[10px] font-bold text-text-muted px-2 hidden sm:inline">
                Radius:
              </span>
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setShowAllHouses(false);
                    setRadius(r);
                  }}
                  className={cn(
                    'px-2.5 py-1 text-xs font-semibold rounded-xl transition-all duration-150',
                    !showAllHouses && radius === r
                      ? 'bg-[#57BA29] text-white shadow-sm'
                      : 'text-text-muted hover:text-text'
                  )}
                >
                  {r >= 1000 ? `${r / 1000}km` : `${r}m`}
                </button>
              ))}
            </div>

            {/* Show All Dhaka Houses Toggle */}
            <button
              type="button"
              onClick={() => setShowAllHouses(!showAllHouses)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-2xl border shadow-md transition-all backdrop-blur-md',
                showAllHouses
                  ? 'bg-[#57BA29] border-[#479E1F] text-white'
                  : 'bg-surface/95 border-border text-text hover:bg-surface-alt'
              )}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">All Listings</span>
            </button>
          </div>
        </div>

        {/* Pin Drop System Indicator & Quick Area Chips */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pointer-events-auto" data-lenis-prevent>
          {/* Active Pin Status Pill */}
          <div className="flex items-center gap-1.5 bg-surface/90 backdrop-blur-md border border-border px-3 py-1 rounded-xl shadow-sm shrink-0 text-[11px] text-text font-medium">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="font-semibold text-red-600">Pin Drop Active:</span>
            <span className="text-text-muted">Click map or drag red pin</span>
            {droppedPin && (
              <span className="hidden sm:inline font-mono text-[10px] text-text-muted/80 bg-surface-alt px-1.5 py-0.5 rounded ml-1">
                {droppedPin[0].toFixed(3)}°, {droppedPin[1].toFixed(3)}°
              </span>
            )}
          </div>

          {/* Quick Area Jump Chips */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[11px] font-semibold text-text-muted px-1 shrink-0 hidden xl:inline">Quick Jump:</span>
            {POPULAR_DHAKA_AREAS.map((area) => (
              <button
                key={area.name}
                type="button"
                onClick={() => handleJumpArea(area)}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-semibold rounded-xl border shadow-sm shrink-0 transition-colors backdrop-blur-md',
                  selectedArea === area.name
                    ? 'bg-[#57BA29] border-[#479E1F] text-white'
                    : 'bg-surface/90 hover:bg-surface border-border text-text'
                )}
              >
                {area.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE VERTICAL PANEL: Up to Down House List (ALL HOUSES IN RADIUS) */}
      <div
        className="absolute top-4 right-4 bottom-4 w-80 md:w-[380px] flex flex-col pointer-events-none"
        style={{ zIndex: 1200 }}
      >
        <div className="pointer-events-auto flex flex-col h-full bg-surface/90 backdrop-blur-md border border-border rounded-3xl shadow-2xl overflow-hidden">
          {/* Sidebar Header */}
          <div className="p-3.5 border-b border-border/80 flex items-center justify-between bg-surface/95 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#57BA29]/15 flex items-center justify-center text-[#57BA29]">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-text">
                  {showAllHouses ? 'All Dhaka Properties' : 'Properties in Radius'}
                </h3>
                <p className="text-[10px] text-text-muted font-medium">
                  {loading
                    ? 'Searching map...'
                    : `${displayedHouses.length} houses within ${formattedRadius}`}
                </p>
              </div>
            </div>

            {/* Total Count Pill & Minimize Button */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#57BA29]/15 text-[#57BA29] border border-[#57BA29]/30">
                {displayedHouses.length} Found
              </span>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 rounded-lg text-text-muted hover:text-text hover:bg-surface-alt transition-colors"
                title={isCollapsed ? 'Expand properties' : 'Minimize properties'}
              >
                {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Up to Down Vertical House List */}
          {!isCollapsed && (
            <div
              ref={cardContainerRef}
              className="flex-1 overflow-y-auto p-3 space-y-3.5 scroll-smooth"
              data-lenis-prevent
            >
              {displayedHouses.map((house) => (
                <div
                  key={house.id}
                  id={`map-card-${house.id}`}
                  className="w-full"
                >
                  <HouseCard
                    house={house}
                    isActive={activeHouseId === house.id}
                    showDistance={!showAllHouses}
                    onHover={() => setActiveHouseId(house.id)}
                    className="w-full bg-surface/95 shadow-md hover:shadow-xl transition-all"
                  />
                </div>
              ))}

              {/* If no houses in selected radius */}
              {!loading && displayedHouses.length === 0 && (
                <div className="p-6 text-center space-y-2.5 my-auto">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-[#57BA29] flex items-center justify-center mx-auto font-bold text-base">
                    📍
                  </div>
                  <p className="text-xs font-semibold text-text">
                    No houses within {formattedRadius}
                  </p>
                  <p className="text-[11px] text-text-muted">
                    Click anywhere on the map to move the pin, choose a wider radius, or view all listings.
                  </p>
                  <div className="flex flex-col gap-2 pt-2">
                    <BoxButton size="sm" variant="primary" onClick={() => setRadius(3000)}>
                      Expand to 3km
                    </BoxButton>
                    <BoxButton size="sm" variant="secondary" onClick={() => setShowAllHouses(true)}>
                      View All Listings
                    </BoxButton>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FullMapPage() {
  return (
    <Suspense fallback={<div className="w-full h-[calc(100vh-80px)] bg-surface-alt flex items-center justify-center text-xs text-text-muted font-medium">Loading Map...</div>}>
      <MapContent />
    </Suspense>
  );
}
