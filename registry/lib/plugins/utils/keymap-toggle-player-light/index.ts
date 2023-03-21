import { KeyBindingAction } from 'registry/lib/components/utils/keymap/bindings'
import { PluginMetadata } from '@/plugins/plugin'
import { toggleLight } from '@/components/video/player-light'

export const plugin: PluginMetadata = {
  name: 'keymap.actions.togglePlayerLight',
  displayName: '快捷键扩展 - 开关灯',
  description: '在快捷键的动作列表里添加一个 "开关灯".',
  setup: ({ addData }) => {
    addData('keymap.actions', (actions: Record<string, KeyBindingAction>) => {
      actions.togglePlayerLight = {
        displayName: '开关灯',
        run: async () => {
          toggleLight()
        },
      }
    })
    addData('keymap.presets', (presetBase: Record<string, string>) => {
      presetBase.togglePlayerLight = 'shift l'
    })
  },
}
