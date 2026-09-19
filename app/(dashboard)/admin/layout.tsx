// app/admin/layout.tsx
import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role } = await getCurrentUser();

  if (!user || role !== 'superadmin') {
    redirect('/tickets');
  }

  return <div className="p-6">{children}</div>;
}