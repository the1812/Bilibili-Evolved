import { defineComponentMetadata } from '@/components/define'
import { ComponentEntry } from '@/components/types'
import { bangumiUrls, favoriteListUrls, videoUrls, watchlaterUrls } from '@/core/utils/urls'
import { useScopedConsole } from '@/core/utils/log'
import { select, sq } from '@/core/spin-query'
import { matchUrlPattern, playerReady } from '@/core/utils'
import { getVueData } from '@/components/feeds/api'
import { addComponentListener, ComponentSettings } from '@/core/settings'
import { childListSubtree } from '@/core/observer'

const logger = useScopedConsole('定制自动连播行为')

/** 自动连播行为类型 */
enum AutoplayActionType {
  /** 自动判断，参考《传统连播模式》组件 */
  AUTO = '自动',
  /** 禁用自动连播 */
  DISABLE = '禁用',
  /** 总是自动连播 */
  ALWAYS = '总是',
}

// #region 自动连播处理器

/** 自动连播处理器基类 */
abstract class BaseAutoplayHandler {
  // #region 初始化

  /** 脚本设置 */
  static settings: ComponentSettings

  /** 自动连播处理器实例列表 */
  protected static handlers: BaseAutoplayHandler[] = []

  /** 添加自动连播处理器实例到列表 */
  static register(handler: BaseAutoplayHandler) {
    BaseAutoplayHandler.handlers.push(handler)
  }

  /** 获取匹配当前页面的自动连播处理器实例 */
  static async getHandler(): Promise<BaseAutoplayHandler | null> {
    for (const handler of BaseAutoplayHandler.handlers) {
      if (await handler.match()) {
        return handler
      }
    }

    return null
  }

  // #endregion

  // #region 抽象

  /** 自动连播类型 */
  abstract type: string

  /** 处理器是否适用当前页面 */
  abstract match(): Promise<boolean>

  /** 是否应启用自动连播 */
  abstract shouldAutoplay(): Promise<boolean>

  /**
   * 设置自动连播状态
   * @param enable true：启用，false：禁用
   */
  abstract setupAutoPlay(enable: boolean): Promise<void>

  // #endregion

  // #region 工具方法

  /**
   * 默认连播方式判断，自动连播行为类型为AUTO时使用回调处理
   * @param actionType 自动连播行为类型
   * @param autoTypeHandler 自动连播行为类型为AUTO时的处理回调
   * @returns 是否应该自动连播
   */
  static shouldAutoplayWithAutoHandler(
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

  /**
   * 获取分P序号文本
   * @returns 例如：'1/10' 或 '（1/10）'
   */
  protected getSequentialNumberString(): string {
    return ''
  }

  /**
   * 解析分P序号
   * @returns 例如：[1,10]
   */
  protected parseSequentialNumbers(): number[] {
    return this.getSequentialNumberString()
      .replace(/[（）()]/g, '')
      .split('/')
      .map(it => parseInt(it))
  }

  /** 是否最后1P视频 */
  protected isLastSequentialNumber(): boolean {
    const sequentialNumbers = this.parseSequentialNumbers()
    if (!sequentialNumbers || sequentialNumbers.length < 2) {
      return true
    }
    return sequentialNumbers[0] >= sequentialNumbers[1]
  }

  /** 设置自动连播按钮状态（位于右上角） */
  protected async setupAutoPlay_SwitchBtn(enableAutoplay: boolean) {
    sq(() => {
      try {
        const app = document.getElementById('app')
        const vueInstance = getVueData(app)
        vueInstance.setContinuousPlay(enableAutoplay)
        return true
      } catch (e) {
        logger.debug(`${this.constructor.name}：设置自动连播按钮状态发生错误，错误信息：${e}`)
        return false
      }
    })
  }

  /** 设置番剧自动连播状态 */
  protected async setupAutoPlay_Player(enableAutoplay: boolean) {
    const selector = enableAutoplay
      ? '.bpx-player-ctrl-setting-handoff input[type="radio"][value="0"]'
      : '.bpx-player-ctrl-setting-handoff input[type="radio"][value="2"]'
    const radio = (await select(selector)) as HTMLInputElement

    if (radio === null) {
      logger.error(`${this.constructor.name}：未找到对应的播放方式按钮`)
    }
    radio.click()
  }

  // #endregion
}

// #region 子类实现

/** 自动连播处理器-番剧 */
class BangumiAutoplayHandler extends BaseAutoplayHandler {
  type = '番剧'

  async match() {
    return bangumiUrls.some(url => matchUrlPattern(url))
  }

  protected override isLastSequentialNumber(): boolean {
    // PV、小剧场没有分P序号，因此统一用元素位置判断
    const el = document
      .querySelector('.plp-r img[class^=PlayingIcon_playIcon]')
      .closest('div[class^=imageListItem_wrap]')
    return !el.nextElementSibling
  }

