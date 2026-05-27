import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchProjects, deleteProject } from '../../features/projects/projectSlice'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Projects</h1>
          <p className="text-slate-500 text-sm mt-0.5">{projects.length} total projects</p>
        </div>
        <button onClick={() => navigate('/projects')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
          + New Project
        </button>
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          {projects.map((project) => (
            <div key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-800 truncate">{project.name}</p>
                  <Badge value={project.status} />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {project.start_date} → {project.end_date} · {project.tasks_count ?? 0} tasks
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-500">{project.progress ?? 0}%</p>
                  <div className="w-16 h-1.5 bg-slate-200 rounded-full mt-1">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${project.progress ?? 0}%` }} />
                  </div>
                </div>
                <button onClick={(e) => handleDelete(e, project.id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}