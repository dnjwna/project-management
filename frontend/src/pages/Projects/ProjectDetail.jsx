import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProjectDetail, updateProject } from '../../features/projects/projectSlice'
import { useAuth } from '../../hooks/useAuth'
import api from '../../utils/axios'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'

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

  const inputClass = "w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm"

  if (loading) return <Spinner />
  if (!project) return <p className="text-slate-400">Project not found.</p>

  const progress = project.progress ?? 0

  return (
    <div>
      {/* Back */}
      <button onClick={() => navigate('/projects')}
        className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-5 transition-colors">
        ← Back to Projects
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-800">{project.name}</h1>
              <Badge value={project.status} />
            </div>
            <p className="text-slate-500 text-sm">{project.description}</p>
            <div className="flex gap-4 mt-3 text-xs text-slate-400">
              <span>📅 {project.start_date} → {project.end_date}</span>
              <span>👤 Created by {project.creator?.name}</span>
            </div>
          </div>
          {isAdmin && (
            <button onClick={() => setShowEditModal(true)}
              className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors shrink-0">
              ✏️ Edit
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-slate-500 font-medium">Overall Progress</span>
            <span className="font-bold text-blue-500">{progress}%</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Tasks Section */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-700">Tasks</h2>
            <button
              onClick={() => navigate(`/projects/${id}/tasks`)}
              className="text-sm text-blue-500 hover:text-blue-600 font-medium"
            >
              View all →
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {project.tasks?.length === 0 && (
              <p className="px-6 py-8 text-center text-slate-400 text-sm">No tasks yet.</p>
            )}
            {project.tasks?.slice(0, 5).map((task) => (
              <div key={task.id} className="px-6 py-3.5 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{task.title}</p>
                  {task.assignee && (
                    <p className="text-xs text-slate-400 mt-0.5">👤 {task.assignee.name}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge value={task.priority} />
                  <Badge value={task.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Members Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-700">Members</h2>
            {isAdmin && (
              <button
                onClick={() => { setShowMemberModal(true); fetchUsers() }}
                className="text-sm text-blue-500 hover:text-blue-600 font-medium"
              >
                + Add
              </button>
            )}
          </div>
          <div className="divide-y divide-slate-100">
            {members.map((m) => (
              <div key={m.id} className="px-5 py-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-700">{m.user?.name}</p>
                  <p className="text-xs text-slate-400">{m.user?.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge value={m.role} />
                  {isAdmin && (
                    <button
                      onClick={() => handleRemoveMember(m.user?.id)}
                      className="text-slate-300 hover:text-red-500 text-xs transition-colors"
                    >✕</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Project">
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Project Name</label>
            <input required value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Description</label>
            <textarea rows={3} value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className={`${inputClass} resize-none`} />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Status</label>
            <select value={editForm.status || ''} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              className={inputClass}>
              <option value="on_track">On Track</option>
              <option value="delayed">Delayed</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Start Date</label>
              <input type="date" value={editForm.start_date || ''} onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">End Date</label>
              <input type="date" value={editForm.end_date || ''} onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                className={inputClass} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors">
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Add Member">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Select User</label>
            <select required value={newMember.user_id}
              onChange={(e) => setNewMember({ ...newMember, user_id: e.target.value })}
              className={inputClass}>
              <option value="">-- Select user --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Role</label>
            <select value={newMember.role} onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
              className={inputClass}>
              <option value="member">Member</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowMemberModal(false)}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors">
              {submitting ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}