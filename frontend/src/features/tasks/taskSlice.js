import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/axios'

export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async ({ projectId, params = {} }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/projects/${projectId}/tasks`, { params })
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

export const createTask = createAsyncThunk(
  'tasks/create',
  async ({ projectId, data }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/projects/${projectId}/tasks`, data)
      return res.data.task
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ projectId, taskId, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/projects/${projectId}/tasks/${taskId}`, data)
      return res.data.task
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async ({ projectId, taskId }, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${projectId}/tasks/${taskId}`)
      return taskId
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    list: [],
    pagination: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => { state.loading = true })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload.data
        state.pagination = {
          currentPage: action.payload.current_page,
          lastPage: action.payload.last_page,
          total: action.payload.total,
        }
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.list.unshift(action.payload)
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.list.findIndex(t => t.id === action.payload.id)
        if (idx !== -1) state.list[idx] = action.payload
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.list = state.list.filter(t => t.id !== action.payload)
      })
  },
})

export default taskSlice.reducer