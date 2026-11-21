import type { TestPattern } from '@/core/common-types'
import { matchPattern } from '@/core/utils'
import { columnUrls, feedsUrls, liveUrls, playerUrls } from '@/core/utils/urls'
import { homeUrls } from '../../urls'

const site = 'https://www.bilibili.com'
const spaceSite = 'https://space.bilibili.com'
const dynamicSite = 'https://t.bilibili.com'
const accountSite = 'https://account.bilibili.com'
const liveSite = 'https://live.bilibili.com'
const shopSite = 'https://show.bilibili.com'
const securitySite = 'https://passport.bilibili.com/pc/account-security/security'
const creatorSite = 'https://member.bilibili.com/platform'
const messageSite = 'https://message.bilibili.com'

export const dashboardUrls = {
  home: `${site}/`,
  dynamics: `${dynamicSite}/`,
  videoDynamics: `${dynamicSite}/?tab=video`,
  bangumiDynamics: `${dynamicSite}/?tab=pgc`,
  columnDynamics: `${dynamicSite}/?tab=article`,
  popular: `${site}/v/popular/all`,
  weekly: `${site}/v/popular/weekly`,
  mustWatch: `${site}/v/popular/history`,
  ranking: `${site}/v/popular/rank/all`,
  musicRanking: `${site}/v/popular/music`,
  manga: 'https://manga.bilibili.com/',
  games: 'https://game.bilibili.com/',
  esports: `${site}/v/game/match/`,
  audioHome: `${site}/audio/home/`,
  podcasts: `${site}/blackboard/era/jpyPhRRrMn3fmZ2B.html`,
  ultraHd: `${site}/blackboard/era/Vp41b8bsU9Wkog3X.html`,
  shop: `${shopSite}/`,
  orders: `${shopSite}/orderlist`,
  history: `${site}/history`,
  watchlater: `${site}/watchlater/#/list`,
  playWatchlater: `${site}/medialist/play/watchlater`,
  watchlaterQueue: `${site}/list/watchlater`,
  login: 'https://passport.bilibili.com/login',
  account: `${accountSite}/account/home`,
  vip: `${accountSite}/big`,
  vipAccount: `${accountSite}/account/big`,
  accountRecord: `${accountSite}/account/record`,
  coins: `${accountSite}/account/coin`,
  wallet: 'https://pay.bilibili.com/pay-v2-web/bcoin_index',
  verifyPhone: `${securitySite}/set-phone/entry`,
  verifyEmail: `${securitySite}/set-mail/entry`,
  myCourses: `${site}/v/cheese/mine`,
  creator: `${creatorSite}/home`,
  uploadVideo: `${creatorSite}/upload/video/frame`,
  uploadColumn: `${creatorSite}/upload/text/apply`,
  uploadAudio: `${creatorSite}/upload/audio/frame`,
  uploadSticker: `${creatorSite}/upload/sticker`,
  manageUploads: `${creatorSite}/upload-manager/article`,
  liveCenter: 'https://link.bilibili.com/p/center/index',
  creatorRewards: `${site}/blackboard/era/reward-activity-list-page.html#/list`,
  messageCenter: messageSite,
  inbox: {
    reply: `${messageSite}/#/reply`,
    at: `${messageSite}/#/at`,
    like: `${messageSite}/#/love`,
    system: `${messageSite}/#/system`,
    private: `${messageSite}/#/whisper`,
  },
  archivedMessages: `${messageSite}/#/archive`,
  messageSettings: `${messageSite}/#/config`,
}

export const getSpaceUrls = (uid: string | number) => {
  const home = `${spaceSite}/${uid}`
  return {
    home,
    following: `${home}/fans/follow`,
    followers: `${home}/fans/fans`,
    dynamics: `${home}/dynamic`,
    favorites: `${home}/favlist`,
    bangumi: `${home}/bangumi`,
    cinema: `${home}/cinema`,
    videos: `${home}/video`,
  }
}

