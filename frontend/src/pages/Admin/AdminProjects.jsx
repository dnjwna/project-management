import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchProjects, deleteProject } from '../../features/projects/projectSlice'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Spinner from '../../components/ui/Spinner'
import { formatDate } from '../../utils/format'
import { Plus, Trash2, Calendar, ClipboardList, Settings } from 'lucide-react'

const statusVariant = {
  on_track: 'bg-teal-100 text-teal-700 border-teal-200',
  delayed: 'bg-red-100 text-red-600 border-red-200',
  completed: 'bg-blue-100 text-blue-700 border-blue-200',
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
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings size={20} className="text-teal-500" />
            <h1 className="text-2xl font-bold text-slate-800">Manage Projects</h1>
          </div>
          <p className="text-slate-400 text-sm">{projects.length} total projects</p>
        </div>
        <Button onClick={() => navigate('/projects')}
          className="bg-teal-500 hover:bg-teal-600 text-white gap-2">
          <Plus size={16} /> New Project
        </Button>
      </div>

      {loading ? <Spinner /> : (
        <Card className="border-slate-200 shadow-none">
          <CardContent className="p-0">
            {projects.length === 0 && (
              <p className="text-center text-slate-400 py-12 text-sm">No projects yet.</p>
            )}
            {projects.map((project, i) => (
              <div key={project.id}>
                <div
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <p className="font-semibold text-slate-800 truncate group-hover:text-teal-600 transition-colors">
                        {project.name}
                      </p>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border capitalize shrink-0 ${statusVariant[project.status] || ''}`}>
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

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right w-20">
                      <p className="text-sm font-bold text-teal-500 mb-1">{project.progress ?? 0}%</p>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full"
                          style={{ width: `${project.progress ?? 0}%` }} />
                      </div>
                    </div>
                    <Button variant="ghost" size="icon"
                      onClick={(e) => handleDelete(e, project.id)}
                      className="w-8 h-8 text-slate-300 hover:text-red-500 hover:bg-red-50">
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>
                {i < projects.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}