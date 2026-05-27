import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchProjects, createProject, deleteProject } from '../../features/projects/projectSlice'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import { formatDate } from '../../utils/format'
import { Plus, Trash2, Clock, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

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

const initForm = { name: '', description: '', start_date: '', end_date: '' }

export default function ProjectList() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { list: projects, pagination, loading } = useSelector((s) => s.projects)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(initForm)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    dispatch(fetchProjects({ search, status: status === 'all' ? '' : status, page, limit: 9 }))
  }, [search, status, page])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    await dispatch(createProject(form))
    setSubmitting(false)
    setShowModal(false)
    setForm(initForm)
    dispatch(fetchProjects({ search, status: status === 'all' ? '' : status, page, limit: 9 }))
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Delete this project?')) return
    await dispatch(deleteProject(id))
  }

  const inputClass = "w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-sm"

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-app-dark">Projects</h1>
          <p className="text-slate-400 text-sm mt-0.5">{pagination?.total ?? 0} total projects</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowModal(true)}
            className="bg-app-dark hover:bg-slate-700 text-white gap-2 rounded-xl">
            <Plus size={16} /> New Project
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="flex-1 bg-white border-slate-200 rounded-xl focus-visible:ring-emerald-400"
        />
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
          <SelectTrigger className="w-44 bg-white border-slate-200 rounded-xl">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="on_track">In Progress</SelectItem>
            <SelectItem value="delayed">Delayed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {loading ? <Spinner /> : (
        <>
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
                  {/* Delete button */}
                  {isAdmin && (
                    <button
                      onClick={(e) => handleDelete(e, project.id)}
                      className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/60 hover:bg-red-100 flex items-center justify-center text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}

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
                  <p className="text-xs text-slate-400 line-clamp-1 mb-4">{project.description}</p>

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

            {/* Add Project card */}
            {isAdmin && (
              <div
                onClick={() => setShowModal(true)}
                className="rounded-2xl p-5 border-2 border-dashed border-slate-200 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex flex-col items-center justify-center gap-2 min-h-52"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <Plus size={20} className="text-slate-400" />
                </div>
                <p className="text-sm text-slate-400 font-medium">New Project</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.lastPage > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button variant="outline" size="sm" disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="gap-1 rounded-xl">
                <ChevronLeft size={14} /> Prev
              </Button>
              <span className="text-sm text-slate-500 px-2">
                {pagination.currentPage} / {pagination.lastPage}
              </span>
              <Button variant="outline" size="sm" disabled={page === pagination.lastPage}
                onClick={() => setPage(p => p + 1)}
                className="gap-1 rounded-xl">
                Next <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setForm(initForm) }} title="Create New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm text-slate-300">Project Name</label>
            <input required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Website Redesign" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-slate-300">Description</label>
            <textarea rows={3} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Project description..."
              className={`${inputClass} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm text-slate-300">Start Date</label>
              <input required type="date" value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-slate-300">End Date</label>
              <input required type="date" value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className={inputClass} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost"
              onClick={() => setShowModal(false)}
              className="text-slate-400">Cancel</Button>
            <Button type="submit" disabled={submitting}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
              {submitting ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}