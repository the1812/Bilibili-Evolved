export interface AudioDash {
  bandWidth: number
  codecs: string
  codecId: number
  backupUrls: string[]
  downloadUrl: string
}
export interface VideoDash extends AudioDash {
  quality: number
  qualityText: string
  frameRate: string
  height: number
  width: number
}
export const getDashInfo = async (aid: string | number, cid: string | number, quality: number) => {
  const api = `https://api.bilibili.com/pgc/player/web/playurl?avid=${aid}&cid=${cid}&qn=${quality}&otype=json&fourk=1&fnver=0&fnval=16`
  const json = await Ajax.getJsonWithCredentials(api)
  if (json.code !== 0 || json.result.type !== 'DASH') {
    throw new Error('DASH api failed')
  }
  const qualities = json.result.accept_quality as number[]
  if (!qualities.includes(quality)) {
    throw new Error('没有找到请求的清晰度')
  }
  if (json.result.quality !== quality) {
    throw new Error('无法获取请求的清晰度, 请确认当前账号有相应的权限')
  }
  const qualityTexts = json.result.accept_description as string[]
  const qualityText = qualityTexts[qualities.indexOf(quality)]
  const videoDashes = json.result.dash.video
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
        backupUrls: d.backupUrl,
        downloadUrl: d.baseUrl,
      }
      return dash
    })
  const originalAudioDash = json.result.dash.audio[0]
  const audioDash: AudioDash = {
    bandWidth: originalAudioDash.bandwidth,
    codecs: originalAudioDash.codecs,
    codecId: originalAudioDash.codecid,
    backupUrls: originalAudioDash.backupUrl,
    downloadUrl: originalAudioDash.baseUrl,
  }
  return {
    videoDashes,
    audioDash
  }
}
export default {
  export: {
    getDashInfo,
  },
}
