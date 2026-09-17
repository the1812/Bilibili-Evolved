import { bilibiliApi, getJsonWithCredentials } from '@/core/ajax'
import { getUID } from '@/core/utils'

/** 订阅列表的每页数量 */
const pageSize = 20
/** 取各订阅更新时的并发上限避免订阅很多时一次性发出大量请求 */
const concurrency = 4
/** 订阅列表里 `type` 为 11 的是收藏夹, 21 的是合集 */
const favFolderType = 11
const ugcSeasonType = 21

/** 订阅的合集或收藏夹 */
export interface Subscription {
  id: number
  type: number
  mid: number
  title: string
  upName: string
}

/** 订阅项的最新更新内容 */
export interface SubscriptionContent {
  aid: number
  bvid: string
  title: string
  cover: string
  duration: number
  /** 更新时间(秒): 合集取最新一集的发布时间, 收藏夹取最新一条的收藏时间 */
  updateTime: number
  /** 卡片点击打开的页面; 收藏夹开它的列表页, 其它由卡片按 bvid 推导 */
  pageUrl?: string
  playCount: number
  upName: string
  upFaceUrl: string
  upID: number
}

/** 订阅项的一次更新 */
export interface SubscriptionUpdate {
  subscription: Subscription
  content: SubscriptionContent
}

/**
 * 按 mid 取空间名片
 * @remarks
 * 头像从空间名片取; 名称直接订阅列表里的 `upName`
 */
const getSpaceCard = async (mid: number) => {
  const data = await bilibiliApi<{ card?: any }>(
    getJsonWithCredentials(`https://api.bilibili.com/x/web-interface/card?mid=${mid}&photo=false`),
    `获取用户 ${mid} 的信息失败`,
    false,
  )
  return data.card
}

/** 获取订阅的合集与收藏夹 */
const getSubscriptions = async (page: number) => {
  const data = await bilibiliApi<{ list?: any[]; has_more?: boolean }>(
    getJsonWithCredentials(
      `https://api.bilibili.com/x/v3/fav/folder/collected/list?up_mid=${getUID()}&pn=${page}&ps=${pageSize}&platform=web`,
    ),
    '获取订阅列表失败',
    false,
  )
  const subscriptions = (data.list ?? [])
    .filter(item => item.type === ugcSeasonType || item.type === favFolderType)
    .map(
      (item: any): Subscription => ({
        id: item.id,
        type: item.type,
        mid: item.mid,
        title: item.title,
        upName: lodash.get(item, 'upper.name') ?? '',
      }),
    )
  return { subscriptions, hasMore: Boolean(data.has_more) }
}

/** 订阅项类别的显示名 */
export const getSubscriptionKindName = (subscription: Subscription) =>
  subscription.type === favFolderType ? '收藏夹' : '合集'

/** 获取合集最新一集 */
const getUgcSeasonLatestArchive = async (
  subscription: Subscription,
): Promise<SubscriptionContent | null> => {
  const data = await bilibiliApi<{ archives?: any[] }>(
    getJsonWithCredentials(
      `https://api.bilibili.com/x/polymer/web-space/seasons_archives_list?mid=${subscription.mid}` +
        `&season_id=${subscription.id}&sort_reverse=false&page_num=1&page_size=3`,
    ),
    `获取合集「${subscription.title}」的投稿失败`,
    false,
  )
  const archives = data.archives ?? []
  if (archives.length === 0) {
    return null
  }
  const archive = lodash.maxBy(archives, 'pubdate')
  const owner = await getSpaceCard(subscription.mid).catch(() => null)
  return {
    aid: archive.aid,
    bvid: archive.bvid,
    title: archive.title,
    cover: archive.pic,
    duration: archive.duration,
    updateTime: archive.pubdate,
    playCount: lodash.get(archive, 'stat.view', 0),
    upName: subscription.upName,
    upFaceUrl: owner?.face ?? '',
    upID: subscription.mid,
  }
}

/** 获取收藏夹最新加入的一条 */
const getFavFolderLatestMedia = async (
  subscription: Subscription,
): Promise<SubscriptionContent | null> => {
  const data = await bilibiliApi<{ medias?: any[]; info?: any }>(
    getJsonWithCredentials(
      `https://api.bilibili.com/x/v3/fav/resource/list?media_id=${subscription.id}&pn=1&ps=3&order=mtime&platform=web`,
    ),
    `获取收藏夹「${subscription.title}」的内容失败`,
    false,
  )
  const medias = (data.medias ?? []).filter(media => media != null && media.bvid != null)
  if (medias.length === 0) {
    return null
  }
  const media = lodash.maxBy(medias, 'fav_time')
  const creator = data.info?.upper
  return {
    aid: media.id,
    bvid: media.bvid,
    title: media.title,
    cover: media.cover,
    duration: media.duration,
    updateTime: media.fav_time ?? media.pubtime,
    pageUrl: `https://www.bilibili.com/list/ml${subscription.id}`,
    playCount: lodash.get(media, 'cnt_info.play', 0),
    upName: creator?.name ?? '',
    upFaceUrl: creator?.face ?? '',
    upID: creator?.mid ?? 0,
  }
}

/** 获取一个订阅项的最新更新 */
const getSubscriptionUpdate = async (subscription: Subscription) => {
  const content = await (subscription.type === favFolderType
    ? getFavFolderLatestMedia(subscription)
    : getUgcSeasonLatestArchive(subscription)
  ).catch(error => {
    console.warn(`获取订阅「${subscription.title}」的更新失败`, error)
    return null
  })
  return content === null ? null : { subscription, content }
}

/** 分批获取各订阅项的更新 */
const getSubscriptionUpdates = async (subscriptions: Subscription[]) => {
  const updates: SubscriptionUpdate[] = []
  for (const chunk of lodash.chunk(subscriptions, concurrency)) {
    updates.push(...lodash.compact(await Promise.all(chunk.map(getSubscriptionUpdate))))
  }
  return updates
}

/**
 * 创建「订阅更新」的数据源, 用作顶栏动态 mixin 的 `load`
 * @remarks 每次调用取订阅列表的下一页, 每个订阅项取最新一条更新, 返回的 `items` 由页签的映射函数转成卡片
 */
export const createSubscriptionsLoader = async (cursor: any) => {
  let page = Number(cursor ?? 0)
  let subscriptions: Subscription[]
  let hasMore: boolean
  do {
    page += 1
    const result = await getSubscriptions(page)
    subscriptions = result.subscriptions
    hasMore = result.hasMore
  } while (subscriptions.length === 0 && hasMore)
  return { items: await getSubscriptionUpdates(subscriptions), hasMore, cursor: page }
}
