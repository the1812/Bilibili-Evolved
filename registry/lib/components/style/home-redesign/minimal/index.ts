import { defineComponentMetadata, defineOptionsMetadata } from '@/components/define'
import { contentLoaded } from '@/core/life-cycle'
import { addComponentListener } from '@/core/settings'
import { mountVueComponent, getNumberValidator } from '@/core/utils'
import { homeUrls } from '../urls'
import { MinimalHomeTabOption } from './types'

export const minimalHomeOptionsMetadata = defineOptionsMetadata({
  personalized: {
    displayName: '个性化推荐',
    defaultValue: false,
  },
  columnCount: {
    displayName: '自定义列数',
    defaultValue: 0,
    validator: getNumberValidator(0, 10),
  },
  defaultTab: {
    displayName: '默认标签页',
    defaultValue: MinimalHomeTabOption.Feeds,
    dropdownEnum: MinimalHomeTabOption,
  },
})
export const component = defineComponentMetadata({
  name: 'minimalHome',
  displayName: '极简首页',
  urlInclude: homeUrls,
  tags: [componentsTags.style],
  entry: () => {
    addComponentListener(
      'minimalHome.columnCount',
      (count: number) => {
        document.documentElement.style.setProperty('--home-column-count-override', count.toString())
      },
      true,
    )
    contentLoaded(async () => {
      const MinimalHome = await import('./MinimalHome.vue')
      const minimalHome = mountVueComponent(MinimalHome)
      document.body.appendChild(minimalHome.$el)
    })
  },
  options: minimalHomeOptionsMetadata,
  unload: () => document.body.classList.add('home-redesign-off'),
  reload: () => document.body.classList.remove('home-redesign-off'),
  instantStyles: [
    {
      name: 'minimal-home-hide-original',
      style: () => import('../hide-original.scss'),
    },
  ],
})
