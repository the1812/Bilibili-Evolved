import { bilibiliApi, getJsonWithCredentials } from '@/core/ajax'
import { formData } from '@/core/utils'
import { ascendingSort, descendingSort } from '@/core/utils/sort'
import { allQualities, VideoQuality } from '@/components/video/video-quality'
import { compareQuality } from '../error'
import {
  DownloadVideoApi, DownloadVideoFragment, DownloadVideoInfo, DownloadVideoInputItem,
} from '../types'

/* spell-checker: disable */

/** dash 格式更明确的扩展名 */
export const DashExtensions = ['.mp4', '.m4a']
/** dash 格式原本的扩展名 */
export const DashFragmentExtension = '.m4s'
/** dash 格式支持的编码类型 */
export type DashCodec = 'AVC/H.264' | 'HEVC/H.265'
export interface AudioDash {
  bandWidth: number
  codecs: string
  codecId: number
  backupUrls: string[]
  downloadUrl: string
  duration: number
}
export interface VideoDash extends AudioDash {
  quality: VideoQuality
  frameRate: string
  height: number
  width: number
  videoCodec: DashCodec
}
const dashToFragment = (dash: AudioDash): Omit<DownloadVideoFragment, 'extension'> => ({
  url: dash.downloadUrl,
  backupUrls: dash.backupUrls,
  length: dash.duration,
  size: Math.trunc((dash.bandWidth * dash.duration) / 8),
})
export const dashToFragments = (info: {
  videoDashes: VideoDash[]
  audioDashes: AudioDash[]
  videoCodec: DashCodec
}) => {
  const { videoDashes, audioDashes, videoCodec } = info
  // 画面按照首选编码选择, 若没有相应编码则选择大小较小的编码
  const video = (() => {
    const matchPreferredCodec = (d: VideoDash) => d.videoCodec === videoCodec
    if (videoDashes.some(matchPreferredCodec)) {
      return videoDashes
        .filter(matchPreferredCodec)
        .sort(ascendingSort(d => d.bandWidth))[0]
    }
    return videoDashes.sort(ascendingSort(d => d.bandWidth))[0]
  })()
  // 居然还有不带音轨的视频 #574 av370857916
  if (audioDashes.length > 0) {
    // 声音倒序排, 选择最高音质
    const audio = audioDashes.sort(descendingSort(d => d.bandWidth))[0]
    return [dashToFragment(video), dashToFragment(audio)]
  }
  return [dashToFragment(video)]
}
const downloadDash = async (input: DownloadVideoInputItem, codec: DashCodec) => {
  const { aid, cid, quality } = input
  const params = {
    avid: aid,
    cid,
    qn: quality?.value ?? '',
    otype: 'json',
    fourk: 1,
    fnver: 0,
    fnval: 80,
  }
  const api = `https://api.bilibili.com/x/player/playurl?${formData(params)}`
  const data = await bilibiliApi(
    getJsonWithCredentials(api),
    '获取视频链接失败',
  )
  if (!data.dash) {
    throw new Error('此视频没有 dash 格式, 请改用其他格式.')
  }
  const currentQuality = allQualities.find(q => q.value === data.quality)
  const { duration, video, audio } = data.dash
  const videoDashes: VideoDash[] = video
    .filter((d: any) => d.id === currentQuality.value)
    .map((d: any) => {
      const videoCodec: DashCodec = (() => {
        switch (d.codecid) {
          case 12:
            return 'HEVC/H.265'
          default:
          case 7:
            return 'AVC/H.264'
        }
      })()
      const dash: VideoDash = {
        quality: currentQuality,
        width: d.width,
        height: d.height,
        codecs: d.codecs,
        codecId: d.codecid,
        bandWidth: d.bandwidth,
        frameRate: d.frameRate,
        backupUrls: (d.backupUrl || d.backup_url || []).map(
          (it: string) => it.replace('http:', 'https:'),
        ),
        downloadUrl: (d.baseUrl || d.base_url || '').replace('http:', 'https:'),
        duration,
        videoCodec,
      }
      return dash
    })
  const audioDashes: AudioDash[] = (audio || []).map((d: any) => ({
    bandWidth: d.bandwidth,
    codecs: d.codecs,
    codecId: d.codecid,
    backupUrls: (d.backupUrl || d.backup_url || []).map(
      (it: string) => it.replace('http:', 'https:'),
    ),
    downloadUrl: (d.baseUrl || d.base_url || '').replace('http:', 'https:'),
    duration,
  }))
  const fragments: DownloadVideoFragment[] = dashToFragments({
    audioDashes,
    videoDashes,
    videoCodec: codec,
  }).map((it, index) => ({ ...it, extension: DashExtensions[index] ?? DashFragmentExtension }))
  const qualities = (data.accept_quality as number[])
    .map(qn => allQualities.find(q => q.value === qn))
    .filter(q => q !== undefined)
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
export const videoDashAVC: DownloadVideoApi = {
  name: 'video.dash.avc',
  displayName: 'dash (AVC/H.264)',
  description: '音画分离的 mp4 格式, 编码为H.264, 兼容性较好. 下载后可以合并为单个 mp4 文件.',
  downloadVideoInfo: async input => downloadDash(input, 'AVC/H.264'),
}
export const videoDashHEVC: DownloadVideoApi = {
  name: 'video.dash.hevc',
  displayName: 'dash (HEVC/H.265)',
  description: '音画分离的 mp4 格式, 编码为H.265, 体积较小, 兼容性较差. 下载后可以合并为单个 mp4 文件.',
  downloadVideoInfo: async input => downloadDash(input, 'HEVC/H.265'),
}
