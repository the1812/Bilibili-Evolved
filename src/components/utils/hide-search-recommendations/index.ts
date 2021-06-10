import { ComponentMetadata, componentsTags } from '@/components/component'

const entry = async () => {
  const selectors = [
    '.nav-search-keyword',
    '.search-keyword',
  ]
  const { selectAll } = await import('@/core/spin-query')
  for (const selector of selectors) {
    selectAll(selector).then((it: HTMLElement[]) => {
      it.forEach(input => {
        if (input.hasAttribute('placeholder')) {
          input.setAttribute('placeholder', '搜索')
        }
      })
    })
  }
}
export const component: ComponentMetadata = {
  name: 'hideSearchRecommendations',
  displayName: '隐藏搜索推荐',
  tags: [
    componentsTags.utils,
  ],
  entry,
  enabledByDefault: false,
  description: {
    'zh-CN': '将搜索框的推荐词替换为`搜索`.',
  },
}
