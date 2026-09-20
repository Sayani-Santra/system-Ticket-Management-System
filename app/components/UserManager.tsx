'use client';

import { useState, useTransition } from 'react';
import { createUser, updateUser, toggleUserStatus } from '@/app/actions/users';

interface User {
  $id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export function UserManager({
  initialUsers,
  searchQuery,
  roleQuery,
  statusQuery,
}: {
  initialUsers: User[];
  searchQuery: string;
  roleQuery: string;
  statusQuery: string;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('user');
  const [isPending, startTransition] = useTransition();

  const handleEditClick = (user: User) => {
    setEditingId(user.$id);
    setEditName(user.fullName);
    setEditRole(user.role);
  };

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await createUser(formData);
    if (res?.error) {
      alert(res.error);
    } else {
      setIsCreating(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await updateUser(formData);
    if (res?.error) {
      alert(res.error);
    } else {
      setEditingId(null);
    }
  };

  const handleToggleStatus = (userId: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await toggleUserStatus(userId, currentStatus);
      if (res?.error) {
        alert(res.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Visible Search & Filter Toolbar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <form method="GET" className="flex flex-wrap gap-3 flex-1 items-center">
          <input
            type="text"
            name="search"
            defaultValue={searchQuery}
            placeholder="Search by name..."
            className="border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 rounded-md px-3 py-2 text-sm min-w-[200px] flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          <select
            name="role"
            defaultValue="user"
            className="border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {/* <option value="all" className="text-gray-900">All Roles</option> */}
            <option value="user" className="text-gray-900">User</option>
            <option value="server_admin" className="text-gray-900">Server Admin</option>
            <option value="superadmin" className="text-gray-900">Super Admin</option>
          </select>

          <select
            name="status"
            defaultValue={statusQuery}
            className="border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all" className="text-gray-900">All Statuses</option>
            <option value="active" className="text-gray-900">Active</option>
            <option value="inactive" className="text-gray-900">Inactive</option>
          </select>

          <button
            type="submit"
            className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition"
          >
            Filter
          </button>
        </form>

        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
        >
          + Create User
        </button>
      </div>

      {/* Modal: Create User */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4 shadow-lg">
            <h2 className="text-lg font-bold text-gray-900">Create New User</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. John Doe"
                  className="w-full border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@company.com"
                  className="w-full border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Assign Role</label>
                <select
                  name="role"
                  defaultValue="user"
                  className="w-full border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="user" className="text-gray-900">User</option>
                  <option value="admin" className="text-gray-900">Admin</option>
                  <option value="superadmin" className="text-gray-900">Super Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Table List */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">
              <th className="p-4">User</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {initialUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  No users found matching criteria.
                </td>
              </tr>
            ) : (
              initialUsers.map((user) => (
                <tr key={user.$id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-semibold text-gray-900">{user.fullName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </td>

                  <td className="p-4">
                    {editingId === user.$id ? (
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-xs bg-white text-gray-900"
                      >
                        <option value="user">User</option>
                        <option value="server_admin">Server Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    ) : (
                      <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {user.role}
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    {editingId === user.$id ? (
                      <form onSubmit={handleUpdateSubmit} className="inline-flex gap-2">
                        <input type="hidden" name="userId" value={user.$id} />
                        <input type="hidden" name="fullName" value={editName} />
                        <input type="hidden" name="role" value={editRole} />
                        <button
                          type="submit"
                          className="bg-green-600 text-white px-2.5 py-1 rounded text-xs hover:bg-green-700 transition"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="bg-gray-300 text-gray-800 px-2.5 py-1 rounded text-xs hover:bg-gray-400 transition"
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <div className="flex justify-end gap-3 items-center">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="text-xs text-blue-600 font-medium hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.$id, user.isActive)}
                          disabled={isPending}
                          className={`text-xs font-medium hover:underline ${
                            user.isActive ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}