import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/axios'

export const fetchProjectSummary = createAsyncThunk(
  'reports/summary',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/reports/projects')
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

export const fetchProjectReport = createAsyncThunk(
  'reports/detail',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/reports/projects/${id}`)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

const reportSlice = createSlice({
  name: 'reports',
  initialState: {
    summary: null,
    detail: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjectSummary.pending, (state) => { state.loading = true })
      .addCase(fetchProjectSummary.fulfilled, (state, action) => {
        state.loading = false
        state.summary = action.payload
      })
      .addCase(fetchProjectSummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchProjectReport.fulfilled, (state, action) => {
        state.detail = action.payload
      })
  },
})

export default reportSlice.reducer