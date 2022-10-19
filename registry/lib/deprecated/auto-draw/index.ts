import { defineComponentMetadata } from '@/components/define'
import { liveUrls } from '@/core/utils/urls'

const entry = async () => {
  const { sq } = await import('@/core/spin-query')
  const { childListSubtree, attributes } = await import('@/core/observer')
  const popupContainer = await sq(
    () => dq('.chat-popups-section'),
    (it: HTMLElement) => it !== null && it.querySelector('chat-draw-area') === null,
  )
  if (!popupContainer) {
    console.warn('[自动领奖] 未能找到弹窗容器')
    return
  }
  childListSubtree(popupContainer, () => {
    console.log('draw button = ', dq('.chat-popups-section .draw>span:nth-child(3)'))
    const draw = dq('.chat-popups-section .draw>span:nth-child(3)') as HTMLSpanElement | null
    if (draw === null) {
      const drawWaiting = dq(
        '.chat-popups-section .function-bar>span:nth-child(3)',
      ) as HTMLSpanElement | null
      if (drawWaiting !== null) {
        const [observer] = attributes(drawWaiting, () => {
          if (drawWaiting.style.display !== 'none') {
            observer.disconnect()
            drawWaiting.click()
          }
        })
      }
    }
    if (draw !== null) {
      draw.click()
    }
  })
}
export const component = defineComponentMetadata({
  name: 'liveAutoDraw',
  displayName: '直播间自动抽奖',
  description: {
    'zh-CN':
      '在当前直播间有抽奖活动时, 自动点击抽奖按钮. 注意只适用于少量抽奖, 那种99+限量抽奖可能跟不上其他人的手速(',
  },
  tags: [componentsTags.live],
  entry,
  urlInclude: liveUrls,
})
