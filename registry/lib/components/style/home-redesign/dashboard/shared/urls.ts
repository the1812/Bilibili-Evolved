import type { TestPattern } from '@/core/common-types'
import { matchPattern } from '@/core/utils'
import { columnUrls, feedsUrls, liveUrls, playerUrls } from '@/core/utils/urls'
import { homeUrls } from '../../urls'

export const messageCenter = 'https://message.bilibili.com'
export const site = 'https://www.bilibili.com'
export const account = 'https://account.bilibili.com'
export const accountSecurity = 'https://passport.bilibili.com/pc/account-security/security'
export const creator = 'https://member.bilibili.com/platform'

export const inboxCategories = {
  reply: {
    label: '回复我的',
    url: `${messageCenter}/#/reply`,
    icon: 'mdi-message-reply-text',
  },
  at: { label: '@我的', url: `${messageCenter}/#/at`, icon: 'mdi-at' },
  like: { label: '收到的赞', url: `${messageCenter}/#/love`, icon: 'mdi-thumb-up-outline' },
  system: { label: '系统通知', url: `${messageCenter}/#/system`, icon: 'mdi-bell-outline' },
  private: { label: '私信', url: `${messageCenter}/#/whisper`, icon: 'mdi-chat-outline' },
}

export type InboxCategory = keyof typeof inboxCategories
export type InteractionCategory = Exclude<InboxCategory, 'system' | 'private'>

export const isInteractionCategory = (category: InboxCategory): category is InteractionCategory =>
  category !== 'system' && category !== 'private'

export const isHttp = ({ protocol }: URL | { protocol: string }) =>
  protocol === 'https:' || protocol === 'http:'

export const getWebUrl = (url?: string) =>
  typeof url === 'string' && /^(?:https?:)?\/\//i.test(url) ? url : undefined

export const isBilibiliHost = ({ hostname }: URL | { hostname: string }) =>
  hostname === 'bilibili.com' || hostname.endsWith('.bilibili.com') || hostname === 'b23.tv'

export type LinkType = 'home' | 'live' | 'dynamic' | 'video' | 'column' | 'bilibili' | 'external'
export const getLinkType = ({ protocol, href, search, hostname }: URL): LinkType | undefined => {
  if (!isHttp({ protocol })) {
    return undefined
  }

  href = href.replace(search, '')
  const match = (patterns: TestPattern) => patterns.some(pattern => matchPattern(href, pattern))

  if (isBilibiliHost({ hostname })) {
    if (match(homeUrls)) {
      return 'home'
    }
    if (match(liveUrls)) {
      return 'live'
    }
    if (match(feedsUrls)) {
      return 'dynamic'
    }
    if (match(playerUrls)) {
      return 'video'
    }
    if (match(columnUrls)) {
      return 'column'
    }
    return 'bilibili'
  }
  return 'external'
}

const linkIdPaths = [
  /^\/video\/(av[1-9]\d*|bv[a-z0-9]{10})(?:\/|$)/i,
  /^\/read\/(cv[1-9]\d*)(?:\/|$)/i,
  /^\/bangumi\/play\/((?:ep|ss)[1-9]\d*)(?:\/|$)/i,
  /^\/bangumi\/media\/(md[1-9]\d*)(?:\/|$)/i,
]

/** 格式化链接：提取 AV BV CV EP SS MD UID 号，回退到 hostname */
export const formatLink = ({ hostname, pathname }: URL) => {
  if (!isBilibiliHost({ hostname })) {
    return hostname
  }

  if (hostname === 'space.bilibili.com') {
    const uid = /^\/([1-9]\d*)(?:\/|$)/.exec(pathname)?.[1]
    return uid ? `UID${uid}` : hostname
  }

  for (const pattern of linkIdPaths) {
    const id = pattern.exec(pathname)?.[1]
    if (id) {
      return id.slice(0, 2).toUpperCase() + id.slice(2)
    }
  }

  return hostname
}
