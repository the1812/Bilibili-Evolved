import { defineComponentMetadata } from '@/components/define'
import { ComponentEntry } from '@/components/types'
import { addComponentListener } from '@/core/settings'
import { select, selectAll } from '@/core/spin-query'
import { useScopedConsole } from '@/core/utils/log'
import { createComponentWithProps, RadioItem } from '@/ui'

const componentName = 'hideHomeCarousel'

const logger = useScopedConsole(componentName)

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

  // 监听样式切换选项
  const switchClasses = ['full', 'transparent', 'picture', 'footerText']
  switchClasses.forEach(c => {
    addComponentListener(
      `${metadata.name}.${c}`,
      (value: boolean) => {
        document.body.classList.toggle(`hideHomeCarousel-switch-${c}`, value)
      },
      true,
    )
  })
}

const items: Record<string, RadioItem> = {
  full: {
    name: 'full',
    isOption: true,
  },
  transparent: {
    name: 'transparent',
    isOption: true,
  },
  custom: {
    name: 'custom',
    isOption: true,
    optionsIncluded: ['disableCarousel', 'blur', 'picture', 'footerText'],
  },
}

const props = {
  title: '隐藏首页轮播图选项',
  groupName: `${componentName}-promotions-card`,
  items,
  componentName,
  icon: 'mdi-checkbox-marked-circle-outline',
}

export const component = defineComponentMetadata({
  name: componentName,
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
      hidden: true,
    },
    blur: {
      displayName: '图片模糊',
      defaultValue: 0,
      slider: {
        min: 0,
        max: 100,
        step: 1,
      },
      hidden: true,
    },
    full: {
      displayName: '完全隐藏',
      defaultValue: true,
      hidden: true,
    },
    transparent: {
      displayName: '透明化',
      defaultValue: false,
      hidden: true,
    },
    picture: {
      displayName: '隐藏轮播图片',
      defaultValue: false,
      hidden: true,
    },
    footerText: {
      displayName: '隐藏图片标题',
      defaultValue: false,
      hidden: true,
    },
    /** 无实际作用，仅用于记录选项组状态 */
    custom: {
      displayName: '自定义',
      defaultValue: false,
      hidden: true,
    },
  },
  extraOptions: () =>
    import('@/ui').then(m =>
      createComponentWithProps(m.OptionRadioGroup, { ...props, isPopup: false }),
    ),
  widget: {
    component: () =>
      import('@/ui').then(m =>
        createComponentWithProps(m.OptionRadioGroup, { ...props, isPopup: true }),
      ),
  },
})
