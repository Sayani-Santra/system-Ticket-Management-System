'use server';

import { createSessionClient, createAdminClient } from '@/app/lib/appwrite/server';
import { APPWRITE_CONFIG } from '@/app/lib/appwrite/config';
import { getCurrentUser } from '@/app/actions/auth';
import { ID, Query, Permission, Role, Models } from 'node-appwrite';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface GetTicketsFilters {
  status?: string;
  priority?: string;
  search?: string;
  assignedTo?: string;
}

// Helper to check if current user is staff (Admin or Super Admin)
async function verifyStaff() {
  const { user, role } = await getCurrentUser();
  if (!user || (role !== 'admin' && role !== 'superadmin')) {
    throw new Error('Unauthorized: Staff access required.');
  }
  return { user, role };
}

// 1. Create Ticket Action
export async function createTicket(formData: FormData) {
  const { user } = await getCurrentUser();

  if (!user) {
    return { error: 'You must be logged in to create a ticket.' };
  }

  const title = (formData.get('title') as string)?.trim();
  const description = (formData.get('description') as string)?.trim();
  const categoryId = (formData.get('categoryId') as string)?.trim() || 'general';
  const priority = (formData.get('priority') as string)?.trim() || 'medium';
  const attachmentId = (formData.get('attachmentId') as string) || null;

  if (!title || !description) {
    return { error: 'Title and description are required.' };
  }

  try {
    const { databases } = await createSessionClient();

    await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.tickets,
      ID.unique(),
      {
        title,
        description,
        categoryId,
        priority,
        status: 'new',
        raisedById: user.$id,
        assignedToId: null,
        assignedToName: null,
        attachmentId,
        resolutionNote: null,
        isEscalated: false,
      },
      [
        Permission.read(Role.user(user.$id)),
        Permission.update(Role.user(user.$id)),
        Permission.read(Role.any()),
      ]
    );

    revalidatePath('/tickets');
  } catch (error: any) {
    console.error('Create Ticket Error:', error);
    return { error: error?.message || 'Failed to create ticket.' };
  }

  redirect('/tickets');
}

// 2. Update Ticket Status
export async function updateTicketStatus(
  ticketId: string,
  status: string,
  resolutionNote?: string
) {
  const { user } = await getCurrentUser();
  if (!user) return { error: 'Unauthorized access.' };

  try {
    const { databases } = await createSessionClient();

    const updateData: Record<string, any> = { status };
    if (resolutionNote !== undefined) {
      updateData.resolutionNote = resolutionNote.trim();
    }

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.tickets,
      ticketId,
      updateData
    );

    revalidatePath(`/tickets/${ticketId}`);
    revalidatePath('/tickets');
    return { success: true };
  } catch (error: any) {
    return { error: error?.message || 'Failed to update ticket status.' };
  }
}

// 3. Resolve Ticket Action
export async function resolveTicket(ticketId: string, resolutionNote: string) {
  if (!resolutionNote?.trim()) {
    return { error: 'A resolution note is required to resolve a ticket.' };
  }

  return updateTicketStatus(ticketId, 'resolved', resolutionNote);
}

// 4. Reopen Ticket Action
export async function reopenTicket(ticketId: string) {
  const { user } = await getCurrentUser();
  if (!user) return { error: 'Unauthorized access.' };

  try {
    const { databases } = await createSessionClient();

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.tickets,
      ticketId,
      {
        status: 'in_progress',
        resolutionNote: null,
      }
    );

    revalidatePath(`/tickets/${ticketId}`);
    revalidatePath('/tickets');
    return { success: true };
  } catch (error: any) {
    return { error: error?.message || 'Failed to reopen ticket.' };
  }
}

// 5. Escalate Ticket Action
export async function escalateTicket(ticketId: string) {
  const { user } = await getCurrentUser();
  if (!user) return { error: 'Unauthorized access.' };

  try {
    const { databases } = await createSessionClient();

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.tickets,
      ticketId,
      {
        isEscalated: true,
        priority: 'urgent',
      }
    );

    revalidatePath(`/tickets/${ticketId}`);
    revalidatePath('/tickets');
    return { success: true };
  } catch (error: any) {
    return { error: error?.message || 'Failed to escalate ticket.' };
  }
}

// 6. Assign / Reassign Ticket
export async function assignTicket(
  ticketId: string,
  assigneeId: string,
  assigneeName?: string
) {
  try {
    await verifyStaff();
    const { databases } = await createSessionClient();

    const updateData: Record<string, any> = {
      assignedToId: assigneeId,
      status: 'in_progress',
    };

    if (assigneeName) {
      updateData.assignedToName = assigneeName;
    }

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.tickets,
      ticketId,
      updateData
    );

    revalidatePath(`/tickets/${ticketId}`);
    revalidatePath('/tickets');
    return { success: true };
  } catch (error: any) {
    return { error: error?.message || 'Failed to assign ticket.' };
  }
}

