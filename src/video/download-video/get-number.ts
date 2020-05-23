export const getNumber = (n: number, count: number) => {
  const finalCount = Math.max(2, Math.trunc(Math.log10(count) + 1))
  return n.toString().padStart(finalCount, '0')
}
export default {
  export: {
    getNumber,
  }
}