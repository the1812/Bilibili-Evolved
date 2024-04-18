import { childListSubtree } from '@/core/observer'
import type { CommentItem } from '../comment-item'
import type { CommentItemCallback } from '../types'
import type { CommentReplyItem } from '../reply-item'

/** 表示一个评论区 */
export abstract class CommentArea {
  /** 对应元素 */
  element: HTMLElement
  /** 评论列表 */
  items: CommentItem[] = []
  /** 与之关联的 MutationObserver */
  protected observer?: MutationObserver
  protected itemAddedCallbacks: CommentItemCallback[] = []
  protected itemRemovedCallbacks: CommentItemCallback[] = []
  protected static replyItemClasses = ['list-item.reply-wrap', 'reply-item']

  constructor(element: HTMLElement) {
    this.element = element
  }

  abstract parseCommentItem(element: HTMLElement): CommentItem
  abstract getCommentId(element: HTMLElement): string
  abstract addMenuItem(
    item: CommentReplyItem,
    config: {
      className: string
      text: string
      action: (e: MouseEvent) => void
    },
  ): void

  observeItems() {
    if (this.observer) {
      return
    }
    const replyItemSelector = CommentArea.replyItemClasses.map(c => `.${c}`).join(',')
    this.items = dqa(this.element, replyItemSelector).map(it =>
      this.parseCommentItem(it as HTMLElement),
    )
    this.items.forEach(item => {
      this.itemAddedCallbacks.forEach(c => c(item))
    })
    ;[this.observer] = childListSubtree(this.element, records => {
      records.forEach(r => {
        const isCommentItem = (n: Node): n is HTMLElement =>
          n instanceof HTMLElement && n.matches(replyItemSelector)
        r.addedNodes.forEach(n => {
          if (isCommentItem(n)) {
            const commentItem = this.parseCommentItem(n)
            this.items.push(commentItem)
            this.itemAddedCallbacks.forEach(c => c(commentItem))
          }
        })
        r.removedNodes.forEach(n => {
          if (isCommentItem(n)) {
            const id = this.getCommentId(n)
            const index = this.items.findIndex(item => item.id === id)
            if (index !== -1) {
              const [commentItem] = this.items.splice(index, 1)
              this.itemRemovedCallbacks.forEach(c => c(commentItem))
            }
          }
        })
      })
    })
  }

  forEachCommentItem(callbacks: { added?: CommentItemCallback; removed?: CommentItemCallback }) {
    const { added, removed } = callbacks
    if (added) {
      this.items.forEach(item => added(item))
      this.itemAddedCallbacks.push(added)
    }
    if (removed) {
      this.itemRemovedCallbacks.push(removed)
    }
  }
}
