import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../../hooks/useNotifications'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell } from 'lucide-react'

const typeStyle = {
  task_assigned: { bg: 'bg-indigo-50', dot: 'bg-indigo-500', icon: '📋' },
  comment_added: { bg: 'bg-purple-50', dot: 'bg-purple-500', icon: '💬' },
  due_soon:      { bg: 'bg-orange-50', dot: 'bg-orange-500', icon: '🕐' },
  overdue:       { bg: 'bg-red-50',    dot: 'bg-red-500',    icon: '⚠️' },
  task_blocked:  { bg: 'bg-red-50',    dot: 'bg-red-500',    icon: '🚫' },
}

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function NotificationPanel() {
  const navigate = useNavigate()
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications()

  const handleClick = async (notif) => {
    await markAsRead(notif.id)
    if (notif.data?.project_id && notif.data?.task_id) {
      navigate(`/projects/${notif.data.project_id}/tasks`)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors">
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 p-0 bg-white z-[100] rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-app-dark text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead}
              className="text-xs text-indigo-500 hover:text-indigo-600 font-medium transition-colors">
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Bell size={24} className="mb-2 opacity-30" />
              <p className="text-sm font-medium">You're all caught up!</p>
              <p className="text-xs mt-1">No new notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {notifications.map((notif) => {
                const style = typeStyle[notif.type] || typeStyle.task_assigned
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleClick(notif)}
                    className={`w-full text-left px-4 py-3 transition-colors hover:bg-slate-50 flex items-start gap-3 ${
                      !notif.is_read ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-8 h-8 ${style.bg} rounded-xl flex items-center justify-center shrink-0 mt-0.5`}>
                      <span className="text-sm">{style.icon}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-semibold ${!notif.is_read ? 'text-app-dark' : 'text-slate-500'}`}>
                          {notif.title}
                        </p>
                        <span className="text-xs text-slate-400 shrink-0">
                          {formatRelativeTime(notif.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 text-left">
                        {notif.message}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!notif.is_read && (
                      <div className={`w-2 h-2 ${style.dot} rounded-full shrink-0 mt-1.5`} />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100">
            <button onClick={clearAll}
              className="w-full text-xs text-center text-slate-400 hover:text-slate-600 transition-colors">
              Clear all notifications
            </button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}