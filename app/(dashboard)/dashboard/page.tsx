import { getUserProfile } from '@/app/actions/users';
import { getDashboardMetrics } from '@/app/actions/tickets';

import { UserDashboard } from './_components/UserDashboard';
import { SuperAdminDashboard } from './_components/SuperAdminDashboard';
import { ReportsDashboard } from './_components/ReportsDashboard';
// import { ServerAdminDashboard } from './_components/ServerAdminDashboard';

import { redirect } from 'next/navigation';

// Prevent Next.js from prerendering this page during build
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const profile = await getUserProfile();

  // Redirect if no active session
  if (!profile) {
    redirect('/login');
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          System Dashboard Overview
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Welcome back, {profile.fullName}
        </p>
      </div>

      {/* ================= REPORTS & MONITORING ================= */}
      {/* <section>
        <ReportsDashboard reports={metrics.reports} />
      </section> */}

      {/* ================= SUPER ADMIN DASHBOARD ================= */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-xl font-semibold text-slate-800">
            Super Admin Dashboard
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Overview of tickets, categories, priorities and admin workload.
          </p>
        </div>

        {/* <SuperAdminDashboard
          stats={metrics.superAdmin.stats}
          categoryBreakdown={metrics.superAdmin.categoryBreakdown}
          priorityBreakdown={metrics.superAdmin.priorityBreakdown}
          adminWorkload={metrics.superAdmin.adminWorkload}
        /> */}
      </section>

      {/* ================= SERVER ADMIN DASHBOARD ================= */}
      {/*
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
      */}

      {/* ================= USER DASHBOARD ================= */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-xl font-semibold text-slate-800">
            User Dashboard
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            View your tickets, open issues and recent activities.
          </p>
        </div>

        {/* <UserDashboard
          stats={metrics.user.stats}
          recentTickets={metrics.user.recentTickets as any}
        /> */}
      </section>
    </div>
  );
}