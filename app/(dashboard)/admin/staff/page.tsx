import Link from 'next/link';
import { getAdminUsers } from '@/app/actions/tickets';
import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';

export default async function AdminStaffPage() {
  const { role } = await getCurrentUser();
  const userRole = (role as string) || '';

  // Guard clause: Only superadmins or admins can access staff management
  if (!['superadmin', 'admin'].includes(userRole)) {
    redirect('/dashboard');
  }

  // Destructure only `admins` since `getAdminUsers` doesn't return an `error` property
  const { admins: staffMembers } = await getAdminUsers();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-500">
            View, assign, and manage admin support team members
          </p>
        </div>
        <Link
          href="/admin/staff/new"
          className="px-4 py-2 bg-purple-600 text-white font-medium text-sm rounded-lg hover:bg-purple-700 transition"
        >
          + Add Staff Member
        </Link>
      </div>

      {/* Staff Table / List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {!staffMembers || staffMembers.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No staff members found.
          </div>
        ) : (
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {staffMembers.map((staff: any) => {
                const staffId = staff.id || staff.$id;
                return (
                  <tr key={staffId} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {staff.name}
                    </td>
                    <td className="px-6 py-4">{staff.email || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 uppercase">
                        {staff.role || 'Staff'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/staff/${staffId}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                      >
                        Edit / View &rarr;
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}