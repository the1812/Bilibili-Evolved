import { defineComponentMetadata } from '@/components/define'
import { contentLoaded } from '@/core/life-cycle'
import { mountVueComponent } from '@/core/utils'
import { homeUrls } from '../urls'
import { searchHomeOptionsMetadata } from './options'

export const component = defineComponentMetadata({
  name: 'searchHome',
  displayName: '搜索首页',
  author: {
    name: 'mintonight',
    link: 'https://github.com/mintonight',
  },
  urlInclude: homeUrls,
  tags: [componentsTags.style],
  options: searchHomeOptionsMetadata,
  entry: () => {
    contentLoaded(async () => {
      const SearchHome = await import('./SearchHome.vue')
      const searchHome = mountVueComponent(SearchHome)
      document.body.appendChild(searchHome.$el)
    })
  },
  unload: () => document.body.classList.add('home-redesign-off'),
  reload: () => document.body.classList.remove('home-redesign-off'),
  instantStyles: [
    {
      name: 'search-home-hide-original',
      style: () => import('../hide-original.scss'),
    },
    {
      name: 'search-home-hide-banner-inner',
      style: () => import('./hide-banner-inner.scss'),
    },
  ],
})
