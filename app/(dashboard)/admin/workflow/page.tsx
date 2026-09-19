import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';

export default async function WorkflowPage() {
  const { role } = await getCurrentUser();
  if (role !== 'superadmin') redirect('/tickets');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Ticket Flow Rules</h1>

      <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Assignment Automation</h2>
        
        <form className="space-y-4">
          <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
            <input type="checkbox" defaultChecked className="rounded text-purple-600 focus:ring-purple-500" />
            Enable round-robin auto-assignment for new tickets
          </label>

          <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
            <input type="checkbox" defaultChecked className="rounded text-purple-600 focus:ring-purple-500" />
            Auto-escalate high priority tickets unassigned after 24 hours
          </label>

          <button type="button" className="px-4 py-2 bg-purple-700 text-white text-xs font-semibold rounded hover:bg-purple-800">
            Save Flow Rules
          </button>
        </form>
      </div>
    </div>
  );
}