  async shouldAutoplay() {
    return BaseAutoplayHandler.shouldAutoplayWithAutoHandler(
      BaseAutoplayHandler.settings.options.bangumiAutoplayAction as AutoplayActionType,
      () => !this.isLastSequentialNumber(),
    )
  }

  async setupAutoPlay(enable: boolean) {
    await this.setupAutoPlay_Player(enable)
  }
}
BaseAutoplayHandler.register(new BangumiAutoplayHandler())

/** 自动连播处理器-推荐视频 */
class RecommendAutoplayHandler extends BaseAutoplayHandler {
  type = '推荐视频'

  async match() {
    const videoUrl = '//www.bilibili.com/video/'
    const btn = document.querySelector('.recommend-list-v1 .switch-btn')
    return matchUrlPattern(videoUrl) && btn !== null
  }

  async shouldAutoplay() {
    return BaseAutoplayHandler.shouldAutoplayWithAutoHandler(
      BaseAutoplayHandler.settings.options.recommendAutoplayAction as AutoplayActionType,
      () => false,
    )
  }

  async setupAutoPlay(enable: boolean) {
    await this.setupAutoPlay_SwitchBtn(enable)
  }
}
BaseAutoplayHandler.register(new RecommendAutoplayHandler())

/** 自动连播处理器-稍后再看 */
class WatchLaterAutoplayHandler extends BaseAutoplayHandler {
  type = '稍后再看'

  async match() {
    return watchlaterUrls.some(url => matchUrlPattern(url))
  }

  protected override getSequentialNumberString(): string {
    return document.querySelector('.list-count').innerHTML
  }

  async shouldAutoplay() {
    return BaseAutoplayHandler.shouldAutoplayWithAutoHandler(
      BaseAutoplayHandler.settings.options.watchLaterAutoplayAction as AutoplayActionType,
      () => !this.isLastSequentialNumber(),
    )
  }

  async setupAutoPlay(enable: boolean) {
    await this.setupAutoPlay_SwitchBtn(enable)
  }
}
BaseAutoplayHandler.register(new WatchLaterAutoplayHandler())

/** 自动连播处理器-分P视频 */
class PlaylistAutoplayHandler extends BaseAutoplayHandler {
  type = '分P视频'

  async match() {
    const videoUrl = '//www.bilibili.com/video/'
    const btn = document.querySelector('.video-pod .auto-play .switch-btn')
    return matchUrlPattern(videoUrl) && btn !== null
  }

  protected override getSequentialNumberString(): string {
    return document.querySelector('.video-pod__header .amt').innerHTML
  }

  async shouldAutoplay() {
    return BaseAutoplayHandler.shouldAutoplayWithAutoHandler(
      BaseAutoplayHandler.settings.options.playlistAutoplayAction as AutoplayActionType,
      () => !this.isLastSequentialNumber(),
    )
  }

  async setupAutoPlay(enable: boolean) {
    await this.setupAutoPlay_SwitchBtn(enable)
  }
}
BaseAutoplayHandler.register(new PlaylistAutoplayHandler())

/** 自动连播处理器-收藏夹 */
class FavoriteAutoplayHandler extends BaseAutoplayHandler {
  type = '收藏夹'

  async match() {
    return favoriteListUrls.some(url => matchUrlPattern(url))
  }

  protected override getSequentialNumberString(): string {
    return document.querySelector('.list-count').innerHTML
  }

  async shouldAutoplay() {
    return BaseAutoplayHandler.shouldAutoplayWithAutoHandler(
      BaseAutoplayHandler.settings.options.favoriteAutoplayAction as AutoplayActionType,
      () => !this.isLastSequentialNumber(),
    )
  }

  async setupAutoPlay(enable: boolean) {
    await this.setupAutoPlay_SwitchBtn(enable)
  }
}
BaseAutoplayHandler.register(new FavoriteAutoplayHandler())
// #endregion

// #endregion

const entry: ComponentEntry = async ({ metadata, settings }) => {
  /** 每次视频切换时的初始化逻辑 */
  async function initScript() {
    await playerReady()

    const handler = await BaseAutoplayHandler.getHandler()
    if (!handler) {
      logger.warn('未找到匹配的自动播放处理器')
      return
    }

    const enable = await handler.shouldAutoplay()
    logger.log(
      `导航变化（${document.URL}），重新初始化脚本\n自动连播类型：${handler.type}\n是否应该自动连播：${enable}`,
    )
    await handler.setupAutoPlay(enable)
  }

  // 入口代码

  BaseAutoplayHandler.settings = settings
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
  childListSubtree(rightPanel, () => {
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
      defaultValue: AutoplayActionType.ALWAYS,
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
    favoriteAutoplayAction: {
      displayName: '自动连播行为-收藏夹',
      defaultValue: AutoplayActionType.AUTO,
      dropdownEnum: AutoplayActionType,
    },
  },
})
