import { Executable, VueModule } from '@/core/common-types'
import { PluginMetadata } from '@/plugins/plugin'

export const plugin: PluginMetadata = {
  name: 'vLoading.reimu',
  displayName: '加载提示 - 灵梦油库里',
  description:
    '用灵梦油库里代替脚本的所有 "加载中" 提示, 油库里素材来自[东方我乐多从志](https://cn.touhougarakuta.com/).',
  setup: ({ addData }) => {
    addData('vLoading', (config: { content: Executable<VueModule> | string }) => {
      config.content = () => import('./ReimuLoading.vue').then(m => m.default)
    })
  },
}