// 7. Pickup Ticket (Self-Assignment)
export async function pickupTicket(ticketId: string) {
  try {
    const { user } = await verifyStaff();
    const name = user.name || user.email || 'Admin';
    return assignTicket(ticketId, user.$id, name);
  } catch (error: any) {
    return { error: error?.message || 'Failed to claim ticket.' };
  }
}

// 8. Update Ticket Status & Priority Dynamically (Server Admin Control Panel)
export async function updateTicketStatusAndPriority(formData: FormData) {
  try {
    await verifyStaff();
    const { databases } = await createSessionClient();

    const ticketId = formData.get('ticketId') as string;
    const status = formData.get('status') as string;
    const priority = formData.get('priority') as string;

    // Fetch the existing document to preserve its current isEscalated value
    const existingTicket = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.tickets,
      ticketId
    );

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.tickets,
      ticketId,
      {
        status,
        priority,
        isEscalated: existingTicket.isEscalated ?? false,
      }
    );

    revalidatePath(`/tickets/${ticketId}`);
    revalidatePath('/tickets');
    return { success: true };
  } catch (error: any) {
    return { error: error?.message || 'Failed to update ticket.' };
  }
}

// 9. Get Tickets with Filters
export async function getTickets(filters?: GetTicketsFilters) {
  try {
    const { user, role } = await getCurrentUser();

    if (!user) return { tickets: [], error: 'Unauthorized' };

    const { databases } = await createSessionClient();
    const queries: string[] = [Query.orderDesc('$createdAt')];

    if (role === 'user') {
      queries.push(Query.equal('raisedById', user.$id));
    } else if (filters?.assignedTo === 'unassigned') {
      queries.push(Query.isNull('assignedToId'));
    } else if (filters?.assignedTo) {
      queries.push(Query.equal('assignedToId', filters.assignedTo));
    }

    if (filters?.status && filters.status !== 'all') {
      queries.push(Query.equal('status', filters.status));
    }

    if (filters?.priority && filters.priority !== 'all') {
      queries.push(Query.equal('priority', filters.priority));
    }

    if (filters?.search?.trim()) {
      queries.push(Query.search('title', filters.search.trim()));
    }

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.tickets,
      queries
    );

    return { tickets: response.documents, error: null };
  } catch (error: any) {
    console.error('Get Tickets Error:', error);
    return { tickets: [], error: error?.message || 'Failed to fetch tickets.' };
  }
}

// 10. Fetch Ticket Comments
export async function getTicketComments(ticketId: string) {
  const { user, role } = await getCurrentUser();
  if (!user) return { comments: [], error: 'Unauthorized' };

  try {
    const { databases } = await createSessionClient();
    const queries = [
      Query.equal('ticketId', ticketId),
      Query.orderAsc('$createdAt'),
    ];

    if (role === 'user') {
      queries.push(Query.equal('isInternal', false));
    }

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.comments,
      queries
    );

    return { comments: response.documents, error: null };
  } catch (error: any) {
    return { comments: [], error: error?.message || 'Failed to fetch comments.' };
  }
}

// 11. Add Comment Action
export async function addComment(formData: FormData) {
  const { user, role } = await getCurrentUser();
  if (!user) return { error: 'Unauthorized access.' };

  const ticketId = formData.get('ticketId') as string;
  const body = (formData.get('body') as string)?.trim();
  const isInternal = formData.get('isInternal') === 'true';

  if (!ticketId || !body) {
    return { error: 'Comment body is required.' };
  }

  const isAdmin = role === 'admin' || role === 'superadmin';

  try {
    const { databases } = await createSessionClient();
    await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.comments,
      ID.unique(),
      {
        ticketId,
        authorId: user.$id,
        authorName: user.name || user.email || 'Anonymous',
        body,
        isInternal: isAdmin ? isInternal : false,
      }
    );

    revalidatePath(`/tickets/${ticketId}`);
    return { success: true };
  } catch (error: any) {
    return { error: error?.message || 'Failed to post comment.' };
  }
}

// 12. Fetch Admin Users for Assignment
export async function getAdminUsers() {
  try {
    await verifyStaff();
    const { users } = await createAdminClient();
    const response = await users.list();

    const admins = response.users.map((u: Models.User<Models.Preferences>) => ({
      id: u.$id,
      name: u.name || u.email,
    }));

    return { admins };
  } catch (error) {
    console.error('Failed to fetch admins:', error);
    return { admins: [] };
  }
}