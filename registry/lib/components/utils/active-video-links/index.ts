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

const processDescLinks = () => {
  const descContainer = document.querySelector('.desc-info-text')
  if (!descContainer) {
    return
  }
  const walker = document.createTreeWalker(descContainer, NodeFilter.SHOW_TEXT, {
    acceptNode: node => {
      if (node.parentElement?.closest('a')) {
        return NodeFilter.FILTER_REJECT
      }
      return webRegex.test(node.textContent || '')
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT
    },
  })
  const textNodes: Text[] = []
  let currentNode: Node | null = walker.nextNode()
  while (currentNode !== null) {
    textNodes.push(currentNode as Text)
    currentNode = walker.nextNode()
  }
  textNodes.forEach(textNode => {
    const frag = document.createDocumentFragment()
    const text = textNode.textContent || ''
    let lastIndex = 0
    let match: RegExpExecArray | null
    webRegex.lastIndex = 0
    match = webRegex.exec(text)
    while (match !== null) {
      const start = match.index
      if (lastIndex < start) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex, start)))
      }
      const urlText = match[0]
      const linkHref = urlText.replace(/^https?:\/\//, '//').replace(/^www\./, '//')
      const a = document.createElement('a')
      a.href = linkHref
      a.target = '_blank'
      a.textContent = urlText
      frag.appendChild(a)
      lastIndex = start + urlText.length
      match = webRegex.exec(text)
    }
    if (lastIndex < text.length) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex)))
    }
    textNode.parentNode?.replaceChild(frag, textNode)
  })
}

const normalizeNicoDescLinks = () => {
  const descContainer = document.querySelector('.desc-info-text')
  if (!descContainer) {
    return
  }
  const anchors = Array.from(descContainer.querySelectorAll('a'))
  for (let i = 0; i < anchors.length - 1; i++) {
    const a1 = anchors[i]
    const a2 = anchors[i + 1]
    const href1 = a1.getAttribute('href') || ''
    const text2 = a2.textContent?.trim() || ''
    const href2 = a2.getAttribute('href') || ''
    // first link is base watch URL, second has sm ID text
    if (
      /^(https?:)?\/\/(www\.)?nicovideo\.jp\/watch\/?$/.test(href1) &&
      /^sm\d+$/.test(text2) &&
      href2.includes(`/watch/${text2}`)
    ) {
      const newHref = href2.replace(/^(https?:)?/, '//')
      const newA = document.createElement('a')
      newA.href = newHref
      newA.target = '_blank'
      newA.textContent = text2
      a1.replaceWith(newA)
      a2.remove()
      console.log(`Merged Nico link: ${text2}`)
      // skip the next element
      i++
    }
  }
}

const processLinks = () => {
  try {
    processAcgLinks()
    processDescLinks()
    normalizeNicoDescLinks()
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
