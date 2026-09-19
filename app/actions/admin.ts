'use server';

import { createAdminClient } from '@/app/lib/appwrite/server';
import { getCurrentUser } from '@/app/actions/auth';
import { APPWRITE_CONFIG } from '@/app/lib/appwrite/config';
import { revalidatePath } from 'next/cache';
import { Models } from 'node-appwrite';

// 1. Define custom preferences type to fix ts(2339)
export interface UserPreferences extends Models.Preferences {
  role?: string;
}

// Helper middleware to check for Super Admin status
async function verifySuperAdmin() {
  const { user, role } = await getCurrentUser();
  if (!user || role !== 'superadmin') {
    throw new Error('Unauthorized: Super Admin access required.');
  }
  return { user };
}

// 2. Update User Role
export async function updateUserRole(userId: string, newRole: 'user' | 'admin' | 'superadmin') {
  try {
    await verifySuperAdmin();
    const { users } = await createAdminClient();

    const targetUser = await users.get<UserPreferences>(userId);
    await users.updatePrefs(userId, {
      ...targetUser.prefs,
      role: newRole,
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error: any) {
    return { error: error?.message || 'Failed to update user role.' };
  }
}

// 3. Fetch All Admins for Assignment Dropdowns
export async function getAdminStaffList() {
  try {
    await verifySuperAdmin();
    const { users } = await createAdminClient();
    
    // Pass UserPreferences type parameter to list()
    const response = await users.list<UserPreferences>();

    const adminStaff = response.users
      .filter((u: Models.User<UserPreferences>) => 
        u.prefs?.role === 'admin' || u.prefs?.role === 'superadmin'
      )
      .map((u: Models.User<UserPreferences>) => ({
        id: u.$id,
        name: u.name || u.email,
        role: u.prefs?.role || 'admin',
      }));

    return { admins: adminStaff, error: null };
  } catch (error: any) {
    return { admins: [], error: error?.message || 'Failed to fetch admin list.' };
  }
}

// 4. Super Admin Reassign Ticket Action
export async function forceReassignTicket(formData: FormData) {
  try {
    await verifySuperAdmin();
    
    const ticketId = formData.get('ticketId') as string;
    const assigneeId = formData.get('assigneeId') as string;

    if (!ticketId || !assigneeId) {
      return { error: 'Missing ticket ID or assignee selection.' };
    }

    const { users, databases } = await createAdminClient();
    
    // Fetch assignee name to save along with the ID
    const assignee = await users.get(assigneeId);
    const assigneeName = assignee.name || assignee.email || 'Admin';

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.tickets,
      ticketId,
      {
        assignedToId: assigneeId,
        assignedToName: assigneeName,
        status: 'in_progress',
      }
    );

    revalidatePath(`/tickets/${ticketId}`);
    revalidatePath('/tickets');
    return { success: true };
  } catch (error: any) {
    return { error: error?.message || 'Failed to reassign ticket.' };
  }
}