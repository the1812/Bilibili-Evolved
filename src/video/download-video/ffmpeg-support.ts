export const getFragmentsList = (count: number, originalTitle: string, extension: string) => {
  if (count < 2) {
    return null
  }
  let names = []
  for (let index = 1; index <= count; index++) {
    names.push(`file '${originalTitle} - ${index}${extension}'`)
  }
  return names.join('\n')
}
export default {
  export: {
    getFragmentsList,
  },
}