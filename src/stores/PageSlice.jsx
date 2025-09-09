import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getPage = createAsyncThunk(
  'page',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/page/shows')
      const { data } = response.data

      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getPageSections = createAsyncThunk(
  'page/sections',
  async (pageId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/page-section/shows?pageId=${pageId}`)
      const { data } = response.data

      return { pageId, sections: data }
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deletePage = createAsyncThunk(
  'page/delete',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/page/destroy/${data}`)
      await dispatch(getPage()).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createPage = createAsyncThunk(
  'page/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/page/create', data)

      await dispatch(getPage()).unwrap()
      toast.success('Thêm mới thành công')
    } catch (error) {
      const message = handleError(error)
      // return rejectWithValue(message)
      return rejectWithValue(error)
    }
  },
)

export const updatePage = createAsyncThunk(
  'page/update',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data } = updateData
      await api.put(`/page/update/${id}`, data)
      await dispatch(getPage()).unwrap()
      toast.success('Cập nhật dữ liệu thành công')
    } catch (error) {
      const message = handleError(error)
      // return rejectWithValue(message)
      return rejectWithValue(error)
    }
  },
)

export const createPageSection = createAsyncThunk(
  'page-section/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/page-section/create', data)

      await dispatch(getPageSections(data.pageId)).unwrap()
      toast.success('Thêm mới thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(error)
    }
  },
)

export const updatePageSection = createAsyncThunk(
  'page-section/update',
  async ({ sectionId, dataUpdate, pageId }, { rejectWithValue, dispatch }) => {
    try {
      // const { id, data } = updateData
      await api.put(`/page-section/update/${sectionId}`, dataUpdate)

      await dispatch(getPageSections(pageId)).unwrap()
      toast.success('Cập nhật dữ liệu thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(error)
    }
  },
)

export const deletePageSection = createAsyncThunk(
  'page-section/delete',
  async ({ id, pageId }, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/page-section/destroy/${id}`)

      // Sau khi xóa thành công, cập nhật lại danh sách section của trang hiện tại
      await dispatch(getPageSections(pageId)).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  page: {},
  pages: [],
  pageSections: [],
  loading: false,
  error: null,
}

export const pageSlice = createSlice({
  name: 'page',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createPage.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createPage.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createPage.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getPage.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPage.fulfilled, (state, action) => {
        state.loading = false
        state.pages = action.payload
      })
      .addCase(getPage.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getPageSections.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPageSections.fulfilled, (state, action) => {
        state.loading = false
        state.pageSections = action.payload.sections
      })
      .addCase(getPageSections.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deletePage.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deletePage.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deletePage.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updatePage.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updatePage.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updatePage.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(createPageSection.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createPageSection.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createPageSection.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updatePageSection.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updatePageSection.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updatePageSection.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deletePageSection.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deletePageSection.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deletePageSection.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default pageSlice.reducer
