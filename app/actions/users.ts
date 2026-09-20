'use server';

import { createAdminClient } from '@/app/lib/appwrite/server';
import { APPWRITE_CONFIG } from '@/app/lib/appwrite/config';
import { getCurrentUser } from '@/app/actions/auth';
import { ID, Query } from 'node-appwrite';
import { revalidatePath } from 'next/cache';

export async function getUserProfile() {
  const { user, role } = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  try {
    const { databases } = await createAdminClient();
    let profileDoc = null;

    if (APPWRITE_CONFIG.collections.profiles) {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.profiles,
        [Query.equal('userId', user.$id)]
      );
      profileDoc = response.documents[0] || null;
    }

    return {
      userId: user.$id,
      email: user.email,
      fullName: profileDoc?.fullName || user.name || user.email,
      role: profileDoc?.role || role || 'user',
      isActive: profileDoc?.isActive ?? true,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return {
      userId: user.$id,
      email: user.email,
      fullName: user.name || user.email,
      role: role || 'user',
      isActive: true,
    };
  }
}

export async function createUser(formData: FormData) {
  const email = (formData.get('email') as string)?.trim();
  const name = (formData.get('fullName') as string)?.trim() || (formData.get('name') as string)?.trim();
  const password = (formData.get('password') as string)?.trim();
  const role = (formData.get('role') as string) || 'user';

  if (!email || !password || !name) {
    return { error: 'Name, email, and password are required.' };
  }

  try {
    const { users, databases } = await createAdminClient();
    const newUser = await users.create(ID.unique(), email, undefined, password, name);

    if (APPWRITE_CONFIG.collections.profiles) {
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.profiles,
        newUser.$id,
        {
          userId: newUser.$id,
          email,
          fullName: name,
          role,
          isActive: true,
        }
      );
    }

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating user:', error);
    return { error: error?.message || 'Failed to create user.' };
  }
}

// Fixed signature: expects 1 argument (formData)
export async function updateUser(formData: FormData) {
  const userId = formData.get('userId') as string;
  const name = (formData.get('fullName') as string)?.trim() || (formData.get('name') as string)?.trim();
  const role = formData.get('role') as string;

  if (!userId) {
    return { error: 'User ID is required.' };
  }

  try {
    const { users, databases } = await createAdminClient();

    if (name) {
      await users.updateName(userId, name);
    }

    if (APPWRITE_CONFIG.collections.profiles) {
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.profiles,
        userId,
        {
          ...(name && { fullName: name }),
          ...(role && { role }),
        }
      );
    }

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating user:', error);
    return { error: error?.message || 'Failed to update user.' };
  }
}

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  try {
    const { users, databases } = await createAdminClient();
    const newStatus = !currentStatus;

    await users.updateStatus(userId, newStatus);

    if (APPWRITE_CONFIG.collections.profiles) {
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.profiles,
        userId,
        { isActive: newStatus }
      );
    }

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling user status:', error);
    return { error: error?.message || 'Failed to update user status.' };
  }
}

export async function getUsers() {
  try {
    const { users, databases } = await createAdminClient();
    const response = await users.list();

    let profilesMap: Record<string, any> = {};
    if (APPWRITE_CONFIG.collections.profiles) {
      try {
        const profilesDoc = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.profiles,
          [Query.limit(100)]
        );
        profilesDoc.documents.forEach((p) => {
          profilesMap[p.userId || p.$id] = p;
        });
      } catch (err) {
        console.warn('Could not fetch profiles collection:', err);
      }
    }

    const formattedUsers = response.users.map((u) => {
      const profile = profilesMap[u.$id];
      return {
        $id: u.$id,
        fullName: profile?.fullName || u.name || u.email,
        email: u.email,
        role: profile?.role || 'user',
        isActive: profile?.isActive ?? u.status,
        $createdAt: u.$createdAt,
      };
    });

    return { users: formattedUsers, error: null };
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return { users: [], error: error?.message || 'Failed to fetch users.' };
  }
}