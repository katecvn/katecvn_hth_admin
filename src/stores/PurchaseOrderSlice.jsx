import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

const purchaseOrderApi = {
  getOrders: async (filters) => {
    try {
      const params = {}
      if (filters?.status) params.status = filters.status
      if (filters?.shippingStatus)
        params.shippingStatus = filters.shippingStatus
      if (filters?.dateRange?.from) params.fromDate = filters.dateRange.from
      if (filters?.dateRange?.to) params.toDate = filters.dateRange.to
      const response = await api.get('/order/shows/customer', { params })
      const { data } = response.data
      return data?.orders || []
    } catch (error) {
      throw error
    }
  },
  getOrderDetail: async (id) => {
    try {
      const response = await api.get(`/order/${id}`)
      const { data } = response.data
      return data
    } catch (error) {
      throw error
    }
  },
  updateOrderStatus: async (id, status) => {
    try {
      const response = await api.put(`/order/update-status/${id}`, { status })
      return response.data
    } catch (error) {
      throw error
    }
  },
  updateShippingStatus: async (id, data) => {
    try {
      const response = await api.put(`/shipping/update-status/${id}`, data)
      return response.data
    } catch (error) {
      throw error
    }
  },
  deleteOrder: async (id) => {
    try {
      const response = await api.delete(`/order/destroy/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },
  getPurchaseSummary: async (filters) => {
    try {
      const params = {}
      if (filters?.dateRange?.from) params.fromDate = filters.dateRange.from
      if (filters?.dateRange?.to) params.toDate = filters.dateRange.to
      if (filters?.status) params.status = filters.status
      if (filters?.shippingStatus)
        params.shippingStatus = filters.shippingStatus
      const response = await api.get('/order-purchase-summary', { params })
      const { data } = response.data
      return data || []
    } catch (error) {
      throw error
    }
  },
}

export const getPurchaseOrders = createAsyncThunk(
  'purchaseOrder/list',
  async (filters, { rejectWithValue }) => {
    try {
      const data = await purchaseOrderApi.getOrders(filters)
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getPurchaseOrderDetail = createAsyncThunk(
  'purchaseOrder/detail',
  async (id, { rejectWithValue }) => {
    try {
      const data = await purchaseOrderApi.getOrderDetail(id)
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const changePurchaseOrderStatus = createAsyncThunk(
  'purchaseOrder/status',
  async ({ id, status, filters }, { rejectWithValue, dispatch }) => {
    try {
      await purchaseOrderApi.updateOrderStatus(id, status)
      await dispatch(getPurchaseOrders(filters)).unwrap()
      toast.success('Cập nhật trạng thái đơn mua thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const changePurchaseShippingStatus = createAsyncThunk(
  'purchaseOrder/shipping/status',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const { id, status, deliveredAt, orderId } = data
      await purchaseOrderApi.updateShippingStatus(id, { status, deliveredAt })
      await dispatch(getPurchaseOrderDetail(orderId)).unwrap()
      toast.success('Cập nhật trạng thái vận chuyển thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteExistingPurchaseOrder = createAsyncThunk(
  'purchaseOrder/delete',
  async ({ id, filters }, { rejectWithValue, dispatch }) => {
    try {
      await purchaseOrderApi.deleteOrder(id)
      await dispatch(getPurchaseOrders(filters)).unwrap()
      toast.success('Xóa đơn mua thành công')
    } catch (error) {
      const message = error?.response?.data?.messages || handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getPurchaseSummary = createAsyncThunk(
  'purchaseOrder/summary',
  async (filters, { rejectWithValue }) => {
    try {
      const data = await purchaseOrderApi.getPurchaseSummary(filters)
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  order: {},
  orders: [],
  summary: [],
  loading: false,
  error: null,
}

export const purchaseOrderSlice = createSlice({
  name: 'purchaseOrder',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPurchaseOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPurchaseOrders.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload || []
      })
      .addCase(getPurchaseOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(state.error)
      })
      .addCase(getPurchaseOrderDetail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPurchaseOrderDetail.fulfilled, (state, action) => {
        state.loading = false
        state.order = action.payload
      })
      .addCase(getPurchaseOrderDetail.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(state.error)
      })
      .addCase(changePurchaseOrderStatus.pending, (state) => {
        state.loading = true
      })
      .addCase(changePurchaseOrderStatus.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(changePurchaseOrderStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(state.error)
      })
      .addCase(changePurchaseShippingStatus.pending, (state) => {
        state.loading = true
      })
      .addCase(changePurchaseShippingStatus.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(changePurchaseShippingStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(state.error)
      })
      .addCase(deleteExistingPurchaseOrder.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteExistingPurchaseOrder.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteExistingPurchaseOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(state.error)
      })
      .addCase(getPurchaseSummary.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPurchaseSummary.fulfilled, (state, action) => {
        state.loading = false
        state.summary = action.payload || []
      })
      .addCase(getPurchaseSummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(state.error)
      })
  },
})

export default purchaseOrderSlice.reducer
