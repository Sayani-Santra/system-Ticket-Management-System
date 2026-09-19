// app/(dashboard)/tickets/[id]/TicketActions.tsx
'use client';

import { useTransition } from 'react';
import { reopenTicket, escalateTicket } from '@/app/actions/tickets';
import { UserRole } from '@/app/actions/auth'; // Single source of truth for UserRole

interface TicketActionsProps {
  ticketId: string;
  status: string;
  isEscalated: boolean;
  role: UserRole;
}

export function TicketActions({ ticketId, status, isEscalated, role }: TicketActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleReopen = () => {
    startTransition(async () => {
      await reopenTicket(ticketId);
    });
  };

  const handleEscalate = () => {
    startTransition(async () => {
      await escalateTicket(ticketId);
    });
  };

  return (
    <div className="flex gap-2">
      {status === 'resolved' && (
        <button
          onClick={handleReopen}
          disabled={isPending}
          className="px-3 py-1.5 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700 disabled:opacity-50"
        >
          {isPending ? 'Processing...' : 'Reopen Ticket'}
        </button>
      )}

      {!isEscalated && status !== 'resolved' && (
        <button
          onClick={handleEscalate}
          disabled={isPending}
          className="px-3 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
        >
          {isPending ? 'Processing...' : 'Escalate Ticket'}
        </button>
      )}
    </div>
  );
}