import type { CommentItem } from '../comment-item'
import type { CommentReplyItem } from '../reply-item'
import type { CommentCallbackInput, CommentCallbackPair, CommentItemCallback } from '../types'

export abstract class CommentArea {
  element: HTMLElement
  items: CommentItem[] = []
  protected itemCallbacks: CommentCallbackPair<CommentItemCallback>[] = []

  constructor(element: HTMLElement) {
    this.element = element
  }

  abstract observe(): void | Promise<void>
  abstract disconnect(): void | Promise<void>
  abstract addMenuItem(
    item: CommentReplyItem,
    config: {
      className: string
      text: string
      action: (e: MouseEvent) => void
    },
  ): void | Promise<void>

  static resolveCallbackPair<T extends (...args: unknown[]) => void>(
    input: CommentCallbackInput<T>,
  ): CommentCallbackPair<T> {
    if (typeof input === 'function') {
      return { added: input }
    }
    return input
  }

  forEachCommentItem(input: CommentCallbackInput<CommentItemCallback>) {
    const pair = CommentArea.resolveCallbackPair(input)
    this.items.forEach(item => pair.added?.(item))
    this.itemCallbacks.push(pair)
  }
}
