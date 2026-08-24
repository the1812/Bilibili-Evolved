import { defineComponentMetadata } from '@/components/define'
import { addData } from '@/plugins/data'
import { AboutPageAction } from '@/components/settings-panel/sub-pages/about-page'
import { runMigrate } from './migrate'

export const component = defineComponentMetadata({
  name: 'v1Migrate',
  displayName: 'v1 设置迁移',
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
