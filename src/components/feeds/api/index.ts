import { getUID, pascalCase } from '@/core/utils'
import { getJsonWithCredentials } from '@/core/ajax'
import { formatCount, formatDuration } from '@/core/utils/formatters'
import { watchlaterList } from '@/components/video/watchlater'
import { getData, registerData } from '@/plugins/data'
import { descendingStringSort } from '@/core/utils/sort'
import { VideoCard } from '../video-card'
import { FeedsCard, FeedsCardType, feedsCardTypes } from './types'

export * from './types'
export * from './manager'

/**
 * 搜索视频卡片中重复的 aid, 合并为联合投稿
 * @param cards 视频卡片
 */
export const groupVideoFeeds = (cards: VideoCard[]) => {
  const groups = lodash.groupBy(cards, c => c.aid)
  const cardToCooperationItem = (card: VideoCard) => ({
    id: card.upID,
    name: card.upName,
    faceUrl: card.upFaceUrl,
  })
  const results = Object.values(groups)
    .map(groupCards => {
      if (groupCards.length === 1) {
        return groupCards[0]
      }
      const [firstCard, ...restCards] = groupCards
      firstCard.cooperation = [
        cardToCooperationItem(firstCard),
        ...restCards.map(cardToCooperationItem),
      ]
      console.log([...firstCard.cooperation])
      return firstCard
    })
    .sort(descendingStringSort(it => it.id))
  return results
}
/** 判断动态卡片是否包含预约功能.
 * > 在预约功能刚上线时, 无论使用什么参数请求动态流, 预约过的东西都会插入到其中.
 * > 比如传参番剧类型结果依然混入的预约视频, 导致数据混乱. 不知道之后有没有修复, 目前是使用此方法过滤掉预约类卡片.
 */
export const isPreOrderedVideo = (card: any) => lodash.get(card, 'extra.is_reserve_recall', 0) === 1

export interface FeedsContentFilter {
  filter: <T>(items: T[]) => T[]
}
const contentFiltersKey = 'feeds.contentFilters'
registerData(contentFiltersKey, [] as FeedsContentFilter[])
/** 对动态内容进行过滤 */
export const applyContentFilter = <T>(items: T[]) => {
  const [contentFilters] = getData(contentFiltersKey) as [FeedsContentFilter[]]
  const result = contentFilters.reduce((acc, it) => (acc = it.filter(acc)), items)
  return result
}
/** 对异步获取动态内容的函数进行包装, 将返回值套用 `applyContentFilter` */
export const withContentFilter =
  <Args extends any[], Item>(func: (...args: Args) => Promise<Item[]>) =>
  (...args: Args) =>
    func(...args).then(items => applyContentFilter(items))

/**
 * 获取动态 API 地址
 * @param type 动态类型, 或传入类型ID列表返回最新动态
 * @param afterID 返回指定ID之前的动态历史, 省略则返回最新的动态
 */
export const getFeedsUrl = (type: FeedsCardType | string, afterID?: string | number) => {
  if (typeof type === 'string') {
    return `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=${getUID()}&type_list=${type}`
  }
  const id = type.id.toString()
  let api = `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=${getUID()}&type_list=${id}`
  if (afterID) {
    api = `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_history?uid=${getUID()}&offset_dynamic_id=${afterID}&type=${id}`
  }
  return api
}
/**
 * 获取动态
 * @param type 动态类型, 或传入类型ID列表返回最新动态
 * @param afterID 返回指定ID之前的动态历史, 省略则返回最新的动态
 */
export const getFeeds = async (type: FeedsCardType | string, afterID?: string | number) =>
  getJsonWithCredentials(getFeedsUrl(type, afterID))

/**
 * 获取视频或番剧动态
 * @param type 指定视频 (video) 或番剧 (bangumi) 类型, 默认是视频
 * @param afterID 返回指定ID之前的动态历史, 省略则返回最新的动态
 */
