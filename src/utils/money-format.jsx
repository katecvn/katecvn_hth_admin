export const moneyFormat = (value, withCurrency = true) => {
  const number = parseInt(value, 10)
  const options = {
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }
  if (withCurrency) {
    options.style = 'currency'
  }

  const formatted = new Intl.NumberFormat('vi-VN', options).format(number)

  return formatted.replace(/\./g, ',')
}

const defaultNumbers = ' hai ba bốn năm sáu bảy tám chín'
const dictionary = {
  units: ('? một' + defaultNumbers).split(' '),
  tens: ('lẻ mười' + defaultNumbers).split(' '),
  hundreds: ('không một' + defaultNumbers).split(' '),
}
const hundred = 'trăm'
const digitUnits = 'x nghìn triệu tỉ nghìn'.split(' ')

/**
 * Convert two-digit block to Vietnamese string.
 * @param {string} twoDigitBlock Block of two digits
 * @returns {string} Vietnamese representation of the two digits
 */
function convertTwoDigitBlock(twoDigitBlock) {
  let unitWord = dictionary.units[twoDigitBlock[1]]
  const result = [dictionary.tens[twoDigitBlock[0]]]
  if (twoDigitBlock[0] > 0 && twoDigitBlock[1] == 5) unitWord = 'lăm'
  if (twoDigitBlock[0] > 1) {
    result.push('mươi')
    if (twoDigitBlock[1] == 1) unitWord = 'mốt'
  }
  if (unitWord !== '?') result.push(unitWord)
  return result.join(' ')
}

/**
 * Convert three-digit block to Vietnamese string.
 * @param {string} threeDigitBlock Block of three digits
 * @returns {string} Vietnamese representation of the three digits
 */
function convertThreeDigitBlock(threeDigitBlock) {
  switch (threeDigitBlock.length) {
    case 1:
      return dictionary.units[threeDigitBlock]
    case 2:
      return convertTwoDigitBlock(threeDigitBlock)
    case 3: {
      const result = [dictionary.hundreds[threeDigitBlock[0]], hundred]
      if (threeDigitBlock.slice(1, 3) !== '00') {
        const lastTwoDigits = convertTwoDigitBlock(threeDigitBlock.slice(1, 3))
        result.push(lastTwoDigits)
      }
      return result.join(' ')
    }
    default:
      return ''
  }
}

/**
 * Get the unit of the current digit block.
 * @param {number} index Index of the block
 * @returns {string} Unit string for the current digit block
 */
function getDigitUnit(index) {
  return digitUnits[index]
}

/**
 * Convert a number to its Vietnamese string representation.
 * @param {number|string} input Number to convert
 * @param {string} [currency] Optional currency suffix
 * @returns {string} Vietnamese string representation of the number
 */
function toVietnamese(input, currency) {
  const numberString = parseInt(input) + ''
  let index = numberString.length
  if (index === 0 || numberString === 'NaN') return ''

  const blocks = []
  const result = []

  // Split the number string into blocks of three digits
  while (index >= 0) {
    blocks.push(numberString.substring(index, Math.max(index - 3, 0)))
    index -= 3
  }

  let zeroBlockCounter = 0
  for (let i = blocks.length - 1; i >= 0; i--) {
    if (blocks[i] === '000') {
      zeroBlockCounter += 1
      if (i === 2 && zeroBlockCounter === 2) {
        result.push(getDigitUnit(i + 1, zeroBlockCounter))
      }
    } else if (blocks[i] !== '') {
      zeroBlockCounter = 0
      result.push(convertThreeDigitBlock(blocks[i]))
      const digitUnit = getDigitUnit(i, zeroBlockCounter)
      if (digitUnit && digitUnit !== 'x') result.push(digitUnit)
    }
  }
  if (currency) result.push(currency)
  return capitalizeFirstLetter(result.join(' '))
}

const capitalizeFirstLetter = (str) => {
  if (!str) return ''
  const capitalized = str.charAt(0).toUpperCase() + str.slice(1)
  return capitalized.endsWith('.') ? capitalized : capitalized + '.'
}

export { toVietnamese }
