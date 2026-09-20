'use server';

import { createSessionClient, createAdminClient } from '@/app/lib/appwrite/server';
import { APPWRITE_CONFIG } from '@/app/lib/appwrite/config';
import { getCurrentUser } from '@/app/actions/auth';
import { ID, Query, Permission, Role, Models } from 'node-appwrite';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// --- Type Definitions ---

export interface GetTicketsFilters {
  status?: string;
  priority?: string;
  search?: string;
  assignedTo?: string;
}

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical' | 'urgent';

export interface TicketDocument extends Models.Document {
  title: string;
  description?: string;
  status: string;
  priority: string;
  categoryId?: string;
  category?: string;
  raisedById?: string;
  userId?: string;
  assignedToId?: string;
  assignedTo?: string;
  assignedToName?: string;
  isEscalated?: boolean;
  isOverdue?: boolean;
}

export interface TicketActivity {
  $id?: string;
  ticketId: string;
  performedBy: string;
  action: 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'ASSIGNED' | 'RESOLVED' | 'REOPENED';
  details: string;
  previousValue?: string;
  newValue?: string;
  $createdAt?: string;
}

// --- Helper Functions ---

async function verifyStaff() {
  const { user, role } = await getCurrentUser();
  if (!user || (role as string) === 'user') {
    throw new Error('Unauthorized: Staff access required.');
  }
  return { user, role };
}

// Helper to log audit activity into Appwrite
export async function logTicketActivity(activity: Omit<TicketActivity, '$id'| '$createdAt'>) {
  try {
    const { databases } = await createAdminClient();

    if (APPWRITE_CONFIG.collections.activities) {
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.activities,
        ID.unique(),
        {
          ...activity,
          timestamp: new Date().toISOString(),
        }
      );
    }
  } catch (error) {
    console.error('Failed to log ticket activity:', error);
  }
}

// Fetch complete activity log for a specific ticket
export async function getTicketActivities(ticketId: string) {
  // Guard check: prevent Appwrite query if ticketId is invalid or empty
  if (!ticketId || typeof ticketId !== 'string' || !ticketId.trim()) {
    return { activities: [] };
  }

  try {
    const { databases } = await createAdminClient();
    const activitiesCollection = (APPWRITE_CONFIG.collections as Record<string, string | undefined>).activities;

    if (!activitiesCollection) {
      return { activities: [] };
    }

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      activitiesCollection,
      [
        Query.equal('ticketId', ticketId.trim()), 
        Query.orderDesc('$createdAt')
      ]
    );

    return { activities: response.documents as unknown as TicketActivity[] };
  } catch (error) {
    console.error('Error fetching ticket activities:', error);
    return { activities: [] };
  }
}
// --- Core Ticket Actions ---

// 1. Create Ticket Action
export async function createTicket(formData: FormData) {
  const ticketNumber = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

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

    const createdDoc = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.tickets,
      ID.unique(),
    
      {
        title,
        description,
        categoryId,
        ticketNumber,
        priority,
        status: 'new',
        raisedById: user.$id,
        assignedToId: null,
        assignedToName: null,
        isEscalated: false,
      },
      [
        Permission.read(Role.user(user.$id)),
        Permission.update(Role.user(user.$id)),
        Permission.read(Role.any()),
      ]
    );

    await logTicketActivity({
      ticketId: createdDoc.$id,
      performedBy: user.name || user.email || 'User',
      action: 'CREATED',
      details: `Ticket created with title: "${title}"`,
      newValue: 'new',
    });

    revalidatePath('/tickets');
  } catch (error: any) {
    console.error('Create Ticket Error:', error);
    return { error: error?.message || 'Failed to create ticket.' };
  }

  redirect('/tickets');
}

