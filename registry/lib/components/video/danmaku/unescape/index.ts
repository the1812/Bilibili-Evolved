import { defineComponentMetadata } from '@/components/define'
import { forEachVideoDanmaku } from '@/components/video/video-danmaku'

export const component = defineComponentMetadata({
  name: 'unescapeDanmaku',
  displayName: '弹幕转义',
  tags: [componentsTags.video],
  entry: () => {
    const newLineRegex = /\\n/g
    forEachVideoDanmaku({
      added: danmaku => {
        if (newLineRegex.test(danmaku.text)) {
          const newText = danmaku.text.replace(newLineRegex, '\n')
          danmaku.element.textContent = newText
        }
      },
    })
  },
})
