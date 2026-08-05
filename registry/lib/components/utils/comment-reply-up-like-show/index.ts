import { defineComponentMetadata } from '@/components/define'
import { CommentItem, CommentReplyItem } from '@/components/utils/comment-apis'

const replyRendererStyleRule = `
    :host-context(body.dark) .tag {
      --bili-comment-tag-color: var(--bili-comment-tag-color-dark);
      --bili-comment-tag-bg: var(--bili-comment-tag-bg-dark);
    }
    #tags {
      margin-top: 6px;
      display: flex;
      align-items: center;
    }
    .tag {
      --bili-comment-tag-color: var(--bili-comment-tag-color-light);
      --bili-comment-tag-bg: var(--bili-comment-tag-bg-light);
      color: var(--bili-comment-tag-color, --brand_pink);
      background-color: var(--bili-comment-tag-bg, ----brand_pink_thin);
      padding: 6px;
      border-radius: 2px;
      box-sizing: border-box;
      font-size: 12px;
      line-height: 1;
    }
  `

const replyRendererStyleSheet = new CSSStyleSheet()
replyRendererStyleSheet.replaceSync(replyRendererStyleRule)

const injectedShadowRoots = new WeakSet<ShadowRoot>()

const getNearestCommentReplyShadowRoot = (element: Element): ShadowRoot | null => {
  let rootNode: Node | ShadowRoot = element.getRootNode() as Node | ShadowRoot
  while (rootNode instanceof ShadowRoot) {
    const root = rootNode.host
    if (root instanceof HTMLElement && root.matches('bili-comment-reply-renderer')) {
      return rootNode
    }
    rootNode = root.getRootNode() as Node | ShadowRoot
  }

  const replyHost = (element as HTMLElement).closest(
    'bili-comment-reply-renderer',
  ) as HTMLElement | null
  return replyHost?.shadowRoot ?? null
}

const ensureReplyRendererStyleSheet = (rootElement: Element) => {
  const shadowRoot = getNearestCommentReplyShadowRoot(rootElement)
  if (shadowRoot === null || injectedShadowRoots.has(shadowRoot)) {
    return
  }

  if (Array.isArray(shadowRoot.adoptedStyleSheets)) {
    shadowRoot.adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets, replyRendererStyleSheet]
  }
  injectedShadowRoots.add(shadowRoot)
}

// 获取是否有“UP主觉得很赞”标识
const isCommentLiked = (item: CommentReplyItem) => {
  /* eslint-disable no-underscore-dangle */
  return item.frameworkSpecificProps?.up_action?.like ?? false
}

// 仿制普通评论标识的“UP主觉得很赞”
const createUpLiked = (rootElement: HTMLDivElement) => {
  ensureReplyRendererStyleSheet(rootElement)
  const existingTagsElement = rootElement.querySelector('#tags') as HTMLDivElement | null

  const tagsContainerElement = existingTagsElement ?? document.createElement('div')
  tagsContainerElement.id = 'tags'

  const mainTag = document.createElement('div')
  mainTag.className = 'tag'
  mainTag.style.cssText = `
        --bili-comment-tag-color-light: #757575;
        --bili-comment-tag-color-dark: #939393;
        --bili-comment-tag-bg-light: #F4F4F4;
        --bili-comment-tag-bg-dark: #1E1E1E;
    `
  mainTag.textContent = 'UP主觉得很赞'

  tagsContainerElement.appendChild(mainTag)

  if (existingTagsElement === null) {
    rootElement.appendChild(tagsContainerElement)
  }
}

const processItems = (items: CommentReplyItem[]) => {
  items.forEach(item => {
    if (!isCommentLiked(item)) {
      return
    }

    const footer = item.shadowDomEntry.shadowRoot.getElementById('footer') as HTMLDivElement
    createUpLiked(footer)
  })
}

const entry = async () => {
  const { forEachCommentItem } = await import('@/components/utils/comment-apis')
  const addUpLikedMark = (comment: CommentItem) => {
    processItems(comment.replies)
    comment.addEventListener('repliesUpdate', replies => processItems(replies.detail))
  }
  forEachCommentItem({
    added: addUpLikedMark,
  })
}

export const component = defineComponentMetadata({
  name: 'commentReplyUpLikeShow',
  author: {
    name: 'Light_Quanta',
    link: 'https://github.com/LightQuanta',
  },
  displayName: '楼中楼回复“UP主觉得很赞”显示',
  tags: [componentsTags.utils],
  entry,
})
