import { defineComponentMetadata } from '@/components/define'
import { ComponentEntry } from '@/components/types'
import { bangumiUrls, videoUrls } from '@/core/utils/urls'
import { useScopedConsole } from '@/core/utils/log'
import { select } from '@/core/spin-query'
import { playerReady } from '@/core/utils'
import { addComponentListener } from '@/core/settings'
import { childListSubtree } from '@/core/observer'
import { BaseAutoplayHandler } from './handlers/BaseAutoplayHandler'
import { AutoplayActionType } from './AutoplayActionType'
import { BangumiAutoplayHandler } from './handlers/BangumiAutoplayHandler'
import { FavoriteAutoplayHandler } from './handlers/FavoriteAutoplayHandler'
import { PlaylistAutoplayHandler } from './handlers/PlaylistAutoplayHandler'
import { RecommendAutoplayHandler } from './handlers/RecommendAutoplayHandler'
import { WatchLaterAutoplayHandler } from './handlers/WatchLaterAutoplayHandler'
import { MultipartAutoplayHandler } from './handlers/MultipartAutoplayHandler'
import { RecommendListAutoplayHandler } from './handlers/RecommendListAutoplayHandler'

export const logger = useScopedConsole('定制自动连播行为')

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

  /** 注册自动播放处理器 */
  function registerHandlers() {
    BaseAutoplayHandler.register(new BangumiAutoplayHandler())
    BaseAutoplayHandler.register(new FavoriteAutoplayHandler())
    BaseAutoplayHandler.register(new MultipartAutoplayHandler())
    BaseAutoplayHandler.register(new PlaylistAutoplayHandler())
    BaseAutoplayHandler.register(new RecommendAutoplayHandler())
    BaseAutoplayHandler.register(new WatchLaterAutoplayHandler())
    BaseAutoplayHandler.register(new RecommendListAutoplayHandler())
  }

  // 入口代码

  registerHandlers()
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
      displayName: '自动连播行为-推荐视频（接下来播放）',
      defaultValue: AutoplayActionType.AUTO,
      dropdownEnum: AutoplayActionType,
    },
    recommendListAutoplayAction: {
      displayName: '自动连播行为-推荐视频（列表第一个）',
      defaultValue: AutoplayActionType.AUTO,
      dropdownEnum: AutoplayActionType,
    },
    watchLaterAutoplayAction: {
      displayName: '自动连播行为-稍后再看',
      defaultValue: AutoplayActionType.AUTO,
      dropdownEnum: AutoplayActionType,
    },
    multipartAutoplayAction: {
      displayName: '自动连播行为-分p视频',
      defaultValue: AutoplayActionType.AUTO,
      dropdownEnum: AutoplayActionType,
    },
    playlistAutoplayAction: {
      displayName: '自动连播行为-视频合集',
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
