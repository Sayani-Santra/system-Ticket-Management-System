'use client';

import { createTicket } from '@/app/actions/tickets';

interface Category {
  $id: string;
  name: string;
}

export function CreateTicketModal({
  categories,
  onClose,
}: {
  categories: Category[];
  onClose?: () => void;
}) {
  const handleSubmit = async (formData: FormData) => {
    const res = await createTicket(formData);
    if (res?.error) {
      alert(res.error);
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-lg w-full space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Create New Ticket</h2>
      
      <form action={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            name="title"
            required
            placeholder="Brief issue title"
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
          <select
            name="categoryId"
            required
            className="w-full border rounded-md px-3 py-2 text-sm bg-white"
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat) => (
              <option key={cat.$id} value={cat.$id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
          <select
            name="priority"
            defaultValue="medium"
            className="w-full border rounded-md px-3 py-2 text-sm bg-white"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            rows={4}
            required
            placeholder="Detailed description of the issue..."
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Submit Ticket
          </button>
        </div>
      </form>
    </div>
  );
}