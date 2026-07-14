import { CommentItem } from '@/components/utils/comment-apis'
import { getBlob } from '@/core/ajax'
import { DownloadPackage } from '@/core/download'
import { Toast } from '@/core/toast'
import { CommentImageData } from './types'
import style from './panel.scss'

const commentImageStore = new Map<string, CommentImageData>()
let panelElement: HTMLDivElement | null = null
let styleInjected = false

const getExtensionFromUrl = (url: string): string => {
  const cleanUrl = url.replace(/^http:/, 'https:').split('?')[0]
  const match = cleanUrl.match(/\.([a-zA-Z0-9]+)$/)
  return match ? `.${match[1]}` : '.jpg'
}

const formatTimestamp = (timestamp?: number): string => {
  if (!timestamp) {
    return ''
  }
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`
}

const injectStyle = () => {
  if (styleInjected) {
    return
  }
  const el = document.createElement('style')
  el.textContent = style
  document.head.appendChild(el)
  styleInjected = true
}

const downloadImages = async (pictures: string[], fileName: string) => {
  const toast = Toast.info('获取图片中...', '评论图片下载')
  const blobs = await Promise.all(
    pictures.map(async (url, index) => {
      const blob = await getBlob(url)
      toast.message = `下载中... (${index + 1}/${pictures.length})`
      return blob
    }),
  )
  const pack = new DownloadPackage()
  blobs.forEach((blob, index) => {
    pack.add(`${fileName} - ${index + 1}${getExtensionFromUrl(pictures[index])}`, blob)
  })
  toast.close()
  await pack.emit(`${fileName}.zip`)
}

const downloadSingleComment = (data: CommentImageData) => {
  const fileName = `${data.userName} - ${data.userId} - ${data.commentId}`
  downloadImages(data.pictures, fileName)
}

const downloadAllComments = () => {
  const allPictures: string[] = []
  commentImageStore.forEach(data => {
    data.pictures.forEach(url => {
      allPictures.push(url)
    })
  })
  if (allPictures.length === 0) {
    return
  }
  downloadImages(allPictures, '评论图片')
}

const renderPanel = () => {
  if (!panelElement) {
    return
  }

  const content = panelElement.querySelector<HTMLDivElement>('.cie-content')
  const stats = panelElement.querySelector<HTMLDivElement>('.cie-stats')
  const downloadAllBtn = panelElement.querySelector<HTMLButtonElement>('.cie-download-all')

  if (!content || !stats || !downloadAllBtn) {
    return
  }

  const items = Array.from(commentImageStore.values())

  stats.textContent = `共找到 ${items.length} 条包含图片的评论`
  downloadAllBtn.disabled = items.length === 0

  content.innerHTML = ''

  if (items.length === 0) {
    content.innerHTML =
      '<p style="color: var(--cie-muted); text-align: center; padding: 20px;">暂无包含图片的评论</p>'
    return
  }

  const fragment = document.createDocumentFragment()
  for (const item of items) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'cie-item'

    const truncatedMessage =
      item.content.length > 10 ? `${item.content.substring(0, 10)}...` : item.content

    button.innerHTML = `
      <div class="cie-item-content">
        <div class="cie-item-info">
          <span class="cie-item-username">${item.userName}</span>
          <span class="cie-item-message" title="${item.content}">${truncatedMessage}</span>
          <span class="cie-item-time">${formatTimestamp(item.time)}</span>
        </div>
        <span class="cie-item-count">[${item.pictures.length}张]</span>
      </div>
    `

    button.addEventListener('click', () => downloadSingleComment(item))
    fragment.appendChild(button)
  }
  content.appendChild(fragment)
}

const addCommentImage = (item: CommentItem) => {
  if (!item.pictures?.length) {
    return
  }
  commentImageStore.set(item.id, {
    commentId: item.id,
    userName: item.userName,
    userId: item.userId,
    content: item.content,
    time: item.time,
    pictures: item.pictures.map(url => url.replace(/^http:/, 'https:')),
  })
  if (panelElement && !panelElement.hidden) {
    renderPanel()
  }
}

const setupDraggable = (panel: HTMLDivElement) => {
  const header = panel.querySelector<HTMLElement>('.cie-header')
  if (!header) {
    return
  }

  let offsetX = 0
  let offsetY = 0

  header.addEventListener('pointerdown', e => {
    if (e.button !== 0) {
      return
    }
    if ((e.target as HTMLElement).closest('.cie-header-actions')) {
      return
    }

    const rect = panel.getBoundingClientRect()
    offsetX = e.clientX - rect.left
    offsetY = e.clientY - rect.top

    panel.style.left = `${rect.left}px`
    panel.style.top = `${rect.top}px`
    panel.style.right = 'auto'

    header.setPointerCapture(e.pointerId)
    e.preventDefault()
  })

  header.addEventListener('pointermove', e => {
    if (!header.hasPointerCapture(e.pointerId)) {
      return
    }

    const rect = panel.getBoundingClientRect()
    const maxLeft = Math.max(0, window.innerWidth - rect.width)
    const maxTop = Math.max(0, window.innerHeight - rect.height)
    const nextLeft = Math.min(Math.max(e.clientX - offsetX, 0), maxLeft)
    const nextTop = Math.min(Math.max(e.clientY - offsetY, 0), maxTop)

    panel.style.left = `${nextLeft}px`
    panel.style.top = `${nextTop}px`
  })

  header.addEventListener('pointerup', e => {
    if (header.hasPointerCapture(e.pointerId)) {
      header.releasePointerCapture(e.pointerId)
    }
  })

  header.addEventListener('pointercancel', e => {
    if (header.hasPointerCapture(e.pointerId)) {
      header.releasePointerCapture(e.pointerId)
    }
  })
}

const createPanel = (): HTMLDivElement => {
  injectStyle()

  const existing = document.querySelector<HTMLDivElement>('.comment-image-export-menu')
  if (existing) {
    return existing
  }

  const panel = document.createElement('div')
  panel.className = 'comment-image-export-menu'
  panel.hidden = true

  panel.innerHTML = `
    <div class="cie-header">
      <h3>评论图片下载</h3>
      <div class="cie-header-actions">
        <button type="button" class="cie-icon-button cie-close-button" title="关闭">×</button>
      </div>
    </div>
    <div class="cie-stats">共找到 0 条包含图片的评论</div>
    <button type="button" class="cie-download-all" disabled>全部下载</button>
    <div class="cie-content"></div>
  `

  const closeButton = panel.querySelector<HTMLButtonElement>('.cie-close-button')
  closeButton?.addEventListener('click', () => {
    panel.hidden = true
  })

  const downloadAllBtn = panel.querySelector<HTMLButtonElement>('.cie-download-all')
  downloadAllBtn?.addEventListener('click', downloadAllComments)

  setupDraggable(panel)
  document.body.appendChild(panel)

  return panel
}

const showPanel = () => {
  injectStyle()
  panelElement = createPanel()
  panelElement.hidden = false
  renderPanel()
}

export const addNavButton = (commentAreaElement: HTMLElement) => {
  // Video pages: bili-comments web component with shadow DOM
  if (commentAreaElement.tagName.toLowerCase() === 'bili-comments') {
    const headerRenderer = commentAreaElement.shadowRoot?.querySelector(
      'bili-comments-header-renderer',
    )?.shadowRoot
    if (!headerRenderer) {
      // Shadow DOM not ready yet, retry later
      setTimeout(() => addNavButton(commentAreaElement), 2000)
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

  // Other pages: regular DOM
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

export { addCommentImage, commentImageStore, downloadSingleComment }
