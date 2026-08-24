import { playerUrls } from '@/core/utils/urls'
import { ExtendSpeedComponent, Options } from './component'

export const component = ExtendSpeedComponent.create<Options>({
  name: 'extendVideoSpeed',
  displayName: '扩展倍速',
  author: {
    name: 'JLoeve',
    link: 'https://github.com/LonelySteve',
  },
  tags: [componentsTags.video],
  urlInclude: playerUrls,
  options: {
    maxMenuHeight: {
      displayName: '倍速菜单最大高度',
      defaultValue: 360,
      hidden: true,
      validator: val => Math.max(parseInt(val), 360) || 360,
    },
    hideScrollbar: {
      displayName: '隐藏滚动条',
      defaultValue: false,
    },
    hideRemoveBtn: {
      displayName: '隐藏移除图标',
      defaultValue: false,
    },
    hideAddBtn: {
      displayName: '隐藏新增图标',
      defaultValue: false,
    },
    extendSpeedList: {
      displayName: '扩展倍速列表',
      defaultValue: [2.5, 3],
      hidden: true,
    },
  },
})
