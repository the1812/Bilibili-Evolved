import { defineComponentMetadata } from '@/components/define'
import { createPlayerModeChangeEvent } from '@/components/video/player-adaptor'
import { addComponentListener } from '@/core/settings'
import { playerReady, getNumberValidator } from '@/core/utils'
import { videoUrls } from '@/core/utils/urls'

/**
 * 统一添加副作用处理
 * 处理播放器宽屏切换后的UP信息与弹幕列表样式
 */
function watchPlayerMode(player: HTMLDivElement) {
  const author = dq('.up-panel-container') as HTMLDivElement
  const danmuku = dq('#danmukuBox') as HTMLDivElement

  // 缓存当前播放器模式 用于判断是否为宽屏模式
  let currentMode = 'normal'

  const updateUpPanelMargin = () => {
    // 先还原再测量, 避免叠加偏移
    author.style.marginTop = '0px'
    if (currentMode !== 'wide') {
      return
    }
    // 宽屏时播放器会盖住右侧栏
    const offset = player.getBoundingClientRect().bottom - author.getBoundingClientRect().top
    author.style.marginTop = `${Math.max(0, offset)}px`
  }

  // 监听播放器宽屏模式 调整UP信息与弹幕列表样式
  window.addEventListener(
    'playerModeChange',
    (ev: ReturnType<typeof createPlayerModeChangeEvent>) => {
      const { mode } = ev.detail

      // 迷你播放器不影响布局, 保持原状态
      if (mode === 'mini') {
        return
      }

      currentMode = mode
      if (mode === 'wide') {
        danmuku.style.marginTop = '0px'
      }
      // 等播放器尺寸生效后再测量
      window.requestAnimationFrame(updateUpPanelMargin)
    },
  )

  // 监听屏幕尺寸变化
  window.addEventListener('resize', updateUpPanelMargin)
}

/**
 * 播放器置顶
 * 从设置中获取顶部留白的高度
 */
async function playerOnTop({ settings: { options: opt }, metadata }) {
  await playerReady()
  const player = dq('#playerWrap') as HTMLDivElement
  // 将标题放到播放器和点赞中间位置
  const title = dq('.video-info-container')
  title?.parentElement.insertBefore(title, player.nextSibling)
  player.style.marginTop = `${opt.marginTop}px`

  // 监听设置变化 实时更新到页面
  addComponentListener(`${metadata.name}.marginTop`, (value: number) => {
    player.style.marginTop = `${value}px`
  })

  watchPlayerMode(player)
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
  instantStyles: [
    {
      name: 'playerOnTopNew',
      style: () => import('./player-on-top-new.scss'),
    },
  ],
  entry: playerOnTop,
})
