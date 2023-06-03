import { defineComponentMetadata } from '@/components/define'
import { createPlayerModeChangeEvent } from '@/components/video/player-adaptor'
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
 * 处理屏幕尺寸变化
 * 实时获取到`#danmukuBox`的`marginTop`值
 * 修改自B站内联的JS代码，请确保此函数在播放器宽屏模式下被调用
 */
function calcMarginTop() {
  const e = window.innerHeight
  const t = Math.max((document.body && document.body.clientWidth) || window.innerWidth, 1100)
  const n = innerWidth > 1680 ? 411 : 350
  const o = parseInt(String((16 * (e - (window.innerWidth > 1690 ? 318 : 308))) / 9))
  const r = t - 112 - n
  const d = r < o ? r : o
  const a = Math.round((d + n) * (9 / 16)) + (innerWidth > 1680 ? 56 : 46)

  return `${a}px`
}

/**
 * 统一添加副作用处理
 * 处理播放器宽屏切换后的UP信息与弹幕列表样式
 */
function sideEffect() {
  const author = document.querySelector('.up-panel-container') as HTMLDivElement
  const danmuku = document.querySelector('#danmukuBox') as HTMLDivElement

  // 缓存当前播放器模式 用于判断是否为宽屏模式
  let currentMode = 'normal'

  // 监听播放器宽屏模式 调整UP信息与弹幕列表样式
  window.addEventListener(
    'playerModeChange',
    (ev: ReturnType<typeof createPlayerModeChangeEvent>) => {
      const { mode } = ev.detail

      currentMode = mode

      if (mode === 'wide') {
        danmuku.style.marginTop = '0px'
        author.style.marginTop = calcMarginTop()
      } else {
        // 恢复原始样式
        author.style.marginTop = '0px'
      }
    },
  )

  // 监听屏幕尺寸变化
  window.addEventListener('resize', () => {
    // 播放器宽屏模式
    if (currentMode === 'wide') {
      author.style.marginTop = calcMarginTop()
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
  const player = document.querySelector('#playerWrap') as HTMLDivElement
  // 将标题放到播放器和点赞中间位置
  moveElementAfter(title, player)
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
    {
      name: 'LockRim',
      link: 'https://github.com/LockRim',
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
