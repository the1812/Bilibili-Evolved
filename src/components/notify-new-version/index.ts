import { monkey } from '@/core/ajax'
import { meta } from '@/core/meta'
import { Toast } from '@/core/toast'
import { Version } from '@/core/version'
import { ComponentMetadata, componentsTags } from '../types'

export const component: ComponentMetadata = {
  name: 'notifyNewVersion',
  displayName: '新版本提示',
  description: '定期检查脚本本体的更新, 并弹出提示.',
  tags: [
    componentsTags.utils,
  ],
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
      const now = Number(new Date())
      const duration = now - options.lastUpdateCheck
      if (duration < options.minimumDuration) { // 未到间隔期
        return
      }
      const updateUrl = GM_info.scriptUpdateURL
      if (!updateUrl) { // 本地调试版没有 updateUrl
        return
      }
      const scriptText: string = await monkey({ url: updateUrl, responseType: 'text' })
      options.lastUpdateCheck = Number(new Date())
      const versionMatch = scriptText.match(/^\/\/ @version\s*([\d\.]+)$/m)
      if (!versionMatch?.[1]) {
        console.warn('[新版本提示] 未能检测出脚本版本, scriptText.length =', scriptText.length)
        return
      }
      const latestVersion = new Version(versionMatch[1])
      const currentVersion = new Version(meta.compilationInfo.version)
      if (!latestVersion.greaterThan(currentVersion)) {
        return
      }
      Toast.info(/* html */`新版本 <span>${latestVersion.versionString}</span> 已发布. <a href="https://github.com/the1812/Bilibili-Evolved/releases" target="_blank" class="link">更新说明</a><a href="${updateUrl}" target="_blank" class="link">安装</a>`, '检查更新')
    } catch (error) {
      console.warn('[新版本提示] 检查更新时发生错误: ', error)
    }
  },
}
