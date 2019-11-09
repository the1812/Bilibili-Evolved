import { VideoDownloaderFragment } from './video-downloader-fragment'

export interface AudioDash {
  bandWidth: number
  codecs: string
  codecId: number
  backupUrls: string[]
  downloadUrl: string
  duration: number
}
export interface VideoDash extends AudioDash {
  quality: number
  qualityText: string
  frameRate: string
  height: number
  width: number
  videoCodec: DashCodec
}
const dashToFragment = (dash: AudioDash): VideoDownloaderFragment => {
  return {
    url: dash.downloadUrl,
    backupUrls: dash.backupUrls,
    length: dash.duration,
    size: Math.trunc(dash.bandWidth * dash.duration / 8),
  }
}
export const dashToFragments = (dashes: { videoDashes: VideoDash[], audioDashes: AudioDash[] }) => {
  // 画面按照首选编码选择, 若没有相应编码则选择大小较小的编码
  console.log(dashes.videoDashes)
  const video = (() => {
    const matchPreferredCodec = (d: VideoDash) => d.videoCodec === settings.downloadVideoDashCodec
    if (dashes.videoDashes.some(matchPreferredCodec)) {
      return dashes.videoDashes
        .filter(matchPreferredCodec)
        .sort(ascendingSort(d => d.bandWidth))[0]
    } else {
      return dashes.videoDashes.sort(ascendingSort(d => d.bandWidth))[0]
    }
  })()
  // 声音倒序排, 选择最高音质
  const audio = dashes.audioDashes.sort(descendingSort(d => d.bandWidth))[0]
  return [dashToFragment(video), dashToFragment(audio)]
}
export const getDashInfo = async (api: string, quality: number) => {
  const json = await Ajax.getJsonWithCredentials(api)
  const data = json.data || json.result || json
  if (json.code !== 0 || !data.dash) {
    throw new Error('DASH api failed')
  }
  const qualities = data.accept_quality as number[]
  if (!qualities.includes(quality)) {
    throw new Error('没有找到请求的清晰度')
  }
  if (data.quality !== quality) {
    throw new Error('无法获取请求的清晰度, 请确认当前账号有相应的权限')
  }
  const qualityTexts = data.accept_description as string[]
  const qualityText = qualityTexts[qualities.indexOf(quality)]
  const duration = data.dash.duration
  const videoDashes: VideoDash[] = data.dash.video
    .filter((d: any) => d.id === quality)
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
        quality,
        qualityText,
        width: d.width,
        height: d.height,
        codecs: d.codecs,
        codecId: d.codecid,
        bandWidth: d.bandwidth,
        frameRate: d.frameRate,
        backupUrls: (d.backupUrl || d.backup_url || []).forEach((it: string) => it.replace('http:', 'https:')),
        downloadUrl: (d.baseUrl || d.base_url || '').replace('http:', 'https:'),
        duration,
        videoCodec,
      }
      return dash
    })
  const audioDashes: AudioDash[] = data.dash.audio.map((d: any) => {
    return {
      bandWidth: d.bandwidth,
      codecs: d.codecs,
      codecId: d.codecid,
      backupUrls: (d.backupUrl || d.backup_url || []).forEach((it: string) => it.replace('http:', 'https:')),
      downloadUrl: (d.baseUrl || d.base_url || '').replace('http:', 'https:'),
      duration,
    }
  })
  return {
    videoDashes,
    audioDashes,
  }
}
export default {
  export: {
    getDashInfo,
    dashToFragments,
  },
}
