'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { formatBDT, formatDate } from '@/lib/utils';
import MapView from '@/components/MapView';
import BoxCard from '@/components/ui/BoxCard';
import BoxButton from '@/components/ui/BoxButton';
import BoxBadge from '@/components/ui/BoxBadge';
import Skeleton from '@/components/ui/Skeleton';
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Layers,
  ShieldCheck,
  Phone,
  Mail,
  Heart,
  Share2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

export default function HouseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    api.get(`/houses/${id}`)
      .then((res) => {
        if (res?.success && res.data) {
          setHouse(res.data);
          setActiveImage(res.data.cover_image || res.data.images?.[0]?.image_url);
          setIsFavorited(res.data.is_favorited || false);
        } else {
          setError(res?.message || 'House not found');
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load house details');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleFavorite = async () => {
    if (!user) {
      router.push(`/login?redirect=/houses/${id}`);
      return;
    }

    try {
      if (isFavorited) {
        await api.delete(`/favorites/${id}`);
        setIsFavorited(false);
      } else {
        await api.post(`/favorites/${id}`);
        setIsFavorited(true);
      }
    } catch (err) {
      console.error('Favorite toggle failed:', err);
    }
  };

  const handleBookClick = () => {
    if (!user) {
      router.push(`/login?redirect=/book/${id}`);
    } else {
      router.push(`/book/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="w-1/4 h-8 rounded-xl" />
        <Skeleton className="w-full h-[450px] rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !house) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-danger mx-auto" />
        <h2 className="text-xl font-bold text-text">House Listing Not Found</h2>
        <p className="text-xs text-text-muted">{error || 'This listing may have been rented or removed.'}</p>
        <Link href="/houses">
          <BoxButton size="sm" variant="primary">
            Back to Houses
          </BoxButton>
        </Link>
      </div>
    );
  }

  const isOwner = user && user.id === house.landlord_id;
  const isBookedOrCompleted = ['deal_completed', 'rented', 'booked'].includes(house.status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-4">
        <Link href="/houses" className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Houses</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFavorite}
            className={`w-9 h-9 rounded-xl border border-border flex items-center justify-center transition-all shadow-sm ${
              isFavorited ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-surface text-text-muted hover:text-text hover:bg-surface-alt'
            }`}
            title="Save to Favorites"
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-600 text-rose-600' : ''}`} />
          </button>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: house.title, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Listing link copied to clipboard!');
              }
            }}
            className="w-9 h-9 rounded-xl border border-border bg-surface text-text-muted hover:text-text hover:bg-surface-alt flex items-center justify-center transition-all shadow-sm"
            title="Share Property"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* House Title, Address & Badges */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {house.is_featured && <BoxBadge variant="featured">Featured</BoxBadge>}
          <BoxBadge variant={house.status === 'approved' ? 'success' : 'warning'}>
            {house.status === 'deal_completed' ? 'Deal Completed' : house.status === 'approved' ? 'Available' : house.status}
          </BoxBadge>
          <BoxBadge variant="neutral">{house.property_type_name || 'Apartment'}</BoxBadge>
        </div>

        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-text">
          {house.title}
        </h1>

        <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
          <MapPin className="w-4 h-4 text-primary shrink-0" />
          <span>{house.address_text}, {house.area_name}, {house.district}</span>
        </div>
      </div>

      {/* Hero Image & Gallery Section */}
      <div className="space-y-3">
        {/* Main Cover Image View */}
        <div className="relative w-full h-[420px] sm:h-[480px] border border-border rounded-3xl shadow-lg overflow-hidden bg-zinc-950">
          <Image
            src={activeImage || house.cover_image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200'}
            alt={house.title}
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Thumbnail Strip */}
        {house.images && house.images.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2" data-lenis-prevent>
            {house.images.map((img) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(img.image_url)}
                className={`relative w-24 h-16 shrink-0 border rounded-xl overflow-hidden transition-all ${
                  activeImage === img.image_url
                    ? 'border-primary ring-2 ring-primary/40 scale-105'
                    : 'border-border opacity-70 hover:opacity-100'
                }`}
              >
                <Image src={img.image_url} alt="Gallery thumbnail" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid: Details Left, Booking Card Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Specs, Description, Amenities, Mini Map */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Specs Bento Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <BoxCard className="p-4 text-center space-y-1">
              <Bed className="w-5 h-5 text-primary mx-auto" />
              <span className="text-[11px] font-medium text-text-muted block">Bedrooms</span>
              <span className="text-sm font-bold text-text">{house.bedrooms || 1} Rooms</span>
            </BoxCard>

            <BoxCard className="p-4 text-center space-y-1">
              <Bath className="w-5 h-5 text-primary mx-auto" />
              <span className="text-[11px] font-medium text-text-muted block">Bathrooms</span>
              <span className="text-sm font-bold text-text">{house.bathrooms || 1} Baths</span>
            </BoxCard>

            <BoxCard className="p-4 text-center space-y-1">
              <Maximize2 className="w-5 h-5 text-primary mx-auto" />
              <span className="text-[11px] font-medium text-text-muted block">Flat Size</span>
              <span className="text-sm font-bold text-text">{house.size_sqft || 500} sqft</span>
            </BoxCard>

            <BoxCard className="p-4 text-center space-y-1">
              <Layers className="w-5 h-5 text-primary mx-auto" />
              <span className="text-[11px] font-medium text-text-muted block">Floor Level</span>
              <span className="text-sm font-bold text-text">{house.floor || '3rd'}</span>
            </BoxCard>
          </div>

          {/* Description */}
          <BoxCard className="space-y-3">
            <h3 className="text-sm font-semibold text-text border-b border-border pb-2">
              Property Description
            </h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed whitespace-pre-line font-normal">
              {house.description || 'No description provided.'}
            </p>
          </BoxCard>

          {/* Amenities & Facilities */}
          {house.amenities && house.amenities.length > 0 && (
            <BoxCard className="space-y-3">
              <h3 className="text-sm font-semibold text-text border-b border-border pb-2">
                Included Facilities & Amenities
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {house.amenities.map((amenity) => (
                  <div
                    key={amenity.id}
                    className="flex items-center gap-2 p-2.5 border border-border rounded-xl bg-surface-alt/40 text-xs font-medium text-text"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>{amenity.name}</span>
                  </div>
                ))}
              </div>
            </BoxCard>
          )}

          {/* House Rules */}
          {house.rules && (
            <BoxCard className="space-y-2 border-l-4 border-l-amber-500">
              <h4 className="text-xs font-semibold text-text">House Rules & Terms</h4>
              <p className="text-xs text-text-muted">{house.rules}</p>
            </BoxCard>
          )}

          {/* Precision Spatial Location Pin on Map */}
          <BoxCard className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#57BA29]" />
                <span>Interactive Geolocation Map</span>
              </h3>
              <span className="text-xs font-mono text-text-muted">
                {parseFloat(house.coordinates?.lat ?? house.latitude ?? 23.8103).toFixed(5)}, {parseFloat(house.coordinates?.lng ?? house.longitude ?? 90.4125).toFixed(5)}
              </span>
            </div>

            <div className="w-full h-[340px] border border-border rounded-2xl overflow-hidden shadow-sm">
              <MapView
                center={[
                  parseFloat(house.coordinates?.lat ?? house.latitude ?? 23.8103),
                  parseFloat(house.coordinates?.lng ?? house.longitude ?? 90.4125),
                ]}
                zoom={15}
                houses={[house]}
                activeHouseId={house.id}
                droppedPin={[
                  parseFloat(house.coordinates?.lat ?? house.latitude ?? 23.8103),
                  parseFloat(house.coordinates?.lng ?? house.longitude ?? 90.4125),
                ]}
                height="340px"
              />
            </div>

            {/* Quick Map Action Links */}
            <div className="flex items-center justify-between pt-1">
              <Link
                href={`/map?lat=${parseFloat(house.coordinates?.lat ?? house.latitude ?? 23.8103)}&lng=${parseFloat(house.coordinates?.lng ?? house.longitude ?? 90.4125)}&houseId=${house.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#57BA29] hover:underline"
              >
                <span>Explore nearby houses in 1000m radius &rarr;</span>
              </Link>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${parseFloat(house.coordinates?.lat ?? house.latitude ?? 23.8103)},${parseFloat(house.coordinates?.lng ?? house.longitude ?? 90.4125)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-text-muted hover:text-text font-medium"
              >
                Google Maps &nearr;
              </a>
            </div>
          </BoxCard>
        </div>

        {/* Right Column: Pricing & Booking Action Card */}
        <div className="space-y-6">
          <BoxCard className="sticky top-24 space-y-5 bg-surface border border-border rounded-3xl shadow-xl p-6">
            {/* Price Box */}
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl space-y-1">
              <span className="text-xs font-medium text-text-muted block">Monthly Rent</span>
              <div className="text-3xl font-extrabold text-text tracking-tight">
                {formatBDT(house.rent_amount)}
                <span className="text-xs font-normal text-text-muted"> / month</span>
              </div>
              {house.security_deposit > 0 && (
                <p className="text-xs font-medium text-text-muted pt-1">
                  Security Deposit: <span className="font-semibold text-text">{formatBDT(house.security_deposit)}</span>
                </p>
              )}
            </div>

            {/* Quick Details */}
            <div className="space-y-2.5 text-xs font-medium text-text divide-y divide-border/60">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-text-muted">Availability</span>
                <span>{house.availability_date ? formatDate(house.availability_date) : 'Immediate'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-text-muted">City / District</span>
                <span>{house.city}, {house.division}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-text-muted">Posted Date</span>
                <span>{formatDate(house.created_at)}</span>
              </div>
            </div>

            {/* Book Now Button */}
            {isOwner ? (
              <div className="p-3 bg-surface-alt border border-border rounded-xl text-center text-xs font-medium text-text-muted">
                You are the owner of this listing.
              </div>
            ) : isBookedOrCompleted ? (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center text-xs font-semibold text-rose-600 rounded-xl">
                This Property is Already Booked / Deal Completed
              </div>
            ) : (
              <BoxButton size="lg" variant="primary" onClick={handleBookClick} className="w-full text-center shadow-md">
                Book This House Now
              </BoxButton>
            )}

            {/* House Holder Profile Box */}
            <div className="pt-4 border-t border-border space-y-3">
              <span className="text-xs font-medium text-text-muted block">
                Listed by House Holder
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {house.landlord_name?.charAt(0) || 'L'}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-text">{house.landlord_name}</h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <BoxBadge size="sm" variant={house.landlord_nid_status === 'verified' ? 'success' : 'neutral'}>
                      <ShieldCheck className="w-3 h-3" /> NID Verified
                    </BoxBadge>
                  </div>
                </div>
              </div>

              {/* Contact details */}
              <div className="space-y-1.5 pt-1 text-xs font-medium text-text-muted">
                {house.landlord_phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    <span>{house.landlord_phone}</span>
                  </p>
                )}
                {house.landlord_email && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    <span>{house.landlord_email}</span>
                  </p>
                )}
              </div>
            </div>
          </BoxCard>
        </div>
      </div>
    </div>
  );
}
