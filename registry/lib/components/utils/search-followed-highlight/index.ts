import { defineComponentMetadata } from '@/components/define'
import { getJsonWithCredentials, getPages } from '@/core/ajax'
import { childListSubtree } from '@/core/observer'
import { select } from '@/core/spin-query'
import { getUID } from '@/core/utils'

const name = 'searchFollowedHighlight'
const displayName = '搜索关注 UP 主高亮'
const authorLinkSelector =
  '.bili-video-card__info--owner[href*="space.bilibili.com/"], .atc-author a[href*="space.bilibili.com/"]'
const cardSelector = '.video-list .bili-video-card, .media-list .b-article-card'
const followedClass = 'be-search-followed-author'
const highlightedClass = 'be-search-followed-highlighted'

const fetchFollowing = async (uid: string) => {
  let total: number | undefined
  const allPages = await getPages<{ mid: number }>({
    api: page =>
      getJsonWithCredentials(
        `https://api.bilibili.com/x/relation/followings?vmid=${uid}&pn=${page}&ps=50`,
      )
        .then(json => json ?? { code: -1 })
        .catch(error => ({ code: -1, message: String(error) })),
    getList: json => (json.code === 0 && Array.isArray(json.data?.list) ? json.data.list : []),
    getTotal: json => {
      const count = json.code === 0 ? json.data?.total : undefined
      if (Number.isSafeInteger(count) && count >= 0) {
        total = count
      }
      return total ?? 0
    },
  })
  const following = new Set(allPages.map(user => user.mid))
  if (following.size !== total) {
    throw new Error('关注列表 UID 数量与总数不符')
  }
  return following
}

const update = (container: Element, following: ReadonlySet<number>) => {
  container.querySelectorAll(cardSelector).forEach(card => {
    const authorLink = card.querySelector<HTMLAnchorElement>(authorLinkSelector)
    const mid = authorLink?.href.match(/space\.bilibili\.com\/(\d+)/)?.[1]
    const followed = mid !== undefined && following.has(Number(mid))
    authorLink?.classList.toggle(followedClass, followed)
    card.classList.toggle(highlightedClass, followed)
  })
}

const entry = async () => {
  const uid = getUID()
  if (!uid) {
    return
  }
  const container = await select('.search-content')
  if (!container) {
    return
  }
  const following = await fetchFollowing(uid).catch(error => {
    console.warn(`${displayName}: 无法读取完整关注列表`, error)
    return undefined
  })
  if (!following) {
    return
  }
  let frame: number | undefined
  childListSubtree(container, () => {
    if (frame !== undefined) {
      return
    }
    frame = window.requestAnimationFrame(() => {
      frame = undefined
      update(container, following)
    })
  })
}

export const component = defineComponentMetadata({
  name,
  displayName,
  author: {
    name: 'WhiteTeal55',
    link: 'https://github.com/WhiteTeal55',
  },
  tags: [componentsTags.utils],
  urlInclude: [/^https:\/\/search\.bilibili\.com\/(all|video|article)/],
  instantStyles: [
    {
      name,
      style: () => import('./search-followed-highlight.scss'),
    },
  ],
  entry,
})
