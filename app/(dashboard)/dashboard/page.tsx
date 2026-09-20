import { getUserProfile } from '@/app/actions/users';
import { getDashboardMetrics } from '@/app/actions/tickets';
import { UserDashboard } from './_components/UserDashboard';
import { ServerAdminDashboard } from './_components/ServerAdminDashboard';
import { SuperAdminDashboard } from './_components/SuperAdminDashboard';
import { ReportsDashboard } from './_components/ReportsDashboard';

export default async function DashboardPage() {
  const profile = await getUserProfile();
  const metrics = await getDashboardMetrics(profile);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Dashboard Overview</h1>
        <p className="text-sm text-slate-500">Welcome back, {profile.fullName}</p>
      </div>

      {/* 1. Reports & Monitoring Section */}
      <section>
        <ReportsDashboard reports={metrics.reports} />
      </section>

      {/* 2. Super Admin Dashboard */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">Super Admin Dashboard</h2>
        <SuperAdminDashboard
          stats={metrics.superAdmin.stats}
          categoryBreakdown={metrics.superAdmin.categoryBreakdown}
          priorityBreakdown={metrics.superAdmin.priorityBreakdown}
          adminWorkload={metrics.superAdmin.adminWorkload}
        />
      </section>

      {/* 3. Server Admin Dashboard */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">Server Admin Dashboard</h2>
        <ServerAdminDashboard
          stats={metrics.serverAdmin.stats}
          recentUpdates={metrics.serverAdmin.recentUpdates as any}
        />
      </section>

      {/* 4. User Dashboard */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">User Dashboard</h2>
        <UserDashboard
          stats={metrics.user.stats}
          recentTickets={metrics.user.recentTickets as any}
        />
      </section>
    </div>
  );
}