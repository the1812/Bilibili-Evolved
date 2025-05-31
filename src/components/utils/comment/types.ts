import type { CommentReplyItem } from './reply-item'
import type { CommentItem } from './comment-item'
import type { CommentArea } from './comment-area'

/** 评论更新的事件类型 */
export const RepliesUpdateEventType = 'repliesUpdate'
/** 评论更新的事件回调类型 */
export type RepliesUpdateEventCallback = (event: CustomEvent<CommentReplyItem[]>) => void
export type CommentItemCallback = (item: CommentItem) => void
export type CommentAreaCallback = (area: CommentArea) => void
export type CommentCallbackPair<T extends (...args: unknown[]) => void> = { added?: T; removed?: T }
export type CommentCallbackInput<T extends (...args: unknown[]) => void> =
  | CommentCallbackPair<T>
  | T
