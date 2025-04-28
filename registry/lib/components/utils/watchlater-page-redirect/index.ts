import { ComponentEntry } from '@/components/types'
import { defineComponentMetadata } from '@/components/define'

const getBvidFromWatcherLaterVideoPage = () => {
  const { pathname, search } = window.location
  const oidAndBvid = search.match(/\?oid=(\d+)&bvid=(\w+)/) ?? []

  if (pathname === '/list/watchlater' && oidAndBvid.length === 3) {
    return oidAndBvid[2]
  }

  return null
}

const entry: ComponentEntry = async () => {
  // 判断是否是稍后再看链接格式的视频页面，如果是则重定向
  const bvid = getBvidFromWatcherLaterVideoPage()

  if (bvid) {
    location.href = `https://www.bilibili.com/video/${bvid}`
  }
}

export const component = defineComponentMetadata({
  name: 'watchlaterPageRedirect',
  displayName: '稍后再看页面-重定向',
  entry,
  author: {
    name: 'magicFeirl',
    link: 'https://github.com/magicFeirl',
  },
  urlInclude: ['https://www.bilibili.com/list/watchlater'],
  tags: [componentsTags.utils, componentsTags.video],
})
