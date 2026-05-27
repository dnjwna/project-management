import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTasks, createTask, updateTask, deleteTask } from '../../features/tasks/taskSlice'
import { fetchProjectDetail } from '../../features/projects/projectSlice'
import { useAuth } from '../../hooks/useAuth'
import api from '../../utils/axios'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'

const initForm = { title: '', description: '', priority: 'medium', due_date: '', assigned_to: '' }

export default function TaskList() {
  const { id: projectId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAdmin, user } = useAuth()
  const { list: tasks, pagination, loading } = useSelector((s) => s.tasks)
  const { detail: project } = useSelector((s) => s.projects)

  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [members, setMembers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [form, setForm] = useState(initForm)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    dispatch(fetchProjectDetail(projectId))
    fetchMembers()
  }, [projectId])

  useEffect(() => {
    dispatch(fetchTasks({ projectId, params: { status: statusFilter, priority: priorityFilter, search, page, limit: 10 } }))
  }, [statusFilter, priorityFilter, search, page])

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/projects/${projectId}/members`)
      setMembers(res.data)
    } catch {}
  }

  const openCreate = () => { setEditTask(null); setForm(initForm); setShowModal(true) }

  const openEdit = (task) => {
    setEditTask(task)
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      due_date: task.due_date || '',
      assigned_to: task.assigned_to || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const payload = { ...form, assigned_to: form.assigned_to || null }

    if (editTask) {
      await dispatch(updateTask({ projectId, taskId: editTask.id, data: payload }))
    } else {
      await dispatch(createTask({ projectId, data: payload }))
    }
    setSubmitting(false)
    setShowModal(false)
    dispatch(fetchTasks({ projectId, params: { status: statusFilter, priority: priorityFilter, search, page, limit: 10 } }))
  }

  const handleDelete = async (taskId) => {
    if (!confirm('Delete this task?')) return
    await dispatch(deleteTask({ projectId, taskId }))
  }

  const handleStatusChange = async (task, newStatus) => {
    await dispatch(updateTask({ projectId, taskId: task.id, data: { status: newStatus } }))
  }

  const isManagerOrAdmin = isAdmin || members.some(m => m.user?.id === user?.id && m.role === 'manager')

  const inputClass = "w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm"

  return (
    <div>
      {/* Back */}
      <button onClick={() => navigate(`/projects/${projectId}`)}
        className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-5 transition-colors">
        ← Back to Project
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tasks</h1>
          <p className="text-slate-500 text-sm mt-0.5">{project?.name}</p>
        </div>
        {isManagerOrAdmin && (
          <button onClick={openCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
            + New Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input type="text" placeholder="Search tasks..."
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="flex-1 min-w-48 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:border-blue-400"
        />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none">
          <option value="">All Status</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
          <option value="blocked">Blocked</option>
        </select>
        <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1) }}
          className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none">
          <option value="">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Tasks */}
      {loading ? <Spinner /> : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
            {tasks.length === 0 && (
              <p className="px-6 py-10 text-center text-slate-400 text-sm">No tasks found.</p>
            )}
            {tasks.map((task) => {
              const isAssignee = task.assigned_to === user?.id
              const canEdit = isManagerOrAdmin || isAssignee

              return (
                <div key={task.id} className="px-5 py-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-slate-800 text-sm">{task.title}</p>
                      <Badge value={task.priority} />
                    </div>
                    {task.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{task.description}</p>
                    )}
                    <div className="flex gap-3 mt-2 text-xs text-slate-400 flex-wrap">
                      {task.assignee && <span>👤 {task.assignee.name}</span>}
                      {task.due_date && <span>📅 Due {task.due_date}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Quick status update */}
                    {canEdit && (
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 focus:outline-none"
                      >
                        <option value="todo">Todo</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    )}
                    {!canEdit && <Badge value={task.status} />}

                    {isManagerOrAdmin && (
                      <>
                        <button onClick={() => openEdit(task)}
                          className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors text-sm">
                          ✏️
                        </button>
                        <button onClick={() => handleDelete(task.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm">
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {pagination && pagination.lastPage > 1 && (
            <div className="flex justify-center items-center gap-2 mt-5">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition-colors">
                ← Prev
              </button>
              <span className="text-sm text-slate-500">Page {pagination.currentPage} of {pagination.lastPage}</span>
              <button disabled={page === pagination.lastPage} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition-colors">
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Create / Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editTask ? 'Edit Task' : 'Create Task'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Title</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Task title" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`${inputClass} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={inputClass}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Status</label>
              <select value={form.status || 'todo'} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Due Date</label>
              <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Assign To</label>
              <select value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} className={inputClass}>
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user?.id} value={m.user?.id}>{m.user?.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors">
              {submitting ? 'Saving...' : editTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}