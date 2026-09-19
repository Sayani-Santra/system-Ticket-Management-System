'use client';

import { useState } from 'react';

export default function CategoriesPage() {
  const [categoryName, setCategoryName] = useState('');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Category Management</h1>
        <p className="text-slate-500 text-sm">Create and organize ticket categories</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Add New Category</h2>
        <form className="flex gap-3">
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="e.g., Hardware, Billing, Network"
            className="flex-1 border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            Add Category
          </button>
        </form>
      </div>
    </div>
  );
}