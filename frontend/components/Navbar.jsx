'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import ThemeToggle from '@/components/ui/ThemeToggle';
import BoxBadge from '@/components/ui/BoxBadge';
import {
  Home,
  Building2,
  MapPin,
  Search,
  Mail,
  Bell,
  User,
  LogOut,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Fetch notifications if logged in
  useEffect(() => {
    if (user) {
      api.get('/notifications')
        .then((res) => {
          if (res?.success && res.data) {
            setNotifications(res.data.notifications || []);
            setUnreadCount(res.data.unread_count || 0);
          }
        })
        .catch(() => {});
    }
  }, [user, pathname]);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {}
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/houses', label: 'Houses' },
    { href: '/map', label: 'Map' },
    { href: '/search', label: 'Search' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0F120B]/95 backdrop-blur-md border-b border-border/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo - clean like CarRent in screenshot */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-[#57BA29] text-white rounded-xl flex items-center justify-center font-bold shadow-md shadow-[#57BA29]/25 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-text">
            Smart<span className="text-[#57BA29]">Rent</span>
          </span>
        </Link>

        {/* Desktop Nav Links - clean inline text links like Home Cars About Contact */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  isActive
                    ? 'text-[#57BA29] font-semibold'
                    : 'text-text-muted hover:text-text'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action: Login / Sign Up or User Dropdown */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-2.5">
              {/* Post House quick shortcut */}
              <Link
                href="/post"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#57BA29] hover:bg-[#E6F5DD] dark:hover:bg-[#1E3314] px-3.5 py-2 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Post House</span>
              </Link>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative w-9 h-9 flex items-center justify-center border border-border rounded-xl bg-surface text-text shadow-sm hover:bg-surface-alt transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4 text-text-muted" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-danger text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div
                    className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-2xl shadow-xl p-3.5 z-50 animate-in fade-in zoom-in-95"
                    data-lenis-prevent
                  >
                    <div className="flex items-center justify-between pb-2.5 border-b border-border mb-2 px-1">
                      <span className="text-xs font-semibold text-text">
                        Notifications ({unreadCount} new)
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-[11px] font-medium text-[#57BA29] hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-border/60">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-text-muted py-6 text-center">
                          No notifications yet.
                        </p>
                      ) : (
                        notifications.slice(0, 8).map((n) => (
                          <div
                            key={n.id}
                            className={cn(
                              'p-2.5 text-xs transition-colors rounded-xl my-1',
                              n.is_read ? 'bg-surface' : 'bg-primary-soft/60 font-medium'
                            )}
                          >
                            <p className="font-semibold text-text">{n.title}</p>
                            <p className="text-[11px] text-text-muted mt-0.5 line-clamp-2">{n.body}</p>
                            {n.link && (
                              <Link
                                href={n.link}
                                onClick={() => setNotificationsOpen(false)}
                                className="inline-block mt-1.5 text-[11px] text-[#57BA29] font-semibold hover:underline"
                              >
                                View Details &rarr;
                              </Link>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-xl bg-surface shadow-sm hover:bg-surface-alt transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-[#E6F5DD] text-[#57BA29] flex items-center justify-center font-bold text-xs">
                    {user.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs font-semibold text-text max-w-[100px] truncate hidden sm:inline">
                    {user.full_name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95"
                    data-lenis-prevent
                  >
                    <div className="p-2.5 border-b border-border mb-1">
                      <p className="text-xs font-semibold text-text truncate">{user.full_name}</p>
                      <p className="text-[11px] text-text-muted truncate">{user.email}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <BoxBadge size="sm" variant={user.role === 'admin' ? 'featured' : 'primary'}>
                          {user.role}
                        </BoxBadge>
                        <BoxBadge
                          size="sm"
                          variant={
                            user.nid_status === 'verified'
                              ? 'success'
                              : user.nid_status === 'pending'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          NID: {user.nid_status}
                        </BoxBadge>
                      </div>
                    </div>

                    <div className="flex flex-col gap-0.5 text-xs font-medium">
                      <Link
                        href="/dashboard"
                        className="px-3 py-2 rounded-xl hover:bg-surface-alt text-text transition-colors flex items-center gap-2.5"
                      >
                        <User className="w-4 h-4 text-text-muted" />
                        <span>User Dashboard</span>
                      </Link>

                      {/* House Holder view */}
                      <Link
                        href="/host"
                        className="px-3 py-2 rounded-xl hover:bg-surface-alt text-text transition-colors flex items-center gap-2.5"
                      >
                        <Building2 className="w-4 h-4 text-text-muted" />
                        <span>House Holder Portal</span>
                      </Link>

                      {/* Admin view */}
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="px-3 py-2 rounded-xl bg-primary-soft text-primary hover:opacity-90 transition-colors flex items-center gap-2.5 font-semibold"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Admin Control</span>
                        </Link>
                      )}

                      {/* NID Submission Link */}
                      <Link
                        href="/nid"
                        className="px-3 py-2 rounded-xl hover:bg-surface-alt text-text transition-colors flex items-center gap-2.5"
                      >
                        {user.nid_status === 'verified' ? (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-warning" />
                        )}
                        <span>NID Verification</span>
                      </Link>

                      <div className="my-1 border-t border-border" />

                      <button
                        type="button"
                        onClick={logout}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-danger transition-colors flex items-center gap-2.5 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-semibold text-text hover:text-[#57BA29] transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center bg-[#57BA29] hover:bg-[#479E1F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-[#57BA29]/25 hover:shadow-lg transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center border border-border rounded-xl bg-surface text-text shadow-sm"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface p-4 flex flex-col gap-2 animate-in slide-in-from-top-2">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3.5 py-2.5 text-sm font-medium rounded-xl transition-colors',
                  isActive
                    ? 'bg-primary-soft text-[#57BA29] font-semibold'
                    : 'text-text hover:bg-surface-alt'
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/post"
            className="w-full text-center bg-[#57BA29] text-white py-2.5 rounded-xl font-semibold mt-2 shadow-sm"
          >
            Post a House
          </Link>
        </div>
      )}
    </header>
  );
}
