import { getHook } from '@/plugins/hook'

export const LoadingContentHook = 'v-loading-content'
const DefaultLoadingContent = '加载中...'
const LoadingContent = {
  content: DefaultLoadingContent,
}
export const getLoadingContent = async () => {
  const { after } = getHook(LoadingContentHook, LoadingContent)
  const refused = await after()
  if (refused) {
    LoadingContent.content = DefaultLoadingContent
  }
  return LoadingContent.content
}