export const getVideoFeeds = withContentFilter(
  async (type: 'video' | 'bangumi' = 'video', afterID?: string | number): Promise<VideoCard[]> => {
    if (!getUID()) {
      return []
    }
    const json = await getJsonWithCredentials(
      getFeedsUrl(type === 'video' ? feedsCardTypes.video : feedsCardTypes.bangumi, afterID),
    )
    if (json.code !== 0) {
      throw new Error(json.message)
    }
    const dataCards = json.data.cards as any[]
    const dataCardsWithoutPreOrder = dataCards.filter(it => !isPreOrderedVideo(JSON.parse(it.card)))
    if (type === 'video') {
      return groupVideoFeeds(
        dataCards.map((c: any): VideoCard => {
          const card = JSON.parse(c.card)
          const topics = lodash.get(c, 'display.topic_info.topic_details', []).map((it: any) => ({
            id: it.topic_id,
            name: it.topic_name,
          }))
          return {
            id: c.desc.dynamic_id_str,
            aid: card.aid,
            bvid: c.desc.bvid || card.bvid,
            title: card.title,
            upID: c.desc.user_profile.info.uid,
            upName: c.desc.user_profile.info.uname,
            upFaceUrl: c.desc.user_profile.info.face,
            coverUrl: card.pic,
            description: card.desc,
            timestamp: c.timestamp,
            time: new Date(c.timestamp * 1000),
            topics,
            dynamic: card.dynamic,
            like: formatCount(c.desc.like),
            duration: card.duration,
            durationText: formatDuration(card.duration, 0),
            playCount: formatCount(card.stat.view),
            danmakuCount: formatCount(card.stat.danmaku),
            watchlater: watchlaterList.includes(card.aid),
          }
        }),
      )
    }
    if (type === 'bangumi') {
      return dataCardsWithoutPreOrder.map((c: any): VideoCard => {
        const card = JSON.parse(c.card)
        return {
          id: c.desc.dynamic_id_str,
          aid: card.aid,
          bvid: c.desc.bvid || card.bvid,
          epID: card.episode_id,
          title: card.new_desc,
          upName: card.apiSeasonInfo.title,
          upFaceUrl: card.apiSeasonInfo.cover,
          coverUrl: card.cover,
          description: '',
          timestamp: c.timestamp,
          time: new Date(c.timestamp * 1000),
          like: formatCount(c.desc.like),
          durationText: '',
          playCount: formatCount(card.play_count),
          danmakuCount: formatCount(card.bullet_count),
          watchlater: false,
        }
      })
    }
    return []
  },
)

/**
 * 向动态卡片的菜单中添加菜单项
 * @param card 动态卡片
 * @param config 菜单项配置
 */
export const addMenuItem = (
  card: FeedsCard,
  config: {
    className: string
    text: string
    action: (e: MouseEvent) => void
  },
) => {
  const morePanel = dq(
    card.element,
    '.more-panel, .bili-dyn-more__menu, .opus-more__menu',
  ) as HTMLElement
  const { className, text, action } = config
  if (!morePanel || dq(morePanel, `.${className}`)) {
    console.warn('more panel not found', card.element)
    return
  }
  const isV2 = !morePanel.classList.contains('more-panel')
  const isOpus = morePanel.classList.contains('opus-more__menu')
  const menuItem = document.createElement(isV2 ? 'div' : 'p')
  if (isOpus) {
    menuItem.classList.add('opus-more__menu__item', className)
    const styleReferenceElement = morePanel.children[0] as HTMLElement
    if (styleReferenceElement) {
      menuItem.setAttribute('style', styleReferenceElement.getAttribute('style'))
    }
    menuItem.dataset.type = 'more'
    menuItem.dataset.stype = lodash.snakeCase(`ThreePoint${pascalCase(className)}`).toUpperCase()
    menuItem.dataset.params = '{}'
  } else if (isV2) {
    menuItem.classList.add('bili-dyn-more__menu__item', className)
    const styleReferenceElement = morePanel.children[0] as HTMLElement
    if (styleReferenceElement) {
      menuItem.setAttribute('style', styleReferenceElement.getAttribute('style'))
    } else {
      menuItem.style.height = '25px'
      menuItem.style.padding = '2px 0'
      menuItem.style.textAlign = 'center'
    }
    menuItem.dataset.module = 'more'
    menuItem.dataset.type = lodash.snakeCase(`ThreePoint${pascalCase(className)}`).toUpperCase()
    menuItem.dataset.params = '{}'
  } else {
    menuItem.classList.add('child-button', 'c-pointer', className)
  }
  menuItem.textContent = text
  const vueScopeAttributes = [
    ...new Set(
      [...morePanel.children]
        .map((element: HTMLElement) =>
          element.getAttributeNames().filter(it => it.startsWith('data-v-')),
        )
        .flat(),
    ),
  ]
  vueScopeAttributes.forEach(attr => menuItem.setAttribute(attr, ''))
  menuItem.addEventListener('click', e => {
    action(e)
    card.element.click()
  })
  morePanel.appendChild(menuItem)
}
