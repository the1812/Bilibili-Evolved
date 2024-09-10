import { ShadowDomObserver, shadowDomObserver, ShadowRootEvents } from '@/core/shadow-root'
import { CommentReplyItem } from '../reply-item'
import { CommentArea } from './base'
import { ShadowDomEntry } from '@/core/shadow-root/dom-entry'
import { CommentItem } from '../comment-item'
import { deleteValue } from '@/core/utils'
import { select } from '@/core/spin-query'

export class CommentAreaV3 extends CommentArea {
  protected static commentItemSelectors = 'bili-comment-thread-renderer'
  protected static commentReplyItemSelectors = 'bili-comment-reply-renderer'
  protected static commentActionsSelectors = 'bili-comment-action-buttons-renderer'
  protected static commentMenuSelectors = 'bili-comment-menu'
  protected static MenuItemConfigSymbol = Symbol.for('CommentAreaV3.MenuItemConfigSymbol')
  protected static getLitData(entry: ShadowDomEntry) {
    const host = entry.element as HTMLElement & { __data: any }
    // eslint-disable-next-line no-underscore-dangle
    return host.__data
  }

  static isV3Area(element: HTMLElement) {
    return element.tagName.toLowerCase() === 'bili-comments'
  }

  public commentAreaEntry: ShadowDomEntry

  protected shadowDomObserver: ShadowDomObserver
  protected itemEntryMap = new Map<ShadowDomEntry, CommentItem>()

  private handleEntryAdded: (e: CustomEvent<ShadowDomEntry>) => void
  private handleEntryRemoved: (e: CustomEvent<ShadowDomEntry>) => void
  private areaObserverDisposer: () => void

  constructor(element: HTMLElement) {
    super(element)
    this.shadowDomObserver = shadowDomObserver
  }

  protected matchChildEntryByReplyId(
    parent: ShadowDomEntry,
    childSelectors: string,
    replyId: string,
  ) {
    const children = parent.querySelectorAllAsEntry(childSelectors)
    return children.find(r => CommentAreaV3.getLitData(r).rpid_str === replyId)
  }

  protected getReplyItemElement(parent: ShadowDomEntry, replyId: string): HTMLElement {
    return this.matchChildEntryByReplyId(parent, CommentAreaV3.commentReplyItemSelectors, replyId)
      ?.element as HTMLElement
  }

  protected parseCommentReplyItem(replyEntry: ShadowDomEntry): CommentReplyItem {
    const replyLitData = CommentAreaV3.getLitData(replyEntry)
    return new CommentReplyItem({
      id: replyLitData.rpid_str,
      element: replyEntry.element as HTMLElement,
      userId: replyLitData.member.mid,
      userName: replyLitData.member.uname,
      content: replyLitData.content.message,
      time: replyLitData.ctime * 1000,
      likes: replyLitData.like,
      frameworkSpecificProps: replyLitData,
    })
  }

  protected parseCommentItem(entry: ShadowDomEntry): CommentItem {
    const litData = CommentAreaV3.getLitData(entry)
    const getReplies = () =>
      entry
        .querySelectorAllAsEntry(CommentAreaV3.commentReplyItemSelectors)
        .map(replyEntry => this.parseCommentReplyItem(replyEntry))
    const item = new CommentItem({
      id: litData.rpid_str,
      element: entry.element as HTMLElement,
      userId: litData.member.mid,
      userName: litData.member.uname,
      content: litData.content.message,
      time: litData.ctime * 1000,
      likes: litData.like,
      pictures: litData.content?.pictures?.map((img: { img_src: string }) => {
        return img.img_src
      }),
      replies: getReplies(),
      frameworkSpecificProps: litData,
    })
    entry.addEventListener(
      ShadowRootEvents.Updated,
      lodash.debounce(() => {
        const newReplies = getReplies()
        const hasUpdate =
          item.replies.length !== newReplies.length ||
          !item.replies.every(r => newReplies.some(newReply => newReply.id === r.id))
        if (hasUpdate) {
          item.replies = newReplies
          item.dispatchRepliesUpdate(item.replies)
        }
      }),
    )
    return item
  }

  protected addCommentItem(entry: ShadowDomEntry) {
    if (this.itemEntryMap.has(entry)) {
      return
    }
    const commentItem = this.parseCommentItem(entry)
    this.itemEntryMap.set(entry, commentItem)
    this.items.push(commentItem)
    this.itemCallbacks.forEach(c => c.added?.(commentItem))
  }

  protected removeCommentItem(entry: ShadowDomEntry) {
    const itemToRemove = this.items.find(it => it.element === entry.element)
    this.itemEntryMap.delete(entry)
    deleteValue(this.items, it => it === itemToRemove)
    this.itemCallbacks.forEach(c => c.removed?.(itemToRemove))
  }

  protected observeCommentItems() {
    const entries = this.commentAreaEntry.querySelectorAllAsEntry(
      CommentAreaV3.commentItemSelectors,
    )
    entries.forEach(entry => this.addCommentItem(entry))

    this.handleEntryAdded = (e: CustomEvent<ShadowDomEntry>) => {
      const entry = e.detail
      if (entry.element.matches(CommentAreaV3.commentItemSelectors)) {
        this.addCommentItem(entry)
      }
    }
    this.commentAreaEntry.addEventListener(ShadowRootEvents.Added, this.handleEntryAdded)
    this.handleEntryRemoved = (e: CustomEvent<ShadowDomEntry>) => {
      const entry = e.detail
      if (!this.itemEntryMap.has(entry)) {
        return
      }
      this.removeCommentItem(entry)
    }
    this.commentAreaEntry.addEventListener(ShadowRootEvents.Removed, this.handleEntryRemoved)
  }

  observe() {
    return new Promise<void>(resolve => {
      this.areaObserverDisposer = this.shadowDomObserver.watchShadowDom({
        added: shadowDom => {
          if (shadowDom.element !== this.element) {
            return
          }
          this.commentAreaEntry = shadowDom
          this.observeCommentItems()
          resolve()
        },
      })
    })
  }

  disconnect() {
    this.commentAreaEntry.removeEventListener(ShadowRootEvents.Added, this.handleEntryAdded)
    this.commentAreaEntry.removeEventListener(ShadowRootEvents.Removed, this.handleEntryRemoved)
    this.areaObserverDisposer?.()
  }

  async addMenuItem(
    item: CommentReplyItem,
    config: { className: string; text: string; action: (e: MouseEvent) => void },
  ) {
    const itemEntry = item.shadowDomEntry
    if (itemEntry === undefined) {
      return
    }

    const actions = await select(() =>
      this.matchChildEntryByReplyId(itemEntry, CommentAreaV3.commentActionsSelectors, item.id),
    )
    if (!actions) {
      return
    }

    const menu = actions.querySelectorAsEntry(CommentAreaV3.commentMenuSelectors)
    if (!menu) {
      return
    }

    const list = menu.querySelector('#options')
    const alreadyAdded = list.querySelector(`li.${config.className}`)
    if (alreadyAdded) {
      return
    }

    const listItem = document.createElement('li')
    listItem.innerHTML = config.text
    listItem.className = config.className
    listItem[CommentAreaV3.MenuItemConfigSymbol] = config
    listItem.addEventListener('click', e => {
      config.action(e)
      ;(menu.element as HTMLElement).style.setProperty('--bili-comment-menu-display', null)
    })
    list.appendChild(listItem)
  }
}
