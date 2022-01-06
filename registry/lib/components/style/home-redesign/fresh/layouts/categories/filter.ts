import { categories } from '@/components/utils/categories/data'
import supportedNames from './supported-names.json'

const excludedNames = [
  '推广',
  '正在直播',
  '番剧动态',
  '国产原创相关',
  '漫画',
  '课堂',
  '专栏',
  '特别推荐',
]
export const supportedCategories = Object.fromEntries(
  Object.entries(categories).filter(([name]) => {
    if (excludedNames.includes(name)) {
      return false
    }
    if (!(supportedNames as string[]).includes(name)) {
      return false
    }
    return true
  }),
)
