import { ComponentMetadata, componentsTags } from '@/components/component'

const entry = async () => {
  const { childList } = await import('@/core/observer')
  const { Toast } = await import('@/core/toast')
  const { dq } = await import('@/core/utils')
  const unlock = (container: Element) => {
    const image = container.querySelector('.image-viewer') as HTMLImageElement
    if (image === null) {
      console.log(container)
    } else {
      image.addEventListener('contextmenu', () => {
        setTimeout(() => {
          const popupMessage = dq('.pop-message .toast-text')
          if (popupMessage && popupMessage.innerHTML.includes('作者设置了禁止保存')) {
            Toast.success(/* html */`<img src="${image.src}" width="200">`, '解除动态存图限制')
          }
        }, 200)
      })
    }
  }
  [...document.body.children].filter(it => it.classList.contains('photo-imager-container'))
    .forEach(unlock)
  childList(document.body, records => {
    records.forEach(record => {
      const photoContainers = [...record.addedNodes].filter(it => it instanceof Element && it.classList.contains('photo-imager-container')) as Element[]
      photoContainers.forEach(unlock)
    })
  })
}

export const component: ComponentMetadata = {
  name: 'feedsImageSaver',
  displayName: '解除动态存图限制',
  entry,
  enabledByDefault: false,
  hidden: true,
  tags: [
    componentsTags.feeds,
  ],
  urlInclude: [
    '//t.bilibili.com/',
    '//live.bilibili.com/',
    '//space.bilibili.com/',
  ],
}
