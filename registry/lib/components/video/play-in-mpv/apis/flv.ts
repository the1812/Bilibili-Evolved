import { bilibiliApi, getJsonWithCredentials } from '@/core/ajax'
import { formData } from '@/core/utils'
import { allQualities } from '@/components/video/video-quality'
import { compareQuality } from '../error'
import {
  PlayMpvApi,
  PlayMpvFragment,
  PlayMpvInfo,
} from '../types'

const parseInfoFromJson = (data: any, extensions: string[]) => {
  const getExtension = (index: number) => {
    if (extensions.length > index) {
      return extensions[index]
    }
    return extensions[extensions.length - 1]
  }
  const fragments = data.durl.map((it: any, index: number) => ({
    length: it.length,
    size: it.size,
    url: it.url,
    backupUrls: it.backup_url,
    extension: getExtension(index),
  } as PlayMpvFragment))
  const qualities = (data.accept_quality as number[])
    .map(qn => allQualities.find(q => q.value === qn))
    .filter(q => q !== undefined)
  const currentQuality = allQualities.find(q => q.value === data.quality)
  return {
    fragments,
    qualities,
    currentQuality,
  }
}
/* spell-checker: disable */
export const videoFlv: PlayMpvApi = {
  name: 'video.flv',
  displayName: 'flv',
  description: '使用 flv 格式下载, 兼容 H.264 编码.',
  playMpvInfo: async input => {
    const { aid, cid, quality } = input
    const params = {
      avid: aid,
      cid,
      qn: quality?.value ?? '',
      otype: 'json',
      fourk: 1,
      fnver: 0,
      fnval: 0,
    }
    const api = `https://api.bilibili.com/x/player/playurl?${formData(params)}`
    const data = await bilibiliApi(
      getJsonWithCredentials(api),
      '获取视频链接失败',
    )
    const info = new PlayMpvInfo({
      input,
      jsonData: data,
      ...parseInfoFromJson(data, ['.flv']),
    })
    compareQuality(input, info)
    return info
  },
}
