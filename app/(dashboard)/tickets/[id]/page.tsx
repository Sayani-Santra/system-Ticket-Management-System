import { createSessionClient } from '@/app/lib/appwrite/server';
import { APPWRITE_CONFIG } from '@/app/lib/appwrite/config';
import { getCurrentUser } from '@/app/actions/auth';
import { resolveTicket, getTicketComments, addComment } from '@/app/actions/tickets';
import { getAdminStaffList, forceReassignTicket } from '@/app/actions/admin';
import { ServerAdminControlPanel } from '@/app/components/ServerAdminControlPanel';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface TicketPageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketDetailPage({ params }: TicketPageProps) {
  const { id } = await params;
  const { user, role } = await getCurrentUser();

  if (!user) return <div>Please log in to view this ticket.</div>;

  let ticket: any = null;

  try {
    const { databases } = await createSessionClient();
    ticket = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.tickets,
      id
    );
  } catch (error) {
    notFound();
  }

  const { comments } = await getTicketComments(id);
  const isAdmin = role === 'admin' || role === 'superadmin';
  const isSuperAdmin = role === 'superadmin';

  // Fetch admins list if user is a Super Admin
  const { admins } = isSuperAdmin ? await getAdminStaffList() : { admins: [] };

  // Server Action handler for resolving tickets
  async function handleResolve(formData: FormData) {
    'use server';
    const note = formData.get('resolutionNote') as string;
    await resolveTicket(id, note);
  }

  // Server Action handler for adding comments
  async function handleAddComment(formData: FormData) {
    'use server';
    await addComment(formData);
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link href="/tickets" className="text-sm text-blue-600 hover:underline">
          &larr; Back to Tickets
        </Link>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full uppercase">
            Priority: {ticket.priority}
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full uppercase">
            Status: {ticket.status}
          </span>
        </div>
      </div>

      {/* Ticket Details Box */}
      <div className="bg-white rounded-lg border p-6 space-y-4 shadow-sm">
        <div className="border-b pb-3">
          <p className="text-xs font-mono text-gray-500">ID: {ticket.$id}</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{ticket.title}</h1>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 p-4 rounded-md">
          <div>
            <span className="text-gray-500 block text-xs">Category</span>
            <span className="font-medium text-gray-800">{ticket.categoryId || 'General'}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">Raised By ID</span>
            <span className="font-medium text-gray-800">{ticket.raisedById}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">Assigned To</span>
            <span className="font-medium text-gray-800">
              {ticket.assignedToName || ticket.assignedToId || 'Unassigned'}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">Created At</span>
            <span className="font-medium text-gray-800">
              {new Date(ticket.$createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-700">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
            {ticket.description}
          </p>
        </div>

        {/* Attachment Link */}
        {ticket.attachmentId && (
          <div className="border-t pt-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Attachment</h3>
            <p className="text-xs text-gray-500 font-mono">ID: {ticket.attachmentId}</p>
          </div>
        )}

        {/* Display Resolution Note */}
        {ticket.resolutionNote && (
          <div className="border-t pt-3 bg-green-50 p-4 rounded-md border-green-200">
            <h3 className="text-sm font-semibold text-green-900">Resolution Note</h3>
            <p className="text-sm text-green-800 mt-1">{ticket.resolutionNote}</p>
          </div>
        )}
      </div>

      {/* Server Admin Management Box (Sanitized to fix Next.js Client Component serialization) */}
      {isAdmin && (
        <ServerAdminControlPanel ticket={JSON.parse(JSON.stringify(ticket))} />
      )}

      {/* Super Admin Control Panel */}
      {isSuperAdmin && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-purple-900 uppercase tracking-wide">
            Super Admin Controls
          </h2>

          <form
            action={async (formData: FormData) => {
              'use server';
              await forceReassignTicket(formData);
            }}
            className="space-y-3"
          >
            <input type="hidden" name="ticketId" value={id} />

            <div>
              <label className="block text-xs font-medium text-purple-900 mb-1">
                Reassign Ticket to Staff Member
              </label>
              <select
                name="assigneeId"
                required
                className="w-full border rounded p-2 text-xs bg-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select an admin...</option>
                {admins.map((admin: any) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name} ({admin.role})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-purple-700 text-white font-semibold text-xs rounded hover:bg-purple-800"
            >
              Reassign Ticket
            </button>
          </form>
        </div>
      )}

      {/* Conversation Thread */}
      <div className="bg-white rounded-lg border p-6 space-y-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Conversation Thread</h2>

        <div className="space-y-4">
          {!comments || comments.length === 0 ? (
            <p className="text-sm text-gray-500">No comments yet.</p>
          ) : (
            comments.map((comment: any) => (
              <div
                key={comment.$id}
                className={`p-4 rounded-lg border text-sm ${
                  comment.isInternal
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {comment.authorName || comment.authorId}
                    </span>
                    {comment.isInternal && (
                      <span className="bg-amber-600 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                        INTERNAL NOTE
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.$createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap">{comment.body}</p>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Form */}
        <form action={handleAddComment} className="pt-4 border-t space-y-3">
          <input type="hidden" name="ticketId" value={id} />
          <textarea
            name="body"
            required
            rows={3}
            placeholder="Write a message or update..."
            className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex items-center justify-between">
            {isAdmin && (
              <label className="flex items-center text-xs text-gray-600 font-medium">
                <input type="checkbox" name="isInternal" value="true" className="mr-2" />
                Internal update (visible only to staff)
              </label>
            )}
            <button
              type="submit"
              className="ml-auto px-4 py-2 bg-blue-600 text-white font-medium rounded-md text-sm hover:bg-blue-700"
            >
              Post Comment
            </button>
          </div>
        </form>
      </div>

      {/* Admin/Support Resolution Section */}
      {isAdmin && ticket.status !== 'resolved' && (
        <div className="bg-white rounded-lg border p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Resolve Ticket</h2>
          <form action={handleResolve} className="space-y-3">
            <textarea
              name="resolutionNote"
              required
              rows={3}
              placeholder="Provide details on how the issue was resolved..."
              className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-md text-sm hover:bg-green-700"
            >
              Mark as Resolved
            </button>
          </form>
        </div>
      )}
    </div>
  );
}