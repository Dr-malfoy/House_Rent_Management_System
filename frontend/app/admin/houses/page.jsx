'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminNav from '@/components/AdminNav';
import BoxCard from '@/components/ui/BoxCard';
import BoxBadge from '@/components/ui/BoxBadge';
import BoxTable from '@/components/ui/BoxTable';
import Skeleton from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { formatBDT, formatDate } from '@/lib/utils';
import {
  Building2,
  Check,
  X,
  Sparkles,
  Trash2,
  ExternalLink,
  MapPin,
  Search,
  CheckCircle2,
} from 'lucide-react';

export default function AdminHousesPage() {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [promoMessage, setPromoMessage] = useState('');

  const fetchHouses = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (statusFilter === 'promoted') {
        q.set('is_featured', '1');
      } else if (statusFilter && statusFilter !== 'all') {
        q.set('status', statusFilter);
      }
      if (search) q.set('search', search);

      const res = await api.get(`/admin/houses?${q.toString()}`);
      if (res?.success) {
        setHouses(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch houses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouses();
  }, [statusFilter]);

  const handleReview = async (houseId, action) => {
    const reason = action === 'reject' ? prompt('Reason for rejection:') : null;
    if (action === 'reject' && !reason) return;

    try {
      await api.patch(`/admin/houses/${houseId}/review`, { action, reason });
      fetchHouses();
    } catch (err) {
      alert('Action failed: ' + err.message);
    }
  };

  const handleToggleFeatured = async (houseId) => {
    try {
      const res = await api.patch(`/admin/houses/${houseId}/featured`);
      if (res?.success) {
        setPromoMessage(res.message || 'Promotion status updated for Hero section.');
        setTimeout(() => setPromoMessage(''), 3500);
      }
      fetchHouses();
    } catch (err) {
      alert('Toggle promotion failed: ' + err.message);
    }
  };

  const handleDelete = async (houseId) => {
    if (!confirm('Are you sure you want to permanently delete this house listing?')) return;
    try {
      await api.delete(`/admin/houses/${houseId}`);
      fetchHouses();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen pb-16">
        <AdminNav />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header */}
          <div className="border-b border-border pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text flex items-center gap-2.5">
                <Building2 className="w-7 h-7 text-[#57BA29]" />
                <span>Property Listings & Paid Promotions</span>
              </h1>
              <p className="text-xs sm:text-sm text-text-muted mt-1">
                Control which houses are featured in the <strong>Homepage Hero Showcase</strong> as Paid Promotions, review submissions, and manage listings.
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search houses or owners..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchHouses()}
                className="bg-surface border border-border text-text px-3.5 py-2 text-xs font-medium rounded-xl outline-none focus:border-[#57BA29] focus:ring-2 focus:ring-[#57BA29]/20 shadow-sm"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-surface border border-border text-text px-3.5 py-2 text-xs font-semibold rounded-xl outline-none focus:border-[#57BA29] focus:ring-2 focus:ring-[#57BA29]/20 shadow-sm cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="promoted">★ Promoted in Hero</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="deal_completed">Deal Completed</option>
              </select>
            </div>
          </div>

          {/* Promotion Confirmation Banner */}
          {promoMessage && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#57BA29]" />
              <span>{promoMessage}</span>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <Skeleton className="w-full h-96 rounded-2xl" />
          ) : (
            <BoxTable headers={['Property', 'Owner', 'Rent', 'Status', 'Hero Paid Promotion', 'Actions']}>
              {houses.map((h) => {
                const isApproved = h.status === 'approved';
                const isPending = h.status === 'pending';

                return (
                  <tr key={h.id} className="hover:bg-surface-alt/50 transition-colors">
                    <td className="px-4 py-3 border-r border-border/60">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-black/5">
                          <Image src={h.cover_image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200'} alt={h.title} fill className="object-cover" />
                        </div>
                        <div>
                          <Link href={`/houses/${h.id}`} className="font-semibold text-text hover:text-[#57BA29] transition-colors line-clamp-1">
                            {h.title}
                          </Link>
                          <div className="text-[11px] text-text-muted flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#57BA29]" />
                            <span>{h.area_name}, {h.district}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 border-r border-border/60">
                      <div className="font-semibold text-text">{h.landlord_name}</div>
                      <div className="text-[11px] text-text-muted">{h.landlord_phone}</div>
                    </td>

                    <td className="px-4 py-3 border-r border-border/60 font-bold text-[#57BA29]">
                      {formatBDT(h.rent_amount)}
                    </td>

                    <td className="px-4 py-3 border-r border-border/60">
                      <BoxBadge
                        size="sm"
                        variant={
                          h.status === 'approved'
                            ? 'success'
                            : h.status === 'pending'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {h.status}
                      </BoxBadge>
                    </td>

                    {/* Paid Promotion Control Button */}
                    <td className="px-4 py-3 border-r border-border/60">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(h.id)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                          h.is_featured
                            ? 'bg-[#57BA29] text-white border-[#57BA29] shadow-md shadow-[#57BA29]/25 hover:bg-[#479E1F]'
                            : 'bg-surface text-text-muted border-border hover:bg-surface-alt hover:text-text'
                        }`}
                        title="Click to toggle Paid Promotion in Homepage Hero Showcase"
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${h.is_featured ? 'fill-white' : ''}`} />
                        <span>{h.is_featured ? '★ Promoted in Hero' : '+ Promote to Hero'}</span>
                      </button>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isPending && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleReview(h.id, 'approve')}
                              className="py-1 px-3 text-xs bg-[#57BA29] hover:bg-[#479E1F] text-white font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReview(h.id, 'reject')}
                              className="py-1 px-3 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDelete(h.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </BoxTable>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
