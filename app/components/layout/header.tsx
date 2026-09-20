import Link from 'next/link';

interface HeaderProps {
  user?: {
    name?: string;
    email?: string;
    role?: string;
  };
}

export function Header({ user }: HeaderProps) {
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';

  return (
    <header className="w-full bg-white border-b border-slate-200 px-6 py-3.5 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="text-base font-bold text-slate-900">
          Dashboard
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center justify-center">
              {displayName.charAt(0).toUpperCase()}
            </span>
            <span className="text-xs font-semibold text-slate-800">{displayName}</span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full uppercase">
              {user?.role || 'SUPERADMIN'}
            </span>
          </div>

          <form action="/auth/logout" method="POST">
            <button
              type="submit"
              className="text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}