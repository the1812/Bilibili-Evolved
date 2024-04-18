import { contentLoaded } from '@/core/life-cycle'
import { CommentAreaManager } from './comment/comment-area-manager'
import { CommentAreaCallback, CommentItemCallback } from './comment/types'
import { CommentReplyItem } from './comment/reply-item'

const manager = new CommentAreaManager()
contentLoaded(() => {
  manager.init()
})

/** 为每一个评论区执行操作 */
export const forEachCommentArea = (callback: CommentAreaCallback) => {
  manager.forEachCommentArea(callback)
}
/** 为每一条评论执行操作 (不包含评论的回复) */
export const forEachCommentItem = (callbacks: {
  added?: CommentItemCallback
  removed?: CommentItemCallback
}) => {
  manager.forEachCommentItem(callbacks)
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
  manager.forEachCommentArea(area => area.addMenuItem(item, config))
}
