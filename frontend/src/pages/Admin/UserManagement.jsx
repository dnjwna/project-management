import { useEffect, useState } from 'react'
import api from '../../utils/axios'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import Spinner from '../../components/ui/Spinner'
import { Trash2, Users } from 'lucide-react'

const avatarColors = ['bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
const getColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length]
const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

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
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Users size={20} className="text-teal-500" />
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
        </div>
        <p className="text-slate-400 text-sm">{users.length} registered users</p>
      </div>

      {loading ? <Spinner /> : (
        <Card className="border-slate-200 shadow-none">
          <CardContent className="p-0">
            {users.map((user, i) => (
              <div key={user.id}>
                <div className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className={`${getColor(user.name)} text-white text-sm font-semibold`}>
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border
                      ${user.role === 'admin'
                        ? 'bg-purple-100 text-purple-700 border-purple-200'
                        : 'bg-blue-100 text-blue-600 border-blue-200'}`}>
                      {user.role}
                    </span>
                    <Button variant="ghost" size="icon"
                      onClick={() => handleDelete(user.id)}
                      className="w-8 h-8 text-slate-300 hover:text-red-500 hover:bg-red-50">
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>
                {i < users.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}