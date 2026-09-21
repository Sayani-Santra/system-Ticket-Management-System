import { getUserProfile } from '@/app/actions/users';
import { getDashboardMetrics } from '@/app/actions/tickets';

import { UserDashboard } from './_components/UserDashboard';
import { SuperAdminDashboard } from './_components/SuperAdminDashboard';
import { ReportsDashboard } from './_components/ReportsDashboard';
import { ServerAdminDashboard } from './_components/ServerAdminDashboard';

import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Converts array [{ name, count }] or object { name: count } into key-value map
const arrayToMap = (data: any) => {
  if (Array.isArray(data)) {
    return data.reduce((acc, item) => ({ ...acc, [item.name || item.key]: item.count || item.value || 0 }), {});
  }
  return data || {};
};

// Formats adminWorkload into the structure required by SuperAdminDashboard
// Providing both 'name' and 'adminName' prevents undefined.charAt() crashes
const formatAdminWorkload = (data: any) => {
  if (Array.isArray(data)) {
    return data.map((item) => {
      const adminName = item.name || item.adminName || item.admin || 'Admin';
      return {
        name: adminName,
        adminName: adminName,
        assignedCount: item.assignedCount ?? item.count ?? 0,
      };
    });
  }
  if (typeof data === 'object' && data !== null) {
    return Object.entries(data).map(([key, assignedCount]) => {
      const adminName = key || 'Admin';
      return {
        name: adminName,
        adminName: adminName,
        assignedCount: Number(assignedCount) || 0,
      };
    });
  }
  return [];
};

export default async function DashboardPage() {
  const profile = await getUserProfile();

  if (!profile) {
    redirect('/login');
  }

  // Cast metrics safely
  const metrics = (await getDashboardMetrics()) as any;

  // Safely get user display name
  const displayName = (profile as any).fullName || (profile as any).name || 'User';

  // Role checks
  const role = (profile as any).role?.toLowerCase();
  const isSuperAdmin = role === 'superadmin' || role === 'super_admin';
  const isServerAdmin = role === 'serveradmin' || role === 'admin';

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          System Dashboard Overview
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Welcome back, {displayName}
        </p>
      </div>

      {/* ================= REPORTS & MONITORING ================= */}
      {metrics?.reports && (
        <section>
          <ReportsDashboard reports={metrics.reports} />
        </section>
      )}

      {/* ================= SUPER ADMIN DASHBOARD ================= */}
      {isSuperAdmin && metrics?.superAdmin && (
        <section className="space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-xl font-semibold text-slate-800">
              Super Admin Dashboard
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Overview of tickets, categories, priorities and admin workload.
            </p>
          </div>

          <SuperAdminDashboard
            stats={metrics.superAdmin.stats}
            categoryBreakdown={arrayToMap(metrics.superAdmin.categoryBreakdown)}
            priorityBreakdown={arrayToMap(metrics.superAdmin.priorityBreakdown)}
            adminWorkload={formatAdminWorkload(metrics.superAdmin.adminWorkload)}
          />
        </section>
      )}

      {/* ================= SERVER ADMIN DASHBOARD ================= */}
      {isServerAdmin && metrics?.serverAdmin && (
        <section className="space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-xl font-semibold text-slate-800">
              Server Admin Dashboard
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage assigned tickets and track ongoing support activities.
            </p>
          </div>

          <ServerAdminDashboard
            stats={metrics.serverAdmin.stats}
            recentUpdates={metrics.serverAdmin.recentUpdates as any}
          />
        </section>
      )}

      {/* ================= USER DASHBOARD ================= */}
      {metrics?.user && (
        <section className="space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-xl font-semibold text-slate-800">
              User Dashboard
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View your tickets, open issues and recent activities.
            </p>
          </div>

          <UserDashboard
            stats={metrics.user.stats}
            recentTickets={metrics.user.recentTickets as any}
          />
        </section>
      )}
    </div>
  );
}