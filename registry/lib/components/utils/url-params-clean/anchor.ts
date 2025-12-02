import { CommentAreaV3, forEachCommentArea } from '@/components/utils/comment-apis'
import { contentLoaded } from '@/core/life-cycle'
import { ShadowRootEvents } from '@/core/shadow-root'
import { console } from './index'

const isAnchor = (n: Node): n is HTMLAnchorElement => n.nodeName === 'A'

const observe = async (
  target: Node,
  options: MutationObserverInit,
  callback: (mutation: MutationRecord, observer: MutationObserver) => void,
) => {
  if (target) {
    const observer = new MutationObserver((d, ob) => d.forEach(r => callback(r, ob)))
    observer.observe(target, options)
  }
}

const observeChildListSubtreeHref = {
  attributes: true,
  attributeFilter: ['href'],
  childList: true,
  subtree: true,
  characterData: false,
}

export const cleanAnchors = async (getCleanUrl: (u: string) => string) => {
  const clean = (a: Node) => {
    if (!isAnchor(a) || !a.href) {
      return
    }
    const newUrl = getCleanUrl(a.href)
    if (a.href === newUrl) {
      return
    }
    console.info('清理A标签', a, a.href, newUrl)
    a.href = newUrl
  }

  const cleanAll = (anchors: Iterable<Node> | ArrayLike<Node>) => {
    Array.from(anchors).forEach(clean)
  }

  const cleanMutationAnchors = (r: MutationRecord) => {
    if (r.attributeName === 'href') {
      clean(r.target)
    } else if (r.addedNodes[0] && r.addedNodes[0] instanceof HTMLElement) {
      cleanAll(r.addedNodes[0].querySelectorAll('a'))
    }
  }

  contentLoaded(() => {
    // DOMContentLoaded 时标签的垃圾参数在 HTML 中自带, 不会触发 MutationObserver
    cleanAll(dqa('.tag-panel .tag-link'))

    // 切换视频时的标签由 JS 添加，需要使用监听
    observe(dq('.tag-panel'), observeChildListSubtreeHref, cleanMutationAnchors)

    // 视频简介
    observe(dq('#v_desc'), { childList: true, subtree: true, characterData: false }, r => {
      if (r.addedNodes.length > 0 && r.target instanceof HTMLElement) {
        cleanAll(r.target.querySelectorAll('a'))
      }
    })

    // 视频推荐列表
    cleanAll(dqa('.recommend-list-container a'))
    observe(
      dq('.rcmd-tab,.recommend-list-container'),
      observeChildListSubtreeHref,
      cleanMutationAnchors,
    )

    // 评论区
    forEachCommentArea(async area => {
      if (area instanceof CommentAreaV3) {
        area.commentAreaEntry.addEventListener(
          ShadowRootEvents.Updated,
          (ev: CustomEvent<MutationRecord[]>) =>
            ev.detail.forEach(r => {
              r.addedNodes.forEach(node => clean(node))
            }),
        )
      }
    })
  })
}
