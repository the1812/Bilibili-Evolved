import { PluginMetadata } from '@/plugins/plugin'
import type { KeyBindingAction } from '../../../components/utils/keymap/bindings'

export const plugin: PluginMetadata = {
  name: 'keymap.actions.empty',
  displayName: '快捷键扩展 - 无动作',
  setup: ({ addData }) => {
    addData('keymap.actions', (actions: Record<string, KeyBindingAction>) => {
      actions.empty = {
        displayName: '无动作',
        prevent: true,
        run: none,
      }
    })
    addData('keymap.presets', (presetBase: Record<string, string>) => {
      presetBase.empty = ''
    })
  },
}
