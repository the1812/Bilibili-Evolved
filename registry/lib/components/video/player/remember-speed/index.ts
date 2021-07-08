import { ComponentMetadata } from '@/components/types'
import { playerUrls } from '@/core/utils/urls'

export const component: ComponentMetadata = {
  name: 'rememberVideoSpeed',
  displayName: '记忆上次播放速度',
  description: {
    'zh-CN': '记忆上次选择的视频播放速度, 还可以使用更多倍速来扩展原生倍速菜单.',
  },
  tags: [componentsTags.video],
  enabledByDefault: true,
  urlInclude: playerUrls,
  entry: async () => {
    const { VideoSpeedController } = await import('./controller')
    VideoSpeedController.init()
    return VideoSpeedController
  },
  options: {
    speed: {
      displayName: '记忆的速度',
      defaultValue: '1.0',
      hidden: true,
    },
    extend: {
      displayName: '扩展倍速菜单',
      defaultValue: true,
    },
    extendList: {
      displayName: '扩展倍速列表',
      defaultValue: [2.5, 3],
      hidden: true,
    },
    individualRemember: {
      displayName: '各视频分别记忆',
      defaultValue: false,
      hidden: true,
    },
    individualRememberList: {
      displayName: '分别记忆倍速列表',
      defaultValue: {},
      hidden: true,
    },
  },
}
