import { bilibiliApi, getJsonWithCredentials } from '@/core/ajax'
import { formData, matchUrlPattern } from '@/core/utils'
import { ascendingSort, descendingSort } from '@/core/utils/sort'
import { allQualities, VideoQuality } from '@/components/video/video-quality'
import { bangumiUrls } from '@/core/utils/urls'
import { compareQuality } from '../error'
import {
  DownloadVideoApi,
  DownloadVideoFragment,
  DownloadVideoInfo,
  DownloadVideoInputItem,
} from '../types'
import { bangumiApi, videoApi } from './url'
import { Options } from '..'
import { getComponentSettings } from '@/core/settings'

/** dash 格式更明确的扩展名 */
export const DefaultDashExtensions = {
  video: '.mp4',
  audio: '.m4a',
  flacAudio: '.flac',
}
/** dash 格式原本的扩展名 */
export const DashFragmentExtension = '.m4s'
/** dash 格式支持的编码类型 */
export enum DashCodec {
  Avc = 'AVC/H.264',
  Hevc = 'HEVC/H.265',
  Av1 = 'AV1',
}
export interface Dash {
  type: keyof typeof DefaultDashExtensions
  bandWidth: number
  codecs: string
  codecId: number
  backupUrls: string[]
  downloadUrl: string
  duration: number
}
export interface AudioDash extends Dash {
  type: 'audio' | 'flacAudio'
}
export interface VideoDash extends Dash {
  type: 'video'
  quality: VideoQuality
  frameRate: string
  height: number
  width: number
  videoCodec: DashCodec
}
export interface DashFilters {
  video?: (dash: VideoDash) => boolean
  audio?: (dash: AudioDash) => boolean
}
const getDashExtensions = (type: keyof typeof DefaultDashExtensions): string => {
  const { options } = getComponentSettings<Options>('downloadVideo')
  if (type === 'video') {
    return options.dashVideoExtension
  }
  if (type === 'audio') {
    return options.dashAudioExtension
  }
  if (type === 'flacAudio') {
    return options.dashFlacAudioExtension
  }
  return DefaultDashExtensions[type] ?? DashFragmentExtension
}
const dashToFragment = (dash: Dash): DownloadVideoFragment => ({
  url: dash.downloadUrl,
  backupUrls: dash.backupUrls,
  length: dash.duration,
  size: Math.trunc((dash.bandWidth * dash.duration) / 8),
  extension: getDashExtensions(dash.type),
})
export const dashToFragments = (info: {
  videoDashes: VideoDash[]
  audioDashes: AudioDash[]
  videoCodec: DashCodec
}) => {
  const { videoDashes, audioDashes, videoCodec } = info
  const results: DownloadVideoFragment[] = []
  // 画面按照首选编码选择, 若没有相应编码则选择第一个编码
  if (videoDashes.length !== 0) {
    const matchPreferredCodec = (d: VideoDash) => d.videoCodec === videoCodec
    if (videoDashes.some(matchPreferredCodec)) {
      const dash = videoDashes.filter(matchPreferredCodec).sort(ascendingSort(d => d.bandWidth))[0]
      results.push(dashToFragment(dash))
    } else {
      results.push(dashToFragment(videoDashes.sort(ascendingSort(d => d.bandWidth))[0]))
    }
  }
  if (audioDashes.length !== 0) {
    // 声音倒序排, 选择最高音质
    const audio = audioDashes.sort(descendingSort(d => d.bandWidth))[0]
    results.push(dashToFragment(audio))
  }
  return results
}

