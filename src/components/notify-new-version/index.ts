import { defineComponentMetadata } from '@/components/define'
import { componentsTags } from '../types'
import { getReleaseContent, getUpdateUrl, showReleaseContent } from './release-content'

export const component = defineComponentMetadata({
  name: 'notifyNewVersion',
  displayName: '新版本提示',
  description: '定期检查脚本本体的更新, 并弹出提示.',
  tags: [componentsTags.utils],
  options: {
    lastUpdateCheck: {
      displayName: '最后检查更新日期',
      defaultValue: 0,
      hidden: true,
    },
    minimumDuration: {
      displayName: '更新间隔 (ms)',
      defaultValue: 1000 * 3600 * 24,
    },
  },
  entry: async ({ settings: { options } }) => {
    try {
      const { Version } = await import('@/core/version')
      const { monkey } = await import('@/core/ajax')
      const { meta } = await import('@/core/meta')
      const { Toast } = await import('@/core/toast')
      const { isDataSaveMode } = await import('@/core/utils')
      if (isDataSaveMode()) {
        return
      }
      const now = Number(new Date())
      const duration = now - options.lastUpdateCheck
      if (duration < options.minimumDuration) {
        // 未到间隔期
        return
      }
      // 本地调试版不检查
      if (!GM_info.scriptUpdateURL) {
        return
      }
      const updateUrl = await getUpdateUrl()
      const scriptText: string = await monkey({
        url: updateUrl,
        responseType: 'text',
      })
      options.lastUpdateCheck = Number(new Date())
      const versionMatch = scriptText.match(/^\/\/ @version\s*([\d.]+)$/m)
      if (!versionMatch?.[1]) {
        console.warn('[新版本提示] 未能检测出脚本版本, scriptText.length =', scriptText.length)
        return
      }
      const latestVersion = new Version(versionMatch[1])
      const currentVersion = new Version(meta.compilationInfo.version)
      if (!latestVersion.greaterThan(currentVersion)) {
        return
      }
      const releaseContent = await getReleaseContent(latestVersion.versionString)
      const toast = Toast.info(
        /* html */ `新版本 <span>${latestVersion.versionString}</span> 已发布. <span class="view-details link">查看详情</span>`,
        '检查更新',
      )
      const element = await toast.element
      element.querySelector('.view-details').addEventListener('click', () => {
        showReleaseContent(releaseContent)
      })
    } catch (error) {
      console.warn('[新版本提示] 检查更新时发生错误: ', error)
    }
  },
})
