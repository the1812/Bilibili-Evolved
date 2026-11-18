import { defineComponentMetadata, defineOptionsMetadata } from '@/components/define'
import { contentLoaded } from '@/core/life-cycle'
import { mountVueComponent, getNumberValidator } from '@/core/utils'
import { homeUrls } from '../urls'
import { DashboardHomeTabOption } from './types'

export const dashboardHomeOptionsMetadata = defineOptionsMetadata({
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
    defaultValue: DashboardHomeTabOption.Feeds,
    dropdownEnum: DashboardHomeTabOption,
  },
})

export const component = defineComponentMetadata({
  name: 'dashboardHome',
  displayName: '仪表盘首页',
  urlInclude: homeUrls,
  tags: [componentsTags.style],
  author: {
    name: 'ajtn123',
    link: 'https://github.com/ajtn123',
  },
  entry: () => {
    contentLoaded(async () => {
      const DashboardHome = await import('./DashboardHome.vue')
      const dashboardHome = mountVueComponent(DashboardHome)
      document.body.appendChild(dashboardHome.$el)
    })
  },
  options: dashboardHomeOptionsMetadata,
  unload: () => document.body.classList.add('home-redesign-off'),
  reload: () => document.body.classList.remove('home-redesign-off'),
  instantStyles: [
    {
      name: 'dashboard-home-hide-original',
      style: () => import('../hide-original.scss'),
    },
    {
      name: 'dashboard-home',
      style: () => import('./dashboard.scss'),
    },
  ],
})
