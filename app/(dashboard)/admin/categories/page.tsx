import { getCategories } from '@/app/actions/categories';
import { CategoryManager } from '@/app/components/CategoryManager';

export default async function CategoriesPage() {
  const { categories } = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage ticket categories and classifications for incoming requests.
        </p>
      </div>

      <CategoryManager initialCategories={JSON.parse(JSON.stringify(categories))} />
    </div>
  );
}