import Link from 'next/link';

interface UserDashboardProps {
  stats: {
    totalRaised: number;
    open: number;
    resolved: number;
  };
  recentTickets: Array<{ $id: string; title: string; status: string; $createdAt: string }>;
}

// Helper to render dynamic status badges with distinct styling
function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  if (['new', 'open'].includes(normalized)) {
    styles = 'bg-blue-50 text-blue-700 border-blue-200/60';
  } else if (['in_progress', 'in progress'].includes(normalized)) {
    styles = 'bg-amber-50 text-amber-700 border-amber-200/60';
  } else if (['resolved', 'closed'].includes(normalized)) {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
  } else if (normalized === 'reopened') {
    styles = 'bg-purple-50 text-purple-700 border-purple-200/60';
  }

  return (
    <span
      className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-medium border capitalize ${styles}`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

export function UserDashboard({ stats, recentTickets }: UserDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">User Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your submitted tickets and monitor resolution progress.
          </p>
        </div>
        <Link
          href="/tickets/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Raise New Ticket
        </Link>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Raised */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Total Raised
            </p>
            <span className="p-2 bg-slate-100 text-slate-600 rounded-lg group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{stats.totalRaised}</p>
        </div>

        {/* Open Tickets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider">
              Open Tickets
            </p>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-extrabold text-amber-600 mt-3">{stats.open}</p>
        </div>

        {/* Resolved Tickets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">
              Resolved Tickets
            </p>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 mt-3">{stats.resolved}</p>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>
            <p className="text-xs text-slate-500 mt-0.5">Your latest submitted support tickets</p>
          </div>
          {recentTickets.length > 0 && (
            <Link
              href="/tickets"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              View all
            </Link>
          )}
        </div>

        <div className="divide-y divide-slate-100">
          {recentTickets.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-800">No recent tickets found</p>
              <p className="text-xs text-slate-500 mt-1">Need help? Raise a ticket to get assistance.</p>
            </div>
          ) : (
            recentTickets.map((ticket) => (
              <Link
                key={ticket.$id}
                href={`/tickets/${ticket.$id}`}
                className="p-4 sm:px-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors group"
              >
                <div className="min-w-0 pr-4">
                  <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                    {ticket.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">
                      Created {new Date(ticket.$createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={ticket.status} />
                  <svg
                    className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}