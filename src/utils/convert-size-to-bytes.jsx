const convertSizeToBytes = (sizeType, sizeValue) => {
  const sizeMap = {
    B: Math.pow(1024, 0),
    KB: Math.pow(1024, 1),
    MB: Math.pow(1024, 2),
    GB: Math.pow(1024, 3),
    TB: Math.pow(1024, 4),
  }
  return sizeValue * (sizeMap[sizeType] || 1)
}

export default convertSizeToBytes
