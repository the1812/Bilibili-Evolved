import { getJson } from '@/core/ajax'
import { Toast } from '@/core/toast'
import { getFriendlyTitle } from '@/core/utils/title'

import type { SubtitleConverterConfig } from '../subtitle-converter'

export type SubtitleDownloadType = 'json' | 'ass'
export const getSubtitleConfig = async (): Promise<[SubtitleConverterConfig, string]> => {
  const { SubtitleConverter, SubtitleSize, SubtitleLocation } = await import(
    '../subtitle-converter'
  )
  const { playerAgent } = await import('@/components/video/player-agent')
  const isBpxPlayer = dq('.bpx-player-video-wrap')
  const playerSettingsText = isBpxPlayer
    ? localStorage.getItem('bpx_player_profile')
    : localStorage.getItem('bilibili_player_settings')
  if (!playerSettingsText) {
    return [SubtitleConverter.defaultConfig, '']
  }
  const subtitleSettings = JSON.parse(playerSettingsText).subtitle
  const language = subtitleSettings.lan
  const title = getFriendlyTitle(true)
  const fontSizeMapping: { [key: number]: number } = {
    0.6: SubtitleSize.VerySmall,
    0.8: SubtitleSize.Small,
    1: SubtitleSize.Medium,
    1.3: SubtitleSize.Large,
    1.6: SubtitleSize.VeryLarge,
  }
  const size = fontSizeMapping[subtitleSettings.fontsize]
  const color =
    typeof subtitleSettings.color === 'number'
      ? subtitleSettings.color.toString(16)
      : parseInt(subtitleSettings.color).toString(16)
  const opacity = subtitleSettings.backgroundopacity ?? subtitleSettings.opacity

  const positions = {
    bc: SubtitleLocation.BottomCenter,
    bl: SubtitleLocation.BottomLeft,
    br: SubtitleLocation.BottomRight,
    tc: SubtitleLocation.TopCenter,
    tl: SubtitleLocation.TopLeft,
    tr: SubtitleLocation.TopRight,
    'bottom-center': SubtitleLocation.BottomCenter,
    'bottom-left': SubtitleLocation.BottomLeft,
    'bottom-right': SubtitleLocation.BottomRight,
    'top-center': SubtitleLocation.TopCenter,
    'top-left': SubtitleLocation.TopLeft,
    'top-right': SubtitleLocation.TopRight,
  }
  const subtitleLocation = positions[subtitleSettings.position]

  const video = playerAgent.query.video.element.sync() as HTMLVideoElement
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
  const subtitle = subtitles.find(s => s.languageCode === language) || subtitles[0]
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
