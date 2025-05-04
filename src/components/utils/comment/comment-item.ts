import { CommentReplyItem } from './reply-item'
import { RepliesUpdateEventCallback, RepliesUpdateEventType } from './types'

const createRepliesUpdateEvent = (replies: CommentReplyItem[]) => {
  return new CustomEvent(RepliesUpdateEventType, {
    detail: replies,
  })
}
/** 表示一条评论 */
export class CommentItem extends CommentReplyItem {
  /** 评论图片 */
  pictures?: string[]
  /** 回复 */
  replies: CommentReplyItem[]

  constructor(
    initParams: Omit<CommentItem, keyof EventTarget | 'dispatchRepliesUpdate' | 'shadowDomEntry'>,
  ) {
    super(initParams)
    this.pictures = initParams.pictures ?? []
    this.replies = initParams.replies
  }

  addEventListener(
    type: typeof RepliesUpdateEventType,
    callback: RepliesUpdateEventCallback | null,
    options?: EventListenerOptions | boolean,
  ) {
    super.addEventListener(type, callback, options)
  }

  removeEventListener(
    type: typeof RepliesUpdateEventType,
    callback: RepliesUpdateEventCallback | null,
    options?: EventListenerOptions | boolean,
  ) {
    super.removeEventListener(type, callback, options)
  }

  /** 触发评论更新事件 */
  dispatchRepliesUpdate(replies: CommentReplyItem[]) {
    return super.dispatchEvent(createRepliesUpdateEvent(replies))
  }
}
