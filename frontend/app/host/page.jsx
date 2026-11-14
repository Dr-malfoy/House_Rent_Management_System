'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { formatBDT, formatDate } from '@/lib/utils';
import BoxCard from '@/components/ui/BoxCard';
import BoxButton from '@/components/ui/BoxButton';
import BoxBadge from '@/components/ui/BoxBadge';
import BoxModal from '@/components/ui/BoxModal';
import Skeleton from '@/components/ui/Skeleton';
import CountUp from '@/components/motion/CountUp';
import DirectionModal from '@/components/DirectionModal';
import {
  Building2,
  Users,
  Navigation,
  Edit,
  MapPin,
  ShieldCheck,
  PlusCircle,
  Check,
} from 'lucide-react';

export default function HouseHolderDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [houses, setHouses] = useState([]);
  const [activeBookers, setActiveBookers] = useState([]);
  const [selectedBookerHouse, setSelectedBookerHouse] = useState(null);
  const [bookersModalOpen, setBookersModalOpen] = useState(false);
  const [directionModalOpen, setDirectionModalOpen] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState(null);

  const loadHostData = async () => {
    try {
      const res = await api.get('/me/houses');
      if (res?.success) {
        setHouses(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load host houses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHostData();
  }, []);

  const handleOpenBookers = async (house) => {
    setSelectedBookerHouse(house);
    setBookersModalOpen(true);
    try {
      const res = await api.get(`/bookings/house/${house.id}`);
      if (res?.success) {
        setActiveBookers(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch bookers:', err);
    }
  };

  const handleCompleteDeal = async (houseId) => {
    if (!confirm('Mark deal complete? This house will be automatically hidden from public search.')) return;
    try {
      await api.patch(`/houses/${houseId}/deal-complete`);
      setHouses((prev) =>
        prev.map((h) => (h.id === houseId ? { ...h, status: 'deal_completed' } : h))
      );
      if (bookersModalOpen) {
        setBookersModalOpen(false);
      }
    } catch (err) {
      alert('Failed to complete deal: ' + err.message);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status });
      setActiveBookers((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
      );
      loadHostData();
    } catch (err) {
      alert('Failed to update booking status: ' + err.message);
    }
  };

  const openDirection = (bookingId) => {
    setActiveBookingId(bookingId);
    setDirectionModalOpen(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Skeleton className="w-1/3 h-10 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="w-full h-80 rounded-3xl" />
      </div>
    );
  }

  // Compute stat metrics
  const totalPosts = houses.length;
  const activePosts = houses.filter((h) => h.status === 'approved').length;
  const totalBookings = houses.reduce((acc, h) => acc + (parseInt(h.total_bookings, 10) || 0), 0);
  const completedDeals = houses.filter((h) => h.status === 'deal_completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-[#57BA29]" />
            <span>House Holder Portal</span>
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Manage your properties, inspect booker applications, view GPS routes, and complete rental deals.
          </p>
        </div>

        <Link href="/post">
          <button
            type="button"
            className="inline-flex items-center gap-2 bg-[#57BA29] hover:bg-[#479E1F] text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm shadow-[#57BA29]/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post a House</span>
          </button>
        </Link>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <BoxCard className="p-4 text-center space-y-1 rounded-2xl bg-surface border border-border shadow-sm">
          <span className="text-xs font-medium text-text-muted block">Total Posts</span>
          <span className="text-3xl font-bold text-text">
            <CountUp end={totalPosts} />
          </span>
        </BoxCard>

        <BoxCard className="p-4 text-center space-y-1 rounded-2xl bg-surface border border-border shadow-sm">
          <span className="text-xs font-medium text-text-muted block">Active Public Posts</span>
          <span className="text-3xl font-bold text-[#57BA29]">
            <CountUp end={activePosts} />
          </span>
        </BoxCard>

        <BoxCard className="p-4 text-center space-y-1 rounded-2xl bg-surface border border-border shadow-sm">
          <span className="text-xs font-medium text-text-muted block">Total Bookings</span>
          <span className="text-3xl font-bold text-amber-500">
            <CountUp end={totalBookings} />
          </span>
        </BoxCard>

        <BoxCard className="p-4 text-center space-y-1 rounded-2xl bg-surface border border-border shadow-sm">
          <span className="text-xs font-medium text-text-muted block">Completed Deals</span>
          <span className="text-3xl font-bold text-[#57BA29]">
            <CountUp end={completedDeals} />
          </span>
        </BoxCard>
      </div>

      {/* Posted Houses Table / Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-lg font-bold text-text">
            My Posted Houses ({houses.length})
          </h2>
          <span className="text-xs font-medium text-text-muted">
            Click 'Bookers' to view applicants & routes
          </span>
        </div>

        {houses.length === 0 ? (
          <BoxCard className="p-12 text-center space-y-4 border border-dashed border-border rounded-3xl bg-surface-alt/30">
            <Building2 className="w-12 h-12 text-text-muted mx-auto" />
            <h3 className="text-base font-semibold text-text">No Houses Posted Yet</h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              You haven't listed any houses yet. Click below to post your flat with map pin location.
            </p>
            <Link href="/post">
              <button
                type="button"
                className="bg-[#57BA29] hover:bg-[#479E1F] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                Post Your First House
              </button>
            </Link>
          </BoxCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {houses.map((house) => {
              const isDealCompleted = house.status === 'deal_completed';

              return (
                <BoxCard key={house.id} className="p-5 flex flex-col justify-between gap-4 rounded-3xl bg-surface border border-border shadow-sm">
                  <div className="space-y-3">
                    {/* Thumbnail & Badges */}
                    <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-zinc-950">
                      <Image
                        src={house.cover_image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600'}
                        alt={house.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                        <BoxBadge
                          size="sm"
                          variant={
                            isDealCompleted
                              ? 'neutral'
                              : house.status === 'approved'
                              ? 'success'
                              : 'warning'
                          }
                        >
                          {isDealCompleted ? 'Deal Complete' : house.status}
                        </BoxBadge>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-text line-clamp-1">
                        {house.title}
                      </h3>
                      <p className="text-xs text-text-muted flex items-center gap-1 mt-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#57BA29] shrink-0" />
                        <span>{house.address_text || house.area_name}</span>
                      </p>
                      <p className="text-base font-bold text-[#57BA29] mt-2">
                        {formatBDT(house.rent_amount)} <span className="text-xs font-normal text-text-muted">/ mo</span>
                      </p>
                    </div>

                    {/* Bookers & Specs */}
                    <div className="p-2.5 bg-surface-alt/60 border border-border/80 rounded-xl flex items-center justify-between text-xs font-medium text-text-muted">
                      <span>Bookers: <strong className="text-text">{house.total_bookings || 0}</strong></span>
                      {house.pending_bookings > 0 && (
                        <span className="text-amber-500 font-semibold">({house.pending_bookings} pending)</span>
                      )}
                      <span>{house.bedrooms}b / {house.bathrooms}ba</span>
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex flex-col gap-2 pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      {/* View Bookers Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenBookers(house)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#57BA29] hover:bg-[#479E1F] text-white py-2 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Bookers ({house.total_bookings || 0})</span>
                      </button>

                      {/* Edit Button */}
                      <Link href={`/post/${house.id}/edit`}>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-border rounded-xl text-xs font-medium hover:bg-surface-alt transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5 text-text-muted" />
                          <span>Edit</span>
                        </button>
                      </Link>
                    </div>

                    {/* Deal Complete Button */}
                    {!isDealCompleted ? (
                      <button
                        type="button"
                        onClick={() => handleCompleteDeal(house.id)}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Deal Complete (Hide from Search)</span>
                      </button>
                    ) : (
                      <div className="p-2 bg-surface-alt border border-border rounded-xl text-center text-xs font-medium text-text-muted">
                        Deal Completed
                      </div>
                    )}
                  </div>
                </BoxCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Bookers Inspection Modal */}
      {bookersModalOpen && (
        <BoxModal
          isOpen={bookersModalOpen}
          onClose={() => setBookersModalOpen(false)}
          title={`Bookers for: ${selectedBookerHouse?.title}`}
          maxWidth="max-w-3xl"
        >
          {activeBookers.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Users className="w-10 h-10 text-text-muted mx-auto" />
              <p className="text-xs font-medium text-text-muted">No bookings received yet for this house.</p>
            </div>
          ) : (
            <div className="space-y-4 divide-y divide-border">
              {activeBookers.map((b) => (
                <div key={b.id} className="pt-4 first:pt-0 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-text">{b.booker_name}</h4>
                        <BoxBadge size="sm" variant={b.booker_nid_status === 'verified' ? 'success' : 'neutral'}>
                          <ShieldCheck className="w-3 h-3" /> NID Verified
                        </BoxBadge>
                        <BoxBadge
                          size="sm"
                          variant={
                            b.status === 'confirmed'
                              ? 'success'
                              : b.status === 'deal_completed'
                              ? 'neutral'
                              : 'warning'
                          }
                        >
                          {b.status}
                        </BoxBadge>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">
                        {b.booker_phone} • {b.booker_email}
                      </p>
                    </div>

                    {/* Direction Button */}
                    {b.share_location && b.booker_lat && b.booker_lng ? (
                      <button
                        type="button"
                        onClick={() => openDirection(b.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#57BA29] hover:bg-[#479E1F] text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Direction</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-medium text-text-muted bg-surface-alt px-2.5 py-1 rounded-xl border border-border">
                        Location not shared
                      </span>
                    )}
                  </div>

                  {/* Booker Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-surface-alt/50 p-3 rounded-xl border border-border/60">
                    <div>Members: <span className="font-semibold text-text">{b.members}</span></div>
                    <div>Move-in: <span className="font-semibold text-text">{formatDate(b.move_in_date)}</span></div>
                    <div>Applied: <span className="font-semibold text-text">{formatDate(b.created_at)}</span></div>
                    <div>Occupation: <span className="font-semibold text-text">{b.booker_occupation || 'Private'}</span></div>
                  </div>

                  {b.message && (
                    <div className="p-3 bg-surface border border-border rounded-xl text-xs text-text-muted italic">
                      "{b.message}"
                    </div>
                  )}

                  {/* Status Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    {b.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                          className="px-3.5 py-1.5 bg-[#57BA29] text-white rounded-xl text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                        >
                          Confirm Booking
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                          className="px-3.5 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold hover:bg-rose-100 transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {b.status === 'confirmed' && (
                      <button
                        type="button"
                        onClick={() => handleCompleteDeal(b.house_id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                      >
                        Finalize & Deal Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </BoxModal>
      )}

      {/* Direction Route Modal */}
      {directionModalOpen && (
        <DirectionModal
          isOpen={directionModalOpen}
          onClose={() => setDirectionModalOpen(false)}
          bookingId={activeBookingId}
        />
      )}
    </div>
  );
}
