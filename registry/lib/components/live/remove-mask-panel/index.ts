import { defineComponentMetadata } from '@/components/define'
import { liveUrls } from '@/core/utils/urls'

const id = 'web-player-module-area-mask-panel'
const entry = async () => {
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if ((node as Element).id === id) {
          node.parentNode?.removeChild(node)
          observer.disconnect()
        }
      })
    })
  })
  observer.observe(document.body, { childList: true, subtree: true })
}

export const component = defineComponentMetadata({
  name: 'removeLiveMaskPanel',
  displayName: '删除直播马赛克遮罩',
  author: {
    name: 'Liki4',
    link: 'https://github.com/Liki4',
  },
  tags: [componentsTags.live, componentsTags.style],
  description: {
    'zh-CN': '删除观看直播时某些分区的马赛克遮罩.',
  },
  entry,
  reload: entry,
  urlInclude: liveUrls,
})
