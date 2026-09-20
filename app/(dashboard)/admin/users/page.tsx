import { getCurrentUser } from '@/app/actions/auth';
import { getUsers } from '@/app/actions/users';
import { UserManager } from '@/app/components/UserManager';
import { redirect } from 'next/navigation';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    role?: string;
    status?: string;
  }>;
}

export default async function UserManagementPage({ searchParams }: PageProps) {
  const { user, role } = await getCurrentUser();

  if (!user || role !== 'superadmin') {
    redirect('/tickets');
  }

  const params = await searchParams;
  const search = params.search || '';
  const roleFilter = params.role || 'all';
  const statusFilter = params.status || 'all';

  // ✅ FIX: Pass parameters as a single object instead of 3 separate arguments
  const { users = [] } = await getUsers();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Users & Admins</h1>
        <p className="text-sm text-gray-500">
          Create users, assign roles, activate/deactivate accounts, and manage permissions.
        </p>
      </div>

      <UserManager
        initialUsers={JSON.parse(JSON.stringify(users))}
        searchQuery={search}
        roleQuery={roleFilter}
        statusQuery={statusFilter}
      />
    </div>
  );
}