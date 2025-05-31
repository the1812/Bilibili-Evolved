import { childList } from '@/core/observer'
import { CommentItem } from '../comment-item'
import { CommentReplyItem } from '../reply-item'
import { DomCommentArea } from './dom'

export class CommentAreaV1 extends DomCommentArea {
  addMenuItem(
    item: CommentReplyItem,
    config: { className: string; text: string; action: (e: MouseEvent) => void },
  ): void {
    if (!this.element.contains(item.element)) {
      return
    }
    const operationList = dq(item.element, '.opera-list ul') as HTMLUListElement
    if (!operationList) {
      throw new Error('Invalid operation list')
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
  parseCommentItem(element: HTMLElement): CommentItem {
    const user = element.querySelector('.con .user .name') as HTMLElement
    if (!user) {
      throw new Error('Invalid comment item')
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
        frameworkSpecificProps: undefined,
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
      frameworkSpecificProps: undefined,
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
  getCommentId(element: HTMLElement): string {
    const attributeId = element.getAttribute('data-id')
    if (!attributeId) {
      throw new Error('Invalid comment item')
    }
    return attributeId
  }
}
