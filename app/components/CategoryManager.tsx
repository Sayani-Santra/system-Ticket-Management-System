'use client';

import { useState, useTransition, useOptimistic } from 'react';
import { createCategory, deleteCategory } from '@/app/actions/categories';

interface Category {
  $id: string;
  name: string;
  description?: string;
  slug?: string;
  $createdAt?: string;
}

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Optimistic UI updates for immediate feedback
  const [optimisticCategories, setOptimisticCategories] = useOptimistic(
    initialCategories,
    (state, action: { type: 'ADD' | 'DELETE'; payload: any }) => {
      if (action.type === 'ADD') {
        return [action.payload, ...state];
      }
      if (action.type === 'DELETE') {
        return state.filter((cat) => cat.$id !== action.payload);
      }
      return state;
    }
  );

  // Filter categories dynamically
  const filteredCategories = optimisticCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleSubmit(formData: FormData) {
    setError(null);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!name.trim()) {
      setError('Category name cannot be empty.');
      return;
    }

    const newCategory: Category = {
      $id: 'temp-' + Date.now(),
      name: name.trim(),
      description: description?.trim(),
      slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    };

    startTransition(async () => {
      setOptimisticCategories({ type: 'ADD', payload: newCategory });
      const form = document.getElementById('category-form') as HTMLFormElement;
      form?.reset();

      const res = await createCategory(formData);
      if (!res.success) {
        setError(res.error || 'Failed to create category.');
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this category?')) return;

    startTransition(async () => {
      setOptimisticCategories({ type: 'DELETE', payload: id });
      const res = await deleteCategory(id);
      if (!res.success) {
        setError(res.error || 'Failed to delete category.');
      }
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Create Category Form */}
      <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs sticky top-8 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
            +
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">New Category</h2>
            <p className="text-xs text-slate-500">Add a ticket classification</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
            {error}
          </div>
        )}

        <form id="category-form" action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g., Billing & Accounts"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Provide context on when to assign tickets to this category..."
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              'Create Category'
            )}
          </button>
        </form>
      </div>

      {/* Right Column: Manage & Search Categories */}
      <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Existing Categories</h2>
            <p className="text-xs text-slate-500">Manage rules and ticket routing targets</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Filter categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-48"
            />
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60 shrink-0">
              {filteredCategories.length} Total
            </span>
          </div>
        </div>

        {/* Categories List */}
        {filteredCategories.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-lg">
              📂
            </div>
            <p className="text-sm font-semibold text-slate-700">No categories found</p>
            <p className="text-xs text-slate-400">
              {searchQuery ? 'Try matching a different keyword search.' : 'Create your first category using the sidebar form.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredCategories.map((category) => {
              const isTemp = category.$id.startsWith('temp-');
              return (
                <div
                  key={category.$id}
                  className={`py-4 flex items-start justify-between gap-4 transition-opacity ${
                    isTemp ? 'opacity-50 pointer-events-none' : 'opacity-100'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-sm text-slate-900 truncate">
                        {category.name}
                      </span>
                      {category.slug && (
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md shrink-0">
                          {category.slug}
                        </span>
                      )}
                    </div>
                    {category.description ? (
                      <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                        {category.description}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-300 italic">No description provided</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(category.$id)}
                    disabled={isPending || isTemp}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}