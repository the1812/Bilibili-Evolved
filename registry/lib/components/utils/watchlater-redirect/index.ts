import { ComponentEntry } from '@/components/types'
import { defineComponentMetadata } from '@/components/define'
import type { RawWatchlaterItem } from '@/components/video/watchlater'

const getBvidFromElement = (element: Element) => {
  const pic = element.querySelector('.av-pic, .bili-cover-card') as HTMLAnchorElement
  const bvid = pic.href.match(/bvid=([^&]+)/)?.[1]
  return bvid
}

const isRedirected = (element: Element) => {
  const pic = element.querySelector('.av-pic, .bili-cover-card') as HTMLAnchorElement
  return /video\/BV/.test(pic.href)
}

const redirect = (element: Element, watchlaterItem: RawWatchlaterItem) => {
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
      '.av-about .t, .bili-video-card__title a, .video-card__right .title',
    ) as HTMLAnchorElement
    title.target = '_blank'
    title.href = url
  } catch (error) {
    console.error(`[watchlater redirect] error at ${watchlaterItem.bvid}`, element, error)
  }
}

const entry: ComponentEntry = async ({ settings }) => {
  if (!settings.options.page) {
    return
  }
  const { select } = await import('@/core/spin-query')
  const { childListSubtree } = await import('@/core/observer')
  const { getWatchlaterList } = await import('@/components/video/watchlater')
  const { useScopedConsole } = await import('@/core/utils/log')
  const console = useScopedConsole('稍后再看重定向')
  const list: RawWatchlaterItem[] = await getWatchlaterList(true)
  const listContainer = await select('.watch-later-list .list-box > span, .watchlater-list')
  if (!listContainer) {
    return
  }

  const tryRedirect = (element: Element) => {
    if (isRedirected(element)) {
      return
    }
    const bvid = getBvidFromElement(element)
    if (bvid === undefined) {
      console.warn('bvid not found for', element.outerHTML)
      return
    }
    const listItem = list.find(it => it.bvid === bvid)
    if (listItem === undefined) {
      console.warn('bvid no match for', bvid)
      return
    }
    console.log('redirect for', bvid)
    redirect(element, listItem)
  }

  const runRedirect = lodash.debounce(() => {
    const videoCards = listContainer.querySelectorAll('.av-item, .video-card')
    console.log('run redirect, length =', videoCards.length)
    videoCards.forEach(card => {
      tryRedirect(card)
    })
  }, 200)

  runRedirect()
  childListSubtree(listContainer, async records => {
    records.forEach(r => {
      const hasVideoCardChange = [...r.addedNodes].some(
        node =>
          node instanceof HTMLElement &&
          ['bili-video-card__wrap', 'video-card', 'watchlater-list-container'].some(value =>
            node.classList.contains(value),
          ),
      )
      // console.log({ nodes: r.addedNodes, hasVideoCardChange })
      if (hasVideoCardChange) {
        runRedirect()
      }
    })
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
