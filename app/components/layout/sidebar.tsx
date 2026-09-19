import Link from 'next/link';
import { getCurrentUser } from '@/app/actions/auth';

export async function Sidebar() {
  const { role } = await getCurrentUser();
  const isSuperAdmin = role === 'superadmin';

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4 space-y-6 flex flex-col justify-between">
      <div className="space-y-6">
        <div className="font-bold text-lg text-blue-400 px-2">
          SysTicket System
        </div>

        <nav className="space-y-1 text-sm">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">
            Navigation
          </div>
          <Link
            href="/tickets"
            className="block px-3 py-2 rounded hover:bg-slate-800 text-gray-200"
          >
            My Tickets
          </Link>
          <Link
            href="/tickets/create"
            className="block px-3 py-2 rounded hover:bg-slate-800 text-gray-200"
          >
            + Create Ticket
          </Link>

          {/* Super Admin Control Links */}
          {isSuperAdmin && (
            <div className="pt-6 space-y-1">
              <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider px-2 mb-2">
                Super Admin Controls
              </div>
              <Link
                href="/admin/users"
                className="block px-3 py-2 rounded hover:bg-purple-900/50 text-purple-200"
              >
                👥 Manage Users & Admins
              </Link>
              <Link
                href="/admin/workflow"
                className="block px-3 py-2 rounded hover:bg-purple-900/50 text-purple-200"
              >
                🔄 Ticket Flow Rules
              </Link>
              <Link
                href="/admin/settings"
                className="block px-3 py-2 rounded hover:bg-purple-900/50 text-purple-200"
              >
                ⚙️ System Settings
              </Link>
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
}