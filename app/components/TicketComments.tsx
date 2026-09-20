'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface Comment {
  $id: string;
  content: string;
  userName: string;
  userRole?: string;
  isInternal: boolean;
  $createdAt: string;
}

interface TicketCommentsProps {
  ticketId: string;
  comments: Comment[];
  isStaff: boolean; // True if user is admin, superadmin, or server_admin
  addCommentAction: (formData: FormData) => Promise<{ error?: string }>;
}

export default function TicketComments({
  ticketId,
  comments = [],
  isStaff,
  addCommentAction,
}: TicketCommentsProps) {
  const [content, setContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setErrorMessage(null);

    const formData = new FormData();
    formData.append('ticketId', ticketId);
    formData.append('content', content);
    formData.append('isInternal', String(isInternal));

    startTransition(async () => {
      const res = await addCommentAction(formData);
      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        setContent('');
        setIsInternal(false);
        router.refresh();
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6 antialiased">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          Conversation Thread
        </h3>
        <span className="text-xs text-slate-500 font-medium">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </span>
      </div>

      {/* Existing Comments Thread */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center italic">
            No comments yet.
          </p>
        ) : (
          comments.map((comment) => {
            const isStaffComment = ['admin', 'superadmin', 'server_admin'].includes(
              comment.userRole || ''
            );

            return (
              <div
                key={comment.$id}
                className={`p-4 rounded-xl border text-sm space-y-2 transition-all ${
                  comment.isInternal
                    ? 'bg-amber-50/70 border-amber-200/80 text-amber-950'
                    : isStaffComment
                    ? 'bg-slate-50 border-slate-200/80 text-slate-800'
                    : 'bg-blue-50/40 border-blue-100/80 text-slate-800'
                }`}
              >
                {/* Author Info & Badges Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      {comment.userName}
                    </span>

                    {/* Staff / Admin Badge */}
                    {isStaffComment && (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-900 text-white tracking-wider">
                        {comment.userRole?.replace('_', ' ')}
                      </span>
                    )}

                    {/* Internal Note Indicator */}
                    {comment.isInternal && (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-200 text-amber-900 border border-amber-300">
                        Internal Staff Note
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-400">
                    {new Date(comment.$createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Comment Content */}
                <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-slate-700">
                  {comment.content}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* New Comment / Reply Form */}
      <form onSubmit={handleSubmit} className="pt-4 border-t border-slate-100 space-y-4">
        {errorMessage && (
          <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-200">
            {errorMessage}
          </p>
        )}

        <div>
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a message or update..."
            required
            className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition shadow-inner resize-y"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Internal Update Toggle (Visible to Staff only) */}
          {isStaff ? (
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-600 select-none">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 transition cursor-pointer"
              />
              <span>Internal update (visible only to staff)</span>
            </label>
          ) : (
            <div />
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending || !content.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          >
            {isPending ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>
    </div>
  );
}