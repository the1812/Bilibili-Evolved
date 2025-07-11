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
      displayName: '隐藏轮播区域占位',
      defaultValue: true,
    },
    transparent: {
      displayName: '透明化轮播区域',
      defaultValue: false,
    },
    picture: {
      displayName: '隐藏轮播图片',
      defaultValue: false,
    },
    footerText: {
      displayName: '隐藏图片标题',
      defaultValue: false,
    },
  },
})
