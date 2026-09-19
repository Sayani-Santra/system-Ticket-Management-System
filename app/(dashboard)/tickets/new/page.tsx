'use client';

import { useState, useTransition } from 'react';
import { createTicket } from '@/app/actions/tickets';
import Link from 'next/link';

export default function NewTicketPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);

    // Front-end check to make sure title is present
    const title = formData.get('title') as string;
    if (!title || !title.trim()) {
      setError('Title is required to create a ticket.');
      return;
    }

    startTransition(async () => {
      const result = await createTicket(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Ticket</h1>
          <p className="text-slate-500 text-sm">Submit a new issue to get support</p>
        </div>
        <Link
          href="/tickets"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to Tickets
        </Link>
      </div>

      <form
        action={handleSubmit}
        className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5"
      >
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="e.g., Unable to connect to VPN"
            className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Description Input */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Provide relevant details about your issue..."
            className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Priority Select */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-1">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue="low"
            className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Category Input (Optional) */}
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-slate-700 mb-1">
            Category ID
          </label>
          <input
            id="categoryId"
            name="categoryId"
            type="text"
            placeholder="e.g., general"
            className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-50"
        >
          {isPending ? 'Submitting Ticket...' : 'Create Ticket'}
        </button>
      </form>
    </div>
  );
}