import { getJson } from '@/core/ajax'

/**
 * 封装一些 API 请求的通用行为, 使用者要定义 parseJson 方法将返回的 JSON 转换为数据数组, 会自动存到 this.items 里
 */
export const requestMixin = <Item = unknown, JsonData = unknown>(
  config: {
    requestMethod?: (url: string) => Promise<JsonData>
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
        items: [] as Item[],
        loading: true,
        error: false,
      }
    },
    computed: {
      loaded(): boolean {
        return !this.loading && !this.error
      },
    },
    created() {
      this.reload().then()
    },
    methods: {
      async reload() {
        const this0 = this as typeof this & { parseJson: (json: JsonData) => Item[]; itemLimit?: number }
        try {
          this.error = false
          this.loading = true
          this.items = this0
            .parseJson(await requestMethod(this.api))
            .slice(0, this0.itemLimit ?? Infinity)
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
