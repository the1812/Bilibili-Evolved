import { defineComponentMetadata } from '@/components/define'
import { ComponentEntry } from '@/components/types'
import { select } from '@/core/spin-query'

const entry: ComponentEntry = async ({ settings }) => {
  select('.recommended-swipe').then((e: HTMLElement) => {
    if (settings.options.keepPlaceholder) {
      e.style.opacity = '0'
    } else {
      e.style.display = 'none'
    }
  })
}

export const component = defineComponentMetadata({
  name: 'hideHomeCarousel',
  displayName: '隐藏首页轮播图',
  entry,
  tags: [componentsTags.style],
  urlInclude: [/^https:\/\/www\.bilibili\.com\/$/, /^https:\/\/www\.bilibili\.com\/index\.html$/],
  options: {
    keepPlaceholder: {
      displayName: '保留占位',
      defaultValue: false,
    },
  },
})
