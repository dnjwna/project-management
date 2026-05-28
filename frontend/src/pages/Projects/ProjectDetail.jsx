import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProjectDetail, updateProject } from '../../features/projects/projectSlice'
import { useAuth } from '../../hooks/useAuth'
import api from '../../utils/axios'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import { formatDate } from '../../utils/format'
import { ArrowLeft, Plus, X, Pencil, ExternalLink, Calendar, User, Clock } from 'lucide-react'

const avatarColors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
const getColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length]
const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

const statusVariant = {
  on_track: 'bg-emerald-100 text-emerald-700',
  delayed: 'bg-red-100 text-red-600',
  completed: 'bg-slate-100 text-slate-600',
}

const taskStatusVariant = {
  todo: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-orange-100 text-orange-600',
  done: 'bg-emerald-100 text-emerald-700',
  blocked: 'bg-red-100 text-red-600',
}

const priorityVariant = {
  high: 'bg-red-100 text-red-600',
  medium: 'bg-yellow-100 text-yellow-600',
  low: 'bg-slate-100 text-slate-500',
}

export default function ProjectDetail() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { detail: project, loading } = useSelector((s) => s.projects)

  const [members, setMembers] = useState([])
  const [users, setUsers] = useState([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [newMember, setNewMember] = useState({ user_id: '', role: 'member' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    dispatch(fetchProjectDetail(id))
    fetchMembers()
  }, [id])

  useEffect(() => {
    if (project) setEditForm({
      name: project.name,
      description: project.description,
      status: project.status,
      start_date: project.start_date,
      end_date: project.end_date,
    })
  }, [project])

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/projects/${id}/members`)
      setMembers(res.data)
    } catch {}
  }

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users')
      setUsers(res.data.data || [])
    } catch {}
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    await dispatch(updateProject({ id, data: editForm }))
    setSubmitting(false)
    setShowEditModal(false)
    dispatch(fetchProjectDetail(id))
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post(`/projects/${id}/members`, newMember)
      await fetchMembers()
      setShowMemberModal(false)
      setNewMember({ user_id: '', role: 'member' })
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add member')
    }
    setSubmitting(false)
  }

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return
    try {
      await api.delete(`/projects/${id}/members/${userId}`)
      await fetchMembers()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member')
    }
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-transparent border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-sm transition-all"

  if (loading) return <div className="py-20"><Spinner /></div>
  if (!project) return <p className="text-slate-400">Project not found.</p>

  const progress = project.progress ?? 0

  return (
    <div>
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}
        className="text-slate-400 hover:text-slate-600 gap-2 mb-6 -ml-2 rounded-xl">
        <ArrowLeft size={16} /> Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className={`rounded-2xl p-6 ${statusVariant[project.status] ? 'bg-emerald-100' : 'bg-white'} ${project.status === 'delayed' ? 'bg-red-50' : ''} ${project.status === 'completed' ? 'bg-slate-100' : ''}`}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusVariant[project.status]}`}>
                    {project.status?.replace('_', ' ')}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-app-dark mb-1">{project.name}</h1>
                <p className="text-slate-500 text-sm">{project.description}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {isAdmin && (
                  <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}
                    className="gap-2 bg-white/70 border-0 rounded-xl">
                    <Pencil size={14} /> Edit
                  </Button>
                )}
                <Button size="sm" onClick={() => navigate(`/projects/${id}/tasks`)}
                  className="bg-app-dark hover:bg-slate-700 text-white gap-2 rounded-xl">
                  <ExternalLink size={14} /> Open Board
                </Button>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-2">
              <div className="flex items-end gap-3 mb-2">
                <p className="text-5xl font-bold text-app-dark">{progress}%</p>
                <p className="text-sm text-slate-500 mb-2">overall progress</p>
              </div>
              <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                <div className="h-full bg-app-dark rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Meta */}
            <div className="flex gap-4 mt-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {formatDate(project.start_date)} → {formatDate(project.end_date)}
              </span>
              <span className="flex items-center gap-1">
                <User size={11} />
                {project.creator?.name}
              </span>
            </div>
          </div>

          {/* Tasks */}
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-app-dark">Recent Tasks</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate(`/projects/${id}/tasks`)}
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-1 rounded-xl text-sm">
                Open Board <ExternalLink size={13} />
              </Button>
            </div>
            <div className="divide-y divide-slate-50">
              {project.tasks?.length === 0 && (
                <p className="px-6 py-8 text-center text-slate-400 text-sm">No tasks yet.</p>
              )}
              {project.tasks?.slice(0, 6).map((task) => (
                <div key={task.id} className="px-6 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-app-dark truncate">{task.title}</p>
                    {task.assignee && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Avatar className="w-4 h-4">
                          <AvatarFallback className={`${getColor(task.assignee.name)} text-white text-xs`}>
                            {getInitials(task.assignee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-slate-400">{task.assignee.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${priorityVariant[task.priority]}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${taskStatusVariant[task.status]}`}>
                      {task.status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Members */}
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-app-dark text-sm">Team Members</h2>
              {isAdmin && (
                <Button variant="ghost" size="icon"
                  onClick={() => { setShowMemberModal(true); fetchUsers() }}
                  className="w-7 h-7 text-emerald-500 hover:bg-emerald-50 rounded-lg">
                  <Plus size={15} />
                </Button>
              )}
            </div>
            <div className="p-3 space-y-1">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-2 px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className={`${getColor(m.user?.name)} text-white text-xs font-semibold`}>
                        {getInitials(m.user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-app-dark">{m.user?.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{m.role}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <Button variant="ghost" size="icon"
                      onClick={() => handleRemoveMember(m.user?.id)}
                      className="w-6 h-6 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg">
                      <X size={12} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl p-5">
            <h2 className="font-semibold text-app-dark text-sm mb-4">Task Overview</h2>
            <div className="space-y-3">
              {[
                { label: 'Total Tasks', value: project.tasks?.length ?? 0, color: 'bg-slate-100' },
                { label: 'Done', value: project.tasks?.filter(t => t.status === 'done').length ?? 0, color: 'bg-emerald-100' },
                { label: 'In Progress', value: project.tasks?.filter(t => t.status === 'in_progress').length ?? 0, color: 'bg-orange-100' },
                { label: 'Blocked', value: project.tasks?.filter(t => t.status === 'blocked').length ?? 0, color: 'bg-red-100' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{stat.label}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-sm font-semibold ${stat.color}`}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Project">
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Project Name</label>
            <input required value={editForm.name || ''}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Description</label>
            <textarea rows={3} value={editForm.description || ''}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className={`${inputClass} resize-none`} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Status</label>
            <select value={editForm.status || ''}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              className={inputClass}>
              <option value="on_track">On Track</option>
              <option value="delayed">Delayed</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Start Date</label>
              <input type="date" value={editForm.start_date || ''}
                onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">End Date</label>
              <input type="date" value={editForm.end_date || ''}
                onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                className={inputClass} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowEditModal(false)}
              className="text-slate-500 hover:text-slate-900 font-medium">Cancel</Button>
            <Button type="submit" disabled={submitting}
              className="bg-black hover:bg-slate-800 text-white font-bold rounded-xl px-6 transition-all">
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Add Member">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Select User</label>
            <select required value={newMember.user_id}
              onChange={(e) => setNewMember({ ...newMember, user_id: e.target.value })}
              className={inputClass}>
              <option value="">-- Select user --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Role</label>
            <select value={newMember.role}
              onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
              className={inputClass}>
              <option value="member">Member</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowMemberModal(false)}
              className="text-slate-500 hover:text-slate-900 font-medium">Cancel</Button>
            <Button type="submit" disabled={submitting}
              className="bg-black hover:bg-slate-800 text-white font-bold rounded-xl px-6 transition-all">
              {submitting ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        </form>
      </Modal>
      </div>
  )
}