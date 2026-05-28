import { useState, useEffect } from 'react'
import api from '../../utils/axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Spinner from '../../components/ui/Spinner'
import { Send, XCircle, CheckCircle, Clock, Mail, RefreshCw } from 'lucide-react'

const statusStyle = {
  pending:  { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
  accepted: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle },
  expired:  { bg: 'bg-red-100', text: 'text-red-600', icon: XCircle },
}

export default function InvitationManagement() {
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ email: '', role: 'member' })
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => { fetchInvitations() }, [])

  const fetchInvitations = async () => {
    setLoading(true)
    try {
      const res = await api.get('/invitations')
      setInvitations(res.data)
    } catch {}
    setLoading(false)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setSending(true)
    try {
      await api.post('/invitations/send', form)
      setSuccessMsg(`Invitation sent to ${form.email}`)
      setForm({ email: '', role: 'member' })
      await fetchInvitations()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send invitation')
    }
    setSending(false)
  }

  const handleRevoke = async (id) => {
    if (!confirm('Revoke this invitation?')) return
    try {
      await api.patch(`/invitations/${id}/revoke`)
      await fetchInvitations()
    } catch {}
  }

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-app-dark">Invitations</h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage team invitations</p>
      </div>

      {/* Send Invitation Form */}
      <Card className="border-slate-200 shadow-none mb-8">
        <CardContent className="p-6">
          <h2 className="font-semibold text-app-dark mb-4 flex items-center gap-2">
            <Mail size={16} className="text-emerald-500" />
            Send New Invitation
          </h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
              <XCircle size={14} /> {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
              <CheckCircle size={14} /> {successMsg}
            </div>
          )}

          <form onSubmit={handleSend} className="flex gap-3 flex-wrap">
            <Input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@example.com"
              className="flex-1 min-w-48 bg-white border-slate-200 rounded-xl focus-visible:ring-emerald-400"
            />
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
              <SelectTrigger className="w-36 bg-white border-slate-200 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={sending}
              className="bg-app-dark hover:bg-slate-700 text-white rounded-xl gap-2">
              {sending ? (
                <><RefreshCw size={14} className="animate-spin" /> Sending...</>
              ) : (
                <><Send size={14} /> Send Invite</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Invitations List */}
      <Card className="border-slate-200 shadow-none">
        <CardContent className="p-0">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-app-dark text-sm">
              Sent Invitations ({invitations.length})
            </h2>
            <button onClick={fetchInvitations}
              className="text-slate-400 hover:text-slate-600 transition-colors">
              <RefreshCw size={14} />
            </button>
          </div>

          {loading ? <Spinner /> : (
            <div className="divide-y divide-slate-50">
              {invitations.length === 0 && (
                <p className="text-center text-slate-400 py-10 text-sm">No invitations sent yet.</p>
              )}
              {invitations.map((inv, i) => {
                const style = statusStyle[inv.status] || statusStyle.pending
                const Icon = style.icon
                return (
                  <div key={inv.id} className="px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                        <Mail size={15} className="text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-app-dark text-sm truncate">{inv.email}</p>
                        <p className="text-xs text-slate-400">
                          Invited by {inv.inviter?.name} · {formatDate(inv.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${style.bg} ${style.text}`}>
                        <Icon size={11} />
                        {inv.status}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${inv.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-600'}`}>
                        {inv.role}
                      </span>
                      {inv.status === 'pending' && (
                        <button onClick={() => handleRevoke(inv.id)}
                          className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors">
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}