import { defineComponentMetadata } from '@/components/define'
import { ComponentEntry } from '@/components/types'
import { addComponentListener } from '@/core/settings'

const entry: ComponentEntry = async ({ metadata, settings }) => {
  Object.keys(settings.options).forEach(disableType => {
    addComponentListener(
      `${metadata.name}.${disableType}`,
      (value: boolean) => {
        document.body.classList.toggle(`hide-home-carousel-${disableType}`, value)
      },
      true,
    )
  })
}

export const component = defineComponentMetadata({
  name: 'hideHomeCarousel',
  displayName: '隐藏首页轮播图',
  entry,
  tags: [componentsTags.style],
  urlInclude: [/^https:\/\/www\.bilibili\.com\/$/, /^https:\/\/www\.bilibili\.com\/index\.html$/],
  instantStyles: [
    {
      name: 'hide-home-carousel',
      style: () => import('./hide-home-carousel.scss'),
    },
  ],
  options: {
    full: {
      displayName: '完全隐藏',
      defaultValue: true,
    },
    transparent: {
      displayName: '透明化（保留占位）',
      defaultValue: false,
    },
  },
})
