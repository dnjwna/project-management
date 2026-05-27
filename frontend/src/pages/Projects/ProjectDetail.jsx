import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProjectDetail, updateProject } from '../../features/projects/projectSlice'
import { useAuth } from '../../hooks/useAuth'
import api from '../../utils/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import { formatDate } from '../../utils/format'
import { ArrowLeft, Plus, X, Pencil, ExternalLink, Calendar, User, } from 'lucide-react'

const avatarColors = ['bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
const getColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length]
const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

const statusVariant = {
  on_track: 'bg-teal-100 text-teal-700 border-teal-200',
  delayed: 'bg-red-100 text-red-600 border-red-200',
  completed: 'bg-blue-100 text-blue-700 border-blue-200',
}

const taskStatusVariant = {
  todo: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-orange-100 text-orange-600',
  done: 'bg-teal-100 text-teal-700',
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

  const inputClass = "w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 text-sm"

  if (loading) return <div className="p-8"><Spinner /></div>
  if (!project) return <p className="p-8 text-slate-400">Project not found.</p>

  const progress = project.progress ?? 0

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}
        className="text-slate-400 hover:text-slate-600 gap-2 mb-6 -ml-2">
        <ArrowLeft size={16} /> Back to Projects
      </Button>

      {/* Header Card */}
      <Card className="border-slate-200 shadow-none mb-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-800">{project.name}</h1>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${statusVariant[project.status] || ''}`}>
                  {project.status?.replace('_', ' ')}
                </span>
              </div>
              <p className="text-slate-500 text-sm mb-3">{project.description}</p>
              <div className="flex gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {formatDate(project.start_date)} → {formatDate(project.end_date)}
                </span>
                <span className="flex items-center gap-1">
                  <User size={12} />
                  {project.creator?.name}
                </span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {isAdmin && (
                <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}
                  className="gap-2 text-slate-600 border-slate-200">
                  <Pencil size={14} /> Edit
                </Button>
              )}
              <Button size="sm" onClick={() => navigate(`/projects/${id}/tasks`)}
                className="bg-teal-500 hover:bg-teal-600 text-white gap-2">
                <ExternalLink size={14} /> Open Board
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500 font-medium">Overall Progress</span>
              <span className="font-bold text-teal-600">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-700">Recent Tasks</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/projects/${id}/tasks`)}
                  className="text-teal-500 hover:text-teal-600 hover:bg-teal-50 text-sm gap-1">
                  View board <ExternalLink size={13} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-3 px-0">
              {project.tasks?.length === 0 && (
                <p className="px-6 py-8 text-center text-slate-400 text-sm">No tasks yet.</p>
              )}
              {project.tasks?.slice(0, 6).map((task, i) => (
                <div key={task.id}>
                  <div className="px-6 py-3.5 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{task.title}</p>
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
                  {i < (project.tasks?.slice(0, 6).length - 1) && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Members */}
        <div>
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-700">Members</CardTitle>
                {isAdmin && (
                  <Button variant="ghost" size="sm" onClick={() => { setShowMemberModal(true); fetchUsers() }}
                    className="text-teal-500 hover:text-teal-600 hover:bg-teal-50 gap-1 h-8 w-8 p-0">
                    <Plus size={16} />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-3 px-0">
              {members.map((m, i) => (
                <div key={m.id}>
                  <div className="px-5 py-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className={`${getColor(m.user?.name)} text-white text-xs font-semibold`}>
                          {getInitials(m.user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{m.user?.name}</p>
                        <p className="text-xs text-slate-400">{m.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize
                        ${m.role === 'manager' ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-600'}`}>
                        {m.role}
                      </span>
                      {isAdmin && (
                        <Button variant="ghost" size="icon"
                          onClick={() => handleRemoveMember(m.user?.id)}
                          className="w-6 h-6 text-slate-300 hover:text-red-500 hover:bg-red-50">
                          <X size={12} />
                        </Button>
                      )}
                    </div>
                  </div>
                  {i < members.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Project">
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm text-slate-300">Project Name</label>
            <input required value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-slate-300">Description</label>
            <textarea rows={3} value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className={`${inputClass} resize-none`} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-slate-300">Status</label>
            <select value={editForm.status || ''} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              className={inputClass}>
              <option value="on_track">On Track</option>
              <option value="delayed">Delayed</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm text-slate-300">Start Date</label>
              <input type="date" value={editForm.start_date || ''} onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-slate-300">End Date</label>
              <input type="date" value={editForm.end_date || ''} onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                className={inputClass} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowEditModal(false)}
              className="text-slate-400 hover:text-white">Cancel</Button>
            <Button type="submit" disabled={submitting}
              className="bg-teal-500 hover:bg-teal-600 text-white">
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Add Member">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm text-slate-300">Select User</label>
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
            <label className="text-sm text-slate-300">Role</label>
            <select value={newMember.role} onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
              className={inputClass}>
              <option value="member">Member</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowMemberModal(false)}
              className="text-slate-400 hover:text-white">Cancel</Button>
            <Button type="submit" disabled={submitting}
              className="bg-teal-500 hover:bg-teal-600 text-white">
              {submitting ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}