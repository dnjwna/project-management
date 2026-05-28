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
import { Search, LogOut, Settings, User } from 'lucide-react'
import NotificationPanel from '../ui/NotificationPanel'

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
      { to: '/admin/reports',     label: 'Reports' },
      { to: '/admin/users',       label: 'Team' },
      { to: '/admin/invitations', label: 'Invitations' },
    ] : []),
  ]

  return (
    <header className="sticky top-4 z-40 px-6 mt-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* KIRI: Logo Pill */}
        <div
          className="flex items-center gap-2 cursor-pointer shrink-0 bg-white rounded-full pl-2 pr-5 py-1.5 shadow-sm border border-slate-100"
          onClick={() => navigate('/dashboard')}
        >
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
             <div className="w-3 h-3 bg-white rotate-45" /> 
          </div>
          <span className="font-semibold text-black text-sm">ProjectHub</span>
        </div>

        {/* TENGAH: Navigation Pill */}
        <nav className="flex items-center gap-1 bg-white rounded-full p-1.5 shadow-sm border border-slate-100">
          {/* Search Icon */}
          <Button variant="ghost" size="icon"
            className="w-9 h-9 text-slate-500 hover:text-black hover:bg-slate-100 rounded-full shrink-0">
            <Search size={18} />
          </Button>
          
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-5 py-2 rounded-full text-sm font-medium transition-all
                ${isActive
                  ? 'bg-black text-white' 
                  : 'text-slate-500 hover:text-black hover:bg-slate-50'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* KANAN: Actions & User Pill */}
        <div className="flex items-center gap-1 bg-white rounded-full p-1.5 shadow-sm border border-slate-100 shrink-0">
          {/* Notification */}
          <NotificationPanel />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 pl-1 pr-4 py-1 rounded-full hover:bg-slate-50 transition-colors focus:outline-none">
                <Avatar className="w-8 h-8 border border-slate-200">
                  <AvatarFallback className={`${getColor(user?.name)} text-white text-xs font-semibold`}>
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-black">{user?.name?.split(' ')[0] || 'Admin'}</span>
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-48 bg-white rounded-2xl shadow-lg border-slate-100 mt-2">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-slate-800">{user?.name || 'User Name'}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role || 'Role'}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 cursor-pointer rounded-xl">
                <User size={14} /> Profile
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem className="gap-2 cursor-pointer rounded-xl"
                  onClick={() => navigate('/admin/projects')}>
                  <Settings size={14} /> Manage Projects
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="gap-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 rounded-xl">
                <LogOut size={14} /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </header>
  )
}