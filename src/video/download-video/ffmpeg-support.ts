import { RawItem } from './batch-download'

export const getFragmentsList = (count: number, originalTitle: string, extensions: string[]) => {
  if (count < 2) {
    return null
  }
  const names = []
  for (let index = 1; index <= count; index++) {
    let indexNumber = ` - ${index}`
    if (extensions.includes('.m4a')) {
      indexNumber = ''
    }
    names.push(escapeFilename(`file '${originalTitle}${indexNumber}${extensions[index - 1]}'`))
  }
  return names.join('\n')
}
export const getBatchFragmentsList = (items: RawItem[], extensions: string[]) => {
  const multipleFragments = (item: RawItem) => item.fragments.length > 1
  const fragmentsItems = items.filter(multipleFragments)
  if (fragmentsItems.length === 0) {
    return null
  }
  const names = new Map<string, string>()
  fragmentsItems.forEach(item => {
    names.set(escapeFilename(`ffmpeg-files-${item.title}.txt`), item.fragments.map((_, index) => {
      return escapeFilename(`file '${item.title} - ${index + 1}${extensions[index]}'`)
    }).join('\n'))
  })
  return names
}
export const getBatchEpisodesList = (items: RawItem[], extensions: string[]) => {
  const names: string[] = []
  items.forEach(item => {
    item.fragments.forEach((_, index) => {
      let indexNumber = ''
      if (item.fragments.length > 1 && !extensions.includes('.m4a')) {
        indexNumber = ` - ${index + 1}`
      }
      names.push(escapeFilename(`file '${item.title}${indexNumber}${extensions[index]}'`))
    })
  })
  return names.join('\n')
}
export default {
  export: {
    getFragmentsList,
    getBatchFragmentsList,
    getBatchEpisodesList,
  },
}