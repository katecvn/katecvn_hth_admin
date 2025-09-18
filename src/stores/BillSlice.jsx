import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

const billApi = {
  getBills: async (filters) => {
    const params = {}
    if (filters?.status) params.status = filters.status
    if (filters?.keyword) params.keyword = filters.keyword
    if (filters?.page) params.page = filters.page
    if (filters?.limit) params.limit = filters.limit
    const res = await api.get('/invoice/shows', { params })
    const { data } = res.data
    return data || { invoices: [] }
  },
  getBillDetail: async (id) => {
    const res = await api.get(`/invoice/show/${id}`)
    const { data } = res.data
    return data
  },
  createBill: async (payload) => {
    const res = await api.post('/invoice/create', payload)
    return res.data
  },
  updateBill: async (id, payload) => {
    const res = await api.put(`/invoice/update/${id}`, payload)
    return res.data
  },
  updateBillStatus: async (id, status) => {
    const res = await api.put(`/invoice/update-status/${id}`, { status })
    return res.data
  },
  deleteBill: async (id) => {
    const res = await api.delete(`/invoice/destroy/${id}`)
    return res.data
  },
  bulkCreate: async (payload) => {
    const res = await api.post('/invoice/bulk-create', payload)
    return res.data
  },
}

export const getBills = createAsyncThunk(
  'bill/list',
  async (filters, { rejectWithValue }) => {
    try {
      const data = await billApi.getBills(filters)
      return data.invoices || []
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const getBillDetails = createAsyncThunk(
  'bill/detail',
  async (id, { rejectWithValue }) => {
    try {
      const data = await billApi.getBillDetail(id)
      return data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const createNewBill = createAsyncThunk(
  'bill/create',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      await billApi.createBill(payload)
      await dispatch(getBills()).unwrap()
      toast.success('Thêm mới hóa đơn thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const updateExistingBill = createAsyncThunk(
  'bill/update',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      await billApi.updateBill(id, data)
      await dispatch(getBills()).unwrap()
      toast.success('Cập nhật hóa đơn thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const deleteExistingBill = createAsyncThunk(
  'bill/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await billApi.deleteBill(id)
      await dispatch(getBills()).unwrap()
      toast.success('Xóa hóa đơn thành công')
    } catch (error) {
      const message = error?.response?.data?.messages || handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const changeBillStatus = createAsyncThunk(
  'bill/status',
  async ({ id, status, filters }, { rejectWithValue, dispatch }) => {
    try {
      await billApi.updateBillStatus(id, status)
      await dispatch(getBills(filters)).unwrap()
      toast.success('Cập nhật trạng thái hóa đơn thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const bulkCreateBills = createAsyncThunk(
  'bill/bulkCreate',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      await billApi.bulkCreate(payload)
      await dispatch(getBills()).unwrap()
      toast.success('Tạo hóa đơn hàng loạt thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

const initialState = {
  bill: {},
  bills: [],
  loading: false,
  error: null,
}

const billSlice = createSlice({
  name: 'bill',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getBills.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getBills.fulfilled, (state, action) => {
        state.loading = false
        state.bills = action.payload || []
      })
      .addCase(getBills.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getBillDetails.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getBillDetails.fulfilled, (state, action) => {
        state.loading = false
        state.bill = action.payload
      })
      .addCase(getBillDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(createNewBill.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createNewBill.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createNewBill.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateExistingBill.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateExistingBill.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateExistingBill.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteExistingBill.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteExistingBill.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteExistingBill.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(changeBillStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(changeBillStatus.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(changeBillStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(bulkCreateBills.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(bulkCreateBills.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(bulkCreateBills.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default billSlice.reducer
