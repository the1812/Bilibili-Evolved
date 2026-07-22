import { meta } from '@/core/meta'

const feedbackFormUrl = 'https://github.com/the1812/Bilibili-Evolved/issues/new'
const videoPageFallbackText = '当前不是视频页面'

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
    return header || '未找到播放器日志 Header'
  } catch (error) {
    return `播放器日志读取失败: ${String(error)}`
  }
}

const createFeedbackUrl = async () => {
  const params = new URLSearchParams({
    template: 'bug_report.yml',
    'script-version': meta.compilationInfo.versionWithTag,
    'script-manager-version': `${GM_info.scriptHandler} v${GM_info.version}`,
    'browser-version': getBrowserVersion(),
    'player-logs': await getPlayerLogs(),
  })
  return `${feedbackFormUrl}?${params}`
}

export const openFeedback = async () => {
  const url = await createFeedbackUrl()
  window.open(url, '_blank')
}
