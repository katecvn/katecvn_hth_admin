/**
 * Chuyển đổi chuỗi tiếng Việt có dấu thành slug
 * @param {string} text - Chuỗi cần chuyển đổi
 * @returns {string} - Chuỗi slug đã được chuyển đổi
 */
export const slugify = (text) => {
  if (!text) return '';

  // Chuyển đổi các ký tự tiếng Việt thành không dấu
  const from = 'àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵÀÁÃẢẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆĐÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴ';
  const to = 'aaaaaaaaaaaaaaaaaeeeeeeeeeeediiiiiooooooooooooooooouuuuuuuuuuuyyyyyAAAAAAAAAAAAAAAAAEEEEEEEEEEEDIIIIIOOOOOOOOOOOOOOOOOUUUUUUUUUUUYYYYY';

  // Chuyển đổi từng ký tự
  let result = text;
  for (let i = 0; i < from.length; i++) {
    result = result.replace(new RegExp(from[i], 'g'), to[i]);
  }

  // Chuyển đổi thành chữ thường và thay thế khoảng trắng bằng dấu gạch ngang
  return result
    .toLowerCase()
    .replace(/ /g, '-')
    // Loại bỏ các ký tự đặc biệt, chỉ giữ lại chữ cái, số và dấu gạch ngang
    .replace(/[^\w-]+/g, '')
    // Loại bỏ các dấu gạch ngang liên tiếp
    .replace(/--+/g, '-')
    // Loại bỏ dấu gạch ngang ở đầu và cuối
    .replace(/^-+|-+$/g, '');
}; 