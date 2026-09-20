'use client';

import { useTransition } from 'react';
import { logout } from '@/app/actions/auth';

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      // 1. Clear session on server
      await logout();
      
      // 2. Force hard redirect to clear router cache instantly on 1st click
      window.location.href = '/login';
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer disabled:opacity-50"
    >
      {isPending ? 'Logging out...' : 'Logout'}
    </button>
  );
}