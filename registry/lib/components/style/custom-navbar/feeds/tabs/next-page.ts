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

/**
 * 获取用于支持顶栏动态无限滚动的Vue Mixin
 * @param type 动态类型
 * @param jsonMapper 解析JSON数据的映射函数
 */
export const nextPageMixin = <MappedItem extends { id: string }, RawItem>(
  type: FeedsCardType,
  jsonMapper: (obj: RawItem) => MappedItem,
) =>
  Vue.extend({
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
      if (cards.length > 0) {
        setLatestID(cards[0].id)
        // console.log('setLatestID', cards[0].id)
      }
    },
    methods: {
      async nextPage() {
        try {
          const cards: MappedItem[] = this.sortedCards
          const lastCardID = cards[cards.length - 1]?.id ?? 0

          const json = await getFeeds(type, lastCardID)
          console.log(json)
          if (json.code !== 0) {
            this.hasMorePage = false
            throw new Error(json.message)
          }
          const jsonCards = lodash.get(json, 'data.items', []).map(jsonMapper) as MappedItem[]

          let concatCards = applyContentFilter(
            cards
              .concat(jsonCards)
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
          this.hasMorePage =
            lastCardID === 0 ? true : Boolean(lodash.get(json, 'data.has_more', true))
        } catch (error) {
          logError(error)
        } finally {
          this.loading = false
        }
      },
    },
  })
