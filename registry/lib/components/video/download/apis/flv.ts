import { allQualities } from '@/components/video/video-quality'
import { bilibiliApi, getJsonWithCredentials } from '@/core/ajax'
import { matchUrlPattern } from '@/core/utils'
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
        type: 'flv',
        length: it.length,
        size: it.size,
        url: it.url,
        allUrls: [it.url, ...(it.backup_url ?? [])],
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
    qn: quality?.value?.toString() ?? '',
    otype: 'json',
  }
  const isBanugmi = bangumiUrls.some(url => matchUrlPattern(url))
  const request = async (extra?: Record<string, string>) => {
    const query = new URLSearchParams({ ...params, ...extra }).toString()
    const api = isBanugmi ? bangumiApi(query) : videoApi(query)
    return bilibiliApi(getJsonWithCredentials(api), '获取视频链接失败')
  }
  let data = await request()
  if (!allQualities.some(q => q.value === data.quality)) {
    // 未知画质 (如只剩已废弃的 240P), 带 dash 参数再请求一次
    data = await request({ fourk: '1', fnver: '0', fnval: '4048' })
  }
  if (!data.durl) {
    throw new Error('此视频没有 flv 格式, 请改用其他格式.')
  }
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
