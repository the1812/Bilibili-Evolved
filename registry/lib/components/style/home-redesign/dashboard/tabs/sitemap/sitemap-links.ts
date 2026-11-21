import { categories, channelsV2 } from '@/components/utils/categories/data'
import { dashboardUrls, getSpaceUrls } from '../../shared/urls'
import { inboxCategories } from '../account/inbox-categories'

export type SitemapLink = [
  label: string,
  href: string,
  icon: string,
  subcategories?: SitemapSubcategories,
]

interface SitemapSubcategories {
  id: string
  links: SitemapLink[]
}

interface SitemapSection {
  id: string
  title: string
  links: SitemapLink[]
}

export const sitemapChannelSelector = '.bili-header__channel'

const channelIcons = new Map([
  ['douga', 'mdi-animation-outline'],
  ['game', 'mdi-gamepad-variant-outline'],
  ['kichiku', 'mdi-emoticon-tongue-outline'],
  ['music', 'mdi-music-note'],
  ['dance', 'mdi-human-handsup'],
  ['cinephile', 'mdi-movie-open-outline'],
  ['ent', 'mdi-drama-masks'],
  ['knowledge', 'mdi-lightbulb-outline'],
  ['tech', 'mdi-cellphone'],
  ['information', 'mdi-newspaper-variant-outline'],
  ['food', 'mdi-silverware-fork-knife'],
  ['shortplay', 'mdi-theater'],
  ['car', 'mdi-car'],
  ['fashion', 'mdi-lipstick'],
  ['sports', 'mdi-basketball'],
  ['animal', 'mdi-paw'],
  ['vlog', 'mdi-video-outline'],
  ['painting', 'mdi-palette-outline'],
  ['ai', 'mdi-robot'],
  ['home', 'mdi-home-outline'],
  ['outdoors', 'mdi-pine-tree'],
  ['gym', 'mdi-dumbbell'],
  ['handmake', 'mdi-scissors-cutting'],
  ['travel', 'mdi-map-marker-outline'],
  ['rural', 'mdi-tractor'],
  ['parenting', 'mdi-human-male-child'],
  ['health', 'mdi-heart-pulse'],
  ['emotion', 'mdi-heart-outline'],
  ['life_joy', 'mdi-star-outline'],
  ['life_experience', 'mdi-notebook-outline'],
  ['mysticism', 'mdi-crystal-ball'],
  ['life', 'mdi-coffee-outline'],
  ['virtual', 'mdi-account-star-outline'],
])
const defaultIcon = 'mdi-view-grid-outline'
const fallbackChannelLinks: SitemapLink[] = channelsV2.map(({ name, route, link }) => [
  name,
  link,
  channelIcons.get(route) ?? defaultIcon,
])

const getChannelSlug = (href: string) => /^\/c\/([\w-]+)\/?$/.exec(new URL(href).pathname)?.[1]

export const readSitemapChannelLinks = (root: ParentNode) => {
  const links = new Map<string, SitemapLink>()
  const anchors = root.querySelectorAll<HTMLAnchorElement>(`${sitemapChannelSelector} a[href]`)
  for (const anchor of anchors) {
    const { href } = anchor
    if (!href.startsWith(dashboardUrls.home)) {
      continue
    }
    const slug = getChannelSlug(href)
    if (!slug || links.has(slug)) {
      continue
    }
    const label = (anchor.querySelector('.channel-link__text') ?? anchor).textContent?.trim()
    if (label) {
      links.set(slug, [label, href, channelIcons.get(slug) ?? defaultIcon])
    }
  }
  return links.size ? [...links.values()] : undefined
}

const linkKey = (href: string) => {
  const url = new URL(href)
  url.searchParams.delete('spm_id_from')
  return `${url.origin}${url.pathname.replace(/\/$/, '')}${url.search}${url.hash}`
}

export const getPersonalSitemapSection = (uid: string): SitemapSection => {
  const personalSpace = getSpaceUrls(uid)
  const spaceLinks: SitemapLink[] = uid
    ? [
        ['我的空间', personalSpace.home, 'mdi-account-circle-outline'],
        ['我的关注', personalSpace.following, 'mdi-account-multiple-outline'],
        ['我的粉丝', personalSpace.followers, 'mdi-account-heart-outline'],
        ['我的动态', personalSpace.dynamics, 'mdi-text-box-outline'],
        ['我的收藏', personalSpace.favorites, 'mdi-star-box-outline'],
        ['我的追番', personalSpace.bangumi, 'mdi-bookmark-multiple-outline'],
        ['我的追剧', personalSpace.cinema, 'mdi-television-play'],
      ]
    : []

  return {
    id: 'personal',
    title: '个人入口',
    links: [
      ['历史记录', dashboardUrls.history, 'mdi-history'],
      ['稍后再看', dashboardUrls.watchlater, 'mdi-clock-outline'],
      ['播放稍后再看', dashboardUrls.playWatchlater, 'mdi-play-circle-outline'],
      ['账号中心', dashboardUrls.account, 'mdi-account-cog-outline'],
      ...spaceLinks,
      ['大会员', dashboardUrls.vip, 'mdi-crown-outline'],
      ['我的记录', dashboardUrls.accountRecord, 'mdi-chart-line'],
      ['硬币', dashboardUrls.coins, 'mdi-circle-multiple-outline'],
      ['B币钱包', dashboardUrls.wallet, 'mdi-wallet-outline'],
      ['手机验证', dashboardUrls.verifyPhone, 'mdi-cellphone-key'],
      ['邮箱验证', dashboardUrls.verifyEmail, 'mdi-email-check-outline'],
      ['订单中心', dashboardUrls.orders, 'mdi-receipt'],
      ['我的课程', dashboardUrls.myCourses, 'mdi-school-outline'],
    ],
  }
}

