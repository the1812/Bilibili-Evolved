import { defineComponentMetadata } from '@/components/define'
import { feedsUrls } from '@/core/utils/urls'
import { entry } from './entry'

const author = {
  name: 'WhiteTeal55',
  link: 'https://github.com/WhiteTeal55',
}

export const component = defineComponentMetadata({
  name: 'pgcWatchlater',
  displayName: '番剧动态稍后再看按钮',
  author,
  tags: [componentsTags.feeds, componentsTags.utils],
  entry,
  urlInclude: feedsUrls,
})