export const getVideoUrl = (id: string) => `${site}/video/${id}/`
export const getVideoHistoryUrl = (id: string, page: number, time: number) =>
  `${site}/video/${id}?p=${page}&t=${time}`
export const getWatchlaterVideoUrl = (aid: number, bvid?: string) =>
  bvid ? `${dashboardUrls.watchlaterQueue}?bvid=${bvid}` : `${site}/video/av${aid}`
export const getBangumiEpisodeUrl = (id: number, time?: number) =>
  `${site}/bangumi/play/ep${id}${time === undefined ? '' : `?t=${time}`}`
export const getBangumiSeasonUrl = (id: number) => `${site}/bangumi/play/ss${id}`
export const getBangumiMediaUrl = (id: number) => `${site}/bangumi/media/md${id}`
export const getColumnUrl = (id: number) => `${site}/read/cv${id}`
export const getAudioUrl = (id: number) => `${site}/audio/au${id}/`
export const getLiveRoomUrl = (id: number | string) => `${liveSite}/${id}`
export const getDynamicUrl = (id: string) => `${dynamicSite}/${id}`
export const getTopicUrl = (name: string) =>
  `${dynamicSite}/topic/name/${encodeURIComponent(name)}/feed`
export const getFavoriteFolderUrl = (id: number) => `${site}/list/ml${id}`
export const getCollectionUrl = (uid: number, id: number) =>
  `${spaceSite}/${uid}/lists/${id}?type=season`

const api = 'https://api.bilibili.com'
const messageApi = 'https://api.vc.bilibili.com'
const sessionsApi = `${messageApi}/session_svr/v1/session_svr`
const watchlaterApi = `${api}/x/v2/history/toview`
const historyRecording = `${api}/x/v2/history/shadow`

export const dashboardApiUrls = {
  accountProfile: `${api}/x/web-interface/nav`,
  accountCounts: `${api}/x/web-interface/nav/stat`,
  creatorCounts: `${api}/x/space/upstat`,
  privileges: `${api}/x/vip/privilege/my`,
  followings: `${api}/x/relation/followings`,
  liveRooms: `${api}/x/polymer/web-dynamic/v1/portal`,
  dynamicLike: `${api}/x/dynamic/feed/dyn/thumb`,
  favoriteFolders: `${api}/x/v3/fav/folder/created/list-all`,
  favoriteMedia: `${api}/x/v3/fav/resource/list`,
  collectedFolders: `${api}/x/v3/fav/folder/collected/list`,
  followedShows: `${api}/x/space/bangumi/follow/list`,
  history: `${api}/x/web-interface/history/cursor`,
  historyRecording,
  setHistoryRecording: `${historyRecording}/set`,
  watchlaterQueue: `${watchlaterApi}/web`,
  removeWatchlater: `${watchlaterApi}/del`,
  clearWatchlater: `${watchlaterApi}/clear`,
  unreadNotifications: `${messageApi}/x/im/web/msgfeed/unread`,
  unreadSessions: `${sessionsApi}/single_unread`,
  interactions: {
    reply: `${api}/x/msgfeed/reply`,
    at: `${api}/x/msgfeed/at`,
    like: `${api}/x/msgfeed/like`,
  },
  unifiedNotices: `${messageSite}/x/sys-msg/query_unified_notify`,
  userNotices: `${messageSite}/x/sys-msg/query_user_notify`,
  updateNoticeCursor: `${messageSite}/x/sys-msg/update_cursor`,
  privateSessions: `${sessionsApi}/get_sessions`,
  sessionProfiles: `${api}/x/polymer/pc-electron/v1/user/cards`,
  acknowledgeSession: `${sessionsApi}/update_ack`,
}

export const getPrivateSessionUrl = (uid: string) => `${dashboardUrls.inbox.private}/mid${uid}`

export const getWebUrl = (url?: string) =>
  typeof url === 'string' && /^(?:https?:)?\/\//i.test(url) ? url : undefined

export const isHttp = ({ protocol }: URL | { protocol: string }) =>
  protocol === 'https:' || protocol === 'http:'

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
