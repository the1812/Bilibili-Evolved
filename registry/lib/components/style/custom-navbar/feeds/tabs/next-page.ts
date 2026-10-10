import {
  getFeeds,
  FeedsCardType,
  applyContentFilter,
  isPreOrderedVideo,
} from '@/components/feeds/api'
import { descendingBigIntSort } from '@/core/utils/sort'
import { logError } from '@/core/utils/log'
import { setLatestID } from '@/components/feeds/notify'
import { VLoading, VEmpty, ScrollTrigger } from '@/ui'

const isUnavailableRawItem = (item: any) => {
  const major = lodash.get(item, 'modules.module_dynamic.major')
  return major == null || major.type === 'MAJOR_TYPE_BLOCKED'
}

/**
 * 获取用于支持顶栏动态无限滚动的Vue Mixin
 * @param type 动态类型, 使用 `load` 时可以省略
 * @param jsonMapper 解析JSON数据的映射函数
 * @param load 自定义数据源, 用于动态流之外的数据 (例如订阅更新), 返回的 `items` 同样会经过 `jsonMapper`
 * @remarks 返回选项对象而不是 `Vue.extend(...)`: 构造函数形式的 mixin 无法合并进使用方的组件类型, 模板里的 mixin 成员会被推断为 `never`
 */
export const nextPageMixin = <MappedItem extends { id: string }, RawItem>(
  type: FeedsCardType | string | undefined,
  jsonMapper: (obj: RawItem) => MappedItem,
  load?: (cursor: any) => Promise<{ items: any[]; hasMore: boolean; cursor: any }>,
) => {
  return {
    components: {
      VLoading,
      VEmpty,
      ScrollTrigger,
    },
    data() {
      return {
        loading: true,
        cards: [],
        hasMorePage: true,
        /** 自定义数据源使用的翻页游标 */
        cursor: null as any,
        /** 是否正在加载, 避免重复触发(如滚动触发器重新进入视口)拉到同一页 */
        pending: false,
      }
    },
    computed: {
      sortedCards() {
        return ([...this.cards] as MappedItem[]).sort(descendingBigIntSort(it => it.id))
      },
    },
    async created() {
      await this.nextPage()
      const cards = this.sortedCards as MappedItem[]
      // 自定义数据源的 id 不是动态 ID, 不能写进动态已读位置
      if (load === undefined && cards.length > 0) {
        setLatestID(cards[0].id)
      }
    },
    methods: {
      async nextPage() {
        if (this.pending) {
          return
        }
        this.pending = true
        try {
          const cards: MappedItem[] = this.sortedCards
          let newCards: MappedItem[]
          let hasMore: boolean
          if (load !== undefined) {
            // 自定义数据源只负责取数据, 映射与动态流共用同一个 `jsonMapper`
            const result = await load(this.cursor)
            this.cursor = result.cursor
            newCards = result.items.map(jsonMapper)
            hasMore = result.hasMore
          } else {
            const lastCardID = cards[cards.length - 1]?.id ?? 0
            const json = await getFeeds(type, lastCardID)
            console.log(json)
            if (json.code !== 0) {
              this.hasMorePage = false
              throw new Error(json.message)
            }
            newCards = (lodash.get(json, 'data.items', []) as RawItem[])
              .filter(item => !isUnavailableRawItem(item))
              .map(jsonMapper) as MappedItem[]
            hasMore = lastCardID === 0 ? true : Boolean(lodash.get(json, 'data.has_more', true))
          }

          let concatCards = applyContentFilter(
            cards
              .concat(newCards)
              .sort(descendingBigIntSort(it => it.id))
              .filter(card => !isPreOrderedVideo(card)),
          )

          if (concatCards.length > 0 && this.onCardsUpdate) {
            concatCards = this.onCardsUpdate(concatCards)
          }
          console.log('nextPage get', concatCards)
          this.cards = concatCards
          if (this.cards.length === 0) {
            this.hasMorePage = false
            return
          }
          this.hasMorePage = hasMore
        } catch (error) {
          logError(error)
        } finally {
          this.loading = false
          this.pending = false
        }
      },
    },
  }
}