/* spell-checker: disable */
const downloadDash = async (
  input: DownloadVideoInputItem,
  config: {
    codec?: DashCodec
    filters?: DashFilters
  } = {},
) => {
  const { codec = DashCodec.Avc, filters } = config
  const dashFilters = {
    video: () => true,
    audio: () => true,
    ...filters,
  }
  const { aid, cid, quality } = input
  const params = {
    avid: aid,
    cid,
    qn: quality?.value ?? '',
    otype: 'json',
    fourk: 1,
    fnver: 0,
    fnval: 4048,
  }
  const isBanugmi = bangumiUrls.some(url => matchUrlPattern(url))
  const api = isBanugmi ? bangumiApi(formData(params)) : videoApi(formData(params))
  const data = await bilibiliApi(getJsonWithCredentials(api), '获取视频链接失败')
  if (!data.dash) {
    throw new Error('此视频没有 dash 格式, 请改用其他格式.')
  }
  const currentQuality = allQualities.find(q => q.value === data.quality)
  const { duration, video, audio, dolby, flac } = data.dash
  const parseVideoCodec = (codecId: number) => {
    switch (codecId) {
      case 12:
        return DashCodec.Hevc
      case 13:
        return DashCodec.Av1
      default:
      case 7:
        return DashCodec.Avc
    }
  }
  const videoDashes: VideoDash[] = (video as any[])
    .filter(d => d.id === currentQuality.value)
    .map((d): VideoDash => {
      const dash: VideoDash = {
        type: 'video',
        videoCodec: parseVideoCodec(d.codecid),
        quality: currentQuality,
        width: d.width,
        height: d.height,
        codecs: d.codecs,
        codecId: d.codecid,
        bandWidth: d.bandwidth,
        frameRate: d.frameRate,
        backupUrls: (d.backupUrl || d.backup_url || []).map((it: string) =>
          it.replace('http:', 'https:'),
        ),
        downloadUrl: (d.baseUrl || d.base_url || '').replace('http:', 'https:'),
        duration,
      }
      return dash
    })
    .filter(d => dashFilters.video(d))

  const mapAudioDash = (dash: any, type: AudioDash['type'] = 'audio'): AudioDash => ({
    type,
    bandWidth: dash.bandwidth,
    codecs: dash.codecs,
    codecId: dash.codecid ?? 0,
    backupUrls: (dash.backupUrl || dash.backup_url || []).map((it: string) =>
      it.replace('http:', 'https:'),
    ),
    downloadUrl: (dash.baseUrl || dash.base_url || '').replace('http:', 'https:'),
    duration,
  })
  const audioDashes: AudioDash[] = ((audio as any[]) || [])
    .map(d => mapAudioDash(d))
    .filter(d => dashFilters.audio(d))
  if (dolby) {
    audioDashes.push(...(dolby.audio?.map((d: any) => mapAudioDash(d)) ?? []))
  }
  if (flac) {
    audioDashes.push(...(flac.audio ? [mapAudioDash(flac.audio, 'flacAudio')] : []))
  }
  const fragments: DownloadVideoFragment[] = dashToFragments({
    audioDashes,
    videoDashes,
    videoCodec: codec,
  })
  const qualities = (() => {
    const filterByCodec = (preferredCodec: DashCodec | null) => {
      return (data.accept_quality as number[])
        .filter(qn => {
          if (preferredCodec !== null) {
            return (video as any[]).some(
              d => d.id === qn && parseVideoCodec(d.codecid) === preferredCodec,
            )
          }
          return true
        })
        .map(qn => allQualities.find(q => q.value === qn))
        .filter(q => q !== undefined)
    }
    const allAvailableQualities = filterByCodec(codec)
    if (allAvailableQualities.length > 0) {
      return allAvailableQualities
    }
    const { options } = getComponentSettings<Options>('downloadVideo')
    const fallbackQualities = filterByCodec(options.dashCodecFallback)
    if (fallbackQualities.length > 0) {
      return fallbackQualities
    }
    return filterByCodec(null)
  })()
  const info = new DownloadVideoInfo({
    input,
    jsonData: data,
    fragments,
    qualities,
    currentQuality,
  })
  compareQuality(input, info)
  return info
}
export const videoDashAvc: DownloadVideoApi = {
  name: 'video.dash.avc',
  displayName: 'dash (AVC/H.264)',
  description:
    '音画分离的 mp4 格式, 编码为 H.264, 体积较大, 兼容性较好. 下载后可以合并为单个 mp4 文件. 如果视频源没有此编码, 则会回退到设置中设定的 DASH 回退编码.',
  downloadVideoInfo: async input => downloadDash(input, { codec: DashCodec.Avc }),
}
export const videoDashHevc: DownloadVideoApi = {
  name: 'video.dash.hevc',
  displayName: 'dash (HEVC/H.265)',
  description:
    '音画分离的 mp4 格式, 编码为 H.265, 体积中等, 兼容性较差. 下载后可以合并为单个 mp4 文件. 如果视频源没有此编码, 则会回退到设置中设定的 DASH 回退编码.',
  downloadVideoInfo: async input => downloadDash(input, { codec: DashCodec.Hevc }),
}
export const videoDashAv1: DownloadVideoApi = {
  name: 'video.dash.av1',
  displayName: 'dash (AV1)',
  description:
    '音画分离的 mp4 格式, 编码为 AV1, 体积较小, 兼容性中等. 下载后可以合并为单个 mp4 文件. 如果视频源没有此编码, 则会回退到设置中设定的 DASH 回退编码.',
  downloadVideoInfo: async input => downloadDash(input, { codec: DashCodec.Av1 }),
}
export const videoAudioDash: DownloadVideoApi = {
  name: 'video.dash.audio',
  displayName: 'dash (仅音频)',
  description: '仅下载视频中的音频轨道.',
  downloadVideoInfo: async input => downloadDash(input, { filters: { video: () => false } }),
}
