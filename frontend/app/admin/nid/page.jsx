'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminNav from '@/components/AdminNav';
import BoxCard from '@/components/ui/BoxCard';
import BoxBadge from '@/components/ui/BoxBadge';
import BoxModal from '@/components/ui/BoxModal';
import Skeleton from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  ShieldCheck,
  Check,
  X,
  Eye,
  Calendar,
  MapPin,
  Clock,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';

export default function AdminNidVerificationPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedNid, setSelectedNid] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchNids = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/nid/admin?status=${statusFilter}`);
      if (res?.success && res.data) {
        setSubmissions(res.data.submissions || []);
      }
    } catch (err) {
      console.error('Failed to load NID queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNids();
  }, [statusFilter]);

  const handleReviewAction = async (action) => {
    if (action === 'reject' && !rejectionReason.trim()) {
      alert('Please specify a rejection reason so the applicant knows what to fix.');
      return;
    }

    if (!confirm(`Are you sure you want to ${action.toUpperCase()} this NID verification?`)) {
      return;
    }

    setIsProcessing(true);
    try {
      await api.patch(`/nid/admin/${selectedNid.id}/review`, {
        action,
        reason: rejectionReason.trim(),
      });
      setReviewModalOpen(false);
      setRejectionReason('');
      fetchNids();
    } catch (err) {
      alert('Review action failed: ' + err.message);
    } finally {
      setIsProcessing(false);
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
                <ShieldCheck className="w-7 h-7 text-[#57BA29]" />
                <span>National ID Verification Review</span>
              </h1>
              <p className="text-xs sm:text-sm text-text-muted mt-1">
                Inspect government National IDs, verify authentic citizen credentials, or reject blurry documents.
              </p>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-1 border border-border rounded-xl bg-surface p-1 shadow-sm">
              {['pending', 'verified', 'rejected', 'all'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-[#57BA29] text-white shadow-sm'
                      : 'text-text-muted hover:text-text hover:bg-surface-alt'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Queue Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-2xl" />
              ))}
            </div>
          ) : submissions.length === 0 ? (
            <BoxCard className="p-12 text-center space-y-3 bg-surface-alt/40 border-dashed rounded-2xl">
              <ShieldCheck className="w-12 h-12 text-[#57BA29] mx-auto" />
              <h3 className="text-base font-bold text-text">No Submissions in this Queue</h3>
              <p className="text-xs text-text-muted">All National ID applications have been reviewed.</p>
            </BoxCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {submissions.map((nid) => (
                <BoxCard key={nid.id} className="p-5 sm:p-6 space-y-4 rounded-2xl shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-text">{nid.full_name}</h3>
                        <BoxBadge
                          size="sm"
                          variant={
                            nid.status === 'verified'
                              ? 'success'
                              : nid.status === 'pending'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {nid.status}
                        </BoxBadge>
                      </div>
                      <p className="text-xs text-text-muted font-medium mt-0.5">{nid.email} • {nid.phone}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedNid(nid);
                        setReviewModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 bg-[#57BA29] hover:bg-[#479E1F] text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-surface-alt p-3.5 rounded-xl border border-border">
                    <div>NID: <strong className="text-text font-mono">{nid.nid_number}</strong></div>
                    <div>DOB: <strong className="text-text">{formatDate(nid.date_of_birth)}</strong></div>
                    <div className="col-span-2">Address: <strong className="text-text">{nid.address}</strong></div>
                    <div className="col-span-2 text-[11px] text-text-muted">Submitted: {formatDate(nid.submitted_at)}</div>
                  </div>
                </BoxCard>
              ))}
            </div>
          )}

          {/* Side-by-Side Review Modal */}
          {reviewModalOpen && selectedNid && (
            <BoxModal
              isOpen={reviewModalOpen}
              onClose={() => setReviewModalOpen(false)}
              title={`Review NID: ${selectedNid.full_name}`}
              maxWidth="max-w-4xl"
            >
              <div className="space-y-6">
                {/* Information Header */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-surface-alt border border-border rounded-xl text-xs font-medium">
                  <div>Full Name: <span className="text-text font-bold block">{selectedNid.full_name}</span></div>
                  <div>NID Number: <span className="text-text font-bold font-mono block">{selectedNid.nid_number}</span></div>
                  <div>Date of Birth: <span className="text-text font-bold block">{formatDate(selectedNid.date_of_birth)}</span></div>
                  <div>Role: <span className="text-text font-bold uppercase block">{selectedNid.role}</span></div>
                </div>

                {/* Documents Display */}
                <div>
                  <h4 className="text-xs font-bold text-text mb-2.5">
                    Submitted Document Photos (Front & Back)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-border rounded-2xl overflow-hidden p-3 bg-surface text-center space-y-2">
                      <span className="text-xs font-semibold text-text-muted block">Front Side</span>
                      <div className="relative w-full h-48 bg-black/5 dark:bg-white/5 border border-border rounded-xl flex items-center justify-center">
                        <span className="text-xs font-mono text-text font-semibold">
                          [Government NID Document Front]
                        </span>
                      </div>
                    </div>

                    <div className="border border-border rounded-2xl overflow-hidden p-3 bg-surface text-center space-y-2">
                      <span className="text-xs font-semibold text-text-muted block">Back Side</span>
                      <div className="relative w-full h-48 bg-black/5 dark:bg-white/5 border border-border rounded-xl flex items-center justify-center">
                        <span className="text-xs font-mono text-text font-semibold">
                          [Government NID Document Back]
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="p-4 border border-border rounded-2xl bg-surface-alt space-y-3">
                  <h4 className="text-xs font-bold text-text">Review Decision</h4>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleReviewAction('confirm')}
                      className="flex-1 bg-[#57BA29] hover:bg-[#479E1F] text-white py-2.5 rounded-xl font-semibold text-xs shadow-md shadow-[#57BA29]/25 hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Confirm & Verify NID</span>
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleReviewAction('reject')}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <X className="w-4 h-4 stroke-[3]" />
                      <span>Reject Application</span>
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-muted block mb-1">
                      Rejection Reason (Required only if rejecting)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Photo unreadable, name mismatch with NID card..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full bg-surface border border-border text-text px-3 py-2 text-xs font-medium rounded-xl outline-none focus:border-[#57BA29] focus:ring-2 focus:ring-[#57BA29]/20"
                    />
                  </div>
                </div>
              </div>
            </BoxModal>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
