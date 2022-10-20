import { defineComponentMetadata } from '@/components/define'
import { videoUrls } from '@/core/utils/urls'

const entry = async () => {
  const { select } = await import('@/core/spin-query')
  const likeButton = (await select(':is(.ops, .video-toolbar-v1) span.like')) as HTMLElement
  if (!likeButton) {
    return
  }
  likeButton.style.userSelect = 'none'
  const mountEvent = (name: string, args: EventInit) => {
    const event = new CustomEvent(name, args)
    likeButton.dispatchEvent(event)
  }

  const clickInterval = 200
  let click = true
  likeButton.addEventListener('touchstart', e => {
    e.preventDefault()
    click = true
    setTimeout(() => (click = false), clickInterval)
    mountEvent('mousedown', e)
  })
  likeButton.addEventListener('touchend', e => {
    e.preventDefault()
    mountEvent('mouseup', e)
    if (click) {
      mountEvent('click', e)
    }
  })
}
export const component = defineComponentMetadata({
  name: 'touchComboLike',
  displayName: '三连触摸支持',
  tags: [componentsTags.touch],
  enabledByDefault: navigator.maxTouchPoints > 0,
  entry,
  description: {
    'zh-CN': '为视频页面中的三连操作 (长按点赞) 启用触摸支持.',
  },
  urlInclude: videoUrls,
})
