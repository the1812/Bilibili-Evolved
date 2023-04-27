import { defineComponentMetadata } from '@/components/define'
import { getComponentSettings } from '@/core/settings'
import { playerReady, getNumberValidator } from '@/core/utils'
import { videoUrls } from '@/core/utils/urls'

/**
 * 将 element 移动到 after 后面
 * @param element 要移动的元素
 * @param after 目标元素
 */
function moveElementAfter(element: Element, after: Element) {
  const parent = element.parentElement
  if (!parent) {
    return
  }
  parent.removeChild(element)
  parent.insertBefore(element, after.nextSibling)
}

/**
 * 播放器置顶
 * 从设置中获取顶部留白的高度
 */
const playerOnTop = async ({ settings: { options: opt } }) => {
  await playerReady()
  const title = document.querySelector('#viewbox_report')
  const toolbar = document.querySelector('#arc_toolbar_report')
  moveElementAfter(title, toolbar)

  const author = document.querySelector('#v_upinfo').parentElement
  const danmuku = document.querySelector('#danmukuBox')
  moveElementAfter(author, danmuku)

  const player = document.querySelector('#playerWrap') as HTMLDivElement
  player.style.marginTop = `${opt.marginTop}px`
}

export const component = defineComponentMetadata({
  name: 'playerOnTopNew',
  author: [
    {
      name: 'RieN7',
      link: 'https://github.com/rien7',
    },
    {
      name: 'ZiuChen',
      link: 'https://github.com/ZiuChen',
    },
  ],
  tags: [componentsTags.style, componentsTags.video],
  options: {
    marginTop: {
      displayName: '顶部留白 (px)',
      defaultValue: 20,
      validator: getNumberValidator(0, Infinity),
    },
  },
  urlInclude: videoUrls,
  displayName: '播放器置顶（新）',
  description:
    '原来的播放器置顶插件，现在已经不可用了，这是一个新的版本，可以在视频页面中将播放器放在页面最上方.',
  entry: playerOnTop,
  reload: () => playerOnTop({ settings: getComponentSettings('playerOnTopNew') }),
})
