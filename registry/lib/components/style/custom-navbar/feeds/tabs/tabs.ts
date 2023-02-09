import { defineAsyncComponent } from 'vue'
import type { TabMappings } from '@/ui/tab-mapping'

export const tabs: TabMappings = [
  {
    name: 'video',
    displayName: '视频',
    component: defineAsyncComponent(() => import('./VideoFeeds.vue')),
    activeLink: 'https://t.bilibili.com/?tab=8',
    count: 0,
  },
  {
    name: 'bangumi',
    displayName: '番剧',
    component: defineAsyncComponent(() => import('./BangumiFeeds.vue')),
    activeLink: 'https://t.bilibili.com/?tab=512,4097,4098,4099,4100,4101',
    count: 0,
  },
  {
    name: 'column',
    displayName: '专栏',
    component: defineAsyncComponent(() => import('./ColumnFeeds.vue')),
    activeLink: 'https://t.bilibili.com/?tab=64',
    count: 0,
  },
  {
    name: 'live',
    displayName: '直播',
    component: defineAsyncComponent(() => import('./LiveFeeds.vue')),
    activeLink: 'https://link.bilibili.com/p/center/index#/user-center/follow/1',
    count: 0,
  },
]
