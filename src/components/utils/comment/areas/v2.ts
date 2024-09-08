/* eslint-disable no-underscore-dangle */
import { childList } from '@/core/observer'
import { CommentItem } from '../comment-item'
import { DomCommentArea } from './dom'
import { CommentReplyItem } from '../reply-item'
import { HTMLElementWithVue, VNodeManager } from '../vnode-manager'

export class CommentAreaV2 extends DomCommentArea {
  private vnodeManager: VNodeManager

  constructor(element: HTMLElement) {
    super(element)
    this.vnodeManager = new VNodeManager(this.getVNodeRoot(element as HTMLElementWithVue))
    this.vnodeManager.isEnd = vnode => {
      if (vnode.props?.reply) {
        return vnode.props?.reply.replies.length === 0
      }
      return Boolean(vnode.props?.subReply)
    }
  }

  protected beforeParse(elements: HTMLElementWithVue[]) {
    const rootElements = new Set<HTMLElementWithVue>()
    elements.forEach(replyElement => {
      rootElements.add(this.vnodeManager.traverseToRoot(replyElement))
      dqa(replyElement, '.sub-reply-item').forEach(subReplyElement => {
        rootElements.add(this.vnodeManager.traverseToRoot(subReplyElement as HTMLElementWithVue))
      })
    })
    rootElements.forEach(rootElement => this.vnodeManager.exposeVNode(rootElement._vnode))
  }

  /** 获取 Vue 数据 (评论 / 回复) */
  protected getReplyFromVueProps(element: HTMLElement) {
    const props = (element as HTMLElementWithVue)._vnode?.props
    return props?.reply ?? props?.subReply
  }

  /** 获取回复对应的元素 */
  protected getReplyItemElement(parent: HTMLElement, replyId: string) {
    const [replyElement] = dqa(parent, '.sub-reply-item').filter(
      (it: HTMLElement) => this.getReplyFromVueProps(it).rpid_str === replyId,
    )
    return replyElement as HTMLElement
  }

  protected getVNodeRoot(element: HTMLElementWithVue) {
    if (element.__vue_app__) {
      return element
    }
    if (element.parentElement.__vue_app__) {
      return element.parentElement
    }
    return null
  }

  addMenuItem(
    item: CommentReplyItem,
    config: { className: string; text: string; action: (e: MouseEvent) => void },
  ): void {
    if (!this.element.contains(item.element)) {
      return
    }
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

  parseCommentItem(element: HTMLElement): CommentItem {
    const vueProps = this.getReplyFromVueProps(element)
    if (!vueProps) {
      throw new Error('Invalid comment item')
    }
    const parseReplies = () => {
      if (!vueProps.replies) {
        return []
      }
      return vueProps.replies.map((r: any): CommentReplyItem => {
        return new CommentReplyItem({
          id: r.rpid_str,
          element: this.getReplyItemElement(element, r.rpid_str),
          userId: r.member.mid,
          userName: r.member.uname,
          content: r.content.message,
          time: r.ctime * 1000,
          likes: r.like,
          frameworkSpecificProps: r,
        })
      })
    }
    const item = new CommentItem({
      id: vueProps.rpid_str,
      element,
      userId: vueProps.member.mid,
      userName: vueProps.member.uname,
      content: vueProps.content.message,
      time: vueProps.ctime * 1000,
      likes: vueProps.like,
      pictures: vueProps.content?.pictures?.map((img: any) => {
        return img.img_src
      }),
      replies: parseReplies(),
      frameworkSpecificProps: vueProps,
    })
    if (item.replies.length < vueProps.rcount) {
      const replyBox = dq(element, '.sub-reply-list')
      childList(replyBox, records => {
        performance.mark(`parseReplies start ${item.id}`)
        const addedCommentElements: HTMLElement[] = []
        records.forEach(r => {
          r.addedNodes.forEach(n => {
            if (n instanceof HTMLElement && n.matches('.sub-reply-item')) {
              addedCommentElements.push(n)
            }
          })
        })
        if (addedCommentElements.length === 0) {
          return
        }
        this.beforeParse(addedCommentElements)
        item.replies = parseReplies()
        if (records.length !== 0) {
          item.dispatchRepliesUpdate(item.replies)
        }
        performance.mark(`parseReplies end ${item.id}`)
        performance.measure(
          `parseReplies ${item.id}`,
          `parseReplies start ${item.id}`,
          `parseReplies end ${item.id}`,
        )
      })
    }
    return item
  }
  getCommentId(element: HTMLElement): string {
    const vueProps = this.getReplyFromVueProps(element)
    if (!vueProps?.rpid_str) {
      throw new Error('Invalid comment item')
    }
    return vueProps.rpid_str
  }

  static isV2Area(element: HTMLElement) {
    return (
      (element as HTMLElementWithVue).__vue_app__ ||
      (element as HTMLElementWithVue).parentElement?.__vue_app__
    )
  }
}
