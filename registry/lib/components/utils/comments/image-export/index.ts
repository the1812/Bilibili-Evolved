import { defineComponentMetadata } from '@/components/define'
import { CommentItem } from '@/components/utils/comment-apis'
import { setCommentImages, panelVisible } from './store'
import { downloadSingleComment } from './download'
import { select } from '@/core/spin-query'
import { mountVueComponent } from '@/core/utils'
import Panel from './Panel.vue'

let panelMounted = false

const mountPanel = () => {
  if (panelMounted) {
    return
  }
  const instance = mountVueComponent(Panel)
  document.body.appendChild(instance.$el)
  panelMounted = true
}

const collectImagesFromArea = async (commentAreaElement: HTMLElement) => {
  const { commentAreaManager } = await import('@/components/utils/comment-apis')
  const area = commentAreaManager.commentAreas.find(a => a.element === commentAreaElement)
  if (!area) {
    return []
  }
  const images: CommentItem[] = []
  area.forEachCommentItem(item => {
    if (item.pictures?.length) {
      images.push(item)
    }
  })
  return images
}

const showPanel = async (commentAreaElement: HTMLElement) => {
  const images = await collectImagesFromArea(commentAreaElement)
  const imageData = images.map(item => ({
    commentId: item.id,
    userName: item.userName,
    userId: item.userId,
    content: item.content,
    time: item.time,
    pictures: item.pictures.map(url => url.replace(/^http:/, 'https:')),
  }))
  setCommentImages(imageData)
  mountPanel()
  panelVisible.value = true
}

export const addNavButton = async (commentAreaElement: HTMLElement) => {
  if (commentAreaElement.tagName.toLowerCase() === 'bili-comments') {
    const headerRenderer = await select(
      () =>
        commentAreaElement.shadowRoot?.querySelector('bili-comments-header-renderer')?.shadowRoot,
    )
    if (!headerRenderer) {
      return
    }

    if (headerRenderer.querySelector('.cie-nav-trigger')) {
      return
    }

    const buttons = headerRenderer.querySelectorAll('bili-text-button')
    const lastButton = buttons[buttons.length - 1]

    if (lastButton) {
      const newButton = document.createElement('bili-text-button')
      newButton.className = 'cie-nav-trigger'
      newButton.textContent = '解析评论区图片'
      newButton.addEventListener('click', () => showPanel(commentAreaElement))
      lastButton.after(newButton)
    }
    return
  }

  if (commentAreaElement.querySelector('.cie-nav-trigger')) {
    return
  }

  const button = document.createElement('div')
  button.className = 'cie-nav-trigger bili-tabs__nav__item'
  button.textContent = '解析评论区图片'
  button.addEventListener('click', () => showPanel(commentAreaElement))

  const navContainer = commentAreaElement.querySelector('.bili-tabs__nav__items')
  if (navContainer) {
    navContainer.appendChild(button)
  } else {
    commentAreaElement.insertBefore(button, commentAreaElement.firstChild)
  }
}

const entry = async () => {
  const { forEachCommentArea, addMenuItem } = await import('@/components/utils/comment-apis')

  forEachCommentArea(area => {
    addNavButton(area.element)
  })

  const addExportButton = (comment: CommentItem) => {
    if (!comment.pictures?.length) {
      return
    }
    addMenuItem(comment, {
      className: 'image-export',
      text: '导出图片',
      action: () => {
        const data = {
          commentId: comment.id,
          userName: comment.userName,
          userId: comment.userId,
          content: comment.content,
          time: comment.time,
          pictures: comment.pictures.map(url => url.replace(/^http:/, 'https:')),
        }
        downloadSingleComment(data)
      },
    })
  }

  const { forEachCommentItem } = await import('@/components/utils/comment-apis')
  forEachCommentItem({
    added: addExportButton,
  })
}

export const component = defineComponentMetadata({
  name: 'commentImageExport',
  displayName: '评论图片导出',
  author: {
    name: 'kaixinol',
    link: 'https://github.com/kaixinol',
  },
  entry,
  tags: [componentsTags.utils],
})
