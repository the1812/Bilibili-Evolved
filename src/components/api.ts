import * as component from './component'
import * as userComponent from './user-component'
import * as styledComponent from './styled-component'
import * as description from './description'
import * as feedsApis from './feeds/api'
import BangumiCard from './feeds/BangumiCard.vue'
import VideoCard from './feeds/VideoCard.vue'
import ColumnCard from './feeds/ColumnCard.vue'
import * as disableProfilePopup from './feeds/disable-profile-popup'
import * as notify from './feeds/notify'
import * as assUtils from './video/ass-utils'
import * as playerLight from './video/player-light'
import * as videoDanmaku from './video/video-danmaku'
import * as videoInfo from './video/video-info'
import * as videoQuality from './video/video-quality'
import * as videoContextMenu from './video/video-context-menu'
import * as videoControlBar from './video/video-control-bar'
import * as liveControlBar from './live/live-control-bar'
import * as liveSocket from './live/live-socket'
import * as commentApis from './utils/comment-apis'
import * as categoriesUpdater from './utils/categories/updater'
import * as categoriesData from './utils/categories/data'
import MachineTranslator from './i18n/machine-translator/MachineTranslator.vue'
import * as switchOptions from './switch-options'
import LaunchBar from './launch-bar/LaunchBar.vue'

export const componentApis = {
  component,
  userComponent,
  styledComponent,
  description,
  switchOptions,
  launchBar: {
    LaunchBar,
  },
  feeds: {
    api: feedsApis,
    BangumiCard,
    VideoCard,
    ColumnCard,
    disableProfilePopup,
    notify,
  },
  video: {
    assUtils,
    playerLight,
    videoDanmaku,
    videoInfo,
    videoQuality,
    videoContextMenu,
    videoControlBar,
  },
  live: {
    liveControlBar,
    liveSocket,
  },
  utils: {
    commentApis,
    categories: {
      updater: categoriesUpdater,
      data: categoriesData,
    },
  },
  // lodash.camelCase('i18n') === 'i18N'
  i18N: {
    machineTranslator: {
      MachineTranslator,
    },
  },
}
export type ComponentApis = typeof componentApis