// 2. Update Ticket Status Action
export async function updateTicketStatus(
  ticketId: string,
  newStatus: string,
  resolutionNote?: string,
  assignedToId?: string,
  assignedToName?: string
) {
  const { user } = await getCurrentUser();
  if (!user) return { error: 'Unauthorized access.' };

  try {
    const { databases } = await createAdminClient();

    const existingTicket = await databases.getDocument<TicketDocument>(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.tickets,
      ticketId
    );

    const updates: Record<string, any> = { status: newStatus };
    if (resolutionNote !== undefined) {
      updates.resolutionNote = resolutionNote.trim();
    }
    if (assignedToId) updates.assignedToId = assignedToId;
    if (assignedToName) updates.assignedToName = assignedToName;

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.tickets,
      ticketId,
      updates
    );

    const actor = user.name || user.email || 'System Admin';

    if (existingTicket.status !== newStatus) {
      let actionType: TicketActivity['action'] = 'STATUS_CHANGED';
      if (['resolved', 'closed'].includes(newStatus)) actionType = 'RESOLVED';
      if (newStatus === 'reopened') actionType = 'REOPENED';

      await logTicketActivity({
        ticketId,
        performedBy: actor,
        action: actionType,
        details: `Status updated from "${existingTicket.status}" to "${newStatus}"`,
        previousValue: existingTicket.status,
        newValue: newStatus,
      });
    }

    if (assignedToName && existingTicket.assignedToName !== assignedToName) {
      await logTicketActivity({
        ticketId,
        performedBy: actor,
        action: 'ASSIGNED',
        details: `Ticket assigned to ${assignedToName}`,
        previousValue: existingTicket.assignedToName || 'Unassigned',
        newValue: assignedToName,
      });
    }

    revalidatePath(`/tickets/${ticketId}`);
    revalidatePath('/tickets');
    return { success: true };
  } catch (error: any) {
    return { error: error?.message || 'Failed to update ticket.' };
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
    const { databases } = await createAdminClient();

    const existingTicket = await databases.getDocument<TicketDocument>(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.tickets,
      ticketId
    );

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.tickets,
      ticketId,
      {
        status: 'in_progress',
        resolutionNote: null,
      }
    );

    await logTicketActivity({
      ticketId,
      performedBy: user.name || user.email || 'User',
      action: 'REOPENED',
      details: 'Ticket was reopened by user.',
      previousValue: existingTicket.status,
      newValue: 'in_progress',
    });

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
    const { databases } = await createAdminClient();

    const existingTicket = await databases.getDocument<TicketDocument>(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.tickets,
      ticketId
    );

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.tickets,
      ticketId,
      {
        isEscalated: true,
        priority: 'critical',
      }
    );

    await logTicketActivity({
      ticketId,
      performedBy: user.name || user.email || 'User',
      action: 'UPDATED',
      details: 'Ticket priority escalated to critical.',
      previousValue: existingTicket.priority,
      newValue: 'critical',
    });

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
    const { user } = await verifyStaff();
    const { databases } = await createAdminClient();

    const existingTicket = await databases.getDocument<TicketDocument>(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.tickets,
      ticketId
    );

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

    await logTicketActivity({
      ticketId,
      performedBy: user.name || user.email || 'Admin',
      action: 'ASSIGNED',
      details: `Ticket assigned to ${assigneeName || assigneeId}`,
      previousValue: existingTicket.assignedToName || 'Unassigned',
      newValue: assigneeName || assigneeId,
    });

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

