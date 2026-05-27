import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useAuth } from '../../hooks/useAuth'
import { logoutUser } from '../../features/auth/authSlice'

const navItem = 'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors'
const active = 'bg-blue-600 text-white'
const inactive = 'text-slate-300 hover:bg-slate-700 hover:text-white'

export default function Sidebar() {
  const { isAdmin, user } = useAuth()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/login')
  }

  return (
    <aside className="w-60 min-h-screen bg-slate-800 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700">
        <h1 className="text-white font-bold text-lg">PM App</h1>
        <p className="text-slate-400 text-xs mt-0.5">{user?.name}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <NavLink to="/dashboard" className={({ isActive }) => `${navItem} ${isActive ? active : inactive}`}>
          📊 Dashboard
        </NavLink>
        <NavLink to="/projects" className={({ isActive }) => `${navItem} ${isActive ? active : inactive}`}>
          📁 Projects
        </NavLink>

        {isAdmin && (
          <>
            <div className="pt-4 pb-1 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Admin
            </div>
            <NavLink to="/admin/projects" className={({ isActive }) => `${navItem} ${isActive ? active : inactive}`}>
              ⚙️ Manage Projects
            </NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => `${navItem} ${isActive ? active : inactive}`}>
              👥 Manage Users
            </NavLink>
            <NavLink to="/admin/reports" className={({ isActive }) => `${navItem} ${isActive ? active : inactive}`}>
              📈 Reports
            </NavLink>
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-700">
        <span className="inline-block mb-2 px-2 py-0.5 rounded text-xs font-bold bg-blue-500 text-white uppercase">
          {user?.role}
        </span>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  )
}