import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'sonner'

// ---- Thunks ----

export const login = createAsyncThunk(
  'auth/login',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/login', data)
      const { data: token } = response.data
      localStorage.setItem('accessToken', token.token)
      localStorage.setItem(
        'permissionCodes',
        JSON.stringify(token?.userInformation?.roles[0]?.permissions || []),
      )
      localStorage.setItem(
        'userCurrent',
        JSON.stringify(token?.userInformation),
      )
      toast.success('Đăng nhập thành công')
      return response.data
    } catch (error) {
      toast.error('Tài khoản hoặc mật khẩu không đúng')
      return rejectWithValue(handleError(error))
    }
  },
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (data, { rejectWithValue }) => {
    try {
      // await api.get('/logout', data)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('permissionCodes')
      toast.success('Đăng xuất thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const getAuthUserRolePermissions = createAsyncThunk(
  'auth/authenticated',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/authenticated')
      const { data: user } = response.data
      const permissions = user?.role?.permissions.map(
        (permission) => permission.code,
      )
      localStorage.setItem(
        'permissionCodes',
        JSON.stringify(permissions) || '[]',
      )
      return user
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

// ⭐ Lấy điểm thưởng user
export const getRewardPoints = createAsyncThunk(
  'auth/get-reward-points',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/user/reward-points')
      return response.data.data // { rewardPoints: ... }
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const redirectToGoogle = createAsyncThunk(
  'auth/redirect-to-google',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/redirect/google')
      const { data } = response.data
      window.location.href = data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const callbackGoogle = createAsyncThunk(
  'auth/callback-google',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/callback/google', { params: data })
      const { data: token } = response.data
      localStorage.setItem('accessToken', token)
      toast.success('Đăng nhập thành công')
      return response.data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const getAccessLogs = createAsyncThunk(
  'auth/get-access-logs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/access-log')
      return response.data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const forgotPass = createAsyncThunk(
  'auth/forgotPass',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/forgot-password', data)
      return response.data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const resetPass = createAsyncThunk(
  'auth/resetPass',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/reset-password', data)
      return response.data
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const revokeTokens = createAsyncThunk(
  'auth/revoke-tokens',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/logout', data)
      await dispatch(getAccessLogs()).unwrap()
      toast.success('Đăng xuất thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

// ---- Initial State ----
const initialState = {
  authUserWithRoleHasPermissions: null,
  rewardPoints: 0, // ⭐ thêm
  error: null,
  loading: false,
  accessLogs: [],
}

// ---- Slice ----
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
      })

      // authenticated user
      .addCase(getAuthUserRolePermissions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getAuthUserRolePermissions.fulfilled, (state, action) => {
        state.loading = false
        state.authUserWithRoleHasPermissions = action.payload
      })
      .addCase(getAuthUserRolePermissions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
      })

      // reward points
      .addCase(getRewardPoints.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getRewardPoints.fulfilled, (state, action) => {
        state.loading = false
        console.log('response', action.payloads)
        state.rewardPoints = action.payload.rewardPoints
      })
      .addCase(getRewardPoints.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
      })

      // logout
      .addCase(logout.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
      })

      // forgot password
      .addCase(forgotPass.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(forgotPass.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(forgotPass.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
      })

      // reset password
      .addCase(resetPass.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(resetPass.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(resetPass.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
      })

      // google redirect
      .addCase(redirectToGoogle.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(redirectToGoogle.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(redirectToGoogle.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
      })

      // google callback
      .addCase(callbackGoogle.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(callbackGoogle.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(callbackGoogle.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
      })

      // access logs
      .addCase(getAccessLogs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getAccessLogs.fulfilled, (state, action) => {
        state.loading = false
        state.accessLogs = action.payload.data
      })
      .addCase(getAccessLogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
      })

      // revoke tokens
      .addCase(revokeTokens.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(revokeTokens.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(revokeTokens.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
      })
  },
})

export default authSlice.reducer
