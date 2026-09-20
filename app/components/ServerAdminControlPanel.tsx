// app/components/ServerAdminControlPanel.tsx
'use client';

import { useTransition } from 'react';
import { updateTicketStatusAndPriority } from '@/app/actions/tickets';

interface TicketData {
  $id: string;
  status: string;
  priority: string;
  [key: string]: any;
}

interface ServerAdminControlPanelProps {
  ticket: TicketData;
}

export function ServerAdminControlPanel({ ticket }: ServerAdminControlPanelProps) {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await updateTicketStatusAndPriority(formData);
      if (result?.error) {
        alert(`Error: ${result.error}`);
      } else {
        alert('Ticket updated successfully!');
      }
    });
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
        Server Admin Management
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <input type="hidden" name="ticketId" value={ticket.$id} />

        {/* Status Field */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Status
          </label>
          <select name="status" defaultValue={ticket.status} className="...">
  <option value="new">New</option>
  <option value="open">Open</option>
  <option value="assigned">Assigned</option>
  <option value="in_progress">In Progress</option>
  <option value="waiting_for_user">Waiting for User</option>
  <option value="resolved">Resolved</option>
  <option value="closed">Closed</option>
  <option value="escalated">Escalated</option>
  <option value="reopened">Reopened</option>
</select>
        </div>

        {/* Priority Field */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Priority
          </label>
          <select
            name="priority"
            defaultValue={ticket.priority}
            className="w-full border rounded p-2 text-xs bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-slate-800 text-white font-semibold text-xs rounded hover:bg-slate-900 disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Save Updates'}
        </button>
      </form>
    </div>
  );
}