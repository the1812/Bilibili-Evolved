import { ComponentEntry } from '@/components/types'
import { defineComponentMetadata } from '@/components/define'

const entry: ComponentEntry = async ({ settings }) => {
  if (settings.options.page) {
    const { select } = await import('@/core/spin-query')
    const { childList } = await import('@/core/observer')
    const { getWatchlaterList } = await import('@/components/video/watchlater')
    const list = await getWatchlaterList(true)
    const listBox = await select('.watch-later-list .list-box > span')
    if (!listBox) {
      return
    }
    const redirect = (item: Element, index: number) => {
      try {
        const watchlaterItem = list[index]
        const { bvid, cid, pages } = watchlaterItem
        const page = pages.find(p => p.cid === cid)?.page ?? 1
        const url =
          page > 1
            ? `https://www.bilibili.com/video/${bvid}?p=${page}`
            : `https://www.bilibili.com/video/${bvid}`
        const pic = item.querySelector('.av-pic') as HTMLAnchorElement
        pic.target = '_blank'
        pic.href = url
        const title = item.querySelector('.av-about .t') as HTMLAnchorElement
        title.target = '_blank'
        title.href = url
      } catch (error) {
        console.error(`[watchlater redirect] error at index ${index}`, item, error)
      }
    }
    const runRedirect = () => {
      const avItems = listBox.querySelectorAll('.av-item')
      avItems.forEach(redirect)
    }
    childList(listBox, records => {
      records.forEach(record => {
        record.removedNodes.forEach(node => {
          if (node instanceof HTMLElement && !node.classList.contains('itemlist-move')) {
            const index = parseInt(dq(node, '.key').textContent) - 1
            console.log('remove index', index)
            list.splice(index, 1)
          }
        })
      })
      runRedirect()
    })
  }
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
  urlInclude: ['https://www.bilibili.com/watchlater/#/list'],
  tags: [componentsTags.utils, componentsTags.video],
})
