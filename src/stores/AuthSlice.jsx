import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export const login = createAsyncThunk(
  'login',
  async (data, { rejectWithValue }) => {
    try {
      // const navigate = useNavigate()
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
      console.log(error, 'err')

      toast.error('Tài khoản hoặc mật khẩu không đúng')
    }
  },
)

export const logout = createAsyncThunk(
  'logout',
  async (data, { rejectWithValue }) => {
    try {
      // call api logout
      // await api.get('/logout', data)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('permissionCodes')
      toast.success('Đăng xuất thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getAuthUserRolePermissions = createAsyncThunk(
  '/auth/authenticated',
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
      const message = handleError(error)
      return rejectWithValue(message)
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
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const callbackGoogle = createAsyncThunk(
  'auth/callback-google',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/callback/google', {
        params: data,
      })
      const { data: token } = response.data
      localStorage.setItem('accessToken', token)
      toast.success('Đăng nhập thành công')
      return response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
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
      const message = handleError(error)
      return rejectWithValue(message)
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
      const message = handleError(error)
      return rejectWithValue(message)
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
      // const message = handleError(error)
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
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  authUserWithRoleHasPermissions: null,
  error: null,
  loading: false,
  accessLogs: [],
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
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
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(logout.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(forgotPass.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(forgotPass.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(forgotPass.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(resetPass.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(resetPass.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(resetPass.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(redirectToGoogle.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(redirectToGoogle.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(redirectToGoogle.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(callbackGoogle.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(callbackGoogle.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(callbackGoogle.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
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
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(revokeTokens.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(revokeTokens.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(revokeTokens.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default authSlice.reducer
