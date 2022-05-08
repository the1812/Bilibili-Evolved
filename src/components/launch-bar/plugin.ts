import { KeyBindingAction } from 'registry/lib/components/utils/keymap/bindings'
import { PluginMetadata } from '@/plugins/plugin'

export const plugin: PluginMetadata = {
  name: 'launchBar.plugin',
  displayName: '搜索栏 - 快捷键支持',
  setup: ({ addData }) => {
    addData('keymap.actions', (actions: Record<string, KeyBindingAction>) => {
      actions.showLaunchBar = {
        displayName: '显示搜索栏',
        run: async () => {
          const { toggleLaunchBar } = await import('./toggle')
          toggleLaunchBar()
          return true
        },
      }
    })
    addData('keymap.presets', (presetBase: Record<string, string>) => {
      presetBase.showLaunchBar = '/'
    })
  },
}
