import { defineComponentMetadata } from '@/components/define'
import { contentLoaded } from '@/core/life-cycle'
import { addComponentListener } from '@/core/settings'
import { mountVueComponent } from '@/core/utils'
import { homeUrls } from '../urls'
import { searchHomeOptions, searchHomeOptionsMetadata } from './options'

const applyBackground = () => {
  const { backgroundColor, backgroundImage } = searchHomeOptions
  document.documentElement.style.setProperty('--search-home-bg-color', backgroundColor || '#ffffff')
  const image = backgroundImage?.trim()
  document.documentElement.style.setProperty(
    '--search-home-bg-image',
    image ? `url(${JSON.stringify(image)})` : 'none',
  )
}

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
    addComponentListener('searchHome.backgroundColor', applyBackground, true)
    addComponentListener('searchHome.backgroundImage', applyBackground, true)
    contentLoaded(async () => {
      const SearchHome = await import('./SearchHome.vue')
      const searchHome = mountVueComponent(SearchHome)
      document.body.appendChild(searchHome.$el)
    })
  },
  unload: () => {
    document.body.classList.add('home-redesign-off')
    document.documentElement.style.removeProperty('--search-home-bg-color')
    document.documentElement.style.removeProperty('--search-home-bg-image')
  },
  reload: () => {
    document.body.classList.remove('home-redesign-off')
    applyBackground()
  },
  instantStyles: [
    {
      name: 'search-home-hide-original',
      style: () => import('../hide-original.scss'),
    },
    {
      name: 'search-home',
      style: () => import('./search-home.scss'),
    },
  ],
})
