import { ComponentMetadata } from '@/components/types'
import { hasVideo } from '@/core/spin-query'

export const component: ComponentMetadata = {
  name: 'playMpv',
  displayName: 'MPV播放',
  description: '在功能面板中添加MPV播放支持。需本地程序设置支持。配置方法详见：https://github.com/diannaojiang/Bilibili-Playin-Mpv',
  entry: none,
  reload: none,
  unload: none,
  widget: {
    component: () => import('./Widget.vue').then(m => m.default),
    condition: () => hasVideo(),
  },
  tags: [
    componentsTags.video,
  ],
  options: {
    basicConfig: {
      defaultValue: {},
      displayName: '基础配置',
      hidden: true,
    },
  },
  // plugin,
}
