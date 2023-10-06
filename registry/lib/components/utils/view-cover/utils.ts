import { logError } from '@/core/utils/log'
import { VideoInfo } from '@/components/video/video-info'

export type CoverDownloadType = 'jpg'

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

export const getBlobByAid = async (aid: string) => {
  const url = await getVideoCoverUrlByAid(aid)
  const response = await fetch(url)
  const blob = await response.blob()
  return blob
}
