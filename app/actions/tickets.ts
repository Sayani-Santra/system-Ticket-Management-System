
'use server';

import {
  createSessionClient,
  createAdminClient,
} from '@/app/lib/appwrite/server';
import { ID, Query } from 'node-appwrite';
import { revalidatePath } from 'next/cache';

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const TICKETS_COLLECTION =
  process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TICKETS || 'tickets';
const COMMENTS_COLLECTION =
  process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_COMMENTS || 'comments';

// ======================================================
// 1. Create Ticket
// ======================================================

export async function createTicket(formData: FormData) {
  try {
    const { databases } = await createSessionClient();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    const categoryId =
      (formData.get('categoryId') as string) ||
      (formData.get('category') as string) ||
      'general';

    const priority =
      (formData.get('priority') as string) || 'medium';

    const ticketNumber = `TCK-${Math.floor(
      10000 + Math.random() * 90000
    )}`;

    const ticket = await databases.createDocument(
      DB_ID,
      TICKETS_COLLECTION,
      ID.unique(),
      {
        ticketNumber,
        title,
        description,
        categoryId,
        priority,
        status: 'open',
      }
    );

    revalidatePath('/tickets');
    revalidatePath('/dashboard');

    return {
      success: true,
      ticketId: ticket.$id,
    };
  } catch (error: any) {
    console.error('Create Ticket Error:', error);

    return {
      success: false,
      error: error.message || 'Failed to create ticket',
    };
  }
}

// ======================================================
// 2. Get Tickets
// ======================================================

export async function getTickets(filters?: {
  status?: string;
  priority?: string;
  search?: string;
  assignedTo?: string;
}) {
  try {
    const { databases } = await createSessionClient();

    const queries = [
      Query.orderDesc('$createdAt'),
    ];

    if (filters?.status && filters.status !== 'all') {
      queries.push(
        Query.equal('status', filters.status)
      );
    }

    if (filters?.priority && filters.priority !== 'all') {
      queries.push(
        Query.equal('priority', filters.priority)
      );
    }

    if (
      filters?.assignedTo &&
      filters.assignedTo !== 'all'
    ) {
      if (filters.assignedTo === 'unassigned') {
        queries.push(
          Query.isNull('assignedToId')
        );
      } else {
        queries.push(
          Query.equal(
            'assignedToId',
            filters.assignedTo
          )
        );
      }
    }

    const response = await databases.listDocuments(
      DB_ID,
      TICKETS_COLLECTION,
      queries
    );

    let tickets = response.documents;

    if (filters?.search) {
      const searchLower =
        filters.search.toLowerCase();

      tickets = tickets.filter((ticket: any) =>
        ticket.title
          ?.toLowerCase()
          .includes(searchLower)
      );
    }

    return {
      tickets,
      error: null,
    };
  } catch (error: any) {
    return {
      tickets: [],
      error:
        error.message || 'Failed to fetch tickets',
    };
  }
}

// ======================================================
// 3. Get Admin / Staff Users
// ======================================================

export async function getAdminUsers() {
  try {
    const { users } = await createAdminClient();

    const response = await users.list();

    const admins = response.users.map((user: any) => ({
      id: user.$id,
      name: user.name || user.email,
      email: user.email,
    }));

    return {
      admins,
      error: null,
    };
  } catch (error: any) {
    return {
      admins: [],
      error: error.message,
    };
  }
}

// ======================================================
// 4. Get Dashboard Metrics + Reports
// ======================================================

