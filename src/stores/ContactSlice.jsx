import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getContact = createAsyncThunk(
  'contact',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/contact/shows')
      const { data } = response.data

      return data.contacts
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteContact = createAsyncThunk(
  'contact/delete',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/contact/destroy/${data}`)
      await dispatch(getContact()).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createContact = createAsyncThunk(
  'contact/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/contact/create', data)

      await dispatch(getContact()).unwrap()
      toast.success('Thêm mới thành công')
    } catch (error) {
      // const message = handleError(error)
      return rejectWithValue(error)
      // return rejectWithValue(message)
    }
  },
)

export const updateContact = createAsyncThunk(
  'contact/update',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data } = updateData
      await api.put(`/contact/update/${id}`, data)
      await dispatch(getContact()).unwrap()
      toast.success('Cập nhật dữ liệu thành công')
    } catch (error) {
      return rejectWithValue(error)
      // return rejectWithValue(message)
    }
  },
)
export const updateContactStatus = createAsyncThunk(
  'contact/updateStatus',
  async ({ id, status }, { rejectWithValue, dispatch }) => {
    try {
      await api.put(`/contact/update-status/${id}`, {
        status,
      })
      await dispatch(getContact()).unwrap()
      toast.success('Cập nhật dữ liệu thành công')
    } catch (error) {
      toast.error(error.response.data?.messages?.id||"Đã xảy ra lỗi")
      return rejectWithValue(error)
    }
  },
)

const initialState = {
  contact: {},
  contacts: [],
  loading: false,
  error: null,
}

export const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createContact.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createContact.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createContact.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getContact.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getContact.fulfilled, (state, action) => {
        state.loading = false
        state.contacts = action.payload
      })
      .addCase(getContact.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteContact.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteContact.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteContact.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateContact.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateContact.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateContact.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateContactStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateContactStatus.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateContactStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default contactSlice.reducer
