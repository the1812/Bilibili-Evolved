import { playerUrls } from '@/core/utils/urls'
import { MAX_BROWSER_SPEED_VALUE, MIN_BROWSER_SPEED_VALUE } from '../common/speed'
import { Options, RememberSpeedComponent } from './component'

export const component = RememberSpeedComponent.create<Options>({
  name: 'rememberVideoSpeed',
  displayName: '记忆倍速',
  author: {
    name: 'JLoeve',
    link: 'https://github.com/LonelySteve',
  },
  tags: [componentsTags.video],
  urlInclude: playerUrls,
  options: {
    globalSpeed: {
      displayName: '全局记忆倍速值',
      defaultValue: 1,
      validator: val =>
        lodash.clamp(parseFloat(val), MIN_BROWSER_SPEED_VALUE, MAX_BROWSER_SPEED_VALUE) || 1,
    },
    fixGlobalSpeed: {
      displayName: '固定全局倍速值',
      defaultValue: false,
    },
    individualRemember: {
      displayName: '各视频分别记忆',
      defaultValue: false,
    },
    individualRememberRecord: {
      displayName: '独立记忆倍速记录',
      defaultValue: {},
      hidden: true,
    },
    showRestoreTip: {
      displayName: '弹出还原倍速提示',
      defaultValue: true,
    },
  },
})
