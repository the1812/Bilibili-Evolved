import { defineComponentMetadata } from '@/components/define'
import { playerModeChange } from '@/components/video/player-adaptor'
import { getComponentSettings, addComponentListener } from '@/core/settings'
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
 * 统一添加副作用处理
 * 处理播放器宽屏切换后的UP信息与弹幕列表样式
 */
function sideEffect() {
  const author = document.querySelector('.up-panel-container') as HTMLDivElement
  const danmuku = document.querySelector('#danmukuBox') as HTMLDivElement

  // 弹幕列表的 marginTop 是动态的 需要即时获取
  let marginTop = '' // 记录弹幕列表原始marginTop
  const updateMarginTop = lodash.once(() => {
    marginTop = getComputedStyle(danmuku).marginTop
  })

  // 监听播放器宽屏模式 调整UP信息与弹幕列表样式
  window.addEventListener('playerModeChange', (ev: ReturnType<typeof playerModeChange>) => {
    const { mode } = ev.detail

    if (mode === 'wide') {
      updateMarginTop()
      danmuku.style.marginTop = '0px'
      author.style.marginTop = marginTop
    } else {
      // 恢复原始样式
      author.style.marginTop = '0px'
    }
  })
}

/**
 * 播放器置顶
 * 从设置中获取顶部留白的高度
 */
async function playerOnTop({ settings: { options: opt }, metadata }) {
  await playerReady()
  const title = document.querySelector('#viewbox_report')
  const toolbar = document.querySelector('#arc_toolbar_report')
  moveElementAfter(title, toolbar)

  const player = document.querySelector('#playerWrap') as HTMLDivElement
  player.style.marginTop = `${opt.marginTop}px`

  // 监听设置变化 实时更新到页面
  addComponentListener(`${metadata.name}.marginTop`, (value: number) => {
    player.style.marginTop = `${value}px`
  })

  sideEffect()
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
  reload: () =>
    playerOnTop({ settings: getComponentSettings('playerOnTopNew'), metadata: component }),
})
