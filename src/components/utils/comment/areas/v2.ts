/* eslint-disable no-underscore-dangle */
import { childList } from '@/core/observer'
import { CommentItem } from '../comment-item'
import { CommentArea } from './base'
import { CommentReplyItem } from '../reply-item'

interface HTMLElementWithVue extends HTMLElement {
  _vnode?: any
  __vue_app__?: any
  parentElement: HTMLElementWithVue | null
}
export class CommentAreaV2 extends CommentArea {
  protected prepareParse() {
    this.updateVNode()
  }

  protected get elementWithVue() {
    return this.element as HTMLElementWithVue
  }

  /** 获取 Vue 数据 (评论 / 回复) */
  protected getReplyFromVueData(element: HTMLElement) {
    const props = (element as HTMLElementWithVue)._vnode?.props
    return props?.reply ?? props?.subReply
  }

  /** 获取回复对应的元素 */
  protected getReplyItemElement(parent: HTMLElement, replyId: string) {
    const [replyElement] = dqa(parent, '.sub-reply-item').filter(
      (it: HTMLElement) => this.getReplyFromVueData(it).rpid_str === replyId,
    )
    return replyElement as HTMLElement
  }

  protected updateVNode() {
    const vnode = (() => {
      if (this.elementWithVue.__vue_app__) {
        return this.elementWithVue._vnode
      }
      if (this.elementWithVue.parentElement.__vue_app__) {
        return this.elementWithVue.parentElement._vnode
      }
      return null
    })()
    if (!vnode) {
      throw new Error('vnode not found')
    }
    this.exposeVNode(vnode)
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
    const vueData = this.getReplyFromVueData(element)
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
          element: this.getReplyItemElement(element, r.rpid_str),
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
  getCommentId(element: HTMLElement): string {
    const vueData = this.getReplyFromVueData(element)
    if (!vueData?.rpid_str) {
      throw new Error('Invalid comment item')
    }
    return vueData.rpid_str
  }

  /**
   * 将评论区 VNode 进行暴露
   * @see https://github.com/the1812/Bilibili-Evolved/issues/4690#issuecomment-2059485344
   */
  protected exposeVNode(vnode: any) {
    if (vnode.el && !vnode.el._vnode) {
      vnode.el._vnode = vnode
      const replyData = this.getReplyFromVueData(vnode.el)
      const hasSubReplies = Boolean(replyData?.replies)
      if (replyData && !hasSubReplies) {
        return
      }
    }
    // 该 vnode 为组件实例
    if (vnode.component?.subTree) {
      this.exposeVNode(vnode.component.subTree)
    }
    // 该 vnode 为模板树
    else if (Array.isArray(vnode.children)) {
      vnode.children.forEach((child: any) => this.exposeVNode(child))
    }
  }

  static isV2Area(element: HTMLElement) {
    return (
      (element as HTMLElementWithVue).__vue_app__ ||
      (element as HTMLElementWithVue).parentElement?.__vue_app__
    )
  }
}
