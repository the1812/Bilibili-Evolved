import { Executable, VueModule } from '@/core/common-types'
import { PluginMetadata } from '@/plugins/plugin'

export const plugin: PluginMetadata = {
  name: 'vLoading.reimu',
  displayName: '加载提示 - 灵梦油库里',
  setup: ({ addData }) => {
    addData('vLoading', (config: { content: Executable<VueModule> | string }) => {
      config.content = () => import('./ReimuLoading.vue').then(m => m.default)
    })
  },
}
