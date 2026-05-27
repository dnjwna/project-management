import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { fetchProjects } from '../features/projects/projectSlice'
import { fetchProjectSummary } from '../features/reports/reportSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import Spinner from '../components/ui/Spinner'
import { formatDate } from '../utils/format'
import { ArrowRight, FolderKanban, CheckCircle, AlertCircle, Trophy, Calendar, Users, ClipboardList } from 'lucide-react'

const avatarColors = ['bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
const getColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length]
const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

const statusVariant = {
  on_track: 'bg-teal-100 text-teal-700 border-teal-200',
  delayed: 'bg-red-100 text-red-600 border-red-200',
  completed: 'bg-blue-100 text-blue-700 border-blue-200',
}

export default function Dashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const { list: projects, loading } = useSelector((s) => s.projects)
  const { summary } = useSelector((s) => s.reports)

  useEffect(() => {
    dispatch(fetchProjects({ limit: 6 }))
    if (isAdmin) dispatch(fetchProjectSummary())
  }, [])

  const statCards = isAdmin && summary ? [
    { label: 'Total Projects', value: summary.total_projects, icon: FolderKanban, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'On Track',       value: summary.on_track,       icon: CheckCircle,  color: 'text-teal-500', bg: 'bg-teal-50',  border: 'border-teal-100' },
    { label: 'Delayed',        value: summary.delayed,         icon: AlertCircle,  color: 'text-red-500',  bg: 'bg-red-50',   border: 'border-red-100' },
    { label: 'Completed',      value: summary.completed,       icon: Trophy,       color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' },
  ] : []

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Good day, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Here's what's happening across your projects.</p>
        </div>
        {isAdmin && (
          <Button onClick={() => navigate('/projects')}
            className="bg-teal-500 hover:bg-teal-600 text-white gap-2">
            <span>New Project</span>
            <ArrowRight size={16} />
          </Button>
        )}
      </div>

      {/* Stat Cards */}
      {isAdmin && summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => {
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
      )}

      {/* Recent Projects */}
      <Card className="border-slate-200 shadow-none">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-slate-700">Recent Projects</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}
              className="text-teal-500 hover:text-teal-600 hover:bg-teal-50 gap-1 text-sm">
              View all <ArrowRight size={14} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? <Spinner /> : (
            <div className="space-y-0">
              {projects.length === 0 && (
                <p className="text-center text-slate-400 py-8 text-sm">No projects yet.</p>
              )}
              {projects.map((project, i) => (
                <div key={project.id}>
                  <div
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="flex items-center justify-between py-4 px-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1">
                        <p className="font-semibold text-slate-800 truncate group-hover:text-teal-600 transition-colors">
                          {project.name}
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${statusVariant[project.status] || 'bg-slate-100 text-slate-500'}`}>
                          {project.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {formatDate(project.start_date)} → {formatDate(project.end_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClipboardList size={11} />
                          {project.tasks_count ?? 0} tasks
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 ml-4 shrink-0">
                      {/* Member avatars */}
                      <div className="hidden sm:flex -space-x-2">
                        {project.members?.slice(0, 3).map((m) => (
                          <Avatar key={m.id} className="w-7 h-7 ring-2 ring-white">
                            <AvatarFallback className={`${getColor(m.user?.name)} text-white text-xs font-semibold`}>
                              {getInitials(m.user?.name)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {project.members?.length > 3 && (
                          <div className="w-7 h-7 bg-slate-200 ring-2 ring-white rounded-full flex items-center justify-center text-xs text-slate-500 font-medium">
                            +{project.members.length - 3}
                          </div>
                        )}
                      </div>

                      {/* Progress */}
                      <div className="text-right w-24">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Progress</span>
                          <span className="font-semibold text-teal-600">{project.progress ?? 0}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 rounded-full transition-all duration-500"
                            style={{ width: `${project.progress ?? 0}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  {i < projects.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}