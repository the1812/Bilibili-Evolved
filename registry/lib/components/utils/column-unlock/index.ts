import { defineComponentMetadata } from '@/components/define'

let eventInjected = false
let enable = true
const id = 'column-unlock'
const entry = async () => {
  enable = true
  const { addStyle } = await import('@/core/style')
  addStyle('.article-holder { user-select: text !important }', id)
  if (!eventInjected) {
    eventInjected = true
    document.addEventListener(
      'copy',
      e => {
        if (enable) {
          e.stopImmediatePropagation()
        }
      },
      { capture: true },
    )
  }
}
export const component = defineComponentMetadata({
  name: 'columnUnlock',
  displayName: '专栏复制优化',
  entry,
  reload: entry,
  unload: async () => {
    document.getElementById(id)?.remove()
    enable = false
  },
  tags: [componentsTags.utils],
  urlInclude: ['//www.bilibili.com/read/'],
})
