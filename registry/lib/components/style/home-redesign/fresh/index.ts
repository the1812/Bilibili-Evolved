import { defineComponentMetadata } from '@/components/define'
import { contentLoaded } from '@/core/life-cycle'
import { addComponentListener } from '@/core/settings'
import { mountVueComponent } from '@/core/utils'
import { homeUrls } from '../urls'
import { freshHomeOptionsMetadata } from './types'

export const component = defineComponentMetadata({
  name: 'freshHome',
  displayName: '清爽首页',
  urlInclude: homeUrls,
  tags: [componentsTags.style],
  entry: () => {
    addComponentListener(
      'freshHome.maxWidth',
      (width: number) => {
        document.documentElement.style.setProperty('--home-max-width-override', `${width}px`)
      },
      true,
    )
    contentLoaded(async () => {
      const FreshHome = await import('./FreshHome.vue')
      const freshHome = mountVueComponent(FreshHome)
      document.body.appendChild(freshHome.$el)
    })
  },
  options: freshHomeOptionsMetadata,
  extraOptions: () => import('./ExtraOptions.vue'),
  unload: () => document.body.classList.add('home-redesign-off'),
  reload: () => document.body.classList.remove('home-redesign-off'),
  instantStyles: [
    {
      name: 'fresh-home-hide-original',
      style: () => import('../hide-original.scss'),
    },
  ],
})