export async function getDashboardMetrics() {
  try {
    const { databases, account } =
      await createSessionClient();

    const currentUser = await account.get();

    const response = await databases.listDocuments(
      DB_ID,
      TICKETS_COLLECTION,
      [
        Query.limit(100),
        Query.orderDesc('$createdAt'),
      ]
    );

    const tickets = response.documents;

    // ==================================================
    // BASIC COUNTS
    // ==================================================

    const total = tickets.length;

    const open = tickets.filter((ticket: any) =>
      ticket.status === 'open' ||
      ticket.status === 'new'
    ).length;

    const inProgress = tickets.filter(
      (ticket: any) =>
        ticket.status === 'in_progress' ||
        ticket.status === 'in-progress'
    ).length;

    const resolved = tickets.filter(
      (ticket: any) =>
        ticket.status === 'resolved' ||
        ticket.status === 'closed'
    ).length;

    // ==================================================
    // REPORT COUNTS
    // ==================================================

    const closedTicketsCount = tickets.filter(
      (ticket: any) =>
        ticket.status === 'closed' ||
        ticket.status === 'resolved'
    ).length;

    const reopenedTicketsCount = tickets.filter(
      (ticket: any) =>
        ticket.status === 'reopened'
    ).length;

    const escalatedTicketsCount = tickets.filter(
      (ticket: any) =>
        ticket.status === 'escalated'
    ).length;

    // ==================================================
    // TICKETS BY CATEGORY
    // ==================================================

    const ticketsByCategory: Record<
      string,
      number
    > = {};

    tickets.forEach((ticket: any) => {
      const category =
        ticket.categoryId || 'General';

      ticketsByCategory[category] =
        (ticketsByCategory[category] || 0) + 1;
    });

    // ==================================================
    // TICKETS BY PRIORITY
    // ==================================================

    const ticketsByPriority: Record<
      string,
      number
    > = {};

    tickets.forEach((ticket: any) => {
      const priority =
        ticket.priority || 'medium';

      ticketsByPriority[priority] =
        (ticketsByPriority[priority] || 0) + 1;
    });

    // ==================================================
    // TICKETS BY ADMIN
    // ==================================================

    const ticketsByAdmin: Record<
      string,
      number
    > = {};

    tickets.forEach((ticket: any) => {
      const admin =
        ticket.assignedToName || 'Unassigned';

      ticketsByAdmin[admin] =
        (ticketsByAdmin[admin] || 0) + 1;
    });

    // ==================================================
    // ADMIN PERFORMANCE
    // ==================================================

    const adminMap: Record<
      string,
      {
        name: string;
        assignedCount: number;
        resolvedCount: number;
        resolutionTimes: number[];
      }
    > = {};

    tickets.forEach((ticket: any) => {
      if (!ticket.assignedToId) {
        return;
      }

      const adminId = ticket.assignedToId;

      const adminName =
        ticket.assignedToName || 'Unknown Admin';

      if (!adminMap[adminId]) {
        adminMap[adminId] = {
          name: adminName,
          assignedCount: 0,
          resolvedCount: 0,
          resolutionTimes: [],
        };
      }

      adminMap[adminId].assignedCount++;

      const isResolved =
        ticket.status === 'resolved' ||
        ticket.status === 'closed';

      if (isResolved) {
        adminMap[adminId].resolvedCount++;

        // Appwrite automatically provides:
        // $createdAt and $updatedAt

        if (
          ticket.$createdAt &&
          ticket.$updatedAt
        ) {
          const createdTime = new Date(
            ticket.$createdAt
          ).getTime();

          const updatedTime = new Date(
            ticket.$updatedAt
          ).getTime();

          const difference =
            updatedTime - createdTime;

          const hours =
            difference /
            (1000 * 60 * 60);

          if (hours >= 0) {
            adminMap[
              adminId
            ].resolutionTimes.push(hours);
          }
        }
      }
    });

    const adminPerformanceSummary =
      Object.values(adminMap).map((admin) => {
        const averageResolution =
          admin.resolutionTimes.length > 0
            ? admin.resolutionTimes.reduce(
                (sum, value) => sum + value,
                0
              ) /
              admin.resolutionTimes.length
            : 0;

        return {
          name: admin.name,
          assignedCount:
            admin.assignedCount,
          resolvedCount:
            admin.resolvedCount,
          avgResolutionTimeHours:
            `${averageResolution.toFixed(1)} hrs`,
        };
      });

    // ==================================================
    // OVERALL AVERAGE RESOLUTION TIME
    // ==================================================

    const resolutionTimes: number[] = [];

    tickets.forEach((ticket: any) => {
      const isResolved =
        ticket.status === 'resolved' ||
        ticket.status === 'closed';

      if (
        isResolved &&
        ticket.$createdAt &&
        ticket.$updatedAt
      ) {
        const createdTime = new Date(
          ticket.$createdAt
        ).getTime();

        const updatedTime = new Date(
          ticket.$updatedAt
        ).getTime();

        const difference =
          updatedTime - createdTime;

        const hours =
          difference /
          (1000 * 60 * 60);

        if (hours >= 0) {
          resolutionTimes.push(hours);
        }
      }
    });

    const averageResolution =
      resolutionTimes.length > 0
        ? resolutionTimes.reduce(
            (sum, value) => sum + value,
            0
          ) / resolutionTimes.length
        : 0;

    const avgResolutionTimeHours =
      `${averageResolution.toFixed(1)} hrs`;

    // ==================================================
    // SERVER ADMIN METRICS
    // ==================================================

    const assignedToMe = tickets.filter(
      (ticket: any) =>
        ticket.assignedToId === currentUser.$id
    );

    const serverAdminStats = {
      assigned: assignedToMe.length,

      inProgress: assignedToMe.filter(
        (ticket: any) =>
          ticket.status === 'in_progress' ||
          ticket.status === 'in-progress'
      ).length,

      critical: assignedToMe.filter(
        (ticket: any) =>
          ticket.priority === 'critical' ||
          ticket.priority === 'high'
      ).length,

      overdue: assignedToMe.filter(
        (ticket: any) =>
          ticket.status === 'overdue'
      ).length,
    };

    // ==================================================
    // SUPER ADMIN DATA
    // ==================================================

    const categoryBreakdown =
      Object.entries(ticketsByCategory).map(
        ([name, count]) => ({
          name,
          count,
        })
      );

    const priorityBreakdown =
      Object.entries(ticketsByPriority).map(
        ([name, count]) => ({
          name,
          count,
        })
      );

    const adminWorkload =
      Object.entries(ticketsByAdmin).map(
        ([name, count]) => ({
          name,
          count,
        })
      );

    // ==================================================
    // RETURN EVERYTHING
    // ==================================================

    return {
      reports: {
        totalTicketsCount: total,
        openTicketsCount: open,
        closedTicketsCount:
          closedTicketsCount,
        reopenedTicketsCount:
          reopenedTicketsCount,
        escalatedTicketsCount:
          escalatedTicketsCount,

        ticketsByCategory,
        ticketsByPriority,
        ticketsByAdmin,

        avgResolutionTimeHours,

        adminPerformanceSummary,
      },

      // Super Admin Dashboard
      superAdmin: {
        stats: {
          total,
          open,
          inProgress,
          resolved,
        },

        categoryBreakdown,
        priorityBreakdown,
        adminWorkload,
      },

      // Server Admin Dashboard
      serverAdmin: {
        stats: serverAdminStats,

        recentUpdates:
          assignedToMe.slice(0, 5),
      },

      // User Dashboard
      user: {
        stats: {
          total,
          open,
          resolved,
        },

        recentTickets:
          tickets.slice(0, 5),
      },

      error: null,
    };
  } catch (error: any) {
    console.error(
      'Dashboard Metrics Error:',
      error
    );

    return {
      reports: {
        totalTicketsCount: 0,
        openTicketsCount: 0,
        closedTicketsCount: 0,
        reopenedTicketsCount: 0,
        escalatedTicketsCount: 0,

        ticketsByCategory: {},
        ticketsByPriority: {},
        ticketsByAdmin: {},

        avgResolutionTimeHours: '0.0 hrs',

        adminPerformanceSummary: [],
      },

      superAdmin: {
        stats: {
          total: 0,
          open: 0,
          inProgress: 0,
          resolved: 0,
        },

        categoryBreakdown: [],
        priorityBreakdown: [],
        adminWorkload: [],
      },

      serverAdmin: {
        stats: {
          assigned: 0,
          inProgress: 0,
          critical: 0,
          overdue: 0,
        },

        recentUpdates: [],
      },

      user: {
        stats: {
          total: 0,
          open: 0,
          resolved: 0,
        },

        recentTickets: [],
      },

      error:
        error.message ||
        'Failed to load dashboard metrics',
    };
  }
}

