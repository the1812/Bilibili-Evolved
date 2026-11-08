import { meta } from '@/core/meta'
import type { ComponentMetadata } from '@/components/types'

const feedbackFormUrl = 'https://github.com/the1812/Bilibili-Evolved/issues/new'
const videoPageFallbackText = '当前不是视频页面'

const namespace = GM_info.scriptMetaStr.match(/@namespace\s*(.+)/)?.[1]
export const feedbackSupported = !namespace?.includes('greasyfork')

const getBrowserVersion = () => {
  const { userAgentData } = navigator
  if (!userAgentData) {
    return navigator.userAgent
  }
  return userAgentData.brands
    .filter(({ brand }) => brand.replace(/[^a-z]/gi, '').toLowerCase() !== 'notabrand')
    .map(({ brand, version }) => `${brand} ${version}`)
    .join(', ')
}

const getPlayerLogs = async () => {
  const { playerAgent } = await import('@/components/video/player-agent')
  const { nativeApi } = playerAgent
  if (!nativeApi?.getFormattedLogs) {
    return videoPageFallbackText
  }
  try {
    const logs = nativeApi.getFormattedLogs()
    const header = logs
      .match(
        /--------------- Header\(S\) ---------------([\s\S]*?)--------------- Header\(E\) ---------------/,
      )?.[1]
      .trim()
    const playerLogs = header || '未找到播放器日志 Header'
    const preferCodec = nativeApi.getPreferCodec?.()
    return preferCodec === undefined ? playerLogs : `${playerLogs}\npreferCodec: ${preferCodec}`
  } catch (error) {
    return `播放器日志读取失败: ${String(error)}`
  }
}

export const openFeedback = async (component?: ComponentMetadata) => {
  const params = new URLSearchParams({
    template: 'bug_report.yml',
    'script-version': meta.compilationInfo.versionWithTag,
    'script-manager-version': `${GM_info.scriptHandler} v${GM_info.version}`,
    'browser-version': getBrowserVersion(),
    'player-logs': await getPlayerLogs(),
  })
  if (component) {
    const { displayName, name, commitHash } = component
    const feature = `${displayName} (${name})`
    params.set('feature', commitHash ? `${feature}\nCommit: ${commitHash}` : feature)
  }
  window.open(`${feedbackFormUrl}?${params}`, '_blank', 'noopener')
}
