import { defineComponentMetadata } from '@/components/define'
import { useScopedConsole } from '@/core/utils/log'
import { videoUrls } from '@/core/utils/urls'

const console = useScopedConsole('activeVideoLinks')
let observer: MutationObserver | null = null
const webRegex = /(?<!(\>|'|"|\/))(http:\/\/|https:\/\/|www\.)[^(\s,;())]+/g

const processAcgLinks = () => {
  const links = document.querySelectorAll('a[href*="acg.tv"][href*="sm"]')
  links.forEach(link => {
    const originalHref = link.getAttribute('href')
    if (originalHref) {
      const newHref = originalHref.replace('acg.tv', 'nicovideo.jp/watch')
      link.setAttribute('href', newHref)
      console.log(`Niconico Fix: ${originalHref} → ${newHref}`)
    }
  })
}

const isTextInsideLink = (html: string, position: number): boolean => {
  const beforeText = html.substring(0, position)
  const lastOpenTag = beforeText.lastIndexOf('<a ')
  if (lastOpenTag === -1) {
    return false
  }

  const lastCloseTag = beforeText.lastIndexOf('</a>')
  return lastOpenTag > lastCloseTag
}

const processDescLinks = () => {
  const descContainer = document.querySelector('.desc-info-text')
  if (!descContainer) {
    return
  }

  const content = descContainer.innerHTML
  let newContent = content

  const matches = [...content.matchAll(webRegex)]
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i]
    const matchText = match[0]
    const startIndex = match.index ?? 0

    if (isTextInsideLink(content, startIndex)) {
      continue
    }

    const link = matchText.includes('http') ? matchText : `http://${matchText}`
    const replacement = `<a href='${link}' target='_blank'>${matchText}</a>`

    newContent =
      newContent.substring(0, startIndex) +
      replacement +
      newContent.substring(startIndex + matchText.length)
  }

  if (newContent !== content) {
    descContainer.innerHTML = newContent
  }
}

const processLinks = () => {
  try {
    processAcgLinks()
    processDescLinks()
  } catch (error) {
    console.error('处理链接时遇到 Error:', error)
  }
}

const setupObservers = () => {
  if (observer) {
    observer.disconnect()
  }

  observer = new MutationObserver(processLinks)

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  })

  console.log('已设置 Observer')
}

const entry = () => {
  console.log('视频链接增强已启用')
  processLinks()
  setupObservers()
}

export const component = defineComponentMetadata({
  name: 'activeVideoLinks',
  displayName: '视频链接增强',
  description: {
    'zh-CN': '将视频简介中的普通网址转换为可点击的链接，同时修复 acg.tv 链接',
  },
  tags: [componentsTags.utils],
  entry,
  reload: entry,
  unload: () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  },
  urlInclude: videoUrls,
  author: {
    name: 'Alan Ye',
    link: 'https://github.com/at-wr',
  },
})
