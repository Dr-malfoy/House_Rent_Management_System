'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminNav from '@/components/AdminNav';
import BoxCard from '@/components/ui/BoxCard';
import BoxBadge from '@/components/ui/BoxBadge';
import BoxTable from '@/components/ui/BoxTable';
import Skeleton from '@/components/ui/Skeleton';
import CountUp from '@/components/motion/CountUp';
import { api } from '@/lib/api';
import { formatBDT, formatDate } from '@/lib/utils';
import { Receipt, DollarSign, CheckCircle2, Clock } from 'lucide-react';

export default function AdminBillingPage() {
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBilling() {
      try {
        const [billsRes, sumRes] = await Promise.all([
          api.get('/billing'),
          api.get('/billing/summary'),
        ]);

        if (billsRes?.success) setBills(billsRes.data || []);
        if (sumRes?.success) setSummary(sumRes.data || null);
      } catch (err) {
        console.error('Failed to load billing audit:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBilling();
  }, []);

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen pb-16">
        <AdminNav />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="border-b border-border pb-4">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text flex items-center gap-2.5">
              <Receipt className="w-7 h-7 text-[#57BA29]" />
              <span>Rental Billing Ledger & Financial Audit</span>
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              Inspect all offline manual billing records recorded by landlords across properties (no online payment gateway).
            </p>
          </div>

          {/* Financial Summary Bento */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <BoxCard className="p-5 text-center space-y-1 rounded-2xl shadow-sm">
              <span className="text-xs font-semibold text-text-muted block">Total Invoices</span>
              <span className="text-2xl sm:text-3xl font-black text-text">
                <CountUp end={summary?.total_bills || bills.length} />
              </span>
            </BoxCard>

            <BoxCard className="p-5 text-center space-y-1 rounded-2xl shadow-sm">
              <span className="text-xs font-semibold text-text-muted block">Total Billed</span>
              <span className="text-2xl sm:text-3xl font-black text-text">
                {formatBDT(summary?.total_billed_amount || 0)}
              </span>
            </BoxCard>

            <BoxCard className="p-5 text-center space-y-1 rounded-2xl shadow-sm border-emerald-200 dark:border-emerald-900/40">
              <span className="text-xs font-semibold text-text-muted block">Paid Amount</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {formatBDT(summary?.total_collected_amount || 0)}
              </span>
            </BoxCard>

            <BoxCard className="p-5 text-center space-y-1 rounded-2xl shadow-sm border-amber-200 dark:border-amber-900/40">
              <span className="text-xs font-semibold text-text-muted block">Unpaid Bills</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                <CountUp end={summary?.unpaid_bills || 0} />
              </span>
            </BoxCard>
          </div>

          {/* Ledger Table */}
          {loading ? (
            <Skeleton className="w-full h-80 rounded-2xl" />
          ) : bills.length === 0 ? (
            <BoxCard className="p-12 text-center text-xs font-semibold text-text-muted uppercase border-dashed rounded-2xl">
              No billing entries recorded in the system yet.
            </BoxCard>
          ) : (
            <BoxTable headers={['Property & Agreement', 'Tenant', 'Month', 'Rent + Utilities', 'Status', 'Payment Method', 'Paid On']}>
              {bills.map((b) => (
                <tr key={b.id} className="hover:bg-surface-alt/50 transition-colors">
                  <td className="px-4 py-3 border-r border-border/60">
                    <div className="font-semibold text-text line-clamp-1">{b.house_title}</div>
                    <div className="text-[11px] text-text-muted">{b.address_text}</div>
                  </td>

                  <td className="px-4 py-3 border-r border-border/60">
                    <div className="font-semibold text-text">{b.tenant_name}</div>
                    <div className="text-[11px] text-text-muted">{b.tenant_phone}</div>
                  </td>

                  <td className="px-4 py-3 border-r border-border/60 font-mono text-xs">
                    {formatDate(b.billing_month)}
                  </td>

                  <td className="px-4 py-3 border-r border-border/60">
                    <div className="font-bold text-[#57BA29]">{formatBDT(b.total_amount)}</div>
                    <div className="text-[10px] text-text-muted">
                      Rent: {formatBDT(b.rent_amount)} | Util: {formatBDT(b.utility_amount)}
                    </div>
                  </td>

                  <td className="px-4 py-3 border-r border-border/60">
                    <BoxBadge
                      size="sm"
                      variant={b.payment_status === 'paid' ? 'success' : 'warning'}
                    >
                      {b.payment_status}
                    </BoxBadge>
                  </td>

                  <td className="px-4 py-3 border-r border-border/60 text-xs font-semibold capitalize text-text-muted">
                    {b.payment_method ? b.payment_method.replace('_', ' ') : 'N/A'}
                  </td>

                  <td className="px-4 py-3 text-xs text-text-muted">
                    {b.paid_on ? formatDate(b.paid_on) : 'Pending'}
                  </td>
                </tr>
              ))}
            </BoxTable>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
