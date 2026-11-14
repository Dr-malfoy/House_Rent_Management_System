'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminNav from '@/components/AdminNav';
import BoxCard from '@/components/ui/BoxCard';
import BoxButton from '@/components/ui/BoxButton';
import BoxBadge from '@/components/ui/BoxBadge';
import CountUp from '@/components/motion/CountUp';
import Skeleton from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import {
  Users,
  ShieldCheck,
  Building2,
  Clock,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then((res) => {
        if (res?.success && res.data) {
          setStats(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load admin stats:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen pb-16">
        <AdminNav />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
              System Operations Overview
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              Real-time platform statistics for users, spatial property listings, NID queues, and feedback.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Stat 1: Total Users */}
              <BoxCard className="p-5 space-y-2 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-muted">Total Users</span>
                  <div className="w-8 h-8 rounded-xl bg-[#E6F5DD] text-[#57BA29] flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-text">
                  <CountUp end={stats?.users?.total_users || 0} />
                </div>
                <div className="text-xs text-text-muted flex items-center justify-between pt-2 border-t border-border">
                  <span>House Holders: {stats?.users?.total_house_holders || 0}</span>
                  <span className="text-danger font-medium">Banned: {stats?.users?.banned_users || 0}</span>
                </div>
              </BoxCard>

              {/* Stat 2: Pending NIDs */}
              <BoxCard className="p-5 space-y-2 rounded-2xl shadow-sm border-amber-200 dark:border-amber-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-muted">Pending NID Queue</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
                  <CountUp end={stats?.users?.pending_nids || 0} />
                </div>
                <div className="text-xs text-text-muted flex items-center justify-between pt-2 border-t border-border">
                  <span>Verified: {stats?.users?.verified_nids || 0}</span>
                  <Link href="/admin/nid" className="font-semibold text-[#57BA29] hover:underline">Review &rarr;</Link>
                </div>
              </BoxCard>

              {/* Stat 3: Total Houses */}
              <BoxCard className="p-5 space-y-2 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-muted">Total Houses</span>
                  <div className="w-8 h-8 rounded-xl bg-[#E6F5DD] text-[#57BA29] flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-text">
                  <CountUp end={stats?.houses?.total_houses || 0} />
                </div>
                <div className="text-xs text-text-muted flex items-center justify-between pt-2 border-t border-border">
                  <span>Approved: {stats?.houses?.approved_houses || 0}</span>
                  <span className="text-amber-600 font-medium">Pending: {stats?.houses?.pending_houses || 0}</span>
                </div>
              </BoxCard>

              {/* Stat 4: Completed Deals */}
              <BoxCard className="p-5 space-y-2 rounded-2xl shadow-sm border-emerald-200 dark:border-emerald-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-muted">Completed Deals</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  <CountUp end={stats?.houses?.deal_completed_houses || 0} />
                </div>
                <div className="text-xs text-text-muted flex items-center justify-between pt-2 border-t border-border">
                  <span>Featured: {stats?.houses?.featured_houses || 0}</span>
                  <span>Bookings: {stats?.bookings?.total_bookings || 0}</span>
                </div>
              </BoxCard>
            </div>
          )}

          {/* Quick Management Panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <BoxCard className="space-y-3 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-text">NID Verification</h3>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Review pending applicant identity documents, inspect front/back photos, and verify or reject.
              </p>
              <Link href="/admin/nid" className="block pt-2">
                <button
                  type="button"
                  className="w-full bg-[#57BA29] hover:bg-[#479E1F] text-white py-2.5 rounded-xl font-semibold text-xs shadow-md shadow-[#57BA29]/25 hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Open Verification Queue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </BoxCard>

            <BoxCard className="space-y-3 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E6F5DD] dark:bg-[#1E3314] text-[#57BA29] flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-text">House Approvals</h3>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Approve newly posted listings, toggle featured spotlights for the home carousel, or delete spam.
              </p>
              <Link href="/admin/houses" className="block pt-2">
                <button
                  type="button"
                  className="w-full bg-[#57BA29] hover:bg-[#479E1F] text-white py-2.5 rounded-xl font-semibold text-xs shadow-md shadow-[#57BA29]/25 hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Manage Listings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </BoxCard>

            <BoxCard className="space-y-3 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800 text-text flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-text">Feedback Inbox</h3>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Respond to tenancy grievances, user complaints, and suggestions. Replies notify users directly.
              </p>
              <Link href="/admin/feedback" className="block pt-2">
                <button
                  type="button"
                  className="w-full bg-surface border border-border text-text hover:bg-surface-alt py-2.5 rounded-xl font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>View Feedback</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </BoxCard>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
