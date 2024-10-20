import type { CommentItem } from '@/components/utils/comment-apis'

export interface CommentContentReplaceContext {
  commentItem: CommentItem
  content: Node[]
}
export type CommentContentReplaceHandler = (
  context: CommentContentReplaceContext,
) => void | Promise<void>
