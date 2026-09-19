import { Client, Account, Databases, Users } from 'node-appwrite';
import { cookies } from 'next/headers';
import { APPWRITE_CONFIG } from './config';

export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

  const cookieStore = await cookies();
  const session = cookieStore.get('session');

  if (session?.value) {
    client.setSession(session.value);
  }

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
  };
}

export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId)
    .setKey(APPWRITE_CONFIG.apiKey); // Ensure APPWRITE_CONFIG has your secret API key

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
    get users() {
      return new Users(client);
    },
  };
}