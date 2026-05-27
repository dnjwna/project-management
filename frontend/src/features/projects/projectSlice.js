import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/axios'

export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/projects', { params })
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

export const fetchProjectDetail = createAsyncThunk(
  'projects/fetchDetail',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/projects/${id}`)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

export const createProject = createAsyncThunk(
  'projects/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/projects', data)
      return res.data.project
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

export const updateProject = createAsyncThunk(
  'projects/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/projects/${id}`, data)
      return res.data.project
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

export const deleteProject = createAsyncThunk(
  'projects/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${id}`)
      return id
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    list: [],
    detail: null,
    pagination: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearDetail: (state) => { state.detail = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => { state.loading = true })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload.data
        state.pagination = {
          currentPage: action.payload.current_page,
          lastPage: action.payload.last_page,
          total: action.payload.total,
        }
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchProjectDetail.fulfilled, (state, action) => {
        state.detail = action.payload
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.list.unshift(action.payload)
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const idx = state.list.findIndex(p => p.id === action.payload.id)
        if (idx !== -1) state.list[idx] = action.payload
        if (state.detail?.id === action.payload.id) state.detail = action.payload
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.list = state.list.filter(p => p.id !== action.payload)
      })
  },
})

export const { clearDetail } = projectSlice.actions
export default projectSlice.reducer