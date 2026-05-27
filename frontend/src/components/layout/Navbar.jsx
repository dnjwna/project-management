import { useDispatch } from 'react-redux'
import { useNavigate, NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { logoutUser } from '../../features/auth/authSlice'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Search, LogOut, Settings, User, ChevronDown } from 'lucide-react'

const avatarColors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
const getColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length]
const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

export default function Navbar() {
  const { user, isAdmin } = useAuth()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/login')
  }

  const navItems = [
    { to: '/dashboard', label: 'Home' },
    { to: '/projects', label: 'Projects' },
    ...(isAdmin ? [
      { to: '/admin/reports', label: 'Reports' },
      { to: '/admin/users', label: 'Team' },
    ] : []),
  ]

  return (
    <header className="h-14 bg-white border-b border-slate-200/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between gap-6">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer shrink-0"
          onClick={() => navigate('/dashboard')}
        >
          <div className="w-7 h-7 bg-app-dark rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">PM</span>
          </div>
          <span className="font-bold text-app-dark text-base">ProjectHub</span>
        </div>

        {/* Nav Items */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-4 py-1.5 rounded-full text-sm font-medium transition-all
                ${isActive
                  ? 'bg-app-dark text-white'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search */}
          <Button variant="ghost" size="icon"
            className="w-8 h-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <Search size={16} />
          </Button>

          {/* Notification */}
          <Button variant="ghost" size="icon"
            className="w-8 h-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 relative">
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors">
                <Avatar className="w-7 h-7">
                  <AvatarFallback className={`${getColor(user?.name)} text-white text-xs font-semibold`}>
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-slate-700">{user?.name?.split(' ')[0]}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <User size={14} /> Profile
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem className="gap-2 cursor-pointer"
                  onClick={() => navigate('/admin/projects')}>
                  <Settings size={14} /> Manage Projects
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="gap-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50">
                <LogOut size={14} /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}