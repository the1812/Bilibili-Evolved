import { CommentArea } from './base'
import { childListSubtree } from '@/core/observer'
import type { CommentItem } from '../comment-item'
import { getRandomId } from '@/core/utils'

/** 表示一个基于常规 DOM 结构的评论区 */
export abstract class DomCommentArea extends CommentArea {
  protected observer?: MutationObserver
  protected static replyItemClasses = ['list-item.reply-wrap', 'reply-item']
  protected static replyItemSelector = DomCommentArea.replyItemClasses.map(c => `.${c}`).join(',')

  abstract parseCommentItem(element: HTMLElement): CommentItem
  abstract getCommentId(element: HTMLElement): string

  protected isCommentItem(n: Node): n is HTMLElement {
    return n instanceof HTMLElement && n.matches(DomCommentArea.replyItemSelector)
  }

  /** 在每一轮 CommentItem 解析前调用 */
  protected beforeParse(elements: HTMLElement[]) {
    return lodash.noop(elements)
  }

  observe() {
    if (this.observer) {
      return
    }
    performance.mark('observeItems start')
    const elements = dqa(this.element, DomCommentArea.replyItemSelector) as HTMLElement[]
    if (elements.length > 0) {
      this.beforeParse(elements)
      this.items = elements.map(it => this.parseCommentItem(it as HTMLElement))
    }
    this.items.forEach(item => {
      this.itemCallbacks.forEach(c => c.added?.(item))
    })
    ;[this.observer] = childListSubtree(this.element, records => {
      const observerCallId = getRandomId()
      performance.mark(`observeItems subtree start ${observerCallId}`)
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
        this.itemCallbacks.forEach(c => c.added?.(commentItem))
      })
      removedCommentElements.forEach(n => {
        const id = this.getCommentId(n)
        const index = this.items.findIndex(item => item.id === id)
        if (index !== -1) {
          const [commentItem] = this.items.splice(index, 1)
          this.itemCallbacks.forEach(c => c.removed?.(commentItem))
        }
      })
      performance.mark(`observeItems subtree end ${observerCallId}`)
      performance.measure(
        `observeItems subtree ${observerCallId}`,
        `observeItems subtree start ${observerCallId}`,
        `observeItems subtree end ${observerCallId}`,
      )
    })
    performance.mark('observeItems end')
    performance.measure('observeItems', 'observeItems start', 'observeItems end')
  }

  disconnect() {
    this.observer?.disconnect()
    this.items.forEach(item => {
      this.itemCallbacks.forEach(pair => pair.removed?.(item))
    })
  }
}