// ======================================================
// 5. Resolve Ticket
// ======================================================

export async function resolveTicket(
  ticketIdOrObject:
    | string
    | {
        ticketId: string;
        resolutionDescription?: string;
        resolutionNote?: string;
      },
  resolutionNote?: string
) {
  try {
    const { databases } =
      await createSessionClient();

    let targetTicketId = '';
    let note =
      'Resolved by support staff';

    if (
      typeof ticketIdOrObject === 'object'
    ) {
      targetTicketId =
        ticketIdOrObject.ticketId;

      note =
        ticketIdOrObject.resolutionDescription ||
        ticketIdOrObject.resolutionNote ||
        note;
    } else {
      targetTicketId =
        ticketIdOrObject;

      note =
        resolutionNote || note;
    }

    await databases.updateDocument(
      DB_ID,
      TICKETS_COLLECTION,
      targetTicketId,
      {
        status: 'resolved',
        resolutionNote: note,
      }
    );

    revalidatePath(
      `/tickets/${targetTicketId}`
    );

    revalidatePath('/tickets');
    revalidatePath('/dashboard');

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// ======================================================
// 6. Get Ticket Comments
// ======================================================

export async function getTicketComments(
  ticketId: string
) {
  try {
    const { databases } =
      await createSessionClient();

    const response =
      await databases.listDocuments(
        DB_ID,
        COMMENTS_COLLECTION,
        [
          Query.equal(
            'ticketId',
            ticketId
          ),
          Query.orderAsc('$createdAt'),
        ]
      );

    return {
      comments: response.documents,
      error: null,
    };
  } catch (error: any) {
    return {
      comments: [],
      error: error.message,
    };
  }
}

// ======================================================
// 7. Add Comment
// ======================================================

export async function addComment(
  formData: FormData
) {
  try {
    const { databases, account } =
      await createSessionClient();

    const user = await account.get();

    const ticketId =
      formData.get('ticketId') as string;

    const body =
      formData.get('body') as string;

    const isInternal =
      formData.get('isInternal') === 'true';

    const comment =
      await databases.createDocument(
        DB_ID,
        COMMENTS_COLLECTION,
        ID.unique(),
        {
          ticketId,
          authorId: user.$id,
          body,
          isInternal,
          authorName:
            user.name ||
            user.email ||
            'Support Agent',
        }
      );

    revalidatePath(
      `/tickets/${ticketId}`
    );

    return {
      success: true,
      comment,
    };
  } catch (error: any) {
    console.error(
      'Add Comment Error:',
      error
    );

    return {
      success: false,
      error:
        error.message ||
        'Failed to add comment',
    };
  }
}

// ======================================================
// 8. Assign / Reassign Ticket
// ======================================================

export async function assignTicket(
  ticketIdOrData:
    | string
    | {
        ticketId: string;
        adminId?: string;
        assignedToId?: string;
        assignedToName?: string;
      },
  adminIdParam?: string,
  adminNameParam?: string
) {
  try {
    const { databases } =
      await createSessionClient();

    let targetTicketId = '';
    let targetAdminId = '';
    let targetAdminName = '';

    if (
      typeof ticketIdOrData === 'object'
    ) {
      targetTicketId =
        ticketIdOrData.ticketId;

      targetAdminId =
        ticketIdOrData.adminId ||
        ticketIdOrData.assignedToId ||
        '';

      targetAdminName =
        ticketIdOrData.assignedToName ||
        '';
    } else {
      targetTicketId =
        ticketIdOrData;

      targetAdminId =
        adminIdParam || '';

      targetAdminName =
        adminNameParam || '';
    }

    await databases.updateDocument(
      DB_ID,
      TICKETS_COLLECTION,
      targetTicketId,
      {
        assignedToId:
          targetAdminId,

        assignedToName:
          targetAdminName,
      }
    );

    revalidatePath(
      `/tickets/${targetTicketId}`
    );

    revalidatePath('/tickets');
    revalidatePath('/dashboard');

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error:
        error.message ||
        'Failed to reassign ticket',
    };
  }
}

// ======================================================
// 9. Update Ticket Status and Priority
// ======================================================

export async function updateTicketStatusAndPriority(
  ticketIdOrData:
    | string
    | {
        ticketId: string;
        status?: string;
        priority?: string;
        resolutionNote?: string;
      },
  statusParam?: string,
  priorityParam?: string
) {
  try {
    const { databases } =
      await createSessionClient();

    let targetTicketId = '';
    let newStatus = '';
    let newPriority = '';

    let resolutionNote =
      'Updated status/priority';

    if (
      typeof ticketIdOrData === 'object'
    ) {
      targetTicketId =
        ticketIdOrData.ticketId;

      newStatus =
        ticketIdOrData.status || '';

      newPriority =
        ticketIdOrData.priority || '';

      if (
        ticketIdOrData.resolutionNote
      ) {
        resolutionNote =
          ticketIdOrData.resolutionNote;
      }
    } else {
      targetTicketId =
        ticketIdOrData;

      newStatus =
        statusParam || '';

      newPriority =
        priorityParam || '';
    }

    const updatePayload: Record<
      string,
      any
    > = {};

    if (newStatus) {
      updatePayload.status =
        newStatus;
    }

    if (newPriority) {
      updatePayload.priority =
        newPriority;
    }

    updatePayload.resolutionNote =
      resolutionNote;

    await databases.updateDocument(
      DB_ID,
      TICKETS_COLLECTION,
      targetTicketId,
      updatePayload
    );

    revalidatePath(
      `/tickets/${targetTicketId}`
    );

    revalidatePath('/tickets');
    revalidatePath('/dashboard');

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error:
        error.message ||
        'Failed to update ticket status/priority',
    };
  }
}

