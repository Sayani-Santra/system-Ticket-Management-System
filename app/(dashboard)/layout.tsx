import Link from 'next/link';
import { LogoutButton } from '@/app/components/LogoutButton';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Base menu items available to general users
const GENERAL_NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Tickets', href: '/tickets' },
  { label: 'Create Ticket', href: '/tickets/new' },
];

// Admin & Superadmin management options
const ADMIN_NAV_ITEMS = [
  { label: 'Categories', href: '/admin/categories' },
  { label: 'Workflows', href: '/admin/workflow' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Settings', href: '/admin/settings' },
];

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // Fetch session / user role
  const user = { name: 'Test User', role: 'SUPERADMIN' };
  const displayName = user?.name || 'User';
  const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(user?.role?.toUpperCase() || '');

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 antialiased">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto">
        <div className="p-5 space-y-6">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              S
            </div>
            <span className="font-bold text-base text-slate-900 tracking-tight">
              SupportDesk
            </span>
          </div>

          {/* Main Menu */}
          <nav className="space-y-1">
            <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Menu
            </p>
            {GENERAL_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Management Menu (Rendered for Admin/Superadmin) */}
          {isAdmin && (
            <nav className="space-y-1">
              <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Management
              </p>
              {ADMIN_NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* User Card */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{displayName}</p>
                <span className="text-[10px] font-bold text-purple-700 uppercase">
                  {user?.role || 'SUPERADMIN'}
                </span>
              </div>
            </div>

            {/* Logout Component */}
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 max-w-6xl w-full mx-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}