import { CommentReplyItem } from '@/components/utils/comment/reply-item'

export interface CommentContentReplaceContext {
  commentItem: CommentReplyItem
  content: Node[]
}
export type CommentContentReplaceHandler = (
  context: CommentContentReplaceContext,
) => void | Promise<void>
