import { allMutations, childList } from '@/core/observer'
import { getCommentArea } from './comment-area'
import {
  CommentAreaCallback,
  CommentCallbackInput,
  CommentCallbackPair,
  CommentItemCallback,
} from './types'
import { CommentArea } from './areas/base'
import { deleteValue } from '@/core/utils'

export class CommentAreaManager {
  /** 当前页面所有的评论区列表 */
  commentAreas: CommentArea[] = []
  commentAreaCallbacks: CommentCallbackPair<CommentAreaCallback>[] = []

  protected static commentAreaClasses = ['bili-comment', 'bb-comment']

  init() {
    allMutations(records => {
      records.forEach(r => {
        r.addedNodes.forEach(n => this.observeAreas(n))
      })
    })
    dqa(CommentAreaManager.commentAreaClasses.map(c => `.${c}`).join(',')).forEach(it =>
      this.observeAreas(it),
    )
  }

  observeAreas(node: Node) {
    if (
      node instanceof HTMLElement &&
      CommentAreaManager.commentAreaClasses.some(c => node.classList.contains(c))
    ) {
      const area = getCommentArea(node)
      this.commentAreas.push(area)
      area.observeItems()
      this.commentAreaCallbacks.forEach(c => c.added?.(area))
      const [observer] = childList(area.element.parentElement, records => {
        records.forEach(r => {
          r.removedNodes.forEach(removedNode => {
            if (removedNode === area.element) {
              deleteValue(this.commentAreas, a => a === area)
              this.commentAreaCallbacks.forEach(c => c.removed?.(area))
              area.destroy()
              observer.disconnect()
            }
          })
        })
      })
    }
  }

  forEachCommentArea(input: CommentCallbackInput<CommentAreaCallback>) {
    const pair = CommentArea.resolveCallbackPair(input)
    this.commentAreas.forEach(it => pair.added?.(it))
    this.commentAreaCallbacks.push(pair)
  }

  forEachCommentItem(callbacks: CommentCallbackPair<CommentItemCallback>) {
    this.forEachCommentArea(area => area.forEachCommentItem(callbacks))
  }
}
