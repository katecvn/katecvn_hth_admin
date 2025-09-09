const formatNumber = (number) => {
  if (number === null || number === undefined || number === '') return ''
  const numericValue = Number(number)
  if (isNaN(numericValue)) return ''
  return numericValue.toLocaleString('en-US')
}

export default formatNumber
