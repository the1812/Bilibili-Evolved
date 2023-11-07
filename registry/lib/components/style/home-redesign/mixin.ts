import type { Ref, ComputedRef } from 'vue'
import { ref, computed, onMounted } from 'vue'
import { getJson } from '@/core/ajax'
import { freshHomeOptions } from './fresh/options'
import { RankListMode } from './fresh/types'

export const requestProps = {
  api: {
    type: String,
    required: true,
  },
} as const

/**
 * 封装一些 API 请求的通用行为, 使用者要定义 parseJson 方法将返回的 JSON 转换为数据数组, 会自动存到 items 里
 */
export const useRequest = <Item = unknown, JsonData = unknown>(config: {
  api: string
  requestMethod?: (url: string) => Promise<JsonData>
  parseJson: (json: JsonData) => Item[]
  itemLimit?: number
}): {
  items: Ref<Item[]>
  loading: Ref<boolean>
  error: Ref<boolean>
  loaded: ComputedRef<boolean>
  reload: () => Promise<void>
} => {
  const items = ref([]) as Ref<Item[]>
  const loading = ref(true)
  const error = ref(false)

  const reload = async () => {
    const { api, requestMethod = getJson, parseJson, itemLimit } = config
    try {
      error.value = false
      loading.value = true
      items.value = parseJson(await requestMethod(api)).slice(0, itemLimit ?? Infinity)
    } catch (e) {
      console.error(e)
      error.value = true
    } finally {
      loading.value = false
    }
  }

  reload().then()

  return {
    items,
    loading,
    error,
    loaded: computed(() => !loading.value && !error.value),
    reload,
  }
}

/**
 * 将 UI 常量放到 ui 上, 并在根元素上同步对应的 CSS var
 * @param variables UI 常量
 */
export const useCssVariable = <V extends Record<string, string | number>>(
  variables: V,
): { el: Ref<HTMLElement | null>; ui: Ref<V> } => {
  const el = ref(null) as Ref<HTMLElement | null>
  const ui = ref(variables) as Ref<V>

  onMounted(() => {
    const element = document.documentElement
    Object.entries(variables).forEach(([name, value]) => {
      const stringValue = typeof value === 'number' ? `${value}px` : value
      element.style.setProperty(`--${lodash.kebabCase(name)}`, stringValue)
    })
  })

  return { el, ui }
}

/** 使用 CompactRankList, 提供一些与其设置关联的接口 */
export const useCompactRankList = (): {
  rankListMode: Ref<RankListMode>
  isCompactRankList: ComputedRef<boolean>
  toggleRankListMode: () => void
} => {
  const rankListMode = ref(freshHomeOptions.rankListMode)
  const isCompactRankList = computed(() => rankListMode.value === RankListMode.Compact)
  const toggleRankListMode = () => {
    if (rankListMode.value === RankListMode.Compact) {
      rankListMode.value = RankListMode.Default
    } else if (rankListMode.value === RankListMode.Default) {
      rankListMode.value = RankListMode.Compact
    }
    freshHomeOptions.rankListMode = rankListMode.value
  }
  return { rankListMode, isCompactRankList, toggleRankListMode }
}
