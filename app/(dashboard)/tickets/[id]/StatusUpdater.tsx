'use client';

import { useTransition } from 'react';
import { updateTicketStatus } from '@/app/actions/tickets';

interface StatusUpdaterProps {
  ticketId: string;
  currentStatus: string;
}

export default function StatusUpdater({ ticketId, currentStatus }: StatusUpdaterProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    startTransition(async () => {
      await updateTicketStatus(ticketId, newStatus);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="status-select" className="text-xs font-medium text-slate-500">
        Status:
      </label>
      <select
        id="status-select"
        defaultValue={currentStatus}
        onChange={handleStatusChange}
        disabled={isPending}
        className="text-xs font-semibold rounded-md border border-slate-300 bg-white px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 capitalize cursor-pointer"
      >
        <option value="new">New</option>
        <option value="in_progress">In Progress</option>
        <option value="on_hold">On Hold</option>
        <option value="resolved">Resolved</option>
        <option value="closed">Closed</option>
      </select>
    </div>
  );
}