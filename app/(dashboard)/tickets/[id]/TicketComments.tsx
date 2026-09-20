'use client';

import { useState, useTransition, useRef } from 'react';
import { addComment } from '@/app/actions/tickets';

interface Comment {
  $id: string;
  authorId: string;
  body: string;
  isInternal: boolean;
  $createdAt: string;
}

export default function TicketComments({
  ticketId,
  comments,
  isAdmin = false,
}: {
  ticketId: string;
  comments: Comment[];
  isAdmin?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [isInternal, setIsInternal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    formData.append('ticketId', ticketId);
    formData.append('isInternal', String(isInternal));

    startTransition(async () => {
      await addComment(formData);
      formRef.current?.reset();
      setIsInternal(false);
    });
  };

  const visibleComments = comments.filter((c) => !c.isInternal || isAdmin);

  return (
    <div className="mt-8 border-t border-slate-200 pt-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Conversation Thread</h3>

      <div className="space-y-4 mb-6">
        {visibleComments.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No comments yet.</p>
        ) : (
          visibleComments.map((comment) => (
            <div
              key={comment.$id}
              className={`p-4 rounded-xl border ${
                comment.isInternal
                  ? 'bg-amber-50/60 border-amber-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-slate-700">
                    User: {comment.authorId}
                  </span>
                  {comment.isInternal && (
                    <span className="text-[10px] font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded">
                      INTERNAL NOTE
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(comment.$createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.body}</p>
            </div>
          ))
        )}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
        <textarea
          name="body"
          rows={3}
          required
          placeholder="Write a comment or resolution note..."
          className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
        />

        <div className="flex items-center justify-between">
          {isAdmin && (
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              Mark as Internal Note (Admin only)
            </label>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="ml-auto bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2 rounded-lg text-sm transition disabled:opacity-50"
          >
            {isPending ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>
    </div>
  );
}