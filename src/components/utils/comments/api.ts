/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { dqa } from '@/core/utils'
import { childListSubtree } from '@/core/observer'

/** 表示一条评论 */
export interface CommentItem {
  /** 对应元素 */
  element: HTMLElement
  /** 评论ID */
  id: string
  /** 评论者UID */
  userID: string
  /** 用户名 */
  userName: string
  /** 评论内容 */
  content: string
  /** 评论时间(文本), 时间戳的获取有待研究 */
  timeText: string
  /** 点赞数 */
  likes: number
  /** 回复 */
  replies: Omit<CommentItem, 'replies'>[]
}
export type CommentItemCallback = (item: CommentItem) => void
/** 表示一个评论区 */
export interface CommentArea {
  /** 对应元素 */
  element: HTMLElement
  /** 评论列表 */
  items: CommentItem[]
  /** 与之关联的 MutationObserver */
  observer?: MutationObserver
}
/** 当前页面所有的评论区列表 */
export const commentAreas: CommentArea[] = []
export type CommentAreaCallback = (area: CommentArea) => void

const commentAreaClass = 'bb-comment'
const itemAddedCallbacks: CommentItemCallback[] = []
const itemRemovedCallbacks: CommentItemCallback[] = []
const commentAreaCallbacks: CommentAreaCallback[] = []
const parseCommentItem = (element: HTMLElement) => {
  const user = element.querySelector('.con .user .name') as HTMLElement
  const item: CommentItem = {
    id: element.getAttribute('data-id')!,
    element,
    userID: user.getAttribute('data-usercard-mid')!,
    userName: user.textContent!,
    content: element.querySelector('.con .text')!.textContent!,
    timeText: element.querySelector('.con .info .time')!.textContent!,
    likes: parseInt(element.querySelector('.con .like span')!.textContent!),
    replies: dqa(element, '.reply-box .reply-item').map((replyElement: HTMLElement) => {
      const replyUser = replyElement.querySelector('.reply-con .user') as HTMLElement
      return {
        id: replyElement.getAttribute('data-id')!,
        element: replyElement,
        userID: replyUser.getAttribute('data-usercard-mid')!,
        userName: replyUser.textContent!,
        content: replyElement.querySelector('.text-con')!.textContent!,
        timeText: replyElement.querySelector('.info .time')!.textContent!,
        likes: parseInt(replyElement.querySelector('.info .like span')!.textContent!),
      }
    }),
  }
  return item
}
const observeItems = (area: CommentArea) => {
  if (area.observer) {
    return
  }
  area.items = dqa(area.element, '.list-item.reply-wrap').map(parseCommentItem)
  area.items.forEach(item => {
    itemAddedCallbacks.forEach(c => c(item))
  });
  [area.observer] = childListSubtree(area.element, records => {
    records.forEach(r => {
      const isCommentItem = (n: Node): n is HTMLElement => n instanceof HTMLElement
          && n.classList.contains('list-item')
          && n.classList.contains('reply-wrap')
      r.addedNodes.forEach(n => {
        if (isCommentItem(n)) {
          const commentItem = parseCommentItem(n)
          area.items.push(commentItem)
          itemAddedCallbacks.forEach(c => c(commentItem))
        }
      })
      r.removedNodes.forEach(n => {
        if (isCommentItem(n)) {
          const id = n.getAttribute('data-id')!
          const index = area.items.findIndex(item => item.id === id)
          if (index !== -1) {
            const [commentItem] = area.items.splice(index, 1)
            itemRemovedCallbacks.forEach(c => c(commentItem))
          }
        }
      })
    })
  })
}
const observeAreas = (node: Node) => {
  if (node instanceof HTMLElement && node.classList.contains(commentAreaClass)) {
    const area: CommentArea = {
      element: node,
      items: [],
    }
    commentAreas.push(area)
    observeItems(area)
    commentAreaCallbacks.forEach(c => c(area))
  }
}
childListSubtree(document.body, records => {
  records.forEach(r => {
    r.addedNodes.forEach(n => observeAreas(n))
  })
})
dqa(`.${commentAreaClass}`).forEach(observeAreas)

/** 为每一个评论区执行操作 */
export const forEachCommentArea = (callback: CommentAreaCallback) => {
  commentAreas.forEach(it => callback(it))
  commentAreaCallbacks.push(callback)
}
/** 为每一条评论执行操作 (不包含评论的回复) */
export const forEachCommentItem = (callbacks: {
  added?: CommentItemCallback
  removed?: CommentItemCallback
}) => {
  const { added, removed } = callbacks
  forEachCommentArea(area => {
    if (added) {
      area.items.forEach(item => added(item))
      itemAddedCallbacks.push(added)
    }
    if (removed) {
      itemRemovedCallbacks.push(removed)
    }
  })
}
