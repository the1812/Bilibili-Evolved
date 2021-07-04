import { ComponentMetadata } from '@/components/types'

let eventInjected = false
let enable = true
const id = 'column-unlock'
const entry = async () => {
  enable = true
  const { addStyle } = await import('@/core/style')
  addStyle('.article-holder { user-select: text !important }', id)
  if (!eventInjected) {
    eventInjected = true
    document.addEventListener('copy', e => {
      if (enable) {
        e.stopImmediatePropagation()
      }
    }, { capture: true })
  }
}
export const component: ComponentMetadata = {
  name: 'columnUnlock',
  displayName: '专栏文字选择',
  enabledByDefault: true,
  entry,
  reload: entry,
  unload: async () => {
    document.getElementById(id)?.remove()
    enable = false
  },
  tags: [
    componentsTags.utils,
  ],
  description: {
    'zh-CN': '使专栏的文字可以选择.',
  },
  urlInclude: [
    '//www.bilibili.com/read/',
  ],
}
