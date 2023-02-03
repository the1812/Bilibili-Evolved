import { defineComponent } from 'vue'
import type { FeedsCardType } from '@/components/feeds/api'
import { applyContentFilter, getFeeds, isPreOrderedVideo } from '@/components/feeds/api'
import { setLatestID } from '@/components/feeds/notify'
import { logError } from '@/core/utils/log'
import { descendingStringSort } from '@/core/utils/sort'
import { ScrollTrigger, VEmpty, VLoading } from '@/ui'

/**
 * 获取用于支持顶栏动态无限滚动的Vue Mixin
 * @param type 动态类型
 * @param jsonMapper 解析JSON数据的映射函数
 */
export const nextPageMixin = <MappedItem extends { id: string }, RawItem>(
  type: FeedsCardType,
  jsonMapper: (obj: RawItem) => MappedItem,
) =>
  defineComponent({
    components: {
      VLoading,
      VEmpty,
      ScrollTrigger,
    },
    data() {
      return {
        loading: true,
        cards: [] as MappedItem[],
        hasMorePage: true,
      }
    },
    computed: {
      sortedCards(): MappedItem[] {
        return [...this.cards].sort(descendingStringSort(it => it.id))
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
        const this0 = this as typeof this & {
          onCardsUpdate?: (cards: MappedItem[]) => MappedItem[]
        }
        try {
          const cards: MappedItem[] = this.sortedCards
          const lastCardID = cards[cards.length - 1]?.id ?? 0

          const json = await getFeeds(type, lastCardID)
          console.log(json)
          if (json.code !== 0) {
            this.hasMorePage = false
            throw new Error(json.message)
          }
          const jsonCards = lodash.get(json, 'data.cards', []).map(jsonMapper) as MappedItem[]

          let concatCards = applyContentFilter(
            cards
              .concat(jsonCards)
              .sort(descendingStringSort(it => it.id))
              .filter(card => !isPreOrderedVideo(card)),
          )

          if (concatCards.length > 0 && this0.onCardsUpdate) {
            concatCards = this0.onCardsUpdate(concatCards)
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
