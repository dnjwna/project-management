import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { fetchProjects } from '../features/projects/projectSlice'
import { fetchProjectSummary } from '../features/reports/reportSlice'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Spinner from '../components/ui/Spinner'
import { formatDate } from '../utils/format'
import { Plus, Clock, ArrowRight } from 'lucide-react'

const avatarColors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
const getColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length]
const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

const cardBg = {
  on_track: 'bg-emerald-100',
  delayed: 'bg-red-50',
  completed: 'bg-emerald-50',
}

const statusLabel = {
  on_track: { label: 'In progress', color: 'text-emerald-600' },
  delayed: { label: 'Delayed', color: 'text-red-500' },
  completed: { label: 'Completed', color: 'text-emerald-600' },
}

export default function Dashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const { list: projects, loading } = useSelector((s) => s.projects)
  const { summary } = useSelector((s) => s.reports)

  useEffect(() => {
    dispatch(fetchProjects({ limit: 9 }))
    if (isAdmin) dispatch(fetchProjectSummary())
  }, [])

  // Group projects
  const inProgress = projects.filter(p => p.status === 'on_track')
  const delayed = projects.filter(p => p.status === 'delayed')
  const completed = projects.filter(p => p.status === 'completed')

  const groups = [
    { label: 'In Progress', count: inProgress.length, items: inProgress },
    { label: 'Delayed', count: delayed.length, items: delayed },
    { label: 'Completed', count: completed.length, items: completed },
  ].filter(g => g.items.length > 0)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-app-dark">
            {user?.name?.split(' ')[0]}'s Workspace
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {projects.length} active projects
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => navigate('/projects')}
            className="bg-app-dark hover:bg-slate-700 text-white gap-2 rounded-xl"
          >
            <Plus size={16} /> New Project
          </Button>
        )}
      </div>

      {loading ? <Spinner /> : (
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.label}>
              {/* Group header */}
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-base font-semibold text-app-dark">{group.label}</h2>
                <span className="text-slate-400 text-sm">{group.count}</span>
              </div>

              {/* Cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items.map((project) => {
                  const progress = project.progress ?? 0
                  const bg = cardBg[project.status] || 'bg-white'
                  const status = statusLabel[project.status]

                  return (
                    <div
                      key={project.id}
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className={`${bg} rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all group border border-transparent hover:border-slate-200`}
                    >
                      {/* Tags */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-2.5 py-1 bg-white/70 rounded-full text-xs font-medium text-slate-600">
                          {project.tasks_count ?? 0} tasks
                        </span>
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-white/70 rounded-full text-xs font-medium text-slate-500">
                          <Clock size={10} />
                          {formatDate(project.end_date)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-app-dark text-base mb-1 group-hover:text-emerald-700 transition-colors line-clamp-2">
                        {project.name}
                      </h3>

                      {/* Progress */}
                      <div className="mt-4 mb-4">
                        <p className="text-4xl font-bold text-app-dark">{progress}%</p>
                        <p className={`text-xs font-medium mt-0.5 ${status?.color}`}>{status?.label}</p>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {project.members?.slice(0, 3).map((m) => (
                            <Avatar key={m.id} className="w-7 h-7 ring-2 ring-white">
                              <AvatarFallback className={`${getColor(m.user?.name)} text-white text-xs font-semibold`}>
                                {getInitials(m.user?.name)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {(project.members?.length ?? 0) > 3 && (
                            <div className="w-7 h-7 bg-white ring-2 ring-white rounded-full flex items-center justify-center text-xs text-slate-500 font-medium">
                              +{project.members.length - 3}
                            </div>
                          )}
                        </div>
                        <ArrowRight size={16} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  )
                })}

                {/* Add Project card (admin only) */}
                {isAdmin && group.label === 'In Progress' && (
                  <div
                    onClick={() => navigate('/projects')}
                    className="rounded-2xl p-5 border-2 border-dashed border-slate-200 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex flex-col items-center justify-center gap-2 min-h-48"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <Plus size={20} className="text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium">Add Task</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {projects.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <p className="text-lg font-medium mb-2">No projects yet</p>
              <p className="text-sm">Create your first project to get started</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}