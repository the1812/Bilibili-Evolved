import { wrapSwitchOptions } from '@/components/switch-options'
import { ComponentEntry } from '@/components/types'
import { addComponentListener } from '@/core/settings'
import { select, selectAll } from '@/core/spin-query'
import { useScopedConsole } from '@/core/utils/log'

const logger = useScopedConsole('hideHomeCarousel')

// 轮播容器 mouseleave 事件拦截
const onCarouselMouseLeaveHandler = (event: MouseEvent) => {
  event.stopPropagation()
}

const entry: ComponentEntry = async ({ metadata }) => {
  // 监听【禁用轮播】选项
  addComponentListener(
    `${metadata.name}.disableCarousel`,
    async (value: boolean) => {
      const node = (await select('.vui_carousel')) as HTMLElement
      if (!node) {
        logger.error('找不到轮播容器节点')
        return
      }

      if (value) {
        node.addEventListener('mouseleave', onCarouselMouseLeaveHandler, true)
        // 触发事件停止轮播
        const event = new MouseEvent('mouseenter')
        node.dispatchEvent(event)
      } else {
        node.removeEventListener('mouseleave', onCarouselMouseLeaveHandler, true)
        // 触发事件恢复轮播
        const event = new MouseEvent('mouseleave')
        node.dispatchEvent(event)
      }
    },
    true,
  )

  // 监听【图片模糊】选项
  addComponentListener(
    `${metadata.name}.blur`,
    async (value: number) => {
      const nodes = (await selectAll('.vui_carousel__slide')) as HTMLElement[]
      if (!nodes || nodes.length === 0) {
        logger.error('找不到轮播图片节点')
        return
      }

      nodes.forEach(node => {
        node.style.setProperty('--blur-amount', `${value}px`)
      })
    },
    true,
  )
}

export const component = wrapSwitchOptions({
  name: 'hideHomeCarouselOptions',
  switches: {
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
})({
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
    disableCarousel: {
      displayName: '禁用轮播',
      defaultValue: false,
    },
    blur: {
      displayName: '图片模糊',
      defaultValue: 0,
      slider: {
        min: 0,
        max: 100,
        step: 1,
      },
    },
  },
})
