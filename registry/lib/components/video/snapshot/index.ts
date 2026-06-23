import { defineComponentMetadata } from '@/components/define'
import { hasVideo } from '@/core/spin-query'
import { videoAndBangumiUrls } from '@/core/utils/urls'
import { options } from './options'

export const componentName = 'videoSnapshot'
export const displayName = '视频快照'

const author = [
  {
    name: 'WakelessSloth56',
    link: 'https://github.com/WakelessSloth56',
  },
  {
    name: 'LainIO24',
    link: 'https://github.com/LainIO24',
  },
]

export const component = defineComponentMetadata({
  name: componentName,
  displayName,
  description: '查看视频多个时间点的快照预览图',
  author,
  tags: [componentsTags.video],
  entry: none,
  urlInclude: videoAndBangumiUrls,
  options,
  widget: {
    condition: hasVideo,
    component: () => import('./ViewSnapshots.vue').then(m => m.default),
  },
  // TODO videoSnapshot plugin
  // plugin: {
  //   displayName: `下载视频 - ${title}支持`,
  // },
})
