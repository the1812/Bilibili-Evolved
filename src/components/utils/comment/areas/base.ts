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
  protected static replyItemSelector = CommentArea.replyItemClasses.map(c => `.${c}`).join(',')

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

  protected isCommentItem(n: Node): n is HTMLElement {
    return n instanceof HTMLElement && n.matches(CommentArea.replyItemSelector)
  }

  /** 在每一轮 CommentItem 解析前调用 */
  protected beforeParse(elements: HTMLElement[]) {
    return lodash.noop(elements)
  }

  observeItems() {
    if (this.observer) {
      return
    }
    const elements = dqa(this.element, CommentArea.replyItemSelector) as HTMLElement[]
    if (elements.length > 0) {
      this.beforeParse(elements)
      this.items = elements.map(it => this.parseCommentItem(it as HTMLElement))
    }
    this.items.forEach(item => {
      this.itemAddedCallbacks.forEach(c => c(item))
    })
    ;[this.observer] = childListSubtree(this.element, records => {
      const addedCommentElements: HTMLElement[] = []
      const removedCommentElements: HTMLElement[] = []
      records.forEach(r => {
        r.addedNodes.forEach(n => {
          if (this.isCommentItem(n)) {
            addedCommentElements.push(n)
          }
        })
        r.removedNodes.forEach(n => {
          if (this.isCommentItem(n)) {
            removedCommentElements.push(n)
          }
        })
      })
      if (addedCommentElements.length > 0) {
        this.beforeParse(addedCommentElements)
      }
      addedCommentElements.forEach(n => {
        const commentItem = this.parseCommentItem(n)
        this.items.push(commentItem)
        this.itemAddedCallbacks.forEach(c => c(commentItem))
      })
      removedCommentElements.forEach(n => {
        const id = this.getCommentId(n)
        const index = this.items.findIndex(item => item.id === id)
        if (index !== -1) {
          const [commentItem] = this.items.splice(index, 1)
          this.itemRemovedCallbacks.forEach(c => c(commentItem))
        }
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
