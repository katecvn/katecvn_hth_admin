import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

const invoiceApi = {
  getInvoices: async (filters) => {
    const params = {}
    if (filters?.status) params.status = filters.status
    if (filters?.shippingStatus) params.shippingStatus = filters.shippingStatus
    if (filters?.dateRange?.from) params.fromDate = filters.dateRange.from
    if (filters?.dateRange?.to) params.toDate = filters.dateRange.to
    const res = await api.get('/order/shows', { params })
    const { data } = res.data
    return data || { orders: [] }
  },
  getInvoiceDetail: async (id) => {
    const res = await api.get(`/order/${id}`)
    const { data } = res.data
    return data
  },
  createInvoice: async (data) => {
    const res = await api.post('/invoice/create', data)
    return res.data
  },
  updateInvoice: async (id, data) => {
    const res = await api.put(`/invoice/update/${id}`, data)
    return res.data
  },
  updateInvoiceStatus: async (id, status) => {
    const res = await api.put(`/order/update-status/${id}`, { status })
    return res.data
  },
  updateShippingStatus: async (id, data) => {
    const res = await api.put(`/shipping/update-status/${id}`, data)
    return res.data
  },
  deleteInvoice: async (id) => {
    const res = await api.delete(`/order/destroy/${id}`)
    return res.data
  },
  getSalesSummary: async (filters) => {
    const params = {}
    if (filters?.dateRange?.from) params.fromDate = filters.dateRange.from
    if (filters?.dateRange?.to) params.toDate = filters.dateRange.to
    if (filters?.status) params.status = filters.status
    if (filters?.shippingStatus) params.shippingStatus = filters.shippingStatus
    const res = await api.get('/order-purchase-summary', { params })
    const { data } = res.data
    return data || []
  },
}

export const getInvoice = createAsyncThunk(
  'invoice/list',
  async (filters, { rejectWithValue }) => {
    try {
      const data = await invoiceApi.getInvoices(filters)
      return data.orders || []
    } catch (error) {
      return rejectWithValue(handleError(error))
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
      return rejectWithValue(handleError(error))
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
      return rejectWithValue(handleError(error))
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
      return rejectWithValue(handleError(error))
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
      const message = error?.response?.data?.messages || handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const changeInvoiceStatus = createAsyncThunk(
  'invoice/status',
  async ({ id, status, filters }, { rejectWithValue, dispatch }) => {
    try {
      await invoiceApi.updateInvoiceStatus(id, status)
      await dispatch(getInvoice(filters)).unwrap()
      toast.success('Cập nhật trạng thái hóa đơn thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
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
      toast.success('Cập nhật trạng thái vận chuyển thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const getSalesSummary = createAsyncThunk(
  'invoice/sales/summary',
  async (filters, { rejectWithValue }) => {
    try {
      const data = await invoiceApi.getSalesSummary(filters)
      return data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

const initialState = {
  invoice: {},
  invoices: [],
  summary: [],
  loading: false,
  error: null,
}

export const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      .addCase(deleteExistingInvoice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteExistingInvoice.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteExistingInvoice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || action.payload || 'Lỗi không xác định'
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
      .addCase(getSalesSummary.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getSalesSummary.fulfilled, (state, action) => {
        state.loading = false
        state.summary = action.payload || []
      })
      .addCase(getSalesSummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default invoiceSlice.reducer
