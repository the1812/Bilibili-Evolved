import { defineComponentMetadata } from '@/components/define'
import { hasVideo } from '@/core/spin-query'
import { Toast } from '@/core/toast'
import { videoAndBangumiUrls } from '@/core/utils/urls'
import { PluginMinimalData } from '@/plugins/plugin'
import { DownloadVideoAssets } from '../download/types'
import { generateDownloadAssets } from './handler'
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

const pluginSetup: PluginMinimalData['setup'] = ({ addData }) => {
  addData('downloadVideo.assets', async (assets: DownloadVideoAssets[]) => {
    assets.push({
      name: componentName,
      displayName,
      getAssets: async (
        infos,
        instance: {
          enabled: boolean
        },
      ) => {
        const { enabled } = instance
        if (!enabled) {
          return []
        }
        const toast = Toast.info('生成视频快照中...', displayName)
        return generateDownloadAssets(infos, toast)
      },
      component: () => import('./Plugin.vue').then(m => m.default),
    })
  })
}

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
  plugin: {
    displayName: `下载视频 - ${displayName}支持`,
    author,
    setup: pluginSetup,
  },
})
