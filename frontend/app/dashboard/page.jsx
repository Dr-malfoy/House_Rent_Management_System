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
import CountUp from '@/components/motion/CountUp';
import Skeleton from '@/components/ui/Skeleton';
import DirectionModal from '@/components/DirectionModal';
import {
  User,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Heart,
  Bell,
  ShieldCheck,
  AlertTriangle,
  PlusCircle,
  Edit,
  Navigation,
  Check,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export default function UserDashboard() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myBookings, setMyBookings] = useState([]);
  const [myPostedHouses, setMyPostedHouses] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [directionModalOpen, setDirectionModalOpen] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [bookingsRes, postedRes, favsRes, notifsRes] = await Promise.all([
          api.get('/bookings/my'),
          api.get('/me/houses'),
          api.get('/favorites'),
          api.get('/notifications'),
        ]);

        if (bookingsRes?.success) setMyBookings(bookingsRes.data || []);
        if (postedRes?.success) setMyPostedHouses(postedRes.data || []);
        if (favsRes?.success) setFavorites(favsRes.data || []);
        if (notifsRes?.success) setNotifications(notifsRes.data?.notifications || []);
      } catch (err) {
        console.error('Failed to load user dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const handleCompleteDeal = async (houseId) => {
    if (!confirm('Mark deal complete? This house will be removed from public search and marked completed.')) return;
    try {
      await api.patch(`/houses/${houseId}/deal-complete`);
      setMyPostedHouses((prev) =>
        prev.map((h) => (h.id === houseId ? { ...h, status: 'deal_completed' } : h))
      );
    } catch (err) {
      alert('Could not complete deal: ' + err.message);
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

  const hasPostedHouses = myPostedHouses.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Profile & Welcome Bento Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <BoxCard className="lg:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 sm:p-8 bg-surface border border-border rounded-3xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#E6F5DD] text-[#57BA29] flex items-center justify-center font-bold text-2xl shadow-sm">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
                  {user?.full_name}
                </h1>
                <BoxBadge size="sm" variant={user?.role === 'admin' ? 'featured' : 'primary'}>
                  {user?.role}
                </BoxBadge>
              </div>
              <p className="text-xs text-text-muted mt-1">{user?.email} • {user?.phone}</p>
              <div className="flex items-center gap-2 mt-2.5">
                <BoxBadge
                  size="sm"
                  variant={
                    user?.nid_status === 'verified'
                      ? 'success'
                      : user?.nid_status === 'pending'
                      ? 'warning'
                      : 'danger'
                  }
                >
                  <ShieldCheck className="w-3 h-3" />
                  NID: {user?.nid_status}
                </BoxBadge>
                {user?.nid_status !== 'verified' && (
                  <Link href="/nid" className="text-xs font-semibold text-[#57BA29] hover:underline">
                    Verify NID Now &rarr;
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
            <Link href="/post" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#57BA29] hover:bg-[#479E1F] text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-sm shadow-[#57BA29]/20 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post a House</span>
              </button>
            </Link>
            <Link href="/host" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-surface border border-border text-text hover:bg-surface-alt px-4 py-2.5 rounded-xl font-semibold text-xs shadow-sm transition-all cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-text-muted" />
                <span>Host Portal</span>
              </button>
            </Link>
          </div>
        </BoxCard>

        {/* Quick Stats Bento */}
        <div className="grid grid-cols-2 gap-3">
          <BoxCard className="p-4 text-center flex flex-col justify-center rounded-2xl bg-surface border border-border shadow-sm">
            <span className="text-xs font-medium text-text-muted">My Bookings</span>
            <span className="text-2xl font-bold text-[#57BA29] mt-1">
              <CountUp end={myBookings.length} />
            </span>
          </BoxCard>
          <BoxCard className="p-4 text-center flex flex-col justify-center rounded-2xl bg-surface border border-border shadow-sm">
            <span className="text-xs font-medium text-text-muted">Posted Houses</span>
            <span className="text-2xl font-bold text-text mt-1">
              <CountUp end={myPostedHouses.length} />
            </span>
          </BoxCard>
          <BoxCard className="p-4 text-center flex flex-col justify-center rounded-2xl bg-surface border border-border shadow-sm">
            <span className="text-xs font-medium text-text-muted">Favorites</span>
            <span className="text-2xl font-bold text-text mt-1">
              <CountUp end={favorites.length} />
            </span>
          </BoxCard>
          <BoxCard className="p-4 text-center flex flex-col justify-center rounded-2xl bg-surface border border-border shadow-sm">
            <span className="text-xs font-medium text-text-muted">Notifications</span>
            <span className="text-2xl font-bold text-amber-500 mt-1">
              <CountUp end={notifications.filter((n) => !n.is_read).length} />
            </span>
          </BoxCard>
        </div>
      </div>

      {/* SECTION 1: Booked Houses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-lg font-bold text-text flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#57BA29]" />
            <span>My Booked Houses ({myBookings.length})</span>
          </h2>
          <Link href="/houses" className="text-xs font-semibold text-[#57BA29] hover:underline">
            Browse More Houses &rarr;
          </Link>
        </div>

        {myBookings.length === 0 ? (
          <BoxCard className="p-10 text-center space-y-3 bg-surface-alt/30 border border-dashed border-border rounded-3xl">
            <Calendar className="w-10 h-10 text-text-muted mx-auto" />
            <p className="text-xs font-medium text-text-muted">You have not submitted any bookings yet.</p>
            <Link href="/houses">
              <button
                type="button"
                className="bg-[#57BA29] text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-sm"
              >
                Explore Available Houses
              </button>
            </Link>
          </BoxCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myBookings.map((b) => (
              <BoxCard key={b.id} className="flex gap-4 p-4 rounded-2xl bg-surface border border-border shadow-sm hover:shadow-md transition-all">
                <div className="relative w-28 h-28 rounded-xl overflow-hidden shrink-0 bg-zinc-950">
                  <Image src={b.cover_image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400'} alt={b.house_title} fill className="object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <BoxBadge
                        size="sm"
                        variant={
                          b.status === 'confirmed'
                            ? 'success'
                            : b.status === 'deal_completed'
                            ? 'neutral'
                            : b.status === 'cancelled'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {b.status}
                      </BoxBadge>
                      <span className="text-[10px] text-text-muted">{formatDate(b.created_at)}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-text line-clamp-1">{b.house_title}</h4>
                    <p className="text-[11px] text-text-muted font-medium mt-0.5">{b.area_name}, {b.city}</p>
                    <p className="text-xs font-bold text-[#57BA29] mt-1">{formatBDT(b.rent_amount)}/mo</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px] font-medium">
                    <span>Move-in: {formatDate(b.move_in_date)}</span>
                    <Link href={`/houses/${b.house_id}`} className="text-[#57BA29] font-semibold hover:underline">
                      House Details &rarr;
                    </Link>
                  </div>
                </div>
              </BoxCard>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: Dual Role Capability - If user has posted houses */}
      {hasPostedHouses && (
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-lg font-bold text-text flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#57BA29]" />
                <span>My Property Postings & Booker Tools ({myPostedHouses.length})</span>
              </h2>
              <p className="text-xs text-text-muted">
                Manage your posted listings, view booker directions, and finalize completed deals.
              </p>
            </div>
            <Link href="/post">
              <button
                type="button"
                className="bg-[#57BA29] hover:bg-[#479E1F] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                + Post Another House
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myPostedHouses.map((h) => (
              <BoxCard key={h.id} className="p-4 space-y-3 rounded-2xl bg-surface border border-border shadow-sm">
                <div className="flex gap-3">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-zinc-950">
                    <Image src={h.cover_image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400'} alt={h.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <BoxBadge
                        size="sm"
                        variant={
                          h.status === 'approved'
                            ? 'success'
                            : h.status === 'deal_completed'
                            ? 'neutral'
                            : 'warning'
                        }
                      >
                        {h.status === 'deal_completed' ? 'Deal Completed' : h.status}
                      </BoxBadge>
                      <span className="text-xs font-bold text-[#57BA29]">{formatBDT(h.rent_amount)}/mo</span>
                    </div>
                    <h4 className="text-xs font-semibold text-text line-clamp-1">{h.title}</h4>
                    <p className="text-[11px] text-text-muted">{h.area_name}</p>
                    <div className="text-[11px] text-text-muted flex items-center gap-2 pt-1 font-medium">
                      <span>Bookings: {h.total_bookings}</span>
                      {h.pending_bookings > 0 && (
                        <span className="text-amber-500">({h.pending_bookings} new)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions row: Edit, Directions & Deal Complete */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
                  <Link href={`/post/${h.id}/edit`}>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-xl text-xs font-medium hover:bg-surface-alt transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                  </Link>

                  {h.status !== 'deal_completed' ? (
                    <button
                      type="button"
                      onClick={() => handleCompleteDeal(h.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Deal Complete
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-text-muted bg-surface-alt px-3 py-1 rounded-xl border border-border">
                      Deal Completed
                    </span>
                  )}
                </div>
              </BoxCard>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: Notifications & Admin Feedback Responses */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h2 className="text-lg font-bold text-text flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-500" />
          <span>Recent Notifications & Admin Responses</span>
        </h2>

        <BoxCard className="p-4 space-y-2 max-h-60 overflow-y-auto rounded-2xl bg-surface border border-border shadow-sm">
          {notifications.length === 0 ? (
            <p className="text-xs text-text-muted py-4 text-center">No notifications yet.</p>
          ) : (
            notifications.slice(0, 6).map((n) => (
              <div key={n.id} className="p-3 bg-surface-alt/60 border border-border/80 rounded-xl flex items-start justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-semibold text-text">{n.title}</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">{n.body}</p>
                </div>
                <span className="text-[10px] text-text-muted shrink-0">{formatDate(n.created_at)}</span>
              </div>
            ))
          )}
        </BoxCard>
      </div>

      {/* Direction Modal */}
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
