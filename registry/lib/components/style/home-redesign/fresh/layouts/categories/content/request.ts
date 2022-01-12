import { getJson } from '@/core/ajax'

/**
 * 封装一些 API 请求的通用行为, 使用者要定义 parseJson 方法将返回的 JSON 转换为数据数组, 会自动存到 this.items 里
 */
export const requestMixin = Vue.extend({
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
  created() {
    this.reload()
  },
  methods: {
    async reload() {
      try {
        this.error = false
        this.loading = true
        this.items = this.parseJson(await getJson(this.api)).slice(0, this.itemLimit ?? Infinity)
      } catch (error) {
        console.error(error)
        this.error = true
      } finally {
        this.loading = false
      }
    },
  },
})
