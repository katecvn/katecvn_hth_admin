import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'
import { getAuthUserRolePermissions } from './AuthSlice'

export const getUsers = createAsyncThunk(
  'user/getUsers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/user/shows', { params })
      const { data } = response.data
      return { users: data.users, params }
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteUser = createAsyncThunk(
  'user/delete',
  async (data, { rejectWithValue, dispatch, getState }) => {
    try {
      await api.delete(`/user/destroy/${data}`)

      // Get current params from state and use them for reloading
      const currentParams = getState().user.currentParams || { type: 'admin' }
      await dispatch(getUsers(currentParams)).unwrap()

      toast.success('Xóa thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createUser = createAsyncThunk(
  'user/create',
  async (data, { rejectWithValue, dispatch, getState }) => {
    try {
      await api.post('/user/create', data)

      // Get current params from state and use them for reloading
      const currentParams = getState().user.currentParams || { type: 'admin' }
      await dispatch(getUsers(currentParams)).unwrap()

      toast.success('Thêm mới thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const updateUser = createAsyncThunk(
  'user/update',
  async (updateData, { rejectWithValue, dispatch, getState }) => {
    try {
      const { id, data } = updateData
      await api.put(`/user/update/${id}`, data)

      // Get current params from state and use them for reloading
      const currentParams = getState().user.currentParams || { type: 'admin' }
      await dispatch(getUsers(currentParams)).unwrap()

      toast.success('Cập nhật dữ liệu thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const changePassword = createAsyncThunk(
  'user/change-password',
  async (data, { rejectWithValue }) => {
    try {
      await api.put('/user/change-password', data)
      toast.success('Cập nhật mật khẩu thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateProfile = createAsyncThunk(
  'user/update-profile',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.put('/user/profile', data)
      await dispatch(getAuthUserRolePermissions()).unwrap()
      toast.success('Cập nhật thông tin thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  users: [],
  loading: false,
  error: null,
  currentParams: null, // Track the current params
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload.users
        state.currentParams = action.payload.params // Store the params
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(createUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createUser.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteUser.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default userSlice.reducer
