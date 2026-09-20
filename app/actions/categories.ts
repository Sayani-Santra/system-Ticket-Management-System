'use server';

import { Client, Databases, ID, Query } from 'node-appwrite';
import { revalidatePath } from 'next/cache';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const CATEGORIES_COLLECTION_ID = 'categories'; // Ensure this collection exists in Appwrite

async function getDatabases() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
  return new Databases(client);
}

export async function getCategories() {
  try {
    const databases = await getDatabases();
    const response = await databases.listDocuments(
      DATABASE_ID,
      CATEGORIES_COLLECTION_ID,
      [Query.orderDesc('$createdAt')]
    );
    return { categories: response.documents, error: null };
  } catch (error: any) {
    return { categories: [], error: error.message || 'Failed to fetch categories' };
  }
}

export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  if (!name || name.trim() === '') {
    return { success: false, error: 'Category name is required' };
  }

  try {
    const databases = await getDatabases();
    await databases.createDocument(
      DATABASE_ID,
      CATEGORIES_COLLECTION_ID,
      ID.unique(),
      {
        name: name.trim(),
        description: description?.trim() || '',
        slug: name.toLowerCase().replace(/[^a-z0-0]/g, '-'),
      }
    );

    revalidatePath('/admin/categories');
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create category' };
  }
}

export async function deleteCategory(categoryId: string) {
  try {
    const databases = await getDatabases();
    await databases.deleteDocument(
      DATABASE_ID,
      CATEGORIES_COLLECTION_ID,
      categoryId
    );

    revalidatePath('/admin/categories');
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete category' };
  }
}