import { bilibiliApi, getJsonWithCredentials } from '@/core/ajax'
import { formData, matchUrlPattern } from '@/core/utils'
import { allQualities } from '@/components/video/video-quality'
import { bangumiUrls } from '@/core/utils/urls'
import { compareQuality } from '../error'
import {
  DownloadVideoApi,
  DownloadVideoFragment,
  DownloadVideoInfo,
  DownloadVideoInputItem,
} from '../types'
import { bangumiApi, videoApi } from './url'

const parseInfoFromJson = (data: any, extensions: string[]) => {
  const getExtension = (index: number) => {
    if (extensions.length > index) {
      return extensions[index]
    }
    return extensions[extensions.length - 1]
  }
  const fragments = data.durl.map(
    (it: any, index: number) =>
      ({
        length: it.length,
        size: it.size,
        url: it.url,
        backupUrls: it.backup_url,
        extension: getExtension(index),
      } as DownloadVideoFragment),
  )
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
const downloadFlv = async (input: DownloadVideoInputItem) => {
  const { aid, cid, quality } = input
  const params = {
    avid: aid,
    cid,
    qn: quality?.value ?? '',
    otype: 'json',
  }
  const isBanugmi = bangumiUrls.some(url => matchUrlPattern(url))
  const api = isBanugmi ? bangumiApi(formData(params)) : videoApi(formData(params))
  const data = await bilibiliApi(getJsonWithCredentials(api), '获取视频链接失败')
  const info = new DownloadVideoInfo({
    input,
    jsonData: data,
    ...parseInfoFromJson(data, ['.flv']),
  })
  compareQuality(input, info)
  return info
}

export const videoFlv: DownloadVideoApi = {
  name: 'video.flv',
  displayName: 'flv',
  description: '使用 flv 格式下载, 兼容 H.264 编码. 支持的清晰度相比于 dash 会少很多.',
  downloadVideoInfo: input => downloadFlv(input),
}
