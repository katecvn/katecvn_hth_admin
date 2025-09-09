import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '@/utils/axios'

export const getMedia = createAsyncThunk(
  'media/getMedia',
  async (
    { project, prefix, sort, limit, page, reset },
    { rejectWithValue },
  ) => {
    try {
      let params = {
        project,
        sort,
        limit,
        page,
      }

      // Add prefix parameters
      if (prefix) {
        Object.keys(prefix).forEach((key) => {
          params[key] = prefix[key]
        })
      }

      const response = await axios.get('/files/shows', { params })
      return { data: response.data.data, reset }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể tải danh sách hình ảnh',
      )
    }
  },
)

export const uploadMedia = createAsyncThunk(
  'media/uploadMedia',
  async ({ files, project, prefix }, { rejectWithValue }) => {
    try {
      const formData = new FormData()

      files.forEach((file) => {
        formData.append('files', file)
      })

      const url = `/files/upload?project=${project}&prefix=${prefix}`

      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể tải lên hình ảnh',
      )
    }
  },
)

export const deleteMedia = createAsyncThunk(
  'media/deleteMedia',
  async (fileUrl, { rejectWithValue }) => {
    try {
      const response = await axios.delete('/files/delete-files', {
        data: { files: [fileUrl] },
      })
      return { url: fileUrl }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể xóa hình ảnh',
      )
    }
  },
)

const mediaSlice = createSlice({
  name: 'media',
  initialState: {
    files: [],
    loading: false,
    loadingMore: false,
    uploading: false,
    error: null,
    hasMore: true,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getMedia.pending, (state, action) => {
        const { meta } = action
        const { page, reset } = meta.arg

        if (page === 1 || reset) {
          state.loading = true
        } else {
          state.loadingMore = true
        }
        state.error = null
      })
      .addCase(getMedia.fulfilled, (state, action) => {
        const { data, reset } = action.payload

        if (reset) {
          state.files = data
        } else {
          state.files = [...state.files, ...data]
        }

        state.hasMore = data.length > 0
        state.loading = false
        state.loadingMore = false
        state.error = null
      })
      .addCase(getMedia.rejected, (state, action) => {
        state.loading = false
        state.loadingMore = false
        state.error = action.payload
      })

      // Upload Media
      .addCase(uploadMedia.pending, (state) => {
        state.uploading = true
        state.error = null
      })
      .addCase(uploadMedia.fulfilled, (state) => {
        state.uploading = false
      })
      .addCase(uploadMedia.rejected, (state, action) => {
        state.uploading = false
        state.error = action.payload
      })

      // Delete Media
      .addCase(deleteMedia.fulfilled, (state, action) => {
        state.files = state.files.filter(
          (file) => file.url !== action.payload.url,
        )
      })
  },
})

export default mediaSlice.reducer
