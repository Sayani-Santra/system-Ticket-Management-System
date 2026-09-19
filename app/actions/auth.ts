'use server';

import { createSessionClient, createAdminClient } from '@/app/lib/appwrite/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Models } from 'node-appwrite';

export type UserRole = 'user' | 'admin' | 'superadmin';

export interface CurrentUserResponse {
  user: Models.User<Models.Preferences> | null;
  role: UserRole | null;
}

// 1. Get Current User Action
export async function getCurrentUser(): Promise<CurrentUserResponse> {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();

    // Check custom preferences first, fallback to user labels, default to 'user'
    const role = (user.prefs?.role as UserRole) || (user.labels?.[0] as UserRole) || 'user';

    return { user, role };
  } catch (error) {
    return { user: null, role: null };
  }
}

// 2. Login Action
export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  try {
    const { account } = await createAdminClient();

    const session = await account.createEmailPasswordSession({
      email,
      password,
    });

    if (!session?.secret) {
      return { error: 'Failed to retrieve session secret.' };
    }

    const cookieStore = await cookies();
    cookieStore.set('session', session.secret, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
  } catch (error: any) {
    console.error('Login Action Error:', error);
    return { error: error?.message || 'Invalid email or password.' };
  }

  redirect('/tickets');
}

// 3. Logout Action
export async function logout() {
  try {
    const { account } = await createSessionClient();
    await account.deleteSession('current');

    const cookieStore = await cookies();
    cookieStore.delete('session');
  } catch (error) {
    console.error('Logout Action Error:', error);
  }

  redirect('/login');
}