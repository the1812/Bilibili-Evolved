import { defineComponentMetadata } from '@/components/define'
import { realEntry } from './logic'

export const component = defineComponentMetadata({
  name: 'importSeries',
  author: {
    name: 'aiden',
    link: 'https://github.com/swhoro',
  },
  displayName: '批量导入合集',
  tags: [componentsTags.utils],
  entry: realEntry,
  description: {
    'zh-CN': '在合集页面制作一个批量导入按钮，可以新增所有合集内视频至同名收藏夹',
  },
  urlInclude: [/^https:\/\/space\.bilibili\.com\//],
})
