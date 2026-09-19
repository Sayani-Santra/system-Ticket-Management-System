import { getCurrentUser } from '@/app/actions/auth';
import { logout } from '@/app/actions/auth';

export async function Header() {
  const { user, role } = await getCurrentUser();

  const getRoleBadgeColor = () => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between shadow-sm">
      <div className="text-sm font-semibold text-gray-700">Dashboard</div>

      {user && (
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">
              {user.name || user.email}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full font-bold uppercase border ${getRoleBadgeColor()}`}
            >
              {role}
            </span>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="px-3 py-1 bg-red-50 text-red-600 rounded border border-red-200 hover:bg-red-100 font-medium transition"
            >
              Logout
            </button>
          </form>
        </div>
      )}
    </header>
  );
}