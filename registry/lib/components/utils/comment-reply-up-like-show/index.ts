import { defineComponentMetadata } from '@/components/define'
import { CommentItem, CommentReplyItem } from '@/components/utils/comment-apis'
import { getCookieValue } from '@/core/utils'

const officialDarkModeClass = 'comment-up-like-official-dark'

const updateOfficialDarkMode = () => {
  document.documentElement.classList.toggle(
    officialDarkModeClass,
    getCookieValue('theme_style') === 'dark',
  )
}

const cookieChangeHandler = (e: CookieChangedEvent) => {
  if (e.changed.some(cookie => cookie.name === 'theme_style')) {
    updateOfficialDarkMode()
  }
}

const createUpLiked = (footer: HTMLDivElement) => {
  const tagsContainerElement =
    (footer.querySelector('#tags') as HTMLDivElement | null) ?? document.createElement('div')
  tagsContainerElement.id = 'tags'

  if (!footer.contains(tagsContainerElement)) {
    footer.appendChild(tagsContainerElement)
  }

  if (!tagsContainerElement.querySelector('.tag')) {
    const mainTag = document.createElement('div')
    mainTag.className = 'tag'
    mainTag.textContent = 'UP主觉得很赞'
    tagsContainerElement.appendChild(mainTag)
  }
}

const processItems = (items: CommentReplyItem[]) => {
  items.forEach(item => {
    if (item.frameworkSpecificProps?.up_action?.like !== true) {
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
  cookieStore.addEventListener('change', cookieChangeHandler)
  updateOfficialDarkMode()
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
  reload: () => {
    cookieStore.addEventListener('change', cookieChangeHandler)
    updateOfficialDarkMode()
  },
  unload: () => {
    cookieStore.removeEventListener('change', cookieChangeHandler)
    document.documentElement.classList.remove(officialDarkModeClass)
  },
})
