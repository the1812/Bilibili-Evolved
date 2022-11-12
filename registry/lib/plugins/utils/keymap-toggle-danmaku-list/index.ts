import { KeyBindingAction } from 'registry/lib/components/utils/keymap/bindings'
import { PluginMetadata } from '@/plugins/plugin'
import { select } from '@/core/spin-query'

export const plugin: PluginMetadata = {
  name: 'keymap.actions.toggleDanmakuList',
  displayName: '快捷键扩展 - 开关弹幕列表',
  description: '在快捷键的动作列表里添加一个 "开关弹幕列表".',
  setup: ({ addData }) => {
    addData('keymap.actions', (actions: Record<string, KeyBindingAction>) => {
      actions.toggleDanmakuList = {
        displayName: '开关弹幕列表',
        prevent: true,
        run: async () => {
          const button = (await select('.bui-collapse-header')) as HTMLDivElement
          button?.click()
        },
      }
    })
    addData('keymap.presets', (presetBase: Record<string, string>) => {
      presetBase.toggleDanmakuList = 'shift d'
    })
  },
}
