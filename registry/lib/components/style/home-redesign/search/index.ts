import { defineComponentMetadata } from '@/components/define'
import { contentLoaded } from '@/core/life-cycle'
import { mountVueComponent } from '@/core/utils'
import { homeUrls } from '../urls'

export const component = defineComponentMetadata({
  name: 'searchHome',
  displayName: '搜索首页',
  author: {
    name: 'mintonight',
    link: 'https://github.com/mintonight',
  },
  urlInclude: homeUrls,
  tags: [componentsTags.style],
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
  ],
})
