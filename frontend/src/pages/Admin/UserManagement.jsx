import { useEffect, useState } from 'react'
import api from '../../utils/axios'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/users')
      setUsers(res.data.data || [])
    } catch {}
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return
    try {
      await api.delete(`/admin/users/${id}`)
      await fetchUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user')
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
        <p className="text-slate-500 text-sm mt-0.5">{users.length} registered users</p>
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          {users.map((user) => (
            <div key={user.id} className="px-6 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-slate-800">{user.name}</p>
                <p className="text-sm text-slate-400">{user.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge value={user.role} />
                <button onClick={() => handleDelete(user.id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm">
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