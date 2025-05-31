import { defineComponentMetadata } from '@/components/define'
import { forEachVideoDanmaku } from '@/components/video/video-danmaku'

export const component = defineComponentMetadata({
  name: 'unescapeDanmaku',
  displayName: '弹幕转义',
  tags: [componentsTags.video],
  options: {
    backSlash: {
      defaultValue: true,
      displayName: '对 \\n 转义',
    },
    forwardSlash: {
      defaultValue: true,
      displayName: '对 /n 转义',
    },
  },
  entry: ({ settings }) => {
    const newLineRegex = (() => {
      if (settings.options.backSlash && settings.options.forwardSlash) {
        return /\\n|\/n/g
      }
      if (settings.options.backSlash) {
        return /\\n/g
      }
      return /\/n/g
    })()
    const setText = (element: Element, text: string): void => {
      const children = [...element.children]
      if (children.length > 0) {
        children.forEach(child => setText(child, text))
      }
      const textNodes = [...element.childNodes].filter(it => it.nodeType === Node.TEXT_NODE)
      textNodes.forEach(node => (node.textContent = text))
    }
    forEachVideoDanmaku({
      added: danmaku => {
        if (newLineRegex.test(danmaku.text)) {
          const newText = danmaku.text.replace(newLineRegex, '\n')
          setText(danmaku.element, newText)
        }
      },
    })
  },
})
