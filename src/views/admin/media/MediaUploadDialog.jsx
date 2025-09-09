import { useState, useRef, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

import { uploadMedia } from '@/stores/MediaSlice'
import { UploadIcon, XIcon, Loader } from 'lucide-react'

const MediaUploadDialog = ({ open, onOpenChange, onUploadSuccess, prefix }) => {
  const dispatch = useDispatch()
  const uploading = useSelector((state) => state.media.uploading)
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [isLoadingPreviews, setIsLoadingPreviews] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)
  const MAX_FILE_SIZE = 10 * 1024 * 1024
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const PREVIEW_BATCH_SIZE = 5
  const PREVIEW_DELAY = 100

  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        if (preview.url) {
          URL.revokeObjectURL(preview.url)
        }
      })
    }
  }, [previews])

  const validateFiles = (fileList) => {
    const validFiles = []
    const errorMessages = []

    Array.from(fileList).forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errorMessages.push(
          `"${file.name}" không phải là định dạng hình ảnh hợp lệ.`,
        )
      } else if (file.size > MAX_FILE_SIZE) {
        errorMessages.push(`"${file.name}" vượt quá kích thước tối đa (10MB).`)
      } else {
        validFiles.push(file)
      }
    })

    if (errorMessages.length > 0) {
      toast.error(errorMessages.join('\n'))
    }

    return validFiles
  }

  const createThumbnail = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 300
          const MAX_HEIGHT = 200
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width)
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height)
              height = MAX_HEIGHT
            }
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              const thumbnailUrl = URL.createObjectURL(blob)
              resolve(thumbnailUrl)
            },
            file.type,
            0.7,
          )
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = event.target.result
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }, [])

  const createPreviews = async (validFiles) => {
    setIsLoadingPreviews(true)

    try {
      const newPreviews = []

      for (let i = 0; i < validFiles.length; i += PREVIEW_BATCH_SIZE) {
        const batch = validFiles.slice(i, i + PREVIEW_BATCH_SIZE)

        const batchPromises = batch.map(async (file) => {
          try {
            const thumbnailUrl = await createThumbnail(file)
            return {
              file,
              url: thumbnailUrl,
              id: Math.random().toString(36).substring(2, 11),
            }
          } catch (error) {
            console.error('Error creating preview for', file.name, error)
            return {
              file,
              url: null,
              id: Math.random().toString(36).substring(2, 11),
              error: true,
            }
          }
        })

        const batchObjects = await Promise.all(batchPromises)
        newPreviews.push(...batchObjects)

        setPreviews((prev) => [...prev, ...batchObjects])
        setFiles((prevFiles) => [...prevFiles, ...batch])

        if (i + PREVIEW_BATCH_SIZE < validFiles.length) {
          await new Promise((resolve) => setTimeout(resolve, PREVIEW_DELAY))
        }
      }

      return newPreviews
    } catch (error) {
      console.error('Error in createPreviews:', error)
      toast.error('Có lỗi xảy ra khi tạo xem trước hình ảnh.')
      return []
    } finally {
      setIsLoadingPreviews(false)
    }
  }

  const handleFileChange = async (e) => {
    previews.forEach((preview) => {
      if (preview.url) {
        URL.revokeObjectURL(preview.url)
      }
    })

    setFiles([])
    setPreviews([])

    const validFiles = validateFiles(e.target.files)

    if (validFiles.length > 0) {
      await createPreviews(validFiles)
    }
  }

  const handleRemoveFile = (index) => {
    if (previews[index]?.url) {
      URL.revokeObjectURL(previews[index].url)
    }

    const newFiles = [...files]
    const newPreviews = [...previews]

    newFiles.splice(index, 1)
    newPreviews.splice(index, 1)

    setFiles(newFiles)
    setPreviews(newPreviews)
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Vui lòng chọn ít nhất một hình ảnh để tải lên')
      return
    }

    try {
      const options = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100,
          )
          setUploadProgress(progress)
        },
      }

      await dispatch(
        uploadMedia(
          {
            files,
            project: 'shop',
            prefix: prefix[0]?.value || 'images',
          },
          options,
        ),
      ).unwrap()

      toast.success('Tải lên thành công')

      previews.forEach((preview) => {
        if (preview.url) {
          URL.revokeObjectURL(preview.url)
        }
      })
      setFiles([])
      setPreviews([])
      setUploadProgress(0)

      onUploadSuccess()
      onOpenChange(false)
    } catch (error) {
      toast.error('Lỗi khi tải lên')
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = async (e) => {
    e.preventDefault()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = validateFiles(e.dataTransfer.files)

      if (validFiles.length > 0) {
        await createPreviews(validFiles)
      }
    }
  }

  const clearAllFiles = () => {
    previews.forEach((preview) => {
      if (preview.url) {
        URL.revokeObjectURL(preview.url)
      }
    })
    setFiles([])
    setPreviews([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-md md:max-w-2xl">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Tải lên hình ảnh</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1">
          <div
            className="mt-4 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-6 hover:border-gray-400"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <UploadIcon className="mb-2 h-10 w-10 text-gray-400" />
            <p className="mb-1 text-sm font-medium">
              Kéo thả hình ảnh vào đây hoặc click để chọn
            </p>
            <p className="text-xs text-gray-500">
              Hỗ trợ các định dạng: PNG, JPG, JPEG, GIF, WEBP (tối đa 10MB mỗi
              ảnh)
            </p>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {isLoadingPreviews && (
            <div className="mt-4 flex items-center justify-center">
              <Loader className="mr-2 h-5 w-5 animate-spin text-gray-500" />
              <p className="text-sm text-gray-500">
                Đang tạo xem trước ({previews.length}/
                {files.length + previews.length})...
              </p>
            </div>
          )}

          {uploading && (
            <div className="mt-4">
              <p className="mb-1 text-sm">Đang tải lên: {uploadProgress}%</p>
              <div className="h-2.5 w-full rounded-full bg-gray-200">
                <div
                  className="h-2.5 rounded-full bg-blue-600"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {previews.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-medium">
                  Hình ảnh đã chọn ({previews.length})
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFiles}
                  disabled={uploading || isLoadingPreviews}
                  className="h-8 text-xs"
                >
                  Xóa tất cả
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {previews.map((preview, index) => (
                  <div key={preview.id || index} className="relative">
                    <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-100">
                      {preview.error ? (
                        <div className="flex h-full items-center justify-center bg-gray-100 p-2 text-center text-xs text-red-500">
                          Lỗi tải hình
                        </div>
                      ) : (
                        <img
                          src={preview.url}
                          alt={`Preview ${index}`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Cpath d='M30,40 L70,40 L70,70 L30,70 Z' fill='%23ddd'/%3E%3Cpath d='M50,20 C55.5228,20 60,24.4772 60,30 C60,35.5228 55.5228,40 50,40 C44.4772,40 40,35.5228 40,30 C40,24.4772 44.4772,20 50,20 Z' fill='%23ddd'/%3E%3C/svg%3E"
                          }}
                        />
                      )}
                    </div>
                    <button
                      className="absolute right-1 top-1 rounded-full bg-gray-800 p-1 opacity-70 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFile(index)
                      }}
                      disabled={uploading || isLoadingPreviews}
                    >
                      <XIcon className="h-4 w-4 text-white" />
                    </button>
                    <p className="mt-1 truncate text-xs">{preview.file.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleUpload}
            disabled={uploading || files.length === 0 || isLoadingPreviews}
          >
            {uploading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Đang tải lên...
              </>
            ) : (
              `Tải lên ${previews.length > 0 ? previews.length : ''}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default MediaUploadDialog
