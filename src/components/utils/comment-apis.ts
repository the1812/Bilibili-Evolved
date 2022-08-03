import { dqa } from '@/core/utils'
import { allMutations, childList, childListSubtree } from '@/core/observer'
import { contentLoaded } from '@/core/life-cycle'

/** 表示一条评论回复 */
export interface CommentReplyItem {
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
}
/** 表示一条评论 */
export interface CommentItem extends CommentReplyItem {
  /** 回复 */
  replies: CommentReplyItem[]
  /** 回复有更新时调用此函数 */
  onRepliesUpdate?: (replies: CommentReplyItem[]) => void
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
  const parseReplyItem = (replyElement: HTMLElement) => {
    const replyFace = replyElement.querySelector('.reply-face') as HTMLElement
    const replyUser = replyElement.querySelector('.reply-con .user .name') as HTMLElement
    return {
      id: replyElement.getAttribute('data-id'),
      element: replyElement,
      userID: replyFace.getAttribute('data-usercard-mid'),
      userName: replyUser.textContent,
      content: replyElement.querySelector('.text-con').textContent,
      timeText: replyElement.querySelector('.info .time, .info .time-location').textContent,
      likes: parseInt(replyElement.querySelector('.info .like span').textContent),
    }
  }
  const item: CommentItem = {
    id: element.getAttribute('data-id'),
    element,
    userID: user.getAttribute('data-usercard-mid'),
    userName: user.textContent,
    content: element.querySelector('.con .text').textContent,
    timeText: element.querySelector('.con .info .time, .info .time-location').textContent,
    likes: parseInt(element.querySelector('.con .like span').textContent),
    replies: [],
  }
  if (dq(element, '.reply-box .view-more')) {
    const replyBox = dq(element, '.reply-box') as HTMLElement
    childList(replyBox, records => {
      item.replies = dqa(element, '.reply-box .reply-item').map(parseReplyItem)
      if (records.length !== 0) {
        item.onRepliesUpdate?.(item.replies)
      }
    })
  } else {
    item.replies = dqa(element, '.reply-box .reply-item').map(parseReplyItem)
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
          const id = n.getAttribute('data-id')
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
const init = () => {
  allMutations(records => {
    records.forEach(r => {
      r.addedNodes.forEach(n => observeAreas(n))
    })
  })
  dqa(`.${commentAreaClass}`).forEach(observeAreas)
}
contentLoaded(init)

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
/**
 * 向评论的菜单中添加菜单项
 * @param item 评论
 * @param config 菜单项配置
 */
export const addMenuItem = (item: CommentReplyItem, config: {
  className: string
  text: string
  action: (e: MouseEvent) => void
}) => {
  const operationList = dq(item.element, '.opera-list ul') as HTMLUListElement
  const { className, text, action } = config
  if (!operationList || dq(operationList, `.${className}`)) {
    return
  }
  const menuItem = document.createElement('li')
  menuItem.classList.add(className)
  menuItem.textContent = text
  menuItem.addEventListener('click', event => {
    action(event)
  })
  operationList.appendChild(menuItem)
}
