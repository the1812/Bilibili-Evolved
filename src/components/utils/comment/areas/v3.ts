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
  protected static getLitData(entry: ShadowDomEntry) {
    const host = entry.element as HTMLElement & { __data: any }
    // eslint-disable-next-line no-underscore-dangle
    return host.__data
  }

  static isV3Area(element: HTMLElement) {
    return element.tagName.toLowerCase() === 'bili-comments'
  }

  protected shadowDomObserver: ShadowDomObserver
  protected commentAreaEntry: ShadowDomEntry
  protected itemEntryMap = new Map<ShadowDomEntry, CommentItem>()

  private handleEntryAdded: (e: CustomEvent<ShadowDomEntry>) => void
  private handleEntryRemoved: (e: CustomEvent<ShadowDomEntry>) => void
  private areaObserverDisposer: () => void

  constructor(element: HTMLElement) {
    super(element)
    shadowDomObserver.observe()
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

  protected parseCommentItem(entry: ShadowDomEntry): CommentItem {
    const litData = CommentAreaV3.getLitData(entry)
    const parseReplies = () => {
      if (!litData.replies) {
        return []
      }
      return (litData.replies as any[])
        .map((r): CommentReplyItem | null => {
          const element = this.getReplyItemElement(entry, r.rpid_str)
          if (!element) {
            return null
          }
          return new CommentReplyItem({
            id: r.rpid_str,
            element,
            userId: r.member.mid,
            userName: r.member.uname,
            content: r.content.message,
            time: r.ctime * 1000,
            likes: r.like,
            frameworkSpecificProps: r,
          })
        })
        .filter((r): r is CommentReplyItem => r !== null)
    }
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
      replies: parseReplies(),
      frameworkSpecificProps: litData,
    })
    if (item.replies.length < litData.rcount) {
      const handler = (e: CustomEvent<ShadowDomEntry>) => {
        const replyEntry = e.detail
        if (!replyEntry.element.matches(CommentAreaV3.commentReplyItemSelectors)) {
          return
        }
        item.replies = parseReplies()
        item.dispatchRepliesUpdate(item.replies)
        if (item.replies.length >= litData.rcount) {
          entry.removeEventListener(ShadowRootEvents.Added, handler)
        }
      }
      entry.addEventListener(ShadowRootEvents.Added, handler)
    }
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
    this.areaObserverDisposer = this.shadowDomObserver.watchShadowDom({
      added: shadowDom => {
        if (shadowDom.element !== this.element) {
          return
        }
        this.commentAreaEntry = shadowDom
        this.observeCommentItems()
      },
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
    const itemEntry = [...this.itemEntryMap.entries()].find(
      ([, savedItem]) => savedItem === item,
    )?.[0]
    if (!itemEntry) {
      return
    }

    const actions = await select(() =>
      this.matchChildEntryByReplyId(itemEntry, CommentAreaV3.commentActionsSelectors, item.id),
    )
    if (!actions) {
      return
    }

    const menu = actions.querySelectorAsEntry(CommentAreaV3.commentMenuSelectors)
    const list = menu?.querySelector('#options')
    const listItem = document.createElement('li')
    listItem.innerHTML = config.text
    listItem.className = config.className
    listItem.addEventListener('click', e => {
      config.action(e)
      ;(menu.element as HTMLElement).style.setProperty('--bili-comment-menu-display', null)
    })
    list?.appendChild(listItem)
  }
}
