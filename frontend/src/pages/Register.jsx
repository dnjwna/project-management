import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { registerUser, clearError } from '../features/auth/authSlice'
import { useAuth } from '../hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, loading, error } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'member' })

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard')
    return () => dispatch(clearError())
  }, [isAuthenticated])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password_confirmation) return alert('Passwords do not match')
    const result = await dispatch(registerUser(form))
    if (registerUser.fulfilled.match(result)) navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">PM</span>
          </div>
          <span className="text-white font-bold text-2xl">ProjectHub</span>
        </div>

        <Card className="bg-slate-800 border-slate-700 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-xl">Create account</CardTitle>
            <CardDescription className="text-slate-400">Fill in your details to get started</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Full Name</label>
                <Input required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus-visible:ring-teal-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Email</label>
                <Input type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus-visible:ring-teal-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Role</label>
                <Select value={form.role} onValueChange={(val) => setForm({ ...form, role: val })}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white focus:ring-teal-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="member" className="text-white focus:bg-slate-700">Member</SelectItem>
                    <SelectItem value="admin" className="text-white focus:bg-slate-700">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <Input type="password" required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 8 characters"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus-visible:ring-teal-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Confirm Password</label>
                <Input type="password" required value={form.password_confirmation}
                  onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                  placeholder="Repeat password"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus-visible:ring-teal-500" />
              </div>
              <Button type="submit" disabled={loading}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold mt-2">
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <p className="text-center text-slate-400 text-sm mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}