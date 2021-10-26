import { getJson } from '@/core/ajax'
import { Toast } from '@/core/toast'
import { loadSubtitleSettingsPanel } from '@/core/utils/lazy-panel'
import { logError } from '@/core/utils/log'
import { getFriendlyTitle } from '@/core/utils/title'
import { SubtitleConverterConfig } from '../subtitle-converter'

export type SubtitleDownloadType = 'json' | 'ass'
export const getSubtitleConfig = async (): Promise<[
  SubtitleConverterConfig,
  string,
]> => {
  const {
    SubtitleConverter,
    SubtitleSize,
    SubtitleLocation,
  } = await import('../subtitle-converter')

  const settingsPanel = await loadSubtitleSettingsPanel()
  if (!settingsPanel) {
    logError('未找到字幕设置')
    return [SubtitleConverter.defaultConfig, '']
  }
  const language = (settingsPanel.querySelector(
    '.bilibili-player-video-subtitle-setting-lan .bui-select-result',
  ) as HTMLElement).innerHTML
  const title = getFriendlyTitle(true)
  const fontSizeThumb = settingsPanel.querySelector(
    '.bilibili-player-video-subtitle-setting-fontsize .bui-thumb',
  ) as HTMLElement
  const translateX = parseFloat(
    fontSizeThumb.style.transform.replace(/translateX\(([\d\.]+)/, '$1'),
  )
  const fontSizeMapping: { [key: number]: number } = {
    214: SubtitleSize.VeryLarge,
    163.5: SubtitleSize.Large,
    107: SubtitleSize.Medium,
    50.5: SubtitleSize.Small,
    0: SubtitleSize.VerySmall,
  }
  const size = fontSizeMapping[translateX]

  const colorSpan = settingsPanel.querySelector(
    '.bilibili-player-video-subtitle-setting-color .bui-select-result span:first-child',
  ) as HTMLElement
  const color = colorSpan
    .getAttribute('style')
    .match(/background:[ ]*(.+);/)[1]

  const opacityDiv = settingsPanel.querySelector(
    '.bilibili-player-video-subtitle-setting-opacity .bui-bar',
  ) as HTMLElement
  const opacity = parseFloat(
    opacityDiv.style.transform.replace(/scaleX\(([\d\.]+)/, '$1'),
  )

  const positionDiv = dq('.subtitle-position') as HTMLElement
  const positions = {
    bc: SubtitleLocation.BottomCenter,
    bl: SubtitleLocation.BottomLeft,
    br: SubtitleLocation.BottomRight,
    tc: SubtitleLocation.TopCenter,
    tl: SubtitleLocation.TopLeft,
    tr: SubtitleLocation.TopRight,
  }
  const subtitleLocation = Object.entries(positions)
    .filter(([name]) => positionDiv.classList.contains(`subtitle-position-${name}`))
    .map(([, location]) => location)
    .shift()

  const video = dq('video') as HTMLVideoElement
  const config: SubtitleConverterConfig = {
    title,
    height: video.videoHeight,
    width: video.videoWidth,
    color,
    location: subtitleLocation,
    opacity,
    size,
    boxPadding: 1,
    boxMargin: 32,
  }
  return [config, language]
}
export const getSubtitleList = async (aid: string, cid: string | number) => {
  const { VideoInfo } = await import('@/components/video/video-info')
  const info = new VideoInfo(aid)
  info.cid = typeof cid === 'string' ? parseInt(cid) : cid
  await info.fetchInfo()
  return info.subtitles
}
export const getBlobByType = async (
  type: SubtitleDownloadType,
  input: {
    aid: string
    cid: string
    title: string
  } = { ...lodash.pick(unsafeWindow, 'aid', 'cid'), title: getFriendlyTitle(true) },
) => {
  const { aid, cid } = input
  if (!aid || !cid) {
    throw new Error('未找到视频AID和CID')
  }
  const subtitles = await getSubtitleList(aid, cid)
  if (subtitles.length === 0) {
    Toast.info('当前视频没有字幕.', '下载字幕', 3000)
    return null
  }
  const [config, language] = await getSubtitleConfig()
  const subtitle = subtitles.find(s => s.language === language) || subtitles[0]
  const json = await getJson(subtitle.url)
  const rawData = json.body
  switch (type) {
    case 'ass': {
      const { SubtitleConverter } = await import('../subtitle-converter')
      const converter = new SubtitleConverter({ ...config, title: input.title })
      const assText = await converter.convertToAss(rawData)
      return new Blob([assText], {
        type: 'text/ass',
      })
    }
    default:
    case 'json': {
      return new Blob([JSON.stringify(rawData)], {
        type: 'text/json',
      })
    }
  }
}
