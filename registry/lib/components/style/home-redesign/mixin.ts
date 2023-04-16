import { getJson } from '@/core/ajax'
import { freshHomeOptions } from './fresh/options'
import { RankListMode } from './fresh/types'

/**
 * 封装一些 API 请求的通用行为, 使用者要定义 parseJson 方法将返回的 JSON 转换为数据数组, 会自动存到 this.items 里
 */
export const requestMixin = (
  config: {
    requestMethod?: (url: string) => Promise<any>
  } = {},
) => {
  const { requestMethod = getJson } = config
  return Vue.extend({
    props: {
      api: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        items: [],
        loading: true,
        error: false,
      }
    },
    computed: {
      loaded() {
        return !this.loading && !this.error
      },
    },
    created() {
      this.reload()
    },
    methods: {
      async reload() {
        try {
          this.error = false
          this.loading = true
          this.items = this.parseJson(await requestMethod(this.api)).slice(
            0,
            this.itemLimit ?? Infinity,
          )
        } catch (error) {
          console.error(error)
          this.error = true
        } finally {
          this.loading = false
        }
      },
    },
  })
}

/**
 * 将 UI 常量放到 this.ui 上, 并在根元素上同步对应的 CSS var
 * @param variables UI 常量
 */
export const cssVariableMixin = (variables: Record<string, string | number>) =>
  Vue.extend({
    data() {
      return {
        ui: variables,
      }
    },
    mounted() {
      const element = this.$el as HTMLElement
      Object.entries(variables).forEach(([name, value]) => {
        const stringValue = typeof value === 'number' ? `${value}px` : value
        element.style.setProperty(`--${lodash.kebabCase(name)}`, stringValue)
      })
    },
  })

/** 使用 CompactRankList, 提供一些与设置关联的 data */
export const compactRankListMixin = () => {
  return Vue.extend({
    data() {
      return {
        rankListMode: freshHomeOptions.rankListMode,
      }
    },
    computed: {
      isCompactRankList() {
        return this.rankListMode === RankListMode.Compact
      },
    },
    methods: {
      toggleRankListMode() {
        if (this.rankListMode === RankListMode.Compact) {
          this.rankListMode = RankListMode.Default
        } else if (this.rankListMode === RankListMode.Default) {
          this.rankListMode = RankListMode.Compact
        }
        freshHomeOptions.rankListMode = this.rankListMode
      },
    },
  })
}
