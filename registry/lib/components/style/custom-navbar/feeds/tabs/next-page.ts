import { computed, ref, type Ref, type ComputedRef } from 'vue'
import type { FeedsCardType } from '@/components/feeds/api'
import { applyContentFilter, getFeeds, isPreOrderedVideo } from '@/components/feeds/api'
import { setLatestID } from '@/components/feeds/notify'
import { logError } from '@/core/utils/log'
import { descendingStringSort } from '@/core/utils/sort'

/**
 * 用于支持顶栏动态无限滚动
 * @param type 动态类型
 * @param jsonMapper 解析JSON数据的映射函数
 * @param onCardsUpdate 卡片列表更新时用于修改的回调函数
 */
export const useNextPage = <MappedItem extends { id: string }, RawItem>(
  type: FeedsCardType,
  jsonMapper: (obj: RawItem) => MappedItem,
  onCardsUpdate?: (cards: MappedItem[]) => MappedItem[],
): {
  loading: Ref<boolean>
  cards: Ref<MappedItem[]>
  hasMorePage: Ref<boolean>
  sortedCards: ComputedRef<MappedItem[]>
  nextPage: () => Promise<void>
} => {
  const loading = ref(true)
  const cards: Ref<MappedItem[]> = ref([])
  const hasMorePage = ref(true)

  const sortedCards = computed(() => [...cards.value].sort(descendingStringSort(it => it.id)))

  const nextPage = async () => {
    try {
      const lastCardID = sortedCards.value[sortedCards.value.length - 1]?.id ?? 0

      const json = await getFeeds(type, lastCardID)
      console.log(json)
      if (json.code !== 0) {
        hasMorePage.value = false
        throw new Error(json.message)
      }
      const jsonCards = lodash.get<RawItem[]>(json, 'data.cards', []).map(jsonMapper)

      let concatCards = applyContentFilter(
        sortedCards.value
          .concat(jsonCards)
          .sort(descendingStringSort(it => it.id))
          .filter(card => !isPreOrderedVideo(card)),
      )

      if (concatCards.length > 0 && onCardsUpdate) {
        concatCards = onCardsUpdate(concatCards)
      }
      console.log('nextPage get', concatCards)
      cards.value = concatCards
      if (cards.value.length === 0) {
        hasMorePage.value = false
        return
      }
      hasMorePage.value = lastCardID === 0 ? true : Boolean(lodash.get(json, 'data.has_more', true))
    } catch (error) {
      logError(error)
    } finally {
      loading.value = false
    }
  }

  nextPage().then(() => {
    if (sortedCards.value.length > 0) {
      setLatestID(sortedCards.value[0].id)
      // console.log('setLatestID', sortedCards.value[0].id)
    }
  })

  return {
    loading,
    cards,
    hasMorePage,
    sortedCards,
    nextPage,
  }
}
