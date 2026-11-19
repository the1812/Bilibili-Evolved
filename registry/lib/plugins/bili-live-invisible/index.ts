import type { PluginMetadata } from '@/plugins/plugin'
import { installBiliLiveInvisible } from './interceptor'

export const plugin: PluginMetadata = {
  name: 'biliLiveInvisible',
  displayName: '直播隐身观看',
  author: [
    { name: 'xly2333', link: 'https://github.com/xly2333' },
  ],
  setup: () => {
    installBiliLiveInvisible()
  },
}
