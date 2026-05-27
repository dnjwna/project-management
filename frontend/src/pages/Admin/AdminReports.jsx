import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProjectSummary } from '../../features/reports/reportSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Spinner from '../../components/ui/Spinner'
import { FolderKanban, CheckCircle, AlertCircle, Trophy, BarChart3, ClipboardList } from 'lucide-react'

const statusVariant = {
  on_track: 'bg-teal-100 text-teal-700 border-teal-200',
  delayed: 'bg-red-100 text-red-600 border-red-200',
  completed: 'bg-blue-100 text-blue-700 border-blue-200',
}

export default function AdminReports() {
  const dispatch = useDispatch()
  const { summary, loading } = useSelector((s) => s.reports)

  useEffect(() => { dispatch(fetchProjectSummary()) }, [])

  if (loading) return <div className="p-8"><Spinner /></div>

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 size={20} className="text-teal-500" />
          <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
        </div>
        <p className="text-slate-400 text-sm">Overview of all projects</p>
      </div>

      {summary && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Projects', value: summary.total_projects, icon: FolderKanban, color: 'text-blue-500',   bg: 'bg-blue-50',   border: 'border-blue-100' },
              { label: 'On Track',       value: summary.on_track,       icon: CheckCircle,  color: 'text-teal-500',   bg: 'bg-teal-50',   border: 'border-teal-100' },
              { label: 'Delayed',        value: summary.delayed,         icon: AlertCircle,  color: 'text-red-500',    bg: 'bg-red-50',    border: 'border-red-100' },
              { label: 'Completed',      value: summary.completed,       icon: Trophy,       color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' },
            ].map((card) => {
              const Icon = card.icon
              return (
                <Card key={card.label} className={`${card.bg} ${card.border} border shadow-none`}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-slate-500">{card.label}</p>
                      <Icon size={18} className={card.color} />
                    </div>
                    <p className={`text-4xl font-bold ${card.color}`}>{card.value}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Project Progress */}
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-700">Project Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {summary.projects?.map((project) => (
                <div key={project.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <p className="font-medium text-slate-700 text-sm">{project.name}</p>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${statusVariant[project.status] || ''}`}>
                        {project.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-teal-500">{project.progress ?? 0}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-teal-500 rounded-full transition-all"
                      style={{ width: `${project.progress ?? 0}%` }} />
                  </div>
                  <div className="flex gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle size={11} className="text-teal-500" />
                      Done: {project.done_tasks_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertCircle size={11} className="text-red-400" />
                      Blocked: {project.blocked_tasks_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClipboardList size={11} />
                      Total: {project.tasks_count}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}