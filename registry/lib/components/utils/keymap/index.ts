import { styledComponentEntry } from '@/components/styled-component'
import { ComponentEntry, ComponentMetadata } from '@/components/types'
import { cheeseUrls, mediaListUrls, videoAndBangumiUrls } from '@/core/utils/urls'
import { addComponentListener } from '@/core/settings'
import { actions } from './actions'
import { KeyBinding, KeyBindingConfig, loadKeyBindings } from './bindings'
import { presetBase, presets } from './presets'
import description from './desc.md'

let config: KeyBindingConfig = null
const parseBindings = (bindings: Record<string, string>) => (
  Object.entries(bindings).map(([actionName, keyString]) => {
    const keys = keyString.split(' ').filter(it => it !== '')
    return {
      keys,
      action: actions[actionName] || none,
    } as KeyBinding
  })
)
const entry: ComponentEntry = styledComponentEntry(() => import('./playback-tip.scss'), async ({ settings }) => {
  const update = () => {
    const presetName = settings.options.preset
    const preset = presets[presetName] || {}
    const bindings = parseBindings(
      { ...presetBase, ...preset, ...settings.options.customKeyBindings },
    )
    if (config) {
      config.bindings = bindings
    } else {
      config = loadKeyBindings(bindings)
    }
  }

  addComponentListener('keymap.preset', update, true)
  addComponentListener('keymap.customKeyBindings', update)
})
export const component: ComponentMetadata = {
  name: 'keymap',
  displayName: '快捷键扩展',
  tags: [
    componentsTags.video,
    componentsTags.utils,
  ],
  urlInclude: [
    ...videoAndBangumiUrls,
    ...cheeseUrls,
    ...mediaListUrls,
  ],
  entry,
  unload: () => { config && (config.enable = false) },
  reload: () => { config && (config.enable = true) },
  enabledByDefault: true,
  description: {
    'zh-CN': description,
  },
  extraOptions: () => import('./settings/ExtraOptions.vue').then(m => m.default),
  options: {
    longJumpSeconds: {
      defaultValue: 85,
      displayName: '长跳跃秒数',
    },
    customKeyBindings: {
      defaultValue: {},
      displayName: '自定义键位',
      hidden: true,
    },
    preset: {
      defaultValue: 'Default',
      displayName: '预设',
      hidden: true,
    },
  },
}
