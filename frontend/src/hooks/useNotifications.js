import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  setNotifications,
  addNotification,
  markAsRead as markRead,
  markAllAsRead as markAll,
} from '../features/notifications/notificationSlice'
import api from '../utils/axios'

export const useNotifications = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((s) => s.auth)
  const { items } = useSelector((s) => s.notifications)

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      dispatch(setNotifications(res.data.notifications))
    } catch {}
  }

  useEffect(() => {
    if (!user) return

    fetchNotifications()

    // Polling setiap 15 detik
    const interval = setInterval(fetchNotifications, 15000)

    return () => clearInterval(interval)
  }, [user?.id])

  const handleMarkAsRead = async (notifId) => {
    try {
      await api.patch(`/notifications/${notifId}/read`)
      dispatch(markRead(notifId))
    } catch {}
  }

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      dispatch(markAll())
    } catch {}
  }

  const handleClearAll = async () => {
    try {
      await api.delete('/notifications')
      dispatch(setNotifications([]))
    } catch {}
  }

  const unreadCount = items.filter(n => !n.is_read).length

  return {
    notifications: items,
    unreadCount,
    refresh: fetchNotifications,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    clearAll: handleClearAll,
  }
}