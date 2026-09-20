export const APPWRITE_CONFIG = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1',
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6aa4f1fb002e898c4f86',
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6aa4f2ff0031de1d21d6',

  apiKey: process.env.APPWRITE_API_KEY || "standard_6e96a5d0baadad553aaf7c4611558310d33302b112f3ee1d18c38f7e640d21e401ec62cd58ab925f66f6f5b86a5aeea72f28397e2f793e45110a8d8a4144cf2c09c3a907b11e5263dbd5a9fa0e732f6f0057c34742866a994ff052fba6396f7a96bebcdb80859e493931ec4db82049d2ee269f26a2f7c9579b7f6ca5926cdce7",
  collections: {
    profiles: 'profiles',
    tickets: 'tickets',
    categories: 'categories',
    comments: 'comments',
    activities: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ACTIVITIES || '6aaf08070015c6d76dd8',
  },
  buckets: {
    attachments: 'ticket_attachments',
  },
};