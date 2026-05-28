import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  setNotifications,
  addNotification,
  markAsRead as markRead,
  markAllAsRead as markAll,
} from '../features/notifications/notificationSlice'
import api from '../utils/axios'
import createEcho from '../utils/echo'

let echoInstance = null

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
    if (!user?.id) return

    fetchNotifications()

    // Cleanup instance lama
    try {
      if (echoInstance) {
        echoInstance.disconnect()
        echoInstance = null
      }
    } catch {}

    // Buat instance baru
    try {
      echoInstance = createEcho()

      echoInstance
        .private(`notifications.${user.id}`)
        .listen('.notification.sent', (e) => {
          if (e?.notification) {
            dispatch(addNotification(e.notification))
          }
        })
    } catch (err) {
      console.error('Echo error:', err)
    }

    return () => {
      try {
        if (echoInstance) {
          echoInstance.leave(`notifications.${user.id}`)
        }
      } catch {}
    }
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