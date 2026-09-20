'use server';

import { createAdminClient } from '@/app/lib/appwrite/server';
import { APPWRITE_CONFIG } from '@/app/lib/appwrite/config';
import { logTicketActivity } from '@/app/actions/tickets';
import { getCurrentUser } from '@/app/actions/auth';
import { revalidatePath } from 'next/cache';

export async function forceReassignTicket(formData: FormData) {
  const { user, role } = await getCurrentUser();

  if (!user || (role as string) !== 'superadmin') {
    return { error: 'Unauthorized: Only Super Admins can force reassign tickets.' };
  }

  const ticketId = formData.get('ticketId') as string;
  const assigneeId = formData.get('assigneeId') as string;

  if (!ticketId || !assigneeId) {
    return { error: 'Ticket ID and Assignee ID are required.' };
  }

  try {
    const { databases, users } = await createAdminClient();

    // 1. Fetch details of the staff member being assigned
    const assignedUser = await users.get(assigneeId);
    const assigneeName = assignedUser.name || assignedUser.email || 'Admin Staff';

    // 2. Fetch current ticket to compare previous values
    const existingTicket = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.tickets,
      ticketId
    );

    // 3. Update BOTH assignedToId and assignedToName
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.tickets,
      ticketId,
      {
        assignedToId: assigneeId,
        assignedToName: assigneeName,
        status: existingTicket.status === 'new' ? 'in_progress' : existingTicket.status,
      }
    );

    // 4. Log reassignment activity
    await logTicketActivity({
      ticketId,
      performedBy: user.name || user.email || 'Super Admin',
      action: 'ASSIGNED',
      details: `Super Admin reassigned ticket to ${assigneeName}`,
      previousValue: existingTicket.assignedToName || 'Unassigned',
      newValue: assigneeName,
    });

    revalidatePath(`/tickets/${ticketId}`);
    revalidatePath('/tickets');
    return { success: true };
  } catch (error: any) {
    console.error('Force Reassign Error:', error);
    return { error: error?.message || 'Failed to reassign ticket.' };
  }
}