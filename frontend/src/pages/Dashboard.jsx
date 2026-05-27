import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { fetchProjects } from '../features/projects/projectSlice'
import { fetchProjectSummary } from '../features/reports/reportSlice'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'

export default function Dashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const { list: projects, loading } = useSelector((s) => s.projects)
  const { summary } = useSelector((s) => s.reports)

  useEffect(() => {
    dispatch(fetchProjects({ limit: 5 }))
    if (isAdmin) dispatch(fetchProjectSummary())
  }, [])

  const statCards = isAdmin && summary ? [
    { label: 'Total Projects', value: summary.total_projects, color: 'text-blue-400' },
    { label: 'On Track',       value: summary.on_track,       color: 'text-green-400' },
    { label: 'Delayed',        value: summary.delayed,         color: 'text-red-400' },
    { label: 'Completed',      value: summary.completed,       color: 'text-purple-400' },
  ] : []

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome back, {user?.name} 👋
        </h1>
        <p className="text-slate-500 mt-1">Here's what's happening with your projects.</p>
      </div>

      {/* Stat Cards (Admin only) */}
      {isAdmin && summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recent Projects */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-700">Recent Projects</h2>
          <button
            onClick={() => navigate('/projects')}
            className="text-sm text-blue-500 hover:text-blue-600 font-medium"
          >
            View all →
          </button>
        </div>

        {loading ? <Spinner /> : (
          <div className="divide-y divide-slate-100">
            {projects.length === 0 && (
              <p className="px-6 py-8 text-center text-slate-400">No projects yet.</p>
            )}
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-slate-800">{project.name}</p>
                  <p className="text-sm text-slate-400 mt-0.5 line-clamp-1">{project.description}</p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  {/* Progress bar */}
                  <div className="hidden sm:block w-24">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Progress</span>
                      <span>{project.progress ?? 0}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${project.progress ?? 0}%` }}
                      />
                    </div>
                  </div>
                  <Badge value={project.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}