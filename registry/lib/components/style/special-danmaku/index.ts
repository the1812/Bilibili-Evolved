import { ComponentEntry, ComponentMetadata } from '@/components/types'
import { toggleStyle } from '@/components/styled-component'
import { playerUrls } from '@/core/utils/urls'
import { addComponentListener } from '@/core/settings'

const entry: ComponentEntry = ({ metadata, settings: { options } }) => {
  Object.keys(options).forEach(disableType => {
    addComponentListener(`${metadata.name}.${disableType}`, (value: boolean) => {
      document.body.classList.toggle(`disable-${disableType}-danmaku-style`, value)
    }, true)
  })
}
export const component: ComponentMetadata = {
  displayName: '禁用特殊弹幕样式',
  tags: [
    componentsTags.style,
  ],
  ...toggleStyle('disableSpecialDanmaku', () => import('./special-danmaku.scss'), entry),
  urlInclude: playerUrls,
  description: {
    'zh-CN': '移除高赞弹幕或UP主弹幕的特殊样式, 弹幕内容不会移除.',
  },
  options: {
    highlight: {
      displayName: '禁用高赞弹幕',
      defaultValue: true,
    },
    up: {
      displayName: '禁用UP主弹幕',
      defaultValue: true,
    },
  },
}
