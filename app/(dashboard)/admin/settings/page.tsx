import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const { role } = await getCurrentUser();
  if (role !== 'superadmin') redirect('/tickets');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>

      <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">General Configuration</h2>

        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Max Attachment Size (MB)
            </label>
            <input
              type="number"
              defaultValue={10}
              className="w-full max-w-xs border rounded p-2 text-sm focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <label className="flex items-center gap-3 font-medium text-gray-700">
            <input type="checkbox" className="rounded text-purple-600 focus:ring-purple-500" />
            Enable System Maintenance Mode (Restrict non-admin submissions)
          </label>

          <button type="button" className="px-4 py-2 bg-purple-700 text-white text-xs font-semibold rounded hover:bg-purple-800">
            Save System Settings
          </button>
        </div>
      </div>
    </div>
  );
}