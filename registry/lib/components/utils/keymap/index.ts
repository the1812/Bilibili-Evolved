import { LaunchBarActionProvider } from '@/components/launch-bar/launch-bar-action'
import { styledComponentEntry } from '@/components/styled-component'
import {
  defineComponentMetadata,
  defineOptionsMetadata,
  OptionsOfMetadata,
} from '@/components/define'
import { addComponentListener } from '@/core/settings'
import { actions } from './actions'
import { KeyBinding, KeymapConfig, loadKeymap } from './bindings'
import { presetBase, presets } from './presets'
import { getNumberValidator } from '@/core/utils'

const options = defineOptionsMetadata({
  longJumpSeconds: {
    defaultValue: 85,
    displayName: '长跳跃秒数',
    validator: getNumberValidator(1),
  },
  volumeStep: {
    defaultValue: 10,
    displayName: '音量调整幅度',
    validator: getNumberValidator(1, 100),
  },
  enableLongPressSpeed: {
    defaultValue: true,
    displayName: '长按前进倍速播放',
  },
  showSeekShortcuts: {
    defaultValue: true,
    displayName: '显示百分比跳转快捷键',
  },
  disableBilibiliPlayerShortcuts: {
    defaultValue: false,
    displayName: '屏蔽 B 站播放器原生快捷键',
  },
  subtitleLanguagePreference: {
    defaultValue: '',
    displayName: '字幕语言偏好',
  },
  customKeyBindings: {
    defaultValue: {} as Record<string, string>,
    displayName: '自定义键位',
    hidden: true,
  },
  preset: {
    defaultValue: 'Default',
    displayName: '预设',
    hidden: true,
  },
})
export type Options = OptionsOfMetadata<typeof options>
let config: KeymapConfig = null
const parseBindings = (bindings: Record<string, string>): KeyBinding[] => {
  const parseBinding = (actionName: string, keyString: string) => {
    const keys = keyString.split(' ').filter(it => it !== '')
    return { keys, action: actions[actionName] }
  }
  return Object.entries(bindings).map(([n, k]) => parseBinding(n, k))
}
const entry = styledComponentEntry<Options>(
  () => import('./playback-tip.scss'),
  async ({ settings }) => {
    config = loadKeymap()
    const update = () => {
      const presetName = settings.options.preset
      const preset = presets[presetName] || {}
      const bindings = parseBindings({
        ...presetBase,
        ...preset,
        ...settings.options.customKeyBindings,
      })
      config.bindings = bindings
      config.disableBilibiliPlayerShortcuts = settings.options.disableBilibiliPlayerShortcuts
    }

    addComponentListener('keymap.preset', update, true)
    addComponentListener('keymap.customKeyBindings', update)
    addComponentListener('keymap.disableBilibiliPlayerShortcuts', update)
  },
)
export const component = defineComponentMetadata({
  name: 'keymap',
  displayName: '快捷键扩展',
  tags: [componentsTags.video, componentsTags.utils],
  // urlInclude: [
  //   ...videoAndBangumiUrls,
  //   ...cheeseUrls,
  //   ...mediaListUrls,
  // ],
  entry,
  unload: () => {
    config && (config.enable = false)
  },
  reload: () => {
    config && (config.enable = true)
  },
  extraOptions: () => import('./settings/ExtraOptions.vue').then(m => m.default),
  options,
  plugin: {
    displayName: '快捷键扩展 - 搜索支持',
    setup: ({ addData }) => {
      addData('launchBar.actions', (providers: LaunchBarActionProvider[]) => {
        providers.push({
          name: 'keymapSettings',
          getActions: async () => [
            {
              name: '快捷键扩展设置',
              description: 'Keymap Settings',
              icon: 'mdi-keyboard-settings-outline',
              action: async () => {
                const { toggleKeymapSettings } = await import('./settings/vm')
                toggleKeymapSettings()
              },
            },
          ],
        })
      })
    },
  },
})
