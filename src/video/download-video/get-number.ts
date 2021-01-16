/**
 * count item
 * 
 * @param n - current index
 * @param count - the end of the count
 * @param raw - default title
 * @returns expected number
 */
export const getNumber = (n: number, count: number, raw?: string) => {
  const finalCount = Math.max(2, Math.trunc(Math.log10(count) + 1))

  // n is not a Number
  if (Number.isNaN(n) && raw) {
    return raw
  }

  return n.toString().padStart(finalCount, '0')
}
export default {
  export: {
    getNumber,
  }
}