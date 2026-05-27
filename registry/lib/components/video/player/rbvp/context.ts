import { VideoInfo } from '@/components/video/video-info'
import { bilibiliApi, getJsonWithCredentials } from '@/core/ajax'
import type { RBVPEngineContext, RBVPRuntime, RBVPVideoContext } from './types'

const videoContextCache = new Map<string, Promise<RBVPVideoContext>>()

const fetchTags = async (aid: string, cid: string) => {
  const tags = await bilibiliApi(
    getJsonWithCredentials(
      `//api.bilibili.com/x/web-interface/view/detail/tag?aid=${aid}&cid=${cid}`,
    ),
  )
  const list = tags as { tag_name?: string; music_id?: string }[]
  const tagNames = list
    .map(tag => tag.tag_name?.trim())
    .filter((tag): tag is string => Boolean(tag))
  const musicTags = list.flatMap(tag => {
    const name = tag.tag_name?.trim()
    const musicId = tag.music_id?.trim()
    return name && musicId ? [{ name, musicId }] : []
  })
  return { tagNames, musicTags }
}

const getEpisodePages = (episode?: {
  page?: { cid?: number }
  pages?: Array<{ cid?: number }>
}) => {
  if (!episode) {
    return []
  }
  return episode.pages ?? (episode.page ? [episode.page] : [])
}

const findTargetEpisode = (info: VideoInfo, cid: string) => {
  const episodes = info.ugcSeason?.sections?.flatMap(section => section.episodes ?? []) ?? []
  return (
    episodes.find(episode =>
      getEpisodePages(episode).some(page => String(page.cid) === String(cid)),
    ) ?? episodes.find(episode => String(episode.bvid ?? '') === String(info.bvid ?? ''))
  )
}

const findTargetSection = (info: VideoInfo, cid: string) => {
  const targetEpisode = findTargetEpisode(info, cid)
  if (!targetEpisode) {
    return undefined
  }
  return info.ugcSeason?.sections?.find(section =>
    (section.episodes ?? []).some(episode => episode === targetEpisode),
  )
}

const fetchVideoContext = async (
  aid: string,
  cid: string,
  cacheKey: string,
): Promise<RBVPVideoContext> => {
  try {
    const info = await new VideoInfo(aid).fetchInfo()
    const tagData = await fetchTags(aid, cid)
    const currentPageIndex = info.pages.findIndex(page => String(page.cid) === cid)
    const currentPage = currentPageIndex === -1 ? undefined : info.pages[currentPageIndex]
    const targetEpisode = findTargetEpisode(info, cid)
    return {
      aid: String(info.aid),
      bvid: String(info.bvid ?? ''),
      cid,
      sectionId: String(findTargetSection(info, cid)?.id ?? ''),
      sectionRootId: String(info.ugcSeason?.id ?? ''),
      sectionName: String(targetEpisode?.title ?? ''),
      sectionRootName: String(info.ugcSeason?.title ?? ''),
      partIndex: currentPageIndex === -1 ? 0 : currentPageIndex + 1,
      upUid: String(info.up?.uid ?? ''),
      upName: String(info.up?.name ?? ''),
      partitionId: String(info.tagId ?? ''),
      partitionName: String(info.tagName ?? ''),
      title: String(info.title ?? ''),
      partTitle: String(currentPage?.title ?? ''),
      duration: Number(currentPage?.duration ?? 0),
      tags: tagData.tagNames,
      musicTags: tagData.musicTags,
    } as RBVPVideoContext
  } catch (e) {
    videoContextCache.delete(cacheKey)
    throw new Error('构建 RBVP 视频上下文失败', { cause: e })
  }
}

export const buildRbvpVideoContext = async (aid = unsafeWindow.aid, cid = unsafeWindow.cid) => {
  const key = `${aid}:${cid}`
  if (!videoContextCache.has(key)) {
    videoContextCache.set(key, fetchVideoContext(aid, String(cid), key))
  }
  return videoContextCache.get(key)
}

export const createRbvpEngineContext = async (
  localRuleSets,
  runtime: RBVPRuntime,
): Promise<RBVPEngineContext> => ({
  video: await buildRbvpVideoContext(),
  localRuleSets,
  runtime,
})
