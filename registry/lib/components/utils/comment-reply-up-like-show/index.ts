import { defineComponentMetadata } from '@/components/define'
import { CommentItem, CommentReplyItem } from '@/components/utils/comment-apis'

// 获取是否有“UP主觉得很赞”标识
const isCommentLiked = (item: CommentReplyItem) => {
  /* eslint-disable no-underscore-dangle */
  return item.frameworkSpecificProps?.up_action?.like ?? false
}

// 仿制普通评论标识的“UP主觉得很赞”
const createUpLiked = (rootElement: HTMLDivElement) => {
  const existingTagsElement = rootElement.querySelector('#tags') as HTMLDivElement | null

  const tagsContainerElement = existingTagsElement ?? document.createElement('div')
  tagsContainerElement.style.cssText = `
        margin-top: 6px;
        display: flex;
        align-items: center;
    `

  const mainTag = document.createElement('div')
  mainTag.style.cssText = `
        --bili-comment-tag-color-light: #757575;
        --bili-comment-tag-color-dark: #939393;
        --bili-comment-tag-bg-light: #F4F4F4;
        --bili-comment-tag-bg-dark: #1E1E1E;
        --bili-comment-tag-color: var(--bili-comment-tag-color-light);
        --bili-comment-tag-bg: var(--bili-comment-tag-bg-light);
        color: var(--bili-comment-tag-color, --brand_pink);
        background-color: var(--bili-comment-tag-bg, ----brand_pink_thin);
        padding: 6px;
        border-radius: 2px;
        box-sizing: border-box;
        font-size: 12px;
        line-height: 1;
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
