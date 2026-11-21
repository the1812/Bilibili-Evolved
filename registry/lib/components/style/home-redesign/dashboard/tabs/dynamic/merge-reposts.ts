import type { DynamicEntry, DynamicFeedCard } from './dynamic-post'

const genericRepostComments = new Set(['', '转发动态', '分享视频'])
const isGenericRepost = (entry: DynamicEntry) => {
  const comments = (entry.text ?? '').replace(/\u200b/g, '').split(/\/\/@[^:：\r\n]+[:：]|\r?\n/)
  return (
    comments.every(comment => genericRepostComments.has(comment.trim())) &&
    entry.images.length === 0 &&
    !entry.attachment &&
    !entry.showOriginalLink
  )
}

export const mergeDynamicReposts = (entries: DynamicEntry[]): DynamicFeedCard[] => {
  const cards = new Map<string, DynamicFeedCard>()
  for (const entry of entries) {
    const original = entry.original && isGenericRepost(entry) ? entry.original : undefined
    const post = original ?? entry
    const card: DynamicFeedCard = cards.get(post.id) ?? { post, reposters: [] }

    if (original) {
      const { id, url, author } = entry
      card.reposters.push({ id, url, author })
      if ((!card.post.text && original.text) || (!card.post.stats && original.stats)) {
        card.post = {
          ...card.post,
          text: card.post.text || original.text,
          stats: card.post.stats ?? original.stats,
        }
      }
    } else {
      card.post = {
        ...entry,
        text: entry.text || card.post.text,
        stats: entry.stats ?? card.post.stats,
      }
      card.original = entry.original
    }
    cards.set(post.id, card)
  }
  return [...cards.values()]
}
