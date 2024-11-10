import { getUID, pascalCase, raiseEvent } from '@/core/utils'
import { getJsonWithCredentials } from '@/core/ajax'
import { formatCount, formatDuration, parseCount, parseDuration } from '@/core/utils/formatters'
import { watchlaterList } from '@/components/video/watchlater'
import { getData, registerData } from '@/plugins/data'
import { descendingStringSort } from '@/core/utils/sort'
import { VideoCard } from '../video-card'
import { FeedsCard, FeedsCardType, feedsCardTypes } from './types'
import { childList } from '@/core/observer'
import { select } from '@/core/spin-query'

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
  const params = new URLSearchParams()
  if (typeof type === 'string') {
    params.set('type', type)
  } else if (type.apiType) {
    params.set('type', type.apiType)
  } else {
    console.warn(`unknown apiType for ${type.name}`)
    params.set('type', 'all')
  }
  if (afterID) {
    params.set('offset', afterID.toString())
  }
  return `https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/all?${params.toString()}`
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
    const dataCards = json.data.items as any[]
    if (type === 'video') {
      return groupVideoFeeds(
        dataCards.map((card: any): VideoCard => {
          const archive = lodash.get(card, 'modules.module_dynamic.major.archive')
          const author = lodash.get(card, 'modules.module_author')
          const dynamic = lodash.get(card, 'modules.module_dynamic.desc.text', '')
          const stat = lodash.get(card, 'modules.module_stat')
          const topics = (
            lodash.get(card, 'modules.module_dynamic.desc.rich_text_nodes', []) as any[]
          )
            .filter(node => node.type === 'RICH_TEXT_NODE_TYPE_TOPIC')
            .map(node => {
              return {
                id: node.text,
                name: node.text,
                url: node.jump_url,
              }
            })
          return {
            id: card.id_str,
            aid: parseInt(archive.aid),
            bvid: archive.bvid,
            title: archive.title,
            upFaceUrl: author.face,
            upName: author.name,
            upID: author.mid,
            coverUrl: archive.cover,
            description: archive.desc,
            timestamp: author.pub_ts * 1000,
            time: new Date(author.pub_ts * 1000),
            topics,
            dynamic,
            like: formatCount(stat.like.count),
            duration: parseDuration(archive.duration_text),
            durationText: formatDuration(parseDuration(archive.duration_text)),
            playCount: formatCount(parseCount(archive.stat.play)),
            danmakuCount: formatCount(parseCount(archive.stat.danmaku)),
            watchlater: watchlaterList.includes(archive.aid),
          }
        }),
      )
    }
    if (type === 'bangumi') {
      return dataCards.map((card: any): VideoCard => {
        const pgc = lodash.get(card, 'modules.module_dynamic.major.pgc')
        const author = lodash.get(card, 'modules.module_author')
        const stat = lodash.get(card, 'modules.module_stat')
        return {
          id: card.id_str,
          epID: pgc.epid,
          title: pgc.title.replace(new RegExp(`^${author.name}：`), ''),
          upName: author.name,
          upFaceUrl: author.face,
          coverUrl: pgc.cover,
          description: '',
          timestamp: author.pub_ts * 1000,
          time: new Date(author.pub_ts * 1000),
          like: formatCount(stat.like.count),
          durationText: '',
          playCount: formatCount(parseCount(pgc.stat.play)),
          danmakuCount: formatCount(parseCount(pgc.stat.danmaku)),
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
    '.more-panel, .bili-dyn-more__menu, .opus-more__menu, .bili-dyn-item__more, .opus-more',
  ) as HTMLElement
  const { className, text, action } = config
  if (!morePanel || dq(morePanel, `.${className}`)) {
    console.warn('more panel not found', card.element)
    return
  }
  const isV2 = !morePanel.classList.contains('more-panel')
  const isOpus = morePanel.classList.contains('opus-more__menu')
  const isCascader =
    morePanel.classList.contains('bili-dyn-item__more') || morePanel.classList.contains('opus-more')

  const createMenuItem = (): HTMLElement => {
    if (isCascader) {
      const menuItem = document.createElement('div')
      menuItem.innerHTML = /* html */ `
        <div class="bili-cascader-options__item">
          <div class="bili-cascader-options__item-custom">
            <div>
              <div class="bili-cascader-options__item-label">
                ${text}
              </div>
            </div>
          </div>
        </div>
      `
      return menuItem
    }

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
    return menuItem
  }

  if (isCascader) {
    ;(async () => {
      const cascader = await select(() => dq(morePanel, '.bili-cascader'))
      const [observer] = childList(cascader, () => {
        const cascaderOptions = dq(cascader, '.bili-cascader-options')
        if (cascaderOptions === null) {
          return
        }
        observer.disconnect()
        const menuItem = createMenuItem()
        menuItem.addEventListener('click', e => {
          action(e)
          const triggerButton = dq(morePanel, '.bili-dyn-more__btn') as HTMLElement | null
          if (triggerButton !== null) {
            raiseEvent(triggerButton, 'mouseleave')
          } else {
            raiseEvent(morePanel, 'mouseleave')
          }
        })
        cascaderOptions.appendChild(menuItem)
      })
    })()
    return
  }

  const menuItem = createMenuItem()
  menuItem.addEventListener('click', e => {
    action(e)
    card.element.click()
  })
  morePanel.appendChild(menuItem)
}
