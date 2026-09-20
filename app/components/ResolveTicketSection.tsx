'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface ResolveTicketProps {
  ticketId: string;
  status: string; // e.g. "resolved" or "open"
  resolutionDescription?: string | null; // Saved description from Appwrite / DB
  resolveTicketAction: (formData: FormData) => Promise<{ error?: string }>;
}

export default function ResolveTicketSection({
  ticketId,
  status,
  resolutionDescription,
  resolveTicketAction,
}: ResolveTicketProps) {
  const [description, setDescription] = useState(resolutionDescription || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isResolved = status?.toLowerCase() === 'resolved';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setErrorMessage(null);

    const formData = new FormData();
    formData.append('ticketId', ticketId);
    formData.append('resolutionDescription', description);

    startTransition(async () => {
      const res = await resolveTicketAction(formData);
      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4 shadow-2xs antialiased">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          Resolve Ticket
        </h3>

        {/* Status Badge */}
        {isResolved && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Resolved
          </span>
        )}
      </div>

      {/* STATE 1: Display the saved resolution text if already resolved */}
      {isResolved ? (
        <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-4 space-y-2">
          <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
            Resolution Summary
          </p>
          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
            {resolutionDescription || description || 'No resolution details provided.'}
          </p>
        </div>
      ) : (
        /* STATE 2: Show input form to resolve ticket */
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <p className="text-xs font-medium text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-200">
              {errorMessage}
            </p>
          )}

          <div>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details on how the issue was resolved..."
              required
              className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition shadow-inner resize-y"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending || !description.trim()}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer shrink-0 inline-flex items-center gap-2"
            >
              {isPending ? (
                'Saving Resolution...'
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  Mark as Resolved
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}