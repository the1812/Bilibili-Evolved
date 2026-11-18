import { getFeeds } from '@/components/feeds/api'
import { bilibiliApi, postJsonWithCredentials } from '@/core/ajax'
import { getCsrf } from '@/core/utils'
import { toDynamicPost, type DynamicEntry, type RawDynamicPost } from './dynamic-post'

interface FeedPage {
  items?: RawDynamicPost[]
  offset?: string
  has_more: boolean
}

export const getDynamicFeedPage = async (offset?: string) => {
  const page = await bilibiliApi<FeedPage>(getFeeds('all', offset), '获取动态失败', false)
  const posts = page.items ?? []
  const entries: DynamicEntry[] = posts
    .filter(post => post.id_str)
    .map(post => ({
      ...toDynamicPost(post),
      original: post.orig?.id_str ? toDynamicPost(post.orig) : undefined,
    }))
  const nextOffset = page.has_more ? page.offset || posts.at(-1)?.id_str : undefined

  return { entries, nextOffset }
}

export const setDynamicLike = async (id: string, liked: boolean) => {
  const csrf = getCsrf()
  if (!csrf) {
    throw new Error('请先登录 B 站')
  }
  const params = new URLSearchParams({ csrf })
  const response = postJsonWithCredentials(
    `https://api.bilibili.com/x/dynamic/feed/dyn/thumb?${params}`,
    {
      dyn_id_str: id,
      up: liked ? 1 : 2,
    },
  ).then(JSON.parse)
  await bilibiliApi(response, liked ? '点赞失败' : '取消点赞失败', false)
}
