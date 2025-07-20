import { defineComponentMetadata } from '@/components/define'
import { ComponentEntry } from '@/components/types'
import { bangumiUrls, videoUrls, watchlaterUrls } from '@/core/utils/urls'
import { useScopedConsole } from '@/core/utils/log'
import { select } from '@/core/spin-query'
import { matchUrlPattern } from '@/core/utils'

const logger = useScopedConsole('customAutoPlay')

/** 自动连播类型 */
enum AutoplayType {
  /** 未知 */
  UNKNOWN,
  /** 番剧 */
  BANGUMI,
  /** 推荐视频 */
  RECOMMEND,
  /** 稍后再看 */
  WATCHLATER,
  /** 分P视频 */
  PLAYLIST,
}

/** 自动连播行为类型 */
enum AutoplayActionType {
  /** 自动判断，参考《传统连播模式》组件 */
  AUTO = '自动',
  /** 禁用自动连播 */
  DISABLE = '禁用',
  /** 总是自动连播 */
  ALWAYS = '总是',
}

const entry: ComponentEntry = async () => {
  // #region 检测自动连播类型

  /** 视频页地址 */
  const videoUrl = '//www.bilibili.com/video/'

  /** 当前连播视频是否为番剧 */
  function isBangumi(): boolean {
    return bangumiUrls.some(url => matchUrlPattern(url))
  }

  /** 推荐视频自动连播状态是否开启，找不到相关信息则返回null */
  function isAutoPlayOn_Recommend(): boolean | null {
    const btn = document.querySelector('.recommend-list-v1 .switch-btn')
    if (btn) {
      return btn.classList.contains('on')
    }
    return null
  }

  /** 当前连播视频是否为推荐视频 */
  function isRecommend(): boolean {
    return matchUrlPattern(videoUrl) && isAutoPlayOn_Recommend() !== null
  }

  /** 当前连播视频是否为稍后再看 */
  function isWatchLater(): boolean {
    return watchlaterUrls.some(url => matchUrlPattern(url))
  }

  /** 分P视频自动连播状态是否开启，找不到相关信息则返回null */
  function isAutoPlayOn_Playlist(): boolean | null {
    const btn = document.querySelector('.video-pod .auto-play .switch-btn')
    if (btn) {
      return btn.classList.contains('on')
    }
    return null
  }

  /** 当前连播视频是否为分P视频 */
  function isPlaylist(): boolean {
    return matchUrlPattern(videoUrl) && isAutoPlayOn_Playlist() !== null
  }

  /** 获取自动连播类型 */
  function getAutoplayType(): AutoplayType {
    if (isBangumi()) {
      return AutoplayType.BANGUMI
    }

    if (isRecommend()) {
      return AutoplayType.RECOMMEND
    }

    if (isWatchLater()) {
      return AutoplayType.WATCHLATER
    }

    if (isPlaylist()) {
      return AutoplayType.PLAYLIST
    }

    return AutoplayType.UNKNOWN
  }

  // #endregion

  // #region 检测是否应该自动连播

  function checkShouldAutoplay_Bangumi(): boolean {
    // TODO
    return false
  }

  function checkShouldAutoplay_Recommend(): boolean {
    // TODO
    return false
  }

  function checkShouldAutoplay_WatchLater(): boolean {
    // TODO
    return false
  }

  function checkShouldAutoplay_Playlist(): boolean {
    // TODO
    return false
  }

  /** 是否应该自动连播 */
  function checkShouldAutoplay(autoplayType: AutoplayType): boolean {
    switch (autoplayType) {
      case AutoplayType.BANGUMI:
        return checkShouldAutoplay_Bangumi()
      case AutoplayType.RECOMMEND:
        return checkShouldAutoplay_Recommend()
      case AutoplayType.WATCHLATER:
        return checkShouldAutoplay_WatchLater()
      case AutoplayType.PLAYLIST:
        return checkShouldAutoplay_Playlist()
      default:
        return false
    }
  }

  // #endregion

  // #region 设置自动连播状态

  async function setupAutoPlay_Bangumi(shouldAutoplay: boolean) {
    const selector = shouldAutoplay
      ? '.bpx-player-ctrl-setting-handoff input[type="radio"][value="0"]'
      : '.bpx-player-ctrl-setting-handoff input[type="radio"][value="2"]'
    const radio = (await select(selector)) as HTMLInputElement

    if (radio === null) {
      logger.error(`${Function.name}：未找到对应的自动播放开关`)
      return
    }
    radio.click()
  }

  function setupAutoPlay_Recommend(shouldAutoplay: boolean) {
    // TODO
  }

  function setupAutoPlay_WatchLater(shouldAutoplay: boolean) {
    // TODO
  }

  function setupAutoPlay_Playlist(shouldAutoplay: boolean) {
    // TODO
  }

  /** 设置自动连播状态 */
  async function setupAutoPlay(autoplayType: AutoplayType, shouldAutoplay: boolean) {
    switch (autoplayType) {
      case AutoplayType.BANGUMI:
        await setupAutoPlay_Bangumi(shouldAutoplay)
        break
      case AutoplayType.RECOMMEND:
        setupAutoPlay_Recommend(shouldAutoplay)
        break
      case AutoplayType.WATCHLATER:
        setupAutoPlay_WatchLater(shouldAutoplay)
        break
      case AutoplayType.PLAYLIST:
        setupAutoPlay_Playlist(shouldAutoplay)
        break
      default:
        break
    }
  }

  // #endregion

  /** 每次视频切换时的初始化逻辑 */
  async function initScript() {
    logger.log(`导航变化（${document.URL}），重新初始化脚本`)

    // 检测自动连播类型
    const autoPlayType = getAutoplayType()
    // 检测是否应该自动连播
    const shouldAutoplay = checkShouldAutoplay(autoPlayType)
    // 设置自动连播状态
    await setupAutoPlay(autoPlayType, shouldAutoplay)
  }

  // 监听pushState和replaceState事件
  const originPushState = history.pushState
  const originReplaceState = history.replaceState
  history.pushState = async (...args: unknown[]) => {
    originPushState.apply(history, args)
    await initScript()
  }
  history.replaceState = async (...args: unknown[]) => {
    originReplaceState.apply(history, args)
    await initScript()
  }

  // 初始执行代码
  await initScript()
}

export const component = defineComponentMetadata({
  name: 'customAutoPlay',
  displayName: '定制自动连播行为',
  tags: [componentsTags.video],
  urlInclude: [...videoUrls, ...bangumiUrls],
  entry,
  options: {
    bangumiAutoplayAction: {
      displayName: '自动连播行为-番剧',
      defaultValue: AutoplayActionType.AUTO,
      dropdownEnum: AutoplayActionType,
    },
    recommendAutoplayAction: {
      displayName: '自动连播行为-推荐视频',
      defaultValue: AutoplayActionType.AUTO,
      dropdownEnum: AutoplayActionType,
    },
    watchlaterAutoplayAction: {
      displayName: '自动连播行为-稍后再看',
      defaultValue: AutoplayActionType.AUTO,
      dropdownEnum: AutoplayActionType,
    },
    playlistAutoplayAction: {
      displayName: '自动连播行为-分p视频',
      defaultValue: AutoplayActionType.AUTO,
      dropdownEnum: AutoplayActionType,
    },
  },
})
