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
      const { meta } = await import('@/core/meta')
      const { Toast } = await import('@/core/toast')

      const version = meta.compilationInfo.versionWithTag.replace(/-.*/, '')
      const now = new Date()
      const pad = (value: number) => String(value).padStart(2, '0')
      const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
      const time = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`

      const fileName = `${meta.name}_${version}_${date}_${time}.json`
      const content = JSON.stringify(settings, undefined, 2)

      const defaultDownload = async () => {
        // 兼容不支持 File System Access API 的浏览器
        const { DownloadPackage } = await import('@/core/download')
        DownloadPackage.single(fileName, content)
      }

      if ('showSaveFilePicker' in unsafeWindow) {
        try {
          const handle = await unsafeWindow.showSaveFilePicker({
            suggestedName: fileName,
            types: [
              {
                description: 'JSON 文件',
                accept: {
                  'application/json': ['.json'],
                },
              },
            ],
          })

          const writable = await handle.createWritable()
          await writable.write(content)
          await writable.close()
        } catch (e) {
          if (String(e).includes('AbortError')) {
            return
          }
          Toast.error('自定义导出失败, 已使用浏览器默认方式导出。', '导出设置')
          console.error(e)
          await defaultDownload()
        }
      } else {
        await defaultDownload()
      }
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
