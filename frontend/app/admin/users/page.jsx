'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminNav from '@/components/AdminNav';
import BoxCard from '@/components/ui/BoxCard';
import BoxBadge from '@/components/ui/BoxBadge';
import BoxTable from '@/components/ui/BoxTable';
import BoxModal from '@/components/ui/BoxModal';
import Skeleton from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
  Ban,
  CheckCircle2,
  Eye,
  Building2,
  Calendar,
} from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.set('search', search);
      if (roleFilter) q.set('role', roleFilter);

      const res = await api.get(`/admin/users?${q.toString()}`);
      if (res?.success) {
        setUsers(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleBanToggle = async (userItem) => {
    const isBanned = userItem.status === 'banned';
    if (isBanned) {
      if (!confirm(`Unban user "${userItem.full_name}"?`)) return;
      await api.patch(`/admin/users/${userItem.id}/unban`);
    } else {
      const reason = prompt(`Enter ban reason for ${userItem.full_name}:`, 'Policy violation');
      if (!reason) return;
      await api.patch(`/admin/users/${userItem.id}/ban`, { reason });
    }
    fetchUsers();
  };

  const handleViewDetails = async (userId) => {
    setUserModalOpen(true);
    setSelectedUser(null);
    try {
      const res = await api.get(`/admin/users/${userId}`);
      if (res?.success) {
        setSelectedUser(res.data);
      }
    } catch (err) {
      alert('Could not load user details: ' + err.message);
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
                <Users className="w-7 h-7 text-[#57BA29]" />
                <span>User Directory & Management</span>
              </h1>
              <p className="text-xs sm:text-sm text-text-muted mt-1">
                Inspect accounts, inspect verified National ID records, and enforce account bans.
              </p>
            </div>

            {/* Search & Filter */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                className="bg-surface border border-border text-text px-3.5 py-2 text-xs font-medium rounded-xl outline-none focus:border-[#57BA29] focus:ring-2 focus:ring-[#57BA29]/20 shadow-sm"
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-surface border border-border text-text px-3.5 py-2 text-xs font-semibold rounded-xl outline-none focus:border-[#57BA29] focus:ring-2 focus:ring-[#57BA29]/20 shadow-sm cursor-pointer"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="house_holder">House Holder</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          {loading ? (
            <Skeleton className="w-full h-96 rounded-2xl" />
          ) : (
            <BoxTable headers={['User', 'Role', 'NID Status', 'Account Status', 'Joined', 'Actions']}>
              {users.map((u) => {
                const isBanned = u.status === 'banned';

                return (
                  <tr key={u.id} className="hover:bg-surface-alt/50 transition-colors">
                    <td className="px-4 py-3 border-r border-border/60">
                      <div className="font-semibold text-text">{u.full_name}</div>
                      <div className="text-[11px] text-text-muted">{u.email} • {u.phone}</div>
                    </td>

                    <td className="px-4 py-3 border-r border-border/60">
                      <BoxBadge size="sm" variant={u.role === 'admin' ? 'featured' : 'primary'}>
                        {u.role}
                      </BoxBadge>
                    </td>

                    <td className="px-4 py-3 border-r border-border/60">
                      <BoxBadge
                        size="sm"
                        variant={
                          u.nid_status === 'verified'
                            ? 'success'
                            : u.nid_status === 'pending'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {u.nid_status}
                      </BoxBadge>
                    </td>

                    <td className="px-4 py-3 border-r border-border/60">
                      <BoxBadge size="sm" variant={isBanned ? 'danger' : 'success'}>
                        {u.status}
                      </BoxBadge>
                    </td>

                    <td className="px-4 py-3 border-r border-border/60 text-xs text-text-muted">
                      {formatDate(u.created_at)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(u.id)}
                          className="inline-flex items-center gap-1.5 bg-surface border border-border text-text hover:bg-surface-alt py-1 px-3 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-text-muted" />
                          <span>Inspect</span>
                        </button>

                        {u.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleBanToggle(u)}
                            className={`py-1 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              isBanned
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40'
                            }`}
                          >
                            {isBanned ? 'Unban' : 'Ban'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </BoxTable>
          )}

          {/* User Details Modal */}
          {userModalOpen && (
            <BoxModal
              isOpen={userModalOpen}
              onClose={() => setUserModalOpen(false)}
              title={`User Profile: ${selectedUser?.user?.full_name || 'Loading...'}`}
              maxWidth="max-w-2xl"
            >
              {!selectedUser ? (
                <Skeleton className="w-full h-64 rounded-2xl" />
              ) : (
                <div className="space-y-4 text-xs">
                  {/* Account Overview */}
                  <div className="grid grid-cols-2 gap-3 p-4 bg-surface-alt border border-border rounded-xl font-medium">
                    <div>Full Name: <strong className="text-text">{selectedUser.user.full_name}</strong></div>
                    <div>Email: <strong className="text-text">{selectedUser.user.email}</strong></div>
                    <div>Phone: <strong className="text-text">{selectedUser.user.phone}</strong></div>
                    <div>Role: <strong className="text-text uppercase">{selectedUser.user.role}</strong></div>
                  </div>

                  {/* NID Submission Details */}
                  <div className="border border-border p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <span className="font-bold text-text flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#57BA29]" />
                        National ID (NID) Information
                      </span>
                      <BoxBadge size="sm" variant={selectedUser.nid ? 'success' : 'neutral'}>
                        {selectedUser.nid?.status || 'No NID'}
                      </BoxBadge>
                    </div>

                    {selectedUser.nid ? (
                      <div className="grid grid-cols-2 gap-2 text-text-muted pt-1">
                        <div>NID Number: <strong className="text-text font-mono">{selectedUser.nid.nid_number}</strong></div>
                        <div>DOB: <strong className="text-text">{formatDate(selectedUser.nid.date_of_birth)}</strong></div>
                        <div className="col-span-2">Permanent Address: <strong className="text-text">{selectedUser.nid.address}</strong></div>
                        {selectedUser.nid.father_mother_name && (
                          <div className="col-span-2">Parents: <strong className="text-text">{selectedUser.nid.father_mother_name}</strong></div>
                        )}
                      </div>
                    ) : (
                      <p className="text-text-muted italic pt-1">User has not submitted NID documents yet.</p>
                    )}
                  </div>

                  {/* Posted Houses & Bookings Count */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 border border-border rounded-xl">
                      <span className="font-bold text-text block mb-1">Posted Houses ({selectedUser.houses?.length || 0})</span>
                      <ul className="space-y-1 text-[11px] text-text-muted">
                        {selectedUser.houses?.slice(0, 3).map((h) => (
                          <li key={h.id} className="truncate">• {h.title} ({h.status})</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 border border-border rounded-xl">
                      <span className="font-bold text-text block mb-1">Bookings Submitted ({selectedUser.bookings?.length || 0})</span>
                      <ul className="space-y-1 text-[11px] text-text-muted">
                        {selectedUser.bookings?.slice(0, 3).map((b) => (
                          <li key={b.id} className="truncate">• {b.house_title} ({b.status})</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </BoxModal>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
