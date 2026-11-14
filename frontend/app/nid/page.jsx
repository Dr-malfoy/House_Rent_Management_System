'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import BoxCard from '@/components/ui/BoxCard';
import BoxButton from '@/components/ui/BoxButton';
import BoxInput from '@/components/ui/BoxInput';
import BoxBadge from '@/components/ui/BoxBadge';
import Skeleton from '@/components/ui/Skeleton';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Upload,
  FileText,
  UserCheck,
} from 'lucide-react';

export default function NidVerificationPage() {
  const router = useRouter();
  const { user, refreshUser, isLoading: authLoading } = useAuth();

  const [nidInfo, setNidInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [nidNumber, setNidNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [fatherMotherName, setFatherMotherName] = useState('');
  const [frontImageUrl, setFrontImageUrl] = useState('/uploads/nid/nid_user_front.jpg');
  const [backImageUrl, setBackImageUrl] = useState('/uploads/nid/nid_user_back.jpg');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=/nid');
      return;
    }

    if (user) {
      setFullName(user.full_name || '');
      api.get('/nid/me')
        .then((res) => {
          if (res?.success && res.data) {
            setNidInfo(res.data);
            if (res.data.full_name) setFullName(res.data.full_name);
            if (res.data.nid_number) setNidNumber(res.data.nid_number);
            if (res.data.date_of_birth) setDateOfBirth(res.data.date_of_birth.split('T')[0]);
            if (res.data.address) setAddress(res.data.address);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !nidNumber || !dateOfBirth || !address) {
      setError('Please provide all mandatory fields.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        full_name: fullName,
        nid_number: nidNumber,
        date_of_birth: dateOfBirth,
        address,
        father_mother_name: fatherMotherName,
        front_image_url: frontImageUrl,
        back_image_url: backImageUrl,
      };

      const res = await api.post('/nid', payload);
      if (res?.success) {
        setSuccess(true);
        await refreshUser();
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError(res?.message || 'Submission failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit NID');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
        <Skeleton className="w-1/3 h-8 rounded-xl" />
        <Skeleton className="w-full h-80 rounded-2xl" />
      </div>
    );
  }

  const status = nidInfo?.status || user?.nid_status || 'not_submitted';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Heading */}
      <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-[#57BA29]" />
            <span>National ID (NID) Verification</span>
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Required for both house holders and users before posting or booking houses.
          </p>
        </div>

        <BoxBadge
          variant={
            status === 'verified'
              ? 'success'
              : status === 'pending'
              ? 'warning'
              : status === 'rejected'
              ? 'danger'
              : 'neutral'
          }
          size="md"
        >
          Status: {status}
        </BoxBadge>
      </div>

      {/* Status Notice Banner */}
      {status === 'verified' ? (
        <BoxCard className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-[#57BA29]" />
            <span>Your National ID is Verified</span>
          </div>
          <p className="text-xs sm:text-sm text-text-muted">
            You are an authorized, verified member of Smart House Rent. You can freely post houses and submit rental bookings across the platform.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs font-mono font-bold text-text">
            <span>Verified NID:</span>
            <span className="bg-white dark:bg-zinc-800 px-3 py-1 border border-border rounded-xl">
              {nidInfo?.masked_nid_number || '1990********0001'}
            </span>
          </div>
        </BoxCard>
      ) : status === 'pending' ? (
        <BoxCard className="p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
            <Clock className="w-5 h-5" />
            <span>NID Verification Under Review</span>
          </div>
          <p className="text-xs sm:text-sm text-text-muted">
            Your documents have been submitted to administration. Reviews typically conclude within 24 hours. You will receive an instant notification once confirmed.
          </p>
        </BoxCard>
      ) : status === 'rejected' ? (
        <BoxCard className="p-6 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>Verification Rejected</span>
          </div>
          <p className="text-xs sm:text-sm text-text-muted">
            Rejection Reason: <span className="font-bold text-text">{nidInfo?.rejection_reason || 'Document blurriness or mismatch.'}</span>
          </p>
          <p className="text-xs sm:text-sm text-text-muted">
            Please correct the information and re-submit your valid government National ID.
          </p>
        </BoxCard>
      ) : null}

      {/* Form (only shown if not verified or rejected/not_submitted) */}
      {status !== 'verified' && (
        <BoxCard className="p-6 sm:p-8 space-y-6 rounded-2xl shadow-sm">
          <h3 className="text-base font-bold text-text border-b border-border pb-3">
            Submit Government NID Details
          </h3>

          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-xl text-xs font-semibold text-danger">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#57BA29]" />
              <span>NID documents submitted successfully! Review status is now Pending.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <BoxInput
              label="Full Name (Exactly as written on NID)"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BoxInput
                label="National ID Number (10, 13, or 17 Digits)"
                required
                value={nidNumber}
                onChange={(e) => setNidNumber(e.target.value)}
              />

              <BoxInput
                label="Date of Birth (As per NID)"
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>

            <BoxInput
              label="Permanent / Current Address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <BoxInput
              label="Father / Mother Name (Optional)"
              value={fatherMotherName}
              onChange={(e) => setFatherMotherName(e.target.value)}
            />

            {/* Document photo URLs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <BoxInput
                label="NID Front Side Photo Path/URL"
                required
                value={frontImageUrl}
                onChange={(e) => setFrontImageUrl(e.target.value)}
                helperText="Upload or path to clear front photo"
              />

              <BoxInput
                label="NID Back Side Photo Path/URL"
                required
                value={backImageUrl}
                onChange={(e) => setBackImageUrl(e.target.value)}
                helperText="Upload or path to clear back photo"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#57BA29] hover:bg-[#479E1F] text-white font-semibold py-3.5 rounded-xl shadow-md shadow-[#57BA29]/25 hover:shadow-lg transition-all text-sm sm:text-base mt-4 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Submitting Documents...' : 'Submit NID for Verification'}
            </button>
          </form>
        </BoxCard>
      )}
    </div>
  );
}
