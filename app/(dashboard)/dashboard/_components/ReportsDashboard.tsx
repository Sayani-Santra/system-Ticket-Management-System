
import React from "react";

// =====================================================
// TYPES
// =====================================================

interface AdminPerformance {
  name: string;
  assignedCount: number;
  resolvedCount: number;
  avgResolutionTimeHours: string;
}

interface ReportsData {
  totalTicketsCount: number;
  openTicketsCount: number;
  closedTicketsCount: number;
  reopenedTicketsCount: number;
  escalatedTicketsCount: number;

  ticketsByCategory: Record<string, number>;
  ticketsByPriority: Record<string, number>;
  ticketsByAdmin: Record<string, number>;

  avgResolutionTimeHours: string;

  adminPerformanceSummary: AdminPerformance[];
}

interface ReportsDashboardProps {
  reports: ReportsData;
}

// =====================================================
// COMPONENT
// =====================================================

export function ReportsDashboard({
  reports,
}: ReportsDashboardProps) {
  // ---------------------------------------------------
  // Safe fallback values
  // ---------------------------------------------------

  const ticketsByCategory =
    reports?.ticketsByCategory || {};

  const ticketsByPriority =
    reports?.ticketsByPriority || {};

  const ticketsByAdmin =
    reports?.ticketsByAdmin || {};

  const adminPerformanceSummary =
    reports?.adminPerformanceSummary || [];

  const total =
    reports?.totalTicketsCount || 0;

  // ---------------------------------------------------
  // Percentages
  // ---------------------------------------------------

  const closedPercentage =
    total > 0
      ? Math.round(
          (reports.closedTicketsCount / total) * 100
        )
      : 0;

  const openPercentage =
    total > 0
      ? Math.round(
          (reports.openTicketsCount / total) * 100
        )
      : 0;

  const reopenedPercentage =
    total > 0
      ? Math.round(
          (reports.reopenedTicketsCount / total) * 100
        )
      : 0;

  const escalatedPercentage =
    total > 0
      ? Math.round(
          (reports.escalatedTicketsCount / total) * 100
        )
      : 0;

  // ---------------------------------------------------
  // Admin maximum
  // ---------------------------------------------------

  const maxAdminTickets = Math.max(
    ...Object.values(ticketsByAdmin),
    1
  );

  // ---------------------------------------------------
  // Priority styles
  // ---------------------------------------------------

  const priorityStyles: Record<string, string> = {
    critical:
      "bg-red-100 text-red-700 border-red-200",

    high:
      "bg-orange-100 text-orange-700 border-orange-200",

    medium:
      "bg-yellow-100 text-yellow-700 border-yellow-200",

    low:
      "bg-green-100 text-green-700 border-green-200",
  };

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Reports & Monitoring
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Monitor ticket activity, performance and
              resolution metrics.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />

            <span className="text-sm font-medium text-slate-600">
              System Reports
            </span>
          </div>

        </div>

        {/* =================================================
            KPI CARDS
        ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">

          {/* TOTAL */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Total Tickets
                </p>

                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {reports.totalTicketsCount}
                </p>

                <p className="text-xs text-slate-400 mt-2">
                  All system tickets
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-lg">
                🎫
              </div>

            </div>

          </div>

          {/* OPEN */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide">
                  Open Tickets
                </p>

                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {reports.openTicketsCount}
                </p>

                <p className="text-xs text-slate-400 mt-2">
                  {openPercentage}% of total
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-lg">
                📂
              </div>

            </div>

            <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{
                  width: `${openPercentage}%`,
                }}
              />
            </div>

          </div>

          {/* CLOSED */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wide">
                  Closed / Resolved
                </p>

                <p className="text-3xl font-bold text-emerald-600 mt-2">
                  {reports.closedTicketsCount}
                </p>

                <p className="text-xs text-slate-400 mt-2">
                  {closedPercentage}% resolution rate
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 text-lg">
                ✓
              </div>

            </div>

            <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{
                  width: `${closedPercentage}%`,
                }}
              />
            </div>

          </div>

          {/* REOPENED */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide">
                  Reopened
                </p>

                <p className="text-3xl font-bold text-amber-600 mt-2">
                  {reports.reopenedTicketsCount}
                </p>

                <p className="text-xs text-slate-400 mt-2">
                  {reopenedPercentage}% of total
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 text-lg">
                🔄
              </div>

            </div>

            <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{
                  width: `${reopenedPercentage}%`,
                }}
              />
            </div>

          </div>

          {/* ESCALATED */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-semibold text-red-500 uppercase tracking-wide">
                  Escalated
                </p>

                <p className="text-3xl font-bold text-red-600 mt-2">
                  {reports.escalatedTicketsCount}
                </p>

                <p className="text-xs text-slate-400 mt-2">
                  {escalatedPercentage}% of total
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 text-lg">
                ⚠️
              </div>

            </div>

            <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full"
                style={{
                  width: `${escalatedPercentage}%`,
                }}
              />
            </div>

          </div>

          {/* AVG RESOLUTION */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-semibold text-purple-500 uppercase tracking-wide">
                  Avg Resolution
                </p>

                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {reports.avgResolutionTimeHours}
                </p>

                <p className="text-xs text-slate-400 mt-2">
                  Average resolution time
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 text-lg">
                ⏱️
              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            ANALYTICS
        ================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* =================================================
              CATEGORY
          ================================================= */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">

            <div className="p-5 border-b border-slate-100">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Tickets by Category
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Category distribution
                  </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  📊
                </div>

              </div>

            </div>

            <div className="p-5">

              {Object.keys(ticketsByCategory).length === 0 ? (

                <div className="py-10 text-center">

                  <div className="text-3xl mb-2">
                    📭
                  </div>

                  <p className="text-sm text-slate-400">
                    No category data available
                  </p>

                </div>

              ) : (

                <div className="space-y-4">

                  {Object.entries(ticketsByCategory).map(
                    ([category, count]) => {

                      const percentage =
                        total > 0
                          ? Math.round(
                              (count / total) * 100
                            )
                          : 0;

                      return (
                        <div key={category}>

                          <div className="flex justify-between items-center mb-2">

                            <span className="text-sm font-medium text-slate-700 capitalize">
                              {category}
                            </span>

                            <span className="text-sm font-semibold text-slate-900">
                              {count}
                            </span>

                          </div>

                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">

                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />

                          </div>

                          <p className="text-[11px] text-slate-400 mt-1">
                            {percentage}% of total
                          </p>

                        </div>
                      );
                    }
                  )}

                </div>

              )}

            </div>

          </div>

          {/* =================================================
              PRIORITY
          ================================================= */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">

            <div className="p-5 border-b border-slate-100">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Tickets by Priority
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Ticket urgency overview
                  </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  🔥
                </div>

              </div>

            </div>

            <div className="p-5">

              {Object.keys(ticketsByPriority).length === 0 ? (

                <div className="py-10 text-center">

                  <div className="text-3xl mb-2">
                    📭
                  </div>

                  <p className="text-sm text-slate-400">
                    No priority data available
                  </p>

                </div>

              ) : (

                <div className="space-y-3">

                  {Object.entries(ticketsByPriority).map(
                    ([priority, count]) => {

                      const percentage =
                        total > 0
                          ? Math.round(
                              (count / total) * 100
                            )
                          : 0;

                      const badge =
                        priorityStyles[
                          priority.toLowerCase()
                        ] ||
                        "bg-slate-100 text-slate-600 border-slate-200";

                      return (
                        <div
                          key={priority}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-100"
                        >

                          <div className="flex items-center justify-between mb-2">

                            <span
                              className={`px-3 py-1 rounded-full border text-xs font-semibold uppercase ${badge}`}
                            >
                              {priority}
                            </span>

                            <span className="text-lg font-bold text-slate-900">
                              {count}
                            </span>

                          </div>

                          <div className="h-1.5 bg-white rounded-full overflow-hidden">

                            <div
                              className="h-full bg-slate-500 rounded-full"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              )}

            </div>

          </div>

          {/* =================================================
              ADMIN
          ================================================= */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">

            <div className="p-5 border-b border-slate-100">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Tickets by Admin
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Current admin workload
                  </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  👥
                </div>

              </div>

            </div>

            <div className="p-5">

              {Object.keys(ticketsByAdmin).length === 0 ? (

                <div className="py-10 text-center">

                  <div className="text-3xl mb-2">
                    👥
                  </div>

                  <p className="text-sm text-slate-400">
                    No tickets assigned yet
                  </p>

                </div>

              ) : (

                <div className="space-y-4">

                  {Object.entries(ticketsByAdmin).map(
                    ([adminName, count]) => {

                      const percentage =
                        Math.round(
                          (count / maxAdminTickets) *
                            100
                        );

                      return (
                        <div key={adminName}>

                          <div className="flex items-center justify-between mb-2">

                            <div className="flex items-center gap-2">

                              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600">
                                {adminName
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <span className="text-sm font-medium text-slate-700">
                                {adminName}
                              </span>

                            </div>

                            <span className="text-sm font-semibold text-slate-900">
                              {count}
                            </span>

                          </div>

                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">

                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              )}

            </div>

          </div>

        </div>

        {/* =================================================
            ADMIN PERFORMANCE SUMMARY
        ================================================= */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">

          <div className="p-5 md:p-6 border-b border-slate-100">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Admin Performance Summary
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Monitor assignment, resolution and
                  response performance.
                </p>

              </div>

              <div className="px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-medium text-slate-600">
                {adminPerformanceSummary.length} Admins
              </div>

            </div>

          </div>

          <div className="overflow-x-auto">

            {adminPerformanceSummary.length === 0 ? (

              <div className="py-14 text-center">

                <div className="text-4xl mb-3">
                  📊
                </div>

                <h3 className="text-sm font-semibold text-slate-700">
                  No performance metrics found
                </h3>

                <p className="text-xs text-slate-400 mt-1">
                  Admin performance data will appear here.
                </p>

              </div>

            ) : (

              <table className="w-full min-w-[700px]">

                <thead>

                  <tr className="bg-slate-50 border-b border-slate-200">

                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Admin
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Assigned
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Resolved
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Resolution Rate
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Avg Resolution
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {adminPerformanceSummary.map(
                    (admin, idx) => {

                      const resolutionRate =
                        admin.assignedCount > 0
                          ? Math.round(
                              (admin.resolvedCount /
                                admin.assignedCount) *
                                100
                            )
                          : 0;

                      return (
                        <tr
                          key={`${admin.name}-${idx}`}
                          className="hover:bg-slate-50 transition"
                        >

                          {/* ADMIN */}

                          <td className="px-6 py-4">

                            <div className="flex items-center gap-3">

                              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-600">
                                {admin.name
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>

                                <p className="text-sm font-semibold text-slate-900">
                                  {admin.name}
                                </p>

                                <p className="text-xs text-slate-400">
                                  Server Admin
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* ASSIGNED */}

                          <td className="px-6 py-4">

                            <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-sm font-semibold">
                              {admin.assignedCount}
                            </span>

                          </td>

                          {/* RESOLVED */}

                          <td className="px-6 py-4">

                            <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-semibold">
                              {admin.resolvedCount}
                            </span>

                          </td>

                          {/* RESOLUTION RATE */}

                          <td className="px-6 py-4 min-w-[180px]">

                            <div className="flex items-center gap-3">

                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">

                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{
                                    width: `${resolutionRate}%`,
                                  }}
                                />

                              </div>

                              <span className="text-xs font-semibold text-slate-700 w-10">
                                {resolutionRate}%
                              </span>

                            </div>

                          </td>

                          {/* AVG TIME */}

                          <td className="px-6 py-4">

                            <div className="flex items-center gap-2">

                              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                                ⏱️
                              </div>

                              <span className="text-sm font-semibold text-slate-700">
                                {admin.avgResolutionTimeHours} hrs
                              </span>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            )}

          </div>

        </div>

        {/* =================================================
            BOTTOM SUMMARY
        ================================================= */}

        <div className="bg-slate-900 rounded-2xl p-6 text-white">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div>

              <h2 className="text-lg font-semibold">
                Overall System Performance
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                Current overview of ticket resolution and
                system activity.
              </p>

            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

              <div>

                <p className="text-2xl font-bold text-emerald-400">
                  {closedPercentage}%
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Resolution Rate
                </p>

              </div>

              <div>

                <p className="text-2xl font-bold text-blue-400">
                  {reports.openTicketsCount}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Open
                </p>

              </div>

              <div>

                <p className="text-2xl font-bold text-amber-400">
                  {reports.reopenedTicketsCount}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Reopened
                </p>

              </div>

              <div>

                <p className="text-2xl font-bold text-red-400">
                  {reports.escalatedTicketsCount}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Escalated
                </p>

              </div>

            </div>

          </div>

          <div className="mt-6">

            <div className="flex justify-between text-xs mb-2">

              <span className="text-slate-400">
                Overall Resolution Progress
              </span>

              <span className="font-semibold text-slate-200">
                {closedPercentage}%
              </span>

            </div>

            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">

              <div
                className="h-full bg-emerald-400 rounded-full transition-all"
                style={{
                  width: `${closedPercentage}%`,
                }}
              />

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

