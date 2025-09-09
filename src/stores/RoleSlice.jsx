import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getRoles = createAsyncThunk(
  'role',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/role/shows')
      const { data } = response.data

      return data.roles
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getRoleById = createAsyncThunk(
  'role/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/role/show/${id}`)
      const { data } = response.data

      return data
    } catch (error) {
      const message = handleError(error)
      toast.error('Không thể lấy thông tin vai trò')
      return rejectWithValue(message)
    }
  },
)

export const deleteRole = createAsyncThunk(
  'role/delete',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/role/destroy/${data}`)
      await dispatch(getRoles()).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createRole = createAsyncThunk(
  'role/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/role/create', data)

      await dispatch(getRoles()).unwrap()
      toast.success('Thêm mới thành công')
    } catch (error) {
      // const message = handleError(error)
      return rejectWithValue(error)
      // return rejectWithValue(message)
    }
  },
)

export const updateRole = createAsyncThunk(
  'role/update',
  async ({ id, dataUpdate }, { rejectWithValue, dispatch }) => {
    try {
      await api.put(`/role/update/${id}`, dataUpdate)
      await dispatch(getRoles()).unwrap()
      toast.success('Cập nhật dữ liệu thành công')
    } catch (error) {
      // const message = handleError(error)
      // toast.err('Cập nhật dữ liệu thành công')

      return rejectWithValue(error)
      // return rejectWithValue(message)
    }
  },
)

const initialState = {
  role: {},
  roles: [],
  selectedRole: null,
  loading: false,
  error: null,
}

export const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    clearSelectedRole: (state) => {
      state.selectedRole = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createRole.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createRole.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getRoles.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getRoles.fulfilled, (state, action) => {
        state.loading = false
        state.roles = action.payload
      })
      .addCase(getRoles.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getRoleById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getRoleById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedRole = action.payload
      })
      .addCase(getRoleById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
      })
      .addCase(deleteRole.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteRole.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateRole.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateRole.fulfilled, (state) => {
        state.loading = false
        state.selectedRole = null
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export const { clearSelectedRole } = roleSlice.actions

export default roleSlice.reducer
