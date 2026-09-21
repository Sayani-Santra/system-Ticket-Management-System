import Link from 'next/link';
import { getTickets, getAdminUsers } from '@/app/actions/tickets';
import { getCurrentUser } from '@/app/actions/auth';

// 1. FORCE DYNAMIC RENDERING (Fixes Next.js stale cache issue)
export const dynamic = 'force-dynamic';

interface TicketsPageProps {
  searchParams: Promise<{
    status?: string;
    priority?: string;
    search?: string;
    assignedTo?: string;
  }>;
}

export default async function TicketsPage({ searchParams }: TicketsPageProps) {
  const params = await searchParams;
  const { user, role } = await getCurrentUser();
  const userRole = (role as string) || '';
  const isStaff = ['admin', 'superadmin', 'server_admin'].includes(userRole);

  // Fetch tickets and admin users concurrently
  const [{ tickets, error }, { admins }] = await Promise.all([
    getTickets({
      status: params.status,
      priority: params.priority,
      search: params.search,
      assignedTo: params.assignedTo,
    }),
    isStaff ? getAdminUsers() : Promise.resolve({ admins: [] }),
  ]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Title & Top Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-sm text-gray-500">Manage and track your support tickets</p>
        </div>
        <Link
          href="/tickets/new"
          className="px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition"
        >
          + Create Ticket
        </Link>
      </div>

      {/* Filter Bar */}
      <form className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <input
          type="text"
          name="search"
          defaultValue={params.search || ''}
          placeholder="Search by title..."
          className="flex-1 min-w-[200px] bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        <select
          name="status"
          defaultValue={params.status || 'all'}
          className="bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all" className="bg-white text-gray-900">All Statuses</option>
          <option value="new" className="bg-white text-gray-900">New</option>
          <option value="open" className="bg-white text-gray-900">Open</option>
          <option value="in_progress" className="bg-white text-gray-900">In Progress</option>
          <option value="resolved" className="bg-white text-gray-900">Resolved</option>
          <option value="closed" className="bg-white text-gray-900">Closed</option>
        </select>

        <select
          name="priority"
          defaultValue={params.priority || 'all'}
          className="bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all" className="bg-white text-gray-900">All Priorities</option>
          <option value="low" className="bg-white text-gray-900">Low</option>
          <option value="medium" className="bg-white text-gray-900">Medium</option>
          <option value="high" className="bg-white text-gray-900">High</option>
          <option value="critical" className="bg-white text-gray-900">Critical</option>
        </select>

        {/* Assigned Staff Filter */}
        {isStaff && (
          <select
            name="assignedTo"
            defaultValue={params.assignedTo || 'all'}
            className="bg-white text-purple-900 font-medium border border-purple-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all" className="bg-white text-gray-900">All Assigned Staff</option>
            <option value="unassigned" className="bg-white text-gray-900">Unassigned Only</option>
            {admins &&
              admins.map((admin: any) => {
                const adminId = admin.id || admin.$id;
                return (
                  <option key={adminId} value={adminId} className="bg-white text-gray-900">
                    {admin.name}
                  </option>
                );
              })}
          </select>
        )}

        <button
          type="submit"
          className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-lg transition"
        >
          Filter
        </button>
      </form>

      {/* Ticket List Cards */}
      <div className="space-y-4">
        {error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : !tickets || tickets.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-xl border border-gray-200 text-gray-500 text-sm">
            No tickets found.
          </div>
        ) : (
          tickets.map((ticket: any) => {
            const assignedId = ticket.assignedToId || ticket.assignedTo;
            const assignedAdmin = admins?.find(
              (a: any) => (a.id || a.$id) === assignedId
            );

            let assignedStaffName = null;
            if (assignedId) {
              assignedStaffName = assignedAdmin
                ? assignedAdmin.name
                : ticket.assignedToName || 'Assigned Staff';
            }

            // Case-insensitive Priority formatting
            const ticketPriority = (ticket.priority || 'medium').toLowerCase();

            return (
              <div
                key={ticket.$id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition space-y-2"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-500">#{ticket.$id.slice(-6)}</span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 font-medium rounded capitalize">
                      {ticket.status}
                    </span>
                  </div>

                  {/* Assigned Staff Badge */}
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                      assignedStaffName
                        ? 'bg-purple-50 border-purple-200 text-purple-900'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}
                  >
                    <svg
                      className="w-3.5 h-3.5 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>
                      {assignedStaffName ? `Assigned: ${assignedStaffName}` : 'Unassigned'}
                    </span>
                  </div>
                </div>

                {/* Title & Actions */}
                <div className="flex items-start justify-between gap-4 pt-1">
                  <h2 className="text-base font-bold text-gray-900 line-clamp-1">{ticket.title}</h2>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold rounded uppercase ${
                        ticketPriority === 'critical' || ticketPriority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : ticketPriority === 'medium'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {ticket.priority}
                    </span>
                    <Link
                      href={`/tickets/${ticket.$id}`}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
                    >
                      View &rarr;
                    </Link>
                  </div>
                </div>

                {/* Description Preview */}
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                  {ticket.description}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}