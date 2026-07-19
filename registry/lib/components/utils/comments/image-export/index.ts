import Vue from 'vue'
import { defineComponentMetadata } from '@/components/define'
import { CommentItem } from '@/components/utils/comment-apis'
import { addCommentImage, panelVisible, getCommentImageData } from './store'
import { downloadSingleComment } from './download'
import { select } from '@/core/spin-query'
import Panel from './Panel.vue'

let panelMounted = false

const mountPanel = () => {
  if (panelMounted) {
    return
  }
  const PanelClass = Vue.extend(Panel)
  const instance = new PanelClass()
  instance.$mount()
  document.body.appendChild(instance.$el)
  panelMounted = true
}

const showPanel = () => {
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
      newButton.addEventListener('click', showPanel)
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
  button.addEventListener('click', showPanel)

  const navContainer = commentAreaElement.querySelector('.bili-tabs__nav__items')
  if (navContainer) {
    navContainer.appendChild(button)
  } else {
    commentAreaElement.insertBefore(button, commentAreaElement.firstChild)
  }
}

const entry = async () => {
  const { forEachCommentItem, forEachCommentArea, addMenuItem } = await import(
    '@/components/utils/comment-apis'
  )

  forEachCommentArea(area => {
    addNavButton(area.element)
  })

  const addExportButton = (comment: CommentItem) => {
    addCommentImage(comment)

    if (!comment.pictures?.length) {
      return
    }
    addMenuItem(comment, {
      className: 'image-export',
      text: '导出图片',
      action: () => {
        const data = getCommentImageData(comment.id)
        if (data) {
          downloadSingleComment(data)
        }
      },
    })
  }

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
