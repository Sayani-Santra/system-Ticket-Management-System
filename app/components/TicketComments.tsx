'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addComment } from '@/app/actions/tickets';

interface Comment {
  $id: string;
  body: string;
  authorName?: string;
  isInternal?: boolean;
  $createdAt?: string;
}

interface TicketCommentsProps {
  ticketId: string;
  comments: Comment[];
}

export default function TicketComments({ ticketId, comments = [] }: TicketCommentsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setError(null);

    const formData = new FormData();
    formData.append('ticketId', ticketId);
    formData.append('body', message); // Maps to 'body' attribute in Appwrite
    formData.append('isInternal', String(isInternal));

    startTransition(async () => {
      const result = await addComment(formData);

      if (result?.success) {
        setMessage('');
        setIsInternal(false);
        router.refresh();
      } else {
        setError(result?.error || 'Failed to post comment');
      }
    });
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      <h2 className="text-lg font-bold text-slate-900">Conversation Thread</h2>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium">
          {error}
        </div>
      )}

      {/* List Comments */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No comments yet.</p>
        ) : (
          comments.map((comment: any) => (
            <div
              key={comment.$id}
              className={`p-4 rounded-xl border ${
                comment.isInternal
                  ? 'bg-amber-50/60 border-amber-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-900">
                    {comment.authorName || 'Support Agent'}
                  </span>
                  {comment.isInternal && (
                    <span className="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-md font-semibold">
                      Internal Note
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400">
                  {new Date(comment.$createdAt || Date.now()).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.body}</p>
            </div>
          ))
        )}
      </div>

      <hr className="border-slate-200" />

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a message or update..."
          required
          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Internal update (visible only to staff)</span>
          </label>

          <button
            type="submit"
            disabled={isPending || !message.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            {isPending ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>
    </div>
  );
}