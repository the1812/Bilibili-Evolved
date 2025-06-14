import { ComponentMetadata } from '@/components/types'

/**
 * 视频播放器变化接口
 * 提供视频播放器设置变更和URL变更时的处理方法
 */
export interface Video {
  console: any
  metadata: ComponentMetadata

  /**
   * 处理设置变更事件
   * @param metadata 组件元数据
   * @param setting 变更的设置值
   * @param oldSetting 变更前的设置值(可选)
   */
  settingChange(metadata: ComponentMetadata, setting: string, oldSetting?: string): void

  /**
   * 处理URL变更事件
   * @param metadata 组件元数据
   */
  urlChange(metadata: ComponentMetadata): void
}

export const getFormatStr = (time: Date, format: string, upName: string) => {
  const formatMap = {
    'M+': time.getMonth() + 1, // 月
    'd+': time.getDate(), // 日
    'h+': time.getHours(), // 时
    'm+': time.getMinutes(), // 分
    's+': time.getSeconds(), // 秒
    'q+': Math.floor((time.getMonth() + 3) / 3), // 季度
  }
  const constMap = {
    up: upName, // up名
    '\\\\r': '\r', // 回车符
    '\\\\n': '\n', // 换行符
    '\\\\t': '\t', // 制表符
  }
  // 处理年份
  let matchResult: RegExpMatchArray | null = format.match(/(y+)/)
  if (matchResult !== null) {
    format = format.replace(
      matchResult[0],
      `${time.getFullYear()}`.substring(4 - matchResult[0].length),
    )
  }
  // 处理除年份外的时间
  for (const key in formatMap) {
    if (!key) {
      continue
    }
    matchResult = format.match(new RegExp(`(${key})`))
    if (matchResult !== null) {
      format = format.replace(
        matchResult[0],
        matchResult[0].length === 1
          ? formatMap[key]
          : `00${formatMap[key]}`.substring(`${formatMap[key]}`.length),
      )
    }
  }
  // 处理自定义替换文本
  for (const key in constMap) {
    if (!key) {
      continue
    }
    matchResult = format.match(new RegExp(`(${key})`))
    if (matchResult !== null) {
      format = format.replace(matchResult[0], constMap[key])
    }
  }
  return format
}
