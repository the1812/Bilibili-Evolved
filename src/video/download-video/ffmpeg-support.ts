import { RawItem } from './batch-download'

const dashExtensions = ['.mp4', '.m4a']
const getNumber = (n: number, count: number) => {
  const finalCount = Math.max(2, Math.trunc(Math.log10(count) + 1))
  return n.toString().padStart(finalCount, '0')
}
/**
 * 获取分段列表
 * @param count 总数量
 * @param originalTitle 标题
 * @param extensions 扩展名
 */
export const getFragmentsList = (count: number, originalTitle: string, extensions: string[]) => {
  if (count < 2) {
    return null
  }
  const names = []
  for (let index = 1; index <= count; index++) {
    let indexNumber = ` - ${getNumber(index, count)}`
    if (extensions.includes('.m4a')) {
      indexNumber = ''
    }
    const filename = escapeFilename(`${originalTitle}${indexNumber}${extensions[index - 1]}`).replace(/'/g, "'\\''")
    names.push(`file '${filename}'`)
  }
  return names.join('\n')
}
/**
 * 获取批量分段列表
 * @param items 批量视频数组
 * @param extensionOrDash 扩展名, 或传入`true`表示为DASH格式
 */
export const getBatchFragmentsList = (items: RawItem[], extensionOrDash: string | boolean) => {
  const multipleFragments = (item: RawItem) => item.fragments.length > 1
  const fragmentsItems = items.filter(multipleFragments)
  if (fragmentsItems.length === 0) {
    return null
  }
  const names = new Map<string, string>()
  fragmentsItems.forEach(item => {
    names.set(escapeFilename(`ffmpeg-files-${item.title}.txt`), item.fragments.map((_, index) => {
      let indexNumber = ` - ${getNumber(index + 1, fragmentsItems.length)}`
      if (extensionOrDash === true) {
        indexNumber = ''
      }
      const filename = escapeFilename(`${item.title}${indexNumber}${extensionOrDash === true ? dashExtensions[index] : extensionOrDash}`).replace(/'/g, "'\\''")
      return `file '${filename}'`
    }).join('\n'))
  })
  return names
}
/**
 * 获取批量选集列表
 * @param items 批量视频数组
 * @param extensionOrDash 扩展名, 或传入`true`表示为DASH格式
 */
export const getBatchEpisodesList = (items: RawItem[], extensionOrDash: string | boolean) => {
  const names: string[] = []
  items.forEach(item => {
    item.fragments.forEach((_, index) => {
      let indexNumber = ''
      if (item.fragments.length > 1 && extensionOrDash !== true) {
        indexNumber = ` - ${getNumber(index + 1, item.fragments.length)}`
      }
      const filename = escapeFilename(`${item.title}${indexNumber}${extensionOrDash === true ? dashExtensions[index] : extensionOrDash}`).replace(/'/g, "'\\''")
      names.push(`file '${filename}'`)
    })
  })
  return names.join('\n')
}
/**
 * 获取合并命令
 * @param item 视频信息
 * @param extensionOrDash 扩展名, 或传入`true`表示为DASH格式
 */
export const getFragmentsMergeScript = (item: RawItem, extensionOrDash: string | boolean) => {
  if (extensionOrDash !== true) {
    const input = `concat:${item.fragments.map((_, index) => {
      let indexNumber = ''
      if (item.fragments.length > 1) {
        indexNumber = ` - ${getNumber(index + 1, item.fragments.length)}`
      }
      const filename = escapeFilename(`${item.title}${indexNumber}${extensionOrDash}`)
        .replace(/'/g, "'\\''")
      return filename
    }).join('|')}`
    return `ffmpeg -i "${input}" -c copy "${item.title}.mp4"`
  } else {
    const command = `ffmpeg -i "${item.title}.mp4" -i "${item.title}.m4a" -c copy "${item.title}.mp4"`.replace(/'/g, "'\\''")
    return command
  }
}
/**
 * 获取批量选集合并命令
 * @param items 批量视频数组
 * @param extensionOrDash 扩展名, 或传入`true`表示为DASH格式
 */
export const getBatchMergeScript = (items: RawItem[], extensionOrDash: string | boolean) => {
  return items.map(it => getFragmentsMergeScript(it, extensionOrDash)).join('\n')
}

export default {
  export: {
    getFragmentsList,
    getBatchFragmentsList,
    getBatchEpisodesList,
    getFragmentsMergeScript,
    getBatchMergeScript,
  },
}