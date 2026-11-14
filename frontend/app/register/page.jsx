'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import BoxCard from '@/components/ui/BoxCard';
import BoxInput from '@/components/ui/BoxInput';
import { Building2, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState('user'); // 'user' or 'house_holder'
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!termsAgreed) {
      setError('You must agree to the platform safety and tenancy terms.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await register({
        full_name: fullName,
        email,
        phone,
        password,
        role: accountType,
      });

      if (res?.success) {
        if (accountType === 'house_holder') {
          router.replace('/host');
        } else {
          router.replace('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#57BA29] text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-[#57BA29]/25">
            <Building2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text">
            Create an Account
          </h1>
          <p className="text-xs text-text-muted">
            Join the smart house rent platform for Dhaka residents and house holders.
          </p>
        </div>

        <BoxCard className="p-6 sm:p-8 space-y-5 rounded-3xl border border-border bg-surface shadow-xl">
          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-medium text-danger rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Type Selector */}
            <div>
              <label className="text-xs font-semibold text-text block mb-1.5">
                I want to register as
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAccountType('user')}
                  className={`p-2.5 border rounded-xl text-xs font-semibold transition-all ${
                    accountType === 'user'
                      ? 'border-[#57BA29] bg-[#57BA29] text-white shadow-sm'
                      : 'border-border bg-surface text-text hover:bg-surface-alt'
                  }`}
                >
                  Tenant / User
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType('house_holder')}
                  className={`p-2.5 border rounded-xl text-xs font-semibold transition-all ${
                    accountType === 'house_holder'
                      ? 'border-[#57BA29] bg-[#57BA29] text-white shadow-sm'
                      : 'border-border bg-surface text-text hover:bg-surface-alt'
                  }`}
                >
                  House Holder
                </button>
              </div>
            </div>

            <BoxInput
              label="Full Name"
              required
              placeholder="e.g. Sadek Ali"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <BoxInput
              label="Email Address"
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <BoxInput
              label="Phone Number"
              type="tel"
              required
              placeholder="+88017..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <BoxInput
              label="Password"
              type="password"
              required
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <BoxInput
              label="Confirm Password"
              type="password"
              required
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-0.5 rounded accent-[#57BA29] cursor-pointer w-4 h-4"
              />
              <label htmlFor="terms" className="text-xs text-text-muted cursor-pointer leading-relaxed font-normal">
                I agree to the platform safety, tenancy verification, and NID identity policies.
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#57BA29] hover:bg-[#479E1F] text-white font-semibold py-3 rounded-xl shadow-md shadow-[#57BA29]/25 hover:shadow-lg transition-all text-sm disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="text-center pt-3 border-t border-border text-xs text-text-muted">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#57BA29] hover:underline">
              Sign In &rarr;
            </Link>
          </div>
        </BoxCard>
      </div>
    </div>
  );
}
