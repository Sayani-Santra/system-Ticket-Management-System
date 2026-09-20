
'use server';

import { createAdminClient } from '@/app/lib/appwrite/server';
import { APPWRITE_CONFIG } from '@/app/lib/appwrite/config';
import { getCurrentUser } from '@/app/actions/auth';
import { ID, Query } from 'node-appwrite';
import { revalidatePath } from 'next/cache';

type UserRole = 'user' | 'server_admin' | 'super_admin';

interface UserProfile {
  $id: string;
  userId?: string;
  email?: string;
  fullName?: string;
  role?: UserRole | string;
  isActive?: boolean;
  $createdAt?: string;
}

interface FormActionResult {
  success?: boolean;
  error?: string;
}

interface UserListItem {
  $id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  $createdAt: string;
}

interface GetUsersResult {
  users: UserListItem[];
  error: string | null;
}

/**
 * Get the currently logged-in user's profile.
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const { user, role } = await getCurrentUser();

  if (!user) {
    return null;
  }

  try {
    const { databases } = await createAdminClient();

    let profileDoc: UserProfile | null = null;

    if (APPWRITE_CONFIG.collections.profiles) {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.profiles,
        [
          Query.equal('userId', user.$id),
          Query.limit(1),
        ]
      );

      profileDoc = (response.documents[0] as unknown as UserProfile) || null;
    }

    return {
      $id: profileDoc?.$id || user.$id,
      userId: user.$id,
      email: user.email,
      fullName: profileDoc?.fullName || user.name || user.email,
      role: profileDoc?.role || role || 'user',
      isActive: profileDoc?.isActive ?? user.status ?? true,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);

    return {
      $id: user.$id,
      userId: user.$id,
      email: user.email,
      fullName: user.name || user.email,
      role: role || 'user',
      isActive: user.status ?? true,
    };
  }
}

/**
 * Check whether the current user is allowed
 * to manage users.
 *
 * Only Super Admin should be allowed.
 */
async function requireSuperAdmin() {
  const { user, role } = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized. Please log in.');
  }

  if (role !== 'superadmin') {
    throw new Error('Forbidden. Only Super Admin can manage users.');
  }

  return user;
}

/**
 * Create a new user.
 */
export async function createUser(
  formData: FormData
): Promise<FormActionResult> {
  try {
    await requireSuperAdmin();

    const email = String(formData.get('email') || '')
      .trim()
      .toLowerCase();

    const name =
      String(formData.get('fullName') || '').trim() ||
      String(formData.get('name') || '').trim();

    const password = String(formData.get('password') || '').trim();

    const role =
      String(formData.get('role') || 'user').trim() as UserRole;

    if (!name || !email || !password) {
      return {
        error: 'Name, email, and password are required.',
      };
    }

    if (password.length < 8) {
      return {
        error: 'Password must be at least 8 characters.',
      };
    }

    const allowedRoles: UserRole[] = [
      'user',
      'server_admin',
      'super_admin',
    ];

    if (!allowedRoles.includes(role)) {
      return {
        error: 'Invalid user role.',
      };
    }

    const { users, databases } = await createAdminClient();

    /**
     * Create Appwrite Auth user.
     */
    const newUser = await users.create(
      ID.unique(),
      email,
      undefined,
      password,
      name
    );

    /**
     * Create profile document.
     *
     * We use the Appwrite user ID as the document ID,
     * which makes future updates easier.
     */
    if (APPWRITE_CONFIG.collections.profiles) {
      try {
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
      } catch (profileError) {
        /**
         * If profile creation fails, remove the Auth user
         * so we don't leave an incomplete account.
         */
        console.error(
          'Profile creation failed. Removing Auth user:',
          profileError
        );

        try {
          await users.delete(newUser.$id);
        } catch (deleteError) {
          console.error(
            'Failed to rollback created user:',
            deleteError
          );
        }

        return {
          error: 'User could not be created completely. Please try again.',
        };
      }
    }

    revalidatePath('/admin/users');

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error('Error creating user:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Failed to create user.';

    return {
      error: message,
    };
  }
}

/**
 * Update an existing user.
 */
export async function updateUser(
  formData: FormData
): Promise<FormActionResult> {
  try {
    await requireSuperAdmin();

    const userId = String(formData.get('userId') || '').trim();

    const name =
      String(formData.get('fullName') || '').trim() ||
      String(formData.get('name') || '').trim();

    const role = String(formData.get('role') || '').trim();

    if (!userId) {
      return {
        error: 'User ID is required.',
      };
    }

    const allowedRoles: UserRole[] = [
      'user',
      'server_admin',
      'super_admin',
    ];

    if (role && !allowedRoles.includes(role as UserRole)) {
      return {
        error: 'Invalid user role.',
      };
    }

    const { users, databases } = await createAdminClient();

    /**
     * Update Appwrite Auth user's name.
     */
    if (name) {
      await users.updateName(userId, name);
    }

    /**
     * Update profile document.
     */
    if (APPWRITE_CONFIG.collections.profiles) {
      const profileCollection =
        APPWRITE_CONFIG.collections.profiles;

      const existingProfileResponse =
        await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          profileCollection,
          [
            Query.equal('userId', userId),
            Query.limit(1),
          ]
        );

      const existingProfile =
        existingProfileResponse.documents[0];

      const updateData: Record<string, unknown> = {};

      if (name) {
        updateData.fullName = name;
      }

      if (role) {
        updateData.role = role;
      }

      if (existingProfile) {
        if (Object.keys(updateData).length > 0) {
          await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            profileCollection,
            existingProfile.$id,
            updateData
          );
        }
      } else {
        /**
         * If the profile does not exist, create it.
         */
        const appwriteUser = await users.get(userId);

        await databases.createDocument(
          APPWRITE_CONFIG.databaseId,
          profileCollection,
          userId,
          {
            userId,
            email: appwriteUser.email,
            fullName: name || appwriteUser.name || appwriteUser.email,
            role: role || 'user',
            isActive: appwriteUser.status,
          }
        );
      }
    }

    revalidatePath('/admin/users');

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error('Error updating user:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Failed to update user.';

    return {
      error: message,
    };
  }
}

