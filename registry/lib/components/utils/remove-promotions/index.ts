import { ComponentEntry } from '@/components/types'
import { defineComponentMetadata } from '@/components/define'

// const PromotionMark = 'data-be-promotion-mark'
const entry: ComponentEntry = async ({ settings, metadata }) => {
  const { addComponentListener } = await import('@/core/settings')
  if (document.URL.replace(window.location.search, '') === 'https://www.bilibili.com/') {
    const { selectAll, select } = await import('@/core/spin-query')
    select('.eva-extension-area').then(it => {
      if (!it) {
        return
      }
      it.parentElement.style.margin = '12px'
    })
    selectAll('.gg-pic').then((pictures: HTMLElement[]) => {
      if (pictures.length === 0) {
        return
      }
      pictures.forEach(element => {
        const a = element.parentElement
        a.style.display = 'none'
        const index = [...a.parentElement.childNodes].indexOf(a) + 1
        const li = a.parentElement.parentElement.querySelector(
          `.pic li:nth-child(${index})`,
        ) as HTMLElement
        if (li) {
          li.style.display = 'flex'
          const link = li.querySelector('a:not(.more-text)') as HTMLElement
          link.insertAdjacentHTML(
            'afterend',
            /* html */ `
            <div class="blocked-ads">${settings.options.showPlaceholder ? '🚫已屏蔽广告' : ''}</div>
          `,
          )
          link.style.visibility = 'hidden'
          const otherElements = [
            li.querySelector('a.more-text'),
            li.querySelector('img'),
          ] as HTMLElement[]
          otherElements.forEach(it => (it.style.display = 'none'))
        }
      })
    })
    select('.focus-carousel.home-slide').then(slide => {
      if (!slide) {
        return
      }
      dqa(slide, '.gg-icon,.bypb-icon')
        .map(it => it.parentElement.parentElement)
        .forEach(it => {
          it.style.display = 'none'
          it.insertAdjacentHTML(
            'afterend',
            /* html */ `
            <div class="blocked-ads new">${
              settings.options.showPlaceholder ? '🚫已屏蔽广告' : ''
            }</div>
          `,
          )
        })
    })
  }
  addComponentListener(
    `${metadata.name}.preserveEventBanner`,
    (value: boolean) => {
      document.body.classList.toggle('preserve-event-banner', value)
    },
    true,
  )
  addComponentListener(
    `${metadata.name}.preserveFeedGoods`,
    (value: boolean) => {
      document.body.classList.toggle('preserve-feed-goods', value)
    },
    true,
  )
  addComponentListener(
    `${metadata.name}.preserveReplyNotice`,
    (value: boolean) => {
      document.body.classList.toggle('preserve-reply-notice', value)
    },
    true,
  )
  addComponentListener(
    `${metadata.name}.showPlaceholder`,
    (value: boolean) => {
      document.body.classList.toggle('promotion-show-placeholder', value)
    },
    true,
  )
}
export const component = defineComponentMetadata({
  name: 'removePromotions',
  displayName: '删除广告',
  entry,
  instantStyles: [
    {
      name: 'removePromotions',
      style: () => import('./remove-promotions.scss'),
    },
  ],
  tags: [componentsTags.utils],
  options: {
    showPlaceholder: {
      displayName: '占位文本',
      defaultValue: true,
    },
    preserveEventBanner: {
      displayName: '保留活动横幅',
      defaultValue: false,
    },
    preserveFeedGoods: {
      displayName: '保留动态商品推荐',
      defaultValue: false,
    },
  },
})
