import { dqa } from '@/core/utils'
import { allMutations, childList, childListSubtree } from '@/core/observer'
import { contentLoaded } from '@/core/life-cycle'

/** 表示一条评论回复 */
export class CommentReplyItem extends EventTarget {
  /** 对应元素 */
  element: HTMLElement
  /** 评论ID */
  id: string
  /** 评论者UID */
  userId: string
  /** 用户名 */
  userName: string
  /** 评论内容 */
  content: string
  /** (仅 v1) 评论时间 (文本) */
  timeText?: string
  /** (仅 v2) 评论时间戳 */
  time?: number
  /** 点赞数 */
  likes: number

  constructor(initParams: Omit<CommentReplyItem, keyof EventTarget>) {
    super()
    this.element = initParams.element
    this.id = initParams.id
    this.userId = initParams.userId
    this.userName = initParams.userName
    this.content = initParams.content
    this.timeText = initParams.timeText
    this.time = initParams.time
    this.likes = initParams.likes
  }
}

/** 评论更新的事件类型 */
export const RepliesUpdateEventType = 'repliesUpdate'
/** 评论更新的事件回调类型 */
export type RepliesUpdateEventCallback = (event: CustomEvent<CommentReplyItem[]>) => void
const createRepliesUpdateEvent = (replies: CommentReplyItem[]) => {
  return new CustomEvent(RepliesUpdateEventType, {
    detail: replies,
  })
}
/** 表示一条评论 */
export class CommentItem extends CommentReplyItem {
  /** 评论图片 */
  pictures?: string[]
  /** 回复 */
  replies: CommentReplyItem[]

  constructor(initParams: Omit<CommentItem, keyof EventTarget | 'dispatchRepliesUpdate'>) {
    super(initParams)
    this.pictures = initParams.pictures
    this.replies = initParams.replies
  }

  addEventListener(
    type: typeof RepliesUpdateEventType,
    callback: RepliesUpdateEventCallback | null,
    options?: EventListenerOptions | boolean,
  ) {
    super.addEventListener(type, callback, options)
  }

  removeEventListener(
    type: typeof RepliesUpdateEventType,
    callback: RepliesUpdateEventCallback | null,
    options?: EventListenerOptions | boolean,
  ) {
    super.removeEventListener(type, callback, options)
  }

