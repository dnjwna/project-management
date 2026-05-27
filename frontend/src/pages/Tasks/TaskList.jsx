import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { fetchTasks, updateTask, createTask, deleteTask } from '../../features/tasks/taskSlice'
import { fetchProjectDetail } from '../../features/projects/projectSlice'
import { useAuth } from '../../hooks/useAuth'
import api from '../../utils/axios'
import Badge from '../../components/ui/StatusBadge'
import Avatar from '../../components/ui/UserAvatar'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import { formatDate } from '../../utils/format'
import { Calendar, Pencil, Trash2 } from 'lucide-react'

const COLUMNS = [
  { id: 'todo',        label: 'To Do',       color: 'bg-slate-400' },
  { id: 'in_progress', label: 'In Progress',  color: 'bg-orange-400' },
  { id: 'done',        label: 'Done',         color: 'bg-teal-500' },
  { id: 'blocked',     label: 'Blocked',      color: 'bg-red-400' },
]

const initForm = { title: '', description: '', priority: 'medium', due_date: '', assigned_to: '' }

export default function TaskList() {
  const { id: projectId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAdmin, user } = useAuth()
  const { list: tasks, loading } = useSelector((s) => s.tasks)
  const { detail: project } = useSelector((s) => s.projects)

  const [members, setMembers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [form, setForm] = useState(initForm)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    dispatch(fetchProjectDetail(projectId))
    dispatch(fetchTasks({ projectId, params: { limit: 100 } }))
    fetchMembers()
  }, [projectId])

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/projects/${projectId}/members`)
      setMembers(res.data)
    } catch {}
  }

  const isManagerOrAdmin = isAdmin || members.some(m => m.user?.id === user?.id && m.role === 'manager')

  // Group tasks by status
  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t =>
      t.status === col.id &&
      (search === '' || t.title.toLowerCase().includes(search.toLowerCase()))
    )
    return acc
  }, {})

  const onDragEnd = async (result) => {
  const { destination, source, draggableId } = result
  if (!destination) return
  if (destination.droppableId === source.droppableId && destination.index === source.index) return

  const task = tasks.find(t => String(t.id) === draggableId)
  if (!task) return

  const canEdit = isManagerOrAdmin || task.assigned_to === user?.id
  if (!canEdit) return

  // Optimistic update dulu di Redux
  dispatch(updateTask({
    projectId,
    taskId: task.id,
    data: { status: destination.droppableId },
  }))
}

  const openCreate = () => { setEditTask(null); setForm(initForm); setShowModal(true) }
  const openEdit = (task) => {
    setEditTask(task)
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      due_date: formatDate(task.due_date) || '',
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
    dispatch(fetchTasks({ projectId, params: { limit: 100 } }))
  }

  const handleDelete = async (e, taskId) => {
  e.stopPropagation()
  if (!confirm('Delete this task?')) return
  await dispatch(deleteTask({ projectId, taskId }))
  dispatch(fetchTasks({ projectId, params: { limit: 100 } }))
}

  const inputClass = "w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 text-sm"

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="px-8 py-5 bg-white border-b border-slate-200 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/projects/${projectId}`)}
            className="text-slate-400 hover:text-slate-600 transition-colors text-sm">
            ←
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800">{project?.name}</h1>
            <p className="text-xs text-slate-400">Kanban Board · {tasks.length} tasks</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-teal-400 w-48"
            />
          </div>

          {/* Member avatars */}
          <div className="flex -space-x-2">
            {members.slice(0, 4).map((m) => (
              <div key={m.id} className="ring-2 ring-white rounded-full">
                <Avatar name={m.user?.name} size="sm" />
              </div>
            ))}
          </div>

          {isManagerOrAdmin && (
            <button onClick={openCreate}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
              + Add Task
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? <div className="flex-1 flex items-center justify-center"><Spinner /></div> : (
        <div className="flex-1 overflow-x-auto px-8 py-6">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-5 h-full min-w-max">
              {COLUMNS.map((col) => (
                <div key={col.id} className="w-72 flex flex-col">
                  {/* Column header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                    <h3 className="font-semibold text-slate-700 text-sm">{col.label}</h3>
                    <span className="ml-auto bg-slate-200 text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full">
                      {grouped[col.id]?.length ?? 0}
                    </span>
                  </div>

                  {/* Droppable column */}
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 rounded-2xl p-2 space-y-3 min-h-32 transition-colors ${
                          snapshot.isDraggingOver ? 'bg-teal-50 border-2 border-teal-200 border-dashed' : 'bg-slate-100/60'
                        }`}
                      >
                        {grouped[col.id]?.map((task, index) => (
                          <Draggable key={String(task.id)} draggableId={String(task.id)} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white rounded-xl p-4 shadow-sm border transition-all ${
                                  snapshot.isDragging
                                    ? 'shadow-lg border-teal-300 rotate-1'
                                    : 'border-slate-200 hover:shadow-md hover:border-slate-300'
                                }`}
                              >
                                {/* Tags row */}
                                <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
                                  <Badge value={task.priority} />
                                </div>

                                {/* Title */}
                                <p className="font-semibold text-slate-800 text-sm leading-snug mb-1">
                                  {task.title}
                                </p>

                                {/* Description */}
                                {task.description && (
                                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                                    {task.description}
                                  </p>
                                )}

                                {/* Due date */}
                                {formatDate(task.due_date) && (
                                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                                    <Calendar size={11} />
                                    <span>{formatDate(task.due_date)}</span>
                                  </div>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                  {task.assignee
                                    ? <Avatar name={task.assignee.name} size="sm" showName={false} />
                                    : <span className="text-xs text-slate-300">Unassigned</span>
                                  }
                                  {isManagerOrAdmin && (
                                    <div className="flex gap-1">
                                      <button onClick={() => openEdit(task)}
                                        className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors text-xs">
                                        <Pencil size={15} />
                                      </button>
                                      <button onClick={(e) => handleDelete(e, task.id)}
                                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors text-xs">
                                        <Trash2 size={15} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {/* Empty state */}
                        {grouped[col.id]?.length === 0 && !snapshot.isDraggingOver && (
                          <div className="text-center py-8 text-slate-300 text-xs">
                            No tasks here
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editTask ? 'Edit Task' : 'New Task'}>
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
                <option value="todo">To Do</option>
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
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors">
              {submitting ? 'Saving...' : editTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}