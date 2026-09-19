'use client';

import { useTransition } from 'react';
import { assignTicket } from '@/app/actions/tickets';

interface UserOption {
  $id: string;
  name: string;
}

interface AssigneeSelectorProps {
  ticketId: string;
  currentAssigneeId?: string;
  currentUserId: string;
  isAdmin?: boolean;
  users?: UserOption[];
}

export default function AssigneeSelector({
  ticketId,
  currentAssigneeId,
  currentUserId,
  isAdmin = false,
  users = [],
}: AssigneeSelectorProps) {
  const [isPending, startTransition] = useTransition();

  const handleAssign = (assigneeId: string) => {
    startTransition(async () => {
      await assignTicket(ticketId, assigneeId);
    });
  };

  const currentAssignee = users.find((u) => u.$id === currentAssigneeId);
  const assigneeDisplayName = currentAssignee
    ? currentAssignee.name
    : currentAssigneeId
    ? currentAssigneeId
    : 'Unassigned';

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-slate-500">Assigned To:</span>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded ${
            currentAssigneeId
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {assigneeDisplayName}
        </span>
      </div>

      {/* Manual Assignment Dropdown for Admins */}
      {isAdmin && users.length > 0 && (
        <select
          value={currentAssigneeId || ''}
          onChange={(e) => handleAssign(e.target.value)}
          disabled={isPending}
          className="text-xs border border-slate-300 rounded px-2 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 cursor-pointer bg-white"
        >
          <option value="">-- Select Assignee --</option>
          {users.map((user) => (
            <option key={user.$id} value={user.$id}>
              {user.name}
            </option>
          ))}
        </select>
      )}

      {/* Action Buttons: Claim / Unassign */}
      {currentAssigneeId !== currentUserId ? (
        <button
          onClick={() => handleAssign(currentUserId)}
          disabled={isPending}
          className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded transition disabled:opacity-50"
        >
          {isPending ? 'Claiming...' : 'Claim Ticket'}
        </button>
      ) : (
        <button
          onClick={() => handleAssign('')}
          disabled={isPending}
          className="text-xs font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded transition disabled:opacity-50"
        >
          {isPending ? 'Updating...' : 'Unassign'}
        </button>
      )}
    </div>
  );
}