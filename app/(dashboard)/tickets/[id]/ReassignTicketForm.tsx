'use client';

import { useState, useTransition } from 'react';
import { assignTicket } from '@/app/actions/tickets';

interface AdminUser {
  id: string;
  name: string;
}

interface ReassignTicketFormProps {
  ticketId: string;
  currentAssignedId?: string;
  admins: AdminUser[];
}

export default function ReassignTicketForm({
  ticketId,
  currentAssignedId,
  admins,
}: ReassignTicketFormProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedStaffId, setSelectedStaffId] = useState(currentAssignedId || '');
  const [statusMsg, setStatusMsg] = useState('');

  const handleReassign = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStaffId = e.target.value;
    setSelectedStaffId(newStaffId);

    // Find the staff member's name from the admins list
    const selectedAdmin = admins.find((admin) => admin.id === newStaffId);
    const staffName = selectedAdmin ? selectedAdmin.name : '';

    startTransition(async () => {
      setStatusMsg('Updating...');
      
      // Call your existing assignTicket action in tickets.ts
      const result = await assignTicket(ticketId, newStaffId, staffName);

      if (result?.error) {
        setStatusMsg(`Error: ${result.error}`);
      } else {
        setStatusMsg('Reassigned successfully!');
        setTimeout(() => setStatusMsg(''), 2500);
      }
    });
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-700">
        Reassign Staff
      </label>
      <select
        value={selectedStaffId}
        onChange={handleReassign}
        disabled={isPending}
        className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
      >
        <option value="">-- Select Staff --</option>
        {admins.map((admin) => (
          <option key={admin.id} value={admin.id}>
            {admin.name}
          </option>
        ))}
      </select>
      {statusMsg && (
        <p className={`text-xs font-medium ${statusMsg.startsWith('Error') ? 'text-red-500' : 'text-purple-600'}`}>
          {statusMsg}
        </p>
      )}
    </div>
  );
}