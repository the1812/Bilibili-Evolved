import { defineComponentMetadata } from '@/components/define'
import { addData } from '@/plugins/data'
import { AboutPageAction } from '@/components/settings-panel/sub-pages/about-page'
import { runMigrate } from './migrate'

export const component = defineComponentMetadata({
  name: 'v1Migrate',
  displayName: 'v1 设置迁移',
  description: {
    'zh-CN':
      '在设置的 `关于` 面板中添加 `导入 v1 设置` 按钮, 点击导入可以导入 v1 的设置, 并根据打开的选项自动下载安装 v2 中对应的功能.',
  },
  tags: [componentsTags.utils],
  entry: () => {
    addData('settingsPanel.about.actions', (actions: AboutPageAction[]) => {
      actions.push({
        icon: 'mdi-inbox-arrow-down-outline',
        name: 'importV1Settings',
        displayName: '导入 v1 设置',
        run: async () => {
          const { logError } = await import('@/core/utils/log')
          const { pickFile } = await import('@/core/file-picker')
          const files = await pickFile({
            accept: '*.json',
          })
          if (files.length === 0) {
            return
          }
          const [file] = files
          try {
            const settings = JSON.parse(await file.text())
            await runMigrate(settings)
          } catch (error) {
            logError(error)
          }
        },
      })
    })
  },
})
