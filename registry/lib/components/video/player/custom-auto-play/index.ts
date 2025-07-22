import { defineComponentMetadata } from '@/components/define'
import { ComponentEntry } from '@/components/types'
import { bangumiUrls, videoUrls, watchlaterUrls } from '@/core/utils/urls'
import { useScopedConsole } from '@/core/utils/log'
import { select, sq } from '@/core/spin-query'
import { matchUrlPattern, playerReady } from '@/core/utils'
import { getVueData } from '@/components/feeds/api'
import { addComponentListener } from '@/core/settings'
import { childListSubtree } from '@/core/observer'

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

const entry: ComponentEntry = async ({ metadata, settings }) => {
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

  /** 解析分P序号（例如：1/10 => [1,10]） */
  function parseSequentialNumbers() {
    const videoSequentialNumber = document.querySelector('.list-count, .video-pod__header .amt')
    return videoSequentialNumber.innerHTML
      .replace(/[（）]/g, '')
      .split('/')
      .map(it => parseInt(it))
  }

  /** 是否最后1P视频 */
  function isLastSequentialNumber(): boolean {
    const sequentialNumbers = parseSequentialNumbers()
    return sequentialNumbers[0] >= sequentialNumbers[1]
  }

  /**
   * 默认连播方式判断，自动连播行为类型为AUTO时使用回调处理
   * @param actionType 自动连播行为类型
   * @param autoTypeHandler 自动连播行为类型为AUTO时的处理回调
   * @returns 是否应该自动连播
   */
  function shouldAutoplayWithAutoHandler(
    actionType: AutoplayActionType,
    autoTypeHandler: () => boolean,
  ): boolean {
    switch (actionType) {
      case AutoplayActionType.ALWAYS:
        return true
      case AutoplayActionType.DISABLE:
        return false
      case AutoplayActionType.AUTO:
      default:
        return autoTypeHandler()
    }
  }

  /** 检测番剧是否应该自动连播 */
  function shouldAutoplay_Bangumi(): boolean {
    return shouldAutoplayWithAutoHandler(
      settings.options.bangumiAutoplayAction as AutoplayActionType,
      () => true,
    )
  }

  /** 检测推荐视频是否应该自动连播 */
  function shouldAutoplay_Recommend(): boolean {
    return shouldAutoplayWithAutoHandler(
      settings.options.recommendAutoplayAction as AutoplayActionType,
      () => false,
    )
  }

  /** 检测稍后再看是否应该自动连播 */
  function shouldAutoplay_WatchLater(): boolean {
    return shouldAutoplayWithAutoHandler(
      settings.options.watchLaterAutoplayAction as AutoplayActionType,
      () => !isLastSequentialNumber(),
    )
  }

  /** 检测分P视频是否应该自动连播 */
  function shouldAutoplay_Playlist(): boolean {
    return shouldAutoplayWithAutoHandler(
      settings.options.playlistAutoplayAction as AutoplayActionType,
      () => !isLastSequentialNumber(),
    )
  }

  /** 是否应该自动连播 */
  function shouldAutoplay(autoplayType: AutoplayType): boolean {
    switch (autoplayType) {
      case AutoplayType.BANGUMI:
        return shouldAutoplay_Bangumi()
      case AutoplayType.RECOMMEND:
        return shouldAutoplay_Recommend()
      case AutoplayType.WATCHLATER:
        return shouldAutoplay_WatchLater()
      case AutoplayType.PLAYLIST:
        return shouldAutoplay_Playlist()
      default:
        return false
    }
  }

  // #endregion

  // #region 设置自动连播状态

  // #region 按类型

  /** 设置播放器自动连播状态（位于播放器设置 - 更多播放设置 - 播放方式） */
  async function setupAutoPlay_Player(enableAutoplay: boolean, logPrefix: string) {
    const selector = enableAutoplay
      ? '.bpx-player-ctrl-setting-handoff input[type="radio"][value="0"]'
      : '.bpx-player-ctrl-setting-handoff input[type="radio"][value="2"]'
    const radio = (await select(selector)) as HTMLInputElement

    if (radio === null) {
      logger.error(`${logPrefix}：未找到对应的播放方式按钮`)
    }
    radio.click()
  }

  /** 设置自动连播按钮状态（位于右上角） */
  async function setupAutoPlay_SwitchBtn(enableAutoplay: boolean, logPrefix: string) {
    sq(() => {
      try {
        const app = document.getElementById('app')
        const vueInstance = getVueData(app)
        vueInstance.setContinuousPlay(enableAutoplay)
        return true
      } catch (e) {
        logger.debug(`${logPrefix}：设置自动连播按钮状态发生错误，错误信息：${e}`)
        return false
      }
    })
  }

  // #endregion

  // #region 按选项

  /** 设置番剧自动连播状态 */
  async function setupAutoPlay_Bangumi(enableAutoplay: boolean) {
    await setupAutoPlay_Player(enableAutoplay, setupAutoPlay_Bangumi.name)
  }

  /** 设置推荐视频自动连播状态 */
  async function setupAutoPlay_Recommend(enableAutoplay: boolean) {
    await setupAutoPlay_SwitchBtn(enableAutoplay, setupAutoPlay_Recommend.name)
  }

  /** 设置稍后再看自动连播状态 */
  async function setupAutoPlay_WatchLater(enableAutoplay: boolean) {
    await setupAutoPlay_SwitchBtn(enableAutoplay, setupAutoPlay_WatchLater.name)
  }

  /** 设置分P视频自动连播状态 */
  async function setupAutoPlay_Playlist(enableAutoplay: boolean) {
    await setupAutoPlay_SwitchBtn(enableAutoplay, setupAutoPlay_Playlist.name)
  }

  // #endregion

  /** 设置自动连播状态 */
  async function setupAutoPlay(autoplayType: AutoplayType, enableAutoplay: boolean) {
    switch (autoplayType) {
      case AutoplayType.BANGUMI:
        await setupAutoPlay_Bangumi(enableAutoplay)
        break
      case AutoplayType.RECOMMEND:
        await setupAutoPlay_Recommend(enableAutoplay)
        break
      case AutoplayType.WATCHLATER:
        await setupAutoPlay_WatchLater(enableAutoplay)
        break
      case AutoplayType.PLAYLIST:
        await setupAutoPlay_Playlist(enableAutoplay)
        break
      default:
        break
    }
  }

  // #endregion

  /** 每次视频切换时的初始化逻辑 */
  async function initScript() {
    await playerReady()

    // 检测自动连播类型
    const autoPlayType = getAutoplayType()
    // 检测是否应该自动连播
    const enableAutoplay = shouldAutoplay(autoPlayType)
    logger.log(
      `导航变化（${document.URL}），重新初始化脚本\n自动连播类型：${AutoplayType[autoPlayType]}\n是否应该自动连播：${enableAutoplay}`,
    )
    // 设置自动连播状态
    await setupAutoPlay(autoPlayType, enableAutoplay)
  }

  // 入口代码

  const debounce = lodash.debounce(initScript, 1000)

  // 监听视频变化
  const rightPanel = await Promise.any([
    select('.right-container-inner'),
    select('.playlist-container--right'),
    select('.plp-r'),
  ])
  if (!rightPanel) {
    logger.warn('未找到 rightPanelContainer 或 playListContainer')
    return
  }
  childListSubtree(rightPanel, async () => {
    debounce()
  })

  // 监听选项变化
  Object.keys(settings.options).forEach(option => {
    addComponentListener(
      `${metadata.name}.${option}`,
      async () => {
        await initScript()
      },
      true,
    )
  })
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
    watchLaterAutoplayAction: {
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
