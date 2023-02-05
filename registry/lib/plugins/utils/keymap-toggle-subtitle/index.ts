import type { KeyBindingAction } from 'registry/lib/components/utils/keymap/bindings'

import { playerAgent } from '@/components/video/player-agent'
import type { PluginMetadata } from '@/plugins/plugin'

export const plugin: PluginMetadata = {
  name: 'keymap.actions.toggleSubtitle',
  displayName: '快捷键扩展 - 开关 CC 字幕',
  description: '在快捷键的动作列表里添加一个 "开关 CC 字幕".',
  setup: ({ addData }) => {
    addData('keymap.actions', (actions: Record<string, KeyBindingAction>) => {
      actions.toggleSubtitle = {
        displayName: '开关 CC 字幕',
        run: async () => {
          const button = playerAgent.query.control.buttons.subtitle.sync()
          button?.click()
          return button
        },
      }
    })
    addData('keymap.presets', (presetBase: Record<string, string>) => {
      presetBase.toggleSubtitle = 'shift c'
    })
  },
}
