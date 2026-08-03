import { registerAndGetData } from '@/plugins/data'
import { getGeneralSettings } from '@/core/settings'

export interface AboutPageAction {
  icon: string
  iconSize?: number
  disabled?: boolean
  name: string
  displayName: string
  actionName?: string
  run: (event?: MouseEvent) => void | Promise<void>
}

export const getFormatStr = async (format: string) => {
  const { meta } = await import('@/core/meta')
  const time = new Date()
  const formatMap = {
    'M+': time.getMonth() + 1, // 月
    'd+': time.getDate(), // 日
    'h+': time.getHours(), // 时
    'm+': time.getMinutes(), // 分
    's+': time.getSeconds(), // 秒
    'q+': Math.floor((time.getMonth() + 3) / 3), // 季度
  }
  const constMap = {
    '/n': meta.name, // 组件名
    '/v': `v${meta.compilationInfo.version}`,
    '/V': meta.compilationInfo.versionWithTag,
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

export const builtInActions: AboutPageAction[] = [
  {
    icon: 'mdi-inbox-arrow-up-outline',
    name: 'exportSettings',
    displayName: '导出设置',
    actionName: 'Export Settings',
    run: async () => {
      const { settings } = await import('@/core/settings')
      const { DownloadPackage } = await import('@/core/download')
      const fileName = await getFormatStr(getGeneralSettings().exportSettingsFormat)
      DownloadPackage.single(`${fileName}.json`, JSON.stringify(settings, undefined, 2))
    },
  },
  {
    icon: 'mdi-inbox-arrow-down-outline',
    name: 'importSettings',
    displayName: '导入设置',
    actionName: 'Import Settings',
    run: async () => {
      const { logError } = await import('@/core/utils/log')
      const { pickFile } = await import('@/core/file-picker')
      const { Toast } = await import('@/core/toast')
      const files = await pickFile({
        accept: '*.json',
      })
      if (files.length === 0) {
        return
      }
      const [file] = files
      try {
        const settings = JSON.parse(await file.text())
        Object.entries(settings).forEach(([key, value]) => {
          GM_setValue(key, value)
        })
        Toast.success('导入成功, 正在刷新页面...', '导入设置')
        window.location.reload()
      } catch (error) {
        logError(error)
      }
    },
  },
]
export const [aboutPageActions] = registerAndGetData('settingsPanel.about.actions', builtInActions)
