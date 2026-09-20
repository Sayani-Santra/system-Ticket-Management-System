interface SuperAdminProps {
  stats: {
    totalTickets: number;
    openCount: number;
    resolvedCount: number;
    escalatedCount: number;
  };
  categoryBreakdown: Record<string, number>;
  priorityBreakdown: Record<string, number>;
  adminWorkload: Array<{
    name: string;
    assignedCount: number;
  }>;
}

export function SuperAdminDashboard({
  stats,
  categoryBreakdown,
  priorityBreakdown,
  adminWorkload,
}: SuperAdminProps) {
  const resolutionRate =
    stats.totalTickets > 0
      ? Math.round((stats.resolvedCount / stats.totalTickets) * 100)
      : 0;

  const openRate =
    stats.totalTickets > 0
      ? Math.round((stats.openCount / stats.totalTickets) * 100)
      : 0;

  const escalatedRate =
    stats.totalTickets > 0
      ? Math.round((stats.escalatedCount / stats.totalTickets) * 100)
      : 0;

  const maxAssigned = Math.max(
    ...adminWorkload.map((admin) => admin.assignedCount),
    1
  );

  const priorityStyles: Record<string, string> = {
    critical: "bg-red-100 text-red-700 border-red-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-green-100 text-green-700 border-green-200",
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Super Admin Dashboard
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Monitor tickets, workload and overall system performance.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>

            <span className="text-sm font-medium text-slate-600">
              System Overview
            </span>
          </div>
        </div>

        {/* ================= STAT CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          {/* Total Tickets */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Tickets
                </p>

                <h2 className="text-3xl font-bold text-slate-900 mt-2">
                  {stats.totalTickets}
                </h2>

                <p className="text-xs text-slate-400 mt-2">
                  All tickets in the system
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                🎫
              </div>

            </div>
          </div>

          {/* Open Tickets */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Open Tickets
                </p>

                <h2 className="text-3xl font-bold text-slate-900 mt-2">
                  {stats.openCount}
                </h2>

                <p className="text-xs text-slate-400 mt-2">
                  {openRate}% of total tickets
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                📂
              </div>

            </div>

            <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${openRate}%` }}
              />
            </div>
          </div>

          {/* Resolved */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Resolved Tickets
                </p>

                <h2 className="text-3xl font-bold text-slate-900 mt-2">
                  {stats.resolvedCount}
                </h2>

                <p className="text-xs text-emerald-600 font-medium mt-2">
                  {resolutionRate}% resolution rate
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                ✓
              </div>

            </div>

            <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${resolutionRate}%` }}
              />
            </div>
          </div>

          {/* Escalated */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Escalated Tickets
                </p>

                <h2 className="text-3xl font-bold text-red-600 mt-2">
                  {stats.escalatedCount}
                </h2>

                <p className="text-xs text-red-500 mt-2">
                  {escalatedRate}% of total tickets
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                ⚠
              </div>

            </div>

            <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full"
                style={{ width: `${escalatedRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* ================= SECOND ROW ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ADMIN WORKLOAD */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">

            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center justify-between">

                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Admin Workload
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Tickets assigned to each Server Admin
                  </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  👥
                </div>

              </div>
            </div>

            <div className="p-5">

              {adminWorkload.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">
                  No admin workload data available.
                </div>
              ) : (
                <div className="space-y-5">

                  {adminWorkload.map((admin, idx) => {
                    const percentage = Math.round(
                      (admin.assignedCount / maxAssigned) * 100
                    );

                    return (
                      <div key={idx}>

                        <div className="flex items-center justify-between mb-2">

                          <div className="flex items-center gap-3">

                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-700">
                              {admin.name.charAt(0).toUpperCase()}
                            </div>

                            <span className="text-sm font-medium text-slate-700">
                              {admin.name}
                            </span>

                          </div>

                          <span className="text-sm font-semibold text-slate-900">
                            {admin.assignedCount} tickets
                          </span>

                        </div>

                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                      </div>
                    );
                  })}

                </div>
              )}

            </div>
          </div>

          {/* PRIORITY BREAKDOWN */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">

            <div className="p-5 border-b border-slate-100">

              <div className="flex items-center justify-between">

                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Tickets by Priority
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Overview of ticket urgency
                  </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  🔥
                </div>

              </div>

            </div>

            <div className="p-5">

              {Object.keys(priorityBreakdown).length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">
                  No priority data available.
                </div>
              ) : (
                <div className="space-y-3">

                  {Object.entries(priorityBreakdown).map(
                    ([priority, count]) => (

                      <div
                        key={priority}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                      >

                        <div className="flex items-center gap-3">

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                              priorityStyles[priority.toLowerCase()] ||
                              "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {priority}
                          </span>

                        </div>

                        <span className="text-lg font-bold text-slate-900">
                          {count}
                        </span>

                      </div>

                    )
                  )}

                </div>
              )}

            </div>
          </div>
        </div>

        {/* ================= CATEGORY BREAKDOWN ================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">

          <div className="p-5 border-b border-slate-100">

            <div className="flex items-center justify-between">

              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Tickets by Category
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Distribution of tickets across different categories
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                📊
              </div>

            </div>

          </div>

          <div className="p-5">

            {Object.keys(categoryBreakdown).length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">
                No category data available.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                {Object.entries(categoryBreakdown).map(
                  ([category, count]) => {

                    const percentage =
                      stats.totalTickets > 0
                        ? Math.round(
                            (count / stats.totalTickets) * 100
                          )
                        : 0;

                    return (
                      <div
                        key={category}
                        className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition"
                      >

                        <div className="flex items-center justify-between mb-3">

                          <span className="text-sm font-medium text-slate-700 capitalize">
                            {category}
                          </span>

                          <span className="text-lg font-bold text-slate-900">
                            {count}
                          </span>

                        </div>

                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        <p className="text-xs text-slate-400 mt-2">
                          {percentage}% of total tickets
                        </p>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>
        </div>

        {/* ================= SYSTEM SUMMARY ================= */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h3 className="text-lg font-semibold">
                System Performance Overview
              </h3>

              <p className="text-sm text-slate-300 mt-1">
                {stats.resolvedCount} out of {stats.totalTickets} tickets
                have been resolved.
              </p>
            </div>

            <div className="text-left md:text-right">

              <p className="text-3xl font-bold">
                {resolutionRate}%
              </p>

              <p className="text-xs text-slate-400">
                Overall Resolution Rate
              </p>

            </div>

          </div>

          <div className="mt-5 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all"
              style={{ width: `${resolutionRate}%` }}
            />
          </div>

        </div>

      </div>
    </div>
  );
}