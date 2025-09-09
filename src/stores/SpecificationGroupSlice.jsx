import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getSpecificationGroups = createAsyncThunk(
  'specification-group/shows',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/specification/group/shows')
      const { data } = response.data

      return data.groups
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getSpecificationGroup = createAsyncThunk(
  'specification-group/show',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/specification/group/show/${id}`)
      const { data } = response.data

      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteSpecificationGroup = createAsyncThunk(
  'specification-group/destroy',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/specification/group/destroy/${id}`)
      await dispatch(getSpecificationGroups()).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createSpecificationGroup = createAsyncThunk(
  'specification-group/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/specification/group/create', data)

      await dispatch(getSpecificationGroups()).unwrap()
      toast.success('Thêm mới thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const updateSpecificationGroup = createAsyncThunk(
  'specification-group/update',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data } = updateData
      await api.put(`/specification/group/update/${id}`, data)
      await dispatch(getSpecificationGroups()).unwrap()
      toast.success('Cập nhật dữ liệu thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

const initialState = {
  specificationGroup: {},
  specificationGroups: [],
  loading: false,
  error: null,
}

export const specificationGroupSlice = createSlice({
  name: 'specificationGroup',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createSpecificationGroup.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createSpecificationGroup.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createSpecificationGroup.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getSpecificationGroups.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getSpecificationGroups.fulfilled, (state, action) => {
        state.loading = false
        state.specificationGroups = action.payload
      })
      .addCase(getSpecificationGroups.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getSpecificationGroup.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getSpecificationGroup.fulfilled, (state, action) => {
        state.loading = false
        state.specificationGroup = action.payload
      })
      .addCase(getSpecificationGroup.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteSpecificationGroup.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteSpecificationGroup.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteSpecificationGroup.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSpecificationGroup.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSpecificationGroup.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateSpecificationGroup.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default specificationGroupSlice.reducer