export const getSitemapSections = (
  uid: string,
  channelLinks = fallbackChannelLinks,
): SitemapSection[] => {
  const sections: SitemapSection[] = [
    {
      id: 'discover',
      title: '内容与服务',
      links: [
        ['首页', dashboardUrls.home, 'mdi-home-outline'],
        ['直播', categories.直播.link, 'mdi-access-point'],
        ['动态', dashboardUrls.dynamics, 'mdi-text-box-multiple-outline'],
        ['综合热门', dashboardUrls.popular, 'mdi-fire'],
        ['每周必看', dashboardUrls.weekly, 'mdi-calendar-week'],
        ['入站必刷', dashboardUrls.mustWatch, 'mdi-bookmark-check-outline'],
        ['排行榜', dashboardUrls.ranking, 'mdi-trophy-outline'],
        ['全站音乐榜', dashboardUrls.musicRanking, 'mdi-playlist-music-outline'],
        ['专栏', categories.专栏.link, 'mdi-file-document-outline'],
        ['漫画', dashboardUrls.manga, 'mdi-book-open-variant'],
        ['游戏中心', dashboardUrls.games, 'mdi-gamepad-variant-outline'],
        ['赛事', dashboardUrls.esports, 'mdi-tournament'],
        ['音频', dashboardUrls.audioHome, 'mdi-headphones'],
        ['新歌热榜', categories.新歌热榜.link, 'mdi-music-note-eighth'],
        ['视频播客', dashboardUrls.podcasts, 'mdi-podcast'],
        ['超高清', dashboardUrls.ultraHd, 'mdi-video-4k-box'],
        ['会员购', dashboardUrls.shop, 'mdi-shopping-outline'],
      ],
    },
    {
      id: 'community',
      title: '创作与社区',
      links: [
        ['创作中心', dashboardUrls.creator, 'mdi-view-dashboard-outline'],
        ['视频投稿', dashboardUrls.uploadVideo, 'mdi-upload-outline'],
        ['专栏投稿', dashboardUrls.uploadColumn, 'mdi-file-document-edit-outline'],
        ['音频投稿', dashboardUrls.uploadAudio, 'mdi-microphone-outline'],
        ['贴纸投稿', dashboardUrls.uploadSticker, 'mdi-sticker-emoji'],
        ['投稿管理', dashboardUrls.manageUploads, 'mdi-file-multiple-outline'],
        ['直播中心', dashboardUrls.liveCenter, 'mdi-access-point'],
        ['活动', categories.活动.link, 'mdi-calendar-outline'],
        ['激励活动', dashboardUrls.creatorRewards, 'mdi-calendar-star'],
        ['课堂', categories.课堂.link, 'mdi-school-outline'],
        ['公开课', categories.公开课.link, 'mdi-book-open-page-variant'],
        ['社区中心', categories.社区中心.link, 'mdi-forum-outline'],
        ['公益', categories.公益.link, 'mdi-hand-heart'],
      ],
    },
    getPersonalSitemapSection(uid),
    {
      id: 'messages',
      title: '消息',
      links: [
        ['消息中心', dashboardUrls.messageCenter, 'mdi-email-outline'],
        ...Object.values(inboxCategories).map(
          ({ label, url, icon }): SitemapLink => [label, url, icon],
        ),
        ['私信存档', dashboardUrls.archivedMessages, 'mdi-archive-outline'],
        ['消息设置', dashboardUrls.messageSettings, 'mdi-cog-outline'],
      ],
    },
    {
      id: 'channels',
      title: '内容分区',
      links: [
        ...channelLinks,
        ['番剧', categories.番剧.link, 'mdi-television-play'],
        ['国创', categories.国创.link, 'mdi-creation'],
        ['电影', categories.电影.link, 'mdi-filmstrip'],
        ['电视剧', categories.电视剧.link, 'mdi-television-classic'],
        ['综艺', categories.综艺.link, 'mdi-microphone-variant'],
        ['纪录片', categories.纪录片.link, 'mdi-earth'],
      ],
    },
  ]
  const linked = new Set<string>()
  const unique = (links: SitemapLink[]) =>
    links.filter(([, href]) => {
      const key = linkKey(href)
      if (linked.has(key)) {
        return false
      }
      linked.add(key)
      return true
    })
  for (const section of sections) {
    section.links = unique(section.links)
  }
  const primaryLinks = new Map(
    sections.flatMap(({ links }) => links.map(item => [linkKey(item[1]), item])),
  )
  const channelsBySlug = new Map(channelLinks.map(item => [getChannelSlug(item[1]), item]))
  const subcategoriesByHref = new Map<string, SitemapSubcategories>()
  const additionalChannels: SitemapLink[] = []
  for (const [title, { route, link, subCategories }] of Object.entries(categories)) {
    if (!subCategories) {
      continue
    }
    const existing = channelsBySlug.get(route) ?? primaryLinks.get(linkKey(link))
    const parent: SitemapLink = existing ?? [title, link, channelIcons.get(route) ?? defaultIcon]
    if (!existing) {
      additionalChannels.push(...unique([parent]))
    }
    const [, href, icon] = parent
    const subLinks = unique(Object.entries(subCategories).map(([label, url]) => [label, url, icon]))
    if (subLinks.length) {
      subcategoriesByHref.set(linkKey(href), {
        id: `dashboard-home-sitemap-subcategories-${route || title}`,
        links: subLinks,
      })
    }
  }
  return sections.map(section => {
    const links =
      section.id === 'channels' ? [...section.links, ...additionalChannels] : section.links
    return {
      ...section,
      links: links.map(([label, href, icon]) => [
        label,
        href,
        icon,
        subcategoriesByHref.get(linkKey(href)),
      ]),
    }
  })
}
