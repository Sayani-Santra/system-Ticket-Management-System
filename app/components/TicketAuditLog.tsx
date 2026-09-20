import React from 'react';
import { TicketActivity } from '@/app/actions/tickets';

interface TicketAuditLogProps {
  activities: TicketActivity[];
  createdBy: string;
  createdAt: string;
}

export function TicketAuditLog({ activities, createdBy, createdAt }: TicketAuditLogProps) {
  const getBadgeColor = (action: TicketActivity['action']) => {
    switch (action) {
      case 'CREATED': return 'bg-blue-100 text-blue-700';
      case 'RESOLVED': return 'bg-green-100 text-green-700';
      case 'REOPENED': return 'bg-amber-100 text-amber-700';
      case 'ASSIGNED': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <h3 className="font-bold text-slate-800 border-b pb-2">Audit & Activity Timeline</h3>

      <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
        {/* Ticket Creation Log */}
        <div className="relative pl-8 text-sm">
          <span className="absolute left-1.5 top-1 w-3.5 h-3.5 rounded-full bg-blue-500 ring-4 ring-white" />
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">{createdBy}</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
              CREATED
            </span>
          </div>
          <p className="text-slate-600 mt-0.5">Ticket raised and submitted into system.</p>
          <span className="text-xs text-slate-400 mt-1 block">
            {new Date(createdAt).toLocaleString()}
          </span>
        </div>

        {/* Dynamic Activity History */}
        {activities.map((act, index) => (
          <div key={act.$id || index} className="relative pl-8 text-sm">
            <span className="absolute left-1.5 top-1 w-3.5 h-3.5 rounded-full bg-slate-400 ring-4 ring-white" />
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">{act.performedBy}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getBadgeColor(act.action)}`}>
                {act.action}
              </span>
            </div>
            <p className="text-slate-600 mt-0.5">{act.details}</p>
            {act.$createdAt && (
              <span className="text-xs text-slate-400 mt-1 block">
                {new Date(act.$createdAt).toLocaleString()}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}