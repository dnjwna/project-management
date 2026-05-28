import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import api from '../../utils/axios'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '../../utils/format'
import {
  Calendar, CheckSquare, Paperclip, MessageSquare,
  Plus, Trash2, ExternalLink, Send, X, Check, Link
} from 'lucide-react'

const avatarColors = ['bg-indigo-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
const getColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length]
const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

const priorityStyle = {
  high:   { bg: 'bg-red-100',    text: 'text-red-600',    dot: 'bg-red-500' },
  medium: { bg: 'bg-orange-100', text: 'text-orange-600', dot: 'bg-orange-500' },
  low:    { bg: 'bg-slate-100',  text: 'text-slate-500',  dot: 'bg-slate-400' },
}

const statusStyle = {
  todo:        { bg: 'bg-slate-100',   text: 'text-slate-600' },
  in_progress: { bg: 'bg-indigo-100',  text: 'text-indigo-600' },
  done:        { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  blocked:     { bg: 'bg-red-100',     text: 'text-red-600' },
}

export default function TaskDetailModal({ taskId, projectId, isOpen, onClose, onUpdated }) {
  const { user, isAdmin } = useAuth()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(false)

  const [comment, setComment] = useState('')
  const [sendingComment, setSendingComment] = useState(false)

  const [newCheckItem, setNewCheckItem] = useState('')
  const [addingCheck, setAddingCheck] = useState(false)
  const [showCheckInput, setShowCheckInput] = useState(false)

  const [showAttachForm, setShowAttachForm] = useState(false)
  const [attachForm, setAttachForm] = useState({ name: '', url: '' })
  const [addingAttach, setAddingAttach] = useState(false)

  useEffect(() => {
    if (isOpen && taskId) fetchTask()
  }, [isOpen, taskId])

  const fetchTask = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/tasks/${taskId}/detail`)
      setTask(res.data)
    } catch {}
    setLoading(false)
  }

  const handleSendComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setSendingComment(true)
    try {
      await api.post(`/tasks/${taskId}/comments`, { comment })
      setComment('')
      await fetchTask()
    } catch {}
    setSendingComment(false)
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/tasks/${taskId}/comments/${commentId}`)
      await fetchTask()
    } catch {}
  }

  const handleAddChecklist = async (e) => {
    e.preventDefault()
    if (!newCheckItem.trim()) return
    setAddingCheck(true)
    try {
      await api.post(`/tasks/${taskId}/checklists`, { title: newCheckItem })
      setNewCheckItem('')
      setShowCheckInput(false)
      await fetchTask()
    } catch {}
    setAddingCheck(false)
  }

  const handleToggleChecklist = async (checklistId) => {
    try {
      await api.patch(`/tasks/${taskId}/checklists/${checklistId}/toggle`)
      await fetchTask()
      if (onUpdated) onUpdated()
    } catch {}
  }

  const handleDeleteChecklist = async (checklistId) => {
    try {
      await api.delete(`/tasks/${taskId}/checklists/${checklistId}`)
      await fetchTask()
    } catch {}
  }

  const handleAddAttachment = async (e) => {
    e.preventDefault()
    setAddingAttach(true)
    try {
      await api.post(`/tasks/${taskId}/attachments`, attachForm)
      setAttachForm({ name: '', url: '' })
      setShowAttachForm(false)
      await fetchTask()
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid URL')
    }
    setAddingAttach(false)
  }

  const handleDeleteAttachment = async (attachId) => {
    try {
      await api.delete(`/tasks/${taskId}/attachments/${attachId}`)
      await fetchTask()
    } catch {}
  }

  const checklistProgress = task?.checklists?.length > 0
    ? Math.round((task.checklists.filter(c => c.is_done).length / task.checklists.length) * 100)
    : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-0 shadow-2xl w-[95vw] max-w-2xl p-0 gap-0 rounded-2xl overflow-hidden max-h-[90vh] [&>button]:hidden">
        {loading || !task ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {task.priority && (
                      <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${priorityStyle[task.priority]?.bg} ${priorityStyle[task.priority]?.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle[task.priority]?.dot}`} />
                        {task.priority}
                      </span>
                    )}
                    {task.status && (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusStyle[task.status]?.bg} ${statusStyle[task.status]?.text}`}>
                        {task.status?.replace('_', ' ')}
                      </span>
                    )}
                    {task.project?.name && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                        {task.project.name}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-app-dark">{task.title}</h2>

                  {/* Meta */}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {task.due_date && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar size={12} className="text-slate-400" />
                        Due {formatDate(task.due_date)}
                      </div>
                    )}
                    {task.assignee && (
                      <div className="flex items-center gap-1.5">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className={`${getColor(task.assignee.name)} text-white text-xs`}>
                            {getInitials(task.assignee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-slate-500">{task.assignee.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Close button */}
                <button onClick={onClose}
                  className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors shrink-0">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Description */}
              {task.description && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{task.description}</p>
                </div>
              )}

              {/* Details pills */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl">
                  <span className="text-xs text-slate-400">Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyle[task.status]?.bg} ${statusStyle[task.status]?.text}`}>
                    {task.status?.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl">
                  <span className="text-xs text-slate-400">Priority</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${priorityStyle[task.priority]?.bg} ${priorityStyle[task.priority]?.text}`}>
                    {task.priority}
                  </span>
                </div>
                {task.due_date && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl">
                    <Calendar size={12} className="text-slate-400" />
                    <span className="text-xs font-medium text-slate-600">{formatDate(task.due_date)}</span>
                  </div>
                )}
                {task.assignee && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl">
                    <Avatar className="w-4 h-4">
                      <AvatarFallback className={`${getColor(task.assignee.name)} text-white text-xs`}>
                        {getInitials(task.assignee.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-slate-600">{task.assignee.name}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Checklist */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CheckSquare size={14} className="text-slate-400" />
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Checklist</h3>
                    {task.checklists?.length > 0 && (
                      <span className="text-xs text-slate-400">
                        {task.checklists.filter(c => c.is_done).length}/{task.checklists.length}
                      </span>
                    )}
                  </div>
                  <button onClick={() => setShowCheckInput(!showCheckInput)}
                    className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600 font-medium transition-colors">
                    <Plus size={13} /> Add item
                  </button>
                </div>

                {/* Progress bar */}
                {task.checklists?.length > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Progress</span>
                      <span className="font-medium text-indigo-600">{checklistProgress}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${checklistProgress}%` }} />
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-1">
                  {task.checklists?.map((item) => (
                    <div key={item.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 group transition-colors">
                      <button
                        onClick={() => handleToggleChecklist(item.id)}
                        style={{ width: 18, height: 18 }}
                        className={`rounded flex items-center justify-center border transition-all shrink-0 ${
                          item.is_done
                            ? 'bg-indigo-500 border-indigo-500 text-white'
                            : 'border-slate-300 hover:border-indigo-400'
                        }`}>
                        {item.is_done && <Check size={11} />}
                      </button>
                      <span className={`flex-1 text-sm transition-all ${item.is_done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        {item.title}
                      </span>
                      <button onClick={() => handleDeleteChecklist(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add input */}
                {showCheckInput && (
                  <form onSubmit={handleAddChecklist} className="flex gap-2 mt-2">
                    <input autoFocus value={newCheckItem}
                      onChange={(e) => setNewCheckItem(e.target.value)}
                      placeholder="Add checklist item..."
                      className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 bg-slate-50" />
                    <Button type="submit" size="sm" disabled={addingCheck}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl px-3">
                      <Plus size={14} />
                    </Button>
                    <Button type="button" variant="ghost" size="sm"
                      onClick={() => setShowCheckInput(false)}
                      className="rounded-xl px-3 text-slate-400">
                      <X size={14} />
                    </Button>
                  </form>
                )}
              </div>

              <Separator />

              {/* Attachments */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Paperclip size={13} className="text-slate-400" />
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attachments</h3>
                  </div>
                  <button onClick={() => setShowAttachForm(!showAttachForm)}
                    className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600 font-medium">
                    <Plus size={13} /> Add
                  </button>
                </div>

                {showAttachForm && (
                  <form onSubmit={handleAddAttachment} className="space-y-2 mb-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <input required value={attachForm.name}
                      onChange={(e) => setAttachForm({ ...attachForm, name: e.target.value })}
                      placeholder="Name (e.g. Figma Design)"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-400 bg-white" />
                    <input required type="url" value={attachForm.url}
                      onChange={(e) => setAttachForm({ ...attachForm, url: e.target.value })}
                      placeholder="https://figma.com/..."
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-400 bg-white" />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={addingAttach}
                        className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs h-8">
                        Add Link
                      </Button>
                      <Button type="button" variant="ghost" size="sm"
                        onClick={() => setShowAttachForm(false)}
                        className="rounded-lg text-slate-400 h-8 px-2">
                        <X size={13} />
                      </Button>
                    </div>
                  </form>
                )}

                <div className="space-y-2">
                  {task.attachments?.length === 0 && !showAttachForm && (
                    <p className="text-xs text-slate-400 py-1">No attachments yet.</p>
                  )}
                  {task.attachments?.map((att) => (
                    <div key={att.id}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-indigo-100 transition-colors">
                      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                        <Link size={13} className="text-indigo-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{att.name}</p>
                        <p className="text-xs text-slate-400 truncate">{att.url}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <a href={att.url} target="_blank" rel="noreferrer"
                          className="w-7 h-7 rounded-lg hover:bg-indigo-50 flex items-center justify-center text-slate-300 hover:text-indigo-500 transition-colors">
                          <ExternalLink size={12} />
                        </a>
                        {(att.user_id === user?.id || isAdmin) && (
                          <button onClick={() => handleDeleteAttachment(att.id)}
                            className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Comments */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare size={14} className="text-slate-400" />
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Comments ({task.comments?.length ?? 0})
                  </h3>
                </div>

                <div className="space-y-4 mb-4">
                  {task.comments?.length === 0 && (
                    <p className="text-sm text-slate-400 py-2">No comments yet. Start the conversation!</p>
                  )}
                  {task.comments?.map((c) => (
                    <div key={c.id} className="flex gap-3 group">
                      <Avatar className="w-7 h-7 shrink-0">
                        <AvatarFallback className={`${getColor(c.user?.name)} text-white text-xs font-semibold`}>
                          {getInitials(c.user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-700">{c.user?.name}</span>
                          <span className="text-xs text-slate-400">
                            {new Date(c.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="bg-slate-50 rounded-xl px-3 py-2.5">
                          <p className="text-sm text-slate-600 leading-relaxed">{c.comment}</p>
                        </div>
                      </div>
                      {(c.user?.id === user?.id || isAdmin) && (
                        <button onClick={() => handleDeleteComment(c.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all self-start mt-6 shrink-0">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Comment input */}
                <form onSubmit={handleSendComment} className="flex gap-2 items-center">
                  <Avatar className="w-7 h-7 shrink-0">
                    <AvatarFallback className={`${getColor(user?.name)} text-white text-xs font-semibold`}>
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <input value={comment} onChange={(e) => setComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 bg-slate-50" />
                  <Button type="submit" size="sm" disabled={sendingComment || !comment.trim()}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl px-3 shrink-0">
                    <Send size={14} />
                  </Button>
                </form>
              </div>

            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}