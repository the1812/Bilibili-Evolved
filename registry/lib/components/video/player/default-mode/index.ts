import { ComponentMetadata, ComponentEntry } from '@/components/types'
import { playerAgent } from '@/components/video/player-agent'
import { sq } from '@/core/spin-query'
import { isEmbeddedPlayer, playerReady } from '@/core/utils'
import { allVideoUrls } from '@/core/utils/urls'

enum PlayerModes {
  Normal = '常规',
  Wide = '宽屏',
  WebFull = '网页全屏',
  Full = '全屏',
}

function switchToWide(disableRelocation: boolean) {
  if (disableRelocation) {
    // B 站宽屏函数内部会调用 windows.scrollTo() 来进行重定位。要禁止重定位行为就需要抑制该函数
    // 原理：通过 height 和 overflow 两个属性，让 body 正好填满视口而不溢出。
    // （理论上 overflow 只要不是 visible 就可行，但未测试）
    // 此时，再对 window 滚动是没有意义的，因此 window.scrollTo 函数失效，重定位也失效。
    // 而 body 高度被限制后，其顶部内容也会回到视口的顶部，看起来就像内容滚回了头部；
    // 因此，为了不跳回顶部，必须提前记录滚动位置，并在每次样式改变时恢复滚动数据。
    const curScroll = window.scrollY

    const newStyle = { height: '100vh', overflow: 'scroll' }
    const orgStyle = lodash.pick(document.body.style, Object.keys(newStyle))

    lodash.assign(document.body.style, newStyle)
    document.body.scrollTo(0, curScroll)

    playerAgent.widescreen()

    lodash.assign(document.body.style, orgStyle)
    scrollTo(0, curScroll)
  } else {
    playerAgent.widescreen()
  }
}

async function switchToFull() {
  const video = await sq(
    () => dq(playerAgent.query.video.element.selector),
    (it: HTMLVideoElement) => it !== null && it.readyState === 4
          && document.readyState === 'complete' && document.hasFocus(),
  )
  if (video === null) {
    console.warn('[默认播放器模式] 未能应用全屏模式, 等待超时.')
    return
  }
  playerAgent.fullscreen()
}

const entry: ComponentEntry = async ({ settings: { options } }) => {
  if (isEmbeddedPlayer()) {
    return
  }
  await playerReady()
  const video = await playerAgent.query.video.element() as HTMLVideoElement
  if (!video) {
    return
  }
  const actions = new Map([
    [PlayerModes.Normal, none],
    [PlayerModes.Wide, () => switchToWide(options.disableRelocation)],
    [PlayerModes.WebFull, () => playerAgent.webFullscreen()],
    [PlayerModes.Full, switchToFull],
  ])
  const action = actions.get(options.mode)
  // https://github.com/the1812/Bilibili-Evolved/issues/2408
  // 也许以前切P是会刷新页面，但现在(2.7+)的播放器切P是不刷新页面的，所以不需要判断
  // const onplay = () => {
  //   const isNormalMode = !dq('body[class*=player-mode-]')
  //   if (isNormalMode) {
  //     action()
  //   }
  // }
  if (options.applyOnPlay && !playerAgent.isAutoPlay()) {
    video.addEventListener('play', action, { once: true })
  } else {
    action()
  }
}

export const component: ComponentMetadata = {
  name: 'defaultPlayerMode',
  displayName: '默认播放器模式',
  entry,
  tags: [componentsTags.video],
  description: {
    'zh-CN': '控制是否使用默认播放器模式, 可以为`常规`, `宽屏`, `网页全屏`或`全屏`. 注意: 切换宽屏模式默认会进行重定位, 当与其他影响定位的功能一同使用时(如 "播放器定位"), 需要禁止该行为.',
    'en-US': 'Set the default player mode. Could be `Normal`, `Widescreen`, `Web fullscreen` or `Fullscreen`.',
    'ja-JP': 'デフォルト・プレーヤー・モードが使用するかどうかを制御する、 例えば`常规`、`宽屏`、 `网页全屏`か`全屏`.',
  },
  options: {
    mode: {
      defaultValue: PlayerModes.Normal,
      displayName: '模式选择',
      dropdownEnum: PlayerModes,
    },
    disableRelocation: {
      defaultValue: false,
      displayName: '切换宽屏时禁止重定位',
    },
    applyOnPlay: {
      defaultValue: false,
      displayName: '播放时应用',
    },
  },
  urlInclude: allVideoUrls,
}
