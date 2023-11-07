import { defineAsyncComponent } from 'vue'

import { defineComponentMetadata } from '@/components/define'

export const component = defineComponentMetadata({
  name: 'downloadLiveRecords',
  displayName: '直播录像下载',
  description: {
    'zh-CN': '在直播录像页面 `live.bilibili.com/record/` 中添加下载支持.',
  },
  tags: [componentsTags.live],
  entry: none,
  widget: {
    component: defineAsyncComponent(() => import('./DownloadRecords.vue')),
  },
  urlInclude: [/^https:\/\/live\.bilibili\.com\/record\/(.+)/],
})
