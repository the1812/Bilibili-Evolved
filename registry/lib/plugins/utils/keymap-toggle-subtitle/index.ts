import { PluginMetadata } from '@/plugins/plugin'
import { playerAgent } from '@/components/video/player-agent'
import type { Options as KeymapOptions } from '../../../components/utils/keymap'
import type { KeyBindingAction } from '../../../components/utils/keymap/bindings'

export const plugin: PluginMetadata = {
  name: 'keymap.actions.toggleSubtitle',
  displayName: '快捷键扩展 - 开关 CC 字幕',
  setup: ({ addData, coreApis: { settings } }) => {
    addData('keymap.actions', (actions: Record<string, KeyBindingAction>) => {
      actions.toggleSubtitle = {
        displayName: '开关 CC 字幕',
        run: async ({ showTip }) => {
          const { subtitleLanguagePreference } =
            settings.getComponentSettings<KeymapOptions>('keymap').options
          const { result } = playerAgent.toggleSubtitle(subtitleLanguagePreference.trim())
          if (result === 'no-subtitle-configured') {
            showTip('当前视频没有可选字幕', 'mdi-subtitles')
          }
        },
      }
    })
    addData(
      'keymap.presets',
      (
        presetBase: Record<string, string>,
        builtInPresets: Record<string, Record<string, string>>,
      ) => {
        presetBase.toggleSubtitle = 'shift c'
        builtInPresets.YouTube.toggleSubtitle = 'c'
        builtInPresets.YouTube.coin = ''
        builtInPresets.PotPlayer.toggleSubtitle = 'alt h'
      },
    )
  },
}
