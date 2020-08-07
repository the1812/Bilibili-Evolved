const commentAreaClass = 'bb-comment'
export interface CommentItem {
  element: HTMLElement
  id: string
  userID: string
  userName: string
  content: string
  timeText: string
  likes: number
  replies: Omit<CommentItem, 'replies'>[]
}
export type CommentItemCallback = (item: CommentItem) => void
export interface CommentArea {
  element: HTMLElement
  items: CommentItem[]
  observer?: Observer
}
export const commentAreas: CommentArea[] = []
const itemAddedCallbacks: CommentItemCallback[] = []
const itemRemovedCallbacks: CommentItemCallback[] = []
export type CommentAreaCallback = (area: CommentArea) => void
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
    })
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
  })
  area.observer = Observer.childListSubtree(area.element, records => {
    records.forEach(r => {
      const isCommentItem = (n: Node): n is HTMLElement => {
        return n instanceof HTMLElement &&
          n.classList.contains('list-item') &&
          n.classList.contains('reply-wrap')
      }
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
export const forEachCommentArea = (callback: CommentAreaCallback) => {
  commentAreas.forEach(it => callback(it))
  commentAreaCallbacks.push(callback)
}
export const forEachCommentItem = (callbacks: {
  added?: CommentItemCallback
  removed?: CommentItemCallback
}) => {
  const { added, removed } = callbacks
  commentAreas.forEach(area => {
    if (added) {
      area.items.forEach(item => added(item))
      itemAddedCallbacks.push(added)
    }
    if (removed) {
      itemRemovedCallbacks.push(removed)
    }
  })
}

Observer.childListSubtree(document.body, records => {
  records.forEach(r => {
    r.addedNodes.forEach(n => observeAreas(n))
  })
})
dqa('.' + commentAreaClass).forEach(observeAreas)

export default {
  export: {
    commentAreas,
    forEachCommentArea,
    forEachCommentItem,
  }
}
