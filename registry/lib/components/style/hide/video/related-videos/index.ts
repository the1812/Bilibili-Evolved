import { defineComponentMetadata } from '@/components/define'
import { videoAndBangumiUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'hideRelatedVideos',
  displayName: '隐藏视频推荐',
  entry: none,
  instantStyles: [
    {
      name: 'hideRelatedVideos',
      style: () => import('./related-videos.scss'),
    },
  ],
  tags: [componentsTags.style, componentsTags.video],
  description: {
    'zh-CN':
      '隐藏番剧和视频页面右侧的推荐视频列表. 注意: 如果你想关闭 b 站的自动连播 (自动播放下一个推荐视频) 功能, 需要先取消隐藏视频推荐才能看到开关.',
  },
  urlInclude: videoAndBangumiUrls,
})
