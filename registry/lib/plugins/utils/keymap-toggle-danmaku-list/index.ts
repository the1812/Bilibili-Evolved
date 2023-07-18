import { KeyBindingAction } from 'registry/lib/components/utils/keymap/bindings'
import { PluginMetadata } from '@/plugins/plugin'

export const plugin: PluginMetadata = {
  name: 'keymap.actions.toggleDanmakuList',
  displayName: '快捷键扩展 - 开关弹幕列表',
  description: '在快捷键的动作列表里添加一个 "开关弹幕列表".',
  setup: ({ addData }) => {
    addData('keymap.actions', (actions: Record<string, KeyBindingAction>) => {
      actions.toggleDanmakuList = {
        displayName: '开关弹幕列表',
        run: async () => {
          const button = dq('.bui-collapse-header') as HTMLDivElement
          button?.click()
          return button
        },
      }
    })
    addData(
      'keymap.presets',
      (
        presetBase: Record<string, string>,
        builtInPresets: Record<string, Record<string, string>>,
      ) => {
        presetBase.toggleDanmakuList = 'shift d'
        builtInPresets.HTML5Player.toggleDanmakuList = ''
        builtInPresets.PotPlayer.toggleDanmakuList = ''
      },
    )
  },
}
