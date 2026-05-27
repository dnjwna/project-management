import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProjectSummary } from '../../features/reports/reportSlice'
import Spinner from '../../components/ui/Spinner'
import { CheckCircle, AlertCircle, Trophy, FolderKanban } from 'lucide-react'

const statusVariant = {
  on_track: 'bg-emerald-100 text-emerald-700',
  delayed: 'bg-red-100 text-red-600',
  completed: 'bg-slate-100 text-slate-600',
}

export default function AdminReports() {
  const dispatch = useDispatch()
  const { summary, loading } = useSelector((s) => s.reports)

  useEffect(() => { dispatch(fetchProjectSummary()) }, [])

  if (loading) return <div className="py-20"><Spinner /></div>

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-app-dark">Reports</h1>
        <p className="text-slate-400 text-sm mt-0.5">Overview of all projects</p>
      </div>

      {summary && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Projects', value: summary.total_projects, icon: FolderKanban, bg: 'bg-white',        color: 'text-app-dark' },
              { label: 'On Track',       value: summary.on_track,       icon: CheckCircle,  bg: 'bg-emerald-100',  color: 'text-emerald-700' },
              { label: 'Delayed',        value: summary.delayed,         icon: AlertCircle,  bg: 'bg-red-50',       color: 'text-red-600' },
              { label: 'Completed',      value: summary.completed,       icon: Trophy,       bg: 'bg-slate-100',    color: 'text-slate-600' },
            ].map((card) => {
              const Icon = card.icon
              return (
                <div key={card.label} className={`${card.bg} rounded-2xl p-5`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-slate-500">{card.label}</p>
                    <Icon size={16} className={card.color} />
                  </div>
                  <p className={`text-4xl font-bold ${card.color}`}>{card.value}</p>
                </div>
              )
            })}
          </div>

          {/* Project Progress */}
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-app-dark">Project Progress</h2>
            </div>
            <div className="p-6 space-y-6">
              {summary.projects?.map((project) => (
                <div key={project.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <p className="font-medium text-app-dark text-sm">{project.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusVariant[project.status]}`}>
                        {project.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-app-dark">{project.progress ?? 0}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${project.progress ?? 0}%` }} />
                  </div>
                  <div className="flex gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle size={10} className="text-emerald-500" />
                      Done: {project.done_tasks_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertCircle size={10} className="text-red-400" />
                      Blocked: {project.blocked_tasks_count}
                    </span>
                    <span>Total: {project.tasks_count}</span>
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