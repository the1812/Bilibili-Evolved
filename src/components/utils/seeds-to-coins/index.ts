import { ComponentMetadata, componentsTags } from '@/components/component'
import { none } from '@/core/utils'

export const component: ComponentMetadata = {
  name: 'seedsToCoins',
  displayName: '瓜子换硬币',
  description: {
    'zh-CN': '在附加功能中添加`瓜子换硬币`的按钮, 点击可以将700银瓜子换成1个硬币, 每天限1次.',
  },
  widget: {
    component: () => import('./SeedsToCoins.vue').then(m => m.default),
  },
  enabledByDefault: false,
  entry: none,
  reload: none,
  unload: none,
  tags: [
    componentsTags.utils,
  ],
}
