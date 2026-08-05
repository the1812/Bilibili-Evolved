import { defineComponentMetadata } from '@/components/define'
import { CommentItem, CommentReplyItem } from '@/components/utils/comment-apis'

const isCommentLiked = (item: CommentReplyItem) =>
  item.frameworkSpecificProps?.up_action?.like === true

const createUpLiked = (footer: HTMLDivElement) => {
  const tagsContainerElement =
    (footer.querySelector('#tags') as HTMLDivElement | null) ?? document.createElement('div')
  tagsContainerElement.id = 'tags'

  if (tagsContainerElement.querySelector('.tag') !== null) {
    if (footer.contains(tagsContainerElement)) {
      return
    }
  }

  const mainTag = document.createElement('div')
  mainTag.className = 'tag'
  mainTag.textContent = 'UP主觉得很赞'

  tagsContainerElement.appendChild(mainTag)
  if (!footer.contains(tagsContainerElement)) {
    footer.appendChild(tagsContainerElement)
  }
}

const processItems = (items: CommentReplyItem[]) => {
  items.forEach(item => {
    if (!isCommentLiked(item)) {
      return
    }

    const footer = item.shadowDomEntry.shadowRoot.getElementById('footer') as HTMLDivElement | null
    if (footer === null) {
      return
    }

    createUpLiked(footer)
  })
}

const entry = async () => {
  const { forEachCommentItem } = await import('@/components/utils/comment-apis')
  const addUpLikedMark = (comment: CommentItem) => {
    processItems(comment.replies)
    comment.addEventListener('repliesUpdate', event => processItems(event.detail))
  }
  forEachCommentItem({ added: addUpLikedMark })
}

export const component = defineComponentMetadata({
  name: 'commentReplyUpLikeShow',
  author: {
    name: 'Light_Quanta',
    link: 'https://github.com/LightQuanta',
  },
  displayName: '楼中楼回复“UP主觉得很赞”显示',
  tags: [componentsTags.utils],
  instantStyles: [
    {
      name: 'comment-reply-up-like-show',
      style: () => import('./comment-reply-up-like-show.scss'),
      shadowDom: true,
    },
  ],
  entry,
})
