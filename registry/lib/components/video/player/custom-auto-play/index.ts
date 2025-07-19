import { defineComponentMetadata } from '@/components/define'
import { ComponentEntry } from '@/components/types'
import { bangumiUrls, videoUrls } from '@/core/utils/urls'
import { useScopedConsole } from '@/core/utils/log'

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

const entry: ComponentEntry = () => {
  // #region 检测自动连播类型

  function isBangumi(): boolean {
    // TODO
    return false
  }

  function isRecommend(): boolean {
    // TODO
    return false
  }

  function isWatchLater(): boolean {
    // TODO
    return false
  }

  function isPlaylist(): boolean {
    // TODO
    return false
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

  function setupAutoPlay_Bangumi(shouldAutoplay: boolean) {
    // TODO
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
  function setupAutoPlay(autoplayType: AutoplayType, shouldAutoplay: boolean) {
    switch (autoplayType) {
      case AutoplayType.BANGUMI:
        setupAutoPlay_Bangumi(shouldAutoplay)
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
  function initScript() {
    logger.log(`导航变化（${document.URL}），重新初始化脚本`)

    // 检测自动连播类型
    const autoPlayType = getAutoplayType()
    // 检测是否应该自动连播
    const shouldAutoplay = checkShouldAutoplay(autoPlayType)
    // 设置自动连播状态
    setupAutoPlay(autoPlayType, shouldAutoplay)
  }

  // 监听pushState和replaceState事件
  const originPushState = history.pushState
  const originReplaceState = history.replaceState
  history.pushState = (...args: unknown[]) => {
    originPushState.apply(history, args)
    initScript()
  }
  history.replaceState = (...args: unknown[]) => {
    originReplaceState.apply(history, args)
    initScript()
  }

  // 初始执行代码
  initScript()
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
