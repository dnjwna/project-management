import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchProjects, deleteProject } from '../../features/projects/projectSlice'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Spinner from '../../components/ui/Spinner'
import { formatDate } from '../../utils/format'
import { Plus, Trash2, Clock, ArrowRight } from 'lucide-react'

const avatarColors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
const getColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length]
const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

const cardBg = {
  on_track: 'bg-emerald-100',
  delayed: 'bg-red-50',
  completed: 'bg-slate-100',
}

const statusLabel = {
  on_track: { label: 'In progress', color: 'text-emerald-600' },
  delayed: { label: 'Delayed', color: 'text-red-500' },
  completed: { label: 'Completed', color: 'text-slate-500' },
}

export default function AdminProjects() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { list: projects, loading } = useSelector((s) => s.projects)

  useEffect(() => {
    dispatch(fetchProjects({ limit: 50 }))
  }, [])

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Delete this project?')) return
    await dispatch(deleteProject(id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-app-dark">Manage Projects</h1>
          <p className="text-slate-400 text-sm mt-0.5">{projects.length} total projects</p>
        </div>
        <Button onClick={() => navigate('/projects')}
          className="bg-app-dark hover:bg-slate-700 text-white gap-2 rounded-xl">
          <Plus size={16} /> New Project
        </Button>
      </div>

      {loading ? <Spinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const progress = project.progress ?? 0
            const bg = cardBg[project.status] || 'bg-white'
            const status = statusLabel[project.status]

            return (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className={`${bg} rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all group border border-transparent hover:border-slate-200 relative`}
              >
                {/* Delete */}
                <button
                  onClick={(e) => handleDelete(e, project.id)}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/60 hover:bg-red-100 flex items-center justify-center text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={13} />
                </button>

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
                <div className="mb-4">
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
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}