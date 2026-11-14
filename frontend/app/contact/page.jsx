'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import BoxCard from '@/components/ui/BoxCard';
import BoxButton from '@/components/ui/BoxButton';
import BoxInput from '@/components/ui/BoxInput';
import {
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function ContactPage() {
  const { user } = useAuth();

  const [category, setCategory] = useState('Feedback');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [houseId, setHouseId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please login to submit feedback or complaints so our team can notify you upon reply.');
      return;
    }

    if (!subject.trim() || !message.trim()) {
      setError('Subject and message are required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/feedback', {
        category,
        subject,
        message,
        house_id: houseId ? parseInt(houseId, 10) : null,
      });

      if (res?.success) {
        setSuccess(true);
        setSubject('');
        setMessage('');
        setHouseId('');
      } else {
        setError(res?.message || 'Submission failed');
      }
    } catch (err) {
      setError(err.message || 'Error sending feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2.5">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text">
          Contact & Support
        </h1>
        <p className="text-sm text-text-muted">
          Need help with precision GPS radius search, house posting, or account verification? Reach out directly or submit your feedback.
        </p>
      </div>

      {/* 3 Contact Boxes: Phone, Email, WhatsApp */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* WhatsApp Box */}
        <BoxCard className="p-6 text-center space-y-3 bg-surface border border-border rounded-3xl shadow-sm hover:shadow-lg transition-all">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <MessageCircle className="w-6 h-6 stroke-[2]" />
          </div>
          <h3 className="text-base font-semibold text-text">WhatsApp Support</h3>
          <p className="text-xs text-text-muted">Direct instant chat with our Dhaka platform coordinators.</p>
          <a
            href="https://wa.me/8801700000001?text=Hello%20Smart%20House%20Rent%20Support"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block pt-2"
          >
            <button
              type="button"
              className="bg-[#57BA29] hover:bg-[#479E1F] text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-sm shadow-[#57BA29]/20 transition-all cursor-pointer"
            >
              Chat on WhatsApp
            </button>
          </a>
        </BoxCard>

        {/* Phone Call Box */}
        <BoxCard className="p-6 text-center space-y-3 bg-surface border border-border rounded-3xl shadow-sm hover:shadow-lg transition-all">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Phone className="w-6 h-6 stroke-[2]" />
          </div>
          <h3 className="text-base font-semibold text-text">Direct Hotline</h3>
          <p className="text-xs text-text-muted">Call our helpline Sunday to Thursday, 9 AM - 8 PM.</p>
          <a href="tel:+8801700000001" className="inline-block pt-2">
            <button
              type="button"
              className="bg-surface border border-border text-text hover:bg-surface-alt px-5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              +880 1700-000001
            </button>
          </a>
        </BoxCard>

        {/* Email Support Box */}
        <BoxCard className="p-6 text-center space-y-3 bg-surface border border-border rounded-3xl shadow-sm hover:shadow-lg transition-all">
          <div className="w-12 h-12 bg-surface-alt text-text-muted rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Mail className="w-6 h-6 stroke-[2]" />
          </div>
          <h3 className="text-base font-semibold text-text">Official Email</h3>
          <p className="text-xs text-text-muted">Send formal inquiries, tenancy complaints or partnership proposals.</p>
          <a href="mailto:support@smarthouse.com" className="inline-block pt-2">
            <button
              type="button"
              className="bg-surface border border-border text-text hover:bg-surface-alt px-5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              support@smarthouse.com
            </button>
          </a>
        </BoxCard>
      </div>

      {/* Feedback / Complaint Submission Form */}
      <div className="max-w-2xl mx-auto">
        <BoxCard className="p-6 sm:p-8 space-y-6 bg-surface border border-border rounded-3xl shadow-xl">
          <div className="border-b border-border pb-3">
            <h2 className="text-lg font-bold text-text flex items-center gap-2">
              <Send className="w-5 h-5 text-[#57BA29]" />
              <span>Feedback & Complaint Submission</span>
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Admin responses will automatically appear in your notifications dashboard.
            </p>
          </div>

          {!user && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between text-xs font-medium text-text">
              <span>Login is required to submit feedback so admin can reply to you.</span>
              <Link href="/login?redirect=/contact" className="font-semibold text-[#57BA29] hover:underline">
                Login &rarr;
              </Link>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-medium text-danger">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs font-medium text-[#57BA29] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Your feedback has been submitted successfully! Check your notifications for replies.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text block mb-1.5">Your Name</label>
                <input
                  type="text"
                  readOnly={!!user}
                  value={user?.full_name || ''}
                  placeholder="Login to prefill"
                  className="w-full bg-surface-alt/60 border border-border text-text px-3.5 py-2.5 text-xs font-normal rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1.5">Your Email</label>
                <input
                  type="email"
                  readOnly={!!user}
                  value={user?.email || ''}
                  placeholder="Login to prefill"
                  className="w-full bg-surface-alt/60 border border-border text-text px-3.5 py-2.5 text-xs font-normal rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text block mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-surface border border-border text-text px-3.5 py-2.5 text-xs font-normal rounded-xl outline-none focus:border-[#57BA29] cursor-pointer"
                >
                  <option value="Feedback">General Feedback</option>
                  <option value="Complaint">Tenancy / Landlord Complaint</option>
                  <option value="Suggestion">Feature Suggestion</option>
                  <option value="Other">Other Inquiry</option>
                </select>
              </div>

              <BoxInput
                label="Related House ID (Optional)"
                type="number"
                placeholder="e.g. 1"
                value={houseId}
                onChange={(e) => setHouseId(e.target.value)}
              />
            </div>

            <BoxInput
              label="Subject"
              required
              placeholder="e.g. Map radius circle accuracy in Mirpur 10"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text block">Detailed Message</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please explain your feedback or grievance in detail..."
                className="w-full bg-surface border border-border text-text p-3.5 text-xs rounded-xl outline-none focus:border-[#57BA29] focus:ring-2 focus:ring-[#57BA29]/20 shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !user}
              className="w-full bg-[#57BA29] hover:bg-[#479E1F] text-white font-semibold py-3 rounded-xl shadow-md shadow-[#57BA29]/25 hover:shadow-lg transition-all text-sm disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Send Feedback / Complaint'}
            </button>
          </form>
        </BoxCard>
      </div>
    </div>
  );
}