/**
 * Activate / deactivate user.
 */
export async function toggleUserStatus(
  userId: string,
  currentStatus: boolean
): Promise<FormActionResult> {
  try {
    await requireSuperAdmin();

    if (!userId) {
      return {
        error: 'User ID is required.',
      };
    }

    const { users, databases } = await createAdminClient();

    const newStatus = !currentStatus;

    /**
     * Update Appwrite Auth status.
     */
    await users.updateStatus(userId, newStatus);

    /**
     * Update profile status.
     */
    if (APPWRITE_CONFIG.collections.profiles) {
      const profileCollection =
        APPWRITE_CONFIG.collections.profiles;

      const profileResponse =
        await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          profileCollection,
          [
            Query.equal('userId', userId),
            Query.limit(1),
          ]
        );

      const profile = profileResponse.documents[0];

      if (profile) {
        await databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          profileCollection,
          profile.$id,
          {
            isActive: newStatus,
          }
        );
      } else {
        /**
         * Create profile if it doesn't exist.
         */
        const appwriteUser = await users.get(userId);

        await databases.createDocument(
          APPWRITE_CONFIG.databaseId,
          profileCollection,
          userId,
          {
            userId,
            email: appwriteUser.email,
            fullName:
              appwriteUser.name || appwriteUser.email,
            role: 'user',
            isActive: newStatus,
          }
        );
      }
    }

    revalidatePath('/admin/users');

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error('Error toggling user status:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Failed to update user status.';

    return {
      error: message,
    };
  }
}

/**
 * Get all users.
 *
 * Uses pagination so deployment does not silently
 * stop after the first Appwrite page.
 */
export async function getUsers(): Promise<GetUsersResult> {
  try {
    await requireSuperAdmin();

    const { users, databases } = await createAdminClient();

    /**
     * ------------------------------------------
     * Get all Appwrite Auth users
     * ------------------------------------------
     */
    const allUsers: Array<{
      $id: string;
      name: string;
      email: string;
      status: boolean;
      $createdAt: string;
    }> = [];

    let offset = 0;

    const pageSize = 100;

    while (true) {
      const response = await users.list(
        [
          Query.limit(pageSize),
          Query.offset(offset),
        ]
      );

      allUsers.push(
        ...response.users.map((user) => ({
          $id: user.$id,
          name: user.name,
          email: user.email,
          status: user.status,
          $createdAt: user.$createdAt,
        }))
      );

      if (response.users.length < pageSize) {
        break;
      }

      offset += pageSize;
    }

    /**
     * ------------------------------------------
     * Get profiles
     * ------------------------------------------
     */
    const profilesMap: Record<string, UserProfile> = {};

    if (APPWRITE_CONFIG.collections.profiles) {
      let profileOffset = 0;

      while (true) {
        const profileResponse =
          await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.profiles,
            [
              Query.limit(100),
              Query.offset(profileOffset),
            ]
          );

        for (const document of profileResponse.documents) {
          const profile =
            document as unknown as UserProfile;

          if (profile.userId) {
            profilesMap[profile.userId] = profile;
          } else {
            profilesMap[profile.$id] = profile;
          }
        }

        if (profileResponse.documents.length < 100) {
          break;
        }

        profileOffset += 100;
      }
    }

    /**
     * ------------------------------------------
     * Combine Auth + Profile information
     * ------------------------------------------
     */
    const formattedUsers: UserListItem[] =
      allUsers.map((user) => {
        const profile = profilesMap[user.$id];

        return {
          $id: user.$id,

          fullName:
            profile?.fullName ||
            user.name ||
            user.email,

          email: user.email,

          role:
            profile?.role ||
            'user',

          isActive:
            profile?.isActive ??
            user.status,

          $createdAt:
            user.$createdAt,
        };
      });

    return {
      users: formattedUsers,
      error: null,
    };
  } catch (error: unknown) {
    console.error('Error fetching users:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Failed to fetch users.';

    return {
      users: [],
      error: message,
    };
  }
}

