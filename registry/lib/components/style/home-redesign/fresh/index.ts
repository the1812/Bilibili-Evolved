import { ComponentMetadata } from '@/components/types'
import { contentLoaded } from '@/core/life-cycle'
import { addComponentListener } from '@/core/settings'
import { getNumberValidator, mountVueComponent } from '@/core/utils'
import { homeUrls } from '../urls'

export const component: ComponentMetadata = {
  name: 'freshHome',
  displayName: '清爽首页',
  description: `
使用重新设计的清爽风格首页替换原本的首页.

- 个性化推荐: 启用时展示推荐视频, 禁用时展示热门视频
- 启用横向滚动: 在可以横向滚动的列表中, 使鼠标滚轮可以做出横向滚动的效果, 请注意这会禁用卡片的边缘吸附效果.

`.trim(),
  urlInclude: homeUrls,
  tags: [
    componentsTags.style,
  ],
  entry: () => {
    addComponentListener('freshHome.maxWidth', (width: number) => {
      document.documentElement.style.setProperty('--home-max-width-override', `${width}px`)
    }, true)
    contentLoaded(async () => {
      const FreshHome = await import('./FreshHome.vue')
      const freshHome = mountVueComponent(FreshHome)
      document.body.appendChild(freshHome.$el)
    })
  },
  options: {
    layoutOptions: {
      displayName: '版块设置',
      defaultValue: {
        trending: {
          linebreak: true,
        },
        areas: {
          linebreak: true,
        },
      },
      hidden: true,
    },
    personalized: {
      displayName: '个性化推荐',
      defaultValue: false,
    },
    horizontalWheelScroll: {
      displayName: '启用横向滚动',
      defaultValue: false,
    },
    maxWidth: {
      displayName: '最大宽度 (px)',
      defaultValue: 1440,
      validator: getNumberValidator(1000, 3000),
    },
  },
  unload: () => document.body.classList.add('home-redesign-off'),
  reload: () => document.body.classList.remove('home-redesign-off'),
  instantStyles: [
    {
      name: 'fresh-home-hide-original',
      style: () => import('../hide-original.scss'),
    },
  ],
}
