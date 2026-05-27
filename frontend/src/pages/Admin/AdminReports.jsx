import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProjectSummary } from '../../features/reports/reportSlice'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'

export default function AdminReports() {
  const dispatch = useDispatch()
  const { summary, loading } = useSelector((s) => s.reports)

  useEffect(() => { dispatch(fetchProjectSummary()) }, [])

  if (loading) return <Spinner />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
        <p className="text-slate-500 text-sm mt-0.5">Overview of all projects</p>
      </div>

      {summary && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Projects', value: summary.total_projects, color: 'text-blue-500' },
              { label: 'On Track',       value: summary.on_track,       color: 'text-green-500' },
              { label: 'Delayed',        value: summary.delayed,         color: 'text-red-500' },
              { label: 'Completed',      value: summary.completed,       color: 'text-purple-500' },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* Project Progress Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-700">Project Progress</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {summary.projects?.map((project) => (
                <div key={project.id} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-700 text-sm">{project.name}</p>
                      <Badge value={project.status} />
                    </div>
                    <span className="text-sm font-bold text-blue-500">{project.progress ?? 0}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${project.progress ?? 0}%` }}
                    />
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-slate-400">
                    <span>✅ Done: {project.done_tasks_count}</span>
                    <span>🔴 Blocked: {project.blocked_tasks_count}</span>
                    <span>📋 Total: {project.tasks_count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}