  /** 触发评论更新事件 */
  dispatchRepliesUpdate(replies: CommentReplyItem[]) {
    return super.dispatchEvent(createRepliesUpdateEvent(replies))
  }
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

const commentAreaClasses = ['bili-comment', 'bb-comment']
const replyItemClasses = ['list-item.reply-wrap', 'reply-item']
const itemAddedCallbacks: CommentItemCallback[] = []
const itemRemovedCallbacks: CommentItemCallback[] = []
const commentAreaCallbacks: CommentAreaCallback[] = []

/** (v2) 获取 Vue 数据 (评论 / 回复) */
const getVueData = (element: HTMLElement) => {
  // eslint-disable-next-line no-underscore-dangle
  const props = (element as any).__vueParentComponent?.props
  return props?.reply ?? props?.subReply
}
/** (v2) 获取回复对应的元素 */
const getReplyItemElement = (parent: HTMLElement, replyId: string) => {
  const [replyElement] = dqa(parent, '.sub-reply-item').filter(
    (it: HTMLElement) => getVueData(it).rpid_str === replyId,
  )
  return replyElement as HTMLElement
}
/** (v1 / v2) 获取评论 ID */
const getCommentId = (element: HTMLElement) => {
  const attributeId = element.getAttribute('data-id')
  if (attributeId) {
    return attributeId
  }
  const vueData = getVueData(element)
  return vueData?.rpid_str ?? ''
}

/** (v2) 解析评论对象 */
const parseCommentItemV2 = (element: HTMLElement) => {
  const vueData = getVueData(element)
  if (!vueData) {
    throw new Error('Invalid comment item')
  }
  const parseReplies = () => {
    if (!vueData.replies) {
      return []
    }
    return vueData.replies.map((r: any): CommentReplyItem => {
      return new CommentReplyItem({
        id: r.rpid_str,
        element: getReplyItemElement(element, r.rpid_str),
        userId: r.member.mid,
        userName: r.member.uname,
        content: r.content.message,
        time: r.ctime * 1000,
        likes: r.like,
      })
    })
  }
  const item = new CommentItem({
    id: vueData.rpid_str,
    element,
    userId: vueData.member.mid,
    userName: vueData.member.uname,
    content: vueData.content.message,
    time: vueData.ctime * 1000,
    likes: vueData.like,
    pictures: vueData.content?.pictures?.map(img => {
      return img.img_src
    }),
    replies: parseReplies(),
  })
  if (item.replies.length < vueData.rcount) {
    const replyBox = dq(element, '.sub-reply-list')
    childList(replyBox, records => {
      item.replies = parseReplies()
      if (records.length !== 0) {
        item.dispatchRepliesUpdate(item.replies)
      }
    })
  }
  return item
}

/** (v1 / v2) 解析评论对象 */
const parseCommentItem = (element: HTMLElement) => {
  const user = element.querySelector('.con .user .name') as HTMLElement
  if (!user) {
    return parseCommentItemV2(element)
  }
  const parseReplyItem = (replyElement: HTMLElement) => {
    const replyFace = replyElement.querySelector('.reply-face') as HTMLElement
    const replyUser = replyElement.querySelector('.reply-con .user .name') as HTMLElement
    return new CommentReplyItem({
      id: replyElement.getAttribute('data-id'),
      element: replyElement,
      userId: replyFace.getAttribute('data-usercard-mid'),
      userName: replyUser.textContent,
      content: replyElement.querySelector('.text-con').textContent,
      timeText: replyElement.querySelector('.info .time, .info .time-location').textContent,
      likes: parseInt(replyElement.querySelector('.info .like span').textContent),
    })
  }
  const item = new CommentItem({
    id: element.getAttribute('data-id'),
    element,
    userId: user.getAttribute('data-usercard-mid'),
    userName: user.textContent,
    content: element.querySelector('.con .text').textContent,
    timeText: element.querySelector('.con .info .time, .info .time-location').textContent,
    likes: parseInt(element.querySelector('.con .like span').textContent),
    replies: [],
  })
  if (dq(element, '.reply-box .view-more')) {
    const replyBox = dq(element, '.reply-box') as HTMLElement
    childList(replyBox, records => {
      item.replies = dqa(element, '.reply-box .reply-item').map(parseReplyItem)
      if (records.length !== 0) {
        item.dispatchRepliesUpdate(item.replies)
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
  const replyItemSelector = replyItemClasses.map(c => `.${c}`).join(',')
  area.items = dqa(area.element, replyItemSelector).map(parseCommentItem)
  area.items.forEach(item => {
    itemAddedCallbacks.forEach(c => c(item))
  })
  ;[area.observer] = childListSubtree(area.element, records => {
    records.forEach(r => {
      const isCommentItem = (n: Node): n is HTMLElement =>
        n instanceof HTMLElement && n.matches(replyItemSelector)
      r.addedNodes.forEach(n => {
        if (isCommentItem(n)) {
          const commentItem = parseCommentItem(n)
          area.items.push(commentItem)
          itemAddedCallbacks.forEach(c => c(commentItem))
        }
      })
      r.removedNodes.forEach(n => {
        if (isCommentItem(n)) {
          const id = getCommentId(n)
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
  if (node instanceof HTMLElement && commentAreaClasses.some(c => node.classList.contains(c))) {
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
  dqa(commentAreaClasses.map(c => `.${c}`).join(',')).forEach(observeAreas)
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

const addMenuItemV2 = (...params: Parameters<typeof addMenuItem>) => {
  const [item, config] = params
  const operationList = dq(item.element, '.operation-list') as HTMLUListElement
  const { className, text, action } = config
  if (!operationList || dq(operationList, `.${className}`)) {
    return
  }
  const menuItem = document.createElement('li')
  menuItem.classList.add(className, 'operation-option')
  menuItem.innerHTML = `<span class="option-title">${text}</span>`
  menuItem.addEventListener('click', event => {
    action(event)
    operationList.style.display = 'none'
  })
  operationList.appendChild(menuItem)
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
  const operationList = dq(item.element, '.opera-list ul') as HTMLUListElement
  if (!operationList) {
    addMenuItemV2(item, config)
    return
  }
  const { className, text, action } = config
  if (dq(operationList, `.${className}`)) {
    return
  }
  const menuItem = document.createElement('li')
  menuItem.classList.add(className)
  menuItem.textContent = text
  menuItem.addEventListener('click', event => {
    action(event)
    operationList.style.display = 'none'
  })
  operationList.appendChild(menuItem)
}
