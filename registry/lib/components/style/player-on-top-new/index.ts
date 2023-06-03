import { defineComponentMetadata } from '@/components/define'
import { playerReady } from '@/core/utils'

function moveElementAfter(element: Element, after: Element) {
  const parent = element.parentElement
  if (!parent) {
    return
  }
  parent.removeChild(element)
  parent.insertBefore(element, after.nextSibling)
}

const playerOnTop = async () => {
  await playerReady()
  const title = document.querySelector('#viewbox_report')
  const toolbar = document.querySelector('#arc_toolbar_report')
  moveElementAfter(title, toolbar)

  const author = document.querySelector('#v_upinfo').parentElement
  const danmuku = document.querySelector('#danmukuBox')
  moveElementAfter(author, danmuku)
}

export const component = defineComponentMetadata({
  name: 'playerOnTopNew',
  author: {
    name: 'RieN7',
    link: 'https://github.com/rien7',
  },
  tags: [componentsTags.style, componentsTags.video],
  displayName: '播放器置顶（新）',
  description:
    '原来的播放器置顶插件，现在已经不可用了，这是一个新的版本，可以在视频页面中将播放器放在页面最上方.',
  entry: playerOnTop,
  reload: playerOnTop,
})
