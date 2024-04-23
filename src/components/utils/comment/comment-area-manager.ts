import { allMutations } from '@/core/observer'
import { getCommentArea } from './comment-area'
import { CommentAreaCallback, CommentItemCallback } from './types'
import { CommentArea } from './areas/base'

export class CommentAreaManager {
  /** 当前页面所有的评论区列表 */
  commentAreas: CommentArea[] = []
  commentAreaCallbacks: CommentAreaCallback[] = []

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
      this.commentAreaCallbacks.forEach(c => c(area))
    }
  }

  forEachCommentArea(callback: CommentAreaCallback) {
    this.commentAreas.forEach(it => callback(it))
    this.commentAreaCallbacks.push(callback)
  }

  forEachCommentItem(callbacks: { added?: CommentItemCallback; removed?: CommentItemCallback }) {
    this.forEachCommentArea(area => area.forEachCommentItem(callbacks))
  }
}
