import { LaunchBarActionProvider } from '@/components/launch-bar/launch-bar-action'
import { styledComponentEntry } from '@/components/styled-component'
import {
  defineComponentMetadata,
  defineOptionsMetadata,
  OptionsOfMetadata,
} from '@/components/define'
import { addComponentListener } from '@/core/settings'
import { actions } from './actions'
import { KeyBinding, KeyBindingConfig, loadKeyBindings } from './bindings'
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
let config: KeyBindingConfig = null
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
    const update = () => {
      const presetName = settings.options.preset
      const preset = presets[presetName] || {}
      const bindings = parseBindings({
        ...presetBase,
        ...preset,
        ...settings.options.customKeyBindings,
      })
      if (config) {
        config.bindings = bindings
      } else {
        config = loadKeyBindings(bindings)
      }
    }

    addComponentListener('keymap.preset', update, true)
    addComponentListener('keymap.customKeyBindings', update)
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
  description: {
    'zh-CN': '为脚本的功能和 b 站的功能启用键盘快捷键支持, 快捷键列表可在`快捷键设置`中查看和配置.',
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
