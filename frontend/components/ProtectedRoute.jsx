'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Skeleton from './ui/Skeleton';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      // Check role restriction
      if (allowedRoles.length > 0 && user.role !== 'admin' && !allowedRoles.includes(user.role)) {
        if (user.role === 'house_holder') router.replace('/host');
        else router.replace('/dashboard');
      }
    }
  }, [user, isLoading, allowedRoles, router, pathname]);

  if (isLoading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <Skeleton className="w-1/3 h-10 border-2 border-border shadow-box" />
        <Skeleton className="w-full h-64 border-2 border-border shadow-box" />
      </div>
    );
  }

  if (allowedRoles.length > 0 && user.role !== 'admin' && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
