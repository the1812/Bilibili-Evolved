import { ComponentEntry } from '@/components/types'
import { defineComponentMetadata } from '@/components/define'
import type { RawWatchlaterItem } from '@/components/video/watchlater'

const redirect = (element: Element, watchlaterItem: RawWatchlaterItem, index: number) => {
  try {
    const { bvid, cid, pages } = watchlaterItem
    const page = pages.find(p => p.cid === cid)?.page ?? 1
    const url =
      page > 1
        ? `https://www.bilibili.com/video/${bvid}?p=${page}`
        : `https://www.bilibili.com/video/${bvid}`
    const pic = element.querySelector('.av-pic, .bili-cover-card') as HTMLAnchorElement
    pic.target = '_blank'
    pic.href = url
    const title = element.querySelector(
      '.av-about .t, .bili-video-card__title a',
    ) as HTMLAnchorElement
    title.target = '_blank'
    title.href = url
  } catch (error) {
    console.error(`[watchlater redirect] error at index ${index}`, element, error)
  }
}

const entry: ComponentEntry = async ({ settings }) => {
  if (!settings.options.page) {
    return
  }
  const { select } = await import('@/core/spin-query')
  const { childList } = await import('@/core/observer')
  const { getWatchlaterList } = await import('@/components/video/watchlater')
  let list: RawWatchlaterItem[]
  const reloadList = async () => {
    list = await getWatchlaterList(true)
  }
  const listBox = await select('.watch-later-list .list-box > span, .watchlater-list-container')
  if (!listBox) {
    return
  }

  await reloadList()
  const runRedirect = () => {
    const videoCards = listBox.querySelectorAll('.av-item, .video-card')
    videoCards.forEach((it, index) => redirect(it, list[index], index))
  }
  childList(listBox, async records => {
    if (records.some(r => r.removedNodes.length > 0)) {
      await reloadList()
    }
    runRedirect()
  })
}
export const component = defineComponentMetadata({
  name: 'watchlaterRedirect',
  displayName: '稍后再看重定向',
  entry,
  options: {
    page: {
      displayName: '重定向页面',
      defaultValue: true,
    },
    navbar: {
      displayName: '重定向顶栏',
      defaultValue: true,
    },
  },
  urlInclude: [
    'https://www.bilibili.com/watchlater/#/list',
    'https://www.bilibili.com/watchlater/list#/list',
  ],
  tags: [componentsTags.utils, componentsTags.video],
})
