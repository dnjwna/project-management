import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { loginUser, clearError } from '../features/auth/authSlice'
import { useAuth } from '../hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, loading, error } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard')
    return () => dispatch(clearError())
  }, [isAuthenticated])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(loginUser(form))
    if (loginUser.fulfilled.match(result)) navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">PM</span>
          </div>
          <span className="text-white font-bold text-2xl">ProjectHub</span>
        </div>

        <Card className="bg-slate-800 border-slate-700 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-xl">Welcome back</CardTitle>
            <CardDescription className="text-slate-400">Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Email</label>
                <Input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@pm.com"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus-visible:ring-teal-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <Input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus-visible:ring-teal-500"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold mt-2"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <p className="text-center text-slate-400 text-sm mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-teal-400 hover:text-teal-300 font-medium">
                Register
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}