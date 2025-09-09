import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

// API functions embedded directly in the slice
const invoiceApi = {
  getInvoices: async () => {
    try {
      const response = await api.get('/order/shows')
      const { data } = response.data
      // Trả về mảng rỗng nếu không có dữ liệu
      return data || { orders: [] }
    } catch (error) {
      console.log('Fetch invoices error: ', error)
      throw error
    }
  },

  getInvoiceDetail: async (id) => {
    try {
      const response = await api.get(`/order/${id}`)
      const { data } = response.data
      return data
    } catch (error) {
      console.log('Fetch invoice detail error: ', error)
      throw error
    }
  },

  createInvoice: async (data) => {
    try {
      const response = await api.post('/invoice/create', data)
      return response.data
    } catch (error) {
      console.log('Create invoice error: ', error)
      throw error
    }
  },

  updateInvoice: async (id, data) => {
    try {
      const response = await api.put(`/invoice/update/${id}`, data)
      return response.data
    } catch (error) {
      console.log('Update invoice error: ', error)
      throw error
    }
  },

  updateInvoiceStatus: async (id, status) => {
    try {
      const response = await api.put(`/order/update-status/${id}`, { status })
      return response.data
    } catch (error) {
      console.log('Update invoice status error: ', error)
      throw error
    }
  },

  updateShippingStatus: async (id, data) => {
    try {
      const response = await api.put(`/shipping/update-status/${id}`, data)
      return response.data
    } catch (error) {}
  },

  deleteInvoice: async (id) => {
    try {
      const response = await api.delete(`/order/destroy/${id}`)
      return response.data
    } catch (error) {
      console.log('Delete invoice error: ', error)
      throw error
    }
  },
}

export const getInvoice = createAsyncThunk(
  'invoice',
  async (_, { rejectWithValue }) => {
    try {
      const data = await invoiceApi.getInvoices()
      return data.orders || []
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getInvoiceDetails = createAsyncThunk(
  'invoice/detail',
  async (id, { rejectWithValue }) => {
    try {
      const data = await invoiceApi.getInvoiceDetail(id)
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createNewInvoice = createAsyncThunk(
  'invoice/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await invoiceApi.createInvoice(data)
      await dispatch(getInvoice()).unwrap()
      toast.success('Thêm mới hóa đơn thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(error)
    }
  },
)

export const updateExistingInvoice = createAsyncThunk(
  'invoice/update',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data } = updateData
      await invoiceApi.updateInvoice(id, data)
      await dispatch(getInvoice()).unwrap()
      toast.success('Cập nhật hóa đơn thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(error)
    }
  },
)

export const deleteExistingInvoice = createAsyncThunk(
  'invoice/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await invoiceApi.deleteInvoice(id)
      await dispatch(getInvoice()).unwrap()
      toast.success('Xóa hóa đơn thành công')
    } catch (error) {
      // const message = handleError(error)
      const message = error?.response?.data?.messages
      return rejectWithValue(message)
    }
  },
)

export const changeInvoiceStatus = createAsyncThunk(
  'invoice/status',
  async (statusData, { rejectWithValue, dispatch }) => {
    try {
      const { id, status } = statusData
      await invoiceApi.updateInvoiceStatus(id, status)
      await dispatch(getInvoice()).unwrap()
      toast.success('Cập nhật trạng thái hóa đơn thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const changeShippingStatus = createAsyncThunk(
  'invoice/shipping/status',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const { id, status, deliveredAt, orderId } = data
      await invoiceApi.updateShippingStatus(id, { status, deliveredAt })
      await dispatch(getInvoiceDetails(orderId)).unwrap()
      toast.success('Cập nhật trạng thái hóa đơn thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  invoice: {},
  invoices: [],
  loading: false,
  error: null,
}

export const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createNewInvoice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createNewInvoice.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createNewInvoice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getInvoice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getInvoice.fulfilled, (state, action) => {
        state.loading = false
        state.invoices = action.payload || []
      })
      .addCase(getInvoice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getInvoiceDetails.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getInvoiceDetails.fulfilled, (state, action) => {
        state.loading = false
        state.invoice = action.payload
      })
      .addCase(getInvoiceDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteExistingInvoice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteExistingInvoice.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteExistingInvoice.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateExistingInvoice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateExistingInvoice.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateExistingInvoice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(changeInvoiceStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(changeInvoiceStatus.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(changeInvoiceStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(changeShippingStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(changeShippingStatus.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(changeShippingStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default invoiceSlice.reducer
