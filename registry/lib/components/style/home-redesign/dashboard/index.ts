import { defineComponentMetadata } from '@/components/define'
import { contentLoaded } from '@/core/life-cycle'
import { mountVueComponent } from '@/core/utils'
import { resumeNativeFeedLoading, suspendNativeFeedLoading } from '../suspend-native-feed'
import { homeUrls } from '../urls'
import { dashboardHomeOptionsMetadata } from './options'

export const component = defineComponentMetadata({
  name: 'dashboardHome',
  displayName: '仪表盘首页',
  tags: [componentsTags.style],
  author: [
    { name: 'ajtn123', link: 'https://github.com/ajtn123' },
    { name: 'Codex', link: 'https://openai.com/codex/' },
  ],
  urlInclude: homeUrls,
  options: dashboardHomeOptionsMetadata,
  instantStyles: [
    {
      name: 'dashboard-home-hide-original',
      style: () => import('../hide-original.scss'),
    },
    {
      name: 'dashboard-home',
      style: () => import('./styles/index.scss'),
    },
  ],
  entry: () => {
    suspendNativeFeedLoading()
    contentLoaded(async () => {
      const DashboardHome = await import('./DashboardHome.vue')
      const dashboardHome = mountVueComponent(DashboardHome)
      document.body.appendChild(dashboardHome.$el)
    })
  },
  unload: () => {
    document.querySelector<HTMLDialogElement>('.dashboard-home-link-preview[open]')?.close()
    document.body.classList.add('home-redesign-off')
    resumeNativeFeedLoading()
  },
  reload: () => {
    document.body.classList.remove('home-redesign-off')
    suspendNativeFeedLoading()
  },
})
