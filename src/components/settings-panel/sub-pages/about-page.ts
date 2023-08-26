import { registerAndGetData } from '@/plugins/data'

export interface AboutPageAction {
  icon: string
  iconSize?: number
  disabled?: boolean
  name: string
  displayName: string
  actionName?: string
  run: (event?: MouseEvent) => void | Promise<void>
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
      DownloadPackage.single('settings.json', JSON.stringify(settings, undefined, 2))
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
