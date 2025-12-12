import { monkey } from '@/core/ajax'
import { Toast } from '@/core/toast'
import { logError } from '@/core/utils/log'
import { DownloadVideoOutput } from '../../../../components/video/download/types'

interface AbdmConfig {
  host: string
  port: string
}

const sendAbdmRequest = async (config: AbdmConfig, downloadSources: any[]) => {
  try {
    const url = `http://${config.host}:${config.port}/add`
    await monkey({
      method: 'POST',
      url,
      data: JSON.stringify(downloadSources),
      headers: { 'Content-Type': 'application/json' },
    })
    return { success: true }
  } catch (error) {
    return { success: false, message: error.toString() }
  }
}

export const abdmRest: DownloadVideoOutput = {
  name: 'abdmRest',
  displayName: 'ABDM 外部下载器',
  description: '使用 ABDM 外部下载器发送下载请求.',
  runAction: async (action, instance: Vue & { abdmConfig: AbdmConfig }) => {
    const { infos } = action
    const { abdmConfig } = instance

    const downloadSources = infos
      .map(info =>
        info.titledFragments.map(fragment => ({
          link: fragment.url,
          headers: {
            referer: document.URL.replace(window.location.search, ''),
          },
        })),
      )
      .flat()

    const result = await sendAbdmRequest(abdmConfig, downloadSources)

    if (result.success) {
      Toast.success(`成功发送了 ${downloadSources.length} 个下载请求`, 'ABDM', 3000)
    } else {
      logError(`ABDM 请求失败: ${result.message}`)
    }
  },
  component: () => import('./AbdmConfig.vue').then(m => m.default),
}
