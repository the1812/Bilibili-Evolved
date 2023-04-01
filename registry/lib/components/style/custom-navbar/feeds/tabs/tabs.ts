import { TabMappings } from '@/ui/tab-mapping'

export const tabs: TabMappings = [
  {
    name: 'video',
    displayName: '视频',
    component: () => import('./VideoFeeds.vue').then(m => m.default),
    activeLink: 'https://t.bilibili.com/?tab=video',
    count: 0,
  },
  {
    name: 'bangumi',
    displayName: '番剧',
    component: () => import('./BangumiFeeds.vue').then(m => m.default),
    activeLink: 'https://t.bilibili.com/?tab=pgc',
    count: 0,
  },
  {
    name: 'column',
    displayName: '专栏',
    component: () => import('./ColumnFeeds.vue').then(m => m.default),
    activeLink: 'https://t.bilibili.com/?tab=article',
    count: 0,
  },
  {
    name: 'live',
    displayName: '直播',
    component: () => import('./LiveFeeds.vue').then(m => m.default),
    activeLink: 'https://link.bilibili.com/p/center/index#/user-center/follow/1',
    count: 0,
  },
]
