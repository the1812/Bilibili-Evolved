import { KeyBindingAction } from 'registry/lib/components/utils/keymap/bindings'
import { PluginMetadata } from '@/plugins/plugin'

export const plugin: PluginMetadata = {
  name: 'keymap.actions.darkMode',
  displayName: '快捷键扩展 - 夜间模式',
  description: '在快捷键的动作列表里添加一个 "夜间模式", 可以通过快捷键切换夜间模式',
  setup: ({ addData, coreApis: { settings } }) => {
    addData('keymap.actions', (actions: Record<string, KeyBindingAction>) => {
      actions.darkMode = {
        displayName: '夜间模式',
        run: () => {
          const darkMode = settings.getComponentSettings('darkMode')
          darkMode.enabled = !darkMode.enabled
        },
      }
    })
    addData('keymap.presets', (presetBase: Record<string, string>) => {
      presetBase.darkMode = ''
    })
  },
}
