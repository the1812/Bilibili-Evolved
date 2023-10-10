import { logError } from '@/core/utils/log'
import { VideoInfo } from './video-info'

/**  根据 aid 获取视频封面地址 */
export const getVideoCoverUrlByAid = async (aid: string) => {
  const videoInfo = new VideoInfo(aid)
  try {
    await videoInfo.fetchInfo()
  } catch (error) {
    logError(error)
    throw error
  }
  return videoInfo.coverUrl.replace('http:', 'https:')
}

/** 根据 aid 下载视频封面为 Blob */
export const getBlobByAid = async (aid: string) => {
  const url = await getVideoCoverUrlByAid(aid)
  const response = await fetch(url)
  const blob = await response.blob()
  return blob
}
