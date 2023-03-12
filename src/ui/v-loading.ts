import { reactive } from 'vue'
import { registerAndGetData } from '@/plugins/data'

const defaultLoadingContent = '加载中...'
export const [loadingContent] = registerAndGetData(
  'vLoading',
  reactive({
    content: defaultLoadingContent,
  }),
)
