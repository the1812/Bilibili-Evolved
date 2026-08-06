import { registerAndGetData } from '@/plugins/data'
import { getGeneralSettings } from '@/core/settings'
import { formatTitle } from '@/core/utils/title'

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
  const variables = {
    n: meta.name,
    v: `v${meta.compilationInfo.version}`,
    V: meta.compilationInfo.versionWithTag,
    y: time.getFullYear().toString(),
    M: (time.getMonth() + 1).toString().padStart(2, '0'),
    d: time.getDate().toString().padStart(2, '0'),
    h: time.getHours().toString().padStart(2, '0'),
    m: time.getMinutes().toString().padStart(2, '0'),
    s: time.getSeconds().toString().padStart(2, '0'),
    ms: time.getMilliseconds().toString().substring(0, 3),
  }
  return formatTitle(format, false, variables, Object.keys(variables))
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
