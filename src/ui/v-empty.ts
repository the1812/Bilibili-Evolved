import { getHook } from '@/plugins/hook'

export const EmptyContentHook = 'v-loading-content'
const DefaultEmptyContent = '空空如也哦 =￣ω￣='
const EmptyContent = {
  content: DefaultEmptyContent,
}
export const getEmptyContent = async () => {
  const { after } = getHook(EmptyContentHook, EmptyContent)
  const refused = await after()
  if (refused) {
    EmptyContent.content = DefaultEmptyContent
  }
  return EmptyContent.content
}
