interface ServerAdminDashboardProps {
  stats: {
    assigned: number;
    inProgress: number;
    critical: number;
    overdue: number;
  };
  recentUpdates: Array<{
    $id: string;
    title: string;
    priority: string;
    status: string;
  }>;
}

export function ServerAdminDashboard({
  stats,
  recentUpdates,
}: ServerAdminDashboardProps) {
  const inProgressRate =
    stats.assigned > 0
      ? Math.round((stats.inProgress / stats.assigned) * 100)
      : 0;

  const criticalRate =
    stats.assigned > 0
      ? Math.round((stats.critical / stats.assigned) * 100)
      : 0;

  const overdueRate =
    stats.assigned > 0
      ? Math.round((stats.overdue / stats.assigned) * 100)
      : 0;

  const priorityStyles: Record<string, string> = {
    critical: "bg-red-100 text-red-700 border-red-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-green-100 text-green-700 border-green-200",
  };

  const statusStyles: Record<string, string> = {
    open: "bg-blue-100 text-blue-700",
    "in-progress": "bg-indigo-100 text-indigo-700",
    "in progress": "bg-indigo-100 text-indigo-700",
    resolved: "bg-emerald-100 text-emerald-700",
    closed: "bg-slate-100 text-slate-700",
    escalated: "bg-red-100 text-red-700",
    overdue: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Server Admin Dashboard
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Manage assigned tickets and monitor ongoing support activities.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>

            <span className="text-sm font-medium text-slate-600">
              Admin Workspace
            </span>
          </div>
        </div>

        {/* ================= STAT CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          {/* Assigned Tickets */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Assigned Tickets
                </p>

                <h2 className="text-3xl font-bold text-blue-600 mt-2">
                  {stats.assigned}
                </h2>

                <p className="text-xs text-slate-400 mt-2">
                  Tickets assigned to you
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-xl">
                🎫
              </div>

            </div>
          </div>

          {/* In Progress */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  In Progress
                </p>

                <h2 className="text-3xl font-bold text-indigo-600 mt-2">
                  {stats.inProgress}
                </h2>

                <p className="text-xs text-indigo-500 mt-2">
                  {inProgressRate}% of assigned tickets
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-xl">
                ⚙️
              </div>

            </div>

            <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${inProgressRate}%` }}
              />
            </div>
          </div>

          {/* Critical Tickets */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Critical Tickets
                </p>

                <h2 className="text-3xl font-bold text-red-600 mt-2">
                  {stats.critical}
                </h2>

                <p className="text-xs text-red-500 mt-2">
                  {criticalRate}% of assigned tickets
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-red-600 text-xl">
                ⚠️
              </div>

            </div>

            <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all"
                style={{ width: `${criticalRate}%` }}
              />
            </div>
          </div>

          {/* Overdue Tickets */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Overdue Tickets
                </p>

                <h2 className="text-3xl font-bold text-amber-600 mt-2">
                  {stats.overdue}
                </h2>

                <p className="text-xs text-amber-600 mt-2">
                  {overdueRate}% of assigned tickets
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 text-xl">
                ⏰
              </div>

            </div>

            <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{ width: `${overdueRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* ================= WORK SUMMARY ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Current Work */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Current Work Summary
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Overview of your current ticket workload
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                📊
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-xs font-medium text-blue-600 uppercase">
                  Assigned
                </p>

                <p className="text-2xl font-bold text-blue-700 mt-1">
                  {stats.assigned}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <p className="text-xs font-medium text-indigo-600 uppercase">
                  Working
                </p>

                <p className="text-2xl font-bold text-indigo-700 mt-1">
                  {stats.inProgress}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                <p className="text-xs font-medium text-red-600 uppercase">
                  Critical
                </p>

                <p className="text-2xl font-bold text-red-700 mt-1">
                  {stats.critical}
                </p>
              </div>

            </div>

            {/* Work Progress */}
            <div className="mt-6">

              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-600">
                  In-progress workload
                </span>

                <span className="text-sm font-semibold text-slate-900">
                  {inProgressRate}%
                </span>
              </div>

              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${inProgressRate}%` }}
                />
              </div>

            </div>
          </div>

          {/* Attention Required */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

            <div className="flex items-center gap-3 mb-5">

              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                ⚠️
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Attention Required
                </h2>

                <p className="text-xs text-slate-500">
                  Tickets requiring quick action
                </p>
              </div>

            </div>

            <div className="space-y-3">

              <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100">
                <div>
                  <p className="text-xs text-red-600 font-medium">
                    Critical Tickets
                  </p>

                  <p className="text-xl font-bold text-red-700">
                    {stats.critical}
                  </p>
                </div>

                <span className="text-xl">🚨</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100">
                <div>
                  <p className="text-xs text-amber-600 font-medium">
                    Overdue Tickets
                  </p>

                  <p className="text-xl font-bold text-amber-700">
                    {stats.overdue}
                  </p>
                </div>

                <span className="text-xl">⏰</span>
              </div>

            </div>

          </div>
        </div>

        {/* ================= RECENT UPDATES ================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">

          <div className="p-5 md:p-6 border-b border-slate-100">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Recent Ticket Updates
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Latest activity on your assigned tickets
                </p>
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-medium text-slate-600">
                {recentUpdates.length} Recent
              </div>

            </div>

          </div>

          <div className="divide-y divide-slate-100">

            {recentUpdates.length === 0 ? (

              <div className="py-12 text-center">

                <div className="text-4xl mb-3">
                  📭
                </div>

                <h3 className="text-sm font-semibold text-slate-700">
                  No recent updates
                </h3>

                <p className="text-xs text-slate-400 mt-1">
                  Your recent ticket activities will appear here.
                </p>

              </div>

            ) : (

              recentUpdates.map((ticket) => {

                const priority =
                  priorityStyles[ticket.priority.toLowerCase()] ||
                  "bg-slate-100 text-slate-600 border-slate-200";

                const status =
                  statusStyles[ticket.status.toLowerCase()] ||
                  "bg-slate-100 text-slate-700";

                return (
                  <div
                    key={ticket.$id}
                    className="p-4 md:px-6 hover:bg-slate-50 transition"
                  >

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                      {/* Ticket Information */}
                      <div className="flex items-start gap-4">

                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                          🎫
                        </div>

                        <div className="min-w-0">

                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {ticket.title}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 mt-2">

                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border uppercase ${priority}`}
                            >
                              {ticket.priority}
                            </span>

                            <span className="text-xs text-slate-400">
                              •
                            </span>

                            <span className="text-xs text-slate-500">
                              Ticket ID: {ticket.$id.slice(0, 8)}
                            </span>

                          </div>

                        </div>

                      </div>

                      {/* Status */}
                      <div className="flex items-center sm:justify-end">

                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${status}`}
                        >
                          {ticket.status}
                        </span>

                      </div>

                    </div>

                  </div>
                );
              })

            )}

          </div>
        </div>

        {/* ================= FOOTER SUMMARY ================= */}
        <div className="bg-slate-900 rounded-2xl p-5 md:p-6 text-white">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h3 className="text-lg font-semibold">
                Keep your tickets on track
              </h3>

              <p className="text-sm text-slate-400 mt-1">
                Monitor critical and overdue tickets to maintain timely
                resolution.
              </p>
            </div>

            <div className="flex items-center gap-6">

              <div>
                <p className="text-2xl font-bold text-red-400">
                  {stats.critical}
                </p>

                <p className="text-xs text-slate-400">
                  Critical
                </p>
              </div>

              <div className="w-px h-10 bg-slate-700"></div>

              <div>
                <p className="text-2xl font-bold text-amber-400">
                  {stats.overdue}
                </p>

                <p className="text-xs text-slate-400">
                  Overdue
                </p>
              </div>

              <div className="w-px h-10 bg-slate-700"></div>

              <div>
                <p className="text-2xl font-bold text-indigo-400">
                  {stats.inProgress}
                </p>

                <p className="text-xs text-slate-400">
                  In Progress
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}