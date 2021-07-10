import { ComponentMetadata } from '@/components/types'
import { toggleStyle } from '@/components/styled-component'
import { videoAndBangumiUrls } from '@/core/utils/urls'

export const component: ComponentMetadata = {
  ...toggleStyle('hideRelatedVideos', () => import('./related-videos.scss')),
  displayName: '隐藏视频推荐',
  tags: [
    componentsTags.style,
    componentsTags.video,
  ],
  description: {
    'zh-CN': '隐藏番剧和视频页面右侧的推荐视频列表. 注意: 如果你想关闭 b 站的自动连播(自动播放下一个推荐视频)功能, 需要先取消隐藏视频推荐才能看到开关.',
  },
  urlInclude: videoAndBangumiUrls,
}
