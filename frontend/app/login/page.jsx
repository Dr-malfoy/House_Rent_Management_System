'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import BoxCard from '@/components/ui/BoxCard';
import BoxButton from '@/components/ui/BoxButton';
import BoxInput from '@/components/ui/BoxInput';
import Skeleton from '@/components/ui/Skeleton';
import { Building2, AlertCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams ? searchParams.get('redirect') : null;

  const { login, user, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && user) {
      if (redirect) {
        router.replace(redirect);
      } else if (user.role === 'admin') {
        router.replace('/admin');
      } else if (user.role === 'house_holder') {
        router.replace('/host');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, isLoading, router, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email/phone and password.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await login(email, password);
      if (res?.success) {
        const u = res.user;
        if (redirect) {
          router.replace(redirect);
        } else if (u.role === 'admin') {
          router.replace('/admin');
        } else if (u.role === 'house_holder') {
          router.replace('/host');
        } else {
          router.replace('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-[#57BA29] text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-[#57BA29]/25">
          <Building2 className="w-6 h-6 stroke-[2.2]" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-text">
          Sign In to Smart<span className="text-[#57BA29]">Rent</span>
        </h1>
        <p className="text-xs text-text-muted">
          Access your bookings, house holder tools, or admin dashboard.
        </p>
      </div>

      {/* Demo Seed Credentials Hint */}
      <div className="p-4 bg-surface-alt/60 border border-border rounded-2xl text-xs font-medium text-text space-y-1.5 shadow-sm">
        <p className="text-[#57BA29] font-semibold text-xs">Demo Accounts (Password: Password123!):</p>
        <div className="flex flex-wrap gap-2 text-text-muted text-[11px]">
          <span className="bg-surface px-2 py-0.5 border border-border rounded-lg">admin@smarthouse.com</span>
          <span className="bg-surface px-2 py-0.5 border border-border rounded-lg">landlord1@smarthouse.com</span>
          <span className="bg-surface px-2 py-0.5 border border-border rounded-lg">user1@smarthouse.com</span>
        </div>
      </div>

      {/* Form Card */}
      <BoxCard className="p-6 sm:p-8 space-y-5 rounded-3xl border border-border bg-surface shadow-xl">
        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-medium text-danger rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <BoxInput
            label="Email or Phone Number"
            type="text"
            required
            placeholder="e.g. user1@smarthouse.com or +88017..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <BoxInput
            label="Password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-text">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded accent-[#57BA29] cursor-pointer w-4 h-4"
              />
              <span>Remember me</span>
            </label>

            <span className="text-text-muted hover:text-[#57BA29] transition-colors cursor-pointer font-medium">
              Forgot password?
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#57BA29] hover:bg-[#479E1F] text-white font-semibold py-3 rounded-xl shadow-md shadow-[#57BA29]/25 hover:shadow-lg transition-all text-sm disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-3 border-t border-border text-xs text-text-muted">
          Don't have an account yet?{' '}
          <Link href="/register" className="font-semibold text-[#57BA29] hover:underline">
            Register Now &rarr;
          </Link>
        </div>
      </BoxCard>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<Skeleton className="w-full max-w-md h-96 rounded-3xl" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
