import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchProjects, createProject, deleteProject } from '../../features/projects/projectSlice'
import { useAuth } from '../../hooks/useAuth'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'

const initForm = { name: '', description: '', start_date: '', end_date: '' }

export default function ProjectList() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { list: projects, pagination, loading } = useSelector((s) => s.projects)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(initForm)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    dispatch(fetchProjects({ search, status, page, limit: 8 }))
  }, [search, status, page])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    await dispatch(createProject(form))
    setSubmitting(false)
    setShowModal(false)
    setForm(initForm)
    dispatch(fetchProjects({ search, status, page, limit: 8 }))
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Delete this project?')) return
    await dispatch(deleteProject(id))
  }

  const inputClass = "w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm"

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Projects</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {pagination?.total ?? 0} total projects
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + New Project
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="flex-1 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:border-blue-400"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:border-blue-400"
        >
          <option value="">All Status</option>
          <option value="on_track">On Track</option>
          <option value="delayed">Delayed</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* List */}
      {loading ? <Spinner /> : (
        <>
          <div className="grid gap-4">
            {projects.length === 0 && (
              <div className="bg-white rounded-xl p-12 text-center text-slate-400 border border-slate-200">
                No projects found.
              </div>
            )}
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-800 truncate">{project.name}</h3>
                      <Badge value={project.status} />
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-1">{project.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                      <span>📅 {project.start_date} → {project.end_date}</span>
                      <span>👥 {project.members?.length ?? 0} members</span>
                      <span>✅ {project.tasks_count ?? 0} tasks</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Progress */}
                    <div className="text-right">
                      <p className="text-xs text-slate-400 mb-1">Progress</p>
                      <p className="text-sm font-bold text-blue-500">{project.progress ?? 0}%</p>
                      <div className="w-20 h-1.5 bg-slate-200 rounded-full mt-1">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${project.progress ?? 0}%` }}
                        />
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDelete(e, project.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.lastPage > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition-colors"
              >
                ← Prev
              </button>
              <span className="text-sm text-slate-500">
                Page {pagination.currentPage} of {pagination.lastPage}
              </span>
              <button
                disabled={page === pagination.lastPage}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setForm(initForm) }} title="Create New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Project Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Website Redesign" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Project description..." className={`${inputClass} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Start Date</label>
              <input required type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">End Date</label>
              <input required type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className={inputClass} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors">
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}