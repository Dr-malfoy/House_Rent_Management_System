'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { formatBDT, formatDate } from '@/lib/utils';
import BoxCard from '@/components/ui/BoxCard';
import BoxButton from '@/components/ui/BoxButton';
import BoxInput from '@/components/ui/BoxInput';
import BoxBadge from '@/components/ui/BoxBadge';
import Skeleton from '@/components/ui/Skeleton';
import {
  ShieldCheck,
  Building2,
  Calendar,
  Users,
  MapPin,
  AlertCircle,
  Navigation,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

export default function BookingPage() {
  const { houseId } = useParams();
  const router = useRouter();
  const { user, isNidVerified, isLoading: authLoading } = useAuth();

  const [house, setHouse] = useState(null);
  const [nidData, setNidData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form inputs
  const [members, setMembers] = useState(2);
  const [moveInDate, setMoveInDate] = useState('');
  const [message, setMessage] = useState('');
  const [shareLocation, setShareLocation] = useState(true);
  const [bookerCoords, setBookerCoords] = useState(null);

  // Get user geolocation if consented
  useEffect(() => {
    if (navigator.geolocation && shareLocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setBookerCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {}
      );
    }
  }, [shareLocation]);

  // Load house & verified NID details
  useEffect(() => {
    if (!houseId) return;

    async function loadData() {
      try {
        const [houseRes, nidRes] = await Promise.all([
          api.get(`/houses/${houseId}`),
          api.get('/nid/me').catch(() => null),
        ]);

        if (houseRes?.success) {
          setHouse(houseRes.data);
        }
        if (nidRes?.success) {
          setNidData(nidRes.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      if (!user) {
        router.replace(`/login?redirect=/book/${houseId}`);
      } else {
        loadData();
      }
    }
  }, [houseId, user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!moveInDate) {
      setError('Please select your expected move-in date.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        house_id: house.id,
        members: parseInt(members, 10),
        move_in_date: moveInDate,
        message,
        share_location: shareLocation,
        booker_lat: bookerCoords?.lat || null,
        booker_lng: bookerCoords?.lng || null,
      };

      const res = await api.post('/bookings', payload);
      if (res?.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError(res?.message || 'Booking submission failed');
      }
    } catch (err) {
      setError(err.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="w-1/3 h-8 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-96 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      </div>
    );
  }

  // NID Verification Gate
  if (!isNidVerified) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto text-amber-500">
          <ShieldCheck className="w-8 h-8 stroke-[2]" />
        </div>
        <h2 className="text-xl font-bold text-text">NID Verification Required</h2>
        <p className="text-xs text-text-muted leading-relaxed">
          In accordance with platform safety and identity policies, all users must have a verified National ID (NID) before they can submit rental bookings.
        </p>
        <div className="p-3.5 bg-surface border border-border rounded-2xl text-xs font-medium text-text">
          Current NID Status:{' '}
          <span className="font-semibold text-amber-500 capitalize">{user?.nid_status || 'Not Submitted'}</span>
        </div>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link href="/nid">
            <BoxButton size="md" variant="primary">
              Submit NID for Verification
            </BoxButton>
          </Link>
          <Link href={`/houses/${houseId}`}>
            <BoxButton size="md" variant="secondary">
              Back to House
            </BoxButton>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-500">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-text">Booking Submitted!</h2>
        <p className="text-xs text-text-muted">
          Your booking request and verified details have been sent to the house holder. You can track status on your dashboard.
        </p>
        <p className="text-xs font-semibold text-primary animate-pulse">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="border-b border-border pb-3 flex items-center justify-between">
        <Link
          href={`/houses/${houseId}`}
          className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to House</span>
        </Link>
        <span className="text-xs font-medium text-text-muted">
          Confirm Rental Booking
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Box: House Information Summary */}
        <BoxCard className="space-y-4 bg-surface border border-border rounded-3xl shadow-sm">
          <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-zinc-950">
            <Image
              src={house?.cover_image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'}
              alt={house?.title || 'House'}
              fill
              className="object-cover"
            />
          </div>

          <div>
            <BoxBadge variant="primary" size="sm" className="mb-1.5">
              {house?.property_type_name || 'Apartment'}
            </BoxBadge>
            <h3 className="text-base font-bold text-text">{house?.title}</h3>
            <p className="text-xs text-text-muted flex items-center gap-1 mt-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>{house?.address_text}, {house?.area_name}</span>
            </p>
          </div>

          <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">Monthly Rent</span>
            <span className="text-xl font-bold text-text">{formatBDT(house?.rent_amount)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-medium text-text-muted border-t border-border/60 pt-3">
            <div>Bedrooms: <span className="text-text font-semibold">{house?.bedrooms} Beds</span></div>
            <div>Bathrooms: <span className="text-text font-semibold">{house?.bathrooms} Baths</span></div>
            <div>Floor: <span className="text-text font-semibold">{house?.floor}</span></div>
            <div>Size: <span className="text-text font-semibold">{house?.size_sqft} sqft</span></div>
          </div>
        </BoxCard>

        {/* Right Box: Booker Details Entry Form (with Auto-fetched Verified NID) */}
        <BoxCard className="space-y-5 bg-surface border border-border rounded-3xl shadow-sm">
          <div>
            <h3 className="text-base font-bold tracking-tight text-text">
              Booker Application Details
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Your verified National ID info has been auto-fetched from our database.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-medium text-danger rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Read-Only Verified NID Fields */}
            <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Verified NID Details (Read-only)
                </span>
                <BoxBadge variant="success" size="sm">Verified</BoxBadge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-text-muted block">Full Name</span>
                  <span className="font-semibold text-text">{nidData?.full_name || user?.full_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">NID Number</span>
                  <span className="font-mono font-semibold text-text">
                    {nidData?.masked_nid_number || '1990********0001'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Date of Birth</span>
                  <span className="font-semibold text-text">{nidData?.date_of_birth ? formatDate(nidData.date_of_birth) : 'Verified'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Phone</span>
                  <span className="font-semibold text-text">{user?.phone}</span>
                </div>
              </div>
            </div>

            {/* Editable Booking Parameters */}
            <BoxInput
              label="Number of Family / Living Members"
              type="number"
              min="1"
              max="15"
              required
              value={members}
              onChange={(e) => setMembers(e.target.value)}
            />

            <BoxInput
              label="Expected Move-in Date"
              type="date"
              required
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text block">
                Message to House Holder
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a brief introduction about yourself and your family..."
                className="w-full bg-surface border border-border text-text px-3.5 py-2.5 text-xs font-normal rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
              />
            </div>

            {/* Share Location Consent Checkbox */}
            <div className="flex items-start gap-3 p-3.5 border border-border rounded-2xl bg-surface-alt/40">
              <input
                type="checkbox"
                id="share_location"
                checked={shareLocation}
                onChange={(e) => setShareLocation(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-primary cursor-pointer"
              />
              <label htmlFor="share_location" className="text-xs font-medium text-text cursor-pointer leading-relaxed">
                Share my live GPS coordinates with the house holder for route directions and house verification.
              </label>
            </div>

            <BoxButton
              type="submit"
              size="lg"
              variant="primary"
              disabled={submitting}
              className="w-full text-center shadow-md font-semibold"
            >
              {submitting ? 'Submitting Booking...' : 'Confirm & Submit Booking'}
            </BoxButton>
          </form>
        </BoxCard>
      </div>
    </div>
  );
}
