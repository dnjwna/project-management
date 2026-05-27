import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from '../../hooks/useAuth'
import { logoutUser } from '../../features/auth/authSlice'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LayoutDashboard, FolderKanban, Settings, Users, BarChart3, LogOut, Plus } from 'lucide-react'

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

const avatarColors = ['bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
const getColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length]

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-row items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full
        ${isActive
          ? 'bg-teal-500 text-white shadow-sm'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`
      }
    >
      <Icon size={16} className="shrink-0" />
      <span className="leading-none">{label}</span>
    </NavLink>
  )
}

export default function Sidebar() {
  const { isAdmin, user } = useAuth()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { list: projects } = useSelector((s) => s.projects)

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-slate-900 flex flex-col border-r border-slate-800 shrink-0">
      {/* Logo */}
      <div className="px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs">PM</span>
          </div>
          <span className="text-white font-bold text-lg">ProjectHub</span>
        </div>
      </div>

      <Separator className="bg-slate-800" />

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Menu */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">Menu</p>
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Overview" />
          <NavItem to="/projects" icon={FolderKanban} label="Projects" />
        </div>

        {/* Recent Projects */}
        {projects.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Projects</p>
              {isAdmin && (
                <button onClick={() => navigate('/projects')}
                  className="text-slate-500 hover:text-teal-400 transition-colors">
                  <Plus size={14} />
                </button>
              )}
            </div>
            <div className="space-y-0.5">
              {projects.slice(0, 5).map((project) => (
                <NavLink
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all truncate
                    ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`
                  }
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                  <span className="truncate">{project.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {/* Admin */}
        {isAdmin && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">Admin</p>
            <div className="space-y-1">
              <NavItem to="/admin/projects" icon={Settings} label="Manage Projects" />
              <NavItem to="/admin/users"    icon={Users}    label="Users" />
              <NavItem to="/admin/reports"  icon={BarChart3} label="Reports" />
            </div>
          </div>
        )}
      </div>

      <Separator className="bg-slate-800" />

      {/* User */}
      <div className="px-3 py-4 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className={`${getColor(user?.name)} text-white text-xs font-semibold`}>
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  )
}