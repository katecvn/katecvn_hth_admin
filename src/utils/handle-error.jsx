const handleError = (error) => {
  console.log(error)
  if (!error.response) {
    return { message: 'Opps!! Đã có vài lỗi xảy ra' }
  }

  const { status, data } = error.response

  switch (status) {
    case 400:
      return {
        message:
          data.response?.data?.messages ||
          data.message ||
          'Yêu cầu không hợp lệ. Vui lòng kiểm tra dữ liệu đầu vào.',
      }
    case 401:
      return { message: 'Không có quyền truy cập. Vui lòng đăng nhập lại.' }
    case 403:
      return { message: 'Bị cấm. Bạn không có quyền truy cập tài nguyên này.' }
    case 404:
      return { message: 'Không tìm thấy tài nguyên.' }
    case 500:
      return { message: 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.' }
    default:
      return {
        message: data?.messages || 'Đã xảy ra lỗi không xác định.',
      }
  }
}

export { handleError }
