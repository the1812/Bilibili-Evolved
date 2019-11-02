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
}
export const dashToFragment = (dash: AudioDash): VideoDownloaderFragment => {
  return {
    url: dash.downloadUrl,
    backupUrls: dash.backupUrls,
    length: dash.duration,
    size: Math.trunc(dash.bandWidth * dash.duration / 8),
  }
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
      const dash: VideoDash = {
        quality,
        qualityText,
        width: d.width,
        height: d.height,
        codecs: d.codecs,
        codecId: d.codecid,
        bandWidth: d.bandwidth,
        frameRate: d.frameRate,
        backupUrls: (d.backupUrl || d.backup_url || '').replace('http:', 'https:'),
        downloadUrl: (d.baseUrl || d.base_url || '').replace('http:', 'https:'),
        duration,
      }
      return dash
    })
  const audioDashes: AudioDash[] = data.dash.audio.map((d: any) => {
    return {
      bandWidth: d.bandwidth,
      codecs: d.codecs,
      codecId: d.codecid,
      backupUrls: (d.backupUrl || d.backup_url || '').replace('http:', 'https:'),
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
    dashToFragment,
  },
}
