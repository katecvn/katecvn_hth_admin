import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'
import { getAuthUserRolePermissions } from './AuthSlice'

// Lấy danh sách user
export const getUsers = createAsyncThunk(
  'user/getUsers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/user/shows', { params })
      const { data } = response.data
      return { users: data.users, params }
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

// Xóa user
export const deleteUser = createAsyncThunk(
  'user/delete',
  async (id, { rejectWithValue, dispatch, getState }) => {
    try {
      await api.delete(`/user/destroy/${id}`)
      const currentParams = getState().user.currentParams || { type: 'admin' }
      await dispatch(getUsers(currentParams)).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

// Tạo user
export const createUser = createAsyncThunk(
  'user/create',
  async (data, { rejectWithValue, dispatch, getState }) => {
    try {
      await api.post('/user/create', data)
      const currentParams = getState().user.currentParams || { type: 'admin' }
      await dispatch(getUsers(currentParams)).unwrap()
      toast.success('Thêm mới thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

// Cập nhật user
export const updateUser = createAsyncThunk(
  'user/update',
  async (updateData, { rejectWithValue, dispatch, getState }) => {
    try {
      const { id, data } = updateData
      await api.put(`/user/update/${id}`, data)
      const currentParams = getState().user.currentParams || { type: 'admin' }
      await dispatch(getUsers(currentParams)).unwrap()
      toast.success('Cập nhật dữ liệu thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

// Đổi mật khẩu
export const changePassword = createAsyncThunk(
  'user/change-password',
  async (data, { rejectWithValue }) => {
    try {
      await api.put('/user/change-password', data)
      toast.success('Cập nhật mật khẩu thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

// Update profile
export const updateProfile = createAsyncThunk(
  'user/update-profile',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.put('/user/profile', data)
      await dispatch(getAuthUserRolePermissions()).unwrap()
      toast.success('Cập nhật thông tin thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

// ⭐ Lấy điểm thưởng user
export const getRewardPoints = createAsyncThunk(
  'user/getRewardPoints',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/user/reward-points')
      return response.data.data // { rewardPoints: ... }
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

const initialState = {
  users: [],
  rewardPoints: 0,
  loading: false,
  error: null,
  currentParams: null,
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // getUsers
      .addCase(getUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload.users
        state.currentParams = action.payload.params
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })

      // createUser
      .addCase(createUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createUser.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })

      // updateUser
      .addCase(updateUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })

      // deleteUser
      .addCase(deleteUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteUser.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })

      // changePassword
      .addCase(changePassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })

      // updateProfile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })

      // getRewardPoints
      .addCase(getRewardPoints.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getRewardPoints.fulfilled, (state, action) => {
        state.loading = false
        state.rewardPoints = action.payload.rewardPoints
      })
      .addCase(getRewardPoints.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default userSlice.reducer