// 8. Update Ticket Status & Priority Dynamically
export async function updateTicketStatusAndPriority(formData: FormData) {
  try {
    const { user } = await verifyStaff();
    const { databases } = await createAdminClient();

    const ticketId = formData.get('ticketId') as string;
    const status = formData.get('status') as string;
    const priority = formData.get('priority') as string;

    const existingTicket = await databases.getDocument<TicketDocument>(
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

    await logTicketActivity({
      ticketId,
      performedBy: user.name || user.email || 'Admin',
      action: 'UPDATED',
      details: `Updated status to "${status}" and priority to "${priority}"`,
      previousValue: `Status: ${existingTicket.status}, Priority: ${existingTicket.priority}`,
      newValue: `Status: ${status}, Priority: ${priority}`,
    });

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

    const { databases } = await createAdminClient();
    const queries: string[] = [Query.orderDesc('$createdAt')];

    if ((role as string) === 'user') {
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

    const response = await databases.listDocuments<TicketDocument>(
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
    const { databases } = await createAdminClient();
    const queries = [
      Query.equal('ticketId', ticketId),
      Query.orderAsc('$createdAt'),
    ];

    if ((role as string) === 'user') {
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

  const userRole = role as string;
  const isAdmin = ['admin', 'superadmin', 'server_admin', 'super_admin'].includes(userRole);

  try {
    const { databases } = await createAdminClient();
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

// 13. Get Dashboard Metrics
export async function getDashboardMetrics(profile: any) {
  try {
    const { databases } = await createAdminClient();

    const response = await databases.listDocuments<TicketDocument>(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.tickets,
      [Query.limit(500), Query.orderDesc('$createdAt')]
    );

    const allTickets = response.documents;
    const currentUserId = profile?.userId || profile?.$id;

    const userTickets = allTickets.filter(
      (t) => t.raisedById === currentUserId || t.userId === currentUserId
    );
    const assignedTickets = allTickets.filter(
      (t) => t.assignedToId === currentUserId || t.assignedTo === currentUserId
    );

    const totalTicketsCount = allTickets.length;
    const openTicketsCount = allTickets.filter((t) =>
      ['new', 'open', 'in_progress'].includes(t.status)
    ).length;
    const closedTicketsCount = allTickets.filter((t) =>
      ['closed', 'resolved'].includes(t.status)
    ).length;
    const reopenedTicketsCount = allTickets.filter((t) => t.status === 'reopened').length;
    const escalatedTicketsCount = allTickets.filter((t) => t.isEscalated === true).length;

    const ticketsByCategory: Record<string, number> = {};
    const ticketsByPriority: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0, urgent: 0 };
    const ticketsByAdmin: Record<string, number> = {};
    const adminPerformanceMap: Record<
      string,
      { name: string; assignedCount: number; resolvedCount: number; totalResolutionTimeMs: number }
    > = {};

    let totalResolutionTimeMs = 0;
    let resolvedCountWithTime = 0;

    allTickets.forEach((t) => {
      const cat = t.category || t.categoryId || 'Uncategorized';
      ticketsByCategory[cat] = (ticketsByCategory[cat] || 0) + 1;

      if (t.priority && ticketsByPriority[t.priority] !== undefined) {
        ticketsByPriority[t.priority] += 1;
      }

      const adminId = t.assignedToId || t.assignedTo;
      const adminName = t.assignedToName || adminId || 'Unassigned';

      if (adminId) {
        ticketsByAdmin[adminName] = (ticketsByAdmin[adminName] || 0) + 1;

        if (!adminPerformanceMap[adminId]) {
          adminPerformanceMap[adminId] = {
            name: adminName,
            assignedCount: 0,
            resolvedCount: 0,
            totalResolutionTimeMs: 0,
          };
        }

        adminPerformanceMap[adminId].assignedCount += 1;

        if (['resolved', 'closed'].includes(t.status)) {
          adminPerformanceMap[adminId].resolvedCount += 1;
        }
      }

      if (['resolved', 'closed'].includes(t.status) && t.$createdAt && t.$updatedAt) {
        const created = new Date(t.$createdAt).getTime();
        const updated = new Date(t.$updatedAt).getTime();
        const duration = updated - created;

        if (duration > 0) {
          totalResolutionTimeMs += duration;
          resolvedCountWithTime += 1;

          if (adminId && adminPerformanceMap[adminId]) {
            adminPerformanceMap[adminId].totalResolutionTimeMs += duration;
          }
        }
      }
    });

    const avgResolutionTimeHours =
      resolvedCountWithTime > 0
        ? (totalResolutionTimeMs / (resolvedCountWithTime * 1000 * 60 * 60)).toFixed(1)
        : '0.0';

    const adminPerformanceSummary = Object.values(adminPerformanceMap).map((admin) => ({
      name: admin.name,
      assignedCount: admin.assignedCount,
      resolvedCount: admin.resolvedCount,
      avgResolutionTimeHours:
        admin.resolvedCount > 0
          ? (admin.totalResolutionTimeMs / (admin.resolvedCount * 1000 * 60 * 60)).toFixed(1)
          : 'N/A',
    }));

    return {
      reports: {
        totalTicketsCount,
        openTicketsCount,
        closedTicketsCount,
        reopenedTicketsCount,
        escalatedTicketsCount,
        ticketsByCategory,
        ticketsByPriority,
        ticketsByAdmin,
        avgResolutionTimeHours: `${avgResolutionTimeHours} hrs`,
        adminPerformanceSummary,
      },
      user: {
        stats: {
          totalRaised: userTickets.length,
          open: userTickets.filter((t) => ['new', 'open', 'in_progress'].includes(t.status)).length,
          resolved: userTickets.filter((t) => ['resolved', 'closed'].includes(t.status)).length,
        },
        recentTickets: userTickets.slice(0, 5),
      },
      serverAdmin: {
        stats: {
          assigned: assignedTickets.length,
          inProgress: assignedTickets.filter((t) => t.status === 'in_progress').length,
          critical: assignedTickets.filter((t) => ['critical', 'high', 'urgent'].includes(t.priority)).length,
          overdue: assignedTickets.filter((t) => t.isOverdue === true).length,
        },
        recentUpdates: assignedTickets.slice(0, 5),
      },
      superAdmin: {
        stats: {
          totalTickets: totalTicketsCount,
          openCount: openTicketsCount,
          resolvedCount: closedTicketsCount,
          escalatedCount: escalatedTicketsCount,
        },
        categoryBreakdown: ticketsByCategory,
        priorityBreakdown: ticketsByPriority,
        adminWorkload: adminPerformanceSummary,
      },
    };
  } catch (error) {
    console.error('Error in getDashboardMetrics:', error);
    return {
      reports: {
        totalTicketsCount: 0,
        openTicketsCount: 0,
        closedTicketsCount: 0,
        reopenedTicketsCount: 0,
        escalatedTicketsCount: 0,
        ticketsByCategory: {},
        ticketsByPriority: { low: 0, medium: 0, high: 0, critical: 0, urgent: 0 },
        ticketsByAdmin: {},
        avgResolutionTimeHours: '0.0 hrs',
        adminPerformanceSummary: [],
      },
      user: { stats: { totalRaised: 0, open: 0, resolved: 0 }, recentTickets: [] },
      serverAdmin: { stats: { assigned: 0, inProgress: 0, critical: 0, overdue: 0 }, recentUpdates: [] },
      superAdmin: {
        stats: { totalTickets: 0, openCount: 0, resolvedCount: 0, escalatedCount: 0 },
        categoryBreakdown: {},
        priorityBreakdown: { low: 0, medium: 0, high: 0, critical: 0, urgent: 0 },
        adminWorkload: [],
      },
    };
  }
}
