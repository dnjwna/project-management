import { createSlice } from '@reduxjs/toolkit'

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    loading: false,
  },
  reducers: {
    addNotification: (state, action) => {
      // Cek duplikat
      const exists = state.items.find(n => n.id === action.payload.id)
      if (!exists) state.items.unshift(action.payload)
    },
    markAsRead: (state, action) => {
      const notif = state.items.find(n => n.id === action.payload)
      if (notif) notif.is_read = true
    },
    markAllAsRead: (state) => {
      state.items.forEach(n => { n.is_read = true })
    },
    setNotifications: (state, action) => {
      state.items = action.payload
    },
  },
})

export const { addNotification, markAsRead, markAllAsRead, setNotifications } = notificationSlice.actions
export default notificationSlice.reducer