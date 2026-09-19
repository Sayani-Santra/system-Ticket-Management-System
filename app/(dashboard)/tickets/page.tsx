import Link from 'next/link';
import { getTickets } from '@/app/actions/tickets';

interface PageProps {
  searchParams: Promise<{
    status?: string;
    priority?: string;
    search?: string;
  }>;
}

export default async function TicketsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { tickets, error } = await getTickets({
    status: params.status,
    priority: params.priority,
    search: params.search,
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tickets</h1>
          <p className="text-slate-500 text-sm">Manage and track your support tickets</p>
        </div>
        <Link
          href="/tickets/new"
          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition"
        >
          + Create Ticket
        </Link>
      </div>

      {/* Filter Bar */}
      <form method="GET" className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <input
          type="text"
          name="search"
          defaultValue={params.search || ''}
          placeholder="Search by title..."
          className="px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
        <select
          name="status"
          defaultValue={params.status || 'all'}
          className="px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
        >
          <option value="all" className="text-slate-900 bg-white">All Statuses</option>
          <option value="new" className="text-slate-900 bg-white">New</option>
          <option value="in_progress" className="text-slate-900 bg-white">In Progress</option>
          <option value="on_hold" className="text-slate-900 bg-white">On Hold</option>
          <option value="resolved" className="text-slate-900 bg-white">Resolved</option>
          <option value="closed" className="text-slate-900 bg-white">Closed</option>
        </select>
        <div className="flex gap-2">
          <select
            name="priority"
            defaultValue={params.priority || 'all'}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
          >
            <option value="all" className="text-slate-900 bg-white">All Priorities</option>
            <option value="low" className="text-slate-900 bg-white">Low</option>
            <option value="medium" className="text-slate-900 bg-white">Medium</option>
            <option value="high" className="text-slate-900 bg-white">High</option>
            <option value="urgent" className="text-slate-900 bg-white">Urgent</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition"
          >
            Filter
          </button>
        </div>
      </form>

      {/* Ticket List */}
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

      {tickets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-500 text-sm">No tickets found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div key={ticket.$id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-slate-500">{ticket.ticketNumber}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
                    ticket.status === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
                <h2 className="text-base font-semibold text-slate-900">{ticket.title}</h2>
                <p className="text-slate-600 text-sm line-clamp-1">{ticket.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-md uppercase ${
                  ticket.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {ticket.priority}
                </span>
                <Link href={`/tickets/${ticket.$id}`} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}