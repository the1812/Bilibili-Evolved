import { contentLoaded } from '@/core/life-cycle'
import { CommentAreaManager } from './comment/comment-area-manager'
import { CommentAreaCallback, CommentItemCallback } from './comment/types'
import { CommentReplyItem } from './comment/reply-item'

export const commentAreaManager = new CommentAreaManager()
contentLoaded(() => {
  commentAreaManager.init()
})

/** 为每一个评论区执行操作 */
export const forEachCommentArea = (callback: CommentAreaCallback) => {
  commentAreaManager.forEachCommentArea(callback)
}
/** 为每一条评论执行操作 (不包含评论的回复) */
export const forEachCommentItem = (callbacks: {
  added?: CommentItemCallback
  removed?: CommentItemCallback
}) => {
  commentAreaManager.forEachCommentItem(callbacks)
}

/**
 * 向评论的菜单中添加菜单项
 * @param item 评论
 * @param config 菜单项配置
 */
export const addMenuItem = (
  item: CommentReplyItem,
  config: {
    className: string
    text: string
    action: (e: MouseEvent) => void
  },
) => {
  commentAreaManager.forEachCommentArea(area => area.addMenuItem(item, config))
}

export * from './comment/comment-area'
export * from './comment/comment-item'
export * from './comment/reply-item'
