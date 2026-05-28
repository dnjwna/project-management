import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { fetchTasks, updateTask, createTask, deleteTask } from '../../features/tasks/taskSlice'
import { fetchProjectDetail } from '../../features/projects/projectSlice'
import { useAuth } from '../../hooks/useAuth'
import api from '../../utils/axios'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import { formatDate } from '../../utils/format'
import { ArrowLeft, Plus, Search, Calendar, Pencil, Trash2 } from 'lucide-react'
import TaskDetailModal from '../../components/ui/TaskDetailModal'

const avatarColors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
const getColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length]
const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

const COLUMNS = [
  { id: 'todo',        label: 'To Do',       dot: 'bg-slate-400',   count_bg: 'bg-slate-100 text-slate-500' },
  { id: 'in_progress', label: 'In Progress',  dot: 'bg-orange-400',  count_bg: 'bg-orange-100 text-orange-600' },
  { id: 'done',        label: 'Done',         dot: 'bg-emerald-500', count_bg: 'bg-emerald-100 text-emerald-700' },
  { id: 'blocked',     label: 'Blocked',      dot: 'bg-red-400',     count_bg: 'bg-red-100 text-red-600' },
]

const priorityVariant = {
  high:   'bg-red-100 text-red-600',
  medium: 'bg-orange-100 text-orange-600',
  low:    'bg-slate-100 text-slate-500',
}

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
  const [selectedTaskId, setSelectedTaskId] = useState(null)

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

  const isManagerOrAdmin = isAdmin ||
    members.some(m => m.user?.id === user?.id && m.role === 'manager')

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
    if (destination.droppableId === source.droppableId) return
    const task = tasks.find(t => String(t.id) === draggableId)
    if (!task) return
    const canEdit = isManagerOrAdmin || task.assigned_to === user?.id
    if (!canEdit) return
    dispatch(updateTask({ projectId, taskId: task.id, data: { status: destination.droppableId } }))
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
    dispatch(fetchTasks({ projectId, params: { limit: 100 } }))
  }

  const handleDelete = async (e, taskId) => {
    e.stopPropagation()
    if (!confirm('Delete this task?')) return
    await dispatch(deleteTask({ projectId, taskId }))
    dispatch(fetchTasks({ projectId, params: { limit: 100 } }))
  }

  const inputClass = "w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-sm"

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] -mx-6 -my-8">
      {/* Top bar */}
      <div className="px-8 py-4 bg-white border-b border-slate-200/80 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/projects/${projectId}`)}
            className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-base font-bold text-app-dark">{project?.name}</h1>
            <p className="text-xs text-slate-400">Kanban Board · {tasks.length} tasks</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-[#F8F9FA] text-slate-700 focus:outline-none focus:border-emerald-400 w-44"
            />
          </div>

          {/* Member avatars */}
          <div className="flex -space-x-2">
            {members.slice(0, 4).map((m) => (
              <Avatar key={m.id} className="w-7 h-7 ring-2 ring-white">
                <AvatarFallback className={`${getColor(m.user?.name)} text-white text-xs font-semibold`}>
                  {getInitials(m.user?.name)}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>

          {isManagerOrAdmin && (
            <Button onClick={openCreate}
              className="bg-app-dark hover:bg-slate-700 text-white gap-2 rounded-xl text-sm">
              <Plus size={15} /> Add Task
            </Button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center bg-[#F8F9FA]">
          <Spinner />
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto bg-[#F8F9FA] px-8 py-6">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-5 h-full min-w-max">
              {COLUMNS.map((col) => (
                <div key={col.id} className="w-72 flex flex-col">
                  {/* Column header */}
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <h3 className="font-semibold text-app-dark text-sm">{col.label}</h3>
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-semibold ${col.count_bg}`}>
                      {grouped[col.id]?.length ?? 0}
                    </span>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 rounded-2xl p-2 space-y-3 min-h-32 transition-all ${
                          snapshot.isDraggingOver
                            ? 'bg-emerald-50 ring-2 ring-emerald-200 ring-dashed'
                            : 'bg-slate-200/40'
                        }`}
                      >
                        {grouped[col.id]?.map((task, index) => (
                          <Draggable key={String(task.id)} draggableId={String(task.id)} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white rounded-xl p-4 border transition-all group ${
                                  snapshot.isDragging
                                    ? 'shadow-xl border-emerald-200 rotate-1 scale-105'
                                    : 'border-slate-100 hover:shadow-md hover:border-slate-200'
                                }`}
                              >
                                {/* Priority tag */}
                                <div className="flex items-center justify-between mb-3">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${priorityVariant[task.priority]}`}>
                                    {task.priority}
                                  </span>
                                  {isManagerOrAdmin && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => openEdit(task)}
                                        className="w-6 h-6 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-300 hover:text-blue-500 transition-colors">
                                        <Pencil size={11} />
                                      </button>
                                      <button onClick={(e) => handleDelete(e, task.id)}
                                        className="w-6 h-6 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors">
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Title */}
                                <p 
                                className="font-semibold text-app-dark text-sm leading-snug mb-1 cursor-pointer hover:text-indigo-600 transition-colors"
                                onClick={() => {setSelectedTaskId(task.id)}}
                                >
                                  {task.title}
                                </p>

                                {/* Description */}
                                {task.description && (
                                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                                    {task.description}
                                  </p>
                                )}

                                {/* Due date */}
                                {task.due_date && (
                                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                                    <Calendar size={11} />
                                    <span>{formatDate(task.due_date)}</span>
                                  </div>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-2.5 border-t border-slate-50">
                                  {task.assignee ? (
                                    <div className="flex items-center gap-1.5">
                                      <Avatar className="w-5 h-5">
                                        <AvatarFallback className={`${getColor(task.assignee.name)} text-white text-xs`}>
                                          {getInitials(task.assignee.name)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-xs text-slate-400">{task.assignee.name}</span>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-slate-300">Unassigned</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {grouped[col.id]?.length === 0 && !snapshot.isDraggingOver && (
                          <div className="text-center py-8 text-slate-300 text-xs font-medium">
                            No tasks
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

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editTask ? 'Edit Task' : 'New Task'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm text-slate-300">Title</label>
            <input required value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Task title" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-slate-300">Description</label>
            <textarea rows={2} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`${inputClass} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm text-slate-300">Priority</label>
              <select value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className={inputClass}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-slate-300">Status</label>
              <select value={form.status || 'todo'}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={inputClass}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm text-slate-300">Due Date</label>
              <input type="date" value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-slate-300">Assign To</label>
              <select value={form.assigned_to}
                onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                className={inputClass}>
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user?.id} value={m.user?.id}>{m.user?.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}
              className="text-slate-400">Cancel</Button>
            <Button type="submit" disabled={submitting}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
              {submitting ? 'Saving...' : editTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>
      <TaskDetailModal
        taskId={selectedTaskId}
        projectId={projectId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onUpdated={() => dispatch(fetchTasks({ projectId, params: { limit: 100 } }))}
      />
    </div>
  )
}