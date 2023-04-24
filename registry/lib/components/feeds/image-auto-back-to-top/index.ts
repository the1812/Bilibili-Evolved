import { defineComponentMetadata } from '@/components/define'
import { forEachFeedsCard } from '@/components/feeds/api'
import { attributesSubtree, mutationObserve } from '@/core/observer'
import { useScopedConsole } from '@/core/utils/log'
import { feedsUrlsWithoutDetail } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'imageAutoBackToTop',
  displayName: '动态看图自动回顶',
  tags: [componentsTags.feeds],
  urlInclude: feedsUrlsWithoutDetail,
  entry: () => {
    const console = useScopedConsole('imageAutoBackToTop')
    forEachFeedsCard({
      added: card => {
        const scrollIntoView = (element: Element) => {
          element?.scrollIntoView()
          window.scrollBy({ top: -75 })
        }
        const albums = dqa(card.element, '.bili-album')
        mutationObserve(albums, { childList: true, attributes: true, subtree: true }, records => {
          records.forEach(record => {
            const isAlbumVisible = () => {
              if (
                record.target instanceof HTMLElement &&
                record.target.classList.contains('bili-album__watch') &&
                record.attributeName === 'style'
              ) {
                return record.target.style.display !== 'none'
              }
              return null
            }
            const hasAlbumPreviewNode = (nodeList: NodeList) =>
              [...nodeList].some(node => {
                return node instanceof HTMLElement && node.classList.contains('bili-album__watch')
              })
            const isImagePreviewExited =
              hasAlbumPreviewNode(record.removedNodes) || isAlbumVisible() === false
            if (isImagePreviewExited) {
              scrollIntoView(card.element)
              console.log('imagePreviewExited')
            }
            const isImagePreviewEntered =
              hasAlbumPreviewNode(record.addedNodes) || isAlbumVisible() === true
            if (isImagePreviewEntered) {
              const controlBar = dq(card.element, '.bili-album__watch__control')
              scrollIntoView(controlBar)
              console.log('imagePreviewEntered')
            }
          })
        })
        attributesSubtree(card.element, records => {
          records.forEach(record => {
            if (
              !(record.target instanceof HTMLImageElement) ||
              !record.target.matches('.bili-album__watch__content img') ||
              record.attributeName !== 'src'
            ) {
              return
            }
            const controlBar = dq(card.element, '.bili-album__watch__control')
            scrollIntoView(controlBar)
            console.log('imagePreviewSwitched')
          })
        })
      },
    })
  },
})
