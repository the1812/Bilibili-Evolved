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
  urlInclude: [/^https:\/\/space\.bilibili\.com\//],
})
